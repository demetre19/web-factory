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
    {'group': 'Type', 'axis': 'type-scale',
     'alleles': ['gentle', 'balanced', 'dramatic', 'poster']},
    {'group': 'Type', 'axis': 'type-contrast',
     'alleles': ['low', 'medium', 'high', 'extreme']},
    {'group': 'Type', 'axis': 'heading-form',
     'alleles': ['label', 'query', 'underline']},
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
     'alleles': ['open', 'folded', 'carousel']},
    {'group': 'Mood', 'axis': 'mood-energy',
     'alleles': ['still', 'calm', 'balanced', 'lively', 'energetic']},
    {'group': 'Mood', 'axis': 'mood-register',
     'alleles': ['everyday', 'approachable', 'premium', 'luxury',
                 'ultra']},
    {'group': 'Mood', 'axis': 'trend',
     'alleles': ['none', 'cute-alism', 'dial-up-delight',
                 'resonant-stark', 'frosted-touch',
                 'light-skeuomorphism',
                 'snug-simple', 'human-scribble', 'dated']},
    {'group': 'Mood', 'axis': 'palette',
     # last — the palette is the cluster's identity; it wins over
     # register accents so each cluster keeps its own accent colour
     'alleles': ['porcelain', 'cream', 'ink', 'rose', 'moss', 'solar',
                 'slate', 'plum', 'sand', 'ocean', 'ember', 'forest']},
]
_AXIS_ORDER = [a['axis'] for a in AXES]

# ------------------------------------------------------------------
# allele → token deltas. L = light :root vars, D = dark-mode vars,
# S = structural shape css (arrangement the vars can't express).
# ------------------------------------------------------------------
_SANS = 'ui-sans-serif,system-ui,sans-serif'
_SERIF = 'Georgia,"Times New Roman",serif'
_MONO = 'ui-monospace,"SF Mono",Menlo,monospace'

# ---------------------------------------------------------------
# palette axis — the biggest visible difference between vibes is
# colour, and no allele used to set a light-mode page colour at
# all (audit: 54 surviving presets shared ONE background). Each
# palette carries a full light + dark role set; accents run through
# pair_surface/pair_ink afterwards so C.1 holds either way.
# ---------------------------------------------------------------
def _pal(bg, sur, elev, txt, sub, brd, act, hov,
         dbg, dsur, delev, dtxt, dsub, dbrd, dact, dhov, dink):
    return ({'L': '--bg-canvas:%s;--bg-surface:%s;--bg-elevated:%s;'
             '--text-primary:%s;--text-secondary:%s;'
             '--border-default:%s;--action-primary:%s;'
             '--action-primary-hover:%s' % (bg, sur, elev, txt, sub,
                                            brd, act, hov),
             'D': '--bg-canvas:%s;--bg-surface:%s;--bg-elevated:%s;'
             '--text-primary:%s;--text-secondary:%s;'
             '--border-default:%s;--action-primary:%s;'
             '--action-primary-hover:%s;--action-primary-ink:%s'
             % (dbg, dsur, delev, dtxt, dsub, dbrd, dact, dhov, dink)},)

