#!/usr/bin/env python3.12
"""Mobbin iOS screen mining — MCP search_screens results → skeleton bank.

Input: a results JSON of MCP `search_screens` calls (paid plan required —
the calls run agent-side, this script only transforms their JSON):
    {"families": {"ios-<family>": {"query": "...", "screens": [
        {"id", "image_url", "mobbin_url", "app_name", "platform"}]}}}

Output per exemplar in templates/skeletons/mobbin/ios-<family>/:
<id8>-<appslug>.webp + .topo.json + .spec.json — the same reference-only,
unvectorised stub convention as mobbin_mine.py, plus the spec's `tags`
block ({section_class, topology_class, style[], category[], mode,
platform}) the iOS package requires. `mode` is detected from the
downloaded image (ImageMagick mean luminance), never an LLM pass.

Usage: mobbin_mine_ios.py <results.json> [--index-only]
"""
import json, re, subprocess, sys, time, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BANK = ROOT / 'templates' / 'skeletons' / 'mobbin'
UA = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 '
                    'Chrome/126 Safari/537.36'}
LICENCE = ('reference-only: Mobbin screenshots are licensed browsing '
           'content, not redistributable assets. Banked for topology/'
           'pattern study, not for copying into emitted output.')
# iOS families are SCREEN classes (not web marketing sections): the
# section_class tag carries the UX family the retrieval layer asks for.
SECTION_CLASS = {
    'ios-tab-bars': 'navigation', 'ios-drawers': 'navigation',
    'ios-sheets': 'overlay', 'ios-onboarding': 'flow',
    'ios-settings': 'utility', 'ios-paywalls': 'monetisation',
    'ios-empty-states': 'feedback', 'ios-auth': 'flow',
}


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')[:24] or 'app'


def luminance_mode(path):
    """mean pixel luminance 0-255 via ImageMagick → light|dark."""
    try:
        out = subprocess.run(
            ['convert', str(path) + '[0]', '-resize', '1x1!', '-colorspace',
             'gray', '-format', '%[fx:mean*255]', 'info:'],
            capture_output=True, text=True, timeout=30)
        return 'light' if float(out.stdout.strip() or 128) >= 128 else 'dark'
    except Exception:
        return 'light'


def topo_stub(family, scr):
    return {
        'label': f"{scr['app_name']} — {family}",
        'source': 'mobbin',
        'sourceUrl': scr['mobbin_url'],
        'version': '1',
        'topology_id': family,
        'kind': 'screen', 'platform': 'ios',
        'title': f"{scr['app_name']} {family} screen",
        'nesting_depth': None, 'direction_ratio': None,
        'edge_hints': [], 'seam_style': None, 'column_schedule': None,
        'acss_tokens': [], 'bends': [],
        'semantic_labels': [family.replace('ios-', '').replace('-', '_')],
        'note': 'unvectorised exemplar — mined image reference; topology '
                'fields to be filled by the vectorisation pass',
    }


def spec_stub(family, scr, img_name, mode):
    fam = family[4:] if family.startswith('ios-') else family
    return {
        'id': scr['id'],
        'title': f"{scr['app_name']} {fam}",
        'type': 'screen',
        'category': [fam],
        'elements': [],
        'style_tags': [mode],
        'use_case': fam,
        'framework': 'agnostic',
        'complexity': 'unscored',
        'plugins': [],
        'mobbin_id': scr['id'],
        'mobbin_url': scr['mobbin_url'],
        'site_name': scr['app_name'],
        'platform': 'ios',
        'featured_image': img_name,
        'matched_topo': None,
        'is_new_topology': True,
        'tags': {
            'section_class': SECTION_CLASS.get(family, fam),
            'topology_class': fam,
            'style': [],
            'category': [],
            'mode': mode,
            'platform': 'ios',
        },
        'queries': [scr.get('_query', '')],
        'short_description': f"{scr['app_name']} {fam} screen (ios)",
        'licence': LICENCE,
    }


def main():
    results = json.loads(Path(sys.argv[1]).read_text())['families']
    index_only = '--index-only' in sys.argv
    gaps, index = [], {}
    for family, data in sorted(results.items()):
        d = BANK / family
        stems = sorted(p.name[:-10] for p in d.glob('*.topo.json'))
        index[family] = stems
        if index_only:
            continue
        d.mkdir(parents=True, exist_ok=True)
        n = 0
        for scr in data['screens']:
            scr = dict(scr, _query=data.get('query', ''))
            stem = f"{scr['id'][:8]}-{slug(scr['app_name'])}"
            img = d / f'{stem}.webp'
            if not img.exists():
                try:
                    req = urllib.request.Request(
                        scr['image_url'], headers=UA)
                    with urllib.request.urlopen(req, timeout=40) as r:
                        img.write_bytes(r.read())
                    time.sleep(0.3)
                except Exception as e:                    # noqa: BLE001
                    gaps.append(f'{family}/{stem}: img '
                                f'{type(e).__name__}')
                    continue
            mode = luminance_mode(img)
            (d / f'{stem}.topo.json').write_text(json.dumps(
                topo_stub(family, scr), indent=2) + '\n')
            (d / f'{stem}.spec.json').write_text(json.dumps(
                spec_stub(family, scr, img.name, mode), indent=2) + '\n')
            n += 1
        print(f'  {family}: {n} exemplars', flush=True)
    # index everything ios-* on disk — a partial run must not drop
    # families banked by earlier runs
    index = {d.name: sorted(p.name[:-10] for p in d.glob('*.topo.json'))
             for d in sorted(BANK.glob('ios-*')) if d.is_dir()}
    tags = {}
    tp = BANK / 'mobbin-tags.json'
    if tp.exists():
        tags = json.loads(tp.read_text())
    tags['ios'] = index
    tp.write_text(json.dumps(tags, indent=1) + '\n')
    (BANK / 'IOS-INDEX.md').write_text(
        '# Mobbin iOS bank — mined exemplar index\n\n'
        'Source: MCP `search_screens platform=ios` (paid plan). Stubs are '
        'unvectorised reference material (spec.licence = reference-only);\n'
        'the vectorisation pass fills topology semantics. `mode` is\n'
        'measured from the image (mean luminance), not classified.\n\n'
        '| family | section_class | exemplars |\n|---|---|---|\n' +
        ''.join(f"| {f} | {SECTION_CLASS.get(f, f[4:])} | "
                f"{len(index.get(f, []))} |\n" for f in sorted(index)))
    print(f'DONE families={len(index)} gaps={len(gaps)}')
    for g in gaps:
        print('  GAP', g)


if __name__ == '__main__':
    main()
