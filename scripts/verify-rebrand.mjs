import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const home = readFileSync('dist/index.html', 'utf8');
const engagements = readFileSync('dist/engagements/index.html', 'utf8');
const notFound = readFileSync('dist/404.html', 'utf8');
const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
const visibleHome = home.slice(home.indexOf('<body'));
const visibleEngagements = engagements.slice(engagements.indexOf('<body'));

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

const expectedDefaultDescription =
  'Shiftora is an integrated strategy and systems firm operating across world governments and enterprises, from strategy through systems and operation.';

const checks = [
  [home, '<title>Shiftora — Integrated Strategy and Systems Firm</title>', 'home title'],
  [home, `<meta name="description" content="${expectedDefaultDescription}" />`, 'home description'],
  [home, '<meta name="theme-color" content="#eeece5" />', 'home browser color'],
  [home, '<p class="page-kicker">The firm</p>', 'institutional page label'],
  [home, 'href="#main-content">Skip to content</a>', 'skip navigation'],
  [home, 'Shiftora is an integrated strategy and systems firm operating across world governments and enterprises.', 'positioning and institutional scale'],
  [home, 'Strategy, organization, capital, operations, data, and technology are ordered as one institutional architecture.', 'integrated field'],
  [home, 'We advise the course, build the capacity to carry it, and remain through operation until the intended result is in force.', 'operating responsibility'],
  [home, 'Shiftora brings the vantage to see the whole—and the means to make ambition executable.', 'institutional outcome'],
  [engagements, '<title>Engagements — Shiftora</title>', 'engagements title'],
  [engagements, '<meta name="theme-color" content="#090a0a" />', 'engagements browser color'],
  [engagements, '<h1 class="engagements-title">Engagements</h1>', 'engagements heading'],
  [engagements, '>Integrated strategy and systems firm</p>', 'direct-entry category'],
  [engagements, 'Selected systems for public authority and enterprise.', 'engagements opening'],
  [engagements, 'Architecture alone is disclosed;', 'confidentiality boundary'],
  [engagements, 'continuing legal duties of confidence.', 'confidentiality duration'],
  [engagements, 'Where nations move', 'sovereign movement chapter'],
  [engagements, 'Command across a sovereign logistics network', 'government logistics record'],
  [engagements, 'Built for a government logistics institution', 'government identity'],
  [engagements, 'ports, freight, customs, suppliers, and public authority', 'logistics scope'],
  [engagements, 'Govern passage across borders', 'global mobility record'],
  [engagements, 'visa discovery, eligibility, documentation, pricing, payment, and fulfillment', 'visa scope'],
  [engagements, 'Where institutional knowledge cannot be divided', 'institutional knowledge chapter'],
  [engagements, 'Place a legal institution&#x27;s memory beside every decision', 'legal record'],
  [engagements, 'matters, precedent, clients, communications, and commercial knowledge', 'legal scope'],
  [engagements, 'Keep frontier intelligence inside the institution', 'private intelligence record'],
  [engagements, 'private models and data infrastructure', 'private model scope'],
  [engagements, 'Where capital takes physical form', 'physical capital chapter'],
  [engagements, 'Govern the making of a city', 'real-estate record'],
  [engagements, 'major developer governs land, construction, inventory, agents, commercial assets, and sales', 'real-estate scope'],
  [engagements, 'Where scale exceeds human attention', 'scale chapter'],
  [engagements, 'Make capital answer to strategy', 'capital record'],
  [engagements, 'Put live judgment inside every commercial conversation', 'commercial record'],
  [engagements, 'A Shiftora system is complete when the institution&#x27;s capacity to decide and act', 'engagements close'],
  [engagements, 'Discuss an engagement.', 'contact action'],
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
  'Sovereign technology systems',
  'Available for engagements worldwide',
  'Carry a national priority into operation',
  'When strategic dependence becomes unacceptable',
  'Every institution is governed twice:',
  'Governments and enterprises may decide or be required to do more than they can presently carry out.',
  'Shiftora forms its own view and advises those who hold the relevant authority.',
  'We remain with the mandate through the work it requires.',
  'When the necessary capacity does not exist, we build it.',
  'Its domain is the architecture of government and enterprise:',
  'strategy, organization, capital, operations, data, and technology.',
  'An institution is sovereign when it can act at the scale of its responsibility.',
  'We advise governments and enterprises on the decisions that determine their course.',
  'We build the systems that carry those decisions into effect.',
  'Its domain is the decisions that determine the course of governments and enterprises',
  'The measure of the work is an institution whose judgment is matched by its means.',
  'Shiftora advises the course, builds the capacity to carry it, and remains through operation until the intended result is in force.',
  'Its domain is the direction and capacity of government and enterprise.',
  'An institution is sovereign when its decisions command the means of action.',
  'Institutions equal to their ambition set the terms of what comes next.',
  'The final measure of leadership is an institution&#x27;s capacity to act.',
  'We advise the course, build the capacity to carry it, and remain through operation.',
  'The result is an institution capable of acting at the full scale of its ambition.',
  'Shiftora brings what institutions cannot create from within: the vantage to see the whole and the means to change it.',
  'The vantage to see the whole and the means to change it.',
  'Strategy at institutional scale demands the vantage to see the whole and the means to change it.',
  'Shiftora brings what is rarely generated internally: the vantage to see the whole and the means to change it.',
  'Shiftora brings what is rarely generated internally: the vantage to see the whole and the means to shape what comes next.',
  'Shiftora brings the vantage to see the whole—and the means to shape what comes next.',
  'Shiftora brings the vantage to see the whole—and the means to turn new capability into operational advantage.',
  'Selected systems built for public authority and enterprise.',
  'Only the architecture may be described here.',
  'obligations that survive the engagement',
]) {
  if (home.includes(retiredPhrase) || engagements.includes(retiredPhrase) || source.includes(retiredPhrase)) {
    throw new Error(`Verification failed: retired positioning remains (${retiredPhrase})`);
  }
}

