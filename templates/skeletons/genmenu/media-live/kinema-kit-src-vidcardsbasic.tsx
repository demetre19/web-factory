import { useEffect, useState } from 'react';
import {
  Check,
  ChevronRight,
  ListVideo,
  Pause,
  Play,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { advanceTime, clampTime, formatTimecode, getProgressPercent } from '../../utils/media';

/* -------------------------------------------------------------------------- */
/* Vid1: Video Player Card (play button overlay, duration badge)              */
/* -------------------------------------------------------------------------- */
export function Vid1() {
  const duration = 258; // 04:18
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setCurrentTime((prev) => {
        const { nextTime, ended } = advanceTime(prev, duration, 0.5, 1, false);
        if (ended) setIsPlaying(false);
        return nextTime;
      });
    }, 500);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const progress = getProgressPercent(currentTime, duration);

  return (
    <article className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
      <div className="relative aspect-video bg-slate-950 overflow-hidden group">
        {/* Custom Architectural Studio SVG Frame */}
        <svg
          viewBox="0 0 640 360"
          className="w-full h-full object-cover"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="vid1-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="55%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#31102F" />
            </linearGradient>
            <radialGradient id="vid1-glow" cx="68%" cy="34%" r="48%">
              <stop offset="0%" stopColor="#E11D48" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#E11D48" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="640" height="360" fill="url(#vid1-bg)" />
          <rect width="640" height="360" fill="url(#vid1-glow)" />
          <g stroke="#FFFFFF" strokeOpacity="0.09" strokeWidth="1">
            <line x1="80" y1="0" x2="80" y2="360" />
            <line x1="213" y1="0" x2="213" y2="360" />
            <line x1="426" y1="0" x2="426" y2="360" />
            <line x1="0" y1="120" x2="640" y2="120" />
            <line x1="0" y1="240" x2="640" y2="240" />
          </g>
          <g
            transform={`translate(${isPlaying ? (currentTime * 3) % 24 : 0}, 0)`}
            className="transition-transform duration-500"
          >
            <polygon points="150,280 290,110 430,280" fill="#F8FAFC" fillOpacity="0.07" />
            <circle cx="436" cy="126" r="46" fill="#E11D48" fillOpacity="0.22" stroke="#FDA4AF" strokeOpacity="0.5" />
            <rect x="112" y="196" width="164" height="84" rx="4" fill="#0F172A" fillOpacity="0.65" stroke="#94A3B8" strokeOpacity="0.35" />
            <path d="M132 248 L174 220 L216 244 L256 210" fill="none" stroke="#FB7185" strokeWidth="2.5" />
          </g>
        </svg>

        {/* Bottom Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />

        {/* Duration / Timecode Overlay */}
        <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/75 text-white text-xs font-mono tabular-nums tracking-tight">
          {isPlaying ? `${formatTimecode(currentTime)} / ${formatTimecode(duration)}` : formatTimecode(duration)}
        </div>

        {/* Centered Play / Pause Button Overlay */}
        <button
          type="button"
          onClick={() => setIsPlaying((p) => !p)}
          aria-label={isPlaying ? 'Pause Video Player Card' : 'Play Video Player Card'}
          className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-lg transition-transform duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
        </button>

        {/* Bottom Interactive Controls */}
        <div className="absolute inset-x-0 bottom-0 p-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMuted((m) => !m)}
            aria-label={isMuted ? 'Unmute Video Player Card' : 'Mute Video Player Card'}
            className="w-9 h-9 rounded-lg bg-black/55 text-white flex items-center justify-center hover:bg-black/80 transition-colors shrink-0"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={duration}
            value={Math.floor(currentTime)}
            aria-label="Seek Video Player Card timeline"
            onChange={(e) => setCurrentTime(clampTime(Number(e.target.value), duration))}
            className="w-full accent-[#E11D48] cursor-pointer h-1.5"
          />
          <span className="text-[11px] font-mono tabular-nums text-white/90 whitespace-nowrap shrink-0">
            {isPlaying ? 'Playing' : 'Paused'}
          </span>
        </div>
      </div>

      {/* Progress Hairline */}
      <div className="h-1 w-full bg-slate-100">
        <div
          className="h-full bg-[#E11D48] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-5 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Cinematography</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">4K Master</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{formatTimecode(duration)}</span>
        </div>
        <h3 className="text-base font-semibold text-slate-900">
          Anamorphic Lens Calibration Walkthrough
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Studio guide covering focus breathing tests, matte-box alignment, and exposure Latitude charts.
        </p>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Vid2: Video Modal Trigger                                                  */
/* -------------------------------------------------------------------------- */
export function Vid2() {
  const duration = 184;
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setCurrentTime((prev) => {
        const { nextTime, ended } = advanceTime(prev, duration, 0.5, 1, false);
        if (ended) setIsPlaying(false);
        return nextTime;
      });
    }, 500);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        setIsPlaying(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  const openModal = () => {
    setIsOpen(true);
    setIsPlaying(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setIsPlaying(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between gap-5">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Product Film</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{formatTimecode(duration)}</span>
        </div>
        <h3 className="text-base font-semibold text-slate-900">
          Modal Lightbox Video Launcher
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          Compact card trigger that opens a distraction-free theater modal with Escape-key dismissal and live timeline scrubbing.
        </p>
      </div>

      {/* Preview Thumbnail Trigger */}
      <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-slate-900 border border-slate-200">
        <svg viewBox="0 0 480 270" className="w-full h-full object-cover" aria-hidden="true">
          <defs>
            <linearGradient id="vid2-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#18181B" />
              <stop offset="100%" stopColor="#27272A" />
            </linearGradient>
          </defs>
          <rect width="480" height="270" fill="url(#vid2-grad)" />
          <circle cx="140" cy="135" r="72" fill="#E11D48" fillOpacity="0.2" />
          <rect x="210" y="68" width="210" height="134" rx="8" fill="#09090B" stroke="#3F3F46" />
          <path d="M235 162 L285 114 L330 144 L390 96" stroke="#F43F5E" strokeWidth="3" fill="none" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-x-4 bottom-3 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={openModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-950 text-xs font-semibold hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Open Video Modal</span>
          </button>
          <span className="text-xs font-mono tabular-nums text-white/90">
            {isPlaying ? 'Playing in modal' : formatTimecode(duration)}
          </span>
        </div>
      </div>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Modal Lightbox Video Player"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
        >
          <div className="w-full max-w-3xl bg-[#0D1117] border border-slate-800 rounded-xl overflow-hidden shadow-2xl text-white">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-semibold">Hardware Assembly Keynote</span>
                <span className="text-xs text-slate-400 font-mono tabular-nums">
                  {formatTimecode(currentTime)} / {formatTimecode(duration)}
                </span>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close Video Modal"
                className="w-9 h-9 rounded-lg bg-slate-800 text-slate-200 flex items-center justify-center hover:bg-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-video bg-black">
              <svg viewBox="0 0 800 450" className="w-full h-full" aria-hidden="true">
                <defs>
                  <linearGradient id="vid2-modal-bg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#090D16" />
                    <stop offset="100%" stopColor="#1E1B2E" />
                  </linearGradient>
                </defs>
                <rect width="800" height="450" fill="url(#vid2-modal-bg)" />
                <g opacity={isPlaying ? 0.95 : 0.65}>
                  <circle cx={260 + ((currentTime * 12) % 280)} cy="225" r="96" fill="#E11D48" fillOpacity="0.22" />
                  <rect x="140" y="105" width="520" height="240" rx="10" fill="none" stroke="#475569" strokeWidth="1.5" />
                  <path
                    d="M180 280 C280 170, 400 320, 620 165"
                    fill="none"
                    stroke="#FB7185"
                    strokeWidth="3.5"
                  />
                </g>
              </svg>

              <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  aria-label={isPlaying ? 'Pause modal video' : 'Play modal video'}
                  className="w-10 h-10 rounded-lg bg-[#E11D48] text-white flex items-center justify-center hover:bg-[#BE123C] transition-colors shrink-0"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={duration}
                  value={Math.floor(currentTime)}
                  aria-label="Modal video timeline"
                  onChange={(e) => setCurrentTime(clampTime(Number(e.target.value), duration))}
                  className="w-full accent-[#E11D48] cursor-pointer"
                />
                <span className="text-xs font-mono tabular-nums text-slate-300 whitespace-nowrap shrink-0">
                  {isPlaying ? 'Playing' : 'Paused'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Vid3: Video in Split Section (player + copy)                               */
/* -------------------------------------------------------------------------- */
export function Vid3() {
  const duration = 210;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(24);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setCurrentTime((prev) => {
        const { nextTime, ended } = advanceTime(prev, duration, 0.5, 1, false);
        if (ended) setIsPlaying(false);
        return nextTime;
      });
    }, 500);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  return (
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12 items-stretch">
      <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Architecture Briefing</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{formatTimecode(duration)}</span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">
            Zero-latency frame ingestion for distributed editing teams
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Proxy streams transcode in parallel as raw camera cards upload, letting colorists review frame-accurate timelines within seconds.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-950 text-white text-xs font-semibold hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause Overview' : 'Watch Overview'}</span>
          </button>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {formatTimecode(currentTime)} / {formatTimecode(duration)}
          </span>
        </div>
      </div>

      <div className="lg:col-span-7 relative min-h-[260px] lg:h-full bg-slate-950 overflow-hidden">
        <svg viewBox="0 0 720 420" className="w-full h-full object-cover" aria-hidden="true">
          <defs>
            <linearGradient id="vid3-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#090D16" />
              <stop offset="60%" stopColor="#162032" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>
          <rect width="720" height="420" fill="url(#vid3-bg)" />
          <g stroke="#38BDF8" strokeOpacity="0.18" strokeWidth="1">
            <rect x="64" y="56" width="592" height="252" rx="8" fill="#0B1220" />
            <line x1="64" y1="108" x2="656" y2="108" />
          </g>
          {/* Timeline Tracks */}
          <rect
            x="92"
            y="140"
            width={160 + ((currentTime * 6) % 140)}
            height="32"
            rx="4"
            fill="#E11D48"
            fillOpacity="0.75"
          />
          <rect x="140" y="188" width="380" height="32" rx="4" fill="#334155" />
          <rect x="92" y="236" width="460" height="32" rx="4" fill="#1E293B" />
          {/* Playhead */}
          <line
            x1={110 + (getProgressPercent(currentTime, duration) * 4.8)}
            y1="120"
            x2={110 + (getProgressPercent(currentTime, duration) * 4.8)}
            y2="290"
            stroke="#F8FAFC"
            strokeWidth="2"
          />
        </svg>

        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={isPlaying ? 'Pause split section video' : 'Play split section video'}
            className="w-10 h-10 rounded-lg bg-white text-slate-950 flex items-center justify-center hover:bg-slate-100 transition-colors shrink-0"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
          <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E11D48] transition-all duration-300"
              style={{ width: `${getProgressPercent(currentTime, duration)}%` }}
            />
          </div>
          <span className="text-xs font-mono tabular-nums text-white whitespace-nowrap shrink-0">
            {isPlaying ? 'Streaming' : 'Ready'}
          </span>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Vid4: Video Testimonial Card                                               */
/* -------------------------------------------------------------------------- */
export function Vid4() {
  const duration = 92;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setCurrentTime((prev) => {
        const { nextTime, ended } = advanceTime(prev, duration, 0.5, 1, false);
        if (ended) setIsPlaying(false);
        return nextTime;
      });
    }, 500);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  return (
    <article className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
      <div className="relative aspect-[16/10] bg-slate-900 overflow-hidden">
        <svg viewBox="0 0 560 350" className="w-full h-full object-cover" aria-hidden="true">
          <defs>
            <linearGradient id="vid4-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>
          <rect width="560" height="350" fill="url(#vid4-bg)" />
          {/* Studio backdrop silhouette */}
          <circle cx="280" cy="138" r="46" fill="#CBD5E1" fillOpacity="0.22" />
          <path
            d="M188 308 C188 232, 372 232, 372 308 Z"
            fill="#CBD5E1"
            fillOpacity="0.16"
          />
          {/* Subtle audio activity bars when playing */}
          {Array.from({ length: 12 }).map((_, i) => {
            const h = isPlaying ? 12 + ((i * 11 + Math.floor(currentTime * 6)) % 28) : 8;
            return (
              <rect
                key={i}
                x={38 + i * 9}
                y={46 - h}
                width="4"
                height={h}
                rx="2"
                fill={isPlaying ? '#FB7185' : '#64748B'}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

        <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/75 text-white text-xs font-mono tabular-nums">
          {formatTimecode(currentTime)} / {formatTimecode(duration)}
        </div>

        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4">
          <div className="text-white max-w-xs">
            <p className="text-xs text-slate-200 leading-snug">
              {isPlaying
                ? '"Cutting our dailies turnaround from 4 hours to 12 minutes changed every shoot."'
                : 'Watch 90-second customer story'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={isPlaying ? 'Pause customer testimonial video' : 'Play customer testimonial video'}
            className="w-11 h-11 rounded-full bg-white text-slate-950 flex items-center justify-center hover:bg-slate-100 transition-colors shrink-0 shadow-md"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
        </div>
      </div>

      <div className="h-1 bg-slate-100">
        <div
          className="h-full bg-[#E11D48] transition-all duration-300"
          style={{ width: `${getProgressPercent(currentTime, duration)}%` }}
        />
      </div>

      <div className="p-5 flex flex-col gap-3">
        <blockquote className="text-sm text-slate-700 leading-relaxed font-medium">
          “We cut post-production review cycles by 64% in three months after moving our remote editors onto a single frame-accurate review feed.”
        </blockquote>
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <p className="font-semibold text-slate-900">Maya Lindqvist</p>
            <p className="text-slate-500">Head of Post · Northlight Studios</p>
          </div>
          <span className="font-mono tabular-nums text-slate-700 font-medium whitespace-nowrap">
            -64% review time
          </span>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Vid5: Video Playlist Strip                                                 */
/* -------------------------------------------------------------------------- */
const PLAYLIST_TRACKS = [
  { id: 't1', title: '01. Color Pipeline Setup', duration: 145, accent: '#E11D48' },
  { id: 't2', title: '02. Multi-Node LUT Blending', duration: 192, accent: '#2563EB' },
  { id: 't3', title: '03. HDR Tone Mapping', duration: 168, accent: '#059669' },
  { id: 't4', title: '04. Delivery & DCP Export', duration: 215, accent: '#D97706' },
] as const;

export function Vid5() {
  const [activeId, setActiveId] = useState<string>(PLAYLIST_TRACKS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const activeTrack = PLAYLIST_TRACKS.find((t) => t.id === activeId) ?? PLAYLIST_TRACKS[0];

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setCurrentTime((prev) => {
        const { nextTime, ended } = advanceTime(prev, activeTrack.duration, 0.5, 1, false);
        if (ended) setIsPlaying(false);
        return nextTime;
      });
    }, 500);
    return () => window.clearInterval(timer);
  }, [isPlaying, activeTrack.duration]);

  const selectTrack = (id: string) => {
    setActiveId(id);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
      {/* Main Active Viewport */}
      <div className="relative aspect-video bg-slate-950 overflow-hidden">
        <svg viewBox="0 0 720 405" className="w-full h-full object-cover" aria-hidden="true">
          <rect width="720" height="405" fill="#0B0F17" />
          <circle cx="520" cy="140" r="140" fill={activeTrack.accent} fillOpacity="0.22" />
          <rect x="72" y="72" width="576" height="240" rx="8" fill="#111827" stroke="#334155" />
          <path
            d="M112 246 L230 164 L340 218 L470 132 L608 205"
            fill="none"
            stroke={activeTrack.accent}
            strokeWidth="3.5"
          />
          {isPlaying && (
            <circle cx={112 + (getProgressPercent(currentTime, activeTrack.duration) * 4.96)} cy="190" r="7" fill="#FFFFFF" />
          )}
        </svg>

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

        <div className="absolute inset-x-4 bottom-3.5 flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-4">
            <div className="text-white min-w-0">
              <p className="text-xs text-slate-300 font-mono tabular-nums">
                Now Playing · {formatTimecode(currentTime)} / {formatTimecode(activeTrack.duration)}
              </p>
              <h3 className="text-base font-semibold truncate">{activeTrack.title}</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              aria-label={isPlaying ? `Pause ${activeTrack.title}` : `Play ${activeTrack.title}`}
              className="w-10 h-10 rounded-full bg-white text-slate-950 flex items-center justify-center hover:bg-slate-100 transition-colors shrink-0"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>
          </div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E11D48] transition-all duration-300"
              style={{ width: `${getProgressPercent(currentTime, activeTrack.duration)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Playlist Strip */}
      <div className="border-t border-slate-200 flex flex-col flex-1">
        <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
            <ListVideo className="w-4 h-4 text-slate-600" />
            <span>Series Queue</span>
          </div>
          <span className="text-xs font-mono tabular-nums text-slate-500">
            {PLAYLIST_TRACKS.length} videos
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:gap-px bg-slate-100 flex-1">
          {PLAYLIST_TRACKS.map((track) => {
            const isActive = track.id === activeTrack.id;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => selectTrack(track.id)}
                className={`w-full text-left px-3.5 py-3 flex items-center justify-between gap-2.5 transition-colors ${
                  isActive ? 'bg-slate-50' : 'bg-white hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-[#E11D48] text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isActive && isPlaying ? (
                      <Pause className="w-3 h-3 fill-current" />
                    ) : isActive ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Play className="w-3 h-3 fill-current ml-0.5" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-xs truncate ${isActive ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                      {track.title}
                    </p>
                    <p className="text-[11px] font-mono tabular-nums text-slate-500">
                      {formatTimecode(track.duration)}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
