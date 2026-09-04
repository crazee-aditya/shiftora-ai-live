#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { extname, join, resolve, sep } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const distRoot = join(projectRoot, 'dist');
const chromePath =
  process.env.SHIFTORA_CHROME_PATH ??
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

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

try {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Page.enable', {}, sessionId);
  await send('Runtime.enable', {}, sessionId);
  await send(
    'Emulation.setEmulatedMedia',
    { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] },
    sessionId,
  );

  const cases = [
    { route: '/', width: 320, height: 844 },
    { route: '/mandates', width: 320, height: 844 },
    { route: '/404', width: 390, height: 844, expectNoIndex: true, screenshot: '404-390.png' },
    { route: '/', width: 390, height: 844, screenshot: 'home-390.png' },
    { route: '/mandates', width: 390, height: 844, screenshot: 'mandates-390.png' },
    { route: '/', width: 600, height: 900 },
    { route: '/mandates', width: 600, height: 900 },
    { route: '/', width: 601, height: 900 },
    { route: '/mandates', width: 601, height: 900 },
    { route: '/', width: 768, height: 1024 },
    { route: '/mandates', width: 768, height: 1024 },
    { route: '/', width: 1100, height: 1000 },
    { route: '/mandates', width: 1100, height: 1000 },
    { route: '/', width: 1101, height: 1000 },
    { route: '/mandates', width: 1101, height: 1000 },
    { route: '/', width: 1440, height: 1000, screenshot: 'home-1440.png' },
    { route: '/mandates', width: 1440, height: 1000, screenshot: 'mandates-1440.png' },
    { route: '/404', width: 1440, height: 1000, expectNoIndex: true, screenshot: '404-1440.png' },
  ];

  for (const testCase of cases) {
    currentCase = `${testCase.route} at ${testCase.width}px`;
    await send(
      'Emulation.setDeviceMetricsOverride',
      {
        width: testCase.width,
        height: testCase.height,
        deviceScaleFactor: 1,
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
      { expression: 'document.fonts.ready', awaitPromise: true, returnByValue: true },
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
          const headingSkip = headings.some((level, index) => index > 0 && level > headings[index - 1] + 1);
          const skipLink = document.querySelector('.skip-link');

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
            skipTarget: skipLink?.getAttribute('href') ?? '',
            mainTargetExists: Boolean(document.querySelector('main#main-content')),
            innerWidth: window.innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            bodyScrollWidth: document.body.scrollWidth
          });
        })()`,
        returnByValue: true,
      },
      sessionId,
    );

    const metrics = JSON.parse(result.value);
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
      metrics.skipTarget === '#main-content' &&
      metrics.mainTargetExists &&
      metrics.unlabeledLinks === 0
    );
    const validDocument = !metrics.headingSkip && metrics.duplicateIdCount === 0;
    const label = `${testCase.route} at ${testCase.width}px`;
    console.log(
      `${overflow || !validStructure || !validMetadata || !validIndexing || !validNavigation || !validDocument ? 'FAIL' : 'PASS'} ${label}: viewport ${metrics.innerWidth}px; document ${Math.max(metrics.scrollWidth, metrics.bodyScrollWidth)}px; h1 ${metrics.h1Count}; main ${metrics.mainCount}.`,
    );

    if (overflow) failures.push(`${label} overflows horizontally.`);
    if (!validStructure) failures.push(`${label} has invalid heading or main structure.`);
    if (!validMetadata) failures.push(`${label} is missing required title, description, canonical, viewport, or language metadata.`);
    if (!validIndexing) failures.push(`${label} is missing the required noindex directive.`);
    if (!validNavigation) failures.push(`${label} has an invalid skip target or an unlabeled link.`);
    if (!validDocument) failures.push(`${label} has a skipped heading level or duplicate id.`);

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
