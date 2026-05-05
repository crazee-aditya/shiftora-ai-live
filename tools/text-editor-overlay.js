(() => {
  const PANEL_ID = 'shiftora-text-editor-panel';
  const STORAGE_KEY = 'shiftora.textEdits.v2';
  const SNAPSHOT_STORAGE_KEY = 'shiftora.pageSnapshot.v1';
  const existing = document.getElementById(PANEL_ID);
  if (existing) {
    existing.remove();
  }

  const edits = new Map();
  let activeElement = null;
  let saveTimer = null;

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.style.cssText = [
    'position:fixed',
    'right:16px',
    'bottom:16px',
    'z-index:2147483647',
    'width:380px',
    'max-width:calc(100vw - 32px)',
    'background:#101010',
    'color:#fff',
    'font:13px/1.4 Arial,sans-serif',
    'border:1px solid #3a3a3a',
    'box-shadow:0 18px 60px rgba(0,0,0,.35)',
    'padding:12px'
  ].join(';');

  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px">
      <strong>Text editor</strong>
      <button data-close style="background:#2b2b2b;color:#fff;border:1px solid #555;padding:4px 8px;cursor:pointer">Close</button>
    </div>
    <div data-status style="color:#bbb;margin-bottom:10px">Click visible text. Changes auto-save locally and to this folder.</div>
    <textarea data-editor rows="5" style="width:100%;box-sizing:border-box;background:#181818;color:#fff;border:1px solid #555;padding:8px;resize:vertical"></textarea>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button data-apply style="flex:1;background:#1646ff;color:#fff;border:0;padding:8px;cursor:pointer">Apply</button>
      <button data-save style="flex:1;background:#2b2b2b;color:#fff;border:1px solid #555;padding:8px;cursor:pointer">Save file</button>
      <button data-export style="flex:1;background:#2b2b2b;color:#fff;border:1px solid #555;padding:8px;cursor:pointer">JSON</button>
    </div>
    <button data-snapshot style="margin-top:8px;width:100%;background:#2b2b2b;color:#fff;border:1px solid #555;padding:8px;cursor:pointer">Save current page text snapshot</button>
    <textarea data-output rows="5" readonly style="display:none;margin-top:10px;width:100%;box-sizing:border-box;background:#181818;color:#fff;border:1px solid #555;padding:8px;resize:vertical"></textarea>
  `;

  const editor = panel.querySelector('[data-editor]');
  const output = panel.querySelector('[data-output]');
  const status = panel.querySelector('[data-status]');
  const directTextSelector = 'h1,h2,h3,h4,h5,h6,p,a,button,li';

  function normalizedText(element) {
    return (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function isVisible(element) {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
  }

  function hasUsableText(element) {
    const text = normalizedText(element);
    return text.length > 0 && text.length <= 600 && isVisible(element);
  }

  function looksLikeSingleTextBlock(element) {
    if (!hasUsableText(element)) return false;
    if (element.matches('svg,canvas,img,video,section,main,nav,header,footer')) return false;

    const text = normalizedText(element);
    const directBlockChildren = Array.from(element.children).filter((child) => {
      if (!normalizedText(child)) return false;
      const display = window.getComputedStyle(child).display;
      return display.includes('flex') || display.includes('grid') || display === 'block';
    });

    if (directBlockChildren.length > 1) return false;
    return text.length <= 600 || element.matches('[class*="framer-text"], [data-framer-name]');
  }

  function isSafeSnapshotTarget(element) {
    if (!hasUsableText(element)) return false;
    if (element.matches('h1,h2,h3,h4,h5,h6,p')) return true;
    return element.matches('span,div') && element.children.length === 0;
  }

  function getEditableElement(target) {
    const path = typeof target.composedPath === 'function' ? target.composedPath() : [];

    const directTextCandidate = path.find((item) => {
      return item instanceof Element
        && !panel.contains(item)
        && item.matches(directTextSelector)
        && hasUsableText(item);
    });
    if (directTextCandidate) return directTextCandidate;

    const leafCandidate = path.find((item) => {
      return item instanceof Element
        && !panel.contains(item)
        && item.matches('span,div')
        && looksLikeSingleTextBlock(item);
    });
    if (!leafCandidate) return null;

    const parentTextBlock = leafCandidate.closest(directTextSelector);
    if (parentTextBlock && !panel.contains(parentTextBlock) && hasUsableText(parentTextBlock)) {
      return parentTextBlock;
    }

    return leafCandidate;
  }

  function getEditableElementAtPoint(event) {
    if (typeof document.elementsFromPoint !== 'function') {
      return getEditableElement(event.target);
    }

    const elements = document.elementsFromPoint(event.clientX, event.clientY);
    for (const element of elements) {
      if (!(element instanceof Element) || panel.contains(element)) continue;

      const exact = getEditableElement(element);
      if (exact) return exact;

      const parentTextBlock = element.closest(directTextSelector);
      if (parentTextBlock && !panel.contains(parentTextBlock) && hasUsableText(parentTextBlock)) {
        return parentTextBlock;
      }
    }

    return getEditableElement(event.target);
  }

  function legacyGetEditableElement(target) {
    const path = typeof target.composedPath === 'function' ? target.composedPath() : [];

    for (const item of path) {
      if (!(item instanceof Element) || panel.contains(item)) continue;
      if (item.matches(directTextSelector) && hasUsableText(item)) return item;
    }

    for (const item of path) {
      if (!(item instanceof Element) || panel.contains(item)) continue;
      if (item.matches('span,div') && looksLikeSingleTextBlock(item)) return item;
    }

    return null;
  }

  function editsAsArray() {
    return Array.from(edits, ([from, to]) => ({ from, to }));
  }

  function setStatus(message) {
    status.textContent = message;
  }

  function storeLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ edits: editsAsArray() }));
  }

  function cssEscape(value) {
    if (window.CSS && typeof window.CSS.escape === 'function') {
      return window.CSS.escape(value);
    }
    return value.replace(/["\\]/g, '\\$&');
  }

  function elementSelector(element) {
    const parts = [];
    let current = element;

    while (current && current.nodeType === Node.ELEMENT_NODE && current !== document.body) {
      let part = current.tagName.toLowerCase();
      if (current.id && current.id !== PANEL_ID) {
        part += `#${cssEscape(current.id)}`;
        parts.unshift(part);
        break;
      }

      const parent = current.parentElement;
      if (!parent) break;
      const siblings = Array.from(parent.children).filter((sibling) => sibling.tagName === current.tagName);
      if (siblings.length > 1) {
        part += `:nth-of-type(${siblings.indexOf(current) + 1})`;
      }
      parts.unshift(part);
      current = parent;
    }

    return parts[0]?.includes('#') ? parts.join('>') : `body>${parts.join('>')}`;
  }

  function textElements() {
    return Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,a,button,li,span,div'))
      .filter((element) => !panel.contains(element) && isSafeSnapshotTarget(element));
  }

  function snapshotElements() {
    const candidates = textElements();
    const seen = new Set();

    return candidates
      .map((element) => ({
        selector: elementSelector(element),
        text: element.textContent.trim(),
        normalizedText: normalizedText(element)
      }))
      .filter((item) => {
        const key = `${item.selector}\n${item.normalizedText}`;
        if (!item.normalizedText || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  async function savePageSnapshot() {
    const snapshot = {
      url: location.href,
      items: snapshotElements()
    };
    localStorage.setItem(SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
    const response = await fetch('/__save-page-snapshot', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(snapshot)
    });
    if (!response.ok) {
      throw new Error(`Snapshot save failed: ${response.status}`);
    }
    setStatus(`Saved page snapshot with ${snapshot.items.length} text blocks.`);
  }

  async function saveFile() {
    storeLocal();
    const response = await fetch('/__save-text-edits', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ edits: editsAsArray() })
    });
    if (!response.ok) {
      throw new Error(`Save failed: ${response.status}`);
    }
    setStatus(`Saved ${edits.size} edit${edits.size === 1 ? '' : 's'} to file.`);
  }

  function scheduleSave() {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      saveFile().catch((error) => {
        setStatus(`${error.message}. Local browser save still exists.`);
      });
    }, 300);
  }

  function mergeEdits(records) {
    if (!Array.isArray(records)) return;
    for (const record of records) {
      if (!record || typeof record.from !== 'string' || typeof record.to !== 'string') continue;
      if (record.from && record.from !== record.to) edits.set(record.from, record.to);
    }
  }

  function applySavedEdits() {
    if (!edits.size) return;
    for (const element of textElements()) {
      const current = normalizedText(element);
      if (edits.has(current)) {
        element.dataset.shiftoraOriginalText ||= current;
        element.textContent = edits.get(current);
      }
    }
  }

  function applyPageSnapshotItems(items) {
    if (!Array.isArray(items) || !items.length) return;
    let applied = 0;
    const safeItems = items.filter((item) => {
      if (!item || typeof item.selector !== 'string' || typeof item.text !== 'string') return false;
      const lastPart = item.selector.split('>').at(-1) || '';
      return /^(p|h[1-6]|span|div)(:nth-of-type\(\d+\))?$/.test(lastPart);
    });

    function findSnapshotElement(selector) {
      const candidates = [
        selector,
        selector.replace(/^body>/, ''),
        selector.replaceAll('>div>nav', '>nav'),
        selector.replace(/^body>/, '').replaceAll('>div>nav', '>nav')
      ];

      for (const candidate of candidates) {
        const element = document.querySelector(candidate);
        if (element) return element;
      }
      return null;
    }

    for (let index = 0; index < safeItems.length; index += 1) {
      const item = safeItems[index];
      if (!item || typeof item.selector !== 'string' || typeof item.text !== 'string') continue;

      const element = findSnapshotElement(item.selector);

      if (!element || panel.contains(element) || !isSafeSnapshotTarget(element)) continue;
      element.textContent = item.text;
      applied += 1;
    }
    if (applied) {
      setStatus(`Re-applied ${applied} saved text block${applied === 1 ? '' : 's'}.`);
    }
  }

  async function loadPageSnapshot() {
    try {
      const local = JSON.parse(localStorage.getItem(SNAPSHOT_STORAGE_KEY) || '{"items":[]}');
      applyPageSnapshotItems(local.items);
    } catch {
      localStorage.removeItem(SNAPSHOT_STORAGE_KEY);
    }

    try {
      const response = await fetch('/__page-snapshot.json', { cache: 'no-store' });
      if (response.ok) {
        const saved = await response.json();
        applyPageSnapshotItems(saved.items);
      }
    } catch {
      // Text replacement pairs are still loaded separately.
    }
  }

  async function loadSavedEdits() {
    try {
      const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"edits":[]}');
      mergeEdits(local.edits);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }

    try {
      const response = await fetch('/__saved-text-edits.json', { cache: 'no-store' });
      if (response.ok) {
        const saved = await response.json();
        mergeEdits(saved.edits);
      }
    } catch {
      // File persistence is optional; localStorage still protects browser edits.
    }

    applySavedEdits();
    window.setTimeout(applySavedEdits, 1200);
    loadPageSnapshot();
    window.setTimeout(loadPageSnapshot, 1200);
    setStatus(edits.size ? `Loaded ${edits.size} saved edit${edits.size === 1 ? '' : 's'}.` : 'Click visible text. Changes auto-save locally and to this folder.');
  }

  function selectText(event) {
    if (event.target instanceof Element && panel.contains(event.target)) return;
    const element = getEditableElementAtPoint(event) || legacyGetEditableElement(event.target);
    if (!element) return;
    event.preventDefault();
    event.stopPropagation();

    if (activeElement) {
      activeElement.style.outline = '';
      activeElement.style.outlineOffset = '';
    }

    activeElement = element;
    activeElement.dataset.shiftoraOriginalText ||= normalizedText(activeElement);
    activeElement.style.outline = '2px solid #1646ff';
    activeElement.style.outlineOffset = '2px';
    editor.value = activeElement.textContent.trim();
    setStatus('Selected text block. Edit below, then Apply.');
  }

  function closePanel() {
    document.removeEventListener('pointerdown', selectText, true);
    document.removeEventListener('click', selectText, true);
    if (activeElement) {
      activeElement.style.outline = '';
      activeElement.style.outlineOffset = '';
    }
    panel.remove();
  }

  document.addEventListener('pointerdown', selectText, true);
  document.addEventListener('click', selectText, true);

  panel.querySelector('[data-apply]').addEventListener('click', () => {
    if (!activeElement) return;
    const before = activeElement.dataset.shiftoraOriginalText || normalizedText(activeElement);
    const after = editor.value.trim();
    activeElement.textContent = after;
    edits.set(before, after);
    scheduleSave();
    window.setTimeout(() => {
      savePageSnapshot().catch(() => {
        // Pair-based text edits are still saved by scheduleSave().
      });
    }, 500);
    setStatus('Applied. Auto-saving...');
  });

  panel.querySelector('[data-save]').addEventListener('click', () => {
    saveFile().catch((error) => {
      setStatus(`${error.message}. Local browser save still exists.`);
    });
  });

  panel.querySelector('[data-export]').addEventListener('click', () => {
    output.style.display = 'block';
    output.value = JSON.stringify(editsAsArray(), null, 2);
    output.focus();
    output.select();
  });

  panel.querySelector('[data-snapshot]').addEventListener('click', () => {
    savePageSnapshot().catch((error) => {
      setStatus(`${error.message}. Local browser snapshot still exists.`);
    });
  });

  panel.querySelector('[data-close]').addEventListener('click', closePanel);
  document.body.appendChild(panel);
  loadSavedEdits();
})();
