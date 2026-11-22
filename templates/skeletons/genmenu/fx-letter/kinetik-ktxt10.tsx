import React from 'react';

export interface KtxtProps {
  text?: string;
  className?: string;
  speed?: number;
}

export function Ktxt10({
  text = 'Harmonic sine wave',
  className = '',
  speed = 1,
}: KtxtProps) {
  const words = text.split(' ');
  const waveDuration = Math.round(1800 * speed);
  const enterDuration = Math.round(400 * speed);
  let globalIdx = 0;

  return (
    <span
      data-ktxt="10"
      aria-label={text}
      className={`inline-flex flex-wrap items-baseline gap-x-[0.28em] font-display font-bold tracking-tight text-[#121211] ${className}`}
    >
      <style>{`
        @keyframes ktxt10-fade {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        @keyframes ktxt10-wave {
          0%, 100% {
            transform: translateY(0px);
          }
          25% {
            transform: translateY(-7px);
          }
          75% {
            transform: translateY(5px);
          }
        }
      `}</style>
      {words.map((word, wIdx) => (
        <span key={`${wIdx}-${word}`} aria-hidden="true" className="inline-flex whitespace-nowrap">
          {Array.from(word).map((char, cIdx) => {
            const idx = globalIdx;
            globalIdx += 1;
            const enterDelay = Math.round(idx * 25 * speed);
            const waveDelay = Math.round(idx * 75 * speed);
            return (
              <span
                key={`${wIdx}-${cIdx}-${char}`}
                className="inline-block will-change-transform"
                style={{
                  animationName: 'ktxt10-fade, ktxt10-wave',
                  animationDuration: `${enterDuration}ms, ${waveDuration}ms`,
                  animationTimingFunction: 'ease-out, ease-in-out',
                  animationIterationCount: '1, infinite',
                  animationFillMode: 'both, none',
                  animationDelay: `${enterDelay}ms, ${waveDelay}ms`,
                }}
              >
                {char}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
