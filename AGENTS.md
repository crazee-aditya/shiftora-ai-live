# Shiftora site rules

This repository expresses Shiftora as an institution, not as an AI agency or a catalogue of
technical services. Preserve that distinction in every change.

## Public identity

- The category is **integrated strategy and systems firm**.
- The governing thesis is **Every institution is governed twice.**
- Shiftora works in the passage from institutional judgment to operating capability.
- AI, software, data, models, organization, capital, and operations are possible forms of a
  mandate. None is the umbrella identity.
- “Sovereign” must name retained institutional control or freedom of action; never use it as an
  ornamental synonym for premium, private, or local.

## Information architecture

- The public site contains exactly two indexed routes: `/` and `/mandates`.
- `/` is **The firm**: one continuous institutional thesis, not a capabilities page.
- `/mandates` organizes work by the condition that creates a mandate, not by sector, department,
  buyer, or technology.
- Do not restore careers, blog, FAQ, pricing, process, or generic service pages without an explicit
  product decision and corresponding change to the sitemap and verification gate.
- `src/content.ts` is the single source of truth for the working public description, mandate chapters,
  mandate records, and closing boundary. Pages and structured data must import from it rather than
  duplicating public copy.

## Language

- Begin from institutional stakes and governing ideas, not from a list of currently known services.
- Governments and enterprises are institutional arenas, never an audience suffix such as “a firm
  for governments and companies.”
- Do not imply completed client work, government access, quantified outcomes, scale, or trust
  without a proof record.
- Avoid AI-copy defaults: unlock, leverage, empower, seamless, cutting-edge, future-proof,
  transformation, world-class, and “not just X, but Y.”
- Do not reuse distinctive language from E76, Palantir, Varick, or another reference company.

## Visual system

- Alliance No. 2 is the display face; Söhne is the text face.
- Both are commercial fonts. Use properly licensed, self-hosted WOFF2 files only. Helvetica is a
  development fallback, not an approved substitute.
- Page 1 uses warm paper; Page 2 uses near-black ink. Preserve the relationship between thesis and
  field record.
- Prefer typography, scale, negative space, and rules. Do not add cards, pills, icons, gradients,
  network diagrams, synthetic dashboards, decorative 3D, stock photographs, or looping video.
- Documentary imagery may be introduced only when it proves real work.
- Motion must remain restrained and respect reduced-motion preferences.

## Release gates

- Run `npm run verify` after every content, route, metadata, or layout change.
- Run `npm run verify:visual` after any copy-length, typography, spacing, or responsive-layout change;
  inspect the generated 390px and 1440px screenshots rather than trusting fit metrics alone.
- Run `npm run verify:release` before production deployment. It must not pass until the licensed
  Söhne and Alliance No. 2 assets are installed and declared.
- Keep the page copy, metadata, `llms.txt`, social assets, and sitemap aligned.
- The production site must not be deployed from a build that only uses fallback type.
