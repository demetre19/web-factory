#!/usr/bin/env python3
"""intent.py — brand attributes, audience and choice→reason, from evidence.

The intent layer answers a different question from the pattern library:
not "what does this section look like" but "what is this site *trying to
be*, and did its choices serve that". Three steps, all measured:

  text     full visible copy per ok capture -> meta.page_text
  extract  attribute / audience / CTA vocabulary -> meta.intent, with the
           matched cue as evidence (no cue, no attribute)
  model    P(choice | vertical), P(choice | attribute) over the corpus,
           and per-site labels conventional / deliberate / accidental

Vocabulary is closed and every hit keeps its cue, because an "attribute"
without a sentence behind it is an opinion. Nothing here uses an LLM.

  python3 intent.py text      [--limit N] [--refresh]
  python3 intent.py extract
  python3 intent.py model
  python3 intent.py report
"""
import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
PATTERNS = os.path.normpath(os.path.join(HERE, '..'))
DATA = os.path.join(PATTERNS, 'data')
WEB = os.path.join(DATA, 'web')
OUT = os.path.join(DATA, 'intent-model.json')
UA = ('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) '
      'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36')

# Corpus labels that are not TAXONOMY verticals get folded into the
# vertical they are a variant of, so vertical statistics mean something.
VERTICAL_MAP = {'ecommerce-bad': 'ecommerce', 'small-business': 'services',
                'web': 'other'}

ATTRIBUTES = {
    'speed': r'\b(fast|quick|same[- ]day|24/7|express|instant|within \w+ (hours|minutes)|rapid)\b',
    'reliability': r'\b(guarantee[ds]?|insured|warranty|trusted|since (19|20)\d\d|years of|vetted|accredited|licensed)\b',
    'care': r'\b(care|caring|gentle|family[- ]run|we listen|personal(ised|ized)?|dedicated|hand[- ]held)\b',
    'craft': r'\b(handmade|hand[- ]crafted|crafted|bespoke|atelier|artisan|hand[- ]finished|tailored|made in)\b',
    'exclusivity': r'\b(private|members|invitation|exclusive|limited edition|rare|by appointment|collectors?)\b',
    'value': r'\b(affordable|cheap|budget|price match|from \$|free quote|no lock[- ]in|save \d|best price)\b',
    'transparency': r'\b(no hidden|upfront|transparent|fixed price|honest|clear pricing|no surprises)\b',
    'expertise': r'\b(experts?|specialists?|certified|engineers|consultants?|award[- ]winning|qualified)\b',
    'sustainability': r'\b(sustainab|eco[- ]?friendly|recycled|carbon|green|ethically|organic)\b',
    'innovation': r'\b(innovative|cutting[- ]edge|next[- ]gen|pioneering|future|ai[- ]powered)\b',
    'security': r'\b(secure|safety|complian|gdpr|iso \d|insured|bonded)\b',
    'community': r'\b(community|local|neighbours|together|volunteers?|grassroots)\b',
    'confidence': r'\b(leading|number one|#1|best[- ]sell|award|market leader|industry[- ]leading)\b',
    'fun': r'\b(fun|playful|joyful|exciting|adventure|delight)\b',
    'romance': r'\b(romantic|wedding|love|intimate|engagement)\b',
    'heritage': r'\b(heritage|historic|tradition|established|generations|est\. ?(19|20)\d\d)\b',
    'calm': r'\b(calm|quiet|serene|slow|retreat|sanctuary|stillness)\b',
    'luxury': r'\b(luxury|exquisite|finest|exceptional|discerning|prestige|signature)\b',
}

AUDIENCE = {
    'families': r'\b(families|family|children|kids|parents|mums|dads)\b',
    'businesses': r'\b(business(es)?|b2b|commercial|offices?|workplaces?|companies|enterprises?)\b',
    'homeowners': r'\b(homeowners?|householders?|your home|residential)\b',
    'renters': r'\b(renters?|tenants?|end of lease|vacate|bond)\b',
    'students': r'\b(students?|schools?|universit|campus)\b',
    'seniors': r'\b(seniors?|elderly|aged care|retirement)\b',
    'couples': r'\b(couples?|weddings?|brides?|anniversar)\b',
    'travellers': r'\b(travel?ers?|guests?|visitors?|tourists?|stays?)\b',
    'investors': r'\b(investors?|portfolio|fund|capital|shareholders?)\b',
    'developers': r'\b(developers?|builders?|architects?|contractors?)\b',
    'designers': r'\b(designers?|studios?|creatives?|agencies)\b',
    'patients': r'\b(patients?|clients? in care|treatment|clinics?)\b',
    'startups': r'\b(startups?|founders?|scale[- ]ups?)\b',
    'enterprises': r'\b(enterprise|enterprises|procurement|it teams?)\b',
    'discerning': r'\b(discerning|collectors?|connoisseurs?|aficionados)\b',
}

