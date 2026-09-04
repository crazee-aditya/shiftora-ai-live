# Shiftora type assets

The rebrand specifies two licensed commercial families:

- **Alliance No. 2** for the Shiftora wordmark and major display type. Licence it through
  [MyFonts](https://www.myfonts.com/collections/alliance-font-degarism-studio). The family page
  includes the Alliance No. 2 Regular, Medium, and Bold styles required here.
- **Söhne** for paragraphs, navigation, labels, and supporting type. Licence it from
  [Klim Type Foundry](https://klim.co.nz/fonts/soehne/). The corresponding styles are Söhne Buch
  (400) and Söhne Kräftig (500).

The repository does not contain either licensed font file. The current CSS names the intended
families and falls back to Helvetica Neue/Helvetica/Arial, so the site remains usable without
shipping unlicensed assets.

Before production release, obtain webfont licences and WOFF2 files from the respective foundries.
Place the files in `public/fonts/`, add the matching `@font-face` declarations at the top of
`src/index.css`, and use `font-display: swap`. Preserve the existing family names in the CSS:
`Alliance No. 2` and `Söhne`.

Files under `/fonts/` use a one-day revalidation policy rather than year-long immutable caching,
because the release process does not require content-hashed font filenames. Do not change the policy
to `immutable` unless filename versioning is enforced at the same time.

Required web weights are Söhne 400/500 and Alliance No. 2 400/500/700. A licensed variable file
may cover the range. Convert all lettering in `scripts/og-image.svg`, `scripts/logo-512.svg`, and
`public/favicon.svg` to paths using the licensed desktop faces, then regenerate the PNG assets.
External SVGs cannot inherit the page's webfonts, and a bitmap rendered from unresolved SVG text can
silently preserve the development fallback.

After the three SVGs contain licensed outlines, run `npm run brand:build-assets`. The command refuses
live text, deterministically renders `public/og-image.png` and `public/logo-512.png` from their SVG
sources, then records SHA-256 digests of the sources, outputs, generator, and Sharp renderer version
in `brand-assets.json`. Commit the manifest with the assets. The release gate fails if a source,
output, generator, or renderer version changes afterward, so an old fallback-rendered PNG cannot be
blessed merely by recording whatever file happens to exist.

Do not substitute similarly named downloads from unofficial font sites.

Run `npm run verify:release` after installing the fonts. That check intentionally fails while the
licensed faces are absent, if a face omits `font-display: swap`, if a declared WOFF2 file is missing,
if any required family-and-weight combination does not load in the browser, or if the
outlined-source/raster digest record is absent or stale. The browser check explicitly loads Söhne
400/500 and Alliance No. 2 400/500/700 before evaluating the 22 route-and-viewport cases; it does
not infer success merely because a fallback rendered the page. It also verifies the computed family
and weight on representative display, paragraph, label, and wordmark elements.

The automated checks cannot establish ownership of a font license. Retain the foundry invoices or
agreements that cover web use and desktop conversion to outlines, and record a human license sign-off
with the release evidence.
