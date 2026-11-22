"""vibe_atlas.py — the combinatorial vibe space.

Every expressive genome axis (genome.py GENES) maps to token deltas;
any allele-per-axis set resolves deterministically into a vibe family
bundle (the picker_app VIBE_FAMILIES contract: css / css_dark / shape /
theme). 'Nearly unlimited' = ~10^30 combinations; PRESETS emits 110
named starting points in browsable clusters.

Contract:
    AXES           tweak-panel axes grouped Type/Space/Surface/Motion/Mood
    resolve(genes) {axis: allele} -> {name, genes, css, css_dark, shape,
                                      theme, tokens}
    PRESETS        [{id, name, cluster, genes, theme}] — deterministic
"""

import hashlib

# ------------------------------------------------------------------
# tweak axes — grouped, slider-ordered (allele index = slider step)
# ------------------------------------------------------------------
AXES = [
    {'group': 'Type', 'axis': 'display-face',
     'alleles': ['sans', 'serif', 'mono', 'mixed']},
    {'group': 'Type', 'axis': 'type-contrast',
     'alleles': ['low', 'medium', 'high', 'extreme']},
    {'group': 'Type', 'axis': 'heading-form',
     'alleles': ['claim', 'label', 'query']},
    {'group': 'Space', 'axis': 'density-tier',
     'alleles': ['compact', 'regular', 'spacious']},
    {'group': 'Space', 'axis': 'whitespace-band',
     'alleles': ['tight', 'medium', 'airy']},
    {'group': 'Space', 'axis': 'columns',
     'alleles': ['2', '3', '4', '1']},
    {'group': 'Surface', 'axis': 'radius-personality',
     'alleles': ['sharp', 'soft', 'pill', 'mixed']},
    {'group': 'Surface', 'axis': 'surface-rhythm',
     'alleles': ['single-surface', 'alternating',
                 'one-contrast-moment', 'dark-dominant',
                 'media-interleaved']},
    {'group': 'Surface', 'axis': 'image-style',
     'alleles': ['minimal', 'editorial', 'luxury', 'bold-graphic',
                 'playful', 'technical']},
    {'group': 'Motion', 'axis': 'motion-tier',
     'alleles': ['static', 'subtle', 'expressive', 'cinematic']},
    {'group': 'Motion', 'axis': 'disclosure-tier',
     'alleles': ['open', 'folded', 'tabbed', 'carousel']},
    {'group': 'Mood', 'axis': 'mood-energy',
     'alleles': ['still', 'calm', 'balanced', 'lively', 'energetic']},
    {'group': 'Mood', 'axis': 'mood-register',
     'alleles': ['everyday', 'approachable', 'premium', 'luxury',
                 'ultra']},
    {'group': 'Mood', 'axis': 'trend',
     'alleles': ['none', 'cute-alism', 'dial-up-delight',
                 'resonant-stark', 'frosted-touch',
                 'light-skeuomorphism', 'ai-personalisation',
                 'snug-simple', 'human-scribble', 'dated']},
]
_AXIS_ORDER = [a['axis'] for a in AXES]

# ------------------------------------------------------------------
# allele → token deltas. L = light :root vars, D = dark-mode vars,
# S = structural shape css (arrangement the vars can't express).
# ------------------------------------------------------------------
_SANS = 'ui-sans-serif,system-ui,sans-serif'
_SERIF = 'Georgia,"Times New Roman",serif'
_MONO = 'ui-monospace,"SF Mono",Menlo,monospace'


def _den(var):
    return ('--flow-spacing:var(--space-%s);--grid-gap:var(--space-%s);'
            '--content-gap:var(--space-%s)' % (var, var, var))


