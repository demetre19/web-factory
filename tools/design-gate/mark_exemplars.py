#!/usr/bin/env python3
"""Attach details.so exemplar labels to operator meta.json sections.

Reads _sources/details-so.json, groups entries by visit URL -> operator
slug, then for each ingested site marks the matching section(s) with:
  section['exemplar'] = {'source':'details.so','tag':..., 'detail_url':...,
                         'motion':<tag or None>, 'video':<mp4 or None>}
Meta-level: meta['motion_traits'] for motion/interaction tags.
Idempotent; safe to re-run.
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
OPERATOR = os.path.join(ROOT, 'docs', 'machinery', 'design', 'patterns',
                        'data', 'operator')
SRC = os.path.join(OPERATOR, '_sources', 'details-so.json')

# details.so primary tag -> corpus section_type (or None = motion trait)
TAG_TO_TYPE = {
    'hero': 'hero', 'footer': 'footer',
    'navigation': 'nav', 'drawer': 'nav', 'dropdown': 'nav',
    'fullscreen': 'nav', 'cta': 'call-to-action',
    'newsletter': 'call-to-action', 'testimonial': 'testimonials',
    'social-proof': 'testimonials', 'team': 'teams',
    'pricing': 'pricing', 'faq': 'faq', 'contact': 'contact',
    'case-study': 'case-study', 'logo': 'logo-sections',
    'features': 'feature', 'stats': 'feature', 'steps': 'feature',
    'card': 'grids-and-cards', 'carousel': 'grids-and-cards',
    'list': 'grids-and-cards', 'rows': 'grids-and-cards',
    'products': 'grids-and-cards', 'services': 'grids-and-cards',
    'about': 'content', 'article': 'content', 'blog': 'content',
    'editorial': 'content', 'content': 'content',
    'text-showcase': 'content', 'media-showcase': 'gallery',
    'image-led': 'gallery', 'video': 'gallery',
    'timeline': 'feature', 'faq-inline': 'faq',
    'button': 'ui-component', 'accordion': 'ui-component',
    'modal': 'ui-component', '404': 'ui-component',
    'preloader': 'ui-component',
}
MOTION_TAGS = {
    'scroll-animations', 'parallax', 'pinned-scroll', 'stacked-scroll',
    'horizontal-scroll', 'hover-animations', 'morphing',
    'cursor-interaction', 'page-transition', 'section-transition',
    'contextual-transition', 'organic', '3d',
}


def slugify(url):
    return re.sub(r'[^a-z0-9]+', '-', url.lower()).strip('-')[:90]


def match_section(meta, want_type, tag):
    """Pick the best section for an exemplar tag."""
    secs = meta.get('sections') or []
    cands = [s for s in secs if s.get('section_type') == want_type]
    if tag == 'hero' and not cands:
        # first non-nav section is the de-facto hero
        cands = [s for s in secs
                 if s.get('section_type') not in ('nav', 'footer')
                 and s['index'] <= 1]
    if not cands:
        return None
    # prefer highest confidence, then earliest position
    return sorted(cands, key=lambda s: (-(s.get('confidence') or 0),
                                        s.get('index', 99)))[0]


def main():
    src = json.load(open(SRC))
    by_url = {}
    for r in src['sites']:
        u = r.get('url')
        if not u:
            continue
        by_url.setdefault(u, []).append(r)
    touched, marked, mot = 0, 0, 0
    for url, entries in by_url.items():
        mp = os.path.join(OPERATOR, slugify(url), 'meta.json')
        if not os.path.exists(mp):
            continue
        meta = json.load(open(mp))
        if meta.get('capture_status') != 'ok':
            continue
        changed = False
        traits = set(meta.get('motion_traits') or [])
        for e in entries:
            tag = e.get('primary_tag') or ''
            want = TAG_TO_TYPE.get(tag)
            if tag in MOTION_TAGS or want is None:
                traits.add(tag or 'unspecified')
            if not want:
                mot += 1
                continue
            s = match_section(meta, want, tag)
            if not s:
                continue
            ex = s.get('exemplar') or []
            if isinstance(ex, dict):
                ex = [ex]
            rec = {'source': 'details.so', 'tag': tag,
                   'detail_url': e['detail_url'],
                   'motion': tag if tag in MOTION_TAGS else None,
                   'video': e.get('video')}
            if not any(x.get('detail_url') == e['detail_url']
                       for x in ex):
                ex.append(rec)
                marked += 1
                changed = True
            s['exemplar'] = ex
        if traits:
            new = sorted(traits)
            if new != meta.get('motion_traits'):
                meta['motion_traits'] = new
                changed = True
                mot += 1
        if changed:
            json.dump(meta, open(mp, 'w'), indent=1)
            touched += 1
    print(f'{touched} metas updated, {marked} section exemplar marks, '
          f'{mot} motion-trait events')


if __name__ == '__main__':
    main()
