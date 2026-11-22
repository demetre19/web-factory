import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Search, X } from 'lucide-react';
import { MorphComponentProps, useMorphState } from './types';

export function Morph8({ morphed: controlled, onMorphedChange }: MorphComponentProps) {
  const [morphed, setMorphed] = useMorphState(controlled, onMorphedChange, true);
  const [query, setQuery] = useState('spring curve');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpen = () => {
    setMorphed(true);
    setTimeout(() => inputRef.current?.focus(), 140);
  };

  return (
    <div className="flex items-center justify-center w-full">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        className={`h-11 bg-white border border-[#E5E5E0] shadow-sm flex items-center overflow-hidden ${
          morphed ? 'w-[256px] rounded-xl px-3 gap-2' : 'w-11 rounded-full justify-center'
        }`}
      >
        {!morphed ? (
          <button
            type="button"
            onClick={handleOpen}
            aria-label="Expand search input"
            aria-expanded={false}
            className="w-full h-full flex items-center justify-center text-[#111110] hover:text-[#2563EB] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-full"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
          </button>
        ) : (
          <>
            <Search className="w-4 h-4 text-[#6E6E68] shrink-0" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search interactions..."
              aria-label="Search interactions"
              className="w-full min-w-0 bg-transparent text-xs text-[#111110] placeholder:text-[#8E8E87] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setMorphed(false)}
              aria-label="Collapse search input"
              className="p-1 rounded-md text-[#6E6E68] hover:text-[#111110] hover:bg-[#F4F4F0] transition-colors shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
