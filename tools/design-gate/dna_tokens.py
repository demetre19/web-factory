#!/usr/bin/env python3
"""dna_tokens.py — the genotype→tokens mapper. THE ONLY place a
CSS custom-property string for a DNA is authored.

  from dna_tokens import derive, mutate_genotype

  d = derive('services', seed=7, declared={
      'vibe': 'Heritage trade', 'site_type': 'trade contractor',
      'accent': '#2F7D5B', 'recipe': 'brixies/cta-sections/cta-41.topo',
      'copy': ('Book your walkthrough', '…'), 'cta': 'Get a quote'})

  → {'profile': 'profile-services', 'seed': 7,
     'genotype': {<gene>: <allele>}, 'wildcard': [genes],
     'novelty': 0.08,
     'knobs': {knob: value, …},             # DNA.json knob shape
     'knob_provenance': {knob: {source, sample_n, …}},
     'vars': {'--bg': …, '--gap': …, …},    # css strings
     'modes': {'light': roles, 'dark': roles},
     'layout', 'seam', 'ornament', 'media_weight',
     'font', 'tracking', … + declared fields}

Pipeline: profile → seeded genotype (dominant allele + temperature-
sampled tail alleles on `genome.STYLISTIC`, same semantics as
`genome.py mutate`) → knobs clamped/snapped inside knobs.json ranges
→ css vars bound to canonical ACSS space/section-space rungs and the
canonical neutral palettes.

Colours: profiles carry no colour evidence (corpus mines structure,
not palettes) so neutrals bind the canonical DNA.json fixture palette
(source: profile-neutral) and the accent is a DECLARED input
(source: chosen) — never invented hex.

`mutate_genotype` is the sibling machinery: same seeded tail sampling
against the same profile so a "more like this" chip is a real allele
move, recorded as {gene: from→to}.
"""
import json
import math
import os
import random
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import genome  # noqa: E402
import gate  # noqa: E402

ROOT = genome.DNA            # docs/machinery/design/dna
KNOBS = gate.knob_set()

# ---- canonical rungs (templates/astro/src/styles/global.css) -------
# verbatim ACSS ramps with vi→cqi: same interpolation, the
# container width as the axis. Browser-valid clamp math; the
# rasteriser's _cqi() evaluates the offset + slope form.
SPACE_RUNG = {
    'space-xs': 'clamp(0.5rem,0.4rem + 0.5cqi,1rem)',
    'space-s': 'clamp(0.75rem,0.55rem + 1cqi,1.5rem)',
    'space-m': 'clamp(1rem,0.65rem + 1.75cqi,2rem)',
    'space-l': 'clamp(1.5rem,1rem + 2.5cqi,3rem)',
    'space-xl': 'clamp(2rem,1.3rem + 3.5cqi,4rem)',
    'space-xxl': 'clamp(3rem,2rem + 5cqi,6rem)'}
SECTION_RUNG = {
    'section-space-xs': 'clamp(2rem,1.5rem + 2.5cqi,4rem)',
    'section-space-s': 'clamp(3rem,2rem + 5cqi,5rem)',
    'section-space-m': 'clamp(4rem,2.5rem + 7.5cqi,6rem)',
    'section-space-l': 'clamp(6rem,4rem + 10cqi,8rem)',
    'section-space-xl': 'clamp(8rem,5rem + 15cqi,10rem)',
    'section-space-xxl': 'clamp(10rem,6rem + 20cqi,12rem)'}

# ---- canonical neutral palettes (fixtures/_base/DNA.json modes) ----
NEUTRAL_LIGHT = {
    'bg': '#FDFCFA', 'surface': '#F1EFEC', 'surface_elevated':
        '#EBE7E1', 'border': '#D8D3CC', 'ink': '#221F1B',
    'ink_muted': '#6F665D', 'inverse': '#1D2325'}
NEUTRAL_DARK = {
    'bg': '#14181A', 'surface': '#1C2224', 'surface_elevated':
        '#232A2C', 'border': '#2C3437', 'ink': '#EDEBE7',
    'ink_muted': '#A8A49D', 'inverse': '#F4F2EE'}

