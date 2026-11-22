import { useState } from "react";

// Payment screen · light-warm · wallet buttons, tabbed methods (wallet / card / pay later)
const Apple = (p) => <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}><path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.6-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.6-1-2.6-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1.1.1 2.1-.6 2.8-1.4z" /></svg>;
const G = (p) => <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.6a4.8 4.8 0 01-2 3.2v2.6h3.3c1.9-1.8 3.1-4.4 3.1-7.6z" /><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.3-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3v2.6A10 10 0 0012 22z" /><path fill="#FBBC05" d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3a10 10 0 000 9.2L6.4 14z" /><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 003 7.4L6.4 10c.8-2.3 3-4.1 5.6-4.1z" /></svg>;
const PP = (p) => <svg viewBox="0 0 24 24" aria-hidden="true" {...p}><path fill="#003087" d="M8 21H4.5L7.5 3h6.8c3.6 0 5.2 2 4.6 5-.7 3.6-3.2 5.3-6.6 5.3H9.6z" /><path fill="#009cde" d="M10.5 21H8.2l1.6-9.2h2.7c3.1 0 5.4-1.4 6.1-4.6 1.4 1 1.9 2.6 1.5 4.6-.6 3.1-2.9 4.6-5.8 4.6h-1.9z" /></svg>;
const CardI = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" {...p}><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 10h19M6 15h4" /></svg>;
const Wallet = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}><path d="M3 7a2 2 0 012-2h12v4M3 7v11a2 2 0 002 2h15V9H5a2 2 0 01-2-2z" /><circle cx="16" cy="14.5" r="1.2" fill="currentColor" /></svg>;
const Cal = (p) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>;
const Spinner = (p) => <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...p}><circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" /><path d="M21 12a9 9 0 00-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>;

const TOTAL = 186;
const TABS = [["wallet", "Wallet", Wallet], ["card", "Card", CardI], ["later", "Pay later", Cal]];

