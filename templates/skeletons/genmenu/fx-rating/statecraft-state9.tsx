import { Package, ShoppingCart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface StateProps {
  replaySignal?: number;
}

export function State9({ replaySignal = 0 }: StateProps) {
  const [cartCount, setCartCount] = useState(3);
  const [isFlying, setIsFlying] = useState(false);
  const [flyKey, setFlyKey] = useState(0);
  const timerRef = useRef<number | null>(null);

  const triggerAdd = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    setIsFlying(true);
    setFlyKey((k) => k + 1);
    timerRef.current = window.setTimeout(() => {
      setCartCount((c) => c + 1);
    }, 520);
  };

  useEffect(() => {
    if (replaySignal > 0) {
      triggerAdd();
    }
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [replaySignal]);

  return (
    <div className="relative w-full max-w-[260px] rounded-lg border border-slate-200 bg-white p-3">
      {/* Top Row: Product + Cart Destination */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-slate-900">Desk Lamp S2</p>
          <p className="text-xs font-mono tabular-nums text-slate-500">$140.00</p>
        </div>
        <div className="relative inline-flex items-center justify-center w-9 h-9 rounded-lg bg-slate-100 text-slate-800">
          <ShoppingCart className="w-4 h-4" />
          <span
            key={cartCount}
            className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[10px] font-mono font-semibold tabular-nums flex items-center justify-center animate-badge-pop"
          >
            {cartCount}
          </span>
        </div>
      </div>

      {/* Parabolic Arc Trajectory SVG */}
      <svg
        viewBox="0 0 180 56"
        className="w-full h-11 overflow-visible my-1 pointer-events-none"
        aria-hidden="true"
      >
        <path
          d="M 28 46 Q 92 -8 152 12"
          fill="none"
          stroke="#93C5FD"
          strokeWidth="1.75"
          strokeDasharray="4 4"
        />
      </svg>

      {/* Bottom Action + Flying Item Badge */}
      <div className="relative flex items-center justify-between">
        <button
          type="button"
          onClick={triggerAdd}
          className="px-3 py-1.5 rounded-md bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-blue-600 cursor-pointer whitespace-nowrap"
        >
          Add to Cart
        </button>

        {/* Flying parcel element: mid-arc in static state, animates along arc on replay */}
        <div
          key={flyKey}
          className={`pointer-events-none absolute left-10 bottom-1 ${
            isFlying ? 'animate-cart-fly-x' : 'translate-x-[104px]'
          }`}
          aria-hidden="true"
        >
          <div
            className={`w-6 h-6 rounded-md bg-blue-600 text-white shadow-sm flex items-center justify-center ${
              isFlying ? 'animate-cart-fly-y' : '-translate-y-[34px] scale-90'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
          </div>
        </div>

        <span className="text-[11px] font-mono text-emerald-700 font-medium">
          Added
        </span>
      </div>
    </div>
  );
}
