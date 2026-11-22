import React, { useState } from 'react';
import {
  computeSplitRatio,
  normalizePointer,
  type Point2D,
} from '../../utils/cursorMath';

interface StageProps {
  className?: string;
}

const BOTANICAL_IMAGE =
  '/src/assets/images/cursor_reveal_botanical_1795324031369.jpg';
const CHRONOGRAPH_IMAGE =
  '/src/assets/images/cursor_loupe_chronograph_1795324031075.jpg';

/**
 * Cursor 5: Cursor-Reveal Image Mask (Hidden photograph revealed under cursor via radial mask)
 */
export function Cursor5({ className = '' }: StageProps) {
  const [pointer, setPointer] = useState<Point2D>({ x: 0.5, y: 0.5 });
  const [active, setActive] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPointer(normalizePointer(e.clientX, e.clientY, rect));
    setActive(true);
  };

  const handleMouseLeave = () => {
    setActive(false);
    setPointer({ x: 0.5, y: 0.5 });
  };

  const radiusPx = active ? 95 : 74;
  const xPct = `${(pointer.x * 100).toFixed(1)}%`;
  const yPct = `${(pointer.y * 100).toFixed(1)}%`;

  return (
    <div
      data-testid="cursor-5"
      data-active={active ? 'true' : 'false'}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative h-full w-full select-none overflow-hidden bg-zinc-950 flex items-center justify-center ${className}`}
    >
      {/* Concealed monochrome blueprint substrate */}
      {!imgError ? (
        <img
          src={BOTANICAL_IMAGE}
          alt="Monochrome conservatory glasshouse underlayer"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="absolute inset-0 h-full w-full object-cover grayscale contrast-125 brightness-[0.26]"
        />
      ) : (
        <div className="absolute inset-0 bg-zinc-900" />
      )}

      {/* Subtle blueprint grid lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Full-color radial cursor reveal */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          clipPath: `circle(${radiusPx}px at ${xPct} ${yPct})`,
        }}
      >
        {!imgError ? (
          <img
            src={BOTANICAL_IMAGE}
            alt="Full-color conservatory botanical reveal"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-emerald-700 to-amber-600" />
        )}
      </div>

      {/* Hairline aperture ring */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70 shadow-sm transition-[width,height] duration-150"
        style={{
          left: xPct,
          top: yPct,
          width: `${radiusPx * 2}px`,
          height: `${radiusPx * 2}px`,
        }}
      />

      <span className="pointer-events-none absolute bottom-3 right-3 rounded bg-black/70 px-2 py-0.5 font-mono text-[11px] text-zinc-200">
        {xPct} · {yPct}
      </span>
    </div>
  );
}

/**
 * Cursor 6: Spotlight Section (Radial ambient gradient & border illumination follows cursor)
 */
const SPOTLIGHT_TILES = [
  { id: '01', title: 'Specular Edge', detail: 'Radial border catchlight' },
  { id: '02', title: 'Ambient Falloff', detail: '220px soft illumination' },
  { id: '03', title: 'Surface Contrast', detail: 'Sub-12% dark delta' },
  { id: '04', title: 'Zero Latency', detail: 'Pointer-locked gradient' },
];

export function Cursor6({ className = '' }: StageProps) {
  const [pointer, setPointer] = useState<Point2D>({ x: 0.5, y: 0.5 });
  const [active, setActive] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPointer(normalizePointer(e.clientX, e.clientY, rect));
    setActive(true);
  };

  const handleMouseLeave = () => {
    setActive(false);
    setPointer({ x: 0.5, y: 0.5 });
  };

  const xPct = `${(pointer.x * 100).toFixed(1)}%`;
  const yPct = `${(pointer.y * 100).toFixed(1)}%`;

  return (
    <div
      data-testid="cursor-6"
      data-active={active ? 'true' : 'false'}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative h-full w-full select-none overflow-hidden bg-[#0A0A0D] p-5 flex items-center justify-center ${className}`}
    >
      {/* Master ambient spotlight across section */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-200"
        style={{
          background: `radial-gradient(240px circle at ${xPct} ${yPct}, rgba(59, 130, 246, ${
            active ? '0.24' : '0.15'
          }), transparent 75%)`,
        }}
      />

      <div className="relative z-10 grid w-full max-w-sm grid-cols-2 gap-3">
        {SPOTLIGHT_TILES.map((tile) => (
          <div
            key={tile.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/75 p-3.5 text-left backdrop-blur-sm"
          >
            <p className="font-mono text-[11px] text-blue-400">{tile.id}</p>
            <p className="mt-1 text-xs font-semibold text-zinc-100">{tile.title}</p>
            <p className="mt-0.5 text-[11px] text-zinc-400">{tile.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Cursor 12: Optical Magnifier Loupe (Circular 2.2x zoom lens inspecting macro detail)
 */
export function Cursor12({ className = '' }: StageProps) {
  const [pointer, setPointer] = useState<Point2D>({ x: 0.5, y: 0.5 });
  const [active, setActive] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPointer(normalizePointer(e.clientX, e.clientY, rect));
    setActive(true);
  };

  const handleMouseLeave = () => {
    setActive(false);
    setPointer({ x: 0.5, y: 0.5 });
  };

  const xPct = `${(pointer.x * 100).toFixed(1)}%`;
  const yPct = `${(pointer.y * 100).toFixed(1)}%`;
  const loupeSize = 116;

  return (
    <div
      data-testid="cursor-12"
      data-active={active ? 'true' : 'false'}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative h-full w-full select-none overflow-hidden bg-zinc-950 ${
        active ? 'cursor-crosshair' : 'cursor-default'
      } ${className}`}
    >
      {!imgError ? (
        <img
          src={CHRONOGRAPH_IMAGE}
          alt="Mechanical Swiss chronograph movement macro"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="h-full w-full object-cover brightness-90"
        />
      ) : (
        <div className="h-full w-full bg-zinc-800" />
      )}

      {/* Magnified Loupe Circle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/90 shadow-2xl overflow-hidden"
        style={{
          left: xPct,
          top: yPct,
          width: `${loupeSize}px`,
          height: `${loupeSize}px`,
          backgroundImage: !imgError ? `url(${CHRONOGRAPH_IMAGE})` : undefined,
          backgroundColor: '#18181B',
          backgroundSize: '230% 230%',
          backgroundPosition: `${xPct} ${yPct}`,
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-black/15 via-transparent to-white/20" />
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/35" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/35" />
      </div>

      <span className="pointer-events-none absolute bottom-3 left-3 rounded bg-black/75 px-2 py-0.5 font-mono text-[11px] text-zinc-100">
        2.3× Optical Loupe
      </span>
    </div>
  );
}

/**
 * Cursor 14: Split-Wipe Comparison Curtain (Vertical divider tracking cursor X, centered at 50% static)
 */
export function Cursor14({ className = '' }: StageProps) {
  const [pointer, setPointer] = useState<Point2D>({ x: 0.5, y: 0.5 });
  const [active, setActive] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPointer(normalizePointer(e.clientX, e.clientY, rect));
    setActive(true);
  };

  const handleMouseLeave = () => {
    setActive(false);
    setPointer({ x: 0.5, y: 0.5 });
  };

  const splitPct = computeSplitRatio(pointer.x, active);

  return (
    <div
      data-testid="cursor-14"
      data-active={active ? 'true' : 'false'}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative h-full w-full select-none overflow-hidden bg-zinc-900 ${className}`}
    >
      {/* Right / Color Layer */}
      {!imgError ? (
        <img
          src={BOTANICAL_IMAGE}
          alt="Full color conservatory lighting"
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-emerald-900" />
      )}

      {/* Left / Monochrome High-Contrast Layer */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          clipPath: `inset(0 ${100 - splitPct}% 0 0)`,
        }}
      >
        {!imgError ? (
          <img
            src={BOTANICAL_IMAGE}
            alt="Monochrome plate conservatory"
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover grayscale contrast-150 brightness-75"
          />
        ) : (
          <div className="h-full w-full bg-zinc-800" />
        )}
      </div>

      {/* Divider Line & Centered Handle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow"
        style={{ left: `${splitPct}%` }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-md flex items-center justify-center font-mono text-[10px]">
          ↔
        </div>
      </div>

      <div className="pointer-events-none absolute top-3 left-3 rounded bg-black/70 px-2 py-0.5 font-mono text-[11px] text-zinc-100">
        Mono
      </div>
      <div className="pointer-events-none absolute top-3 right-3 rounded bg-black/70 px-2 py-0.5 font-mono text-[11px] text-zinc-100">
        Color · {splitPct.toFixed(0)}%
      </div>
    </div>
  );
}

/**
 * Cursor 15: Morphing Liquid Aura (Organic gradient blob stretching toward pointer velocity)
 */
export function Cursor15({ className = '' }: StageProps) {
  const [pointer, setPointer] = useState<Point2D>({ x: 0.5, y: 0.5 });
  const [stretch, setStretch] = useState({ angle: 0, scaleX: 1, scaleY: 1 });
  const [active, setActive] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const next = normalizePointer(e.clientX, e.clientY, rect);
    const dx = next.x - pointer.x;
    const dy = next.y - pointer.y;
    const speed = Math.min(0.45, Math.hypot(dx, dy) * 6);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    setStretch({
      angle,
      scaleX: 1 + speed,
      scaleY: Math.max(0.75, 1 - speed * 0.45),
    });
    setPointer(next);
    setActive(true);
  };

  const handleMouseLeave = () => {
    setActive(false);
    setPointer({ x: 0.5, y: 0.5 });
    setStretch({ angle: 0, scaleX: 1, scaleY: 1 });
  };

  return (
    <div
      data-testid="cursor-15"
      data-active={active ? 'true' : 'false'}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative h-full w-full select-none overflow-hidden bg-zinc-950 flex items-center justify-center ${className}`}
    >
      {/* Organic Gradient Aura */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 h-44 w-44 rounded-full blur-2xl transition-all duration-300 ease-out"
        style={{
          left: `${pointer.x * 100}%`,
          top: `${pointer.y * 100}%`,
          transform: `translate(-50%, -50%) rotate(${stretch.angle}deg) scale(${stretch.scaleX}, ${stretch.scaleY})`,
          background:
            'radial-gradient(circle at 35% 35%, rgba(59,130,246,0.85), rgba(14,165,233,0.45) 55%, transparent 78%)',
        }}
      />

      <div className="relative z-10 text-center px-6">
        <p className="font-mono text-xs text-blue-300 mb-1">Velocity Deformation</p>
        <h4 className="font-display text-2xl font-semibold tracking-tight text-white">
          Liquid Aura
        </h4>
      </div>
    </div>
  );
}
