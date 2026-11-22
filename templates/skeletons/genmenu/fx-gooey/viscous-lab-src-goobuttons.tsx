import React, { useId, useState, useRef } from 'react';
import { clampElasticPull, computeMagneticOffset } from '../../utils/gooCatalog';

/**
 * Goo4: Pour-In Liquid Button — SVG wave fill rises from the bottom on hover or click.
 */
export const Goo4: React.FC = () => {
  const [hovered, setHovered] = useState(false);
  const [locked, setLocked] = useState(false);
  const filled = hovered || locked;

  return (
    <div className="relative flex h-56 w-full flex-col items-center justify-between rounded-xl bg-[#F4F4F0] p-4 select-none">
      <div className="flex w-full items-center justify-end">
        <span className="text-xs font-mono text-stone-500 tabular-nums">
          {filled ? '100% Flooded' : '0% Empty'}
        </span>
      </div>

      <button
        type="button"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setLocked((v) => !v)}
        aria-pressed={locked}
        className="relative h-14 w-52 overflow-hidden rounded-full border-2 border-[#141413] bg-white font-display text-sm font-semibold tracking-tight transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[155%] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ transform: filled ? 'translateY(0%)' : 'translateY(102%)' }}
        >
          <svg
            viewBox="0 0 240 24"
            preserveAspectRatio="none"
            className="h-5 w-[200%] animate-[liquidWaveSlide_2.4s_linear_infinite]"
            aria-hidden="true"
          >
            <path
              d="M0 12 Q 30 0 60 12 T 120 12 T 180 12 T 240 12 L 240 24 L 0 24 Z"
              fill="#1D4ED8"
            />
          </svg>
          <div className="h-full w-full bg-[#1D4ED8]" />
        </div>

        <span
          className={`relative z-10 transition-colors duration-300 ${
            filled ? 'text-white' : 'text-[#141413]'
          }`}
        >
          {locked ? 'Pour Locked' : 'Pour Liquid'}
        </span>
      </button>

      <p className="text-xs text-stone-500">Hover to pour · Click to lock filled state</p>
    </div>
  );
};

/**
 * Goo9: Under-Button Viscous Drip — heavy droplets sag and pinch off under a button.
 */
export const Goo9: React.FC = () => {
  const uid = useId().replace(/:/g, '');
  const filterId = `goo-filter-9-${uid}`;
  const [dripping, setDripping] = useState(true);

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
        <span className="text-xs text-stone-500">{dripping ? 'Drip active' : 'Paused'}</span>
      </div>

      <div className="relative flex h-32 w-full flex-col items-center justify-start pt-2">
        <div
          className="relative flex flex-col items-center"
          style={{ filter: `url(#${filterId})` }}
        >
          <div className="h-11 w-44 rounded-xl bg-rose-600" />
          {dripping && (
            <>
              <div className="absolute top-8 left-7 h-5 w-5 rounded-full bg-rose-600 animate-[gooDripDrop_2.3s_ease-in_infinite]" />
              <div
                className="absolute top-8 right-9 h-4 w-4 rounded-full bg-rose-600 animate-[gooDripDrop_2.3s_ease-in_infinite]"
                style={{ animationDelay: '1.15s' }}
              />
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setDripping((v) => !v)}
          aria-pressed={dripping}
          className="absolute top-2 h-11 w-44 rounded-xl font-display text-sm font-semibold text-white transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          {dripping ? 'Pause Drips' : 'Resume Drips'}
        </button>
      </div>

      <p className="text-xs text-stone-500">Click button to toggle viscous pinch-off drops</p>
    </div>
  );
};

/**
 * Goo12: Sticky Elastic Separation Pull — drag orb away from pad to stretch & snap bridge.
 */