_ALLELE = {
    'display-face': {
        'sans': ({'L': '--font-display:' + _SANS +
                  ';--primitive-font-display:' + _SANS},),
        'serif': ({'L': '--font-display:' + _SERIF +
                  ';--primitive-font-display:' + _SERIF},),
        'mono': ({'L': '--font-display:' + _MONO +
                  ';--primitive-font-display:' + _MONO +
                  ';--font-body:' + _MONO},),
        'mixed': ({'L': '--font-display:' + _SERIF +
                   ';--primitive-font-display:' + _SERIF},),
    },
    'type-contrast': {
        'low': ({'S': 'h1,h2,h3,.sec-h{font-weight:400;'
                 'letter-spacing:0}'},),
        'medium': ({'S': 'h1,h2,h3,.sec-h{font-weight:600}'},),
        'high': ({'S': 'h1,h2,h3,.sec-h{font-weight:700;'
                  'letter-spacing:-.01em}'},),
        'extreme': ({'S': 'h1,h2,.sec-h{font-weight:800;'
                     'letter-spacing:-.03em;text-transform:uppercase}'
                     '.sec-kicker{letter-spacing:.18em;'
                     'text-transform:uppercase}'},),
    },
    'heading-form': {
        'claim': ({},),
        'label': ({'S': '.sec-h h2{text-transform:uppercase;'
                   'letter-spacing:.12em;font-size:.9em}'},),
        'query': ({'S': '.sec-h h2::after{content:"?"}'},),
    },
    'density-tier': {
        'compact': ({'L': _den('s')},),
        'regular': ({'L': _den('m')},),
        'spacious': ({'L': _den('l') +
                     '--section-space-m:var(--section-space-l)'},),
    },
    'whitespace-band': {
        'tight': ({'L': '--measure:38rem;--section-space-m:'
                   'var(--section-space-s)'},),
        'medium': ({'L': '--measure:46rem'},),
        'airy': ({'L': '--measure:56rem;--section-space-m:'
                  'var(--section-space-xl)'},),
    },
    'columns': {
        '1': ({'S': '.card-grid,.grid{grid-template-columns:1fr! '
               'important}'},),
        '2': ({'S': '@media (min-width:560px){.card-grid{'
               'grid-template-columns:repeat(2,1fr)!important}}'},),
        '3': ({},),
        '4': ({'S': '@media (min-width:720px){.card-grid{'
               'grid-template-columns:repeat(4,1fr)!important}}'},),
    },
    'radius-personality': {
        'sharp': ({'L': '--radius:0;--primitive-radius:0;--r-card:0'},),
        'soft': ({'L': '--radius:.625rem;--primitive-radius:.625rem;'
                  '--r-card:.625rem'},),
        'pill': ({'L': '--radius:999px;--primitive-radius:999px;'
                  '--r-card:1.5rem'},),
        'mixed': ({'L': '--radius:.5rem;--primitive-radius:.5rem;'
                   '--r-card:1.25rem'},),
    },
    'surface-rhythm': {
        'single-surface': ({'S': '.sec-band:not([data-surface='
                            '"brand"]):not([data-surface='
                            '"inverse"]){background:'
                            'var(--bg-canvas)!important}'},),
        'alternating': ({'S': '.sec-band:nth-of-type(2n):not('
                         '[data-surface="brand"]):not('
                         '[data-surface="inverse"]){background:'
                         'var(--bg-surface)}'},),
        'one-contrast-moment': ({'S': '.wf-hero-1{background:'
                                 'var(--ink,var(--text-primary));'
                                 'color:var(--bg-canvas)}'
                                 '.wf-hero-1 h1{color:var(--bg-canvas)}'
                                 '.wf-hero-1 p{color:var(--bg-canvas);'
                                 'opacity:.8}'},),
        'dark-dominant': ({'THEME': 'dark',
                           'D': '--bg-canvas:#0C0C0E;'
                           '--bg-surface:#141417;--bg-elevated:#1C1C21;'
                           '--border-default:#2A2A30;'
                           '--text-primary:#EDEDEA;'
                           '--text-secondary:#9C9C96'},),
        'media-interleaved': ({'S': '.sec-band:nth-of-type(2n) '
                               '.media-round{filter:saturate(1.15)}'},),
    },
    'image-style': {
        'minimal': ({'S': 'img{filter:saturate(.85)}'},),
        'editorial': ({'S': 'img{filter:contrast(1.06) '
                       'saturate(.95)}'},),
        'luxury': ({'S': 'img{filter:saturate(1.08) contrast(1.04)}'},),
        'bold-graphic': ({'S': 'img{filter:saturate(1.35) '
                          'contrast(1.1)}'},),
        'playful': ({'S': 'img{filter:saturate(1.18) hue-rotate(4deg);'
                     'border-radius:var(--radius,12px)}'},),
        'technical': ({'S': 'img{filter:grayscale(.35) '
                       'contrast(1.05)}'},),
    },
    'motion-tier': {
        'static': ({'S': '*,*::before,*::after{transition:none!'
                    'important;animation:none!important}'
                    'html{scroll-behavior:auto}'},),
        'subtle': ({},),
        'expressive': ({'S': 'a,button{transition:all .18s ease}'
                        '.card{transition:transform .18s ease,'
                        'box-shadow .18s ease}'
                        '.card:hover{transform:translateY(-3px)}'},),
        'cinematic': ({'S': 'a,button{transition:all .22s ease}'
                       '.card{transition:transform .24s ease,'
                       'box-shadow .24s ease}'
                       '.card:hover{transform:translateY(-6px) '
                       'scale(1.01)}html{scroll-behavior:smooth}'},),
    },
    'disclosure-tier': {
        'open': ({},),
        'folded': ({'S': 'details>summary{cursor:pointer}'},),
        'tabbed': ({},),
        'carousel': ({'S': '.card-grid{overflow-x:auto}'},),
    },
    'mood-energy': {
        'still': ({'L': '--shadow-card:none;--shadow-pop:none;'
                   '--border-default:#00000018'},),
        'calm': ({'L': '--shadow-card:0 1px 3px #0000000d'},),
        'balanced': ({'L': '--shadow-card:0 2px 10px #00000012'},),
        'lively': ({'L': '--shadow-card:0 6px 24px #0000001c'},),
        'energetic': ({'L': '--shadow-card:0 10px 34px #00000026;'
                       '--shadow-pop:0 16px 50px #00000030'},),
    },
    'mood-register': {
        'everyday': ({'L': '--action-primary:#D97706;'
                      '--action-primary-hover:#B45309',
                      'D': '--action-primary:#FBBF24;'
                      '--action-primary-hover:#FDE68A;'
                      '--action-primary-ink:#3A2703'},),
        'approachable': ({'L': '--action-primary:#2563EB;'
                          '--action-primary-hover:#1D4ED8',
                          'D': '--action-primary:#60A5FA;'
                          '--action-primary-hover:#93C5FD;'
                          '--action-primary-ink:#0B1E3F'},),
        'premium': ({'L': '--action-primary:#1E3A8A;'
                     '--action-primary-hover:#172E6E',
                     'D': '--action-primary:#A5B4FC;'
                     '--action-primary-hover:#C7D2FE;'
                     '--action-primary-ink:#141B3F'},),
        'luxury': ({'L': '--action-primary:#8A6A35;'
                    '--action-primary-hover:#6E5428;'
                    '--font-display:' + _SERIF,
                    'D': '--action-primary:#D4B87A;'
                    '--action-primary-hover:#E7D3A3;'
                    '--action-primary-ink:#2E230E'},),
        'ultra': ({'L': '--action-primary:#111111;'
                   '--action-primary-hover:#000000',
                   'D': '--action-primary:#E5E4DF;'
                   '--action-primary-hover:#FFFFFF;'
                   '--action-primary-ink:#101010',
                   'S': '.sec-h{letter-spacing:.06em;'
                   'text-transform:uppercase}'},),
    },
    'trend': {
        'none': ({},),
        'cute-alism': ({'L': '--radius:1.25rem;--primitive-radius:1.25rem',
                        'S': '.card:hover{transform:rotate(-.5deg)}'},),
        'dial-up-delight': ({'L': '--font-display:' + _MONO,
                             'S': '.card{border:1px solid '
                             'var(--text-primary)}'},),
        'resonant-stark': ({'L': '--radius:0;--primitive-radius:0',
                            'S': '.sec-band{border-bottom:2px solid '
                            'var(--text-primary)}'},),
        'frosted-touch': ({'S': '.nav-bar,.site-header{'
                           'backdrop-filter:blur(10px);'
                           'background:color-mix(in srgb,'
                           'var(--bg-canvas) 80%,transparent)}'},),
        'light-skeuomorphism': ({'L': '--shadow-card:inset 0 1px 0 '
                                 '#ffffff,0 2px 8px #00000014'},),
        'ai-personalisation': ({},),
        'snug-simple': ({'L': _den('s')},),
        'human-scribble': ({'S': '.card{border:1.5px dashed '
                            'var(--border-default)}'},),
        'dated': ({'L': '--font-display:Arial,sans-serif',
                   'S': 'a{text-decoration:underline}'},),
    },
}


