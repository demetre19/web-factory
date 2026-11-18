#!/usr/bin/env python3
"""gate.py — the Web Factory design wave gates.

One mechanical gate per wave (W0–W7), mirroring the SEO SOP
stage_gate/article_gate contract: a wave is done when this exits 0,
not when its files exist. Writes/updates <pipeline-dir>/GATES.json
{wave, pass, failures[], inputs_sha256, approved}.

  python3 gate.py <wave> <pipeline-dir> [--wireframe <cards.html>]
                  [--design <id>] [--stub <stub.md>] [--approve]
  python3 gate.py coverage        # every rule ID has an enforcement
  python3 gate.py selftest        # every script check catches its fixture

Waves: w0 scaffold · w1 brief+audit · w2 direction · w3 system ·
w4 wireframe-lock · w5 components · w6 page · w7 review.

The designer model never runs this: QA is never self-graded (P.8).
Python 3 stdlib only.
"""
import argparse, hashlib, html.parser, json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..'))
import argparse, hashlib, html.parser, json, os, re, shutil, \
    subprocess, sys
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
    'form-panel': {'act'}, 'quote-grid': {'proof'},
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
    'density': {'sparse', 'balanced', 'dense'},
    'finish': {'flat', 'textured', 'glossy', 'raw'},
    'type_contrast': {'serif-display/sans-text', 'mono-accents',
                      'single-family-weight-contrast'},
    'shape': {'p1-sharp', 'p2-subtle', 'p3-friendly', 'p4-playful'},
    'motion': {'subtle', 'elegant', 'professional', 'playful'},
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
        return self.find('cards/index.html')

    def design_id(self):
        d = getattr(self.args, 'design', None)
        if d:
            return d
        if os.path.isfile(self.gates_path):
            try:
                g = json.load(open(self.gates_path))
                if g.get('w5', {}).get('design'):
                    return g['w5']['design']
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

    def stub_vector(self):
        """[(zone, heading, fs)] from the STUB's Heading vector table."""
        if self._stub_rows is not None:
            return self._stub_rows
        self._stub_rows = []
        p = self.stub_path()
        if not p or not os.path.isfile(p):
            return self._stub_rows
        txt = open(p, encoding='utf-8', errors='replace').read()
        m = re.search(r'## Heading vector\s*\n(.*?)\n## ', txt, re.S)
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
        """[(path, text)] built/emitted page html (dist first, preview/)."""
        out = []
        for root in (os.path.join(self.site, 'dist'),
                     os.path.join(self.dir, 'preview')):
            if os.path.isdir(root):
                for dp, _, fns in os.walk(root):
                    for fn in sorted(fns):
                        if fn == 'system.html':
                            continue
                        if fn.endswith('.html'):
                            p = os.path.join(dp, fn)
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
                if dim and dim.group(1) not in ICON_SIZES \
                        and 'viewBox' not in attrs:
                    f.append(f'P.11 {name}: svg size {dim.group(1)}px '
                             f'∉ I.3 set {sorted(ICON_SIZES)}')
            for m2 in re.finditer(r'stroke-width="([\d.]+)"', t):
                if float(m2.group(1)) not in {1.5, 2.0, 2.5, 3.0}:
                    f.append(f'P.11 {name}: stroke-width '
                             f'{m2.group(1)} ∉ I.2 {1.5,2,2.5,3}')
    return f

def check_mobbin_refs(ctx):
    f = []
    t = ctx.read('MOBBIN-REFS.md')
    if t is None:
        return ['P.14 MOBBIN-REFS.md missing — consult Mobbin '
                '(search_screens/search_sections) before direction '
                'cards; if the token is expired, re-auth per W1 entry '
                'check and record it — never silently skip']
    if not re.search(r'https?://|mobbin\.com/|screen[-_ ]?id', t, re.I):
        f.append('P.14 MOBBIN-REFS.md has no screen IDs/URLs')
    if ctx.wave == 'w5':
        comps = {str(r.get('composition')) for _, r in ctx.rows()
                 if r.get('composition')}
        low = t.lower()
        for c in sorted(comps):
            if c not in low:
                f.append(f'P.14 no Mobbin reference cited for '
                         f'composition "{c}"')
    return f

def check_content_inventory(ctx):
    """W4 content-in: STUB copy contract exists with a heading vector."""
    p = ctx.stub_path()
    if not p or not os.path.isfile(p):
        return ['W4: STUB copy contract not found — content decides '
                'structure, so the vector must exist first '
                f'({ctx.stub_path() or "pass --stub"})']
    vec = ctx.stub_vector()
    if not vec:
        return ['W4: STUB has no Heading vector table — content '
                'inventory incomplete']
    return []

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
    g = ctx.read('site/src/styles/global.css') or ''
    if '@font-face' in g and 'font-display' not in g:
        f.append('P.12 @font-face without font-display: swap')
    # Lighthouse is NOT a gate: it is an operator post-build check run by
    # hand against the deployed site. The gate holds the static budgets
    # above (JS weight, image dims/format/hints, fonts, third parties).
    return f

