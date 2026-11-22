import { Check, RotateCcw } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';

interface StateProps {
  replaySignal?: number;
}

export function State10({ replaySignal = 0 }: StateProps) {
  const [submitted, setSubmitted] = useState(true);
  const [email, setEmail] = useState('alex@studio.io');
  const [celebrateKey, setCelebrateKey] = useState(0);

  useEffect(() => {
    if (replaySignal > 0) {
      setSubmitted(true);
      setCelebrateKey((k) => k + 1);
    }
  }, [replaySignal]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setCelebrateKey((k) => k + 1);
  };

  if (!submitted) {
    return (
      <form onSubmit={handleSubmit} className="w-full max-w-[260px] space-y-2.5">
        <label className="block text-xs font-medium text-slate-700" htmlFor="state10-email">
          Work Email
        </label>
        <div className="flex gap-2">
          <input
            id="state10-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 min-w-0 px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-xs text-slate-900 focus:outline-2 focus:outline-blue-600"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-md bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer whitespace-nowrap"
          >
            Submit
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      key={celebrateKey}
      className="relative w-full max-w-[260px] rounded-lg border border-emerald-200 bg-emerald-50/70 p-3.5 text-center animate-badge-pop"
    >
      {/* Radiating geometric celebration sparks */}
      <span aria-hidden="true" className="absolute top-2.5 left-4 w-1.5 h-1.5 rounded-full bg-amber-500" />
      <span aria-hidden="true" className="absolute top-3 right-5 w-1.5 h-1.5 rotate-45 bg-blue-600" />
      <span aria-hidden="true" className="absolute bottom-3 left-6 w-2 h-0.5 rotate-12 bg-emerald-600" />
      <span aria-hidden="true" className="absolute bottom-3 right-6 w-1.5 h-1.5 rounded-full bg-rose-500" />

      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 text-white mb-2">
        <Check className="w-4 h-4" strokeWidth={2.75} />
      </div>
      <p className="text-sm font-semibold text-slate-900">Application Submitted</p>
      <p className="text-[11px] font-mono tabular-nums text-slate-600 mt-0.5 truncate">
        #APP-904 · {email}
      </p>
      <button
        type="button"
        onClick={() => setSubmitted(false)}
        className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600 cursor-pointer"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Edit &amp; Resubmit</span>
      </button>
    </div>
  );
}
