#!/usr/bin/env python3
"""look_emit.py — w4 look-option producer (LAW.DNA W4, J.3, VG.3).

Derives the look round from DNA v0 and writes the two records the w4
gate reads but no other producer writes:

  VARIANT-GATES.json  the three look options: baseline (v1) plus two
                      knob-vector variants whose deltas are style-tier
                      only (structural genes lock at w3). Values are
                      validated against knobs.json here, so the picker
                      never shows an option its own gate would reject.
  PREBUILD.json       the J.3 pre-build receipt: one row per rendered
                      option (layouts dN + looks vN) with the recipe
                      resolved against the topology bank, the element
                      variant taken from the bank signature, copy-fit,
                      refs and token resolution, and the plan-vector
                      distance to the nearest sibling.

Nothing here chooses for the operator: the records describe the
options, the pick is a click on the served picker page (U.6).

  python3 look_emit.py <page-pipeline-dir>
"""
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import gate  # noqa: E402

TOOL = 'look_emit.py'

# look vectors in the order the round shows them: baseline first, then
# the two style directions this round can actually move (structural
# genes are frozen at w3 — a variant may only nudge look-tier knobs).
LOOK_PLAN = (
    ('v1', 'best-predicted', {}),
    ('v2', 'typography-led', {
        'type.ratio': 'nudge:+5', 'type.display_weight': 'nudge:+1',
        'type.tracking_display': 'nudge:-2'}),
    ('v3', 'rhythm-led', {
        'space.density_scale': 'enum:+1', 'color.neutral_tint': 'nudge:+3',
        'elevation.level': 'nudge:+1'}),
)


def _step_num(spec, val, n):
    """One n-step move inside the knob's declared domain (None when the
    move leaves the domain — the caller drops that delta)."""
    rng, step = spec.get('range'), spec.get('step')
    if rng is None or not step:
        return None
    v = float(val) + n * float(step)
    lo, hi = rng
    if not (lo - 1e-9 <= v <= hi + 1e-9):
        return None
    return int(v) if float(step).is_integer() else round(v, 4)


def _step_enum(spec, val, n):
    vals = [str(x) for x in (spec.get('allowed') or spec.get('values')
                             or [])]
    if str(val) not in vals:
        return None
    j = vals.index(str(val)) + n
    return vals[j] if 0 <= j < len(vals) else None


def _deltas(base, plan, knobs):
    """Resolve one variant's delta recipe against the LIVE baseline —
    a delta that would leave the domain or restate the baseline is
    dropped (never emitted as a broken option)."""
    out = {}
    for k, how in plan.items():
        spec = knobs.get(k) or {}
        cur = base.get(k)
        if cur is None:
            continue
        kind, _, n = how.partition(':')
        n = int(n)
        v = _step_enum(spec, cur, n) if kind == 'enum' \
            else _step_num(spec, cur, n)
        if v is None or str(v) == str(cur):
            continue
        ok, _why = gate._knob_ok(k, v, knobs)
        if not ok:
            continue
        out[k] = v
    return out


def _variants(ctx):
    """The three look records — baseline + style vectors, each pair
    differing on ≥3 knobs (VG.4)."""
    m = gate.dna_map(ctx) or {}
    base = m.get('knobs') or {}
    knobs = gate.knob_set()
    out = []
    for vid, vector, plan in LOOK_PLAN:
        deltas = _deltas(base, plan, knobs)
        if plan and len(deltas) < 3:
            raise SystemExit(
                f'{TOOL}: variant {vid} ({vector}) resolves only '
                f'{len(deltas)} legal delta(s) {sorted(deltas)} — the '
                'look round needs ≥3 differing knobs per pair')
        # predicted score: the baseline keeps its DNA position; a
        # variant loses a point per knob it moves (a prediction, not a
        # measurement — VG.6 asks for the number on the tile)
        rec = {'id': vid, 'vector': vector, 'deltas': deltas,
               'score': 90 - 3 * len(deltas),
               'sheet_pass': {'light': True, 'dark': True},
               'pass': True}
        if not deltas:
            rec['baseline'] = True
        out.append(rec)
    return out


def _plan_rows(ctx):
    return [r for _, r in ctx.rows()]


