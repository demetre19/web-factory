import React, { useState } from 'react';
import { Check } from 'lucide-react';

export function Auth10() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Research Lead');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = 'Enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter a valid email address.';
    if (password.length < 8) next.password = 'Use at least 8 characters.';
    if (confirm !== password) next.confirm = 'Passwords do not match.';
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setDone(true);
    }
  };

  return (
    <main className="min-h-[680px] w-full bg-[#F4F6F4] text-slate-900 flex items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <section aria-label="Account registration" className="lg:col-span-7 p-8 sm:p-10">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create Canopy account</h1>
          <p className="mt-1.5 text-sm text-slate-600">
            Configure your login and confirm your workspace role.
          </p>

          {done ? (
            <div className="mt-8 space-y-5" role="status">
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-5 space-y-1.5">
                <p className="text-sm font-semibold text-emerald-950">Account provisioned</p>
                <p className="text-sm text-emerald-800">
                  {name} ({email}) enrolled as {role} on Pro Team Trial.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDone(false);
                  setPassword('');
                  setConfirm('');
                }}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-900"
              >
                Edit details
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="auth10-name" className="block text-sm font-medium text-slate-800">
                    Full name
                  </label>
                  <input
                    id="auth10-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((p) => ({ ...p, name: '' }));
                    }}
                    placeholder="Marcus Chen"
                    className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 ${
                      errors.name ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {errors.name && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="auth10-role" className="block text-sm font-medium text-slate-800">
                    Role
                  </label>
                  <select
                    id="auth10-role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900"
                  >
                    <option value="Research Lead">Research Lead</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="Field Coordinator">Field Coordinator</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="auth10-email" className="block text-sm font-medium text-slate-800">
                  Work email
                </label>
                <input
                  id="auth10-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                  }}
                  placeholder="marcus@canopy.org"
                  className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 ${
                    errors.email ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.email && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="auth10-password" className="block text-sm font-medium text-slate-800">
                    Password
                  </label>
                  <input
                    id="auth10-password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((p) => ({ ...p, password: '' }));
                    }}
                    placeholder="8+ characters"
                    className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 ${
                      errors.password ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {errors.password && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.password}</p>}
                </div>

                <div>
                  <label htmlFor="auth10-confirm" className="block text-sm font-medium text-slate-800">
                    Confirm password
                  </label>
                  <input
                    id="auth10-confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => {
                      setConfirm(e.target.value);
                      if (errors.confirm) setErrors((p) => ({ ...p, confirm: '' }));
                    }}
                    placeholder="Repeat password"
                    className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-900/20 focus:border-emerald-900 ${
                      errors.confirm ? 'border-red-500' : 'border-slate-300'
                    }`}
                  />
                  {errors.confirm && <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.confirm}</p>}
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-lg bg-[#14532D] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#114224] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14532D] focus-visible:ring-offset-2"
              >
                Create account and start trial
              </button>
            </form>
          )}
        </section>

        <aside
          aria-label="Included trial capabilities"
          className="lg:col-span-5 bg-[#14532D] text-emerald-50 p-8 sm:p-10 flex flex-col justify-between"
        >
          <div>
            <p className="text-xs font-medium tracking-wider uppercase text-emerald-200">Pro Team Trial</p>
            <div className="mt-2 flex items-baseline gap-1.5">
              <span className="text-3xl font-semibold tabular-nums text-white">$0</span>
              <span className="text-sm text-emerald-200">for 14 days, then $29 / seat</span>
            </div>

            <ul className="mt-7 space-y-3.5 text-sm text-emerald-100">
              {[
                'Unlimited field datasets and CSV exports',
                'Role-based permissions for up to 25 editors',
                'Automated daily encrypted snapshots',
                'Dedicated audit log retention for 1 year',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-8 pt-6 border-t border-emerald-800 text-xs text-emerald-200/90 leading-relaxed">
            Downgrade to the free community tier at any time before day 14 with zero billing obligation.
          </p>
        </aside>
      </div>
    </main>
  );
}
