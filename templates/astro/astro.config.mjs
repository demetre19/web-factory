import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// The S5 build lane copies this file into sites/<slug>/ and MUST set
// `site` to the site's canonical origin (from site-brief.md) before
// building — SEOHead canonical/OG URLs and sitemap.xml both derive from it.
export default defineConfig({
  site: 'https://example.com',
  output: 'static',
  integrations: [
    tailwind({
      // Tailwind classes live in src/styles/global.css; no injected base
      // stylesheet — the starter owns its own global layer.
      applyBaseStyles: false,
    }),
    sitemap(),
  ],
});
