import { useEffect, useState } from 'react';
import {
  Bookmark,
  CheckCircle2,
  Hand,
  Headphones,
  Pause,
  Play,
  Radio,
  RotateCcw,
  RotateCw,
  Users,
} from 'lucide-react';
import {
  advanceTime,
  clampTime,
  formatTimecode,
  getProgressPercent,
  nextPlaybackSpeed,
} from '../../utils/media';

/* -------------------------------------------------------------------------- */
/* Vid6: Audio Player UI (progress bar, skip controls)                        */
/* -------------------------------------------------------------------------- */
export function Vid6() {
  const duration = 342;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(64);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setCurrentTime((prev) => {
        const { nextTime, ended } = advanceTime(prev, duration, 0.5, speed, false);
        if (ended) setIsPlaying(false);
        return nextTime;
      });
    }, 500);
    return () => window.clearInterval(timer);
  }, [isPlaying, speed]);

  return (
    <article className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between gap-5">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-lg bg-slate-950 overflow-hidden shrink-0">
          <svg viewBox="0 0 64 64" className="w-full h-full" aria-hidden="true">
            <rect width="64" height="64" fill="#0F172A" />
            <circle cx="32" cy="32" r="20" fill="#E11D48" fillOpacity="0.28" stroke="#FB7185" strokeWidth="1.5" />
            <circle cx="32" cy="32" r="6" fill="#F8FAFC" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Studio Field Recording</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">48 kHz</span>
          </div>
          <h3 className="text-base font-semibold text-slate-900 truncate">
            Spatial Acoustics in Timber Halls
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Track 04 · Binaural Impulse Capture
          </p>
        </div>
        {/* Equalizer indicator */}
        <div className="flex items-end gap-1 h-6 shrink-0" aria-hidden="true">
          {[0, 120, 240, 80].map((delay, idx) => (
            <span
              key={idx}
              className={`w-1 rounded-full bg-[#E11D48] transition-all ${
                isPlaying ? 'h-5 animate-eq' : 'h-1.5 bg-slate-300'
              }`}
              style={isPlaying ? { animationDelay: `${delay}ms` } : undefined}
            />
          ))}
        </div>
      </div>

      {/* Scrub Progress Bar */}
      <div className="flex flex-col gap-2">
        <input
          type="range"
          min={0}
          max={duration}
          value={Math.floor(currentTime)}
          aria-label="Seek Audio Player timeline"
          onChange={(e) => setCurrentTime(clampTime(Number(e.target.value), duration))}
          className="w-full accent-[#E11D48] cursor-pointer h-1.5"
        />
        <div className="flex items-center justify-between text-xs font-mono tabular-nums text-slate-500">
          <span>{formatTimecode(currentTime)}</span>
          <span>-{formatTimecode(duration - currentTime)}</span>
        </div>
      </div>

      {/* Skip & Transport Controls */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={() => setSpeed((s) => nextPlaybackSpeed(s))}
          aria-label="Change audio playback speed"
          className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono tabular-nums font-semibold text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
        >
          {speed}x
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentTime((t) => clampTime(t - 15, duration))}
            aria-label="Skip back 15 seconds"
            className="w-10 h-10 rounded-lg border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={isPlaying ? 'Pause Audio Player' : 'Play Audio Player'}
            className="w-11 h-11 rounded-full bg-slate-950 text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
          <button
            type="button"
            onClick={() => setCurrentTime((t) => clampTime(t + 30, duration))}
            aria-label="Skip forward 30 seconds"
            className="w-10 h-10 rounded-lg border border-slate-200 text-slate-700 flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
          {isPlaying ? 'Playing' : 'Paused'}
        </span>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Vid7: Podcast Embed Card                                                   */
/* -------------------------------------------------------------------------- */
const WAVEFORM_HEIGHTS = [
  18, 32, 24, 42, 36, 20, 48, 38, 28, 44, 22, 34, 46, 30, 18, 40,
  36, 26, 48, 32, 24, 38, 44, 28, 20, 34, 42, 30, 22, 36, 28, 16,
];

export function Vid7() {
  const duration = 1860; // 31:00
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(412);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setCurrentTime((prev) => {
        const { nextTime, ended } = advanceTime(prev, duration, 1, 1, false);
        if (ended) setIsPlaying(false);
        return nextTime;
      });
    }, 500);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const pct = getProgressPercent(currentTime, duration);

  return (
    <article className="bg-[#0F172A] text-white border border-slate-800 rounded-xl p-5 shadow-xs flex flex-col justify-between gap-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-14 h-14 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center">
            <Headphones className="w-6 h-6 text-[#FB7185]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Signal & Craft Podcast</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">Ep. 42</span>
            </div>
            <h3 className="text-base font-semibold text-white truncate">
              Designing Audio Hardware for Field Producers
            </h3>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSaved((s) => !s)}
          aria-label={saved ? 'Remove podcast bookmark' : 'Bookmark podcast episode'}
          className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
            saved
              ? 'bg-[#E11D48] border-[#E11D48] text-white'
              : 'border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Interactive Waveform Bar Scrub */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => setIsPlaying((p) => !p)}
          aria-label={isPlaying ? 'Pause Podcast Episode' : 'Play Podcast Episode'}
          className="w-11 h-11 rounded-full bg-white text-slate-950 flex items-center justify-center hover:bg-slate-100 transition-colors shrink-0"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        <div className="flex-1 flex items-center gap-1 h-12" role="group" aria-label="Podcast waveform scrubber">
          {WAVEFORM_HEIGHTS.map((h, i) => {
            const barPct = ((i + 1) / WAVEFORM_HEIGHTS.length) * 100;
            const active = barPct <= pct;
            return (
              <button
                key={i}
                type="button"
                aria-label={`Jump podcast to ${Math.round(barPct)}%`}
                onClick={() => setCurrentTime(Math.round((i / WAVEFORM_HEIGHTS.length) * duration))}
                className="flex-1 h-full flex items-center justify-center group"
              >
                <span
                  className={`w-full rounded-full transition-colors ${
                    active ? 'bg-[#FB7185]' : 'bg-slate-700 group-hover:bg-slate-500'
                  }`}
                  style={{ height: `${h}px` }}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-mono tabular-nums text-slate-400 border-t border-slate-800 pt-3">
        <span>{isPlaying ? 'Playing' : 'Paused'} · {formatTimecode(currentTime)}</span>
        <span>Total {formatTimecode(duration)}</span>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Vid8: Webinar / Live Badge Player                                          */
/* -------------------------------------------------------------------------- */
export function Vid8() {
  const [isStreaming, setIsStreaming] = useState(true);
  const [quality, setQuality] = useState<'1080p' | '720p'>('1080p');
  const [handRaised, setHandRaised] = useState(false);
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    if (!isStreaming) return undefined;
    const timer = window.setInterval(() => {
      setTicks((t) => t + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isStreaming]);

  const viewers = 428 + (ticks % 7);

  return (
    <article className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12">
      <div className="lg:col-span-8 relative aspect-video lg:aspect-auto lg:min-h-[300px] bg-slate-950 overflow-hidden">
        <svg viewBox="0 0 600 338" className="w-full h-full object-cover" aria-hidden="true">
          <defs>
            <linearGradient id="vid8-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
          </defs>
          <rect width="600" height="338" fill="url(#vid8-bg)" />
          {/* Presenter slide + speaker frame */}
          <rect x="28" y="42" width="380" height="220" rx="6" fill="#0B1120" stroke="#334155" />
          <path d="M58 210 L132 142 L212 178 L314 96 L380 138" fill="none" stroke="#38BDF8" strokeWidth="3" />
          <rect x="424" y="42" width="148" height="128" rx="6" fill="#1E293B" stroke="#475569" />
          <circle cx="498" cy="96" r="24" fill="#94A3B8" fillOpacity="0.35" />
          <path d="M460 158 C460 132, 536 132, 536 158 Z" fill="#94A3B8" fillOpacity="0.25" />
          {isStreaming && (
            <rect x={60 + ((ticks * 18) % 280)} y="70" width="44" height="6" rx="3" fill="#E11D48" />
          )}
        </svg>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/35 pointer-events-none" />

        {/* Live Status & Viewer Count */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono font-semibold tracking-wide ${
              isStreaming ? 'bg-[#E11D48] text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            <Radio className="w-3 h-3" />
            <span>{isStreaming ? 'LIVE' : 'PAUSED'}</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-black/70 text-white text-xs font-mono tabular-nums">
            <Users className="w-3 h-3" />
            <span>{viewers}</span>
          </span>
        </div>

        {/* Quality Switcher */}
        <button
          type="button"
          onClick={() => setQuality((q) => (q === '1080p' ? '720p' : '1080p'))}
          aria-label="Toggle webinar stream quality"
          className="absolute top-3 right-3 px-2.5 py-1 rounded bg-black/70 text-white text-xs font-mono hover:bg-black/90 transition-colors"
        >
          {quality}
        </button>

        {/* Bottom Stream Controls */}
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsStreaming((s) => !s)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white text-slate-950 text-xs font-semibold hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isStreaming ? 'Pause Feed' : 'Resume Live'}</span>
          </button>

          <button
            type="button"
            onClick={() => setHandRaised((h) => !h)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              handRaised
                ? 'bg-[#E11D48] text-white'
                : 'bg-black/70 text-white hover:bg-black/90'
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            <span>{handRaised ? 'Hand Raised' : 'Raise Hand'}</span>
          </button>
        </div>
      </div>

      <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200 p-5 flex flex-col justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Engineering Town Hall</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">Session {formatTimecode(ticks)}</span>
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            Low-Latency WebRTC Broadcast Architecture
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Sub-second edge fan-out with automatic ABR resolution switching and audience hand-raise signaling.
          </p>
        </div>

        <div className="border-t border-slate-100 pt-3 flex flex-col gap-2 text-xs">
          <p className="font-semibold text-slate-900">Live Agenda</p>
          <div className="flex items-center justify-between text-slate-600">
            <span>01. SFU Edge Routing</span>
            <span className="font-mono tabular-nums text-slate-400">Live now</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>02. Simulcast Layering</span>
            <span className="font-mono tabular-nums text-slate-400">+12:00</span>
          </div>
          <div className="flex items-center justify-between text-slate-600">
            <span>03. Audience Q&amp;A</span>
            <span className="font-mono tabular-nums text-slate-400">{handRaised ? 'Queued' : '+24:00'}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Vid9: Video Background Hero Block (gradient/SVG stand-in frame + play CTA) */
/* -------------------------------------------------------------------------- */
export function Vid9() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setPhase((p) => (p + 1) % 360);
    }, 120);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  return (
    <section className="relative rounded-xl overflow-hidden bg-slate-950 text-white border border-slate-800 min-h-[300px] flex items-center">
      {/* Animated Ambient SVG Backdrop */}
      <svg
        viewBox="0 0 1200 420"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="vid9-sky" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#090D16" />
            <stop offset="50%" stopColor="#1E1B3A" />
            <stop offset="100%" stopColor="#2B0E24" />
          </linearGradient>
        </defs>
        <rect width="1200" height="420" fill="url(#vid9-sky)" />
        <g transform={`translate(${Math.sin((phase * Math.PI) / 180) * 28}, ${Math.cos((phase * Math.PI) / 180) * 14})`}>
          <circle cx="880" cy="180" r="190" fill="#E11D48" fillOpacity="0.22" />
          <circle cx="710" cy="260" r="140" fill="#2563EB" fillOpacity="0.18" />
        </g>
        <path
          d="M0 320 Q300 250 600 310 T1200 280 L1200 420 L0 420 Z"
          fill="#0F172A"
          fillOpacity="0.72"
        />
      </svg>

      {/* Measured Contrast Scrim */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/75 to-slate-950/35 pointer-events-none" />

      <div className="relative z-10 w-full p-6 sm:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-xl flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span>Showreel 2026</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{isPlaying ? 'Backdrop Active' : 'Backdrop Paused'}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Spatial sound and motion systems built for modern broadcast teams
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Ambient SVG hero canvas with controllable playback state so motion-sensitive viewers can pause background movement on demand.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-slate-950 text-xs font-semibold hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'Pause Reel' : 'Play Reel'}</span>
          </button>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Vid10: Tutorial Steps with Video Thumbnails                                */
/* -------------------------------------------------------------------------- */
const TUTORIAL_STEPS = [
  {
    id: 'step1',
    title: '01. Import camera source LUTs',
    detail: 'Drop .cube or .3dl profiles onto the ingest bin.',
    duration: 48,
    color: '#E11D48',
  },
  {
    id: 'step2',
    title: '02. Sync dual-system audio stems',
    detail: 'Align field WAV timecode across four camera angles.',
    duration: 74,
    color: '#2563EB',
  },
  {
    id: 'step3',
    title: '03. Export frame-accurate review link',
    detail: 'Publish watermarked H.265 proxies with chapter notes.',
    duration: 62,
    color: '#059669',
  },
] as const;

export function Vid10() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const activeStep = TUTORIAL_STEPS[activeIndex];

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setCurrentTime((prev) => {
        const { nextTime, ended } = advanceTime(prev, activeStep.duration, 0.5, 1, false);
        if (ended) setIsPlaying(false);
        return nextTime;
      });
    }, 500);
    return () => window.clearInterval(timer);
  }, [isPlaying, activeStep.duration]);

  const selectStep = (index: number) => {
    setActiveIndex(index);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">Interactive Walkthrough · 3 Steps</p>
          <h3 className="text-lg font-semibold text-slate-900">
            Color-Managed Dailies Workflow
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setIsPlaying((p) => !p)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-950 text-white text-xs font-semibold hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          <span>{isPlaying ? 'Pause Step' : 'Play Active Step'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TUTORIAL_STEPS.map((step, idx) => {
          const isActive = idx === activeIndex;
          const pct = isActive ? getProgressPercent(currentTime, step.duration) : 0;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => selectStep(idx)}
              className={`text-left rounded-xl border overflow-hidden transition-colors flex flex-col ${
                isActive
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="relative aspect-video w-full bg-slate-950 overflow-hidden">
                <svg viewBox="0 0 320 180" className="w-full h-full" aria-hidden="true">
                  <rect width="320" height="180" fill="#0F172A" />
                  <circle cx={80 + idx * 75} cy="90" r="56" fill={step.color} fillOpacity="0.28" />
                  <rect x="36" y="42" width="248" height="96" rx="6" fill="none" stroke="#475569" strokeWidth="1.5" />
                  <path d="M56 112 L120 76 L194 104 L262 64" fill="none" stroke={step.color} strokeWidth="2.5" />
                </svg>
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/75 text-white text-[11px] font-mono tabular-nums">
                  {isActive ? formatTimecode(currentTime) : formatTimecode(step.duration)}
                </div>
                <div className="absolute bottom-2.5 left-2.5 w-8 h-8 rounded-full bg-white text-slate-950 flex items-center justify-center shadow">
                  {isActive && isPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-current" />
                  ) : isActive ? (
                    <CheckCircle2 className="w-4 h-4 text-[#E11D48]" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  )}
                </div>
              </div>
              <div className="h-1 w-full bg-slate-200">
                <div
                  className="h-full bg-[#E11D48] transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="p-4 flex flex-col gap-1">
                <span className="text-sm font-semibold text-slate-900">{step.title}</span>
                <span className="text-xs text-slate-600 leading-relaxed">{step.detail}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
