import { useEffect, useRef, useState } from 'react';
import { computeViewportTraversal } from '../../utils/scrollMath';

const MILESTONES = [
  {
    step: '01',
    threshold: 0.15,
    title: 'Viewport Entry Detection',
    detail: 'Bounding box crosses the lower threshold and initializes axis tracking.',
  },
  {
    step: '02',
    threshold: 0.4,
    title: 'Spine Vector Interpolation',
    detail: 'SVG stroke-dashoffset unwinds linearly downward to match scroll depth.',
  },
  {
    step: '03',
    threshold: 0.65,
    title: 'Node Threshold Activation',
    detail: 'Individual milestone rings illuminate cleanly once traversal passes their normalized mark.',
  },
  {
    step: '04',
    threshold: 0.88,
    title: 'Full Axis Completion',
    detail: 'All four architectural stages lock into high-contrast settled state.',
  },
];

export function Scroll19() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0.55);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setProgress(computeViewportTraversal(rect.top, rect.height, window.innerHeight));
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

  const lineLength = 360;
  const drawnOffset = lineLength * (1 - progress);

  return (
    <section
      id="scroll-19"
      ref={containerRef}
      aria-labelledby="scroll-19-heading"
      className="border-t border-[#E2E2DE] py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#575752]">
              Scroll19 · Typography & Data · SVG spine draw + milestones
            </p>
            <h2 id="scroll-19-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#111110] md:text-3xl">
              19. Timeline Spine Draw
            </h2>
          </div>
          <span className="font-mono text-xs tabular-nums text-[#575752]">
            Axis {Math.round(progress * 100)}% drawn
          </span>
        </div>

        <div className="relative grid gap-6 pl-10 md:pl-14">
          <svg
            className="pointer-events-none absolute top-4 left-3 h-[calc(100%-2rem)] w-4 md:left-5"
            viewBox="0 0 16 360"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <line x1="8" y1="0" x2="8" y2={lineLength} stroke="#E2E2DE" strokeWidth="2" />
            <line
              x1="8"
              y1="0"
              x2="8"
              y2={lineLength}
              stroke="#1D4ED8"
              strokeWidth="2"
              strokeDasharray={lineLength}
              strokeDashoffset={drawnOffset}
            />
          </svg>

          {MILESTONES.map((item) => {
            const active = progress >= item.threshold;
            return (
              <div
                key={item.step}
                className={`relative rounded-xl border p-6 transition-colors duration-200 ${
                  active
                    ? 'border-[#1D4ED8] bg-white'
                    : 'border-[#E2E2DE] bg-[#F7F7F5] text-[#575752]'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute top-7 -left-9 h-3.5 w-3.5 rounded-full border-2 transition-colors md:-left-11 ${
                    active
                      ? 'border-[#1D4ED8] bg-[#1D4ED8]'
                      : 'border-[#C8C7C0] bg-[#F7F7F5]'
                  }`}
                />
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-display text-lg font-semibold text-[#111110]">
                    {item.step}. {item.title}
                  </h3>
                  <span className="font-mono text-xs tabular-nums text-[#575752]">
                    {active ? 'Reached' : `Trigger ${Math.round(item.threshold * 100)}%`}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-[#575752]">{item.detail}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Scroll19;