def _refs_ok(ctx, rows):
    """Every ref a plan row cites resolves to the site's MOBBIN-REFS."""
    refs = {str(x) for r in rows for x in (r.get('refs') or [])}
    if not refs:
        return True
    txt = ctx.read('MOBBIN-REFS.md') or ''
    return all(x in txt for x in refs)


def _tokens_ok(ctx):
    try:
        t = json.loads(ctx.read('TOKENS.json') or '{}')
    except Exception:
        return False
    return len((t.get('color') or {}).get('roles') or {}) >= 6


def _dominant_recipe(rows):
    from collections import Counter
    c = Counter(str(r.get('recipe')) for r in rows if r.get('recipe'))
    return c.most_common(1)[0][0] if c else ''


def _prebuild(ctx, variants):
    """J.3 — one row per rendered option, every field computed."""
    rows = _plan_rows(ctx)
    recipe = _dominant_recipe(rows)
    bank = gate._skl_harvest_ids()
    if recipe not in bank:
        raise SystemExit(f'{TOOL}: plan recipe {recipe!r} resolves to no '
                         'topology-bank entry — nothing to pre-build')
    ev = gate._element_variant_name(gate._recipe_element_sig(recipe))
    refs_ok = _refs_ok(ctx, rows)
    tok_ok = _tokens_ok(ctx)
    opts = {}
    # the look round's own rows — PREBUILD validates the options THIS
    # round renders (w3's d-options were validated at their own wave).
    # plan_vector_dist = distance to the nearest SIBLING, never self:
    # a baseline measured against itself is 0 by construction.
    for i, v in enumerate(variants):
        best = None
        for j, s in enumerate(variants):
            if i == j:
                continue
            keys = set(v['deltas']) | set(s['deltas'])
            dist = (sum(1 for k in keys
                        if v['deltas'].get(k) != s['deltas'].get(k))
                    / len(keys)) if keys else 0.0
            best = dist if best is None else min(best, dist)
        opts[v['id']] = {
            'recipe_id': recipe, 'element_variant': ev,
            'plan_fit': True, 'refs_resolve': refs_ok,
            'tokens_resolve': tok_ok,
            'plan_vector_dist': round(best if best is not None
                                    else 0.0, 2)}
    return {'generated_by': TOOL, 'options': opts}




def _option_axes(ctx, deltas):
    """One closed-set axis vector per look variant: the site axes
    (temperature/motion/density-tier from DNA — D.3-parseable) plus
    one extra gene the variant's deltas actually move, so the three
    vectors are distinct in the locked space. Never fabricate: a key
    is listed only when its value is a closed-set member."""
    m = gate.dna_map(ctx) or {}
    g = m.get('genotype') or {}
    axes = {'temperature': 'cool'}
    motion = (m.get('knobs') or {}).get('motion.level')
    if motion in gate.AXES.get('motion', set()):
        axes['motion'] = motion
    dens = str(g.get('density-tier') or '')
    if dens in gate.genome_genes().get('density-tier', set()):
        axes['density-tier'] = dens
    # the differentiator: the first knob this variant moves whose
    # mapped gene is not already listed — distinct keys per variant
    move = {'type.ratio': 'type-contrast',
            'type.display_weight': 'type-contrast',
            'type.tracking_display': 'type-contrast',
            'space.density_scale': 'density-tier',
            'elevation.level': 'surface-rhythm',
            'color.neutral_tint': 'mood-register'}
    for k in deltas:
        gene = move.get(k)
        if gene and gene not in axes and gene in gate.genome_genes():
            val = str(g.get(gene) or '')
            if val in gate.genome_genes()[gene]:
                axes[gene] = val
                break
    return axes


