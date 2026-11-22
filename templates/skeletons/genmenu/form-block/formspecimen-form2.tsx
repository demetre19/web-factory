import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { isValidEmail, isValidPhone } from '../../utils/validation';

interface Form2State {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companySize: string;
  preferredChannel: 'email' | 'phone' | 'video';
  brief: string;
}

const INITIAL_STATE: Form2State = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  companySize: '',
  preferredChannel: 'email',
  brief: '',
};

export function Form2() {
  const [values, setValues] = useState<Form2State>(INITIAL_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof Form2State, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (data: Form2State) => {
    const next: Partial<Record<keyof Form2State, string>> = {};
    if (!data.firstName.trim()) next.firstName = 'First name is required.';
    if (!data.lastName.trim()) next.lastName = 'Last name is required.';
    if (!isValidEmail(data.email)) next.email = 'Provide a valid business email.';
    if (!isValidPhone(data.phone)) next.phone = 'Enter a valid 7–15 digit phone number.';
    if (!data.companySize) next.companySize = 'Select an organization size.';
    if (data.brief.trim().length < 15) next.brief = 'Share at least 15 characters about your project.';
    return next;
  };

  const updateField = <K extends keyof Form2State>(key: K, val: Form2State[K]) => {
    const updated = { ...values, [key]: val };
    setValues(updated);
    if (errors[key]) {
      const recheck = validate(updated);
      setErrors((prev) => ({ ...prev, [key]: recheck[key] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setSubmitted(true);
    }
  };

  const inputBase =
    'w-full px-3.5 py-2.5 text-sm bg-white border rounded-md text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2';

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-3xl bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden"
    >
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Enterprise Consultation</h3>
          <p className="text-xs text-slate-600">Two-column professional layout with preferred contact channel.</p>
        </div>
        <span className="text-xs font-medium text-slate-500">Response SLA: 4 business hours</span>
      </div>

      {submitted ? (
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-emerald-950">Consultation scheduled in queue</p>
              <p className="text-emerald-800">
                Our solutions team will reach out to {values.firstName} {values.lastName} via{' '}
                <span className="font-medium">{values.preferredChannel}</span> ({values.companySize}).
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setValues(INITIAL_STATE);
              setErrors({});
              setSubmitted(false);
            }}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            Submit another request
          </button>
        </div>
      ) : (
        <div className="p-6 space-y-5">
          {Object.keys(errors).length > 0 && (
            <div role="alert" className="flex items-center gap-2.5 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-700 shrink-0" aria-hidden="true" />
              <span>Please resolve {Object.keys(errors).length} highlighted field(s) before submitting.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="form2-first" className="block text-sm font-medium text-slate-700">
                First Name
              </label>
              <input
                id="form2-first"
                type="text"
                value={values.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                placeholder="Marcus"
                aria-invalid={Boolean(errors.firstName)}
                aria-describedby={errors.firstName ? 'form2-first-err' : undefined}
                className={`${inputBase} ${errors.firstName ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'}`}
              />
              {errors.firstName && (
                <p id="form2-first-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {errors.firstName}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="form2-last" className="block text-sm font-medium text-slate-700">
                Last Name
              </label>
              <input
                id="form2-last"
                type="text"
                value={values.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                placeholder="Chen"
                aria-invalid={Boolean(errors.lastName)}
                aria-describedby={errors.lastName ? 'form2-last-err' : undefined}
                className={`${inputBase} ${errors.lastName ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'}`}
              />
              {errors.lastName && (
                <p id="form2-last-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {errors.lastName}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="form2-email" className="block text-sm font-medium text-slate-700">
                Business Email
              </label>
              <input
                id="form2-email"
                type="email"
                value={values.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="m.chen@acmecorp.io"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'form2-email-err' : undefined}
                className={`${inputBase} ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'}`}
              />
              {errors.email && (
                <p id="form2-email-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="form2-phone" className="block text-sm font-medium text-slate-700">
                Direct Phone
              </label>
              <input
                id="form2-phone"
                type="tel"
                value={values.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+1 (415) 555-0192"
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={errors.phone ? 'form2-phone-err' : undefined}
                className={`${inputBase} ${errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'}`}
              />
              {errors.phone && (
                <p id="form2-phone-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="form2-size" className="block text-sm font-medium text-slate-700">
                Company Size
              </label>
              <select
                id="form2-size"
                value={values.companySize}
                onChange={(e) => updateField('companySize', e.target.value)}
                aria-invalid={Boolean(errors.companySize)}
                aria-describedby={errors.companySize ? 'form2-size-err' : undefined}
                className={`${inputBase} ${errors.companySize ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'}`}
              >
                <option value="">Select headcount...</option>
                <option value="1–25 employees">1–25 employees</option>
                <option value="26–200 employees">26–200 employees</option>
                <option value="201–1,000 employees">201–1,000 employees</option>
                <option value="1,000+ employees">1,000+ employees</option>
              </select>
              {errors.companySize && (
                <p id="form2-size-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {errors.companySize}
                </p>
              )}
            </div>

            <fieldset className="space-y-1.5">
              <legend className="block text-sm font-medium text-slate-700">Preferred Contact Method</legend>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {(['email', 'phone', 'video'] as const).map((channel) => (
                  <label
                    key={channel}
                    htmlFor={`form2-ch-${channel}`}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium border rounded-md cursor-pointer transition-colors ${
                      values.preferredChannel === channel
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-900'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      id={`form2-ch-${channel}`}
                      type="radio"
                      name="form2-channel"
                      value={channel}
                      checked={values.preferredChannel === channel}
                      onChange={() => updateField('preferredChannel', channel)}
                      className="sr-only"
                    />
                    <span className="capitalize">{channel}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="form2-brief" className="block text-sm font-medium text-slate-700">
              Project Scope
            </label>
            <textarea
              id="form2-brief"
              rows={3}
              value={values.brief}
              onChange={(e) => updateField('brief', e.target.value)}
              placeholder="Outline deployment targets, compliance requirements, and timeline..."
              aria-invalid={Boolean(errors.brief)}
              aria-describedby={errors.brief ? 'form2-brief-err' : undefined}
              className={`${inputBase} ${errors.brief ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'}`}
            />
            {errors.brief && (
              <p id="form2-brief-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {errors.brief}
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600"
            >
              Request Consultation
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
