const LETTERS = "SHIFTORA".split("");

/**
 * Full-bleed wordmark, the page h1. Giant Arial Black, edge to edge, slight
 * horizontal overflow allowed. Letters rise and settle on load via CSS, so the
 * entrance runs without JavaScript and is visible by default. The visible
 * letters are aria-hidden; the h1 carries an accessible label.
 * Reduced motion: the motion-safe variant drops the animation, so letters just
 * appear.
 */
export function Wordmark() {
  return (
    <section
      aria-labelledby="wordmark"
      className="w-full overflow-hidden pt-28 md:pt-32"
    >
      <h1
        id="wordmark"
        aria-label="Shiftora"
        className="font-display text-wordmark flex w-full justify-center whitespace-nowrap px-2 text-center leading-[0.85] text-black"
      >
        {LETTERS.map((letter, i) => (
          <span
            key={i}
            aria-hidden="true"
            className="motion-safe:animate-wordmark-in inline-block"
            style={{ animationDelay: `${i * 55}ms` }}
          >
            {letter}
          </span>
        ))}
      </h1>
    </section>
  );
}
