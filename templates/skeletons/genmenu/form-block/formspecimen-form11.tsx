import React, { useState } from 'react';
import { AlertCircle, Calendar, CheckCircle2 } from 'lucide-react';
import { isDateOnOrAfter, isValidEmail } from '../../utils/validation';

const TODAY_ISO = '2026-11-21';

export function Form11() {
  const [date, setDate] = useState('2026-11-24');
  const [slot, setSlot] = useState('10:30');
  const [timezone, setTimezone] = useState('America/Los_Angeles');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ date?: string; slot?: string; email?: string }>({});
  const [booked, setBooked] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!isDateOnOrAfter(date, TODAY_ISO)) {
      next.date = `Choose a date on or after ${TODAY_ISO}.`;
    }
    if (!slot) next.slot = 'Select an available time slot.';
    if (!isValidEmail(email)) next.email = 'Enter a valid attendee email.';
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setBooked(true);
    }
  };

  if (booked) {
    return (
      <div className="max-w-2xl bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-neutral-900">Session Reserved</h3>
            <p className="text-sm text-neutral-600">
              Calendar invite sent to <span className="font-medium text-neutral-900">{email}</span> for{' '}
              <span className="font-mono text-xs text-neutral-900">{date}</span> at{' '}
              <span className="font-mono text-xs text-neutral-900">{slot}</span> ({timezone}).
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setBooked(false)}
          className="px-4 py-2 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
        >
          Reschedule
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-2xl bg-white border border-neutral-200 rounded-xl p-6 space-y-5"
    >
      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">Schedule Design Review</h3>
          <p className="text-xs text-neutral-500">Minimal two-column date and time slot picker.</p>
        </div>
        <Calendar className="w-4 h-4 text-neutral-400" aria-hidden="true" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="form11-date" className="block text-sm font-medium text-neutral-800">
            Session Date
          </label>
          <input
            id="form11-date"
            type="date"
            value={date}
            min={TODAY_ISO}
            onChange={(e) => {
              setDate(e.target.value);
              if (errors.date) setErrors((prev) => ({ ...prev, date: undefined }));
            }}
            aria-invalid={Boolean(errors.date)}
            aria-describedby={errors.date ? 'form11-date-err' : undefined}
            className={`w-full px-3.5 py-2 text-sm font-mono border rounded-lg focus:outline-none focus:ring-2 ${
              errors.date ? 'border-red-500 focus:ring-red-200' : 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-200'
            }`}
          />
          {errors.date && (
            <p id="form11-date-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {errors.date}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="form11-slot" className="block text-sm font-medium text-neutral-800">
            Time Slot (30 min)
          </label>
          <select
            id="form11-slot"
            value={slot}
            onChange={(e) => {
              setSlot(e.target.value);
              if (errors.slot) setErrors((prev) => ({ ...prev, slot: undefined }));
            }}
            aria-invalid={Boolean(errors.slot)}
            className="w-full px-3.5 py-2 text-sm font-mono bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
          >
            <option value="09:00">09:00 AM</option>
            <option value="10:30">10:30 AM</option>
            <option value="13:30">01:30 PM</option>
            <option value="15:00">03:00 PM</option>
            <option value="16:30">04:30 PM</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="form11-tz" className="block text-sm font-medium text-neutral-800">
            Timezone
          </label>
          <select
            id="form11-tz"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
          >
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="Europe/London">London (GMT/BST)</option>
            <option value="Asia/Tokyo">Tokyo (JST)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="form11-email" className="block text-sm font-medium text-neutral-800">
            Attendee Email
          </label>
          <input
            id="form11-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            placeholder="alex@team.io"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'form11-email-err' : undefined}
            className={`w-full px-3.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 ${
              errors.email ? 'border-red-500 focus:ring-red-200' : 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-200'
            }`}
          />
          {errors.email && (
            <p id="form11-email-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {errors.email}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="form11-notes" className="block text-sm font-medium text-neutral-800">
          Agenda Notes (Optional)
        </label>
        <textarea
          id="form11-notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Links or specs to review during the session..."
          className="w-full px-3.5 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-5 py-2.5 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900"
        >
          Confirm Slot
        </button>
      </div>
    </form>
  );
}
