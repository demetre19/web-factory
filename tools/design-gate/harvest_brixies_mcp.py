#!/usr/bin/env python3
"""Brixies harvest via the MCP server (@brixies-mcp/server) — the
sanctioned path: server handles auth + CF + quota. Key lives in
.mcp.json env (gitignored) or SECRETS.

  python3 harvest_brixies_mcp.py [--rate 8.0] [--dry]

Flow: tools/call get_brixies_filters -> category list;
search_brixies_layouts/components per category -> ids;
get_brixies_item_json per id -> templates/skeletons/brixies/
<category>/<slug>.json. Resume-safe (skips banked files).
"""
import json
import os
import select
import subprocess
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(ROOT, 'templates', 'skeletons', 'brixies')
LOG = '/tmp/brixies-mcp-harvest.log'
CATEGORIES = ['CTA Sections', 'Hero Sections', 'Feature Sections',
 'Cards', 'Blog Sections', 'FAQ Sections', 'Testimonial Sections',
 'Pricing Sections', 'Contact Sections', 'Gallery Sections',
 'Process Sections', 'Timeline Sections', 'Team Sections',
 'Logo Sections', 'Forms', 'Headers', 'Footers', 'Slider Sections',
 'Table Sections', 'Counter Sections', 'Social Proof Sections',
 'Banner Section', 'Accordions', 'Button Group', 'Nav Bars',
 'Content Sections', 'Career Sections', 'Cart Sections',
 'Bottom Navigation Bar']

def api_key():
    k = os.environ.get('BRIXIES_API_KEY', '').strip()
    if k:
        return k
    try:
        cfg = json.load(open(os.path.join(ROOT, '.mcp.json')))
        return cfg['mcpServers']['brixies']['env']['BRIXIES_API_KEY']
    except Exception:
        return ''

class MCP:
    def __init__(self):
        env = dict(os.environ)
        env['BRIXIES_API_KEY'] = api_key()
        env['BRIXIES_API_URL'] = 'https://brixies.co/wp-json/brixies/v1'
        self.p = subprocess.Popen(
            ['npx', '--yes', '@brixies-mcp/server@latest'],
            stdin=subprocess.PIPE, stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL, text=True, env=env, bufsize=1)
        self.n = 0

    def _send(self, method, params):
        self.n += 1
        self.p.stdin.write(json.dumps(
            {'jsonrpc': '2.0', 'id': self.n,
             'method': method, 'params': params}) + '\n')
        self.p.stdin.flush()
        return self.n

    def _read(self, rid, timeout=90):
        t0 = time.time()
        while time.time() - t0 < timeout:
            if select.select([self.p.stdout], [], [], 2)[0]:
                line = self.p.stdout.readline()
                if not line:
                    break
                try:
                    d = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if d.get('id') == rid:
                    return d
        return None

    def call(self, tool, args):
        rid = self._send('tools/call',
                         {'name': tool, 'arguments': args})
        r = self._read(rid)
        if not r or 'error' in r:
            return None, str(r)[:200]
        out = r['result']
        for c in out.get('content', []):
            if c.get('type') == 'text':
                try:
                    return json.loads(c['text']), None
                except json.JSONDecodeError:
                    return c['text'], None
        return out, None

    def init(self):
        self._send('initialize', {
            'protocolVersion': '2025-03-26', 'capabilities': {},
            'clientInfo': {'name': 'wf-harvest', 'version': '1'}})
        self._read(self.n)
        self._send('notifications/initialized', {})

    def kill(self):
        try:
            self.p.kill()
        except Exception:
            pass


def banked(category):
    d = os.path.join(OUT, category)
    if not os.path.isdir(d):
        return set()
    return {os.path.splitext(f)[0] for f in os.listdir(d)
            if f.endswith('.json')}


def main():
    rate = float(sys.argv[sys.argv.index('--rate') + 1]) \
        if '--rate' in sys.argv else 8.0
    dry = '--dry' in sys.argv
    m = MCP()
    m.init()
    print('mcp up', flush=True)

    cats, err = m.call('get_brixies_filters', {})
    print('filters:', str(cats)[:400], flush=True)
    if dry:
        m.kill()
        return

    import re
    done = errs = skipped = 0
    os.makedirs(OUT, exist_ok=True)
    seen = set()
    for tool in ('search_brixies_layouts',
                 'search_brixies_components'):
        for cat in CATEGORIES:
            res, err = m.call(
                tool, {'query': cat, 'limit': 60})
            if not res or not isinstance(res, str):
                continue
            found = re.findall(
                r'\((ID: \d+)\)', res)
            for fid in found:
                iid = fid.split(':')[1].strip()
                if iid in seen:
                    continue
                seen.add(iid)
                slug = f'{cat.lower().replace(" ", "-")}-{iid}'
                path = os.path.join(
                    OUT, cat.lower().replace(' ', '-'),
                    slug + '.json')
                if os.path.exists(path):
                    skipped += 1
                    continue
                os.makedirs(os.path.dirname(path), exist_ok=True)
                payload, e = m.call(
                    'get_brixies_item_json', {'id': int(iid)})
                if isinstance(payload, str) and '429' in payload:
                    print('429 daily cap — stopping', flush=True)
                    m.kill()
                    print(f'STOP banked={done} skipped={skipped} '
                          f'errs={errs}', flush=True)
                    return
                if payload and not isinstance(payload, str):
                    json.dump({'id': iid, 'category': cat,
                               'json': payload},
                              open(path, 'w'), indent=1)
                    done += 1
                    if done % 10 == 0:
                        print(f'  {done} banked {slug}', flush=True)
                else:
                    errs += 1
                time.sleep(rate)
    m.kill()
    print(f'DONE banked={done} skipped={skipped} errs={errs}',
          flush=True)


if __name__ == '__main__':
    main()
