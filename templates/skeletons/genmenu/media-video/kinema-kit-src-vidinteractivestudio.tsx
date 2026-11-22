import { useEffect, useState } from 'react';
import {
  Camera,
  Compass,
  FileText,
  Film,
  Pause,
  Play,
  RotateCw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { advanceTime, formatTimecode, getProgressPercent } from '../../utils/media';

/* -------------------------------------------------------------------------- */
/* Vid16: Storyboard Bento Preview (Multi-beat tile)                          */
/* -------------------------------------------------------------------------- */
const STORYBOARD_BEATS = [
  { label: 'Beat 01 · Establishing', color: '#E11D48', shape: 'circle' },
  { label: 'Beat 02 · Detail Macro', color: '#2563EB', shape: 'rect' },
  { label: 'Beat 03 · Motion Pan', color: '#059669', shape: 'wave' },
  { label: 'Beat 04 · End Slate', color: '#D97706', shape: 'grid' },
] as const;

export function Vid16() {
  const duration = 20;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [muted, setMuted] = useState(true);

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

  const beatIndex = Math.min(3, Math.floor((currentTime / duration) * 4));
  const beat = STORYBOARD_BEATS[beatIndex];

  return (
    <article className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
      <div className="relative aspect-[16/10] bg-slate-950 overflow-hidden">
        <svg viewBox="0 0 560 350" className="w-full h-full" aria-hidden="true">
          <rect width="560" height="350" fill="#090D16" />
          {beat.shape === 'circle' && (
            <circle cx="280" cy="175" r="92" fill={beat.color} fillOpacity="0.32" stroke={beat.color} strokeWidth="2" />
          )}
          {beat.shape === 'rect' && (
            <rect x="130" y="75" width="300" height="200" rx="14" fill={beat.color} fillOpacity="0.28" stroke={beat.color} strokeWidth="2" />
          )}
          {beat.shape === 'wave' && (
            <path d="M50 220 Q165 80 280 180 T510 140" fill="none" stroke={beat.color} strokeWidth="5" />
          )}
          {beat.shape === 'grid' && (
            <g stroke={beat.color} strokeWidth="2" fill="none">
              <rect x="120" y="70" width="140" height="90" rx="6" />
              <rect x="290" y="70" width="140" height="90" rx="6" />
              <rect x="120" y="180" width="310" height="90" rx="6" />
            </g>
          )}
        </svg>

        <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/75 text-white text-xs font-mono">
          {beat.label}
        </div>

        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? 'Unmute storyboard preview' : 'Mute storyboard preview'}
          className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-black/70 text-white flex items-center justify-center hover:bg-black/90"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* 4-segment beat progress */}
        <div className="absolute inset-x-3 bottom-3 grid grid-cols-4 gap-1.5">
          {STORYBOARD_BEATS.map((item, idx) => (
            <button
              key={item.label}
              type="button"
              aria-label={`Jump to ${item.label}`}
              onClick={() => {
                setCurrentTime(idx * 5);
                setIsPlaying(true);
              }}
              className="h-2 rounded-full bg-white/25 overflow-hidden"
            >
              <span
                className="block h-full bg-white transition-all duration-300"
                style={{
                  width:
                    idx < beatIndex
                      ? '100%'
                      : idx === beatIndex
                        ? `${((currentTime % 5) / 5) * 100}%`
                        : '0%',
                }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Storyboard Beat Preview</h3>
          <p className="text-xs text-slate-500 font-mono tabular-nums mt-0.5">
            {formatTimecode(currentTime)} / {formatTimecode(duration)} · {isPlaying ? 'Cycling' : 'Paused'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsPlaying((p) => !p)}
          aria-label={isPlaying ? 'Pause storyboard preview' : 'Play storyboard preview'}
          className="w-10 h-10 rounded-full bg-slate-950 text-white flex items-center justify-center hover:bg-slate-800 shrink-0"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Vid17: Voice Memo Feedback Card                                            */
/* -------------------------------------------------------------------------- */
const VOICE_BARS = [14, 24, 34, 18, 38, 28, 16, 36, 40, 22, 30, 18, 34, 26, 14, 28, 36, 20, 14, 24];

export function Vid17() {
  const duration = 42;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState<1 | 1.5>(1);
  const [showTranscript, setShowTranscript] = useState(false);

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

  const pct = getProgressPercent(currentTime, duration);

  return (
    <article className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-500">Review Note · Elena Rostova</p>
          <h3 className="text-base font-semibold text-slate-900">Audio Voice-Note Feedback</h3>
        </div>
        <button
          type="button"
          onClick={() => setSpeed((s) => (s === 1 ? 1.5 : 1))}
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono tabular-nums font-semibold text-slate-700 hover:bg-slate-50"
        >
          {speed}x
        </button>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex items-center gap-3.5">
        <button
          type="button"
          onClick={() => setIsPlaying((p) => !p)}
          aria-label={isPlaying ? 'Pause voice note' : 'Play voice note'}
          className="w-10 h-10 rounded-full bg-[#E11D48] text-white flex items-center justify-center hover:bg-[#BE123C] transition-colors shrink-0"
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        <div className="flex-1 flex items-center gap-1 h-10" aria-hidden="true">
          {VOICE_BARS.map((h, i) => {
            const filled = ((i + 1) / VOICE_BARS.length) * 100 <= pct;
            return (
              <span
                key={i}
                className={`flex-1 rounded-full transition-colors ${
                  filled ? 'bg-slate-900' : 'bg-slate-300'
                }`}
                style={{ height: `${h}px` }}
              />
            );
          })}
        </div>

        <span className="text-xs font-mono tabular-nums text-slate-600 shrink-0">
          {formatTimecode(currentTime)} / {formatTimecode(duration)}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => setShowTranscript((v) => !v)}
          className="self-start inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-950"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{showTranscript ? 'Hide Transcript' : 'Show Transcript'}</span>
        </button>
        {showTranscript && (
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
            “At 00:18 let’s hold the wide crane shot for six extra frames before cutting to the workstation close-up—the pacing feels much calmer.”
          </p>
        )}
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Vid18: 360° Spatial Orbit Frame                                            */
/* -------------------------------------------------------------------------- */
export function Vid18() {
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [azimuth, setAzimuth] = useState(35);

  useEffect(() => {
    if (!isOrbiting) return undefined;
    const timer = window.setInterval(() => {
      setAzimuth((deg) => (deg + 6) % 360);
    }, 150);
    return () => window.clearInterval(timer);
  }, [isOrbiting]);

  const rad = (azimuth * Math.PI) / 180;
  const rx = Math.max(18, Math.abs(Math.cos(rad)) * 110);

  return (
    <article className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
      <div className="relative aspect-video bg-slate-950 overflow-hidden">
        <svg viewBox="0 0 560 315" className="w-full h-full" aria-hidden="true">
          <rect width="560" height="315" fill="#0B1120" />
          {/* Equator & Orbit Rings */}
          <ellipse cx="280" cy="158" rx="170" ry="52" fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="5 5" />
          <ellipse cx="280" cy="158" rx={rx} ry="110" fill="#2563EB" fillOpacity="0.14" stroke="#60A5FA" strokeWidth="2" />
          <circle
            cx={280 + Math.sin(rad) * 170}
            cy={158 + Math.cos(rad) * 32}
            r="10"
            fill="#E11D48"
          />
          <circle cx="280" cy="158" r="18" fill="#F8FAFC" fillOpacity="0.85" />
        </svg>

        <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/75 text-white text-xs font-mono tabular-nums">
          <Compass className="w-3.5 h-3.5 text-[#FB7185]" />
          <span>{String(azimuth).padStart(3, '0')}° AZIMUTH</span>
        </div>

        <button
          type="button"
          onClick={() => setAzimuth(0)}
          aria-label="Reset 360 camera angle"
          className="absolute top-3 right-3 w-9 h-9 rounded-lg bg-black/70 text-white flex items-center justify-center hover:bg-black/90"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">360° Spatial Orbit Preview</h3>
            <p className="text-xs text-slate-500">
              {isOrbiting ? 'Auto-orbit active' : 'Manual azimuth scrub'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOrbiting((o) => !o)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-950 text-white text-xs font-semibold hover:bg-slate-800 shrink-0"
          >
            {isOrbiting ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isOrbiting ? 'Stop Orbit' : 'Auto Orbit'}</span>
          </button>
        </div>

        <input
          type="range"
          min={0}
          max={359}
          value={azimuth}
          aria-label="Pan 360 degree spatial camera angle"
          onChange={(e) => setAzimuth(Number(e.target.value))}
          className="w-full accent-[#E11D48] cursor-pointer"
        />
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Vid19: Dual-Track Multi-Angle Switcher                                     */
/* -------------------------------------------------------------------------- */
const CAMERA_FEEDS = [
  { id: 'camA', label: 'Cam A · Wide Stage', accent: '#E11D48' },
  { id: 'camB', label: 'Cam B · Close-Up', accent: '#2563EB' },
  { id: 'camC', label: 'Cam C · Slide Deck', accent: '#059669' },
] as const;

export function Vid19() {
  const duration = 240;
  const [activeCam, setActiveCam] = useState<string>(CAMERA_FEEDS[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(48);

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

  const currentFeed = CAMERA_FEEDS.find((c) => c.id === activeCam) ?? CAMERA_FEEDS[0];

  return (
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs grid grid-cols-1 lg:grid-cols-12">
      <div className="lg:col-span-8 relative aspect-video lg:aspect-auto lg:min-h-[300px] bg-slate-950 overflow-hidden">
        <svg viewBox="0 0 720 405" className="w-full h-full object-cover" aria-hidden="true">
          <rect width="720" height="405" fill="#090D16" />
          {activeCam === 'camA' && (
            <g>
              <rect x="90" y="90" width="540" height="225" rx="8" fill="#111827" stroke="#334155" />
              <circle cx="240" cy="202" r="48" fill="#E11D48" fillOpacity="0.35" />
              <circle cx="480" cy="202" r="48" fill="#38BDF8" fillOpacity="0.25" />
            </g>
          )}
          {activeCam === 'camB' && (
            <g>
              <circle cx="360" cy="185" r="95" fill="#2563EB" fillOpacity="0.25" stroke="#60A5FA" strokeWidth="2" />
              <rect x="260" y="135" width="200" height="100" rx="8" fill="none" stroke="#93C5FD" strokeDasharray="6 6" />
            </g>
          )}
          {activeCam === 'camC' && (
            <g>
              <rect x="110" y="65" width="500" height="260" rx="8" fill="#064E3B" fillOpacity="0.35" stroke="#10B981" />
              <path d="M160 250 L280 175 L410 215 L550 115" fill="none" stroke="#34D399" strokeWidth="4" />
            </g>
          )}
        </svg>

        <div className="absolute top-3 left-3 inline-flex items-center gap-2 px-2.5 py-1 rounded bg-black/75 text-white text-xs font-mono">
          <Camera className="w-3.5 h-3.5" style={{ color: currentFeed.accent }} />
          <span>{currentFeed.label}</span>
        </div>

        <div className="absolute inset-x-4 bottom-4 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={isPlaying ? 'Pause multi-angle stream' : 'Play multi-angle stream'}
            className="w-10 h-10 rounded-lg bg-white text-slate-950 flex items-center justify-center hover:bg-slate-100 shrink-0"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
          <div className="flex-1 h-1.5 bg-white/25 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#E11D48] transition-all duration-300"
              style={{ width: `${getProgressPercent(currentTime, duration)}%` }}
            />
          </div>
          <span className="text-xs font-mono tabular-nums text-white bg-black/70 px-2 py-1 rounded">
            {formatTimecode(currentTime)} / {formatTimecode(duration)}
          </span>
        </div>
      </div>

      <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200 p-5 flex flex-col justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500">Synchronized Feed Switcher</p>
          <h3 className="text-base font-semibold text-slate-900 mt-0.5">
            Multi-Cam Director Monitor
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Switch camera angles mid-playback without interrupting the master timeline clock.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {CAMERA_FEEDS.map((feed) => {
            const selected = feed.id === activeCam;
            return (
              <button
                key={feed.id}
                type="button"
                onClick={() => setActiveCam(feed.id)}
                className={`w-full px-3.5 py-2.5 rounded-lg border text-left flex items-center justify-between transition-colors ${
                  selected
                    ? 'border-slate-950 bg-slate-950 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs font-semibold">{feed.label}</span>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: feed.accent }}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Vid20: Minimalist Showreel Strip / Filmstrip Scrubber                      */
/* -------------------------------------------------------------------------- */
const REEL_FRAMES = [
  { id: 'f1', label: '00:00 Opening', time: 0, bg: '#1E1B4B', accent: '#E11D48' },
  { id: 'f2', label: '00:25 Architecture', time: 25, bg: '#0F172A', accent: '#38BDF8' },
  { id: 'f3', label: '00:50 Kinetic Type', time: 50, bg: '#1E293B', accent: '#F59E0B' },
  { id: 'f4', label: '01:15 Color Study', time: 75, bg: '#2B0E24', accent: '#FB7185' },
  { id: 'f5', label: '01:40 Credits', time: 100, bg: '#090D16', accent: '#34D399' },
] as const;

export function Vid20() {
  const duration = 120;
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

  const activeFrameIdx = Math.min(4, Math.floor(currentTime / 25));
  const activeFrame = REEL_FRAMES[activeFrameIdx];

  return (
    <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col">
      <div className="relative aspect-[21/9] min-h-[220px] bg-slate-950 overflow-hidden">
        <svg viewBox="0 0 1050 450" className="w-full h-full object-cover" aria-hidden="true">
          <rect width="1050" height="450" fill={activeFrame.bg} />
          <circle cx="720" cy="210" r="145" fill={activeFrame.accent} fillOpacity="0.24" />
          <rect x="90" y="90" width="870" height="270" rx="10" fill="none" stroke="#FFFFFF" strokeOpacity="0.16" />
          <path
            d="M140 300 C320 140, 560 320, 910 150"
            fill="none"
            stroke={activeFrame.accent}
            strokeWidth="4"
          />
        </svg>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/25 pointer-events-none" />

        <div className="absolute inset-x-6 bottom-5 flex items-end justify-between gap-4 text-white">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-300 font-mono tabular-nums">
              <Film className="w-3.5 h-3.5" />
              <span>Anamorphic 21:9 Showreel</span>
              <span aria-hidden="true">·</span>
              <span>{formatTimecode(currentTime)} / {formatTimecode(duration)}</span>
            </div>
            <h3 className="text-xl font-bold mt-1">{activeFrame.label}</h3>
          </div>

          <button
            type="button"
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={isPlaying ? 'Pause widescreen filmstrip reel' : 'Play widescreen filmstrip reel'}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-slate-950 text-xs font-semibold hover:bg-slate-100 transition-colors shrink-0"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isPlaying ? 'Pause Reel' : 'Play Reel'}</span>
          </button>
        </div>
      </div>

      {/* Contact Sheet Filmstrip Scrubber */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-3">
        {REEL_FRAMES.map((frame, idx) => {
          const isCurrent = idx === activeFrameIdx;
          return (
            <button
              key={frame.id}
              type="button"
              onClick={() => {
                setCurrentTime(frame.time);
                setIsPlaying(true);
              }}
              className={`rounded-lg border p-2 text-left transition-colors flex flex-col gap-2 ${
                isCurrent
                  ? 'border-slate-950 bg-white shadow-xs'
                  : 'border-slate-200 bg-white/70 hover:bg-white'
              }`}
            >
              <div className="aspect-[16/7] rounded overflow-hidden bg-slate-900">
                <svg viewBox="0 0 160 70" className="w-full h-full" aria-hidden="true">
                  <rect width="160" height="70" fill={frame.bg} />
                  <circle cx={40 + idx * 20} cy="35" r="22" fill={frame.accent} fillOpacity="0.5" />
                </svg>
              </div>
              <span className="text-[11px] font-mono tabular-nums font-medium text-slate-800 truncate">
                {frame.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
