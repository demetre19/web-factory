import {useEffect, useRef, useState, type MouseEvent} from 'react';
import {lerpPoint, type Point2D} from '../../utils/fxMath';

export function Fx18() {
  const stageRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const targetRef = useRef<Point2D>({x: 36, y: 56});
  const currentRef = useRef<Point2D>({x: 36, y: 56});
  const [coords, setCoords] = useState<Point2D>({x: 36, y: 56});
  const [activeInside, setActiveInside] = useState(false);

  useEffect(() => {
    let rafId = 0;
    const tick = () => {
      currentRef.current = lerpPoint(currentRef.current, targetRef.current, 0.16);
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${currentRef.current.x - 10}px, ${currentRef.current.y - 10}px, 0)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = {
      x: Math.round(event.clientX - rect.left),
      y: Math.round(event.clientY - rect.top),
    };
    targetRef.current = next;
    setCoords(next);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <div
        ref={stageRef}
        onMouseMove={handleMove}
        onMouseEnter={() => setActiveInside(true)}
        onMouseLeave={() => setActiveInside(false)}
        className="relative h-28 w-full rounded-lg border border-zinc-200 bg-zinc-50 overflow-hidden flex items-center justify-center select-none"
      >
        <span
          ref={dotRef}
          aria-hidden="true"
          className={`pointer-events-none absolute top-0 left-0 w-5 h-5 rounded-full transition-opacity duration-200 ${
            activeInside
              ? 'bg-[#2563EB] ring-4 ring-[#2563EB]/20 opacity-100'
              : 'bg-zinc-900/75 opacity-80'
          }`}
        />
        <span className="text-xs font-medium text-zinc-500 pointer-events-none">
          Move pointer inside tracking pad
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>Lerped rAF interpolation (0.16)</span>
        <span className="font-mono tabular-nums">
          x: {coords.x}px · y: {coords.y}px
        </span>
      </div>
    </div>
  );
}
