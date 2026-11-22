import {ArrowRight, Bell, RefreshCw} from 'lucide-react';
import {useState} from 'react';

export function Fx13() {
  const [counts, setCounts] = useState({sync: 0, alert: 0, forward: 0});

  return (
    <div className="grid grid-cols-3 gap-3 w-full">
      <button
        type="button"
        onClick={() => setCounts((c) => ({...c, sync: c.sync + 1}))}
        className="group flex flex-col items-center gap-2 p-3.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-white hover:border-zinc-300 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
      >
        <RefreshCw className="w-5 h-5 text-zinc-800 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:rotate-180 group-hover:text-[#2563EB]" />
        <span className="text-xs font-medium text-zinc-700 whitespace-nowrap">
          Rotate ({counts.sync})
        </span>
      </button>

      <button
        type="button"
        onClick={() => setCounts((c) => ({...c, alert: c.alert + 1}))}
        className="group flex flex-col items-center gap-2 p-3.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-white hover:border-zinc-300 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
      >
        <Bell className="w-5 h-5 text-zinc-800 transition-transform duration-200 ease-out group-hover:-translate-y-1 group-hover:rotate-12 group-hover:text-[#2563EB]" />
        <span className="text-xs font-medium text-zinc-700 whitespace-nowrap">
          Bounce ({counts.alert})
        </span>
      </button>

      <button
        type="button"
        onClick={() => setCounts((c) => ({...c, forward: c.forward + 1}))}
        className="group flex flex-col items-center gap-2 p-3.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-white hover:border-zinc-300 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
      >
        <ArrowRight className="w-5 h-5 text-zinc-800 transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1.5 group-hover:text-[#2563EB]" />
        <span className="text-xs font-medium text-zinc-700 whitespace-nowrap">
          Nudge ({counts.forward})
        </span>
      </button>
    </div>
  );
}
