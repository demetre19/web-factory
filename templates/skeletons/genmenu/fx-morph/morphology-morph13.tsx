import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { MorphComponentProps, useMorphState } from './types';

export function Morph13({ morphed: controlled, onMorphedChange }: MorphComponentProps) {
  const [morphed, setMorphed] = useMorphState(controlled, onMorphedChange, true);

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <a
        href="#read-motion-spec"
        onClick={(e) => {
          e.preventDefault();
          setMorphed();
        }}
        onMouseEnter={() => setMorphed(true)}
        onMouseLeave={() => {
          if (controlled === undefined) setMorphed(false);
        }}
        className="group relative inline-flex items-center gap-2 py-1 text-base font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded"
      >
        <span
          className={`transition-colors duration-200 ${
            morphed ? 'text-[#2563EB]' : 'text-[#111110]'
          }`}
        >
          Read Motion Guidelines
        </span>
        <motion.span
          animate={{ x: morphed ? 4 : 0 }}
          transition={{ type: 'spring', stiffness: 440, damping: 28 }}
          className={morphed ? 'text-[#2563EB]' : 'text-[#6E6E68]'}
        >
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </motion.span>

        <motion.span
          aria-hidden="true"
          animate={{ scaleX: morphed ? 1 : 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          style={{ originX: 0 }}
          className="absolute left-0 right-0 bottom-0 h-[2px] bg-[#2563EB] rounded-full"
        />
      </a>
      <button
        type="button"
        onClick={() => setMorphed()}
        className="text-[11px] text-[#6E6E68] hover:text-[#111110] cursor-pointer"
      >
        {morphed ? 'Underline Grown · Click to retract' : 'Resting Link · Click or hover to grow'}
      </button>
    </div>
  );
}
