// Footer12 — Playful wave top · sky blue · pill links
import React from "react";

export default function Footer12() {
  const groups = [
    { title: "Learn", links: ["Maths games", "Reading", "Science", "Coding"], color: "bg-yellow-300 text-yellow-950" },
    { title: "Grown-ups", links: ["Parents", "Teachers", "Pricing", "Safety"], color: "bg-pink-300 text-pink-950" },
    { title: "Doodle", links: ["About us", "Careers", "Help", "Contact"], color: "bg-lime-300 text-lime-950" },
  ];

  return (
    <footer className="relative mt-16 bg-sky-500 text-white">
      <svg className="absolute bottom-full left-0 h-16 w-full text-sky-500" viewBox="0 0 1440 80" preserveAspectRatio="none" fill="currentColor" aria-hidden="true">
        <path d="M0 40c120-40 240-40 360 0s240 40 360 0 240-40 360 0 240 40 360 0v40H0z" />
      </svg>

      <div className="mx-auto max-w-7xl px-6 pb-12 pt-8">
        <div className="grid gap-12 lg:grid-cols-4">
          <div>
            <a href="#" className="inline-flex items-center gap-3" aria-label="Doodle home">
              <span className="grid h-14 w-14 rotate-12 place-items-center rounded-2xl bg-yellow-300 text-3xl font-black text-sky-700 shadow-lg">
                D
              </span>
              <span className="text-3xl font-black tracking-tight">doodle</span>
            </a>
            <p className="mt-5 text-lg font-medium text-sky-50">Learning that feels like playtime, for ages 4–10.</p>
          </div>

          {groups.map((g) => (
            <nav key={g.title} aria-labelledby={`f12-${g.title}`}>
              <h2 id={`f12-${g.title}`} className={`inline-block -rotate-2 rounded-lg px-3 py-1 text-lg font-black ${g.color}`}>
                {g.title}
              </h2>
              <ul className="mt-5 flex flex-wrap gap-2 lg:flex-col lg:items-start">
                {g.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="inline-block rounded-full bg-white/15 px-4 py-1.5 font-semibold transition hover:scale-105 hover:bg-white hover:text-sky-700">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center gap-4 rounded-3xl bg-sky-600/60 px-6 py-5 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="flex items-center gap-2 font-semibold">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-yellow-300" fill="currentColor" aria-hidden="true">
              <path d="m12 2 2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17l-6.1 3.4 1.5-6.8L2.2 9l6.9-.7z" />
            </svg>
            Ad-free and kid-safe. Always.
          </p>
          <p className="text-sm text-sky-100">© {new Date().getFullYear()} Doodle Learning Co.</p>
        </div>
      </div>
    </footer>
  );
}
