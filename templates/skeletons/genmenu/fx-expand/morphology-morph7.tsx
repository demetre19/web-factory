import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Minimize2 } from 'lucide-react';
import { MorphComponentProps, useMorphState } from './types';

export function Morph7({ morphed: controlled, onMorphedChange }: MorphComponentProps) {
  const [morphed, setMorphed] = useMorphState(controlled, onMorphedChange, true);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="flex items-center justify-center w-full">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        className={`bg-white border border-[#E5E5E0] rounded-2xl overflow-hidden ${
          morphed ? 'w-[272px] shadow-md' : 'w-[248px] shadow-sm'
        }`}
      >
        {!morphed ? (
          <button
            type="button"
            onClick={() => setMorphed(true)}
            className="w-full p-2.5 flex items-center gap-3 text-left hover:bg-[#FAFAF8] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
          >
            <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#EFEFEA] shrink-0 flex items-center justify-center">
              {!imgError ? (
                <img
                  src="/src/assets/images/card_object_study_1795325693714.jpg"
                  alt="Acoustic Dial hardware object"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[11px] font-mono text-[#6E6E68]">01</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-[#111110] truncate">Acoustic Dial 01</div>
              <div className="text-xs text-[#6E6E68] truncate">Hardware · Click to expand</div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-[#6E6E68] shrink-0" aria-hidden="true" />
          </button>
        ) : (
          <div>
            <div className="relative h-24 w-full bg-[#EFEFEA] overflow-hidden">
              {!imgError ? (
                <img
                  src="/src/assets/images/card_object_study_1795325693714.jpg"
                  alt="Acoustic Dial hardware object"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-[#6E6E68]">
                  Acoustic Dial Study
                </div>
              )}
              <button
                type="button"
                onClick={() => setMorphed(false)}
                aria-label="Collapse detail card"
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 text-[#111110] hover:bg-white shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              >
                <Minimize2 className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
            <div className="p-3.5">
              <div className="flex items-baseline justify-between gap-2">
                <h4 className="text-sm font-semibold text-[#111110]">Acoustic Dial 01</h4>
                <span className="text-xs font-mono tabular-nums text-[#6E6E68]">$320</span>
              </div>
              <p className="mt-0.5 text-[11px] text-[#6E6E68]">
                Milled Aluminum · Matte Ceramic
              </p>
              <p className="mt-2 text-xs leading-relaxed text-[#454542]">
                Detented rotary controller with damped magnetic inertia and balanced acoustic chamber.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
