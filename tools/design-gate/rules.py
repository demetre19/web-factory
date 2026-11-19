#!/usr/bin/env python3
"""rules.py — look a design rule up, don't re-read the book.

  python3 tools/design-gate/rules.py T.6         # one rule: text + tier + check
  python3 tools/design-gate/rules.py measure     # keyword → matching rule IDs
  python3 tools/design-gate/rules.py w5          # what wave 5 loads and gates on
  python3 tools/design-gate/rules.py pattern-…   # a pattern node (frontmatter)
  python3 tools/design-gate/rules.py section-catalog#split-media
  python3 tools/design-gate/rules.py gene-layout-archetype
  python3 tools/design-gate/rules.py --list      # every rule ID, one line each

Flags: --depth N (follow `## Links` see-also edges, default 0),
       --json (machine output), --checks (wave → check functions only).
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
DESIGN = os.path.join(REPO, 'docs', 'machinery', 'design')
RULES = os.path.join(DESIGN, 'rules')
ENFORCEMENT = os.path.join(DESIGN, 'enforcement.json')

RULE_RE = re.compile(r'^### ((?:[A-Z]{1,3}|PS)\.\d+)\s+(.*)$', re.M)


def load_rules():
    """{id: {title, body, file, links}}"""
    out = {}
    for fn in sorted(os.listdir(RULES)):
        if not fn.endswith('.md'):
            continue
        txt = open(os.path.join(RULES, fn), encoding='utf-8').read()
        heads = list(RULE_RE.finditer(txt))
        for i, m in enumerate(heads):
            end = heads[i + 1].start() if i + 1 < len(heads) else len(txt)
            body = txt[m.end():end]
            body = re.split(r'^## ', body, maxsplit=1, flags=re.M)[0]
            links = re.findall(r'^- ((?:[A-Z]{1,3}|PS)\.\d+) → (.+)$',
                               txt, re.M)
            see = []
            for rid, targets in links:
                if rid == m.group(1):
                    see += [t.strip() for t in targets.split(',')]
            out[m.group(1)] = {'title': m.group(2).strip(), 'body':
                               body.strip(), 'file': 'rules/' + fn,
                               'see_also': see}
    return out


def enforcement():
    try:
        return json.load(open(ENFORCEMENT))
    except Exception:
        return {'rules': {}, 'checks': {}}


def wave_checks():
    sys.path.insert(0, HERE)
    import gate as G
    return {w: [c.__name__ for c in lst] for w, lst in G.WAVE_CHECKS.items()}


def show_rule(rid, rules, enf, depth=0, seen=None):
    seen = seen or set()
    if rid in seen or rid not in rules:
        return
    seen.add(rid)
    r = rules[rid]
    e = enf['rules'].get(rid, {})
    print(f'{rid}  {r["title"]}')
    print(f'  tier: {e.get("tier", "?")}   mode: {e.get("mode", "?")}   '
          f'wave: {e.get("wave", "?")}')
    print(f'  check: {e.get("check") or e.get("item") or e.get("approval") or "—"}'
          f'   FAILs when: {e.get("threshold", "—")}')
    print(f'  file: {r["file"]}')
    print()
    for line in r['body'].split('\n'):
        print('  ' + line if line.strip() else '')
    if r['see_also']:
        print(f'\n  see also: {", ".join(r["see_also"])}')
    if depth:
        for t in r['see_also']:
            print()
            show_rule(t, rules, enf, depth - 1, seen)


def node_lookup(q):
    """Find a frontmatter node (pattern, profile, gene, composition)."""
    if q.startswith('section-catalog#'):
        return None
    for dp, _, fns in os.walk(DESIGN):
        if 'patterns/data' in dp.replace(os.sep, '/'):
            continue
        for fn in fns:
            if not fn.endswith('.md'):
                continue
            p = os.path.join(dp, fn)
            txt = open(p, encoding='utf-8', errors='replace').read()
            if not txt.startswith('---'):
                continue
            fm = txt.split('---', 2)[1]
            m = re.search(r'^id:\s*(\S+)', fm, re.M)
            if m and m.group(1) == q:
                print(f'--- {os.path.relpath(p, REPO)}')
                print(txt.split('---', 2)[1].strip())
                return True
    return False


def _sort_key(rid):
    fam, num = rid.split('.', 1)
    return (fam, int(num) if num.isdigit() else 0)


def main(argv):
    as_json = '--json' in argv
    depth = 0
    if '--depth' in argv:
        i = argv.index('--depth')
        depth = int(argv[i + 1]) if i + 1 < len(argv) else 1
    args = []
    skip = False
    for a in argv:
        if skip:
            skip = False
            continue
        if a == '--depth':
            skip = True
            continue
        if a.startswith('--'):
            continue
        args.append(a)
    rules = load_rules()
    enf = enforcement()
    flags = [a for a in argv if a.startswith('--')]

    if '--checks' in flags:
        wc = wave_checks()
        if as_json:
            print(json.dumps(wc, indent=1))
            return 0
        for w in sorted(wc):
            print(f'{w} — {len(wc[w])} gate checks')
            for c in wc[w]:
                print(f'  {c}')
        return 0

    if '--list' in flags:
        rows = []
        for rid in sorted(rules, key=_sort_key):
            e = enf['rules'].get(rid, {})
            rows.append({'id': rid, 'title': rules[rid]['title'],
                         'tier': e.get('tier'), 'mode': e.get('mode'),
                         'check': e.get('check') or e.get('item')
                         or e.get('approval'), 'wave': e.get('wave'),
                         'file': rules[rid]['file']})
        if as_json:
            print(json.dumps(rows, indent=1))
            return 0
        for r in rows:
            print(f'{r["id"]:7} {str(r["tier"]):10} {str(r["mode"]):9} '
                  f'{r["title"]}')
        return 0

    if not args or args[0] in ('-h', '--help'):
        print(__doc__)
        return 0
    q = args[0]

    if re.match(r'^(?:[A-Z]{1,3}|PS)\.\d+$', q):
        if q not in rules:
            print(f'no rule {q}')
            return 1
        if as_json:
            e = enf['rules'].get(q, {})
            print(json.dumps({'id': q, **rules[q], 'enforcement': e},
                             indent=1))
            return 0
        show_rule(q, rules, enf, depth)
        return 0

    if re.match(r'^w[0-8]$', q):
        wc = wave_checks()
        used = sorted({rid for rid, e in enf['rules'].items()
                       if e.get('wave') == q}, key=_sort_key)
        if as_json:
            print(json.dumps({'wave': q, 'checks': wc.get(q, []),
                              'rules': used}, indent=1))
            return 0
        print(f'{q} — gate checks ({len(wc.get(q, []))}):')
        for c in wc.get(q, []):
            print(f'  {c}')
        print(f'\n{q} — rules gated here ({len(used)}):')
        for rid in used:
            print(f'  {rid:7} {rules.get(rid, {}).get("title", "")}')
        return 0

    if node_lookup(q):
        return 0

    # keyword search over headings + bodies
    hits = []
    low = q.lower()
    for rid, r in rules.items():
        score = (3 if low in r['title'].lower() else 0) + \
                (1 if low in r['body'].lower() else 0)
        if score:
            hits.append((score, rid, r['title']))
    hits.sort(key=lambda h: (-h[0], h[1]))
    if not hits:
        print(f'no rule or node matches "{q}"')
        return 1
    if as_json:
        print(json.dumps([{'id': rid, 'score': sc, 'title': t}
                          for sc, rid, t in hits], indent=1))
        return 0
    print(f'{len(hits)} match(es) for "{q}":')
    for _, rid, title in hits[:20]:
        e = enf['rules'].get(rid, {})
        print(f'  {rid:7} {e.get("tier", "?"):10} {title}')
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main(sys.argv[1:]))
    except BrokenPipeError:          # piped into head/less
        os._exit(0)
