#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { resolve } from 'node:path';
import handler from 'serve-handler';
import { COMMON_SECURITY_HEADERS, RETIRED_PATHS } from './site-policy.mjs';

const projectRoot = resolve(import.meta.dirname, '..');
const publicRoot = resolve(projectRoot, 'dist');
const config = JSON.parse(
  readFileSync(resolve(projectRoot, 'public/serve.json'), 'utf8'),
);
const retiredPaths = new Set(RETIRED_PATHS);

function normalizedPath(url = '/') {
  const pathname = decodeURIComponent(new URL(url, 'http://local').pathname);
  if (pathname === '/') return pathname;
  return pathname.replace(/\/+$/, '') || '/';
}

function applyCommonHeaders(response) {
  for (const [name, value] of Object.entries(COMMON_SECURITY_HEADERS)) {
    response.setHeader(name, value);
  }
}

function sendError(response, status, message) {
  if (!response.headersSent) {
    response.writeHead(status, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    });
  }
  response.end(message);
}

function sendGone(request, response) {
  const body = readFileSync(resolve(publicRoot, '404.html'));
  response.writeHead(410, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': String(body.byteLength),
    'Cache-Control': 'public, max-age=0, must-revalidate',
  });
  if (request.method === 'HEAD') response.end();
  else response.end(body);
}

const server = createServer((request, response) => {
  applyCommonHeaders(response);
  try {
    if (retiredPaths.has(normalizedPath(request.url))) {
      sendGone(request, response);
      return;
    }

    void handler(request, response, { ...config, public: publicRoot }).catch((error) => {
      console.error(error);
      sendError(response, 500, 'Internal Server Error');
    });
  } catch (error) {
    if (!(error instanceof URIError)) console.error(error);
    sendError(
      response,
      error instanceof URIError ? 400 : 500,
      error instanceof URIError ? 'Bad Request' : 'Internal Server Error',
    );
  }
});

const rawPort = process.env.PORT ?? '3000';
const port = Number.parseInt(rawPort, 10);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid PORT: ${rawPort}`);
}

server.listen(port, '0.0.0.0', () => {
  console.log(`Shiftora site listening on ${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
