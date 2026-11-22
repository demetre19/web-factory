import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, PenLine, Share2, Bookmark } from 'lucide-react';
import { MorphComponentProps, useMorphState } from './types';

const FAN_ACTIONS = [
  { id: 'note', label: 'Note', icon: PenLine, x: -102, y: -6 },
  { id: 'share', label: 'Share', icon: Share2, x: -76, y: -74 },
  { id: 'bookmark', label: 'Save', icon: Bookmark, x: -6, y: -102 },
];

export function Morph3({ morphed: controlled, onMorphedChange }: MorphComponentProps) {
  const [morphed, setMorphed] = useMorphState(controlled, onMorphedChange, true);
  const [lastAction, setLastAction] = useState<string>('Share');

  return (
    <div className="relative w-full h-full min-h-[200px] flex items-end justify-end p-4">
      <div className="self-start mr-auto text-xs font-medium text-[#52524E]">
        {morphed ? `Action · ${lastAction}` : 'Tap + to fan actions'}
      </div>

      <div className="relative w-12 h-12">
        <AnimatePresence>
          {morphed &&
            FAN_ACTIONS.map((action, index) => {
              const Icon = action.icon;
              const isSelected = lastAction === action.label;
              return (
                <motion.button
                  key={action.id}
                  type="button"
                  aria-label={action.label}
                  title={action.label}
                  onClick={() => setLastAction(action.label)}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                  animate={{ opacity: 1, x: action.x, y: action.y, scale: 1 }}
                  exit={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                  transition={{
                    type: 'spring',
                    stiffness: 420,
                    damping: 26,
                    delay: index * 0.03,
                  }}
                  className={`group absolute inset-0 w-10 h-10 m-auto rounded-full border shadow-md flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                    isSelected
                      ? 'bg-[#2563EB] border-[#2563EB] text-white'
                      : 'bg-white border-[#E5E5E0] text-[#111110] hover:bg-[#F5F5F2]'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </motion.button>
              );
            })}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={() => setMorphed()}
          aria-label={morphed ? 'Close quick actions' : 'Open quick actions'}
          aria-expanded={morphed}
          animate={{
            rotate: morphed ? 45 : 0,
            backgroundColor: morphed ? '#2563EB' : '#111110',
          }}
          transition={{ type: 'spring', stiffness: 450, damping: 28 }}
          className="relative z-10 w-12 h-12 rounded-full text-white shadow-lg flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2563EB]"
        >
          <Plus className="w-5 h-5" aria-hidden="true" />
        </motion.button>
      </div>
    </div>
  );
}
