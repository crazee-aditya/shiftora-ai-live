# Shiftora

Shiftora is an integrated strategy and systems firm.

This branch contains the two-page institutional rebrand:

- `/` — **The firm**
- `/mandates` — **Mandates**

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
npm run verify:release
```

The release check additionally requires properly licensed, self-hosted Söhne and Alliance No. 2
webfonts at every weight used by the design. It intentionally fails until those assets are added.
See [FONTS.md](./FONTS.md).

Do not deploy this branch while `npm run verify:release` is failing.
