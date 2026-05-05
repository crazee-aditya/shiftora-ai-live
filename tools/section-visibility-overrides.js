(() => {
  const STORAGE_KEY = 'shiftora.showHiddenSections';
  const HIDE_ATTRIBUTE = 'data-shiftora-hidden-section';
  const HIDDEN_SECTION_SELECTORS = [
    'section#agents',
    'section#integration',
    'section#case-studies',
    'section#book',
    'footer',
    '[data-framer-name="CTA Footer Section"]'
  ];
  const HIDDEN_NAV_LINK_SELECTORS = [
    'nav a[href$="#agents"]',
    'nav a[href$="#case-studies"]',
    'nav a[href$="#faq"]'
  ];
  const HIDDEN_TEXT_SECTION_HEADINGS = [
    "Partnering with the Industry's Best",
    'Built by engineers from'
  ];

  const params = new URLSearchParams(window.location.search);
  if (params.has('showHidden')) {
    localStorage.setItem(STORAGE_KEY, '1');
  }
  if (params.has('hideSections')) {
    localStorage.removeItem(STORAGE_KEY);
  }

  const shouldShowHidden = localStorage.getItem(STORAGE_KEY) === '1';

  function normalizedText(element) {
    return (element.innerText || element.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function hideElement(element) {
    if (!element || element.dataset.shiftoraVisibilityLocked === '1') return;
    element.setAttribute(HIDE_ATTRIBUTE, 'true');
    element.style.setProperty('display', 'none', 'important');
  }

  function showElement(element) {
    if (!element) return;
    element.removeAttribute(HIDE_ATTRIBUTE);
    element.style.removeProperty('display');
  }

  function navWrapperFor(anchor) {
    const linkText = normalizedText(anchor);
    let current = anchor;

    while (current.parentElement && current.parentElement.tagName !== 'NAV') {
      const parent = current.parentElement;
      if (normalizedText(parent) !== linkText) break;
      current = parent;
    }

    return current;
  }

  function sectionWrapperForText(element) {
    const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const text = normalizedText(element);
    let current = element;
    let best = null;

    while (current && current !== document.body && current !== document.documentElement) {
      const rect = current.getBoundingClientRect();
      const currentText = normalizedText(current);
      const isWideSection = rect.width >= viewportWidth * 0.6;
      const isSectionHeight = rect.height >= 80 && rect.height <= 700;

      if (currentText.includes(text) && isWideSection && isSectionHeight) {
        best = current;
      }

      if (current.tagName === 'SECTION') {
        return current;
      }

      current = current.parentElement;
    }

    return best || element;
  }

  function textSectionTargets() {
    const targets = [];
    for (const heading of HIDDEN_TEXT_SECTION_HEADINGS) {
      for (const element of document.querySelectorAll('body *')) {
        if (normalizedText(element) === heading) {
          targets.push(sectionWrapperForText(element));
        }
      }
    }
    return targets;
  }

  function applyVisibility() {
    const sectionTargets = HIDDEN_SECTION_SELECTORS.flatMap((selector) => {
      return Array.from(document.querySelectorAll(selector));
    });
    const navTargets = HIDDEN_NAV_LINK_SELECTORS.flatMap((selector) => {
      return Array.from(document.querySelectorAll(selector)).map(navWrapperFor);
    });
    const targets = [...new Set([...sectionTargets, ...textSectionTargets(), ...navTargets])];

    if (shouldShowHidden) {
      for (const element of document.querySelectorAll(`[${HIDE_ATTRIBUTE}]`)) {
        showElement(element);
      }
      return;
    }

    for (const element of targets) {
      hideElement(element);
    }
  }

  function mountUndoControl() {
    if (!params.has('edit') || document.getElementById('shiftora-section-visibility-control')) return;

    const control = document.createElement('div');
    control.id = 'shiftora-section-visibility-control';
    control.style.cssText = [
      'position:fixed',
      'left:16px',
      'bottom:16px',
      'z-index:2147483646',
      'display:flex',
      'gap:8px',
      'align-items:center',
      'background:#101010',
      'color:#fff',
      'font:12px/1.3 Arial,sans-serif',
      'border:1px solid #444',
      'box-shadow:0 12px 40px rgba(0,0,0,.25)',
      'padding:8px'
    ].join(';');

    const status = shouldShowHidden ? 'Hidden sections: shown' : 'Hidden sections: removed';
    const nextUrl = new URL(window.location.href);
    if (shouldShowHidden) {
      nextUrl.searchParams.delete('showHidden');
      nextUrl.searchParams.set('hideSections', '1');
    } else {
      nextUrl.searchParams.delete('hideSections');
      nextUrl.searchParams.set('showHidden', '1');
    }

    control.innerHTML = `
      <span>${status}</span>
      <a href="${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}" style="color:#fff;background:#1646ff;text-decoration:none;padding:6px 8px">Undo/show</a>
    `;
    if (shouldShowHidden) {
      control.querySelector('a').textContent = 'Hide again';
    }
    document.body.appendChild(control);
  }

  applyVisibility();
  mountUndoControl();
  window.addEventListener('load', () => {
    applyVisibility();
    mountUndoControl();
  });
  window.setTimeout(applyVisibility, 600);
  window.setTimeout(applyVisibility, 1600);
  window.setTimeout(applyVisibility, 3200);

  const observer = new MutationObserver(() => applyVisibility());
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
