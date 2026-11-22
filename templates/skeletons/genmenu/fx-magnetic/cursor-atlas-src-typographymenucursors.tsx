import React, { useState } from 'react';
import {
  computeMagneticOffset,
  computeRepelOffset,
  normalizePointer,
  type Point2D,
} from '../../utils/cursorMath';

interface StageProps {
  className?: string;
}

/**
 * Cursor 7: Cursor-Following Text (Individual glyphs repel or attract around pointer)
 */
const HEADLINE_WORD = 'KINETIC';

export function Cursor7({ className = '' }: StageProps) {
  const [pointer, setPointer] = useState<Point2D>({ x: 0.5, y: 0.5 });
  const [active, setActive] = useState(false);
  const [mode, setMode] = useState<'repel' | 'attract'>('repel');

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
      data-testid="cursor-7"
      data-active={active ? 'true' : 'false'}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative h-full w-full select-none overflow-hidden bg-white flex flex-col items-center justify-center gap-5 px-6 ${className}`}
    >
      <div className="flex items-center justify-center gap-1">
        {HEADLINE_WORD.split('').map((char, i) => {
          const letterX = 0.23 + (i / (HEADLINE_WORD.length - 1)) * 0.54;
          const letterY = 0.45;
          const offset = computeRepelOffset(
            pointer,
            { x: letterX, y: letterY },
            mode,
            0.36,
            26,
            active,
          );
          return (
            <span
              key={i}
              style={{
                transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
              }}
              className="inline-block font-display text-4xl font-bold tracking-tight text-zinc-900 transition-transform duration-150 ease-out"
            >
              {char}
            </span>
          );
        })}
      </div>

      <div className="flex items-center gap-1 rounded-lg bg-zinc-100 p-1">
        <button
          type="button"
          onClick={() => setMode('repel')}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            mode === 'repel'
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Repel
        </button>
        <button
          type="button"
          onClick={() => setMode('attract')}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            mode === 'attract'
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          Attract
        </button>
      </div>
    </div>
  );
}

/**
 * Cursor 9: Cursor Tooltip Follower (Floating contextual card tracking cursor over zones)
 */
const ARTBOARD_ZONES = [
  { id: 'grid', title: 'Modular Grid', spec: '12 cols · 24px', color: 'bg-blue-600' },
  { id: 'type', title: 'Type Ramp', spec: '1.250 Major Third', color: 'bg-zinc-900' },
  { id: 'motion', title: 'Spring Curve', spec: 'cubic(0.16, 1, 0.3, 1)', color: 'bg-amber-600' },
];

export function Cursor9({ className = '' }: StageProps) {
  const [pointer, setPointer] = useState<Point2D>({ x: 0.5, y: 0.5 });
  const [active, setActive] = useState(false);
  const [hoveredZone, setHoveredZone] = useState(ARTBOARD_ZONES[1]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPointer(normalizePointer(e.clientX, e.clientY, rect));
    setActive(true);
  };

  const handleMouseLeave = () => {
    setActive(false);
    setPointer({ x: 0.5, y: 0.5 });
    setHoveredZone(ARTBOARD_ZONES[1]);
  };

  return (
    <div
      data-testid="cursor-9"
      data-active={active ? 'true' : 'false'}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative h-full w-full select-none overflow-hidden bg-zinc-50 flex items-center justify-center p-5 ${className}`}
    >
      <div className="mt-10 grid w-full grid-cols-3 gap-2.5 h-28">
        {ARTBOARD_ZONES.map((zone) => (
          <button
            key={zone.id}
            type="button"
            onMouseEnter={() => setHoveredZone(zone)}
            onClick={() => setHoveredZone(zone)}
            className="rounded-xl border border-zinc-200 bg-white p-3 text-left transition-colors hover:border-blue-500 flex flex-col justify-between"
          >
            <span className={`h-2.5 w-2.5 rounded-full ${zone.color}`} />
            <span className="text-xs font-medium text-zinc-800">{zone.title}</span>
          </button>
        ))}
      </div>

      {/* Floating Cursor Tooltip */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-white shadow-lg transition-all duration-100 ease-out"
        style={{
          left: `${Math.min(82, Math.max(18, pointer.x * 100))}%`,
          top: `${Math.min(82, Math.max(16, (active ? pointer.y - 0.16 : 0.19) * 100))}%`,
        }}
      >
        <p className="text-xs font-semibold whitespace-nowrap">{hoveredZone.title}</p>
        <p className="font-mono text-[10px] text-zinc-400 whitespace-nowrap">{hoveredZone.spec}</p>
      </div>
    </div>
  );
}

/**
 * Cursor 10: Hover-Gravity Menu (Menu items pull subtly toward cursor position)
 */
const GRAVITY_LINKS = [
  { id: '01', label: 'Typography System' },
  { id: '02', label: 'Spatial Geometry' },
  { id: '03', label: 'Optical Surfaces' },
  { id: '04', label: 'Motion Springs' },
];

