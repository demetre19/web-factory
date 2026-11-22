import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export function Auth5() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [authMethod, setAuthMethod] = useState<string | null>(null);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Enter your password (at least 6 characters).');
      return;
    }
    setError(null);
    setAuthMethod(`Email (${email.trim()})`);
  };

  return (
    <main className="min-h-[680px] w-full bg-slate-50 text-slate-900 flex items-center justify-center p-6">
      <section aria-label="Social and email sign in" className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 sm:p-9">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Sign in to Linearis</h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Connect instantly with your identity provider.
          </p>
        </header>

        {authMethod ? (
          <div className="mt-8 space-y-5" role="status">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" aria-hidden="true" />
              <p className="text-sm font-medium">Authenticated via {authMethod}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAuthMethod(null);
                setPassword('');
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              Switch sign-in method
            </button>
          </div>
        ) : (
          <div className="mt-7 space-y-6">
            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => setAuthMethod('Google Workspace')}
                className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.52 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.59-5.17 3.59-8.82Z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24Z" />
                  <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09Z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96Z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthMethod('GitHub')}
                className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
              >
                <svg aria-hidden="true" className="w-4 h-4 fill-slate-900" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
                </svg>
                <span>Continue with GitHub</span>
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setAuthMethod('Apple ID')}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                >
                  <svg aria-hidden="true" className="w-4 h-4 fill-slate-900" viewBox="0 0 24 24">
                    <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43Zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45Z" />
                  </svg>
                  <span>Apple</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('Microsoft Entra')}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                >
                  <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="9" height="9" fill="#F25022" />
                    <rect x="13" y="2" width="9" height="9" fill="#7FBA00" />
                    <rect x="2" y="13" width="9" height="9" fill="#00A4EF" />
                    <rect x="13" y="13" width="9" height="9" fill="#FFB900" />
                  </svg>
                  <span>Microsoft</span>
                </button>
              </div>
            </div>

            <div className="relative flex items-center" role="separator">
              <div className="flex-grow border-t border-slate-200" />
              <span className="mx-3 text-xs font-medium text-slate-400">or use email</span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            <form onSubmit={handleEmailSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="auth5-email" className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="auth5-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="name@company.com"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900"
                />
              </div>

              <div>
                <label htmlFor="auth5-password" className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  id="auth5-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter password"
                  className="mt-1 block w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900"
                />
              </div>

              {error && (
                <p role="alert" className="text-xs font-medium text-red-600">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                Sign in with email
              </button>
            </form>
          </div>
        )}
      </section>
    </main>
  );
}
