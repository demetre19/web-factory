// Footer17 — Accordion groups on mobile, columns on desktop · light · back-to-top
import React, { useState } from "react";

export default function Footer17() {
  const [open, setOpen] = useState(null);

  const groups = [
    { title: "Banking", links: ["Current accounts", "Savings", "Credit cards", "Loans", "Mortgages"] },
    { title: "Business", links: ["Business accounts", "Payments", "Invoicing", "Payroll"] },
    { title: "Support", links: ["Help centre", "Report fraud", "Accessibility", "Complaints"] },
    { title: "About", links: ["Who we are", "Careers", "Investors", "Newsroom"] },
  ];

  return (
    <footer className="bg-gray-50 text-gray-600">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="flex items-center justify-between">
          <a href="#" className="flex items-center gap-2" aria-label="Tidal Bank home">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-teal-600 font-bold text-white">T</span>
            <span className="text-lg font-semibold text-gray-900">Tidal</span>
          </a>
          <a href="#top" className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:border-teal-600 hover:text-teal-700">
            Back to top
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </a>
        </div>

        <div className="mt-10 divide-y divide-gray-200 border-y border-gray-200 md:grid md:grid-cols-4 md:gap-8 md:divide-y-0 md:border-0">
          {groups.map((g, i) => {
            const isOpen = open === i;
            return (
              <nav key={g.title} aria-labelledby={`f17-h-${i}`}>
                <h2 id={`f17-h-${i}`} className="text-sm font-semibold text-gray-900">
                  {/* Mobile toggle */}
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-4 md:hidden"
                    aria-expanded={isOpen}
                    aria-controls={`f17-list-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    {g.title}
                    <svg viewBox="0 0 24 24" className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? "rotate-45" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </button>
                  {/* Desktop label */}
                  <span className="hidden md:block">{g.title}</span>
                </h2>
                <ul id={`f17-list-${i}`} className={`space-y-3 pb-5 text-sm md:mt-4 md:block md:pb-0 ${isOpen ? "block" : "hidden"}`}>
                  {g.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="hover:text-teal-700">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            );
          })}
        </div>

        <div className="mt-10 space-y-3 text-xs leading-5 text-gray-500 md:mt-14 md:border-t md:border-gray-200 md:pt-8">
          <p>
            Tidal is a trading name of Tidal Financial Ltd. This is a fictional example institution used for design purposes only.
          </p>
          <p>© {new Date().getFullYear()} Tidal Financial Ltd.</p>
        </div>
      </div>
    </footer>
  );
}
