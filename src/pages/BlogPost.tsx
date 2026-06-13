import { ArrowUpRight } from 'lucide-react';
import { SiteHeader, SiteFooter } from '../components/SiteChrome';
import RollButton from '../components/RollButton';
import { getPost, formatDate } from '../lib/posts';
import { CAL_BOOKING_URL } from '../constants';

export default function BlogPost({ slug }: { slug: string }) {
  const post = getPost(slug);

  if (!post) {
    return (
      <main className="min-h-screen bg-white antialiased">
        <SiteHeader rightLabel="All articles" rightHref="/blog" />
        <section className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 lg:px-12">
          <h1 className="font-medium tracking-[-0.03em] text-gray-900 [font-size:clamp(2rem,6vw,3.5rem)]">
            Article not found.
          </h1>
          <a
            href="/blog"
            className="group mt-6 inline-flex items-center gap-2 text-[15px] font-semibold text-gray-900"
          >
            Back to all articles
            <ArrowUpRight
              size={16}
              className="transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </a>
        </section>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white antialiased">
      <SiteHeader rightLabel="All articles" rightHref="/blog" />

      <article className="mx-auto max-w-[760px] px-5 pb-16 pt-8 sm:px-8 sm:pt-12 lg:pb-24">
        <p className="text-[11px] uppercase tracking-widest text-gray-400">
          {formatDate(post.date)} · {post.readingTime}
        </p>
        <h1 className="mt-4 font-medium leading-[1.08] tracking-[-0.03em] text-gray-900 [font-size:clamp(2rem,5vw,3.25rem)]">
          {post.title}
        </h1>
        <p className="mt-5 text-[16px] leading-relaxed text-gray-500 sm:text-[18px]">
          {post.description}
        </p>

        <div
          className="blog-prose mt-10"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />

        {/* CTA */}
        <div className="mt-14 border-t border-gray-200 pt-10">
          <p className="max-w-xl text-[15px] leading-relaxed text-gray-600 sm:text-[16px]">
            Exploring a custom AI system for your organization? A short call is
            the fastest way to see where it would pay off.
          </p>
          <div className="mt-6">
            <RollButton label="Book a 30-min call" href={CAL_BOOKING_URL} />
          </div>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
