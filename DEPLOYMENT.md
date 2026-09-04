# Shiftora rebrand release handoff

**Checked:** 4 September 2026

## Current state

- The public site remains available at `https://www.shiftora.ai/`.
- The apex domain redirects to the `www` site.
- `www.shiftora.ai` resolves through Railway.
- The domain has a Google mail exchange record; the repository cannot verify that the individual `info@shiftora.ai` mailbox accepts mail.
- GitHub CLI is authenticated as `crazee-aditya` with `repo` scope.
- That account has `ADMIN` permission on `crazee-aditya/shiftora-ai-live`.
- A dry-run push of `HEAD` to `refs/heads/shiftora-rebrand` succeeds, confirming remote write access without creating the branch.
- The rebrand is committed only on the local `shiftora-rebrand` branch. It has not been pushed, merged, or deployed.
- The previous public site remains recoverable on `origin/main`.

## Intentional release hold

Do not deploy the branch until both founder voice and licensed typography are closed.

1. Choose Page-one Option A, B, or C in the rebrand copy system.
2. If the choice changes from A, update visible copy, metadata, social-image wording, machine-readable copy, and verification expectations together.
3. License Söhne Buch/Kräftig and Alliance No. 2 Regular/Medium/Bold for web use.
4. Retain the foundry license evidence and record manual approval for web use and desktop-generated outlines; the automated gate cannot prove legal ownership.
5. Add the WOFF2 files and `@font-face` declarations described in `FONTS.md`.
6. Convert social-card, organization-logo, and favicon lettering to licensed vector outlines, then run `npm run brand:build-assets` to generate the PNGs deterministically and record their provenance.
7. Run `npm run verify:release`; it includes the full dependency audit and the 22-case visual suite in strict licensed-font mode.
8. Inspect the saved licensed-font screenshots at 390px and 1440px, then review the visual-suite measurements at 320px and across the 600/601px, 1100/1101px, and 1279/1280px transitions.
9. Confirm the public meaning of the Dubai and Mumbai locations and send a real test message through `info@shiftora.ai`.
10. Push the rebrand branch, review the remote diff and deployment preview, then merge deliberately.

## Verification already passing

- Production build and prerendering.
- Exact two-page sitemap.
- Visible-copy, metadata, JSON-LD, crawler-copy, and retired-language controls.
- Eleven sequential mandate records in the page and structured data.
- Production responses for `/`, `/mandates`, and unknown routes.
- Branded `404` with a real `404` status and `noindex, follow`.
- Static-asset and HTML cache policies plus configured security headers.
- HSTS and the common security policy on public pages, redirects, retired routes, static assets, and malformed-request responses.
- HSTS is deliberately scoped to the serving host (`max-age=31536000`) without `includeSubDomains` or preload until every Shiftora subdomain is confirmed permanently HTTPS-capable.
- Revalidating cache policy for stable-name future font assets; immutable caching remains limited to hashed build assets.
- Structured data keeps physical locations separate from service territory; no `areaServed` claim is inferred from Dubai or Mumbai.
- Sitemap modification dates are omitted until true per-route revision dates can be supplied.
- Browser structure, overflow, hydration, error logging, minimum target size, type-scale continuity, and breakpoint stability across 22 route-and-viewport combinations from 320–1440px.
- Dependency audits fail the release closed when the advisory registry is unavailable. The latest `npm run verify:release` on 4 September 2026 completed the ordinary verification and current full audit with zero vulnerabilities, then stopped at exactly the seven declared font, outline, and provenance conditions. The complete gate must run again after those assets are installed and immediately before deployment.
- The previous `/careers`, `/blog`, and six article routes have an explicit `410 Gone` policy; they are not redirected to an unrelated successor.
- Railway runs `npm run verify:release`, so fallback typography or stale/unrecorded brand assets cannot reach a deployable build through the repository configuration.

## Expected failing check

`npm run verify:release` must fail until it reports none of the following:

- missing required Söhne declarations;
- missing required Alliance No. 2 declarations;
- a required face without `font-display: swap`;
- no declared self-hosted WOFF2 assets;
- a required face that does not actually load in the browser;
- a display, body, label, or wordmark element using the wrong computed family or weight;
- text remaining in the social card, organization logo, or favicon SVG sources; or
- an absent or stale `brand-assets.json` digest record for the outlined sources and regenerated PNGs.
