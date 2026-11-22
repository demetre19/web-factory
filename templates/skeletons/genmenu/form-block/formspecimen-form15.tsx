import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface SettingsState {
  displayName: string;
  frequency: string;
  weeklySummary: boolean;
  securityAlerts: boolean;
  productUpdates: boolean;
  quietStart: string;
  quietEnd: string;
}

const INITIAL_SETTINGS: SettingsState = {
  displayName: 'Maya Lin',
  frequency: 'daily',
  weeklySummary: true,
  securityAlerts: true,
  productUpdates: false,
  quietStart: '22:00',
  quietEnd: '07:30',
};

export function Form15() {
  const [savedSnapshot, setSavedSnapshot] = useState<SettingsState>(INITIAL_SETTINGS);
  const [form, setForm] = useState<SettingsState>(INITIAL_SETTINGS);
  const [nameError, setNameError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const isDirty = JSON.stringify(form) !== JSON.stringify(savedSnapshot);

  const toggleField = (key: 'weeklySummary' | 'securityAlerts' | 'productUpdates') => {
    setForm((prev) => ({ ...prev, [key]: !prev[key] }));
    setStatusMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.displayName.trim().length < 2) {
      setNameError('Display name must be at least 2 characters.');
      setStatusMessage(null);
      return;
    }
    setNameError(null);
    setSavedSnapshot(form);
    setStatusMessage('Notification preferences saved.');
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-3xl bg-zinc-950 border border-zinc-800 rounded-xl divide-y divide-zinc-800 text-zinc-100 tracking-[0.01em]"
    >
      <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-white">Notification &amp; Quiet Hours</h3>
          <p className="text-xs text-zinc-400">Dark carded settings with accessible toggle switches and dirty-state tracking.</p>
        </div>
        <span className="text-xs font-mono text-zinc-400">{isDirty ? 'Unsaved changes' : 'All changes saved'}</span>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="form15-name" className="block text-sm font-medium text-zinc-200">
            Notification Display Name
          </label>
          <input
            id="form15-name"
            type="text"
            value={form.displayName}
            onChange={(e) => {
              setForm({ ...form, displayName: e.target.value });
              if (nameError) setNameError(null);
              setStatusMessage(null);
            }}
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? 'form15-name-err' : undefined}
            className={`w-full px-3.5 py-2 text-sm bg-zinc-900 border rounded-lg text-white focus:outline-none focus:ring-2 ${
              nameError ? 'border-red-500 focus:ring-red-500/30' : 'border-zinc-700 focus:border-sky-400 focus:ring-sky-400/25'
            }`}
          />
          {nameError && (
            <p id="form15-name-err" role="alert" className="text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {nameError}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="form15-freq" className="block text-sm font-medium text-zinc-200">
            Email Digest Cadence
          </label>
          <select
            id="form15-freq"
            value={form.frequency}
            onChange={(e) => {
              setForm({ ...form, frequency: e.target.value });
              setStatusMessage(null);
            }}
            className="w-full px-3.5 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/25"
          >
            <option value="realtime">Real-time</option>
            <option value="daily">Daily at 09:00</option>
            <option value="weekly">Weekly on Mondays</option>
          </select>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <h4 className="text-sm font-medium text-zinc-200">Channel Toggles</h4>
        <div className="space-y-3">
          {(
            [
              {
                key: 'weeklySummary',
                id: 'form15-sw-weekly',
                label: 'Weekly Activity Digest',
                desc: 'Receive a summary of workspace commits and mentions.',
              },
              {
                key: 'securityAlerts',
                id: 'form15-sw-sec',
                label: 'Critical Security Alerts',
                desc: 'Immediate notifications for new sign-ins and token rotations.',
              },
              {
                key: 'productUpdates',
                id: 'form15-sw-prod',
                label: 'Release Notes & Changelogs',
                desc: 'Monthly overview of shipped runtime improvements.',
              },
            ] as const
          ).map((item) => {
            const checked = form[item.key];
            return (
              <div key={item.key} className="flex items-center justify-between gap-4 py-1">
                <div>
                  <label htmlFor={item.id} className="block text-sm font-medium text-zinc-100 cursor-pointer">
                    {item.label}
                  </label>
                  <p className="text-xs text-zinc-400">{item.desc}</p>
                </div>
                <label htmlFor={item.id} className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    id={item.id}
                    type="checkbox"
                    role="switch"
                    aria-checked={checked}
                    checked={checked}
                    onChange={() => toggleField(item.key)}
                    className="sr-only peer"
                  />
                  <span className="w-11 h-6 bg-zinc-700 rounded-full peer peer-focus-visible:ring-2 peer-focus-visible:ring-sky-400 peer-checked:bg-sky-400 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-5" />
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="space-y-1">
            <label htmlFor="form15-qstart" className="block text-xs text-zinc-400">
              Quiet Hours Start
            </label>
            <input
              id="form15-qstart"
              type="time"
              value={form.quietStart}
              onChange={(e) => setForm({ ...form, quietStart: e.target.value })}
              className="px-3 py-1.5 text-xs font-mono bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-sky-400"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="form15-qend" className="block text-xs text-zinc-400">
              Quiet Hours End
            </label>
            <input
              id="form15-qend"
              type="time"
              value={form.quietEnd}
              onChange={(e) => setForm({ ...form, quietEnd: e.target.value })}
              className="px-3 py-1.5 text-xs font-mono bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-sky-400"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {statusMessage && (
            <span className="text-xs text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              {statusMessage}
            </span>
          )}
          {isDirty && (
            <button
              type="button"
              onClick={() => {
                setForm(savedSnapshot);
                setNameError(null);
              }}
              className="px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-700 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              Discard
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 text-sm font-semibold text-zinc-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </form>
  );
}
