import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Star } from 'lucide-react';
import { isValidEmail } from '../../utils/validation';

const RATING_LABELS: Record<number, string> = {
  1: 'Needs major work',
  2: 'Below expectations',
  3: 'Solid overall',
  4: 'Very polished',
  5: 'Exceptional',
};

export function Form18() {
  const [rating, setRating] = useState<number>(0);
  const [aspect, setAspect] = useState('Onboarding Flow');
  const [liked, setLiked] = useState('');
  const [improve, setImprove] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ rating?: string; improve?: string; email?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (rating === 0) next.rating = 'Select a star rating from 1 to 5.';
    if (rating > 0 && rating <= 3 && improve.trim().length < 10) {
      next.improve = 'For ratings of 3 or below, please share at least 10 characters on what to improve.';
    }
    if (email.trim() !== '' && !isValidEmail(email)) {
      next.email = 'Enter a valid email or leave blank.';
    }
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg bg-stone-50 border border-stone-200 rounded-xl p-6 space-y-3">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-stone-900">Feedback Recorded</h3>
            <p className="text-sm text-stone-600">
              Rated <span className="font-mono tabular-nums font-medium text-stone-900">{rating}/5</span> ({RATING_LABELS[rating]}) on{' '}
              <span className="font-medium text-stone-900">{aspect}</span>.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setRating(0);
            setLiked('');
            setImprove('');
            setEmail('');
            setErrors({});
            setSubmitted(false);
          }}
          className="px-4 py-2 text-xs font-medium text-stone-800 bg-stone-200 hover:bg-stone-300 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-900"
        >
          Submit Another Review
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-lg bg-stone-50 border border-stone-200 rounded-xl p-6 sm:p-7 space-y-5"
    >
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-stone-900">Product Experience Feedback</h3>
        <p className="text-xs text-stone-600">Warm single-column rating form with conditional improvement details.</p>
      </div>

      <fieldset className="space-y-2">
        <div className="flex items-center justify-between">
          <legend className="text-sm font-medium text-stone-800">Overall Rating</legend>
          {rating > 0 && <span className="text-xs text-stone-600">{RATING_LABELS[rating]}</span>}
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => {
            const active = value <= rating;
            return (
              <label
                key={value}
                htmlFor={`form18-star-${value}`}
                className={`flex items-center justify-center w-11 h-11 rounded-lg border cursor-pointer transition-colors ${
                  active
                    ? 'bg-amber-900 border-amber-900 text-amber-100'
                    : 'bg-white border-stone-300 text-stone-400 hover:border-stone-400 hover:text-stone-600'
                }`}
              >
                <input
                  id={`form18-star-${value}`}
                  type="radio"
                  name="form18-rating"
                  value={value}
                  checked={rating === value}
                  onChange={() => {
                    setRating(value);
                    if (errors.rating) setErrors((prev) => ({ ...prev, rating: undefined }));
                  }}
                  className="sr-only"
                />
                <Star className={`w-5 h-5 ${active ? 'fill-current' : ''}`} aria-hidden="true" />
                <span className="sr-only">{value} out of 5 stars</span>
              </label>
            );
          })}
        </div>
        {errors.rating && (
          <p role="alert" className="text-xs text-red-700 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {errors.rating}
          </p>
        )}
      </fieldset>

      <div className="space-y-1.5">
        <label htmlFor="form18-aspect" className="block text-sm font-medium text-stone-800">
          Primary Area Rated
        </label>
        <select
          id="form18-aspect"
          value={aspect}
          onChange={(e) => setAspect(e.target.value)}
          className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-800 focus:ring-2 focus:ring-amber-100"
        >
          <option value="Onboarding Flow">Onboarding Flow</option>
          <option value="Editor Performance">Editor Performance</option>
          <option value="Documentation">Documentation</option>
          <option value="Customer Support">Customer Support</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="form18-liked" className="block text-sm font-medium text-stone-800">
          What worked well?
        </label>
        <textarea
          id="form18-liked"
          rows={2}
          value={liked}
          onChange={(e) => setLiked(e.target.value)}
          placeholder="Keyboard shortcuts, clarity of exports..."
          className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-800 focus:ring-2 focus:ring-amber-100"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="form18-improve" className="block text-sm font-medium text-stone-800">
          What should we improve? {rating > 0 && rating <= 3 ? '(Required for 1–3 stars)' : '(Optional)'}
        </label>
        <textarea
          id="form18-improve"
          rows={2}
          value={improve}
          onChange={(e) => {
            setImprove(e.target.value);
            if (errors.improve) setErrors((prev) => ({ ...prev, improve: undefined }));
          }}
          placeholder="Tell us where friction slowed you down..."
          aria-invalid={Boolean(errors.improve)}
          aria-describedby={errors.improve ? 'form18-improve-err' : undefined}
          className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 ${
            errors.improve ? 'border-red-600 focus:ring-red-200' : 'border-stone-300 focus:border-amber-800 focus:ring-amber-100'
          }`}
        />
        {errors.improve && (
          <p id="form18-improve-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {errors.improve}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="form18-email" className="block text-sm font-medium text-stone-800">
          Follow-up Email (Optional)
        </label>
        <input
          id="form18-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          placeholder="you@domain.com"
          aria-invalid={Boolean(errors.email)}
          className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 ${
            errors.email ? 'border-red-600 focus:ring-red-200' : 'border-stone-300 focus:border-amber-800 focus:ring-amber-100'
          }`}
        />
        {errors.email && (
          <p role="alert" className="text-xs text-red-700 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {errors.email}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full py-2.5 px-4 text-sm font-medium text-stone-50 bg-amber-900 hover:bg-amber-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-900"
      >
        Send Feedback
      </button>
    </form>
  );
}
