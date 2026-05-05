# Shiftora AI Website

This is the current production candidate for `shiftora.ai`.

It is a hardened live Framer reverse proxy of `www.varickagents.com` with:

- Shiftora copy baked into HTML, Framer JS modules, and Framer CMS responses.
- Saved text replay after Framer hydration as a backup.
- Premium image replacements served from `assets/replacements/`.
- Black/white/grey visual theme in `tools/theme-overrides.css`.
- Section hiding in `tools/section-visibility-overrides.js`.
- Text editor available only with `?edit=1`.

## Run Locally

```bash
npm start
```

Open:

```text
http://localhost:8012/?hideSections=1&localReload=host-hardened#features
http://localhost:8012/careers?localReload=host-hardened
```

Text editor:

```text
http://localhost:8012/?edit=1&hideSections=1&localReload=host-hardened#features
http://localhost:8012/careers?edit=1&hideSections=1&localReload=host-hardened
```

## Production Start

Hosting platforms normally provide `PORT`. The proxy now reads it automatically:

```bash
npm start
```

Do not deploy `live-proxy.mjs` or `scripts/live-proxy.mjs` as the production entrypoint. Those are older reference proxies.

## Current Source Of Truth

- Server: `tools/editable-proxy.mjs`
- Saved text: `tools/saved-text-edits.json`
- Saved page snapshot: `tools/saved-page-snapshot.json`
- Theme: `tools/theme-overrides.css`
- Image assets: `assets/replacements/`
- Current architecture notes: `CURRENT_WEBSITE_STATE.md`
