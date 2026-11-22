import React, { useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export function Error6() {
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState('Local edits are queued safely and will sync when connectivity returns.');

  const handleReconnect = () => {
    setChecking(true);
    setMessage('Checking network interface...');
    setTimeout(() => {
      setChecking(false);
      setMessage('Still offline — 3 pending changes remain saved in browser storage.');
    }, 550);
  };

  return (
    <main className="min-h-[680px] w-full bg-zinc-50 text-zinc-900 flex items-center justify-center p-6">
      <section aria-label="Offline connection state" className="w-full max-w-lg bg-white border border-zinc-200 rounded-2xl p-8 sm:p-10 text-center space-y-6">
        <div className="mx-auto flex justify-center">
          <svg aria-hidden="true" width="160" height="108" viewBox="0 0 160 108" fill="none">
            <circle cx="34" cy="54" r="18" fill="#F4F4F5" stroke="#52525B" strokeWidth="2" />
            <circle cx="34" cy="54" r="5" fill="#18181B" />
            <circle cx="126" cy="54" r="18" fill="#F4F4F5" stroke="#A1A1AA" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="126" cy="54" r="5" fill="#A1A1AA" />
            <path d="M52 54H68" stroke="#52525B" strokeWidth="2" strokeLinecap="round" />
            <path d="M92 54H108" stroke="#A1A1AA" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 4" />
            <path d="M74 44L86 64M86 44L74 64" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
            <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Network disconnected</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            You&apos;re currently offline
          </h1>
          <p className="text-sm text-zinc-600 leading-relaxed max-w-sm mx-auto" role="status">
            {message}
          </p>
        </div>

        <div className="pt-1 flex justify-center">
          <button
            type="button"
            onClick={handleReconnect}
            disabled={checking}
            className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{checking ? 'Checking...' : 'Try reconnecting'}</span>
          </button>
        </div>
      </section>
    </main>
  );
}
