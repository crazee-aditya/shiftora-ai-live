import { renderToString } from 'react-dom/server';
import App from './App';
import { allRoutes, getRouteMeta, renderHead, sitemapEntries } from './seo';

export function render(route: string): string {
  return renderToString(<App route={route} />);
}

export { allRoutes, getRouteMeta, renderHead, sitemapEntries };
