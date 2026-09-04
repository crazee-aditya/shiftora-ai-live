#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const generatorPath = 'scripts/build-brand-assets.mjs';
const sources = [
  'scripts/og-image.svg',
  'scripts/logo-512.svg',
  'public/favicon.svg',
];
const outputs = [
  {
    source: 'scripts/og-image.svg',
    output: 'public/og-image.png',
    width: 1200,
    height: 630,
  },
  {
    source: 'scripts/logo-512.svg',
    output: 'public/logo-512.png',
    width: 512,
    height: 512,
  },
];

for (const asset of outputs) {
  await sharp(readFileSync(asset.source))
    .resize(asset.width, asset.height, { fit: 'fill' })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(asset.output);
}

function digest(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

const sharpPackage = JSON.parse(readFileSync('node_modules/sharp/package.json', 'utf8'));
const manifest = {
  algorithm: 'sha256',
  generator: {
    command: 'npm run brand:build-assets',
    script: generatorPath,
    scriptDigest: digest(generatorPath),
    renderer: 'sharp',
    rendererVersion: sharpPackage.version,
  },
  sources: Object.fromEntries(sources.map((path) => [path, digest(path)])),
  outputs: Object.fromEntries(outputs.map(({ output }) => [output, digest(output)])),
};

writeFileSync('brand-assets.json', `${JSON.stringify(manifest, null, 2)}\n`);
console.log('Generated the raster brand assets from the approved Helvetica Neue-first sources and recorded their provenance.');
