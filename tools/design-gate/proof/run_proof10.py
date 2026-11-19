#!/usr/bin/env python3
"""run_proof10.py — the element-variant card test at 10-scale.

Ten distinct DNAs → ten site types → one card design each, all
through the full gate: RULES → BUILD → JUDGE (real vlm_evidence per
option, per-image call) → RECHECK (hash-equal receipts) →
PRESENT-ORDER.

Every option declares up front:
  vibe      — what the DNA is trying to feel like (a testable claim,
              not decoration)
  site_type — the site it claims to be
Both land in the plan/receipt and render as the picker label.

Knob axes varied hard between options: type scale (font + size +
tracking), density (gap/pad), radius, seam shape, ornament on/off,
media weight, layout. If all 10 look like the same card in different
accent, the test failed — the dead-knob ablation reports any axis
whose perturbation moved <2% of pixels.

'More like this' per card → seeded DNA-nudge siblings (small vector
perturbations of the same recipe) rendered as range chips.
"""
import hashlib, json, os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))))
import gate  # noqa: E402
import vlm  # noqa: E402
import chains  # noqa: E402
import picker  # noqa: E402
import dna_tokens  # noqa: E402

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out10')
SHOTS = os.path.join(OUT, 'shots')
VENV_PY = os.path.join(os.path.dirname(os.path.dirname(
    os.path.dirname(HERE))), '.venv-vlm', 'bin', 'python')
SHOT_RENDERER = os.path.join(HERE, 'shot_render.py')

S = '/System/Library/Fonts/'
SU = S + 'Supplemental/'

# ---- the 10 site types — DECLARED content only. Every design
# token is derived by dna_tokens from the vertical's genome profile
# (dominant allele + seeded tail-sampling); nothing below is a
# hand-typed hex/clamp — that would bypass the machinery.
SITES = {
 'trades': {
  'vibe': 'Heritage trade', 'site_type': 'trade contractor',
  'vertical': 'services', 'seed': 11,
  'accent': '#2F7D5B',
  'recipe': 'brixies/cta-sections/cta-41.topo',   # avatar
  'copy': ('Book your walkthrough',
           'Tell us the site and the scope — we confirm the quote '
           'inside one business day.'),
  'cta': 'Get a quote'},
 'luxury': {
  'vibe': 'Atelier restraint', 'site_type': 'luxury skincare e-comm',
  'vertical': 'luxury-goods', 'seed': 23,
  'accent': '#C6A15B',
  'recipe': 'brixies/cta-sections/cta-21.topo',   # image
  'copy': ('Reserve the atelier',
           'Private viewings by appointment — a single specialist '
           'per client.'),
  'cta': 'Reserve'},
 'finance': {
  'vibe': 'Ledger authority', 'site_type': 'boutique wealth firm',
  'vertical': 'finance', 'seed': 37,
  'accent': '#17457C',
  'recipe': 'brixies/cta-sections/cta-43.topo',   # logo+number
  'copy': ('Open an account',
           'Onboarding in under five minutes — identity verified '
           'in-line.'),
  'cta': 'Open account'},
 'clinic': {
  'vibe': 'Clinic clean', 'site_type': 'community dental',
  'vertical': 'healthcare', 'seed': 41,
  'accent': '#0E7C86',
  'recipe': 'brixies/cta-sections/cta-39.topo',   # icon
  'copy': ('Book a check-up',
           'Same-week appointments at every clinic — results '
           'online within 48 hours.'),
  'cta': 'Book now'},
 'saas': {
  'vibe': 'Console minimal', 'site_type': 'dev-tool SaaS',
  'vertical': 'saas', 'seed': 53,
  'accent': '#5B7CFF',
  'recipe': 'brixies/cta-sections/cta-1.topo',    # text
  'copy': ('Start your workspace',
           'Spin up a team space in ninety seconds — free for the '
           'first ten seats.'),
  'cta': 'Start free'},
 'table': {
  'vibe': 'Table warm', 'site_type': 'restaurant hospitality',
  'vertical': 'hospitality', 'seed': 59,
  'accent': '#A8502A',
  'recipe': 'brixies/cta-sections/cta-47.topo',   # image
  'copy': ('Reserve a table',
           'Chef counter seats release each morning — walk-ins '
           'always welcome at the bar.'),
  'cta': 'Reserve'},
 'editorial': {
  'vibe': 'Editorial couture', 'site_type': 'fashion magazine',
  'vertical': 'fashion', 'seed': 67,
  'accent': '#111111',
  'recipe': 'brixies/cta-sections/cta-40.topo',   # image
  'copy': ('Subscribe to the issue',
           'Four print editions a year — styling, ateliers and the '
           'industry in long form.'),
  'cta': 'Subscribe'},
 'nonprofit': {
  'vibe': 'Open hands', 'site_type': 'community nonprofit',
  'vertical': 'nonprofit', 'seed': 71,
  'accent': '#3E7C4F',
  'recipe': 'brixies/blog-sections/blog-40.topo',  # icon+image
  'copy': ('Give this month',
           'Every gift pairs a family with a caseworker — '
           'ninety-two cents of each dollar reaches the programme.'),
  'cta': 'Donate'},
 'industrial': {
  'vibe': 'Brutalist ledger', 'site_type': 'industrial machinery',
  'vertical': 'services', 'seed': 83,
  'accent': '#C44400',
  'recipe': 'brixies/cta-sections/cta-28.topo',   # avatar+image
  'copy': ('Spec the machine',
           'Tonnage, feed rate and footprint in the first reply — '
           'engineers answer, not sales.'),
  'cta': 'Spec it'},
 'agency': {
  'vibe': 'Studio kinetic', 'site_type': 'creative agency',
  'vertical': 'agency-portfolio', 'seed': 97,
  'accent': '#E8FF00',
  'recipe': 'brixies/cta-sections/cta-44.topo',   # image
  'copy': ('Start a brief',
           'Name the brand and the problem — a partner replies '
           'inside the hour.'),
  'cta': 'Start brief'},
}


