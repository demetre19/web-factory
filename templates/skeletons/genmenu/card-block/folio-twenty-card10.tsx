import { useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';

export interface Card10Props {
  edition?: string;
  title?: string;
  description?: string;
  unitPrice?: number;
  unitLabel?: string;
  deliverables?: string[];
  headerBg?: string;
}

export function Card10({
  edition = 'Commercial License',
  title = 'Foundry Makers Bundle',
  description = 'Complete geometric sans + display serif desktop and webfont kit with Figma variable tokens.',
  unitPrice = 48,
  unitLabel = 'seat',
  deliverables = [
    '12 variable font weights (WOFF2 & OTF)',
    'Unlimited commercial client projects',
    'Lifetime minor point releases',
  ],
  headerBg = 'bg-[#DBEAFE]',
}: Card10Props) {
  const [seats, setSeats] = useState(2);
  const [selected, setSelected] = useState(false);

  const total = seats * unitPrice;

  return (
    <article className="bg-white border-2 border-zinc-900 rounded-2xl overflow-hidden flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(20,20,19,1)]">
      <div>
        <header className={`${headerBg} px-6 py-5 border-b-2 border-zinc-900`}>
          <p className="text-xs font-bold text-zinc-800">{edition}</p>
          <div className="mt-1 flex items-baseline justify-between gap-3">
            <h3 className="text-lg font-bold tracking-tight text-zinc-900">{title}</h3>
            <div className="text-right shrink-0">
              <span className="text-2xl font-bold font-mono tabular-nums text-zinc-900">
                ${total}
              </span>
              <span className="block text-[11px] font-medium text-zinc-700 font-mono tabular-nums">
                ${unitPrice} / {unitLabel}
              </span>
            </div>
          </div>
        </header>

        <div className="p-6">
          <p className="text-sm leading-relaxed text-zinc-700">{description}</p>

          <ul className="mt-4 space-y-2.5 text-xs text-zinc-800">
            {deliverables.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <footer className="px-6 pb-6 pt-4 border-t border-zinc-200 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-zinc-700">Team seats</span>
          <div className="inline-flex items-center border-2 border-zinc-900 rounded-lg overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setSeats((s) => Math.max(1, s - 1))}
              aria-label="Decrease seats"
              className="w-8 h-8 flex items-center justify-center text-zinc-900 hover:bg-zinc-100 transition-colors focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-zinc-900"
            >
              <Minus className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
            <span className="w-9 text-center text-xs font-bold font-mono tabular-nums text-zinc-900">
              {seats}
            </span>
            <button
              type="button"
              onClick={() => setSeats((s) => Math.min(25, s + 1))}
              aria-label="Increase seats"
              className="w-8 h-8 flex items-center justify-center text-zinc-900 hover:bg-zinc-100 transition-colors focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-zinc-900"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setSelected((prev) => !prev)}
          aria-pressed={selected}
          className={`w-full px-4 py-2.5 text-xs font-bold rounded-xl border-2 border-zinc-900 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 ${
            selected
              ? 'bg-zinc-900 text-white'
              : 'bg-[#FACC15] text-zinc-900 hover:bg-[#EAB308]'
          }`}
        >
          {selected ? `License Reserved (${seats} seats)` : `Select Bundle — $${total}`}
        </button>
      </footer>
    </article>
  );
}
