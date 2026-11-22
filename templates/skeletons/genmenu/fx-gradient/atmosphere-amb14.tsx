import React from 'react';

export interface Amb14Props {
  children?: React.ReactNode;
  className?: string;
}

export function Amb14({ children, className = '' }: Amb14Props) {
  return (
    <section
      className={`relative overflow-hidden rounded-xl bg-[#0F0E12] text-stone-100 ${className}`}
    >
      <style>{`
        @keyframes amb14-bleed-warm {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.34; }
          50% { transform: translate3d(-12px, 10px, 0) scale(1.1); opacity: 0.5; }
        }
        @keyframes amb14-bleed-cool {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1.05); opacity: 0.28; }
          50% { transform: translate3d(14px, -8px, 0) scale(0.95); opacity: 0.44; }
        }
        .amb14-warm { animation: amb14-bleed-warm 16s ease-in-out infinite; }
        .amb14-cool { animation: amb14-bleed-cool 20s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .amb14-warm, .amb14-cool { animation: none; }
        }
      `}</style>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="amb14-warm absolute -top-16 -right-16 h-64 w-64 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(217,119,6,0.45) 0%, transparent 70%)',
          }}
        />
        <div
          className="amb14-cool absolute -bottom-20 -left-16 h-64 w-64 rounded-full blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(71,85,105,0.55) 0%, transparent 72%)',
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-[240px] flex-col justify-between p-6">
        {children ?? (
          <>
            <p className="text-xs font-medium text-amber-200/75">
              Editorial Pull Quote · Essay IV
            </p>
            <blockquote className="font-serif-editorial my-6 text-2xl leading-snug font-medium text-stone-100 italic">
              “Atmosphere is felt in the margin of attention, never competing with the printed word.”
            </blockquote>
            <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-stone-400">
              <span>Clara Lindholm</span>
              <span>On Quiet Interfaces</span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default Amb14;
