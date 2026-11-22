import React from 'react';

export interface KtxtProps {
  text?: string;
  className?: string;
  speed?: number;
}

export function Ktxt1({
  text = 'Form follows velocity',
  className = '',
  speed = 1,
}: KtxtProps) {
  const words = text.split(' ');
  const durationMs = Math.round(520 * speed);
  let globalIndex = 0;

  return (
    <span
      data-ktxt="1"
      aria-label={text}
      className={`inline-flex flex-wrap items-baseline gap-x-[0.28em] font-display font-bold tracking-tight text-[#121211] ${className}`}
    >
      <style>{`
        @keyframes ktxt1-rise {
          0% {
            opacity: 0;
            transform: translateY(110%);
          }
          100% {
            opacity: 1;
            transform: translateY(0%);
          }
        }
      `}</style>
      {words.map((word, wIdx) => (
        <span key={`${wIdx}-${word}`} aria-hidden="true" className="inline-flex overflow-hidden py-[0.06em]">
          {Array.from(word).map((char, cIdx) => {
            const delay = Math.round(globalIndex * 35 * speed);
            globalIndex += 1;
            return (
              <span
                key={`${wIdx}-${cIdx}-${char}`}
                className="inline-block will-change-transform"
                style={{
                  animationName: 'ktxt1-rise',
                  animationDuration: `${durationMs}ms`,
                  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  animationFillMode: 'both',
                  animationDelay: `${delay}ms`,
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
