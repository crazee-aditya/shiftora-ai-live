"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger once on the client. Importing this module anywhere
// guarantees the plugin is available before any animation is built.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** True when the user has asked for reduced motion. Safe on the server. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger };
