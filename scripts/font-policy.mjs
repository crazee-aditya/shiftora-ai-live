export const approvedFontStack = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export function extractFontFaceBlocks(css) {
  return css.match(/@font-face\s*\{[\s\S]*?\}/g) ?? [];
}

export function inspectFontPolicy(css) {
  const faceBlocks = extractFontFaceBlocks(css);
  const issues = [];
  const requiredDeclarations = [
    `font-family: ${approvedFontStack};`,
    `--display: ${approvedFontStack};`,
    `--text: ${approvedFontStack};`,
  ];

  for (const declaration of requiredDeclarations) {
    if (!css.includes(declaration)) {
      issues.push(`approved typography declaration is missing (${declaration})`);
    }
  }

  for (const family of ['Söhne', 'Alliance No. 2']) {
    if (css.includes(family)) {
      issues.push(`${family} must not appear in the active CSS without licensed webfont assets`);
    }
  }

  if (faceBlocks.length > 0) {
    issues.push('the approved system-font release must not bundle webfont faces');
  }

  return { faceBlocks, issues, woff2Urls: [] };
}
