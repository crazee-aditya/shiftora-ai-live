# Shiftora production handoff

**Checked:** 4 September 2026

## Production path

- The canonical site is `https://www.shiftora.ai/`; the apex domain redirects to `www`.
- `www.shiftora.ai` is served by the Railway `shiftora-website` project.
- GitHub repository `crazee-aditya/shiftora-ai-live` is the source of truth and deploys from `main`.
- The authenticated GitHub account has administrator access to the repository.
- The authenticated Railway account can access the production project.
- Previous public versions remain recoverable from Git history.

## Approved release

- The Firm and Engagements pages are the complete public site.
- The accepted 665 × 767 Codex rendering is the Firm-page visual master.
- Helvetica Neue is the explicit first family because it is the face rendered in that accepted view;
  Helvetica and Arial remain compatibility fallbacks on platforms without Helvetica Neue.
- Firm-page typography, measure, gutters, header proportions, and internal rhythm are locked from the
  master through 2560px.
- Page 01 contains exactly five restrained underlines: the category, world governments, enterprises,
  institutional architecture, and the vantage to see the whole.
- No physical-office location is published in the footer, structured data, crawler copy, or social
  artwork.

## Release verification

- Run `npm run verify:release` locally before publication. It covers the production build, dependency
  audit, typography policy, brand-asset provenance, browser behavior, and the complete visual matrix.
- Railway runs `npm run verify:deploy`, which repeats production-safe checks without requiring a
  desktop Chrome installation inside its build container.
- The latest local release verification passed with zero dependency vulnerabilities.
- The superseded `/mandates` and `/work`, previous `/careers`, `/blog`, and six article routes return
  explicit `410 Gone` responses rather than redirecting to unrelated pages.
- The branded unknown-route page returns a real `404` with `noindex, follow`.
- HTML, assets, redirects, retired routes, and malformed requests receive the configured cache and
  security policies.
