import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, RefreshCw, X } from 'lucide-react';
import { computeAspectDimensions, stepCarouselIndex } from '../../utils/mediaLogic';

/**
 * Img6: Lightbox Thumbnail Strip
 */
const LIGHTBOX_PLATES = [
  { id: 'lb1', title: 'Northern Glacier', code: 'ARC-01', from: '#0f172a', to: '#0284c7', shape: 'wave' },
  { id: 'lb2', title: 'Sienna Vault', code: 'ARC-02', from: '#7c2d12', to: '#ea580c', shape: 'arch' },
  { id: 'lb3', title: 'Graphite Facade', code: 'ARC-03', from: '#18181b', to: '#52525b', shape: 'grid' },
  { id: 'lb4', title: 'Pine Conservatory', code: 'ARC-04', from: '#064e3b', to: '#059669', shape: 'circle' },
  { id: 'lb5', title: 'Indigo Colonnade', code: 'ARC-05', from: '#1e1b4b', to: '#4f46e5', shape: 'columns' },
] as const;

function LightboxArtwork({ plate }: { plate: (typeof LIGHTBOX_PLATES)[number] }) {
  return (
    <svg viewBox="0 0 640 400" className="h-full w-full object-cover" role="img" aria-label={plate.title}>
      <defs>
        <linearGradient id={`lb-${plate.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={plate.from} />
          <stop offset="100%" stopColor={plate.to} />
        </linearGradient>
      </defs>
      <rect width="640" height="400" fill={`url(#lb-${plate.id})`} />
      {plate.shape === 'wave' && (
        <path d="M0 270 Q170 180 340 250 T640 210 L640 400 L0 400 Z" fill="#e0f2fe" fillOpacity="0.28" />
      )}
      {plate.shape === 'arch' && (
        <path d="M210 380 V180 A110 110 0 0 1 430 180 V380 Z" fill="#ffedd5" fillOpacity="0.34" />
      )}
      {plate.shape === 'grid' && (
        <g stroke="#e4e4e7" strokeOpacity="0.35" strokeWidth="1.5">
          <rect x="140" y="70" width="360" height="260" fill="none" />
          <line x1="260" y1="70" x2="260" y2="330" />
          <line x1="380" y1="70" x2="380" y2="330" />
          <line x1="140" y1="200" x2="500" y2="200" />
        </g>
      )}
      {plate.shape === 'circle' && (
        <circle cx="320" cy="200" r="105" fill="#d1fae5" fillOpacity="0.32" />
      )}
      {plate.shape === 'columns' && (
        <g fill="#e0e7ff" fillOpacity="0.32">
          <rect x="140" y="75" width="52" height="250" />
          <rect x="236" y="75" width="52" height="250" />
          <rect x="332" y="75" width="52" height="250" />
          <rect x="428" y="75" width="52" height="250" />
        </g>
      )}
    </svg>
  );
}

export function Img6() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const current = LIGHTBOX_PLATES[activeIdx];

  useEffect(() => {
    if (!modalOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false);
      if (e.key === 'ArrowRight') {
        setActiveIdx((c) => stepCarouselIndex(c, 1, LIGHTBOX_PLATES.length));
      }
      if (e.key === 'ArrowLeft') {
        setActiveIdx((c) => stepCarouselIndex(c, -1, LIGHTBOX_PLATES.length));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalOpen]);

  return (
    <figure className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg bg-stone-900">
        <LightboxArtwork plate={current} />
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          aria-label={`Open ${current.title} in fullscreen lightbox`}
          className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-white/95 px-3 py-1.5 text-xs font-medium text-stone-900 shadow-sm transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="whitespace-nowrap">Open Lightbox</span>
        </button>
      </div>

      {/* Thumbnail strip */}
      <div className="mt-3 grid grid-cols-5 gap-2">
        {LIGHTBOX_PLATES.map((plate, idx) => {
          const isSelected = idx === activeIdx;
          return (
            <button
              key={plate.id}
              type="button"
              onClick={() => setActiveIdx(idx)}
              aria-label={`Select thumbnail ${plate.title}`}
              aria-pressed={isSelected}
              className={`relative aspect-[16/10] overflow-hidden rounded-md transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                isSelected
                  ? 'ring-2 ring-blue-700 ring-offset-2'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <LightboxArtwork plate={plate} />
            </button>
          );
        })}
      </div>

      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600">
        <span>
          Plate 06 · Lightbox Thumbnail Strip · {current.title}
        </span>
        <span className="font-mono tabular-nums text-stone-800">
          {current.code} · {activeIdx + 1} / {LIGHTBOX_PLATES.length}
        </span>
      </figcaption>

      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Lightbox preview: ${current.title}`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-4xl rounded-xl border border-stone-800 bg-stone-950 p-4 text-white shadow-2xl">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-stone-400">{current.code}</p>
                <p className="font-serif text-lg text-white">{current.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close lightbox modal"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-stone-700 bg-stone-900 text-stone-200 hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-white"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg">
              <LightboxArtwork plate={current} />
              <button
                type="button"
                onClick={() =>
                  setActiveIdx((c) => stepCarouselIndex(c, -1, LIGHTBOX_PLATES.length))
                }
                aria-label="Previous lightbox image"
                className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/85"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveIdx((c) => stepCarouselIndex(c, 1, LIGHTBOX_PLATES.length))
                }
                aria-label="Next lightbox image"
                className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/85"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </figure>
  );
}

/**
 * Img7: Avatar Groups (Stacked Overlapping)
 */
const STUDIO_ROSTER = [
  { initials: 'AK', name: 'Amina Koury', role: 'Editorial Director', bg: '#1e3a8a', fg: '#eff6ff' },
  { initials: 'JL', name: 'Jonas Lindqvist', role: 'Type Systems', bg: '#065f46', fg: '#ecfdf5' },
  { initials: 'MR', name: 'Maya Roshan', role: 'Spatial Geometry', bg: '#9a3412', fg: '#fff7ed' },
  { initials: 'TC', name: 'Theo Chen', role: 'Motion Craft', bg: '#27272a', fg: '#fafafa' },
  { initials: 'EV', name: 'Elena Vance', role: 'Archival Curation', bg: '#4c1d95', fg: '#f5f3ff' },
];

export function Img7() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const member = STUDIO_ROSTER[selectedIdx];

  return (
    <figure className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-5">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center -space-x-3">
            {STUDIO_ROSTER.map((person, idx) => {
              const active = idx === selectedIdx;
              return (
                <button
                  key={person.initials}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  aria-label={`Select contributor ${person.name}, ${person.role}`}
                  aria-pressed={active}
                  style={{ backgroundColor: person.bg, color: person.fg }}
                  className={`relative flex h-12 w-12 items-center justify-center rounded-full font-serif text-sm font-semibold ring-2 ring-white transition-transform duration-150 hover:z-10 hover:-translate-y-0.5 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                    active ? 'z-10 ring-blue-700 ring-offset-1' : ''
                  }`}
                >
                  {person.initials}
                </button>
              );
            })}
            <span
              aria-label="Eight additional contributors"
              className="relative flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 font-mono text-xs font-medium text-stone-700 ring-2 ring-white"
            >
              +8
            </span>
          </div>

          <div className="text-right">
            <span className="font-mono text-xs tabular-nums text-stone-500">
              13 Contributors
            </span>
          </div>
        </div>

        <div className="mt-5 border-t border-stone-100 pt-4">
          <p className="font-serif text-lg text-stone-900">{member.name}</p>
          <p className="mt-0.5 text-sm text-stone-600">{member.role}</p>
        </div>
      </div>

      <figcaption className="mt-4 text-xs text-stone-500">
        Plate 07 · Stacked Overlapping Avatar Group · Click any monogram medallion to inspect contributor details
      </figcaption>
    </figure>
  );
}

/**
 * Img8: Image Card with Badge Overlay
 */
export function Img8() {
  return (
    <figure className="overflow-hidden rounded-xl border border-stone-200 bg-white">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-900">
        <svg
          viewBox="0 0 600 450"
          className="h-full w-full object-cover"
          role="img"
          aria-label="Coastal tideplate abstract geometry"
        >
          <defs>
            <linearGradient id="img8-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="50%" stopColor="#1e40af" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
          <rect width="600" height="450" fill="url(#img8-grad)" />
          <circle cx="445" cy="125" r="46" fill="#fef9c3" fillOpacity="0.92" />
          <path
            d="M0 300 C160 250 320 350 600 280 L600 450 L0 450 Z"
            fill="#0c4a6e"
            fillOpacity="0.7"
          />
          <path
            d="M0 360 C200 325 380 390 600 345 L600 450 L0 450 Z"
            fill="#082f49"
          />
        </svg>

        <span className="absolute left-3 top-3 rounded bg-white/95 px-2.5 py-1 font-mono text-[11px] font-medium tracking-tight text-stone-900 shadow-sm">
          Edition 04 / 50
        </span>
        <span className="absolute right-3 top-3 rounded bg-blue-700 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm">
          Archival Print
        </span>
      </div>

      <figcaption className="p-4">
        <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
          <span>Plate 08 · Badge Overlay Card</span>
          <span className="font-mono tabular-nums">4:3</span>
        </div>
        <p className="mt-1 font-serif text-lg text-stone-900">
          Tidal Equinox — Chromatic Horizon Study
        </p>
      </figcaption>
    </figure>
  );
}

/**
 * Img9: Aspect-Ratio Constrained Frames (16:9, 1:1, 4:3)
 */
const RATIOS: Array<'16:9' | '1:1' | '4:3'> = ['16:9', '1:1', '4:3'];

export function Img9() {
  const [ratio, setRatio] = useState<'16:9' | '1:1' | '4:3'>('16:9');
  const dims = computeAspectDimensions(ratio, 1200);

  const aspectClass =
    ratio === '16:9'
      ? 'aspect-video'
      : ratio === '1:1'
        ? 'aspect-square max-w-[260px]'
        : 'aspect-[4/3] max-w-[340px]';

  return (
    <figure className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1 rounded-lg bg-stone-100 p-1" role="group" aria-label="Select frame aspect ratio">
          {RATIOS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRatio(r)}
              aria-pressed={ratio === r}
              className={`whitespace-nowrap rounded-md px-3 py-1.5 font-mono text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                ratio === r
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <span className="font-mono text-xs tabular-nums text-stone-600">
          {dims.width} × {dims.height} ({dims.label})
        </span>
      </div>

      <div className="flex min-h-[240px] items-center justify-center rounded-lg bg-stone-100 p-4">
        <div
          className={`relative w-full overflow-hidden rounded-md border border-stone-300 bg-stone-900 transition-all duration-200 ${aspectClass}`}
        >
          <svg
            viewBox="0 0 600 450"
            preserveAspectRatio="xMidYMid slice"
            className="h-full w-full"
            role="img"
            aria-label={`Aspect ratio constrained composition at ${ratio}`}
          >
            <defs>
              <linearGradient id="img9-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f766e" />
              </linearGradient>
            </defs>
            <rect width="600" height="450" fill="url(#img9-bg)" />
            <circle cx="300" cy="225" r="110" fill="none" stroke="#99f6e4" strokeWidth="2" />
            <circle cx="300" cy="225" r="56" fill="#f59e0b" fillOpacity="0.88" />
            <line x1="0" y1="225" x2="600" y2="225" stroke="#ffffff" strokeOpacity="0.25" strokeDasharray="4 4" />
            <line x1="300" y1="0" x2="300" y2="450" stroke="#ffffff" strokeOpacity="0.25" strokeDasharray="4 4" />
          </svg>
          <span className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-0.5 font-mono text-[11px] text-white">
            {ratio}
          </span>
        </div>
      </div>

      <figcaption className="mt-3 text-xs text-stone-600">
        Plate 09 · Aspect-Ratio Constrained Frames · Switches between 16:9 widescreen, 1:1 square, and 4:3 editorial crops
      </figcaption>
    </figure>
  );
}

/**
 * Img10: Blurred-Placeholder Loading Block
 */
export function Img10() {
  const [loaded, setLoaded] = useState(true);

  const triggerReload = () => {
    setLoaded(false);
    window.setTimeout(() => {
      setLoaded(true);
    }, 950);
  };

  return (
    <figure className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-stone-200">
        {/* Sharp resolved vector artwork */}
        <svg
          viewBox="0 0 640 400"
          className={`h-full w-full object-cover transition-all duration-500 ${
            loaded ? 'scale-100 blur-0 opacity-100' : 'scale-110 blur-xl opacity-80'
          }`}
          role="img"
          aria-label="Progressive blur-up architectural courtyard plate"
        >
          <defs>
            <linearGradient id="img10-sky" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#312e81" />
              <stop offset="60%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#bae6fd" />
            </linearGradient>
          </defs>
          <rect width="640" height="400" fill="url(#img10-sky)" />
          <rect x="110" y="95" width="180" height="245" fill="#0f172a" />
          <rect x="330" y="135" width="200" height="205" fill="#1e293b" />
          <circle cx="485" cy="86" r="34" fill="#fef08a" />
          <rect x="0" y="340" width="640" height="60" fill="#09090b" />
        </svg>

        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-900/15 backdrop-blur-md">
            <span className="rounded bg-white/90 px-3 py-1.5 font-mono text-xs font-medium text-stone-900 shadow-sm">
              Decoding plate…
            </span>
          </div>
        )}
      </div>

      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-xs text-stone-500">
            Plate 10 · Blurred-Placeholder Loader
          </span>
          <p className="text-sm font-medium text-stone-900">
            State: {loaded ? 'Resolved Sharp Vector' : 'Low-Frequency Blur Mesh'}
          </p>
        </div>

        <button
          type="button"
          onClick={triggerReload}
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 transition-colors hover:bg-stone-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${!loaded ? 'animate-spin' : ''}`} aria-hidden="true" />
          <span className="whitespace-nowrap">Simulate Reload</span>
        </button>
      </figcaption>
    </figure>
  );
}
