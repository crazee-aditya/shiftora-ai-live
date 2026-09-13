import { useEffect, useRef, useState } from 'react';
import { CONCEPT_RECORDS, ESTATE_DOMAINS } from './conceptData';
import CaseStudy from './CaseStudy';
import { activePassage, clamp, passagePosition, PASSAGE_TRAVEL } from './passageMotion';
import './institution-passage.css';

const moments = [
  {
    sentence: 'Shiftora is an integrated strategy and systems firm operating across world governments and enterprises.',
    emphasis: 'world governments and enterprises',
    title: 'World governments',
    caption: 'National movement. Authority across borders.',
    links: ['Sovereign logistics', 'Passage across borders'],
  },
  {
    sentence: 'We order knowledge, operations, and technology as one institutional architecture.',
    emphasis: 'one institutional architecture',
    title: 'Institutional memory',
    caption: 'Intelligence held within the institution.',
    links: ['Institutional memory', 'Intelligence in custody'],
  },
  {
    sentence: 'We advise the course and build the capacity to carry it.',
    emphasis: 'build the capacity',
    title: 'The urban estate',
    caption: 'Land, construction, and commerce, ordered together.',
    links: ['The making of a city'],
  },
  {
    sentence: 'We remain through operation—until the intended result is in force.',
    emphasis: 'the intended result is in force',
    title: 'Capital & commerce',
    caption: 'Capital and live judgment, answerable to strategy.',
    links: ['Capital allocation', 'Live commercial judgment'],
  },
].map((moment, index) => ({ ...moment, ...ESTATE_DOMAINS[index], heading: moment.title,
  artwork: CONCEPT_RECORDS[ESTATE_DOMAINS[index].records[0]].artwork }));

function SentenceWords({ index }: { index: number }) {
  const moment = moments[index];
  const words = moment.sentence.split(' ');
  const start = moment.sentence.slice(0, moment.sentence.indexOf(moment.emphasis)).trim().split(/\s+/).filter(Boolean).length;
  const end = start + moment.emphasis.split(' ').length;
  return <>{words.map((word, wordIndex) => <span key={wordIndex}><span className="passage-word" data-emphasis={wordIndex >= start && wordIndex < end} style={{ '--word-order': wordIndex / Math.max(1, words.length - 1) } as React.CSSProperties}>{word}</span>{wordIndex < words.length - 1 ? ' ' : ''}</span>)}</>;
}

