import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Copy, Download, Link2, Archive, X } from 'lucide-react';
import { MorphComponentProps, useMorphState } from './types';

const MENU_ITEMS = [
  { id: 'duplicate', label: 'Duplicate Component', icon: Copy },
  { id: 'export', label: 'Export JSON Spec', icon: Download },
  { id: 'share', label: 'Copy Share Link', icon: Link2 },
  { id: 'archive', label: 'Archive Study', icon: Archive },
];

export function Morph1({ morphed: controlled, onMorphedChange }: MorphComponentProps) {
  const [morphed, setMorphed] = useMorphState(controlled, onMorphedChange, true);
  const [selectedItem, setSelectedItem] = useState<string>('duplicate');

  return (
    <div className="flex items-center justify-center w-full h-full">
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        className={
          morphed
            ? 'w-56 bg-white border border-[#E5E5E0] rounded-2xl shadow-lg overflow-hidden'
            : 'bg-[#111110] rounded-xl shadow-sm overflow-hidden'
        }
      >
        <AnimatePresence mode="wait" initial={false}>
          {!morphed ? (
            <motion.button
              key="trigger"
              type="button"
              onClick={() => setMorphed(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
              aria-expanded={false}
            >
              <span>Actions</span>
              <ChevronDown className="w-4 h-4 text-white/75" aria-hidden="true" />
            </motion.button>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              role="menu"
              aria-label="Actions menu"
            >
              <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#EFEFEA] bg-[#FAFAF8]">
                <span className="text-xs font-semibold text-[#111110]">Actions</span>
                <button
                  type="button"
                  onClick={() => setMorphed(false)}
                  aria-label="Collapse actions menu"
                  className="p-1 rounded-md text-[#6E6E68] hover:text-[#111110] hover:bg-[#EFEFEA] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                >
                  <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>
              <div className="p-1.5 flex flex-col gap-0.5">
                {MENU_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = selectedItem === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="menuitem"
                      onClick={() => setSelectedItem(item.id)}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] ${
                        isActive
                          ? 'bg-[#2563EB]/10 text-[#2563EB]'
                          : 'text-[#3F3F3C] hover:bg-[#F5F5F2] hover:text-[#111110]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
