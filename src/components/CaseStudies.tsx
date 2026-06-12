/**
 * "What we've built": four anonymized client engagements, each with a
 * bespoke looping monochrome visual built entirely in code (CSS keyframes
 * and inline SVG) that mirrors the system described. Client names and
 * identifying detail are withheld under NDA.
 */

interface Engagement {
  index: string;
  category: string;
  title: string;
  description: string;
  Visual: () => JSX.Element;
}

/* ------------------------------------------------------------------ */
/* 01 - Revenue engine: a central brain dispatching outbound packets   */
/* to satellite channels, thousands of daily touches radiating from    */
/* one scoring core. Satellites flare as each dispatch lands.          */
/* ------------------------------------------------------------------ */

const HUB_CX = 200;
const HUB_CY = 112;
const HUB_RX = 124;
const HUB_RY = 76;
const HUB_CYCLE = 6; // seconds

const HUB_SATELLITES = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2;
  return {
    x: HUB_CX + Math.cos(angle) * HUB_RX,
    y: HUB_CY + Math.sin(angle) * HUB_RY,
    at: i / 8,
  };
});

function RevenueEngineVisual() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 400 225" className="h-[88%] w-[94%]" aria-hidden="true">
        {/* Drifting orbit rings */}
        <ellipse
          cx={HUB_CX}
          cy={HUB_CY}
          rx={HUB_RX}
          ry={HUB_RY}
          fill="none"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="1"
          strokeDasharray="3 9"
          pathLength={300}
          style={{ animation: 'cs-dash-drift 10s linear infinite' }}
        />
        <ellipse
          cx={HUB_CX}
          cy={HUB_CY}
          rx={88}
          ry={52}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
          strokeDasharray="2 8"
          pathLength={300}
          style={{ animation: 'cs-dash-drift 8s linear infinite reverse' }}
        />

        {/* Spokes */}
        {HUB_SATELLITES.map((s) => (
          <line
            key={`spoke-${s.at}`}
            x1={HUB_CX}
            y1={HUB_CY}
            x2={s.x}
            y2={s.y}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        ))}

        {/* Outbound dispatches, one per spoke, staggered */}
        {HUB_SATELLITES.map((s) => (
          <g key={`token-${s.at}`}>
            <circle r="5" fill="rgba(255,255,255,0.18)">
              <animateMotion
                dur={`${HUB_CYCLE / 2}s`}
                begin={`${s.at * HUB_CYCLE - HUB_CYCLE}s`}
                repeatCount="indefinite"
                path={`M${HUB_CX},${HUB_CY} L${s.x},${s.y}`}
              />
            </circle>
            <circle r="2.4" fill="#ffffff">
              <animateMotion
                dur={`${HUB_CYCLE / 2}s`}
                begin={`${s.at * HUB_CYCLE - HUB_CYCLE}s`}
                repeatCount="indefinite"
                path={`M${HUB_CX},${HUB_CY} L${s.x},${s.y}`}
              />
            </circle>
          </g>
        ))}

        {/* Satellite channels flare as each dispatch arrives */}
        {HUB_SATELLITES.map((s) => (
          <g
            key={`sat-${s.at}`}
            style={{
              animation: `cs-node-glow ${HUB_CYCLE}s linear infinite`,
              animationDelay: `${(s.at + 0.5) * HUB_CYCLE}s`,
              transformBox: 'fill-box',
              transformOrigin: 'center',
              opacity: 0.4,
            }}
          >
            <circle
              cx={s.x}
              cy={s.y}
              r="10"
              fill="#111111"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="1.2"
            />
            <circle cx={s.x} cy={s.y} r="3" fill="#ffffff" />
          </g>
        ))}

        {/* Scoring core with expanding pulse */}
        <circle
          cx={HUB_CX}
          cy={HUB_CY}
          r="22"
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1.2"
          style={{
            animation: 'cs-core-pulse 3s ease-out infinite',
            transformBox: 'fill-box',
            transformOrigin: 'center',
          }}
        />
        <circle
          cx={HUB_CX}
          cy={HUB_CY}
          r="20"
          fill="#111111"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.2"
        />
        <circle
          cx={HUB_CX}
          cy={HUB_CY}
          r="12"
          fill="none"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1.2"
        />
        <circle cx={HUB_CX} cy={HUB_CY} r="5" fill="#ffffff" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 02 - Platform rebuild: a layered DAG. Applications branch from one  */
