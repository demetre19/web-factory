// Footer1 — 4-column classic · light · professional
import React from "react";

export default function Footer1() {
  const groups = [
    { title: "Product", links: ["Features", "Pricing", "Integrations", "Changelog", "Roadmap"] },
    { title: "Company", links: ["About", "Careers", "Press", "Partners", "Contact"] },
    { title: "Resources", links: ["Documentation", "Guides", "Blog", "Community", "Webinars"] },
    { title: "Legal", links: ["Privacy", "Terms", "Cookies", "Licenses", "Security"] },
  ];

  return (
    <footer className="border-t border-gray-200 bg-white text-gray-600">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {groups.map((group) => (
            <nav key={group.title} aria-labelledby={`f1-${group.title}`}>
              <h2 id={`f1-${group.title}`} className="text-sm font-semibold text-gray-900">
                {group.title}
              </h2>
              <ul className="mt-4 space-y-3 text-sm">
                {group.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="transition-colors hover:text-gray-900">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-gray-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <a href="#" className="flex items-center gap-2" aria-label="Northwind home">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-gray-900 text-sm font-bold text-white">
              N
            </span>
            <span className="font-semibold text-gray-900">Northwind</span>
          </a>
          <p className="text-sm">© {new Date().getFullYear()} Northwind Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
