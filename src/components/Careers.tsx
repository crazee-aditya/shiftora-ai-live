import { useState } from 'react';
import { ArrowUpRight, Plus } from 'lucide-react';
import RollButton from './RollButton';

interface Role {
  title: string;
  openings?: string;
  experience: string;
  location: string;
  summary: string;
  points: string[];
}

const ROLES: Role[] = [
  {
    title: 'Full Stack Engineer',
    openings: '2 openings',
    experience: '2-4 years',
    location: 'Mumbai',
    summary:
      'Own product surfaces end to end across the systems we ship to large enterprises, from interface to API to deployment.',
    points: [
      'Next.js, TypeScript, and Node or .NET in production',
      'Build across frontend, backend and third-party integrations',
      'Work directly with senior engineers on live client systems',
    ],
  },
  {
    title: 'AI Engineer',
    experience: '1-3 years',
    location: 'Dubai',
    summary:
      'Build LLM applications that real users touch in production, not demos.',
    points: [
      'RAG pipelines, agents and tool-using LLM applications',
      'Prompt and evaluation loops that hold up under real traffic',
      'Ship, monitor and iterate on systems already live with clients',
    ],
  },
  {
    title: 'ML Engineer',
    experience: '2-4 years',
    location: 'Mumbai',
    summary:
      'Build the predictive scoring and forecasting systems that sit at the core of our client engagements.',
    points: [
      'Predictive lead scoring and forecasting on real commercial data',
      'Feature engineering, model tuning and feedback-loop retraining',
      'Models that run in production and move revenue, not notebooks',
    ],
  },
  {
    title: 'React Native Engineer',
    experience: '2-4 years',
    location: 'Mumbai',
    summary:
      'Ship consumer-grade mobile experiences on top of the AI platforms we build.',
    points: [
      'React Native and TypeScript, with releases on both stores',
      'Tight collaboration with full stack and AI engineers',
      'Performance, polish and reliability as defaults',
    ],
  },
];

const APPLY_EMAIL = 'info@shiftora.ai';

function applyLink(role: string) {
  return `mailto:${APPLY_EMAIL}?subject=${encodeURIComponent(
    `Application: ${role}`
  )}`;
}

function RoleRow({
  role,
  index,
  open,
  onToggle,
}: {
  role: Role;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-6 py-6 text-left sm:py-7"
      >
        <span className="flex items-baseline gap-4 sm:gap-8">
          <span className="text-[13px] font-semibold text-gray-400">
            0{index + 1}
          </span>
          <span>
            <span className="block text-[18px] font-medium tracking-tight text-gray-900 sm:text-[22px]">
              {role.title}
            </span>
            <span className="mt-1 block text-[11px] uppercase tracking-widest text-gray-400 sm:text-[12px]">
              {role.experience} · Preferred location: {role.location}
              {role.openings ? ` · ${role.openings}` : ''}
            </span>
          </span>
        </span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-300 text-gray-900">
          <Plus
            size={14}
            className={`transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
              open ? 'rotate-45' : ''
            }`}
          />
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-7 sm:pl-[60px]">
            <p className="max-w-2xl text-[14px] leading-relaxed text-gray-600 sm:text-[15px]">
              {role.summary}
            </p>
            <ul className="mt-4 space-y-2">
              {role.points.map((point) => (
                <li
                  key={point}
                  className="flex max-w-2xl gap-3 text-[14px] leading-relaxed text-gray-600 sm:text-[15px]"
                >
                  <span className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-gray-900" />
                  {point}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[12px] uppercase tracking-widest text-gray-400">
              Preferred location: {role.location}
            </p>
            <a
              href={applyLink(role.title)}
              className="group mt-5 inline-flex items-center gap-2 text-[14px] font-semibold text-gray-900"
            >
              Apply for this role
              <ArrowUpRight
                size={16}
                className="transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Careers() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className="min-h-screen bg-white antialiased">
      {/* ---------------- Header ---------------- */}
      <header className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <a href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 sm:h-10 sm:w-10">
            <span className="text-[9px] font-bold tracking-tight text-white sm:text-[10px]">
              S.AI
            </span>
          </span>
          <span className="text-[14px] font-medium text-gray-900">
            Shiftora
          </span>
        </a>
        <a
          href="/"
          className="text-[14px] text-gray-600 transition-colors duration-300 hover:text-gray-900"
        >
          Back to home
        </a>
      </header>

      {/* ---------------- Intro ---------------- */}
      <section className="mx-auto max-w-[1440px] px-5 pb-14 pt-10 sm:px-8 sm:pt-14 lg:px-12">
        <p className="text-[13px] tracking-wide text-gray-500">
          {'// Careers'}
        </p>
        <h1 className="mt-4 font-medium leading-[1.05] tracking-[-0.03em] text-gray-900 [font-size:clamp(2.25rem,7vw,4.5rem)]">
          We are hiring.
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-gray-600 sm:text-[17px]">
          Shiftora is here to build a great team. We believe in young,
          high-energy, highly adaptable people, more than we believe in
          AI-native resumes. We work with listed companies and large
          enterprises, and we deliver our highest quality work on timelines
          that sound made up, until we hit them.
        </p>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-gray-600 sm:text-[17px]">
          Over the last six months we have rebuilt mission-critical platforms
          end to end, shipped AI systems that score millions of records in
          production, and automated operations for enterprises across the US,
          the Gulf and Asia. All of it live. All of it in weeks. The next wave
          is bigger, and we need people to build it with us.
        </p>
      </section>

      {/* ---------------- Open roles ---------------- */}
      <section className="mx-auto max-w-[1440px] px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 text-[11px] font-semibold uppercase tracking-widest text-gray-400 sm:text-xs">
          <span>( Open roles )</span>
          <span>05 positions</span>
        </div>

        {ROLES.map((role, i) => (
          <RoleRow
            key={role.title}
            role={role}
            index={i}
            open={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? null : i)}
          />
        ))}

        <div className="mt-14 flex flex-col items-start gap-5">
          <p className="text-[14px] text-gray-600 sm:text-[15px]">
            Don't see your role? Tell us what you're great at.
          </p>
          <RollButton
            label="Write to us"
            href={`mailto:${APPLY_EMAIL}?subject=${encodeURIComponent(
              'Application: Open application'
            )}`}
          />
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer className="border-t border-gray-200">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 text-[12px] text-gray-400 sm:px-8 lg:px-12">
          <span>© 2026 Shiftora.ai</span>
          <span>shiftora.ai</span>
        </div>
      </footer>
    </main>
  );
}
