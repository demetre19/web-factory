import { Check, Minus } from 'lucide-react';

const LICENSES = [
  { id: 'individual', name: 'Individual', price: '$140', cycle: '/year', winner: false },
  { id: 'studio', name: 'Studio', price: '$380', cycle: '/year', winner: false },
  { id: 'agency', name: 'Agency', price: '$790', cycle: '/year', winner: true },
  { id: 'syndicate', name: 'Syndicate', price: '$1,950', cycle: '/year', winner: false },
] as const;

const LEDGER_ROWS = [
  { item: 'Commercial broadcast & print rights', values: ['Up to 10k impressions', 'Up to 250k', 'Unlimited', 'Unlimited'] },
  { item: 'Desktop & variable webfont formats', values: [true, true, true, true] },
  { item: 'Client sub-licensing transfers', values: [false, 'Up to 3 clients', 'Up to 25 clients', 'Unlimited'] },
  { item: 'OpenType stylistic alternates & source', values: [false, true, true, true] },
  { item: 'Custom glyph commission discount', values: [false, '10%', '25%', '40%'] },
] as const;

export function Compare12() {
  return (
    <section
      aria-labelledby="compare12-heading"
      className="w-full bg-[#FAF8F4] text-stone-900 border border-stone-200 rounded-xl p-6 md:p-10"
    >
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-stone-500 mb-2">
            Editorial 4-Column Pricing + Feature Ledger
          </p>
          <h3 id="compare12-heading" className="text-3xl font-serif font-medium tracking-tight text-stone-900">
            Foundry Type Licensing Matrix
          </h3>
        </div>
        <span className="text-xs font-serif italic text-stone-600">Perpetual desktop &amp; self-hosted webfont rights</span>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full min-w-[700px] border-collapse text-left">
          <thead>
            <tr className="border-y border-stone-300">
              <th scope="col" className="py-4 pr-4 w-[28%] align-bottom text-xs uppercase tracking-wider text-stone-500 font-medium">
                License Terms
              </th>
              {LICENSES.map((lic) => (
                <th
                  key={lic.id}
                  scope="col"
                  className={`py-4 px-4 w-[18%] align-top ${
                    lic.winner ? 'bg-[#EFE9DD] border-x border-stone-300' : ''
                  }`}
                >
                  <div className="text-[11px] uppercase tracking-widest text-amber-900 font-semibold min-h-[1rem] mb-1">
                    {lic.winner ? 'Most Selected' : ''}
                  </div>
                  <div className="font-serif text-lg font-medium text-stone-900">{lic.name}</div>
                  <div className="mt-1.5 flex items-baseline gap-1">
                    <span className="font-serif text-xl font-semibold text-stone-950 tabular-nums">{lic.price}</span>
                    <span className="text-xs font-normal text-stone-500">{lic.cycle}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {LEDGER_ROWS.map((row) => (
              <tr key={row.item}>
                <th scope="row" className="py-3.5 pr-4 text-sm font-normal text-stone-800">
                  {row.item}
                </th>
                {row.values.map((val, idx) => {
                  const lic = LICENSES[idx];
                  return (
                    <td
                      key={lic.id}
                      className={`py-3.5 px-4 text-sm ${
                        lic.winner ? 'bg-[#EFE9DD]/70 border-x border-stone-300 font-medium text-stone-900' : 'text-stone-700'
                      }`}
                    >
                      {typeof val === 'boolean' ? (
                        val ? (
                          <Check className="w-4 h-4 text-amber-900" aria-label="Included" />
                        ) : (
                          <Minus className="w-4 h-4 text-stone-400" aria-label="Not included" />
                        )
                      ) : (
                        <span className="tabular-nums">{val}</span>
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
