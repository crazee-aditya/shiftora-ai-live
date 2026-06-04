import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

/**
 * Small uppercase eyebrow / label.
 * Muted gray on light surfaces; muted white on dark surfaces.
 */
export function Eyebrow({
  children,
  className,
  dark = false,
  as: Tag = "p",
}: {
  children: ReactNode;
  className?: string;
  dark?: boolean;
  as?: "p" | "h2" | "span" | "div";
}) {
  return (
    <Tag
      className={cn(
        "text-eyebrow font-sans uppercase",
        dark ? "text-white/60" : "text-mute",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
