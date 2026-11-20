#!/usr/bin/env python3
"""dna_apply.py — the ONLY sanctioned DNA/TOKENS/plan-hex mutation.

DNA is the single source of truth: this tool edits it surgically,
recomputes dna_slices hashes, re-derives TOKENS.json (its shadow),
and syncs the plan's colour.roles hexes so every artefact stays
consistent. Never hand-edit DNA.json/TOKENS.json/GATES.json.

  dna_apply.py <dir> --set path.to.key=value ...
  dna_apply.py <dir> --set modes.light.surface=#EDF2F0
                   --set knobs.color.surface_contrast=0.08
  dna_apply.py <dir> --rhythm end-act:surface=brand
  dna_apply.py <dir> --rhythm-add 2:clients:muted:compact
  dna_apply.py <dir> --rhythm-rm clients --rhythm-add 1:clients:base:compact
                   (ops apply in argv order — rm then add = move)
  dna_apply.py <dir> --genotype layout-archetype=split-media
  dna_apply.py <dir> --show

Paths: dotted keys into DNA.json; `[i]` indexes lists.
Values: bare strings stay strings; json.loads tried first (0.08 →
float, "brand" → str). The plan sync covers modes.<mode>.<role> sets —
DESIGN-PLAN.md color.roles.<role> {value: "#hex"} lines are rewritten
to match so C.* provenance stays clean.
"""
import json
import re
import sys

HERE = __import__('os').path.dirname(__import__('os').path.abspath(__file__))
sys.path.insert(0, HERE)
import gate          # noqa: E402
import emit_global   # noqa: E402


def _set(obj, path, val):
    keys = re.findall(r'[^.\[\]]+|\[\d+\]', path)
    cur = obj
    for k in keys[:-1]:
        cur = cur[int(k[1:-1])] if k.startswith('[') else cur[k]
    last = keys[-1]
    if last.startswith('['):
        cur[int(last[1:-1])] = val
    else:
        cur[last] = val


def _parse(s):
    try:
        return json.loads(s)
    except Exception:
        return s


def _sync_plan_roles(ctx, dna):
    """modes.<mode>.<role> edits rewrite the plan's color.roles values —
    the plan mirrors DNA, never forks it."""
    light = (dna.get('modes') or {}).get('light') or {}
    p = __import__('os').path.join(ctx.dir, 'DESIGN-PLAN.md')
    if not __import__('os').path.isfile(p):
        return 0
    txt = open(p).read()
    n = 0
    for role, hexv in light.items():
        new = re.sub(
            rf'({re.escape(role)}:\s*\{{value:\s*")#[0-9a-fA-F]{{3,8}}',
            rf'\g<1>{hexv}', txt)
        if new != txt:
            txt, n = new, n + 1
    open(p, 'w').write(txt)
    return n


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2
    ctx = gate.Ctx(argv[1])
    dp = __import__('os').path.join(ctx.dir, 'DNA.json')
    if not __import__('os').path.isfile(dp):
        print('dna_apply: DNA.json missing — dna_tokens.py derives it')
        return 1
    dna = json.load(open(dp))
    if '--show' in argv:
        print(json.dumps({'hashes': dna.get('hashes')}, indent=1))
        return 0
    changed = []
    for i, a in enumerate(argv):
        if a == '--set' and i + 1 < len(argv):
            kv = argv[i + 1].split('=', 1)
            _set(dna, kv[0], _parse(kv[1]))
            changed.append(kv[0])
        elif a == '--set-json' and i + 1 < len(argv):
            kv = argv[i + 1].split('=', 1)
            _set(dna, kv[0], json.loads(kv[1]))
            changed.append(kv[0])
        elif a == '--genotype' and i + 1 < len(argv):
            kv = argv[i + 1].split('=', 1)
            (dna.setdefault('genotype', {}))[kv[0]] = kv[1]
            changed.append('genotype.' + kv[0])
        elif a == '--rhythm' and i + 1 < len(argv):
            m = re.match(r'([\w-]+):(\w+)=(.*)', argv[i + 1])
            if m:
                sec, key, val = m.groups()
                for e in dna.get('rhythm') or []:
                    if e.get('section') == sec:
                        e[key] = _parse(val)
                        changed.append(f'rhythm.{sec}.{key}')
        elif a == '--rhythm-rm' and i + 1 < len(argv):
            sec = argv[i + 1]
            rh = dna.get('rhythm') or []
            dna['rhythm'] = [e for e in rh if e.get('section') != sec]
            if len(dna['rhythm']) != len(rh):
                changed.append(f'rhythm-.{sec}')
        elif a == '--rhythm-add' and i + 1 < len(argv):
            m = re.match(r'(\d+):([\w-]+):(\w+):(\w+)', argv[i + 1])
            if m:
                pos, sec, surf, dens = m.groups()
                rh = dna.setdefault('rhythm', [])
                e = {'section': sec, 'surface': surf, 'density': dens}
                rh.insert(min(int(pos), len(rh)), e)
                changed.append(f'rhythm+.{sec}')
    if not changed:
        print('dna_apply: nothing to set')
        return 2
    dna['hashes'] = gate.dna_slices(dna)
    with open(dp, 'w') as fh:
        json.dump(dna, fh, indent=1)
    # TOKENS + plan hexes are shadows — re-derive, never drift
    rec = emit_global.tokens_json(dna)
    with open(__import__('os').path.join(ctx.dir, 'TOKENS.json'), 'w') as fh:
        json.dump(rec, fh, indent=1)
    nplan = _sync_plan_roles(ctx, dna)
    print(f'dna_apply: {", ".join(changed)} → '
          f'core {dna["hashes"].get("core")} · '
          f'TOKENS re-derived · plan roles synced ({nplan})')
    print('  downstream: approvals keyed to the old hash are stale — '
          're-run the chain (pipeline.py --from w1)')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
