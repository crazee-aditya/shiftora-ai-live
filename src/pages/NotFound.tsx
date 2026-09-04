import { BrandFooter, BrandHeader } from '../components/BrandFrame';
import { DirectionalArrow } from '../components/DirectionalArrow';

export default function NotFound() {
  return (
    <div className="not-found-page">
      <BrandHeader active="none" />
      <main className="not-found-page__main" id="main-content" tabIndex={-1}>
        <p className="page-kicker">404</p>
        <h1>This page does not exist.</h1>
        <a href="/">
          Return to Shiftora
          <DirectionalArrow />
        </a>
      </main>
      <BrandFooter active="none" />
    </div>
  );
}
