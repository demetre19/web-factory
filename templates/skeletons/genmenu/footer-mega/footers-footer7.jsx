// Footer7 — CTA banner (big heading + button) above links · coloured indigo
import React from "react";

export default function Footer7() {
  const groups = [
    { title: "Product", links: ["Overview", "Deploys", "Previews", "Pricing"] },
    { title: "Developers", links: ["Docs", "CLI", "Templates", "Status"] },
    { title: "Company", links: ["About", "Customers", "Careers", "Contact"] },
    { title: "Legal", links: ["Privacy", "Terms", "SLA"] },
  ];

  return (
    <footer className="bg-indigo-950 text-indigo-200">
      {/* CTA banner */}
      <section aria-labelledby="f7-cta" className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600">
        <svg className="absolute -right-20 -top-20 h-80 w-80 text-white/10" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
          <circle cx="100" cy="100" r="40" />
          <circle cx="100" cy="100" r="65" />
          <circle cx="100" cy="100" r="90" />
        </svg>
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-8 px-6 py-20 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="f7-cta" className="max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Ready to ship faster?
            </h2>
            <p className="mt-4 max-w-xl text-lg text-indigo-100">
              Start free. Deploy your first project in under a minute — no credit card required.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a href="#" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-indigo-700 shadow-lg hover:bg-indigo-50">
              Start building
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <a href="#" className="rounded-full border border-white/40 px-6 py-3 font-semibold text-white hover:bg-white/10">
              Talk to sales
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-2" aria-label="Launchpad home">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white font-black text-indigo-700">L</span>
              <span className="font-semibold text-white">Launchpad</span>
            </a>
          </div>
          {groups.map((g) => (
            <nav key={g.title} aria-labelledby={`f7-${g.title}`}>
              <h2 id={`f7-${g.title}`} className="text-sm font-semibold text-white">
                {g.title}
              </h2>
              <ul className="mt-4 space-y-2.5 text-sm">
                {g.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="hover:text-white">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-12 border-t border-indigo-900 pt-6 text-sm text-indigo-300">
          © {new Date().getFullYear()} Launchpad Cloud, Inc.
        </p>
      </div>
    </footer>
  );
}
