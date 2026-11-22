import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, SlidersHorizontal, LogOut } from 'lucide-react';
import { MorphComponentProps, useMorphState } from './types';

export function Morph10({ morphed: controlled, onMorphedChange }: MorphComponentProps) {
  const [morphed, setMorphed] = useMorphState(controlled, onMorphedChange, true);
  const [imgError, setImgError] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string>('Profile');

  return (
    <div className="relative flex flex-col items-center justify-start pt-2 w-full h-full min-h-[210px]">
      <motion.button
        type="button"
        onClick={() => setMorphed()}
        aria-label={morphed ? 'Close account menu' : 'Open account menu'}
        aria-expanded={morphed}
        animate={{ scale: morphed ? 1.05 : 1 }}
        transition={{ type: 'spring', stiffness: 450, damping: 28 }}
        className={`relative w-11 h-11 rounded-full overflow-hidden bg-[#EFEFEA] flex items-center justify-center cursor-pointer transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
          morphed ? 'ring-2 ring-[#2563EB] ring-offset-2 ring-offset-[#FAFAF8]' : 'ring-1 ring-[#E5E5E0]'
        }`}
      >
        {!imgError ? (
          <img
            src="/src/assets/images/avatar_designer_portrait_1795325694107.jpg"
            alt="Elena Rostova"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs font-semibold text-[#111110]">ER</span>
        )}
      </motion.button>

      <AnimatePresence>
        {morphed && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            style={{ transformOrigin: 'top center' }}
            role="menu"
            aria-label="Account menu"
            className="mt-2.5 w-48 bg-white border border-[#E5E5E0] rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-[#EFEFEA]">
              <div className="text-xs font-semibold text-[#111110] truncate">Elena Rostova</div>
              <div className="text-[11px] text-[#6E6E68] truncate">elena@morphology.studio</div>
            </div>
            <div className="p-1">
              {[
                { id: 'Profile', icon: User },
                { id: 'Preferences', icon: SlidersHorizontal },
                { id: 'Sign Out', icon: LogOut },
              ].map((item) => {
                const Icon = item.icon;
                const active = selectedAction === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setSelectedAction(item.id);
                      if (item.id === 'Sign Out') setMorphed(false);
                    }}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-[#2563EB]/10 text-[#2563EB]'
                        : 'text-[#3F3F3C] hover:bg-[#F5F5F2] hover:text-[#111110]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>{item.id}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
