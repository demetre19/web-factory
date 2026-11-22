import React from 'react';

export interface KtxtProps {
  text?: string;
  className?: string;
  speed?: number;
}

export function Ktxt6({
  text = 'Swiss Grid · Kinetic Rhythm · Press Proof',
  className = '',
  speed = 1,
}: KtxtProps) {
  const durationMs = Math.round(16000 * speed);
  const items = [text, text, text, text];

  return (
    <div
      data-ktxt="6"
      aria-label={text}
      className={`group relative w-full overflow-hidden border-y border-[#E5E3DD] py-3 font-display font-bold tracking-tight text-[#121211] ${className}`}
    >
      <style>{`
        @keyframes ktxt6-marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes ktxt6-fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
      <div
        aria-hidden="true"
        className="flex w-max items-center will-change-transform group-hover:[animation-play-state:paused]"
        style={{
          animationName: 'ktxt6-fade-in, ktxt6-marquee',
          animationDuration: `${Math.round(450 * speed)}ms, ${durationMs}ms`,
          animationTimingFunction: 'ease-out, linear',
          animationIterationCount: '1, infinite',
          animationFillMode: 'forwards, none',
          animationDelay: '0ms, 0ms',
        }}
      >
        {items.map((phrase, idx) => (
          <span key={idx} className="inline-flex shrink-0 items-center whitespace-nowrap pr-8">
            <span>{phrase}</span>
            <span className="ml-8 text-[#D9381E]" aria-hidden="true">
              /
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
