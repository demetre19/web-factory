import React, { useState } from 'react';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';

export function Auth7() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [useOtp, setUseOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid account email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }
    if (useOtp && !/^\d{6}$/.test(otp.trim())) {
      setError('Enter the 6-digit code from your authenticator app.');
      return;
    }
    setError(null);
    setAuthenticated(true);
  };

  return (
    <main className="min-h-[680px] w-full bg-[#090D16] text-slate-100 flex items-center justify-center p-6 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[560px] h-[320px] rounded-full bg-indigo-500/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 right-1/4 w-[420px] h-[280px] rounded-full bg-sky-500/10 blur-3xl"
      />

      <section
        aria-label="Dark glass sign in"
        className="relative z-10 w-full max-w-md rounded-2xl bg-white/[0.05] backdrop-blur-xl border border-white/12 p-8 sm:p-10 shadow-2xl"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-sky-300">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-medium tracking-wide text-slate-300">Vault Console</p>
            <h1 className="text-xl font-semibold tracking-tight text-white">Sign in to enclave</h1>
          </div>
        </div>

        {authenticated ? (
          <div className="mt-8 space-y-5" role="status">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/25 p-4 text-sm text-emerald-200 leading-relaxed">
              Session verified for <span className="font-semibold text-white">{email}</span>
              {useOtp ? ' with 2FA hardware token.' : '.'}
            </div>
            <button
              type="button"
              onClick={() => {
                setAuthenticated(false);
                setPassword('');
                setOtp('');
              }}
              className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              Lock session
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
            <div>
              <label htmlFor="auth7-email" className="block text-sm font-medium tracking-[0.01em] text-slate-200">
                Email address
              </label>
              <input
                id="auth7-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="operator@enclave.sec"
                className="mt-1.5 block w-full rounded-lg border border-white/15 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400"
              />
            </div>

            <div>
              <label htmlFor="auth7-password" className="block text-sm font-medium tracking-[0.01em] text-slate-200">
                Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="auth7-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter passphrase"
                  className="block w-full rounded-lg border border-white/15 bg-slate-950/60 px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-white focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setUseOtp((prev) => !prev)}
                className="text-xs font-medium text-sky-300 hover:text-sky-200 focus:outline-none focus-visible:underline"
              >
                {useOtp ? 'Hide 2FA authenticator field' : 'Include 6-digit 2FA authenticator code'}
              </button>

              {useOtp && (
                <div className="mt-3">
                  <label htmlFor="auth7-otp" className="block text-xs font-medium tracking-[0.01em] text-slate-300">
                    Authenticator code
                  </label>
                  <input
                    id="auth7-otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, ''));
                      if (error) setError(null);
                    }}
                    placeholder="000000"
                    className="mt-1.5 block w-full rounded-lg border border-white/15 bg-slate-950/60 px-3.5 py-2.5 text-sm font-mono tabular-nums tracking-widest text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400"
                  />
                </div>
              )}
            </div>

            {error && (
              <p role="alert" className="text-xs font-medium text-rose-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090D16]"
            >
              Authenticate
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
