import { BrandFooter, BrandHeader } from '../components/BrandFrame';
import { MANDATE_CHAPTERS, MANDATES_CLOSE, MANDATES_INTRO } from '../content';

export default function MandatesPage() {
  let itemNumber = 0;

  return (
    <div className="mandates-page">
      <BrandHeader active="mandates" tone="ink" />
      <main id="main-content" tabIndex={-1}>
        <section className="mandates-hero">
          <p className="page-kicker page-kicker--ink">Integrated strategy and systems firm</p>
          <h1>Mandates</h1>
          <p className="mandates-hero__intro">{MANDATES_INTRO}</p>
        </section>

        <div className="mandate-book">
          {MANDATE_CHAPTERS.map((chapter) => (
            <section className="mandate-chapter" key={chapter.number}>
              <header className="mandate-chapter__header">
                <span>{chapter.number}</span>
                <h2>{chapter.condition}</h2>
              </header>
              <div className="mandate-chapter__items">
                {chapter.mandates.map((mandate) => {
                  itemNumber += 1;
                  return (
                    <article className="mandate-item" key={mandate.title}>
                      <span className="mandate-item__number">
                        {String(itemNumber).padStart(2, '0')}
                      </span>
                      <h3>{mandate.title}</h3>
                      <p>{mandate.description}</p>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <section className="mandates-close">
          <p>{MANDATES_CLOSE}</p>
          <a href="mailto:info@shiftora.ai">
            Discuss a mandate.
            <span aria-hidden="true">↗</span>
          </a>
        </section>
      </main>
      <BrandFooter active="mandates" tone="ink" />
    </div>
  );
}
