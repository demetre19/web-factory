import { CheckCircle2, XCircle } from 'lucide-react';

const STRATEGIES = [
  {
    id: 'ssg',
    title: 'Static Generation (SSG)',
    bestFor: 'Marketing sites & docs',
    winner: false,
    pros: ['Instant CDN edge cache hits', 'Zero origin compute cost per view'],
    cons: ['Full rebuilds slow down at 10k+ pages', 'Stale data without ISR webhooks'],
  },
  {
    id: 'ssr',
    title: 'Streaming SSR',
    bestFor: 'Dynamic SaaS & commerce',
    winner: true,
    pros: [
      'Always fresh, personalized HTML on first byte',
      'Progressive Suspense boundaries keep TTFB fast',
      'Full SEO metadata without client waterfall',
    ],
    cons: ['Requires active server or edge worker runtime'],
  },
  {
    id: 'spa',
    title: 'Client-Only SPA',
    bestFor: 'Authenticated internal tools',
    winner: false,
    pros: ['Simple static bucket hosting', 'Instant client-side route transitions'],
    cons: ['Blank shell or spinner before JS hydrates', 'Poor organic crawler indexing'],
  },
] as const;

export function Compare18() {
  return (
    <section
      aria-labelledby="compare18-heading"
      className="w-full bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-xl p-6 md:p-8"
    >
      <div className="mb-6">
        <p className="text-xs font-medium text-sky-400 mb-1">Dark 3-Column Pros &amp; Cons Matrix</p>
        <h3 id="compare18-heading" className="text-2xl font-semibold tracking-tight text-white font-display">
          Frontend Rendering Strategy Comparison
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {STRATEGIES.map((item) => (
          <article
            key={item.id}
            className={`rounded-lg p-5 border flex flex-col justify-between ${
              item.winner ? 'bg-zinc-900 border-sky-500/70' : 'bg-zinc-900/50 border-zinc-800'
            }`}
          >
            <div>
              <div className="pb-4 mb-4 border-b border-zinc-800">
                <div className="text-xs font-medium text-sky-400 min-h-[1rem] mb-0.5">
                  {item.winner ? 'Recommended Default' : ''}
                </div>
                <h4 className="text-lg font-semibold text-white font-display">{item.title}</h4>
                <p className="text-xs text-zinc-400 mt-1">Best for: {item.bestFor}</p>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="text-xs font-semibold text-emerald-400 mb-2">Pros</div>
                  <ul className="space-y-2">
                    {item.pros.map((pro) => (
                      <li key={pro} className="flex items-start gap-2 text-sm text-zinc-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-xs font-semibold text-rose-400 mb-2">Cons</div>
                  <ul className="space-y-2">
                    {item.cons.map((con) => (
                      <li key={con} className="flex items-start gap-2 text-sm text-zinc-400">
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
