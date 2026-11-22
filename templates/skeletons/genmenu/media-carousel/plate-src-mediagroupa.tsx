import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, MoveHorizontal } from 'lucide-react';
import {
  clampPercentage,
  computePointerPercent,
  formatSlideCounter,
  stepCarouselIndex,
} from '../../utils/mediaLogic';

/**
 * Img1: Image with Caption Overlay
 */
export function Img1() {
  return (
    <figure className="group relative overflow-hidden rounded-xl border border-stone-200 bg-stone-900">
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <svg
          viewBox="0 0 800 500"
          className="h-full w-full object-cover"
          role="img"
          aria-label="Layered cobalt and slate horizon geometry"
        >
          <defs>
            <linearGradient id="img1-sky" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="55%" stopColor="#1e3a8a" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="img1-ridge" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <rect width="800" height="500" fill="url(#img1-sky)" />
          <circle cx="590" cy="145" r="56" fill="#fef3c7" fillOpacity="0.88" />
          <circle cx="590" cy="145" r="88" fill="#fde68a" fillOpacity="0.16" />
          <path
            d="M0 340 Q180 215 360 300 T800 250 L800 500 L0 500 Z"
            fill="url(#img1-ridge)"
          />
          <path
            d="M0 400 Q240 310 490 385 T800 345 L800 500 L0 500 Z"
            fill="#0b1120"
            fillOpacity="0.9"
          />
          <line
            x1="48"
            y1="48"
            x2="136"
            y2="48"
            stroke="#93c5fd"
            strokeOpacity="0.5"
            strokeWidth="1.5"
          />
        </svg>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"
        />

        <figcaption className="absolute inset-x-0 bottom-0 p-5 text-white">
          <div className="flex items-center gap-2 text-xs text-stone-300">
            <span>Plate 01</span>
            <span aria-hidden="true">·</span>
            <span>Nocturne Study</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">16:10</span>
          </div>
          <p className="mt-1 font-serif text-xl font-normal tracking-tight text-white">
            High-altitude twilight ridge over obsidian basin
          </p>
        </figcaption>
      </div>
    </figure>
  );
}

/**
 * Img2: Image with Hover Zoom + Caption Reveal
 */
