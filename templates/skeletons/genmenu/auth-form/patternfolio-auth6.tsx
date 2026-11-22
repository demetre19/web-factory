import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

export function Auth6() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!firstName.trim()) next.firstName = 'Required';
    if (!lastName.trim()) next.lastName = 'Required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = 'Enter a valid work email.';
    if (!company.trim()) next.company = 'Enter your organization name.';
    if (password.length < 8) next.password = 'Minimum 8 characters.';
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setSubmitted(true);
    }
  };

  return (
    <main className="min-h-[680px] w-full bg-[#F7F6F2] text-stone-900 flex items-center justify-center p-6 sm:p-10 lg:p-14">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
        <aside
          aria-label="Customer testimonial"
          className="lg:col-span-5 flex flex-col justify-between py-2"
        >
          <div>
            <div className="flex items-center gap-2.5">
              <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-stone-900">
                <path d="M4 18L12 4L20 18H4Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
                <circle cx="12" cy="13" r="2" fill="currentColor" />
              </svg>
              <span className="text-base font-semibold tracking-tight text-stone-900">Meridian Ledger</span>
            </div>

            <blockquote className="mt-10">
              <p className="font-serif text-2xl sm:text-[26px] leading-snug text-stone-900">
                &ldquo;Before Meridian, closing regional freight audits took our finance team four days every month. Switching cut reconciliation time to under three hours.&rdquo;
              </p>
            </blockquote>

            <figcaption className="mt-7 flex items-center gap-3.5">
              <svg
                aria-hidden="true"
                width="44"
                height="44"
                viewBox="0 0 44 44"
                className="shrink-0 rounded-full"
              >
                <rect width="44" height="44" rx="22" fill="#292524" />
                <text
                  x="22"
                  y="26"
                  textAnchor="middle"
                  fill="#F5F5F4"
                  fontSize="14"
                  fontWeight="600"
                  fontFamily="sans-serif"
                >
                  EV
                </text>
              </svg>
              <div>
                <div className="text-sm font-semibold text-stone-900">Elena Vance</div>
                <div className="text-xs text-stone-600">VP of Operations, Northbridge Logistics</div>
              </div>
            </figcaption>
          </div>

          <div className="mt-10 pt-6 border-t border-stone-300/80 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-600">
            <span>14-day full workspace trial</span>
            <span aria-hidden="true">·</span>
            <span>No credit card required</span>
            <span aria-hidden="true">·</span>
            <span>Cancel anytime</span>
          </div>
        </aside>

        <section
          aria-label="Workspace registration"
          className="lg:col-span-7 bg-white border border-stone-200 rounded-2xl p-8 sm:p-10"
        >
          {submitted ? (
            <div className="h-full flex flex-col justify-center items-start space-y-5 py-10" role="status">
              <div className="w-11 h-11 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
                Workspace ready for {company}
              </h1>
              <p className="text-sm text-stone-600 leading-relaxed">
                We created a 14-day trial for {firstName} {lastName} ({email}).
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setPassword('');
                }}
                className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900"
              >
                Reset form
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-semibold tracking-tight text-stone-900">Start your team trial</h1>
              <p className="mt-1.5 text-sm text-stone-600">
                Set up your organization account in one step.
              </p>

              <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="auth6-first" className="block text-sm font-medium text-stone-800">
                      First name
                    </label>
                    <input
                      id="auth6-first"
                      type="text"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (errors.firstName) setErrors((p) => ({ ...p, firstName: '' }));
                      }}
                      placeholder="Elena"
                      className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 ${
                        errors.firstName ? 'border-red-500' : 'border-stone-300'
                      }`}
                    />
                    {errors.firstName && (
                      <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="auth6-last" className="block text-sm font-medium text-stone-800">
                      Last name
                    </label>
                    <input
                      id="auth6-last"
                      type="text"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (errors.lastName) setErrors((p) => ({ ...p, lastName: '' }));
                      }}
                      placeholder="Vance"
                      className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 ${
                        errors.lastName ? 'border-red-500' : 'border-stone-300'
                      }`}
                    />
                    {errors.lastName && (
                      <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="auth6-email" className="block text-sm font-medium text-stone-800">
                    Work email
                  </label>
                  <input
                    id="auth6-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                    }}
                    placeholder="elena@northbridge.io"
                    className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 ${
                      errors.email ? 'border-red-500' : 'border-stone-300'
                    }`}
                  />
                  {errors.email && (
                    <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="auth6-company" className="block text-sm font-medium text-stone-800">
                    Company name
                  </label>
                  <input
                    id="auth6-company"
                    type="text"
                    value={company}
                    onChange={(e) => {
                      setCompany(e.target.value);
                      if (errors.company) setErrors((p) => ({ ...p, company: '' }));
                    }}
                    placeholder="Northbridge Logistics"
                    className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 ${
                      errors.company ? 'border-red-500' : 'border-stone-300'
                    }`}
                  />
                  {errors.company && (
                    <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.company}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="auth6-password" className="block text-sm font-medium text-stone-800">
                    Password
                  </label>
                  <input
                    id="auth6-password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((p) => ({ ...p, password: '' }));
                    }}
                    placeholder="At least 8 characters"
                    className={`mt-1.5 block w-full rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/15 focus:border-stone-900 ${
                      errors.password ? 'border-red-500' : 'border-stone-300'
                    }`}
                  />
                  {errors.password && (
                    <p role="alert" className="mt-1 text-xs font-medium text-red-600">{errors.password}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full rounded-lg bg-stone-900 px-4 py-3 text-sm font-semibold text-white hover:bg-stone-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
                >
                  Start 14-day trial
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
