interface BrandFrameProps {
  active: 'description' | 'mandates';
  tone?: 'paper' | 'ink';
}

export function BrandHeader({ active, tone = 'paper' }: BrandFrameProps) {
  const nextHref = active === 'description' ? '/mandates' : '/';
  const nextLabel = active === 'description' ? 'Mandates' : 'The firm';

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
        <span className="brand-header__index">{active === 'description' ? '01' : '02'} / 02</span>
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
      <span>Dubai · Mumbai</span>
      <a href="mailto:info@shiftora.ai">info@shiftora.ai</a>
      <a href={active === 'description' ? '/mandates' : '/'}>
        {active === 'description' ? 'Read the mandates' : 'Read about the firm'}
        <span aria-hidden="true">↗</span>
      </a>
    </footer>
  );
}
