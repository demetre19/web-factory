import { motion } from 'motion/react';
import { MorphComponentProps, useMorphState } from './types';

export function Morph14({ morphed: controlled, onMorphedChange }: MorphComponentProps) {
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
        aria-label={morphed ? 'Brand emblem morphed state' : 'Brand emblem resting state'}
        className="p-4 rounded-2xl bg-white border border-[#E5E5E0] shadow-sm hover:border-[#CFCFC8] flex items-center gap-3.5 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
      >
        <motion.div
          animate={{ rotate: morphed ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
          className="relative w-10 h-10 shrink-0"
          aria-hidden="true"
        >
          <motion.div
            animate={{
              x: morphed ? -1.5 : 0,
              y: morphed ? -1.5 : 0,
              borderRadius: morphed ? '9999px' : '4px',
              backgroundColor: morphed ? '#2563EB' : '#111110',
            }}
            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
            className="absolute top-0.5 left-0.5 w-4 h-4"
          />
          <motion.div
            animate={{
              x: morphed ? 1.5 : 0,
              y: morphed ? -1.5 : 0,
              scale: morphed ? 0.82 : 1,
              borderRadius: morphed ? '2px' : '4px',
              backgroundColor: '#111110',
            }}
            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
            className="absolute top-0.5 right-0.5 w-4 h-4"
          />
          <motion.div
            animate={{
              x: morphed ? -1.5 : 0,
              y: morphed ? 1.5 : 0,
              scale: morphed ? 0.82 : 1,
              borderRadius: morphed ? '2px' : '4px',
              backgroundColor: '#111110',
            }}
            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
            className="absolute bottom-0.5 left-0.5 w-4 h-4"
          />
          <motion.div
            animate={{
              x: morphed ? 1.5 : 0,
              y: morphed ? 1.5 : 0,
              borderRadius: morphed ? '9999px' : '4px',
              backgroundColor: morphed ? '#2563EB' : '#111110',
            }}
            transition={{ type: 'spring', stiffness: 360, damping: 26 }}
            className="absolute bottom-0.5 right-0.5 w-4 h-4"
          />
        </motion.div>

        <div className="text-left">
          <div className="text-sm font-semibold tracking-tight text-[#111110]">Kinetix</div>
          <div className="text-[11px] text-[#6E6E68]">
            {morphed ? 'Aperture State' : 'Grid State'}
          </div>
        </div>
      </button>
      <span className="text-[11px] text-[#6E6E68]">
        {morphed ? 'Morphed on Hover · Click to rest' : 'Hover or click to morph mark'}
      </span>
    </div>
  );
}
