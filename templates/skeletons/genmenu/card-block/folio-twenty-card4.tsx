import { useState } from 'react';
import { MessageSquare, Check } from 'lucide-react';
import { CardMedia } from './CardMedia';

export interface Card4Props {
  name?: string;
  role?: string;
  team?: string;
  tenureYears?: number;
  shippedSystems?: number;
  focus?: string;
  avatarSrc?: string;
}

export function Card4({
  name = 'Tomasz Kowalski',
  role = 'Principal Systems Engineer',
  team = 'Distributed Runtime',
  tenureYears = 6,
  shippedSystems = 14,
  focus = 'Deterministic state replication, edge query planners, and zero-downtime schema migrations.',
  avatarSrc = '/src/assets/images/portrait_lead_engineer_1795319252370.jpg',
}: Card4Props) {
  const [pinged, setPinged] = useState(false);

  return (
    <article className="bg-[#121316] text-zinc-100 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between gap-5">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-lg overflow-hidden border border-zinc-700 shrink-0">
              <CardMedia
                src={avatarSrc}
                alt={`Studio portrait of ${name}`}
                aspectClass="aspect-square"
                fallbackTone="dark"
              />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold tracking-[0.01em] text-white truncate">
                {name}
              </h3>
              <p className="text-xs font-medium text-zinc-300 truncate">{role}</p>
              <p className="mt-0.5 text-xs text-zinc-400 truncate">{team}</p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-zinc-300">{focus}</p>
      </div>

      <div className="space-y-4">
        <dl className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-800">
          <div>
            <dt className="text-xs text-zinc-400">Tenure</dt>
            <dd className="mt-0.5 text-sm font-semibold font-mono tabular-nums text-white">
              {tenureYears} yrs
            </dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-400">Systems Led</dt>
            <dd className="mt-0.5 text-sm font-semibold font-mono tabular-nums text-white">
              {shippedSystems}
            </dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={() => setPinged((prev) => !prev)}
          aria-pressed={pinged}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
            pinged
              ? 'bg-zinc-800 text-zinc-100 border border-zinc-600'
              : 'bg-white text-zinc-950 hover:bg-zinc-200'
          }`}
        >
          {pinged ? (
            <>
              <Check className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Intro Requested</span>
            </>
          ) : (
            <>
              <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Request Technical Intro</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}
