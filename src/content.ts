export const FIRM_DESCRIPTION_BODY =
  'Shiftora is an integrated strategy and systems firm. Every institution is governed twice: formally by those entrusted with its direction, and operationally by the systems through which it acts. Governments and enterprises may decide or be required to do more than they can presently carry out. Shiftora forms its own view and advises those who hold the relevant authority. We remain with the mandate through the work it requires. When the necessary capacity does not exist, we build it.';

export const FIRM_DESCRIPTION_CLOSE =
  'An institution has sovereign capacity when its systems are answerable to its lawful authority and equal to its responsibilities.';

export const MANDATES_INTRO =
  "A Shiftora mandate begins where an institution's direction or responsibility exceeds its present capacity to act. Its form follows that condition, within the authority and scope entrusted to us.";

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
          'Under continuing public authority, advise the bodies responsible for funding, procurement, and delivery, then undertake the work they entrust to us in carrying the adopted objective into operation.',
      },
      {
        title: 'Reposition an enterprise for its next phase',
        description:
          'Form a view of the position the enterprise should seek in its next phase. Advise its leadership on the changes that position would entail, then carry into effect the arrangements it approves.',
      },
      {
        title: 'Determine the capital requirements of a chosen course',
        description:
          'Form our own view of the capital, risk capacity, and management attention the chosen course will require. Give the institution the information needed to govern each allocation.',
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
          'Form a view of how decisions, resources, and work should move through the institution. Design and implement the operating arrangements it approves for the adopted strategy.',
      },
      {
        title: 'Build the organization a new strategy requires',
        description:
          'Advise those who hold the relevant authority on leadership and organization, then carry into effect the organizational arrangements they approve for the adopted strategy.',
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
          'When no existing part of the institution can discharge a new duty, advise the relevant authority on the function required and build the operating capacity it approves.',
      },
      {
        title: 'Build software for a critical institutional function',
        description:
          'When available products cannot serve the function as its obligations and operating conditions demand, build the software the mandate requires.',
      },
      {
        title: 'Establish the information a consequential mandate requires',
        description:
          "When necessary data is divided across systems or jurisdictions, advise the relevant authorities on common definitions and stewardship. Build the architecture they approve for the institution's specified purposes.",
      },
    ],
  },
  {
    number: '04',
    condition: 'When strategic dependence becomes unacceptable',
    mandates: [
      {
        title: 'Bring strategic dependence under institutional judgment',
        description:
          "Advise the institution's accountable authorities on which dependencies can be accepted and which cannot. Where those authorities determine that continuity or lawful responsibility demands an alternative, establish it under the terms they set.",
      },
      {
        title: 'Make model action answerable to institutional authority',
        description:
          'For consequential work, advise the responsible authorities on which judgments must remain human, what models may advise or execute, how performance will be assessed, and who answers for the result. Build or select only within the terms they establish.',
      },
    ],
  },
];

export const MANDATE_NAMES = MANDATE_CHAPTERS.flatMap((chapter) =>
  chapter.mandates.map((mandate) => mandate.title)
);