export default function InstitutionPassage({ basePath = '/concepts/estate' }: { basePath?: string }) {
  const section = useRef<HTMLElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  const sentences = useRef<(HTMLButtonElement | null)[]>([]);
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const updateFrame = useRef<() => void>(() => {});
  const activeRef = useRef(0);
  const focusedCaption = useRef<number | null>(null);
  const navigatingTo = useRef<number | null>(null);
  const restoredField = useRef(false);
  const modeRestoreField = useRef<number | null>(null);
  const modeRestoreFocus = useRef<{ field: number; kind: 'choice' | 'record' | 'sentence' | 'index'; number?: string } | null>(null);
  const snapNextFrame = useRef(false);
  const [active, setActive] = useState(0);
  const [selections, setSelections] = useState([0, 0, 0, 0]);
  const [staticMode, setStaticMode] = useState(true);
  const [modeReady, setModeReady] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  function preserveFieldBeforeModeChange(nextStatic: boolean) {
    const root = section.current;
    if (!root || (root.dataset.static === 'true') === nextStatic) return;
    const focused = document.activeElement;
    if (focused instanceof HTMLElement && root.contains(focused)) {
      if (focused.matches('[data-estate-index]')) {
        modeRestoreField.current = null;
        modeRestoreFocus.current = { field: activeRef.current, kind: 'index' };
        return;
      }
      const caseStudy = focused.closest<HTMLElement>('.case-study');
      const fieldId = caseStudy?.dataset.field ?? focused.dataset.passageField;
      const field = moments.findIndex(moment => moment.id === fieldId);
      if (field >= 0) {
        modeRestoreField.current = field;
        modeRestoreFocus.current = {
          field,
          kind: focused.matches('.case-study__previous, .case-study__next') ? 'choice' : caseStudy ? 'record' : 'sentence',
          number: focused.dataset.recordNumber
            ?? caseStudy?.dataset.recordNumber,
        };
        return;
      }
    }
    const bounds = root.getBoundingClientRect();
    const readingLine = window.innerHeight * .4;
    if (bounds.top > readingLine || bounds.bottom < readingLine) return;
    if (nextStatic) modeRestoreField.current = activeRef.current;
    else {
      let closest = 0;
      let distance = Infinity;
      moments.forEach((moment, index) => {
        const article = document.getElementById(`passage-${moment.id}`)?.getBoundingClientRect();
        if (!article) return;
        const candidate = readingLine < article.top ? article.top - readingLine : readingLine > article.bottom ? readingLine - article.bottom : 0;
        if (candidate < distance) { closest = index; distance = candidate; }
      });
      modeRestoreField.current = closest;
    }
  }

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMode = () => {
      const nextStatic = preference.matches || window.innerHeight < 650 || (window.innerWidth <= 700 && window.innerHeight < 740);
      preserveFieldBeforeModeChange(nextStatic);
      setStaticMode(nextStatic);
      setModeReady(true);
    };
    updateMode();
    preference.addEventListener('change', updateMode);
    window.addEventListener('resize', updateMode);
    return () => {
      preference.removeEventListener('change', updateMode);
      window.removeEventListener('resize', updateMode);
    };
  }, []);

  useEffect(() => {
    if (staticMode || !section.current || !scene.current) return;
    let raf = 0;
    let renderedPosition = Number.NaN;
    let lastTime = 0;
    const paint = (time: number) => {
      raf = 0;
      const root = section.current;
      const pin = scene.current;
      if (!root || !pin) return;
      if (pin.scrollHeight > pin.clientHeight + 2) { preserveFieldBeforeModeChange(true); setStaticMode(true); return; }
      const bounds = root.getBoundingClientRect();
      const distance = Math.max(1, root.offsetHeight - pin.offsetHeight);
      const target = focusedCaption.current ?? passagePosition(-bounds.top / distance);
      const elapsed = lastTime ? Math.min(64, time - lastTime) : 16;
      lastTime = time;
      if (!Number.isFinite(renderedPosition) || snapNextFrame.current) renderedPosition = target;
      snapNextFrame.current = false;
      const difference = target - renderedPosition;
      renderedPosition = Math.abs(difference) < .0008 ? target : renderedPosition + difference * (1 - Math.exp(-elapsed / 72));
      const position = renderedPosition;
      const current = activePassage(position, activeRef.current);
      if (navigatingTo.current !== null && Math.abs(position - navigatingTo.current) < .02) navigatingTo.current = null;
      pin.style.setProperty('--passage-position', String(position));
      sentences.current.forEach((sentence, index) => {
        if (!sentence) return;
        sentence.style.setProperty('--sentence-enter', String(clamp(position - index + 1)));
        sentence.style.setProperty('--sentence-exit', String(clamp(position - index)));
      });
      layers.current.forEach((layer, index) => {
        if (!layer) return;
        layer.style.setProperty('--case-enter', String(clamp(position - index + 1)));
        layer.style.setProperty('--case-exit', String(clamp(position - index)));
      });
      if (activeRef.current !== current) {
        activeRef.current = current;
        setActive(current);
      }
      if (Math.abs(target - position) >= .0008) raf = requestAnimationFrame(paint);
    };
    const requestPaint = () => { if (!raf) raf = requestAnimationFrame(paint); };
    const releaseNavigation = () => {
      navigatingTo.current = null;
      // Do not hide the case that still owns keyboard focus when the page scrolls.
      const focused = document.activeElement;
      const ownsFocus = focused instanceof HTMLElement && focused.matches(':focus-visible')
        && layers.current.some(layer => layer?.contains(focused));
      if (!ownsFocus) focusedCaption.current = null;
      requestPaint();
    };
    const finishScroll = () => { navigatingTo.current = null; requestPaint(); };
    const handleScrollKey = (event: KeyboardEvent) => {
      if (['Home', 'End', 'PageUp', 'PageDown', 'ArrowUp', 'ArrowDown'].includes(event.key)) releaseNavigation();
    };
    updateFrame.current = requestPaint;
    const observer = new ResizeObserver(requestPaint);
    observer.observe(section.current);
    observer.observe(scene.current);
    window.addEventListener('scroll', requestPaint, { passive: true });
    window.addEventListener('resize', requestPaint);
    window.addEventListener('wheel', releaseNavigation, { passive: true });
    window.addEventListener('touchstart', releaseNavigation, { passive: true });
    window.addEventListener('scrollend', finishScroll);
    window.addEventListener('keydown', handleScrollKey);
    paint(performance.now());
    return () => {
      focusedCaption.current = null;
      navigatingTo.current = null;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener('scroll', requestPaint);
      window.removeEventListener('resize', requestPaint);
      window.removeEventListener('wheel', releaseNavigation);
      window.removeEventListener('touchstart', releaseNavigation);
      window.removeEventListener('scrollend', finishScroll);
      window.removeEventListener('keydown', handleScrollKey);
      updateFrame.current = () => {};
    };
  }, [staticMode]);

  useEffect(() => {
    if (!modeReady) return;
    // A direct case return takes precedence over layout restoration during hydration.
    if (!restoredField.current) {
      const query = new URLSearchParams(window.location.search);
      const index = moments.findIndex(moment => moment.id === query.get('field'));
      if (index >= 0) {
        const localIndex = moments[index].records.findIndex(recordIndex => CONCEPT_RECORDS[recordIndex].number === query.get('case'));
        const selectedIndex = Math.max(0, localIndex);
        const record = CONCEPT_RECORDS[moments[index].records[selectedIndex]];
        modeRestoreFocus.current = { field: index, kind: 'record', number: record.number };
        setSelections(values => values.map((value, fieldIndex) => fieldIndex === index ? selectedIndex : value));
        const raf = requestAnimationFrame(() => {
          restoredField.current = true;
          modeRestoreField.current = null;
          if (staticMode) document.getElementById(`passage-${moments[index].id}`)?.scrollIntoView({ behavior: 'instant', block: 'start' });
          else moveTo(index, true);
        });
        return () => cancelAnimationFrame(raf);
      }
      restoredField.current = true;
    }
    if (modeRestoreField.current !== null) {
      const index = modeRestoreField.current;
      const raf = requestAnimationFrame(() => {
        modeRestoreField.current = null;
        if (staticMode) document.getElementById(`passage-${moments[index].id}`)?.scrollIntoView({ behavior: 'instant', block: 'start' });
        else moveTo(index, true);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [staticMode, modeReady]);

  useEffect(() => {
    const pending = modeRestoreFocus.current;
    if (!modeReady || !pending || (pending.kind !== 'index' && !staticMode && active !== pending.field)) return;
    const record = CONCEPT_RECORDS[moments[pending.field].records[selections[pending.field]]];
    if (pending.kind === 'record' && pending.number && record.number !== pending.number) return;
    const raf = requestAnimationFrame(() => {
      if (modeRestoreFocus.current !== pending) return;
      // Resolve after the selected record and mode have committed, not from the old tree.
      const field = moments[pending.field].id;
      const container = staticMode ? document.getElementById(`passage-${field}`) : layers.current[pending.field];
      const target = pending.kind === 'index'
        ? section.current?.querySelector<HTMLElement>('[data-estate-index]')
          ?? document.querySelector<HTMLElement>('[data-estate-index]')
        : pending.kind === 'sentence'
          ? (staticMode ? container?.querySelector<HTMLElement>('[data-passage-field]') : sentences.current[pending.field])
          : pending.kind === 'choice'
          ? container?.querySelector<HTMLElement>(`.case-study__controls [data-record-number="${pending.number}"]`)
            ?? container?.querySelector<HTMLElement>('.case-study__link')
            : container?.querySelector<HTMLElement>('.case-study__link');
      if (!target?.isConnected || target.closest('[aria-hidden="true"]')) return;
      if (pending.kind === 'record' && pending.number
        && container?.querySelector<HTMLElement>('.case-study')?.dataset.recordNumber !== pending.number) return;
      if (pending.kind === 'index') target.scrollIntoView({ behavior: 'instant', block: 'nearest' });
      target.focus({ preventScroll: true });
      if (document.activeElement === target) modeRestoreFocus.current = null;
    });
    return () => cancelAnimationFrame(raf);
  }, [staticMode, modeReady, active, selections]);

  function moveTo(index: number, instant = false, announce = !instant) {
    const root = section.current;
    const pin = scene.current;
    if (!root || !pin) return;
    focusedCaption.current = null;
    snapNextFrame.current = instant;
    navigatingTo.current = index;
    if (instant) {
      activeRef.current = index;
      setActive(index);
    }
    const distance = Math.max(1, root.offsetHeight - pin.offsetHeight);
    const top = window.scrollY + root.getBoundingClientRect().top + (index + .15) / PASSAGE_TRAVEL * distance;
    window.scrollTo({ top, behavior: instant ? 'instant' : 'smooth' });
    updateFrame.current();
    if (announce) setAnnouncement(`${moments[index].heading}. ${moments[index].caption}`);
  }

  function selectCase(domainIndex: number, localIndex: number) {
    const selected = clamp(localIndex, 0, moments[domainIndex].records.length - 1);
    setSelections(values => values.map((value, index) => index === domainIndex ? selected : value));
    focusedCaption.current = document.activeElement?.matches(':focus-visible') ? domainIndex : null;
    updateFrame.current();
    const record = CONCEPT_RECORDS[moments[domainIndex].records[selected]];
    setAnnouncement(`${record.title}. Engagement ${selected + 1} of ${moments[domainIndex].records.length} in ${moments[domainIndex].title}.`);
  }

  return <section ref={section} className="institution-passage" id="estate-work" data-static={staticMode} aria-label="The firm and selected engagements">
    <span id="estate-firm" className="passage-start" aria-hidden="true" />
    {staticMode ? <div className="passage-static">
      <div className="passage-top"><h2 className="estate-label">The firm</h2><span className="passage-top__index">Selected engagements</span></div>
      {moments.map((moment, index) => <article id={`passage-${moment.id}`} key={moment.id}>
        <p data-passage-field={moment.id} tabIndex={-1}>{moment.sentence}</p>
        <CaseStudy domainIndex={index} selectedIndex={selections[index]} active staticLinks basePath={basePath} onSelect={localIndex => selectCase(index, localIndex)} />
      </article>)}
    </div> : <div className="passage-scene" ref={scene}>
      <div className="passage-top"><h2 className="estate-label">The firm</h2><span className="passage-top__index" aria-label={`Field ${active + 1} of ${moments.length}`}>{String(active + 1).padStart(2, '0')} / {String(moments.length).padStart(2, '0')}</span></div>
      <div className="passage-composition">
        <div className="passage-thesis">
          <p className="sr-only" id="passage-instructions">Scroll to explore, or select a sentence to view its related engagements.</p>
          <p className="passage-copy" aria-describedby="passage-instructions">{moments.map((moment, index) => <span key={moment.id}><button ref={element => { sentences.current[index] = element; }} type="button" className="passage-sentence" data-passage-field={moment.id} aria-label={moment.sentence} aria-pressed={active === index} aria-controls="passage-visual" onClick={event => moveTo(index, event.detail === 0, true)} style={{ '--sentence-enter': index === 0 ? 1 : 0, '--sentence-exit': 0 } as React.CSSProperties}>
            <SentenceWords index={index} />
          </button>{' '}</span>)}</p>
        </div>
        <div className="passage-visual" id="passage-visual">
          <div className="passage-case-stage" onBlurCapture={event => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) { focusedCaption.current = null; updateFrame.current(); }
          }}>{moments.map((moment, index) => <div ref={element => { layers.current[index] = element; }} key={moment.id} className="passage-case-layer" data-field={moment.id} data-current={active === index} aria-hidden={active !== index} style={{ '--case-enter': index === 0 ? 1 : 0, '--case-exit': 0, pointerEvents: active === index ? 'auto' : 'none' } as React.CSSProperties} onFocusCapture={event => {
            if (!(event.target as HTMLElement).matches(':focus-visible')) return;
            const destination = navigatingTo.current;
            if (destination !== null && destination !== index) {
              const record = CONCEPT_RECORDS[moments[destination].records[selections[destination]]];
              modeRestoreFocus.current = { field: destination, kind: 'record', number: record.number };
              moveTo(destination, true);
              return;
            }
            focusedCaption.current = index;
            updateFrame.current();
          }}>
            <CaseStudy domainIndex={index} selectedIndex={selections[index]} active={active === index} basePath={basePath} onSelect={localIndex => selectCase(index, localIndex)} />
          </div>)}</div>
        </div>
      </div>
      <div className="passage-bottom">
        <span>One institutional architecture.</span>
        {active === 3
          ? <span>The means to act</span>
          : <span>Scroll to continue <span aria-hidden="true">↓</span></span>}
      </div>
    </div>}
    <p className="sr-only" role="status">{announcement}</p>
  </section>;
}
