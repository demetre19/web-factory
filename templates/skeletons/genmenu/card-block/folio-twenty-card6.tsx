import { useState } from 'react';
import { ThumbsUp } from 'lucide-react';

export interface Card6Props {
  quote?: string;
  outcome?: string;
  authorName?: string;
  authorHandle?: string;
  role?: string;
  initialHelpfulCount?: number;
  accentBg?: string;
}

export function Card6({
  quote = 'We shipped our entire summer workshop schedule using two of these event blocks and sold out 140 seats before Friday noon.',
  outcome = '140 seats filled in 36 hours',
  authorName = 'Samira Patel',
  authorHandle = '@samiraprints',
  role = 'Founder, Loom & Press',
  initialHelpfulCount = 24,
  accentBg = 'bg-[#FEF3C7]',
}: Card6Props) {
  const [helpfulCount, setHelpfulCount] = useState(initialHelpfulCount);
  const [hasUpvoted, setHasUpvoted] = useState(false);

  const toggleUpvote = () => {
    setHasUpvoted((prev) => {
      setHelpfulCount((c) => (prev ? c - 1 : c + 1));
      return !prev;
    });
  };

  return (
    <figure
      className={`${accentBg} border-2 border-zinc-900 rounded-2xl p-6 flex flex-col justify-between gap-5 shadow-[4px_4px_0px_0px_rgba(20,20,19,1)]`}
    >
      <div>
        <p className="text-xs font-semibold text-zinc-900">
          {outcome}
        </p>

        <blockquote className="mt-3 text-base font-medium leading-relaxed text-zinc-900">
          “{quote}”
        </blockquote>
      </div>

      <figcaption className="pt-4 border-t border-zinc-900/15 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-zinc-900 truncate">{authorName}</p>
          <p className="text-xs text-zinc-700 truncate">
            {role} · {authorHandle}
          </p>
        </div>

        <button
          type="button"
          onClick={toggleUpvote}
          aria-pressed={hasUpvoted}
          aria-label={`Endorse quote by ${authorName}, current count ${helpfulCount}`}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border-2 border-zinc-900 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 ${
            hasUpvoted
              ? 'bg-zinc-900 text-white'
              : 'bg-white text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="font-mono tabular-nums">{helpfulCount}</span>
        </button>
      </figcaption>
    </figure>
  );
}
