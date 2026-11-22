import { Check, Minus } from 'lucide-react';

const SPECS = [
  { label: 'Frequency response', standard: '45 Hz – 22 kHz', reference: '32 Hz – 28 kHz' },
  { label: 'Amplifier architecture', standard: 'Class-D Bi-Amp (120W)', reference: 'Discrete Class-AB (240W)' },
  { label: 'Room DSP calibration', standard: false, reference: true },
  { label: 'Balanced XLR & AES3 digital input', standard: false, reference: true },
  { label: 'Enclosure material', standard: 'Braced MDF', reference: 'Machined Billet Aluminum' },
  { label: 'Pair matching tolerance', standard: '±1.5 dB', reference: '±0.25 dB' },
] as const;

export function Compare4() {
  return (
    <section aria-labelledby="compare4-heading" className="w-full bg-white border border-neutral-200 rounded-xl p-6 md:p-8">
      <div className="mb-6 pb-4 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p className="text-xs text-neutral-500 mb-1">Minimal 2-Column Comparison</p>
          <h3 id="compare4-heading" className="text-2xl font-medium tracking-tight text-neutral-950 font-display">
            Nearfield Monitor Comparison
          </h3>
        </div>
        <span className="text-xs text-neutral-500">All measurements anechoic at 1m</span>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full min-w-[540px] border-collapse text-left">
          <thead>
            <tr className="border-b border-neutral-200">
              <th scope="col" className="py-4 pr-4 w-[44%] text-xs font-medium text-neutral-500">
                Acoustic Parameter
              </th>
              <th scope="col" className="py-4 px-5 w-[28%] align-bottom">
                <div className="text-sm font-semibold text-neutral-900">Monitor A5</div>
                <div className="text-xs font-normal text-neutral-500 mt-0.5 tabular-nums">$680 / pair</div>
              </th>
              <th scope="col" className="py-4 px-5 w-[28%] align-bottom bg-neutral-50 rounded-t-lg border-t border-x border-neutral-200">
                <div className="text-[11px] font-medium text-neutral-900 mb-1">Studio Pick</div>
                <div className="text-sm font-semibold text-neutral-950">Monitor R7 Reference</div>
                <div className="text-xs font-normal text-neutral-600 mt-0.5 tabular-nums">$1,290 / pair</div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {SPECS.map((row) => (
              <tr key={row.label}>
                <th scope="row" className="py-4 pr-4 text-sm font-normal text-neutral-700">
                  {row.label}
                </th>
                <td className="py-4 px-5 text-sm text-neutral-600 tabular-nums">
                  {typeof row.standard === 'boolean' ? (
                    row.standard ? (
                      <Check className="w-4 h-4 text-neutral-900" aria-label="Included" />
                    ) : (
                      <Minus className="w-4 h-4 text-neutral-300" aria-label="Not included" />
                    )
                  ) : (
                    row.standard
                  )}
                </td>
                <td className="py-4 px-5 text-sm font-medium text-neutral-950 bg-neutral-50 border-x border-neutral-200 tabular-nums">
                  {typeof row.reference === 'boolean' ? (
                    row.reference ? (
                      <Check className="w-4 h-4 text-neutral-950" aria-label="Included" />
                    ) : (
                      <Minus className="w-4 h-4 text-neutral-300" aria-label="Not included" />
                    )
                  ) : (
                    row.reference
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
