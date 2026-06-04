"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/cn";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Oversized Arial Black "type as graphic" watermark that parallaxes on scroll
 * (slower than the foreground) and overflows the viewport edges. The watermark
 * is decorative and aria-hidden; foreground content renders above it.
 */
export function Watermark({
  words,
  children,
  className,
  minHeight = "120vh",
}: {
  words: string[];
  children?: ReactNode;
  className?: string;
  minHeight?: string;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    const mark = markRef.current;
    if (!section || !mark || prefersReducedMotion() || document.hidden) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        mark,
        { yPercent: 12 },
        {
          yPercent: -12,
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn("relative flex items-stretch overflow-hidden", className)}
      style={{ minHeight }}
    >
      <div
        ref={markRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex select-none flex-col items-center justify-center"
      >
        {words.map((word) => (
          <span
            key={word}
            className="font-display text-watermark block whitespace-nowrap leading-[0.8]"
          >
            {word}
          </span>
        ))}
      </div>

      <div className="container-page section-y relative z-10 flex w-full flex-col justify-center">
        {children}
      </div>
    </section>
  );
}
