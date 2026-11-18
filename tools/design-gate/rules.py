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

RULE_RE = re.compile(r'^### ((?:[A-Z]{1,2}|PS)\.\d+)\s+(.*)$', re.M)


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
            links = re.findall(r'^- ((?:[A-Z]{1,2}|PS)\.\d+) → (.+)$',
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


def main(argv):
    args = [a for a in argv if not a.startswith('--')]
    depth = 0
    if '--depth' in argv:
        i = argv.index('--depth')
        depth = int(argv[i + 1]) if i + 1 < len(argv) else 1
        args = [a for a in args if a != str(depth)]
    if not args or args[0] in ('-h', '--help'):
        print(__doc__)
        return 0
    q = args[0]
    rules = load_rules()
    enf = enforcement()

    if q == '--list':
        for rid in sorted(rules, key=lambda r: (r.split('.')[0],
                                               int(r.split('.')[1]))):
            e = enf['rules'].get(rid, {})
            print(f'{rid:7} {e.get("tier", "?"):10} '
                  f'{e.get("mode", "?"):9} {rules[rid]["title"]}')
        return 0

    if re.match(r'^(?:[A-Z]{1,2}|PS)\.\d+$', q):
        if q not in rules:
            print(f'no rule {q}')
            return 1
        show_rule(q, rules, enf, depth)
        return 0

    if re.match(r'^w[0-8]$', q):
        wc = wave_checks()
        print(f'{q} — gate checks ({len(wc.get(q, []))}):')
        for c in wc.get(q, []):
            print(f'  {c}')
        used = sorted({rid for rid, e in enf['rules'].items()
                       if e.get('wave') == q})
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
    print(f'{len(hits)} match(es) for "{q}":')
    for _, rid, title in hits[:20]:
        e = enf['rules'].get(rid, {})
        print(f'  {rid:7} {e.get("tier", "?"):10} {title}')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
