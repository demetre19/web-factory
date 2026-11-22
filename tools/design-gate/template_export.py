#!/usr/bin/env python3
"""template_export — save a built page as a named HTML template.

The operator assigns templates to real pages afterwards ("service",
"home", "location"…), so the export name comes from the plan's
page_type, not the slug. Reads the built dist HTML (terminal artefact)
and writes <pdir>/templates/<page_type>.html plus TEMPLATES.json.

Usage: template_export.py <page-dir>
"""
import json
import os
import re
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import site_folder as SF  # noqa: E402


def _page_type(pdir):
    txt = open(os.path.join(pdir, 'DESIGN-PLAN.md')).read()
    m = re.search(r'^\s*page_type:\s*["\']?([\w-]+)', txt, re.M)
    if not m:
        raise SystemExit(f'{pdir}: DESIGN-PLAN.md has no page_type')
    return m.group(1)


def main():
    pdir = os.path.abspath(sys.argv[1])
    site, slug = SF.site_of(pdir) or (None, None)
    # the standalone .html artifact is the canonical page (pipeline_emit
    # --html); a dist-only dir (pre-html emit or a bare --astro run)
    # falls back to the built page
    src = (os.path.join(pdir, 'site', 'html', slug + '.html')
           if slug else None)
    if not src or not os.path.isfile(src):
        dist = os.path.join(pdir, 'site', 'dist')
        src = (os.path.join(dist, slug, 'index.html')
               if slug else None)
        if not src or not os.path.isfile(src):
            src = os.path.join(dist, 'index.html')
    if not src or not os.path.isfile(src):
        raise SystemExit(f'{pdir}: no html artifact at {src} — '
                         'run w6 first')
    ptype = _page_type(pdir)
    out_dir = os.path.join(pdir, 'templates')
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, f'{ptype}.html')
    txt = open(src, encoding='utf-8').read()
    # the artifact resolves dist assets as '../dist/…' from site/html/;
    # templates/ sits a level higher, so the same refs rebase one more
    # directory up — '../site/dist/…' reaches the real build output
    if os.sep.join(['site', 'html']) in src.replace(os.sep, '/'):
        txt = txt.replace('../dist/', '../site/dist/')
    open(out, 'w', encoding='utf-8').write(txt)
    man = {'page_type': ptype, 'template': f'templates/{ptype}.html',
           'source': os.path.relpath(src, pdir)}
    json.dump(man, open(os.path.join(out_dir, 'TEMPLATES.json'), 'w'),
              indent=1)
    print(f'template: {ptype} → templates/{ptype}.html '
          f'({os.path.getsize(out)} bytes)')


if __name__ == '__main__':
    main()
