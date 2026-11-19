#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow", "numpy"]
# ///
"""Bank captured sites into the canon.

LAW: Mobbin screens, operator-suggested sites and banked reference sites
are canon — search covers the whole bank and nothing is dropped except
captures that failed `capture_ok`. A banked site becomes annotation
records (one per detected section) so it feeds patterns, the genome and
the scorer exactly the way Mobbin evidence does.

  uv run bank.py <slug> [<slug>...]   # web/<slug> -> annotations
  uv run bank.py --all                # every ok site not yet banked

Records are appended to data/annotations.jsonl with `source` carried
from the site's meta.json (`operator` | `reference` | ...). Section
crops are written next to the tiles as sec-NN.png, so `embed_images.py
build` vectors them without another code path.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'data'))
WEB = os.path.join(DATA, 'web')
OUT = os.path.join(DATA, 'annotations.jsonl')

sys.path.insert(0, HERE)

# speech_act -> corpus section_type vocabulary (measured in
# annotations.jsonl); anything else banks as `other` — kept in canon,
# ignored by pattern_fit just like Mobbin `other` rows.
ACT_TO_SECTION = {
    'promise': 'hero',
    'act': 'call-to-action',
    'proof': 'testimonials',
    'explain': 'how-it-works',
    'nav': 'nav',
    'footer': 'footer',
}

# Chrome is captured in ui_analysis, not banked as pattern evidence:
# auto-detected nav/footer/CTA strips are page furniture, not section
# designs — counting them taught the scorer that canon looks like
# boilerplate (banked AUC dropped to 0.47).
SKIP_SECTIONS = {'nav', 'footer', 'call-to-action'}


def bank_site(slug, verbose=True):
    d = os.path.join(WEB, slug)
    mp = os.path.join(d, 'meta.json')
    if not os.path.exists(mp):
        return 'no meta.json'
    meta = json.load(open(mp))
    if meta.get('capture_status', 'ok') != 'ok':
        return f"quarantined: {meta.get('capture_status')} " \
               f"({meta.get('capture_reason')})"
    if meta.get('banked'):
        return 'already banked'
    # `web/` mixes curated references with a negative-ecommerce control
    # group; the negatives are contrast corpus, never canon evidence
    if (meta.get('source') or '') == 'negative':
        return 'negative source — contrast corpus, not canon'
    secs = ((meta.get('ui_analysis') or {}).get('sections')) or []
    if not secs:
        return 'no sections — run annotate_web.py --site first'

    import image_features
    records = []
    n_crop = 0
    for i, sec in enumerate(secs):
        tile = sec.get('_tile')
        crop = sec.get('_crop')
        if tile is None or crop is None:
            continue
        tp = os.path.join(d, tile)
        if not os.path.exists(tp):
            continue
        # materialise the section image so embed/search see it
        name = f'sec-{i:02d}.png'
        sp = os.path.join(d, name)
        if not os.path.exists(sp):
            from PIL import Image
            im = Image.open(tp).convert('RGB')
            W, H = im.size
            box = (int(crop[0] * W), int(crop[1] * H),
                   int(crop[2] * W), int(crop[3] * H))
            if box[2] - box[0] < 24 or box[3] - box[1] < 24:
                continue
            im.crop(box).save(sp)
            n_crop += 1
        feat = image_features.analyze(sp)
        act = sec.get('purpose_speech_act')
        section_type = ACT_TO_SECTION.get(act, 'other')
        if section_type in SKIP_SECTIONS:
            continue
        records.append({
            'site_name': meta.get('domain') or slug,
            'image': sp,
            'site_type': meta.get('site_type') or 'general',
            'page_type': meta.get('page_type') or 'landing',
            'section_type': section_type,
            'speech_act': act,
            'composition': sec.get('composition'),
            'density': sec.get('density'),
            'surface': sec.get('surface'),
            'columns': feat['columns'],
            'media_side': feat.get('media_side'),
            'ink_density': feat['ink_density'],
            'whitespace_share': feat['whitespace_share'],
            'media_ratio': feat['media_ratio'],
            'ps': feat['ps'],
            'blocks': feat['blocks'],
            'cta_count': sum(1 for b in feat['blocks']
                             if b.get('has_cta')),
            'quality_tier': 'banked',
            'source': meta.get('source') or 'reference',
            'label': slug,
            'annotator': f'bank.py:{meta.get("source", "reference")}',
            'y': sec.get('y'),
        })
    if not records:
        return 'no cropable sections'
    with open(OUT, 'a') as f:
        for r in records:
            f.write(json.dumps(r) + '\n')
    meta['banked'] = True
    import time
    meta['banked_at'] = time.strftime('%Y-%m-%d', time.gmtime())
    meta['banked_sections'] = len(records)
    json.dump(meta, open(mp, 'w'), indent=1)
    if verbose:
        print(f'{slug}: {len(records)} records, {n_crop} crops -> '
              f'annotations.jsonl [{meta.get("source")}]')
    return len(records)


def banked_slugs():
    """Sources already in the canon — idempotent re-runs skip these."""
    return {json.loads(l)['label'] for l in open(OUT)
            if json.loads(l).get('annotator', '').startswith('bank.py')}


def main():
    args = [a for a in sys.argv[1:] if a != '--all']
    slugs = args
    if '--all' in sys.argv or not slugs:
        have = banked_slugs()
        slugs = [s for s in sorted(os.listdir(WEB))
                 if os.path.isdir(os.path.join(WEB, s)) and s not in have]
    done = 0
    for slug in slugs:
        r = bank_site(slug)
        if isinstance(r, int):
            done += 1
        else:
            print(f'{slug}: {r}')
    print(f'{done} sites banked')


if __name__ == '__main__':
    main()
