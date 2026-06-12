import { motion, type Variants } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import CoreVisual from './CoreVisual';

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: EASE, delay: i * 0.1 },
  }),
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay: i * 0.12 },
  }),
};

const headingContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const clipLine: Variants = {
  hidden: { y: '110%', opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.7, ease: EASE } },
};

const VIEWPORT = { once: true, amount: 0.3 } as const;

const HEADING_LINES: Array<{ text: string; dim?: boolean }> = [
  { text: 'Only AI-Native' },
  { text: 'Organizations', dim: true },
  { text: 'Will Survive.' },
];

const STATS: Array<{
  value: string;
  symbol: string;
  label: string;
  prefix?: string;
}> = [
  {
    value: '3',
    symbol: '×',
    label: 'MORE OUTPUT PER TEAM,\nZERO ADDED HEADCOUNT',
  },
  {
    prefix: 'UP TO',
    value: '30',
    symbol: '%',
    label: 'SAVED ON MANUAL WORK\nWITH AI AND AUTOMATION',
  },
  {
    prefix: 'UP TO',
    value: '5',
    symbol: 'WKS',
    label: 'OF BUILD AND ITERATION TIME\nSAVED PER SYSTEM',
  },
];

const STEPS: Array<{ index: string; title: string; description: string }> = [
  {
    index: '01',
    title: 'Audit & Strategy',
    description:
      'We map how work actually moves through your organization, across every team, system, and decision point, and pinpoint where AI removes overhead or replaces manual coordination.',
  },
  {
    index: '02',
    title: 'Build & Iterate',
    description:
      'Senior engineers build the system directly on top of your existing stack, wired into your tools, data, and operating logic. No migrations, and you stay in the loop throughout.',
  },
  {
    index: '03',
    title: 'Live Operations',
    description:
      'We deploy into production, connect it to your live systems, and own monitoring and iteration as a long-term partner.',
  },
];

/**
 * Editorial, monochrome re-skin of the "How we work" section:
 * black background, big uppercase clip-reveal typography, Inter,
 * wide tracking, Framer Motion scroll-staggered reveals.
 */
export default function Approach() {
  return (
    <section
      id="approach"
      className="bg-black text-white py-20 md:py-28 lg:py-32"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="mx-auto flex max-w-[1440px] flex-col px-5 sm:px-8 md:px-12">
        {/* Top row */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-white/60">
          <motion.span
            variants={fadeDown}
            custom={0}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            ( How We Work )
          </motion.span>
          <motion.span
            variants={fadeDown}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
          >
            Audit &middot; Build &middot; Operate
          </motion.span>
        </div>

        {/* Heading + orbital visual: 2-col on lg */}
        <div className="mt-10 md:mt-14 lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Left: giant clip-reveal heading + sub-paragraph */}
          <div>
            <motion.h2
              className="uppercase"
              variants={headingContainer}
              initial="hidden"
              animate="visible"
            >
              {HEADING_LINES.map((line) => (
                <span key={line.text} className="block overflow-hidden">
                  <motion.span
                    variants={clipLine}
                    className={`block ${line.dim ? 'text-white/25' : 'text-white'}`}
                    style={{
                      fontSize: 'clamp(1.9rem, 4.6vw, 4.2rem)',
                      lineHeight: 0.95,
                      fontWeight: 600,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {line.text}
                  </motion.span>
                </span>
              ))}
            </motion.h2>

            {/* Sub-paragraph */}
            <motion.p
              variants={fadeUp}
              custom={0}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              className="mt-8 md:mt-10 max-w-xl text-[11px] sm:text-xs md:text-sm font-semibold uppercase leading-relaxed tracking-widest text-white/70"
            >
              The next decade belongs to companies that run on AI, not alongside
              it. We audit how work moves through your organization, rebuild
              core workflows as production AI systems, and operate them with
              you, until AI-native is simply how you run.
            </motion.p>
          </div>

          {/* Right: revolving chrome core (WebGL) */}
          <motion.div
            variants={fadeUp}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={VIEWPORT}
            className="mt-12 lg:mt-0"
          >
            <CoreVisual />
          </motion.div>
        </div>

        {/* Stats row */}
        <div className="mt-12 md:mt-16 flex flex-wrap gap-8 sm:gap-12 md:gap-16">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
            >
              <p
                className="text-white"
                style={{ fontSize: 'clamp(1.5rem, 5vw, 3.5rem)', fontWeight: 600 }}
              >
                {stat.prefix && (
                  <span
                    className="mr-2 text-white/40"
                    style={{
                      fontSize: '0.28em',
                      letterSpacing: '0.15em',
                      verticalAlign: '0.9em',
                    }}
                  >
                    {stat.prefix}
                  </span>
                )}
                {stat.value}
                <span
                  className="text-white/40"
                  style={{ fontSize: '0.5em' }}
                >
                  {stat.symbol}
                </span>
              </p>
              <p className="mt-2 whitespace-pre-line text-[10px] sm:text-xs font-semibold uppercase leading-tight tracking-widest text-white/60">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Step rows */}
        <div className="mt-12 md:mt-16">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.index}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={VIEWPORT}
              className="group flex flex-col gap-3 border-t border-white/15 py-6 md:grid md:grid-cols-[auto_1fr_minmax(0,28rem)] md:items-baseline md:gap-6 md:py-8"
            >
              <span
                className="font-semibold text-white/30"
                style={{ fontSize: 'clamp(1.25rem, 2.5vw, 2rem)' }}
              >
                {step.index}
              </span>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold uppercase tracking-widest text-white transition-colors duration-300 group-hover:text-white/60">
                {step.title}
              </h3>
              <p className="max-w-md text-[11px] sm:text-xs uppercase leading-relaxed tracking-widest text-white/55">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Closing CTA */}
        <motion.div
          variants={fadeUp}
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT}
          className="mt-14 md:mt-20"
        >
          <button
            type="button"
            onClick={() =>
              document
                .getElementById('contact')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
            className="group inline-flex items-center gap-3 text-base sm:text-lg font-semibold uppercase tracking-widest text-white"
          >
            Start a Build
            <ArrowUpRight
              size={20}
              className="transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
