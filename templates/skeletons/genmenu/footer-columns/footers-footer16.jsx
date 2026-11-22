// Footer16 — Office locations grid · minimal serif · light
import React from "react";

export default function Footer16() {
  const offices = [
    { city: "London", tz: "GMT", lines: ["12 Clerkenwell Green", "London EC1R 0DP"], phone: "+44 20 5550 1234" },
    { city: "New York", tz: "EST", lines: ["88 Greenwich Street, Fl 4", "New York, NY 10006"], phone: "+1 212 555 0188" },
    { city: "Singapore", tz: "SGT", lines: ["5 Keong Saik Road", "Singapore 089112"], phone: "+65 5550 2468" },
  ];
  const links = ["Projects", "Practice", "Publications", "People", "Careers", "Contact"];

  return (
    <footer className="border-t border-stone-300 bg-[#f7f5f0] text-stone-700">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
          <a href="#" className="flex items-baseline gap-3" aria-label="Okoro Architects home">
            <span className="font-serif text-5xl leading-none text-stone-900">O</span>
            <span className="text-xs uppercase tracking-[0.3em]">Okoro Architects</span>
          </a>
          <nav aria-label="Footer">
            <h2 className="sr-only">Site</h2>
            <ul className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm sm:grid-cols-3">
              {links.map((l) => (
                <li key={l}>
                  <a href="#" className="border-b border-transparent hover:border-stone-900 hover:text-stone-900">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <section aria-labelledby="f16-studios" className="mt-16">
          <h2 id="f16-studios" className="text-xs uppercase tracking-[0.3em] text-stone-500">
            Studios
          </h2>
          <ul className="mt-6 grid gap-px overflow-hidden border border-stone-300 bg-stone-300 md:grid-cols-3">
            {offices.map((o) => (
              <li key={o.city} className="bg-[#f7f5f0] p-6">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-serif text-2xl text-stone-900">{o.city}</h3>
                  <span className="text-xs tracking-widest text-stone-500">{o.tz}</span>
                </div>
                <address className="mt-4 text-sm not-italic leading-6">
                  {o.lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                  <a href={`tel:${o.phone.replace(/\s/g, "")}`} className="mt-2 block hover:text-stone-900 hover:underline">
                    {o.phone}
                  </a>
                </address>
                <a href="#" className="mt-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-stone-900 hover:gap-2.5">
                  Directions
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition-all" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-12 text-xs text-stone-500">© {new Date().getFullYear()} Okoro Architects LLP · RIBA Chartered Practice</p>
      </div>
    </footer>
  );
}
