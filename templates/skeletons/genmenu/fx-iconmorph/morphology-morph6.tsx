import { motion } from 'motion/react';
import { MorphComponentProps, useMorphState } from './types';

// Both polygons share 4 vertices so Motion interpolates SVG paths directly
const PLAY_LEFT = 'M 6 4 L 13 8 L 13 16 L 6 20 Z';
const PLAY_RIGHT = 'M 13 8 L 20 12 L 20 12 L 13 16 Z';

const PAUSE_LEFT = 'M 6 5 L 10 5 L 10 19 L 6 19 Z';
const PAUSE_RIGHT = 'M 14 5 L 18 5 L 18 19 L 14 19 Z';

export function Morph6({ morphed: controlled, onMorphedChange }: MorphComponentProps) {
  const [morphed, setMorphed] = useMorphState(controlled, onMorphedChange, true);

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => setMorphed()}
        aria-label={morphed ? 'Pause playback (Pause icon shown)' : 'Start playback (Play icon shown)'}
        aria-pressed={morphed}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563EB] ${
          morphed
            ? 'bg-[#111110] text-white hover:bg-[#272725]'
            : 'bg-white border border-[#E5E5E0] text-[#111110] hover:border-[#CFCFC8]'
        }`}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <motion.path
            initial={false}
            animate={{ d: morphed ? PAUSE_LEFT : PLAY_LEFT }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          />
          <motion.path
            initial={false}
            animate={{ d: morphed ? PAUSE_RIGHT : PLAY_RIGHT }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          />
        </svg>
      </button>
      <span className="text-xs font-medium text-[#5C5C57]">
        {morphed ? 'Pause State (Playing)' : 'Play State (Paused)'}
      </span>
    </div>
  );
}
