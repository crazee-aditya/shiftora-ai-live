export const FIRM_DESCRIPTION =
  'Shiftora is an integrated strategy and systems firm. Every institution is governed twice: formally by those responsible for its direction, and operationally by the systems through which it acts. The first establishes direction. The second determines what can be carried out. In governments and enterprises alike, structures built for earlier conditions often come to dictate present choices. Policy falters in delivery; strategy narrows to what inherited operations and technology will allow. Shiftora works where the two diverge. We begin with the judgment itself and remain with it through the organization and systems that must carry it out. When the necessary capability does not yet exist, we build it. This is sovereign capacity: the institution remains free to alter its course, and its systems remain capable of following.';

export const MANDATES_INTRO =
  "A Shiftora mandate begins where a consequential decision exceeds the institution's present capacity to carry it out. The work takes the form that decision requires.";

export const MANDATES_CLOSE =
  "A mandate belongs within Shiftora's remit when an important decision crosses institutional boundaries, cannot be completed by advice alone, and requires capability the institution must be able to govern.";

export interface Mandate {
  title: string;
  description: string;
}

export interface MandateChapter {
  number: string;
  condition: string;
  mandates: Mandate[];
}

export const MANDATE_CHAPTERS: MandateChapter[] = [
  {
    number: '01',
    condition: 'When direction changes',
    mandates: [
      {
        title: 'Carry a national priority into operation',
        description:
          'Translate an adopted public objective into accountable delivery across authority, funding, procurement, operations, and the systems required for execution.',
      },
      {
        title: 'Reposition an enterprise for its next phase',
        description:
          'Determine where the next period of growth can come from, then reshape the business model, partnerships, and investment sequence required to pursue it.',
      },
      {
        title: 'Reallocate capital around a chosen course',
        description:
          'Align portfolio priorities, liquidity, return thresholds, financial controls, and operating information with the course the institution has chosen.',
      },
    ],
  },
  {
    number: '02',
    condition: 'When inherited structures resist',
    mandates: [
      {
        title: 'Build the organization a new strategy requires',
        description:
          'Define how authority must be held, which capabilities must exist, and how leadership and the workforce must change for the new strategy to take effect.',
      },
      {
        title: 'Redesign an operating model that preserves the past',
        description:
          'Reconfigure how decisions, resources, and work move through the institution when the present model continues to reproduce an earlier strategy.',
      },
      {
        title: 'Bring a transformation back under institutional direction',
        description:
          'Form an independent view of why a major programme, restructuring, or technical initiative has failed to alter operating reality; then resequence and rebuild the work.',
      },
    ],
  },
  {
    number: '03',
    condition: 'When capability is missing',
    mandates: [
      {
        title: 'Create capacity for a new institutional responsibility',
        description:
          'When no existing function can carry the work, define its mandate, governance, and operating method together with the systems on which it will depend.',
      },
      {
        title: 'Build the software through which critical work will run',
        description:
          "Design and deploy a custom application around the institution's decision rights and operating logic when existing products cannot satisfy its operating requirements.",
      },
      {
        title: 'Make fragmented data answer to a common decision',
        description:
          'Establish a data foundation whose meaning, provenance, permissions, and quality hold as information moves across the institution and grows in scale.',
      },
      {
        title: 'Place models under operational authority',
        description:
          'Select or build models for live work, defining who governs their data, which decisions they may inform, which bounded actions they may execute, where accountable human judgment must remain, and how performance will be evaluated and monitored.',
      },
    ],
  },
  {
    number: '04',
    condition: 'When control cannot be ceded',
    mandates: [
      {
        title: 'Determine what the institution must control',
        description:
          'Distinguish what may be bought, shared, or delegated from what must remain under direct authority because of security, jurisdiction, continuity, or strategic dependency.',
      },
      {
        title: 'Keep critical knowledge under institutional control',
        description:
          'Where sensitive knowledge must remain inside a defined security or jurisdictional boundary, build the models and infrastructure required to use it while retaining institutional authority over access, operation, and change.',
      },
    ],
  },
];

export const MANDATE_NAMES = MANDATE_CHAPTERS.flatMap((chapter) =>
  chapter.mandates.map((mandate) => mandate.title)
);
