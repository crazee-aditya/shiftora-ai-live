import { BrandFooter, BrandHeader } from '../components/BrandFrame';
import { DirectionalArrow } from '../components/DirectionalArrow';
import { ConceptId, recordSlug } from '../concepts/conceptData';
import {
  ENGAGEMENT_CHAPTERS,
  ENGAGEMENTS_CLOSE,
  ENGAGEMENTS_INTRO,
  ENGAGEMENTS_LEGAL_NOTICE,
} from '../content';

export default function EngagementsPage({ concept, basePath }: { concept?: ConceptId; basePath?: string } = {}) {
  let itemNumber = 0;
  const estateBase = basePath ?? '/concepts/estate';

  return (
    <div className="mandates-page" data-concept={concept}>
      <BrandHeader active="engagements" tone="ink" concept={concept} basePath={basePath} />
      <main id="main-content" tabIndex={-1}>
        <section className="mandates-hero">
          <p className="page-kicker page-kicker--ink">{concept === 'estate' ? 'Selected engagements' : 'Integrated strategy and systems firm'}</p>
          <h1 className="engagements-title">Engagements</h1>
          <p className="mandates-hero__intro">
            <span className="mandates-hero__legal-notice">{ENGAGEMENTS_LEGAL_NOTICE}</span>
            <span>{ENGAGEMENTS_INTRO}</span>
          </p>
        </section>

        <div className="mandate-book">
          {ENGAGEMENT_CHAPTERS.map((chapter) => (
            <section className="mandate-chapter" key={chapter.number}>
              <header className="mandate-chapter__header">
                <span>{chapter.number}</span>
                <h2>{chapter.condition}</h2>
              </header>
              <div className="mandate-chapter__items">
                {chapter.records.map((record) => {
                  itemNumber += 1;
                  return (
                    <article className="mandate-item" key={record.title} id={concept === 'estate' ? `estate-record-${String(itemNumber).padStart(2, '0')}` : undefined}>
                      <span className="mandate-item__number">
                        {String(itemNumber).padStart(2, '0')}
                      </span>
                      <h3>{concept ? <a href={concept === 'estate' ? `${estateBase}/engagements/${recordSlug(record.title)}?origin=index` : `/engagements/${recordSlug(record.title)}?concept=${concept}`}>{record.title}</a> : record.title}</h3>
                      <p>{record.description}</p>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <section className="mandates-close">
          <p>{ENGAGEMENTS_CLOSE}</p>
          <a
            href="https://cal.com/shiftora.ai/30min"
            target="_blank"
            rel="noopener noreferrer"
          >
            Request appointment
            <DirectionalArrow />
          </a>
        </section>
      </main>
      <BrandFooter active="engagements" tone="ink" concept={concept} basePath={basePath} />
    </div>
  );
}
