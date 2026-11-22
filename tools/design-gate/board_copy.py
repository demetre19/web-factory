#!/usr/bin/env python3
"""board_copy.py — w0 producer: per-board-type COPY bindings.

The picker's non-primary page boards (Service / Location / Contact /
Blog) all render the live page's sections — without this producer every
board shows the same article's copy. The plan layer classifies what the
input content IS (plan_from_copy.page_type_of), binds the real COPY to
the board whose type it matches, and gives every other board a
per-type boilerplate COPY so a Location board reads as a location page
and a Blog board as a guide index — not strata body copy.

This is a binding change, not copywriting: the synthesized doc keeps
the real plan's block ids, zones and answer_types (every copy_ref the
plan emits still resolves via pipeline_emit._copy_slot) and fills the
text slots from mechanical per-type templates keyed by the block's
answer-type intent.

  board_copy.py <pdir>
  inputs   <page>/COPY.json                    copy_ingest.py output
           <site>/BRIEF.yaml                   brand/place names
  outputs  <page>/boards/<board>.copy.json     per-type boilerplate
           <page>/boards/index.json            board → {type, copy}
"""

import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import site_folder as SF  # noqa: E402
import plan_from_copy as PC  # noqa: E402  (page_type_of is the classifier)

TOOL = 'board_copy.py'

# pick board id (picker_app.PAGE_BOARDS) → the page type it previews.
# A board whose type matches the input's classified type binds the
# real COPY.json; the rest get TYPE boilerplate.
BOARD_TYPE = {
    'service': 'service-page',
    'location': 'near-me',
    'contact': 'contact-page',
    'blog': 'guide',
}

_INTENT = [
    ('cost', ('cost', 'price', 'how much')),
    ('coverage', ('coverage', 'where', 'area')),
    ('duration', ('duration', 'cadence', 'frequency', 'when')),
    ('process', ('process', 'mechanism', 'method', 'steps', 'how')),
    ('faq', ('question', 'faq')),
    ('cta', ('cta', 'next step')),
    ('enumeration', ('enumeration', 'list', 'which')),
    ('attribute', ('attribute', 'detail', 'quality')),
    ('definition', ('definition', 'what')),
]


def _intent(answer_type):
    t = (answer_type or '').lower()
    for name, keys in _INTENT:
        if any(k in t for k in keys):
            return name
    return 'definition'


def _place(slug):
    parts = [p for p in re.split(r'[-_]', slug) if p]
    tail = parts[-1] if parts else slug
    return tail.capitalize()