export function Img2() {
  const [pinnedReveal, setPinnedReveal] = useState(false);

  return (
    <figure className="group relative overflow-hidden rounded-xl border border-stone-200 bg-stone-100">
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <div
          className={`h-full w-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105 ${
            pinnedReveal ? 'scale-105' : 'scale-100'
          }`}
        >
          <svg
            viewBox="0 0 800 500"
            className="h-full w-full object-cover"
            role="img"
            aria-label="Bauhaus architectural arches in warm ochre and charcoal"
          >
            <defs>
              <linearGradient id="img2-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e7e5e4" />
                <stop offset="100%" stopColor="#d6d3d1" />
              </linearGradient>
              <linearGradient id="img2-arch" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1c1917" />
                <stop offset="100%" stopColor="#44403c" />
              </linearGradient>
            </defs>
            <rect width="800" height="500" fill="url(#img2-bg)" />
            <rect x="88" y="64" width="240" height="372" rx="120" fill="url(#img2-arch)" />
            <rect x="372" y="108" width="180" height="328" fill="#b45309" fillOpacity="0.88" />
            <circle cx="628" cy="186" r="76" fill="#1d4ed8" fillOpacity="0.85" />
            <rect x="552" y="294" width="152" height="142" fill="#292524" />
            <line x1="48" y1="436" x2="752" y2="436" stroke="#1c1917" strokeWidth="2" />
          </svg>
        </div>

        <button
          type="button"
          onClick={() => setPinnedReveal((prev) => !prev)}
          aria-pressed={pinnedReveal}
          aria-label="Toggle caption reveal on architectural composition"
          className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-md bg-white/90 px-2.5 py-1.5 text-xs font-medium text-stone-800 shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="whitespace-nowrap">{pinnedReveal ? 'Hide Info' : 'Inspect'}</span>
        </button>

        <figcaption
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-stone-950/90 via-stone-950/70 to-transparent p-5 text-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:opacity-100 ${
            pinnedReveal
              ? 'translate-y-0 opacity-100'
              : 'translate-y-3 opacity-0'
          }`}
        >
          <div className="flex items-center gap-2 text-xs text-stone-300">
            <span>Plate 02</span>
            <span aria-hidden="true">·</span>
            <span>Hover &amp; Focus Reveal</span>
          </div>
          <p className="mt-1 font-serif text-lg text-white">
            Monolith colonnade study in travertine &amp; cobalt
          </p>
        </figcaption>
      </div>
    </figure>
  );
}

/**
 * Img3: Before / After Comparison Slider (Draggable Handle)
 */
export function Img3() {
  const [split, setSplit] = useState(52);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const updateFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setSplit(computePointerPercent(clientX, rect.left, rect.width));
  };

  return (
    <figure className="rounded-xl border border-stone-200 bg-white p-4">
      <div
        ref={trackRef}
        onPointerDown={(e) => {
          draggingRef.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          updateFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (!draggingRef.current) return;
          updateFromClientX(e.clientX);
        }}
        onPointerUp={(e) => {
          draggingRef.current = false;
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            e.currentTarget.releasePointerCapture(e.pointerId);
          }
        }}
        className="relative aspect-[16/9] w-full cursor-ew-resize select-none overflow-hidden rounded-lg bg-stone-950"
      >
        {/* AFTER layer: Full rendered duotone architectural study */}
        <svg
          viewBox="0 0 960 540"
          className="h-full w-full object-cover"
          role="img"
          aria-label="Rendered architectural pavilion in warm dusk tones"
        >
          <defs>
            <linearGradient id="img3-after-sky" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a8a" />
              <stop offset="55%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <rect width="960" height="540" fill="url(#img3-after-sky)" />
          <polygon points="120,440 420,170 760,440" fill="#1e293b" />
          <polygon points="420,170 760,440 840,440 460,140" fill="#0f172a" />
          <rect x="260" y="310" width="220" height="130" fill="#fef3c7" fillOpacity="0.92" />
          <rect x="284" y="330" width="76" height="90" fill="#1d4ed8" />
          <rect x="380" y="330" width="76" height="90" fill="#1e40af" />
          <rect x="0" y="440" width="960" height="100" fill="#09090b" />
        </svg>

        {/* BEFORE layer: Clipped monochrome blueprint wireframe */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
        >
          <svg
            viewBox="0 0 960 540"
            className="h-full w-full object-cover"
            aria-hidden="true"
          >
            <defs>
              <pattern id="img3-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path
                  d="M 32 0 L 0 0 0 32"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="0.8"
                />
              </pattern>
            </defs>
            <rect width="960" height="540" fill="#0b1220" />
            <rect width="960" height="540" fill="url(#img3-grid)" />
            <polygon
              points="120,440 420,170 760,440"
              fill="none"
              stroke="#93c5fd"
              strokeWidth="2"
            />
            <polygon
              points="420,170 760,440 840,440 460,140"
              fill="none"
              stroke="#60a5fa"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <rect
              x="260"
              y="310"
              width="220"
              height="130"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="2"
            />
            <rect
              x="284"
              y="330"
              width="76"
              height="90"
              fill="none"
              stroke="#93c5fd"
              strokeWidth="1.5"
            />
            <rect
              x="380"
              y="330"
              width="76"
              height="90"
              fill="none"
              stroke="#93c5fd"
              strokeWidth="1.5"
            />
            <line x1="0" y1="440" x2="960" y2="440" stroke="#cbd5e1" strokeWidth="2" />
          </svg>
        </div>

        {/* Corner state markers */}
        <span className="pointer-events-none absolute left-3 top-3 rounded bg-black/70 px-2 py-1 font-mono text-[11px] font-medium text-stone-100">
          Before · CAD Wireframe
        </span>
        <span className="pointer-events-none absolute right-3 top-3 rounded bg-black/70 px-2 py-1 font-mono text-[11px] font-medium text-stone-100">
          After · Rendered Plate
        </span>

        {/* Divider line + circular handle */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow-sm"
          style={{ left: `${split}%` }}
        >
          <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-900 shadow-md">
            <MoveHorizontal className="h-4 w-4" />
          </div>
        </div>
      </div>

      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-medium text-stone-500">
            Plate 03 · Interactive Comparison
          </span>
          <p className="text-sm font-medium text-stone-900">
            Drag handle or use the range control to inspect wireframe vs. shaded render
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="img3-range" className="text-xs text-stone-600">
            Split Position
          </label>
          <input
            id="img3-range"
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(split)}
            onChange={(e) => setSplit(clampPercentage(Number(e.target.value)))}
            aria-label="Before and after comparison split percentage"
            className="w-28 accent-blue-700"
          />
          <span className="w-11 text-right font-mono text-xs font-medium tabular-nums text-stone-800">
            {Math.round(split)}%
          </span>
        </div>
      </figcaption>
    </figure>
  );
}

/**
 * Img4: Image Gallery Grid with Featured Item
 */
const GALLERY_PLATES = [
  {
    id: 'g1',
    title: 'Solstice Meridian',
    meta: 'Series I · 24mm Planar',
    bgFrom: '#0f172a',
    bgTo: '#1d4ed8',
    accent: '#fbbf24',
    shape: 'circle',
  },
  {
    id: 'g2',
    title: 'Terracotta Cantilever',
    meta: 'Series II · Elevation B',
    bgFrom: '#451a03',
    bgTo: '#b45309',
    accent: '#fef3c7',
    shape: 'arch',
  },
  {
    id: 'g3',
    title: 'Botanical Glasshouse',
    meta: 'Series III · Atrium Study',
    bgFrom: '#064e3b',
    bgTo: '#047857',
    accent: '#a7f3d0',
    shape: 'prism',
  },
  {
    id: 'g4',
    title: 'Basalt Monolith',
    meta: 'Series IV · North Facade',
    bgFrom: '#18181b',
    bgTo: '#3f3f46',
    accent: '#e4e4e7',
    shape: 'bars',
  },
] as const;

function GalleryArtwork({
  plate,
}: {
  plate: (typeof GALLERY_PLATES)[number];
}) {
  return (
    <svg
      viewBox="0 0 600 400"
      className="h-full w-full object-cover"
      role="img"
      aria-label={plate.title}
    >
      <defs>
        <linearGradient id={`gal-${plate.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={plate.bgFrom} />
          <stop offset="100%" stopColor={plate.bgTo} />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill={`url(#gal-${plate.id})`} />
      {plate.shape === 'circle' && (
        <>
          <circle cx="300" cy="200" r="108" fill={plate.accent} fillOpacity="0.9" />
          <rect x="80" y="250" width="440" height="90" fill="#020617" fillOpacity="0.55" />
        </>
      )}
      {plate.shape === 'arch' && (
        <>
          <path d="M180 360 V190 A120 120 0 0 1 420 190 V360 Z" fill={plate.accent} fillOpacity="0.88" />
          <rect x="245" y="210" width="110" height="150" fill={plate.bgFrom} fillOpacity="0.8" />
        </>
      )}
      {plate.shape === 'prism' && (
        <>
          <polygon points="300,55 490,340 110,340" fill={plate.accent} fillOpacity="0.35" />
          <polygon points="300,115 430,340 170,340" fill={plate.accent} fillOpacity="0.72" />
        </>
      )}
      {plate.shape === 'bars' && (
        <>
          <rect x="130" y="70" width="76" height="260" fill={plate.accent} fillOpacity="0.9" />
          <rect x="242" y="115" width="76" height="215" fill={plate.accent} fillOpacity="0.6" />
          <rect x="354" y="160" width="116" height="170" fill={plate.accent} fillOpacity="0.35" />
        </>
      )}
    </svg>
  );
}

export function Img4() {
  const [featuredIdx, setFeaturedIdx] = useState(0);
  const featured = GALLERY_PLATES[featuredIdx];

  return (
    <figure className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4 md:grid-rows-3">
        {/* Featured primary frame */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-stone-900 md:col-span-3 md:row-span-3 md:aspect-auto md:min-h-[320px]">
          <GalleryArtwork plate={featured} />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 text-white">
            <p className="font-mono text-xs text-stone-300">{featured.meta}</p>
            <p className="font-serif text-xl text-white">{featured.title}</p>
          </div>
        </div>

        {/* Side selector plates */}
        {GALLERY_PLATES.map((plate, idx) => {
          if (idx === featuredIdx) {
            return (
              <div
                key={plate.id}
                className="hidden items-center justify-center rounded-lg border border-dashed border-stone-300 bg-stone-50 p-3 text-center md:flex"
              >
                <span className="font-mono text-xs text-stone-500">
                  Featured · {plate.title}
                </span>
              </div>
            );
          }
          return (
            <button
              key={plate.id}
              type="button"
              onClick={() => setFeaturedIdx(idx)}
              aria-label={`Set ${plate.title} as featured gallery item`}
              className="group relative aspect-[16/10] overflow-hidden rounded-lg border border-stone-200 text-left transition-transform duration-150 hover:scale-[1.01] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 md:aspect-auto"
            >
              <GalleryArtwork plate={plate} />
              <span className="absolute inset-x-0 bottom-0 bg-black/65 px-2.5 py-1.5 text-xs font-medium text-white">
                {plate.title}
              </span>
            </button>
          );
        })}
      </div>

      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600">
        <span>
          Plate 04 · Featured Gallery Grid — Select any secondary frame to promote it
        </span>
        <span className="font-mono tabular-nums text-stone-800">
          Active: {featured.title}
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * Img5: Image Carousel with Dots + Arrows (Functional via useState)
 */
const CAROUSEL_SLIDES = [
  {
    id: 'c1',
    title: 'Cobalt Horizon',
    subtitle: 'Gradient & geometric wave composition',
    from: '#1e3a8a',
    to: '#0ea5e9',
    accent: '#fef08a',
  },
  {
    id: 'c2',
    title: 'Amber Meridian',
    subtitle: 'Architectural solar arc study',
    from: '#78350f',
    to: '#d97706',
    accent: '#fef3c7',
  },
  {
    id: 'c3',
    title: 'Charcoal Atrium',
    subtitle: 'Minimalist structural skylight study',
    from: '#18181b',
    to: '#52525b',
    accent: '#60a5fa',
  },
  {
    id: 'c4',
    title: 'Verdant Pavilion',
    subtitle: 'Botanical glasshouse elevation',
    from: '#064e3b',
    to: '#10b981',
    accent: '#ecfdf5',
  },
];

export function Img5() {
  const [index, setIndex] = useState(0);
  const total = CAROUSEL_SLIDES.length;
  const current = CAROUSEL_SLIDES[index];

  return (
    <figure className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="relative overflow-hidden rounded-lg bg-stone-900">
        <div
          className="flex transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translate3d(-${index * 100}%, 0, 0)` }}
        >
          {CAROUSEL_SLIDES.map((slide, idx) => (
            <div key={slide.id} className="w-full shrink-0">
              <div className="relative aspect-[16/9] w-full">
                <svg
                  viewBox="0 0 800 450"
                  className="h-full w-full object-cover"
                  role="img"
                  aria-label={`${slide.title} — ${slide.subtitle}`}
                >
                  <defs>
                    <linearGradient id={`car-${slide.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor={slide.from} />
                      <stop offset="100%" stopColor={slide.to} />
                    </linearGradient>
                  </defs>
                  <rect width="800" height="450" fill={`url(#car-${slide.id})`} />
                  <circle
                    cx={210 + idx * 120}
                    cy={190}
                    r={92}
                    fill={slide.accent}
                    fillOpacity="0.88"
                  />
                  <rect
                    x={90}
                    y={280}
                    width={620}
                    height={110}
                    fill="#09090b"
                    fillOpacity="0.32"
                  />
                  <line
                    x1="90"
                    y1="280"
                    x2="710"
                    y2="280"
                    stroke={slide.accent}
                    strokeOpacity="0.7"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Arrow controls */}
        <button
          type="button"
          onClick={() => setIndex((c) => stepCarouselIndex(c, -1, total))}
          aria-label="Previous carousel slide"
          className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow-md transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => setIndex((c) => stepCarouselIndex(c, 1, total))}
          aria-label="Next carousel slide"
          className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-stone-900 shadow-md transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Bottom dot navigation */}
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2">
          {CAROUSEL_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setIndex(idx)}
              aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
              aria-current={idx === index ? 'true' : 'false'}
              className={`h-2.5 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
                idx === index ? 'w-7 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>

      <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-xs text-stone-500">
            Plate 05 · Carousel · {current.subtitle}
          </span>
          <p className="font-serif text-base text-stone-900">{current.title}</p>
        </div>
        <span className="font-mono text-xs font-medium tabular-nums text-stone-700">
          {formatSlideCounter(index, total)}
        </span>
      </figcaption>
    </figure>
  );
}
