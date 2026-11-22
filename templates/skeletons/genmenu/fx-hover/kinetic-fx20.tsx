import {useState} from 'react';

export function Fx20() {
  const [paused, setPaused] = useState(false);

  return (
    <div className="flex flex-col gap-3.5 w-full">
      <div
        className={`fx-gradient-border-box p-[1.5px] rounded-xl ${
          paused ? 'fx-gradient-border-paused' : ''
        }`}
      >
        <div className="rounded-[10.5px] bg-white p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-zinc-900">
              Conic Perimeter Frame
            </span>
            <span className="font-mono text-xs tabular-nums text-[#2563EB]">
              360° CSS @property
            </span>
          </div>
          <p className="text-xs leading-relaxed text-zinc-600">
            Interpolates a registered <code className="font-mono text-zinc-800">--fx-angle</code> custom
            property cleanly at 60 fps without layout recalculation.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500">
          {paused ? 'Border rotation paused' : 'Continuous conic sweep'}
        </span>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {paused ? 'Resume Border' : 'Pause Border'}
        </button>
      </div>
    </div>
  );
}