_PALETTES = {
    'porcelain': _pal('#FBFAF8', '#F3F1EC', '#FFFFFF', '#1B1B1F',
        '#6B6B70', '#E4E1DA', '#4F46E5', '#4338CA',
        '#141416', '#1C1C20', '#242429', '#EDEDEB', '#A5A5A0',
        '#333338', '#A5B4FC', '#C7D2FE', '#141B3F'),
    'cream': _pal('#F7F1E5', '#EFE7D7', '#FDFAF3', '#2B2418',
        '#6F6554', '#E0D4BE', '#2F6B3C', '#245431',
        '#191712', '#211E17', '#2A2620', '#EDE6D6', '#B3A88F',
        '#3B3529', '#9CCB8C', '#C0E4B2', '#12200F'),
    'ink': _pal('#ECEFF1', '#E0E5E8', '#FFFFFF', '#10181C',
        '#55656D', '#CBD5DA', '#0E7490', '#0B5C72',
        '#0B1114', '#131B1F', '#1B262C', '#E2EAED', '#94A7AE',
        '#26343B', '#5AD8E6', '#93E8F2', '#062A31'),
    'rose': _pal('#FAF1F0', '#F3E4E3', '#FFFFFF', '#35201F',
        '#7F5B58', '#EAD4D2', '#A33348', '#822539',
        '#1D1214', '#291A1D', '#342024', '#F0DCDC', '#C29B98',
        '#4A2E33', '#E88FA1', '#F2B4C1', '#38101B'),
    'moss': _pal('#EFF1E8', '#E3E7D8', '#FBFCF7', '#232A1D',
        '#5E6753', '#D4DAC3', '#4C6B2A', '#3A5420',
        '#12150F', '#1A1E15', '#23291C', '#E4E9D8', '#A4AE8F',
        '#323A28', '#B0D18B', '#CCE3AE', '#1B2A0E'),
    'solar': _pal('#FDF8F0', '#F6EDDC', '#FFFFFF', '#2E2412',
        '#73664B', '#EBDCC2', '#D4421E', '#B03615',
        '#1A1208', '#251A0D', '#302315', '#F3E8D2', '#C2AE8C',
        '#46351D', '#FFB45E', '#FFCF8E', '#3A1E04'),
    'slate': _pal('#EFF1F5', '#E2E5EC', '#FFFFFF', '#1F2430',
        '#57606F', '#D3D8E2', '#34559E', '#27417D',
        '#11141B', '#191D26', '#222733', '#E3E8F0', '#9AA5B8',
        '#303849', '#8FAFF7', '#B3CBFA', '#0E1E44'),
    'plum': _pal('#F3EFF7', '#E8E1EF', '#FDFCFE', '#2A1E35',
        '#66586F', '#DACFE3', '#7A3FA0', '#603080',
        '#170F1F', '#211630', '#2C1D3D', '#E9DFEF', '#B6A6C2',
        '#412C52', '#C79BE7', '#DCBDF0', '#2A1140'),
    'sand': _pal('#F6EFE4', '#EBDFCC', '#FFFFFF', '#33291A',
        '#6D614D', '#DECFAB', '#B4582B', '#94461F',
        '#191510', '#221C13', '#2C2518', '#EBDFC9', '#B8A889',
        '#403626', '#E8A46E', '#F0C294', '#3A230C'),
    'ocean': _pal('#EDF4F6', '#DCE9ED', '#FFFFFF', '#0F2630',
        '#49626C', '#C9DCE1', '#0D5C75', '#094A5E',
        '#0A161B', '#112229', '#183038', '#DCECEF', '#93B0B8',
        '#24434E', '#6CC6DB', '#9ADBEB', '#04303C'),
    'ember': _pal('#FBF3EC', '#F3E6D8', '#FFFFFF', '#331D10',
        '#785A46', '#E8D5C0', '#B23A1D', '#8F2D14',
        '#150D08', '#20140B', '#2B1C10', '#F0E2D2', '#BFA285',
        '#432B18', '#F08A55', '#F5AC80', '#3A1604'),
    'forest': _pal('#EEF3EE', '#E0EAE0', '#FFFFFF', '#17281B',
        '#4E6852', '#C9DCCB', '#1E5C33', '#154726',
        '#0C140E', '#132017', '#1B2C20', '#DCEBDD', '#96B39A',
        '#27402D', '#7FC98F', '#A4DDB0', '#0C2A15'),
}


def _den(var):
    return ('--flow-spacing:var(--space-%s);--grid-gap:var(--space-%s);'
            '--content-gap:var(--space-%s)' % (var, var, var))


