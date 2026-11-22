import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { MorphComponentProps, useMorphState } from './types';

export function Morph17({ morphed: controlled, onMorphedChange }: MorphComponentProps) {
  const [morphed, setMorphed] = useMorphState(controlled, onMorphedChange, true);

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => setMorphed()}
        onMouseEnter={() => setMorphed(true)}
        onMouseLeave={() => {
          if (controlled === undefined) setMorphed(false);
        }}
        aria-label={morphed ? 'Start Pro Trial for $24 per month' : 'Price $24 per month'}
        className={`relative w-48 h-12 rounded-xl overflow-hidden border transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
          morphed
            ? 'bg-[#111110] border-[#111110] text-white shadow-md'
            : 'bg-white border-[#E5E5E0] text-[#111110] shadow-sm'
        }`}
      >
        <motion.div
          animate={{ y: morphed ? -48 : 0, opacity: morphed ? 0 : 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute inset-0 flex items-center justify-center gap-1"
        >
          <span className="text-base font-semibold font-mono tabular-nums">$24</span>
          <span className="text-xs text-[#6E6E68]">/ month</span>
        </motion.div>

        <motion.div
          animate={{ y: morphed ? 0 : 48, opacity: morphed ? 1 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="absolute inset-0 flex items-center justify-center gap-2 text-sm font-medium"
        >
          <span>Start Pro Trial</span>
          <ArrowRight className="w-4 h-4 text-[#60A5FA]" aria-hidden="true" />
        </motion.div>
      </button>
      <span className="text-[11px] text-[#6E6E68]">
        {morphed ? 'CTA Morphed · Click to show price' : 'Hover or click to morph to CTA'}
      </span>
    </div>
  );
}
