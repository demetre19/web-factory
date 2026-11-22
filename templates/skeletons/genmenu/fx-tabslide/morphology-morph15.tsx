import { useState } from 'react';
import { motion } from 'motion/react';
import { computeMidSlideIndicator } from '../../utils/morphCatalog';
import { MorphComponentProps, useMorphState } from './types';

const SEGMENTS = ['Day', 'Week', 'Year'];

export function Morph15({ morphed: controlled, onMorphedChange }: MorphComponentProps) {
  const [morphed, setMorphed] = useMorphState(controlled, onMorphedChange, true);
  const [selectedIndex, setSelectedIndex] = useState<number>(1);

  const geometry = morphed
    ? computeMidSlideIndicator(0, 1, 0.48, SEGMENTS.length)
    : computeMidSlideIndicator(selectedIndex, selectedIndex, 1, SEGMENTS.length);

  const handleSelect = (idx: number) => {
    setSelectedIndex(idx);
    if (morphed) {
      setMorphed(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full">
      <div
        role="radiogroup"
        aria-label="Billing interval"
        className="relative grid grid-cols-3 w-[252px] p-1 bg-[#EAEAE4] rounded-xl"
      >
        <div className="relative col-span-3 grid grid-cols-3">
          <motion.div
            aria-hidden="true"
            animate={{
              left: `${geometry.leftPercent}%`,
              width: `${geometry.widthPercent}%`,
            }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="absolute top-0 bottom-0 bg-white rounded-lg shadow-sm border border-[#DFDFD8]"
          />
          {SEGMENTS.map((label, idx) => {
            const isHighlighted = morphed ? idx === 0 || idx === 1 : selectedIndex === idx;
            return (
              <button
                key={label}
                type="button"
                role="radio"
                aria-checked={!morphed && selectedIndex === idx}
                onClick={() => handleSelect(idx)}
                className={`relative z-10 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                  isHighlighted ? 'text-[#111110] font-semibold' : 'text-[#6E6E68] hover:text-[#111110]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setMorphed(!morphed)}
        className="text-[11px] font-medium text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
      >
        {morphed ? 'Indicator mid-slide · Click segment to land' : 'Show mid-slide stretch'}
      </button>
    </div>
  );
}
