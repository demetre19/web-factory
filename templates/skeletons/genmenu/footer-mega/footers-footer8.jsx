// Footer8 — Logo left + 3 link groups · light · emerald accent
import React from "react";

export default function Footer8() {
  const groups = [
    { title: "Explore", links: ["How it works", "Impact report", "Our farms", "Recipes"] },
    { title: "Shop", links: ["Weekly box", "Gift cards", "Bulk orders", "Delivery areas"] },
    { title: "Help", links: ["FAQ", "Track order", "Returns", "Contact"] },
  ];

  return (
    <footer className="border-t-4 border-emerald-500 bg-white text-gray-600">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <a href="#" className="inline-flex items-center gap-3" aria-label="Greenbox home">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-500 text-xl font-bold text-white">G</span>
              <span className="text-2xl font-bold tracking-tight text-gray-900">Greenbox</span>
            </a>
            <p className="mt-5 max-w-sm leading-7">
              Seasonal produce from local farms, delivered in reusable boxes. Good for you, better for the planet.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z" />
                <path d="M2 21c0-3 1.9-5.4 5.2-6" />
              </svg>
              Carbon-neutral delivery
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-3">
            {groups.map((g) => (
              <nav key={g.title} aria-labelledby={`f8-${g.title}`}>
                <h2 id={`f8-${g.title}`} className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                  {g.title}
                </h2>
                <ul className="mt-5 space-y-3">
                  {g.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="hover:text-emerald-600">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-gray-100 pt-8 text-sm text-gray-500 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Greenbox Co-op</p>
          <ul className="flex gap-6">
            <li><a href="#" className="hover:text-gray-900">Privacy</a></li>
            <li><a href="#" className="hover:text-gray-900">Terms</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
