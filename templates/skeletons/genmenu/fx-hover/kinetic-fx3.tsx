import {useEffect, useRef, useState} from 'react';
import {RotateCcw} from 'lucide-react';
import {interpolateCounterValue} from '../../utils/fxMath';

export interface Fx3Props {
  replayTrigger?: number;
}

interface StatItem {
  label: string;
  target: number;
  suffix: string;
}

const STATS: StatItem[] = [
  {label: 'Components', target: 20, suffix: ''},
  {label: 'Frame Budget', target: 60, suffix: ' fps'},
  {label: 'Motion Curves', target: 1480, suffix: '+'},
];

export function Fx3({replayTrigger = 0}: Fx3Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [values, setValues] = useState<number[]>(STATS.map(() => 0));
  const [hasEnteredView, setHasEnteredView] = useState(false);
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setHasEnteredView(true);
        }
      },
      {threshold: 0.25}
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (replayTrigger > 0) {
      setHasEnteredView(true);
      setRunId((prev) => prev + 1);
    }
  }, [replayTrigger]);

  useEffect(() => {
    if (!hasEnteredView) return;

    const duration = 1100;
    let rafId = 0;
    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setValues(STATS.map((stat) => interpolateCounterValue(progress, stat.target)));
      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [hasEnteredView, runId]);

  return (
    <div ref={containerRef} className="flex flex-col gap-5 w-full">
      <div className="grid grid-cols-3 gap-4 border-b border-zinc-100 pb-4">
        {STATS.map((stat, index) => (
          <div key={stat.label} className="flex flex-col gap-1">
            <span
              data-testid={`fx3-stat-${index}`}
              className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-zinc-900"
            >
              {values[index].toLocaleString()}
              {stat.suffix}
            </span>
            <span className="text-xs text-zinc-500">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          IntersectionObserver + ease-out cubic
        </span>
        <button
          type="button"
          onClick={() => {
            setHasEnteredView(true);
            setRunId((c) => c + 1);
          }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Replay Count
        </button>
      </div>
    </div>
  );
}
