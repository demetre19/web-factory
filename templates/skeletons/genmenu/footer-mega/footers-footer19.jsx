// Footer19 — Disclosure-heavy fintech · dark green · professional
import React from "react";

export default function Footer19() {
  const groups = [
    { title: "Invest", links: ["Stocks & ETFs", "Retirement", "Managed portfolios", "Crypto"] },
    { title: "Learn", links: ["Investing 101", "Market insights", "Glossary", "Calculators"] },
    { title: "Company", links: ["About", "Careers", "Press", "Investor relations"] },
    { title: "Support", links: ["Help center", "Contact", "Fees", "Account security"] },
  ];

  const badges = [
    { label: "Bank-level encryption", path: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" },
    { label: "Two-factor auth", path: "M7 11V7a5 5 0 0 1 10 0v4M5 11h14v11H5z" },
  ];

  return (
    <footer className="bg-[#06231c] text-emerald-100/70">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2" aria-label="Evergreen home">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-emerald-400 font-bold text-[#06231c]">E</span>
              <span className="text-lg font-semibold text-white">Evergreen</span>
            </a>
            <ul className="mt-6 space-y-3 text-sm">
              {badges.map((b) => (
                <li key={b.label} className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d={b.path} />
                  </svg>
                  {b.label}
                </li>
              ))}
            </ul>
          </div>
          {groups.map((g) => (
            <nav key={g.title} aria-labelledby={`f19-${g.title}`}>
              <h2 id={`f19-${g.title}`} className="text-sm font-semibold text-white">
                {g.title}
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {g.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="hover:text-emerald-300">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <section aria-labelledby="f19-disc" className="mt-14 rounded-xl border border-emerald-900 bg-emerald-950/40 p-6">
          <h2 id="f19-disc" className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Important disclosures
          </h2>
          <div className="mt-3 space-y-3 text-xs leading-5 text-emerald-100/50">
            <p>
              Investing involves risk, including possible loss of principal. Past performance does not guarantee future results.
              The value of investments may fluctuate and you may get back less than you invested.
            </p>
            <p>
              Evergreen is a fictional company shown for demonstration. Nothing on this site constitutes an offer, solicitation or
              recommendation to buy or sell any security. Please read all relevant documents carefully before investing.
            </p>
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-3 text-xs sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Evergreen Financial, Inc.</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {["Privacy", "Terms of use", "Customer agreement", "Form CRS"].map((l) => (
              <li key={l}>
                <a href="#" className="hover:text-white">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
