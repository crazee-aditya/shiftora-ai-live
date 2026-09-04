import { BrandFooter, BrandHeader } from '../components/BrandFrame';
import {
  FIRM_DESCRIPTION_BODY,
  FIRM_DESCRIPTION_CLOSE,
  FIRM_DESCRIPTION_HIGHLIGHTS,
} from '../content';

const HIGHLIGHTS = new Set<string>(FIRM_DESCRIPTION_HIGHLIGHTS);
const HIGHLIGHT_PATTERN = new RegExp(
  `(${FIRM_DESCRIPTION_HIGHLIGHTS.map((phrase) =>
    phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
  ).join('|')})`,
  'g',
);

function withHighlights(text: string) {
  return text.split(HIGHLIGHT_PATTERN).map((part, index) =>
    HIGHLIGHTS.has(part) ? (
      <span className="description-copy__emphasis" key={`${part}-${index}`}>
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export default function DescriptionPage() {
  return (
    <div className="description-page">
      <BrandHeader active="description" />
      <main className="description-page__main" id="main-content" tabIndex={-1}>
        <h1 className="sr-only">Shiftora — integrated strategy and systems firm</h1>
        <p className="page-kicker">The firm</p>
        <div className="description-copy">
          <p>{withHighlights(FIRM_DESCRIPTION_BODY)}</p>
          <p className="description-copy__close">{withHighlights(FIRM_DESCRIPTION_CLOSE)}</p>
        </div>
      </main>
      <BrandFooter active="description" />
    </div>
  );
}
