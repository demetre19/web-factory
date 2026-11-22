import { useState, type ComponentType } from 'react';
import { Cpu, ArrowUpRight } from 'lucide-react';

export interface Card8Props {
  category?: string;
  title?: string;
  description?: string;
  p95Latency?: string;
  throughput?: string;
  Icon?: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
}

export function Card8({
  category = 'Compute Layer',
  title = 'Deterministic Edge Caching',
  description = 'Replicates compiled state snapshots across 34 regional points of presence with automatic stale-while-revalidate eviction.',
  p95Latency = '11.4 ms',
  throughput = '42k req/s',
  Icon = Cpu,
}: Card8Props) {
  const [mode, setMode] = useState<'standard' | 'strict'>('standard');

  return (
    <article className="bg-[#111215] text-zinc-100 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between gap-6">
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-700 flex items-center justify-center text-amber-400 shrink-0">
            <Icon className="w-5 h-5" aria-hidden={true} />
          </div>
          <span className="text-xs font-medium tracking-[0.01em] text-zinc-400">
            {category}
          </span>
        </div>

        <h3 className="mt-5 text-base font-semibold tracking-[0.01em] text-white">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-zinc-300">{description}</p>
      </div>

      <div className="space-y-4">
        <dl className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
          <div>
            <dt className="text-xs text-zinc-400">P95 Latency</dt>
            <dd className="mt-0.5 text-sm font-semibold font-mono tabular-nums text-white">
              {mode === 'strict' ? '14.8 ms' : p95Latency}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-400">Throughput</dt>
            <dd className="mt-0.5 text-sm font-semibold font-mono tabular-nums text-white">
              {mode === 'strict' ? '36k req/s' : throughput}
            </dd>
          </div>
        </dl>

        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={() => setMode((m) => (m === 'standard' ? 'strict' : 'standard'))}
            aria-pressed={mode === 'strict'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 hover:border-zinc-500 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <span>Consistency: {mode === 'strict' ? 'Strict' : 'Standard'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
