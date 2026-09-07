#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, resolve, sep } from 'node:path';
import { SITE_CSP } from './site-policy.mjs';

const projectRoot = resolve(import.meta.dirname, '..');
const distRoot = join(projectRoot, 'dist');
const chromePath =
  process.env.SHIFTORA_CHROME_PATH ??
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const requireApprovedTypography = process.env.SHIFTORA_REQUIRE_APPROVED_TYPOGRAPHY === '1';
const requiredFonts = [];
const fontRolesByRoute = {
  '/': [
    { selector: '.estate-wordmark', family: 'Helvetica Neue', weight: 700 },
    { selector: '.opening-mandate__title', family: 'Helvetica Neue', weight: 500 },
    { selector: '.passage-static > article > p:first-child', family: 'Helvetica Neue', weight: 400 },
    { selector: '.estate-label', family: 'Helvetica Neue', weight: 500 },
  ],
  '/engagements': [
    { selector: '.brand-wordmark', family: 'Helvetica Neue', weight: 700 },
    { selector: '.mandates-hero h1', family: 'Helvetica Neue', weight: 500 },
    { selector: '.mandate-item h3', family: 'Helvetica Neue', weight: 400 },
    { selector: '.mandates-close p', family: 'Helvetica Neue', weight: 400 },
    { selector: '.mandate-item p', family: 'Helvetica Neue', weight: 400 },
    { selector: '.page-kicker', family: 'Helvetica Neue', weight: 500 },
  ],
  '/careers': [
    { selector: '.brand-wordmark', family: 'Helvetica Neue', weight: 700 },
    { selector: '.careers-page h1', family: 'Helvetica Neue', weight: 500 },
    { selector: '.careers-page__body', family: 'Helvetica Neue', weight: 400 },
    { selector: '.page-kicker', family: 'Helvetica Neue', weight: 500 },
  ],
  '/404': [
    { selector: '.brand-wordmark', family: 'Helvetica Neue', weight: 700 },
    { selector: '.not-found-page__main h1', family: 'Helvetica Neue', weight: 500 },
    { selector: '.page-kicker', family: 'Helvetica Neue', weight: 500 },
  ],
};

await access(join(distRoot, 'index.html'));
await access(chromePath);

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.woff2', 'font/woff2'],
  ['.xml', 'application/xml; charset=utf-8'],
]);

const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://local').pathname);
    const routePath = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
    const firstCandidate = resolve(distRoot, `.${routePath}`);
    const candidates = extname(firstCandidate)
      ? [firstCandidate]
      : [`${firstCandidate}.html`, join(firstCandidate, 'index.html')];

    for (const candidate of candidates) {
      if (!candidate.startsWith(`${distRoot}${sep}`) && candidate !== distRoot) continue;

      try {
        const body = await readFile(candidate);
        response.writeHead(200, {
          'content-type': mimeTypes.get(extname(candidate)) ?? 'application/octet-stream',
          'cache-control': 'no-store',
          'content-security-policy': SITE_CSP,
          'x-frame-options': 'DENY',
        });
        response.end(body);
        return;
      } catch (error) {
        if (error?.code !== 'ENOENT') throw error;
      }
    }

    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  } catch (error) {
    response.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' });
    response.end(String(error));
  }
});

await new Promise((resolveListen, rejectListen) => {
  server.once('error', rejectListen);
  server.listen(0, '127.0.0.1', resolveListen);
});

const address = server.address();
if (!address || typeof address === 'string') throw new Error('Could not determine local preview port.');

const baseUrl = `http://127.0.0.1:${address.port}`;
const profilePath = await mkdtemp(join(tmpdir(), 'shiftora-chrome-'));
const outputPath = await mkdtemp(join(tmpdir(), 'shiftora-visual-check-'));
const chrome = spawn(
  chromePath,
  [
    '--headless=new',
    '--disable-background-networking',
    '--disable-breakpad',
    '--disable-component-update',
    '--disable-default-apps',
    '--disable-gpu',
    '--hide-scrollbars',
    '--no-first-run',
    '--remote-debugging-port=0',
    `--user-data-dir=${profilePath}`,
    'about:blank',
  ],
  { stdio: ['ignore', 'ignore', 'pipe'] },
);

