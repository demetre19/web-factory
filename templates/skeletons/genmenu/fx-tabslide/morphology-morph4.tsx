import { useState } from 'react';
import { motion } from 'motion/react';
import { computeMidSlideIndicator } from '../../utils/morphCatalog';
import { MorphComponentProps, useMorphState } from './types';

const TABS = ['Design', 'Motion', 'Code'];

export function Morph4({ morphed: controlled, onMorphedChange }: MorphComponentProps) {
  const [morphed, setMorphed] = useMorphState(controlled, onMorphedChange, true);
  const [activeTab, setActiveTab] = useState<number>(0);

  // When morphed=true (showcase default), show the gooey blob visibly mid-slide between Tab 0 and Tab 1
  const leadGeo = morphed
    ? computeMidSlideIndicator(0, 1, 0.54, TABS.length)
    : computeMidSlideIndicator(activeTab, activeTab, 1, TABS.length);

  const trailGeo = morphed
    ? computeMidSlideIndicator(0, 1, 0.22, TABS.length)
    : computeMidSlideIndicator(activeTab, activeTab, 1, TABS.length);

  const handleTabClick = (idx: number) => {
    setActiveTab(idx);
    if (morphed) {
      setMorphed(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 w-full">
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="morph4-goo-filter">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div
        role="tablist"
        aria-label="Gooey tab navigation"
        className="relative grid grid-cols-3 w-[264px] p-1 bg-[#EAEAE4] rounded-full"
      >
        <div
          className="absolute inset-1 pointer-events-none"
          style={{ filter: 'url(#morph4-goo-filter)' }}
          aria-hidden="true"
        >
          <motion.div
            animate={{
              left: `${leadGeo.leftPercent}%`,
              width: `${leadGeo.widthPercent}%`,
            }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
            className="absolute top-0 bottom-0 rounded-full bg-[#93C5FD]"
          />
          <motion.div
            animate={{
              left: `${trailGeo.leftPercent}%`,
              width: `${trailGeo.widthPercent * 0.78}%`,
            }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="absolute top-0.5 bottom-0.5 rounded-full bg-[#93C5FD]"
          />
        </div>

        {TABS.map((tab, idx) => {
          const isHighlighted = morphed ? idx === 0 || idx === 1 : activeTab === idx;
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={!morphed && activeTab === idx}
              onClick={() => handleTabClick(idx)}
              className={`relative z-10 py-2 text-xs rounded-full transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                isHighlighted
                  ? 'text-[#0F172A] font-semibold'
                  : 'text-[#52524E] font-medium hover:text-[#111110]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setMorphed(!morphed)}
        className="text-[11px] font-medium text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer"
      >
        {morphed ? 'Mid-slide stretched · Click tab to settle' : 'Hold mid-slide bridge'}
      </button>
    </div>
  );
}