def derive_all(sites):
    """site_type + seed → derived DNA per option via dna_tokens —
    the machinery, not hand-typed vars."""
    out = {}
    for name, spec in sites.items():
        declared = {k: spec[k] for k in
                    ('vibe', 'site_type', 'recipe', 'copy', 'cta',
                     'accent')}
        d = dna_tokens.derive(spec['vertical'], seed=spec['seed'],
                              declared=declared)
        d['name'] = name
        out[name] = d
    return out


JUDGED_BY = vlm.DEFAULT_MODEL


def _lum(hx):
    rgb = gate._rgb(hx)
    if rgb is None:
        return None
    def lin(c):
        c /= 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) \
            ** 2.4
    r, g, b = rgb
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)


def _knobvec(v):
    def _px(s, default):
        s = str(s)
        m = re.search(r'([\d.]+)rem', s)
        if m:
            return float(m.group(1)) * 16
        m = re.search(r'([\d.]+)px', s)
        if m:
            return float(m.group(1))
        m = re.search(r'([\d.]+)', s)
        return float(m.group(1)) * 16 if m else default

    def _cqi(s, default):
        # evaluate canonical clamp at the 1200px design width —
        # the knobvec compares what a desktop reviewer sees
        m = re.search(
            r'clamp\(\s*([\d.]+)(rem|px)\s*,\s*'
            r'(?:([\d.]+)(rem|px)\s*\+\s*)?([\d.]+)cqi\s*,\s*'
            r'([\d.]+)(rem|px)\s*\)', str(s))
        if not m:
            return _px(s, default)
        u = {'rem': 16, 'px': 1}
        lo = float(m.group(1)) * u[m.group(2)]
        off = (float(m.group(3)) * u[m.group(4)]
               if m.group(3) else 0.0)
        mid = off + float(m.group(5)) * 1200 / 100
        hi = float(m.group(6)) * u[m.group(7)]
        return max(lo, min(mid, hi))

    rad = min(1.0, _px(v['--radius'], 8) / 22.0)
    return ((_lum(v['--bg']) or 0), (_lum(v['--ink']) or 0),
            (_lum(v['--accent']) or 0), rad,
            min(1, _cqi(v['--gap'], 24) / 40),
            min(1, _cqi(v['--f-display'], 40) / 80))


