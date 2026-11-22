#!/usr/bin/env python3
"""judge.py — the w8 independent-verdict producer (run_pipeline step).

Reads MEASURE.json (the w7 render metrics) and rules on the EVIDENCE,
never on a declared score: each metric is compared against the
threshold its vertical documents in rules/J.md (J.12). Two severities:

  fail — below the degenerate floor: the page is measurably thin or
         broken (no proof surface, coverage a fraction of canon, a
         dead-space run over a viewport and a half, a skipped heading
         level). w8's gate refuses to pass it.
  warn — below canon but above the floor: real but non-blocking; the
         finding is recorded as evidence for the reviewer.

    judge.py <pipeline-dir>

Writes JUDGE.json into the pipeline dir: verdict pass|fail plus the
finding list the w8 check consumes.
"""
import hashlib
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import gate          # noqa: E402

# The floors and canons every vertical inherits. `fail` is the
# degenerate floor — below it the page cannot ship; `warn` is the
# canon value a healthy page reaches. services overrides the two
# canons the audit measured (coverage ≥ ~0.10, ≥ 1 proof surface);
# other verticals inherit base until the corpus carries data for them.
BASE_THRESHOLDS = {
    'image_coverage':      {'fail': 0.03, 'warn': 0.06},
    'section_count':       {'fail': 4,    'warn': 6},
    'contrast_min_ratio':  {'fail': 3.0,  'warn': 4.5},
    'tap_target_min_px':   {'fail': 12,   'warn': 24},
    'cta_count':           {'fail': 1,    'warn': 2},
    'proof_surfaces':      {'fail': 0,    'warn': 1},
    'dead_space_vps':      {'fail': 1.5,  'warn': 1.0},
    'dead_space_ratio':    {'fail': 0.40, 'warn': 0.30},
    'hierarchy_violations': {'fail': 0,   'warn': 0},
}
VERTICAL_THRESHOLDS = {
    'services': {
        'image_coverage':  {'fail': 0.06, 'warn': 0.10},
        'proof_surfaces':  {'fail': 1,    'warn': 2},
        'section_count':   {'fail': 4,    'warn': 8},
    },
}

# metric → (kind, direction): 'min' means value must be ≥ threshold;
# 'max' means ≤. `where` says how the value is picked off a page's
# viewport records.
_LOWER_BETTER = {'dead_space_vps', 'dead_space_ratio',
                 'hierarchy_violations'}


def _vertical(ctx):
    dna = ctx.read('DNA.json')
    if dna:
        try:
            vp = json.loads(dna).get('vertical_profile') or ''
            if vp.startswith('profile-'):
                return vp[len('profile-'):]
            if vp:
                return vp
        except Exception:
            pass
    return 'default'


def _value(page, metric):
    """Aggregate one metric across a page's viewport records."""
    vps = page.get('viewports') or {}
    vals = []
    if metric == 'contrast_min_ratio':
        for w, m in vps.items():
            if m.get('contrast_min_ratio') is not None:
                vals.append(m['contrast_min_ratio'])
        dark = page.get('contrast_dark') or {}
        if dark.get('ratio') is not None:
            vals.append(dark['ratio'])
        return min(vals) if vals else None
    if metric == 'dead_space_vps':
        for m in vps.values():
            ds = m.get('dead_space') or {}
            if ds.get('max_run_viewports') is not None:
                vals.append(ds['max_run_viewports'])
        return max(vals) if vals else None
    if metric == 'dead_space_ratio':
        for m in vps.values():
            ds = m.get('dead_space') or {}
            if ds.get('ratio') is not None:
                vals.append(ds['ratio'])
        return max(vals) if vals else None
    if metric == 'tap_target_min_px':
        for m in vps.values():
            if m.get('tap_target_min_px') is not None:
                vals.append(m['tap_target_min_px'])
        return min(vals) if vals else None
    if metric == 'hierarchy_violations':
        for m in vps.values():
            vals.append(len(m.get('hierarchy_violations') or []))
        return max(vals) if vals else None
    primary = vps.get('1280') or (next(iter(vps.values())) if vps else {})
    return primary.get(metric)


def evaluate(measure, vertical):
    """The judgment itself — pure function of MEASURE.json + vertical.
    fixtures and the real run share it so findings cannot drift."""
    th = dict(BASE_THRESHOLDS)
    th.update(VERTICAL_THRESHOLDS.get(vertical) or {})
    findings = []
    for slug, page in sorted((measure.get('pages') or {}).items()):
        for metric, lim in th.items():
            value = _value(page, metric)
            if value is None:
                continue
            if metric in _LOWER_BETTER:
                bad = value > lim['fail']
                soft = value > lim['warn']
                op = '<='
            else:
                bad = value < lim['fail']
                soft = value < lim['warn']
                op = '>='
            if bad:
                sev, ref = 'fail', lim['fail']
            elif soft:
                sev, ref = 'warn', lim['warn']
            else:
                continue
            findings.append({
                'rule': 'J.12',
                'page': slug,
                'metric': metric,
                'value': value,
                'op': op,
                'threshold': ref,
                'severity': sev,
                'pass': sev != 'fail',
            })
    return findings, th


def judge_doc(measure, ctx):
    """JUDGE.json body — shared by the real run and fixtures."""
    vertical = _vertical(ctx)
    findings, th = evaluate(measure, vertical)
    verdict = 'fail' if any(f['severity'] == 'fail'
                          for f in findings) else 'pass'
    return {
        'tool': 'judge.py',
        'version': 1,
        'vertical': vertical,
        'dist_sha256': measure.get('dist_sha256'),
        'measure_sha256': None,
        'thresholds': th,
        'findings': findings,
        'verdict': verdict,
    }


def main(argv):
    if len(argv) < 2:
        print(__doc__)
        return 2
    ctx = gate.Ctx(os.path.abspath(argv[1]))
    raw = ctx.read('MEASURE.json')
    if raw is None:
        doc = {
            'tool': 'judge.py', 'version': 1,
            'vertical': _vertical(ctx),
            'dist_sha256': None, 'measure_sha256': None,
            'findings': [{'rule': 'J.11', 'metric': 'measured_evidence',
                          'severity': 'fail', 'pass': False,
                          'note': 'MEASURE.json missing — the w7 '
                                  'measure step must run first'}],
            'verdict': 'fail',
        }
    else:
        try:
            measure = json.loads(raw)
        except Exception as e:
            print(f'judge: MEASURE.json unparseable: {e}')
            return 1
        doc = judge_doc(measure, ctx)
        doc['measure_sha256'] = hashlib.sha256(
            raw.encode()).hexdigest()[:16]
        if measure.get('dist_sha256') != gate._dist_sha(ctx):
            doc['verdict'] = 'fail'
            doc['findings'].append({
                'rule': 'J.11', 'metric': 'measured_evidence',
                'severity': 'fail', 'pass': False,
                'note': 'MEASURE.json dist_sha256 does not match the '
                        'current dist — re-run measure.py'})
    fp = os.path.join(ctx.dir, 'JUDGE.json')
    with open(fp, 'w') as fh:
        json.dump(doc, fh, indent=1, sort_keys=True)
    nf = sum(1 for f in doc['findings'] if f['severity'] == 'fail')
    nw = sum(1 for f in doc['findings'] if f['severity'] == 'warn')
    print(f'judge: {doc["verdict"]} — {nf} fail, {nw} warn '
          f'→ JUDGE.json')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
