#!/usr/bin/env python3
"""variance_run.py — headless design-variance proof.

Emits the SAME plan under N different DNAs, then diffs the produced
artifacts mechanically — proving the machinery produces different
DESIGNS (structure + tokens + rhythm), not reskins.

  usage: variance_run.py [--base <pipeline>] [--out <dir>] [--build]

Each variant clones --base (the verified /tmp/pipe-verify2 pipeline),
overwrites DNA.json knobs+modes+rhythm, patches the plan rows'
surface/density (the rhythm-check inputs), deletes stale emit
artifacts (TOKENS.json is operator-owned: pipeline_emit keeps it),
re-runs pipeline_emit, then diffs: TOKENS.json, global.css var
values, tailwind.config hexes, contract density/surface rhythm.
"""
import json
import os
import re
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
BASE = '/tmp/pipe-verify2'
OUT = os.environ.get('VARIANCE_OUT', '/tmp/variance')

# three deliberately distinct DNAs — the knobs the token layer reads
VARIANTS = {
    'spacious-serif-editorial': {
        'knobs': {
            'type.ratio': 1.3375, 'type.base': 18,
            'type.display_weight': 400,
            'type.tracking_display': -0.01,
            'space.density_scale': 'space-l',
            'space.section_py': {'compact': 'section-space-s',
                                 'regular': 'section-space-m',
                                 'spacious': 'section-space-xl'},
            'grid.gutter': 'space-l',
            'radius.personality': 'p2',
            'color.surface_contrast': 0.03,
            'color.accent_usage': 'cta-only',
            'color.neutral_tint': 0.02,
            'elevation.level': 0, 'motion.level': 'none',
            'image.treatment': 'natural', 'motion.engine': 'css',
            'btn.padding_ratio': 1.5, 'btn.size': 'l',
            'width.inner_rung': '70'},
        'modes': {'light': {
            'bg': '#FAF7F2', 'surface': '#F0EBE3',
            'surface_elevated': '#E7E0D4', 'border': '#D9CFC0',
            'ink': '#2B2419', 'ink_muted': '#6E6455',
            'accent': '#8A5A2B', 'accent_foreground': '#FBF8F2',
            'inverse': '#241F16'},
                  'dark': {
            'bg': '#17140F', 'surface': '#1F1B15',
            'surface_elevated': '#27221A', 'border': '#37302A',
            'ink': '#EDE7DC', 'ink_muted': '#A79C8B',
            'accent': '#D9A96A', 'accent_foreground': '#17140F',
            'inverse': '#F5F1E8'}},
        'rhythm': [
            {'section': 'nav', 'surface': 'base', 'density': 'compact'},
            {'section': 'hero', 'surface': 'muted',
             'density': 'spacious'},
            {'section': 'macro', 'surface': 'base',
             'density': 'spacious'},
            {'section': 'end-act', 'surface': 'inverse',
             'density': 'spacious'},
            {'section': 'footer', 'surface': 'base',
             'density': 'regular'}],
        # plan-row surface/density — legal per check_rhythm:
        # exactly ONE interior inverse/brand row, no ≥3 density run.
        'rows': {'hero': ('muted', 'spacious'),
                 'macro': ('base', 'regular'),
                 'end-act': ('inverse', 'spacious')}},
    'compact-brutalist': {
        'knobs': {
            'type.ratio': 1.15, 'type.base': 15,
            'type.display_weight': 900,
            'type.tracking_display': -0.04,
            'space.density_scale': 'space-xs',
            'space.section_py': {'compact': 'section-space-xs',
                                 'regular': 'section-space-s',
                                 'spacious': 'section-space-m'},
            'grid.gutter': 'space-xs',
            'radius.personality': 'p0',
            'color.surface_contrast': 0.12,
            'color.accent_usage': 'cta+motif',
            'color.neutral_tint': 0.0,
            'elevation.level': 0, 'motion.level': 'none',
            'image.treatment': 'natural', 'motion.engine': 'css',
            'btn.padding_ratio': 2.5, 'btn.size': 's',
            'width.inner_rung': '50'},
        'modes': {'light': {
            'bg': '#FFFFFF', 'surface': '#F2F2F2',
            'surface_elevated': '#E6E6E6', 'border': '#0A0A0A',
            'ink': '#0A0A0A', 'ink_muted': '#444444',
            'accent': '#D9000B', 'accent_foreground': '#FFFFFF',
            'inverse': '#0A0A0A'},
                  'dark': {
            'bg': '#0A0A0A', 'surface': '#141414',
            'surface_elevated': '#1C1C1C', 'border': '#EDEDED',
            'ink': '#EDEDED', 'ink_muted': '#A3A3A3',
            'accent': '#FF4D57', 'accent_foreground': '#0A0A0A',
            'inverse': '#FFFFFF'}},
        'rhythm': [
            {'section': 'nav', 'surface': 'inverse',
             'density': 'compact'},
            {'section': 'hero', 'surface': 'base',
             'density': 'compact'},
            {'section': 'macro', 'surface': 'base',
             'density': 'regular'},
            {'section': 'end-act', 'surface': 'brand',
             'density': 'compact'},
            {'section': 'footer', 'surface': 'inverse',
             'density': 'compact'}],
        'rows': {'hero': ('base', 'compact'),
                 'macro': ('muted', 'regular'),
                 'end-act': ('brand', 'compact')}},
    'neon-dark-tech': {
        'knobs': {
            'type.ratio': 1.2, 'type.base': 16,
            'type.display_weight': 600,
            'type.tracking_display': 0.06,
            'space.density_scale': 'space-m',
            'space.section_py': {'compact': 'section-space-s',
                                 'regular': 'section-space-l',
                                 'spacious': 'section-space-xl'},
            'grid.gutter': 'space-s',
            'radius.personality': 'p4',
            'color.surface_contrast': 0.08,
            'color.accent_usage': 'cta+motif',
            'color.neutral_tint': 0.05,
            'elevation.level': 2, 'motion.level': 'playful',
            'image.treatment': 'natural', 'motion.engine': 'css',
            'btn.padding_ratio': 2.0, 'btn.size': 'm',
            'width.inner_rung': '60'},
        'modes': {'light': {
            'bg': '#0D0F1A', 'surface': '#141826',
            'surface_elevated': '#1B2134', 'border': '#2A3150',
            'ink': '#E7EAF5', 'ink_muted': '#8B93B8',
            'accent': '#5BE7FF', 'accent_foreground': '#0D0F1A',
            'inverse': '#E7EAF5'},
                  'dark': {
            'bg': '#070912', 'surface': '#0D1020',
            'surface_elevated': '#131732', 'border': '#232B4F',
            'ink': '#F0F3FC', 'ink_muted': '#93A0CC',
            'accent': '#7DFFE3', 'accent_foreground': '#070912',
            'inverse': '#F0F3FC'}},
        'rhythm': [
            {'section': 'nav', 'surface': 'base', 'density': 'compact'},
            {'section': 'hero', 'surface': 'base',
             'density': 'spacious'},
            {'section': 'macro', 'surface': 'muted',
             'density': 'regular'},
            {'section': 'end-act', 'surface': 'brand',
             'density': 'spacious'},
            {'section': 'footer', 'surface': 'base',
             'density': 'compact'}],
        'rows': {'hero': ('base', 'spacious'),
                 'macro': ('muted', 'regular'),
                 'end-act': ('brand', 'spacious')}},
}


