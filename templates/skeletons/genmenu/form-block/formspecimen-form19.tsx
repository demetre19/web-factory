import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { isValidEmail } from '../../utils/validation';

const GOALS = [
  'Faster prototyping',
  'Accessibility compliance',
  'Design token sync',
  'Automated QA coverage',
] as const;

export function Form19() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState('');
  const [teamSize, setTeamSize] = useState('6–25');
  const [goals, setGoals] = useState<string[]>(['Accessibility compliance']);
  const [bottleneck, setBottleneck] = useState('');
  const [nps, setNps] = useState(8);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const toggleGoal = (goal: string) => {
    setGoals((prev) => (prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]));
    setError(null);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!role) {
        setError('Select your primary role before continuing.');
        return;
      }
      setError(null);
      setStep(2);
    } else if (step === 2) {
      if (goals.length === 0) {
        setError('Select at least one priority goal.');
        return;
      }
      if (bottleneck.trim().length < 10) {
        setError('Describe your current workflow bottleneck (at least 10 characters).');
        return;
      }
      setError(null);
      setStep(3);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError('Enter a valid email address to receive your summary.');
      return;
    }
    setError(null);
    setCompleted(true);
  };

  const resetSurvey = () => {
    setStep(1);
    setRole('');
    setTeamSize('6–25');
    setGoals(['Accessibility compliance']);
    setBottleneck('');
    setNps(8);
    setEmail('');
    setError(null);
    setCompleted(false);
  };

  if (completed) {
    return (
      <div className="max-w-2xl bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1.5">
            <h3 className="text-base font-semibold text-neutral-900">Onboarding Survey Complete</h3>
            <p className="text-sm text-neutral-600">
              Saved profile for <span className="font-medium text-neutral-900">{role}</span> (team {teamSize}) · Score{' '}
              <span className="font-mono tabular-nums font-medium text-neutral-900">{nps}/10</span> · Summary sent to{' '}
              <span className="font-medium text-neutral-900">{email}</span>.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={resetSurvey}
          className="px-4 py-2 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
        >
          Retake Survey
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-2xl bg-white border border-neutral-200 rounded-xl divide-y divide-neutral-200"
    >
      <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">Team Onboarding Survey</h3>
          <p className="text-xs text-neutral-500">Minimal multi-step wizard with per-step validation gating.</p>
        </div>
        <span className="text-xs font-mono tabular-nums text-neutral-700">Step {step} of 3</span>
      </div>

      <div className="px-6 pt-3 pb-4 bg-neutral-50/70">
        <div className="grid grid-cols-3 gap-2" aria-label="Survey progress">
          {[
            { num: 1, label: '01. Team Profile' },
            { num: 2, label: '02. Goals & Friction' },
            { num: 3, label: '03. Score & Delivery' },
          ].map((item) => (
            <div key={item.num} className="space-y-1.5">
              <div
                className={`h-1 rounded-full transition-colors ${
                  item.num <= step ? 'bg-neutral-900' : 'bg-neutral-200'
                }`}
              />
              <span className={`block text-xs ${item.num === step ? 'font-semibold text-neutral-900' : 'text-neutral-500'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {step === 1 && (
          <>
            <div className="space-y-1.5">
              <label htmlFor="form19-role" className="block text-sm font-medium text-neutral-800">
                Your Primary Role
              </label>
              <select
                id="form19-role"
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setError(null);
                }}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
              >
                <option value="">Select role...</option>
                <option value="Design Engineer">Design Engineer</option>
                <option value="Frontend Lead">Frontend Lead</option>
                <option value="Product Manager">Product Manager</option>
                <option value="Staff Architect">Staff Architect</option>
              </select>
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-neutral-800">Organization Size</legend>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['1–5', '6–25', '26–100', '100+'].map((sz) => (
                  <label
                    key={sz}
                    htmlFor={`form19-sz-${sz}`}
                    className={`flex items-center justify-center py-2.5 px-3 text-xs font-mono border rounded-lg cursor-pointer transition-colors ${
                      teamSize === sz
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    <input
                      id={`form19-sz-${sz}`}
                      type="radio"
                      name="form19-size"
                      value={sz}
                      checked={teamSize === sz}
                      onChange={() => setTeamSize(sz)}
                      className="sr-only"
                    />
                    {sz}
                  </label>
                ))}
              </div>
            </fieldset>
          </>
        )}

        {step === 2 && (
          <>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-neutral-800">Top Priorities (Select at least 1)</legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {GOALS.map((goal) => {
                  const id = `form19-goal-${goal.toLowerCase().replace(/\s+/g, '-')}`;
                  const checked = goals.includes(goal);
                  return (
                    <label
                      key={goal}
                      htmlFor={id}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 text-sm border rounded-lg cursor-pointer transition-colors ${
                        checked ? 'border-neutral-900 bg-neutral-50 font-medium text-neutral-900' : 'border-neutral-300 text-neutral-700'
                      }`}
                    >
                      <input
                        id={id}
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleGoal(goal)}
                        className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
                      />
                      <span>{goal}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="space-y-1.5">
              <label htmlFor="form19-bottleneck" className="block text-sm font-medium text-neutral-800">
                Biggest Current Bottleneck
              </label>
              <textarea
                id="form19-bottleneck"
                rows={3}
                value={bottleneck}
                onChange={(e) => {
                  setBottleneck(e.target.value);
                  setError(null);
                }}
                placeholder="Describe what slows down shipping today (min 10 chars)..."
                className="w-full px-3.5 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
              />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="form19-nps" className="text-sm font-medium text-neutral-800">
                  Likelihood to Standardize (1–10)
                </label>
                <span className="text-sm font-mono tabular-nums font-semibold text-neutral-900">{nps} / 10</span>
              </div>
              <input
                id="form19-nps"
                type="range"
                min={1}
                max={10}
                value={nps}
                onChange={(e) => setNps(Number(e.target.value))}
                className="w-full accent-neutral-900"
              />
              <div className="flex justify-between text-xs text-neutral-500">
                <span>1 · Exploratory</span>
                <span>10 · Ready now</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="form19-email" className="block text-sm font-medium text-neutral-800">
                Work Email for Tailored Checklist
              </label>
              <input
                id="form19-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="lead@company.com"
                className="w-full px-3.5 py-2.5 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
              />
            </div>
          </>
        )}

        {error && (
          <p role="alert" className="text-xs text-red-700 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>

      <div className="px-6 py-4 flex items-center justify-between gap-3 bg-neutral-50 rounded-b-xl">
        <button
          type="button"
          disabled={step === 1}
          onClick={() => {
            setError(null);
            setStep((prev) => (prev === 3 ? 2 : 1));
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg disabled:opacity-40 hover:bg-neutral-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Back
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
          >
            Next Step
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        ) : (
          <button
            type="submit"
            className="px-5 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
          >
            Complete Survey
          </button>
        )}
      </div>
    </form>
  );
}
