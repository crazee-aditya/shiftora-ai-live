import assert from 'node:assert/strict';
import { approvedFontStack, inspectFontPolicy } from './font-policy.mjs';

const validCss = `
  :root {
    font-family: ${approvedFontStack};
    --display: ${approvedFontStack};
    --text: ${approvedFontStack};
  }
`;

assert.deepEqual(inspectFontPolicy(validCss).issues, []);

const missingMaster = validCss.replace(
  `font-family: ${approvedFontStack};`,
  'font-family: Arial, sans-serif;',
);
assert.ok(
  inspectFontPolicy(missingMaster).issues.some((issue) =>
    issue.includes('approved typography declaration is missing'),
  ),
);

const unavailableCommercialFace = `${validCss}\n.hero { font-family: 'Söhne', sans-serif; }`;
assert.ok(
  inspectFontPolicy(unavailableCommercialFace).issues.includes(
    'Söhne must not appear in the active CSS without licensed webfont assets',
  ),
);

const bundledFace = `${validCss}\n@font-face { font-family: Example; src: url('/fonts/example.woff2'); }`;
assert.ok(
  inspectFontPolicy(bundledFace).issues.includes(
    'the approved system-font release must not bundle webfont faces',
  ),
);

console.log('Verified the approved Shiftora system-typography policy.');
