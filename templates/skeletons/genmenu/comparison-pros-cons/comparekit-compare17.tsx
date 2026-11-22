import { Plus, Minus } from 'lucide-react';

const OPTIONS = [
  {
    id: 'monolith',
    name: 'Modular Monolith',
    verdict: 'Recommended for teams under 80 engineers',
    winner: true,
    pros: [
      'Single transactional database guarantees ACID integrity across domain boundaries.',
      'In-process function calls eliminate network serialization overhead and partial failures.',
      'Unified local dev environment and atomic CI/CD rollbacks.',
    ],
    cons: [
      'Requires disciplined internal module boundaries to prevent circular imports.',
      'Compute scales as a single unit unless heavy workers are split out.',
    ],
  },
  {
    id: 'microservices',
    name: 'Distributed Microservices',
    verdict: 'Viable only with dedicated platform infrastructure team',
    winner: false,
    pros: [
      'Independent deployment cadence and polyglot runtime choices per service.',
      'Fine-grained horizontal scaling for isolated compute-bound workloads.',
    ],
    cons: [
      'Distributed tracing, service mesh, and saga compensation add steep operational cost.',
      'Cross-service schema changes require coordinated multi-phase rollouts.',
      'End-to-end integration testing becomes slower and prone to environmental flakiness.',
    ],
  },
] as const;

export function Compare17() {
  return (
    <section
      aria-labelledby="compare17-heading"
      className="w-full bg-[#FAF8F4] text-stone-900 border border-stone-200 rounded-xl p-6 md:p-10"
    >
      <div className="mb-8 max-w-2xl">
        <p className="text-xs uppercase tracking-widest text-stone-500 mb-2">
          Editorial 2-Column Pros &amp; Cons Evaluation
        </p>
        <h3 id="compare17-heading" className="text-3xl font-serif font-medium tracking-tight text-stone-900">
          Core Backend Topology Trade-offs
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {OPTIONS.map((opt) => (
          <article
            key={opt.id}
            className={`rounded-lg p-6 border ${
              opt.winner
                ? 'bg-[#EFE9DD] border-stone-400'
                : 'bg-white/70 border-stone-200'
            }`}
          >
            <div className="pb-4 mb-5 border-b border-stone-300">
              <div className="text-xs uppercase tracking-widest text-amber-900 font-semibold min-h-[1rem] mb-1">
                {opt.winner ? 'Recommended Architecture' : 'Alternative Approach'}
              </div>
              <h4 className="font-serif text-2xl font-medium text-stone-950">{opt.name}</h4>
              <p className="text-xs text-stone-600 mt-1">{opt.verdict}</p>
            </div>

            <div className="space-y-6">
              <div>
                <h5 className="text-xs uppercase tracking-widest font-semibold text-emerald-900 mb-3">
                  Advantages (Pros)
                </h5>
                <ul className="space-y-2.5">
                  {opt.pros.map((pro) => (
                    <li key={pro} className="flex items-start gap-2.5 text-sm text-stone-800 leading-relaxed">
                      <Plus className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="text-xs uppercase tracking-widest font-semibold text-rose-900 mb-3">
                  Trade-offs (Cons)
                </h5>
                <ul className="space-y-2.5">
                  {opt.cons.map((con) => (
                    <li key={con} className="flex items-start gap-2.5 text-sm text-stone-700 leading-relaxed">
                      <Minus className="w-4 h-4 text-rose-800 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
