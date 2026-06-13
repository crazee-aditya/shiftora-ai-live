export function SiteHeader({ rightLabel = 'Back to home', rightHref = '/' }: { rightLabel?: string; rightHref?: string }) {
  return (
    <header className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
      <a href="/" className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 sm:h-10 sm:w-10">
          <span className="text-[9px] font-bold tracking-tight text-white sm:text-[10px]">
            S.AI
          </span>
        </span>
        <span className="text-[14px] font-medium text-gray-900">Shiftora</span>
      </a>
      <a
        href={rightHref}
        className="text-[14px] text-gray-600 transition-colors duration-300 hover:text-gray-900"
      >
        {rightLabel}
      </a>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-200">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 text-[12px] text-gray-400 sm:px-8 lg:px-12">
        <span>© 2026 Shiftora.ai</span>
        <span>shiftora.ai</span>
      </div>
    </footer>
  );
}
