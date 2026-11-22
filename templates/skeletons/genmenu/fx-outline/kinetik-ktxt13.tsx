import React, { useState } from 'react';

export interface KtxtProps {
  text?: string;
  className?: string;
  speed?: number;
}

export function Ktxt13({
  text = 'Phase alignment error',
  className = '',
  speed = 1,
}: KtxtProps) {
  const [burstKey, setBurstKey] = useState(0);
  const words = text.split(' ');
  const durationMs = Math.round(620 * speed);
  let globalIdx = 0;

  return (
    <span
      data-ktxt="13"
      aria-label={text}
      onMouseEnter={() => setBurstKey((k) => k + 1)}
      className={`relative inline-flex flex-wrap items-baseline gap-x-[0.28em] font-display font-extrabold tracking-tight text-[#121211] cursor-pointer ${className}`}
    >
      <style>{`
        @keyframes ktxt13-base {
          0% {
            opacity: 0;
            transform: translateX(-4px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes ktxt13-slice-a {
          0% {
            opacity: 0.9;
            clip-path: inset(15% 0 55% 0);
            transform: translate(-5px, -2px);
          }
          45% {
            opacity: 0.85;
            clip-path: inset(50% 0 10% 0);
            transform: translate(5px, 2px);
          }
          80% {
            opacity: 0.4;
            clip-path: inset(25% 0 40% 0);
            transform: translate(-2px, 0);
          }
          100% {
            opacity: 0;
            clip-path: inset(0 0 0 0);
            transform: translate(0, 0);
          }
        }
        @keyframes ktxt13-slice-b {
          0% {
            opacity: 0.9;
            clip-path: inset(60% 0 5% 0);
            transform: translate(6px, 2px);
          }
          45% {
            opacity: 0.85;
            clip-path: inset(10% 0 65% 0);
            transform: translate(-5px, -1px);
          }
          80% {
            opacity: 0.4;
            clip-path: inset(40% 0 25% 0);
            transform: translate(2px, 0);
          }
          100% {
            opacity: 0;
            clip-path: inset(0 0 0 0);
            transform: translate(0, 0);
          }
        }
      `}</style>
      {words.map((word, wIdx) => (
        <span key={`${wIdx}-${word}`} aria-hidden="true" className="inline-flex whitespace-nowrap">
          {Array.from(word).map((char, cIdx) => {
            const idx = globalIdx;
            globalIdx += 1;
            const delay = `${Math.round(idx * 25 * speed)}ms`;
            return (
              <span key={`${wIdx}-${cIdx}-${burstKey}`} className="relative inline-block">
                <span
                  className="relative z-10 inline-block text-[#121211]"
                  style={{
                    animationName: 'ktxt13-base',
                    animationDuration: `${durationMs}ms`,
                    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    animationFillMode: 'both',
                    animationDelay: delay,
                  }}
                >
                  {char}
                </span>
                <span
                  className="pointer-events-none absolute inset-0 z-20 inline-block text-[#D9381E]"
                  style={{
                    animationName: 'ktxt13-slice-a',
                    animationDuration: `${durationMs}ms`,
                    animationTimingFunction: 'steps(4, end)',
                    animationFillMode: 'both',
                    animationDelay: delay,
                  }}
                >
                  {char}
                </span>
                <span
                  className="pointer-events-none absolute inset-0 z-20 inline-block text-[#2563EB]"
                  style={{
                    animationName: 'ktxt13-slice-b',
                    animationDuration: `${durationMs}ms`,
                    animationTimingFunction: 'steps(4, end)',
                    animationFillMode: 'both',
                    animationDelay: delay,
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
