import { ArrowUpRight } from 'lucide-react';
import { SiteHeader, SiteFooter } from '../components/SiteChrome';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col bg-white antialiased">
      <SiteHeader />
      <section className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col justify-center px-5 py-24 sm:px-8 lg:px-12">
        <p className="text-[13px] tracking-wide text-gray-500">{'// 404'}</p>
        <h1 className="mt-4 font-medium leading-[1.05] tracking-[-0.03em] text-gray-900 [font-size:clamp(2.25rem,7vw,4.5rem)]">
          Page not found.
        </h1>
        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-gray-600 sm:text-[17px]">
          The page you are looking for does not exist or has moved.
        </p>
        <div className="mt-8 flex flex-wrap gap-6">
          <a
            href="/"
            className="group inline-flex items-center gap-2 text-[15px] font-semibold text-gray-900"
          >
            Back to home
            <ArrowUpRight
              size={16}
              className="transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
          <a
            href="/blog"
            className="group inline-flex items-center gap-2 text-[15px] font-semibold text-gray-500"
          >
            Read the blog
            <ArrowUpRight
              size={16}
              className="transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
