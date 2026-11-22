import React from 'react';

export interface KtxtProps {
  text?: string;
  className?: string;
  speed?: number;
}

export function Ktxt19({
  text = 'Momentum into stillness',
  className = '',
  speed = 1,
}: KtxtProps) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const durationMs = Math.round(580 * speed);

  return (
    <span
      data-ktxt="19"
      aria-label={text}
      className={`inline-flex flex-wrap items-baseline gap-x-[0.28em] font-display font-bold tracking-tight text-[#121211] ${className}`}
    >
      <style>{`
        @keyframes ktxt19-shear {
          0% {
            opacity: 0;
            transform: translateX(-28px) skewX(18deg);
          }
          100% {
            opacity: 1;
            transform: translateX(0) skewX(0deg);
          }
        }
      `}</style>
      {words.map((word, idx) => (
        <span
          key={`${idx}-${word}`}
          aria-hidden="true"
          className="inline-block will-change-transform"
          style={{
            animationName: 'ktxt19-shear',
            animationDuration: `${durationMs}ms`,
            animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            animationFillMode: 'both',
            animationDelay: `${Math.round(idx * 85 * speed)}ms`,
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