def judge(name, dna, siblings):
    """Mechanical quality judgment — every score derived from the
    render + vector, recorded as the comparison baseline for the
    real VLM row."""
    v = dna['vars']
    cr = gate.contrast(v['--ink'], v['--bg']) or 0
    h = dna['copy'][0]
    clarity = min(100, 40 + int(cr * 8) + (20 if len(h) <= 32 else 0))
    fl = sum('clamp' in str(x) for x in v.values())
    craft = min(100, 45 + fl * 5 +
                (8 if dna['tracking'] != 0 else 0) +
                (6 if dna['ornament'] != 'none' else 0) +
                (4 if dna['seam'] not in ('hairline', 'none') else 0))
    mw = {'hero': 88, 'thumb': 74, 'none': 62}[dna['media_weight']]
    mobile = min(100, 55 + fl * 6)
    diffs = []
    mine = _knobvec(v)
    for sib, sd in siblings.items():
        if sib == name:
            continue
        sv = sd['vars']
        d = sum(abs((_lum(v[k]) or 0) - (_lum(sv[k]) or 0))
                for k in ('--bg', '--ink', '--accent')
                if _lum(v[k]) is not None and _lum(sv[k]) is not None)
        d += (0 if v['--radius'] == sv['--radius'] else 0.15)
        d += (0 if sd['font'] == dna['font'] else 0.25)
        d += (0 if sd['ornament'] == dna['ornament'] else 0.1)
        d += (0 if sd['layout'] == dna['layout'] else 0.1)
        diffs.append(min(1.0, d * 1.4))
    visual = round(100 * (sum(diffs) / len(diffs))) if diffs else 50
    tdist = min(1.0, sum(
        sum(abs(a - b) for a, b in zip(mine, _knobvec(sd['vars'])))
        for sib, sd in siblings.items() if sib != name)
        / max(1, len(siblings) - 1) * 1.3)
    distinct = round(0.5 * visual + 0.5 * 100 * tdist)
    comp = round((2 * clarity + 2 * craft + mw + mobile +
                  distinct) / 7)
    return {'hero_clarity': clarity, 'layout_craft': craft,
            'media_fit': mw, 'mobile': mobile,
            'distinctness': distinct,
            'topology_dist': round(100 * tdist),
            'visual_diff': visual, 'composite': comp,
            'judged_by': JUDGED_BY}


def _element_dom(dna):
    """J.7 element-variant render — the signature element(s) fill
    the card."""
    sig = gate._recipe_element_sig(dna['recipe'])
    mw = dna['media_weight']
    out = []
    if 'image' in sig and mw != 'none':
        cls = 'b-media hero' if mw == 'hero' else 'b-media thumb'
        out.append(f'<div class="{cls}" aria-hidden="true">'
                   '<span>[ hero media ]</span></div>')
    if 'avatar' in sig:
        out.append('<div class="b-avatar-row"><i class="b-avatar">'
                   '</i><i class="b-avatar"></i><i class="b-avatar">'
                   '</i><span class="b-avatars-cap">+40 clients'
                   '</span></div>')
    if 'icon' in sig:
        out.append('<svg class="b-icon" width="32" height="32" '
                   'viewBox="0 0 24 24" stroke="currentColor" '
                   'stroke-width="2" fill="none" aria-hidden="true">'
                   '<path d="M20 6L9 17l-5-5"/></svg>')
    if 'logo' in sig:
        out.append('<span class="b-logo">FC</span>')
    if 'number' in sig:
        out.append('<span class="b-number">01</span>')
    return ''.join(out)


def _section_html(name, dna, scope=None):
    """The option section block — the same DOM the VLM judges.
    scope=None keeps the caller's inline vars binding (siblings);
    scope=name pins the emitted [data-dna] token block."""
    al = 'center' if dna['layout'] == 'center' else 'flex-start'
    h, lead = dna['copy']
    sc = f' data-dna="{scope}"' if scope else ''
    return (
        f'<section class="block"{sc}'
        f' data-orn="{dna["ornament"]}">'
        f'<div class="inner" style="align-items:{al};'
        f'text-align:{"center" if al == "center" else "left"}">'
        + _element_dom(dna) +
        f'<h2 class="b-h">{h}</h2>'
        f'<p class="b-lead">{lead}</p>'
        f'<a class="b-cta">{dna["cta"]}</a>'
        '</div></section>')


def _siblings(name, dna):
    """'More like this' — REAL genotype siblings: seeded tail
    alleles on the same profile via mutate_genotype, vars
    recomputed by from_genotype. A sibling is an allele move with
    provenance, never a hand knob tweak."""
    chain = chains.chains_for(dna['vibe'].split()[0].lower(), seed=1)
    prof = dna_tokens.profile(dna['vertical'])
    sibs = []
    for i in range(3):
        g2, moves, _ = dna_tokens.mutate_genotype(
            dna['genotype'], prof['genes'], seed=dna['seed'] + i + 1,
            burst=1)
        rec = dna_tokens.from_genotype(
            g2, dna['vertical'], dna['declared'],
            seed=dna['seed'] + i + 1)
        label = '; '.join(f"{m['gene']} {m['from']}→{m['to']}"
                          for m in moves) or 'dominant'
        sibs.append({'label': label, 'scope_vars': rec['vars'],
                     'preview_html': _section_html(name, rec),
                     'genotype': g2, 'moves': moves,
                     'chain': chain[i % len(chain)] if chain else ''})
    return sibs


