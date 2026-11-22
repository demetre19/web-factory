import { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  Download,
  Loader2,
  ShieldAlert,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { clampProgress } from '../../utils/catalogFilter';
import { SpecimenShell } from '../SpecimenShell';

export function Btn6() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    if (status !== 'loading') return;
    const timer = window.setTimeout(() => {
      setStatus('success');
    }, 1100);
    return () => window.clearTimeout(timer);
  }, [status]);

  const handleRun = () => {
    if (status === 'loading') return;
    setStatus('loading');
  };

  return (
    <SpecimenShell
      index="06"
      id="Btn6"
      categoryLabel="Feedback & Variants"
      title="Inline Spinner Loading Button"
      summary="Async submission button maintaining fixed minimum geometry while swapping between idle, spinner, and verified states."
      ariaNote="aria-busy during request & aria-live status region"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-slate-800">Webhook Endpoint</p>
            <p className="font-mono text-xs text-slate-500">https://api.example.com/hooks</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-busy={status === 'loading'}
              onClick={handleRun}
              className={`inline-flex min-h-[40px] min-w-[176px] items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                status === 'success'
                  ? 'bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600'
              } ${status === 'loading' ? 'cursor-wait opacity-90' : ''}`}
            >
              {status === 'loading' && (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  <span>Verifying...</span>
                </>
              )}
              {status === 'success' && (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  <span>Verified</span>
                </>
              )}
              {status === 'idle' && <span>Verify Endpoint</span>}
            </button>

            {status === 'success' && (
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="inline-flex min-h-[40px] items-center justify-center rounded-lg px-3 py-2 text-xs font-medium whitespace-nowrap text-slate-600 transition-colors hover:bg-slate-200/70 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <p aria-live="polite" className="text-xs text-slate-600 font-mono">
          {status === 'idle' && 'Idle: Click to run verification handshake'}
          {status === 'loading' && 'Busy: Checking TLS certificate and response code...'}
          {status === 'success' && 'Complete: HTTP 200 OK received'}
        </p>
      </div>
    </SpecimenShell>
  );
}

export function Btn7() {
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (phase !== 'running') return;
    const interval = window.setInterval(() => {
      setProgress((prev) => {
        const next = clampProgress(prev + 12);
        if (next >= 100) {
          setPhase('done');
        }
        return next;
      });
    }, 160);
    return () => window.clearInterval(interval);
  }, [phase]);

  const startExport = () => {
    setProgress(8);
    setPhase('running');
  };

  const cancelExport = () => {
    setPhase('idle');
    setProgress(0);
  };

  return (
    <SpecimenShell
      index="07"
      id="Btn7"
      categoryLabel="Feedback & Variants"
      title="Progress Fill Loading Button"
      summary="Determinate export control sweeping a live progress layer beneath crisp foreground typography."
      ariaNote='aria-busy & role="progressbar" value tracking'
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-xs text-slate-600">
            tokens-bundle-v4.zip · 14.2 MB
          </span>
          <span className="font-mono text-xs tabular-nums text-slate-500">
            {progress}%
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            aria-busy={phase === 'running'}
            onClick={phase === 'running' ? undefined : startExport}
            className={`relative inline-flex min-h-[42px] min-w-[210px] items-center justify-center overflow-hidden rounded-lg border px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
              phase === 'done'
                ? 'border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800'
                : 'border-slate-900 bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {phase === 'running' && (
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 bg-blue-600 transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-2 font-sans">
              {phase === 'idle' && (
                <>
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span>Export Bundle</span>
                </>
              )}
              {phase === 'running' && (
                <span className="font-mono tabular-nums">Exporting {progress}%</span>
              )}
              {phase === 'done' && (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  <span>Bundle Ready · Re-run</span>
                </>
              )}
            </span>
          </button>

          {phase === 'running' && (
            <button
              type="button"
              onClick={cancelExport}
              className="inline-flex min-h-[42px] items-center justify-center rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium whitespace-nowrap text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Cancel
            </button>
          )}
        </div>

        <div
          role="progressbar"
          aria-label="Bundle export progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
        >
          <div
            className={`h-full transition-all duration-150 ${
              phase === 'done' ? 'bg-emerald-600' : 'bg-blue-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </SpecimenShell>
  );
}

export function Btn8() {
  const [selectedPlan, setSelectedPlan] = useState<'none' | 'pro' | 'enterprise'>('none');

  return (
    <SpecimenShell
      index="08"
      id="Btn8"
      categoryLabel="Feedback & Variants"
      title="Directional Gradient Buttons"
      summary="Refined satin gradient CTAs with subtle hover lift and guaranteed WCAG AA white-on-deep-ink legibility."
      ariaNote="High-contrast dark gradient stops & focus-visible offset"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setSelectedPlan('pro')}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 px-5 py-2.5 text-sm font-semibold whitespace-nowrap shrink-0 text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:from-blue-800 hover:via-blue-700 hover:to-sky-700 hover:shadow-md active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span>Upgrade to Pro</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setSelectedPlan('enterprise')}
            className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-gradient-to-b from-slate-800 to-slate-950 px-5 py-2.5 text-sm font-semibold whitespace-nowrap shrink-0 text-white shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:from-slate-700 hover:to-slate-900 hover:shadow-md active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            <span>Contact Sales</span>
          </button>
        </div>

        <p aria-live="polite" className="text-xs text-slate-600">
          {selectedPlan === 'none' && 'Select a gradient CTA to preview plan selection.'}
          {selectedPlan === 'pro' && 'Selected: Team Pro Plan ($29/seat monthly)'}
          {selectedPlan === 'enterprise' && 'Selected: Enterprise SLA Inquiry'}
        </p>
      </div>
    </SpecimenShell>
  );
}

