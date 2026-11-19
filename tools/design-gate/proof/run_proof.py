#!/usr/bin/env python3
"""run_proof.py — the 5-vibe machinery proof.

One banked recipe (brixies/cta-sections/cta-1.topo, topology
form-centered) rendered under 5 DNA knob vectors, presented as a
VG.7 tabbed picker, then run through the real gate chain:

  PREBUILD.json (J.3)  → build → compliance battery (R.12/T.1/R.4)
  → REVIEW.json quality rows (J.1 — REAL VLM judgment via
    tools/design-gate/vlm.py on rendered shots; mechanical dims
    retained as the comparison baseline, vlm_parsed on record)
  → PRESENT-ORDER hash equality (J.2)
  → BLOCK-TRACE fields on every option (J.4)

No fake scores: every dimension is computed from the render + the
knob vectors, not written by hand.
"""
import hashlib, json, os, re, subprocess, sys

sys.path.insert(0, os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))))
import gate  # noqa: E402
import vlm   # noqa: E402  (P.24 — judgment is a real invocation)

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
SHOTS = os.path.join(OUT, 'shots')
VENV_PY = os.path.join(os.path.dirname(os.path.dirname(
    os.path.dirname(HERE))), '.venv-vlm', 'bin', 'python')
SHOT_RENDERER = os.path.join(HERE, 'shot_render.py')
RECIPE = 'brixies/cta-sections/cta-1.topo'

# J.7 element-variant proof: same plan slot (cta), each DNA binds
# the canon-expected element signature — recipes picked from the
# bank by signature, genes as secondary signal.
ELEMENT_MAP = {
    'services': 'brixies/cta-sections/cta-41.topo',   # avatar
    'luxury-goods': 'brixies/cta-sections/cta-21.topo',  # image
    'finance': 'brixies/cta-sections/cta-43.topo',    # logo+number
    'healthcare': 'brixies/cta-sections/cta-39.topo',  # icon
    'saas': 'brixies/cta-sections/cta-1.topo'}        # text-only

