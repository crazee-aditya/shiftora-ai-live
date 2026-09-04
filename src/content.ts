export const FIRM_DESCRIPTION_BODY =
  'Shiftora is an integrated strategy and systems firm. Every institution is governed twice: formally by those entrusted with its direction, and operationally by the systems through which it acts. Governments and enterprises may decide or be required to do more than they can presently carry out. Shiftora forms its own view and advises those who hold the relevant authority. We remain with the mandate through the work it requires. When the necessary capacity does not exist, we build it.';

export const FIRM_DESCRIPTION_CLOSE =
  'An institution has sovereign capacity when its systems are answerable to its lawful authority and equal to its responsibilities.';

export const MANDATES_INTRO =
  "A Shiftora mandate begins where an institution's direction or responsibility exceeds its present capacity to act. The work takes the form that condition requires.";

export const MANDATES_CLOSE =
  'A Shiftora mandate carries a consequential direction or responsibility through the work required to put it into effect.';

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
          'Under continuing public authority, take an adopted objective through the funding, procurement, and institutions on which delivery depends.',
      },
      {
        title: 'Reposition an enterprise for its next phase',
        description:
          'Form a view of where the next period of growth and advantage may come from, then reshape the institution around the course it adopts.',
      },
      {
        title: 'Reallocate capital around a chosen course',
        description:
          'Advise the institution on how capital, risk capacity, and management attention should be committed to the chosen course. Establish the information required to govern each allocation.',
      },
    ],
  },
  {
    number: '02',
    condition: 'When inherited structures and present direction diverge',
    mandates: [
      {
        title: 'Bring a transformation back under institutional direction',
        description:
          'When a major transformation has not produced the intended change, give those with authority the basis to stop it, reorder it, or rebuild it.',
      },
      {
        title: 'Replace an operating model built for an earlier strategy',
        description:
          'Change how decisions, resources, and work move through the institution when the present model keeps an earlier strategy in force.',
      },
      {
        title: 'Build the organization a new strategy requires',
        description:
          'With those who hold the relevant authority, reshape leadership and organization so an adopted strategy can take effect.',
      },
    ],
  },
  {
    number: '03',
    condition: 'When responsibility outruns capability',
    mandates: [
      {
        title: 'Establish a function for a new institutional responsibility',
        description:
          'When no existing part of the institution can discharge a new duty, advise the relevant authority on the function required, then build its operating capacity.',
      },
      {
        title: 'Build software for a critical institutional function',
        description:
          'When available products cannot serve the function as its obligations and operating conditions demand, build the software the mandate requires.',
      },
      {
        title: 'Establish the information a consequential mandate requires',
        description:
          'When necessary data is divided across systems or jurisdictions, establish the common definitions, stewardship, and architecture by which the institution can rely on it.',
      },
    ],
  },
  {
    number: '04',
    condition: 'When strategic dependence becomes unacceptable',
    mandates: [
      {
        title: 'Set the boundary of acceptable dependence',
        description:
          "With the institution's accountable authorities, determine which dependencies can be accepted and which cannot. Where continuity or lawful responsibility demands an alternative, establish it.",
      },
      {
        title: 'Set the terms under which models may act',
        description:
          'For consequential work, advise the responsible authorities on which judgments must remain human, what models may advise or execute, how performance will be assessed, and who answers for the result. Build or select only within the terms they establish.',
      },
    ],
  },
];

export const MANDATE_NAMES = MANDATE_CHAPTERS.flatMap((chapter) =>
  chapter.mandates.map((mandate) => mandate.title)
);
