(() => {
  const BOOKING_URL = 'https://cal.com/aditya-sinha-2bryjz/15min';
  const AUDIT_URL = 'https://form.typeform.com/to/B30PNGww';
  const AUDIT_CTA_TEXT = 'Audit your Enterprise';

  function normalize(value = '') {
    return String(value)
      .replace(/\u2026/g, '...')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
  }

  function elementSignal(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return '';
    return normalize([
      element.textContent || '',
      element.getAttribute('href') || '',
      element.getAttribute('aria-label') || '',
      element.getAttribute('title') || '',
      element.getAttribute('data-framer-name') || '',
      element.getAttribute('data-shiftora-destination') || ''
    ].join(' '));
  }

  function isAuditSignal(signal) {
    return signal.includes('audit your enterprise') ||
      signal.includes('case study') ||
      signal.includes('case studies') ||
      signal.includes('selected work') ||
      signal.includes('case-stud') ||
      signal.includes('#case-studies') ||
      signal.includes('form.typeform.com') ||
      signal.includes('typeform.com/to/b30pngww');
  }

  function isBookingSignal(signal) {
    return signal.includes('book a call') ||
      signal.includes('book a discovery call') ||
      signal.includes('learn more') ||
      signal.includes('cal.com') ||
      signal.includes('discovery-call');
  }

  function isInternalNavigationSignal(signal) {
    return signal.includes('/careers') ||
      signal === 'careers' ||
      signal.includes('#features') ||
      signal.includes('#faq') ||
      signal.includes('#hero-section') ||
      signal.includes('how it works');
  }

  function isSafeCandidate(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;
    if (['HTML', 'BODY'].includes(element.tagName)) return false;
    if (element.closest('#shiftora-text-editor-panel, #shiftora-image-replacer-panel')) return false;
    const tag = element.tagName;
    if (tag === 'A' || tag === 'BUTTON') return true;
    if (element.getAttribute('role') === 'button') return true;
    if (element.hasAttribute('href') || element.hasAttribute('onclick')) return true;
    if (element.hasAttribute('data-shiftora-destination')) return true;
    if (element.hasAttribute('data-framer-name') && elementSignal(element).length < 260) return true;
    const tabIndex = element.getAttribute('tabindex');
    if (tabIndex !== null && tabIndex !== '-1') return true;
    return window.getComputedStyle(element).cursor === 'pointer';
  }

  function forceDestination(element, url) {
    element.setAttribute('data-shiftora-destination', url);
    if (element.tagName === 'A') {
      element.setAttribute('href', url);
      element.setAttribute('target', '_blank');
      element.setAttribute('rel', 'noopener');
    }
  }

  function restoreInternalNavigation(element, signal) {
    element.removeAttribute('data-shiftora-destination');
    if (element.tagName !== 'A') return;
    element.removeAttribute('target');
    element.removeAttribute('rel');
    if (signal === 'careers' || signal.includes('/careers')) element.setAttribute('href', '/careers');
    if (signal.includes('how it works') || signal.includes('#features')) element.setAttribute('href', '/#features');
  }

  function updateAuditLabel(root) {
    const labels = root.matches?.('h1,h2,h3,h4,h5,h6,p,a,button,span') ? [root] : [];
    labels.push(...root.querySelectorAll?.('h1,h2,h3,h4,h5,h6,p,a,button,span') || []);
    labels.forEach((element) => {
      const text = normalize(element.textContent);
      if (!isAuditSignal(text)) return;
      if (text === normalize(AUDIT_CTA_TEXT)) return;
      if ((element.textContent || '').trim().length > 40) return;
      element.textContent = AUDIT_CTA_TEXT;
    });
  }

  function rewriteDestinations() {
    document.querySelectorAll('a,button,[role="button"],[tabindex],[data-framer-name]').forEach((element) => {
      if (!isSafeCandidate(element)) return;
      const signal = elementSignal(element);
      if (isInternalNavigationSignal(signal)) {
        restoreInternalNavigation(element, signal);
        return;
      }
      if (!element.hasAttribute('href') && !element.hasAttribute('data-shiftora-destination') && signal.length > 120) return;
      if (isAuditSignal(signal)) {
        forceDestination(element, AUDIT_URL);
        updateAuditLabel(element);
        return;
      }
      if (isBookingSignal(signal)) forceDestination(element, BOOKING_URL);
    });
  }

  function classifyEvent(event) {
    const path = event.composedPath ? event.composedPath() : [];
    const elements = path
      .filter((node) => node && node.nodeType === Node.ELEMENT_NODE)
      .filter((element) => !['HTML', 'BODY'].includes(element.tagName))
      .slice(0, 16);

    const candidate = elements.find((element) => isSafeCandidate(element));
    if (!candidate) return null;
    const signal = elementSignal(candidate);
    if (isInternalNavigationSignal(signal)) return null;

    const destination = candidate.getAttribute('data-shiftora-destination');
    if (destination === AUDIT_URL || destination === BOOKING_URL) return destination;

    if (isAuditSignal(signal)) return AUDIT_URL;
    if (isBookingSignal(signal)) return BOOKING_URL;
    return null;
  }

  let suppressUntil = 0;
  let suppressDestination = '';

  function openExternal(url) {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.style.position = 'fixed';
    anchor.style.left = '-9999px';
    anchor.style.top = '-9999px';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  }

  function routeEvent(event) {
    const destination = classifyEvent(event);
    if (!destination) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const now = Date.now();
    if (event.type !== 'click' && event.type !== 'auxclick') {
      suppressUntil = now + 1200;
      suppressDestination = destination;
      openExternal(destination);
      return;
    }

    if (now < suppressUntil && suppressDestination === destination) return;
    openExternal(destination);
  }

  rewriteDestinations();
  ['pointerdown', 'mousedown', 'touchstart', 'click', 'auxclick'].forEach((type) => {
    window.addEventListener(type, routeEvent, true);
    document.addEventListener(type, routeEvent, true);
  });

  window.addEventListener('load', () => {
    [100, 500, 1600, 3200, 6000].forEach((delay) => window.setTimeout(rewriteDestinations, delay));
  });

  let timer = null;
  const observer = new MutationObserver(() => {
    window.clearTimeout(timer);
    timer = window.setTimeout(rewriteDestinations, 80);
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['href', 'data-framer-name', 'aria-label', 'data-shiftora-destination']
  });
})();
