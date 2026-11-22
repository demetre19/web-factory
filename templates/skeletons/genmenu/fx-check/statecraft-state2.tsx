import { Check } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';

interface StateProps {
  replaySignal?: number;
}

const CONFETTI_SHARDS = [
  { tx: '-68px', ty: '-44px', rot: '-38deg', color: '#2563EB', w: 9, h: 4, shape: 'rect' },
  { tx: '-48px', ty: '-62px', rot: '24deg', color: '#059669', w: 7, h: 7, shape: 'diamond' },
  { tx: '-16px', ty: '-66px', rot: '-18deg', color: '#F59E0B', w: 10, h: 4, shape: 'rect' },
  { tx: '22px', ty: '-64px', rot: '32deg', color: '#E11D48', w: 8, h: 4, shape: 'rect' },
  { tx: '54px', ty: '-56px', rot: '-42deg', color: '#2563EB', w: 7, h: 7, shape: 'diamond' },
  { tx: '76px', ty: '-30px', rot: '50deg', color: '#059669', w: 9, h: 4, shape: 'rect' },
  { tx: '82px', ty: '8px', rot: '-24deg', color: '#F59E0B', w: 7, h: 7, shape: 'circle' },
  { tx: '66px', ty: '42px', rot: '36deg', color: '#E11D48', w: 10, h: 4, shape: 'rect' },
  { tx: '30px', ty: '56px', rot: '-30deg', color: '#2563EB', w: 7, h: 7, shape: 'diamond' },
  { tx: '-26px', ty: '54px', rot: '22deg', color: '#059669', w: 9, h: 4, shape: 'rect' },
  { tx: '-64px', ty: '38px', rot: '-46deg', color: '#F59E0B', w: 8, h: 4, shape: 'rect' },
  { tx: '-82px', ty: '4px', rot: '18deg', color: '#E11D48', w: 7, h: 7, shape: 'circle' },
];

export function State2({ replaySignal = 0 }: StateProps) {
  const [burstKey, setBurstKey] = useState(0);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    if (replaySignal > 0) {
      setHasTriggered(true);
      setBurstKey((k) => k + 1);
    }
  }, [replaySignal]);

  const handleBurst = () => {
    setHasTriggered(true);
    setBurstKey((k) => k + 1);
  };

  return (
    <div className="relative flex items-center justify-center w-full h-36">
      <div
        key={burstKey}
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        {CONFETTI_SHARDS.map((piece, idx) => {
          const style: CSSProperties & Record<`--${string}`, string> = {
            width: `${piece.w}px`,
            height: `${piece.h}px`,
            backgroundColor: piece.color,
            borderRadius: piece.shape === 'circle' ? '9999px' : '1.5px',
            '--tx': piece.tx,
            '--ty': piece.ty,
            '--rot': piece.rot,
            transform: hasTriggered
              ? undefined
              : `translate(${piece.tx}, ${piece.ty}) rotate(${piece.rot})`,
          };
          return (
            <span
              key={idx}
              style={style}
              className={`absolute ${
                hasTriggered ? 'animate-confetti-piece' : ''
              } ${piece.shape === 'diamond' ? 'rotate-45' : ''}`}
            />
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleBurst}
        className="relative z-10 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs font-semibold shadow-sm hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-transform active:scale-95 whitespace-nowrap cursor-pointer"
      >
        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white">
          <Check className="w-3 h-3" strokeWidth={2.75} />
        </span>
        <span>Milestone Unlocked</span>
      </button>
    </div>
  );
}
