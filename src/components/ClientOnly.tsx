import { Suspense, useEffect, useState, type ReactNode } from 'react';

/**
 * Renders children only in the browser, after mount. During server-side
 * prerendering (and on the very first client render, to match the prerendered
 * HTML) it renders `fallback` instead. This keeps browser-only components
 * (WebGPU shaders, three.js canvases) out of the build-time render and avoids
 * hydration mismatches. Children are wrapped in Suspense so they can be
 * lazy-imported — their modules never load during SSR.
 */
export default function ClientOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <>{fallback}</>;
  return <Suspense fallback={fallback}>{children}</Suspense>;
}
