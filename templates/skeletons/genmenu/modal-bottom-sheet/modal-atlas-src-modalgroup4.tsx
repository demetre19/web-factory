import React, { useEffect, useState } from 'react';
import type { ModalProps } from './ModalGroup1';

/* ============================================================================
 * Modal16: Command Palette Modal · Centered Medium (Top-Offset) · Dark
 * ============================================================================ */
export function Modal16({ defaultOpen = false, open, onOpenChange, onActionComplete }: ModalProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const commands = [
    { id: 'new-doc', label: 'Create new specification doc', shortcut: 'N', group: 'Workspace' },
    { id: 'invite', label: 'Invite collaborator by email', shortcut: 'I', group: 'Team' },
    { id: 'export-tokens', label: 'Export CSS variables bundle', shortcut: 'E', group: 'Design' },
    { id: 'deploy-prod', label: 'Promote staging build to production', shortcut: 'P', group: 'Release' },
    { id: 'audit-contrast', label: 'Run WCAG contrast verification', shortcut: 'A', group: 'Quality' },
  ];

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = commands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query.trim().toLowerCase()) ||
      cmd.group.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const close = () => {
    if (!isControlled) setInternalOpen(false);
    onOpenChange?.(false);
    setQuery('');
    setActiveIndex(0);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (filtered.length ? (i + 1) % filtered.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0));
      } else if (e.key === 'Enter' && filtered[activeIndex]) {
        e.preventDefault();
        onActionComplete?.(`Executed command: ${filtered[activeIndex].label}`);
        close();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, filtered, activeIndex]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal16-title"
        className="w-full max-w-xl rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden text-zinc-100"
      >
        <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3.5">
          <svg className="h-4 w-4 text-zinc-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <div className="flex-1">
            <h2 id="modal16-title" className="sr-only">
              Quick action command palette
            </h2>
            <label htmlFor="modal16-search" className="sr-only">
              Search workspace commands
            </label>
            <input
              id="modal16-search"
              type="text"
              autoFocus
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              placeholder="Type a command or action..."
              className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close command palette dialog"
            className="rounded-md px-2 py-1 text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 hover:text-white transition-colors"
          >
            Esc
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-400">
              No commands match &ldquo;{query}&rdquo;.
            </div>
          ) : (
            filtered.map((cmd, idx) => (
              <button
                key={cmd.id}
                type="button"
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => {
                  onActionComplete?.(`Executed command: ${cmd.label}`);
                  close();
                }}
                className={`w-full flex items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm transition-colors ${
                  idx === activeIndex
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-300 hover:bg-zinc-900'
                }`}
              >
                <div className="min-w-0">
                  <span className="block font-medium truncate">{cmd.label}</span>
                  <span className="text-xs text-zinc-400">{cmd.group}</span>
                </div>
                <kbd className="rounded bg-zinc-900 border border-zinc-700 px-2 py-0.5 font-mono text-xs text-zinc-300 shrink-0">
                  Cmd+{cmd.shortcut}
                </kbd>
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-900/60 px-4 py-2.5 text-xs text-zinc-400">
          <span>Use Up/Down arrows to navigate</span>
          <span>Enter to run</span>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * Modal17: Destructive Confirm · Bottom-Anchored on Mobile · Glass
 * ============================================================================ */
export function Modal17({ defaultOpen = false, open, onOpenChange, onActionComplete }: ModalProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const [acknowledged, setAcknowledged] = useState(false);

  const close = () => {
    if (!isControlled) setInternalOpen(false);
    onOpenChange?.(false);
    setAcknowledged(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/65 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal17-title"
        className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl bg-slate-900/80 backdrop-blur-2xl border border-rose-400/30 shadow-2xl p-6 text-white"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-200">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m0-8v4m9-1a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close revoke API token dialog"
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <h2 id="modal17-title" className="mt-4 text-lg font-semibold text-white">
          Revoke production API token?
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
          Token <span className="font-mono text-white">pk_live_994a</span> will stop authenticating incoming webhook requests immediately.
        </p>

        <label className="mt-4 flex items-start gap-2.5 rounded-xl bg-white/5 border border-white/15 p-3 text-xs text-slate-200 cursor-pointer">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-white/30 text-rose-500"
          />
          <span>I understand active production integrations using this key will fail.</span>
        </label>

        <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 text-sm font-medium text-slate-200 bg-white/10 border border-white/15 rounded-lg hover:bg-white/15 transition-colors"
          >
            Keep token
          </button>
          <button
            type="button"
            disabled={!acknowledged}
            onClick={() => {
              onActionComplete?.('Revoked production API token pk_live_994a.');
              close();
            }}
            className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-500 disabled:bg-rose-900/60 disabled:text-rose-200/50 disabled:cursor-not-allowed transition-colors"
          >
            Revoke token
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * Modal18: Confirmation Dialog (Checkout) · Right Slide-Over · Bold / Colourful
 * ============================================================================ */
export function Modal18({ defaultOpen = false, open, onOpenChange, onActionComplete }: ModalProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const [billing, setBilling] = useState<'annual' | 'monthly'>('annual');
  const [seats, setSeats] = useState(5);

  const close = () => {
    if (!isControlled) setInternalOpen(false);
    onOpenChange?.(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const perSeat = billing === 'annual' ? 18 : 24;
  const total = perSeat * seats;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/55 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal18-title"
        className="h-full w-full max-w-md bg-white shadow-2xl flex flex-col justify-between text-slate-900"
      >
        <div className="overflow-y-auto">
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-6 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-wide text-blue-100">
                  Workspace upgrade
                </p>
                <h2 id="modal18-title" className="mt-1 text-xl font-bold">
                  Confirm Studio Pro plan
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close upgrade drawer"
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div>
              <span className="block text-xs font-semibold text-slate-700">Billing cadence</span>
              <div className="mt-2 grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setBilling('annual')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                    billing === 'annual' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Annual ($18/seat)
                </button>
                <button
                  type="button"
                  onClick={() => setBilling('monthly')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                    billing === 'monthly' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Monthly ($24/seat)
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="modal18-seats" className="block text-xs font-semibold text-slate-700">
                Team seats
              </label>
              <div className="mt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSeats((s) => Math.max(1, s - 1))}
                  aria-label="Decrease seats"
                  className="h-9 w-9 rounded-lg border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  -
                </button>
                <input
                  id="modal18-seats"
                  type="number"
                  min={1}
                  max={100}
                  value={seats}
                  onChange={(e) => setSeats(Math.max(1, Number(e.target.value) || 1))}
                  className="w-20 rounded-lg border border-slate-200 px-3 py-1.5 text-center font-mono text-sm tabular-nums"
                />
                <button
                  type="button"
                  onClick={() => setSeats((s) => Math.min(100, s + 1))}
                  aria-label="Increase seats"
                  className="h-9 w-9 rounded-lg border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  +
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>
                  {seats} seats x ${perSeat}/mo
                </span>
                <span className="font-mono text-slate-900 tabular-nums">${total}/mo</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-900 border-t border-indigo-200/70 pt-2">
                <span>Estimated charge today</span>
                <span className="font-mono tabular-nums">
                  ${billing === 'annual' ? total * 12 : total}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 p-5 flex items-center justify-end gap-2.5 bg-slate-50">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onActionComplete?.(`Upgraded to Studio Pro (${seats} seats, ${billing} billing).`);
              close();
            }}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:brightness-105 transition-all"
          >
            Confirm upgrade
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * Modal19: Alert-Toast Dialog · Bottom-Right Floating / Bottom on Mobile · Dark
 * ============================================================================ */
export function Modal19({ defaultOpen = false, open, onOpenChange, onActionComplete }: ModalProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const [retrying, setRetrying] = useState(false);

  const close = () => {
    if (!isControlled) setInternalOpen(false);
    onOpenChange?.(false);
    setRetrying(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => {
      setRetrying(false);
      onActionComplete?.('Background repository sync re-established.');
      close();
    }, 650);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:justify-end p-4 bg-black/35"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal19-title"
        className="w-full max-w-sm rounded-2xl bg-zinc-950 border border-amber-500/40 shadow-2xl p-5 text-zinc-100"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </span>
            <h2 id="modal19-title" className="text-sm font-semibold text-white">
              Background sync paused
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Dismiss sync alert dialog"
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="mt-2.5 text-xs leading-relaxed text-zinc-300">
          Your local changes are safe in browser storage, but upstream sync timed out after 3 attempts.
        </p>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={close}
            className="px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white transition-colors"
          >
            Work offline
          </button>
          <button
            type="button"
            onClick={handleRetry}
            disabled={retrying}
            className="px-3.5 py-1.5 text-xs font-semibold text-zinc-950 bg-amber-400 rounded-lg hover:bg-amber-300 disabled:opacity-70 transition-colors"
          >
            {retrying ? 'Reconnecting...' : 'Retry sync'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * Modal20: Alert-Toast Dialog · Top-Center Floating / Bottom on Mobile · Warm Editorial
 * ============================================================================ */
export function Modal20({ defaultOpen = false, open, onOpenChange, onActionComplete }: ModalProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const [downloaded, setDownloaded] = useState(false);

  const close = () => {
    if (!isControlled) setInternalOpen(false);
    onOpenChange?.(false);
    setDownloaded(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-start justify-center p-4 sm:pt-6 bg-stone-950/30"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal20-title"
        className="w-full max-w-md rounded-xl bg-[#FAF7F2] border border-[#D8CEBE] shadow-2xl p-4 sm:p-5 text-[#1C1917]"
      >
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1E4631] text-[#FAF7F2]">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 18h16" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h2 id="modal20-title" className="font-serif text-base font-medium text-[#1C1917]">
                Archive bundle ready
              </h2>
              <button
                type="button"
                onClick={close}
                aria-label="Close export ready notice"
                className="rounded-lg p-1 text-[#78716C] hover:bg-[#EFE9DE] hover:text-[#1C1917] transition-colors"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-[#57534E]">
              Compiled 42 manuscripts and vector plates (<span className="font-mono text-[#1C1917] tabular-nums">14.8 MB</span>).
            </p>
            <div className="mt-3.5 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setDownloaded(true);
                  onActionComplete?.('Downloaded archive-2026-11.zip (14.8 MB).');
                  setTimeout(close, 650);
                }}
                className="px-3.5 py-1.5 text-xs font-medium text-[#FAF7F2] bg-[#1E4631] rounded-lg hover:bg-[#163525] transition-colors"
              >
                {downloaded ? 'Downloading...' : 'Download archive'}
              </button>
              <button
                type="button"
                onClick={close}
                className="px-3 py-1.5 text-xs font-medium text-[#57534E] hover:text-[#1C1917] transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
