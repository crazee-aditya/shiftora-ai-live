import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';
import { pipeline } from 'node:stream';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const PORT = Number(process.env.PORT || 8012);
const UPSTREAM_HOST = 'www.varickagents.com';
const LOCAL_ORIGIN = `http://localhost:${PORT}`;
const TOOL_DIR = path.dirname(fileURLToPath(import.meta.url));
const EDITOR_SCRIPT = path.join(TOOL_DIR, 'text-editor-overlay.js');
const IMAGE_REPLACER_SCRIPT = path.join(TOOL_DIR, 'image-replacer-overlay.js');
const SCRIBBLE_MODE_SCRIPT = path.join(TOOL_DIR, 'scribble-mode.js');
const PAGE_SNAPSHOT_REPLAY_SCRIPT = path.join(TOOL_DIR, 'page-snapshot-replay.js');
const SHIFTORA_COPY_SCRIPT = path.join(TOOL_DIR, 'shiftora-copy-map.js');
const CTA_LINK_ROUTER_SCRIPT = path.join(TOOL_DIR, 'cta-link-router.js');
const SECTION_VISIBILITY_SCRIPT = path.join(TOOL_DIR, 'section-visibility-overrides.js');
const THEME_OVERRIDES_CSS = path.join(TOOL_DIR, 'theme-overrides.css');
const SCRIBBLE_MODE_CSS = path.join(TOOL_DIR, 'scribble-mode.css');
const SCRIBBLE_ASSET_DIR = path.resolve(TOOL_DIR, '..', 'assets', 'scribble');
const SCRIBBLE_MANIFEST = path.join(SCRIBBLE_ASSET_DIR, 'manifest.json');
const REPLACEMENT_ASSET_DIR = path.resolve(TOOL_DIR, '..', 'assets', 'replacements');
const SAVED_TEXT_EDITS = path.join(TOOL_DIR, 'saved-text-edits.json');
const SAVED_IMAGE_EDITS = path.join(TOOL_DIR, 'saved-image-edits.json');
const SAVED_PAGE_SNAPSHOT = path.join(TOOL_DIR, 'saved-page-snapshot.json');
const CLEAN_PAGE_SNAPSHOT = path.join(TOOL_DIR, 'clean-page-snapshot.json');
const ASSET_VERSION = Date.now();
// All proxied static assets carry a `?v=ASSET_VERSION` query string in the HTML they're
// referenced from, so a 1y immutable cache is safe — every proxy restart bumps the version
// and the browser fetches the new file.
const STATIC_CACHE = 'public, max-age=31536000, immutable';

// In-memory cache of upstream Varick HTML responses. We cache the raw upstream body for
// 60s to skip the network roundtrip; rewriteBody (text edits, image replacements, script
// injection) still runs fresh on every request, so changes in saved-text-edits.json take
// effect immediately. Bypassed for editor mode.
const UPSTREAM_CACHE_TTL_MS = 60_000;
const UPSTREAM_CACHE_MAX_ENTRIES = 30;
const upstreamCache = new Map();
const FRAMER_SITE_ID = '74Opxp7nGUyRPUIiPRjwJO';
const FRAMER_SITE_ORIGIN = `https://framerusercontent.com/sites/${FRAMER_SITE_ID}/`;
const FRAMER_SITE_PROXY_PREFIX = '/__framer-site/';
const FRAMER_CONTENT_PROXY_PREFIX = '/__framer-content/';
const FAVICON_GIF_PATH = path.resolve(TOOL_DIR, '..', 'assets', 'favicon.gif');
const FAVICON_URL = `/__favicon.gif?v=${ASSET_VERSION}`;