export default function Checkout13() {
  const [tab, setTab] = useState("wallet");
  const [processing, setProcessing] = useState(null);
  const [done, setDone] = useState(null);
  const [plan, setPlan] = useState(4);

  const pay = (via) => {
    setProcessing(via);
    setTimeout(() => { setProcessing(null); setDone(via); }, 1200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-[#f3e9dc] px-4 py-12 font-sans text-[#3b2a1f]">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#c2603c] font-serif text-xl text-orange-50">t</span>
          <p className="mt-3 text-sm text-[#8a6a55]">Paying Terra Ceramics</p>
          <p className="mt-1 font-serif text-5xl">${TOTAL.toFixed(2)}</p>
          <p className="mt-1 text-sm text-[#8a6a55]">Order TC-4410 · 3 items · ships from Santa Fe</p>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-xl shadow-orange-900/10">
          {done ? (
            <div role="status" className="p-10 text-center">
              <p className="font-serif text-3xl">Thank you</p>
              <p className="mt-2 text-sm text-[#8a6a55]">Paid with {done}. A receipt is on its way.</p>
              <button type="button" onClick={() => setDone(null)} className="mt-6 text-sm font-medium text-[#c2603c] underline underline-offset-4">Make another payment</button>
            </div>
          ) : (
            <>
              <div role="tablist" aria-label="Payment method" className="grid grid-cols-3 border-b border-orange-100 bg-orange-50/60">
                {TABS.map(([v, t, I]) => (
                  <button key={v} role="tab" id={`c13-tab-${v}`} aria-selected={tab === v} aria-controls={`c13-panel-${v}`} onClick={() => setTab(v)}
                    className={`flex flex-col items-center gap-1 py-4 text-sm font-medium transition ${tab === v ? "border-b-2 border-[#c2603c] bg-white text-[#c2603c]" : "text-[#8a6a55] hover:text-[#3b2a1f]"}`}>
                    <I className="h-5 w-5" />{t}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {tab === "wallet" && (
                  <div role="tabpanel" id="c13-panel-wallet" aria-labelledby="c13-tab-wallet" className="space-y-3">
                    <button type="button" onClick={() => pay("Apple Pay")} disabled={!!processing} className="flex h-12 w-full items-center justify-center gap-1 rounded-xl bg-black text-lg font-medium text-white disabled:opacity-60">
                      {processing === "Apple Pay" ? <Spinner className="h-5 w-5 animate-spin" /> : <><Apple className="h-6 w-6" />Pay</>}
                      <span className="sr-only">with Apple Pay</span>
                    </button>
                    <button type="button" onClick={() => pay("Google Pay")} disabled={!!processing} className="flex h-12 w-full items-center justify-center gap-1.5 rounded-xl border border-stone-300 bg-white text-lg font-medium text-stone-800 disabled:opacity-60">
                      {processing === "Google Pay" ? <Spinner className="h-5 w-5 animate-spin" /> : <><G className="h-5 w-5" />Pay</>}
                      <span className="sr-only">with Google Pay</span>
                    </button>
                    <button type="button" onClick={() => pay("PayPal")} disabled={!!processing} className="flex h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-[#ffc439] text-lg font-bold italic text-[#003087] disabled:opacity-60">
                      {processing === "PayPal" ? <Spinner className="h-5 w-5 animate-spin" /> : <><PP className="h-5 w-5" />PayPal</>}
                    </button>
                    <p className="pt-2 text-center text-xs text-[#8a6a55]">You'll confirm the payment in your wallet. Your card details are never shared with us.</p>
                  </div>
                )}

                {tab === "card" && (
                  <form role="tabpanel" id="c13-panel-card" aria-labelledby="c13-tab-card" onSubmit={(e) => { e.preventDefault(); pay("card ending 1881"); }} className="space-y-4">
                    <div>
                      <label htmlFor="c13-num" className="text-sm font-medium">Card number</label>
                      <input id="c13-num" inputMode="numeric" autoComplete="cc-number" defaultValue="4000 0566 5566 1881" className="mt-1 w-full rounded-xl border border-orange-200 bg-orange-50/40 px-4 py-3 focus:border-[#c2603c] focus:outline-none focus:ring-2 focus:ring-[#c2603c]/20" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="c13-exp" className="text-sm font-medium">Expiry</label>
                        <input id="c13-exp" autoComplete="cc-exp" defaultValue="10/28" className="mt-1 w-full rounded-xl border border-orange-200 bg-orange-50/40 px-4 py-3 focus:border-[#c2603c] focus:outline-none focus:ring-2 focus:ring-[#c2603c]/20" />
                      </div>
                      <div>
                        <label htmlFor="c13-cvc" className="text-sm font-medium">CVC</label>
                        <input id="c13-cvc" inputMode="numeric" autoComplete="cc-csc" defaultValue="310" className="mt-1 w-full rounded-xl border border-orange-200 bg-orange-50/40 px-4 py-3 focus:border-[#c2603c] focus:outline-none focus:ring-2 focus:ring-[#c2603c]/20" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="c13-zip" className="text-sm font-medium">Billing ZIP</label>
                      <input id="c13-zip" autoComplete="billing postal-code" defaultValue="87501" className="mt-1 w-full rounded-xl border border-orange-200 bg-orange-50/40 px-4 py-3 focus:border-[#c2603c] focus:outline-none focus:ring-2 focus:ring-[#c2603c]/20" />
                    </div>
                    <button type="submit" disabled={!!processing} className="flex h-12 w-full items-center justify-center rounded-xl bg-[#c2603c] font-semibold text-white hover:bg-[#a84f2f] disabled:opacity-60">
                      {processing ? <Spinner className="h-5 w-5 animate-spin" /> : `Pay $${TOTAL.toFixed(2)}`}
                    </button>
                  </form>
                )}

                {tab === "later" && (
                  <form role="tabpanel" id="c13-panel-later" aria-labelledby="c13-tab-later" onSubmit={(e) => { e.preventDefault(); pay(`${plan} installments`); }}>
                    <fieldset className="space-y-3">
                      <legend className="mb-3 text-sm font-medium">Split your purchase</legend>
                      {[[4, "every 2 weeks", "0% interest"], [6, "monthly", "0% APR"], [12, "monthly", "9.99% APR"]].map(([n, freq, rate]) => {
                        const each = n === 12 ? (TOTAL * 1.055) / n : TOTAL / n;
                        return (
                          <label key={n} className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 ${plan === n ? "border-[#c2603c] bg-orange-50" : "border-orange-100"}`}>
                            <input type="radio" name="c13-plan" checked={plan === n} onChange={() => setPlan(n)} className="accent-[#c2603c]" />
                            <span className="flex-1"><span className="block font-semibold">{n} payments of ${each.toFixed(2)}</span><span className="text-sm text-[#8a6a55]">Paid {freq}</span></span>
                            <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-[#a84f2f]">{rate}</span>
                          </label>
                        );
                      })}
                    </fieldset>
                    <ol className="mt-5 flex justify-between text-center text-xs text-[#8a6a55]" aria-label="Payment schedule preview">
                      {Array.from({ length: Math.min(plan, 4) }).map((_, k) => (
                        <li key={k} className="flex flex-col items-center gap-1">
                          <span className={`h-3 w-3 rounded-full ${k === 0 ? "bg-[#c2603c]" : "border-2 border-orange-200"}`} />
                          {k === 0 ? "Today" : plan === 4 ? `Week ${k * 2}` : `Month ${k}`}
                        </li>
                      ))}
                    </ol>
                    <button type="submit" disabled={!!processing} className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-[#3b2a1f] font-semibold text-orange-50 disabled:opacity-60">
                      {processing ? <Spinner className="h-5 w-5 animate-spin" /> : "Continue with pay later"}
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
