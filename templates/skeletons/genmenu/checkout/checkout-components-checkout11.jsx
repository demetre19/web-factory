import { useState } from "react";

// Payment screen · minimal light · card form with live card preview + brand detection
const BrandIcon = {
  visa: (p) => <svg viewBox="0 0 48 32" aria-hidden="true" {...p}><rect width="48" height="32" rx="4" fill="#fff" stroke="#e5e7eb" /><text x="24" y="21" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontStyle="italic" fontSize="13" fill="#1a1f71">VISA</text></svg>,
  mastercard: (p) => <svg viewBox="0 0 48 32" aria-hidden="true" {...p}><rect width="48" height="32" rx="4" fill="#fff" stroke="#e5e7eb" /><circle cx="20" cy="16" r="8" fill="#eb001b" /><circle cx="28" cy="16" r="8" fill="#f79e1b" fillOpacity=".9" /></svg>,
  amex: (p) => <svg viewBox="0 0 48 32" aria-hidden="true" {...p}><rect width="48" height="32" rx="4" fill="#2e77bc" /><text x="24" y="20" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="10" fill="#fff">AMEX</text></svg>,
  discover: (p) => <svg viewBox="0 0 48 32" aria-hidden="true" {...p}><rect width="48" height="32" rx="4" fill="#fff" stroke="#e5e7eb" /><text x="6" y="19.5" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="7.5" fill="#111">DISC</text><circle cx="32" cy="16.5" r="4" fill="#f58220" /><text x="37" y="19.5" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="7.5" fill="#111">V</text></svg>,
};
const BRANDS = [["visa", "Visa"], ["mastercard", "Mastercard"], ["amex", "American Express"], ["discover", "Discover"]];

function detect(n) {
  if (/^4/.test(n)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  if (/^6(011|5)/.test(n)) return "discover";
  return null;
}
function formatNum(raw, brand) {
  const d = raw.replace(/\D/g, "").slice(0, brand === "amex" ? 15 : 16);
  return brand === "amex" ? d.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" ")) : d.replace(/(\d{4})(?=\d)/g, "$1 ");
}

const Lock = (p) => <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...p}><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>;
const Chip = (p) => <svg viewBox="0 0 40 30" aria-hidden="true" {...p}><rect x="1" y="1" width="38" height="28" rx="5" fill="#e8c766" stroke="#b8963a" /><path d="M1 10h12M1 20h12M27 10h12M27 20h12M13 1v28M27 1v28" stroke="#b8963a" fill="none" /></svg>;

