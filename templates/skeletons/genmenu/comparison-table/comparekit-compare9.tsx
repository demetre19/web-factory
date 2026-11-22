const MODELS = [
  { id: 'm1', name: 'Core M1', price: '$1,499', highlight: false },
  { id: 'm2', name: 'Core M2', price: '$2,199', highlight: false },
  { id: 'pro', name: 'Pro Studio', price: '$3,299', highlight: true },
  { id: 'rack', name: 'Rack Node', price: '$4,899', highlight: false },
] as const;

const SPEC_GROUPS: {
  group: string;
  rows: { spec: string; values: [string, string, string, string] }[];
}[] = [
  {
    group: 'Compute & Silicon',
    rows: [
      { spec: 'CPU Cores (P / E)', values: ['8 (4P + 4E)', '12 (8P + 4E)', '16 (12P + 4E)', '24 (16P + 8E)'] },
      { spec: 'GPU Shader Cores', values: ['10-core', '18-core', '32-core', '60-core'] },
      { spec: 'Memory Bandwidth', values: ['120 GB/s', '200 GB/s', '400 GB/s', '800 GB/s'] },
    ],
  },
  {
    group: 'Storage & I/O',
    rows: [
      { spec: 'Unified Memory Ceiling', values: ['24 GB', '64 GB', '128 GB', '256 GB'] },
      { spec: 'NVMe Read Throughput', values: ['3.4 GB/s', '5.2 GB/s', '7.4 GB/s', '11.2 GB/s'] },
      { spec: 'Thunderbolt 5 Ports', values: ['2', '4', '6', '6 + Dual 10GbE'] },
    ],
  },
  {
    group: 'Thermal & Acoustics',
    rows: [
      { spec: 'Sustained TDP', values: ['35 W', '65 W', '115 W', '240 W'] },
      { spec: 'Idle Acoustic Floor', values: ['14 dBA', '15 dBA', '16 dBA', '34 dBA'] },
    ],
  },
];

export function Compare9() {
  return (
    <section aria-labelledby="compare9-heading" className="w-full bg-white border border-neutral-200 rounded-xl p-6 md:p-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p className="text-xs text-neutral-500 mb-1">Minimal 4-Column Technical Spec Sheet</p>
          <h3 id="compare9-heading" className="text-2xl font-medium tracking-tight text-neutral-950 font-display">
            Workstation Hardware Specifications
          </h3>
        </div>
        <span className="text-xs font-mono text-neutral-500">Rev 2026.2 · Metric &amp; SI Units</span>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full min-w-[700px] border-collapse text-left">
          <thead>
            <tr className="border-b border-neutral-300">
              <th scope="col" className="py-3.5 pr-4 w-[28%] text-xs font-medium text-neutral-500">
                Specification
              </th>
              {MODELS.map((m) => (
                <th
                  key={m.id}
                  scope="col"
                  className={`py-3.5 px-4 w-[18%] align-bottom ${
                    m.highlight ? 'bg-neutral-950 text-white rounded-t-lg' : 'text-neutral-900'
                  }`}
                >
                  <div className={`text-[11px] min-h-[1rem] mb-0.5 ${m.highlight ? 'text-neutral-300' : ''}`}>
                    {m.highlight ? 'Best Value' : ''}
                  </div>
                  <div className="text-sm font-semibold">{m.name}</div>
                  <div className={`text-xs font-mono tabular-nums mt-0.5 ${m.highlight ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {m.price}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SPEC_GROUPS.map((section) => (
              <FragmentGroup key={section.group} group={section.group} rows={section.rows} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FragmentGroup({
  group,
  rows,
}: {
  group: string;
  rows: { spec: string; values: [string, string, string, string] }[];
}) {
  return (
    <>
      <tr className="bg-neutral-50 border-y border-neutral-200">
        <th colSpan={5} scope="colgroup" className="py-2 px-2 text-xs font-semibold text-neutral-600 tracking-wide">
          {group}
        </th>
      </tr>
      {rows.map((row) => (
        <tr key={row.spec} className="border-b border-neutral-100 hover:bg-neutral-50/70">
          <th scope="row" className="py-3 pr-4 pl-2 text-sm font-normal text-neutral-700">
            {row.spec}
          </th>
          {row.values.map((val, idx) => {
            const isHighlighted = MODELS[idx].highlight;
            return (
              <td
                key={MODELS[idx].id}
                className={`py-3 px-4 font-mono text-xs tabular-nums ${
                  isHighlighted ? 'bg-neutral-900 text-white font-medium' : 'text-neutral-700'
                }`}
              >
                {val}
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
}
