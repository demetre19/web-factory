import { useId, useState } from 'react';
import {
  Bookmark,
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  Globe,
  HelpCircle,
  Lightbulb,
  Lock,
  Share2,
  Users,
  X,
} from 'lucide-react';

/**
 * Micro5: Info Card Popover · Professional
 */
export function Micro5() {
  const [open, setOpen] = useState(true);
  const [seats, setSeats] = useState(14);
  const popoverId = useId();
  const maxSeats = 20;
  const pct = Math.min(100, Math.round((seats / maxSeats) * 100));

  return (
    <div className="pt-2 pb-48 flex items-start justify-center">
      <div className="relative inline-flex">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={popoverId}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-sm font-medium text-slate-800 shadow-xs hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 transition-colors whitespace-nowrap"
        >
          <CreditCard className="w-4 h-4 text-slate-500" aria-hidden="true" />
          <span>Billing Cycle</span>
        </button>

        {open && (
          <div
            id={popoverId}
            role="dialog"
            aria-label="Billing Cycle Details"
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 z-20 w-72 p-4 rounded-xl bg-white border border-slate-200 shadow-lg text-left"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Team Plan</h4>
                <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                  Renews Dec 01 · $240/mo
                </p>
              </div>
              <button
                type="button"
                aria-label="Close billing info"
                onClick={() => setOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-3.5">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-600 font-medium">Active seats</span>
                <span className="font-mono tabular-nums font-medium text-slate-900">
                  {seats} / {maxSeats}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-slate-900 transition-all duration-200"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setSeats((s) => (s < maxSeats ? s + 1 : 10))}
                className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 transition-colors"
              >
                {seats < maxSeats ? 'Add Seat' : 'Reset Seats'}
              </button>
              <span className="text-xs text-slate-500 tabular-nums">{pct}% used</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Micro6: Action Menu Popover · Dark
 */
export function Micro6() {
  const [open, setOpen] = useState(true);
  const [visibility, setVisibility] = useState<'private' | 'team' | 'public'>('team');
  const [copied, setCopied] = useState(false);
  const popoverId = useId();

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const options = [
    { id: 'private' as const, label: 'Private', desc: 'Only invited editors', icon: Lock },
    { id: 'team' as const, label: 'Workspace', desc: 'All 18 team members', icon: Users },
    { id: 'public' as const, label: 'Public Link', desc: 'Anyone with the URL', icon: Globe },
  ];

  return (
    <div className="pt-2 pb-64 flex items-start justify-center">
      <div className="relative inline-flex">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={popoverId}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm font-medium text-slate-100 hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 transition-colors whitespace-nowrap"
        >
          <Share2 className="w-4 h-4 text-sky-400" aria-hidden="true" />
          <span>Share · {visibility === 'team' ? 'Workspace' : visibility === 'private' ? 'Private' : 'Public'}</span>
        </button>

        {open && (
          <div
            id={popoverId}
            role="dialog"
            aria-label="Share access settings"
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 z-20 w-72 p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 shadow-2xl text-left"
          >
            <div className="px-2 py-1 text-xs font-semibold text-slate-400">
              Access Scope
            </div>
            <div className="mt-1 space-y-1">
              {options.map((opt) => {
                const Icon = opt.icon;
                const active = visibility === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setVisibility(opt.id)}
                    className={`w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                      active ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${active ? 'text-sky-400' : 'text-slate-400'}`}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{opt.label}</p>
                        <p className="text-[11px] text-slate-400 truncate">{opt.desc}</p>
                      </div>
                    </div>
                    {active && <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleCopy}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 text-slate-950 text-xs font-semibold hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Invite Link Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Copy Invite Link</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Micro7: Rich Content Popover with Image-Free Vector Illustration Block · Colourful
 */
export function Micro7() {
  const [open, setOpen] = useState(true);
  const [synced, setSynced] = useState(false);
  const popoverId = useId();

  return (
    <div className="pt-2 pb-64 flex items-start justify-center">
      <div className="relative inline-flex">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={popoverId}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-rose-500 text-white text-sm font-medium shadow-sm hover:from-amber-600 hover:to-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-500 transition-all whitespace-nowrap"
        >
          <span>Smart Sync</span>
        </button>

        {open && (
          <div
            id={popoverId}
            role="dialog"
            aria-label="Smart Sync Preview"
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-20 w-72 rounded-2xl bg-white border border-amber-200/80 shadow-xl overflow-hidden text-left"
          >
            {/* Image-free geometric SVG illustration block */}
            <div className="relative h-24 w-full bg-gradient-to-br from-amber-50 via-orange-50 to-rose-100 flex items-center justify-center border-b border-amber-100">
              <svg
                viewBox="0 0 220 80"
                className="w-52 h-20"
                aria-hidden="true"
              >
                <circle cx="52" cy="40" r="22" fill="#FDE68A" />
                <circle cx="168" cy="40" r="22" fill="#FECDD3" />
                <rect x="38" y="28" width="28" height="24" rx="6" fill="#F59E0B" />
                <rect x="154" y="28" width="28" height="24" rx="6" fill="#F43F5E" />
                <path
                  d="M72 34 C96 20, 124 20, 148 34"
                  fill="none"
                  stroke="#EA580C"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                />
                <path
                  d="M148 46 C124 60, 96 60, 72 46"
                  fill="none"
                  stroke="#E11D48"
                  strokeWidth="2.5"
                />
                <circle cx="110" cy="40" r="9" fill="#FFFFFF" stroke="#EA580C" strokeWidth="2.5" />
              </svg>
            </div>

            <div className="p-4">
              <h4 className="text-sm font-semibold text-slate-900">
                Two-Way Token Mirroring
              </h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Keep Figma variables and repository theme tokens aligned automatically on save.
              </p>
              <div className="mt-3.5 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSynced((s) => !s)}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 transition-colors"
                >
                  {synced ? 'Preview Active' : 'Enable Preview'}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Micro13: User Profile Hover Card · Professional
 */
export function Micro13() {
  const [open, setOpen] = useState(true);
  const [following, setFollowing] = useState(false);
  const cardId = useId();

  return (
    <div className="pt-2 pb-48 flex items-start justify-center">
      <div className="relative inline-flex">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={cardId}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-900 text-sm font-medium hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 transition-colors"
        >
          <span>@elena.vance</span>
        </button>

        {open && (
          <div
            id={cardId}
            role="dialog"
            aria-label="Elena Vance profile preview"
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 z-20 w-72 p-4 rounded-xl bg-white border border-slate-200 shadow-lg text-left"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                  EV
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">Elena Vance</p>
                  <p className="text-xs text-slate-500 truncate">Staff Systems Designer</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFollowing((f) => !f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                  following
                    ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {following ? 'Following' : 'Follow'}
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              Designing accessible design-token pipelines and keyboard-first tooling in Zurich.
            </p>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-600 tabular-nums">
              <span>
                <strong className="font-semibold text-slate-900">
                  {following ? '1,429' : '1,428'}
                </strong>{' '}
                followers
              </span>
              <span>
                <strong className="font-semibold text-slate-900">38</strong> kits
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Micro14: Link Preview Hover Card · Minimal
 */
export function Micro14() {
  const [open, setOpen] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const cardId = useId();

  return (
    <div className="pt-2 pb-44 flex items-start justify-center">
      <div className="relative inline-flex">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={cardId}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 transition-colors whitespace-nowrap"
        >
          <span>tokens.spec.dev/v3</span>
          <ExternalLink className="w-3.5 h-3.5 text-neutral-500" aria-hidden="true" />
        </button>

        {open && (
          <div
            id={cardId}
            role="dialog"
            aria-label="External link preview"
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 z-20 w-72 p-4 rounded-xl bg-white border border-neutral-200 shadow-lg text-left"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono text-neutral-500">tokens.spec.dev</span>
              <button
                type="button"
                aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark specification'}
                onClick={() => setBookmarked((b) => !b)}
                className={`p-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 ${
                  bookmarked
                    ? 'text-neutral-900 bg-neutral-100'
                    : 'text-neutral-400 hover:text-neutral-800 hover:bg-neutral-50'
                }`}
              >
                <Bookmark
                  className={`w-3.5 h-3.5 ${bookmarked ? 'fill-current' : ''}`}
                  aria-hidden="true"
                />
              </button>
            </div>
            <h4 className="mt-1.5 text-sm font-semibold text-neutral-900">
              W3C Design Tokens Format v3
            </h4>
            <p className="mt-1 text-xs text-neutral-600 leading-relaxed">
              Canonical JSON schema for color spaces, cubic-bezier motion curves, and typography aliases.
            </p>
            <p className="mt-3 text-xs text-neutral-400 tabular-nums">
              Updated Nov 14 · 6 min read
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Micro15: Help / Hint Block · Colourful (Warm Amber/Teal, hairline border)
 */
export function Micro15() {
  const [open, setOpen] = useState(true);
  const hintId = useId();

  return (
    <div className="pt-2 pb-44 flex items-start justify-center">
      <div className="relative inline-flex">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={hintId}
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 transition-colors whitespace-nowrap"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
          <span>How is velocity weighted?</span>
        </button>

        {open && (
          <div
            id={hintId}
            role="region"
            aria-label="Velocity weighting explanation"
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2.5 z-20 w-72 p-4 rounded-xl bg-amber-50/95 border border-amber-200 shadow-lg text-left"
          >
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Lightbulb className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-amber-950">
                  Rolling 3-Sprint Average
                </h4>
                <p className="mt-1 text-xs text-amber-900/85 leading-relaxed">
                  Completed points are weighted <span className="font-mono tabular-nums font-semibold">0.5 · 0.3 · 0.2</span> from newest to oldest sprint.
                </p>
                <div className="mt-2.5 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-teal-800">
                    Excludes carry-over items
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-xs font-semibold text-amber-900 hover:underline focus-visible:outline-none focus-visible:underline"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
