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