_FONTS = '/System/Library/Fonts'
_FONT = {  # display-face allele → rasteriser path
    'sans': _FONTS + '/Helvetica.ttc',
    'serif': _FONTS + '/Supplemental/Georgia.ttf',
    'mono': _FONTS + '/Menlo.ttc',
    'mixed': _FONTS + '/Supplemental/Avenir Next.ttc'}
_FONT_LABEL = {'sans': 'Helvetica', 'serif': 'Georgia',
               'mono': 'Menlo', 'mixed': 'Avenir Next'}

# ---- genotype → knobs (the explicit map; every value snaps inside
# knobs.json ranges/steps before emission) ---------------------------
_CONTRAST_RATIO = {'low': 1.1875, 'medium': 1.25,
                   'high': 1.375, 'extreme': 1.5}
_DENSITY_BASE = {'compact': 16, 'regular': 17, 'spacious': 19}
_CONTRAST_WEIGHT = {'low': 500, 'medium': 600,
                    'high': 700, 'extreme': 800}
_BAND_TRACKING = {'tight': -0.04, 'medium': -0.02, 'airy': -0.005}
_DENSITY_SCALE = {'compact': 'space-s', 'regular': 'space-m',
                  'spacious': 'space-l'}
_BAND_GUTTER = {'tight': 'space-s', 'medium': 'space-m',
                'airy': 'space-l'}
_RADIUS_P = {'sharp': 'p1', 'soft': 'p3', 'pill': 'p4', 'mixed': 'p2'}
_ACCENT_USE = {'single-primary': 'cta-only', 'dual': 'cta+motif',
               'multi': 'cta+motif+links', 'none': 'cta-only'}
_REGISTER_TINT = {'ultra': 0.01, 'luxury': 0.02, 'premium': 0.02,
                  'approachable': 0.05, 'everyday': 0.06}
_DENSITY_ELEV = {'compact': 0, 'regular': 1, 'spacious': 2}
_MOTION = {'static': 'none', 'subtle': 'subtle',
           'expressive': 'playful', 'cinematic': 'elegant'}
_TREATMENT = {'minimal': 'natural', 'editorial': 'editorial-crop',
              'luxury': 'cinematic', 'bold-graphic': 'duotone',
              'playful': 'duotone', 'technical': 'bw'}
_DENSITY_BTN = {'compact': 's', 'regular': 'm', 'spacious': 'l'}
_ARCH_LEFT = {'editorial-single', 'sequence-steps', 'accordion-list',
              'table-matrix', 'immersive-media', 'full-bleed-media',
              'masonry-grid'}
_ARCH_CENTER = {'stacked-center', 'card-grid-2', 'card-grid-3',
                'card-grid-4', 'horizontal-band', 'carousel-track'}
_WIDTH_RUNG = {'card-grid-2': '50', 'card-grid-3': '60',
               'card-grid-4': '70', 'split-media': '60',
               'editorial-single': '60', 'table-matrix': '80',
               'accordion-list': '70'}
_MEDIA_W = {'text-led': 'none', 'balanced': 'thumb',
            'image-led': 'hero', 'media-first': 'hero'}
_ORNAMENT = {'none': 'none', 'technical': 'grid',
             'botanical': 'dimension', 'wordmark': 'ticks'}


def profile(site_type):
    p = os.path.join(ROOT, site_type + '.json')
    if not os.path.exists(p):
        raise SystemExit(
            f'dna_tokens: no profile for {site_type!r} in {ROOT} — '
            'run `genome.py profiles` or pass a declared vertical')
    return json.load(open(p))


def _dominant(dist):
    """Most probable allele (first key in the emitted profile,
    which genome.py writes sorted by frequency)."""
    return next(iter(dist)) if dist else None


