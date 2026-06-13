import Hero from '../components/Hero';
import Approach from '../components/Approach';
import CaseStudies from '../components/CaseStudies';
import AiNative from '../components/AiNative';
import Faq from '../components/Faq';

export default function HomePage() {
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
