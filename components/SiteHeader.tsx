"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PillButton } from "./ui/PillButton";

/**
 * Minimal sticky header. Brand on the left, a single context action on the right
 * (CAREERS on the home page, HOME on the careers page).
 */
export function SiteHeader() {
  const pathname = usePathname();
  const onCareers = pathname?.startsWith("/careers");

  return (
    <header className="border-line fixed inset-x-0 top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="container-page flex items-center justify-between py-4">
        <Link
          href="/"
          className="font-display text-lg leading-none tracking-tight text-black md:text-xl"
        >
          SHIFTORA AI
        </Link>
        <PillButton href={onCareers ? "/" : "/careers"} variant="ghost">
          {onCareers ? "HOME" : "CAREERS"}
        </PillButton>
      </div>
    </header>
  );
}
