"""One place that decides whether an annotation record is evidence.

A capture that failed (Cloudflare challenge, 404, parked domain, blank
render) must never reach patterns, genome statistics, embeddings, the
search index or the scorer's training set — one bad page is not a wrong
row, it is a wrong number everywhere downstream.

`patterns/data/quarantine.json` is written by
`patterns/tools/capture_ok.py verdict`; this module is the only reader,
so every consumer applies the same rule.
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__))))
PAT = os.path.join(ROOT, 'docs', 'machinery', 'design', 'patterns')
DATA = os.path.join(PAT, 'data')
QUARANTINE = os.path.join(DATA, 'quarantine.json')

_CACHE = {}


def load():
    if 'q' in _CACHE:
        return _CACHE['q']
    try:
        q = json.load(open(QUARANTINE))['sites']
    except (OSError, ValueError, KeyError):
        q = {}
    _CACHE['q'] = q
    return q


def slug_of(rec):
    """Corpus slug for a record, from its crop path.

    Mobbin screens live under data/screens/<cell>/ and belong to no site
    directory, so they are keyed by mobbin_id. Negatives are gone —
    quarantine applies to canon (operator-sourced) captures only.
    """
    img = (rec.get('image') or '').replace(os.sep, '/')
    for folder in ('/web/canon/', '/operator/'):
        if folder in img:
            tail = img.split(folder, 1)[1]
            return f'{folder.strip("/")}/{tail.split("/")[0]}'
    return None


def is_quarantined(rec):
    s = slug_of(rec)
    if s and s in load():
        return True
    return False


def is_blank_crop(rec):
    """A crop with almost no ink and no colour is not a design.

    Catches challenge/error/blank screens that slipped through on the
    Mobbin side, where there is no site directory to probe.
    """
    ink = rec.get('ink_density')
    chroma = None
    for b in (rec.get('blocks') or []):
        c = b.get('chroma')
        if c is not None:
            chroma = max(chroma or 0.0, c)
    if ink is not None and ink < 0.004 and (chroma is None or chroma < 5.0):
        return True
    return False


STRUCTURE_FIELDS = ('has_heading', 'has_cta', 'has_links', 'has_form')


def is_section_quality(rec):
    """A pattern sample must be a whole UI section, not a photo.

    Operator rule: reject crops that are >70% a single photo (a media
    block, not a section) or that carry no text/UI structure at all
    (no heading, no CTA, no links, no form — a tile fragment).
    """
    if rec.get('media_ratio', 0) > 0.70:
        return False
    blocks = rec.get('blocks') or []
    if blocks and not any(any(b.get(f) for f in STRUCTURE_FIELDS)
                          for b in blocks):
        return False
    return True


def keep(rec):
    return (not is_quarantined(rec) and not is_blank_crop(rec)
            and is_section_quality(rec))


def dedupe(recs):
    """One record per image.

    The same Mobbin screen can be returned by several `search_sections`
    queries and land under different cell folders — identical pixels,
    different labels. If it is also the same `domain`, it straddles the
    train/test split and the score against it is leakage. Keep the first
    occurrence, which is the cell the miner originally asked for.
    """
    seen = set()
    out = []
    for r in recs:
        key = r.get('mobbin_id') or r.get('image')
        if key in seen:
            continue
        seen.add(key)
        out.append(r)
    return out


def dedupe_bands(recs):
    """Near-identical bands cut from one page count once.

    split_negatives produces strips that are visually the same (uniform
    whitespace + boilerplate) under different names, which lets one weak
    site dominate a fold. Two records with the same measurements on the
    same site are the same band.
    """
    seen = set()
    out = []
    for r in recs:
        site = r.get('site_name') or (r.get('image') or '')
        key = (site.split('/')[-2] if '/' in site else site,
               round(r.get('ink_density') or 0, 3),
               round(r.get('whitespace_share') or 0, 3),
               round(r.get('media_ratio') or 0, 3),
               len(r.get('blocks') or []))
        if key in seen:
            continue
        seen.add(key)
        out.append(r)
    return out


def filter_records(recs, label=1):
    out, dropped = [], {'quarantined': 0, 'blank': 0, 'not_section': 0}
    for r in recs:
        if is_quarantined(r):
            dropped['quarantined'] += 1
        elif is_blank_crop(r):
            dropped['blank'] += 1
        elif not is_section_quality(r):
            dropped['not_section'] += 1
        else:
            out.append(r)
    n0 = len(out)
    out = dedupe(out)
    dropped['dupes'] = n0 - len(out)
    return out, dropped
