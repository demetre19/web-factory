#!/usr/bin/env python3
"""emit_global.py — deterministic emit producers for a pipeline's
global artifacts. ONE machinery: these are the canonical writers;
gen_fixtures imports the same recipes so fixture output and pipeline
output can never drift.

  tokens_json(dna)      → the gate's TOKENS.json shape
                          {knobs, color:{modes:{light,dark}.roles}}
  tokens_from_dna(dna)  → DNA.json → TOKENS record (derives knobs/modes
                          via dna_tokens when the map lacks them)
  tailwind_config(tok)  → site/tailwind.config.js text: darkMode +
                          colors/fontSize/borderRadius/spacing + every
                          TOKENS hex inlined
  global_css(tok)       → site/src/styles/global.css text: @tailwind
                          headers + emit_tokens five layers +
                          GLOBAL_CSS_TAIL (@layer components, .sec-band,
                          [data-surface] scope hooks, reduced-motion,
                          text-wrap, --input-*, .flow)

pipeline_emit.py is the only caller for real pipelines; gen_fixtures
calls global_css() verbatim (the recipe moved here from its
module-private _global_css).
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import emit_tokens  # noqa: E402

# The component layer appended below the emit_tokens five TK layers.
# Historically gen_fixtures.GLOBAL_CSS_TAIL — moved here so it is real
# machinery, not fixture scaffolding. Every class a gold exemplar or
# the Section shell binds that Tailwind does not generate lives here.
GLOBAL_CSS_TAIL = '''
h1, h2, h3, h4, h5, h6, p, ul, ol, li, figure, blockquote { margin: 0; }

:root {
  --text-wrap-heading: balance;
  --text-wrap-body: pretty;
  --flow-spacing: var(--space-4);

  /* ACSS rungs — the primitives every check gates on. The emitted
     @theme block binds --primitive-* names to these; they live in the
     tail (not TOKENS.json) because they are machinery, not DNA. */
  --fs--1: clamp(0.8335rem, 0.7621rem + 0.3571vi, 1.0128rem);
  --fs-0: clamp(1rem, 0.913rem + 0.4348vi, 1.1875rem);
  --fs-1: clamp(1.2rem, 1.0924rem + 0.538vi, 1.3906rem);
  --fs-2: clamp(1.44rem, 1.3064rem + 0.668vi, 1.6289rem);
  --fs-3: clamp(1.728rem, 1.5607rem + 0.8365vi, 1.9066rem);
  --fs-4: clamp(2.0736rem, 1.8629rem + 1.0535vi, 2.2305rem);
  --fs-5: clamp(2.4883rem, 2.2192rem + 1.3455vi, 2.6061rem);
  --lh--1: 1.5;
  --lh-0: 1.6;
  --lh-1: 1.5;
  --lh-2: 1.35;
  --lh-3: 1.25;
  --lh-4: 1.2;
  --lh-5: 1.15;
  --space-xs: clamp(0.5rem, 0.4rem + 0.5vi, 1rem);
  --space-s: clamp(0.75rem, 0.55rem + 1vi, 1.5rem);
  --space-m: clamp(1rem, 0.65rem + 1.75vi, 2rem);
  --space-l: clamp(1.5rem, 1rem + 2.5vi, 3rem);
  --space-xl: clamp(2rem, 1.3rem + 3.5vi, 4rem);
  --space-2xl: clamp(3rem, 2rem + 5vi, 6rem);
  --space-4: var(--space-m);
  --section-space-xs: clamp(2rem, 1.5rem + 2.5vi, 4rem);
  --section-space-s: clamp(3rem, 2rem + 5vi, 5rem);
  --section-space-m: clamp(4rem, 2.5rem + 7.5vi, 6rem);
  --section-space-l: clamp(6rem, 4rem + 10vi, 8rem);
  --section-space-xl: clamp(8rem, 5rem + 15vi, 10rem);
  --section-space-xxl: clamp(10rem, 6rem + 20vi, 12rem);
  --gutter: var(--space-m);
  --content-width: 80rem;
  --content-width-safe: min(var(--content-width),
                            calc(100% - var(--gutter) * 2));
  --measure: 60ch;
  --r-card: 0.5rem;
  --tap: 2.75rem;
  --font-display: ui-sans-serif, system-ui, -apple-system, "Segoe UI",
    Roboto, Helvetica, Arial, sans-serif;
  --font-body: var(--font-display);
  --input-border: var(--border-default);
  --input-py: 0.5rem;
  --input-px: 0.75rem;
  --input-radius: var(--r-card);
  /* legacy aliases — components bind semantic names only (TK.3) */
  --c-ink: var(--text-primary);
  --c-paper: var(--bg-canvas);
  --c-line: var(--border-default);
}
.flow > * + * { margin-block-start: var(--flow-spacing); }
h1, h2 { text-wrap: var(--text-wrap-heading); }
p { text-wrap: var(--text-wrap-body); }
img { object-fit: cover; }
input { border: 1px solid var(--input-border); padding: var(--input-py) var(--input-px); border-radius: var(--input-radius); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 150ms !important;
    transition: opacity 150ms linear !important;
    transform: none !important;
  }
}

.dark {
  --c-ink: var(--text-primary);
  --c-paper: var(--bg-canvas);
  --c-line: var(--border-default);
}

@layer components {
  .sec-band { padding-block: var(--sec-pad, var(--section-space-m));
              background: var(--sec-bg, var(--bg-canvas));
              color: var(--sec-fg, var(--text-primary)); }
  .sec-inner { max-width: 72rem; margin-inline: auto; }
  .ratio-portrait { aspect-ratio: 3 / 4; }
  .ratio-phone { aspect-ratio: 9 / 19; }
  .variant-stage { container-type: inline-size; }
  .variant-switcher { position: sticky; top: 0; }
  .btn-primary { min-height: var(--tap); }
  .burger { display: none; }
  .inverse { background: var(--c-ink); color: var(--c-paper); }
  .fold-row { border-top: 1px solid var(--c-line); }
  .card-grid { display: grid; gap: var(--space-4); }
  .btn-primary:hover { filter: brightness(1.08); }
  .btn-primary:focus-visible { outline: 2px solid var(--c-ink); outline-offset: 2px; }
  .btn-primary:disabled { opacity: .5; }
  .skip-link { position: absolute; left: -9999px; }
  .skip-link:focus { left: 8px; }
  .logo { font-weight: 700; }
  .helper { font-size: .875rem; }
  .wf-cta-button { display: inline-block;
                   padding: 0.75rem 1.5rem;
                   border-radius: var(--r-card);
                   background: var(--action-primary);
                   color: var(--action-primary-ink);
                   font-weight: 600; text-decoration: none;
                   min-height: var(--tap); }
  /* surface/density classes are the shell's rhythm signature — the
     L.14/L.7 gate reads them off the built <section> tag. */
  .surface-base { --sec-bg: var(--bg-canvas); --sec-fg: var(--text-primary); }
  .surface-muted { --sec-bg: var(--bg-surface); --sec-fg: var(--text-primary); }
  .surface-inverse { --sec-bg: var(--bg-inverse); --sec-fg: var(--text-inverse); }
  .surface-brand { --sec-bg: var(--action-primary); --sec-fg: var(--action-primary-ink); }
  .surface-media { --sec-bg: transparent; }
  .density-compact { --sec-pad: var(--section-space-s); }
  .density-regular { --sec-pad: var(--section-space-m); }
  .density-spacious { --sec-pad: var(--section-space-l); }
  /* attribute scopes — same contract as the classes; Section.astro
     emits both so source and built page stay consistent. */
  [data-surface="muted"] { --sec-bg: var(--bg-surface); }
  [data-surface="inverse"] { --sec-bg: var(--bg-inverse);
                             --sec-fg: var(--text-inverse); }
  [data-surface="brand"] { --sec-bg: var(--action-primary);
                           --sec-fg: var(--action-primary-ink); }
  [data-surface="media"] { --sec-bg: transparent; }
  [data-density="compact"] { --sec-pad: var(--section-space-s); }
  [data-density="regular"] { --sec-pad: var(--section-space-m); }
  [data-density="spacious"] { --sec-pad: var(--section-space-l); }
}
.dark img { filter: brightness(.85) contrast(.92); }
'''

# light-mode role → tailwind colour key (dark roles prefix `dark`)
ROLE_KEY = {
    'bg': 'paper', 'surface': 'surface', 'surface_elevated': 'elev',
    'border': 'border', 'ink': 'ink', 'ink_muted': 'muted',
    'accent': 'accent', 'accent_foreground': 'accentfg',
    'inverse': 'inverse',
}


def tokens_json(dna):
    """DNA map → the gate's TOKENS.json record. knobs ⊆ the map's
    knobs; roles from the map's modes (dna_tokens derive when absent)."""
    knobs = dict(dna.get('knobs') or {})
    modes = dna.get('modes') or {}
    if not modes.get('light') or not modes.get('dark') or not knobs:
        rec = _derive_tokens(dna)
        if not knobs:
            knobs = dict(rec.get('knobs') or {})
        modes = rec.get('modes') or modes
    return {
        'knobs': knobs,
        'color': {
            'modes': {
                'light': {'roles': dict(modes.get('light') or {})},
                'dark': {'roles': dict(modes.get('dark') or {})},
            },
            'roles': dict(modes.get('light') or {}),
        },
    }


