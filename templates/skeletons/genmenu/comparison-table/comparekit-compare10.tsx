const FLEET_MODELS = [
  { id: 'city', name: 'Urban City Van', badge: '', range: '290 km' },
  { id: 'cargo', name: 'Long-Range Cargo', badge: 'Fleet Recommended', range: '460 km' },
  { id: 'chassis', name: 'Heavy Cab Chassis', badge: '', range: '380 km' },
] as const;

const POWERTRAIN_SPECS = [
  { label: 'Usable battery capacity', values: ['68 kWh LFP', '108 kWh NMC', '132 kWh NMC'] },
  { label: 'WLTP combined range', values: ['290 km', '460 km', '380 km'] },
  { label: 'Peak motor torque', values: ['410 Nm', '580 Nm', '740 Nm'] },
  { label: 'DC fast charge (10–80%)', values: ['34 min (120 kW)', '26 min (220 kW)', '32 min (240 kW)'] },
  { label: 'Max rated payload', values: ['1,050 kg', '1,620 kg', '2,450 kg'] },
  { label: 'Cargo bay volume', values: ['6.4 m³', '11.2 m³', 'Modular Upfit'] },
  { label: 'Battery warranty', values: ['8 yr / 160k km', '8 yr / 240k km', '8 yr / 240k km'] },
] as const;

export function Compare10() {
  return (
    <section
      aria-labelledby="compare10-heading"
      className="w-full bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-6 md:p-8"
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-teal-400 mb-1">Dark 3-Column Spec Sheet</p>
          <h3 id="compare10-heading" className="text-2xl font-semibold tracking-tight text-white font-display">
            Commercial EV Powertrain Matrix
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">Tested at 20°C ambient · Gross Vehicle Mass</span>
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full min-w-[620px] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-700">
              <th scope="col" className="py-4 pr-4 w-[34%] text-xs font-medium text-slate-400">
                Powertrain Parameter
              </th>
              {FLEET_MODELS.map((model) => {
                const isWinner = Boolean(model.badge);
                return (
                  <th
                    key={model.id}
                    scope="col"
                    className={`py-4 px-5 w-[22%] align-top ${
                      isWinner
                        ? 'bg-slate-800 border-t-2 border-x border-t-teal-400 border-x-slate-600 rounded-t-lg'
                        : ''
                    }`}
                  >
                    <div className="text-xs font-medium text-teal-400 min-h-[1rem] mb-0.5">{model.badge}</div>
                    <div className="text-base font-semibold text-white font-display">{model.name}</div>
                    <div className="text-xs font-mono text-slate-400 mt-1 tabular-nums">Range: {model.range}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {POWERTRAIN_SPECS.map((row) => (
              <tr key={row.label} className="hover:bg-slate-800/40 transition-colors">
                <th scope="row" className="py-3.5 pr-4 text-sm font-medium text-slate-300">
                  {row.label}
                </th>
                {row.values.map((val, idx) => {
                  const isWinner = Boolean(FLEET_MODELS[idx].badge);
                  return (
                    <td
                      key={FLEET_MODELS[idx].id}
                      className={`py-3.5 px-5 font-mono text-xs tabular-nums ${
                        isWinner
                          ? 'bg-slate-800/80 border-x border-slate-600 text-teal-200 font-semibold'
                          : 'text-slate-300'
                      }`}
                    >
                      {val}
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
