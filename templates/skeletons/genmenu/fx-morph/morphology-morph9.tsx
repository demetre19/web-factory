import { motion } from 'motion/react';
import { Check, Plus, X } from 'lucide-react';
import { MorphComponentProps, useMorphState } from './types';

export function Morph9({ morphed: controlled, onMorphedChange }: MorphComponentProps) {
  const [morphed, setMorphed] = useMorphState(controlled, onMorphedChange, true);

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 440, damping: 30 }}
        className={`inline-flex items-center rounded-full border transition-colors ${
          morphed
            ? 'bg-[#111110] border-[#111110] text-white pl-3 pr-2 py-1.5 gap-2 shadow-sm'
            : 'bg-white border-dashed border-[#C7C7C0] text-[#3F3F3C] px-3.5 py-1.5 gap-1.5 hover:border-[#111110]'
        }`}
      >
        {!morphed ? (
          <button
            type="button"
            onClick={() => setMorphed(true)}
            className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] rounded-full"
          >
            <Plus className="w-3.5 h-3.5 text-[#6E6E68]" aria-hidden="true" />
            <span>Interactive</span>
          </button>
        ) : (
          <>
            <Check className="w-3.5 h-3.5 text-[#60A5FA]" aria-hidden="true" />
            <span className="text-xs font-medium">Interactive</span>
            <button
              type="button"
              onClick={() => setMorphed(false)}
              aria-label="Remove Interactive tag"
              className="p-0.5 rounded-full hover:bg-white/15 text-white/75 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#60A5FA]"
            >
              <X className="w-3 h-3" aria-hidden="true" />
            </button>
          </>
        )}
      </motion.div>
      <span className="text-[11px] text-[#6E6E68]">
        {morphed ? 'Selected Tag · Click × to revert' : 'Suggestion Chip · Click to apply'}
      </span>
    </div>
  );
}