let chromeError = '';
chrome.stderr.setEncoding('utf8');

const browserWebSocketUrl = await new Promise((resolveSocket, rejectSocket) => {
  const timeout = setTimeout(() => {
    rejectSocket(new Error(`Chrome did not expose a debugging endpoint. ${chromeError}`));
  }, 15_000);

  chrome.once('error', (error) => {
    clearTimeout(timeout);
    rejectSocket(error);
  });

  chrome.stderr.on('data', (chunk) => {
    chromeError += chunk;
    const match = chromeError.match(/DevTools listening on (ws:\/\/[^\s]+)/);
    if (!match) return;
    clearTimeout(timeout);
    resolveSocket(match[1]);
  });
});

const socket = new WebSocket(browserWebSocketUrl);
await new Promise((resolveOpen, rejectOpen) => {
  socket.addEventListener('open', resolveOpen, { once: true });
  socket.addEventListener('error', rejectOpen, { once: true });
});

let nextId = 0;
const pending = new Map();
const eventWaiters = [];
const runtimeFailures = new Set();
let currentCase = 'browser startup';

socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);
  if (message.id) {
    const waiter = pending.get(message.id);
    if (!waiter) return;
    pending.delete(message.id);
    if (message.error) waiter.reject(new Error(message.error.message));
    else waiter.resolve(message.result);
    return;
  }

  if (message.method === 'Runtime.exceptionThrown') {
    const details = message.params?.exceptionDetails;
    const description = details?.exception?.description ?? details?.text ?? 'Unhandled runtime exception';
    runtimeFailures.add(`${currentCase}: ${description}`);
  }

  if (message.method === 'Runtime.consoleAPICalled' && message.params?.type === 'error') {
    const description = (message.params.args ?? [])
      .map((argument) => argument.value ?? argument.description ?? argument.type)
      .join(' ');
    runtimeFailures.add(`${currentCase}: console.error ${description}`);
  }

  if (message.method === 'Log.entryAdded' && message.params?.entry?.level === 'error') {
    const entry = message.params.entry;
    runtimeFailures.add(`${currentCase}: browser error ${entry.text ?? 'unknown error'}`);
  }

  for (let index = eventWaiters.length - 1; index >= 0; index -= 1) {
    const waiter = eventWaiters[index];
    if (waiter.method !== message.method || waiter.sessionId !== message.sessionId) continue;
    eventWaiters.splice(index, 1);
    clearTimeout(waiter.timeout);
    waiter.resolve(message.params);
  }
});

const send = (method, params = {}, sessionId) =>
  new Promise((resolveCommand, rejectCommand) => {
    const id = ++nextId;
    pending.set(id, { resolve: resolveCommand, reject: rejectCommand });
    socket.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });

const waitForEvent = (method, sessionId, timeoutMs = 12_000) =>
  new Promise((resolveEvent, rejectEvent) => {
    const waiter = {
      method,
      sessionId,
      resolve: resolveEvent,
      timeout: setTimeout(() => {
        const index = eventWaiters.indexOf(waiter);
        if (index >= 0) eventWaiters.splice(index, 1);
        rejectEvent(new Error(`Timed out waiting for ${method}.`));
      }, timeoutMs),
    };
    eventWaiters.push(waiter);
  });

const failures = [];
const measuredCases = new Map();

