import assert from 'node:assert/strict';
import { inspectFontPolicy } from './font-policy.mjs';

const face = (family, weight, file, display = 'swap') => `
  @font-face {
    font-family: '${family}';
    src: url('/fonts/${file}.woff2') format('woff2');
    font-weight: ${weight};
    font-display: ${display};
  }
`;

const validCss = [
  face('Söhne', '400 500', 'soehne'),
  face('Alliance No. 2', '400 700', 'alliance'),
].join('\n');
assert.deepEqual(inspectFontPolicy(validCss).issues, []);

const missingSwap = validCss.replace('font-display: swap;', 'font-display: block;');
assert.ok(
  inspectFontPolicy(missingSwap).issues.includes('Söhne font face must declare font-display: swap'),
);

const missingWeight = [
  face('Söhne', 400, 'soehne-book'),
  face('Alliance No. 2', '400 700', 'alliance'),
].join('\n');
assert.ok(inspectFontPolicy(missingWeight).issues.includes('Söhne does not cover weight 500'));

const noFaces = inspectFontPolicy('').issues;
assert.ok(noFaces.includes('required Söhne webfont faces have not been declared'));
assert.ok(noFaces.includes('required Alliance No. 2 webfont faces have not been declared'));
assert.ok(noFaces.includes('no self-hosted WOFF2 assets are declared'));

console.log('Verified Shiftora webfont policy regression cases.');
