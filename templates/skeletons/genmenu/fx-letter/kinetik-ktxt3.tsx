import React, { useEffect, useState } from 'react';

export interface KtxtProps {
  text?: string;
  className?: string;
  speed?: number;
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#$%&*+';

export function Ktxt3({
  text = 'Signal locked cleanly',
  className = '',
  speed = 1,
}: KtxtProps) {
  const [tick, setTick] = useState(0);
  const [burstCount, setBurstCount] = useState(0);
  const chars = Array.from(text);
  const maxTick = chars.length * 2 + 2;

  useEffect(() => {
    setTick(0);
    const intervalMs = Math.max(18, Math.round(42 * speed));
    const timer = window.setInterval(() => {
      setTick((prev) => {
        if (prev >= maxTick) {
          window.clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [text, speed, burstCount, maxTick]);

  const words = text.split(' ');
  let globalIdx = 0;

  return (
    <span
      data-ktxt="3"
      aria-label={text}
      onMouseEnter={() => setBurstCount((c) => c + 1)}
      className={`inline-flex flex-wrap items-baseline gap-x-[0.28em] font-display font-bold tracking-tight text-[#121211] cursor-default ${className}`}
    >
      <style>{`
        @keyframes ktxt3-char-in {
          0% {
            opacity: 0.25;
            transform: translateY(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      {words.map((word, wIdx) => (
        <span key={`${wIdx}-${word}`} aria-hidden="true" className="inline-flex whitespace-nowrap">
          {Array.from(word).map((targetChar, cIdx) => {
            const idx = globalIdx;
            globalIdx += 1;
            const settled = tick >= (idx + 1) * 2;
            const displayChar = settled
              ? targetChar
              : GLYPHS[(idx * 7 + tick * 5) % GLYPHS.length];
            return (
              <span
                key={`${wIdx}-${cIdx}`}
                className={`inline-block transition-colors duration-150 ${
                  settled ? 'text-[#121211]' : 'font-mono text-[#D9381E]'
                }`}
                style={{
                  animationName: 'ktxt3-char-in',
                  animationDuration: `${Math.round(320 * speed)}ms`,
                  animationTimingFunction: 'ease-out',
                  animationFillMode: 'both',
                  animationDelay: `${Math.round(idx * 24 * speed)}ms`,
                }}
              >
                {displayChar}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
