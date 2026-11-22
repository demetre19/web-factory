import {useState} from 'react';
import {ArrowLeftRight, Pause, Play} from 'lucide-react';

const BRANDS = [
  'Nordic Acoustics',
  'Helios Optics',
  'Vanguard Foundry',
  'Kestrel Labs',
  'Atelier Mercer',
  'Sovereign Grid',
];

export function Fx7() {
  const [paused, setPaused] = useState(false);
  const [reversed, setReversed] = useState(false);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div
        className={`fx-marquee-container relative w-full overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 py-4 ${
          paused ? 'fx-marquee-paused' : ''
        }`}
      >
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-zinc-50 to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-zinc-50 to-transparent"
          aria-hidden="true"
        />

        <div
          className={`flex w-max items-center ${
            reversed ? 'fx-marquee-track-reverse' : 'fx-marquee-track'
          }`}
        >
          {[0, 1].map((dup) => (
            <div
              key={dup}
              aria-hidden={dup === 1}
              className="flex items-center gap-8 pr-8"
            >
              {BRANDS.map((brand) => (
                <span
                  key={`${dup}-${brand}`}
                  className="inline-flex items-center gap-8 text-sm font-semibold tracking-tight text-zinc-700 whitespace-nowrap"
                >
                  <span>{brand}</span>
                  <span className="text-zinc-300" aria-hidden="true">
                    ·
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-zinc-500">
          Hover strip to pause stream
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            {paused ? 'Play' : 'Pause'}
          </button>
          <button
            type="button"
            onClick={() => setReversed((r) => !r)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Reverse
          </button>
        </div>
      </div>
    </div>
  );
}
