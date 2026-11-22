import React, { useEffect, useState } from 'react';
import { Bell, Check } from 'lucide-react';

function formatTimer(seconds: number): string {
  const safe = Math.max(0, seconds);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

export function Error7() {
  const [remaining, setRemaining] = useState(2645);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    setError(null);
    setSubscribed(true);
  };

  return (
    <main className="min-h-[680px] w-full bg-white text-slate-950 flex items-center justify-center px-6 py-16">
      <section aria-label="Scheduled maintenance" className="w-full max-w-2xl">
        <div className="border-t-2 border-slate-950 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
          <span className="font-mono font-medium uppercase tracking-wider text-slate-900">
            Scheduled Maintenance
          </span>
          <span className="font-mono tabular-nums">Window: 02:00 – 03:30 UTC</span>
        </div>

        <h1 className="mt-8 text-3xl sm:text-5xl font-semibold tracking-tight text-slate-950 leading-[1.12]">
          Database cluster migration in progress.
        </h1>
        <p className="mt-5 text-base text-slate-600 leading-relaxed max-w-xl">
          We are upgrading primary storage volumes across EU-West and US-East. All scheduled webhooks are queued and will replay automatically once service resumes.
        </p>

        <div className="mt-8 py-6 border-y border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="text-xs text-slate-500">Estimated remaining</div>
            <div className="mt-1 text-2xl font-mono font-semibold tabular-nums text-slate-950">
              {formatTimer(remaining)}
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Data integrity</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">Read-only snapshot verified</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Queued jobs</div>
            <div className="mt-1 text-sm font-semibold text-slate-900">Preserved in durable queue</div>
          </div>
        </div>

        {subscribed ? (
          <div className="mt-8 flex items-center gap-2.5 text-sm font-medium text-emerald-700" role="status">
            <Check className="w-4 h-4" aria-hidden="true" />
            <span>We will email {email.trim()} the moment traffic is restored.</span>
          </div>
        ) : (
          <form onSubmit={handleNotify} noValidate className="mt-8 max-w-md">
            <label htmlFor="error7-email" className="block text-xs font-medium text-slate-700">
              Get notified when we are back online
            </label>
            <div className="mt-2 flex flex-col sm:flex-row gap-2.5">
              <input
                id="error7-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="ops@company.com"
                className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950/15 focus:border-slate-950"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
              >
                <Bell className="w-4 h-4" aria-hidden="true" />
                <span>Notify me</span>
              </button>
            </div>
            {error && (
              <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
                {error}
              </p>
            )}
          </form>
        )}
      </section>
    </main>
  );
}
