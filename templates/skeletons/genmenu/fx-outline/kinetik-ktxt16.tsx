import React from 'react';

export interface KtxtProps {
  text?: string;
  className?: string;
  speed?: number;
}

const ROTATING_WORDS = ['velocity', 'precision', 'rhythm'];

export function Ktxt16({
  text = 'Built for clarity',
  className = '',
  speed = 1,
}: KtxtProps) {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  const anchorWord = parts.length > 0 ? parts[parts.length - 1] : 'clarity';
  const prefixWords = parts.length > 1 ? parts.slice(0, -1) : ['Built', 'for'];
  const slotWords = [
    anchorWord,
    ...ROTATING_WORDS.filter((w) => w.toLowerCase() !== anchorWord.toLowerCase()).slice(0, 3),
  ];
  const loopList = [...slotWords, slotWords[0]];
  const cycleMs = Math.round(6400 * speed);
  const enterMs = Math.round(450 * speed);
  let globalIdx = 0;

  return (
    <span
      data-ktxt="16"
      aria-label={`${prefixWords.join(' ')} ${anchorWord}`}
      className={`inline-flex flex-wrap items-baseline gap-x-[0.28em] font-display font-bold tracking-tight text-[#121211] ${className}`}
    >
      <style>{`
        @keyframes ktxt16-prefix {
          0% {
            opacity: 0;
            transform: translateY(8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes ktxt16-reel {
          0%, 16% {
            transform: translateY(0%);
          }
          24%, 40% {
            transform: translateY(-20%);
          }
          48%, 64% {
            transform: translateY(-40%);
          }
          72%, 88% {
            transform: translateY(-60%);
          }
          96%, 100% {
            transform: translateY(-80%);
          }
        }
      `}</style>
      {prefixWords.map((word, wIdx) => (
        <span key={`${wIdx}-${word}`} aria-hidden="true" className="inline-flex whitespace-nowrap">
          {Array.from(word).map((char, cIdx) => {
            const idx = globalIdx;
            globalIdx += 1;
            return (
              <span
                key={`${wIdx}-${cIdx}-${char}`}
                className="inline-block"
                style={{
                  animationName: 'ktxt16-prefix',
                  animationDuration: `${enterMs}ms`,
                  animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                  animationFillMode: 'both',
                  animationDelay: `${Math.round(idx * 22 * speed)}ms`,
                }}
              >
                {char}
              </span>
            );
          })}
        </span>
      ))}
      <span
        aria-hidden="true"
        className="relative inline-block h-[1.22em] overflow-hidden align-bottom text-[#D9381E]"
      >
        <span
          className="flex flex-col leading-[1.22em] will-change-transform"
          style={{
            animationName: 'ktxt16-reel',
            animationDuration: `${cycleMs}ms`,
            animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            animationIterationCount: 'infinite',
          }}
        >
          {loopList.map((word, idx) => (
            <span key={`${idx}-${word}`} className="block h-[1.22em] whitespace-nowrap">
              {word}
            </span>
          ))}
        </span>
      </span>
    </span>
  );
}
