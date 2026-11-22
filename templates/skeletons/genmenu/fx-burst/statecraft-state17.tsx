import { Heart } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';

interface StateProps {
  replaySignal?: number;
}

const HEART_PARTICLES = [
  { tx: '0px', ty: '-28px', color: '#E11D48' },
  { tx: '38px', ty: '-22px', color: '#FB7185' },
  { tx: '54px', ty: '0px', color: '#E11D48' },
  { tx: '38px', ty: '22px', color: '#F59E0B' },
  { tx: '0px', ty: '28px', color: '#E11D48' },
  { tx: '-38px', ty: '22px', color: '#FB7185' },
  { tx: '-54px', ty: '0px', color: '#E11D48' },
  { tx: '-38px', ty: '-22px', color: '#F59E0B' },
];

export function State17({ replaySignal = 0 }: StateProps) {
  const [liked, setLiked] = useState(true);
  const [count, setCount] = useState(128);
  const [burstKey, setBurstKey] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (replaySignal > 0) {
      setLiked(true);
      setHasAnimated(true);
      setBurstKey((k) => k + 1);
    }
  }, [replaySignal]);

  const handleToggle = () => {
    setLiked((prev) => {
      const next = !prev;
      setCount((c) => (next ? c + 1 : c - 1));
      if (next) {
        setHasAnimated(true);
        setBurstKey((k) => k + 1);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex items-center justify-center my-2">
        {/* Radial particles */}
        {liked && (
          <div
            key={burstKey}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <span
              className={`absolute -inset-2.5 rounded-full border border-rose-400/70 ${
                hasAnimated ? 'animate-pulse-ring' : 'opacity-45 scale-105'
              }`}
            />
            {HEART_PARTICLES.map((p, idx) => {
              const style: CSSProperties & Record<`--${string}`, string> = {
                backgroundColor: p.color,
                '--tx': p.tx,
                '--ty': p.ty,
                '--rot': '0deg',
                transform: hasAnimated ? undefined : `translate(${p.tx}, ${p.ty})`,
              };
              return (
                <span
                  key={idx}
                  style={style}
                  className={`absolute w-2 h-2 rounded-full ${
                    hasAnimated ? 'animate-confetti-piece' : ''
                  }`}
                />
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={handleToggle}
          aria-pressed={liked}
          aria-label={liked ? `Unlike, ${count} likes` : `Like, ${count} likes`}
          className={`relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 cursor-pointer ${
            liked
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Heart
            className={`w-4 h-4 ${
              liked
                ? `fill-rose-600 text-rose-600 ${hasAnimated ? 'animate-heart-pop' : ''}`
                : 'text-slate-500'
            }`}
          />
          <span className="font-mono tabular-nums">{count}</span>
        </button>
      </div>
      <p className="text-[11px] font-mono text-slate-500">
        {liked ? '8-point radial burst active' : 'Click heart to burst'}
      </p>
    </div>
  );
}
