import { useEffect, useState } from 'react';
import {
  ArrowLeftRight,
  Heart,
  MonitorPlay,
  Pause,
  PictureInPicture2,
  Play,
  SlidersHorizontal,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  advanceTime,
  clampTime,
  formatTimecode,
  getActiveChapterIndex,
  getProgressPercent,
} from '../../utils/media';

/* -------------------------------------------------------------------------- */
/* Vid11: Screen-Recording Mock Frame                                         */
/* -------------------------------------------------------------------------- */
export function Vid11() {
  const duration = 68;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(8);
  const [speed, setSpeed] = useState<1 | 2>(1);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setCurrentTime((prev) => {
        const { nextTime, ended } = advanceTime(prev, duration, 0.5, speed, true);
        if (ended) setIsPlaying(false);
        return nextTime;
      });
    }, 500);
    return () => window.clearInterval(timer);
  }, [isPlaying, speed]);

  const pct = getProgressPercent(currentTime, duration);
  const cursorX = 110 + ((pct * 2.8) % 280);
  const cursorY = 110 + Math.sin(currentTime * 0.6) * 48;

  return (
    <article className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
      {/* Mock Window Chrome */}
      <div className="px-4 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
          <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
        </div>
        <span className="text-xs font-mono text-slate-600 truncate">
          app.kinema.studio/render-queue
        </span>
        <button
          type="button"
          onClick={() => setSpeed((s) => (s === 1 ? 2 : 1))}
          aria-label="Toggle screen recording playback speed"
          className="text-xs font-mono tabular-nums font-semibold text-slate-700 hover:text-slate-950 px-2 py-0.5 rounded bg-white border border-slate-200"
        >
          {speed}x
        </button>
      </div>

      {/* Simulated Screen Recording SVG */}
      <div className="relative aspect-[16/10] bg-[#0B101B] overflow-hidden">
        <svg viewBox="0 0 560 350" className="w-full h-full" aria-hidden="true">
          <rect width="560" height="350" fill="#0B101B" />
          {/* Sidebar + canvas UI */}
          <rect x="24" y="24" width="124" height="302" rx="6" fill="#131B2E" stroke="#243049" />
          <rect x="40" y="46" width="92" height="14" rx="3" fill="#334155" />
          <rect x="40" y="74" width="76" height="10" rx="2" fill="#1E293B" />
          <rect x="40" y="94" width="88" height="10" rx="2" fill="#1E293B" />
          <rect x="40" y="114" width="64" height="10" rx="2" fill="#1E293B" />

          <rect x="164" y="24" width="372" height="208" rx="6" fill="#111827" stroke="#243049" />
          <rect
            x="188"
            y="54"
            width={140 + ((pct * 1.4) % 140)}
            height="18"
            rx="4"
            fill="#2563EB"
          />
          <rect x="188" y="88" width="290" height="114" rx="4" fill="#090D16" stroke="#1E293B" />

          {/* Bottom Timeline */}
          <rect x="164" y="246" width="372" height="80" rx="6" fill="#131B2E" stroke="#243049" />
          <rect x="184" y="272" width={Math.max(36, pct * 3.2)} height="26" rx="4" fill="#E11D48" fillOpacity="0.8" />

          {/* Simulated Pointer Cursor */}
          <g transform={`translate(${cursorX}, ${cursorY})`}>
            <polygon points="0,0 0,18 5,14 9,22 12,20 8,12 14,12" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1" />
          </g>
        </svg>

        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 bg-black/75 backdrop-blur-xs rounded-lg px-3 py-2 border border-white/10">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={isPlaying ? 'Pause screen recording' : 'Play screen recording'}
            className="w-9 h-9 rounded-md bg-white text-slate-950 flex items-center justify-center hover:bg-slate-100 transition-colors shrink-0"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>
          <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-[#E11D48] transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-mono tabular-nums text-white whitespace-nowrap">
            {formatTimecode(currentTime)} / {formatTimecode(duration)}
          </span>
        </div>
      </div>

      <div className="p-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Batch Render Queue Demo</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulated UI walkthrough · {isPlaying ? 'Recording Playing' : 'Paused'}
          </p>
        </div>
        <MonitorPlay className="w-5 h-5 text-slate-400 shrink-0" />
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Vid12: Social Video Card                                                   */
/* -------------------------------------------------------------------------- */
export function Vid12() {
  const duration = 30;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(4);
  const [isMuted, setIsMuted] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setCurrentTime((prev) => {
        const { nextTime } = advanceTime(prev, duration, 0.5, 1, true);
        return nextTime;
      });
    }, 500);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const pct = getProgressPercent(currentTime, duration);
  const likeCount = 1248 + (liked ? 1 : 0);

  return (
    <article className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row items-center gap-6">
      {/* Vertical 9:16 Social Video Viewport */}
      <div className="relative w-56 aspect-[9/16] rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-200">
        <svg viewBox="0 0 270 480" className="w-full h-full object-cover" aria-hidden="true">
          <defs>
            <linearGradient id="vid12-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E1B4B" />
              <stop offset="55%" stopColor="#31102F" />
              <stop offset="100%" stopColor="#090D16" />
            </linearGradient>
          </defs>
          <rect width="270" height="480" fill="url(#vid12-bg)" />
          <circle
            cx="135"
            cy={210 + (isPlaying ? Math.sin(currentTime) * 16 : 0)}
            r="68"
            fill="#F43F5E"
            fillOpacity="0.28"
            stroke="#FDA4AF"
            strokeOpacity="0.45"
          />
          <rect x="44" y="138" width="182" height="196" rx="12" fill="none" stroke="#FFFFFF" strokeOpacity="0.16" />
        </svg>

        {/* Top Progress Strip */}
        <div className="absolute inset-x-3 top-3 h-1 bg-white/25 rounded-full overflow-hidden">
          <div className="h-full bg-white transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>

        <button
          type="button"
          onClick={() => setIsMuted((m) => !m)}
          aria-label={isMuted ? 'Unmute social reel' : 'Mute social reel'}
          className="absolute top-6 right-3 w-9 h-9 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />

        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 text-white">
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate">@kieran.frames</p>
            <p className="text-[11px] text-slate-300 font-mono tabular-nums">
              {formatTimecode(currentTime)} / {formatTimecode(duration)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={isPlaying ? 'Pause social reel' : 'Play social reel'}
            className="w-10 h-10 rounded-full bg-white text-slate-950 flex items-center justify-center hover:bg-slate-100 transition-colors shrink-0"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
        </div>
      </div>

      {/* Companion Metadata & Engagement */}
      <div className="flex-1 flex flex-col justify-between gap-4 self-stretch py-1">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Vertical 9:16 Reel</span>
            <span aria-hidden="true">·</span>
            <span>Looping Clip</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            Behind the Lens: Practical Sodium Vapor Lighting
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Portrait short-form container built for mobile feeds, keeping top progress bars, creator attribution, and high-contrast mute controls legible over dark scrims.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-950 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause Clip' : 'Play Clip'}</span>
          </button>
          <button
            type="button"
            onClick={() => setLiked((l) => !l)}
            aria-label={liked ? 'Unlike social reel' : 'Like social reel'}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-mono tabular-nums transition-colors ${
              liked
                ? 'border-[#E11D48] bg-[#E11D48]/10 text-[#BE123C]'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-current' : ''}`} />
            <span>{likeCount}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Vid13: Picture-in-Picture Floating Player                                  */
/* -------------------------------------------------------------------------- */
export function Vid13() {
  const duration = 150;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPip, setIsPip] = useState(false);
  const [dockSide, setDockSide] = useState<'right' | 'left'>('right');
  const [currentTime, setCurrentTime] = useState(32);

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
    <article className="relative bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between gap-4 min-h-[340px]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">Article Companion · Dockable Mini Player</p>
          <h3 className="text-base font-semibold text-slate-900">
            Picture-in-Picture Reader Mode
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setIsPip((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
        >
          <PictureInPicture2 className="w-3.5 h-3.5" />
          <span>{isPip ? 'Restore Inline' : 'Minimize PiP'}</span>
        </button>
      </div>

      {!isPip ? (
        <div className="relative aspect-video rounded-lg bg-slate-950 overflow-hidden">
          <svg viewBox="0 0 560 315" className="w-full h-full" aria-hidden="true">
            <rect width="560" height="315" fill="#0F172A" />
            <circle cx="280" cy="157" r={isPlaying ? 72 : 58} fill="#2563EB" fillOpacity="0.28" />
            <path d="M90 220 L210 130 L320 186 L460 94" fill="none" stroke="#60A5FA" strokeWidth="3" />
          </svg>
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying((p) => !p)}
              aria-label={isPlaying ? 'Pause inline PiP video' : 'Play inline PiP video'}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white text-slate-950 text-xs font-semibold hover:bg-slate-100"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <span className="text-xs font-mono tabular-nums text-white bg-black/70 px-2 py-1 rounded">
              {formatTimecode(currentTime)} / {formatTimecode(duration)}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between gap-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            While minimized into Picture-in-Picture, readers can keep scrolling technical documentation while monitoring frame playback and switching corner dock positions.
          </p>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setDockSide((s) => (s === 'right' ? 'left' : 'right'))}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Dock {dockSide === 'right' ? 'Left' : 'Right'}</span>
            </button>

            {/* Docked Mini Window inside Card */}
            <div
              className={`w-44 rounded-lg bg-slate-950 text-white p-2.5 shadow-lg border border-slate-700 flex items-center justify-between gap-2 ${
                dockSide === 'left' ? 'order-first' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                aria-label={isPlaying ? 'Pause mini PiP player' : 'Play mini PiP player'}
                className="w-8 h-8 rounded bg-[#E11D48] text-white flex items-center justify-center shrink-0"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium truncate">PiP Active</p>
                <p className="text-[10px] font-mono tabular-nums text-slate-300">
                  {formatTimecode(currentTime)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Vid14: Chaptered Lecture / Course Player                                   */
/* -------------------------------------------------------------------------- */
const COURSE_CHAPTERS = [
  { id: 'ch1', label: '00:00 Keyframes', startTime: 0 },
  { id: 'ch2', label: '01:00 Bitrate Curves', startTime: 60 },
  { id: 'ch3', label: '02:15 HDR Metadata', startTime: 135 },
] as const;

export function Vid14() {
  const duration = 210;
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

  const activeIdx = getActiveChapterIndex(COURSE_CHAPTERS, currentTime);

  return (
    <article className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
      <div className="relative aspect-video bg-slate-950 overflow-hidden">
        <svg viewBox="0 0 560 315" className="w-full h-full" aria-hidden="true">
          <rect width="560" height="315" fill="#0B1120" />
          <g stroke="#334155" strokeWidth="1">
            <line x1="60" y1="240" x2="500" y2="240" />
            <line x1="60" y1="70" x2="60" y2="240" />
          </g>
          {activeIdx === 0 && (
            <path d="M70 215 L170 165 L280 185 L470 105" fill="none" stroke="#E11D48" strokeWidth="3.5" />
          )}
          {activeIdx === 1 && (
            <path d="M70 140 Q200 70 300 180 T480 110" fill="none" stroke="#38BDF8" strokeWidth="3.5" />
          )}
          {activeIdx === 2 && (
            <path d="M70 220 C180 220 220 90 480 90" fill="none" stroke="#34D399" strokeWidth="3.5" />
          )}
        </svg>

        <div className="absolute inset-x-3 bottom-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={isPlaying ? 'Pause chaptered lecture' : 'Play chaptered lecture'}
            className="w-10 h-10 rounded-lg bg-white text-slate-950 flex items-center justify-center hover:bg-slate-100 shrink-0"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
          <input
            type="range"
            min={0}
            max={duration}
            value={Math.floor(currentTime)}
            aria-label="Seek chaptered lecture timeline"
            onChange={(e) => setCurrentTime(clampTime(Number(e.target.value), duration))}
            className="w-full accent-[#E11D48] cursor-pointer"
          />
          <span className="text-xs font-mono tabular-nums text-white bg-black/70 px-2 py-1 rounded shrink-0">
            {formatTimecode(currentTime)}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3">
        <div>
          <p className="text-xs text-slate-500">Module 04 · Codec Compression</p>
          <h3 className="text-base font-semibold text-slate-900">
            Chaptered Video Lecture Player
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {COURSE_CHAPTERS.map((chapter, idx) => {
            const active = idx === activeIdx;
            return (
              <button
                key={chapter.id}
                type="button"
                onClick={() => {
                  setCurrentTime(chapter.startTime);
                  setIsPlaying(true);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono tabular-nums transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-slate-950 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {chapter.label}
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Vid15: Before / After Video Comparison Frame                               */
/* -------------------------------------------------------------------------- */
export function Vid15() {
  const [wipePercent, setWipePercent] = useState(52);
  const [isPlaying, setIsPlaying] = useState(false);
  const [frameTick, setFrameTick] = useState(0);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setFrameTick((t) => (t + 1) % 100);
    }, 250);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const offset = isPlaying ? Math.sin(frameTick * 0.2) * 14 : 0;

  return (
    <article className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
      <div className="relative aspect-video bg-slate-900 overflow-hidden select-none">
        {/* Graded Scene (Full Layer) */}
        <svg viewBox="0 0 560 315" className="absolute inset-0 w-full h-full" aria-hidden="true">
          <defs>
            <linearGradient id="vid15-graded" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1E1B4B" />
              <stop offset="60%" stopColor="#881337" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          <rect width="560" height="315" fill="url(#vid15-graded)" />
          <circle cx={340 + offset} cy="130" r="64" fill="#FDE047" fillOpacity="0.65" />
          <path d="M0 240 L190 155 L340 215 L560 120 L560 315 L0 315 Z" fill="#0F172A" fillOpacity="0.72" />
        </svg>

        {/* Raw Log Scene (Clipped Left Layer) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - wipePercent}% 0 0)` }}
        >
          <svg viewBox="0 0 560 315" className="w-full h-full" aria-hidden="true">
            <rect width="560" height="315" fill="#64748B" />
            <circle cx={340 + offset} cy="130" r="64" fill="#CBD5E1" fillOpacity="0.55" />
            <path d="M0 240 L190 155 L340 215 L560 120 L560 315 L0 315 Z" fill="#475569" />
          </svg>
        </div>

        {/* Vertical Wipe Handle Line */}
        <div
          className="absolute inset-y-0 w-0.5 bg-white shadow"
          style={{ left: `${wipePercent}%` }}
          aria-hidden="true"
        >
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white text-slate-900 flex items-center justify-center shadow">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
        </div>

        <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 text-white text-[11px] font-mono">
          RAW LOG
        </div>
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/70 text-white text-[11px] font-mono">
          REC.709 GRADE
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Before / After Grade Wipe</h3>
            <p className="text-xs text-slate-500 font-mono tabular-nums">
              Split {wipePercent}% · {isPlaying ? 'Motion Active' : 'Still Frame'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={isPlaying ? 'Pause comparison motion' : 'Play comparison motion'}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-950 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shrink-0"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>
        </div>

        <input
          type="range"
          min={10}
          max={90}
          value={wipePercent}
          aria-label="Adjust before and after color grade wipe position"
          onChange={(e) => setWipePercent(Number(e.target.value))}
          className="w-full accent-[#E11D48] cursor-pointer"
        />
      </div>
    </article>
  );
}