def sample_genotype(genes, seed=0, burst=2, temp=1.0, rng=None):
    """Profile allele distribution → seeded genotype. Dominant
    allele per gene; `burst` stylistic genes moved to a
    temperature-sampled tail allele (genome.py mutate semantics).
    Returns (genotype, wild_genes, rng)."""
    rng = rng or random.Random(seed)
    geno = {g: _dominant(genes.get(g) or {})
            for g in genome.GENE_NAMES}
    for g, a in geno.items():
        if a is None:
            geno[g] = genome.ALLELES[g][0]
    wild = []
    n = max(0, min(2, burst))
    for g in rng.sample([g for g in genome.GENE_NAMES
                         if g in genome.STYLISTIC], n):
        dist = genes.get(g) or {}
        ranked = sorted(dist.items(), key=lambda kv: kv[1])
        tail = [a for a, p in ranked
                if p <= max(0.05, 1.0 / max(1, len(ranked)))]
        if not tail:
            tail = [a for a in genome.ALLELES[g] if a != geno[g]]
        w = [math.exp(-temp * i) for i in range(len(tail))]
        geno[g] = rng.choices(tail, weights=w, k=1)[0]
        wild.append(g)
    return geno, wild, rng


def mutate_genotype(geno, genes, seed=0, burst=1, temp=0.7):
    """Sibling move: copy the genotype, tail-sample `burst`
    stylistic genes. Returns (geno', moves[{gene,from,to}], wild)."""
    rng = random.Random(seed)
    out = dict(geno)
    moves, wild = [], []
    n = max(0, min(2, burst))
    for g in rng.sample([g for g in genome.GENE_NAMES
                         if g in genome.STYLISTIC], n):
        dist = genes.get(g) or {}
        ranked = sorted(dist.items(), key=lambda kv: kv[1])
        tail = [a for a, p in ranked
                if p <= max(0.05, 1.0 / max(1, len(ranked)))
                and a != geno.get(g)]
        if not tail:
            tail = [a for a in genome.ALLELES[g]
                    if a != geno.get(g)]
        w = [math.exp(-temp * i) for i in range(len(tail))]
        new = rng.choices(tail, weights=w, k=1)[0]
        moves.append({'gene': g, 'from': geno.get(g), 'to': new})
        out[g] = new
        wild.append(g)
    return out, moves, wild


def _snap(knob, value):
    """Clamp a number knob into range and snap to step."""
    spec = KNOBS.get(knob) or {}
    lo, hi = spec.get('range', [value, value])
    step = spec.get('step', 0)
    v = max(lo, min(hi, value))
    if step:
        v = lo + round((v - lo) / step) * step
        v = max(lo, min(hi, round(v, 6)))
    return v


def knobs_for(geno, genes, sample_n):
    """Genotype → knobs.json values; every value inside its closed
    range/enum. Returns (knobs, provenance)."""
    k = {}
    prov = {}

    def put(name, value, source='profile'):
        k[name] = value
        prov[name] = {'source': source, 'sample_n': sample_n}

    tier = geno['density-tier']
    contrast = geno['type-contrast']
    band = geno['whitespace-band']
    put('type.ratio', _snap('type.ratio', _CONTRAST_RATIO[contrast]))
    put('type.base', _snap('type.base', _DENSITY_BASE[tier]))
    put('type.display_weight',
        _snap('type.display_weight', _CONTRAST_WEIGHT[contrast]))
    put('type.tracking_display',
        _snap('type.tracking_display', _BAND_TRACKING[band]))
    put('space.density_scale', _DENSITY_SCALE[tier])
    put('space.section_py',
        {t: r for t, r in KNOBS['space.section_py']
         .get('acss', {}).items()} or {
            'compact': 'section-space-s', 'regular':
                'section-space-m', 'spacious': 'section-space-l'})
    put('grid.gutter', _BAND_GUTTER[band])
    put('radius.personality', _RADIUS_P[geno['radius-personality']])
    put('color.surface_contrast',
        _snap('color.surface_contrast',
              {'single-surface': 0.02, 'alternating': 0.05,
               'one-contrast-moment': 0.08, 'dark-dominant': 0.08,
               'media-interleaved': 0.06}
              [geno['surface-rhythm']]))
    put('color.accent_usage', _ACCENT_USE[geno['cta-restraint']])
    put('color.neutral_tint',
        _snap('color.neutral_tint',
              _REGISTER_TINT[geno['mood-register']]))
    put('elevation.level',
        int(_snap('elevation.level', _DENSITY_ELEV[tier])))
    put('motion.level', _MOTION[geno['motion-tier']])
    put('image.treatment', _TREATMENT[geno['image-style']])
    put('motion.engine', 'gsap' if geno['motion-tier'] == 'cinematic'
        else 'css')
    put('btn.padding_ratio',
        _snap('btn.padding_ratio',
              {'compact': 1.5, 'regular': 2.0, 'spacious': 2.5}
              [tier]))
    put('btn.size', _DENSITY_BTN[tier])
    put('width.inner_rung',
        _WIDTH_RUNG.get(geno['layout-archetype'], '60'))
    return k, prov


