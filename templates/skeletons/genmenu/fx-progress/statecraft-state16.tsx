import { useEffect, useState } from 'react';

interface StateProps {
  replaySignal?: number;
}

export function State16({ replaySignal = 0 }: StateProps) {
  const [saved, setSaved] = useState(true);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (replaySignal > 0) {
      setSaved(false);
      window.requestAnimationFrame(() => {
        setSaved(true);
        setAnimKey((k) => k + 1);
      });
    }
  }, [replaySignal]);

  const toggleSave = () => {
    setSaved((prev) => {
      const next = !prev;
      if (next) setAnimKey((k) => k + 1);
      return next;
    });
  };

  return (
    <div className="w-full max-w-[260px] flex items-center justify-between gap-3 px-3.5 py-3 rounded-lg border border-slate-200 bg-white">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-900 truncate">
          Spring Physics Guide
        </p>
        <p className="text-[11px] font-mono text-slate-500 mt-0.5">
          {saved ? 'Saved to Reading List' : 'Click icon to save'}
        </p>
      </div>

      <button
        type="button"
        onClick={toggleSave}
        aria-pressed={saved}
        aria-label={saved ? 'Remove bookmark' : 'Bookmark article'}
        className={`relative flex items-center justify-center w-10 h-10 rounded-lg border transition-colors focus-visible:outline-2 focus-visible:outline-blue-600 cursor-pointer shrink-0 ${
          saved
            ? 'bg-blue-50 border-blue-200 text-blue-600'
            : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
        }`}
      >
        <svg
          key={animKey}
          viewBox="0 0 24 24"
          className={`w-5 h-5 ${saved ? 'animate-bookmark-pop' : ''}`}
          aria-hidden="true"
        >
          {/* Outline */}
          <path
            d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.75L6 21V4.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          {/* Animated upward clip-fill */}
          <path
            d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.75L6 21V4.5Z"
            fill="currentColor"
            style={{
              clipPath: saved ? 'inset(0% 0 0 0)' : 'inset(100% 0 0 0)',
              transition: 'clip-path 320ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </svg>
      </button>
    </div>
  );
}
