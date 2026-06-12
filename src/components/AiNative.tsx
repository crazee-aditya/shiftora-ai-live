import RollButton from './RollButton';
import { CAL_BOOKING_URL } from '../constants';

const POINTS = [
  {
    number: '.01',
    title: 'Cut operational overhead',
    description:
      'Agents absorb the manual coordination, approvals, and repeat work that pile up in the gaps between your systems.',
  },
  {
    number: '.02',
    title: 'Accelerate execution',
    description:
      'Workflows that once needed several human handoffs now run continuously, start to finish.',
  },
  {
    number: '.03',
    title: 'Scale without headcount',
    description:
      'Operational output grows without adding people or new layers of coordination.',
  },
];

/** Original monochrome "dot-matrix ripple": an 8x6 grid of small dots with
 *  a diagonal wave continuously traveling across, modulating opacity and
 *  scale per dot via a shared keyframe + (row + col) animation-delay. */
function DotMatrixRipple() {
  const COLS = 8;
  const ROWS = 6;
  const WAVE_STEP = 0.16; // seconds per diagonal
  const cells = Array.from({ length: ROWS * COLS }, (_, i) => {
    const row = Math.floor(i / COLS);
    const col = i % COLS;
    return { row, col };
  });
  return (
    <div
      className="grid w-full max-w-[440px] grid-cols-8 gap-x-6 gap-y-5 py-4 sm:gap-x-8 sm:gap-y-6"
      aria-hidden="true"
    >
      {cells.map(({ row, col }) => (
        <span key={`${row}-${col}`} className="flex items-center justify-center">
          <span
            className={`h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5 ${
              (row + col) % 3 === 0 ? 'bg-gray-900' : 'bg-gray-400'
            }`}
            style={{
              animation: 'dot-ripple 2.6s ease-in-out infinite',
              animationDelay: `${-(row + col) * WAVE_STEP}s`,
            }}
          />
        </span>
      ))}
    </div>
  );
}

export default function AiNative() {
  return (
    <section id="systems" className="bg-[#F7F7F7] pb-20 pt-20 lg:pb-28 lg:pt-28">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-12">
        {/* Left: heading, sub, visual, CTA */}
        <div>
          <h2 className="font-medium leading-[1.1] tracking-[-0.02em] text-gray-900 [font-size:clamp(1.75rem,4.5vw,3rem)]">
            Built to make enterprises AI-native.
          </h2>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-gray-600 sm:text-[16px]">
            AI agents don't just automate tasks. They dissolve the operational
            bottlenecks that quietly slow large organizations down.
          </p>
          <div className="mt-10 max-w-md lg:max-w-none">
            <DotMatrixRipple />
          </div>
          <div className="mt-10">
            <RollButton label="Book a strategy call" href={CAL_BOOKING_URL} />
          </div>
        </div>

        {/* Right: numbered points */}
        <div className="flex flex-col divide-y divide-gray-200">
          {POINTS.map((point) => (
            <div
              key={point.number}
              className="flex flex-col gap-2 py-8 first:pt-0 last:pb-0 sm:flex-row sm:gap-8 lg:py-10"
            >
              <span className="font-medium tracking-[-0.02em] text-gray-900 [font-size:clamp(1.75rem,3vw,2.5rem)] sm:w-24 sm:shrink-0">
                {point.number}
              </span>
              <div>
                <h3 className="text-[17px] font-semibold text-gray-900 sm:text-[19px]">
                  {point.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed text-gray-600 sm:text-[15px]">
                  {point.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
