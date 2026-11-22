// Footer18 — Floating card footer · professional violet on light canvas
import React from "react";

export default function Footer18() {
  const groups = [
    { title: "Platform", links: ["Scheduling", "Payroll", "Time tracking", "Reporting"] },
    { title: "Resources", links: ["Customer stories", "HR templates", "Webinars", "API docs"] },
    { title: "Company", links: ["About", "Careers", "Trust center", "Contact"] },
  ];

  return (
    <footer className="bg-gray-100 px-4 pb-4 pt-16 sm:px-6 sm:pb-6">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-violet-950 text-violet-200 shadow-xl">
        <div className="grid gap-12 p-8 sm:p-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-3" aria-label="Shiftly home">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-400 text-lg font-bold text-violet-950">S</span>
              <span className="text-xl font-semibold text-white">Shiftly</span>
            </a>
            <p className="mt-5 max-w-sm leading-7 text-violet-300">
              Workforce management for teams that never stand still. Trusted by 12,000+ businesses.
            </p>
            <div className="mt-8 rounded-2xl bg-violet-900/60 p-5 ring-1 ring-violet-800">
              <p className="font-semibold text-white">Need a tailored plan?</p>
              <p className="mt-1 text-sm text-violet-300">Our team replies within one business day.</p>
              <a href="#" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-violet-400 px-4 py-2 text-sm font-semibold text-violet-950 hover:bg-violet-300">
                Contact sales
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-3">
            {groups.map((g) => (
              <nav key={g.title} aria-labelledby={`f18-${g.title}`}>
                <h2 id={`f18-${g.title}`} className="text-sm font-semibold text-white">
                  {g.title}
                </h2>
                <ul className="mt-4 space-y-3 text-sm">
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
        </div>

        <div className="flex flex-col gap-4 border-t border-violet-900 px-8 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-12">
          <p>© {new Date().getFullYear()} Shiftly Inc.</p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <li className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-violet-400" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
              <a href="#" className="hover:text-white">SOC 2 Type II</a>
            </li>
            <li><a href="#" className="hover:text-white">Privacy</a></li>
            <li><a href="#" className="hover:text-white">Terms</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
