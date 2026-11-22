import { useEffect, useRef, useState } from 'react';
import { computeStickyProgress, lerp } from '../../utils/scrollMath';

const TOTAL_FRAMES = 48;

export function Scroll20() {
  const runwayRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0.45);
  const [manualFrame, setManualFrame] = useState<number | null>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = runwayRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const next = computeStickyProgress(rect.top, rect.height, window.innerHeight);
      setManualFrame(null);
      setProgress(next);
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

  const effectiveProgress = manualFrame !== null ? manualFrame / TOTAL_FRAMES : progress;
  const frameIndex = Math.min(TOTAL_FRAMES, Math.max(0, Math.round(effectiveProgress * TOTAL_FRAMES)));
  const rotation = lerp(-24, 156, effectiveProgress);
  const apertureRadius = lerp(22, 92, effectiveProgress);
  const crossOffset = lerp(-48, 48, effectiveProgress);

  return (
    <section
      id="scroll-20"
      aria-labelledby="scroll-20-heading"
      className="border-t border-[#E2E2DE] py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#575752]">
              Scroll20 · Spatial & Media · 48-frame scroll scrubbing sequence
            </p>
            <h2 id="scroll-20-heading" className="mt-2 font-display text-2xl font-semibold tracking-tight text-[#111110] md:text-3xl">
              20. Kinetic Frame Scrubbing Stage
            </h2>
          </div>
          <span className="font-mono text-xs tabular-nums text-[#575752]">
            Frame {String(frameIndex).padStart(2, '0')} / {TOTAL_FRAMES}
          </span>
        </div>

        <div ref={runwayRef} className="relative min-h-[160vh]">
          <div className="sticky top-20 rounded-xl border border-[#E2E2DE] bg-white p-6 md:p-8">
            <div className="grid items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <div className="flex aspect-[16/10] items-center justify-center rounded-lg border border-[#E2E2DE] bg-[#F7F7F5] p-4">
                  <svg
                    viewBox="0 0 420 260"
                    className="h-full w-full max-w-md"
                    role="img"
                    aria-label={`Architectural blueprint sequence frame ${frameIndex} of ${TOTAL_FRAMES}`}
                  >
                    <rect x="20" y="20" width="380" height="220" fill="none" stroke="#D4D4CE" strokeWidth="1" />
                    <line x1="210" y1="20" x2="210" y2="240" stroke="#E2E2DE" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="20" y1="130" x2="400" y2="130" stroke="#E2E2DE" strokeWidth="1" strokeDasharray="4 4" />

                    <g transform={`translate(210 130) rotate(${rotation})`}>
                      <rect
                        x="-78"
                        y="-78"
                        width="156"
                        height="156"
                        fill="none"
                        stroke="#111110"
                        strokeWidth="1.5"
                      />
                      <rect
                        x="-52"
                        y="-52"
                        width="104"
                        height="104"
                        fill="none"
                        stroke="#1D4ED8"
                        strokeWidth="1.5"
                        transform={`rotate(${rotation * 0.5})`}
                      />
                    </g>

                    <circle
                      cx="210"
                      cy="130"
                      r={apertureRadius}
                      fill="none"
                      stroke="#111110"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx={210 + crossOffset}
                      cy="130"
                      r="8"
                      fill="#1D4ED8"
                    />
                  </svg>
                </div>
              </div>

              <div className="lg:col-span-5">
                <p className="font-mono text-xs text-[#1D4ED8]">
                  Vector Sequence · Frame {String(frameIndex).padStart(2, '0')}
                </p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-[#111110]">
                  Deterministic Frame Interpolation
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#575752]">
                  Scroll travel scrubs an architectural geometry rig across 48 discrete frames, interpolating ring radius, dual-axis rotation, and focal offset without video codec latency.
                </p>

                <div className="mt-6 border-t border-[#E2E2DE] pt-5">
                  <label htmlFor="frame-scrubber" className="flex items-center justify-between text-xs font-medium text-[#111110]">
                    <span>Manual Frame Scrub</span>
                    <span className="font-mono tabular-nums text-[#575752]">
                      {Math.round(effectiveProgress * 100)}%
                    </span>
                  </label>
                  <input
                    id="frame-scrubber"
                    type="range"
                    min={0}
                    max={TOTAL_FRAMES}
                    value={frameIndex}
                    onChange={(e) => setManualFrame(Number(e.target.value))}
                    className="mt-2 w-full accent-[#1D4ED8]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Scroll20;
