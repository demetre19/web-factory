import { useState, type ComponentType } from 'react';
import { Layers, ChevronDown } from 'lucide-react';

export interface Card7Props {
  indexLabel?: string;
  title?: string;
  summary?: string;
  specDetail?: string;
  metricLabel?: string;
  Icon?: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}

export function Card7({
  indexLabel = '01. Architecture',
  title = 'Zero-Dependency Grid Tokens',
  summary = 'Spacing, border radii, and typographic ratios derive from a single 4px baseline scale with predictable nesting math.',
  specDetail = 'Outer radius 12px pairs with 16px internal padding and 8px nested control radius. Verified across 320px–1440px breakpoints.',
  metricLabel = '4px baseline · WCAG AA',
  Icon = Layers,
}: Card7Props) {
  const [showSpec, setShowSpec] = useState(false);

  return (
    <article className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col justify-between gap-5">
      <div>
        <div className="flex items-center justify-between gap-4">
          <div className="w-10 h-10 rounded-lg border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-900 shrink-0">
            <Icon className="w-5 h-5" aria-hidden={true} />
          </div>
          <span className="text-xs font-medium text-zinc-500">{indexLabel}</span>
        </div>

        <h3 className="mt-5 text-base font-semibold tracking-tight text-zinc-900">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-zinc-600">{summary}</p>
      </div>

      <div className="pt-4 border-t border-zinc-100">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-mono text-zinc-500">{metricLabel}</span>
          <button
            type="button"
            onClick={() => setShowSpec((prev) => !prev)}
            aria-expanded={showSpec}
            className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-900 hover:text-blue-700 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
          >
            <span>{showSpec ? 'Hide Spec' : 'View Spec'}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${showSpec ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>

        {showSpec && (
          <p className="mt-3 text-xs leading-relaxed text-zinc-600 bg-zinc-50 border border-zinc-200/80 rounded-lg p-3">
            {specDetail}
          </p>
        )}
      </div>
    </article>
  );
}
