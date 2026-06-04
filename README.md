# Shiftora AI website

A static "coming soon" holding page for **Shiftora AI**, plus a small **Careers**
page. Built in Shiftora's monochrome Arial system: pure black and white, heavy
Arial Black display type, smooth scrolling, and an oversized type-as-graphic
watermark.

## Pages

- **Home (`/`)** — the giant `SHIFTORA` wordmark, a black panel with an animated
  monochrome line grid and "New website coming soon.", and a gray `COMING SOON`
  watermark that parallaxes on scroll.
- **Careers (`/careers`)** — reached from the small button in the top right. Open
  roles with compensation and location, each linking to a prefilled email. To
  apply, write to `info@shiftora.ai`.

## Tech stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** with a custom token layer (`styles/tokens.css`, `tailwind.config.ts`)
- **Lenis** smooth scrolling
- **GSAP + ScrollTrigger** for the watermark parallax and scroll reveals
- **Framer Motion** for component-level animation; `next/font` for the Archivo
  Black display fallback
- No 3D / WebGL. `prefers-reduced-motion` is respected, and content is visible
  without JavaScript.

## Running it

This project uses Node 20. If Node is not on your `PATH` (for example a local
install at `~/.local/nodejs/bin`), prefix commands accordingly:

```bash
export PATH="$HOME/.local/nodejs/bin:$PATH"   # only if Node is not already on PATH

npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
```

## Project structure

```
app/
  layout.tsx          # fonts, metadata, providers, header, footer
  page.tsx            # home (coming soon)
  careers/page.tsx    # careers
  globals.css         # Tailwind layers, base styles, reduced-motion backstop
components/
  Wordmark.tsx        # giant SHIFTORA wordmark (the h1), CSS entrance
  ComingSoonHero.tsx  # black panel, animated grid, coming-soon line
  Watermark.tsx       # oversized parallax type-as-graphic
  SiteHeader.tsx      # brand + context action (CAREERS / HOME)
  SiteFooter.tsx
  Reveal.tsx          # GSAP scroll reveal wrapper
  Providers.tsx       # Lenis smooth scroll + Framer MotionConfig
  ui/PillButton.tsx, ui/Eyebrow.tsx
lib/
  lenis.tsx           # Lenis provider + useSmoothScroll
  gsap.ts             # ScrollTrigger registration + reduced-motion helper
  cn.ts               # class-name joiner
data/
  site.ts             # contact email, office address, legal line
  careers.ts          # open roles
styles/
  tokens.css          # design tokens (CSS variables)
```

## Editing content

- **Open roles** live in `data/careers.ts` (title, compensation, location).
- **Contact email and the footer legal line** live in `data/site.ts`.
- **Coming-soon copy** is in `app/page.tsx`; the careers intro is in
  `app/careers/page.tsx`.
- The watermark phrases are the `words` prop passed to `<Watermark>` (e.g.
  `["COMING", "SOON"]` on the home page).

## Design system

Strictly black, white, and three permitted grays (the oversized watermark, hairline
dividers, and muted meta labels). Display type is Arial Black (Archivo Black
fallback); body is Arial. No serif. `--accent` in `styles/tokens.css` is the single
hook for an optional color variant (defaults to black; keep `--accent` and
`--accent-rgb` in sync).

## Accessibility & motion

- Semantic landmarks, one `h1` per page, skip link, visible 2px focus outlines.
- The watermark and background art are `aria-hidden`; role rows link to a
  prefilled mailto.
- Motion (Lenis, GSAP, Framer Motion) is gated behind `prefers-reduced-motion` and
  background tabs; the wordmark and reveals stay visible without JavaScript.

## Notes

- `next` is pinned to a patched 14.2.x release.
- The full marketing site (filterable work grid, feature block, insights, etc.)
  was replaced by this coming-soon build.
