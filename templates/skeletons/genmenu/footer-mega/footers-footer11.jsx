// Footer11 — Coloured band (lime) · café info columns with hours
import React from "react";

export default function Footer11() {
  const hours = [
    ["Mon – Fri", "7:00 – 18:00"],
    ["Saturday", "8:00 – 17:00"],
    ["Sunday", "9:00 – 15:00"],
  ];
  const groups = [
    { title: "Menu", links: ["Breakfast", "Lunch", "Bakery", "Coffee & tea", "Catering"] },
    { title: "Visit", links: ["Find us", "Book a table", "Private events", "Gift cards"] },
  ];

  return (
    <footer className="bg-lime-300 text-lime-950">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col gap-6 border-b-2 border-lime-950 pb-10 md:flex-row md:items-center md:justify-between">
          <a href="#" className="flex items-center gap-3" aria-label="Crumb Café home">
            <span className="grid h-14 w-14 place-items-center rounded-full border-2 border-lime-950 bg-lime-950 font-serif text-2xl italic text-lime-300">
              c
            </span>
            <span className="font-serif text-4xl italic">crumb café</span>
          </a>
          <p className="max-w-sm text-lg font-medium">Slow-proofed bread, strong coffee and a seat by the window.</p>
        </div>

        <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <section aria-labelledby="f11-hours">
            <h2 id="f11-hours" className="text-xs font-bold uppercase tracking-[0.2em]">
              Opening hours
            </h2>
            <dl className="mt-4 space-y-2">
              {hours.map(([day, time]) => (
                <div key={day} className="flex justify-between gap-4 border-b border-dashed border-lime-950/30 pb-2">
                  <dt>{day}</dt>
                  <dd className="font-semibold tabular-nums">{time}</dd>
                </div>
              ))}
            </dl>
          </section>

          {groups.map((g) => (
            <nav key={g.title} aria-labelledby={`f11-${g.title}`}>
              <h2 id={`f11-${g.title}`} className="text-xs font-bold uppercase tracking-[0.2em]">
                {g.title}
              </h2>
              <ul className="mt-4 space-y-2">
                {g.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="decoration-2 underline-offset-4 hover:underline">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <section aria-labelledby="f11-find">
            <h2 id="f11-find" className="text-xs font-bold uppercase tracking-[0.2em]">
              Find us
            </h2>
            <address className="mt-4 not-italic leading-7">
              14 Mill Lane
              <br />
              Brighton BN1 4GH
              <br />
              <a href="tel:+441273555019" className="font-semibold hover:underline">
                01273 555 019
              </a>
            </address>
          </section>
        </div>

        <p className="mt-14 text-sm">© {new Date().getFullYear()} Crumb Café Ltd. Baked fresh daily.</p>
      </div>
    </footer>
  );
}
