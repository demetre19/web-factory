import React, { useState } from 'react';
import {
  computeParallaxOffset,
  computeTiltTransform,
  normalizePointer,
  type Point2D,
} from '../../utils/cursorMath';

interface StageProps {
  className?: string;
}

const ARCH_IMAGE =
  '/src/assets/images/cursor_parallax_architecture_1795324031667.jpg';

/**
 * Cursor 4: Tilt-on-Hover 3D Card (Perspective transform + specular shine layer following mouse)
 */
export function Cursor4({ className = '' }: StageProps) {
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

  const { rotateX, rotateY, shineX, shineY } = computeTiltTransform(
    pointer,
    14,
    active,
  );

  return (
    <div
      data-testid="cursor-4"
      data-active={active ? 'true' : 'false'}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative h-full w-full select-none overflow-hidden bg-zinc-950 flex items-center justify-center p-6 ${className}`}
      style={{ perspective: '900px' }}
    >
      <div
        className="relative h-48 w-64 rounded-2xl border border-zinc-700/80 bg-zinc-900 overflow-hidden shadow-2xl transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${active ? 1.03 : 1})`,
          transformStyle: 'preserve-3d',
        }}
      >
        {!imgError ? (
          <img
            src={ARCH_IMAGE}
            alt="Brutalist concrete architectural gallery"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover opacity-80"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-blue-950" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

        {/* Specular Shine Layer */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-opacity duration-200"
          style={{
            opacity: active ? 0.55 : 0.25,
            background: `radial-gradient(circle 130px at ${shineX}% ${shineY}%, rgba(255,255,255,0.45), transparent 70%)`,
          }}
        />

        <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between text-white">
          <div>
            <p className="text-xs text-zinc-300">Pavilion 04</p>
            <p className="font-display text-base font-semibold tracking-tight">
              Specular Tilt
            </p>
          </div>
          <span className="font-mono text-[11px] tabular-nums text-zinc-300">
            {rotateX.toFixed(0)}° / {rotateY.toFixed(0)}°
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Cursor 8: Parallax-on-Mousemove Layered Hero (Multi-depth layers shifting around center)
 */
export function Cursor8({ className = '' }: StageProps) {
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

  const bgShift = computeParallaxOffset(pointer, -0.35, 22, active);
  const midShift = computeParallaxOffset(pointer, 0.45, 22, active);
  const fgShift = computeParallaxOffset(pointer, 0.9, 22, active);

  return (
    <div
      data-testid="cursor-8"
      data-active={active ? 'true' : 'false'}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative h-full w-full select-none overflow-hidden bg-zinc-900 flex items-center justify-center ${className}`}
    >
      {/* Layer 1: Backdrop image */}
      <div
        className="pointer-events-none absolute -inset-6 transition-transform duration-200 ease-out"
        style={{
          transform: `translate3d(${bgShift.x}px, ${bgShift.y}px, 0) scale(1.06)`,
        }}
      >
        {!imgError ? (
          <img
            src={ARCH_IMAGE}
            alt="Architectural gallery parallax backdrop"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover opacity-55"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-zinc-800 to-zinc-950" />
        )}
        <div className="absolute inset-0 bg-zinc-950/45" />
      </div>

      {/* Layer 2: Mid architectural frame */}
      <div
        className="pointer-events-none absolute h-40 w-60 rounded-xl border border-white/30 bg-white/5 backdrop-blur-[1px] transition-transform duration-200 ease-out"
        style={{
          transform: `translate3d(${midShift.x}px, ${midShift.y}px, 0)`,
        }}
      />

      {/* Layer 3: Foreground typography */}
      <div
        className="pointer-events-none relative z-10 text-center px-6 transition-transform duration-200 ease-out"
        style={{
          transform: `translate3d(${fgShift.x}px, ${fgShift.y}px, 0)`,
        }}
      >
        <p className="text-xs font-mono text-blue-300 mb-1">Depth · 0.35x / 0.90x</p>
        <h4 className="font-display text-2xl font-bold tracking-tight text-white">
          Spatial Parallax
        </h4>
      </div>
    </div>
  );
}

/**
 * Cursor 16: Reticle Corner Brackets (Snaps to hovered target or centers cleanly)
 */
const RETICLE_ITEMS = [
  { id: 'alpha', title: 'Frame A', x: 0.28, y: 0.5 },
  { id: 'beta', title: 'Frame B', x: 0.72, y: 0.5 },
];

export function Cursor16({ className = '' }: StageProps) {
  const [pointer, setPointer] = useState<Point2D>({ x: 0.5, y: 0.5 });
  const [active, setActive] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPointer(normalizePointer(e.clientX, e.clientY, rect));
    setActive(true);
  };

  const handleMouseLeave = () => {
    setActive(false);
    setHoveredId(null);
    setPointer({ x: 0.5, y: 0.5 });
  };

  const targetItem = RETICLE_ITEMS.find((item) => item.id === hoveredId);
  const reticleX = targetItem ? targetItem.x : pointer.x;
  const reticleY = targetItem ? targetItem.y : pointer.y;
  const width = targetItem ? 116 : 64;
  const height = targetItem ? 76 : 64;

  return (
    <div
      data-testid="cursor-16"
      data-active={active ? 'true' : 'false'}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative h-full w-full select-none overflow-hidden bg-white flex items-center justify-center gap-6 px-6 ${className}`}
    >
      {RETICLE_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          onMouseEnter={() => setHoveredId(item.id)}
          onMouseLeave={() => setHoveredId(null)}
          className="relative z-10 h-16 w-24 rounded-lg border border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-800 transition-colors hover:border-zinc-400 hover:bg-zinc-100"
        >
          {item.title}
        </button>
      ))}

      {/* Dynamic Corner Reticle */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{
          left: `${reticleX * 100}%`,
          top: `${reticleY * 100}%`,
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        <span className="absolute top-0 left-0 h-3 w-3 border-t-2 border-l-2 border-blue-600" />
        <span className="absolute top-0 right-0 h-3 w-3 border-t-2 border-r-2 border-blue-600" />
        <span className="absolute bottom-0 left-0 h-3 w-3 border-b-2 border-l-2 border-blue-600" />
        <span className="absolute bottom-0 right-0 h-3 w-3 border-b-2 border-r-2 border-blue-600" />
      </div>
    </div>
  );
}

/**
 * Cursor 17: Velocity Skew Deck (Cards fan & skew proportionally to pointer offset/velocity)
 */
const DECK_PLATES = [
  { code: '01', title: 'Kinetic Scale', tone: 'bg-zinc-900 text-white' },
  { code: '02', title: 'Shear Axis', tone: 'bg-blue-600 text-white' },
  { code: '03', title: 'Rest Equilibrium', tone: 'bg-white text-zinc-900 border border-zinc-200' },
];

export function Cursor17({ className = '' }: StageProps) {
  const [pointer, setPointer] = useState<Point2D>({ x: 0.5, y: 0.5 });
  const [velocityX, setVelocityX] = useState(0);
  const [active, setActive] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const next = normalizePointer(e.clientX, e.clientY, rect);
    setVelocityX(Math.max(-14, Math.min(14, (next.x - pointer.x) * 160)));
    setPointer(next);
    setActive(true);
  };

  const handleMouseLeave = () => {
    setActive(false);
    setVelocityX(0);
    setPointer({ x: 0.5, y: 0.5 });
  };

  return (
    <div
      data-testid="cursor-17"
      data-active={active ? 'true' : 'false'}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative h-full w-full select-none overflow-hidden bg-zinc-100 flex items-center justify-center px-6 ${className}`}
    >
      <div className="relative h-36 w-56 flex items-center justify-center">
        {DECK_PLATES.map((plate, i) => {
          const baseOffset = (i - 1) * (active ? 26 : 12);
          const offsetX = active ? (pointer.x - 0.5) * 44 * (i - 1) + baseOffset : baseOffset;
          const rotate = active ? (i - 1) * 7 + (pointer.x - 0.5) * 10 : (i - 1) * 4;
          const skew = active ? velocityX * 0.6 : 0;

          return (
            <div
              key={plate.code}
              style={{
                transform: `translate3d(${offsetX}px, ${(i - 1) * -6}px, 0) rotate(${rotate}deg) skewX(${skew}deg)`,
                zIndex: i + 1,
              }}
              className={`absolute h-28 w-44 rounded-xl p-4 shadow-md transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between ${plate.tone}`}
            >
              <span className="font-mono text-xs opacity-70">{plate.code}</span>
              <span className="font-display text-sm font-semibold">{plate.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Cursor 20: Isometric Mirror Matrix (5x4 grid of 3D micro-tiles orienting toward pointer)
 */
const MATRIX_ROWS = 4;
const MATRIX_COLS = 5;

export function Cursor20({ className = '' }: StageProps) {
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

  return (
    <div
      data-testid="cursor-20"
      data-active={active ? 'true' : 'false'}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative h-full w-full select-none overflow-hidden bg-[#101216] flex items-center justify-center p-6 ${className}`}
      style={{ perspective: '700px' }}
    >
      <div className="grid grid-cols-5 gap-2.5">
        {Array.from({ length: MATRIX_ROWS * MATRIX_COLS }, (_, idx) => {
          const row = Math.floor(idx / MATRIX_COLS);
          const col = idx % MATRIX_COLS;
          const cellX = (col + 0.5) / MATRIX_COLS;
          const cellY = (row + 0.5) / MATRIX_ROWS;
          const dx = pointer.x - cellX;
          const dy = pointer.y - cellY;
          const dist = Math.hypot(dx, dy);
          const intensity = active ? Math.max(0, 1 - dist / 0.65) : Math.max(0.22, 1 - dist / 0.55) * 0.78;
          const rx = -dy * 52;
          const ry = dx * 52;

          return (
            <div
              key={idx}
              style={{
                transform: `rotateX(${rx.toFixed(1)}deg) rotateY(${ry.toFixed(1)}deg) scale(${(0.92 + intensity * 0.16).toFixed(2)})`,
                borderColor: `rgba(96, 165, 250, ${(0.35 + intensity * 0.62).toFixed(2)})`,
                backgroundColor: `rgba(37, 99, 235, ${(0.14 + intensity * 0.34).toFixed(2)})`,
              }}
              className="h-8 w-8 rounded-md border transition-transform duration-150 ease-out"
            />
          );
        })}
      </div>
    </div>
  );
}
