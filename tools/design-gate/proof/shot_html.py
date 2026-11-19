#!/usr/bin/env python3
"""shot_html.py — rasterise ADAPTED markup to PNG for VLM judgment.
The retrieve path's renderer: real retrieved markup + the DNA's
var block + the adapt sheet, screenshotted by headless chromium
(same engine bank_shots used — comparable pixels).

  shot_html.py job.json

job: {"out": "path.png", "width": 1280, "height": 800,
      "markup": "<section…", "css": "adapt sheet + dna vars scope",
      "vars": {"--bg":…}} — vars are emitted as a [data-dna] block.
Deterministic given the same inputs; runs inside .venv (playwright).
"""
import json
import sys

PAGE = """<!doctype html><html><head><meta charset="utf-8">
<script src="https://cdn.tailwindcss.com"></script>
<style>
*{box-sizing:border-box;margin:0}
body{margin:0;background:#fff}
.block{container-type:inline-size}
__CSS__
</style></head><body>
__MARKUP__
</body></html>"""


def main(job_path):
    job = json.load(open(job_path))
    css = job.get('css', '')
    sc = job.get('scope', 'opt')
    vars_css = ';'.join(f'{k}:{v}' for k, v in
                        sorted((job.get('vars') or {}).items()))
    if vars_css:
        css += f'[data-dna="{sc}"]{{{vars_css}}}'
    html = (PAGE.replace('__CSS__', css)
            .replace('__MARKUP__', job['markup']))
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={'width': job['width'],
                                   'height': job['height']})
        pg.set_content(html, wait_until='load')
        pg.wait_for_timeout(300)
        pg.screenshot(path=job['out'])
        br.close()


if __name__ == '__main__':
    main(sys.argv[1])