/* intake through parallel processing and validation stages, then      */
/* merge into a single governed output. Stages light left to right.    */
/* ------------------------------------------------------------------ */

const DAG_NODES = [
  { x: 28, y: 112 },
  { x: 112, y: 48 },
  { x: 112, y: 112 },
  { x: 112, y: 176 },
  { x: 200, y: 34 },
  { x: 200, y: 86 },
  { x: 200, y: 140 },
  { x: 200, y: 192 },
  { x: 290, y: 66 },
  { x: 290, y: 156 },
  { x: 372, y: 112 },
];

const DAG_EDGES: Array<[number, number]> = [
  [0, 1], [0, 2], [0, 3],
  [1, 4], [1, 5], [2, 5], [2, 6], [3, 6], [3, 7],
  [4, 8], [5, 8], [6, 9], [7, 9],
  [8, 10], [9, 10],
];

const DAG_ROUTES = [
  { path: 'M28,112 L112,48 L200,34 L290,66 L372,112', dur: 4.6, begin: 0 },
  { path: 'M28,112 L112,112 L200,86 L290,66 L372,112', dur: 5.4, begin: -2.2 },
  { path: 'M28,112 L112,176 L200,192 L290,156 L372,112', dur: 5, begin: -1.1 },
  { path: 'M28,112 L112,112 L200,140 L290,156 L372,112', dur: 5.8, begin: -3.4 },
];

const DAG_CYCLE = 4.5; // seconds

