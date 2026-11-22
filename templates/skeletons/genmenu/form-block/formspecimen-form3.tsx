import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { isValidEmail, isValidUrl } from '../../utils/validation';

interface Form3Data {
  legalName: string;
  email: string;
  portfolioUrl: string;
  yearsExp: string;
  discipline: string;
  startDate: string;
  relocate: boolean;
  coverNote: string;
}

const DEFAULT_DATA: Form3Data = {
  legalName: '',
  email: '',
  portfolioUrl: '',
  yearsExp: '',
  discipline: '',
  startDate: '',
  relocate: false,
  coverNote: '',
};

export function Form3() {
  const [data, setData] = useState<Form3Data>(DEFAULT_DATA);
  const [errors, setErrors] = useState<Partial<Record<keyof Form3Data, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (d: Form3Data) => {
    const e: Partial<Record<keyof Form3Data, string>> = {};
    if (d.legalName.trim().length < 2) e.legalName = 'Full legal name is required.';
    if (!isValidEmail(d.email)) e.email = 'Enter a valid email address.';
    if (!isValidUrl(d.portfolioUrl)) e.portfolioUrl = 'Enter a valid URL starting with https:// or http://.';
    const yrs = Number(d.yearsExp);
    if (d.yearsExp === '' || Number.isNaN(yrs) || yrs < 0 || yrs > 50) {
      e.yearsExp = 'Enter years between 0 and 50.';
    }
    if (!d.discipline) e.discipline = 'Choose a primary engineering discipline.';
    if (!d.startDate) e.startDate = 'Specify earliest availability date.';
    if (d.coverNote.trim().length < 30) e.coverNote = 'Provide at least 30 characters describing a past system.';
    return e;
  };

  const handleChange = <K extends keyof Form3Data>(key: K, val: Form3Data[K]) => {
    const next = { ...data, [key]: val };
    setData(next);
    if (errors[key]) {
      const recheck = validate(next);
      setErrors((prev) => ({ ...prev, [key]: recheck[key] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(data);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-3xl bg-white border border-slate-200 rounded-xl p-6 space-y-3">
        <div className="flex items-center gap-2.5 text-emerald-700">
          <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
          <h3 className="text-base font-semibold text-slate-900">Application Submitted</h3>
        </div>
        <p className="text-sm text-slate-600">
          Candidate <span className="font-medium text-slate-900">{data.legalName}</span> ({data.discipline},{' '}
          <span className="tabular-nums">{data.yearsExp}</span> yrs) registered for review starting{' '}
          <span className="font-mono text-xs">{data.startDate}</span>.
        </p>
        <button
          type="button"
          onClick={() => {
            setData(DEFAULT_DATA);
            setErrors({});
            setSubmitted(false);
          }}
          className="px-4 py-2 text-sm font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
        >
          Reset Application
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-3xl space-y-4">
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-semibold text-slate-900">Section 1: Candidate Identity</h3>
          <p className="text-xs text-slate-500">Contact coordinates used by our recruiting team.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="form3-name" className="block text-sm font-medium text-slate-700">
              Full Legal Name
            </label>
            <input
              id="form3-name"
              type="text"
              value={data.legalName}
              onChange={(e) => handleChange('legalName', e.target.value)}
              placeholder="Sora Takahashi"
              aria-invalid={Boolean(errors.legalName)}
              aria-describedby={errors.legalName ? 'form3-name-err' : undefined}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                errors.legalName ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-slate-900 focus:ring-slate-200'
              }`}
            />
            {errors.legalName && (
              <p id="form3-name-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {errors.legalName}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="form3-email" className="block text-sm font-medium text-slate-700">
              Email Address
            </label>
            <input
              id="form3-email"
              type="email"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="sora@domain.dev"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'form3-email-err' : undefined}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-slate-900 focus:ring-slate-200'
              }`}
            />
            {errors.email && (
              <p id="form3-email-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {errors.email}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-semibold text-slate-900">Section 2: Experience &amp; Track</h3>
          <p className="text-xs text-slate-500">Provide links to production work or public repositories.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <label htmlFor="form3-url" className="block text-sm font-medium text-slate-700">
              Portfolio or GitHub URL
            </label>
            <input
              id="form3-url"
              type="url"
              value={data.portfolioUrl}
              onChange={(e) => handleChange('portfolioUrl', e.target.value)}
              placeholder="https://github.com/username"
              aria-invalid={Boolean(errors.portfolioUrl)}
              aria-describedby={errors.portfolioUrl ? 'form3-url-err' : undefined}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                errors.portfolioUrl ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-slate-900 focus:ring-slate-200'
              }`}
            />
            {errors.portfolioUrl && (
              <p id="form3-url-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {errors.portfolioUrl}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="form3-years" className="block text-sm font-medium text-slate-700">
              Years Experience
            </label>
            <input
              id="form3-years"
              type="number"
              min={0}
              max={50}
              value={data.yearsExp}
              onChange={(e) => handleChange('yearsExp', e.target.value)}
              placeholder="5"
              aria-invalid={Boolean(errors.yearsExp)}
              aria-describedby={errors.yearsExp ? 'form3-years-err' : undefined}
              className={`w-full px-3 py-2 text-sm tabular-nums border rounded-md focus:outline-none focus:ring-2 ${
                errors.yearsExp ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-slate-900 focus:ring-slate-200'
              }`}
            />
            {errors.yearsExp && (
              <p id="form3-years-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {errors.yearsExp}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="form3-discipline" className="block text-sm font-medium text-slate-700">
            Primary Discipline
          </label>
          <select
            id="form3-discipline"
            value={data.discipline}
            onChange={(e) => handleChange('discipline', e.target.value)}
            aria-invalid={Boolean(errors.discipline)}
            aria-describedby={errors.discipline ? 'form3-discipline-err' : undefined}
            className={`w-full px-3 py-2 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 ${
              errors.discipline ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-slate-900 focus:ring-slate-200'
            }`}
          >
            <option value="">Select track...</option>
            <option value="Frontend Architecture">Frontend Architecture</option>
            <option value="Distributed Systems">Distributed Systems</option>
            <option value="Infrastructure & SRE">Infrastructure &amp; SRE</option>
            <option value="Applied ML Engineering">Applied ML Engineering</option>
          </select>
          {errors.discipline && (
            <p id="form3-discipline-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {errors.discipline}
            </p>
          )}
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-semibold text-slate-900">Section 3: Availability &amp; Technical Summary</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <div className="space-y-1.5">
            <label htmlFor="form3-start" className="block text-sm font-medium text-slate-700">
              Earliest Start Date
            </label>
            <input
              id="form3-start"
              type="date"
              value={data.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              aria-invalid={Boolean(errors.startDate)}
              aria-describedby={errors.startDate ? 'form3-start-err' : undefined}
              className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                errors.startDate ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-slate-900 focus:ring-slate-200'
              }`}
            />
            {errors.startDate && (
              <p id="form3-start-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {errors.startDate}
              </p>
            )}
          </div>
          <div className="pt-7 flex items-center gap-2.5">
            <input
              id="form3-relocate"
              type="checkbox"
              checked={data.relocate}
              onChange={(e) => handleChange('relocate', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <label htmlFor="form3-relocate" className="text-sm text-slate-700">
              Open to hybrid relocation
            </label>
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="form3-note" className="block text-sm font-medium text-slate-700">
            Architecture Highlight
          </label>
          <textarea
            id="form3-note"
            rows={3}
            value={data.coverNote}
            onChange={(e) => handleChange('coverNote', e.target.value)}
            placeholder="Describe a technical trade-off you led recently (min 30 chars)..."
            aria-invalid={Boolean(errors.coverNote)}
            aria-describedby={errors.coverNote ? 'form3-note-err' : undefined}
            className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
              errors.coverNote ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-slate-900 focus:ring-slate-200'
            }`}
          />
          {errors.coverNote && (
            <p id="form3-note-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {errors.coverNote}
            </p>
          )}
        </div>
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
          >
            Submit Application
          </button>
        </div>
      </section>
    </form>
  );
}
