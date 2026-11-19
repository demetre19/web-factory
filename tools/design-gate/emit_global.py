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

  /* ACSS rungs — the primitives every check gates on. Every
     --primitive-* value is derived from TOKENS.json knobs by
     emit_tokens (type.ratio/type.base/radius/gutter/fonts); this
     block only binds semantic names to primitives — never copies. */
  --fs--1: var(--primitive-text-neg1);
  --fs-0: var(--primitive-text-0);
  --fs-1: var(--primitive-text-1);
  --fs-2: var(--primitive-text-2);
  --fs-3: var(--primitive-text-3);
  --fs-4: var(--primitive-text-4);
  --fs-5: var(--primitive-text-5);
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
  --gutter: var(--primitive-gutter);
  --grid-min: var(--primitive-grid-min);
  --content-width: 80rem;
  --content-width-safe: min(var(--content-width),
                            calc(100% - var(--gutter) * 2));
  --measure: 60ch;
  --r-card: var(--primitive-radius);
  --tap: 2.75rem;
  --font-display: var(--primitive-font-display);
  --font-body: var(--primitive-font-body);
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
  /* fluid utilities — the exemplars' spacing/type vocabulary; the
     names match TAIL_UTIL, the VALUES come from the rungs, so P.2
     must find real rules here, not rely on the prefix regex. */
  .text-fluid--1 { font-size: var(--fs--1); }
  .text-fluid-0 { font-size: var(--fs-0); }
  .text-fluid-1 { font-size: var(--fs-1); }
  .text-fluid-2 { font-size: var(--fs-2); }
  .text-fluid-3 { font-size: var(--fs-3); }
  .text-fluid-4 { font-size: var(--fs-4); }
  .mt-stack { margin-block-start: var(--space-4); }
  .mt-fluid-s { margin-block-start: var(--space-s); }
  .mt-fluid-m { margin-block-start: var(--space-m); }
  .mt-fluid-l { margin-block-start: var(--space-l); }
  .pt-fluid-m { padding-block-start: var(--space-m); }
  .pb-fluid-s { padding-block-end: var(--space-s); }
  .p-fluid-s { padding: var(--space-s); }
  .p-fluid-m { padding: var(--space-m); }
  .gap-stack { gap: var(--space-4); }
  .gap-fluid-s { gap: var(--space-s); }
  .gap-fluid-m { gap: var(--space-m); }
  .gap-fluid-l { gap: var(--space-l); }
  .sec-band { padding-block: var(--sec-pad, var(--section-space-m));
              background: var(--sec-bg, var(--bg-canvas));
              color: var(--sec-fg, var(--text-primary)); }
  .sec-inner { max-width: 72rem; margin-inline: auto; }
  /* G.5 canon — every collection grid is auto-fit on the rung-bound
     card floor, never a fixed repeat(N). */
  .grid-auto { display: grid;
      grid-template-columns:
        repeat(auto-fit, minmax(min(var(--grid-min),100%),1fr)); }
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
  /* DENSITY-RUNGS */
  /* attribute scopes — same contract as the classes; Section.astro
     emits both so source and built page stay consistent. */
  [data-surface="muted"] { --sec-bg: var(--bg-surface); }
  [data-surface="inverse"] { --sec-bg: var(--bg-inverse);
                             --sec-fg: var(--text-inverse); }
  [data-surface="brand"] { --sec-bg: var(--action-primary);
                           --sec-fg: var(--action-primary-ink); }
  [data-surface="media"] { --sec-bg: transparent; }
  .site-foot { border-top: 1px solid var(--c-line);
               padding-block: var(--space-m); }
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
    if not modes.get('light') or not modes.get('dark'):
        rec = _derive_tokens(dna)
        modes = rec.get('modes') or modes
    if not knobs:
        rec = _derive_tokens(dna)
        knobs = dict(rec.get('knobs') or {})
    def _roles(mode):
        m = modes.get(mode) or {}
        return dict(m.get('roles') or m)  # tolerate {light:{roles}} shape
    return {
        'knobs': knobs,
        'color': {
            'modes': {
                'light': {'roles': _roles('light')},
                'dark': {'roles': _roles('dark')},
            },
            'roles': _roles('light'),
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
    if not accent:
        raise SystemExit(
            'emit_global.tokens_json: invariants.accent missing — '
            'the token layer never invents a hex (F10)')
    return dna_tokens.from_genotype(
        geno, vertical, {'accent': accent})


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
            f"{k}: '{v.lower()}'" for k, v in chunk) + ','
    # every pair line ends with a comma — the last is legal JS
    # (trailing comma) and keeps sucrase from reading the next
    # key as an expression continuation.
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


def _density_css(tokens):
    """knobs.space.section_py names the rung each density uses — emit
    that, else the s/m/l default the fixtures encode."""
    py = ((tokens.get('knobs') or {})
          .get('space.section_py')) or {}
    rung = lambda d, f: str(py.get(d) or f'section-space-{f}')
    rows = (('compact', rung('compact', 's')),
            ('regular', rung('regular', 'm')),
            ('spacious', rung('spacious', 'l')))
    out = []
    for name, var in rows:
        out.append(f'  .density-{name} '
                   f'{{ --sec-pad: var(--{var}); }}')
    for name, var in rows:
        out.append(f'  [data-density="{name}"] '
                   f'{{ --sec-pad: var(--{var}); }}')
    return '\n'.join(out)


def _base_css(tokens):
    """The good-defaults floor: raw h1–h6/p/a/img/button bound to the
    type scale. Without it every element renders in browser defaults —
    bank markup and hand-authored markup alike. Layered `base` so any
    unlayered component rule wins."""
    k = tokens.get('knobs') or {}
    try:
        dw = int(float(k.get('type.display_weight') or 700))
    except (TypeError, ValueError):
        dw = 700
    try:
        tr = f"{float(k.get('type.tracking_display')):.3f}em"
    except (TypeError, ValueError):
        tr = '-0.020em'
    return '\n'.join([
        '@layer base {',
        '  :root {',
        f'    --display-weight: {dw};',
        f'    --tracking-display: {tr};',
        '  }',
        '  *, *::before, *::after { box-sizing: border-box; }',
        '  html { -webkit-text-size-adjust: 100%; }',
        '  body {',
        '    margin: 0;',
        '    font-family: var(--font-body);',
        '    font-size: var(--fs-0);',
        '    line-height: var(--lh-0);',
        '    color: var(--text-primary);',
        '    background-color: var(--bg-canvas);',
        '    -webkit-font-smoothing: antialiased;',
        '    -moz-osx-font-smoothing: grayscale;',
        '  }',
        '  h1, h2, h3, h4, h5 {',
        '    font-family: var(--font-display);',
        '    font-weight: var(--display-weight);',
        '    letter-spacing: var(--tracking-display);',
        '  }',
        '  h1 { font-size: var(--fs-5); line-height: var(--lh-5); }',
        '  h2 { font-size: var(--fs-4); line-height: var(--lh-4); }',
        '  h3 { font-size: var(--fs-3); line-height: var(--lh-3); }',
        '  h4 { font-size: var(--fs-2); line-height: var(--lh-2); }',
        '  h5 { font-size: var(--fs-1); line-height: var(--lh-1); }',
        '  h6 {',
        '    font-size: var(--fs-0); line-height: var(--lh-1);',
        '    font-weight: 600; text-transform: uppercase;',
        '    letter-spacing: 0.08em;',
        '  }',
        '  p { line-height: var(--lh-0); max-width: var(--measure); }',
        '  p + p { margin-top: var(--flow-spacing); }',
        '  a {',
        '    color: inherit;',
        '    text-decoration-color: color-mix(in oklch,',
        '      currentColor 35%, transparent);',
        '    text-underline-offset: 0.18em;',
        '  }',
        '  a:hover { text-decoration-color: currentColor; }',
        '  img, svg, video, canvas { display: block; max-width: 100%; }',
        '  img { height: auto; }',
        '  figure { margin: 0; }',
        '  ul, ol { padding-inline-start: 1.15em; }',
        '  li + li { margin-top: var(--space-xs); }',
        '  button {',
        '    font: inherit; color: inherit; background: none;',
        '    border: 0; cursor: pointer;',
        '  }',
        '  strong, b { font-weight: 600; }',
        '  ::selection {',
        '    background: var(--action-primary);',
        '    color: var(--action-primary-ink);',
        '  }',
        '  :focus-visible {',
        '    outline: 2px solid var(--border-focus);',
        '    outline-offset: 3px;',
        '  }',
        '}',
    ])


def global_css(tokens):
    """@tailwind headers + emit_tokens' five TK layers + the component
    tail (density rungs derived from knobs.space.section_py)."""
    head = ('@tailwind base;\n@tailwind components;\n'
            '@tailwind utilities;\n')
    emit_lines = emit_tokens.emit(tokens).split('\n')
    body = '\n'.join(emit_lines[5:])
    tail = GLOBAL_CSS_TAIL.lstrip('\n').replace(
        '  /* DENSITY-RUNGS */', _density_css(tokens))
    return (head + '\n' + body + '\n' + _base_css(tokens)
            + '\n' + tail)
