import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X } from 'lucide-react';
import { MorphComponentProps, useMorphState } from './types';

const INITIAL_ITEMS = [
  { id: '1', title: 'Token PR #42 merged', time: '2m ago' },
  { id: '2', title: 'Motion spec reviewed', time: '14m ago' },
];

export function Morph19({ morphed: controlled, onMorphedChange }: MorphComponentProps) {
  const [morphed, setMorphed] = useMorphState(controlled, onMorphedChange, true);
  const [unread, setUnread] = useState(true);

  return (
    <div className="flex items-center justify-center w-full h-full min-h-[195px]">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        className={
          morphed
            ? 'w-[260px] bg-white border border-[#E5E5E0] rounded-2xl shadow-lg overflow-hidden'
            : 'bg-white border border-[#E5E5E0] rounded-full shadow-sm overflow-visible'
        }
      >
        <AnimatePresence mode="wait" initial={false}>
          {!morphed ? (
            <motion.button
              key="dot"
              type="button"
              onClick={() => setMorphed(true)}
              aria-label="Open notifications panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="relative w-11 h-11 flex items-center justify-center text-[#111110] hover:bg-[#FAFAF8] rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              <Bell className="w-4 h-4" aria-hidden="true" />
              {unread && (
                <span
                  className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-[#E11D48] ring-2 ring-white"
                  aria-label="Unread notifications"
                />
              )}
            </motion.button>
          ) : (
            <motion.div
              key="panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.14 }}
            >
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#EFEFEA] bg-[#FAFAF8]">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#111110]">Notifications</span>
                  <span className="text-[11px] font-mono tabular-nums text-[#6E6E68]">
                    {unread ? '2 new' : '0 new'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setUnread(false)}
                    className="px-1.5 py-0.5 text-[11px] font-medium text-[#2563EB] hover:bg-[#2563EB]/10 rounded cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setMorphed(false)}
                    aria-label="Collapse notifications panel"
                    className="p-1 rounded-md text-[#6E6E68] hover:text-[#111110] hover:bg-[#EFEFEA] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="divide-y divide-[#F2F2ED]">
                {INITIAL_ITEMS.map((item) => (
                  <div key={item.id} className="px-3.5 py-2.5 flex items-baseline justify-between gap-2">
                    <span className="text-xs text-[#111110] font-medium truncate">
                      {item.title}
                    </span>
                    <span className="text-[11px] text-[#6E6E68] whitespace-nowrap shrink-0">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
