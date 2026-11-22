import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { computeStarCascadeDelay } from '../../utils/statesCatalog';

interface StateProps {
  replaySignal?: number;
}

const LABELS = ['Poor', 'Fair', 'Good', 'Great', 'Excellent'];

export function State18({ replaySignal = 0 }: StateProps) {
  const [rating, setRating] = useState(5);
  const [cascadeKey, setCascadeKey] = useState(0);
  const [hasCascaded, setHasCascaded] = useState(false);

  useEffect(() => {
    if (replaySignal > 0) {
      setRating(5);
      setHasCascaded(true);
      setCascadeKey((k) => k + 1);
    }
  }, [replaySignal]);

  const selectStar = (value: number) => {
    setRating(value);
    setHasCascaded(true);
    setCascadeKey((k) => k + 1);
  };

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div
        key={cascadeKey}
        role="group"
        aria-label="Star rating"
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200"
      >
        {[1, 2, 3, 4, 5].map((starValue, idx) => {
          const filled = starValue <= rating;
          return (
            <button
              key={starValue}
              type="button"
              onClick={() => selectStar(starValue)}
              aria-label={`Rate ${starValue} out of 5 stars`}
              aria-pressed={rating === starValue}
              style={{
                animationDelay:
                  hasCascaded && filled
                    ? `${computeStarCascadeDelay(idx, 55)}ms`
                    : undefined,
              }}
              className={`p-1 rounded-md hover:scale-110 transition-transform focus-visible:outline-2 focus-visible:outline-blue-600 cursor-pointer ${
                hasCascaded && filled ? 'animate-star-pop' : ''
              }`}
            >
              <Star
                className={`w-6 h-6 transition-colors ${
                  filled
                    ? 'fill-amber-400 text-amber-500'
                    : 'fill-slate-100 text-slate-300'
                }`}
                strokeWidth={1.75}
              />
            </button>
          );
        })}
      </div>

      <p className="text-xs font-mono tabular-nums text-slate-600">
        {rating}.0 / 5.0 · <span className="font-sans font-medium text-slate-800">{LABELS[rating - 1]}</span>
      </p>
    </div>
  );
}
