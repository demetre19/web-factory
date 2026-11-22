import { useEffect, useRef, useState } from 'react';

const PLATES = [
  { code: 'P-01', title: 'Limestone Quarry', from: '#334155', to: '#94A3B8', monogram: 'LQ' },
  { code: 'P-02', title: 'Basalt Atrium', from: '#111827', to: '#4B5563', monogram: 'BA' },
  { code: 'P-03', title: 'Cobalt Pavilion', from: '#1E3A8A', to: '#60A5FA', monogram: 'CP' },
];

export function Icfx6() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0.35);

  useEffect(() => {
    let raf = 0;
    const sync = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 900;
      const p = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
      setScrollProgress(p);
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync);
    };
    sync();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const scaleValue = Math.round((1.18 - scrollProgress * 0.18) * 1000) / 1000;

  return (
    <div ref={containerRef} className="w-full space-y-2.5">
      <div className="grid grid-cols-3 gap-3">
        {PLATES.map((plate, index) => {
          const itemScale = Math.max(1, scaleValue - index * 0.015);
          return (
            <div
              key={plate.code}
              className="relative h-56 overflow-hidden rounded-xl border border-stone-200 bg-stone-900"
            >
              <div
                className="h-full w-full will-change-transform transition-transform duration-150 ease-out"
                style={{
                  transform: `scale(${itemScale.toFixed(3)})`,
                  background: `linear-gradient(155deg, ${plate.from}, ${plate.to})`,
                }}
              >
                <svg viewBox="0 0 200 240" className="h-full w-full opacity-60" aria-hidden="true">
                  <circle cx="100" cy="96" r="48" fill="none" stroke="#FFFFFF" strokeOpacity="0.4" />
                  <path d="M20 210 L100 110 L180 210 Z" fill="#FFFFFF" fillOpacity="0.14" />
                  <line x1="0" y1="168" x2="200" y2="168" stroke="#FFFFFF" strokeOpacity="0.25" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-serif text-3xl font-semibold text-white/90">
                    {plate.monogram}
                  </span>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3">
                <div className="font-mono text-[10px] text-stone-300">{plate.code}</div>
                <div className="truncate text-xs font-medium text-white">{plate.title}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-xs text-stone-600">
        <span>Scroll-coupled zoom settles as plates cross viewport</span>
        <span className="font-mono tabular-nums text-stone-900">scale({scaleValue.toFixed(3)})</span>
      </div>
    </div>
  );
}

export default Icfx6;
