import { useEffect, useRef, useState } from 'react';

const CASCADE_TILES = [
  { id: 'C1', label: 'Elevation I', offsetClass: 'mt-0', color: 'from-[#1E293B] to-[#334155]', mark: 'I' },
  { id: 'C2', label: 'Elevation II', offsetClass: 'mt-4', color: 'from-[#1E3A8A] to-[#2563EB]', mark: 'II' },
  { id: 'C3', label: 'Elevation III', offsetClass: 'mt-1', color: 'from-[#065F46] to-[#059669]', mark: 'III' },
  { id: 'C4', label: 'Elevation IV', offsetClass: 'mt-5', color: 'from-[#3F3F46] to-[#71717A]', mark: 'IV' },
];

export function Icfx15() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setVisible(true);
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const replay = () => {
    setVisible(false);
    window.setTimeout(() => setVisible(true), 120);
  };

  return (
    <div ref={ref} className="w-full space-y-2.5">
      <div className="grid h-64 grid-cols-4 gap-2.5 overflow-hidden rounded-xl border border-stone-200 bg-[#F3F2EE] p-3">
        {CASCADE_TILES.map((tile, idx) => (
          <div
            key={tile.id}
            style={{ transitionDelay: `${idx * 90}ms` }}
            className={`relative h-48 overflow-hidden rounded-lg bg-gradient-to-b ${tile.color} transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] ${tile.offsetClass} ${
              visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}
          >
            <svg viewBox="0 0 120 190" className="h-full w-full opacity-40" aria-hidden="true">
              <circle cx="60" cy="70" r="28" fill="none" stroke="#FFFFFF" strokeWidth="1.2" />
              <line x1="0" y1="132" x2="120" y2="132" stroke="#FFFFFF" strokeOpacity="0.4" />
            </svg>
            <div className="absolute inset-0 flex flex-col justify-between p-2.5 text-white">
              <span className="font-mono text-[10px] text-white/75">{tile.id}</span>
              <div>
                <div className="font-serif text-xl font-semibold">{tile.mark}</div>
                <div className="truncate text-[11px] text-white/85">{tile.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-stone-600">
        <span>Stepped 90ms stagger offset per plate</span>
        <button
          type="button"
          onClick={replay}
          className="rounded-md border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-900 transition hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
        >
          Replay Cascade
        </button>
      </div>
    </div>
  );
}

export default Icfx15;
