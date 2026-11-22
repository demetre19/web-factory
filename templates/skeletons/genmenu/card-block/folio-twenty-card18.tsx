import { useState } from 'react';
import { Ticket, Check } from 'lucide-react';

export interface Card18Props {
  dateLabel?: string;
  isoDate?: string;
  title?: string;
  host?: string;
  location?: string;
  totalSeats?: number;
  initialRemaining?: number;
  bgClass?: string;
}

export function Card18({
  dateLabel = 'Sat, Nov 28 · 10:00 AM',
  isoDate = '2026-11-28T10:00',
  title = 'Two-Color Risograph Poster Lab',
  host = 'Hosted by Canal Press',
  location = 'Brooklyn Navy Yard, Bldg 77',
  totalSeats = 24,
  initialRemaining = 6,
  bgClass = 'bg-[#ECFDF5]',
}: Card18Props) {
  const [claimed, setClaimed] = useState(false);

  const remaining = claimed ? initialRemaining - 1 : initialRemaining;

  return (
    <article
      className={`${bgClass} border-2 border-zinc-900 rounded-2xl p-6 flex flex-col justify-between gap-5 shadow-[4px_4px_0px_0px_rgba(20,20,19,1)]`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 text-xs font-semibold text-zinc-800">
          <time dateTime={isoDate}>{dateLabel}</time>
          <span className="font-mono tabular-nums text-zinc-900">
            {remaining}/{totalSeats} left
          </span>
        </div>

        <h3 className="mt-3 text-lg font-bold leading-snug tracking-tight text-zinc-900 text-balance">
          {title}
        </h3>

        <p className="mt-2 text-xs font-medium text-zinc-700">{host}</p>
        <p className="mt-0.5 text-xs text-zinc-600">{location}</p>
      </div>

      <footer className="pt-4 border-t border-zinc-900/15">
        <button
          type="button"
          onClick={() => setClaimed((prev) => !prev)}
          aria-pressed={claimed}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border-2 border-zinc-900 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 ${
            claimed
              ? 'bg-zinc-900 text-white'
              : 'bg-white text-zinc-900 hover:bg-[#FACC15]'
          }`}
        >
          {claimed ? (
            <>
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Spot Claimed</span>
            </>
          ) : (
            <>
              <Ticket className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Claim Workshop Spot</span>
            </>
          )}
        </button>
      </footer>
    </article>
  );
}
