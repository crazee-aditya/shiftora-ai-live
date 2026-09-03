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
          "Carry an adopted public objective through the funding, procurement, operating, and technical arrangements required for delivery, under the authority of the institution responsible.",
      },
      {
        title: 'Reposition an enterprise for its next phase',
        description:
          "Identify the sources of the next period of growth, then carry leadership's chosen course through the business model, partnerships, and sequence of investment.",
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
          'Define where authority must sit, which capabilities must exist, and which leadership and workforce choices the institution must make for the new strategy to take effect.',
      },
      {
        title: 'Redesign an operating model that preserves the past',
        description:
          'Reconfigure how decisions, resources, and work move through the institution when the present model continues to reproduce an earlier strategy.',
      },
      {
        title: 'Bring a transformation back under institutional direction',
        description:
          'Determine why a major program, restructuring, or technical initiative has not altered the institution as intended; then establish what must stop, be reordered, or be rebuilt.',
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
          'When no existing function can carry the responsibility, design its remit, governance, operating method, and supporting systems.',
      },
      {
        title: 'Build the software through which critical work will run',
        description:
          "When existing products cannot carry the institution's decision rights and operating logic, design and deploy the system that can.",
      },
      {
        title: 'Make fragmented data answer to a common decision',
        description:
          'Establish the shared information required for a common decision, then build the data architecture that preserves its meaning, provenance, permissions, and quality as its volume and use grow across the institution.',
      },
      {
        title: 'Place models under operational authority',
        description:
          'Establish the authority and bounds under which models may enter live work; then select or build what the mandate requires, preserving accountable human judgment and defining how performance will be evaluated and monitored.',
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
        title: 'Keep critical knowledge under institutional control',
        description:
          'Where sensitive knowledge must remain inside a defined security or jurisdictional boundary, create the capability to use it there—including the models and infrastructure the mandate requires—while retaining institutional authority over access, operation, and change.',
      },
    ],
  },
];

export const MANDATE_NAMES = MANDATE_CHAPTERS.flatMap((chapter) =>
  chapter.mandates.map((mandate) => mandate.title)
);
