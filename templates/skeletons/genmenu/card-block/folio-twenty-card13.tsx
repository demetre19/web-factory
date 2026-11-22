import { useState } from 'react';
import { Eye } from 'lucide-react';

export interface Card13Props {
  plateNumber?: string;
  title?: string;
  medium?: string;
  year?: string;
  curatorialNote?: string;
  gradientClass?: string;
  accentStroke?: string;
}

export function Card13({
  plateNumber = 'Plate IV',
  title = 'Equinox Vault Study',
  medium = 'Vector Archival Print',
  year = '2026',
  curatorialNote = 'Constructed from concentric golden-ratio arcs and stepped warm-ochre gradients representing mid-winter solar azimuth.',
  gradientClass = 'from-[#1C1917] via-[#44403C] to-[#D6D3D1]',
  accentStroke = '#F5F5F4',
}: Card13Props) {
  const [showNote, setShowNote] = useState(false);

  return (
    <article className="bg-[#FAF8F4] border border-stone-300/80 rounded-xl overflow-hidden flex flex-col justify-between">
      <div className={`relative aspect-[4/3] bg-gradient-to-br ${gradientClass} p-6 flex items-center justify-center overflow-hidden`}>
        <svg
          viewBox="0 0 280 210"
          className="w-full h-full"
          role="img"
          aria-label={`Geometric artwork: ${title}`}
        >
          <defs>
            <linearGradient id={`plateGrad-${plateNumber}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={accentStroke} stopOpacity="0.9" />
              <stop offset="100%" stopColor={accentStroke} stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <rect x="24" y="20" width="232" height="170" fill="none" stroke={accentStroke} strokeOpacity="0.35" strokeWidth="1" />
          <circle cx="140" cy="105" r="64" fill={`url(#plateGrad-${plateNumber})`} fillOpacity="0.22" stroke={accentStroke} strokeWidth="1.5" />
          <circle cx="140" cy="105" r="36" fill="none" stroke={accentStroke} strokeOpacity="0.7" strokeWidth="1" />
          <line x1="24" y1="105" x2="256" y2="105" stroke={accentStroke} strokeOpacity="0.45" strokeWidth="1" />
          <path d="M 140 20 L 204 170 L 76 170 Z" fill="none" stroke={accentStroke} strokeOpacity="0.65" strokeWidth="1.25" />
        </svg>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between gap-2 text-xs text-stone-500 font-mono">
          <span>{plateNumber}</span>
          <span>{year}</span>
        </div>

        <h3
          className="mt-2 text-lg font-semibold text-stone-900"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h3>

        <p className="mt-1 text-xs text-stone-600">{medium}</p>

        {showNote && (
          <p className="mt-3 pt-3 border-t border-stone-200 text-xs leading-relaxed text-stone-700">
            {curatorialNote}
          </p>
        )}

        <div className="mt-4 pt-3 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={() => setShowNote((prev) => !prev)}
            aria-expanded={showNote}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-900 hover:text-stone-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
          >
            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{showNote ? 'Hide Plate Note' : 'Inspect Plate'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
