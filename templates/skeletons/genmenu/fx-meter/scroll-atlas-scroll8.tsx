import { useCallback, useEffect, useRef, useState } from 'react';
import { easeOutCubic } from '../../utils/scrollMath';

const METRICS = [
  { label: 'Compositor Frame Rate', target: 120, suffix: ' Hz', unit: 'Peak refresh budget' },
  { label: 'Gallery Plates Archived', target: 480, suffix: '+', unit: 'Curated architectural studies' },
  { label: 'Median Layout Shift', target: 0, suffix: '.00', unit: 'Zero CLS during transitions' },
  { label: 'Timeline Precision', target: 99, suffix: '%', unit: 'View & scroll sync fidelity' },
];

export function Scroll8() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<number[]>(METRICS.map((m) => m.target));
  const [hasAnimated, setHasAnimated] = useState(false);

  const runAnimation = useCallback(() => {
    const start = performance.now();
    const duration = 900;
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = easeOutCubic(t);
      setValues(METRICS.map((m) => Math.round(m.target * eased)));
      if (t < 1) {
        raf = window.requestAnimationFrame(step);
      }
    };
    raf = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || hasAnimated) return;
    let cleanup: (() => void) | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setHasAnimated(true);
          cleanup = runAnimation();
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (cleanup) cleanup();
    };
  }, [hasAnimated, runAnimation]);

  return (
    <section
      id="scroll-8"
      ref={sectionRef}
      aria-labelledby="scroll-8-heading"
      className="border-t border-[#E2E2DE] py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#575752]">
              Scroll8 · Typography & Data · IntersectionObserver number counters
            </p>
            <h2 id="scroll-8-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#111110] md:text-3xl">
              08. Scroll-Triggered Counters
            </h2>
          </div>
          <button
            type="button"
            onClick={() => runAnimation()}
            className="rounded-md border border-[#E2E2DE] bg-white px-4 py-2 text-xs font-medium text-[#111110] hover:bg-[#EEEEEC] transition-colors whitespace-nowrap shrink-0"
          >
            Replay Counters
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((metric, idx) => (
            <div
              key={metric.label}
              className="rounded-xl border border-[#E2E2DE] bg-white p-6"
            >
              <p className="text-xs font-medium text-[#575752]">{metric.label}</p>
              <p className="mt-4 font-mono text-4xl font-medium tracking-tight tabular-nums text-[#111110]">
                {values[idx]}
                <span className="text-[#1D4ED8]">{metric.suffix}</span>
              </p>
              <p className="mt-2 text-xs text-[#575752]">{metric.unit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Scroll8;
