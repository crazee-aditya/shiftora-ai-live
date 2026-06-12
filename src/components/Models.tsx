/** Simplified, single-color glyphs recreated as inline SVG, strictly
 *  grayscale, used nominatively alongside each wordmark. */

function AnthropicGlyph({ className }: { className?: string }) {
  // Burst / asterisk mark with eight radiating strokes.
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <g
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      >
        {[0, 45, 90, 135].map((angle) => (
          <line
            key={angle}
            x1="14"
            y1="3.5"
            x2="14"
            y2="24.5"
            transform={`rotate(${angle} 14 14)`}
          />
        ))}
      </g>
    </svg>
  );
}

function OpenAIGlyph({ className }: { className?: string }) {
  // Blossom / knot mark with six interlocking petals rotated about the center.
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2" fill="none">
        {[0, 60, 120, 180, 240, 300].map((angle) => (
          <rect
            key={angle}
            x="11.2"
            y="1.5"
            width="5.6"
            height="17"
            rx="2.8"
            transform={`rotate(${angle} 14 14)`}
          />
        ))}
      </g>
    </svg>
  );
}

function GeminiGlyph({ className }: { className?: string }) {
  // Four-pointed spark / star mark.
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <path
        d="M14 1 C15.2 8.4 19.6 12.8 27 14 C19.6 15.2 15.2 19.6 14 27 C12.8 19.6 8.4 15.2 1 14 C8.4 12.8 12.8 8.4 14 1 Z"
        fill="currentColor"
      />
    </svg>
  );
}

function XaiGlyph({ className }: { className?: string }) {
  // Angular X mark: one full diagonal, one split counter-stroke.
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
      <g fill="currentColor">
        <path d="M3 3 L8 3 L25 25 L20 25 Z" />
        <path d="M20 3 L25 3 L16.5 14 L14 10.8 Z" />
        <path d="M11.5 17.2 L14 20.4 L8 25 L3 25 Z" />
      </g>
    </svg>
  );
}

const MODELS = [
  { name: 'Anthropic', Glyph: AnthropicGlyph },
  { name: 'OpenAI', Glyph: OpenAIGlyph },
  { name: 'Google Gemini', Glyph: GeminiGlyph },
  { name: 'xAI', Glyph: XaiGlyph },
];

export default function Models() {
  return (
    <section className="border-y border-gray-100 bg-white py-12 lg:py-16">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <p className="text-center text-[13px] tracking-wide text-gray-500">
          We build on frontier models
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-10 lg:gap-16">
          {MODELS.map(({ name, Glyph }) => (
            <div
              key={name}
              className="flex items-center gap-2.5 text-gray-900 opacity-70 transition-opacity duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:opacity-100"
            >
              <Glyph className="h-6 w-6 shrink-0" />
              <span className="text-[17px] font-semibold tracking-tight">
                {name}
              </span>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-[12px] leading-relaxed text-gray-400">
          Shiftora is model-agnostic. We build each system on the frontier model
          best suited to the job. Names shown reflect tools we work with, not
          partnerships or endorsements.
        </p>
      </div>
    </section>
  );
}
