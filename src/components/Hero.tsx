import { lazy, useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import RollButton from './RollButton';
import ClientOnly from './ClientOnly';
import { CAL_BOOKING_URL } from '../constants';

// Browser-only (WebGPU); lazy + ClientOnly so it never loads during the
// build-time render and produces no hydration mismatch.
const ShaderBackground = lazy(() => import('./ShaderBackground'));

const NAV_LINKS = ['Approach', 'Work', 'Systems', 'Contact'];

function scrollToContact() {
  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
}

export default function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <section className="relative flex min-h-screen flex-col overflow-hidden bg-[#EFEFEF]">
      <ClientOnly>
        <ShaderBackground />
      </ClientOnly>

      {/* ---------------- Navigation ---------------- */}
      <header className="relative z-20">
        <div className="mx-auto max-w-[1440px] p-2 sm:p-3">
          <nav className="flex items-center justify-between rounded-full bg-white p-[5px]">
            {/* Left: logo + links */}
            <div className="flex items-center gap-6">
              <a href="#" className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 sm:h-10 sm:w-10">
                  <span className="text-[9px] font-bold tracking-tight text-white sm:text-[10px]">
                    S.AI
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
                href="/careers"
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
              href="/careers"
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
          className="mb-6 select-none font-bold uppercase tracking-tight text-gray-900 sm:mb-8"
          style={{
            fontSize: 'clamp(1.5rem, 8.2vw, 8rem)',
            lineHeight: 0.95,
            letterSpacing: '-0.04em',
          }}
        >
          Shiftora.ai
        </div>

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
        <div className="mt-8 sm:mt-12">
          <RollButton label="Start a build" onClick={scrollToContact} />
        </div>
      </div>
    </section>
  );
}
