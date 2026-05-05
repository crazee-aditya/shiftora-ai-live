# Current Shiftora Website State

Last updated: 2026-05-04

## Working URL

- Main edit URL: `http://localhost:8012/?edit=1&hideSections=1&localReload=host-hardened#features`
- Careers edit URL: `http://localhost:8012/careers?edit=1&hideSections=1&localReload=host-hardened`
- Public home URL: `http://localhost:8012/?hideSections=1&localReload=host-hardened#features`
- Public careers URL: `http://localhost:8012/careers?localReload=host-hardened`

## Architecture

- The site is served by `tools/editable-proxy.mjs` on port `8012`.
- Production startup is `npm start`, which runs `tools/editable-proxy.mjs`.
- `tools/editable-proxy.mjs` reads `process.env.PORT`, so hosted services can assign the public port.
- The proxy preserves the live Framer runtime from `www.varickagents.com`, including animations, routing, and Framer behavior.
- Shiftora text edits are baked into proxied HTML, Framer JS modules, and proxied Framer CMS binaries before they reach the browser.
- Shiftora text edits are also replayed by `tools/page-snapshot-replay.js` and `tools/text-editor-overlay.js` after hydration as a backup layer.
- Framer `modules/` and `cms/` requests are proxied through `/__framer-content/` so dynamic careers data cannot bypass saved copy replacements.
- Premium image replacements are built into `tools/editable-proxy.mjs` and served from `assets/replacements/`.
- The visual theme and careers-only background fix live in `tools/theme-overrides.css`.

## Editing

- `?edit=1` enables only the text editor.
- The image replacer is no longer shown in normal edit mode.
- To intentionally reopen the image replacer later, use `?imageEdit=1`.
- Text changes save to `tools/saved-text-edits.json`.
- Text snapshots save to `tools/saved-page-snapshot.json`.
- The text editor now saves a page snapshot automatically after Apply.

## Verified Copy Anchors

- Home hero: `Integrate Your Enterrpise With AI`
- Careers roles: `Frontend Engineer`, `Backend Engineer`
- Careers location: `Dubai, UAE`
- Old hydrated strings blocked: `Varick Agents`, `Forward Deployed Engineer`, `Full Stack Engineer`, `San Francisco, CA`

## Do Not Break

- Do not rebuild/scaffold a new app for this version.
- Do not remove the live Framer proxy behavior.
- Do not inject runtime image-replacement scripts that block Framer hydration.
- Keep homepage waves and Framer animations untouched.
- Keep current built-in image replacements unless explicitly asked to change them.
