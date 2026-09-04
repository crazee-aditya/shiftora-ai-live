import { BrandFooter, BrandHeader } from '../components/BrandFrame';
import { FIRM_DESCRIPTION_BODY, FIRM_DESCRIPTION_CLOSE } from '../content';

export default function DescriptionPage() {
  return (
    <div className="description-page">
      <BrandHeader active="description" />
      <main className="description-page__main" id="main-content" tabIndex={-1}>
        <h1 className="sr-only">Shiftora — integrated strategy and systems firm</h1>
        <p className="page-kicker">The firm</p>
        <div className="description-copy">
          <p>{FIRM_DESCRIPTION_BODY}</p>
          <p className="description-copy__close">{FIRM_DESCRIPTION_CLOSE}</p>
        </div>
      </main>
      <BrandFooter active="description" />
    </div>
  );
}
