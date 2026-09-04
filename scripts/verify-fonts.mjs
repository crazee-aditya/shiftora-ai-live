import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { inspectFontPolicy } from './font-policy.mjs';

const css = readFileSync('src/index.css', 'utf8');
const { issues, woff2Urls } = inspectFontPolicy(css);

for (const url of woff2Urls) {
  if (!url.startsWith('/fonts/')) {
    issues.push(`font must be self-hosted from /fonts/ (${url})`);
    continue;
  }
  const path = resolve('public', url.slice(1));
  if (!existsSync(path)) {
    issues.push(`declared font file is missing (${path})`);
  }
}

const ogSource = readFileSync('scripts/og-image.svg', 'utf8');
const logoSource = readFileSync('scripts/logo-512.svg', 'utf8');
const faviconSource = readFileSync('public/favicon.svg', 'utf8');

for (const [label, source] of [
  ['social card', ogSource],
  ['organization logo', logoSource],
  ['favicon', faviconSource],
]) {
  if (/<text\b/i.test(source)) {
    issues.push(`${label} lettering must be converted to licensed vector outlines`);
  }
}

const assetManifestPath = 'brand-assets.json';
if (!existsSync(assetManifestPath)) {
  issues.push('outlined-source and generated-PNG provenance has not been recorded');
} else {
  try {
    const manifest = JSON.parse(readFileSync(assetManifestPath, 'utf8'));
    if (manifest.algorithm !== 'sha256') {
      issues.push('brand asset manifest must use sha256');
    }

    const generatorPath = 'scripts/build-brand-assets.mjs';
    const sharpPackage = JSON.parse(readFileSync('node_modules/sharp/package.json', 'utf8'));
    const generatorDigest = createHash('sha256')
      .update(readFileSync(generatorPath))
      .digest('hex');
    if (
      manifest.generator?.command !== 'npm run brand:build-assets' ||
      manifest.generator?.script !== generatorPath ||
      manifest.generator?.scriptDigest !== generatorDigest ||
      manifest.generator?.renderer !== 'sharp' ||
      manifest.generator?.rendererVersion !== sharpPackage.version
    ) {
      issues.push('brand asset provenance does not match the current deterministic generator');
    }

    const expectedPaths = [
      'scripts/og-image.svg',
      'scripts/logo-512.svg',
      'public/favicon.svg',
      'public/og-image.png',
      'public/logo-512.png',
    ];
    for (const path of expectedPaths) {
      const expected = manifest.sources?.[path] ?? manifest.outputs?.[path];
      if (typeof expected !== 'string') {
        issues.push(`brand asset manifest is missing ${path}`);
        continue;
      }
      const actual = createHash('sha256').update(readFileSync(path)).digest('hex');
      if (actual !== expected) {
        issues.push(`brand asset changed after its release digest was recorded (${path})`);
      }
    }
  } catch (error) {
    issues.push(`brand asset manifest is invalid (${error.message})`);
  }
}

if (issues.length > 0) {
  const detail = issues.map((issue) => `- ${issue}`).join('\n');
  throw new Error(`Release blocked:\n${detail}`);
}

console.log('Verified licensed Shiftora webfont declarations and assets.');