CTAS = {
    'book': r'\b(book|schedule|reserve|appointment)\b',
    'quote': r'\b(quote|estimate|pricing|enquir|inquir)\b',
    'shop': r'\b(shop|buy|add to (bag|cart)|order|checkout)\b',
    'call': r'\b(call|phone|talk to|speak to)\b',
    'apply': r'\b(apply|register|join|sign up|subscribe)\b',
    'download': r'\b(download|brochure|guide|whitepaper|pdf)\b',
    'visit': r'\b(visit|showroom|view (the|our)|book a (tour|viewing))\b',
    'learn': r'\b(learn more|discover|explore|read more)\b',
}


def sites():
    for slug in sorted(os.listdir(WEB)):
        mp = os.path.join(WEB, slug, 'meta.json')
        if os.path.exists(mp):
            meta = json.load(open(mp))
            if meta.get('capture_status', 'ok') == 'ok':
                yield slug, os.path.dirname(mp), meta


def fetch_text(url, limit=8000, timeout=25):
    req = urllib.request.Request(url, headers={
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-AU,en;q=0.9'})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            raw = r.read(900_000)
            enc = r.headers.get_content_charset() or 'utf-8'
            html = raw.decode(enc, 'replace')
    except Exception as e:
        return None, str(e)
    html = re.sub(r'<(script|style|noscript|svg)[^>]*>.*?</\1>', ' ', html,
                  flags=re.S | re.I)
    html = re.sub(r'<(nav|header|footer|main|section|article|li|p|h[1-6]|button|a)[^>]*>',
                  '\n', html, flags=re.I)
    txt = re.sub(r'<[^>]+>', ' ', html)
    txt = re.sub(r'&nbsp;|&#160;', ' ', txt)
    txt = re.sub(r'[ \t]+', ' ', txt)
    txt = re.sub(r'\n\s*\n+', '\n', txt).strip()
    return txt[:limit], None


def cmd_text(args):
    """Fetch visible copy. Threaded: one slow site must not stall 174."""
    from concurrent.futures import ThreadPoolExecutor
    todo = [(slug, d, meta) for slug, d, meta in sites()
            if args.refresh or not meta.get('page_text')]
    def work(job):
        slug, d, meta = job
        txt, err = fetch_text(meta['url'], timeout=args.timeout)
        meta['page_text'] = txt or ''
        meta['page_text_error'] = err
        meta['page_text_at'] = time.strftime('%Y-%m-%dT%H:%M:%SZ',
                                             time.gmtime())
        json.dump(meta, open(os.path.join(d, 'meta.json'), 'w'), indent=1)
        return f'{slug}: {len(meta["page_text"])} chars' + (
            f' ERROR {err[:40]}' if err else '')
    n = 0
    with ThreadPoolExecutor(max_workers=args.workers) as ex:
        for msg in ex.map(work, todo):
            n += 1
            if n % 10 == 0:
                print(msg, flush=True)
    print(f'fetched {n} pages')


def cues(text, table):
    """attribute -> the first matching cue (evidence), or absent."""
    low = text.lower()
    out = {}
    for name, pat in table.items():
        m = re.search(pat, low)
        if m:
            start = max(0, m.start() - 40)
            out[name] = low[start:m.end() + 40].strip()
    return out


def vertical_of(meta):
    st = meta.get('site_type') or 'other'
    return VERTICAL_MAP.get(st, st)


def choices_of(meta):
    """Measured design choices, one per dimension, from the capture."""
    ui = meta.get('ui_analysis') or {}
    pal = ui.get('palette') or {}
    secs = ui.get('sections') or []
    imgs = meta.get('images') or []
    ss = meta.get('set_summary') or {}
    lum = lambda h: (int(h[1:3], 16) * 0.2126 + int(h[3:5], 16) * 0.7152
                     + int(h[5:7], 16) * 0.0722) if isinstance(h, str) and len(h) == 7 else None
    bg_l = lum(pal.get('bg'))
    acc = pal.get('accent')
    out = {}
    if bg_l is not None:
        out['surface'] = ('dark' if bg_l < 90 else 'light' if bg_l > 200
                          else 'mid')
    if acc:
        r, g, b = (int(acc[1:3], 16), int(acc[3:5], 16), int(acc[5:7], 16))
        out['accent'] = ('warm' if r > b + 25 else 'cool' if b > r + 25
                         else 'neutral')
    if secs:
        out['page_length'] = ('short' if len(secs) <= 4 else 'medium'
                              if len(secs) <= 8 else 'long')
    if imgs:
        out['imagery'] = ('image-led' if len(imgs) >= 4 else 'balanced'
                          if len(imgs) >= 2 else 'text-led')
        out['medium'] = ss.get('dominant_medium')
        out['image_style'] = ss.get('style')
    if ss.get('emotion_axes'):
        e = ss['emotion_axes'].get('calm_energetic')
        if e is not None:
            out['energy'] = ('calm' if e < -0.3 else 'energetic' if e > 0.3
                             else 'balanced')
        r = ss['emotion_axes'].get('accessible_luxurious')
        if r is not None:
            out['register'] = ('everyday' if r < -0.3 else 'luxury'
                               if r > 0.3 else 'premium')
    return {k: v for k, v in out.items() if v}


def cmd_extract(args):
    n = 0
    for slug, d, meta in sites():
        text = meta.get('page_text') or ''
        if not text:
            continue
        attrs = cues(text, ATTRIBUTES)
        auds = cues(text, AUDIENCE)
        ctas = cues(text, CTAS)
        meta['intent'] = {
            'brand_attributes': sorted(attrs),
            'audience': sorted(auds),
            'cta_vocabulary': sorted(ctas),
            'evidence': {k: v[:100] for k, v in list(attrs.items())[:6]},
            'vertical': vertical_of(meta),
            'provenance': 'inferred',
            'extracted_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        }
        meta['choices'] = choices_of(meta)
        json.dump(meta, open(os.path.join(d, 'meta.json'), 'w'), indent=1)
        n += 1
    print(f'extracted intent for {n} sites')


def cmd_model(args):
    """Conditional P(choice | vertical) and P(choice | attribute), plus
    a per-site verdict: conventional, deliberate deviation, accidental."""
    rows = []
    for slug, d, meta in sites():
        ch = meta.get('choices') or {}
        it = meta.get('intent') or {}
        if not ch or not it:
            continue
        rows.append({'slug': slug, 'vertical': it['vertical'],
                     'choices': ch, 'attributes': it['brand_attributes'],
                     'audience': it['audience'],
                     'title': ((meta.get('ui_analysis') or {})
                               .get('summary_title') or '')[:100]})
    if not rows:
        raise SystemExit('no extracted intent: run `intent.py extract` first')
    dims = sorted({k for r in rows for k in r['choices']})
    pv = {}
    for dim in dims:
        by_v = defaultdict(Counter)
        tot_v = Counter()
        for r in rows:
            a = r['choices'].get(dim)
            if not a:
                continue
            by_v[r['vertical']][a] += 1
            tot_v[r['vertical']] += 1
        pv[dim] = {v: {a: round(c / tot_v[v], 3) for a, c in by_v[v].items()}
                   for v in by_v}
    pu = {}
    for dim in dims:
        by_u = defaultdict(Counter)
        tot_u = Counter()
        for r in rows:
            a = r['choices'].get(dim)
            if not a:
                continue
            for au in r['audience']:
                by_u[au][a] += 1
                tot_u[au] += 1
        pu[dim] = {au: {a: round(c / tot_u[au], 3) for a, c in by_u[au].items()}
                   for au in by_u if tot_u[au] >= 5}
    pa = {}
    for dim in dims:
        by_a = defaultdict(Counter)
        tot_a = Counter()
        for r in rows:
            a = r['choices'].get(dim)
            if not a:
                continue
            for at in r['attributes']:
                by_a[at][a] += 1
                tot_a[at] += 1
        pa[dim] = {at: {a: round(c / tot_a[at], 3) for a, c in by_a[at].items()}
                   for at in by_a if tot_a[at] >= 5}
    verdicts = []
    for r in rows:
        for dim, allele in r['choices'].items():
            p_v = pv.get(dim, {}).get(r['vertical'], {}).get(allele)
            if p_v is None:
                continue
            label = ('conventional' if p_v >= 0.5 else 'minority'
                     if p_v >= 0.2 else 'deliberate deviation')
            verdicts.append({'slug': r['slug'], 'vertical': r['vertical'],
                             'choice': dim, 'allele': allele,
                             'p_vertical': p_v, 'label': label})
    out = {
        'n_sites': len(rows),
        'generated': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'p_choice_given_vertical': pv,
        'p_choice_given_attribute': pa,
        'p_choice_given_audience': pu,
        'verdicts': verdicts,
        'rows': rows,
    }
    json.dump(out, open(OUT, 'w'), indent=1)
    conv = sum(1 for v in verdicts if v['label'] == 'conventional')
    dev = sum(1 for v in verdicts if v['label'] == 'deliberate deviation')
    print(f'{len(rows)} sites, {len(verdicts)} choice verdicts: '
          f'{conv} conventional, {dev} deliberate deviation -> '
          f'{os.path.relpath(OUT, PATTERNS)}')


def cmd_report(args):
    d = json.load(open(OUT))
    print(f"sites {d['n_sites']}")
    for dim in sorted(d['p_choice_given_vertical']):
        print(f'\n{dim}:')
        for v, al in sorted(d['p_choice_given_vertical'][dim].items()):
            print(f'  {v:20s} ' + ', '.join(f'{a} {p:.0%}'
                                            for a, p in sorted(al.items(),
                                                               key=lambda t: -t[1])))
    attrs = Counter()
    for r in d['rows']:
        attrs.update(r['attributes'])
    print('\nattributes:', attrs.most_common(12))


INTENT_DIR = os.path.join(PATTERNS, 'intent')

DIM_DOC = {
    'surface': 'ground colour of the page (dark / mid / light)',
    'accent': 'temperature of the accent colour (warm / cool / neutral)',
    'page_length': 'number of stacked sections (short / medium / long)',
    'imagery': 'how much of the page is picture (text-led / balanced / image-led)',
    'medium': 'dominant image medium (CLASSIFY.md)',
    'image_style': 'dominant image style (CLASSIFY.md collapsed)',
    'energy': 'calm .. energetic, from media-block CLIP pole contrast',
    'register': 'everyday .. luxury, from media-block CLIP pole contrast',
}


def cmd_graph(args):
    """choice -> attribute edges as knowledge-graph nodes.

    One node per (choice, allele) and one per attribute, each carrying the
    measured conditional probabilities that justify it. The graph is the
    contract: a rule can cite `intent-choice-surface-dark`, and the node
    says how often that choice accompanies which brand attribute in the
    corpus.
    """
    d = json.load(open(OUT))
    pv = d['p_choice_given_vertical']
    pa = d['p_choice_given_attribute']
    rows = d['rows']
    os.makedirs(INTENT_DIR, exist_ok=True)
    # attribute -> choices it predicts
    attr_choices = defaultdict(list)
    for dim, by_attr in pa.items():
        for at, alleles in by_attr.items():
            for allele, p in alleles.items():
                attr_choices[at].append((dim, allele, p))
    attr_nodes, choice_nodes = [], []
    for dim in sorted(pv):
        alleles = sorted({a for v in pv[dim].values() for a in v})
        for allele in alleles:
            slug = re.sub(r'[^a-z0-9]+', '-', allele.lower()).strip('-')
            nid = f'intent-choice-{dim}-{slug}'.replace(' ', '-')
            choice_nodes.append(nid)
            vert = {v: al.get(allele) for v, al in pv[dim].items()
                    if al.get(allele)}
            attrs = [(at, al[allele]) for at, al in pa.get(dim, {}).items()
                     if allele in al]
            attrs.sort(key=lambda t: -t[1])
            body = [f'# intent-choice: {dim} = {allele}', '',
                    DIM_DOC.get(dim, dim), '',
                    f'Measured over {d["n_sites"]} valid captures '
                    f'(capture_status: ok).', '',
                    '## P(choice | vertical)', '',
                    '| vertical | share |', '|---|---|']
            for v, p in sorted(vert.items(), key=lambda t: -t[1]):
                body.append(f'| {v} | {p:.0%} |')
            body += ['', '## Attributes it accompanies', '',
                     '| brand attribute | P(choice given attribute) |',
                     '|---|---|']
            for at, p in attrs[:8]:
                body.append(f'| {at} | {p:.0%} |')
            body += ['', '## Use', '',
                     'Cite this node when a brief names the attribute and a '
                     'variant picks the choice — or when it does not, and the '
                     'deviation has to be declared.', '']
            fm = ('---\nid: ' + nid + '\ntype: intent-choice\n'
                  f'schema: choice={dim}, allele={allele}\n'
                  'links:\n  index: intent-index\n'
                  '  derives_from: [patterns-index, intent-index]\n'
                  '  used_in: [w1, w2]\n---\n\n')
            open(os.path.join(INTENT_DIR, nid + '.md'), 'w').write(
                fm + '\n'.join(body))
    for at in sorted(attr_choices):
        nid = 'intent-attribute-' + re.sub(r'[^a-z0-9]+', '-',
                                         at.lower()).strip('-')
        attr_nodes.append(nid)
        body = [f'# intent-attribute: {at}', '',
                'Measured from page copy with a closed cue lexicon '
                '(`intent.py` ATTRIBUTES); every site carries the matched '
                'cue as evidence, so an attribute is a quotation, not an '
                'impression.', '',
                '## Choices this attribute predicts', '',
                '| dimension | allele | P(choice given attribute) |',
                '|---|---|---|']
        for dim, allele, p in sorted(attr_choices[at], key=lambda t: -t[2])[:10]:
            body.append(f'| {dim} | {allele} | {p:.0%} |')
        body += ['', '## Use', '',
                 'When a brief claims this attribute, these are the choices '
                 'the corpus pairs with it; a variant that claims it and '
                 'picks the opposite must declare the deviation.', '']
        fm = ('---\nid: ' + nid + '\ntype: intent-attribute\n'
              'links:\n  index: intent-index\n'
              '  derives_from: [intent-index]\n  used_in: [w1, w2]\n---\n\n')
        open(os.path.join(INTENT_DIR, nid + '.md'), 'w').write(
            fm + '\n'.join(body))
    idx = ['---', 'id: intent-index', 'type: index', 'links:',
           '  index: patterns-index',
           '  contains: [' + ', '.join(sorted(attr_nodes + choice_nodes)) + ']',
           '  derives_from: [patterns-index]', '  used_in: [w1, w2]', '---', '',
           '# INTENT INDEX — what a site is trying to be, measured', '',
           f'{d["n_sites"]} valid captures. Two node families:', '',
           '- `intent-attribute-*` — a brand attribute claimed in the copy, '
           'with the cue that proves it and the choices the corpus pairs '
           'with it.',
           '- `intent-choice-*` — a measured design choice, with '
           'P(choice | vertical) and the attributes it accompanies.', '',
           'Generated by `python3 patterns/tools/intent.py graph` from '
           '`data/intent-model.json`. Every number is a conditional '
           'frequency over the corpus; no LLM wrote any of it.', '']
    open(os.path.join(INTENT_DIR, 'INDEX.md'), 'w').write('\n'.join(idx))
    print(f'{len(attr_nodes)} attribute nodes, {len(choice_nodes)} choice '
          f'nodes -> {os.path.relpath(INTENT_DIR, PATTERNS)}')


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest='cmd', required=True)
    t = sub.add_parser('text')
    t.add_argument('--limit', type=int)
    t.add_argument('--refresh', action='store_true')
    t.add_argument('--workers', type=int, default=10)
    t.add_argument('--timeout', type=int, default=12)
    sub.add_parser('extract')
    sub.add_parser('model')
    sub.add_parser('graph')
    sub.add_parser('report')
    a = ap.parse_args()
    {'text': cmd_text, 'extract': cmd_extract, 'model': cmd_model,
     'graph': cmd_graph, 'report': cmd_report}[a.cmd](a)
