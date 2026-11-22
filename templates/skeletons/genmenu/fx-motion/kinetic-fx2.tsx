import {ChevronDown} from 'lucide-react';

export interface Fx2Props {
  targetId?: string;
}

export function Fx2({targetId = 'specimen-grid'}: Fx2Props) {
  const handleScrollDown = () => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({behavior: 'smooth', block: 'start'});
    } else {
      window.scrollBy({top: 420, behavior: 'smooth'});
    }
  };

  return (
    <div className="flex items-center justify-around gap-8 w-full py-3">
      <button
        type="button"
        onClick={handleScrollDown}
        aria-label="Scroll down using mouse indicator"
        className="group flex flex-col items-center gap-2.5 p-3 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
      >
        <span className="relative flex justify-center w-7 h-11 rounded-full border-2 border-zinc-800 group-hover:border-[#2563EB] transition-colors">
          <span className="mt-2 w-1 h-2.5 rounded-full bg-[#2563EB] fx-animate-wheel" />
        </span>
        <span className="text-xs font-medium text-zinc-600 group-hover:text-zinc-900 transition-colors whitespace-nowrap">
          Mouse Cue
        </span>
      </button>

      <div className="h-12 w-px bg-zinc-200" aria-hidden="true" />

      <button
        type="button"
        onClick={handleScrollDown}
        aria-label="Scroll down using cascading chevron indicator"
        className="group flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-zinc-50 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
      >
        <span className="flex flex-col items-center -space-y-2.5 text-zinc-800 group-hover:text-[#2563EB] transition-colors">
          <ChevronDown className="w-5 h-5 fx-animate-chevron-1" strokeWidth={2} />
          <ChevronDown className="w-5 h-5 fx-animate-chevron-2" strokeWidth={2} />
          <ChevronDown className="w-5 h-5 fx-animate-chevron-3" strokeWidth={2} />
        </span>
        <span className="text-xs font-medium text-zinc-600 group-hover:text-zinc-900 transition-colors whitespace-nowrap">
          Chevron Cascade
        </span>
      </button>
    </div>
  );
}
