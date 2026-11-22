import React, { useState } from 'react';
import { KeyRound, Building2, CheckCircle2 } from 'lucide-react';

export function Auth9() {
  const [mode, setMode] = useState<'sso' | 'passkey'>('sso');
  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'sso') {
      const clean = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (clean.length < 2) {
        setError('Enter your organization workspace slug (at least 2 characters).');
        return;
      }
      setError(null);
      setVerified(`Redirected to SAML identity provider for ${clean}.gridline.app`);
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError('Enter your registered email to prompt your Passkey.');
        return;
      }
      setError(null);
      setVerified(`WebAuthn Passkey challenge verified for ${email.trim()}`);
    }
  };

  return (
    <main className="min-h-[680px] w-full bg-slate-100 text-slate-900 flex items-center justify-center p-6">
      <section aria-label="Enterprise SSO and Passkey sign in" className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8 sm:p-9">
        <div className="flex items-center gap-2.5 text-slate-900">
          <Building2 className="w-5 h-5 text-blue-700" aria-hidden="true" />
          <span className="text-sm font-semibold tracking-tight">Gridline Enterprise</span>
        </div>

        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
          Organization sign in
        </h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Authenticate via SAML 2.0 single sign-on or a registered hardware passkey.
        </p>

        <div role="tablist" aria-label="Authentication method" className="mt-6 grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'sso'}
            onClick={() => {
              setMode('sso');
              setError(null);
              setVerified(null);
            }}
            className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
              mode === 'sso' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SAML Domain
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'passkey'}
            onClick={() => {
              setMode('passkey');
              setError(null);
              setVerified(null);
            }}
            className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 ${
              mode === 'passkey' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Passkey / Key
          </button>
        </div>

        {verified ? (
          <div className="mt-7 space-y-5" role="status">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 flex items-start gap-3 text-sm text-blue-950">
              <CheckCircle2 className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{verified}</span>
            </div>
            <button
              type="button"
              onClick={() => setVerified(null)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
            >
              Reset sign-in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
            {mode === 'sso' ? (
              <div>
                <label htmlFor="auth9-slug" className="block text-sm font-medium text-slate-800">
                  Workspace URL
                </label>
                <div className="mt-1.5 flex rounded-lg border border-slate-300 focus-within:ring-2 focus-within:ring-blue-700/20 focus-within:border-blue-700 overflow-hidden">
                  <input
                    id="auth9-slug"
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="acme-corp"
                    className="flex-1 min-w-0 border-0 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                  <span className="inline-flex items-center bg-slate-50 border-l border-slate-200 px-3 text-xs font-mono text-slate-500 whitespace-nowrap">
                    .gridline.app
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg bg-slate-50 border border-slate-200 p-3.5">
                  <KeyRound className="w-5 h-5 text-blue-700 shrink-0" aria-hidden="true" />
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Touch your security key or use device biometrics after entering your email.
                  </p>
                </div>
                <div>
                  <label htmlFor="auth9-email" className="block text-sm font-medium text-slate-800">
                    Registered email
                  </label>
                  <input
                    id="auth9-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="security@acme-corp.com"
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-700/20 focus:border-blue-700"
                  />
                </div>
              </div>
            )}

            {error && (
              <p role="alert" className="text-xs font-medium text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2"
            >
              {mode === 'sso' ? 'Continue with SAML SSO' : 'Verify with Passkey'}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
