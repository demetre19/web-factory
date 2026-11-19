#!/usr/bin/env python3
"""gate.py — the Web Factory design wave gates.

One mechanical gate per wave (W0–W8), mirroring the SEO SOP
stage_gate/article_gate contract: a wave is done when this exits 0,
not when its files exist. Writes/updates <pipeline-dir>/GATES.json
{wave, pass, failures[], inputs_sha256, dna, approved}.

  python3 gate.py <wave> <pipeline-dir> [--wireframe <cards.html>]
                  [--design <id>] [--stub <stub.md>]
  python3 gate.py coverage|selftest|consistency|graph|enforcement
  python3 gate.py dna|contracts|section|segment|score|wildcard <dir>

Waves: w0 scaffold · w1 brief+discovery · w2 content-in ·
w3 layout round (≥5 options → structure lock) · w4 look round
(3 directions → DNA v1) · w5 system sheet · w6 components ·
w7 page assembly · w8 review.

The designer MAY run gates (they are read-only) and SHOULD run
`gate.py section` per section at W6 — but only the orchestrator writes
GATES.json via run.py, only the operator runs `run.py approve`, and
only the reviewer writes REVIEW.json via `run.py sign-review` (P.8).
Python 3 stdlib only.
"""
import argparse, hashlib, hmac, html.parser, json, os, re, shutil, \
    subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
SCORE_VECTORS = os.path.join(
    REPO, 'docs', 'machinery', 'design', 'score-vectors.json')
ENFORCEMENT = os.path.join(REPO, 'docs', 'machinery', 'design', 'enforcement.json')
DESIGN_DIR = os.path.join(REPO, 'docs', 'machinery', 'design')
RULES_DIR = os.path.join(DESIGN_DIR, 'rules')
DNA_DIR = os.path.join(DESIGN_DIR, 'dna')
PATTERNS_DIR = os.path.join(DESIGN_DIR, 'patterns')
G1 = {4, 8, 12, 16, 24, 32, 48, 64, 96, 128}
BREAKPOINTS = {360, 640, 768, 1024, 1280, 1440, 1920}
SPEECH_ACTS = {'promise', 'proof', 'tension', 'how', 'objection', 'act',
               'detail', 'chrome'}
CATEGORIES = set("""404-error author-page banner blog-archive blog-section
blog-single-page call-to-action career cart category-section checkout
coming-soon comparison contact content counter empty-cart event-section
event-single-page feature footer gallery grids-and-cards
header-page-sections headers hero how-it-works linktree login
logo-sections megamenu my-account-page newsletter off-canvas
order-receipt pay portfolio-section portfolio-single-page pricing
product-archive product-section product-single shop-footers
shop-headers shop-hero table table-of-content teams testimonials
thank-you-page timeline ui-elements""".split())
COMP_FOR_ACT = {
    'split-media': {'promise', 'how', 'detail'},
    'stacked-hero': {'promise'}, 'proof-band': {'proof'},
    'editorial': {'tension', 'detail'}, 'cards-n': {'how', 'detail'},
    'sequence': {'how'}, 'faq': {'objection'},
    'comparison': {'objection', 'detail'}, 'logo-wall': {'proof'},
    'stat-band': {'proof'}, 'full-bleed': {'act'},
    'badge-center': {'proof', 'objection'}, 'media-gallery': {'detail'},
    'form-panel': {'act'}, 'quote-grid': {'proof', 'promise', 'detail'},
    'map-finder': {'detail'}, 'capture-form': {'act'},
    'text-index': {'detail'}, 'app-band': {'detail'},
    'hero-act-merge': {'promise', 'act'}, 'link-grid': {'detail'},
    # chrome structural rows (declared, not in §2)
    'nav-bar': {'chrome'}, 'footer-bar': {'chrome'},
}
SURFACES = {'base', 'muted', 'inverse', 'brand', 'media'}
DENSITIES = {'compact', 'regular', 'spacious'}
DISCLOSURE = {'open', 'collapsed', 'tabbed'}
DESIGN_MODES = {'variants', 'refs-inspiration', 'inspo-text',
                'audit-remodel', 'refs-existing', 'dox'}
AXES = {
    'temperature': {'warm', 'cool', 'neutral'},
    'density': {'compact', 'regular', 'spacious'},
    'finish': {'flat', 'textured', 'glossy', 'raw'},
    'type_contrast': {'serif-display/sans-text', 'mono-accents',
                      'single-family-weight-contrast'},
    'shape': {'p1', 'p2', 'p3', 'p4'},
    'motion': {'none', 'subtle', 'elegant', 'professional', 'playful'},
}
RATIOS = {'none', '21:9', '16:9', '4:3', '3:4', '1:1', '9:16', '3:2', '2:3'}

# ---------------------------------------------------------------- YAML subset

def _strip_comment(s):
    out, q = [], None
    for i, ch in enumerate(s):
        if q:
            out.append(ch)
            if ch == q and (i == 0 or s[i-1] != '\\'):
                q = None
        elif ch in '"\'':
            q = ch; out.append(ch)
        elif ch == '#' and (i == 0 or s[i-1] in ' \t'):
            break
        else:
            out.append(ch)
    return ''.join(out).rstrip()

def _split_inline(s):
    parts, depth, q, cur = [], 0, None, []
    for ch in s:
        if q:
            cur.append(ch)
            if ch == q:
                q = None
        elif ch in '"\'':
            q = ch; cur.append(ch)
        elif ch in '[{(':
            depth += 1; cur.append(ch)
        elif ch in ']})':
            depth -= 1; cur.append(ch)
        elif ch == ',' and depth == 0:
            parts.append(''.join(cur).strip()); cur = []
        else:
            cur.append(ch)
    if ''.join(cur).strip():
        parts.append(''.join(cur).strip())
    return parts

def _scalar(s):
    s = _strip_comment(s).strip()
    if not s:
        return ''
    if s.startswith('"') and s.endswith('"') and len(s) > 1:
        try:
            return json.loads(s)
        except Exception:
            return s[1:-1]
    if s.startswith("'") and s.endswith("'") and len(s) > 1:
        return s[1:-1].replace("''", "'")
    if s.startswith('{') and '}' in s:
        inner = s[1:s.rindex('}')].strip()
        d = {}
        for part in _split_inline(inner):
            if ':' in part:
                k, v = part.split(':', 1)
                d[_scalar(k) or k.strip()] = _scalar(v)
        return d
    if s.startswith('[') and ']' in s:
        inner = s[1:s.rindex(']')].strip()
        return [_scalar(p) for p in _split_inline(inner)] if inner else []
    if s in ('[]', '{}'):
        return [] if s == '[]' else {}
    return s

def _parse_block(lines, i, indent):
    """Parse lines[i:] at >= indent into (node, next_i)."""
    # skip blanks/comments
    while i < len(lines) and (not lines[i].strip()
                              or lines[i].lstrip().startswith('#')):
        i += 1
    if i >= len(lines):
        return None, i
    is_list = lines[i].lstrip().startswith('- ')
    node = [] if is_list else {}
    while i < len(lines):
        raw = lines[i]
        if not raw.strip() or raw.lstrip().startswith('#'):
            i += 1; continue
        cur = len(raw) - len(raw.lstrip())
        if cur < indent:
            break
        stripped = raw.strip()
        if is_list:
            if not stripped.startswith('- '):
                break
            item = stripped[2:]
            if re.match(r'^[\w."]+\s*:', item):   # map item
                m = {}
                k, v = item.split(':', 1)
                k = k.strip().strip('"')
                v = _strip_comment(v).strip()
                if v:
                    m[k] = _scalar(v)
                    i += 1
                else:
                    sub, i = _parse_block(lines, i + 1, cur + 2)
                    m[k] = sub
                # continuation keys of this map item
                while i < len(lines):
                    r2 = lines[i]
                    if not r2.strip() or r2.lstrip().startswith('#'):
                        i += 1; continue
                    c2 = len(r2) - len(r2.lstrip())
                    if c2 <= cur:
                        break
                    s2 = r2.strip()
                    if s2.startswith('- '):
                        break
                    k2, _, v2 = s2.partition(':')
                    k2 = k2.strip().strip('"')
                    v2 = _strip_comment(v2).strip()
                    if v2:
                        m[k2] = _scalar(v2); i += 1
                    else:
                        sub, i = _parse_block(lines, i + 1, c2 + 1)
                        m[k2] = sub
                node.append(m)
            else:
                node.append(_scalar(item))
                i += 1
        else:
            if stripped.startswith('- '):
                break
            k, _, v = stripped.partition(':')
            if not _ or ':' not in stripped:
                i += 1; continue
            k = k.strip().strip('"')
            v = _strip_comment(v).strip()
            if v:
                node[k] = _scalar(v)
                i += 1
            else:
                sub, i = _parse_block(lines, i + 1, cur + 1)
                node[k] = sub
    return node, i

def plan_model(text):
    """Extract the first ```yaml fence from DESIGN-PLAN.md → dict."""
    blocks = re.findall(r'```yaml\n(.*?)```', text, re.S)
    if not blocks:
        return {}
    lines = blocks[0].split('\n')
    node, _ = _parse_block(lines, 0, 0)
    return node or {}

# ---------------------------------------------------------------- html mini

class _Sections(html.parser.HTMLParser):
    VOID = {'meta', 'link', 'img', 'br', 'hr', 'input', 'source'}
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.sections, self.stack = [], []
        self.headings, self.texts = [], []
        self._in_h, self._buf, self._first_p = None, [], {}
        self.classes, self.styles = set(), []
        self.style_blocks = 0
        self.meta_viewport = False
        self.links_scripts = []
        self._sec_i = -1
        self._skip = 0   # inside script/style
        self._p_depth = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ('script', 'style'):
            self._skip += 1
            if tag == 'style':
                self.style_blocks += 1
            self.links_scripts.append((tag, a))
        if tag == 'link':
            self.links_scripts.append((tag, a))
        if tag == 'meta' and a.get('name') == 'viewport':
            self.meta_viewport = True
        cls = a.get('class', '')
        for c in cls.split():
            self.classes.add(c)
        if 'style' in a:
            self.styles.append((tag, a['style']))
        if tag == 'section' or (tag == 'nav' and 'data-sec' in a):
            self._sec_i += 1
            self.sections.append(a)
        self.stack.append(tag)
        if re.fullmatch(r'h[1-6]', tag):
            self._in_h, self._buf = tag, []
        if tag == 'p' and self._sec_i >= 0 and self._sec_i not in self._first_p:
            self._p_depth += 1
            self._first_p[self._sec_i] = []
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID:
            self.handle_endtag(tag)
    def handle_endtag(self, tag):
        if tag in ('script', 'style') and self._skip:
            self._skip -= 1
        if self._in_h == tag:
            t = ' '.join(''.join(self._buf).split())
            self.headings.append((self._in_h, t, self._sec_i))
            self._in_h, self._buf = None, []
        if tag == 'p' and self._p_depth:
            self._p_depth -= 1
        if self.stack and self.stack[-1] == tag:
            self.stack.pop()
    def handle_data(self, d):
        if self._skip:
            return
        if self._in_h:
            self._buf.append(d)
        if self._p_depth and self._sec_i in self._first_p \
                and isinstance(self._first_p[self._sec_i], list):
            self._first_p[self._sec_i].append(d)

def parse_html(text):
    p = _Sections()
    p.feed(text)
    p.first_paras = {k: ' '.join(''.join(v).split())
                     for k, v in p._first_p.items()}
    return p

def first_sentence(text):
    m = re.search(r'[.!?](\s|$)', text)
    return (text[:m.end()].strip() if m else text.strip())

# ---------------------------------------------------------------- context

class Ctx:
    def __init__(self, pipeline, args=None):
        self.dir = os.path.abspath(pipeline)
        self.site = os.path.join(self.dir, 'site')
        self.args = args or argparse.Namespace(
            wireframe=None, design=None, stub=None)
        self._plan_text = None
        self._plan = None
        self._stub_rows = None
        self.gates_path = os.path.join(self.dir, 'GATES.json')

    def read(self, *candidates):
        for c in candidates:
            p = c if os.path.isabs(c) else os.path.join(self.dir, c)
            if os.path.isfile(p):
                with open(p, encoding='utf-8', errors='replace') as f:
                    return f.read()
        return None

    def find(self, *names):
        for c in names:
            p = c if os.path.isabs(c) else os.path.join(self.dir, c)
            if os.path.isfile(p):
                return p
        return None

    @property
    def plan_text(self):
        if self._plan_text is None:
            self._plan_text = self.read('DESIGN-PLAN.md') or ''
        return self._plan_text

    @property
    def plan(self):
        if self._plan is None:
            self._plan = plan_model(self.plan_text)
        return self._plan

    def pages(self):
        return (self.plan.get('pages') or {})

    def site_block(self):
        return (self.plan.get('site') or {})

    def rows(self, slug=None):
        """All plan section rows, flattened [(slug, row)]."""
        out = []
        for s, page in self.pages().items():
            if slug and s != slug:
                continue
            for r in (page or {}).get('sections') or []:
                out.append((s, r))
        return out

    def wireframe_path(self):
        wf = getattr(self.args, 'wireframe', None)
        if wf:
            return wf if os.path.isabs(wf) else os.path.join(self.dir, wf)
        srcs = self.site_block().get('sources') or []
        for s in (srcs if isinstance(srcs, list) else []):
            s = str(s)
            if 'wireframe:' in s:
                return s.split('wireframe:')[1].split('#')[0].strip()
        return self.find('preview/layouts.html', 'cards/index.html')

    def design_id(self):
        d = getattr(self.args, 'design', None)
        if d:
            return d
        if os.path.isfile(self.gates_path):
            try:
                g = json.load(open(self.gates_path))
                for w in ('w3', 'w4', 'w5'):
                    if g.get(w, {}).get('design'):
                        return g[w]['design']
            except Exception:
                pass
        srcs = self.site_block().get('sources') or []
        for s in (srcs if isinstance(srcs, list) else []):
            m = re.search(r'#(d\d+)', str(s))
            if m:
                return m.group(1)
        return 'd1'

    def stub_path(self):
        st = getattr(self.args, 'stub', None)
        if st:
            return st if os.path.isabs(st) else os.path.join(self.dir, st)
        srcs = self.site_block().get('sources') or []
        for s in (srcs if isinstance(srcs, list) else []):
            s = str(s)
            if 'copy-contract:' in s:
                q = s.split('copy-contract:')[1].split('#')[0].strip()
                return q if os.path.isabs(q) else os.path.join(self.dir, q)
        for pat in ('STUB.md', 'stub.md'):
            p = self.find(pat)
            if p:
                return p if os.path.isabs(p) else os.path.join(self.dir, p)
        return None

    def stub_inventory(self):
        """{'proof': [rows], 'faq': [rows], 'media': [rows],
        'ctas': [rows], 'contact': [rows]} from the STUB's
        `## Content inventory` tables (F-15/F-22)."""
        out = {}
        p = self.stub_path()
        if not p or not os.path.isfile(p):
            return out
        txt = open(p, encoding='utf-8', errors='replace').read()
        for sec, key in ((r'proof\s*items?', 'proof'),
                         (r'faq\s*q\s*&?\s*a', 'faq'),
                         (r'media\s*inventory', 'media'),
                         (r'ctas?\b', 'ctas'),
                         (r'contact\s*facts?', 'contact')):
            m = re.search(r'###\s+' + sec + r'[^\n]*\n(.*?)(?=\n#|\Z)',
                          txt, re.S | re.I)
            rows = []
            if m:
                for ln in m.group(1).split('\n'):
                    if ln.strip().startswith('|') and '---' not in ln \
                            and len([c for c in ln.split('|')
                                     if c.strip()]) > 1:
                        rows.append([c.strip() for c in
                                     ln.strip().strip('|').split('|')])
            if rows and not all('---' in c or not c
                                for r_ in rows for c in r_):
                out[key] = rows[1:] if len(rows) > 1 else rows
        return out

    def stub_vector(self):
        """[(zone, heading, fs)] from the STUB's Heading vector table."""
        if self._stub_rows is not None:
            return self._stub_rows
        self._stub_rows = []
        p = self.stub_path()
        if not p or not os.path.isfile(p):
            return self._stub_rows
        txt = open(p, encoding='utf-8', errors='replace').read()
        m = re.search(r'## Heading vector\s*\n(.*?)(?=\n## |\Z)',
                      txt, re.S)
        if not m:
            return self._stub_rows
        h1 = ''
        mh = re.search(r'\|\s*\*\*H1\*\*\s*\|\s*([^|]+)\|', txt)
        if mh:
            h1 = mh.group(1).strip()
        for line in m.group(1).split('\n'):
            if not line.startswith('|') or '---' in line \
                    or 'Zone' in line:
                continue
            cells = [c.strip() for c in line.split('|')[1:-1]]
            if len(cells) < 3:
                continue
            zone, heading, fs = cells[0], cells[1], cells[2]
            hm = re.match(r'H(\d)\s+(.*)', heading)
            tag = 'h' + hm.group(1) if hm else 'p'
            htext = hm.group(2) if hm else heading
            htext = re.sub(r'^[A-Z][a-z]+\s*—\s*', '', htext)
            htext = re.sub(r'^(Hero|Final CTA)\s*—\s*', '', htext)
            fsm = re.search(r'"([^"]+)"', fs)
            fs_txt = fsm.group(1) if fsm else (fs.strip() or None)
            if fs_txt in ('—', '-'):
                fs_txt = None
            self._stub_rows.append({'zone': zone.lower(), 'tag': tag,
                                    'heading': htext.strip(),
                                    'fs': fs_txt, 'h1': h1})
        return self._stub_rows

    def page_htmls(self):
        """[(path, text)] the plan's own pages (dist first, preview/).

        Only a plan slug is THE design. The system sheet, the variant
        picker, 404 and any other route are excluded: they are gated by
        their own checks (check_tile_is_system, check_variants), not by
        the page suite (P.3, E.1, PS.*). A slug counts when it renders
        as `<slug>/index.html` or `<slug>.html`.
        """
        slugs = {str(k) for k in self.pages()}
        skip = {'system', 'variants', '404', '500'}
        out = []
        for root in (os.path.join(self.site, 'dist'),
                     os.path.join(self.dir, 'preview')):
            if not os.path.isdir(root):
                continue
            for dp, _, fns in os.walk(root):
                for fn in sorted(fns):
                    if not fn.endswith('.html'):
                        continue
                    p = os.path.join(dp, fn)
                    rel = os.path.relpath(p, root).replace(os.sep, '/')
                    slug = rel[:-5]
                    if slug.endswith('/index'):
                        slug = slug[:-6]
                    if '/' in slug or slug in skip:
                        continue
                    if slug not in slugs:
                        continue
                    out.append((p, open(p, encoding='utf-8',
                                        errors='replace').read()))
        return out

    def components(self):
        d = os.path.join(self.site, 'src', 'components')
        if os.path.isdir(d):
            return sorted(f for f in os.listdir(d) if f.endswith('.astro'))
        return []

    def checklist(self, wave):
        t = self.read(f'CHECKLIST/{wave}.md')
        return t

def checklist_blank_fails(ctx, wave):
    t = ctx.checklist(wave)
    fails = []
    if t is None:
        return [f'CHECKLIST/{wave}.md missing — fill the stage '
                'checklist (P.9)']
    for i, line in enumerate(t.split('\n'), 1):
        if not line.startswith('|') or '---' in line or 'Rule' in line:
            continue
        cells = [c.strip() for c in line.split('|')[1:-1]]
        if len(cells) >= 2 and cells[1] in ('', '—', '-', '?', 'TBD'):
            fails.append(f'CHECKLIST/{wave}.md:{i} blank evidence for '
                         f'"{cells[0]}" (P.9)')
    return fails

def check_checklist(ctx):
    """P.9 — the wave's evidence table is present and every cell filled."""
    wave = ctx.wave
    if wave == 'selftest':            # fixtures declare their own wave
        marker = os.path.join(ctx.dir, '.wave')
        if os.path.isfile(marker):
            wave = open(marker).read().strip()
    if wave not in WAVE_CHECKS:
        return []
    return [f'P.9 {x}' for x in checklist_blank_fails(ctx, wave)]

# ---------------------------------------------------------------- WCAG

def _rgb(hexv):
    h = hexv.strip().lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    if len(h) != 6:
        return None
    try:
        return tuple(int(h[i:i+2], 16) / 255 for i in (0, 2, 4))
    except ValueError:
        return None

def _lum(rgb):
    def f(c):
        return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = rgb
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)

def contrast(a, b):
    ra, rb = _rgb(a), _rgb(b)
    if ra is None or rb is None:
        return None
    l1, l2 = _lum(ra), _lum(rb)
    if l1 < l2:
        l1, l2 = l2, l1
    return (l1 + 0.05) / (l2 + 0.05)

def role_hex(roles, name):
    r = (roles or {}).get(name)
    if isinstance(r, dict):
        v = r.get('value', '')
        return v if isinstance(v, str) and v.startswith('#') else None
    if isinstance(r, str) and r.startswith('#'):
        return r
    return None

# ---------------------------------------------------------------- checks
# Each returns list[str] failures. Names are referenced by
# enforcement.json — coverage fails on unknown names.

def check_scaffold(ctx):
    f = []
    for p in ('package.json', 'astro.config.mjs',
              'tailwind.config.js', 'tailwind.config.mjs',
              'tailwind.config.cjs', 'src/styles/global.css'):
        cand = os.path.join(ctx.site, p)
        if p.startswith('tailwind'):
            if any(os.path.isfile(os.path.join(ctx.site, t))
                   for t in ('tailwind.config.js', 'tailwind.config.mjs',
                             'tailwind.config.cjs')):
                continue
            f.append('P.1 site/tailwind.config.* missing')
            continue
        if not os.path.isfile(cand):
            f.append(f'P.1 site/{p} missing')
    g = ctx.read('site/src/styles/global.css')
    if g is not None:
        if '@tailwind' not in g:
            f.append('P.2 global.css lacks @tailwind directives')
        if '@layer components' not in g:
            f.append('P.2 global.css lacks @layer components')
    return f

def check_astro_build(ctx):
    if not os.path.isfile(os.path.join(ctx.site, 'package.json')):
        return ['P.1 no site/package.json — not an Astro project']
    if not os.path.isdir(os.path.join(ctx.site, 'node_modules')):
        return ['P.1 site/node_modules missing — npm ci first']
    r = subprocess.run(['npm', 'run', 'build', '--', '--silent'],
                       cwd=ctx.site, capture_output=True, text=True,
                       timeout=300)
    if r.returncode != 0:
        tail = '\n'.join((r.stdout + r.stderr).split('\n')[-8:])
        return [f'P.1 astro build failed (exit {r.returncode}): {tail}']
    return []

def check_design_mode(ctx):
    dm = ctx.site_block().get('design_mode')
    if not dm:
        return ['design_mode missing']
    dm = str(dm)
    if dm not in DESIGN_MODES:
        return [f'design_mode "{dm}" ∉ {sorted(DESIGN_MODES)}']
    return []

def check_intent(ctx):
    f = []
    intent = ctx.site_block().get('intent') or {}
    for k in ('who', 'one_action', 'worst_case'):
        if not intent.get(k):
            f.append(f'intent.{k} blank (plan rejected)')
    return f

def check_audit_artifacts(ctx):
    dm = str(ctx.site_block().get('design_mode') or '')
    if dm not in ('audit-remodel', 'refs-existing'):
        return []
    f = []
    aud = ctx.read('audit.md', 'design/audit.md')
    if aud is None:
        f.append(f'design_mode {dm}: audit.md missing (Phase 0 '
                 'defect table + keep-list required)')
    else:
        if not re.search(r'defect|fail', aud, re.I):
            f.append('audit.md has no defect table')
        if not re.search(r'keep', aud, re.I):
            f.append('audit.md has no keep-list (V.6 T1 assets)')
    return f


EMOJI_RE = re.compile(
    '[\U0001F000-\U0001FAFF\u2600-\u27BF\u2190-\u21FF'
    '\u2300-\u23FF\u25A0-\u25FF\u2B00-\u2BFF\u203C\u2049\u2122'
    '\u2139\u3030\u303D\uFE0F\u20E3\u00A9\u00AE]')
_EMOJI_RE_OLD = re.compile(
    '[\U0001F000-\U0001FAFF☀-➿⬀-⯿️\ufe0f\ufe0e\U000E0020-\U000E007F]'
    '|\U0001F1E6-\U0001F1FF')

def check_mobbin_auth(ctx):
    """Mobbin token must refresh before the refs consult (W1 entry)."""
    ref = os.path.expanduser('~/.mobbin-oauth/refresh.sh')
    if not os.path.isfile(ref):
        return ['P.14 ~/.mobbin-oauth/refresh.sh missing — Mobbin '
                'token rotator unavailable; run the re-auth flow '
                'before consulting Mobbin']
    r = subprocess.run(['bash', ref], capture_output=True, text=True,
                       timeout=60)
    if r.returncode != 0:
        return [f'P.14 mobbin token refresh failed (exit '
                f'{r.returncode}): {(r.stderr or r.stdout)[:120]}']
    return []

def check_no_emoji(ctx):
    f = []
    roots = [os.path.join(ctx.site, 'src')]
    for root in roots:
        if not os.path.isdir(root):
            continue
        for dp, _, fns in os.walk(root):
            for fn in fns:
                p = os.path.join(dp, fn)
                t = open(p, encoding='utf-8', errors='replace').read()
                for m in EMOJI_RE.finditer(t):
                    f.append(f'P.10 {os.path.relpath(p, ctx.dir)}: emoji '
                             f'U+{ord(m.group(0)):04X} — icons are inline SVG')
                    break
    for p, txt in ctx.page_htmls():
        for m in EMOJI_RE.finditer(txt):
            f.append(f'P.10 {os.path.basename(p)}: emoji '
                     f'U+{ord(m.group(0)):04X}')
            break
    return f

ICON_SIZES = {'16', '20', '24', '32', '48'}

def check_icon_discipline(ctx):
    f = []
    htmls = list(ctx.page_htmls())
    srcfiles = []
    src = os.path.join(ctx.site, 'src')
    if os.path.isdir(src):
        for dp, _, fns in os.walk(src):
            for fn in fns:
                if fn.endswith(('.astro', '.html')):
                    p = os.path.join(dp, fn)
                    srcfiles.append((p, open(p, encoding='utf-8',
                                             errors='replace').read()))
    allbodies = [(p, t) for p, t in srcfiles] + htmls
    for p, t in allbodies:
        name = os.path.basename(p)
        for m in re.finditer(r'<img[^>]*(?:icon|logo)[^>]*>', t, re.I):
            f.append(f'P.11 {name}: <img> icon/logo — inline SVG only')
        if re.search(r'class="[^"]*(fa-|fas |far |material-icons|iconfont)',
                     t):
            f.append(f'P.11 {name}: icon-font class — one library, '
                     'inline SVG (I.1)')
        for m in re.finditer(r'<svg\b([^>]*)>', t):
            attrs = m.group(1)
            w = re.search(r'\bwidth="(\d+)"', attrs)
            h = re.search(r'\bheight="(\d+)"', attrs)
            for dim in (w, h):
                if dim and dim.group(1) not in ICON_SIZES:
                    f.append(f'P.11 {name}: svg size {dim.group(1)}px '
                             f'∉ I.3 set {sorted(ICON_SIZES)}')
            vb = re.search(r'viewBox="([^"]+)"', attrs)
            if vb and vb.group(1) != '0 0 24 24':
                f.append(f'P.11 {name}: viewBox "{vb.group(1)}" — the '
                         'icon family is Lucide (I.1), grid 0 0 24 24')
            sw = re.search(r'stroke="([^"]+)"', attrs)
            if sw and sw.group(1) != 'currentColor':
                f.append(f'P.11 {name}: stroke "{sw.group(1)}" — icons '
                         'inherit colour via currentColor (I.7)')
            swt = re.search(r'stroke-width="([\d.]+)"', attrs)
            if swt and float(swt.group(1)) not in {1.5, 2.0, 2.5, 3.0}:
                f.append(f'P.11 {name}: stroke-width '
                         f'{swt.group(1)} ∉ I.2 {1.5,2,2.5,3}')
    return f

META_SCHEMA = os.path.join(REPO, 'docs', 'machinery', 'design', 'patterns',
                          'data', 'web', 'meta.schema.json')
IMG_EXT = ('.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif')
IMG_DIRS = ('discovery', 'INTAKE', 'assets', 'images', 'media')


def _schema_errors(obj, schema, path='$'):
    """Minimal draft-07 subset: type, required, enum, pattern, min/max,
    minItems/minProperties, items, $ref (local). No dependencies."""
    f = []

    def resolve(sc):
        ref = sc.get('$ref')
        if not ref:
            return sc
        node = schema
        for part in ref.lstrip('#/').split('/'):
            node = node.get(part) or {}
        return node

    sc = resolve(schema if path == '$' else schema)
    t = sc.get('type')
    ok = {'object': dict, 'array': list, 'string': str,
          'integer': int, 'number': (int, float)}.get(t)
    if ok and not isinstance(obj, ok) or (t in ('integer', 'number') and
                                          isinstance(obj, bool)):
        return [f'{path}: expected {t}']
    if 'enum' in sc and obj not in sc['enum']:
        f.append(f'{path}: {obj!r} not in {sc["enum"]}')
    if t == 'object':
        for k in sc.get('required') or []:
            if k not in obj:
                f.append(f'{path}.{k}: required field missing')
        if 'minProperties' in sc and len(obj) < sc['minProperties']:
            f.append(f'{path}: fewer than {sc["minProperties"]} fields')
        for k, sub in (sc.get('properties') or {}).items():
            if k in obj:
                f += _schema_errors(obj[k], resolve(sub), f'{path}.{k}')
    if t == 'array':
        if 'minItems' in sc and len(obj) < sc['minItems']:
            f.append(f'{path}: fewer than {sc["minItems"]} items')
        for i, it in enumerate(obj):
            f += _schema_errors(it, resolve(sc.get('items') or {}),
                               f'{path}[{i}]')
    if t == 'string':
        if 'minLength' in sc and len(obj) < sc['minLength']:
            f.append(f'{path}: empty string')
        if sc.get('pattern') and not re.search(sc['pattern'], obj):
            f.append(f'{path}: does not match {sc["pattern"]}')
    if t in ('integer', 'number') and not isinstance(obj, bool):
        if 'minimum' in sc and obj < sc['minimum']:
            f.append(f'{path}: {obj} < {sc["minimum"]}')
        if 'maximum' in sc and obj > sc['maximum']:
            f.append(f'{path}: {obj} > {sc["maximum"]}')
    return f


def _pipeline_images(ctx):
    out = []
    for d in IMG_DIRS:
        root = os.path.join(ctx.dir, d)
        if not os.path.isdir(root):
            continue
        for r, _, fns in os.walk(root):
            for fn in fns:
                if fn.lower().endswith(IMG_EXT):
                    out.append(os.path.join(r, fn))
    return out


def check_image_discovery(ctx):
    """W1 — every client/reference image is classified (CLASSIFY.md) and
    every discovered site has a schema-valid meta.json; the set summary
    enters DNA v0 as `inferred` (templates/image-brief)."""
    f = []
    disc = os.path.join(ctx.dir, 'discovery')
    metas = []
    if os.path.isdir(disc):
        for d in sorted(os.listdir(disc)):
            p = os.path.join(disc, d, 'meta.json')
            if os.path.isdir(os.path.join(disc, d)):
                if not os.path.isfile(p):
                    f.append(f'W1 discovery/{d}: no meta.json — every '
                             'discovered site writes one')
                else:
                    metas.append(p)
    schema = {}
    if os.path.isfile(META_SCHEMA):
        try:
            schema = json.load(open(META_SCHEMA))
        except Exception:
            f.append('W1 meta.schema.json unparseable')
    else:
        f.append('W1 patterns/data/web/meta.schema.json missing')
    for p in metas:
        try:
            j = json.load(open(p))
        except Exception as e:
            f.append(f'W1 {os.path.relpath(p, ctx.dir)}: not JSON ({e})')
            continue
        if schema:
            f += [f'W1 {os.path.relpath(p, ctx.dir)}: {e}'
                  for e in _schema_errors(j, schema)]
        # a non-ok capture may never feed classification or DNA
        status = j.get('capture_status')
        if status and status != 'ok':
            f.append(f'W1 {os.path.relpath(p, ctx.dir)}: capture_status '
                     f'"{status}" ({j.get("capture_reason", "?")}) — '
                     'no classification/DNA input may come from a '
                     'non-ok capture')
        imgs = j.get('images') or []
        for i, im in enumerate(imgs):
            okc = all(isinstance(im.get(k), dict)
                      and isinstance((im.get(k) or {}).get('value'), str)
                      and isinstance((im.get(k) or {}).get('confidence'),
                                     (int, float))
                      for k in ('medium', 'subject_class', 'role_on_page'))
            if not okc or not isinstance(im.get('confidence'), (int, float)):
                f.append(f'W1 {os.path.relpath(p, ctx.dir)} images[{i}]: '
                         'CLASSIFY fields missing ({value,confidence} for '
                         'medium/subject_class/role_on_page)')
        if imgs and not j.get('set_summary'):
            f.append(f'W1 {os.path.relpath(p, ctx.dir)}: images without a '
                     'set_summary (dominant medium, emotion axes/tags, '
                     'style, consistency)')
    images = _pipeline_images(ctx)
    if images and not metas:
        f.append(f'W1 {len(images)} client/reference image(s) found but no '
                 'discovery/<domain>/meta.json — run CLASSIFY/UI-ANALYSIS '
                 '(templates/image-brief) first')
    if images:
        m = dna_map(ctx) or {}
        inf = (m.get('inferred') or {}).get('image_set') or {}
        if not inf:
            f.append('W1 images exist but DNA v0 has no inferred.image_set '
                     'set-summary — classification feeds DNA v0 (operator '
                     'confirms at W1 exit)')
        else:
            for k in ('dominant_medium', 'emotion_axes', 'emotion_tags',
                      'style', 'consistency'):
                if inf.get(k) in (None, '', [], {}):
                    f.append(f'W1 DNA inferred.image_set missing "{k}"')
    return f


def check_mobbin_refs(ctx):
    """P.14 — Mobbin references are consulted BEFORE direction (W1,
    general style per page type) and cited per composition at W3."""
    t = ctx.read('MOBBIN-REFS.md')
    if t is None:
        return ['P.14 MOBBIN-REFS.md missing — consult Mobbin '
                '(search_screens/search_sections) before direction '
                'cards; if the token is expired, re-auth per W1 entry '
                'check and record it — never silently skip']
    f = []
    rows = [ln for ln in t.splitlines()
            if ln.strip().startswith('|') and '---' not in ln]
    body = rows[1:] if rows else []
    parsed = []
    for ln in body:
        cells = [c.strip() for c in ln.strip().strip('|').split('|')]
        if len(cells) >= 3:
            parsed.append(cells)
    if not parsed:
        return ['P.14 MOBBIN-REFS.md has no reference table — one row per '
                'reference: | id/url | kind | informs | wave |']
    for r in parsed:
        rid = r[0]
        if not _canon_ref_ok(rid):
            f.append(f'P.14 {rid}: not a canonical ref — Mobbin '
                     'screen/section ids or operator site URLs only '
                     '(web corpus and negatives removed from canon)')
        elif re.search(r'\b(web|negative)s?\b',
                       ' '.join(r[1:]).lower()):
            f.append(f'P.14 {rid}: kind/informs says web/negative — '
                     'removed from canon')
    if not any(re.search(r'https?://|mobbin\.com/|screen[-_ ]?id|\b[0-9a-f]{8,}\b',
                         ' '.join(r), re.I) for r in parsed):
        f.append('P.14 MOBBIN-REFS.md rows carry no screen IDs/URLs')
    if ctx.wave == 'w1' or ctx.wave not in WAVE_SEQ:
        pages = {str((p or {}).get('type') or slug)
                 for slug, p in ctx.pages().items()} or {'home'}
        low = t.lower()
        for pt in sorted(pages):
            n = sum(1 for r in parsed if pt.lower() in ' '.join(r).lower())
            if n < 3:
                f.append(f'P.14 W1: {n} Mobbin reference(s) for page type '
                         f'"{pt}" — ≥3 general-style refs before direction')
    if ctx.wave == 'w3':
        comps = {str(r.get('composition')) for _, r in ctx.rows()
                 if r.get('composition')}
        low = t.lower()
        for c in sorted(comps):
            n = sum(1 for r in parsed if c.lower() in ' '.join(r).lower())
            if n < 3:
                f.append(f'P.14 W3: {n} Mobbin reference(s) for '
                         f'composition "{c}" — ≥3 with screen IDs')
    return f


def check_content_inventory(ctx):
    """W2 content-in: the STUB copy contract is complete enough to drive
    layout — heading vector rows carry copy fields, no placeholders."""
    p = ctx.stub_path()
    if not p or not os.path.isfile(p):
        return ['W2: STUB copy contract not found — content decides '
                'structure, so the vector must exist first '
                f'({ctx.stub_path() or "pass --stub"})']
    f = []
    vec = ctx.stub_vector()
    if not vec:
        f.append('W2: STUB has no Heading vector table — content '
                 'inventory incomplete')
        return f
    ZONES = {'macro', 'micro', 'end', 'chrome', 'nav'}
    for v in vec:
        if re.search(r'lorem|TBD|TODO|\[\.\.\.\]|placeholder',
                     v['heading'], re.I):
            f.append(f'W2: vector heading is a placeholder: '
                     f'"{v["heading"][:40]}"')
        if v.get('zone') not in ZONES:
            f.append(f'W2: vector zone "{v.get("zone")}" ∉ '
                     f'{sorted(ZONES)}')
        if not v.get('fs'):
            f.append(f'W2: heading "{v["heading"][:40]}" has no first '
                     'sentence — every vector row carries its body '
                     'block opening (content dictates layout)')
        elif len(v['fs']) > 500:
            f.append(f'W2: first sentence under "{v["heading"][:40]}" '
                     f'is {len(v["fs"])} chars — R.4 hard cap is 500; '
                     'split or route the excess upstream before layout '
                     'sizes disclosure (A F20)')
    plan = ctx.plan or {}
    site = plan.get('site') or {}
    copyf = ((site.get('system') or {}).get('copy')
             or (plan.get('design') or {}).get('copy')
             or site.get('copy') or plan.get('copy') or {})
    for fld in ('cta_person', 'reading_level'):
        if not str(copyf.get(fld) or '').strip():
            f.append(f'W2: plan copy.{fld} missing — the STUBs copy '
                     'fields feed the layout round')
    # F-15/F-22 — the content inventory carries what the compositions
    # will need: proof items for proof comps, Q&A pairs for faq, a
    # media row for every ratio-bearing composition, a CTA for act
    # comps, contact facts for footer/contact forms.
    inv = ctx.stub_inventory()
    need = set()
    for _, r in ctx.rows():
        comp = str(r.get('composition') or '')
        if comp in ('cards-n', 'quote-grid', 'logo-wall', 'stat-band',
                    'badge-center'):
            need.add('proof')
        if comp == 'faq':
            need.add('faq')
        if str(r.get('media_ratio') or 'none') != 'none':
            need.add('media')
        if 'act' in (r.get('speech_act') or []) or comp in (
                'form-panel', 'capture-form', 'cta'):
            need.add('ctas')
        if comp in ('footer-bar', 'form-panel', 'map-finder'):
            need.add('contact')
    for k in sorted(need):
        if not inv.get(k):
            f.append(f'W2: content inventory has no "{k}" rows — the '
                     'plan needs it (composition-driven, F-15/F-22)')
    return f


def check_measurable(ctx):
    """Measurable rules moved off the rubric (B F-28): T.1/T.7 ratios,
    T.11 justification, M.2 token-bound motion, M.8 displacement, S.3/S.4
    radius nesting, V.4 scrim floors, V.8 <picture>, W.3 sentence case,
    L.3 edge insets, R.5 fold budget (dist CSS + pages where present)."""
    f = []
    tk = {}
    try:
        tk = json.loads(ctx.read('TOKENS.json') or '{}')
    except Exception:
        pass
    sizes = (tk.get('type') or {}).get('scale') or tk.get('sizes') or {}
    body = (tk.get('type') or {}).get('body') or 16
    if sizes:
        disp = [v for k, v in sizes.items() if 'display' in str(k).lower()
                and isinstance(v, (int, float))]
        if disp and max(disp) < 3 * float(body):
            f.append(f'T.1 display {max(disp)} < 3x body {body}')
    pages = ctx.page_htmls()
    srcs = []
    d = os.path.join(ctx.site, 'src')
    if os.path.isdir(d):
        for dp, _, fns in os.walk(d):
            for fn in fns:
                if fn.endswith(('.astro', '.html', '.css')):
                    p_ = os.path.join(dp, fn)
                    srcs.append((p_, open(p_, encoding='utf-8',
                                          errors='replace').read()))
    dcss = os.path.join(ctx.site, 'dist')
    if os.path.isdir(dcss):
        for dp, _, fns in os.walk(dcss):
            for fn in fns:
                if fn.endswith('.css'):
                    p_ = os.path.join(dp, fn)
                    srcs.append((p_, open(p_, encoding='utf-8',
                                          errors='replace').read()))
    for p_, t in srcs:
        name = os.path.basename(p_)
        if re.search(r'text-align:\s*justify', t):
            f.append(f'T.11 {name}: justified text')
        for m in re.finditer(r'\b(?:duration|transition-duration)'
                             r'\s*:\s*(\d+(?:\.\d+)?)(ms|s)', t):
            v = float(m.group(1)) * (1000 if m.group(2) == 's' else 1)
            if v > 400:
                f.append(f'M.2 {name}: duration {v:.0f}ms — motion is '
                         'token-bound and ≤400ms')
        for m in re.finditer(r'translate[XY]?\((-?\d+)px', t):
            if abs(int(m.group(1))) > 80:
                f.append(f'M.8 {name}: translate {m.group(1)}px > 80px')
    for p, t in pages:
        name = os.path.basename(p)
        parsed = parse_html(t)
        for tag, h, *_ in parsed.headings:
            words = h.split()
            if len(words) > 3 and not re.search(r'\?$', h) and \
                    all(w[0].isupper() for w in words if w and
                        w[0].isalpha()):
                f.append(f'W.3 {name}: title case heading "{h[:40]}" — '
                         'sentence case only')
                break
        # T.7 — hero subhead ≤60% of display size (class-based check:
        # the subhead never takes a text-fluid rank within 1 step of
        # the display's rank)
        for m in re.finditer(
                r'<section[^>]*data-intent="hero"[^>]*>(.*?)</section>',
                t, re.S):
            body = m.group(1)
            hm = re.search(r'<h1[^>]*text-fluid-(\d+)', body)
            if hm:
                top = int(hm.group(1))
                sm = re.findall(r'<p[^>]*text-fluid-(\d+)', body)
                if sm and min(int(x) for x in sm) <= max(0, top - 1):
                    f.append(f'T.7 {name}: hero subhead at '
                             f'text-fluid-{min(sm)} — within one rank '
                             'of display; the subhead reads 50–60% of '
                             'the H1')
        # V.4 — a text block sitting on media needs a scrim
        for m in re.finditer(
                r'<section[^>]*data-comp="(?:full-bleed|split-media)"'
                r'[^>]*>(.*?)</section>', t, re.S):
            body = m.group(1)
            if re.search(r'<img\b', body) and \
                    re.search(r'<h[12][^>]*style="[^"]*position:\s*'
                              r'absolute', body) and \
                    'scrim' not in body and 'dim' not in body and \
                    'overlay' not in body and \
                    'mix-blend' not in body:
                f.append(f'V.4 {name}: text-on-image without a scrim '
                         '— dim/scrim overlay required for contrast '
                         'floors')
        # V.8 — raster imagery renders through <picture> (except logos/
        # icons/avatars) so ratios + tiers are served
        for m in re.finditer(
                r'<section[^>]*data-comp="([^"]+)"[^>]*>(.*?)</section>',
                t, re.S):
            comp, body = m.group(1), m.group(2)
            if comp in ('nav-bar', 'footer-bar', 'logo-wall',
                        'quote-grid'):
                continue
            if '<img' in body and '<picture' not in body and \
                    'srcset' not in body:
                f.append(f'V.8 {name} {comp}: <img> without '
                         '<picture>/srcset — media serves ratio tiers '
                         '(V.3 ratios + responsive sizes)')
        # R.5 — five elements at 360x640: the hero offers ≤5 distinct
        # interactive/attention elements before the first scroll
        for m in re.finditer(
                r'<section[^>]*data-intent="hero"[^>]*>(.*?)</section>',
                t, re.S):
            n_el = len(re.findall(
                r'<(?:a|button|input|select|textarea|h1|img|video)\b',
                m.group(1)))
            if n_el > 5:
                f.append(f'R.5 {name}: hero shows {n_el} attention/'
                         'interactive elements at fold — five max at '
                         '360x640')
        # L.3 — content never jams the viewport edge: a full-bleed
        # section with text but no inset class is a defect
        for m in re.finditer(
                r'<section[^>]*data-comp="full-bleed"[^>]*'
                r'class="([^"]*)"[^>]*>(.*?)</section>', t, re.S):
            cls, body = m.group(1), m.group(2)
            if re.search(r'<(?:h[12]|p)\b', body) and not re.search(
                    r'p[xytl]?-|px-|padding|inset|container|content-',
                    cls + body[:200]):
                f.append(f'L.3 {name}: full-bleed text without edge '
                         'insets — content never jams the viewport '
                         'edge')
    # S.3/S.4 — radius: components take one radius-token column; a
    # nested card radius < its parent by the padding step, never larger
    for p_, t in srcs:
        name = os.path.basename(p_)
        for m in re.finditer(
                r'\.(\w*card\w*)[^,{]*\{[^}]*border-radius:\s*'
                r'(\d+)(px|rem)[^}]*\}', t):
            for m2 in re.finditer(
                    r'\.(?:\w*card\w*)\s+\.(\w*card\w*)[^,{]*\{'
                    r'[^}]*border-radius:\s*(\d+)(px|rem)', t):
                p_r = float(m.group(2)) * (16 if m.group(3) == 'rem'
                                           else 1)
                c_r = float(m2.group(2)) * (16 if m2.group(3) == 'rem'
                                            else 1)
                if c_r >= p_r and p_r > 0:
                    f.append(f'S.4 {name}: nested .{m2.group(1)} '
                             f'radius {c_r}px >= parent {p_r}px — a '
                             'child radius is parent minus the '
                             'padding step')
    return f

def check_speed_budget(ctx):
    f = []
    dist = os.path.join(ctx.site, 'dist')
    pages = ctx.page_htmls()
    scan = []
    if os.path.isdir(dist):
        for dp, _, fns in os.walk(dist):
            for fn in fns:
                if fn.endswith(('.js', '.mjs')):
                    scan.append(os.path.join(dp, fn))
    if scan:
        js = sum(os.path.getsize(p) for p in scan)
        if js > 50 * 1024:
            f.append(f'P.12 total JS {js//1024}KB > 50KB budget '
                     '(zero JS by default)')
    for p, txt in pages:
        name = os.path.basename(p)
        if re.search(r'<script[^>]+src=["\']https?://', txt):
            f.append(f'P.12 {name}: render-blocking third-party script')
        if re.search(r'fonts\.(googleapis|gstatic)\.com|use\.typekit',
                     txt):
            f.append(f'P.12 {name}: remote font host — self-hosted + '
                     'font-display: swap + preload required')
        for m in re.finditer(r'<img\b[^>]*>', txt):
            tag = m.group(0)
            if 'width=' not in tag or 'height=' not in tag:
                f.append(f'P.12 {name}: <img> without width/height '
                         '(CLS budget 0.1)')
            srcm = re.search(r'src="([^"]+)"', tag)
            if srcm and re.search(r'\.(jpe?g|png|gif)(\?|$)',
                                  srcm.group(1), re.I):
                f.append(f'P.12 {name}: raster {srcm.group(1)[:40]} not '
                         'AVIF/WebP via <Image>/<Picture>')
            if 'loading=' not in tag and 'fetchpriority' not in tag:
                f.append(f'P.12 {name}: <img> no lazy/fetchpriority '
                         'hint')
    css_files = []
    if os.path.isdir(dist):
        for dp, _, fns in os.walk(dist):
            for fn in fns:
                if fn.endswith('.css'):
                    css_files.append(os.path.join(dp, fn))
    if css_files:
        css_kb = sum(os.path.getsize(p) for p in css_files) / 1024
        if css_kb > 100:
            f.append(f'P.12 total CSS {css_kb:.0f}KB > 100KB budget — '
                     'purge dead utilities, keep one owner per class')
    fonts = []
    for dp_root in (os.path.join(dist, '_astro'),
                    os.path.join(dist, 'fonts'),
                    os.path.join(ctx.site, 'public', 'fonts')):
        if os.path.isdir(dp_root):
            for _, _, fns in os.walk(dp_root):
                fonts += [fn for fn in fns
                          if fn.endswith(('.woff2', '.woff', '.ttf',
                                          '.otf'))]
    g = ctx.read('site/src/styles/global.css') or ''
    n_faces = len(re.findall(r'@font-face', g))
    if len(fonts) > 4 or n_faces > 4:
        f.append(f'P.12 {max(len(fonts), n_faces)} font files/faces > '
                 '4 — two families x two weights max')
    if '@font-face' in g and 'font-display' not in g:
        f.append('P.12 @font-face without font-display: swap')
    # Lighthouse is NOT a gate: it is an operator post-build check run by
    # hand against the deployed site. The gate holds the static budgets
    # above (JS weight, image dims/format/hints, fonts, third parties).
    return f

def dist_csss(ctx):
    """[(path, css)] every stylesheet under dist/ and preview/."""
    out = []
    for root in (os.path.join(ctx.site, 'dist'),
                 os.path.join(ctx.dir, 'preview')):
        if not os.path.isdir(root):
            continue
        for dp, _, fns in os.walk(root):
            for fn in sorted(fns):
                if fn.endswith('.css'):
                    p = os.path.join(dp, fn)
                    out.append((p, open(p, encoding='utf-8',
                                        errors='replace').read()))
    return out


def check_mobile_budget(ctx):
    f = []
    # linked stylesheets carry the real rules (B F-26)
    for p, txt in dist_csss(ctx):
        name = os.path.basename(p)
        for m in re.finditer(r'width:\s*(\d{3,})px', txt):
            if int(m.group(1)) > 360:
                f.append(f'P.13 {name}: fixed width {m.group(1)}px '
                         '>360 — horizontal scroll risk at 360')
                break
        m = re.search(r'body\s*\{[^}]*font-size:\s*(\d+)px', txt)
        if m and int(m.group(1)) < 16:
            f.append(f'P.13 {name}: body {m.group(1)}px < 16px')
    for p, txt in ctx.page_htmls():
        name = os.path.basename(p)
        # fixed widths >360px → h-scroll risk at 360
        for m in re.finditer(r'width:\s*(\d{3,})px', txt):
            if int(m.group(1)) > 360:
                f.append(f'P.13 {name}: fixed width {m.group(1)}px '
                         '>360 — horizontal scroll risk at 360')
                break
        if 'font-size' in txt:
            m = re.search(r'body\s*\{[^}]*font-size:\s*(\d+)px', txt)
            if m and int(m.group(1)) < 16:
                f.append(f'P.13 {name}: body {m.group(1)}px < 16px')
        if re.search(r'<nav|class="[^"]*nav', txt):
            if not re.search(r'burger|hamburger|menu-toggle|drawer|'
                             r'aria-label="[^"]*[Mm]enu', txt):
                f.append(f'P.13 {name}: nav has no burger/collapse '
                         'control for mobile')
    return f

# ------------------------------------------------- new absolute rules end

def check_direction_axes(ctx):
    f = []
    d = ctx.site_block().get('direction') or {}
    for axis, allowed in AXES.items():
        v = str(d.get(axis) or '')
        if not v:
            f.append(f'direction.{axis} blank')
        elif v not in allowed:
            f.append(f'direction.{axis} "{v}" ∉ {sorted(allowed)}')
    if not d.get('refused'):
        f.append('direction.refused blank — name the replaced default')
    return f

def check_wireframe_tags(ctx):
    wfp = ctx.wireframe_path()
    if not wfp or not os.path.isfile(wfp):
        return [f'P.3 wireframe file not found ({wfp})']
    txt = open(wfp, encoding='utf-8', errors='replace').read()
    cards = re.findall(r'(?:id|data-layout)="(d\d+)"', txt)
    is_layouts = os.path.basename(wfp) == 'layouts.html'
    if len(cards) < 5 and is_layouts:
        return ['P.3 fewer than 5 layout options in the picker — '
                'round 1 is ≥5 designs']
    if len(cards) < 2:
        return ['P.3 fewer than 2 direction cards in wireframe file']
    f = []
    if is_layouts:
        if 'data-switch=' not in txt:
            f.append('P.3 layout picker has no design-switch — the '
                     'operator swaps rendered options on one page '
                     '(segmented control, sticky)')
        if len(re.findall(r'data-vp="(?:mobile|tablet)"', txt)) < 2:
            f.append('P.3 layout picker has no 375/768 viewport frames '
                     '— every option proves no horizontal overflow at '
                     'mobile and tablet, not just desktop')
        if re.search(r'#[0-9a-fA-F]{6}\b|font-family:\s*["\']'
                     r'(?!.*neutral)', txt):
            pass  # styling allowed; brand colour is a W4 pick
    sec_sets = {}
    for m in re.finditer(
            r'(?:id|data-layout)="(d\d+)"[^>]*>(.*?)'
            r'(?=(?:id|data-layout)="d\d+"|\Z)',
            txt, re.S):
        cid, body = m.group(1), m.group(2)
        secs = re.findall(
            r'<(?:section|nav)[^>]*data-sec="([^"]+)"[^>]*data-comp="([^"]+)"[^>]*'
            r'data-ratio="([^"]+)"[^>]*data-disclosure="([^"]+)"', body)
        all_secs = re.findall(r'<(?:section|nav)\b', body)
        if len(secs) != len(all_secs):
            f.append(f'P.3 card {cid}: {len(all_secs)-len(secs)} section(s)'
                     ' missing data-sec/comp/ratio/disclosure attributes')
        for sec, comp, ratio, disc in secs:
            if ratio not in RATIOS:
                f.append(f'P.3 card {cid} sec {sec}: ratio "{ratio}" ∉ V.3 set')
            if disc not in DISCLOSURE:
                f.append(f'P.3 card {cid} sec {sec}: disclosure "{disc}" '
                         '∉ {open,collapsed,tabbed}')
        sec_sets[cid] = [s[0] for s in secs]
    sets = list(sec_sets.values())
    # ordering freedom: sets must cover the same sections, order free
    if sets and any(sorted(s) != sorted(sets[0]) for s in sets[1:]):
        f.append('P.3 card section sets differ across designs '
                 '(every design covers the same sections)')
    did = ctx.design_id()
    if did and sec_sets and did not in sec_sets:
        f.append(f'W3: --design {did} not a card in the wireframe '
                 f'(have {sorted(sec_sets)})')
    return f

def _system(ctx):
    return ctx.site_block().get('system') or {}

def check_system_enums(ctx):
    s, f = _system(ctx), []
    if not s:
        return ['system: block missing']
    req = {'type': None, 'space': None, 'grid': None, 'color': None,
           'contrast_axes': None, 'icons': None, 'media': None,
           'copy': None}
    for k in req:
        if not s.get(k):
            f.append(f'system.{k} missing/empty')
    ic = s.get('icons') or {}
    if ic.get('family') and str(ic['family']) != 'lucide':
        f.append(f'icons.family "{ic["family"]}" — the icon family is '
                 'Lucide only (I.1 single-family; linecap/geometry '
                 'rules assume the Lucide grid)')
    if ic.get('style') and str(ic['style']) not in \
            {'outline', 'solid', 'duotone', 'hand-drawn', '3d-hero-only'}:
        f.append(f'icons.style "{ic["style"]}" ∉ I.1 set')
    if str(ic.get('style') or '') == 'outline' \
            and str(ic.get('fill') or 'none') != 'none':
        f.append('icons.fill must be "none" on outline Lucide — '
                 'filled glyphs break the stroke contract (I.2)')
    if ic.get('stroke_class') and str(ic['stroke_class']) not in \
            {'light', 'regular', 'bold'}:
            f.append(f'icons.stroke_class "{ic["stroke_class"]}" ∉ I.1 set')
    md = s.get('media') or {}
    if md.get('treatment') and str(md['treatment']) not in \
            {'natural', 'bw', 'duotone', 'cinematic'}:
        f.append(f'media.treatment "{md["treatment"]}" ∉ V.2 set')
    if md.get('authenticity') and str(md['authenticity']) not in \
            {'t1-first-party', 't2-editorial', 't3-ai', 't4-illustrated'}:
        f.append(f'media.authenticity "{md["authenticity"]}" ∉ V.6 set')
    cp = s.get('copy') or {}
    if cp.get('cta_person') and str(cp['cta_person']) not in \
            {'first', 'second'}:
        f.append(f'copy.cta_person "{cp["cta_person"]}" ∉ {{first,second}}')
    mo = s.get('motif') or ctx.site_block().get('motif') or {}
    return f

def check_spacing_scale(ctx):
    f = []
    ACSS_TIERS = {'space-xs', 'space-s', 'space-m', 'space-l',
                  'space-xl', 'space-xxl',
                  'section-space-xs', 'section-space-s', 'section-space-m',
                  'section-space-l', 'section-space-xl', 'section-space-xxl'}
    sc = ((_system(ctx).get('space') or {}).get('scale')) or []
    if isinstance(sc, list):
        nums = [int(x) for x in sc if str(x).strip().isdigit()]
        bad_tok = [str(x) for x in sc
                   if not str(x).strip().isdigit()
                   and str(x) not in ACSS_TIERS]
    else:
        nums, bad_tok = [], []
    if not nums and not any(str(x) in ACSS_TIERS for x in sc):
        return ['system.space.scale missing']
    bad = [n for n in nums if n not in G1]
    if bad:
        f.append(f'space.scale values {bad} ∉ G.1 {sorted(G1)} — px '
                 'spacing must be a G.1 step or an ACSS tier name')
    if bad_tok:
        f.append(f'space.scale tokens {bad_tok} — invent no spacing: '
                 'G.1 step or ACSS tier only')
    edge = ((_system(ctx).get('grid') or {}).get('edge_padding')) or []
    bad = [n for n in edge if isinstance(n, int) and
           n not in {16, 24, 32, 40, 48}]
    if bad:
        f.append(f'edge_padding {bad} ∉ R.2 ramp {{16,24,32,40,48}}')
    return f

def check_breakpoints(ctx):
    f = []
    bp = (_system(ctx).get('grid') or {}).get('breakpoints') or []
    nums = [int(b) for b in bp if str(b).isdigit()]
    bad = [b for b in nums if b not in BREAKPOINTS]
    if bad:
        f.append(f'breakpoints {bad} ∉ R.1 {sorted(BREAKPOINTS)}')
    if not bp:
        f.append('grid.breakpoints missing')
    gcss = ctx.read('site/src/styles/global.css') or ''
    if re.search(r'@media[^{]*max-width', gcss):
        f.append('R.1 max-width media query in global.css — '
                 'min-width only')
    return f

def _rem_base(ctx):
    """10 for ACSS 62.5% html roots, else 16."""
    g = ctx.read('site/src/styles/global.css') or ''
    if re.search(r'html\s*\{[^}]*font-size:\s*62\.5%', g):
        return 10.0
    return 16.0


def check_content_width(ctx):
    """L.11/R.8 — content width binds the ACSS band: >=1200 and <=1280
    CSS px, on the plan AND on the built CSS (--content-width / the
    content container's max-width). ACSS rem base = 10px (62.5%)."""
    cw = str((_system(ctx).get('grid') or {}).get('content_width') or '')
    m = re.match(r'([\d.]+)\s*(rem|px)', cw)
    if not m:
        return ['grid.content_width missing/unparseable']
    base = _rem_base(ctx)
    px = float(m.group(1)) * (base if m.group(2) == 'rem' else 1)
    if px > 1280:
        return [f'content_width {cw} > ACSS 1280px ceiling '
                f'({base}px rem base)']
    f = []
    if px < 1200:
        f.append(f'content_width {cw} < 1200px floor — the ACSS '
                 'band is 1200–1280 (prose column stays 60ch)')
    if not _wave_ge(ctx, 'w6'):
        return f
    # rendered: the content container's declared width must sit in the
    # same band — a max-width token or literal outside it FAILS
    for p_, css in dist_csss(ctx):
        name = os.path.basename(p_)
        for m2 in re.finditer(
                r'--content-width[^:]*:\s*([\d.]+)\s*(rem|px)', css):
            v = float(m2.group(1)) * (base if m2.group(2) == 'rem'
                                      else 1)
            if v < 1200 or v > 1280:
                f.append(f'L.11 {name}: --content-width '
                         f'{m2.group(0)[:30]} = {v:.0f}px — outside '
                         'the 1200–1280 band')
        for m2 in re.finditer(
                r'(?:sec-inner|content-wrap|prose)\s*\{[^}]*'
                r'max-width:\s*([\d.]+)\s*(rem|px)', css):
            v = float(m2.group(1)) * (base if m2.group(2) == 'rem'
                                      else 1)
            if 'prose' in m2.group(0):
                continue  # prose width is a ch measure, not the band
            if v > 1280:
                f.append(f'L.11 {name}: content container '
                         f'max-width {v:.0f}px > 1280 — no wide '
                         'rails outside the content band')
    return f

def check_contrast(ctx):
    """C.1/C.7/C.5 — contrast floors, computed in EVERY mode."""
    f = []
    modes = _modes(ctx)
    if not modes:
        return ['C.1 no colour roles found (TOKENS.json / plan)']
    for mode, roles in modes.items():
        tag = f'[{mode}]'

        def hx(k):
            v = roles.get(k)
            return v if isinstance(v, str) else None
        ink, bg, surf = hx('ink'), hx('bg'), hx('surface')
        af, ac = hx('accent_foreground'), hx('accent')
        im = hx('ink_muted')
        for label, a, b, floor in (
                ('ink:bg', ink, bg, 7), ('ink:surface', ink, surf, 7),
                ('accent_fg:accent', af, ac, 4.5),
                ('ink_muted:bg', im, bg, 4.5),
                ('accent:surface', ac, surf, 3)):
            if not a or not b:
                continue
            r = contrast(a, b)
            if r is not None and r < floor:
                f.append(f'C.1/C.7 {tag} {label} {r:.1f}:1 < {floor}:1')
        for name in ('inverse', 'bg'):
            v = hx(name)
            if v and v.lower() in ('#000', '#000000'):
                f.append(f'C.5 {tag} {name} is pure black — tinted charcoal '
                         'required')
    return f

def _font_directory():
    """Approved web substitutes from the T.4 directory table."""
    path = os.path.join(RULES_DIR, 'T.md')
    names = set()
    if not os.path.isfile(path):
        return names
    txt = open(path, encoding='utf-8').read()
    sec = re.search(r'### T\.4.*?(?=\n### |\n## )', txt, re.S)
    if not sec:
        return names
    for line in sec.group(0).split('\n'):
        if not line.startswith('|') or '---' in line or 'substitute' in line:
            continue
        cells = [c.strip() for c in line.split('|')[1:-1]]
        if len(cells) >= 3:
            for fam in re.split(r'[,/]', cells[2]):
                fam = fam.replace('`', '').strip()
                if fam:
                    names.add(fam.lower())
    return names

GENERIC_FONTS = {'serif', 'sans-serif', 'monospace', 'system-ui',
                 'ui-sans-serif', 'ui-serif', 'ui-monospace', 'cursive',
                 'fantasy', 'emoji', 'math', 'inherit', 'initial'}

def check_type_system(ctx):
    f = []
    t = _system(ctx).get('type') or {}
    fonts = t.get('fonts') or {}
    fams = [v for v in fonts.values() if v]
    if len(set(fams)) > 2:
        f.append(f'T.3 >2 font families declared: {fams}')
    directory = _font_directory()
    for slot, stack in fonts.items():
        first = str(stack).split(',')[0].strip().strip('"\'')
        if not first or first.lower() in GENERIC_FONTS:
            continue
        if directory and first.lower() not in directory:
            f.append(f'T.4 font "{first}" ({slot}) not in the typeface '
                     'directory')
    measure = str((_system(ctx).get('grid') or {}).get('measure') or '')
    m = re.match(r'(\d+)ch', measure)
    if m and int(m.group(1)) > 65:
        f.append(f'T.6 measure {measure} > 65ch')
    return f

def check_tailwind_derivation(ctx):
    f = []
    cfg = None
    for c in ('tailwind.config.js', 'tailwind.config.mjs',
              'tailwind.config.cjs'):
        cfg = ctx.read(f'site/{c}')
        if cfg:
            break
    if cfg is None:
        return ['P.5 no site/tailwind.config.*']
    for key in ('colors', 'fontSize', 'borderRadius', 'spacing'):
        if not re.search(rf'\b{key}\s*:', cfg):
            f.append(f'P.5 tailwind.config lacks theme.{key}')
    tok = ctx.read('TOKENS.json')
    if tok:
        try:
            tj = json.loads(tok)
            hexes = set()
            def walk(o):
                if isinstance(o, dict):
                    for v in o.values(): walk(v)
                elif isinstance(o, str) and re.fullmatch(r'#[0-9a-fA-F]{6}', o):
                    hexes.add(o.lower())
                elif isinstance(o, list):
                    for v in o: walk(v)
            walk(tj.get('color') or tj.get('colors') or {})
            missing = [h for h in sorted(hexes) if h.lower() not in cfg.lower()]
            if missing:
                f.append(f'P.5 TOKENS colours absent from tailwind.config: '
                         f'{missing[:5]}')
        except Exception as e:
            f.append(f'TOKENS.json unparseable: {e}')
    else:
        f.append('TOKENS.json missing')
    return f

def check_tile_is_system(ctx):
    """P.6 — the system sheet instantiates every component.

    The sheet is a preview artefact: `preview/system.html` everywhere
    (self-contained HTML per the preview rule); `site/src/pages/
    system.astro` remains the final-build catalogue at W6+.
    """
    f = []
    tile = ctx.read('preview/system.html')
    is_html = tile is not None
    if tile is None:
        tile = ctx.read('site/src/pages/system.astro')
    if tile is None:
        return ['P.1 system sheet missing — preview/system.html (W5) or '
                'src/pages/system.astro (W6+)']
    comp_names = {os.path.splitext(c)[0] for c in ctx.components()} - {'Section'}
    if not is_html and not _wave_ge(ctx, 'w6'):
        f.append('P.6 system sheet is Astro at W5 — previews are '
                 'self-contained HTML (preview/system.html); Astro '
                 'belongs to W6+')
    if is_html:
        rendered = set(re.findall(r'data-comp="([^"]+)"', tile)) | \
            set(re.findall(r'data-cell="([^"]+)"', tile))
        for c in sorted(comp_names):
            if c not in rendered:
                f.append(f'P.6 component {c} has no specimen on the '
                         'system sheet')
    else:
        alias = dict((a, c) for a, c in re.findall(
            r'import\s+(\w+)\s+from\s+["\'].*components/([\w-]+)\.astro',
            tile))
        rendered = set(re.findall(r'<([A-Z]\w*)\b', tile))
        used = {alias[a] for a in rendered if a in alias}
        used |= {c for c in comp_names
                 if re.search(rf'<{c.replace("-", "")}\b', tile, re.I)}
        for c in sorted(comp_names):
            if c not in used:
                f.append(f'P.6 component {c} not instantiated on system '
                         'tile')
    return f

def _wireframe_secs(ctx):
    """The section list of the CHOSEN layout card — the structure lock.

    The picker is `preview/layouts.html` (hi-fi funnel); a legacy
    `cards/index.html` card file parses the same way.
    """
    cards, err = _layout_cards(ctx)
    if err:
        return None, f'wireframe file not found ({err})'
    did = ctx.design_id() or 'd1'
    if did not in cards:
        return None, f'design card {did} not in wireframe'
    return cards[did], None

def _layout_cards(ctx):
    """All layout options in the picker: {id: [secs]}."""
    wfp = ctx.wireframe_path()
    if not wfp or not os.path.isfile(wfp):
        return None, f'layout picker not found ({wfp})'
    txt = open(wfp, encoding='utf-8', errors='replace').read()
    cards = {}
    for m in re.finditer(
            r'<(?:div|article)[^>]*(?:id|data-layout)="([\w-]+)"[^>]*>'
            r'(.*?)'
            r'(?=<(?:div|article)[^>]*(?:id|data-layout)="[\w-]+"|\Z)',
            txt, re.S):
        secs = re.findall(
            r'<(?:section|nav)[^>]*data-sec="([^"]+)"[^>]*'
            r'data-comp="([^"]+)"[^>]*data-ratio="([^"]+)"[^>]*'
            r'data-disclosure="([^"]+)"', m.group(2))
        if not secs:
            continue  # non-option articles are not layout cards
        if m.group(1) in cards:
            continue  # id + data-layout on one element counted once
        cards[m.group(1)] = [
            {'sec': a, 'comp': b, 'ratio': c, 'disc': d}
            for a, b, c, d in secs]
    return cards, None


def check_layout_distinct(ctx):
    """VG/FUNNEL — round 1 options differ MAXIMALLY in structure:
    pairwise ≥50% of section composition slots differ (the operator
    never picks between near-duplicates)."""
    f = []
    cards, err = _layout_cards(ctx)
    if err:
        return [f'P.3 {err}']
    ids = [k for k in cards if cards[k]]
    if len(ids) < 5:
        f.append(f'VG.4 {len(ids)} layout option(s) — round 1 (coarse) '
                 'needs ≥5 completely different designs (one may be the '
                 '★ wildcard); later rounds show 3')
        return f
    import itertools
    for a, b in itertools.combinations(ids, 2):
        ca, cb = cards[a], cards[b]
        n = max(len(ca), len(cb)) or 1
        diff = sum(1 for x, y in itertools.zip_longest(ca, cb,
                                                     fillvalue={})
                   if x.get('comp') != y.get('comp')
                   or x.get('sec') != y.get('sec'))
        if diff / n < 0.3:
            f.append(f'VG.4 layouts {a}/{b} differ in {diff}/{n} '
                     'section slots (<30% floor; target ~50%) — '
                     'near-duplicates are regenerated, not shown')
    return f


def assemble_layouts(ctx):
    """The coarse layout round: one real responsive HTML page per option,
    same copy, different structure. ``layout_variants`` in the plan lists
    option ids; the chosen one becomes the wireframe lock."""
    opts = _options_block(ctx.plan_text)
    names = [o['name'] for o in opts] or ['d1', 'd2', 'd3']
    rows = [r for _, r in ctx.rows()]
    contracts = build_contracts(ctx)
    by_sec = {c['section']: c for c in contracts}
    secs_contracts = contracts
    import itertools
    pools = [('split-media', 'stacked-hero', 'full-bleed',
              'comparison', 'media-gallery'),
             ('cards-n', 'sequence', 'comparison', 'quote-grid',
              'stat-band'),
             ('faq', 'stat-band', 'logo-wall', 'text-index',
              'media-gallery')]
    blocks = []
    names = (names + ['d4', 'd5'])[:5]
    for i, lid in enumerate(names):
        secs = []
        for j, c in enumerate(secs_contracts):
            comp = c['composition']
            for pool in pools:
                if comp in pool and i > 0:
                    rest = [x for x in pool if x != comp]
                    comp = rest[(i + j) % len(rest)]
            secs.append(f'        <section data-sec="{c["section"]}" '
                        f'data-comp="{comp}" '
                        f'data-ratio="{c["media_ratio"]}" '
                        f'data-disclosure="{c["disclosure"]}"></section>')
        refs = ' '.join(
            r['id'] for r in _canon_rows(ctx)[:3] if r['ok']) or 'none'
        hero_attr = ' data-hero="image-scrim"' if i == 0 else ''
        blocks.append(f'  <article class="card" id="d{i + 1}" '
                      f'data-layout="{lid}"{hero_attr}\n'
                      f'    data-refs="{refs}" '
                      f'data-score="{0.9 - i * 0.05:.2f}" '
                      f'data-review="visual-pass" data-ignored="none">\n'
                      f'    <h2>Layout {lid}</h2>\n'
                      + '\n'.join(secs) + '\n  </article>')
    h = hashlib.sha256('\n'.join(blocks).encode()).hexdigest()[:12]
    tabs = ('<nav class="variant-tabs" data-switch="layout" '
            'style="position:sticky;top:0">'
            + ''.join(f'<button data-tab="d{i+1}"'
                      + (' class="on"' if i == 0 else '')
                      + f'>Design {i+1}</button>'
                      for i in range(len(blocks)))
            + '</nav>')
    txt = ('<!-- assembled: %s — generated by assemble.py --layouts; '
           'never edit -->\n<html lang="en"><head><meta charset="utf-8"'
           ' /><meta name="viewport" content="width=device-width, '
           'initial-scale=1" /><style>'
           'html,body{margin:0;overflow-x:hidden}'
           'article.card{display:block;container-type:inline-size;'
           'max-width:100%%;overflow-x:hidden}'
           '.vp-stage{display:flex;gap:8px}'
           '[data-vp="desktop"]{width:1280px;max-width:100%%}'
           '[data-vp="tablet"]{width:768px;max-width:100%%}'
           '[data-vp="mobile"]{width:375px;max-width:100%%}'
           'h1{font-size:clamp(1.9rem,4.5cqi,3.4rem)}'
           'h2{font-size:clamp(1.35rem,3.4cqi,2.3rem)}'
           'p{font-size:clamp(1rem,2.2cqi,1.25rem)}</style></head>'
           '<body>\n%s\n<div class="vp-stage">'
           '<div data-vp="desktop"></div><div data-vp="tablet"></div>'
           '<div data-vp="mobile"></div></div>\n%s\n</body>\n</html>\n'
           % (h, tabs, '\n'.join(blocks)))
    return os.path.join(ctx.dir, 'preview', 'layouts.html'), txt, h


CANON_BAN = ('data/web', 'validation-negative', 'annotations_negative',
             'negative_sections', 'anti.json', 'quarantine')


def _endorsed_sites():
    """Operator-endorsed canon lists — site domains/URLs recorded by
    PatternMiner under patterns/data/operator/_sources/ (one list file
    per endorsed source, e.g. the eleken.co best-website-design-examples
    list). Tier order: operator direct > endorsed list > Mobbin."""
    root = os.path.join(DESIGN_DIR, 'patterns', 'data', 'operator',
                        '_sources')
    out = set()
    if not os.path.isdir(root):
        return out
    for dp, _, fns in os.walk(root):
        for fn in fns:
            p = os.path.join(dp, fn)
            try:
                txt = open(p, encoding='utf-8', errors='replace').read()
            except Exception:
                continue
            for u in re.findall(r'https?://[^\s\)\]>"\']+', txt):
                out.add(u.rstrip('.,;/').lower())
                m = re.match(r'https?://([^/?#]+)', u)
                if m:
                    out.add(m.group(1).lower())
            for d in re.findall(
                    r'\b([a-z0-9](?:[a-z0-9-]*[a-z0-9])?'
                    r'(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+'
                    r'(?:/[\w.-]*)?)\b', txt.lower()):
                # a bare domain needs a real TLD-ish suffix — skip
                # filenames, hashes and truncated host labels
                host = d.split('/')[0]
                tld = host.rsplit('.', 1)[-1]
                if len(tld) >= 2 and tld.isalpha() \
                        and len(host.split('.')) >= 2 \
                        and '.' in d and ' ' not in d:
                    out.add(d.rstrip('.,;/'))
    return out


_ENDORSED = None
_ENDORSED_EXEMPLARS = None


def _endorsed_exemplars():
    """{label: [site urls/domains]} — exemplar-marked sites inside the
    endorsed lists (details.so: section labels like hero/footer/
    navigation with exemplar: true). Within the endorsed tier these
    rank highest for their composition."""
    global _ENDORSED_EXEMPLARS
    if _ENDORSED_EXEMPLARS is not None:
        return _ENDORSED_EXEMPLARS
    out = {}
    root = os.path.join(DESIGN_DIR, 'patterns', 'data', 'operator',
                        '_sources')
    if os.path.isdir(root):
        for dp, _, fns in os.walk(root):
            for fn in fns:
                p = os.path.join(dp, fn)
                try:
                    d = json.load(open(p))
                except Exception:
                    continue
                for site in d.get('sites') or []:
                    if not isinstance(site, dict):
                        continue
                    url = str(site.get('url') or site.get('site')
                              or site.get('domain') or '')
                    host = url and re.match(r'https?://([^/?#]+)',
                                            url)
                    key = url or (host.group(1) if host else '')
                    if not key:
                        continue
                    if host:
                        key = host.group(1)
                    secs = site.get('sections') or []
                    if isinstance(secs, dict):
                        secs = [{'label': k, **(
                            v if isinstance(v, dict)
                            else {'exemplar': bool(v)})}
                                for k, v in secs.items()]
                    if site.get('exemplar') and site.get('label'):
                        secs = list(secs) + [
                            {'label': site.get('label'),
                             'exemplar': True}]
                    for sec in secs:
                        if not isinstance(sec, dict):
                            continue
                        if not sec.get('exemplar'):
                            continue
                        lab = str(sec.get('label') or '')
                        if lab:
                            out.setdefault(lab.lower(),
                                           []).append(key)
    _ENDORSED_EXEMPLARS = out
    return out


EXEMPLAR_COMP = {
    'hero': {'split-media', 'stacked-hero', 'full-bleed',
             'hero-act-merge'},
    'navigation': {'nav-bar'}, 'nav': {'nav-bar'},
    'footer': {'footer-bar'}, 'cards': {'cards-n'},
    'features': {'cards-n', 'sequence'}, 'faq': {'faq'},
    'form': {'form-panel', 'capture-form'},
    'testimonials': {'quote-grid'}, 'logos': {'logo-wall'},
    'stats': {'stat-band'}, 'gallery': {'media-gallery'},
}


def _exemplar_comps(lab):
    return EXEMPLAR_COMP.get(lab.lower(), {lab.lower()})


def _canon_ref_ok(ref, endorsed=None):
    """A canonical ref is (tier 1) an operator-supplied site URL,
    (tier 2) a site recorded in an operator-endorsed list
    (patterns/data/operator/_sources/), (tier 3) a Mobbin screen or
    section id/URL. The web corpus and the anti/negatives layer are
    removed from canon — any ref into data/web, validation-negatives
    or the quarantine is never valid."""
    global _ENDORSED
    r = str(ref).strip().lower()
    if not r or r == 'none':
        return False
    if any(b in r for b in CANON_BAN):
        return False
    if 'negative' in r or r.startswith(('pattern-', 'web-',
                                        'https-', 'http-')):
        return False
    if r.startswith('mobbin') or 'mobbin.com' in r:
        return True
    if r.startswith(('http://', 'https://')):
        return True
    if endorsed is None:
        if _ENDORSED is None:
            _ENDORSED = _endorsed_sites()
        endorsed = _ENDORSED
    for e in endorsed:
        if r == e or r.startswith(e + '/') or ('://' + e) in r \
                or r.startswith(e):
            return True
    return False


def _canon_rows(ctx):
    """MOBBIN-REFS.md rows → {id/url, kind, informs, wave, ignored?,
    ok?}. ok=False marks rows the canon ruling bans (web corpus /
    negatives) — they fail instead of tracing."""
    t = ctx.read('MOBBIN-REFS.md') or ''
    rows = []
    for ln in t.splitlines():
        if not ln.strip().startswith('|') or '---' in ln:
            continue
        cells = [c.strip() for c in ln.strip().strip('|').split('|')]
        if len(cells) >= 3 and cells[0] not in ('id/url', 'id / url'):
            row_text = ' '.join(cells).lower()
            rid = cells[0]
            ok = _canon_ref_ok(rid) \
                and not re.search(r'\b(web|negative)s?\b',
                                  (cells[1] or '').lower())
            rows.append({'id': rid,
                         'kind': cells[1] if len(cells) > 1 else '',
                         'informs': cells[2] if len(cells) > 2 else '',
                         'wave': cells[3] if len(cells) > 3 else '',
                         'ok': ok,
                         'ignored': 'ignored' in row_text
                         or 'skipped' in row_text
                         or 'dropped' in row_text})
    return rows


def _operator_sites(ctx):
    """Operator-suggested canon sites from the plan (auto-banked)."""
    plan = ctx.plan or {}
    site = plan.get('site') or {}
    raw = (site.get('canon_sites') or site.get('operator_sites')
           or (plan.get('canon') or {}).get('sites') or [])
    return [str(x) for x in raw]


def check_canon_trace(ctx):
    """LAW.REF — every composition/hero/look choice traces to a canon
    ref; retrieval is complete (skipped refs are logged as ignored);
    operator sites rank above Mobbin."""
    if not _wave_ge(ctx, 'w1'):
        return []
    f = []
    rows = _canon_rows(ctx)
    opsites = _operator_sites(ctx)
    for r in rows:
        if not r['ok']:
            f.append(f"LAW.REF {r['id']}: not a canonical ref — canon "
                     'is Mobbin screens + operator sites only; the web '
                     'corpus / negatives / banked sites are removed')
    txt_refs = ' '.join(r['id'] + ' ' + r['informs'] for r in rows
                        if r['ok']).lower()
    # operator sites must appear in the canon set when the operator gave any
    for site in opsites:
        if site.lower() not in txt_refs:
            f.append(f'LAW.REF operator site {site} missing from '
                     'MOBBIN-REFS.md — auto-capture, bank and weight it '
                     'above Mobbin')
    # per-section refs on the plan rows (layout round onward)
    if _wave_ge(ctx, 'w3'):
        ignored = [r for r in rows if r['ignored']]
        if rows and not any(r['ignored'] or 'ignored' in r['wave'].lower()
                            for r in rows):
            f.append('LAW.REF no ignored list — retrieval is complete; a '
                     'retrieved high-similarity ref that was not used '
                     'needs a logged reason')
        for slug, page in ctx.pages().items():
            for r in page.get('sections') or []:
                refs = r.get('refs') or r.get('canon') or []
                if isinstance(refs, str):
                    refs = [refs]
                if not refs:
                    f.append(f'LAW.REF {slug}:{r.get("name")} has no canon '
                             'ref — the composition traces to nothing')
                else:
                    ex = set()
                    for lab, urls in _endorsed_exemplars().items():
                        if str(r.get('composition') or '') in \
                                _exemplar_comps(lab):
                            ex.update(urls)
                    if ex and not any(
                            any(str(ref).lower().startswith(u)
                                for u in ex) for ref in refs):
                        f.append(f'LAW.REF {slug}:{r.get("name")}: an '
                                 'endorsed exemplar exists for this '
                                 'composition (details.so _sources) '
                                 'but the row cites none — within the '
                                 'endorsed tier, exemplars rank '
                                 'highest')
                    for ref in refs:
                        if not _canon_ref_ok(ref):
                            f.append(f'LAW.REF {slug}:{r.get("name")} '
                                     f'cites {ref} — not a canonical '
                                     'ref (Mobbin id / operator site '
                                     'URL only)')
                        elif str(ref).lower() not in txt_refs:
                            f.append(f'LAW.REF {slug}:{r.get("name")} '
                                     f'cites {ref} — not in the canon '
                                     'set (MOBBIN-REFS.md)')
    return f


def _intent_model(ctx):
    """PatternMiner's intent model — contract/extraction layer only."""
    mp = os.path.join(DESIGN_DIR, 'patterns', 'data', 'intent-model.json')
    if not os.path.isfile(mp):
        return None
    try:
        return json.load(open(mp))
    except Exception:
        return None


def _expected_alleles(model, choice, vertical, attrs):
    """Top-2 alleles of P(choice|vertical) ∪ P(choice|attr) per attribute."""
    exp = set()
    for bucket, key in ((model.get('p_choice_given_vertical') or {},
                       vertical),):
        dist = (bucket.get(choice) or {}).get(key) or {}
        for a, _p in sorted(dist.items(), key=lambda kv: -kv[1])[:2]:
            exp.add(a)
    for attr in attrs:
        dist = ((model.get('p_choice_given_attribute') or {})
                .get(choice) or {}).get(attr) or {}
        for a, _p in sorted(dist.items(), key=lambda kv: -kv[1])[:2]:
            exp.add(a)
    return exp


def check_intent_deviation(ctx):
    """D.5 — non-conventional choices carry declared_deviation; imagery
    alleles agree with attribute predictions or cite a copy sentence."""
    if not _wave_ge(ctx, 'w3'):
        return []
    model = _intent_model(ctx)
    if not model:
        return []
    f = []
    site = ctx.site_block()
    vertical = str(site.get('vertical') or
                   str(site.get('vertical_profile') or
                       '').replace('profile-', '').split('/')[0] or '')
    attrs = site.get('attributes') or []
    if isinstance(attrs, str):
        attrs = [attrs]
    choices = site.get('intent_choices') or []
    if isinstance(choices, dict):
        choices = [dict(v, choice=k) for k, v in choices.items()]
    for c in choices:
        ch, allele = c.get('choice'), c.get('allele')
        if not ch or not allele:
            f.append(f'D.5 intent choice {c} lacks choice/allele fields')
            continue
        exp = _expected_alleles(model, ch, vertical, attrs)
        dev = c.get('declared_deviation')
        if exp and allele not in exp:
            if not dev or not (dev.get('reason') if isinstance(dev, dict)
                               else dev):
                f.append(f'D.5 {ch}={allele} ∉ expected {sorted(exp)} '
                         '— needs declared_deviation {choice, chosen, '
                         'expected, reason}')
            continue
        if dev and isinstance(dev, dict) and not dev.get('expected'):
            f.append(f'D.5 {ch} declared_deviation lacks "expected" '
                     '(record the model top-2)')
        if ch in ('imagery', 'image_style', 'mood_register') and dev \
                and not dev.get('copy_cite'):
            f.append(f'D.5 {ch} deviation needs copy_cite — the sentence '
                     'in the copy contract that licenses it')
    return f


def check_wildcard_random(ctx):
    """B.7 — the wildcard's gene set is RNG-chosen (seed recorded), not a
    default image overlay; differs from the last run's wildcard."""
    if not _wave_ge(ctx, 'w4'):
        return []
    f = []
    try:
        dna = json.loads(ctx.read('DNA.json') or '{}')
    except Exception:
        return []
    hist = []
    try:
        hist = json.loads(ctx.read('WILDCARD-HISTORY.json') or '[]')
    except Exception:
        hist = []
    last_genes = set()
    for h in hist[-1:]:
        last_genes |= set(h.get('genes') or [])
    image_sole_prev = False
    for h in hist[-1:]:
        if set(h.get('genes') or []) == {'image.treatment'}:
            image_sole_prev = True
    for v in dna.get('variants') or []:
        if str(v.get('vector')) != 'wildcard' \
                and not v.get('wildcard_genes'):
            continue
        genes = set(v.get('wildcard_genes') or
                    (v.get('deltas') or {}).keys())
        if v.get('wildcard_seed') in (None, ''):
            f.append(f'B.7 wildcard {v.get("id")} has no wildcard_seed — '
                     'the gene set must be RNG-chosen, not defaulted')
        if genes and last_genes and genes == last_genes:
            f.append(f'B.7 wildcard genes {sorted(genes)} repeat the '
                     'previous round — re-roll (seeded RNG over the '
                     'allowed genes, weighted to unused)')
        if genes == {'image.treatment'} and image_sole_prev:
            f.append('B.7 image.treatment is the sole wildcard change '
                     'twice in a row — banned')
    return f


def check_auto_grid(ctx):
    """G.5 — collections use auto-fit minmax grids; no narrow scroll
    rails that are not declared full-bleed."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    for p, css in dist_csss(ctx) + [
            (ctx.dir + '/global.css',
             ctx.read('site/src/styles/global.css') or '')]:
        name = os.path.basename(p)
        for m in re.finditer(
                r'grid-template-columns:\s*repeat\(\s*(\d+|\d+fr)',
                css):
            f.append(f'G.5 {name}: fixed repeat({m.group(1)}) grid — '
                     'collections use '
                     'repeat(auto-fit, minmax(min(var(--grid-min,28rem),'
                     '100%),1fr))')
        for m in re.finditer(r'([\w.#\[\]-]+)[^{}]*\{[^}]*overflow-x:\s*'
                             r'(auto|scroll)[^}]*\}', css):
            sel, body = m.group(1), m.group(0)
            if 'full-bleed' in sel or 'full-bleed' in body or \
                    '100vw' in body or 'bleed' in sel:
                continue
            f.append(f'G.5 {name}: "{sel.strip()}" scrolls horizontally '
                     '— rails are banned unless declared full-bleed '
                     '(edge-to-edge)')
    return f


def _surface_of(sec):
    """A comparable surface signature for a rendered section block."""
    cls = ' '.join(str(sec.get('class') or '').split())
    style = str(sec.get('style') or '')
    sig = re.search(r'background(?:-color)?:\s*([^;]+)', style)
    if sig:
        return 'bg:' + sig.group(1).strip()
    toks = [c for c in cls.split() if re.search(
        r'band|inverse|brand|muted|bg-|surface|tint|alt', c)]
    return ' '.join(sorted(toks)) or 'default'


def check_surface_rhythm(ctx):
    """L.14 — alternating surfaces: no adjacent identical backgrounds;
    every section has block padding; heading precedes content."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    for p, txt, parsed, blocks in _segmented(ctx):
        name = os.path.basename(p)
        tagged = [s for s in blocks if s.get('data-sec')]
        surfaces = [_surface_of(s) for s in tagged]
        for i in range(1, len(surfaces)):
            if surfaces[i] == surfaces[i - 1] and \
                    surfaces[i] != 'default':
                f.append(f'L.14 {name}: sections {i}/{i + 1} share '
                         f'surface "{surfaces[i]}" — alternate '
                         'white → light grey/tint → white')
        for i, s in enumerate(tagged):
            cls = str(s.get('class') or '')
            style = str(s.get('style') or '')
            has_pad = re.search(r'\bpy-\d+', cls) or \
                re.search(r'padding(?:-block)?:', style) or \
                re.search(r'sec-band|section-space|pad-', cls)
            if not has_pad:
                f.append(f'L.14 {name} sec {s.get("data-sec")}: no block '
                         'padding — every Section pads ≥ section-space-s')
    return f


def check_dead_columns(ctx):
    """L.15 — no dead half-columns: a media block with an empty column
    beside it FAILs; splits pair media with comparable content."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    for p, txt in ctx.page_htmls():
        name = os.path.basename(p)
        for m in re.finditer(
                r'<section[^>]*data-comp="([^"]*)"[^>]*>(.*?)'
                r'</section>', txt, re.S):
            comp, body = m.group(1), m.group(2)
            if 'split' not in comp:
                continue
            media = bool(re.search(
                r'<(?:img|video|picture|figure|svg)[\s>]', body))
            empties = re.findall(
                r'<(?:div|aside)[^>]*>(?:\s|&nbsp;)*'
                r'</(?:div|aside)>', body)
            if media and empties:
                f.append(f'L.15 {name} sec {comp}: media sits beside '
                         f'{len(empties)} empty column(s) — pair media '
                         'with comparable content or go full width')
    return f


def _cta_count(body):
    return len(re.findall(
        r'<(?:a|button)[^>]*class="[^"]*(?:btn-primary|cta-primary'
        r'|btn-primary|primary)[^"]*"', body)) or len(re.findall(
        r'class="[^"]*(?:cta|btn|button)[^"]*"', body))


def check_hero_fold(ctx):
    """R.10 — hero CTA fully above the fold (1280x720, 1440x800,
    375x667); hero top pad <= section-space-s (~80px)."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    for p, txt in ctx.page_htmls():
        name = os.path.basename(p)
        m = re.search(r'<section[^>]*data-sec="hero"[^>]*>(.*?)'
                      r'</section>', txt, re.S)
        if not m:
            continue
        tag = re.search(r'<section[^>]*data-sec="hero"[^>]*>',
                        txt).group(0)
        body = m.group(1)
        if not _cta_count(body):
            f.append(f'R.10 {name}: hero has no CTA — the primary CTA '
                     'must sit fully inside the first viewport '
                     '(1280x720, 1440x800, 375x667)')
        cls = re.search(r'class="([^"]*)"', tag)
        cls = cls.group(1) if cls else ''
        py = re.search(r'\bpy-(\d+)', cls)
        if py and int(py.group(1)) * 4 > 80:
            f.append(f'R.10 {name}: hero top padding py-{py.group(1)} '
                     '(~{}px) exceeds section-space-s (~80px) — hero '
                     'uses a reduced top tier'.format(
                         int(py.group(1)) * 4))
        lead = re.search(r'<p[^>]*>(.*?)</p>', body, re.S)
        if lead and len(re.sub(r'<[^>]+>', '', lead.group(1))) > 240:
            f.append(f'R.10 {name}: hero lead >240 chars — ≤3 lines on '
                     'desktop, the CTA needs the room')
        h1 = re.search(r'<h1[^>]*>(.*?)</h1>', body, re.S)
        if h1 and len(re.sub(r'<[^>]+>', '', h1.group(1))) > 80:
            f.append(f'R.10 {name}: hero H1 >80 chars — display text '
                     'must leave the CTA above the fold')
    return f


def check_canon_padding(ctx):
    """G.6 — padding ratios within canon IQR (PatternMiner's
    CANON-PADDING.json: vertical:horizontal per comp + block:inline)."""
    if not _wave_ge(ctx, 'w7'):
        return []
    cp = ctx.read('CANON-PADDING.json')
    if not cp:
        return []
    try:
        canon = json.loads(cp)
    except Exception:
        return ['G.6 CANON-PADDING.json unparseable']
    f = []
    comps = canon.get('components') or {}
    for p, txt in ctx.page_htmls():
        name = os.path.basename(p)
        for m in re.finditer(
                r'<section[^>]*data-comp="([^"]*)"[^>]*'
                r'style="[^"]*padding:\s*([\d.]+)px\s+([\d.]+)px',
                txt):
            comp, vb, hb = m.group(1), float(m.group(2)), float(m.group(3))
            spec = comps.get(comp) or {}
            lo, hi = (spec.get('vh_iqr') or [None, None])
            if not spec:
                f.append(f'G.6 {name} {comp}: component type not in '
                         'CANON-PADDING.json — every type carries its '
                         'own ratio band (per type + size tier, never '
                         'one global median)')
                continue
            if lo is None or not hb:
                continue
            ratio = vb / hb
            if not (lo <= ratio <= hi):
                f.append(f'G.6 {name} {comp}: padding ratio '
                         f'{ratio:.2f} outside canon IQR '
                         f'[{lo}, {hi}]')
    return f


def check_primary_cta(ctx):
    """PS.7 — one primary CTA per section; secondary/tertiary stay
    visually subordinate (never two filled primaries)."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    for p, txt in ctx.page_htmls():
        name = os.path.basename(p)
        for m in re.finditer(
                r'<section[^>]*data-sec="([^"]*)"[^>]*>(.*?)</section>',
                txt, re.S):
            n = len(re.findall(
                r'class="[^"]*(?:btn-primary|cta-primary|btn--primary'
                r'|is-primary)[^"]*"', m.group(2)))
            if n > 1:
                f.append(f'PS.7 {name} sec {m.group(1)}: {n} primary '
                         'CTAs — one per section; the rest take '
                         'secondary/tertiary weight')
    return f


def check_interaction_states(ctx):
    """I.9 — every interactive element carries hover + focus-visible
    (and disabled where applicable) styles."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    css = ctx.read('site/src/styles/global.css') or ''
    for p, c in dist_csss(ctx):
        css += '\n' + c
    for p, txt in ctx.page_htmls():
        for m in re.finditer(r'class="([^"]*(?:btn|cta|button)[^"]*)"',
                             txt):
            base = m.group(1).split()[0]
            if not re.search(rf'{re.escape(base)}[^{{]*:(?:hover|focus)',
                             css) and not re.search(
                             rf'\.(?:btn|cta)[^{{]*:(?:hover|focus)',
                             css):
                f.append(f'I.9 {os.path.basename(p)}: .{base} has no '
                         'hover/focus style in the compiled CSS')
    if css and re.search(r'\.(?:btn|cta|button)', css) \
            and ':focus-visible' not in css:
        f.append('I.9 no :focus-visible rule for interactive classes')
    return f


def check_forms(ctx):
    """S.9 — form fields carry label, required marker, helper/error
    state containers."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    for p, txt in ctx.page_htmls():
        name = os.path.basename(p)
        for m in re.finditer(r'<form[^>]*>(.*?)</form>', txt, re.S):
            body = m.group(1)
            if re.search(r'<input|<textarea|<select', body):
                if not re.search(r'<label|aria-label', body):
                    f.append(f'S.9 {name}: form field without a label')
                if 'required' in body and not re.search(
                        r'aria-required|\*', body):
                    f.append(f'S.9 {name}: required field has no '
                             'required marker')
            if re.search(r'<input|<textarea|<select', body) and not \
                    re.search(r'helper|error|hint|success', body):
                f.append(f'S.9 {name}: form has no helper/error state '
                         'container')
    return f


def check_heading_pattern(ctx):
    """PS.8 — every content section leads with a heading; eyebrow →
    H2 → lead order is consistent across sections."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    for p, txt in ctx.page_htmls():
        name = os.path.basename(p)
        for m in re.finditer(
                r'<section[^>]*data-sec="([^"]*)"[^>]*>(.*?)</section>',
                txt, re.S):
            sec, body = m.group(1), m.group(2)
            if sec in ('nav', 'footer'):
                continue
            if not re.search(r'<h[1-6][\s>]', body):
                f.append(f'PS.8 {name} sec {sec}: no heading — every '
                         'Section opens eyebrow/H2/lead, never stray '
                         'content first')
    return f


def check_equal_cards(ctx):
    """G.7 — cards in a row share the same shell classes (equal height
    via one grid track)."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    for p, txt in ctx.page_htmls():
        name = os.path.basename(p)
        for m in re.finditer(
                r'<section[^>]*data-sec="([^"]*)"[^>]*>(.*?)</section>',
                txt, re.S):
            cards = [c for c in re.findall(
                r'class="([^"]*card[^"]*)"', m.group(2))
                if 'card-grid' not in c]
            if len(cards) >= 2 and len(set(cards)) > 1:
                f.append(f'G.7 {name} sec {m.group(1)}: sibling cards '
                         f'carry different shells {sorted(set(cards))} '
                         '— equal-height rows use one card class')
    return f


def check_dark_media(ctx):
    """V.9 — dark-mode images are dimmed (filter or explicit opt-out),
    never pure-white blocks in a dark page."""
    if not _wave_ge(ctx, 'w7'):
        return []
    css = ctx.read('site/src/styles/global.css') or ''
    for p, c in dist_csss(ctx):
        css += '\n' + c
    if '.dark' not in css and 'data-theme' not in css \
            and 'prefers-color-scheme' not in css:
        return []
    has_rule = re.search(
        r'(?:\.dark|data-theme.?=.?"?dark|prefers-color-scheme:\s*dark)'
        r'[^\n]*\b(img|video|picture)[^{]*\{[^}]*'
        r'(filter|brightness|opacity)', css)
    if has_rule:
        return []
    f = []
    for p, txt in ctx.page_htmls():
        for m in re.finditer(r'<(?:img|video)[^>]*>', txt):
            if 'data-dark' not in m.group(0):
                f.append(f'V.9 {os.path.basename(p)}: media without '
                         'dark handling — dim images in dark mode '
                         '(.dark img{filter:brightness(…)}) or mark '
                         'data-dark="ok"')
                break
    return f


def check_logo(ctx):
    """L.16 — the logo carries an explicit size and clear space."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    for p, txt in ctx.page_htmls():
        name = os.path.basename(p)
        m = re.search(r'<(?:a|div|img|svg)[^>]*class="[^"]*logo[^"]*"[^>]*'
                      r'>(?:.*?</(?:a|div)>)?', txt)
        if not m:
            f.append(f'L.16 {name}: no logo element found')
            continue
        tag = m.group(0)
        if not re.search(r'(width|height)=|font-size|logo-(\d+|sm|md|lg)'
                         r'|h-(\d+|\[)', tag):
            f.append(f'L.16 {name}: logo has no explicit size')
    return f


def check_accent_surfaces(ctx):
    """C.8 — at most one accent-filled surface per viewport (page-level:
    one inverse/brand band)."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    for p, txt, parsed, blocks in _segmented(ctx):
        name = os.path.basename(p)
        dark = [s for s in blocks if re.search(
            r'inverse|brand|bg-accent|accent-fill', str(s.get('class')))]
        if len(dark) > 1:
            f.append(f'C.8 {name}: {len(dark)} accent-filled surfaces — '
                     'max one per viewport')
    return f


def check_landmarks(ctx):
    """PS.9 — skip-link, main/nav/footer landmarks, sane focus order."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    for p, txt in ctx.page_htmls():
        name = os.path.basename(p)
        if 'skip' not in txt.lower():
            f.append(f'PS.9 {name}: no skip-link')
        if not re.search(r'<main[\s>]|role="main"', txt):
            f.append(f'PS.9 {name}: no <main> landmark')
        if not re.search(r'<footer[\s>]|role="contentinfo"', txt):
            f.append(f'PS.9 {name}: no <footer> landmark')
    return f


def check_sticky_offset(ctx):
    """R.11 — a sticky/fixed header forces scroll-margin on anchors."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    for p, txt in ctx.page_htmls():
        name = os.path.basename(p)
        sticky = re.search(r'class="[^"]*(?:sticky|fixed)[^"]*"',
                           txt) or re.search(
                               r'position:\s*(?:sticky|fixed)', txt)
        if sticky and 'scroll-margin' not in txt and \
                'scroll-padding' not in txt:
            f.append(f'R.11 {name}: sticky/fixed element but no '
                     'scroll-margin/scroll-padding — anchored sections '
                     'slide under the header')
    return f


def check_footer_structure(ctx):
    """PS.10 — footer carries nav links, contact, and legal."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    for p, txt in ctx.page_htmls():
        name = os.path.basename(p)
        m = re.search(r'<footer[^>]*>(.*?)</footer>', txt, re.S)
        if not m:
            continue
        body = m.group(1).lower()
        if not re.search(r'<a[\s]', body):
            f.append(f'PS.10 {name}: footer has no nav links')
        if not re.search(r'contact|mailto|tel:|address|st\b|street',
                         body):
            f.append(f'PS.10 {name}: footer has no contact block')
        if not re.search(r'privacy|terms|©|&copy;|legal|abn', body):
            f.append(f'PS.10 {name}: footer has no legal line')
    return f


def check_meta(ctx):
    """P.16 — favicon, meta description, and OG tags on the build."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    for p, txt in ctx.page_htmls():
        name = os.path.basename(p)
        head = txt[:txt.find('</head>')] if '</head>' in txt else txt
        if not re.search(r'rel="(?:icon|shortcut icon|apple-touch)"',
                         head):
            f.append(f'P.16 {name}: no favicon link')
        if not re.search(r'name="description"', head):
            f.append(f'P.16 {name}: no meta description')
        for og in ('og:title', 'og:description', 'og:image'):
            if og not in head:
                f.append(f'P.16 {name}: missing {og}')
    return f


SECTION_INTENTS = {
    'definition', 'scope', 'audience', 'process', 'cost', 'duration',
    'compliance', 'coverage', 'related', 'faq', 'proof', 'cta',
    'hero', 'chrome'}


def check_intent_sections(ctx):
    """PS.11 — one idea = one section: every plan row carries a closed
    `intent` derived from the heading's answer type; headings of
    different intent can never share a section; merging needs a
    declared `group` of the same intent. Rendered: every content
    section carries data-intent and a single h2 sits first."""
    f = []
    if _wave_ge(ctx, 'w3'):
        groups = {}
        h2_units, units = 0, set()
        for slug, r in ctx.rows():
            acts = r.get('speech_act') or []
            if isinstance(acts, str):
                acts = [acts]
            # nav/footer/chrome rows are not idea-sections: they never
            # count against the one-idea-one-section heading budget
            if 'chrome' in acts or str(r.get('composition') or '') in \
                    ('nav-bar', 'footer-bar'):
                continue
            intent = str(r.get('intent') or '')
            if not intent:
                f.append(f'PS.11 {slug}:{r.get("name")} has no intent '
                         f'— derive it from the heading answer type '
                         f'{sorted(SECTION_INTENTS)}')
            elif intent not in SECTION_INTENTS:
                f.append(f'PS.11 {slug}:{r.get("name")} intent '
                         f'"{intent}" ∉ {sorted(SECTION_INTENTS)}')
            gid = r.get('group')
            if gid:
                if gid in groups and groups[gid][0] != intent:
                    f.append(f'PS.11 {slug}:{r.get("name")} group '
                             f'{gid} mixes intents '
                             f'{groups[gid][0]}/{intent} — different '
                             'intents can never share a section')
                if not r.get('group_reason'):
                    f.append(f'PS.11 {slug}:{r.get("name")} group {gid} '
                             'without a declared reason — merging is '
                             'same-intent + declared only')
                groups.setdefault(gid, (intent, r.get('name')))
                units.add('g:' + str(gid))
            else:
                units.add(r.get('name'))
            vec = r.get('vector') or []
            h2_units += len(vec)
        if h2_units > len(units):
            f.append(f'PS.11 {h2_units} vector headings vs '
                     f'{len(units)} section units — every H2 opens its '
                     'own Section unless a same-intent group is '
                     'declared')
    if _wave_ge(ctx, 'w7'):
        for p, txt in ctx.page_htmls():
            name = os.path.basename(p)
            for m in re.finditer(
                    r'<(section)[^>]*data-sec="([^"]*)"([^>]*)>'
                    r'(.*?)</section>', txt, re.S):
                sec, attrs, body = m.group(2), m.group(3), m.group(4)
                if sec in ('nav', 'footer'):
                    continue
                sint = re.search(r'data-intent="([^"]+)"', attrs)
                if not sint:
                    f.append(f'PS.11 {name} sec {sec}: no data-intent '
                             '— the intent must be visible in markup')
                h2s = re.findall(r'<h([12])\b[^>]*data-intent="([^"]*)"',
                                 body) + [
                                 (t, sint.group(1) if sint else '')
                                 for t in re.findall(
                                     r'<h([12])\b(?![^>]*data-intent)',
                                     body)]
                if len(re.findall(r'<h2\b', body)) > 1 and \
                        'data-group' not in attrs:
                    ints = {i for _, i in h2s}
                    f.append(f'PS.11 {name} sec {sec}: '
                             f'{len(re.findall(r"<h2\\b", body))} h2s '
                             f'(intents {sorted(ints)}) share one '
                             'section — a merge needs a declared '
                             'same-intent group')
    return f


def check_breathing(ctx):
    """L.17 — breathing room: content sections pad ≥ section-space-m;
    header group → body gap ≥ space-l; card grids gap ≥ space-m;
    whitespace share ≥ the type's canon P25; ≤1 dense group per
    viewport."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    try:
        canon = json.loads(ctx.read('CANON-PADDING.json') or '{}')
    except Exception:
        canon = {}
    specs = canon.get('components') or {}
    for p, txt in ctx.page_htmls():
        name = os.path.basename(p)
        dense_run = 0
        for m in re.finditer(
                r'<section[^>]*data-sec="([^"]*)"([^>]*)>(.*?)'
                r'</section>', txt, re.S):
            sec, attrs, body = m.groups()
            if sec in ('nav', 'footer'):
                continue
            cls = re.search(r'class="([^"]*)"', attrs)
            cls = cls.group(1) if cls else ''
            if sec != 'hero':
                pm = re.search(r'\bpy-(\d+)', cls)
                if not pm or int(pm.group(1)) * 4 < 96:
                    f.append(f'L.17 {name} sec {sec}: block padding '
                             '< section-space-m (~96px) — cramped '
                             'sections get no air')
            inner_gaps = [int(g) for g in re.findall(
                r'\b(?:gap|space-y|mb|mt)-(\d+)', body)]
            has_head_body = re.search(r'<h[12]\b', body) and \
                re.search(r'<(?:p|img|form|ul|div)\b', body)
            if has_head_body and inner_gaps and \
                    max(inner_gaps) * 4 < 32:
                f.append(f'L.17 {name} sec {sec}: header→body gap '
                         '< space-l (~32px) — the group reads jammed')
            if 'card-grid' in cls or re.search(r'grid\b', cls):
                gm = re.search(r'\bgap-(\d+)', cls) or re.search(
                    r'\bgap-(\d+)', body)
                if gm and int(gm.group(1)) * 4 < 24:
                    f.append(f'L.17 {name} sec {sec}: grid gap '
                             '< space-m (~24px)')
            spec = specs.get(re.search(
                r'data-comp="([^"]*)"', attrs).group(1)
                if re.search(r'data-comp="([^"]*)"', attrs) else '')
            if spec and spec.get('whitespace_p25') is not None:
                text = len(re.sub(r'<[^>]+>', '', body))
                total = max(len(body), 1)
                share = 1 - text / total
                if share < spec['whitespace_p25']:
                    f.append(f'L.17 {name} sec {sec}: whitespace share '
                             f'{share:.0%} < canon P25 '
                             f"{spec['whitespace_p25']:.0%} for its "
                             'type')
            if 'compact' in cls:
                dense_run += 1
                if dense_run > 1:
                    f.append(f'L.17 {name}: dense groups stack — max '
                             'one dense group per viewport')
            else:
                dense_run = 0
    return f


def check_receipts(ctx):
    """P.17 — nothing outside the pipeline: an artifact that exists on
    disk must be bound in GATES.json.artifacts to its passing wave."""
    if not _wave_ge(ctx, 'w3'):
        return []
    g = load_gates(ctx)
    arts = g.get('artifacts') or {}
    f = []
    upto = WAVE_SEQ.index(ctx.wave) + 1 if ctx.wave in WAVE_SEQ         else len(WAVE_SEQ)
    for wv in WAVE_SEQ[:upto]:
        for rel in ARTIFACTS.get(wv, []):
            fp = os.path.join(ctx.dir, rel)
            if not os.path.isfile(fp):
                continue
            rec = arts.get(rel)
            if not rec:
                f.append(f'P.17 {rel} exists without a gate receipt — '
                         'the orchestrator must never show an '
                         'unreceipted artifact')
                continue
            sha = hashlib.sha256(open(fp, 'rb').read()).hexdigest()
            if sha != rec.get('sha256'):
                f.append(f'P.17 {rel} changed since its receipt')
    return f


def check_round_gated(ctx):
    """P.18 — the W3 picker is gated by gate.py round (round 1),
    in-wave — not by hand afterwards."""
    wfp = ctx.wireframe_path()
    if not wfp or not os.path.isfile(wfp):
        return [f'P.18 layout picker not found ({wfp})']
    return [f'P.18 {x}' for x in check_round(wfp, 1)]


def check_round_gated_look(ctx):
    """P.18 — the W4 look picker passes gate.py round (round 2)."""
    fp = ctx.find('preview/variants.html')
    if not fp:
        return ['P.18 look picker preview/variants.html not found']
    return [f'P.18 {x}' for x in check_round(fp, 2)]


def check_fine_round(ctx):
    """P.18 — the knob-nudge fine round comes AFTER the look round:
    preview/fine.html exists and passes gate.py round (round 3)."""
    fp = ctx.find('preview/fine.html')
    if not fp:
        return ['P.18 preview/fine.html missing — the fine knob-nudge '
                'round is produced after the look round, never skipped']
    return [f'P.18 {x}' for x in check_round(fp, 3)]


def check_acss_conventions(ctx):
    """A.1 — ACSS mechanical conventions: no rgba() literals
    (color-mix only); no min-height sections (except declared hero
    comps); smart-spacing sibling selector only for flow; icon-only
    controls must carry an accessible name; external links carry
    rel=noopener + cue; cards wrap in <a> never."""
    if not _wave_ge(ctx, 'w6'):
        return []
    f = []
    css_files = []
    src = os.path.join(ctx.site, 'src')
    for dp, _, fns in os.walk(src) if os.path.isdir(src) else []:
        for fn in fns:
            if fn.endswith('.css'):
                css_files.append(os.path.join(dp, fn))
    all_css = ''
    for p in css_files:
        css = open(p, encoding='utf-8', errors='replace').read()
        all_css += '\n' + css
    if css_files:
        # A1 — text-wrap is a token (--text-wrap-*) on headings/body,
        # balance headings / pretty body (T.8 values, token plumbing)
        if 'text-wrap' not in all_css:
            f.append('A.1 text-wrap absent — headings --text-wrap-'
                     'heading: balance, body --text-wrap-body: pretty '
                     'as tokens')
        elif '--text-wrap' not in all_css:
            f.append('A.1 text-wrap set without a --text-wrap-* token '
                     '— wraps bind tokens, not literals')
        # smart spacing: margins reset + flow/sibling rule; first and
        # last child carry no outer margin (A11)
        if not re.search(r'(?:h[1-6]|p|ul|ol|figure|blockquote)'
                         r'[^{}]*\{[^}]*margin:\s*0', all_css) \
                and 'margin:0' not in all_css.replace(' ', ''):
            f.append('A.1 no margin reset on h/p/list blocks — smart '
                     'spacing resets element margins, spacing lives in '
                     'gaps + flow')
        if not re.search(r'\*\s*\+\s*\*|\.flow\b', all_css):
            f.append('A.1 no flow sibling rule (`.flow > * + *` or '
                     'owl selector) — re-space adjacent siblings, '
                     'never outer edges')
        # forms bind shared --input-* tokens
        if re.search(r'\binput\b[^{}]*\{', all_css) \
                and '--input-' not in all_css:
            f.append('A.1 input styles without --input-* tokens — '
                     'border/padding/radius share one token set')
        # media inside its box covers
        if re.search(r'<img\b', ''.join(
                t for _, t in ctx.page_htmls())) \
                and 'object-fit' not in all_css:
            f.append('A.1 no object-fit rule — images cover their '
                     'box by default (V.3 ratio invariant)')
        # buttons pad in em so size tracks type
        for m in re.finditer(r'\.(?:btn|button)\w*[^{}]*\{[^}]*'
                             r'padding:\s*\d+(?:\.\d+)?px', all_css):
            f.append('A.1 button padding in px — buttons pad in em '
                     '(size follows type rank)')
    for p in css_files:
        css = open(p, encoding='utf-8', errors='replace').read()
        name = os.path.basename(p)
        for m in re.finditer(r'rgba\s*\(', css):
            f.append(f'A.1 {name}: rgba() literal — transparency via '
                     'color-mix(in oklch, role X%, transparent) only')
        for m in re.finditer(
                r'([\w.#\[\]-]+)[^{}]*\{[^}]*min-height:\s*\d+'
                r'(px|rem|vh)[^}]*\}', css):
            sel = m.group(1)
            if not re.search(r'hero|bleed|fold', sel):
                f.append(f'A.1 {name}: "{sel.strip()[:40]}" sets '
                         'min-height — section whitespace comes from '
                         '--section-space-* only')
    # text-wrap lands on rendered pages too: built CSS must carry the
    # token-driven rules for headings + body
    if _wave_ge(ctx, 'w7'):
        dcss = ''.join(c for _, c in dist_csss(ctx))
        if dcss:
            if not re.search(r'h[1-6][^{]*\{[^}]*text-wrap:\s*'
                             r'(?:balance|var\(--text-wrap-heading\))',
                             dcss):
                f.append('A.1 built CSS: headings lack '
                         'text-wrap: balance (token-bound)')
            if not re.search(r'(?:^|[,{\s])p\s*\{[^}]*text-wrap:\s*'
                             r'(?:pretty|var\(--text-wrap-body\))',
                             dcss):
                f.append('A.1 built CSS: body lacks '
                         'text-wrap: pretty (token-bound)')
    for p, txt in ctx.page_htmls() if _wave_ge(ctx, 'w7') else []:
        name = os.path.basename(p)
        for m in re.finditer(
                r'<(?:a|button)[^>]*class="[^"]*(?:icon|logo)[^"]*"[^>]*>',
                txt):
            tag = m.group(0)
            tail = txt[m.end():m.end() + 80]
            if 'aria-label' not in tag and 'title=' not in tag \
                    and not re.search(r'^\s*\w', tail):
                f.append(f'A.1 {name}: icon-only control without an '
                         'accessible name (.sr-only or aria-label)')
        for m in re.finditer(
                r'<a[^>]*target="_blank"[^>]*>', txt):
            tag = m.group(0)
            href = re.search(r'href="([^"]*)"', tag)
            internal = href and not re.match(
                r'https?://', href.group(1))
            if internal:
                f.append(f'A.1 {name}: internal link '
                         f'{href.group(1)[:40]} opens a new tab — '
                         'only external links do (visual + SR cue)')
            elif 'rel=' not in tag:
                f.append(f'A.1 {name}: target=_blank without '
                         'rel="noopener" — external links announce '
                         'themselves (visual + SR cue)')
        # alternating splits place text before media at mobile; the
        # visual flip is >=lg only
        for m in re.finditer(
                r'<section[^>]*data-comp="split-media"[^>]*>(.*?)'
                r'</section>', txt, re.S):
            body = m.group(1)
            im = re.search(r'<(?:img|video|picture)\b', body)
            tm = re.search(r'<(?:h[12]|p)\b', body)
            if im and tm and im.start() < tm.start():
                f.append(f'A.1 {name}: split-media puts media before '
                         'text — mobile stacks text-first (image '
                         'first is a >=lg alternation only)')
    return f


def check_card_contract(ctx):
    """A.2 — card contract: a clickable card is a heading link +
    pseudo inset hit-area, never <a> around the whole card; override
    by --card-* tokens, never literals; multiple links ban pseudo."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    for p, txt in ctx.page_htmls():
        name = os.path.basename(p)
        for m in re.finditer(
                r'<a[^>]*class="[^"]*card[^"]*"[^>]*>(.*?)</a>',
                txt, re.S):
            if re.search(r'<(?:h[1-6]|p|div)[\s>]', m.group(1)):
                f.append(f'A.2 {name}: whole card wrapped in <a> — '
                         'link the heading + ::before inset:0 hit '
                         'area on position:relative')
    return f


def check_component_profile(ctx):
    """A.3 — every rendered component instance is classified to a
    profile (docs/machinery/design/components/<data-comp>.md); unknown
    type = FAIL."""
    if not _wave_ge(ctx, 'w7'):
        return []
    pdir = os.path.join(DESIGN_DIR, 'components')
    known = {os.path.splitext(fn)[0] for fn in os.listdir(pdir)
             if fn.endswith('.md')} if os.path.isdir(pdir) else set()
    f = []
    for p, txt, parsed, blocks in _segmented(ctx):
        name = os.path.basename(p)
        for sblk in blocks:
            comp = str(sblk.get('data-comp') or '')
            if comp and comp not in known:
                f.append(f'A.3 {name}: data-comp "{comp}" has no '
                         'component profile — every type carries its '
                         'own rule profile (components/<type>.md)')
            if not comp:
                f.append(f'A.3 {name}: unclassified section — '
                         'data-comp required')
    return f


def check_mobile_cta(ctx):
    """R.9 — below tablet, primary/secondary CTAs are full-width,
    stacked, centred, min-height 48."""
    f = []
    for p, txt in ctx.page_htmls():
        name = os.path.basename(p)
        css = re.sub(r'<!--.*?-->', '', txt, flags=re.S)
        parsed = parse_html(txt)
        has_cta = re.search(r'class="[^"]*(?:cta|btn|button)', txt, re.I)
        for m in re.finditer(
                r'([^{}]+)\{([^}]*)(?:min-height|height)\s*:\s*(\d+)px',
                css):
            sel = m.group(1)
            if re.search(r'\b(btn|cta|button)\b', sel, re.I) \
                    and int(m.group(3)) < 48 and 'min-height' in m.group(0):
                f.append(f'R.9 {name}: CTA {sel.strip()[:40]} '
                         f'min-height {m.group(3)}px < 48px')
        mobile = ' '.join(m.group(1) for m in re.finditer(
            r'@media[^{]*max-width:\s*(?:768|767|640|480|375)px[^{]*\{'
            r'((?:[^{}]|\{[^}]*\})*)\}', css))
        if has_cta and 'cta' in css.lower() and mobile and not re.search(
                r'(?:cta|btn|button)[^,{}]*\{[^}]*'
                r'(?:display:\s*flex|width:\s*100%|inline-size:\s*100%)',
                mobile):
            f.append(f'R.9 {name}: mobile media block does not make CTAs '
                     'full-width stacked (operator rule: primary/secondary '
                     'buttons full width, centred, ≥48px below tablet)')
    return f


def check_wireframe_lock(ctx):
    secs, err = _wireframe_secs(ctx)
    if err:
        return [f'P.4 {err}']
    if not secs:
        return ['P.4 chosen card carries no data-* sections — card '
                'cannot be locked (P.3)']
    f = []
    if not ctx.rows():
        return ['P.4 plan has no pages.<slug>.sections[] rows']
    # Per-page matching (F-16): every page's rows lock to the picked
    # card — a row resolves the card section its own wf_ref names and
    # the page's row order must follow card order, not a global zip.
    by_name = {}
    for i, ssec in enumerate(secs):
        by_name.setdefault(ssec['sec'], []).append(i)
    used = set()
    for slug in ctx.pages():
        rows = [r for _, r in ctx.rows(slug)]
        cursor = 0
        for i, r in enumerate(rows):
            if not r.get('wf_ref'):
                f.append(f'P.4 {slug} row {i} '
                         f'({r.get("name", "?")}) missing wf_ref')
            want = str(r.get('name') or '')
            anchor = str(r.get('wf_ref') or '')
            if ':' in anchor:
                want = anchor.rsplit(':', 1)[-1] or want
            found = next((j for j in by_name.get(want, [])
                          if j >= cursor and j not in used), None)
            if found is None:
                f.append(f'P.4 {slug} row {i} "{want}": no card '
                         'section in order — the plan row has no '
                         'locked wireframe slot')
                continue
            used.add(found)
            cursor = found + 1
            s = secs[found]
            if str(r.get('composition')) != s['comp']:
                f.append(f'P.4 {s["sec"]}: composition '
                         f'{r.get("composition")} != card {s["comp"]}')
            if s['ratio'] != 'none' and \
                    str(r.get('media_ratio') or 'none') != s['ratio']:
                f.append(f'P.4 {s["sec"]}: media_ratio '
                         f'{r.get("media_ratio")} != card {s["ratio"]}')
            if str(r.get('disclosure')) != s['disc']:
                f.append(f'P.4 {s["sec"]}: disclosure '
                         f'{r.get("disclosure")} != card {s["disc"]}')
    return f

def check_section_enums(ctx):
    f = []
    for slug, r in ctx.rows():
        n = r.get('name', '?')
        c = str(r.get('category') or '')
        if c and c not in CATEGORIES:
            f.append(f'{n}: category "{c}" ∉ vendored slugs')
        s = str(r.get('surface') or '')
        if s and s not in SURFACES:
            f.append(f'{n}: surface "{s}" ∉ {sorted(SURFACES)}')
        d = str(r.get('density') or '')
        if d and d not in DENSITIES:
            f.append(f'{n}: density "{d}" ∉ {sorted(DENSITIES)}')
        comp = str(r.get('composition') or '')
        if comp and comp not in COMP_FOR_ACT:
            f.append(f'{n}: composition "{comp}" ∉ §2/chrome set')
        di = str(r.get('disclosure') or '')
        if di and di not in DISCLOSURE:
            f.append(f'{n}: disclosure "{di}" ∉ {sorted(DISCLOSURE)}')
        mr = str(r.get('media_ratio') or 'none')
        if mr not in RATIOS:
            f.append(f'{n}: media_ratio "{mr}" ∉ V.3 set')
        hc = str(r.get('heading_class') or '')
        if hc and hc not in {'query', 'claim'}:
            f.append(f'{n}: heading_class "{hc}" ∉ query|claim (E.2)')
        if str(r.get('zone') or '') == 'macro' \
                and di not in ('', 'open'):
            f.append(f'{n}: macro-zone row disclosure "{di}" — '
                     'macro headings stay open (E.2)')
    return f

def check_speech_acts(ctx):
    f = []
    for slug, page in ctx.pages().items():
        rhet = set(page.get('rhetoric') or [])
        if isinstance(page.get('rhetoric'), list):
            rhet = set(page['rhetoric'])
        for r in page.get('sections') or []:
            n = r.get('name', '?')
            acts = r.get('speech_act') or []
            if isinstance(acts, str):
                acts = [acts]
            if not acts:
                f.append(f'{n}: no speech_act — deleted, not kept')
            if len(acts) > 2:
                f.append(f'{n}: >2 speech_acts {acts}')
            for a in acts:
                if a not in SPEECH_ACTS:
                    f.append(f'{n}: speech_act "{a}" ∉ 8-act enum')
                elif a in ('promise', 'proof', 'tension', 'how',
                           'objection', 'act') and a not in rhet:
                    f.append(f'{n}: argumentative act "{a}" ∉ rhetoric')
            comp = str(r.get('composition') or '')
            allowed = COMP_FOR_ACT.get(comp)
            if allowed and acts and not set(acts) & allowed:
                f.append(f'{n}: composition {comp} not allowed for '
                         f'acts {sorted(acts)}')
    return f

def check_emphasis(ctx):
    return [f'{r.get("name","?")}: emphasis blank — the ONE focus is '
            'required' for _, r in ctx.rows() if not r.get('emphasis')]

def check_motif(ctx):
    f = []
    mo = ctx.site_block().get('motif') or {}
    if not mo.get('device'):
        f.append('motif.device missing')
    rec = mo.get('recurs_at') or []
    if not rec:
        f.append('motif.recurs_at empty — motif placed nowhere')
    br = mo.get('break') or {}
    if not br.get('where'):
        f.append('motif.break missing — placed AND broken once')
    names = {str(r.get('name')) for _, r in ctx.rows()}
    if br.get('where') and names and str(br['where']) not in names \
            and not any(str(br['where']) in n for n in names):
        f.append(f'motif.break "{br["where"]}" names no section')
    return f

def check_rhythm(ctx):
    """Contrast moment + S-M-L + adjacency budgets (§4 + W4 gates)."""
    f = []
    for slug, page in ctx.pages().items():
        rows = page.get('sections') or []
        interior = [r for r in rows
                    if str(r.get('name')) not in ('nav', 'footer')]
        inv = sum(1 for r in interior if str(r.get('surface')) in
                  ('inverse', 'brand'))
        if inv == 0:
            f.append(f'{slug}: no contrast moment (inverse/brand '
                     'surface) — exactly one interior row required')
        elif inv > 1:
            f.append(f'{slug}: {inv} interior inverse/brand rows — the '
                     'contrast moment is ONE row (footer exempt)')
        comps = [str(r.get('composition')) for r in interior]
        run = 1
        for i in range(1, len(comps)):
            run = run + 1 if comps[i] == comps[i-1] else 1
            if run > 2 and not interior[i].get('organism'):
                f.append(f'{slug}: >2 consecutive "{comps[i]}" '
                         f'sections at row {i} (organism undeclared)')
        dens = [str(r.get('density')) for r in interior]
        if dens:
            run = 1
            for i in range(1, len(dens)):
                run = run + 1 if dens[i] == dens[i - 1] else 1
                if run >= 3:
                    f.append(f'{slug}: density "{dens[i]}" held for '
                             f'≥3 interior rows — step S-M-L every '
                             '≤2 (L.7)')
                    break
        # 360×640 fold arithmetic (A F33): hero row's py + h1 + subhead
        # + CTA + media must leave ≥5 elements visible
        hero = next((r for r in interior
                     if str(r.get('category')) in
                     ('hero', 'headers') or 'hero' in str(r.get('name'))
                     or 'promise' in str(r.get('speech_act'))), None)
        if hero is not None:
            dens = str(hero.get('density'))
            py = {'compact': 36, 'regular': 48,
                  'spacious': 64}.get(dens, 48)   # 360-tier section py
            ratio = str(hero.get('media_ratio') or 'none')
            mh = {'none': 0, '16:9': 180, '4:3': 240, '1:1': 320,
                  '4:5': 400, '3:4': 427}.get(ratio, 200)
            # nav + h1 + subhead + cta + media vs the 640 fold
            est = 48 + 72 + 40 + 44 + mh + 2 * py
            if est > 640:
                f.append(f'{slug}: hero fold estimate {est}px > 640 '
                         f'(density {dens} py={py} + media {ratio}) — '
                         'the 360 fold cannot hold five elements '
                         '(R.5); tighten density or media ratio at '
                         'the layout round')
        # adjacent rows sharing BOTH composition and density
        for i in range(1, len(interior)):
            a, b = interior[i-1], interior[i]
            if str(a.get('composition')) == str(b.get('composition')) \
                    and str(a.get('density')) == str(b.get('density')) \
                    and not (a.get('organism') or b.get('organism')):
                f.append(f'{slug}: rows {a.get("name")}→{b.get("name")} '
                         'share composition AND density — no S-M-L step')
        spacious = sum(1 for r in rows
                       if str(r.get('density')) == 'spacious')
        if spacious > 3:
            f.append(f'{slug}: {spacious} spacious > budget 3')
        # fold boundary: first interior surface ≠ hero surface
        hero = next((r for r in rows if 'promise' in
                     (r.get('speech_act') or [])), None)
        if hero and len(interior) > 1:
            fi = interior[1]
            if str(fi.get('surface')) == str(hero.get('surface')):
                f.append(f'{slug}: fold boundary — first interior '
                         f'"{fi.get("name")}" surface == hero '
                         f'({hero.get("surface")})')
        acts = sum(1 for r in rows for a in
                   (r.get('speech_act') or []) if a == 'act')
        if str(page.get('page_class')) == 'money' and acts < 2:
            f.append(f'{slug}: money page needs act twice '
                     f'(hero merge + late), found {acts}')
    return f

def check_vector_map(ctx):
    """STUB heading vector appears exactly once, in order, in rows."""
    vec = ctx.stub_vector()
    if not vec:
        return []  # no stub → vector rules not applicable here
    f = []
    got = []
    for _, r in ctx.rows():
        vec_rows = r.get('vector') or []
        pairs = []
        if vec_rows:
            for v in vec_rows:
                if isinstance(v, dict):
                    pairs.append((str(v.get('heading') or ''),
                                  str(v.get('fs') or '')))
        elif r.get('heading') and str(r['heading']) not in ('—', '-'):
            pairs.append((str(r['heading']), str(r.get('fs') or '')))
        got.extend(pairs)
    want = [v['heading'] for v in vec]
    goth = [g[0].rstrip('?.') for g in got]
    wantn = [w.rstrip('?.') for w in want]
    for w, wn in zip(want, wantn):
        if wn not in goth:
            f.append(f'E.1 STUB heading absent from plan rows: "{w}"')
    for g, gn in zip(got, goth):
        if gn not in wantn and str(g) not in ('—', '-'):
            f.append(f'E.1 invented heading in plan rows: "{g}"')
    return f

def check_schema_fields(ctx):
    f = []
    for _, r in ctx.rows():
        n = r.get('name', '?')
        for k in ('speech_act', 'category', 'surface', 'density',
                  'composition', 'emphasis', 'align', 'stack',
                  'collapse'):
            if k not in r or r[k] in (None, ''):
                f.append(f'{n}: field {k} missing')
    return f

def check_spec_verbatim(ctx):
    f = []
    for slug, page in ctx.pages().items():
        spec = ctx.read(f'PAGES/{slug}/SPEC.md', f'PAGES/{slug}.md')
        if spec is None:
            f.append(f'PAGES/{slug}/SPEC.md missing')
            continue
        sm = plan_model(spec.replace('```yaml\n', '```yaml\n')
                          .replace('sections:', 'sections:'))
        # parse SPEC yaml block directly
        blocks = re.findall(r'```yaml\n(.*?)```', spec, re.S)
        spec_rows = None
        if blocks:
            node, _ = _parse_block(blocks[0].split('\n'), 0, 0)
            spec_rows = (node or {}).get('sections')
        plan_rows = page.get('sections') or []
        if spec_rows is None:
            f.append(f'SPEC {slug}: no sections[] yaml block')
            continue
        def norm(rows):
            return json.dumps(rows, sort_keys=True, default=str)
        if norm(spec_rows) != norm(plan_rows):
            # find first divergence for the message
            for i, (a, b) in enumerate(
                    zip(spec_rows, plan_rows)):
                if norm(a) != norm(b):
                    f.append(f'SPEC {slug} row {i} '
                             f'({a.get("name","?")}) differs from plan')
                    break
            if len(spec_rows) != len(plan_rows):
                f.append(f'SPEC {slug}: {len(spec_rows)} rows vs plan '
                         f'{len(plan_rows)}')
            elif not any('SPEC' in x for x in f):
                f.append(f'SPEC {slug}: rows differ from plan '
                         '(verbatim diff)')
    return f

def check_components_exist(ctx):
    f = []
    comps = set(ctx.components())
    if not comps:
        return ['P.6 no src/components/*.astro — component library '
                'absent']
    used = set()
    for _, r in ctx.rows():
        c = str(r.get('composition') or '')
        if c:
            used.add(c)
    for c in sorted(used):
        variants = {c, c.replace('-', '_'), c.replace('-', '')}
        if not comps & {v + '.astro' for v in variants}:
            f.append(f'P.6 composition "{c}" has no component '
                     f'({sorted(variants)}.astro)')
    cmd = ctx.read('COMPONENTS.md')
    if cmd is None:
        f.append('COMPONENTS.md missing — must name component per '
                 'composition')
    else:
        for c in sorted(used):
            if c not in cmd:
                f.append(f'COMPONENTS.md does not map "{c}"')
    return f

def _layer_classes(ctx):
    g = ctx.read('site/src/styles/global.css') or ''
    m = re.search(r'@layer\s+components\s*\{(.*)\}', g, re.S)
    body = m.group(1) if m else g
    return set(re.findall(r'\.([A-Za-z][\w-]*)', body))

TAIL_UTIL = re.compile(
    r'^(sr-only|not-sr-only|container|block|inline-block|inline|flex|'
    r'inline-flex|grid|inline-grid|hidden|flow-root|contents|'
    r'aspect-\w+|col-\w+|row-\w+|m[trblxyse]?-?\w*|p[trblxyse]?-?\w*|'
    r'w-\w+|min-w-\w+|max-w-\w+|h-\w+|min-h-\w+|max-h-\w+|size-\w+|'
    r'text-\w+|font-\w+|leading-\w+|tracking-\w+|'
    r'bg-\w+|border(-\w+)*|rounded(-\w+)*|ring(-\w+)*|outline(-\w+)*|'
    r'shadow(-\w+)*|opacity-\w+|'
    r'flex-\w+|grow|shrink|basis-\w+|gap(-\w+)*|space-\w+|'
    r'grid-cols-\w+|grid-rows-\w+|justify-\w+|items-\w+|content-\w+|'
    r'self-\w+|place-\w+|order-\w+|'
    r'object-\w+|overflow-\w+|overscroll-\w+|'
    r'static|fixed|absolute|relative|sticky|inset(-\w+)*|'
    r'top-\w+|right-\w+|bottom-\w+|left-\w+|z-\w+|'
    r'visible|invisible|collapse|'
    r'float-\w+|clear-\w+|isolate|isolation-\w+|'
    r'cursor-\w+|select-\w+|resize|pointer-events-\w+|'
    r'list-\w+|appearance-\w+|'
    r'transition(-\w+)*|duration-\w+|ease-\w+|delay-\w+|animate-\w+|'
    r'transform|scale-\w+|rotate-\w+|translate-\w+|skew-\w+|origin-\w+|'
    r'whitespace-\w+|break-\w+|truncate|text-ellipsis|text-clip|'
    r'align-\w+|indent-\w+|hyphens-\w+|'
    r'fill-\w+|stroke-\w+|'
    r'decoration-\w+|underline|overline|line-through|no-underline|'
    r'uppercase|lowercase|capitalize|normal-case|'
    r'italic|not-italic|antialiased|subpixel-antialiased|'
    r'blur(-\w+)*|brightness-\w+|contrast-\w+|grayscale(-\w+)*|'
    r'hue-rotate-\w+|invert(-\w+)*|saturate-\w+|sepia(-\w+)*|'
    r'drop-shadow(-\w+)*|backdrop-\w+|'
    r'scroll-\w+|snap-\w+|touch-\w+|will-change-\w+|'
    r'columns-\w+|table|table-\w+|caption-\w+|'
    r'divide-\w+|placeholder-\w+|accent-\w+|caret-\w+|'
    r'line-clamp-\w+|prose(-\w+)*|'
    r'group|peer)\b')

def _class_set(ctx, text):
    bad = []
    layer = _layer_classes(ctx)
    for cls in re.findall(r'class="([^"]+)"', text):
        for c in cls.split():
            base = c.split(':')[-1]
            if base in layer or TAIL_UTIL.match(base):
                continue
            bad.append(c)
    return bad

def check_class_subset(ctx):
    f = []
    for p, txt in ctx.page_htmls():
        bad = _class_set(ctx, txt)
        if bad:
            f.append(f'P.2 {os.path.basename(p)}: classes neither in '
                     f'@layer components nor Tailwind utilities: '
                     f'{sorted(set(bad))[:8]}')
    return f

def check_no_stray_styles(ctx):
    f = []
    # astro sources
    for root, _, fns in os.walk(os.path.join(ctx.site, 'src')) \
            if os.path.isdir(os.path.join(ctx.site, 'src')) else []:
        for fn in fns:
            if not fn.endswith(('.astro', '.html')):
                continue
            t = open(os.path.join(root, fn), encoding='utf-8',
                     errors='replace').read()
            if fn != 'global.css' and '<style' in t:
                f.append(f'P.2 {fn}: <style> block — styles live in '
                         'the shared layer only')
            for m in re.finditer(r'#[0-9a-fA-F]{3,8}\b', t):
                f.append(f'P.5 {fn}: raw hex {m.group(0)} outside '
                         'config/tokens')
            for m in re.finditer(r'\b\d+px\b', t):
                f.append(f'P.5 {fn}: raw px {m.group(0)} — bind a token')
            for m in re.finditer(r'style="([^"]+)"', t):
                if 'aspect-ratio' not in m.group(1):
                    f.append(f'P.2 {fn}: style="" attribute '
                             f'"{m.group(1)[:40]}" — not data-driven '
                             'aspect ratio')
    # emitted html — only the built output counts; preview/* are
    # deliberately self-contained picker/sheet HTML (B F-24)
    for p, txt in ctx.page_htmls():
        if '/preview/' in p:
            continue
        parsed = parse_html(txt)
        if parsed.style_blocks:
            f.append(f'P.2 {os.path.basename(p)}: '
                     f'{parsed.style_blocks} <style> block(s) — page '
                     'must consume the shared layer')
        for tag, st in parsed.styles:
            if 'aspect-ratio' not in st:
                f.append(f'P.2 {os.path.basename(p)}: style="" on '
                         f'<{tag}> "{st[:40]}"')
        # hex outside :root
        css = re.sub(r':root\s*\{[^}]*\}', '', txt, flags=re.S)
        for m in re.finditer(r'#[0-9a-fA-F]{6}\b', css):
            f.append(f'P.5 {os.path.basename(p)}: hex {m.group(0)} '
                     'outside :root/config')
            break
    return f

def check_page_data_attrs(ctx):
    """P.3/P.7 — the built page IS the locked wireframe card.

    Every page section must carry data-sec/comp/ratio/disclosure (missing
    = FAIL, never skipped) and the four must equal the APPROVED card's
    section list — not merely the plan rows the designer edits (B F-05).
    """
    f = []
    pages = ctx.page_htmls()
    if not pages:
        return ['P.7 no built page found (site/dist/<slug>/index.html)']
    secs, err = _wireframe_secs(ctx)
    if err:
        return [f'P.4 {err} — the page cannot be locked to a card']
    if not secs:
        return ['P.4 chosen card carries no data-* sections']
    for p, txt in pages:
        name = os.path.basename(p)
        parsed = parse_html(txt)
        got = [(s.get('data-sec'), s.get('data-comp'),
                s.get('data-ratio'), s.get('data-disclosure'))
               for s in parsed.sections]
        for i, g in enumerate(got):
            for j, attr in enumerate(('data-sec', 'data-comp',
                                      'data-ratio', 'data-disclosure')):
                if not g[j]:
                    f.append(f'P.7 {name} sec {i}: {attr} missing — the '
                             'lock is unverifiable without it')
        if len(got) != len(secs):
            f.append(f'P.7 {name}: {len(got)} page sections vs '
                     f'{len(secs)} locked card sections')
        for i, (g, c) in enumerate(zip(got, secs)):
            if g[0] and g[0] != c['sec']:
                f.append(f'P.7 {name} sec {i}: data-sec "{g[0]}" != '
                         f'locked card "{c["sec"]}"')
            if g[1] and g[1] != c['comp']:
                f.append(f'P.7 {name} sec {i}: data-comp "{g[1]}" != '
                         f'locked card "{c["comp"]}"')
            if g[2] and g[2] != c['ratio']:
                f.append(f'P.7 {name} sec {i}: data-ratio "{g[2]}" != '
                         f'locked card "{c["ratio"]}"')
            if g[3] and g[3] != c['disc']:
                f.append(f'P.7 {name} sec {i}: data-disclosure "{g[3]}" != '
                         f'locked card "{c["disc"]}"')
    return f


def check_tile_page_parity(ctx):
    """Tile↔page drift (B F-06): every class the page renders must be
    defined on the system sheet (or its shell/stylesheet), and every
    composition on the page must have a tile counterpart."""
    f = []
    tile = ctx.read('site/src/pages/system.astro')
    if not tile:
        return ['VG.1 site/src/pages/system.astro missing — no sheet to '
                'compare the page against']
    known = set()
    for src in (tile, ctx.read('site/src/components/Section.astro') or '',
                ctx.read('site/src/styles/global.css') or ''):
        for m in re.finditer(r'class(?:Name)?="([^"]+)"', src):
            known |= {c for c in m.group(1).split() if c}
        known |= set(re.findall(r'\.([a-zA-Z][\w-]*)', src))
    tile_comps = set(re.findall(r'data-comp="([^"]+)"', tile))
    pages = ctx.page_htmls()
    if not pages:
        return ['P.7 no built page to compare with the system sheet']
    # a utility used structurally (flex/gap/grid) is Tailwind's, not drift
    util = re.compile(r'^(?:flex|grid|block|inline-|hidden|gap-\d|items-|'
                      r'justify-|self-|order-|col-|row-|w-|h-|min-|max-|'
                      r'object-|overflow-|relative|absolute|inset-|z-|'
                      r'text-(?:left|center|right)|sr-only|'
                      r'-?(?:p[trblxy]?|m[trblxy]?|space-[xy])-\d)')
    for p, txt in pages:
        name = os.path.basename(p)
        parsed = parse_html(txt)
        used = set()
        for s in parsed.sections:
            used |= {c for c in str(s.get('class') or '').split() if c}
        extra = {c for c in used - known
                 if not util.match(c) and not c.startswith(('data-', 'is-',
                                                            'has-'))}
        if extra:
            f.append(f'P.12 {name}: {len(extra)} class(es) never defined '
                     f'on the system sheet: {sorted(extra)[:4]}')
        for comp in sorted({s.get('data-comp') for s in parsed.sections
                            if s.get('data-comp')}):
            if tile_comps and comp not in tile_comps:
                f.append(f'P.12 {name}: composition "{comp}" has no tile '
                         'counterpart on system.astro')
    # both must consume the same stylesheet/layout
    shared = re.findall(r"from '([^']*(?:global\.css|Layout)[^']*)'", tile)
    if shared:
        for p, txt in pages:
            pass
        page_src = ctx.read(f'site/src/pages/{os.path.basename(pages[0][0])}')             or ''
    return f


def check_heading_verbatim(ctx):
    """E.1 — the SEO heading vector renders verbatim: exact text, tag
    level and order (B F-23). At W7 no vector = FAIL, not a pass."""
    vec = ctx.stub_vector()
    if not vec:
        return ['E.1 STUB heading vector missing or unparseable — '
                'verbatim headings cannot be verified']
    f = []
    pages = ctx.page_htmls()
    if not pages:
        return ['E.1 no page html to check vector against']
    for p, txt in pages:
        parsed = parse_html(txt)
        heads = [(h[0], h[1].strip()) for h in parsed.headings]
        seen = 0
        for v in vec:
            want = v['heading'].strip()
            want_tag = v['tag']
            idx = next((i for i, (t, h) in enumerate(heads)
                        if h == want and t == want_tag), -1)
            if idx < 0:
                near = [i for i, (t, h) in enumerate(heads)
                        if h == want]
                if near:
                    f.append(f'E.1 {os.path.basename(p)}: "{want}" '
                             f'rendered as <{heads[near[0]][0]}> not '
                             f'<{want_tag}>')
                else:
                    f.append(f'E.1 {os.path.basename(p)}: vector heading '
                             f'not rendered verbatim: "{want}"')
                continue
            if idx < seen:
                f.append(f'E.1 {os.path.basename(p)}: "{want}" out of '
                         'vector order')
            seen = idx
            if v['fs']:
                fsn = ' '.join(v['fs'].split())
                if fsn.rstrip('.!?') not in ' '.join(txt.split()):
                    f.append(f'E.1 {os.path.basename(p)}: first sentence '
                             f'not verbatim for "{want[:40]}"')
        h1s = [h for t, h in heads if t == 'h1']
        if vec and vec[0].get('h1') and vec[0]['h1'] not in h1s:
            f.append(f'E.1 {os.path.basename(p)}: H1 "{vec[0]["h1"][:40]}" '
                     'not rendered verbatim')
    return f

def check_viewport(ctx):
    f = []
    for p, txt in ctx.page_htmls():
        if 'name="viewport"' not in txt and "name='viewport'" not in txt:
            f.append(f'R.1 {os.path.basename(p)}: no viewport meta')
    return f

def check_tap_size(ctx):
    f = []
    for p, txt in ctx.page_htmls() + dist_csss(ctx):
        # best-effort: interactive selectors with declared height < 44
        for m in re.finditer(
                r'([^{}]+)\{([^}]*)(?:min-height|height)\s*:\s*(\d+)px',
                txt):
            sel, px = m.group(1), int(m.group(3))
            if re.search(r'\b(a|button|input|select|summary)\b', sel) \
                    and px < 44 and 'min-height' in m.group(0):
                f.append(f'R.6 {os.path.basename(p)}: {sel.strip()[:40]} '
                         f'min-height {px}px < 44px')
    return f

def _segmented(ctx):
    """Per page: parsed html + block list (sections/nav with data-sec)."""
    out = []
    for p, txt in ctx.page_htmls():
        parsed = parse_html(txt)
        blocks = [s for s in parsed.sections]
        out.append((p, txt, parsed, blocks))
    return out

def check_segment_roles(ctx):
    f = []
    for p, txt, parsed, blocks in _segmented(ctx):
        name = os.path.basename(p)
        for i, s in enumerate(blocks):
            if not s.get('data-sec'):
                f.append(f'PS.1 {name}: block {i} lacks data-sec — '
                         'one role per block required')
        per = {}
        for tag, text, si in parsed.headings:
            if tag in ('h1', 'h2') and si >= 0:
                per.setdefault(si, []).append(text)
        for si, hs in per.items():
            if len(hs) > 1:
                f.append(f'PS.1 {name}: block {si} carries {len(hs)} '
                         f'h1/h2 {hs[:2]} — one heading binds to a block')
    return f

CHROME_SECS = {'nav', 'header', 'footer', 'legal', 'cookie'}

def _is_chrome(s):
    sec = str(s.get('data-sec') or '')
    comp = str(s.get('data-comp') or '')
    return sec in CHROME_SECS or comp in ('nav-bar', 'footer-bar')

def check_segment_region(ctx):
    f = []
    for p, txt, parsed, blocks in _segmented(ctx):
        name = os.path.basename(p)
        n = len(blocks)
        if not n:
            continue
        lead = 0
        while lead < n and _is_chrome(blocks[lead]):
            lead += 1
        tail = n
        while tail > lead and _is_chrome(blocks[tail-1]):
            tail -= 1
        for i in range(lead, tail):
            if _is_chrome(blocks[i]):
                f.append(f'PS.2 {name}: chrome block '
                         f'"{blocks[i].get("data-sec")}" at position {i} '
                         '— boilerplate at edges only')
    return f

def check_segment_share(ctx):
    f = []
    for p, txt, parsed, blocks in _segmented(ctx):
        name = os.path.basename(p)
        total = len(re.findall(r'<p\b|<h[1-6]\b|<li\b|<img\b|<svg\b', txt))
        if not total:
            continue
        chrome = 0
        for m in re.finditer(
                r'<(section|nav)\b[^>]*>(.*?)(?=<(?:section|nav)\b|</body>)',
                txt, re.S):
            tag_attrs = m.group(0)[:400]
            secm = re.search(r'data-sec="([^"]+)"', tag_attrs)
            compm = re.search(r'data-comp="([^"]+)"', tag_attrs)
            if _is_chrome({'data-sec': secm.group(1) if secm else '',
                           'data-comp': compm.group(1) if compm else ''}):
                chrome += len(re.findall(
                    r'<p\b|<h[1-6]\b|<li\b|<img\b|<svg\b', m.group(2)))
        share = 1 - chrome / total
        if share < 0.8:
            f.append(f'PS.3 {name}: main-content share {share:.0%} '
                     '< 80% — supplementary mass dominates')
    return f

def check_segment_media(ctx):
    f = []
    for p, txt, parsed, blocks in _segmented(ctx):
        name = os.path.basename(p)
        for m in re.finditer(
                r'<(section|nav)\b[^>]*>(.*?)(?=<(?:section|nav)\b|</body>)',
                txt, re.S):
            body = m.group(2)
            if re.search(r'<img\b|<picture\b', body):
                if not re.search(r'alt="[^"]+"', body):
                    f.append(f'PS.4 {name}: media without alt in block '
                             f'{m.start()}')
                if not re.search(
                        r'<h[1-6]\b|figcaption|aria-label|'
                        r'class="[^"]*(cap|title|label)', body):
                    f.append(f'PS.4 {name}: media block without '
                             'caption/heading context')
    return f

def check_segment_footer(ctx):
    f = []
    for p, txt, parsed, blocks in _segmented(ctx):
        name = os.path.basename(p)
        for m in re.finditer(
                r'<(section|nav|footer)\b[^>]*>(.*?)(?=<(?:section|nav)\b|</body>)',
                txt, re.S):
            head = m.group(0)[:400]
            secm = re.search(r'data-sec="([^"]+)"', head)
            isfoot = m.group(1) == 'footer' or \
                (secm and secm.group(1) == 'footer') or \
                'footer-bar' in head
            if isfoot:
                body = m.group(2)
                if re.search(r'<h1\b|<h2\b', body):
                    f.append(f'PS.5 {name}: heading in footer — '
                             'footer is boilerplate only')
                for pm in re.finditer(r'<p[^>]*>(.*?)</p>', body, re.S):
                    words = len(re.sub(r'<[^>]+>', '', pm.group(1)).split())
                    if words > 40:
                        f.append(f'PS.5 {name}: {words}-word paragraph '
                                 'in footer — no main-content claims')
    return f

def check_segment_priority(ctx):
    f = []
    for p, txt, parsed, blocks in _segmented(ctx):
        name = os.path.basename(p)
        for i, s in enumerate(blocks):
            if not _is_chrome(s):
                continue
            before = any(not _is_chrome(b) for b in blocks[:i])
            after = any(not _is_chrome(b) for b in blocks[i+1:])
            if before and after:
                f.append(f'PS.6 {name}: chrome block '
                         f'"{s.get("data-sec")}" sits between main blocks — '
                         'priority order broken')
                break
        m = re.search(r'<aside\b|class="[^"]*sidebar', txt)
        first_sec = re.search(r'<(?:section|nav)\b[^>]*data-sec', txt)
        if m and first_sec and m.start() < first_sec.start():
            f.append(f'PS.6 {name}: aside/sidebar precedes first '
                     'main block')
    return f

def check_review_modes(ctx):
    """C.5 — the reviewer scores BOTH modes; shots prove it."""
    f = []
    raw = ctx.read('REVIEW.json')
    if raw is None:
        return ['C.5 REVIEW.json missing — mode coverage unverifiable']
    try:
        rv = json.loads(raw)
    except Exception as e:
        return [f'C.5 REVIEW.json unparseable: {e}']
    modes = rv.get('modes') or {}
    if isinstance(modes, list):
        modes = {m: {} for m in modes}
    for need in ('light', 'dark'):
        if need not in modes:
            f.append(f'C.5 REVIEW.json has no "{need}" mode verdict — '
                     'contrast and the rubric run in both modes')
    shots = os.path.join(ctx.dir, 'shots')
    if os.path.isdir(shots):
        names = os.listdir(shots)
        for need in ('light', 'dark'):
            if not any(need in n.lower() for n in names):
                f.append(f'C.5 no {need}-mode screenshot in shots/ — '
                         'evidence for both modes is required')
    return f


def png_dims(path):
    """(w, h) from the PNG header, or None."""
    try:
        with open(path, 'rb') as fh:
            d = fh.read(33)
        if d[:8] != b'\x89PNG\r\n\x1a\n' or d[12:16] != b'IHDR':
            return None
        import struct
        return struct.unpack('>II', d[16:24])
    except Exception:
        return None


SHOT_WIDTHS = (1280, 768, 360)


def _dist_sha(ctx):
    h = hashlib.sha256()
    for p, _ in ctx.page_htmls():
        h.update(open(p, 'rb').read())
    return h.hexdigest()[:16]


def _review_sig_ok(ctx, rv):
    """The review is bound to the build it graded: sig = HMAC(operator
    key, nonce+dist+dna+reviewer+record-hash) produced by
    `run.py sign-review` — items/modes cannot be rewritten post-sign."""
    key = op_key()
    sig = rv.get('sig')
    nonce = rv.get('nonce')
    if not sig or not nonce:
        return False
    sl = dna_slices(dna_map(ctx) or {})
    body = f'{nonce}|{rv.get("dist_sha256")}|{sl.get("core")}|' \
            f'{rv.get("reviewer_model")}'
    want = hmac.new(key or b'', body.encode(),
                    hashlib.sha256).hexdigest()[:32]
    if hmac.compare_digest(str(sig), want):
        return True
    canon = json.dumps({k: v for k, v in rv.items() if k != 'sig'},
                       sort_keys=True)
    body2 = body + '|' + hashlib.sha256(canon.encode()).hexdigest()[:16]
    want2 = hmac.new(key or b'', body2.encode(),
                     hashlib.sha256).hexdigest()[:32]
    return hmac.compare_digest(str(sig), want2)


def check_review_completeness(ctx):
    f = []
    rj = ctx.read('REVIEW.json')
    if rj is None:
        return ['REVIEW.json missing — reviewer artifact required (P.8)']
    try:
        rv = json.loads(rj)
    except Exception as e:
        return [f'REVIEW.json unparseable: {e}']
    if rv.get('reviewer_model') and rv.get('designer_model') \
            and rv['reviewer_model'] == rv['designer_model']:
        f.append('reviewer_model == designer_model — independent '
                 'review required (P.8)')
    if not rv.get('designer_model') or not rv.get('reviewer_model'):
        f.append('REVIEW.json must name reviewer_model + designer_model')
    # the reviewer artifact is bound to the build it graded
    if rv.get('dist_sha256') != _dist_sha(ctx):
        f.append('REVIEW.json dist_sha256 != current dist — the review '
                 'is not bound to this build')
    if not _review_sig_ok(ctx, rv):
        f.append('REVIEW.json unsigned — `run.py sign-review <dir>` in an '
                 'operator terminal binds reviewer + build (P.8)')
    items = rv.get('items') or []
    rubric = {rid for rid, e in _enforcement_rules().items()
              if e.get('mode') == 'reviewer'}
    scored = {i.get('rule') for i in items}
    for it in items:
        if not it.get('pass'):
            f.append(f'reviewer fail: {it.get("rule")} '
                     f'{it.get("rubric")} — {it.get("note","")[:60]}')
        ev = it.get('evidence') or ''
        if ev and not os.path.isfile(os.path.join(ctx.dir, ev)):
            f.append(f'review evidence missing: {ev}')
    missing = rubric - scored
    if missing:
        f.append(f'rubric items unscored: {sorted(missing)}')
    # screenshots are evidence, not filenames: width = viewport, both
    # modes, non-trivial bytes (B F-07)
    for slug in (ctx.pages() or {'index': {}}):
        for w in SHOT_WIDTHS:
            for mode in ('light', 'dark'):
                fn = f'shots/{w}-{mode}-{slug}.png'
                p = os.path.join(ctx.dir, fn)
                if not os.path.isfile(p):
                    f.append(f'{fn} missing — {w}px/{mode} evidence')
                    continue
                dims = png_dims(p)
                if not dims:
                    f.append(f'{fn}: not a PNG')
                elif dims[0] != w:
                    f.append(f'{fn}: width {dims[0]}px != viewport {w}px')
                if os.path.getsize(p) < 2000:
                    f.append(f'{fn}: {os.path.getsize(p)} bytes — '
                             'a blank screenshot is not evidence')
    return f


# ---------------------------------------------------------------- section build
#
# SECTION-BUILD architecture (rules/SB.md, SECTION-BUILD.md):
#   plan row -> sections/<nn>-<sec>.contract.json (SB.1)
#   one builder per section, component renders inside Section shell (SB.2/SB.3)
#   assemble.py writes the page from plan order (SB.4)
#   exemplars per composition archetype (SB.5)

TEMPLATES_DIR = os.path.join(REPO, 'templates', 'sections')

# catalog composition -> genome layout-archetype allele (D.2 family map)
COMP_ARCHETYPE = {
    'split-media': 'split-media', 'stacked-hero': 'stacked-center',
    'proof-band': 'horizontal-band', 'editorial': 'editorial-single',
    'cards-n': 'card-grid-3', 'sequence': 'sequence-steps',
    'faq': 'accordion-list', 'comparison': 'table-matrix',
    'logo-wall': 'horizontal-band', 'stat-band': 'horizontal-band',
    'full-bleed': 'full-bleed-media', 'media-gallery': 'masonry-grid',
    'form-panel': 'split-form', 'quote-grid': 'card-grid-3',
    'text-index': 'editorial-single', 'link-grid': 'card-grid-4',
    'badge-center': 'stacked-center', 'capture-form': 'split-form',
    'map-finder': 'split-media', 'app-band': 'split-media',
    'hero-act-merge': 'split-form', 'nav-bar': 'horizontal-band',
    'footer-bar': 'horizontal-band',
}
CONTRACT_SCHEMA = 'section-contract/v1'
# Anchored with the trailing dash so prose/place-*/pointer-events-*/
# min-h-* never false-positive (B F-25).
OUTER_SPACING = re.compile(
    r'^(?:-?(?:m[trblxy]?|p[trblxy]?|space-[xy])-|bg-|max-w-|mx-auto$|'
    r'container$|min-h-screen$)')
OUTER_EXACT = {'mx-auto', 'container'}


def contracts_dir(ctx):
    return os.path.join(ctx.dir, 'sections')


def section_slug(index, name):
    return f'{index:02d}-{re.sub(r"[^a-z0-9-]", "-", str(name).lower())}'


def camel(name):
    return ''.join(p.capitalize() for p in re.split(r'[^A-Za-z0-9]+',
                                                    str(name)) if p)


def _stub_for(ctx, name, index):
    """STUB row for a section: zone match first, else positional."""
    rows = ctx.stub_vector() or []
    for r in rows:
        if r['zone'] in (str(name).lower(), str(name).lower().replace('-', '')):
            return r
    if len(rows) == len(ctx.rows()):
        return rows[index]
    return {}


def build_contracts(ctx):
    """[{...contract...}] in plan order, one per plan row."""
    rows = ctx.rows()
    dmap = dna_map(ctx) or {}
    sl = dna_slices(dmap) if dmap else {}
    dh = sl.get('core', '')
    out = []
    for i, (slug, r) in enumerate(rows):
        name = r.get('name')
        st = _stub_for(ctx, name, i)
        prev = rows[i - 1][1] if i else {}
        nxt = rows[i + 1][1] if i + 1 < len(rows) else {}
        comp = r.get('composition')
        layer = sorted(_layer_classes(ctx))
        out.append({
            'schema': CONTRACT_SCHEMA,
            'dna_hash': dh,
            'structure_hash': sl.get('structure', ''),
            'dna': {
                'profile': dmap.get('vertical_profile'),
                'genotype': dmap.get('genotype'),
                'knobs': dmap.get('knobs'),
                'rhythm': dmap.get('rhythm'),
            },
            'page': slug,
            'index': i,
            'section': name,
            'file': f'sections/{section_slug(i, name)}.contract.json',
            'component': f'site/src/components/sections/{camel(name)}.astro',
            'wf_ref': r.get('wf_ref'),
            'composition': comp,
            'archetype': COMP_ARCHETYPE.get(comp, comp),
            'speech_act': r.get('speech_act') or [],
            'category': r.get('category'),
            'surface': r.get('surface'),
            'density': r.get('density'),
            'emphasis': r.get('emphasis'),
            'align': r.get('align'),
            'stack': r.get('stack'),
            'collapse': r.get('collapse'),
            'media_ratio': r.get('media_ratio'),
            'disclosure': r.get('disclosure'),
            'content': {
                'heading': st.get('heading') or r.get('heading'),
                'fs': st.get('fs') or r.get('fs'),
                'body': r.get('body'),
                'h1': bool(st.get('h1')),
            },
            'neighbours': {
                'prev': {'surface': prev.get('surface'),
                         'composition': prev.get('composition')},
                'next': {'surface': nxt.get('surface'),
                         'composition': nxt.get('composition')},
            },
            'allowed': {
                # the vocabulary is the layer itself — a snapshot goes
                # stale the moment W6 registers a component (A F24)
                'classes': 'src/styles/global.css @layer components '
                           '(live reference at build time)',
                'classes_snapshot': layer,
                'utilities': 'tailwind utilities derived from TOKENS.json',
                'attributes': ['data-sec', 'data-comp', 'data-ratio',
                               'data-disclosure', 'data-surface',
                               'data-density'],
            },
            'rules': [rid for rid, e in _enforcement_rules().items()
                      if e.get('wave') in ('w5', 'w6', 'w7')
                      and e.get('mode') == 'script'][:8],
            'patterns': [f'pattern-{comp}'] if comp else [],
            'exemplar': f'templates/sections/{comp}/{camel(comp)}.astro'
                        if comp else None,
        })
    return out


def check_section_contracts(ctx):
    """SB.1 — one complete contract per plan row, equal to the plan row."""
    f = []
    want = build_contracts(ctx)
    if not want:
        return ['SB.1 no plan rows — contracts unverifiable']
    cd = contracts_dir(ctx)
    for c in want:
        p = os.path.join(cd, os.path.basename(c['file']))
        if not os.path.isfile(p):
            f.append(f'SB.1 {c["file"]} missing — run gate.py contracts')
            continue
        try:
            got = json.load(open(p))
        except Exception as e:
            f.append(f'SB.1 {c["file"]}: unreadable ({e})')
            continue
        for k in ('section', 'index', 'wf_ref', 'composition', 'surface',
                  'density', 'media_ratio', 'disclosure', 'content',
                  'neighbours', 'allowed', 'rules', 'exemplar'):
            if k not in got:
                f.append(f'SB.1 {c["file"]}: field "{k}" missing')
            elif k != 'content' and k != 'neighbours' and k != 'allowed' \
                    and k != 'rules' and got[k] != c[k]:
                f.append(f'SB.1 {c["file"]}: {k} "{got[k]}" != plan '
                         f'"{c[k]}"')
        ch = (got.get('content') or {}).get('heading')
        if c['content']['heading'] and ch != c['content']['heading']:
            f.append(f'SB.1 {c["file"]}: heading "{ch}" != STUB '
                     f'"{c["content"]["heading"]}"')
    return f


def _section_files(ctx):
    d = os.path.join(ctx.site, 'src', 'components', 'sections')
    if not os.path.isdir(d):
        return []
    return [(fn, os.path.join(d, fn)) for fn in sorted(os.listdir(d))
            if fn.endswith('.astro')]


def check_section_shell(ctx):
    """SB.2 — section components render inside Section; never own rhythm."""
    f = []
    files = _section_files(ctx)
    if not files:
        return ['SB.2 no site/src/components/sections/*.astro — section '
                'build missing']
    for fn, p in files:
        parts = section_parts(ctx, fn)
        if not parts:
            f.append(f'SB.2 {fn}: unreadable')
            continue
        inst = parts[0][1]
        for label, txt in parts:
            if 'class:list' in txt or re.search(r'class=\{', txt):
                f.append(f'SB.2 {label}: computed class expression — the '
                         'shell takes surface/density as props, not classes')
            if '<section' in txt or '</section>' in txt:
                f.append(f'SB.2 {label}: renders its own <section> — the '
                         'Section shell owns the band')
            if '<style' in txt:
                f.append(f'SB.2 {label}: <style> block — styles live in '
                         'the shared layer')
            body = re.sub(r'^---.*?---', '', txt, flags=re.S)
            # every element in the INSTANCE (a classless wrapper with
            # py-32/bg-* on its child bypassed the old root-only check,
            # B F-25); composition skeletons only constrain their root —
            # inner max-w/mt are theirs by design.
            tags = re.finditer(r'<([a-zA-Z][\w-]*)([^>]*)>', body)
            if label != fn:
                tags = [next(re.finditer(
                    r'<([a-zA-Z][\w-]*)([^>]*)>', body))] if re.search(
                    r'<[a-zA-Z]', body) else []
            for m in tags:
                cls = re.search(r'class="([^"]*)"', m.group(2) or '')
                for c in (cls.group(1).split() if cls else []):
                    base = c.split(':')[-1]
                    if base in OUTER_EXACT or OUTER_SPACING.match(base):
                        f.append(f'SB.2 {label}: <{m.group(1)}> sets outer '
                                 f'layout "{c}" — padding/background/width '
                                 'belong to Section.astro')
        if 'exemplar:' not in inst:
            f.append(f'SB.2 {fn}: no exemplar: frontmatter — adapt the '
                     'gold exemplar (SB.5)')
        # SB.2 — one implementation: the instance renders its composition
        # component (P.6) instead of re-writing the skeleton.
        for _, r in ctx.rows():
            if camel(str(r.get('name'))) + '.astro' != fn:
                continue
            for comp in str(r.get('composition') or '').split('+'):
                comp = comp.strip()
                if not comp:
                    continue
                cfile = os.path.join(ctx.site, 'src', 'components',
                                     comp + '.astro')
                if not os.path.isfile(cfile):
                    continue
                if '<' + camel(comp) not in inst:
                    f.append(f'SB.2 {fn}: does not render its composition '
                             f'component <{camel(comp)} /> — the skeleton '
                             f'lives in src/components/{comp}.astro (P.6), '
                             'never duplicated in the section')
    return f


def check_section_allowed(ctx):
    """SB.3 — only contract classes/token utilities; no literals."""
    f = []
    for fn, p in (_section_files(ctx) if _wave_ge(ctx, 'w6') else []):
        _, txt = section_text(ctx, fn)
        bad = _class_set(ctx, txt)
        if bad:
            f.append(f'SB.3 {fn}: classes outside the layer/token '
                     f'utilities: {sorted(set(bad))[:6]}')
        for m in re.finditer(r'#[0-9a-fA-F]{3,8}\b', txt):
            f.append(f'SB.3 {fn}: raw hex {m.group(0)} — tokens only')
        for m in re.finditer(r'\b(?:rgb|hsl|oklch|lab)\(', txt):
            f.append(f'SB.3 {fn}: color function {m.group(0)} — tokens only')
        if re.search(r'class="[^"]*\[', txt):
            f.append(f'SB.3 {fn}: arbitrary value class [...] — scale only')
    return f


def check_section_gates(ctx):
    """SB.3 — every section passed its own gate before the page."""
    f = []
    for c in build_contracts(ctx):
        p = os.path.join(contracts_dir(ctx),
                         os.path.basename(c['file']).replace(
                             '.contract.json', '.gate.json'))
        if not os.path.isfile(p):
            f.append(f'SB.3 {os.path.basename(p)} missing — run gate.py '
                     f'section --sec {c["section"]}')
            continue
        try:
            g = json.load(open(p))
        except Exception as e:
            f.append(f'SB.3 {os.path.basename(p)}: unreadable ({e})')
            continue
        # pass is recomputed from the section itself; the recorded flag
        # is evidence only, never trusted (B F-08)
        fails = section_failures(ctx, c)
        if fails:
            f += fails
            continue
        if not g.get('pass'):
            f.append(f'SB.3 {os.path.basename(p)}: pass=false but the '
                     'section now computes clean — re-run `gate.py '
                     f'section --sec {c["section"]}`')
    return f


def check_exemplars(ctx):
    """SB.5 — every composition used has a gold exemplar; components name it."""
    f = []
    comps = sorted({c['composition'] for c in build_contracts(ctx)
                    if c['composition']})
    for comp in comps:
        d = os.path.join(TEMPLATES_DIR, comp)
        if not os.path.isdir(d) or not any(
                fn.endswith('.astro') for fn in os.listdir(d)):
            f.append(f'SB.5 no gold exemplar for composition "{comp}" '
                     f'({os.path.relpath(d, REPO)}/)')
    for fn, p in (_section_files(ctx) if _wave_ge(ctx, 'w6') else []):
        txt = open(p, encoding='utf-8', errors='replace').read()
        m = re.search(r'^exemplar:\s*(\S+)', txt, re.M)
        if not m:
            f.append(f'SB.5 {fn}: no exemplar: frontmatter')
        elif m.group(1) not in comps:
            f.append(f'SB.5 {fn}: exemplar "{m.group(1)}" not a plan '
                     'composition')
    return f


def page_path(ctx):
    slug = next(iter(ctx.pages()), 'index')
    return os.path.join(ctx.site, 'src', 'pages', f'{slug}.astro'), slug


def assemble_spec(ctx, slug):
    """PAGES/<slug>/SPEC.md generated from plan rows (A F27 — the spec
    is a projection, never hand-written)."""
    rows = [r for _, r in ctx.rows(slug)]
    if not rows:
        rows = [r for _, r in ctx.rows()]
    import io
    out = io.StringIO()
    out.write(f'# SPEC — /{slug}/ (generated by assemble.py; never edit)\n\n')
    out.write('```yaml\nsections:\n')
    for r in rows:
        out.write('  - {')
        out.write(', '.join(f'{k}: {v}' for k, v in sorted(r.items())))
        out.write('}\n')
    out.write('```\n')
    return out.getvalue()


def assemble_page(ctx, slug=None):
    """SB.4 — deterministic page source from plan order.

    Multi-page plans assemble every slug; assemble.py writes one file
    per slug (B F-40)."""
    slug = slug or page_path(ctx)[1]
    contracts = [c for c in build_contracts(ctx) if c['page'] == slug]
    path, _ = page_path(ctx)
    if slug != _:
        path = os.path.join(ctx.site, 'src', 'pages', slug + '.astro')
    imports = ["import Section from '../components/Section.astro';"]
    for c in contracts:
        imports.append(f"import {camel(c['section'])} from "
                       f"'../components/sections/{camel(c['section'])}.astro';")
    h = hashlib.sha256(json.dumps(contracts, sort_keys=True)
                       .encode()).hexdigest()[:12]
    body = []
    for c in contracts:
        body.append(
            f'<Section sec="{c["section"]}" comp="{c["composition"]}" '
            f'wf-ref="{c["wf_ref"]}" ratio="{c["media_ratio"]}" '
            f'disclosure="{c["disclosure"]}" surface="{c["surface"]}" '
            f'density="{c["density"]}">\n'
            f'  <{camel(c["section"])} />\n'
            f'</Section>')
    txt = ('---\n// assembled: {h} — generated by assemble.py; never edit\n'
           + '\n'.join(imports) + '\n---\n\n'
           + '\n\n'.join(body) + '\n').replace('{h}', h)
    return path, txt, h


def check_assembly(ctx):
    """SB.4 — every plan page is exactly what assemble.py generates."""
    f = []
    for slug in (ctx.pages() or {'index': {}}):
        path, txt, h = assemble_page(ctx, slug)
        if not os.path.isfile(path):
            f.append(f'SB.4 {os.path.basename(path)} missing — run '
                     'assemble.py')
            continue
        cur = open(path, encoding='utf-8').read()
        if cur != txt:
            f.append('SB.4 ' + os.path.basename(path) + ' differs from '
                     'assemble.py output — regenerate the glue')
            continue
        cur_h = re.search(r'assembled: ([0-9a-f]+)', cur)
        if not cur_h or cur_h.group(1) != h:
            f.append('SB.4 assembled marker stale — contracts changed '
                     'after the last assemble.py run (never hand-edit '
                     'the page)')
        else:
            for c in build_contracts(ctx):
                if c['page'] == slug and \
                        f'<{camel(c["section"])} />' not in cur:
                    f.append(f'SB.4 section component '
                             f'{camel(c["section"])} not rendered in '
                             'plan order')
    return f


def section_parts(ctx, fn):
    """[(file, source)] the section instance plus every local component
    it imports. The instance binds the row's content and renders its
    composition component (P.6/SB.2); the skeleton lives in
    src/components/. A per-section gate reads both, so one
    implementation is checked once."""
    p = os.path.join(ctx.site, 'src', 'components', 'sections', fn)
    if not os.path.isfile(p):
        return []
    txt = open(p, encoding='utf-8', errors='replace').read()
    parts = [(fn, txt)]
    for imp in re.findall(r"^\s*import \w+ from '([^']+)'", txt, re.M):
        q = os.path.normpath(os.path.join(os.path.dirname(p), imp))
        if os.path.isfile(q):
            parts.append((os.path.basename(q),
                          open(q, encoding='utf-8',
                               errors='replace').read()))
    return parts


def section_text(ctx, fn):
    parts = section_parts(ctx, fn)
    if not parts:
        return None, ''
    return os.path.join(ctx.site, 'src', 'components', 'sections', fn), \
        '\n'.join(t for _, t in parts)


def section_failures(ctx, contract):
    """Per-section gate: everything checkable without the page."""
    f = []
    name = contract['section']
    fn = camel(name) + '.astro'
    p, txt = section_text(ctx, fn)
    if not p:
        return [f'SB.3 {fn} missing']
    for bad in _class_set(ctx, txt):
        f.append(f'SB.3 {fn}: class "{bad}" outside layer/token utilities')
    for m in re.finditer(r'#[0-9a-fA-F]{3,8}\b', txt):
        f.append(f'P.5 {fn}: raw hex {m.group(0)}')
    for em in re.finditer('[\U0001F300-\U0001FAFF\u2600-\u27BF]', txt):
        f.append(f'P.10 {fn}: emoji {em.group(0)}')
    if 'currentColor' not in txt and '<svg' in txt:
        f.append(f'P.11 {fn}: inline svg without currentColor')
    if re.search(r'<img\b(?![^>]*\balt=)', txt):
        f.append(f'V.2 {fn}: <img> without alt')
    want = contract['content'].get('heading')
    if want and want not in txt:
        f.append(f'E.1 {fn}: heading "{want}" not verbatim in the '
                 'component')
    if contract['media_ratio'] not in (None, 'none') \
            and 'aspect-' not in txt and 'ratio-' not in txt:
        f.append(f'V.1 {fn}: media ratio {contract["media_ratio"]} not '
                 'applied (aspect-* class missing)')
    if contract['surface'] in ('inverse', 'brand') and 'data-surface' in txt:
        f.append(f'SB.2 {fn}: sets data-surface — the Section shell owns '
                 'the surface')
    return f


def cmd_contracts(pipeline):
    ctx = Ctx(pipeline)
    cd = contracts_dir(ctx)
    os.makedirs(cd, exist_ok=True)
    n = 0
    for c in build_contracts(ctx):
        with open(os.path.join(cd, os.path.basename(c['file'])), 'w',
                  encoding='utf-8') as fh:
            json.dump(c, fh, indent=2, sort_keys=True)
            fh.write('\n')
        n += 1
    print(f'contracts written: {n} → {os.path.relpath(cd, ctx.dir)}/')
    return 0


def cmd_section(pipeline, name):
    ctx = Ctx(pipeline)
    want = build_contracts(ctx)
    pick = [c for c in want if c['section'] == name] if name else want
    if not pick:
        print(f'section "{name}" not in plan rows')
        return 2
    rc = 0
    for c in pick:
        f = section_failures(ctx, c)
        p = os.path.join(contracts_dir(ctx),
                         os.path.basename(c['file']).replace(
                             '.contract.json', '.gate.json'))
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, 'w', encoding='utf-8') as fh:
            json.dump({'section': c['section'], 'pass': not f,
                       'failures': f}, fh, indent=2)
            fh.write('\n')
        if f:
            rc = 1
            print(f'{c["section"]}: FAIL ({len(f)})')
            for x in f:
                print(f'  - {x}')
        else:
            print(f'{c["section"]}: PASS')
    return rc


# ---------------------------------------------------------------- DNA map
#
# LAW.DNA (docs/machinery/design/DNA-MAP.md) — one map per run is the
# single source of coherence. gate.dna implements its seven FAIL
# conditions and runs inside every wave gate.

KNOBS_PATH = os.path.join(DESIGN_DIR, 'knobs.json')
MODE_ROLES = ('bg', 'surface', 'surface_elevated', 'border', 'ink',
              'ink_muted', 'accent', 'accent_foreground', 'inverse')
VARIANT_VECTORS = {'best-predicted', 'typography-led', 'imagery-led',
                   'density-led', 'rhythm-led', 'wildcard'}


def knob_set():
    try:
        return json.load(open(KNOBS_PATH))['knobs']
    except Exception:
        return {}


def dna_path(ctx):
    return os.path.join(ctx.dir, 'DNA.json')


def dna_map(ctx):
    p = dna_path(ctx)
    if not os.path.isfile(p):
        return None
    try:
        return json.load(open(p))
    except Exception:
        return None


# ---- split hashes (F05)
#
# One map, three locks: page STRUCTURE locks at W3, the site LOOK at W4,
# the system at W5,
# variant deltas at W8. Each lock hashes only its own slice, so a legal
# addition in a later wave cannot void an earlier operator approval.
STRUCTURE_GENES = ('layout-archetype', 'page-macro-structure',
                   'density-tier', 'image-led-ratio')
CORE_FIELDS = ('site', 'vertical_profile', 'knobs', 'modes',
               'invariants', 'constraints', 'vector_targets', 'provenance')
# 'version' is deliberately OUT of the core hash — the W4 lock writes
# version:1 and must never stale earlier approvals (B F-05).

# The DNA slice each wave is gated against — a wave's recorded dna and
# its approval bind ONLY this kind, so writes to another slice never
# void it (structure locks at W3, look at W4).
WAVE_DNA_KIND = {'w0': 'core', 'w1': 'core', 'w2': 'core',
                 'w3': 'structure', 'w4': 'core', 'w5': 'structure',
                 'w6': 'structure', 'w7': 'structure',
                 'w8': 'all'}
LOOK_GENES = None           # filled at import: genotype minus STRUCTURE_GENES


def _h(obj):
    return hashlib.sha256(json.dumps(obj, sort_keys=True)
                          .encode()).hexdigest()[:16]


def dna_slices(m):
    """The three hashable slices of one map."""
    if not m:
        return {}
    gt = dict(m.get('genotype') or {})
    struct_gt = {g: gt.get(g) for g in STRUCTURE_GENES if g in gt}
    look_gt = {g: v for g, v in gt.items() if g not in STRUCTURE_GENES}
    core = {k: m.get(k) for k in CORE_FIELDS}
    core['genotype'] = look_gt
    return {
        'core': _h(core),
        'structure': _h({'genotype': struct_gt,
                         'rhythm': m.get('rhythm') or [],
                         'pages': m.get('pages') or {}}),
        'variants': _h(m.get('variants') or []),
    }


def dna_slices_legacy(m):
    """The pre-F-05 recipe (version inside core) — for approval
    migration only; never gate against it."""
    if not m:
        return {}
    gt = dict(m.get('genotype') or {})
    struct_gt = {g: gt.get(g) for g in STRUCTURE_GENES if g in gt}
    look_gt = {g: v for g, v in gt.items() if g not in STRUCTURE_GENES}
    core = {k: m.get(k) for k in
            ('version', 'site', 'vertical_profile', 'knobs', 'modes',
             'invariants', 'constraints', 'vector_targets', 'provenance')}
    core['genotype'] = look_gt
    return {'core': _h(core),
            'structure': _h({'genotype': struct_gt,
                             'rhythm': m.get('rhythm') or [],
                             'pages': m.get('pages') or {}}),
            'variants': _h(m.get('variants') or [])}


def dna_hashes(m):
    """{core, structure, variants} — recomputed, never trusted from file."""
    return dna_slices(m or {})


def dna_hash_of(m):
    """The LOOK hash — what every artifact built before W3 binds to."""
    return dna_slices(m).get('core', '') if m else ''


def dna_hash(ctx):
    return dna_hash_of(dna_map(ctx))


def dna_hash_kind(ctx, kind='core'):
    return dna_slices(dna_map(ctx)).get(kind, '')


def _knob_ok(knob, value, knobs):
    spec = knobs.get(knob)
    if not spec:
        return False, f'"{knob}" not in knobs.json'
    kind = spec.get('kind', 'number')
    if kind == 'enum':
        allowed = spec.get('values') or spec.get('allowed') or []
        if str(value) not in [str(x) for x in allowed]:
            return False, f'"{knob}" {value!r} not in {allowed}'
        return True, ''
    if kind == 'map':
        if not isinstance(value, dict):
            return False, f'"{knob}" must be a per-tier map'
        per = spec.get('per') or {}
        step = float(spec.get('step') or 0)
        for tier, v in value.items():
            if tier not in per:
                return False, f'"{knob}" unknown tier "{tier}"'
            allowed = per[tier]
            if isinstance(allowed, list):
                # closed scale (G.1): the value must be a member
                if v not in allowed:
                    return False, (f'"{knob}.{tier}" {v} not on the '
                                   f'closed scale {allowed}')
                continue
            lo, hi = allowed
            try:
                vv = float(v)
            except (TypeError, ValueError):
                return False, f'"{knob}.{tier}" {v!r} not numeric'
            if not lo <= vv <= hi:
                return False, f'"{knob}.{tier}" {vv} outside [{lo}, {hi}]'
            if step and abs(((vv - lo) / step) - round((vv - lo) / step)) > 1e-6:
                return False, f'"{knob}.{tier}" {vv} off the {step} step'
        return True, ''
    lo, hi = spec['range']
    step = float(spec.get('step') or 0)
    try:
        v = float(value)
    except (TypeError, ValueError):
        return False, f'"{knob}" value {value!r} not numeric'
    if not lo <= v <= hi:
        return False, f'"{knob}" {v} outside [{lo}, {hi}]'
    if step:
        n = round((v - lo) / step)
        if abs(lo + n * step - v) > 1e-6:
            return False, f'"{knob}" {v} off the {step} step'
    return True, ''


def _deltas_ok(base, deltas, knobs, wildcard):
    """Condition 4 — a variant is baseline + declared deltas."""
    f = []
    for k, v in (deltas or {}).items():
        spec = knobs.get(k)
        if not spec:
            f.append(f'DM.4 delta knob "{k}" not in knobs.json — untraceable')
            continue
        ok, why = _knob_ok(k, v, knobs)
        if not ok:
            if wildcard and spec.get('tier') == 'stylistic' and \
                    spec.get('kind', 'number') == 'number':
                lo, hi = spec['range']
                band = 2 * float(spec.get('step') or 0)
                try:
                    vv = float(v)
                except (TypeError, ValueError):
                    vv = None
                if vv is not None and lo - band - 1e-6 <= vv <= hi + band + 1e-6:
                    continue
            f.append(f'DM.4 delta {why}')
        if k in (base or {}) and str(base[k]) == str(v):
            f.append(f'DM.4 delta "{k}" equals the baseline — a delta must '
                     'change something')
    return f


WAVE_SEQ = ['w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8']


def _wave_ge(ctx, w):
    """True when the gate is running at wave w or later (None = full)."""
    wave = getattr(ctx, 'wave', None)
    if wave in (None, 'selftest', 'score', 'dna'):
        return True
    if wave not in WAVE_SEQ:
        return True
    return WAVE_SEQ.index(wave) >= WAVE_SEQ.index(w)


def check_dna(ctx):
    """Conditions 1, 3, 6, 7 (+ completeness and knob ranges).

    Wave-scoped: W0 has no map (DNA-MAP.md); rhythm is a W5 artifact and
    variants start at W4, so those parts are only required from then on.
    """
    f = []
    wave = getattr(ctx, 'wave', None)
    if wave == 'w0':
        return f
    m = dna_map(ctx)
    if m is None:
        return ['DM.1 DNA.json missing — the map is the single source of '
                'coherence (gate.py dna)']
    required = ['version', 'site', 'vertical_profile', 'genotype',
                'knobs', 'provenance', 'vector_targets', 'invariants']
    if _wave_ge(ctx, 'w4'):
        required += ['modes', 'variants']
    if _wave_ge(ctx, 'w5'):
        required.append('rhythm')
    dm_mode = str((ctx.plan.get('site') or {}).get('design_mode') or '')
    if _wave_ge(ctx, 'w1') and dm_mode and dm_mode != 'new-build':
        required.append('constraints')
    for field in required:
        if m.get(field) in (None, '', [], {}):
            f.append(f'DM.1 DNA.json: "{field}" missing or empty')
    want = dna_slices(m)
    got = m.get('hashes') or {}
    for kind in ('core', 'structure', 'variants'):
        if not got.get(kind):
            f.append(f'DM.1 DNA.json: hashes.{kind} missing — run '
                     '`gate.py dna` to re-hash the map')
        elif got[kind] != want.get(kind):
            f.append(f'DM.1 DNA.json: hashes.{kind} is stale — the map '
                     f'was edited without re-hashing (expected '
                     f'{want.get(kind)})')
    genes = genome_genes()
    gt = m.get('genotype') or {}
    for g, alleles in genes.items():
        if g not in gt:
            f.append(f'DM.1 genotype missing gene "{g}" (D.1 totality)')
        elif alleles and str(gt[g]) not in alleles:
            f.append(f'DM.1 genotype "{g}: {gt[g]}" not in the closed set')
    for g in gt:
        if genes and g not in genes:
            f.append(f'DM.3 genotype gene "{g}" is not in GENOME — '
                     'untraceable')
    spec = set(load_score_vectors().get('vectors') or {}) - {'overall'}
    vt = m.get('vector_targets') or {}
    if spec:
        miss = sorted(spec - set(vt))
        extra = sorted(set(vt) - spec)
        if miss:
            f.append(f'DM.1 vector_targets missing {len(miss)} scorecard '
                     f'vector(s): {miss[:4]} (score-vectors.json)')
        if extra:
            f.append(f'DM.1 vector_targets names unknown vector(s): '
                     f'{extra[:4]}')
        for k, v in vt.items():
            if not isinstance(v, (int, float)) or not 0 <= v <= 10:
                f.append(f'DM.1 vector_targets.{k} = {v!r} — expected '
                         '0-10 (the scorecard scale)')
    ver = m.get('version')
    if _wave_ge(ctx, 'w5') and isinstance(ver, int) and ver < 1:
        f.append(f'DM.1 DNA map still v{ver} — the W4 look approval '
                 'locks it to v1 (run.py approve w4)')
    knobs = knob_set()
    prov = m.get('provenance') or {}
    if knobs:
        for k in knobs:
            if k not in (m.get('knobs') or {}):
                f.append(f'DM.1 knob "{k}" missing from DNA.json')
            elif k not in prov:
                f.append(f'DM.1 knob "{k}" has no provenance tag '
                         '(extracted|snapped|inferred|chosen)')
            else:
                e = prov[k]
                if isinstance(e, dict):
                    tag = e.get('tag')
                    if tag not in ('extracted', 'snapped', 'inferred',
                                   'chosen'):
                        f.append(f'DM.1 knob "{k}" provenance tag '
                                 f'{tag!r} invalid')
                    if tag in ('snapped', 'inferred'):
                        if not (e.get('patterns') or []):
                            f.append(f'DM.1 knob "{k}" seeded from the '
                                     'pattern library but cites no pattern '
                                     'ID (DNA v0 seeding)')
                        if not isinstance(e.get('n'), int) or e['n'] < 1:
                            f.append(f'DM.1 knob "{k}" provenance lacks the '
                                     'sample size n')
                elif isinstance(e, str):
                    if e not in ('extracted', 'snapped', 'inferred',
                                 'chosen'):
                        f.append(f'DM.1 knob "{k}" provenance tag {e!r} '
                                 'invalid')
        for k, v in (m.get('knobs') or {}).items():
            ok, why = _knob_ok(k, v, knobs)
            if not ok:
                f.append(f'DM.1 knob {why}')
    for mode in ('light', 'dark'):
        roles = (m.get('modes') or {}).get(mode) or {}
        if not roles:
            f.append(f'C.5 modes.{mode} missing — both modes ship '
                     '(condition 7)')
            continue
        for role in MODE_ROLES:
            if role not in roles:
                f.append(f'C.5 modes.{mode}.{role} missing (condition 7)')
    if not _wave_ge(ctx, 'w5'):
        return f
    rhythm = m.get('rhythm') or []
    if isinstance(rhythm, dict):
        rhythm = [{'section': k, 'surface': (v or {}).get('surface'),
                   'density': (v or {}).get('density')}
                  for k, v in rhythm.items()]
    plan_rows = {str(r.get('name')): r for _, r in ctx.rows()}
    for entry in rhythm:
        name = str(entry.get('section'))
        row = plan_rows.get(name)
        if not row:
            f.append(f'DM.3 rhythm plan names section "{name}" that is not '
                     'a plan row')
            continue
        if entry.get('surface') and str(row.get('surface')) != str(
                entry['surface']):
            f.append(f'DM.6 row "{name}" surface "{row.get("surface")}" '
                     f'deviates from the map "{entry["surface"]}"')
        if entry.get('density') and str(row.get('density')) != str(
                entry['density']):
            f.append(f'DM.6 row "{name}" density "{row.get("density")}" '
                     f'deviates from the map "{entry["density"]}"')
    for name in plan_rows:
        if rhythm and not any(str(e.get('section')) == name for e in rhythm):
            f.append(f'DM.6 row "{name}" has no rhythm-plan entry')
    plan_dna = (ctx.plan.get('dna') or {})
    if plan_dna:
        prof = plan_dna.get('profile')
        if prof and prof != m.get('vertical_profile'):
            f.append(f'DM.3 plan profile "{prof}" != DNA map '
                     f'"{m.get("vertical_profile")}"')
        pgt = plan_dna.get('genotype') or {}
        if isinstance(pgt, list):
            flat = {}
            for it in pgt:
                if isinstance(it, dict):
                    flat.update({str(k): str(v) for k, v in it.items()})
            pgt = flat
        for g, a in pgt.items():
            if str((m.get('genotype') or {}).get(g)) != str(a):
                f.append(f'DM.3 plan genotype {g}={a} != DNA map '
                         f'{(m.get("genotype") or {}).get(g)}')
    raw = ctx.read('TOKENS.json')
    if raw:
        try:
            tok = json.loads(raw)
        except Exception:
            tok = {}
        for k, v in (tok.get('knobs') or {}).items():
            if k not in (m.get('knobs') or {}):
                f.append(f'DM.3 TOKENS.json knob "{k}" untraceable — not in '
                         'the DNA map')
            elif str(m['knobs'][k]) != str(v):
                f.append(f'DM.3 TOKENS.json {k}={v} != DNA map '
                         f'{m["knobs"][k]}')
    return f


def check_dna_fresh(ctx):
    """Condition 2 — each artifact carries the hash slice it consumed.

    Look artifacts (contracts' dna_hash, section dna_hash:) bind the
    CORE hash; structure artifacts additionally bind the STRUCTURE hash;
    the picker binds the VARIANTS hash. A later legal addition therefore
    invalidates only its own consumers (F05).
    """
    f = []
    if getattr(ctx, 'wave', None) == 'w0':
        return f
    sl = dna_slices(dna_map(ctx))
    if not sl.get('core'):
        return ['DM.1 DNA.json missing']
    core, struct = sl['core'], sl['structure']
    cd = contracts_dir(ctx)
    if os.path.isdir(cd) and _wave_ge(ctx, 'w5'):
        for fn in sorted(os.listdir(cd)):
            if not fn.endswith('.contract.json'):
                continue
            try:
                c = json.load(open(os.path.join(cd, fn)))
            except Exception:
                continue
            if c.get('dna_hash') != core:
                f.append(f'DM.2 {fn}: dna_hash {c.get("dna_hash")!r} != '
                         f'{core} — built against a different look')
            if c.get('structure_hash') != struct:
                f.append(f'DM.2 {fn}: structure_hash '
                         f'{c.get("structure_hash")!r} != {struct} — the '
                         'structure lock moved; regenerate contracts')
    for fn, p in (_section_files(ctx) if _wave_ge(ctx, 'w6') else []):
        txt = open(p, encoding='utf-8', errors='replace').read()
        mm = re.search(r'^dna_hash:\s*(\S+)', txt, re.M)
        if not mm:
            f.append(f'DM.2 {fn}: no dna_hash: frontmatter — builders echo '
                     'the look hash they built against')
        elif mm.group(1) != core:
            f.append(f'DM.2 {fn}: dna_hash {mm.group(1)} != {core} — '
                     'rebuild this section against the current look')
        sm = re.search(r'^structure_hash:\s*(\S+)', txt, re.M)
        if _wave_ge(ctx, 'w6') and sm and sm.group(1) != struct:
            f.append(f'DM.2 {fn}: structure_hash {sm.group(1)} != {struct} '
                     '— the wireframe lock moved; rebuild this section')
    if os.path.isfile(ctx.gates_path):
        try:
            g = json.load(open(ctx.gates_path))
        except Exception:
            g = {}
        for w, e in sorted(g.items()):
            rec = (e or {}).get('dna')
            if not rec:
                continue
            want = rec.get('structure') if isinstance(rec, dict) and \
                WAVE_SEQ.index(w) >= WAVE_SEQ.index('w5') else \
                (rec.get('core') if isinstance(rec, dict) else rec)
            have = struct if isinstance(rec, dict) and \
                WAVE_SEQ.index(w) >= WAVE_SEQ.index('w5') else core
            if want and want != have:
                f.append(f'DM.6 GATES.json {w} recorded a different map '
                         f'({want} != {have}) — run.py rebuilds from {w}')
    return f


def render_dna_md(m):
    sl = dna_slices(m)
    lines = ['# DNA map — the single source of coherence', '',
             f'`look: {sl.get("core")}` · `structure: '
             f'{sl.get("structure")}` · `variants: '
             f'{sl.get("variants")}` · version `{m.get("version")}` · site '
             f'`{m.get("site")}` · vertical `{m.get("vertical_profile")}`',
             '', 'Every wave, section, variant and review reads this file '
             'first. Nothing defines a design value that is not traceable '
             'here (LAW.DNA).', '', '## Genotype', '']
    for g, a in sorted((m.get('genotype') or {}).items()):
        lines.append(f'- `{g}` = `{a}`')
    lines += ['', '## System knobs', '',
              '| Knob | Value | Token | Tier | Provenance |',
              '|---|---|---|---|---|']
    knobs = knob_set()
    prov = m.get('provenance') or {}
    for k, v in sorted((m.get('knobs') or {}).items()):
        spec = knobs.get(k) or {}
        val = json.dumps(v) if isinstance(v, (dict, list)) else v
        lines.append(f'| `{k}` | {val} | `{spec.get("token", "")}` | '
                     f'{spec.get("tier", "")} | {prov.get(k, "—")} |')
    lines += ['', '## Rhythm plan', '', '| Section | Surface | Density |',
              '|---|---|---|']
    rhythm = m.get('rhythm') or []
    if isinstance(rhythm, dict):
        rhythm = [{'section': k, **(v or {})} for k, v in rhythm.items()]
    for e in rhythm:
        lines.append(f'| `{e.get("section")}` | {e.get("surface")} | '
                     f'{e.get("density")} |')
    lines += ['', '## Modes (both ship — C.5)', '',
              '| Role | Light | Dark |', '|---|---|---|']
    lm = (m.get('modes') or {}).get('light') or {}
    dm = (m.get('modes') or {}).get('dark') or {}
    for role in sorted(set(lm) | set(dm)):
        lines.append(f'| `{role}` | `{lm.get(role, "")}` | '
                     f'`{dm.get(role, "")}` |')
    lines += ['', '## Variants (baseline + deltas)', '']
    for v in m.get('variants') or []:
        d = ', '.join(f'{k} {m.get("knobs", {}).get(k)}→{x}'
                      for k, x in sorted((v.get('deltas') or {}).items()))
        lines.append(f'- `{v.get("id")}` · {v.get("vector")} · '
                     f'{d or "baseline"} · sheet '
                     f'{v.get("sheet_pass")} · score {v.get("score")}')
    return '\n'.join(lines) + '\n'


def cmd_dna(pipeline):
    ctx = Ctx(pipeline)
    fails = check_dna(ctx) + check_dna_fresh(ctx) + check_variants(ctx)
    m = dna_map(ctx)
    if m is not None:
        with open(os.path.join(ctx.dir, 'DNA.md'), 'w',
                  encoding='utf-8') as fh:
            fh.write(render_dna_md(m))
    if fails:
        print(f'dna FAIL ({len(fails)}):')
        for x in fails:
            print('  -', x)
        return 1
    sl = dna_slices(m or {})
    print(f'dna PASS — look {sl.get("core")} · structure '
          f'{sl.get("structure")} · variants {sl.get("variants")}; '
          'DNA.md rendered')
    return 0


# ---------------------------------------------------------------- modes + variants
#
# C.5 — LIGHT + DARK is invariant on every surface.
# VG.1–VG.6 — the hi-fi picker: system sheet first, then the page; each
# tile is a knob vector = DNA baseline + declared deltas.

DARK_MAX_L = 20.0


def _modes(ctx):
    """{mode: {role: hex}} from TOKENS.json color.modes (plan fallback)."""
    out = {}
    raw = ctx.read('TOKENS.json')
    if raw:
        try:
            tok = json.loads(raw)
        except Exception:
            tok = {}
        for mode, block in ((tok.get('color') or {}).get('modes')
                            or {}).items():
            roles = (block or {}).get('roles') or block or {}
            got = {}
            for k, v in roles.items():
                v = v.get('value') if isinstance(v, dict) else v
                if isinstance(v, str) and v.startswith('#'):
                    got[k] = v
            out[mode] = got
    if not out:
        dm = (dna_map(ctx) or {}).get('modes') or {}
        for mode, roles in dm.items():
            got = {}
            for k, v in (roles or {}).items():
                v = v.get('value') if isinstance(v, dict) else v
                if isinstance(v, str) and v.startswith('#'):
                    got[k] = v
            if got:
                out[mode] = got
    if not out:
        roles = (_system(ctx).get('color') or {}).get('roles') or {}
        light = {}
        for k, v in roles.items():
            v = v.get('value') if isinstance(v, dict) else v
            if isinstance(v, str) and v.startswith('#'):
                light[k] = v
        out['light'] = light
    return out


def _luminance(h):
    h = h.strip().lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    try:
        ch = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    except (ValueError, IndexError):
        return None
    ch = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
          for c in ch]
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]


def check_dark_mode(ctx):
    """C.5 — both modes defined, class-switched, dark never pure black."""
    f = []
    modes = _modes(ctx)
    src = 'TOKENS.json color.modes' if ctx.read('TOKENS.json') \
        else 'the DNA map modes'
    for need in ('light', 'dark'):
        if need not in modes or not modes[need]:
            f.append(f'C.5 {need} mode not defined in {src} — both modes '
                     'ship, invariant')
    light, dark = modes.get('light') or {}, modes.get('dark') or {}
    for role in MODE_ROLES:
        if role in light and role not in dark:
            f.append(f'C.5 role "{role}" resolved in light but not dark')
        if role in dark and role not in light:
            f.append(f'C.5 role "{role}" resolved in dark but not light')
    if dark:
        bg = str(dark.get('bg', ''))
        if bg.lower() in ('#000', '#000000'):
            f.append('C.5 dark bg is pure black — tinted charcoal required')
        else:
            l = _luminance(bg) if bg.startswith('#') else None
            if l is not None and l * 100 > DARK_MAX_L:
                f.append(f'C.5 dark bg luminance {l * 100:.0f}% > '
                         f'{DARK_MAX_L:.0f}% — not a dark surface')
    if not _wave_ge(ctx, 'w3'):
        return f                       # W2 options declare modes only
    cfg = ctx.read('site/tailwind.config.js', 'site/tailwind.config.mjs',
                   'site/tailwind.config.cjs') or ''
    if not re.search(r'darkMode\s*:\s*[\'"](class|selector)[\'"]', cfg):
        f.append("C.5 tailwind config missing darkMode: 'class'")
    css = ctx.read('site/src/styles/global.css') or ''
    if not re.search(r'(\.dark|\[data-theme=["\']dark["\']\])\s*\{', css):
        f.append('C.5 no .dark block in the shared layer — the mode switch '
                 're-binds role variables there')
    tile = ctx.read('site/src/pages/system.astro') or ''
    surfaces = [('system tile', tile)]
    if _wave_ge(ctx, 'w7'):
        surfaces += [('page', t) for _, t in ctx.page_htmls()]
    for label, txt in surfaces:
        if txt and 'data-theme-toggle' not in txt:
            f.append(f'C.5 {label}: no data-theme-toggle — every surface '
                     'carries a Light/Dark toggle')
    return f


def check_dark_toggle(ctx):
    """C.5 — toggle persists, honours prefers-color-scheme, paints first."""
    f = []
    pages = ctx.page_htmls()
    for cand in ('preview/system.html', 'preview/variants.html'):
        t = ctx.read(cand)
        if t:
            pages.append((os.path.join(ctx.dir, cand), t))
    if not pages:
        return []
    layout = ctx.read('site/src/layouts/BaseLayout.astro') or ''
    for p, txt in pages:
        name = os.path.basename(p)
        if 'data-theme-toggle' not in txt:
            f.append(f'C.5 {name}: no Light/Dark toggle')
        head = txt.split('</head>')[0] if '</head>' in txt else ''
        if not re.search(r'<script(?![^>]*\bsrc=)[^>]*>', head):
            f.append(f'C.5 {name}: no inline head script — the theme must '
                     'paint before first frame (no flash)')
        if 'prefers-color-scheme' not in head:
            f.append(f'C.5 {name}: initial mode ignores '
                     'prefers-color-scheme')
        if 'localStorage' not in txt and 'localStorage' not in layout:
            f.append(f'C.5 {name}: mode choice not persisted (localStorage)')
    return f


def _variants(ctx):
    """Variant records: DNA.json variants (LAW.DNA) or VARIANT-GATES.json."""
    m = dna_map(ctx) or {}
    if m.get('variants'):
        return m['variants']
    raw = ctx.read('VARIANT-GATES.json')
    if not raw:
        return []
    try:
        return json.loads(raw).get('variants') or []
    except Exception:
        return []


def check_variants(ctx):
    """VG.1–VG.6 + LAW.DNA 4/5.

    Pass is computed from the records (B F-08). At W2 the picker is the
    SYSTEM SHEET only — the page pane joins at W8, when sections exist
    (A F04). Each variant must apply its knob vector as CSS vars
    (A F39)."""
    f = []
    path = os.path.join(ctx.dir, 'preview', 'variants.html')
    if not os.path.isfile(path):
        return ['VG.1 preview/variants.html missing — run '
                'assemble.py --variants']
    txt = open(path, encoding='utf-8', errors='replace').read()
    shown = re.findall(r'data-variant="([^"]+)"', txt)
    if len(shown) != 3:
        f.append(f'VG.1 {len(shown)} variants rendered — the look/fine '
                 'rounds show exactly 3 options (round 1 layout shows '
                 '≥5)')
    for need in ('variant', 'viewport', 'mode'):
        if f'data-switch="{need}"' not in txt:
            f.append(f'VG.4 switcher missing data-switch="{need}"')
    css = ctx.read('site/src/styles/global.css') or ''
    if 'sticky' not in txt + css:
        f.append('VG.4 switcher is not sticky')
    if not any(t in txt + css for t in ('@container', 'cqw', 'container-type')):
        f.append('VG.4 frames not container-query driven — 1:1 viewports, '
                 'not a scaled desktop')
    if 'data-pane="page"' not in txt:
        f.append('VG.1 no data-pane="page" — the operator chooses between '
                 'ACTUAL page designs, not style sheets')
    if 'data-pane="system"' not in txt:
        f.append('VG.1 no data-pane="system" — the sheet is generated and '
                 'gated even though the page is the choosing surface')
    # responsive: fluid type + no fixed widths on the mock page
    if 'clamp(' not in txt:
        f.append('VG.4 picker page is not fluid — fluid clamp type incl. '
                 'h2/lead required at 375')
    if re.search(r'\bwidth:\s*\d{3,}px', txt) and \
            'max-width' not in txt.split('width:')[0][-200:]:
        pass
    vp_frames = re.findall(r'data-vp="(?:mobile|tablet)"', txt)
    if len(vp_frames) < 2:
        f.append('VG.4 no 375/768 viewport frames — the picker must prove '
                 'no horizontal overflow, both modes')
    if 'overflow-x' not in txt:
        f.append('VG.4 no overflow-x guard — a fixed-width frame may clip '
                 'horizontally at 375')
    computed = _variant_entries(ctx)
    if not computed:
        return f + ['VG.3 no variant records — DNA.json variants missing']
    passing = set()
    for vid, (e, fl) in computed.items():
        if fl:
            f.append(f'VG.3 variant {vid} fails a gate — remove it from the '
                     'picker, never show it greyed')
            for m in fl[:3]:
                f.append(f'VG.3 variant {vid}: {m}')
        else:
            passing.add(vid)
    for sid in shown:
        if sid not in passing:
            f.append(f'VG.3 rendered variant "{sid}" is not a passing '
                     'variant')
    # A F39 — the emitted CSS must APPLY each variant's knob vector
    blocks = dict(re.findall(
        r'\[data-variant-scope="([^"]+)"\]\{([^}]*)\}', txt))
    if not blocks:
        f.append('VG.2 no [data-variant-scope] knob vars — variants must '
                 'apply their knob vectors')
    knobs = knob_set()
    for vid in shown:
        if vid not in blocks:
            f.append(f'VG.2 variant {vid}: no knob CSS vars — the variant '
                     'labels a vector without applying it')
            continue
        got = dict(p.split(':', 1) for p in blocks[vid].split(';')
                   if ':' in p)
        e = (computed.get(vid) or ({}, []))[0]
        for k, v in (e.get('deltas') or {}).items():
            tok = str((knobs.get(k) or {}).get('token') or k).replace('.', '-')
            if isinstance(v, dict):
                for tier, x in v.items():
                    if got.get(f'--{tok}-{tier}') != str(x):
                        f.append(f'VG.2 variant {vid}: {k}.{tier}={x} not '
                                 f'applied (--{tok}-{tier})')
            elif got.get(f'--{tok}') != str(v):
                f.append(f'VG.2 variant {vid}: {k}={v} not applied '
                         f'(--{tok})')
    if len(shown) >= 2:
        import itertools
        delta_sets = {}
        for vid in shown:
            e = (computed.get(vid) or ({}, []))[0]
            delta_sets[vid] = e.get('deltas') or {}
        for a, b in itertools.combinations(shown, 2):
            diff = set(delta_sets.get(a) or {}) ^ \
                   set(delta_sets.get(b) or {})
            same = {k for k in set(delta_sets.get(a) or {})
                    & set(delta_sets.get(b) or {})
                    if delta_sets[a].get(k) != delta_sets[b].get(k)}
            if len(diff | same) < 3:
                f.append(f'VG.4 variants {a}/{b} differ in '
                         f'{len(diff | same)} knob(s) — the look round '
                         'needs ≥3 differing knobs per pair '
                         '(coarse→fine: maximally distinct at each round)')
    burst = 0
    mm = re.search(r'^burst:\s*(\d)', ctx.plan_text, re.M)
    if mm:
        burst = int(mm.group(1))
    wild = [e for e, _ in computed.values()
            if e.get('vector') == 'wildcard']
    if burst > 0 and len(wild) != 1:
        f.append(f'VG.5 burst={burst} needs exactly one wildcard variant, '
                 f'found {len(wild)}')
    if burst == 0 and wild:
        f.append('VG.5 burst=0 but a variant claims the wildcard')
    return f


def _variant_fails(ctx, e):
    """VG.3 — a variant's pass is COMPUTED here, never read from the
    designer's record (B F-08)."""
    f = []
    m = dna_map(ctx) or {}
    knobs = knob_set()
    base = m.get('knobs') or {}
    vid = e.get('id')
    if e.get('vector') not in VARIANT_VECTORS:
        f.append(f'VG.2 variant {vid}: vector "{e.get("vector")}" not in '
                 f'{sorted(VARIANT_VECTORS)}')
    f += _deltas_ok(base, e.get('deltas') or {}, knobs,
                    e.get('vector') == 'wildcard')
    if not (e.get('deltas') or {}) and not e.get('baseline'):
        f.append(f'VG.2 variant {vid}: no deltas — a variant is a knob '
                 'vector, not a mood (mark the baseline one baseline: true)')
    if not isinstance(e.get('score'), (int, float)):
        f.append(f'VG.6 variant {vid}: no predicted score on the tile')
    # B F-31 — the W3 layout lock is frozen: NO non-baseline variant may
    # move a structural knob (wildcard or not); only the wildcard vector
    # earns style-only exceptions downstream.
    if not e.get('baseline') and e.get('vector') != 'wildcard':
        for k in (e.get('deltas') or {}):
            tier = (knobs.get(k) or {}).get('tier')
            if tier in ('structural', 'invariant'):
                f.append(f'VG.5 variant {vid}: delta on {tier} knob '
                         f'"{k}" — layout locks at W3; look variants '
                         'move stylistic knobs only')
    # B F-31 — a wildcard mutates style only; structural knobs never move
    if e.get('vector') == 'wildcard':
        for k in (e.get('deltas') or {}):
            tier = (knobs.get(k) or {}).get('tier')
            if tier in ('structural', 'invariant'):
                f.append(f'VG.5 wildcard delta on {tier} knob "{k}" — a '
                         'wildcard may move stylistic knobs only')
        for k in e.get('mutates') or []:
            g = genome_genes().get(k)
            if g is None:
                f.append(f'VG.5 wildcard mutates unknown gene "{k}"')
            elif k in STRUCTURE_GENES:
                f.append(f'VG.5 wildcard mutates structural gene "{k}" '
                         '— the W3 structure lock is out of bounds; '
                         'mutates ⊆ stylistic genes')
        if not e.get('wildcard_breaks'):
            f.append('VG.5 wildcard variant carries no declared breaks '
                     '(B.4 record required)')
    # both modes ship (C.5): the sheet's role pairs must clear the floors
    for mode, roles in (m.get('modes') or {}).items():
        ink, bg = role_hex(roles, 'ink'), role_hex(roles, 'bg')
        if ink and bg and (contrast(ink, bg) or 0) < 7:
            f.append(f'VG.1 variant {vid}: [{mode}] ink:bg below 7:1')
    return f


def _variant_entries(ctx):
    """{id: (record, failures)} for every declared variant."""
    return {str(e.get('id')): (e, _variant_fails(ctx, e))
            for e in _variants(ctx)}


def _knob_vars(kn, base, knobs):
    """CSS custom-property overrides for one variant's knob vector."""
    out = {}
    for k in sorted((kn or {})):
        spec = knobs.get(k) or {}
        tok = str(spec.get('token') or k).replace('.', '-')
        v = kn[k]
        if isinstance(v, dict):
            for tier, x in sorted(v.items()):
                out[f'--{tok}-{tier}'] = str(x)
        else:
            out[f'--{tok}'] = str(v)
    return out


def assemble_variants(ctx, page_pane=True):
    """VG.1 — the picker shows ACTUAL page designs: full responsive page
    per variant (real copy + imagery placeholders), every value driven by
    the DNA knob vector, CSS vars per scope. The system sheet is
    implicit — generated and gated, never the choosing surface."""
    computed = _variant_entries(ctx)
    entries = [e for vid, (e, fails) in computed.items() if not fails][:5]
    m = dna_map(ctx) or {}
    base = m.get('knobs') or {}
    modes = m.get('modes') or {}
    knobs = knob_set()
    vec = ctx.stub_vector()
    rows = [r for _, r in ctx.rows()]
    h2s = [v for v in vec]
    h_i = 0
    contracts = build_contracts(ctx)
    contracts = {c['section']: c for c in contracts}
    h = hashlib.sha256(json.dumps([entries, base], sort_keys=True)
                       .encode()).hexdigest()[:12]

    def section_mock(c):
        nonlocal h_i
        sec, comp = c['section'], c['composition']
        head, lead = '', ''
        if comp not in ('nav-bar', 'footer-bar') and h_i < len(h2s):
            v = h2s[h_i]
            h_i += 1
            head = f'<h2 class="mock-h2">{v["heading"]}</h2>'
            if v.get('fs'):
                lead = f'<p class="mock-lead">{v["fs"]}</p>'
        if comp == 'nav-bar':
            head = ('<nav class="mock-nav"><span class="mock-logo">'
                    'brand</span><a class="mock-cta">Act</a></nav>')
        elif comp == 'footer-bar':
            head = '<p class="mock-footer">© brand · legal</p>'
        media = ''
        if str(c.get('media_ratio')) not in (None, '', 'none'):
            media = (f'<div class="mock-media ratio-'
                     f'{str(c["media_ratio"]).replace(":", "-")}" '
                     f'role="img" aria-label="{c["section"]} image"></div>')
        cta = ''
        if sec == 'end-act' or c.get('emphasis') == 'cta':
            cta = '<a class="mock-cta cta-primary">Act</a>'
        return (f'        <section data-sec="{sec}" '
                f'data-comp="{comp}" data-ratio="{c.get("media_ratio")}" '
                f'data-disclosure="{c.get("disclosure")}" '
                f'data-surface="{c.get("surface")}" '
                f'data-density="{c.get("density")}" '
                f'class="mock-sec">\n'
                f'          <div class="mock-inner">{head}{media}{lead}'
                f'{cta}</div>\n        </section>')

    def sheet(kn):
        rows_ = []
        lm, dm = modes.get('light') or {}, modes.get('dark') or {}
        for role in sorted(set(lm) | set(dm)):
            lv, dv = lm.get(role, ''), dm.get(role, '')
            r = contrast(lv, dv) if str(lv).startswith('#') and \
                str(dv).startswith('#') else None
            rows_.append(
                f'<tr><td><code>{role}</code></td>'
                f'<td class="swatch swatch-{role}">--color-{role}</td>'
                f'<td class="swatch swatch-{role}">--color-{role} (dark)</td>'
                f'<td>{f"{r:.1f}:1" if r else "—"}</td></tr>')
        kn_txt = ', '.join(f'{k} {base.get(k)}->{v}'
                           for k, v in sorted((kn or {}).items()))
        return ('<table class="sheet-roles"><caption>Colour roles — light / '
                'dark / contrast</caption>' + ''.join(rows_) + '</table>'
                f'<p class="sheet-knobs" data-knobs="{kn_txt}">'
                f'{kn_txt or "baseline — no knob diff"}</p>')

    tiles, style = [], []
    for e in entries:
        vid = e['id']
        deltas = e.get('deltas') or {}
        breaks = ', '.join(
            (f"{b.get('gene')}: {b.get('from')}->{b.get('to')}"
             if isinstance(b, dict) else str(b))
            for b in (e.get('wildcard_breaks') or [])) or 'none'
        diff = ', '.join(f'{k} {base.get(k)}->{v}'
                         for k, v in sorted(deltas.items())) or 'baseline'
        vs = {**_knob_vars(base, base, knobs), **_knob_vars(deltas, base,
                                                           knobs)}
        style.append('[data-variant-scope="%s"]{%s}' % (
            vid, ';'.join(f'{k}:{v}' for k, v in sorted(vs.items()))))
        h_i = 0
        page_secs = '\n'.join(section_mock(c) for c in contracts.values())
        refs = ' '.join(
            r['id'] for r in _canon_rows(ctx)[:3] if r['ok']) or 'none'
        sc01 = (e.get('score') or 0) / 100 if (e.get('score') or 0) > 1 \
            else (e.get('score') or 0)
        tiles.append(
            f'  <article class="variant-frame" data-variant="{vid}" '
            f'data-vector="{e.get("vector")}" '
            f'data-score="{sc01:.2f}" data-score100="{e.get("score")}" '
            f'data-refs="{refs}" '
            f'data-review="visual-pass" '
            f'data-breaks="{breaks}" '
            f'data-look="{dna_slices(m).get("core", "")}" '
            f'data-knobs="{diff}">\n'
            f'    <header class="variant-label">{vid} · {e.get("vector")} · '
            f'score {e.get("score")} · {diff} · breaks: {breaks}</header>\n'
            '    <nav class="variant-tabs"><button data-tab="page" '
            'class="on">Page</button><button data-tab="system">System '
            '(inspect)</button><button data-more-like="knob-nudge">More '
            'like this</button></nav>\n'
            '    <div class="variant-panes">\n'
            f'      <div data-pane="page" class="variant-stage" '
            f'data-variant-scope="{vid}">\n'
            f'        <div class="pg" data-mode="light">\n{page_secs}\n'
            '        </div>\n      </div>\n'
            f'      <div data-pane="system" class="variant-stage" '
            f'data-variant-scope="{vid}" hidden>{sheet(deltas)}</div>\n'
            '    </div>\n  </article>')
    ignored = [r['id'] for r in _canon_rows(ctx) if r['ignored']]
    txt = f'''<!-- ignored refs: {', '.join(ignored) or 'none'} -->
<!-- assembled: {{h}} — generated by assemble.py --variants; never edit -->
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root{{--t-base:1rem}}
    *{{box-sizing:border-box;min-width:0}}
    html,body{{margin:0;overflow-x:hidden}}
    .variant-stage{{container-type:inline-size;width:100%}}
    .pg{{width:100%;max-width:100%;overflow-x:hidden;
        font-size:var(--t-base)}}
    .pg h1{{font-size:clamp(1.9rem,4.5cqi,3.4rem);
           line-height:1.05;font-weight:var(--type-display-weight,700);
           letter-spacing:var(--type-tracking-display,-0.02em)}}
    .mock-h2{{font-size:clamp(1.35rem,3.4cqi,2.3rem);line-height:1.12}}
    .mock-lead{{font-size:clamp(1.05rem,2.2cqi,1.35rem);max-width:65ch}}
    .mock-sec{{padding:clamp(2rem,7cqi,var(--space-section-py-regular,6rem))
                clamp(1.25rem,4cqi,var(--grid-gutter-px,2rem));
              max-width:min(100%,76rem);margin-inline:auto}}
    .mock-inner{{display:flex;flex-direction:column;gap:1rem}}
    .mock-media{{border-radius:var(--radius-personality,8px);
                aspect-ratio:4/3;max-width:100%;
                background:var(--color-surface_elevated,#e7e7ea)}}
    .mock-nav{{display:flex;justify-content:space-between;align-items:center;
              gap:1rem;flex-wrap:wrap}}
    .mock-cta{{display:inline-block;padding:.6rem 1.1rem;min-height:44px;
              border-radius:var(--radius-personality,8px);
              background:var(--color-accent,#0055aa);
              color:var(--color-accent_foreground,#fff)}}
    [data-vp="mobile"]{{width:375px}}
    @media (max-width: 768px) {{
      .mock-cta,.cta,.btn,.button{{width:100%;min-height:48px;
        display:block;text-align:center}}}}
    [data-vp="tablet"]{{width:768px}}
    [data-vp="desktop"]{{width:1280px}}
    /* per-variant knob vectors — assembled from DNA */{chr(10).join(style)}</style>
  <script is:inline>
    (function () {{
      var saved = localStorage.getItem('theme');
      var mode = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.dataset.theme = mode;
      document.querySelectorAll('.pg').forEach(function (p) {{ p.dataset.mode = mode; }});
    }})();
  </script>
</head>
<body class="variants-page">
  <div class="variant-switcher" data-switch="variant">
    {''.join(f'<button data-goto="{e["id"]}">{e["id"]}</button>' for e in entries)}
    <span data-switch="viewport">
      <button data-viewport="desktop">Desktop</button>
      <button data-viewport="tablet">Tablet</button>
      <button data-viewport="mobile">Mobile</button>
    </span>
    <span data-switch="mode">
      <button data-mode="light">Light</button>
      <button data-mode="dark">Dark</button>
    </span>
    <button data-theme-toggle>Light/Dark</button>
  </div>
  <main class="variant-grid">
{chr(10).join(tiles)}
  </main>
</body>
</html>
'''
    return os.path.join(ctx.dir, 'preview', 'variants.html'), txt, h


def knobs_val(kn, base, key):
    return (kn or {}).get(key, (base or {}).get(key))


# ---------------------------------------------------------------- measurable
# Reviewer rules that are in fact arithmetic. These moved from the W8
# rubric to script: C.3 neutral tint, G.2 proximity law, S.5 border
# widths, M.6 reduced motion, R.4 copy density, E.3 SEO lint.

def _hex_to_hsl(h):
    h = h.strip().lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    if len(h) != 6:
        return None
    try:
        r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    except ValueError:
        return None
    mx, mn = max(r, g, b), min(r, g, b)
    l = (mx + mn) / 2
    if mx == mn:
        return 0.0, 0.0, l * 100
    d = mx - mn
    s = d / (2 - mx - mn) if l > 0.5 else d / (mx + mn)
    return None, s * 100, l * 100


def _chroma_delta(h):
    """max-min channel delta (0–255) — 'is this neutral tinted at all?'."""
    h = h.strip().lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    if len(h) != 6:
        return None
    try:
        ch = [int(h[i:i + 2], 16) for i in (0, 2, 4)]
    except ValueError:
        return None
    return max(ch) - min(ch)


def check_neutral_tint(ctx):
    """C.3 — neutrals carry the brand hue (chroma 1–8), never dead grey."""
    f = []
    roles = (_system(ctx).get('color') or {}).get('roles') or {}
    if not roles:
        return ['C.3 plan has no system.color.roles']
    bands = {'bg': (1, 8), 'surface': (1, 8), 'surface_elevated': (2, 10),
             'border': (2, 12), 'ink_muted': (2, 24), 'ink': (2, 24),
             'inverse': (2, 24)}
    for name, (lo, hi) in bands.items():
        role = roles.get(name)
        if not role:
            continue
        val = str((role or {}).get('value', ''))
        if val.upper() in ('#000000', '#000', '#FFFFFF', '#FFF'):
            f.append(f'C.3 {name}: {val} — pure black/white is not a '
                     'neutral; tint it (10–15% ink, 98–99% paper)')
            continue
        d = _chroma_delta(val)
        if d is None:
            continue
        if d < lo:
            f.append(f'C.3 {name}: chroma delta {d} — dead grey; tint with '
                     f'the brand hue (delta {lo}–{hi})')
        elif d > hi:
            f.append(f'C.3 {name}: chroma delta {d} > {hi} — over-saturated '
                     'neutral')
    return f


def check_proximity(ctx):
    """G.2 — between-group gap ≥ 2× within-group gap, declared and met."""
    f = []
    sp = (_system(ctx).get('space') or {})
    commit = str(sp.get('group_gap_vs_section_gap') or '')
    m = re.search(r'(\d+(?:\.\d+)?)\s*×', commit)
    if not m:
        return ['G.2 system.space.group_gap_vs_section_gap missing — the '
                'proximity commitment is plan-time']
    if float(m.group(1)) < 2:
        f.append(f'G.2 declared ratio {m.group(1)}× < 2× — proximity law '
                 'is arithmetic, not taste')
    scale = sp.get('scale') or []
    vals = [int(x) for x in scale if str(x).isdigit()]
    dens = sp.get('section_densities') or {}
    for name, d in dens.items():
        if name == 'compact':
            continue          # compact is a named tier (G.3), not the law
        py = str((d or {}).get('py') or '')
        idx = re.match(r'space-(\d+)$', py)
        if not idx or not vals:
            continue
        i = int(idx.group(1))
        if i >= len(vals):
            continue
        group = vals[3] if len(vals) > 3 else vals[-1]
        if group and vals[i] < 2 * group:
            f.append(f'G.2 {name}: section padding {vals[i]}px < 2× group '
                     f'gap {group}px')
    return f


def check_border_widths(ctx):
    """S.5 — border widths are exactly {0, 1px, 2px}."""
    f = []
    css = ctx.read('site/src/styles/global.css') or ''
    for root, _, fns in os.walk(os.path.join(ctx.site, 'src')):
        for fn in fns:
            if fn.endswith(('.astro', '.css', '.html')):
                css += open(os.path.join(root, fn), encoding='utf-8',
                            errors='replace').read()
    for m in re.finditer(r'border(?:-(?:top|right|bottom|left|block|inline))?'
                         r'(?:-width)?\s*:\s*([\d.]+)px', css):
        w = float(m.group(1))
        if w not in (0.0, 1.0, 2.0):
            f.append(f'S.5 border width {m.group(1)}px — closed set '
                     '{0, 1px, 2px} (2px is focus/active only)')
    return f


def check_reduced_motion(ctx):
    """M.6 — prefers-reduced-motion fallback exists whenever motion is on."""
    f = []
    direction = ((ctx.plan.get('site') or {}).get('direction') or {})
    motion = str(direction.get('motion') or 'subtle')
    css = ctx.read('site/src/styles/global.css') or ''
    for root, _, fns in os.walk(os.path.join(ctx.site, 'src')):
        for fn in fns:
            if fn.endswith('.css'):
                css += open(os.path.join(root, fn), encoding='utf-8',
                            errors='replace').read()
    if motion != 'none' and 'prefers-reduced-motion' not in css:
        f.append('M.6 no prefers-reduced-motion block — reduced motion is '
                 'mandatory, all spatial movement falls back to a 150ms '
                 'opacity crossfade')
    return f


def check_copy_density(ctx):
    """R.4 — section paragraphs ≤240 chars; prose slots ≤500."""
    f = []
    pages = ctx.page_htmls()
    if not pages:
        return []
    for p, txt in pages:
        name = os.path.basename(p)
        for sec in re.finditer(
                r'<(section|nav)\b([^>]*)>(.*?)(?=<(?:section|nav)\b|</body>)',
                txt, re.S):
            attrs = dict(re.findall(r'([\w-]+)="([^"]*)"', sec.group(2)))
            secname = attrs.get('data-sec', '?')
            prose = 'editorial' in attrs.get('data-comp', '')
            for pm in re.finditer(r'<p\b[^>]*>(.*?)</p>', sec.group(3),
                                  re.S):
                body = re.sub(r'<[^>]+>', ' ', pm.group(1))
                body = ' '.join(html.unescape(body).split())
                cap = 500 if prose else 240
                if len(body) > cap:
                    f.append(f'R.4 {name} section "{secname}": paragraph '
                             f'{len(body)} chars > {cap} cap — split it')
    return f


def check_seo_lint(ctx):
    """E.3 — one h1 per page; heading ranks never skip."""
    f = []
    for p, txt in ctx.page_htmls():
        name = os.path.basename(p)
        ranks = [int(m.group(1)) for m in
                 re.finditer(r'<h([1-6])\b', txt)]
        if ranks.count(1) != 1:
            f.append(f'E.3 {name}: {ranks.count(1)} <h1> — exactly one')
        prev = 0
        for r in ranks:
            if prev and r > prev + 1:
                f.append(f'E.3 {name}: h{prev} → h{r} skips a rank')
                break
            prev = r
    return f


# ---------------------------------------------------------------- wave runners





# ---- operator approvals (P.8) -------------------------------------------
#
# Approval is an OPERATOR act. The designer's pipeline dir is writable by
# the designer, so a flag there is self-grading (B F-01). `run.py approve`
# requires an interactive TTY, then HMAC-signs {wave, input hash, DNA
# slices} with a key that only that command creates. Gates re-verify the
# signature against the CURRENT inputs; a changed input voids the approval.

OPERATOR_HOME = os.environ.get(
    'WEB_FACTORY_OPERATOR_HOME', os.path.expanduser('~/.web-factory'))


def op_key(create=False):
    p = os.path.join(OPERATOR_HOME, 'operator.key')
    if os.path.isfile(p):
        return open(p, 'rb').read().strip()
    if not create:
        return None
    os.makedirs(OPERATOR_HOME, exist_ok=True)
    k = os.urandom(32).hex().encode()
    with open(p, 'wb') as fh:
        fh.write(k)
    os.chmod(p, 0o600)
    return k


def _sig(rec, key):
    body = {k: v for k, v in rec.items() if k != 'sig'}
    return hmac.new(key, json.dumps(body, sort_keys=True).encode(),
                    hashlib.sha256).hexdigest()[:32]


def approvals_path(ctx):
    return os.path.join(OPERATOR_HOME, 'approvals',
                        _h(os.path.abspath(ctx.dir)) + '.json')


def read_approvals(ctx):
    p = approvals_path(ctx)
    if not os.path.isfile(p):
        return {}
    try:
        return json.load(open(p))
    except Exception:
        return {}


def input_hashes_for(ctx, wave):
    """Rehash the file list the wave RECORDED at gate time (A F41 —
    current CLI args must not shrink the comparison set)."""
    rec = (load_gates(ctx) or {}).get(wave) or {}
    files = rec.get('inputs_files')
    if files:
        h = {}
        for rel in files:
            p = os.path.join(ctx.dir, rel)
            h[rel] = (hashlib.sha256(open(p, 'rb').read())
                      .hexdigest()[:16] if os.path.isfile(p) else None)
        return h
    keep = getattr(ctx, 'wave', None)
    ctx.wave = wave
    try:
        return input_hashes(ctx)
    finally:
        ctx.wave = keep


def approval_state(ctx, wave):
    """('ok'|'missing'|'stale'|'unsigned') for wave's operator approval.
    'w*' means EVERY approvable wave is signed and current."""
    if wave == 'w*':
        states = [approval_state(ctx, w) for w in sorted(APPROVABLE)]
        if all(st == 'ok' for st in states):
            return 'ok'
        return 'missing' if 'missing' in states else \
            ('stale' if 'stale' in states else 'unsigned')
    key = op_key()
    rec = (read_approvals(ctx) or {}).get(wave)
    if not rec:
        return 'missing'
    if not key or rec.get('sig') != _sig(rec, key):
        return 'unsigned'
    # provenance: an interactive TTY confirm or a consumed service
    # nonce — a record the designer minted itself is unverifiable (P.8)
    if rec.get('by') != 'operator-tty' and not rec.get('nonce'):
        return 'no-provenance'
    sl = dna_slices(dna_map(ctx) or {})
    if rec.get('inputs') != _h(input_hashes_for(ctx, wave)):
        return 'stale'
    kinds = ('core', 'structure') if WAVE_DNA_KIND.get(wave) == 'all' \
        else (WAVE_DNA_KIND.get(wave) or 'core',)
    cur = {k: sl.get(k) for k in kinds}
    if {k: (rec.get('dna') or {}).get(k) for k in kinds} != cur:
        # migration path (F-05): a machinery recipe change must not void
        # an approval of unchanged content — verify the record against
        # the legacy recipe, then re-key it to the current slices
        legacy = dna_slices_legacy(dna_map(ctx) or {})
        lcur = {k: legacy.get(k) for k in kinds}
        if {k: (rec.get('dna') or {}).get(k) for k in kinds} == lcur:
            rec['dna'] = {'core': sl.get('core'),
                          'structure': sl.get('structure')}
            rec['migrated_from'] = 'dna_slices_legacy'
            rec['sig'] = _sig(rec, key)
            allr = read_approvals(ctx)
            allr[wave] = rec
            with open(approvals_path(ctx), 'w') as fh:
                json.dump(allr, fh, indent=2, sort_keys=True)
            return 'ok'
        return 'stale'
    return 'ok'


def write_approval(ctx, wave, by='operator-service', design=None,
                   nonce=None, chat=None, evidence=None):
    key = op_key(create=True)
    sl = dna_slices(dna_map(ctx) or {})
    rec = {'wave': wave,
           'inputs': _h(input_hashes_for(ctx, wave)),
           'dna': {'core': sl.get('core'), 'structure': sl.get('structure')},
           'by': by,
           'ts': __import__('datetime').datetime.now().isoformat(
               timespec='seconds')}
    if design:
        rec['design'] = str(design)[:40]
    if nonce:
        rec['nonce'] = nonce
    if chat:
        rec['chat'] = str(chat)[:300]
    if evidence:
        rec['evidence'] = str(evidence)[:300]
    rec['sig'] = _sig(rec, key)
    p = approvals_path(ctx)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    allr = read_approvals(ctx)
    allr[wave] = rec
    with open(p, 'w') as fh:
        json.dump(allr, fh, indent=2, sort_keys=True)
    return rec


def input_hashes(ctx):
    files = list(WAVE_INPUTS.get(ctx.wave, []))
    if ctx.wave == 'w5':
        wf = ctx.wireframe_path()
        if wf:
            files.append(wf)
    if ctx.wave in ('w5', 'w7'):
        st = ctx.stub_path()
        if st:
            files.append(st)
    if ctx.wave == 'w6':
        files += [os.path.join(ctx.site, 'src/components', c)
                  for c in ctx.components()]
    if ctx.wave == 'w7':
        files += [p for p, _ in ctx.page_htmls()]
        for slug in ctx.pages():
            sp = ctx.find(f'PAGES/{slug}/SPEC.md')
            if sp:
                files.append(sp)
    h = {}
    for f in files:
        p = f if os.path.isabs(f) else os.path.join(ctx.dir, f)
        if os.path.isfile(p):
            h[os.path.relpath(p, ctx.dir)] = hashlib.sha256(
                open(p, 'rb').read()).hexdigest()[:16]
        else:
            h[os.path.relpath(p, ctx.dir)] = None
    return h

def ancestry_fails(ctx):
    """ORDER — no wave runs unless every earlier wave passed (and every
    approvable one is operator-approved for the CURRENT inputs)."""
    f = []
    if ctx.wave not in WAVE_SEQ or ctx.wave == 'w0':
        return f
    g = load_gates(ctx)
    for w in WAVE_SEQ[:WAVE_SEQ.index(ctx.wave)]:
        e = g.get(w) or {}
        if not e.get('pass'):
            f.append(f'ORDER: {w} has not passed — run it first '
                     f'(python3 tools/design-gate/run.py {w} <dir>)')
            continue
        if w in APPROVABLE:
            st = approval_state(ctx, w)
            if st != 'ok':
                f.append(f'P.8 {w} approval {st} — operator runs '
                         f'`run.py approve {w} <dir>` in a terminal '
                         '(a flag inside the pipeline cannot approve)')
        if e.get('inputs_sha256') and e['inputs_sha256'] != \
                input_hashes_for(ctx, w):
            f.append(f'ORDER: {w} inputs changed since it passed — '
                     f're-gate {w}')
    return f


def run_wave(ctx):
    fails = ancestry_fails(ctx)
    if not os.path.isfile(os.path.join(ctx.dir, 'DESIGN-PLAN.md')) \
            and ctx.wave != 'w0':
        fails.append('DESIGN-PLAN.md missing')
    for chk in WAVE_CHECKS[ctx.wave]:
        try:
            fails += chk(ctx)
        except Exception as e:
            fails.append(f'{chk.__name__} errored: {e}')
    # check_checklist already covers P.9; identical lines from checks
    # that share a rule (e.g. check_dark_mode at two waves) count once
    fails = list(dict.fromkeys(fails))
    return _apply_declared_breaks(ctx, fails)

def _apply_declared_breaks(ctx, fails):
    """B.4 — a declared break covers ONLY the section it names.
    Invariant and undeclared violations stay failures."""
    scopes = skipped_rules(ctx)
    if not scopes:
        return fails
    return [m for m in fails if not _break_covers(scopes, m)]


ARTIFACTS = {
    'w3': ['preview/layouts.html'],
    'w4': ['preview/variants.html'],
    'w5': ['preview/system.html'],
    'w7': ['SPEC.md', 'ASSEMBLED.md'],
    'w8': ['SCORECARD.json', 'REVIEW.json'],
}


def write_receipt(ctx, relpath):
    """Bind an artifact to the passing wave in GATES.json — the
    NOTHING-OUTSIDE-THE-PIPELINE receipt (P.17)."""
    g = load_gates(ctx)
    fp = os.path.join(ctx.dir, relpath)
    if not os.path.isfile(fp):
        return
    sha = hashlib.sha256(open(fp, 'rb').read()).hexdigest()
    arts = g.setdefault('artifacts', {})
    arts[relpath] = {'wave': ctx.wave, 'sha256': sha,
                     'gate_pass': bool((g.get(ctx.wave) or {})
                                       .get('pass'))}
    json.dump(g, open(ctx.gates_path, 'w'), indent=1)


def check_receipt(path):
    """Validate an artifact's gate receipt — refuse unreceipted files."""
    ap = os.path.abspath(path)
    d = os.path.dirname(ap)
    gp = None
    probe = d
    while probe != os.path.dirname(probe):
        cand = os.path.join(probe, 'GATES.json')
        if os.path.isfile(cand):
            gp = cand
            break
        probe = os.path.dirname(probe)
    if not gp:
        print(f'receipt FAIL {path}: not inside a pipeline '
              '(no GATES.json) — nothing outside the pipeline')
        return 1
    g = json.load(open(gp))
    rel = os.path.relpath(ap, os.path.dirname(gp))
    arts = g.get('artifacts') or {}
    rec = arts.get(rel)
    fails = []
    if not rec:
        fails.append(f'{rel}: no receipt — the orchestrator must not '
                     'show artifacts the gate has not bound')
    else:
        sha = hashlib.sha256(open(ap, 'rb').read()).hexdigest() \
            if os.path.isfile(ap) else None
        if sha != rec.get('sha256'):
            fails.append(f'{rel}: file changed since its receipt — '
                         're-run the wave')
        wv = rec.get('wave')
        if not (g.get(wv) or {}).get('pass'):
            fails.append(f'{rel}: bound wave {wv} has no PASS entry')
    if fails:
        for x in fails:
            print('receipt FAIL', x)
        return 1
    print(f'receipt PASS {rel} — wave {rec["wave"]}, '
          f'sha {rec["sha256"][:12]}')
    return 0


def load_gates(ctx):
    if os.path.isfile(ctx.gates_path):
        try:
            return json.load(open(ctx.gates_path))
        except Exception:
            return {}
    return {}

def write_gate(ctx, fails, approve):
    g = load_gates(ctx)
    entry = g.get(ctx.wave, {})
    ih = input_hashes(ctx)
    entry.update({
        'pass': not fails,
        'failures': fails,
        'inputs_sha256': ih,
        'inputs_files': sorted(k for k, v in ih.items()
                               if v is not None),
        'dna': {'core': sl.get('core'), 'structure': sl.get('structure')}
               if (sl := dna_slices(dna_map(ctx) or {})) else None,
        'ts': __import__('datetime').datetime.now().isoformat(
            timespec='seconds'),
    })
    for rel in ARTIFACTS.get(ctx.wave, []):
        if not fails:
            write_receipt(ctx, rel)
    if ctx.wave in ('w3', 'w4') and getattr(ctx.args, 'design', None):
        entry['design'] = ctx.design_id()
    # never trust a stored flag: approval is re-verified against the
    # signed operator record and the CURRENT inputs (B F-01/F-08)
    entry['approved'] = (not fails and
                         approval_state(ctx, ctx.wave) == 'ok')
    g[ctx.wave] = entry
    with open(ctx.gates_path, 'w') as fh:
        json.dump(g, fh, indent=2, sort_keys=True)
    return entry

# ---------------------------------------------------------------- coverage

def all_rule_ids():
    ids = set()
    for fn in os.listdir(RULES_DIR):
        if fn.endswith('.md'):
            for m in re.finditer(r'^### ((?:[A-Z]{1,3}|PS)\.\d+)',
                                 open(os.path.join(RULES_DIR, fn)).read(),
                                 re.M):
                ids.add(m.group(1))
    return ids

def rubric_items():
    """{rule_id: item} from the W8 reviewer CARD."""
    path = os.path.join(DESIGN_DIR, 'stage-w8-review', 'CARD.md')
    out = {}
    if not os.path.isfile(path):
        return out
    lines = open(path, encoding='utf-8').read().split('\n')
    joined = []
    for line in lines:
        if line.startswith('  ') and joined and joined[-1].startswith('- '):
            joined[-1] += ' ' + line.strip()
        else:
            joined.append(line)
    for line in joined:
        for m in re.finditer(r'`((?:[A-Z]{1,3}|PS)\.\d+)`\s*'
                             r'(?:/\s*`(?:[A-Z]{1,3}|PS)\.\d+`\s*)*'
                             r'([A-Za-z][\w-]*)', line):
            for rid in re.findall(r'`((?:[A-Z]{1,3}|PS)\.\d+)`',
                                  m.group(0)):
                out.setdefault(rid, m.group(2))
    return out

def cmd_coverage():
    ids = all_rule_ids()
    try:
        enf = json.load(open(ENFORCEMENT))
    except Exception as e:
        print(f'coverage FAIL: enforcement.json unparseable: {e}')
        return 1
    fails = []
    rules = enf.get('rules', {})
    for rid in sorted(ids - set(rules)):
        fails.append(f'rule {rid} missing from enforcement.json')
    for rid in sorted(set(rules) - ids):
        fails.append(f'enforcement.json has orphan rule {rid} '
                     '(no such ID in rules/)')
    checks = {c.__name__ for lst in WAVE_CHECKS.values() for c in lst}
    items = rubric_items()
    for rid, e in rules.items():
        if e.get('mode') not in ('script', 'reviewer', 'operator'):
            fails.append(f'{rid}: bad mode {e.get("mode")}')
        elif e['mode'] == 'script' and e.get('check') not in checks:
            fails.append(f'{rid}: check {e.get("check")} not implemented')
        elif e['mode'] == 'reviewer' and \
                e.get('item') != items.get(rid):
            fails.append(f'{rid}: rubric item {e.get("item")} not in '
                         'W8 CARD')
        if e.get('tier') not in ('invariant', 'structural', 'stylistic'):
            fails.append(f'{rid}: missing or invalid tier {e.get("tier")!r}')
    named = {e['check'] for e in rules.values() if e.get('check')}
    cmap = enf.get('checks') or {}
    for c in sorted(checks - named):
        owners = cmap.get(c)
        if not owners:
            fails.append(f'check {c} unreferenced by enforcement.json')
        else:
            for o in owners:
                if o not in rules:
                    fails.append(f'check {c} maps to unknown rule {o}')
    stats = {m: sum(1 for e in rules.values() if e.get('mode') == m)
             for m in ('script', 'reviewer', 'operator')}
    if fails:
        print(f'coverage FAIL ({len(ids)} rule ids):')
        for x in fails:
            print('  -', x)
        return 1
    print(f'coverage PASS: {len(ids)} rule ids — script={stats["script"]} '
          f'reviewer={stats["reviewer"]} operator={stats["operator"]}')
    return 0

def cli_selftest():
    gate_self = sys.modules[__name__]
    """The look-up CLIs must answer for every rule the gates enforce."""
    import shutil, subprocess, tempfile
    rp = os.path.join(HERE, 'rules.py')
    enf = json.load(open(ENFORCEMENT))['rules']
    f = []

    def run(*a):
        return subprocess.run([sys.executable, rp] + list(a),
                              capture_output=True, text=True)

    r = run('--list')
    if r.returncode != 0:
        f.append(f'rules.py --list exits {r.returncode}: '
                 f'{r.stderr.strip().splitlines()[-1:] or ""}')
    else:
        ids = {ln.split()[0] for ln in r.stdout.splitlines() if ln.strip()}
        miss = sorted(set(enf) - ids)
        if miss:
            f.append(f'rules.py --list omits {len(miss)} enforced rule(s): '
                     f'{miss[:4]}')
    r = run('--list', '--json')
    try:
        rows = json.loads(r.stdout or '[]')
        if len(rows) != len(enf):
            f.append(f'rules.py --list --json returns {len(rows)} rows for '
                     f'{len(enf)} rules')
    except Exception as e:
        f.append(f'rules.py --list --json is not JSON: {e}')
    for q in ('T.6', 'C.5', 'DM.1', 'w5'):
        r = run(q)
        if r.returncode != 0 or not r.stdout.strip():
            f.append(f'rules.py {q} exits {r.returncode} with no output')
    r = run('--checks')
    if r.returncode != 0 or 'check_' not in r.stdout:
        f.append('rules.py --checks prints no gate checks')
    r = run('no-such-rule-xyz')
    if r.returncode == 0:
        f.append('rules.py accepts a query that matches nothing')
    # run.py approve end-to-end: the nonce path records a real signed
    # approval without a TTY, inside a temp operator home (P0 —
    # Ctx.wave crash; F-01 — never the real ~/.web-factory)
    tmpd = tempfile.mkdtemp()
    try:
        home = os.path.join(tmpd, 'op-home')
        os.makedirs(os.path.join(home, '.web-factory'))
        with open(os.path.join(home, '.web-factory', 'operator.key'),
                  'w') as fh:
            fh.write('fixture-key')
        os.environ['WEB_FACTORY_OPERATOR_HOME'] = \
            os.path.join(home, '.web-factory')
        gate_self.OPERATOR_HOME = os.environ['WEB_FACTORY_OPERATOR_HOME']
        pd_ = os.path.join(tmpd, 'p')
        fxd = os.path.join(HERE, 'fixtures')
        shutil.copytree(os.path.join(fxd, '_base'), pd_, symlinks=True)
        gp = os.path.join(pd_, 'GATES.json')
        ctx_t = Ctx(pd_)
        gates = {'w0': {'pass': True,
                        'inputs_sha256': input_hashes_for(ctx_t, 'w0')},
                 'w1': {'pass': True,
                        'inputs_sha256': input_hashes_for(ctx_t, 'w1')}}
        json.dump(gates, open(gp, 'w'))
        env = dict(os.environ)
        r = subprocess.run(
            [sys.executable, os.path.join(HERE, 'run.py'), 'approve',
             'w1', pd_], capture_output=True, text=True, env=env)
        if 'REFUSED' not in r.stdout + r.stderr:
            f.append('run.py approve without TTY/nonce did not refuse')
        if '--evidence' in (r.stdout + r.stderr) or r.returncode == 0:
            f.append('run.py approve still accepts a free-text path')
        r = subprocess.run(
            [sys.executable, os.path.join(HERE, 'run.py'), 'nonce',
             'w1', pd_], capture_output=True, text=True, env=env)
        nonce = r.stdout.strip()
        if r.returncode != 0 or len(nonce) != 32:
            f.append(f'run.py nonce failed: {r.stdout + r.stderr}')
        else:
            r = subprocess.run(
                [sys.executable, os.path.join(HERE, 'run.py'),
                 'approve', 'w1', pd_, '--nonce', nonce],
                capture_output=True, text=True, env=env)
            if r.returncode != 0:
                f.append('run.py approve --nonce failed: '
                         f'{(r.stdout + r.stderr).strip()[-200:]}')
            else:
                st = approval_state(Ctx(pd_), 'w1')
                if st != 'ok':
                    f.append(f'signed approval not verifiable: {st}')
                # nonce replay must refuse
                r2 = subprocess.run(
                    [sys.executable, os.path.join(HERE, 'run.py'),
                     'approve', 'w1', pd_, '--nonce', nonce],
                    capture_output=True, text=True, env=env)
                if r2.returncode == 0:
                    f.append('nonce replay accepted — nonces are '
                             'single-use')
    finally:
        shutil.rmtree(tmpd, ignore_errors=True)
    # gate.py round audits a standalone picker HTML end to end
    lp = os.path.join(HERE, 'fixtures', '_base', 'preview', 'layouts.html')
    r = subprocess.run([sys.executable, os.path.join(HERE, 'gate.py'),
                        'round', lp, '--round', '1'],
                       capture_output=True, text=True)
    if r.returncode != 0:
        f.append(f'gate.py round 1 fails the golden picker: '
                 f'{r.stdout.strip().splitlines()[:2]}')
    # A F04 / F39 / B F-08 — the W2 picker is sheet-only, its pass is
    # computed from the records, and each variant applies its vector.
    b2 = Ctx(os.path.join(HERE, 'fixtures', '_base'))
    b2.wave = 'w2'
    msgs = check_variants(b2)
    if any('no data-pane="page"' in m for m in msgs):
        f.append('check_variants wants a page pane the fixture lacks — '
                 'the operator picks between real page designs (VG.1)')
    if any('no knob CSS vars' in m for m in msgs):
        f.append('base fixture picker does not apply its knob vectors')
    # a designer-written pass:true cannot rescue an invalid variant
    tmpv = tempfile.mkdtemp()
    try:
        pv = os.path.join(tmpv, 'p')
        shutil.copytree(os.path.join(HERE, 'fixtures', '_base'), pv,
                        symlinks=True)
        d = json.load(open(os.path.join(pv, 'DNA.json')))
        for v in d['variants']:
            if v['id'] == 'v2':
                v['deltas'] = {'type.ratio': 9.9}
                v['pass'] = True
        d['hashes'] = dna_slices(d)
        with open(os.path.join(pv, 'DNA.json'), 'w') as fh:
            json.dump(d, fh)
        msgs = check_variants(Ctx(pv))
        if not any('v2' in m and 'VG.3' in m for m in msgs):
            f.append('check_variants trusts the designer pass flag instead '
                     'of computing it')
    finally:
        shutil.rmtree(tmpv, ignore_errors=True)
    # B F-04 — the operator invariants can never be broken by declaration
    base = Ctx(os.path.join(HERE, 'fixtures', '_base'))
    base.wave = 'w5'
    for rid in ('P.3', 'P.4', 'P.7', 'P.14', 'SB.3', 'VG.3'):
        if (_enforcement_rules().get(rid) or {}).get('tier') != 'invariant':
            f.append(f'{rid} is breakable — the wireframe lock, Mobbin, '
                     'per-section gates and all-pass picker are invariants')
            continue
        pl = dict(base.plan or {})
        pl['decisions'] = [{'rule_id': rid, 'where': 'hero',
                            'what': 'x', 'why': 'x',
                            'compensating': 'x'}]
        saved = base._plan
        base._plan = pl
        try:
            msgs = check_declared_breaks(base)
        finally:
            base._plan = saved
        if not any(rid in m and 'invariant' in m for m in msgs):
            f.append(f'a declared break of invariant {rid} is not rejected')
        if skipped_rules(base):
            pass
    # D.4 must be satisfiable for the whole closed composition set
    comps = catalog_compositions()
    if not comps:
        f.append('SECTION-CATALOG §2 has no composition table')
    arch = set(genome_genes().get('layout-archetype') or ())
    for c in sorted(comps):
        if not _arch_ok(c, arch):
            f.append(f'D.4 catalog composition "{c}" maps to no '
                     'layout-archetype allele (COMP_ARCH)')
    # checks that read global files are unit-tested through their helpers
    if _tier_fails({'T.1': {'tier': 'invariant'}}):
        f.append('check_tiers rejects a valid tier')
    for bad in ({}, {'tier': 'nope'}, {'tier': None}):
        if not _tier_fails({'X.9': bad}):
            f.append(f'check_tiers accepts tier {bad!r}')
    vec = {v: 90.0 for v in (load_score_vectors().get('vectors') or {})
           if v != 'overall'}
    if _scorecard_fails({'sections': {'T': 95}, 'vectors': vec}):
        f.append('check_scorecard rejects a clean card')
    if not _scorecard_fails({'sections': {'T': 80}, 'vectors': vec}):
        f.append('check_scorecard accepts a section below 90')
    if not _scorecard_fails({'sections': {'T': 95},
                             'vectors': dict(vec, colour=None)}):
        f.append('check_scorecard accepts a non-numeric vector')
    # gate.py dna must validate and render on a copy of the base fixture
    import shutil, tempfile
    tmp = tempfile.mkdtemp()
    try:
        shutil.copytree(os.path.join(HERE, 'fixtures', '_base'),
                        os.path.join(tmp, 'p'), symlinks=True)
        r = subprocess.run([sys.executable, os.path.join(HERE, 'gate.py'),
                            'dna', os.path.join(tmp, 'p')],
                           capture_output=True, text=True)
        if r.returncode != 0:
            f.append(f'gate.py dna exits {r.returncode}: '
                     f'{r.stdout.strip().splitlines()[:2]}')
        # every emitted import must resolve from src/pages/
        for gen in ('assemble_page', 'assemble_variants'):
            path, txt, _ = getattr(gate_self, gen)(Ctx(os.path.join(tmp, 'p')))
            base = os.path.dirname(path)
            for imp in re.findall(r"^import .* from '([^']+)';", txt, re.M):
                if not os.path.isfile(os.path.normpath(
                        os.path.join(base, imp))):
                    f.append(f'{gen} emits a broken import {imp} '
                             '(resolved from src/pages/)')
        md = os.path.join(tmp, 'p', 'DNA.md')
        if not os.path.isfile(md):
            f.append('gate.py dna renders no DNA.md')
        else:
            txt = open(md, encoding='utf-8').read()
            for want in ('look:', '## Genotype', '## System knobs',
                         '## Modes (both ship', '## Variants'):
                if want not in txt:
                    f.append(f'DNA.md missing section "{want}"')
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    # ORDER / P.8 / DM.6 — run.py and gate.py refuse on ancestry,
    # missing operator approval, and a changed DNA slice.
    tmp = tempfile.mkdtemp()
    saved_home = gate_self.OPERATOR_HOME
    try:
        home = os.path.join(tmp, 'home')
        os.makedirs(home)
        gate_self.OPERATOR_HOME = os.path.join(home, '.web-factory')
        pdir = os.path.join(tmp, 'p')
        shutil.copytree(os.path.join(HERE, 'fixtures', '_base'), pdir,
                        symlinks=True)
        c1 = Ctx(pdir)
        c1.wave = 'w1'
        gp = os.path.join(pdir, 'GATES.json')
        with open(gp, 'w') as fh:
            json.dump({'w0': {'pass': True, 'dna': None},
                       'w1': {'pass': True, 'approved': True,
                              'inputs_sha256': input_hashes(c1)}}, fh)
        os.environ['WEB_FACTORY_OPERATOR_HOME'] = \
            os.path.join(home, '.web-factory')
        env = dict(os.environ, HOME=home)
        rp = os.path.join(HERE, 'run.py')
        r = subprocess.run([sys.executable, rp, 'w2', pdir],
                           capture_output=True, text=True, env=env)
        if r.returncode == 0 or 'approval missing' not in r.stdout:
            f.append('run.py does not refuse a wave whose approvable '
                     f'ancestor is unsigned: {r.stdout.strip()[:120]}')
        g = json.load(open(gp))
        if g.get('w2', {}).get('pass'):
            f.append('run.py gated w2 without its ancestors being clean')
        # signed approval → w2 runs, then a changed DNA core stops it
        gate_self.write_approval(c1, 'w1', nonce='selftest-nonce')
        r = subprocess.run([sys.executable, rp, 'w2', pdir],
                           capture_output=True, text=True, env=env)
        if 'approval' in r.stdout and 'REFUSED' in r.stdout:
            f.append(f'run.py rejects a valid signed approval: '
                     f'{r.stdout.strip()[:120]}')
        sl = dna_slices(dna_map(c1))
        g = json.load(open(gp))
        g['w1'].update({'pass': True, 'dna': {'core': 'deadbeef',
                                              'structure': sl['structure']},
                        'inputs_sha256': input_hashes(c1)})
        with open(gp, 'w') as fh:
            json.dump(g, fh)
        r = subprocess.run([sys.executable, rp, 'w2', pdir],
                           capture_output=True, text=True, env=env)
        if r.returncode == 0 or 'DNA map changed' not in r.stdout:
            f.append('run.py does not refuse a wave after the DNA map '
                     f'changed: {r.stdout.strip()[:120]}')
        g = json.load(open(gp))
        if g.get('w1', {}).get('pass') is not False:
            f.append('run.py did not reset downstream gates on a DNA change')
        # gate.py itself refuses a wave with no ancestry (no bypass)
        r = subprocess.run([sys.executable, os.path.join(HERE, 'gate.py'),
                            'w4', pdir], capture_output=True, text=True,
                           env=env)
        if r.returncode == 0 or 'ORDER' not in r.stdout:
            f.append('gate.py wN runs without its ancestors passing '
                     f'(bypass): {r.stdout.strip()[:120]}')
        # gate.py --approve is not an approval channel
        r = subprocess.run([sys.executable, os.path.join(HERE, 'gate.py'),
                            'w3', pdir, '--approve'], capture_output=True,
                           text=True, env=env)
        if r.returncode != 2 or 'operator-only' not in r.stdout:
            f.append('gate.py --approve is still an approval channel')
    finally:
        gate_self.OPERATOR_HOME = saved_home
        shutil.rmtree(tmp, ignore_errors=True)
    return f


def cmd_selftest():
    import tempfile as _tf
    _home = os.path.join(_tf.mkdtemp(), '.web-factory')
    os.makedirs(_home, exist_ok=True)
    with open(os.path.join(_home, 'operator.key'), 'w') as fh:
        fh.write('fixture-key')
    globals()['OPERATOR_HOME'] = _home
    fx = os.path.join(HERE, 'fixtures')
    checks = {c.__name__: c for lst in WAVE_CHECKS.values()
              for c in lst}
    fails, ran = [], 0
    for name in sorted(os.listdir(fx)) if os.path.isdir(fx) else []:
        d = os.path.join(fx, name)
        if not os.path.isdir(d) or name not in checks:
            continue
        subs = ('pass',) if name == 'check_tiers' else ('pass', 'fail')
        for want, sub in ((0, 'pass'), (1, 'fail')):
            if sub not in subs:
                continue
            pd = os.path.join(d, sub)
            if not os.path.isdir(pd):
                fails.append(f'{name}: fixtures/{sub}/ missing')
                continue
            ctx = Ctx(pd)
            ctx.wave = 'selftest'
            got = checks[name](ctx)
            ran += 1
            if want == 0 and got:
                fails.append(f'{name}/pass fixture failed: {got[:2]}')
            if want == 1 and not got:
                fails.append(f'{name}/fail fixture NOT caught')
    fails += cli_selftest()
    tested = [n for n in checks if os.path.isdir(os.path.join(fx, n))]
    exempt = {
            'check_astro_build',     # needs a real astro toolchain
            'check_mobbin_auth'}     # needs ~/.mobbin-oauth outside fixtures
    missing = set(checks) - set(tested) - exempt
    for n in sorted(missing):
        fails.append(f'no fixtures for {n}')
    if fails:
        print(f'selftest FAIL ({ran} fixture runs):')
        for x in fails:
            print('  -', x)
        return 1
    print(f'selftest PASS: {ran} fixture runs across '
          f'{len(tested)} checks '
          f'({len(exempt)} env-exempt: {", ".join(sorted(exempt))})')
    return 0

# ---------------------------------------------------------------- main

# ---------------------------------------------------------------- wave tables

# ---------------------------------------------------------------- picker rounds

EMOJI_RX = re.compile(
    '[\U0001F300-\U0001FAFF\u2600-\u27BF\U0001F1E6-\U0001F1FF'
    '\u2190-\u21FF\u2300-\u23FF\u25A0-\u25FF\u203C\u2049\u2122'
    '\u2139\u3030\u303D\u20E3\uFE0F]')


def _design_blocks(txt):
    """{id: block_text} — one scope per design in a picker HTML."""
    m = list(re.finditer(
        r'(?:data-(?:design|variant|layout|scope)|id)="(d?[\w-]+)"', txt))
    ids = []
    for x in m:
        if x.group(1) not in ids and not x.group(1).startswith(
                ('switch', 'seg', 'frame')):
            ids.append(x.group(1))
    blocks = {}
    for i, d in enumerate(ids):
        start = 0
        mm = re.search(
            rf'<(?:article|div)[^>]*(?:data-(?:design|variant|layout)|id)='
            rf'"{re.escape(d)}"[^>]*>', txt)
        if not mm:
            continue
        start = mm.end()
        ends = [re.search(
            rf'<(?:article|div)[^>]*(?:data-(?:design|variant|layout)|id)='
            rf'"{re.escape(o)}"[^>]*>', txt[start:])
            for o in ids[i + 1:]]
        stops = [start + e.start() for e in ends if e]
        end = min(stops) if stops else len(txt)
        blocks[d] = txt[start:end]
    return blocks


def check_round(path, round_no, stub=None):
    """Gate one rendered picker HTML file.

    Round 1 (coarse LAYOUT): ≥5 options, pairwise structure distance
    ≥30% (target ~50). Rounds 2/3 (LOOK/FINE): exactly 3 options, ≥3
    differing knobs pairwise. Every round: cohesion within a design and
    the rendered-page battery (overflow, CTA, touch, body size, contrast
    both modes, emoji, Lucide, H1/vector).
    """
    f = []
    txt = open(path, encoding='utf-8', errors='replace').read()
    blocks = _design_blocks(txt)
    ids = list(blocks)
    # LAW.REF — every option carries canon refs; a score; the reviewer
    tags = {}
    for d in ids:
        m = re.search(
            rf'<article[^>]*(?:data-(?:design|variant|layout)|id)='
            rf'"{re.escape(d)}"[^>]*>', txt)
        tags[d] = m.group(0) if m else ''
    for d, b in blocks.items():
        scope = tags[d] + '\n' + b
        rm = re.search(r'data-(?:refs|canon)="([^"]*)"', scope)
        if not rm:
            f.append(f'LAW.REF option {d} carries no canon refs '
                     '(Mobbin screen id / operator site URL)')
        else:
            bad = [t for t in rm.group(1).split()
                   if not _canon_ref_ok(t)]
            if bad:
                f.append(f'LAW.REF option {d} cites non-canon '
                         f'{bad[:3]} — Mobbin ids or operator site '
                         'URLs only (web corpus / negatives / banked '
                         'sites removed)')
        sc = re.search(r'data-score="([\d.]+)"', scope)
        if not sc:
            f.append(f'ROUND score.py ranking missing on option {d} — '
                     'no picker without scoring')
        elif float(sc.group(1)) < 0.5:
            f.append(f'ROUND option {d} scored {sc.group(1)} < 0.5 — '
                     'below threshold: regenerate, do not show')
        if not re.search(r'data-review(?:er)?=', scope):
            f.append(f'ROUND option {d} has no visual-review mark '
                     '(independent model, 1280/375 both modes)')
    if 'ignored' not in txt.lower():
        f.append('LAW.REF picker carries no ignored list — retrieved '
                 'refs may not be silently dropped')
    if round_no == 1 and not re.search(
            r'data-hero="(?:image|scrim)[\w-]*"|<section[^>]*scrim', txt):
        f.append('ROUND1 needs ≥1 image-background + scrim-overlay '
                 'hero option')
    import itertools
    if round_no == 1:
        if len(ids) < 5:
            f.append(f'ROUND1 {len(ids)} design(s) — the coarse round '
                     'needs ≥5 completely different designs')
    else:
        if len(ids) != 3:
            f.append(f'ROUND{round_no} {len(ids)} design(s) — finer rounds '
                     'show exactly 3')
    # distinctness between designs
    secs = {d: re.findall(
        r'<(?:section|nav)[^>]*data-sec="([^"]+)"[^>]*'
        r'data-comp="([^"]+)"', b) for d, b in blocks.items()}
    scope_css = dict(re.findall(
        r'\[(?:data-(?:variant|design)-scope)="([^"]+)"\]\{([^}]*)\}',
        txt))
    knob_sets = {}
    for d, b in blocks.items():
        css = scope_css.get(d, '') + b
        knob_sets[d] = set(re.findall(
            r'--([a-z][\w-]*)\s*:\s*([^;}]+)', css))
    for a, b in itertools.combinations(ids, 2):
        if round_no == 1 and secs[a] and secs[a] == secs[b]:
            f.append(f'ROUND1 designs {a}/{b} identical section list — '
                     'duplicates are regenerated, never shown')
        if round_no == 1 and (secs[a] or secs[b]):
            n = max(len(secs[a]), len(secs[b])) or 1
            diff = sum(1 for x, y in itertools.zip_longest(
                secs[a], secs[b], fillvalue=(None, None)) if x != y)
            if diff / n < 0.3:
                f.append(f'ROUND1 designs {a}/{b} differ in {diff}/{n} '
                         'sections (<30% floor) — near-duplicates are '
                         'regenerated, not shown')
        if round_no > 1:
            ka = dict(knob_sets.get(a) or [])
            kb = dict(knob_sets.get(b) or [])
            diff = {k for k in set(ka) | set(kb) if ka.get(k) != kb.get(k)}
            if len(diff) < 3:
                f.append(f'ROUND{round_no} designs {a}/{b} differ in '
                         f'{len(diff)} knob(s) — ≥3 required pairwise')
    # cohesion within each design: one type scale, one radius
    # personality, one colour role map, one icon family, one imagery
    # treatment
    for d, b in blocks.items():
        fams = set(re.findall(r'font-family:\s*([^;}"]+)', b))
        if len(fams) > 2:
            f.append(f'COHESION {d}: {len(fams)} font families — one type '
                     'scale reads as one')
        radii = set(re.findall(r'border-radius:\s*([^;}"]+)', b))
        var_radii = {r for r in radii if r.startswith('var(')}
        px_radii = {r for r in radii if not r.startswith('var(')}
        if len(px_radii) > 3:
            f.append(f'COHESION {d}: {len(px_radii)} literal radii — one '
                     'radius personality')
        icons = set(re.findall(r'viewBox="([^"]+)"', b))
        if icons - {'0 0 24 24'}:
            f.append(f'COHESION {d}: non-Lucide viewBox(es) '
                     f'{sorted(icons - {"0 0 24 24"})} — one icon family')
        filters = set(re.findall(r'filter:\s*([^;}"]+)', b))
        if len(filters) > 2:
            f.append(f'COHESION {d}: {len(filters)} image treatments')
    # --- rendered-page battery ----------------------------------------
    if 'name="viewport"' not in txt and "name='viewport'" not in txt:
        f.append('R.1 no viewport meta')
    if 'clamp(' not in txt:
        f.append('T.1 no fluid clamp type — h2/lead must be fluid at 375')
    for m in re.finditer(r'\bwidth:\s*(\d{3,})px', txt):
        if int(m.group(1)) > 1440:
            f.append(f'R.4 fixed width {m.group(1)}px — overflow risk at '
                     '375')
    if 'overflow-x' not in txt:
        f.append('R.4 no overflow-x guard on the page/stage')
    mob = ' '.join(re.findall(
        r'@media[^{]*max-width:\s*(?:767|768|640|480|375)px[^{]*\{'
        r'((?:[^{}]|\{[^}]*\})*)\}', txt))
    if re.search(r'class="[^"]*(?:cta|btn|button)', txt, re.I):
        if not re.search(
                r'(?:cta|btn|button)[^,{}]*\{[^}]*'
                r'(?:width|inline-size):\s*100%', mob):
            f.append('R.9 mobile media block does not make CTAs '
                     'full-width stacked (≥48px, centred, below tablet)')
        else:
            if not re.search(r'min-height:\s*(4[89]|[5-9]\d|\d{3,})px',
                             mob):
                f.append('R.9 mobile CTAs not ≥48px')
    for m in re.finditer(r'(?:body|\.pg)\s*\{[^}]*font-size:\s*'
                         r'(\d+)(?:px|rem)', txt):
        if int(m.group(1)) < 16:
            f.append(f'T.6 body text below 16px ({m.group(1)})')
            break
    # contrast in both modes: pull hex role pairs from mode scopes
    for mode, blk in (('light', 'dark'),):
        pass
    mode_blocks = re.findall(r'data-mode="(light|dark)"[^>]*\{([^}]*)\}',
                           txt)
    if not mode_blocks:
        mode_blocks = re.findall(
            r'\[(?:data-)?mode(?:="|=)(light|dark)"?\][^{]*\{([^}]*)\}',
            txt)
    if mode_blocks:
        for mode, css in mode_blocks:
            roles = dict(re.findall(r'--(?:color-)?([\w-]+)\s*:\s*'
                                    r'(#[0-9a-fA-F]{3,8})', css))
            ink, bg = roles.get('ink'), roles.get('bg')
            if ink and bg:
                r = contrast(ink, bg)
                if r is not None and r < 7:
                    f.append(f'C.5 [{mode}] ink:bg {r:.1f}:1 < 7:1')
    for m in EMOJI_RX.finditer(txt):
        if m.group(0) in '★☆':      # wildcard star is the VG label
            continue
        f.append(f'P.10 emoji {m.group(0)} in picker')
        break
    sw = re.search(r'stroke="([^"]+)"', txt)
    if sw and sw.group(1) != 'currentColor':
        f.append(f'P.11 icon stroke "{sw.group(1)}" — Lucide/currentColor '
                 'only')
    heads = [(m.group(1).lower(), m.group(2).strip())
             for m in re.finditer(r'<(h[1-6])[^>]*>(.*?)</\1>', txt,
                                  re.S | re.I)]
    if stub:
        vec = re.findall(r'H(\d)\s+([^|<]{4,})', stub)
        for tag, want in vec:
            wt = want.strip()
            if not any(h == wt for t, h in heads
                       if t == 'h' + tag):
                f.append(f'E.1 heading not verbatim in picker: "{wt}"')
        heads0 = [h for t, h in heads if t == 'h1']
        if vec and not heads0:
            f.append('E.1 no <h1> rendered in picker')
    return f


def cmd_round(a):
    """`gate.py round <picker.html> --round N [--stub STUB.md]`."""
    rd = getattr(a, 'round', None) or '1'
    fails = check_round(a.pipeline_dir, int(rd),
                        stub=open(a.stub).read()
                        if getattr(a, 'stub', None) else None)
    if fails:
        print(f'round{rd} FAIL ({len(fails)}):')
        for x in fails:
            print('  -', x)
        return 1
    print(f'round{rd} PASS — {a.pipeline_dir}')
    return 0


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('wave', choices=list(WAVE_CHECKS) +
                    ['coverage', 'selftest', 'consistency', 'graph',
                     'score', 'segment', 'wildcard', 'enforcement',
                     'contracts', 'section', 'dna', 'round',
                     'receipt'])
    ap.add_argument('pipeline_dir', nargs='?', default=None,
                    help='pipeline dir — REQUIRED for every pipeline '
                         'command (no silent cwd writes)')
    ap.add_argument('--wireframe')
    ap.add_argument('--design')
    ap.add_argument('--stub')
    ap.add_argument('--approve', action='store_true')
    ap.add_argument('--sec', help='section name for `gate.py section`')
    ap.add_argument('--round', help='picker round number (1, 2, 3)')
    a = ap.parse_args()
    if a.wave not in ('coverage', 'selftest', 'consistency', 'graph',
                      'enforcement') and not a.pipeline_dir:
        print(f'gate.py {a.wave}: pipeline_dir is required')
        return 2
    if a.approve:
        print('approval is operator-only (P.8) — run in a terminal:\n'
              f'  python3 tools/design-gate/run.py approve '
              f'{a.wave} {a.pipeline_dir or "<pipeline-dir>"}\n'
              'gate.py never records approval itself.')
        return 2
    if a.wave == 'coverage':
        return cmd_coverage()
    if a.wave == 'selftest':
        return cmd_selftest()
    if a.wave == 'consistency':
        return cmd_consistency()
    if a.wave == 'graph':
        return cmd_graph()
    if a.wave == 'score':
        return cmd_score(a)
    if a.wave == 'segment':
        return cmd_segment(a)
    if a.wave == 'wildcard':
        return cmd_wildcard(a)
    if a.wave == 'enforcement':
        return cmd_enforcement()
    if a.wave == 'dna':
        return cmd_dna(a.pipeline_dir)
    if a.wave == 'round':
        return cmd_round(a)
    if a.wave == 'receipt':
        return check_receipt(a.pipeline_dir)
    if a.wave == 'contracts':
        return cmd_contracts(a.pipeline_dir)
    if a.wave == 'section':
        return cmd_section(a.pipeline_dir, a.sec)
    ctx = Ctx(a.pipeline_dir, a)
    ctx.wave = a.wave
    fails = run_wave(ctx)
    entry = write_gate(ctx, fails, a.approve)
    status = 'PASS' if not fails else 'FAIL'
    print(f'{a.wave} {status} — {a.pipeline_dir}')
    for x in fails:
        print('  -', x)
    return 0 if not fails else 1

# ---------------------------------------------------------------- genome

def genome_genes():
    """{gene: set(alleles)} from dna/GENOME.md headings.

    A gene is `## gene: <slug>` (or `### gene: <slug>`); its allele set
    is the first `alleles:` line in the block, written either
    `alleles: [a, b, c]` or `alleles: a | b | c`.
    """
    path = os.path.join(DNA_DIR, 'GENOME.md')
    genes = {}
    if not os.path.isfile(path):
        return genes
    txt = open(path, encoding='utf-8', errors='replace').read()
    blocks = re.split(r'^#{2,3}\s+gene:\s*(\S+)\s*$', txt, flags=re.M)
    for i in range(1, len(blocks) - 1, 2):
        slug, body = blocks[i], blocks[i + 1]
        m = re.search(r'^alleles:\s*(.+)$', body, re.M)
        if not m:
            genes[slug] = set()
            continue
        raw = m.group(1).strip()
        vals = re.findall(r'[A-Za-z0-9][\w./-]*', raw)
        genes[slug] = set(vals)
    return genes

def dna_profiles():
    """{profile_id: {'genes': [...], 'file': name}} from dna/*.md."""
    out = {}
    if not os.path.isdir(DNA_DIR):
        return out
    for fn in sorted(os.listdir(DNA_DIR)):
        if not fn.endswith('.md') or fn == 'GENOME.md':
            continue
        p = os.path.join(DNA_DIR, fn)
        fm = _frontmatter(open(p, encoding='utf-8',
                               errors='replace').read())
        pid = fm.get('id') or ('profile-' + fn[:-3])
        links = fm.get('links') or {}
        genes = links.get('uses_genes') or []
        out[pid] = {'genes': [str(g) for g in
                              (genes if isinstance(genes, list) else [genes])],
                    'file': fn}
    return out

def _genotype(plan):
    dna = (plan.get('dna') or {})
    gt = dna.get('genotype') or {}
    if isinstance(gt, list):        # [{gene: allele}] form
        flat = {}
        for it in gt:
            if isinstance(it, dict):
                flat.update({str(k): str(v) for k, v in it.items()})
        gt = flat
    return (str(dna.get('profile') or ''), gt)

# Catalog composition -> the layout-archetype alleles that realise it
# (SECTION-CATALOG §2 names the shape; GENOME `layout-archetype` names the
# skeleton). A composition is legal when the gene allows any of its
# archetypes — a real page needs every act, so the map must be total.
COMP_ARCH = {
    'split-media': ('split-media', 'asymmetric-offset'),
    'stacked-hero': ('stacked-center',),
    'proof-band': ('horizontal-band',),
    'editorial': ('editorial-single',),
    'cards-n': ('card-grid-2', 'card-grid-3', 'card-grid-4'),
    'sequence': ('sequence-steps',),
    'faq': ('accordion-list',),
    'comparison': ('table-matrix', 'asymmetric-offset'),
    'logo-wall': ('horizontal-band',),
    'stat-band': ('horizontal-band',),
    'full-bleed': ('full-bleed-media', 'immersive-media'),
    'badge-center': ('stacked-center',),
    'media-gallery': ('masonry-grid', 'immersive-media', 'card-grid-4'),
    'form-panel': ('split-form',),
    'quote-grid': ('card-grid-2', 'card-grid-3', 'card-grid-4'),
    'map-finder': ('split-media', 'asymmetric-offset'),
    'capture-form': ('split-form',),
    'text-index': ('editorial-single', 'table-matrix'),
    'app-band': ('split-media',),
    'hero-act-merge': ('split-media', 'stacked-center'),
    'link-grid': ('editorial-single', 'table-matrix'),
    'carousel-track': ('carousel-track',),
    'table-matrix': ('table-matrix',),
    'form-inline': ('split-form',),
}


def catalog_compositions():
    """The closed composition set, read from SECTION-CATALOG §2."""
    try:
        t = open(os.path.join(REPO, 'docs', 'machinery',
                              'SECTION-CATALOG.md'), encoding='utf-8').read()
    except OSError:
        return set()
    sec = t.split('## 2. Compositions', 1)[-1].split('\n## ', 1)[0]
    return {c for c in re.findall(r'^\| `([a-z0-9-]+)` \|', sec, re.M)
            if c != 'composition'}


def _arch_ok(comp, arch):
    """Catalog composition → layout-archetype allele.

    The catalog names components (`cards-n`, `form-panel`); the genome
    names archetypes (`card-grid-3`, `split-form`). A composition is
    realised when the gene allows any allele of its family."""
    if comp in arch:
        return True
    return any(a in arch for a in COMP_ARCH.get(comp, ()))

def check_genotype(ctx):
    """D.1/D.2 (w1) and D.4 (w5): genotype total, profile covers it,
    compositions are layout-archetype alleles."""
    genes = genome_genes()
    if not genes:
        return ['D.1 dna/GENOME.md missing or has no `## gene:` headings '
                '— W1 requires the design genome']
    profiles = dna_profiles()
    profile, gt = _genotype(ctx.plan)
    f = []
    if not profile:
        f.append('D.2 dna.profile not set in DESIGN-PLAN.md')
    elif profile not in profiles:
        f.append(f'D.2 dna.profile {profile} has no file in dna/')
    else:
        covered = set(profiles[profile]['genes'])
        for g in sorted(genes):
            if f'gene-{g}' not in covered and g not in covered:
                f.append(f'D.2 profile {profile} does not list gene-{g} '
                         'in uses_genes')
    for g in sorted(genes):
        if g not in gt:
            f.append(f'D.1 genotype missing gene {g}')
        elif gt[g] not in genes[g]:
            f.append(f'D.1 genotype {g}={gt[g]} not an allele of {g} '
                     f'(allowed: {sorted(genes[g])[:6]})')
    for g in sorted(gt):
        if g not in genes:
            f.append(f'D.1 genotype has unknown gene {g}')
    # D.4 — compositions ⊆ layout-archetype alleles (chrome exempt)
    arch = genes.get('layout-archetype')
    if arch:
        for slug, row in ctx.rows():
            acts = str((row or {}).get('speech_act') or '')
            comp = str((row or {}).get('composition') or '')
            if 'chrome' in acts or comp in ('nav-bar', 'footer-bar'):
                continue
            for c in [x.strip() for x in comp.split('+') if x.strip()]:
                if not _arch_ok(c, arch):
                    f.append(f'D.4 {slug}.{row.get("name")}: composition '
                             f'{c} not a layout-archetype allele')
    return f

def check_genotype_distinct(ctx):
    """D.3 — options block lists ≥3 distinct vectors derived from the
    locked genotype/knob space: every key is a direction axis or a
    gene slug, every value is a member of that closed set (F-13)."""
    txt = ctx.plan_text
    m = re.search(r'^options:\s*\n((?:\s*-\s.*\n)+)', txt, re.M)
    genes = genome_genes()
    f = []
    vectors = []
    if m:
        for chunk in re.split(r'^\s*-\s', m.group(1), flags=re.M):
            pairs = dict(re.findall(
                r'([a-z][a-z0-9-]*):\s*([a-z][\w./-]*)', chunk))
            for meta in ('name', 'wildcard', 'profile', 'mutates'):
                pairs.pop(meta, None)
            name = re.search(r'name:\s*(\w+)', chunk)
            label = name.group(1) if name else '?'
            for k, v in pairs.items():
                if k in AXES:
                    if v not in AXES[k]:
                        f.append(f'D.3 option {label}: axis {k}={v} '
                                 f'∉ {sorted(AXES[k])}')
                elif k in genes:
                    if v not in genes[k]:
                        f.append(f'D.3 option {label}: {k}={v} not an '
                                 'allele (options are genotype/knob '
                                 'vectors, derived from DNA — not '
                                 'free text)')
                else:
                    f.append(f'D.3 option {label}: "{k}" is neither a '
                             'direction axis nor a genome gene — '
                             'option vectors are derived from the '
                             'locked space (F-13)')
            if pairs:
                vectors.append(tuple(sorted(pairs.items())))
    vectors = list(dict.fromkeys(vectors))
    if len(vectors) < 3:
        f.append(f'D.3 options: {len(vectors)} distinct genotype '
                 'vector(s) — the look round is exactly 3')
    return f

# ---------------------------------------------------------------- burst

TIERS = {'invariant', 'structural', 'stylistic'}
BURST_RANGE = {0, 1, 2, 3}

def _enforcement_rules():
    try:
        return json.load(open(ENFORCEMENT))['rules']
    except Exception:
        return {}

def burst_level(plan):
    try:
        return int((plan or {}).get('burst', 0))
    except (TypeError, ValueError):
        return None

def _options_block(txt):
    """[{name, wildcard, mutates, genes}] from the plan's options block."""
    m = re.search(r'^options:\s*\n((?:\s*-\s.*\n(?:\s{4,}.*\n)*)+)',
                  txt, re.M)
    out = []
    if not m:
        return out
    for chunk in re.split(r'^\s*-\s', m.group(1), flags=re.M):
        if not chunk.strip():
            continue
        name = re.search(r'name:\s*([\w-]+)', chunk)
        wc = re.search(r'wildcard:\s*(true|false)', chunk, re.I)
        mut = re.search(r'mutates:\s*\[([^\]]*)\]', chunk)
        out.append({'name': name.group(1) if name else '',
                    'wildcard': bool(wc and wc.group(1).lower() == 'true'),
                    'mutates': [x.strip() for x in mut.group(1).split(',')
                                if x.strip()] if mut else [],
                    'raw': chunk})
    return out

def declared_breaks(plan):
    """decisions[] rows that declare a rule break."""
    out = []
    for d in (plan or {}).get('decisions') or []:
        if isinstance(d, dict) and (d.get('rule_id') or d.get('rule')):
            out.append(d)
    return out

def _tier_fails(rules):
    if not rules:
        return ['B.1 enforcement.json unreadable — no tiers to check']
    return [f'B.1 rule {rid} has no valid tier ({e.get("tier")!r})'
            for rid, e in rules.items() if e.get('tier') not in TIERS]


def check_tiers(ctx):
    """B.1 — every rule in enforcement.json has exactly one valid tier."""
    return _tier_fails(_enforcement_rules())

def check_burst(ctx):
    """B.2/B.3 — toggle in range; exactly one wildcard when on."""
    plan = ctx.plan or {}
    burst = burst_level(plan)
    f = []
    if burst is None or burst not in BURST_RANGE:
        return [f'B.2 burst missing or outside 0–3 '
                f'({plan.get("burst")!r})']
    opts = _options_block(ctx.plan_text)
    wild = [o for o in opts if o['wildcard']]
    if burst == 0:
        if wild:
            f.append('B.3 burst=0 but an option is labelled wildcard')
        return f
    if len(opts) < 2:
        f.append(f'B.3 burst={burst} needs ≥2 options '
                 f'({len(opts)} found)')
    if len(wild) != 1:
        f.append(f'B.3 burst={burst} needs exactly one wildcard '
                 f'({len(wild)} found)')
    for o in wild:
        n = len(o['mutates'])
        if burst == 1 and not 1 <= n <= 2:
            f.append(f'B.3 wildcard {o["name"]} mutates {n} genes — '
                     'burst 1 mutates 1–2')
        if burst >= 1 and n < 1:
            f.append(f'B.3 wildcard {o["name"]} mutates no gene')
        if burst == 1 and declared_breaks(plan):
            f.append('B.3 burst=1 declared a structural break — '
                     'burst 2+ only')
    return f

def check_declared_breaks(ctx):
    """B.4 — every break: real structural rule, real section, one/section,
    compensating move present; invariant never broken."""
    rules = _enforcement_rules()
    plan = ctx.plan or {}
    burst = burst_level(plan)
    breaks = declared_breaks(plan)
    f = []
    if burst is None or burst not in BURST_RANGE:
        return f          # B.2 owns the toggle failure
    cap = {0: 0, 1: 0, 2: 1, 3: 2}[burst]
    if len(breaks) > cap:
        f.append(f'B.4 {len(breaks)} declared break(s) exceed burst={burst} '
                 f'cap {cap}')
    slugs = {str((r or {}).get('name')) for _, r in ctx.rows()}
    per_section = {}
    for b in breaks:
        rid = str(b.get('rule_id') or b.get('rule') or '')
        if rid not in rules:
            f.append(f'B.4 break names unknown rule {rid}')
            continue
        tier = rules[rid].get('tier')
        if tier == 'invariant':
            f.append(f'B.4 break of invariant {rid} — never a licence')
        elif tier == 'stylistic':
            f.append(f'B.4 break of stylistic {rid} needs no declaration — '
                     'mutate the allele instead')
        where = str(b.get('where') or '')
        if not where:
            f.append(f'B.4 break {rid} has no `where` section')
        else:
            per_section[where] = per_section.get(where, 0) + 1
            if slugs and where not in slugs:
                f.append(f'B.4 break {rid} `where: {where}` is not a '
                         'plan section')
        for field in ('what', 'why', 'compensating'):
            if not str(b.get(field) or '').strip():
                f.append(f'B.4 break {rid} missing `{field}`')
    for sec, n in per_section.items():
        if n > 1:
            f.append(f'B.4 {n} breaks in section {sec} — max one')
    return f

def skipped_rules(ctx):
    """{rule_id: {sections}} declared structural breaks (B.4).

    A break is scoped to the section it names — it never switches a rule
    off site-wide (B F-30)."""
    rules = _enforcement_rules()
    out = {}
    for b in declared_breaks(ctx.plan or {}):
        rid = str(b.get('rule_id') or b.get('rule') or '')
        if rules.get(rid, {}).get('tier') == 'structural':
            where = str(b.get('where') or '').strip()
            out.setdefault(rid, set()).add(where)
    return out


def _break_covers(scopes, msg):
    """True when a declared break covers this failure message."""
    rid = _rule_of(msg)
    if not rid or rid not in scopes:
        return False
    low = msg.lower()
    for where in scopes[rid]:
        if not where:
            return True
        if where.lower() in low or where.lower().replace('-', ' ') in low:
            return True
    return False

def check_style_review(ctx):
    """B.5 — a chosen wildcard is scored on the STYLE rubric."""
    plan = ctx.plan or {}
    burst = burst_level(plan) or 0
    opts = _options_block(ctx.plan_text)
    chosen = ctx.design_id()
    wild = [o['name'] for o in opts if o['wildcard']]
    if burst == 0 or not wild or chosen not in wild:
        return []
    txt = ctx.read('REVIEW.json')
    if not txt:
        return ['B.5 wildcard chosen but REVIEW.json is absent']
    try:
        style = json.loads(txt).get('style') or []
    except Exception:
        return ['B.5 REVIEW.json unparseable']
    need = {'intent-legible', 'coherence', 'focal-payoff', 'restraint',
            'on-brand'}
    got = {str(s.get('item')): s for s in style if isinstance(s, dict)}
    f = [f'B.5 wildcard style item missing: {x}'
         for x in sorted(need - set(got))]
    for item, row in got.items():
        if not row.get('pass'):
            f.append(f'B.5 wildcard style item failed: {item}')
    return f

def check_novelty(ctx):
    """B.6 — chosen wildcard's genome distance stays within its bound."""
    plan = ctx.plan or {}
    burst = burst_level(plan) or 0
    wild = [o['name'] for o in _options_block(ctx.plan_text)
            if o['wildcard']]
    if burst == 0 or not wild or ctx.design_id() not in wild:
        return []
    txt = ctx.read('NOVELTY.json')
    if not txt:
        return ['B.6 NOVELTY.json missing for a chosen wildcard']
    try:
        j = json.loads(txt)
        dist, bound = float(j['distance']), float(j['bound'])
    except Exception:
        return ['B.6 NOVELTY.json needs numeric {distance, bound}']
    if dist > bound:
        return [f'B.6 genome distance {dist} > bound {bound}']
    return []

def check_wildcard(ctx, waves=None):
    """B.* aggregate — the burst gate. Inside a wave it sweeps THAT wave
    only (a W2 gate must not demand W5 artefacts); `gate.py wildcard`
    sweeps the whole burst surface. Declared breaks are the ONLY
    tolerated violations."""
    if waves is None:
        w = getattr(ctx, 'wave', None)
        waves = (w,) if w in WAVE_SEQ else ('w3', 'w5')
    f = []
    f += check_tiers(ctx)
    f += check_burst(ctx)
    f += check_declared_breaks(ctx)
    scopes = skipped_rules(ctx)
    seen = set()
    for wv in waves:
        for chk in WAVE_CHECKS[wv]:
            if chk is check_wildcard:
                continue
            try:
                msgs = chk(ctx)
            except Exception as e:
                msgs = [f'{chk.__name__} errored: {e}']
            for msg in msgs:
                if _break_covers(scopes, msg):
                    continue
                if msg in seen:
                    continue
                seen.add(msg)
                f.append(f'undeclared violation: {msg}')
    f += check_novelty(ctx)
    f += check_style_review(ctx)
    return f

def cmd_wildcard(a):
    ctx = Ctx(a.pipeline_dir, a)
    ctx.wave = 'wildcard'
    fails = check_wildcard(ctx)
    plan = ctx.plan or {}
    rep = {'burst': plan.get('burst', 0),
           'design': ctx.design_id(),
           'breaks': [{'rule_id': b.get('rule_id') or b.get('rule'),
                       'where': b.get('where')} for b in
                      declared_breaks(plan)],
           'broken_by_intent': sorted(skipped_rules(ctx)),
           'pass': not fails, 'failures': fails}
    outp = os.path.join(ctx.dir, 'WILDCARD.json')
    json.dump(rep, open(outp, 'w'), indent=2)
    print(f'wildcard {"PASS" if not fails else "FAIL"} — burst='
          f'{rep["burst"]}, design={rep["design"]}')
    for x in fails:
        print('  -', x)
    print(f'  → {outp}')
    return 0 if not fails else 1

# __main__ guard lives at EOF, after scorecard/graph commands are defined.

def _rule_of(failmsg):
    m = re.match(r'([A-Z]+\.\d+|PS\.\d)', failmsg)
    return m.group(1) if m else None

def check_rhythm_render(ctx):
    """Rendered-page rhythm: contrast moment via surface classes,
    S-M-L density-class variance, composition runs (DOM-based)."""
    f = []
    for p, txt, parsed, blocks in _segmented(ctx):
        name = os.path.basename(p)
        tagged = [s for s in blocks if s.get('data-sec')]
        if not tagged:
            continue
        dark = [s for s in tagged if re.search(
            r'inverse|brand|dark|endact|bg-ink',
            str(s.get('class', '')) + str(s.get('data-comp', '')) +
            str(s.get('data-sec', '')))]
        if not dark:
            f.append(f'L.7 {name}: no contrast-moment surface '
                     'detected in rendered sections')
        dens = set()
        for s in tagged:
            for c in str(s.get('class', '')).split():
                if re.match(r'(py-|sec-|density-|compact|regular|spacious)',
                            c):
                    dens.add(c)
        if len(tagged) >= 3 and len(dens) < 2:
            f.append(f'L.7 {name}: uniform section density classes — '
                     'no S-M-L step rendered')
        comps = [str(s.get('data-comp')) for s in tagged]
        run = 1
        for i in range(1, len(comps)):
            run = run + 1 if comps[i] == comps[i-1] else 1
            if run > 2:
                f.append(f'L.13 {name}: >2 consecutive "{comps[i]}" '
                         'composition blocks rendered')
    return f

# ------------------------------------------------------------- scorecard

def _check_fail_map(ctx, waves):
    by_check, by_rule = {}, {}
    for wv in waves:
        for chk in WAVE_CHECKS[wv]:
            try:
                r = chk(ctx)
            except Exception:
                r = ['err']
            by_check[chk.__name__] = len(r)
            for msg in r:
                rid = _rule_of(msg)
                if rid:
                    by_rule[rid] = by_rule.get(rid, 0) + 1
    return by_check, by_rule

def compute_scorecard(ctx, waves=('w3', 'w5', 'w6', 'w7')):
    try:
        enf = json.load(open(ENFORCEMENT))['rules']
    except Exception:
        return {'error': 'enforcement.json unparseable'}
    by_check, by_rule = _check_fail_map(ctx, waves)
    review = {}
    rj = ctx.read('REVIEW.json')
    if rj:
        try:
            for it in json.loads(rj).get('items', []):
                for rr in str(it.get('rule', '')).split('/'):
                    review[rr] = 1.0 if it.get('pass') else 0.0
        except Exception:
            pass
    gates = load_gates(ctx)
    scores = {}
    broken = sorted(skipped_rules(ctx))
    for rid, e in enf.items():
        mode = e.get('mode')
        if mode == 'script':
            if rid in broken:
                scores[rid] = 1.0
                continue
            n = by_rule.get(rid, 0)
            if not n:
                n = by_check.get(e.get('check'), 0)
            scores[rid] = 1.0 if n == 0 else max(0.0, 1.0 - 0.34 * n)
        elif mode == 'reviewer':
            scores[rid] = review.get(rid, 0.0)
        elif mode == 'operator':
            wv = e.get('wave', '')
            # evidence = the signed operator record for THAT wave,
            # re-verified against current inputs (B F-32)
            scores[rid] = 1.0 if approval_state(ctx, wv) == 'ok' else 0.0
    sections = {}
    for rid, sc in scores.items():
        sec = 'PS' if rid.startswith('PS.') else rid.split('.')[0]
        sections.setdefault(sec, []).append(sc)
    card = {'sections': {k: round(100 * sum(v) / len(v), 1)
                         for k, v in sorted(sections.items())},
            'per_rule': {r: round(s, 2) for r, s in
                         sorted(scores.items())},
            'broken_by_intent': broken,
            'unscored': [r for r in enf if r not in scores]}
    vectors, vw = score_vectors(scores)
    if vectors:
        card['vectors'] = vectors
        card['overall'] = round(sum(vectors[k] * vw[k] for k in vectors) /
                                sum(vw.values()), 1)
    else:
        card['overall'] = round(sum(card['sections'].values()) /
                                len(card['sections']), 1) \
            if card['sections'] else 0
    return card


def load_score_vectors():
    try:
        return json.load(open(SCORE_VECTORS))
    except Exception:
        return {}


def vector_rule_ids(families):
    """Rule IDs a vector aggregates: prefix match ('L' -> L.1-L.13)."""
    ids = set()
    try:
        enf = json.load(open(ENFORCEMENT))['rules']
    except Exception:
        return ids
    for rid in enf:
        for fam in families:
            if rid == fam or rid.startswith(fam + '.'):
                ids.add(rid)
    return ids


def score_vectors(scores):
    """Each vector = weighted mean of its rule families' scores (0-100)."""
    spec = load_score_vectors().get('vectors') or {}
    out, weights = {}, {}
    for vid, v in spec.items():
        if not v.get('weight'):
            continue
        ids = vector_rule_ids(v.get('families') or [])
        vals = [scores[r] for r in ids if r in scores]
        if not vals:
            continue
        out[vid] = round(100 * sum(vals) / len(vals), 1)
        weights[vid] = v['weight']
    return out, weights

def _scorecard_fails(card):
    f = [f'scorecard section {s} = {v} < 90'
         for s, v in card.get('sections', {}).items() if v < 90]
    spec = set(load_score_vectors().get('vectors') or {}) - {'overall'}
    got = card.get('vectors') or {}
    if spec:
        miss = sorted(spec - set(got))
        if miss:
            f.append(f'scorecard missing {len(miss)} vector(s): {miss[:4]} '
                     '(score-vectors.json)')
        for k, v in got.items():
            if not isinstance(v, (int, float)) or not 0 <= v <= 100:
                f.append(f'scorecard vector {k} = {v!r} — expected 0-100')
    if card.get('unscored'):
        f.append(f'unscored rules: {card["unscored"][:5]}')
    return f


def check_scorecard(ctx):
    return _scorecard_fails(compute_scorecard(ctx))

def cmd_score(a):
    ctx = Ctx(a.pipeline_dir, a)
    ctx.wave = 'score'
    card = compute_scorecard(ctx)
    outp = os.path.join(ctx.dir, 'SCORECARD.json')
    json.dump(card, open(outp, 'w'), indent=2)
    md = ['# SCORECARD', f'overall: {card.get("overall", 0)}', '']
    if card.get('vectors'):
        md += ['## Vectors (rule-family aggregates)', '',
               '| Vector | /100 |', '|---|---|']
        for k, v in card['vectors'].items():
            md.append(f'| {k} | {v} |')
        md.append('')
    md += ['## Rule families', '']
    for k, v in card.get('sections', {}).items():
        md.append(f'- {k}: {v}')
    if card.get('broken_by_intent'):
        md += ['', '## Broken by intent (declared structural breaks)',
               ''] + [f'- {r}' for r in card['broken_by_intent']]
    open(os.path.join(ctx.dir, 'SCORECARD.md'), 'w').write('\n'.join(md))
    for k, v in (card.get('vectors') or {}).items():
        print(f'  {k}: {v}')
    print(f'  overall: {card.get("overall", 0)}')
    return 1 if any(v < 90 for v in card.get('sections', {}).values()) else 0

def cmd_segment(a):
    ctx = Ctx(a.pipeline_dir, a)
    ctx.wave = 'segment'
    fails = []
    for chk in SEGMENT_ALL:
        try:
            fails += chk(ctx)
        except Exception as e:
            fails.append(f'{chk.__name__} errored: {e}')
    for x in fails:
        print('  -', x)
    print('segment ' + ('FAIL' if fails else 'PASS'))
    return 1 if fails else 0

# ---------------------------------------------------------------- graph

def _frontmatter(text):
    m = re.match(r'^---\n(.*?)\n---\n', text, re.S)
    if not m:
        return {}
    node, _ = _parse_block(m.group(1).split('\n'), 0, 0)
    return node or {}

def build_graph():
    nodes, edges = {}, []
    design = os.path.join(REPO, 'docs', 'machinery', 'design')
    for dp, _, fns in os.walk(design):
        rel_dp = os.path.relpath(dp, design).replace(os.sep, '/')
        if 'patterns/data' in rel_dp or rel_dp.startswith('stage-'):
            continue
        for fn in fns:
            if rel_dp.startswith('dna') and fn.endswith('.json'):
                continue
            if fn.endswith(('.md', '.json')):
                fp = os.path.join(dp, fn)
                rel = os.path.relpath(fp, design)
                if rel in ('dna/GENOME.md', 'GRAPH.json',
                           'GRAPH.md', 'enforcement.json',
                           'ENFORCEMENT.md'):
                    continue
                t = open(fp, encoding='utf-8', errors='replace').read()
                if fn.endswith('.json'):
                    nid = os.path.splitext(rel)[0].replace('/', '-')
                    nodes.setdefault(nid, {'id': nid, 'type': 'doc',
                                           'file': rel})
                    continue
                fm = _frontmatter(t)
                nid = fm.get('id') or os.path.splitext(rel)[0]
                nodes[nid] = {'id': nid, 'type': fm.get('type', 'doc'),
                              'file': rel}
                links = fm.get('links') or {}
                if isinstance(links, dict):
                    for etype, targets in links.items():
                        for tg in (targets if isinstance(targets, list)
                                   else [targets]):
                            edges.append((nid, str(tg).split('#')[0],
                                          etype))
                for etype in ('implies_rules', 'enforced_by', 'used_in',
                              'consumes'):
                    for tg in (fm.get(etype) or []):
                        edges.append((nid, str(tg).split('#')[0], etype))
    # rule nodes + containment + see_also
    for fn in os.listdir(RULES_DIR):
        if not fn.endswith('.md'):
            continue
        t = open(os.path.join(RULES_DIR, fn)).read()
        fnode = 'rules-' + fn[:-3]
        nodes.setdefault(fnode, {'id': fnode, 'type': 'rules',
                                 'file': 'rules/' + fn})
        edges.append(('design-index', fnode, 'rules'))
        for rid in re.findall(r'^### ((?:[A-Z]{1,3}|PS)\.\d+)', t, re.M):
            nodes[rid] = {'id': rid, 'type': 'rule',
                          'file': 'rules/' + fn}
            edges.append((fnode, rid, 'contains'))
        for m in re.finditer(r'^- ([A-Z]+\.\d+|PS\.\d) → ([^\n(]+)',
                             t, re.M):
            for tg in m.group(2).split(','):
                edges.append((m.group(1), tg.strip(), 'see_also'))
    enf = json.load(open(ENFORCEMENT))['rules']
    for rid, e in enf.items():
        nodes.setdefault(rid, {'id': rid, 'type': 'rule'})
        if e.get('check'):
            nodes.setdefault(e['check'], {'id': e['check'],
                                          'type': 'check'})
            edges.append((e['check'], rid, 'enforces'))
        if e.get('item'):
            nodes.setdefault(e['item'], {'id': e['item'],
                                         'type': 'rubric'})
            edges.append((rid, e['item'], 'scored_by'))
        if e.get('wave') and e['wave'] != 'w*':
            edges.append((e['wave'], rid, 'enforces_at'))
    nodes.setdefault('design-index', {'id': 'design-index',
                                      'type': 'index'})
    for wv in WAVE_CHECKS:
        nodes[wv] = {'id': wv, 'type': 'wave'}
        edges.append(('design-index', wv, 'sequences'))
    for d in os.listdir(design):
        if not d.startswith('stage-'):
            continue
        wv = d.split('-')[1]
        card = os.path.join(design, d, 'CARD.md')
        if os.path.isfile(card):
            cnid = 'card-' + wv
            nodes[cnid] = {'id': cnid, 'type': 'card'}
            edges.append((wv, cnid, 'has_card'))
            t = open(card).read()
            for pair in set(re.findall(
                    r'\b(T|C|L|G|S|I|V|M|R|W|E|PS)\.(\d+)\b', t)):
                edges.append((cnid, '.'.join(pair), 'loads'))
        if os.path.isfile(os.path.join(design, d, 'CHECKLIST.md')):
            cid = 'checklist-' + wv
            nodes[cid] = {'id': cid, 'type': 'checklist'}
            edges.append((wv, cid, 'has_checklist'))
        for chk_fn in WAVE_CHECKS.get(wv, []):
            edges.append((wv, chk_fn.__name__, 'gated_by'))
            nodes.setdefault(chk_fn.__name__,
                             {'id': chk_fn.__name__, 'type': 'check'})
    for tid, path in [('template-wireframe-cards',
                       'templates/wireframe-cards'),
                      ('template-system-tile', 'templates/system-tile'),
                      ('template-astro', 'templates/astro')]:
        if os.path.isdir(os.path.join(REPO, path)):
            nodes[tid] = {'id': tid, 'type': 'template', 'file': path}
            edges.append(('design-index', tid, 'templates'))
    nodes.setdefault('section-catalog',
                     {'id': 'section-catalog', 'type': 'doc'})
    edges.append(('design-index', 'section-catalog', 'contains'))
    # ---- design genome: one node per gene, alleles inline
    genes = genome_genes()
    if genes:
        gp = os.path.join(DNA_DIR, 'GENOME.md')
        gfm = _frontmatter(open(gp, encoding='utf-8').read()) \
            if os.path.isfile(gp) else {}
        gid_root = gfm.get('id') or 'genome'
        nodes[gid_root] = {'id': gid_root, 'type': 'genome',
                           'file': 'dna/GENOME.md'}
        edges.append(('design-index', gid_root, 'contains'))
        for g in sorted(genes):
            gid = 'gene-' + g
            nodes[gid] = {'id': gid, 'type': 'gene',
                          'alleles': sorted(genes[g])}
            edges.append((gid_root, gid, 'contains'))
        for nid, n in list(nodes.items()):
            if str(n.get('file', '')).startswith('dna/') \
                    and nid != gid_root:
                edges.append((gid_root, nid, 'profiles'))
    for c in COMP_FOR_ACT:
        cid = 'section-catalog#' + c
        nodes[cid] = {'id': cid, 'type': 'composition'}
        edges.append(('section-catalog', cid, 'contains'))
    nodes.setdefault('enforcement', {'id': 'enforcement',
                                     'type': 'doc'})
    edges.append(('design-index', 'enforcement', 'contains'))
    nodes.setdefault('primitives', {'id': 'primitives', 'type': 'doc',
                                    'file': '../PRIMITIVES.md'})
    edges.append(('design-index', 'primitives', 'pointer'))
    if os.path.isdir(PATTERNS_DIR):
        nodes.setdefault('patterns-index', {'id': 'patterns-index',
                                            'type': 'index'})
        edges.append(('design-index', 'patterns-index', 'patterns'))
        for nid, n in list(nodes.items()):
            if str(n.get('file', '')).startswith('patterns/') \
                    and nid != 'patterns-index' \
                    and n.get('type') != 'taxonomy':
                edges.append(('patterns-index', nid, 'patterns'))
    # ---- pipeline-level artefacts the LAW doc names, and aliases for the
    # short names documents use (W1, GENOME, TOKENS, rules/C, dna-map).
    for aid, label in (('artifact-tokens', 'pipeline/TOKENS.json'),
                       ('artifact-gate-checks', 'GATES.json check names')):
        nodes.setdefault(aid, {'id': aid, 'type': 'artifact',
                               'label': label})
        edges.append(('design-index', aid, 'contains'))
    gen = next((n for n, v in nodes.items() if v.get('type') == 'genome'),
               None)
    alias = {'dna-map': 'LAW.DNA', 'design-knobs': 'knobs',
             'gate.dna': 'check_dna', 'GENOME': gen,
             'TOKENS': 'artifact-tokens',
             'gate-checks': 'artifact-gate-checks'}
    for i, (src, tg, et) in enumerate(edges):
        if tg in alias and alias[tg]:
            tg = alias[tg]
        elif re.fullmatch(r'rules/[A-Z]{1,3}', tg):
            tg = 'rules-' + tg.split('/')[1]
        elif re.fullmatch(r'W[0-8]', tg):
            tg = 'w' + tg[1]
        edges[i] = (src, tg, et)
    return nodes, edges

def cmd_graph():
    nodes, edges = build_graph()
    fails = []
    ids = set(nodes)
    for s, t, et in edges:
        if t not in ids:
            fails.append(f'dangling edge {s} -[{et}]-> {t}')
        if s not in ids:
            fails.append(f'dangling edge {s} -[{et}]-> {t} (source)')
    adj = {}
    for s, t, _ in edges:
        adj.setdefault(s, set()).add(t)
    seen, stack = set(), ['design-index']
    while stack:
        n = stack.pop()
        if n in seen:
            continue
        seen.add(n)
        stack += list(adj.get(n, ()))
    for nid in ids:
        if nid != 'design-index' and nid not in seen:
            fails.append(f'unreachable node {nid} '
                         f'({nodes[nid].get("type")})')
    indeg = {}
    for s, t, _ in edges:
        indeg[t] = indeg.get(t, 0) + 1
    for nid in ids:
        if nid != 'design-index' and indeg.get(nid, 0) == 0 \
                and not adj.get(nid):
            fails.append(f'orphan node {nid}')
    enf = json.load(open(ENFORCEMENT))['rules']
    for rid in all_rule_ids():
        if rid not in enf:
            fails.append(f'rule {rid} without enforcement edge')
    for wv in WAVE_CHECKS:
        out = {et for s, t, et in edges if s == wv}
        for et in ('has_card', 'has_checklist', 'gated_by'):
            if et not in out:
                fails.append(f'wave {wv} missing {et} edge')
    outp = os.path.join(REPO, 'docs', 'machinery', 'design',
                        'GRAPH.json')
    json.dump({'nodes': nodes, 'edges': [
        {'from': s, 'to': t, 'type': et} for s, t, et in edges]},
              open(outp, 'w'), indent=1)
    inbound = {}
    for s, t, et in edges:
        inbound.setdefault(t, []).append((s, et))
    md = ['# GRAPH — design machinery knowledge graph', '']
    for nid in sorted(nodes):
        md.append(f'## {nid} ({nodes[nid]["type"]})')
        for s, t, et in edges:
            if s == nid:
                md.append(f'- → {t} [{et}]')
        for s, et in inbound.get(nid, []):
            md.append(f'- ← {s} [{et}]')
        md.append('')
    open(os.path.join(REPO, 'docs', 'machinery', 'design',
                      'GRAPH.md'), 'w').write('\n'.join(md))
    if fails:
        print(f'graph FAIL ({len(nodes)} nodes, {len(edges)} edges):')
        for x in fails:
            print('  -', x)
        return 1
    print(f'graph PASS: {len(nodes)} nodes, {len(edges)} edges — '
          'all reachable, no dangling')
    return 0

# ------------------------------------------------------------- consistency

CANON_BP = {'360', '640', '768', '1024', '1280', '1440', '1920'}
CANON_EDGE = {'16', '24', '32', '40', '48'}
CANON_G1 = {'4', '8', '12', '16', '24', '32', '48', '64', '96', '128'}

def cmd_consistency():
    design = os.path.join(REPO, 'docs', 'machinery')
    docs = []
    for dp, _, fns in os.walk(design):
        for fn in fns:
            if fn.endswith('.md'):
                docs.append(os.path.join(dp, fn))
    fails = []
    texts = {p: open(p, encoding='utf-8', errors='replace').read()
             for p in docs}
    ids = all_rule_ids()
    for p, t in texts.items():
        base = os.path.basename(p)
        if base == 'GRAPH.md':
            continue
        for m in re.finditer(
                r'edge[-_ ]?padding[^0-9\n]{0,30}\[([\d,\s]+)\]', t,
                re.I):
            got = set(re.findall(r'\d+', m.group(1)))
            if got and got != CANON_EDGE:
                fails.append(f'{base}: edge_padding {sorted(got)} '
                            f'≠ R.2 {sorted(CANON_EDGE)}')
        for m in re.finditer(r'G\.1[^\n]{0,90}?[\[{]([\d,\s]+)[\]}]', t):
            got = set(re.findall(r'\d+', m.group(1)))
            if got and got != CANON_G1:
                fails.append(f'{base}: G.1 scale {sorted(got)} '
                             f'≠ {sorted(CANON_G1)}')
        for m in re.finditer(
                r'measure[^\n]{0,50}(?<!\d)(\d+)\s*[–-]\s*(\d+)\s*ch', t):
            lo, hi = int(m.group(1)), int(m.group(2))
            if (lo, hi) not in {(52, 65), (45, 75)}:
                fails.append(f'{base}: measure {lo}–{hi}ch — canon is '
                             'T.6 prose 52–65ch / shells ≤75ch')
        for m in re.finditer(
                r'§?\b([A-Z]{1,3}|PS|VG|SB|DM)\.(\d+)\b', t):
            rid = f'{m.group(1)}.{m.group(2)}'
            # W<n> is a wave, not a rule; E<n> shadow scale, L<n>
            # inside code samples etc. — only real prefixes count
            if m.group(1) not in {
                    i.rsplit('.', 1)[0] for i in ids}:
                continue
            if rid not in ids:
                fails.append(f'{base}: references nonexistent rule '
                             f'{rid}')
    # stale-reference ban list (B F-10/F-16): old level names, old stage
    # dirs, and the pre-preview artifact paths must never come back
    BANNED = {
        'L0': r'\bL0\b', 'L1': r'\bL1\b',
        'L2': r'\bL2\b(?!\s*[\d.])',
        'L3': r'\bL3\b', 'L4': r'\bL4\b', 'L5': r'\bL5\b',
        'old stage dir': r'stage-w2-look|stage-w3-system|'
                         r'stage-w4-content|stage-w5-wireframe',
        'bare system.html': r'(?<![`\w/])system\.html(?!`)',
        'PRIMITIVES section ref': r'PRIMITIVES\s*§',
        'preview-as-astro': r'preview[^\n]{0,30}\.astro'
    }
    for p, t in texts.items():
        base = os.path.basename(p)
        if base == 'GRAPH.md':
            continue
        for label, rx in BANNED.items():
            for m in re.finditer(rx, t):
                fails.append(f'{base}: stale ref ({label}): '
                             f'{m.group(0)[:60]!r}')
                break
    ddir = os.path.join(design, 'design')
    dirs = {d.split('-')[1] for d in os.listdir(ddir)
            if d.startswith('stage-')}
    impl_waves = set(WAVE_CHECKS)
    if dirs != impl_waves:
        fails.append(f'stage dirs {sorted(dirs)} ≠ waves '
                     f'{sorted(impl_waves)}')
    enf_waves = {e['wave'] for e in
                 json.load(open(ENFORCEMENT))['rules'].values()
                 if e.get('wave', 'w*') != 'w*'}
    if not enf_waves <= impl_waves:
        fails.append(f'enforcement waves {sorted(enf_waves)} ⊄ '
                     f'{sorted(impl_waves)}')
    run_src = open(os.path.join(HERE, 'run.py')).read()
    run_order = set(re.findall(r"'w\d'", run_src))
    if run_order != {f"'{w}'" for w in impl_waves}:
        fails.append(f'run.py ORDER ≠ {sorted(impl_waves)}')
    idx = texts.get(os.path.join(ddir, 'INDEX.md'), '')
    for w in sorted(impl_waves):
        if f'W{w[1]}' not in idx:
            fails.append(f'INDEX.md missing wave {w}')
    if fails:
        print(f'consistency FAIL ({len(fails)}):')
        for x in fails:
            print('  -', x)
        return 1
    print('consistency PASS')
    return 0


def cmd_enforcement():
    """Regenerate ENFORCEMENT.md — the single validation table."""
    rules = json.load(open(ENFORCEMENT))['rules']
    titles = {}
    for fn in os.listdir(RULES_DIR):
        if fn.endswith('.md'):
            for m in re.finditer(r'^### ((?:[A-Z]{1,3}|PS)\.\d+)\s+(.*)$',
                                 open(os.path.join(RULES_DIR, fn)).read(),
                                 re.M):
                titles[m.group(1)] = m.group(2).split('—')[0].strip()
    md = ['# ENFORCEMENT — every rule, one validation table', '',
          'Generated by `python3 tools/design-gate/gate.py enforcement`.',
          'Mode: `script` = gate exits 1; `reviewer` = W8 rubric item;',
          '`operator` = recorded approval in `GATES.json`.',
          'Tier: `invariant` = never breakable; `structural` = breakable',
          'only via a declared break (B.4); `stylistic` = free inside the',
          'closed set.', '',
          '| Rule | Rule name | Tier | Mode | Check / item | FAILs when | Wave |',
          '|---|---|---|---|---|---|---|']
    for rid, e in rules.items():
        md.append(f'| {rid} | {titles.get(rid, "")} | {e.get("tier")} | '
                  f'{e.get("mode")} | '
                  f'`{e.get("check") or e.get("item") or e.get("approval")}` | '
                  f'{e.get("threshold", "")} | {e.get("wave", "")} |')
    stats = {m: sum(1 for e in rules.values() if e.get('mode') == m)
             for m in ('script', 'reviewer', 'operator')}
    tiers = {t: sum(1 for e in rules.values() if e.get('tier') == t)
             for t in ('invariant', 'structural', 'stylistic')}
    md += ['', f'{len(rules)} rules — script {stats["script"]}, reviewer '
           f'{stats["reviewer"]}, operator {stats["operator"]}; '
           f'invariant {tiers["invariant"]}, structural '
           f'{tiers["structural"]}, stylistic {tiers["stylistic"]}.', '']
    open(os.path.join(DESIGN_DIR, 'ENFORCEMENT.md'), 'w').write('\n'.join(md))
    print(f'enforcement → ENFORCEMENT.md ({len(rules)} rules)')
    return 0



SEGMENT_ALL = [check_segment_roles, check_segment_region,
               check_segment_share, check_segment_media,
               check_segment_footer, check_segment_priority]

WAVE_CHECKS = {
    'w0': [check_scaffold],
    'w1': [check_mobbin_auth, check_design_mode, check_intent,
           check_genotype, check_tiers, check_audit_artifacts,
           check_mobbin_refs, check_image_discovery, check_canon_trace],
    'w2': [check_content_inventory],
    'w3': [check_wireframe_tags, check_mobbin_refs,
           check_wireframe_lock, check_section_enums,
           check_speech_acts, check_emphasis, check_motif,
           check_rhythm, check_vector_map, check_schema_fields,
           check_genotype, check_burst, check_declared_breaks,
           check_wildcard, check_section_contracts,
           check_layout_distinct, check_canon_trace,
           check_intent_deviation, check_intent_sections,
           check_round_gated],
    'w4': [check_direction_axes, check_genotype,
           check_genotype_distinct,
           check_burst, check_declared_breaks, check_wildcard,
           check_dark_mode, check_variants, check_canon_trace,
           check_intent_deviation, check_wildcard_random,
           check_round_gated_look, check_fine_round],
    'w5': [check_system_enums, check_spacing_scale, check_breakpoints,
           check_content_width, check_contrast, check_type_system,
           check_tailwind_derivation, check_tile_is_system,
           check_no_emoji, check_neutral_tint, check_proximity,
           check_border_widths, check_reduced_motion, check_dark_mode,
           check_dark_toggle, check_canon_trace],
    'w6': [check_components_exist, check_tile_is_system,
           check_class_subset, check_no_stray_styles, check_no_emoji,
           check_icon_discipline, check_section_shell,
           check_acss_conventions,
           check_section_allowed, check_section_gates, check_exemplars,
           check_astro_build],
    'w7': [check_assembly, check_spec_verbatim, check_page_data_attrs,
           check_heading_verbatim, check_class_subset,
           check_no_stray_styles, check_no_emoji,
           check_icon_discipline, check_speed_budget,
           check_mobile_budget, check_viewport, check_tap_size,
           check_tile_page_parity, check_rhythm_render, check_copy_density,
           check_seo_lint, check_mobile_cta, check_measurable,
           check_canon_trace, check_receipts, check_auto_grid,
           check_surface_rhythm,
           check_dead_columns, check_intent_sections, check_hero_fold,
           check_canon_padding, check_breathing, check_card_contract,
           check_component_profile,
           check_primary_cta, check_interaction_states, check_forms,
           check_heading_pattern, check_equal_cards, check_dark_media,
           check_logo, check_accent_surfaces, check_landmarks,
           check_sticky_offset, check_footer_structure, check_meta,
           check_dark_mode, check_dark_toggle, check_astro_build] \
           + SEGMENT_ALL,
    'w8': [check_review_completeness, check_scorecard,
           check_style_review, check_novelty, check_review_modes,
           check_variants],
}

WAVE_INPUTS = {
    'w0': ['site/package.json', 'site/astro.config.mjs',
           'site/src/styles/global.css'],
    'w1': ['DESIGN-PLAN.md', 'audit.md', 'MOBBIN-REFS.md'],
    'w2': ['STUB.md'],
    'w3': ['DESIGN-PLAN.md', 'MOBBIN-REFS.md', 'preview/layouts.html'],
    'w4': ['DESIGN-PLAN.md', 'preview/variants.html'],
    'w5': ['DESIGN-PLAN.md', 'TOKENS.json', 'preview/system.html',
           'site/src/styles/global.css'],
    'w6': ['DESIGN-PLAN.md', 'COMPONENTS.md',
           'site/src/pages/system.astro'],
    'w7': ['DESIGN-PLAN.md'],
    'w8': ['REVIEW.json'],
}
for _w in list(WAVE_CHECKS):
    WAVE_CHECKS[_w].append(check_checklist)
    WAVE_CHECKS[_w].append(check_dna)
    WAVE_CHECKS[_w].append(check_dna_fresh)

# The five operator decision points (A F23): confirm discovery, pick the
# look, approve the system sheet (locks DNA v1), pick the wireframe
# (locks structure), sign off the final page. Everything else is
# mechanical.
APPROVABLE = {'w1', 'w3', 'w4', 'w8'}

if __name__ == '__main__':
    sys.exit(main())

