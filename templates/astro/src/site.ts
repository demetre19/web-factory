// Site facts for Header/Footer. The S5 build lane overwrites every field
// from site/site-brief.md — NAP is REQUIRED in the footer (S5 spec).
export interface NavItem {
  /** Shortened label — fits the mobile bar. The URL/H1/title lock does
      not bind labels; shorten the route's long category H1 (S5 spec). */
  label: string;
  /** Route path — must match a ROUTE-MANIFEST.json path. */
  path: string;
}

export interface SocialProfile {
  /** Display label — e.g. "Facebook", "Instagram". */
  label: string;
  /** Profile URL — from site-brief.md `social_profiles`. */
  url: string;
}

export interface SiteFacts {
  name: string;
  /** Canonical origin — must equal astro.config.mjs `site`. */
  origin: string;
  phone: string;
  email: string;
  address: string;
  nav: NavItem[];
  /** Full route list for the footer's HTML sitemap — the build lane
      fills this from sitemap.md grouped by pillar/cluster. */
  sitemap: { label: string; path: string; group?: string }[];
  /** Social profiles — footer + /about/ + JSON-LD sameAs all render this list. */
  social: SocialProfile[];
  /** Site-relative brand logo path (e.g. "/logo.svg") — feeds JSON-LD `image`/`logo`. */
  logo?: string;
  /** One-paragraph company description — verbatim from site/company-description.md. */
  description: string;
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
  sitemap: [],
  social: [],
  logo: '/favicon.svg',
  description: '',
};
