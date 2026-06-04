/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // All imagery is wired through next/image. The default build ships CSS-based
  // grayscale placeholders (see components/Placeholder.tsx), so no remote image
  // domains are required. When real assets are added under /public, reference
  // them directly; if any remote sources are introduced, allow them here.
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
