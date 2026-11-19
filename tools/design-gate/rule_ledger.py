#!/usr/bin/env python3
"""rule_ledger.py — the check-by-check ledger for one pipeline dir.

Every gate check registered in gate.WAVE_CHECKS is run against the
directory and reported with the rule ids its docstring declares.
Nothing is summarised away: a check that returns no findings is a
PASS, a check that returns findings lists them verbatim.

Usage:
  rule_ledger.py <pipeline-dir> [--wave w7] [--md ledger.md]
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import gate

RULE = re.compile(r'\b[A-Z][A-Z0-9]{0,3}\.\d+(?:\.\d+)?\b')


def rule_ids(fn):
    doc = (fn.__doc__ or '').strip()
    ids = RULE.findall(doc)
    seen = []
    for i in ids:
        if i not in seen:
            seen.append(i)
    return seen


def title(fn):
    doc = (fn.__doc__ or '').strip()
    first = doc.split('\n')[0].strip() if doc else ''
    # drop the leading "TK —" style prefix
    first = re.sub(r'^[A-Z][A-Z0-9]{0,3}\s+—\s+', '', first)
    return first or fn.__name__


def run(directory, only=None):
    ctx = gate.Ctx(directory)
    rows = []
    for wave in gate.WAVE_SEQ:
        if only and wave != only:
            continue
        for fn in gate.WAVE_CHECKS.get(wave, []):
            ctx.wave = wave          # checks read the current wave
            try:
                findings = fn(ctx) or []
            except Exception as exc:              # a check that throws
                findings = [f'{type(exc).__name__}: {exc}']
            rows.append({
                'wave': wave,
                'check': fn.__name__,
                'rules': rule_ids(fn),
                'title': title(fn),
                'findings': findings,
                'verdict': 'PASS' if not findings else 'FAIL',
            })
    return rows


def md(rows, directory):
    total = len(rows)
    passed = sum(1 for r in rows if r['verdict'] == 'PASS')
    out = [f'# Rule ledger — {directory}', '',
           f'{passed}/{total} checks pass, {total - passed} fail.', '',
           '| wave | rules | check | verdict |',
           '|---|---|---|---|']
    for r in rows:
        rules = ', '.join(r['rules']) or '—'
        out.append(f"| {r['wave']} | {rules} | `{r['check']}` — {r['title']}"
                   f" | {r['verdict']} |")
    fails = [r for r in rows if r['verdict'] == 'FAIL']
    if fails:
        out += ['', '## Findings', '']
        for r in fails:
            out.append(f"### {r['wave']} `{r['check']}` "
                       f"({', '.join(r['rules']) or '—'})")
            out.append('')
            for f in r['findings']:
                out.append(f'- {f}')
            out.append('')
    return '\n'.join(out) + '\n'


def main(argv):
    args = [a for a in argv[1:] if not a.startswith('--')]
    if not args:
        print(__doc__.strip())
        return 2
    only = None
    if '--wave' in argv:
        only = argv[argv.index('--wave') + 1]
    rows = run(args[0], only)
    text = md(rows, args[0])
    if '--md' in argv:
        path = argv[argv.index('--md') + 1]
        open(path, 'w', encoding='utf-8').write(text)
        print(f'ledger → {path}')
    else:
        sys.stdout.write(text)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
