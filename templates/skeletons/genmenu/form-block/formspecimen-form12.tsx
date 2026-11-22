import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { validateDateTimeWindow } from '../../utils/validation';

export function Form12() {
  const [startDate, setStartDate] = useState('2026-11-25');
  const [startTime, setStartTime] = useState('02:00');
  const [endDate, setEndDate] = useState('2026-11-25');
  const [endTime, setEndTime] = useState('04:30');
  const [environment, setEnvironment] = useState('Production US-East');
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [savedWindow, setSavedWindow] = useState<string | null>(null);

  const windowCheck = validateDateTimeWindow(startDate, startTime, endDate, endTime);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasErr = !windowCheck.valid;
    if (reason.trim().length < 10) {
      setReasonError('Enter a maintenance reason (min 10 characters).');
      hasErr = true;
    } else {
      setReasonError(null);
    }

    if (!hasErr) {
      const hrs = Math.floor(windowCheck.durationMinutes / 60);
      const mins = windowCheck.durationMinutes % 60;
      setSavedWindow(
        `Scheduled ${environment} window (${hrs}h ${mins}m): ${startDate} ${startTime} → ${endDate} ${endTime}`
      );
    } else {
      setSavedWindow(null);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-3xl bg-zinc-950 border border-zinc-800 rounded-xl divide-y divide-zinc-800 text-zinc-100 tracking-[0.01em]"
    >
      <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-white">Maintenance Window Scheduler</h3>
          <p className="text-xs text-zinc-400">Dark carded sections with live timestamp duration validation.</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums text-zinc-300">
          <Clock className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
          {windowCheck.valid ? (
            <span>Duration: {windowCheck.durationMinutes} min</span>
          ) : (
            <span className="text-red-400">Invalid range</span>
          )}
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-3">
          <span className="block text-xs font-semibold text-zinc-300">Window Start</span>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label htmlFor="form12-sdate" className="block text-xs text-zinc-400">
                Start Date
              </label>
              <input
                id="form12-sdate"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setSavedWindow(null);
                }}
                className="w-full px-3 py-2 text-xs font-mono bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/25"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="form12-stime" className="block text-xs text-zinc-400">
                Start Time
              </label>
              <input
                id="form12-stime"
                type="time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setSavedWindow(null);
                }}
                className="w-full px-3 py-2 text-xs font-mono bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/25"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <span className="block text-xs font-semibold text-zinc-300">Window End</span>
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label htmlFor="form12-edate" className="block text-xs text-zinc-400">
                End Date
              </label>
              <input
                id="form12-edate"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setSavedWindow(null);
                }}
                aria-invalid={!windowCheck.valid}
                className={`w-full px-3 py-2 text-xs font-mono bg-zinc-900 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                  !windowCheck.valid
                    ? 'border-red-500 focus:ring-red-500/30'
                    : 'border-zinc-700 focus:border-sky-400 focus:ring-sky-400/25'
                }`}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="form12-etime" className="block text-xs text-zinc-400">
                End Time
              </label>
              <input
                id="form12-etime"
                type="time"
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setSavedWindow(null);
                }}
                aria-invalid={!windowCheck.valid}
                className={`w-full px-3 py-2 text-xs font-mono bg-zinc-900 border rounded-lg text-white focus:outline-none focus:ring-2 ${
                  !windowCheck.valid
                    ? 'border-red-500 focus:ring-red-500/30'
                    : 'border-zinc-700 focus:border-sky-400 focus:ring-sky-400/25'
                }`}
              />
            </div>
          </div>
        </div>

        {!windowCheck.valid && windowCheck.error && (
          <p role="alert" className="sm:col-span-2 text-xs text-red-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {windowCheck.error}
          </p>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="form12-env" className="block text-sm font-medium text-zinc-200">
            Target Environment
          </label>
          <select
            id="form12-env"
            value={environment}
            onChange={(e) => setEnvironment(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/25"
          >
            <option value="Production US-East">Production US-East</option>
            <option value="Production EU-Central">Production EU-Central</option>
            <option value="Staging Cluster">Staging Cluster</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="form12-reason" className="block text-sm font-medium text-zinc-200">
            Change Ticket Summary
          </label>
          <textarea
            id="form12-reason"
            rows={2}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (reasonError) setReasonError(null);
            }}
            placeholder="PostgreSQL 16 minor upgrade and primary failover rehearsal..."
            aria-invalid={Boolean(reasonError)}
            aria-describedby={reasonError ? 'form12-reason-err' : undefined}
            className={`w-full px-3.5 py-2 text-sm bg-zinc-900 border rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 ${
              reasonError ? 'border-red-500 focus:ring-red-500/30' : 'border-zinc-700 focus:border-sky-400 focus:ring-sky-400/25'
            }`}
          />
          {reasonError && (
            <p id="form12-reason-err" role="alert" className="text-xs text-red-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {reasonError}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div>
            {savedWindow && (
              <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                {savedWindow}
              </p>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-2 text-sm font-semibold text-zinc-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            Schedule Window
          </button>
        </div>
      </div>
    </form>
  );
}
