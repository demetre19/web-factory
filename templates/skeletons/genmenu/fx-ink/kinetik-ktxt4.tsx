import React from 'react';

export interface KtxtProps {
  text?: string;
  className?: string;
  speed?: number;
}

export function Ktxt4({
  text = 'Chromatic light sweep',
  className = '',
  speed = 1,
}: KtxtProps) {
  const sweepDuration = Math.round(4500 * speed);
  const enterDuration = Math.round(620 * speed);

  return (
    <span
      data-ktxt="4"
      aria-label={text}
      className={`inline-block font-display font-extrabold tracking-tight ${className}`}
    >
      <style>{`
        @keyframes ktxt4-sweep {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes ktxt4-enter {
          0% {
            opacity: 0;
            clip-path: inset(0 100% 0 0);
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            clip-path: inset(0 0% 0 0);
            transform: translateY(0);
          }
        }
      `}</style>
      <span
        aria-hidden="true"
        className="inline-block bg-clip-text text-transparent will-change-[background-position,transform,opacity]"
        style={{
          backgroundImage:
            'linear-gradient(110deg, #121211 0%, #121211 30%, #D9381E 45%, #2563EB 55%, #121211 70%, #121211 100%)',
          backgroundSize: '250% 100%',
          animationName: 'ktxt4-enter, ktxt4-sweep',
          animationDuration: `${enterDuration}ms, ${sweepDuration}ms`,
          animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1), ease-in-out',
          animationIterationCount: '1, infinite',
          animationFillMode: 'both, none',
        }}
      >
        {text}
      </span>
    </span>
  );
}
