"use client";

import { Eyebrow } from "./ui/Eyebrow";
import { Reveal } from "./Reveal";

// Blocky module grid. Cells light up in a diagonal wave.
const COLS = 12;
const ROWS = 6;
const CELLS = Array.from({ length: COLS * ROWS });

/**
 * The black "thing on top": a full-bleed black panel (edge to edge) with rounded
 * top corners and a blocky module grid that pulses in a diagonal wave. Carries
 * the coming-soon line. CSS/SVG only, no WebGL.
 */
export function ComingSoonHero() {
  return (
    <section aria-label="Status" className="pt-8 md:pt-12">
      <div className="relative flex min-h-[80vh] w-full items-center justify-center overflow-hidden rounded-t-2xl bg-black">
        {/* Blocky module grid. Gaps form the grid lines; inner cells pulse. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 grid"
          style={{
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
            gap: "2px",
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        >
          {CELLS.map((_, i) => {
            const col = i % COLS;
            const row = Math.floor(i / COLS);
            // Negative, position-based delay = an immediate diagonal wave.
            const delay = -((col + row) * 0.2);
            return (
              <div key={i} className="bg-black">
                <div
                  className="motion-safe:animate-cell-pulse h-full w-full bg-white opacity-0"
                  style={{ animationDelay: `${delay}s` }}
                />
              </div>
            );
          })}
        </div>

        {/* Vignette keeps the headline legible over the grid. */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at center, rgba(0,0,0,0) 35%, rgba(0,0,0,0.7) 100%)",
          }}
        />

        <Reveal
          stagger
          className="relative z-10 flex flex-col items-center gap-6 px-6 text-center"
        >
          <Eyebrow dark>AI Automation and Production Software</Eyebrow>
          <h2 className="font-display text-display max-w-[18ch] text-white">
            New website coming soon.
          </h2>
        </Reveal>
      </div>
    </section>
  );
}
