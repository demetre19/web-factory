import React, { useId, useState } from 'react';
import { Share2, Bookmark, Link2, Heart, Plus } from 'lucide-react';

/**
 * Goo6: Gooey Nav Indicator — sliding blob stretches between tabs with trailing droplet.
 */
const NAV_TABS = ['Studio', 'Fluid', 'Optics', 'Lab'] as const;

export const Goo6: React.FC = () => {
  const uid = useId().replace(/:/g, '');
  const filterId = `goo-filter-6-${uid}`;
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <div className="relative flex h-56 w-full flex-col items-center justify-between rounded-xl bg-[#F4F4F0] p-4 select-none">
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

      <div className="flex w-full items-center justify-end">
        <span className="text-xs font-mono text-stone-500">Active: {NAV_TABS[activeIdx]}</span>
      </div>

      <div className="relative w-full max-w-[264px] rounded-2xl border border-stone-200 bg-white p-1.5 shadow-xs">
        <div
          className="pointer-events-none absolute inset-1.5"
          style={{ filter: `url(#${filterId})` }}
        >
          <div
            className="absolute top-0 bottom-0 left-0 w-1/4 rounded-xl bg-[#141413] transition-transform duration-400 ease-[cubic-bezier(0.34,1.35,0.64,1)]"
            style={{ transform: `translateX(${activeIdx * 100}%)` }}
          />
          <div
            className="absolute top-1 bottom-1 left-2 w-[calc(25%-16px)] rounded-full bg-[#141413] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              transform: `translateX(${activeIdx * 100}%)`,
              transitionDelay: '45ms',
            }}
          />
        </div>

        <div role="tablist" aria-label="Gooey navigation tabs" className="relative z-10 grid grid-cols-4">
          {NAV_TABS.map((tab, idx) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeIdx === idx}
              onClick={() => setActiveIdx(idx)}
              className={`h-10 rounded-xl text-xs font-medium transition-colors duration-200 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-600 ${
                activeIdx === idx ? 'text-white' : 'text-stone-600 hover:text-[#141413]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-stone-500">Click tabs to trail viscous indicator blob</p>
    </div>
  );
};

/**
 * Goo11: Liquid Toggle — blob slides inside track with trailing bead detachment.
 */
export const Goo11: React.FC = () => {
  const uid = useId().replace(/:/g, '');
  const filterId = `goo-filter-11-${uid}`;
  const [checked, setChecked] = useState(false);

  return (
    <div className="relative flex h-56 w-full flex-col items-center justify-between rounded-xl bg-[#F4F4F0] p-4 select-none">
      <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
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
        <span className="text-xs font-mono text-stone-500">{checked ? 'ON' : 'OFF'}</span>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label="Liquid toggle switch"
        onClick={() => setChecked((v) => !v)}
        className={`relative flex h-14 w-28 items-center rounded-full border p-2 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${
          checked ? 'border-blue-700 bg-blue-600' : 'border-stone-300 bg-white'
        }`}
      >
        <div
          className="pointer-events-none relative h-10 w-full"
          style={{ filter: `url(#${filterId})` }}
        >
          <div
            className={`absolute top-0 left-0 h-10 w-10 rounded-full transition-all duration-400 ease-[cubic-bezier(0.34,1.35,0.64,1)] ${
              checked ? 'translate-x-14 bg-white' : 'translate-x-0 bg-[#141413]'
            }`}
          />
          <div
            className={`absolute top-2 left-2 h-6 w-6 rounded-full transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              checked ? 'translate-x-14 bg-white' : 'translate-x-0 bg-[#141413]'
            }`}
            style={{ transitionDelay: '55ms' }}
          />
        </div>
      </button>

      <p className="text-xs text-stone-500">
        {checked ? 'Active liquid state engaged' : 'Click switch to slide & coalesce'}
      </p>
    </div>
  );
};

/**
 * Goo14: Gooey Social Icon Cluster — central hub extrudes 4 radial action buttons.
 */
const CLUSTER_ITEMS = [
  { label: 'Share', Icon: Share2, tx: -58, ty: -24 },
  { label: 'Save', Icon: Bookmark, tx: -22, ty: -60 },
  { label: 'Copy Link', Icon: Link2, tx: 22, ty: -60 },
  { label: 'Favorite', Icon: Heart, tx: 58, ty: -24 },
] as const;

export const Goo14: React.FC = () => {
  const uid = useId().replace(/:/g, '');
  const filterId = `goo-filter-14-${uid}`;
  const [open, setOpen] = useState(false);
  const [lastAction, setLastAction] = useState<string>('Hub closed');

  return (
    <div className="relative flex h-56 w-full flex-col items-center justify-between rounded-xl bg-[#F4F4F0] p-4 select-none">
      <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
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
        <span className="text-xs text-stone-500">{lastAction}</span>
      </div>

      <div className="relative flex h-32 w-full items-end justify-center pb-3">
        <div
          className="pointer-events-none absolute inset-0 flex items-end justify-center pb-3"
          style={{ filter: `url(#${filterId})` }}
        >
          <div className="h-12 w-12 rounded-full bg-[#141413]" />
          {CLUSTER_ITEMS.map(({ label, tx, ty }, idx) => (
            <div
              key={label}
              className="absolute h-10 w-10 rounded-full bg-[#141413] transition-transform duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)]"
              style={{
                transform: open
                  ? `translate(${tx}px, ${ty}px) scale(1)`
                  : 'translate(0px, 0px) scale(0.55)',
                transitionDelay: `${idx * 35}ms`,
              }}
            />
          ))}
        </div>

        {CLUSTER_ITEMS.map(({ label, Icon, tx, ty }, idx) => (
          <button
            key={label}
            type="button"
            aria-label={label}
            tabIndex={open ? 0 : -1}
            onClick={() => setLastAction(`Selected ${label}`)}
            className="absolute flex h-10 w-10 items-center justify-center rounded-full text-white transition-all duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            style={{
              transform: open
                ? `translate(${tx}px, ${ty}px) scale(1)`
                : 'translate(0px, 0px) scale(0.3)',
              opacity: open ? 1 : 0,
              pointerEvents: open ? 'auto' : 'none',
              transitionDelay: `${idx * 35}ms`,
            }}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        ))}

        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? 'Collapse action cluster' : 'Expand action cluster'}
          onClick={() => {
            setOpen((v) => !v);
            setLastAction(!open ? 'Cluster extruded' : 'Hub closed');
          }}
          className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full text-white transition-transform duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <p className="text-xs text-stone-500">Click + hub to extrude gooey radial buttons</p>
    </div>
  );
};

