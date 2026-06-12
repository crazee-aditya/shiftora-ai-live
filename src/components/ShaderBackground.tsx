import React, { useEffect, useRef, useState } from 'react';
import {
  Shader,
  Swirl,
  ChromaFlow,
  FlutedGlass,
  FilmGrain,
} from 'shaders/react';

/* ------------------------------------------------------------------ */
/* Canvas fallback: monochrome film grain + slow drifting soft white/  */
/* gray radial gradients. Used when shaders/react cannot render.       */
/* ------------------------------------------------------------------ */
function CanvasFallback() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let running = true;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // pre-render a grain tile for performance
    const grainSize = 160;
    const grain = document.createElement('canvas');
    grain.width = grainSize;
    grain.height = grainSize;
    const gctx = grain.getContext('2d')!;
    const renderGrain = () => {
      const img = gctx.createImageData(grainSize, grainSize);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = 14; // ~0.05 strength
      }
      gctx.putImageData(img, 0, 0);
    };

    const blobs = [
      { x: 0.25, y: 0.3, r: 0.55, sx: 0.00011, sy: 0.00007, p: 0, light: true },
      { x: 0.75, y: 0.25, r: 0.5, sx: 0.00009, sy: 0.00012, p: 2, light: true },
      { x: 0.5, y: 0.75, r: 0.6, sx: 0.00007, sy: 0.0001, p: 4, light: false },
      { x: 0.85, y: 0.7, r: 0.45, sx: 0.00012, sy: 0.00008, p: 1.3, light: false },
    ];

    let lastGrain = 0;
    const draw = (t: number) => {
      if (!running) return;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = '#efefef';
      ctx.fillRect(0, 0, w, h);

      for (const b of blobs) {
        const cx = (b.x + Math.sin(t * b.sx + b.p) * 0.16) * w;
        const cy = (b.y + Math.cos(t * b.sy + b.p) * 0.14) * h;
        const r = b.r * Math.max(w, h);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        if (b.light) {
          g.addColorStop(0, 'rgba(255,255,255,0.85)');
          g.addColorStop(0.5, 'rgba(240,240,240,0.35)');
          g.addColorStop(1, 'rgba(240,240,240,0)');
        } else {
          g.addColorStop(0, 'rgba(17,17,17,0.10)');
          g.addColorStop(0.6, 'rgba(17,17,17,0.04)');
          g.addColorStop(1, 'rgba(17,17,17,0)');
        }
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // film grain (refresh tile ~12fps for shimmer)
      if (t - lastGrain > 80) {
        renderGrain();
        lastGrain = t;
      }
      ctx.save();
      const pattern = ctx.createPattern(grain, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.restore();

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="h-full w-full" />;
}

/* ------------------------------------------------------------------ */
/* Error boundary so a shader runtime failure swaps to the fallback.   */
/* ------------------------------------------------------------------ */
class ShaderErrorBoundary extends React.Component<
  { onError: () => void; children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

/* ------------------------------------------------------------------ */
/* Full-screen monochrome animated hero background.                    */
/* ------------------------------------------------------------------ */
export default function ShaderBackground() {
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    // shaders v2 renders via WebGPU; bail out early if unavailable
    if (typeof navigator !== 'undefined' && !('gpu' in navigator)) {
      setUseFallback(true);
    }
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
      {useFallback ? (
        <CanvasFallback />
      ) : (
        <ShaderErrorBoundary onError={() => setUseFallback(true)}>
          <Shader className="h-full w-full" style={{ width: '100%', height: '100%' }}>
            <Swirl colorA="#ffffff" colorB="#f0f0f0" detail={1.7} />
            <ChromaFlow
              baseColor="#ffffff"
              downColor="#111111"
              leftColor="#111111"
              rightColor="#111111"
              upColor="#111111"
              momentum={13}
              radius={3.5}
            />
            <FlutedGlass
              aberration={0.61}
              angle={31}
              frequency={8}
              highlight={0.12}
              highlightSoftness={0}
              lightAngle={-90}
              refraction={4}
              shape="rounded"
              softness={1}
              speed={0.15}
            />
            <FilmGrain strength={0.05} />
          </Shader>
        </ShaderErrorBoundary>
      )}
    </div>
  );
}
