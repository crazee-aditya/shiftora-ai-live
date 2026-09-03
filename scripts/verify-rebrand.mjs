import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const home = readFileSync('dist/index.html', 'utf8');
const mandates = readFileSync('dist/mandates/index.html', 'utf8');
const notFound = readFileSync('dist/404.html', 'utf8');
const sitemap = readFileSync('dist/sitemap.xml', 'utf8');

function readSourceTree(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return readSourceTree(path);
      if (!/\.(?:ts|tsx|css)$/.test(entry.name)) return [];
      return [readFileSync(path, 'utf8')];
    })
    .join('\n');
}

const source = readSourceTree('src');

function count(document, pattern) {
  return document.match(pattern)?.length ?? 0;
}

function assertInOrder(document, phrases, label) {
  let previous = -1;
  for (const phrase of phrases) {
    const current = document.indexOf(phrase);
    if (current < 0 || current <= previous) {
      throw new Error(`Verification failed: ${label} is missing or out of order (${phrase}).`);
    }
    previous = current;
  }
}

function readPngSize(path) {
  const png = readFileSync(path);
  const signature = png.subarray(0, 8).toString('hex');
  if (signature !== '89504e470d0a1a0a') throw new Error(`${path} is not a PNG.`);
  return { width: png.readUInt32BE(16), height: png.readUInt32BE(20) };
}

function assertJsonLd(document, label) {
  const match = document.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!match) throw new Error(`Verification failed: ${label} has no JSON-LD graph.`);
  const value = JSON.parse(match[1]);
  if (value['@context'] !== 'https://schema.org' || !Array.isArray(value['@graph'])) {
    throw new Error(`Verification failed: ${label} JSON-LD graph is malformed.`);
  }
}

const checks = [
  [home, '<title>Shiftora — Integrated Strategy and Systems Firm</title>', 'home title'],
  [home, '<meta name="theme-color" content="#eeece5" />', 'home browser color'],
  [home, '<meta property="og:image:alt" content="Shiftora — Every institution is governed twice." />', 'social image description'],
  [home, '<p class="page-kicker">The firm</p>', 'institutional page label'],
  [home, 'href="#main-content">Skip to content</a>', 'skip navigation'],
  [home, 'Shiftora is an integrated strategy and systems firm.', 'positioning'],
  [home, 'Every institution is governed twice:', 'governing thesis'],
  [home, 'This is sovereign capacity:', 'sovereignty definition'],
  [mandates, '<title>Mandates — Shiftora</title>', 'mandates title'],
  [mandates, '<meta name="theme-color" content="#090a0a" />', 'mandates browser color'],
  [mandates, '>Integrated strategy and systems firm</p>', 'direct-entry category'],
  [mandates, 'Shiftora mandates begin where consequential direction or responsibility exceeds', 'prospective mandate metadata'],
  [mandates, 'A Shiftora mandate begins where a consequential decision exceeds', 'mandate test'],
  [mandates, 'Carry a national priority into operation', 'public mandate'],
  [mandates, 'under the authority of the institution responsible', 'public authority boundary'],
  [mandates, 'Reallocate capital around a chosen course', 'capital mandate'],
  [mandates, 'Build the organization a new strategy requires', 'organization mandate'],
  [mandates, 'With leadership, define how organizational authority', 'organizational-authority boundary'],
  [mandates, 'give leadership the basis to stop, reorder, or rebuild it', 'transformation termination test'],
  [mandates, 'When an institution assumes a responsibility', 'new-responsibility authority'],
  [mandates, 'Build the software through which critical work will run', 'software mandate'],
  [mandates, 'embody the institution&#x27;s established decision rights', 'software decision-rights boundary'],
  [mandates, 'Make fragmented data answer to a common decision', 'data mandate'],
  [mandates, 'Establish the shared information required for a common decision', 'decision-led data mandate'],
  [mandates, 'Place models under operational authority', 'models mandate'],
  [mandates, 'Within the institution&#x27;s established authority, define the bounds', 'model authority boundary'],
  [mandates, 'Keep critical knowledge under institutional control', 'sovereign mandate'],
  [mandates, 'With the institution&#x27;s accountable authorities', 'control-boundary authority'],
  [mandates, 'Discuss a mandate.', 'contact action'],
  [notFound, '<title>Page not found — Shiftora</title>', '404 title'],
];

