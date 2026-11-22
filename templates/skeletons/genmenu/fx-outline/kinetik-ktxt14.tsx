import React from 'react';

export interface KtxtProps {
  text?: string;
  className?: string;
  speed?: number;
}

export function Ktxt14({
  text = 'First line arrives\nSecond line follows\nThird locks the grid',
  className = '',
  speed = 1,
}: KtxtProps) {
  const lines = text.includes('\n')
    ? text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
    : (() => {
        const words = text.trim().split(/\s+/).filter(Boolean);
        if (words.length <= 2) return [words.join(' ')];
        const out: string[] = [];
        for (let i = 0; i < words.length; i += 3) {
          out.push(words.slice(i, i + 3).join(' '));
        }
        return out;
      })();

  const durationMs = Math.round(620 * speed);

  return (
    <span
      data-ktxt="14"
      aria-label={text.replace(/\n/g, ' ')}
      className={`inline-flex flex-col items-start gap-1 font-display font-bold tracking-tight text-[#121211] leading-[1.12] ${className}`}
    >
      <style>{`
        @keyframes ktxt14-roll {
          0% {
            opacity: 0;
            transform: translateY(115%);
          }
          100% {
            opacity: 1;
            transform: translateY(0%);
          }
        }
      `}</style>
      {lines.map((line, lIdx) => (
        <span key={`${lIdx}-${line}`} aria-hidden="true" className="block overflow-hidden py-[0.04em]">
          <span
            className="inline-block will-change-transform"
            style={{
              animationName: 'ktxt14-roll',
              animationDuration: `${durationMs}ms`,
              animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
              animationFillMode: 'both',
              animationDelay: `${Math.round(lIdx * 130 * speed)}ms`,
            }}
          >
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}
