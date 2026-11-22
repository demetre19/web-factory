import React from 'react';

export interface KtxtProps {
  text?: string;
  className?: string;
  speed?: number;
}

export function Ktxt12({
  text = 'Sharp editorial curtain',
  className = '',
  speed = 1,
}: KtxtProps) {
  const words = text.split(' ');
  const durationMs = Math.round(680 * speed);
  let globalIdx = 0;

  return (
    <span
      data-ktxt="12"
      aria-label={text}
      className={`inline-flex flex-wrap items-baseline gap-x-[0.28em] font-display font-bold tracking-tight text-[#121211] ${className}`}
    >
      <style>{`
        @keyframes ktxt12-wipe {
          0% {
            clip-path: inset(0 100% 0 0);
            transform: translateX(-8px);
          }
          100% {
            clip-path: inset(0 0% 0 0);
            transform: translateX(0);
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
                className="inline-block will-change-[clip-path,transform]"
                style={{
                  animationName: 'ktxt12-wipe',
                  animationDuration: `${durationMs}ms`,
                  animationTimingFunction: 'cubic-bezier(0.77, 0, 0.175, 1)',
                  animationFillMode: 'both',
                  animationDelay: `${Math.round(idx * 22 * speed)}ms`,
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
