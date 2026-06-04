"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "./gsap";

type ScrollTarget = string | number | HTMLElement;

interface SmoothScrollApi {
  /** Smoothly scroll to a selector, element, or offset. Accounts for the nav. */
  scrollTo: (target: ScrollTarget) => void;
}

const SmoothScrollContext = createContext<SmoothScrollApi | null>(null);

// Fixed nav height to offset anchor scrolling so headings are not hidden.
const NAV_OFFSET = -96;

export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Respect reduced motion: skip Lenis entirely and let the browser scroll
    // natively. The scrollTo fallback below handles in-page anchors.
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    // Keep ScrollTrigger in sync with Lenis, and drive Lenis from GSAP's ticker
    // so both share one clock (avoids jitter between scroll and pinned reveals).
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const scrollTo = useCallback((target: ScrollTarget) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { offset: NAV_OFFSET });
      return;
    }
    // Reduced-motion / no-Lenis fallback: native jump.
    const el =
      typeof target === "string"
        ? document.querySelector<HTMLElement>(target)
        : typeof target === "number"
          ? null
          : target;
    if (el) {
      el.scrollIntoView({ behavior: "auto", block: "start" });
    } else if (typeof target === "number") {
      window.scrollTo({ top: target, behavior: "auto" });
    }
  }, []);

  return (
    <SmoothScrollContext.Provider value={{ scrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}

/** Access the smooth-scroll API. Returns a no-op-safe scrollTo outside provider. */
export function useSmoothScroll(): SmoothScrollApi {
  const ctx = useContext(SmoothScrollContext);
  if (ctx) return ctx;
  // Defensive fallback so consumers never crash if rendered outside the provider.
  return {
    scrollTo: (target: ScrollTarget) => {
      if (typeof window === "undefined") return;
      const el =
        typeof target === "string"
          ? document.querySelector<HTMLElement>(target)
          : typeof target === "number"
            ? null
            : target;
      el?.scrollIntoView({ behavior: "auto", block: "start" });
    },
  };
}
