import { useState } from 'react';
import { Calendar, Check } from 'lucide-react';

export interface Card17Props {
  month?: string;
  day?: string;
  isoDate?: string;
  timeRange?: string;
  title?: string;
  speaker?: string;
  venue?: string;
  format?: string;
}

export function Card17({
  month = 'DEC',
  day = '04',
  isoDate = '2026-12-04T18:30',
  timeRange = '18:30 – 20:30 PST',
  title = 'Architecture of Low-Latency Design Tools',
  speaker = 'With Dr. Kenji Sato',
  venue = 'Pier 27 Auditorium, San Francisco',
  format = 'In-Person Lecture',
}: Card17Props) {
  const [reserved, setReserved] = useState(false);

  return (
    <article className="bg-[#111215] text-zinc-100 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between gap-5">
      <div>
        <div className="flex items-start justify-between gap-4">
          <time
            dateTime={isoDate}
            className="inline-flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-zinc-900 border border-zinc-700 shrink-0"
          >
            <span className="text-[10px] font-semibold tracking-wider text-amber-400">
              {month}
            </span>
            <span className="text-lg font-bold font-mono tabular-nums text-white leading-tight">
              {day}
            </span>
          </time>

          <div className="text-right text-xs text-zinc-400">
            <p className="font-medium text-zinc-200">{format}</p>
            <p className="mt-0.5 font-mono tabular-nums">{timeRange}</p>
          </div>
        </div>

        <h3 className="mt-5 text-base font-semibold leading-snug tracking-[0.01em] text-white text-balance">
          {title}
        </h3>

        <p className="mt-2 text-xs text-zinc-300">{speaker}</p>
        <p className="mt-1 text-xs text-zinc-400">{venue}</p>
      </div>

      <footer className="pt-4 border-t border-zinc-800">
        <button
          type="button"
          onClick={() => setReserved((prev) => !prev)}
          aria-pressed={reserved}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
            reserved
              ? 'bg-emerald-950/80 text-emerald-200 border border-emerald-700'
              : 'bg-white text-zinc-950 hover:bg-zinc-200'
          }`}
        >
          {reserved ? (
            <>
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Seat Reserved</span>
            </>
          ) : (
            <>
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reserve Seat</span>
            </>
          )}
        </button>
      </footer>
    </article>
  );
}
