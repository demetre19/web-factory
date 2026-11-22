import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Layers, Pause, Play, ZoomIn } from 'lucide-react';
import { computeLoupeOrigin, stepCarouselIndex } from '../../utils/mediaLogic';

/**
 * Img16: Interactive Pan & Zoom Loupe Frame
 */
const ZOOM_LEVELS = [1, 1.75, 2.5] as const;

export function Img16() {
  const [zoom, setZoom] = useState<(typeof ZOOM_LEVELS)[number]>(1);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  return (
    <figure className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600">
          <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Magnification Loupe</span>
        </span>
        <div className="inline-flex items-center gap-1 rounded-lg bg-stone-100 p-1" role="group" aria-label="Select zoom magnification">
          {ZOOM_LEVELS.map((z) => (
            <button
              key={z}
              type="button"
              onClick={() => setZoom(z)}
              aria-pressed={zoom === z}
              className={`whitespace-nowrap rounded-md px-2.5 py-1 font-mono text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                zoom === z
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {z}x
            </button>
          ))}
        </div>
      </div>

      <div
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setOrigin(computeLoupeOrigin(e.clientX, e.clientY, rect));
        }}
        onMouseLeave={() => setOrigin({ x: 50, y: 50 })}
        className="relative aspect-[16/10] w-full cursor-crosshair overflow-hidden rounded-lg bg-slate-950"
      >
        <div
          className="h-full w-full transition-transform duration-150 ease-out"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: `${origin.x}% ${origin.y}%`,
          }}
        >
          <svg
            viewBox="0 0 640 400"
            className="h-full w-full"
            role="img"
            aria-label="Architectural isometric wireframe for loupe inspection"
          >
            <defs>
              <pattern id="img16-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1e293b" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="640" height="400" fill="#090d16" />
            <rect width="640" height="400" fill="url(#img16-grid)" />
            <g stroke="#60a5fa" fill="none" strokeWidth="1.5">
              <polygon points="320,60 510,165 320,270 130,165" />
              <polygon points="320,125 450,195 320,265 190,195" stroke="#fbbf24" />
              <line x1="320" y1="60" x2="320" y2="340" strokeDasharray="4 4" />
              <circle cx="320" cy="195" r="42" stroke="#f8fafc" />
              <circle cx="320" cy="195" r="14" fill="#2563eb" stroke="none" />
            </g>
          </svg>
        </div>
      </div>

      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600">
        <span>Plate 16 · Interactive Pan &amp; Zoom Loupe Frame</span>
        <span className="font-mono tabular-nums text-stone-800">
          {zoom}x · Origin {Math.round(origin.x)}%, {Math.round(origin.y)}%
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Img17: Archival Contact Sheet Strip
 */
const CONTACT_FRAMES = [
  { code: '01A', title: 'North Atrium', shutter: '1/250s · f/4', bg: '#1e293b', accent: '#93c5fd' },
  { code: '02A', title: 'East Stairwell', shutter: '1/125s · f/5.6', bg: '#3f3f46', accent: '#fde68a' },
  { code: '03A', title: 'Roofline', shutter: '1/500s · f/8', bg: '#0f172a', accent: '#6ee7b7' },
  { code: '04A', title: 'Courtyard', shutter: '1/60s · f/2.8', bg: '#292524', accent: '#fdba74' },
];

export function Img17() {
  const [activeCode, setActiveCode] = useState('01A');
  const active = CONTACT_FRAMES.find((f) => f.code === activeCode) ?? CONTACT_FRAMES[0];

  return (
    <figure className="rounded-xl border border-stone-200 bg-stone-950 p-4 text-stone-100">
      <div className="mb-2 flex items-center justify-between font-mono text-[11px] text-stone-400">
        <span>ILFORD HP5 ARCHIVAL SHEET</span>
        <span className="tabular-nums">ROLL 042</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {CONTACT_FRAMES.map((frame) => {
          const isSelected = frame.code === activeCode;
          return (
            <button
              key={frame.code}
              type="button"
              onClick={() => setActiveCode(frame.code)}
              aria-pressed={isSelected}
              aria-label={`Inspect contact frame ${frame.code}: ${frame.title}`}
              className={`group rounded border p-1.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${
                isSelected
                  ? 'border-amber-400 bg-stone-900'
                  : 'border-stone-800 bg-stone-950 hover:border-stone-600'
              }`}
            >
              <div className="aspect-[3/2] overflow-hidden rounded-sm">
                <svg viewBox="0 0 180 120" className="h-full w-full">
                  <rect width="180" height="120" fill={frame.bg} />
                  <circle cx="90" cy="60" r="30" fill={frame.accent} fillOpacity="0.65" />
                  <rect x="24" y="82" width="132" height="18" fill="#09090b" fillOpacity="0.6" />
                </svg>
              </div>
              <div className="mt-1.5 flex items-center justify-between font-mono text-[11px]">
                <span className={isSelected ? 'text-amber-300' : 'text-stone-400'}>
                  {frame.code}
                </span>
                <span className="truncate text-stone-400">{frame.title}</span>
              </div>
            </button>
          );
        })}
      </div>

      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-stone-800 pt-3 text-xs text-stone-300">
        <span>
          Plate 17 · Contact Sheet Strip · Frame {active.code} ({active.title})
        </span>
        <span className="font-mono tabular-nums text-amber-300">{active.shutter}</span>
      </figcaption>
    </figure>
  );
}

/**
 * Img18: Segmented Story / Reel Viewer
 */
const STORY_SLIDES = [
  { id: 's1', title: 'Part I — Timber Frame', caption: 'Laminated spruce ribs assembled on site.', from: '#1e293b', to: '#0f766e' },
  { id: 's2', title: 'Part II — Glazing Skin', caption: 'Low-iron acoustic curtain wall installation.', from: '#1e1b4b', to: '#2563eb' },
  { id: 's3', title: 'Part III — Dusk Opening', caption: 'Warm interior wash against coastal fog.', from: '#451a03', to: '#d97706' },
];

export function Img18() {
  const [index, setIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const total = STORY_SLIDES.length;
  const current = STORY_SLIDES[index];

  useEffect(() => {
    if (!autoPlay) return;
    const id = window.setInterval(() => {
      setIndex((c) => stepCarouselIndex(c, 1, total));
    }, 2800);
    return () => window.clearInterval(id);
  }, [autoPlay, total]);

  return (
    <figure className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="mx-auto max-w-[300px] overflow-hidden rounded-xl border border-stone-200 bg-stone-950 text-white">
        <div className="relative aspect-[3/4] w-full">
          <svg viewBox="0 0 360 480" className="h-full w-full" role="img" aria-label={current.title}>
            <defs>
              <linearGradient id={`story-${current.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={current.from} />
                <stop offset="100%" stopColor={current.to} />
              </linearGradient>
            </defs>
            <rect width="360" height="480" fill={`url(#story-${current.id})`} />
            <circle cx="180" cy="210" r="95" fill="#ffffff" fillOpacity="0.14" />
            <rect x="60" y="290" width="240" height="120" fill="#000000" fillOpacity="0.28" />
          </svg>

          {/* Segmented top progress bar */}
          <div className="absolute inset-x-3 top-3 grid grid-cols-3 gap-1.5">
            {STORY_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setIndex(idx)}
                aria-label={`Jump to story segment ${idx + 1}: ${s.title}`}
                className="h-1.5 overflow-hidden rounded-full bg-white/30"
              >
                <span
                  className={`block h-full transition-all duration-300 ${
                    idx <= index ? 'w-full bg-white' : 'w-0 bg-white'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4">
            <p className="font-serif text-lg text-white">{current.title}</p>
            <p className="mt-1 text-xs text-stone-200">{current.caption}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-stone-800 bg-stone-950 px-3 py-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIndex((c) => stepCarouselIndex(c, -1, total))}
              aria-label="Previous story segment"
              className="flex h-8 w-8 items-center justify-center rounded-md text-stone-200 hover:bg-stone-800"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setIndex((c) => stepCarouselIndex(c, 1, total))}
              aria-label="Next story segment"
              className="flex h-8 w-8 items-center justify-center rounded-md text-stone-200 hover:bg-stone-800"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setAutoPlay((a) => !a)}
            aria-pressed={autoPlay}
            className="inline-flex items-center gap-1.5 rounded-md bg-stone-800 px-2.5 py-1 text-xs font-medium text-stone-100 hover:bg-stone-700"
          >
            {autoPlay ? (
              <>
                <Pause className="h-3 w-3" aria-hidden="true" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3" aria-hidden="true" />
                <span>Autoplay</span>
              </>
            )}
          </button>
        </div>
      </div>

      <figcaption className="mt-3 text-xs text-stone-600">
        Plate 18 · Segmented Story / Reel Viewer · Slide {index + 1} of {total}
      </figcaption>
    </figure>
  );
}

/**
 * Img19: Architectural Mask Frames
 */
type MaskShape = 'arch' | 'circle' | 'chamfer';

export function Img19() {
  const [mask, setMask] = useState<MaskShape>('arch');

  const maskStyle =
    mask === 'arch'
      ? { borderRadius: '9999px 9999px 12px 12px' }
      : mask === 'circle'
        ? { borderRadius: '9999px' }
        : { clipPath: 'polygon(14% 0, 86% 0, 100% 14%, 100% 86%, 86% 100%, 14% 100%, 0 86%, 0 14%)' };

  return (
    <figure className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium text-stone-600">Clip Mask Geometry</span>
        <div className="inline-flex items-center gap-1 rounded-lg bg-stone-100 p-1" role="group" aria-label="Select architectural mask shape">
          {(['arch', 'circle', 'chamfer'] as MaskShape[]).map((shape) => (
            <button
              key={shape}
              type="button"
              onClick={() => setMask(shape)}
              aria-pressed={mask === shape}
              className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 ${
                mask === shape
                  ? 'bg-white text-stone-900 shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {shape}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center rounded-lg bg-stone-50 py-5">
        <div
          style={maskStyle}
          className="h-52 w-52 overflow-hidden border border-stone-200 bg-stone-900 transition-all duration-300"
        >
          <svg
            viewBox="0 0 240 240"
            className="h-full w-full"
            role="img"
            aria-label={`Concentric geometric composition inside ${mask} mask`}
          >
            <defs>
              <linearGradient id="img19-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <rect width="240" height="240" fill="url(#img19-grad)" />
            <circle cx="120" cy="120" r="76" fill="none" stroke="#ffffff" strokeOpacity="0.65" strokeWidth="2" />
            <circle cx="120" cy="120" r="42" fill="#fef3c7" fillOpacity="0.88" />
          </svg>
        </div>
      </div>

      <figcaption className="mt-3 text-xs text-stone-600">
        Plate 19 · Architectural Mask Frames · Non-rectangular archway, medallion, and chamfered octagon crops
      </figcaption>
    </figure>
  );
}

/**
 * Img20: Layered Depth Card Stack
 */
const STACK_PLATES = [
  { id: 'st1', title: 'Edition I — Cobalt Basin', code: '01 / 03', from: '#0f172a', to: '#1d4ed8' },
  { id: 'st2', title: 'Edition II — Warm Travertine', code: '02 / 03', from: '#78350f', to: '#d97706' },
  { id: 'st3', title: 'Edition III — Mineral Sage', code: '03 / 03', from: '#064e3b', to: '#10b981' },
];

export function Img20() {
  const [frontIdx, setFrontIdx] = useState(0);
  const total = STACK_PLATES.length;
  const frontPlate = STACK_PLATES[frontIdx];

  return (
    <figure className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600">
          <Layers className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Interactive Plate Stack</span>
        </span>
        <button
          type="button"
          onClick={() => setFrontIdx((c) => stepCarouselIndex(c, 1, total))}
          className="inline-flex items-center gap-1.5 rounded-md bg-stone-900 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-stone-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <span className="whitespace-nowrap">Next Plate</span>
        </button>
      </div>

      <div className="relative mx-auto h-60 max-w-sm pt-2">
        {STACK_PLATES.map((plate, idx) => {
          const offset = (idx - frontIdx + total) % total;
          const translateY = offset * 12;
          const scale = 1 - offset * 0.05;
          const zIndex = total - offset;
          const opacity = offset === 0 ? 1 : offset === 1 ? 0.85 : 0.68;

          return (
            <button
              key={plate.id}
              type="button"
              onClick={() => setFrontIdx(idx)}
              aria-label={`Bring ${plate.title} to front of stack`}
              style={{
                zIndex,
                opacity,
                transform: `translate3d(0, ${translateY}px, 0) scale(${scale})`,
              }}
              className="absolute inset-x-0 top-2 block h-52 w-full overflow-hidden rounded-lg border border-white/20 text-left shadow-md transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              <svg viewBox="0 0 400 220" className="h-full w-full" aria-hidden="true">
                <defs>
                  <linearGradient id={`stk-${plate.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={plate.from} />
                    <stop offset="100%" stopColor={plate.to} />
                  </linearGradient>
                </defs>
                <rect width="400" height="220" fill={`url(#stk-${plate.id})`} />
                <circle cx="310" cy="70" r="46" fill="#ffffff" fillOpacity="0.22" />
              </svg>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/85 to-transparent p-4 text-white">
                <span className="font-serif text-base">{plate.title}</span>
                <span className="font-mono text-xs tabular-nums text-stone-300">
                  {plate.code}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600">
        <span>Plate 20 · Layered Depth Card Stack</span>
        <span className="font-mono text-stone-800">{frontPlate.title}</span>
      </figcaption>
    </figure>
  );
}
