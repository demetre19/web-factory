import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { isValidEmail } from '../../utils/validation';

const TOPICS = ['Systems Architecture', 'Design Engineering', 'TypeScript Patterns', 'Web Performance'] as const;

export function Form6() {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Systems Architecture']);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<{ firstName?: string; email?: string; topics?: string; agree?: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) => (prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]));
    if (errors.topics) setErrors((prev) => ({ ...prev, topics: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!firstName.trim()) next.firstName = 'First name is required.';
    if (!isValidEmail(email)) next.email = 'Enter a valid email address.';
    if (selectedTopics.length === 0) next.topics = 'Select at least one digest topic.';
    if (!agree) next.agree = 'Confirm you want to receive weekly digest emails.';
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md bg-zinc-950 border border-zinc-800 rounded-xl p-6 text-zinc-100 space-y-4 tracking-[0.01em]">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1.5">
            <h3 className="text-base font-semibold text-white">Digest subscription active</h3>
            <p className="text-sm text-zinc-400">
              {firstName}, your next edition covering <span className="text-zinc-200">{selectedTopics.join(', ')}</span>{' '}
              will arrive at <span className="text-zinc-200">{email}</span>.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setFirstName('');
            setEmail('');
            setSelectedTopics(['Systems Architecture']);
            setAgree(false);
            setErrors({});
            setSubmitted(false);
          }}
          className="px-4 py-2 text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          Manage Preferences
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-md bg-zinc-950 border border-zinc-800 rounded-xl p-6 sm:p-7 text-zinc-100 space-y-5 tracking-[0.01em]"
    >
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-white">Nightly Engineering Digest</h3>
        <p className="text-sm text-zinc-400">Dark single-column signup with topic checkboxes.</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="form6-name" className="block text-sm font-medium text-zinc-200">
          First Name
        </label>
        <input
          id="form6-name"
          type="text"
          value={firstName}
          onChange={(e) => {
            setFirstName(e.target.value);
            if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: undefined }));
          }}
          placeholder="Devon"
          aria-invalid={Boolean(errors.firstName)}
          aria-describedby={errors.firstName ? 'form6-name-err' : undefined}
          className={`w-full px-3.5 py-2.5 text-sm bg-zinc-900 border rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 ${
            errors.firstName ? 'border-red-500 focus:ring-red-500/30' : 'border-zinc-700 focus:border-sky-400 focus:ring-sky-400/25'
          }`}
        />
        {errors.firstName && (
          <p id="form6-name-err" role="alert" className="text-xs text-red-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {errors.firstName}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="form6-email" className="block text-sm font-medium text-zinc-200">
          Email Address
        </label>
        <input
          id="form6-email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          placeholder="devon@systems.org"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'form6-email-err' : undefined}
          className={`w-full px-3.5 py-2.5 text-sm bg-zinc-900 border rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 ${
            errors.email ? 'border-red-500 focus:ring-red-500/30' : 'border-zinc-700 focus:border-sky-400 focus:ring-sky-400/25'
          }`}
        />
        {errors.email && (
          <p id="form6-email-err" role="alert" className="text-xs text-red-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {errors.email}
          </p>
        )}
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-zinc-200">Topic Interests</legend>
        <div className="grid grid-cols-1 gap-2">
          {TOPICS.map((topic) => {
            const id = `form6-topic-${topic.toLowerCase().replace(/\s+/g, '-')}`;
            const checked = selectedTopics.includes(topic);
            return (
              <label
                key={topic}
                htmlFor={id}
                className={`flex items-center gap-3 px-3 py-2 border rounded-lg cursor-pointer transition-colors ${
                  checked ? 'bg-zinc-900 border-sky-500/70 text-white' : 'bg-zinc-900/40 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <input
                  id={id}
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleTopic(topic)}
                  className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-sky-500 focus:ring-sky-400"
                />
                <span className="text-sm">{topic}</span>
              </label>
            );
          })}
        </div>
        {errors.topics && (
          <p role="alert" className="text-xs text-red-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {errors.topics}
          </p>
        )}
      </fieldset>

      <div className="space-y-1.5">
        <div className="flex items-start gap-2.5">
          <input
            id="form6-agree"
            type="checkbox"
            checked={agree}
            onChange={(e) => {
              setAgree(e.target.checked);
              if (errors.agree) setErrors((prev) => ({ ...prev, agree: undefined }));
            }}
            aria-invalid={Boolean(errors.agree)}
            className="mt-1 h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-sky-500 focus:ring-sky-400"
          />
          <label htmlFor="form6-agree" className="text-xs text-zinc-400 leading-relaxed">
            Send me curated engineering notes once per week. One-click unsubscribe anytime.
          </label>
        </div>
        {errors.agree && (
          <p role="alert" className="text-xs text-red-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {errors.agree}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full py-2.5 px-4 text-sm font-semibold text-zinc-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 focus-visible:ring-sky-400"
      >
        Join Digest
      </button>
    </form>
  );
}