export const Goo12: React.FC = () => {
  const uid = useId().replace(/:/g, '');
  const filterId = `goo-filter-12-${uid}`;
  const stageRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [pull, setPull] = useState({ x: 0, y: 0, distance: 0, snapped: false, tensionRatio: 0 });

  const updateFromClient = (clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);
    setPull(clampElasticPull(dx, dy, 88, 62));
  };

  const releasePull = () => {
    draggingRef.current = false;
    setPull({ x: 0, y: 0, distance: 0, snapped: false, tensionRatio: 0 });
  };

  const triggerDemoPull = () => {
    setPull(clampElasticPull(74, 0, 88, 62));
    setTimeout(() => {
      setPull({ x: 0, y: 0, distance: 0, snapped: false, tensionRatio: 0 });
    }, 650);
  };

  return (
    <div className="relative flex h-56 w-full flex-col items-center justify-between rounded-xl bg-[#F4F4F0] p-4 select-none">
      <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
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

      <div className="flex w-full items-center justify-between">
        <span className="text-xs font-mono text-stone-500 tabular-nums">
          {pull.snapped ? 'Snapped' : `Tension ${Math.round(pull.tensionRatio * 100)}%`}
        </span>
        <button
          type="button"
          onClick={triggerDemoPull}
          className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 transition-colors hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 whitespace-nowrap"
        >
          Pull &amp; Snap
        </button>
      </div>

      <div
        ref={stageRef}
        onPointerMove={(e) => {
          if (draggingRef.current) updateFromClient(e.clientX, e.clientY);
        }}
        onPointerUp={releasePull}
        onPointerLeave={releasePull}
        className="relative flex h-28 w-full touch-none items-center justify-center"
        style={{ filter: `url(#${filterId})` }}
      >
        <div
          className="absolute h-10 w-10 rounded-full bg-[#141413] transition-transform duration-300"
          style={{ transform: `scale(${pull.snapped ? 0.85 : 1})` }}
        />

        {!pull.snapped && pull.distance > 4 && (
          <div
            className="pointer-events-none absolute h-7 w-7 rounded-full bg-[#141413]"
            style={{
              transform: `translate(${pull.x * 0.48}px, ${pull.y * 0.48}px) scale(${1 - pull.tensionRatio * 0.52})`,
            }}
          />
        )}

        <button
          type="button"
          aria-label="Draggable elastic orb"
          onPointerDown={(e) => {
            draggingRef.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          className="relative h-12 w-12 cursor-grab rounded-full bg-[#141413] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          style={{
            transform: `translate(${pull.x}px, ${pull.y}px)`,
            transitionDuration: draggingRef.current ? '0ms' : '420ms',
          }}
        />
      </div>

      <p className="text-xs text-stone-500">Drag orb outward past threshold to snap sticky tether</p>
    </div>
  );
};

/**
 * Goo16: Cling & Release Liquid Hover — lobe stretches toward pointer and recoils on exit.
 */
export const Goo16: React.FC = () => {
  const uid = useId().replace(/:/g, '');
  const filterId = `goo-filter-16-${uid}`;
  const boxRef = useRef<HTMLDivElement>(null);
  const [lobe, setLobe] = useState({ x: 0, y: 0, active: false });

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    setLobe(computeMagneticOffset(dx, dy, 110, 0.5));
  };

  return (
    <div
      ref={boxRef}
      onPointerMove={handleMove}
      onPointerLeave={() => setLobe({ x: 0, y: 0, active: false })}
      className="relative flex h-56 w-full flex-col items-center justify-between rounded-xl bg-[#F4F4F0] p-4 select-none"
    >
      <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
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
        <span className="text-xs text-stone-500">{lobe.active ? 'Clinging to cursor' : 'Idle surface'}</span>
      </div>

      <div className="relative flex h-28 w-full items-center justify-center">
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          style={{ filter: `url(#${filterId})` }}
        >
          <div className="h-12 w-40 rounded-full bg-blue-600" />
          <div
            className="absolute h-10 w-10 rounded-full bg-blue-600 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            style={{
              transform: `translate(${lobe.x}px, ${lobe.y}px) scale(${lobe.active ? 1.05 : 0.4})`,
              transitionDuration: lobe.active ? '90ms' : '420ms',
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => setLobe((prev) => (prev.active ? { x: 0, y: 0, active: false } : { x: 34, y: -12, active: true }))}
          className="relative z-10 h-12 w-40 rounded-full font-display text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Magnetic Surface
        </button>
      </div>

      <p className="text-xs text-stone-500">Sweep pointer around button to pull liquid lobe</p>
    </div>
  );
};
