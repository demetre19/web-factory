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

# ---- fluid sizes (ACSS fluidClamp via clamp.py — no literals here) --
# Every size string comes from clamp.sizes(fluid_settings(knobs)):
# the ACSS two-scale math (mobile base/ratio → min @320, desktop
# base/ratio → max @1280). Knob → setting map, ACSS defaults where a
# knob has no say (provenance: inferred):
_DENSITY_SPACE = {'space-s': (20.0, 24.0),      # compact
                  'space-m': (24.0, 30.0),      # regular = ACSS default
                  'space-l': (28.0, 36.0)}      # spacious
_BAND_SECTION = {'space-s': (2.0, 3.0),         # tight
                 'space-m': (2.5, 3.5),         # medium
                 'space-l': (3.0, 4.0)}         # airy = ACSS default
_TIER_SECTION = {'space-s': 'section-space-s', 'space-m':
                 'section-space-m', 'space-l': 'section-space-l'}


def fluid_settings(knobs):
    """knobs → the clamp.py settings record for a site with no live
    ACSS file (provenance: inferred). Desktop text = type.base on
    type.ratio; mobile text = ACSS 16px on a ratio pulled 40% toward
    1 (1.333 → 1.2, ACSS's own mobile/desktop pair); headings run on
    the ACSS heading defaults (1.2 mobile / 1.333 desktop) unless the
    DNA ratio is steeper; space base by density tier; section adjust
    by whitespace band; gutter = ACSS default."""
    import clamp
    base = float(knobs.get('type.base', 18))
    ratio = float(knobs.get('type.ratio', 1.333))
    mob_ratio = round(1 + (ratio - 1) * 0.6, 4)
    d = clamp.DEFAULTS
    h_desk = max(ratio, d['heading_scale_desk'])
    h_mob = max(mob_ratio, d['heading_scale_mob'])
    sp = _DENSITY_SPACE.get(knobs.get('space.density_scale'),
                            (24.0, 30.0))
    sec = _BAND_SECTION.get(knobs.get('grid.gutter'), (3.0, 4.0))
    return clamp.settings({
        'text_base_mob': min(16.0, base), 'text_base_desk': base,
        'text_scale_mob': mob_ratio, 'text_scale_desk': ratio,
        'heading_base_mob': min(16.0, base), 'heading_base_desk': base,
        'heading_scale_mob': h_mob, 'heading_scale_desk': h_desk,
        'space_base_mob': sp[0], 'space_base_desk': sp[1],
        'section_adjust_mob': sec[0], 'section_adjust_desk': sec[1],
        'grid_gap': knobs.get('grid.gutter') or 'space-m',
        'btn_padding_inline': round(
            0.75 * float(knobs.get('btn.padding_ratio', 2.0)), 4),
        'source': 'inferred (ACSS defaults + DNA knobs type.base/'
                  'type.ratio/space.density_scale/grid.gutter/'
                  'btn.padding_ratio)'})

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
# display-face allele → the CSS stack emitted as type.font_* knobs
_FONT_STACK = {
    'sans': 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", '
            'Roboto, Helvetica, Arial, sans-serif',
    'serif': 'ui-serif, Georgia, "Times New Roman", Times, serif',
    'mono': 'ui-monospace, Menlo, Monaco, "Courier New", monospace',
    'mixed': 'ui-sans-serif, "Avenir Next", Avenir, -apple-system, '
             'sans-serif'}

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


def sample_genotype(genes, seed=0, burst=2, temp=1.0, rng=None,
                    pool=None):
    """Profile allele distribution → seeded genotype. Dominant
    allele per gene; `burst` genes from `pool` (default: STYLISTIC)
    moved to a temperature-sampled tail allele (genome.py mutate
    semantics). Returns (genotype, wild_genes, rng)."""
    rng = rng or random.Random(seed)
    geno = {g: _dominant(genes.get(g) or {})
            for g in genome.GENE_NAMES}
    for g, a in geno.items():
        if a is None:
            geno[g] = genome.ALLELES[g][0]
    wild = []
    pool = pool if pool is not None else genome.STYLISTIC
    n = max(0, min(len(pool), burst))
    for g in rng.sample([g for g in genome.GENE_NAMES
                         if g in pool], n):
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
    n = max(0, min(len(genome.STYLISTIC), burst))
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


def css_vars(knobs, geno, accent, roles_light, fluid=None):
    """knobs + roles → the css custom-property strings. The ONLY
    place these strings are authored — every size is a clamp.py
    ACSS fluidClamp from `fluid` (default fluid_settings(knobs)),
    radius from emit_tokens' personality map, button padding in em
    (ACSS btn-padding-block 0.75em × btn.padding_ratio inline)."""
    import clamp
    import emit_tokens
    ratio = knobs['type.ratio']
    fs = fluid or fluid_settings(knobs)
    sz = clamp.sizes(fs)
    rad = emit_tokens._radius_map(knobs['radius.personality'])
    al = clamp.aliases(fs, rad)
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
        '--gap': sz[knobs['space.density_scale']],
        '--gutter': sz['gutter'],
        '--pad-block': sz[_TIER_SECTION.get(
            knobs['space.density_scale'], 'section-space-m')],
        '--f-display': sz['h1'],
        '--f-body': sz['text-m'],
        '--track': f"{knobs['type.tracking_display']}em",
        '--shadow': 'none' if lvl == 0 else
            f'0 {2 * lvl}px {8 * lvl}px rgb(0 0 0 /'
            f' {6 + 4 * lvl}%)',
        '--btn-pad': f"{al['btn-padding-block']} "
                     f"{al['btn-padding-inline']}",
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
    # the CSS font stacks ride as knobs so emit_tokens' primitives
    # can bind --font-display/--font-body from DNA (F6 fix).
    knobs['type.font_display'] = _FONT_STACK[geno['display-face']]
    knobs['type.font_body'] = _FONT_STACK[geno['display-face']]
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
           force_genes=None, pool=None):
    """site_type + seed → the full derived DNA record.

    declared = {'vibe', 'site_type', 'recipe', 'copy', 'cta',
                'accent'} — authored content + declared colour.
    force_genes = {gene: allele} — legal allele overrides for the
    retry lane (still machinery-legal values, recorded)."""
    declared = declared or {}
    prof = profile(site_type)
    genes = prof['genes']
    geno, wild, _ = sample_genotype(genes, seed=seed, burst=burst,
                                    temp=temp, pool=pool)
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
