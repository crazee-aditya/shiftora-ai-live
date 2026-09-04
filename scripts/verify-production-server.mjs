#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { resolve } from 'node:path';

async function reservePort() {
  const probe = createServer();
  await new Promise((accept, reject) => {
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', accept);
  });
  const address = probe.address();
  if (!address || typeof address === 'string') throw new Error('Could not reserve a test port.');
  await new Promise((accept) => probe.close(accept));
  return address.port;
}

async function waitForServer(url, child) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (child.exitCode !== null) throw new Error('Production server exited before becoming ready.');
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((accept) => setTimeout(accept, 50));
  }
  throw new Error(`Production server did not become ready at ${url}.`);
}

function assertHeader(response, name, expected) {
  const actual = response.headers.get(name) ?? '';
  if (!actual.includes(expected)) {
    throw new Error(`${response.url} has invalid ${name}: expected “${expected}”, received “${actual}”.`);
  }
}

const port = await reservePort();
const baseUrl = `http://127.0.0.1:${port}`;
const serveBin = resolve('node_modules/serve/build/main.js');
const child = spawn(process.execPath, [serveBin, 'dist', '-l', String(port)], {
  env: { ...process.env, NO_UPDATE_CHECK: '1' },
  stdio: ['ignore', 'ignore', 'pipe'],
});

let serverError = '';
child.stderr.setEncoding('utf8');
child.stderr.on('data', (chunk) => {
  serverError += chunk;
});

try {
  await waitForServer(`${baseUrl}/`, child);

  const home = await fetch(`${baseUrl}/`);
  const homeText = await home.text();
  const mandates = await fetch(`${baseUrl}/mandates`);
  const mandatesText = await mandates.text();
  const notFound = await fetch(`${baseUrl}/not-a-page`);
  const notFoundText = await notFound.text();

  for (const [label, response, expectedStatus, text, marker] of [
    ['home', home, 200, homeText, 'Every institution is governed twice:'],
    ['mandates', mandates, 200, mandatesText, 'Carry a national priority into operation'],
    ['404', notFound, 404, notFoundText, 'This page does not exist.'],
  ]) {
    if (response.status !== expectedStatus) {
      throw new Error(`${label} returned ${response.status}; expected ${expectedStatus}.`);
    }
    if (!text.includes(marker)) throw new Error(`${label} response is missing “${marker}”.`);
    assertHeader(response, 'cache-control', 'max-age=0, must-revalidate');
    assertHeader(response, 'x-content-type-options', 'nosniff');
    assertHeader(response, 'referrer-policy', 'strict-origin-when-cross-origin');
    assertHeader(response, 'permissions-policy', 'camera=(), microphone=(), geolocation=()');
  }

  if (!notFoundText.includes('<meta name="robots" content="noindex, follow" />')) {
    throw new Error('404 response is missing the noindex directive.');
  }

  const assetPath = homeText.match(/(?:src|href)="(\/assets\/[^"]+)"/)?.[1];
  if (!assetPath) throw new Error('Could not find a built asset in the home response.');
  const asset = await fetch(`${baseUrl}${assetPath}`);
  if (!asset.ok) throw new Error(`Built asset returned ${asset.status}: ${assetPath}`);
  assertHeader(asset, 'cache-control', 'max-age=31536000, immutable');

  console.log('Verified production routing, branded 404, cache policy, and security headers.');
} finally {
  child.kill('SIGTERM');
  await new Promise((accept) => {
    if (child.exitCode !== null) return accept();
    const timeout = setTimeout(() => {
      child.kill('SIGKILL');
      accept();
    }, 2_000);
    child.once('exit', () => {
      clearTimeout(timeout);
      accept();
    });
  });
  if (child.exitCode && child.exitCode !== 143 && serverError.trim()) {
    console.error(serverError.trim());
  }
}