def _norm(genes):
    """axis->allele, unknown axes/alleles dropped, fixed order."""
    out = {}
    legal = {a['axis']: set(a['alleles']) for a in AXES}
    for ax in _AXIS_ORDER:
        al = (genes or {}).get(ax)
        if al in legal[ax]:
            out[ax] = al
    return out


def resolve(genes):
    """{axis: allele} -> a vibe family bundle. Merge in axis order —
    a later axis wins on the same var ('later/stronger wins')."""
    g = _norm(genes)
    l_vars, d_vars, shapes = {}, {}, []
    theme = None
    for ax, al in g.items():
        for d in _ALLELE.get(ax, {}).get(al, ()):
            if 'THEME' in d:
                theme = d['THEME']
            if d.get('L'):
                l_vars.update(_pairs(d['L']))
            if d.get('D'):
                d_vars.update(_pairs(d['D']))
            if d.get('S'):
                shapes.append(d['S'])
    # C.1 on-accent pairing — alleles may set --action-primary
    # without an ink that reaches 4.5:1 on it (the L side never
    # declared one, so light accents rendered white-on-light)
    pair_surface(l_vars)
    pair_surface(d_vars, '#0E1416')
    pair_ink(l_vars)
    pair_ink(d_vars)
    name = ' + '.join(f'{ax}:{al}' for ax, al in g.items()) or 'baseline'
    return {'name': name, 'genes': [f'{ax}:{al}' for ax, al in
                                    g.items()],
            'gene_map': g,
            'css': _vars(l_vars), 'css_dark': _vars(d_vars),
            'shape': ''.join(shapes), 'theme': theme,
            'tokens': {'light': l_vars, 'dark': d_vars}}