def _lum(hexv):
    rgb = gate._rgb(hexv)
    return gate._lum(rgb) if rgb else None


def css_vars(knobs, geno, accent, roles_light):
    """knobs + roles → the css custom-property strings. The ONLY
    place these strings are authored — rungs bound verbatim from
    SPACE_RUNG/SECTION_RUNG, radius from emit_tokens' personality
    map, type from emit_tokens' scale math."""
    import emit_tokens
    base_px = knobs['type.base']
    ratio = knobs['type.ratio']
    sizes = emit_tokens._type_sizes(base_px, ratio)
    display = sizes['2xl']
    body = max(16.0, sizes['base'])
    rad = emit_tokens._radius_map(knobs['radius.personality'])
    pad_y = round(body / 16.0 * knobs['btn.padding_ratio'] * 0.32, 2)
    pad_x = round(body / 16.0 * knobs['btn.padding_ratio'], 2)
    lvl = knobs['elevation.level']
    ink = roles_light['ink']
    acc_ink = roles_light['ink'] if (_lum(accent) or 0) > 0.45 \
        else NEUTRAL_LIGHT['bg']
    return {
        '--bg': roles_light['bg'], '--surface':
            roles_light['surface'],
        '--ink': roles_light['ink'], '--muted':
            roles_light['ink_muted'],
        '--line': roles_light['border'],
        '--accent': accent, '--accent-ink': acc_ink,
        '--radius': f'{rad}rem',
        '--gap': SPACE_RUNG[knobs['space.density_scale']],
        '--pad-block': SECTION_RUNG[
            { 'compact': 'section-space-s',
              'regular': 'section-space-m',
              'spacious': 'section-space-l'}
            [geno['density-tier']]],
        '--f-display': f'clamp({display / 16:.3f}rem,'
                       f'{display / 12:.1f}cqi,'
                       f'{sizes["3xl"] / 16:.3f}rem)',
        '--f-body': f'clamp({max(16, body - 1) / 16:.3f}rem,'
                    f'{body / 12:.1f}cqi,'
                    f'{body / 16:.3f}rem)',
        '--track': f"{knobs['type.tracking_display']}em",
        '--shadow': 'none' if lvl == 0 else
            f'0 {2 * lvl}px {8 * lvl}px rgb(0 0 0 /'
            f' {6 + 4 * lvl}%)',
        '--btn-pad': f'{pad_y}rem {pad_x}rem',
        '--font-display': _FONT_LABEL[geno['display-face']],
        '--font-body': _FONT_LABEL[geno['display-face']],
        '--type-ratio': str(ratio),
        '--display-weight': str(knobs['type.display_weight'])}


def roles_for(geno, accent):
    """Surface-rhythm → the canvas family. dark-dominant renders on
    the canonical dark palette; everything else is light. Accent is
    declared input — recorded, never invented."""
    dark = geno['surface-rhythm'] == 'dark-dominant'
    canvas = dict(NEUTRAL_DARK) if dark else dict(NEUTRAL_LIGHT)
    canvas['accent'] = accent
    canvas['accent_foreground'] = (
        canvas['ink'] if (_lum(accent) or 0) > 0.45
        else NEUTRAL_LIGHT['bg'])
    light = dict(canvas)
    darkm = dict(NEUTRAL_DARK)
    darkm['accent'] = accent
    darkm['accent_foreground'] = canvas['accent_foreground']
    return light, darkm