try {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Page.enable', {}, sessionId);
  await send('Runtime.enable', {}, sessionId);
  await send('Log.enable', {}, sessionId);
  await send(
    'Emulation.setEmulatedMedia',
    { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] },
    sessionId,
  );

  const cases = [
    { route: '/', width: 320, height: 844, screenshot: 'home-320.png' },
    { route: '/engagements', width: 320, height: 844, screenshot: 'engagements-320.png' },
    { route: '/careers', width: 320, height: 844, screenshot: 'careers-320.png' },
    { route: '/404', width: 390, height: 844, expectNoIndex: true, screenshot: '404-390.png' },
    { route: '/', width: 390, height: 844, screenshot: 'home-390.png' },
    { route: '/engagements', width: 390, height: 844, screenshot: 'engagements-390.png' },
    { route: '/careers', width: 390, height: 844, screenshot: 'careers-390.png' },
    { route: '/', width: 600, height: 900, screenshot: 'home-600.png' },
    { route: '/engagements', width: 600, height: 900, screenshot: 'engagements-600.png' },
    { route: '/careers', width: 600, height: 900, screenshot: 'careers-600.png' },
    { route: '/', width: 601, height: 900 },
    { route: '/engagements', width: 601, height: 900 },
    { route: '/careers', width: 601, height: 900 },
    { route: '/', width: 665, height: 767, screenshot: 'home-reference-665x767.png' },
    { route: '/careers', width: 665, height: 767, screenshot: 'careers-665x767.png' },
    { route: '/', width: 768, height: 1024, screenshot: 'home-768.png' },
    { route: '/engagements', width: 768, height: 1024, screenshot: 'engagements-768.png' },
    { route: '/careers', width: 768, height: 1024, screenshot: 'careers-768.png' },
    { route: '/careers', width: 900, height: 1000 },
    { route: '/careers', width: 901, height: 1000 },
    { route: '/', width: 1100, height: 1000, screenshot: 'home-1100.png' },
    { route: '/engagements', width: 1100, height: 1000, screenshot: 'engagements-1100.png' },
    { route: '/careers', width: 1100, height: 1000 },
    { route: '/', width: 1101, height: 1000 },
    { route: '/engagements', width: 1101, height: 1000 },
    { route: '/', width: 1279, height: 1000 },
    { route: '/engagements', width: 1279, height: 1000 },
    { route: '/', width: 1280, height: 1000, screenshot: 'home-1280.png' },
    { route: '/engagements', width: 1280, height: 1000, screenshot: 'engagements-1280.png' },
    { route: '/careers', width: 1280, height: 1000, screenshot: 'careers-1280.png' },
    { route: '/', width: 1304, height: 768, screenshot: 'home-1304x768.png' },
    { route: '/engagements', width: 1304, height: 768, screenshot: 'engagements-1304x768.png' },
    { route: '/', width: 1439, height: 1000 },
    { route: '/engagements', width: 1439, height: 1000 },
    { route: '/', width: 1440, height: 1000, screenshot: 'home-1440.png' },
    { route: '/engagements', width: 1440, height: 1000, screenshot: 'engagements-1440.png' },
    { route: '/careers', width: 1440, height: 1000, screenshot: 'careers-1440.png' },
    { route: '/404', width: 1440, height: 1000, expectNoIndex: true, screenshot: '404-1440.png' },
    { route: '/', width: 1920, height: 1080, screenshot: 'home-1920.png' },
    { route: '/engagements', width: 1920, height: 1080, screenshot: 'engagements-1920.png' },
    { route: '/careers', width: 1920, height: 1080, screenshot: 'careers-1920.png' },
    { route: '/', width: 2560, height: 1440, screenshot: 'home-2560.png' },
    { route: '/engagements', width: 2560, height: 1440, screenshot: 'engagements-2560.png' },
    { route: '/careers', width: 2560, height: 1440, screenshot: 'careers-2560.png' },
  ];

  for (const testCase of cases) {
    currentCase = `${testCase.route} at ${testCase.width}px`;
    await send(
      'Emulation.setDeviceMetricsOverride',
      {
        width: testCase.width,
        height: testCase.height,
        deviceScaleFactor: Number(process.env.SHIFTORA_DEVICE_SCALE_FACTOR ?? 1),
        mobile: testCase.width < 768,
        screenWidth: testCase.width,
        screenHeight: testCase.height,
      },
      sessionId,
    );

    const loaded = waitForEvent('Page.loadEventFired', sessionId);
    await send('Page.navigate', { url: `${baseUrl}${testCase.route}` }, sessionId);
    await loaded;
    await send(
      'Runtime.evaluate',
      {
        expression: `Promise.allSettled(${JSON.stringify(requiredFonts)}.map(({ family, weight }) => document.fonts.load(\`${'${weight}'} 16px "${'${family}'}"\`))).then(() => document.fonts.ready)`,
        awaitPromise: true,
        returnByValue: true,
      },
      sessionId,
    );

    const { result } = await send(
      'Runtime.evaluate',
      {
        expression: `(() => {
          const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')]
            .map((heading) => Number(heading.tagName.slice(1)));
          const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
          const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
          const unlabeledLinks = [...document.querySelectorAll('a')].filter((link) =>
            !(link.textContent?.trim() || link.getAttribute('aria-label'))
          ).length;
          const undersizedLinks = [...document.querySelectorAll('a:not(.skip-link)')].filter((link) => {
            const rect = link.getBoundingClientRect();
            const style = getComputedStyle(link);
            const visible = style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
            return visible && (rect.width < 44 || rect.height < 44);
          }).map((link) => link.textContent?.trim() || link.getAttribute('aria-label') || 'unlabeled');
          const headingSkip = headings.some((level, index) => index > 0 && level > headings[index - 1] + 1);
          const skipLink = document.querySelector('.skip-link, .estate-skip, .record-detail__skip');
          const normalizedFamily = (value) => value.replace(/^['"]|['"]$/g, '');
          const faceCoversWeight = (face, weight) => {
            const bounds = String(face.weight).match(/\d+/g)?.map(Number) ?? [];
            if (bounds.length === 0) return false;
            return bounds.length === 1
              ? bounds[0] === weight
              : bounds[0] <= weight && bounds[bounds.length - 1] >= weight;
          };
          const requiredFonts = ${JSON.stringify(requiredFonts)};
          const loadedFontFailures = requiredFonts.filter(({ family, weight }) => {
            const matchingFaces = [...document.fonts].filter((face) =>
              normalizedFamily(face.family) === family && faceCoversWeight(face, weight)
            );
            return !document.fonts.check(\`${'${weight}'} 16px "${'${family}'}"\`) ||
              !matchingFaces.some((face) => face.status === 'loaded');
          }).map(({ family, weight }) => \`${'${family}'} ${'${weight}'}\`);
          const fontRoles = ${JSON.stringify(fontRolesByRoute[testCase.route] ?? [])};
          const fontRoleFailures = fontRoles.flatMap(({ selector, family, weight }) => {
            const element = document.querySelector(selector);
            if (!element) return [\`${'${selector}'} is missing\`];
            const style = getComputedStyle(element);
            const computedFamily = normalizedFamily(style.fontFamily.split(',')[0].trim());
            const computedWeight = Number(style.fontWeight);
            return computedFamily === family && computedWeight === weight
              ? []
              : [\`${'${selector}'} uses ${'${computedFamily}'} ${'${computedWeight}'}; expected ${'${family}'} ${'${weight}'}\`];
          });
          const firstMandateTitle = document.querySelector('.mandate-item h3');
          const firstMandateRect = firstMandateTitle?.getBoundingClientRect();
          const descriptionCopy = document.querySelector('.description-copy');
          const descriptionRect = descriptionCopy?.getBoundingClientRect();
          const descriptionStyle = descriptionCopy ? getComputedStyle(descriptionCopy) : null;
          const descriptionMain = document.querySelector('.description-page__main');
          const descriptionMainStyle = descriptionMain ? getComputedStyle(descriptionMain) : null;
          const descriptionHeader = document.querySelector('.description-page .brand-header');
          const descriptionHeaderStyle = descriptionHeader ? getComputedStyle(descriptionHeader) : null;
          const descriptionWordmark = document.querySelector('.description-page .brand-wordmark');
          const descriptionWordmarkStyle = descriptionWordmark ? getComputedStyle(descriptionWordmark) : null;
          const mandatesHero = document.querySelector('.mandates-hero');
          const mandatesHeroHeading = document.querySelector('.mandates-hero h1');
          const mandatesHeroStyle = mandatesHero ? getComputedStyle(mandatesHero) : null;
          const mandatesHeroWidth = mandatesHero
            ? mandatesHero.clientWidth - Number.parseFloat(mandatesHeroStyle.paddingLeft) - Number.parseFloat(mandatesHeroStyle.paddingRight)
            : 0;
          const mandatesHeroRange = document.createRange();
          if (mandatesHeroHeading) mandatesHeroRange.selectNodeContents(mandatesHeroHeading);
          const mandatesHeroHeadroom = mandatesHeroHeading
            ? mandatesHeroWidth - mandatesHeroRange.getBoundingClientRect().width
            : 0;
          const arrowAlignmentOffsets = [...document.querySelectorAll('.brand-header__next .directional-arrow, .brand-footer .directional-arrow, .estate-header nav .directional-arrow, .estate-footer .directional-arrow, .mandates-close .directional-arrow, .not-found-page__main .directional-arrow')].map((arrow) => {
            const link = arrow.closest('a');
            if (!link) return Number.POSITIVE_INFINITY;
            const arrowRect = arrow.getBoundingClientRect();
            const linkRect = link.getBoundingClientRect();
            return (arrowRect.top + arrowRect.height / 2) - (linkRect.top + linkRect.height / 2);
          });
          const visibleFooterLinks = [...document.querySelectorAll('.brand-footer a')].filter((link) => {
            const rect = link.getBoundingClientRect();
            const style = getComputedStyle(link);
            return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
          });
          const careersTitleRect = document.querySelector('.careers-page h1')?.getBoundingClientRect();
          const careersBodyRect = document.querySelector('.careers-page__body')?.getBoundingClientRect();
          const careersTitleBodyOverlap = Boolean(
            careersTitleRect &&
            careersBodyRect &&
            careersTitleRect.left < careersBodyRect.right - 1 &&
            careersTitleRect.right > careersBodyRect.left + 1 &&
            careersTitleRect.top < careersBodyRect.bottom - 1 &&
            careersTitleRect.bottom > careersBodyRect.top + 1
          );

          return JSON.stringify({
            title: document.title,
            description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
            canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '',
            robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? '',
            viewportMeta: Boolean(document.querySelector('meta[name="viewport"]')),
            language: document.documentElement.lang,
            h1Count: document.querySelectorAll('h1').length,
            mainCount: document.querySelectorAll('main').length,
            headingSkip,
            duplicateIdCount: new Set(duplicateIds).size,
            unlabeledLinks,
            undersizedLinks,
            skipTarget: skipLink?.getAttribute('href') ?? '',
            mainTargetExists: Boolean(skipLink?.getAttribute('href') && document.querySelector(skipLink.getAttribute('href'))),
            innerWidth: window.innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            bodyScrollWidth: document.body.scrollWidth,
            loadedFontFailures,
            fontRoleFailures,
            fontSetStatus: document.fonts.status,
            descriptionFontSize: Number.parseFloat(getComputedStyle(document.querySelector('.description-copy') ?? document.body).fontSize),
            descriptionLineHeight: Number.parseFloat(descriptionStyle?.lineHeight ?? '0'),
            descriptionWidth: descriptionRect?.width ?? 0,
            descriptionMainGap: Number.parseFloat(descriptionMainStyle?.rowGap ?? '0'),
            descriptionMainPaddingTop: Number.parseFloat(descriptionMainStyle?.paddingTop ?? '0'),
            descriptionMainPaddingBottom: Number.parseFloat(descriptionMainStyle?.paddingBottom ?? '0'),
            descriptionGutter: Number.parseFloat(descriptionHeaderStyle?.paddingLeft ?? '0'),
            descriptionHeaderHeight: descriptionHeader?.getBoundingClientRect().height ?? 0,
            descriptionWordmarkFontSize: Number.parseFloat(descriptionWordmarkStyle?.fontSize ?? '0'),
            mandatesHeroFontSize: Number.parseFloat(getComputedStyle(document.querySelector('.mandates-hero h1') ?? document.body).fontSize),
            mandateTitleFontSize: Number.parseFloat(getComputedStyle(firstMandateTitle ?? document.body).fontSize),
            firstMandateTitleWidth: firstMandateRect?.width ?? 0,
            firstMandateTitleHeight: firstMandateRect?.height ?? 0,
            mandatesHeroHeadroom,
            arrowAlignmentOffsets,
            visibleFooterLinkCount: visibleFooterLinks.length,
            careersTitleBodyOverlap,
          });
        })()`,
        returnByValue: true,
      },
      sessionId,
    );

    const metrics = JSON.parse(result.value);
    measuredCases.set(`${testCase.route}:${testCase.width}`, metrics);
    const overflow = Math.max(metrics.scrollWidth, metrics.bodyScrollWidth) > metrics.innerWidth + 1;
    const validStructure = metrics.h1Count === 1 && metrics.mainCount === 1;
    const validMetadata = Boolean(
      metrics.title &&
      metrics.description &&
      metrics.canonical &&
      metrics.viewportMeta &&
      metrics.language.toLowerCase().startsWith('en')
    );
    const validIndexing = !testCase.expectNoIndex || metrics.robots === 'noindex, follow';
    const validNavigation = Boolean(
      metrics.skipTarget.startsWith('#') &&
      metrics.mainTargetExists &&
      metrics.unlabeledLinks === 0 &&
      (testCase.width >= 768 || metrics.undersizedLinks.length === 0)
    );
    const validDocument = !metrics.headingSkip && metrics.duplicateIdCount === 0;
    const validFonts = !requireApprovedTypography || metrics.fontRoleFailures.length === 0;
    const validArrowAlignment = metrics.arrowAlignmentOffsets.length > 0 &&
      metrics.arrowAlignmentOffsets.every((offset) => Math.abs(offset) <= 1);
    const label = `${testCase.route} at ${testCase.width}px`;
    console.log(
      `${overflow || !validStructure || !validMetadata || !validIndexing || !validNavigation || !validDocument || !validFonts || !validArrowAlignment ? 'FAIL' : 'PASS'} ${label}: viewport ${metrics.innerWidth}px; document ${Math.max(metrics.scrollWidth, metrics.bodyScrollWidth)}px; h1 ${metrics.h1Count}; main ${metrics.mainCount}.`,
    );

    if (overflow) failures.push(`${label} overflows horizontally.`);
    if (!validStructure) failures.push(`${label} has invalid heading or main structure.`);
    if (!validMetadata) failures.push(`${label} is missing required title, description, canonical, viewport, or language metadata.`);
    if (!validIndexing) failures.push(`${label} is missing the required noindex directive.`);
    if (!validNavigation) {
      const targetDetail = metrics.undersizedLinks.length > 0
        ? ` Undersized links: ${metrics.undersizedLinks.join(', ')}.`
        : '';
      failures.push(`${label} has an invalid skip target, unlabeled link, or sub-44px mobile target.${targetDetail}`);
    }
    if (!validDocument) failures.push(`${label} has a skipped heading level or duplicate id.`);
    if (!validArrowAlignment) {
      failures.push(`${label} has a directional arrow outside the navigation baseline (${metrics.arrowAlignmentOffsets.join(', ')}px).`);
    }
    if (testCase.route === '/engagements' && testCase.width === 320 && metrics.mandatesHeroHeadroom < 16) {
      failures.push(`${label} leaves only ${metrics.mandatesHeroHeadroom.toFixed(2)}px of heading headroom.`);
    }
    if (testCase.route === '/engagements' && testCase.width <= 600 && metrics.visibleFooterLinkCount !== 2) {
      failures.push(`${label} exposes ${metrics.visibleFooterLinkCount} footer actions; expected 2.`);
    }
    if (testCase.route === '/careers' && metrics.careersTitleBodyOverlap) {
      failures.push(`${label} allows the Careers title to overlap the application content.`);
    }
    if (!validFonts) {
      const fontDetail = metrics.loadedFontFailures.length > 0
        ? `missing faces: ${metrics.loadedFontFailures.join(', ')}`
        : `font set: ${metrics.fontSetStatus}`;
      const roleDetail = metrics.fontRoleFailures.length > 0
        ? `; invalid roles: ${metrics.fontRoleFailures.join('; ')}`
        : '';
      failures.push(`${label} failed required typography verification (${fontDetail}${roleDetail}).`);
    }

    if (testCase.screenshot) {
      const { cssContentSize } = await send('Page.getLayoutMetrics', {}, sessionId);
      const screenshotHeight = Math.min(Math.ceil(cssContentSize.height), 14_000);
      const { data } = await send(
        'Page.captureScreenshot',
        {
          format: 'png',
          fromSurface: true,
          captureBeyondViewport: true,
          clip: { x: 0, y: 0, width: testCase.width, height: screenshotHeight, scale: 1 },
        },
        sessionId,
      );
      await writeFile(join(outputPath, testCase.screenshot), Buffer.from(data, 'base64'));
    }
  }

  const assertMonotonic = (route, beforeWidth, afterWidth, metrics) => {
    const before = measuredCases.get(`${route}:${beforeWidth}`);
    const after = measuredCases.get(`${route}:${afterWidth}`);
    if (!before || !after) return;
    for (const metric of metrics) {
      if (after[metric] + 0.1 < before[metric]) {
        failures.push(
          `${route} ${metric} decreases across ${beforeWidth}/${afterWidth}px (${before[metric]}px to ${after[metric]}px).`,
        );
      }
    }
  };

  assertMonotonic('/', 600, 601, ['descriptionFontSize']);
  assertMonotonic('/engagements', 600, 601, ['mandatesHeroFontSize', 'mandateTitleFontSize']);
  assertMonotonic('/engagements', 1100, 1101, ['mandatesHeroFontSize', 'mandateTitleFontSize']);
  assertMonotonic('/engagements', 1279, 1280, ['mandatesHeroFontSize', 'mandateTitleFontSize']);
  assertMonotonic('/engagements', 1439, 1440, ['mandatesHeroFontSize', 'mandateTitleFontSize']);

  const lockedFirmMetrics = [
    'descriptionFontSize',
    'descriptionLineHeight',
    'descriptionWidth',
    'descriptionMainGap',
    'descriptionMainPaddingTop',
    'descriptionMainPaddingBottom',
    'descriptionGutter',
    'descriptionHeaderHeight',
    'descriptionWordmarkFontSize',
  ];
  const firmMaster = measuredCases.get('/:665');
  for (const width of [768, 1100, 1280, 1304, 1440, 1920, 2560]) {
    const candidate = measuredCases.get(`/:${width}`);
    if (!firmMaster || !candidate) continue;
    for (const metric of lockedFirmMetrics) {
      if (Math.abs(candidate[metric] - firmMaster[metric]) > 0.25) {
        failures.push(
          `/ ${metric} drifts between the 665px master and ${width}px (${firmMaster[metric]}px to ${candidate[metric]}px).`,
        );
      }
    }
  }

  const beforeDesktop = measuredCases.get('/engagements:1439');
  const afterDesktop = measuredCases.get('/engagements:1440');
  if (beforeDesktop && afterDesktop) {
    const widthRatio = afterDesktop.firstMandateTitleWidth / beforeDesktop.firstMandateTitleWidth;
    const heightRatio = afterDesktop.firstMandateTitleHeight / beforeDesktop.firstMandateTitleHeight;
    console.log(
      `Desktop transition 1439/1440px: first title width ${beforeDesktop.firstMandateTitleWidth.toFixed(2)}px → ${afterDesktop.firstMandateTitleWidth.toFixed(2)}px; height ${beforeDesktop.firstMandateTitleHeight.toFixed(2)}px → ${afterDesktop.firstMandateTitleHeight.toFixed(2)}px.`,
    );
    if (widthRatio < 0.7 || heightRatio > 1.5) {
      failures.push(
        `/engagements has an unstable 1439/1440px desktop transition (width ratio ${widthRatio.toFixed(2)}, height ratio ${heightRatio.toFixed(2)}).`,
      );
    }
  }

  failures.push(...runtimeFailures);

  console.log(`Screenshots: ${outputPath}`);

  if (failures.length > 0) {
    for (const failure of failures) console.error(failure);
    process.exitCode = 1;
  }
} finally {
  socket.close();
  chrome.kill('SIGTERM');
  await new Promise((resolveClose) => server.close(resolveClose));
  await rm(profilePath, { recursive: true, force: true });
}
