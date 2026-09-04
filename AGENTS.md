# Shiftora site rules

This repository expresses Shiftora as an institution, not as an AI agency or a catalogue of
technical services. Preserve that distinction in every change.

## Public identity

- The category is **integrated strategy and systems firm**.
- The governing thesis is **Every institution is governed twice.** Use it once, define it immediately,
  and never extend it into first, second, real, hidden, or concealed governments.
- Shiftora works in the passage from institutional direction or responsibility to operating capability.
- AI, software, data, models, organization, capital, and operations are possible forms of a
  mandate. None is the umbrella identity.
- A client institution or authorized coalition remains the principal in a Shiftora mandate. A
  business governed by Shiftora's own product or investment thesis requires a separate category.
- “Sovereign” must name systems answerable to lawful institutional authority and equal to the
  institution's responsibilities; never use it as an ornamental synonym for premium, private, or local.
- Do not define sovereignty through ownership, preservation, portability, or improvement of a digital
  decision system; that route is now materially adjacent to Palantir's public position.

## Information architecture

- The public site contains exactly two indexed routes: `/` and `/mandates`.
- `/` is **The firm**: one continuous institutional thesis, not a capabilities page.
- `/mandates` organizes work by the condition that creates a mandate, not by sector, department,
  buyer, or technology.
- Preserve the intentionally asymmetric eleven-record 3–3–3–2 field. Do not add a twelfth mandate
  merely to complete the grid.
- Do not restore careers, blog, FAQ, pricing, process, or generic service pages without an explicit
  product decision and corresponding change to the sitemap and verification gate.
- `src/content.ts` is the single source of truth for the working public description, mandate chapters,
  mandate records, and closing boundary. Pages and structured data must import from it rather than
  duplicating public copy.

## Language

- Use American English in public copy, except for official names and quotations.
- Begin from institutional stakes and governing ideas, not from a list of currently known services.
- Treat the current capability set as proof, never premise or ceiling. A Page-one revision must remain
  coherent after every named method and desired client is removed, after a present capability is
  subtracted, and after an unknown future instrument is introduced under the same mandate doctrine.
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
  inspect the generated 390px and 1440px screenshots rather than trusting fit metrics alone. The
  check must continue to cover both sides of every responsive boundary and preserve its metadata,
  landmark, heading-order, unique-id, labeled-link, and skip-navigation checks.
- Run `npm run verify:release` before production deployment. It must not pass until the licensed
  Söhne and Alliance No. 2 assets are installed and declared.
- Keep the page copy, metadata, `llms.txt`, social assets, and sitemap aligned.
- The production site must not be deployed from a build that only uses fallback type.
