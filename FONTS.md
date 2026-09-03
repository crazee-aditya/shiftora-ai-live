# Shiftora type assets

The rebrand specifies two licensed commercial families:

- **Alliance No. 2** for the Shiftora wordmark and major display type. Licence it through
  [MyFonts](https://www.myfonts.com/collections/alliance-no-2-font-degarism-studio).
- **Söhne** for paragraphs, navigation, labels, and supporting type. Licence it from
  [Klim Type Foundry](https://klim.co.nz/retail-fonts/soehne/).

The repository does not contain either licensed font file. The current CSS names the intended
families and falls back to Helvetica Neue/Helvetica/Arial, so the site remains usable without
shipping unlicensed assets.

Before production release, obtain webfont licences and WOFF2 files from the respective foundries.
Place the files in `public/fonts/`, add the matching `@font-face` declarations at the top of
`src/index.css`, and use `font-display: swap`. Preserve the existing family names in the CSS:
`Alliance No. 2` and `Söhne`.

Required web weights are Söhne 400/500 and Alliance No. 2 400/500/700. A licensed variable file
may cover the range. Convert all lettering in `scripts/og-image.svg`, `scripts/logo-512.svg`, and
`public/favicon.svg` to paths using the licensed desktop faces, then regenerate the PNG assets.
External SVGs cannot inherit the page's webfonts, and a bitmap rendered from unresolved SVG text can
silently preserve the development fallback.

Do not substitute similarly named downloads from unofficial font sites.

Run `npm run verify:release` after installing the fonts. That check intentionally fails while the
licensed faces are absent, and also fails if a declared WOFF2 file is missing.
