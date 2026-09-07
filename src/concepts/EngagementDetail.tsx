import { useEffect, useState } from 'react';
import { DirectionalArrow } from '../components/DirectionalArrow';
import { ENGAGEMENTS_LEGAL_NOTICE } from '../content';
import { CONCEPT_RECORDS, ESTATE_DOMAINS, type ConceptId } from './conceptData';
import NotFound from '../pages/NotFound';
import './detail.css';

export default function EngagementDetail({ slug, concept = 'command', basePath }: { slug: string; concept?: ConceptId; basePath?: string }) {
  const [origin, setOrigin] = useState<'passage' | 'index' | 'brief'>('passage');

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setOrigin(query.get('origin') === 'index' ? 'index' : query.get('from') === 'brief' ? 'brief' : 'passage');
  }, [slug]);

  const record = CONCEPT_RECORDS.find(item => item.slug === slug);
  if (!record) return <NotFound />;
  const fromBrief = concept === 'estate' && origin === 'brief';
  const next = CONCEPT_RECORDS[(CONCEPT_RECORDS.indexOf(record) + 1) % CONCEPT_RECORDS.length];
  const estateField = ESTATE_DOMAINS.find(domain => domain.records.includes(CONCEPT_RECORDS.indexOf(record)))?.id;
  const estateBase = basePath ?? '/concepts/estate';
  const estateIndexHref = `${estateBase}/engagements#estate-record-${record.number}`;
  const returnHref = concept === 'estate' && origin === 'index' ? estateIndexHref
    : concept === 'estate' && !fromBrief ? `${estateBase || '/'}?field=${estateField}&case=${record.number}` : `/concepts/${concept}`;
  const returnLabel = concept === 'estate' && !fromBrief ? 'Back to engagements' : 'Return to the firm';
  const nextHref = concept === 'estate'
    ? `${estateBase}/engagements/${next.slug}${origin === 'index' ? '?origin=index' : fromBrief ? '?from=brief' : ''}`
    : `/engagements/${next.slug}?concept=${concept}`;
  return (
    <div className={`record-detail${concept === 'estate' ? ' record-detail--estate' : ''}`}>
      <a className="record-detail__skip" href="#main-content">Skip to content</a>
      <header className="record-detail__header">
        <a className="record-detail__brand" href={concept === 'estate' ? estateBase || '/' : `/concepts/${concept}`}>shiftora</a>
        <a href={returnHref} className="record-detail__back">{returnLabel} <DirectionalArrow /></a>
      </header>
      <main id="main-content" tabIndex={-1}>
        <div className="record-detail__index"><span>Selected engagement / {record.number}</span><span>{record.condition}</span></div>
        <section className="record-detail__opening">
          <h1>{record.title}</h1>
          <div className="record-detail__description"><span>Architecture</span><p>{record.description}</p></div>
        </section>
        <figure className={`record-detail__art record-detail__art--${record.artwork.width / record.artwork.height > 2 ? 'wide' : 'portrait'}`}>
          <img src={record.artwork.src} alt={record.artwork.alt} width={record.artwork.width} height={record.artwork.height} />
          <figcaption>{record.artwork.artist} · {record.artwork.title}</figcaption>
        </figure>
        <div className="record-detail__disclosure"><p>{ENGAGEMENTS_LEGAL_NOTICE}</p><p>Historical artwork is used as a symbolic reference.</p></div>
        <nav className="record-detail__next" aria-label="Engagement navigation">
          <a href={concept === 'estate' ? estateIndexHref : `/engagements?concept=${concept}`}>All engagements <DirectionalArrow /></a>
          <a href={nextHref}><span>Next engagement</span>{next.title}<DirectionalArrow /></a>
        </nav>
      </main>
      <footer className="record-detail__footer"><span>shiftora</span><a href="https://cal.com/shiftora.ai/30min" target="_blank" rel="noopener noreferrer">Request appointment <DirectionalArrow /></a></footer>
    </div>
  );
}