def _pairs(css):
    out = {}
    for decl in css.split(';'):
        if ':' in decl:
            k, v = decl.split(':', 1)
            out[k.strip()] = v.strip()
    return out


def _hex_rgb(v):
    v = str(v or '').strip().lstrip('#')
    if len(v) == 3:
        v = ''.join(c * 2 for c in v)
    try:
        return tuple(int(v[i:i + 2], 16) / 255 for i in (0, 2, 4))
    except (ValueError, IndexError):
        return None


def _lum(rgb):
    f = lambda c: c / 12.92 if c <= .03928 else (
        (c + .055) / 1.055) ** 2.4
    return .2126 * f(rgb[0]) + .7152 * f(rgb[1]) + .0722 * f(rgb[2])


def _contrast(a, b):
    ra, rb = _hex_rgb(a), _hex_rgb(b)
    if ra is None or rb is None:
        return None
    l1, l2 = _lum(ra), _lum(rb)
    if l1 < l2:
        l1, l2 = l2, l1
    return (l1 + .05) / (l2 + .05)


def _hex(rgb):
    return '#%02X%02X%02X' % tuple(
        max(0, min(255, round(c * 255))) for c in rgb)


def pair_surface(v, canvas_fallback='#FFFFFF'):
    """C.1 on-surface pairing: --action-primary must sit at >=4.5:1
    on --bg-canvas — accent links, focus rings and the CTA edge all
    ride on it. A failing accent is nudged toward its contrast pole
    in small luminance steps, hue preserved. Mutates + returns v."""
    ap, cv = _hex_rgb(v.get('--action-primary')), \
        _hex_rgb(v.get('--bg-canvas') or canvas_fallback)
    if ap is None or cv is None:
        return v

    def _r(rgb):
        l1, l2 = _lum(rgb), _lum(cv)
        if l1 < l2:
            l1, l2 = l2, l1
        return (l1 + .05) / (l2 + .05)
    if _r(ap) >= 4.5:
        return v
    to_black = _lum(cv) > .35   # light canvas → darken the accent
    for _i in range(32):
        ap = [c * .94 for c in ap] if to_black else \
             [c + (1 - c) * .06 for c in ap]
        if _r(ap) >= 4.5:
            break
    v['--action-primary'] = _hex(ap)
    return v


