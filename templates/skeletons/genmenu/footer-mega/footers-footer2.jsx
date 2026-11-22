// Footer2 — Mega footer with newsletter block · dark
import React from "react";

export default function Footer2() {
  const groups = [
    { title: "Solutions", links: ["Marketing", "Analytics", "Commerce", "Insights", "Automation"] },
    { title: "Support", links: ["Pricing", "Documentation", "Guides", "API status", "Help center"] },
    { title: "Company", links: ["About", "Blog", "Jobs", "Press", "Partners"] },
    { title: "Legal", links: ["Claim", "Privacy", "Terms", "DPA", "Accessibility"] },
  ];

  const social = [
    {
      name: "X",
      icon: (
        <>
          <path d="M4 4l11.7 16H20L8.3 4H4z" />
          <path d="M4 20l6.8-6.8M13.2 10.8 20 4" />
        </>
      ),
    },
    {
      name: "GitHub",
      icon: (
        <>
          <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
          <path d="M9 18c-4.51 2-5-2-7-2" />
        </>
      ),
    },
    {
      name: "LinkedIn",
      icon: (
        <>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </>
      ),
    },
  ];

  return (
    <footer className="bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-6 pb-10 pt-16">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Newsletter block */}
          <section aria-labelledby="f2-news" className="lg:col-span-5">
            <a href="#" className="flex items-center gap-2" aria-label="Vertex home">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 font-bold text-white">
                V
              </span>
              <span className="text-lg font-semibold text-white">Vertex</span>
            </a>
            <h2 id="f2-news" className="mt-8 text-xl font-semibold text-white">
              Subscribe to the Vertex Digest
            </h2>
            <p className="mt-2 max-w-md text-sm leading-6">
              Product news, deep dives and growth playbooks — one email, every other Tuesday.
            </p>
            <form className="mt-6 flex max-w-md flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
              <label htmlFor="f2-email" className="sr-only">
                Email address
              </label>
              <input
                id="f2-email"
                type="email"
                required
                placeholder="you@company.com"
                className="w-full min-w-0 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30"
              />
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-300"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-3 text-xs text-slate-500">No spam. Unsubscribe any time.</p>
          </section>

          {/* Link groups */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-7">
            {groups.map((group) => (
              <nav key={group.title} aria-labelledby={`f2-${group.title}`}>
                <h2 id={`f2-${group.title}`} className="text-xs font-semibold uppercase tracking-wider text-white">
                  {group.title}
                </h2>
                <ul className="mt-5 space-y-3 text-sm">
                  {group.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="hover:text-white">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col-reverse gap-6 border-t border-slate-800 pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-xs">© {new Date().getFullYear()} Vertex Labs, Inc.</p>
          <ul className="flex gap-3">
            {social.map((s) => (
              <li key={s.name}>
                <a
                  href="#"
                  aria-label={s.name}
                  className="grid h-9 w-9 place-items-center rounded-full border border-slate-800 hover:border-slate-600 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {s.icon}
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
