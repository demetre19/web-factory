import React from 'react';

export interface KtxtProps {
  text?: string;
  className?: string;
  speed?: number;
}

export function Ktxt8({
  text = 'Optical clarity in motion',
  className = '',
  speed = 1,
}: KtxtProps) {
  const words = text.split(' ');
  const durationMs = Math.round(620 * speed);
  let globalIdx = 0;

  return (
    <span
      data-ktxt="8"
      aria-label={text}
      className={`inline-flex flex-wrap items-baseline gap-x-[0.28em] font-display font-bold tracking-tight text-[#121211] ${className}`}
    >
      <style>{`
        @keyframes ktxt8-focus {
          0% {
            opacity: 0;
            filter: blur(12px);
            transform: scale(1.08);
          }
          100% {
            opacity: 1;
            filter: blur(0px);
            transform: scale(1);
          }
        }
      `}</style>
      {words.map((word, wIdx) => (
        <span key={`${wIdx}-${word}`} aria-hidden="true" className="inline-flex whitespace-nowrap">
          {Array.from(word).map((char, cIdx) => {
            const idx = globalIdx;
            globalIdx += 1;
            return (
              <span
                key={`${wIdx}-${cIdx}-${char}`}
                className="inline-block will-change-[filter,transform,opacity]"
                style={{
                  animationName: 'ktxt8-focus',
                  animationDuration: `${durationMs}ms`,
                  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  animationFillMode: 'both',
                  animationDelay: `${Math.round(idx * 38 * speed)}ms`,
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
