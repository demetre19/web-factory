import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

export interface Card14Props {
  editionCode?: string;
  title?: string;
  artist?: string;
  initialPalette?: number;
}

const PALETTES = [
  {
    name: 'Cobalt & Sun',
    bg: 'from-[#1D4ED8] via-[#2563EB] to-[#60A5FA]',
    shapeA: '#FACC15',
    shapeB: '#FFFFFF',
    shapeC: '#0F172A',
  },
  {
    name: 'Coral & Mint',
    bg: 'from-[#E11D48] via-[#FB7185] to-[#FDA4AF]',
    shapeA: '#FEF08A',
    shapeB: '#ECFDF5',
    shapeC: '#18181B',
  },
  {
    name: 'Forest & Amber',
    bg: 'from-[#065F46] via-[#059669] to-[#34D399]',
    shapeA: '#FDE047',
    shapeB: '#FFFBEB',
    shapeC: '#111827',
  },
];

export function Card14({
  editionCode = 'Print 08 / 50',
  title = 'Riso Study in Thirds',
  artist = 'Studio Maru',
  initialPalette = 0,
}: Card14Props) {
  const [paletteIdx, setPaletteIdx] = useState(initialPalette % PALETTES.length);
  const palette = PALETTES[paletteIdx];

  return (
    <article className="bg-white border-2 border-zinc-900 rounded-2xl overflow-hidden flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(20,20,19,1)]">
      <div className={`aspect-[4/3] bg-gradient-to-tr ${palette.bg} p-5 flex items-center justify-center`}>
        <svg
          viewBox="0 0 260 195"
          className="w-full h-full"
          role="img"
          aria-label={`Risograph geometric print: ${title} in ${palette.name}`}
        >
          <rect x="18" y="20" width="90" height="155" rx="45" fill={palette.shapeA} />
          <circle cx="165" cy="78" r="52" fill={palette.shapeB} fillOpacity="0.92" />
          <polygon points="120,175 236,175 178,96" fill={palette.shapeC} fillOpacity="0.88" />
          <circle cx="63" cy="65" r="14" fill={palette.shapeC} />
        </svg>
      </div>

      <div className="p-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-mono text-zinc-500">
            {editionCode} · {palette.name}
          </p>
          <h3 className="mt-1 text-base font-bold text-zinc-900 truncate">{title}</h3>
          <p className="text-xs text-zinc-600 truncate">{artist}</p>
        </div>

        <button
          type="button"
          onClick={() => setPaletteIdx((idx) => (idx + 1) % PALETTES.length)}
          aria-label={`Switch colorway for ${title}`}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border-2 border-zinc-900 rounded-xl transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Remix</span>
        </button>
      </div>
    </article>
  );
}
