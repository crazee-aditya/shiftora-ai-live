import { DirectionalArrow } from '../components/DirectionalArrow';
import { ENGAGEMENTS_LEGAL_NOTICE } from '../content';
import { CONCEPT_RECORDS } from './conceptData';
import InstitutionPassage from './InstitutionPassage';
import OpeningMandate from './OpeningMandate';
import './estate.css';

export default function EstateConcept({ basePath = '/concepts/estate' }: { basePath?: string }) {
  const homeHref = basePath || '/';
  const engagementsHref = `${basePath}/engagements`;
  const careersHref = `${basePath}/careers`;
  return (
    <div className="estate-page">
      <a className="estate-skip" href="#estate-main">Skip to content</a>
      <header className="estate-header">
        <a className="estate-wordmark" href={homeHref} aria-label="Shiftora home">shiftora</a>
        <nav aria-label="Primary navigation">
          <span className="estate-header__index" aria-hidden="true">01 / 02</span>
          <a href={engagementsHref}>Engagements<DirectionalArrow /></a>
        </nav>
      </header>
      <main id="estate-main" tabIndex={-1}>
        <OpeningMandate />

        <InstitutionPassage basePath={basePath} />

        <a className="estate-all-engagements" data-estate-index href={engagementsHref} aria-label={`All selected engagements, ${CONCEPT_RECORDS.length} listed`}>
          <span className="estate-all-engagements__label">All selected engagements<span className="estate-all-engagements__count" aria-hidden="true">{String(CONCEPT_RECORDS.length).padStart(2, '0')}</span></span>
          <DirectionalArrow />
        </a>

        <aside className="estate-confidentiality" aria-label="Engagement disclosure"><p>{ENGAGEMENTS_LEGAL_NOTICE}</p></aside>
      </main>
      <footer className="estate-footer">
        <a href={careersHref}>Careers<DirectionalArrow /></a>
        <a className="estate-footer__email" href="mailto:info@shiftora.ai">info@shiftora.ai</a>
        <a href="https://cal.com/shiftora.ai/30min" target="_blank" rel="noopener noreferrer">Request appointment<DirectionalArrow /></a>
      </footer>
    </div>
  );
}