# Per board type, per intent: (h2, stub_fs, terms, answer) templates.
# {b} = brand, {p} = place. Kept terse — these are structure-filling
# boilerplate, not authored copy.
def _board_blocks(board, brand, place):
    b, p = brand, place
    lib = {
        'service': {
            'h1': f'{b} services',
            'lede': (f'{b} delivers a scheduled service programme '
                     f'across {p} — scoped visits, trained teams, '
                     'documented sign-off.'),
            'definition': (f'What the {b} service covers',
                           [f'{b} service', 'scope', 'schedule'],
                           f'The {b} service covers the agreed scope '
                           'on a recurring schedule — every visit '
                           'logged and signed off.'),
            'enumeration': [('What each visit includes',
                             ['checklist', 'supplies', 'finish'],
                             'Each visit works a set checklist — '
                             'supplies stocked, surfaces finished, '
                             'edge cases noted for the next '
                             'run.'),
                            ('What the quote covers',
                             ['labour', 'consumables', 'QA'],
                             'The quote covers labour, consumables '
                             'and the QA pass — nothing hidden.')],
            'process': [('How the service runs',
                         ['audit', 'plan', 'team', 'QA'],
                         'Every engagement runs the same steps — '
                         'site audit, scope plan, team assignment, '
                         'quality check.'),
                        ('How the work stays consistent',
                         ['checklists', 'training', 'reviews'],
                         'Set checklists and trained teams keep '
                         'every visit to the same standard.')],
            'cost': ('What the service costs',
                     ['scope', 'frequency', 'quote'],
                     'Pricing follows scope and frequency — a fixed '
                     'quote after the walkthrough, no open ends.'),
            'duration': ('How often visits run',
                         ['weekly', 'fortnightly', 'roster'],
                         'Visits run to the agreed roster — weekly, '
                         'fortnightly or daily for high-traffic '
                         'sites.'),
            'attribute': ('How quality is checked',
                          ['logs', 'photos', 'sign-off'],
                          'Every visit leaves a record — checklist, '
                          'photos and a supervisor sign-off.'),
            'coverage': (f'Where {b} operates',
                         [p, 'metro', 'suburbs'],
                         f'{b} covers {p} and the surrounding metro '
                         'area — same roster, same standard.'),
            'faq': ('Service questions',
                    ['booking', 'access', 'supplies'],
                    'Common service questions — booking, access '
                    'arrangements and what the team supplies.'),
            'cta': ('Book a walkthrough',
                    ['walkthrough', 'quote'],
                    'Book a walkthrough and get a scoped quote.'),
        },
        'location': {
            'h1': f'{b} in {p}',
            'lede': (f'{b} serves {p} and the surrounding area — '
                     'local teams on a set roster with the same '
                     'documented standard.'),
            'definition': (f'{b} across {p}',
                           [p, 'local team', 'roster'],
                           f'{b} runs local teams across {p} — the '
                           'same visit checklist and sign-off as '
                           'every other area it serves.'),
            'enumeration': [(f'Areas covered around {p}',
                             [p, 'northside', 'southside', 'cbd'],
                             f'Coverage spans {p} and the '
                             'adjoining suburbs — one roster, no '
                             'travel surcharges.'),
                            (f'What the {p} service includes',
                             ['checklist', 'supplies', 'QA'],
                             'The local checklist matches the '
                             'metro standard — supplies, finish '
                             'and QA included.')],
            'process': [(f'Booking {b} in {p}',
                         ['enquiry', 'visit', 'roster'],
                         'Book, get a site visit, join the local '
                         'roster — the same three steps in every '
                         'area.'),
                        ('How local visits are scheduled',
                         ['roster', 'routing', 'windows'],
                         'Local visits batch by area — one routing '
                         'pass keeps the roster tight.')],
            'cost': (f'Pricing in {p}',
                     ['local quote', 'scope'],
                     f'Quotes for {p} sites follow the same scope-'
                     'based pricing — no regional loading.'),
            'duration': ('Local visit cadence',
                         ['roster', 'windows'],
                         'Local visits run inside agreed time '
                         'windows on the standing roster.'),
            'attribute': ('Local standards',
                          ['same checklist', 'sign-off'],
                          'The same checklist and sign-off apply in '
                          'every area — no regional shortcuts.'),
            'coverage': (f'Service area — {p} and surrounds',
                         [p, 'postcodes', 'radius'],
                         f'The {p} service area covers the suburb '
                         'and a working radius around it.'),
            'faq': (f'Questions from {p} clients',
                    ['access', 'keys', 'timing'],
                    'Local questions — access, keys and timing.'),
            'cta': (f'Get a {p} quote',
                    ['quote', 'call'],
                    f'Request a quote for a {p} site.'),
        },
        'contact': {
            'h1': f'Contact {b}',
            'lede': (f'Reach {b} — phone, email or the form below. '
                     'Every enquiry gets a same-day response in '
                     'business hours.'),
            'definition': ('How to reach the team',
                           ['phone', 'email', 'form'],
                           'Call, email or send the form — each '
                           'channel lands with the same duty team.'),
            'enumeration': [('Ways to get in touch',
                             ['phone', 'email', 'form'],
                             'Three channels — phone for urgent '
                             'items, email for documents, the '
                             'form for anything else.'),
                            ('What the office handles',
                             ['quotes', 'rosters', 'issues'],
                             'The office handles quotes, roster '
                             'changes and issue escalation.')],
            'process': [('What happens after you enquire',
                         ['reply', 'scope', 'quote'],
                         'Every enquiry gets a reply, then a '
                         'scoped quote — no obligation.'),
                        ('How a booking gets confirmed',
                         ['quote', 'accept', 'schedule'],
                         'Accept the quote and the work slots '
                         'into the roster — confirmation by '
                         'reply.')],
            'cost': ('What a quote costs',
                     ['free quote'],
                     'Quotes are free and fixed to the scoped '
                     'work.'),
            'duration': ('Response times',
                         ['same day', 'business hours'],
                         'Enquiries get a same-day response in '
                         'business hours.'),
            'attribute': ('What to include in an enquiry',
                          ['address', 'scope', 'photos'],
                          'An address, the rough scope and any '
                          'photos speed up the quote.'),
            'coverage': ('Where enquiries are handled',
                         ['head office', 'field teams'],
                         'Enquiries route to the nearest field '
                         'team.'),
            'faq': ('Contact questions',
                    ['hours', 'urgent'],
                    'Contact questions — hours, urgent jobs.'),
            'cta': ('Send an enquiry',
                    ['form', 'call'],
                    'Send the form or call the line.'),
        },
        'blog': {
            'h1': f'{b} guides',
            'lede': (f'Guides and notes from the {b} team — '
                     'methods, standards and worked examples from '
                     'live sites.'),
            'definition': ('What these guides cover',
                           ['methods', 'standards'],
                           'Short guides on methods and standards — '
                           'each one written from live work.'),
            'enumeration': [('Latest guides',
                             ['guide one', 'guide two',
                              'guide three'],
                             'The latest guides from the team — '
                             'methods, checklists and worked '
                             'examples.'),
                            ('Guide categories',
                             ['methods', 'standards', 'gear'],
                             'Guides group by method, standard '
                             'and gear.')],
            'process': [('How a guide is put together',
                         ['field notes', 'review', 'publish'],
                         'Each guide starts from field notes, '
                         'gets a review pass, then publishes.'),
                        ('How topics get picked',
                         ['site questions', 'requests'],
                         'Topics come from real site questions '
                         'and reader requests.')],
            'cost': ('Using these guides',
                     ['free', 'reference'],
                     'Guides are free reference material.'),
            'duration': ('Publishing cadence',
                         ['monthly', 'archive'],
                         'New guides land monthly; the archive '
                         'stays up.'),
            'attribute': ('How guides stay accurate',
                          ['review', 'updates'],
                          'Guides get a review pass when methods '
                          'change.'),
            'coverage': ('Topics in the archive',
                         ['methods', 'compliance', 'supplies'],
                         'The archive covers methods, compliance '
                         'and supplies.'),
            'faq': ('Guide questions',
                    ['sources', 'updates'],
                    'Questions about sources and updates.'),
            'cta': ('Read the latest guide',
                    ['latest'],
                    'Start with the latest guide.'),
        },
    }
    return lib.get(board) or lib['service']


