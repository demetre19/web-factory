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
  pipeline_emit --html   → site/dist/**.html + site/html/<slug>.html
                           (only when the real dir carries dist/)

The recorded w3 pick is re-read from the operator's approval record and
passed explicitly, so the rebuilt plan reflects the approved option.

  python3 repro.py <page-pipeline-dir>
Exit 0 = identical. Each differing file is printed.
"""
import filecmp
import hashlib
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
# dist + the derived site/html artifact replay in the --html emit
# below, not in the src-tree walk
EMIT_SKIP = {'node_modules', 'dist', 'html', '.git', '__pycache__',
             '.astro'}


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


def _sha16(path):
    try:
        with open(path, 'rb') as fh:
            return hashlib.sha256(fh.read()).hexdigest()[:16]
    except OSError:
        return None


def _receipt_steps(pdir):
    """All receipted steps across waves: {script+flags key: step}."""
    out = {}
    rd = os.path.join(pdir, '.receipts')
    if not os.path.isdir(rd):
        return out
    for fn in sorted(os.listdir(rd)):
        try:
            recs = json.load(open(os.path.join(rd, fn)))
        except Exception:
            continue
        for s in recs.get('steps', []):
            argv = s.get('argv', [])
            if len(argv) < 2:
                continue
            flags = ' '.join(x for x in argv[2:]
                             if x.startswith('--'))
            out[os.path.basename(argv[1]) + ' ' + flags] = s
    return out


def _bindings_hold(pdir, step):
    """Recorded inputs unchanged AND recorded outputs intact in the
    real dir → the earlier run's receipt still proves this producer."""
    for rel, sha in step.get('inputs', {}).items():
        if _sha16(os.path.join(pdir, rel)) != sha:
            return False
    for rel, sha in step.get('outputs', {}).items():
        if _sha16(os.path.join(pdir, rel)) != sha:
            return False
    return True


def _copy_outputs(pdir, t_pdir, step):
    for rel in step.get('outputs', {}):
        s = os.path.join(pdir, rel)
        d = os.path.join(t_pdir, rel)
        if os.path.isfile(s):
            os.makedirs(os.path.dirname(d), exist_ok=True)
            shutil.copy2(s, d)


def _emit_bindings_hold(pdir, bindings):
    """The emit chain (emit+build, preview emits, template export)
    is replayable-free when its receipted inputs+outputs still hold
    in the real dir."""
    # w6 receipts 'emit + build' — 'pipeline_emit.py --html' now
    # ('--build' on pre-html runs); the bare-emit replay reads the
    # same inputs through the same chain
    step = (bindings.get('pipeline_emit.py --html')
            or bindings.get('pipeline_emit.py --build'))
    return bool(step and _bindings_hold(pdir, step))


def _copy_generated(pdir, t_pdir):
    """Wholesale copy of the emit output domain (receipts record
    diffs, not full output sets — the trees ARE the closure)."""
    for rel in ('site', 'preview', 'templates', 'sections'):
        s, d = os.path.join(pdir, rel), os.path.join(t_pdir, rel)
        if os.path.isdir(s):
            if os.path.isdir(d):
                shutil.rmtree(d)
            # dist IS a copied output here (the src-tree compare skips
            # it anyway via EMIT_SKIP; dist's own compare verifies
            # byte-identity against itself)
            shutil.copytree(
                s, d,
                ignore=shutil.ignore_patterns(
                    'node_modules', '.git', '__pycache__', '.astro'))
        elif os.path.isfile(s):
            os.makedirs(os.path.dirname(d), exist_ok=True)
            shutil.copy2(s, d)
    for rel in ('COMPONENTS.md', 'BUILD-PLAN.json', 'SPEC.md',
                'ASSEMBLED.md'):
        s = os.path.join(pdir, rel)
        if os.path.isfile(s):
            shutil.copy2(s, os.path.join(t_pdir, rel))


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


def rebuild(pdir, tmp, incremental=False):
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
    bindings = _receipt_steps(pdir) if incremental else {}

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

    # incremental replay: when the emit chain's receipted input+output
    # bindings still hold in the real dir, its outputs are already
    # proven — copy the generated trees wholesale instead of replaying
    # (drift → full replay of every producer below)
    emit_skipped = False
    if incremental and _emit_bindings_hold(pdir, bindings):
        _copy_generated(pdir, t_pdir)
        emit_skipped = True

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
        if emit_skipped:
            pass
        else:
            _run(emit_argv)

    # the picker producers (Option A): each rebuilds the site's preview
    # pages through the real emit chain (one astro build) — they emit
    # BEFORE the site tree diff so site/src/pages/preview/*.astro and
    # the shells are producer output, byte-compared below. Their dist
    # output is never compared (dist/ diffs run once, against the
    # pipeline_emit --build below), so the per-emit astro builds are
    # deferred — WF_DEFER_BUILD is honored by preview_build._build.
    if full and not emit_skipped:
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
    if not emit_skipped:
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
    # dist html + the site/html artifact: byte compare when the real
    # dir was built — the --html emit replay produces both
    if (full or emit_skipped) and os.path.isdir(
            os.path.join(real_site, 'dist')):
        if not emit_skipped:
            _run([PY, os.path.join(HERE, 'pipeline_emit.py'), t_pdir,
                  '--html'])
        diffs += [f'site/dist/{d}' for d in _diff_tree(
            os.path.join(real_site, 'dist'),
            os.path.join(t_pdir, 'site', 'dist'), skip=())]
        diffs += [f'site/html/{d}' for d in _diff_tree(
            os.path.join(real_site, 'html'),
            os.path.join(t_pdir, 'site', 'html'), skip=())]
        # template export replays unless ITS OWN receipt bindings
        # hold — emit_skipped only covers the emit chain
        if not emit_skipped or not (
                bindings.get('template_export.py ')
                and _bindings_hold(
                    pdir, bindings['template_export.py '])):
            _run([PY, os.path.join(HERE, 'template_export.py'),
                  t_pdir])
        diffs += [f'templates/{d}' for d in _diff_tree(
            os.path.join(pdir, 'templates'),
            os.path.join(t_pdir, 'templates'))]
    return diffs


def main(argv):
    a = [x for x in argv[1:] if not x.startswith('--')]
    if len(a) != 1:
        print('usage: repro.py [--incremental] <page-pipeline-dir>')
        return 2
    pdir = os.path.abspath(a[0])
    with tempfile.TemporaryDirectory(prefix='wf-repro-') as tmp:
        diffs = rebuild(pdir, tmp,
                        incremental='--incremental' in argv)
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
