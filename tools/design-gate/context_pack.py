#!/usr/bin/env python3
"""context_pack — bounded per-step context packets (P.19).

Every pipeline step runs on a bounded pack, never the full machinery:
the step's CARD, only the enforcement rules whose wave <= the step's
wave AND whose rule files the CARD names, the DNA decision surface,
the section profile, that section's skeleton payload, its STUB copy
rows, and only the canon refs it cites. NOTHING else.

Budgets (~4 chars/token): layout-round 250K; wireframe / chop /
per-section-build / per-component 100K. `check_context_budget`
(gate.py) FAILs a step whose pack exceeds its class budget; the
actual token count is recorded on the wave receipt.
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
DESIGN_DIR = os.path.join(REPO, 'docs', 'machinery', 'design')
ENFORCEMENT = os.path.join(DESIGN_DIR, 'enforcement.json')
RULES_DIR = os.path.join(DESIGN_DIR, 'rules')
SKEL_ROOT = os.path.join(REPO, 'templates', 'skeletons')
CHARS_PER_TOKEN = 4

STEP_BUDGETS = {
    'layout-round': 250_000,          # creative round — big-model class
    'wireframe': 100_000,
    'chop': 100_000,
    'per-section-build': 100_000,
    'per-component': 100_000,
}

# wave -> step class (the CARD each wave's model consumes)
WAVE_STEP = {
    'w0': 'chop',
    'w1': 'chop',
    'w2': 'chop',
    'w3': 'layout-round',     # layout picker rounds — creative
    'w4': 'layout-round',     # look rounds — creative
    'w5': 'per-section-build',
    'w6': 'per-component',
    'w7': 'per-section-build',
    'w8': 'chop',             # adversarial review reads the pack too
}
WAVE_SEQ = ['w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8']

_RULE_ID = re.compile(r'\b((?:[A-Z]{1,3}|PS)\.\d+)\b')
_RULE_FILE = re.compile(r'rules/([A-Z]{1,3}|PS)\.md')


def _wave_num(w):
    return int(w[1:]) if w and w[0] == 'w' and w[1:].isdigit() else 99


def step_class(step):
    """step name or wave -> step class."""
    base = str(step or '').split(':', 1)[0]
    if base in STEP_BUDGETS:
        return base
    return WAVE_STEP.get(base, 'per-section-build')


def budget_for(step):
    return STEP_BUDGETS[step_class(step)]


def _card(wave):
    d = os.path.join(DESIGN_DIR, f'stage-{wave}-*')
    import glob as _g
    for p in sorted(_g.glob(d)):
        cp = os.path.join(p, 'CARD.md')
        if os.path.isfile(cp):
            return cp, open(cp, encoding='utf-8',
                          errors='replace').read()
    return None, ''


def _card_rule_files(card_text):
    """Rule file prefixes the CARD names (the load list)."""
    prefs = set(_RULE_FILE.findall(card_text))
    # a CARD may name ids inline without the file row — keep those too
    prefs |= {m.group(1) for m in re.finditer(
        r'\b((?:[A-Z]{1,3}|PS))\.\d+', card_text)}
    return prefs


def _rule_subset(wave, card_text):
    """Rule rows for ids whose enforcement wave <= wave AND whose rule
    file the CARD names — never the full enforcement.json."""
    try:
        rules = json.load(open(ENFORCEMENT))['rules']
    except Exception:
        return '', []
    prefs = _card_rule_files(card_text)
    wn = _wave_num(wave)
    lines, ids = [], []
    for rid, e in sorted(rules.items()):
        if _wave_num(str(e.get('wave', 'w9'))) > wn:
            continue
        if rid.split('.')[0] not in prefs:
            continue
        ids.append(rid)
        lines.append(
            f"- `{rid}` [{e.get('tier')}/{e.get('mode')}] "
            f"{e.get('check') or e.get('item') or '—'}: "
            f"{str(e.get('threshold', ''))[:160]}")
    return '\n'.join(lines), ids


def _dna_subset(pdir):
    """The decision surface only — never variants, history, provenance
    audit columns or hash bookkeeping."""
    try:
        d = json.load(open(os.path.join(pdir, 'DNA.json')))
    except Exception:
        return ''
    keep = ('knobs', 'genotype', 'modes', 'rhythm', 'vector_targets',
            'invariants', 'constraints', 'style_licences')
    sub = {k: d[k] for k in keep if d.get(k) not in (None, '', [], {})}
    return json.dumps(sub, indent=1, sort_keys=True)


def _plan_rows(pdir):
    try:
        import sys
        if HERE not in sys.path:
            sys.path.insert(0, HERE)
        import gate as _g
        ctx = _g.Ctx(pdir)
        return [(s, r) for s, r in ctx.rows()]
    except Exception:
        return []


def _section_profile(pdir, section):
    rows = _plan_rows(pdir)
    if section:
        rows = [(s, r) for s, r in rows
                if s == section or str(r.get('name')) == section]
    if not rows:
        return ''
    out = []
    for slug, r in rows:
        keep = {k: v for k, v in r.items()
                if k in ('name', 'composition', 'intent', 'speech_act',
                         'surface', 'density', 'emphasis', 'align',
                         'stack', 'collapse', 'media_ratio',
                         'disclosure', 'skeleton', 'vector', 'refs',
                         'group', 'wf_ref')}
        out.append(f'{slug}: {json.dumps(keep, sort_keys=True)}')
    return '\n'.join(out)


def _find_skeleton(harvest_id):
    """Resolve brixies/<cat>/<block> or hyperui/... ids to a payload."""
    for dp, _, fns in os.walk(SKEL_ROOT) if os.path.isdir(SKEL_ROOT) \
            else []:
        rel = os.path.relpath(dp, SKEL_ROOT)
        for fn in fns:
            if not fn.endswith('.json'):
                continue
            stem = os.path.splitext(fn)[0]
            cand = f"{rel.replace(os.sep, '/')}/{stem}"
            if cand == harvest_id or cand.endswith('/' + harvest_id):
                return os.path.join(dp, fn)
            try:
                v = json.load(open(os.path.join(dp, fn)))
            except Exception:
                continue
            if isinstance(v, list):
                v = v[0] if v else {}
            if isinstance(v, dict) and v.get('id') == harvest_id:
                return os.path.join(dp, fn)
    return None


def _section_skeleton(pdir, section):
    rows = _plan_rows(pdir)
    ids = []
    for _, r in rows:
        sk = r.get('skeleton')
        if sk and (not section or str(r.get('name')) == section):
            ids.append(str(sk))
    out = []
    for sk in ids:
        fp = _find_skeleton(sk)
        if fp:
            txt = open(fp, encoding='utf-8',
                       errors='replace').read()
            out.append(txt[:8000])   # one payload, capped
    return '\n'.join(out)


def _section_copy(pdir, section):
    stub = os.path.join(pdir, 'STUB.md')
    if not os.path.isfile(stub):
        return ''
    txt = open(stub, encoding='utf-8', errors='replace').read()
    if not section:
        return txt
    lines = [ln for ln in txt.split('\n')
             if section.lower() in ln.lower() or ln.startswith('#')]
    return '\n'.join(lines) or txt


def _canon_refs(pdir, section):
    mr = os.path.join(pdir, 'MOBBIN-REFS.md')
    txt = open(mr, encoding='utf-8', errors='replace').read() \
        if os.path.isfile(mr) else ''
    if section:
        rows = _plan_rows(pdir)
        cited = set()
        for _, r in rows:
            if str(r.get('name')) == section:
                cited |= {str(x) for x in (r.get('refs') or [])}
        if cited:
            keep = [ln for ln in txt.split('\n')
                    if any(c in ln for c in cited)]
            txt = '\n'.join(keep)
    return txt


def assemble_pack(pdir, step, section=None):
    """The bounded context packet for one step.

    Returns {step_class, budget, tokens, chars, parts, text}. `text`
    is the packet a small model consumes; `tokens` is chars/4.
    """
    cls = step_class(step)
    wave = step if str(step) in WAVE_STEP else \
        next((w for w, c in WAVE_STEP.items() if c == cls), 'w5')
    card_path, card_text = _card(wave)
    rules_text, rule_ids = _rule_subset(wave, card_text)
    parts = {
        'card': card_text,
        'rules': rules_text,
        'dna': _dna_subset(pdir),
        'section_profile': _section_profile(pdir, section),
        'skeleton': _section_skeleton(pdir, section),
        'copy': _section_copy(pdir, section),
        'canon_refs': _canon_refs(pdir, section),
    }
    text = '\n\n'.join(
        f'## {k}\n{v}' for k, v in parts.items() if v)
    chars = len(text)
    return {
        'step_class': cls, 'wave': wave, 'section': section,
        'budget': STEP_BUDGETS[cls],
        'rule_ids': rule_ids,
        'chars': chars,
        'tokens': chars // CHARS_PER_TOKEN,
        'parts': {k: len(v) for k, v in parts.items()},
        'card': card_path,
        'text': text,
    }


def main(argv):
    import sys
    pdir, step, section = argv[1], argv[2], \
        (argv[3] if len(argv) > 3 else None)
    pack = assemble_pack(pdir, step, section)
    over = pack['tokens'] > pack['budget']
    print(f"pack {pack['step_class']} wave {pack['wave']}: "
          f"{pack['tokens']:,} tokens (budget "
          f"{pack['budget']:,}) — rules {len(pack['rule_ids'])}, "
          f"parts {pack['parts']}")
    if over:
        print('  OVER BUDGET — shrink the pack, never the rule')
        return 1
    return 0


if __name__ == '__main__':
    import sys
    sys.exit(main(sys.argv))
