import { useEffect, useRef, useState } from 'react';
import { computeViewportTraversal } from '../../utils/scrollMath';

const SUB_SECTIONS = [
  {
    num: '01',
    heading: 'Compositor-Safe ScaleX Metering',
    body: 'Progress bars driven by transform: scaleX() avoid layout recalculations on every scroll frame. Anchor the origin to the left edge so the bar expands smoothly across the full section measure.',
  },
  {
    num: '02',
    heading: 'Independent Section Scopes',
    body: 'Rather than tracking only the global document scroll height, per-section meters normalize bounding-box traversal from bottom viewport entry to upper exit.',
  },
  {
    num: '03',
    heading: 'Tabular Readouts Without Jitter',
    body: 'Pairing the linear bar with font-mono tabular-nums guarantees digits stay horizontally locked while counting smoothly from 0% through 100%.',
  },
];

export function Scroll4() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0.42);
  const [subProgress, setSubProgress] = useState<number[]>([0.72, 0.48, 0.24]);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        setProgress(computeViewportTraversal(rect.top, rect.height, window.innerHeight));
      }
      setSubProgress(
        itemRefs.current.map((el) => {
          if (!el) return 0.5;
          const r = el.getBoundingClientRect();
          return computeViewportTraversal(r.top, r.height, window.innerHeight);
        }),
      );
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      id="scroll-4"
      ref={sectionRef}
      aria-labelledby="scroll-4-heading"
      className="border-t border-[#E2E2DE] py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="sticky top-16 z-10 -mx-2 mb-10 rounded-lg border border-[#E2E2DE] bg-[#F7F7F5]/95 px-4 py-3 backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium tracking-wide text-[#575752]">
                Scroll4 · Typography & Data · Per-section progress meter
              </p>
              <h2 id="scroll-4-heading" className="mt-1 font-display text-xl font-semibold text-[#111110] md:text-2xl">
                04. Section Progress Meter
              </h2>
            </div>
            <span className="font-mono text-sm font-medium tabular-nums text-[#1D4ED8]">
              {Math.round(progress * 100)}% traversed
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#E2E2DE]">
            <div
              className="h-full w-full origin-left bg-[#1D4ED8] transition-transform duration-75"
              style={{ transform: `scaleX(${Math.max(0.03, progress)})` }}
            />
          </div>
        </div>

        <div className="space-y-6">
          {SUB_SECTIONS.map((sub, idx) => {
            const p = subProgress[idx] ?? 0.5;
            return (
              <div
                key={sub.num}
                ref={(el) => {
                  itemRefs.current[idx] = el;
                }}
                className="rounded-xl border border-[#E2E2DE] bg-white p-6 md:p-8"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h3 className="font-display text-lg font-semibold text-[#111110]">
                    {sub.num}. {sub.heading}
                  </h3>
                  <span className="font-mono text-xs tabular-nums text-[#575752]">
                    Block {Math.round(p * 100)}%
                  </span>
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#575752]">
                  {sub.body}
                </p>
                <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-[#EEEEEC]">
                  <div
                    className="h-full w-full origin-left bg-[#111110]"
                    style={{ transform: `scaleX(${Math.max(0.04, p)})` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Scroll4;
