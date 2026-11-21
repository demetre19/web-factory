/** generated from TOKENS.json — emit_global.tailwind_config */
export default {
  darkMode: 'class',
  content: ['./src/**/*.{astro,html}'],
  theme: { extend: {
    colors: {
      paper: '#ffffff', surface: '#f0f3f6', elev: '#e9ebee', border: '#d6d9db', ink: '#273b37', muted: '#556e6a',
      inverse: '#1f2e2c', accent: '#166f64', accentfg: '#ffffff', darkpaper: '#14181a', darksurface: '#1c2224', darkelev: '#232a2c',
      darkborder: '#2c3437', darkink: '#edebe7', darkmuted: '#a8a49d', darkinverse: '#f4f2ee', darkaccent: '#00b488', darkaccentfg: '#14181a',
   },
    fontSize: {
      'fluid--1': 'var(--fs--1)', 'fluid-0': 'var(--fs-0)',
      'fluid-1': 'var(--fs-1)', 'fluid-2': 'var(--fs-2)',
      'fluid-3': 'var(--fs-3)', 'fluid-4': 'var(--fs-4)',
      'fluid-5': 'var(--fs-5)',
    },
    borderRadius: { card: 'var(--r-card)' },
    spacing: { tap: 'var(--tap)' },
  } },
}
