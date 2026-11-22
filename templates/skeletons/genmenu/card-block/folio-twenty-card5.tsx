export interface Card5Props {
  quote?: string;
  outcomeMetric?: string;
  outcomeContext?: string;
  authorName?: string;
  authorTitle?: string;
  organization?: string;
}

export function Card5({
  quote = 'Replacing our fragmented checkout modals with a single structured layout cut support tickets almost in half within the first quarter.',
  outcomeMetric = '-46% Checkout Drop-Off',
  outcomeContext = 'Measured across 90 days post-launch',
  authorName = 'Miriam Okafor',
  authorTitle = 'VP of Product',
  organization = 'Kestrel Commerce',
}: Card5Props) {
  return (
    <figure className="bg-[#FAF8F4] border border-stone-300/80 rounded-xl p-6 md:p-7 flex flex-col justify-between gap-6">
      <div>
        <div className="flex items-baseline justify-between gap-4 pb-4 border-b border-stone-200">
          <span
            className="text-3xl leading-none text-stone-400 select-none"
            style={{ fontFamily: 'var(--font-display)' }}
            aria-hidden="true"
          >
            “
          </span>
          <div className="text-right">
            <p className="text-sm font-semibold font-mono tabular-nums text-stone-900">
              {outcomeMetric}
            </p>
            <p className="text-xs text-stone-500">{outcomeContext}</p>
          </div>
        </div>

        <blockquote
          className="mt-5 text-lg leading-relaxed text-stone-900"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {quote}
        </blockquote>
      </div>

      <figcaption className="pt-4 border-t border-stone-200 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-stone-900">{authorName}</p>
          <p className="text-xs text-stone-600">
            {authorTitle} · {organization}
          </p>
        </div>
      </figcaption>
    </figure>
  );
}
