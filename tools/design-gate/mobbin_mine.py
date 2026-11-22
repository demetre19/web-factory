#!/usr/bin/env python3.12
"""Mobbin elements+screens mining — public explore pages → skeleton bank.

MCP search_screens is paywalled on the connected plan, so this mines the
public /explore/{platform}/ui-elements|screens/<slug> pages: each screen card
in the SSR HTML carries aria-label (title), img alt (app) and a bytescale
srcset (pick 1440w). Output per exemplar: <slug>-<n>.webp + .topo.json +
.spec.json, following the bricksmaven/brixies bank schema. Reference-only
material (design study, not redistributable) — noted in every spec.

Usage: mobbin_mine.py [elements-web|elements-ios|screens-web|screens-ios|all]
Writes into templates/skeletons/mobbin/{elements,screens}/<slug>/ plus
MOBBIN-INDEX.md + mobbin-tags.json + GAP-REPORT.md.
"""
import json, re, sys, time, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BANK = ROOT / 'templates' / 'skeletons' / 'mobbin'
UA = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 '
                    'Chrome/126 Safari/537.36'}

# Mobbin canonical UI-elements taxonomy (explore page order, with count >0).
ELEMENTS = [
    # control
    'accordion', 'accordion-table', 'breadcrumbs', 'button',
    'button-animation', 'checkbox', 'checklist-design', 'color-picker',
    'combobox', 'date-picker', 'design-form', 'drag-and-drop-file-upload',
    'dropdown-button', 'editable-text', 'file-upload',
    'floating-action-button', 'link', 'pagination', 'radio-button',
    'rating-control', 'search-bar', 'segmented-control', 'select', 'slider',
    'stepper', 'switch', 'tab', 'text-field', 'tile', 'time-picker',
    'ux-buttons', 'upgrade-button',
    # imagery
    'avatar', 'icon', 'illustration', 'logo', 'photo',
    # overlay / navigation
    'coach-marks', 'context-menu', 'dialog', 'drawer', 'dropdown-menu',
    'filter-panel-ui', 'full-screen-overlay', 'modal-ui', 'navigation-menu',
    'popover', 'toast', 'tooltip',
]
# Page-level screens taxonomy (coordinator list + mobbin screen categories).
# Resolved against mobbin's real slugs at runtime (resolve_slugs).
SCREENS = [
    'signup', 'login', 'forgot-password', 'verification', 'onboarding',
    'account-setup', 'guided-tour-tutorial', 'my-account', 'settings',
    'profile', 'home', 'search', 'notifications', 'empty-state',
    'dashboard', 'checkout', 'pricing', 'contact', 'help-support',
    'error', 'subscription-paywall', 'welcome-get-started',
]
# ios lives at /explore/mobile and auth flows are flows, not screens.
IOS_FLOW_SCREENS = {
    'signup': 'creating-account', 'login': 'logging-in',
    'onboarding': 'onboarding-images',
}
_URL_PLATFORM = {'web': 'web', 'ios': 'mobile'}


def resolve_slugs(kind, platform, wanted):
    """Map wanted taxonomy names onto slugs the site actually serves."""
    up = _URL_PLATFORM[platform]
    if kind == 'element':
        return wanted                        # ui-elements slugs are canonical
    idx = fetch(f'https://mobbin.com/explore/{up}/screens') or fetch(
        f'https://mobbin.com/explore/{up}')
    have = set(re.findall(
        rf'/explore/{up}/screens/([a-z0-9-]+)', idx)) | set(
        re.findall(rf'/explore/{up}/flows/([a-z0-9-]+)', idx))
    out, misses = [], []
    for w in wanted:
        if w in have:
            out.append((w, 'screens', w))
            continue
        if platform == 'ios' and w in IOS_FLOW_SCREENS:
            out.append((w, 'flows', IOS_FLOW_SCREENS[w]))
            continue
        cand = sorted(s for s in have
                      if w in s or s in w or
                      w.replace('-', '') in s.replace('-', ''))
        if cand:
            best = min(cand, key=len)
            base = 'flows' if re.search(
                rf'/explore/{up}/flows/{best}\\b', idx) else 'screens'
            out.append((w, base, best))
        else:
            misses.append(w)
    return out, misses
