import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, MapPin } from 'lucide-react';
import { isValidPostalCode } from '../../utils/validation';

interface AddressData {
  recipient: string;
  line1: string;
  line2: string;
  city: string;
  region: string;
  postalCode: string;
  country: 'US' | 'CA' | 'UK' | 'DE';
  instructions: string;
  billingSame: boolean;
}

const DEFAULT_ADDR: AddressData = {
  recipient: '',
  line1: '',
  line2: '',
  city: '',
  region: '',
  postalCode: '',
  country: 'US',
  instructions: '',
  billingSame: true,
};

export function Form17() {
  const [addr, setAddr] = useState<AddressData>(DEFAULT_ADDR);
  const [errors, setErrors] = useState<Partial<Record<keyof AddressData, string>>>({});
  const [saved, setSaved] = useState(false);

  const validate = (d: AddressData) => {
    const next: Partial<Record<keyof AddressData, string>> = {};
    if (d.recipient.trim().length < 2) next.recipient = 'Recipient name is required.';
    if (d.line1.trim().length < 5) next.line1 = 'Enter a valid street address.';
    if (!d.city.trim()) next.city = 'City is required.';
    if (!d.region.trim()) next.region = 'State or province is required.';
    if (!isValidPostalCode(d.postalCode, d.country)) {
      const hint =
        d.country === 'US'
          ? 'e.g. 94107'
          : d.country === 'CA'
            ? 'e.g. M5V 2T6'
            : d.country === 'UK'
              ? 'e.g. SW1A 1AA'
              : '3–12 characters';
      next.postalCode = `Invalid postal code for ${d.country} (${hint}).`;
    }
    return next;
  };

  const setField = <K extends keyof AddressData>(key: K, value: AddressData[K]) => {
    const next = { ...addr, [key]: value };
    setAddr(next);
    if (errors[key] || (key === 'country' && errors.postalCode)) {
      const recheck = validate(next);
      setErrors((prev) => ({
        ...prev,
        [key]: recheck[key],
        ...(key === 'country' ? { postalCode: recheck.postalCode } : {}),
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(addr);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      setSaved(true);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-3xl bg-white border border-slate-200 rounded-xl p-6 space-y-5"
    >
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Shipping &amp; Billing Address</h3>
          <p className="text-xs text-slate-500">Two-column professional address form with country-aware postal validation.</p>
        </div>
        <MapPin className="w-4 h-4 text-slate-400" aria-hidden="true" />
      </div>

      {saved ? (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm space-y-1 text-emerald-950">
              <p className="font-semibold">Destination Verified</p>
              <p className="text-emerald-900">
                {addr.recipient} · {addr.line1}
                {addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.region} {addr.postalCode} ({addr.country})
              </p>
              <p className="text-xs text-emerald-800">
                {addr.billingSame ? 'Also set as primary billing address.' : 'Separate billing address will be requested.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSaved(false)}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          >
            Edit Address
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="form17-recipient" className="block text-sm font-medium text-slate-700">
                Recipient Full Name
              </label>
              <input
                id="form17-recipient"
                type="text"
                value={addr.recipient}
                onChange={(e) => setField('recipient', e.target.value)}
                placeholder="Jordan Patel"
                aria-invalid={Boolean(errors.recipient)}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                  errors.recipient ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                }`}
              />
              {errors.recipient && (
                <p role="alert" className="text-xs text-red-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {errors.recipient}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="form17-country" className="block text-sm font-medium text-slate-700">
                Country / Region
              </label>
              <select
                id="form17-country"
                value={addr.country}
                onChange={(e) => setField('country', e.target.value as AddressData['country'])}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="US">United States (US)</option>
                <option value="CA">Canada (CA)</option>
                <option value="UK">United Kingdom (UK)</option>
                <option value="DE">Germany (DE)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="form17-line1" className="block text-sm font-medium text-slate-700">
                Street Address
              </label>
              <input
                id="form17-line1"
                type="text"
                value={addr.line1}
                onChange={(e) => setField('line1', e.target.value)}
                placeholder="742 Evergreen Terrace"
                aria-invalid={Boolean(errors.line1)}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                  errors.line1 ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                }`}
              />
              {errors.line1 && (
                <p role="alert" className="text-xs text-red-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {errors.line1}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="form17-line2" className="block text-sm font-medium text-slate-700">
                Apt, Suite, or Unit (Optional)
              </label>
              <input
                id="form17-line2"
                type="text"
                value={addr.line2}
                onChange={(e) => setField('line2', e.target.value)}
                placeholder="Suite 4B"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="form17-city" className="block text-sm font-medium text-slate-700">
                City
              </label>
              <input
                id="form17-city"
                type="text"
                value={addr.city}
                onChange={(e) => setField('city', e.target.value)}
                placeholder="San Francisco"
                aria-invalid={Boolean(errors.city)}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                  errors.city ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                }`}
              />
              {errors.city && (
                <p role="alert" className="text-xs text-red-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {errors.city}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="form17-region" className="block text-sm font-medium text-slate-700">
                  State / Province
                </label>
                <input
                  id="form17-region"
                  type="text"
                  value={addr.region}
                  onChange={(e) => setField('region', e.target.value)}
                  placeholder="CA"
                  aria-invalid={Boolean(errors.region)}
                  className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 ${
                    errors.region ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                  }`}
                />
                {errors.region && (
                  <p role="alert" className="text-xs text-red-700 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    {errors.region}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="form17-postal" className="block text-sm font-medium text-slate-700">
                  Postal Code
                </label>
                <input
                  id="form17-postal"
                  type="text"
                  value={addr.postalCode}
                  onChange={(e) => setField('postalCode', e.target.value)}
                  placeholder={addr.country === 'US' ? '94107' : addr.country === 'CA' ? 'M5V 2T6' : 'SW1A 1AA'}
                  aria-invalid={Boolean(errors.postalCode)}
                  className={`w-full px-3 py-2 text-sm font-mono border rounded-md focus:outline-none focus:ring-2 ${
                    errors.postalCode ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-100'
                  }`}
                />
                {errors.postalCode && (
                  <p role="alert" className="text-xs text-red-700 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    {errors.postalCode}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="form17-instr" className="block text-sm font-medium text-slate-700">
              Delivery Instructions (Optional)
            </label>
            <textarea
              id="form17-instr"
              rows={2}
              value={addr.instructions}
              onChange={(e) => setField('instructions', e.target.value)}
              placeholder="Gate access code or loading dock hours..."
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <input
                id="form17-billing"
                type="checkbox"
                checked={addr.billingSame}
                onChange={(e) => setField('billingSame', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
              />
              <label htmlFor="form17-billing" className="text-sm text-slate-700">
                Use same address for billing
              </label>
            </div>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600"
            >
              Validate &amp; Save Address
            </button>
          </div>
        </>
      )}
    </form>
  );
}