def _clone(dst):
    if os.path.isdir(dst):
        shutil.rmtree(dst)
    shutil.copytree(BASE, dst, ignore=shutil.ignore_patterns(
        'site/dist', 'GATES.json', 'preview', 'shots'))
    # the clone must NOT inherit stale emit artifacts — TOKENS.json
    # is operator-owned (pipeline_emit keeps it over DNA), and
    # site/+sections/*.json are outputs. Delete them so the emit
    # derives EVERYTHING from this variant's DNA + plan.
    for rel in ('TOKENS.json', 'site'):
        p = os.path.join(dst, rel)
        if os.path.isdir(p):
            shutil.rmtree(p)
        elif os.path.isfile(p):
            os.unlink(p)
    for fn in os.listdir(os.path.join(dst, 'sections')) \
            if os.path.isdir(os.path.join(dst, 'sections')) else []:
        if fn.endswith(('.contract.json', '.gate.json')):
            os.unlink(os.path.join(dst, 'sections', fn))


def _patch_rows(dst, rows):
    """Plan-row surface/density live in DESIGN-PLAN.md (contracts read
    r.get('surface'/'density'), NOT DNA.rhythm — the rhythm check is
    a W4 gate ON those rows). Patch each row's inline surface:/density:
    values; must stay legal: one interior inverse/brand, no ≥3 run."""
    p = os.path.join(dst, 'DESIGN-PLAN.md')
    t = open(p, encoding='utf-8').read()
    for name, (surf, dens) in rows.items():
        m = re.search(
            r"(- \{name: %s, .*?surface: )([a-z]+)(, density: )([a-z]+)"
            % re.escape(name), t)
        if not m:
            raise SystemExit(f'no plan row "{name}" to patch')
        t = t[:m.start()] + m.group(1) + surf + m.group(3) + dens \
            + t[m.end():]
    with open(p, 'w') as fh:
        fh.write(t)