def pair_ink(v):
    """C.1 on-accent pairing: --action-primary-ink must sit at
    >=4.5:1 on --action-primary or the CTA band renders
    unreadable. When the var is absent or fails, derive it —
    the theme's own ink first (on-surface pairing), then the
    extreme ends — never touching the accent itself. Mutates
    and returns the var dict."""
    ap = v.get('--action-primary')
    if _hex_rgb(ap) is None:
        return v
    cur = v.get('--action-primary-ink')
    if cur and (_contrast(cur, ap) or 0) >= 4.5:
        return v
    darks = [v.get('--text-primary'), v.get('--ink'),
             '#14181A', '#000000']
    lights = ['#FFFFFF', v.get('--bg-canvas')]
    dark_first = _lum(_hex_rgb(ap)) > .175
    best, best_r = cur, (_contrast(cur, ap) or 0)
    for c in (darks + lights) if dark_first else (lights + darks):
        r = _contrast(c, ap) or 0
        if r >= 4.5:
            best, best_r = c, r
            break
        if r > best_r:
            best, best_r = c, r
    if best:
        v['--action-primary-ink'] = best
    return v


def _vars(d):
    return ';'.join(f'{k}:{v}' for k, v in d.items())


def gene_hash(genes):
    return hashlib.sha1(
        '|'.join(resolve(genes)['genes']).encode()).hexdigest()[:10]


# ------------------------------------------------------------------
# PRESETS — 12 clusters x deterministic parametric sweep = 110.
# Base genes pin the cluster's identity; the sweep varies the rest.
# ------------------------------------------------------------------
_CLUSTERS = [
    ('noir', 9, {'surface-rhythm': 'dark-dominant',
                 'radius-personality': 'sharp',
                 'type-contrast': 'high', 'mood-register': 'premium'}),
    ('paper', 10, {'display-face': 'serif', 'density-tier': 'spacious',
                   'mood-energy': 'calm',
                   'surface-rhythm': 'single-surface'}),
    ('neon', 8, {'surface-rhythm': 'dark-dominant',
                 'radius-personality': 'pill',
                 'mood-energy': 'energetic',
                 'motion-tier': 'expressive'}),
    ('brutal', 10, {'radius-personality': 'sharp',
                    'type-contrast': 'extreme',
                    'trend': 'resonant-stark',
                    'mood-energy': 'still'}),
    ('luxe', 10, {'display-face': 'serif', 'mood-register': 'luxury',
                  'radius-personality': 'mixed',
                  'whitespace-band': 'airy'}),
    ('minimal', 10, {'surface-rhythm': 'single-surface',
                     'mood-energy': 'still', 'type-contrast': 'low',
                     'image-style': 'minimal'}),
    ('playful', 10, {'radius-personality': 'pill',
                     'mood-energy': 'lively',
                     'mood-register': 'everyday',
                     'image-style': 'playful'}),
    ('editorial', 10, {'display-face': 'mixed',
                       'surface-rhythm': 'alternating',
                       'type-contrast': 'high',
                       'image-style': 'editorial'}),
    ('mono-type', 8, {'display-face': 'mono',
                      'image-style': 'technical',
                      'radius-personality': 'sharp'}),
    ('warm', 10, {'mood-register': 'approachable',
                  'density-tier': 'regular',
                  'radius-personality': 'soft'}),
    ('industrial', 8, {'density-tier': 'compact',
                       'image-style': 'technical',
                       'radius-personality': 'sharp',
                       'type-contrast': 'medium'}),
    ('gallery', 8, {'surface-rhythm': 'media-interleaved',
                    'image-style': 'luxury',
                    'whitespace-band': 'airy',
                    'mood-energy': 'calm'}),
]

