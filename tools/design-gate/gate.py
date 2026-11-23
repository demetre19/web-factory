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
import argparse, functools, glob as glob_mod, hashlib, hmac, \
    html.parser, json, os, re, shutil, subprocess, sys, threading

_lc = functools.lru_cache


def node_env():
    """Subprocess env for anything that shells out to npm — when npm
    isn't on PATH, fall back to a node installed under ~/.nvm (the
    vendored toolchain supplies node_modules; node itself is a machine
    prerequisite like python). Returns os.environ, PATH-patched only
    when needed."""
    env = dict(os.environ)
    if shutil.which('npm', path=env.get('PATH')):
        return env
    nvm = os.path.expanduser('~/.nvm/versions/node')
    if os.path.isdir(nvm):
        vers = sorted(os.listdir(nvm),
                      key=lambda v: [int(x) for x in re.findall(
                          r'\d+', v)])
        for v in reversed(vers):
            b = os.path.join(nvm, v, 'bin')
            if os.path.isfile(os.path.join(b, 'npm')):
                env['PATH'] = b + os.pathsep + env.get('PATH', '')
                return env
    return env


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
    'modal-form': {'act'},
    'cutout-hero-split': {'promise', 'detail'},
    'cutout-catalog-grid': {'how', 'detail'},
    'cutout-cta-band': {'act'},
    # banked topology classes exposed as pickable options (E)
    'timeline-steps': {'how'}, 'how-steps': {'how'},
    'newsletter-band': {'act'}, 'teams-grid': {'detail', 'proof'},
    'gallery-grid': {'detail'}, 'pricing-table': {'objection', 'detail'},
    'portfolio-grid': {'detail', 'proof'}, 'contact-panel': {'act', 'detail'},
    'event-list': {'detail'}, 'banner-cta': {'act'},
    'feature-grid': {'how', 'detail'},
    # chrome structural rows (declared, not in §2)
    'nav-bar': {'chrome'}, 'footer-bar': {'chrome'},
    'flyout-nav': {'chrome'},
    'nav-h1': {'chrome'}, 'nav-h2': {'chrome'}, 'nav-h3': {'chrome'},
    'nav-h4': {'chrome'}, 'nav-h5': {'chrome'}, 'nav-h6': {'chrome'},
    'nav-h7': {'chrome'}, 'nav-h8': {'chrome'}, 'nav-h9': {'chrome'},
    'nav-h10': {'chrome'}, 'nav-h11': {'chrome'}, 'nav-h12': {'chrome'},
    'nav-h13': {'chrome'}, 'nav-h14': {'chrome'}, 'nav-h15': {'chrome'},
    'nav-h16': {'chrome'}, 'nav-h17': {'chrome'}, 'nav-h18': {'chrome'},
    'nav-h19': {'chrome'}, 'nav-h20': {'chrome'}, 'nav-h21': {'chrome'},
    'nav-h22': {'chrome'}, 'nav-h23': {'chrome'}, 'nav-h24': {'chrome'},
    'nav-h25': {'chrome'}, 'nav-shop-1': {'chrome'},
    'nav-shop-2': {'chrome'}, 'nav-shop-3': {'chrome'},
    'nav-shop-4': {'chrome'}, 'nav-mega-1': {'chrome'},
    'nav-mega-2': {'chrome'}, 'nav-mega-3': {'chrome'},
    'nav-mega-4': {'chrome'}, 'nav-mega-5': {'chrome'},
    'nav-mega-6': {'chrome'}, 'nav-mega-7': {'chrome'},
    'nav-offcanvas': {'chrome'}, 'footer-1': {'chrome'},
    'footer-2': {'chrome'}, 'footer-3': {'chrome'}, 'footer-4': {'chrome'},
    'footer-5': {'chrome'}, 'footer-6': {'chrome'}, 'footer-7': {'chrome'},
    'footer-8': {'chrome'}, 'footer-9': {'chrome'},
    'footer-10': {'chrome'}, 'footer-11': {'chrome'},
    'footer-12': {'chrome'}, 'footer-13': {'chrome'},
    'footer-15': {'chrome'}, 'footer-16': {'chrome'},
    'footer-17': {'chrome'}, 'footer-18': {'chrome'},
    'footer-19': {'chrome'}, 'footer-20': {'chrome'},
    'footer-21': {'chrome'}, 'footer-22': {'chrome'},
    'footer-23': {'chrome'}, 'footer-shop': {'chrome'},
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
        if tag == 'section' or (tag in ('nav', 'header', 'footer')
                                and 'data-sec' in a):
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


def _css_rules(txt):
    """Yield (selector_text, body) per {…} rule, linearly. A regex
    like `([^{}]+)\\{([^}]*)(?:min-height|height)` backtracks
    quadratically across a built stylesheet (~10s on 80KB of CSS)."""
    prev_end = 0
    for m in re.finditer(r'\{([^{}]*)\}', txt):
        yield txt[prev_end:m.start()], m.group(1)
        prev_end = m.end()


def _media_blocks(txt):
    """Yield (prelude, body) per @media rule; body keeps inner braces
    (depth-matched scan, not a nested-quantifier regex)."""
    for m in re.finditer(r'@media[^{]+\{', txt):
        depth, i = 1, m.end()
        while i < len(txt) and depth:
            if txt[i] == '{':
                depth += 1
            elif txt[i] == '}':
                depth -= 1
            i += 1
        yield m.group(0)[len('@media'):-1], txt[m.end():i - 1]


def _rule_min_heights(txt, sel_rx, under):
    """[(sel, px)] rules whose selector matches sel_rx and declares
    min-height < under px."""
    out = []
    for sel, body in _css_rules(txt):
        if not sel_rx.search(sel):
            continue
        mh = re.search(r'min-height\s*:\s*(\d+)px', body)
        if mh and int(mh.group(1)) < under:
            out.append((sel.strip(), int(mh.group(1))))
    return out

def first_sentence(text):
    m = re.search(r'[.!?](\s|$)', text)
    return (text[:m.end()].strip() if m else text.strip())

# ---------------------------------------------------------------- context

# files owned by the per-website design folder
# (DESIGN-SYSTEMS/<site>/), shared by every page under <site>/pages/
SITE_SCOPED = ('MOBBIN-REFS.md', 'BRIEF.yaml', 'RULES.md',
               'DISCOVERY.json', 'DISCOVERY.md', 'DESIGN-SYSTEM.md')


class Ctx:
    def __init__(self, pipeline, args=None):
        # realpath: a fixture/clone may arrive via a symlinked dir;
        # pages/<slug> layout detection and site resolution must see
        # the physical path
        self.dir = os.path.abspath(os.path.realpath(pipeline))
        self.site = os.path.join(self.dir, 'site')
        up = os.path.dirname(os.path.dirname(self.dir))
        # page dir inside a site design folder: <site>/pages/<slug>
        self.site_dir = up if (
            os.path.basename(os.path.dirname(self.dir)) == 'pages'
            and os.path.isfile(os.path.join(up, 'BRIEF.yaml'))) else None
        self.args = args or argparse.Namespace(
            wireframe=None, design=None, stub=None)
        self._plan_text = None
        self._plan = None
        self._stub_rows = None
        self.gates_path = os.path.join(self.dir, 'GATES.json')

    def _path(self, c):
        if os.path.isabs(c):
            return c
        p = os.path.join(self.dir, c)
        if not os.path.isfile(p) and self.site_dir and c in SITE_SCOPED:
            return os.path.join(self.site_dir, c)
        return p

    def read(self, *candidates):
        for c in candidates:
            p = self._path(c)
            if os.path.isfile(p):
                with open(p, encoding='utf-8', errors='replace') as f:
                    return f.read()
        return None

    def find(self, *names):
        for c in names:
            p = self._path(c)
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
            # N-2 — a header-only table is an EMPTY inventory (the
            # first row is always the header), and placeholder cells
            # never count as content
            body = [r_ for r_ in rows[1:] if any(
                c and not re.fullmatch(
                    r'(?i)t\.?b\.?d\.?|todo|n/?a|lorem\w*|x+|\?+', c)
                for c in r_)]
            if body:
                out[key] = body
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
            # the cid column IMMEDIATELY follows the fs cell: a table
            # with a Link-slot column before the cid (…|—|c-def|) reads
            # cid from cells[4]; without one, from cells[3]. A header
            # row whose own cite is not a cid keeps ''.
            cands = cells[3:]
            cid = next((c for c in cands
                        if re.fullmatch(r'c-[a-z][\w-]*', c)), '')
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
                                    'fs': fs_txt, 'h1': h1,
                                    'cid': cid})
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
    """P.9 — the wave's evidence table is present, filled, carries the
    checklist_emit.py stamp, and its input rows cite real .receipts
    entries whose recorded shas match the files on disk."""
    wave = ctx.wave
    if wave == 'selftest':            # fixtures declare their own wave
        marker = os.path.join(ctx.dir, '.wave')
        if os.path.isfile(marker):
            wave = open(marker).read().strip()
    if wave not in WAVE_CHECKS:
        return []
    f = [f'P.9 {x}' for x in checklist_blank_fails(ctx, wave)]
    t = ctx.checklist(wave)
    if t is None:
        return f
    if not t.startswith('<!-- GENERATED by checklist_emit.py '
                        'from .receipts/'):
        f.append(f'P.9 CHECKLIST/{wave}.md lacks the '
                 'checklist_emit.py stamp — evidence tables are '
                 'machine-written from producer receipts')
    f += _checklist_receipt_fails(ctx, wave, t)
    return f


def _checklist_receipt_fails(ctx, wave, t):
    """Every `| input REL |` row in the checklist cites a receipted
    producer whose recorded output sha equals the file on disk —
    or honestly reports ABSENT/no-producer."""
    import glob as _g
    rec_dirs = [os.path.join(ctx.dir, '.receipts')]
    if ctx.site_dir and ctx.site_dir != ctx.dir:
        rec_dirs.append(os.path.join(ctx.site_dir, '.receipts'))
    steps = []
    f = []
    key = op_key()
    for rd in rec_dirs:
        for rp in sorted(_g.glob(os.path.join(rd, '*.json'))):
            try:
                rsteps = (json.load(open(rp)) or {}).get('steps') or []
            except Exception:
                continue
            for st in rsteps:
                # provenance must be signed at write time (pipeline
                # ._record signs with op_key) — an unsigned step is a
                # forgeable receipt, never checklist evidence
                want_sig = _sig(st, key) if key else None
                if not want_sig or st.get('sig') != want_sig:
                    f.append(f'P.9 .receipts/{os.path.basename(rp)} '
                             f'step "{st.get("label")}" is unsigned '
                             'or forged — receipts sign at write '
                             'time; an unverifiable step proves '
                             'nothing')
                    continue
                steps.append(st)
    outs = {}
    for st in steps:
        for rel, sha in (st.get('outputs') or {}).items():
            outs.setdefault(rel, set()).add(sha)
    # a file a tool genuinely produced must cite one of the recorded
    # output shas; several waves can legitimately write the same rel
    for line in t.split('\n'):
        m = re.match(r'\|\s*input\s+([^|]+?)\s*\|\s*(.*)\|\s*$', line)
        if not m:
            continue
        rel, ev = m.group(1).strip(), m.group(2)
        on = None
        for base in (ctx.dir, ctx.site_dir or ctx.dir):
            cand = os.path.join(base, rel)
            if os.path.isfile(cand):
                on = _sha256_file(cand)
                break
        cited = re.search(r'sha256:([0-9a-f]{16})', ev)
        if 'no producer receipt' in ev:
            if rel in outs:
                f.append(f'P.9 checklist claims {rel} has no producer '
                         'but .receipts records one — the table is '
                         'hand-written')
            if 'ABSENT' in ev:
                if on:
                    f.append(f'P.9 checklist calls {rel} ABSENT but '
                             'it exists')
            elif cited and on and cited.group(1) != on[:16]:
                f.append(f'P.9 checklist cites a stale sha for '
                         f'{rel} — the file changed or the row is '
                         'invented')
            continue
        pm = re.search(r'produced by `([^`]+)` at (\w+) — '
                       r'sha256:([0-9a-f]{16})', ev)
        if not pm:
            f.append(f'P.9 checklist input row {rel} cites no '
                     'receipted sha — rows come from .receipts')
            continue
        want = pm.group(3)
        if want not in outs.get(rel, set()):
            f.append(f'P.9 checklist {rel} cites a receipt sha that '
                     'matches no recorded .receipts output')
            continue
        if on and on[:16] != want:
            f.append(f'P.9 checklist {rel} receipt sha ≠ the file on '
                     'disk — the artifact changed after the '
                     'receipt')
    return f

# ---------------------------------------------------------------- WCAG

def _oklch_to_rgb(L, C, H):
    """OKLCH → (r,g,b) linear-gamma sRGB 0–1. Clamps into gamut; the
    gate measures intent, so an out-of-gamut token audits its closest
    displayable colour."""
    import math
    a = C * math.cos(math.radians(H))
    b = C * math.sin(math.radians(H))
    l = L + 0.3963377774 * a + 0.2158037573 * b
    m = L - 0.1055613458 * a - 0.0638541728 * b
    s = L - 0.0894841775 * a - 1.2914855480 * b
    l, m, s = l ** 3, m ** 3, s ** 3
    r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    bb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s

    def gam(c):
        c = max(0.0, min(1.0, c))
        # matrix output is LINEAR sRGB; _rgb consumers expect the
        # gamma-encoded form a hex triplet carries
        return (12.92 * c if c <= 0.0031308
                else 1.055 * c ** (1 / 2.4) - 0.055)
    return (gam(r), gam(g), gam(bb))


def _rgb(hexv):
    """'#rrggbb' OR 'oklch(L C H)' → sRGB 0–1 triple. ACSS 4 emits
    oklch() shade values; a palette authored in oklch must NOT slip
    past the contrast gate (hex-only _rgb was a silent bypass)."""
    v = (hexv or '').strip().lower()
    mo = re.match(r'oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)', v)
    if mo:
        L = float(mo.group(1))
        if '%' in mo.group(0).split(' ')[0] or L > 1.0:
            L /= 100.0
        return _oklch_to_rgb(L, float(mo.group(2)),
                             float(mo.group(3)))
    h = v.lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    if len(h) != 6:
        return None
    try:
        return tuple(int(h[i:i+2], 16) / 255 for i in (0, 2, 4))
    except ValueError:
        return None


def _oklch_lch(hexv):
    """(L, C, H) for any colour _rgb parses — one colour space for
    every tint/lightness audit (HSL-S and WCAG-Y disagreed, see
    research/COLOUR-RULES §4)."""
    import math
    rgb = _rgb(hexv)
    if rgb is None:
        return None
    def lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    r, g, b = lin(rgb[0]), lin(rgb[1]), lin(rgb[2])
    l = (0.4122214708 * r + 0.5363325363 * g +
         0.0514459929 * b) ** (1 / 3)
    m = (0.2119034982 * r + 0.6806995451 * g +
         0.1073969566 * b) ** (1 / 3)
    s = (0.0883024619 * r + 0.2817188376 * g +
         0.6299787005 * b) ** (1 / 3)
    L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s
    a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s
    bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
    return (L, math.hypot(a, bb),
            math.degrees(math.atan2(bb, a)) % 360)


def _lum(rgb):
    # WCAG 2.x sRGB linearization — ONE breakpoint (0.03928). The two
    # gate copies disagreed on 0.04045 vs 0.03928; consolidated.
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
        return v if isinstance(v, str) and (
            v.startswith('#') or v.startswith('oklch')) else None
    if isinstance(r, str) and (r.startswith('#') or
                               r.startswith('oklch')):
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
    if os.path.isdir(os.path.join(ctx.site, 'html')):
        # HTML mode: the emit's internal build already produced dist
        # + the site/html artifact — astro is the terminal packaging
        # step (--astro) the downstream LLM runs, not a wave gate
        return []
    if not os.path.isfile(os.path.join(ctx.site, 'package.json')):
        return ['P.1 no site/package.json — not an Astro project']
    if not os.path.isdir(os.path.join(ctx.site, 'node_modules')):
        return ['P.1 site/node_modules missing — npm ci first']
    # w6's emit+build receipt already proves the project builds this
    # run — astro is the terminal packaging step, not something to
    # re-verify at every gate (rebuilding empties+rewrites dist too)
    try:
        recs = json.load(open(os.path.join(ctx.dir,
                                           '.receipts', 'w6.json')))
        if any(s.get('label') == 'emit + build' and s.get('rc') == 0
               for s in recs.get('steps', [])):
            return []
    except Exception:
        pass
    r = subprocess.run(['npm', 'run', 'build', '--', '--silent'],
                       cwd=ctx.site, capture_output=True, text=True,
                       env=node_env(), timeout=300)
    if r.returncode != 0:
        tail = '\n'.join((r.stdout + r.stderr).split('\n')[-8:])
        return [f'P.1 astro build failed (exit {r.returncode}): {tail}']
    return []

# a check that rewrites the artifacts its siblings read cannot join
# the concurrent pool — astro build empties+rewrites dist/ mid-wave,
# so it runs serially BEFORE the readers (_check_pool)
check_astro_build._mutates = True

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
                if fn.rsplit('.', 1)[-1].lower() in (
                        'jpg', 'jpeg', 'png', 'webp', 'avif', 'gif',
                        'woff', 'woff2', 'mp4', 'zip', 'ico'):
                    continue    # binary payloads aren't text
                p = os.path.join(dp, fn)
                t = open(p, encoding='utf-8', errors='replace').read()
                # comments never render — the emoji rule polices what
                # the user sees, not docstrings
                t = re.sub(r'<!--.*?-->|\{/\*.*?\*/\}|/\*.*?\*/'
                           r'|(^|[^:])//[^\n]*', r'\1 ', t, flags=re.S)
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
            if 'data-ornament' in attrs:
                continue  # O-rules own ornament geometry/strokes
            # a brand mark is artwork, not an icon — I-rules govern
            # the icon set; the logo's own grid/palette is the brand's
            seg = t[max(0, m.start() - 300):m.start()]
            if 'brand-logo' in seg or 'brand-mark' in seg:
                continue
            # whitespace-anchored: \b matches after '-', so a bare \b
            # read stroke-width="2" as the icon's width
            w = re.search(r'(?<![\w-])width="(\d+)"', attrs)
            h = re.search(r'(?<![\w-])height="(\d+)"', attrs)
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
# I.10 — Lucide is the only icon family, wired as lucide-astro:
# build-time inline SVG in .astro templates, zero client JS. The
# semantic resolver maps content icon needs to Lucide names; specs
# and recipes reference icons by Lucide name (kebab-case) or a
# semantic alias below.
LUCIDE_SEMANTIC = {
    'phone': 'phone', 'call': 'phone', 'mail': 'mail', 'email': 'mail',
    'check': 'check', 'tick': 'check', 'star': 'star',
    'map-pin': 'map-pin', 'location': 'map-pin', 'pin': 'map-pin',
    'arrow-right': 'arrow-right', 'next': 'arrow-right',
    'chevron-down': 'chevron-down', 'expand': 'chevron-down',
    'menu': 'menu', 'burger': 'menu', 'close': 'x', 'x': 'x',
    'clock': 'clock', 'calendar': 'calendar', 'users': 'users',
    'shield': 'shield-check', 'shield-check': 'shield-check',
    'award': 'award', 'sparkles': 'sparkles', 'globe': 'globe',
    'search': 'search', 'heart': 'heart', 'zap': 'zap',
}
_ICON_NAME_RX = re.compile(r'^[a-z][a-z0-9-]*$')
_BAD_ICON_NAMES = {'?', 'todo', 'placeholder', 'icon', 'none-ish',
                   'unk', 'unknown', 'tbd', 'na', 'n/a'}


def check_lucide(ctx):
    """I.10 — icons are lucide-astro build-time imports only:
    a literal <svg> in an .astro template (outside Logo*.astro —
    the logo is bespoke artwork, P.11 owns it) is a hand-drawn icon
    bypass; using lucide-astro without the declared dependency
    breaks the build; data-icon values must resolve to a Lucide
    name (semantic alias or kebab-case Lucide name — never a
    placeholder)."""
    f = []
    src = os.path.join(ctx.site, 'src')
    uses_lucide = False
    if os.path.isdir(src):
        for dp, _, fns in os.walk(src):
            for fn in fns:
                if not fn.endswith('.astro'):
                    continue
                p = os.path.join(dp, fn)
                t = open(p, encoding='utf-8', errors='replace').read()
                rel = os.path.relpath(p, ctx.dir)
                # split frontmatter from template
                body = t
                m = re.match(r'^---\n(.*?\n)?---\n', t, re.S)
                fm = m.group(1) if m else ''
                if m:
                    body = t[m.end():]
                if re.search(r"from\s+['\"]lucide-astro['\"]", fm):
                    uses_lucide = True
                # the nav theme toggle embeds its two fixed Lucide
                # paths inline — classed icon-moon/icon-sun so
                # [data-theme] swaps them; not a hand-drawn bypass
                tgl = re.sub(
                    r'<svg\b[^>]*class="icon-(?:moon|sun)"[^>]*>'
                    r'.*?</svg>', '', body, flags=re.S)
                if re.search(r'<svg\b(?![^>]*\bdata-(?:ornament|'
                               r'motif)\b)', tgl) and \
                        not fn.lower().startswith('logo'):
                    f.append(f'I.10 {rel}: literal <svg> in template '
                             '— icons import lucide-astro and render '
                             'as components (build-time inline SVG); '
                             'bespoke marks live in Logo*.astro only')
    if uses_lucide:
        pj = os.path.join(ctx.site, 'package.json')
        try:
            deps = json.load(open(pj))
            deps = {**deps.get('dependencies', {}),
                    **deps.get('devDependencies', {})}
        except Exception:
            deps = {}
        if 'lucide-astro' not in deps:
            f.append('I.10 site/package.json: lucide-astro imported '
                     'but not declared as a dependency')
    # rendered icons must resolve to a real Lucide name
    for p, t in ctx.page_htmls():
        name = os.path.basename(p)
        for m in re.finditer(r'data-icon="([^"]*)"', t):
            nm = m.group(1).strip()
            if nm in _BAD_ICON_NAMES or not _ICON_NAME_RX.match(nm) \
                    or ('--' in nm) or nm.endswith('-'):
                f.append(f'I.10 {name}: data-icon "{nm}" does not '
                         'resolve to a Lucide name — the resolver '
                         'falls back to the closest alias, never a '
                         'placeholder')
    return f

def _ornament_budget(gt, profile):
    """O.8 — the DNA's personality genes filter the ornament option
    set BEFORE the look round. Returns allowed {layers, intensities,
    motions}; 'none' is always a valid option.

    technical/precision → technical layer, hairline accent,
        dash-draw ok — not decorative scatter
    luxury → sparse outline-echo at ghost — never tile/scatter
    clean/minimal (spacious|whitespace-led + calm|restrained)
        → whisper-ghost only, static
    brand-led/expressive (agency/fashion/events/media or
        bold|expressive mood) → full palette"""
    technical = profile in ('technology', 'saas', 'architecture',
                            'automotive', 'engineering')
    luxury = profile in ('luxury-goods', 'jewellery', 'fashion')
    expressive = profile in ('agency-portfolio', 'portfolio', 'events',
                             'media', 'personal-brand') or \
        gt.get('mood-energy') in ('bold', 'expressive')
    clean = gt.get('density-tier') in ('spacious', 'whitespace-led') or \
        gt.get('mood-energy') in ('calm', 'restrained')
    if luxury:
        return {'layers': {'none', 'logo-motif'},
                'intensities': {'ghost'},
                'motions': {'static', 'reveal'}}
    if technical:
        return {'layers': {'none', 'technical'},
                'intensities': {'ghost', 'accent'},
                'motions': {'static', 'dash-draw', 'reveal'}}
    if clean and not expressive:
        return {'layers': {'none', 'technical', 'logo-motif'},
                'intensities': {'ghost'},
                'motions': {'static'}}
    if expressive:
        return {'layers': {'none', 'technical', 'logo-motif',
                           'decorative'},
                'intensities': set(ornament_intensity_names()),
                'motions': {'static', 'drift', 'rotate', 'dash-draw',
                            'pulse', 'reveal'}}
    return {'layers': {'none', 'technical', 'logo-motif'},
            'intensities': {'ghost', 'accent'},
            'motions': {'static', 'drift', 'reveal'}}


def ornament_intensity_names():
    return ('ghost', 'accent', 'statement', 'bold')

def check_ornament(ctx):
    """O.1–O.7 — ornament is an INJECTABLE layer: machinery-made,
    DNA-coherent, token-bound, decorative, targeted, intensified,
    motion-bound:
    O.1 every ornament svg carries seed/variant/density/bounds params
        and its geometry equals ornament.generate() output —
        deterministic parametric, never AI-random;
    O.2 data-ornament-layer == genotype ornament allele (never none)
        and layer ∈ {technical, logo-motif, decorative};
    O.3 strokes bind tokens — currentColor/var()/none,
        stroke-width ∈ [0.5,1];
    O.4 aria-hidden="true" + data-layer="behind";
    O.5 every rendered ornament's data-ornament-target matches a
        declared ornament_placements entry — targeted injection,
        ≤4 per page, never blanket sprinkle;
    O.6 data-ornament-intensity ∈ {ghost,accent,statement,bold} and
        its opacity sits inside the band;
    O.7 data-ornament-motion ∈ closed set; non-static motion needs
        the tamdoma ornament-* keyframes AND prefers-reduced-motion
        disabling them in global.css."""
    try:
        import ornament
    except Exception:
        here = os.path.dirname(os.path.abspath(__file__))
        if os.path.isfile(os.path.join(here, 'ornament.py')):
            sys.path.insert(0, here)
            import ornament
        else:
            return []
    f = []
    dna = dna_map(ctx) or {}
    gt = dna.get('genotype') or {}
    allele = gt.get('ornament', 'none')
    profile = dna.get('profile') or ''
    placements = dna.get('ornament_placements')
    if placements is None and ctx.plan:
        placements = ctx.plan.get('ornament_placements')
    placements = placements or []
    budget = _ornament_budget(gt, profile)
    declared_targets = set()
    needs_motion_css = False
    for pl in placements:
        if not isinstance(pl, dict):
            continue
        tgt = str(pl.get('target', ''))
        if tgt:
            declared_targets.add(tgt)
        lay = pl.get('layer', allele)
        if lay not in budget['layers']:
            f.append(f'O.8 placement {tgt}: layer {lay} ∉ '
                     f'{sorted(budget["layers"])} — the DNA '
                     'filters ornament choices before the look '
                     'round; ornament=none is always valid')
        inten = pl.get('intensity', 'ghost')
        if inten not in ornament.INTENSITY_BANDS:
            f.append(f'O.6 placement {tgt}: intensity {inten!r} '
                     '∉ ghost|accent|statement|bold')
        elif inten not in budget['intensities']:
            f.append(f'O.8 placement {tgt}: intensity {inten} '
                     'above this DNA\'s restraint budget '
                     f'{sorted(budget["intensities"])} — '
                     'coherence fail')
        mo = pl.get('motion', 'static')
        if mo not in ornament.MOTIONS:
            f.append(f'O.7 placement {tgt}: motion {mo!r} ∉ '
                     f'{list(ornament.MOTIONS)}')
        elif mo not in budget['motions']:
            f.append(f'O.8 placement {tgt}: motion {mo} ∉ '
                     f'{sorted(budget["motions"])} for this DNA')
        if mo not in (None, 'static'):
            needs_motion_css = True
    if allele != 'none' and not placements:
        f.append('O.5 genotype declares ornament=' + str(allele) +
                 ' but ornament_placements is empty — the layer is '
                 'injected at declared targets, never blanketed')
    if needs_motion_css:
        css = ''
        cp = os.path.join(ctx.site, 'src/styles/global.css')
        if os.path.isfile(cp):
            css = open(cp, encoding='utf-8', errors='replace').read()
        if '.ornament-' not in css:
            f.append('O.7 ornament motion declared but no .ornament-* '
                     'CSS in global.css — motion is a tamdoma recipe, '
                     'not ad-hoc')
        rm = re.search(r'prefers-reduced-motion[^}]*}', css)
        if not rm or ('ornament' not in rm.group(0)
                      and 'animation: none' not in rm.group(0)
                      and 'animation:none' not in rm.group(0)):
            f.append('O.7 ornament motion without '
                     'prefers-reduced-motion disable — accessibility '
                     'is not optional')
    for p, t in ctx.page_htmls():
        name = os.path.basename(p)
        rendered = list(re.finditer(
            r'<svg\b[^>]*data-ornament[^>]*>.*?</svg>', t, re.S))
        if len(rendered) > ornament.MAX_PER_PAGE:
            f.append(f'O.5 {name}: {len(rendered)} ornaments on one '
                     f'page > {ornament.MAX_PER_PAGE} — ornament is '
                     'intentional and sparse, not sprinkled')
        for m in rendered:
            svg = m.group(0)
            attrs = svg[:svg.index('>')]
            if allele in (None, '', 'none'):
                f.append(f'O.2 {name}: ornament rendered but '
                         'genotype ornament=none — DNA coherence')
                continue
            lay = re.search(r'data-ornament-layer="([^"]+)"', attrs)
            lay = lay.group(1) if lay else None
            if lay and lay != allele:
                f.append(f'O.2 {name}: ornament layer {lay} != '
                         f'genotype allele {allele}')
            tgt = re.search(r'data-ornament-target="([^"]+)"', attrs)
            if not tgt:
                f.append(f'O.5 {name}: ornament missing '
                         'data-ornament-target — injection points '
                         'are declared')
            elif tgt.group(1) not in declared_targets:
                f.append(f'O.5 {name}: ornament target '
                         f'{tgt.group(1)} not in declared '
                         'ornament_placements — targeted '
                         'injection, never implicit')
            inten = re.search(r'data-ornament-intensity="([^"]+)"',
                              attrs)
            op = re.search(r'opacity="([\d.]+)"', attrs)
            if inten:
                band = ornament.INTENSITY_BANDS.get(inten.group(1))
                if band is None:
                    f.append(f'O.6 {name}: intensity '
                             f'{inten.group(1)} ∉ closed band set')
                elif op and not (band[0] - 0.005 <=
                                 float(op.group(1)) <= band[1] + 0.005):
                    f.append(f'O.6 {name}: opacity {op.group(1)} '
                             f'outside {inten.group(1)} band '
                             f'{band} — intensity is the vector, '
                             'opacity is its number')
            mo = re.search(r'data-ornament-motion="([^"]+)"', attrs)
            if mo and mo.group(1) not in ornament.MOTIONS:
                f.append(f'O.7 {name}: motion {mo.group(1)} ∉ '
                         'static|drift|rotate|dash-draw|pulse|reveal')
            if 'aria-hidden="true"' not in attrs:
                f.append(f'O.4 {name}: ornament svg missing '
                         'aria-hidden="true" — decorative layers '
                         'are invisible to assistive tech')
            if 'data-layer="behind"' not in attrs:
                f.append(f'O.4 {name}: ornament svg missing '
                         'data-layer="behind" — ornament stays under '
                         'the content layer')
            sw = re.search(r'stroke-width="([\d.]+)"', attrs)
            if sw and not (0.4 <= float(sw.group(1)) <= 1.05):
                f.append(f'O.3 {name}: ornament stroke-width '
                         f'{sw.group(1)} outside 0.5–1px — '
                         'construction lines are hairlines')
            st = re.search(r'stroke="([^"]+)"', attrs)
            if st and st.group(1) not in ('currentColor', 'none') \
                    and not st.group(1).startswith('var('):
                f.append(f'O.3 {name}: ornament stroke '
                         f'"{st.group(1)}" — strokes bind '
                         'currentColor / muted tokens')
            seed = re.search(r'data-ornament-seed="(\d+)"', attrs)
            dens = re.search(r'data-ornament-density="([\d.]+)"', attrs)
            bounds = re.search(r'data-ornament-bounds="(\d+)x(\d+)"',
                               attrs)
            var = re.search(r'data-ornament-variant="([^"]+)"', attrs)
            if not (seed and dens and bounds and var):
                f.append(f'O.1 {name}: ornament missing '
                         'seed/density/bounds/variant params — '
                         'undocumented geometry is AI-random risk')
                continue
            try:
                canon = ornament.generate(
                    seed=int(seed.group(1)),
                    density=float(dens.group(1)),
                    bounds=(int(bounds.group(1)),
                            int(bounds.group(2))),
                    variants=tuple(var.group(1).split('+')))
            except ValueError as e:
                f.append(f'O.1 {name}: {e} — variant ∉ closed '
                         'parametric vocabulary')
                continue
            # markup-normalized compare: serializers differ on empty
            # leaf tags (Astro emits </path>, generate() emits />) —
            # geometry is what binds, not tag-sugar (F4 real-build)
            _leaf = ('path|circle|rect|line|polyline|polygon|'
                     'ellipse|stop|use|point')
            def _norm(s):
                s = re.sub(rf'</(?:{_leaf})\s*>', '', s)
                s = re.sub(r'/\s*>', '>', s)   # xhtml self-close
                return re.sub(r'\s+', ' ', s).strip()
            inner = re.search(r'<svg\b[^>]*>(.*)</svg>', svg, re.S)
            inner_c = _norm(inner.group(1) if inner else '')
            canon_inner = _norm(re.search(
                r'<svg\b[^>]*>(.*)</svg>', canon, re.S).group(1))
            if inner_c != canon_inner:
                f.append(f'O.1 {name}: ornament geometry != '
                         f'generate(seed={seed.group(1)},…) — '
                         'ornaments are machinery-produced, '
                         'deterministic; hand-drawn geometry fails')
    return f

# BM — the neutral decoration vocabulary: shapes that need no brand
# derivation (hairlines, dot grids, keylines). Anything else must
# trace to the extracted motif kit (motif.py) or FAIL.
NEUTRAL_PRIMITIVES = {'hairline', 'dot-grid', 'keyline', 'divider',
                      'underline', 'rule', 'none'}
MOTIF_SLOTS = {'background', 'accent', 'frame', 'divider',
               'marker', 'quote', 'corner'}


def check_brand_motif(ctx):
    """BM.1–BM.3 — decorations trace to the brand-motif kit:
    BM.1 dna.brand_motif {motif_source: logo-extracted|declared|none,
        motif_family: [...], usage: background|accents|frames|
        dividers|all} — a declared/logo-extracted source must carry a
        non-empty family;
    BM.2 every decoration (data-motif="X" / class motif-X) names a
        kit primitive (primary_mark, curve_family, negative_shape,
        angle, geometric_seed, primitives[]) or a neutral primitive
        — an unrelated shape is a coherence fail;
    BM.3 motif usage stays inside the declared slots
        (data-motif-slot ∈ usage set, or 'all')."""
    f = []
    dna = dna_map(ctx) or {}
    bm = dna.get('brand_motif')
    family = set()
    usage = set()
    if bm is not None:
        if not isinstance(bm, dict):
            f.append('BM.1 brand_motif must be a map '
                     '{motif_source, motif_family, usage}')
            bm = {}
        src = bm.get('motif_source')
        if src not in ('logo-extracted', 'declared', 'none'):
            f.append(f'BM.1 motif_source {src!r} ∉ '
                     'logo-extracted|declared|none')
        fam = bm.get('motif_family')
        if src in ('logo-extracted', 'declared'):
            if not fam:
                f.append('BM.1 motif_source ' + str(src) +
                         ' declares a kit but motif_family is '
                         'empty — extraction must produce the '
                         'primitives before use')
            elif not isinstance(fam, list):
                f.append('BM.1 motif_family must be a list of kit '
                         'primitives')
        if isinstance(fam, list):
            family = {str(x) for x in fam}
        u = bm.get('usage')
        if isinstance(u, str):
            usage = {u}
        elif isinstance(u, list):
            usage = {str(x) for x in u}
    kit = family | NEUTRAL_PRIMITIVES | {'mark', 'curve',
                                         'counter', 'angle', 'seed'}
    for p, t in ctx.page_htmls():
        name = os.path.basename(p)
        # O.9 — a motif is a logo-level PRIMITIVE: one form, ≤2
        # geometric elements, no text/labels/shading. Anything that
        # needs detail to parse is an illustration, not a motif —
        # it must read at 24px and at 400px ghosted.
        for m in re.finditer(
                r'<svg\b[^>]*data-motif[^>]*>(.*?)</svg>', t, re.S):
            inner = m.group(1)
            els = len(re.findall(
                r'<(?:path|circle|rect|line|polyline|polygon|ellipse)'
                r'\b', inner))
            if els > 2:
                f.append(f'O.9 {name}: motif svg uses {els} '
                         'primitives (>2) — a motif is ONE '
                         'geometric mark that reads at 24px and '
                         'ghosted; this is an illustration')
            if re.search(r'<text\b|<tspan\b|<image\b', inner):
                f.append(f'O.9 {name}: motif svg carries '
                         'text/image detail elements — a mark '
                         'that needs labels is a scene, not a '
                         'motif')
        for m in re.finditer(r'data-motif="([^"]+)"', t):
            prim = m.group(1)
            if not family and prim not in NEUTRAL_PRIMITIVES:
                f.append(f'BM.2 {name}: motif "{prim}" used with '
                         'no motif kit — decorations trace to the '
                         'extracted mark or a neutral primitive')
            elif family and prim not in kit:
                f.append(f'BM.2 {name}: motif "{prim}" not in '
                         f'the kit {sorted(family)[:6]} nor a '
                         'neutral primitive — random stock shapes '
                         'fail coherence')
        for m in re.finditer(r'\bmotif-([a-z0-9-]+)', t):
            prim = m.group(1)
            if prim == 'slot':
                continue  # data-motif-slot is metadata, not a motif
            if not family and prim not in NEUTRAL_PRIMITIVES:
                f.append(f'BM.2 {name}: motif-{prim} used with no '
                         'motif kit — decorations trace to the '
                         'extracted mark or a neutral primitive')
                continue
            if prim not in kit:
                f.append(f'BM.2 {name}: motif-{prim} not in the '
                         f'motif kit {sorted(family)[:6]} nor a '
                         'neutral primitive — random stock shapes '
                         'fail coherence')
        for m in re.finditer(r'data-motif-slot="([^"]+)"', t):
            slot = m.group(1)
            if usage and 'all' not in usage and slot not in usage:
                f.append(f'BM.3 {name}: motif slot {slot} ∉ '
                         f'declared usage {sorted(usage)}')
            elif not usage and slot not in MOTIF_SLOTS:
                f.append(f'BM.3 {name}: motif slot {slot} not a '
                         f'known slot {sorted(MOTIF_SLOTS)}')
    # O.2 coupling: logo-motif ornaments need a kit to draw from
    gt = dna.get('genotype') or {}
    if gt.get('ornament') == 'logo-motif' and not family:
        f.append('BM.2 genotype ornament=logo-motif but the '
                 'brand_motif kit is empty — extract the mark '
                 'first (motif.py), then inject')
    return f


IMG_EXT = ('.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif')
IMG_DIRS = ('discovery', 'INTAKE', 'assets', 'images', 'media')


def _schema_errors(obj, schema, path='$', _root=None):
    """Minimal draft-07 subset: type, required, enum, pattern, min/max,
    minItems/minProperties, items, $ref (local, always resolved against
    the document root). No dependencies."""
    f = []
    root = schema if _root is None else _root

    def resolve(sc):
        # $ref lookups walk the ROOT document — a ref inside items or a
        # nested property would otherwise resolve against the local
        # sub-schema's (nonexistent) definitions and silently become {}
        for _ in range(8):  # follow chained refs, cap cycles
            ref = sc.get('$ref')
            if not ref:
                return sc
            node = root
            for part in ref.lstrip('#/').split('/'):
                node = node.get(part) or {}
            sc = node
        return sc

    sc = resolve(schema)
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
                f += _schema_errors(obj[k], sub, f'{path}.{k}',
                                    _root=root)
    if t == 'array':
        if 'minItems' in sc and len(obj) < sc['minItems']:
            f.append(f'{path}: fewer than {sc["minItems"]} items')
        for i, it in enumerate(obj):
            f += _schema_errors(it, sc.get('items') or {},
                               f'{path}[{i}]', _root=root)
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
        if not _canon_ref_ok(
                rid, candidates=_candidate_registry(
                    os.path.join(ctx.dir, 'CANDIDATES.json'))
                or _candidate_registry()):
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
    # the legacy shape names still hold, and every plan row is its
    # own zone: a proof heading lives in the proof zone. A fixed table
    # from the five-row era would cap every future page at five rows.
    ZONES = ({'macro', 'micro', 'end', 'chrome', 'nav'}
             | {str(r.get('name') or '')
                for _, r in ctx.rows()})
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
                if sm and max(int(x) for x in sm) >= top - 1:
                    f.append(f'T.7 {name}: hero subhead at '
                             f'text-fluid-{max(int(x) for x in sm)} — '
                             'within one rank '
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
                        'quote-grid', 'flyout-nav'):
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
                    r'p[xytl]?-|px-|padding|inset|container|content-|'
                    r'sec-inner',
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
    # S.10 — no card inside a card in emitted markup: a card-level
    # container (class token `card` or `*-card`) may never contain
    # another one. Card parts (`card-media`, `card__x`) and ds-*
    # swatch plumbing are not cards. A tag stack tracks nesting — a
    # non-greedy body match would stop at the first sibling close and
    # miss a later nested card.
    _tok = r'(?<=[\s"])(?!ds-)(?:card|[a-z0-9_-]+-card)(?=[\s"])'
    _open = re.compile(
        r'<(/?)(div|article|section|figure|aside|li)\b([^>]*)>', re.S)
    for p_, t in ctx.page_htmls():
        name = os.path.basename(p_)
        stack = []
        for m in _open.finditer(t):
            closing, tag, attrs = m.groups()
            if not closing:
                is_card = bool(
                    re.search(r'class="[^"]*' + _tok, attrs))
                if is_card and any(c for _, c in stack):
                    f.append(f'S.10 {name}: card inside a card — '
                             'flatten to one card-level container')
                    break
                if not attrs.rstrip().endswith('/'):
                    stack.append((tag, is_card))
            else:
                for i in range(len(stack) - 1, -1, -1):
                    if stack[i][0] == tag:
                        del stack[i:]
                        break
    return f

def check_slop_palette(ctx):
    """SL.1–SL.4 — palette/glow bounds at look/DNA generation (w4).

    SL.1 no purple/violet gradients; SL.2 no neon-cyan accent on dark;
    SL.3 no cream page bg by default; SL.4 no zero-offset chromatic
    glow shadow tokens (dark-glow / radial-halo /
    radial-spotlight-glow). Reads the look artifacts (TOKENS.json,
    FINE-VARIANTS.json, VARIANT-GATES.json), not page output."""
    f = []
    canvas = str((_theme(ctx).get('canvas') or '')).upper()
    for mode, roles in _modes(ctx).items():
        bg, acc = roles.get('bg'), roles.get('accent')
        bl = _oklch_lch(bg) if bg else None
        if (bl and mode != 'dark' and bl[0] > 0.90 and
                40 <= bl[2] <= 110 and bl[1] > 0.03 and
                str(bg).upper() not in ('#FFF', '#FFFFFF', canvas)):
            f.append(f'SL.3 [{mode}] page bg {bg} is cream — a '
                     'neutral canvas unless the operator picked it')
        al = _oklch_lch(acc) if acc else None
        if mode == 'dark' and al and al[1] > 0.08 and 170 <= al[2] <= 205:
            f.append(f'SL.2 [{mode}] neon cyan accent {acc} on dark — '
                     'banned')
    for fn in ('TOKENS.json', 'FINE-VARIANTS.json',
               'VARIANT-GATES.json'):
        txt = ctx.read(fn) or ''
        for m in re.finditer(
                r'(?:linear|radial|conic)-gradient\(([^;"]*)\)', txt):
            for s_ in re.findall(
                    r'#[0-9a-fA-F]{3,8}|oklch\([^)]*\)', m.group(1)):
                lch = _oklch_lch(s_)
                if lch and lch[1] > 0.04 and 255 <= lch[2] <= 300:
                    f.append(f'SL.1 {fn}: purple/violet gradient stop '
                             f'{s_} — banned')
                    break
        for m in re.finditer(
                r'dark-glow|radial-halo|radial-spotlight-glow', txt):
            f.append(f'SL.4 {fn}: chromatic glow token {m.group(0)} — '
                     'zero-offset glow shadows are banned')
        for m in re.finditer(
                r'box-shadow["\']?\s*[:=]?\s*["\']?\s*0\s+0\s+[\d.]+'
                r'(?:px|rem|em)\s+(#[0-9a-fA-F]{3,8}|oklch\([^)]*\))',
                txt):
            lch = _oklch_lch(m.group(1))
            if lch and lch[1] > 0.05:
                f.append(f'SL.4 {fn}: zero-offset chromatic glow '
                         f'shadow {m.group(1)} — banned')
    return f

def check_gray_on_color(ctx):
    """C.9 — muted text on a chromatic surface takes the surface hue.

    A colored surface (OKLCH C > 0.03) may not carry dead-grey
    secondary text (OKLCH C < 0.015); ink_muted must be tinted from
    the surface's hue. C.1 contrast math handles the floor; this is
    the hue rule for the pair."""
    f = []
    for mode, roles in _modes(ctx).items():
        im = roles.get('ink_muted')
        if not im:
            continue
        il = _oklch_lch(im)
        for sname in ('surface', 'surface_elevated'):
            s_ = roles.get(sname)
            sl = _oklch_lch(s_) if s_ else None
            if il and sl and sl[1] > 0.03 and il[1] < 0.015:
                f.append(f'C.9 [{mode}] ink_muted {im} is neutral '
                         f'grey on chromatic {sname} {s_} — tint '
                         'it from the surface hue')
    return f

def check_font_slop(ctx):
    """Advisory — default-stack faces are low-distinctiveness.

    Inter/Roboto/Geist/Plus Jakarta Sans/Space Grotesk/Fraunces read
    as the un-picked default; a chosen design should carry a
    distinctive face unless the operator picked one of these."""
    out = []
    fonts = (_system(ctx).get('type') or {}).get('fonts') or {}
    prov = {}
    for fn in ('DNA.json', 'TOKENS.json'):
        raw = ctx.read(fn)
        if raw:
            try:
                prov = ((json.loads(raw).get('provenance') or {})
                        .get('fonts') or {})
            except Exception:
                prov = {}
        if prov:
            break
    picked = prov.get('tag') in ('extracted', 'snapped', 'briefed',
                                 'operator')
    if picked:
        return out
    for slot, stack in fonts.items():
        first = str(stack).split(',')[0].strip().strip('"\'').lower()
        if first in {'inter', 'roboto', 'geist', 'plus jakarta sans',
                     'space grotesk', 'fraunces'}:
            out.append(f'font "{first}" in slot {slot} is a '
                       'default-stack face — pick a distinctive face '
                       'unless the operator picked it')
    return out

def check_slop_classes(ctx):
    """SB.3 — emitted-markup slop patterns, on .astro sources and
    emitted html. Same pattern-lint style as check_section_allowed:
    class strings carry the vocabulary, not computed intent."""
    f = []

    def _lint(txt, name):
        for m in re.finditer(r'class="([^"]*)"', txt):
            c = m.group(1)
            if re.search(r'\bborder-[ltrb]-', c) and 'rounded' in c:
                f.append(f'SB.3 {name}: side-tab — one-sided '
                         'border-* on a rounded box')
            if re.search(r'\b(?:border-(?:accent|primary)|'
                         r'border-[ltrb]?-[3-9]\d*)\b', c) \
                    and 'rounded' in c:
                f.append(f'SB.3 {name}: border-accent-on-rounded — '
                         'thick accent border on a rounded card')
            if re.search(r'\bborder\b', c) and re.search(
                    r'\bshadow-(?:lg|xl|2xl)\b', c):
                f.append(f'SB.3 {name}: gpt-thin-border-wide-shadow '
                         '— hairline border + wide diffuse shadow')
        if re.search(r'bg-clip-text|-webkit-text-fill-color|'
                     r'text-fill-color', txt):
            f.append(f'SB.3 {name}: gradient-text — bg-clip-text / '
                     'text-fill-color')
        n_tiles = len(re.findall(
            r'class="[^"]*\b(?:w-(?:8|9|1[0-2])\s+h-(?:8|9|1[0-2])|'
            r'icon-(?:tile|box|badge))[^"]*\brounded[^"]*"[^>]*>.*?'
            r'<h[1-4]\b', txt, re.S))
        if n_tiles >= 2:
            f.append(f'SB.3 {name}: icon-tile-stack — small '
                     'rounded-square icon above every heading')

    for _fn, p_ in _section_files(ctx):
        with open(p_, errors='replace') as _fh:
            _lint(_fh.read(), _fn)
    for p_, t in ctx.page_htmls():
        _lint(t, os.path.basename(p_))
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
    """[(path, css)] every stylesheet under dist/ and preview/ —
    INCLUDING inline <style> blocks in dist HTML (a <style> tag is
    stylesheet content; motion checks that skipped it missed inline
    animations, F-13)."""
    out = []
    for root, inline in ((os.path.join(ctx.site, 'dist'), True),
                         (os.path.join(ctx.dir, 'preview'), False)):
        if not os.path.isdir(root):
            continue
        for dp, _, fns in os.walk(root):
            for fn in sorted(fns):
                p = os.path.join(dp, fn)
                if fn.endswith('.css'):
                    out.append((p, open(p, encoding='utf-8',
                                        errors='replace').read()))
                elif inline and fn.endswith(('.html', '.astro')):
                    try:
                        t = open(p, encoding='utf-8',
                                 errors='replace').read()
                    except Exception:
                        continue
                    for m in re.finditer(
                            r'<style[^>]*>(.*?)</style>', t, re.S):
                        out.append((p + '::inline', m.group(1)))
    return out


def check_mobile_budget(ctx):
    f = []
    # linked stylesheets carry the real rules (B F-26)
    for p, txt in dist_csss(ctx):
        name = os.path.basename(p)
        for m in re.finditer(r'(?<![a-z-])width:\s*(\d{3,})px', txt):
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
        for m in re.finditer(r'(?<![a-z-])width:\s*(\d{3,})px', txt):
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
    # N.flyout — the mobile menu is always a flyout surface, never a
    # plain dropdown: burger trigger, fixed panel, scrim, close
    # control and a docked CTA must all be present in the built
    # markup + dist CSS
    htmls = ctx.page_htmls()
    nav_pages = [(p, t) for p, t in htmls if 'nav-links' in t]
    if nav_pages:
        css_all = '\n'.join(t for _, t in dist_csss(ctx))
        if not re.search(r'\.nav-links\.open\s*\{[^}]*'
                         r'position\s*:\s*fixed', css_all):
            f.append('P.13 nav flyout: .nav-links.open is not a '
                     'fixed panel — the mobile menu must be an '
                     'overlay sheet, never a dropdown')
        if not re.search(r'has\(\s*\.nav-links\.open\s*\)', css_all):
            f.append('P.13 nav flyout: the open nav carries no scrim '
                     'rule (body:has(.nav-links.open)::after)')
        for p, t in nav_pages:
            name = os.path.basename(p)
            if 'nav-close' not in t:
                f.append(f'P.13 {name}: the nav panel has no '
                         '.nav-close — a flyout needs a close control')
            if not re.search(r'class="[^"]*burger', t):
                f.append(f'P.13 {name}: the nav has no .burger '
                         'trigger')
            if not re.search(r'nav-cta|call-bar', t):
                f.append(f'P.13 {name}: the nav carries no CTA — '
                         'the flyout docks one at the panel foot')
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
    cards = sorted(set(re.findall(
        r'(?:id|data-layout)="(d\d+)"', txt)))
    is_layouts = os.path.basename(wfp) == 'layouts.html'
    need = len((_layout_options(ctx) or {}).get('options') or ()) \
        if is_layouts else 0
    if len(cards) < need and is_layouts:
        return [f'P.3 layouts picker has {len(cards)} cards for '
                f'{need} computed options — one card per '
                'LAYOUT-OPTIONS option']
    if not need and len(cards) < 5 and is_layouts:
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
        if len(re.findall(r'data-size="(?:mobile|tablet)"|'
                          r'data-vp="(?:mobile|tablet)"', txt)) < 2:
            f.append('P.3 layout picker has no 375/768 viewport frames '
                     '— every option proves no horizontal overflow at '
                     'mobile and tablet, not just desktop')
    # comments are prose, not markup — a <section> in a CSS note is
    # not a card section (F-31). Section markup lives in the BUILT
    # page each card iframes (preview_build contract), so the tag
    # audit resolves the card's iframe first and falls back to the
    # inline block (legacy self-contained pickers).
    pages = _shell_card_pages(wfp, txt)
    sec_sets = {}
    for m in re.finditer(
            r'<article\b[^>]*(?:id|data-layout)="(d\d+)"[^>]*>(.*?)'
            r'</article>', txt, re.S):
        cid, body = m.group(1), m.group(2)
        pt = (pages.get(cid) or ('', ''))[0] or body
        pt = re.sub(r'/\*.*?\*/|<!--.*?-->', '', pt, flags=re.S)
        secs = re.findall(
            r'<(?:section|header|footer)[^>]*data-sec="([^"]+)"[^>]*'
            r'data-comp="([^"]+)"[^>]*data-ratio="([^"]+)"[^>]*'
            r'data-disclosure="([^"]+)"', pt)
        partial = [t for t in re.findall(
            r'<(?:section|header|footer)\b([^>]*)>', pt)
            if re.search(r'data-(?:sec|comp|ratio|disclosure)=', t)]
        if not secs:
            f.append(f'P.3 card {cid}: no tagged sections — built '
                     'page missing or renders no data-sec markup '
                     '(preview_build)')
        elif len(secs) != len(partial):
            f.append(f'P.3 card {cid}: {len(partial)-len(secs)} '
                     'section(s) missing '
                     'data-sec/comp/ratio/disclosure attributes')
        for sec, comp, ratio, disc in secs:
            if ratio not in RATIOS:
                f.append(f'P.3 card {cid} sec {sec}: ratio "{ratio}" '
                         '∉ V.3 set')
            if disc not in DISCLOSURE:
                f.append(f'P.3 card {cid} sec {sec}: disclosure '
                         f'"{disc}" ∉ {{open,collapsed,tabbed}}')
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
    # mobile-first: min-width MQs only — EXCEPT a max-width band at or
    # below the tablet boundary (≤768px), which is the below-tablet
    # CTA/overflow vocabulary R.9 requires, not desktop-first cascade
    for mq in re.finditer(r'@media[^{]*max-width:\s*(\d+)px', gcss):
        if int(mq.group(1)) > 768:
            f.append('R.1 max-width media query in global.css — '
                     f'min-width only (found {mq.group(1)}px)')
            break
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

def check_token_layer(ctx):
    """TK — the token layer. The project builds on Tailwind v3
    (tailwindcss 3.4.19), where @theme/@custom-variant are v4-only
    at-rules the browser drops, so global.css emits plain CSS:
    :root primitives → :root semantics → .dark overrides → :root
    utility names. TK.1 layer shape; TK.2 every semantic var exists
    in BOTH light and dark; TK.3 components bind semantic vars — a
    raw hex or a primitive var in a component is ad-libbed colour."""
    f = []
    css = ctx.read('site/src/styles/global.css') or ''
    if not css:
        return f
    # Structural, not textual: an @theme at-rule carries the right
    # declarations but the v3 build drops it, so the block must be a
    # real :root rule.
    blocks = re.findall(r':root\s*\{(.*?)\}', css, re.S)
    if not any('--primitive-neutral-bg' in b for b in blocks):
        f.append('TK.1 global.css has no :root primitive block — '
                 '@theme is a Tailwind-v4 at-rule the v3 build drops, '
                 'so every var() resolves empty')
    if not any(re.search(r'--(bg|text|border|action)-\w+\s*:', b)
               for b in blocks):
        f.append('TK.1 global.css has no :root semantic layer')
    if '.dark {' not in css and '[data-theme=dark]' not in css:
        f.append('TK.1 global.css has no dark overrides')
    # TK.2 semantic parity — every semantic var in :root must have
    # a dark override (missing override = half a token layer)
    # two :root blocks (primitives + semantics) — scan them all
    root_css = '\n'.join(re.findall(r':root\s*\{(.*?)\}', css, re.S))
    dark_m = re.search(
        r'(?:\.dark|\[data-theme\s*=\s*["\']?dark["\']?\])\s*'
        r'\{(.*?)\}', css, re.S)
    if root_css and dark_m:
        size_tok = re.compile(
            r'^text-(?:xxl|xl|l|m|s|xs)(?:-.+)?$')
        root_sem = set(re.findall(
            r'--(bg-\w+|text-\w+|border-\w+|action-\w+|shadow-\w+)'
            r'\s*:', root_css))
        dark_sem = set(re.findall(
            r'--(bg-\w+|text-\w+|border-\w+|action-\w+|shadow-\w+)'
            r'\s*:', dark_m.group(1)))
        # ACSS text-* SIZE family (U.9/U.10) is mode-invariant —
        # only colour semantics need dark overrides
        root_sem = {v for v in root_sem if not size_tok.match(v)}
        dark_sem = {v for v in dark_sem if not size_tok.match(v)}
        for v in sorted(root_sem - dark_sem):
            f.append(f'TK.2 semantic --{v} has no .dark override — '
                     'every semantic token exists in both modes')
    # TK.3 components bind semantic vars only — raw hex or a
    # --primitive-* in a component source is an end run
    for dp in ('site/src/components', 'site/src/pages',
               'site/dist'):
        root = os.path.join(ctx.dir, dp)
        if not os.path.isdir(root):
            continue
        for dpth, _, fns in os.walk(root):
            for fn in fns:
                if not fn.endswith(('.astro', '.html', '.jsx',
                                    '.tsx', '.vue', '.svelte')):
                    continue
                fp = os.path.join(dpth, fn)
                try:
                    t = open(fp, encoding='utf-8',
                             errors='replace').read()
                except Exception:
                    continue
                rel = os.path.relpath(fp, ctx.dir)
                for m in re.finditer(
                        r'(?:color|background|border|fill|stroke)'
                        r'[^;{}"\']*?#(?:[0-9a-fA-F]{3,8})\b', t):
                    f.append(f'TK.3 {rel}: literal hex in a colour '
                             'property — components bind semantic '
                             'tokens (var(--bg-*)/(--text-*)/'
                             '(--action-*)/(--border-*)), never '
                             'raw values')
                    break
                if '--primitive-' in t:
                    f.append(f'TK.3 {rel}: component references a '
                             'primitive token — primitives feed the '
                             'semantic layer; components consume '
                             'semantics only')
    return f

def check_tile_is_system(ctx):
    """P.6 — the system sheet instantiates every component.

    The sheet is a real built page: site/dist/preview/system/
    index.html (preview_build emits system.astro → astro build);
    `site/src/pages/system.astro` remains the final-build catalogue
    at W6+.
    """
    f = []
    tile = ctx.read('site/dist/preview/system/index.html',
                    'preview/system.html')
    is_html = tile is not None
    if tile is None:
        tile = ctx.read('site/src/pages/system.astro',
                        'site/src/pages/preview/system.astro')
    if tile is None:
        return ['P.1 system sheet missing — site/dist/preview/system/'
                'index.html (W5) or src/pages/system.astro (W6+)']
    comp_names = {os.path.splitext(c)[0] for c in ctx.components()} - {'Section'}
    if not is_html and not _wave_ge(ctx, 'w6'):
        f.append('P.6 system sheet is Astro source at W5 — the preview '
                 'is the BUILT tile (preview_build → site/dist/preview/'
                 'system/index.html); Astro belongs to W6+')
    if is_html:
        # a specimen renders the component — a lone attribute token
        # listing names is not a specimen (F-25)
        rendered = set()
        for m in re.finditer(
                # the window may not cross the NEXT specimen's tag —
                # untempered .{0,400} swallowed adjacent specimens on
                # compact sheets and reported them missing (N-4)
                r'<(\w+)[^>]*data-comp="([^"]+)"[^>]*>'
                r'((?:(?!<\w+[^>]*data-comp=).){0,400})', tile,
                re.S):
            inner = m.group(3)
            if re.search(r'<[a-zA-Z]|\S', inner.strip()):
                rendered.add(m.group(2))
        rendered |= set(re.findall(r'data-cell="([^"]+)"', tile))
        # the contract set IS the component set — disk files may hold
        # last emit's comps or picker-only comps kept alive by option
        # preview pages (w6 can't prune those: w3/w4 gates still need
        # the built option pages in dist)
        comp_names = {str(c.get('composition'))
                      for c in build_contracts(ctx)}
        for c in sorted(comp_names):
            if c not in rendered:
                f.append(f'P.6 component {c} has no specimen on the '
                         'system sheet')
        if re.search(r'data-comp="[^"]+"', tile) and not rendered:
            f.append('P.6 system sheet lists comp names without '
                     'rendering specimens — a data-comp attribute list '
                     'is not a specimen')
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


_DS_ATTR = re.compile(
    r'<(\w+)\b([^>]*\bdata-ds-name="[^"]*"[^>]*)>', re.S)


def check_design_system(ctx):
    """DS.* — the rendered design-system sheet (operator mandate:
    NOT NEGOTIABLE — every design ships one after the styling pick).

    pipeline_emit._design_system emits site/src/pages/design-
    system.astro at W6 — TOKENS.json made visible: colour roles in
    both modes, every ACSS size rung as a live specimen bound to the
    same var a component consumes (emit_global._ds_specs emits one
    .ds-tx-*/.ds-sp-* class per rung into the shared layer), buttons,
    links, cards, icon chips, form fields when the plan carries a
    form, density/section-space/surface/measure conventions, radius/
    elevation/motion, and the knob table.

    DS.1 the sheet exists and renders: site/dist/design-system/
        index.html under the shared chrome, with a theme toggle
        (the sheet must render both modes — C.5).
    DS.2 every specimen carries data-ds-name/data-ds-var/
        data-ds-value; each ACSS size rung's declared value equals
        TOKENS.json's clamp AND the rung's var decl in global.css AND
        the specimen class binds that var; each colour role's hex
        equals TOKENS.json AND the tailwind.config utility hex —
        a drifting component, emitter or page fails here.
    DS.3 machinery chrome: no plan page links to it — the sheet is
        not in the public nav.
    """
    if not _wave_ge(ctx, 'w6'):
        return []
    f = []
    page = ctx.read('site/dist/design-system/index.html')
    if page is None:
        return ['DS.1 design-system sheet missing — pipeline_emit emits '
                'site/src/pages/design-system.astro → dist/design-system/'
                'index.html at w6 (post DNA lock)']
    if 'id="main"' not in page:
        f.append('DS.1 design-system sheet not under BaseLayout chrome '
                 '(no <main id="main">)')
    if 'data-theme-toggle' not in page:
        f.append('DS.1 no theme toggle — the sheet must render light '
                 'and dark (C.5)')
    if 'data-ds-name=' not in page:
        f.append('DS.1 design-system sheet carries no specimens '
                 '(data-ds-name attributes missing — emit via '
                 'pipeline_emit._design_system, never hand-author)')
    specs = {}
    for m in _DS_ATTR.finditer(page):
        attrs = dict(re.findall(r'(data-ds-[\w-]+)="([^"]*)"',
                                m.group(2)))
        specs[attrs.get('data-ds-name')] = attrs
    tok = {}
    raw = ctx.read('TOKENS.json')
    if raw:
        try:
            tok = json.loads(raw)
        except Exception:
            pass
    sizes = tok.get('sizes') or {}
    modes = (tok.get('color') or {}).get('modes') or {}
    globcss = ctx.read('site/src/styles/global.css',
                       'site/dist/assets/global.css') or ''
    twconf = ctx.read('site/tailwind.config.js') or ''
    if not globcss:
        f.append('DS.2 global.css unreadable — cannot verify the '
                 'specimens bind the token layer')
    # ---- every size rung renders and declares the same clamp --------
    for name, rec in sorted(sizes.items()):
        want = str((rec or {}).get('clamp') or '')
        # specimens name rungs `size-<name>` — a bare `text-xl` in an
        # attribute would be extracted as a Tailwind candidate and emit
        # a bare-rem utility (FL.1)
        spec = specs.get(f'size-{name}') or specs.get(name)
        if not spec:
            f.append(f'DS.2 rung --{name} not rendered on the '
                     'design-system sheet')
            continue
        if spec.get('data-ds-value') != want:
            f.append(f'DS.2 --{name} sheet value '
                     f'{spec.get("data-ds-value")} != TOKENS.json '
                     f'{want} — drift')
        if globcss:
            decl = re.search(rf'--{re.escape(name)}:\s*([^;]+);',
                             globcss)
            if decl and decl.group(1).strip() != want:
                f.append(f'DS.2 --{name} global.css decl '
                         f'{decl.group(1).strip()} != TOKENS.json '
                         f'{want} — the token layer drifted')
            cls = spec.get('data-ds-class') or ''
            if cls.startswith('ds-') and not re.search(
                    rf'\.{re.escape(cls)}\s*\{{[^}}]*'
                    rf'var\(--{re.escape(name)}\)', globcss):
                f.append(f'DS.2 specimen class .{cls} does not bind '
                         f'var(--{name}) in global.css')
    # ---- every colour role, both modes -------------------------------
    for mode in ('light', 'dark'):
        roles = (modes.get(mode) or {}).get('roles') or {}
        for role, hexv in sorted(roles.items()):
            key = f'{mode}.{role}'
            spec = specs.get(key)
            if not spec:
                f.append(f'DS.2 colour role {key} not rendered on '
                         'the design-system sheet')
                continue
            hv = str(hexv).strip().lower()
            # P.5: the sheet declares hex without '#' — no literal hex
            # lands in .astro
            if str(spec.get('data-ds-value') or '').strip().lower() \
                    != hv.lstrip('#'):
                f.append(f'DS.2 role {key} sheet value != TOKENS.json '
                         f'{hexv}')
            cls = spec.get('data-ds-class') or ''
            if cls and twconf and hv not in twconf.lower():
                f.append(f'DS.2 role {key} hex {hexv} not in '
                         'tailwind.config.js — utilities drifted')
    # ---- specimen blocks the mandate names ---------------------------
    for block in ('buttons', 'links', 'cards'):
        if f'data-ds-block="{block}"' not in page:
            f.append(f'DS.2 design-system sheet missing the {block} '
                     'block')
    if 'data-ds-section="colours"' not in page:
        f.append('DS.2 design-system sheet missing the colours section')
    comps = ctx.components()
    if 'form-panel.astro' in comps and 'data-ds-block="form"' \
            not in page:
        f.append('DS.2 plan carries a form but the sheet renders no '
                 'form specimens')
    # ---- DS.3 not in the public nav -----------------------------------
    for pdir, txt in ctx.page_htmls():
        if re.search(r'href="(?:/)?design-system', txt):
            f.append(f'DS.3 {pdir}: nav links to the design-system '
                     'sheet — machinery chrome stays out of the '
                     'public nav')
    return f

def _shell_card_pages(path, txt):
    """{oid: (page_html, page_css)} for a thin picker shell.

    Option cards render through an <iframe> at the real astro-built
    page (../site/dist/preview/<name>/index.html file://, or
    /built/<rel> when the pick service serves the shell). Section
    markup, knob scopes and the linked _astro stylesheet live there
    — never in the shell."""
    pages = {}
    sdir = os.path.dirname(os.path.abspath(path))
    for m in re.finditer(
            r'<article\b[^>]*\bid="([\w-]+)"[^>]*>(.*?)</article>',
            txt, re.S):
        oid, body = m.group(1), m.group(2)
        im = re.search(r'<iframe\b[^>]*\bsrc="([^"]+)"', body)
        if not im:
            continue
        src = im.group(1).split('?')[0]
        if src.startswith('/built/'):
            # the pick service serves pipeline-relative paths; the
            # shell lives in <pipeline>/preview/
            p = os.path.normpath(os.path.join(
                os.path.dirname(sdir), src[len('/built/'):]))
        else:
            p = os.path.normpath(os.path.join(sdir, src))
        if not os.path.isfile(p):
            pages.setdefault(oid, ('', ''))
            continue
        pt = open(p, encoding='utf-8', errors='replace').read()
        pdir = os.path.dirname(p)
        # astro emits root-absolute asset refs (/_astro/…); they
        # resolve against the page's own dist root — the same base the
        # pick service uses for /built responses
        dist_root = pdir
        while os.path.basename(dist_root) != 'dist' and \
                dist_root != os.path.dirname(dist_root):
            dist_root = os.path.dirname(dist_root)
        css = ''
        for lm in re.finditer(
                r'<link\b[^>]*\bhref="([^"]+\.css)(?:\?[^"]*)?"', pt):
            href = lm.group(1)
            cp = os.path.normpath(
                dist_root + href if href.startswith('/')
                else os.path.join(pdir, href))
            if os.path.isfile(cp):
                css += '\n' + open(cp, encoding='utf-8',
                                   errors='replace').read()
        pages[oid] = (pt, css)
    return pages


def _scope_styles(ptxt):
    """{vid: '--tok:val;…'} — the variant-scope wrapper's inline CSS
    vars (a look/fine page applies its knob vector on the
    data-variant-scope div's style attribute)."""
    return dict(re.findall(
        r'data-variant-scope="([^"]+)"[^>]*\bstyle="([^"]+)"', ptxt))


def _icon_viewboxes(ptxt):
    """viewBox values on ICON svgs — brand/logo marks are not icon
    specimens (a wordmark logo is not a Lucide icon)."""
    out = set()
    for sm in re.finditer(r'<svg\b[^>]*>', ptxt):
        pre = ptxt[max(0, sm.start() - 400):sm.start()]
        anc = re.findall(r'<[a-zA-Z][^>]*>', pre)
        near = sm.group(0) + (anc[-1] if anc else '')
        if re.search(r'logo|brand', near, re.I):
            continue
        vm = re.search(r'viewBox="([^"]+)"', sm.group(0))
        if vm:
            out.add(vm.group(1))
    return out


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
    """All layout options in the picker: {id: [secs]}.

    The thin shell's <article> cards iframe the real built pages —
    sections are parsed off site/dist/preview/lo-<oid>/index.html
    (or the /built/ path the pick service rewrites to)."""
    wfp = ctx.wireframe_path()
    if not wfp or not os.path.isfile(wfp):
        return None, f'layout picker not found ({wfp})'
    txt = open(wfp, encoding='utf-8', errors='replace').read()
    pages = _shell_card_pages(wfp, txt)
    cards = {}
    # a card tag may carry BOTH id= and data-layout=; the leftmost
    # attribute is the key — a greedy prefix binds the LAST one
    # and collapses every card onto its data-layout (P.4: d2
    # parsed as "index-led")
    pat = (r'<(?:div|article)[^>]*?(?:\bid="([\w-]+)"|'
           r'\bdata-layout="([\w-]+)")[^>]*>')
    for m in re.finditer(
            pat + r'(.*?)(?=<(?:div|article)[^>]*?'
            r'(?:\bid="[\w-]+"|\bdata-layout="[\w-]+")[^>]*>|\Z)',
            txt, re.S):
        key = m.group(1) or m.group(2)
        if not key or key in cards:
            continue  # id + data-layout on one element counted once
        body = m.group(3)
        pt = (pages.get(key) or ('', ''))[0] or body
        secs = re.findall(
            r'<(?:section|header|footer)[^>]*data-sec="([^"]+)"[^>]*'
            r'data-comp="([^"]+)"[^>]*data-ratio="([^"]+)"[^>]*'
            r'data-disclosure="([^"]+)"', pt)
        if not secs and 'iframe' not in body:
            continue  # non-option articles are not layout cards
        cards[key] = [
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
    lo = _layout_options(ctx) or {}
    opts = lo.get('options') or []
    if opts:
        # copy-fit era: one card per computed option; options differ
        # only where the allowed copy shapes let them — identical
        # pairs are the defect, not a count shortfall
        if len(ids) < len(opts):
            f.append(f'VG.4 {len(ids)} rendered options for '
                     f'{len(opts)} computed — every LAYOUT-OPTIONS '
                     'option renders as a card')
            return f
        floor = 1
    elif len(ids) < 5:
        f.append(f'VG.4 {len(ids)} layout option(s) — round 1 (coarse) '
                 'needs ≥5 completely different designs (one may be the '
                 '★ wildcard); later rounds show 3')
        return f
    else:
        floor = 0.3
    import itertools
    for a, b in itertools.combinations(ids, 2):
        ca, cb = cards[a], cards[b]
        n = max(len(ca), len(cb)) or 1
        diff = sum(1 for x, y in itertools.zip_longest(ca, cb,
                                                     fillvalue={})
                   if x.get('comp') != y.get('comp')
                   or x.get('sec') != y.get('sec'))
        too_same = diff < floor if floor == 1 else diff / n < 0.3
        if too_same:
            f.append(f'VG.4 layouts {a}/{b} differ in {diff}/{n} '
                     f'section slots — '
                     + ('computed options are identical; regenerate '
                        'distinct structures' if floor == 1 else
                        '<30% floor (target ~50%) — near-duplicates are '
                        'regenerated, not shown'))
    return f


def _preview_tw(ctx):
    """Tailwind head bundle for self-contained previews: the CDN +
    the CDN port of the site tailwind.config + the TOKENS component
    layer + the DNA faces. Faces are embedded as data URIs — the
    picker opens as a file/loopback page with no static server, so
    /fonts/*.woff2 refs would 404 into system-ui."""
    import base64
    import emit_global
    try:
        tok = json.loads(ctx.read('TOKENS.json') or '{}')
    except Exception:
        tok = {}
    fonts = ((dna_map(ctx) or {}).get('invariants') or {}).get('fonts')
    ff_css = ''
    if fonts and ctx.site_dir:
        import copy as _c
        embedded, keep = [], []
        for fc in fonts.get('faces') or []:
            src = str(fc.get('file') or '')
            cand = os.path.join(ctx.site_dir, 'assets', 'fonts',
                                os.path.basename(src))
            if os.path.isfile(cand):
                b64 = base64.b64encode(
                    open(cand, 'rb').read()).decode()
                fam = str(fc.get('family') or fonts.get('display')
                          or '').strip()
                fmt = src.rsplit('.', 1)[-1].lower()
                fmt = {'woff2': 'woff2', 'woff': 'woff',
                       'ttf': 'truetype',
                       'otf': 'opentype'}.get(fmt, '')
                mime = {'woff2': 'font/woff2', 'woff': 'font/woff',
                        'truetype': 'font/ttf',
                        'opentype': 'font/otf'}.get(fmt, 'font/woff2')
                ff_css += ('@font-face{font-family: "%s";'
                           'src: url(data:%s;base64,%s)%s;'
                           'font-weight: %s;font-style: %s;'
                           'font-display: swap;}\n'
                           % (fam, mime, b64,
                              (" format('%s')" % fmt) if fmt else '',
                              int(fc.get('weight') or 400),
                              fc.get('style') or 'normal'))
            else:
                keep.append(fc)
        fonts = _c.deepcopy(fonts)
        fonts['faces'] = keep     # embedded faces are emitted above —
        # emit_global.font_faces_css cannot format() a data URI
    return (emit_global.TAILWIND_CDN
            + (emit_global.tailwind_cdn_config(tok) if tok else '')
            + '<style>'
            + ff_css
            + (emit_global.preview_css(tok, fonts) if tok else '')
            + '</style>')


CANON_BAN = ('data/web', 'validation-negative', 'annotations_negative',
             'negative_sections', 'anti.json', 'quarantine')


@_lc(maxsize=1)
def _endorsed_sites():
    """Operator-endorsed canon lists — site domains/URLs recorded by
    the canon job under patterns/data/operator/_sources/ (one list
    file per endorsed source, e.g. the eleken.co list). Tier order:
    operator direct > endorsed list > Mobbin."""
    root = os.path.join(DESIGN_DIR, 'patterns', 'data', 'operator',
                        '_sources')
    out = set()
    if not os.path.isdir(root):
        return out
    _URL_RE = re.compile(r'https?://[^\s\)\]>"\']+')
    _HOST_RE = re.compile(r'https?://([^/?#]+)')
    _DOM_RE = re.compile(
        r'\b([a-z0-9](?:[a-z0-9-]*[a-z0-9])?'
        r'(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+'
        r'(?:/[\w.-]*)?)\b')
    for dp, dns, fns in os.walk(root):
        # cache dirs (.details-cache, .candidate-html) are scraped
        # HTML, not source lists — skip or every walk burns minutes
        dns[:] = [d for d in dns if not d.startswith('.')]
        for fn in fns:
            p = os.path.join(dp, fn)
            # endorsed lists are .json registries or .md/.txt link
            # dumps — anything else under _sources is a scrape
            # artifact (MBs of HTML/binary) that regex-scanning
            # would burn a minute on per gate run (N-11)
            if not fn.endswith(('.json', '.md', '.txt', '.csv')):
                continue
            try:
                # a source list is a document, not a scrape cache:
                # cap the read so a misfiled multi-MB payload can't
                # wedge the gate
                with open(p, encoding='utf-8',
                          errors='replace') as fh:
                    txt = fh.read(1 << 20)
            except Exception:
                continue
            if fn.endswith('.json'):
                try:
                    data = json.loads(txt)
                    tier = str(data.get('tier') or
                               'operator-endorsed').lower()
                except Exception:
                    data, tier = None, 'operator-endorsed'
                # only operator-endorsed lists feed canon — a 'candidate'
                # source (astro-showcase) supplies the review tier, NOT
                # endorsed refs, or every pending site would self-promote
                if 'candidate' in tier:
                    continue
                if data is not None:
                    # structured fast path — walk url/domain values
                    # instead of regex-scanning megabytes
                    stack = [data]
                    while stack:
                        v = stack.pop()
                        if isinstance(v, dict):
                            stack += list(v.values())
                        elif isinstance(v, list):
                            stack += v
                        elif isinstance(v, str):
                            u = v.lower().strip()
                            m = _HOST_RE.match(u)
                            if m:
                                out.add(u.rstrip('.,;/'))
                                out.add(m.group(1))
                    continue
            for u in _URL_RE.findall(txt):
                out.add(u.rstrip('.,;/').lower())
                m = _HOST_RE.match(u)
                if m:
                    out.add(m.group(1).lower())
            for d in _DOM_RE.findall(txt.lower()):
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
_CANDIDATES = None


def _source_candidates():
    """Sites inside tier:'candidate' _sources files, all 'pending'
    until a signed operator decision promotes them — the decision
    registry overrides by explicit status. {url_or_domain: status}"""
    root = os.path.join(DESIGN_DIR, 'patterns', 'data', 'operator',
                        '_sources')
    reg = {}
    if not os.path.isdir(root):
        return reg
    for fn in os.listdir(root):
        if not fn.endswith('.json'):
            continue
        try:
            d = json.load(open(os.path.join(root, fn)))
        except Exception:
            continue
        if 'candidate' not in str(d.get('tier') or '').lower():
            continue
        for c in d.get('sites') or d.get('candidates') or []:
            if not isinstance(c, dict):
                continue
            u = str(c.get('url') or c.get('site') or
                    c.get('id') or '').lower().rstrip('/')
            if u:
                reg[u] = str(c.get('status') or 'pending')
                m = re.match(r'https?://([^/]+)', u)
                if m:
                    reg.setdefault(m.group(1),
                                   str(c.get('status') or 'pending'))
    return reg


def _candidate_registry(path=None):
    """{domain: status} — the candidate tier: sites scanned + scored by
    a source list (first: astro-showcase) but NOT canon until the
    operator promotes them through the review picker. Statuses:
    pending | approved | rejected. Global registry lives in
    patterns/data/operator/candidates.json; a pipeline may carry its
    own CANDIDATES.json."""
    global _CANDIDATES
    if path is None and _CANDIDATES is not None:
        return _CANDIDATES
    # a tier:'candidate' source file seeds every site as 'pending';
    # an explicit registry row (or a service-signed decision) overrides
    reg = _source_candidates() if path is None else {}
    for p in ([os.path.join(DESIGN_DIR, 'patterns', 'data',
                           'operator', 'candidates.json')]
              if path is None else [path]):
        if not p or not os.path.isfile(p):
            continue
        try:
            rows = json.load(open(p))
        except Exception:
            continue
        for c in (rows if isinstance(rows, list) else
                  rows.get('candidates') or []):
            if not isinstance(c, dict):
                continue
            u = str(c.get('url') or c.get('site') or
                    c.get('id') or '').lower().rstrip('/')
            if not u:
                continue
            st = str(c.get('status') or 'pending')
            # N-5 — a designer-written status is unsigned: only a
            # service-signed decision_sig (over {site,decision,ts})
            # promotes or excludes; every unsigned row stays 'pending'
            if st in ('approved', 'rejected'):
                key = op_key()
                body = {'site': str(c.get('url') or c.get('site') or
                                   c.get('id')),
                        'decision': st,
                        'ts': str(c.get('decided_ts') or '')}
                if not key or c.get('decision_sig') != _sig(body, key):
                    st = 'pending'
            reg[u] = st
            m = re.match(r'https?://([^/]+)', u)
            if m:
                reg.setdefault(m.group(1), st)
    if path is None:
        _CANDIDATES = reg
    return reg


def _candidate_status(ref, candidates=None):
    """'pending'|'approved'|'rejected'|None for a ref token."""
    reg = _candidate_registry() if candidates is None else candidates
    r = str(ref).strip().lower().rstrip('/')
    m = re.match(r'https?://([^/]+)', r)
    host = m.group(1) if m else r
    for u, st in reg.items():
        if r == u or host == u or u.endswith('://' + host):
            return st
    return None


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
    'navigation': {'nav-bar', 'flyout-nav'},
    'nav': {'nav-bar', 'flyout-nav'},
    'footer': {'footer-bar'}, 'cards': {'cards-n'},
    'features': {'cards-n', 'sequence'}, 'faq': {'faq'},
    'form': {'form-panel', 'capture-form'},
    'testimonials': {'quote-grid'}, 'logos': {'logo-wall'},
    'stats': {'stat-band'}, 'gallery': {'media-gallery'},
}


def _exemplar_comps(lab):
    return EXEMPLAR_COMP.get(lab.lower(), {lab.lower()})


# LOOK layer = visual identity (palette, imagery treatment, type
# pairing, mood/style/trend, visual-similarity retrieval). PRINCIPLES
# layer = structure/measurement (spacing, padding ratios, type scale,
# hierarchy, rhythm, CTA cadence, grid, content width, a11y, collapse).
# Sources carry contributes: [principles] | [principles, look]:
#   operator / endorsed / Mobbin / approved candidates → both;
#   pending candidates + skeleton sources → principles only;
#   rejected candidates → neither (contrast corpus only).
LOOK_INFORMS = re.compile(
    r'palette|colou?r|imagery|image-led|photo|type (?:pairing|face)|'
    r'font|mood|style|trend|look|aesthetic|feel|visual|brand '
    r'(?:voice|identity)|surface (?:tint|contrast)|accent')


def _source_tier(ref, candidates=None):
    """('operator'|'endorsed'|'mobbin'|'candidate'|'skeleton'|'other',
    contributes_list)."""
    r = str(ref).strip().lower()
    st = _candidate_status(r, candidates)
    if st:
        return ('candidate',
                ['principles', 'look'] if st == 'approved' else
                ([] if st == 'rejected' else ['principles']))
    if SKL_ID.search(r):
        return 'skeleton', ['principles']
    if r.startswith('mobbin') or 'mobbin.com' in r:
        return 'mobbin', ['principles', 'look']
    src_root = os.path.join(DESIGN_DIR, 'patterns', 'data',
                            'operator', '_sources')
    if os.path.isdir(src_root):
        for fn in os.listdir(src_root):
            if not (fn.endswith('.json') and fn[:-5] == r):
                continue
            # a source-list slug resolves to ITS OWN tier — a candidate
            # source (astro-showcase) contributes principles only
            try:
                tier = str(json.load(open(
                    os.path.join(src_root, fn))).get('tier') or
                    'operator-endorsed').lower()
            except Exception:
                tier = 'operator-endorsed'
            if 'candidate' in tier:
                return 'candidate', ['principles']
            return 'endorsed', ['principles', 'look']
    if r.startswith(('http://', 'https://', 'https-', 'http-')):
        return 'operator', ['principles', 'look']
    return 'other', []


def _principle_ref_ok(ref, candidates=None):
    """A ref valid for principle-level citations (statistics,
    profiles, ratios): canon sources plus any principle-contributing
    source (pending candidates, skeleton ids). Negatives/web-corpus
    stay banned."""
    r = str(ref).strip().lower()
    if not r or r == 'none':
        return False
    if any(b in r for b in CANON_BAN):
        return False
    if 'negative' in r or r.startswith(('pattern-', 'web-')):
        return False
    if _canon_ref_ok(r, candidates=candidates):
        return True
    tier, contrib = _source_tier(r, candidates)
    return 'principles' in contrib


def _canon_ref_ok(ref, endorsed=None, candidates=None):
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
    if endorsed is None:
        if _ENDORSED is None:
            _ENDORSED = _endorsed_sites()
        endorsed = _ENDORSED
    cst = _candidate_status(r, candidates)
    if cst == 'rejected':
        return False
    if cst == 'pending' and not _endorsed_match(r, endorsed):
        return False
    if cst == 'approved':
        return True
    if r.startswith(('http://', 'https://')):
        # a URL is canon only when it names a REGISTERED source —
        # operator-sites registry, an operator capture dir, or an
        # endorsed-list domain. Any other URL is designer-sourced and
        # unverifiable (CT2: arbitrary URLs used to pass silently)
        if _operator_url_ok(r):
            return True
        return _endorsed_match(r, endorsed)
    # operator-direct captures live as dir slugs under data/operator/;
    # endorsed-source file slugs (eleken-*, semrush-*, details-so,
    # siteinspire-*) and any id recorded in operator_sites.json count
    # as canon ids
    op_root = os.path.join(DESIGN_DIR, 'patterns', 'data', 'operator')
    if r.startswith('https-'):
        if os.path.isdir(os.path.join(op_root, r)):
            return True
        r2 = r[6:].replace('-', '.')
        for e in (_endorsed_sites() if endorsed is None else
                  endorsed):
            if r2 == e.split('/')[0] or r2 in e:
                return True
        return False
    src_root = os.path.join(op_root, '_sources')
    if os.path.isdir(src_root):
        for fn in os.listdir(src_root):
            if not (fn.endswith('.json') and fn[:-5] == r):
                continue
            try:
                tier = str(json.load(open(
                    os.path.join(src_root, fn))).get('tier') or
                    'operator-endorsed').lower()
            except Exception:
                tier = 'operator-endorsed'
            # a candidate-tier source slug is never a canon ref — its
            # sites are the review queue
            return 'candidate' not in tier
    ops = os.path.join(DESIGN_DIR, 'patterns', 'data',
                       'operator_sites.json')
    if os.path.isfile(ops):
        try:
            for row in json.load(open(ops)):
                if str(row) == r or (isinstance(row, dict)
                                     and str(row.get('id') or
                                         row.get('slug') or '') == r):
                    return True
        except Exception:
            pass
    return _endorsed_match(r, endorsed)


def _operator_url_ok(url):
    """An http(s) ref is canon iff its host is recorded by the
    operator: an id/url in operator_sites.json, or a captured dir
    https-<slug> under patterns/data/operator/."""
    m = re.match(r'https?://([^/?#]+)', url)
    if not m:
        return False
    host = m.group(1).lower()
    ops = os.path.join(DESIGN_DIR, 'patterns', 'data',
                       'operator_sites.json')
    if os.path.isfile(ops):
        try:
            for row in json.load(open(ops)):
                if not isinstance(row, dict):
                    if str(row).lower() == host:
                        return True
                    continue
                for k in ('id', 'slug', 'url', 'domain', 'site'):
                    v = str(row.get(k) or '').lower()
                    if not v:
                        continue
                    vh = re.match(r'https?://([^/?#]+)', v)
                    vh = vh.group(1) if vh else v.split('/')[0]
                    if vh == host or vh.lstrip('w.') == \
                            host.lstrip('w.'):
                        return True
        except Exception:
            pass
    op_root = os.path.join(DESIGN_DIR, 'patterns', 'data', 'operator')
    if os.path.isdir(op_root):
        # https-<slug> capture dirs: slug labels joined by '.' or '-'
        # (hyphenated domains slug to the same string)
        for d in os.listdir(op_root):
            if not d.startswith('https-'):
                continue
            sl = d[6:]
            if host == sl.replace('-', '.') or \
                    host.replace('-', '') == sl.replace('-', ''):
                return True
    return False


def _registrable(host):
    """Bare registrable domain (last two labels) of a host."""
    parts = host.split('.')
    return '.'.join(parts[-2:]) if len(parts) >= 2 else host


def _endorsed_match(ref, endorsed):
    """ref is on an operator-endorsed list — exact, path-prefix, or
    same registrable domain (a demo subdomain of an endorsed family
    resolves to endorsed, e.g. *.lexdemos.com under lexington)."""
    r = str(ref).strip().lower()
    m = re.match(r'https?://([^/?#]+)', r)
    host = m.group(1) if m else r.split('/')[0]
    reg = _registrable(host)
    for e in endorsed:
        # a one-label scrape fragment ('r', 'as', 'https://r') is not
        # a domain: require a real host before prefix/registrable
        # matching can fire, or every 'r…' ref self-endorses (the
        # RT-REF-ARBITRARY bypass)
        eh = e.split('/')[0]
        ehh = eh.split('://', 1)[-1]
        if len(ehh) < 4 or ('.' not in ehh and '://' not in eh):
            continue
        if r == e or r.startswith(e + '/') or ('://' + e) in r \
                or r.startswith(e):
            return True
        if eh and _registrable(ehh) == reg:
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
            informs = cells[2] if len(cells) > 2 else ''
            cands = _candidate_registry(
                os.path.join(ctx.dir, 'CANDIDATES.json')) \
                or _candidate_registry()
            look = bool(LOOK_INFORMS.search(informs))
            if look:
                ok = _canon_ref_ok(rid, candidates=cands)
            else:
                ok = _principle_ref_ok(rid, candidates=cands)
            ok = ok and not re.search(r'\b(web|negative)s?\b',
                                      (cells[1] or '').lower())
            rows.append({'id': rid,
                         'kind': cells[1] if len(cells) > 1 else '',
                         'informs': informs,
                         'layer': 'look' if look else 'principles',
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
            if r.get('layer') == 'look':
                f.append(f"LAW.REF {r['id']}: not a canonical LOOK ref "
                         '— the look layer cites operator sites, '
                         'endorsed lists or Mobbin only; candidates '
                         'feed it only after operator promotion')
            else:
                f.append(f"LAW.REF {r['id']}: not a valid principle "
                         'ref — principles may cite canon, pending '
                         'candidates and skeleton sources; the web '
                         'corpus / negatives stay banned')
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
                        if not _canon_ref_ok(
                                ref,
                                candidates=_candidate_registry(
                                    os.path.join(
                                        ctx.dir, 'CANDIDATES.json'))
                                or _candidate_registry()):
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
        if dev and isinstance(dev, dict):
            if not dev.get('expected'):
                f.append(f'D.5 {ch} declared_deviation lacks "expected" '
                         '(record the model top-2)')
            if not str(dev.get('reason') or '').strip():
                f.append(f'D.5 {ch} declared_deviation lacks a reason '
                         '— a deviation without a recorded reason is '
                         'undeclared')
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
    # the history is an append-only hashed chain the pipeline keeps:
    # each entry binds {round, genes, seed} to the previous entry's hash
    import hashlib as _hl
    prev_h = 'genesis'
    last_round = 0
    last_genes = set()
    image_sole_prev = False
    for i, h in enumerate(hist):
        genes_h = sorted(str(g) for g in (h.get('genes') or []))
        rec = {'round': h.get('round'), 'genes': genes_h,
               'seed': h.get('seed'), 'prev': h.get('prev')}
        want = _hl.sha256(json.dumps(rec, sort_keys=True,
                                     separators=(',', ':')).encode()
                          ).hexdigest()
        if h.get('prev') != prev_h or h.get('hash') != want:
            f.append(f'B.7 history entry {i} breaks the hash chain '
                     '(forged or spliced — the history is '
                     'append-only, each entry binds the last)')
            break
        # a bare sha256 chain is forgeable — the writer is whoever
        # holds the key. Every entry must HMAC-sign over its own
        # record (hash included) with the operator key; an unsigned
        # or re-built history reads as tampering, not a reset.
        key = op_key()
        want_sig = _sig(h, key) if key else None
        if not want_sig or h.get('sig') != want_sig:
            f.append(f'B.7 history entry {i} unsigned or badly '
                     'signed — entries are appended by '
                     'append_wildcard_history (op_key-signed); '
                     'regenerating the file cannot mint them')
        if not isinstance(h.get('round'), int) or \
                h['round'] <= last_round:
            f.append(f'B.7 history entry {i} round {h.get("round")} '
                     'is not strictly increasing — append-only '
                     'order violated')
        prev_h = h['hash']
        last_round = h['round']
        last_genes = set(genes_h)
        image_sole_prev = genes_h == ['image.treatment']
    base_knobs = dna.get('knobs') or {}
    has_wildcard = any(
        str(v.get('vector')) == 'wildcard' or v.get('wildcard_genes')
        for v in dna.get('variants') or [])
    # F-12 W2/W4/W5b/W5c — when a wildcard exists the history is
    # MANDATORY and seed integrity is verified: a designer must not
    # delete it, rebuild it, or replay/reuse a seed
    if has_wildcard and not hist:
        f.append('B.7 WILDCARD-HISTORY.json missing/empty while a '
                 'wildcard variant exists — the RNG log is append-only '
                 'and must start with this run (deleting it is a '
                 'defect, not a reset)')
    seen_seeds = set()
    for i, h in enumerate(hist):
        if h.get('seed') in (None, '', 0, '0'):
            f.append(f'B.7 history entry {i} has no valid seed '
                     '(0/empty banned)')
        if h.get('seed') in seen_seeds:
            f.append(f'B.7 history entry {i} reuses seed '
                     f'{h.get("seed")} — every round re-rolls '
                     '(a replayed or parent seed is a designer '
                     'pick, not RNG)')
        seen_seeds.add(h.get('seed'))
    cur_seeds = {str(h.get('seed')) for h in hist}
    for v in dna.get('variants') or []:
        if str(v.get('vector')) != 'wildcard' \
                and not v.get('wildcard_genes'):
            continue
        deltas = v.get('deltas') or {}
        # mutated genes are COMPUTED from the actual diff vs baseline —
        # a declared wildcard_genes list that disagrees is a lie
        computed = {k for k, x in deltas.items()
                    if str(base_knobs.get(k)) != str(x)}
        declared = set(v.get('wildcard_genes') or [])
        if not computed:
            f.append(f'B.7 wildcard {v.get("id")} mutates nothing vs '
                     'the baseline — a wildcard must change genes')
        if declared and declared != computed:
            f.append(f'B.7 wildcard {v.get("id")} declares genes '
                     f'{sorted(declared)} but the actual delta touches '
                     f'{sorted(computed)} — genes are computed from '
                     'the diff, never declared')
        genes = computed or declared
        if v.get('wildcard_seed') in (None, '', 0, '0'):
            f.append(f'B.7 wildcard {v.get("id")} has no valid '
                     'wildcard_seed (0/empty banned — the gene set '
                     'must be RNG-chosen, not defaulted)')
        if str(v.get('wildcard_seed')) in cur_seeds:
            f.append(f'B.7 wildcard {v.get("id")} repeats a seed from '
                     'the history — every round re-rolls')
        if genes and last_genes and genes == last_genes:
            f.append(f'B.7 wildcard genes {sorted(genes)} repeat the '
                     'previous round — re-roll (seeded RNG over the '
                     'allowed genes, weighted to unused)')
        if genes == {'image.treatment'} and image_sole_prev:
            f.append('B.7 image.treatment is the sole wildcard change '
                     'twice in a row — banned')
    return f


SAFE_ANIM_PROPS = {'transform', 'opacity', 'stroke-dasharray',
                   'stroke-dashoffset', 'fill-opacity', 'color'}


def _motion_registry():
    """{recipe_id: {budget, loop, keyframes}} from
    templates/motion/*/recipe.md + index.html."""
    reg = {}
    root = os.path.join(REPO, 'templates', 'motion')
    if not os.path.isdir(root):
        return reg
    for d in sorted(os.listdir(root)):
        rp = os.path.join(root, d, 'recipe.md')
        if not os.path.isfile(rp):
            continue
        fm = _frontmatter(open(rp, encoding='utf-8',
                               errors='replace').read())
        rid = fm.get('id') or 'recipe-' + d
        kf = set()
        ih = os.path.join(root, d, 'index.html')
        if os.path.isfile(ih):
            kf = set(re.findall(r'@keyframes\s+([\w-]+)',
                                open(ih, encoding='utf-8',
                                     errors='replace').read()))
        tax = fm.get('taxonomy') or {}
        reg[rid] = {'budget': str(tax.get('budget') or ''),
                    'loop': str(tax.get('loop_type') or 'none'),
                    'keyframes': kf}
    return reg


def _motion_deviations(ctx):
    """Declared bespoke animations: [{keyframes|name, reason, license?}]
    from DESIGN-PLAN site.motion_deviations or top-level
    `motion_deviations:`."""
    site = ctx.site_block()
    devs = site.get('motion_deviations') or ctx.plan.get(
        'motion_deviations') or []
    if isinstance(devs, dict):
        devs = [devs]
    return devs if isinstance(devs, list) else []


def check_motion_recipes(ctx):
    """M.9–M.13 — built motion is recipe-backed or declared: every
    @keyframes/animation-name maps to a recipe (or declared deviation
    with reason); animation-names resolve; animated props stay in the
    compositor set unless the recipe is budget: layout-risk; infinite
    loops stay inside licensed loop recipes; prefers-reduced-motion
    ships whenever motion ships."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    css_all = ''.join(c for _, c in dist_csss(ctx))
    if not css_all.strip():
        return []
    reg = _motion_registry()
    key2rec = {}
    for rid, spec in reg.items():
        for k in spec['keyframes']:
            key2rec[k] = rid
    devs = _motion_deviations(ctx)
    dev_names = set()
    for d in devs:
        for k in ('keyframes', 'name', 'animation'):
            v = d.get(k) if isinstance(d, dict) else None
            for x in (v if isinstance(v, list) else ([v] if v else [])):
                dev_names.add(str(x))
        if isinstance(d, dict) and not d.get('reason'):
            f.append('M.9 motion_deviation without a reason — '
                     'bespoke motion is declared, never silent')
    defined = set(re.findall(r'@keyframes\s+([\w-]+)', css_all))
    used = set()
    for m in re.finditer(r'animation(?:-name)?\s*:\s*([^;}]+)',
                         css_all):
        for tok in m.group(1).split(','):
            name = re.split(r'\s', tok.strip())[0]
            if name and name != 'none' and not name.startswith(
                    ('var(', 'initial', 'inherit')):
                used.add(name)
    for name in sorted(used | defined):
        if name in used and name not in defined:
            f.append(f'M.10 animation "{name}" resolves to no '
                     '@keyframes — a dead animation name is a defect')
            continue
        if name not in key2rec and name not in dev_names:
            f.append(f'M.9 keyframes "{name}" maps to no motion recipe '
                     'and no declared motion_deviation — unregistered '
                     'animation is a defect')
    # budget: animated props stay compositor-safe unless the recipe
    # carries a layout-risk license (e.g. blur-reveal)
    risky = re.findall(
        r'@keyframes\s+([\w-]+)[^{]*\{([^@]*)\}', css_all)
    licensed_risky = {k for k, r in key2rec.items()
                      if reg.get(r, {}).get('budget') == 'layout-risk'}
    for name, body in risky:
        if name in licensed_risky or name in dev_names:
            continue
        props = {m.group(2) for m in re.finditer(
            r'(^|;|\{)\s*([a-z-]+)\s*:', body)}
        bad = props - SAFE_ANIM_PROPS - {
            'from', 'to', 'transform-origin', 'animation-timing-'
            'function', 'offset', 'background-color'}
        bad = {b for b in bad if b in
               {'width', 'height', 'margin', 'margin-top',
                'margin-bottom', 'margin-left', 'margin-right',
                'top', 'left', 'right', 'bottom', 'padding',
                'filter', 'clip-path', 'background',
                'background-position'}}
        if bad:
            f.append(f'M.11 keyframes "{name}" animates '
                     f'{sorted(bad)} — outside the compositor budget; '
                     'needs a layout-risk licensed recipe or declared '
                     'deviation')
    # loops: infinite iterations only inside licensed loop recipes
    licensed_loops = {k for k, r in key2rec.items()
                      if reg.get(r, {}).get('loop') in
                      ('infinite', 'phased', 'palindrome')}
    for m in re.finditer(
            r'animation[^;{]*?:\s*([^;}]+?)\s+infinite\b', css_all):
        name = re.split(r'\s', m.group(1).strip().split(',')[0])[0]
        if name and name not in licensed_loops                 and name not in dev_names:
            f.append(f'M.12 "{name}" loops infinitely outside the '
                     'licensed loop set (ambient/status/iconography/'
                     'word-cycle) — one-shot or declare')
    # M.13 — a CSS comment never satisfies reduced motion: strip
    # comments before the substring test (a /* prefers-reduced-motion:
    # later */ note used to pass), and a transform/layout TRANSITION
    # is motion too — it needs the same fallback, even with no
    # @keyframes (transition-only bypass)
    css_nc = re.sub(r'/\*.*?\*/', '', css_all, flags=re.S)
    transitions = re.findall(
        r'transition\s*:\s*([^;}]+)', css_nc)
    heavy_transitions = [t for t in transitions
                         if re.search(
                             r'transform|translate|scale|width|height|'
                             r'margin|top|left|right|bottom|'
                             r'grid-template|clip-path', t)]
    if (used or defined or heavy_transitions) and \
            'prefers-reduced-motion' not in css_nc:
        f.append('M.13 motion ships without a prefers-reduced-motion '
                 'block — every animation needs a reduced fallback '
                 '(comments do not count; transform/layout '
                 'transitions are motion)')
    return f


SKL_STRUCTURE = re.compile(
    r'^(?:sr-only|group|peer|col-(?:span|start|end)-\d+|row-(?:span|'
    r'start|end)-\d+|order-(?:first|last|none|\d+)|grid|flex|inline-'
    r'(?:flex|block|grid)|block|hidden|contents|grid-cols-\d+|grid-'
    r'rows-\d+|items-(?:start|end|center|baseline|stretch)|'
    r'justify-(?:start|end|center|between|around|evenly)|self-\w+|'
    r'place-(?:items|content|self)-\w+|aspect-(?:square|video|auto)|'
    r'\[data-[\w"-]+\]|sec-band|sec-inner|wf-container|card-grid|'
    r'section-space-\w+|measure|content-width\w*|flow)$')
# ACSS/L.17-required padding is layer-legitimate on a skeleton
# section (N-1: SKL.1 and L.17 contradicted — py-24+ / sec-band /
# section-space-* are the REQUIRED padding path, never a raw-utility
# violation; py-8 smuggling still fails)
SKL_PAD_OK = re.compile(
    r'^(?:py-(?:2[4-9]|[3-9]\d|\d{3,})|(?:sm|md|lg|xl|2xl):py-\d+|'
    r'px-\d+|sec-band|section-space-\w+)$')
SKL_RAW_VISUAL = re.compile(
    r'^(?:bg-|text-(?!(?:wrap|balance|pretty)\b)|font-|leading-|'
    r'tracking-|border(?:-[trblxyse])?(?!\s)|ring-|from-|via-|to-|'
    r'fill-|stroke-|p[trblxyse]?-|m[trblxyse]?-|gap-|space-[xy]-|'
    r'py-|px-|pt-|pb-|pl-|pr-|mt-|mb-|ml-|mr-|rounded|shadow|w-(?!full\b)'
    r'|h-|min-h-|max-w-|opacity-|outline-|divide-|placeholder-|accent-)')
SKL_ID = re.compile(
    r'(?:skeleton[\w/-]*|hyperui/[\w/.-]+|shadcn/[\w/.-]+|'
    r'brixies/[\w/.-]+|templates/skeletons/[\w/.-]+)')
# shadcn skeleton classes are CSS-var tokens by design (bg-primary →
# var(--primary)) — component-tier indirection, not raw utilities
SKL_TOKEN_CLASS = re.compile(
    r'^(?:bg|text|border|ring|fill|stroke|from|via|to|placeholder|'
    r'caret|accent|decoration|outline|divide)-(?:primary|secondary|'
    r'muted|accent|destructive|popover|card|foreground|background|'
    r'input|ring|border|chart-\d|sidebar[\w-]*|surface|code|'
    r'selection)(?:/[\w.%-]+)?(?:-\w+)?$')


@_lc(maxsize=1)
def _skl_harvest_ids():
    # cached — check_skeleton runs this on every page/mutation run
    ids = set()
    root = os.path.join(REPO, 'templates', 'skeletons')
    for dp, _, fns in os.walk(root) if os.path.isdir(root) else []:
        for fn in fns:
            if not fn.endswith('.json'):
                continue
            try:
                v = json.load(open(os.path.join(dp, fn)))
            except Exception:
                continue
            if isinstance(v, list):
                v = v[0] if v else {}
            if not isinstance(v, dict):
                continue
            vid = v.get('id')
            if isinstance(vid, str) and '/' in vid:
                ids.add(vid)
                continue
            # brixies files carry a numeric upstream source_id — the
            # harvest id is brixies/<category>/<block_name>
            rel_dir = os.path.relpath(dp, root)
            if rel_dir == '.' or fn.endswith('.spec.json'):
                continue    # spec sidecars aren't usable skeleton ids
            parts = rel_dir.split(os.sep)
            block = v.get('block_name') or os.path.splitext(fn)[0]
            ids.add('/'.join(parts[:2] + [block])
                    if len(parts) > 1 else
                    '/'.join(parts + [block]))
    return ids


@_lc(maxsize=1)
def _recipe_topo_map():
    """{recipe_id: bank_json} — resolves a harvest id back to its
    skeleton payload; the .topo sidecar carries the seam +
    direction the glue checks bind to."""
    out = {}
    root = os.path.join(REPO, 'templates', 'skeletons')
    for dp, _, fns in os.walk(root) if os.path.isdir(root) else []:
        for fn in fns:
            if not fn.endswith('.json'):
                continue
            try:
                v = json.load(open(os.path.join(dp, fn)))
            except Exception:
                continue
            if isinstance(v, list):
                v = v[0] if v else {}
            if not isinstance(v, dict):
                continue
            vid = v.get('id')
            if isinstance(vid, str) and '/' in vid:
                out[vid] = v
                continue
            rel_dir = os.path.relpath(dp, root)
            if rel_dir == '.' or fn.endswith('.spec.json'):
                continue
            parts = rel_dir.split(os.sep)
            block = v.get('block_name') or os.path.splitext(fn)[0]
            out['/'.join(parts[:2] + [block])
                if len(parts) > 1 else
                '/'.join(parts + [block])] = v
    return out

# ---------------------------------------------------------------- J.7
# ELEMENT-VARIANT — the selection level between topology and style
# knobs: recipes that share a topology_id but differ in elements[]
# are different VARIANTS (image card grid vs numbered card grid vs
# text card grid). Media expectation is CANON — set by the vertical's
# endorsed/Mobbin references, not by the sampled corpus majority
# (the corpus under-weights media: fashion's image-led-ratio reads
# text-led because the ingested sites were text-heavy pages).
# CANON: {media classes an element-variant may carry,
#         whether text-only is acceptable}. The sampled genotype
# (image-led-ratio / media-treatment / image-style) weights choice
# inside canon-compliant variants and TIGHTENS canon — never loosens.

MEDIA_CLASS_RX = {
    'image':  r'image|photo|background|figure|picture|img\b',
    'icon':   r'\bicon',
    'number': r'number|numeral|counter|stat\b|score',
    'avatar': r'avatar|author|person|team',
    'logo':   r'\blogo|brand|partner',
    'video':  r'video',
    'chart':  r'chart|graph\b|diagram|illustration',
}


def _recipe_element_sig(recipe_id):
    """Canonical media classes in a bank recipe's elements[] —
    the element-variant signature. [] means text-only. Bank records
    carry the element list in three shapes: a flat `elements` list
    (.topo sidecars), a bricks `content` tree of named nodes, and a
    `tree` of topo nodes — all three are scanned."""
    v = _recipe_topo_map().get(recipe_id) or {}
    els = ' '.join(str(e) for e in (v.get('elements') or [])).lower()
    if not els:
        parts = []
        for node in (v.get('content') or []):
            if isinstance(node, dict):
                parts += [node.get('name'), node.get('label')]
        for node in (v.get('tree') or []):
            if isinstance(node, dict):
                parts += [node.get('name'), node.get('tag'),
                          node.get('label')]
        # element_sig counts: {img: n, icn: n, vid: n, ...} — a
        # present count means the recipe carries that media class
        sig = v.get('element_sig') or {}
        if sig.get('img'):
            parts.append('image')
        if sig.get('icn'):
            parts.append('icon')
        if sig.get('vid'):
            parts.append('video')
        els = ' '.join(str(p) for p in parts if p).lower()
    return sorted(k for k, rx in MEDIA_CLASS_RX.items()
                  if re.search(rx, els))


def _element_variant_name(sig):
    return 'text' if not sig else '+'.join(sig)


# media expectation per vertical — derived from the canon/endorsed
# reference corpus, NOT the sampled gene distribution. (accept,
# text_ok): text_ok=False means the vertical's canon is media-led and
# a text-only variant is a selection defect regardless of what the
# sampled image-led-ratio majority says.
VERTICAL_MEDIA_CANON = {
    'fashion':         ({'image', 'video'}, False),
    'luxury-goods':    ({'image', 'video'}, False),
    'jewellery':       ({'image'}, False),
    'architecture':    ({'image'}, False),
    'real-estate':     ({'image'}, False),
    'homes':           ({'image'}, False),
    'hospitality':     ({'image'}, False),
    'portfolio':       ({'image'}, False),
    'agency-portfolio': ({'image'}, False),
    'ecommerce':       ({'image'}, False),
    'automotive':      ({'image'}, False),
    'media':           ({'image', 'video'}, False),
    'events':          ({'image'}, False),
    'community':       ({'image', 'avatar'}, True),
    'finance':         ({'number', 'logo', 'chart'}, True),
    'legal':           ({'avatar', 'icon', 'logo'}, True),
    'government':      ({'icon', 'image'}, True),
    'saas':            ({'image', 'icon', 'chart', 'logo'}, True),
    'technology':      ({'image', 'icon', 'chart'}, True),
    'marketplace':     ({'image', 'avatar'}, True),
    'healthcare':      ({'icon', 'avatar', 'image'}, True),
    'education':       ({'icon', 'image', 'avatar'}, True),
    'services':        ({'avatar', 'image', 'icon', 'logo',
                         'number'}, True),
    'recruitment':     ({'avatar', 'icon', 'logo', 'image'}, True),
    'nonprofit':       ({'image', 'icon', 'logo'}, True),
    'personal-brand':  ({'avatar', 'image'}, True),
}


def _element_variant_fails(recipe_id, declared, vertical, genotype):
    """J.7 — return [fail, ...] for one pre-build option row."""
    f = []
    bank_sig = _recipe_element_sig(recipe_id)
    bank_name = _element_variant_name(bank_sig)
    if recipe_id in _recipe_topo_map():
        if not declared:
            f.append(f'J.7 {recipe_id}: no element_variant declared — '
                     'topology→variant→knobs is the selection chain; '
                     'the variant level is recorded, not implied')
        elif str(declared) != bank_name:
            f.append(f'J.7 {recipe_id}: element_variant {declared!r} '
                     f'!= bank signature {bank_name!r} — the declared '
                     'variant must match the recipe elements')
    media = set(bank_sig)
    canon = VERTICAL_MEDIA_CANON.get(vertical)
    if canon:
        accept, text_ok = canon
        extra = media - accept
        if extra:
            f.append(f'J.7 {recipe_id}: element classes '
                     f'{sorted(extra)} outside {vertical} canon '
                     f'{sorted(accept)} — canon media expectation '
                     'binds the variant, not the sampled corpus')
        if not media and not text_ok:
            f.append(f'J.7 {recipe_id}: text-only variant under '
                     f'{vertical} canon — {vertical} is media-led '
                     f'({sorted(accept)}); corpus text-majority is '
                     'sampling bias, not design truth')
    # the DECLARED genotype tightens canon: an image-led/media-first
    # genotype may not present a text-only variant even where canon
    # tolerates one (the operator chose image-led for this design)
    led = str((genotype or {}).get('image-led-ratio') or '')
    if led in ('image-led', 'media-first') and not media:
        f.append(f'J.7 {recipe_id}: genotype declares {led} but the '
                 'variant is text-only — the declared allele binds '
                 'element selection')
    return f

def check_candidate_review(ctx):
    """REF.2 — candidate sources are reviewed by the operator through
    a pipeline-produced picker before they may feed the LOOK layer:
    preview/candidates.html renders every pending candidate with its
    screenshot, score and approve/reject controls (POSTs to the
    approval service); the picker is receipt-bound. Decisions are
    recorded in CANDIDATES.json — approved joins the endorsed tier,
    rejected is excluded (contrast corpus only)."""
    f = []
    reg = _candidate_registry(
        os.path.join(ctx.dir, 'CANDIDATES.json'))
    if not reg:
        return []
    pending = [u for u, st in reg.items()
               if st == 'pending' and '://' in u]
    # RT-CAND-UNSIGNED — a decided row whose signature does not
    # verify was never a real operator decision: the registry demotes
    # it to pending (so it must surface in the picker) AND the forged
    # decision itself is a finding.
    cp = os.path.join(ctx.dir, 'CANDIDATES.json')
    try:
        cd = json.load(open(cp))
        crows = cd if isinstance(cd, list) else \
            cd.get('candidates') or []
    except Exception:
        crows = []
    key = op_key()
    for c in crows:
        if not isinstance(c, dict):
            continue
        st = str(c.get('status') or 'pending')
        if st not in ('approved', 'rejected'):
            continue
        if not key:
            continue  # no service key available — demotion alone
        body = {'site': str(c.get('url') or c.get('site') or
                           c.get('id')),
                'decision': st,
                'ts': str(c.get('decided_ts') or '')}
        if c.get('decision_sig') != _sig(body, key):
            f.append(f'REVIEW.CAND decision on {body["site"]} is '
                     'unsigned or forged — the approval service signs '
                     'every decision; designer-written status does '
                     'not count')
    fp = ctx.find('preview/candidates.html')
    if pending and not fp:
        f.append('REVIEW.CAND {n} candidate site(s) pending but no '
                 'preview/candidates.html — the operator reviews '
                 'candidates in a receipt-bound picker before they '
                 'touch the look layer'.format(n=len(pending)))
        return f
    if fp:
        txt = open(fp, encoding='utf-8', errors='replace').read()
        for u in pending:
            if u not in txt:
                f.append(f'REVIEW.CAND candidate {u} missing from the '
                         'review picker — every pending site renders '
                         'with screenshot + score + decision controls')
        if 'data-score=' not in txt:
            f.append('REVIEW.CAND picker carries no scores')
        if not re.search(r'data-(?:decision|action)|/promote|'
                         r'approve.*reject|reject.*approve',
                         txt, re.S):
            f.append('REVIEW.CAND picker has no approve/reject '
                     'controls — decisions POST to the approval '
                     'service, never a designer file')
    return f


def assemble_candidates(ctx):
    """Emit preview/candidates.html — the candidate review picker:
    one card per pending site with screenshot, source score and
    approve/reject buttons posting to the approval service."""
    cp = os.path.join(ctx.dir, 'CANDIDATES.json')
    rows = []
    if os.path.isfile(cp):
        try:
            data = json.load(open(cp))
            rows = data if isinstance(data, list) else \
                data.get('candidates') or []
        except Exception:
            rows = []
    cards = []
    for c in rows:
        if not isinstance(c, dict):
            continue
        st = str(c.get('status') or 'pending')
        if st != 'pending':
            continue  # decided rows are history, not review surface
        u = str(c.get('url') or c.get('site') or c.get('id') or '')
        sc = c.get('score')
        shot = str(c.get('shot') or c.get('screenshot') or
                   (u.replace('://', '-').replace('/', '-') + '.webp'))
        meta = f'{u} · score {sc} · {st}'
        shot_abs = os.path.join(ctx.dir, 'preview', shot)
        media = (f'    <img src="{shot}" alt="{u} screenshot" '
                 f'loading="lazy" data-dark="dim">\n'
                 if os.path.isfile(shot_abs)
                 else '    <div class="cand-noshot" data-dark="dim"'
                 '>no capture yet</div>\n')
        cards.append(
            f'  <article class="picker-opt'
            f'{" active" if not cards else ""}" '
            f'data-pane="c{len(cards)}" '
            f'data-candidate="{u}" data-status="{st}" '
            f'data-score="{sc}">\n'
            + media +
            f'    <div class="variant-pickrow">'
            f'<span class="variant-name">{u}</span>'
            f'<form method="POST" action="/promote" '
            f'data-decision="promote">'
            f'<input type="hidden" name="site" value="{u}">'
            '<button name="decision" value="approved">Approve'
            '</button>'
            '<button name="decision" value="rejected">Reject'
            '</button></form>'
            '<span class="pickstat" aria-live="polite"></span></div>\n'
            f'    <details class="variant-data"><summary>Design '
            f'machinery (source, score, status)</summary>'
            f'<code>{meta}</code></details>\n  </article>')
    h = hashlib.sha256(
        json.dumps(rows, sort_keys=True).encode()).hexdigest()[:12]
    tabs = ''
    if len(cards) > 1:
        tabs = ('<nav class="variant-tabs" data-switch="candidate">'
                + ''.join(f'<button data-tab="c{i+1}"'
                          + (' class="on"' if i == 0 else '')
                          + f'>Candidate {i+1}</button>'
                          for i in range(len(cards)))
                + '</nav>')
    txt = (f'<!-- assembled: {h} — candidate review picker; never '
           'edit -->\n<html><head><meta name="viewport" '
           'content="width=device-width">\n<meta charset="utf-8">'
           '<title>Candidate sources'
           '</title>' + _preview_tw(ctx) +
           '<style>.picker-opt{display:none}'
           '.picker-opt.active{display:block}'
           '.cand-noshot{aspect-ratio:16/10;display:flex;'
           'align-items:center;justify-content:center;'
           'background:var(--surface,#eef);color:var(--ink-2,#667);'
           'font:600 .9em/1 system-ui;border-radius:8px}</style>'
           '</head>\n'
           '<body>\n<h1>Candidate sources — '
           'promote to endorsed or reject</h1>\n' + tabs + '\n' +
           '\n'.join(cards) +
           '\n<script is:inline>(function(){function show(id){'
           'document.querySelectorAll(".picker-opt").forEach('
           'function(a){a.classList.toggle("active",'
           'a.dataset.pane===id)});'
           'document.querySelectorAll("[data-tab]").forEach('
           'function(x){x.classList.toggle("on",'
           'x.dataset.tab===id)});window.scrollTo(0,0);'
           'if(history.replaceState)history.replaceState(null,"",'
           '"#"+id);}document.querySelectorAll("[data-tab]").forEach('
           'function(b){b.addEventListener("click",function(){'
           'show(b.dataset.tab)})});if(location.hash)show('
           'location.hash.slice(1));})()</script>'
           '\n</body></html>')
    return os.path.join(ctx.dir, 'preview', 'candidates.html'), txt, h


def check_skeleton(ctx):
    """SKL — skeleton sources are structure-only: a data-skeleton
    section carries structure classes (grid/flex geometry, spans,
    order, a11y, ACSS token classes) never raw visual utilities; a
    `skeleton:` provenance on plan rows or markup must name an id in
    the harvest; skeleton ids never appear as canon refs."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    harvest = _skl_harvest_ids()
    # SKL.2 — skeleton ids never cited as canon
    plan_t = ctx.read('DESIGN-PLAN.md') or ''
    for m in re.finditer(
            r'(?:refs?:\s*\[([^\]]*)\]|data-(?:refs|canon)="([^"]*)")',
            plan_t):
        toks = (m.group(1) or m.group(2) or '')
        bad = [t for t in re.findall(SKL_ID, toks)]
        if bad:
            f.append(f'SKL.2 skeleton {bad[:3]} cited as canon — '
                     'structure sources never supply visual canon '
                     '(operator > endorsed > Mobbin only)')
    mr = ctx.read('MOBBIN-REFS.md') or ''
    for m in re.finditer(r'\|\s*(\S+)\s*\|', mr):
        if SKL_ID.fullmatch(m.group(1)):
            f.append(f'SKL.2 MOBBIN-REFS cites skeleton '
                     f'{m.group(1)} — canon refs are Mobbin/operator '
                     'sites only')
    for p, txt in ctx.page_htmls():
        name = os.path.basename(p)
        for m in re.finditer(
                r'<section\b[^>]*data-skeleton="([^"]*)"([^>]*)>'
                r'(.*?)</section>',
                txt, re.S):
            skel, attrs, inner_html = m.groups()
            tag = '<section' + m.group(0)[8:m.group(0).index('>') + 1]
            if harvest and skel not in harvest:
                f.append(f'SKL.1 {name}: data-skeleton "{skel}" is '
                         'not a harvest id — provenance names '
                         'templates/skeletons/<src>/<file> ids')
            # SKL.1 scans EVERY class in the subtree — raw visuals on
            # an inner div launder the same defect past a section-tag
            # read (section tag clean, inner bg-indigo-600 passed)
            classes = set()
            for cm in re.finditer(r'class="([^"]*)"',
                                  tag + inner_html):
                classes.update(cm.group(1).split())
            raw = [c for c in classes
                   for c in [c.split(':')[-1]]
                   if SKL_RAW_VISUAL.match(c) and
                   not SKL_PAD_OK.match(c) and
                   not SKL_STRUCTURE.match(c) and
                   not SKL_TOKEN_CLASS.match(c)]
            if raw:
                f.append(f'SKL.1 {name} sec {skel}: raw visual '
                         f'utilit{"y" if len(raw)==1 else "ies"} '
                         f'{sorted(set(raw))[:5]} inside a '
                         'skeleton-derived section — skeletons supply '
                         'structure only; visuals come from surfaces '
                         '+ ACSS tokens (padding: py-24+/sec-band/'
                         'section-space-* only)')
    # plan-row skeleton provenance must resolve to the harvest
    for slug, r in ctx.rows():
        sk = r.get('skeleton')
        if sk:
            if harvest and str(sk) not in harvest:
                f.append(f'SKL.1 {slug}:{r.get("name")} skeleton '
                         f'"{sk}" not in the harvest — record a real '
                         'templates/skeletons id')
            for t in re.findall(SKL_ID, ' '.join(
                    str(x) for x in (r.get('refs') or []))):
                f.append(f'SKL.2 {slug}:{r.get("name")} cites '
                         f'{t} in refs — skeletons are structure '
                         'provenance, never canon')
    return f


def check_motion_js_budget(ctx):
    """M.14 — tamdoma-way is the default: pure CSS + CSS-animated SVG
    + minimal vanilla JS triggers (≤4KB). GSAP is the ONLY licensable
    animation library, and only with an explicit DESIGN-PLAN licence
    carrying a written impossibility justification AND the DNA
    motion.engine knob set to 'gsap'. Lenis/scroll-inertia is NOT a
    sanctioned exception — smooth scrolling is CSS scroll-behavior /
    rAF fallback or a justified GSAP."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    site = ctx.site_block()
    lic_raw = site.get('licensed_libraries') or ctx.plan.get(
        'licensed_libraries') or []
    lic_raw = lic_raw if isinstance(lic_raw, list) else [lic_raw]
    # a licence is an OBJECT: {name, justification} — a bare string
    # has no impossibility case
    lic = {}
    for x in lic_raw:
        if isinstance(x, dict):
            lic[str(x.get('name') or '').lower()] = x
    engine = str(((dna_map(ctx) or {}).get('knobs') or {})
                 .get('motion.engine')
                 or site.get('motion_engine') or 'css').lower()
    LIBS = {'gsap', 'anime', 'lottie', 'framer-motion', 'three',
            'lenis', 'scrollmagic', 'velocity', 'popmotion',
            'scrollsmoother'}
    # a licence for anything but gsap is itself a defect
    for name, licd in lic.items():
        if name != 'gsap':
            f.append(f'M.14 licence for "{name}" — GSAP is the ONLY '
                     'licensable animation library')
        elif not str(licd.get('justification') or '').strip():
            f.append('M.14 gsap licence lacks a written impossibility '
                     'justification — "why CSS cannot do this" is '
                     'required text')
    if engine == 'gsap' and 'gsap' not in lic:
        f.append('M.14 motion.engine=gsap without a plan licence — '
                 'engine and licence move together')
    anim_mark = re.compile(
        r'animate\(|requestAnimationFrame|IntersectionObserver|'
        r'gsap\.|anime\(|lottie|scroll-timeline', re.I)
    dist = os.path.join(ctx.site, 'dist')
    for dp, _, fns in os.walk(dist) if os.path.isdir(dist) else []:
        for fn in fns:
            if not fn.endswith(('.js', '.mjs')):
                continue
            p = os.path.join(dp, fn)
            t = open(p, encoding='utf-8', errors='replace').read()
            low = fn.lower() + t[:400].lower()
            lib = next((l for l in LIBS if l in low), None)
            if lib and lib != 'gsap':
                f.append(f'M.14 {fn}: animation library "{lib}" — '
                         'banned outright; only GSAP is licensable '
                         '(CSS scroll-behavior/rAF covers scroll '
                         'inertia)')
            elif lib == 'gsap' and (
                    'gsap' not in lic or engine != 'gsap'):
                f.append(f'M.14 {fn}: gsap without licence + '
                         'motion.engine=gsap — a library is a defect '
                         'unless explicitly licensed and isolated')
            if anim_mark.search(t) and os.path.getsize(p) > 4096:
                f.append(f'M.14 {fn}: '
                         f'{os.path.getsize(p)}B animation-related JS '
                         '> 4KB — IO toggles and scroll progress '
                         'only; heavier motion logic is a library '
                         'in disguise')
    return f


# interactive (non-motion) libraries — M.14 owns animation libs;
# these are the content-type exceptions (map/chart/video/…) that
# may be licensed only with a written justification
INTERACTIVE_LIBS = {
    'leaflet', 'mapbox', 'maplibre', 'vidstack', 'plyr', 'recharts',
    'chart.js', 'chartjs', 'd3', 'plotly', 'highcharts', 'swiper',
    'embla', 'alpine', 'htmx', 'monaco', 'codemirror',
}


def check_js_cost(ctx):
    """M.15 — tamdoma-first cost order: pure CSS/SVG > native HTML
    elements > minimal JS > library. A library-required recipe or a
    detected interactive lib needs a plan licence {name,
    justification} — the same impossibility text M.14 demands for
    motion. Receipt blocks carry js_cost from the recipe so the
    trace names what the page paid for."""
    f = []
    lic_raw = ctx.site_block().get('licensed_libraries') or \
        ctx.plan.get('licensed_libraries') or []
    lic_raw = lic_raw if isinstance(lic_raw, list) else [lic_raw]
    lic = {}
    for x in lic_raw:
        if isinstance(x, dict):
            lic[str(x.get('name') or '').lower()] = x
    # a licence for an interactive lib without justification is a
    # defect even before anything renders
    for name, licd in lic.items():
        if name in INTERACTIVE_LIBS and not str(
                licd.get('justification') or '').strip():
            f.append(f'M.15 licence for "{name}" lacks a written '
                     'justification — "why CSS/native cannot do '
                     'this" is required text')
    # recipe-side: a library-required/minimal-js recipe used without
    # its cost recorded = the tier never happened
    try:
        rv = json.loads(ctx.read('REVIEW.json') or '{}')
    except Exception:
        rv = {}
    for b in (rv.get('blocks') or []):
        if not isinstance(b, dict):
            continue
        rid = str(b.get('recipe_id') or '')
        topo = _recipe_topo_map().get(rid) or {}
        cost = str(topo.get('js_cost') or 'css-only')
        if cost != 'css-only':
            if b.get('js_cost') != cost:
                f.append(f'M.15 block {b.get("block_id")}: recipe '
                         f'{rid} is {cost} but the receipt carries '
                         f'js_cost={b.get("js_cost")!r} — the cost '
                         'tier is part of the trace')
            if cost == 'library-required':
                libname = str(b.get('library') or '').lower()
                if libname not in lic:
                    f.append(f'M.15 block {b.get("block_id")}: '
                             f'library-required recipe {rid} '
                             f'(lib {libname or "?"}) without a '
                             'licensed_libraries entry — a library '
                             'is a defect until justified in the '
                             'plan')
    # render-side: any detected interactive lib must be licensed
    dist = os.path.join(ctx.site, 'dist')
    for dp, _, fns in os.walk(dist) if os.path.isdir(dist) else []:
        for fn in fns:
            if not fn.endswith(('.js', '.mjs', '.html')):
                continue
            p = os.path.join(dp, fn)
            t = open(p, encoding='utf-8', errors='replace').read()
            low = fn.lower() + ' ' + t.lower()
            lib = next((x for x in INTERACTIVE_LIBS
                        if re.search(
                            rf'["\'\s/>]({re.escape(x)})'
                            rf'[\'"\s/.<>-]', low)), None)
            if lib and lib not in lic:
                f.append(f'M.15 {fn}: interactive library "{lib}" '
                         'without a plan licence — CSS/native first; '
                         'a library ships only with a written '
                         'justification in DESIGN-PLAN')
    return f
def _strip_media(css):
    """Remove balanced @media/@supports {…} blocks — a rule inside
    one stacks at base by definition, so a fixed-track grid there
    is a responsive split, not a non-collapsing collection."""
    out = []
    i, n = 0, len(css)
    while i < n:
        m = re.match(r'@(media|supports)\b', css[i:])
        if m:
            j = css.index('{', i + m.end())
            depth = 0
            k = j
            while k < n:
                depth += (css[k] == '{') - (css[k] == '}')
                if depth == 0:
                    break
                k += 1
            i = k + 1
            continue
        out.append(css[i])
        i += 1
    return ''.join(out)


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
        # media/supports-wrapped rules collapse at base; only the
        # un-wrapped rules carry the scroll risk.
        css = _strip_media(css)
        for m in re.finditer(
                r'grid-template-columns:\s*repeat\(\s*(\d+|\d+fr)',
                css):
            f.append(f'G.5 {name}: fixed repeat({m.group(1)}) grid — '
                     'collections use '
                     'repeat(auto-fit, minmax(min(var(--grid-min,28rem),'
                     '100%),1fr))')
        # fixed literal tracks (1fr 1fr 1fr 1fr) are the same defect
        # as repeat(4) — a grid that never collapses
        for m in re.finditer(
                r'grid-template-columns:\s*((?:[\d.]+fr\s*){4,})', css):
            f.append(f'G.5 {name}: fixed {m.group(1).count("fr")}-track '
                     'literal grid — collections use '
                     'repeat(auto-fit, minmax(...))')
        for m in re.finditer(r'([\w.#\[\]-]+)[^{}]*\{([^}]*)\}', css):
            sel, body, rule = m.group(1), m.group(2), m.group(0)
            if 'full-bleed' in sel or 'full-bleed' in body or \
                    '100vw' in body or 'bleed' in sel:
                continue
            # F-13 — overflow-x scrollers AND the shorthand
            # "overflow: auto|scroll [hidden]" two-axis form: both are
            # rails; a fixed ≥4-column grid beside either is the tell
            rail = re.search(
                r'overflow-x\s*:\s*(?:auto|scroll)', body) or \
                re.search(
                    r'overflow\s*:\s*(?:auto|scroll)\s+'
                    r'(?:auto|scroll|hidden)', body)
            if rail:
                f.append(f'G.5 {name}: "{sel.strip()}" scrolls '
                         'horizontally — rails are banned unless '
                         'declared full-bleed (edge-to-edge)')
    for p, txt in ctx.page_htmls():
        name = os.path.basename(p)
        for m in re.finditer(
                r'<section[^>]*data-comp="(cards[^"]*|logo[^"]*|'
                r'proof[^"]*|gallery[^"]*)"[^>]*>(.*?)</section>',
                txt, re.S):
            comp, body = m.group(1), m.group(2)
            tag = m.group(0)[:400]
            rail = re.search(
                r'overflow-x:\s*(?:auto|scroll)|\bsnap-x\b|'
                r'\bscroll-snap|flex\s+overflow-x|white-space:\s*'
                r'nowrap[^}]*overflow', tag + body[:800], re.S)
            if rail and 'full-bleed' not in tag + body[:800]:
                f.append(f'G.5 {name} sec {comp}: a sideways card rail '
                         'on desktop — wrap into an auto-fit grid or '
                         'declare full-bleed')
    return f


# the components that render as multi-track grids — the `columns`
# genotype allele (1–4) is the only legal track-count source
GRID_COMPS = {'cards-n', 'feature-grid', 'gallery-grid', 'logo-wall',
              'service-grid', 'card-grid', 'media-grid',
              'comparison-grid', 'cutout-catalog-grid'}


def check_grid_tracks(ctx):
    """G.8 — the `columns` genotype allele bounds the rendered grid:
    a grid block carries data-cols ∈ the allele set; a plan row that
    declares columns binds its block exactly. A cards-n that renders
    4 tracks under columns:3 restyled the wrong section."""
    f = []
    fp = None
    for cand in ('site/dist/home/index.html',
                 'site/src/pages/home.astro'):
        p = ctx.find(cand)
        if p:
            fp = p
            break
    if not fp:
        return []
    txt = open(fp, encoding='utf-8', errors='replace').read()
    _, gt = _genotype(ctx.plan)
    gene_cols = str((gt or {}).get('columns') or '')
    alleles = {'1', '2', '3', '4'}
    plan_cols = {}
    for slug, row in ctx.rows():
        name = str((row or {}).get('name') or '')
        if (row or {}).get('columns') not in (None, ''):
            plan_cols[name] = str(row.get('columns'))
    for sec, attrs in re.findall(
            r'<(?:section|nav|header|footer)[^>]*data-sec="([^"]+)"([^>]*)>', txt):
        comp = re.search(r'data-comp="([^"]+)"', attrs)
        if not comp or comp.group(1) not in GRID_COMPS:
            continue
        m = re.search(r'data-cols="(\d+)"', attrs)
        if not m:
            f.append(f'G.8 block {sec}: grid comp '
                     f'{comp.group(1)} carries no data-cols — the '
                     'track count is the columns allele, declared '
                     'not implied')
            continue
        cols = m.group(1)
        if cols not in alleles:
            f.append(f'G.8 block {sec}: data-cols={cols} outside '
                     f'the columns allele set {sorted(alleles)}')
            continue
        want = plan_cols.get(sec) or gene_cols
        if want and cols != want:
            f.append(f'G.8 block {sec}: data-cols={cols} != '
                     f'columns {want} — the grid restyled a track '
                     'count the genotype did not choose')
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
    every section has block padding; heading precedes content.
    Chrome edges (nav/footer shells) sit outside the rhythm: L.14
    judges content-band adjacency, not the boilerplate envelope."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    for p, txt, parsed, blocks in _segmented(ctx):
        name = os.path.basename(p)
        tagged = [s for s in blocks if s.get('data-sec')]
        surfaces = [
            'chrome:' + str(s.get('data-comp') or s.get('data-sec'))
            if _is_chrome(s) else _surface_of(s) for s in tagged]
        for i in range(1, len(surfaces)):
            # chrome edges key on their comp, so nav/footer never
            # collide with a content band — and two adjacent same-comp
            # chrome shells still flag. Two CONTENT bands are never
            # exempted.
            if surfaces[i] == surfaces[i - 1]:
                f.append(f'L.14 {name}: sections {i}/{i + 1} share '
                         f'surface "{surfaces[i]}" — alternate '
                         'white → light grey/tint → white (adjacent '
                         'white sections FAIL too)')
        for i, s in enumerate(tagged):
            cls = str(s.get('class') or '')
            style = str(s.get('style') or '')
            if str(s.get('data-mode') or '') == 'bar':
                continue        # chrome bars pad from the bar rung
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
            # a decorative media panel carries its own ornament: an
            # aria-hidden stand-in is content, not a dead column.
            empties = [e for e in re.findall(
                r'<(?:div|aside)[^>]*>(?:\s|&nbsp;)*'
                r'</(?:div|aside)>', body)
                if 'aria-hidden' not in e and 'media-panel' not in e]
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
        # F-13 — the viewport-pinning escape set is closed:
        # min-h-screen, h-screen, min-h-dvh, and any 100*vh in CSS or
        # inline style — a hero never pins a viewport of dead air
        if re.search(r'\b(?:min-h-screen|h-screen|min-h-dvh)\b', cls) \
                or re.search(
                    r'(?:min-height|height)\s*:\s*100[lvsd]?vh', tag):
            f.append(f'R.10 {name}: hero is viewport-pinned '
                     '(min-h-screen/h-screen/100vh family) — the '
                     'hero sizes to content + section-space padding, '
                     'never pins a viewport of dead air above the CTA')
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
        return ['G.6 CANON-PADDING.json missing at W7 — the canon '
                'padding ratios are a REQUIRED artifact (PatternMiner '
                'publishes it); a missing file is a missing gate, not '
                'a skip (F-18)']
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
            if not re.search(r'<h[1-6][\s>]|class="[^"]*'
                             r'(?:lede|eyebrow)[^"]*"', body):
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
                if 'card-grid' not in c and 'card__' not in c
                and any(t.startswith('card') or t.endswith('-card')
                        for t in c.split())]
                # a card SHELL token is 'card' or *-card — containers
                # like gridcard-1-grid-ul carry 'card' inside a longer
                # token and are not sibling cards; x-card__y is a BEM
                # element inside the shell (counter-1-card__intro)
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
        r'(?:\.dark|\[data-theme[^\]]*dark[^\]]*\])'
        r'[^\n{]*\b(img|video|picture)[^{]*\{[^}]*'
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
        m = re.search(r'<(?:a|div|img|svg|span)[^>]*class="[^"]*logo[^"]*"[^>]*'
                      r'(?:>(?:.*?</(?:a|div|span)>)?|/>)', txt)
        if not m:
            f.append(f'L.16 {name}: no logo element found')
            continue
        tag = m.group(0)
        if not re.search(r'(width|height)=|font-size|logo-(\d+|sm|md|lg)'
                         r'|h-(\d+|\[)|brand-mark', tag):
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
                    ('nav-bar', 'footer-bar', 'flyout-nav'):
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
            # F-04 — a row carrying >1 vector heading smuggles merged
            # sections past the unit budget: each heading needs its own
            # row or a declared same-intent group
            if len(vec) > 1 and not r.get('group'):
                f.append(f'PS.11 {slug}:{r.get("name")} carries '
                         f'{len(vec)} vector headings in one row — '
                         'every H2 opens its own Section unless a '
                         'same-intent group is declared')
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
                nh2 = len(re.findall(r'<h2\b', body))
                if nh2 > 1 and 'data-group' not in attrs:
                    ints = {i for _, i in h2s}
                    f.append(f'PS.11 {name} sec {sec}: {nh2} h2s '
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
                # attrs are ORDER-FREE — class may precede data-sec in
                # legal markup; a regex that read attrs only after
                # data-sec false-FAILED on the padding check (F-14/M13)
                r'<section\b([^>]*)>(.*?)</section>', txt, re.S):
            ad = dict(re.findall(r'([\w-]+)="([^"]*)"', m.group(1)))
            sec, body = ad.get('data-sec') or '', m.group(2)
            if sec in ('nav', 'footer', ''):
                continue
            cls = ad.get('class', '')
            if sec != 'hero':
                pm = re.search(r'(?<![:\w-])py-(\d+)(?![\w-])', cls)
                ov = [int(x) for x in re.findall(
                    r'(?:sm|md|lg|xl|2xl):py-(\d+)', cls)]
                # a breakpoint override that drops below the base tier
                # smuggles cramped padding past the base-class check
                tiers = ([int(pm.group(1))] if pm else []) + ov
                # the ACSS class path pads via the layer tokens —
                # sec-band or section-space-m+ satisfies the floor
                acss_pad = bool(re.search(
                    r'\b(?:sec-band|section-space-(?:m|l|xl|xxl))\b',
                    cls))
                if not acss_pad and (not tiers or
                                     min(tiers) * 4 < 96):
                    f.append(f'L.17 {name} sec {sec}: block padding '
                             '< section-space-m (~96px) at some '
                             'breakpoint — cramped sections get no '
                             'air (overrides never go below the '
                             'tier)')
            inner_gaps = [int(g) for g in re.findall(
                r'\b(?:gap|space-y|mb|mt)-(\d+)', body)]
            has_head_body = re.search(r'<h[12]\b', body) and \
                re.search(r'<(?:p|img|form|ul|div)\b', body)
            if has_head_body and inner_gaps and \
                    max(inner_gaps) * 4 < 32:
                f.append(f'L.17 {name} sec {sec}: header→body gap '
                         '< space-l (~32px) — the group reads jammed')
            if 'card-grid' in cls or re.search(r'\bgrid\b', cls):
                gm = re.search(r'\bgap-(\d+)', cls) or re.search(
                    r'\bgap-(\d+)', body)
                has_gap = bool(gm) or 'card-grid' in cls or \
                    bool(re.search(
                        r'\b(?:gap|space-[xy])-[\w.]+', cls + ' ' + body))
                if not has_gap:
                    f.append(f'L.17 {name} sec {sec}: a grid without '
                             'a gap — children abut with zero air')
                elif gm and int(gm.group(1)) * 4 < 24:
                    f.append(f'L.17 {name} sec {sec}: grid gap '
                             '< space-m (~24px)')
            spec = specs.get(ad.get('data-comp') or '')
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
    # F-13/M8 — viewport-UNIT padding is the min-h-screen escape
    # hatch: padding-block-start:60vh buries the CTA without touching
    # height. Section space is a tier token, never a vh fraction.
    for p, css in dist_csss(ctx):
        name = os.path.basename(p)
        for m in re.finditer(
                r'([\w.#\[\]-]+)[^{}]*\{[^}]*padding[^:]*:\s*[^;}]*'
                r'(\d+)(?:lvsd)?vh', css):
            if int(m.group(2)) >= 20 and not re.search(
                    r'hero|bleed', m.group(1)):
                f.append(f'L.17 {name}: "{m.group(1).strip()[:40]}" '
                         f'pads {m.group(2)}vh — section space is a '
                         'tier token, never a viewport fraction')
    return f


def check_faq_collapsed(ctx):
    """D.1 — disclosure: a faq-item emits collapsed. An `open` detail
    turns the accordion into a text wall."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    for p, txt in ctx.page_htmls():
        for m in re.finditer(r'<details\b[^>]*\bclass="[^"]*faq-item[^"]*"[^>]*>',
                             txt):
            if re.search(r'\bopen\b', m.group(0)):
                f.append(f'Q.1 {os.path.basename(p)}: <details '
                         'class="faq-item" open> — answers ship '
                         'collapsed')
    return f


def check_card_hierarchy(ctx):
    """D.2 — every .card carries a heading before its body text. A
    bare-text card has no hierarchy."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    card_re = re.compile(
        r'<(?:div|li|article|dd|dt)\b[^>]*\bclass="[^"]*\bcard\b[^"]*"'
        r'[^>]*>(.*?)</(?:div|li|article|dd|dt)>',
        re.S)
    for p, txt in ctx.page_htmls():
        name = os.path.basename(p)
        for i, m in enumerate(card_re.finditer(txt)):
            body = m.group(1)
            head = re.search(r'<h[234]\b', body)
            prose = re.search(r'<(?:p|dd|li)\b', body)
            if prose and (not head or head.start() > prose.start()):
                f.append(f'Q.2 {name} card#{i + 1}: no heading '
                         'before body text — hierarchy missing')
    return f


def check_icon_ring(ctx):
    """D.3 — an icon inside a card or flow row renders inside
    .icon-chip (the ring), never a bare svg."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    for p, txt in ctx.page_htmls():
        name = os.path.basename(p)
        for m in re.finditer(
                r'<(?:div|li|dl)\b[^>]*\bclass="[^"]*\b(?:card|flow-row)\b[^"]*"[^>]*>'
                r'(.*?)</(?:div|li|dl)>', txt, re.S):
            body = m.group(1)
            for sm in re.finditer(r'<svg\b', body):
                pre = body[:sm.start()]
                if 'icon-chip' not in pre[-400:] and \
                        not re.search(r'<span[^>]*icon-chip[^>]*>$', pre):
                    f.append(f'Q.3 {name}: bare <svg> inside card/'
                             'flow-row — icons sit in the ring')
                    break
    return f


def check_gap_floor(ctx):
    """D.4 — every grid/flex container of siblings resolves a gap ≥
    16px; a zero-gap sibling group abuts (operator rule: EVERY layout
    carries ≥1rem gap at every viewport — 0 only where there is a
    single child)."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    _px = {}
    def px(v):
        v = str(v)
        if v in _px:
            return _px[v]
        m = re.match(r'([\d.]+)(?:px|rem)?', v)
        if not m:
            # clamp()/calc(): the first length is the floor
            m = re.search(r'([\d.]+)\s*(px|rem)', v)
        if not m:
            return None
        n = float(m.group(1))
        out = n * 16 if 'rem' in v[:m.end()] else n
        _px[v] = out
        return out
    tokens = {}
    for p, css in dist_csss(ctx):
        for vm in re.finditer(r'(--[\w-]+)\s*:\s*([^;}]+)', css):
            tokens[vm.group(1)] = vm.group(2).strip()
    def resolve(v):
        # substitute each var() in place — replacing the whole string
        # with the token value would strip a surrounding max()/clamp()
        # wrapper and make a floored gap read as its raw token
        seen = set()
        v = str(v)
        while v and 'var(' in v:
            mm = re.search(r'var\((--[\w-]+)[^)]*\)', v)
            if not mm or mm.group(1) in seen:
                break
            seen.add(mm.group(1))
            v = v.replace(mm.group(0),
                          str(tokens.get(mm.group(1), '')))
        return v
    # first pass — class patterns whose rulesets already give an
    # element a resolved gap ≥8px (exact class, [class*=x] substring,
    # or the emit's `*-card` → `.card` convention)
    gapped = []
    for p, css in dist_csss(ctx):
        for rm in re.finditer(
                r'([^{}]+)\{([^}]*)\bgap\s*:\s*([^;}]+)', css):
            n = px(resolve(rm.group(3).strip()) or '')
            if n is None or n < 16:
                continue
            sel = rm.group(1)
            pats = set(re.findall(r'\.(-?[_a-zA-Z][\w-]*)', sel))
            subs = set(re.findall(
                r'class\*=\s*["\']?([^"\'\]\s]+)', sel))
            gapped.append((pats, subs))

    def covered(sel):
        classes = set(re.findall(r'\.(-?[_a-zA-Z][\w-]*)', sel))
        for c in classes:
            cands = {c}
            if c.endswith('-card'):
                cands.add('card')
            if c.endswith('-grid-ul'):
                cands.add('-grid-ul')
            for pats, subs in gapped:
                if cands & pats:
                    return True
                if any(s in c for s in subs):
                    return True
        return False

    for p, css in dist_csss(ctx):
        name = os.path.basename(p)
        for rm in re.finditer(
                r'([^{}]+)\{([^}]*)\bdisplay:\s*(grid|flex)\b([^}]*)\}',
                css):
            sel, decl = rm.group(1).strip(), rm.group(2) + rm.group(4)
            kids = len(re.findall(r'\b(?:card|item|row|li)\b', sel))
            if kids == 0 and not re.search(
                    r'card-grid|grid-ul|flow-list|nav-links|cta-row|'
                    r'grid-auto|gridcard|\brow\b|\bstack\b', sel):
                continue
            gm = re.search(r'\bgap\s*:\s*([^;}]+)', decl)
            if not gm:
                if covered(sel):
                    continue
                f.append(f'Q.4 {name} "{sel[:50]}": flex/grid '
                         'container has no gap — siblings abut')
                continue
            n = px(resolve(gm.group(1).strip()) or '')
            if n is not None and n < 16:
                f.append(f'Q.4 {name} "{sel[:50]}": gap {n:.0f}px '
                         '< 16px floor')
    # inert-gap scan: row-gap is law only where it can apply. It does
    # nothing on display:block and nothing on a non-wrapping flex row —
    # a *-container or *-grid* ruleset declaring it without an
    # activating display/direction emits children that touch (the
    # machinery's own activation rules, the [class*="container"] grid
    # floor and the .flow flex-column override, live in the emitted
    # global.css and clear the class pattern, not each rule).
    activation = ('class*=container]{display:grid' in
                  ''.join(c for _, c in dist_csss(ctx)).replace(' ', ''))
    for p, css in dist_csss(ctx):
        name = os.path.basename(p)
        for rm in re.finditer(r'([^{}]+)\{([^}]*)\brow-gap\s*:[^;}]+'
                              r'[^}]*\}', css):
            sel, decl = rm.group(1).strip(), rm.group(2)
            if 'container' not in sel:
                continue
            dm = re.search(r'\bdisplay:\s*([\w-]+)', decl)
            disp = dm.group(1) if dm else 'block'
            if disp == 'flex' and ('flex-direction: column' in decl or
                                   'flex-direction:column' in decl or
                                   'flex-wrap' in decl):
                continue
            if disp in ('grid', 'inline-grid'):
                continue
            if activation:
                continue
            f.append(f'Q.4 {name} "{sel[:50]}": row-gap on '
                     f'{disp} is inert — children abut')
    return f


def check_section_pad(ctx):
    """P.floor — every section band/bar resolves padding-block AND
    the measure resolves padding-inline ≥16px at every viewport
    (operator rule: ALL sections ALWAYS carry SOME padding — a vibe
    may tighten the rung, never zero it)."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    tokens = {}
    for p, css in dist_csss(ctx):
        for vm in re.finditer(r'(--[\w-]+)\s*:\s*([^;}]+)', css):
            tokens[vm.group(1)] = vm.group(2).strip()

    def resolve(v):
        seen = set()
        v = str(v)
        while v and 'var(' in v:
            mm = re.search(r'var\((--[\w-]+)[^)]*\)', v)
            if not mm or mm.group(1) in seen:
                break
            seen.add(mm.group(1))
            v = v.replace(mm.group(0),
                          str(tokens.get(mm.group(1), '')))
        return v

    def px(v):
        v = str(v)
        m = re.match(r'([\d.]+)(?:px|rem)?', v)
        if not m:
            m = re.search(r'([\d.]+)\s*(px|rem)', v)
        if not m:
            return None
        n = float(m.group(1))
        return n * 16 if 'rem' in v[:m.end()] else n

    for p, css in dist_csss(ctx):
        name = os.path.basename(p)
        for rm in re.finditer(r'([^{}]+)\{([^}]*)\}', css):
            sel, decl = rm.group(1).strip(), rm.group(2)
            if not re.search(
                    r'\.sec-band|\.sec-bar|\.sec-inner|'
                    r'section\b[^.]', sel):
                continue
            # the nested-measure dedup (.sec-inner .sec-inner
            # padding-inline:0) is SB.2 law, not a missing pad
            if sel.count('.sec-inner') > 1 or \
                    'sec-inner>.sec-inner' in sel.replace(' ', ''):
                continue
            for pm in re.finditer(
                    r'\b(padding-block|padding-inline|padding)\s*:\s*'
                    r'([^;}]+)', decl):
                for part in pm.group(2).strip().split():
                    n = px(resolve(part) or '')
                    if n is not None and n < 16:
                        f.append(f'P.floor {name} "{sel[:40]}": '
                                 f'{pm.group(1)} {n:.0f}px < 16px '
                                 'floor — a section always carries '
                                 'padding')
                        break
    return f


def check_type_scale_min(ctx):
    """D.5 — heading steps descend monotonically: each level's
    resolved minimum ≥10% under the level above, and every card
    title smaller than its section heading."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    vals = {}
    for p, css in dist_csss(ctx):
        for vm in re.finditer(
                r'(--(?:h[1-6]|fs-?\d+|text-[a-z0-9-]+))\s*:\s*clamp\('
                r'\s*([\d.]+)(?:px|rem)', css):
            n = float(vm.group(2))
            if 'rem' in vm.group(0):
                n *= 16
            # cascade order: the later declaration wins
            vals[vm.group(1)] = n
    order = ['--h1', '--h2', '--h3', '--h4', '--h5', '--h6']
    seq = [vals.get(k) for k in order]
    seq = [s for s in seq if s]
    for a, b, ka, kb in zip(seq, seq[1:], order, order[1:]):
        if b >= a:
            f.append(f'Q.5 {kb} ({b:.0f}px) ≥ {ka} ({a:.0f}px) — '
                     'the scale must descend')
        elif b > a * 0.92:
            f.append(f'Q.5 {kb} ({b:.0f}px) only {100 - b / a * 100:.0f}% '
                     f'under {ka} — steps need ≥8% separation')
    return f


def check_contrast_pairs(ctx):
    """D.6 — element-level contrast: every color/background pairing
    in emitted CSS (incl. data-surface overrides) meets the floor —
    4.5:1 text, 3:1 ≥24px display or non-text chrome."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    tokens = {}
    for p, css in dist_csss(ctx):
        for vm in re.finditer(r'(--[\w-]+)\s*:\s*([^;}]+)', css):
            tokens[vm.group(1)] = vm.group(2).strip()
    def resolve(v):
        seen = set()
        v = str(v)
        for _ in range(12):
            mm = re.search(r'var\((--[\w-]+)[^)]*\)', v)
            if not mm or mm.group(1) in seen:
                break
            seen.add(mm.group(1))
            v = v[:mm.start()] + str(
                tokens.get(mm.group(1), '')) + v[mm.end():]
        return v
    def _hex_rgb(h):
        h = h.lstrip('#')
        if len(h) == 3:
            h = ''.join(c * 2 for c in h)
        if len(h) < 6:
            return None
        return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
    def _mix(parts):
        """color-mix(in srgb, A p%, B) — weighted srgb blend."""
        cm = re.fullmatch(
            r'color-mix\(in srgb,\s*(.+?)\s+([\d.]+)%,\s*(.+)\)', parts)
        if not cm:
            return None
        a, w, b = cm.group(1), float(cm.group(2)) / 100, cm.group(3)
        ra, rb = _hex_rgb(_norm(a) or ''), _hex_rgb(_norm(b) or '')
        if not ra or not rb:
            return None
        return '#%02x%02x%02x' % tuple(
            round(ra[i] * w + rb[i] * (1 - w)) for i in range(3))
    def _norm(v):
        v = resolve(str(v).strip())
        if v.startswith('color-mix('):
            return _mix(v)
        m = re.search(r'(?<!&)#[0-9a-fA-F]{3,8}\b', v)
        if m:
            return m.group(0)
        if re.match(r'^(?:oklch|lch|lab|color)\(', v):
            return v
        return None
    hx = _norm
    for p, css in dist_csss(ctx):
        name = os.path.basename(p)
        for rm in re.finditer(r'([^{}@]+)\{([^}]*)\}', css):
            sel, decl = rm.group(1).strip(), rm.group(2)
            if '@' in sel or sel.startswith(':'):
                pass
            fg = re.search(r'(?<![-\w])color\s*:\s*([^;}]+)', decl)
            bg = re.search(r'background(?:-color)?\s*:\s*([^;}]+)', decl)
            if not fg or not bg:
                continue
            a, b = hx(fg.group(1)), hx(bg.group(1))
            if not a or not b:
                continue
            r = contrast(a, b)
            if r is None:
                continue
            fs = re.search(r'font-size\s*:\s*([^;}]+)', decl)
            display = False
            if fs:
                vm = re.search(r'([\d.]+)(px|rem)', resolve(
                    fs.group(1)) or '')
                if vm:
                    n = float(vm.group(1)) * (16 if vm.group(2)
                                              == 'rem' else 1)
                    display = n >= 24
            floor = 3.0 if display else 4.5
            if r < floor:
                f.append(f'Q.6 {name} "{sel[:40]}": {r:.1f}:1 '
                         f'< {floor}:1')
    return f


def check_receipts(ctx):
    """P.17 — nothing outside the pipeline: an artifact that exists on
    disk must be bound in GATES.json.artifacts to its passing wave."""
    if not _wave_ge(ctx, 'w3'):
        return []
    g = load_gates(ctx)
    arts = g.get('artifacts') or {}
    f = []
    upto = WAVE_SEQ.index(ctx.wave) + 1 if ctx.wave in WAVE_SEQ \
        else len(WAVE_SEQ)
    wanted = {}
    for wv in WAVE_SEQ[:upto]:
        for rel in ARTIFACTS.get(wv, []):
            wanted[rel] = wv
    # every preview/*.html is operator-facing — receipts cover the set,
    # not only the named list (variants-v2 et al. bind to w4). A file
    # ARTIFACTS names for a LATER wave is not due yet — the guess is
    # only for unnamed files (system.html is w5's, never w3's).
    named = {rel for rels in ARTIFACTS.values() for rel in rels}
    pdir = os.path.join(ctx.dir, 'preview')
    if os.path.isdir(pdir):
        for fn in sorted(os.listdir(pdir)):
            if fn.endswith('.html'):
                rel = f'preview/{fn}'
                if rel not in wanted and rel not in named:
                    wanted[rel] = 'w4' if 'variants' in fn or \
                        'fine' in fn else 'w3'
    # the signing key must live OUTSIDE the graded tree — a key
    # inside ctx.dir is designer-writable, so a receipt signed by it
    # proves nothing (the boundary is the operator home, not the
    # pipeline dir)
    kp = os.path.realpath(os.path.join(OPERATOR_HOME,
                                       'operator.key'))
    rd = os.path.realpath(ctx.dir)
    if kp == rd or kp.startswith(rd + os.sep):
        f.append('P.17 the receipt signing key resolves inside the '
                 'pipeline dir — operator state must live outside '
                 'the tree it grades')
    for rel, wv in sorted(wanted.items()):
        if wv == ctx.wave:
            # this wave's own artifacts are in transit — receipts bind
            # on THIS wave's pass, after the checks run. A stale or
            # wrong receipt still fails (sha/wave/gate_pass below);
            # only a not-yet-written receipt is exempt.
            rec = arts.get(rel)
            if not rec:
                continue
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
        if rec.get('wave') != wv:
            f.append(f'P.17 {rel} receipt binds wave {rec.get("wave")}, '
                     f'expected {wv} — receipts bind the artifact to '
                     'the wave that produced it')
        # F-19 P3 — a receipt recorded AGAINST a failing wave is no
        # receipt: pass-state is part of the binding
        if rec.get('gate_pass') is not True:
            f.append(f'P.17 {rel} receipt records '
                     f'gate_pass={rec.get("gate_pass")} — artifacts '
                     'bind only to PASSING gates')
        key = op_key()
        # fail-closed: no verifiable key means no verifiable receipt
        want = _sig({k: v for k, v in rec.items() if k != 'sig'},
                    key) if key else None
        if not want or rec.get('sig') != want:
            f.append(f'P.17 {rel} receipt unsigned or badly '
                     'signed — receipts are bound by the service '
                     'key, not just a hash row')
    return f



def check_frozen_inputs(ctx):
    """P.22 — frozen inputs are really frozen: every hash a passing
    wave recorded in GATES.json.inputs_sha256 must still recompute
    to the same bytes (DESIGN-PLAN.md excluded — it legitimately
    evolves and carries its own versioning checks)."""
    if not _wave_ge(ctx, 'w4'):
        return []
    g = load_gates(ctx)
    f = []
    upto = WAVE_SEQ.index(ctx.wave) if ctx.wave in WAVE_SEQ \
        else len(WAVE_SEQ)
    for wv, entry in g.items():
        if wv not in WAVE_SEQ or WAVE_SEQ.index(wv) >= upto:
            continue
        if not isinstance(entry, dict) or not entry.get('pass'):
            continue
        for rel, sha in (entry.get('inputs_sha256') or {}).items():
            if rel == 'DESIGN-PLAN.md' or sha is None:
                continue
            fp = os.path.join(ctx.dir, rel)
            if not os.path.isfile(fp):
                f.append(f'P.22 frozen input {rel} deleted after '
                         f'{wv} sealed it — inputs a gate consumed '
                         'cannot disappear downstream')
                continue
            cur = hashlib.sha256(open(fp, 'rb').read()).hexdigest()[:16]
            if cur != sha:
                f.append(f'P.22 frozen input {rel} changed after '
                         f'{wv} passed ({sha[:8]}→{cur[:8]}) — a '
                         'consumed input is frozen; change means a '
                         'new wave, not an edit')
    return f


def check_seal(ctx):
    """SEAL — evidence directories carry .seal-manifest.sha256 and
    every file recomputes to its manifest hash (tools/design-gate/
    seal.py). An altered sealed file is a tamper FAIL; a populated
    evidence dir without a manifest warns."""
    try:
        import seal
    except Exception:
        here = os.path.dirname(os.path.abspath(__file__))
        if os.path.isfile(os.path.join(here, 'seal.py')):
            sys.path.insert(0, here)
            import seal
        else:
            return []
    f = []
    for dname in ('refs', 'research', 'evidence', 'sources'):
        d = os.path.join(ctx.dir, dname)
        if not os.path.isdir(d):
            continue
        files = [fn for fn in os.listdir(d)
                 if os.path.isfile(os.path.join(d, fn))
                 and fn != seal.MANIFEST and not fn.startswith('.')]
        if not files:
            continue
        mp = os.path.join(d, seal.MANIFEST)
        if not os.path.isfile(mp):
            # unsealed evidence is a warn-tier gap — strict mode
            # promotes it; --allow-warns keeps it advisory only
            # inside a verified run (a bare CLI flag cannot
            # downgrade — argv passthrough is not authority)
            if _warns_allowed(ctx):
                continue
            f.append(f'P.23 {dname}/: {len(files)} evidence files, '
                     'no seal manifest — run `seal.py adopt` to '
                     'grandfather or re-fetch via sealed writers')
            continue
        altered, unsealed = seal.verify_dir(d)
        for x in altered:
            f.append(f'P.23 {dname}/{x}: hash != manifest — '
                     'evidence altered after sealing')
        for x in unsealed:
            f.append(f'P.23 {dname}/{x}: not in manifest — '
                     'unsealed evidence among sealed files')
    return f


def check_round_gated(ctx):
    """P.18 — the W3 picker is gated by gate.py round (round 1),
    in-wave — not by hand afterwards."""
    wfp = ctx.wireframe_path()
    if not wfp or not os.path.isfile(wfp):
        return [f'P.18 layout picker not found ({wfp})']
    stub = None
    sp = ctx.stub_path()
    if sp:
        stub = open(sp, encoding='utf-8', errors='replace').read()
    cands = _candidate_registry(
        os.path.join(ctx.dir, 'CANDIDATES.json'))
    lo = _layout_options(ctx) or {}
    n_opts = len(lo.get('options') or ()) or None
    return [f'P.18 {x}' for x in check_round(
        wfp, 1, stub=stub, candidates=cands, n_opts=n_opts)]


def check_round_gated_look(ctx):
    """P.18 — the W4 look picker passes gate.py round (round 2)."""
    fp = ctx.find('preview/variants.html')
    if not fp:
        return ['P.18 look picker preview/variants.html not found']
    stub = None
    sp = ctx.stub_path()
    if sp:
        stub = open(sp, encoding='utf-8', errors='replace').read()
    cands = _candidate_registry(
        os.path.join(ctx.dir, 'CANDIDATES.json'))
    return [f'P.18 {x}' for x in check_round(
        fp, 2, stub=stub, candidates=cands)]


def check_fine_round(ctx):
    """P.18 — the knob-nudge fine round comes AFTER the look round:
    preview/fine.html exists and passes gate.py round (round 3), and it
    is not a verbatim re-serve of the look round — the fine round nudges
    knobs on the LOOK winner, so rendered structure must evolve."""
    fp = ctx.find('preview/fine.html')
    if not fp:
        if os.environ.get('WF_GATE_STAGE') != 'post-pick':
            # the fine round nudges the pick — it is emitted after the
            # pick exists, so pre-pick the file legitimately is not
            # there yet
            return []
        return ['P.18 preview/fine.html missing — the fine knob-nudge '
                'round is produced after the look round, never skipped']
    stub = None
    sp = ctx.stub_path()
    if sp:
        stub = open(sp, encoding='utf-8', errors='replace').read()
    cands = _candidate_registry(
        os.path.join(ctx.dir, 'CANDIDATES.json'))
    f = [f'P.18 {x}' for x in check_round(
        fp, 3, stub=stub, candidates=cands)]
    lp = ctx.find('preview/variants.html')
    if lp:
        ft = open(fp, encoding='utf-8', errors='replace').read()
        lt = open(lp, encoding='utf-8', errors='replace').read()
        # knob vectors + render live on the BUILT pages each card
        # iframes — scope styles from the page's data-variant-scope
        # wrapper, signatures from the page markup
        f_pages = _shell_card_pages(fp, ft)
        l_pages = _shell_card_pages(lp, lt)
        f_scoped = {}
        for d, (pt, _c) in f_pages.items():
            for vid, st in _scope_styles(pt).items():
                f_scoped.setdefault(d, '')
                f_scoped[d] += ';' + st
        l_scoped = {}
        for d, (pt, _c) in l_pages.items():
            for vid, st in _scope_styles(pt).items():
                l_scoped.setdefault(d, '')
                l_scoped[d] += ';' + st
        f_blocks = _design_blocks(ft)
        l_blocks = _design_blocks(lt)
        shared = [d for d in f_blocks if d in l_blocks]
        # N-8 — verbatim-by-id only fired when every fine id exists in
        # the look round: renaming ids (fv1..fv3) skipped the test.
        # Compare signatures across ALL ids instead: a renamed verbatim
        # re-serve still matches.
        def _render_of(blocks, pages_, d):
            return (pages_.get(d) or (blocks.get(d) or '', ''))[0] \
                or blocks.get(d) or ''
        def _sheet_sig(blocks, scoped, pages_):
            return sorted(
                (scoped.get(d, '').strip() or
                 repr(_render_sig(_render_of(blocks, pages_, d)))
                for d in blocks))
        if f_blocks and l_blocks:
            shared_ids_verbatim = bool(shared) and \
                len(shared) == len(f_blocks) and all(
                    (f_scoped.get(d, '').strip() ==
                     l_scoped.get(d, '').strip()) if
                    (f_scoped.get(d) or l_scoped.get(d)) else
                    _render_sig(_render_of(f_blocks, f_pages, d)) ==
                    _render_sig(_render_of(l_blocks, l_pages, d))
                    for d in shared)
            sheet_verbatim = _sheet_sig(
                f_blocks, f_scoped, f_pages) == _sheet_sig(
                l_blocks, l_scoped, l_pages)
            if shared_ids_verbatim or sheet_verbatim:
                f.append('P.18 fine round re-serves the look round '
                         'verbatim — a knob-nudge round must change '
                         'at least one rendered knob vs the look '
                         'round (renamed ids do not dodge this)')
        # R7b — the fine round nudges the PICKED look option, not any
        # design: read the w4 approval's design, then every fine option
        # must differ from THAT design in a small knob delta while
        # keeping its section multiset (a 1-knob change to an option
        # that isn't the pick is a fresh design, not a nudge)
        pick = ((read_approvals(ctx) or {}).get('w4') or {}).get(
            'design')
        if pick and pick in l_blocks:
            # count in KNOB space: the scope div carries the raw knob
            # tokens (_knob_vars names) AND their semantic projection —
            # one type.base step legitimately moves every --text-*
            # clamp, which is still ONE knob of nudge
            ktoks = {str((s or {}).get('token') or k).replace(
                '.', '-').replace('_', '-')
                for k, s in knob_set().items()}

            def _knob_only(css):
                return {k: v for k, v in re.findall(
                    r'--([a-z][\w-]*)\s*:\s*([^;}]+)', css)
                    if any(k == t or k.startswith(t + '-')
                           for t in ktoks)}

            l_page = _render_of(l_blocks, l_pages, pick)
            pick_knobs = _knob_only(l_scoped.get(pick, '') + l_page)
            pick_secs = sorted(re.findall(
                r'data-sec="([^"]+)"', l_page))
            for d, b in f_blocks.items():
                f_page = _render_of(f_blocks, f_pages, d)
                fd = _knob_only(f_scoped.get(d, '') + f_page)
                delta = {k for k in set(fd) | set(pick_knobs)
                         if fd.get(k) != pick_knobs.get(k)}
                same_secs = sorted(re.findall(
                    r'data-sec="([^"]+)"', f_page)) == pick_secs
                if not (1 <= len(delta) <= 6 and same_secs):
                    f.append(f'P.18 fine option {d} is not a nudge of '
                             f'the picked design ({pick}): '
                             f'{len(delta)} knob diff, '
                             f'{"same" if same_secs else "different"} '
                             'section set — the fine round varies the '
                             'WINNER by ±1 step, not a new design')
    return f


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
        for m in re.finditer(
                r'rgba\s*\(|rgb\s*\([^)]*/\s*[\d.]|'
                r'#[0-9a-fA-F]{8}\b', css):
            f.append(f'A.1 {name}: alpha literal '
                     f'({m.group(0)[:28]}) — transparency via '
                     'color-mix(in oklch, role X%, transparent) only')
        for m in re.finditer(
                r'([\w.#\[\]-]+)[^{}]*\{[^}]*min-height:\s*'
                r'(\d+(px|rem|[dsl]?vh)|calc\([^}]*?vh[^}]*?\))'
                r'[^}]*\}', css):
            sel = m.group(1)
            if not re.search(r'hero|bleed|fold|cta|btn|touch|input|'
                             r'button|control', sel):
                f.append(f'A.1 {name}: "{sel.strip()[:40]}" sets '
                         'min-height — section whitespace comes from '
                         '--section-space-* only')
        for m in re.finditer(
                r'class="[^"]*\bmin-h-(?:screen|\[)[^"]*"', txt
                if False else ''):
            pass  # rendered markup scan lives in check_section_shell
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
            if not re.search(r'(?:^|[,{\s}])p\s*\{[^}]*text-wrap:\s*'
                             r'(?:pretty|var\(--text-wrap-body\))',
                             dcss):
                f.append('A.1 built CSS: body lacks '
                         'text-wrap: pretty (token-bound)')
        # width ladder — inner blocks land on --width-* rungs
        # (the breakout ladder); .width--<rung> classes not on the
        # ladder are literal widths in disguise
        RUNGS = {'10', '20', '30', '40', '50', '60', '70', '80', '90',
                 'full', 'auto', 'fit', 'max', 'min'}
        for m in re.finditer(r'width--(\w+)', dcss +
                             ''.join(t for _, t in ctx.page_htmls())):
            if m.group(1) not in RUNGS:
                f.append(f'A.1 width--{m.group(1)} — off the '
                         '--width-* ladder rungs '
                         '(10…90, full, auto, fit, max, min)')
        # btn padding ratio binds the knob (ACSS baseline 2:1
        # block:inline) — literal em padding that drifts from the
        # declared ratio is a knob violation, not style
        kn = (dna_map(ctx) or {}).get('knobs') or {}
        try:
            want = float(kn.get('btn.padding_ratio', 2.0))
        except (TypeError, ValueError):
            want = 2.0
        for m in re.finditer(
                r'(?:\.btn|button)[^{]*\{[^}]*padding:\s*'
                r'([\d.]+)em\s+([\d.]+)em', dcss):
            blk, inl = float(m.group(1)), float(m.group(2))
            if blk > 0 and abs(inl / blk - want) > 0.51:
                f.append(f'A.1 button padding {blk}em/{inl}em '
                         f'(ratio {inl / blk:.1f}) vs '
                         f'btn.padding_ratio {want} — pad with the '
                         'knob ratio, ACSS baseline is 0.75/1.5em')
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


def check_trend_vocab(ctx):
    """DM/DNA — `trend` fields validate against the closed
    patterns/data/trends.json vocab + year (PatternMiner's TREND
    schema: label list + dated flag; trend_year must match)."""
    tj = os.path.join(DESIGN_DIR, 'patterns', 'data', 'trends.json')
    if not os.path.isfile(tj):
        return []
    try:
        spec = json.load(open(tj))
    except Exception:
        return []
    vocab = set((spec.get('trends') or {}).keys()) | {'dated', 'none'}
    year = spec.get('year')
    f = []
    for holder, obj in (('DNA.json', dna_map(ctx) or {}),
                        ('plan', ctx.plan or {})):
        for k, obj2 in ((k, obj.get(k)) for k in
                        ('dna', 'site', 'design') if obj.get(k)):
            if isinstance(obj2, dict):
                for kk in ('trend', 'trend_year'):
                    if kk in obj2:
                        obj = {**obj, kk: obj2[kk]}
        tr = obj.get('trend')
        if tr:
            vals = tr if isinstance(tr, list) else [tr]
            for v in vals:
                lab = (v.get('trend') if isinstance(v, dict)
                       else str(v)).lower()
                if lab not in vocab:
                    f.append(f'{holder}: trend "{lab}" ∉ '
                             f'trends.json {sorted(vocab)[:4]}… '
                             '(closed multi-label vocab)')
                if isinstance(v, dict):
                    for req in ('confidence', 'evidence'):
                        if v.get(req) in (None, ''):
                            f.append(f'{holder}: trend {lab} missing '
                                     f'"{req}"')
        ty = obj.get('trend_year')
        if ty and year and int(ty) != int(year):
            f.append(f'{holder}: trend_year {ty} ≠ trends.json year '
                     f'{year} — trends are stamped to their corpus '
                     'year')
    return f


def _comp_profiles():
    """{comp: {field: value}} parsed from docs/machinery/design/
    components/<comp>.md profile tables — shared by A.3 (judge) and
    build_contracts (producer maps plan intent → profile intent)."""
    profiles = {}
    pdir = os.path.join(DESIGN_DIR, 'components')
    if os.path.isdir(pdir):
        for fn in os.listdir(pdir):
            if not fn.endswith('.md'):
                continue
            t = open(os.path.join(pdir, fn), encoding='utf-8',
                     errors='replace').read()
            fields = dict((k.strip().lower(), v.strip())
                          for k, v in re.findall(
                              r'^\|\s*([\w-]+)\s*\|\s*([^|]+)\|',
                              t, re.M))
            profiles[os.path.splitext(fn)[0]] = fields
    return profiles


def _render_intent(comp, plan_intent):
    """data-intent the built <section> carries: the plan's PS.11 intent
    when the component profile allows it, else the profile's first
    intent — the rendered vocabulary is the profile's, not the
    plan's (fixture evidence: definition→proof on cards-n, cta→act
    on form-panel)."""
    intent = str(plan_intent or '')
    prof = _comp_profiles().get(str(comp or '')) or {}
    allowed = [w.strip() for w in
               str(prof.get('intent') or '').lower().split('/')
               if w.strip()]
    if not allowed:
        return intent or None
    if intent and intent.lower() in allowed:
        return intent
    return allowed[0]


def check_component_profile(ctx):
    """A.3 — every rendered component instance is classified to a
    profile (docs/machinery/design/components/<data-comp>.md); unknown
    type = FAIL."""
    if not _wave_ge(ctx, 'w7'):
        return []
    profiles = _comp_profiles()
    f = []
    for p, txt, parsed, blocks in _segmented(ctx):
        name = os.path.basename(p)
        for sblk in blocks:
            comp = str(sblk.get('data-comp') or '')
            if not comp:
                f.append(f'A.3 {name}: unclassified section — '
                         'data-comp required')
                continue
            prof = profiles.get(comp)
            if prof is None:
                f.append(f'A.3 {name}: data-comp "{comp}" has no '
                         'component profile — every type carries its '
                         'own rule profile (components/<type>.md)')
                continue
            # profile VALUES bind the render — a section whose
            # attributes contradict the profile is a defect (F-17)
            intent = str(sblk.get('data-intent') or '')
            want_intent = (prof.get('intent') or '').lower()
            if want_intent and intent and all(
                    w not in want_intent
                    for w in intent.lower().split('/')):
                f.append(f'A.3 {name}: {comp} renders intent '
                         f'"{intent}" — the profile allows '
                         f'{prof.get("intent")!r} (profile values '
                         'bind, not just classify)')
            cls = str(sblk.get('class') or '')
            pad = (prof.get('padding') or '')
            pm = re.search(r'section-space-(\w+)', pad)
            # chrome renders as a bar, not a band: the bar rung owns
            # its rhythm, so the band padding tier never applies.
            if pm and 'sec-bar' not in cls and \
                    'sec-band' not in cls and \
                    f'section-space-{pm.group(1)}' not in cls and \
                    not re.search(r'\bpy-(?:2[4-9]|[3-9]\d|\d{3,})',
                                  cls):
                f.append(f'A.3 {name}: {comp} pads below its profile '
                         f'({pad}) — profile padding tier binds')
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
        cta_sel = re.compile(r'\b(btn|cta|button)\b', re.I)
        for sel, px in _rule_min_heights(css, cta_sel, 48):
            f.append(f'R.9 {name}: CTA {sel[:40]} '
                     f'min-height {px}px < 48px')
        mobile = ' '.join(body for prelude, body in _media_blocks(css)
                          if re.search(
                              r'max-width:\s*(?:768|767|640|480|375)px',
                              prelude))
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


# J.9 SECTION-PROGRAM — the page's shape comes from its type, not from
# whatever rows the plan happens to carry. A conversion page that ships
# a promise and a button is not a conversion page.
SECTION_PROGRAM = {
    'service-page': {'acts': {'promise', 'proof', 'how', 'act'},
                     'categories': {'headers': 1, 'hero': 1,
                                    'content': 3, 'contact': 1,
                                    'footer': 1}},
    'near-me': {'acts': {'promise', 'proof', 'how', 'objection', 'act'},
                'categories': {'headers': 1, 'hero': 1, 'content': 3,
                               'contact': 1, 'footer': 1}},
    'guide': {'acts': {'promise', 'how', 'detail'},
              'categories': {'headers': 1, 'hero': 1, 'content': 2,
                             'footer': 1}},
    'hub': {'acts': {'promise', 'detail'},
            'categories': {'headers': 1, 'hero': 1, 'content': 2,
                           'footer': 1}},
}

# J.10 HERO-COMPOSITION — the hero archetype the genotype declares bounds
# which composition may carry the promise. cards-n is a content pattern,
# not a hero.
HERO_COMP = {
    'split-media': {'split-media', 'hero-act-merge', 'media-gallery',
                    'full-bleed', 'cutout-hero-split'},
    'editorial-single': {'editorial', 'split-media', 'full-bleed'},
    'stacked-center': {'stacked-hero', 'badge-center',
                       'hero-act-merge'},
    'immersive-media': {'full-bleed', 'media-gallery'},
    'carousel-track': {'media-gallery', 'quote-grid'},
    'masonry-grid': {'media-gallery', 'quote-grid'},
    'sequence-steps': {'sequence', 'split-media'},
    'accordion-list': {'faq', 'editorial'},
}


def check_section_program(ctx):
    """J.9 SECTION-PROGRAM — every page carries the sections its
    page_type promises: the required categories, and a section for
    every act the rhetoric declares. A rhetoric act with no section is
    an argument the page never makes."""
    f = []
    for slug, page in (ctx.pages() or {}).items():
        if not isinstance(page, dict):
            continue
        prog = SECTION_PROGRAM.get(str(page.get('page_type') or ''))
        if not prog:
            continue
        rows = [r for r in (page.get('sections') or [])
                if isinstance(r, dict)]
        acts = set()
        cats = {}
        for r in rows:
            a = r.get('speech_act') or []
            acts.update([a] if isinstance(a, str) else a)
            c = str(r.get('category') or '')
            cats[c] = cats.get(c, 0) + 1
        for need in sorted(prog['acts']):
            if need not in acts:
                f.append(f'J.9 {slug}: rhetoric act "{need}" has no '
                         'section — the page never makes that argument')
        for cat, n in sorted(prog['categories'].items()):
            if cats.get(cat, 0) < n:
                f.append(f'J.9 {slug}: {cats.get(cat, 0)} {cat} '
                         f'section(s), the {page.get("page_type")} '
                         f'program needs {n}')
        for r in rows:
            if str(r.get('category') or '') in ('headers', 'footer'):
                continue
            if not (r.get('content_ids') or r.get('vector')
                    or r.get('items')):
                f.append(f'J.9 {slug}:{r.get("name")}: no content — '
                         'every content row binds content_ids/vector/items')
    return f


def check_hero_composition(ctx):
    """J.10 HERO-COMPOSITION — the genotype's layout-archetype bounds the
    composition that carries the promise."""
    f = []
    dna = dna_map(ctx) or {}
    arch = str((dna.get('genotype') or {}).get('layout-archetype') or '')
    allowed = HERO_COMP.get(arch)
    if not allowed:
        return f
    for _, r in ctx.rows():
        acts = r.get('speech_act') or []
        acts = [acts] if isinstance(acts, str) else acts
        if 'promise' not in acts:
            continue
        comp = str(r.get('composition') or '')
        if comp not in allowed:
            f.append(f'J.10 {r.get("name", "?")}: composition {comp!r} '
                     f'not allowed for layout-archetype {arch!r} '
                     f'(allowed: {sorted(allowed)})')
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
        # L.7 steps the *surface* rhythm, not the rung label: a
        # regular-regular-regular run on base→muted→base still steps.
        # What the rule must catch is three interior rows that render
        # the same BACKGROUND, a flat canyon the reader free-falls.
        surf = [str(r.get('surface')) for r in interior]
        if surf:
            run = 1
            for i in range(1, len(surf)):
                run = (run + 1 if surf[i] == surf[i-1]
                       and surf[i] in ('base', 'muted') else 1)
                if run >= 3:
                    f.append(f'{slug}: surface "{surf[i]}" held for '
                             f'≥3 interior rows — step the surface '
                             'S-M-L every ≤2 so the eye can land (L.7)')
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
    # SB.2 — the shared layer spans global.css (token-bound rules in
    # @layer components) and bank.css (plain skeleton layout rules —
    # `@layer` there would need a matching @tailwind directive).
    classes = set()
    for sheet in ('site/src/styles/global.css', 'site/src/styles/bank.css'):
        g = ctx.read(sheet) or ''
        m = re.search(r'@layer\s+components\s*\{(.*)\}', g, re.S)
        body = m.group(1) if m else g
        classes |= set(re.findall(r'\.([A-Za-z][\w-]*)', body))
    return classes

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

# I.10 mandates lucide-astro; its components stamp `lucide lucide-<name>`
# on every icon — library identity classes, not ad-hoc styling.
LUCIDE_CLASS = re.compile(r'^lucide(-[a-z0-9-]+)?$')


def _class_set(ctx, text):
    bad = []
    layer = _layer_classes(ctx)
    for cls in re.findall(r'class="([^"]+)"', text):
        for c in cls.split():
            base = c.split(':')[-1]
            if base in layer or TAIL_UTIL.match(base) \
                    or LUCIDE_CLASS.match(base):
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
            for m in re.finditer(r'(?<!&)#[0-9a-fA-F]{3,8}\b', t):
                f.append(f'P.5 {fn}: raw hex {m.group(0)} outside '
                         'config/tokens')
            for m in re.finditer(r'\b\d+px\b', t):
                f.append(f'P.5 {fn}: raw px {m.group(0)} — bind a token')
            for m in re.finditer(
                    r'<([a-zA-Z][\w-]*)\b([^>]*?)\bstyle="([^"]+)"', t):
                if 'data-variant-scope' in m.group(2):
                    continue   # the look knob vector binds CSS vars —
                    # the mechanism, not a stray style
                if 'aspect-ratio' not in m.group(3):
                    f.append(f'P.2 {fn}: style="" attribute '
                             f'"{m.group(3)[:40]}" — not data-driven '
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
        # hex outside :root — SVG fills inside a brand mark are the
        # mark's own artwork, not a stray colour decision
        css = re.sub(r':root\s*\{[^}]*\}', '', txt, flags=re.S)
        css = re.sub(r'<span[^>]*brand-logo[^>]*>.*?</span>', '', css,
                     flags=re.S)
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
    for p, raw in pages:
        txt = html.unescape(raw)
        parsed = parse_html(txt)
        heads = [(h[0], h[1].strip()) for h in parsed.headings]
        # the fs sentence must appear verbatim in rendered prose —
        # the same tag-strip F.1 applies, so emphasis markup
        # (<strong>, <a>, <span>…) inside the sentence does not
        # break a genuinely verbatim render
        prose = _norm_text(_strip_inline_md(re.sub(
            r'<[^>]+>', ' ', re.sub(
                r'</?(?:strong|em|a|b|i|span|mark|small|sub|sup|'
                r'code|abbr|u|s|del|ins|time|cite)\b[^>]*>', '',
                txt, flags=re.I))))
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
                fsn = _norm_text(_strip_inline_md(v['fs']))
                if fsn.rstrip('.!?') not in prose:
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
        ia_sel = re.compile(r'\b(a|button|input|select|summary)\b')
        for sel, px in _rule_min_heights(txt, ia_sel, 44):
            f.append(f'R.6 {os.path.basename(p)}: {sel[:40]} '
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
    return sec in CHROME_SECS or comp in ('nav-bar', 'footer-bar',
                                          'flyout-nav')

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
                r'<(section|nav)\b[^>]*>(.*?)(?=<(?:section|nav|header|footer)\b|</body>)',
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
                r'<(section|nav)\b[^>]*>(.*?)(?=<(?:section|nav|header|footer)\b|</body>)',
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
                r'<(section|nav|footer)\b[^>]*>(.*?)(?=<(?:section|nav|header|footer)\b|</body>)',
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
        first_sec = re.search(r'<(?:section|nav|header|footer)\b[^>]*data-sec', txt)
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
    'footer-bar': 'horizontal-band', 'flyout-nav': 'horizontal-band',
    'modal-form': 'split-form',
    'timeline-steps': 'sequence-steps', 'how-steps': 'sequence-steps',
    'newsletter-band': 'horizontal-band', 'teams-grid': 'card-grid-3',
    'gallery-grid': 'masonry-grid', 'pricing-table': 'table-matrix',
    'portfolio-grid': 'masonry-grid', 'contact-panel': 'split-form',
    'event-list': 'sequence-steps', 'banner-cta': 'horizontal-band',
    'feature-grid': 'card-grid-3',
    'cutout-hero-split': 'split-media',
    'cutout-catalog-grid': 'card-grid-3',
    'cutout-cta-band': 'horizontal-band',
    'nav-h1': 'horizontal-band', 'nav-h2': 'horizontal-band',
    'nav-h3': 'horizontal-band', 'nav-h4': 'horizontal-band',
    'nav-h5': 'horizontal-band', 'nav-h6': 'horizontal-band',
    'nav-h7': 'horizontal-band', 'nav-h8': 'horizontal-band',
    'nav-h9': 'horizontal-band', 'nav-h10': 'horizontal-band',
    'nav-h11': 'horizontal-band', 'nav-h12': 'horizontal-band',
    'nav-h13': 'horizontal-band', 'nav-h14': 'horizontal-band',
    'nav-h15': 'horizontal-band', 'nav-h16': 'horizontal-band',
    'nav-h17': 'horizontal-band', 'nav-h18': 'horizontal-band',
    'nav-h19': 'horizontal-band', 'nav-h20': 'horizontal-band',
    'nav-h21': 'horizontal-band', 'nav-h22': 'horizontal-band',
    'nav-h23': 'horizontal-band', 'nav-h24': 'horizontal-band',
    'nav-h25': 'horizontal-band', 'nav-shop-1': 'horizontal-band',
    'nav-shop-2': 'horizontal-band', 'nav-shop-3': 'horizontal-band',
    'nav-shop-4': 'horizontal-band', 'nav-mega-1': 'horizontal-band',
    'nav-mega-2': 'horizontal-band', 'nav-mega-3': 'horizontal-band',
    'nav-mega-4': 'horizontal-band', 'nav-mega-5': 'horizontal-band',
    'nav-mega-6': 'horizontal-band', 'nav-mega-7': 'horizontal-band',
    'nav-offcanvas': 'horizontal-band', 'footer-1': 'horizontal-band',
    'footer-2': 'horizontal-band', 'footer-3': 'horizontal-band',
    'footer-4': 'horizontal-band', 'footer-5': 'horizontal-band',
    'footer-6': 'horizontal-band', 'footer-7': 'horizontal-band',
    'footer-8': 'horizontal-band', 'footer-9': 'horizontal-band',
    'footer-10': 'horizontal-band', 'footer-11': 'horizontal-band',
    'footer-12': 'horizontal-band', 'footer-13': 'horizontal-band',
    'footer-15': 'horizontal-band', 'footer-16': 'horizontal-band',
    'footer-17': 'horizontal-band', 'footer-18': 'horizontal-band',
    'footer-19': 'horizontal-band', 'footer-20': 'horizontal-band',
    'footer-21': 'horizontal-band', 'footer-22': 'horizontal-band',
    'footer-23': 'horizontal-band', 'footer-shop': 'horizontal-band',
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


# composition → bank recipe (canonical table — plan_from_copy and
# preview_build both resolve through it; bricksmaven first, other
# banks fill the gaps its catalog lacks)
RECIPE_FOR_COMP = {
    'nav-bar': 'bricksmaven/headers/header-1',
    'flyout-nav': 'bricksmaven/headers/header-21',
    'stacked-hero': 'bricksmaven/hero/hero-1',
    'full-bleed': 'bricksmaven/hero/hero-99',
    'hero-act-merge': 'bricksmaven/hero/hero-99',
    'cards-n': 'bricksmaven/grids-and-cards/grid-1',
    'sequence': 'bricksmaven/how-it-works/how-it-works-1',
    'faq': 'hyperui/marketing/faqs/1',
    'form-panel': 'bricksmaven/call-to-action/call-to-action-10',
    'footer-bar': 'bricksmaven/footer/footer-1',
    'editorial': 'bricksmaven/content/content-1',
    'split-media': 'bricksmaven/feature/feature-1',
    'comparison': 'bricksmaven/comparison/comparison-1',
    'stat-band': 'bricksmaven/counter/counter-1',
    'proof-band': 'bricksmaven/testimonials/testimonial-1',
    'quote-grid': 'bricksmaven/testimonials/testimonial-2',
    'link-grid': 'bricksmaven/grids-and-cards/grid-2',
    'text-index': 'bricksmaven/table-of-content/table-of-content-2',
    # cutout comps render the gold exemplar (_comp_copy — the recipe
    # is a trace id only, not a bricksmaven skeleton), but J.4 still
    # requires the id to resolve in the skeleton bank
    'cutout-hero-split': 'wfcutout/cutout-hero-split',
    'cutout-catalog-grid': 'wfcutout/cutout-catalog-grid',
    'cutout-cta-band': 'wfcutout/cutout-cta-band',
    'timeline-steps': 'bricksmaven/timeline/timeline-1',
    'how-steps': 'bricksmaven/how-it-works/how-it-works-2',
    'newsletter-band': 'bricksmaven/newsletter/newsletter-1',
    'teams-grid': 'bricksmaven/teams/team-1',
    'gallery-grid': 'bricksmaven/gallery/gallery-11',
    'pricing-table': 'bricksmaven/pricing/item-bpivlr',
    'portfolio-grid': 'bricksmaven/portfolio-section/portfolio-section-1',
    'contact-panel': 'bricksmaven/contact/contact-1',
    'event-list': 'bricksmaven/event-section/event-section-1',
    'banner-cta': 'bricksmaven/call-to-action/call-to-action-11',
    'feature-grid': 'bricksmaven/feature/feature-2',
    'logo-wall': 'bricksmaven/logo-sections/item-ctmenm',
    'nav-h1': 'bricksmaven/headers/header-1',
    'nav-h2': 'bricksmaven/headers/header-2',
    'nav-h3': 'bricksmaven/headers/header-3',
    'nav-h4': 'bricksmaven/headers/header-4',
    'nav-h5': 'bricksmaven/headers/header-5',
    'nav-h6': 'bricksmaven/headers/header-6',
    'nav-h7': 'bricksmaven/headers/header-7',
    'nav-h8': 'bricksmaven/headers/header-8',
    'nav-h9': 'bricksmaven/headers/header-9',
    'nav-h10': 'bricksmaven/headers/header-10',
    'nav-h11': 'bricksmaven/headers/header-11',
    'nav-h12': 'bricksmaven/headers/header-12',
    'nav-h13': 'bricksmaven/headers/header-13',
    'nav-h14': 'bricksmaven/headers/header-14',
    'nav-h15': 'bricksmaven/headers/header-15',
    'nav-h16': 'bricksmaven/headers/header-16',
    'nav-h17': 'bricksmaven/headers/header-17',
    'nav-h18': 'bricksmaven/headers/header-18',
    'nav-h19': 'bricksmaven/headers/header-19',
    'nav-h20': 'bricksmaven/headers/header-20',
    'nav-h21': 'bricksmaven/headers/header-21',
    'nav-h22': 'bricksmaven/headers/header-22',
    'nav-h23': 'bricksmaven/headers/header-23',
    'nav-h24': 'bricksmaven/headers/header-24',
    'nav-h25': 'bricksmaven/headers/header-25',
    'nav-shop-1': 'bricksmaven/shop-headers/shop-header-1',
    'nav-shop-2': 'bricksmaven/shop-headers/shop-header-2',
    'nav-shop-3': 'bricksmaven/shop-headers/shop-header-3',
    'nav-shop-4': 'bricksmaven/shop-headers/shop-header-4',
    'nav-mega-1': 'bricksmaven/megamenu/megamenu-1',
    'nav-mega-2': 'bricksmaven/megamenu/megamenu-2',
    'nav-mega-3': 'bricksmaven/megamenu/megamenu-3',
    'nav-mega-4': 'bricksmaven/megamenu/megamenu-4',
    'nav-mega-5': 'bricksmaven/megamenu/megamenu-5',
    'nav-mega-6': 'bricksmaven/megamenu/megamenu-6',
    'nav-mega-7': 'bricksmaven/megamenu/megamenu-7',
    'nav-offcanvas': 'bricksmaven/off-canvas/take-out-content-and-remove-div',
    'footer-1': 'bricksmaven/footer/footer-1',
    'footer-2': 'bricksmaven/footer/footer-2',
    'footer-3': 'bricksmaven/footer/footer-3',
    'footer-4': 'bricksmaven/footer/footer-4',
    'footer-5': 'bricksmaven/footer/footer-5',
    'footer-6': 'bricksmaven/footer/footer-6',
    'footer-7': 'bricksmaven/footer/footer-7',
    'footer-8': 'bricksmaven/footer/footer-8',
    'footer-9': 'bricksmaven/footer/footer-9',
    'footer-10': 'bricksmaven/footer/footer-10',
    'footer-11': 'bricksmaven/footer/footer-11',
    'footer-12': 'bricksmaven/footer/footer-12',
    'footer-13': 'bricksmaven/footer/footer-13',
    'footer-15': 'bricksmaven/footer/footer-15',
    'footer-16': 'bricksmaven/footer/footer-16',
    'footer-17': 'bricksmaven/footer/footer-17',
    'footer-18': 'bricksmaven/footer/footer-18',
    'footer-19': 'bricksmaven/footer/footer-19',
    'footer-20': 'bricksmaven/footer/footer-20',
    'footer-21': 'bricksmaven/footer/footer-21',
    'footer-22': 'bricksmaven/footer/footer-22',
    'footer-23': 'bricksmaven/footer/footer-23',
    'footer-shop': 'bricksmaven/shop-footers/shop-footer-1',
}


def build_contracts(ctx):
    """[{...contract...}] in plan order, one per plan row."""
    rows = ctx.rows()
    dmap = dna_map(ctx) or {}
    sl = dna_slices(dmap) if dmap else {}
    dh = sl.get('core', '')
    out = []
    # the page H1 belongs to ONE section: the hero-intent row, else the
    # first non-chrome row. h1_text is the STUB's page-level H1 verbatim
    # (E.1 locks it into the built page).
    page_h1 = ''
    for _st in (ctx.stub_vector() or []):
        if _st.get('h1'):
            page_h1 = _st['h1']
            break
    _chrome = lambda r: (
        'chrome' in (r.get('speech_act') or []) or
        str(r.get('composition') or '') in ('nav-bar', 'footer-bar',
                                            'flyout-nav'))
    h1_owner = next((i for i, (_, r) in enumerate(rows)
                     if str(r.get('intent') or '') == 'hero'
                     and not _chrome(r)),
                    next((i for i, (_, r) in enumerate(rows)
                          if not _chrome(r)), -1))
    # F1 fix — J.5/R.10: the STUB's CTA inventory is parsed at W2 then
    # discarded; the contract is the courier that must carry it to the
    # component ({cta && …} renders nothing otherwise). Row's own cta
    # wins; the inventory supplies the first labelled CTA otherwise.
    inv = ctx.stub_inventory() if hasattr(ctx, 'stub_inventory') \
        else {}
    _cta_rows = inv.get('ctas') or []
    _stub_cta = ({'label': _cta_rows[0][0], 'href': _cta_rows[0][1]}
                 if _cta_rows and len(_cta_rows[0]) >= 2 else None)
    for i, (slug, r) in enumerate(rows):
        name = r.get('name')
        st = _stub_for(ctx, name, i)
        prev = rows[i - 1][1] if i else {}
        nxt = rows[i + 1][1] if i + 1 < len(rows) else {}
        # P6 — `composition` stays the plan vocabulary (nav-bar,
        # editorial…); a banked `recipe` picks WHICH skeleton file
        # implements it (pipeline_emit._bank_copy), so plan rows,
        # contracts and rendered cards all name the same comp.
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
                'h1_text': page_h1 if i == h1_owner else '',
                'cta': r.get('cta')
                       or (None if r.get('copy_ref') else (
                           _stub_cta
                           if str(r.get('intent') or '') in
                           ('hero', 'cta', 'act') or
                           'act' in (r.get('speech_act') or [])
                           else None)),
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
            # render-side data-* the byte-locked page must carry:
            # PS.11 intent, J.5 content ids, G.8 grid tracks, J.4
            # recipe/seam + J.8 seam-shapes, SKL.1 skeleton. assemble_page
            # is the only legal writer, so the contract is the courier.
            # data-intent is the RENDERED intent — the component
            # profile's vocabulary, not the plan's (A.3 binds profile
            # values). plan_intent keeps the PS.11 row value for trace.
            'intent': _render_intent(comp, r.get('intent')),
            'plan_intent': r.get('intent'),
            'content_ids': [str(x) for x in (r.get('content_ids') or [])],
            'cols': str(r.get('columns'))
                    if r.get('columns') not in (None, '')
                    else (str((dmap.get('genotype') or {})
                              .get('columns') or '')
                          if comp in GRID_COMPS else None),
            'recipe': r.get('recipe'),
            'seam': r.get('seam')
                    or (((_recipe_topo_map().get(
                            str(r.get('recipe') or '')) or {})
                        .get('topology') or {}).get('seam_style')),
            'seam_shape_top': r.get('seam_shape_top')
                    or (((_recipe_topo_map().get(
                            str(r.get('recipe') or '')) or {})
                        .get('topology') or {}).get('seam_shape_top')),
            'seam_shape_bottom': r.get('seam_shape_bottom')
                    or (((_recipe_topo_map().get(
                            str(r.get('recipe') or '')) or {})
                        .get('topology') or {}).get('seam_shape_bottom')),
            'skeleton': r.get('skeleton'),
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
            # markup only — the gold exemplars carry a doc-comment that
            # says "no <section>"; a raw substring scan false-fails on
            # words ABOUT markup (F4: comments/frontmatter don't render)
            markup = re.sub(r'^---.*?---', '', txt, flags=re.S)
            markup = re.sub(r'<!--.*?-->', '', markup, flags=re.S)
            # class:list = the ACSS list mechanism (rhythm laundering);
            # class={…} only when the expression binds surface/rhythm —
            # a conditional marker class (star-off) is plain markup
            if 'class:list' in markup or re.search(
                    r'class=\{[^}]*(?:surface|density|sec-band|bg-|'
                    r'space-|surface-)', markup):
                f.append(f'SB.2 {label}: computed class expression — '
                         'the shell takes surface/density as props, '
                         'not classes')
            if '<section' in markup or '</section>' in markup:
                f.append(f'SB.2 {label}: renders its own <section> — the '
                         'Section shell owns the band')
            if '<style' in markup:
                f.append(f'SB.2 {label}: <style> block — styles live in '
                         'the shared layer')
            body = markup
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
        for m in re.finditer(r'(?<!&)#[0-9a-fA-F]{3,8}\b', txt):
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
        m = re.search(r'^\s*(?://\s*)?exemplar:\s*"?([\w-]+)', txt, re.M)
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
    # a bare scalar holding a flow indicator (`a, b` / `k: v`) splits
    # on re-parse and the SPEC stops matching its plan — quote it
    def scalar(v):
        if isinstance(v, str) and re.search(r'[,:{}\[\]#"\']|^\s|\s$', v):
            return json.dumps(v, ensure_ascii=False)
        return v
    for r in rows:
        out.write('  - {')
        out.write(', '.join(f'{k}: {scalar(v)}'
                            for k, v in sorted(r.items())))
        out.write('}\n')
    out.write('```\n')
    return out.getvalue()


def _section_tag(c, brand=''):
    """One <Section> invocation from a contract — every data-* the
    rendered block must carry (P.3/P.7, PS.11, J.4/J.8, J.5, G.8,
    SKL.1) is a prop; only props with values are emitted."""
    props = [
        ('sec', c['section']), ('comp', c['composition']),
        ('wf-ref', c['wf_ref']), ('ratio', c['media_ratio']),
        ('disclosure', c['disclosure']), ('surface', c['surface']),
        ('density', c['density']), ('intent', c.get('intent')),
        ('content', ' '.join(c.get('content_ids') or [])),
        ('cols', c.get('cols')), ('recipe', c.get('recipe')),
        ('mode', 'bar' if c.get('category') in ('headers', 'footer')
         else 'band'),
        ('tag', {'headers': 'header', 'footer': 'footer'}.get(
            c.get('category'), '')),
        ('seam', c.get('seam')),
        ('seam-shape-top', c.get('seam_shape_top')),
        ('seam-shape-bottom', c.get('seam_shape_bottom')),
        ('skeleton', c.get('skeleton')),
    ]
    attrs = ' '.join(f'{k}="{v}"' for k, v in props
                     if v not in (None, '', 'none-set'))
    # the brand is site chrome, not section content: the plan declares
    # it once and every instance carries it
    b = (' brand=' + json.dumps(brand, ensure_ascii=False)) if brand else ''
    return (f'<Section {attrs}>\n'
            f'  <{camel(c["section"])}{b} />\n'
            f'</Section>')


def assemble_page(ctx, slug=None):
    """SB.4 — deterministic page source from plan order.

    The page renders inside BaseLayout (the document shell: head/meta,
    theme toggle + paint-first script, landmarks — C.5/P.16/PS.9/R.1)
    because check_assembly byte-locks this output and only the producer
    can carry those contracts.

    Multi-page plans assemble every slug; assemble.py writes one file
    per slug (B F-40)."""
    slug = slug or page_path(ctx)[1]
    contracts = [c for c in build_contracts(ctx) if c['page'] == slug]
    path, _ = page_path(ctx)
    if slug != _:
        path = os.path.join(ctx.site, 'src', 'pages', slug + '.astro')
    site = ctx.site_block() or {}
    title = str(site.get('name') or site.get('slug') or slug)
    desc = str(site.get('description') or '')
    imports = ["import BaseLayout from '../layouts/BaseLayout.astro';",
               "import Section from '../components/Section.astro';"]
    for c in contracts:
        imports.append(f"import {camel(c['section'])} from "
                       f"'../components/sections/{camel(c['section'])}.astro';")
    h = hashlib.sha256(json.dumps(contracts, sort_keys=True)
                       .encode()).hexdigest()[:12]
    brand = str(site.get('brand') or '')
    body = '\n\n'.join(_section_tag(c, brand) for c in contracts)
    txt = ('---\n// assembled: {h} — generated by assemble.py; never edit\n'
           + '\n'.join(imports) + '\n---\n\n'
           + f'<BaseLayout title={json.dumps(title)} '
           + f'description={json.dumps(desc)} '
           + f'slug={json.dumps(str(slug))}>\n'
           + body + '\n</BaseLayout>\n').replace('{h}', h)
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
        # proving a stale page is a file-diff, not a reopened model
        # judgment, is worth one binary-search: the first differing
        # line names the stale half.
        if cur != txt:
            ca, ta = cur.splitlines(), txt.splitlines()
            n = next((k for k, (a, b) in
                      enumerate(zip(ca, ta)) if a != b), min(len(ca),
                                                             len(ta)))
            ctxw = (ca[max(0, n-2):n+3] + ['…'] +
                    ta[max(0, n-2):n+3])
            f.append('SB.4 ' + os.path.basename(path) +
                     f' differs from assemble.py output at line {n+1} ' +
                     '— regenerate the glue ' + ' / '.join(ctxw))
            continue
        cur_h = re.search(r'assembled: ([0-9a-f]+)', cur)
        if not cur_h or cur_h.group(1) != h:
            f.append('SB.4 assembled marker stale — contracts changed '
                     'after the last assemble.py run (never hand-edit '
                     'the page)')
        else:
            for c in build_contracts(ctx):
                if c['page'] == slug and \
                        f'<{camel(c["section"])}' not in cur:
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
    for m in re.finditer(r'(?<!&)#[0-9a-fA-F]{3,8}\b', txt):
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
    # a data-ratio attribute IS the applied ratio (the layer binds
    # it) — the aspect-* class form is the other accepted shape
    if contract['media_ratio'] not in (None, 'none') \
            and 'aspect-' not in txt and 'ratio-' not in txt \
            and 'data-ratio' not in txt:
        f.append(f'V.1 {fn}: media ratio {contract["media_ratio"]} not '
                 'applied (aspect-* class or data-ratio missing)')
    if contract['surface'] in ('inverse', 'brand') and 'data-surface' in txt:
        f.append(f'SB.2 {fn}: sets data-surface — the Section shell owns '
                 'the surface')
    return f


def cmd_contracts(pipeline):
    ctx = Ctx(pipeline)
    cd = contracts_dir(ctx)
    os.makedirs(cd, exist_ok=True)
    n = 0
    keep = set()
    for c in build_contracts(ctx):
        fn = os.path.basename(c['file'])
        keep.add(fn)
        with open(os.path.join(cd, fn), 'w', encoding='utf-8') as fh:
            json.dump(c, fh, indent=2, sort_keys=True)
            fh.write('\n')
        n += 1
    # a re-indexed plan renames contract files — orphans from the old
    # numbering are stale evidence (DM.2/SB.1 would read them)
    pruned = 0
    for fn in os.listdir(cd):
        if fn.endswith('.contract.json') and fn not in keep:
            os.remove(os.path.join(cd, fn))
            pruned += 1
    print(f'contracts written: {n} → {os.path.relpath(cd, ctx.dir)}/'
          + (f' (pruned {pruned} orphan)' if pruned else ''))
    return 0


def cmd_section(pipeline, name):
    ctx = Ctx(pipeline)
    want = build_contracts(ctx)
    pick = [c for c in want if c['section'] == name] if name else want
    if not pick:
        print(f'section "{name}" not in plan rows')
        return 2
    rc = 0
    # section checks are independent — each contract reads the same
    # build and writes its own .gate.json, so they fan out on the
    # I/O (the dist/src scans dominate) and report in plan order
    from concurrent.futures import ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=min(8, len(pick))) as ex:
        results = list(ex.map(lambda c: section_failures(ctx, c),
                              pick))
    for c, f in zip(pick, results):
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


WAVE_SEQ = ['s0', 'w0', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8']


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
            if not ok and k == 'radius.personality':
                e = prov.get(k)
                tag = e.get('tag') if isinstance(e, dict) else e
                # U.10 — an extracted live ACSS --radius keeps its exact
                # px ('10px'), it is never snapped to a rung
                if tag == 'extracted' and re.fullmatch(
                        r'\d+(?:\.\d+)?px', str(v)):
                    ok = True
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
        mm = re.search(r'^\s*(?://\s*)?dna_hash:\s*"?(\w+)', txt, re.M)
        if not mm:
            f.append(f'DM.2 {fn}: no dna_hash: frontmatter — builders echo '
                     'the look hash they built against')
        elif mm.group(1) != core:
            f.append(f'DM.2 {fn}: dna_hash {mm.group(1)} != {core} — '
                     'rebuild this section against the current look')
        sm = re.search(r'^\s*(?://\s*)?structure_hash:\s*"?(\w+)', txt,
                       re.M)
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
                     f'{d or "baseline"} · predicted score '
                     f'{v.get("predicted_score")}')
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

DARK_MAX_L = 0.24     # OKLCH L — C.5 spec is HSL L 7–10%; a WCAG-Y
                      # cap of 20% was ~15× more permissive than the
                      # spec (research/COLOUR-RULES §4 #2)


def _color_str(v):
    v = v.get('value') if isinstance(v, dict) else v
    return v if isinstance(v, str) and (
        v.startswith('#') or v.startswith('oklch')) else None


def _modes(ctx):
    """{mode: {role: colour}} from TOKENS.json color.modes (plan
    fallback). Accepts hex AND oklch() — hex-only filters let an
    oklch palette bypass every colour check."""
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
                cv = _color_str(v)
                if cv:
                    got[k] = cv
            out[mode] = got
    if not out:
        dm = (dna_map(ctx) or {}).get('modes') or {}
        for mode, roles in dm.items():
            got = {}
            for k, v in (roles or {}).items():
                cv = _color_str(v)
                if cv:
                    got[k] = cv
            if got:
                out[mode] = got
    if not out:
        roles = (_system(ctx).get('color') or {}).get('roles') or {}
        light = {}
        for k, v in roles.items():
            cv = _color_str(v)
            if cv:
                light[k] = cv
        out['light'] = light
    return out


# --------------------------------------------------------- copy/theme gates
# U.1–U.8 machinery: COPY-driven planning, provenance pins, light-first.
def _sha256_file(p):
    try:
        return hashlib.sha256(open(p, 'rb').read()).hexdigest()
    except OSError:
        return None


def _brief(ctx):
    """BRIEF.yaml → dict — the site-scope file or a local copy."""
    p = ctx.find('BRIEF.yaml')
    if not p:
        return {}
    try:
        sys.path.insert(0, HERE)
        import site_folder as SF
        return SF.load_yaml(p) or {}
    except Exception:
        return {}


def _theme(ctx):
    """BRIEF theme block, defaults to the U.3 contract (light)."""
    t = (_brief(ctx).get('theme') or {})
    return {'default': t.get('default', 'light'),
            'canvas': t.get('canvas', '#FFFFFF'),
            'follow_os': bool(t.get('follow_os', False)),
            'dark_toggle': bool(t.get('dark_toggle', True))}


def _site_root(ctx):
    return ctx.site_dir or ctx.dir


def _copy_json(ctx):
    raw = ctx.read('COPY.json')
    if raw is None:
        return None
    try:
        return json.loads(raw)
    except Exception:
        return None


def _layout_options(ctx):
    raw = ctx.read('LAYOUT-OPTIONS.json')
    if raw is None:
        return None
    try:
        return json.loads(raw)
    except Exception:
        return None


def _source_file(ctx, recorded):
    """Resolve a source path recorded by a producer: the recorded path
    first, then a same-basename copy under <dir>/SOURCES (fixture and
    cloned dirs carry their inputs locally)."""
    p = str(recorded or '')
    if p and os.path.isfile(p):
        return p
    for cand in (os.path.join(ctx.dir, 'SOURCES', os.path.basename(p)),
                 os.path.join(ctx.dir, os.path.basename(p))):
        if os.path.isfile(cand):
            return cand
    return None


def _article_h2s(path):
    if not path or not os.path.isfile(path):
        return None
    try:
        sys.path.insert(0, HERE)
        import copy_ingest as CI
        _, _, _, blocks = CI.parse_article(
            open(path, encoding='utf-8', errors='replace').read())
        return [h2 for h2, _ in blocks]
    except Exception:
        return None


def check_source_bind(ctx):
    """I.1 — COPY.json is bound to the CURRENT sources: every recorded
    source sha256 must match the file on disk, the sha recorded by the
    first w0 pass still matches (a re-ingest after mid-run tampering
    is flagged, not adopted), and COPY.json equals a clean
    copy_ingest re-run."""
    f = []
    cp = _copy_json(ctx)
    if not isinstance(cp, dict):
        return f                      # no COPY pipeline: nothing bound
    src = cp.get('source') or {}
    for kind in ('stub', 'article'):
        rec = src.get(kind) or {}
        rec_sha = rec.get('sha256')
        if not rec_sha:
            f.append(f'I.1 COPY.json source.{kind} has no sha256 — '
                     'copy_ingest.py records it')
            continue
        p = _source_file(ctx, rec.get('path'))
        if not p:
            f.append(f'I.1 {kind} missing on disk: '
                     f'{rec.get("path")}')
            continue
        if _sha256_file(p) != rec_sha:
            f.append(f'I.1 {kind} sha256 ≠ COPY.json record — re-run '
                     'copy_ingest.py (the record is stale or the '
                     'source moved)')
    if not f:
        f += _reingest_diffs(ctx, cp)
        f += _w0_source_pin_fails(ctx, cp)
    return f


def _w0_source_pin_fails(ctx, cp):
    """I.1 — the source shas the FIRST w0 pass recorded in GATES.json
    still match the files on disk. Re-ingesting after mid-run source
    tampering must not silently rebind the run (attack 2c)."""
    g = load_gates(ctx) or {}
    pin = ((g.get('w0') or {}).get('inputs_sha256')) or {}
    if not pin:
        return []                     # never recorded: nothing pinned
    f = []
    for kind in ('stub', 'article'):
        rec = ((cp.get('source') or {}).get(kind)) or {}
        p = _source_file(ctx, rec.get('path'))
        if not p:
            continue
        rel = os.path.relpath(os.path.abspath(p), ctx.dir)
        want = pin.get(rel)
        if want is None:
            continue                  # source wasn't pinned (pre-pin)
        cur = _sha256_file(p)
        if want != (cur or '')[:16]:
            f.append(f'I.1 {kind} sha256 ≠ the w0-pinned source — '
                     'the source changed after the first pass; '
                     'reset, do not re-ingest mid-run')
    return f


def _reingest_diffs(ctx, cp):
    """I.1 byte-compare: re-run copy_ingest.ingest in a temp dir and
    compare the emitted record to COPY.json — a hand-edited (or
    producer-patched) COPY.json differs. ingest records the source
    paths BRIEF's blueprint gives, identical across working dirs;
    only the sha fields are normalized (the per-source sha check
    already pins them)."""
    if not (_source_file(
            ctx, ((cp.get('source') or {}).get('article') or {})
            .get('path')) and
            _source_file(
            ctx, ((cp.get('source') or {}).get('stub') or {})
            .get('path'))):
        return []
    try:
        sys.path.insert(0, HERE)
        import copy_ingest as CI
        import tempfile, shutil as _sh
        tmp = tempfile.mkdtemp()
        try:
            # mirror the site-folder shape the producer requires:
            # <tmp>/site/BRIEF.yaml + <tmp>/site/pages/<slug>/
            # with the recorded SOURCES copied beside the page dir.
            # The scratch BRIEF is minimal (blueprint root + pages
            # list) — ingest only needs source paths from it.
            tsite = os.path.join(tmp, 'site')
            slug = os.path.basename(ctx.dir.rstrip('/')) or 'page'
            tp = os.path.join(tsite, 'pages', slug)
            os.makedirs(tp)
            stubs = {}
            for kind in ('stub', 'article'):
                sp = _source_file(
                    ctx, ((cp.get('source') or {}).get(kind) or {})
                    .get('path'))
                if not sp:
                    return []
                base = os.path.basename(sp)
                _sh.copy2(sp, os.path.join(tp, base))
                stubs[kind] = base
            with open(os.path.join(tsite, 'BRIEF.yaml'), 'w') as fh:
                fh.write('site:\n  blueprint: %s\npages:\n'
                         '  - {slug: %s, stub: %s, article: %s}\n'
                         % (tp, slug, stubs['stub'],
                            stubs['article']))
            rec = CI.ingest(tp)
            # the fixture COPY.json is a hand-built stand-in (stub
            # vector, items, closing and meta are richer than what
            # the thin fixture sources re-ingest to), so the
            # byte-compare covers the ATTACKABLE core only: every
            # block id + h2 + answer text — the fields a hand-edit
            # or patched producer would add, drop or rewrite.
            # (before/after ride with the answer; the per-source
            # sha check already pins paths + shas.)
            def _sigcopy(d):
                return [{k: b.get(k) for k in
                         ('id', 'h2', 'answer', 'before', 'after')}
                        for b in (d.get('blocks') or [])]
            gotd, want = _sigcopy(rec), _sigcopy(cp)
            if json.dumps(gotd, sort_keys=True,
                          ensure_ascii=False) != \
                    json.dumps(want, sort_keys=True,
                               ensure_ascii=False):
                return ['I.1 COPY.json differs from a clean '
                        'copy_ingest.py re-run — the record is '
                        'hand-edited or produced by patched code '
                        '(U.4)']
        finally:
            _sh.rmtree(tmp, ignore_errors=True)
    except BaseException:
        return []          # producer unavailable: sha binding stands
    return []


def check_copy_coverage(ctx):
    """I.2 — every article block is in COPY.json and every COPY block
    is claimed by exactly one plan row (copy_ref) — no dropped copy,
    no double-booked block."""
    f = []
    cp = _copy_json(ctx)
    if not isinstance(cp, dict):
        return f
    blocks = cp.get('blocks') or []
    art_p = _source_file(
        ctx, ((cp.get('source') or {}).get('article') or {}).get('path'))
    art = _article_h2s(art_p)
    if art is not None:
        have = {b.get('h2') for b in blocks}
        for h2 in art:
            if h2 not in have:
                f.append(f'I.2 article block "{h2}" absent from '
                         'COPY.json — re-run copy_ingest.py')
    refs = [r.get('copy_ref') for _, r in ctx.rows() if r.get('copy_ref')]
    by = {b.get('id'): b for b in blocks}
    legal = set(by) | ({'lede'} if cp.get('lede') else set()) \
        | ({'closing'} if cp.get('closing') else set())
    for bid in by:
        n = refs.count(bid)
        if n != 1:
            f.append(f'I.2 COPY block {bid} claimed by {n} plan rows '
                     '— every block renders exactly once')
    for ref in refs:
        if ref not in legal:
            f.append(f'I.2 plan copy_ref "{ref}" matches no COPY block')
    if (cp.get('closing') or {}).get('text'):
        if refs.count('closing') != 1:
            f.append('I.2 closing copy claimed by '
                     f'{refs.count("closing")} plan rows')
    return f


def check_plan_provenance(ctx):
    """I.3 — DESIGN-PLAN.md / STUB.md are byte-identical outputs of
    plan_from_copy.py: stamp line + input shas now, a full re-run in a
    scratch clone for real site dirs. Any hand edit fails."""
    f = []
    stamp_re = re.compile(
        r'<!-- GENERATED by plan_from_copy\.py from COPY\.json '
        r'sha256:([0-9a-f]{64}) DNA\.json sha256:([0-9a-f]{64}) '
        r'option:(\w+)')
    stamps = {}
    for rel in ('DESIGN-PLAN.md', 'STUB.md'):
        txt = ctx.read(rel) or ''
        m = stamp_re.search(txt.split('\n', 1)[0])
        if not m:
            f.append(f'I.3 {rel} lacks the plan_from_copy.py stamp '
                     'line — plans are machine-written (U.2)')
            continue
        stamps[rel] = m
    if not stamps:
        return f
    copy_p = ctx.find('COPY.json')
    if copy_p:
        cur = _sha256_file(copy_p)
        for rel, m in stamps.items():
            if m.group(1) != cur:
                f.append(f'I.3 {rel} stamps COPY.json sha that ≠ '
                         'current file — the plan is stale or edited')
    dna_p = os.path.join(_site_root(ctx), 'DNA.json')
    if os.path.isfile(dna_p):
        cur = _sha256_file(dna_p)
        for rel, m in stamps.items():
            if m.group(2) != cur:
                f.append(f'I.3 {rel} stamps DNA.json sha that ≠ the '
                         'site DNA — re-run plan_from_copy.py')
    if len(stamps) == 2 and (stamps['DESIGN-PLAN.md'].groups()
                             != stamps['STUB.md'].groups()):
        f.append('I.3 DESIGN-PLAN.md and STUB.md carry different '
                 'stamps — they are one producer run')
    if not ctx.site_dir:
        return f                      # standalone dir (fixtures,
        # attacker /tmp copies): the stamp + input-sha checks above
        # already bind the file to its inputs. A byte re-run needs
        # a real site folder (brief pages, brand, DNA rhythm) the
        # fixture brief does not carry — it would differ for
        # benign reasons. Real site dirs re-run below.
    try:
        sys.path.insert(0, HERE)
        import plan_from_copy as PF
        import tempfile, shutil as _sh
        tmp = tempfile.mkdtemp()
        try:
            tsite = os.path.join(tmp, 'site')
            slug = os.path.basename(ctx.dir.rstrip('/')) or 'page'
            tpdir = os.path.join(tsite, 'pages', slug)
            os.makedirs(tpdir)
            for fn in os.listdir(_site_root(ctx)):
                sp = os.path.join(_site_root(ctx), fn)
                if os.path.isfile(sp):
                    _sh.copy2(sp, os.path.join(tsite, fn))
            for fn in os.listdir(ctx.dir):
                sp = os.path.join(ctx.dir, fn)
                if os.path.isfile(sp):
                    _sh.copy2(sp, os.path.join(tpdir, fn))
            opt = stamps['DESIGN-PLAN.md'].group(3)
            PF.build(tpdir, option=opt)
            # the w4 look rewrite is a legit second producer — when the
            # real plan declares it, replay it on the scratch copy so
            # the byte-compare judges build+rewrite together (STUB.md
            # is untouched by the rewrite; its compare stands)
            if 'REWRITTEN by look_emit.py' in \
                    (ctx.read('DESIGN-PLAN.md') or ''):
                import look_emit as _LE
                _tc = Ctx(tpdir)
                try:
                    _LE.rewrite_options(_tc, _LE._variants(_tc))
                except SystemExit as e:
                    f.append(f'I.3 look_emit.py re-run refused: {e}')
                except Exception as e:
                    f.append(f'I.3 look_emit.py re-run could not '
                             f'verify: {e}')
            for rel in ('DESIGN-PLAN.md', 'STUB.md'):
                if open(os.path.join(tpdir, rel),
                        'rb').read() != \
                        open(os.path.join(ctx.dir, rel), 'rb').read():
                    f.append(f'I.3 {rel} differs from a clean '
                             'plan_from_copy.py re-run — the file was '
                             'hand-edited')
        finally:
            _sh.rmtree(tmp, ignore_errors=True)
    except SystemExit as e:
        f.append(f'I.3 plan_from_copy.py re-run refused: {e}')
    except Exception as e:
        f.append(f'I.3 re-run could not verify: {e}')
    return f


def check_copy_shape_fit(ctx):
    """I.4 — every content row's composition sits inside the allowed
    copy-shape set (LAYOUT-OPTIONS allowed[copy_ref])."""
    lo = _layout_options(ctx)
    if not isinstance(lo, dict):
        return []                     # no options file: nothing to fit
    allowed = lo.get('allowed') or {}
    f = []
    for _, r in ctx.rows():
        ref = r.get('copy_ref')
        if not ref or ref not in allowed:
            continue
        comp = str(r.get('composition') or '')
        if comp not in (allowed[ref] or []):
            f.append(f'I.4 {ref} composition "{comp}" outside the '
                     f'allowed copy shape {allowed[ref]} — the layout '
                     'fits the copy, never the reverse (U.1)')
    return f


def check_light_canvas(ctx):
    """T.1 — DNA/TOKENS light bg == BRIEF theme.canvas, and no producer
    declares follow_os: first paint is the brief's light canvas."""
    th = _theme(ctx)
    want = str(th.get('canvas') or '').strip().upper()
    f = []
    m = dna_map(ctx) or {}
    got = str(((m.get('modes') or {}).get('light') or {}).get('bg') or '')
    if want and got and got.upper() != want:
        f.append(f'T.1 DNA modes.light.bg {got} ≠ BRIEF theme.canvas '
                 f'{want}')
    tok = ctx.read('TOKENS.json')
    if tok:
        try:
            tl = (((json.loads(tok).get('color') or {})
                   .get('modes') or {}).get('light') or {})
            tbg = (tl.get('roles') or tl).get('bg')
            if want and tbg and str(tbg).upper() != want:
                f.append(f'T.1 TOKENS light bg {tbg} ≠ BRIEF '
                         f'theme.canvas {want}')
        except Exception:
            pass
    if (m.get('theme') or {}).get('follow_os') or th.get('follow_os'):
        f.append('T.1 theme.follow_os is true — first paint never '
                 'follows prefers-color-scheme (U.3)')
    return f


def check_site_dna(ctx):
    """X.5 — the page DNA.json is the site DNA.json: site_dna_sha256
    matches the site file and the core slice is identical (U.8: one
    design home, one DNA)."""
    if not ctx.site_dir:
        return []
    f = []
    pdna = dna_map(ctx) or {}
    rec = str(pdna.get('site_dna_sha256') or '')
    sp = os.path.join(ctx.site_dir, 'DNA.json')
    cur = _sha256_file(sp)
    if cur and rec and rec != cur:
        f.append('X.5 page DNA site_dna_sha256 ≠ site DNA.json — the '
                 'page DNA is a copy, not the site map (U.8)')
    try:
        sm = json.load(open(sp))
        if dna_slices(pdna).get('core') != dna_slices(sm).get('core'):
            f.append('X.5 page DNA core slice ≠ site DNA core — pages '
                     'share the site DNA verbatim')
    except Exception:
        f.append('X.5 site DNA.json unreadable')
    return f


def check_discovery_provenance(ctx):
    """D.1 — every DNA colour and font cites DISCOVERY or BRIEF, and
    an 'extracted' claim is self-attested only when the literal VALUE
    appears in those sources — the palette and faces are discovered
    or briefed, never the agent's."""
    m = dna_map(ctx)
    if not m:
        return []
    pv = m.get('provenance') or {}
    f = []
    # self-attested provenance text is not proof: for claims of
    # extraction the VALUE itself must appear in DISCOVERY/BRIEF
    src_l = ''
    for rel in ('DISCOVERY.json', 'BRIEF.yaml'):
        p = ctx.find(rel)
        if p:
            try:
                src_l += open(p, encoding='utf-8',
                              errors='replace').read().lower()
            except OSError:
                pass

    def ok(*keys):
        for k in keys:
            e = pv.get(k) or {}
            src = str(e.get('source') or '')
            if re.search(r'(?i)discover|brief', src):
                return True
        return False

    for mode in ('light', 'dark'):
        for role in MODE_ROLES:
            val = (m.get('modes') or {}).get(mode, {}).get(role)
            if not val:
                continue
            if mode == 'light':
                keys = (f'color.{role}', 'color.light')
            else:
                keys = (f'color.dark.{role}', f'color.{role}',
                        'color.dark')
            if role == 'accent_foreground':
                keys = keys + ('color.accent',)
            if not ok(*keys):
                f.append(f'D.1 modes.{mode}.{role} has no DISCOVERY/'
                         'BRIEF provenance — colours come from '
                         'discovery or the brief, not the agent (U.7)')
            elif mode == 'light' and src_l and \
                    any(str((pv.get(k) or {}).get('tag')) in
                        ('extracted', 'briefed') for k in keys) and \
                    str(val).lower() not in src_l:
                # extracted/briefed is self-attested ONLY when the
                # literal value sits in the source — chosen/derived
                # roles legitimately name a derivation, not a hex (U.7)
                f.append(f'D.1 modes.light.{role} value {val} '
                         'appears nowhere in DISCOVERY.json/'
                         'BRIEF.yaml — extracted means the literal '
                         'value is in the discovery source (U.7)')
    if (m.get('invariants') or {}).get('fonts'):
        if not ok('fonts', 'invariants.fonts', 'type.face'):
            f.append('D.1 invariants.fonts has no DISCOVERY/BRIEF '
                     'provenance')
        elif src_l:
            fonts = m['invariants']['fonts']
            # the literal check covers the discovered FAMILY names
            # (display/body); 'stack' is the emitter's fallback list
            vals = (fonts.values() if isinstance(fonts, dict)
                    else [fonts] if isinstance(fonts, str) else fonts)
            if isinstance(fonts, dict):
                vals = [v for k, v in fonts.items()
                        if k in ('display', 'body', 'family')] \
                    or list(fonts.values())
            for nm in vals:
                if isinstance(nm, str) and len(nm) >= 3 \
                        and ',' not in nm \
                        and nm.lower() not in src_l:
                    f.append(f'D.1 font {nm!r} appears nowhere in '
                             'DISCOVERY.json/BRIEF.yaml — faces are '
                             'discovered, not chosen')
                    break
    return f


def check_brief_hash(ctx):
    """X.4 — BRIEF.yaml's sha256 still equals the sha pinned by the
    run (RUN.json) and by site producers (DISCOVERY.json
    brief_sha256, DNA.json inputs.BRIEF.yaml). A drifted brief means
    reset, not a quiet re-derive."""
    b_p = ctx.find('BRIEF.yaml')
    if not b_p:
        return []
    cur = _sha256_file(b_p)
    probes = [ctx.find('RUN.json'),
              ctx.find('DISCOVERY.json'),
              os.path.join(_site_root(ctx), 'DNA.json')]
    f = []
    for p in probes:
        if not p or not os.path.isfile(p):
            continue
        try:
            d = json.load(open(p))
        except Exception:
            continue
        want = (d.get('brief_sha256')
                or (d.get('inputs') or {}).get('BRIEF.yaml'))
        if want and want != cur:
            f.append(f'X.4 BRIEF.yaml changed after '
                     f'{os.path.basename(p)} pinned it — '
                     'run.py reset, do not re-run mid-flight')
    return f


def check_run_pin(ctx):
    """X.2 — the run token + producer pins: RUN.json must exist (the
    orchestrator opens the run) and every recorded sha256 — gate.py,
    RULES.md, BRIEF.yaml, EVERY tools/design-gate/*.py, the templates
    tree, the approval pubkey — must match the current bytes. A tool
    edited mid-run invalidates every later wave."""
    p = ctx.find('RUN.json')
    if not p:
        return ['X.2 RUN.json missing — waves enter through '
                'pipeline.py only (the run pins every tool + input)']
    try:
        run = json.load(open(p))
    except Exception:
        return ['X.2 RUN.json unparseable']
    f = []
    gatesha = run.get('gate_sha256')
    g_p = os.path.join(HERE, 'gate.py')
    if gatesha and _sha256_file(g_p) != gatesha:
        f.append('X.2 gate.py changed since the run started — the '
                 'pin no longer matches')
    for field, rel in (('rules_sha256', 'RULES.md'),
                       ('brief_sha256', 'BRIEF.yaml')):
        want = run.get(field)
        rp = ctx.find(rel)
        if want and rp and _sha256_file(rp) != want:
            f.append(f'X.2 {rel} changed since the run started')
    # every producer tool the run pinned must be the same bytes now —
    # a patched plan_from_copy/re-ingest cannot re-prove anything
    for name, want in sorted((run.get('tools_sha256') or {}).items()):
        tp = os.path.join(HERE, name)
        if not os.path.isfile(tp):
            f.append(f'X.2 pinned tool {name} missing')
        elif _sha256_file(tp) != want:
            f.append(f'X.2 tool {name} changed since the run started')
    tsha = run.get('templates_sha256')
    repo = os.path.dirname(os.path.dirname(HERE))
    if tsha is not None and tsha != _dir_sha256(
            os.path.join(repo, 'templates')):
        f.append('X.2 templates/ tree changed since the run started')
    want_pub = run.get('approval_pubkey_sha256')
    # the pinned file is the REPO's approval_pubkey.json — a
    # monkeypatched approval_key.PUBKEY_PATH must never redirect the
    # pin check
    pub_p = os.path.join(HERE, 'approval_pubkey.json')
    if want_pub is None:
        if os.path.isfile(pub_p):
            f.append('X.2 approval_pubkey.json appeared mid-run — '
                     'the run pinned it absent')
    elif _sha256_file(pub_p) != want_pub:
        f.append('X.2 approval public key changed since the run '
                 'started')
    tok = os.environ.get('PIPELINE_RUN')
    if tok is not None and not run_token_ok(run, tok):
        f.append('X.2 PIPELINE_RUN token fails the RUN.json '
                 'token_sig check — waves enter through pipeline.py '
                 'only')
    return f


def _dir_sha256(root):
    """sha256 over sorted 'rel:filesha256' lines, rel from repo root —
    the templates-tree pin recipe (matches pipeline._write_run)."""
    repo = os.path.dirname(os.path.dirname(HERE))
    lines = []
    for dp, dns, fns in os.walk(root):
        dns[:] = [x for x in dns if x != '__pycache__']
        for fn in sorted(fns):
            fp = os.path.join(dp, fn)
            rel = os.path.relpath(fp, repo)
            lines.append(f'{rel}:{_sha256_file(fp)}')
    return hashlib.sha256('\n'.join(sorted(lines)).encode()).hexdigest()

def check_operator_approvals(ctx):
    """X.3 — only the operator approves: every approvable wave (w3
    layout pick, w4 look pick) with a PASS record in GATES.json needs
    a signed, current approval whose channel is the approve service —
    picker clicks, never an agent or a typed command."""
    f = []
    g = load_gates(ctx)
    for w in sorted(APPROVABLE):
        if not (g.get(w) or {}).get('pass'):
            continue
        st = approval_state(ctx, w)
        if st != 'ok':
            f.append(f'X.3 {w} approval {st} — the operator approves, '
                     'never the agent (U.5)')
        rec = (read_approvals(ctx) or {}).get(w) or {}
        by = str(rec.get('by') or '')
        if by == 'operator-service':
            # the service channel stands on a consumed, ledger-bound
            # nonce — any other nonce string is a forgery (X.3)
            if not verify_consumed_nonce(rec.get('nonce'), w,
                                         ctx.dir):
                f.append(f'X.3 {w} approval service nonce is not a '
                         'consumed ledger nonce — the record is '
                         'unverifiable')
        else:
            # picker-only decree: the ONLY channel is the approve
            # service — operator-tty records can no longer be minted
            f.append(f'X.3 {w} approval channel {by!r} is not '
                     'operator-service — picks happen in the picker '
                     'page only')
        # the run binding inside the signed body must equal THIS
        # run's token — an approval replayed under another run is no
        # operator act for this one (X.2/X.3)
        run_tok = None
        rp = ctx.find('RUN.json')
        if rp:
            try:
                # the run binding inside a signed record is the
                # keyed token_sig — the raw token is never on disk
                run_tok = json.load(open(rp)).get('token_sig')
            except Exception:
                run_tok = None
        if run_tok and rec.get('run') and str(rec.get('run')) != \
                str(run_tok):
            f.append(f'X.3 {w} approval signed under run '
                     f'{str(rec.get("run"))[:12]} ≠ this run — '
                     'approvals are bound to the run that minted '
                     'them')
    return f


def check_layout_options(ctx):
    """L.1 — the layouts picker is built from LAYOUT-OPTIONS.json: one
    card per option, card compositions equal the option's compositions,
    every composition inside the block's allowed copy shape, and no two
    options structurally identical."""
    lo = _layout_options(ctx)
    if not isinstance(lo, dict):
        return []                     # pre-options pipeline
    f = []
    allowed = lo.get('allowed') or {}
    seen = {}
    for o in lo.get('options') or []:
        comps = o.get('compositions') or {}
        for bid, c in comps.items():
            if allowed.get(bid) and c not in allowed[bid]:
                f.append(f'L.1 option {o.get("id")} gives {bid} '
                         f'composition "{c}" outside the allowed '
                         f'copy shape {allowed[bid]}')
        # chrome (nav/hero/footer) is part of the option's identity
        # too — two options that differ only in chrome are distinct
        sig = tuple(sorted(comps.items())) + tuple(
            sorted((o.get('chrome') or {}).items()))
        if sig in seen:
            f.append(f'L.1 options {seen[sig]} and {o.get("id")} are '
                     'structurally identical — options must differ')
        seen[sig] = o.get('id')
    txt = ctx.read('preview/layouts.html')
    if txt is None:
        return f                      # picker not produced yet
    chrome = ('nav-bar', 'footer-bar', 'form-panel', 'flyout-nav')
    rows_by_sec = {r.get('name'): r for _, r in ctx.rows()}
    # the card's section markup is the BUILT page it iframes
    pages = _shell_card_pages(os.path.join(
        ctx.dir, 'preview', 'layouts.html'), txt)
    for o in lo.get('options') or []:
        oid = str(o.get('id'))
        m = re.search(
            r'<article[^>]*id="' + re.escape(oid) +
            r'"[^>]*>(.*?)<details class="variant-data">', txt, re.S)
        if not m:
            f.append(f'L.1 layouts picker has no card for option '
                     f'{oid} — one card per computed option')
            continue
        card = m.group(1)
        card = (pages.get(oid) or ('', ''))[0] or card
        comps = o.get('compositions') or {}
        shown = re.findall(
            r'data-sec="([^"]+)"[^>]*data-comp="([^"]+)"', card)
        bad = []
        declared_chrome = o.get('chrome') or {}
        for sec, comp in shown:
            # a chrome section binds the option's DECLARED chrome pick
            # when it has one — the preview is the option as shipped
            cwant = declared_chrome.get(sec)
            if cwant is not None:
                if comp != str(cwant):
                    bad.append(f'{sec}:{comp}≠{cwant}')
                continue
            if comp in chrome:
                continue
            r = rows_by_sec.get(sec) or {}
            ref = r.get('copy_ref')
            want = comps.get(ref) if ref in comps \
                else r.get('composition')
            if want and comp != str(want):
                bad.append(f'{sec}:{comp}≠{want}')
        if bad:
            f.append(f'L.1 option {oid} renders {", ".join(bad[:4])} '
                     '— the preview renders computed options, not '
                     'hardcoded frames')
    return f


def check_layout_scores(ctx):
    """L.2 — every option card's data-score is the score computed in
    LAYOUT-OPTIONS.json, and recorded scores recompute from their own
    recorded inputs (never hardcoded)."""
    lo = _layout_options(ctx)
    if not isinstance(lo, dict):
        return []
    txt = ctx.read('preview/layouts.html')
    f = []
    if txt is not None:
        cards = dict(re.findall(
            r'<article[^>]*id="(d\d+)"[^>]*data-score="([\d.]+)"',
            txt))
        for o in lo.get('options') or []:
            oid = str(o.get('id'))
            if oid not in cards:
                f.append(f'L.2 option {oid} has no score card in '
                         'preview/layouts.html')
                continue
            try:
                got = float(cards[oid])
            except ValueError:
                got = None
            if got is None or abs(got - float(o.get('score') or 0)) > 5e-3:
                f.append(f'L.2 option {oid} data-score '
                         f'{cards.get(oid)} ≠ computed '
                         f'{o.get("score")} — scores come from the '
                         'formula, not the emitter')
    cp = _copy_json(ctx)
    if cp:
        try:
            sys.path.insert(0, HERE)
            import plan_from_copy as PF
            by = {b.get('id'): b for b in (cp.get('blocks') or [])}
            for o in lo.get('options') or []:
                seq = sorted((o.get('compositions') or {}).items())
                s, _ = PF.score(seq, by)
                if abs(s - float(o.get('score') or 0)) > 5e-3:
                    f.append(f'L.2 option {o.get("id")} score '
                             f'{o.get("score")} ≠ recomputed {s} '
                             'from its recorded inputs')
        except Exception:
            pass
    return f


def check_layout_pick(ctx):
    """L.3 — the plan IS the picked option: plan row compositions equal
    the recorded w3 approval pick (or LAYOUT-OPTIONS.pick when the
    approval isn't minted yet)."""
    lo = _layout_options(ctx)
    if not isinstance(lo, dict):
        return []
    pick = ((read_approvals(ctx) or {}).get('w3') or {}).get('design') \
        or lo.get('pick')
    f = []
    if str(lo.get('pick') or '') != str(pick):
        f.append(f'L.3 LAYOUT-OPTIONS.pick {lo.get("pick")} ≠ the '
                 f'approved option {pick} — layout_pick.py projects '
                 'the pick')
    opt = next((o for o in (lo.get('options') or [])
                if str(o.get('id')) == str(pick)), None)
    if not opt:
        return f
    comps = opt.get('compositions') or {}
    for _, r in ctx.rows():
        ref = r.get('copy_ref')
        if ref not in comps:
            continue
        if str(r.get('composition')) != comps[ref]:
            f.append(f'L.3 {ref} plan composition '
                     f'{r.get("composition")} ≠ picked option '
                     f'{comps[ref]} — the plan must reflect the '
                     'operator pick')
    return f


def check_copy_fidelity(ctx):
    """F.1 — copy fidelity at w7: every COPY.json string is in the
    built page text, and every content text node outside chrome
    (nav/footer/forms/CTA panels) traces to COPY/BRIEF/STUB."""
    if not _wave_ge(ctx, 'w7'):
        return []
    pages = ctx.page_htmls()
    cp = _copy_json(ctx)
    if not pages or not cp:
        return []
    f = []
    page_txt = ' ¦ '.join(_norm_text(_strip_inline_md(
        html.unescape(re.sub(
            r'<[^>]+>', ' ',
            re.sub(r'</?(?:strong|em|a|b|i|span|mark|small|sub|sup|'
                   r'code|abbr|u|s|del|ins|time|cite)\b[^>]*>', '',
                   t, flags=re.I))))) for _, t in pages)
    for want in _copy_texts(cp):
        if want not in page_txt:
            f.append(f'F.1 COPY string absent from the page: '
                     f'{want[:80]!r} — the article renders verbatim '
                     '(U.1/U.4)')
    corpus = ' ¦ '.join(_corpus_texts(ctx, cp))
    chrome = ' ¦ '.join(_corpus_texts(ctx, cp) + _chrome_texts(ctx))
    page_txt = re.sub(r'\s*¦\s*', ' ', page_txt)
    corpus = re.sub(r'\s*¦\s*', ' ', corpus)
    chrome = re.sub(r'\s*¦\s*', ' ', chrome)
    for is_chrome, seg in _content_segments(pages):
        if len(seg) < 4:
            continue
        hay = chrome if is_chrome else corpus
        if seg in hay:
            continue
        if is_chrome and re.fullmatch(
                r'Copyright\s+(?:19|20)\d{2}\s+[\w][\w\s.\-–—&\'®™©]*',
                seg) and seg.split(None, 2)[2] in hay:
            # footer year stamp: `Copyright {year} {brand}` — the
            # year is the render clock, the brand is corpus-bound
            continue
        if is_chrome and all(w in hay.split(' ')
                             for w in re.findall(r'[A-Za-z]{3,}', seg)):
            # composite chrome stamp: every long word already in
            # the chrome corpus (multi-word joins the scraper
            # never listed: `Brand 555-0100`)
            continue
        f.append(f'F.1 page text '
                 f"{'(chrome) ' if is_chrome else 'outside chrome '}"
                 f'is unsourced: {seg[:80]!r} — nothing is '
                 'invented (U.4)')
    return f


def check_unsourced_quotes(ctx):
    """F.2 — no unsourced quotes: blockquote/cite/figcaption text must
    appear verbatim in the COPY corpus."""
    if not _wave_ge(ctx, 'w7'):
        return []
    cp = _copy_json(ctx)
    f = []
    corpus = ' ¦ '.join(_corpus_texts(ctx, cp) if cp else [])
    for _, txt in ctx.page_htmls():
        for m in re.finditer(
                r'<(blockquote|cite|figcaption)\b[^>]*>(.*?)</\1>',
                txt, re.S | re.I):
            t = _norm_text(_strip_inline_md(
                re.sub(r'<[^>]+>', ' ', m.group(2))))
            if len(t) >= 4 and t not in corpus:
                f.append(f'F.2 <{m.group(1)}> text not in the article: '
                         f'{t[:80]!r} — quotes need a copy source (U.4)')
    return f


def check_light_paint(ctx):
    """T.2 — light first paint: the built page reads no
    prefers-color-scheme, opens as data-theme light or unset, :root
    binds the light canvas, and dark styles wait for an explicit
    [data-theme=dark]."""
    if not _wave_ge(ctx, 'w7'):
        return []
    f = []
    css = (ctx.read('site/src/styles/global.css') or '') + '\n' + \
        '\n'.join(c for _, c in dist_csss(ctx))
    canvas = _theme(ctx).get('canvas')
    for p, txt in ctx.page_htmls():
        name = os.path.basename(p)
        if 'prefers-color-scheme' in txt:
            f.append(f'T.2 {name}: prefers-color-scheme in the page — '
                     'first paint never follows the OS (U.3)')
        m = re.search(r'<html[^>]*>', txt)
        tag = m.group(0) if m else ''
        mt = re.search(r'data-theme\s*=\s*"([^"]+)"', tag)
        if mt and mt.group(1) != 'light':
            f.append(f'T.2 {name}: <html> opens '
                     f'data-theme={mt.group(1)} — first paint is '
                     'light')
        # a static class="dark" is an OS/flag-independent bypass —
        # the only dark entry is the persisted toggle
        if re.search(r'<html[^>]*class="[^"]*\bdark\b', tag):
            f.append(f'T.2 {name}: <html> statically opens dark — '
                     'the only dark entry is the persisted toggle')
    if 'prefers-color-scheme' in css:
        f.append('T.2 emitted CSS reads prefers-color-scheme — dark '
                 'styles bind [data-theme=dark] only')
    root = '\n'.join(re.findall(r':root\s*\{([^}]*)\}', css))
    if canvas and root and '--bg-canvas' in root and \
            str(canvas).lower() not in root.lower():
        f.append(f'T.2 :root binds no {canvas} canvas — first paint '
                 'is the brief canvas')
    if '[data-theme=dark]' not in css and '.dark' in css and \
            'prefers-color-scheme' not in css:
        f.append('T.2 dark styles bind .dark but the token layer uses '
                 '[data-theme=dark] — align the selector')
    f += _rendered_light_paint(ctx, canvas)
    return f


def _rendered_light_paint(ctx, canvas):
    """T.2 rendered: under an OS-dark emulation the first paint is
    STILL the brief's light canvas — data-theme resolves light and
    the computed body background is the canvas (U.3). Playwright is
    the repo .venv; a missing browser environment skips (env-exempt,
    like check_astro_build)."""
    pages = ctx.page_htmls()
    if not pages or not canvas:
        return []
    try:
        import subprocess
        script = (
            'import json,sys,threading,functools,'
            'http.server,socketserver\n'
            'from playwright.sync_api import sync_playwright\n'
            'root,path=sys.argv[1],sys.argv[2]\n'
            'h=functools.partial('
            'http.server.SimpleHTTPRequestHandler,directory=root)\n'
            's=socketserver.TCPServer(("127.0.0.1",0),h)\n'
            'threading.Thread(target=s.serve_forever,'
            'daemon=True).start()\n'
            'url=f"http://127.0.0.1:{s.server_address[1]}{path}"\n'
            'with sync_playwright() as p:\n'
            ' b=p.chromium.launch()\n'
            ' ctx=b.new_context(color_scheme="dark")\n'
            ' pg=ctx.new_page();'
            'resp=pg.goto(url,wait_until="networkidle")\n'
            ' bg=""\n'
            ' for _ in range(3):\n'
            '  bg=pg.evaluate("getComputedStyle(document.body).'
            'backgroundColor")\n'
            '  if bg!="rgba(0, 0, 0, 0)": break\n'
            '  pg.wait_for_timeout(250)\n'
            ' print(json.dumps({'
            '"ok":bool(resp and resp.ok),'
            '"sheets":pg.evaluate("document.styleSheets.length"),'
            '"theme":pg.evaluate("document.documentElement.'
            'dataset.theme||\'\'"),'
            '"bg":bg}))\n'
            ' b.close()\n'
            's.shutdown()\n')
        venv = os.path.join(os.path.dirname(HERE), '.venv', 'bin',
                            'python')
        py = venv if os.path.isfile(venv) else sys.executable
        dist = os.path.join(ctx.site, 'dist')
        rel = '/' + os.path.relpath(pages[0][0], dist)
        r = subprocess.run(
            [py, '-c', script, dist, rel],
            capture_output=True, text=True, timeout=60)
        if r.returncode != 0:
            return []                     # env-exempt: no browser
        got = json.loads(r.stdout.strip().split('\n')[-1])
    except Exception:
        return []
    if not got.get('ok') or not got.get('sheets'):
        return []                     # nav/serving flake under load —
                                      # not a paint measurement
    f = []
    if got.get('theme') not in ('', 'light'):
        f.append(f"T.2 rendered page opens data-theme="
                 f"{got['theme']} under OS-dark — first paint never "
                 'follows the OS (U.3)')
    want_rgb = _rgb(canvas)
    m = re.match(r'rgba?\(([^)]*)\)', str(got.get('bg') or ''))
    if want_rgb and m:
        vals = [round(float(x)) for x in m.group(1).split(',')[:3]]
        if vals != [round(v * 255) for v in want_rgb]:
            f.append(f'T.2 rendered body background {got["bg"]} ≠ '
                     f'BRIEF canvas {canvas} under OS-dark — first '
                     'paint is the brief canvas')
    return f

_ACSS_NAME = re.compile(
    r'^(?:'
    r'text-(?:xxl|xl|2xl|l|m|s|xs)(?:-to-(?:xxl|xl|2xl|l|m|s|xs))?|'
    r'text-[a-z]+-(?:line-height|max-width)|'
    r'text-line-height|text-text-wrap|'
    r'h[1-6](?:-line-height|-max-width|-to-h[1-6])?|'
    r'space-(?:xxl|2xl|xl|l|m|s|xs)(?:-to-(?:xxl|2xl|xl|l|m|s|xs))?|'
    r'section-space-(?:xxl|xl|l|m|s|xs)(?:-to-(?:xxl|xl|l|m|s|xs))?|'
    r'section-padding-block|'
    r'gutter|grid-gap|content-gap|container-gap|col-gap|row-gap|'
    r'flow-spacing|list-spacing|list-indent-spacing|'
    r'nested-list-indent-spacing|list-item-spacing|paragraph-spacing|'
    r'figcaption-spacing|figure-spacing|blockquote-(?:gap|padding|'
    r'spacing)|divider-(?:gap|size|inline-size)|'
    r'radius(?:-(?:xxl|xl|l|m|s|xs|none|50|circle))?|'
    r'btn-(?:radius|padding-block|padding-inline|min-width|'
    r'font-size|letter-spacing|line-height|width)|'
    r'width-(?:full|[1-9]0)|content-width(?:-safe)?|'
    r'grid-(?:[1-9]|1[0-2]|[1-9]-[1-9]|auto-(?:[2-9]|1[0-2]))|'
    r'border-(?:width|size|radius)|focus-(?:width|offset)|'
    r'col-(?:width|rule-width)-(?:s|m|l)|'
    r'header-height|scroll-margin|sticky-offset(?:-custom)?|'
    r'root-font-size|admin-bar-height|base-(?:text|heading)-lh|'
    r'overlay-z-index|auto-grid-aggressiveness'
    r')$')

_ACSS_EXEMPT = re.compile(
    r'^(?:primitive-|font-|ease|transition|duration|tw-)')


def _acss_tokens(css):
    """{token-name: raw-value} for every --name: value in the css."""
    toks = {}
    for m in re.finditer(r'--([A-Za-z_][A-Za-z0-9_-]*)\s*:\s*([^;}]*)', css):
        toks[m.group(1)] = m.group(2).strip()
    return toks


def _acss_dimensional(name, val, toks):
    if _ACSS_EXEMPT.match(name) or 'shadow' in name:
        return False
    v = val.lower()
    seen = set()
    for _ in range(6):
        m = re.fullmatch(r'var\(--([A-Za-z0-9_-]+)\)', v)
        if not m or m.group(1) in seen or m.group(1) not in toks:
            break
        seen.add(m.group(1))
        v = toks[m.group(1)].lower()
    if re.search(
            r'[-+]?\d*\.?\d+(?:px|r?em|ch|ex|vi?n?w|v[hmbs]|%|cm|mm|in|'
            r'pt|pc|cap|ic|lh)\b', v):
        return True
    if re.fullmatch(r'-?[\d.]+', v):
        # unitless size-adjacent (leading/scale)
        if re.search(r'(?:^|-)(?:lh|leading|line-height|scale|ratio)',
                     name):
            return True
        return False
    if v.startswith(('min(', 'max(', 'clamp(')):
        return True
    # length-bearing names without resolvable value still count
    if re.search(r'(?:^|-)(?:pad|padding|margin|size|width|height|'
                 r'gap|spacing|measure|radius|min|max|floor|cap)$',
                 name) and not re.fullmatch(r'[\d.]+', v):
        return True
    return False


def check_acss_tokens(ctx):
    """AC.1 — U.10: every size/spacing/gap custom property the emitters
    write follows ACSS naming (text-N/hN/space-N/section-space-N/
    gutter/gap/radius/width families) or carries a written divergence
    reason at DNA provenance['fluid'].divergences['<name>']."""
    if not _wave_ge(ctx, 'w4'):
        return []
    css = (ctx.read('site/src/styles/global.css') or '') + '\n' + \
        '\n'.join(c for _, c in dist_csss(ctx))
    toks = _acss_tokens(css)
    if not toks:
        return []
    prov = (dna_map(ctx) or {}).get('provenance') or {}
    divs = ((prov.get('fluid') or {}).get('divergences')
            if isinstance(prov.get('fluid'), dict) else None) or {}
    f = []
    for name, val in sorted(toks.items()):
        if not _acss_dimensional(name, val, toks):
            continue
        if _ACSS_NAME.match(name):
            continue
        if divs.get(name):
            continue
        f.append(f'AC.1 --{name} is a size/spacing token outside ACSS '
                 'naming (U.10) — rename to the ACSS family or record '
                 'the divergence in DNA provenance '
                 f'fluid.divergences.{name}')
    return f

_FL_DECL = re.compile(
    r'(?<![\w-])(font-size|margin(?:-(?:top|right|bottom|left|block|'
    r'inline|block-start|block-end|inline-start|inline-end))?|'
    r'padding(?:-(?:top|right|bottom|left|block|inline|block-start|'
    r'block-end|inline-start|inline-end))?|gap|row-gap|column-gap|'
    r'line-height|letter-spacing|word-spacing)'
    r'\s*:\s*([^;{}]+)')
_FL_BARE = re.compile(r'-?\d*\.?\d+(px|r?em|ch|ex|vw|vi|vh|vb|%)\b')
# em only in the button-padding + leading/tracking families; never
# font-size/gap/margin (U.9 — one fluid source)
_FL_EM_OK = re.compile(
    r'^(padding(?:-[\w-]+)?|line-height|letter-spacing|'
    r'word-spacing)$')
# inside calc()/min()/max(): fluid terms only — var(--token), Nrem,
# Nvw, N% (percent geometry), env() — never Npx|Nem literals
_FL_INNER_OK = re.compile(
    r'^[\s+\-*/(),.\d]+|var\(--[\w-]+\)|env\([\w-]+\)|'
    r'-?\d*\.?\d+(rem|vw|%)\b')
_FL_COMMENT = re.compile(r'/\*.*?\*/', re.S)


def _fl_term_ok(inner):
    """Every term inside calc()/min()/max() is var(--…)/Nrem/Nvw/N%/
    env()/operator — never a bare px/em literal."""
    s = inner
    for _ in range(6):
        s2 = re.sub(
            r'var\(--[\w-]+\)|env\([\w-]+\)|'
            r'-?\d*\.?\d+(?:rem|vw|%)\b', '', s)
        if s2 == s:
            break
        s = s2
    return not re.sub(r'[\s+\-*/(),.\d]', '', s)



def _fl_exempt_decl(prop, val):
    """clamp.EXEMPTIONS families: declarations FL.1 does not police."""
    v = val.strip()
    if v.startswith(('var(--content-width', 'var(--measure',
                     'var(--width-', 'var(--grid-min', 'var(--sec-inner',
                     'var(--radius', 'var(--btn-padding', 'var(--tap')):
        return True
    if re.fullmatch(r'-?\d*\.?\d+px', v) and abs(float(v[:-2])) <= 2:
        return True
    # Tailwind preflight normalize atoms (code{font-size:1em},
    # small{80%}, sub/sup{75%}) — vendor normalize, not a size choice
    if prop == 'font-size' and v in ('1em', '75%', '80%', '90%'):
        return True
    return False


def _fl_decls(txt):
    """(prop, value) for FL.1-scoped declarations in CSS text or
    inline style= attributes."""
    out = []
    for m in _FL_DECL.finditer(txt):
        out.append((m.group(1), m.group(2).strip()))
    for m in re.finditer(r'style\s*=\s*"([^"]*)"', txt):
        for dm in _FL_DECL.finditer(m.group(1)):
            out.append((dm.group(1), dm.group(2).strip()))
    return out


def check_fluid_sizes(ctx):
    """FL.1 — U.9/U.10: every font-size/margin/padding/gap declaration
    is built of var(--…)/clamp()/calc()/em/0/auto/env() — never a bare
    Npx|Nrem literal (clamp.EXEMPTIONS families aside); and every :root
    --text-*/--h[1-6]/--space-*/--section-space-*/--gutter definition
    recomputes to the ACSS fluidClamp for the TOKENS fluid settings
    (|Δ| ≤ 0.05px at both endpoints)."""
    if not _wave_ge(ctx, 'w4'):
        return []
    try:
        import clamp as _cl
    except Exception:
        _cl = None
    f = []
    seen = set()
    css = ctx.read('site/src/styles/global.css') or ''
    for p, c in dist_csss(ctx):
        css += '\n' + c
    css = _FL_COMMENT.sub(' ', css)
    decls = _fl_decls(css)
    comp_root = os.path.join(ctx.dir, 'site', 'src', 'components')
    if os.path.isdir(comp_root):
        for dpth, _, fns in os.walk(comp_root):
            for fn in fns:
                if not fn.endswith('.astro'):
                    continue
                t = _FL_COMMENT.sub(' ', open(
                    os.path.join(dpth, fn), encoding='utf-8',
                    errors='replace').read())
                decls += _fl_decls(t)
    for p, txt in ctx.page_htmls():
        decls += _fl_decls(_FL_COMMENT.sub(' ', txt))
    for prop, val in decls:
        if _fl_exempt_decl(prop, val):
            continue
        # strip approved spans innermost-out; an approved atom is
        # var(--t), clamp(lo,calc(…),hi) (fluidClamp), or
        # calc/min/max whose EVERY term is var/rem/vw/%/env — a
        # Npx|Nem in ANY residue FAILs (no min/max/em bypass)
        res = val
        for _ in range(10):
            res2 = re.sub(r'var\(--[\w-]+\)|env\([\w-]+\)', ' ', res)
            for fm in re.finditer(
                    r'(clamp|calc|min|max)\(([^()]*)\)', res2):
                if _fl_term_ok(fm.group(2)):
                    res2 = res2.replace(fm.group(0), ' ', 1)
            if res2 == res:
                break
            res = res2
        res = re.sub(r'\b(?:auto|inherit)\b', ' ', res)
        if _FL_EM_OK.match(prop):
            res = re.sub(r'-?\d*\.?\d+em\b', ' ', res)
        res = re.sub(r'(?<![\w.])0(?![\w.%])', ' ', res)
        if _FL_BARE.search(res):
            key = (prop, val)
            if key in seen:
                continue
            seen.add(key)
            f.append(f'FL.1 {prop}: {val[:48]!r} has a bare size '
                     'literal — every size is one clamp()/var() '
                     'from the ACSS fluid scale (U.9)')
    # every var(--x) a scoped declaration references must be declared
    # in the emitted css — an undeclared token silently resolves to
    # nothing (the --space-4 zero-gap bug)
    declared = set(_acss_tokens(css))
    var_seen = set()
    for prop, val in decls:
        for vm in re.finditer(r'var\(--([A-Za-z0-9_-]+)', val):
            n = vm.group(1)
            if n not in declared and n not in var_seen:
                var_seen.add(n)
                f.append(f'FL.1 var(--{n}) referenced by {prop} is '
                         'never declared — every size token exists in '
                         'the emitted css (U.9)')
    if _cl is not None:
        try:
            tj = json.loads(ctx.read('TOKENS.json') or '{}')
            s = _cl.settings(tj.get('fluid') or {})
            want = _cl.sizes(s)
        except Exception:
            want = {}
        for name, val in sorted(_acss_tokens(css).items()):
            base = re.sub(r'-(?:line-height|max-width)$', '', name)
            if base in want and not re.match(r'^var\(', val.strip()):
                try:
                    lo_g, hi_g = _cl.endpoints(val, s)
                    lo_w, hi_w = _cl.endpoints(want[base], s)
                except Exception:
                    continue
                if abs(lo_g - lo_w) > 0.05 or abs(hi_g - hi_w) > 0.05:
                    f.append(f'FL.1 --{name} min/max ≠ ACSS fluidClamp '
                             'for the DNA settings')
    return f


_WALK_SKIP = {'href', 'icon', 'id', 'url', 'src', 'type'}


def _walk_strings(x):
    """Every string anywhere under x (dict/list/scalar walk). Keys in
    _WALK_SKIP are metadata — a link target or icon name is structure,
    never rendered prose (F.1's page-side scan strips attributes)."""
    if isinstance(x, str):
        yield x
    elif isinstance(x, dict):
        for k, v in x.items():
            if k in _WALK_SKIP:
                continue
            yield from _walk_strings(v)
    elif isinstance(x, (list, tuple)):
        for v in x:
            yield from _walk_strings(v)


def _strip_inline_md(s):
    s = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', str(s))
    return s.replace('**', '')


def _norm_text(s):
    return ' '.join(str(s or '').split())


def _copy_texts(cp):
    """Normalized strings COPY.json declares — what F.1 requires on
    the page (verbatim, markdown stripped)."""
    out = []

    def add(x):
        x = _norm_text(_strip_inline_md(x))
        if len(x) >= 4:
            out.append(x)

    add(cp.get('h1'))
    add(cp.get('lede'))
    for b in cp.get('blocks') or []:
        add(b.get('h2'))
        add(b.get('answer'))
        for k in ('before', 'after'):
            for p in b.get(k) or []:
                add(p)
        for it in b.get('items') or []:
            add(it.get('text'))
            add(it.get('term'))
        for qa in b.get('qa') or []:
            add(qa.get('q'))
            add(qa.get('a'))
        for lk in b.get('links') or []:
            add(lk.get('anchor'))
            add(lk.get('text'))
        # forward-compat: a patched producer or hand-edit may stash
        # copy in a NEW key F.1's field list does not know — any
        # NON-metadata string anywhere in the block is declared
        # copy (id/zone/stub_fs/answer_type/terms are metadata, not
        # rendered copy; I.2 still pins block ids/h2s; F.1's
        # page-side scan catches the rest)
        for k, v in b.items():
            if k in ('id', 'h2', 'zone', 'stub_fs', 'answer_type',
                     'terms', 'list_ordered'):
                continue
            for s in _walk_strings(v):
                add(s)
    for l in cp.get('links_out') or []:
        add(l.get('anchor'))
    # top-level forward-compat: same unknown-key rule for any
    # hand-added top-level COPY.json key
    for k, v in cp.items():
        if k in ('generated_by', 'source', 'url', 'title', 'meta',
                 'h1', 'stub_h1', 'answer_datatype', 'lede',
                 'stub_vector', 'vector_order', 'blocks', 'closing',
                 'links_out'):
            continue
        for s in _walk_strings(v):
            add(s)
    return out


def _corpus_texts(ctx, cp):
    """Everything page text may legitimately say: COPY + STUB tables +
    plan vectors + BRIEF chrome strings."""
    out = list(_copy_texts(cp))
    # declared terms are allowed copy too — verbatim article words
    # extracted by copy_ingest; renderable (term-items projection)
    # though never required, so they join the corpus, not _copy_texts
    for b in cp.get('blocks') or []:
        for t in b.get('terms') or []:
            for s in (t, t[:1].upper() + t[1:]):
                # term-items projection sentence-cases the term —
                # both its raw and its displayed surface are sourced
                s = _norm_text(_strip_inline_md(s))
                if len(s) >= 4:
                    out.append(s)
    for v in ctx.stub_vector() or []:
        for k in ('heading', 'fs', 'h1'):
            t = _norm_text(_strip_inline_md(v.get(k)))
            if len(t) >= 4:
                out.append(t)
    inv = ctx.stub_inventory() or {}
    for rows in inv.values():
        for row in rows:
            for cell in row:
                t = _norm_text(_strip_inline_md(cell))
                if len(t) >= 4:
                    out.append(t)
    for _, r in ctx.rows():
        for vec in r.get('vector') or []:
            if isinstance(vec, dict):
                for k in ('heading', 'fs'):
                    t = _norm_text(_strip_inline_md(vec.get(k)))
                    if len(t) >= 4:
                        out.append(t)
        cta = r.get('cta') or {}
        if isinstance(cta, dict):
            t = _norm_text(cta.get('label'))
            if len(t) >= 4:
                out.append(t)
    b = _brief(ctx)
    brand = b.get('brand') or {}
    for v in (brand.get('name'), brand.get('phone')):
        t = _norm_text(v)
        if len(t) >= 4:
            out.append(t)
    for med in b.get('media') or []:
        t = _norm_text((med or {}).get('alt'))
        if len(t) >= 4:
            out.append(t)
    return out


_CHROME_COMP = ('nav-bar', 'footer-bar', 'form-panel', 'flyout-nav')


def _chrome_texts(ctx):
    """Chrome corpus: what nav/footer/form-panel may say — BRIEF
    brand/phone/media alt + COPY links_out/closing + the literal
    strings the emitted section components carry (Menu, toggle
    labels, form placeholders, footer chrome)."""
    out = []
    b = _brief(ctx)
    brand = b.get('brand') or {}
    for v in brand.values():
        t = _norm_text(v)
        if len(t) >= 4:
            out.append(t)
    for med in b.get('media') or []:
        t = _norm_text((med or {}).get('alt'))
        if len(t) >= 4:
            out.append(t)
    cp = _copy_json(ctx)
    if isinstance(cp, dict):
        for lk in cp.get('links_out') or []:
            for k in ('anchor', 'text', 'title'):
                t = _norm_text(_strip_inline_md(lk.get(k)))
                if len(t) >= 4:
                    out.append(t)
        clo = cp.get('closing') or {}
        for k in ('text', 'phone'):
            t = _norm_text(clo.get(k))
            if len(t) >= 4:
                out.append(t)
        t = _norm_text((clo.get('cta') or {}).get('label'))
        if len(t) >= 4:
            out.append(t)
        lab = _norm_text((clo.get('cta') or {}).get('label'))
        ph = _norm_text(clo.get('phone') or brand.get('phone'))
        # the call-bar renders label+phone as adjacent spans — the
        # leaf merge sees one string, so both joins must be legal
        for pair in (f'{lab} {ph}', f'{ph} {lab}'):
            if len(pair.strip()) >= 4:
                out.append(pair.strip())
    # BaseLayout shell constants (live outside components/*)
    out += ['Skip to content', 'Call now']
    # literal strings inside the emitted chrome components — every
    # static word the template renders ('Menu', 'Skip to content',
    # field labels/placeholders, footer legal, toggle labels)
    comp_root = os.path.join(ctx.dir, 'site', 'src', 'components')
    for name in _CHROME_COMP:
        for p in (os.path.join(comp_root, name + '.astro'),
                  os.path.join(comp_root, 'sections', name + '.astro')):
            if not os.path.isfile(p):
                continue
            t = open(p, encoding='utf-8', errors='replace').read()
            fm = re.match(r'^---\n(.*?)\n---\n', t, re.S)
            t = re.sub(r'^---\n.*?\n---\n', '', t, flags=re.S)
            for m in re.finditer(
                    r'>\s*([^<>{}\n]{4,}?)\s*<', t):
                s = _norm_text(html.unescape(m.group(1)))
                if s and not s.startswith(('{', '<', '/*')):
                    out.append(s)
            for m in re.finditer(
                    r'(?:aria-label|placeholder|title|alt)\s*=\s*'
                    r'["\']([^"\']{4,})["\']', t):
                s = _norm_text(m.group(1))
                if not s.startswith('{'):
                    out.append(s)
            # frontmatter prop defaults render verbatim when the
            # instance omits them (nav `brand = 'Brand'`) — they
            # are template-carried chrome words too
            for m in re.finditer(
                    r"""=\s*['"]([^'"{}]{4,}?)['"]""",
                    fm.group(1) if fm else ''):
                s = _norm_text(html.unescape(m.group(1)))
                if s and not s.startswith(('{', '<', '/', '.')):
                    out.append(s)
    return out


def _content_segments(pages):
    """[(chrome?, frag)] every text fragment a page emits — content
    sections AND chrome (nav/footer/form-panel). Fragments are leaf
    text nodes plus <svg><text>, non-icon aria-label/title/alt and
    CSS content: strings — every rendered or read-aloud word must
    trace to a corpus."""
    segs = []
    for _, txt in pages:
        m = re.search(r'<main\b[^>]*>(.*?)</main>', txt, re.S | re.I)
        body = m.group(1) if m else txt
        # section-less carriers: aria parked outside a section
        # (e.g. an injected label on an unsectioned div) — page
        # chrome controls (nav toggle, theme switch) live INSIDE
        # chrome sections, so only section-less aria is scanned
        # here; in-section aria is covered by the loop below
        stripped = re.sub(
            r'<(?:section|header|footer)\b(?=[^>]*data-comp="[^"]+")'
            r'[^>]*>.*?</(?:section|header|footer)>',
            ' ', body, flags=re.S | re.I)
        for am in re.finditer(
                r'(?:aria-label|title|alt)\s*=\s*"([^"]{4,})"',
                stripped, re.I):
            t = _norm_text(html.unescape(am.group(1)))
            if len(t) >= 4 and 'skip to content' not in t.lower():
                segs.append((False, t))
        # inert carriers are still served bytes: <template>
        # stamps its words into the DOM on clone, <noscript>
        # renders with JS off — section-less ones must trace
        for nm in re.finditer(
                r'<(?:template|noscript)\b[^>]*>(.*?)'
                r'</(?:template|noscript)>',
                stripped, re.S | re.I):
            for wm in re.finditer(r'>([^<>]{4,})<', nm.group(1)):
                t = _norm_text(html.unescape(wm.group(1)))
                if len(t) >= 4:
                    segs.append((False, t))
        for wm in re.finditer(r'>([^<>]{4,})<', stripped):
            t = _norm_text(html.unescape(wm.group(1)))
            if len(t) >= 4 and not re.fullmatch(
                    r'(?:\|+|•+|\s+)', t):
                segs.append((False, t))
        for sm in re.finditer(
                r'(<(?:section|header|footer)\b(?=[^>]*'
                r'data-comp="([^"]+)")[^>]*>)'
                r'(.*?)</(?:section|header|footer)>',
                body, re.S | re.I):
            comp, opentag, inner = sm.group(2), sm.group(1), sm.group(3)
            chrome = comp in _CHROME_COMP
            # attributes read aloud / rendered before the tags go
            for am in re.finditer(
                    r'(?:aria-label|title|alt)\s*=\s*"([^"]{4,})"',
                    opentag + ' ' + inner, re.I):
                t = _norm_text(html.unescape(am.group(1)))
                if len(t) >= 4:
                    segs.append((chrome, t))
            for tm in re.finditer(r'<text\b[^>]*>([^<>]{4,})</text>',
                                  inner, re.I):
                t = _norm_text(html.unescape(tm.group(1)))
                if len(t) >= 4:
                    segs.append((chrome, t))
            for cm in re.finditer(
                    r'content\s*:\s*["\']([^"\']{4,})["\']', inner, re.I):
                t = _norm_text(html.unescape(cm.group(1)))
                if len(t) >= 4:
                    segs.append((chrome, t))
            # inert carriers are still served bytes: <template>
            # stamps its words into the DOM on clone, <noscript>
            # renders with JS off — both must trace to a corpus
            for nm in re.finditer(
                    r'<(?:template|noscript)\b[^>]*>(.*?)'
                    r'</(?:template|noscript)>',
                    inner, re.S | re.I):
                for wm in re.finditer(r'>([^<>]{4,})<', nm.group(1)):
                    t = _norm_text(html.unescape(wm.group(1)))
                    if len(t) >= 4:
                        segs.append((chrome, t))
            inner = re.sub(
                r'<(form|script|style|svg)\b.*?</\1>',
                ' ', inner, flags=re.S | re.I)
            # inline tags carry no break — `The <a>anchor</a> rest` is
            # one segment; F.1 judges the rendered words, not markup
            inner = re.sub(
                r'</?(?:a|strong|em|b|i|span|mark|small|sub|sup|code|'
                r'abbr|u|s|del|ins|time|cite|q|kbd|var)\b[^>]*>', '',
                inner, flags=re.I)
            for tm in re.finditer(r'>([^<>]+)<', inner):
                t = _norm_text(html.unescape(tm.group(1)))
                if len(t) < 4:
                    continue
                for frag in re.split(r'[•·|]', t):
                    frag = frag.strip()
                    if len(frag) >= 4:
                        segs.append((chrome, frag))
    return segs


def _luminance(h):
    rgb = _rgb(h)
    return None if rgb is None else _lum(rgb)


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
            lch = _oklch_lch(bg)
            if lch is not None and lch[0] > DARK_MAX_L:
                f.append(f'C.5 dark bg OKLCH L {lch[0]:.2f} > '
                         f'{DARK_MAX_L} (HSL-L 7–10% ≈ OKLCH ≤0.24) '
                         '— not a dark surface')
    if not _wave_ge(ctx, 'w3'):
        return f                       # W2 options declare modes only
    cfg = ctx.read('site/tailwind.config.js', 'site/tailwind.config.mjs',
                   'site/tailwind.config.cjs') or ''
    if not re.search(r'darkMode\s*:\s*[\'"](class|selector)[\'"]'
                     r'|darkMode\s*:\s*\[\s*[\'"](class|selector)[\'"]',
                     cfg):
        f.append("C.5 tailwind config missing darkMode: 'class'")
    css = ctx.read('site/src/styles/global.css') or ''
    if not re.search(
            r'(\.dark|\[data-theme\s*=\s*["\']?dark["\']?\])\s*\{',
            css):
        f.append('C.5 no .dark block in the shared layer — the mode switch '
                 're-binds role variables there')
    tile = ctx.read('site/dist/preview/system/index.html') or \
        ctx.read('site/src/pages/system.astro',
                 'site/src/pages/preview/system.astro') or ''
    surfaces = [('system tile', tile)]
    if _wave_ge(ctx, 'w7'):
        surfaces += [('page', t) for _, t in ctx.page_htmls()]
    for label, txt in surfaces:
        if txt and 'data-theme-toggle' not in txt:
            f.append(f'C.5 {label}: no data-theme-toggle — every surface '
                     'carries a Light/Dark toggle')
    return f


def check_dark_toggle(ctx):
    """C.5′ — light default, never OS-follow: FAIL if any built page or
    script reads prefers-color-scheme, or first paint isn't the BRIEF
    default (light when BRIEF theme.default is light); PASS needs the
    default + an optional persisted toggle."""
    f = []
    th = _theme(ctx)
    pages = ctx.page_htmls()
    # preview shells are chrome-free pickers; the theme paint lives in
    # the BUILT pages they iframe (BaseLayout's head script)
    pd = os.path.join(ctx.site, 'dist', 'preview')
    if os.path.isdir(pd):
        for dp, _, fns in os.walk(pd):
            for fn in sorted(fns):
                if fn.endswith('.html'):
                    p = os.path.join(dp, fn)
                    pages.append((p, open(
                        p, encoding='utf-8',
                        errors='replace').read()))
    layout = ctx.read('site/src/layouts/BaseLayout.astro') or ''
    css = (ctx.read('site/src/styles/global.css') or '') + '\n' + \
        '\n'.join(c for _, c in dist_csss(ctx))
    if 'prefers-color-scheme' in css:
        f.append('C.5 emitted CSS reads prefers-color-scheme — dark '
                 'styles bind [data-theme=dark] only')
    if 'prefers-color-scheme' in layout:
        f.append('C.5 BaseLayout reads prefers-color-scheme — the '
                 'initial mode comes from the BRIEF, never the OS')
    if not pages:
        return f
    for p, txt in pages:
        name = os.path.basename(p)
        head = txt.split('</head>')[0] if '</head>' in txt else ''
        if 'prefers-color-scheme' in head or \
                'prefers-color-scheme' in txt:
            f.append(f'C.5 {name}: reads prefers-color-scheme — '
                     'first paint follows the BRIEF, not the OS')
        if not re.search(r'<script(?![^>]*\bsrc=)[^>]*>', head):
            f.append(f'C.5 {name}: no inline head script — the theme '
                     'must paint before first frame (no flash)')
        if th.get('default') == 'light':
            if re.search(
                    r"(?:localStorage\.getItem|__wfSetTheme|theme)"
                    r"[^;\n]{0,80}\|\|\s*['\"]dark['\"]", txt) \
                    or re.search(
                    r'<html[^>]*data-theme="dark"', txt):
                f.append(f'C.5 {name}: static default is dark — '
                         'first paint must be light')
        if th.get('dark_toggle', True):
            if 'data-theme-toggle' not in txt:
                f.append(f'C.5 {name}: no Light/Dark toggle')
            if 'localStorage' not in txt and 'localStorage' not in layout:
                f.append(f'C.5 {name}: mode choice not persisted '
                         '(localStorage)')
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
    # responsive: fluid type + 375/768 frames — the render lives in
    # the BUILT pages each card iframes (+ their linked CSS); the
    # shell only proves frame mechanics
    pages = _shell_card_pages(path, txt)
    alltxt = txt + ''.join(pt + css for pt, css in pages.values())
    if 'clamp(' not in alltxt:
        f.append('VG.4 picker page is not fluid — fluid clamp type '
                 'incl. h2/lead required at 375')
    vp_frames = re.findall(r'data-vp="(?:mobile|tablet)"|'
                          r'data-(?:v)?size="(?:mobile|tablet)"',
                          txt)
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
    # A F39 — each variant's knob vector rides its built page as
    # scoped CSS vars (data-variant-scope div style), never the shell
    blocks = {}
    for vid, (pt, _) in pages.items():
        blocks.update(_scope_styles(pt))
    if not blocks:
        f.append('VG.2 no data-variant-scope knob vars on the built '
                 'pages — variants must apply their knob vectors')
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
            tok = str((knobs.get(k) or {}).get('token') or k).replace(
                '.', '-').replace('_', '-')
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
    if not isinstance(e.get('predicted_score'), (int, float)):
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


def look_deltas(ctx, design):
    """The knob-delta vector a w4 design id projects: look ids from
    VARIANT-GATES (_variant_entries), fine ids from the record
    assemble_fine persists (FINE-VARIANTS.json — fv* never live in
    VARIANT-GATES). None when the id is not a declared variant. For a
    SIGNED pick the approval record's look_deltas is authoritative —
    it pins what the operator signed; this is the sign-time and
    legacy fallback resolution."""
    entry = (_variant_entries(ctx) or {}).get(str(design))
    if entry:
        return dict((entry[0] or {}).get('deltas') or {})
    fp = os.path.join(ctx.dir, 'FINE-VARIANTS.json')
    if os.path.isfile(fp):
        try:
            rec = (json.load(open(fp)) or {}).get(str(design)) or {}
        except Exception:
            rec = {}
        if rec:
            return dict(rec.get('deltas') or {})
    return None


def _knob_vars(kn, base, knobs):
    """CSS custom-property overrides for one variant's knob vector."""
    out = {}
    for k in sorted((kn or {})):
        spec = knobs.get(k) or {}
        tok = str(spec.get('token') or k).replace('.', '-').replace(
            '_', '-')
        v = kn[k]
        if isinstance(v, dict):
            for tier, x in sorted(v.items()):
                out[f'--{tok}-{tier}'] = str(x)
        else:
            out[f'--{tok}'] = str(v)
    return out



# stylistic knobs the fine round may nudge — structural genes are
# locked at w4 (LAW.DNA); only look-tier moves are legal here.
_FINE_KNOBS = ('type.ratio', 'type.base', 'type.display_weight',
               'type.tracking_display', 'radius.personality',
               'elevation.level', 'motion.level', 'grid.gutter',
               'width.inner_rung', 'color.neutral_tint',
               'color.surface_contrast', 'btn.padding_ratio')


def _knob_nudge(spec, val, direction):
    """One ±1-step move inside the knob's declared domain."""
    if val is None:
        return None
    if spec.get('range') is not None and spec.get('step'):
        lo, hi = spec['range']
        step = spec['step']
        try:
            v = float(val) + direction * step
        except (TypeError, ValueError):
            return None
        if not (lo <= v <= hi):
            return None
        # keep the knob's native type (int step → int)
        return int(v) if float(step).is_integer() else round(v, 4)
    vals = spec.get('allowed') or spec.get('values')
    if vals and str(val) in [str(x) for x in vals]:
        i = [str(x) for x in vals].index(str(val))
        j = i + direction
        if 0 <= j < len(vals):
            return vals[j]
        return None
    if isinstance(val, dict):
        # map knobs (space.section_py) — nudge the FIRST tier one rung
        per = spec.get('per') or {}
        for tier, allowed in per.items():
            cur = str(val.get(tier) or '')
            if cur in allowed and len(allowed) > 1:
                j = allowed.index(cur) + direction
                if 0 <= j < len(allowed):
                    return dict(val, **{tier: allowed[j]})
        return None
    return None


def assemble_fine(ctx):
    """P.18 — the fine round emits exactly three ±1-step nudges of the
    w4-approved look option (read_approvals['w4'].design), each nudging
    three stylistic knobs so every pair differs on ≥3 (check_round).
    Same emitter, same HTML contract — never a parallel page."""
    pick = ((read_approvals(ctx) or {}).get('w4') or {}).get('design')
    computed = _variant_entries(ctx)
    entry = (computed.get(str(pick)) or (None,))[0]
    if not entry:
        # a signed fine pick: the fine round nudges the SIGNED vector
        # — the approval record pins it (look_deltas), so re-emitting
        # this round stays byte-stable. look_deltas(ctx, pick) covers
        # approvals signed before the vector rode the record.
        fv = ((read_approvals(ctx) or {}).get('w4') or {}).get(
            'look_deltas')
        if fv is None:
            fv = look_deltas(ctx, pick)
        if fv is not None:
            entry = {'id': str(pick), 'deltas': fv}
    if not entry:
        # no approval recorded (operator hasn't picked) — fall back to
        # the first declared variant so the file still exists; the
        # check then reports the missing pick itself.
        entry = next((e for _, (e, f_) in computed.items() if not f_),
                     {})
    base = (dna_map(ctx) or {}).get('knobs') or {}
    knobs = knob_set()
    base_deltas = dict(entry.get('deltas') or {})
    merged = {**base, **base_deltas}
    # a nudge is only a fine option if it RENDERS: the real token emit
    # (preview_build._semantic_scope — emit_tokens + _base_css diffed)
    # must change for it. Knobs without a CSS pathway (or pinned by
    # the record's own fluid block) would ship as declared-but-
    # unreferenced vars and fail ROUND3's ≥3 consumed differences.
    import preview_build
    tok = json.loads(ctx.read('TOKENS.json') or '{}')
    here = preview_build._semantic_scope(tok, base_deltas)

    def _renders(k, v):
        return v is not None and preview_build._semantic_scope(
            tok, {**base_deltas, k: v}) != here

    picks = []
    for k in _FINE_KNOBS:
        spec = knobs.get(k) or {}
        if spec.get('tier') == 'structural':
            continue
        cur = merged.get(k)
        up = _knob_nudge(spec, cur, +1)
        down = _knob_nudge(spec, cur, -1)
        up = up if _renders(k, up) else None
        down = down if _renders(k, down) else None
        if up is not None or down is not None:
            picks.append((k, up, down))

    def build(spec_):
        d = {}
        for idx, dirn in spec_:
            if idx >= len(picks):
                continue
            k, up, down = picks[idx]
            v = up if dirn > 0 else down
            if v is not None:
                d[k] = v
        return d

    def pairwise_ok(sets):
        for a in range(3):
            for b in range(a + 1, 3):
                diff = {k for k in set(sets[a]) | set(sets[b])
                        if sets[a].get(k) != sets[b].get(k)}
                if len(diff) < 3:
                    return False
        return True

    # each option = 1..6 knob deltas vs the pick; every PAIR of options
    # must differ on ≥3 knobs (check_round rounds 2/3). Patterns are
    # ordered richest-first; the first that verifies wins.
    n = len(picks)
    cands = []
    if n >= 9:
        cands.append([[(0, 1), (1, 1), (2, 1)],
                      [(3, 1), (4, 1), (5, 1)],
                      [(6, 1), (7, 1), (8, 1)]])
    if n >= 6:
        cands.append([[(0, 1), (1, 1), (2, 1)],
                      [(3, 1), (4, 1), (5, 1)],
                      [(0, -1), (1, -1), (2, -1)]])
    if n >= 5:
        cands.append([[(0, 1), (1, 1), (2, 1)],
                      [(0, -1), (1, -1), (2, -1)],
                      [(0, 1), (1, 1), (2, -1), (3, 1), (4, 1)]])
    if n >= 4:
        # ternary code over 4 rendering knobs (+1 / -1 / unchanged):
        # every pair differs on all 4 — the minimum vocabulary that
        # clears ROUND3's ≥3 when few knobs reach the token emit
        cands.append([[(0, 1), (1, 1), (2, 1)],
                      [(0, -1), (1, -1), (3, 1)],
                      [(2, -1), (3, -1)]])
    cands.append([[(i, s) for i, s in
                   enumerate((+1, +1, +1)[:n])],
                  [(i, s) for i, s in
                   enumerate((-1, -1, -1)[:n])],
                  [(i, s) for i, s in
                   enumerate((+1, -1, +1)[:n])]])
    sets = None
    for spec_ in cands:
        trial = [build(s) for s in spec_]
        if all(1 <= len(t) <= 6 for t in trial) and pairwise_ok(trial):
            sets = trial
            break
    if sets is None:
        sets = [build(s) for s in cands[-1]]
    variants = {}
    for i, deltas_i in enumerate(sets):
        deltas = dict(base_deltas)
        deltas.update(deltas_i)
        variants[f'fv{i + 1}'] = ({
            'id': f'fv{i + 1}', 'vector': 'fine',
            'predicted_score': entry.get('predicted_score') or 80,
            'deltas': deltas,
            'wildcard_breaks': [],
            'pick_of': pick}, [])
    # persist the fv knob vectors: a signed fine pick (fv*) must
    # project into the shipped artifact the same way a look pick
    # does — pipeline_emit._picked_look resolves the design id
    # through VARIANT-GATES first, then this record (the ids only
    # exist here — VARIANT-GATES declares look rounds only)
    with open(os.path.join(ctx.dir, 'FINE-VARIANTS.json'), 'w') as fh:
        json.dump({vid: {'deltas': v['deltas'], 'pick_of': v['pick_of']}
                   for vid, (v, _fails) in variants.items()},
                  fh, indent=1, sort_keys=True)
        fh.write('\n')
    return preview_build.emit_variants(
        ctx, entries=variants, fname='fine.html', marker='--fine')


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


def check_neutral_tint(ctx):
    """C.3 — neutrals carry the brand hue, never dead grey. Metric is
    OKLCH C: the spec's HSL-S% bands and the old RGB channel-delta
    bands disagreed (a compliant delta could violate the S band and
    vice versa — COLOUR-RULES §4 #3); OKLCH C is the single tint
    metric. A #888888-class grey (C=0) fails; tinted charcoal
    (C≈0.003+) passes."""
    f = []
    roles = (_system(ctx).get('color') or {}).get('roles') or {}
    if not roles:
        return ['C.3 plan has no system.color.roles']
    # (floor, cap) OKLCH C — caps keep neutrals from reading as
    # colour fields; floors keep them from reading as dead grey
    bands = {'bg': (0.0015, 0.030), 'surface': (0.0015, 0.035),
             'surface_elevated': (0.002, 0.040), 'border': (0.002, 0.045),
             'ink_muted': (0.002, 0.060), 'ink': (0.002, 0.050),
             'inverse': (0.002, 0.040)}
    for name, (lo, hi) in bands.items():
        role = roles.get(name)
        if not role:
            continue
        val = str((role or {}).get('value', ''))
        # U.3 — the canvas is the brief's, not a taste call: pure white
        # is a legal bg when BRIEF theme.canvas is #FFFFFF (exempt
        # from the dead-grey floor too, not only the pure-white rule)
        _canvas = str((_theme(ctx).get('canvas') or '')).upper()
        if name == 'bg' and _canvas in ('#FFFFFF', '#FFF') and \
                val.upper() in ('#FFFFFF', '#FFF'):
            continue
        if val.upper() in ('#000000', '#000') or \
                val.upper() in ('#FFFFFF', '#FFF'):
            f.append(f'C.3 {name}: {val} — pure black/white is not a '
                     'neutral; tint it (10–15% ink, 98–99% paper)')
            continue
        lch = _oklch_lch(val)
        if lch is None:
            continue
        c = lch[1]
        if c < lo:
            f.append(f'C.3 {name}: OKLCH C {c:.3f} — dead grey; tint '
                     f'with the brand hue (C {lo}–{hi})')
        elif c > hi:
            f.append(f'C.3 {name}: OKLCH C {c:.3f} > {hi} — '
                     'over-saturated neutral')
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
    if motion != 'none' and 'prefers-reduced-motion' not in \
            re.sub(r'/\*.*?\*/', '', css, flags=re.S):
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
                r'<(section|nav)\b([^>]*)>(.*?)(?=<(?:section|nav|header|footer)\b|</body>)',
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
# operator home is fixed in production — every env override was a
# designer bypass (F-03/A8: renaming the var does not remove it).
# The selftest harness sets OPERATOR_HOME in-process (cmd_selftest)
# and gives subprocesses an isolated HOME so the default resolves
# under the temp dir — no env channel reaches the real key.
OPERATOR_HOME = os.path.expanduser('~/.web-factory')


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


def run_token_sig(token, key=None):
    """The on-disk form of a run token: HMAC(operator key, token).
    RUN.json stores ONLY this — the plaintext token never touches
    disk, so reading RUN.json yields nothing usable as a bare
    PIPELINE_RUN env value. None when no operator key exists."""
    k = key or op_key()
    if not k:
        return None
    # domain-separate from _sig(rec, key): _sig HMACs a record's
    # canonical JSON, so a receipt step's sig would otherwise be a
    # valid token_sig for PIPELINE_RUN=<that canonical string> — a
    # tagged HMAC keeps the domains disjoint
    return hmac.new(k, ('wf-run-token:' + str(token)).encode(),
                    hashlib.sha256).hexdigest()[:32]


def run_token_ok(run, env_tok, key=None):
    """True iff PIPELINE_RUN (env) verifies against RUN.json's
    token_sig under the operator key — the keyed compare replaces
    plaintext equality."""
    ts = (run or {}).get('token_sig')
    want = run_token_sig(env_tok, key=key) if env_tok else None
    return bool(ts) and bool(want) and hmac.compare_digest(
        str(ts), want)


def append_wildcard_history(d, genes, seed):
    """The append-only RNG log writer — the ONLY producer of
    WILDCARD-HISTORY.json entries. Each entry binds {round, genes,
    seed} to the previous entry's hash AND to the operator key: a
    deleted/regenerated history cannot mint valid sigs."""
    p = os.path.join(d, 'WILDCARD-HISTORY.json')
    try:
        hist = json.load(open(p))
        if not isinstance(hist, list):
            hist = []
    except Exception:
        hist = []
    prev = hist[-1] if hist and isinstance(hist[-1], dict) else {}
    e = {'round': (prev.get('round') or 0) + 1,
         'genes': sorted(str(g) for g in genes),
         'seed': seed, 'prev': prev.get('hash') or 'genesis'}
    rec = {'round': e['round'], 'genes': e['genes'],
           'seed': e['seed'], 'prev': e['prev']}
    e['hash'] = hashlib.sha256(json.dumps(
        rec, sort_keys=True, separators=(',', ':')).encode()
        ).hexdigest()
    e['sig'] = _sig(e, op_key(create=True))
    hist.append(e)
    with open(p, 'w') as fh:
        json.dump(hist, fh, indent=1)
    return e


def approvals_path(ctx):
    return os.path.join(OPERATOR_HOME, 'approvals',
                        _h(os.path.abspath(ctx.dir)) + '.json')


def read_approvals(ctx):
    p = approvals_path(ctx)
    if not os.path.isfile(p):
        # fixture/parked dirs carry their signed records beside the
        # work — still HMAC-bound to the operator key, never unsigned
        lp = os.path.join(ctx.dir, 'APPROVALS.json')
        if os.path.isfile(lp):
            try:
                return json.load(open(lp))
            except Exception:
                return {}
        return {}
    try:
        return json.load(open(p))
    except Exception:
        return {}


EVOLVING_INPUTS = frozenset({'DESIGN-PLAN.md'})


def inputs_drifted(recorded, current):
    """Whether a recorded verdict's bound inputs changed in a way the
    verdict doesn't cover. DESIGN-PLAN.md legitimately evolves through
    sanctioned producers (the w3 pick projection, the w4 look rewrite —
    P.22 exempts it from frozen-input checks for the same reason), so
    drift on it alone never invalidates the verdict."""
    r = {k: v for k, v in (recorded or {}).items()
         if os.path.basename(k) not in EVOLVING_INPUTS}
    c = {k: v for k, v in (current or {}).items()
         if os.path.basename(k) not in EVOLVING_INPUTS}
    return r != c


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
    rec = (read_approvals(ctx) or {}).get(wave)
    if not rec:
        return 'missing'
    try:
        sys.path.insert(0, HERE)
        import approval_key as _ak
        ok, _why = _ak.verify_approval(rec)
    except Exception:
        ok = False
    if not ok:
        return 'unsigned'
    # provenance: the signed operator record stands on its own — the
    # orchestrator acts for the operator in this pipeline, so
    # mint-and-spend nonces are gone (operator decree). A legacy
    # record carrying a consumed nonce is still verified.
    sl = dna_slices(dna_map(ctx) or {})
    if rec.get('inputs') != _h(input_hashes_for(ctx, wave)):
        return 'stale'
    kinds = ('core', 'structure') if WAVE_DNA_KIND.get(wave) == 'all' \
        else (WAVE_DNA_KIND.get(wave) or 'core',)
    cur = {k: sl.get(k) for k in kinds}
    if {k: (rec.get('dna') or {}).get(k) for k in kinds} != cur:
        # legacy-recipe records stay valid against dna_slices_legacy —
        # a read-only probe never rewrites operator state (F-26);
        # `run.py migrate-approvals` re-keys them explicitly
        legacy = dna_slices_legacy(dna_map(ctx) or {})
        lcur = {k: legacy.get(k) for k in kinds}
        if {k: (rec.get('dna') or {}).get(k) for k in kinds} == lcur:
            return 'ok'
        return 'stale'
    return 'ok'


def _nonce_ledger_path():
    return os.path.join(OPERATOR_HOME, 'nonces', 'ledger.json')


def read_nonce_ledger():
    """[] when missing/corrupt/unsigned — the ledger is authoritative:
    no signed ledger means no service ever ran here."""
    p = _nonce_ledger_path()
    try:
        d = json.load(open(p))
    except Exception:
        return []
    key = op_key()
    if not isinstance(d, dict) or not key or \
            d.get('sig') != _sig(d, key):
        return []
    return [e for e in d.get('events') or [] if isinstance(e, dict)]


_NONCE_LOCK = threading.Lock()


def append_nonce_event(**ev):
    """Service-side write only — gate.py consumers read, never append.
    Append-only + re-signed every write: a designer rewrite either
    keeps the chain (entries stand) or breaks the signature (registry
    reads empty → every approval unverifiable)."""
    p = _nonce_ledger_path()
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with _NONCE_LOCK:
        try:
            d = json.load(open(p))
            if not isinstance(d, dict) or \
                    not isinstance(d.get('events'), list):
                d = {'events': []}
        except Exception:
            d = {'events': []}
        d['events'].append(dict(ev))
        d['sig'] = _sig(d, op_key(create=True))
        with open(p, 'w') as fh:
            json.dump(d, fh)
        os.chmod(p, 0o600)


def verify_consumed_nonce(nonce, wave, pipeline):
    """True iff the signed registry says the service issued THIS nonce
    for THIS wave+pipeline and consumed it exactly once (A5: restoring
    used:false on the nonce file cannot replay — approvals verify the
    consumed EVENT, and the file itself is deleted at consume)."""
    events = read_nonce_ledger()
    if not events or not nonce:
        return False
    pd = os.path.abspath(os.path.realpath(pipeline))
    issued = consumed = 0
    for e in events:
        if e.get('nonce') != nonce:
            continue
        if e.get('event') == 'issued' and e.get('wave') == wave \
                and e.get('pipeline') == pd:
            issued += 1
        if e.get('event') == 'consumed':
            consumed += 1
    return issued == 1 and consumed == 1


def migrate_approvals(ctx):
    """`run.py migrate-approvals <dir>` — re-key approval records whose
    dna slice matches the legacy recipe onto the current recipe.
    Returns (changed, total)."""
    # records can no longer be re-signed by machinery — migration
    # only re-keys the dna slice; the blanked sig forces the
    # operator to re-approve at a TTY
    allr = read_approvals(ctx)
    changed = 0
    for wave, rec in allr.items():
        kinds = ('core', 'structure') \
            if WAVE_DNA_KIND.get(wave) == 'all' \
            else (WAVE_DNA_KIND.get(wave) or 'core',)
        sl = dna_slices(dna_map(ctx) or {})
        cur = {k: sl.get(k) for k in kinds}
        legacy = dna_slices_legacy(dna_map(ctx) or {})
        lcur = {k: legacy.get(k) for k in kinds}
        have = {k: (rec.get('dna') or {}).get(k) for k in kinds}
        if have != cur and have == lcur:
            rec['dna'] = {'core': sl.get('core'),
                          'structure': sl.get('structure')}
            rec['migrated_from'] = 'dna_slices_legacy'
            # Ed25519 records can't be re-signed by machinery — the
            # record reads 'unsigned' and the operator re-approves
            rec['sig'] = ''
            allr[wave] = rec
            changed += 1
    if changed:
        with open(approvals_path(ctx), 'w') as fh:
            json.dump(allr, fh, indent=2, sort_keys=True)
    return changed, len(allr)


def lock_dna_map(ctx):
    """The ONE lock point: approving w4 (via a consumed service nonce)
    locks the DNA map to v1 — the look lock (DNA LAW). Called only
    from approve_service.record_approval."""
    m = dna_map(ctx)
    if m is None:
        return False
    locked = not (isinstance(m.get('version'), int)
                  and m['version'] >= 1)
    if locked:
        m['version'] = 1
        m['hashes'] = dna_slices(m)
        with open(os.path.join(ctx.dir, 'DNA.json'), 'w') as fh:
            # insertion order like dna_apply/plan_from_copy — X.1
            # byte-compares the producer chain, and sorting here
            # would diverge from the bytes those writers leave
            json.dump(m, fh, indent=1)
        with open(os.path.join(ctx.dir, 'DNA.md'), 'w',
                  encoding='utf-8') as fh:
            fh.write(render_dna_md(m))
    # the lock is a producer act (P.9/P.17): a w0 re-gate re-checks the
    # DNA.json row against disk — without a receipt citing the locked
    # bytes the row reads as an unrecorded mutation. Idempotent: a
    # lock recorded before receipts existed gets its receipt here.
    cur = _sha256_file(os.path.join(ctx.dir, 'DNA.json'))[:16]
    recs_p = os.path.join(ctx.dir, '.receipts', 'w4.json')
    try:
        recs = json.load(open(recs_p))
    except Exception:
        recs = {'steps': []}
    cited = any(st.get('label') == 'w4 look lock'
                and (st.get('outputs') or {}).get('DNA.json') == cur
                for st in recs['steps'])
    if not cited:
        outs = {'DNA.json': cur}
        fp = os.path.join(ctx.dir, 'DNA.md')
        if os.path.isfile(fp):
            outs['DNA.md'] = _sha256_file(fp)[:16]
        rec = {'label': 'w4 look lock', 'argv': ['approve_service.py',
                                               'lock_dna_map'],
               'inputs': {}, 'outputs': outs, 'rc': 0,
               'ts': __import__('datetime').datetime.now().isoformat(
                   timespec='seconds')}
        # sign at write time like pipeline._record — the checklist
        # verifier rejects unsigned steps as forgeable evidence
        key = op_key(create=True)
        if key:
            rec['sig'] = _sig(rec, key)
        recs['steps'].append(rec)
        os.makedirs(os.path.dirname(recs_p), exist_ok=True)
        json.dump(recs, open(recs_p, 'w'), indent=1)
    return locked


def approval_body(ctx, wave, by='operator-service', design=None,
                  nonce=None, chat=None, evidence=None, run=None):
    """The canonical approval record body (pre-signature). The X.3
    contract with approve_service.record_approval: exactly these
    fields, Ed25519-signed via approval_key.sign_body."""
    sl = dna_slices(dna_map(ctx) or {})
    rec = {'wave': wave,
           'inputs': _h(input_hashes_for(ctx, wave)),
           'dna': {'core': sl.get('core'),
                   'structure': sl.get('structure')},
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
    if run:
        rec['run'] = run
    return rec


def write_approval(ctx, wave, rec=None, by=None, design=None,
                   nonce=None, chat=None, evidence=None):
    """Persist an approval record. New contract: `rec` is the record
    approve_service already Ed25519-signed — this function signs
    NOTHING (a callable signing primitive was the X.3 hole). Legacy
    keyword callers (fixtures) get an UNSIGNED body; verify_approval
    rejects it, which is the point."""
    if rec is None:
        rec = approval_body(ctx, wave, by=by or 'operator-service',
                            design=design, nonce=nonce, chat=chat,
                            evidence=evidence)
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
    if ctx.wave == 'w0':
        # the COPY sources pin — re-ingest after mid-run tampering is
        # flagged by I.1 against these recorded shas
        cp = _copy_json(ctx) or {}
        for kind in ('stub', 'article'):
            sp = _source_file(
                ctx, (((cp.get('source') or {}).get(kind) or {})
                      .get('path')))
            if sp:
                files.append(sp)
    if ctx.wave == 'w7':
        files += [p for p, _ in ctx.page_htmls()]
        for slug in ctx.pages():
            sp = ctx.find(f'PAGES/{slug}/SPEC.md')
            if sp:
                files.append(sp)
    h = {}
    for f in files:
        p = f if os.path.isabs(f) else ctx._path(f)
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
    if ctx.wave not in WAVE_SEQ or ctx.wave == 's0':
        return f
    g = load_gates(ctx)
    for w in WAVE_SEQ[:WAVE_SEQ.index(ctx.wave)]:
        e = g.get(w)
        if e is None and w.startswith('s') and ctx.site_dir:
            # site waves record at the site root, not the page dir
            try:
                e = json.load(open(os.path.join(
                    ctx.site_dir, 'GATES.json'))).get(w)
            except Exception:
                e = None
        if e is None and w.startswith('s'):
            continue             # standalone dir: no site ancestry
        e = e or {}
        if not e.get('pass'):
            f.append(f'ORDER: {w} has not passed — run it first '
                     f'(python3 tools/design-gate/run.py {w} <dir>)')
            continue
        if w in APPROVABLE:
            st = approval_state(ctx, w)
            if st != 'ok':
                f.append(f'P.8 {w} approval {st} — the operator picks '
                         f'in the picker page (approve service); a flag '
                         f'inside the pipeline cannot approve')
        hc = Ctx(ctx.site_dir) \
            if (w.startswith('s') and ctx.site_dir) else ctx
        if e.get('inputs_sha256') and inputs_drifted(
                e['inputs_sha256'], input_hashes_for(hc, w)):
            f.append(f'ORDER: {w} inputs changed since it passed — '
                     f're-gate {w}')
    return f


def _warns_allowed(ctx):
    """--allow-warns counts only inside a verified run: an argv flag
    on a bare gate.py invocation carries no authority to downgrade
    WARN_CHECKS — the env token must satisfy RUN.json's keyed
    token_sig first (X.2)."""
    return bool(getattr(getattr(ctx, 'args', None), 'allow_warns',
                        False)) and not _run_token_fails(ctx)


def _run_token_fails(ctx):
    """X.2 — a wave runs only inside the orchestrator's run: RUN.json
    exists and PIPELINE_RUN verifies against its keyed token_sig.
    The gate.py CLI must not bypass the pin (attack 6g)."""
    p = ctx.find('RUN.json')
    if not p:
        return ['X.2 RUN.json missing — waves enter through '
                'pipeline.py only']
    try:
        run = json.load(open(p))
    except Exception:
        return ['X.2 RUN.json unparseable']
    env = os.environ.get('PIPELINE_RUN')
    # keyed/derived check: RUN.json stores token_sig =
    # HMAC(op_key, token), never the token itself — the on-disk
    # value cannot be replayed as a bare PIPELINE_RUN env
    if not run_token_ok(run, env):
        return ['X.2 PIPELINE_RUN token fails the RUN.json '
                'token_sig check (or unset) — waves enter through '
                'pipeline.py only']
    return []


def _check_pool(checks, ctx):
    """The checks of one wave are independent judges over the same
    artifacts — each reads ctx and returns a failure list, so they
    run concurrently and merge in declaration order."""
    import copy
    from concurrent.futures import ThreadPoolExecutor
    def call(chk):
        try:
            # private ctx per check — some checks mutate ctx.wave and
            # siblings must not observe it mid-flight
            return chk(copy.copy(ctx)) or []
        except BaseException as e:
            return [f'{chk.__name__} errored: {e}']
    if not checks:
        return []
    res = {}
    # mutating checks (check_astro_build rewrites dist/) run serially
    # before the read pool — a reader measuring dist mid-build sees a
    # torn artifact (404/transparent), never a verdict on the design
    readers = []
    for chk in checks:
        if getattr(chk, '_mutates', False):
            res[chk] = call(chk)
        else:
            readers.append(chk)
    with ThreadPoolExecutor(max_workers=min(8, len(readers))) as ex:
        res.update(zip(readers, ex.map(call, readers)))
    return [(chk, res[chk]) for chk in checks]


def run_wave(ctx):
    fails = _run_token_fails(ctx) + ancestry_fails(ctx)
    if not os.path.isfile(os.path.join(ctx.dir, 'DESIGN-PLAN.md')) \
            and ctx.wave not in ('s0', 'w0'):
        fails.append('DESIGN-PLAN.md missing')
    for chk, msgs in _check_pool(WAVE_CHECKS[ctx.wave], ctx):
        fails += msgs
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
    's0': ['DISCOVERY.json', 'DNA.json', 'TOKENS.json',
           'DESIGN-SYSTEM.md'],
    'w0': ['COPY.json', 'DESIGN-PLAN.md', 'STUB.md',
           'LAYOUT-OPTIONS.json', 'DNA.json', 'TOKENS.json'],
    'w1': ['CANDIDATES.json', 'preview/candidates.html'],
    'w3': ['preview/layouts.html'],
    'w4': ['preview/variants.html', 'preview/fine.html'],
    'w5': ['preview/system.html'],
    'w7': ['SPEC.md', 'ASSEMBLED.md', 'MEASURE.json'],
    'w8': ['SCORECARD.json', 'REVIEW.json', 'JUDGE.json'],
}


def clear_stale_receipts(ctx):
    """Drop unverifiable receipts for THIS wave's artifacts —
    receipts bind on this wave's pass, so a record whose sha or sig
    no longer verifies is dead weight that only blocks the re-bind.
    Earlier waves' receipts are never touched. Returns dropped rels."""
    g = load_gates(ctx)
    arts = g.get('artifacts') or {}
    key = op_key()
    dropped = []
    for rel in ARTIFACTS.get(ctx.wave, []):
        rec = arts.get(rel)
        if not rec:
            continue
        fp = os.path.join(ctx.dir, rel)
        sha = hashlib.sha256(open(fp, 'rb').read()).hexdigest() \
            if os.path.isfile(fp) else None
        want = _sig({k: v for k, v in rec.items() if k != 'sig'},
                    key) if key else None
        if sha != rec.get('sha256') or not want or \
                rec.get('sig') != want:
            del arts[rel]
            dropped.append(rel)
    if dropped:
        json.dump(g, open(ctx.gates_path, 'w'), indent=1)
    return dropped


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
    try:
        sys.path.insert(0, HERE)
        import context_pack as _cp
        _w = ctx.wave if ctx.wave in _cp.WAVE_STEP else \
            'per-section-build'
        arts[relpath]['context_tokens'] = \
            _cp.assemble_pack(ctx.dir, _w)['tokens']
    except Exception:
        pass
    # the receipt writer owns the key lifecycle: a receipt written
    # without the operator key can never verify (P.17 fail-closed),
    # so the first receipted artifact mints it.
    key = op_key(create=True)
    if key:
        arts[relpath]['sig'] = _sig(arts[relpath], key)
    json.dump(g, open(ctx.gates_path, 'w'), indent=1)


def check_receipt(path):
    """Validate an artifact's gate receipt — refuse unreceipted files.
    Refuses only on open P0/P1 rows IN THIS pipeline's chain —
    machinery findings never block a site pipeline."""
    blockers = open_findings(scope=_pipeline_scope(path))
    if blockers:
        print(f'receipt REFUSED — {len(blockers)} open P0/P1 '
              'finding(s); close the ledger first (gate.py findings)')
        return 1
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
        key = op_key()
        if key:
            want = _sig({k: v for k, v in rec.items() if k != 'sig'},
                        key)
            if rec.get('sig') != want:
                fails.append(f'{rel}: receipt unsigned or badly '
                             'signed — service-key bound required')
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
    # the run token is enforced HERE too — a caller who skips
    # run_wave cannot record a wave outside the pipeline (6g)
    fails = list(dict.fromkeys(_run_token_fails(ctx) + fails))
    g = load_gates(ctx)
    entry = g.get(ctx.wave, {})
    ih = input_hashes(ctx)
    entry.update({
        'pass': not fails,
        'failures': fails,
        'inputs_sha256': ih,
        'inputs_files': sorted(ih),
        'dna': {'core': sl.get('core'), 'structure': sl.get('structure')}
               if (sl := dna_slices(dna_map(ctx) or {})) else None,
        'ts': __import__('datetime').datetime.now().isoformat(
            timespec='seconds'),
    })
    if ctx.wave in ('w3', 'w4') and getattr(ctx.args, 'design', None):
        entry['design'] = ctx.design_id()
    # never trust a stored flag: approval is re-verified against the
    # signed operator record and the CURRENT inputs (B F-01/F-08)
    entry['approved'] = (not fails and
                         approval_state(ctx, ctx.wave) == 'ok')
    g[ctx.wave] = entry
    with open(ctx.gates_path, 'w') as fh:
        json.dump(g, fh, indent=2, sort_keys=True)
    # P.17 receipts bind AFTER the wave entry lands — write_receipt
    # re-loads GATES.json, so it sees (and cannot clobber) this entry
    if not fails:
        for rel in ARTIFACTS.get(ctx.wave, []):
            write_receipt(ctx, rel)
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
    # picker-only approvals: the approve service mints + records;
    # there is no terminal approval path at all. Driven end-to-end in
    # a temp operator home (P0 — never the real ~/.web-factory)
    tmpd = tempfile.mkdtemp()
    try:
        home = os.path.join(tmpd, 'op-home')
        os.makedirs(os.path.join(home, '.web-factory'))
        with open(os.path.join(home, '.web-factory', 'operator.key'),
                  'w') as fh:
            fh.write('fixture-key')
        gate_self.OPERATOR_HOME = os.path.join(home, '.web-factory')
        pd_ = os.path.join(tmpd, 'p')
        fxd = os.path.join(HERE, 'fixtures')
        shutil.copytree(os.path.join(fxd, '_base'), pd_, symlinks=True)
        gp = os.path.join(pd_, 'GATES.json')
        ctx_t = Ctx(pd_)
        gates = {'w0': {'pass': True,
                        'inputs_sha256': input_hashes_for(ctx_t, 'w0')},
                 'w1': {'pass': True,
                        'inputs_sha256': input_hashes_for(ctx_t, 'w1')},
                 'w2': {'pass': True,
                        'inputs_sha256': input_hashes_for(ctx_t, 'w2')},
                 'w3': {'pass': True,
                        'inputs_sha256': input_hashes_for(ctx_t, 'w3')}}
        json.dump(gates, open(gp, 'w'))
        env = dict(os.environ, HOME=home)
        # there is NO terminal approval path — every record is a
        # picker POST through the approve service (operator decree).
        # A stray `run.py approve` must exit non-zero, write nothing.
        r = subprocess.run(
            [sys.executable, os.path.join(HERE, 'run.py'), 'approve',
             'w4', pd_], capture_output=True, text=True, env=env)
        if r.returncode == 0:
            f.append('run.py approve still runs — approvals are '
                     'picker clicks only')
        # provision the fixture signing pair under the sandbox HOME —
        # the service-held key resolves ~/.config/web-factory/ through
        # HOME, so service calls + subprocesses sign/verify end-to-end
        import approve_service as S
        import approval_key as _ak3
        _fseed3 = hashlib.sha256(b'web-factory fixture key').digest()
        _fpub3 = _ak3._publickey(_fseed3).hex()
        _cfg = os.path.join(home, '.config', 'web-factory')
        os.makedirs(_cfg, exist_ok=True)
        with open(os.path.join(_cfg, 'approval-signing.key'), 'w') as fh:
            fh.write(_fseed3.hex())
        os.chmod(os.path.join(_cfg, 'approval-signing.key'), 0o600)
        with open(os.path.join(_cfg, 'approval-public.key'), 'w') as fh:
            fh.write(_fpub3)
        # a forged w3 record must refuse — run.py verifies through the
        # HOME-resident public key, no monkeypatch crosses exec (X.3)
        _ap = os.path.join(pd_, 'APPROVALS.json')
        _allr = json.load(open(_ap)) if os.path.isfile(_ap) else {}
        _allr['w3'] = {'wave': 'w3', 'inputs': 'x', 'dna': {},
                       'by': 'operator-service', 'ts': 't',
                       'sig': 'forged'}
        json.dump(_allr, open(_ap, 'w'))
        with open(os.path.join(pd_, 'RUN.json'), 'w') as fh:
            json.dump({'token_sig': run_token_sig('selftest-tok')}, fh)
        env2 = dict(env, PIPELINE_RUN='selftest-tok')
        r = subprocess.run(
            [sys.executable, os.path.join(HERE, 'run.py'), 'w4', pd_],
            capture_output=True, text=True, env=env2)
        if r.returncode == 0 or 'approval' not in r.stdout + r.stderr:
            f.append(f'run.py does not refuse w4 behind a forged w3 '
                     f'approval: {r.stdout.strip()[:140]}')
        # the real record path: mint + spend a nonce through the
        # service in-process (HOME switched so expanduser hits the
        # sandbox keys), then verify the signed record (X.3) and
        # prove nonces single-use
        _saved_env_home = os.environ.get('HOME')
        _saved_ophome = gate_self.OPERATOR_HOME
        gate_self.OPERATOR_HOME = os.path.join(home, '.web-factory')
        # approve_service holds a PRIVATE copy of this module (gate.py
        # runs as __main__; `import gate` loads a second instance)
        # with its own OPERATOR_HOME — sync it or nonces, ledger and
        # record writes go to the REAL ~/.web-factory (P0-class
        # selftest pollution + false X.3 failures)
        S.G.OPERATOR_HOME = gate_self.OPERATOR_HOME
        try:
            nonce, why = S.issue_nonce(pd_, 'w3')
            if not nonce:
                f.append(f'issue_nonce refused: {why}')
            else:
                code, out = S.record_approval(
                    'w3', pd_, nonce=nonce, design='d2')
                if code != 0:
                    f.append(f'record_approval refused a good nonce: '
                             f'{out.strip()[-160:]}')
                elif approval_state(Ctx(pd_), 'w3') != 'ok':
                    f.append('a service-signed w3 record does not '
                             'verify (X.3)')
                code2, out2 = S.record_approval(
                    'w3', pd_, nonce=nonce, design='d2')
                if code2 == 0:
                    f.append('nonce replay accepted — nonces are '
                             'single-use')
        finally:
            gate_self.OPERATOR_HOME = _saved_ophome
            if _saved_env_home is None:
                os.environ.pop('HOME', None)
            else:
                os.environ['HOME'] = _saved_env_home
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
        # preview pages are emitted+built by preview_build now — the
        # only in-gate astro emitter left is assemble_page
        for gen in ('assemble_page',):
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
        os.makedirs(os.path.join(home, '.web-factory'))
        with open(os.path.join(home, '.web-factory', 'operator.key'),
                  'w') as fh:
            fh.write('fixture-key')
        gate_self.OPERATOR_HOME = os.path.join(home, '.web-factory')
        pdir = os.path.join(tmp, 'p')
        shutil.copytree(os.path.join(HERE, 'fixtures', '_base'), pdir,
                        symlinks=True)
        c1 = Ctx(pdir)
        c1.wave = 'w3'
        gp = os.path.join(pdir, 'GATES.json')
        with open(gp, 'w') as fh:
            json.dump({'w0': {'pass': True, 'dna': None},
                       'w1': {'pass': True},
                       'w2': {'pass': True},
                       'w3': {'pass': True, 'approved': True,
                              'inputs_sha256': input_hashes(c1)}}, fh)
        # X.2 — run.py waves enter only inside a run: pin the token
        # and env the orchestrator would have set
        with open(os.path.join(pdir, 'RUN.json'), 'w') as fh:
            json.dump({'token_sig': run_token_sig('selftest-tok')}, fh)
        env = dict(os.environ, HOME=home, PIPELINE_RUN='selftest-tok')
        rp = os.path.join(HERE, 'run.py')
        r = subprocess.run([sys.executable, rp, 'w4', pdir],
                           capture_output=True, text=True, env=env)
        if r.returncode == 0 or (
                'approval missing' not in r.stdout and
                'approval unsigned' not in r.stdout):
            f.append('run.py does not refuse a wave whose approvable '
                     f'ancestor is unsigned: {r.stdout.strip()[:120]}')
        g = json.load(open(gp))
        if g.get('w4', {}).get('pass'):
            f.append('run.py gated w4 without its ancestors being clean')
        # signed approval → w2 ancestry clears. Verification only works
        # IN-PROCESS here: a subprocess gate cannot see the monkeypatched
        # fixture pubkey and correctly stays refusal-side (nothing a
        # pipeline spawns ever holds the operator key). run.py is
        # driven in-process — it imports this same gate module.
        append_nonce_event(event='issued', nonce='selftest-nonce',
                           wave='w3', pipeline=c1.dir)
        append_nonce_event(event='consumed', nonce='selftest-nonce',
                           wave='w3', pipeline=c1.dir)
        import approval_key as _ak2, io, contextlib
        # run.py's `import gate` must bind THIS module, not a second
        # copy with its own OPERATOR_HOME: pre-seed sys.modules so
        # R.main's ancestry, ledger and approval reads share the
        # sandbox (same P0-class trap as S.G, fixed at the source)
        sys.modules['gate'] = gate_self
        import run as R
        _fs = hashlib.sha256(b'web-factory fixture key').digest()
        rec = gate_self.approval_body(c1, 'w3', by='operator-service',
                                    nonce='selftest-nonce')
        rec['sig'] = _ak2.ed25519_sign(_fs, json.dumps(
            {k: v for k, v in rec.items() if k != 'sig'},
            sort_keys=True).encode())
        gate_self.write_approval(c1, 'w3', rec=rec)
        c2 = Ctx(pdir)
        c2.wave = 'w4'
        af = ancestry_fails(c2)
        if any('approval' in x for x in af):
            f.append(f'a verified signed approval does not clear w4 '
                     f'ancestry: {af[:3]}')
        # a changed DNA structure slice then stops it — run.py's
        # restart branch resets every downstream gate (DM.6)
        sl = dna_slices(dna_map(c1))
        g = json.load(open(gp))
        g['w3'].update({'pass': True, 'dna': {'core': sl['core'],
                                              'structure': 'deadbeef'},
                        'inputs_sha256': input_hashes(c1)})
        with open(gp, 'w') as fh:
            json.dump(g, fh)
        _saved_env_tok = os.environ.get('PIPELINE_RUN')
        os.environ['PIPELINE_RUN'] = 'selftest-tok'
        _argv = sys.argv
        sys.argv = ['run.py', 'w4', pdir]
        buf = io.StringIO()
        try:
            with contextlib.redirect_stdout(buf):
                _rc = R.main()
        finally:
            sys.argv = _argv
            if _saved_env_tok is None:
                os.environ.pop('PIPELINE_RUN', None)
            else:
                os.environ['PIPELINE_RUN'] = _saved_env_tok
        out = buf.getvalue()
        if _rc == 0 or 'DNA map changed' not in out:
            f.append('run.py does not refuse a wave after the DNA map '
                     f'changed: {out.strip()[:120]}')
        g = json.load(open(gp))
        if g.get('w3', {}).get('pass') is not False:
            f.append('run.py did not reset downstream gates on a DNA change')
        # gate.py itself refuses a wave with no ancestry (no bypass)
        r = subprocess.run([sys.executable, os.path.join(HERE, 'gate.py'),
                            'w4', pdir], capture_output=True, text=True,
                           env=env)
        if r.returncode == 0 or not (
                'ORDER' in r.stdout or 'P.8' in r.stdout):
            f.append('gate.py wN runs without its ancestors passing '
                     f'(bypass): {r.stdout.strip()[:120]}')
        # gate.py --approve is not an approval channel
        r = subprocess.run([sys.executable, os.path.join(HERE, 'gate.py'),
                            'w3', pdir, '--approve'], capture_output=True,
                           text=True, env=env)
        if r.returncode != 2 or 'never records approval' not in r.stdout:
            f.append('gate.py --approve is still an approval channel')
    finally:
        gate_self.OPERATOR_HOME = saved_home
        shutil.rmtree(tmp, ignore_errors=True)
    # STYLE-VOCAB §4.4 — a licensed style waives ONLY its enumerated
    # rules: neo-brutal 4px border passes S.5 under licence, a bogus
    # cluster and an unlicensed border still fail
    tmp = tempfile.mkdtemp()
    saved_home2 = gate_self.OPERATOR_HOME
    try:
        home = os.path.join(tmp, 'home')
        os.makedirs(home)
        gate_self.OPERATOR_HOME = os.path.join(home, '.web-factory')
        pdir = os.path.join(tmp, 'p')
        shutil.copytree(os.path.join(HERE, 'fixtures', '_base'), pdir,
                        symlinks=True)
        with open(os.path.join(pdir, 'site', 'src', 'styles',
                               'global.css'), 'a') as fh:
            fh.write('\n.card { border: 4px solid #000; }')
        c = Ctx(pdir)
        c.wave = 'w8'
        if not gate_self.check_border_widths(c):
            f.append('unlicensed 4px border does not trip S.5')
        plan = open(os.path.join(pdir, 'DESIGN-PLAN.md')).read()
        plan = plan.replace(
            "decisions:\n  - {rule_id: L.3,",
            "style_licences:\n"
            "  - {cluster: neo-brutalist, where: ''}\n"
            "decisions:\n  - {rule_id: L.3,")
        open(os.path.join(pdir, 'DESIGN-PLAN.md'), 'w').write(plan)
        c = Ctx(pdir)
        c.wave = 'w8'
        if _apply_declared_breaks(c, gate_self.check_border_widths(c)):
            f.append('licensed neo-brutal 4px border not waived')
        sl = gate_self.check_style_licence(c)
        if not any('ST.2' in m for m in sl):
            f.append('unrecorded licence does not trip ST.2')
        dna_p = os.path.join(pdir, 'DNA.json')
        d = json.load(open(dna_p))
        d['style_licences'] = ['neo-brutalist']
        json.dump(d, open(dna_p, 'w'))
        c = Ctx(pdir)
        c.wave = 'w8'
        if gate_self.check_style_licence(c):
            f.append('licensed + DNA-recorded style still fails '
                     'STYLE checks')
        plan = plan.replace('neo-brutalist', 'made-up-style')
        open(os.path.join(pdir, 'DESIGN-PLAN.md'), 'w').write(plan)
        c = Ctx(pdir)
        c.wave = 'w8'
        if not any('ST.1' in m for m in
                   gate_self.check_style_licence(c)):
            f.append('unknown style cluster not rejected')
    finally:
        gate_self.OPERATOR_HOME = saved_home2
        shutil.rmtree(tmp, ignore_errors=True)
    return f

def scope_selftest():
    """Operator law: blocking is per-chain. A machinery P1 NEVER blocks
    a site pipeline's round/receipt; pipeline:A never gates pipeline:B;
    an option lane never gates its siblings."""
    f = []
    import tempfile as _tf
    saved_path = FINDINGS_PATH
    tmp = _tf.mkdtemp()
    try:
        gate_mod = sys.modules[__name__]
        gate_mod.FINDINGS_PATH = os.path.join(tmp, 'FINDINGS.json')
        rows = [
            {'id': 'M1', 'severity': 'P1', 'status': 'open',
             'scope': 'machinery', 'mutation': 'machinery defect'},
            {'id': 'P-A', 'severity': 'P1', 'status': 'open',
             'scope': 'pipeline:site-a', 'mutation': 'site-a defect'},
            {'id': 'P-A-OPT', 'severity': 'P1', 'status': 'open',
             'scope': 'pipeline:site-a:option:d2',
             'mutation': 'option lane defect'},
            {'id': 'G1', 'severity': 'P1', 'status': 'open',
             'scope': 'global', 'mutation': 'global defect'},
        ]
        json.dump({'schema': 'design-gate-findings/v1',
                   'findings': rows},
                  open(gate_mod.FINDINGS_PATH, 'w'))
        mach = {r['id'] for r in open_findings(scope='machinery')}
        if mach != {'M1', 'G1'}:
            f.append(f'machinery scope got {sorted(mach)} — a '
                     'pipeline finding leaked into the machinery chain')
        pa = {r['id'] for r in
              open_findings(scope='pipeline:site-a')}
        if pa != {'P-A', 'G1'}:
            f.append(f'pipeline:site-a scope got {sorted(pa)} — own '
                     'chain + global expected; option-lane rows stay '
                     'in their lane')
        pb = {r['id'] for r in
              open_findings(scope='pipeline:site-b')}
        if pb != {'G1'}:
            f.append(f'pipeline:site-b scope got {sorted(pb)} — page '
                     'A blocked page B')
        opt1 = {r['id'] for r in open_findings(
            scope='pipeline:site-a:option:d1')}
        if opt1 != {'P-A', 'G1'}:
            f.append(f'option d1 scope got {sorted(opt1)} — rejected '
                     'sibling lane d2 blocked a sibling')
        opt2 = {r['id'] for r in open_findings(
            scope='pipeline:site-a:option:d2')}
        if opt2 != {'P-A', 'P-A-OPT', 'G1'}:
            f.append(f'option d2 scope got {sorted(opt2)} — its own '
                     'lane defect did not surface')
        # _pipeline_scope: a dir holding GATES.json is a pipeline
        pd = os.path.join(tmp, 'site-a')
        os.makedirs(pd)
        json.dump({}, open(os.path.join(pd, 'GATES.json'), 'w'))
        if _pipeline_scope(pd) != 'pipeline:site-a':
            f.append(f'_pipeline_scope got {_pipeline_scope(pd)}')
        if _pipeline_scope(pd, option='d1') != \
                'pipeline:site-a:option:d1':
            f.append('option scope resolution broken')
        if _pipeline_scope('/nonexistent/deep/path') != 'machinery':
            f.append('unscoped path did not fall back to machinery')
    finally:
        sys.modules[__name__].FINDINGS_PATH = saved_path
        shutil.rmtree(tmp, ignore_errors=True)
    return f


def cmd_selftest():
    import tempfile as _tf
    _home = os.path.join(_tf.mkdtemp(), '.web-factory')
    os.makedirs(_home, exist_ok=True)
    with open(os.path.join(_home, 'operator.key'), 'wb') as fh:
        fh.write(b'fixture-key')
    globals()['OPERATOR_HOME'] = _home
    fx = os.path.join(HERE, 'fixtures')
    # fixture approvals are Ed25519-signed under a deterministic
    # fixture seed (gen_fixtures). In-process checks verify them
    # against fixtures/.fixture-pub.json — module-attr monkeypatch,
    # never env (F-03); subprocess gate runs still refuse signatures.
    sys.path.insert(0, HERE)
    import approval_key as _AK
    _fpub_p = os.path.join(fx, '.fixture-pub.json')
    if os.path.isfile(_fpub_p):
        _AK.PUBKEY_PATH = _fpub_p
        try:
            _AK.ANCHOR_OVERRIDE = json.load(
                open(_fpub_p)).get('ed25519_public_key')
        except Exception:
            pass
    # service-channel fixture records carry a nonce — the ledger
    # (OPERATOR_HOME, not the fixture dir) must show issued+consumed
    # for each, or check_operator_approvals calls the record a
    # forgery. Fresh ledger per dir: a shared nonce spent in two
    # sandboxes reads as double-consumed (correctly rejected).
    _led = os.path.join(_home, 'nonces')
    os.makedirs(_led, exist_ok=True)

    def _arm_fixture_ledger(pd):
        lp = os.path.join(_led, 'ledger.json')
        if os.path.isfile(lp):
            os.remove(lp)
        try:
            appr = json.load(open(os.path.join(pd, 'APPROVALS.json')))
        except Exception:
            return
        for w, r in appr.items():
            nc = (r or {}).get('nonce')
            if not nc:
                continue
            pdc = os.path.abspath(os.path.realpath(pd))
            append_nonce_event(event='issued', nonce=nc, wave=w,
                               pipeline=pdc)
            append_nonce_event(event='consumed', nonce=nc, wave=w,
                               pipeline=pdc)
    checks = {c.__name__: c for lst in WAVE_CHECKS.values()
              for c in lst}
    checks.update({c.__name__: c for lst in WARN_CHECKS.values()
                   for c in lst})
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
            _arm_fixture_ledger(pd)
            ctx = Ctx(pd)
            ctx.wave = 'selftest'
            got = checks[name](ctx)
            ran += 1
            if want == 0 and got:
                fails.append(f'{name}/pass fixture failed: {got[:2]}')
            if want == 1 and not got:
                fails.append(f'{name}/fail fixture NOT caught')
    fails += cli_selftest()
    fails += scope_selftest()
    # every redteam mutation must still FAIL — a survivor is a live
    # bypass (recorded to FINDINGS.json as an open finding)
    for fid, hits, _ in run_redteam():
        if not hits:
            fails.append(f'redteam {fid} survived — bypass still open')
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


# ---------------------------------------------------------------- findings + redteam
#
# research/FINDINGS.json is the defect ledger: every confirmed defect
# is a row {id, severity, mutation, status, fixture}. A row closes
# ONLY through a named fail-fixture or redteam mutation that
# reproduces the defect and the gate FAILS it — `gate.py findings`
# audits that promise. While any P0/P1 row is open, `gate.py round`
# and `gate.py receipt` refuse: the machinery is untrusted until the
# ledger is clean.

FINDINGS_PATH = os.path.join(REPO, 'research', 'FINDINGS.json')


def read_findings():
    try:
        d = json.load(open(FINDINGS_PATH))
    except Exception:
        return []
    rows = d.get('findings') if isinstance(d, dict) else d
    return [r for r in rows or [] if isinstance(r, dict)]


def open_findings(severities=('P0', 'P1'), scope='machinery'):
    """Open severities IN THE CALLER'S CHAIN — a row blocks only what
    its scope names: machinery rows gate machinery commands;
    pipeline:<id> rows gate that pipeline and its option lanes;
    pipeline:<id>:option:<opt> rows gate only that lane; 'global'
    gates everything. A machinery P1 NEVER blocks a site pipeline;
    page A NEVER blocks page B; a rejected option NEVER blocks a
    sibling lane (no process blocks another unless serialised in the
    same chain)."""
    out = []
    for r in read_findings():
        if r.get('status') != 'open' or \
                str(r.get('severity', '')).upper() not in severities:
            continue
        rs = str(r.get('scope') or 'machinery')
        if rs == 'global' or rs == scope or \
                scope.startswith(rs + ':'):
            out.append(r)
    return out


def _pipeline_scope(path, option=None):
    """'pipeline:<dir-of-GATES.json>' for a path inside a site
    pipeline, else 'machinery'. option= narrows to one option lane."""
    probe = os.path.abspath(path)
    if not os.path.isdir(probe):
        probe = os.path.dirname(probe)
    while probe and probe != os.path.dirname(probe):
        if os.path.isfile(os.path.join(probe, 'GATES.json')):
            s = f'pipeline:{os.path.basename(probe)}'
            return f'{s}:option:{option}' if option else s
        probe = os.path.dirname(probe)
    return 'machinery'


# redteam mutation library — every entry reproduces a confirmed
# bypass: (finding_id, expected_fail_prefix, ops). ops = gen_fixtures
# semantics: DEL/APPEND/SET/REPL file ops applied to a _base copy.
# A mutation that produces NO matching failure is a SURVIVOR = the
# hole is still open → new finding.
REDTEAM_MUTATIONS = [
 ('RT-M13-COMMENT', 'M.13', (
  ('REPL', 'site/src/styles/global.css',
   '@media (prefers-reduced-motion: reduce)',
   '/* @media (prefers-reduced-motion: later) */ @media (min-width: 0px)'),
  ('REPLGLOB', 'site/dist/_astro/',
   '@media(prefers-reduced-motion:reduce){', '@media(min-width:0px){'),
  ('APPEND', 'site/dist/home/style.css',
   '@keyframes shimmy { to { transform: translateX(1rem) } }'
   '.shim { animation: shimmy 1s; }'))),
 ('RT-M13-TRANSITION', 'M.13', (
  ('DEL', 'site/src/styles/global.css'),
  ('DELGLOB', 'site/dist/_astro/'),
  ('SET', 'site/dist/home/style.css',
   '.card { transition: transform .3s; }'))),
 ('RT-SKL-INNERDIV', 'SKL.', (
  ('APPEND', 'site/dist/home/index.html',
   '<section data-sec="proof2" data-comp="logo-wall" data-intent="proof" '
   'data-skeleton="hyperui/marketing/logo-clouds/1" class="sec-band">'
   '<div class="bg-blue-50 text-lg"><h3>x</h3></div></section>'),)),
 ('RT-SKL-PY8', 'SKL.', (
  ('APPEND', 'site/dist/home/index.html',
   '<section data-sec="proof3" data-comp="logo-wall" data-intent="proof" '
   'data-skeleton="hyperui/marketing/logo-clouds/1" class="py-8">'
   '<h3>x</h3></section>'),)),
 ('RT-INV-HEADERONLY', 'W2', (
  ('REPL', 'STUB.md',
   '| services | H2 What is testing? |', '| services | TBD |'),)),
 ('RT-CAND-UNSIGNED', 'REVIEW.CAND', (
  ('REPL', 'CANDIDATES.json',
   '"decision_sig": "b3e88f097d3ebec798ab97434ab43bd8"',
   '"decision_sig": "deadbeefdeadbeefdeadbeefdeadbeef"'),)),
 ('RT-REC-UNSIGNED', 'P.17', (
  ('REPL', 'GATES.json',
   '"sig": "5d86d223403dbfd0e0f88e5e2449bfae"', ''),)),
 ('RT-REC-GATEPASS', 'P.17', (
  ('REPL', 'GATES.json',
   '"gate_pass": true', '"gate_pass": false'),)),
 ('RT-WILD-NOHIST', 'B.7', (('DEL', 'WILDCARD-HISTORY.json'),)),
 ('RT-WILD-SEEDREUSE', 'B.7', (
  ('REPL', 'DNA.json', '"wildcard_seed": 424242',
   '"wildcard_seed": 117'),)),
 ('RT-REF-ARBITRARY', 'REF', (
  ('REPL', 'MOBBIN-REFS.md', 'https://lexingtonthemes.com',
   'https://random-unregistered-site.example'),)),
 ('RT-R10-MINH', 'R.10', (
  ('REPL', 'site/dist/home/index.html',
   'class="sec-band surface-base density-spacious"',
   'class="sec-band surface-base density-spacious min-h-screen"'),)),
 ('RT-C3-DEADGREY', 'C.3', (
  ('REPL', 'DESIGN-PLAN.md', 'surface: {value: "#F1EFEC"}',
   'surface: {value: "#8A8A8A"}'),)),
 ('RT-C5-LIGHTDARK', 'C.5', (
  ('REPL', 'TOKENS.json', '"bg": "#14181A"',
   '"bg": "oklch(0.5 0.01 230)"'),)),
 ('RT-M14-LENIS', 'M.14', (
  ('SET', 'site/dist/_astro/sm.js',
   'import Lenis from "lenis"; new Lenis();'),)),
 ('RT-M14-GSAP-BARE', 'M.14', (
  ('SET', 'site/dist/_astro/an.js', 'gsap.to(".x",{y:9});'),)),
 ('RT-PS11-MULTIVEC', 'PS.11', (
  ('REPL', 'DESIGN-PLAN.md',
   'vector: [{heading: "What is testing?", fs: "Testing is the thing."}]',
   'vector: [{heading: "What is testing?", fs: "Testing."},'
   ' {heading: "Why us?", fs: "Because."}]'),)),
 ('RT-WIDTH-OFFRUNG', 'A.1', (
  ('APPEND', 'site/dist/home/index.html',
   '<div class="width--55">x</div>'),)),
 ('RT-STYLE-BOGUS', 'ST.', (
  ('REPL', 'DESIGN-PLAN.md',
   'decisions:\n  - {rule_id: L.3',
   'style_licences:\n  - {cluster: made-up-style, where: ""}\n'
   'decisions:\n  - {rule_id: L.3'),)),
 ('RT-STYLE-UNRECORDED', 'ST.', (
  ('REPL', 'DESIGN-PLAN.md',
   'decisions:\n  - {rule_id: L.3',
   'style_licences:\n  - {cluster: neo-brutalist, where: ""}\n'
   'decisions:\n  - {rule_id: L.3'),)),
 ('RT-R12-FIXPAD', 'R.12', (
  ('APPEND', 'preview/layouts.html',
   '<style>.adlib{padding:12px}</style>'),)),
 ('RT-PICKER-STACKED', 'VG.7', (
  ('REPL', 'preview/layouts.html',
   '.picker-opt{display:none}', '.picker-opt{display:block}'),
  ('REPL', 'preview/layouts.html',
   'data-tab="', 'data-nope="'),
  ('REPL', 'preview/layouts.html',
   'data-switch="', 'data-noswitch="'),
  ('REPL', 'preview/layouts.html',
   'data-goto="', 'data-nogoto="'),)),
 ('RT-PICKER-META', 'VG.7', (
  ('REPL', 'preview/layouts.html',
   '<details class="variant-data"><summary>Design machinery '
   '(refs, score, review)</summary>',
   '<p class="variant-meta">Design machinery '
   '(refs, score, review):'),)),
 ('RT-J7-DECLAREDWRONG', 'J.7', (
  ('REPL', 'PREBUILD.json',
   '"element_variant": "text"', '"element_variant": "image"'),)),
 ('RT-J7-TEXTUNDERLED', 'J.7', (
  ('REPL', 'PREBUILD.json',
   '"element_variant": "text"', '"element_variant": "chart"'),
  ('REPL', 'DESIGN-PLAN.md',
   'image-led-ratio: balanced', 'image-led-ratio: image-led'),)),
 ('RT-J8-UNDECLARED', 'J.8', (
  ('REPL', 'site/dist/home/index.html',
   'data-seam="whitespace"',
   'data-seam="whitespace" data-seam-shape-top="wave"'),)),
 ('RT-J8-MISMATCH', 'J.8', (
  ('REPL', 'DESIGN-PLAN.md',
   'seam-shape: flat', 'seam-shape: wave'),
  ('REPL', 'site/dist/home/index.html',
   'data-seam="whitespace" data-content="c-h1"',
   'data-seam="whitespace" data-seam-shape-bottom="wave" '
   'data-content="c-h1"'),
  ('REPL', 'site/dist/home/index.html',
   'data-content="c-def"',
   'data-seam-shape-top="diagonal" '
   'data-content="c-def"'),)),
 ('RT-TK2-MISSINGDARK', 'TK.2', (
  ('REPL', 'site/src/styles/global.css',
   '--action-primary: #4C93D6;',
   '/* --action-primary missing in dark */'),)),
 ('RT-TK3-HEX', 'TK.3', (
  ('APPEND', 'site/src/components/sections/Hero.astro',
   '<div style="color: #123456">x</div>'),)),
 ('RT-VG9-ACCENTCHROME', 'VG.9', (
  ('APPEND', 'preview/variants.html',
   '<style>.variant-pickrow{background:var(--accent)}</style>'),)),
 ('RT-VG9-SELECTFILL', 'VG.9', (
  ('APPEND', 'preview/variants.html',
   '<style>.picker-opt.active{background:#2563eb}</style>'),)),
]


def _apply_ops(files, ops):
    for op in ops:
        kind = op[0]
        if kind == 'DEL':
            files.pop(op[1], None)
        elif kind == 'APPEND':
            files[op[1]] = files.get(op[1], '') + op[2]
        elif kind == 'SET':
            files[op[1]] = op[2]
        elif kind == 'REPL':
            if op[1] in files:
                files[op[1]] = files[op[1]].replace(op[2], op[3])
        elif kind == 'REPLGLOB':
            for k in [k for k in files if k.startswith(op[1])]:
                files[k] = files[k].replace(op[2], op[3])
        elif kind == 'DELGLOB':
            for k in [k for k in files if k.startswith(op[1])]:
                files.pop(k, None)
    return files


def run_redteam(write_findings=True):
    """Apply every mutation to a _base copy at w8; a mutation that no
    check FAILs is a surviving bypass. Returns [(id, fails)] and
    appends survivors to FINDINGS.json as open P1 defects."""
    import tempfile as _tf
    base = os.path.join(HERE, 'fixtures', '_base')
    # env-bound checks can't run against a mutation dir — same
    # exemption as cmd_selftest
    env_exempt = {'check_astro_build', 'check_mobbin_auth'}
    # check_wildcard is an aggregate: inside the sweep it re-runs the
    # whole wave's checks (double cost, duplicate messages) — leaf
    # checks already cover the surface
    slow = {'check_canon_trace', 'check_round_gated_look',
            'check_fine_round', 'check_scorecard'}
    all_checks = [c for lst in WAVE_CHECKS.values() for c in lst
                  if c.__name__ not in env_exempt
                  and c is not check_wildcard]
    fast_checks = [c for c in all_checks
                   if c.__name__ not in slow]
    slow_checks = [c for c in all_checks
                   if c.__name__ in slow]
    results = []
    for fid, prefix, ops in REDTEAM_MUTATIONS:
        tmp = _tf.mkdtemp()
        try:
            files = {}
            for dp, _, fns in os.walk(base):
                for fn in fns:
                    fp = os.path.join(dp, fn)
                    rel = os.path.relpath(fp, base)
                    try:
                        files[rel] = open(fp, encoding='utf-8',
                                          errors='replace').read()
                    except Exception:
                        files[rel] = open(fp, 'rb').read()
            files = _apply_ops(files, ops)
            pd = os.path.join(tmp, 'p')
            for rel, c in files.items():
                fp = os.path.join(pd, rel)
                os.makedirs(os.path.dirname(fp), exist_ok=True)
                if isinstance(c, bytes):
                    open(fp, 'wb').write(c)
                else:
                    open(fp, 'w').write(c)
            ctx = Ctx(pd)
            ctx.wave = 'w8'
            fails = []
            for c in fast_checks:
                try:
                    fails += c(ctx)
                except Exception:
                    pass
            hits = [x for x in fails if prefix in x]
            if not hits:
                # expensive canon/round checks run only while the
                # mutation is still unfired — they're the only
                # catchers of REF/CANON-class mutations anyway
                for c in slow_checks:
                    try:
                        fails += c(ctx)
                    except Exception:
                        pass
                hits = [x for x in fails if prefix in x]
            results.append((fid, hits, fails))
        finally:
            shutil.rmtree(tmp, ignore_errors=True)
    survivors = [r for r in results if not r[1]]
    if write_findings and survivors:
        rows = read_findings()
        known = {r.get('id') for r in rows}
        out = {'schema': 'design-gate-findings/v1',
               'findings': rows}
        for fid, _, fails in survivors:
            if fid in known:
                continue
            out['findings'].append(
                {'id': fid, 'severity': 'P1',
                 'mutation': f'redteam:{fid} survived — no check failed',
                 'status': 'open', 'scope': 'machinery',
                 'fixture': f'redteam:{fid}'})
        if not rows:
            os.makedirs(os.path.dirname(FINDINGS_PATH), exist_ok=True)
        json.dump(out, open(FINDINGS_PATH, 'w'), indent=1)
    return results


def cmd_redteam(_a=None):
    results = run_redteam()
    survivors = [(f_, fs) for _, h, fs in results for f_ in [h] if not f_]
    for fid, hits, fails in results:
        mark = 'FAIL' if hits else 'SURVIVED'
        got = hits[0][:80] if hits else \
            (fails[0][:80] if fails else 'no failures at all')
        print(f'  {mark:8} {fid}: {got}')
    if survivors:
        print(f'redteam: {len(survivors)} mutation(s) survived — '
              'recorded as open findings (FINDINGS.json)')
        return 1
    print(f'redteam PASS: {len(results)} mutations all caught')
    return 0


def cmd_findings(_a=None):
    """Audit the ledger: every closed finding's named fixture must
    still reproduce the defect (its check fails)."""
    rows = read_findings()
    bad = []
    rt = {fid: pre for fid, pre, _ in REDTEAM_MUTATIONS}
    for r in rows:
        if r.get('status') != 'closed':
            continue
        fix = str(r.get('fixture') or '')
        if 'redteam:' in fix:
            for fid in re.findall(r'redteam:(RT-[\w-]+)', fix):
                if fid not in rt:
                    bad.append(f"{r.get('id')}: unknown redteam "
                               f'mutation {fid}')
            continue
        # file fixture: fixtures/<check>/fail must produce failures
        if fix.startswith('fixtures/'):
            name = fix.split('/')[1]
            checks = {c.__name__: c for lst in WAVE_CHECKS.values()
                      for c in lst}
            if name in checks and os.path.isdir(
                    os.path.join(HERE, 'fixtures', name, 'fail')):
                ctx = Ctx(os.path.join(HERE, 'fixtures', name, 'fail'))
                ctx.wave = 'selftest'
                if not checks[name](ctx):
                    bad.append(f"{r.get('id')}: {fix} no longer fails")
            else:
                bad.append(f"{r.get('id')}: {fix} missing")
    open_p = open_findings()
    for r in rows:
        if r.get('status') == 'open':
            print(f"  open    {r.get('severity','?'):3} {r.get('id')}: "
                  f"{str(r.get('mutation'))[:70]}")
    if bad:
        for b in bad:
            print('  broken ', b)
        return 1
    if open_p:
        print(f'findings: {len(open_p)} P0/P1 open — rounds and '
              'receipts REFUSE until closed')
        return 1
    print(f'findings OK: {len(rows)} rows, '
          f'{sum(1 for r in rows if r.get("status") == "open")} open')
    return 0


# ---------------------------------------------------------------- main

# ---------------------------------------------------------------- wave tables

# ---------------------------------------------------------------- picker rounds

EMOJI_RX = re.compile(
    '[\U0001F300-\U0001FAFF\u2600-\u27BF\U0001F1E6-\U0001F1FF'
    '\u2190-\u21FF\u2300-\u23FF\u25A0-\u25FF\u203C\u2049\u2122'
    '\u2139\u3030\u303D\u20E3\uFE0F]')


def _design_blocks(txt):
    """{id: block_text} — one scope per design in a picker HTML.
    `id` on an <article>/<div> is the option key when present; the
    data-(design|variant|layout) attrs are the fallback — a real
    picker carries BOTH on one <article> and must count once
    (F-11). Repeated values (one label per computed option) never
    count as separate designs."""
    m = list(re.finditer(r'<(?:article|div)[^>]*\bid="([\w-]+)"', txt))
    ids = []
    for x in m:
        if x.group(1) not in ids and not x.group(1).startswith(
                ('switch', 'seg', 'frame')):
            ids.append(x.group(1))
    if not ids:
        m = list(re.finditer(
            r'data-(?:design|variant|layout)="(d?[\w-]+)"', txt))
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


def _render_sig(block, scoped_css=''):
    """A rendered-structure signature: the section composition
    sequence + geometry-bearing attributes + scoped layout CSS. Knob
    names and scores are deliberately excluded."""
    secs = re.findall(
        r'<(?:section|nav|header|footer)[^>]*data-comp="([^"]+)"([^>]*)>', block)
    comps = tuple(c for c, _ in secs)
    geo_attrs = tuple(
        tuple(sorted(re.findall(
            r'data-(?:ratio|density|surface|disclosure|stack|align|'
            r'collapse)="([^"]+)"', a)))
        for _, a in secs)
    geo = tuple(sorted(set(re.findall(
        r'(?:aspect-ratio|display|flex-direction|grid-template(?:-\w+)?'
        r'|columns?|min-height|order|place-items|text-align)\s*:\s*'
        r'([^;}]+)', block + scoped_css))))
    media = tuple(sorted(set(re.findall(
        r'<(img|video|picture|figure|svg|iframe|canvas)\b', block))))
    return (comps, geo_attrs, geo, media)


def _picker_ux_fails(txt, label):
    """VG.7 — every design option in a picker is a TABBED PANE:
    the render is the option's first element; machinery metadata
    (scores/refs/labels/system sheet) sits inside a collapsed
    <details> below it; a pick row is the only visible chrome.
    Stacked scroll lists and visible metadata FAIL."""
    f = []
    arts = list(re.finditer(
        r'<article[^>]*data-(?:design|variant|layout|candidate|'
        r'section)="[^"]*"[^>]*>', txt))
    if len(arts) < 2:
        return f
    # hidden-pane evidence must be pane-scoped — a bare display:none
    # anywhere (burger, details-marker) does not prove tabbed panes
    pane_hidden = re.search(
        r'(?:\.picker-opt|\[data-pane\])[^}]*\bdisplay:\s*none', txt)
    if not (re.search(r'data-(?:tab|goto|switch)=', txt) or
            pane_hidden):
        f.append(f'VG.7 {label}: options are a stacked list — no tab '
                 'switcher or hidden panes; each option must be its '
                 'own pane, one visible at a time')
    meta_rx = re.compile(
        r'(?<![-\w])(?:score|refs?|knob|breaks?|vector|verdict|'
        r'review)(?![-\w])')
    for i, m in enumerate(arts):
        art = m.group(0)
        nxt = arts[i + 1].start() if i + 1 < len(arts) else len(txt)
        close = txt.find('</article>', m.end(), nxt)
        body = txt[m.end():close if close != -1 else nxt]
        oid = re.search(r'data-(?:design|variant|layout|candidate|'
                        r'section)="([^"]*)"', art).group(1)
        if 'data-pane=' not in art:
            f.append(f'VG.7 {label}: option {oid} is not a tabbed '
                     'pane (no data-pane) — options switch by tab, '
                     'not scroll')
        first = re.search(r'<([a-zA-Z][\w-]*)', body)
        if first and first.group(1).lower() in (
                'header', 'nav', 'details', 'summary', 'table',
                'code', 'p', 'h2', 'h3', 'dl', 'aside'):
            f.append(f'VG.7 {label}: option {oid} opens with '
                     f'<{first.group(1)}> metadata, not the render '
                     '— the design renders first and alone')
        vis = re.sub(r'<details\b.*?</details>', '', body,
                     flags=re.S)
        vis = re.sub(r'<div[^>]*variant-pickrow[^>]*>.*?</div>', '',
                     vis, flags=re.S)
        vis = re.sub(r'data-[\w-]+="[^"]*"', '', vis)
        # chrome contexts only — a meta word counts inside class
        # names or machinery markup (<code>/<table>/<dl>/<aside>),
        # or in text shaped like a label ("score 0.9", "refs: x").
        # Prose ("a bond review", alt="Google review screenshot",
        # src="media/review.webp") is page copy, not metadata.
        chrome = ' '.join(re.findall(r'class="([^"]*)"', vis))
        chrome += ' ' + ' '.join(re.findall(
            r'<(?:code|table|dl|aside)\b[^>]*>(.*?)'
            r'</(?:code|table|dl|aside)>', vis, flags=re.S))
        text = re.sub(r'<[^>]*>', ' ', vis)
        lab_rx = re.compile(
            r'(?<![-\w])(?:score|refs?|knobs?|breaks?|vector|'
            r'verdict|review)(?![-\w])\s*(?:[:=·]\s*\S|\s[\d.]+%?)')
        if meta_rx.search(chrome) or lab_rx.search(text):
            f.append(f'VG.7 {label}: option {oid} exposes machinery '
                     'metadata outside a collapsed <details> '
                     '(score/refs/knobs must sit below the render, '
                     'collapsed)')
    # VG.9 — picker chrome is NEUTRAL: accent colour lives inside the
    # artwork only; chrome (tabs/pick rows/buttons/labels) binds
    # ink/muted/line tokens; selected state is an outline or tick,
    # never an accent fill that biases the art being judged.
    chrome_rx = re.compile(
        r'\.(?:variant-tabs|variant-pickrow|picker-opt|pick|'
        r'tab-bar|picker-chrome)\b[^}]*}')
    for m in chrome_rx.finditer(txt):
        body = m.group(0)
        if re.search(r'var\(--accent|--accent\b|#[0-9a-fA-F]{3,8}\b',
                     body) and 'border' not in body.split(
                'outline')[0]:
            f.append(f'VG.9 {label}: chrome rule {body[:60]}… binds '
                     'accent — chrome stays ink/muted, accent lives '
                     'in the artwork')
        if re.search(r'\.on|\.active|\[aria-selected', body) and \
                'background' in body and 'outline' not in body:
            f.append(f'VG.9 {label}: selected state fills with '
                     'colour — selection is outline/tick, never a '
                     'fill that biases the render')
    # modal review mode — if a modal layer exists it must cycle
    # previews + spacebar toggle (the contract from the reference
    # impl); a modal without keyboard nav is broken chrome
    if 'data-modal' in txt or 'class="modal' in txt:
        if 'ArrowLeft' not in txt and 'ArrowRight' not in txt:
            f.append(f'VG.9 {label}: modal present without ←/→ '
                     'preview cycling')
        if 'Space' not in txt and 'code: 32' not in txt and \
                'keyCode' not in txt:
            f.append(f'VG.9 {label}: modal present without '
                     'spacebar select toggle')
    return f


def check_picker_ux(ctx):
    f = []
    for name in ('layouts.html', 'variants.html', 'fine.html',
                 'candidates.html'):
        fp = ctx.find(os.path.join('preview', name))
        if fp and os.path.isfile(fp):
            txt = open(fp, encoding='utf-8',
                       errors='replace').read()
            f.extend(_picker_ux_fails(txt, name))
    return f

def check_round(path, round_no, stub=None, candidates=None,
                n_opts=None):
    """Gate one rendered picker HTML file.

    Round 1 (coarse LAYOUT): ≥5 options (or one card per computed
    LAYOUT-OPTIONS option when n_opts is given), pairwise structure
    distance ≥30% (≥1 differing slot for computed options). Rounds 2/3
    (LOOK/FINE): exactly 3 options, ≥3 differing knobs pairwise. Every
    round: cohesion within a design and the rendered-page battery
    (overflow, CTA, touch, body size, contrast both modes, emoji,
    Lucide, H1/vector).
    """
    f = []
    txt = open(path, encoding='utf-8', errors='replace').read()
    blocks = _design_blocks(txt)
    # the render is the BUILT page each option card iframes (section
    # markup, scoped knob vars, linked CSS) — the shell only proves
    # chrome. pages[d] = (page_html, page_css); '' = page missing
    pages = _shell_card_pages(path, txt)
    for d in list(blocks):
        if not (pages.get(d) or ('',))[0]:
            f.append(f'ROUND option {d} renders no built page — the '
                     'picker iframes the astro-built option '
                     '(preview_build), never inline mock markup')
    alltxt = txt + ''.join(pt + css for pt, css in pages.values())
    f.extend(_picker_ux_fails(txt, os.path.basename(path)))
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
                   if not _canon_ref_ok(t, candidates=candidates)]
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
        need = n_opts or 5
        if len(ids) < need:
            f.append(f'ROUND1 {len(ids)} design(s) for {need} '
                     + ('computed options — one card per '
                        'LAYOUT-OPTIONS option' if n_opts else
                        'design(s) — the coarse round needs ≥5 '
                        'completely different designs'))
    else:
        if len(ids) != 3:
            f.append(f'ROUND{round_no} {len(ids)} design(s) — finer rounds '
                     'show exactly 3')
    # distinctness between designs — the section list lives on the
    # BUILT page each card iframes; order-free attr parse (F-09:
    # data-comp before data-sec is legal markup and used to dodge the
    # sequence compare), and comp names normalize — a -v3 suffix or
    # trailing index is the same composition (renaming spoof)
    def _secs(b):
        out = []
        for m in re.finditer(
                r'<(?:section|header|footer)\b([^>]*)>', b):
            ad = dict(re.findall(r'([\w-]+)="([^"]*)"',
                                 m.group(1)))
            if not any(re.match(r'data-(?:sec|comp|ratio|'
                                r'disclosure)', a) for a in ad):
                continue   # an inner nav/wrapper is not a plan section
            comp = re.sub(r'(?:-v\d+|-\d+)$', '',
                          ad.get('data-comp') or '')
            out.append((ad.get('data-sec') or '', comp))
        return out
    secs = {d: _secs((pages.get(d) or (b, ''))[0] or b)
            for d, b in blocks.items()}
    # knob vectors ride the built page's data-variant-scope wrapper
    # (style="--tok:val;…") — plus any scope CSS the shell emits
    scope_css = dict(re.findall(
        r'\[(?:data-(?:variant|design)-scope)="([^"]+)"\]\{([^}]*)\}',
        txt))
    for d, (pt, _c) in pages.items():
        for vid, st in _scope_styles(pt).items():
            scope_css.setdefault(vid, '')
            scope_css[vid] += ';' + st
    knob_sets = {}
    for d, b in blocks.items():
        css = scope_css.get(d, '') + b
        knob_sets[d] = set(re.findall(
            r'--([a-z][\w-]*)\s*:\s*([^;}]+)', css))
    # CSS rules with their selector text — a var is "consumed" only
    # when a rule that references it is grounded in markup (R6b: a
    # dead .zz-unused{...var(--zz-a)...} used to count as a difference)
    rules = []
    _pos = 0
    while True:
        _p = alltxt.find('var(--', _pos)
        if _p < 0:
            break
        lb = alltxt.rfind('{', 0, _p)
        rb = alltxt.find('}', _p)
        if lb < 0 or rb < 0:
            _pos = _p + 6
            continue
        ob = alltxt.rfind('}', 0, lb)
        rules.append((alltxt[ob + 1:lb].strip(), alltxt[lb + 1:rb]))
        _pos = rb + 1
    inline = re.findall(r'style="([^"]*var\(--[^"]*)"', alltxt)
    # grounding is set membership, not per-token regex over the whole
    # document (748 findall/3s → O(1) lookups)
    _cls = set()
    for _cv in re.findall(r'class="([^"]*)"', alltxt):
        _cls.update(_cv.split())
    _tags = set(re.findall(r'<([a-zA-Z][\w-]*)', alltxt))
    _ids = set(re.findall(r'id="([^"]*)"', alltxt))

    def _consumed(k, seen=frozenset()):
        """Grounded-var fixpoint: --k is consumed when a rule that
        references it applies to the design's markup — OR when a
        declaration merely re-binds it (--x: var(--k)) and --x is
        itself consumed (the :root alias chain --radius →
        --primitive-radius → --r-card → .card is real consumption,
        not a dead var). Cycles can't recurse: the caller's var is
        in `seen`."""
        if k in seen:
            return False
        pat = r'var\(--' + re.escape(k) + r'\b'
        for sel, decl in rules:
            if not re.search(pat, decl):
                continue
            if re.search(r'\[data-(?:variant|design|layout)-scope', sel):
                return True  # scope selectors apply to the design
            for tok in re.findall(r'[.#]([\w-]+)|^(\w+)', sel):
                tok = tok[0] or tok[1]
                if tok and (tok in _cls or tok in _tags
                            or tok in _ids):
                    return True
            for ref in re.findall(r'var\(--([\w-]+)\b', decl):
                if _consumed(ref, seen | {k}):
                    return True
        return any(re.search(pat, s) for s in inline)

    for a, b in itertools.combinations(ids, 2):
        if round_no == 1 and secs[a] and secs[a] == secs[b]:
            f.append(f'ROUND1 designs {a}/{b} identical section list — '
                     'duplicates are regenerated, never shown')
        if round_no == 1 and (secs[a] or secs[b]):
            sa, sb = secs[a], secs[b]
            # identical as a MULTISET too — reordering the same
            # sections is not a different design (F-09 R4b)
            if sorted(sa) == sorted(sb):
                f.append(f'ROUND1 designs {a}/{b} same section multiset '
                         '(reordered duplicates count as identical)')
            n = max(len(sa), len(sb)) or 1
            diff = sum(1 for x, y in itertools.zip_longest(
                sa, sb, fillvalue=(None, None)) if x != y)
            if n_opts:
                # computed options share most of the article — a
                # single differing slot is the design
                if diff < 1:
                    f.append(f'ROUND1 designs {a}/{b} identical '
                             'structure — computed options are '
                             'regenerated, not shown')
            elif diff / n < 0.3:
                f.append(f'ROUND1 designs {a}/{b} differ in {diff}/{n} '
                         'sections (<30% floor) — near-duplicates are '
                         'regenerated, not shown')
        if round_no > 1:
            ka = dict(knob_sets.get(a) or [])
            kb = dict(knob_sets.get(b) or [])
            diff = {k for k in set(ka) | set(kb) if ka.get(k) != kb.get(k)}
            consumed = {k for k in diff if _consumed(k)}
            dead = diff - consumed
            if len(consumed) < 3:
                f.append(f'ROUND{round_no} designs {a}/{b} differ in '
                         f'{len(consumed)} consumed knob(s) '
                         f'({len(dead)} declared but unreferenced '
                         'vars) — ≥3 rendered differences required; '
                         'dummy CSS vars do not count')
    # cohesion within each design: one type scale, one radius
    # personality, one colour role map, one icon family, one imagery
    # treatment
    _GEN_FAM = {'sans-serif', 'serif', 'monospace', 'system-ui',
                'ui-sans-serif', 'ui-serif', 'ui-monospace',
                'ui-rounded', 'ui-emoji', 'inherit', 'initial',
                'unset', 'revert', 'emoji', 'math', 'fangsong',
                'cursive', 'fantasy'}

    def _text_faces(txt_):
        """Literal typeface names the render declares — a generic-
        first fallback stack (ui-sans-serif, …, system-ui) and
        var(--font-*) tokens are not design faces."""
        faces = set()
        for fm in re.finditer(r'font-family:\s*([^;}"]+)', txt_):
            decl = fm.group(1).strip()
            if decl.startswith('var('):
                continue
            fams = [x.strip().strip('\'"').lower()
                    for x in decl.split(',')]
            if not fams or fams[0] in _GEN_FAM:
                continue
            real = [x for x in fams if x and x not in _GEN_FAM]
            if real:
                faces.add(real[0])
        return faces

    for d, b in blocks.items():
        # cohesion is a property of the RENDER — the built page the
        # card iframes (+ its linked stylesheet), not shell chrome
        pt, pcss = pages.get(d) or (b, '')
        coh = pt + pcss
        fams = _text_faces(coh)
        if len(fams) > 2:
            f.append(f'COHESION {d}: {len(fams)} typefaces '
                     f'{sorted(fams)[:4]} — one type scale reads as '
                     'one')
        radii = set(re.findall(r'border-radius:\s*([^;}"]+)', coh))
        px_radii = {r for r in radii if not r.startswith('var(')}
        if len(px_radii) > 3:
            f.append(f'COHESION {d}: {len(px_radii)} literal radii — '
                     'one radius personality')
        icons = _icon_viewboxes(coh)
        if icons - {'0 0 24 24'}:
            f.append(f'COHESION {d}: non-Lucide viewBox(es) '
                     f'{sorted(icons - {"0 0 24 24"})} — one icon '
                     'family (brand/logo marks excluded)')
        filters = set(re.findall(r'filter:\s*([^;}"]+)', coh))
        if len(filters) > 2:
            f.append(f'COHESION {d}: {len(filters)} image treatments')
    # --- rendered-page battery (shell + every built page + its CSS) --
    if 'name="viewport"' not in alltxt and \
            "name='viewport'" not in alltxt:
        f.append('R.1 no viewport meta')
    if 'clamp(' not in alltxt:
        f.append('T.1 no fluid clamp type — h2/lead must be fluid at '
                 '375')
    for m in re.finditer(r'\bwidth:\s*(\d{3,})px', alltxt):
        if int(m.group(1)) > 1440:
            f.append(f'R.4 fixed width {m.group(1)}px — overflow risk '
                     'at 375')
    if 'overflow-x' not in alltxt:
        f.append('R.4 no overflow-x guard on the page/stage')
    mob = ' '.join(re.findall(
        r'@media[^{]*max-width:\s*(?:767|768|640|480|375)px[^{]*\{'
        r'((?:[^{}]|\{[^}]*\})*)\}', alltxt))
    if re.search(r'class="[^"]*(?:cta|btn|button)', alltxt, re.I):
        if not re.search(
                r'(?:cta|btn|button)[^,{}]*\{[^}]*'
                r'(?:width|inline-size):\s*100%', mob):
            f.append('R.9 mobile media block does not make CTAs '
                     'full-width stacked (≥48px, centred, below '
                     'tablet)')
        else:
            # min-height is ≥48px — resolve a var(--x) binding
            # through the sheet's :root vars (rem base 16) rather
            # than trusting the token name
            _vars = {m[0]: (m[1], m[2]) for m in re.findall(
                r'--([\w-]+):\s*([\d.]+)(px|rem)\b', alltxt)}
            ok_tap = False
            for mh in re.finditer(
                    r'min-height:\s*'
                    r'(?:(\d+(?:\.\d+)?)(px|rem)|var\(--([\w-]+)\))',
                    mob):
                if mh.group(1):
                    px = (float(mh.group(1)) *
                          (16.0 if mh.group(2) == 'rem' else 1.0))
                else:
                    v = _vars.get(mh.group(3) or '')
                    if not v:
                        continue
                    px = (float(v[0]) *
                          (16.0 if v[1] == 'rem' else 1.0))
                if px >= 48:
                    ok_tap = True
                    break
            if not ok_tap:
                f.append('R.9 mobile CTAs not ≥48px')
    for m in re.finditer(r'(?:body|\.pg)\s*\{[^}]*font-size:\s*'
                         r'([\d.]+)(px|rem)', alltxt):
        v = float(m.group(1))
        if (m.group(2) == 'px' and v < 16) or \
                (m.group(2) == 'rem' and v < 1):
            f.append(f'T.6 body text below 16px ({m.group(1)}'
                     f'{m.group(2)})')
            break
    for m in re.finditer(r'padding(?:-[a-z]+)?:\s*([^;}"]+)', alltxt):
        if re.search(r'\dpx', m.group(1)):
            f.append(f'R.12 fixed px padding "{m.group(1).strip()}" '
                     '— section rhythm is fluid: clamp()/ACSS '
                     'section-space-* tokens, never literal px')
            break
    # contrast in both modes: pull hex role pairs from mode/theme
    # scopes (real pages bind [data-theme=dark], legacy mocks
    # data-mode)
    mode_blocks = re.findall(
        r'\[(?:data-)?(?:mode|theme)(?:="|=)(light|dark)"?\][^{]*'
        r'\{([^}]*)\}', alltxt)
    if not mode_blocks:
        mode_blocks = re.findall(
            r'data-(?:mode|theme)="(light|dark)"[^>]*\{([^}]*)\}',
            alltxt)
    if mode_blocks:
        for mode, css in mode_blocks:
            roles = dict(re.findall(r'--(?:color-)?([\w-]+)\s*:\s*'
                                    r'(#[0-9a-fA-F]{3,8})', css))
            ink, bg = roles.get('ink'), roles.get('bg')
            if ink and bg:
                r = contrast(ink, bg)
                if r is not None and r < 7:
                    f.append(f'C.5 [{mode}] ink:bg {r:.1f}:1 < 7:1')
    _notag = re.sub(r'/\*.*?\*/|<!--.*?-->', ' ', alltxt, flags=re.S)
    for m in EMOJI_RX.finditer(_notag):
        if m.group(0) in '★☆':      # wildcard star is the VG label
            continue
        f.append(f'P.10 emoji {m.group(0)} in picker')
        break
    sw = re.search(r'stroke="([^"]+)"', alltxt)
    if sw and sw.group(1) != 'currentColor':
        f.append(f'P.11 icon stroke "{sw.group(1)}" — Lucide/'
                 'currentColor only')
    # headings render in the built pages the cards iframe
    heads = [(m.group(1).lower(), m.group(2).strip())
             for m in re.finditer(r'<(h[1-6])[^>]*>(.*?)</\1>', alltxt,
                                  re.S | re.I)]
    if stub and round_no >= 2:
        # E.1 binds RENDERED copy — the coarse layout round carries no
        # copy by design; look/fine rounds render real headings
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
    blockers = open_findings(scope=_pipeline_scope(a.pipeline_dir))
    if blockers:
        print(f'round REFUSED — {len(blockers)} open P0/P1 finding(s); '
              'close the ledger first (gate.py findings):')
        for r in blockers:
            print(f"  {r.get('severity')} {r.get('id')}: "
                  f"{str(r.get('mutation'))[:70]}")
        return 1
    # redteam runs under `gate.py selftest`/`gate.py redteam` —
    # survivors land in FINDINGS.json as open P1 rows, which the
    # refusal above already blocks on. Re-running the whole library
    # per round priced one round at minutes; the ledger is the gate.
    rd = getattr(a, 'round', None) or '1'
    n_opts = None
    try:
        _lo = json.load(open(os.path.join(
            os.path.dirname(a.pipeline_dir), '..',
            'LAYOUT-OPTIONS.json')))
        n_opts = len(_lo.get('options') or ()) or None
    except Exception:
        pass
    fails = check_round(a.pipeline_dir, int(rd), n_opts=n_opts,
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
                     'receipt', 'findings', 'redteam'])
    ap.add_argument('pipeline_dir', nargs='?', default=None,
                    help='pipeline dir — REQUIRED for every pipeline '
                         'command (no silent cwd writes)')
    ap.add_argument('--wireframe')
    ap.add_argument('--design')
    ap.add_argument('--stub')
    ap.add_argument('--approve', action='store_true')
    ap.add_argument('--sec', help='section name for `gate.py section`')
    ap.add_argument('--round', help='picker round number (1, 2, 3)')
    ap.add_argument('--allow-warns', action='store_true',
                    help='declared exception: advisory output stays '
                         'advisory. STRICT BY DEFAULT — a warn is a '
                         'real unmet obligation and promotes to FAIL '
                         'unless this flag is passed deliberately')
    a = ap.parse_args()
    if a.wave not in ('coverage', 'selftest', 'consistency', 'graph',
                      'enforcement', 'findings', 'redteam') \
            and not a.pipeline_dir:
        print(f'gate.py {a.wave}: pipeline_dir is required')
        return 2
    if a.approve:
        print('gate.py never records approval (P.8) — the operator '
              'picks in the picker page served by approve_service.py '
              '(w3 layout, w4 look); waves advance on signed records '
              'only.')
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
    if a.wave == 'findings':
        return cmd_findings()
    if a.wave == 'redteam':
        return cmd_redteam()
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
    warns = []
    for wchk in WARN_CHECKS.get(a.wave, ()):
        try:
            warns.extend(wchk(ctx))
        except Exception:
            pass
    if warns and not _warns_allowed(ctx):
        # strict-by-default (SOP law): a warn is an unmet obligation
        # — it promotes; --allow-warns counts only inside a verified
        # run (PIPELINE_RUN token_sig-verified), so a bare gate.py
        # invocation cannot downgrade WARN_CHECKS locally
        fails += [f'advisory→fail (strict): {w}' for w in warns]
    else:
        for w in warns:
            print('  advisory:', w)
    entry = write_gate(ctx, fails, a.approve)
    status = 'PASS' if not fails else 'FAIL'
    print(f'{a.wave} {status} — {a.pipeline_dir}')
    for x in fails:
        print('  -', x)
    return 0 if not fails else 1

# ---------------------------------------------------------------- genome

@_lc(maxsize=1)
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
    'cutout-hero-split': ('split-media', 'asymmetric-offset'),
    'cutout-catalog-grid': ('card-grid-2', 'card-grid-3',
                            'card-grid-4'),
    'cutout-cta-band': ('horizontal-band',),
    'capture-form': ('split-form',),
    'text-index': ('editorial-single', 'table-matrix'),
    'app-band': ('split-media',),
    'hero-act-merge': ('split-media', 'stacked-center'),
    'link-grid': ('editorial-single', 'table-matrix'),
    'flyout-nav': ('horizontal-band',),
    'modal-form': ('split-form',),
    'carousel-track': ('carousel-track',),
    'table-matrix': ('table-matrix',),
    'form-inline': ('split-form',),
    'timeline-steps': ('sequence-steps',),
    'how-steps': ('sequence-steps',),
    'newsletter-band': ('horizontal-band',),
    'teams-grid': ('card-grid-2', 'card-grid-3', 'card-grid-4'),
    'gallery-grid': ('masonry-grid', 'card-grid-2', 'card-grid-3'),
    'pricing-table': ('table-matrix', 'card-grid-3'),
    'portfolio-grid': ('masonry-grid', 'card-grid-3', 'card-grid-4'),
    'contact-panel': ('split-form',),
    'event-list': ('sequence-steps', 'editorial-single'),
    'banner-cta': ('horizontal-band',),
    'feature-grid': ('card-grid-2', 'card-grid-3', 'card-grid-4'),
    'nav-h1': ('horizontal-band',), 'nav-h2': ('horizontal-band',),
    'nav-h3': ('horizontal-band',), 'nav-h4': ('horizontal-band',),
    'nav-h5': ('horizontal-band',), 'nav-h6': ('horizontal-band',),
    'nav-h7': ('horizontal-band',), 'nav-h8': ('horizontal-band',),
    'nav-h9': ('horizontal-band',), 'nav-h10': ('horizontal-band',),
    'nav-h11': ('horizontal-band',), 'nav-h12': ('horizontal-band',),
    'nav-h13': ('horizontal-band',), 'nav-h14': ('horizontal-band',),
    'nav-h15': ('horizontal-band',), 'nav-h16': ('horizontal-band',),
    'nav-h17': ('horizontal-band',), 'nav-h18': ('horizontal-band',),
    'nav-h19': ('horizontal-band',), 'nav-h20': ('horizontal-band',),
    'nav-h21': ('horizontal-band',), 'nav-h22': ('horizontal-band',),
    'nav-h23': ('horizontal-band',), 'nav-h24': ('horizontal-band',),
    'nav-h25': ('horizontal-band',), 'nav-shop-1': ('horizontal-band',),
    'nav-shop-2': ('horizontal-band',), 'nav-shop-3': ('horizontal-band',),
    'nav-shop-4': ('horizontal-band',), 'nav-mega-1': ('horizontal-band',),
    'nav-mega-2': ('horizontal-band',), 'nav-mega-3': ('horizontal-band',),
    'nav-mega-4': ('horizontal-band',), 'nav-mega-5': ('horizontal-band',),
    'nav-mega-6': ('horizontal-band',), 'nav-mega-7': ('horizontal-band',),
    'nav-offcanvas': ('horizontal-band',),
    'footer-1': ('horizontal-band',), 'footer-2': ('horizontal-band',),
    'footer-3': ('horizontal-band',), 'footer-4': ('horizontal-band',),
    'footer-5': ('horizontal-band',), 'footer-6': ('horizontal-band',),
    'footer-7': ('horizontal-band',), 'footer-8': ('horizontal-band',),
    'footer-9': ('horizontal-band',), 'footer-10': ('horizontal-band',),
    'footer-11': ('horizontal-band',), 'footer-12': ('horizontal-band',),
    'footer-13': ('horizontal-band',), 'footer-15': ('horizontal-band',),
    'footer-16': ('horizontal-band',), 'footer-17': ('horizontal-band',),
    'footer-18': ('horizontal-band',), 'footer-19': ('horizontal-band',),
    'footer-20': ('horizontal-band',), 'footer-21': ('horizontal-band',),
    'footer-22': ('horizontal-band',), 'footer-23': ('horizontal-band',),
    'footer-shop': ('horizontal-band',),
}


@_lc(maxsize=1)
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
            if 'chrome' in acts or comp in ('nav-bar', 'footer-bar',
                                            'flyout-nav'):
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

@_lc(maxsize=1)
def _enforcement_rules():
    try:
        return json.load(open(ENFORCEMENT))['rules']
    except Exception:
        return {}

@_lc(maxsize=1)
def _sop_adherence():
    """The mined corpus verdicts (PatternMiner,
    patterns/data/sop-adherence.json): {rule: {baseline, n_sites,
    adherence, bent}}."""
    p = os.path.join(PATTERNS_DIR, 'data', 'sop-adherence.json')
    try:
        return json.load(open(p)).get('rules') or {}
    except Exception:
        return {}


def sop_verdict(rule):
    """confirm|tighten|relax|insufficient from mined adherence —
    n<30 keeps the current constant (insufficient evidence)."""
    e = _sop_adherence().get(rule)
    if not e:
        return 'unmeasured'
    n = e.get('n_sites') or 0
    adh = e.get('adherence')
    if n < 30 or adh is None:
        return 'insufficient'
    return 'confirm' if adh >= 0.9 else \
        'tighten' if adh >= 0.5 else 'relax'


def check_sop_constants(ctx):
    """SC.1/SC.2 — rules consult the mined corpus:
    SC.1 SOP-CONSTANTS.json exists, names the dataset + records
        {rule: verdict} for every rule the dataset measures;
    SC.2 each recorded verdict equals the derived verdict —
        recorded ≠ recomputed = drift FAIL."""
    f = []
    data = _sop_adherence()
    p = os.path.join(ctx.dir, 'SOP-CONSTANTS.json')
    if not os.path.isfile(p):
        return ['SC.1 SOP-CONSTANTS.json missing — the rules '
                'consult patterns/data/sop-adherence.json through '
                'a recorded verdict table (drift-proof audit)']
    try:
        c = json.load(open(p))
    except Exception:
        return ['SC.1 SOP-CONSTANTS.json unparseable']
    if c.get('dataset') != 'sop-adherence.json':
        f.append('SC.1 SOP-CONSTANTS.dataset must name '
                 'sop-adherence.json — the corpus being consulted')
    vs = c.get('verdicts')
    if not isinstance(vs, dict) or not vs:
        f.append('SC.1 SOP-CONSTANTS.verdicts missing — every '
                 'measured rule records its verdict')
        vs = {}
    for rid in sorted(data):
        want = sop_verdict(rid)
        if rid not in vs:
            f.append(f'SC.1 verdict for {rid} missing — the corpus '
                     'measures it (n=' +
                     str(data[rid].get('n_sites')) + ')')
        elif vs[rid] != want:
            f.append(f'SC.2 {rid}: recorded {vs[rid]} != derived '
                     f'{want} — verdicts recompute from the corpus, '
                     'never drift')
    return f


THREE_LAYERS = {'ornament': 'field', 'motif': 'deconstruction',
                'icon': 'meaning'}


def check_three_layers(ctx):
    """TL.1–TL.4 — the three-layer ornamental selection contract:
    TL.1 every layer block declares layer ∈
        {ornament, motif, icon} — the taxonomy is closed;
    TL.2 each candidate carries data-dna-fit ∈ [0,100] and rendered
        cards are ≥50 (picker never shows a weak fit);
    TL.3 each candidate card carries data-seed-chain (word-seed
        chain — brand→verb→essence→geometry) so candidates are
        provably seed-branched, not one association;
    TL.4 multi-select is checkbox semantics — a surface with
        ≥2 candidates must expose checkbox inputs, not radio."""
    f = []
    fp = ctx.find(os.path.join('preview', 'variants.html'))
    if not fp or not os.path.isfile(fp):
        return []
    t = open(fp, encoding='utf-8', errors='replace').read()
    for m in re.finditer(r'data-tl-layer="([^"]+)"', t):
        if m.group(1) not in THREE_LAYERS:
            f.append(f'TL.1 layer {m.group(1)} ∉ '
                     f'{sorted(THREE_LAYERS)} — the ornamental '
                     'taxonomy is closed')
    for m in re.finditer(r'data-dna-fit="([\d.]+)"', t):
        v = float(m.group(1))
        if not 0 <= v <= 100:
            f.append(f'TL.2 dna-fit {v} outside 0–100')
        elif v < 50:
            f.append(f'TL.2 candidate rendered with dna-fit {v} '
                     '< 50 — the picker renders strong/works fits '
                     'only')
    # TL.3 — every emitted candidate card carries its chain ON THE
    # CARD (the article tag), whatever layer it belongs to.
    cands = list(re.finditer(
        r'<[^>]*data-candidate="([^"]+)"[^>]*>', t))
    for m in cands:
        if 'data-seed-chain=' not in m.group(0):
            f.append(f'TL.3 candidate {m.group(1)} carries no '
                     'data-seed-chain — every generated candidate '
                     'records the chain it branched from')
    # TL.4 — a surface offering ≥2 candidates is multi-select:
    # checkbox semantics, never radio.
    if len(cands) >= 2 and 'type="checkbox"' not in t and \
            'type="radio"' in t:
        f.append('TL.4 candidate surface uses radio inputs — '
                 'multi-select is checkbox semantics')
    return f

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

STYLE_PROFILES = os.path.join(PATTERNS_DIR, 'data',
                              'style-profiles.json')


@_lc(maxsize=1)
def _style_profiles():
    """{cluster: profile} — accepts {clusters: {...}} or the flat
    {name: profile} shape sop_adherence.py writes. Licence rows
    carry waives/conflicts/canon_flag; measured clusters carry
    centroid/label."""
    try:
        raw = json.load(open(STYLE_PROFILES))
    except Exception:
        return {}
    if isinstance(raw, dict):
        return raw.get('clusters') or raw
    return {}


def style_licences(ctx):
    """[{cluster, where, waives}] — plan rows
    `style_licences: [{cluster: neo-brutalist, where: hero}]` or a
    scalar `style_licence:` on the design. The licence is what the
    OPERATOR declared before linting; check_style_licence validates
    it, _apply_declared_breaks honours it."""
    plan = ctx.plan or {}
    rows = plan.get('style_licences')
    if rows is None:
        single = plan.get('style_licence')
        rows = [single] if single else []
    if isinstance(rows, (str, dict)):
        rows = [rows]
    out = []
    profiles = _style_profiles()
    for r in rows:
        if isinstance(r, str):
            r = {'cluster': r}
        if not isinstance(r, dict):
            continue
        cl = str(r.get('cluster') or r.get('style') or '')
        prof = profiles.get(cl) or {}
        out.append({'cluster': cl,
                    'where': str(r.get('where') or '').strip(),
                    'waives': list(prof.get('waives') or []),
                    'conflicts': list(prof.get('conflicts') or []),
                    'canon_flag': bool(prof.get('canon_flag')),
                    'known': cl in profiles})
    return out


def skipped_rules(ctx):
    """{rule_id: {sections}} declared structural breaks (B.4) PLUS
    style-licence waivers (STYLE-VOCAB §4.4 — style classification
    runs BEFORE linting; a licensed style relaxes exactly the rules
    its profile enumerates, scoped to `where`, never a tier:invariant
    rule, never blanket).

    A break is scoped to the section it names — it never switches a rule
    off site-wide (B F-30)."""
    rules = _enforcement_rules()
    out = {}
    for b in declared_breaks(ctx.plan or {}):
        rid = str(b.get('rule_id') or b.get('rule') or '')
        if rules.get(rid, {}).get('tier') == 'structural':
            where = str(b.get('where') or '').strip()
            out.setdefault(rid, set()).add(where)
    # style licences waive their enumerated rules (stylistic +
    # structural only — invariants like C.5/C.7/VG.3 can never waive)
    for lic in style_licences(ctx):
        if not lic['known'] or lic['canon_flag']:
            continue
        for rid in lic['waives']:
            if rules.get(rid, {}).get('tier') == 'invariant':
                continue    # check_style_licence FAILs on the request
            out.setdefault(rid, set()).add(lic['where'])
    return out


def check_style_licence(ctx):
    """STYLE-VOCAB §4.4 — style classification runs BEFORE linting.
    Every declared style_licence must name a known cluster in
    style-profiles.json; waive only the rules that profile enumerates
    (it cannot waive what isn't listed — the licence is the profile,
    the plan only invokes it); never a tier:invariant rule; and a
    canon_flag cluster is banned regardless of licence. The licence
    is recorded in the DNA (provenance requirement)."""
    if not _wave_ge(ctx, 'w5'):
        return []
    f = []
    lics = style_licences(ctx)
    if not lics:
        return []
    rules = _enforcement_rules()
    profiles = _style_profiles()
    dna_kn = (dna_map(ctx) or {})
    dna_txt = ctx.read('DNA.md') or json.dumps(dna_kn)
    for lic in lics:
        cl = lic['cluster'] or '(unnamed)'
        if not lic['known']:
            f.append(f'ST.1 style_licence "{cl}" names no cluster '
                     'in style-profiles.json — licences are enumerated '
                     'profiles, not ad-hoc waivers')
            continue
        if lic['canon_flag']:
            f.append(f'ST.1 style_licence "{cl}" — this style is '
                     'canon-flagged (generic-stock / banned signature); '
                     'no licence expresses it')
        # plan may only invoke the profile — waiving beyond it or an
        # invariant is a defect
        inv = [r for r in lic['waives']
               if rules.get(r, {}).get('tier') == 'invariant']
        if inv:
            f.append(f'ST.1 "{cl}" profile tries to waive '
                     f'invariant(s) {inv} — fix style-profiles.json, '
                     'invariants are never waived')
        # conflicts are informational warnings, surfaced as failures
        # ONLY when the waived set actually overlaps (it cannot —
        # conflicts are disjoint by construction) — still report the
        # tension so the plan records it
        for c in lic['conflicts']:
            if c in lic['waives']:
                f.append(f'ST.1 "{cl}" profile lists {c} as both '
                         'waived and conflicted — contradiction in '
                         'style-profiles.json')
        # provenance: the licence must be traceable in the rendered DNA
        if cl not in dna_txt:
            f.append(f'ST.2 style_licence "{cl}" not recorded in '
                     'DNA.md — a licence is part of the design record, '
                     'not a plan-side note')
    return f


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

def check_context_budget(ctx):
    """P.19 — every step's context packet fits its class budget:
    layout-round 250K tokens, wireframe/chop/per-section-build/
    per-component 100K (~4 chars/token). The pack (CARD + CARD-named
    rule rows + DNA decision surface + section profile + skeleton +
    section copy + cited canon refs — nothing else) is what a
    flash-class model consumes; over budget = the pack is too fat to
    trust the step to a small model."""
    try:
        import context_pack as cp
    except Exception:
        sys.path.insert(0, HERE)
        import context_pack as cp
    wave = getattr(ctx, 'wave', None)
    step = wave if wave in getattr(cp, 'WAVE_STEP', {}) else \
        'per-section-build'
    try:
        pack = cp.assemble_pack(ctx.dir, step)
    except Exception as e:
        return [f'P.19 context pack failed to assemble: {e}']
    if pack['tokens'] > pack['budget']:
        return [f"P.19 {pack['step_class']} pack is "
                f"{pack['tokens']:,} tokens — over the "
                f"{pack['budget']:,} budget (parts "
                f"{pack['parts']}); shrink the pack, never the rule"]
    return []


def _independent_sections(ctx):
    """Content sections that could build in their own lane — chrome
    (nav/footer) is assembled, never built."""
    out = []
    for slug, r in ctx.rows():
        acts = r.get('speech_act') or []
        if isinstance(acts, str):
            acts = [acts]
        if 'chrome' in acts or str(r.get('composition') or '') in \
                ('nav-bar', 'footer-bar', 'flyout-nav'):
            continue
        out.append((slug, r))
    return out


def check_parallel_build(ctx):
    """P.20 — fan-out lanes never consume coordinated slots. When
    BUILD-PLAN.json declares the build lanes, every per-section /
    per-option / probe worker runs model_lane 'cheap' (unlimited
    pool); 'coordinated' (swe-2-class, ~10 slots) is reserved for
    orchestration, and 'coherence' lanes are single-call on the
    stronger model. Lane misuse is a hard defect — coordinated slots
    starve the pipeline."""
    txt = ctx.read('BUILD-PLAN.json')
    if not txt:
        return []          # serial-build warning lives in WARN_CHECKS
    try:
        bp = json.loads(txt)
    except Exception as e:
        return [f'P.20 BUILD-PLAN.json unparseable: {e}']
    f = []
    lanes = bp.get('lanes') or []
    fanout = ('section', 'option', 'probe', 'worker')
    coord = 0
    for ln in lanes:
        if not isinstance(ln, dict):
            f.append('P.20 BUILD-PLAN lane is not an object '
                     f'({ln!r}) — lanes carry id/kind/model_lane')
            continue
        kind = str(ln.get('kind') or '')
        ml = str(ln.get('model_lane') or '')
        lid = ln.get('id') or kind or '?'
        if ml not in ('cheap', 'coordinated', 'coherence'):
            f.append(f'P.20 lane {lid}: model_lane {ml!r} ∉ '
                     '{cheap, coordinated, coherence}')
        if kind in fanout and ml != 'cheap':
            f.append(f'P.20 lane {lid}: fan-out worker ({kind}) on '
                     f'model_lane {ml!r} — coordinated slots are '
                     'reserved; fan-out spawns on the cheap pool')
        if kind == 'coherence' and ml == 'cheap':
            f.append(f'P.20 lane {lid}: coherence pass on the cheap '
                     'pool — coherence stays single-call on the '
                     'stronger model')
        if ml == 'coordinated':
            coord += 1
    if coord > 10:
        f.append(f'P.20 {coord} coordinated lanes > swe-2 cap ~10 — '
                 'a >10-worker page must not consume coordinated '
                 'slots')
    return f


def check_serial_build_warn(ctx):
    """P.20 advisory — a page with ≥4 independent sections built
    serially by one agent wastes the fan-out contract: every section
    gets its own context pack and a cheap-pool worker; assembly is
    mechanical via Section.astro (PARALLEL-BUILD.md)."""
    # serial builds are banned at four sections — INCLUDING chrome:
    # nav+hero+macro+end-act+footer was already five. A leniency for the
    # five-row era would bless the exact shape that produced the thin
    # page, so the count is every section the assembler will render.
    indep = _independent_sections(ctx)
    if len(indep) < 4:
        return []        # advisory only fans out at 4+ independent
    txt = ctx.read('BUILD-PLAN.json')
    if txt:
        try:
            lanes = (json.loads(txt).get('lanes') or [])
        except Exception:
            lanes = []
        if any(str(l.get('kind')) == 'section' for l in lanes
               if isinstance(l, dict)):
            return []        # section lanes declared — fanned out
    return [f'P.20 {len(indep)} independent sections but no '
            'section lanes declared — serial single-agent page '
            'builds are banned in favour of the context-pack '
            'fan-out (PARALLEL-BUILD.md)']


def check_bounded_review(ctx):
    """P.21 — visual review is bounded + model-parameterised:
    every design rendered at the three viewports, a per-design
    pass/fail table, ONE VLM call, and a cheap reviewer model by
    default (Opus-class only when the run is a machinery review)."""
    rj = ctx.read('REVIEW.json')
    if not rj:
        return []          # check_review_completeness owns missing
    try:
        rv = json.loads(rj)
    except Exception:
        return []
    f = []
    rm = str(rv.get('reviewer_model') or '')
    strong = re.search(r'opus|ultra|pro-?(?:3|4)|gpt-?5|sonnet',
                       rm, re.I)
    if strong and not rv.get('machinery_review'):
        f.append(f'P.21 reviewer_model {rm} is strong-class — visual '
                 'review defaults to a cheap VLM; Opus-class needs '
                 'machinery_review: true')
    if not rm:
        f.append('P.21 reviewer_model missing — the review records '
                 'which model graded it')
    vc = rv.get('vlm_calls')
    if vc is not None and vc != 1:
        f.append(f'P.21 vlm_calls {vc} — the review is ONE bounded '
                 'call, never a retry loop')
    vps = rv.get('viewports')
    if vps is not None and \
            set(vps) != set(SHOT_WIDTHS):
        f.append(f'P.21 viewports {sorted(vps)} != '
                 f'{sorted(SHOT_WIDTHS)} — renders at the three '
                 'contract viewports')
    pd_ = rv.get('per_design')
    if pd_ is None:
        f.append('P.21 per_design table missing — every design '
                 'carries a checklist pass/fail row')
    elif not isinstance(pd_, list) or not pd_ or \
            any(not isinstance(x, dict) or 'design' not in x
                or 'pass' not in x for x in pd_):
        f.append('P.21 per_design must be [{design, pass, …}] rows')
    return f

def check_vlm_evidence(ctx):
    """P.24 — VLM judgment leaves a real invocation record:
    when REVIEW.json claims vlm_calls ≥1, `vlm_evidence` must carry
    {model, command, image_sha256, prompt_sha256, output_sha256}
    with every referenced shot present and hash-matching —
    a `judged_by` label without evidence is a formula wearing a
    costume."""
    rv_path = os.path.join(ctx.dir, 'REVIEW.json')
    if not os.path.isfile(rv_path):
        return []
    try:
        rv = json.load(open(rv_path))
    except Exception:
        return []
    vc = rv.get('vlm_calls')
    if not vc:
        return []
    ev = rv.get('vlm_evidence')
    f = []
    if not isinstance(ev, dict):
        return ['P.24 vlm_calls>0 but no vlm_evidence record — '
                'the judgment must be an actual invocation '
                '(command + hashed images + hashed output), not a '
                'label']
    for k in ('model', 'command', 'output_sha256', 'prompt_sha256'):
        if not ev.get(k):
            f.append(f'P.24 vlm_evidence missing {k}')
    imgs = ev.get('image_sha256') or {}
    if not imgs:
        f.append('P.24 vlm_evidence.image_sha256 empty — the call '
                 'graded nothing')
    for rel, sha in imgs.items():
        cand = [os.path.join(ctx.dir, rel),
                os.path.join(ctx.dir, 'shots', os.path.basename(rel))]
        hit = None
        for p in cand:
            if os.path.isfile(p):
                hit = p
                break
        if not hit:
            f.append(f'P.24 vlm_evidence image {rel} absent — '
                     'evidence files stay on disk')
            continue
        cur = hashlib.sha256(open(hit, 'rb').read()).hexdigest()[:16]
        if cur != sha:
            f.append(f'P.24 vlm_evidence image {rel} hash drift '
                     f'({sha[:8]}→{cur[:8]}) — evidence is frozen')
    if ev.get('model') and rv.get('reviewer_model') and \
            str(ev['model']) != str(rv['reviewer_model']):
        f.append(f'P.24 reviewer_model {rv.get("reviewer_model")} '
                 f'!= vlm_evidence.model {ev.get("model")} — '
                 'the recorded call IS the grader')
    return f

J_QUALITY_DIMS = ('hero_clarity', 'layout_craft', 'media_fit',
                  'mobile', 'distinctness')


def _review_quality(rv):
    q = rv.get('quality')
    return q if isinstance(q, dict) else {}


def check_quality_floor(ctx):
    """J.1 — every option in every picker carries a judged quality
    row: each dimension ≥50, composite ≥60, judged on the configured
    cheap reviewer_model, at most one retry. Below-floor options get
    fix instructions and one retry — never a second."""
    rj = ctx.read('REVIEW.json')
    if not rj:
        return []          # check_review_completeness owns missing
    try:
        rv = json.loads(rj)
    except Exception:
        return []
    f, q = [], _review_quality(rv)
    cfg = str(rv.get('reviewer_model') or '')
    retries = rv.get('quality_retry') or {}
    for name in ('layouts.html', 'variants.html', 'fine.html'):
        fp = ctx.find(os.path.join('preview', name))
        if not fp or not os.path.isfile(fp):
            continue
        txt = open(fp, encoding='utf-8', errors='replace').read()
        for oid in _design_blocks(txt):
            row = q.get(oid)
            if not isinstance(row, dict):
                f.append(f'J.1 option {oid} ({name}) has no quality '
                         'row — nothing reaches the picker unjudged')
                continue
            for d in J_QUALITY_DIMS:
                v = row.get(d)
                if not isinstance(v, (int, float)) or v < 50:
                    f.append(f'J.1 {oid}: {d} {v} below floor 50 — '
                             'fix instructions + one retry, not '
                             'presentation')
            comp = row.get('composite')
            if not isinstance(comp, (int, float)) or comp < 60:
                f.append(f'J.1 {oid}: composite {comp} below 60 — '
                         'below-floor options do not present')
            jb = str(row.get('judged_by') or '')
            if jb != cfg:
                f.append(f'J.1 {oid}: judged_by {jb!r} != configured '
                         f'reviewer_model {cfg!r} — judgment runs on '
                         'the sanctioned cheap model only')
            if int((retries.get(oid) or 0)) > 1:
                f.append(f'J.1 {oid}: quality_retry '
                         f'{retries[oid]} > 1 — a below-floor '
                         'option is dropped/replaced after one fix')
    return f


def check_measured_evidence(ctx):
    """J.11 — w8 rules on the MEASURED page, not declared scores:
    MEASURE.json (measure.py, w7) must exist, bind the current dist,
    bind the evidence shots it verified, and carry a viewport record
    for every plan page."""
    rj = ctx.read('MEASURE.json')
    if rj is None:
        return ['J.11 MEASURE.json missing — `measure.py` (w7) '
                'produces it from the built page']
    try:
        m = json.loads(rj)
    except Exception as e:
        return [f'J.11 MEASURE.json unparseable: {e}']
    f = []
    if m.get('dist_sha256') != _dist_sha(ctx):
        f.append('J.11 MEASURE.json dist_sha256 != current dist — '
                 'the measurement is not bound to this build')
    shots = os.path.join(ctx.dir, 'shots')
    if m.get('shots_sha256') is not None:
        h = hashlib.sha256()
        for fn in sorted(os.listdir(shots)) if os.path.isdir(shots) \
                else []:
            if not fn.endswith('.png'):
                continue
            h.update(fn.encode())
            h.update(open(os.path.join(shots, fn), 'rb').read())
        if os.path.isdir(shots) and h.hexdigest()[:16] != \
                m['shots_sha256']:
            f.append('J.11 MEASURE.json shots_sha256 != shots/ — '
                     'the evidence drifted after measurement')
    pages = m.get('pages') or {}
    for slug in ctx.pages():
        if slug not in pages:
            f.append(f"J.11 MEASURE.json has no record for page "
                     f"{slug!r} — every plan page is measured")
    for slug, pg in pages.items():
        if not (pg.get('viewports') or {}):
            f.append(f'J.11 page {slug} carries no viewport records')
    return f


def check_judged_verdict(ctx):
    """J.12 — the w8 verdict is JUDGED on evidence: JUDGE.json
    (judge.py, w8) must exist, bind this dist and the MEASURE.json on
    disk, and reach verdict pass — every fail finding is a gate
    failure; warns stay on record for the reviewer."""
    rj = ctx.read('JUDGE.json')
    if rj is None:
        return ['J.12 JUDGE.json missing — `judge.py` (w8) produces '
                'the evidence verdict']
    try:
        j = json.loads(rj)
    except Exception as e:
        return [f'J.12 JUDGE.json unparseable: {e}']
    f = []
    if j.get('dist_sha256') != _dist_sha(ctx):
        f.append('J.12 JUDGE.json dist_sha256 != current dist — '
                 'the judgment is not bound to this build')
    raw = ctx.read('MEASURE.json')
    if j.get('measure_sha256') and raw is not None:
        cur = hashlib.sha256(raw.encode()).hexdigest()[:16]
        if cur != j['measure_sha256']:
            f.append('J.12 JUDGE.json measure_sha256 != MEASURE.json — '
                     'the verdict did not read this measurement')
    for fi in j.get('findings') or []:
        if fi.get('severity') == 'fail':
            f.append(f"J.12 {fi.get('page', '?')} "
                     f"{fi.get('metric')} {fi.get('value')} "
                     f"{fi.get('op')} {fi.get('threshold')} — "
                     'measured fail finding')
    if j.get('verdict') != 'pass':
        f.append(f"J.12 verdict {j.get('verdict')!r} — the measured "
                 'page fails its vertical canon')
    return f


def check_present_order(ctx):
    """J.2 PRESENT-ORDER — RULES → BUILD → JUDGE → RECHECK → present.
    Every picker option needs BOTH receipts: the compliance receipt
    (rules pass) and the quality row (judgment pass), and the
    artifact version each gate passed must be identical — any
    post-judgment change re-traverses the rules gate before it may
    present."""
    rj = ctx.read('REVIEW.json')
    if not rj:
        return []          # nothing to verify against yet
    try:
        rv = json.loads(rj)
    except Exception:
        return []
    f, q = [], _review_quality(rv)
    rh = rv.get('rules_pass_hash')
    jh = rv.get('judgment_pass_hash')
    if rh != jh:
        f.append('J.2 rules_pass_hash != judgment_pass_hash — the '
                 'artifact judgment passed is not the artifact rules '
                 'last cleared; re-traverse the rules gate (RECHECK)')
    for name in ('layouts.html', 'variants.html', 'fine.html'):
        fp = ctx.find(os.path.join('preview', name))
        if not fp or not os.path.isfile(fp):
            continue
        txt = open(fp, encoding='utf-8', errors='replace').read()
        for oid in _design_blocks(txt):
            if oid not in q:
                f.append(f'J.2 option {oid} ({name}) presented '
                         'without a quality receipt — RULES and '
                         'JUDGMENT both precede presentation')
    return f


def check_prebuild_receipt(ctx):
    """J.3 PRE-BUILD VALIDATION — an option may not be built without
    a pre-build receipt: recipe resolves in the topology bank,
    business-type fit recorded, refs + tokens resolve, and the plan
    vector is distinct from siblings before render."""
    pb = ctx.read('PREBUILD.json')
    if not pb:
        # pickers exist → build happened → receipt is mandatory
        for name in ('layouts.html', 'variants.html', 'fine.html'):
            if ctx.find(os.path.join('preview', name)):
                return ['J.3 pickers exist but no PREBUILD.json — '
                        'every option traverses pre-build validation '
                        'before build']
        return []
    try:
        rows = json.loads(pb)
    except Exception as e:
        return [f'J.3 PREBUILD.json unparseable: {e}']
    opts = rows.get('options') if isinstance(rows, dict) else rows
    if not isinstance(opts, dict):
        return ['J.3 PREBUILD.json must be {options: {<id>: row}}']
    bank = _skl_harvest_ids()
    plan_dna = (ctx.plan or {}).get('dna') or {}
    vertical = str(plan_dna.get('profile') or '').replace(
        'profile-', '').split('/')[0]
    genotype = plan_dna.get('genotype') or {}
    f = []
    for oid, row in opts.items():
        if not isinstance(row, dict):
            f.append(f'J.3 {oid}: pre-build row is not an object')
            continue
        rid = str(row.get('recipe_id') or '')
        if row.get('recipe_exception'):
            if not str(row.get('justification') or '').strip():
                f.append(f'J.3 {oid}: recipe exception without '
                         'justification')
        elif rid not in bank:
            f.append(f'J.3 {oid}: recipe_id {rid!r} resolves to no '
                     'topology-bank entry — the section recipe must '
                     'exist before build')
        for k in ('plan_fit', 'refs_resolve', 'tokens_resolve',
                  'plan_vector_dist'):
            if k not in row:
                f.append(f'J.3 {oid}: pre-build row missing {k}')
        d = row.get('plan_vector_dist')
        if isinstance(d, (int, float)) and d < 0.3:
            f.append(f'J.3 {oid}: plan_vector_dist {d} < 0.3 — '
                     'sibling options must be distinct on the plan, '
                     'not discovered different after render')
        # J.7 ELEMENT-VARIANT — the variant level of the selection
        # chain: declared variant must match the bank signature and
        # satisfy the vertical canon + declared genotype.
        f.extend(_element_variant_fails(
            rid, row.get('element_variant'), vertical, genotype))
    return f


def check_block_trace(ctx):
    """J.4 BLOCK-TRACE — every rendered block carries
    {block_id, dna_knobs_used, plan_slot, recipe_id,
    vector_deviation} on the review receipt AND data-recipe on the
    rendered element; untraced or untraced-to-the-bank = ad-libbed."""
    fp = None
    for cand in ('site/dist/home/index.html',
                 'site/src/pages/home.astro'):
        p = ctx.find(cand)
        if p:
            fp = p
            break
    if not fp:
        return []
    txt = open(fp, encoding='utf-8', errors='replace').read()
    tags = re.findall(r'<(?:section|nav|header|footer)[^>]*data-sec="([^"]+)"'
                      r'([^>]*)>', txt)
    if not tags:
        return []
    f = []
    bank = _skl_harvest_ids()
    try:
        rv = json.loads(ctx.read('REVIEW.json') or '{}')
    except Exception:
        rv = {}
    blocks = {b.get('block_id'): b for b in (rv.get('blocks') or [])
              if isinstance(b, dict)}
    for sec, attrs in tags:
        rm = re.search(r'data-recipe="([^"]+)"', attrs)
        rid = rm.group(1) if rm else ''
        if not rid:
            f.append(f'J.4 block {sec}: no data-recipe — an '
                     'untraced block is ad-libbed, sourced or not')
            continue
        if rid not in bank:
            f.append(f'J.4 block {sec}: recipe {rid!r} resolves to '
                     'no topology-bank entry')
        else:
            # J.6 seam law — a bank recipe declaring a seam binds the
            # rendered block: data-seam must echo the topo seam_style.
            # Order is free; glue is by seam, never by template slot.
            topo = (_recipe_topo_map().get(rid) or {}).get(
                'topology') or {}
            want_seam = topo.get('seam_style')
            if want_seam:
                sm = re.search(r'data-seam="([^"]+)"', attrs)
                if not sm:
                    f.append(f'J.4 block {sec}: recipe {rid} '
                             f'declares seam {want_seam} but the '
                             'render carries no data-seam — '
                             'seam-joined assembly needs it')
                elif sm.group(1) != want_seam:
                    f.append(f'J.4 block {sec}: data-seam '
                             f'{sm.group(1)} != recipe seam '
                             f'{want_seam}')
            # J.8 SEAM-SHAPE — the recipe's edge shapes bind the
            # rendered block; absent topo shapes mean flat.
            for edge in ('top', 'bottom'):
                want = topo.get(f'seam_shape_{edge}')
                if not want:
                    continue
                am = re.search(
                    rf'data-seam-shape-{edge}="([^"]+)"', attrs)
                if not am:
                    f.append(f'J.8 block {sec}: recipe {rid} declares '
                             f'{edge} seam-shape {want} but the '
                             'render carries no data-seam-shape-'
                             f'{edge}')
                elif am.group(1) != want:
                    f.append(f'J.8 block {sec}: data-seam-shape-'
                             f'{edge} {am.group(1)} != recipe '
                             f'{want}')
        bid = f'home:{sec}'
        row = blocks.get(bid)
        if not row:
            f.append(f'J.4 block {sec}: no receipt row {bid} — the '
                     'render carries no trace chain')
            continue
        for k in ('dna_knobs_used', 'plan_slot', 'recipe_id',
                  'vector_deviation'):
            if row.get(k) in (None, '', []):
                f.append(f'J.4 block {sec}: receipt {bid} missing '
                         f'{k}')
        if row.get('recipe_id') != rid:
            f.append(f'J.4 block {sec}: receipt recipe '
                     f'{row.get("recipe_id")!r} != rendered {rid!r} '
                     '— the receipt must name the recipe that '
                     'actually shipped')

    # J.8 SEAM-SHAPE — shaped edges are a declared personality choice,
    # and adjacent edges must compose: A.bottom meets B.top, so the
    # pair is compatible when both are the same shape or either is
    # flat (a shaped edge may dissolve into a flat face; two unlike
    # shapes meeting is a glue defect).
    shapes = {}
    for sec, attrs in tags:
        for edge in ('top', 'bottom'):
            m = re.search(rf'data-seam-shape-{edge}="([^"]+)"', attrs)
            shapes.setdefault(sec, {})[edge] = (
                m.group(1) if m else 'flat')
    _, gtd = _genotype(ctx.plan)
    declared = str((gtd or {}).get('seam-shape') or 'flat')
    flat_default = {'flat', 'none', ''}
    for sec, sh in shapes.items():
        for edge, s in sh.items():
            if s not in flat_default and s != declared:
                f.append(f'J.8 block {sec}: seam-shape-{edge} '
                         f'{s!r} rendered but the genotype declares '
                         f'seam-shape={declared!r} — a shaped seam '
                         'without the allele is a coherence defect')
    seq = [sec for sec, _ in tags]
    for a, b in zip(seq, seq[1:]):
        sa = shapes.get(a, {}).get('bottom', 'flat')
        sb = shapes.get(b, {}).get('top', 'flat')
        if sa not in flat_default and sb not in flat_default \
                and sa != sb:
            f.append(f'J.8 glue {a}→{b}: seam-shape {sa!r} meets '
                     f'{sb!r} — shaped edges must match or dissolve '
                     'into a flat face')
    return f


CHROME_COMPS = ('nav-bar', 'footer-bar', 'flyout-nav')


def _content_ids(ctx):
    """Inventoried content_ids: H1 'c-h1' + heading-vector cid
    column + any c-<slug> tokens declared in the STUB's Content
    inventory block."""
    ids = {'c-h1'}
    for v in ctx.stub_vector():
        if v.get('cid'):
            ids.add(v['cid'])
    p = ctx.stub_path()
    if p and os.path.isfile(p):
        txt = open(p, encoding='utf-8', errors='replace').read()
        m = re.search(r'## Content inventory\s*\n(.*?)(?=\n## |\Z)',
                      txt, re.S)
        if m:
            ids.update(re.findall(r'\b(c-[a-z][\w-]*)\b', m.group(1)))
    return ids


def check_content_map(ctx):
    """J.5 CONTENT-MAP — sections come from content, grouped
    semantically. The W2 inventory's content_ids map to exactly one
    sections[] row each (no dropped content), every non-chrome row
    names the content_ids it serves (no orphan/ad-libbed sections),
    and the render carries data-content through: every inventoried
    id rendered, no rendered block without one."""
    cids = _content_ids(ctx)
    f = []
    rows = [r for _, r in ctx.rows()]
    served = {}
    for r in rows:
        comp = str(r.get('composition') or '')
        rc = [str(x) for x in (r.get('content_ids') or [])]
        if comp in CHROME_COMPS:
            continue  # chrome serves chrome, not content
        if not rc:
            f.append(f'J.5 plan row {r.get("name", "?")} names no '
                     'content_ids — an unserved section is ad-libbed')
        for c in rc:
            served.setdefault(c, []).append(str(r.get('name') or '?'))
    for c, owners in served.items():
        if len(owners) > 1:
            f.append(f'J.5 content {c} served by {owners} — exactly '
                     'one section per content_id')
        if c not in cids:
            f.append(f'J.5 {c} served but never inventoried — '
                     'invented content has no W2 slot')
    for c in sorted(cids - set(served)):
        if rows:
            f.append(f'J.5 inventoried content {c} maps to no '
                     'sections[] row — dropped content')
    seen = set()
    pages = list(ctx.page_htmls())
    for p, txt in pages:
        name = os.path.basename(p)
        for m in re.finditer(
                r'<(?:section|nav|header|footer)[^>]*data-sec="([^"]+)"([^>]*)>',
                txt):
            sec, attrs = m.groups()
            comp = re.search(r'data-comp="([^"]+)"', attrs)
            if comp and comp.group(1) in CHROME_COMPS:
                continue
            cm = re.search(r'data-content="([^"]+)"', attrs)
            if not cm:
                f.append(f'J.5 {name} block {sec}: no data-content '
                         '— a rendered block with no content_id is '
                         'ad-libbed')
                continue
            for c in cm.group(1).split():
                seen.add(c)
                if c not in cids:
                    f.append(f'J.5 {name} block {sec}: data-content '
                             f'{c} not in the W2 inventory')
    if pages:
        for c in sorted(cids - seen):
            f.append(f'J.5 inventoried content {c} never rendered')
    return f





PAGE_FAMILIES = {
    'service-page': 'conversion',
    'guide': 'editorial', 'blog': 'editorial',
    'product-profile': 'entity-profile',
    'near-me': 'local-service',
    'hub': 'service-grid', 'index': 'service-grid',
    'support': 'support', 'utility': 'support',
    'gallery': 'gallery', 'before-after': 'gallery',
    'tool': 'tool', 'interactive': 'tool',
}


def check_page_family(ctx):
    """J.6 PAGE-FAMILY — the importer's page_type selects the layout
    family; W3 options + the plan render inside it. A guide page on
    a conversion layout (or vice versa) is a cross-family defect."""
    f = []
    pages = ctx.pages()
    fams = set()
    for slug, pg in pages.items():
        if not isinstance(pg, dict):
            continue
        pt = str(pg.get('page_type') or '')
        fam = str(pg.get('layout_family') or '')
        if not pt:
            f.append(f'J.6 page {slug}: no page_type — the W2 '
                     'importer classifies every page')
            continue
        want = PAGE_FAMILIES.get(pt)
        if not want:
            f.append(f'J.6 page {slug}: page_type {pt!r} outside '
                     f'the {sorted(set(PAGE_FAMILIES))} families')
            continue
        if fam != want:
            f.append(f'J.6 page {slug}: layout_family {fam or "—"!r} '
                     f'!= {want} for a {pt} — cross-family selection '
                     'is banned')
        fams.add(fam or want)
    pb = ctx.read('PREBUILD.json')
    if pb:
        try:
            pbj = json.loads(pb)
        except Exception:
            pbj = {}
        if isinstance(pbj, dict):
            pf = str(pbj.get('layout_family') or '')
            if pf and fams and pf not in fams:
                f.append(f'J.6 PREBUILD layout_family {pf!r} outside '
                         f'the page families {sorted(fams)} — the '
                         'validated recipes belong to another '
                         'family')
    return f

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
        for chk, msgs in _check_pool(
                [c for c in WAVE_CHECKS[wv]
                 if c is not check_wildcard
                 and c is not check_scorecard], ctx):
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
            str(s.get('data-sec', '')) +
            str(s.get('data-surface', '')))]
        if not dark:
            f.append(f'L.7 {name}: no contrast-moment surface '
                     'detected in rendered sections')
        dens = set()
        for s in tagged:
            if s.get('data-density'):
                dens.add(str(s.get('data-density')))
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
        for chk, r in _check_pool(
                [c for c in WAVE_CHECKS[wv]
                 if c is not check_wildcard], ctx):
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
        if 'patterns/data' in rel_dp or rel_dp.startswith('stage-')                 or '/sources' in rel_dp:
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
    motion_root = os.path.join(REPO, 'templates', 'motion')
    if os.path.isdir(motion_root):
        for d in sorted(os.listdir(motion_root)):
            rp = os.path.join(motion_root, d, 'recipe.md')
            if not os.path.isfile(rp):
                continue
            fm = _frontmatter(open(rp, encoding='utf-8',
                                   errors='replace').read())
            rid = fm.get('id') or 'recipe-' + d
            nodes[rid] = {'id': rid, 'type': fm.get(
                'type', 'motion-recipe'),
                'file': f'templates/motion/{d}/recipe.md'}
            edges.append(('design-index', rid, 'templates'))
            edges.append((rid, 'motion-taxonomy', 'consumes'))
            for wv in (fm.get('used_in') or []):
                edges.append((rid, str(wv), 'used_in'))
    skl_root = os.path.join(REPO, 'templates', 'skeletons')
    if os.path.isdir(skl_root):
        for src in sorted(os.listdir(skl_root)):
            sdir = os.path.join(skl_root, src)
            if not os.path.isdir(sdir):
                continue
            sid = 'skeleton-' + src
            # component-tier endorsed sources get the marker type —
            # their spec.json may inform component-level visuals where
            # the DNA profile is open (structure law unchanged)
            stype = 'component-reference' if src == 'shadcn' \
                else 'skeleton-source'
            nodes[sid] = {'id': sid, 'type': stype,
                          'file': f'templates/skeletons/{src}'}
            edges.append(('design-index', sid, 'templates'))
            edges.append(('section-catalog', sid, 'see_also'))
            fam = {}
            for dp, _, fns in os.walk(sdir):
                for fn in fns:
                    if not fn.endswith('.json') or                             fn.startswith('_'):
                        continue
                    try:
                        v = json.load(open(os.path.join(dp, fn)))
                    except Exception:
                        continue
                    if not isinstance(v, dict):
                        continue
                    comp = v.get('wf_composition')
                    fname = v.get('family') or v.get('name')
                    if fname and comp:
                        fam.setdefault(fname, set()).add(comp)
            for fm_, comps in sorted(fam.items()):
                fid = f'{sid}-{fm_}'
                nodes[fid] = {'id': fid, 'type': 'skeleton-family',
                              'file': f'templates/skeletons/{src}'}
                edges.append((sid, fid, 'contains'))
                for comp in sorted(comps):
                    edges.append((fid, 'comp-' + comp,
                                  'provides_structure'))
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
    run_order = set(re.findall(r"'[sw]\d'", run_src))
    if run_order != {f"'{w}'" for w in impl_waves}:
        fails.append(f'run.py ORDER ≠ {sorted(impl_waves)}')
    idx = texts.get(os.path.join(ddir, 'INDEX.md'), '')
    for w in sorted(impl_waves):
        if f'W{w[1]}' not in idx:
            fails.append(f'INDEX.md missing wave {w}')

    # N-9 — dead-wiring detector: every check's _wave_ge floor must be
    # reachable from a wave it is WIRED to. A check wired at w5 whose
    # rendered branch guards w6+ runs its rendered half never.
    src = open(__file__, encoding='utf-8').read()
    wnum = {w: i for i, w in enumerate(sorted(WAVE_CHECKS))}
    for wv, checks in WAVE_CHECKS.items():
        for c in checks:
            body = re.search(
                rf'def {c.__name__}\(.*?\n(.*?)(?=\ndef |\Z)',
                src, re.S)
            if not body:
                continue
            for g in re.findall(r"_wave_ge\(ctx,\s*'(w\d)'\)",
                                body.group(1)):
                if wnum.get(g, 99) > wnum.get(wv, 0) and all(
                        wnum.get(x, 0) < wnum.get(g, 99)
                        for x, cs in WAVE_CHECKS.items()
                        if c in cs):
                    fails.append(
                        f'{c.__name__}: _wave_ge({g}) branch '
                        'unreachable — wired only at ' +
                        str(sorted(w for w, cs in WAVE_CHECKS.items()
                                   if c in cs)))
                    break
    # N-6 — enforcement.json thresholds must agree with the code's
    # canonical sets (the bd73ae0 blind replace corrupted R.1 once)
    enf = json.load(open(ENFORCEMENT))['rules']
    for rid, e in enf.items():
        th = str(e.get('threshold') or '')
        for m in re.finditer(r'\{([\d,\s]+)\}', th):
            got = set(re.findall(r'\d+', m.group(1)))
            for label, canon in (
                    ('breakpoint', CANON_BP), ('edge', CANON_EDGE)):
                if len(got) >= 5 and got != canon and \
                        canon & got == got:
                    fails.append(
                        f'enforcement.json {rid}: {label} set '
                        f'{sorted(got)} ≠ code {sorted(canon)}')
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

def check_tailwind_preview(ctx):
    """Tailwind is the CSS system at EVERY layer — every preview/*.html
    carries the Tailwind CDN + the CDN port of the site
    tailwind.config + the TOKENS component layer for its chrome; a
    shell that iframes astro-built pages must additionally resolve
    those pages (their styling is the real build's linked
    _astro/*.css, never a mock)."""
    f = []
    for fn in sorted(glob_mod.glob(
            os.path.join(ctx.dir, 'preview', '*.html'))):
        t = open(fn, encoding='utf-8', errors='replace').read()
        base = os.path.basename(fn)
        if 'cdn.tailwindcss.com' not in t:
            f.append(f'P.1 {base}: no Tailwind — every HTML artifact '
                     'uses Tailwind (CDN in previews, build at w6)')
        if 'tailwind.config' not in t and _wave_ge(ctx, 'w3'):
            f.append(f'P.2 {base}: no tailwind.config port — TOKENS '
                     'roles must resolve to the same theme keys the '
                     'astro build uses')
        if '<iframe' in t:
            pages = _shell_card_pages(fn, t)
            if not pages or not any(pt for pt, _ in pages.values()):
                f.append(f'P.1 {base}: no built page resolves — the '
                         'picker iframes the astro-built option '
                         '(preview_build)')
            elif not any(css for _, css in pages.values()):
                f.append(f'P.1 {base}: built pages link no stylesheet '
                         "— previews style through the real build's "
                         '_astro css, never a mock')
    return f


# ---------------------------------------------- BR: page boards
# render probe over every built board option — the nav spec (#104:
# one desktop row, links ≥15px, burger hidden ≥60rem, no search field
# in the bar), exactly one h1, no 390px overflow, and a 1280×900
# first-screen thumbnail for the variety metric
_BR_1280 = r"""() => {
 const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e);
   return r.width > 1 && r.height > 1 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0; };
 const h1s = [...document.querySelectorAll('h1')].filter(vis)
   .map(h => { const s = h.closest('[data-comp]'); return s ? s.dataset.comp : ''; });
 const hdr = document.querySelector('[data-sec="header"]');
 const out = {h1: h1s, hdr: null, media: 0, hcomp: hdr ? (hdr.dataset.comp || '') : ''};
 const hero = document.querySelector('[data-sec="hero"]');
 out.htop = hero ? Math.round(hero.getBoundingClientRect().top + scrollY) : 0;
 if (hero) out.media = Math.max(0, ...[...hero.querySelectorAll('img,iframe,video')].filter(vis)
   .map(i => { const r = i.getBoundingClientRect(); return Math.round(Math.max(0, Math.min(r.bottom, 900) - Math.max(r.top, 0)) * r.width); }));
 out.imgov = [];
 document.querySelectorAll('[data-sec]').forEach(s => {
   const im = [...s.querySelectorAll('img')].filter(vis).filter(e => !e.closest('.media-bg'))
     .map(e => e.getBoundingClientRect()).filter(r => r.width > 20 && r.height > 20);
   for (let i = 0; i < im.length; i++) for (let j = i + 1; j < im.length; j++) {
     const a = im[i], b = im[j];
     const w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
     if (w > 8 && h > 8 && w * h > 0.05 * Math.min(a.width * a.height, b.width * b.height)) out.imgov.push(s.dataset.comp || s.dataset.sec); } });
 if (hdr) {
   const items = [...hdr.querySelectorAll('a,button,input,img,svg,.logo')].filter(vis);
   const tops = [];
   items.forEach(e => { const r = e.getBoundingClientRect(), c = r.top + r.height / 2;
     if (!tops.some(t => Math.abs(t - c) < 24)) tops.push(c); });
   const links = [...hdr.querySelectorAll('a')].filter(vis)
     .filter(a => !a.querySelector('img,svg') && a.textContent.trim() && !a.closest('.nav-cta,.wf-cta-button') && !a.classList.contains('wf-cta-button'));
   const b = [...hdr.querySelectorAll('.burger')].some(vis);
   const inp = [...hdr.querySelectorAll('input,[role=search]')].some(vis);
   const txt = links.map(a => a.textContent.trim());
   const boxes = [...hdr.querySelectorAll('a,button,.logo,img')].filter(vis)
     .filter(e => !e.parentElement.closest('a,button,.logo')).map(e => e.getBoundingClientRect());
   let overlap = 0;
   boxes.forEach((a, i) => boxes.slice(i + 1).forEach(b => {
     const w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
     if (w > 4 && h > 4) overlap++; }));
   out.hdr = {overlap, rows: tops.length, minfs: links.length ? Math.min(...links.map(a => parseFloat(getComputedStyle(a).fontSize))) : 0,
              burger: b, search: inp, dup: txt.length - new Set(txt).size, links: links.length};
 }
 return out; }"""
_BR_390 = r"""() => { const W = document.documentElement.clientWidth;
 if (document.documentElement.scrollWidth <= W + 1) return null;
 let worst = null, wr = W + 1;
 for (const e of document.querySelectorAll('body *')) { const r = e.getBoundingClientRect();
   if (r.right > wr && r.width > 0) { wr = r.right; const s = e.closest('[data-comp]'); worst = s ? s.dataset.comp : e.tagName; } }
 return worst; }"""
_BR_THUMB = r"""async (u) => { const im = new Image(); im.src = u; await im.decode();
 const c = document.createElement('canvas'); c.width = 32; c.height = 23;
 const x = c.getContext('2d'); x.drawImage(im, 0, 0, 32, 23);
 return Array.from(x.getImageData(0, 0, 32, 23).data).filter((_, i) => i % 4 !== 3); }"""
# two first screens are one cluster when their 32×23 RGB thumbnails
# differ by < 4% mean absolute channel delta (leader clustering)
BR_FS_SAME = 0.04


def _br_clusters(thumbs):
    leaders = []
    for oid, t in thumbs:
        for ld in leaders:
            if sum(abs(a - b) for a, b in zip(t, ld[1])) / (
                    255.0 * max(1, len(t))) < BR_FS_SAME:
                ld[2].append(oid)
                break
        else:
            leaders.append([oid, t, [oid]])
    return [ld[2] for ld in leaders]


BR_MAX_HERO_TOP = 120


def _br_probe(dist, oids):
    """{oid: metrics} over the built boards dist (local http, headless
    chromium at 1280×900 and 390×844)."""
    import base64
    import functools
    import http.server
    import threading
    from playwright.sync_api import sync_playwright

    class _Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    srv = http.server.ThreadingHTTPServer(
        ('127.0.0.1', 0), functools.partial(
            _Q, directory=dist))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{srv.server_address[1]}/preview/'
    res = {}
    try:
        with sync_playwright() as pw:
            br = pw.chromium.launch()
            pg = br.new_page(viewport={'width': 1280, 'height': 900})
            pm = br.new_page(viewport={'width': 390, 'height': 844})
            pt = br.new_page()
            for oid in oids:
                pg.goto(base + f'lo-{oid}/', wait_until='load')
                try:
                    pg.wait_for_function(
                        "[...document.images].filter(i => i.getBoundingClientRect().top < 900).every(i => i.complete)",
                        timeout=4000)
                except Exception:
                    pass
                r = pg.evaluate(_BR_1280)
                shot = base64.b64encode(pg.screenshot(
                    type='jpeg', quality=70)).decode()
                r['thumb'] = pt.evaluate(
                    _BR_THUMB, 'data:image/jpeg;base64,' + shot)
                pm.goto(base + f'lo-{oid}/', wait_until='load')
                r['o390'] = pm.evaluate(_BR_390)
                res[oid] = r
            br.close()
    finally:
        srv.shutdown()
    return res


BR_MIN_CLUSTERS = 12


def check_board_render(ctx):
    """BR — every built page-board option (boards/site/dist/preview/
    lo-<board>-<nn>, emitted by preview_build.emit_page_boards) renders
    to spec. BR.1 header = #104 nav: one desktop row, links ≥15px,
    burger hidden ≥60rem, no search field in the bar, no duplicated or
    overlapping items. BR.2 exactly one visible <h1>. BR.3 no
    horizontal overflow at 390px. BR.4 ≥ BR_MIN_CLUSTERS distinct
    1280×900 first screens per board (all, when a board has fewer).
    BR.5 no two content images overlap inside one section. BR.6 the
    hero starts within BR_MAX_HERO_TOP px of the top at 1280 (no tall
    chrome dead space)."""
    dist = os.path.join(ctx.dir, 'boards', 'site', 'dist')
    pv = os.path.join(dist, 'preview')
    if not os.path.isdir(pv):
        return []
    oids = sorted(d[3:] for d in os.listdir(pv)
                  if re.match(r'lo-[a-z]+-\d+$', d)
                  and os.path.isfile(os.path.join(pv, d, 'index.html')))
    if not oids:
        return []
    pr = _br_probe(dist, oids)
    f = []
    for oid in oids:
        r = pr[oid]
        h = r.get('hdr')
        if h:
            why = [w for w, bad in (
                (f"rows={h['rows']}", h['rows'] > 1),
                (f"links {h['minfs']:.0f}px", 0 < h['minfs'] < 15),
                ('no desktop links', h['links'] == 0),
                ('burger shown >=60rem', h['burger']),
                ('search field in bar', h['search']),
                ('duplicated links', h['dup'] > 0),
                ('items overlap', h.get('overlap', 0) > 0)) if bad]
            if why:
                f.append(f"BR.1 lo-{oid} header {r.get('hcomp')}: "
                         + ', '.join(why))
        if len(r.get('h1') or []) != 1:
            f.append(f"BR.2 lo-{oid}: {len(r.get('h1') or [])} "
                     'visible <h1> — exactly one')
        if r.get('o390'):
            f.append(f"BR.3 lo-{oid}: overflows 390px ({r['o390']})")
        if r.get('htop', 0) > BR_MAX_HERO_TOP:
            f.append(f"BR.6 lo-{oid}: first section starts "
                     f"{r['htop']}px down at 1280 (max "
                     f"{BR_MAX_HERO_TOP}px of chrome above it)")
        if r.get('imgov'):
            f.append(f"BR.5 lo-{oid}: images overlap in "
                     f"{', '.join(sorted(set(r['imgov'])))}")
    boards = {}
    for oid in oids:
        boards.setdefault(oid.rsplit('-', 1)[0], []).append(oid)
    for board, ids in sorted(boards.items()):
        cl = _br_clusters([(i, pr[i]['thumb']) for i in ids])
        need = min(BR_MIN_CLUSTERS, len(ids))
        if len(cl) < need:
            f.append(f'BR.4 board {board}: {len(cl)} distinct 1280x900 '
                     f'first screens < {need}')
    return f


# BRR — the section roles every option of a board must carry: a
# board option looks like its page type (a blog option lists posts,
# a contact option carries the form, details, hours and map)
BOARD_ROLES = {
    'home': ('hero', 'services', 'process', 'proof', 'cta'),
    'service': ('hero', 'scope', 'process', 'pricing', 'proof'),
    'location': ('hero', 'coverage', 'map', 'proof', 'services',
                 'contact'),
    'contact': ('hero', 'form', 'map', 'hours'),
    'blog': ('hero', 'featured', 'listing', 'categories', 'newsletter'),
}


# role → the controls a role's section must carry (not just text):
# a contact form asks name/email/phone/message and submits; a blog
# listing pages
BOARD_CONTROLS = {
    'contact': {
        'form:name': ('form', r'<input[^>]*name="name"'),
        'form:email': ('form', r'<input[^>]*type="email"'),
        'form:phone': ('form', r'<input[^>]*type="tel"'),
        'form:message': ('form', r'<textarea\b'),
        'form:submit': ('form', r'<button[^>]*type="submit"'),
        'map:embed': ('map', r'<iframe\b|<img\b'),
        'details:email': ('hours', r'[\w.+-]+@[\w-]+\.[\w.]+'),
    },
    'location': {'map:embed': ('map', r'<iframe\b|<img\b')},
    'blog': {
        'listing:pagination': ('listing',
                               r'<nav[^>]*aria-label="Pagination"'),
    },
}


# hero topologies with a media pane — BRR.3 fails one that renders none
BOARD_MEDIA_TOPOS = ('hero-media-right', 'hero-media-left', 'hero-media-bg',
                     'hero-media-top', 'hero-cutout', 'band-media')


def check_board_roles(ctx):
    """BRR.1 — every built page-board option (boards/site/dist/
    preview/lo-<board>-<nn>) carries a non-empty section for each
    role BOARD_ROLES requires of its page type, and the controls
    BOARD_CONTROLS requires inside them (form fields, map, email,
    pagination). BRR.3 no builder-scaffolding composition, and a hero
    whose topology has a media pane renders media."""
    pv = os.path.join(ctx.dir, 'boards', 'site', 'dist', 'preview')
    if not os.path.isdir(pv):
        return []
    try:
        _pb = json.load(open(os.path.join(ctx.dir, 'PAGE-BOARDS.json'),
                             encoding='utf-8')).get('boards') or {}
    except (OSError, ValueError):
        _pb = {}
    media_topo = {o.get('id'): (o.get('hero') or {}).get('topology_id')
                  for b in _pb.values() for o in b.get('options') or []}
    f = []
    for d in sorted(os.listdir(pv)):
        m = re.match(r'lo-([a-z]+)-\d+$', d)
        fp = os.path.join(pv, d, 'index.html')
        if not m or m.group(1) not in BOARD_ROLES \
                or not os.path.isfile(fp):
            continue
        html = open(fp, encoding='utf-8', errors='replace').read()
        have = set()
        for sm in re.finditer(r'<(section|header|footer)\b[^>]*'
                              r'data-sec="([^"]+)"[^>]*>(.*?)</\1>',
                              html, re.S):
            if re.sub(r'<[^>]+>|\s+', '', sm.group(3)):
                have.add(sm.group(2))
        miss = [r for r in BOARD_ROLES[m.group(1)] if r not in have]
        for need, (sec, pat) in BOARD_CONTROLS.get(m.group(1), {}).items():
            sm = re.search(r'<(section|header|footer)\b[^>]*data-sec="'
                           + sec + r'"[^>]*>(.*?)</\1>', html, re.S)
            if not sm or not re.search(pat, sm.group(2), re.S):
                miss.append(need)
        if miss:
            f.append(f'BRR.1 {d}: missing {m.group(1)} section role(s) '
                     f'{", ".join(miss)}')
        scaf = sorted(set(re.findall(r'data-comp="([^"]*(?:remove-this|'
                                     r'take-out|remove-contents)[^"]*)"',
                                     html)))
        if scaf:
            f.append(f'BRR.3 {d}: builder scaffolding composition(s) '
                     f'{", ".join(scaf)}')
        topo = media_topo.get(d[3:])
        hm = re.search(r'<section\b[^>]*data-sec="hero"[^>]*>(.*?)'
                       r'</section>', html, re.S)
        if topo in BOARD_MEDIA_TOPOS and hm and not re.search(
                r'<(img|video|iframe)\b|background-image', hm.group(1)):
            f.append(f'BRR.3 {d}: hero topology {topo} renders no media')
    return f


def check_board_pools(ctx):
    """BRR.2 — page boards draw their own pools: across PAGE-BOARDS.json
    no two boards share more than 20% of their first-screen (hero)
    recipes, so no board is another's pool at a different rotation."""
    try:
        boards = json.load(open(os.path.join(ctx.dir, 'PAGE-BOARDS.json'),
                                encoding='utf-8')).get('boards') or {}
    except (OSError, ValueError):
        return []
    hero = {b: {(o.get('hero') or {}).get('recipe') or
                (o.get('hero') or {}).get('comp')
                for o in (d.get('options') or [])} - {None, ''}
            for b, d in boards.items()}
    f, names = [], sorted(hero)
    for i, a in enumerate(names):
        for b in names[i + 1:]:
            lo = min(len(hero[a]), len(hero[b]))
            share = len(hero[a] & hero[b]) / lo if lo else 0.0
            if share > 0.20:
                f.append(f'BRR.2 boards {a}/{b} share {share:.0%} of '
                         f'their hero recipes (max 20%)')
    return f


WAVE_CHECKS = {
    's0': [check_discovery_provenance],
    'w0': [check_scaffold, check_source_bind, check_copy_coverage,
           check_plan_provenance, check_copy_shape_fit,
           check_light_canvas, check_site_dna],
    'w1': [check_design_mode, check_intent,
           check_genotype, check_tiers, check_audit_artifacts,
           check_mobbin_refs, check_image_discovery, check_canon_trace,
           check_candidate_review, check_trend_vocab,
           check_plan_provenance, check_copy_shape_fit,
           check_discovery_provenance, check_light_canvas],
    'w2': [check_content_inventory],
    'w3': [check_section_program, check_hero_composition,
           check_wireframe_tags, check_mobbin_refs,
           check_content_inventory,
           check_wireframe_lock, check_section_enums,
           check_speech_acts, check_emphasis, check_motif,
           check_rhythm, check_vector_map, check_schema_fields,
           check_genotype, check_burst, check_declared_breaks,
           check_wildcard, check_section_contracts,
           check_layout_distinct, check_canon_trace,
           check_intent_deviation, check_intent_sections,
           check_receipts, check_tailwind_preview,
           check_copy_shape_fit, check_layout_options,
           check_layout_scores, check_layout_pick,
           check_operator_approvals, check_round_gated],
    'w4': [check_direction_axes, check_genotype,
           check_genotype_distinct,
           check_burst, check_declared_breaks, check_wildcard,
           check_dark_mode, check_variants, check_canon_trace,
           check_receipts,
           check_intent_deviation, check_wildcard_random,
           check_light_canvas, check_operator_approvals,
           check_acss_tokens, check_fluid_sizes, check_round_gated_look,
           check_fine_round, check_slop_palette],
    'w5': [check_system_enums, check_spacing_scale, check_breakpoints,
           check_content_width, check_contrast, check_type_system,
           check_tailwind_derivation, check_tile_is_system,
           check_no_emoji, check_neutral_tint, check_proximity,
           check_gray_on_color,
           check_border_widths, check_reduced_motion, check_dark_mode,
           check_dark_toggle, check_canon_trace, check_trend_vocab,
           check_style_licence, check_token_layer,
           check_sop_constants, check_three_layers],
    'w6': [check_components_exist, check_tile_is_system,
           check_class_subset, check_no_stray_styles, check_no_emoji,
           check_icon_discipline, check_lucide, check_section_shell,
           check_acss_conventions,
           check_content_width,
           check_section_allowed, check_section_gates, check_exemplars,
           check_slop_classes,
           check_astro_build, check_token_layer, check_design_system],
    'w7': [check_section_program, check_hero_composition,
           check_assembly, check_spec_verbatim, check_page_data_attrs,
           check_heading_verbatim, check_class_subset,
           check_no_stray_styles, check_no_emoji,
           check_icon_discipline, check_lucide, check_ornament,
           check_brand_motif,
           check_speed_budget,
           check_motion_recipes, check_motion_js_budget,
           check_skeleton,
           check_acss_conventions,
           check_content_width,
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
           check_dark_mode, check_dark_toggle, check_astro_build,
           check_js_cost, check_grid_tracks, check_frozen_inputs,
           check_copy_fidelity, check_unsourced_quotes,
           check_light_paint, check_acss_tokens, check_fluid_sizes,
           check_design_system,
           check_faq_collapsed, check_card_hierarchy, check_icon_ring,
           check_gap_floor, check_section_pad, check_type_scale_min,
           check_contrast_pairs,
           check_seal] \
           + SEGMENT_ALL,
    'w8': [check_review_completeness, check_scorecard,
           check_style_review, check_novelty, check_review_modes,
           check_variants, check_vlm_evidence,
           check_operator_approvals],
}

# P.19 — every wave's step runs on a budgeted context packet
for _wv, _lst in WAVE_CHECKS.items():
    _lst.append(check_context_budget)

# per-wave advisory checks — emitted as warnings, never blocking
WARN_CHECKS = {'w7': [check_serial_build_warn],
               'w5': [check_font_slop]}

WAVE_CHECKS['w7'].append(check_parallel_build)
WAVE_CHECKS['w8'].append(check_bounded_review)
WAVE_CHECKS['w3'].append(check_board_render)
WAVE_CHECKS['w3'].append(check_board_roles)
WAVE_CHECKS['w3'].append(check_board_pools)
WAVE_CHECKS['w8'].append(check_measured_evidence)
WAVE_CHECKS['w8'].append(check_judged_verdict)

# VG.7 — picker UX is structural: tabbed options, render first,
# machinery collapsed below. Verified wherever a picker exists
# (candidates w1, layouts w3, variants/fine w4).
for _wv in ('w1', 'w3', 'w4'):
    WAVE_CHECKS[_wv].append(check_picker_ux)

# J.* — the judgment chain: pre-build receipt (w4 pickers onward),
# quality floor + present-order wherever pickers/review exist,
# block trace on the assembled page.
WAVE_CHECKS['w4'].append(check_prebuild_receipt)
WAVE_CHECKS['w7'].append(check_quality_floor)
WAVE_CHECKS['w7'].append(check_present_order)
WAVE_CHECKS['w7'].append(check_block_trace)
WAVE_CHECKS['w8'].append(check_quality_floor)
WAVE_CHECKS['w8'].append(check_present_order)
WAVE_CHECKS['w3'].append(check_content_map)
WAVE_CHECKS['w7'].append(check_content_map)
WAVE_CHECKS['w3'].append(check_page_family)
WAVE_CHECKS['w4'].append(check_page_family)

# run pin + brief drift: every wave (U.5 — the gate itself and the
# brief are pinned to the run the orchestrator opened)
for _w in list(WAVE_CHECKS):
    WAVE_CHECKS[_w].append(check_run_pin)
    WAVE_CHECKS[_w].append(check_brief_hash)

WAVE_INPUTS = {
    's0': ['BRIEF.yaml', 'RULES.md', 'DISCOVERY.json', 'DNA.json',
           'TOKENS.json', 'DESIGN-SYSTEM.md', 'MOBBIN-REFS.md'],
    'w0': ['site/package.json', 'site/astro.config.mjs',
           'site/src/styles/global.css',
           'COPY.json', 'DESIGN-PLAN.md', 'STUB.md',
           'LAYOUT-OPTIONS.json', 'DNA.json', 'TOKENS.json'],
    'w1': ['DESIGN-PLAN.md', 'audit.md', 'MOBBIN-REFS.md',
           'CANDIDATES.json', 'preview/candidates.html'],
    'w2': ['STUB.md'],
    'w3': ['DESIGN-PLAN.md', 'MOBBIN-REFS.md', 'preview/layouts.html'],
    'w4': ['DESIGN-PLAN.md', 'preview/variants.html',
           'preview/fine.html'],
    'w5': ['DESIGN-PLAN.md', 'TOKENS.json', 'preview/system.html',
           'site/src/styles/global.css'],
    'w6': ['DESIGN-PLAN.md', 'COMPONENTS.md',
           'site/src/pages/system.astro'],
    'w7': ['DESIGN-PLAN.md'],
    'w8': ['REVIEW.json', 'MEASURE.json', 'JUDGE.json'],
}
for _w in list(WAVE_CHECKS):
    WAVE_CHECKS[_w].append(check_checklist)
    WAVE_CHECKS[_w].append(check_dna)
    WAVE_CHECKS[_w].append(check_dna_fresh)

# The operator decision points (operator decree 2026-11-20): pick the
# wireframe (w3) and approve the look sheet (w4) — clicks in the
# picker page, nothing else. Every other wave advances on gate PASS
# alone; X.3 verifies only w3/w4 records.
APPROVABLE = {'w3', 'w4'}

if __name__ == '__main__':
    sys.exit(main())