KEEP = 3            # exemplars per taxonomy dir
LICENCE = ('reference-only: Mobbin screenshots are licensed browsing '
           'content, not redistributable assets. Banked for topology/'
           'pattern study, not for copying into emitted output.')


def fetch(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read().decode('utf-8', 'replace')


def cards(html):
    """Yield (title, app, mobbin_url, img_url) per screen card in DOM order."""
    out = []
    # mobile pages: <a href="/explore/screens/UUID"><img alt="APP iOS screen
    # containing X UI element" src=...>
    for m in re.finditer(
            r'href="(/explore/screens/[0-9a-f-]{36})"[^>]*>'
            r'\s*<img[^>]*alt="([^"]+)"[^>]*src="([^"]+)"', html, re.S):
        href, alt, url = m.groups()
        if 'bytescale' not in url:
            continue
        app = re.sub(r'\s+(iOS|Android|Web)\s+screen.*', '', alt)
        out.append((alt, app, 'https://mobbin.com' + href, url))
    # each card: <a aria-label="TITLE" ... href="/screen/..."><img alt="APP screen" src/srcset=...>
    for m in re.finditer(
            r'aria-label="([^"]{2,90})"[^>]*href="(/[^"]*?screen[^"]*)"(.*?)'
            r'</a>', html, re.S):
        title, href, inner = m.groups()
        alt = re.search(r'alt="([^"]*?)\s*screen', inner)
        im = re.search(r'srcset="([^"]+)"', inner) or \
            re.search(r'src="([^"]+)"', inner)
        if not im:
            continue
        srcs = im.group(1)
        if 'srcset' in im.group(0) or ', ' in srcs:
            cand = [s.strip().split(' ')[0] for s in srcs.split(',')
                    if '1440w' in s] or \
                   [s.strip().split(' ')[0] for s in srcs.split(',')]
            url = cand[0]
        else:
            url = srcs.split()[0]
        if 'bytescale' not in url:
            continue
        out.append((title, alt.group(1) if alt else 'unknown',
                    'https://mobbin.com' + href, url))
    return out


def topo_stub(slug, kind, platform, title):
    return {
        'topology_id': f'{slug}-{platform}',
        'kind': kind, 'platform': platform, 'title': title,
        'nesting_depth': None, 'direction_ratio': None,
        'edge_hints': [], 'seam_style': None, 'column_schedule': None,
        'acss_tokens': [], 'bends': [],
        'semantic_labels': [slug],
        'note': 'unvectorised exemplar — mined image reference; topology '
                'fields to be filled by the vectorisation pass',
    }


def spec_stub(slug, kind, platform, title, app, url, img, category):
    return {
        'id': f'mobbin-{kind}-{slug}-{platform}',
        'title': title, 'type': kind,
        'category': [category] if category else [slug],
        'elements': [slug] if kind == 'element' else [],
        'style_tags': [], 'framework': 'agnostic',
        'complexity': 'unscored',
        'platform': platform,
        'source': {'site': app, 'url': url, 'image': img},
        'licence': LICENCE,
        'description': f'{title} — {app} ({platform} {kind})',
    }


def mine(taxonomy, kind, platform, out_root):
    gaps, made = [], 0
    up = _URL_PLATFORM[platform]
    resolved = resolve_slugs(kind, platform, taxonomy)
    if kind == 'screen':
        items, misses = resolved
        for m in misses:
            gaps.append(f'{kind}/{platform}/{m}: no slug on explore index')
    else:
        items = [(s, 'ui-elements', s) for s in taxonomy]
    if platform == 'ios' and kind == 'screen':
        for w, base, best in items:
            if w in IOS_FLOW_SCREENS and best != IOS_FLOW_SCREENS[w]:
                pass                     # keep index-resolved slug
    for want, base, slug in items:
        url = f'https://mobbin.com/explore/{up}/{base}/{slug}'
        try:
            html = fetch(url)
        except Exception as e:                      # noqa: BLE001
            gaps.append(f'{kind}/{platform}/{slug}: fetch {type(e).__name__}')
            continue
        cs = cards(html)
        if not cs and base == 'flows':
            seen_u = []
            for u in re.findall(
                    r'https://bytescale\.mobbin\.com/[^"\\\s]+?\.webp'
                    r'\?[^"\\\s]+', html):
                if '1440w' in u or ' ' not in u:
                    u = u.split(' ')[0]
                    if u not in seen_u:
                        seen_u.append(u)
            cs = [(f'{slug} flow step', 'unknown',
                   'https://mobbin.com' + url, u)
                  for u in seen_u[:KEEP]]
        if not cs:
            gaps.append(f'{kind}/{platform}/{want} ({base}/{slug}): '
                        f'no cards parsed (page {len(html)}B)')
            continue
        d = out_root / want
        d.mkdir(parents=True, exist_ok=True)
        n = 0
        seen = set()
        for title, app, murl, img in cs:
            if img in seen or n >= KEEP:
                continue
            seen.add(img)
            stem = f'{want}-{platform}-{n}'
            try:
                req = urllib.request.Request(img, headers=UA)
                with urllib.request.urlopen(req, timeout=40) as r, \
                        open(d / f'{stem}.webp', 'wb') as f:
                    f.write(r.read())
            except Exception as e:                  # noqa: BLE001
                gaps.append(f'{slug}/{platform}: img {type(e).__name__}')
                continue
            (d / f'{stem}.topo.json').write_text(json.dumps(
                topo_stub(want, kind, platform, title), indent=2) + '\n')
            (d / f'{stem}.spec.json').write_text(json.dumps(
                spec_stub(want, kind, platform, title, app, murl, img,
                          f'{kind}:{want}'), indent=2) + '\n')
            n += 1
        made += n
        time.sleep(0.4)
        print(f'  {kind}/{platform}/{want} <- {base}/{slug}: {n}',
              flush=True)
    return gaps, made


def main():
    groups = sys.argv[1:] or ['all']
    if groups == ['all']:
        groups = ['elements-web', 'elements-ios', 'screens-web',
                  'screens-ios']
    gaps, total = [], 0
    index = {'elements': {}, 'screens': {}}
    for g in groups:
        kind, platform = (('element', g.split('-')[1]) if g.startswith('elem')
                          else ('screen', g.split('-')[1]))
        out = BANK / ('elements' if kind == 'element' else 'screens')
        tax = ELEMENTS if kind == 'element' else SCREENS
        print(f'== {g}: {len(tax)} taxonomy items', flush=True)
        g2, n = mine(tax, kind, platform, out)
        gaps += g2
        total += n
        for d in sorted(out.iterdir()):
            if d.is_dir():
                index['elements' if kind == 'element' else 'screens'][
                    f'{d.name}/{platform}'] = sorted(
                        p.stem for p in d.glob('*.topo.json'))
    (BANK / 'mobbin-tags.json').write_text(json.dumps(index, indent=1))
    prev = BANK / 'GAP-REPORT.md'
    keep = []
    if prev.exists():
        keep = [l for l in prev.read_text().splitlines()
                if l.startswith('- ')]
    (BANK / 'GAP-REPORT.md').write_text(
        '# Mobbin mining gap report\n\n'
        f'exemplars written this run: {total}\n\n'
        '## misses / needs-attention\n' +
        ('\n'.join(sorted(set(keep + ['- ' + g for g in gaps])))
         if gaps or keep else 'none') + '\n')
    print(f'DONE total={total} gaps={len(gaps)}', flush=True)


if __name__ == '__main__':
    main()
