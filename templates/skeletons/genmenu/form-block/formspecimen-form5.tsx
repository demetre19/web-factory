import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { isValidEmail } from '../../utils/validation';

export function Form5() {
  const [email, setEmail] = useState('');
  const [cadence, setCadence] = useState<'weekly' | 'monthly'>('weekly');
  const [error, setError] = useState<string | null>(null);
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address to subscribe.');
      return;
    }
    setError(null);
    setSubscribedEmail(email.trim());
  };

  if (subscribedEmail) {
    return (
      <div className="max-w-2xl bg-white border border-neutral-200 rounded-xl px-5 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-sm text-neutral-800">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
          <span>
            Subscribed <strong className="font-medium text-neutral-900">{subscribedEmail}</strong> ({cadence} dispatch).
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setSubscribedEmail(null);
            setEmail('');
          }}
          className="text-xs font-medium text-neutral-600 hover:text-neutral-900 underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 rounded"
        >
          Change email
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-2xl bg-white border border-neutral-200 rounded-xl p-4 sm:p-5 space-y-2"
    >
      <div className="flex flex-col sm:flex-row sm:items-end gap-2.5">
        <div className="flex-1 space-y-1">
          <label htmlFor="form5-email" className="block text-xs font-medium text-neutral-700">
            Email for product &amp; design notes
          </label>
          <input
            id="form5-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            placeholder="you@studio.com"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'form5-email-err' : undefined}
            className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 ${
              error ? 'border-red-500 focus:ring-red-200' : 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-200'
            }`}
          />
        </div>

        <div className="sm:w-36 space-y-1">
          <label htmlFor="form5-cadence" className="block text-xs font-medium text-neutral-700">
            Frequency
          </label>
          <select
            id="form5-cadence"
            value={cadence}
            onChange={(e) => setCadence(e.target.value as 'weekly' | 'monthly')}
            className="w-full px-3 py-2 text-sm bg-white border border-neutral-300 rounded-lg text-neutral-900 focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        <button
          type="submit"
          className="px-5 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900 h-[38px]"
        >
          Subscribe
        </button>
      </div>

      {error && (
        <p id="form5-email-err" role="alert" className="flex items-center gap-1.5 text-xs text-red-700">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </form>
  );
}
