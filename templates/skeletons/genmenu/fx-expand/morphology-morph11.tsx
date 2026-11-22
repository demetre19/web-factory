import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, BookOpen, Compass, Sparkles } from 'lucide-react';
import { MorphComponentProps, useMorphState } from './types';

const LINKS = [
  { id: 'docs', label: 'Documentation', detail: 'Tokens & primitives', icon: BookOpen },
  { id: 'specs', label: 'Motion Specs', detail: 'Spring curves', icon: Compass },
  { id: 'changelog', label: 'Changelog', detail: 'Version 2.4 notes', icon: Sparkles },
];

export function Morph11({ morphed: controlled, onMorphedChange }: MorphComponentProps) {
  const [morphed, setMorphed] = useMorphState(controlled, onMorphedChange, true);
  const [activeLink, setActiveLink] = useState<string>('specs');

  return (
    <div className="flex flex-col items-center justify-start pt-2 w-full h-full min-h-[210px]">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className={`bg-white border border-[#E5E5E0] overflow-hidden ${
          morphed ? 'w-56 rounded-2xl shadow-lg' : 'rounded-full shadow-sm'
        }`}
      >
        <button
          type="button"
          onClick={() => setMorphed()}
          aria-expanded={morphed}
          className={`w-full flex items-center justify-between gap-2 px-4 py-2 text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
            morphed
              ? 'text-[#2563EB] bg-[#FAFAF8] border-b border-[#EFEFEA]'
              : 'text-[#111110] hover:bg-[#FAFAF8]'
          }`}
        >
          <span className="whitespace-nowrap">Resources</span>
          <motion.span
            animate={{ rotate: morphed ? 180 : 0 }}
            transition={{ duration: 0.18 }}
            className="inline-flex"
          >
            <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {morphed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="p-1.5 flex flex-col gap-0.5"
            >
              {LINKS.map((item) => {
                const Icon = item.icon;
                const isSelected = activeLink === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveLink(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      isSelected ? 'bg-[#2563EB]/10' : 'hover:bg-[#F5F5F2]'
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isSelected ? 'text-[#2563EB]' : 'text-[#6E6E68]'
                      }`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <div
                        className={`text-xs font-medium truncate ${
                          isSelected ? 'text-[#2563EB]' : 'text-[#111110]'
                        }`}
                      >
                        {item.label}
                      </div>
                      <div className="text-[11px] text-[#6E6E68] truncate">{item.detail}</div>
                    </div>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
