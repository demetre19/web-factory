// Footer4 — Sitemap tree · light slate · professional
import React from "react";

const sitemap = [
  {
    label: "Platform",
    children: [
      { label: "Overview" },
      { label: "Analytics", children: [{ label: "Dashboards" }, { label: "Reports" }, { label: "Alerts" }] },
      { label: "Automation", children: [{ label: "Workflows" }, { label: "Triggers" }] },
    ],
  },
  {
    label: "Solutions",
    children: [
      { label: "By industry", children: [{ label: "Healthcare" }, { label: "Retail" }, { label: "Finance" }] },
      { label: "By team", children: [{ label: "Operations" }, { label: "Engineering" }] },
    ],
  },
  {
    label: "Developers",
    children: [
      { label: "API reference" },
      { label: "SDKs", children: [{ label: "JavaScript" }, { label: "Python" }, { label: "Go" }] },
      { label: "Webhooks" },
    ],
  },
  {
    label: "Company",
    children: [
      { label: "About" },
      { label: "Careers", children: [{ label: "Open roles" }, { label: "Culture" }] },
      { label: "Newsroom" },
    ],
  },
];

function Branch({ items, depth }) {
  return (
    <ul className={depth === 0 ? "mt-4 space-y-2" : "ml-1.5 mt-2 space-y-2 border-l border-slate-300 pl-4"}>
      {items.map((item) => (
        <li
          key={item.label}
          className={
            depth === 0
              ? ""
              : "relative before:absolute before:-left-4 before:top-2.5 before:w-3 before:border-t before:border-slate-300"
          }
        >
          <a href="#" className="text-sm text-slate-600 hover:text-blue-700 hover:underline">
            {item.label}
          </a>
          {item.children && <Branch items={item.children} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  );
}

export default function Footer4() {
  return (
    <footer className="bg-slate-50 text-slate-600">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <a href="#" className="flex items-center gap-2" aria-label="Lattice home">
            <span className="grid h-9 w-9 place-items-center rounded bg-blue-700 font-bold text-white">L</span>
            <span className="text-lg font-semibold text-slate-900">Lattice</span>
          </a>
          <p className="text-sm text-slate-500">Full sitemap</p>
        </div>

        <nav aria-label="Sitemap" className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {sitemap.map((section) => (
            <div key={section.label}>
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-blue-700" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
                {section.label}
              </h2>
              <Branch items={section.children} depth={1} />
            </div>
          ))}
        </nav>

        <p className="mt-12 text-xs text-slate-500">© {new Date().getFullYear()} Lattice Systems Ltd.</p>
      </div>
    </footer>
  );
}
