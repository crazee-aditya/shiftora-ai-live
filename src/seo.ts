import { ENGAGEMENT_NAMES } from './content';

export const SITE = {
  name: 'Shiftora',
  origin: 'https://www.shiftora.ai',
  defaultTitle: 'Shiftora — Integrated Strategy and Systems Firm',
  defaultDescription:
    'Shiftora is an integrated strategy and systems firm operating across world governments and enterprises, from strategy through systems and operation.',
  ogImage: 'https://www.shiftora.ai/og-image.png',
  logo: 'https://www.shiftora.ai/logo-512.png',
  email: 'info@shiftora.ai',
  founder: 'Shreshth Daga',
};

export interface RouteMeta {
  title: string;
  description: string;
  canonical: string;
  ogType: string;
  themeColor: string;
  jsonLd: object[];
  robots?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

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

function organizationGraph(): object[] {
  return [
    LOGO_NODE,
    OG_IMAGE_NODE,
    {
      '@type': 'Person',
      '@id': `${SITE.origin}/#shreshth-daga`,
      name: SITE.founder,
      jobTitle: 'Founder',
      worksFor: { '@id': `${SITE.origin}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE.origin}/#organization`,
      name: SITE.name,
      url: `${SITE.origin}/`,
      logo: { '@id': `${SITE.origin}/#logo` },
      image: { '@id': `${SITE.origin}/#og-image` },
      description: SITE.defaultDescription,
      slogan: 'Strategy at institutional scale demands the vantage to see the whole and the means to change it.',
      email: SITE.email,
      founder: { '@id': `${SITE.origin}/#shreshth-daga` },
      address: [
        { '@type': 'PostalAddress', addressLocality: 'Dubai', addressCountry: 'AE' },
        { '@type': 'PostalAddress', addressLocality: 'Mumbai', addressCountry: 'IN' },
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'business inquiries',
        email: SITE.email,
        availableLanguage: ['en'],
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE.origin}/#website`,
      url: `${SITE.origin}/`,
      name: SITE.name,
      description: SITE.defaultDescription,
      publisher: { '@id': `${SITE.origin}/#organization` },
      inLanguage: 'en',
    },
  ];
}

export function getRouteMeta(route: string): RouteMeta {
  const path = route.length > 1 ? route.replace(/\/+$/, '') : route;

  if (path === '/404') {
    return {
      title: 'Page not found — Shiftora',
      description: 'The page you are looking for does not exist.',
      canonical: `${SITE.origin}/404`,
      ogType: 'website',
      themeColor: '#eeece5',
      jsonLd: [],
      robots: 'noindex, follow',
    };
  }

  if (path === '/engagements') {
    const description =
      'Selected Shiftora engagements across public and enterprise institutions, from sovereign logistics and cross-border infrastructure to governed intelligence systems.';
    return {
      title: 'Engagements — Shiftora',
      description,
      canonical: `${SITE.origin}/engagements`,
      ogType: 'website',
      themeColor: '#090a0a',
      jsonLd: [
        ...organizationGraph(),
        {
          '@type': 'CollectionPage',
          '@id': `${SITE.origin}/engagements#page`,
          name: 'Shiftora Engagements',
          description,
          url: `${SITE.origin}/engagements`,
          isPartOf: { '@id': `${SITE.origin}/#website` },
          about: { '@id': `${SITE.origin}/#organization` },
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: ENGAGEMENT_NAMES.map((name, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name,
            })),
          },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'The firm', item: `${SITE.origin}/` },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Engagements',
              item: `${SITE.origin}/engagements`,
            },
          ],
        },
      ],
    };
  }

  return {
    title: SITE.defaultTitle,
    description: SITE.defaultDescription,
    canonical: `${SITE.origin}/`,
    ogType: 'website',
    themeColor: '#eeece5',
    jsonLd: [
      ...organizationGraph(),
      {
        '@type': 'AboutPage',
        '@id': `${SITE.origin}/#description`,
        name: 'Shiftora',
        description: SITE.defaultDescription,
        url: `${SITE.origin}/`,
        isPartOf: { '@id': `${SITE.origin}/#website` },
        about: { '@id': `${SITE.origin}/#organization` },
      },
    ],
  };
}

export function renderHead(meta: RouteMeta): string {
  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="theme-color" content="${meta.themeColor}" />`,
    meta.robots ? `<meta name="robots" content="${meta.robots}" />` : '',
    `<link rel="canonical" href="${meta.canonical}" />`,
    `<meta property="og:type" content="${meta.ogType}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:site_name" content="Shiftora" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`,
    `<meta property="og:url" content="${meta.canonical}" />`,
    `<meta property="og:image" content="${SITE.ogImage}" />`,
    `<meta property="og:image:alt" content="Shiftora — Every institution is governed twice." />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
    `<meta name="twitter:image" content="${SITE.ogImage}" />`,
    `<meta name="twitter:image:alt" content="Shiftora — Every institution is governed twice." />`,
  ];

  if (meta.jsonLd.length > 0) {
    const graph = { '@context': 'https://schema.org', '@graph': meta.jsonLd };
    tags.push(`<script type="application/ld+json">${JSON.stringify(graph)}</script>`);
  }

  return tags.filter(Boolean).join('\n    ');
}

export function allRoutes(): string[] {
  return ['/', '/engagements'];
}

export function sitemapEntries(): Array<{ loc: string; priority: string }> {
  return [
    { loc: `${SITE.origin}/`, priority: '1.0' },
    { loc: `${SITE.origin}/engagements`, priority: '0.9' },
  ];
}
