import React from 'react';

export interface KtxtProps {
  text?: string;
  className?: string;
  speed?: number;
}

export function Ktxt5({
  text = 'Hollow to solid ink',
  className = '',
  speed = 1,
}: KtxtProps) {
  const words = text.split(' ');
  const durationMs = Math.round(480 * speed);
  let globalIdx = 0;

  return (
    <span
      data-ktxt="5"
      aria-label={text}
      className={`group inline-flex flex-wrap items-baseline gap-x-[0.28em] font-display font-extrabold tracking-tight cursor-pointer select-none ${className}`}
    >
      <style>{`
        @keyframes ktxt5-stroke-in {
          0% {
            opacity: 0;
            transform: translateY(12px);
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
                className="relative inline-block"
                style={{
                  animationName: 'ktxt5-stroke-in',
                  animationDuration: `${durationMs}ms`,
                  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  animationFillMode: 'both',
                  animationDelay: `${Math.round(idx * 28 * speed)}ms`,
                }}
              >
                <span
                  className="inline-block text-transparent"
                  style={{
                    WebkitTextStroke: '1.5px #121211',
                  }}
                >
                  {char}
                </span>
                <span
                  className="pointer-events-none absolute inset-0 inline-block text-[#D9381E] transition-[clip-path] duration-300 ease-out [clip-path:inset(100%_0_0_0)] group-hover:[clip-path:inset(0_0_0_0)]"
                  style={{
                    transitionDelay: `${Math.round(idx * 18)}ms`,
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
