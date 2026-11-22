import React, { useId, useState, useRef } from 'react';
import { computeMagneticOffset } from '../../utils/gooCatalog';

/**
 * Goo1: Two dots merging on approach with continuous oscillation + click-to-lock merge.
 */
export const Goo1: React.FC = () => {
  const uid = useId().replace(/:/g, '');
  const filterId = `goo-filter-1-${uid}`;
  const [lockedMerge, setLockedMerge] = useState(false);

  return (
    <div className="relative flex h-56 w-full flex-col items-center justify-between rounded-xl bg-[#F4F4F0] p-4 select-none">
      <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="flex w-full items-center justify-end">
        <button
          type="button"
          onClick={() => setLockedMerge((v) => !v)}
          aria-pressed={lockedMerge}
          className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 transition-colors hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 whitespace-nowrap"
        >
          {lockedMerge ? 'Resume Orbit' : 'Lock Merge'}
        </button>
      </div>

      <div
        className="relative flex h-28 w-full items-center justify-center"
        style={{ filter: `url(#${filterId})` }}
      >
        <div
          className={`absolute h-12 w-12 rounded-full bg-[#141413] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            lockedMerge ? '-translate-x-2 scale-110' : 'animate-[gooApproachLeft_3.2s_ease-in-out_infinite]'
          }`}
        />
        <div
          className={`absolute h-12 w-12 rounded-full bg-[#141413] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
            lockedMerge ? 'translate-x-2 scale-110' : 'animate-[gooApproachRight_3.2s_ease-in-out_infinite]'
          }`}
        />
      </div>

      <p className="text-xs text-stone-500">
        {lockedMerge ? 'Coalesced capsule locked' : 'Continuous approach & surface-tension bridge'}
      </p>
    </div>
  );
};

/**
 * Goo2: Cell mitosis split — single nucleus stretches, pinches waist, and snaps apart.
 */
export const Goo2: React.FC = () => {
  const uid = useId().replace(/:/g, '');
  const filterId = `goo-filter-2-${uid}`;
  const [splitMode, setSplitMode] = useState<'auto' | 'split' | 'fused'>('auto');

  const cycleMode = () => {
    setSplitMode((prev) => (prev === 'auto' ? 'split' : prev === 'split' ? 'fused' : 'auto'));
  };

  return (
    <div className="relative flex h-56 w-full flex-col items-center justify-between rounded-xl bg-[#F4F4F0] p-4 select-none">
      <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 21 -8.5"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="flex w-full items-center justify-end">
        <button
          type="button"
          onClick={cycleMode}
          className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 transition-colors hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 whitespace-nowrap"
        >
          {splitMode === 'auto' ? 'Hold Split' : splitMode === 'split' ? 'Fuse Cells' : 'Auto Cycle'}
        </button>
      </div>

      <div
        className="relative flex h-28 w-full items-center justify-center"
        style={{ filter: `url(#${filterId})` }}
      >
        <div
          className={`absolute h-14 w-14 rounded-full bg-blue-600 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            splitMode === 'auto'
              ? 'animate-[gooMitosisLeft_3.4s_ease-in-out_infinite]'
              : splitMode === 'split'
                ? '-translate-x-11 scale-90'
                : 'translate-x-0 scale-110'
          }`}
        />
        <div
          className={`absolute h-14 w-14 rounded-full bg-blue-600 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            splitMode === 'auto'
              ? 'animate-[gooMitosisRight_3.4s_ease-in-out_infinite]'
              : splitMode === 'split'
                ? 'translate-x-11 scale-90'
                : 'translate-x-0 scale-110'
          }`}
        />
      </div>

      <p className="text-xs text-stone-500">
        State: {splitMode === 'auto' ? 'Cyclic mitosis' : splitMode === 'split' ? 'Daughter cells separated' : 'Single fused nucleus'}
      </p>
    </div>
  );
};

/**
 * Goo3: Magnetic Metaball Cluster — 5-node orbiting cluster attracted toward pointer.
 */
export const Goo3: React.FC = () => {
  const uid = useId().replace(/:/g, '');
  const filterId = `goo-filter-3-${uid}`;
  const stageRef = useRef<HTMLDivElement>(null);
  const [pull, setPull] = useState({ x: 0, y: 0, active: false });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    setPull(computeMagneticOffset(dx, dy, 130, 0.55));
  };

  return (
    <div
      ref={stageRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => setPull({ x: 0, y: 0, active: false })}
      className="relative flex h-56 w-full flex-col items-center justify-between overflow-hidden rounded-xl bg-[#141413] p-4 text-stone-200 select-none"
    >
      <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="z-10 flex w-full items-center justify-between text-xs text-stone-400">
        <span>5-node orbital cluster</span>
        <span>{pull.active ? 'Attracting' : 'Hover to pull'}</span>
      </div>

      <div
        className="relative flex h-32 w-full items-center justify-center"
        style={{ filter: `url(#${filterId})` }}
      >
        <div
          className="absolute h-11 w-11 rounded-full bg-rose-500 transition-transform duration-300 ease-out"
          style={{ transform: `translate(${pull.x * 0.25}px, ${pull.y * 0.25}px)` }}
        />
        <div
          className="absolute h-8 w-8 rounded-full bg-rose-500 transition-transform duration-200 ease-out"
          style={{ transform: `translate(${pull.x}px, ${pull.y}px) scale(${pull.active ? 1.15 : 0.7})` }}
        />
        <div className="absolute h-7 w-7 rounded-full bg-rose-500 animate-[gooOrbitA_4.2s_linear_infinite]" />
        <div className="absolute h-6 w-6 rounded-full bg-rose-500 animate-[gooOrbitB_5.1s_linear_infinite]" />
        <div className="absolute h-5 w-5 rounded-full bg-rose-500 animate-[gooOrbitC_3.7s_linear_infinite]" />
      </div>

      <p className="z-10 text-xs text-stone-400">Hover inside chamber to draw metaballs</p>
    </div>
  );
};

