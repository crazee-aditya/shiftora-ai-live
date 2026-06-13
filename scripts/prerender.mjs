// Post-build prerender: render every route to static HTML so crawlers and AI
// engines see real content, then generate sitemap.xml. Runs after the client
// build (dist/) and the SSR build (dist-ssr/entry-server.js).
import { mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const DIST = 'dist';
const ORIGIN = 'https://www.shiftora.ai';

const serverEntry = pathToFileURL(join(process.cwd(), 'dist-ssr', 'entry-server.js')).href;
const { render, allRoutes, getRouteMeta, renderHead } = await import(serverEntry);

// Template = built client index.html. Strip its default <title>/description so
// per-route ones don't duplicate.
let template = readFileSync(join(DIST, 'index.html'), 'utf-8');
template = template
  .replace(/\s*<title>[\s\S]*?<\/title>/i, '')
  .replace(/\s*<meta\s+name="description"[^>]*>/i, '');

if (!template.includes('<div id="root"></div>')) {
  throw new Error('prerender: could not find <div id="root"></div> in dist/index.html');
}

const routes = allRoutes();
for (const route of routes) {
  const appHtml = render(route);
  const head = renderHead(getRouteMeta(route));
  const html = template
    .replace('</head>', `    ${head}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

  const outPath = route === '/' ? join(DIST, 'index.html') : join(DIST, route, 'index.html');
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html);
  console.log('prerendered', route);
}

// sitemap.xml
const today = new Date().toISOString().slice(0, 10);
const urls = routes
  .map((r) => {
    const loc = `${ORIGIN}${r === '/' ? '/' : r}`;
    const priority = r === '/' ? '1.0' : r.startsWith('/blog/') ? '0.6' : '0.8';
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority}</priority>\n  </url>`;
  })
  .join('\n');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
writeFileSync(join(DIST, 'sitemap.xml'), sitemap);
console.log('wrote sitemap.xml with', routes.length, 'urls');

// Clean up the SSR bundle so it is not served.
rmSync('dist-ssr', { recursive: true, force: true });
