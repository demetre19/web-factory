import { useState } from 'react';
import { Bookmark, ChevronDown } from 'lucide-react';

export interface Card16Props {
  title?: string;
  department?: string;
  location?: string;
  arrangement?: string;
  compensation?: string;
  summary?: string;
  requirements?: string[];
}

export function Card16({
  title = 'Staff Design Systems Engineer',
  department = 'Core Product',
  location = 'San Francisco or Remote',
  arrangement = 'Full-time',
  compensation = '$195k – $225k',
  summary = 'Own our multi-brand token pipeline, accessible React primitives, and visual regression tooling across web surfaces.',
  requirements = [
    '6+ years shipping production React and TypeScript UI systems',
    'Deep fluency in WAI-ARIA patterns and keyboard navigation',
  ],
}: Card16Props) {
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="bg-white border border-zinc-200 rounded-xl px-6 py-5 transition-colors hover:border-zinc-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
          <p className="mt-1 text-xs text-zinc-600">
            <span>{department}</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>{location}</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span>{arrangement}</span>
            <span className="mx-1.5" aria-hidden="true">·</span>
            <span className="font-mono tabular-nums font-medium text-zinc-900">
              {compensation}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setSaved((prev) => !prev)}
            aria-pressed={saved}
            aria-label={saved ? `Unsave ${title}` : `Save ${title}`}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 ${
              saved
                ? 'bg-zinc-900 border-zinc-900 text-white'
                : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-300'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
          >
            <span>{expanded ? 'Hide Brief' : 'Role Brief'}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-zinc-100 space-y-2.5">
          <p className="text-sm leading-relaxed text-zinc-700">{summary}</p>
          <ul className="space-y-1 text-xs text-zinc-600 list-disc list-inside">
            {requirements.map((req) => (
              <li key={req}>{req}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
