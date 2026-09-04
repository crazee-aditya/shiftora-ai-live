interface BrandFrameProps {
  active: 'description' | 'engagements' | 'none';
  tone?: 'paper' | 'ink';
}

export function BrandHeader({ active, tone = 'paper' }: BrandFrameProps) {
  const nextHref = active === 'description' ? '/engagements' : '/';
  const nextLabel = active === 'description' ? 'Engagements' : 'The firm';

  return (
    <header className={`brand-header brand-header--${tone}`}>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <a
        className="brand-wordmark"
        href="/"
        aria-label="Shiftora home"
        aria-current={active === 'description' ? 'page' : undefined}
      >
        shiftora
      </a>
      <nav className="brand-header__meta" aria-label="Primary navigation">
        {active !== 'none' && (
          <span className="brand-header__index">{active === 'description' ? '01' : '02'} / 02</span>
        )}
        <a className="brand-header__next" href={nextHref}>
          {nextLabel}
          <span aria-hidden="true">↗</span>
        </a>
      </nav>
    </header>
  );
}

export function BrandFooter({ active, tone = 'paper' }: BrandFrameProps) {
  return (
    <footer className={`brand-footer brand-footer--${tone}`}>
      <a href="mailto:info@shiftora.ai">info@shiftora.ai</a>
      <a href={active === 'description' ? '/engagements' : '/'}>
        {active === 'description' ? 'View engagements' : 'Read about the firm'}
        <span aria-hidden="true">↗</span>
      </a>
    </footer>
  );
}
