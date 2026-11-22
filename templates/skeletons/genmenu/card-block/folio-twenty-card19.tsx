import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export interface ChangelogItem {
  kind: 'Added' | 'Improved' | 'Fixed';
  text: string;
}

export interface Card19Props {
  releaseLabel?: string;
  date?: string;
  isoDate?: string;
  headline?: string;
  summary?: string;
  items?: ChangelogItem[];
}

const DEFAULT_ITEMS: ChangelogItem[] = [
  {
    kind: 'Added',
    text: 'Keyboard range selection across multi-column tabular grids using Shift + Arrow keys.',
  },
  {
    kind: 'Improved',
    text: 'Reduced cold-start bundle parsing time by 28% through static CSS variable extraction.',
  },
  {
    kind: 'Fixed',
    text: 'Resolved focus-trap restoration when closing nested disclosure panels on Safari.',
  },
];

export function Card19({
  releaseLabel = 'November Release',
  date = 'Nov 12, 2026',
  isoDate = '2026-11-12',
  headline = 'Grid Keyboard Navigation & Faster Theme Compilation',
  summary = 'This cycle focuses on deterministic focus management and leaner stylesheet emission for multi-surface layouts.',
  items = DEFAULT_ITEMS,
}: Card19Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const plainText = `${releaseLabel} (${date}) — ${headline}\n${items
      .map((i) => `- [${i.kind}] ${i.text}`)
      .join('\n')}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(plainText).catch(() => {});
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <article className="bg-[#FAF8F4] border border-stone-300/80 rounded-xl p-6 md:p-8">
      <header className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-600">
            <span className="font-semibold text-stone-900">{releaseLabel}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={isoDate}>{date}</time>
          </div>
          <h3
            className="mt-2 text-xl font-semibold text-stone-900 text-balance"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {headline}
          </h3>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-800 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors whitespace-nowrap shrink-0 self-start focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-700" aria-hidden="true" />
              <span>Notes Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Copy Notes</span>
            </>
          )}
        </button>
      </header>

      <p className="mt-4 text-sm leading-relaxed text-stone-700">{summary}</p>

      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item.text} className="grid grid-cols-1 sm:grid-cols-[88px_1fr] gap-1 sm:gap-4 text-sm">
            <span className="text-xs font-semibold font-mono text-stone-500 sm:pt-0.5">
              {item.kind}
            </span>
            <span className="text-stone-800 leading-relaxed">{item.text}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
