import React from 'react';

export interface KtxtProps {
  text?: string;
  className?: string;
  speed?: number;
}

export function Ktxt9({
  text = 'Departure board precision',
  className = '',
  speed = 1,
}: KtxtProps) {
  const words = text.split(' ');
  const durationMs = Math.round(580 * speed);
  let globalIdx = 0;

  return (
    <span
      data-ktxt="9"
      aria-label={text}
      className={`inline-flex flex-wrap items-baseline gap-x-[0.28em] font-display font-bold tracking-tight text-[#121211] ${className}`}
      style={{ perspective: '600px' }}
    >
      <style>{`
        @keyframes ktxt9-flip {
          0% {
            opacity: 0;
            transform: rotateX(-90deg) translateY(8px);
          }
          100% {
            opacity: 1;
            transform: rotateX(0deg) translateY(0);
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
                className="inline-block origin-[50%_75%] will-change-transform"
                style={{
                  animationName: 'ktxt9-flip',
                  animationDuration: `${durationMs}ms`,
                  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  animationFillMode: 'both',
                  animationDelay: `${Math.round(idx * 34 * speed)}ms`,
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
