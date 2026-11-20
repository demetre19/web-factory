#!/usr/bin/env python3
"""copy_ingest.py — w0 producer: the SEO plan + copy → COPY.json.

Resolves the page dir to its site folder (site_folder.py), follows the
site BRIEF.yaml page entry to the blueprint STUB (the SEO plan: heading
vector, per-section semantic map, internal links OUT) and the ARTICLE
(the copy), and writes COPY.json — every block of the article verbatim,
keyed to the stub's vector, with source sha256s so any later drift is
detectable (I.1).

Deterministic, stdlib only, no model calls. Parsing rules per H2:
  answer  first paragraph after the H2
  before  paragraphs between the answer and the first list
  items   `- **Term** – text` list rows (term/text split on the dash)
  qa      `- **Question?** answer` rows (term ends with '?')
  links   `- The [anchor](href) …` rows and inline links anywhere
  after   paragraphs after the list
Text keeps its inline markdown (**bold**, [a](href)) verbatim.

  python3 copy_ingest.py <pipeline-dir>
"""
import hashlib
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


sys.path.insert(0, HERE)
import site_folder as SF  # noqa: E402
sha = SF.sha


LINK = re.compile(r'\[([^\]]+)\]\(([^)]+)\)')
# term/keyword → lucide icon stem (curated to the ICONS table in
# templates/sections/_shared/inline.ts). Deterministic: same term,
# same icon — I.1 byte-verifies. First hit wins.
ICON_FOR = [
    ('insur', 'shield-check'), ('bond', 'shield'),
    ('audit', 'clipboard-check'), ('inspect', 'clipboard-check'),
    ('report', 'file-text'), ('log', 'file-text'),
    ('certif', 'award'), ('award', 'award'), ('badge', 'badge-check'),
    ('staff', 'users'), ('team', 'users'), ('people', 'users'),
    ('resident', 'users'), ('tenant', 'users'), ('family', 'users'),
    ('assignment', 'users'), ('supervisor', 'users'), ('crew', 'users'),
    ('clean', 'sparkles'), ('sanitis', 'spraycan'), ('sanitiz', 'spraycan'),
    ('disinfect', 'spraycan'), ('mop', 'broom'), ('broom', 'broom'),
    ('dust', 'wand'), ('vacuum', 'broom'),
    ('school', 'graduation-cap'), ('education', 'graduation-cap'),
    ('classroom', 'graduation-cap'), ('child', 'graduation-cap'),
    ('time', 'clock'), ('hour', 'clock'), ('schedule', 'clock'),
    ('roster', 'clock'), ('shift', 'clock'), ('daily', 'calendar'),
    ('weekly', 'calendar'), ('monthly', 'calendar'), ('calendar', 'calendar'),
    ('book', 'calendar'), ('visit', 'calendar'),
    ('contract', 'file-text'), ('agreement', 'file-text'),
    ('scope', 'clipboard-list'), ('checklist', 'clipboard-list'),
    ('list', 'clipboard-list'), ('task', 'clipboard-list'),
    ('duty', 'clipboard-list'), ('duties', 'clipboard-list'),
    ('step', 'clipboard-list'), ('process', 'clipboard-list'),
    ('floor', 'building'), ('building', 'building'),
    ('office', 'building'), ('site', 'building'), ('venue', 'building'),
    ('strata', 'building'), ('area', 'map'), ('zone', 'map'),
    ('map', 'map'), ('location', 'map-pin'), ('place', 'map-pin'),
    ('safety', 'shield'), ('safe', 'shield'), ('hazard', 'shield'),
    ('risk', 'shield'), ('health', 'heart'), ('care', 'heart'),
    ('amenit', 'building'), ('carpark', 'map-pin'), ('car park', 'map-pin'),
    ('foyer', 'map-pin'), ('lobby', 'map-pin'), ('lift', 'building'),
    ('bin', 'building'), ('store', 'building'), ('storage', 'building'),
    ('standard', 'badge-check'), ('quality', 'star'),
    ('review', 'star'), ('rating', 'star'), ('testimonial', 'quote'),
    ('phone', 'phone'), ('call', 'phone'), ('contact', 'phone'),
    ('green', 'sun'), ('eco', 'sun'), ('environment', 'sun'),
]