export default function Checkout11() {
  const [num, setNum] = useState("");
  const [name, setName] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [errors, setErrors] = useState({});
  const [paid, setPaid] = useState(false);
  const digits = num.replace(/\D/g, "");
  const brand = detect(digits);

  const onExp = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    setExp(d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d);
  };
  const submit = (e) => {
    e.preventDefault();
    const err = {};
    if (digits.length < (brand === "amex" ? 15 : 16)) err.num = "Enter a complete card number.";
    if (!name.trim()) err.name = "Enter the name shown on the card.";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp)) err.exp = "Use MM/YY.";
    if (cvc.length < (brand === "amex" ? 4 : 3)) err.cvc = brand === "amex" ? "4 digits on the front." : "3 digits on the back.";
    setErrors(err);
    if (!Object.keys(err).length) setPaid(true);
  };
  const inputCls = (k) => `mt-1.5 w-full rounded-lg border bg-white px-3 py-2.5 text-[15px] tabular-nums focus:outline-none focus:ring-2 ${errors[k] ? "border-red-400 focus:ring-red-200" : "border-neutral-300 focus:border-neutral-900 focus:ring-neutral-200"}`;

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 p-6 font-sans text-neutral-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-neutral-200">
        <div className="flex items-baseline justify-between">
          <h1 className="text-xl font-semibold">Payment</h1>
          <p className="text-sm text-neutral-500">Amount due <span className="font-semibold text-neutral-900">$212.40</span></p>
        </div>

        {/* card preview */}
        <div className="mt-6 [perspective:1000px]" aria-hidden="true">
          <div className={`relative h-48 w-full transition-transform duration-500 [transform-style:preserve-3d] ${flipped ? "[transform:rotateY(180deg)]" : ""}`}>
            <div className="absolute inset-0 flex flex-col justify-between rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-950 p-5 text-white [backface-visibility:hidden]">
              <div className="flex items-start justify-between">
                <Chip className="h-8 w-10" />
                {brand ? BrandIcon[brand]({ className: "h-8 w-12" }) : <span className="text-xs tracking-widest text-neutral-400">CARD</span>}
              </div>
              <p className="font-mono text-xl tracking-widest">{num || "•••• •••• •••• ••••"}</p>
              <div className="flex justify-between text-xs uppercase">
                <span><span className="block text-[10px] text-neutral-400">Card holder</span>{name || "Your name"}</span>
                <span className="text-right"><span className="block text-[10px] text-neutral-400">Expires</span>{exp || "MM/YY"}</span>
              </div>
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neutral-700 to-neutral-900 [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div className="mt-6 h-10 bg-neutral-950" />
              <div className="mx-5 mt-5 flex h-9 items-center justify-end rounded bg-neutral-100 pr-3 font-mono text-neutral-900">{cvc || "•••"}</div>
            </div>
          </div>
        </div>

        {paid ? (
          <div role="status" className="mt-8 rounded-xl bg-green-50 p-5 text-center text-green-900">
            <p className="font-semibold">Payment authorized</p>
            <p className="mt-1 text-sm">Charged $212.40 to {BRANDS.find((b) => b[0] === brand)?.[1]} ending {digits.slice(-4)}.</p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-8 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="c11-num" className="text-sm font-medium">Card number</label>
                <ul className="flex gap-1" aria-label="Accepted cards">
                  {BRANDS.map(([k, label]) => (
                    <li key={k} title={label} className={`transition ${brand && brand !== k ? "opacity-25 grayscale" : ""}`}>
                      {BrandIcon[k]({ className: "h-5 w-8" })}<span className="sr-only">{label}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <input id="c11-num" inputMode="numeric" autoComplete="cc-number" value={num} onChange={(e) => setNum(formatNum(e.target.value, detect(e.target.value.replace(/\D/g, ""))))}
                aria-invalid={!!errors.num} aria-describedby="c11-num-msg" className={inputCls("num")} />
              <p id="c11-num-msg" className="mt-1 text-xs text-red-600">{errors.num}</p>
              <p className="text-xs text-neutral-500">Try 4242…, 5555…, 3782… or 6011…</p>
            </div>
            <div>
              <label htmlFor="c11-name" className="text-sm font-medium">Name on card</label>
              <input id="c11-name" autoComplete="cc-name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} aria-describedby="c11-name-msg" className={inputCls("name")} />
              <p id="c11-name-msg" className="mt-1 text-xs text-red-600">{errors.name}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="c11-exp" className="text-sm font-medium">Expiry (MM/YY)</label>
                <input id="c11-exp" inputMode="numeric" autoComplete="cc-exp" value={exp} onChange={(e) => onExp(e.target.value)} aria-invalid={!!errors.exp} aria-describedby="c11-exp-msg" className={inputCls("exp")} />
                <p id="c11-exp-msg" className="mt-1 text-xs text-red-600">{errors.exp}</p>
              </div>
              <div>
                <label htmlFor="c11-cvc" className="text-sm font-medium">{brand === "amex" ? "CID" : "CVC"}</label>
                <input id="c11-cvc" inputMode="numeric" autoComplete="cc-csc" value={cvc} onFocus={() => setFlipped(true)} onBlur={() => setFlipped(false)}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, brand === "amex" ? 4 : 3))} aria-invalid={!!errors.cvc} aria-describedby="c11-cvc-msg" className={inputCls("cvc")} />
                <p id="c11-cvc-msg" className="mt-1 text-xs text-red-600">{errors.cvc}</p>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-neutral-600"><input type="checkbox" defaultChecked className="h-4 w-4 accent-neutral-900" />Save card for future purchases</label>
            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 py-3 font-medium text-white hover:bg-neutral-700"><Lock className="h-4 w-4" />Pay $212.40</button>
          </form>
        )}
      </div>
    </div>
  );
}
