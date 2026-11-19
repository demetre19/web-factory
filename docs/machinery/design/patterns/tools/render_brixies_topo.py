#!/usr/bin/env python3
"""Render brixies ACSS payloads through adapt.py's topo (.block)
shell -> bank_shots/brixies/<slug>.png so the 163 payloads carry CLIP
rows too (they're topo-only, no markup of their own).

Shell = canonical .block emit from proof/run_proof10.py's ART_CSS +
neutral DNA vars; inner DOM = element-driven placeholders (cards per
element count, direction from direction_ratio, seam borders).

  uv run --quiet --with playwright python3 render_brixies_topo.py
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'data'))
REPO = os.path.normpath(os.path.join(HERE, '..', '..', '..',
                                     '..', '..'))
BANK = os.path.join(REPO, 'templates', 'skeletons', 'brixies')
IDX = os.path.join(REPO, 'templates', 'skeletons',
                   'topology-sources-index.json')
OUT = os.path.join(DATA, 'bank_shots', 'brixies')
sys.path.insert(0, HERE)
import cache  # noqa: E402

CSS = """body{margin:0;font-family:ui-sans-serif,system-ui,sans-serif}
.block{container-type:inline-size;background:#fff;color:#16212e;
padding:3rem clamp(1.5rem,5cqi,4rem)}
.inner{max-width:72rem;margin-inline:auto;display:flex;
flex-direction:column;gap:1.25rem}
.inner.row{flex-direction:row}
.h{font-size:2rem;font-weight:700;line-height:1.06}
.lead{color:#4e5c6c;max-width:60ch;line-height:1.5}
.cta{display:inline-flex;padding:.6rem 1.2rem;border-radius:8px;
background:#17457c;color:#fff;font-weight:600}
.grid{display:grid;gap:1rem}
.card{border:1px solid #d5dde4;border-radius:8px;padding:1.25rem;
min-height:6rem;color:#4e5c6c}
.card.seam{border-color:#16212e}
.row-item{display:flex;justify-content:space-between;
align-items:center;padding:1rem 0;border-bottom:1px solid #d5dde4}
.media{display:grid;place-items:center;border:2px dashed #d5dde4;
border-radius:8px;min-height:10rem;color:#9aa7b4}
"""
VARS = {}


def recipe_dom(topo, labels):
    """Element-driven inner DOM: cards/rows/media matching the
    payload's structure hints."""
    cols = topo.get('column_schedule') or {}
    n_cols = cols.get('base') or cols.get('lg') or cols.get('md')
    try:
        n_cols = int(n_cols)
    except (TypeError, ValueError):
        n_cols = 0
    rid = topo.get('topology_id', 'content')
    row_layout = topo.get('direction_ratio', 0) >= 0.5
    n_items = max(2, min(8, len([l for l in labels
                               if 'Button' not in str(l)])))
    bits = ['<div class="inner%s">' % (' row' if row_layout else '')]
    bits.append('<div class="h">%s</div>' %
                (rid.replace('-', ' ').title()))
    bits.append('<div class="lead">'
                'Section structure from ACSS payload.</div>')
    seam = ' seam' if topo.get('seam_style') == 'hairline' else ''
    if n_cols >= 2:
        bits.append(f'<div class="grid" style="grid-template-columns:'
                    f'repeat({n_cols},1fr)">' +
                    f''.join(f'<div class="card{seam}">'
                             f'{labels[i] if i < len(labels) else "item"}'
                             f'</div>' for i in range(n_items))
                    + '</div>')
    elif rid == 'hero-media-bg':
        bits.append('<div class="media">media</div>')
    else:
        bits.extend(f'<div class="row-item"><span>'
                    f'{labels[i] if i < len(labels) else "row"}'
                    f'</span><span>→</span></div>'
                    for i in range(min(n_items, 5)))
    bits.append('<a class="cta">Action</a></div>')
    return ''.join(bits)


def real_payloads():
    for cat in sorted(os.listdir(BANK)):
        cd = os.path.join(BANK, cat)
        if not os.path.isdir(cd):
            continue
        for f in sorted(os.listdir(cd)):
            if f.endswith('.json') and '.spec.' not in f \
                    and '.topo.' not in f:
                yield cat, os.path.join(cd, f)


def main():
    from playwright.sync_api import sync_playwright
    idx = {v.get('file'): v for v in json.load(open(IDX))}
    todo = [(c, p) for c, p in real_payloads()]
    print(f'{len(todo)} payloads')
    done = 0
    with sync_playwright() as pw:
        br = pw.chromium.launch()
        pg = br.new_page(viewport={'width': 1440, 'height': 900})
        for cat, path in todo:
            try:
                pl = json.load(open(path))
                top = (pl.get('json') or pl).get('topology') or \
                    idx.get(os.path.basename(path), {})
                side = path.replace('.json', '.topo.json')
                if os.path.exists(side):
                    top = (json.load(open(side)).get('topology')
                           or top)
                labels = pl.get('elements') or \
                    (pl.get('json') or {}).get('elements') or []
                dom = recipe_dom(top, labels)
                html = (f'<style>{CSS}</style><div class="block">'
                        + dom + '</div>')
                slug = os.path.splitext(
                    os.path.basename(path))[0]
                op = os.path.join(OUT, cat, slug + '.png')
                key = f'brixies:{cat}/{slug}'
                if cache.get('bank_shot', key) and \
                        os.path.exists(op):
                    continue
                pg.set_content(html)
                pg.wait_for_timeout(200)
                os.makedirs(os.path.dirname(op), exist_ok=True)
                pg.screenshot(path=op)
                cache.put('bank_shot', key, {'shot': op})
                done += 1
            except Exception as e:
                print(f'  {path}: {e}', file=sys.stderr)
        br.close()
    print(f'DONE {done} rendered -> {OUT}')


if __name__ == '__main__':
    main()
