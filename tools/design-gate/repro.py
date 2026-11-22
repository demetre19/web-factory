#!/usr/bin/env python3
"""repro.py — X.1: every generated file must be producer output.

Rebuilds the site folder's generated files in a scratch copy and
byte-compares against the real ones. A hand-written or hand-edited
file fails — whatever route produced it.

Inputs kept (not rebuilt): BRIEF.yaml, RULES.md, assets/ — operator;
  DISCOVERY.json — discovery.py output, the w0→down anchor
Rebuilt & compared:
  copy_ingest.py         → pages/<slug>/COPY.json
  dna_from_discovery.py  → DNA.json, TOKENS.json, DESIGN-SYSTEM.md
  plan_from_copy.py      → pages/<slug>/{DESIGN-PLAN.md, STUB.md,
                           LAYOUT-OPTIONS.json, DNA.json, TOKENS.json}
  pipeline_emit.py       → site/src/**, site/package.json,
                           tailwind.config.js, astro.config.mjs ...
  pipeline_emit --build  → site/dist/**.html (only when the real dir
                           carries dist/)

The recorded w3 pick is re-read from the operator's approval record and
passed explicitly, so the rebuilt plan reflects the approved option.

  python3 repro.py <page-pipeline-dir>
Exit 0 = identical. Each differing file is printed.
"""
import filecmp
import json
import os
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
PY = sys.executable
sys.path.insert(0, HERE)
import gate  # noqa: E402
import site_folder as SF  # noqa: E402

TOOL = 'repro.py'

# dir entries that are regenerated (excluded from the scratch copy)
GENERATED_SITE = {'DNA.json', 'TOKENS.json', 'DESIGN-SYSTEM.md',
                  'GATES.json', 'RUN.json', 'CHECKLIST', '.receipts',
                  'pages'}
GENERATED_PAGE = {'COPY.json', 'DESIGN-PLAN.md', 'STUB.md',
                  'LAYOUT-OPTIONS.json', 'DNA.json', 'TOKENS.json',
                  'GATES.json', 'RUN.json', 'CHECKLIST', '.receipts',
                  'site', 'preview', 'COMPONENTS.md', 'BUILD-PLAN.json',
                  'SPEC.md', 'ASSEMBLED.md', 'SCORECARD.json',
                  'CANON-PADDING.json', 'SOP-CONSTANTS.json',
                  'VARIANT-GATES.json', 'PREBUILD.json', 'sections',
                  'templates'}
SITE_COMPARE = ['DNA.json', 'TOKENS.json', 'DESIGN-SYSTEM.md']
PAGE_COMPARE = ['COPY.json', 'DESIGN-PLAN.md', 'STUB.md',
                'LAYOUT-OPTIONS.json', 'DNA.json', 'TOKENS.json',
                'VARIANT-GATES.json', 'PREBUILD.json']
PREVIEW_COMPARE = ['layouts.html', 'variants.html', 'fine.html',
                   'system.html']
PAGE_COMPARE_DIRS = {'sections': ()}   # *.contract.json, *.gate.json
EMIT_SKIP = {'node_modules', 'dist', '.git', '__pycache__', '.astro'}


def _run(argv, cwd=None, env=None):
    r = subprocess.run(argv, cwd=cwd, capture_output=True, text=True,
                       env=env)
    if r.returncode != 0:
        tail = (r.stdout + r.stderr).strip().split('\n')[-6:]
        raise SystemExit(
            f'{TOOL}: producer failed ({r.returncode}): '
            + ' '.join(argv[1:2]) + '\n  ' + '\n  '.join(tail))


def _copy_filtered(src, dst, drop):
    os.makedirs(dst, exist_ok=True)
    for name in sorted(os.listdir(src)):
        if name in drop or name == '__pycache__':
            continue
        s, d = os.path.join(src, name), os.path.join(dst, name)
        if os.path.isdir(s):
            shutil.copytree(s, d)
        else:
            shutil.copy2(s, d)


def _diff_tree(a_root, b_root, skip=(), prefix=''):
    """relpaths where the two trees differ (missing = a diff)."""
    diffs = []
    a_names, b_names = set(), set()
    for root, names in ((a_root, a_names), (b_root, b_names)):
        for dp, dns, fns in os.walk(root):
            dns[:] = [d for d in dns if d not in skip]
            for fn in fns:
                rel = os.path.relpath(os.path.join(dp, fn),
                                      root).replace(os.sep, '/')
                names.add(rel)
    for rel in sorted(a_names | b_names):
        pa, pb = os.path.join(a_root, rel), os.path.join(b_root, rel)
        if not (os.path.isfile(pa) and os.path.isfile(pb)):
            diffs.append(prefix + rel + ' (missing on one side)')
        elif not filecmp.cmp(pa, pb, shallow=False):
            diffs.append(prefix + rel)
    return diffs


