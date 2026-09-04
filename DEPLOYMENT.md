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
4. Add the WOFF2 files and `@font-face` declarations described in `FONTS.md`.
5. Convert social-card, organization-logo, and favicon lettering to licensed vector outlines, then run `npm run brand:build-assets` to generate the PNGs deterministically and record their provenance.
6. Run `npm run verify:release` and `npm run verify:visual`; the release check includes the full dependency audit.
7. Inspect the licensed-font screenshots at phone, tablet, and desktop widths.
8. Confirm the public meaning of the Dubai and Mumbai locations and send a real test message through `info@shiftora.ai`.
9. Push the rebrand branch, review the remote diff and deployment preview, then merge deliberately.

## Verification already passing

- Production build and prerendering.
- Exact two-page sitemap.
- Visible-copy, metadata, JSON-LD, crawler-copy, and retired-language controls.
- Eleven sequential mandate records in the page and structured data.
- Production responses for `/`, `/mandates`, and unknown routes.
- Branded `404` with a real `404` status and `noindex, follow`.
- Static-asset and HTML cache policies plus configured security headers.
- Browser structure, overflow, hydration, and console health across 320–1440px.
- Current full build-toolchain and production dependency audits: zero known vulnerabilities (registry network permitting).
- The previous `/careers`, `/blog`, and six article routes have an explicit `410 Gone` policy; they are not redirected to an unrelated successor.
- Railway runs `npm run verify:release`, so fallback typography or stale/unrecorded brand assets cannot reach a deployable build through the repository configuration.

## Expected failing check

`npm run verify:release` must fail until it reports none of the following:

- missing licensed Söhne declarations;
- missing licensed Alliance No. 2 declarations;
- no declared licensed WOFF2 assets; or
- text remaining in the social card, organization logo, or favicon SVG sources.
- an absent or stale `brand-assets.json` digest record for the outlined sources and regenerated PNGs.
