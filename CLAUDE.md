# CLAUDE.md

Context for working on the Shiftora AI site. Read this before making changes.

## What this is

A static "coming soon" holding page for **Shiftora AI** plus a small **Careers**
page. Next.js 14 (App Router) + TypeScript, Tailwind, Lenis smooth scroll, GSAP,
Framer Motion. Strictly monochrome (black and white) Arial system.

## Running it

- Node 20. If Node is not on your PATH, prefix commands with:
  `export PATH="$HOME/.local/nodejs/bin:$PATH"`
- `npm install`
- `npm run dev` (http://localhost:3000), `npm run build`, `npm run start`, `npm run lint`

## Routes

- `/` — home: `Wordmark` + `ComingSoonHero` + `Watermark`, then the footer.
- `/careers` — open roles, reached from the button in the top right.

## Architecture

```
app/layout.tsx        fonts (Archivo Black fallback), metadata, Providers, SiteHeader, SiteFooter
app/page.tsx          home
app/careers/page.tsx  careers
components/
  Wordmark.tsx        giant full-bleed SHIFTORA (the h1), CSS entrance
  ComingSoonHero.tsx  full-bleed black panel + blocky pulsing module grid
  Watermark.tsx       oversized parallax type-as-graphic (GSAP ScrollTrigger)
  SiteHeader.tsx      brand + context action (CAREERS / HOME), route-aware (usePathname)
  SiteFooter.tsx, Reveal.tsx, Providers.tsx, ui/PillButton.tsx, ui/Eyebrow.tsx
lib/lenis.tsx         Lenis provider + useSmoothScroll
lib/gsap.ts           ScrollTrigger registration + prefersReducedMotion()
lib/cn.ts             class-name joiner
data/site.ts          contact email + footer line
data/careers.ts       open roles
styles/tokens.css     design tokens (CSS variables)
```

## Design rules (do not break)

- Strictly black, white, and three grays: `--gray-watermark #C9C9C9`,
  `--gray-line #E5E5E5`, `--gray-mute #6B6B6B`. No other color.
- Display type = Arial Black (`font-display`, Archivo Black fallback). Body =
  Arial (`font-sans`). No serif.
- Copy style: direct, formal, institutional. **No em dashes. No exclamation marks.**
- `--accent` in `styles/tokens.css` is the only color hook (defaults to black).
  Keep `--accent` and `--accent-rgb` in sync if you use it.
- Tailwind quirk: the `text-watermark` class applies BOTH the watermark font size
  and the watermark gray color (two utilities share the name). This is intentional.

## Motion and robustness (important)

- Lenis smooth scrolling is global (`Providers`), disabled under reduced motion.
- GSAP ScrollTrigger drives the watermark parallax and `Reveal` fades. `Reveal`
  shows content immediately when `prefers-reduced-motion` is set OR the tab is
  hidden (`document.hidden`), so content never gets stuck invisible in a
  background tab (where requestAnimationFrame is paused).
- The wordmark entrance is CSS transform-only (no opacity gating), so it is always
  visible without JavaScript and in background tabs.
- The hero grid pulse is CSS (`motion-safe:animate-cell-pulse`).
- DO NOT reintroduce Framer Motion `initial={{ opacity: 0 }}` on content: it
  server-renders as `opacity: 0` and hides content without JS.
- DO NOT add `usePathname`-based effects inside `SmoothScroll` (it triggered a
  Fast Refresh / setState-in-render error). Next scrolls to top on navigation by
  default, which is enough.

## Hero specifics (current)

- `ComingSoonHero` is full-bleed (no container, `w-full`), `min-h-[80vh]`,
  `rounded-t-2xl`.
- Background is a 12x6 module grid: the `gap` forms the grid lines
  (`rgba(255,255,255,0.08)`); each cell has an inner white div animating opacity
  `0 -> 0.14` (`cellPulse`, 4s) with a negative position-based delay, producing a
  diagonal wave.
- Tuning knobs: `COLS` / `ROWS` in `ComingSoonHero.tsx` (lower = bigger blocks);
  the `cellPulse` peak (`0.14`) and the `cell-pulse` duration (`4s`) in
  `tailwind.config.ts`.

## Editing content

- Roles: `data/careers.ts`. Contact email and footer line: `data/site.ts`.
- Watermark phrases: the `words` prop on `<Watermark>` in the pages (e.g.
  `["SHIFT", "THE", "ORDINARY"]`).

## Gotchas

- `next` is pinned to a patched 14.2.x (a security advisory affected earlier 14.2).
- Type-check without building: `npx tsc --noEmit`.

## Deploy

Any Next.js host. On Vercel: import the repo, framework auto-detects as Next.js,
build command `next build`, no environment variables required.
