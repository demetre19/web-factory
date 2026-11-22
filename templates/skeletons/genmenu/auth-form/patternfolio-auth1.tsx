import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, CheckCircle2 } from 'lucide-react';

export function Auth1() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [forgotNotice, setForgotNotice] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: { email?: string; password?: string } = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid work email address.';
    }
    if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setSubmittedEmail(email.trim());
    }
  };

  return (
    <main className="min-h-[680px] w-full flex flex-col lg:flex-row bg-white text-slate-900">
      <section
        aria-label="Brand overview"
        className="lg:w-1/2 bg-[#0B1120] text-slate-100 p-8 sm:p-12 lg:p-14 flex flex-col justify-between relative overflow-hidden"
      >
        <svg
          aria-hidden="true"
          className="absolute inset-0 h-full w-full opacity-[0.07] pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="auth1-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth1-grid)" />
        </svg>

        <div className="relative z-10 flex items-center gap-3">
          <svg
            aria-hidden="true"
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            className="text-indigo-400 shrink-0"
          >
            <rect x="2" y="2" width="10" height="10" stroke="currentColor" strokeWidth="2" />
            <rect x="16" y="2" width="10" height="10" fill="currentColor" />
            <rect x="2" y="16" width="10" height="10" fill="currentColor" fillOpacity="0.4" />
            <path d="M16 16H26V26" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span className="text-lg font-semibold tracking-tight text-white">Kestrel Systems</span>
        </div>

        <div className="relative z-10 my-12 max-w-md">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white leading-tight">
            Architectural clarity for engineering operations.
          </h1>
          <p className="mt-4 text-base text-slate-300 leading-relaxed">
            Coordinate releases, audit infrastructure changes, and manage regional deployments from a unified control plane.
          </p>
        </div>

        <footer className="relative z-10 flex items-center gap-4 text-xs text-slate-400">
          <span>SOC 2 Type II Certified</span>
          <span aria-hidden="true">·</span>
          <span>EU &amp; US Data Residency</span>
        </footer>
      </section>

      <section
        aria-label="Sign in form"
        className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex items-center justify-center bg-white"
      >
        <div className="w-full max-w-sm">
          {submittedEmail ? (
            <div className="space-y-5" role="status">
              <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Signed in</h2>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Authenticated session initialized for <span className="font-medium text-slate-900">{submittedEmail}</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSubmittedEmail(null);
                  setPassword('');
                }}
                className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                Sign out and test again
              </button>
            </div>
          ) : (
            <>
              <header>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Sign in to Kestrel</h2>
                <p className="mt-1.5 text-sm text-slate-600">
                  Enter your credentials to access your workspace.
                </p>
              </header>

              <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                <div>
                  <label htmlFor="auth1-email" className="block text-sm font-medium text-slate-800">
                    Work email
                  </label>
                  <input
                    id="auth1-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="alex@kestrel.dev"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? 'auth1-email-error' : undefined}
                    className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 ${
                      errors.email ? 'border-red-500 bg-red-50/40' : 'border-slate-300 bg-white'
                    }`}
                  />
                  {errors.email && (
                    <p id="auth1-email-error" role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label htmlFor="auth1-password" className="block text-sm font-medium text-slate-800">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setForgotNotice((prev) => !prev)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 focus:outline-none focus-visible:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative mt-1.5">
                    <input
                      id="auth1-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      placeholder="Minimum 8 characters"
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={errors.password ? 'auth1-password-error' : undefined}
                      className={`block w-full rounded-lg border px-3.5 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 ${
                        errors.password ? 'border-red-500 bg-red-50/40' : 'border-slate-300 bg-white'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-800 focus:outline-none focus-visible:text-indigo-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p id="auth1-password-error" role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.password}
                    </p>
                  )}
                  {forgotNotice && (
                    <p className="mt-2 text-xs text-slate-600 bg-slate-100 rounded-md px-3 py-2" role="status">
                      Password reset instructions can be requested once you enter your email above.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  <input
                    id="auth1-remember"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-2 focus:ring-indigo-600/30"
                  />
                  <label htmlFor="auth1-remember" className="text-sm text-slate-700">
                    Keep me signed in for 14 days
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2"
                >
                  <span>Sign in to workspace</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
