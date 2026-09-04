#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import { resolve } from 'node:path';
import { RETIRED_PATHS, SITE_CSP, SITE_HSTS } from './site-policy.mjs';

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

function assertExactHeader(response, name, expected) {
  const actual = response.headers.get(name) ?? '';
  if (actual !== expected) {
    throw new Error(`${response.url} has invalid ${name}: expected “${expected}”, received “${actual}”.`);
  }
}

function assertCommonHeaders(response) {
  assertHeader(response, 'x-content-type-options', 'nosniff');
  assertHeader(response, 'referrer-policy', 'strict-origin-when-cross-origin');
  assertHeader(response, 'permissions-policy', 'camera=(), microphone=(), geolocation=()');
  assertExactHeader(response, 'content-security-policy', SITE_CSP);
  assertHeader(response, 'x-frame-options', 'DENY');
  assertExactHeader(response, 'strict-transport-security', SITE_HSTS);
}

const fontFixturePath = resolve('dist/fonts/policy-test.woff2');
await mkdir(resolve('dist/fonts'), { recursive: true });
await writeFile(fontFixturePath, new Uint8Array());
const port = await reservePort();
const baseUrl = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ['scripts/start-server.mjs'], {
  env: { ...process.env, PORT: String(port) },
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
  const engagements = await fetch(`${baseUrl}/engagements`);
  const engagementsText = await engagements.text();
  const notFound = await fetch(`${baseUrl}/not-a-page`);
  const notFoundText = await notFound.text();
  const retiredResponses = await Promise.all(
    RETIRED_PATHS.map(async (path) => [path, await fetch(`${baseUrl}${path}`)]),
  );

  for (const [label, response, expectedStatus, text, marker] of [
    ['home', home, 200, homeText, 'Shiftora brings what is rarely generated internally: the vantage to see the whole and the means to change it.'],
    ['engagements', engagements, 200, engagementsText, 'Command across a sovereign logistics network'],
    ['404', notFound, 404, notFoundText, 'This page does not exist.'],
  ]) {
    if (response.status !== expectedStatus) {
      throw new Error(`${label} returned ${response.status}; expected ${expectedStatus}.`);
    }
    if (!text.includes(marker)) throw new Error(`${label} response is missing “${marker}”.`);
    assertHeader(response, 'cache-control', 'max-age=0, must-revalidate');
    assertCommonHeaders(response);
  }

  for (const [path, response] of retiredResponses) {
    const text = await response.text();
    if (response.status !== 410) {
      throw new Error(`retired route ${path} returned ${response.status}; expected 410.`);
    }
    if (!text.includes('This page does not exist.')) {
      throw new Error(`retired route ${path} is missing the branded retirement response.`);
    }
    if (!text.includes('<meta name="robots" content="noindex, follow" />')) {
      throw new Error(`retired route ${path} is missing the noindex directive.`);
    }
    assertCommonHeaders(response);
  }

  const retiredTrailingSlash = await fetch(`${baseUrl}/careers/`, { redirect: 'manual' });
  if (retiredTrailingSlash.status !== 410) {
    throw new Error(`retired trailing-slash route returned ${retiredTrailingSlash.status}; expected 410.`);
  }
  assertCommonHeaders(retiredTrailingSlash);

  const retiredHead = await fetch(`${baseUrl}/blog`, { method: 'HEAD' });
  if (retiredHead.status !== 410 || (await retiredHead.text()) !== '') {
    throw new Error('retired HEAD response must return 410 without a body.');
  }

  if (!notFoundText.includes('<meta name="robots" content="noindex, follow" />')) {
    throw new Error('404 response is missing the noindex directive.');
  }

  const assetPath = homeText.match(/(?:src|href)="(\/assets\/[^"]+)"/)?.[1];
  if (!assetPath) throw new Error('Could not find a built asset in the home response.');
  const asset = await fetch(`${baseUrl}${assetPath}`);
  if (!asset.ok) throw new Error(`Built asset returned ${asset.status}: ${assetPath}`);
  assertHeader(asset, 'cache-control', 'max-age=31536000, immutable');
  assertCommonHeaders(asset);

  const font = await fetch(`${baseUrl}/fonts/policy-test.woff2`);
  if (!font.ok) throw new Error(`Font-policy fixture returned ${font.status}.`);
  assertExactHeader(font, 'cache-control', 'public, max-age=86400, must-revalidate');
  assertCommonHeaders(font);

  const redirect = await fetch(`${baseUrl}/engagements/`, { redirect: 'manual' });
  if (redirect.status !== 301) {
    throw new Error(`canonical trailing-slash redirect returned ${redirect.status}; expected 301.`);
  }
  assertCommonHeaders(redirect);

  const malformed = await fetch(`${baseUrl}/%E0%A4%A`, { redirect: 'manual' });
  if (malformed.status !== 400 || (await malformed.text()) !== 'Bad Request') {
    throw new Error('Malformed URI must return the fixed 400 response.');
  }
  assertExactHeader(malformed, 'content-type', 'text/plain; charset=utf-8');
  assertExactHeader(malformed, 'cache-control', 'no-store');
  assertCommonHeaders(malformed);
  if (/URIError|URI malformed/.test(serverError)) {
    throw new Error('Malformed URI emitted an avoidable stack trace.');
  }

  console.log('Verified production routing, explicit retired routes, cache policy, and security headers.');
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
  await rm(fontFixturePath, { force: true });
}
