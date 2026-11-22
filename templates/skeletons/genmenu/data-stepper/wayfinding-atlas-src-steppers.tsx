import { useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Layers,
  Globe,
  Sparkles,
} from 'lucide-react';
import { clampStep, getProgressPercent, getStepStatus } from '../../utils/stepLogic';

/* -------------------------------------------------------------------------- */
/* Way1: Numbered Horizontal Stepper (Spacious · Minimal)                     */
/* -------------------------------------------------------------------------- */
export function Way1() {
  const steps = [
    { id: 'shipping', label: 'Shipping Address', detail: 'Destination & courier' },
    { id: 'delivery', label: 'Delivery Window', detail: 'Scheduled arrival slot' },
    { id: 'payment', label: 'Payment Method', detail: 'Card or invoice billing' },
    { id: 'review', label: 'Final Review', detail: 'Confirm order summary' },
  ];
  const [active, setActive] = useState(1);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <nav aria-label="Checkout progress">
        <ol className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-0">
          {steps.map((step, idx) => {
            const status = getStepStatus(idx, active);
            const isLast = idx === steps.length - 1;
            return (
              <li key={step.id} className="relative flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2.5 sm:pr-4">
                <div className="flex items-center w-auto sm:w-full">
                  <button
                    type="button"
                    onClick={() => setActive(idx)}
                    aria-current={status === 'current' ? 'step' : undefined}
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold tabular-nums transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 ${
                      status === 'completed'
                        ? 'bg-slate-900 text-white hover:bg-slate-800'
                        : status === 'current'
                          ? 'bg-white text-slate-950 ring-2 ring-slate-950'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800'
                    }`}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </button>
                  {!isLast && (
                    <div
                      aria-hidden="true"
                      className={`hidden sm:block h-px flex-1 mx-3 transition-colors duration-150 ${
                        idx < active ? 'bg-slate-900' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <button
                    type="button"
                    onClick={() => setActive(idx)}
                    className={`text-left text-sm font-semibold transition-colors ${
                      status === 'upcoming' ? 'text-slate-500 hover:text-slate-800' : 'text-slate-950'
                    }`}
                  >
                    {step.label}
                  </button>
                  <p className="text-xs text-slate-500 mt-0.5">{step.detail}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Way2: Vertical Timeline Stepper (Spacious · Professional)                  */
/* -------------------------------------------------------------------------- */
export function Way2() {
  const milestones = [
    {
      id: 'schema',
      title: 'Schema Validation Passed',
      timestamp: '09:14 UTC',
      description: 'Verified 18 migration tables and foreign-key constraints without lock contention.',
    },
    {
      id: 'canary',
      title: 'Canary Cluster Rollout',
      timestamp: '09:22 UTC',
      description: 'Routing 15% of eu-central production traffic to build #4821 for latency sampling.',
    },
    {
      id: 'edge',
      title: 'Global Edge Replication',
      timestamp: 'Pending',
      description: 'Propagate signed configuration bundles across 24 regional edge PoPs.',
    },
    {
      id: 'verify',
      title: 'Post-Deploy Audit',
      timestamp: 'Pending',
      description: 'Archive deployment checksums and send release summary to engineering leads.',
    },
  ];
  const [currentIdx, setCurrentIdx] = useState(1);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <div className="flex items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-100">
        <span className="text-sm font-semibold text-slate-900">Release Pipeline #4821</span>
        <span className="text-xs font-mono tabular-nums text-slate-500">
          Stage {currentIdx + 1} / {milestones.length}
        </span>
      </div>
      <nav aria-label="Deployment timeline">
        <ol className="space-y-0">
          {milestones.map((item, idx) => {
            const status = getStepStatus(idx, currentIdx);
            const isLast = idx === milestones.length - 1;
            return (
              <li key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className={`absolute left-[15px] top-8 bottom-0 w-px ${
                      status === 'completed' ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                  />
                )}
                <button
                  type="button"
                  onClick={() => setCurrentIdx(idx)}
                  aria-current={status === 'current' ? 'step' : undefined}
                  aria-label={`Select stage: ${item.title}`}
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                    status === 'completed'
                      ? 'bg-blue-600 text-white'
                      : status === 'current'
                        ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-600'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {status === 'completed' ? <Check className="h-4 w-4" aria-hidden="true" /> : idx + 1}
                </button>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentIdx(idx)}
                      className={`text-sm font-semibold text-left ${
                        status === 'upcoming' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-950'
                      }`}
                    >
                      {item.title}
                    </button>
                    <span className="text-xs font-mono tabular-nums text-slate-500">
                      {status === 'completed'
                        ? `Completed · ${item.timestamp}`
                        : status === 'current'
                          ? 'In progress'
                          : 'Queued'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">{item.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Way3: Checkmark-Completed Progress Bar (Compact · Dark)                    */
/* -------------------------------------------------------------------------- */
export function Way3() {
  const steps = ['Repository', 'Dependencies', 'Security Scan', 'Container', 'Live'];
  const [current, setCurrent] = useState(2);
  const percent = getProgressPercent(current, steps.length);

  return (
    <div className="bg-slate-950 text-slate-100 p-5 rounded-xl border border-slate-800">
      <div className="flex items-center justify-between gap-4 mb-4">
        <span className="text-xs font-medium tracking-wide text-slate-300">
          Build Verification Checklist
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono tabular-nums text-emerald-400">{percent}%</span>
          <button
            type="button"
            onClick={() => setCurrent((c) => clampStep(c - 1, steps.length))}
            disabled={current === 0}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 disabled:opacity-40 whitespace-nowrap shrink-0"
          >
            Prev
          </button>
          <button
            type="button"
            onClick={() => setCurrent((c) => clampStep(c + 1, steps.length))}
            disabled={current === steps.length - 1}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40 whitespace-nowrap shrink-0"
          >
            Advance
          </button>
        </div>
      </div>

      <nav aria-label="Build checklist">
        <div className="relative">
          <div aria-hidden="true" className="absolute top-4 left-4 right-4 h-0.5 bg-slate-800" />
          <div
            aria-hidden="true"
            className="absolute top-4 left-4 h-0.5 bg-emerald-500 transition-all duration-200"
            style={{ width: `calc(${percent}% - ${percent === 0 ? 0 : 16}px)` }}
          />
          <ol className="relative z-10 flex items-start justify-between gap-2">
            {steps.map((label, idx) => {
              const status = getStepStatus(idx, current);
              return (
                <li key={label} className="flex flex-col items-center text-center min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => setCurrent(idx)}
                    aria-current={status === 'current' ? 'step' : undefined}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                      status === 'completed'
                        ? 'bg-emerald-500 text-slate-950'
                        : status === 'current'
                          ? 'bg-slate-900 text-emerald-400 ring-2 ring-emerald-500'
                          : 'bg-slate-900 text-slate-500 border border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    {status === 'completed' ? <Check className="h-4 w-4 stroke-[2.5]" aria-hidden="true" /> : idx + 1}
                  </button>
                  <span
                    className={`mt-2 text-xs font-medium truncate max-w-full ${
                      status === 'upcoming' ? 'text-slate-500' : 'text-slate-100'
                    }`}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Way4: Clickable Tab-Rule Stepper (Compact · Minimal)                       */
/* -------------------------------------------------------------------------- */
export function Way4() {
  const stages = [
    { id: 'details', name: '1. Project Details', summary: 'Configure repository slug, primary region, and license.' },
    { id: 'team', name: '2. Team Access', summary: 'Assign maintainers, reviewers, and SSO group policies.' },
    { id: 'billing', name: '3. Usage Limits', summary: 'Set monthly compute spend caps and alert thresholds.' },
    { id: 'launch', name: '4. Provision', summary: 'Review manifest and allocate production cluster.' },
  ];
  const [selected, setSelected] = useState(0);

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200">
      <nav aria-label="Workspace setup stages">
        <ol className="grid grid-cols-2 sm:grid-cols-4 border-b border-slate-200">
          {stages.map((stage, idx) => {
            const isCurrent = idx === selected;
            const isDone = idx < selected;
            return (
              <li key={stage.id}>
                <button
                  type="button"
                  onClick={() => setSelected(idx)}
                  aria-current={isCurrent ? 'step' : undefined}
                  className={`w-full py-3 px-2 text-left text-xs sm:text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap truncate focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-900 ${
                    isCurrent
                      ? 'border-slate-950 text-slate-950 font-semibold'
                      : isDone
                        ? 'border-slate-400 text-slate-700 hover:text-slate-950'
                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                  }`}
                >
                  {stage.name}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
      <div className="pt-3.5 flex items-center justify-between gap-4">
        <p className="text-sm text-slate-600">{stages[selected].summary}</p>
        <span className="text-xs font-mono tabular-nums text-slate-500 whitespace-nowrap shrink-0">
          {selected + 1} of {stages.length}
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Way5: Compact Mobile Fraction Stepper (Compact · Colourful)                */
/* -------------------------------------------------------------------------- */
export function Way5() {
  const steps = [
    'Select Identity Document',
    'Capture Front & Back',
    'Liveness Selfie Check',
    'Address Confirmation',
    'Submit Verification',
  ];
  const [stepIdx, setStepIdx] = useState(1);

  return (
    <div className="max-w-sm mx-auto bg-gradient-to-br from-indigo-600 to-violet-700 text-white p-4 rounded-xl shadow-sm">
      <nav aria-label="Mobile verification steps">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium text-indigo-100 tabular-nums">
              Step {stepIdx + 1} of {steps.length}
            </p>
            <p className="text-sm font-semibold text-white truncate mt-0.5">
              {steps[stepIdx]}
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setStepIdx((s) => clampStep(s - 1, steps.length))}
              disabled={stepIdx === 0}
              aria-label="Previous verification step"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15 hover:bg-white/25 disabled:opacity-35 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setStepIdx((s) => clampStep(s + 1, steps.length))}
              disabled={stepIdx === steps.length - 1}
              aria-label="Next verification step"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-indigo-700 hover:bg-indigo-50 disabled:opacity-40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <ol className="grid grid-cols-5 gap-1.5 mt-3.5" aria-label="Step progress segments">
          {steps.map((label, idx) => {
            const status = getStepStatus(idx, stepIdx);
            return (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => setStepIdx(idx)}
                  aria-label={`Jump to step ${idx + 1}: ${label}`}
                  aria-current={status === 'current' ? 'step' : undefined}
                  className={`block w-full h-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                    status === 'completed'
                      ? 'bg-emerald-300'
                      : status === 'current'
                        ? 'bg-white'
                        : 'bg-white/25 hover:bg-white/40'
                  }`}
                />
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Way6: Descriptive Grid Stepper (Spacious · Professional)                   */
/* -------------------------------------------------------------------------- */
export function Way6() {
  const steps = [
    {
      id: 'brief',
      label: '01 · Campaign Brief',
      description: 'Define target audience segments, conversion goals, and budget ceiling.',
    },
    {
      id: 'creative',
      label: '02 · Creative Assets',
      description: 'Upload localized headlines, product shots, and aspect-ratio variants.',
    },
    {
      id: 'schedule',
      label: '03 · Flight Schedule',
      description: 'Set timezone delivery windows and frequency caps across regions.',
    },
    {
      id: 'launch',
      label: '04 · Compliance & Go',
      description: 'Run automated brand-safety checks before activating live impressions.',
    },
  ];
  const [active, setActive] = useState(2);

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <nav aria-label="Campaign creation steps">
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, idx) => {
            const status = getStepStatus(idx, active);
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => setActive(idx)}
                  aria-current={status === 'current' ? 'step' : undefined}
                  className={`w-full text-left pt-3.5 border-t-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                    status === 'completed'
                      ? 'border-blue-600'
                      : status === 'current'
                        ? 'border-slate-950'
                        : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-semibold tabular-nums ${
                        status === 'completed'
                          ? 'text-blue-700'
                          : status === 'current'
                            ? 'text-slate-950'
                            : 'text-slate-500'
                      }`}
                    >
                      {step.label}
                    </span>
                    {status === 'completed' && (
                      <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" aria-label="Completed" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {step.description}
                  </p>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Way7: Interactive Form Wizard with Next/Back (Spacious · Dark)             */
/* -------------------------------------------------------------------------- */
export function Way7() {
  const wizardSteps = [
    {
      id: 'account',
      title: 'Organization',
      icon: ShieldCheck,
      prompt: 'Choose primary governance profile for this workspace.',
      options: ['Standard SOC-2 Baseline', 'Strict HIPAA Isolation'],
    },
    {
      id: 'workspace',
      title: 'Region',
      icon: Globe,
      prompt: 'Select primary compute cluster for data residency.',
      options: ['US East (Virginia)', 'EU Central (Frankfurt)'],
    },
    {
      id: 'integrations',
      title: 'Webhooks',
      icon: Layers,
      prompt: 'Enable automated event streaming destinations.',
      options: ['Datadog Metrics Sink', 'PagerDuty Critical Alerts'],
    },
    {
      id: 'confirm',
      title: 'Confirm',
      icon: Sparkles,
      prompt: 'Review selected configuration and finalize provisioning.',
      options: [],
    },
  ];

  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState<Record<number, string>>({
    0: 'Standard SOC-2 Baseline',
    1: 'EU Central (Frankfurt)',
    2: 'Datadog Metrics Sink',
  });
  const [completed, setCompleted] = useState(false);

  const currentData = wizardSteps[step];
  const Icon = currentData.icon;

  return (
    <div className="bg-zinc-900 text-zinc-100 p-6 rounded-xl border border-zinc-800">
      <nav aria-label="Wizard steps" className="pb-5 border-b border-zinc-800">
        <ol className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {wizardSteps.map((ws, idx) => {
            const status = completed ? 'completed' : getStepStatus(idx, step);
            return (
              <li key={ws.id}>
                <button
                  type="button"
                  onClick={() => {
                    setCompleted(false);
                    setStep(idx);
                  }}
                  aria-current={!completed && status === 'current' ? 'step' : undefined}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                    status === 'current'
                      ? 'bg-zinc-800 text-white ring-1 ring-amber-400/70'
                      : status === 'completed'
                        ? 'bg-zinc-800/50 text-emerald-300 hover:bg-zinc-800'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${
                      status === 'completed'
                        ? 'bg-emerald-500 text-zinc-950'
                        : status === 'current'
                          ? 'bg-amber-400 text-zinc-950'
                          : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {status === 'completed' ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : idx + 1}
                  </span>
                  <span className="text-xs font-semibold truncate">{ws.title}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="py-5">
        {completed ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-emerald-950/50 border border-emerald-800/60 rounded-lg p-4">
            <div>
              <p className="text-sm font-semibold text-emerald-300">Workspace Provisioning Queued</p>
              <p className="text-xs text-zinc-300 mt-1">
                {choices[0]} · {choices[1]} · {choices[2]}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCompleted(false);
                setStep(0);
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-zinc-800 text-zinc-100 hover:bg-zinc-700 whitespace-nowrap shrink-0"
            >
              Restart Wizard
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-amber-300">
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <h4 className="text-sm font-semibold text-white">
                Step {step + 1}: {currentData.title}
              </h4>
            </div>
            <p className="text-sm text-zinc-400 mt-1">{currentData.prompt}</p>

            {currentData.options.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
                {currentData.options.map((option) => {
                  const selectedOption = choices[step] === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setChoices((prev) => ({ ...prev, [step]: option }))}
                      aria-pressed={selectedOption}
                      className={`px-3.5 py-2.5 rounded-lg text-left text-xs font-medium border transition-colors ${
                        selectedOption
                          ? 'bg-zinc-800 border-amber-400 text-white'
                          : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            ) : (
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 bg-zinc-950/70 p-3.5 rounded-lg border border-zinc-800 text-xs">
                <div>
                  <dt className="text-zinc-500">Governance</dt>
                  <dd className="text-zinc-100 font-medium mt-0.5">{choices[0]}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Cluster</dt>
                  <dd className="text-zinc-100 font-medium mt-0.5">{choices[1]}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Telemetry</dt>
                  <dd className="text-zinc-100 font-medium mt-0.5">{choices[2]}</dd>
                </div>
              </dl>
            )}
          </div>
        )}
      </div>

      {!completed && (
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={() => setStep((s) => clampStep(s - 1, wizardSteps.length))}
            disabled={step === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-zinc-700 text-zinc-200 hover:bg-zinc-800 disabled:opacity-40 whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Back
          </button>
          <span className="text-xs font-mono tabular-nums text-zinc-500">
            {step + 1} / {wizardSteps.length}
          </span>
          {step < wizardSteps.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => clampStep(s + 1, wizardSteps.length))}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-400 text-zinc-950 hover:bg-amber-300 whitespace-nowrap shrink-0"
            >
              Next Step
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCompleted(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-zinc-950 hover:bg-emerald-400 whitespace-nowrap shrink-0"
            >
              Finish Setup
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Way8: Multi-Section Grouped Stepper (Spacious · Colourful)                 */
/* -------------------------------------------------------------------------- */
export function Way8() {
  const sections = [
    {
      id: 'discovery',
      phase: 'Phase I · Discovery',
      accent: 'text-amber-700 border-amber-500 bg-amber-50',
      dot: 'bg-amber-600',
      steps: ['Stakeholder Interviews', 'System Inventory'],
    },
    {
      id: 'build',
      phase: 'Phase II · Build',
      accent: 'text-sky-700 border-sky-500 bg-sky-50',
      dot: 'bg-sky-600',
      steps: ['API Contract', 'Component Kit'],
    },
    {
      id: 'release',
      phase: 'Phase III · Release',
      accent: 'text-emerald-700 border-emerald-500 bg-emerald-50',
      dot: 'bg-emerald-600',
      steps: ['Load Testing', 'GA Rollout'],
    },
  ];

  const flatSteps = sections.flatMap((sec) => sec.steps);
  const [activeFlat, setActiveFlat] = useState(2);

  let runningIndex = 0;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200">
      <nav aria-label="Grouped project phases">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {sections.map((section) => {
            const startIdx = runningIndex;
            const endIdx = startIdx + section.steps.length - 1;
            const doneCount = Math.max(
              0,
              Math.min(section.steps.length, activeFlat - startIdx)
            );
            const sectionNodes = section.steps.map((label, localIdx) => {
              const globalIdx = startIdx + localIdx;
              const status = getStepStatus(globalIdx, activeFlat);
              return { label, globalIdx, status };
            });
            runningIndex += section.steps.length;

            const isPhaseActive = activeFlat >= startIdx && activeFlat <= endIdx;

            return (
              <div
                key={section.id}
                className={`rounded-xl border p-4 transition-colors ${
                  isPhaseActive ? 'border-slate-300 bg-slate-50/70' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200/80">
                  <span className={`text-xs font-semibold ${section.accent.split(' ')[0]}`}>
                    {section.phase}
                  </span>
                  <span className="text-xs font-mono tabular-nums text-slate-500">
                    {doneCount}/{section.steps.length}
                  </span>
                </div>
                <ol className="space-y-2">
                  {sectionNodes.map((node) => (
                    <li key={node.label}>
                      <button
                        type="button"
                        onClick={() => setActiveFlat(node.globalIdx)}
                        aria-current={node.status === 'current' ? 'step' : undefined}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                          node.status === 'current'
                            ? 'bg-white text-slate-950 shadow-xs ring-1 ring-slate-300 font-semibold'
                            : node.status === 'completed'
                              ? 'text-slate-700 hover:bg-white'
                              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/70'
                        }`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums ${
                            node.status === 'completed'
                              ? 'bg-emerald-600 text-white'
                              : node.status === 'current'
                                ? `${section.dot} text-white`
                                : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {node.status === 'completed' ? (
                            <Check className="h-3 w-3" aria-hidden="true" />
                          ) : (
                            node.globalIdx + 1
                          )}
                        </span>
                        <span className="truncate">{node.label}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
            );
          })}
        </div>
      </nav>
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Active milestone: <strong className="text-slate-900">{flatSteps[activeFlat]}</strong></span>
        <span className="font-mono tabular-nums">
          Overall {activeFlat + 1} / {flatSteps.length}
        </span>
      </div>
    </div>
  );
}
