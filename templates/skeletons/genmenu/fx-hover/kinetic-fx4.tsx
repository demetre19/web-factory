import {useEffect, useState} from 'react';
import {Pause, Play, SkipForward} from 'lucide-react';

export interface Fx4Props {
  replayTrigger?: number;
}

const PHRASES = [
  'Tactile motion builds user trust.',
  'Compositor layers stay at 60 fps.',
  'Subtle easing guides natural focus.',
];

export function Fx4({replayTrigger = 0}: Fx4Props) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (replayTrigger > 0) {
      setPhraseIndex(0);
      setCharCount(0);
      setIsDeleting(false);
      setIsPaused(false);
    }
  }, [replayTrigger]);

  useEffect(() => {
    if (isPaused) return;
    const currentPhrase = PHRASES[phraseIndex];

    let delay = isDeleting ? 28 : 52;
    if (!isDeleting && charCount === currentPhrase.length) {
      delay = 1400;
    } else if (isDeleting && charCount === 0) {
      delay = 280;
    }

    const timer = window.setTimeout(() => {
      if (!isDeleting) {
        if (charCount < currentPhrase.length) {
          setCharCount((c) => c + 1);
        } else {
          setIsDeleting(true);
        }
      } else {
        if (charCount > 0) {
          setCharCount((c) => c - 1);
        } else {
          setIsDeleting(false);
          setPhraseIndex((idx) => (idx + 1) % PHRASES.length);
        }
      }
    }, delay);

    return () => window.clearTimeout(timer);
  }, [charCount, isDeleting, isPaused, phraseIndex]);

  const currentText = PHRASES[phraseIndex].slice(0, charCount);

  return (
    <div className="flex flex-col justify-between gap-5 w-full">
      <div className="min-h-[68px] flex items-center px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-lg">
        <p
          data-testid="fx4-output"
          className="font-mono text-sm sm:text-base text-zinc-900 leading-relaxed"
        >
          <span>{currentText}</span>
          <span
            aria-hidden="true"
            className="inline-block w-[2px] h-[1.1em] ml-0.5 align-middle bg-[#2563EB] fx-caret"
          />
        </p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-zinc-500 font-mono tabular-nums">
          Phrase {phraseIndex + 1} / {PHRASES.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isPaused ? (
              <>
                <Play className="w-3.5 h-3.5" />
                Resume
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5" />
                Pause
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsDeleting(false);
              setCharCount(0);
              setPhraseIndex((idx) => (idx + 1) % PHRASES.length);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <SkipForward className="w-3.5 h-3.5" />
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