def _finish(geno, genes, site_type, seed, declared, wild=(),
            moves=None, profile_n=0):
    """Shared tail: genotype → knobs → vars + record fields."""
    knobs, prov = knobs_for(geno, genes, profile_n)
    for g, m in (moves or {}).items():
        prov[g] = {'source': 'rule-retry', 'sample_n': profile_n,
                   'move': m}
    accent = declared.get('accent')
    if not accent:
        raise SystemExit(
            'dna_tokens: accent is a declared input — pass it; the '
            'machinery derives neutrals but never invents hex')
    prov['color.accent'] = {'source': 'chosen', 'sample_n': profile_n,
                            'value': accent}
    light, dark = roles_for(geno, accent)
    vs = css_vars(knobs, geno, accent, light)
    nov = genome.novelty(geno, site_type)
    return {
        'profile': f'profile-{site_type}',
        'vertical': site_type, 'seed': seed,
        'genotype': geno, 'wildcard': list(wild),
        'genotype_moves': moves or {}, 'novelty': nov,
        'knobs': knobs, 'knob_provenance': prov,
        'vars': vs,
        'modes': {'light': light, 'dark': dark},
        'layout': ('left' if geno['layout-archetype'] in _ARCH_LEFT
                   else 'center' if geno['layout-archetype']
                   in _ARCH_CENTER else 'split'),
        'seam': 'hairline',
        'ornament': _ORNAMENT.get(geno.get('ornament'), 'none'),
        'media_weight': _MEDIA_W[geno['image-led-ratio']],
        'font': _FONT[geno['display-face']],
        'font_name': _FONT_LABEL[geno['display-face']],
        'tracking': knobs['type.tracking_display'],
        'vibe': declared.get('vibe', site_type.title()),
        'site_type': declared.get('site_type', site_type),
        'recipe': declared.get('recipe', ''),
        'copy': declared.get('copy', ('', '')),
        'cta': declared.get('cta', 'Act'),
        'declared': declared}


def from_genotype(geno, site_type, declared, seed=0):
    """Recompute the full record for a caller-supplied genotype —
    the sibling lane's entry point (mutate_genotype then this)."""
    prof = profile(site_type)
    return _finish(geno, prof['genes'], site_type, seed, declared,
                   profile_n=prof.get('n', 0))


def derive(site_type, seed=0, declared=None, burst=2, temp=1.0,
           force_genes=None):
    """site_type + seed → the full derived DNA record.

    declared = {'vibe', 'site_type', 'recipe', 'copy', 'cta',
                'accent'} — authored content + declared colour.
    force_genes = {gene: allele} — legal allele overrides for the
    retry lane (still machinery-legal values, recorded)."""
    declared = declared or {}
    prof = profile(site_type)
    genes = prof['genes']
    geno, wild, _ = sample_genotype(genes, seed=seed, burst=burst,
                                    temp=temp)
    moves = {}
    for g, a in (force_genes or {}).items():
        if a in genome.ALLELES.get(g, ()):
            moves[g] = {'from': geno.get(g), 'to': a}
            geno[g] = a
    out = _finish(geno, genes, site_type, seed, declared, wild,
                  moves, prof.get('n', 0))
    out['profile'] = prof.get('id', f'profile-{site_type}')
    return out


def dna_json(rec, site='proof'):
    """The DNA.json shape (DNA-MAP.md) for one derived record —
    genotype + knobs + modes + provenance chain the gate can read."""
    return {'version': 1, 'site': site,
            'vertical_profile': rec['profile'],
            'genotype': rec['genotype'],
            'knobs': rec['knobs'],
            'modes': rec['modes'],
            'seed': rec['seed'],
            'wildcard_genes': rec['wildcard'],
            'novelty': rec['novelty'],
            'provenance': rec['knob_provenance']}


if __name__ == '__main__':
    # dna_tokens.py services 7 '#2F7D5B'
    out = derive(sys.argv[1], seed=int(sys.argv[2]) if len(
        sys.argv) > 2 else 0,
                 declared={'accent': sys.argv[3] if len(
                     sys.argv) > 3 else '#0055AA'})
    print(json.dumps(out, indent=1, default=str))
