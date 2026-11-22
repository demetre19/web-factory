import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SlidersHorizontal, X } from 'lucide-react';
import { MorphComponentProps, useMorphState } from './types';

const OPTIONS = ['All', 'Active', 'Draft'];

export function Morph20({ morphed: controlled, onMorphedChange }: MorphComponentProps) {
  const [morphed, setMorphed] = useMorphState(controlled, onMorphedChange, true);
  const [selected, setSelected] = useState<string>('Active');

  return (
    <div className="flex items-center justify-center w-full">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        className={`bg-white border border-[#E5E5E0] shadow-sm overflow-hidden ${
          morphed ? 'rounded-2xl p-1.5 flex items-center gap-1.5' : 'rounded-full'
        }`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {!morphed ? (
            <motion.button
              key="chip"
              type="button"
              onClick={() => setMorphed(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#111110] hover:bg-[#FAFAF8] transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#6E6E68]" aria-hidden="true" />
              <span>Status: {selected}</span>
            </motion.button>
          ) : (
            <motion.div
              key="options"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
              className="flex items-center gap-1"
              role="group"
              aria-label="Status filter options"
            >
              <span className="pl-2 pr-1 text-[11px] font-medium text-[#6E6E68] whitespace-nowrap">
                Status
              </span>
              {OPTIONS.map((option) => {
                const isActive = selected === option;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setSelected(option)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                      isActive
                        ? 'bg-[#111110] text-white'
                        : 'text-[#52524E] hover:bg-[#F4F4F0] hover:text-[#111110]'
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setMorphed(false)}
                aria-label="Collapse filter options"
                className="p-1.5 rounded-xl text-[#6E6E68] hover:text-[#111110] hover:bg-[#F4F4F0] transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
