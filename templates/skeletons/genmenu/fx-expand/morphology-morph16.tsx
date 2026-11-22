import { motion, AnimatePresence } from 'motion/react';
import { MorphComponentProps, useMorphState } from './types';

export function Morph16({ morphed: controlled, onMorphedChange }: MorphComponentProps) {
  const [morphed, setMorphed] = useMorphState(controlled, onMorphedChange, true);

  return (
    <div className="flex items-center justify-center w-full">
      <div className="w-[268px] bg-white border border-[#E5E5E0] rounded-2xl shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setMorphed()}
          aria-expanded={morphed}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#FAFAF8] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
        >
          <span className="text-xs font-semibold text-[#111110]">
            Critically damped springs
          </span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="shrink-0 text-[#111110]"
            aria-hidden="true"
          >
            <line
              x1="3"
              y1="8"
              x2="13"
              y2="8"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <motion.line
              x1="8"
              y1="3"
              x2="8"
              y2="13"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              animate={{
                rotate: morphed ? 90 : 0,
                opacity: morphed ? 0 : 1,
              }}
              style={{ originX: '8px', originY: '8px' }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            />
          </svg>
        </button>

        <AnimatePresence initial={false}>
          {morphed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-3.5 pt-1 text-xs leading-relaxed text-[#5C5C57] border-t border-[#EFEFEA]">
                Settles into the target state without overshoot while preserving tactile velocity.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
