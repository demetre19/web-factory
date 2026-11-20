"""site_folder.py — the per-site design folder contract (U.8).

    DESIGN-SYSTEMS/<site>/              BRIEF.yaml (operator) + site DNA
    DESIGN-SYSTEMS/<site>/pages/<slug>/ one pipeline dir per page

Every tool resolves the site from a page dir through here, so no
tool ever reads design inputs from anywhere else.
"""
import hashlib
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import gate as G  # noqa: E402

ROOT = '/Users/apple/Documents/DEV-WORK/DESIGN-SYSTEMS'


def sha(path):
    with open(path, 'rb') as fh:
        return hashlib.sha256(fh.read()).hexdigest()


def _typed(v):
    """YAML scalars the line parser leaves as text: bools, ints."""
    if isinstance(v, dict):
        return {k: _typed(x) for k, x in v.items()}
    if isinstance(v, list):
        return [_typed(x) for x in v]
    if isinstance(v, str):
        low = v.strip().lower()
        if low in ('true', 'yes'):
            return True
        if low in ('false', 'no'):
            return False
        if re.fullmatch(r'-?\d+', v.strip()):
            return int(v)
    return v


def load_yaml(path):
    with open(path, encoding='utf-8') as fh:
        node, _ = G._parse_block(fh.read().splitlines(), 0, 0)
    return _typed(node or {})


def site_of(page_dir):
    """(site_dir, slug) for a page pipeline dir, or (None, None)."""
    page_dir = os.path.abspath(page_dir)
    parent = os.path.dirname(page_dir)
    if os.path.basename(parent) != 'pages':
        return None, None
    site = os.path.dirname(parent)
    if not os.path.isfile(os.path.join(site, 'BRIEF.yaml')):
        return None, None
    return site, os.path.basename(page_dir)


def brief(page_dir):
    """(site_dir, brief, page_entry) — exits when the page dir is not
    inside a site folder or BRIEF lists no such page."""
    site, slug = site_of(page_dir)
    if not site:
        raise SystemExit(f'{page_dir}: not a page dir of a site folder '
                         f'(<site>/pages/<slug>/ with <site>/BRIEF.yaml)')
    b = load_yaml(os.path.join(site, 'BRIEF.yaml'))
    page = next((p for p in (b.get('pages') or [])
                 if isinstance(p, dict) and p.get('slug') == slug), None)
    if not page:
        raise SystemExit(f'BRIEF.yaml lists no page "{slug}"')
    return site, b, page


def sources(page_dir):
    """(stub_path, article_path) for a page, from BRIEF."""
    _, b, page = brief(page_dir)
    root = (b.get('site') or {}).get('blueprint') or ''
    return (os.path.join(root, page.get('stub') or ''),
            os.path.join(root, page.get('article') or ''))
