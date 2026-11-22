import React, { useEffect, useState } from 'react';
import type { ModalProps } from './ModalGroup1';

/* ============================================================================
 * Modal6: Image Lightbox · Centered Large · Dark
 * ============================================================================ */
export function Modal6({ defaultOpen = false, open, onOpenChange, onActionComplete }: ModalProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const slides = [
    {
      id: 'solstice',
      title: 'Solstice Pavilion Study',
      caption: 'Elevation 01 · Monolithic concrete and diffused zenith skylight',
      palette: 'from-slate-900 via-indigo-950 to-sky-900',
    },
    {
      id: 'meridian',
      title: 'Meridian Acoustic Chamber',
      caption: 'Elevation 02 · Ribbed cedar baffles calibrated for 0.8s reverberation',
      palette: 'from-zinc-900 via-amber-950 to-stone-900',
    },
    {
      id: 'cantilever',
      title: 'North Pier Cantilever',
      caption: 'Elevation 03 · 18-meter weathering steel span at low tide',
      palette: 'from-slate-950 via-teal-950 to-emerald-950',
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  const close = () => {
    if (!isControlled) setInternalOpen(false);
    onOpenChange?.(false);
    setZoomed(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') setActiveIndex((i) => (i + 1) % slides.length);
      if (e.key === 'ArrowLeft') setActiveIndex((i) => (i - 1 + slides.length) % slides.length);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const current = slides[activeIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal6-title"
        className="w-full max-w-4xl rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden text-zinc-100"
      >
        <div className="flex items-center justify-between gap-4 border-b border-zinc-800 px-5 py-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <h2 id="modal6-title" className="text-sm font-semibold text-white truncate">
              {current.title}
            </h2>
            <span className="text-xs font-mono text-zinc-400 tabular-nums shrink-0">
              {activeIndex + 1} / {slides.length}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setZoomed((z) => !z)}
              aria-pressed={zoomed}
              className="px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-900 border border-zinc-700 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              {zoomed ? 'Reset zoom' : 'Zoom 1.25x'}
            </button>
            <button
              type="button"
              onClick={() => onActionComplete?.(`Downloaded vector plate "${current.title}".`)}
              className="px-3 py-1.5 text-xs font-medium text-zinc-950 bg-white rounded-lg hover:bg-zinc-200 transition-colors"
            >
              Export SVG
            </button>
            <button
              type="button"
              onClick={close}
              aria-label="Close lightbox dialog"
              className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden bg-zinc-900 aspect-[16/9] flex items-center justify-center">
          <div
            className={`h-full w-full bg-gradient-to-br ${current.palette} flex items-center justify-center transition-transform duration-200 ${
              zoomed ? 'scale-125' : 'scale-100'
            }`}
          >
            {activeIndex === 0 && (
              <svg viewBox="0 0 640 360" className="w-4/5 h-4/5" aria-hidden="true">
                <defs>
                  <linearGradient id="m6g1" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#312E81" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
                <rect x="60" y="230" width="520" height="70" fill="#0F172A" opacity="0.85" />
                <polygon points="120,230 320,70 520,230" fill="url(#m6g1)" />
                <circle cx="320" cy="140" r="34" fill="#E0F2FE" opacity="0.85" />
                <line x1="60" y1="230" x2="580" y2="230" stroke="#93C5FD" strokeOpacity="0.5" strokeWidth="1.5" />
              </svg>
            )}
            {activeIndex === 1 && (
              <svg viewBox="0 0 640 360" className="w-4/5 h-4/5" aria-hidden="true">
                {Array.from({ length: 11 }).map((_, idx) => (
                  <rect
                    key={idx}
                    x={90 + idx * 42}
                    y={70 + Math.abs(5 - idx) * 14}
                    width="22"
                    height={210 - Math.abs(5 - idx) * 28}
                    rx="4"
                    fill="#F59E0B"
                    fillOpacity={0.25 + (5 - Math.abs(5 - idx)) * 0.12}
                  />
                ))}
              </svg>
            )}
            {activeIndex === 2 && (
              <svg viewBox="0 0 640 360" className="w-4/5 h-4/5" aria-hidden="true">
                <rect x="80" y="150" width="380" height="36" fill="#2DD4BF" fillOpacity="0.8" />
                <rect x="130" y="186" width="44" height="114" fill="#0F766E" />
                <polygon points="460,150 560,168 460,186" fill="#99F6E4" fillOpacity="0.7" />
                <line x1="40" y1="300" x2="600" y2="300" stroke="#5EEAD4" strokeOpacity="0.35" strokeWidth="2" />
              </svg>
            )}
          </div>

          <button
            type="button"
            onClick={() => setActiveIndex((i) => (i - 1 + slides.length) % slides.length)}
            aria-label="Previous plate"
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2.5 text-white border border-white/15 hover:bg-black/80 transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setActiveIndex((i) => (i + 1) % slides.length)}
            aria-label="Next plate"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2.5 text-white border border-white/15 hover:bg-black/80 transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 bg-zinc-950 border-t border-zinc-800">
          <p className="text-xs text-zinc-400">{current.caption}</p>
          <div className="flex items-center gap-2">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`View ${slide.title}`}
                className={`h-8 w-12 rounded-md border bg-gradient-to-br ${slide.palette} transition-all ${
                  idx === activeIndex ? 'border-white ring-2 ring-white/30' : 'border-zinc-700 opacity-60 hover:opacity-100'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * Modal7: Video Player Modal · Centered Large · Dark
 * ============================================================================ */
export function Modal7({ defaultOpen = false, open, onOpenChange }: ModalProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(28);
  const durationSeconds = 180;

  const close = () => {
    if (!isControlled) setInternalOpen(false);
    onOpenChange?.(false);
    setPlaying(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !playing) return;
    const timer = window.setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 350);
    return () => window.clearInterval(timer);
  }, [isOpen, playing]);

  if (!isOpen) return null;

  const currentSec = Math.round((progress / 100) * durationSeconds);
  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal7-title"
        className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100"
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
          <div>
            <h2 id="modal7-title" className="text-base font-semibold text-white">
              Component Architecture Walkthrough
            </h2>
            <p className="text-xs text-slate-400">Chapter 2 · Focus trapping and keyboard shortcuts</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close video player dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 flex flex-col items-center justify-center p-6">
          <svg viewBox="0 0 560 220" className="w-full max-w-lg opacity-90" aria-hidden="true">
            <rect x="20" y="20" width="520" height="180" rx="14" fill="#0F172A" stroke="#334155" />
            <rect x="44" y="46" width="160" height="12" rx="6" fill="#38BDF8" fillOpacity="0.6" />
            <rect x="44" y="72" width="260" height="10" rx="5" fill="#64748B" fillOpacity="0.5" />
            {Array.from({ length: 18 }).map((_, i) => {
              const barH = 20 + ((i * 19 + (playing ? progress : 12)) % 56);
              return (
                <rect
                  key={i}
                  x={48 + i * 26}
                  y={168 - barH}
                  width="14"
                  height={barH}
                  rx="4"
                  fill={i / 18 <= progress / 100 ? '#38BDF8' : '#334155'}
                />
              );
            })}
          </svg>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pause walkthrough video' : 'Play walkthrough video'}
            className="mt-2 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-950 shadow-lg hover:scale-105 transition-transform"
          >
            {playing ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg className="h-5 w-5 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>

        <div className="px-5 py-4 bg-slate-950/90 space-y-3">
          <div className="flex items-center gap-3">
            <label htmlFor="modal7-scrub" className="sr-only">
              Video timeline position
            </label>
            <input
              id="modal7-scrub"
              type="range"
              min={0}
              max={100}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-sky-400 cursor-pointer"
            />
            <span className="text-xs font-mono text-slate-400 tabular-nums shrink-0">
              {formatTime(currentSec)} / {formatTime(durationSeconds)}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-800 text-white rounded-md hover:bg-slate-700 transition-colors"
              >
                {playing ? 'Pause' : 'Play'}
              </button>
              <button
                type="button"
                onClick={() => setMuted((m) => !m)}
                aria-pressed={muted}
                className="px-3 py-1.5 text-xs font-medium bg-slate-800 text-slate-200 rounded-md hover:bg-slate-700 transition-colors"
              >
                {muted ? 'Unmute' : 'Mute'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              {[
                { label: '0:00 Intro', pct: 0 },
                { label: '0:50 Scrims', pct: 28 },
                { label: '2:06 ARIA', pct: 70 },
              ].map((chapter) => (
                <button
                  key={chapter.label}
                  type="button"
                  onClick={() => setProgress(chapter.pct)}
                  className="px-2.5 py-1 text-xs font-mono text-slate-300 bg-slate-900 border border-slate-700 rounded hover:border-sky-400 transition-colors"
                >
                  {chapter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * Modal8: Cookie-Consent Banner Modal · Bottom-Anchored Banner · Minimal
 * ============================================================================ */
export function Modal8({ defaultOpen = false, open, onOpenChange, onActionComplete }: ModalProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const [expanded, setExpanded] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  const close = () => {
    if (!isControlled) setInternalOpen(false);
    onOpenChange?.(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const saveConsent = (mode: 'essential' | 'custom' | 'all') => {
    if (mode === 'essential') {
      onActionComplete?.('Cookie consent saved: Essential cookies only.');
    } else if (mode === 'all') {
      onActionComplete?.('Cookie consent saved: All categories enabled.');
    } else {
      onActionComplete?.(
        `Cookie consent saved: Essential + ${analytics ? 'Analytics' : 'No Analytics'} + ${
          marketing ? 'Marketing' : 'No Marketing'
        }.`,
      );
    }
    close();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:p-5 bg-slate-950/35"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal8-title"
        className="w-full max-w-4xl rounded-xl bg-white border border-slate-200 shadow-2xl p-5 text-slate-900"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="modal8-title" className="text-base font-semibold text-slate-900">
              Your privacy choices
            </h2>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              We use essential session cookies to keep your workspace signed in and optional cookies to measure feature reliability.
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Dismiss cookie banner"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {expanded && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-slate-200 pt-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">Essential</span>
                <span className="text-xs font-medium text-slate-500">Always active</span>
              </div>
              <p className="mt-1 text-xs text-slate-600">Authentication and CSRF protection.</p>
            </div>
            <label className="rounded-lg border border-slate-200 p-3 flex flex-col justify-between cursor-pointer hover:bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">Analytics</span>
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900"
                />
              </div>
              <p className="mt-1 text-xs text-slate-600">Aggregated page performance metrics.</p>
            </label>
            <label className="rounded-lg border border-slate-200 p-3 flex flex-col justify-between cursor-pointer hover:bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">Marketing</span>
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900"
                />
              </div>
              <p className="mt-1 text-xs text-slate-600">Campaign attribution and product updates.</p>
            </label>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="text-xs font-semibold text-slate-700 underline underline-offset-4 hover:text-slate-950"
          >
            {expanded ? 'Hide preferences' : 'Customize preferences'}
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => saveConsent('essential')}
              className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Essential only
            </button>
            {expanded && (
              <button
                type="button"
                onClick={() => saveConsent('custom')}
                className="px-3.5 py-2 text-xs font-medium text-slate-900 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Save choices
              </button>
            )}
            <button
              type="button"
              onClick={() => saveConsent('all')}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * Modal9: Cookie-Consent Preference Center · Bottom on Mobile · Warm Editorial
 * ============================================================================ */
export function Modal9({ defaultOpen = false, open, onOpenChange, onActionComplete }: ModalProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const [readingHistory, setReadingHistory] = useState(true);
  const [editionAlerts, setEditionAlerts] = useState(false);

  const close = () => {
    if (!isControlled) setInternalOpen(false);
    onOpenChange?.(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-stone-950/55 backdrop-blur-[2px]"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal9-title"
        className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-xl bg-[#FAF7F2] border border-[#E2D9CB] shadow-2xl p-6 text-[#1C1917]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#78716C]">Privacy Ledger</p>
            <h2 id="modal9-title" className="mt-1 font-serif text-xl font-medium text-[#1C1917]">
              How this publication handles cookies
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close privacy ledger dialog"
            className="rounded-lg p-1.5 text-[#78716C] hover:bg-[#EFE9DE] hover:text-[#1C1917] transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-4 divide-y divide-[#E5DDD0] border-y border-[#E5DDD0]">
          <div className="py-3 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#1C1917]">Subscriber Session</p>
              <p className="text-xs text-[#57534E]">Required to preserve your reading list and login state.</p>
            </div>
            <span className="text-xs font-medium text-[#1E4631] shrink-0">Required</span>
          </div>
          <label className="py-3 flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-[#1C1917]">Local Reading Bookmarks</p>
              <p className="text-xs text-[#57534E]">Remembers scroll position across long-form essays.</p>
            </div>
            <input
              type="checkbox"
              checked={readingHistory}
              onChange={(e) => setReadingHistory(e.target.checked)}
              className="h-4 w-4 rounded border-[#D6CFC2] text-[#1E4631]"
            />
          </label>
          <label className="py-3 flex items-center justify-between gap-4 cursor-pointer">
            <div>
              <p className="text-sm font-medium text-[#1C1917]">Print Edition Notices</p>
              <p className="text-xs text-[#57534E]">Highlights seasonal print anthology pre-orders.</p>
            </div>
            <input
              type="checkbox"
              checked={editionAlerts}
              onChange={(e) => setEditionAlerts(e.target.checked)}
              className="h-4 w-4 rounded border-[#D6CFC2] text-[#1E4631]"
            />
          </label>
        </div>

        <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
          <button
            type="button"
            onClick={() => {
              onActionComplete?.('Editorial privacy ledger: Required cookies only.');
              close();
            }}
            className="px-4 py-2.5 text-sm font-medium text-[#44403C] bg-[#EFE9DE] rounded-lg hover:bg-[#E5DDD0] transition-colors"
          >
            Decline optional
          </button>
          <button
            type="button"
            onClick={() => {
              onActionComplete?.(
                `Editorial privacy ledger saved (Bookmarks: ${readingHistory ? 'On' : 'Off'}, Notices: ${
                  editionAlerts ? 'On' : 'Off'
                }).`,
              );
              close();
            }}
            className="px-5 py-2.5 text-sm font-medium text-[#FAF7F2] bg-[#1E4631] rounded-lg hover:bg-[#163525] transition-colors"
          >
            Confirm choices
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * Modal10: Promo / Announcement Modal · Centered Medium · Bold / Colourful
 * ============================================================================ */
export function Modal10({ defaultOpen = false, open, onOpenChange, onActionComplete }: ModalProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const [copied, setCopied] = useState(false);

  const close = () => {
    if (!isControlled) setInternalOpen(false);
    onOpenChange?.(false);
    setCopied(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText('AUTUMN30').catch(() => {});
    setCopied(true);
    onActionComplete?.('Promo code AUTUMN30 copied to clipboard.');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal10-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-orange-100 text-slate-900"
      >
        <div className="relative h-40 bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 p-6 text-white flex flex-col justify-between overflow-hidden">
          <svg
            viewBox="0 0 320 160"
            className="absolute right-0 top-0 h-full w-48 opacity-30 pointer-events-none"
            aria-hidden="true"
          >
            <circle cx="240" cy="40" r="70" fill="#FEF3C7" />
            <circle cx="170" cy="130" r="46" fill="#FDE68A" />
            <rect x="200" y="90" width="80" height="80" rx="16" transform="rotate(20 200 90)" fill="#FFF" />
          </svg>
          <div className="relative flex items-center justify-between">
            <span className="text-xs font-semibold tracking-wide text-amber-100">
              Limited studio release
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close announcement dialog"
              className="rounded-lg p-1.5 text-white/85 hover:bg-white/20 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <h2 id="modal10-title" className="relative text-2xl font-bold tracking-tight">
            Save 30% on annual design kits
          </h2>
        </div>

        <div className="p-6">
          <p className="text-sm leading-relaxed text-slate-600">
            Unlock our complete vector icon library, interactive motion presets, and multi-brand tokens through November 30.
          </p>

          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
            <div>
              <span className="block text-xs text-orange-800">Offer code</span>
              <span className="font-mono text-base font-bold tracking-wide text-orange-950">AUTUMN30</span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 text-xs font-semibold text-orange-900 bg-white border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
            >
              {copied ? 'Copied' : 'Copy code'}
            </button>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={close}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Maybe later
            </button>
            <button
              type="button"
              onClick={() => {
                onActionComplete?.('Applied AUTUMN30 discount to annual studio plan.');
                close();
              }}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-rose-600 rounded-lg hover:brightness-105 transition-all"
            >
              Claim 30% discount
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
