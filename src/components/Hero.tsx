import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import ShaderBackground from './ShaderBackground';
import RollButton from './RollButton';
import { CAL_BOOKING_URL } from '../constants';

const NAV_LINKS = ['Approach', 'Work', 'Systems', 'Contact'];

function scrollToContact() {
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
}

/* --- Accurate official brand marks (monochrome, nominative use only) --- */

function AnthropicMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-[18px] w-[18px] text-gray-900"
      aria-hidden="true"
    >
      <path d="M17.3041 3.541h-3.6718l6.696 16.918H24Zm-10.6082 0L0 20.459h3.7442l1.3693-3.5527h7.0052l1.3693 3.5528h3.7442L10.5363 3.5409Zm-.3712 10.2232 2.2914-5.9456 2.2914 5.9456Z" />
    </svg>
  );
}

function OpenAIMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-[18px] w-[18px] text-gray-900"
      aria-hidden="true"
    >
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
    </svg>
  );
}

function GoogleMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-[18px] w-[18px] text-gray-900"
      aria-hidden="true"
    >
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
    </svg>
  );
}

const FRONTIER_MODELS = [
  { name: 'Anthropic', Mark: AnthropicMark },
  { name: 'OpenAI', Mark: OpenAIMark },
  { name: 'Google', Mark: GoogleMark },
];

export default function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#EFEFEF]">
      <ShaderBackground />

      {/* ---------------- Navigation ---------------- */}
      <header className="relative z-20">
        <div className="mx-auto max-w-[1440px] p-2 sm:p-3">
          <nav className="flex items-center justify-between rounded-full bg-white p-[5px]">
            {/* Left: logo + links */}
            <div className="flex items-center gap-6">
              <a href="#" className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 sm:h-10 sm:w-10">
                  <span className="text-[10px] font-bold tracking-tight text-white sm:text-[11px]">
                    SH
                  </span>
                </span>
              </a>
              <div className="hidden items-center gap-6 md:flex">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link}
                    href={`#${link.toLowerCase()}`}
                    className="text-[14px] text-gray-900 transition-colors duration-300 hover:text-gray-500"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>

            {/* Right: availability, clock, CTA */}
            <div className="hidden items-center gap-5 md:flex">
              <a
                href="#/careers"
                className="text-[14px] text-gray-900 transition-colors duration-300 hover:text-gray-500"
              >
                Careers
              </a>
              <a
                href={CAL_BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-full bg-gray-900 py-2 pl-5 pr-2 text-[13px] font-medium text-white"
              >
                <span className="relative block h-[20px] overflow-hidden">
                  <span className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-translate-y-1/2">
                    <span className="flex h-[20px] items-center">Book a strategy call</span>
                    <span className="flex h-[20px] items-center" aria-hidden="true">
                      Book a strategy call
                    </span>
                  </span>
                </span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-gray-900">
                  <ArrowRight
                    size={12}
                    className="transition-transform duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:-rotate-45"
                  />
                </span>
              </a>
            </div>

            {/* Mobile: menu toggle */}
            <button
              onClick={() => setMenuOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2.5 text-[13px] font-medium text-white md:hidden"
            >
              Menu
              <Menu size={14} />
            </button>
          </nav>
        </div>
      </header>

      {/* ---------------- Mobile menu overlay ---------------- */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${menuOpen ? '' : 'pointer-events-none'}`}
        aria-hidden={!menuOpen}
      >
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-500 ${
            menuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setMenuOpen(false)}
        />
        <div
          className={`absolute inset-x-0 bottom-0 mx-3 mb-3 rounded-2xl bg-white p-6 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            menuOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="mb-8 flex items-center justify-between">
            <a
              href="#/careers"
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] text-gray-600"
            >
              Careers
            </a>
            <button
              onClick={() => setMenuOpen(false)}
              className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2.5 text-[13px] font-medium text-white"
            >
              Close
              <X size={14} />
            </button>
          </div>
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                className="text-[28px] font-medium leading-[32px] text-gray-900"
              >
                {link}
              </a>
            ))}
          </nav>
          <div className="mt-8">
            <RollButton
              label="Start a build"
              className="w-full justify-between"
              onClick={() => {
                setMenuOpen(false);
                scrollToContact();
              }}
            />
          </div>
        </div>
      </div>

      {/* ---------------- Spacer pushes content to the bottom ---------------- */}
      <div className="flex-1" />

      {/* ---------------- Hero content ---------------- */}
      <div className="relative z-20 mx-auto w-full max-w-[1440px] px-5 pb-14 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20">
        {/* Oversized bold brand wordmark */}
        <div
          className="select-none font-bold uppercase tracking-tight text-gray-900"
          style={{
            fontSize: 'clamp(3.5rem, 12.5vw, 11.5rem)',
            lineHeight: 0.95,
            letterSpacing: '-0.04em',
          }}
        >
          SHIFTORA
        </div>

        <p className="mb-5 mt-6 text-[13px] tracking-wide text-gray-900 sm:mb-8 sm:text-[14px]">
          Shiftora.ai
        </p>

        <h1 className="font-medium leading-[1.08] tracking-[-0.03em] text-gray-900 [font-size:clamp(1.75rem,7vw,4.2rem)] sm:[font-size:clamp(2.5rem,5vw,4.2rem)]">
          Tailored AI systems
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          that make large enterprises
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          AI-native.
        </h1>

        {/* CTA row */}
        <div className="mt-8 flex flex-col items-start gap-4 sm:mt-12 sm:flex-row sm:items-center sm:gap-5">
          <RollButton label="Start a build" onClick={scrollToContact} />

          {/* Frontier-models cluster, nominative use only */}
          <div
            title="Tools we build with, not affiliated or endorsed"
            className="inline-flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-[4px] bg-white px-3 py-2 shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-shadow duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.12)]"
          >
            <span className="text-[10px] uppercase tracking-widest text-gray-500">
              Powered by
            </span>
            {FRONTIER_MODELS.map(({ name, Mark }, i) => (
              <span key={name} className="flex items-center gap-x-3">
                {i > 0 && (
                  <span aria-hidden="true" className="h-4 w-px bg-gray-300" />
                )}
                <span className="flex items-center gap-1.5 text-gray-900">
                  <Mark />
                  <span className="text-[12px] font-medium text-gray-900 sm:text-[13px]">
                    {name}
                  </span>
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
