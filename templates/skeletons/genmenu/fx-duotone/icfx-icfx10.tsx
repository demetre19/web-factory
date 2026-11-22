import { useState, type MouseEvent } from 'react';

export function Icfx10() {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, gx: 50, gy: 50, active: false });

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const ny = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    const ry = Math.round((nx - 0.5) * 20 * 100) / 100;
    const rx = Math.round((0.5 - ny) * 20 * 100) / 100;
    setTilt({ rx, ry, gx: Math.round(nx * 100), gy: Math.round(ny * 100), active: true });
  };

  const reset = () => setTilt({ rx: 0, ry: 0, gx: 50, gy: 50, active: false });

  return (
    <div className="w-full" style={{ perspective: '900px' }}>
      <div
        onMouseMove={handleMove}
        onMouseLeave={reset}
        className="relative h-64 w-full overflow-hidden rounded-xl border border-stone-200 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] transition-transform duration-200 ease-out will-change-transform"
        style={{
          transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) scale(${tilt.active ? 1.02 : 1})`,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Dynamic glare layer */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-200"
          style={{
            opacity: tilt.active ? 0.35 : 0.1,
            background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.65), transparent 60%)`,
          }}
        />

        <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true">
          <rect x="32" y="28" width="336" height="204" rx="8" fill="none" stroke="#94A3B8" strokeOpacity="0.3" />
          <polygon points="200,50 310,205 90,205" fill="#38BDF8" fillOpacity="0.18" stroke="#7DD3FC" strokeOpacity="0.5" />
          <circle cx="200" cy="145" r="32" fill="#F8FAFC" fillOpacity="0.14" />
        </svg>

        {/* Elevated foreground monogram */}
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-white"
          style={{ transform: 'translateZ(28px)' }}
        >
          <span className="font-mono text-xs tracking-widest text-sky-300">3D PARALLAX PLANE</span>
          <span className="mt-1 font-serif text-4xl font-semibold tracking-tight">K-10</span>
        </div>

        <div className="pointer-events-none absolute bottom-3 left-3 font-mono text-[11px] tabular-nums text-slate-300">
          RX {tilt.rx.toFixed(1)}° · RY {tilt.ry.toFixed(1)}°
        </div>
      </div>
    </div>
  );
}

export default Icfx10;
