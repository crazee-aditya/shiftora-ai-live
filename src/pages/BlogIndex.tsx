import { SiteHeader, SiteFooter } from '../components/SiteChrome';
import { getAllPosts, formatDate } from '../lib/posts';

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-white antialiased">
      <SiteHeader />

      {/* Intro */}
      <section className="mx-auto max-w-[1440px] px-5 pb-12 pt-10 sm:px-8 sm:pt-14 lg:px-12">
        <p className="text-[13px] tracking-wide text-gray-500">{'// Blog'}</p>
        <h1 className="mt-4 font-medium leading-[1.05] tracking-[-0.03em] text-gray-900 [font-size:clamp(2.25rem,7vw,4.5rem)]">
          Notes on building AI-native enterprises.
        </h1>
        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-gray-600 sm:text-[17px]">
          Field notes from building custom AI systems for large enterprises:
          what AI-native actually means, how we ship to production in weeks, and
          where tailored systems beat off-the-shelf tools.
        </p>
      </section>

      {/* Post list */}
      <section className="mx-auto max-w-[1440px] px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
        <div className="border-t border-gray-200">
          {posts.length === 0 && (
            <p className="py-10 text-[15px] text-gray-500">
              New writing is on the way.
            </p>
          )}
          {posts.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block border-b border-gray-200 py-8 sm:py-10"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8">
                <h2 className="max-w-3xl text-[20px] font-medium tracking-tight text-gray-900 transition-colors duration-300 group-hover:text-gray-500 sm:text-[26px]">
                  {post.title}
                </h2>
                <span className="shrink-0 text-[11px] uppercase tracking-widest text-gray-400">
                  {formatDate(post.date)} · {post.readingTime}
                </span>
              </div>
              <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-gray-600 sm:text-[15px]">
                {post.description}
              </p>
            </a>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