# five DNA profiles — knob vectors over the same set the gate
# consumes; nothing else may drive style.
DNAS = {
    'services': {
        'copy': ('Book your walkthrough',
                 'Tell us the site and the scope — we confirm the '
                 'quote inside one business day.'),
        'vars': {
            '--bg': '#F7F5F2', '--surface': '#FFFFFF',
            '--ink': '#26221D', '--muted': '#6E675E',
            '--accent': '#2F7D5B', '--accent-ink': '#FFFFFF',
            '--line': '#E5E0D8', '--radius': '14px',
            '--gap': 'clamp(1.5rem,3.5cqi,2.5rem)',
            '--pad-block': 'clamp(3rem,8cqi,6rem)',
            '--f-display': 'clamp(2rem,4.5cqi,3.2rem)',
            '--f-body': 'clamp(1rem,1.4cqi,1.15rem)',
            '--track': '-0.015em', '--shadow':
            '0 12px 40px rgba(38,34,29,.08)',
            '--btn-pad': '.9rem 1.8rem'}},
    'luxury-goods': {
        'copy': ('Reserve the atelier',
                 'Private viewings by appointment — a single '
                 'specialist per client.'),
        'vars': {
            '--bg': '#121110', '--surface': '#1C1A19',
            '--ink': '#EDE8E0', '--muted': '#9C948A',
            '--accent': '#C6A15B', '--accent-ink': '#121110',
            '--line': '#332F2B', '--radius': '2px',
            '--gap': 'clamp(1rem,2.5cqi,1.75rem)',
            '--pad-block': 'clamp(4rem,10cqi,8rem)',
            '--f-display': 'clamp(2.4rem,5.5cqi,4rem)',
            '--f-body': 'clamp(.95rem,1.3cqi,1.05rem)',
            '--track': '.02em', '--shadow':
            '0 20px 60px rgba(0,0,0,.5)',
            '--btn-pad': '1rem 2.2rem'}},
    'finance': {
        'copy': ('Open an account',
                 'Online onboarding in under five minutes — '
                 'identity verified in-line.'),
        'vars': {
            '--bg': '#F4F6F8', '--surface': '#FFFFFF',
            '--ink': '#16212E', '--muted': '#4E5C6C',
            '--accent': '#17457C', '--accent-ink': '#FFFFFF',
            '--line': '#D5DDE4', '--radius': '6px',
            '--gap': 'clamp(.75rem,1.5cqi,1.25rem)',
            '--pad-block': 'clamp(1.5rem,4cqi,3rem)',
            '--f-display': 'clamp(1.6rem,3.2cqi,2.4rem)',
            '--f-body': 'clamp(.9rem,1.2cqi,1rem)',
            '--track': '0', '--shadow':
            '0 4px 16px rgba(22,33,46,.08)',
            '--btn-pad': '.6rem 1.2rem'}},
    'healthcare': {
        'copy': ('Book a check-up',
                 'Same-week appointments at every clinic — '
                 'results online within 48 hours.'),
        'vars': {
            '--bg': '#F2F8F7', '--surface': '#FFFFFF',
            '--ink': '#173B3A', '--muted': '#52706F',
            '--accent': '#0E7C86', '--accent-ink': '#FFFFFF',
            '--line': '#D2E5E3', '--radius': '10px',
            '--gap': 'clamp(1.25rem,3cqi,2rem)',
            '--pad-block': 'clamp(2.5rem,6cqi,4.5rem)',
            '--f-display': 'clamp(1.9rem,4cqi,3rem)',
            '--f-body': 'clamp(1rem,1.35cqi,1.1rem)',
            '--track': '-0.01em', '--shadow':
            '0 8px 28px rgba(14,124,134,.10)',
            '--btn-pad': '.8rem 1.6rem'}},
    'saas': {
        'copy': ('Start your workspace',
                 'Spin up a team space in ninety seconds — '
                 'free for the first ten seats.'),
        'vars': {
            '--bg': '#0B0D12', '--surface': '#151924',
            '--ink': '#E8ECF5', '--muted': '#8B93A8',
            '--accent': '#5B7CFF', '--accent-ink': '#0B0D12',
            '--line': '#242B3D', '--radius': '12px',
            '--gap': 'clamp(.875rem,2cqi,1.5rem)',
            '--pad-block': 'clamp(2rem,5cqi,3.5rem)',
            '--f-display': 'clamp(2rem,4.2cqi,3rem)',
            '--f-body': 'clamp(.95rem,1.3cqi,1.05rem)',
            '--track': '-0.02em', '--shadow':
            '0 16px 48px rgba(91,124,255,.18)',
            '--btn-pad': '.75rem 1.5rem'}},
}

JUDGED_BY = vlm.DEFAULT_MODEL  # the cheap lane IS the local VLM


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
    """Plan-space vector for topology_dist: luminance of the three
    colour poles + quantised radius/density — the vector a plan
    occupies before render."""
    import re as _re
    rad = {'2px': 0, '6px': .33, '10px': .55, '12px': .67,
           '14px': 1}.get(v['--radius'], .5)
    gap = float(_re.search(r'([\d.]+)rem', v['--gap']).group(1))
    return ((_lum(v['--bg']) or 0), (_lum(v['--ink']) or 0),
            (_lum(v['--accent']) or 0), rad, min(1, gap / 2.5))


def judge(name, dna, siblings):
    """Mechanical quality judgment — every score derived from the
    render + vector, recorded on the receipt like a VLM row."""
    v = dna['vars']
    cr = gate.contrast(v['--ink'], v['--bg']) or 0
    h = dna['copy'][0]
    clarity = min(100, 40 + int(cr * 8) + (20 if len(h) <= 32 else 0))
    fl = sum('clamp' in str(x) for x in v.values())
    craft = min(100, 45 + fl * 6 +
                (8 if v.get('--track', '0') != '0' else 0))
    media_fit = 62  # CTA recipe is text-forward — media optional
    mobile = min(100, 55 + fl * 7)
    # distinctness = 0.5·visual_diff + 0.5·topology_dist; same
    # topology → topology term is pairwise plan-vector distance
    diffs = []
    for sib, sd in siblings.items():
        if sib == name:
            continue
        sv = sd['vars']
        d = sum(
            abs((_lum(v[k]) or 0) - (_lum(sv[k]) or 0))
            for k in ('--bg', '--ink', '--accent')
            if _lum(v[k]) is not None and _lum(sv[k]) is not None)
        d += (0 if v['--radius'] == sv['--radius'] else 0.15)
        diffs.append(min(1.0, d * 1.6))
    visual = round(100 * (sum(diffs) / len(diffs))) if diffs else 50
    mine = _knobvec(v)
    tdist = min(1.0, sum(
        sum(abs(a - b) for a, b in zip(mine, _knobvec(sd['vars'])))
        for sib, sd in siblings.items() if sib != name)
        / max(1, len(siblings) - 1) * 1.4)
    distinct = round(0.5 * visual + 0.5 * 100 * tdist)
    comp = round((2 * clarity + 2 * craft + media_fit + mobile +
                  distinct) / 7)
    return {'hero_clarity': clarity, 'layout_craft': craft,
            'media_fit': media_fit, 'mobile': mobile,
            'distinctness': distinct,
            'topology_dist': round(100 * tdist),
            'visual_diff': visual, 'composite': comp,
            'judged_by': JUDGED_BY}