for (const [document, phrase, label] of checks) {
  if (!document.includes(phrase)) {
    throw new Error(`Verification failed: missing ${label} (${phrase})`);
  }
}

for (const retiredPhrase of [
  'Custom Enterprise AI Systems',
  'make large enterprises AI-native',
  'Representative Shiftora mandates',
  'Fields of action',
  'Recover a stalled transformation',
  'accountable delivery across authority',
  'Select or build models for live work',
  'build the models and infrastructure required to use it while retaining institutional authority',
  'Sovereign technology systems',
  'Available for engagements worldwide',
]) {
  if (home.includes(retiredPhrase) || mandates.includes(retiredPhrase) || source.includes(retiredPhrase)) {
    throw new Error(`Verification failed: retired positioning remains (${retiredPhrase})`);
  }
}

if (/"knowsAbout"/.test(`${home}\n${mandates}`)) {
  throw new Error('Verification failed: structured data must not reduce the firm to a service inventory.');
}

for (const [label, pattern] of [
  ['unsupported prestige', /\b(?:world[- ]class|best[- ]in[- ]class|preeminent|unmatched|industry[- ]leading|trusted by|most consequential)\b/i],
  ['generic promotional language', /\b(?:game[- ]changing|cutting[- ]edge|revolution(?:ary|ize|izing)|future[- ]proof|next[- ]generation|transformative solutions?|AI[- ]powered solutions?|bespoke digital solutions?|transformation journeys?|end[- ]to[- ]end transformation)\b/i],
  ['low-status audience suffix', /\b(?:firm|company|consultancy|agency)\s+for\s+(?:governments?|companies|enterprises|organizations?)\b/i],
  ['source-company signature language', /\b(?:machinery of execution|foundational layer|build to the mission|software that works|ontology of the enterprise|where new capability is required, we build it)\b/i],
  ['non-American house style', /\b(?:programmes?|organisations?|prioritis(?:e|ed|es|ing)|labour|behaviours?|modelling|centres?)\b/i],
  ['AI-copy cliché', /\b(?:unlock|empower|leverage|harness|seamless|holistic|ever[- ]evolving|drive innovation)\b/i],
]) {
  if (pattern.test(`${home}\n${mandates}`)) {
    throw new Error(`Verification failed: public copy contains ${label}.`);
  }
}

assertInOrder(
  home,
  [
    'Shiftora is an integrated strategy and systems firm.',
    'Every institution is governed twice:',
    'In governments and enterprises alike,',
    'Shiftora works where the two diverge.',
    'When the necessary capability does not yet exist, we build it.',
    'This is sovereign capacity:',
  ],
  'description argument'
);

if (count(home, /<h1\b/g) !== 1 || count(mandates, /<h1\b/g) !== 1) {
  throw new Error('Verification failed: each public page must contain exactly one H1.');
}

if (count(mandates, /<section class="mandate-chapter">/g) !== 4) {
  throw new Error('Verification failed: Mandates must contain exactly four institutional conditions.');
}

if (count(mandates, /<article class="mandate-item">/g) !== 12) {
  throw new Error('Verification failed: Mandates must contain exactly twelve records.');
}

assertJsonLd(home, 'description page');
assertJsonLd(mandates, 'mandates page');

const sitemapUrls = sitemap.match(/<loc>/g)?.length ?? 0;
if (sitemapUrls !== 2 || !sitemap.includes('/mandates</loc>')) {
  throw new Error('Verification failed: sitemap must contain exactly the two public pages.');
}

const ogSize = readPngSize('dist/og-image.png');
const logoSize = readPngSize('dist/logo-512.png');
if (ogSize.width !== 1200 || ogSize.height !== 630) {
  throw new Error('Verification failed: social card must be 1200×630.');
}
if (logoSize.width !== 512 || logoSize.height !== 512) {
  throw new Error('Verification failed: organization logo must be 512×512.');
}

console.log('Verified the two-page Shiftora rebrand output.');
