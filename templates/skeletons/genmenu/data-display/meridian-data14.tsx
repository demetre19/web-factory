import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DayEvent {
  time: string;
  title: string;
  room: string;
  attendees: string;
}

interface CalendarDay {
  iso: string;
  weekday: string;
  dayNum: number;
  events: DayEvent[];
}

const WEEKS: Array<{ label: string; days: CalendarDay[] }> = [
  {
    label: 'Nov 16 – Nov 22, 2026',
    days: [
      {
        iso: '2026-11-16',
        weekday: 'Mon',
        dayNum: 16,
        events: [
          { time: '09:30', title: 'Q4 Operating Cadence Review', room: 'Boardroom B', attendees: '6 participants' },
          { time: '14:00', title: 'Enterprise Architecture Sync', room: 'Zoom · Core', attendees: '4 participants' },
        ],
      },
      {
        iso: '2026-11-17',
        weekday: 'Tue',
        dayNum: 17,
        events: [
          { time: '11:00', title: 'Kestrel Robotics Contract Redlines', room: 'Legal Desk', attendees: '3 participants' },
        ],
      },
      {
        iso: '2026-11-18',
        weekday: 'Wed',
        dayNum: 18,
        events: [
          { time: '10:00', title: 'Design Systems Crit: Data Primitives', room: 'Studio 4', attendees: '8 participants' },
          { time: '15:30', title: 'Security Table-Top Exercise', room: 'War Room', attendees: '11 participants' },
        ],
      },
      {
        iso: '2026-11-19',
        weekday: 'Thu',
        dayNum: 19,
        events: [
          { time: '13:00', title: 'Customer Advisory Board Briefing', room: 'Main Hall', attendees: '14 participants' },
        ],
      },
      {
        iso: '2026-11-20',
        weekday: 'Fri',
        dayNum: 20,
        events: [
          { time: '09:00', title: 'Weekly Demo & Release Retro', room: 'All Hands', attendees: '32 participants' },
        ],
      },
      { iso: '2026-11-21', weekday: 'Sat', dayNum: 21, events: [] },
      { iso: '2026-11-22', weekday: 'Sun', dayNum: 22, events: [] },
    ],
  },
  {
    label: 'Nov 23 – Nov 29, 2026',
    days: [
      {
        iso: '2026-11-23',
        weekday: 'Mon',
        dayNum: 23,
        events: [
          { time: '10:30', title: '2027 Budget Allocation Sign-Off', room: 'Exec Suite', attendees: '5 participants' },
        ],
      },
      {
        iso: '2026-11-24',
        weekday: 'Tue',
        dayNum: 24,
        events: [
          { time: '14:00', title: 'Database Failover Drill', room: 'Infra Bridge', attendees: '7 participants' },
        ],
      },
      { iso: '2026-11-25', weekday: 'Wed', dayNum: 25, events: [] },
      { iso: '2026-11-26', weekday: 'Thu', dayNum: 26, events: [] },
      {
        iso: '2026-11-27',
        weekday: 'Fri',
        dayNum: 27,
        events: [
          { time: '11:00', title: 'Partner Enablement Webinar', room: 'Broadcast', attendees: '45 participants' },
        ],
      },
      { iso: '2026-11-28', weekday: 'Sat', dayNum: 28, events: [] },
      { iso: '2026-11-29', weekday: 'Sun', dayNum: 29, events: [] },
    ],
  },
];

export function Data14() {
  const [weekIdx, setWeekIdx] = useState<number>(0);
  const [selectedIso, setSelectedIso] = useState<string>('2026-11-18');

  const currentWeek = WEEKS[weekIdx];
  const selectedDay =
    currentWeek.days.find((d) => d.iso === selectedIso) ?? currentWeek.days[0];

  const switchWeek = (nextIdx: number) => {
    setWeekIdx(nextIdx);
    setSelectedIso(WEEKS[nextIdx].days[0].iso);
  };

  return (
    <section
      aria-label="Weekly executive schedule calendar strip"
      className="rounded-xl border border-slate-200 bg-white p-6"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Weekly Schedule</h3>
          <p className="text-xs text-slate-500">{currentWeek.label}</p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Previous week"
            disabled={weekIdx === 0}
            onClick={() => switchWeek(Math.max(0, weekIdx - 1))}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Next week"
            disabled={weekIdx === WEEKS.length - 1}
            onClick={() => switchWeek(Math.min(WEEKS.length - 1, weekIdx + 1))}
            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <ul className="grid grid-cols-7 gap-2">
        {currentWeek.days.map((day) => {
          const isSelected = selectedDay.iso === day.iso;
          return (
            <li key={day.iso}>
              <button
                type="button"
                aria-pressed={isSelected}
                aria-label={`${day.weekday} Nov ${day.dayNum}, ${day.events.length} events`}
                onClick={() => setSelectedIso(day.iso)}
                className={`flex w-full flex-col items-center rounded-xl border py-3 transition-colors ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className={`text-[11px] font-medium ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {day.weekday}
                </span>
                <span className="mt-1 font-display text-lg font-bold tabular-nums">
                  {day.dayNum}
                </span>
                <span className={`mt-1 text-[10px] font-mono tabular-nums ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                  {day.events.length} {day.events.length === 1 ? 'evt' : 'evts'}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-800">
            Agenda for {selectedDay.weekday}, Nov {selectedDay.dayNum}
          </span>
          <span className="tabular-nums">{selectedDay.events.length} scheduled</span>
        </div>

        {selectedDay.events.length === 0 ? (
          <p className="rounded-lg bg-slate-50 px-4 py-3 text-xs text-slate-500">
            No meetings scheduled — focus block open.
          </p>
        ) : (
          <ul className="space-y-2">
            {selectedDay.events.map((ev) => (
              <li
                key={ev.time + ev.title}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200/80 px-4 py-2.5 text-xs"
              >
                <div className="flex items-center gap-3">
                  <time className="font-mono font-medium text-slate-900 tabular-nums">
                    {ev.time}
                  </time>
                  <span className="font-semibold text-slate-900">{ev.title}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <span>{ev.room}</span>
                  <span aria-hidden="true">·</span>
                  <span>{ev.attendees}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
