import { CONTACT_EMAIL, LEGAL_LINE } from "@/data/site";

/** Minimal footer. Black surface, white text. No personal names. */
export function SiteFooter() {
  return (
    <footer className="bg-black text-white">
      <div className="container-page flex flex-col gap-8 py-12 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3">
          <span className="font-display text-xl leading-none tracking-tight">
            SHIFTORA AI
          </span>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="focus-ring-light text-sm text-white/80 underline-offset-4 transition-colors hover:text-white hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </div>
        <p className="text-xs leading-relaxed text-white/50 md:max-w-prose md:text-right">
          {LEGAL_LINE}
        </p>
      </div>
    </footer>
  );
}
