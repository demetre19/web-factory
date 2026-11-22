import React from 'react';

export interface Amb5Props {
  children?: React.ReactNode;
  className?: string;
}

export function Amb5({ children, className = '' }: Amb5Props) {
  return (
    <section
      className={`relative overflow-hidden rounded-xl bg-[#101218] text-slate-100 ${className}`}
    >
      <style>{`
        @keyframes amb5-float-cw {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(10px, -16px, 0) rotate(22deg); }
        }
        @keyframes amb5-float-ccw {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          50% { transform: translate3d(-12px, 14px, 0) rotate(-26deg); }
        }
        @keyframes amb5-drift-slow {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(8px, 10px, 0) scale(1.06); }
        }
        .amb5-s1 { animation: amb5-float-cw 22s ease-in-out infinite; transform-origin: center; }
        .amb5-s2 { animation: amb5-float-ccw 28s ease-in-out infinite; transform-origin: center; }
        .amb5-s3 { animation: amb5-drift-slow 18s ease-in-out infinite; transform-origin: center; }
        @media (prefers-reduced-motion: reduce) {
          .amb5-s1, .amb5-s2, .amb5-s3 { animation: none; }
        }
      `}</style>

      <svg
        aria-hidden="true"
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <g className="amb5-s1" opacity="0.2">
          <polygon
            points="310,24 348,46 348,90 310,112 272,90 272,46"
            fill="none"
            stroke="#E2E8F0"
            strokeWidth="1"
          />
        </g>
        <g className="amb5-s2" opacity="0.18">
          <rect
            x="220"
            y="128"
            width="52"
            height="52"
            rx="4"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1"
            transform="rotate(24 246 154)"
          />
        </g>
        <g className="amb5-s3" opacity="0.22">
          <circle
            cx="76"
            cy="56"
            r="26"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="0.9"
            strokeDasharray="4 4"
          />
        </g>
        <g className="amb5-s1" opacity="0.16">
          <polygon
            points="336,162 368,212 304,212"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="0.9"
          />
        </g>
      </svg>

      <div className="relative z-10 flex min-h-[240px] flex-col justify-between p-6">
        {children ?? (
          <>
            <p className="text-xs font-medium text-slate-400">
              Industrial Design · Specification
            </p>
            <div className="mt-8 space-y-2">
              <h3 className="text-lg font-semibold tracking-tight text-white">
                Anodized Frame Series
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-slate-300">
                Hairline SVG polygons counter-rotate in the background margin to evoke drafted elevation geometry.
              </p>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-400 tabular-nums">
              <span>6061-T6 Aluminum</span>
              <span>Tolerance ±0.05 mm</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Amb5;
