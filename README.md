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
structure, retired-positioning exclusions, and image dimensions.

```sh
npm run verify:visual
```

The visual check opens the production build from 320 through 1440 pixels, including both sides of
the 600px and 1100px layout boundaries. It verifies page structure and horizontal fit, then saves
full-page review images to a temporary directory. Set
`SHIFTORA_CHROME_PATH` if Chrome is installed somewhere other than the standard macOS location.

```sh
npm run verify:release
```

The release check additionally requires properly licensed, self-hosted Söhne and Alliance No. 2
webfonts at every weight used by the design. It intentionally fails until those assets are added.
See [FONTS.md](./FONTS.md).

Do not deploy this branch while `npm run verify:release` is failing.
