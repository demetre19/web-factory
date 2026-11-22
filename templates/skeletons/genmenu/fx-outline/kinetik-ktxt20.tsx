import React from 'react';

export interface KtxtProps {
  text?: string;
  className?: string;
  speed?: number;
}

export function Ktxt20({
  text = 'Focus locks on plane',
  className = '',
  speed = 1,
}: KtxtProps) {
  const words = text.split(' ');
  const durationMs = Math.round(560 * speed);
  let globalIdx = 0;

  return (
    <span
      data-ktxt="20"
      aria-label={text}
      className={`inline-flex flex-wrap items-baseline gap-x-[0.28em] font-display font-bold tracking-tight text-[#121211] ${className}`}
      style={{ perspective: '700px' }}
    >
      <style>{`
        @keyframes ktxt20-zoom {
          0% {
            opacity: 0;
            transform: translate3d(0, 0, 90px) scale(1.48);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
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
                className="inline-block will-change-transform"
                style={{
                  animationName: 'ktxt20-zoom',
                  animationDuration: `${durationMs}ms`,
                  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  animationFillMode: 'both',
                  animationDelay: `${Math.round(idx * 36 * speed)}ms`,
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