_ALLELE = {
    'palette': _PALETTES,
    'display-face': {
        # real pairings — heading/body families differ per face
        'sans': ({'L': '--font-display:' + _SANS +
                  ';--primitive-font-display:' + _SANS +
                  ';--font-body:' + _SANS},),
        'serif': ({'L': '--font-display:' + _SERIF +
                   ';--primitive-font-display:' + _SERIF +
                   ';--font-body:' + _SERIF},),
        'mono': ({'L': '--font-display:' + _MONO +
                  ';--primitive-font-display:' + _MONO +
                  ';--font-body:' + _MONO},),
        'mixed': ({'L': '--font-display:' + _SERIF +
                   ';--primitive-font-display:' + _SERIF +
                   ';--font-body:' + _SANS},),
    },
    'type-scale': {
        # heading ratio actually changes — audit: --fs-* never moved
        'gentle': ({'L': '--h1:clamp(1.6rem,calc(2.2vw + 1.05rem),'
                    '2.9rem);--h2:clamp(1.35rem,calc(1.4vw + 1rem),'
                    '2.15rem);--h3:clamp(1.15rem,calc(0.8vw + 1rem),'
                    '1.6rem)'},),
        'balanced': ({'L': '--h1:clamp(1.8rem,calc(3.4vw + 1rem),'
                      '3.8rem);--h2:clamp(1.45rem,calc(1.8vw + '
                      '1.05rem),2.5rem);--h3:clamp(1.2rem,calc(0.9vw'
                      ' + 1rem),1.7rem)'},),
        'dramatic': ({'L': '--h1:clamp(2.1rem,calc(4.8vw + 1rem),'
                      '5rem);--h2:clamp(1.6rem,calc(2.6vw + 1rem),'
                      '3.3rem);--h3:clamp(1.3rem,calc(1.2vw + '
                      '1.05rem),2rem)'},),
        'poster': ({'L': '--h1:clamp(2.6rem,calc(6.6vw + 1rem),'
                    '6.4rem);--h2:clamp(1.9rem,calc(3.6vw + 1rem),'
                    '4.4rem);--h3:clamp(1.4rem,calc(1.5vw + 1.05rem),'
                    '2.5rem);--text-l:clamp(1.25rem,calc(0.8vw + '
                    '1.05rem),1.8rem)'},),
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
        # emitted pages wrap headings in .sec-inner — .sec-h never
        # exists in the built DOM
        'label': ({'S': '.sec-inner h2{text-transform:uppercase;'
                   'letter-spacing:.12em;font-size:.9em}'},),
        'query': ({'S': '.sec-inner h2::after{content:"?"}'},),
        'underline': ({'S': '.sec-inner h2{text-decoration:underline;'
                       'text-decoration-thickness:.07em;'
                       'text-underline-offset:.14em}'},),
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
        '3': ({'S': '@media (min-width:640px){.card-grid{'
               'grid-template-columns:repeat(3,1fr)!important}}'},),
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
        'subtle': ({'S': 'a,button{transition:color .14s ease,'
                    'background-color .14s ease}'},),
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
        'open': ({'S': 'details>summary{font-weight:600}'},),
        'folded': ({'S': 'details>summary{cursor:pointer}'
                   'details:not([open])>summary~*{display:none}'},),
        'carousel': ({'S': '.card-grid{overflow-x:auto;'
                      'scroll-snap-type:x proximity}'
                      '.card-grid>*{scroll-snap-align:start}'},),
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
    # each cluster pins a palette allele — the colour identity is
    # part of the vibe, and it travels in the genes so 'use vibe'
    # carries it anywhere resolve() runs
    ('noir', 9, {'palette': 'ink',
                 'surface-rhythm': 'dark-dominant',
                 'radius-personality': 'sharp',
                 'type-contrast': 'high', 'mood-register': 'premium'}),
    ('paper', 10, {'palette': 'cream',
                   'display-face': 'serif', 'density-tier': 'spacious',
                   'mood-energy': 'calm',
                   'surface-rhythm': 'single-surface'}),
    ('neon', 8, {'palette': 'plum',
                 'surface-rhythm': 'dark-dominant',
                 'radius-personality': 'pill',
                 'mood-energy': 'energetic',
                 'motion-tier': 'expressive'}),
    ('brutal', 10, {'palette': 'porcelain',
                    'radius-personality': 'sharp',
                    'type-contrast': 'extreme',
                    'trend': 'resonant-stark',
                    'mood-energy': 'still'}),
    ('luxe', 10, {'palette': 'sand',
                  'display-face': 'serif', 'mood-register': 'luxury',
                  'radius-personality': 'mixed',
                  'whitespace-band': 'airy'}),
    ('minimal', 10, {'palette': 'porcelain',
                     'surface-rhythm': 'single-surface',
                     'mood-energy': 'still', 'type-contrast': 'low',
                     'image-style': 'minimal'}),
    ('playful', 10, {'palette': 'rose',
                     'radius-personality': 'pill',
                     'mood-energy': 'lively',
                     'mood-register': 'everyday',
                     'image-style': 'playful'}),
    ('editorial', 10, {'palette': 'ocean',
                       'display-face': 'mixed',
                       'surface-rhythm': 'alternating',
                       'type-contrast': 'high',
                       'image-style': 'editorial'}),
    ('mono-type', 8, {'palette': 'forest',
                      'display-face': 'mono',
                      'image-style': 'technical',
                      'radius-personality': 'sharp'}),
    ('warm', 10, {'palette': 'moss',
                  'mood-register': 'approachable',
                  'density-tier': 'regular',
                  'radius-personality': 'soft'}),
    ('industrial', 8, {'palette': 'slate',
                       'density-tier': 'compact',
                       'image-style': 'technical',
                       'radius-personality': 'sharp',
                       'type-contrast': 'medium'}),
    ('gallery', 8, {'palette': 'ember',
                    'surface-rhythm': 'media-interleaved',
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
# vars that never change the RENDERED first screen: radii, shadows,
# borders, gaps, hover/ink states. Palette, text, font, type-scale,
# measure and action colours ARE visible above the fold — they stay
# in the signature so palette twins no longer read as distinct
_FS_INVISIBLE_PREFIXES = (
    '--radius', '--primitive-radius', '--r-', '--shadow',
    '--content-gap', '--flow-spacing', '--grid-gap', '--gap',
    '--border', '--action-primary-hover', '--action-primary-ink',
    '--lh-')


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
            fil(r['tokens']['dark']), r['shape'])


# dropped candidate id → the survivor id it was deduped into;
# stored picks naming a culled preset still resolve to a real vibe
# instead of falling back to null
_PRESET_ALIAS = {}


def _build_presets():
    out, seen, seen_sig = [], set(), {}
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
            pid = f'{cluster}-{i:02d}'
            if ssig in seen_sig:
                # structural twin of an earlier preset — same face /
                # radius / spacing / shape, differing only in colour;
                # skip it rather than minting a near-identical card,
                # but alias the would-be id to the survivor so stored
                # picks keep resolving
                _PRESET_ALIAS[pid] = seen_sig[ssig]
                continue
            seen_sig[ssig] = pid
            got += 1
            # id from the generation index, not the kept count: the
            # sweep is deterministic on (cluster, i), so structural-
            # dedupe changes leave gaps instead of silently
            # renumbering ids that signed picks already reference
            out.append({'id': pid,
                        'name': f'{cluster.title()} {i:02d}',
                        'cluster': cluster, 'genes': genes,
                        'theme': r['theme']})
    return out


PRESETS = _build_presets()
PRESET_BY_ID = {p['id']: p for p in PRESETS}
PRESET_ALIAS = dict(_PRESET_ALIAS)
