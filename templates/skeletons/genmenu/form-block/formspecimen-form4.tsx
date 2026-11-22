import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface Form4State {
  projectTitle: string;
  leadApplicant: string;
  discipline: string;
  grantAmount: string;
  duration: string;
  abstract: string;
  budgetNotes: string;
}

const EMPTY_FORM4: Form4State = {
  projectTitle: '',
  leadApplicant: '',
  discipline: '',
  grantAmount: '12500',
  duration: '6 months',
  abstract: '',
  budgetNotes: '',
};

export function Form4() {
  const [state, setState] = useState<Form4State>(EMPTY_FORM4);
  const [errors, setErrors] = useState<Partial<Record<keyof Form4State, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (s: Form4State) => {
    const next: Partial<Record<keyof Form4State, string>> = {};
    if (s.projectTitle.trim().length < 4) next.projectTitle = 'Enter a project title (min 4 characters).';
    if (s.leadApplicant.trim().length < 2) next.leadApplicant = 'Lead applicant name is required.';
    if (!s.discipline) next.discipline = 'Select a creative or research discipline.';
    const amt = Number(s.grantAmount);
    if (!s.grantAmount || Number.isNaN(amt) || amt < 1000 || amt > 50000) {
      next.grantAmount = 'Grant request must be between $1,000 and $50,000.';
    }
    if (s.abstract.trim().length < 25) next.abstract = 'Abstract must contain at least 25 characters.';
    if (s.budgetNotes.trim().length < 15) next.budgetNotes = 'Provide a brief budget breakdown (min 15 chars).';
    return next;
  };

  const setField = <K extends keyof Form4State>(key: K, value: Form4State[K]) => {
    const updated = { ...state, [key]: value };
    setState(updated);
    if (errors[key]) {
      const recheck = validate(updated);
      setErrors((prev) => ({ ...prev, [key]: recheck[key] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(state);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSubmitted(true);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-3xl bg-stone-50 border border-stone-200 rounded-xl p-6 sm:p-8 space-y-6"
    >
      <div className="border-b border-stone-200 pb-4 space-y-1">
        <h3 className="text-lg font-semibold text-stone-900">Residency &amp; Grant Proposal</h3>
        <p className="text-sm text-stone-600">
          Warm two-column application with numeric budget bounds and explicit validation feedback.
        </p>
      </div>

      {submitted ? (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm space-y-1">
              <p className="font-semibold text-emerald-950">Proposal logged: {state.projectTitle}</p>
              <p className="text-emerald-800">
                Submitted by {state.leadApplicant} for <span className="font-mono tabular-nums">${Number(state.grantAmount).toLocaleString()}</span> over {state.duration}.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setState(EMPTY_FORM4);
              setErrors({});
              setSubmitted(false);
            }}
            className="px-4 py-2 text-sm font-medium text-stone-800 bg-stone-200 hover:bg-stone-300 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-800"
          >
            Draft New Proposal
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="form4-title" className="block text-sm font-medium text-stone-800">
                Project Title
              </label>
              <input
                id="form4-title"
                type="text"
                value={state.projectTitle}
                onChange={(e) => setField('projectTitle', e.target.value)}
                placeholder="Acoustic Timber Pavilions"
                aria-invalid={Boolean(errors.projectTitle)}
                aria-describedby={errors.projectTitle ? 'form4-title-err' : undefined}
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 ${
                  errors.projectTitle ? 'border-red-600 focus:ring-red-200' : 'border-stone-300 focus:border-amber-800 focus:ring-amber-100'
                }`}
              />
              {errors.projectTitle && (
                <p id="form4-title-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {errors.projectTitle}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="form4-lead" className="block text-sm font-medium text-stone-800">
                Lead Applicant
              </label>
              <input
                id="form4-lead"
                type="text"
                value={state.leadApplicant}
                onChange={(e) => setField('leadApplicant', e.target.value)}
                placeholder="Elena Rostova"
                aria-invalid={Boolean(errors.leadApplicant)}
                aria-describedby={errors.leadApplicant ? 'form4-lead-err' : undefined}
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 ${
                  errors.leadApplicant ? 'border-red-600 focus:ring-red-200' : 'border-stone-300 focus:border-amber-800 focus:ring-amber-100'
                }`}
              />
              {errors.leadApplicant && (
                <p id="form4-lead-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {errors.leadApplicant}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="form4-discipline" className="block text-sm font-medium text-stone-800">
                Discipline
              </label>
              <select
                id="form4-discipline"
                value={state.discipline}
                onChange={(e) => setField('discipline', e.target.value)}
                aria-invalid={Boolean(errors.discipline)}
                aria-describedby={errors.discipline ? 'form4-discipline-err' : undefined}
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-stone-900 focus:outline-none focus:ring-2 ${
                  errors.discipline ? 'border-red-600 focus:ring-red-200' : 'border-stone-300 focus:border-amber-800 focus:ring-amber-100'
                }`}
              >
                <option value="">Choose discipline...</option>
                <option value="Spatial Architecture">Spatial Architecture</option>
                <option value="Material Research">Material Research</option>
                <option value="Civic Journalism">Civic Journalism</option>
                <option value="Sound & Ecology">Sound &amp; Ecology</option>
              </select>
              {errors.discipline && (
                <p id="form4-discipline-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {errors.discipline}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="form4-amount" className="block text-sm font-medium text-stone-800">
                  Grant (USD)
                </label>
                <input
                  id="form4-amount"
                  type="number"
                  min={1000}
                  max={50000}
                  step={500}
                  value={state.grantAmount}
                  onChange={(e) => setField('grantAmount', e.target.value)}
                  aria-invalid={Boolean(errors.grantAmount)}
                  aria-describedby={errors.grantAmount ? 'form4-amount-err' : undefined}
                  className={`w-full px-3 py-2.5 text-sm tabular-nums bg-white border rounded-lg text-stone-900 focus:outline-none focus:ring-2 ${
                    errors.grantAmount ? 'border-red-600 focus:ring-red-200' : 'border-stone-300 focus:border-amber-800 focus:ring-amber-100'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="form4-duration" className="block text-sm font-medium text-stone-800">
                  Residency Term
                </label>
                <select
                  id="form4-duration"
                  value={state.duration}
                  onChange={(e) => setField('duration', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-white border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:border-amber-800 focus:ring-2 focus:ring-amber-100"
                >
                  <option value="3 months">3 months</option>
                  <option value="6 months">6 months</option>
                  <option value="12 months">12 months</option>
                </select>
              </div>
              {errors.grantAmount && (
                <p id="form4-amount-err" role="alert" className="col-span-2 text-xs text-red-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {errors.grantAmount}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="form4-abstract" className="block text-sm font-medium text-stone-800">
                Project Abstract
              </label>
              <textarea
                id="form4-abstract"
                rows={3}
                value={state.abstract}
                onChange={(e) => setField('abstract', e.target.value)}
                placeholder="Summarize the core research question and public output..."
                aria-invalid={Boolean(errors.abstract)}
                aria-describedby={errors.abstract ? 'form4-abstract-err' : undefined}
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 ${
                  errors.abstract ? 'border-red-600 focus:ring-red-200' : 'border-stone-300 focus:border-amber-800 focus:ring-amber-100'
                }`}
              />
              {errors.abstract && (
                <p id="form4-abstract-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {errors.abstract}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="form4-budget" className="block text-sm font-medium text-stone-800">
                Budget Allocation Notes
              </label>
              <textarea
                id="form4-budget"
                rows={3}
                value={state.budgetNotes}
                onChange={(e) => setField('budgetNotes', e.target.value)}
                placeholder="Materials, fabrication studio time, and archival documentation..."
                aria-invalid={Boolean(errors.budgetNotes)}
                aria-describedby={errors.budgetNotes ? 'form4-budget-err' : undefined}
                className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 ${
                  errors.budgetNotes ? 'border-red-600 focus:ring-red-200' : 'border-stone-300 focus:border-amber-800 focus:ring-amber-100'
                }`}
              />
              {errors.budgetNotes && (
                <p id="form4-budget-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {errors.budgetNotes}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-stone-500">All amounts in USD ($1,000–$50,000)</span>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-stone-50 bg-amber-900 hover:bg-amber-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-amber-900"
            >
              Submit Proposal
            </button>
          </div>
        </>
      )}
    </form>
  );
}
