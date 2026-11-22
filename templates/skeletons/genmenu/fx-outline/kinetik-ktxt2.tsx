import React from 'react';

export interface KtxtProps {
  text?: string;
  className?: string;
  speed?: number;
}

export function Ktxt2({
  text = 'Measured rhythm shapes every sentence',
  className = '',
  speed = 1,
}: KtxtProps) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const durationMs = Math.round(560 * speed);

  return (
    <span
      data-ktxt="2"
      aria-label={text}
      className={`inline-flex flex-wrap items-baseline gap-x-[0.28em] font-display font-bold tracking-tight text-[#121211] ${className}`}
    >
      <style>{`
        @keyframes ktxt2-word-fade {
          0% {
            opacity: 0;
            transform: translateY(14px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      {words.map((word, idx) => (
        <span
          key={`${idx}-${word}`}
          aria-hidden="true"
          className="inline-block will-change-transform"
          style={{
            animationName: 'ktxt2-word-fade',
            animationDuration: `${durationMs}ms`,
            animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            animationFillMode: 'both',
            animationDelay: `${Math.round(idx * 95 * speed)}ms`,
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
