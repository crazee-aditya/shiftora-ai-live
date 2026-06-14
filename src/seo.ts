import { getAllPosts, getPost } from './lib/posts';

export const SITE = {
  name: 'Shiftora',
  origin: 'https://www.shiftora.ai',
  defaultTitle: 'Shiftora · Custom Enterprise AI Systems',
  defaultDescription:
    'Shiftora builds custom enterprise AI systems, software, and intelligent automations that make large enterprises AI-native. Senior-led engineering, shipped to production in weeks, not quarters.',
  ogImage: 'https://www.shiftora.ai/og-image.png',
  logo: 'https://www.shiftora.ai/logo-512.png',
  email: 'info@shiftora.ai',
  phone: '+971556065297',
  founder: 'Shreshth Daga',
};

export interface RouteMeta {
  title: string;
  description: string;
  canonical: string;
  ogType: string;
  jsonLd: object[];
  robots?: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Verified external profiles. ONLY add URLs that resolve (HTTP 200) and belong
// to Shiftora; a dead or wrong sameAs hurts entity resolution. Once filled,
// these auto-populate Organization.sameAs / the founder Person.sameAs and the
// "Profiles" section of llms.txt is maintained separately.
const ORG_SAME_AS: string[] = [];
const FOUNDER_SAME_AS: string[] = [];

const LOGO_NODE = {
  '@type': 'ImageObject',
  '@id': `${SITE.origin}/#logo`,
  url: SITE.logo,
  contentUrl: SITE.logo,
  width: 512,
  height: 512,
  caption: 'Shiftora',
};

const OG_IMAGE_NODE = {
  '@type': 'ImageObject',
  '@id': `${SITE.origin}/#og-image`,
  url: SITE.ogImage,
  contentUrl: SITE.ogImage,
  width: 1200,
  height: 630,
};

const FOUNDER_NODE = {
  '@type': 'Person',
  '@id': `${SITE.origin}/#shreshth-daga`,
  name: SITE.founder,
  jobTitle: 'Founder',
  worksFor: { '@id': `${SITE.origin}/#organization` },
  ...(FOUNDER_SAME_AS.length ? { sameAs: FOUNDER_SAME_AS } : {}),
};

/** The persistent entity graph: images, founder, Organization, WebSite, Service. */
function organizationGraph(): object[] {
  return [
    LOGO_NODE,
    OG_IMAGE_NODE,
    FOUNDER_NODE,
    {
      '@type': 'Organization',
      '@id': `${SITE.origin}/#organization`,
      name: 'Shiftora',
      url: `${SITE.origin}/`,
      logo: { '@id': `${SITE.origin}/#logo` },
      image: { '@id': `${SITE.origin}/#og-image` },
      description: SITE.defaultDescription,
      slogan: 'Tailored AI systems that make large enterprises AI-native.',
      email: SITE.email,
      telephone: '+971 55 606 5297',
      founder: { '@id': `${SITE.origin}/#shreshth-daga` },
      ...(ORG_SAME_AS.length ? { sameAs: ORG_SAME_AS } : {}),
      areaServed: [
        { '@type': 'Country', name: 'United Arab Emirates' },
        { '@type': 'Country', name: 'India' },
        { '@type': 'Place', name: 'Worldwide' },
      ],
      address: [
        { '@type': 'PostalAddress', addressLocality: 'Dubai', addressCountry: 'AE' },
        { '@type': 'PostalAddress', addressLocality: 'Mumbai', addressCountry: 'IN' },
      ],
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'sales',
          email: 'hello@shiftora.ai',
          telephone: '+971 55 606 5297',
          availableLanguage: ['en'],
        },
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: 'info@shiftora.ai',
          availableLanguage: ['en'],
        },
      ],
      knowsAbout: [
        'Enterprise AI systems',
        'Custom software development',
        'Intelligent automation',
        'Predictive lead scoring',
        'Large language model applications',
        'AI agents',
        'Computer vision',
        'Custom CRM development',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE.origin}/#website`,
      url: `${SITE.origin}/`,
      name: 'Shiftora',
      description: SITE.defaultDescription,
      publisher: { '@id': `${SITE.origin}/#organization` },
      inLanguage: 'en',
    },
    {
      '@type': 'Service',
      '@id': `${SITE.origin}/#service`,
      serviceType: 'Custom enterprise AI systems and intelligent automation',
      provider: { '@id': `${SITE.origin}/#organization` },
      areaServed: ['United Arab Emirates', 'India', 'Worldwide'],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Shiftora capabilities',
        itemListElement: [
          'Predictive lead scoring & sales intelligence',
          'Custom CRM & high-volume outbound systems',
          'LLM applications, RAG & autonomous agents',
          'Predictive forecasting & machine learning',
          'Computer vision systems',
          'Document automation & intelligent workflows',
          'Full-platform AI rebuilds',
        ].map((name) => ({
          '@type': 'Offer',
          itemOffered: { '@type': 'Service', name },
        })),
      },
    },
  ];
}