def _derive_tokens(dna):
    """genotype + declared accent → knobs + modes via dna_tokens —
    the genotype→tokens mapper is the ONLY derivation (P1)."""
    import dna_tokens
    geno = dna.get('genotype') or {}
    accent = (dna.get('invariants') or {}).get('accent')
    vertical = str(dna.get('vertical_profile') or '').replace(
        'profile-', '').split('/')[0] or 'services'
    if not geno:
        return {'knobs': {}, 'modes': {}}
    return dna_tokens.from_genotype(
        geno, vertical, {'accent': accent or '#0055AA'})


def tailwind_config(tokens):
    """TOKENS record → tailwind.config.js text. Every hex in
    color.modes lands verbatim (check_tailwind_derivation); theme
    keys colors/fontSize/borderRadius/spacing always present."""
    color = tokens.get('color') or {}
    modes = color.get('modes') or {}
    light = (modes.get('light') or {}).get('roles') \
        or color.get('roles') or {}
    dark = (modes.get('dark') or {}).get('roles') or {}
    pairs = []
    for role, hexv in light.items():
        pairs.append((ROLE_KEY.get(role) or role, str(hexv)))
    for role, hexv in dark.items():
        base = ROLE_KEY.get(role) or role
        pairs.append(('dark' + base, str(hexv)))
    colour_lines = ''
    for i in range(0, len(pairs), 6):
        chunk = pairs[i:i + 6]
        colour_lines += '\n      ' + ', '.join(
            f"{k}: '{v.lower()}'" for k, v in chunk)
    colour_lines = colour_lines.rstrip() + '\n   '
    return f'''/** generated from TOKENS.json — emit_global.tailwind_config */
export default {{
  darkMode: 'class',
  content: ['./src/**/*.{{astro,html}}'],
  theme: {{ extend: {{
    colors: {{{colour_lines}}},
    fontSize: {{
      'fluid--1': 'var(--fs--1)', 'fluid-0': 'var(--fs-0)',
      'fluid-1': 'var(--fs-1)', 'fluid-2': 'var(--fs-2)',
      'fluid-3': 'var(--fs-3)', 'fluid-4': 'var(--fs-4)',
      'fluid-5': 'var(--fs-5)',
    }},
    borderRadius: {{ card: 'var(--r-card)' }},
    spacing: {{ tap: '44px' }},
  }} }},
}}
'''


def global_css(tokens):
    """@tailwind headers + emit_tokens' five TK layers + the component
    tail — exactly the recipe gen_fixtures._global_css encoded."""
    head = ('@tailwind base;\n@tailwind components;\n'
            '@tailwind utilities;\n')
    emit_lines = emit_tokens.emit(tokens).split('\n')
    body = '\n'.join(emit_lines[5:])
    return head + '\n' + body + '\n' + GLOBAL_CSS_TAIL.lstrip('\n')
