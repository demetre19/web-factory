import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { SpecimenShell } from '../SpecimenShell';

const EXTERNAL_DOCS = [
  {
    title: 'WAI-ARIA Button Pattern',
    href: 'https://www.w3.org/WAI/ARIA/apg/patterns/button/',
    host: 'w3.org',
  },
  {
    title: 'MDN Anchor Element Guide',
    href: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a',
    host: 'developer.mozilla.org',
  },
];

export function Btn16() {
  const [lastClicked, setLastClicked] = useState<string>('None opened yet');

  return (
    <SpecimenShell
      index="16"
      id="Btn16"
      categoryLabel="Links & Confirmation"
      title="External Link with Icon Indicator"
      summary="Outbound reference links pairing diagonal arrow affordances with screen-reader new-tab announcements."
      ariaNote='rel="noopener noreferrer" & sr-only new-tab label'
    >
      <div className="space-y-3">
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {EXTERNAL_DOCS.map((doc) => (
            <li key={doc.href}>
              <a
                href={doc.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setLastClicked(doc.title)}
                className="group flex min-h-[44px] items-center justify-between gap-3 px-3.5 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
              >
                <span className="inline-flex items-center gap-1.5">
                  <span>{doc.title}</span>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-4 w-4 text-slate-400 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-700 group-focus-visible:translate-x-0.5 group-focus-visible:-translate-y-0.5"
                  />
                  <span className="sr-only">(opens in new tab)</span>
                </span>
                <span className="font-mono text-xs text-slate-500">{doc.host}</span>
              </a>
            </li>
          ))}
        </ul>

        <p aria-live="polite" className="font-mono text-xs text-slate-600">
          Last outbound reference: {lastClicked}
        </p>
      </div>
    </SpecimenShell>
  );
}

const DIRECTORY_LINKS = [
  { id: 'tokens', label: 'Token Architecture', note: 'Spacing, radius, and contrast scales.' },
  { id: 'motion', label: 'Motion Curves', note: 'Compositor-only 150ms easing tokens.' },
  { id: 'keyboard', label: 'Keyboard Map', note: 'Tab order, Enter/Space, and Escape paths.' },
];

