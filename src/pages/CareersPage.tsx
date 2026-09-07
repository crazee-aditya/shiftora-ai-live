import { BrandFooter, BrandHeader } from '../components/BrandFrame';
import { DirectionalArrow } from '../components/DirectionalArrow';
import type { ConceptId } from '../concepts/conceptData';

export default function CareersPage({ concept, basePath }: { concept?: ConceptId; basePath?: string } = {}) {
  return (
    <div className="careers-page" data-concept={concept}>
      <BrandHeader active="careers" concept={concept} basePath={basePath} />
      <main className="careers-page__main" id="main-content" tabIndex={-1}>
        <p className="page-kicker">The firm</p>
        <div className="careers-page__composition">
          <h1>Careers</h1>
          <div className="careers-page__body">
            <p>
              Appointment to Shiftora is reserved for people of uncommon judgment and technical
              depth—those fit to be entrusted with work on which institutions depend.
            </p>
            <div className="careers-page__apply">
              <span>Email to apply</span>
              <a href="mailto:info@shiftora.ai">
                info@shiftora.ai
                <DirectionalArrow />
              </a>
            </div>
          </div>
        </div>
      </main>
      <BrandFooter active="careers" concept={concept} basePath={basePath} />
    </div>
  );
}
