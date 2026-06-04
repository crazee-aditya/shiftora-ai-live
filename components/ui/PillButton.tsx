"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { useSmoothScroll } from "@/lib/lenis";
import type { MouseEvent, ReactNode } from "react";

type Variant = "ghost" | "primary";

interface PillButtonProps {
  children: ReactNode;
  /** In-page anchor (e.g. "#work") or external URL. Renders an <a>. */
  href?: string;
  /** Click handler. Renders a <button> when no href is given. */
  onClick?: (e: MouseEvent) => void;
  variant?: Variant;
  /** Switch styling for placement on a black surface. */
  dark?: boolean;
  /** Trailing arrow that nudges right on hover. */
  arrow?: boolean;
  className?: string;
  type?: "button" | "submit";
  "aria-label"?: string;
}

const base =
  "group inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-sans uppercase tracking-[0.05em] leading-none transition-colors duration-300 ease-smooth min-h-[44px] select-none";

const styles: Record<Variant, { light: string; dark: string }> = {
  ghost: {
    light: "border border-black text-black hover:bg-black hover:text-white",
    dark: "border border-white text-white hover:bg-white hover:text-black focus-ring-light",
  },
  primary: {
    // Hover keeps the palette pure (no gray): only the arrow shifts.
    light: "bg-black text-white",
    dark: "bg-white text-black focus-ring-light",
  },
};

export function PillButton({
  children,
  href,
  onClick,
  variant = "ghost",
  dark = false,
  arrow = true,
  className,
  type = "button",
  "aria-label": ariaLabel,
}: PillButtonProps) {
  const { scrollTo } = useSmoothScroll();

  const classes = cn(base, dark ? styles[variant].dark : styles[variant].light, className);

  const content = (
    <>
      <span>{children}</span>
      {arrow && (
        <span
          aria-hidden="true"
          className="transition-transform duration-300 ease-smooth group-hover:translate-x-1"
        >
          &rarr;
        </span>
      )}
    </>
  );

  // In-page anchors render as real links (work without JS) but intercept the
  // click for smooth scrolling.
  if (href && href.startsWith("#")) {
    return (
      <a
        href={href}
        aria-label={ariaLabel}
        className={classes}
        onClick={(e) => {
          e.preventDefault();
          scrollTo(href);
          onClick?.(e);
        }}
      >
        {content}
      </a>
    );
  }

  // Internal routes use the Next.js router for client-side navigation.
  if (href && href.startsWith("/")) {
    return (
      <Link href={href} aria-label={ariaLabel} className={classes} onClick={onClick}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} aria-label={ariaLabel} className={classes} onClick={onClick}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} aria-label={ariaLabel} className={classes} onClick={onClick}>
      {content}
    </button>
  );
}
