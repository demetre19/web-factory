import { useEffect, useRef, useState } from 'react';
import { clamp } from '../../utils/scrollMath';

const TERMS_ROW_A = [
  'Scroll Timeline',
  'Sticky Containment',
  'Compositor Layers',
  'Aperture Geometry',
  'Tabular Telemetry',
  'View Progress',
];

const TERMS_ROW_B = [
  'Parallax Ratios',
  'Snap Alignment',
  'Radial Dashoffset',
  'Counter-Scroll Shear',
  'Frame Scrubbing',
  'Clip-Path Reveal',
];

export function Scroll17() {
  const [offset, setOffset] = useState(0);
  const [skew, setSkew] = useState(0);
  const lastYRef = useRef(0);

  useEffect(() => {
    lastYRef.current = window.scrollY;
    let raf = 0;
    let decayTimer = 0;

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const currentY = window.scrollY;
        const delta = currentY - lastYRef.current;
        lastYRef.current = currentY;
        setOffset((prev) => (prev + delta * 0.35) % 420);
        setSkew(clamp(delta * 0.14, -7, 7));

        window.clearTimeout(decayTimer);
        decayTimer = window.setTimeout(() => setSkew(0), 120);
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
      window.clearTimeout(decayTimer);
    };
  }, []);

  return (
    <section
      id="scroll-17"
      aria-labelledby="scroll-17-heading"
      className="border-t border-[#E2E2DE] py-16 md:py-24 overflow-x-clip"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#575752]">
              Scroll17 · Spatial & Media · Velocity-reactive opposing ribbons
            </p>
            <h2 id="scroll-17-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#111110] md:text-3xl">
              17. Velocity-Reactive Marquee
            </h2>
          </div>
          <p className="font-mono text-xs tabular-nums text-[#575752]">
            Skew {skew.toFixed(1)}deg
          </p>
        </div>

        <div className="space-y-4 overflow-hidden rounded-xl border border-[#E2E2DE] bg-white py-8">
          <div
            style={{ transform: `translate3d(${-140 - offset}px, 0, 0) skewX(${skew}deg)` }}
            className="flex gap-8 whitespace-nowrap will-change-transform transition-transform duration-100 ease-out"
          >
            {[...TERMS_ROW_A, ...TERMS_ROW_A].map((term, i) => (
              <span
                key={`a-${i}`}
                className="font-display text-2xl font-semibold tracking-tight text-[#111110] md:text-3xl"
              >
                {term} <span className="mx-3 text-[#1D4ED8]" aria-hidden="true">·</span>
              </span>
            ))}
          </div>

          <div
            style={{ transform: `translate3d(${-260 + offset}px, 0, 0) skewX(${-skew}deg)` }}
            className="flex gap-8 whitespace-nowrap will-change-transform transition-transform duration-100 ease-out"
          >
            {[...TERMS_ROW_B, ...TERMS_ROW_B].map((term, i) => (
              <span
                key={`b-${i}`}
                className="font-display text-2xl font-medium tracking-tight text-[#575752] md:text-3xl"
              >
                {term} <span className="mx-3 text-[#C2C2BC]" aria-hidden="true">/</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Scroll17;
