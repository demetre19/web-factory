import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';
import { isValidEmail } from '../../utils/validation';

interface Form1Errors {
  name?: string;
  email?: string;
  topic?: string;
  message?: string;
  consent?: string;
}

export function Form1() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Form1Errors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (fields = { name, email, topic, message, consent }): Form1Errors => {
    const next: Form1Errors = {};
    if (fields.name.trim().length < 2) {
      next.name = 'Please enter your full name (at least 2 characters).';
    }
    if (!isValidEmail(fields.email)) {
      next.email = 'Enter a valid work email address (e.g. name@company.com).';
    }
    if (!fields.topic) {
      next.topic = 'Select a subject so we can route your inquiry.';
    }
    if (fields.message.trim().length < 20) {
      next.message = `Message must be at least 20 characters (${fields.message.trim().length}/20).`;
    }
    if (!fields.consent) {
      next.consent = 'Please confirm permission to reply via email.';
    }
    return next;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = { name: true, email: true, topic: true, message: true, consent: true };
    setTouched(allTouched);
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setTopic('');
    setMessage('');
    setConsent(false);
    setErrors({});
    setTouched({});
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="max-w-lg bg-white border border-neutral-200 rounded-xl p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-neutral-900">Inquiry received</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Thank you, <span className="font-medium text-neutral-900">{name}</span>. We logged your{' '}
              <span className="font-medium text-neutral-900">{topic}</span> request and will reply to{' '}
              <span className="font-medium text-neutral-900">{email}</span> within one business day.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                Send another message
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-lg bg-white border border-neutral-200 rounded-xl p-6 sm:p-8 space-y-5"
    >
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-neutral-900">Direct Inquiry</h3>
        <p className="text-sm text-neutral-500">Single-column minimal contact form with live character count.</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="form1-name" className="block text-sm font-medium text-neutral-800">
          Full Name
        </label>
        <input
          id="form1-name"
          type="text"
          value={name}
          onChange={(e) => {
            const val = e.target.value;
            setName(val);
            if (touched.name) setErrors(validate({ name: val, email, topic, message, consent }));
          }}
          onBlur={() => handleBlur('name')}
          placeholder="Clara Vance"
          aria-invalid={Boolean(touched.name && errors.name)}
          aria-describedby={touched.name && errors.name ? 'form1-name-error' : undefined}
          className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-neutral-900 placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 ${
            touched.name && errors.name
              ? 'border-red-500 focus:ring-red-200'
              : touched.name && !errors.name
                ? 'border-emerald-600 focus:ring-emerald-100'
                : 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-200'
          }`}
        />
        {touched.name && errors.name && (
          <p id="form1-name-error" role="alert" className="flex items-center gap-1.5 text-xs text-red-700">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{errors.name}</span>
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="form1-email" className="block text-sm font-medium text-neutral-800">
          Work Email
        </label>
        <input
          id="form1-email"
          type="email"
          value={email}
          onChange={(e) => {
            const val = e.target.value;
            setEmail(val);
            if (touched.email) setErrors(validate({ name, email: val, topic, message, consent }));
          }}
          onBlur={() => handleBlur('email')}
          placeholder="clara@northstudio.co"
          aria-invalid={Boolean(touched.email && errors.email)}
          aria-describedby={touched.email && errors.email ? 'form1-email-error' : undefined}
          className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-neutral-900 placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 ${
            touched.email && errors.email
              ? 'border-red-500 focus:ring-red-200'
              : touched.email && !errors.email
                ? 'border-emerald-600 focus:ring-emerald-100'
                : 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-200'
          }`}
        />
        {touched.email && errors.email ? (
          <p id="form1-email-error" role="alert" className="flex items-center gap-1.5 text-xs text-red-700">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{errors.email}</span>
          </p>
        ) : touched.email && !errors.email ? (
          <p className="flex items-center gap-1.5 text-xs text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Email format verified.</span>
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="form1-topic" className="block text-sm font-medium text-neutral-800">
          Topic
        </label>
        <select
          id="form1-topic"
          value={topic}
          onChange={(e) => {
            const val = e.target.value;
            setTopic(val);
            if (touched.topic) setErrors(validate({ name, email, topic: val, message, consent }));
          }}
          onBlur={() => handleBlur('topic')}
          aria-invalid={Boolean(touched.topic && errors.topic)}
          aria-describedby={touched.topic && errors.topic ? 'form1-topic-error' : undefined}
          className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-neutral-900 transition-colors focus:outline-none focus:ring-2 ${
            touched.topic && errors.topic
              ? 'border-red-500 focus:ring-red-200'
              : 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-200'
          }`}
        >
          <option value="">Choose a subject...</option>
          <option value="Design Systems">Design Systems</option>
          <option value="Product Engineering">Product Engineering</option>
          <option value="Licensing & Billing">Licensing &amp; Billing</option>
          <option value="Press & Speaking">Press &amp; Speaking</option>
        </select>
        {touched.topic && errors.topic && (
          <p id="form1-topic-error" role="alert" className="flex items-center gap-1.5 text-xs text-red-700">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{errors.topic}</span>
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="form1-message" className="block text-sm font-medium text-neutral-800">
            Message
          </label>
          <span className="text-xs font-mono tabular-nums text-neutral-500">{message.length}/500</span>
        </div>
        <textarea
          id="form1-message"
          rows={4}
          maxLength={500}
          value={message}
          onChange={(e) => {
            const val = e.target.value;
            setMessage(val);
            if (touched.message) setErrors(validate({ name, email, topic, message: val, consent }));
          }}
          onBlur={() => handleBlur('message')}
          placeholder="Tell us about your timeline and goals..."
          aria-invalid={Boolean(touched.message && errors.message)}
          aria-describedby={touched.message && errors.message ? 'form1-message-error' : undefined}
          className={`w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg text-neutral-900 placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 ${
            touched.message && errors.message
              ? 'border-red-500 focus:ring-red-200'
              : 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-200'
          }`}
        />
        {touched.message && errors.message && (
          <p id="form1-message-error" role="alert" className="flex items-center gap-1.5 text-xs text-red-700">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{errors.message}</span>
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-start gap-2.5">
          <input
            id="form1-consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              const val = e.target.checked;
              setConsent(val);
              setTouched((prev) => ({ ...prev, consent: true }));
              setErrors(validate({ name, email, topic, message, consent: val }));
            }}
            aria-invalid={Boolean(touched.consent && errors.consent)}
            aria-describedby={touched.consent && errors.consent ? 'form1-consent-error' : undefined}
            className="mt-1 h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900"
          />
          <label htmlFor="form1-consent" className="text-sm text-neutral-600 leading-snug">
            I agree to receive a response regarding this inquiry.
          </label>
        </div>
        {touched.consent && errors.consent && (
          <p id="form1-consent-error" role="alert" className="flex items-center gap-1.5 text-xs text-red-700">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{errors.consent}</span>
          </p>
        )}
      </div>

      <div className="pt-1 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
        >
          Clear
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900"
        >
          Send Inquiry
        </button>
      </div>
    </form>
  );
}