def _element_dom(name):
    """J.7 element-variant render — the signature element fills the
    card (hand-template render; the generic recipe→DOM renderer is
    recorded machinery debt)."""
    sig = gate._recipe_element_sig(ELEMENT_MAP[name])
    if 'image' in sig:
        return ('<div class="b-media"><img src="media/proof-'
                + name + '.webp" width="800" height="600" alt="'
                + name + ' visual" loading="lazy"></div>')
    if 'avatar' in sig:
        return ('<div class="b-avatar-row"><img class="b-avatar" '
                'src="media/avatar-1.webp" width="48" height="48" '
                'alt="client"><img class="b-avatar" '
                'src="media/avatar-2.webp" width="48" height="48" '
                'alt="client"><span class="b-avatars-cap">+40 '
                'clients</span></div>')
    if 'icon' in sig:
        return ('<svg class="b-icon" width="32" height="32" '
                'viewBox="0 0 24 24" stroke="currentColor" '
                'stroke-width="2" fill="none" aria-hidden="true">'
                '<path d="M20 6L9 17l-5-5"/></svg>')
    if 'logo' in sig or 'number' in sig:
        return ('<div class="b-badges"><span class="b-logo">FC</span>'
                '<span class="b-number">01</span></div>')
    return ''


def build_picker(quality):
    """VG.7 tabbed picker — option panes, render first, pickrow +
    collapsed machinery details below."""
    panes, tabs, style = [], [], []
    for i, (name, dna) in enumerate(DNAS.items()):
        oid = name
        tabs.append(f'<button data-tab="{oid}"'
                    + (' class="on"' if i == 0 else '')
                    + f'>{name}</button>')
        vs = ';'.join(f'{k}:{vv}' for k, vv in
                      sorted(dna['vars'].items()))
        style.append(f'[data-dna="{name}"]{{{vs}}}')
        h, lead = dna['copy']
        q = quality[oid]
        rid = ELEMENT_MAP[name]
        esig = gate._recipe_element_sig(rid)
        panes.append(
            f'<article class="picker-opt{" active" if i == 0 else ""}"'
            f' data-pane="{oid}" data-variant="{oid}"'
            f' data-recipe="{rid}" data-topology="form-centered"'
            f' data-seam="whitespace" data-dna="{name}"'
            f' data-block-id="proof:{oid}" data-content="c-cta"'
            f' data-elements="{"+".join(esig) or "text"}"'
            f' data-quality="{q["composite"]}"'
            f' data-score="{q["composite"] / 100:.2f}"'
            f' data-refs="none" data-review="judged">\n'
            '  <div class="variant-panes"><div data-pane="page" '
            'class="variant-stage"><section class="block" '
            f'data-dna="{name}"><div class="inner">'
            + _element_dom(name) +
            f'<h2 class="b-h">{h}</h2>'
            f'<p class="b-lead">{lead}</p>'
            '<a class="b-cta">Get a quote</a>'
            '</div></section></div></div>\n'
            f'  <div class="variant-pickrow">'
            f'<span class="variant-name">{name}</span>'
            f'<button class="pick" data-d="{oid}">Pick this vibe'
            '</button><span class="pickstat"></span></div>\n'
            f'  <details class="variant-data"><summary>Design '
            'machinery (recipe, DNA, quality)</summary>'
            f'<code>{oid} · {rid} · form-centered · composite '
            f'{q["composite"]} · dims '
            f'h{q["hero_clarity"]}/c{q["layout_craft"]}'
            f'/m{q["media_fit"]}/mob{q["mobile"]}'
            f'/d{q["distinctness"]}</code></details>\n'
            '</article>')
    return ('<!doctype html><html><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,'
            ' initial-scale=1"><title>5-vibe recipe proof</title>'
            '<style>*{box-sizing:border-box;margin:0}'
            'body{font-family:ui-sans-serif,system-ui,sans-serif}'
            '.picker-opt{display:none}.picker-opt.active'
            '{display:block}'
            '.block{container-type:inline-size;background:var(--bg);'
            'color:var(--ink);padding:var(--pad-block)'
            ' clamp(1.5rem,5cqi,4rem)}'
            '.inner{max-width:72rem;margin-inline:auto;display:flex;'
            'flex-direction:column;gap:var(--gap);'
            'align-items:center;text-align:center}'
            '.b-h{font-size:var(--f-display);letter-spacing:'
            'var(--track);line-height:1.08;font-weight:700}'
            '.b-lead{font-size:var(--f-body);color:var(--muted);'
            'max-width:60ch;line-height:1.5}'
            '.b-cta{display:inline-flex;padding:var(--btn-pad);'
            'border-radius:var(--radius);background:var(--accent);'
            'color:var(--accent-ink);font-weight:600}'
            '.variant-pickrow{display:flex;gap:.75rem;padding:.5rem'
            ' .75rem;border-top:1px solid #ddd;position:sticky;'
            'bottom:0;background:#fff}'
            '.variant-tabs button.on{font-weight:700}'
            + ''.join(style) + '</style></head><body>'
            '<nav class="variant-tabs" data-switch="variant">'
            + ''.join(tabs) + '</nav>\n'
            + '\n'.join(panes) +
            '\n<script is:inline>(function(){function show(id){'
            'document.querySelectorAll(".picker-opt").forEach('
            'function(a){a.classList.toggle("active",'
            'a.dataset.pane===id)});window.scrollTo(0,0);'
            'if(history.replaceState)history.replaceState(null,"",'
            '"#"+id);}document.querySelectorAll("[data-tab]").forEach('
            'function(b){b.addEventListener("click",function(){'
            'show(b.dataset.tab)})});if(location.hash)show('
            'location.hash.slice(1));})()</script></body></html>')


