export const FIRM_DESCRIPTION_BODY =
  'Shiftora is an integrated strategy and systems firm. We advise governments and enterprises on the decisions that determine their course. We build the systems that carry those decisions into effect.';

export const FIRM_DESCRIPTION_CLOSE =
  'An institution is sovereign when its decisions command the means of action.';

export const ENGAGEMENTS_INTRO =
  'Selected systems built for public authority and enterprise. Only the architecture may be described here. The principals, jurisdictions, and operating particulars remain protected by obligations that survive the engagement.';

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
          'Built for a government logistics institution, the intelligence layer through which ports, freight, customs, suppliers, and public authority act against one operating picture.',
      },
      {
        title: 'Govern passage across borders',
        description:
          'Built the infrastructure for visa discovery, eligibility, documentation, pricing, payment, and fulfillment across jurisdictions.',
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
          'Built a governed intelligence system joining matters, precedent, clients, communications, and commercial knowledge into a common field of action for counsel.',
      },
      {
        title: 'Keep frontier intelligence inside the institution',
        description:
          'Built private models and data infrastructure that reason across sensitive institutional knowledge without surrendering custody, authority, or control.',
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
          'Built the operating system through which a major developer governs land, construction, inventory, agents, commercial assets, and sales as one urban estate.',
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
          'Built a decision system joining forecasts, obligations, operating plans, and resource allocation so the next quarter can be governed without losing sight of the next decade.',
      },
      {
        title: 'Put live judgment inside every commercial conversation',
        description:
          'Built a real-time commercial system that reads the market, recalls the account, interprets the conversation, and places the next decision beside the representative as it happens.',
      },
    ],
  },
];

export const ENGAGEMENT_NAMES = ENGAGEMENT_CHAPTERS.flatMap((chapter) =>
  chapter.records.map((record) => record.title)
);
