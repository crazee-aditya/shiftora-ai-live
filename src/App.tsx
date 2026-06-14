import Careers from './components/Careers';
import HomePage from './pages/HomePage';
import BlogIndex from './pages/BlogIndex';
import BlogPost from './pages/BlogPost';
import NotFound from './pages/NotFound';

/**
 * Route-driven so the same component tree can be prerendered to static HTML at
 * build time (server passes `route`) and hydrated in the browser (reads the
 * current pathname). Navigation between routes is plain anchors → each route is
 * its own prerendered HTML file, so a full page load lands on real content.
 */
function resolvePath(route?: string): string {
  const raw = route ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  // strip trailing slash except root
  const path = raw.length > 1 ? raw.replace(/\/+$/, '') : raw;
  return path || '/';
}

export default function App({ route }: { route?: string }) {
  const path = resolvePath(route);

  if (path === '/') return <HomePage />;
  if (path === '/careers') return <Careers />;
  if (path === '/blog') return <BlogIndex />;
  if (path.startsWith('/blog/')) {
    return <BlogPost slug={path.slice('/blog/'.length)} />;
  }
  return <NotFound />;
}
