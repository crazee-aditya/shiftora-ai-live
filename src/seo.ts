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
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** The persistent Organization + WebSite + Service + FAQ entity graph. */
function organizationGraph(): object[] {
  return [
    {
      '@type': 'Organization',
      '@id': `${SITE.origin}/#organization`,
      name: 'Shiftora',
      url: `${SITE.origin}/`,
      logo: SITE.logo,
      image: SITE.ogImage,
      description: SITE.defaultDescription,
      slogan: 'Tailored AI systems that make large enterprises AI-native.',
      email: SITE.email,
      telephone: '+971 55 606 5297',
      founder: { '@type': 'Person', name: SITE.founder },
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
          {
            '@type': 'BlogPosting',
            '@id': `${SITE.origin}/blog/${post.slug}#article`,
            headline: post.title,
            description: post.description,
            datePublished: post.date,
            dateModified: post.date,
            url: `${SITE.origin}/blog/${post.slug}`,
            author: { '@id': `${SITE.origin}/#organization` },
            publisher: { '@id': `${SITE.origin}/#organization` },
            mainEntityOfPage: `${SITE.origin}/blog/${post.slug}`,
            image: SITE.ogImage,
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

/** Serialize a RouteMeta into the <head> HTML injected at the {{SSG_HEAD}} slot. */
export function renderHead(meta: RouteMeta): string {
  const graph = {
    '@context': 'https://schema.org',
    '@graph': meta.jsonLd,
  };
  return [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
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
    `<script type="application/ld+json">${JSON.stringify(graph)}</script>`,
  ].join('\n    ');
}

/** All routes to prerender (static ones + every blog post). */
export function allRoutes(): string[] {
  return ['/', '/careers', '/blog', ...getAllPosts().map((p) => `/blog/${p.slug}`)];
}
