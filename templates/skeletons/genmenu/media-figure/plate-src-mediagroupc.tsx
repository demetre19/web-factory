import { useState } from 'react';
import { Columns2, Pause, Play, Rows2 } from 'lucide-react';

/**
 * Img11: Image with Gradient Overlay + Text
 */
export function Img11() {
  return (
    <figure className="relative overflow-hidden rounded-xl border border-stone-200 bg-stone-950">
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <svg
          viewBox="0 0 800 500"
          className="h-full w-full object-cover"
          role="img"
          aria-label="Botanical architectural arch geometry"
        >
          <defs>
            <linearGradient id="img11-art" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f766e" />
              <stop offset="50%" stopColor="#1d4ed8" />
              <stop offset="100%" stopColor="#09090b" />
            </linearGradient>
          </defs>
          <rect width="800" height="500" fill="url(#img11-art)" />
          <circle cx="570" cy="180" r="145" fill="#fef3c7" fillOpacity="0.22" />
          <circle cx="570" cy="180" r="88" fill="#fde68a" fillOpacity="0.78" />
          <path
            d="M360 500 V240 A140 140 0 0 1 640 240 V500 Z"
            fill="none"
            stroke="#f8fafc"
            strokeOpacity="0.35"
            strokeWidth="2"
          />
          <rect x="480" y="290" width="240" height="210" fill="#020617" fillOpacity="0.45" />
        </svg>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/90 via-black/50 to-transparent"
        />

        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
          <span className="text-xs font-medium text-blue-200">
            Monograph Exhibition · Autumn Edition
          </span>
          <h3 className="mt-1.5 max-w-md font-serif text-2xl font-normal leading-snug text-white">
            Geometry of Light Across Coastal Pavilions
          </h3>
          <p className="mt-2 max-w-md text-sm text-stone-200">
            Directional scrim maintains high typographic contrast across bright solar highlights.
          </p>
        </div>
      </div>

      <figcaption className="border-t border-stone-800 bg-stone-950 px-5 py-3 text-xs text-stone-400">
        Plate 11 · Directional Gradient Scrim + Editorial Typography
      </figcaption>
    </figure>
  );
}

/**
 * Img12: Masonry-Feel Grid
 */
const MASONRY_PLATES = [
  { id: 'm1', title: 'Tall Monolith', ratio: 'aspect-[3/4]', from: '#1e293b', to: '#3b82f6', accent: '#f8fafc' },
  { id: 'm2', title: 'Square Solar', ratio: 'aspect-square', from: '#78350f', to: '#f59e0b', accent: '#fef3c7' },
  { id: 'm3', title: 'Wide Ridge', ratio: 'aspect-[4/3]', from: '#064e3b', to: '#10b981', accent: '#ecfdf5' },
  { id: 'm4', title: 'Vertical Prism', ratio: 'aspect-[3/4]', from: '#312e81', to: '#6366f1', accent: '#e0e7ff' },
  { id: 'm5', title: 'Compact Plate', ratio: 'aspect-[5/4]', from: '#27272a', to: '#52525b', accent: '#f4f4f5' },
  { id: 'm6', title: 'Ochre Study', ratio: 'aspect-square', from: '#7c2d12', to: '#ea580c', accent: '#ffedd5' },
];

