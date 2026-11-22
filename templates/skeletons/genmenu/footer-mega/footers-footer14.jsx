// Footer14 — Developer tool · dark mono · system status + install command
import React, { useState } from "react";

export default function Footer14() {
  const [copied, setCopied] = useState(false);
  const cmd = "npm i -g forge-cli";

  const groups = [
    { title: "product", links: ["features", "pricing", "enterprise", "changelog"] },
    { title: "docs", links: ["quickstart", "cli reference", "api", "examples"] },
    { title: "community", links: ["github", "discord", "rfcs", "showcase"] },
    { title: "company", links: ["about", "blog", "careers", "security"] },
  ];

  const copy = () => {
    navigator.clipboard?.writeText(cmd).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <footer className="bg-zinc-950 font-mono text-sm text-zinc-400">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-12 lg:grid-cols-3">
          <div>
            <a href="#" className="flex items-center gap-2 text-zinc-100" aria-label="Forge home">
              <span className="grid h-8 w-8 place-items-center rounded border border-zinc-700 bg-zinc-900 font-bold text-orange-400">
                f
              </span>
              <span className="font-semibold">forge</span>
              <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">v4.2.0</span>
            </a>
            <div className="mt-6 flex items-center justify-between gap-3 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2.5">
              <code className="truncate text-zinc-200">
                <span className="select-none text-orange-400">$ </span>
                {cmd}
              </code>
              <button type="button" onClick={copy} aria-label="Copy install command" className="shrink-0 rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200">
                {copied ? (
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )}
              </button>
            </div>
            <a href="#" className="mt-4 inline-flex items-center gap-2 rounded-full border border-zinc-800 px-3 py-1 text-xs hover:border-zinc-600">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              all systems operational
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-2">
            {groups.map((g) => (
              <nav key={g.title} aria-labelledby={`f14-${g.title}`}>
                <h2 id={`f14-${g.title}`} className="text-zinc-100">
                  <span className="text-zinc-600">/</span>
                  {g.title}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {g.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="hover:text-orange-400">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-dashed border-zinc-800 pt-6 text-xs text-zinc-500 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} forge labs · MIT licensed</p>
          <p>
            built with <span className="text-orange-400">&lt;3</span> and too much coffee
          </p>
        </div>
      </div>
    </footer>
  );
}
