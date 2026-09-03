export const FIRM_DESCRIPTION =
  'Shiftora is an integrated strategy and systems firm. Every institution is governed twice: formally by those responsible for its direction, and operationally by the systems through which it acts. The first establishes direction. The second determines what can be carried out. In governments and enterprises alike, structures built for earlier conditions often come to dictate present choices. Policy falters in delivery; strategy narrows to what inherited operations and technology will allow. Shiftora works where the two diverge. We begin with the judgment itself and remain with it through the organization and systems that must carry it out. When the necessary capability does not yet exist, we build it. This is sovereign capacity: the institution remains free to alter its course, and its systems remain capable of following.';

export const MANDATES_INTRO =
  "A Shiftora mandate begins where an institution's direction or responsibility exceeds its present capacity to act. The work takes the form that condition requires.";

export const MANDATES_CLOSE =
  "A Shiftora mandate holds a consequential direction or responsibility intact until the institution can act and govern the capability on which action depends.";

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
          'Carry an adopted public objective through the funding, procurement, operating, and technical arrangements required for delivery across the institutions responsible, under their continuing authority.',
      },
      {
        title: 'Reposition an enterprise for its next phase',
        description:
          "Identify where the next period of growth and advantage will come from, then carry leadership's chosen course through the business model, capital, partnerships, and the organization and systems that must support it.",
      },
      {
        title: 'Reallocate capital around a chosen course',
        description:
          'Carry the chosen course into how capital, risk, and management attention are allocated—and into the information and controls used to govern those choices.',
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
          'With leadership, define how organizational authority, capability, and workforce must change for the new strategy to take effect.',
      },
      {
        title: 'Redesign an operating model that preserves the past',
        description:
          'Reconfigure how decisions, resources, and work move through the institution when the present model continues to reproduce an earlier strategy.',
      },
      {
        title: 'Bring a transformation back under institutional direction',
        description:
          'Establish why a major program, restructuring, or technical initiative has not altered the institution as intended, and give leadership the basis to stop, reorder, or rebuild it.',
      },
    ],
  },
  {
    number: '03',
    condition: 'When responsibility outruns capability',
    mandates: [
      {
        title: 'Create capacity for a new institutional responsibility',
        description:
          "When an institution assumes a responsibility no existing function can carry, define the function's role and governance, then build the operating method, infrastructure, and systems required to discharge it.",
      },
      {
        title: 'Build the software through which critical work will run',
        description:
          "When existing products cannot embody the institution's established decision rights and operating logic, design and deploy the system that can.",
      },
      {
        title: 'Make fragmented data answer to a common decision',
        description:
          'Establish the shared information a consequential decision requires, then build the architecture that preserves its meaning, provenance, permissions, and integrity as use grows across the institution.',
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
          "With the institution's accountable authorities, establish the boundary between what may be bought, shared, or delegated and what must remain under direct control because of security, jurisdiction, continuity, or strategic dependence.",
      },
      {
        title: 'Place models under operational authority',
        description:
          "Within the institution's authority, define where models may enter live work, what must remain human judgment, and how performance will be assessed; then select or build what the mandate requires.",
      },
      {
        title: 'Establish critical capability under institutional control',
        description:
          'When security, jurisdiction, continuity, or strategic dependence makes ordinary procurement insufficient, build or restructure the capability so the institution can govern its operation, change, transfer, and exit.',
      },
    ],
  },
];

export const MANDATE_NAMES = MANDATE_CHAPTERS.flatMap((chapter) =>
  chapter.mandates.map((mandate) => mandate.title)
);