export function Btn17() {
  const [selected, setSelected] = useState(DIRECTORY_LINKS[0]);

  return (
    <SpecimenShell
      index="17"
      id="Btn17"
      categoryLabel="Links & Confirmation"
      title="Animated Underline Link"
      summary="Editorial navigation anchors featuring a GPU-composited left-to-right underline glide on hover and keyboard focus."
      ariaNote="Compositor transform scaleX & focus-visible outline"
    >
      <div className="space-y-4">
        <nav aria-label="Specification chapters" className="flex flex-wrap items-center gap-5">
          {DIRECTORY_LINKS.map((item) => {
            const active = selected.id === item.id;
            return (
              <a
                key={item.id}
                href={`#chapter-${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  setSelected(item);
                }}
                aria-current={active ? 'page' : undefined}
                className={`group relative inline-flex items-center py-1.5 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 rounded-xs ${
                  active ? 'text-blue-700' : 'text-slate-800 hover:text-blue-700'
                }`}
              >
                <span>{item.label}</span>
                <span
                  aria-hidden="true"
                  className={`absolute bottom-0 left-0 h-[1.5px] w-full origin-left bg-blue-600 transition-transform duration-200 ease-out ${
                    active
                      ? 'scale-x-100'
                      : 'scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100'
                  }`}
                />
              </a>
            );
          })}
        </nav>

        <div className="rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-600">
          <span className="font-semibold text-slate-900">{selected.label}: </span>
          {selected.note}
        </div>
      </div>
    </SpecimenShell>
  );
}

const ARCHIVE_ENTRIES = [
  { id: 'rfc-14', title: 'RFC-14 · Focus Ring Contrast Ratios', href: '#archive-rfc-14' },
  { id: 'rfc-19', title: 'RFC-19 · Disabled vs Aria-Disabled Patterns', href: '#archive-rfc-19' },
  { id: 'rfc-23', title: 'RFC-23 · Touch Target Geometry Audit', href: '#archive-rfc-23' },
];

export function Btn18() {
  const [visitedIds, setVisitedIds] = useState<string[]>(['rfc-14']);

  const markVisited = (id: string) => {
    setVisitedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <SpecimenShell
      index="18"
      id="Btn18"
      categoryLabel="Links & Confirmation"
      title="Visited State Link"
      summary="Archive reading list distinguishing unvisited cobalt links from visited violet entries with an explicit status label."
      ariaNote="Native :visited CSS paired with explicit Visited text cue"
    >
      <div className="space-y-3">
        <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {ARCHIVE_ENTRIES.map((entry) => {
            const isVisited = visitedIds.includes(entry.id);
            return (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-3 px-3.5 py-2.5"
              >
                <a
                  href={entry.href}
                  onClick={(e) => {
                    e.preventDefault();
                    markVisited(entry.id);
                  }}
                  className={`text-sm font-medium underline underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:rounded-xs ${
                    isVisited
                      ? 'text-violet-800 decoration-violet-300 hover:text-violet-950'
                      : 'text-blue-700 decoration-blue-300 hover:text-blue-900'
                  } visited:text-violet-800`}
                >
                  {entry.title}
                </a>

                <span className="font-mono text-[11px] text-slate-500 whitespace-nowrap shrink-0">
                  {isVisited ? 'Visited' : 'Unread'}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-mono tabular-nums">
            {visitedIds.length} of {ARCHIVE_ENTRIES.length} read
          </span>
          <button
            type="button"
            onClick={() => setVisitedIds([])}
            className="font-medium text-slate-700 hover:text-slate-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
          >
            Reset read history
          </button>
        </div>
      </div>
    </SpecimenShell>
  );
}

const GLOSSARY_NOTES = {
  contrast: 'WCAG 2.2 requires at least 4.5:1 contrast for normal body text and 3:1 for focus indicators.',
  offset: 'Setting underline-offset-4 keeps descenders (g, j, p, q, y) legible without intersecting the rule.',
  targets: 'Interactive controls should maintain at least 40x40px clickable area on desktop and 44x44px on touch.',
} as const;

type GlossaryKey = keyof typeof GLOSSARY_NOTES;

export function Btn19() {
  const [activeNote, setActiveNote] = useState<GlossaryKey>('contrast');

  const handleTerm = (e: React.MouseEvent<HTMLAnchorElement>, key: GlossaryKey) => {
    e.preventDefault();
    setActiveNote(key);
  };

  return (
    <SpecimenShell
      index="19"
      id="Btn19"
      categoryLabel="Links & Confirmation"
      title="Text Links in Paragraph Context"
      summary="Prose-embedded reference links maintaining reading rhythm via measured underline offsets and subtle hover color shifts."
      ariaNote="Underline differentiation in prose & live glossary note"
    >
      <div className="space-y-3.5">
        <p className="max-w-[65ch] text-sm leading-relaxed text-slate-700">
          Accessible interfaces pair{' '}
          <a
            href="#glossary-contrast"
            onClick={(e) => handleTerm(e, 'contrast')}
            className="font-medium text-blue-700 underline decoration-blue-300 decoration-1 underline-offset-4 transition-colors hover:text-blue-900 hover:decoration-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:rounded-xs"
          >
            high-contrast focus rings
          </a>{' '}
          with clear typographic cues. Using a measured{' '}
          <a
            href="#glossary-offset"
            onClick={(e) => handleTerm(e, 'offset')}
            className="font-medium text-blue-700 underline decoration-blue-300 decoration-1 underline-offset-4 transition-colors hover:text-blue-900 hover:decoration-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:rounded-xs"
          >
            underline offset
          </a>{' '}
          keeps paragraph scanning effortless, while generous{' '}
          <a
            href="#glossary-targets"
            onClick={(e) => handleTerm(e, 'targets')}
            className="font-medium text-blue-700 underline decoration-blue-300 decoration-1 underline-offset-4 transition-colors hover:text-blue-900 hover:decoration-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:rounded-xs"
          >
            interactive hit targets
          </a>{' '}
          prevent mis-taps on compact screens.
        </p>

        <div
          aria-live="polite"
          className="rounded-md border border-slate-200 bg-white px-3.5 py-2.5 text-xs leading-relaxed text-slate-600"
        >
          <span className="font-semibold capitalize text-slate-900">{activeNote}: </span>
          {GLOSSARY_NOTES[activeNote]}
        </div>
      </div>
    </SpecimenShell>
  );
}

export function Btn20() {
  const [step, setStep] = useState<'idle' | 'armed' | 'deleted'>('idle');
  const [secondsLeft, setSecondsLeft] = useState(4);

  useEffect(() => {
    if (step !== 'armed') return;
    if (secondsLeft <= 0) {
      setStep('idle');
      return;
    }
    const timer = window.setTimeout(() => {
      setSecondsLeft((s) => s - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [step, secondsLeft]);

  const armDelete = () => {
    setSecondsLeft(4);
    setStep('armed');
  };

  return (
    <SpecimenShell
      index="20"
      id="Btn20"
      categoryLabel="Links & Confirmation"
      title="Two-Step Confirmation Button"
      summary="Destructive safeguard requiring an explicit second click within a 4-second window before executing teardown."
      ariaNote="aria-live arming state & explicit Cancel fallback"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-slate-900">staging-us-west-2</p>
            <p className="font-mono text-xs text-slate-500">
              {step === 'deleted' ? 'Cluster deprovisioned' : 'Active cluster · 3 nodes'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {step === 'idle' && (
              <button
                type="button"
                onClick={armDelete}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 text-red-700 transition-colors hover:border-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span>Delete Cluster</span>
              </button>
            )}

            {step === 'armed' && (
              <>
                <button
                  type="button"
                  onClick={() => setStep('deleted')}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold whitespace-nowrap shrink-0 text-white transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                >
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  <span className="font-mono tabular-nums">
                    Confirm Delete ({secondsLeft}s)
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep('idle')}
                  className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium whitespace-nowrap text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  Cancel
                </button>
              </>
            )}

            {step === 'deleted' && (
              <button
                type="button"
                onClick={() => setStep('idle')}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>Restore Cluster</span>
              </button>
            )}
          </div>
        </div>

        <p aria-live="polite" className="flex items-center gap-1.5 font-mono text-xs text-slate-600">
          {step === 'deleted' && (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
          )}
          <span>
            {step === 'idle' && 'Protected: Single click will arm confirmation'}
            {step === 'armed' && `Armed: Click confirm within ${secondsLeft}s or cancel`}
            {step === 'deleted' && 'Deleted: Cluster removed safely'}
          </span>
        </p>
      </div>
    </SpecimenShell>
  );
}