def _set_dna(dst, patch):
    p = os.path.join(dst, 'DNA.json')
    d = json.load(open(p))
    d['knobs'].update(patch['knobs'])
    d['modes'] = patch['modes']
    # DM.6 binds plan-row density/surface to the DNA rhythm — the
    # harness derives the map's matching rows from the patched
    # surface/density so rhythm and plan never disagree.
    rows = patch.get('rows') or {}
    rhy = {r['section']: r for r in d.get('rhythm') or []}
    for sec, (surf, dens) in rows.items():
        if sec in rhy:
            rhy[sec] = dict(rhy[sec], surface=surf, density=dens)
        else:
            rhy[sec] = {'section': sec, 'surface': surf,
                        'density': dens}
    d['rhythm'] = list(rhy.values())
    # DM.1 — re-hash the edited map (same slices gate.dna_slices
    # produces) so hashes.core/.structure stay fresh.
    sys.path.insert(0, HERE)
    import gate as _g
    d['hashes'] = _g.dna_slices(d)
    json.dump(d, open(p, 'w'), indent=1)


def _emit(dst, build):
    cmd = [sys.executable, os.path.join(HERE, 'pipeline_emit.py'), dst]
    if build:
        cmd.append('--build')
    return subprocess.run(cmd, capture_output=True, text=True)


def _read(dst, rel):
    p = os.path.join(dst, rel)
    return open(p).read() if os.path.isfile(p) else ''


def _vars(css):
    return {m.group(1): m.group(2).strip()
            for m in __import__('re').finditer(
                r'(--[a-zA-Z0-9-]+)\s*:\s*([^;}]+)', css)}


def run(build=False):
    os.makedirs(OUT, exist_ok=True)
    emitted = {}
    for name, patch in VARIANTS.items():
        dst = os.path.join(OUT, name)
        _clone(dst)
        _set_dna(dst, patch)
        _patch_rows(dst, patch.get('rows') or {})
        r = _emit(dst, build)
        emitted[name] = dst
        ok = r.returncode
        print(f'[{name}] emit exit={ok}')
        if ok:
            print(r.stderr[-400:] or r.stdout[-300:])

    # ---- diff: tokens + css vars + rhythm + classes
    names = list(emitted)
    rows = {n: {} for n in names}
    for n, dst in emitted.items():
        tok = _read(dst, 'TOKENS.json')
        css = _vars(_read(dst, 'site/src/styles/global.css'))
        cfg = _read(dst, 'site/tailwind.config.js')
        rows[n]['TOKENS'] = tok
        rows[n]['vars'] = css
        rows[n]['hexes'] = set(__import__('re').findall(
            r'#[0-9a-fA-F]{3,8}', cfg))
        rows[n]['contracts'] = {
            fn: json.load(open(os.path.join(dst, 'sections', fn)))
            for fn in sorted(os.listdir(os.path.join(dst, 'sections')))
            if fn.endswith('.contract.json')}
    # token diffs
    all_keys = sorted({k for n in names for k in rows[n]['vars']})
    diff_keys = [k for k in all_keys
                 if len({rows[n]['vars'].get(k) for n in names}) > 1]
    # contract rhythm diffs
    rhy = {n: {f: (rows[n]['contracts'][f].get('surface'),
                   rows[n]['contracts'][f].get('density'))
               for f in rows[n]['contracts']} for n in names}
    rhythm_diff = {f for n in names for f in rhy[n]
                   if len({rhy[m].get(f) for m in names}) > 1}
    hex_diff = len({tuple(sorted(rows[n]['hexes'])) for n in names})

    print('\n================ VARIANCE REPORT ================')
    print(f'variants: {names}')
    print(f'css var keys differing across DNAs: {len(diff_keys)}/'
          f'{len(all_keys)}')
    for k in diff_keys:
        vals = {n: rows[n]['vars'].get(k, '—') for n in names}
        print(f'  {k:36} ' + ' | '.join(
            f"{n.split('-')[0]}:{v}" for n, v in vals.items()))
    print(f'\ncontract rows differing (surface/density): '
          f'{len(rhythm_diff)}/5')
    for f in sorted(rhythm_diff):
        print(f'  {f:26} ' + ' | '.join(
            f"{n.split('-')[0]}:{rhy[n][f]}" for n in names))
    print(f'\ntailwind hex sets identical? '
          f'{"YES (reskin)" if hex_diff == 1 else "NO — distinct"}')
    print('=================================================')
    return 0 if (len(diff_keys) > 8 and len(rhythm_diff) >= 3
                 and hex_diff > 1) else 2


if __name__ == '__main__':
    run('--build' in sys.argv)
