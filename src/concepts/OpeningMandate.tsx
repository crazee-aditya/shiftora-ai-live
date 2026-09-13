import { useEffect, useRef } from 'react';
import { ESTATE_OPENING_HEADLINE } from '../content';
import './opening-mandate.css';

export default function OpeningMandate() {
  const section = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const root = section.current;
    const title = heading.current;
    if (!root || !title) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;
    const paint = () => {
      frame = 0;
      const progress = reduced.matches ? 0 : Math.max(0, Math.min(1, -root.getBoundingClientRect().top / (window.innerHeight * .55)));
      root.style.setProperty('--mandate-progress', String(progress));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const measure = () => {
      const first = title.children[0] as HTMLElement;
      const last = title.children[1] as HTMLElement;
      const sameLine = Math.abs(first.offsetTop - last.offsetTop) < 2;
      const space = parseFloat(getComputedStyle(title).fontSize) * .3;
      const distance = sameLine ? Math.max(0, (last.offsetLeft - first.offsetLeft - first.offsetWidth - space) / 2) : 0;
      root.style.setProperty('--mandate-distance', `${distance}px`);
      schedule();
    };
    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure);
    reduced.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', measure);
      reduced.removeEventListener('change', schedule);
    };
  }, []);

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 700px)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mobile.matches || reduced.matches || window.scrollY > 2 || window.location.hash) return;

    let animation = 0;
    let cancelled = false;
    const cancel = () => {
      cancelled = true;
      cancelAnimationFrame(animation);
    };
    const start = window.setTimeout(() => {
      const origin = window.scrollY;
      const destination = Math.min(20, document.documentElement.scrollHeight - window.innerHeight);
      const duration = 820;
      const startedAt = performance.now();
      const advance = (now: number) => {
        if (cancelled) return;
        const elapsed = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - Math.pow(1 - elapsed, 3);
        window.scrollTo(0, origin + (destination - origin) * eased);
        if (elapsed < 1) animation = requestAnimationFrame(advance);
      };
      animation = requestAnimationFrame(advance);
    }, 420);

    const cancellationEvents: (keyof WindowEventMap)[] = ['wheel', 'touchstart', 'pointerdown', 'keydown'];
    cancellationEvents.forEach(event => window.addEventListener(event, cancel, { passive: true, once: true }));
    return () => {
      window.clearTimeout(start);
      cancel();
      cancellationEvents.forEach(event => window.removeEventListener(event, cancel));
    };
  }, []);

  return (
    <section ref={section} className="opening-mandate" aria-labelledby="opening-mandate-title">
      <h1 ref={heading} className="opening-mandate__title" id="opening-mandate-title">
        <span>{ESTATE_OPENING_HEADLINE[0]}</span>{' '}<span>{ESTATE_OPENING_HEADLINE[1]}</span>
      </h1>
      <div className="opening-mandate__foot">
        <a className="opening-mandate__link" href="#estate-firm">
          The firm<span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}
