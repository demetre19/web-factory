#!/usr/bin/env python3
"""Regenerate the RECIPES array in templates/motion/index.html and the
README recipe table from each templates/motion/<id>/recipe.md frontmatter.
Single source of truth: recipe.md taxonomy block + its H1 description.

Usage: python3 docs/machinery/design/motion/gen-catalogue.py [--check]
  --check   print what would change, do not write
"""
import glob
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__),
                                    '..', '..', '..', '..'))
MOTION = os.path.join(ROOT, 'templates', 'motion')

def key(fm, k):
    m = re.search(rf'^  {k}: (.+)$', fm, re.M)
    return m.group(1).strip() if m else ''

def rows():
    out = []
    for f in sorted(glob.glob(os.path.join(MOTION, '*', 'recipe.md'))):
        rid = os.path.basename(os.path.dirname(f))
        s = open(f, encoding='utf-8').read()
        fm = s.split('---')[1]
        h1 = re.search(r'^# (.+)$', s, re.M).group(1)
        desc = h1.split('—', 1)[1].strip() if '—' in h1 else h1
        tags = ('{trigger} · {technique} · {timing_class} · {loop_type} · '
                '{budget} · js:{js_dependency}').format(
                    trigger=key(fm, 'trigger'),
                    technique=key(fm, 'technique'),
                    timing_class=key(fm, 'timing_class'),
                    loop_type=key(fm, 'loop_type'),
                    budget=key(fm, 'budget'),
                    js_dependency=key(fm, 'js_dependency'))
        out.append((rid, desc, tags, key(fm, 'trigger'), key(fm, 'js_dependency')))
    return out

def catalogue_js(rows):
    lines = ['const RECIPES = [']
    for rid, desc, tags, _, _ in rows:
        d = desc.replace('\\', '\\\\').replace('"', '\\"')
        lines.append(f' ["{rid}","{d}","{tags}"],')
    lines.append('];')
    return '\n'.join(lines)

def readme_table(rows):
    lines = ['| Recipe | Pattern | Trigger | JS |', '|---|---|---|---|']
    for rid, desc, _, trig, js in rows:
        lines.append(f'| {rid} | {desc} | {trig} | {js} |')
    return '\n'.join(lines)

def main():
    rs = rows()
    idx_path = os.path.join(MOTION, 'index.html')
    idx = open(idx_path, encoding='utf-8').read()
    new_block = catalogue_js(rs)
    new_idx = re.sub(r'const RECIPES = \[.*?\];', new_block, idx,
                     count=1, flags=re.S)
    readme_path = os.path.join(MOTION, 'README.md')
    rm = open(readme_path, encoding='utf-8').read()
    new_table = readme_table(rs)
    new_rm = re.sub(r'\| Recipe \| Pattern \| Trigger \| JS \|.*?(?=\n\n|\Z)',
                    new_table, rm, count=1, flags=re.S)
    if '--check' in sys.argv:
        if new_idx != idx:
            print('index.html: RECIPES block differs')
        if new_rm != rm:
            print('README.md: table differs')
        if new_idx == idx and new_rm == rm:
            print('up to date')
        return
    open(idx_path, 'w', encoding='utf-8').write(new_idx)
    open(readme_path, 'w', encoding='utf-8').write(new_rm)
    print(f'wrote {len(rs)} recipes to index.html + README.md')

if __name__ == '__main__':
    main()
