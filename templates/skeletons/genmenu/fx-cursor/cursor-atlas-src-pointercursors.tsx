import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  Compass,
  Feather,
  Layers,
  Sparkles,
  Terminal,
} from 'lucide-react';
import {
  computeMagneticOffset,
  lerp,
  normalizePointer,
  type Point2D,
} from '../../utils/cursorMath';

interface StageProps {
  className?: string;
}

/**
 * Cursor 1: Custom Dual-Layer Cursor (Dot + Trailing Ring, scales on hover targets)
 */
export function Cursor1({ className = '' }: StageProps) {
  const [pointer, setPointer] = useState<Point2D>({ x: 0.5, y: 0.5 });
  const [ring, setRing] = useState<Point2D>({ x: 0.5, y: 0.5 });
  const [active, setActive] = useState(false);
  const [hoverTarget, setHoverTarget] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>('View Index');
  const pointerRef = useRef<Point2D>({ x: 0.5, y: 0.5 });

  useEffect(() => {
    pointerRef.current = pointer;
  }, [pointer]);

  useEffect(() => {
    let rafId = 0;
    const step = () => {
      setRing((prev) => {
        const nx = lerp(prev.x, pointerRef.current.x, 0.16);
        const ny = lerp(prev.y, pointerRef.current.y, 0.16);
        if (Math.abs(nx - prev.x) < 0.0005 && Math.abs(ny - prev.y) < 0.0005) {
          return prev;
        }
        return { x: nx, y: ny };
      });
      rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPointer(normalizePointer(e.clientX, e.clientY, rect));
    setActive(true);
  };

  const handleMouseLeave = () => {
    setActive(false);
    setHoverTarget(null);
    setPointer({ x: 0.5, y: 0.5 });
  };

  const ringSize = hoverTarget ? 58 : active ? 36 : 44;

  return (
    <div
      data-testid="cursor-1"
      data-active={active ? 'true' : 'false'}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative h-full w-full select-none overflow-hidden bg-[#0E0F12] text-zinc-100 flex items-center justify-center ${
        active ? 'cursor-none' : 'cursor-default'
      } ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.22) 1px, transparent 0)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative z-10 flex items-center justify-center gap-12 px-6">
        <button
          type="button"
          onMouseEnter={() => setHoverTarget('Inspect')}
          onMouseLeave={() => setHoverTarget(null)}
          onClick={() => setSelectedAction('View Index')}
          className={`w-28 py-2.5 rounded-lg text-sm font-medium border transition-colors duration-150 whitespace-nowrap ${
            selectedAction === 'View Index'
              ? 'bg-white text-zinc-950 border-white'
              : 'bg-zinc-900/90 text-zinc-200 border-zinc-700 hover:border-zinc-500'
          }`}
        >
          View Index
        </button>

        <button
          type="button"
          onMouseEnter={() => setHoverTarget('Open')}
          onMouseLeave={() => setHoverTarget(null)}
          onClick={() => setSelectedAction('Archive')}
          className={`w-28 py-2.5 rounded-lg text-sm font-medium border transition-colors duration-150 whitespace-nowrap ${
            selectedAction === 'Archive'
              ? 'bg-blue-600 text-white border-blue-500'
              : 'bg-zinc-900/90 text-zinc-200 border-zinc-700 hover:border-zinc-500'
          }`}
        >
          Archive
        </button>
      </div>

      {/* Trailing Ring */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-[width,height,border-color,background-color] duration-150 ease-out flex items-center justify-center"
        style={{
          left: `${ring.x * 100}%`,
          top: `${ring.y * 100}%`,
          width: `${ringSize}px`,
          height: `${ringSize}px`,
          borderColor: hoverTarget ? '#60A5FA' : 'rgba(255,255,255,0.55)',
          backgroundColor: hoverTarget ? 'rgba(37, 99, 235, 0.16)' : 'transparent',
        }}
      >
        {hoverTarget && (
          <span className="text-[10px] font-mono tracking-tight text-blue-200">
            {hoverTarget}
          </span>
        )}
      </div>

      {/* Precision Center Dot */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute z-30 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 transition-transform duration-100"
        style={{
          left: `${pointer.x * 100}%`,
          top: `${pointer.y * 100}%`,
          transform: `translate(-50%, -50%) scale(${hoverTarget ? 0.6 : 1})`,
        }}
      />
    </div>
  );
}

/**
 * Cursor 2: Magnetic Action Buttons (Buttons & inner labels translate toward cursor)
 */
export function Cursor2({ className = '' }: StageProps) {
  const [pointer, setPointer] = useState<Point2D>({ x: 0.5, y: 0.5 });
  const [active, setActive] = useState(false);
  const [pressCount, setPressCount] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPointer(normalizePointer(e.clientX, e.clientY, rect));
    setActive(true);
  };

  const handleMouseLeave = () => {
    setActive(false);
    setPointer({ x: 0.5, y: 0.5 });
  };

  const primaryPull = computeMagneticOffset(pointer, { x: 0.36, y: 0.5 }, 0.34, 22, active);
  const secondaryPull = computeMagneticOffset(pointer, { x: 0.68, y: 0.5 }, 0.34, 22, active);

  return (
    <div
      data-testid="cursor-2"
      data-active={active ? 'true' : 'false'}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative h-full w-full select-none overflow-hidden bg-zinc-50 flex flex-col items-center justify-center gap-4 px-6 ${className}`}
    >
      <div className="flex items-center justify-center gap-5">
        <button
          type="button"
          onClick={() => setPressCount((c) => c + 1)}
          style={{
            transform: `translate3d(${primaryPull.x}px, ${primaryPull.y}px, 0)`,
          }}
          className="group relative inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 whitespace-nowrap shrink-0"
        >
          <span
            style={{
              transform: `translate3d(${primaryPull.x * 0.28}px, ${primaryPull.y * 0.28}px, 0)`,
            }}
            className="inline-flex items-center gap-2 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            Pull Action
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => setPressCount((c) => c + 1)}
          style={{
            transform: `translate3d(${secondaryPull.x}px, ${secondaryPull.y}px, 0)`,
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-5 py-3 text-sm font-medium text-zinc-900 shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 whitespace-nowrap shrink-0"
        >
          <span
            style={{
              transform: `translate3d(${secondaryPull.x * 0.28}px, ${secondaryPull.y * 0.28}px, 0)`,
            }}
            className="transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
          >
            Secondary
          </span>
        </button>
      </div>

      <p className="text-xs font-mono tabular-nums text-zinc-500">
        {active ? `Offset (${primaryPull.x.toFixed(1)}, ${primaryPull.y.toFixed(1)})px` : 'Centered static state'}
        {pressCount > 0 ? ` · ${pressCount} triggered` : ''}
      </p>
    </div>
  );
}

/**
 * Cursor 3: Magnetic Icon Links (Proximity-attracted dock icons)
 */
const DOCK_ITEMS = [
  { id: 'compass', label: 'Explore', icon: Compass },
  { id: 'layers', label: 'Layers', icon: Layers },
  { id: 'feather', label: 'Draft', icon: Feather },
  { id: 'terminal', label: 'Console', icon: Terminal },
  { id: 'sparkles', label: 'Polish', icon: Sparkles },
];

export function Cursor3({ className = '' }: StageProps) {
  const [pointer, setPointer] = useState<Point2D>({ x: 0.5, y: 0.5 });
  const [active, setActive] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('feather');

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
      data-testid="cursor-3"
      data-active={active ? 'true' : 'false'}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative h-full w-full select-none overflow-hidden bg-[#141417] flex flex-col items-center justify-center gap-5 px-4 ${className}`}
    >
      <div className="flex items-center justify-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/90 px-4 py-3 shadow-sm">
        {DOCK_ITEMS.map((item, idx) => {
          const anchorX = 0.24 + idx * 0.13;
          const anchorY = 0.48;
          const pull = computeMagneticOffset(pointer, { x: anchorX, y: anchorY }, 0.25, 16, active);
          const dist = Math.hypot(pointer.x - anchorX, pointer.y - anchorY);
          const scale = active ? 1 + Math.max(0, 1 - dist / 0.22) * 0.28 : 1;
          const Icon = item.icon;
          const isSelected = selectedId === item.id;

          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              onClick={() => setSelectedId(item.id)}
              style={{
                transform: `translate3d(${pull.x}px, ${pull.y}px, 0) scale(${scale.toFixed(3)})`,
              }}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-blue-500 ${
                isSelected
                  ? 'border-blue-500 bg-blue-600 text-white'
                  : 'border-zinc-700/80 bg-zinc-800 text-zinc-300 hover:border-zinc-500 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>

      <span className="text-xs text-zinc-400">
        Active Link:{' '}
        <strong className="font-medium text-zinc-200">
          {DOCK_ITEMS.find((i) => i.id === selectedId)?.label}
        </strong>
      </span>
    </div>
  );
}

/**
 * Cursor 11: Kinetic Elastic Trail (10-node ribbon following cursor, resting arc when static)
 */
const TRAIL_COUNT = 10;

export function Cursor11({ className = '' }: StageProps) {
  const [pointer, setPointer] = useState<Point2D>({ x: 0.5, y: 0.5 });
  const [trail, setTrail] = useState<Point2D[]>(() =>
    Array.from({ length: TRAIL_COUNT }, (_, i) => {
      const angle = (i / TRAIL_COUNT) * Math.PI * 1.4 - Math.PI * 0.7;
      return {
        x: 0.5 + Math.cos(angle) * 0.14,
        y: 0.5 + Math.sin(angle) * 0.14,
      };
    }),
  );
  const [active, setActive] = useState(false);
  const pointerRef = useRef<Point2D>({ x: 0.5, y: 0.5 });
  const activeRef = useRef(false);

  useEffect(() => {
    pointerRef.current = pointer;
    activeRef.current = active;
  }, [pointer, active]);

  useEffect(() => {
    let rafId = 0;
    const tick = () => {
      setTrail((prev) => {
        const next: Point2D[] = [];
        for (let i = 0; i < TRAIL_COUNT; i++) {
          if (!activeRef.current) {
            const angle = (i / TRAIL_COUNT) * Math.PI * 1.4 - Math.PI * 0.7;
            const targetX = 0.5 + Math.cos(angle) * 0.14;
            const targetY = 0.5 + Math.sin(angle) * 0.14;
            next.push({
              x: lerp(prev[i].x, targetX, 0.12),
              y: lerp(prev[i].y, targetY, 0.12),
            });
          } else {
            const target = i === 0 ? pointerRef.current : next[i - 1];
            const followRate = i === 0 ? 0.38 : 0.28;
            next.push({
              x: lerp(prev[i].x, target.x, followRate),
              y: lerp(prev[i].y, target.y, followRate),
            });
          }
        }
        return next;
      });
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

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
      data-testid="cursor-11"
      data-active={active ? 'true' : 'false'}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative h-full w-full select-none overflow-hidden bg-white flex items-center justify-center ${className}`}
    >
      <div className="pointer-events-none text-center">
        <p className="font-display text-lg font-semibold tracking-tight text-zinc-900">
          Elastic Ribbon
        </p>
        <p className="text-xs text-zinc-500">10-node spring decay</p>
      </div>

      {trail.map((node, i) => {
        const size = Math.max(6, 22 - i * 1.6);
        const opacity = 0.9 - i * 0.08;
        return (
          <div
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600"
            style={{
              left: `${node.x * 100}%`,
              top: `${node.y * 100}%`,
              width: `${size}px`,
              height: `${size}px`,
              opacity,
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * Cursor 18: Blend-Difference Inversion Lens (High-contrast difference optical disc)
 */
export function Cursor18({ className = '' }: StageProps) {
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
      data-testid="cursor-18"
      data-active={active ? 'true' : 'false'}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative h-full w-full select-none overflow-hidden bg-[#F4F4F0] flex items-center justify-center px-6 ${
        active ? 'cursor-none' : 'cursor-default'
      } ${className}`}
    >
      <div className="text-center">
        <p className="text-xs font-mono tracking-wider text-zinc-500 mb-1">
          OPTICAL INVERSION
        </p>
        <h4 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-zinc-950 leading-none">
          Contrast Field
        </h4>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white mix-blend-difference transition-[width,height,left,top] duration-150 ease-out"
        style={{
          left: `${pointer.x * 100}%`,
          top: `${pointer.y * 100}%`,
          width: active ? '96px' : '78px',
          height: active ? '96px' : '78px',
        }}
      />
    </div>
  );
}
