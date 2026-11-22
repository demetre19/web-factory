// Footer6 — Contact details column · professional navy
import React from "react";

function Icon({ children }) {
  return (
    <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

export default function Footer6() {
  const groups = [
    { title: "Practice areas", links: ["Corporate law", "Litigation", "Real estate", "Employment", "Intellectual property"] },
    { title: "The firm", links: ["Our attorneys", "Case results", "Insights", "Careers", "Pro bono"] },
  ];

  return (
    <footer className="bg-[#0b1f3a] text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <a href="#" className="flex items-center gap-3" aria-label="Hale & Partners home">
            <span className="grid h-11 w-11 place-items-center border border-amber-300 font-serif text-xl text-amber-300">H</span>
            <span className="font-serif text-xl text-white">Hale &amp; Partners</span>
          </a>
          <p className="mt-5 text-sm leading-6 text-slate-400">
            Trusted counsel for businesses and families since 1987. Clear advice, decisive representation.
          </p>
        </div>

        {groups.map((g) => (
          <nav key={g.title} aria-labelledby={`f6-${g.title}`}>
            <h2 id={`f6-${g.title}`} className="font-serif text-lg text-white">
              {g.title}
            </h2>
            <ul className="mt-5 space-y-3 text-sm">
              {g.links.map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-amber-300">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <section aria-labelledby="f6-contact">
          <h2 id="f6-contact" className="font-serif text-lg text-white">
            Contact
          </h2>
          <address className="mt-5 not-italic">
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <Icon>
                  <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
                  <circle cx="12" cy="10" r="3" />
                </Icon>
                <span>
                  220 Harbor Street, Suite 900
                  <br />
                  Boston, MA 02110
                </span>
              </li>
              <li className="flex gap-3">
                <Icon>
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
                </Icon>
                <a href="tel:+16175550142" className="hover:text-amber-300">
                  (617) 555-0142
                </a>
              </li>
              <li className="flex gap-3">
                <Icon>
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-10 6L2 7" />
                </Icon>
                <a href="mailto:counsel@example.com" className="hover:text-amber-300">
                  counsel@example.com
                </a>
              </li>
              <li className="flex gap-3">
                <Icon>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </Icon>
                <span>
                  Mon–Fri 8:30am – 6:00pm
                  <br />
                  Weekends by appointment
                </span>
              </li>
            </ul>
          </address>
        </section>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-xs text-slate-400 md:flex-row md:justify-between">
          <p>© {new Date().getFullYear()} Hale &amp; Partners LLP. Attorney advertising.</p>
          <ul className="flex gap-5">
            {["Disclaimer", "Privacy", "Accessibility"].map((l) => (
              <li key={l}>
                <a href="#" className="hover:text-white">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
