(() => {
  const PANEL_ID = 'shiftora-image-replacer-panel';
  const STORAGE_KEY = 'shiftora.imageEdits.v1';
  const OUTLINE_ATTRIBUTE = 'data-shiftora-image-target';
  const searchParams = new URLSearchParams(window.location.search);
  const isEditMode = searchParams.has('edit') || searchParams.has('imageEdit');

  if (window.__shiftoraImageReplacerLoaded) return;
  window.__shiftoraImageReplacerLoaded = true;

  const edits = new Map();
  let activeTarget = null;
  let pickMode = false;
  let saveTimer = null;
  let panel = null;
  let status = null;
  let urlInput = null;
  let currentOutput = null;
  let preview = null;
  let targetSelect = null;
  let visibleTargets = [];
  let pendingImageInfo = null;

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

  function normalizeUrl(value) {
    return String(value || '').replace(/^url\(["']?/, '').replace(/["']?\)$/, '').trim();
  }

  function computedBackgroundUrl(element) {
    const image = window.getComputedStyle(element).backgroundImage;
    if (!image || image === 'none' || !image.includes('url(')) return '';
    const match = image.match(/url\((["']?)(.*?)\1\)/);
    return match ? match[2] : normalizeUrl(image);
  }

  function visibleEnough(element) {
    if (!(element instanceof Element)) return false;
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    return rect.width >= 40
      && rect.height >= 40
      && style.display !== 'none'
      && style.visibility !== 'hidden'
      && style.opacity !== '0';
  }

  function imageTargetFromElement(element) {
    if (!(element instanceof Element) || !visibleEnough(element)) return null;
    if (element.closest(`#${PANEL_ID}, #shiftora-text-editor-panel, #shiftora-section-visibility-control`)) return null;

    if (element.tagName === 'IMG') {
      return {
        element,
        type: 'img',
        originalUrl: element.currentSrc || element.getAttribute('src') || '',
        selector: elementSelector(element)
      };
    }

    const backgroundUrl = computedBackgroundUrl(element);
    if (backgroundUrl) {
      return {
        element,
        type: 'background',
        originalUrl: backgroundUrl,
        selector: elementSelector(element)
      };
    }

    return null;
  }

  function targetAtPoint(event) {
    const elements = typeof document.elementsFromPoint === 'function'
      ? document.elementsFromPoint(event.clientX, event.clientY)
      : [event.target];

    for (const element of elements) {
      if (!(element instanceof Element)) continue;

      let current = element;
      let depth = 0;
      while (current && current !== document.body && depth < 8) {
        const target = imageTargetFromElement(current);
        if (target) return target;
        current = current.parentElement;
        depth += 1;
      }
    }

    return null;
  }

  function targetKey(target) {
    return `${target.type}:${target.selector}`;
  }

  function applyReplacement(target, replacementUrl) {
    if (!target?.element || !replacementUrl) return;

    if (target.type === 'img') {
      target.element.removeAttribute('srcset');
      target.element.removeAttribute('sizes');
      target.element.setAttribute('src', replacementUrl);
      target.element.setAttribute('data-shiftora-replaced-image', 'true');
      target.element.setAttribute('decoding', 'async');
      target.element.style.setProperty('image-rendering', 'auto', 'important');
      const picture = target.element.closest('picture');
      if (picture) {
        for (const source of picture.querySelectorAll('source')) {
          source.removeAttribute('srcset');
          source.removeAttribute('sizes');
        }
      }
      return;
    }

    target.element.style.setProperty('background-image', `url("${replacementUrl}")`, 'important');
    target.element.style.setProperty('background-size', 'cover', 'important');
    target.element.style.setProperty('background-position', 'center center', 'important');
    target.element.style.setProperty('background-repeat', 'no-repeat', 'important');
    target.element.setAttribute('data-shiftora-replaced-image', 'true');
  }

  function applyRecord(record) {
    if (!record || typeof record.selector !== 'string' || typeof record.replacementUrl !== 'string') return false;

    let applied = false;
    const element = document.querySelector(record.selector);
    if (element) {
      applyReplacement({
        element,
        type: record.type === 'img' ? 'img' : 'background',
        selector: record.selector,
        originalUrl: record.originalUrl || ''
      }, record.replacementUrl);
      applied = true;
    }

    if (record.originalUrl) {
      for (const target of scanVisibleTargets()) {
        if (normalizeUrl(target.originalUrl) !== normalizeUrl(record.originalUrl)) continue;
        applyReplacement(target, record.replacementUrl);
        applied = true;
      }
    }

    return applied;
  }

  function applySavedImageEdits() {
    for (const record of edits.values()) {
      applyRecord(record);
    }
  }

  function mergeEdits(records) {
    if (!Array.isArray(records)) return;
    for (const record of records) {
      if (!record || typeof record.selector !== 'string' || typeof record.replacementUrl !== 'string') continue;
      const type = record.type === 'img' ? 'img' : 'background';
      edits.set(`${type}:${record.selector}`, {
        selector: record.selector,
        type,
        originalUrl: record.originalUrl || '',
        replacementUrl: record.replacementUrl,
        label: record.label || ''
      });
    }
  }

  function editsAsArray() {
    return Array.from(edits.values());
  }

  function setStatus(message) {
    if (status) status.textContent = message;
  }

  function imageDimensionsFromUrl(url) {
    return new Promise((resolve) => {
      if (!url) {
        resolve(null);
        return;
      }
      const image = new Image();
      image.onload = () => resolve({
        width: image.naturalWidth || 0,
        height: image.naturalHeight || 0
      });
      image.onerror = () => resolve(null);
      image.src = url;
    });
  }

  function targetPixelRequirement(target) {
    if (!target?.element) return null;
    const rect = target.element.getBoundingClientRect();
    const dpr = Math.max(1, Math.round(window.devicePixelRatio || 1));
    return {
      cssWidth: Math.round(rect.width),
      cssHeight: Math.round(rect.height),
      sharpWidth: Math.round(rect.width * dpr),
      sharpHeight: Math.round(rect.height * dpr),
      dpr
    };
  }

  function imageQualityMessage(imageInfo, target) {
    const requirement = targetPixelRequirement(target);
    if (!imageInfo || !requirement) return '';
    const widthRatio = imageInfo.width / Math.max(1, requirement.cssWidth);
    const sharpRatio = imageInfo.width / Math.max(1, requirement.sharpWidth);
    if (sharpRatio >= 1) {
      return `Loaded ${imageInfo.width}x${imageInfo.height}. This is sharp enough for this target at ${requirement.dpr}x.`;
    }
    if (widthRatio >= 1) {
      return `Loaded ${imageInfo.width}x${imageInfo.height}. It fits CSS size, but can look soft on retina; ideal is about ${requirement.sharpWidth}px wide.`;
    }
    return `Loaded ${imageInfo.width}x${imageInfo.height}. Target is about ${requirement.cssWidth}x${requirement.cssHeight}; this will upscale and look blurry. Use ~${requirement.sharpWidth}px wide for sharp output.`;
  }

  function storeLocal() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ edits: editsAsArray() }));
  }

  async function saveFile() {
    storeLocal();
    const response = await fetch('/__save-image-edits', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ edits: editsAsArray() })
    });
    if (!response.ok) throw new Error(`Image save failed: ${response.status}`);
    setStatus(`Saved ${edits.size} image replacement${edits.size === 1 ? '' : 's'} to file.`);
  }

  function scheduleSave() {
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      saveFile().catch((error) => setStatus(`${error.message}. Browser local save still exists.`));
    }, 300);
  }

  function outlineTarget(target) {
    document.querySelectorAll(`[${OUTLINE_ATTRIBUTE}]`).forEach((element) => {
      element.removeAttribute(OUTLINE_ATTRIBUTE);
      element.style.removeProperty('outline');
      element.style.removeProperty('outline-offset');
    });

    if (!target?.element) return;
    target.element.setAttribute(OUTLINE_ATTRIBUTE, 'true');
    target.element.style.setProperty('outline', '3px solid #ffb000', 'important');
    target.element.style.setProperty('outline-offset', '3px', 'important');
  }

  function selectTarget(target) {
    activeTarget = target;
    pendingImageInfo = null;
    outlineTarget(target);

    const saved = edits.get(targetKey(target));
    const currentUrl = saved?.replacementUrl || target.originalUrl || '';
    const requirement = targetPixelRequirement(target);
    urlInput.value = saved?.replacementUrl || '';
    currentOutput.value = [
      `Type: ${target.type}`,
      `Selector: ${target.selector}`,
      requirement ? `Target display: ${requirement.cssWidth}x${requirement.cssHeight} CSS px; sharp target ~${requirement.sharpWidth}x${requirement.sharpHeight}` : '',
      `Current/original: ${target.originalUrl || 'unknown'}`,
      saved ? `Saved replacement: ${saved.replacementUrl}` : 'Saved replacement: none'
    ].filter(Boolean).join('\n');
    preview.src = currentUrl;
    preview.style.display = currentUrl ? 'block' : 'none';
    setStatus('Selected image/background. Paste a URL or upload a file, then Apply.');
  }

  function selectFromClick(event) {
    if (!pickMode) return;
    if (event.target instanceof Element && panel?.contains(event.target)) return;

    const target = targetAtPoint(event);
    if (!target) {
      setStatus('No image/background found at that click. Try clicking directly on the visual area.');
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    pickMode = false;
    panel.querySelector('[data-pick]').textContent = 'Pick image/background';
    selectTarget(target);
  }

  function scanVisibleTargets() {
    const found = [];
    const seen = new Set();
    for (const element of document.querySelectorAll('img, body *')) {
      const target = imageTargetFromElement(element);
      if (!target) continue;
      const key = targetKey(target);
      if (seen.has(key)) continue;
      seen.add(key);
      found.push(target);
    }
    return found;
  }

  function targetLabel(target, index) {
    const rect = target.element.getBoundingClientRect();
    const name = target.element.getAttribute('data-framer-name')
      || target.element.getAttribute('alt')
      || target.element.getAttribute('aria-label')
      || target.element.tagName.toLowerCase();
    return `${index + 1}. ${target.type} ${Math.round(rect.width)}x${Math.round(rect.height)} ${name}`;
  }

  function populateTargetSelect() {
    if (!targetSelect) return;
    visibleTargets = scanVisibleTargets();
    targetSelect.innerHTML = '';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = visibleTargets.length
      ? `Choose from ${visibleTargets.length} detected image/background targets`
      : 'No visible image/background targets found in this view';
    targetSelect.appendChild(placeholder);

    visibleTargets.forEach((target, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = targetLabel(target, index);
      targetSelect.appendChild(option);
    });
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('Could not read file'));
      reader.readAsDataURL(file);
    });
  }

  async function loadSavedEdits() {
    try {
      const local = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"edits":[]}');
      mergeEdits(local.edits);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }

    try {
      const response = await fetch('/__saved-image-edits.json', { cache: 'no-store' });
      if (response.ok) {
        const saved = await response.json();
        mergeEdits(saved.edits);
      }
    } catch {
      // Browser-local image edits still apply.
    }

    applySavedImageEdits();
    window.setTimeout(applySavedImageEdits, 600);
    window.setTimeout(applySavedImageEdits, 1600);
    window.setTimeout(applySavedImageEdits, 3200);
    if (isEditMode && edits.size) {
      setStatus(`Loaded ${edits.size} saved image replacement${edits.size === 1 ? '' : 's'}.`);
    }
  }

  function mountPanel() {
    if (!isEditMode || document.getElementById(PANEL_ID)) return;

    panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.style.cssText = [
      'position:fixed',
      'right:16px',
      'top:96px',
      'z-index:2147483646',
      'width:390px',
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
        <strong>Image replacer</strong>
        <button data-close style="background:#2b2b2b;color:#fff;border:1px solid #555;padding:4px 8px;cursor:pointer">Close</button>
      </div>
      <div data-status style="color:#bbb;margin-bottom:10px">Use Pick, then click a visible image/background.</div>
      <div style="display:flex;gap:8px;margin-bottom:8px">
        <button data-pick style="flex:1;background:#1646ff;color:#fff;border:0;padding:8px;cursor:pointer">Pick image/background</button>
        <button data-scan style="flex:1;background:#2b2b2b;color:#fff;border:1px solid #555;padding:8px;cursor:pointer">Refresh list</button>
      </div>
      <select data-targets style="width:100%;box-sizing:border-box;background:#181818;color:#fff;border:1px solid #555;padding:8px;margin-bottom:8px"></select>
      <input data-url placeholder="Paste image URL or data URL" style="width:100%;box-sizing:border-box;background:#181818;color:#fff;border:1px solid #555;padding:8px;margin-bottom:8px">
      <input data-file type="file" accept="image/*" style="width:100%;box-sizing:border-box;color:#ddd;margin-bottom:8px">
      <div style="display:flex;gap:8px">
        <button data-apply style="flex:1;background:#fff;color:#111;border:0;padding:8px;cursor:pointer">Apply + save</button>
        <button data-undo style="flex:1;background:#2b2b2b;color:#fff;border:1px solid #555;padding:8px;cursor:pointer">Undo selected</button>
      </div>
      <textarea data-current rows="5" readonly style="margin-top:8px;width:100%;box-sizing:border-box;background:#181818;color:#bbb;border:1px solid #555;padding:8px;resize:vertical"></textarea>
      <img data-preview alt="" style="display:none;margin-top:8px;max-width:100%;max-height:130px;object-fit:contain;background:#222">
    `;

    status = panel.querySelector('[data-status]');
    urlInput = panel.querySelector('[data-url]');
    currentOutput = panel.querySelector('[data-current]');
    preview = panel.querySelector('[data-preview]');
    targetSelect = panel.querySelector('[data-targets]');

    panel.querySelector('[data-pick]').addEventListener('click', () => {
      pickMode = !pickMode;
      panel.querySelector('[data-pick]').textContent = pickMode ? 'Click target now...' : 'Pick image/background';
      setStatus(pickMode ? 'Click the image/background you want to replace.' : 'Pick cancelled.');
    });

    panel.querySelector('[data-scan]').addEventListener('click', () => {
      populateTargetSelect();
      setStatus(`Found ${visibleTargets.length} visible image/background target${visibleTargets.length === 1 ? '' : 's'} on this view.`);
    });

    targetSelect.addEventListener('change', () => {
      const index = Number(targetSelect.value);
      const target = Number.isInteger(index) ? visibleTargets[index] : null;
      if (!target) return;
      selectTarget(target);
    });

    panel.querySelector('[data-file]').addEventListener('change', async (event) => {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      try {
        const dataUrl = await fileToDataUrl(file);
        pendingImageInfo = await imageDimensionsFromUrl(dataUrl);
        urlInput.value = dataUrl;
        preview.src = dataUrl;
        preview.style.display = 'block';
        const quality = imageQualityMessage(pendingImageInfo, activeTarget);
        setStatus(`${file.name}: ${quality || 'loaded. Click Apply + save.'}`);
      } catch (error) {
        setStatus(error.message);
      }
    });

    panel.querySelector('[data-apply]').addEventListener('click', () => {
      if (!activeTarget) {
        setStatus('Pick an image/background first.');
        return;
      }
      const replacementUrl = urlInput.value.trim();
      if (!replacementUrl) {
        setStatus('Paste a URL or upload a file first.');
        return;
      }

      const record = {
        selector: activeTarget.selector,
        type: activeTarget.type,
        originalUrl: activeTarget.originalUrl,
        replacementUrl,
        label: document.title || location.pathname
      };
      edits.set(targetKey(activeTarget), record);
      applyRecord(record);
      preview.src = replacementUrl;
      preview.style.display = 'block';
      scheduleSave();
      const quality = imageQualityMessage(pendingImageInfo, activeTarget);
      setStatus(quality ? `Applied. ${quality} Auto-saving...` : 'Applied. Auto-saving...');
    });

    panel.querySelector('[data-undo]').addEventListener('click', () => {
      if (!activeTarget) {
        setStatus('Pick an image/background first.');
        return;
      }
      edits.delete(targetKey(activeTarget));
      if (activeTarget.type === 'img') {
        activeTarget.element.setAttribute('src', activeTarget.originalUrl);
      } else {
        activeTarget.element.style.removeProperty('background-image');
      }
      urlInput.value = '';
      preview.src = activeTarget.originalUrl || '';
      preview.style.display = activeTarget.originalUrl ? 'block' : 'none';
      scheduleSave();
      setStatus('Removed saved replacement for selected target.');
    });

    panel.querySelector('[data-close]').addEventListener('click', () => {
      pickMode = false;
      outlineTarget(null);
      panel.remove();
      panel = null;
    });

    document.body.appendChild(panel);
    populateTargetSelect();
  }

  document.addEventListener('pointerdown', selectFromClick, true);
  document.addEventListener('click', selectFromClick, true);
  mountPanel();
  loadSavedEdits();
})();