/**
 * Goo19: Viscous Magnetic Scrubber — dragging pulls a stretching meniscus behind the thumb.
 */
export const Goo19: React.FC = () => {
  const uid = useId().replace(/:/g, '');
  const filterId = `goo-filter-19-${uid}`;
  const [value, setValue] = useState(42);
  const [dragging, setDragging] = useState(false);

  return (
    <div className="relative flex h-56 w-full flex-col items-center justify-between rounded-xl bg-[#F4F4F0] p-4 select-none">
      <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="5.5" result="blur" />
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

      <div className="flex w-full items-center justify-between">
        <label htmlFor="goo-scrubber-19" className="text-xs font-medium text-stone-700">
          Viscosity Level
        </label>
        <span className="text-xs font-mono text-stone-700 tabular-nums">{value}%</span>
      </div>

      <div className="relative flex h-16 w-full max-w-[250px] items-center">
        <div className="h-3 w-full rounded-full bg-stone-300" />

        <div
          className="pointer-events-none absolute inset-x-0 top-1/2 flex h-12 -translate-y-1/2 items-center"
          style={{ filter: `url(#${filterId})` }}
        >
          <div
            className="h-3 rounded-full bg-blue-600 transition-[width] duration-75"
            style={{ width: `${value}%` }}
          />
          <div
            className="absolute h-7 w-7 -translate-x-1/2 rounded-full bg-blue-600 transition-transform duration-200"
            style={{
              left: `${value}%`,
              transform: `translateX(-50%) scale(${dragging ? 1.25 : 1})`,
            }}
          />
          <div
            className="absolute h-5 w-5 -translate-x-1/2 rounded-full bg-blue-600 transition-all duration-300 ease-out"
            style={{
              left: `${value}%`,
              transform: `translateX(-50%) scale(${dragging ? 0.9 : 0.4})`,
              transitionDelay: '40ms',
            }}
          />
        </div>

        <input
          id="goo-scrubber-19"
          type="range"
          min={4}
          max={96}
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          onPointerDown={() => setDragging(true)}
          onPointerUp={() => setDragging(false)}
          onBlur={() => setDragging(false)}
          className="relative z-10 h-10 w-full cursor-pointer opacity-0"
        />
      </div>

      <p className="text-xs text-stone-500">Scrub slider to stretch liquid meniscus</p>
    </div>
  );
};
