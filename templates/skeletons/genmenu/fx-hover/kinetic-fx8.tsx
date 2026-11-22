import {useState} from 'react';
import {ArrowUpRight} from 'lucide-react';

const TIERS = [
  {name: 'Starter Kit', metric: '12 ms latency', detail: 'Core motion primitives'},
  {name: 'Studio System', metric: '60 fps locked', detail: 'Full compositor suite'},
];

export function Fx8() {
  const [selected, setSelected] = useState(0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
      {TIERS.map((tier, idx) => {
        const isSelected = selected === idx;
        return (
          <button
            key={tier.name}
            type="button"
            onClick={() => setSelected(idx)}
            className={`group text-left p-4 rounded-xl border transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-[0_14px_28px_-10px_rgba(9,9,11,0.14)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] cursor-pointer ${
              isSelected
                ? 'border-[#2563EB] bg-white shadow-[0_10px_22px_-10px_rgba(37,99,235,0.22)]'
                : 'border-zinc-200 bg-zinc-50 hover:bg-white'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-semibold text-zinc-900">
                {tier.name}
              </span>
              <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-[#2563EB] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </div>
            <p className="mt-2 font-mono text-xs tabular-nums text-zinc-600">
              {tier.metric}
            </p>
            <p className="mt-1 text-xs text-zinc-500">{tier.detail}</p>
          </button>
        );
      })}
    </div>
  );
}
