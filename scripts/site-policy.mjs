export const RETIRED_PATHS = Object.freeze([
  '/careers',
  '/blog',
  '/blog/custom-ai-vs-off-the-shelf-tools',
  '/blog/how-long-to-ship-a-custom-enterprise-ai-system',
  '/blog/predictive-crm-sales-team-operating-larger',
  '/blog/rebuilding-a-core-platform-without-breaking-it',
  '/blog/what-does-a-custom-enterprise-ai-engagement-cost',
  '/blog/what-is-an-ai-native-enterprise',
]);

export const SITE_CSP =
  "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests";

export const SITE_HSTS = 'max-age=31536000';

export const COMMON_SECURITY_HEADERS = Object.freeze({
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': SITE_CSP,
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': SITE_HSTS,
});