function faqGraph(): object {
  const faqs: Array<{ q: string; a: string }> = [
    {
      q: 'Are these custom-tailored implementations?',
      a: 'Yes. Every Shiftora system is built from the ground up around your stack, data, and operating model, never an off-the-shelf template dropped on top.',
    },
    {
      q: 'What does an engagement cost?',
      a: "Pricing is scoped per engagement. We size it during a custom discovery call, once we understand the workflows in play. There's no generic price list, because there's no generic build.",
    },
    {
      q: 'Do you work with companies globally?',
      a: 'Yes. We partner with enterprises worldwide, not only the USA, UAE, or India. Delivery is remote-first and senior-led, wherever you operate.',
    },
    {
      q: 'How fast can a system go live?',
      a: 'Most engagements move from scope to a live production system in weeks, not quarters.',
    },
    {
      q: 'Do you replace our team?',
      a: 'No, we augment it. Our systems act as decision-support and execution layers that let your existing team operate like a much larger one.',
    },
  ];
  return {
    '@type': 'FAQPage',
    '@id': `${SITE.origin}/#faq`,
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function getRouteMeta(route: string): RouteMeta {
  const path = route.length > 1 ? route.replace(/\/+$/, '') : route;

  if (path === '/404') {
    return {
      title: 'Page not found · Shiftora',
      description: 'The page you are looking for does not exist or has moved.',
      canonical: `${SITE.origin}/404`,
      ogType: 'website',
      jsonLd: [],
      robots: 'noindex, follow',
    };
  }

  if (path === '/careers') {
    return {
      title: 'Careers · Shiftora',
      description:
        'Join Shiftora. We hire young, high-energy, highly adaptable engineers to build custom enterprise AI systems. Open roles in Mumbai and Dubai.',
      canonical: `${SITE.origin}/careers`,
      ogType: 'website',
      jsonLd: [
        ...organizationGraph(),
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.origin}/` },
            { '@type': 'ListItem', position: 2, name: 'Careers', item: `${SITE.origin}/careers` },
          ],
        },
      ],
    };
  }

  if (path === '/blog') {
    return {
      title: 'Blog · Shiftora',
      description:
        'Notes on building AI-native enterprises: what AI-native means, shipping custom AI systems to production in weeks, and when tailored builds beat off-the-shelf tools.',
      canonical: `${SITE.origin}/blog`,
      ogType: 'website',
      jsonLd: [
        ...organizationGraph(),
        {
          '@type': 'Blog',
          '@id': `${SITE.origin}/blog#blog`,
          name: 'Shiftora Blog',
          url: `${SITE.origin}/blog`,
          publisher: { '@id': `${SITE.origin}/#organization` },
          blogPost: getAllPosts().map((p) => ({
            '@type': 'BlogPosting',
            headline: p.title,
            description: p.description,
            datePublished: p.date,
            url: `${SITE.origin}/blog/${p.slug}`,
          })),
        },
      ],
    };
  }

  if (path.startsWith('/blog/')) {
    const slug = path.slice('/blog/'.length);
    const post = getPost(slug);
    if (post) {
      return {
        title: `${post.title} · Shiftora`,
        description: post.description,
        canonical: `${SITE.origin}/blog/${post.slug}`,
        ogType: 'article',
        jsonLd: [
          LOGO_NODE,
          OG_IMAGE_NODE,
          FOUNDER_NODE,
          { '@type': 'Organization', '@id': `${SITE.origin}/#organization`, name: 'Shiftora', url: `${SITE.origin}/`, logo: { '@id': `${SITE.origin}/#logo` } },
          {
            '@type': 'BlogPosting',
            '@id': `${SITE.origin}/blog/${post.slug}#article`,
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            dateModified: post.updated || post.date,
            url: `${SITE.origin}/blog/${post.slug}`,
            author: { '@id': `${SITE.origin}/#shreshth-daga` },
            publisher: { '@id': `${SITE.origin}/#organization` },
            mainEntityOfPage: `${SITE.origin}/blog/${post.slug}`,
            image: { '@id': `${SITE.origin}/#og-image` },
            inLanguage: 'en',
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.origin}/` },
              { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE.origin}/blog` },
              { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE.origin}/blog/${post.slug}` },
            ],
          },
        ],
      };
    }
  }

  // Home (and fallback)
  return {
    title: SITE.defaultTitle,
    description: SITE.defaultDescription,
    canonical: `${SITE.origin}/`,
    ogType: 'website',
    jsonLd: [...organizationGraph(), faqGraph()],
  };
}

/** Serialize a RouteMeta into the <head> HTML injected by the prerender step. */
export function renderHead(meta: RouteMeta): string {
  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    meta.robots ? `<meta name="robots" content="${meta.robots}" />` : '',
    `<link rel="canonical" href="${meta.canonical}" />`,
    `<meta property="og:type" content="${meta.ogType}" />`,
    `<meta property="og:site_name" content="Shiftora" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${meta.canonical}" />`,
    `<meta property="og:image" content="${SITE.ogImage}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${SITE.ogImage}" />`,
  ];
  if (meta.jsonLd.length > 0) {
    const graph = { '@context': 'https://schema.org', '@graph': meta.jsonLd };
    tags.push(`<script type="application/ld+json">${JSON.stringify(graph)}</script>`);
  }
  return tags.filter(Boolean).join('\n    ');
}

/** All routes to prerender (static ones + every blog post). */
export function allRoutes(): string[] {
  return ['/', '/careers', '/blog', ...getAllPosts().map((p) => `/blog/${p.slug}`)];
}

/**
 * Sitemap entries with accurate per-URL lastmod. Posts use their own
 * published/updated date; the blog index uses the newest post date; static
 * pages use the build date (they did change on this deploy). Google ignores
 * <priority>, but it is harmless and kept for clarity.
 */
export function sitemapEntries(
  buildDate: string
): Array<{ loc: string; lastmod: string; priority: string }> {
  const posts = getAllPosts();
  const newest = posts.reduce((m, p) => {
    const d = p.updated || p.date;
    return d > m ? d : m;
  }, '');
  return [
    { loc: `${SITE.origin}/`, lastmod: buildDate, priority: '1.0' },
    { loc: `${SITE.origin}/careers`, lastmod: buildDate, priority: '0.8' },
    { loc: `${SITE.origin}/blog`, lastmod: newest || buildDate, priority: '0.8' },
    ...posts.map((p) => ({
      loc: `${SITE.origin}/blog/${p.slug}`,
      lastmod: p.updated || p.date || buildDate,
      priority: '0.6',
    })),
  ];
}
