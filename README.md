# Shiftora

Shiftora is an integrated strategy and systems firm.

This branch contains the three-page institutional rebrand:

- `/` — **The firm**
- `/engagements` — **Engagements**
- `/careers` — **Careers**

The upstream positioning and language rules are recorded in [BRAND.md](./BRAND.md). Public copy must be derived from that institutional charter rather than from a list of present services.

The site is prerendered for search and answer engines, with a real branded 404, a three-URL sitemap,
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
configured security headers, including HSTS on success, redirects, retirements, and malformed-request
responses. It also verifies the explicit `410 Gone` policy for the retired blog index and
six legacy article URLs, plus the superseded `/mandates` and `/work` routes. Sitemap modification dates remain omitted until true per-route revision
dates are available.

```sh
npm run verify:visual
```

The visual check opens the production build across a route-and-viewport matrix from 320 through
2560 pixels, including both sides of each layout transition, the locked 665 × 767 Firm reference,
and the branded 404 at mobile and desktop sizes. It verifies page structure, horizontal fit, metadata,
indexing controls, hydration, browser errors, minimum mobile target sizes, heading headroom, the
Firm typography lock, and continuity of the responsive Engagements scale, then saves full-page
review images to a temporary directory.
Set `SHIFTORA_CHROME_PATH` if Chrome is installed somewhere other than the standard macOS location.

```sh
npm run verify:release
```

The release check additionally runs the full dependency audit, verifies the approved Helvetica
Neue-first system stack on representative display, body, label, and wordmark elements, and rejects
unapproved or undeclared webfonts. It also requires deterministic social/organization PNGs and a
provenance record binding the source, output, generator, and renderer version. See
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