def synthesize(board, real_copy, brand, place):
    """A COPY.json-shaped doc for a board whose type is NOT the
    input's: same block ids/zones/answer_types so the plan's
    copy_refs all resolve, text slots filled from the type's
    boilerplate library."""
    lib = _board_blocks(board, brand, place)
    out = dict(real_copy)
    out['generated_by'] = TOOL
    out['h1'] = lib['h1']
    out['lede'] = lib['lede']
    blocks = []
    used = {}
    for blk in real_copy.get('blocks') or []:
        key = _intent(blk.get('answer_type'))
        n = used.get(key, 0)
        used[key] = n + 1
        val = lib.get(key) or lib['definition']
        # a lib value may be one (h2, terms, answer) tuple or a list
        # of variants — later blocks of the same intent take the next
        # variant so rows don't repeat one headline
        if isinstance(val, list):
            h2, terms, answer = val[min(n, len(val) - 1)]
        else:
            h2, terms, answer = val
        nb = dict(blk)
        nb['h2'] = h2
        nb['stub_fs'] = answer
        nb['answer'] = answer
        nb['terms'] = list(terms)
        nb.pop('before', None)
        nb.pop('after', None)
        nb.pop('qa', None)
        nb.pop('links', None)
        nb.pop('items', None)
        nb.pop('list_ordered', None)
        blocks.append(nb)
    out['blocks'] = blocks
    out['closing'] = {'text': lib.get('cta', ('', [], ''))[2]}
    out['links_out'] = []
    return out


def build(pdir):
    """Write boards/<board>.copy.json for every board type that is
    not the input's classified type, plus boards/index.json — the
    map emit and the picker consume:
      {board: {'type': t, 'copy': 'COPY.json'|'boards/<b>.copy.json',
               'real': bool}}"""
    site_dir, slug = SF.site_of(pdir)
    _, brief, _page = SF.brief(pdir)
    brand = (brief.get('brand') or {}).get('name') or 'the service'
    place = _place(slug)
    copy = json.load(open(os.path.join(pdir, 'COPY.json'),
                          encoding='utf-8'))
    ptype = PC.page_type_of(copy)
    boards = {}
    bdir = os.path.join(pdir, 'boards')
    for bid, btype in BOARD_TYPE.items():
        if btype == ptype:
            boards[bid] = {'type': btype, 'copy': 'COPY.json',
                           'real': True}
            continue
        doc = synthesize(bid, copy, brand, place)
        os.makedirs(bdir, exist_ok=True)
        rel = f'boards/{bid}.copy.json'
        with open(os.path.join(pdir, rel), 'w',
                  encoding='utf-8') as f:
            f.write(json.dumps(doc, indent=1, ensure_ascii=False)
                    + '\n')
        boards[bid] = {'type': btype, 'copy': rel, 'real': False}
    if boards:
        os.makedirs(bdir, exist_ok=True)
        with open(os.path.join(bdir, 'index.json'), 'w',
                  encoding='utf-8') as f:
            f.write(json.dumps(boards, indent=1,
                               ensure_ascii=False) + '\n')
    return boards


def main(argv):
    if len(argv) != 2:
        sys.exit('usage: board_copy.py <page-dir>')
    boards = build(os.path.abspath(argv[1]))
    for bid, meta in boards.items():
        print(f"  board {bid}: {meta['type']} "
              f"({'real copy' if meta['real'] else 'boilerplate'})")


if __name__ == '__main__':
    main(sys.argv)