export function Img12() {
  const [selectedId, setSelectedId] = useState('m1');
  const selected = MASONRY_PLATES.find((p) => p.id === selectedId) ?? MASONRY_PLATES[0];

  return (
    <figure className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="columns-2 gap-3 space-y-3 sm:columns-3">
        {MASONRY_PLATES.map((item, idx) => {
          const active = item.id === selectedId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              aria-pressed={active}
              aria-label={`Select masonry plate ${item.title}`}
              className={`group relative block w-full break-inside-avoid overflow-hidden rounded-lg text-left transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                active ? 'ring-2 ring-blue-700 ring-offset-2' : 'opacity-90 hover:opacity-100'
              }`}
            >
              <div className={`w-full ${item.ratio}`}>
                <svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
                  <defs>
                    <linearGradient id={`mas-${item.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={item.from} />
                      <stop offset="100%" stopColor={item.to} />
                    </linearGradient>
                  </defs>
                  <rect width="300" height="300" fill={`url(#mas-${item.id})`} />
                  {idx % 2 === 0 ? (
                    <circle cx="150" cy="140" r="68" fill={item.accent} fillOpacity="0.28" />
                  ) : (
                    <rect x="75" y="75" width="150" height="150" rx="16" fill={item.accent} fillOpacity="0.24" />
                  )}
                </svg>
              </div>
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 py-2 text-xs font-medium text-white">
                {item.title}
              </span>
            </button>
          );
        })}
      </div>

      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600">
        <span>Plate 12 · Masonry-Feel Varied Aspect Columns</span>
        <span className="font-mono text-stone-800">Focused: {selected.title}</span>
      </figcaption>
    </figure>
  );
}

/**
 * Img13: Image Marquee Strip
 */
const MARQUEE_PLATES = [
  { id: 'mq1', label: '01 · Cobalt', bg: '#1e3a8a', fg: '#dbeafe' },
  { id: 'mq2', label: '02 · Amber', bg: '#92400e', fg: '#fef3c7' },
  { id: 'mq3', label: '03 · Slate', bg: '#1e293b', fg: '#e2e8f0' },
  { id: 'mq4', label: '04 · Spruce', bg: '#064e3b', fg: '#d1fae5' },
  { id: 'mq5', label: '05 · Indigo', bg: '#312e81', fg: '#e0e7ff' },
  { id: 'mq6', label: '06 · Graphite', bg: '#18181b', fg: '#f4f4f5' },
];

export function Img13() {
  const [paused, setPaused] = useState(false);

  return (
    <figure className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-stone-600">
          Continuous Horizontal Media Ribbon
        </span>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-800 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          {paused ? (
            <>
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="whitespace-nowrap">Resume Strip</span>
            </>
          ) : (
            <>
              <Pause className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="whitespace-nowrap">Pause Strip</span>
            </>
          )}
        </button>
      </div>

      <div className="group relative overflow-hidden rounded-lg border border-stone-100 bg-stone-50 py-3">
        <div
          className={`flex w-max gap-3 ${
            paused ? 'animate-marquee-paused' : 'animate-marquee group-hover:[animation-play-state:paused]'
          }`}
        >
          {[...MARQUEE_PLATES, ...MARQUEE_PLATES].map((tile, idx) => (
            <div
              key={`${tile.id}-${idx}`}
              style={{ backgroundColor: tile.bg, color: tile.fg }}
              className="relative flex h-28 w-44 shrink-0 flex-col justify-between overflow-hidden rounded-md p-3"
            >
              <svg
                viewBox="0 0 180 110"
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full opacity-30"
              >
                <circle cx="140" cy="28" r="46" fill={tile.fg} />
                <line x1="0" y1="88" x2="180" y2="88" stroke={tile.fg} strokeWidth="1" />
              </svg>
              <span className="relative font-mono text-[11px]">{tile.label}</span>
              <span className="relative font-serif text-base">Plate Specimen</span>
            </div>
          ))}
        </div>
      </div>

      <figcaption className="mt-3 text-xs text-stone-600">
        Plate 13 · Image Marquee Strip · Hover or activate Pause Strip to halt motion
      </figcaption>
    </figure>
  );
}

/**
 * Img14: Duotone / Monogram Placeholder Blocks
 */
const DUOTONE_THEMES = {
  cobalt: { label: 'Cobalt', bg: '#1e3a8a', fg: '#eff6ff', stroke: '#60a5fa' },
  ochre: { label: 'Ochre', bg: '#78350f', fg: '#fef3c7', stroke: '#fbbf24' },
  obsidian: { label: 'Obsidian', bg: '#18181b', fg: '#f4f4f5', stroke: '#a1a1aa' },
  forest: { label: 'Forest', bg: '#064e3b', fg: '#ecfdf5', stroke: '#34d399' },
} as const;

type DuotoneKey = keyof typeof DUOTONE_THEMES;

const MONOGRAMS = ['AK', '04', 'MN', 'V2'];

export function Img14() {
  const [themeKey, setThemeKey] = useState<DuotoneKey>('cobalt');
  const theme = DUOTONE_THEMES[themeKey];

  return (
    <figure className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium text-stone-600">Duotone Ink Palette</span>
        <div className="inline-flex items-center gap-1 rounded-lg bg-stone-100 p-1" role="group" aria-label="Select duotone ink theme">
          {(Object.keys(DUOTONE_THEMES) as DuotoneKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setThemeKey(k)}
              aria-pressed={themeKey === k}
              className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                themeKey === k
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {DUOTONE_THEMES[k].label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MONOGRAMS.map((code, idx) => (
          <div
            key={code}
            style={{ backgroundColor: theme.bg, color: theme.fg }}
            className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg p-3"
          >
            <svg viewBox="0 0 120 120" aria-hidden="true" className="absolute inset-0 h-full w-full opacity-25">
              <circle
                cx={idx % 2 === 0 ? 25 : 95}
                cy={idx < 2 ? 25 : 95}
                r="42"
                fill="none"
                stroke={theme.stroke}
                strokeWidth="2"
              />
              <line x1="12" y1="108" x2="108" y2="12" stroke={theme.stroke} strokeWidth="1" />
            </svg>
            <span className="relative font-serif text-3xl font-semibold tracking-tight">
              {code}
            </span>
          </div>
        ))}
      </div>

      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600">
        <span>Plate 14 · Duotone / Monogram Placeholder Blocks</span>
        <span className="font-mono text-stone-800">Palette: {theme.label}</span>
      </figcaption>
    </figure>
  );
}

/**
 * Img15: Split Diptych Editorial Frame
 */
export function Img15() {
  const [stacked, setStacked] = useState(false);

  return (
    <figure className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-stone-600">Paired Diptych Layout</span>
        <button
          type="button"
          onClick={() => setStacked((s) => !s)}
          aria-pressed={stacked}
          className="inline-flex items-center gap-1.5 rounded-md border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-800 hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          {stacked ? (
            <>
              <Columns2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="whitespace-nowrap">Side-by-Side</span>
            </>
          ) : (
            <>
              <Rows2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="whitespace-nowrap">Stack Vertically</span>
            </>
          )}
        </button>
      </div>

      <div className={`grid gap-2 ${stacked ? 'grid-cols-1' : 'grid-cols-2'}`}>
        <div className="relative aspect-square overflow-hidden rounded-lg bg-stone-900">
          <svg viewBox="0 0 320 320" className="h-full w-full" role="img" aria-label="Warm sunrise geometric study">
            <rect width="320" height="320" fill="#7c2d12" />
            <circle cx="160" cy="145" r="72" fill="#fde68a" />
            <rect x="0" y="210" width="320" height="110" fill="#451a03" fillOpacity="0.85" />
          </svg>
          <span className="absolute bottom-2 left-2 font-mono text-[11px] text-amber-100">
            I · Solstice
          </span>
        </div>

        <div className="relative aspect-square overflow-hidden rounded-lg bg-stone-900">
          <svg viewBox="0 0 320 320" className="h-full w-full" role="img" aria-label="Cool midnight geometric study">
            <rect width="320" height="320" fill="#0f172a" />
            <circle cx="160" cy="145" r="72" fill="none" stroke="#93c5fd" strokeWidth="3" />
            <circle cx="160" cy="145" r="36" fill="#2563eb" />
            <rect x="0" y="210" width="320" height="110" fill="#020617" fillOpacity="0.9" />
          </svg>
          <span className="absolute bottom-2 left-2 font-mono text-[11px] text-blue-200">
            II · Equinox
          </span>
        </div>
      </div>

      <figcaption className="mt-3 text-xs text-stone-600">
        Plate 15 · Split Diptych Editorial Frame · Complementary warm &amp; cool study plates
      </figcaption>
    </figure>
  );
}
