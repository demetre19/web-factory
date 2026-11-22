// Footer9 — Language / currency selectors · light neutral e-commerce
import React, { useState } from "react";

function Chevron() {
  return (
    <svg viewBox="0 0 20 20" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" fill="currentColor" aria-hidden="true">
      <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4z" />
    </svg>
  );
}

export default function Footer9() {
  const [lang, setLang] = useState("en");
  const [currency, setCurrency] = useState("USD");

  const groups = [
    { title: "Shop", links: ["New arrivals", "Tableware", "Vases", "Lighting", "Sale"] },
    { title: "Customer care", links: ["Shipping", "Returns", "Care guide", "Order status"] },
    { title: "About Kiln", links: ["Our studio", "Makers", "Stockists", "Journal"] },
  ];

  const selectClass =
    "w-full appearance-none rounded-md border border-neutral-300 bg-white py-2 pl-9 pr-9 text-sm text-neutral-800 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900";

  return (
    <footer className="bg-neutral-100 text-neutral-600">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <a href="#" className="text-2xl font-light tracking-[0.3em] text-neutral-900" aria-label="Kiln home">
              K<span className="text-neutral-400">ILN</span>
            </a>
            <p className="mt-4 text-sm leading-6">Hand-thrown ceramics, fired in small batches.</p>
          </div>
          {groups.map((g) => (
            <nav key={g.title} aria-labelledby={`f9-${g.title}`}>
              <h2 id={`f9-${g.title}`} className="text-sm font-medium text-neutral-900">
                {g.title}
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {g.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="hover:text-neutral-900">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-neutral-300 pt-8 lg:flex-row lg:items-end lg:justify-between">
          <form className="flex flex-col gap-4 sm:flex-row" aria-label="Regional preferences" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label htmlFor="f9-lang" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-500">
                Language
              </label>
              <div className="relative sm:w-48">
                <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
                </svg>
                <select id="f9-lang" value={lang} onChange={(e) => setLang(e.target.value)} className={selectClass}>
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="ja">日本語</option>
                  <option value="es">Español</option>
                </select>
                <Chevron />
              </div>
            </div>
            <div>
              <label htmlFor="f9-cur" className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-500">
                Currency
              </label>
              <div className="relative sm:w-48">
                <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="2" y="6" width="20" height="12" rx="2" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
                <select id="f9-cur" value={currency} onChange={(e) => setCurrency(e.target.value)} className={selectClass}>
                  <option value="USD">USD $</option>
                  <option value="EUR">EUR €</option>
                  <option value="GBP">GBP £</option>
                  <option value="JPY">JPY ¥</option>
                  <option value="AUD">AUD $</option>
                </select>
                <Chevron />
              </div>
            </div>
          </form>
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} Kiln Ceramics · Prices shown in {currency}
          </p>
        </div>
      </div>
    </footer>
  );
}
