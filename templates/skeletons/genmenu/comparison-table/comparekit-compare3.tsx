import { Check, Minus } from 'lucide-react';

const EDITIONS = [
  { id: 'digital', name: 'Digital Reader', price: '$12', period: 'per month', winner: false },
  { id: 'patron', name: 'Print & Archive Patron', price: '$28', period: 'per month', winner: true },
  { id: 'institutional', name: 'Library & Institutional', price: '$95', period: 'per month', winner: false },
] as const;

const ENTITLEMENTS = [
  { feature: 'Weekly long-form monographs & essays', values: [true, true, true] },
  { feature: 'Complete digital archive (1984–present)', values: ['Last 2 years', 'Full 42-year archive', 'Full + MARC records'] },
  { feature: 'Quarterly sewn-binding print journal', values: [false, true, '3 copies per issue'] },
  { feature: 'Annotated primary source citations', values: [false, true, true] },
  { feature: 'Simultaneous seat licensing', values: ['1 reader', '2 household readers', '50 concurrent seats'] },
  { feature: 'Annual curatorial symposium invitation', values: [false, true, '2 delegate passes'] },
];

export function Compare3() {
  return (
    <section
      aria-labelledby="compare3-heading"
      className="w-full bg-[#FAF8F4] text-stone-900 border border-stone-200 rounded-xl p-6 md:p-10"
    >
      <div className="max-w-2xl mb-8">
        <p className="text-xs uppercase tracking-widest text-stone-500 mb-2">
          Editorial Comparison · Vol. XIV Membership
        </p>
        <h3 id="compare3-heading" className="text-3xl font-serif font-medium tracking-tight text-stone-900">
          Subscriptions &amp; Archival Access
        </h3>
        <p className="text-sm text-stone-600 mt-2 leading-relaxed">
          Each tier sustains independent investigative reporting and the preservation of our physical print catalog.
        </p>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-y border-stone-300">
              <th scope="col" className="py-5 pr-6 w-[37%] align-bottom text-xs uppercase tracking-widest text-stone-500 font-medium">
                Edition Entitlements
              </th>
              {EDITIONS.map((ed) => (
                <th
                  key={ed.id}
                  scope="col"
                  className={`py-5 px-5 w-[21%] align-top ${
                    ed.winner ? 'bg-[#F2ECE1] border-x border-stone-300' : ''
                  }`}
                >
                  <div className="text-[11px] uppercase tracking-widest text-amber-900 font-semibold min-h-[1rem] mb-1">
                    {ed.winner ? 'Editor’s Choice' : ''}
                  </div>
                  <div className="font-serif text-lg font-medium text-stone-900">{ed.name}</div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="font-serif text-2xl font-semibold text-stone-900 tabular-nums">{ed.price}</span>
                    <span className="text-xs font-normal text-stone-500">{ed.period}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {ENTITLEMENTS.map((row) => (
              <tr key={row.feature} className="hover:bg-stone-100/60 transition-colors">
                <th scope="row" className="py-4 pr-6 text-sm font-normal text-stone-800">
                  {row.feature}
                </th>
                {row.values.map((val, idx) => {
                  const ed = EDITIONS[idx];
                  return (
                    <td
                      key={ed.id}
                      className={`py-4 px-5 text-sm ${
                        ed.winner ? 'bg-[#F2ECE1]/70 border-x border-stone-300 font-medium text-stone-900' : 'text-stone-700'
                      }`}
                    >
                      {typeof val === 'boolean' ? (
                        val ? (
                          <span className="inline-flex items-center gap-1.5 text-stone-900">
                            <Check className="w-4 h-4 text-amber-900" aria-hidden="true" />
                            <span>Included</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-stone-400">
                            <Minus className="w-4 h-4" aria-hidden="true" />
                            <span className="sr-only">Not included</span>
                          </span>
                        )
                      ) : (
                        val
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
