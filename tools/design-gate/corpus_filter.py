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
    directory, so they are keyed by mobbin_id.
    """
    img = (rec.get('image') or '').replace(os.sep, '/')
    for corpus in ('web', 'negatives_sections', 'negatives'):
        marker = f'/{corpus}/'
        if marker in img:
            tail = img.split(marker, 1)[1]
            return f'{corpus.split("_")[0]}/{tail.split("/")[0]}'
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


def keep(rec):
    return not is_quarantined(rec) and not is_blank_crop(rec)


def filter_records(recs):
    out, dropped = [], {'quarantined': 0, 'blank': 0}
    for r in recs:
        if is_quarantined(r):
            dropped['quarantined'] += 1
        elif is_blank_crop(r):
            dropped['blank'] += 1
        else:
            out.append(r)
    return out, dropped
