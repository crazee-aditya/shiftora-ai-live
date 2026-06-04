import type { Config } from "tailwindcss";

/**
 * Shiftora design system.
 * Strictly black and white. The only permitted grays are the oversized
 * "type as graphic" watermark, hairline dividers, and muted meta labels.
 * `accent` is the single themeable hook (defaults to black) for the optional
 * color variant. See styles/tokens.css.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        black: "#000000",
        white: "#FFFFFF",
        // Permitted grays only.
        watermark: "#C9C9C9",
        line: "#E5E5E5",
        mute: "#6B6B6B",
        // Single color hook for the optional variant. Defaults to black.
        // Channel form keeps Tailwind opacity modifiers (accent/40) working.
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
      },
      fontFamily: {
        // Body / UI.
        sans: ['Arial', '"Helvetica Neue"', "Helvetica", "sans-serif"],
        // Display / wordmark. System Arial Black first, Archivo Black
        // (loaded via next/font) as the reliable cross-platform fallback.
        display: [
          '"Arial Black"',
          "var(--font-archivo-black)",
          '"Helvetica Neue"',
          "Arial",
          "sans-serif",
        ],
      },
      fontSize: {
        // Fluid type scale. Never rely on fixed px for display sizes.
        wordmark: [
          "clamp(4rem, 18vw, 18rem)",
          { lineHeight: "0.85", letterSpacing: "-0.03em", fontWeight: "900" },
        ],
        display: [
          "clamp(2rem, 6vw, 5.5rem)",
          { lineHeight: "1.02", letterSpacing: "-0.02em", fontWeight: "900" },
        ],
        watermark: [
          "clamp(6rem, 26vw, 24rem)",
          { lineHeight: "0.8", letterSpacing: "-0.03em", fontWeight: "900" },
        ],
        body: ["clamp(1rem, 1.1vw, 1.25rem)", { lineHeight: "1.5" }],
        eyebrow: [
          "0.75rem",
          { lineHeight: "1", letterSpacing: "0.15em", fontWeight: "400" },
        ],
      },
      maxWidth: {
        prose: "60ch",
        page: "1440px",
      },
      borderRadius: {
        "2xl": "1.25rem",
      },
      keyframes: {
        wordmarkIn: {
          // Transform-only so letters are always visible (no opacity gating),
          // which keeps the wordmark robust without JS and in background tabs.
          from: { transform: "translateY(14px)" },
          to: { transform: "translateY(0)" },
        },
        cellPulse: {
          "0%, 100%": { opacity: "0" },
          "50%": { opacity: "0.14" },
        },
        gridPan: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 -160px" },
        },
        dashFlow: {
          to: { strokeDashoffset: "-1000" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        gridPan: "gridPan 18s linear infinite",
        dashFlow: "dashFlow 24s linear infinite",
        fadeIn: "fadeIn 0.6s ease forwards",
        "wordmark-in": "wordmarkIn 0.7s cubic-bezier(0.16,1,0.3,1) both",
        "cell-pulse": "cellPulse 4s ease-in-out infinite",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
