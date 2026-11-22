import React, { useState } from 'react';

export interface KtxtProps {
  text?: string;
  className?: string;
  speed?: number;
}

export function Ktxt11({
  text = 'Breathing space',
  className = '',
  speed = 1,
}: KtxtProps) {
  const [hovered, setHovered] = useState(false);
  const words = text.split(' ');
  const durationMs = Math.round(480 * speed);
  let globalIdx = 0;

  return (
    <span
      data-ktxt="11"
      aria-label={text}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`inline-flex flex-wrap items-baseline gap-x-[0.28em] font-display font-bold text-[#121211] cursor-pointer transition-[letter-spacing,color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        hovered ? 'tracking-[0.16em] text-[#D9381E]' : 'tracking-tight text-[#121211]'
      } ${className}`}
    >
      <style>{`
        @keyframes ktxt11-in {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
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
                className="inline-block"
                style={{
                  animationName: 'ktxt11-in',
                  animationDuration: `${durationMs}ms`,
                  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  animationFillMode: 'both',
                  animationDelay: `${Math.round(idx * 30 * speed)}ms`,
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
