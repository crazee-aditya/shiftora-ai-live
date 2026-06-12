import { useEffect, useState } from 'react';
import Hero from './components/Hero';
import Approach from './components/Approach';
import CaseStudies from './components/CaseStudies';
import AiNative from './components/AiNative';
import Faq from './components/Faq';
import Careers from './components/Careers';

function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHashRoute();
  const isCareers = hash.startsWith('#/careers');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [isCareers]);

  if (isCareers) {
    return <Careers />;
  }

  return (
    <main className="min-h-screen bg-white antialiased">
      <Hero />
      <Approach />
      <CaseStudies />
      <AiNative />
      <Faq />
    </main>
  );
}
