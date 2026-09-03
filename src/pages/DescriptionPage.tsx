import { BrandFooter, BrandHeader } from '../components/BrandFrame';
import { FIRM_DESCRIPTION } from '../content';

export default function DescriptionPage() {
  return (
    <div className="description-page">
      <BrandHeader active="description" />
      <main className="description-page__main" id="main-content" tabIndex={-1}>
        <h1 className="sr-only">Shiftora — integrated strategy and systems firm</h1>
        <p className="page-kicker">The firm</p>
        <p className="description-copy">{FIRM_DESCRIPTION}</p>
      </main>
      <BrandFooter active="description" />
    </div>
  );
}
