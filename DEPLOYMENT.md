# Deployment Guide

## What To Deploy

Deploy this folder as a Node app. The production command is:

```bash
npm start
```

The app must run as a server because it proxies the live Framer runtime and rewrites text, images, routes, and CMS data before the browser receives them.

## Required Files

Production needs:

- `package.json`
- `tools/editable-proxy.mjs`
- `tools/page-snapshot-replay.js`
- `tools/text-editor-overlay.js`
- `tools/section-visibility-overrides.js`
- `tools/theme-overrides.css`
- `tools/saved-text-edits.json`
- `tools/saved-page-snapshot.json`
- `tools/saved-image-edits.json`
- `assets/replacements/`

Reference/scratch files can stay in the repo, but they are not production entrypoints.

## Hosting Steps

1. Create a Node service on Render, Railway, Fly.io, a VPS, or any host that supports a long-running Node server.
2. Set the start command to `npm start`.
3. Do not set a build command unless the host requires one. There are no dependencies to install beyond Node itself.
4. Let the host provide `PORT`; `tools/editable-proxy.mjs` reads `process.env.PORT`.
5. Add `shiftora.ai` and `www.shiftora.ai` as custom domains in the hosting provider.
6. Update DNS at your domain registrar:
   - Use the provider's CNAME target for `www`.
   - Use the provider's A/ALIAS/ANAME instructions for the apex `shiftora.ai`.
7. Enable HTTPS in the hosting provider.
8. Test both:
   - `https://shiftora.ai/`
   - `https://shiftora.ai/careers`

## Pre-Deploy Checks

Run:

```bash
npm run check
```

Then verify locally:

```text
http://localhost:8012/?hideSections=1&localReload=host-hardened#features
http://localhost:8012/careers?localReload=host-hardened
```

Expected:

- Home hero shows `Integrate Your Enterrpise With AI`.
- Careers page shows `Frontend Engineer`, `Backend Engineer`, and `Dubai, UAE`.
- Old careers strings like `Forward Deployed Engineer`, `Full Stack Engineer`, and `San Francisco, CA` must not come back after hydration.
- Animations and buttons should remain Framer-native.

## Important Constraint

This is not a static export. If you upload only HTML files to static hosting, the Framer runtime and saved-copy rewriting will break. Use a Node server host.