def _icon(term, text):
    hay = (term + ' ' + text).lower()
    for kw, icon in ICON_FOR:
        if kw in hay:
            return icon
    return None


ITEM = re.compile(r'^- \*\*(.+?)\*\*\s*(?:[–—-]\s*)?(.*)$')


def parse_stub(text):
    vec, sem, links = [], {}, []
    meta = {}
    for m in re.finditer(r'^\| \*\*(.+?)\*\*:? \| (.*?) \|$', text, re.M):
        meta[m.group(1).rstrip(':').strip()] = m.group(2).strip()
    sec = re.search(r'^## Heading vector\n(.*?)(?=^## )', text, re.M | re.S)
    for ln in (sec.group(1) if sec else '').splitlines():
        cells = [c.strip() for c in ln.strip().strip('|').split('|')]
        if len(cells) < 3 or cells[0] in ('Zone', '---') or \
                set(cells[0]) <= {'-'}:
            continue
        zone, head, fs = cells[0], cells[1], cells[2]
        m = re.match(r'H2 (.+)$', head)
        if m:
            vec.append({'zone': zone, 'h2': m.group(1).strip(),
                        'fs': fs.strip('"').removeprefix('FS: ').strip('"'),
                        'link_slot': cells[3] if len(cells) > 3 else ''})
    for m in re.finditer(r'^### H2 (.+?)\n(.*?)(?=^### |^## |\Z)', text,
                         re.M | re.S):
        body = m.group(2)
        at = re.search(r'\*\*Answer type:\*\* (.+?) · \*\*Evidence', body)
        terms = re.search(r'\*\*Terms:\*\* (.+)', body)
        sem[m.group(1).strip()] = {
            'answer_type': at.group(1).strip() if at else '',
            'terms': re.findall(r'`([^`]+)`', terms.group(1)) if terms
            else []}
    lo = re.search(r'^## Internal links OUT\n(.*?)(?=^\*\*|^## |\Z)', text,
                   re.M | re.S)
    for ln in (lo.group(1) if lo else '').splitlines():
        cells = [c.strip() for c in ln.strip().strip('|').split('|')]
        if len(cells) >= 2 and cells[0].startswith('/'):
            links.append({'href': cells[0], 'anchor': cells[1],
                          'zone': cells[2] if len(cells) > 2 else ''})
    order = re.search(r'\*\*Vector check:\*\* (.+)', text)
    return meta, vec, sem, links, (order.group(1).strip() if order else '')


def _paras(chunk):
    """Split a markdown chunk into ('p', text) / ('li', text) units."""
    out, buf = [], []
    for ln in chunk.splitlines():
        s = ln.rstrip()
        if not s.strip():
            if buf:
                out.append(('p', ' '.join(buf)))
                buf = []
            continue
        num = re.match(r'^\d+[.)] ', s)
        if s.startswith('- ') or num:
            if buf:
                out.append(('p', ' '.join(buf)))
                buf = []
            # ordered rows are normalised to '- ' and flagged
            out.append(('oli' if num else 'li',
                        '- ' + s[num.end():] if num else s))
            continue
        buf.append(s.strip())
    if buf:
        out.append(('p', ' '.join(buf)))
    return out


def parse_article(text):
    fm = {}
    m = re.match(r'^---\n(.*?)\n---\n', text, re.S)
    body = text
    if m:
        for ln in m.group(1).splitlines():
            k, _, v = ln.partition(':')
            fm[k.strip()] = v.strip().strip('"')
        body = text[m.end():]
    # trailing machine footer: after the last '---' rule
    body = re.split(r'^---\s*$', body, flags=re.M)[0]
    h1 = re.search(r'^# (.+)$', body, re.M)
    parts = re.split(r'^## (.+)$', body, flags=re.M)
    lede_units = _paras(re.sub(r'^# .+$', '', parts[0], flags=re.M))
    blocks = []
    for i in range(1, len(parts), 2):
        blocks.append((parts[i].strip(), _paras(parts[i + 1])))
    return fm, (h1.group(1).strip() if h1 else ''), lede_units, blocks


