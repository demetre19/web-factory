import {useEffect, useState} from 'react';
import {calculateScrollProgress} from '../../utils/fxMath';

export interface Fx1Props {
  showTopBar?: boolean;
}

export function Fx1({showTopBar = true}: Fx1Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const next = calculateScrollProgress(
        window.scrollY,
        document.documentElement.scrollHeight,
        window.innerHeight
      );
      setProgress(next);
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, {passive: true});
    window.addEventListener('resize', updateProgress, {passive: true});
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
    };
  }, []);

  const percentage = Math.round(progress * 100);

  const jumpTo = (fraction: number) => {
    const maxScroll = Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
    window.scrollTo({top: maxScroll * fraction, behavior: 'smooth'});
  };

  return (
    <>
      {showTopBar && (
        <div
          role="progressbar"
          aria-label="Page reading progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentage}
          className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-zinc-200/70 pointer-events-none"
        >
          <div
            className="h-full bg-[#2563EB] origin-left transition-transform duration-75 ease-out"
            style={{transform: `scaleX(${progress})`}}
          />
        </div>
      )}

      <div className="flex flex-col justify-between gap-5 w-full">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-medium text-zinc-500">
            Live Viewport Scroll Position
          </span>
          <span
            data-testid="fx1-percent"
            className="font-mono text-2xl font-medium tabular-nums text-zinc-900"
          >
            {percentage}%
          </span>
        </div>

        <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200">
          <div
            className="h-full bg-[#2563EB] origin-left transition-transform duration-100 ease-out"
            style={{transform: `scaleX(${Math.max(0.03, progress)})`}}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => jumpTo(0)}
            className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Top 0%
          </button>
          <button
            type="button"
            onClick={() => jumpTo(0.5)}
            className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Mid 50%
          </button>
          <button
            type="button"
            onClick={() => jumpTo(1)}
            className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            End 100%
          </button>
        </div>
      </div>
    </>
  );
}
