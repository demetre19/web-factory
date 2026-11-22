import React from 'react';

export interface KtxtProps {
  text?: string;
  className?: string;
  speed?: number;
}

export function Ktxt15({
  text = 'Scale creates hierarchy',
  className = '',
  speed = 1,
}: KtxtProps) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const durationMs = Math.round(680 * speed);

  return (
    <span
      data-ktxt="15"
      aria-label={text}
      className={`inline-flex flex-wrap items-baseline gap-x-[0.32em] font-display font-bold tracking-tight text-[#121211] ${className}`}
    >
      <style>{`
        @keyframes ktxt15-morph {
          0% {
            opacity: 0;
            transform: scale(0.72);
          }
          55% {
            opacity: 1;
            transform: scale(1.14);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
      {words.map((word, idx) => (
        <span
          key={`${idx}-${word}`}
          aria-hidden="true"
          className="inline-block origin-bottom cursor-pointer transition-transform duration-200 ease-out hover:scale-[1.14] hover:text-[#D9381E] will-change-transform"
          style={{
            animationName: 'ktxt15-morph',
            animationDuration: `${durationMs}ms`,
            animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            animationFillMode: 'both',
            animationDelay: `${Math.round(idx * 110 * speed)}ms`,
          }}
        >
          {word}
        </span>
      ))}
    </span>
  );
}