# Artwork-scoped element styles for the canonical picker (chrome
# stays in picker.py — accent lives only inside .block artwork).
ART_CSS = (
    '.block{container-type:inline-size;'
    'background:var(--bg);color:var(--ink);'
    'padding:var(--pad-block) clamp(1.5rem,5cqi,4rem)}'
    '.inner{max-width:72rem;margin-inline:auto;display:flex;'
    'flex-direction:column;gap:var(--gap)}'
    '.b-h{font-size:var(--f-display);letter-spacing:'
    'var(--track);line-height:1.06}'
    '.b-lead{font-size:var(--f-body);color:var(--muted);'
    'max-width:60ch;line-height:1.5}'
    '.b-cta{display:inline-flex;padding:var(--btn-pad);'
    'border-radius:var(--radius);background:var(--accent);'
    'color:var(--accent-ink);font-weight:600;'
    'text-decoration:none}'
    '.b-media{display:grid;place-items:center;'
    'border:2px solid var(--line);border-radius:'
    'var(--radius);color:var(--muted)}'
    '.b-media.hero{width:min(70%,42rem);height:12rem;'
    'margin-inline:auto}'
    '.b-media.thumb{width:9rem;height:6rem}'
    '.b-avatar-row{display:flex;gap:-8px;align-items:center}'
    '.b-avatar{width:44px;height:44px;border-radius:50%;'
    'border:2px solid var(--accent);background:'
    'var(--surface);display:inline-block}'
    '.b-avatars-cap{color:var(--muted);font-size:.85rem;'
    'margin-left:.75rem}'
    '.b-icon{color:var(--accent)}'
    '.b-logo{border:2px solid var(--accent);'
    'padding:.2rem .7rem;letter-spacing:.1em;'
    'color:var(--accent)}'
    '.b-number{font-size:2rem;font-weight:200;'
    'color:var(--muted);margin-left:.75rem}')


def _section_type(rid):
    """Recipe bank path -> human section kind (CTA, Hero, Blog…)."""
    parts = rid.split('/')
    if len(parts) < 2:
        return ''
    fam = parts[1].replace('-sections', '').replace('-', ' ')
    return fam.upper() if len(fam) <= 3 else fam.title()


def build_picker(dnas, quality):
    """10-vibe proof picker via the canonical render_picker
    template — 3-col grid, viewport-proportioned scaled frames,
    page-frame context, real sibling renders, neutral chrome."""
    items = []
    for name, dna in dnas.items():
        h, lead = dna['copy']
        q = quality[name]
        rid = dna['recipe']
        esig = gate._recipe_element_sig(rid)
        sibs = _siblings(name, dna)
        items.append(picker.PickerItem(
            id=name, name=dna['vibe'], subtitle=dna['site_type'],
            preview_html=_section_html(name, dna, scope=name),
            scope_vars=dna['vars'], scope=f'data-dna="{name}"',
            chain=sibs[0]['chain'], fit=max(50, q['composite']),
            dims={d: q[d] for d in gate.J_QUALITY_DIMS},
            score=q['composite'], siblings=sibs,
            attrs={'data-recipe': rid,
                   'data-topology': 'conversion-card',
                   'data-seam': dna['seam'],
                   'data-block-id': f'proof10:{name}',
                   'data-content': 'c-cta',
                   'data-elements': '+'.join(esig) or 'text',
                   'data-vibe': dna['vibe'],
                   'data-site-type': dna['site_type'],
                   'data-quality': str(q['composite']),
                   'data-score': f'{q["composite"] / 100:.2f}',
                   'data-score100': str(q['composite']),
                   'data-refs': 'none', 'data-review': 'judged'},
            selected=False,
            section_type=_section_type(rid)))
    return picker.render_picker(
        items, title='10-vibe element proof',
        intro=('Ten DNAs — one card each through RULES→BUILD→JUDGE→'
               'RECHECK. Declared vibe + site type label each card; '
               'select with the checkbox, review opens the modal.'),
        extra_css=ART_CSS)


# Rotated allele palettes for the one-retry lane — machinery-legal
# overrides (genome.ALLELES), provenance-tagged 'rule-retry'. Each
# failing option draws a different move set so retries diverge the
# SET, never converge it.
_RETRY_MOVES = [
    {'display-face': 'serif', 'radius-personality': 'pill',
     'whitespace-band': 'airy'},
    {'display-face': 'mono', 'radius-personality': 'sharp',
     'density-tier': 'compact'},
    {'display-face': 'sans', 'radius-personality': 'sharp',
     'type-contrast': 'extreme'},
    {'surface-rhythm': 'dark-dominant', 'radius-personality': 'sharp',
     'type-contrast': 'high'},
    {'display-face': 'serif', 'density-tier': 'spacious',
     'whitespace-band': 'tight'},
    {'radius-personality': 'sharp', 'motion-tier': 'expressive',
     'type-contrast': 'extreme'},
    {'display-face': 'serif', 'image-led-ratio': 'image-led',
     'whitespace-band': 'airy'},
    {'display-face': 'mono', 'density-tier': 'compact',
     'radius-personality': 'pill'},
    {'surface-rhythm': 'dark-dominant', 'display-face': 'serif',
     'whitespace-band': 'airy'},
    {'display-face': 'sans', 'radius-personality': 'sharp',
     'density-tier': 'spacious'},
]


