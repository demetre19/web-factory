import React, { useEffect, useState } from 'react';

export interface ModalProps {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onActionComplete?: (message: string) => void;
}

/* ============================================================================
 * Modal1: Confirmation Dialog · Centered Small · Minimal / Professional
 * ============================================================================ */
export function Modal1({ defaultOpen = false, open, onOpenChange, onActionComplete }: ModalProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const [notifySubscribers, setNotifySubscribers] = useState(true);
  const [status, setStatus] = useState<'idle' | 'published'>('idle');

  const close = () => {
    if (!isControlled) setInternalOpen(false);
    onOpenChange?.(false);
    setStatus('idle');
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

  const handleConfirm = () => {
    setStatus('published');
    onActionComplete?.(
      notifySubscribers
        ? 'Release v2.4.0 published and 1,240 subscribers notified.'
        : 'Release v2.4.0 published silently.',
    );
    setTimeout(close, 700);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-[2px]"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal1-title"
        aria-describedby="modal1-desc"
        className="w-full max-w-sm rounded-xl bg-white border border-slate-200 shadow-xl p-6 text-slate-900"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close publish confirmation dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-slate-900 transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <h2 id="modal1-title" className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
          Publish release 2.4.0?
        </h2>
        <p id="modal1-desc" className="mt-1.5 text-sm leading-relaxed text-slate-600">
          This updates the production package registry and marks build <span className="font-mono text-slate-800">8f3c19a</span> as the active release.
        </p>

        <label className="mt-4 flex items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={notifySubscribers}
            onChange={(e) => setNotifySubscribers(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
          />
          <span>Email changelog digest to subscribers</span>
        </label>

        {status === 'published' && (
          <p className="mt-3 text-xs font-medium text-emerald-700" role="status">
            Release published successfully.
          </p>
        )}

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={close}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={status === 'published'}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-60 transition-colors whitespace-nowrap"
          >
            {status === 'published' ? 'Published' : 'Publish release'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
 * Modal2: Destructive-Action Confirm · Centered Small · Minimal / Professional
 * ============================================================================ */
export function Modal2({ defaultOpen = false, open, onOpenChange, onActionComplete }: ModalProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const targetSlug = 'acme-prod';
  const [confirmationText, setConfirmationText] = useState('');
  const [error, setError] = useState('');

  const close = () => {
    if (!isControlled) setInternalOpen(false);
    onOpenChange?.(false);
    setConfirmationText('');
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

  const isMatched = confirmationText.trim() === targetSlug;

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMatched) {
      setError(`Type "${targetSlug}" exactly to confirm deletion.`);
      return;
    }
    onActionComplete?.(`Workspace "${targetSlug}" scheduled for permanent deletion.`);
    close();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-[2px]"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal2-title"
        aria-describedby="modal2-desc"
        className="w-full max-w-md rounded-xl bg-white border border-slate-200 shadow-xl p-6 text-slate-900"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 border border-red-100">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close delete workspace dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <h2 id="modal2-title" className="mt-4 text-lg font-semibold text-slate-900">
          Delete workspace permanently
        </h2>
        <p id="modal2-desc" className="mt-1.5 text-sm leading-relaxed text-slate-600">
          All 14 deployments, environment secrets, and audit history for{' '}
          <span className="font-mono font-medium text-slate-900">{targetSlug}</span> will be erased immediately.
        </p>

        <form onSubmit={handleDelete} className="mt-4 space-y-4">
          <div>
            <label htmlFor="modal2-slug" className="block text-xs font-medium text-slate-700">
              Type <span className="font-mono font-semibold text-slate-900">{targetSlug}</span> to confirm
            </label>
            <input
              id="modal2-slug"
              type="text"
              value={confirmationText}
              onChange={(e) => {
                setConfirmationText(e.target.value);
                setError('');
              }}
              placeholder={targetSlug}
              autoComplete="off"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-900 placeholder:text-slate-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
            {error && (
              <p className="mt-1.5 text-xs font-medium text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={close}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Keep workspace
            </button>
            <button
              type="submit"
              disabled={!isMatched}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed transition-colors"
            >
              Delete forever
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================================
 * Modal3: Form Modal (Signup) · Centered Medium · Bold / Colourful
 * ============================================================================ */
export function Modal3({ defaultOpen = false, open, onOpenChange, onActionComplete }: ModalProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Product Designer');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const close = () => {
    if (!isControlled) setInternalOpen(false);
    onOpenChange?.(false);
    setError('');
    setSubmitted(false);
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

  const strength =
    password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.includes('@') || password.length < 6) {
      setError('Enter your name, a valid email address, and a password of at least 6 characters.');
      return;
    }
    setSubmitted(true);
    onActionComplete?.(`Team account created for ${fullName.trim()} (${role}).`);
    setTimeout(close, 900);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-950/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal3-title"
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-indigo-100"
      >
        <div className="relative bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-6 py-5 text-white">
          <button
            type="button"
            onClick={close}
            aria-label="Close signup dialog"
            className="absolute right-4 top-4 rounded-lg p-1.5 text-white/80 hover:bg-white/15 hover:text-white transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <p className="text-xs font-semibold tracking-wide text-indigo-100">
            Team onboarding
          </p>
          <h2 id="modal3-title" className="mt-1 text-xl font-bold tracking-tight">
            Create your studio account
          </h2>
          <p className="mt-1 text-sm text-indigo-100">
            Collaborate on prototypes with unlimited seats for 14 days.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="modal3-name" className="block text-xs font-semibold text-slate-700">
              Full name
            </label>
            <input
              id="modal3-name"
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setError('');
              }}
              placeholder="Maya Lin"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-600/20"
            />
          </div>

          <div>
            <label htmlFor="modal3-email" className="block text-xs font-semibold text-slate-700">
              Work email
            </label>
            <input
              id="modal3-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="maya@studio.co"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-600/20"
            />
          </div>

          <div>
            <label htmlFor="modal3-role" className="block text-xs font-semibold text-slate-700">
              Primary role
            </label>
            <select
              id="modal3-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-600/20"
            >
              <option>Product Designer</option>
              <option>Frontend Engineer</option>
              <option>Design Director</option>
              <option>Product Manager</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="modal3-password" className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <span className="text-xs font-medium text-slate-500">
                {strength === 0 ? 'Min 6 chars' : strength === 1 ? 'Weak' : strength === 2 ? 'Good' : 'Strong'}
              </span>
            </div>
            <input
              id="modal3-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="Create a strong password"
              className="mt-1 w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-600/20"
            />
            <div className="mt-2 grid grid-cols-3 gap-1.5" aria-hidden="true">
              <div className={`h-1.5 rounded-full ${strength >= 1 ? 'bg-amber-500' : 'bg-slate-200'}`} />
              <div className={`h-1.5 rounded-full ${strength >= 2 ? 'bg-violet-500' : 'bg-slate-200'}`} />
              <div className={`h-1.5 rounded-full ${strength >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            </div>
          </div>

          {error && (
            <p className="text-xs font-medium text-rose-600" role="alert">
              {error}
            </p>
          )}

          {submitted && (
            <p className="text-xs font-semibold text-emerald-700" role="status">
              Account created. Redirecting to workspace...
            </p>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={close}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitted}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-fuchsia-600 rounded-lg hover:brightness-110 transition-all shadow-sm"
            >
              {submitted ? 'Welcome aboard' : 'Create free account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================================
 * Modal4: Form Modal (Newsletter) · Centered Medium · Warm Editorial
 * ============================================================================ */
export function Modal4({ defaultOpen = false, open, onOpenChange, onActionComplete }: ModalProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const [email, setEmail] = useState('');
  const [topics, setTopics] = useState<string[]>(['Essays', 'Typography']);
  const [error, setError] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const close = () => {
    if (!isControlled) setInternalOpen(false);
    onOpenChange?.(false);
    setError('');
    setSubscribed(false);
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

  const toggleTopic = (topic: string) => {
    setTopics((prev) =>
      prev.includes(topic) ? prev.filter((item) => item !== topic) : [...prev, topic],
    );
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubscribed(true);
    onActionComplete?.(`Subscribed ${email.trim()} to ${topics.join(', ') || 'All issues'}.`);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/55 backdrop-blur-[2px]"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal4-title"
        className="w-full max-w-lg rounded-xl bg-[#FAF7F2] border border-[#E5DDD0] shadow-2xl p-7 text-[#1C1917]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E5DDD0] pb-4">
          <div>
            <p className="text-xs font-medium tracking-wide text-[#78716C]">
              Sunday Almanac · Issue 148
            </p>
            <h2 id="modal4-title" className="mt-1 font-serif text-2xl font-medium tracking-tight text-[#1C1917]">
              Letters on craft, paper, and form
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close newsletter dialog"
            className="rounded-lg p-1.5 text-[#78716C] hover:bg-[#EFE9DE] hover:text-[#1C1917] transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-[#57534E]">
          One thoughtful dispatch every Sunday morning. Zero syndication, zero trackers, and an easy archive of past notebooks.
        </p>

        {subscribed ? (
          <div className="mt-6 rounded-lg border border-[#D6CFC2] bg-[#F2ECE1] p-5">
            <h3 className="font-serif text-lg font-medium text-[#1C1917]">
              You are on the Sunday list
            </h3>
            <p className="mt-1 text-sm text-[#57534E]">
              A confirmation note was queued for <span className="font-medium text-[#1C1917]">{email}</span>.
            </p>
            <button
              type="button"
              onClick={close}
              className="mt-4 px-4 py-2 text-sm font-medium text-[#FAF7F2] bg-[#8B3A2B] rounded-lg hover:bg-[#732E22] transition-colors"
            >
              Return to reading
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="mt-5 space-y-5">
            <fieldset>
              <legend className="text-xs font-medium text-[#57534E]">
                Choose sections to receive
              </legend>
              <div className="mt-2 grid grid-cols-2 gap-2.5">
                {['Essays', 'Typography', 'Print Archive', 'Book Notes'].map((topic) => {
                  const checked = topics.includes(topic);
                  return (
                    <label
                      key={topic}
                      className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
                        checked
                          ? 'border-[#8B3A2B] bg-[#F4ECE6] text-[#1C1917]'
                          : 'border-[#E5DDD0] bg-white/70 text-[#57534E]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTopic(topic)}
                        className="h-4 w-4 rounded border-[#D6CFC2] text-[#8B3A2B] focus:ring-[#8B3A2B]"
                      />
                      <span>{topic}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <label htmlFor="modal4-email" className="block text-xs font-medium text-[#57534E]">
                Email address
              </label>
              <div className="mt-1.5 flex flex-col sm:flex-row gap-2.5">
                <input
                  id="modal4-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  placeholder="reader@domain.com"
                  className="flex-1 rounded-lg border border-[#D6CFC2] bg-white px-3.5 py-2.5 text-sm text-[#1C1917] placeholder:text-[#A8A29E] focus:border-[#8B3A2B] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-medium text-[#FAF7F2] bg-[#8B3A2B] rounded-lg hover:bg-[#732E22] transition-colors whitespace-nowrap"
                >
                  Subscribe
                </button>
              </div>
              {error && (
                <p className="mt-1.5 text-xs font-medium text-[#991B1B]" role="alert">
                  {error}
                </p>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
 * Modal5: Form Modal (Feedback) · Bottom-Anchored on Mobile · Glass
 * ============================================================================ */
export function Modal5({ defaultOpen = false, open, onOpenChange, onActionComplete }: ModalProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const [rating, setRating] = useState<number>(4);
  const [category, setCategory] = useState('Interface & Speed');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const close = () => {
    if (!isControlled) setInternalOpen(false);
    onOpenChange?.(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Please include a brief note describing your experience.');
      return;
    }
    onActionComplete?.(`Feedback submitted (${rating}/5 in ${category}).`);
    setNotes('');
    close();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-950/60 backdrop-blur-md"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal5-title"
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-slate-900/75 backdrop-blur-2xl border border-white/20 shadow-2xl p-6 text-white"
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/25 sm:hidden" aria-hidden="true" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="modal5-title" className="text-lg font-semibold tracking-tight text-white">
              Share product feedback
            </h2>
            <p className="mt-1 text-sm text-slate-300">
              How did today&apos;s release perform in your workflow?
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close feedback dialog"
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <span className="block text-xs font-medium text-slate-300">Overall rating</span>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  aria-pressed={rating === value}
                  className={`py-2 rounded-lg text-sm font-semibold border transition-colors ${
                    rating === value
                      ? 'bg-sky-400/25 border-sky-300 text-white'
                      : 'bg-white/5 border-white/15 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="modal5-category" className="block text-xs font-medium text-slate-300">
              Topic area
            </label>
            <select
              id="modal5-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/20 bg-slate-900/80 px-3 py-2 text-sm text-white focus:border-sky-300 focus:outline-none"
            >
              <option>Interface & Speed</option>
              <option>Keyboard Shortcuts</option>
              <option>Export Reliability</option>
              <option>Feature Request</option>
            </select>
          </div>

          <div>
            <label htmlFor="modal5-notes" className="block text-xs font-medium text-slate-300">
              Notes
            </label>
            <textarea
              id="modal5-notes"
              rows={3}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setError('');
              }}
              placeholder="Tell us what worked or what felt slow..."
              className="mt-1.5 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-slate-400 focus:border-sky-300 focus:outline-none"
            />
            {error && (
              <p className="mt-1 text-xs text-rose-300" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-1">
            <button
              type="button"
              onClick={close}
              className="px-4 py-2 text-sm font-medium text-slate-200 bg-white/10 border border-white/15 rounded-lg hover:bg-white/15 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-slate-950 bg-white rounded-lg hover:bg-slate-100 transition-colors"
            >
              Send feedback
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
