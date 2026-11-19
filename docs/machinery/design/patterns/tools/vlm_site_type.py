#!/usr/bin/env python3
"""VLM site-type pass over the flagged review queue (screens -> type).

Sites in data/site-type-review.json are flagged because sections carry
no text. Classify them straight from imagery: full-page tile + up to 2
section crops, closed-vocab prompt, majority vote -> site_type_v2 with
method='vlm' (distinguishable from classify_site.py's text pass).

  ../../.venv-vlm/bin/python vlm_site_type.py [--limit N]

Idempotent: skips slugs that already have site_type_v2 via method vlm;
re-run classify_site.py afterwards so ui_analysis_vlm feeds text
signals too.
"""
import json
import os
import sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'data'))
CORPUS = os.path.join(DATA, 'operator')
REVIEW = os.path.join(DATA, 'site-type-review.json')
sys.path.insert(0, HERE)
import vlm_mlx  # noqa: E402

SITE_PROMPT = """Look at this web page screenshot. What KIND of site is it?
Reply with ONLY a JSON object:
{"site_type": one of [med-spa, docs, nonprofit, automotive, hospitality, ecommerce, technology, saas, agency-portfolio, portfolio, other],
 "confidence": 0..1,
 "evidence": "3-6 words on what you saw (donate button, product grid, API sidebar, ...)"}
Choose agency-portfolio for design studios and galleries of client work; saas for product pages selling software subscriptions; technology for infra/devtool/product pages that are not primarily subscription pitches; other when none fit."""


def crops_for(meta, d):
    out = []
    for t in meta.get('tiles') or []:
        p = os.path.join(d, t if isinstance(t, str)
                         else t.get('file', ''))
        if os.path.exists(p):
            out.append(p)
            break
    for s in meta.get('sections') or []:
        p = os.path.join(d, s.get('file') or '')
        if p and os.path.exists(p) and p not in out:
            out.append(p)
        if len(out) >= 3:
            break
    return out


def classify_one(slug):
    d = os.path.join(CORPUS, slug)
    mp = os.path.join(d, 'meta.json')
    if not os.path.exists(mp):
        return 'missing-meta'
    meta = json.load(open(mp))
    if meta.get('site_type_v2') and \
            meta.get('site_type_method') == 'vlm':
        return 'done'
    crops = crops_for(meta, d)
    if not crops:
        return 'no-crops'
    votes, confs, evid = Counter(), [], []
    for cp in crops:
        r = vlm_mlx.ask(cp, SITE_PROMPT, 'vlm_sitetype', d)
        if not r:
            continue
        t = r.get('site_type')
        if t:
            votes[t] += 1
            confs.append(float(r.get('confidence') or 0.5))
            if r.get('evidence'):
                evid.append(str(r['evidence']))
    if not votes:
        return 'no-votes'
    top = votes.most_common(1)[0]
    agree = top[1] / len(crops)
    conf = round(min(0.97, (sum(confs) / len(confs)) * 0.6
                     + agree * 0.4), 2)
    ok = agree >= 0.5 and conf >= 0.5
    meta['site_type_v2'] = top[0] if ok else meta.get('site_type_v2')
    if not ok and not meta.get('site_type_v2'):
        meta['site_type_suggested'] = top[0]
    meta['site_type_confidence'] = conf
    meta['site_type_method'] = 'vlm'
    meta['site_type_signals'] = [f'vlm votes: {dict(votes)}'
                               ] + evid[:3]
    if ok:
        meta.pop('site_type_needs_review', None)
    else:
        meta['site_type_needs_review'] = True
    json.dump(meta, open(mp, 'w'), indent=1)
    return f"{top[0]} conf={conf} votes={dict(votes)}"


def main():
    review = json.load(open(REVIEW))
    queue = [e['slug'] for e in review['review_queue']]
    lim = int(sys.argv[sys.argv.index('--limit') + 1]) \
        if '--limit' in sys.argv else 10_000
    did = Counter()
    for i, slug in enumerate(queue[:lim]):
        try:
            r = classify_one(slug)
        except Exception as e:
            r = f'error:{e}'
        did[str(r).split()[0].split(':')[0]] += 1
        if i % 20 == 0:
            print(f'[{i}/{len(queue)}] {slug[:40]}: {r}',
                  flush=True)
    print('DONE', did.most_common())


if __name__ == '__main__':
    main()
