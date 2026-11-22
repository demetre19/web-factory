// Footer10 — Stacked centered · playful pastel
import React from "react";

export default function Footer10() {
  const links = ["Shop", "Our story", "Workshops", "Stockists", "FAQ", "Contact"];
  const socials = [
    {
      name: "Instagram",
      bg: "bg-pink-200 hover:bg-pink-300",
      icon: (
        <>
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <path d="M17.5 6.5h.01" />
        </>
      ),
    },
    {
      name: "Pinterest",
      bg: "bg-amber-200 hover:bg-amber-300",
      icon: (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M11 8.5c2.5-1 5 .5 4.5 3s-3 3-4 2M11 8.5 9 21" />
        </>
      ),
    },
    {
      name: "YouTube",
      bg: "bg-sky-200 hover:bg-sky-300",
      icon: (
        <>
          <rect x="2" y="5" width="20" height="14" rx="4" />
          <path d="m10 15 5-3-5-3z" />
        </>
      ),
    },
  ];

  return (
    <footer className="bg-rose-50 text-rose-950">
      <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-16 text-center">
        <a href="#" aria-label="Pip & Posy home" className="group">
          <span className="grid h-16 w-16 rotate-[-6deg] place-items-center rounded-[1.25rem] bg-rose-400 text-3xl font-black text-white shadow-[4px_4px_0_0_#881337] transition group-hover:rotate-6">
            P
          </span>
        </a>
        <p className="mt-5 text-2xl font-extrabold tracking-tight">Pip &amp; Posy</p>
        <p className="mt-2 max-w-md text-rose-800/80">Little handmade things to brighten big days.</p>

        <nav aria-label="Footer" className="mt-8">
          <h2 className="sr-only">Footer navigation</h2>
          <ul className="flex flex-wrap justify-center gap-2">
            {links.map((l) => (
              <li key={l}>
                <a href="#" className="block rounded-full px-4 py-1.5 font-semibold hover:bg-rose-200">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="mt-8 flex gap-3" aria-label="Social media">
          {socials.map((s) => (
            <li key={s.name}>
              <a href="#" aria-label={s.name} className={`grid h-11 w-11 place-items-center rounded-full ${s.bg} transition hover:-translate-y-1`}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {s.icon}
                </svg>
              </a>
            </li>
          ))}
        </ul>

        <p className="mt-10 flex items-center gap-1.5 text-sm text-rose-800/70">
          © {new Date().getFullYear()} Pip &amp; Posy · Made with
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-rose-500" fill="currentColor" aria-label="love" role="img">
            <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.3 2.4.7-1.2 2.2-2.4 4.3-2.4 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" />
          </svg>
          in Bristol
        </p>
      </div>
    </footer>
  );
}
