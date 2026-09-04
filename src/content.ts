export const FIRM_DESCRIPTION_BODY =
  'Shiftora is an integrated strategy and systems firm operating across world governments and enterprises. Strategy, organization, capital, operations, data, and technology are ordered as one institutional architecture. We advise the course, build the capacity to carry it, and remain through operation until the intended result is in force.';

export const FIRM_DESCRIPTION_CLOSE =
  'Shiftora brings the vantage to see the whole—and the means to make ambition executable.';

export const FIRM_DESCRIPTION_HIGHLIGHTS = [
  'strategy',
  'systems',
  'world governments',
  'enterprises',
  'vantage',
] as const;

export const ENGAGEMENTS_LEGAL_NOTICE =
  'The following disclosure remains subject to continuing legal duties of confidence.';

export const ENGAGEMENTS_INTRO =
  'Selected systems for public authority and enterprise. Architecture alone is disclosed.';

export const ENGAGEMENTS_CLOSE =
  "A Shiftora system is complete when the institution's capacity to decide and act is equal to the responsibility it carries.";

export interface EngagementRecord {
  title: string;
  description: string;
}

export interface EngagementChapter {
  number: string;
  condition: string;
  records: EngagementRecord[];
}

export const ENGAGEMENT_CHAPTERS: EngagementChapter[] = [
  {
    number: '01',
    condition: 'Where nations move',
    records: [
      {
        title: 'Command across a sovereign logistics network',
        description:
          'The sovereign command infrastructure through which a government logistics institution coordinates ports, freight, customs, suppliers, and public authorities across the systems governing national movement.',
      },
      {
        title: 'Govern passage across borders',
        description:
          'An institution’s entire visa IP—policy, eligibility, documentation, pricing, payment, and fulfillment—transformed into agentic systems operating across jurisdictions.',
      },
    ],
  },
  {
    number: '02',
    condition: 'Where institutional knowledge cannot be divided',
    records: [
      {
        title: "Place a legal institution's memory beside every decision",
        description:
          'A sovereign intelligence estate spanning matters, precedent, clients, communications, and commercial knowledge—placing the firm’s institutional memory beside counsel within the bounds of privilege and professional duty.',
      },
      {
        title: 'Keep frontier intelligence inside the institution',
        description:
          'Frontier models, retrieval architectures, and governed data infrastructure deployed within the institution—reasoning across sensitive knowledge without transferring custody, authority, or control.',
      },
    ],
  },
  {
    number: '03',
    condition: 'Where capital takes physical form',
    records: [
      {
        title: 'Govern the making of a city',
        description:
          'The operating fabric of a major developer—from land and construction through inventory, agents, commercial assets, and sales—rendered legible and governable as an urban estate takes form.',
      },
    ],
  },
  {
    number: '04',
    condition: 'Where scale exceeds human attention',
    records: [
      {
        title: 'Make capital answer to strategy',
        description:
          'The financial and operating architecture through which forecasts, obligations, capital allocation, and executive judgment are reconciled—making the next quarter answerable to the next decade.',
      },
      {
        title: 'Put live judgment inside every commercial conversation',
        description:
          'A live commercial intelligence layer interpreting market conditions, account history, institutional policy, and the conversation itself—placing judgment beside the representative while the decision is still forming.',
      },
    ],
  },
];

export const ENGAGEMENT_NAMES = ENGAGEMENT_CHAPTERS.flatMap((chapter) =>
  chapter.records.map((record) => record.title)
);
