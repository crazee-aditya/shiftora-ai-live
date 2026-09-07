import { ENGAGEMENT_CHAPTERS } from '../content';

export const CONCEPT_IDS = ['command', 'atlas', 'force', 'estate'] as const;
export type ConceptId = typeof CONCEPT_IDS[number];
export const isConcept = (value: string | null | undefined): value is ConceptId =>
  CONCEPT_IDS.includes(value as ConceptId);

export const ESTATE_DOMAINS = [
  { id: 'authority', title: 'Public authority', records: [0, 1] },
  { id: 'knowledge', title: 'Institutional knowledge', records: [2, 3] },
  { id: 'land', title: 'Land & development', records: [4] },
  { id: 'capital', title: 'Capital & commerce', records: [5, 6] },
];

export function recordSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const artworks = {
  arrival: {
    src: '/renaissance-study/arrival-evidence-1800.webp',
    title: 'Arrival of the English Ambassadors',
    artist: 'Vittore Carpaccio',
    alt: 'A diplomatic assembly within Renaissance civic architecture.',
    width: 1800, height: 665,
  },
  athens: {
    src: '/renaissance-study/athens-1800.webp',
    title: 'The School of Athens',
    artist: 'Raphael',
    alt: 'Philosophers and scholars assembled beneath monumental arches.',
    width: 1800, height: 1255,
  },
  city: {
    src: '/renaissance-study/ideal-city-1800.webp',
    title: 'The Ideal City, Urbino',
    artist: 'Central Italian painter',
    alt: 'An ordered Renaissance city arranged around a central civic building.',
    width: 1800, height: 517,
  },
  pacioli: {
    src: '/renaissance-study/pacioli-1800.webp',
    title: 'Portrait of Luca Pacioli and a Young Man',
    artist: 'Attributed to Jacopo de’ Barbari',
    alt: 'Luca Pacioli studying mathematics beside a young man.',
    width: 1800, height: 1500,
  },
};
const artSequence = ['arrival', 'arrival', 'athens', 'athens', 'city', 'pacioli', 'pacioli'] as const;
let position = 0;
export const CONCEPT_RECORDS = ENGAGEMENT_CHAPTERS.flatMap(chapter => chapter.records.map(record => {
  const index = position++;
  return { ...record, slug: recordSlug(record.title), condition: chapter.condition, number: String(index + 1).padStart(2, '0'), artwork: artworks[artSequence[index]] };
}));
