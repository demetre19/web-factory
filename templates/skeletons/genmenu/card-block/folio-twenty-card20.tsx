import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface Card20Props {
  heading?: string;
  subtitle?: string;
  entries?: FaqEntry[];
}

const DEFAULT_ENTRIES: FaqEntry[] = [
  {
    question: 'Are these components free of external runtime dependencies?',
    answer:
      'Yes. Each card relies solely on React, standard Tailwind CSS utilities, and crisp SVG icons without third-party state wrappers.',
  },
  {
    question: 'How do vertical cards adapt inside a 3-column grid?',
    answer:
      'Every grid-ready card uses flex-col justify-between so footers and action rows align cleanly across uneven headline lengths.',
  },
  {
    question: 'Can dark and minimal cards coexist on one page?',
    answer:
      'Yes. Surface tokens, border contrast, and text weights are scoped directly on each self-contained card root.',
  },
];

export function Card20({
  heading = 'Licensing & Integration FAQ',
  subtitle = 'Common engineering questions answered clearly.',
  entries = DEFAULT_ENTRIES,
}: Card20Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      aria-label={heading}
      className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col justify-between"
    >
      <header className="pb-4 border-b border-zinc-100">
        <h3 className="text-base font-semibold text-zinc-900">{heading}</h3>
        <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
      </header>

      <div className="divide-y divide-zinc-100">
        {entries.map((entry, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={entry.question} className="py-3.5 first:pt-4 last:pb-1">
              <button
                type="button"
                onClick={() => setOpenIndex((cur) => (cur === idx ? null : idx))}
                aria-expanded={isOpen}
                className="w-full flex items-start justify-between gap-4 text-left text-sm font-medium text-zinc-900 hover:text-blue-700 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 rounded"
              >
                <span>{entry.question}</span>
                <span className="mt-0.5 text-zinc-500 shrink-0" aria-hidden="true">
                  {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </span>
              </button>

              {isOpen && (
                <p className="mt-2.5 text-xs leading-relaxed text-zinc-600 pr-6">
                  {entry.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
