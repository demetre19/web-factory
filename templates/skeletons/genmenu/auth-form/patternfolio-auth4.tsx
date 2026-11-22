import React, { useState } from 'react';
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';

export function Auth4() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resentCount, setResentCount] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter a valid email address to receive your login link.');
      return;
    }
    setError(null);
    setSentTo(trimmed);
  };

  return (
    <main className="min-h-[680px] w-full bg-zinc-50 text-zinc-900 flex items-center justify-center p-6">
      <section aria-label="Magic link authentication" className="w-full max-w-md bg-white border border-zinc-200 rounded-xl p-8 sm:p-10">
        {sentTo ? (
          <div className="space-y-6" role="status">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Mail className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Check your inbox</h1>
              <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                We sent a single-use sign-in link to <span className="font-medium text-zinc-900">{sentTo}</span>. It expires in 15 minutes.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setResentCount((c) => c + 1)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                <span>{resentCount > 0 ? `Resent (${resentCount})` : 'Resend link'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSentTo(null);
                  setResentCount(0);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
              >
                <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                <span>Change email</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="w-11 h-11 rounded-xl bg-zinc-100 text-zinc-800 flex items-center justify-center">
              <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M15 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-2m-4 0H7a5 5 0 0 1-5-5 5 5 0 0 1 5-5h2" strokeLinecap="round" />
                <line x1="8" y1="12" x2="16" y2="12" strokeLinecap="round" />
              </svg>
            </div>

            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-900">
              Passwordless sign in
            </h1>
            <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
              No password needed. Enter your email and we will deliver an instant sign-in link valid for 15 minutes.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
              <div>
                <label htmlFor="auth4-email" className="block text-sm font-medium text-zinc-800">
                  Email address
                </label>
                <input
                  id="auth4-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="you@company.com"
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'auth4-error' : 'auth4-hint'}
                  className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 ${
                    error ? 'border-red-500' : 'border-zinc-300'
                  }`}
                />
                {error ? (
                  <p id="auth4-error" role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                    {error}
                  </p>
                ) : (
                  <p id="auth4-hint" className="mt-1.5 text-xs text-zinc-500">
                    Works for both new and existing team members.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
              >
                Send magic link
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
