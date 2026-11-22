import { useState } from 'react';

const ITEMS = [
  { id: 0, code: 'A', title: 'Timber Hall', bg: 'from-[#78350F] to-[#D97706]' },
  { id: 1, code: 'B', title: 'Slate Vault', bg: 'from-[#1E293B] to-[#475569]' },
  { id: 2, code: 'C', title: 'Lapis Wing', bg: 'from-[#1E3A8A] to-[#3B82F6]' },
  { id: 3, code: 'D', title: 'Moss Atrium', bg: 'from-[#064E3B] to-[#10B981]' },
];

export function Icfx14() {
  const [activeId, setActiveId] = useState(1);

  return (
    <div className="w-full">
      <div className="flex h-64 w-full gap-2 overflow-hidden">
        {ITEMS.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onMouseEnter={() => setActiveId(item.id)}
              onFocus={() => setActiveId(item.id)}
              onClick={() => setActiveId(item.id)}
              aria-pressed={isActive}
              aria-label={`Expand ${item.title}`}
              className={`relative h-full overflow-hidden rounded-xl border border-stone-200 bg-gradient-to-b ${item.bg} text-left transition-[flex-grow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1D4ED8] ${
                isActive ? 'flex-[2.6]' : 'flex-[0.85]'
              }`}
            >
              <svg viewBox="0 0 220 260" preserveAspectRatio="xMidYMid slice" className="h-full w-full opacity-45" aria-hidden="true">
                <circle cx="110" cy="100" r="46" fill="none" stroke="#FFFFFF" strokeWidth="1.2" />
                <line x1="0" y1="185" x2="220" y2="185" stroke="#FFFFFF" strokeOpacity="0.4" />
              </svg>
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 font-mono text-xs font-semibold text-white/90">
                {item.code}
              </div>
              <div
                className={`absolute inset-x-3 bottom-3 transition-opacity duration-300 ${
                  isActive ? 'opacity-100' : 'opacity-70'
                }`}
              >
                <div className="truncate text-sm font-semibold text-white">{item.title}</div>
                {isActive && (
                  <div className="mt-0.5 truncate font-mono text-[11px] text-white/80">
                    EXPANDED · 2.6×
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Icfx14;
