#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const sources = [
  'scripts/og-image.svg',
  'scripts/logo-512.svg',
  'public/favicon.svg',
];
const outputs = [
  'public/og-image.png',
  'public/logo-512.png',
];

for (const path of sources) {
  const source = readFileSync(path, 'utf8');
  if (/<text\b/i.test(source)) {
    throw new Error(`${path} still contains live text; convert the licensed lettering to outlines first.`);
  }
}

function digest(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

const manifest = {
  algorithm: 'sha256',
  sources: Object.fromEntries(sources.map((path) => [path, digest(path)])),
  outputs: Object.fromEntries(outputs.map((path) => [path, digest(path)])),
};

writeFileSync('brand-assets.json', `${JSON.stringify(manifest, null, 2)}\n`);
console.log('Recorded the outlined brand sources and their regenerated raster outputs.');
