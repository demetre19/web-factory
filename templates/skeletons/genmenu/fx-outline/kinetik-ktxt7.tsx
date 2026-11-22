import React, { useState } from 'react';

export interface KtxtProps {
  text?: string;
  className?: string;
  speed?: number;
}

export function Ktxt7({
  text = 'Kinetic tension',
  className = '',
  speed = 1,
}: KtxtProps) {
  const [hovered, setHovered] = useState(false);
  const totalChars = Array.from(text.replace(/\s+/g, '')).length;
  const center = (totalChars - 1) / 2;
  const words = text.split(' ');
  const durationMs = Math.round(480 * speed);
  let globalIdx = 0;

  return (
    <span
      data-ktxt="7"
      aria-label={text}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`inline-flex flex-wrap items-baseline gap-x-[0.28em] font-display font-bold tracking-tight text-[#121211] cursor-pointer px-4 ${className}`}
    >
      <style>{`
        @keyframes ktxt7-settle {
          0% {
            opacity: 0;
            transform: translateY(10px);
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
            const spread = ((idx - center) * 4.5).toFixed(1);
            return (
              <span
                key={`${wIdx}-${cIdx}-${char}`}
                className="inline-block"
                style={{
                  animationName: 'ktxt7-settle',
                  animationDuration: `${durationMs}ms`,
                  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  animationFillMode: 'both',
                  animationDelay: `${Math.round(idx * 24 * speed)}ms`,
                }}
              >
                <span
                  className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform"
                  style={{
                    transform: hovered ? `translateX(${spread}px)` : 'translateX(0px)',
                    transitionDelay: `${Math.round(Math.abs(idx - center) * 14)}ms`,
                  }}
                >
                  {char}
                </span>
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
