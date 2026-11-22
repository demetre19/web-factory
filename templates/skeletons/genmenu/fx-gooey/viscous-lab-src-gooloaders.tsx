import React, { useId, useState } from 'react';

/**
 * Goo13: Liquid Loader Blobs — three phase-shifted orbital droplets fusing into a crescent wave.
 */
type LoaderSpeed = 'slow' | 'normal' | 'fast';

const SPEED_SECONDS: Record<LoaderSpeed, string> = {
  slow: '3.4s',
  normal: '2.0s',
  fast: '1.15s',
};

export const Goo13: React.FC = () => {
  const uid = useId().replace(/:/g, '');
  const filterId = `goo-filter-13-${uid}`;
  const [speed, setSpeed] = useState<LoaderSpeed>('normal');

  return (
    <div className="relative flex h-56 w-full flex-col items-center justify-between rounded-xl bg-[#F4F4F0] p-4 select-none">
      <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="6.5" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 21 -8.5"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="flex w-full items-center justify-center gap-1 rounded-lg bg-stone-200/80 p-1">
        {(['slow', 'normal', 'fast'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSpeed(s)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors whitespace-nowrap ${
              speed === s ? 'bg-white text-[#141413] shadow-xs' : 'text-stone-600 hover:text-[#141413]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div
        className="relative flex h-28 w-full items-center justify-center"
        style={{ filter: `url(#${filterId})` }}
      >
        <div
          className="absolute h-6 w-6 rounded-full bg-blue-600 animate-[gooLoaderSpinA_2s_ease-in-out_infinite]"
          style={{ animationDuration: SPEED_SECONDS[speed] }}
        />
        <div
          className="absolute h-6 w-6 rounded-full bg-blue-600 animate-[gooLoaderSpinB_2s_ease-in-out_infinite]"
          style={{ animationDuration: SPEED_SECONDS[speed] }}
        />
        <div
          className="absolute h-6 w-6 rounded-full bg-blue-600 animate-[gooLoaderSpinC_2s_ease-in-out_infinite]"
          style={{ animationDuration: SPEED_SECONDS[speed] }}
        />
      </div>

      <p className="text-xs text-stone-500">Phase-shifted orbital beads coalescing mid-arc</p>
    </div>
  );
};

/**
 * Goo15: Text-to-Blob Dissolve — crisp display lettering melts into ink puddles and re-condenses.
 */
export const Goo15: React.FC = () => {
  const uid = useId().replace(/:/g, '');
  const filterId = `goo-filter-15-${uid}`;
  const [dissolved, setDissolved] = useState(false);

  return (
    <div className="relative flex h-56 w-full flex-col items-center justify-between rounded-xl bg-[#F4F4F0] p-4 select-none">
      <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id={filterId}>
            <feColorMatrix
              in="SourceGraphic"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 26 -10"
              result="goo"
            />
          </filter>
        </defs>
      </svg>

      <div className="flex w-full items-center justify-end">
        <button
          type="button"
          onClick={() => setDissolved((v) => !v)}
          aria-pressed={dissolved}
          className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 transition-colors hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 whitespace-nowrap"
        >
          {dissolved ? 'Condense Type' : 'Dissolve Type'}
        </button>
      </div>

      <div
        className="flex h-28 w-full items-center justify-center overflow-hidden"
        style={{ filter: `url(#${filterId})` }}
      >
        <div
          className={`flex items-center gap-1 font-display text-4xl font-bold text-[#141413] transition-all duration-700 ease-in-out ${
            dissolved ? 'scale-110 tracking-[-0.14em] blur-[6.5px]' : 'scale-100 tracking-tight blur-none'
          }`}
        >
          <span>F</span>
          <span className={dissolved ? 'translate-y-2 transition-transform duration-700' : 'transition-transform duration-700'}>
            L
          </span>
          <span className={dissolved ? '-translate-y-1.5 transition-transform duration-700' : 'transition-transform duration-700'}>
            U
          </span>
          <span className={dissolved ? 'translate-y-1.5 transition-transform duration-700' : 'transition-transform duration-700'}>
            I
          </span>
          <span>D</span>
        </div>
      </div>

      <p className="text-xs text-stone-500">
        {dissolved ? 'Thresholded ink puddles' : 'Crisp typographic glyph state'}
      </p>
    </div>
  );
};

/**
 * Goo17: Effervescent Meniscus Fill — rising bubbles coalesce into a calibrated liquid column.
 */
export const Goo17: React.FC = () => {
  const uid = useId().replace(/:/g, '');
  const filterId = `goo-filter-17-${uid}`;
  const [level, setLevel] = useState(55);

  const pump = () => setLevel((v) => (v >= 95 ? 25 : Math.min(95, v + 20)));
  const drain = () => setLevel(20);

  return (
    <div className="relative flex h-56 w-full flex-col items-center justify-between rounded-xl bg-[#F4F4F0] p-4 select-none">
      <svg className="pointer-events-none absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="5.5" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="flex w-full items-center justify-between">
        <span className="text-xs font-mono text-stone-700 tabular-nums">{level}% Full</span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={drain}
            className="rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 transition-colors hover:bg-stone-100 whitespace-nowrap"
          >
            Drain
          </button>
          <button
            type="button"
            onClick={pump}
            className="rounded-lg bg-[#141413] px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-stone-800 whitespace-nowrap"
          >
            Pump
          </button>
        </div>
      </div>

      <div className="relative h-28 w-24 overflow-hidden rounded-b-2xl rounded-t-md border-2 border-stone-300 bg-white">
        <div
          className="absolute inset-0"
          style={{ filter: `url(#${filterId})` }}
        >
          <div
            className="absolute inset-x-0 bottom-0 bg-emerald-600 transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ height: `${level}%` }}
          />
          <div className="absolute bottom-2 left-4 h-4 w-4 rounded-full bg-emerald-600 animate-[bubbleRise_2.1s_ease-in_infinite]" />
          <div
            className="absolute bottom-2 right-4 h-3.5 w-3.5 rounded-full bg-emerald-600 animate-[bubbleRise_2.5s_ease-in_infinite]"
            style={{ animationDelay: '0.8s' }}
          />
          <div
            className="absolute bottom-2 left-10 h-3 w-3 rounded-full bg-emerald-600 animate-[bubbleRise_1.9s_ease-in_infinite]"
            style={{ animationDelay: '1.4s' }}
          />
        </div>
      </div>

      <p className="text-xs text-stone-500">Buoyant droplets fuse into rising meniscus</p>
    </div>
  );
};
