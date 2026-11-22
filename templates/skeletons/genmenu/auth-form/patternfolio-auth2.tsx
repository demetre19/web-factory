import React, { useState } from 'react';
import { Check, Eye, EyeOff } from 'lucide-react';

function getStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: 'Enter password', color: 'bg-slate-200' };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score += 1;
  const clamped = Math.max(1, Math.min(4, score));
  const map: Record<number, { label: string; color: string }> = {
    1: { label: 'Weak', color: 'bg-red-500' },
    2: { label: 'Fair', color: 'bg-amber-500' },
    3: { label: 'Good', color: 'bg-sky-600' },
    4: { label: 'Strong', color: 'bg-emerald-600' },
  };
  return { score: clamped, ...map[clamped] };
}

export function Auth2() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdAccount, setCreatedAccount] = useState<{ name: string; email: string } | null>(null);

  const strength = getStrength(password);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (fullName.trim().length < 2) nextErrors.fullName = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (password.length < 8) nextErrors.password = 'Use at least 8 characters.';
    if (!acceptedTerms) nextErrors.terms = 'Accept the terms of service to continue.';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setCreatedAccount({ name: fullName.trim(), email: email.trim() });
    }
  };

  return (
    <main className="min-h-[680px] w-full bg-[#F4F5F7] text-slate-900 flex items-center justify-center p-6 sm:p-10">
      <section
        aria-label="Create account card"
        className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-8 sm:p-10"
      >
        <div className="flex flex-col items-center text-center">
          <svg
            aria-hidden="true"
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            className="text-slate-900"
          >
            <circle cx="18" cy="18" r="16" stroke="currentColor" strokeWidth="1.75" />
            <path d="M12 18L16.5 22.5L24.5 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">Create your Verve account</h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Start collaborating with your team in under two minutes.
          </p>
        </div>

        {createdAccount ? (
          <div className="mt-8 text-center space-y-4" role="status">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Check className="w-6 h-6" aria-hidden="true" />
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              Account created for <span className="font-semibold text-slate-900">{createdAccount.name}</span> ({createdAccount.email}).
            </p>
            <button
              type="button"
              onClick={() => {
                setCreatedAccount(null);
                setPassword('');
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              Create another account
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
            <div>
              <label htmlFor="auth2-name" className="block text-sm font-medium text-slate-800">
                Full name
              </label>
              <input
                id="auth2-name"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                }}
                placeholder="Jordan Ellis"
                aria-invalid={Boolean(errors.fullName)}
                className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900 ${
                  errors.fullName ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.fullName && (
                <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="auth2-email" className="block text-sm font-medium text-slate-800">
                Work email
              </label>
              <input
                id="auth2-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                placeholder="jordan@verve.studio"
                aria-invalid={Boolean(errors.email)}
                className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900 ${
                  errors.email ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.email && (
                <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="auth2-password" className="block text-sm font-medium text-slate-800">
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="auth2-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  placeholder="Create a strong password"
                  aria-invalid={Boolean(errors.password)}
                  className={`block w-full rounded-lg border px-3.5 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900 ${
                    errors.password ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-800 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="mt-2.5 flex items-center gap-2" aria-live="polite">
                <div className="flex-1 grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((segment) => (
                    <span
                      key={segment}
                      className={`h-1.5 rounded-full transition-colors ${
                        segment <= strength.score ? strength.color : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-slate-600 tabular-nums w-14 text-right">
                  {password ? strength.label : ''}
                </span>
              </div>
              {errors.password && (
                <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  id="auth2-terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    if (errors.terms) setErrors((prev) => ({ ...prev, terms: '' }));
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-900/20"
                />
                <label htmlFor="auth2-terms" className="text-xs text-slate-600 leading-relaxed">
                  I agree to the Terms of Service and acknowledge the Privacy Notice.
                </label>
              </div>
              {errors.terms && (
                <p role="alert" className="mt-1 text-xs font-medium text-red-600">
                  {errors.terms}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
            >
              Create account
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
