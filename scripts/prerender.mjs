// Post-build prerender: render every route to static HTML so crawlers and AI
// engines see real content, then generate sitemap.xml. Runs after the client
// build (dist/) and the SSR build (dist-ssr/entry-server.js).
import { mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const DIST = 'dist';
const ORIGIN = 'https://www.shiftora.ai';

const serverEntry = pathToFileURL(join(process.cwd(), 'dist-ssr', 'entry-server.js')).href;
const { render, allRoutes, getRouteMeta, renderHead, sitemapEntries } = await import(serverEntry);

// Template = built client index.html. Strip its default <title>/description so
// per-route ones don't duplicate.
let template = readFileSync(join(DIST, 'index.html'), 'utf-8');
template = template
  .replace(/\s*<title>[\s\S]*?<\/title>/i, '')
  .replace(/\s*<meta\s+name="description"[^>]*>/i, '');

if (!template.includes('<div id="root"></div>')) {
  throw new Error('prerender: could not find <div id="root"></div> in dist/index.html');
}

function buildPage(route) {
  const appHtml = render(route);
  const head = renderHead(getRouteMeta(route));
  return template
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
}

const routes = allRoutes();
for (const route of routes) {
  const outPath = route === '/' ? join(DIST, 'index.html') : join(DIST, route, 'index.html');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, buildPage(route));
  console.log('prerendered', route);
}

// Branded 404 (served by `serve` for not-found responses; not in sitemap).
writeFileSync(join(DIST, '404.html'), buildPage('/404'));
console.log('prerendered /404 -> 404.html');

// sitemap.xml with accurate per-URL lastmod
const today = new Date().toISOString().slice(0, 10);
const entries = sitemapEntries(today);
const urls = entries
  .map(
    (e) =>
      `  <url>\n    <loc>${e.loc}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n    <priority>${e.priority}</priority>\n  </url>`
  )
  .join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
writeFileSync(join(DIST, 'sitemap.xml'), sitemap);
console.log('wrote sitemap.xml with', entries.length, 'urls');

// Clean up the SSR bundle so it is not served.
rmSync('dist-ssr', { recursive: true, force: true });
