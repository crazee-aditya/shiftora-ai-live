(() => {
  if (window.__shiftoraPageSnapshotReplayLoaded) return;
  window.__shiftoraPageSnapshotReplayLoaded = true;

  function normalizedText(element) {
    return (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function visible(element) {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
  }

  function isSafeTarget(element) {
    if (!(element instanceof Element)) return false;
    if (element.closest('#shiftora-text-editor-panel, #shiftora-image-replacer-panel, #shiftora-section-visibility-control')) return false;
    if (!visible(element)) return false;
    if (element.matches('h1,h2,h3,h4,h5,h6,p,a,button')) return true;
    return element.matches('span,div') && element.children.length === 0 && normalizedText(element).length <= 600;
  }

  function candidatesFor(selector) {
    return [
      selector,
      selector.replace(/^body>/, ''),
      selector.replaceAll('>div>nav', '>nav'),
      selector.replace(/^body>/, '').replaceAll('>div>nav', '>nav')
    ];
  }

  function findElement(selector) {
    for (const candidate of candidatesFor(selector)) {
      try {
        const element = document.querySelector(candidate);
        if (element) return element;
      } catch {
        // Ignore selectors that no longer match the hydrated Framer DOM.
      }
    }
    return null;
  }

  function textTargets() {
    return Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,a,button,li,span,div'))
      .filter(isSafeTarget);
  }

  async function loadTextEdits() {
    const response = await fetch('/__saved-text-edits.json', { cache: 'no-store' });
    if (!response.ok) return [];
    const payload = await response.json();
    return Array.isArray(payload.edits) ? payload.edits : [];
  }

  function applyTextEditPairs(edits) {
    if (!Array.isArray(edits) || !edits.length) return 0;

    const pairs = new Map();
    for (const edit of edits) {
      if (!edit || typeof edit.from !== 'string' || typeof edit.to !== 'string') continue;
      const from = edit.from.replace(/\s+/g, ' ').trim();
      if (!from || from === edit.to.replace(/\s+/g, ' ').trim()) continue;
      pairs.set(from, edit.to);
    }

    let applied = 0;
    for (const element of textTargets()) {
      const current = normalizedText(element);
      if (!pairs.has(current)) continue;
      element.textContent = pairs.get(current);
      applied += 1;
    }
    return applied;
  }

  async function replay() {
    const [snapshotResponse, textEdits] = await Promise.all([
      fetch('/__page-snapshot.json', { cache: 'no-store' }),
      loadTextEdits().catch(() => [])
    ]);

    let snapshot = { items: [] };
    if (snapshotResponse.ok) {
      snapshot = await snapshotResponse.json();
    }
    const items = Array.isArray(snapshot.items) ? snapshot.items : [];
    let snapshotApplied = 0;

    for (const item of items) {
      if (!item || typeof item.selector !== 'string' || typeof item.text !== 'string') continue;
      const lastPart = item.selector.split('>').at(-1) || '';
      if (!/^(a|button|p|h[1-6]|span|div)(:nth-of-type\(\d+\))?$/.test(lastPart)) continue;

      const element = findElement(item.selector);
      if (!element || !isSafeTarget(element)) continue;

      if (element.textContent !== item.text) {
        element.textContent = item.text;
      }
      snapshotApplied += 1;
    }

    const pairApplied = applyTextEditPairs(textEdits);
    window.__shiftoraPageSnapshotReplay = {
      snapshotApplied,
      pairApplied,
      totalSnapshotItems: items.length,
      totalTextEdits: textEdits.length
    };
  }

  let replayTimer = null;
  function scheduleReplay(delay = 80) {
    window.clearTimeout(replayTimer);
    replayTimer = window.setTimeout(() => replay().catch(() => {}), delay);
  }

  replay().catch(() => {});
  window.addEventListener('load', () => scheduleReplay());
  window.setTimeout(() => scheduleReplay(), 500);
  window.setTimeout(() => scheduleReplay(), 1600);
  window.setTimeout(() => scheduleReplay(), 3200);
  window.setTimeout(() => scheduleReplay(), 6000);

  const observer = new MutationObserver(() => scheduleReplay(120));
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true
  });
})();
