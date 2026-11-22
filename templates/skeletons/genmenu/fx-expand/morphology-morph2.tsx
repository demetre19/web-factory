import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { MorphComponentProps, useMorphState } from './types';

export function Morph2({ morphed: controlled, onMorphedChange }: MorphComponentProps) {
  const [morphed, setMorphed] = useMorphState(controlled, onMorphedChange, true);
  const [confirmed, setConfirmed] = useState(false);

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      setConfirmed(false);
      setMorphed(false);
    }, 500);
  };

  return (
    <div className="relative w-full h-full min-h-[210px] flex items-center justify-center rounded-xl overflow-hidden">
      <AnimatePresence>
        {morphed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setMorphed(false)}
            className="absolute inset-0 bg-[#111110]/10 backdrop-blur-[1px]"
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className={
          morphed
            ? 'relative z-10 w-[264px] bg-white border border-[#E5E5E0] rounded-2xl shadow-xl p-4'
            : 'relative z-10 bg-[#111110] rounded-xl shadow-sm'
        }
      >
        {!morphed ? (
          <button
            type="button"
            onClick={() => setMorphed(true)}
            className="px-4 py-2.5 text-sm font-medium text-white whitespace-nowrap cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            Publish Release
          </button>
        ) : (
          <div role="dialog" aria-modal="false" aria-labelledby="morph2-title">
            <div className="flex items-start justify-between gap-2">
              <h4 id="morph2-title" className="text-sm font-semibold text-[#111110]">
                Publish Release v2.4
              </h4>
              <button
                type="button"
                onClick={() => setMorphed(false)}
                aria-label="Close modal dialog"
                className="p-1 -mr-1 -mt-1 rounded-md text-[#6E6E68] hover:text-[#111110] hover:bg-[#F4F4F0] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-[#5C5C57]">
              Promote 20 verified component tokens to the production registry.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setMorphed(false)}
                className="px-3 py-1.5 text-xs font-medium text-[#5C5C57] hover:text-[#111110] rounded-lg hover:bg-[#F4F4F0] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors cursor-pointer"
              >
                {confirmed ? (
                  <>
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Published</span>
                  </>
                ) : (
                  <span>Confirm</span>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
