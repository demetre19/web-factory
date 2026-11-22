import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { validateWebhookForm, WebhookFormValues } from '../../utils/feedbackCatalog';

export function Feedback7() {
  const [values, setValues] = useState<WebhookFormValues>({
    email: 'ops@acme',
    webhookUrl: 'http://hooks.acme.io/events',
    secret: 'short',
  });
  const [submitted, setSubmitted] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const secretRef = useRef<HTMLInputElement>(null);

  const validation = validateWebhookForm(values);

  const focusField = (field: keyof WebhookFormValues) => {
    if (field === 'email') emailRef.current?.focus();
    if (field === 'webhookUrl') urlRef.current?.focus();
    if (field === 'secret') secretRef.current?.focus();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!validation.valid) {
      setSavedSuccess(false);
      return;
    }
    setSavedSuccess(true);
  };

  const fillValidSample = () => {
    setValues({
      email: 'ops@northstar.io',
      webhookUrl: 'https://hooks.northstar.io/v1/billing',
      secret: 'whsec_98a71b24f63e80c1',
    });
    setSubmitted(true);
    setSavedSuccess(true);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full max-w-lg space-y-3.5">
      {submitted && !validation.valid && (
        <div
          role="alert"
          aria-live="assertive"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-950"
        >
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold">
                Fix {validation.errorList.length} validation{' '}
                {validation.errorList.length === 1 ? 'issue' : 'issues'} before saving:
              </p>
              <ul className="mt-1.5 space-y-1 text-xs text-red-800">
                {validation.errorList.map((err) => (
                  <li key={err.field}>
                    <button
                      type="button"
                      onClick={() => focusField(err.field)}
                      className="text-left underline underline-offset-2 hover:text-red-950"
                    >
                      {err.message}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {savedSuccess && validation.valid && (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-900"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          Webhook destination validated and saved.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="fb7-email" className="block text-xs font-medium text-slate-700">
            Alert Email
          </label>
          <input
            ref={emailRef}
            id="fb7-email"
            type="email"
            value={values.email}
            onChange={(e) => {
              setSavedSuccess(false);
              setValues((prev) => ({ ...prev, email: e.target.value }));
            }}
            aria-invalid={submitted && Boolean(validation.errors.email)}
            aria-describedby="fb7-email-msg"
            className={`mt-1 w-full rounded-lg border px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 ${
              submitted && validation.errors.email
                ? 'border-red-400 bg-red-50/40 focus:ring-red-200'
                : 'border-slate-300 bg-white focus:ring-blue-200'
            }`}
          />
          <p
            id="fb7-email-msg"
            className={`mt-1 text-[11px] ${
              submitted && validation.errors.email ? 'text-red-700' : 'text-emerald-700'
            }`}
          >
            {submitted && validation.errors.email
              ? validation.errors.email
              : 'Valid email format'}
          </p>
        </div>

        <div>
          <label htmlFor="fb7-secret" className="block text-xs font-medium text-slate-700">
            Signing Secret (min 12 chars)
          </label>
          <input
            ref={secretRef}
            id="fb7-secret"
            type="text"
            value={values.secret}
            onChange={(e) => {
              setSavedSuccess(false);
              setValues((prev) => ({ ...prev, secret: e.target.value }));
            }}
            aria-invalid={submitted && Boolean(validation.errors.secret)}
            aria-describedby="fb7-secret-msg"
            className={`mt-1 w-full rounded-lg border px-3 py-2 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 ${
              submitted && validation.errors.secret
                ? 'border-red-400 bg-red-50/40 focus:ring-red-200'
                : 'border-slate-300 bg-white focus:ring-blue-200'
            }`}
          />
          <p
            id="fb7-secret-msg"
            className={`mt-1 text-[11px] ${
              submitted && validation.errors.secret ? 'text-red-700' : 'text-emerald-700'
            }`}
          >
            {submitted && validation.errors.secret
              ? validation.errors.secret
              : 'Strong signing secret length'}
          </p>
        </div>
      </div>

      <div>
        <label htmlFor="fb7-url" className="block text-xs font-medium text-slate-700">
          HTTPS Webhook Endpoint
        </label>
        <input
          ref={urlRef}
          id="fb7-url"
          type="url"
          value={values.webhookUrl}
          onChange={(e) => {
            setSavedSuccess(false);
            setValues((prev) => ({ ...prev, webhookUrl: e.target.value }));
          }}
          aria-invalid={submitted && Boolean(validation.errors.webhookUrl)}
          aria-describedby="fb7-url-msg"
          className={`mt-1 w-full rounded-lg border px-3 py-2 font-mono text-xs text-slate-900 focus:outline-none focus:ring-2 ${
            submitted && validation.errors.webhookUrl
              ? 'border-red-400 bg-red-50/40 focus:ring-red-200'
              : 'border-slate-300 bg-white focus:ring-blue-200'
          }`}
        />
        <p
          id="fb7-url-msg"
          className={`mt-1 text-[11px] ${
            submitted && validation.errors.webhookUrl ? 'text-red-700' : 'text-emerald-700'
          }`}
        >
          {submitted && validation.errors.webhookUrl
            ? validation.errors.webhookUrl
            : 'TLS-secured endpoint verified'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 whitespace-nowrap shrink-0"
        >
          Validate &amp; Save
        </button>
        <button
          type="button"
          onClick={fillValidSample}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
        >
          Fill Valid Inputs
        </button>
      </div>
    </form>
  );
}

export function Feedback12() {
  const [state, setState] = useState<'offline' | 'reconnecting' | 'restored' | 'idle'>('offline');
  const [retryIn, setRetryIn] = useState(4);

  useEffect(() => {
    if (state === 'offline') {
      const id = window.setInterval(() => {
        setRetryIn((prev) => {
          if (prev <= 1) {
            setState('reconnecting');
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
      return () => window.clearInterval(id);
    }
    if (state === 'reconnecting') {
      const timer = window.setTimeout(() => {
        setState('restored');
      }, 1200);
      return () => window.clearTimeout(timer);
    }
    if (state === 'restored') {
      const timer = window.setTimeout(() => {
        setState('idle');
      }, 3000);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [state]);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-3">
      {state === 'idle' ? (
        <div
          role="status"
          aria-live="polite"
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-600"
        >
          <span className="inline-flex items-center gap-2 font-medium text-slate-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            Connection healthy — indicator auto-hidden
          </span>
          <button
            type="button"
            onClick={() => {
              setRetryIn(4);
              setState('offline');
            }}
            className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            Simulate Offline
          </button>
        </div>
      ) : (
        <div
          role={state === 'offline' ? 'alert' : 'status'}
          aria-live={state === 'offline' ? 'assertive' : 'polite'}
          className={`animate-feedback-enter flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 shadow-sm ${
            state === 'offline'
              ? 'border-red-200 bg-red-50 text-red-950'
              : state === 'reconnecting'
              ? 'border-amber-200 bg-amber-50 text-amber-950'
              : 'border-emerald-200 bg-emerald-50 text-emerald-950'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {state === 'offline' && (
              <WifiOff className="h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
            )}
            {state === 'reconnecting' && (
              <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-amber-700" aria-hidden="true" />
            )}
            {state === 'restored' && (
              <Wifi className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold">
                {state === 'offline' && 'You are offline — changes queued locally'}
                {state === 'reconnecting' && 'Reconnecting to sync stream...'}
                {state === 'restored' && 'Back online — queued edits synced'}
              </p>
              {state === 'offline' && (
                <p className="font-mono text-[11px] tabular-nums text-red-800">
                  Automatic retry in {retryIn}s
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {state === 'offline' && (
              <button
                type="button"
                onClick={() => setState('reconnecting')}
                className="rounded-md bg-red-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-800 whitespace-nowrap shrink-0"
              >
                Retry Now
              </button>
            )}
            {state === 'restored' && (
              <button
                type="button"
                onClick={() => setState('idle')}
                aria-label="Dismiss restored indicator"
                className="flex h-6 w-6 items-center justify-center rounded text-emerald-700 hover:bg-emerald-200/60"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => {
            setRetryIn(4);
            setState('offline');
          }}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
        >
          Offline
        </button>
        <button
          type="button"
          onClick={() => setState('reconnecting')}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
        >
          Reconnecting
        </button>
        <button
          type="button"
          onClick={() => setState('restored')}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
        >
          Restored
        </button>
      </div>
    </div>
  );
}
