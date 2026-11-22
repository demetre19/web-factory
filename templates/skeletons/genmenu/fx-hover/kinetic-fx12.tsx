import {useState} from 'react';

export function Fx12() {
  const [activeLink, setActiveLink] = useState('Left Sweep');

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 rounded-lg border border-zinc-200 bg-zinc-50">
        {/* Variant 1: Left-to-right grow */}
        <a
          href="#fx12-left"
          onClick={(e) => {
            e.preventDefault();
            setActiveLink('Left Sweep');
          }}
          className="relative py-1 text-sm font-medium text-zinc-900 whitespace-nowrap shrink-0 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-[#2563EB] after:origin-left after:scale-x-0 hover:after:scale-x-100 focus-visible:after:scale-x-100 after:transition-transform after:duration-250 after:ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          Left Sweep
        </a>

        {/* Variant 2: Center outward */}
        <a
          href="#fx12-center"
          onClick={(e) => {
            e.preventDefault();
            setActiveLink('Center Out');
          }}
          className="relative py-1 text-sm font-medium text-zinc-900 whitespace-nowrap shrink-0 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-zinc-900 after:origin-center after:scale-x-0 hover:after:scale-x-100 focus-visible:after:scale-x-100 after:transition-transform after:duration-250 after:ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          Center Out
        </a>

        {/* Variant 3: Enter left, exit right */}
        <a
          href="#fx12-slide"
          onClick={(e) => {
            e.preventDefault();
            setActiveLink('Slide Across');
          }}
          className="relative py-1 text-sm font-medium text-zinc-900 whitespace-nowrap shrink-0 after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-full after:bg-[#2563EB] after:origin-right after:scale-x-0 hover:after:origin-left hover:after:scale-x-100 focus-visible:after:scale-x-100 after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)]"
        >
          Slide Across
        </a>
      </div>

      <span className="text-xs text-zinc-500">
        Last selected link: <span className="font-medium text-zinc-800">{activeLink}</span>
      </span>
    </div>
  );
}
