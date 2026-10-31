/** @type {import('tailwindcss').Config} */

// The S5 build lane REGENERATES this file's theme from site/design-dna/
// TOKENS.json. The fluid fontSize entries below are the starter defaults
// (utopia-style clamp scale, viewports 320px→1240px) — a token-empty
// packet falls back to these and names each default in DESIGN-DNA.md.
// No breakpoint-stepped font sizes: every step interpolates continuously.
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Starter defaults — TOKENS.json colors replace these.
        ink: 'var(--c-ink)',
        paper: 'var(--c-paper)',
        accent: 'var(--c-accent)',
        muted: 'var(--c-muted)',
      },
      fontSize: {
        // Utilities are accessors: the clamp() values live once on :root
        // as --fs-* custom properties (src/styles/global.css).
        'fluid--1': ['var(--fs--1)', { lineHeight: 'var(--lh--1)' }],
        'fluid-0': ['var(--fs-0)', { lineHeight: 'var(--lh-0)' }],
        'fluid-1': ['var(--fs-1)', { lineHeight: 'var(--lh-1)' }],
        'fluid-2': ['var(--fs-2)', { lineHeight: 'var(--lh-2)' }],
        'fluid-3': ['var(--fs-3)', { lineHeight: 'var(--lh-3)' }],
        'fluid-4': ['var(--fs-4)', { lineHeight: 'var(--lh-4)' }],
        'fluid-5': ['var(--fs-5)', { lineHeight: 'var(--lh-5)' }],
      },
      spacing: {
        // Fluid spacing rhythm tokens (TOKENS.json fluid pairs land here).
        'space-fluid-s': 'var(--sp-fluid-s)',
        'space-fluid-m': 'var(--sp-fluid-m)',
        'space-fluid-l': 'var(--sp-fluid-l)',
      },
      borderRadius: {
        card: 'var(--r-card)',
      },
      boxShadow: {
        lift: 'var(--sh-lift)',
      },
    },
  },
  plugins: [],
};
