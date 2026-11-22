// Footer3 — Minimal single row · minimal border-top
import React from "react";

export default function Footer3() {
  const links = ["About", "Journal", "Privacy", "Terms", "Contact"];

  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-6 text-sm text-neutral-500 md:flex-row md:justify-between">
        <a href="#" className="flex items-center gap-2 text-neutral-900" aria-label="Mono home">
          <span className="grid h-6 w-6 place-items-center rounded-full border border-neutral-900 text-[11px] font-semibold">
            m
          </span>
          <span className="font-medium tracking-tight">mono</span>
        </a>

        <nav aria-label="Footer">
          <h2 className="sr-only">Footer navigation</h2>
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {links.map((link) => (
              <li key={link}>
                <a href="#" className="hover:text-neutral-900 hover:underline hover:underline-offset-4">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <p>© {new Date().getFullYear()} Mono Studio</p>
      </div>
    </footer>
  );
}
