'use client';

import React, { useEffect, useState } from 'react';

export interface DrawerMenu13Props {
  defaultOpen?: boolean;
  triggerLabel?: string;
  onNavigate?: (label: string) => void;
  onCtaClick?: (label: string) => void;
}

const FILE_FOLDERS = [
  {
    folder: 'src',
    files: ['index.ts', 'router.ts', 'runtime.config.ts'],
  },
  {
    folder: 'components',
    files: ['CommandBar.tsx', 'SplitPane.tsx', 'TerminalView.tsx'],
  },
  {
    folder: 'docs',
    files: ['architecture.md', 'shortcuts.md'],
  },
];

export function DrawerMenu13({
  defaultOpen = false,
  triggerLabel = 'Open DrawerMenu13',
  onNavigate,
  onCtaClick,
}: DrawerMenu13Props) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [query, setQuery] = useState('');
  const [openFolders, setOpenFolders] = useState<string[]>(['src', 'components']);
  const [activeFile, setActiveFile] = useState('router.ts');
  const [ctaConfirmed, setCtaConfirmed] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const normalized = query.trim().toLowerCase();
  const visibleFolders = FILE_FOLDERS.map((group) => ({
    ...group,
    files: normalized
      ? group.files.filter(
          (f) =>
            f.toLowerCase().includes(normalized) ||
            group.folder.toLowerCase().includes(normalized)
        )
      : group.files,
  })).filter((group) => group.files.length > 0);

  const toggleFolder = (folder: string) => {
    setOpenFolders((prev) =>
      prev.includes(folder) ? prev.filter((f) => f !== folder) : [...prev, folder]
    );
  };

  const handleSelect = (event: React.MouseEvent<HTMLAnchorElement>, label: string) => {
    event.preventDefault();
    setActiveFile(label);
    onNavigate?.(label);
  };

  const handlePrimaryAction = () => {
    setCtaConfirmed(true);
    onCtaClick?.('Open Sandbox');
    window.setTimeout(() => setCtaConfirmed(false), 1800);
  };

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="drawer-menu-13"
        aria-label={triggerLabel}
        className="inline-flex items-center gap-2.5 rounded-lg border border-slate-800 bg-[#0D1117] px-4 py-2.5 text-sm font-mono font-medium text-[#E6EDF3] shadow-xs transition-colors hover:bg-[#161B22] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500 whitespace-nowrap"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        <span>{triggerLabel}</span>
      </button>

      <div
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-50 ${
          isOpen
            ? 'pointer-events-auto visible'
            : 'pointer-events-none invisible transition-[visibility] duration-200'
        }`}
      >
        <div
          onClick={() => setIsOpen(false)}
          className={`fixed inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <aside
          id="drawer-menu-13"
          role="dialog"
          aria-modal="true"
          aria-label="Kernel Studio file tree navigation"
          className={`fixed inset-y-0 left-0 flex w-[360px] max-w-[88vw] flex-col border-r border-[#30363D] bg-[#0D1117] text-[#E6EDF3] font-mono shadow-2xl transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="border-b border-[#30363D] px-4 pt-4 pb-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <a
                href="#kernel"
                onClick={(e) => handleSelect(e, 'Kernel Studio')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-white"
              >
                <span className="text-green-400">~/</span>
                <span>kernel-studio</span>
              </a>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close Kernel Studio explorer"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-[#8B949E] hover:bg-[#161B22] hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <label htmlFor="dm13-search" className="sr-only">
              Filter files and symbols
            </label>
            <div className="relative flex items-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true" className="pointer-events-none absolute left-3 text-[#8B949E]">
                <circle cx="11" cy="11" r="7" />
                <line x1="20" y1="20" x2="16" y2="16" />
              </svg>
              <input
                id="dm13-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter files, symbols..."
                className="w-full rounded-md border border-[#30363D] bg-[#010409] py-2 pl-8 pr-3 text-xs text-[#E6EDF3] placeholder:text-[#6E7681] focus:border-green-500 focus:outline-none"
              />
            </div>
          </div>

          <nav aria-label="Workspace file tree" className="flex-1 overflow-y-auto px-3 py-4 text-xs">
            <h2 className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8B949E]">
              Explorer
            </h2>

            {visibleFolders.length === 0 ? (
              <div className="px-3 py-6 text-center text-[#8B949E]">
                <p>No files match &ldquo;{query}&rdquo;.</p>
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="mt-2 text-green-400 underline"
                >
                  Clear filter
                </button>
              </div>
            ) : (
              <ul className="space-y-1">
                {visibleFolders.map((group) => {
                  const isOpenFolder =
                    normalized.length > 0 || openFolders.includes(group.folder);
                  return (
                    <li key={group.folder}>
                      <button
                        type="button"
                        onClick={() => toggleFolder(group.folder)}
                        aria-expanded={isOpenFolder}
                        className="flex min-h-[34px] w-full items-center gap-2 rounded px-2 py-1 text-left text-[#C9D1D9] hover:bg-[#161B22]"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" className={`text-[#8B949E] transition-transform ${isOpenFolder ? 'rotate-90' : ''}`}>
                          <polyline points="9 6 15 12 9 18" />
                        </svg>
                        <span className="font-semibold">{group.folder}/</span>
                      </button>

                      {isOpenFolder && (
                        <ul className="ml-3.5 border-l border-[#30363D] pl-2.5 space-y-0.5 my-0.5">
                          {group.files.map((file) => {
                            const isActive = activeFile === file;
                            return (
                              <li key={file}>
                                <a
                                  href={`#${group.folder}/${file}`}
                                  onClick={(e) => handleSelect(e, `${group.folder}/${file}`)}
                                  aria-current={isActive ? 'page' : undefined}
                                  className={`flex min-h-[34px] items-center justify-between rounded px-2.5 py-1 transition-colors ${
                                    isActive
                                      ? 'bg-green-500/15 text-green-300 font-semibold'
                                      : 'text-[#8B949E] hover:bg-[#161B22] hover:text-[#E6EDF3]'
                                  }`}
                                >
                                  <span>{file}</span>
                                  <span className="text-[10px] text-[#6E7681]">
                                    {file.endsWith('.md') ? 'MD' : 'TS'}
                                  </span>
                                </a>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </nav>

          <div className="border-t border-[#30363D] bg-[#161B22] p-4">
            <button
              type="button"
              onClick={handlePrimaryAction}
              className="w-full rounded-md bg-green-500 px-4 py-2.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-green-400"
            >
              {ctaConfirmed ? 'Sandbox Booting' : 'Open Sandbox'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default DrawerMenu13;
