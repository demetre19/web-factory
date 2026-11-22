// Footer15 — Service strip + columns + payment row · warm light e-commerce
import React from "react";

function Icon({ children }) {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 shrink-0 text-amber-700" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export default function Footer15() {
  const perks = [
    {
      title: "Free shipping",
      text: "On orders over $75",
      icon: (
        <>
          <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </>
      ),
    },
    {
      title: "60-day returns",
      text: "No questions asked",
      icon: (
        <>
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </>
      ),
    },
    {
      title: "Secure checkout",
      text: "256-bit encryption",
      icon: (
        <>
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </>
      ),
    },
    {
      title: "Real humans",
      text: "Chat 7 days a week",
      icon: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
    },
  ];

  const groups = [
    { title: "Shop", links: ["Women", "Men", "Kids", "Accessories", "Gift guide"] },
    { title: "Help", links: ["Size guide", "Shipping", "Returns", "Track order"] },
    { title: "Company", links: ["Our story", "Sustainability", "Stores", "Careers"] },
  ];

  const payments = ["VISA", "Mastercard", "AMEX", "PayPal", "Apple Pay", "Klarna"];

  return (
    <footer className="bg-stone-50 text-stone-600">
      <section aria-label="Our promises" className="border-y border-stone-200 bg-amber-50/60">
        <ul className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {perks.map((p) => (
            <li key={p.title} className="flex items-center gap-4">
              <Icon>{p.icon}</Icon>
              <div>
                <p className="font-semibold text-stone-900">{p.title}</p>
                <p className="text-sm">{p.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <a href="#" className="font-serif text-3xl text-stone-900" aria-label="Thread & Oak home">
              <span className="text-amber-700">T</span>hread &amp; Oak
            </a>
            <p className="mt-4 max-w-sm text-sm leading-6">
              Durable everyday clothing made from natural fibres, built to be worn for years.
            </p>
          </div>
          {groups.map((g) => (
            <nav key={g.title} aria-labelledby={`f15-${g.title}`}>
              <h2 id={`f15-${g.title}`} className="text-sm font-semibold text-stone-900">
                {g.title}
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {g.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="hover:text-amber-700">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-stone-200 pt-8 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm">© {new Date().getFullYear()} Thread &amp; Oak Ltd.</p>
          <ul className="flex flex-wrap gap-2" aria-label="Accepted payment methods">
            {payments.map((p) => (
              <li key={p} className="rounded border border-stone-300 bg-white px-2.5 py-1 text-[11px] font-bold tracking-wide text-stone-700">
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
