import React, { useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { isValidSlug, isValidUrl } from '../../utils/validation';

export function Form16() {
  const [slug, setSlug] = useState('northstar-core');
  const [visibility, setVisibility] = useState('private');
  const [enforce2fa, setEnforce2fa] = useState(true);
  const [auditRetention, setAuditRetention] = useState(true);
  const [webhooksEnabled, setWebhooksEnabled] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('https://hooks.northstar.dev/events');
  const [errors, setErrors] = useState<{ slug?: string; webhookUrl?: string }>({});
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const validate = (nextSlug = slug, nextHooks = webhooksEnabled, nextUrl = webhookUrl) => {
    const errs: { slug?: string; webhookUrl?: string } = {};
    if (!isValidSlug(nextSlug)) {
      errs.slug = 'Use 3–40 lowercase letters, numbers, or single hyphens.';
    }
    if (nextHooks && !isValidUrl(nextUrl, true)) {
      errs.webhookUrl = 'Webhook endpoint must be a valid https:// URL when enabled.';
    }
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSavedNotice(`Saved settings for workspace "${slug}" (${visibility})`);
    } else {
      setSavedNotice(null);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-lg bg-white border border-neutral-200 rounded-xl p-6 sm:p-7 space-y-5"
    >
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-neutral-900">Workspace Privacy &amp; Webhooks</h3>
        <p className="text-xs text-neutral-500">Minimal single-column settings with conditional HTTPS validation.</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="form16-slug" className="block text-sm font-medium text-neutral-800">
          Workspace Slug
        </label>
        <input
          id="form16-slug"
          type="text"
          value={slug}
          onChange={(e) => {
            const val = e.target.value;
            setSlug(val);
            setErrors(validate(val, webhooksEnabled, webhookUrl));
            setSavedNotice(null);
          }}
          aria-invalid={Boolean(errors.slug)}
          aria-describedby={errors.slug ? 'form16-slug-err' : undefined}
          className={`w-full px-3.5 py-2 text-sm font-mono border rounded-lg focus:outline-none focus:ring-2 ${
            errors.slug ? 'border-red-500 focus:ring-red-200' : 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-200'
          }`}
        />
        {errors.slug ? (
          <p id="form16-slug-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {errors.slug}
          </p>
        ) : (
          <p className="text-xs text-emerald-700 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            Slug available: app.example.com/{slug}
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="form16-vis" className="block text-sm font-medium text-neutral-800">
          Default Repository Visibility
        </label>
        <select
          id="form16-vis"
          value={visibility}
          onChange={(e) => {
            setVisibility(e.target.value);
            setSavedNotice(null);
          }}
          className="w-full px-3.5 py-2 text-sm bg-white border border-neutral-300 rounded-lg focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
        >
          <option value="private">Private (Invite Only)</option>
          <option value="internal">Internal (Organization Members)</option>
          <option value="public">Public (Read-Only)</option>
        </select>
      </div>

      <div className="space-y-3 pt-1 border-t border-neutral-100">
        {(
          [
            { id: 'form16-2fa', label: 'Require Two-Factor Authentication', state: enforce2fa, setter: setEnforce2fa },
            { id: 'form16-audit', label: 'Retain 90-Day Audit Logs', state: auditRetention, setter: setAuditRetention },
            { id: 'form16-hooks', label: 'Enable Outbound Webhooks', state: webhooksEnabled, setter: setWebhooksEnabled },
          ] as const
        ).map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 py-1">
            <label htmlFor={item.id} className="text-sm text-neutral-800 cursor-pointer">
              {item.label}
            </label>
            <label htmlFor={item.id} className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                id={item.id}
                type="checkbox"
                role="switch"
                aria-checked={item.state}
                checked={item.state}
                onChange={(e) => {
                  const checked = e.target.checked;
                  item.setter(checked);
                  if (item.id === 'form16-hooks') {
                    setErrors(validate(slug, checked, webhookUrl));
                  }
                  setSavedNotice(null);
                }}
                className="sr-only peer"
              />
              <span className="w-10 h-6 bg-neutral-300 rounded-full peer peer-focus-visible:ring-2 peer-focus-visible:ring-neutral-900 peer-checked:bg-neutral-900 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-transform peer-checked:after:translate-x-4" />
            </label>
          </div>
        ))}
      </div>

      {webhooksEnabled && (
        <div className="space-y-1.5">
          <label htmlFor="form16-url" className="block text-sm font-medium text-neutral-800">
            Webhook Endpoint (HTTPS)
          </label>
          <input
            id="form16-url"
            type="url"
            value={webhookUrl}
            onChange={(e) => {
              const val = e.target.value;
              setWebhookUrl(val);
              setErrors(validate(slug, webhooksEnabled, val));
              setSavedNotice(null);
            }}
            placeholder="https://api.example.com/webhooks"
            aria-invalid={Boolean(errors.webhookUrl)}
            aria-describedby={errors.webhookUrl ? 'form16-url-err' : undefined}
            className={`w-full px-3.5 py-2 text-sm font-mono border rounded-lg focus:outline-none focus:ring-2 ${
              errors.webhookUrl ? 'border-red-500 focus:ring-red-200' : 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-200'
            }`}
          />
          {errors.webhookUrl && (
            <p id="form16-url-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {errors.webhookUrl}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div>
          {savedNotice && (
            <p className="text-xs text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              {savedNotice}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="px-5 py-2 text-sm font-medium text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900"
        >
          Update Settings
        </button>
      </div>
    </form>
  );
}