/**
 * Goo8: Merging particles into a unified diamond emblem on click.
 */
const SCATTER_POINTS = [
  { x: -64, y: -36 },
  { x: 58, y: -40 },
  { x: -72, y: 26 },
  { x: 70, y: 30 },
  { x: 0, y: -50 },
  { x: 0, y: 48 },
  { x: -34, y: -18 },
  { x: 36, y: 18 },
  { x: -12, y: 38 },
];

const EMBLEM_POINTS = [
  { x: 0, y: -22 },
  { x: 16, y: -11 },
  { x: -16, y: -11 },
  { x: 24, y: 0 },
  { x: -24, y: 0 },
  { x: 16, y: 11 },
  { x: -16, y: 11 },
  { x: 0, y: 22 },
  { x: 0, y: 0 },
];

export const Goo8: React.FC = () => {
  const uid = useId().replace(/:/g, '');
  const filterId = `goo-filter-8-${uid}`;
  const [converged, setConverged] = useState(true);
  const points = converged ? EMBLEM_POINTS : SCATTER_POINTS;

  return (
    <div className="relative flex h-56 w-full flex-col items-center justify-between rounded-xl bg-[#F4F4F0] p-4 select-none">
      <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="6.5" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="flex w-full items-center justify-end">
        <button
          type="button"
          onClick={() => setConverged((v) => !v)}
          aria-pressed={converged}
          className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 transition-colors hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 whitespace-nowrap"
        >
          {converged ? 'Scatter Particles' : 'Converge Shape'}
        </button>
      </div>

      <div
        className="relative flex h-28 w-full items-center justify-center"
        style={{ filter: `url(#${filterId})` }}
      >
        {points.map((pt, idx) => (
          <div
            key={idx}
            className="absolute h-6 w-6 rounded-full bg-blue-700 transition-transform duration-700 ease-[cubic-bezier(0.34,1.35,0.64,1)]"
            style={{
              transform: `translate(${pt.x}px, ${pt.y}px) scale(${converged ? 1.15 : 0.82})`,
              transitionDelay: `${idx * 24}ms`,
            }}
          />
        ))}
      </div>

      <p className="text-xs text-stone-500">
        {converged ? '9 particles fused into diamond core' : '9 dispersed liquid droplets'}
      </p>
    </div>
  );
};

/**
 * Goo18: Ink-Drop Radial Splash — click anywhere in chamber to emit expanding splash beads.
 */
interface SplashEvent {
  id: number;
  x: number;
  y: number;
  active: boolean;
}

export const Goo18: React.FC = () => {
  const uid = useId().replace(/:/g, '');
  const filterId = `goo-filter-18-${uid}`;
  const stageRef = useRef<HTMLDivElement>(null);
  const [splash, setSplash] = useState<SplashEvent>({ id: 1, x: 50, y: 50, active: true });

  const triggerSplash = (clientX?: number, clientY?: number) => {
    let x = 50;
    let y = 50;
    if (clientX !== undefined && clientY !== undefined && stageRef.current) {
      const rect = stageRef.current.getBoundingClientRect();
      x = Math.max(18, Math.min(82, ((clientX - rect.left) / rect.width) * 100));
      y = Math.max(22, Math.min(78, ((clientY - rect.top) / rect.height) * 100));
    }
    const nextId = Date.now();
    setSplash({ id: nextId, x, y, active: false });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setSplash({ id: nextId, x, y, active: true });
      });
    });
  };

  const angles = [0, 45, 90, 135, 180, 225, 270, 315];

  return (
    <div className="relative flex h-56 w-full flex-col justify-between rounded-xl bg-[#F4F4F0] p-4 select-none">
      <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="z-10 flex w-full items-center justify-end">
        <button
          type="button"
          onClick={() => triggerSplash()}
          className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 transition-colors hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 whitespace-nowrap"
        >
          Drop Ink
        </button>
      </div>

      <div
        ref={stageRef}
        onClick={(e) => triggerSplash(e.clientX, e.clientY)}
        role="presentation"
        className="relative h-32 w-full cursor-crosshair overflow-hidden rounded-lg bg-white/60"
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ filter: `url(#${filterId})` }}
        >
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${splash.x}%`, top: `${splash.y}%` }}
          >
            <div
              className="h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#141413] transition-transform duration-700 ease-out"
              style={{ transform: `translate(-50%, -50%) scale(${splash.active ? 0.55 : 1.3})` }}
            />
            {angles.map((deg, idx) => {
              const rad = (deg * Math.PI) / 180;
              const dist = splash.active ? (idx % 2 === 0 ? 44 : 30) : 0;
              const tx = Math.cos(rad) * dist;
              const ty = Math.sin(rad) * dist;
              return (
                <div
                  key={`${splash.id}-${deg}`}
                  className="absolute top-0 left-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#141413] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  style={{
                    transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${splash.active ? 0.65 : 1.1})`,
                    opacity: splash.active ? 0.85 : 1,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-stone-500">Click anywhere in the dish to trigger radial breakup</p>
    </div>
  );
};