const imageUrlReplacements = new Map([
  ['24uuubkDpHGDAQkwT4YWMcNbCs', 'dubai-burj-khalifa-unsplash.jpg'],
  ['2F2fw7ynR98Uyb2aXEB5HsuAla0', 'shiftora-dashboard-overview.png'],
  ['2uTNEj5aTl2K3NJaEFWMbnrA', 'dubai-waterfront-unsplash.jpg'],
  ['RohVjH8LD19M5pOyyfxbtGYExSw', 'dubai-waterfront-unsplash.jpg'],
  ['fvm7A4Yo6XPB4bQYGudn8MTULng', 'sf-salesforce-fog-unsplash.jpg'],
  ['gO7oqH62CdjjxnyUBSU5GJTvFnk', 'dubai-modern-architecture-unsplash.jpg'],
  ['CcQeXdjVKMaXrxCBVlUR4BPviA', 'dubai-skyline-night-unsplash.jpg'],
  ['AO8phxLkXEgC9fXn1ZFK1rdnU', 'dubai-skyline-night-unsplash.jpg'],
  ['BYnxEV1zjYb9bhWh1IwBZ1ZoS60', 'shiftora-dashboard-operations.png'],
  ['GfGkADagM4KEibNcIiRUWlfrR0', 'shiftora-dashboard-overview.png'],
  ['LsCvsrsPNR7F3KYryIc5oezavOw', 'shiftora-dashboard-operations.png'],
  ['8jSFJjrfGbscAi9PTwPj8IiOA', 'shiftora-dashboard-overview.png'],
  ['cGz0LQNhmLBmFvCdD30isPmCtY', 'dubai-sheikh-zayed-monochrome.jpg'],
  ['u0o4FvvBPvv3z1HVH0grZyNmlc', 'dubai-burj-night-premium.jpg'],
  ['aNsAT3jCvt4zglbWCUoFe33Q', 'dubai-modern-architecture-unsplash.jpg'],
  ['f9RiWoNpmlCMqVRIHz8l8wYfeI', 'sf-salesforce-fog-unsplash.jpg'],
  ['gDYDO50VR5mntl3uihRNYiE7Ew', 'sf-salesforce-fog-unsplash.jpg'],
  ['oU0gLreIsWbKNRruw6rOI6Af0do', 'dubai-museum-future.jpg'],
  ['cZJTfmNIIbEGl5DU3yztsL9vyg', 'shiftora-dashboard-overview.png']
]);

const textContentTypes = [
  'text/html',
  'text/css',
  'application/javascript',
  'text/javascript',
  'application/json',
  'application/manifest+json',
  'image/svg+xml'
];

function isTextResponse(contentType = '') {
  return textContentTypes.some((type) => contentType.includes(type));
}

function contentTypeForPath(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === '.svg') return 'image/svg+xml';
  if (extension === '.woff2') return 'font/woff2';
  if (extension === '.jpg' || extension === '.jpeg') return 'image/jpeg';
  if (extension === '.webp') return 'image/webp';
  if (extension === '.png') return 'image/png';
  return 'application/octet-stream';
}

function serveAssetFromDirectory(clientRes, baseDir, relativePath, missingLabel) {
  const decoded = decodeURIComponent(relativePath);
  const assetPath = path.resolve(baseDir, decoded);
  if (!assetPath.startsWith(`${baseDir}${path.sep}`)) {
    clientRes.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
    clientRes.end('Forbidden');
    return;
  }

  clientRes.writeHead(200, {
    'content-type': contentTypeForPath(assetPath),
    'cache-control': STATIC_CACHE
  });
  fs.createReadStream(assetPath)
    .on('error', () => {
      if (!clientRes.headersSent) {
        clientRes.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      }
      clientRes.end(`Missing ${missingLabel}`);
    })
    .pipe(clientRes);
}

function applyImageUrlReplacements(body) {
  let rewritten = body;
  for (const [framerId, fileName] of imageUrlReplacements) {
    const localAsset = `/__replacement-asset/${encodeURIComponent(fileName)}?v=${ASSET_VERSION}`;
    const pattern = new RegExp(`https://framerusercontent\\.com/images/${framerId}\\.[a-zA-Z0-9]+(?:\\?[^"'\\\`\\s,)<>]*)?`, 'g');
    rewritten = rewritten.replace(pattern, localAsset);
  }
  return rewritten;
}

