import {useRef, useState, type MouseEvent} from 'react';
import {calculateMagneticOffset} from '../../utils/fxMath';

export function Fx9() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [offset, setOffset] = useState({x: 0, y: 0});
  const [clicks, setClicks] = useState(0);

  const handleMouseMove = (event: MouseEvent<HTMLButtonElement>) => {
    const node = buttonRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    setOffset(calculateMagneticOffset(event.clientX, event.clientY, rect, 12));
  };

  const resetOffset = () => setOffset({x: 0, y: 0});

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full py-2">
      <button
        ref={buttonRef}
        type="button"
        onMouseMove={handleMouseMove}
        onMouseLeave={resetOffset}
        onBlur={resetOffset}
        onClick={() => setClicks((c) => c + 1)}
        style={{
          transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        }}
        className="relative px-6 py-3 rounded-lg bg-zinc-900 hover:bg-[#2563EB] text-white text-sm font-semibold transition-[transform,background-color] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-sm whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
      >
        <span
          className="inline-block transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            transform: `translate3d(${offset.x * 0.3}px, ${offset.y * 0.3}px, 0)`,
          }}
        >
          Magnetic Primary CTA
        </span>
      </button>

      <span className="text-xs font-mono tabular-nums text-zinc-500">
        Offset ({offset.x}px, {offset.y}px) · Triggers {clicks}
      </span>
    </div>
  );
}