export function Btn9() {
  const [log, setLog] = useState('All token scopes nominal');

  return (
    <SpecimenShell
      index="09"
      id="Btn9"
      categoryLabel="Feedback & Variants"
      title="Hairline Outline Buttons"
      summary="Crisp bordered neutral, accent, and cautionary outline controls that invert cleanly on hover without heavy fills."
      ariaNote="Icon + label semantic clarity without hue-only cues"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setLog('Secret rotation queued')}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-300 bg-transparent px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 text-slate-800 transition-colors duration-150 hover:border-slate-900 hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          >
            Rotate Secret
          </button>

          <button
            type="button"
            onClick={() => setLog('Opened audit trail inspector')}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-blue-600 bg-transparent px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 text-blue-700 transition-colors duration-150 hover:bg-blue-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <Terminal className="h-4 w-4" aria-hidden="true" />
            <span>Audit Log</span>
          </button>

          <button
            type="button"
            onClick={() => setLog('Revocation warning acknowledged')}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-red-300 bg-transparent px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 text-red-700 transition-colors duration-150 hover:border-red-600 hover:bg-red-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
          >
            <ShieldAlert className="h-4 w-4" aria-hidden="true" />
            <span>Revoke Key</span>
          </button>
        </div>

        <p aria-live="polite" className="font-mono text-xs text-slate-600">
          Scope log: {log}
        </p>
      </div>
    </SpecimenShell>
  );
}

const RADIUS_MODES = {
  square: { label: 'Square', token: 'rounded-none (0px)', cls: 'rounded-none' },
  standard: { label: 'Standard', token: 'rounded-lg (8px)', cls: 'rounded-lg' },
  pill: { label: 'Pill', token: 'rounded-full (9999px)', cls: 'rounded-full' },
} as const;

type RadiusKey = keyof typeof RADIUS_MODES;

export function Btn10() {
  const [radiusMode, setRadiusMode] = useState<RadiusKey>('pill');
  const [clicks, setClicks] = useState(0);
  const active = RADIUS_MODES[radiusMode];

  return (
    <SpecimenShell
      index="10"
      id="Btn10"
      categoryLabel="Feedback & Variants"
      title="Pill vs Square Radius Variants"
      summary="Live geometry comparator contrasting architectural square edges, standard 8px corners, and full-pill silhouettes."
      ariaNote="aria-pressed geometry switcher & consistent 40px height"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div role="group" aria-label="Button corner geometry" className="inline-flex rounded-lg bg-slate-200/75 p-1">
            {(Object.keys(RADIUS_MODES) as RadiusKey[]).map((key) => {
              const selected = radiusMode === key;
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setRadiusMode(key)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    selected
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {RADIUS_MODES[key].label}
                </button>
              );
            })}
          </div>

          <span className="font-mono text-xs text-slate-600">{active.token}</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => setClicks((c) => c + 1)}
            className={`inline-flex min-h-[40px] items-center justify-center bg-slate-900 px-5 py-2 text-sm font-medium whitespace-nowrap shrink-0 text-white transition-all duration-150 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${active.cls}`}
          >
            Continue
          </button>

          <button
            type="button"
            onClick={() => setClicks((c) => c + 1)}
            className={`inline-flex min-h-[40px] items-center justify-center border border-slate-300 bg-white px-5 py-2 text-sm font-medium whitespace-nowrap shrink-0 text-slate-800 transition-all duration-150 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${active.cls}`}
          >
            Learn More
          </button>
        </div>

        <p className="font-mono text-xs tabular-nums text-slate-500">
          Sample interactions: {clicks}
        </p>
      </div>
    </SpecimenShell>
  );
}