function loadSavedTextReplacements() {
  try {
    const payload = JSON.parse(fs.readFileSync(SAVED_TEXT_EDITS, 'utf8'));
    const edits = Array.isArray(payload.edits) ? payload.edits : [];
    return edits
      .filter((edit) => {
        if (!edit || typeof edit.from !== 'string' || typeof edit.to !== 'string') return false;
        const from = edit.from.replace(/\s+/g, ' ').trim();
        const to = edit.to.replace(/\s+/g, ' ').trim();
        return from.length > 2 && from !== to;
      })
      .sort((a, b) => b.from.length - a.from.length);
  } catch {
    return [];
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function applySavedTextReplacements(body) {
  let rewritten = body;
  const replacements = loadSavedTextReplacements();

  for (const { from, to } of replacements) {
    rewritten = rewritten.replaceAll(from, to);

    const escapedFrom = JSON.stringify(from).slice(1, -1);
    const escapedTo = JSON.stringify(to).slice(1, -1);
    if (escapedFrom !== from) {
      rewritten = rewritten.replaceAll(escapedFrom, escapedTo);
    }

    // Framer sometimes serializes text with flexible whitespace after hydration.
    // Skip when `to` contains `from` — otherwise the regex matches inside its
    // own replacement and we double-apply (e.g. "Foo" -> "Foo & Bar" becomes
    // "Foo & Bar & Bar").
    if (from.includes(' ') && !to.includes(from)) {
      const flexibleWhitespacePattern = new RegExp(escapeRegExp(from).replace(/\\ /g, '\\s+'), 'g');
      rewritten = rewritten.replace(flexibleWhitespacePattern, to);
    }
  }

  return rewritten;
}

function applyFixedWidthTextReplacements(buffer) {
  let rewritten = Buffer.from(buffer);
  const replacements = loadSavedTextReplacements();

  for (const { from, to } of replacements) {
    const fromBuffer = Buffer.from(from);
    const toBuffer = Buffer.from(to);
    if (!fromBuffer.length || toBuffer.length > fromBuffer.length) continue;

    const paddedReplacement = Buffer.concat([
      toBuffer,
      Buffer.alloc(fromBuffer.length - toBuffer.length, 0x20)
    ]);

    let offset = 0;
    while (offset < rewritten.length) {
      const index = rewritten.indexOf(fromBuffer, offset);
      if (index === -1) break;
      paddedReplacement.copy(rewritten, index);
      offset = index + paddedReplacement.length;
    }
  }

  return rewritten;
}

function publicOriginFor(req) {
  const host = req.headers.host || `localhost:${PORT}`;
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim();
  const proto = forwardedProto || (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');
  return `${proto}://${host}`;
}

function rewriteFramerSiteUrls(body) {
  return body.replaceAll(FRAMER_SITE_ORIGIN, FRAMER_SITE_PROXY_PREFIX);
}

function rewriteFramerContentUrls(body, origin) {
  return body
    .replaceAll('https://framerusercontent.com/modules/', `${origin}${FRAMER_CONTENT_PROXY_PREFIX}modules/`)
    .replaceAll('https://framerusercontent.com/cms/', `${origin}${FRAMER_CONTENT_PROXY_PREFIX}cms/`);
}

function compressForClient(buffer, acceptEncoding) {
  const enc = String(acceptEncoding || '');
  if (/\bgzip\b/.test(enc)) {
    return { encoding: 'gzip', body: zlib.gzipSync(buffer, { level: 6 }) };
  }
  return { encoding: null, body: buffer };
}

function sendCompressed(clientReq, clientRes, statusCode, headers, body) {
  const buffer = Buffer.isBuffer(body) ? body : Buffer.from(body);
  const { encoding, body: outBody } = compressForClient(buffer, clientReq.headers['accept-encoding']);
  const responseHeaders = { ...headers };
  // Always recompute encoding/length so we never pass through stale upstream values.
  delete responseHeaders['content-encoding'];
  delete responseHeaders['content-length'];
  if (encoding) responseHeaders['content-encoding'] = encoding;
  responseHeaders['vary'] = responseHeaders['vary']
    ? `${responseHeaders['vary']}, Accept-Encoding`
    : 'Accept-Encoding';
  responseHeaders['content-length'] = outBody.length;
  clientRes.writeHead(statusCode, responseHeaders);
  clientRes.end(outBody);
}

function serveStaticTextAsset(clientReq, clientRes, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      clientRes.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
      clientRes.end('Missing static asset');
      return;
    }
    sendCompressed(clientReq, clientRes, 200, {
      'content-type': contentType,
      'cache-control': STATIC_CACHE
    }, data);
  });
}

function isUpstreamRequestCacheable(localUrl, method) {
  if (method !== 'GET') return false;
  if (localUrl.searchParams.has('edit')) return false;
  if (localUrl.searchParams.has('imageEdit')) return false;
  if (localUrl.searchParams.has('capture')) return false;
  return true;
}

function renderRewrittenUpstreamHtml(clientReq, clientRes, localUrl, rawBuffer, statusCode, sourceHeaders) {
  const publicOrigin = publicOriginFor(clientReq);
  const headers = { ...sourceHeaders };

  if (headers.location) {
    headers.location = String(headers.location)
      .replaceAll('https://www.varickagents.com', publicOrigin)
      .replaceAll('https://varickagents.com', publicOrigin);
  }

  const contentType = String(headers['content-type'] || '');
  const isHtml = contentType.includes('text/html');
  const shouldInjectTextEditor = isHtml && localUrl.searchParams.has('edit');
  const shouldInjectImageReplacer = isHtml && localUrl.searchParams.has('imageEdit');
  const shouldInjectShiftoraCopy = isHtml && localUrl.searchParams.has('shiftora');
  const shouldInjectTheme = isHtml && !localUrl.searchParams.has('noTheme');
  const shouldInjectScribble = isHtml && localUrl.searchParams.has('scribble');
  const shouldInjectSnapshotReplay = isHtml && !localUrl.searchParams.has('clean');
  const shouldHideTools = isHtml && localUrl.searchParams.has('capture');

  const body = rewriteBody(
    rawBuffer.toString('utf8'),
    publicOrigin,
    shouldInjectTextEditor,
    shouldInjectImageReplacer,
    shouldInjectShiftoraCopy,
    shouldInjectTheme,
    shouldInjectScribble,
    shouldInjectSnapshotReplay,
    shouldHideTools
  );

  headers['cache-control'] = 'no-store';
  sendCompressed(clientReq, clientRes, statusCode, headers, body);
}

