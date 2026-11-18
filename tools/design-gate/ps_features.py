"""ps_features.py — shared page-segmentation feature spec.

Single source of truth for the PS.* feature names, definitions and
thresholds. Consumed by:
  - gate.py (DOM-based computation on astro build output)
  - patterns/scorer (vision-based computation on Mobbin screenshots)
Both implementations MUST produce the same feature values on the same
page. Thresholds and verdict semantics are identical.

Sources: US9069855B2 (page segmentation), US12393768B2 /
arXiv 2104.08405 (visual semantics), US10824630B2 (boilerplate),
Koray WR-16 macro/micro 80/20.

Feature names (exact):
"""

FEATURES = {
    'block_role_uniqueness': {
        'rule': 'PS.1',
        'def': 'every visual block carries exactly one role '
               '(data-sec/speech_act or visual-role) and ≤1 heading '
               'bound to it',
        'compute': 'fraction of blocks with 1 role AND ≤1 heading; '
                   'DOM: data-sec present + h1/h2 count ≤1 per section; '
                   'vision: each visually distinct region has ≤1 '
                   'headline-scale text',
        'threshold': 1.0, 'fail_below': True,
    },
    'boilerplate_at_edges': {
        'rule': 'PS.2',
        'def': 'chrome blocks (nav/footer/legal) occupy only the top '
               'and bottom edge regions',
        'compute': '1 if all chrome blocks are leading or trailing, '
                   'else 0; DOM: position in data-sec sequence; '
                   'vision: chrome region y-bounds within top/bottom 15%',
        'threshold': 1.0, 'fail_below': True,
    },
    'main_content_share': {
        'rule': 'PS.3',
        'def': 'main content mass / (main + supplementary mass), '
               'chrome excluded from numerator',
        'compute': 'DOM: (content nodes in non-chrome blocks) / all '
                   'content nodes; vision: main-content pixel area / '
                   'non-chrome page area',
        'threshold': 0.8, 'fail_below': True,
    },
    'media_context_binding': {
        'rule': 'PS.4',
        'def': 'every media block has adjacent text (alt/caption/'
               'heading) within its parent block',
        'compute': 'fraction of media elements with alt AND a '
                   'heading/caption/label in the same block; '
                   'vision: image regions with text within 1 gutter',
        'threshold': 1.0, 'fail_below': True,
    },
    'footer_is_boilerplate': {
        'rule': 'PS.5',
        'def': 'footer block contains only links/NAP/legal — no '
               'article headings or prose arguments',
        'compute': '1 if footer has no h1/h2 and no >40-word paragraph, '
                   'else 0; vision: no headline-scale or prose-mass '
                   'text in bottom chrome region',
        'threshold': 1.0, 'fail_below': True,
    },
    'priority_order': {
        'rule': 'PS.6',
        'def': 'no main block renders after a chrome block that is not '
               'the trailing edge; no supplementary block precedes the '
               'first main block',
        'compute': '1 if main blocks are contiguous between leading '
                   'and trailing chrome, else 0; vision: same on '
                   'y-sorted regions',
        'threshold': 1.0, 'fail_below': True,
    },
}

SEGMENT_CHECKS = {
    'check_segment_roles': 'block_role_uniqueness',
    'check_segment_region': 'boilerplate_at_edges',
    'check_segment_share': 'main_content_share',
    'check_segment_media': 'media_context_binding',
    'check_segment_footer': 'footer_is_boilerplate',
    'check_segment_priority': 'priority_order',
}