def build_block(bid, h2, units, vec_row, sem_row):
    b = {'id': bid, 'h2': h2,
         'zone': (vec_row or {}).get('zone', ''),
         'stub_fs': (vec_row or {}).get('fs', ''),
         'answer_type': (sem_row or {}).get('answer_type', ''),
         'terms': (sem_row or {}).get('terms', []),
         'answer': '', 'before': [], 'items': [], 'qa': [], 'links': [],
         'after': [], 'list_ordered': False}
    seen_list = False
    for kind, txt in units:
        if kind in ('li', 'oli'):
            seen_list = True
            if kind == 'oli':
                b['list_ordered'] = True
            row = txt[2:].strip()
            m = ITEM.match(txt)
            lk = LINK.findall(row)
            if m and m.group(1).rstrip().endswith('?'):
                b['qa'].append({'q': m.group(1).strip(),
                                'a': m.group(2).strip()})
            elif m:
                _term, _txt = m.group(1).strip(), m.group(2).strip()
                _it = {'term': _term, 'text': _txt}
                _ic = _icon(_term, _txt)
                if _ic:
                    _it['icon'] = _ic
                b['items'].append(_it)
            elif lk:
                b['links'].append({'text': row, 'anchor': lk[0][0],
                                   'href': lk[0][1]})
            else:
                _it = {'term': '', 'text': row}
                _ic = _icon('', row)
                if _ic:
                    _it['icon'] = _ic
                b['items'].append(_it)
            continue
        if not b['answer'] and not seen_list:
            b['answer'] = txt
        elif not seen_list:
            b['before'].append(txt)
        else:
            b['after'].append(txt)
    return b


def ingest(pdir):
    stub_p, art_p = SF.sources(pdir)
    for p in (stub_p, art_p):
        if not os.path.isfile(p):
            raise SystemExit(f'copy_ingest: source missing: {p}')
    with open(stub_p, encoding='utf-8') as fh:
        stub = fh.read()
    with open(art_p, encoding='utf-8') as fh:
        art = fh.read()
    meta, vec, sem, links_out, order = parse_stub(stub)
    fm, h1, lede_units, raw_blocks = parse_article(art)
    vec_by = {v['h2']: v for v in vec}
    blocks, closing = [], None
    for n, (h2, units) in enumerate(raw_blocks, 1):
        b = build_block(f'b{n:02d}', h2, units, vec_by.get(h2),
                        sem.get(h2))
        blocks.append(b)
    # the closing paragraph of the FAQ block carries the page's act:
    # an inline link to /contact/ + the phone — it becomes end-act copy
    if blocks and blocks[-1]['after']:
        last = blocks[-1]['after'][-1]
        lk = LINK.findall(last)
        if lk:
            closing = {'text': blocks[-1]['after'].pop(),
                       'cta': {'label': lk[0][0], 'href': lk[0][1]}}
            ph = re.search(r'\+\d[\d ]{7,}\d', closing['text'])
            if ph:
                closing['phone'] = ph.group(0)
    rec = {
        'generated_by': 'copy_ingest.py',
        'source': {'stub': {'path': stub_p, 'sha256': sha(stub_p)},
                   'article': {'path': art_p, 'sha256': sha(art_p)}},
        'url': fm.get('url') or meta.get('URL', '').strip('`'),
        'title': fm.get('title') or meta.get('Title tag', ''),
        'meta': fm.get('meta') or meta.get('Meta', ''),
        'h1': h1 or meta.get('H1', ''),
        'stub_h1': meta.get('H1', ''),
        'answer_datatype': meta.get('Answer datatype', ''),
        'lede': ' '.join(t for k, t in lede_units if k == 'p'),
        'vector_order': order,
        'stub_vector': vec,
        'blocks': blocks,
        'closing': closing,
        'links_out': links_out,
    }
    out = os.path.join(pdir, 'COPY.json')
    with open(out, 'w', encoding='utf-8') as fh:
        json.dump(rec, fh, indent=1, ensure_ascii=False)
        fh.write('\n')
    return rec


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    rec = ingest(os.path.abspath(sys.argv[1]))
    print(f"COPY.json: h1={rec['h1']!r} blocks={len(rec['blocks'])} "
          f"links_out={len(rec['links_out'])} "
          f"closing={'yes' if rec['closing'] else 'no'}")
    return 0


if __name__ == '__main__':
    sys.exit(main())
