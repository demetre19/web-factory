import { useEffect, useRef, useState } from 'react';

export function Icfx8() {
  const ref = useRef<HTMLDivElement>(null);
  const [inFocus, setInFocus] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInFocus(true);
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const replayFocus = () => {
    setInFocus(false);
    window.setTimeout(() => setInFocus(true), 220);
  };

  return (
    <div ref={ref} className="w-full">
      <div className="relative h-64 w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-900">
        <div
          className={`h-full w-full bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#6366F1] transition-[filter,transform] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            inFocus ? 'scale-100 blur-none' : 'scale-105 blur-md'
          }`}
        >
          <svg viewBox="0 0 400 260" className="h-full w-full" aria-hidden="true">
            <circle cx="200" cy="130" r="88" fill="none" stroke="#C7D2FE" strokeWidth="1" strokeOpacity="0.4" />
            <circle cx="200" cy="130" r="56" fill="none" stroke="#E0E7FF" strokeWidth="1.5" strokeOpacity="0.7" />
            <line x1="112" y1="130" x2="288" y2="130" stroke="#A5B4FC" strokeWidth="0.75" strokeOpacity="0.5" />
            <line x1="200" y1="42" x2="200" y2="218" stroke="#A5B4FC" strokeWidth="0.75" strokeOpacity="0.5" />
            <rect x="172" y="102" width="56" height="56" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          </svg>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-2xl font-semibold tracking-widest text-white">
              f/1.4
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-3 left-3 font-mono text-[11px] text-indigo-100">
          OPTICAL RACK · {inFocus ? 'SHARP (0px)' : 'DEFOCUS (12px)'}
        </div>

        <button
          type="button"
          onClick={replayFocus}
          className="absolute right-3 bottom-3 z-10 rounded-md bg-white/90 px-2.5 py-1 text-xs font-medium text-stone-900 shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8]"
        >
          Rack Focus
        </button>
      </div>
    </div>
  );
}

export default Icfx8;