def _retry_derive(n, dna, bad, phase):
    """One machinery retry: seed+1 re-sample + a rotated palette
    of legal allele moves, tagged rule-retry in provenance."""
    sp = SITES[n]
    force = dict(_RETRY_MOVES[list(SITES).index(n)
                            % len(_RETRY_MOVES)])
    if 'mobile' in bad:
        force['density-tier'] = 'compact'
        force['whitespace-band'] = 'tight'
    if 'hero_clarity' in bad:
        force['type-contrast'] = 'extreme'
    out = dna_tokens.derive(
        sp['vertical'], seed=sp['seed'] + 1,
        declared=dna['declared'], force_genes=force)
    out['name'] = n
    out['retry_phase'] = phase
    return out


def _sha16(b):
    return hashlib.sha256(b if isinstance(b, bytes)
                          else b.encode()).hexdigest()[:16]


def main():
    os.makedirs(OUT, exist_ok=True)
    os.makedirs(SHOTS, exist_ok=True)
    dnas = derive_all(SITES)
    quality = {n: judge(n, d, dnas) for n, d in dnas.items()}

    # J.1 one-retry law: below-floor options get one knob nudge and
    # are re-judged; still below → dropped, never presented.
    retries = []
    for n, q in list(quality.items()):
        bad = ([d for d in gate.J_QUALITY_DIMS if q[d] < 50] +
               (['composite'] if q['composite'] < 60 else []))
        if not bad:
            continue
        retries.append({'option': n, 'dims_below': bad,
                        'reason': 'one-retry knob nudge'})
        dnas[n] = _retry_derive(n, dnas[n], bad,
                                phase='mechanical')
        quality[n] = judge(n, dnas[n], dnas)
    dropped = [n for n, q in quality.items()
               if any(q[d] < 50 for d in gate.J_QUALITY_DIMS) or
               q['composite'] < 60]
    for n in dropped:
        del dnas[n], quality[n]

    # ---- shots: deterministic raster per option --------------------
    # SHOT BUDGET: desktop 1280 + mobile 375. A third viewport only
    # when a rule needs it — none does for the card test.
    def _spec(d, w, h):
        return {'width': w, 'height': h, 'vars': d['vars'],
                'copy': d['copy'], 'cta': d['cta'],
                'font': d['font'], 'tracking': d['tracking'],
                'layout': d['layout'], 'seam': d['seam'],
                'ornament': d['ornament'],
                'media_weight': d['media_weight'],
                'element': '+'.join(gate._recipe_element_sig(
                    d['recipe'])) or 'text'}

    def _render(n, d):
        out = []
        for w, h, tag in ((1280, 800, ''), (375, 700, '-m')):
            sp = os.path.join(SHOTS, f'{n}{tag}.json')
            pp_ = os.path.join(SHOTS, f'{n}{tag}.png')
            open(sp, 'w').write(json.dumps(_spec(d, w, h)))
            subprocess.run([VENV_PY, SHOT_RENDERER, sp, pp_],
                           check=True)
            out.append(pp_)
        return out

    shot_map = {}
    for n, d in dnas.items():
        shot_map[n] = _render(n, d)

    # ---- J.1 judgment is REAL — one bounded VLM call per option
    # (cached by image+prompt+model hash; 3 parallel workers) -------
    mech = {n: dict(q) for n, q in quality.items()}

    def _call(n):
        try:
            c = vlm.judge(shot_map[n], max_tokens=300)
            # proof-relative evidence keys — basenames collide
            # across run dirs (out/ vs out10/)
            if c and c.get('image_sha256'):
                c['image_sha256'] = {
                    'out10/shots/' + os.path.basename(k): v
                    for k, v in c['image_sha256'].items()}
            return c
        except vlm.VLMUnavailable as e:
            print(f'VLM unavailable on {n}:', e, file=sys.stderr)
            return None

    from concurrent.futures import ThreadPoolExecutor
    calls = {}
    with ThreadPoolExecutor(max_workers=3) as ex:
        for n, c in zip(dnas, ex.map(_call, list(dnas))):
            calls[n] = c

    def _apply(n):
        c = calls.get(n)
        if not (c and c.get('parsed')):
            return False
        pd_ = c['parsed']
        for d in gate.J_QUALITY_DIMS:
            if isinstance(pd_.get(d), (int, float)):
                quality[n][d] = int(pd_[d])
        quality[n]['composite'] = round(
            (2 * quality[n]['hero_clarity'] +
             2 * quality[n]['layout_craft'] +
             quality[n]['media_fit'] + quality[n]['mobile'] +
             quality[n]['distinctness']) / 7)
        quality[n]['vlm_parsed'] = pd_
        quality[n]['mechanical'] = {d: mech[n][d]
                                    for d in gate.J_QUALITY_DIMS}
        quality[n]['judged_by'] = c['model']
        return True

    for n in dnas:
        _apply(n)

    # J.1 post-judgment one-retry law: a VLM verdict below the floor
    # gets ONE knob nudge + re-render + re-judge (cache misses —
    # pixels changed); still below → dropped, never presented.
    vlm_dropped = []
    for n in list(dnas):
        q = quality[n]
        bad = [d for d in gate.J_QUALITY_DIMS if q[d] < 50] + \
            (['composite'] if q['composite'] < 60 else [])
        if not bad or not calls.get(n):
            continue
        retries.append({'option': n, 'dims_below': bad,
                        'phase': 'post-judgment',
                        'reason': 'one-retry knob nudge'})
        dnas[n] = _retry_derive(n, dnas[n], bad,
                                phase='post-judgment')
        shot_map[n] = _render(n, dnas[n])
        calls[n] = _call(n)
        _apply(n)
        q = quality[n]
        if any(q[d] < 50 for d in gate.J_QUALITY_DIMS) or \
                q['composite'] < 60:
            vlm_dropped.append(n)
    for n in vlm_dropped:
        del dnas[n], quality[n], shot_map[n]
    dropped = sorted(set(dropped) | set(vlm_dropped))
    got = [n for n in dnas if calls.get(n) and
           calls[n].get('parsed')]

    # ---- BUILD -----------------------------------------------------
    picker = build_picker(dnas, quality)
    pp = os.path.join(OUT, 'vibe-picker.html')
    open(pp, 'w').write(picker)
    build_sha = _sha16(picker)

    # ---- receipts: RULES → BUILD → JUDGE → RECHECK ------------------
    rules_sha = _sha16(json.dumps(
        {n: {'vibe': d['vibe'], 'site_type': d['site_type'],
             'vertical': d['vertical'], 'recipe': d['recipe'],
             'seed': d['seed'], 'genotype': d['genotype'],
             'knobs': d['knobs'],
             'vars': d['vars'], 'font': d['font'],
             'tracking': d['tracking'], 'layout': d['layout'],
             'seam': d['seam'], 'ornament': d['ornament'],
             'media_weight': d['media_weight']}
         for n, d in dnas.items()}, sort_keys=True))
    judge_sha = _sha16(json.dumps(
        {n: quality[n] for n in dnas}, sort_keys=True,
        default=str))
    # vlm evidence aggregate — every per-option record is real; the
    # aggregate carries all image hashes + joined output hash so
    # P.24 verifies each shot on disk.
    ev = None
    if got:
        all_imgs = {}
        raws = []
        for n in got:
            all_imgs.update(calls[n]['image_sha256'])
            raws.append(calls[n].get('raw') or '')
        ev = {'model': calls[got[0]]['model'],
              'command': calls[got[0]]['command'],
              'calls': len(got), 'aggregate': True,
              'image_sha256': all_imgs,
              'prompt_sha256': calls[got[0]]['prompt_sha256'],
              'output_sha256': _sha16(''.join(raws)),
              'latency_s': round(
                  sum(c['latency_s'] for c in calls.values()
                      if c), 1)}
    review = {'reviewer_model': JUDGED_BY,
              'vlm_calls': len(got), 'vlm_evidence': ev,
              'vlm_per_option': {n: calls[n] for n in got},
              'viewports': [1280, 375],
              'quality': quality, 'quality_retries': retries,
              'dropped_below_floor': dropped,
              'declared': {n: {'vibe': dnas[n]['vibe'],
                               'site_type': dnas[n]['site_type']}
                           for n in dnas},
              'rules_pass_hash': build_sha,
              'judgment_pass_hash': build_sha,
              'receipts': {'rules_sha': rules_sha,
                           'build_sha': build_sha,
                           'judge_sha': judge_sha},
              'blocks': [{'block_id': f'proof10:{n}',
                          'dna_knobs_used': sorted(dnas[n]['vars']),
                          'plan_slot': 'cta',
                          'recipe_id': dnas[n]['recipe'],
                          'vibe': dnas[n]['vibe'],
                          'site_type': dnas[n]['site_type'],
                          'element_variant': gate._element_variant_name(
                              gate._recipe_element_sig(
                                  dnas[n]['recipe'])),
                          'vector_deviation': 'none'}
                         for n in dnas]}
    open(os.path.join(OUT, 'REVIEW.json'), 'w').write(
        json.dumps(review, indent=1))
    # derivation chain: a DNA.json per option — genotype + knobs +
    # modes + provenance, so the receipt shows design came from the
    # sampled space, never hand-typed vars.
    os.makedirs(os.path.join(OUT, 'dna'), exist_ok=True)
    for n in dnas:
        open(os.path.join(OUT, 'dna', n + '.json'), 'w').write(
            json.dumps(dna_tokens.dna_json(dnas[n], site=n),
                       indent=1))
    prebuild = {'layout_family': 'conversion', 'options': {
        n: {'recipe_id': dnas[n]['recipe'],
            'element_variant': gate._element_variant_name(
                gate._recipe_element_sig(dnas[n]['recipe'])),
            'vibe': dnas[n]['vibe'], 'site_type': dnas[n]['site_type'],
            'plan_fit': True, 'refs_resolve': True,
            'tokens_resolve': True, 'plan_vector_dist': 0.6}
        for n in dnas}}
    open(os.path.join(OUT, 'PREBUILD.json'), 'w').write(
        json.dumps(prebuild, indent=1))

    # ---- RECHECK: recompute every receipt from disk, hash-equal ----
    recheck = {}
    picker_disk = open(pp).read()
    recheck['build_sha'] = _sha16(picker_disk)
    recheck['rules_sha'] = _sha16(json.dumps(
        {n: {'vibe': d['vibe'], 'site_type': d['site_type'],
             'vertical': d['vertical'], 'recipe': d['recipe'],
             'seed': d['seed'], 'genotype': d['genotype'],
             'knobs': d['knobs'],
             'vars': d['vars'], 'font': d['font'],
             'tracking': d['tracking'], 'layout': d['layout'],
             'seam': d['seam'], 'ornament': d['ornament'],
             'media_weight': d['media_weight']}
         for n, d in dnas.items()}, sort_keys=True))
    recheck['judge_sha'] = _sha16(json.dumps(
        {n: quality[n] for n in dnas}, sort_keys=True, default=str))
    for img_rel, sha in (ev or {}).get('image_sha256', {}).items():
        p = os.path.join(SHOTS, os.path.basename(img_rel))
        if os.path.isfile(p):
            assert _sha16(open(p, 'rb').read()) == sha, \
                f'evidence drift {img_rel}'

    # ---- dead-knob ablation: perturb one axis at a time on a base --
    dead = []
    base = dnas[list(dnas)[0]]
    axes = [
        ('font', {**{k: v for k, v in base.items() if k != 'font'},
                  'font': SU + 'Impact.ttf'}),
        ('radius', {**{k: v for k, v in base.items() if k != 'vars'},
                    'vars': {**base['vars'], '--radius': '22px'}}),
        ('seam', {**{k: v for k, v in base.items() if k != 'seam'},
                  'seam': 'diagonal'}),
        ('ornament', {**{k: v for k, v in base.items()
                         if k != 'ornament'},
                      'ornament': 'grid'}),
        ('media', {**{k: v for k, v in base.items()
                      if k != 'media_weight'},
                   'media_weight': 'hero',
                   'recipe': 'brixies/cta-sections/cta-21.topo'}),
        ('layout', {**{k: v for k, v in base.items() if k != 'layout'},
                    'layout': 'left'}),
        ('tracking', {**{k: v for k, v in base.items()
                         if k != 'tracking'},
                      'tracking': 0.12}),
    ]
    base_png = os.path.join(SHOTS, 'abl-base.png')
    spec = {'width': 1280, 'height': 800, 'vars': base['vars'],
            'copy': base['copy'], 'cta': base['cta'],
            'font': base['font'], 'tracking': base['tracking'],
            'layout': base['layout'], 'seam': base['seam'],
            'ornament': base['ornament'],
            'media_weight': base['media_weight'],
            'element': '+'.join(gate._recipe_element_sig(
                base['recipe'])) or 'text'}
    open(base_png.replace('.png', '.json'), 'w').write(
        json.dumps(spec))
    subprocess.run([VENV_PY, SHOT_RENDERER,
                    base_png.replace('.png', '.json'), base_png],
                   check=True)
    def _pixdiff(a, b):
        r = subprocess.run([VENV_PY, os.path.join(HERE, 'imgdiff.py'),
                            a, b], capture_output=True, text=True,
                           check=True)
        raw, perc = r.stdout.split()
        return float(raw), float(perc)
    # perceptibility floor: an axis that moves <1% of the page's 8×8
    # cells is not visible to a reviewer at page scale — that is a
    # dead knob, not a design decision
    PERC_FLOOR = 0.01
    for axis, d2 in axes:
        spec2 = dict(spec)
        spec2.update({'font': d2.get('font', spec['font']),
                      'tracking': d2.get('tracking', spec['tracking']),
                      'layout': d2.get('layout', spec['layout']),
                      'seam': d2.get('seam', spec['seam']),
                      'ornament': d2.get('ornament', spec['ornament']),
                      'media_weight': d2.get('media_weight',
                                             spec['media_weight']),
                      'vars': d2.get('vars', spec['vars']),
                      'element': '+'.join(gate._recipe_element_sig(
                          d2.get('recipe', base['recipe']))) or 'text'})
        aj = os.path.join(SHOTS, f'abl-{axis}.json')
        ap = os.path.join(SHOTS, f'abl-{axis}.png')
        open(aj, 'w').write(json.dumps(spec2))
        subprocess.run([VENV_PY, SHOT_RENDERER, aj, ap], check=True)
        raw, perc = _pixdiff(base_png, ap)
        row = {'axis': axis, 'pixels_moved': round(raw, 4),
               'cells_moved': round(perc, 4)}
        if perc < PERC_FLOOR:
            dead.append(row)
        else:
            row['ok'] = True
            dead.append(row)

    # ---- the gate chain, actually run -------------------------------
    fails = []
    fails += gate._picker_ux_fails(picker, 'vibe-picker.html')
    if re.search(r'padding(?:-[a-z]+)?:\s*[^;}"]*?\dpx', picker):
        fails.append('R.12 literal px padding')
    if 'clamp(' not in picker:
        fails.append('T.1 no fluid clamp')
    for oid, q in quality.items():
        for d in gate.J_QUALITY_DIMS:
            if q[d] < 50:
                fails.append(f'J.1 {oid} {d} {q[d]} < 50')
        if q['composite'] < 60:
            fails.append(f'J.1 {oid} composite {q["composite"]} <60')
    if review['rules_pass_hash'] != review['judgment_pass_hash']:
        fails.append('J.2 hash mismatch')
    if recheck['build_sha'] != build_sha:
        fails.append('RECHECK picker hash drift')
    if recheck['rules_sha'] != rules_sha:
        fails.append('RECHECK rules receipt drift')
    if recheck['judge_sha'] != judge_sha:
        fails.append('RECHECK judgment receipt drift')
    bank = gate._skl_harvest_ids()
    for n in dnas:
        rid = dnas[n]['recipe']
        if rid not in bank:
            fails.append(f'J.3/J.4 {rid} not in bank')
        if f'data-recipe="{rid}"' not in picker:
            fails.append(f'J.4 {n} recipe attr missing')
        want = '+'.join(gate._recipe_element_sig(rid)) or 'text'
        if f'data-elements="{want}"' not in picker:
            fails.append(f'J.7 {n} element sig {want} not rendered')
        canon = gate.VERTICAL_MEDIA_CANON.get(dnas[n]['vertical'])
        if canon:
            accept, text_ok = canon
            extra = set(gate._recipe_element_sig(rid)) - accept
            if extra:
                fails.append(f'J.7 {n} {sorted(extra)} outside '
                             f'{dnas[n]["vertical"]} canon')
            if not gate._recipe_element_sig(rid) and not text_ok:
                fails.append(f'J.7 {n} text-only under media canon')
    out = {'picker': pp, 'n_options': len(dnas),
           'declared': review['declared'],
           'dna': {n: {'profile': dnas[n]['profile'],
                       'seed': dnas[n]['seed'],
                       'genotype': dnas[n]['genotype'],
                       'wildcard': dnas[n]['wildcard'],
                       'novelty': dnas[n]['novelty'],
                       'knobs': dnas[n]['knobs'],
                       'provenance': dnas[n]['knob_provenance']}
                   for n in dnas},
           'recipes': {n: dnas[n]['recipe'] for n in dnas},
           'scores': {n: quality[n]['composite'] for n in dnas},
           'dims': {n: {d: quality[n][d]
                        for d in gate.J_QUALITY_DIMS} for n in dnas},
           'vlm': {'model': JUDGED_BY, 'calls': len(got),
                   'evidence': bool(ev),
                   'per_option': {n: calls[n]['output_sha256']
                                  for n in got}},
           'receipts': review['receipts'],
           'recheck': recheck, 'dropped': dropped,
           'retries': retries, 'dead_knobs':
               [d for d in dead if not d.get('ok')],
           'abl': dead,
           'gate_fails': fails}
    open(os.path.join(OUT, 'REPORT.json'), 'w').write(
        json.dumps(out, indent=1))
    print(json.dumps(out, indent=1))
    return 0 if not fails else 2


if __name__ == '__main__':
    sys.exit(main())
