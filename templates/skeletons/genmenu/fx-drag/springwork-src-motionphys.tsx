import React, { useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Compass,
  Layers,
  RefreshCw,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';
import { reorderListItem } from '../../utils/physicsMath';

/**
 * Phys6: Pendulum Swing Elements
 * Top-anchored pendulum tag that swings with damped harmonic oscillation on impulse.
 */
export function Phys6() {
  const [swingKey, setSwingKey] = useState(0);
  const [pressed, setPressed] = useState(false);

  return (
    <div className="flex flex-col items-center justify-between gap-4 w-full">
      <div className="relative h-28 w-full flex flex-col items-center justify-start pt-1">
        <div className="w-2.5 h-2.5 rounded-full bg-[#141413] z-10" />
        <button
          type="button"
          key={swingKey}
          aria-label="Nudge pendulum swing tag"
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onPointerLeave={() => setPressed(false)}
          onClick={() => setSwingKey((k) => k + 1)}
          style={{
            transformOrigin: 'top center',
            transform: pressed ? 'rotate(-14deg)' : undefined,
            transition: pressed ? 'transform 140ms ease-out' : undefined,
          }}
          className={`flex flex-col items-center cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] rounded-lg ${
            swingKey > 0 && !pressed ? 'animate-phys-pendulum' : ''
          }`}
        >
          <span className="w-0.5 h-7 bg-[#9CA3AF]" />
          <span className="px-4 py-2 rounded-lg bg-[#141413] text-white text-xs font-medium shadow-sm whitespace-nowrap">
            Nudge Pendulum
          </span>
        </button>
      </div>

      <p className="text-xs text-[#6B6B66] font-mono tabular-nums">
        Impulses triggered: {swingKey}
      </p>
    </div>
  );
}

/**
 * Phys7: Falling-Into-Place Items
 * Staggered gravity drop sequence with bottom impact compression bounce.
 */
export function Phys7() {
  const [dropKey, setDropKey] = useState(1);
  const items = [
    '01. Kinetic Entry',
    '02. Staggered Drop',
    '03. Surface Impact',
  ];

  return (
    <div className="flex flex-col gap-3 w-full">
      <div key={dropKey} className="space-y-2">
        {items.map((label, idx) => (
          <div
            key={label}
            style={{ animationDelay: `${idx * 85}ms` }}
            className="animate-phys-fall px-3 py-2 rounded-lg bg-[#F6F6F4] border border-[#E4E4E0] text-xs font-medium text-[#141413] flex items-center justify-between"
          >
            <span>{label}</span>
            <span className="font-mono text-[#6B6B66] tabular-nums">
              +{idx * 85}ms
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setDropKey((k) => k + 1)}
          className="min-h-9 px-3.5 py-1.5 rounded-lg border border-[#E4E4E0] bg-white text-xs font-medium text-[#141413] hover:bg-[#F6F6F4] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Replay Gravity Drop
        </button>
      </div>
    </div>
  );
}

/**
 * Phys8: Elastic List Reorder
 * Reorderable items that glide into new vertical slots with overshoot spring easing.
 */
export function Phys8() {
  const [items, setItems] = useState([
    { id: 'a', label: 'Spring Stiffness' },
    { id: 'b', label: 'Mass Inertia' },
    { id: 'c', label: 'Damping Ratio' },
  ]);
  const [movedId, setMovedId] = useState<string | null>(null);

  const move = (idx: number, direction: 'up' | 'down') => {
    const targetId = items[idx]?.id ?? null;
    setItems((prev) => reorderListItem(prev, idx, direction));
    setMovedId(targetId);
    window.setTimeout(() => setMovedId(null), 420);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {items.map((item, idx) => {
        const isMoved = movedId === item.id;
        return (
          <div
            key={item.id}
            style={{
              transform: isMoved
                ? 'scale(1.03) translateY(-2px)'
                : 'scale(1) translateY(0)',
              transition: 'transform 420ms cubic-bezier(0.34, 1.45, 0.64, 1)',
            }}
            className={`px-3 py-2 rounded-lg border flex items-center justify-between gap-2 ${
              isMoved
                ? 'bg-[#EFF6FF] border-[#93C5FD]'
                : 'bg-[#F6F6F4] border-[#E4E4E0]'
            }`}
          >
            <span className="text-xs font-medium text-[#141413]">
              <span className="font-mono text-[#6B6B66] mr-2 tabular-nums">
                {idx + 1}.
              </span>
              {item.label}
            </span>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                aria-label={`Move ${item.label} up`}
                disabled={idx === 0}
                onClick={() => move(idx, 'up')}
                className="w-8 h-8 rounded border border-[#E4E4E0] bg-white flex items-center justify-center text-[#141413] disabled:opacity-35 hover:bg-[#EFEFEB] cursor-pointer disabled:cursor-not-allowed"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                aria-label={`Move ${item.label} down`}
                disabled={idx === items.length - 1}
                onClick={() => move(idx, 'down')}
                className="w-8 h-8 rounded border border-[#E4E4E0] bg-white flex items-center justify-center text-[#141413] disabled:opacity-35 hover:bg-[#EFEFEB] cursor-pointer disabled:cursor-not-allowed"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Phys9: Physics-Flavored Hover (Lag & Catch-Up)
 * Pointer-tracked node trails cursor movement with spring latency and returns home on exit.
 */
export function Phys9() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    setOffset({
      x: Math.max(-72, Math.min(72, dx * 0.58)),
      y: Math.max(-28, Math.min(28, dy * 0.58)),
    });
    setActive(true);
  };

  const resetHome = () => {
    setOffset({ x: 0, y: 0 });
    setActive(false);
  };

  return (
    <div className="flex flex-col gap-2.5 w-full">
      <div
        ref={stageRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetHome}
        className="relative h-28 rounded-xl bg-[#F6F6F4] border border-[#E4E4E0] flex items-center justify-center overflow-hidden"
      >
        <div
          aria-hidden="true"
          style={{
            transform: `translate(${offset.x * 0.65}px, ${offset.y * 0.65}px)`,
            transition: 'transform 620ms cubic-bezier(0.22, 1.32, 0.36, 1)',
          }}
          className="absolute w-24 h-10 rounded-lg bg-[#DBEAFE]"
        />

        <button
          type="button"
          onClick={() => setOffset({ x: 34, y: -12 })}
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${active ? 1.05 : 1})`,
            transition: 'transform 420ms cubic-bezier(0.22, 1.32, 0.36, 1)',
          }}
          className="relative z-10 px-4 py-2 rounded-lg bg-[#141413] text-white text-xs font-medium shadow-sm cursor-pointer whitespace-nowrap"
        >
          {active ? 'Catching Pointer' : 'Hover Stage'}
        </button>
      </div>
    </div>
  );
}

/**
 * Phys11: Wobble-On-Hover Cards
 * Torsional rotational wobble triggered on hover or tap.
 */
export function Phys11() {
  const [wobbleKey, setWobbleKey] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full">
      <button
        type="button"
        key={wobbleKey}
        onMouseEnter={() => setWobbleKey((k) => k + 1)}
        onClick={() => setWobbleKey((k) => k + 1)}
        className={`w-full max-w-[240px] p-4 rounded-xl bg-[#141413] text-white text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] ${
          wobbleKey > 0 ? 'animate-phys-wobble' : ''
        }`}
      >
        <p className="text-xs font-mono text-[#A3A39E]">Torsional Spring</p>
        <p className="text-sm font-semibold mt-1">Hover or Tap to Wobble</p>
        <p className="text-xs text-[#D4D4CE] mt-1">
          Decays ±3.2° to 0° equilibrium
        </p>
      </button>
    </div>
  );
}

/**
 * Phys16: Magnetic Snap Docks
 * Proximity-driven scale wave across neighboring dock items.
 */
export function Phys16() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [activeTool, setActiveTool] = useState('Compass');

  const dockItems = [
    { name: 'Compass', Icon: Compass },
    { name: 'Layers', Icon: Layers },
    { name: 'Tune', Icon: Sliders },
    { name: 'Impulse', Icon: Zap },
    { name: 'Effects', Icon: Sparkles },
  ];

  const getScale = (idx: number) => {
    if (hoveredIdx === null) return 1;
    const distance = Math.abs(hoveredIdx - idx);
    if (distance === 0) return 1.32;
    if (distance === 1) return 1.14;
    return 0.96;
  };

  const getLift = (idx: number) => {
    if (hoveredIdx === null) return 0;
    const distance = Math.abs(hoveredIdx - idx);
    if (distance === 0) return -8;
    if (distance === 1) return -3;
    return 0;
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full">
      <div
        onMouseLeave={() => setHoveredIdx(null)}
        className="inline-flex items-end gap-2 px-3 py-2.5 rounded-2xl bg-[#F6F6F4] border border-[#E4E4E0]"
      >
        {dockItems.map(({ name, Icon }, idx) => {
          const isSelected = activeTool === name;
          return (
            <button
              key={name}
              type="button"
              aria-label={`Select ${name} dock item`}
              aria-pressed={isSelected}
              onMouseEnter={() => setHoveredIdx(idx)}
              onFocus={() => setHoveredIdx(idx)}
              onBlur={() => setHoveredIdx(null)}
              onClick={() => setActiveTool(name)}
              style={{
                transform: `translateY(${getLift(idx)}px) scale(${getScale(idx)})`,
                transition: 'transform 360ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              className={`w-10 h-10 rounded-xl border flex items-center justify-center cursor-pointer origin-bottom focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] ${
                isSelected
                  ? 'bg-[#1D4ED8] border-[#1D4ED8] text-white'
                  : 'bg-white border-[#E4E4E0] text-[#141413]'
              }`}
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      <p className="text-xs text-[#6B6B66]">
        Selected dock node:{' '}
        <span className="font-medium text-[#141413]">{activeTool}</span>
      </p>
    </div>
  );
}