def _recorded_pick(pdir):
    try:
        rec = gate.read_approvals(gate.Ctx(pdir)).get('w3') or {}
        return rec.get('design')
    except Exception:
        return None


def _recorded_look(pdir):
    try:
        rec = gate.read_approvals(gate.Ctx(pdir)).get('w4') or {}
        return rec.get('design')
    except Exception:
        return None


def rebuild(pdir, tmp):
    site_dir, slug = SF.site_of(pdir)
    if not site_dir:
        raise SystemExit(f'{TOOL}: {pdir} is not a page dir of a site '
                         'folder')
    t_site = os.path.join(tmp, os.path.basename(site_dir))
    _copy_filtered(site_dir, t_site, GENERATED_SITE)
    # BRIEF/RULES must survive even if the filter list drifts
    for keep in ('BRIEF.yaml', 'RULES.md', 'MOBBIN-REFS.md',
                 'DISCOVERY.json', 'DISCOVERY.md'):
        src = os.path.join(site_dir, keep)
        if os.path.isfile(src):
            shutil.copy2(src, os.path.join(t_site, keep))
    t_pdir = os.path.join(t_site, 'pages', slug)
    os.makedirs(t_pdir, exist_ok=True)
    _copy_filtered(pdir, t_pdir, GENERATED_PAGE)

    # the operator's approvals live under the real dir's path hash —
    # the scratch dir resolves its own hash and finds nothing, which
    # silently re-derives picks (assemble_fine falls back to the
    # first declared variant). Seed the recorded approvals beside the
    # work; read_approvals honours a local APPROVALS.json.
    appr = gate.read_approvals(gate.Ctx(pdir))
    if appr:
        with open(os.path.join(t_pdir, 'APPROVALS.json'), 'w',
                  encoding='utf-8') as fh:
            json.dump(appr, fh)

    # dna_from_discovery --offline: DISCOVERY.json + assets/fonts are
    # already captured — repro never refetches the network
    _run([PY, os.path.join(HERE, 'dna_from_discovery.py'), t_site,
          '--offline'])
    _run([PY, os.path.join(HERE, 'copy_ingest.py'), t_pdir])
    pick = _recorded_pick(pdir)
    plan_argv = [PY, os.path.join(HERE, 'plan_from_copy.py'), t_pdir]
    if pick:
        plan_argv += ['--option', pick]
    _run(plan_argv)
    # the w4 look producer rewrites DESIGN-PLAN.md (options → look
    # vectors, direction.shape → p-rung) and DNA.json (variants via
    # dna_apply) — mirror it when the real plan carries the stamp
    if 'REWRITTEN by look_emit.py' in open(
            os.path.join(pdir, 'DESIGN-PLAN.md'), encoding='utf-8',
            errors='replace').read():
        _run([PY, os.path.join(HERE, 'look_emit.py'), t_pdir])
    if _recorded_look(pdir):
        # the operator's w4 pick locks the DNA map to v1
        # (approve_service.record_approval → gate.lock_dna_map) —
        # replay the same producer so the rebuilt DNA.json carries
        # the locked bytes
        _run([PY, '-c',
              'import sys; sys.path.insert(0, ' + repr(HERE) + '); '
              'import gate; '
              'gate.lock_dna_map(gate.Ctx(sys.argv[1]))', t_pdir])
    diffs = []

    # mirror the pipeline's own route: scaffold-only emit when the
    # real dir was never fully emitted (no per-contract components),
    # full emit when it was — the w0 rebuild can't produce contracts
    real_site = os.path.join(pdir, 'site')
    full = False
    if os.path.isdir(real_site):
        comps = os.path.join(real_site, 'src', 'components')
        full = os.path.isdir(comps) and any(
            fn.endswith('.astro') and fn != 'Section.astro'
            for fn in os.listdir(comps))
        emit_argv = [PY, os.path.join(HERE, 'pipeline_emit.py'), t_pdir]
        if not full:
            emit_argv.append('--scaffold')
        _run(emit_argv)

    # the picker producers (Option A): each rebuilds the site's preview
    # pages through the real emit chain (one astro build) — they emit
    # BEFORE the site tree diff so site/src/pages/preview/*.astro and
    # the shells are producer output, byte-compared below. Their dist
    # output is never compared (dist/ diffs run once, against the
    # pipeline_emit --build below), so the per-emit astro builds are
    # deferred — WF_DEFER_BUILD is honored by preview_build._build.
    if full:
        defer = dict(os.environ, WF_DEFER_BUILD='1')
        for flag in ('--layouts', '--variants', '--fine', '--system'):
            if os.path.isfile(os.path.join(
                    pdir, 'preview', flag[2:] + '.html')):
                _run([PY, os.path.join(HERE, 'assemble.py'), t_pdir,
                      flag], env=defer)

    # compares run once every producer has landed: pipeline_emit
    # re-emits TOKENS.json (P1 shadow), the preview emitters write
    # site/src/pages/preview/*.astro, contracts snapshot the emitted
    # global.css.
    for rel in SITE_COMPARE:
        a, b = os.path.join(site_dir, rel), os.path.join(t_site, rel)
        if os.path.isfile(a) and not filecmp.cmp(a, b, shallow=False) \
                or not os.path.isfile(a) and os.path.isfile(b):
            diffs.append(rel)
        elif not os.path.isfile(a) and not os.path.isfile(b):
            pass
        elif not os.path.isfile(b):
            diffs.append(rel + ' (missing in rebuild)')
    for rel in PAGE_COMPARE:
        a, b = os.path.join(pdir, rel), os.path.join(t_pdir, rel)
        if not os.path.isfile(a) and not os.path.isfile(b):
            continue
        if not os.path.isfile(a):
            diffs.append(rel + ' (rebuild produced; real dir lacks it)')
        elif not os.path.isfile(b):
            diffs.append(rel + ' (real file; rebuild produced none)')
        elif not filecmp.cmp(a, b, shallow=False):
            diffs.append(rel)
    if os.path.isdir(real_site):
        diffs += [f'site/{d}' for d in _diff_tree(
            real_site, os.path.join(t_pdir, 'site'), skip=EMIT_SKIP)]

    # w3 producer — contracts' classes_snapshot reads the emitted
    # site/src/styles/global.css, so it runs after the emit
    _run([PY, os.path.join(HERE, 'gate.py'), 'contracts', t_pdir])
    for sub, skip in PAGE_COMPARE_DIRS.items():
        diffs += [f'{sub}/{d}' for d in _diff_tree(
            os.path.join(pdir, sub), os.path.join(t_pdir, sub),
            skip=skip)]

    if full:
        for name in PREVIEW_COMPARE:
            a = os.path.join(pdir, 'preview', name)
            b = os.path.join(t_pdir, 'preview', name)
            if not os.path.isfile(a) and not os.path.isfile(b):
                continue
            if not os.path.isfile(a):
                diffs.append(f'preview/{name} (rebuild produced; '
                             'real dir lacks it)')
            elif not os.path.isfile(b):
                diffs.append(f'preview/{name} (real file; rebuild '
                             'produced none)')
            elif not filecmp.cmp(a, b, shallow=False):
                diffs.append(f'preview/{name}')
    # dist html: byte compare when the real dir was built
    if full and os.path.isdir(os.path.join(real_site, 'dist')):
        _run([PY, os.path.join(HERE, 'pipeline_emit.py'), t_pdir,
              '--build'])
        diffs += [f'site/dist/{d}' for d in _diff_tree(
            os.path.join(real_site, 'dist'),
            os.path.join(t_pdir, 'site', 'dist'), skip=())]
        _run([PY, os.path.join(HERE, 'template_export.py'), t_pdir])
        diffs += [f'templates/{d}' for d in _diff_tree(
            os.path.join(pdir, 'templates'),
            os.path.join(t_pdir, 'templates'))]
    return diffs


def main(argv):
    a = [x for x in argv[1:] if not x.startswith('--')]
    if len(a) != 1:
        print('usage: repro.py <page-pipeline-dir>')
        return 2
    pdir = os.path.abspath(a[0])
    with tempfile.TemporaryDirectory(prefix='wf-repro-') as tmp:
        diffs = rebuild(pdir, tmp)
    if diffs:
        print(f'{TOOL} FAIL {pdir} — {len(diffs)} file(s) do not '
              'reproduce from producers:')
        for d in diffs[:40]:
            print('  -', d)
        if len(diffs) > 40:
            print(f'  … +{len(diffs) - 40} more')
        return 1
    print(f'{TOOL} OK {pdir} — every generated file is byte-identical '
          'to a from-scratch producer rebuild')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
