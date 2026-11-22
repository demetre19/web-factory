// Footer5 — App badges + social icons · dark
import React from "react";

const socials = [
  {
    name: "Instagram",
    icon: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <path d="M17.5 6.5h.01" />
      </>
    ),
  },
  {
    name: "YouTube",
    icon: (
      <>
        <path d="M2.5 17a24 24 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24 24 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
        <path d="m10 15 5-3-5-3z" />
      </>
    ),
  },
  {
    name: "Facebook",
    icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  },
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
    name: "TikTok",
    icon: <path d="M9 12a4 4 0 1 0 4 4V2a5 5 0 0 0 5 5" />,
  },
];

export default function Footer5() {
  const groups = [
    { title: "App", links: ["Features", "Workouts", "Coaches", "Pricing"] },
    { title: "Support", links: ["Help center", "Device sync", "Contact us"] },
    { title: "Company", links: ["About", "Careers", "Privacy", "Terms"] },
  ];

  return (
    <footer className="bg-neutral-950 text-neutral-400">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-2">
          <section aria-labelledby="f5-app">
            <a href="#" className="flex items-center gap-2" aria-label="Pulse home">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-orange-400 text-lg font-black text-white">
                P
              </span>
              <span className="text-xl font-bold text-white">Pulse</span>
            </a>
            <h2 id="f5-app" className="mt-6 text-2xl font-semibold text-white">
              Train anywhere. Get the app.
            </h2>
            <ul className="mt-6 flex flex-wrap gap-3">
              <li>
                <a
                  href="#"
                  className="flex items-center gap-3 rounded-xl border border-neutral-700 bg-black px-4 py-2.5 text-white hover:border-neutral-500"
                >
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
                    <path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9s-1.8-.8-3-.8C6.9 7.4 5.4 8.3 4.6 9.8c-1.7 2.9-.4 7.2 1.2 9.6.8 1.2 1.7 2.4 2.9 2.4 1.2 0 1.6-.8 3-.8s1.8.8 3 .7c1.3 0 2.1-1.2 2.8-2.3.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.4-.9-2.4-4.1zM14.2 5.6c.6-.8 1.1-1.8 1-2.9-.9 0-2.1.6-2.7 1.4-.6.7-1.1 1.8-1 2.8 1 .1 2.1-.5 2.7-1.3z" />
                  </svg>
                  <span className="leading-tight">
                    <span className="block text-[10px] uppercase tracking-wide text-neutral-400">Download on the</span>
                    <span className="block text-base font-semibold">App Store</span>
                  </span>
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center gap-3 rounded-xl border border-neutral-700 bg-black px-4 py-2.5 text-white hover:border-neutral-500"
                >
                  <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden="true">
                    <path d="M4 3.5v17a1 1 0 0 0 1.5.86L13 17 5.5 2.64A1 1 0 0 0 4 3.5z" fill="#34d399" />
                    <path d="M5.5 2.64 13 7l3 1.8-3 3.2z" fill="#60a5fa" />
                    <path d="M13 17l3-1.8L13 12l-7.5 9.36z" fill="#f87171" />
                    <path d="M16 8.8l4 2.34a1 1 0 0 1 0 1.72L16 15.2 13 12z" fill="#facc15" />
                  </svg>
                  <span className="leading-tight">
                    <span className="block text-[10px] uppercase tracking-wide text-neutral-400">Get it on</span>
                    <span className="block text-base font-semibold">Google Play</span>
                  </span>
                </a>
              </li>
            </ul>
          </section>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {groups.map((g) => (
              <nav key={g.title} aria-labelledby={`f5-${g.title}`}>
                <h2 id={`f5-${g.title}`} className="text-sm font-semibold text-white">
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

        <div className="mt-14 flex flex-col items-center gap-6 border-t border-neutral-800 pt-8 sm:flex-row sm:justify-between">
          <p className="text-sm">© {new Date().getFullYear()} Pulse Fitness</p>
          <nav aria-label="Social media">
            <ul className="flex gap-2">
              {socials.map((s) => (
                <li key={s.name}>
                  <a
                    href="#"
                    aria-label={s.name}
                    className="grid h-10 w-10 place-items-center rounded-full bg-neutral-900 text-neutral-300 transition hover:bg-gradient-to-br hover:from-fuchsia-500 hover:to-orange-400 hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {s.icon}
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
