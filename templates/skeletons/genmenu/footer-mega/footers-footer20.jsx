// Footer20 — Neo-brutalist bento grid · playful yellow + black
import React from "react";

export default function Footer20() {
  const groups = [
    { title: "Make", links: ["Templates", "Stickers", "Fonts", "Mockups"] },
    { title: "Learn", links: ["Tutorials", "Live classes", "Challenges"] },
    { title: "Us", links: ["Manifesto", "Jobs", "Contact"] },
  ];

  return (
    <footer className="bg-yellow-300 p-4 text-black sm:p-6">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
        <div className="border-4 border-black bg-white p-6 shadow-[6px_6px_0_0_#000] md:col-span-2 md:row-span-2">
          <a href="#" className="inline-flex items-center gap-3" aria-label="Zine home">
            <span className="grid h-14 w-14 place-items-center border-4 border-black bg-pink-400 text-3xl font-black">Z</span>
            <span className="text-4xl font-black uppercase tracking-tight">Zine</span>
          </a>
          <p className="mt-6 text-2xl font-bold leading-tight">
            Loud tools for <span className="bg-black px-1 text-yellow-300">weird</span> creative people.
          </p>
          <a
            href="#"
            className="mt-8 inline-flex items-center gap-2 border-4 border-black bg-lime-400 px-5 py-3 font-black uppercase shadow-[4px_4px_0_0_#000] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            Join free
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>

        {groups.map((g, i) => (
          <nav
            key={g.title}
            aria-labelledby={`f20-${g.title}`}
            className={`border-4 border-black p-5 shadow-[6px_6px_0_0_#000] ${["bg-sky-300", "bg-orange-300", "bg-violet-300"][i]}`}
          >
            <h2 id={`f20-${g.title}`} className="text-xl font-black uppercase">
              {g.title}
            </h2>
            <ul className="mt-3 space-y-1 font-bold">
              {g.links.map((l) => (
                <li key={l}>
                  <a href="#" className="inline-block px-1 hover:bg-black hover:text-yellow-300">
                    → {l}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <a
          href="#top"
          className="group grid place-items-center border-4 border-black bg-black p-5 text-yellow-300 shadow-[6px_6px_0_0_#000] hover:bg-pink-400 hover:text-black"
          aria-label="Back to top"
        >
          <svg viewBox="0 0 24 24" className="h-12 w-12 transition group-hover:-translate-y-2" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
            <path d="M12 20V4M5 11l7-7 7 7" />
          </svg>
        </a>

        <p className="border-4 border-black bg-white px-5 py-3 text-sm font-bold uppercase md:col-span-4">
          © {new Date().getFullYear()} Zine Collective — no rights reserved, steal like an artist.
        </p>
      </div>
    </footer>
  );
}
