export const PASSAGE_TRAVEL = 3.4;

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

/** Each field receives a still reading interval before the next painting rises. */
export function passagePosition(progress: number): number {
  const raw = clamp(progress) * PASSAGE_TRAVEL;
  const whole = Math.floor(raw);
  const phase = clamp((raw - whole - .32) / .60);
  const eased = phase ** 3 * (phase * (phase * 6 - 15) + 10);
  return Math.min(3, whole + eased);
}

/** A small deadband prevents two captions alternating around a scroll boundary. */
export function activePassage(position: number, previous: number): number {
  const bounded = clamp(position, 0, 3);
  return Math.abs(bounded - previous) > .56 ? Math.round(bounded) : previous;
}
