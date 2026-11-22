#!/usr/bin/env python3.12
"""spec_diff.py — structural differ for genmenu fragments.

Compares a REFERENCE (banked exemplar: forensic.json or .html) against a
CANDIDATE rebuild (.html fragment or forensic.json) and reports exactly
what the rebuild is missing — the input an LLM finish pass consumes.

Report schema (JSON, written to <out>.json):

  missing[]   things present in reference, absent in candidate:
      {kind: 'region'|'slot'|'grid'|'state'|'decoration',
       region, role|slot_kind, detail, ref_index}
  extra[]     same fields for candidate-only structure
  mismatched[] both sides have it but it diverges:
      {region, role, field: 'cols'|'items'|'fields'|'links'|
       'element_share'|'slots_order', ref, got}
  summary     {ref_regions, got_regions, missing, extra,
               mismatched, score} — score = 1 - issues/max(1,slots)

Matching rule: regions pair by (role, order-rank within role); slots
pair by kind within the matched region. Counted slots (list.items,
form.fields, nav-links.links) mismatch when counts differ.

Usage:
  spec_diff.py REF{.forensic.json|.html} GOT{.forensic.json|.html}
      [--json out.json] [--md out.md]
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import spec_scan  # noqa: E402


def _load(path):
    if path.endswith('.forensic.json'):
        return json.load(open(path))
    return spec_scan.scan_file(path) if path.endswith('.html') else \
        spec_scan.scan(open(path).read(), 'candidate')


def _rkey(r):
    return f"{r['tag']}.{r['role']}"


def _pair_regions(ref, got):
    """Match regions by role, preserving order-rank within each role."""
    pairs, used = [], set()
    for i, r in enumerate(ref):
        cand = [j for j, g in enumerate(got)
                if j not in used and g['role'] == r['role']]
        if cand:
            j = cand[0]
            used.add(j)
            pairs.append((i, j))
    missing = [i for i in range(len(ref))
               if i not in {p[0] for p in pairs}]
    extra = [j for j in range(len(got)) if j not in used]
    return pairs, missing, extra


def _slot_id(s):
    return s['kind']


def _diff_slots(rname, ref_s, got_s, out):
    ref_k = [s['kind'] for s in ref_s]
    got_k = [s['kind'] for s in got_s]
    for i, s in enumerate(ref_s):
        matches = [g for g in got_s if g['kind'] == s['kind']]
        if not matches:
            out['missing'].append({
                'kind': 'slot', 'region': rname, 'slot_kind': s['kind'],
                'detail': f"{s['tag']} {_slot_id(s)}"
                          + (f" «{s.get('text','')[:50]}»"
                             if s.get('text') else ''),
                'ref_index': i})
            continue
        g = matches[0]
        for field, label in (('items', 'items'), ('fields', 'fields'),
                             ('links', 'links')):
            if s.get(field) is not None and \
                    g.get(field) is not None and \
                    s[field] != g[field]:
                out['mismatched'].append({
                    'region': rname, 'role': s['kind'], 'field': label,
                    'ref': s[field], 'got': g[field]})
    for g in got_s:
        if g['kind'] not in ref_k:
            out['extra'].append({
                'kind': 'slot', 'region': rname, 'slot_kind': g['kind'],
                'detail': f"{g['tag']} {g['kind']}",
                'ref_index': -1})
    if [k for k in ref_k if k in got_k] != \
            [k for k in got_k if k in ref_k]:
        out['mismatched'].append({
            'region': rname, 'role': 'slots_order',
            'field': 'slots_order',
            'ref': ref_k, 'got': got_k})


def diff(ref_fx, got_fx):
    out = {'missing': [], 'extra': [], 'mismatched': []}
    ref_r, got_r = ref_fx['regions'], got_fx['regions']
    pairs, missing, extra = _pair_regions(ref_r, got_r)
    for i in missing:
        r = ref_r[i]
        out['missing'].append({
            'kind': 'region', 'region': _rkey(r), 'role': r['role'],
            'detail': f"{r['tag']} {r.get('aria','') or r['role']} "
                      f"({len(r['slots'])} slots, "
                      f"{r['elements']} elements)",
            'ref_index': i})
    for j in extra:
        g = got_r[j]
        out['extra'].append({
            'kind': 'region', 'region': _rkey(g), 'role': g['role'],
            'detail': f"{g['tag']} {g.get('aria','') or g['role']}",
            'ref_index': -1})
    for i, j in pairs:
        r, g = ref_r[i], got_r[j]
        rname = _rkey(r)
        if r['cols'] != g['cols']:
            out['mismatched'].append({
                'region': rname, 'role': r['role'], 'field': 'cols',
                'ref': r['cols'], 'got': g['cols']})
        rs, gs = {s.get('child_index'): s for s in r['span_map']}, \
            {s.get('child_index'): s for s in g['span_map']}
        if rs != gs and rs:
            out['mismatched'].append({
                'region': rname, 'role': r['role'], 'field': 'span_map',
                'ref': r['span_map'], 'got': g['span_map']})
        _diff_slots(rname, r['slots'], g['slots'], out)
        rv = next((v for v in ref_fx['visual_weight']
                   if v['region_index'] == i), None)
        gv = next((v for v in got_fx['visual_weight']
                   if v['region_index'] == j), None)
        if rv and gv and abs(
                rv['element_share'] - gv['element_share']) > 0.2:
            out['mismatched'].append({
                'region': rname, 'role': r['role'],
                'field': 'element_share',
                'ref': rv['element_share'],
                'got': gv['element_share']})
    rg = ref_fx.get('grid_anatomy', {})
    gg = got_fx.get('grid_anatomy', {})
    if rg.get('grids') and not gg.get('grids'):
        out['missing'].append({
            'kind': 'grid', 'region': '*', 'role': 'grid',
            'detail': f"grids {rg['grids']}", 'ref_index': -1})
    if len(rg.get('spans', [])) > len(gg.get('spans', [])):
        out['mismatched'].append({
            'region': '*', 'role': 'grid', 'field': 'spans',
            'ref': len(rg['spans']), 'got': len(gg['spans'])})
    missing_deco = [d for d in ref_fx.get('decoration_hooks', [])
                    if d not in got_fx.get('decoration_hooks', [])
                    and not d.startswith(('rounded', 'shadow', 'border'))]
    for d in missing_deco[:10]:
        out['missing'].append({
            'kind': 'decoration', 'region': '*', 'role': 'decoration',
            'detail': d, 'ref_index': -1})
    issues = len(out['missing']) + len(out['extra']) + \
        len(out['mismatched'])
    slots = sum(len(r['slots']) for r in ref_r) or 1
    out['summary'] = {
        'ref_regions': len(ref_r), 'got_regions': len(got_r),
        'missing': len(out['missing']), 'extra': len(out['extra']),
        'mismatched': len(out['mismatched']),
        'score': round(max(0.0, 1.0 - issues / (slots + len(ref_r))), 3),
        'ref': ref_fx.get('slug', ''), 'got': got_fx.get('slug', '')}
    return out


def to_md(out, ref_p, got_p):
    s = out['summary']
    lines = [
        f"# spec_diff — {s['ref']} vs {s['got']}", '',
        f"- ref `{os.path.basename(ref_p)}` "
        f"({s['ref_regions']} regions)",
        f"- got `{os.path.basename(got_p)}` "
        f"({s['got_regions']} regions)",
        f"- **score {s['score']}** — {s['missing']} missing, "
        f"{s['extra']} extra, {s['mismatched']} mismatched", '']
    for name, key, mark in (('MISSING', 'missing', '-'),
                            ('EXTRA', 'extra', '+'),
                            ('MISMATCHED', 'mismatched', '~')):
        if not out[key]:
            continue
        lines.append(f'## {name}')
        for e in out[key]:
            if key == 'mismatched':
                lines.append(
                    f"{mark} `{e['region']}` {e['field']}: "
                    f"ref={e['ref']} got={e['got']}")
            else:
                lines.append(
                    f"{mark} `{e['region']}` {e.get('slot_kind') or e['role']}"
                    f" — {e['detail']}")
        lines.append('')
    return '\n'.join(lines)


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    ref = _load(args[0])
    got = _load(args[1])
    out = diff(ref, got)
    md = to_md(out, args[0], args[1])
    if '--json' in sys.argv:
        p = sys.argv[sys.argv.index('--json') + 1]
        json.dump(out, open(p, 'w'), indent=1)
    if '--md' in sys.argv:
        p = sys.argv[sys.argv.index('--md') + 1]
        open(p, 'w').write(md)
    if '--json' not in sys.argv and '--md' not in sys.argv:
        print(md)


if __name__ == '__main__':
    main()
