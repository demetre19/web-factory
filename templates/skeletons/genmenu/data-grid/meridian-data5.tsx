import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';

interface CampaignCard {
  id: string;
  channel: string;
  headline: string;
  metric: string;
  submetric: string;
  delta: string;
  bgClass: string;
  accentClass: string;
  quarterGoal: string;
}

const CAMPAIGNS: CampaignCard[] = [
  {
    id: 'search',
    channel: 'Organic Search',
    headline: '148,920',
    metric: 'Qualified Sessions',
    submetric: '4.8% trial conversion rate',
    delta: '+22.4% QoQ',
    bgClass: 'bg-indigo-600 text-white',
    accentClass: 'text-indigo-100',
    quarterGoal: 'Target: 135,000 sessions',
  },
  {
    id: 'partners',
    channel: 'Partner Referrals',
    headline: '$412,500',
    metric: 'Attributed Pipeline',
    submetric: '34 enterprise demos booked',
    delta: '+31.0% QoQ',
    bgClass: 'bg-emerald-600 text-white',
    accentClass: 'text-emerald-100',
    quarterGoal: 'Target: $360,000 pipeline',
  },
  {
    id: 'events',
    channel: 'Field Workshops',
    headline: '68.4%',
    metric: 'Attendance Rate',
    submetric: '1,240 registered practitioners',
    delta: '+9.1% QoQ',
    bgClass: 'bg-amber-500 text-slate-950',
    accentClass: 'text-amber-950/80',
    quarterGoal: 'Target: 62.0% attendance',
  },
];

export function Data5() {
  const [selectedChannel, setSelectedChannel] = useState<string>('search');

  return (
    <section aria-label="Colourful campaign acquisition KPI tiles">
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {CAMPAIGNS.map((card) => {
          const isSelected = selectedChannel === card.id;
          return (
            <li key={card.id}>
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => setSelectedChannel(card.id)}
                className={`group flex h-full w-full flex-col justify-between rounded-2xl p-6 text-left transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
                  card.bgClass
                } ${isSelected ? 'ring-2 ring-slate-900 ring-offset-2' : 'hover:-translate-y-0.5'}`}
              >
                <div className="flex w-full items-center justify-between gap-2">
                  <span className={`text-xs font-semibold ${card.accentClass}`}>
                    {card.channel}
                  </span>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-black/15 px-2.5 py-0.5 text-xs font-semibold tabular-nums whitespace-nowrap">
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    {card.delta}
                  </span>
                </div>

                <div className="my-5">
                  <div className="font-display text-3xl font-bold tracking-tight tabular-nums">
                    {card.headline}
                  </div>
                  <div className="mt-1 text-sm font-medium">{card.metric}</div>
                </div>

                <div className={`flex w-full items-center justify-between border-t border-current/15 pt-3 text-xs ${card.accentClass}`}>
                  <span>{card.submetric}</span>
                  <span className="font-mono tabular-nums">{card.quarterGoal}</span>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
