"use client";

import {
  createElement,
  useEffect,
  useLayoutEffect,
  useRef,
  type ElementType,
  type ReactNode,
} from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

// Run before paint on the client to minimize any reveal flash; fall back to
// useEffect on the server to avoid the SSR warning.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface RevealProps {
  children: ReactNode;
  /** Element/tag to render. Defaults to a div. */
  as?: ElementType;
  className?: string;
  /** Animate direct children with a stagger instead of the element itself. */
  stagger?: boolean;
  /** Rise distance in px. */
  y?: number;
  /** ScrollTrigger start. */
  start?: string;
  /** Extra delay in seconds. */
  delay?: number;
}

/**
 * Scroll-triggered type reveal: fade + rise as the element enters the viewport.
 * Content is fully visible by default, so it degrades gracefully without JS and
 * under reduced motion (no transform applied).
 */
export function Reveal({
  children,
  as = "div",
  className,
  stagger = false,
  y = 24,
  start = "top 82%",
  delay = 0,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets: Element[] = stagger ? Array.from(el.children) : [el];
    if (targets.length === 0) return;

    // Reduced motion, or a hidden tab (rAF paused, so the tween cannot run):
    // leave everything visible and in place rather than stuck at opacity 0.
    if (prefersReducedMotion() || document.hidden) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.from(targets, {
        opacity: 0,
        y,
        duration: 0.7,
        ease: "power3.out",
        delay,
        stagger: stagger ? 0.08 : 0,
        scrollTrigger: {
          trigger: el,
          start,
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [stagger, y, start, delay]);

  return createElement(as, { ref, className }, children);
}
