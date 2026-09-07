import { useRef } from 'react';
import { DirectionalArrow } from '../components/DirectionalArrow';
import { CONCEPT_RECORDS, ESTATE_DOMAINS } from './conceptData';
import './case-study.css';

export interface CaseStudyProps {
  domainIndex: number;
  selectedIndex: number;
  active: boolean;
  staticLinks?: boolean;
  basePath?: string;
  onSelect: (localIndex: number) => void;
}

const summaries: Record<string, string> = {
  'command-across-a-sovereign-logistics-network':
    'Command infrastructure connecting ports, freight, customs, suppliers, and public authorities.',
  'govern-passage-across-borders':
    'Visa policy, eligibility, documentation, payment, and fulfillment across jurisdictions.',
  'place-a-legal-institution-s-memory-beside-every-decision':
    'Institutional knowledge beside counsel, within the bounds of privilege and professional duty.',
  'keep-frontier-intelligence-inside-the-institution':
    'Frontier models and governed knowledge, without transferring custody or control.',
  'govern-the-making-of-a-city':
    'Land, construction, inventory, and sales ordered across an urban estate.',
  'make-capital-answer-to-strategy':
    'Forecasts, obligations, and capital allocation reconciled with executive judgment.',
  'put-live-judgment-inside-every-commercial-conversation':
    'Live intelligence across markets, account history, policy, and commercial conversations.',
};

export default function CaseStudy({ domainIndex, selectedIndex, active, staticLinks = false, basePath = '/concepts/estate', onSelect }: CaseStudyProps) {
  const featuredLink = useRef<HTMLAnchorElement>(null);
  const domain = ESTATE_DOMAINS[domainIndex];
  if (!domain) return null;
  const localIndex = Math.max(0, Math.min(domain.records.length - 1, Math.trunc(selectedIndex)));
  const record = CONCEPT_RECORDS[domain.records[localIndex]];
  const count = domain.records.length;
  const displayTitle = record.slug === 'place-a-legal-institution-s-memory-beside-every-decision'
    ? 'Institutional memory beside every legal decision'
    : record.slug === 'command-across-a-sovereign-logistics-network' ? 'World Government Logistics'
    : record.title;
  const select = (index: number, button: HTMLButtonElement) => {
    const keyboard = button.matches(':focus-visible');
    onSelect(index);
    if (keyboard) requestAnimationFrame(() => featuredLink.current?.focus({ preventScroll: true }));
  };
  const previous = localIndex > 0 ? CONCEPT_RECORDS[domain.records[localIndex - 1]] : null;
  const next = localIndex < count - 1 ? CONCEPT_RECORDS[domain.records[localIndex + 1]] : null;

  return (
    <article className="case-study" data-active={active} data-field={domain.id} data-record-number={record.number}>
      <p className="case-study__domain">{domain.title}</p>
      <a
        className="case-study__link"
        ref={featuredLink}
        href={`${basePath}/engagements/${record.slug}`}
        aria-label={`View engagement: ${displayTitle}`}
        data-record-number={record.number}
        tabIndex={active ? 0 : -1}
        onClick={event => { if (!active) event.preventDefault(); }}
      >
        <div className="case-study__image">
          <img
            className="case-study__painting"
            src={record.artwork.src}
            alt={record.artwork.alt}
            width={record.artwork.width}
            height={record.artwork.height}
            loading={active ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
          />
          <span className="case-study__title-outline" aria-hidden="true">{displayTitle}</span>
          <h3 className="case-study__title">{displayTitle}</h3>
        </div>
        <div className="case-study__body" key={record.slug}>
          <p className="case-study__summary">{summaries[record.slug] ?? record.description}</p>
          <span className="case-study__action">View engagement<DirectionalArrow /></span>
        </div>
      </a>
      <div className="case-study__controls" aria-label={`Selected engagements in ${domain.title}`} aria-hidden={count === 1 || undefined}>
        {count > 1 && <>
          {staticLinks
            ? previous
              ? <a className="case-study__previous" href={`${basePath}/engagements/${previous.slug}`} data-record-number={previous.number}>Previous</a>
              : <span className="case-study__previous case-study__control-disabled">Previous</span>
            : <button type="button" className="case-study__previous" disabled={!active || localIndex === 0} tabIndex={active ? 0 : -1} data-record-number={previous?.number} aria-label={`Previous engagement in ${domain.title}`} onClick={event => select(localIndex - 1, event.currentTarget)}>Previous</button>}
          <span className="case-study__count">{localIndex + 1} of {count}</span>
          {staticLinks
            ? next
              ? <a className="case-study__next" href={`${basePath}/engagements/${next.slug}`} data-record-number={next.number}>Next</a>
              : <span className="case-study__next case-study__control-disabled">Next</span>
            : <button type="button" className="case-study__next" disabled={!active || localIndex === count - 1} tabIndex={active ? 0 : -1} data-record-number={next?.number} aria-label={`Next engagement in ${domain.title}`} onClick={event => select(localIndex + 1, event.currentTarget)}>Next</button>}
        </>}
      </div>
    </article>
  );
}