def check_mobile_budget(ctx):
    f = []
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
    cards = re.findall(r'<div class="card"[^>]*id="(d\d+)"', txt)
    if len(cards) < 2:
        return ['W2: fewer than 2 direction cards in wireframe file']
    f = []
    sec_sets = {}
    for m in re.finditer(r'<div class="card"[^>]*id="(d\d+)"[^>]*>(.*?)(?=<div class="card"|\Z)',
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
    if sets and any(s != sets[0] for s in sets[1:]):
        f.append('W2: card data-sec lists differ across designs '
                 '(same sections, different compositions only)')
    did = ctx.design_id()
    if did and sec_sets and did not in sec_sets:
        f.append(f'W2: --design {did} not a card in the wireframe '
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
    if ic.get('family') and str(ic['family']) not in \
            {'lucide', 'heroicons', 'phosphor', 'feather', 'custom'}:
        f.append(f'icons.family "{ic["family"]}" ∉ I.1 set')
    if ic.get('style') and str(ic['style']) not in \
            {'outline', 'solid', 'duotone', 'hand-drawn', '3d-hero-only'}:
        f.append(f'icons.style "{ic["style"]}" ∉ I.1 set')
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
    sc = ((_system(ctx).get('space') or {}).get('scale')) or []
    nums = [int(x) for x in sc if str(x).strip().isdigit()] \
        if isinstance(sc, list) else []
    if not nums:
        return ['system.space.scale missing']
    bad = [n for n in nums if n not in G1]
    if bad:
        f.append(f'space.scale values {bad} ∉ G.1 {sorted(G1)}')
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

def check_content_width(ctx):
    cw = str((_system(ctx).get('grid') or {}).get('content_width') or '')
    m = re.match(r'([\d.]+)\s*(rem|px)', cw)
    if not m:
        return ['grid.content_width missing/unparseable']
    px = float(m.group(1)) * (16 if m.group(2) == 'rem' else 1)
    if px > 1440:
        return [f'content_width {cw} > L.11 1440px ceiling']
    return []

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
    f = []
    tile = ctx.read('site/src/pages/system.astro')
    if tile is None:
        if ctx.read('preview/system.html'):
            f.append('P.1 preview/system.html is standalone HTML — '
                     'tile must be site/src/pages/system.astro')
        else:
            f.append('P.1 system tile missing (src/pages/system.astro)')
        return f
    comp_names = {os.path.splitext(c)[0] for c in ctx.components()} - {'Section'}
    # map import alias -> component file, then require real <Alias /> usage
    alias = dict((a, c) for a, c in re.findall(
        r'import\s+(\w+)\s+from\s+["\'].*components/([\w-]+)\.astro', tile))
    rendered = set(re.findall(r'<([A-Z]\w*)\b', tile))
    used = {alias[a] for a in rendered if a in alias}
    used |= {c for c in comp_names
             if re.search(rf'<{c.replace("-", "")}\b', tile, re.I)}
    for c in sorted(comp_names):
        if c not in used:
            f.append(f'P.6 component {c} not instantiated on system tile')
    return f

def _wireframe_secs(ctx):
    wfp = ctx.wireframe_path()
    if not wfp or not os.path.isfile(wfp):
        return None, f'wireframe file not found ({wfp})'
    txt = open(wfp, encoding='utf-8', errors='replace').read()
    did = ctx.design_id() or 'd1'
    m = re.search(rf'<div class="card"[^>]*id="{did}"[^>]*>(.*?)(?=<div class="card"|\Z)',
                  txt, re.S)
    if not m:
        return None, f'design card {did} not in wireframe'
    secs = re.findall(
        r'<(?:section|nav)[^>]*data-sec="([^"]+)"[^>]*data-comp="([^"]+)"[^>]*'
        r'data-ratio="([^"]+)"[^>]*data-disclosure="([^"]+)"',
        m.group(1))
    return [{'sec': s, 'comp': c, 'ratio': r, 'disc': d}
            for s, c, r, d in secs], None

def check_wireframe_lock(ctx):
    secs, err = _wireframe_secs(ctx)
    if err:
        return [f'P.4 {err}']
    if not secs:
        return ['P.4 chosen card carries no data-* sections — card '
                'cannot be locked (P.3)']
    f = []
    rows = ctx.rows()
    if not rows:
        return ['P.4 plan has no pages.<slug>.sections[] rows']
    plan_rows = [r for _, r in rows]
    for i, r in enumerate(plan_rows):
        if not r.get('wf_ref'):
            f.append(f'P.4 row {i} ({r.get("name","?")}) missing wf_ref')
    wf_names = [s['sec'] for s in secs]
    row_names = [str(r.get('name') or '') for r in plan_rows]
    # tolerate nav/footer as row names matching data-sec slugs
    if row_names != wf_names:
        f.append(f'P.4 row order {row_names} != wireframe {wf_names}')
    else:
        for s, r in zip(secs, plan_rows):
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
        inv = sum(1 for r in rows if str(r.get('surface')) in
                  ('inverse', 'brand'))
        if inv < 1:
            f.append(f'{slug}: no contrast moment (inverse/brand '
                     'surface) — ≥1 required per page')
        if inv > 3:
            f.append(f'{slug}: {inv} inverse/brand surfaces > §4 '
                     'budget (2 + footer)')
        comps = [str(r.get('composition')) for r in interior]
        run = 1
        for i in range(1, len(comps)):
            run = run + 1 if comps[i] == comps[i-1] else 1
            if run > 2 and not interior[i].get('organism'):
                f.append(f'{slug}: >2 consecutive "{comps[i]}" '
                         f'sections at row {i} (organism undeclared)')
        dens = [str(r.get('density')) for r in interior]
        if dens:
            changes = sum(1 for i in range(1, len(dens))
                          if dens[i] != dens[i-1])
            if len(dens) >= 3 and changes == 0:
                f.append(f'{slug}: uniform density — no S-M-L step '
                         '(L.7)')
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
    # emitted html (non-astro pipeline artifacts)
    for p, txt in ctx.page_htmls():
        if '/site/' in p:
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
    f = []
    pages = ctx.page_htmls()
    if not pages:
        return ['P.7 no built page found (dist/ or preview/ html)']
    plan_rows = ctx.rows()
    for p, txt in pages:
        parsed = parse_html(txt)
        got = [(s.get('data-sec'), s.get('data-comp'),
                s.get('data-ratio'), s.get('data-disclosure'))
               for s in parsed.sections]
        if not any(g[0] for g in got):
            f.append(f'P.3 {os.path.basename(p)}: no section carries '
                     'data-sec — wireframe lock unverifiable')
            continue
        if len(got) != len(plan_rows):
            f.append(f'P.7 {os.path.basename(p)}: {len(got)} page '
                     f'sections vs {len(plan_rows)} plan rows')
        for i, (g, (_, r)) in enumerate(zip(got, plan_rows)):
            if g[0] != str(r.get('name')):
                f.append(f'P.7 {os.path.basename(p)} sec {i}: data-sec '
                         f'"{g[0]}" != plan row "{r.get("name")}"')
            if g[1] and g[1] != str(r.get('composition')):
                f.append(f'P.7 {os.path.basename(p)} sec {i}: data-comp '
                         f'"{g[1]}" != plan "{r.get("composition")}"')
            if g[3] and g[3] != str(r.get('disclosure')):
                f.append(f'P.7 {os.path.basename(p)} sec {i}: '
                         f'data-disclosure "{g[3]}" != plan '
                         f'"{r.get("disclosure")}"')
    return f

def check_heading_verbatim(ctx):
    vec = ctx.stub_vector()
    if not vec:
        return []
    f = []
    pages = ctx.page_htmls()
    if not pages:
        return ['E.1 no page html to check vector against']
    for p, txt in pages:
        parsed = parse_html(txt)
        heads = [h[1] for h in parsed.headings]
        heads_n = [re.sub(r'[?.]+$', '', h).strip() for h in heads]
        for v in vec:
            want = re.sub(r'[?.]+$', '', v['heading']).strip()
            if v['tag'] == 'h2' or v['tag'] == 'h1':
                if want and want not in heads_n:
                    f.append(f'E.1 {os.path.basename(p)}: vector '
                             f'heading not rendered verbatim: "{want}"')
            if v['fs']:
                fsn = ' '.join(v['fs'].split())
                if fsn.rstrip('.!?') not in ' '.join(txt.split()):
                    f.append(f'E.1 {os.path.basename(p)}: first sentence '
                             f'not verbatim for "{v["heading"][:40]}"')
    return f

def check_viewport(ctx):
    f = []
    for p, txt in ctx.page_htmls():
        if 'name="viewport"' not in txt and "name='viewport'" not in txt:
            f.append(f'R.1 {os.path.basename(p)}: no viewport meta')
    return f

def check_tap_size(ctx):
    f = []
    for p, txt in ctx.page_htmls():
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
    if not os.path.isdir(os.path.join(ctx.dir, 'shots')):
        f.append('shots/ dir missing (1280/768/360 evidence)')
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
OUTER_SPACING = re.compile(
    r'^(?:m[trblxy]?|p[trblxy]?|bg|max-w|mx-auto)')
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
    dh = dna_hash_of(dmap) if dmap else ''
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
            'dna': {
                'profile': dmap.get('profile'),
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
                'classes': layer,
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
        txt = open(p, encoding='utf-8', errors='replace').read()
        if '<section' in txt or '</section>' in txt:
            f.append(f'SB.2 {fn}: renders its own <section> — the Section '
                     'shell owns the band')
        if '<style' in txt:
            f.append(f'SB.2 {fn}: <style> block — styles live in the '
                     'shared layer')
        body = re.sub(r'^---.*?---', '', txt, flags=re.S)
        root = re.search(r'<(\w[\w-]*)([^>]*)>', body)
        if root:
            cls = re.search(r'class="([^"]*)"', root.group(2) or '')
            for c in (cls.group(1).split() if cls else []):
                base = c.split(':')[-1]
                if base in OUTER_EXACT or OUTER_SPACING.match(base):
                    f.append(f'SB.2 {fn}: root sets outer layout '
                             f'"{c}" — padding/background/width belong to '
                             'Section.astro')
        if 'exemplar:' not in txt:
            f.append(f'SB.2 {fn}: no exemplar: frontmatter — adapt the '
                     'gold exemplar (SB.5)')
    return f


def check_section_allowed(ctx):
    """SB.3 — only contract classes/token utilities; no literals."""
    f = []
    for fn, p in (_section_files(ctx) if _wave_ge(ctx, 'w6') else []):
        txt = open(p, encoding='utf-8', errors='replace').read()
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
        if not g.get('pass'):
            f.append(f'SB.3 {os.path.basename(p)}: pass=false — '
                     f'{(g.get("failures") or ["?"])[0]}')
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


def assemble_page(ctx):
    """SB.4 — deterministic page source from plan order."""
    contracts = build_contracts(ctx)
    path, slug = page_path(ctx)
    imports = ["import Section from '../../components/Section.astro';"]
    for c in contracts:
        imports.append(f"import {camel(c['section'])} from "
                       f"'../../components/sections/{camel(c['section'])}.astro';")
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
    """SB.4 — the page file is exactly what assemble.py generates."""
    path, txt, h = assemble_page(ctx)
    if not os.path.isfile(path):
        return [f'SB.4 {os.path.relpath(path, ctx.dir)} missing — run '
                'assemble.py']
    got = open(path, encoding='utf-8', errors='replace').read()
    f = []
    if f'assembled: {h}' not in got:
        f.append(f'SB.4 assembled marker stale — contracts changed after '
                 'the last assemble.py run (never hand-edit the page)')
    norm = lambda s: '\n'.join(x.rstrip() for x in s.strip().split('\n'))
    if norm(got) != norm(txt):
        f.append('SB.4 page source differs from assemble.py output — '
                 'regenerate the glue')
    for c in build_contracts(ctx):
        if f'<{camel(c["section"])} />' not in got:
            f.append(f'SB.4 section component {camel(c["section"])} not '
                     'rendered in plan order')
    return f


def section_failures(ctx, contract):
    """Per-section gate: everything checkable without the page."""
    f = []
    name = contract['section']
    fn = camel(name) + '.astro'
    p = os.path.join(ctx.site, 'src', 'components', 'sections', fn)
    if not os.path.isfile(p):
        return [f'SB.3 {fn} missing']
    txt = open(p, encoding='utf-8', errors='replace').read()
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


def dna_hash_of(m):
    """sha256 of the canonical JSON minus the `hash` field."""
    if not m:
        return ''
    body = {k: v for k, v in m.items() if k != 'hash'}
    return hashlib.sha256(json.dumps(body, sort_keys=True)
                          .encode()).hexdigest()[:16]


def dna_hash(ctx):
    return dna_hash_of(dna_map(ctx))


def _knob_ok(knob, value, knobs):
    spec = knobs.get(knob)
    if not spec:
        return False, f'"{knob}" not in knobs.json'
    kind = spec.get('kind', 'number')
    if kind == 'enum':
        if str(value) not in [str(x) for x in spec.get('allowed') or []]:
            return False, (f'"{knob}" {value!r} not in '
                           f'{spec.get("allowed")}')
        return True, ''
    if kind == 'map':
        if not isinstance(value, dict):
            return False, f'"{knob}" must be a per-tier map'
        per = spec.get('per') or {}
        step = float(spec.get('step') or 0)
        for tier, v in value.items():
            if tier not in per:
                return False, f'"{knob}" unknown tier "{tier}"'
            lo, hi = per[tier]
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
    variants start at W2, so those parts are only required from then on.
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
                'knobs', 'modes', 'provenance', 'vector_targets']
    if _wave_ge(ctx, 'w2'):
        required.append('variants')
    if _wave_ge(ctx, 'w5'):
        required.append('rhythm')
    for field in required:
        if m.get(field) in (None, '', [], {}):
            f.append(f'DM.1 DNA.json: "{field}" missing or empty')
    if m.get('hash') != dna_hash_of(m):
        f.append('DM.1 DNA.json: hash field is stale — the map was edited '
                 'without re-hashing (locked maps bump version + hash)')
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
            if not isinstance(v, (int, float)) or not 0 <= v <= 1:
                f.append(f'DM.1 vector_targets.{k} = {v!r} — expected '
                         '0.0-1.0')
    ver = m.get('version')
    wave = getattr(ctx, 'wave', None)
    if wave not in ('w0', 'w1', 'selftest', None) and \
            isinstance(ver, int) and ver < 1:
        f.append(f'DM.1 DNA map still v{ver} — it locks to v1 at W3 exit')
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
    """Condition 2 — artifacts and recorded gates carry the current hash."""
    f = []
    if getattr(ctx, 'wave', None) == 'w0':
        return f
    h = dna_hash(ctx)
    if not h:
        return ['DM.1 DNA.json missing']
    cd = contracts_dir(ctx)
    if os.path.isdir(cd) and _wave_ge(ctx, 'w5'):
        for fn in sorted(os.listdir(cd)):
            if not fn.endswith('.contract.json'):
                continue
            try:
                c = json.load(open(os.path.join(cd, fn)))
            except Exception:
                continue
            if c.get('dna_hash') != h:
                f.append(f'DM.2 {fn}: dna_hash {c.get("dna_hash")!r} != '
                         f'{h} — built against a different map')
    for fn, p in (_section_files(ctx) if _wave_ge(ctx, 'w6') else []):
        txt = open(p, encoding='utf-8', errors='replace').read()
        mm = re.search(r'^dna_hash:\s*(\S+)', txt, re.M)
        if not mm:
            f.append(f'DM.2 {fn}: no dna_hash: frontmatter — builders echo '
                     'the map hash they built against')
        elif mm.group(1) != h:
            f.append(f'DM.2 {fn}: dna_hash {mm.group(1)} != {h} — rebuild '
                     'this section against the current map')
    if os.path.isfile(ctx.gates_path):
        try:
            g = json.load(open(ctx.gates_path))
        except Exception:
            g = {}
        for w, e in sorted(g.items()):
            rec = (e or {}).get('dna')
            if rec and rec != h:
                f.append(f'DM.6 GATES.json {w} recorded dna {rec} != {h} — '
                         'a changed map invalidates every downstream wave '
                         '(run.py rebuilds from that wave)')
    return f


def render_dna_md(m):
    h = dna_hash_of(m)
    lines = ['# DNA map — the single source of coherence', '',
             f'`hash: {h}` · version `{m.get("version")}` · site '
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
    print(f'dna PASS — hash {dna_hash(ctx)}; DNA.md rendered')
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
    """VG.1–VG.6 + LAW.DNA conditions 4 and 5."""
    f = []
    path = os.path.join(ctx.site, 'src', 'pages', 'variants.astro')
    if not os.path.isfile(path):
        return ['VG.1 src/pages/variants.astro missing — run '
                'assemble.py --variants']
    txt = open(path, encoding='utf-8', errors='replace').read()
    shown = re.findall(r'data-variant="([^"]+)"', txt)
    if not 3 <= len(shown) <= 5:
        f.append(f'VG.1 {len(shown)} variants rendered — 3 default, 5 max')
    for need in ('variant', 'viewport', 'mode'):
        if f'data-switch="{need}"' not in txt:
            f.append(f'VG.4 switcher missing data-switch="{need}"')
    css = ctx.read('site/src/styles/global.css') or ''
    if 'sticky' not in txt + css:
        f.append('VG.4 switcher is not sticky')
    css = ctx.read('site/src/styles/global.css') or ''
    if not any(t in txt + css for t in ('@container', 'cqw', 'container-type')):
        f.append('VG.4 frames not container-query driven — 1:1 viewports, '
                 'not a scaled desktop')
    for pane in ('system', 'page'):
        if f'data-pane="{pane}"' not in txt:
            f.append(f'VG.1 no data-pane="{pane}" — every variant shows its '
                     'system sheet AND its page (sheet first)')
    entries = _variants(ctx)
    if not entries:
        return f + ['VG.3 no variant records — DNA.json variants missing']
    knobs = knob_set()
    m = dna_map(ctx) or {}
    dh = dna_hash_of(m) if m else ''
    base = m.get('knobs') or {}
    passing, wild = set(), []
    for e in entries:
        vid = e.get('id')
        if not e.get('pass'):
            f.append(f'VG.3 variant {vid} fails a gate — remove it from the '
                     'picker, never show it greyed')
        else:
            passing.add(str(vid))
        if e.get('vector') not in VARIANT_VECTORS:
            f.append(f'VG.2 variant {vid}: vector "{e.get("vector")}" not in '
                     f'{sorted(VARIANT_VECTORS)}')
        if e.get('vector') == 'wildcard':
            wild.append(e)
        sheet = e.get('sheet_pass') or {}
        for mode in ('light', 'dark'):
            if sheet.get(mode) is not True:
                f.append(f'VG.1 variant {vid}: system sheet not gated in '
                         f'{mode} mode — sheet first, both modes '
                         '(condition 5)')
        if dh and e.get('dna_hash') and e['dna_hash'] != dh:
            f.append(f'DM.2 variant {vid}: dna_hash {e["dna_hash"]} != {dh}')
        f.extend(_deltas_ok(base, e.get('deltas') or {}, knobs,
                            e.get('vector') == 'wildcard'))
        if not (e.get('deltas') or {}) and not e.get('baseline'):
            f.append(f'VG.2 variant {vid}: no deltas — a variant is a knob '
                     'vector, not a mood (mark the baseline one baseline: '
                     'true)')
        if e.get('score') is None:
            f.append(f'VG.6 variant {vid}: no predicted score on the tile')
    for sid in shown:
        if sid not in passing:
            f.append(f'VG.3 rendered variant "{sid}" is not a passing '
                     'variant')
    burst = 0
    mm = re.search(r'^burst:\s*(\d)', ctx.plan_text, re.M)
    if mm:
        burst = int(mm.group(1))
    if burst > 0 and len(wild) != 1:
        f.append(f'VG.5 burst={burst} needs exactly one wildcard variant, '
                 f'found {len(wild)}')
    if burst == 0 and wild:
        f.append('VG.5 burst=0 but a variant claims the wildcard')
    for w in wild:
        if not w.get('wildcard_breaks'):
            f.append('VG.5 wildcard variant carries no declared breaks '
                     '(B.4 record required)')
    return f


def assemble_variants(ctx):
    """VG.1 — deterministic picker: system sheet + page per knob vector."""
    entries = [e for e in _variants(ctx) if e.get('pass')][:5]
    contracts = build_contracts(ctx)
    m = dna_map(ctx) or {}
    base = m.get('knobs') or {}
    modes = m.get('modes') or {}
    imports = ["import Section from '../../components/Section.astro';"]
    seen = set()
    for c in contracts:
        n = camel(c['section'])
        if n in seen:
            continue
        seen.add(n)
        imports.append(f"import {n} from "
                       f"'../../components/sections/{n}.astro';")
    h = hashlib.sha256(json.dumps([entries, base], sort_keys=True)
                       .encode()).hexdigest()[:12]

    def sheet(kn):
        rows = []
        lm, dm = modes.get('light') or {}, modes.get('dark') or {}
        for role in sorted(set(lm) | set(dm)):
            lv, dv = lm.get(role, ''), dm.get(role, '')
            r = contrast(lv, dv) if str(lv).startswith('#') and \
                str(dv).startswith('#') else None
            rows.append(
                f'<tr><td><code>{role}</code></td>'
                f'<td class="swatch swatch-{role}">--color-{role}</td>'
                f'<td class="swatch swatch-{role}">--color-{role} (dark)</td>'
                f'<td>{f"{r:.1f}:1" if r else "—"}</td></tr>')
        kn_txt = ', '.join(f'{k} {base.get(k)}→{v}'
                           for k, v in sorted((kn or {}).items()))
        return ('<table class="sheet-roles"><caption>Colour roles — light / '
                'dark / contrast</caption>' + ''.join(rows) + '</table>'
                f'<p class="sheet-type">type.ratio '
                f'{knobs_val(kn, base, "type.ratio")} · display '
                f'{knobs_val(kn, base, "type.display_weight")}</p>'
                f'<p class="sheet-space">section padding '
                f'{json.dumps(knobs_val(kn, base, "space.section_py"))} · '
                f'gutter {knobs_val(kn, base, "grid.gutter")}</p>'
                f'<p class="sheet-shape">radius '
                f'{knobs_val(kn, base, "radius.personality")} · elevation '
                f'{knobs_val(kn, base, "elevation.level")}</p>'
                '<p class="sheet-controls"><button class="btn-primary">'
                'Button</button><input class="rounded-card border '
                'border-muted" placeholder="Field" /><span class="rounded-card '
                'border border-muted">Card</span></p>'
                f'<p class="sheet-knobs" data-knobs="{kn_txt}">'
                f'{kn_txt or "baseline — no knob diff"}</p>')

    tiles = []
    for e in entries:
        vid = e['id']
        deltas = e.get('deltas') or {}
        page = '\n'.join(
            f'        <Section sec="{c["section"]}" '
            f'comp="{c["composition"]}" wf-ref="{c["wf_ref"]}" '
            f'ratio="{c["media_ratio"]}" disclosure="{c["disclosure"]}" '
            f'surface="{c["surface"]}" density="{c["density"]}">\n'
            f'          <{camel(c["section"])} />\n        </Section>'
            for c in contracts)
        breaks = ', '.join(e.get('wildcard_breaks') or []) or 'none'
        diff = ', '.join(f'{k} {base.get(k)}→{v}'
                         for k, v in sorted(deltas.items())) or 'baseline'
        tiles.append(
            f'  <article class="variant-frame" data-variant="{vid}" '
            f'data-vector="{e.get("vector")}" data-score="{e.get("score")}" '
            f'data-breaks="{breaks}" data-dna="{e.get("dna_hash", "")}" '
            f'data-knobs="{diff}">\n'
            f'    <header class="variant-label">{vid} · {e.get("vector")} · '
            f'score {e.get("score")} · {diff} · breaks: {breaks}</header>\n'
            f'    <nav class="variant-tabs"><button data-tab="system">System'
            f'</button><button data-tab="page">Page</button></nav>\n'
            f'    <div class="variant-panes">\n'
            f'      <div data-pane="system" class="variant-stage" '
            f'data-variant-scope="{vid}">{sheet(deltas)}</div>\n'
            f'      <div data-pane="page" class="variant-stage" '
            f'data-variant-scope="{vid}">\n{page}\n      </div>\n'
            f'    </div>\n  </article>')
    txt = f'''---
// assembled: {h} — generated by assemble.py --variants; never edit
{chr(10).join(imports)}
---
<html lang="en" data-theme="light">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <script is:inline>
    (function () {{
      var saved = localStorage.getItem('theme');
      var mode = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.dataset.theme = mode;
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
    return os.path.join(ctx.site, 'src', 'pages', 'variants.astro'), txt, h


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

def run_wave(ctx):
    fails = []
    if not os.path.isfile(os.path.join(ctx.dir, 'DESIGN-PLAN.md')) \
            and ctx.wave != 'w0':
        fails.append('DESIGN-PLAN.md missing')
    for chk in WAVE_CHECKS[ctx.wave]:
        try:
            fails += chk(ctx)
        except Exception as e:
            fails.append(f'{chk.__name__} errored: {e}')
    fails += checklist_blank_fails(ctx, ctx.wave)
    return _apply_declared_breaks(ctx, fails)

def _apply_declared_breaks(ctx, fails):
    """B.5 — a declared break of a structural rule is skipped, not failed.
    Invariant and undeclared violations stay failures."""
    skipped = skipped_rules(ctx)
    if not skipped:
        return fails
    kept = []
    for msg in fails:
        rid = _rule_of(msg)
        if rid in skipped:
            continue
        kept.append(msg)
    return kept

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
    entry.update({
        'pass': not fails,
        'failures': fails,
        'inputs_sha256': input_hashes(ctx),
        'dna': dna_hash(ctx) or None,
        'ts': __import__('datetime').datetime.now().isoformat(
            timespec='seconds'),
    })
    if ctx.wave in ('w2', 'w5') and getattr(ctx.args, 'design', None):
        entry['design'] = ctx.design_id()
    if approve:
        entry['approved'] = True
    elif 'approved' not in entry:
        entry['approved'] = False
    if fails:
        entry['approved'] = False
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
        for m in re.finditer(r'`((?:[A-Z]{1,2}|PS)\.\d+)`\s*'
                             r'(?:/\s*`(?:[A-Z]{1,2}|PS)\.\d+`\s*)*'
                             r'([A-Za-z][\w-]*)', line):
            for rid in re.findall(r'`((?:[A-Z]{1,2}|PS)\.\d+)`',
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
    """The look-up CLIs must answer for every rule the gates enforce."""
    import subprocess
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
        md = os.path.join(tmp, 'p', 'DNA.md')
        if not os.path.isfile(md):
            f.append('gate.py dna renders no DNA.md')
        else:
            txt = open(md, encoding='utf-8').read()
            for want in ('hash:', '## Genotype', '## System knobs',
                         '## Modes (both ship', '## Variants'):
                if want not in txt:
                    f.append(f'DNA.md missing section "{want}"')
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    # DM.6 — run.py refuses and resets when the map hash changed
    tmp = tempfile.mkdtemp()
    try:
        pdir = os.path.join(tmp, 'p')
        shutil.copytree(os.path.join(HERE, 'fixtures', '_base'), pdir,
                        symlinks=True)
        c1 = Ctx(pdir)
        c1.wave = 'w1'
        with open(os.path.join(pdir, 'GATES.json'), 'w') as fh:
            json.dump({'w0': {'pass': True, 'approved': True,
                              'dna': None},
                       'w1': {'pass': True, 'approved': True,
                              'inputs_sha256': input_hashes(c1),
                              'dna': 'deadbeef'}}, fh)
        r = subprocess.run([sys.executable, os.path.join(HERE, 'run.py'),
                            'w2', pdir], capture_output=True, text=True)
        if r.returncode == 0 or 'DNA map changed' not in r.stdout:
            f.append('run.py does not refuse a wave after the DNA map '
                     f'changed: {r.stdout.strip()[:120]}')
        g = json.load(open(os.path.join(pdir, 'GATES.json')))
        if g.get('w1', {}).get('pass') is not False:
            f.append('run.py did not reset downstream gates on a DNA change')
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    return f


def cmd_selftest():
    fx = os.path.join(HERE, 'fixtures')
    checks = {c.__name__: c for lst in WAVE_CHECKS.values()
              for c in lst}
    fails, ran = [], 0
    for name in sorted(os.listdir(fx)) if os.path.isdir(fx) else []:
        d = os.path.join(fx, name)
        if not os.path.isdir(d) or name not in checks:
            continue
        for want, sub in ((0, 'pass'), (1, 'fail')):
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
    missing = set(checks) - set(tested) - {'check_audit_artifacts',
            'check_astro_build', 'check_review_completeness',
            'check_tailwind_derivation', 'check_tile_is_system',
            'check_components_exist', 'check_spec_verbatim',
            'check_class_subset', 'check_no_stray_styles',
            'check_page_data_attrs', 'check_heading_verbatim',
            'check_tap_size', 'check_scaffold', 'check_design_mode',
            'check_intent', 'check_checklist', 'check_mobbin_auth',
            'check_novelty', 'check_scorecard', 'check_tiers'}
    for n in sorted(missing):
        fails.append(f'no fixtures for {n}')
    if fails:
        print(f'selftest FAIL ({ran} fixture runs):')
        for x in fails:
            print('  -', x)
        return 1
    print(f'selftest PASS: {ran} fixture runs across '
          f'{len(tested)} checks')
    return 0

# ---------------------------------------------------------------- main

# ---------------------------------------------------------------- wave tables

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('wave', choices=list(WAVE_CHECKS) +
                    ['coverage', 'selftest', 'consistency', 'graph',
                     'score', 'segment', 'wildcard', 'enforcement',
                     'contracts', 'section', 'dna'])
    ap.add_argument('pipeline_dir', nargs='?', default='.')
    ap.add_argument('--wireframe')
    ap.add_argument('--design')
    ap.add_argument('--stub')
    ap.add_argument('--approve', action='store_true')
    ap.add_argument('--sec', help='section name for `gate.py section`')
    a = ap.parse_args()
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
    if a.approve and not fails:
        print(f'  approved: true')
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
    """D.3 — W2 options block lists ≥2 distinct genotype vectors."""
    txt = ctx.plan_text
    m = re.search(r'^options:\s*\n((?:\s*-\s.*\n)+)', txt, re.M)
    vectors = []
    if m:
        for chunk in re.split(r'^\s*-\s', m.group(1), flags=re.M):
            pairs = dict(re.findall(
                r'([a-z][a-z0-9-]*):\s*([a-z][\w./-]*)', chunk))
            for meta in ('name', 'wildcard', 'profile', 'mutates'):
                pairs.pop(meta, None)
            if pairs:
                vectors.append(tuple(sorted(pairs.items())))
    vectors = list(dict.fromkeys(vectors))
    if len(vectors) < 2:
        return [f'D.3 W2 options: {len(vectors)} distinct genotype '
                'vector(s) — need ≥2']
    return []

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
    """Rule IDs skipped for the chosen option (declared structural breaks)."""
    rules = _enforcement_rules()
    out = set()
    for b in declared_breaks(ctx.plan or {}):
        rid = str(b.get('rule_id') or b.get('rule') or '')
        if rules.get(rid, {}).get('tier') == 'structural':
            out.add(rid)
    return out

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

def check_wildcard(ctx, waves=('w2', 'w5')):
    """B.* aggregate — the burst gate. Runs inside W2/W5 and as
    `gate.py wildcard`: declared breaks are the ONLY tolerated
    violations; everything else must be at 100%."""
    f = []
    f += check_tiers(ctx)
    f += check_burst(ctx)
    f += check_declared_breaks(ctx)
    skipped = skipped_rules(ctx)
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
                rid = _rule_of(msg)
                if rid and rid in skipped:
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
            scores[rid] = 1.0 if any(
                g.get('approved') for g in gates.values()) or \
                gates.get(wv, {}).get('approved') else 0.0
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
        for rid in re.findall(r'^### ((?:[A-Z]{1,2}|PS)\.\d+)', t, re.M):
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
        elif re.fullmatch(r'rules/[A-Z]{1,2}', tg):
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
        for m in re.finditer(r'§?\b([TCLGSIVMRWE]{1,2}|PS)\.(\d+)\b', t):
            rid = f'{m.group(1)}.{m.group(2)}'
            if rid not in ids:
                fails.append(f'{base}: references nonexistent rule '
                             f'{rid}')
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
            for m in re.finditer(r'^### ((?:[A-Z]{1,2}|PS)\.\d+)\s+(.*)$',
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
    'w0': [check_scaffold, check_astro_build],
    'w1': [check_mobbin_auth, check_design_mode, check_intent,
           check_genotype, check_tiers, check_audit_artifacts],
    'w2': [check_direction_axes, check_genotype, check_genotype_distinct,
           check_burst, check_declared_breaks, check_wildcard,
           check_dark_mode, check_variants],
    'w3': [check_system_enums, check_spacing_scale, check_breakpoints,
           check_content_width, check_contrast, check_type_system,
           check_tailwind_derivation, check_tile_is_system,
           check_no_emoji, check_neutral_tint, check_proximity,
           check_border_widths, check_reduced_motion, check_dark_mode,
           check_astro_build],
    'w4': [check_content_inventory],
    'w5': [check_wireframe_tags, check_mobbin_refs,
           check_wireframe_lock, check_section_enums,
           check_speech_acts, check_emphasis, check_motif,
           check_rhythm, check_vector_map, check_schema_fields,
           check_genotype, check_burst, check_declared_breaks,
           check_wildcard, check_section_contracts],
    'w6': [check_components_exist, check_tile_is_system,
           check_class_subset, check_no_stray_styles, check_no_emoji,
           check_icon_discipline, check_section_shell,
           check_section_allowed, check_section_gates, check_exemplars,
           check_astro_build],
    'w7': [check_assembly, check_spec_verbatim, check_page_data_attrs,
           check_heading_verbatim, check_class_subset,
           check_no_stray_styles, check_no_emoji,
           check_icon_discipline, check_speed_budget,
           check_mobile_budget, check_viewport, check_tap_size,
           check_rhythm_render, check_copy_density, check_seo_lint,
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
    'w2': ['DESIGN-PLAN.md'],
    'w3': ['DESIGN-PLAN.md', 'TOKENS.json',
           'site/src/pages/system.astro', 'site/src/styles/global.css'],
    'w4': ['STUB.md'],
    'w5': ['DESIGN-PLAN.md', 'MOBBIN-REFS.md'],
    'w6': ['DESIGN-PLAN.md', 'COMPONENTS.md',
           'site/src/pages/system.astro'],
    'w7': ['DESIGN-PLAN.md'],
    'w8': ['REVIEW.json'],
}
for _w in list(WAVE_CHECKS):
    WAVE_CHECKS[_w].append(check_checklist)
    WAVE_CHECKS[_w].append(check_dna)
    WAVE_CHECKS[_w].append(check_dna_fresh)

APPROVABLE = {'w2', 'w3', 'w5', 'w6', 'w7', 'w8'}

if __name__ == '__main__':
    sys.exit(main())

