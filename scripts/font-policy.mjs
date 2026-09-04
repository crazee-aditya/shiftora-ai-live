export const requiredFontWeights = {
  Söhne: [400, 500],
  'Alliance No. 2': [400, 500, 700],
};

export function extractFontFaceBlocks(css) {
  return css.match(/@font-face\s*\{[\s\S]*?\}/g) ?? [];
}

export function declaredWeights(block) {
  const match = block.match(/font-weight\s*:\s*(\d{3})(?:\s+(\d{3}))?/);
  if (!match) return [];
  const first = Number(match[1]);
  const last = Number(match[2] ?? match[1]);
  return [first, last];
}

export function inspectFontPolicy(css, requirements = requiredFontWeights) {
  const faceBlocks = extractFontFaceBlocks(css);
  const issues = [];

  for (const [family, requiredWeights] of Object.entries(requirements)) {
    const escapedFamily = family.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const familyPattern = new RegExp(`font-family\\s*:\\s*['"]${escapedFamily}['"]`);
    const familyBlocks = faceBlocks.filter((block) => familyPattern.test(block));
    if (familyBlocks.length === 0) {
      issues.push(`licensed ${family} webfonts have not been declared`);
      continue;
    }

    for (const block of familyBlocks) {
      if (!/font-display\s*:\s*swap\s*;/i.test(block)) {
        issues.push(`${family} font face must declare font-display: swap`);
      }
    }

    for (const requiredWeight of requiredWeights) {
      const covered = familyBlocks.some((block) => {
        const [first, last] = declaredWeights(block);
        return first <= requiredWeight && last >= requiredWeight;
      });
      if (!covered) issues.push(`${family} does not cover weight ${requiredWeight}`);
    }
  }

  const woff2Urls = faceBlocks.flatMap((block) =>
    [...block.matchAll(/url\(['"]?([^'")]+\.woff2)['"]?\)/g)].map((match) => match[1]),
  );
  if (woff2Urls.length === 0) issues.push('no licensed WOFF2 assets are declared');

  return { faceBlocks, issues, woff2Urls };
}
