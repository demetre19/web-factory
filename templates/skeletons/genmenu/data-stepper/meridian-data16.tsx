import React, { useState } from 'react';
import { Check, Circle } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  detail: string;
  eta: string;
  done: boolean;
}

const INITIAL_STEPS: OnboardingStep[] = [
  { id: 'step-1', title: 'Connect primary warehouse', detail: 'Authorize read-only Snowflake or BigQuery service principal.', eta: '2 min', done: true },
  { id: 'step-2', title: 'Configure SAML single sign-on', detail: 'Upload Okta or Entra ID metadata XML and test login.', eta: '5 min', done: true },
  { id: 'step-3', title: 'Invite core engineering leads', detail: 'Assign Admin or Maintainer roles to initial workspace owners.', eta: '2 min', done: false },
  { id: 'step-4', title: 'Enable automated audit exports', detail: 'Route signed daily JSONL logs to your compliance bucket.', eta: '4 min', done: false },
];

export function Data16() {
  const [steps, setSteps] = useState<OnboardingStep[]>(INITIAL_STEPS);
  const [activeId, setActiveId] = useState<string>('step-3');

  const completedCount = steps.filter((s) => s.done).length;
  const pct = Math.round((completedCount / steps.length) * 100);

  const toggleDone = (id: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s))
    );
  };

  return (
    <section
      aria-label="Workspace onboarding progress tracker"
      className="rounded-xl border border-slate-200 bg-white p-6"
    >
      <div className="mb-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Workspace Setup Progress</h3>
            <p className="text-xs text-slate-500">Click any step checkbox to update readiness</p>
          </div>
          <span className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
            {completedCount}/{steps.length} complete ({pct}%)
          </span>
        </div>

        <div
          role="progressbar"
          aria-label="Workspace onboarding completion"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
        >
          <div
            className="h-full rounded-full bg-slate-900 transition-all duration-200"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <ol className="space-y-2.5">
        {steps.map((step, index) => {
          const isActive = activeId === step.id;
          return (
            <li
              key={step.id}
              className={`flex items-start justify-between gap-4 rounded-xl border p-4 transition-colors ${
                isActive ? 'border-slate-900 bg-slate-50/70' : 'border-slate-200 bg-white'
              }`}
            >
              <button
                type="button"
                aria-pressed={step.done}
                aria-label={`Mark "${step.title}" as ${step.done ? 'incomplete' : 'complete'}`}
                onClick={() => toggleDone(step.id)}
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  step.done
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-300 bg-white text-slate-400 hover:border-slate-500'
                }`}
              >
                {step.done ? (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Circle className="h-3 w-3" aria-hidden="true" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveId(step.id)}
                className="min-w-0 flex-1 text-left"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-slate-400 tabular-nums">
                    0{index + 1}.
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      step.done ? 'text-slate-500 line-through' : 'text-slate-900'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600">{step.detail}</p>
              </button>

              <span className="font-mono text-[11px] text-slate-500 tabular-nums whitespace-nowrap shrink-0">
                ~{step.eta}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
