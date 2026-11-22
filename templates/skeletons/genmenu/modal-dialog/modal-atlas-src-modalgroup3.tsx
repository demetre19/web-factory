import React, { useEffect, useState } from 'react';
import type { ModalProps } from './ModalGroup1';

/* ============================================================================
 * Modal11: Feature Announcement / Changelog · Centered Large · Glass
 * ============================================================================ */
export function Modal11({ defaultOpen = false, open, onOpenChange, onActionComplete }: ModalProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const [selectedFeature, setSelectedFeature] = useState(0);

  const features = [
    {
      title: 'Instant Grid Snap',
      detail: 'Align components across 4px and 8px baselines with live distance guides.',
      accent: 'from-cyan-400/30 to-blue-500/30',
    },
    {
      title: 'Token Diff Inspector',
      detail: 'Compare color and spacing variables side-by-side before publishing themes.',
      accent: 'from-violet-400/30 to-fuchsia-500/30',
    },
    {
      title: 'Offline Bundle Export',
      detail: 'Package standalone TypeScript and Tailwind snippets with zero external assets.',
      accent: 'from-emerald-400/30 to-teal-500/30',
    },
  ];

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal11-title"
        className="w-full max-w-2xl rounded-2xl bg-slate-900/75 backdrop-blur-2xl border border-white/20 shadow-2xl p-6 sm:p-7 text-white"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-sky-300">Release 4.2 · November 2026</p>
            <h2 id="modal11-title" className="mt-1 text-2xl font-semibold tracking-tight text-white">
              What is new in Studio Canvas
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close release spotlight dialog"
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={`mt-5 rounded-xl border border-white/15 bg-gradient-to-br ${features[selectedFeature].accent} p-5`}>
          <svg viewBox="0 0 480 120" className="w-full h-24" aria-hidden="true">
            <rect x="12" y="16" width="130" height="88" rx="10" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" />
            <rect x="172" y="16" width="130" height="88" rx="10" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.4)" />
            <rect x="332" y="16" width="136" height="88" rx="10" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.25)" />
            <circle cx={77 + selectedFeature * 160} cy="60" r="18" fill="rgba(255,255,255,0.85)" />
          </svg>
          <p className="mt-2 text-sm font-semibold text-white">{features[selectedFeature].title}</p>
          <p className="mt-0.5 text-xs text-slate-200">{features[selectedFeature].detail}</p>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {features.map((feat, idx) => (
            <button
              key={feat.title}
              type="button"
              onClick={() => setSelectedFeature(idx)}
              className={`text-left rounded-xl border p-3 transition-colors ${
                selectedFeature === idx
                  ? 'bg-white/15 border-white/40 text-white'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
              }`}
            >
              <span className="block text-sm font-medium">{feat.title}</span>
              <span className="mt-1 block text-xs text-slate-300 line-clamp-2">{feat.detail}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 text-sm font-medium text-slate-200 bg-white/10 border border-white/15 rounded-lg hover:bg-white/15 transition-colors"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={() => {
              onActionComplete?.(`Opened interactive tour for "${features[selectedFeature].title}".`);
              close();
            }}
            className="px-4 py-2 text-sm font-semibold text-slate-950 bg-white rounded-lg hover:bg-slate-100 transition-colors"
          >
            Try {features[selectedFeature].title}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * Modal12: Settings Panel Modal · Centered Large · Minimal / Professional
 * ============================================================================ */
export function Modal12({ defaultOpen = false, open, onOpenChange, onActionComplete }: ModalProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const [tab, setTab] = useState<'general' | 'notifications' | 'security'>('general');
  const [workspaceName, setWorkspaceName] = useState('Northwind Design System');
  const [compactDensity, setCompactDensity] = useState(false);
  const [emailDigest, setEmailDigest] = useState(true);
  const [mentionAlerts, setMentionAlerts] = useState(true);
  const [requireSso, setRequireSso] = useState(false);

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-[2px]"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal12-title"
        className="w-full max-w-2xl rounded-xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-900"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 id="modal12-title" className="text-base font-semibold text-slate-900">
            Workspace settings
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close settings dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] min-h-[290px]">
          <nav aria-label="Settings sections" className="border-b sm:border-b-0 sm:border-r border-slate-200 bg-slate-50 p-3 flex sm:flex-col gap-1">
            {[
              { id: 'general' as const, label: 'General' },
              { id: 'notifications' as const, label: 'Notifications' },
              { id: 'security' as const, label: 'Security' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === item.id
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-6 space-y-5">
            {tab === 'general' && (
              <>
                <div>
                  <label htmlFor="modal12-ws-name" className="block text-xs font-medium text-slate-700">
                    Workspace display name
                  </label>
                  <input
                    id="modal12-ws-name"
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-900 focus:outline-none"
                  />
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Compact table density</p>
                    <p className="text-xs text-slate-500">Reduces row height across audit and asset tables.</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={compactDensity}
                    aria-label="Toggle compact table density"
                    onClick={() => setCompactDensity((v) => !v)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      compactDensity ? 'bg-slate-900' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        compactDensity ? 'translate-x-5.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>
              </>
            )}

            {tab === 'notifications' && (
              <div className="space-y-4">
                <label className="flex items-center justify-between gap-4 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Daily summary email</p>
                    <p className="text-xs text-slate-500">Sent at 08:30 local time on weekdays.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailDigest}
                    onChange={(e) => setEmailDigest(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900"
                  />
                </label>
                <label className="flex items-center justify-between gap-4 border-t border-slate-100 pt-4 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Direct @mention alerts</p>
                    <p className="text-xs text-slate-500">Notify immediately when tagged in a review.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={mentionAlerts}
                    onChange={(e) => setMentionAlerts(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900"
                  />
                </label>
              </div>
            )}

            {tab === 'security' && (
              <div className="space-y-4">
                <label className="flex items-center justify-between gap-4 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Enforce SAML Single Sign-On</p>
                    <p className="text-xs text-slate-500">Require identity provider verification for all members.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={requireSso}
                    onChange={(e) => setRequireSso(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900"
                  />
                </label>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  Active session keys expire automatically after 14 days of inactivity.
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 bg-slate-50 px-6 py-3.5">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onActionComplete?.(`Saved settings for "${workspaceName}".`);
              close();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * Modal13: Settings Panel Slide-Over · Right Slide-Over · Glass
 * ============================================================================ */
export function Modal13({ defaultOpen = false, open, onOpenChange, onActionComplete }: ModalProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const [masterGain, setMasterGain] = useState(74);
  const [lowLatency, setLowLatency] = useState(true);
  const [spatialMix, setSpatialMix] = useState(false);

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

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/55 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal13-title"
        className="h-full w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border-l border-white/20 shadow-2xl flex flex-col justify-between text-white"
      >
        <div className="p-6 space-y-6 overflow-y-auto">
          <div className="flex items-start justify-between gap-4 border-b border-white/15 pb-4">
            <div>
              <h2 id="modal13-title" className="text-lg font-semibold text-white">
                Audio &amp; Studio Preferences
              </h2>
              <p className="mt-1 text-xs text-slate-300">
                Adjust local monitoring output and keyboard bindings.
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close studio preferences drawer"
              className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm">
              <label htmlFor="modal13-gain" className="font-medium text-white">
                Monitor gain
              </label>
              <span className="font-mono text-xs text-sky-300 tabular-nums">{masterGain}%</span>
            </div>
            <input
              id="modal13-gain"
              type="range"
              min={0}
              max={100}
              value={masterGain}
              onChange={(e) => setMasterGain(Number(e.target.value))}
              className="mt-2.5 w-full accent-sky-400 cursor-pointer"
            />
          </div>

          <div className="space-y-3 border-t border-white/15 pt-4">
            <label className="flex items-center justify-between gap-4 rounded-xl bg-white/5 border border-white/10 p-3.5 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-white">Low-latency monitoring</p>
                <p className="text-xs text-slate-300">Bypass software DSP during live capture.</p>
              </div>
              <input
                type="checkbox"
                checked={lowLatency}
                onChange={(e) => setLowLatency(e.target.checked)}
                className="h-4 w-4 rounded border-white/30 text-sky-400"
              />
            </label>

            <label className="flex items-center justify-between gap-4 rounded-xl bg-white/5 border border-white/10 p-3.5 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-white">Binaural spatial fold-down</p>
                <p className="text-xs text-slate-300">Simulate near-field room acoustics on headphones.</p>
              </div>
              <input
                type="checkbox"
                checked={spatialMix}
                onChange={(e) => setSpatialMix(e.target.checked)}
                className="h-4 w-4 rounded border-white/30 text-sky-400"
              />
            </label>
          </div>

          <div className="border-t border-white/15 pt-4">
            <h3 className="text-xs font-semibold tracking-wide text-slate-300">
              Active shortcuts
            </h3>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-200">
                <dt>Toggle playhead</dt>
                <dd className="font-mono bg-white/10 px-2 py-0.5 rounded border border-white/15">Space</dd>
              </div>
              <div className="flex items-center justify-between text-slate-200">
                <dt>Arm input track</dt>
                <dd className="font-mono bg-white/10 px-2 py-0.5 rounded border border-white/15">Shift + R</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="border-t border-white/15 p-5 flex items-center justify-end gap-2.5 bg-slate-950/40">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 text-sm font-medium text-slate-200 bg-white/10 border border-white/15 rounded-lg hover:bg-white/15 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onActionComplete?.(`Studio preferences applied (Gain ${masterGain}%, Low-latency ${lowLatency ? 'On' : 'Off'}).`);
              close();
            }}
            className="px-4 py-2 text-sm font-semibold text-slate-950 bg-white rounded-lg hover:bg-slate-100 transition-colors"
          >
            Apply audio settings
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * Modal14: Side-Panel Slide-Over · Right Slide-Over · Warm Editorial
 * ============================================================================ */
export function Modal14({ defaultOpen = false, open, onOpenChange, onActionComplete }: ModalProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const [reviewerNote, setReviewerNote] = useState('Approved for November press run.');

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

  const items = [
    { name: 'Mohawk Superfine 120lb Cover (500 sheets)', amount: 420.0 },
    { name: 'Two-color Pantone Offset Setup', amount: 185.0 },
    { name: 'Smyth-sewn Spine Finishing', amount: 310.0 },
  ];
  const total = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-stone-950/50 backdrop-blur-[2px]"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal14-title"
        className="h-full w-full max-w-lg bg-[#FAF7F2] border-l border-[#E2D9CB] shadow-2xl flex flex-col justify-between text-[#1C1917]"
      >
        <div className="p-6 sm:p-7 space-y-6 overflow-y-auto">
          <div className="flex items-start justify-between gap-4 border-b border-[#E5DDD0] pb-4">
            <div>
              <p className="text-xs font-mono text-[#78716C] tabular-nums">Dispatch #INV-2026-084</p>
              <h2 id="modal14-title" className="mt-1 font-serif text-2xl font-medium text-[#1C1917]">
                Winter Monograph Print Run
              </h2>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close invoice inspector slide-over"
              className="rounded-lg p-1.5 text-[#78716C] hover:bg-[#EFE9DE] hover:text-[#1C1917] transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-xs text-[#78716C]">Bindery Partner</span>
              <span className="mt-0.5 block font-medium text-[#1C1917]">Alder &amp; Press Co.</span>
            </div>
            <div>
              <span className="block text-xs text-[#78716C]">Due Date</span>
              <span className="mt-0.5 block font-mono text-[#1C1917] tabular-nums">2026-12-04</span>
            </div>
          </div>

          <div className="border-t border-[#E5DDD0] pt-4">
            <h3 className="text-xs font-medium tracking-wide text-[#78716C]">
              Itemized ledger
            </h3>
            <ul className="mt-3 divide-y divide-[#E5DDD0]">
              {items.map((item) => (
                <li key={item.name} className="py-2.5 flex items-center justify-between gap-4 text-sm">
                  <span className="text-[#44403C]">{item.name}</span>
                  <span className="font-mono text-[#1C1917] tabular-nums shrink-0">
                    ${item.amount.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center justify-between border-t border-[#1C1917]/20 pt-3">
              <span className="text-sm font-semibold text-[#1C1917]">Total due</span>
              <span className="font-mono text-lg font-semibold text-[#1C1917] tabular-nums">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <label htmlFor="modal14-note" className="block text-xs font-medium text-[#57534E]">
              Internal approval note
            </label>
            <textarea
              id="modal14-note"
              rows={3}
              value={reviewerNote}
              onChange={(e) => setReviewerNote(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[#D6CFC2] bg-white px-3 py-2 text-sm text-[#1C1917] focus:border-[#8B3A2B] focus:outline-none"
            />
          </div>
        </div>

        <div className="border-t border-[#E5DDD0] bg-[#F3EDE2] px-6 py-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 text-sm font-medium text-[#44403C] hover:text-[#1C1917] transition-colors"
          >
            Close panel
          </button>
          <button
            type="button"
            onClick={() => {
              onActionComplete?.(`Approved invoice #INV-2026-084 ($${total.toFixed(2)}).`);
              close();
            }}
            className="px-5 py-2.5 text-sm font-medium text-[#FAF7F2] bg-[#8B3A2B] rounded-lg hover:bg-[#732E22] transition-colors"
          >
            Approve dispatch
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * Modal15: Multi-Step Wizard Modal · Centered Large · Bold / Colourful
 * ============================================================================ */
export function Modal15({ defaultOpen = false, open, onOpenChange, onActionComplete }: ModalProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState('atlas-web');
  const [region, setRegion] = useState('us-west-2');
  const [stack, setStack] = useState<'React + Vite' | 'Next.js Edge' | 'Astro Static'>('React + Vite');
  const [error, setError] = useState('');

  const close = () => {
    if (!isControlled) setInternalOpen(false);
    onOpenChange?.(false);
    setStep(1);
    setError('');
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

  const handleNext = () => {
    if (step === 1 && !projectName.trim()) {
      setError('Project slug is required before continuing.');
      return;
    }
    setError('');
    setStep((s) => Math.min(3, s + 1));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal15-title"
        className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-emerald-100 text-slate-900"
      >
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-white">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs font-semibold tracking-wide text-emerald-100">
              Step {step} of 3
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close setup wizard dialog"
              className="rounded-lg p-1.5 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <h2 id="modal15-title" className="mt-1 text-xl font-bold tracking-tight">
            {step === 1 && 'Configure project identity'}
            {step === 2 && 'Choose runtime preset'}
            {step === 3 && 'Review and provision'}
          </h2>
          <div className="mt-4 grid grid-cols-3 gap-2" aria-hidden="true">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`h-1.5 rounded-full transition-colors ${
                  n <= step ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-6 min-h-[210px]">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="modal15-slug" className="block text-xs font-semibold text-slate-700">
                  Project slug
                </label>
                <input
                  id="modal15-slug"
                  type="text"
                  value={projectName}
                  onChange={(e) => {
                    setProjectName(e.target.value);
                    setError('');
                  }}
                  placeholder="my-new-app"
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
                {error && (
                  <p className="mt-1 text-xs font-medium text-rose-600" role="alert">
                    {error}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="modal15-region" className="block text-xs font-semibold text-slate-700">
                  Primary deployment region
                </label>
                <select
                  id="modal15-region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                >
                  <option value="us-west-2">US West (Oregon)</option>
                  <option value="us-east-1">US East (Virginia)</option>
                  <option value="eu-central-1">EU Central (Frankfurt)</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['React + Vite', 'Next.js Edge', 'Astro Static'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setStack(option)}
                  aria-pressed={stack === option}
                  className={`text-left rounded-xl border p-4 transition-all ${
                    stack === option
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <span className="block text-sm font-semibold">{option}</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {option === 'React + Vite' && 'Zero-config SPA bundler'}
                    {option === 'Next.js Edge' && 'Streaming SSR & API routes'}
                    {option === 'Astro Static' && 'Content-first island build'}
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Project slug</span>
                <span className="font-mono font-semibold text-slate-900">{projectName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Runtime preset</span>
                <span className="font-semibold text-slate-900">{stack}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Region</span>
                <span className="font-mono text-slate-900">{region}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={() => (step === 1 ? close() : setStep((s) => s - 1))}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onActionComplete?.(`Provisioned "${projectName}" (${stack}) in ${region}.`);
                close();
              }}
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:brightness-105 transition-all"
            >
              Launch project
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
