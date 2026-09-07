import { DirectionalArrow } from './DirectionalArrow';
import type { ConceptId } from '../concepts/conceptData';

interface BrandFrameProps {
  active: 'description' | 'engagements' | 'careers' | 'none';
  tone?: 'paper' | 'ink';
  concept?: ConceptId;
  basePath?: string;
}

function framePaths(concept?: ConceptId, basePath?: string) {
  const base = basePath ?? (concept === 'estate' ? '/concepts/estate' : '');
  return {
    home: base || '/',
    engagements: `${base}/engagements`,
    careers: `${base}/careers`,
  };
}

export function BrandHeader({ active, tone = 'paper', concept, basePath }: BrandFrameProps) {
  const { home: homeHref, engagements: engagementsHref } = framePaths(concept, basePath);
  const nextHref = active === 'description' ? engagementsHref : homeHref;
  const nextLabel = active === 'description' ? 'Engagements' : 'The firm';

  return (
    <header className={`brand-header brand-header--${tone}`}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <a
        className="brand-wordmark"
        href={homeHref}
        aria-label="Shiftora home"
        aria-current={active === 'description' ? 'page' : undefined}
      >
        shiftora
      </a>
      <nav className="brand-header__meta" aria-label="Primary navigation">
        {(active === 'description' || active === 'engagements') && (
          <span className="brand-header__index">{active === 'description' ? '01' : '02'} / 02</span>
        )}
        <a className="brand-header__next" href={nextHref}>
          {nextLabel}
          <DirectionalArrow />
        </a>
      </nav>
    </header>
  );
}

export function BrandFooter({ active, tone = 'paper', concept, basePath }: BrandFrameProps) {
  const { home: homeHref, engagements: engagementsHref, careers: careersHref } = framePaths(concept, basePath);
  if (active === 'description') {
    return (
      <footer className={`brand-footer brand-footer--${tone} brand-footer--description`}>
        <a href={careersHref}>
          Careers
          <DirectionalArrow />
        </a>
        <a
          href="https://cal.com/shiftora.ai/30min"
          target="_blank"
          rel="noopener noreferrer"
        >
          Request appointment
          <DirectionalArrow />
        </a>
      </footer>
    );
  }

  if (active === 'careers') {
    return (
      <footer className={`brand-footer brand-footer--${tone} brand-footer--careers`}>
        <a href={engagementsHref}>
          View engagements
          <DirectionalArrow />
        </a>
      </footer>
    );
  }

  return (
    <footer className={`brand-footer brand-footer--${tone}`}>
      <a href="mailto:info@shiftora.ai">info@shiftora.ai</a>
      <a href={homeHref}>
        Read about the firm
        <DirectionalArrow />
      </a>
    </footer>
  );
}