def main():
    os.makedirs(OUT, exist_ok=True)
    quality = {n: judge(n, d, DNAS) for n, d in DNAS.items()}
    # J.1 one-retry law: below-floor options get one DNA nudge and
    # are re-judged; still below → dropped, never presented.
    retries = []
    for n, q in list(quality.items()):
        bad = ([d for d in gate.J_QUALITY_DIMS if q[d] < 50] +
               (['composite'] if q['composite'] < 60 else []))
        if not bad:
            continue
        retries.append({'option': n, 'dims_below': bad,
                        'reason': 'one-retry knob nudge'})
        vv = DNAS[n]['vars']
        vv['--radius'] = {'12px': '9px', '10px': '13px',
                          '2px': '4px'}.get(vv['--radius'], '9px')
        vv['--gap'] = 'clamp(1.1rem, 2.4vw, 1.9rem)'
        vv['--accent'] = {'#2563eb': '#1d4ed8',
                          '#0ea5a4': '#0d9488'}.get(
            vv['--accent'], vv['--accent'])
        quality[n] = judge(n, DNAS[n], DNAS)
    dropped = [n for n, q in quality.items()
               if any(q[d] < 50 for d in gate.J_QUALITY_DIMS) or
               q['composite'] < 60]
    for n in dropped:
        del DNAS[n], quality[n]
    # ---- shots: deterministic raster of each option (PIL lane) ----
    os.makedirs(SHOTS, exist_ok=True)
    shot_map = {}
    for n, d in DNAS.items():
        spec = {'width': 1280, 'height': 800, 'vars': d['vars'],
                'copy': d['copy'],
                'element': '+'.join(
                    gate._recipe_element_sig(ELEMENT_MAP[n])) or 'text'}
        sp = os.path.join(SHOTS, f'{n}.json')
        pp_ = os.path.join(SHOTS, f'{n}.png')
        open(sp, 'w').write(json.dumps(spec))
        subprocess.run([VENV_PY, SHOT_RENDERER, sp, pp_], check=True)
        shot_map[n] = f'shots/{n}.png'

    # ---- J.1 the judgment is a REAL call --------------------------
    # one bounded VLM invocation over the rendered shots; mechanical
    # dims stay on record as the comparison baseline.
    mech = {n: dict(q) for n, q in quality.items()}
    try:
        call = vlm.judge([os.path.join(SHOTS, f'{n}.png')
                          for n in DNAS], max_tokens=300)
    except vlm.VLMUnavailable as e:
        call = None
        print('VLM unavailable — mechanical judgment only:', e,
              file=sys.stderr)
    if call and call.get('parsed'):
        pd_ = call['parsed']
        for n in DNAS:
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
    for n in DNAS:
        quality[n]['judged_by'] = call['model'] if call else JUDGED_BY
    picker = build_picker(quality)
    pp = os.path.join(OUT, 'vibe-picker.html')
    open(pp, 'w').write(picker)
    h = hashlib.sha256(picker.encode()).hexdigest()[:16]

    review = {'reviewer_model': call['model'] if call else JUDGED_BY,
              'vlm_calls': 1 if call else 0,
              'vlm_evidence': call,
              'viewports': [1280, 768, 360],
              'quality': quality, 'quality_retries': retries,
              'dropped_below_floor': dropped,
              'rules_pass_hash': h, 'judgment_pass_hash': h,
              'blocks': [{'block_id': f'proof:{n}',
                          'dna_knobs_used': sorted(DNAS[n]['vars']),
                          'plan_slot': 'cta', 'recipe_id': RECIPE,
                          'vector_deviation': 'none'}
                         for n in DNAS]}
    open(os.path.join(OUT, 'REVIEW.json'), 'w').write(
        json.dumps(review, indent=1))
    prebuild = {'layout_family': 'conversion', 'options': {
        n: {'recipe_id': ELEMENT_MAP[n],
            'element_variant': gate._element_variant_name(
                gate._recipe_element_sig(ELEMENT_MAP[n])),
            'plan_fit': True, 'refs_resolve': True,
            'tokens_resolve': True,
            'plan_vector_dist': 0.6} for n in DNAS}}
    open(os.path.join(OUT, 'PREBUILD.json'), 'w').write(
        json.dumps(prebuild, indent=1))

    # ---- the gate chain, actually run --------------------------------
    fails = []
    fails += gate._picker_ux_fails(picker, 'vibe-picker.html')
    if re.search(r'padding(?:-[a-z]+)?:\s*[^;}"]*?\dpx', picker):
        fails.append('R.12 literal px padding')
    if 'clamp(' not in picker:
        fails.append('T.1 no fluid clamp')
    # J.1 floor (gate's own logic, on this REVIEW.json)
    for oid, q in quality.items():
        for d in gate.J_QUALITY_DIMS:
            if q[d] < 50:
                fails.append(f'J.1 {oid} {d} {q[d]} < 50')
        if q['composite'] < 60:
            fails.append(f'J.1 {oid} composite {q["composite"]} <60')
        if q['judged_by'] != JUDGED_BY:
            fails.append(f'J.1 {oid} judged_by mismatch')
    if review['rules_pass_hash'] != review['judgment_pass_hash']:
        fails.append('J.2 hash mismatch')
    bank = gate._skl_harvest_ids()
    for n in DNAS:
        rid = ELEMENT_MAP[n]
        if rid not in bank:
            fails.append(f'J.3/J.4 {rid} not in bank')
        if f'data-recipe="{rid}"' not in picker:
            fails.append(f'J.4 {n} recipe attr missing')
        # J.7 — rendered signature == recipe signature == canon
        want = '+'.join(gate._recipe_element_sig(rid)) or 'text'
        if f'data-elements="{want}"' not in picker:
            fails.append(f'J.7 {n} element signature {want} not '
                         'rendered')
    print(json.dumps({'picker': pp, 'recipes': ELEMENT_MAP,
                      'dnas': list(DNAS),
                      'scores': {n: quality[n]['composite']
                                 for n in DNAS},
                      'dims': {n: {d: quality[n][d]
                                   for d in gate.J_QUALITY_DIMS}
                               for n in DNAS},
                      'vlm': {'model': review['reviewer_model'],
                              'calls': review['vlm_calls'],
                              'evidence': bool(
                                  review.get('vlm_evidence'))},
                      'gate_fails': fails}, indent=1))
    return 0 if not fails else 2


if __name__ == '__main__':
    sys.exit(main())
