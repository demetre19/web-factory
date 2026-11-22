// Footer13 — Giant wordmark · dark editorial
import React from "react";

export default function Footer13() {
  const groups = [
    { title: "Studio", links: ["Work", "Services", "Approach", "Team"] },
    { title: "Connect", links: ["Instagram", "Dribbble", "LinkedIn", "Newsletter"] },
    { title: "Info", links: ["Careers", "Press kit", "Privacy", "Imprint"] },
  ];

  return (
    <footer className="overflow-hidden bg-black text-neutral-400">
      <div className="mx-auto max-w-7xl px-6 pt-16">
        <div className="grid gap-12 md:grid-cols-5">
          <section aria-labelledby="f13-hello" className="md:col-span-2">
            <h2 id="f13-hello" className="text-xs uppercase tracking-[0.25em] text-neutral-500">
              New business
            </h2>
            <a href="mailto:hello@example.com" className="mt-4 inline-block text-3xl font-medium text-white underline decoration-neutral-700 underline-offset-8 hover:decoration-white">
              hello@atlas.studio
            </a>
          </section>
          {groups.map((g) => (
            <nav key={g.title} aria-labelledby={`f13-${g.title}`}>
              <h2 id={`f13-${g.title}`} className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                {g.title}
              </h2>
              <ul className="mt-4 space-y-2">
                {g.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="group inline-flex items-center gap-1 text-neutral-300 hover:text-white">
                      {l}
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M7 17 17 7M8 7h9v9" />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-16 flex flex-col justify-between gap-2 border-t border-neutral-800 pt-6 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} Atlas Studio — Lisbon / Berlin</p>
          <p>Independent design &amp; brand practice</p>
        </div>
      </div>

      <p
        aria-hidden="true"
        className="select-none whitespace-nowrap text-center text-[22vw] font-black leading-[0.8] tracking-tighter text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.35)] translate-y-[12%]"
      >
        ATLAS
      </p>
    </footer>
  );
}