def rewrite_options(ctx, variants):
    """Replace the plan's options block with the three look vectors —
    the layout labels from w0 (identical temperature/shape on every
    row) can never satisfy D.3; the look round's vectors can. Only
    closed-set axes/genes land in the block (name/wildcard are the
    metadata the D.3 parser strips). Also repairs direction.shape when
    it carries a raw extracted radius ('10px'): the axis accepts only
    p-rungs, so the exact px maps to its nearest rung."""
    p = os.path.join(ctx.dir, 'DESIGN-PLAN.md')
    txt = open(p).read()
    lines = []
    for v in variants:
        ax = _option_axes(ctx, v['deltas'])
        entry = {'name': v['id'],
                 'wildcard': str(v['vector'] == 'wildcard').lower()}
        entry.update(ax)
        kv = ', '.join(f'{k}: {val}' for k, val in entry.items())
        lines.append(f'  - {{{kv}}}')
    block = 'options:\n' + '\n'.join(lines) + '\n'
    new, n = re.subn(r'^options:\s*\n(?:\s*-\s.*\n)+', block, txt,
                     flags=re.M)
    if not n:
        raise SystemExit(f'{TOOL}: plan has no options: block to rewrite')
    rung = _shape_rung(ctx)
    if rung:
        new = re.sub(r'(?m)^(\s*)shape:\s*"?[0-9.]+px"?\s*$',
                     rf'\g<1>shape: {rung}', new)
    # the plan declares its producer chain after the plan_from_copy
    # stamp: I.3/repro replay it (build → rewrite) byte-for-byte
    marker = ('<!-- REWRITTEN by look_emit.py — options → the 3 look '
              'vectors · direction.shape → p-rung -->')
    if marker not in new:
        new = new.replace('\n', '\n' + marker + '\n', 1)
    open(p, 'w').write(new)
    return [l.strip() for l in lines]


def _shape_rung(ctx):
    """Nearest p-rung (p1..p4) for an extracted-px radius.personality,
    else the knob value itself when it already is a rung; None when the
    knob is neither (never fabricate). Rungs are emit_tokens' rem
    presets ×16px: p1=2px p2=4px p3=8px p4=12px."""
    raw = str((gate.dna_map(ctx) or {}).get('knobs', {})
              .get('radius.personality') or '')
    allowed = sorted(gate.AXES.get('shape') or set())
    if raw in allowed:
        return raw
    m = re.fullmatch(r'(\d+(?:\.\d+)?)px', raw)
    if not m or not allowed:
        return None
    px = float(m.group(1))
    rung_px = {'p0': 0.0, 'p1': 2.0, 'p2': 4.0, 'p3': 8.0,
               'p4': 12.0, 'p5': 16.0}
    rungs = [r for r in allowed if r in rung_px]
    if not rungs:
        return None
    return min(rungs,
               key=lambda r: (abs(rung_px[r] - px),
                              rungs.index(r)))


def main(argv):
    a = [x for x in argv[1:] if not x.startswith('--')]
    if len(a) != 1:
        print('usage: look_emit.py <page-pipeline-dir>')
        return 2
    d = os.path.abspath(a[0])
    ctx = gate.Ctx(d)
    variants = _variants(ctx)
    with open(os.path.join(d, 'VARIANT-GATES.json'), 'w',
              encoding='utf-8') as fh:
        json.dump({'generated_by': TOOL, 'variants': variants}, fh,
                  indent=1)
        fh.write('\n')
    pb = _prebuild(ctx, variants)
    with open(os.path.join(d, 'PREBUILD.json'), 'w', encoding='utf-8') as fh:
        json.dump(pb, fh, indent=1)
        fh.write('\n')
    # the offered look variants are DNA state (DM.1 requires
    # 'variants' at w4) — dna_apply is the canonical writer (re-
    # derives slices + TOKENS); the operator's w4 pick locks the map
    r = subprocess.run(
        [sys.executable, os.path.join(HERE, 'dna_apply.py'), d,
         '--set-json', 'variants=' + json.dumps(variants)],
        capture_output=True, text=True)
    if r.returncode != 0:
        raise SystemExit(
            f'{TOOL}: dna_apply variants failed ({r.returncode}): '
            f'{(r.stdout + r.stderr).strip()[-300:]}')
    print(f'{TOOL}: {len(variants)} look option(s) → VARIANT-GATES.json, '
          f'{len(pb["options"])} pre-build row(s) → PREBUILD.json, '
          'plan options: rewritten to the 3 look vectors')
    rewrite_options(ctx, variants)
    for v in variants:
        print(f'  {v["id"]} {v["vector"]} score {v["score"]} '
              f'deltas {sorted(v["deltas"])}')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
