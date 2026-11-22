import { motion } from 'motion/react';
import { MorphComponentProps, useMorphState } from './types';

export function Morph5({ morphed: controlled, onMorphedChange }: MorphComponentProps) {
  const [morphed, setMorphed] = useMorphState(controlled, onMorphedChange, true);

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => setMorphed()}
        aria-label={morphed ? 'Close navigation menu (X shown)' : 'Open navigation menu (Hamburger shown)'}
        aria-pressed={morphed}
        className="w-16 h-16 rounded-2xl bg-white border border-[#E5E5E0] shadow-sm hover:border-[#CFCFC8] flex items-center justify-center cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
      >
        <div className="relative w-6 h-6 flex items-center justify-center" aria-hidden="true">
          <motion.span
            initial={false}
            animate={morphed ? { y: 0, rotate: 45 } : { y: -6, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="absolute w-5 h-[2.2px] bg-[#111110] rounded-full origin-center"
          />
          <motion.span
            initial={false}
            animate={morphed ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.14 }}
            className="absolute w-5 h-[2.2px] bg-[#111110] rounded-full origin-center"
          />
          <motion.span
            initial={false}
            animate={morphed ? { y: 0, rotate: -45 } : { y: 6, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="absolute w-5 h-[2.2px] bg-[#111110] rounded-full origin-center"
          />
        </div>
      </button>
      <span className="text-xs font-medium text-[#5C5C57]">
        {morphed ? 'X State (Open)' : 'Hamburger State'}
      </span>
    </div>
  );
}
