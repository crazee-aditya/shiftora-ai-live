import { useEffect } from 'react';
import EstateConcept from './concepts/EstateConcept';
import EngagementDetail from './concepts/EngagementDetail';
import { CONCEPT_RECORDS } from './concepts/conceptData';
import CareersPage from './pages/CareersPage';
import EngagementsPage from './pages/EngagementsPage';
import NotFound from './pages/NotFound';

function resolvePath(route?: string): string {
  const raw = route ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  return raw.length > 1 ? raw.replace(/\/+$/, '') : raw || '/';
}

export default function App({ route }: { route?: string }) {
  const path = resolvePath(route);

  useEffect(() => {
    const slug = path.startsWith('/engagements/') ? path.slice('/engagements/'.length) : null;
    const engagement = slug ? CONCEPT_RECORDS.find(record => record.slug === slug) : null;
    document.title = path === '/engagements'
      ? 'Shiftora — Selected engagements'
      : path === '/careers'
        ? 'Shiftora — Careers'
        : engagement
          ? `Shiftora — ${engagement.title}`
          : 'Shiftora — Institutional intelligence.';
  }, [path]);

  if (path === '/') return <EstateConcept basePath="" />;
  if (path === '/engagements') return <EngagementsPage concept="estate" basePath="" />;
  if (path.startsWith('/engagements/')) return <EngagementDetail slug={path.slice('/engagements/'.length)} concept="estate" basePath="" />;
  if (path === '/careers') return <CareersPage concept="estate" basePath="" />;
  return <NotFound />;
}
