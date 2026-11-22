import React from 'react';

export interface KtxtProps {
  text?: string;
  className?: string;
  speed?: number;
}

export function Ktxt17({
  text = 'Gravity meets rebound',
  className = '',
  speed = 1,
}: KtxtProps) {
  const words = text.split(' ');
  const durationMs = Math.round(680 * speed);
  let globalIdx = 0;

  return (
    <span
      data-ktxt="17"
      aria-label={text}
      className={`inline-flex flex-wrap items-baseline gap-x-[0.28em] font-display font-bold tracking-tight text-[#121211] ${className}`}
    >
      <style>{`
        @keyframes ktxt17-drop {
          0% {
            opacity: 0;
            transform: translateY(-34px) scaleY(1.22);
          }
          58% {
            opacity: 1;
            transform: translateY(3px) scaleY(0.86) scaleX(1.06);
          }
          80% {
            transform: translateY(-2px) scaleY(1.04) scaleX(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scaleY(1) scaleX(1);
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
                className="inline-block origin-bottom will-change-transform"
                style={{
                  animationName: 'ktxt17-drop',
                  animationDuration: `${durationMs}ms`,
                  animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                  animationFillMode: 'both',
                  animationDelay: `${Math.round(idx * 32 * speed)}ms`,
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