if (/"knowsAbout"/.test(`${home}\n${engagements}`)) {
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
  if (pattern.test(`${home}\n${engagements}`)) {
    throw new Error(`Verification failed: public copy contains ${label}.`);
  }
}

assertInOrder(
  visibleHome,
  [
    'Shiftora is an integrated strategy and systems firm operating across world governments and enterprises.',
    'Strategy, organization, capital, operations, data, and technology are ordered as one institutional architecture.',
    'We advise the course, build the capacity to carry it, and remain through operation until the intended result is in force.',
    'Shiftora brings the vantage to see the whole—and the means to make ambition executable.',
  ],
  'description argument',
);

assertInOrder(
  visibleEngagements,
  [
    'Command across a sovereign logistics network',
    'Govern passage across borders',
    'Place a legal institution&#x27;s memory beside every decision',
    'Keep frontier intelligence inside the institution',
    'Govern the making of a city',
    'Make capital answer to strategy',
    'Put live judgment inside every commercial conversation',
  ],
  'engagement hierarchy',
);

if (count(home, /<h1\b/g) !== 1 || count(engagements, /<h1\b/g) !== 1) {
  throw new Error('Verification failed: each public page must contain exactly one H1.');
}
if (count(engagements, /<section class="mandate-chapter">/g) !== 4) {
  throw new Error('Verification failed: Engagements must contain exactly four institutional conditions.');
}
if (count(engagements, /<article class="mandate-item">/g) !== 7) {
  throw new Error('Verification failed: Engagements must contain exactly seven selected records.');
}

const homeGraph = assertJsonLd(home, 'description page');
const engagementsGraph = assertJsonLd(engagements, 'engagements page');
const homeOrganization = homeGraph.find((node) => node['@type'] === 'Organization');
if (!homeOrganization || homeOrganization.description !== expectedDefaultDescription) {
  throw new Error('Verification failed: Organization description omits or alters the approved authority sequence.');
}
if (JSON.stringify(homeOrganization).includes('Worldwide')) {
  throw new Error('Verification failed: structured data contains an unsupported worldwide claim.');
}

const engagementsCollection = engagementsGraph.find((node) => node['@type'] === 'CollectionPage');
const engagementRecords = engagementsCollection?.mainEntity?.itemListElement;
if (!Array.isArray(engagementRecords) || engagementRecords.length !== 7) {
  throw new Error('Verification failed: Engagements JSON-LD must contain exactly seven records.');
}
if (
  engagementRecords.some(
    (record, index) =>
      record['@type'] !== 'ListItem' ||
      record.position !== index + 1 ||
      typeof record.name !== 'string' ||
      record.name.trim().length === 0,
  )
) {
  throw new Error('Verification failed: Engagements JSON-LD records must be named and sequential.');
}

const sitemapUrls = sitemap.match(/<loc>/g)?.length ?? 0;
if (sitemapUrls !== 2 || !sitemap.includes('/engagements</loc>') || sitemap.includes('/mandates</loc>') || sitemap.includes('/work</loc>')) {
  throw new Error('Verification failed: sitemap must contain exactly the two current public pages.');
}
if (sitemap.includes('<lastmod>')) {
  throw new Error('Verification failed: sitemap lastmod must be omitted until true per-route revision dates are available.');
}
if (home.includes('"areaServed"') || engagements.includes('"areaServed"')) {
  throw new Error('Verification failed: office locations must not be inferred as an areaServed claim.');
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
