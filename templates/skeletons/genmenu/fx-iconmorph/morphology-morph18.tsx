import { motion, AnimatePresence } from 'motion/react';
import { MorphComponentProps, useMorphState } from './types';

export function Morph18({ morphed: controlled, onMorphedChange }: MorphComponentProps) {
  const [morphed, setMorphed] = useMorphState(controlled, onMorphedChange, true);
  const count = morphed ? 128 : 127;

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => setMorphed()}
        aria-pressed={morphed}
        aria-label={morphed ? `Liked, ${count} likes` : `Like, ${count} likes`}
        className={`relative inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48] ${
          morphed
            ? 'bg-[#FFF1F2] border-[#FECDD3] text-[#BE123C]'
            : 'bg-white border-[#E5E5E0] text-[#3F3F3C] hover:border-[#CFCFC8]'
        }`}
      >
        <div className="relative w-5 h-5 flex items-center justify-center">
          <AnimatePresence>
            {morphed && (
              <motion.span
                initial={{ scale: 0.4, opacity: 0.85 }}
                animate={{ scale: 1.85, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="absolute inset-0 rounded-full border-2 border-[#E11D48]"
                aria-hidden="true"
              />
            )}
          </AnimatePresence>
          <motion.svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            aria-hidden="true"
            animate={{ scale: morphed ? [1, 1.28, 1] : 1 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <path
              d="M12 20.5s-7.5-4.7-9.6-9.1C.8 8.1 2.7 4.5 6.3 4.5c2 0 3.7 1 4.7 2.5 1-1.5 2.7-2.5 4.7-2.5 3.6 0 5.5 3.6 3.9 6.9-2.1 4.4-9.6 9.1-9.6 9.1Z"
              fill={morphed ? '#E11D48' : 'transparent'}
              stroke={morphed ? '#E11D48' : '#6E6E68'}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </motion.svg>
        </div>

        <span className="text-sm font-semibold font-mono tabular-nums">{count}</span>
      </button>
      <span className="text-[11px] text-[#6E6E68]">
        {morphed ? 'Liked Fill State · Click to unlike' : 'Unliked Outline · Click to like'}
      </span>
    </div>
  );
}
