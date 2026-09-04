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
  return value['@graph'];
}

const checks = [
  [home, '<title>Shiftora — Integrated Strategy and Systems Firm</title>', 'home title'],
  [home, '<meta name="theme-color" content="#eeece5" />', 'home browser color'],
  [home, '<meta property="og:image:alt" content="Shiftora — Every institution is governed twice." />', 'social image description'],
  [home, '<p class="page-kicker">The firm</p>', 'institutional page label'],
  [home, 'href="#main-content">Skip to content</a>', 'skip navigation'],
  [home, 'Shiftora is an integrated strategy and systems firm.', 'positioning'],
  [home, 'Every institution is governed twice:', 'governing thesis'],
  [home, 'An institution has sovereign capacity when its systems are answerable', 'sovereignty definition'],
  [mandates, '<title>Mandates — Shiftora</title>', 'mandates title'],
  [mandates, '<meta name="theme-color" content="#090a0a" />', 'mandates browser color'],
  [mandates, '>Integrated strategy and systems firm</p>', 'direct-entry category'],
  [mandates, 'Shiftora mandates begin where consequential direction or responsibility exceeds', 'prospective mandate metadata'],
  [mandates, 'A Shiftora mandate begins where an institution&#x27;s direction or responsibility exceeds', 'mandate test'],
  [mandates, 'Carry a national priority into operation', 'public mandate'],
  [mandates, 'Under continuing public authority', 'public authority boundary'],
  [mandates, 'Reallocate capital around a chosen course', 'capital mandate'],
  [mandates, 'Build the organization a new strategy requires', 'organization mandate'],
  [mandates, 'With those who hold the relevant authority, reshape leadership and organization', 'organizational mandate'],
  [mandates, 'give those with authority the basis to stop it, reorder it, or rebuild it', 'transformation termination test'],
  [mandates, 'advise the relevant authority on the function required', 'new-responsibility authority'],
  [mandates, 'then build its operating capacity', 'material capability construction'],
  [mandates, 'When responsibility outruns capability', 'responsibility-led capability chapter'],
  [mandates, 'Build software for a critical institutional function', 'software mandate'],
  [mandates, 'cannot serve the function as its obligations and operating conditions demand', 'software authority boundary'],
  [mandates, 'Establish the information a consequential mandate requires', 'data mandate'],
  [mandates, 'When necessary data is divided across systems or jurisdictions', 'mandate-led data work'],
  [mandates, 'Set the terms under which models may act', 'models mandate'],
  [mandates, 'advise the responsible authorities on which judgments must remain human', 'model authority boundary'],
  [mandates, 'When strategic dependence becomes unacceptable', 'sovereign-dependence condition'],
  [mandates, 'With the institution&#x27;s accountable authorities', 'control-boundary authority'],
  [mandates, 'A Shiftora mandate carries a consequential direction or responsibility', 'mandate close'],
  [mandates, 'Discuss a mandate.', 'contact action'],
  [notFound, '<title>Page not found — Shiftora</title>', '404 title'],
  [notFound, '<meta name="robots" content="noindex, follow" />', '404 indexing policy'],
  [notFound, 'href="/">The firm', '404 route back to the firm'],
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
  'Keep critical knowledge under institutional control',
  'A mandate belongs within Shiftora&#x27;s remit when',
  'This is sovereign capacity:',
  'holds a consequential direction or responsibility intact',
  'govern the capability on which action depends',
]) {
  if (home.includes(retiredPhrase) || mandates.includes(retiredPhrase) || source.includes(retiredPhrase)) {
    throw new Error(`Verification failed: retired positioning remains (${retiredPhrase})`);
  }
}

if (/"knowsAbout"/.test(`${home}\n${mandates}`)) {
  throw new Error('Verification failed: structured data must not reduce the firm to a service inventory.');
}

if (notFound.includes('aria-current="page"')) {
  throw new Error('Verification failed: the 404 must not identify itself as either public page.');
}

for (const [label, pattern] of [
  ['unsupported prestige', /\b(?:world[- ]class|best[- ]in[- ]class|preeminent|unmatched|industry[- ]leading|trusted by|most consequential)\b/i],
  ['generic promotional language', /\b(?:game[- ]changing|cutting[- ]edge|revolution(?:ary|ize|izing)|future[- ]proof|next[- ]generation|transformative solutions?|AI[- ]powered solutions?|bespoke digital solutions?|transformation journeys?|end[- ]to[- ]end transformation)\b/i],
  ['low-status audience suffix', /\b(?:firm|company|consultancy|agency)\s+for\s+(?:governments?|companies|enterprises|organizations?)\b/i],
  ['source-company signature language', /\b(?:machinery of execution|foundational layer|build to the mission|software that works|ontology of the enterprise|where new capability is required, we build it|dignified parts?|efficient parts?)\b/i],
  ['extended double-government metaphor', /\b(?:first|second|real|hidden|concealed) government of (?:an?|the) institution\b/i],
  ['regulated independence language', /\b(?:an |our )?independent view\b/i],
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
    'Governments and enterprises may decide or be required to do more than they can presently carry out.',
    'Shiftora forms its own view and advises those who hold the relevant authority.',
    'We remain with the mandate through the work it requires.',
    'When the necessary capacity does not exist, we build it.',
    'An institution has sovereign capacity when its systems are answerable to its lawful authority',
  ],
  'description argument'
);

if (count(home, /<h1\b/g) !== 1 || count(mandates, /<h1\b/g) !== 1) {
  throw new Error('Verification failed: each public page must contain exactly one H1.');
}

if (count(mandates, /<section class="mandate-chapter">/g) !== 4) {
  throw new Error('Verification failed: Mandates must contain exactly four institutional conditions.');
}

if (count(mandates, /<article class="mandate-item">/g) !== 11) {
  throw new Error('Verification failed: Mandates must contain exactly eleven selected records.');
}

const homeGraph = assertJsonLd(home, 'description page');
const mandatesGraph = assertJsonLd(mandates, 'mandates page');

const homeOrganization = homeGraph.find((node) => node['@type'] === 'Organization');
if (!homeOrganization || homeOrganization.description === undefined) {
  throw new Error('Verification failed: description page has no described Organization node.');
}
if (JSON.stringify(homeOrganization).includes('Worldwide')) {
  throw new Error('Verification failed: structured data contains an unsupported worldwide claim.');
}

const mandatesCollection = mandatesGraph.find((node) => node['@type'] === 'CollectionPage');
const mandateRecords = mandatesCollection?.mainEntity?.itemListElement;
if (!Array.isArray(mandateRecords) || mandateRecords.length !== 11) {
  throw new Error('Verification failed: Mandates JSON-LD must contain exactly eleven records.');
}
if (
  mandateRecords.some(
    (record, index) =>
      record['@type'] !== 'ListItem' ||
      record.position !== index + 1 ||
      typeof record.name !== 'string' ||
      record.name.trim().length === 0,
  )
) {
  throw new Error('Verification failed: Mandates JSON-LD records must be named and sequential.');
}

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
