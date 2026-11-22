import React from 'react';

export interface KtxtProps {
  text?: string;
  className?: string;
  speed?: number;
}

export function Ktxt18({
  text = 'Precision ink annotation',
  className = '',
  speed = 1,
}: KtxtProps) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const totalChars = words.join('').length;
  const durationMs = Math.round(460 * speed);
  const ruleDelayMs = Math.round((totalChars * 26 + 180) * speed);
  let globalIdx = 0;

  return (
    <span
      data-ktxt="18"
      aria-label={text}
      className={`inline-flex flex-wrap items-baseline gap-x-[0.28em] font-display font-bold tracking-tight text-[#121211] ${className}`}
    >
      <style>{`
        @keyframes ktxt18-char {
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes ktxt18-rule {
          0% {
            transform: scaleX(0);
          }
          100% {
            transform: scaleX(1);
          }
        }
      `}</style>
      {words.map((word, wIdx) => {
        const isFinalWord = wIdx === words.length - 1;
        return (
          <span
            key={`${wIdx}-${word}`}
            aria-hidden="true"
            className="relative inline-flex whitespace-nowrap"
          >
            {Array.from(word).map((char, cIdx) => {
              const idx = globalIdx;
              globalIdx += 1;
              return (
                <span
                  key={`${wIdx}-${cIdx}-${char}`}
                  className="inline-block"
                  style={{
                    animationName: 'ktxt18-char',
                    animationDuration: `${durationMs}ms`,
                    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                    animationFillMode: 'both',
                    animationDelay: `${Math.round(idx * 26 * speed)}ms`,
                  }}
                >
                  {char}
                </span>
              );
            })}
            {isFinalWord && (
              <span
                className="pointer-events-none absolute -bottom-1 left-0 right-0 h-[3px] origin-left bg-[#D9381E]"
                style={{
                  animationName: 'ktxt18-rule',
                  animationDuration: `${Math.round(480 * speed)}ms`,
                  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  animationFillMode: 'both',
                  animationDelay: `${ruleDelayMs}ms`,
                }}
              />
            )}
          </span>
        );
      })}
    </span>
  );
}
