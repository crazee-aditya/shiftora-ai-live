# Shiftora

Shiftora is an integrated strategy and systems firm.

This branch contains the two-page institutional rebrand:

- `/` — **The firm**
- `/mandates` — **Mandates**

The upstream positioning and language rules are recorded in [BRAND.md](./BRAND.md). Public copy must be derived from that institutional charter rather than from a list of present services.

The site is prerendered for search and answer engines, with a real branded 404, a two-URL sitemap,
route-specific metadata, structured data, and a restrained paper/ink visual system.

## Working locally

```sh
npm ci
npm run dev
```

## Verification

```sh
npm run verify
```

This builds the site and verifies the public copy, route metadata, structured data, sitemap, heading
structure, retired-positioning exclusions, and image dimensions. It then launches the production
server on an isolated local port and checks route status, the branded 404, cache behavior, and the
configured security headers. It also verifies the explicit `410 Gone` policy for the retired careers,
blog-index, and six legacy article URLs.

```sh
npm run verify:visual
```

The visual check opens the production build from 320 through 1440 pixels, including both sides of
the 600px and 1100px layout boundaries and the branded 404 at mobile and desktop sizes. It verifies
page structure, horizontal fit, metadata, indexing controls, hydration, and browser-console health,
then saves full-page review images to a temporary directory. Set
`SHIFTORA_CHROME_PATH` if Chrome is installed somewhere other than the standard macOS location.

```sh
npm run verify:release
```

The release check additionally runs the full dependency audit and requires properly licensed,
self-hosted Söhne and Alliance No. 2 webfonts at every weight used by the design. It also requires
outlined brand lettering plus a digest record binding the outlined sources to the regenerated social
and organization PNGs. It intentionally fails until those assets are added. See
[FONTS.md](./FONTS.md).

Do not deploy this branch while `npm run verify:release` is failing.

```sh
npm run audit:all
npm run audit:prod
```

Both audits query the current advisory registry. The release check runs the full build-toolchain audit;
the production-only command remains useful when classifying runtime exposure after dependency changes.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the current domain, repository-access, release-hold, and
handoff state.
