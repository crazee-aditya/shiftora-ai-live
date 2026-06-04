"use client";

import { MotionConfig } from "framer-motion";
import { SmoothScroll } from "@/lib/lenis";
import type { ReactNode } from "react";

/**
 * Client providers wrapping the whole app:
 * - SmoothScroll: Lenis smooth scrolling (disabled under reduced motion).
 * - MotionConfig reducedMotion="user": every Framer Motion animation collapses
 *   to opacity-only (no transforms) when the user prefers reduced motion.
 */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>{children}</SmoothScroll>
    </MotionConfig>
  );
}