# axes the sweep varies when the cluster doesn't pin them
_SWEEP_AXES = [a['axis'] for a in AXES]
_AXIS_POOL = {a['axis']: a['alleles'] for a in AXES}


def _preset_genes(cluster, i):
    """deterministic allele sweep: hash(cluster,i) picks the free
    axes' alleles; cluster base wins where pinned."""
    seed = int(hashlib.sha1(f'{cluster}:{i}'.encode()).hexdigest(), 16)
    g = {}
    for j, ax in enumerate(_SWEEP_AXES):
        pool = _AXIS_POOL[ax]
        g[ax] = pool[(seed >> (j * 5) + i) % len(pool)]
    g.update(_CLUSTERS_DICT[cluster])
    return g


_CLUSTERS_DICT = {c: base for c, _n, base in _CLUSTERS}


# vars that only recolour the page — two presets that differ only in
# these render as palette twins, and the audit counts them identical
_PALETTE_PREFIXES = ('--action-primary', '--bg-', '--text-',
                     '--border', '--ink', '--font-body')

# vars that never change the RENDERED first screen — radii, shadows,
# borders, gaps and accents show below the fold (or only in cards
# off the first viewport): the audit measures visible first-screen
# Δ, so the signature must not count them (#137 residue)
_FS_INVISIBLE_PREFIXES = _PALETTE_PREFIXES + (
    '--radius', '--primitive-radius', '--r-', '--shadow',
    '--content-gap', '--flow-spacing', '--grid-gap', '--gap',
    '--action')


def _struct_sig(r):
    """a preset's *visible first-screen structural* signature:
    theme, face, type scale/weight, measure and column layout — the
    traits a rendered first screen actually shows. Palette vars,
    radii, shadows, borders, gaps and the shape layer are excluded:
    their diffs render below the fold, and counting them left
    rendered-identical pairs (industrial-03/08, luxe-01/08 …) alive
    as "distinct" vibes."""
    def fil(tok):
        return tuple(sorted(
            (k, v) for k, v in tok.items()
            if not k.startswith(_FS_INVISIBLE_PREFIXES)))
    return (r['theme'], fil(r['tokens']['light']),
            fil(r['tokens']['dark']))


def _build_presets():
    out, seen, seen_sig = [], set(), set()
    for cluster, n, _base in _CLUSTERS:
        got = 0
        i = 0
        while got < n and i < n * 12:
            i += 1
            genes = _preset_genes(cluster, i)
            r = resolve(genes)
            sig = tuple(sorted(r['tokens']['light'].items()) +
                        sorted(r['tokens']['dark'].items()) +
                        [(r['shape'])])
            tries = 0
            while sig in seen and tries < len(_AXIS_POOL['columns']):
                # dedup deterministically: walk the columns allele so
                # every preset is visibly distinct at thumbnail
                pool = _AXIS_POOL['columns']
                genes = dict(genes)
                genes['columns'] = pool[
                    (pool.index(genes['columns']) + 1 + tries)
                    % len(pool)]
                r = resolve(genes)
                sig = tuple(sorted(r['tokens']['light'].items()) +
                            sorted(r['tokens']['dark'].items()) +
                            [(r['shape'])])
                tries += 1
            seen.add(sig)
            ssig = _struct_sig(r)
            if ssig in seen_sig:
                # structural twin of an earlier preset — same face /
                # radius / spacing / shape, differing only in colour;
                # skip it rather than minting a near-identical card
                continue
            seen_sig.add(ssig)
            got += 1
            # id from the generation index, not the kept count: the
            # sweep is deterministic on (cluster, i), so structural-
            # dedupe changes leave gaps instead of silently
            # renumbering ids that signed picks already reference
            out.append({'id': f'{cluster}-{i:02d}',
                        'name': f'{cluster.title()} {i:02d}',
                        'cluster': cluster, 'genes': genes,
                        'theme': r['theme']})
    return out


PRESETS = _build_presets()
PRESET_BY_ID = {p['id']: p for p in PRESETS}
