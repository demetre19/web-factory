const REVISIONS = [
  { id: 'rev-a', name: 'Gen 1 (2021)', winner: false },
  { id: 'rev-b', name: 'Gen 2 (2023)', winner: false },
  { id: 'rev-c', name: 'Gen 3 (2024)', winner: false },
  { id: 'rev-d', name: 'Gen 4 (2026)', winner: true },
] as const;

const REVISION_SPECS = [
  { spec: 'Chassis alloy', values: ['6061 Aluminum', '6061 Anodized', '7075 Machined', 'Grade 5 Titanium'] },
  { spec: 'Total unit mass', values: ['480 g', '415 g', '360 g', '295 g'] },
  { spec: 'Machining tolerance', values: ['±0.10 mm', '±0.05 mm', '±0.02 mm', '±0.008 mm'] },
  { spec: 'Ingress protection', values: ['IP54', 'IP65', 'IP67', 'IP68 (Submersible)'] },
  { spec: 'Serviceable battery cell', values: ['Soldered', 'Adhesive tray', 'Modular clip', 'Tool-free cartridge'] },
  { spec: 'Field lifecycle status', values: ['Discontinued', 'Parts only', 'Legacy support', 'Current Standard'] },
] as const;

export function Compare20() {
  return (
    <section
      aria-labelledby="compare20-heading"
      className="w-full bg-[#FAF8F4] text-stone-900 border border-stone-200 rounded-xl p-6 md:p-10"
    >
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-stone-500 mb-2">
            Editorial 4-Column Hardware Revision History
          </p>
          <h3 id="compare20-heading" className="text-3xl font-serif font-medium tracking-tight text-stone-900">
            Field Instrument Generational Evolution
          </h3>
        </div>
        <span className="text-xs font-serif italic text-stone-600">Archive Reference · Series 01–04</span>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr className="border-y border-stone-300">
              <th scope="col" className="py-4 pr-4 w-[28%] text-xs uppercase tracking-wider text-stone-500 font-medium">
                Engineering Revision
              </th>
              {REVISIONS.map((rev) => (
                <th
                  key={rev.id}
                  scope="col"
                  className={`py-4 px-4 w-[18%] ${
                    rev.winner ? 'bg-[#EFE9DD] border-x border-stone-300' : ''
                  }`}
                >
                  <div className="text-[11px] uppercase tracking-widest text-amber-900 font-semibold min-h-[1rem] mb-0.5">
                    {rev.winner ? 'Current Winner' : ''}
                  </div>
                  <div className="font-serif text-base font-semibold text-stone-950">{rev.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200">
            {REVISION_SPECS.map((row) => (
              <tr key={row.spec}>
                <th scope="row" className="py-3.5 pr-4 text-sm font-normal text-stone-800">
                  {row.spec}
                </th>
                {row.values.map((val, idx) => (
                  <td
                    key={REVISIONS[idx].id}
                    className={`py-3.5 px-4 text-xs font-mono tabular-nums ${
                      REVISIONS[idx].winner
                        ? 'bg-[#EFE9DD]/70 border-x border-stone-300 font-semibold text-stone-950'
                        : 'text-stone-600'
                    }`}
                  >
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
