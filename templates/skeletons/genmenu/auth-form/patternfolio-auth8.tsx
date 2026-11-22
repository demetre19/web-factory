import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const TEAM_SIZES = ['1–10', '11–50', '51–200', '200+'] as const;

export function Auth8() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspace, setWorkspace] = useState('');
  const [role, setRole] = useState('Engineering');
  const [teamSize, setTeamSize] = useState<(typeof TEAM_SIZES)[number]>('11–50');
  const [invites, setInvites] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const goNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (name.trim().length < 2) {
        setError('Enter your full name.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError('Enter a valid work email address.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        return;
      }
      setError(null);
      setStep(2);
    } else if (step === 2) {
      if (workspace.trim().length < 2) {
        setError('Enter a workspace name.');
        return;
      }
      setError(null);
      setStep(3);
    } else {
      setError(null);
      setCompleted(true);
    }
  };

  return (
    <main className="min-h-[680px] w-full bg-slate-100 text-slate-900 flex items-center justify-center p-6">
      <section aria-label="Stepped onboarding signup" className="w-full max-w-xl bg-white border border-slate-200 rounded-2xl p-8 sm:p-10">
        <nav aria-label="Signup progress" className="mb-8">
          <ol className="grid grid-cols-3 gap-3">
            {[
              { num: 1, title: '01. Account' },
              { num: 2, title: '02. Workspace' },
              { num: 3, title: '03. Team' },
            ].map((item) => {
              const active = step === item.num;
              const done = completed || step > item.num;
              return (
                <li key={item.num} className="space-y-2">
                  <div
                    className={`h-1.5 rounded-full transition-colors ${
                      done ? 'bg-emerald-600' : active ? 'bg-slate-900' : 'bg-slate-200'
                    }`}
                  />
                  <span
                    className={`block text-xs font-medium tabular-nums ${
                      active || done ? 'text-slate-900' : 'text-slate-400'
                    }`}
                  >
                    {item.title}
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>

        {completed ? (
          <div className="py-6 space-y-5" role="status">
            <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Check className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {workspace} is provisioned
              </h1>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Administered by {name} ({email}) · {role} · Team size {teamSize}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setCompleted(false);
                setStep(1);
                setPassword('');
              }}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
            >
              Start over
            </button>
          </div>
        ) : (
          <form onSubmit={goNext} noValidate className="space-y-5">
            {step === 1 && (
              <>
                <header>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create your login</h1>
                  <p className="mt-1 text-sm text-slate-600">Step 1 of 3 — Personal credentials</p>
                </header>

                <div>
                  <label htmlFor="auth8-name" className="block text-sm font-medium text-slate-800">
                    Full name
                  </label>
                  <input
                    id="auth8-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Samira Patel"
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900"
                  />
                </div>

                <div>
                  <label htmlFor="auth8-email" className="block text-sm font-medium text-slate-800">
                    Work email
                  </label>
                  <input
                    id="auth8-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="samira@atlas.co"
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900"
                  />
                </div>

                <div>
                  <label htmlFor="auth8-password" className="block text-sm font-medium text-slate-800">
                    Password
                  </label>
                  <input
                    id="auth8-password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Minimum 8 characters"
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900"
                  />
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <header>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Configure workspace</h1>
                  <p className="mt-1 text-sm text-slate-600">Step 2 of 3 — Organization defaults</p>
                </header>

                <div>
                  <label htmlFor="auth8-workspace" className="block text-sm font-medium text-slate-800">
                    Workspace name
                  </label>
                  <input
                    id="auth8-workspace"
                    type="text"
                    value={workspace}
                    onChange={(e) => {
                      setWorkspace(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Atlas Core"
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900"
                  />
                </div>

                <div>
                  <label htmlFor="auth8-role" className="block text-sm font-medium text-slate-800">
                    Primary department
                  </label>
                  <select
                    id="auth8-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <fieldset>
                  <legend className="block text-sm font-medium text-slate-800">Team size</legend>
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TEAM_SIZES.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setTeamSize(size)}
                        aria-pressed={teamSize === size}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium tabular-nums transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 ${
                          teamSize === size
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </fieldset>
              </>
            )}

            {step === 3 && (
              <>
                <header>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Invite collaborators</h1>
                  <p className="mt-1 text-sm text-slate-600">Step 3 of 3 — Optional teammate invitations</p>
                </header>

                <div>
                  <label htmlFor="auth8-invites" className="block text-sm font-medium text-slate-800">
                    Teammate emails (comma-separated, optional)
                  </label>
                  <textarea
                    id="auth8-invites"
                    rows={3}
                    value={invites}
                    onChange={(e) => setInvites(e.target.value)}
                    placeholder="maya@atlas.co, devon@atlas.co"
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900"
                  />
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 space-y-1">
                  <div className="font-medium text-slate-900">Summary</div>
                  <div>Account: {name} ({email})</div>
                  <div>Workspace: {workspace} · {role} · {teamSize} members</div>
                </div>
              </>
            )}

            {error && (
              <p role="alert" className="text-xs font-medium text-red-600">
                {error}
              </p>
            )}

            <div className="pt-2 flex items-center justify-between gap-3">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep((s) => (s === 3 ? 2 : 1));
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                <span>{step === 3 ? 'Launch workspace' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
