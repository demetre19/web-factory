import { useId, useState } from 'react';
import { Command, Download, Info, Keyboard, Sparkles, Check } from 'lucide-react';

/**
 * Micro1: Top Tooltip · Dark · Icon Trigger with Keyboard Shortcut Hint
 */
export function Micro1() {
  const [open, setOpen] = useState(true);
  const tooltipId = useId();

  return (
    <div className="pt-14 pb-3 flex items-center justify-center">
      <div className="relative inline-flex items-center justify-center">
        {open && (
          <div
            id={tooltipId}
            role="tooltip"
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-20 flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900 text-slate-50 text-xs font-medium shadow-lg whitespace-nowrap pointer-events-auto transition-all duration-150"
          >
            <span>Quick Search</span>
            <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[11px] font-mono tabular-nums rounded bg-slate-800 text-slate-300 border border-slate-700">
              ⌘K
            </kbd>
            <span
              aria-hidden="true"
              className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-2.5 h-2.5 rotate-45 bg-slate-900"
            />
          </div>
        )}

        <button
          type="button"
          aria-label="Quick Search"
          aria-describedby={open ? tooltipId : undefined}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 transition-colors"
        >
          <Command className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/**
 * Micro2: Bottom Tooltip · Light · Text Button Trigger
 */
export function Micro2() {
  const [open, setOpen] = useState(true);
  const tooltipId = useId();

  return (
    <div className="pt-2 pb-20 flex items-center justify-center">
      <div className="relative inline-flex items-center justify-center">
        <button
          type="button"
          aria-describedby={open ? tooltipId : undefined}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 transition-colors whitespace-nowrap"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          <span>Export Report</span>
        </button>

        {open && (
          <div
            id={tooltipId}
            role="tooltip"
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-20 w-56 px-3.5 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-200 shadow-lg text-left transition-all duration-150"
          >
            <span
              aria-hidden="true"
              className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1.5 w-2.5 h-2.5 rotate-45 bg-white border-l border-t border-slate-200"
            />
            <p className="text-xs font-semibold text-slate-900">UTF-8 CSV Bundle</p>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Includes column headers and ISO timestamps.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Micro3: Right Tooltip · Colourful · Icon Trigger
 */
export function Micro3() {
  const [open, setOpen] = useState(true);
  const tooltipId = useId();

  return (
    <div className="py-6 pr-44 flex items-center justify-center">
      <div className="relative inline-flex items-center">
        <button
          type="button"
          aria-label="Auto-balance layers"
          aria-describedby={open ? tooltipId : undefined}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600 transition-colors"
        >
          <Sparkles className="w-4 h-4" aria-hidden="true" />
        </button>

        {open && (
          <div
            id={tooltipId}
            role="tooltip"
            className="absolute left-full top-1/2 -translate-y-1/2 ml-3.5 z-20 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg whitespace-nowrap transition-all duration-150"
          >
            <span
              aria-hidden="true"
              className="absolute right-full top-1/2 -translate-y-1/2 -mr-1.5 w-2.5 h-2.5 rotate-45 bg-indigo-600"
            />
            <p className="text-xs font-semibold tracking-tight">Auto-balance layers</p>
            <p className="text-[11px] text-indigo-100 mt-0.5">Normalizes spacing to 8px grid</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Micro4: Left Tooltip · Minimal · Inline Text Trigger with Shortcut
 */
export function Micro4() {
  const [open, setOpen] = useState(true);
  const tooltipId = useId();

  return (
    <div className="py-6 pl-44 flex items-center justify-center">
      <div className="relative inline-flex items-center">
        {open && (
          <div
            id={tooltipId}
            role="tooltip"
            className="absolute right-full top-1/2 -translate-y-1/2 mr-3 z-20 flex items-center gap-2 px-3 py-1.5 rounded-md bg-neutral-950 text-neutral-50 text-xs font-medium shadow-md whitespace-nowrap transition-all duration-150"
          >
            <span>Open shortcuts</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-neutral-800 text-neutral-200 rounded border border-neutral-700">
              ⇧?
            </kbd>
            <span
              aria-hidden="true"
              className="absolute left-full top-1/2 -translate-y-1/2 -ml-1 w-2 h-2 rotate-45 bg-neutral-950"
            />
          </div>
        )}

        <button
          type="button"
          aria-describedby={open ? tooltipId : undefined}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-md text-sm font-medium text-neutral-800 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 transition-colors whitespace-nowrap"
        >
          <Keyboard className="w-3.5 h-3.5 text-neutral-500" aria-hidden="true" />
          <span>Keymap</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Micro16: Inline Info Icon with Description · Minimal
 */
export function Micro16() {
  const [open, setOpen] = useState(true);
  const [retries, setRetries] = useState(5);
  const tooltipId = useId();

  return (
    <div className="pt-2 pb-32 flex items-center justify-center">
      <div className="relative inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
        <span className="text-sm font-medium text-slate-800 whitespace-nowrap">
          Webhook Retries
        </span>
        <span className="text-xs font-mono tabular-nums text-slate-500 px-1.5 py-0.5 rounded bg-slate-100">
          {retries}x
        </span>

        <button
          type="button"
          aria-label="Webhook retry schedule info"
          aria-expanded={open}
          aria-describedby={open ? tooltipId : undefined}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center justify-center w-7 h-7 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 transition-colors"
        >
          <Info className="w-4 h-4" aria-hidden="true" />
        </button>

        {open && (
          <div
            id={tooltipId}
            role="tooltip"
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 z-20 w-64 p-3.5 rounded-xl bg-white border border-slate-200 shadow-lg text-left"
          >
            <p className="text-xs font-semibold text-slate-900">Exponential Backoff</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Failed deliveries wait 10s, 60s, and 5m between consecutive attempts.
            </p>
            <button
              type="button"
              onClick={() => setRetries(3)}
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 focus-visible:outline-none focus-visible:underline"
            >
              {retries === 3 && <Check className="w-3.5 h-3.5" aria-hidden="true" />}
              <span>{retries === 3 ? 'Recommended 3x applied' : 'Use recommended (3x)'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
