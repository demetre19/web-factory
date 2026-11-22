import { useState } from 'react';
import { Check } from 'lucide-react';
import {
  calculateGpuClusterCost,
  calculatePayrollCost,
  calculateStreamBandwidthCost,
  calculateVolumeEmailCost,
  formatCurrency,
} from '../../utils/pricingHelpers';

/* ============================================================================
   Pricing17 — Slider / Calculator · Minimal / Professional (MailRelay)
   ============================================================================ */
export function Pricing17() {
  const [emailsK, setEmailsK] = useState(120);
  const [confirmed, setConfirmed] = useState<string | null>(null);

  const calc = calculateVolumeEmailCost(emailsK);

  return (
    <section aria-labelledby="p17-heading" className="bg-white py-16 px-6 sm:px-10 text-slate-900">
      <div className="mx-auto max-w-4xl border border-slate-200 rounded-2xl p-8 sm:p-10 bg-slate-50/50">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              MailRelay Transactional API
            </p>
            <h2
              id="p17-heading"
              className="mt-2 text-3xl font-semibold tracking-tight [text-wrap:balance]"
            >
              Estimate your monthly email volume
            </h2>
          </div>

          <div className="text-left md:text-right">
            <div className="text-xs font-medium text-slate-500">{calc.tierName}</div>
            <div className="text-4xl font-bold tracking-tight tabular-nums">
              {formatCurrency(calc.monthlyCost)}
              <span className="text-sm font-normal text-slate-500"> / mo</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="p17-slider" className="font-semibold text-slate-800">
              Monthly outbound messages
            </label>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {(emailsK * 1000).toLocaleString('en-US')} emails · ${calc.ratePerThousand.toFixed(2)} / 1k
            </span>
          </div>

          <input
            id="p17-slider"
            type="range"
            min={10}
            max={1000}
            step={10}
            value={emailsK}
            onChange={(e) => setEmailsK(Number(e.target.value))}
            className="mt-4 w-full accent-slate-900 cursor-pointer"
          />

          <div className="mt-2 flex justify-between text-xs text-slate-500 tabular-nums">
            <span>10,000</span>
            <span>250,000</span>
            <span>500,000</span>
            <span>1,000,000</span>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-600">
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-slate-900" />
              <span>Dedicated IP included at 250k+</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-slate-900" />
              <span>30-day delivery webhook logs</span>
            </li>
          </ul>
          <button
            type="button"
            onClick={() =>
              setConfirmed(`${(emailsK * 1000).toLocaleString('en-US')} emails/mo at ${formatCurrency(calc.monthlyCost)}/mo`)
            }
            className="px-5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors whitespace-nowrap"
          >
            Lock Volume Rate
          </button>
        </div>

        {confirmed && (
          <p role="status" className="mt-5 text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-4 py-2.5">
            Quote locked: <strong className="font-semibold">{confirmed}</strong>
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing18 — Slider / Calculator · Dark (GPUCluster Inference)
   ============================================================================ */
export function Pricing18() {
  const [gpus, setGpus] = useState(4);
  const [hours, setHours] = useState(320);
  const [region, setRegion] = useState<'us-east' | 'eu-central' | 'ap-tokyo'>('us-east');
  const [reserved, setReserved] = useState<string | null>(null);

  const multiplier = region === 'us-east' ? 1 : region === 'eu-central' ? 1.08 : 1.12;
  const { hourlyRate, monthlyTotal } = calculateGpuClusterCost(gpus, hours, multiplier);

  return (
    <section aria-labelledby="p18-heading" className="bg-[#0B0F17] py-16 px-6 sm:px-10 text-slate-100">
      <div className="mx-auto max-w-5xl rounded-2xl bg-[#121826] border border-slate-800 p-8 sm:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-indigo-400">
                GPUCluster H100 Estimator
              </p>
              <h2
                id="p18-heading"
                className="mt-2 text-3xl font-semibold tracking-tight text-white [text-wrap:balance]"
              >
                Configure dedicated inference nodes
              </h2>
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <label htmlFor="p18-gpus" className="text-slate-300 font-medium">
                  GPU Accelerators (80 GB VRAM each)
                </label>
                <span className="font-mono text-white tabular-nums">{gpus} GPUs</span>
              </div>
              <input
                id="p18-gpus"
                type="range"
                min={1}
                max={32}
                step={1}
                value={gpus}
                onChange={(e) => setGpus(Number(e.target.value))}
                className="mt-3 w-full accent-indigo-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <label htmlFor="p18-hours" className="text-slate-300 font-medium">
                  Estimated runtime hours / month
                </label>
                <span className="font-mono text-white tabular-nums">{hours} hrs</span>
              </div>
              <input
                id="p18-hours"
                type="range"
                min={40}
                max={730}
                step={10}
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="mt-3 w-full accent-indigo-400 cursor-pointer"
              />
            </div>

            <div>
              <span className="block text-sm font-medium text-slate-300 mb-2">Deployment Region</span>
              <div className="grid grid-cols-3 gap-2">
                {(['us-east', 'eu-central', 'ap-tokyo'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRegion(r)}
                    className={`py-2 px-3 rounded-lg text-xs font-mono transition-colors whitespace-nowrap ${
                      region === r
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-xl bg-[#0B0F17] border border-slate-800 p-6 sm:p-7">
            <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Live Cluster Estimate
            </div>
            <div className="mt-3 text-4xl font-mono font-bold text-white tabular-nums">
              {formatCurrency(monthlyTotal)}
              <span className="text-sm font-normal text-slate-400"> / mo</span>
            </div>
            <dl className="mt-6 space-y-3 text-xs font-mono border-t border-slate-800 pt-5">
              <div className="flex justify-between">
                <dt className="text-slate-400">Effective hourly rate</dt>
                <dd className="text-indigo-300 tabular-nums">${hourlyRate.toFixed(2)} / hr</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Total VRAM capacity</dt>
                <dd className="text-slate-200 tabular-nums">{gpus * 80} GB</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Volume tier discount</dt>
                <dd className="text-emerald-400 tabular-nums">
                  {gpus >= 16 ? '15% applied' : gpus >= 8 ? '8% applied' : 'Standard'}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() =>
                setReserved(`${gpus} GPUs · ${hours} hrs (${region}) — ${formatCurrency(monthlyTotal)}/mo`)
              }
              className="mt-6 w-full py-2.5 px-4 rounded-lg bg-indigo-500 text-white text-sm font-semibold hover:bg-indigo-400 transition-colors whitespace-nowrap"
            >
              Reserve GPU Allocation
            </button>
          </div>
        </div>

        {reserved && (
          <p role="status" className="mt-6 text-sm font-mono text-indigo-200 bg-indigo-950/50 border border-indigo-800 rounded-lg px-4 py-2.5">
            Allocation drafted: {reserved}
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing19 — Slider / Calculator · Light-Warm (Harvest Payroll)
   ============================================================================ */
export function Pricing19() {
  const [employees, setEmployees] = useState(14);
  const [contractors, setContractors] = useState(5);
  const [saved, setSaved] = useState<string | null>(null);

  const calc = calculatePayrollCost(employees, contractors);

  return (
    <section aria-labelledby="p19-heading" className="bg-[#F6F2EA] py-16 px-6 sm:px-10 text-[#262019]">
      <div className="mx-auto max-w-4xl bg-[#FCFBF8] border border-[#E2D9CB] rounded-2xl p-8 sm:p-10">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#7A664E]">
            Harvest Team Payroll
          </p>
          <h2
            id="p19-heading"
            className="mt-2 text-3xl font-semibold [font-family:var(--font-serif)] [text-wrap:balance]"
          >
            Calculate exact monthly payroll cost
          </h2>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm">
                <label htmlFor="p19-emp" className="font-medium">
                  Full-time W-2 employees ($8/head)
                </label>
                <span className="font-semibold tabular-nums">{employees}</span>
              </div>
              <input
                id="p19-emp"
                type="range"
                min={1}
                max={100}
                value={employees}
                onChange={(e) => setEmployees(Number(e.target.value))}
                className="mt-2.5 w-full accent-[#7A664E] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm">
                <label htmlFor="p19-con" className="font-medium">
                  Active 1099 contractors ($5/head)
                </label>
                <span className="font-semibold tabular-nums">{contractors}</span>
              </div>
              <input
                id="p19-con"
                type="range"
                min={0}
                max={50}
                value={contractors}
                onChange={(e) => setContractors(Number(e.target.value))}
                className="mt-2.5 w-full accent-[#7A664E] cursor-pointer"
              />
            </div>
          </div>

          <div className="rounded-xl bg-[#F2ECE0] border border-[#DDD2C0] p-6">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between text-[#5E5346]">
                <dt>Base platform fee</dt>
                <dd className="tabular-nums">${calc.baseFee}</dd>
              </div>
              <div className="flex justify-between text-[#5E5346]">
                <dt>{employees} employees</dt>
                <dd className="tabular-nums">${calc.employeeFee}</dd>
              </div>
              <div className="flex justify-between text-[#5E5346]">
                <dt>{contractors} contractors</dt>
                <dd className="tabular-nums">${calc.contractorFee}</dd>
              </div>
              <div className="pt-3 mt-3 border-t border-[#D3C7B3] flex justify-between items-baseline">
                <dt className="font-semibold text-[#262019]">Total / month</dt>
                <dd className="text-3xl font-semibold tabular-nums [font-family:var(--font-serif)]">
                  {formatCurrency(calc.totalMonthly)}
                </dd>
              </div>
            </dl>
            <button
              type="button"
              onClick={() =>
                setSaved(`${employees} employees + ${contractors} contractors (${formatCurrency(calc.totalMonthly)}/mo)`)
              }
              className="mt-5 w-full py-2.5 px-4 rounded-lg bg-[#262019] text-[#FCFBF8] text-sm font-medium hover:bg-[#3B3228] transition-colors whitespace-nowrap"
            >
              Start Payroll Setup
            </button>
          </div>
        </div>

        {saved && (
          <p role="status" className="mt-6 text-sm text-[#262019] bg-[#EFE8DA] rounded-lg px-4 py-2.5">
            Estimate saved: <strong className="font-semibold">{saved}</strong>
          </p>
        )}
      </div>
    </section>
  );
}

/* ============================================================================
   Pricing20 — Slider / Calculator · Bold / Colourful (StreamPulse Bandwidth)
   ============================================================================ */
export function Pricing20() {
  const [mauK, setMauK] = useState(40);
  const [dvr, setDvr] = useState(true);
  const [analytics, setAnalytics] = useState(false);
  const [locked, setLocked] = useState<string | null>(null);

  const calc = calculateStreamBandwidthCost(mauK, dvr, analytics);

  return (
    <section aria-labelledby="p20-heading" className="bg-teal-900 py-16 px-6 sm:px-10 text-white">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white text-slate-950 border-2 border-slate-950 p-8 sm:p-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b-2 border-slate-950">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-teal-800">
              StreamPulse Live Video
            </p>
            <h2 id="p20-heading" className="mt-1 text-3xl font-extrabold tracking-tight">
              Build your live stream bundle
            </h2>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-4xl font-extrabold text-teal-800 tabular-nums">
              {formatCurrency(calc.totalMonthly)}
              <span className="text-sm font-semibold text-slate-600"> / mo</span>
            </div>
          </div>
        </div>

        <div className="mt-7 space-y-6">
          <div>
            <div className="flex justify-between text-sm font-bold">
              <label htmlFor="p20-mau">Monthly active viewers</label>
              <span className="tabular-nums text-teal-800">{mauK},000 viewers</span>
            </div>
            <input
              id="p20-mau"
              type="range"
              min={5}
              max={250}
              step={5}
              value={mauK}
              onChange={(e) => setMauK(Number(e.target.value))}
              className="mt-3 w-full accent-teal-700 cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-slate-950 bg-amber-100/70 cursor-pointer">
              <input
                type="checkbox"
                checked={dvr}
                onChange={(e) => setDvr(e.target.checked)}
                className="mt-1 h-4 w-4 accent-teal-800"
              />
              <div>
                <div className="text-sm font-bold">Instant Cloud DVR (+$49/mo)</div>
                <div className="text-xs text-slate-700">Automatic HLS recordings & 24h rewind</div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-slate-950 bg-teal-50 cursor-pointer">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="mt-1 h-4 w-4 accent-teal-800"
              />
              <div>
                <div className="text-sm font-bold">QoE Telemetry (+$29/mo)</div>
                <div className="text-xs text-slate-700">Real-time buffering & bitrate heatmaps</div>
              </div>
            </label>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-200">
          <div className="text-xs font-semibold text-slate-600 tabular-nums">
            Base bandwidth: {formatCurrency(calc.baseCost)} + Add-ons: {formatCurrency(calc.addOnsCost)}
          </div>
          <button
            type="button"
            onClick={() =>
              setLocked(`${mauK}k viewers (${formatCurrency(calc.totalMonthly)}/mo)`)
            }
            className="px-6 py-3 rounded-lg bg-amber-400 text-slate-950 border-2 border-slate-950 text-sm font-extrabold hover:bg-amber-300 transition-colors whitespace-nowrap"
          >
            Deploy Stream Stack
          </button>
        </div>

        {locked && (
          <p role="status" className="mt-5 text-sm font-bold text-teal-950 bg-teal-100 rounded-lg px-4 py-2.5">
            Stream bundle queued: {locked}
          </p>
        )}
      </div>
    </section>
  );
}