export function Cursor10({ className = '' }: StageProps) {
  const [pointer, setPointer] = useState<Point2D>({ x: 0.5, y: 0.5 });
  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState('02');

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
      data-testid="cursor-10"
      data-active={active ? 'true' : 'false'}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative h-full w-full select-none overflow-hidden bg-[#111215] flex items-center justify-center px-6 ${className}`}
    >
      <nav aria-label="Gravity menu" className="w-full max-w-xs divide-y divide-zinc-800">
        {GRAVITY_LINKS.map((item, idx) => {
          const anchorY = 0.24 + idx * 0.17;
          const pull = computeMagneticOffset(pointer, { x: 0.5, y: anchorY }, 0.3, 14, active);
          const isSelected = selected === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(item.id)}
              style={{
                transform: `translate3d(${pull.x}px, ${pull.y * 0.5}px, 0)`,
              }}
              className="flex w-full items-center justify-between py-2.5 text-left transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] group"
            >
              <span className="flex items-center gap-3">
                <span className="font-mono text-xs text-zinc-500">{item.id}</span>
                <span
                  className={`text-sm font-medium transition-colors ${
                    isSelected ? 'text-blue-400' : 'text-zinc-200 group-hover:text-white'
                  }`}
                >
                  {item.label}
                </span>
              </span>
              <span
                className={`text-xs transition-opacity ${
                  isSelected ? 'opacity-100 text-blue-400' : 'opacity-0 group-hover:opacity-70 text-zinc-400'
                }`}
              >
                →
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

/**
 * Cursor 13: Proximity Vector Field (7x5 grid of directional needles orienting to pointer)
 */
const FIELD_ROWS = 5;
const FIELD_COLS = 7;

export function Cursor13({ className = '' }: StageProps) {
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
      data-testid="cursor-13"
      data-active={active ? 'true' : 'false'}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative h-full w-full select-none overflow-hidden bg-zinc-50 flex items-center justify-center p-6 ${className}`}
    >
      <div className="grid grid-cols-7 gap-3.5">
        {Array.from({ length: FIELD_ROWS * FIELD_COLS }, (_, idx) => {
          const row = Math.floor(idx / FIELD_COLS);
          const col = idx % FIELD_COLS;
          const cellX = (col + 0.5) / FIELD_COLS;
          const cellY = (row + 0.5) / FIELD_ROWS;
          const dx = pointer.x - cellX;
          const dy = pointer.y - cellY;
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          const dist = Math.hypot(dx, dy);
          const proximity = Math.max(0, 1 - dist / 0.55);

          return (
            <div key={idx} className="flex h-5 w-5 items-center justify-center">
              <div
                style={{
                  transform: `rotate(${angle.toFixed(1)}deg) scaleX(${(1 + proximity * 0.65).toFixed(2)})`,
                  backgroundColor: proximity > 0.45 ? '#2563EB' : '#52525B',
                }}
                className="h-0.5 w-3.5 rounded-full transition-transform duration-100 ease-out"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Cursor 19: Orbital Satellite Cluster (Centered core with 6 orbiting nodes pulled by cursor)
 */
const SATELLITES = ['N', 'NE', 'SE', 'S', 'SW', 'NW'];

export function Cursor19({ className = '' }: StageProps) {
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

  const centerShiftX = active ? (pointer.x - 0.5) * 18 : 0;
  const centerShiftY = active ? (pointer.y - 0.5) * 18 : 0;

  return (
    <div
      data-testid="cursor-19"
      data-active={active ? 'true' : 'false'}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative h-full w-full select-none overflow-hidden bg-white flex items-center justify-center ${className}`}
    >
      {/* Orbital guide ring */}
      <div
        aria-hidden="true"
        style={{
          transform: `translate3d(${centerShiftX * 0.4}px, ${centerShiftY * 0.4}px, 0)`,
        }}
        className="h-40 w-40 rounded-full border border-dashed border-zinc-300 transition-transform duration-200"
      />

      {/* Core */}
      <div
        style={{
          transform: `translate3d(${centerShiftX}px, ${centerShiftY}px, 0)`,
        }}
        className="absolute h-12 w-12 rounded-full bg-zinc-900 text-white font-mono text-xs flex items-center justify-center shadow-sm transition-transform duration-200"
      >
        Core
      </div>

      {/* Satellites */}
      {SATELLITES.map((label, i) => {
        const theta = (i / SATELLITES.length) * Math.PI * 2 - Math.PI / 2;
        const baseX = 0.5 + Math.cos(theta) * 0.22;
        const baseY = 0.5 + Math.sin(theta) * 0.28;
        const pull = computeMagneticOffset(pointer, { x: baseX, y: baseY }, 0.45, 18, active);

        return (
          <div
            key={label}
            style={{
              left: `${baseX * 100}%`,
              top: `${baseY * 100}%`,
              transform: `translate(-50%, -50%) translate3d(${pull.x}px, ${pull.y}px, 0)`,
            }}
            className="absolute h-8 w-8 rounded-full border border-zinc-200 bg-zinc-50 font-mono text-[10px] font-medium text-zinc-700 shadow-xs flex items-center justify-center transition-transform duration-150 ease-out"
          >
            {label}
          </div>
        );
      })}
    </div>
  );
}
