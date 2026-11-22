import { motion, AnimatePresence } from 'motion/react';
import { MorphComponentProps, useMorphState } from './types';

export function Morph12({ morphed: controlled, onMorphedChange }: MorphComponentProps) {
  const [morphed, setMorphed] = useMorphState(controlled, onMorphedChange, true);

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.button
        type="button"
        onClick={() => setMorphed()}
        aria-label={morphed ? 'Loading in progress, click to reset button' : 'Deploy build'}
        aria-busy={morphed}
        animate={{
          width: morphed ? 44 : 168,
          borderRadius: morphed ? 9999 : 12,
        }}
        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        className="h-11 bg-[#111110] hover:bg-[#272725] text-white flex items-center justify-center overflow-hidden shadow-sm cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563EB]"
      >
        <AnimatePresence mode="wait" initial={false}>
          {morphed ? (
            <motion.span
              key="spinner"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.14 }}
              className="inline-flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 animate-spin text-white"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeOpacity="0.22"
                  strokeWidth="2.5"
                />
                <path
                  d="M21 12a9 9 0 0 0-9-9"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </motion.span>
          ) : (
            <motion.span
              key="label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="text-sm font-medium whitespace-nowrap px-4"
            >
              Deploy Build
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
      <span className="text-[11px] text-[#6E6E68]">
        {morphed ? 'Shrunk to Spinner · Click to reset' : 'Idle Button · Click to load'}
      </span>
    </div>
  );
}
