# Shiftora typography

The approved visual master is the rendering reviewed in the 665 × 767 Codex browser view. That
view resolves to **Helvetica Neue**, so the production CSS names Helvetica Neue explicitly for both
display and text roles:

```css
font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
```

No commercial font files are bundled or distributed by this repository. Apple platforms render the
master with the operating-system Helvetica Neue installation. Platforms without Helvetica Neue use
Helvetica or Arial as the declared compatibility fallbacks.

The release policy rejects undeclared webfonts and rejects references to Söhne or Alliance No. 2
unless a future, separately approved change introduces properly licensed assets. It also verifies
that representative wordmark, display, paragraph, and label roles resolve to the approved first
family and that the committed brand sources and PNG outputs match their provenance record.

Run `npm run brand:build-assets` on the approved design machine after changing a brand SVG. Run
`npm run verify:release` before publication. Railway runs `npm run verify:deploy`, which repeats the
production-safe build, security, dependency, typography, and brand-asset checks without requiring a
desktop browser inside the build container.
