import { useState } from 'react';
import { Check, Minus } from 'lucide-react';

interface CardTrait {
  label: string;
  value: string;
  included: boolean;
  sharedAcrossAll?: boolean;
}

const DARK_CARDS: {
  id: string;
  name: string;
  price: string;
  winner: boolean;
  traits: CardTrait[];
}[] = [
  {
    id: 'starter-edge',
    name: 'Edge Basic',
    price: '$24/mo',
    winner: false,
    traits: [
      { label: 'Global PoPs', value: '35 regions', included: true, sharedAcrossAll: true },
      { label: 'TLS 1.3 Certificates', value: 'Automated', included: true, sharedAcrossAll: true },
      { label: 'WAF Custom Rules', value: '5 rules', included: true },
      { label: 'DDoS L7 Mitigation', value: 'Up to 10 Gbps', included: true },
      { label: 'Edge Key-Value Store', value: 'Not included', included: false },
    ],
  },
  {
    id: 'edge-shield',
    name: 'Edge Shield',
    price: '$79/mo',
    winner: true,
    traits: [
      { label: 'Global PoPs', value: '35 regions', included: true, sharedAcrossAll: true },
      { label: 'TLS 1.3 Certificates', value: 'Automated', included: true, sharedAcrossAll: true },
      { label: 'WAF Custom Rules', value: '100 rules', included: true },
      { label: 'DDoS L7 Mitigation', value: 'Unmetered', included: true },
      { label: 'Edge Key-Value Store', value: '50 GB replicated', included: true },
    ],
  },
  {
    id: 'edge-mesh',
    name: 'Edge Mesh',
    price: '$220/mo',
    winner: false,
    traits: [
      { label: 'Global PoPs', value: '35 regions', included: true, sharedAcrossAll: true },
      { label: 'TLS 1.3 Certificates', value: 'Automated', included: true, sharedAcrossAll: true },
      { label: 'WAF Custom Rules', value: 'Unlimited', included: true },
      { label: 'DDoS L7 Mitigation', value: 'Unmetered + SOC', included: true },
      { label: 'Edge Key-Value Store', value: '250 GB replicated', included: true },
    ],
  },
];

export function Compare14() {
  const [highlightDiffs, setHighlightDiffs] = useState<boolean>(true);

  return (
    <section
      aria-labelledby="compare14-heading"
      className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-xl p-6 md:p-8"
    >
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-emerald-400 mb-1">Dark Mobile-Stacked Cards</p>
          <h3 id="compare14-heading" className="text-2xl font-semibold tracking-tight text-white font-display">
            Edge Security Stack Options
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setHighlightDiffs((prev) => !prev)}
          aria-pressed={highlightDiffs}
          className={`px-3.5 py-2 text-xs font-medium rounded-lg border transition-colors self-start whitespace-nowrap ${
            highlightDiffs
              ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
              : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
        >
          {highlightDiffs ? 'Highlighting Differences' : 'Show All Equally'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {DARK_CARDS.map((card) => (
          <article
            key={card.id}
            className={`rounded-lg p-5 border ${
              card.winner
                ? 'bg-slate-900 border-emerald-500/70'
                : 'bg-slate-900/50 border-slate-800'
            }`}
          >
            <div className="flex items-baseline justify-between gap-2 pb-4 mb-4 border-b border-slate-800">
              <div>
                <div className="text-xs font-medium text-emerald-400 min-h-[1rem]">
                  {card.winner ? 'Recommended' : ''}
                </div>
                <h4 className="text-lg font-semibold text-white font-display">{card.name}</h4>
              </div>
              <span className="font-mono text-lg font-bold text-white tabular-nums">{card.price}</span>
            </div>

            <dl className="space-y-2.5">
              {card.traits.map((trait) => {
                const dimmed = highlightDiffs && trait.sharedAcrossAll;
                return (
                  <div
                    key={trait.label}
                    className={`flex items-center justify-between gap-3 text-sm transition-opacity ${
                      dimmed ? 'opacity-40' : 'opacity-100'
                    }`}
                  >
                    <dt className="text-slate-300">{trait.label}</dt>
                    <dd className="inline-flex items-center gap-1.5 font-mono text-xs tabular-nums text-right">
                      {trait.included ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-hidden="true" />
                      ) : (
                        <Minus className="w-3.5 h-3.5 text-slate-600 shrink-0" aria-hidden="true" />
                      )}
                      <span className={card.winner && !dimmed ? 'text-emerald-200 font-semibold' : 'text-slate-200'}>
                        {trait.value}
                      </span>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
