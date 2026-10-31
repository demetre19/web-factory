// Site facts for Header/Footer. The S5 build lane overwrites every field
// from site/site-brief.md — NAP is REQUIRED in the footer (S5 spec).
export interface NavItem {
  /** Shortened label — fits the mobile bar. The URL/H1/title lock does
      not bind labels; shorten the route's long category H1 (S5 spec). */
  label: string;
  /** Route path — must match a ROUTE-MANIFEST.json path. */
  path: string;
}

export interface SiteFacts {
  name: string;
  /** Canonical origin — must equal astro.config.mjs `site`. */
  origin: string;
  phone: string;
  email: string;
  address: string;
  nav: NavItem[];
}

export const site: SiteFacts = {
  name: 'Example Site',
  origin: 'https://example.com',
  phone: '(000) 000-0000',
  email: 'hello@example.com',
  address: '1 Example St, Exampletown',
  nav: [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services/' },
    { label: 'About', path: '/about/' },
    { label: 'Contact', path: '/contact/' },
  ],
};