function rewriteBody(
  body,
  publicOrigin,
  shouldInjectTextEditor,
  shouldInjectImageReplacer,
  shouldInjectShiftoraCopy,
  shouldInjectTheme,
  shouldInjectScribble,
  shouldInjectSnapshotReplay,
  shouldHideTools
) {
  let rewritten = body
    .replaceAll('https://www.varickagents.com', publicOrigin)
    .replaceAll('https://varickagents.com', publicOrigin)
    .replaceAll('//www.varickagents.com', publicOrigin.replace(/^https?:/, ''))
    .replaceAll('//varickagents.com', publicOrigin.replace(/^https?:/, ''));

  rewritten = rewriteFramerSiteUrls(rewritten);
  rewritten = rewriteFramerContentUrls(rewritten, publicOrigin);
  rewritten = applyImageUrlReplacements(rewritten);
  rewritten = applySavedTextReplacements(rewritten);
  rewritten = rewritten.replace(/\s*href=["']https?:\/\/jobs\.ashbyhq\.com[^"']*["']/gi, '');
  rewritten = rewritten.replace(/https?:\/\/jobs\.ashbyhq\.com\/Varick-Agents\/[A-Za-z0-9-]+/g, '#');
  // Strip Varick's reb2b visitor-tracking inline script — it pings b2bjsstore on every load.
  rewritten = rewritten.replace(/<script\b[^>]*>[\s\S]*?reb2b[\s\S]*?<\/script>/gi, '');

  if (rewritten.includes('</head>')) {
    rewritten = rewritten.replace(/<link\b[^>]*rel=["'][^"']*(?:shortcut\s+icon|icon|apple-touch-icon|mask-icon)[^"']*["'][^>]*>/gi, '');
    rewritten = rewritten.replace(
      '</head>',
      `<link rel="icon" id="shiftora-favicon" href="${FAVICON_URL}" type="image/gif"><link rel="apple-touch-icon" href="${FAVICON_URL}"><link rel="preconnect" href="https://framerusercontent.com" crossorigin><link rel="dns-prefetch" href="https://cal.com"><link rel="dns-prefetch" href="https://form.typeform.com"><script>(()=>{const u="${FAVICON_URL}";const img=new Image();img.decoding="async";img.src=u;const cv=document.createElement("canvas");cv.width=cv.height=32;const cx=cv.getContext("2d");function tick(){const link=document.getElementById("shiftora-favicon")||document.querySelector('link[rel*="icon"]');if(!link||!img.complete||!img.naturalWidth)return;try{cx.clearRect(0,0,32,32);cx.drawImage(img,0,0,32,32);link.type="image/png";link.href=cv.toDataURL("image/png");}catch(e){}}img.addEventListener("load",()=>{tick();setInterval(tick,100);},{once:true});})();</script></head>`
    );
    rewritten = rewritten.replace(/<meta\b[^>]*property=["']og:image(?::[a-z]+)?["'][^>]*>/gi, '');
    rewritten = rewritten.replace(/<meta\b[^>]*name=["']twitter:image(?::[a-z]+)?["'][^>]*>/gi, '');
    rewritten = rewritten.replace(/(<meta\b[^>]*name=["']twitter:card["'][^>]*content=["'])summary_large_image(["'][^>]*>)/gi, '$1summary$2');
  }

  if (shouldInjectTheme && rewritten.includes('</head>')) {
    rewritten = rewritten.replace(
      '</head>',
      `<link rel="stylesheet" href="/__theme-overrides.css?v=${ASSET_VERSION}"></head>`
    );
  }

  if (shouldInjectScribble && rewritten.includes('</head>')) {
    rewritten = rewritten.replace(
      '</head>',
      `<link rel="stylesheet" href="/__scribble-mode.css?v=${ASSET_VERSION}"></head>`
    );
  }

  if (shouldHideTools && rewritten.includes('</head>')) {
    rewritten = rewritten.replace(
      '</head>',
      `<style>
        #shiftora-text-editor-panel,
        #shiftora-image-replacer-panel,
        #shiftora-section-visibility-control,
        #shiftora-scribble-placeholder-note {
          display: none !important;
        }
      </style></head>`
    );
  }

  if (rewritten.includes('</body>')) {
    const scripts = [
      `<script src="/__section-visibility-overrides.js?v=${ASSET_VERSION}"></script>`,
      `<script src="/__cta-link-router.js?v=${ASSET_VERSION}"></script>`,
      shouldInjectShiftoraCopy ? `<script src="/__shiftora-copy-map.js?v=${ASSET_VERSION}"></script>` : '',
      shouldInjectSnapshotReplay ? `<script src="/__page-snapshot-replay.js?v=${ASSET_VERSION}"></script>` : '',
      shouldInjectImageReplacer ? `<script src="/__image-replacer-overlay.js?v=${ASSET_VERSION}"></script>` : '',
      shouldInjectTextEditor ? `<script src="/__text-editor-overlay.js?v=${ASSET_VERSION}"></script>` : '',
      shouldInjectScribble ? `<script src="/__scribble-mode.js?v=${ASSET_VERSION}"></script>` : ''
    ].join('');
    rewritten = rewritten.replace('</body>', `${scripts}</body>`);
  }

  return rewritten;
}

const server = http.createServer((clientReq, clientRes) => {
  const localUrl = new URL(clientReq.url || '/', LOCAL_ORIGIN);

  if (
    localUrl.pathname === '/favicon.ico' ||
    localUrl.pathname === '/favicon.gif' ||
    localUrl.pathname === '/apple-touch-icon.png' ||
    localUrl.pathname === '/__favicon.gif'
  ) {
    fs.readFile(FAVICON_GIF_PATH, (err, data) => {
      if (err) {
        clientRes.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        clientRes.end('Missing favicon');
        return;
      }
      clientRes.writeHead(200, {
        'content-type': 'image/gif',
        'cache-control': STATIC_CACHE,
        'content-length': data.length
      });
      clientRes.end(data);
    });
    return;
  }

  if (localUrl.pathname === '/__saved-text-edits.json') {
    clientRes.writeHead(200, {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    });
    fs.createReadStream(SAVED_TEXT_EDITS)
      .on('error', () => clientRes.end('{"edits":[]}'))
      .pipe(clientRes);
    return;
  }

  if (localUrl.pathname === '/__saved-image-edits.json') {
    clientRes.writeHead(200, {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    });
    fs.createReadStream(SAVED_IMAGE_EDITS)
      .on('error', () => clientRes.end('{"edits":[]}'))
      .pipe(clientRes);
    return;
  }

  if (localUrl.pathname === '/__page-snapshot.json') {
    clientRes.writeHead(200, {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    });
    fs.createReadStream(SAVED_PAGE_SNAPSHOT)
      .on('error', () => clientRes.end('{"items":[]}'))
      .pipe(clientRes);
    return;
  }

  if (localUrl.pathname === '/__save-clean-page-snapshot') {
    if (clientReq.method !== 'POST') {
      clientRes.writeHead(405, { allow: 'POST' });
      clientRes.end();
      return;
    }

    const chunks = [];
    let received = 0;
    clientReq.on('data', (chunk) => {
      received += chunk.length;
      if (received > 5_000_000) {
        clientReq.destroy(new Error('Payload too large'));
        return;
      }
      chunks.push(chunk);
    });
    clientReq.on('end', () => {
      try {
        const payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        const body = JSON.stringify(
          {
            savedAt: new Date().toISOString(),
            url: typeof payload.url === 'string' ? payload.url : '',
            items: Array.isArray(payload.items) ? payload.items : []
          },
          null,
          2
        );
        fs.writeFile(CLEAN_PAGE_SNAPSHOT, `${body}\n`, (error) => {
          if (error) {
            clientRes.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
            clientRes.end(JSON.stringify({ ok: false, error: error.message }));
            return;
          }
          clientRes.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
          clientRes.end(JSON.stringify({ ok: true }));
        });
      } catch (error) {
        clientRes.writeHead(400, { 'content-type': 'application/json; charset=utf-8' });
        clientRes.end(JSON.stringify({ ok: false, error: error.message }));
      }
    });
    clientReq.on('error', (error) => {
      clientRes.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
      clientRes.end(JSON.stringify({ ok: false, error: error.message }));
    });
    return;
  }

  if (localUrl.pathname === '/__save-page-snapshot') {
    if (clientReq.method !== 'POST') {
      clientRes.writeHead(405, { allow: 'POST' });
      clientRes.end();
      return;
    }

    const chunks = [];
    let received = 0;
    clientReq.on('data', (chunk) => {
      received += chunk.length;
      if (received > 5_000_000) {
        clientReq.destroy(new Error('Payload too large'));
        return;
      }
      chunks.push(chunk);
    });
    clientReq.on('end', () => {
      try {
        const payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        const body = JSON.stringify(
          {
            savedAt: new Date().toISOString(),
            url: typeof payload.url === 'string' ? payload.url : '',
            items: Array.isArray(payload.items) ? payload.items : []
          },
          null,
          2
        );
        fs.writeFile(SAVED_PAGE_SNAPSHOT, `${body}\n`, (error) => {
          if (error) {
            clientRes.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
            clientRes.end(JSON.stringify({ ok: false, error: error.message }));
            return;
          }
          clientRes.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
          clientRes.end(JSON.stringify({ ok: true }));
        });
      } catch (error) {
        clientRes.writeHead(400, { 'content-type': 'application/json; charset=utf-8' });
        clientRes.end(JSON.stringify({ ok: false, error: error.message }));
      }
    });
    clientReq.on('error', (error) => {
      clientRes.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
      clientRes.end(JSON.stringify({ ok: false, error: error.message }));
    });
    return;
  }

  if (localUrl.pathname === '/__save-text-edits') {
    if (clientReq.method !== 'POST') {
      clientRes.writeHead(405, { allow: 'POST' });
      clientRes.end();
      return;
    }

    const chunks = [];
    let received = 0;
    clientReq.on('data', (chunk) => {
      received += chunk.length;
      if (received > 2_000_000) {
        clientReq.destroy(new Error('Payload too large'));
        return;
      }
      chunks.push(chunk);
    });
    clientReq.on('end', () => {
      try {
        const payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        const body = JSON.stringify(
          {
            savedAt: new Date().toISOString(),
            edits: Array.isArray(payload.edits) ? payload.edits : []
          },
          null,
          2
        );
        fs.writeFile(SAVED_TEXT_EDITS, `${body}\n`, (error) => {
          if (error) {
            clientRes.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
            clientRes.end(JSON.stringify({ ok: false, error: error.message }));
            return;
          }
          clientRes.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
          clientRes.end(JSON.stringify({ ok: true }));
        });
      } catch (error) {
        clientRes.writeHead(400, { 'content-type': 'application/json; charset=utf-8' });
        clientRes.end(JSON.stringify({ ok: false, error: error.message }));
      }
    });
    clientReq.on('error', (error) => {
      clientRes.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
      clientRes.end(JSON.stringify({ ok: false, error: error.message }));
    });
    return;
  }

  if (localUrl.pathname === '/__save-image-edits') {
    if (clientReq.method !== 'POST') {
      clientRes.writeHead(405, { allow: 'POST' });
      clientRes.end();
      return;
    }

    const chunks = [];
    let received = 0;
    clientReq.on('data', (chunk) => {
      received += chunk.length;
      if (received > 50_000_000) {
        clientReq.destroy(new Error('Payload too large'));
        return;
      }
      chunks.push(chunk);
    });
    clientReq.on('end', () => {
      try {
        const payload = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        const body = JSON.stringify(
          {
            savedAt: new Date().toISOString(),
            edits: Array.isArray(payload.edits) ? payload.edits : []
          },
          null,
          2
        );
        fs.writeFile(SAVED_IMAGE_EDITS, `${body}\n`, (error) => {
          if (error) {
            clientRes.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
            clientRes.end(JSON.stringify({ ok: false, error: error.message }));
            return;
          }
          clientRes.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
          clientRes.end(JSON.stringify({ ok: true }));
        });
      } catch (error) {
        clientRes.writeHead(400, { 'content-type': 'application/json; charset=utf-8' });
        clientRes.end(JSON.stringify({ ok: false, error: error.message }));
      }
    });
    clientReq.on('error', (error) => {
      clientRes.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
      clientRes.end(JSON.stringify({ ok: false, error: error.message }));
    });
    return;
  }

  if (localUrl.pathname === '/__text-editor-overlay.js') {
    serveStaticTextAsset(clientReq, clientRes, EDITOR_SCRIPT, 'application/javascript; charset=utf-8');
    return;
  }

  if (localUrl.pathname === '/__image-replacer-overlay.js') {
    serveStaticTextAsset(clientReq, clientRes, IMAGE_REPLACER_SCRIPT, 'application/javascript; charset=utf-8');
    return;
  }

  if (localUrl.pathname === '/__page-snapshot-replay.js') {
    serveStaticTextAsset(clientReq, clientRes, PAGE_SNAPSHOT_REPLAY_SCRIPT, 'application/javascript; charset=utf-8');
    return;
  }

  if (localUrl.pathname === '/__section-visibility-overrides.js') {
    serveStaticTextAsset(clientReq, clientRes, SECTION_VISIBILITY_SCRIPT, 'application/javascript; charset=utf-8');
    return;
  }

  if (localUrl.pathname === '/__theme-overrides.css') {
    serveStaticTextAsset(clientReq, clientRes, THEME_OVERRIDES_CSS, 'text/css; charset=utf-8');
    return;
  }

  if (localUrl.pathname === '/__scribble-mode.css') {
    serveStaticTextAsset(clientReq, clientRes, SCRIBBLE_MODE_CSS, 'text/css; charset=utf-8');
    return;
  }

  if (localUrl.pathname === '/__scribble-mode.js') {
    serveStaticTextAsset(clientReq, clientRes, SCRIBBLE_MODE_SCRIPT, 'application/javascript; charset=utf-8');
    return;
  }

  if (localUrl.pathname === '/__scribble-manifest.json') {
    clientRes.writeHead(200, {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    });
    pipeline(fs.createReadStream(SCRIBBLE_MANIFEST), clientRes, () => {});
    return;
  }

  if (localUrl.pathname.startsWith('/__scribble-asset/')) {
    serveAssetFromDirectory(
      clientRes,
      SCRIBBLE_ASSET_DIR,
      localUrl.pathname.replace('/__scribble-asset/', ''),
      'scribble asset'
    );
    return;
  }

  if (localUrl.pathname.startsWith('/__replacement-asset/')) {
    serveAssetFromDirectory(
      clientRes,
      REPLACEMENT_ASSET_DIR,
      localUrl.pathname.replace('/__replacement-asset/', ''),
      'replacement asset'
    );
    return;
  }

  if (localUrl.pathname.startsWith(FRAMER_CONTENT_PROXY_PREFIX)) {
    const relativePath = decodeURIComponent(localUrl.pathname.slice(FRAMER_CONTENT_PROXY_PREFIX.length));
    if (relativePath.includes('..') || relativePath.startsWith('/')) {
      clientRes.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
      clientRes.end('Forbidden');
      return;
    }

    const upstreamAssetPath = `/${relativePath}${localUrl.search}`;
    const upstreamAssetReq = https.request(
      {
        protocol: 'https:',
        hostname: 'framerusercontent.com',
        method: clientReq.method,
        path: upstreamAssetPath,
        headers: {
          ...clientReq.headers,
          host: 'framerusercontent.com',
          referer: 'https://framerusercontent.com/',
          'accept-encoding': 'identity'
        }
      },
      (upstreamRes) => {
        const headers = { ...upstreamRes.headers };
        const contentType = String(headers['content-type'] || '');
        const statusCode = upstreamRes.statusCode || 502;

        const chunks = [];
        upstreamRes.on('data', (chunk) => chunks.push(chunk));
        upstreamRes.on('end', () => {
          const rawBody = Buffer.concat(chunks);

          if (relativePath.endsWith('.framercms')) {
            const body = applyFixedWidthTextReplacements(rawBody);
            headers['cache-control'] = 'no-store';
            headers['content-length'] = body.length;
            clientRes.writeHead(statusCode, headers);
            clientRes.end(body);
            return;
          }

          if (!isTextResponse(contentType)) {
            clientRes.writeHead(statusCode, headers);
            clientRes.end(rawBody);
            return;
          }

          const publicOrigin = publicOriginFor(clientReq);
          const body = applySavedTextReplacements(
            applyImageUrlReplacements(
              rewriteFramerContentUrls(rewriteFramerSiteUrls(rawBody.toString('utf8')), publicOrigin)
            )
          );
          headers['cache-control'] = 'no-store';
          sendCompressed(clientReq, clientRes, statusCode, headers, body);
        });
      }
    );
    upstreamAssetReq.on('error', (error) => {
      clientRes.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
      clientRes.end(`Framer content proxy error: ${error.message}`);
    });
    upstreamAssetReq.end();
    return;
  }

  if (localUrl.pathname.startsWith(FRAMER_SITE_PROXY_PREFIX)) {
    const relativePath = decodeURIComponent(localUrl.pathname.slice(FRAMER_SITE_PROXY_PREFIX.length));
    if (relativePath.includes('..') || relativePath.startsWith('/')) {
      clientRes.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
      clientRes.end('Forbidden');
      return;
    }

    const upstreamAssetPath = `/sites/${FRAMER_SITE_ID}/${relativePath}${localUrl.search}`;
    const upstreamAssetReq = https.request(
      {
        protocol: 'https:',
        hostname: 'framerusercontent.com',
        method: clientReq.method,
        path: upstreamAssetPath,
        headers: {
          ...clientReq.headers,
          host: 'framerusercontent.com',
          referer: `https://framerusercontent.com/sites/${FRAMER_SITE_ID}/`,
          'accept-encoding': 'identity'
        }
      },
      (upstreamRes) => {
        const headers = { ...upstreamRes.headers };
        const contentType = String(headers['content-type'] || '');
        const statusCode = upstreamRes.statusCode || 502;

        if (!isTextResponse(contentType)) {
          clientRes.writeHead(statusCode, headers);
          pipeline(upstreamRes, clientRes, () => {});
          return;
        }

        const chunks = [];
        upstreamRes.on('data', (chunk) => chunks.push(chunk));
        upstreamRes.on('end', () => {
          const publicOrigin = publicOriginFor(clientReq);
          const body = applySavedTextReplacements(
            applyImageUrlReplacements(
              rewriteFramerContentUrls(rewriteFramerSiteUrls(Buffer.concat(chunks).toString('utf8')), publicOrigin)
            )
          );
          headers['cache-control'] = 'no-store';
          sendCompressed(clientReq, clientRes, statusCode, headers, body);
        });
      }
    );
    upstreamAssetReq.on('error', (error) => {
      clientRes.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
      clientRes.end(`Framer asset proxy error: ${error.message}`);
    });
    upstreamAssetReq.end();
    return;
  }

  if (localUrl.pathname === '/__shiftora-copy-map.js') {
    serveStaticTextAsset(clientReq, clientRes, SHIFTORA_COPY_SCRIPT, 'application/javascript; charset=utf-8');
    return;
  }

  if (localUrl.pathname === '/__cta-link-router.js') {
    serveStaticTextAsset(clientReq, clientRes, CTA_LINK_ROUTER_SCRIPT, 'application/javascript; charset=utf-8');
    return;
  }

  const upstreamUrl = new URL(localUrl.pathname, `https://${UPSTREAM_HOST}`);
  for (const [key, value] of localUrl.searchParams) {
    if (!['edit', 'imageEdit', 'shiftora', 'noShiftora', 'showHidden', 'hideSections', 'localReload', 'noTheme', 'scribble', 'capture'].includes(key)) {
      upstreamUrl.searchParams.append(key, value);
    }
  }

  const cacheKey = `${upstreamUrl.pathname}${upstreamUrl.search}`;
  const isCacheableRequest = isUpstreamRequestCacheable(localUrl, clientReq.method);

  if (isCacheableRequest) {
    const cached = upstreamCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      renderRewrittenUpstreamHtml(clientReq, clientRes, localUrl, cached.body, cached.statusCode, cached.headers);
      return;
    }
    if (cached) upstreamCache.delete(cacheKey);
  }

  const upstreamReq = https.request(
    {
      protocol: 'https:',
      hostname: UPSTREAM_HOST,
      method: clientReq.method,
      path: `${upstreamUrl.pathname}${upstreamUrl.search}`,
      headers: {
        ...clientReq.headers,
        host: UPSTREAM_HOST,
        origin: `https://${UPSTREAM_HOST}`,
        referer: `https://${UPSTREAM_HOST}/`,
        'accept-encoding': 'identity'
      }
    },
    (upstreamRes) => {
      const headers = { ...upstreamRes.headers };
      const contentType = String(headers['content-type'] || '');
      const statusCode = upstreamRes.statusCode || 502;

      if (!isTextResponse(contentType)) {
        const publicOrigin = publicOriginFor(clientReq);
        if (headers.location) {
          headers.location = String(headers.location)
            .replaceAll('https://www.varickagents.com', publicOrigin)
            .replaceAll('https://varickagents.com', publicOrigin);
        }
        clientRes.writeHead(statusCode, headers);
        pipeline(upstreamRes, clientRes, () => {});
        return;
      }

      const chunks = [];
      upstreamRes.on('data', (chunk) => chunks.push(chunk));
      upstreamRes.on('end', () => {
        const rawBody = Buffer.concat(chunks);

        if (isCacheableRequest && statusCode === 200 && contentType.includes('text/html')) {
          upstreamCache.set(cacheKey, {
            body: rawBody,
            headers: { ...upstreamRes.headers },
            statusCode,
            expires: Date.now() + UPSTREAM_CACHE_TTL_MS
          });
          if (upstreamCache.size > UPSTREAM_CACHE_MAX_ENTRIES) {
            upstreamCache.delete(upstreamCache.keys().next().value);
          }
        }

        renderRewrittenUpstreamHtml(clientReq, clientRes, localUrl, rawBody, statusCode, upstreamRes.headers);
      });
    }
  );

  upstreamReq.on('error', (error) => {
    clientRes.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
    clientRes.end(`Proxy error: ${error.message}`);
  });

  if (clientReq.method !== 'GET' && clientReq.method !== 'HEAD') {
    pipeline(clientReq, upstreamReq, () => {});
  } else {
    upstreamReq.end();
  }
});

server.listen(PORT, () => {
  console.log(`http://localhost:${PORT}/?edit=1`);
  console.log(`http://localhost:${PORT}/?edit=1&shiftora=1`);
});