function PlatformRebuildVisual() {
  const edgePath = DAG_EDGES.map(([a, b]) => {
    const n1 = DAG_NODES[a];
    const n2 = DAG_NODES[b];
    return `M${n1.x},${n1.y} L${n2.x},${n2.y}`;
  }).join(' ');

  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 400 225" className="h-[88%] w-[94%]" aria-hidden="true">
        {/* Base edges */}
        <path d={edgePath} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" />
        {/* Drifting dash flow along every edge */}
        <path
          d={edgePath}
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="1.2"
          strokeDasharray="3 13"
          style={{ animation: `cs-edge-flow ${DAG_CYCLE}s linear infinite` }}
        />

        {/* Applications riding parallel routes */}
        {DAG_ROUTES.map((route) => (
          <g key={route.path}>
            <circle r="6" fill="rgba(255,255,255,0.16)">
              <animateMotion
                dur={`${route.dur}s`}
                begin={`${route.begin}s`}
                repeatCount="indefinite"
                path={route.path}
              />
            </circle>
            <circle r="2.8" fill="#ffffff">
              <animateMotion
                dur={`${route.dur}s`}
                begin={`${route.begin}s`}
                repeatCount="indefinite"
                path={route.path}
              />
            </circle>
          </g>
        ))}

        {/* Stage nodes lighting in a left-to-right wave */}
        {DAG_NODES.map((n, i) => {
          const isEndpoint = i === 0 || i === DAG_NODES.length - 1;
          return (
            <g
              key={`dag-${n.x}-${n.y}`}
              style={{
                animation: `cs-node-glow ${DAG_CYCLE}s linear infinite`,
                animationDelay: `${(n.x / 400) * DAG_CYCLE}s`,
                transformBox: 'fill-box',
                transformOrigin: 'center',
                opacity: 0.4,
              }}
            >
              <circle
                cx={n.x}
                cy={n.y}
                r={isEndpoint ? 13 : 9}
                fill="#111111"
                stroke="rgba(255,255,255,0.6)"
                strokeWidth="1.3"
              />
              <circle cx={n.x} cy={n.y} r={isEndpoint ? 4.5 : 3} fill="#ffffff" />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 03 - Predictive commercial stack: two signals redraw each cycle, a  */
/* scanline sweeps the chart scoring each datapoint it crosses, then   */
/* dashed projections and a widening confidence cone extend forward,   */
/* prioritized outreach pulling away from the baseline.                */
/* ------------------------------------------------------------------ */

const FORECAST_CYCLE = 7; // seconds

const A_HISTORY = 'M20,168 L65,150 L110,158 L155,128 L200,134 L250,98';
const A_FORECAST = 'M250,98 L295,84 L340,74 L385,52';
const A_CONE = 'M250,98 L385,34 L385,72 Z';
const B_HISTORY = 'M20,96 L65,108 L110,100 L155,116 L200,112 L250,132';
const B_FORECAST = 'M250,132 L295,142 L340,150 L385,162';

const A_POINTS = [
  { x: 20, y: 168 },
  { x: 65, y: 150 },
  { x: 110, y: 158 },
  { x: 155, y: 128 },
  { x: 200, y: 134 },
  { x: 250, y: 98 },
];

// The scanline crosses x at this fraction of its 20 -> 385 sweep.
const scanDelay = (x: number) => ((x - 20) / 365) * FORECAST_CYCLE;

function ScoringVisual() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 400 225" className="h-[88%] w-[94%]" aria-hidden="true">
        {/* Grid */}
        {[40, 80, 120, 160, 200].map((y) => (
          <line
            key={y}
            x1="20"
            y1={y}
            x2="385"
            y2={y}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="1"
          />
        ))}

        {/* "Now" divider between history and projection */}
        <line
          x1="250"
          y1="28"
          x2="250"
          y2="208"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
          strokeDasharray="2 5"
        />

        {/* Confidence cone on the prioritized signal */}
        <path
          d={A_CONE}
          fill="rgba(255,255,255,0.06)"
          style={{ animation: `cs-fade-mid ${FORECAST_CYCLE}s linear infinite` }}
        />

        {/* Prioritized outreach: history redraws, projection fades in */}
        <path
          d={A_HISTORY}
          fill="none"
          stroke="rgba(255,255,255,0.9)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1"
          style={{ animation: `cs-line-draw ${FORECAST_CYCLE}s linear infinite` }}
        />
        <path
          d={A_FORECAST}
          fill="none"
          stroke="rgba(255,255,255,0.6)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeDasharray="6 7"
          style={{
            opacity: 0,
            animation: `cs-fade-mid ${FORECAST_CYCLE}s linear infinite`,
          }}
        />

        {/* Baseline signal, slightly offset draw */}
        <path
          d={B_HISTORY}
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1"
          style={{
            animation: `cs-line-draw ${FORECAST_CYCLE}s linear infinite`,
            animationDelay: '0.35s',
          }}
        />
        <path
          d={B_FORECAST}
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="5 7"
          style={{
            opacity: 0,
            animation: `cs-fade-mid ${FORECAST_CYCLE}s linear infinite`,
            animationDelay: '0.35s',
          }}
        />

        {/* Datapoints scored as the scanline crosses them */}
        {A_POINTS.map((p) => (
          <circle
            key={`pt-${p.x}`}
            cx={p.x}
            cy={p.y}
            r="3.4"
            fill="#ffffff"
            style={{
              opacity: 0,
              animation: `cs-point-pop ${FORECAST_CYCLE}s linear infinite`,
              animationDelay: `${scanDelay(p.x)}s`,
              transformBox: 'fill-box',
              transformOrigin: 'center',
            }}
          />
        ))}

        {/* Sweeping scanline */}
        <g style={{ animation: `cs-scan-line ${FORECAST_CYCLE}s linear infinite` }}>
          <line
            x1="20"
            y1="28"
            x2="20"
            y2="208"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="1"
          />
          <circle cx="20" cy="28" r="2" fill="rgba(255,255,255,0.6)" />
        </g>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 04 - Self-auditing operations: an irregular mesh of distributed     */
/* sites. An audit wave sweeps diagonally across the lattice while     */
/* verification packets travel multi-hop routes and a soft scan band   */
/* passes through the portfolio.                                       */
/* ------------------------------------------------------------------ */

const FABRIC_NODES = [
  { x: 28, y: 38 },
  { x: 112, y: 26 },
  { x: 198, y: 44 },
  { x: 286, y: 28 },
  { x: 372, y: 50 },
  { x: 54, y: 104 },
  { x: 142, y: 90 },
  { x: 228, y: 112 },
  { x: 314, y: 94 },
  { x: 30, y: 178 },
  { x: 118, y: 164 },
  { x: 206, y: 186 },
  { x: 296, y: 168 },
  { x: 372, y: 146 },
];

const FABRIC_EDGES: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [1, 5], [1, 6], [2, 6], [2, 7], [3, 7], [3, 8], [4, 8],
  [5, 6], [6, 7], [7, 8],
  [5, 9], [5, 10], [6, 10], [6, 11], [7, 11], [7, 12], [8, 12], [8, 13], [4, 13],
  [9, 10], [10, 11], [11, 12], [12, 13],
];

const FABRIC_ROUTES = [
  { path: 'M28,38 L112,26 L142,90 L228,112 L314,94 L372,146', dur: 7, begin: 0 },
  { path: 'M30,178 L118,164 L142,90 L198,44 L286,28 L372,50', dur: 8.5, begin: -5 },
  { path: 'M54,104 L142,90 L228,112 L296,168 L372,146', dur: 6, begin: -2.5 },
];

const FABRIC_CYCLE = 5; // seconds
const fabricDelay = (x: number, y: number) =>
  ((x + y * 0.6) / 520) * FABRIC_CYCLE;

function PortfolioMeshVisual() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 400 225" className="h-[88%] w-[94%]" aria-hidden="true">
        <defs>
          <linearGradient id="cs-fabric-scan" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(255,255,255,0)" />
            <stop offset="0.5" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="1" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        {/* Soft scan band sweeping the portfolio */}
        <rect
          x="-90"
          y="0"
          width="90"
          height="225"
          fill="url(#cs-fabric-scan)"
          style={{ animation: 'cs-scan-x 8s linear infinite' }}
        />

        {/* Edges, flashing as the audit wave passes their midpoint */}
        {FABRIC_EDGES.map(([a, b]) => {
          const n1 = FABRIC_NODES[a];
          const n2 = FABRIC_NODES[b];
          return (
            <line
              key={`edge-${a}-${b}`}
              x1={n1.x}
              y1={n1.y}
              x2={n2.x}
              y2={n2.y}
              stroke="#ffffff"
              strokeWidth="1"
              style={{
                opacity: 0.12,
                animation: `cs-mesh-flash ${FABRIC_CYCLE}s linear infinite`,
                animationDelay: `${fabricDelay((n1.x + n2.x) / 2, (n1.y + n2.y) / 2)}s`,
              }}
            />
          );
        })}

        {/* Verification packets riding multi-hop routes */}
        {FABRIC_ROUTES.map((route) => (
          <g key={route.path}>
            <circle r="5" fill="rgba(255,255,255,0.16)">
              <animateMotion
                dur={`${route.dur}s`}
                begin={`${route.begin}s`}
                repeatCount="indefinite"
                path={route.path}
              />
            </circle>
            <circle r="2.2" fill="#ffffff">
              <animateMotion
                dur={`${route.dur}s`}
                begin={`${route.begin}s`}
                repeatCount="indefinite"
                path={route.path}
              />
            </circle>
          </g>
        ))}

        {/* Site nodes, pulsing on the same diagonal wave */}
        {FABRIC_NODES.map((n) => (
          <g
            key={`node-${n.x}-${n.y}`}
            style={{
              animation: `cs-mesh-node ${FABRIC_CYCLE}s linear infinite`,
              animationDelay: `${fabricDelay(n.x, n.y)}s`,
              transformBox: 'fill-box',
              transformOrigin: 'center',
              opacity: 0.45,
            }}
          >
            <circle
              cx={n.x}
              cy={n.y}
              r="6.5"
              fill="#111111"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="1"
            />
            <circle cx={n.x} cy={n.y} r="2" fill="#ffffff" />
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Engagement cards                                                    */
/* ------------------------------------------------------------------ */

const ENGAGEMENTS: Engagement[] = [
  {
    index: '01',
    category: 'Legal Tech · North America',
    title: 'Autonomous Revenue Engine',
    description:
      'For one of the largest legal marketplaces in the US: an AI-native revenue engine scoring millions of leads in real time, orchestrating 3,000+ outbound touches a day, and executing follow-through with action-taking agents inside a fully custom CRM powering a 100+ rep sales floor.',
    Visual: RevenueEngineVisual,
  },
  {
    index: '02',
    category: 'Travel & Mobility · Global',
    title: 'Full-Platform AI Rebuild',
    description:
      'For a global travel-services enterprise: a ground-up platform rebuild where an AI engine reads, validates and routes every application end to end, with partner APIs, multi-geography payments and live operational control replacing a paperwork-heavy process.',
    Visual: PlatformRebuildVisual,
  },
  {
    index: '03',
    category: 'Consumer & B2B · APAC',
    title: 'Predictive Commercial Stack',
    description:
      'For high-growth consumer businesses: custom CRMs and scoring layers built from the ground up that rank every account in the pipeline and time every touch, lifting conversion on prioritized outreach by ~30% within weeks of going live.',
    Visual: ScoringVisual,
  },
  {
    index: '04',
    category: 'Hospitality · Distributed Portfolio',
    title: 'Self-Auditing Operations Layer',
    description:
      'For a premium hospitality portfolio: computer vision that verifies every property handover against its own baseline, with automated communications and an internal AI assistant absorbing the manual workload around it.',
    Visual: PortfolioMeshVisual,
  },
];

const KEYFRAMES = `
@keyframes cs-dash-drift {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: -300; }
}
@keyframes cs-core-pulse {
  0% { opacity: 0.55; transform: scale(0.6); }
  70%, 100% { opacity: 0; transform: scale(1.7); }
}
@keyframes cs-node-glow {
  0% { opacity: 1; transform: scale(1.2); }
  12% { opacity: 1; transform: scale(1); }
  32%, 100% { opacity: 0.4; transform: scale(1); }
}
@keyframes cs-scan-x {
  from { transform: translateX(0); }
  to { transform: translateX(500px); }
}
@keyframes cs-mesh-flash {
  0%, 100% { opacity: 0.12; }
  6% { opacity: 0.65; }
  18% { opacity: 0.12; }
}
@keyframes cs-mesh-node {
  0%, 100% { opacity: 0.45; transform: scale(0.85); }
  6% { opacity: 1; transform: scale(1.25); }
  18% { opacity: 0.55; transform: scale(1); }
}
@keyframes cs-line-draw {
  0% { stroke-dashoffset: 1; }
  40%, 92% { stroke-dashoffset: 0; }
  97%, 100% { stroke-dashoffset: 1; }
}
@keyframes cs-fade-mid {
  0%, 45% { opacity: 0; }
  60%, 90% { opacity: 1; }
  98%, 100% { opacity: 0; }
}
@keyframes cs-point-pop {
  0% { opacity: 0; transform: scale(0.3); }
  4% { opacity: 1; transform: scale(1.4); }
  8% { transform: scale(1); }
  60% { opacity: 1; }
  78%, 100% { opacity: 0; }
}
@keyframes cs-scan-line {
  from { transform: translateX(0); }
  to { transform: translateX(365px); }
}
@keyframes cs-edge-flow {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: -128; }
}
`;

export default function CaseStudies() {
  return (
    <section id="work" className="bg-[#F5F5F5] pb-12 pt-12 sm:pb-14 sm:pt-14 lg:pb-20 lg:pt-20">
      <style>{KEYFRAMES}</style>
      <div className="mx-auto max-w-[1440px]">
        {/* Badge row */}
        <div className="mb-5 flex items-center gap-3 px-5 sm:mb-6 sm:px-8 lg:px-12">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-[11px] font-semibold text-white sm:h-7 sm:w-7 sm:text-[12px]">
            1
          </span>
          <span className="rounded-full border border-gray-300 px-3 py-1 text-[12px] font-medium text-gray-900 sm:px-4 sm:py-1.5 sm:text-[13px]">
            Selected client engagements
          </span>
        </div>

        {/* Heading */}
        <h2 className="mb-8 px-5 font-medium leading-[1.08] tracking-[-0.03em] text-gray-900 [font-size:clamp(1.75rem,7vw,4.2rem)] sm:mb-10 sm:px-8 sm:[font-size:clamp(2.5rem,5vw,4.2rem)] lg:mb-12 lg:px-12">
          What we've built
        </h2>

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 px-5 sm:px-8 md:grid-cols-2 lg:px-12">
          {ENGAGEMENTS.map(({ index, category, title, description, Visual }) => (
            <article key={title}>
              {/* Animated media panel */}
              <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-gray-900 transition-shadow duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.18)]">
                <Visual />
              </div>

              {/* Meta */}
              <div className="mt-4 flex items-baseline justify-between gap-4">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  {index}
                </span>
                <span className="text-right text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                  {category}
                </span>
              </div>
              <h3 className="mt-1.5 text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
                {title}
              </h3>
              <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-gray-600 sm:text-[14px]">
                {description}
              </p>
            </article>
          ))}
        </div>

        {/* NDA note */}
        <p className="mt-10 px-5 text-[11px] leading-relaxed text-gray-400 sm:px-8 lg:px-12">
          A selection of recent engagements. Client names, logos and full scopes
          are withheld under NDA. Several engagements remain entirely
          undisclosed.
        </p>
      </div>
    </section>
  );
}
