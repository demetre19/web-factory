import React, { useState } from 'react';

export function Auth3() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Enter your password.');
      return;
    }
    setError(null);
    setSignedIn(true);
  };

  return (
    <main className="min-h-[680px] w-full bg-white text-neutral-950 flex items-center justify-center px-6 py-16">
      <section aria-label="Minimal sign in" className="w-full max-w-[360px]">
        <p className="text-xs font-medium tracking-widest uppercase text-neutral-500">Monograph Press</p>
        <h1 className="mt-3 font-serif text-4xl font-normal tracking-tight text-neutral-950">
          Welcome back.
        </h1>

        {signedIn ? (
          <div className="mt-10 pt-8 border-t border-neutral-200 space-y-6" role="status">
            <p className="text-sm text-neutral-700 leading-relaxed">
              Signed in as <span className="font-medium text-neutral-950">{email}</span>. Your reading list is ready.
            </p>
            <button
              type="button"
              onClick={() => {
                setSignedIn(false);
                setPassword('');
              }}
              className="text-sm font-medium text-neutral-950 underline underline-offset-4 hover:text-neutral-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
            >
              Sign out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-7">
            <div>
              <label htmlFor="auth3-email" className="block text-xs font-medium text-neutral-600">
                Email address
              </label>
              <input
                id="auth3-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="name@domain.com"
                className="mt-2 block w-full border-0 border-b border-neutral-300 bg-transparent px-0 py-2.5 text-base text-neutral-950 placeholder:text-neutral-400 focus:border-neutral-950 focus:outline-none focus:ring-0 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="auth3-password" className="block text-xs font-medium text-neutral-600">
                Password
              </label>
              <input
                id="auth3-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="••••••••••••"
                className="mt-2 block w-full border-0 border-b border-neutral-300 bg-transparent px-0 py-2.5 text-base text-neutral-950 placeholder:text-neutral-400 focus:border-neutral-950 focus:outline-none focus:ring-0 transition-colors"
              />
            </div>

            {error && (
              <p role="alert" className="text-xs font-medium text-red-600">
                {error}
              </p>
            )}

            <div className="pt-2 flex items-center justify-between gap-4">
              <button
                type="submit"
                className="px-7 py-3 bg-neutral-950 text-white text-sm font-medium hover:bg-neutral-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2"
              >
                Continue
              </button>
              <button
                type="button"
                onClick={() => setError('Password recovery link instructions sent if an account matches.')}
                className="text-xs text-neutral-500 hover:text-neutral-900 underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950"
              >
                Reset password
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
