#!/usr/bin/env python3
"""picker_app.py — producer for the operator's pick app.

Emits the /app shell (static HTML+CSS+JS) and builds the /app-data
payload for a pipeline dir: the design file (DNA.json / TOKENS.json /
BRIEF.yaml), the page boards (w3 layout + w4 look pick cards bound to
the real built previews) and the element galleries (live per-comp
preview pages extracted from the built system sheet).

Machinery-first: the shell is an emitted artifact of this script;
element previews are emitted from dist/system/index.html's data-comp
blocks — nothing is hand-authored markup outside this chain.

Routes served by approve_service.py:
    GET /app?pipeline=<abs>   the shell (sets _LAST_PD for /_astro/)
    GET /app-data?pipeline=   JSON boards + galleries + design file
    GET /frame/<fam>/<path>   a built page under a vibe family's
                              token bundle (server-side var
                              overrides — no astro rebuild)
    POST /element-pick        signed element decision → ELEMENT-PICKS.json

The app is a scrub interface over the pre-computed design space:
vibe (coarse gene-bundle families) → layout (page options +
per-section topology scrubbing inline on the full page) →
sections/elements (galleries). Every preview is static HTML —
variants differ by a CSS-var override bundle, never by a rebuild.
"""
import datetime, html.parser, json, os, re, sys, \
    threading, urllib.parse
from pathlib import Path

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import gate as G

# ------------------------------------------------------------------
# element galleries — which bank compositions each rail item shows
# ------------------------------------------------------------------
ELEMENT_GALLERIES = [
    {'id': 'chrome', 'title': 'Header · Footer', 'icon': 'bars',
     'desc': 'Header + footer designer — nav rows, collapse '
             'patterns, footers. Picks sign the header/footer '
             'elements independently.',
     'groups': [
         {'label': 'Header', 'element': 'header',
          'comps': ['nav-bar', 'flyout-nav']},
         {'label': 'Footer', 'element': 'footer',
          'comps': ['footer-bar']}]},
    {'id': 'menu', 'title': 'Menu designer', 'icon': 'burger',
     'desc': 'The nav surface at every breakpoint — M/T/D resizes '
             'the preview; the flyout panel doubles as a desktop '
             'modal/slide-out overlay.',
     'groups': [
         {'label': None, 'element': 'menu',
          'comps': ['nav-bar', 'flyout-nav'], 'suffix': '-menu'}],
     'mobile': True},
    {'id': 'modals', 'title': 'Modals', 'icon': 'modal',
     'desc': 'Dialog/flyout surfaces — forms, popups, disclosures',
     'groups': [
         {'label': None, 'element': 'modals',
          'comps': ['modal-form', 'form-panel'], 'suffix': '-open'}]},
    {'id': 'footers', 'title': 'Footers · bank', 'icon': 'bars',
     'desc': 'Reference footer topologies from the genmenu bank — '
             'rendered as-banked (reference fidelity), not vibe-bound.',
     'groups': []},
    {'id': 'pricing', 'title': 'Pricing · bank', 'icon': 'doc',
     'desc': 'Reference pricing topologies — tiers, single, table.',
     'groups': []},
    {'id': 'auth', 'title': 'Auth · bank', 'icon': 'doc',
     'desc': 'Reference auth forms — sign-up / login screens.',
     'groups': []},
    {'id': 'empty-states', 'title': 'Empty states · bank',
     'icon': 'doc',
     'desc': 'Reference empty/error states (404s, blank screens).',
     'groups': []},
    {'id': 'commerce', 'title': 'Commerce · bank', 'icon': 'doc',
     'desc': 'Reference commerce screens — checkout, order '
             'confirm, product page, flows.',
     'groups': []},
    {'id': 'ui-elements', 'title': 'UI elements · bank',
     'icon': 'doc',
     'desc': 'Reference atomic UI elements — pickers, toggles, '
             'chips, controls.',
     'groups': []},
]

# genmenu bank exemplars surfaced as scrubbable cards — gallery id
# → the topology dirs whose .html fragments render as-banked
_BANK_DIRS = {
    'menu': ('nav-dock-left-drawer', 'nav-top-sheet',
             'nav-bottom-sheet', 'nav-dropdown-menu',
             'nav-mega-panel', 'nav-modal'),
    'modals': ('modal-dialog', 'modal-bottom-sheet',
               'modal-slide-over'),
    'footers': ('footer-mega', 'footer-columns', 'footer-minimal'),
    'pricing': ('pricing-tiers', 'pricing-single', 'pricing-table'),
    'auth': ('auth-form',),
    'empty-states': ('empty-state',),
    'commerce': ('checkout', 'order-confirm', 'product-page',
                 'commerce-flow'),
    'ui-elements': ('ui-element',),
}

PAGE_BOARDS = [
    {'id': 'home', 'title': 'Home', 'icon': 'home',
     'desc': 'Layout options (w3) and look options (w4) for the '
             'emitted page — card pick posts a signed approval'},
    {'id': 'service', 'title': 'Service', 'icon': 'doc',
     'desc': 'Composition options the plan offers per section'},
    {'id': 'location', 'title': 'Location', 'icon': 'pin',
     'desc': 'Composition options the plan offers per section'},
    {'id': 'contact', 'title': 'Contact', 'icon': 'mail',
     'desc': 'Composition options the plan offers per section'},
    {'id': 'blog', 'title': 'Blog', 'icon': 'news',
     'desc': 'Composition options the plan offers per section'},
]

# galleries whose cards pick an element (element → comp ids)
_NAV_COMPS = ('nav-bar', 'flyout-nav')

# menu-flyout geometry topos — CSS-geometry alternates of the open
# .nav-links panel (docked panel / full overlay / bottom sheet);
# every variant stays inside the baked family's token space
_MENU_TOPOS = {
    '': '',                       # as-built: docked right
    'dock-left':
        '.nav-links.open{inset-inline-end:auto;inset-inline-start:0;'
        'border-inline-start:0;border-inline-end:1px solid '
        'var(--border-default)}',
    'full-screen':
        '.nav-links.open{width:auto;inset-inline:0;'
        'border-inline-start:0}',
    'sheet-bottom':
        '.nav-links.open{inset-block:auto 0;inset-inline:0;width:auto;'
        'max-height:72vh;border-inline-start:0;border-block-start:'
        '1px solid var(--border-default)}',
}

# AND-picker mood facets — operator-facing synonyms over the gene
# bundles (e.g. light AND professional, light AND playful)
_VIBE_MOODS = {
    'baseline': ('professional',),
    'noir': ('professional',),
    'paper': ('professional', 'playful'),
    'gloss': ('playful', 'colourful'),
    'tight': ('professional',),
    'warm': ('playful', 'colourful'),
    'mono': ('professional',),
    'editorial': ('professional', 'colourful'),
}

# ------------------------------------------------------------------
# vibe families — coherent gene bundles bound as CSS-var overrides
# onto the emitted pages. Each is a quadrant of (mood × density ×
# radius × type × elevation): unmistakably different at thumbnail.
# css binds :root (light), css_dark binds [data-theme=dark].
# ------------------------------------------------------------------
VIBE_FAMILIES = {
    'baseline': {
        'name': 'Baseline', 'genes': ['as-designed', 'dna-true'],
        'desc': "the pipeline's own DNA — no overrides",
        'css': '', 'css_dark': '', 'shape': '', 'theme': None},
    'noir': {
        'name': 'Noir', 'genes': ['dark-first', 'flat', 'sharp'],
        'desc': 'dark-dominant, zero radius, cyan accent',
        'shape': '.wf-hero-1 .hero-1-container{position:relative;'
                 'display:grid;place-items:center;min-height:64vh}'
                 '.wf-hero-1 figure.ratio-portrait{position:absolute;'
                 'inset:0;margin:0;width:100%}'
                 '.wf-hero-1 figure.ratio-portrait .media-round{'
                 'height:100%;width:100%;border-radius:0}'
                 '.wf-hero-1 figure.ratio-portrait img{height:100%;'
                 'width:100%;object-fit:cover}'
                 '.wf-hero-1 .hero-1__content{position:relative;'
                 'z-index:1;'
                 'padding:var(--space-l);width:100%;text-align:center;'
                 'background:linear-gradient(0deg,rgb(0 0 0/.78),'
                 'rgb(0 0 0/.30))}'
                 '.wf-hero-1 .hero-1__content :where(h1,p){color:#fff}'
                 '.wf-hero-1 .hero-1__cta p{display:flex;'
                 'justify-content:center}',
        'css': '--radius:0;--primitive-radius:0;--r-card:0;'
               '--action-primary:#0E7490;--action-primary-hover:#155E75;'
               '--shadow-card:none;--shadow-pop:none;',
        'css_dark': '--bg-canvas:#0B0B0D;--bg-surface:#131316;'
                    '--bg-elevated:#1B1B1F;--border-default:#2A2A30;'
                    '--action-primary:#22D3EE;'
                    '--action-primary-hover:#67E8F9;'
                    '--action-primary-ink:#062C33;--radius:0;'
                    '--r-card:0;--shadow-card:none;--shadow-pop:none;',
        'theme': 'dark'},
    'paper': {
        'name': 'Paper', 'genes': ['serif', 'spacious', 'quiet'],
        'desc': 'serif display, one rung more air, forest accent',
        'shape': '.wf-hero-1 .hero-1-container{display:block}'
                 '.wf-hero-1 figure{display:none}'
                 '.wf-hero-1 .hero-1__content{max-width:46rem}'
                 '.card{box-shadow:none;border-top:1px solid '
                 'var(--border-default)}',
        'css': '--primitive-font-display:Georgia,"Times New Roman",'
               'serif;--font-display:Georgia,"Times New Roman",serif;'
               '--flow-spacing:var(--space-l);--grid-gap:var(--space-l);'
               '--content-gap:var(--space-l);'
               '--section-space-m:var(--section-space-l);'
               '--bg-canvas:#FAF7F1;--bg-surface:#F2EEE6;'
               '--bg-elevated:#EAE5DB;--action-primary:#047857;'
               '--action-primary-hover:#065F46;--text-primary:#2A2724;'
               '--text-secondary:#5E584F;',
        'css_dark': '--primitive-font-display:Georgia,'
                    '"Times New Roman",serif;'
                    '--font-display:Georgia,"Times New Roman",serif;'
                    '--flow-spacing:var(--space-l);'
                    '--grid-gap:var(--space-l);'
                    '--content-gap:var(--space-l);'
                    '--section-space-m:var(--section-space-l);'
                    '--bg-canvas:#17140F;--bg-surface:#1F1B15;'
                    '--bg-elevated:#282319;--border-default:#3A342B;'
                    '--text-primary:#EFE9DF;--text-secondary:#A89F92;'
                    '--action-primary:#34D399;'
                    '--action-primary-hover:#6EE7B7;'
                    '--action-primary-ink:#0C231B;',
        'theme': None},
    'gloss': {
        'name': 'Gloss', 'genes': ['rounded', 'elevated', 'vivid'],
        'desc': 'big radius, real shadows, violet accent',
        'shape': '.wf-hero-1 .hero-1-container{display:flex;'
                 'flex-direction:row-reverse;align-items:center;'
                 'gap:var(--space-l)}'
                 '.wf-hero-1 figure{flex:1}'
                 '.wf-hero-1 .hero-1__content{flex:1}'
                 '.wf-hero-1 .media-round{border-radius:2rem}',
        'css': '--radius:1.125rem;--primitive-radius:1.125rem;'
               '--r-card:1.125rem;--action-primary:#7C3AED;'
               '--action-primary-hover:#6D28D9;'
               '--shadow-card:0 18px 45px -18px rgb(0 0 0/.30);'
               '--shadow-pop:0 30px 70px -22px rgb(0 0 0/.38);',
        'css_dark': '--radius:1.125rem;--primitive-radius:1.125rem;'
                    '--r-card:1.125rem;--bg-canvas:#120E1C;'
                    '--bg-surface:#1A1428;--bg-elevated:#221A36;'
                    '--border-default:#352A52;'
                    '--action-primary:#A78BFA;'
                    '--action-primary-hover:#C4B5FD;'
                    '--action-primary-ink:#1E1145;'
                    '--shadow-card:0 18px 45px -18px rgb(0 0 0/.55);'
                    '--shadow-pop:0 30px 70px -22px rgb(0 0 0/.62);',
        'theme': None},
    'tight': {
        'name': 'Tight', 'genes': ['dense', 'compact', 'small-type'],
        'desc': 'one rung tighter, hairline radius, restrained',
        'shape': '.wf-hero-1 .hero-1-container{display:grid;'
                 'grid-template-columns:3fr 1fr;gap:var(--space-m);'
                 'align-items:center}'
                 '.counter-1-grid-ul,.gridcard-1-grid-ul{'
                 'grid-template-columns:repeat(4,1fr)!important}',
        'css': '--radius:2px;--primitive-radius:2px;--r-card:2px;'
               '--flow-spacing:var(--space-s);--grid-gap:var(--space-s);'
               '--content-gap:var(--space-s);'
               '--section-space-m:var(--section-space-s);'
               '--section-space-s:var(--section-space-xs);'
               '--h1:calc(var(--text-xxl)*1.3);'
               '--btn-padding-block:.55em;',
        'css_dark': '--radius:2px;--primitive-radius:2px;--r-card:2px;'
                    '--flow-spacing:var(--space-s);'
                    '--grid-gap:var(--space-s);'
                    '--content-gap:var(--space-s);'
                    '--section-space-m:var(--section-space-s);'
                    '--section-space-s:var(--section-space-xs);'
                    '--h1:calc(var(--text-xxl)*1.3);'
                    '--btn-padding-block:.55em;',
        'theme': None},
    'warm': {
        'name': 'Warm', 'genes': ['terracotta', 'soft', 'inviting'],
        'desc': 'warm neutrals + terracotta accent, both modes',
        'shape': '.wf-hero-1 .hero-1-container{display:block;'
                 'text-align:center}'
                 '.wf-hero-1 figure{max-width:34rem;'
                 'margin:var(--space-l) auto 0}'
                 '.wf-hero-1 .hero-1__cta p{display:flex;'
                 'justify-content:center}'
                 '.wf-hero-1 .media-round{border-radius:1.5rem}',
        'css': '--bg-canvas:#FBF6F0;--bg-surface:#F4EDE4;'
               '--bg-elevated:#EBE2D6;--border-default:#E0D4C4;'
               '--text-primary:#38302A;--text-secondary:#7A6C5E;'
               '--action-primary:#C2410C;--action-primary-hover:#9A3412;'
               '--border-strong:#C4B3A0;',
        'css_dark': '--bg-canvas:#1B1611;--bg-surface:#241E17;'
                    '--bg-elevated:#2D261D;--border-default:#43392D;'
                    '--text-primary:#F0E8DD;--text-secondary:#B0A391;'
                    '--action-primary:#F97316;'
                    '--action-primary-hover:#FB923C;'
                    '--action-primary-ink:#2A1303;'
                    '--border-strong:#575043;',
        'theme': None},
    'mono': {
        'name': 'Mono', 'genes': ['grayscale', 'flat', 'system'],
        'desc': 'accent removed, hairline grid, system type',
        'shape': '.wf-hero-1 .hero-1-container{display:block}'
                 '.wf-hero-1 figure{display:none}'
                 '.wf-hero-1 h1{text-transform:uppercase;'
                 'letter-spacing:-.02em;border-bottom:3px solid '
                 'var(--text-primary);padding-bottom:.4rem}'
                 '.card{border:1px solid var(--border-default);'
                 'box-shadow:none}',
        'css': '--primitive-font-display:ui-sans-serif,system-ui,'
               'sans-serif;--font-display:ui-sans-serif,system-ui,'
               'sans-serif;--primitive-font-body:ui-sans-serif,'
               'system-ui,sans-serif;--font-body:ui-sans-serif,'
               'system-ui,sans-serif;--radius:0;--primitive-radius:0;'
               '--r-card:0;--action-primary:#26292E;'
               '--action-primary-hover:#000;--display-weight:650;'
               '--shadow-card:none;--shadow-pop:none;',
        'css_dark': '--primitive-font-display:ui-sans-serif,system-ui,'
                    'sans-serif;--font-display:ui-sans-serif,system-ui,'
                    'sans-serif;--primitive-font-body:ui-sans-serif,'
                    'system-ui,sans-serif;--font-body:ui-sans-serif,'
                    'system-ui,sans-serif;--radius:0;'
                    '--primitive-radius:0;--r-card:0;'
                    '--action-primary:#E4E4E7;'
                    '--action-primary-hover:#FFFFFF;'
                    '--action-primary-ink:#18181B;--display-weight:650;'
                    '--shadow-card:none;--shadow-pop:none;',
        'theme': None},
    'editorial': {
        'name': 'Editorial', 'genes': ['big-type', 'serif', 'red'],
        'desc': 'oversized serif display, crimson accent',
        'shape': '.wf-hero-1 .hero-1-container{display:grid;'
                 'grid-template-columns:1.6fr 1fr;'
                 'gap:var(--space-l);align-items:end}'
                 '.wf-hero-1 h1{border-left:6px solid '
                 'var(--action-primary);padding-left:.5em}'
                 '.counter-1-card,.gridcard-1-card{border-top:2px '
                 'solid var(--border-default);box-shadow:none}',
        'css': '--primitive-font-display:Georgia,"Times New Roman",'
               'serif;--font-display:Georgia,"Times New Roman",serif;'
               '--h1:calc(var(--text-xxl)*1.9);'
               '--h2:calc(var(--text-xl)*1.55);'
               '--h3:calc(var(--text-l)*1.5);'
               '--display-weight:800;--tracking-display:-.05em;'
               '--radius:0;--primitive-radius:0;--r-card:0;'
               '--action-primary:#B91C1C;--action-primary-hover:#991B1B;'
               '--shadow-card:none;--shadow-pop:none;',
        'css_dark': '--primitive-font-display:Georgia,'
                    '"Times New Roman",serif;'
                    '--font-display:Georgia,"Times New Roman",serif;'
                    '--h1:calc(var(--text-xxl)*1.9);'
                    '--h2:calc(var(--text-xl)*1.55);'
                    '--h3:calc(var(--text-l)*1.5);--display-weight:800;'
                    '--tracking-display:-.05em;--radius:0;'
                    '--primitive-radius:0;--r-card:0;'
                    '--action-primary:#F87171;'
                    '--action-primary-hover:#FCA5A5;'
                    '--action-primary-ink:#2B0A0A;'
                    '--shadow-card:none;--shadow-pop:none;',
        'theme': None},
}

# fixed kitchen-sink row set for the vibe scrub (standard landing)
_SINK_ORDER = ('nav-bar', 'stacked-hero', 'cards-n', 'split-media',
               'stat-band', 'faq', 'form-panel', 'footer-bar')


# ------------------------------------------------------------------
# design-file readers
# ------------------------------------------------------------------
def _load_yaml(p):
    try:
        import site_folder as SF
        return SF.load_yaml(p) or {}
    except Exception:
        return {}


def _brief_file(ctx):
    p = ctx.find('BRIEF.yaml')
    return _load_yaml(p) if p else {}


def _json_at(*parts):
    p = os.path.join(*parts)
    if os.path.isfile(p):
        try:
            return json.load(open(p, encoding='utf-8'))
        except Exception:
            return None
    return None


# ------------------------------------------------------------------
# element previews — extract each data-comp block from the built
# system sheet into a standalone preview page under site/dist
# ------------------------------------------------------------------
class _CompBlocks(html.parser.HTMLParser):
    """Balanced-tag extractor: yields (comp, outer_html) for each
    element carrying data-comp="<name>" — header/nav/footer/section/
    div alike — the comp wrappers the emit machinery produces."""
    VOID = {'br', 'hr', 'img', 'input', 'meta', 'link', 'source',
            'wbr', 'area', 'base', 'col', 'embed', 'track', 'param'}

    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.blocks = []
        self._cap = None        # dict when capturing
        self._depth = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if self._cap is None:
            if a.get('data-comp'):
                self._cap = {'comp': a['data-comp'], 'buf': [],
                             'tag': tag,
                             'sec': a.get('data-sec', ''),
                             'bid': (a.get('data-content') or '')
                             .lstrip('c-')}
                self._depth = 1
                self._cap['buf'].append(self.get_starttag_text())
            return
        self._cap['buf'].append(self.get_starttag_text())
        if tag not in self.VOID:
            self._depth += 1

    def handle_startendtag(self, tag, attrs):
        if self._cap is None:
            a = dict(attrs)
            if a.get('data-comp'):
                self.blocks.append(
                    (a['data-comp'], a.get('data-sec', ''),
                     (a.get('data-content') or '').lstrip('c-'),
                     self.get_starttag_text()))
            return
        self._cap['buf'].append(self.get_starttag_text())

    def handle_endtag(self, tag):
        if self._cap is None:
            return
        self._cap['buf'].append(f'</{tag}>')
        if tag not in self.VOID:
            self._depth -= 1
            if self._depth == 0:
                self.blocks.append(
                    (self._cap['comp'], self._cap['sec'],
                     self._cap['bid'],
                     ''.join(self._cap['buf'])))
                self._cap = None

    def handle_data(self, data):
        if self._cap is not None:
            self._cap['buf'].append(data)

    def handle_entityref(self, name):
        if self._cap is not None:
            self._cap['buf'].append(f'&{name};')

    def handle_charref(self, name):
        if self._cap is not None:
            self._cap['buf'].append(f'&#{name};')

    def handle_comment(self, data):
        if self._cap is not None:
            self._cap['buf'].append(f'<!--{data}-->')


def _source_docs(pd):
    """[(txt, head, body_attrs), ...] — the real built page first
    (content-bound comps), the system sheet second (slot-empty
    skeletons for comps the plan didn't use)."""
    dist = os.path.join(pd, 'site', 'dist')
    out = []
    for fn in sorted(os.listdir(dist)) if os.path.isdir(dist) else []:
        fp = os.path.join(dist, fn, 'index.html')
        if fn in ('preview', 'system', 'design-system') or \
                not os.path.isfile(fp):
            continue
        txt = open(fp, encoding='utf-8', errors='replace').read()
        head = re.search(r'<head>(.*?)</head>', txt, re.S | re.I)
        body = re.search(r'<body([^>]*)>', txt, re.I)
        out.append((txt, head.group(1) if head else '',
                    body.group(1) if body else ''))
    sp = os.path.join(dist, 'system', 'index.html')
    if os.path.isfile(sp):
        txt = open(sp, encoding='utf-8', errors='replace').read()
        head = re.search(r'<head>(.*?)</head>', txt, re.S | re.I)
        # the sheet is a bare block list — no <head>: synthesize the
        # preview head from its own stylesheet link + the U.3 theme
        # contract so ?theme=dark works inside the frame
        css = re.search(r'<link[^>]*stylesheet[^>]*>', txt)
        sheet_head = ((head.group(1) if head else '') +
                      (css.group(0) if css else '') +
                      '<script>(function(){var m=new URLSearchParams('
                      'location.search).get("theme")||localStorage.'
                      'getItem("theme")||"light";document.'
                      'documentElement.dataset.theme=m;document.'
                      'documentElement.classList.toggle("dark",'
                      'm==="dark")})()</script>')
        out.append((txt, sheet_head, ''))
    return out


def _comp_blocks(pd):
    """{comp: (block_html, head, body_attrs)} — every data-comp
    block from the source docs, first-source wins, plus
    rows = [(sec, content_id, comp, block, head, battr)] in the
    real page's section order."""
    blocks, rows = {}, []
    for i, (txt, head, body_attrs) in enumerate(_source_docs(pd)):
        prs = _CompBlocks()
        prs.feed(txt)
        for comp, sec, bid, block in prs.blocks:
            blocks.setdefault(comp, (block, head, body_attrs))
            if i == 0:
                rows.append((sec, bid, comp, block, head, body_attrs))
    return blocks, rows


def emit_element_previews(pd):
    """Emit site/dist/preview/elements/<comp>.html (+ behavioural
    variants) from the built page(s) / system sheet. Idempotent;
    returns {comp: relpath}."""
    outdir = os.path.join(pd, 'site', 'dist', 'preview', 'elements')
    blocks, _rows = _comp_blocks(pd)
    if not blocks:
        return {}
    os.makedirs(outdir, exist_ok=True)

    emitted = {}
    for comp, (block, head, battr) in blocks.items():
        fp = os.path.join(outdir, comp + '.html')
        with open(fp, 'w', encoding='utf-8') as fh:
            fh.write(_doc(head, battr, block))
        emitted[comp] = f'preview/elements/{comp}.html'
        if comp in _NAV_COMPS:
            # the collapsed-nav surface, forced open — menu board.
            # Geometry topos of the same open flyout: the .nav-links
            # .open surface is a fixed docked panel — docking side,
            # width and orientation are CSS-geometry choices, all
            # inside the family's token space.
            open_js = ('<script>(function(){var n='
                       'document.querySelector('
                       '".nav-links");if(n)n.classList.'
                       'add("open");})()</script>')
            # desktop surface — the nav as a bar, drawer never forced
            # open: burger hidden, links inline (menu board at D)
            _MENU_DESK = ('.burger,.nav-close{display:none !important}'
                          '.nav-links{position:static !important;'
                          'display:flex !important;transform:none '
                          '!important;visibility:visible !important;'
                          'opacity:1 !important;width:auto '
                          '!important;max-height:none !important;'
                          'inset:auto !important;border:0 !important;'
                          'box-shadow:none !important;padding:0 '
                          '!important;background:transparent '
                          '!important}')
            fp = os.path.join(outdir, comp + '-menu-desktop.html')
            with open(fp, 'w', encoding='utf-8') as fh:
                fh.write(_doc(head, battr, block, '', _MENU_DESK))
            emitted[comp + '-menu-desktop'] = \
                f'preview/elements/{comp}-menu-desktop.html'
            for topo, gcss in _MENU_TOPOS.items():
                fp = os.path.join(
                    outdir, comp + '-menu' + ('-' + topo if topo else '')
                    + '.html')
                with open(fp, 'w', encoding='utf-8') as fh:
                    fh.write(_doc(head, battr, block, open_js, gcss))
                emitted[comp + '-menu' + ('-' + topo if topo else '')] = \
                    f'preview/elements/{comp}-menu' + \
                    ('-' + topo if topo else '') + '.html'
        if comp == 'modal-form' or '.flyout' in block:
            fp = os.path.join(outdir, comp + '-open.html')
            with open(fp, 'w', encoding='utf-8') as fh:
                fh.write(_doc(head, battr, block,
                             '<script>(function(){var f='
                             'document.querySelector('
                             '".flyout");if(f)f.classList.'
                             'add("open");})()</script>'))
            emitted[comp + '-open'] = \
                f'preview/elements/{comp}-open.html'
    return emitted


# ------------------------------------------------------------------
# vibe emit — kitchen-sink page per family (fragments are served
# through /frame for every OTHER preview, so nothing needs files)
# ------------------------------------------------------------------
def _topo_variants(block, comp):
    """[(topo_id, markup, extra_css)] — structural alternatives
    emitted from the same skeleton: media side / full-bleed /
    text-only. A variant is a markup class flip or a layout-rule
    injection — token-bound, no new skeletons invented."""
    out = [('as-built', block, '')]
    if 'class="split' in block:
        if 'media-first' in block:
            flip = block.replace('split media-first', 'split', 1)
            out.append(('media-last', flip, ''))
        else:
            flip = block.replace('class="split"',
                                 'class="split media-first"', 1)
            out.append(('media-first', flip, ''))
        out.append(('text-wide', block,
                    'figure{display:none!important}'
                    '.split{grid-template-columns:1fr!important}'))
    elif 'hero-1-container' in block:
        out.append(('media-left', block,
                    '.hero-1-container{direction:rtl}'
                    '.hero-1-container>*{direction:ltr}'))
        out.append(('centered', block,
                    '.hero-1-container{grid-template-columns:1fr!'
                    'important;text-align:center}'
                    '.hero-1-container>div:nth-child(2)'
                    '{display:none!important}'))
        out.append(('media-bg', block,
                    '.hero-1-container{grid-template-columns:1fr!'
                    'important;position:relative}'
                    '.hero-1-container>div:nth-child(2){position:'
                    'absolute;inset:0;z-index:0;opacity:.22}'
                    '.hero-1-container>div:nth-child(2) figure,'
                    '.hero-1-container>div:nth-child(2) .media-round'
                    '{height:100%}.hero-1__content{position:relative;'
                    'z-index:1}'))
    elif '<figure' in block:
        out.append(('media-flip', block,
                    '[data-comp="' + comp + '"]{direction:rtl}'
                    '[data-comp="' + comp + '"] *{direction:ltr}'))
        out.append(('text-wide', block,
                    'figure{display:none!important}'))
    return out


# the menu trigger is a designed affordance, not a text pill — the
# bank's .burger renders "Menu" text; this turns it into a hamburger
# icon button bound to tokens, applied to every emitted preview doc
_CHROME_CSS = (
    '.burger{display:inline-flex;align-items:center;'
    'justify-content:center;width:44px;height:44px;min-width:44px;'
    'min-height:44px;padding:0!important;font-size:0!important;'
    'border:1px solid var(--border-default);'
    'border-radius:var(--radius,10px);background:var(--bg-elevated);'
    'color:var(--text-primary);box-shadow:none!important;'
    'cursor:pointer}'
    '.burger::after{content:"";width:20px;height:14px;'
    'background:repeating-linear-gradient(to bottom,'
    'currentColor 0 2px,transparent 2px 6px)}')


def _doc(head, battr, inner, extra='', css=''):
    style = '<style>' + _CHROME_CSS + (css or '') + '</style>'
    return ('<!doctype html><html lang="en"><head>' + head + style +
            '</head><body' + (battr or '') + '>' + inner + extra +
            '</body></html>')


def _fam_css(f):
    """a family's full bundle: :root overrides + dark overrides +
    the structural 'shape' layer (per-family hero topology /
    arrangement, derived since the bank has one hero skeleton)."""
    return ('' if not f['css'] else
            ':root{' + f['css'] + '}'
            '[data-theme="dark"]{' + f['css_dark'] + '}'
            + (f.get('shape') or ''))


def emit_vibe_previews(pd):
    """preview/vibes/<fam>.html — the standard row set under each
    family's var bundle. Returns {fam: relpath}."""
    outdir = os.path.join(pd, 'site', 'dist', 'preview', 'vibes')
    blocks, _rows = _comp_blocks(pd)
    if not blocks:
        return {}
    head, battr = blocks[next(iter(blocks))][1:3]
    body = ''
    for comp in _SINK_ORDER:
        if comp in blocks:
            body += blocks[comp][0]
    os.makedirs(outdir, exist_ok=True)
    emitted = {}
    for fam, f in VIBE_FAMILIES.items():
        css = _fam_css(f)
        theme = ('<script>document.documentElement.dataset.theme='
                 '"dark";document.documentElement.classList.add('
                 '"dark")</script>' if f['theme'] == 'dark' else '')
        with open(os.path.join(outdir, fam + '.html'), 'w',
                  encoding='utf-8') as fh:
            fh.write(_doc(head, battr, body, theme, css))
        emitted[fam] = f'preview/vibes/{fam}.html'
    return emitted


# ------------------------------------------------------------------
# slot-bound fragments — the §4.3 CopySlot contract rendered
# statically for bank comps the plan didn't emit. Each mirrors its
# gold-exemplar skeleton (templates/sections/<comp>/*.astro); a slot
# with no mapped copy renders a visibly-marked lorem so the hole
# shows. Returns (markup, unmapped_slots).
# ------------------------------------------------------------------
_COPY_KEYS = ('answer', 'before', 'items', 'list_ordered', 'qa',
              'links', 'after')
class _Raw(str):
    """Value-level "already markup" marker for machinery-built
    sentinels — a `_raw` dict key could be forged via COPY.json into
    an escaping bypass; a str subclass cannot cross JSON, so only
    values WE construct skip escaping."""


_L = ('<em class="wf-lorem" data-slot="{s}">Lorem ipsum — '
      'unmapped {s}</em>')
_LOREM_CSS = ('.wf-lorem{display:inline-block;outline:1px dashed '
              'var(--action-primary,#999);outline-offset:2px;'
              'font-style:italic;opacity:.75;padding:0 .3em;'
              'border-radius:3px}')


def _inline(s):
    t = str(s or '').replace('&', '&amp;').replace('<', '&lt;') \
        .replace('>', '&gt;').replace('"', '&quot;')
    t = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'\[([^\]]+)\]\(([^)\s]+)\)',
               r'<a href="\2">\1</a>', t)
    return t


def _val(v):
    """bind a slot value: machinery _Raw passes through untouched,
    anything JSON-decoded is escaped via _inline"""
    return str(v) if isinstance(v, _Raw) else _inline(v)


def _copy_slot(pd, bid):
    """COPY.json block → §4.3 slot dict (pipeline_emit._copy_slot's
    contract). bid 'b01' → blocks[id=='b01']."""
    cj = _json_at(pd, 'COPY.json')
    if not cj or not bid:
        return None
    blk = next((b for b in cj.get('blocks') or []
                if b.get('id') == bid), None)
    if blk is None:
        return None
    slot = {'heading': blk.get('h2') or ''}
    for k in _COPY_KEYS:
        v = blk.get(k)
        if k == 'list_ordered':
            slot[k] = bool(v)
        else:
            slot[k] = v if v is not None else (
                '' if k == 'answer' else [])
    # items[] fallback — a block with a term list but no items[]
    # still carries real copy: terms become card titles, the first
    # sentence mentioning each term becomes its text (the §4.3
    # tagger's mechanical fill, not invented copy)
    if not slot.get('items'):
        terms = blk.get('terms') or []
        if terms:
            sents = []
            for para in (blk.get('before') or []) +                     [blk.get('answer') or '']:
                sents += [x.strip() for x in
                          re.split(r'(?<=[.!?])\s+', para) if x.strip()]
            slot['items'] = [
                {'term': t if len(t) < 60 else t[:57] + '…',
                 'text': next(
                     (x for x in sents if t.lower() in x.lower()),
                     '')}
                for t in terms]
            slot['items_from'] = 'terms'
    # media slot — first real asset in the pipeline's media dir
    md = os.path.join(pd, 'site', 'dist', 'media')
    if os.path.isdir(md):
        imgs = sorted(f for f in os.listdir(md)
                      if os.path.splitext(f)[1].lower() in
                      ('.jpg', '.jpeg', '.png', '.webp', '.avif')
                      and 'placeholder' not in f)
        if imgs:
            slot['media'] = '/built/' + urllib.parse.quote(
                os.path.join(pd, 'site', 'dist', 'media', imgs[0]))
    return slot


def _iterm(i):
    return (i or {}).get('term') or (i or {}).get('title') or ''


def _slot_frag(comp, slot):
    """Static render of a bank comp's skeleton bound to `slot`.
    Mirrors templates/sections/<comp>/*.astro markup + classes."""
    slot = slot or {}
    unmapped = []

    def req(name, val):
        if val:
            return _inline(val)
        unmapped.append(name)
        return _L.format(s=name)

    head = req('heading', slot.get('heading'))
    sub = slot.get('answer') or ''
    before = slot.get('before') or []
    items = slot.get('items') or []
    links = [l.get('text') or f"[{l.get('anchor','')}]({l.get('href','')})"
             for l in (slot.get('links') or [])]
    after = slot.get('after') or []
    ordered = bool(slot.get('list_ordered'))

    h = ''
    if comp == 'editorial':
        h += '<div><div class="max-w-prose">'
        h += f'<h2 class="text-fluid-3">{head}</h2>'
        if sub:
            h += f'<p class="mt-stack lede">{_inline(sub)}</p>'
        h += ''.join(f'<p class="mt-stack text-fluid-0">'
                     f'{_inline(p)}</p>' for p in before)
        if items:
            tag = 'ol' if ordered else 'ul'
            h += f'<{tag} class="mt-stack list-items text-fluid-0">' + \
                ''.join(f'<li><strong>{_inline(i.get("term") or i.get("title") or "")}</strong>'
                        f' – <span>{_inline(i.get("text") or "")}</span></li>'
                        for i in items) + f'</{tag}>'
        h += ''.join(f'<p class="mt-stack text-fluid-0">'
                     f'{_inline(t)}</p>' for t in links)
        h += ''.join(f'<p class="mt-stack text-fluid-0">'
                     f'{_inline(p)}</p>' for p in after)
        h += '</div></div>'
    elif comp == 'text-index':
        h += '<div><div class="max-w-prose">'
        h += f'<h2 class="text-fluid-3">{head}</h2>'
        if sub:
            h += f'<p class="mt-stack text-fluid-0">{_inline(sub)}</p>'
        h += ''.join(f'<p class="mt-stack text-fluid-0">'
                     f'{_inline(p)}</p>' for p in before)
        h += '</div>'
        its = items or [{'term': _Raw(_L.format(s='items[]')),
                         'text': _Raw(_L.format(s='items[]'))}
                        for _i in range(3)]
        if not items:
            unmapped.append('items')
        h += '<dl class="mt-stack grid-auto text-fluid-0">' + \
            ''.join(f'<dt><strong>{_val(i.get("term") or i.get("title") or "")}</strong></dt>'
                    f'<dd>{_val(i.get("text") or "")}</dd>'
                    for i in its) + '</dl>'
        h += '<div class="max-w-prose">' + \
            ''.join(f'<p class="mt-stack text-fluid-0">'
                    f'{_inline(t)}</p>' for t in links) + \
            ''.join(f'<p class="mt-stack text-fluid-0">'
                    f'{_inline(p)}</p>' for p in after) + '</div></div>'
    elif comp == 'proof-band':
        stat = next((i for i in items if i.get('value')), None)
        voice = next((i for i in items if i.get('quote')), None)
        quote = voice['quote'] if voice else (before[0] if before else '')
        rest = before if voice else before[1:]
        h += '<div>'
        h += f'<h2 class="text-fluid-3">{head}</h2>'
        if sub:
            h += f'<p class="mt-stack max-w-prose text-fluid-0">' \
                 f'{_inline(sub)}</p>'
        h += '<div class="mt-stack flex flex-wrap items-center ' \
             'justify-between gap-stack">'
        if stat:
            h += '<div class="row"><p class="text-fluid-1 t0">' \
                 f'<span class="font-bold">{_inline(stat["value"])}' \
                 '</span>'
            if stat.get('label'):
                h += f' <span class="text-fluid--1">' \
                     f'{_inline(stat["label"])}</span>'
            h += '</p></div>'
        else:
            h += f'<div class="row"><p class="text-fluid-1 t0">' \
                 f'{_L.format(s="stat")}</p></div>'
            unmapped.append('stat')
        h += f'<blockquote class="max-w-prose text-fluid-0">' \
             f'{_inline(quote) if quote else _L.format(s="quote")}' \
             '</blockquote>'
        if not quote:
            unmapped.append('quote')
        h += '</div>'
        h += ''.join(f'<p class="mt-stack max-w-prose text-fluid-0">'
                     f'{_inline(p)}</p>' for p in rest)
        if links:
            h += '<ul class="mt-stack grid-auto list-plain ' \
                 'text-fluid-0">' + ''.join(
                     f'<li>{_inline(t)}</li>' for t in links) + '</ul>'
        h += ''.join(f'<p class="mt-stack max-w-prose text-fluid-0">'
                     f'{_inline(p)}</p>' for p in after)
        h += '</div>'
    elif comp == 'quote-grid':
        h += '<div><div class="sec-head">' \
             f'<h2 class="text-fluid-3">{head}</h2>'
        if sub:
            h += f'<p class="lede">{_inline(sub)}</p>'
        h += '</div>'
        h += ''.join(f'<p class="mt-stack max-w-prose text-fluid-0">'
                     f'{_inline(p)}</p>' for p in before)
        its = items or [{'quote': _Raw(_L.format(s='items[].quote')),
                         'who': _Raw(_L.format(s='items[].who'))}]
        if not items:
            unmapped.append('items')
        h += '<ul class="mt-sec grid-auto list-plain">' + \
            ''.join('<li class="card"><p class="t0 quote">“' +
                    _val(i.get('quote') or i.get('text') or '') +
                    '”</p><div class="quote-foot"><span>' +
                    _val(i.get('who') or '') +
                    ((' · ' + _inline(i['source']))
                     if i.get('source') else '') +
                    '</span></div></li>' for i in its) + '</ul>'
        h += ''.join(f'<p class="mt-stack max-w-prose text-fluid-0">'
                     f'{_inline(p)}</p>' for p in after)
        h += '</div>'
    elif comp == 'cards-n':
        h += '<div><div class="sec-head">' \
             f'<h2 class="text-fluid-3">{head}</h2>'
        if sub:
            h += f'<p class="lede">{_inline(sub)}</p>'
        h += ''.join(f'<p class="t0 sub-p">{_inline(p)}</p>'
                     for p in before) + '</div>'
        its = items or [{'term': _Raw(_L.format(s='items[]')),
                         'text': _Raw(_L.format(s='items[]'))}
                        for _i in range(3)]
        if not items:
            unmapped.append('items')
        h += '<ul class="mt-sec grid-auto list-plain">' + \
            ''.join(f'<li class="card"><span class="num">'
                    f'{n + 1:02d}</span><h3 class="t0 sub-h">'
                    f'{_val(i.get("term") or i.get("title") or "")}'
                    f'</h3><p class="t0 sub-p">'
                    f'{_val(i.get("text") or "")}</p></li>'
                    for n, i in enumerate(its)) + '</ul>'
        h += ''.join(f'<p class="mt-stack max-w-prose text-fluid-0">'
                     f'{_inline(p)}</p>' for p in after) + '</div>'
    elif comp == 'sequence':
        h += '<div><div class="sec-head">' \
             f'<h2 class="text-fluid-3">{head}</h2>'
        if sub:
            h += f'<p class="lede">{_inline(sub)}</p>'
        h += ''.join(f'<p class="t0 sub-p">{_inline(p)}</p>'
                     for p in before) + '</div>'
        its = items or [{'term': _Raw(_L.format(s='items[]')),
                         'text': _Raw(_L.format(s='items[]'))}
                        for _i in range(3)]
        if not items:
            unmapped.append('items')
        h += '<ol class="flow-list mt-sec list-plain">' + \
            ''.join(f'<li class="flow-row"><span class="num '
                    f'num-prom">{n + 1:02d}</span><div>'
                    f'<h3 class="t0 sub-h">'
                    f'{_val(i.get("term") or i.get("title") or "")}'
                    f'</h3><p class="t0 sub-p sub-flow">'
                    f'{_val(i.get("text") or "")}</p></div></li>'
                    for n, i in enumerate(its)) + '</ol>'
        h += ''.join(f'<p class="t0 sub-p">{_inline(t)}</p>'
                     for t in links)
        h += ''.join(f'<p class="t0 sub-p">{_inline(p)}</p>'
                     for p in after) + '</div>'
    elif comp == 'comparison':
        h += '<div>' \
             f'<h2 class="text-fluid-3">{head}</h2>'
        if sub:
            h += f'<p class="mt-stack max-w-prose text-fluid-0">' \
                 f'{_inline(sub)}</p>'
        its = items or [{'term': _Raw(_L.format(s='items[]')),
                         'text': _Raw(_L.format(s='items[]'))}
                        for _i in range(3)]
        if not items:
            unmapped.append('items')
        h += '<div class="mt-fluid-l grid gap-stack ' \
             'md:grid-cols-2">' + \
            ''.join(f'<div class="card"><h3 class="t0 sub-h">'
                    f'{_val(i.get("term") or i.get("title") or "")}'
                    f'</h3><p class="mt-fluid-s text-fluid-0">'
                    f'{_val(i.get("text") or "")}</p></div>'
                    for i in its) + '</div>'
        for seq in (before, after):
            h += ''.join(f'<p class="mt-stack max-w-prose text-fluid-0">'
                         f'{_inline(p)}</p>' for p in seq)
        if links:
            h += '<ul class="mt-stack grid-auto list-plain ' \
                 'text-fluid-0">' + ''.join(
                     f'<li>{_inline(t)}</li>' for t in links) + '</ul>'
        h += '</div>'
    elif comp == 'stat-band':
        h += '<div>' \
             f'<h2 class="text-fluid-3">{head}</h2>'
        if sub:
            h += f'<p class="mt-stack max-w-prose text-fluid-0">' \
                 f'{_inline(sub)}</p>'
        h += ''.join(f'<p class="mt-stack max-w-prose text-fluid-0">'
                     f'{_inline(p)}</p>' for p in before)
        stats = items
        if stats:
            h += '<dl class="mt-stack grid-auto gap-stack">' + \
                ''.join(f'<div><dd class="text-fluid-4 font-bold">'
                        f'{_inline(i.get("value") or i.get("term") or "")}'
                        f'</dd><dt class="mt-fluid-s text-fluid--1">'
                        f'{_inline(i.get("label") or i.get("text") or "")}'
                        '</dt></div>' for i in stats) + '</dl>'
        else:
            unmapped.append('items')
        if links:
            h += '<ul class="mt-stack grid-auto list-plain ' \
                 'text-fluid-0">' + ''.join(
                     f'<li>{_inline(t)}</li>' for t in links) + '</ul>'
        h += ''.join(f'<p class="mt-stack max-w-prose text-fluid-0">'
                     f'{_inline(p)}</p>' for p in after) + '</div>'
    elif comp == 'link-grid':
        h += '<div>' \
             f'<h2 class="text-fluid-3">{head}</h2>'
        if sub:
            h += f'<p class="mt-stack max-w-prose text-fluid-0">' \
                 f'{_inline(sub)}</p>'
        h += ''.join(f'<p class="mt-stack max-w-prose text-fluid-0">'
                     f'{_inline(p)}</p>' for p in before)
        if links:
            h += '<ul class="mt-stack grid-auto list-plain ' \
                 'text-fluid-0">' + ''.join(
                     f'<li>{_inline(t)}</li>' for t in links) + '</ul>'
        else:
            unmapped.append('links')
        if items:
            h += '<ul class="mt-stack max-w-prose list-items ' \
                 'text-fluid-0">' + \
                ''.join(f'<li><strong>{_inline(_iterm(i))}</strong>'
                        f' – <span>{_inline(i.get("text") or "")}'
                        '</span></li>' for i in items) + '</ul>'
        h += ''.join(f'<p class="mt-stack max-w-prose text-fluid-0">'
                     f'{_inline(p)}</p>' for p in after) + '</div>'
    elif comp == 'faq':
        h += '<div><div class="sec-head">' \
             f'<h2 class="text-fluid-3">{head}</h2>'
        if sub:
            h += f'<p class="lede">{_inline(sub)}</p>'
        h += ''.join(f'<p class="t0 sub-p">{_inline(p)}</p>'
                     for p in before) + '</div>'
        qas = slot.get('qa') or []
        if not qas:
            qas = [{'q': _Raw(_L.format(s='qa[]')),
                    'a': _Raw(_L.format(s='qa[]'))}]
            unmapped.append('qa')
        h += '<div class="mt-sec">' + \
            ''.join(f'<details class="faq-item"><summary '
                    f'class="faq-q">{_val(q.get("q") or "")}'
                    f'</summary><p class="t0 faq-a">'
                    f'{_val(q.get("a") or "")}</p></details>'
                    for q in qas) + '</div>'
        h += ''.join(f'<p class="t0 sub-p">{_inline(t)}</p>'
                     for t in links)
        h += ''.join(f'<p class="t0 sub-p">{_inline(p)}</p>'
                     for p in after) + '</div>'
    elif comp == 'form-panel':
        h += '<div class="split"><div class="stack">' \
             f'<h2 class="t0 h-section text-fluid-3">{head}</h2>'
        for p in before:
            h += f'<p class="t0 lede">{_inline(p)}</p>'
        if sub:
            h += f'<p class="t0 lede">{_inline(sub)}</p>'
        for p in after:
            h += f'<p class="t0 lede">{_inline(p)}</p>'
        h += ('</div><form class="stack form" onsubmit="return false">'
              '<input class="input" placeholder="Name">'
              '<input class="input" placeholder="Email">'
              '<textarea class="input" rows="4" placeholder="Message">'
              '</textarea><button class="btn" type="submit">'
              'Get in touch</button></form></div>')
    elif comp == 'split-media':
        h += '<div class="split"><div class="stack">' \
             f'<h2 class="text-fluid-3">{head}</h2>'
        if sub:
            h += f'<p class="t0 lede">{_inline(sub)}</p>'
        for p in before:
            h += f'<p class="t0 lede">{_inline(p)}</p>'
        if items:
            h += '<ul class="mt-stack list-items text-fluid-0">' + \
                ''.join(f'<li><strong>{_inline(_iterm(i))}</strong>'
                        f' – <span>{_inline(i.get("text") or "")}'
                        '</span></li>' for i in items) + '</ul>'
        for p in after:
            h += f'<p class="t0 lede">{_inline(p)}</p>'
        if slot.get('media'):
            h += ('</div><figure class="media-round"><img src="' +
                  _inline(slot['media']) +
                  '" alt="" style="width:100%;height:100%;'
                  'object-fit:cover;display:block">'
                  '</figure></div>')
        else:
            h += ('</div><figure class="media-round"><div '
                  'class="ph-media wf-lorem" data-slot="media">'
                  'media slot</div></figure></div>')
    elif comp == 'modal-form':
        # mirrors ModalForm.astro — sec-head + trigger + the open
        # .flyout dialog (fields ride items[].term)
        h += '<div class="stack"><div class="sec-head">' \
             f'<h2 class="text-fluid-3">{head}</h2>'
        if sub:
            h += f'<p class="lede">{_inline(sub)}</p>'
        h += '</div>'
        its = items or [{'term': _Raw(_L.format(s='fields[]'))}]
        if not items:
            unmapped.append('fields')
        h += ('<div class="flyout open" role="dialog" aria-modal="true">'
              '<button class="flyout-close" type="button" '
              'aria-label="Close">&times;</button>'
              f'<h3 class="text-fluid-1">{head}</h3><form novalidate>' +
              ''.join(f'<label class="text-fluid-0">'
                      f'{_val(i.get("term") or i.get("title") or "")}'
                      f'<input name="f{n}" type="text" /></label>'
                      for n, i in enumerate(its)) +
              f'<button class="wf-cta-button" type="submit">'
              f'{_L.format(s="cta")}</button></form></div></div>')
        unmapped.append('cta')
    else:
        return _generic_frag(slot, unmapped), unmapped
    return h, unmapped


def _generic_frag(slot, unmapped):
    """Neutral content-band render of a section's slot copy — used
    when an allowed comp has neither an emitted block for this
    section nor a bespoke mirror: the copy is real and section-
    bound, the band is a plain topology approximation."""
    slot = slot or {}
    h = '<div><div class="max-w-prose">'
    head = slot.get('heading')
    if head:
        h += f'<h2 class="text-fluid-3">{_inline(head)}</h2>'
    if slot.get('answer'):
        h += f'<p class="mt-stack lede">{_inline(slot["answer"])}</p>'
    for p in slot.get('before') or []:
        h += f'<p class="mt-stack text-fluid-0">{_inline(p)}</p>'
    its = slot.get('items') or []
    if its:
        h += '<ul class="mt-stack list-items text-fluid-0">' + \
            ''.join(f'<li><strong>'
                    f'{_inline(i.get("term") or i.get("title") or "")}'
                    f'</strong> – <span>{_inline(i.get("text") or "")}'
                    '</span></li>' for i in its) + '</ul>'
    for q in slot.get('qa') or []:
        h += ('<details class="mt-stack"><summary class="text-fluid-0">'
              f'{_inline(q.get("q") or q.get("term") or "")}</summary>'
              f'<p class="text-fluid-0">'
              f'{_inline(q.get("a") or q.get("text") or "")}</p>'
              '</details>')
    for t in slot.get('links') or []:
        h += f'<p class="mt-stack text-fluid-0">' \
             f'{_inline(t.get("text") or t.get("anchor") or "")}</p>'
    for p in slot.get('after') or []:
        h += f'<p class="mt-stack text-fluid-0">{_inline(p)}</p>'
    return h + '</div></div>'


def emit_section_fragments(pd):
    """preview/sections/<sec>/<comp>[--<topo>].html — every
    composition LAYOUT-OPTIONS allows per section plus the as-built
    comp's topology variants. Returns (spec_rows, bank_depth):
    spec_rows = [{sec, bid, comp, alts:[{id,preview}]}]
    bank_depth = [{sec, allowed, emitted, missing}]"""
    lo = _json_at(pd, 'LAYOUT-OPTIONS.json') or {}
    allowed = {k: list(dict.fromkeys(v or []))
               for k, v in (lo.get('allowed') or {}).items()}
    blocks, rows = _comp_blocks(pd)
    if not blocks:
        return [], []
    outdir = os.path.join(pd, 'site', 'dist', 'preview', 'sections')
    os.makedirs(outdir, exist_ok=True)
    spec, depth, seen = [], [], set()
    dist = os.path.join(pd, 'site', 'dist')
    for sec, bid, comp, block, head, battr in rows:
        if sec in seen or not sec or sec in ('nav', 'foot'):
            continue
        seen.add(sec)
        sdir = os.path.join(outdir, sec)
        os.makedirs(sdir, exist_ok=True)
        alts, emitted, missing = [], [], []
        unmapped_map = {}
        cand = list(dict.fromkeys(
            ([comp] if comp else []) + (allowed.get(bid) or [])))
        for c in cand:
            src = blocks.get(c) if c == comp else None
            if src:
                # only the row's OWN emitted comp carries this
                # section's copy — every other candidate renders its
                # skeleton bound to this block's §4.3 slots instead
                markup, bhead, battr, css = src[0], src[1], src[2], ''
            else:
                inner, unmap = _slot_frag(c, _copy_slot(pd, bid))
                if inner is None:
                    missing.append(c)
                    continue
                bhead, battr = rows[0][4], rows[0][5]
                markup = (f'<section class="sec-band surface-base '
                          f'density-regular" data-sec="{sec}" '
                          f'data-comp="{c}"><div class="sec-inner">'
                          + inner + '</div></section>')
                css = _LOREM_CSS
                if unmap:
                    unmapped_map[c] = unmap
            emitted.append(c)
            fp = os.path.join(sdir, c + '.html')
            with open(fp, 'w', encoding='utf-8') as fh:
                fh.write(_doc(bhead, battr, markup, css=css))
            rel = os.path.relpath(fp, dist)
            alts.append({'id': c, 'preview': rel})
            if c == comp:
                for topo, markup, tcss in _topo_variants(
                        src[0], c)[1:]:
                    fn = f'{c}--{topo}.html'
                    with open(os.path.join(sdir, fn), 'w',
                              encoding='utf-8') as fh:
                        fh.write(_doc(src[1], src[2], markup,
                                      css=tcss))
                    rel = os.path.relpath(
                        os.path.join(sdir, fn), dist)
                    alts.append({'id': f'{c}:{topo}', 'preview': rel})
        cur = [i for i, a in enumerate(alts) if a['id'] == comp]
        spec.append({'sec': sec, 'bid': bid, 'comp': comp,
                     'alts': alts, 'idx': cur[0] if cur else 0})
        depth.append({'sec': sec, 'allowed': allowed.get(bid) or [],
                      'emitted': emitted, 'missing': missing,
                      'unmapped': unmapped_map})
    return spec, depth


def emit_layout_previews(pd):
    """preview/layouts/<opt>.html — each LAYOUT-OPTIONS d-option
    rendered as the real stacked page: every block's chosen comp in
    plan order (the section's own emitted block where the option
    keeps it, else the comp's skeleton bound to that block's slots).
    Returns {option_id: dist-relative path}."""
    lo = _json_at(pd, 'LAYOUT-OPTIONS.json') or {}
    options = lo.get('options') or []
    blocks, rows = _comp_blocks(pd)
    if not options or not rows:
        return {}
    head, battr = rows[0][4], rows[0][5]
    outdir = os.path.join(pd, 'site', 'dist', 'preview', 'layouts')
    os.makedirs(outdir, exist_ok=True)
    dist = os.path.join(pd, 'site', 'dist')
    out = {}
    for o in options:
        oid = o.get('id')
        comp_map = o.get('compositions') or {}
        parts = []
        for sec, bid, comp, block, h2, b2 in rows:
            want = comp_map.get(bid, comp)
            if want == comp:
                parts.append(block)
                continue
            inner, _unmap = _slot_frag(want, _copy_slot(pd, bid))
            if inner is None:
                continue
            parts.append(
                '<section class="sec-band surface-base density-regular"'
                ' data-sec="' + str(sec) + '" data-comp="' + str(want) +
                '"><div class="sec-inner">' + inner +
                '</div></section>')
        if not parts:
            continue
        fp = os.path.join(outdir, str(oid) + '.html')
        with open(fp, 'w', encoding='utf-8') as fh:
            fh.write(_doc(head, battr, '\n'.join(parts),
                          css=_LOREM_CSS))
        out[oid] = os.path.relpath(fp, dist)
    return out


# ------------------------------------------------------------------
# option sets — the same blocks /approve accepts (F-27)
# ------------------------------------------------------------------
def _articles(html_txt):
    """yield (id, attrs) for each <article class="card picker-opt">."""
    for m in re.finditer(
            r'<article\s+class="card picker-opt[^"]*"([^>]*)>',
            html_txt):
        attrs = dict(re.findall(r'data-([\w-]+)="([^"]*)"',
                                m.group(1)))
        i = re.search(r'id="([^"]+)"', m.group(1))
        if i:
            yield i.group(1), attrs


def _variant_name(html_txt, ident):
    m = re.search(
        r'id="' + re.escape(ident) + r'"[^>]*>.*?'
        r'<span class="variant-name">([^<]*)<',
        html_txt, re.S)
    return m.group(1).strip() if m else ident


def _picker_cards(ctx, pd):
    """w3 layout cards + w4 look/fine cards from the rendered
    pickers — the same source /approve validates against."""
    cards = {'layouts': [], 'looks': [], 'fine': []}
    for rel, kind in (('preview/layouts.html', 'layouts'),
                      ('preview/variants.html', 'looks'),
                      ('preview/fine.html', 'fine')):
        fp = ctx.find(rel)
        if not fp:
            continue
        txt = open(fp, encoding='utf-8', errors='replace').read()
        for ident, a in _articles(txt):
            prev = os.path.join(
                pd, 'site', 'dist', 'preview',
                ('lo-' if kind == 'layouts' else 'look-') + ident,
                'index.html')
            if not os.path.isfile(prev):
                continue
            tags = [t for t in (a.get('layout'), a.get('vector'))
                    if t and t != 'fine']
            if a.get('variant'):
                tags.append(a['variant'])
            cards[kind].append({
                'id': ident, 'name': _variant_name(txt, ident),
                'wave': 'w3' if kind == 'layouts' else 'w4',
                'preview': f'/built/{urllib.parse.quote(prev)}',
                'score': a.get('score100') or a.get('score'),
                'tags': tags,
                'knobs': a.get('knobs', ''),
                'kind': kind})
    return cards


def _composition_board(pd, layout_prevs=None):
    """The layout vocabulary boards: per-option rendered previews
    (stacked section fragments in plan order) with the b-rows matrix
    demoted to secondary detail."""
    lo = _json_at(pd, 'LAYOUT-OPTIONS.json')
    if not lo:
        return None
    dist = os.path.join(pd, 'site', 'dist')
    opts = []
    for o in lo.get('options') or []:
        rel = (layout_prevs or {}).get(o.get('id'))
        comps = o.get('compositions') or {}
        opts.append({
            'id': o.get('id'), 'name': o.get('label') or o.get('id'),
            'score': o.get('score'),
            'preview': ('/built/' + urllib.parse.quote(
                os.path.join(dist, rel))) if rel else None,
            'tags': ['layout'] + sorted(set(comps.values())),
            'element': 'layout', 'variant': o.get('id'),
            'desc': ' · '.join(k + ' ' + v for k, v in
                              list(comps.items())[:4]) +
                    (' …' if len(comps) > 4 else ''),
            'compositions': comps})
    return {'allowed': {k: list(dict.fromkeys(v or []))
                        for k, v in
                        (lo.get('allowed') or {}).items()},
            'options': opts,
            'pick': lo.get('pick')}


# ------------------------------------------------------------------
# the /app-data payload
# ------------------------------------------------------------------
# ------------------------------------------------------------------
# WCAG 2.1 contrast audit — the app-side complement to measure.py's
# contrast_min_ratio DOM scan: computed per vibe family x mode from
# the var bundles so a failing family is flagged before it is baked.
# thresholds: 4.5 normal text, 3.0 UI/large (CTA ink on accent)
# ------------------------------------------------------------------
_CONTRAST_ROLES = ('text-primary', 'text-secondary', 'bg-canvas',
                   'bg-surface', 'bg-elevated', 'action-primary',
                   'action-primary-ink')
_CONTRAST_PAIRS = (
    ('text-primary', 'bg-canvas', 4.5),
    ('text-secondary', 'bg-canvas', 4.5),
    ('text-primary', 'bg-surface', 4.5),
    ('text-primary', 'bg-elevated', 4.5),
    ('action-primary', 'bg-canvas', 4.5),
    ('action-primary-ink', 'action-primary', 3.0))


def _rgb(v):
    v = (v or '').strip()
    m = re.match(r'#([0-9a-fA-F]{3,8})$', v)
    if m:
        h = m.group(1)
        if len(h) in (3, 4):
            h = ''.join(c * 2 for c in h[:3])
        return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))
    m = re.match(r'rgba?\(([^)]+)\)', v)
    if m:
        p = [x.strip() for x in m.group(1).split(',')]
        try:
            return tuple(int(float(x)) for x in p[:3])
        except ValueError:
            return None
    return None


def _ratio(fg, bg):
    def lum(c):
        def f(x):
            x /= 255.0
            return x / 12.92 if x <= 0.03928 \
                else ((x + .055) / 1.055) ** 2.4
        return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2])
    a, b = lum(fg), lum(bg)
    return (max(a, b) + .05) / (min(a, b) + .05)


def _site_roles(pd):
    """semantic role literals from the built _astro css,
    {mode: {role: value}} — var() chains resolved inside the block."""
    adir = os.path.join(pd, 'site', 'dist', '_astro')
    css = ''
    if os.path.isdir(adir):
        for fn in os.listdir(adir):
            if fn.endswith('.css'):
                try:
                    with open(os.path.join(adir, fn)) as fh:
                        css += fh.read()
                except OSError:
                    pass
    out = {}
    for mode, pat in (('light', r':root\s*\{'),
                      ('dark', r'\[data-theme=dark\]\s*\{')):
        decls = {}
        for m in re.finditer(pat + r'([^}]*)\}', css):
            decls.update(dict(re.findall(r'--([\w-]+)\s*:\s*([^;]+);',
                                         m.group(1))))
        row = {}
        for role in _CONTRAST_ROLES:
            v, seen = decls.get(role), 0
            while v and v.strip().startswith('var(') and seen < 6:
                seen += 1
                r2 = re.match(r'var\(--([\w-]+)', v.strip())
                v = decls.get(r2.group(1)) if r2 else None
            # color-mix(in oklch, A tint%, B amt%): resolve the
            # dominant var — the mix only tints ~5%, close enough
            # for an audit flag
            while v and v.strip().startswith('color-mix(') and seen < 12:
                seen += 1
                r2 = re.search(r'var\(--([\w-]+)', v)
                v = decls.get(r2.group(1)) if r2 else None
                while v and v.strip().startswith('var(') and seen < 12:
                    seen += 1
                    r2 = re.match(r'var\(--([\w-]+)', v.strip())
                    v = decls.get(r2.group(1)) if r2 else None
            if v:
                row[role] = v.strip()
        out[mode] = row
    return out


def contrast_audit(pd):
    """{fam: {mode: {min, fails[]}}} — every family's effective role
    literals (site baseline + family overrides) checked per pair."""
    base = _site_roles(pd)
    out = {}
    for fam, f in VIBE_FAMILIES.items():
        row = {}
        for mode, key in (('light', 'css'), ('dark', 'css_dark')):
            over = dict(re.findall(r'--([\w-]+)\s*:\s*([^;]+);',
                                   f.get(key) or ''))
            roles = dict(base.get(mode) or {})
            roles.update(over)
            fails, mn = [], 99.0
            for fg, bg, th in _CONTRAST_PAIRS:
                a, b = _rgb(roles.get(fg)), _rgb(roles.get(bg))
                if not a or not b:
                    continue
                r = _ratio(a, b)
                mn = min(mn, r)
                if r < th:
                    fails.append(f'{fg}/{bg} {r:.1f}<{th:g}')
            row[mode] = {'min': round(mn, 2) if mn < 99 else None,
                         'fails': fails}
        out[fam] = row
    return out


def app_data(pipeline):
    ctx = G.Ctx(pipeline)
    pd = ctx.dir
    if not os.path.isdir(pd):
        return None, f'pipeline {pipeline} not found'
    emitted = emit_element_previews(pd)
    vibes_emitted = emit_vibe_previews(pd)
    contrast = contrast_audit(pd)
    scrub, bank_depth = emit_section_fragments(pd)
    cards = _picker_cards(ctx, pd)
    epicks = {p.get('element'): p.get('variant')
              for p in (_json_at(pd, 'ELEMENT-PICKS.json')
                        or {}).get('picks', [])}

    brief = _brief_file(ctx)
    dna = _json_at(pd, 'DNA.json') or _json_at(
        os.path.dirname(pd), 'DNA.json') or {}
    tokens = _json_at(pd, 'TOKENS.json') or _json_at(
        os.path.dirname(pd), 'TOKENS.json') or {}
    gates = _json_at(pd, 'GATES.json') or {}

    # element galleries — emitted preview cards (+ derived geometry
    # topos on menus) + bank options the build didn't emit
    bank_cards = emit_bank_previews(pd)
    galleries = {}
    for g in ELEMENT_GALLERIES:
        gcards = []
        for grp in g['groups']:
            for comp in grp['comps']:
                sfx = grp.get('suffix', '')
                keys = ([key for key in emitted
                         if key.startswith(comp + sfx) or
                         (not sfx and key == comp)]
                        if sfx else
                        [key for key in emitted if key == comp])
                keys = sorted(keys, key=lambda k: (k.count('-'), k))
                if not keys and not grp.get('suffix'):
                    keys = [comp]
                elif not keys:
                    keys = [comp + sfx]
                for key in keys:
                    rel = emitted.get(key)
                    derived = key not in (comp, comp + sfx)
                    if rel and os.path.isfile(os.path.join(
                            pd, 'site', 'dist', rel)):
                        gcards.append({
                            'id': key, 'name': key,
                            'preview': '/built/' + urllib.parse.quote(
                                os.path.join(pd, 'site', 'dist', rel)),
                            'tags': [comp] + ([grp['label'].lower()]
                                if grp.get('label') else []) +
                                ([t for t in ('flyout', 'overlay',
                                 'dialog', 'derived')
                                  if t in key or t == 'derived'
                                  and derived]),
                            'emitted': True,
                            'element': grp['element'],
                            'variant': key,
                            'grp': grp.get('label'),
                            'mobile': bool(g.get('mobile'))})
                    elif not derived:
                        gcards.append({
                            'id': key, 'name': key, 'preview': None,
                            'tags': [comp, 'bank-option'] +
                                ([grp['label'].lower()]
                                 if grp.get('label') else []),
                            'emitted': False,
                            'element': grp['element'],
                            'variant': key,
                            'grp': grp.get('label'),
                            'mobile': bool(g.get('mobile'))})
        gcards += bank_cards.get(g['id'], [])
        if g['id'] == 'modals' and not any(
                c['emitted'] for c in gcards):
            # seed: builds predating modal emission leave the gallery
            # empty — emit slot-bound fragments of the bank's own
            # modal skeletons so there's something to scrub
            outdir = os.path.join(pd, 'site', 'dist', 'preview',
                                  'elements')
            os.makedirs(outdir, exist_ok=True)
            blk0, _r = _comp_blocks(pd)
            head0 = battr0 = ''
            if blk0:
                head0, battr0 = blk0[next(iter(blk0))][1:3]
            for comp in ('modal-form', 'form-panel'):
                inner, _u = _slot_frag(comp, {})
                if not inner:
                    continue
                fn = comp + '-open.html'
                with open(os.path.join(outdir, fn), 'w',
                          encoding='utf-8') as fh:
                    fh.write(_doc(head0, battr0, inner,
                                  css=_LOREM_CSS))
                gcards.append({
                    'id': comp + '-open', 'name': comp + ' (seeded)',
                    'preview': '/built/' + urllib.parse.quote(
                        os.path.join(pd, 'site', 'dist',
                                     'preview', 'elements', fn)),
                    'tags': [comp, 'seeded', 'lorem'],
                    'emitted': True, 'element': 'modals',
                    'variant': comp + '-open',
                    'grp': None, 'mobile': bool(g.get('mobile'))})
        galleries[g['id']] = dict(
            g, cards=gcards,
            emitted_n=sum(1 for c in gcards if c['emitted']))

    boards = {}
    # step 1 — VIBE: the coarse family scrub
    boards['vibe'] = {
        'id': 'vibe', 'title': 'Vibe', 'icon': 'vibe',
        'desc': 'Coarse style families — pick one to bake its '
                'genes into every preview below. Arrow keys scrub; '
                'click Pick to sign the family.',
        'cards': [{'id': fam, 'name': f['name'],
                   'preview': '/built/' + urllib.parse.quote(
                       os.path.join(pd, 'site', 'dist',
                                    vibes_emitted[fam]))
                   if fam in vibes_emitted else None,
                   'tags': f['genes'] +
                       [f.get('theme') or 'light'] +
                       [t for t in ('professional', 'playful',
                                    'colourful')
                        if t in _VIBE_MOODS.get(fam, ())],
                   'genes': f['genes'],
                   'desc': f['desc'], 'element': 'vibe',
                   'contrast': contrast.get(fam),
                   'variant': fam}
                  for fam, f in VIBE_FAMILIES.items()]}
    # step 2 — LAYOUT: whole-page scrub over section topologies,
    # then the option boards
    boards['page'] = {
        'id': 'page', 'title': 'Page · live scrub', 'icon': 'page',
        'desc': 'The whole page in the baked vibe — ‹ › on each '
                'row swaps that section\'s composition/topology '
                'in place; ✓ signs the row\'s choice.',
        'scrub': scrub, 'cards': []}
    layout_prevs = emit_layout_previews(pd)
    comp = _composition_board(pd, layout_prevs)
    for b in PAGE_BOARDS:
        if b['id'] == 'home':
            boards[b['id']] = dict(
                b, cards=(cards['layouts'] + cards['looks'] +
                          cards['fine']))
        else:
            boards[b['id']] = dict(
                b, cards=(comp or {}).get('options') or [],
                compositions=comp)

    knobs = (tokens.get('knobs') or {}) if isinstance(
        tokens, dict) else {}
    genotype = dna.get('genotype') or {}
    chips = []
    for k in ('space.density_scale', 'type.ratio', 'radius.personality',
              'color.accent_usage', 'elevation.level', 'motion.level'):
        if k in knobs:
            chips.append({'k': k.split('.')[-1], 'v': knobs[k]})
    for k in ('density-tier', 'image-led-ratio', 'type-contrast',
              'nav-pattern', 'disclosure-tier', 'surface-rhythm'):
        if k in genotype:
            chips.append({'k': k, 'v': genotype[k]})

    picked = {w: (gates.get(w) or {}).get('pick') for w in ('w3', 'w4')}
    return {'pipeline': pd,
            'picked_elements': epicks,
            'bank_depth': bank_depth,
            'palette': _palette(galleries),
            'saved_systems': list_systems(pd),
            'contrast': contrast,
            'design': {
                'site': dna.get('site') or pd.rsplit('/', 3)[-3],
                'brand': (brief.get('brand') or {}).get('name'),
                'accent': (brief.get('brand') or {}).get('accent'),
                'canvas': (brief.get('theme') or {}).get('canvas'),
                'default_theme': (brief.get('theme') or {})
                .get('default', 'light'),
                'vertical': dna.get('vertical_profile'),
                'chips': chips,
                'knobs': knobs},
            'waves': {'picked': picked,
                      'approvable': sorted(G.APPROVABLE)},
            'boards': boards, 'galleries': galleries}, None


def pipelines_index():
    """Dirs that look like a pipeline (pages/*/ with a site build)
    — the /app launcher when no pipeline= is given."""
    root = os.path.join(os.path.dirname(HERE), '..')
    out = []
    for base in ('INPUTS',):
        bdir = os.path.abspath(os.path.join(root, base))
        for dp, _, fns in os.walk(bdir):
            if os.path.basename(dp) == 'pages':
                continue
            if 'DNA.json' in fns and os.path.isdir(
                    os.path.join(dp, 'site')):
                out.append(dp)
    return sorted(out)


# ------------------------------------------------------------------
# palette depth — honest emitted counts per gallery + the raw
# (not-yet-vectorised) skeleton backlog they could grow from
# ------------------------------------------------------------------
_SKEL_ROOT = os.path.abspath(os.path.join(
    HERE, '..', '..', 'templates', 'skeletons'))
_BACKLOG_PATS = {
    'header': ('navbar', 'header', 'navigation'),
    'footer': ('footer',),
    'menu': ('menu', 'offcanvas', 'drawer', 'nav'),
    'modals': ('modal', 'dialog', 'popup'),
}


def _palette(galleries):
    backlog = {k: 0 for k in _BACKLOG_PATS}
    if os.path.isdir(_SKEL_ROOT):
        for _dp, _dn, fns in os.walk(_SKEL_ROOT):
            for fn in fns:
                low = fn.lower()
                if not low.endswith(('.html', '.astro', '.json')):
                    continue
                for k, pats in _BACKLOG_PATS.items():
                    if any(p in low or p in _dp.lower() for p in pats):
                        backlog[k] += 1
                        break
    return {'emitted': {g: galleries[g]['emitted_n']
                        for g in galleries},
            'skeleton_backlog': backlog}


_GENMENU = os.path.join(_SKEL_ROOT, 'genmenu')


def _genmenu_tags():
    fp = os.path.join(_GENMENU, 'tags.json')
    try:
        rows = (json.load(open(fp)) or {}).get('rows') or []
    except Exception:
        return {}
    return {r.get('path'): r for r in rows if r.get('path')}


def emit_bank_previews(pd):
    """preview/bank/<cls>/<slug>.html — every genmenu exemplar
    rendered standalone under bank-preview.css: reference fidelity
    (the exemplar's own Tailwind), NOT bound into the baked family.
    Returns {gallery_id: [cards]}."""
    if not os.path.isdir(_GENMENU):
        return {}
    tags = _genmenu_tags()
    css_src = os.path.join(_GENMENU, 'bank-preview.css')
    outdir = os.path.join(pd, 'site', 'dist', 'preview', 'bank')
    os.makedirs(outdir, exist_ok=True)
    css_dst = os.path.join(outdir, 'bank-preview.css')
    if os.path.isfile(css_src) and (
            not os.path.isfile(css_dst) or
            os.path.getmtime(css_src) > os.path.getmtime(css_dst)):
        with open(css_src, 'rb') as fi:
            blob = fi.read()
        with open(css_dst, 'wb') as fo:
            fo.write(blob)
    head = ('<meta charset="utf-8"><meta name="viewport" '
            'content="width=device-width,initial-scale=1">'
            '<link rel="stylesheet" href="/built/' +
            urllib.parse.quote(os.path.join(
                pd, 'site', 'dist', 'preview', 'bank',
                'bank-preview.css')) + '">')
    out = {}
    for gid, dirs in _BANK_DIRS.items():
        cards = []
        for cls in dirs:
            cdir = os.path.join(_GENMENU, cls)
            if not os.path.isdir(cdir):
                continue
            for fn in sorted(os.listdir(cdir)):
                if not fn.endswith('.html'):
                    continue
                slug = fn[:-5]
                fp = os.path.join(cdir, fn)
                dst = os.path.join(outdir, cls, slug + '.html')
                os.makedirs(os.path.dirname(dst), exist_ok=True)
                stale = (not os.path.isfile(dst)) or \
                    os.path.getmtime(fp) > os.path.getmtime(dst) or \
                    (os.path.isfile(css_dst) and
                     os.path.getmtime(css_dst) >
                     os.path.getmtime(dst))
                if stale:
                    frag = open(fp, encoding='utf-8').read()
                    with open(dst, 'w', encoding='utf-8') as fh:
                        fh.write(_doc(head, '', frag))
                row = tags.get(cls + '/' + slug) or {}
                ctags = [cls, 'bank'] + \
                    list(row.get('style') or []) + \
                    list(row.get('category') or [])
                if row.get('mode'):
                    ctags.append(row['mode'])
                if row.get('platform'):
                    ctags.append(row['platform'])
                cards.append({
                    'id': slug, 'name': slug,
                    'preview': '/built/' + urllib.parse.quote(
                        os.path.join(pd, 'site', 'dist', 'preview',
                                     'bank', cls, slug + '.html')),
                    'tags': ctags, 'emitted': True, 'bank': True,
                    'element': cls, 'variant': slug,
                    'grp': 'bank · ' + cls,
                    'mobile': gid == 'menu'})
        out[gid] = cards
    return out


def run_ingest(pipeline, url='', html='', css_text=''):
    '''URL/pasted-HTML ingest — slices the page into section
    fragments, vectorises each through the shared genmenu parser
    (Tree + sniff_topology), ranks bank exemplars and drafts a
    DNA-shaped style guess. No browser for paste mode.'''
    import ingest_url
    return ingest_url.ingest(url=url or None, html=html or None,
                             css_text=css_text or '')


def ingest_donor(pipeline, name, payload):
    '''Stage an ingested style as a donor draft inside the pipeline
    dir — INGEST-DRAFTS/<slug>.json, next to SAVED-SYSTEMS.'''
    ctx = G.Ctx(pipeline)
    pd = ctx.dir
    if not os.path.isdir(pd):
        return 1, f'pipeline {pipeline} not found', None
    nm = re.sub(r'[^A-Za-z0-9_-]+', '-', (name or '').strip())[:60]        .strip('-')
    if not nm:
        return 1, 'name needed', None
    dd = Path(pd) / 'INGEST-DRAFTS'
    dd.mkdir(exist_ok=True)
    rec = {'name': nm, 'kind': 'ingest-donor',
           'url': (payload or {}).get('url') or '',
           'dna_draft': (payload or {}).get('dna_draft') or {},
           'fragments': [f for f in
                         ((payload or {}).get('fragments') or [])
                         if isinstance(f, dict)],
           'created': datetime.datetime.now().isoformat(
               timespec='seconds')}
    fp = dd / (nm.lower() + '.json')
    fp.write_text(json.dumps(rec, indent=1))
    return 0, f'donor draft saved → {fp.name}', {
        'name': nm, 'file': str(fp)}


def save_system(pipeline, name, mode=None):
    """Persist the current combination — vibe + element + section
    picks + the chosen default mode — as a named design-system file
    under SAVED-SYSTEMS/ in the pipeline dir, in the set format
    (DNA-bound, reloadable)."""
    slug = re.sub(r'[^a-z0-9-]+', '-', (name or '').lower()) \
        .strip('-')[:48]
    if not slug:
        return 1, 'name needed', None
    ctx = G.Ctx(pipeline)
    pd = ctx.dir
    if not os.path.isdir(pd):
        return 1, f'pipeline {pipeline} not found', None
    ep = _json_at(pd, 'ELEMENT-PICKS.json') or {}
    picks = ep.get('picks', [])
    vibe = next((p.get('variant') for p in picks
                 if p.get('element') == 'vibe'), 'baseline')
    dna = _json_at(pd, 'DNA.json') or _json_at(
        os.path.dirname(pd), 'DNA.json') or {}
    rec = {'name': name, 'slug': slug,
           'generated_by': 'picker_app.save_system',
           'vibe': vibe,
           'genes': VIBE_FAMILIES.get(vibe, {}).get('genes', []),
           'dna': {'site': dna.get('site'),
                   'vertical_profile': dna.get('vertical_profile'),
                   'genotype': dna.get('genotype')},
           'default_mode': mode or 'light',
           'picks': picks,
           'created': datetime.datetime.now().isoformat(
               timespec='seconds')}
    rec['sig'] = G._sig(rec, G.op_key(create=True))
    sdir = os.path.join(pd, 'SAVED-SYSTEMS')
    os.makedirs(sdir, exist_ok=True)
    fp = os.path.join(sdir, slug + '.json')
    with open(fp, 'w') as fh:
        json.dump(rec, fh, indent=1, sort_keys=True)
    return 0, f'system “{name}” saved → SAVED-SYSTEMS/{slug}.json', rec


def list_systems(pd):
    sdir = os.path.join(pd, 'SAVED-SYSTEMS')
    out = []
    for fn in sorted(os.listdir(sdir)) if os.path.isdir(sdir) else []:
        if fn.endswith('.json'):
            d = _json_at(sdir, fn) or {}
            out.append({'slug': fn[:-5], 'name': d.get('name'),
                        'vibe': d.get('vibe'), 'genes': d.get('genes'),
                        'default_mode': d.get('default_mode'),
                        'picks': [{'element': p.get('element'),
                                   'variant': p.get('variant')}
                                  for p in d.get('picks', [])],
                        'created': d.get('created')})
    return out


# pick/nonce registries are read-modify-write files — the threaded
# server can interleave two picks and lose one, so writes serialise
_PICKS_LOCK = threading.Lock()


def record_element_pick(pipeline, element, variant):
    """Signed element decision — ELEMENT-PICKS.json in the pipeline
    dir. Same service-side signing as candidate decisions; the file
    is the element-choice registry the plan consumes later."""
    valid = {grp['element'] for g in ELEMENT_GALLERIES
             for grp in g['groups']} | {'vibe', 'header', 'footer',
                                        'mobile-menu', 'modals'} | \
            {d for dirs in _BANK_DIRS.values() for d in dirs}
    if element not in valid and not re.fullmatch(
            r'sec:[\w-]{1,40}', element or ''):
        return 1, f'unknown element gallery {element}'
    if not variant or not re.fullmatch(r'[\w:-]{1,64}', variant):
        return 1, 'invalid variant id'
    ctx = G.Ctx(pipeline)
    pd = ctx.dir
    fp = os.path.join(pd, 'ELEMENT-PICKS.json')
    with _PICKS_LOCK:
        data = _json_at(pd, 'ELEMENT-PICKS.json') or {
            'generated_by': 'approve_service.py',
            'picks': []}
        now = datetime.datetime.now().isoformat(timespec='seconds')
        for p in data.get('picks', []):
            if p.get('element') == element:
                if p.get('variant') == variant:
                    return 0, (f'{element} already is {variant} — '
                               'still signed')
                old_v = p.get('variant')
                p['variant'] = variant
                p['ts'] = now
                p['prev'] = old_v
                p['sig'] = G._sig({k: v for k, v in p.items()
                                   if k != 'sig'},
                                  G.op_key(create=True))
                with open(fp, 'w') as fh:
                    json.dump(data, fh, indent=1, sort_keys=True)
                return 0, (f'{element} {old_v} → {variant} '
                           '(superseded, signed into ELEMENT-PICKS.json)')
        rec = {'element': element, 'variant': variant, 'ts': now}
        rec['sig'] = G._sig(rec, G.op_key(create=True))
        data.setdefault('picks', []).append(rec)
        with open(fp, 'w') as fh:
            json.dump(data, fh, indent=1, sort_keys=True)
    return 0, f'{element} → {variant} (signed into ELEMENT-PICKS.json)'


# ------------------------------------------------------------------
# the shell — emitted, token-driven, dark default
# ------------------------------------------------------------------
_SHELL = r"""<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>web-factory · picker</title>
<script>try{document.documentElement.dataset.theme=
 localStorage.getItem('wfapp-theme')||
 (matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')
}catch(e){document.documentElement.dataset.theme='light'}</script>
<style>
:root{
  --font:ui-sans-serif,system-ui,'Segoe UI',Roboto,sans-serif;
  --mono:ui-monospace,'SF Mono',Menlo,Consolas,monospace;
  --r:12px; --r-sm:8px;
}
:root[data-theme="dark"]{
  --bg:#0a0a0c;--bg-2:#101013;--panel:#16161a;--panel-2:#1e1e23;
  --line:#26262d;--line-2:#34343c;
  --ink:#ededee;--muted:#9c9ca4;--faint:#5e5e66;
  --accent:#e6e6e8;--accent-ink:#101013;
  --ok:#3ddc97;--bad:#ff6b6b;
}
:root[data-theme="light"]{
  --bg:#f4f4f6;--bg-2:#ffffff;--panel:#ffffff;--panel-2:#f0f0f2;
  --line:#e0e0e5;--line-2:#c9c9d0;
  --ink:#17171a;--muted:#62626b;--faint:#9898a0;
  --accent:#17171a;--accent-ink:#ffffff;
  --ok:#0f9d6b;--bad:#c73e3e;
}
*{box-sizing:border-box}
html,body{margin:0;height:100%}
body{font-family:var(--font);background:var(--bg);color:var(--ink);
     overflow:hidden}
#app{display:grid;grid-template-columns:232px 1fr;
     grid-template-rows:56px 1fr;height:100vh}

/* --- topbar --- */
#top{grid-column:1/3;display:flex;align-items:center;gap:14px;
     padding:0 18px;background:var(--bg-2);
     border-bottom:1px solid var(--line)}
#top .mark{width:26px;height:26px;border-radius:7px;
     background:var(--accent);color:var(--accent-ink);
     display:grid;place-items:center;font:700 13px var(--mono)}
#top .who{font-weight:650;font-size:14px}
#top .who small{display:block;font-weight:500;color:var(--muted);
     font-size:11px}
#top .sp{flex:1}
.chip{display:inline-flex;align-items:center;gap:6px;
     padding:3px 10px;border:1px solid var(--line);
     border-radius:999px;font-size:11.5px;color:var(--muted);
     background:var(--panel)}
.chip b{color:var(--ink);font-weight:600}
.chip .sw{width:10px;height:10px;border-radius:3px;
     border:1px solid var(--line-2)}
#railBtn,#themeBtn{width:34px;height:34px;display:grid;
     place-items:center;
     border:1px solid var(--line);background:var(--panel);
     color:var(--ink);border-radius:999px;padding:0;
     font:600 12px var(--font);cursor:pointer}
#railBtn svg{width:15px;height:15px}
#themeBtn{
     border:1px solid var(--line);background:var(--panel);
     color:var(--ink);border-radius:999px;padding:0;
     font:600 12px var(--font);cursor:pointer}
#themeBtn svg{width:15px;height:15px}
#themeBtn:hover{border-color:var(--line-2)}
#vwCtl{display:flex;border:1px solid var(--line);border-radius:999px;
     overflow:hidden}
#vwCtl button{border:0;background:var(--panel);color:var(--muted);
     padding:8px 15px;font:600 12px var(--font);cursor:pointer;
     display:grid;place-items:center}
#vwCtl button svg{width:15px;height:15px}
#vwCtl button.on{background:var(--accent);color:var(--accent-ink)}
#dnaPop{position:relative}
#dnaPop>summary{list-style:none;width:34px;height:34px;
     display:grid;place-items:center;border:1px solid var(--line);
     border-radius:999px;background:var(--panel);color:var(--muted);
     cursor:pointer}
#dnaPop>summary::-webkit-details-marker{display:none}
#dnaPop>summary svg{width:15px;height:15px}
#dnaPop[open]>summary{border-color:var(--accent);color:var(--accent)}
#dnaPop .panel{position:absolute;right:0;top:calc(100% + 10px);
     z-index:60;min-width:280px;max-width:480px;padding:10px;
     display:flex;flex-wrap:wrap;gap:6px;background:var(--bg-2);
     border:1px solid var(--line);border-radius:12px;
     box-shadow:0 12px 32px rgba(0,0,0,.35)}
#dnaPop .panel:empty{display:none}
.card .cb iframe,.srow iframe{max-width:var(--vw,100%);
     margin-inline:auto}
.aa{display:inline-block;padding:2px 8px;border-radius:999px;
    font:600 10.5px var(--mono);border:1px solid var(--line);
    color:var(--muted);background:var(--panel)}
.aa.bad{color:var(--bad);border-color:var(--bad)}

/* --- rail --- */
#rail{background:var(--bg-2);border-right:1px solid var(--line);
     overflow-y:auto;padding:14px 10px}
.railgrp{font:700 10.5px var(--font);letter-spacing:.08em;
     color:var(--muted);margin:16px 8px 6px;text-transform:uppercase}
.railgrp:first-child{margin-top:2px}
/* --- ingest --- */
.ingbar{display:grid;gap:8px;margin:14px 0;max-width:640px}
.ingbar input,.ingbar textarea{background:var(--bg-2);color:var(--ink);
  border:1px solid var(--line);border-radius:8px;padding:10px 12px;
  font:13px var(--font)}
.ingbar textarea{min-height:90px;font-family:var(--mono,monospace)}
.dnacard{background:var(--bg-2);border:1px solid var(--line);
  border-radius:12px;padding:14px 16px;max-width:720px}
.dnacard h2{margin:0 0 10px;font:700 15px var(--font)}
.dnapal{display:flex;gap:6px;margin-bottom:8px}
.sw2{width:26px;height:26px;border-radius:6px;
  border:1px solid var(--line)}
.dnarow{font:12.5px var(--font);color:var(--ink-dim);margin:5px 0}
.dnarow input{background:var(--bg-3,var(--bg-2));color:var(--ink);
  border:1px solid var(--line);border-radius:6px;padding:6px 10px;
  font:12.5px var(--font)}
.ingrow{display:grid;grid-template-columns:180px 1fr;gap:10px;
  padding:9px 12px;border:1px solid var(--line);border-radius:10px;
  margin:6px 0;background:var(--bg-2);max-width:920px}
.ingkind{font:700 12px var(--font)}
.ingkind span{display:block;font-weight:400;color:var(--ink-dim);
  margin-top:2px}
.ingmatch{font:12.5px var(--font)}
.ingmatch .score{color:var(--acc,#8ab)}
.ingwhy{color:var(--ink-dim);font-size:11px;margin-top:2px}
.ritem{display:flex;align-items:center;gap:10px;width:100%;
     padding:8px 10px;border:0;border-radius:var(--r-sm);
     background:transparent;color:var(--ink);cursor:pointer;
     font:500 13.5px var(--font);text-align:left}
.ritem:hover{background:var(--panel-2)}
.ritem.on{background:var(--accent);color:var(--accent-ink)}
.ritem.on .cnt{color:var(--accent-ink);opacity:.75}
.ritem svg{width:15px;height:15px;flex:none;opacity:.85}
.ritem .cnt{margin-left:auto;font:600 10.5px var(--mono);
     color:var(--muted)}

/* --- board --- */
#board{overflow-y:auto;padding:22px 26px 60px}
#board h1{margin:0;font-size:19px;font-weight:650}
#board .desc{color:var(--muted);font-size:13px;margin:5px 0 18px}
.filters{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:18px}
.glabel{grid-column:1/-1;font-size:12px;font-weight:600;
  letter-spacing:.08em;text-transform:uppercase;color:var(--muted);
  margin-top:8px}
.saves{display:flex;gap:9px;margin:0 0 18px}
.saves input{flex:0 0 240px;background:var(--bg2);border:1px solid
  var(--line);border-radius:7px;color:var(--ink);padding:7px 11px;
  font-size:13px}
.fchip{padding:5px 13px;border:1px solid var(--line);
     border-radius:999px;background:var(--panel);
     color:var(--muted);font:600 11.5px var(--font);cursor:pointer}
.fchip.on{background:var(--accent);border-color:var(--accent);
     color:var(--accent-ink)}
.grid{display:grid;gap:16px;
     grid-template-columns:repeat(auto-fill,minmax(560px,1fr))}
.card{background:var(--panel);border:1px solid var(--line);
     border-radius:var(--r);overflow:hidden;display:flex;
     flex-direction:column}
.card.picked{border-color:var(--ok)}
.card .ch{display:flex;align-items:center;gap:8px;
     padding:10px 12px;border-bottom:1px solid var(--line)}
.card .ch .nm{font-weight:650;font-size:13px}
.card .ch .id{font:600 10px var(--mono);color:var(--accent);
     border:1px solid var(--accent);border-radius:4px;
     padding:1px 5px}
.card .ch .score{margin-left:auto;font:600 11px var(--mono);
     color:var(--muted)}
.card .cb{position:relative;background:var(--bg);min-height:64px}
.card .cb iframe{display:block;width:100%;height:480px;border:0}
.card.mobile .cb iframe{max-width:var(--vw,340px);margin:0 auto;
     border-left:1px solid var(--line);
     border-right:1px solid var(--line)}
.card.mobile{max-width:calc(var(--vw,340px) + 26px);
     justify-self:center;width:100%}
.card .cb .noprev{display:grid;place-items:center;height:120px;
     color:var(--muted);font-size:12px;padding:0 16px;text-align:center}
.card .vp{position:absolute;top:8px;right:8px;display:flex;gap:4px;
     z-index:2}
.card .vp button{border:1px solid var(--line);
     background:var(--panel);color:var(--muted);border-radius:6px;
     font:600 10px var(--font);padding:3px 7px;cursor:pointer}
.card .vp button.on{color:var(--accent);border-color:var(--accent)}
.card .cf{display:flex;align-items:center;gap:8px;
     padding:10px 12px;border-top:1px solid var(--line)}
.card .tags{display:flex;gap:5px;flex-wrap:wrap}
.tag{font:600 10px var(--mono);color:var(--muted);
     border:1px solid var(--line);border-radius:4px;padding:2px 6px}
.pick{margin-left:auto;padding:7px 16px;border:0;
     border-radius:999px;background:var(--accent);
     color:var(--accent-ink);font:650 12px var(--font);cursor:pointer}
.pick:disabled{opacity:.4;cursor:default}
.pstat{font:500 11.5px var(--font);color:var(--muted);flex:1;
     text-align:right;min-width:0}
.pstat.ok{color:var(--ok)}.pstat.bad{color:var(--bad)}

/* composition board */
.comptab{width:100%;border-collapse:collapse;font-size:12.5px}
.comptab td,.comptab th{border-bottom:1px solid var(--line);
     padding:7px 10px;text-align:left}
.comptab th{color:var(--muted);font:600 11px var(--font);
     letter-spacing:.05em;text-transform:uppercase}
.comptab td.sec{font:600 11px var(--mono);color:var(--muted)}
.comptab td .o{display:inline-block;margin:2px 4px 2px 0;
     padding:1px 8px;border:1px solid var(--line);border-radius:4px;
     font:500 11.5px var(--font)}
.comptab td .o.sel{border-color:var(--ok);color:var(--ok)}
.comptab td .o.pickd{background:var(--accent);color:var(--accent-ink);
     border-color:var(--accent)}
.empty{color:var(--muted);font-size:13px;padding:28px 4px}

/* card selection (keyboard scrub) */
.card.sel{outline:2px solid var(--accent);outline-offset:-1px}
.card .cb .desc{padding:6px 12px 0;color:var(--muted);font-size:11.5px}

/* scrub board — the whole page, section rows in place */
.srow{margin-bottom:14px;border:1px solid var(--line);
      border-radius:var(--r);overflow:hidden;background:var(--panel)}
.srow .srh{display:flex;align-items:center;gap:8px;padding:7px 12px;
      border-bottom:1px solid var(--line);background:var(--bg-2)}
.srow .sec{font:600 10.5px var(--mono);color:var(--accent);
      border:1px solid var(--accent);border-radius:4px;padding:1px 6px}
.srow .sname{font-weight:650;font-size:12.5px}
.srow .spos{margin-left:auto;font:600 10.5px var(--mono);
      color:var(--muted)}
.srow .snav{display:flex;gap:3px}
.srow .snav button,.srow .spick{border:1px solid var(--line);
      background:var(--panel);color:var(--ink);border-radius:6px;
      font:600 12px var(--font);padding:3px 10px;cursor:pointer}
.srow .snav button:hover,.srow .spick:hover{border-color:var(--accent);
      color:var(--accent)}
.srow .spick{color:var(--ok)}
.srow iframe{display:block;width:100%;border:0;background:var(--bg)}
.srow .sstat{font:500 11px var(--font);color:var(--muted)}
.srow .sstat.ok{color:var(--ok)}
#toast{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);
     background:var(--panel-2);border:1px solid var(--line-2);
     color:var(--ink);padding:9px 18px;border-radius:999px;
     font-size:12.5px;opacity:0;transition:opacity .2s;z-index:9}
#toast.show{opacity:1}
.launcher{max-width:620px}
.launcher a{display:block;padding:12px 14px;margin:8px 0;
     border:1px solid var(--line);border-radius:var(--r-sm);
     color:var(--accent);text-decoration:none;
     font:500 13px var(--mono);background:var(--panel)}
#railBtn{display:none}
@media(max-width:760px){
  #app{grid-template-columns:1fr}
  #board{grid-column:auto}
  #top{grid-column:1/-1}
  #rail{display:none;position:fixed;top:52px;left:0;bottom:0;
       width:min(80vw,300px);z-index:50;overflow-y:auto;
       box-shadow:10px 0 34px rgba(0,0,0,.45)}
  #rail.open{display:block}
  #railBtn{display:grid}
  #top{gap:8px;padding:0 10px}
  #top .who small{display:none}
  #dnaPop .panel{right:-40px}
  .grid{grid-template-columns:1fr}
  .ingrow{grid-template-columns:1fr}
  .srow .srh{flex-wrap:wrap}
}
@media(min-width:761px){#railBtn{display:none !important}}

.xp{border:1px solid var(--line);background:var(--bg2);color:var(--fg);
  border-radius:6px;padding:0 7px;height:20px;line-height:1;
  font-size:11px;cursor:pointer;margin-left:auto}
.xp:hover{background:var(--bg3)}
#xpOv{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.72);
  display:flex;align-items:center;justify-content:center}
#xpOv iframe{width:96vw;height:94vh;border:0;border-radius:10px;
  background:#fff}
#xpX{position:absolute;top:14px;right:18px;z-index:61;
  background:var(--bg2);color:var(--fg);border:1px solid var(--line);
  border-radius:8px;padding:6px 12px;cursor:pointer;font-size:13px}

.compmat{margin-top:22px;border:1px solid var(--line);border-radius:10px;
  padding:10px 14px;background:var(--bg-2)}
.compmat>summary{cursor:pointer;font:600 12px var(--font);color:var(--muted)}

</style>
</head>
<body>
<div id="app">
  <div id="top">
    <button id="railBtn" type="button" title="boards"
      aria-label="toggle boards"><svg viewBox="0 0 16 16" fill="none"
      stroke="currentColor" stroke-width="1.4">
      <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"/></svg></button>
    <div class="mark">wf</div>
    <div class="who"><span id="whoName">picker</span>
      <small id="whoSub">design-file not loaded</small></div>
    <div class="sp"></div>
    <div id="vwCtl" title="preview breakpoint — applies to every preview">
      <button data-w="340px" title="mobile" aria-label="mobile">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"
          stroke-width="1.4"><rect x="4.5" y="1.5" width="7"
          height="13" rx="1.5"/><path d="M7 12.5h2"/></svg></button>
      <button data-w="700px" title="tablet" aria-label="tablet">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"
          stroke-width="1.4"><rect x="2.5" y="1.5" width="11"
          height="13" rx="1.5"/><path d="M7 12.5h2"/></svg></button>
      <button data-w="100%" class="on" title="desktop"
        aria-label="desktop"><svg viewBox="0 0 16 16" fill="none"
          stroke="currentColor" stroke-width="1.4">
          <rect x="1.5" y="2.5" width="13" height="9" rx="1.5"/>
          <path d="M6 14h4M8 11.5V14"/></svg></button></div>
    <details id="dnaPop">
      <summary title="design DNA" aria-label="design DNA">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"
          stroke-width="1.4"><path d="M3 2.5v11M13 2.5v11"/>
          <path d="M3 4.5c3 0 7 2 10 2M3 11.5c3 0 7-2 10-2"/></svg>
      </summary>
      <div class="panel"><div id="topChips"></div></div>
    </details>
    <button id="themeBtn" type="button" title="light/dark"
      aria-label="toggle light/dark"></button>
  </div>
  <nav id="rail"></nav>
  <main id="board"></main>
</div>
<div id="toast"></div>
<script>
(function () {
  var Q = new URLSearchParams(location.search);
  var PIPELINE = Q.get('pipeline') || '';
  var DATA = null, CUR = null, FILT = {};   // FILT = conjunctive set
  var BAKED = '';          // the picked vibe family id ('' = baseline)
  var SEL = 0;             // selected card index (keyboard scrub)
  var ROW = 0;             // selected section row on the scrub board

  function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,
    function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  function toast(t){var e=document.getElementById('toast');
    e.textContent=t;e.classList.add('show');
    setTimeout(function(){e.classList.remove('show')},2600)}
  function api(path,body){
    return fetch(path,{method:'POST',
      headers:{'Content-Type':'application/json',
               'X-WF-Page-Token':window.__wfTok},
      body:JSON.stringify(body||{})}).then(function(r){return r.json()})}

  // the baked vibe family frames every preview through /frame
  function frame(u){
    if(!u)return u;
    return (BAKED&&BAKED!=='baseline'&&u.indexOf('/built/')===0)
      ?u.replace('/built/','/frame/'+BAKED+'/'):u;
  }

  // theme — explicit choice (stored) beats the OS setting;
  // without one the app follows prefers-color-scheme, light by default
  function applyTheme(m){
    document.documentElement.dataset.theme=m;
    document.getElementById('themeBtn').innerHTML = ICON[
      m==='dark'?'sun':'moon'];
    // propagate into live previews — built pages honour ?theme=
    document.querySelectorAll('.card iframe[data-src],.srow iframe').forEach(
      function(f){var u=(f.dataset.src||f.src).split('?')[0];
        f.src=u+(m==='dark'?'?theme=dark':'')});
  }
  function setTheme(m){applyTheme(m);
    try{localStorage.setItem('wfapp-theme',m)}catch(e){}}
  document.getElementById('themeBtn').onclick=function(){
    setTheme(document.documentElement.dataset.theme==='dark'
      ?'light':'dark')};
  try{matchMedia('(prefers-color-scheme: dark)').addEventListener(
    'change',function(e){
      if(!localStorage.getItem('wfapp-theme'))
        applyTheme(e.matches?'dark':'light')})}catch(e){}

  // one global preview breakpoint — M/T/D, every frame at once
  document.querySelectorAll('#vwCtl button').forEach(function(b){
    b.onclick=function(){
      document.querySelectorAll('#vwCtl button').forEach(
        function(x){x.classList.toggle('on',x===b)});
      document.documentElement.style.setProperty('--vw',b.dataset.w)}});

  // rail collapse — hamburger on narrow screens, auto-close on pick
  document.getElementById('railBtn').onclick=function(){
    document.getElementById('rail').classList.toggle('open')};

  var ICON={
    home:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 7l6-5 6 5v6a1 1 0 01-1 1H3a1 1 0 01-1-1z"/></svg>',
    doc:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="1.5" width="10" height="13" rx="1.5"/><path d="M5.5 5h5M5.5 8h5M5.5 11h3"/></svg>',
    pin:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 14.5S3 9.8 3 6.5a5 5 0 0110 0c0 3.3-5 8-5 8z"/><circle cx="8" cy="6.5" r="1.8"/></svg>',
    mail:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="3.5" width="12" height="9" rx="1.5"/><path d="M2.5 4.5L8 9l5.5-4.5"/></svg>',
    news:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="2.5" width="10" height="11" rx="1.5"/><path d="M4.5 5.5h5M4.5 8h5M4.5 10.5h3"/><path d="M12 5h1.5a1 1 0 011 1v6a1.5 1.5 0 01-1.5 1.5H4"/></svg>',
    vibe:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="5" cy="8" r="2.6"/><circle cx="8" cy="8" r="2.6" opacity=".7"/><circle cx="11" cy="8" r="2.6" opacity=".4"/></svg>',
    page:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="1.5" width="10" height="13" rx="1.5"/><path d="M5.5 4.5h5M5.5 7h5M5.5 9.5h5M5.5 12h3"/></svg>',
    bars:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1.5" y="3" width="13" height="4" rx="1"/><path d="M3.5 10h9M3.5 13h5"/></svg>',
    burger:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"/></svg>',
    foot:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1.5" y="9" width="13" height="4" rx="1"/><path d="M3.5 6h9M3.5 3h5"/></svg>',
    modal:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2.5" y="4" width="11" height="8" rx="1.5"/><path d="M6 8h4"/></svg>',
    sun:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="3"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4"/></svg>',
    moon:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M13.5 9.5A6 6 0 016.5 2.5a6 6 0 107 7z"/></svg>'};

  var LAYOUT_TABS=['page','home','service','location','contact',
                   'blog'];

  function rail(){
    var el=document.getElementById('rail'),h='';
    function item(kind,o){
      var n=(o.cards||[]).length||((o.scrub||[]).length)||
            ((o.compositions&&o.compositions.options||[]).length);
      h+='<button class="ritem'+(CUR===o.id?' on':'')+'" data-k="'+o.id+
         '" data-t="'+kind+'">'+ICON[o.icon||'doc']+
         '<span>'+esc(o.title)+'</span>'+
         (n?'<span class="cnt">'+n+'</span>':'')+'</button>';}
    h+='<div class="railgrp">1 · Vibe</div>';
    item('b',DATA.boards.vibe);
    h+='<div class="railgrp">2 · Layout</div>';
    LAYOUT_TABS.forEach(function(k){
      if(DATA.boards[k])item('b',DATA.boards[k])});
    h+='<div class="railgrp">3 · Sections · Elements</div>';
    Object.keys(DATA.galleries).forEach(function(k){
      item('g',DATA.galleries[k])});
    h+='<div class="railgrp">Ingest</div>';
    h+='<button class="ritem'+(CUR==='ingest'?' on':'')+
       '" data-k="ingest" data-t="b">'+ICON.news+
       '<span>URL · HTML</span></button>';
    h+='<div class="railgrp">Saved</div>';
    h+='<button class="ritem'+(CUR==='saved'?' on':'')+
       '" data-k="saved" data-t="b">'+ICON.doc+
       '<span>Systems</span><span class="cnt">'+
       ((DATA.saved_systems||[]).length||'')+'</span></button>';
    el.innerHTML=h;
    el.querySelectorAll('.ritem').forEach(function(b){
      b.onclick=function(){CUR=b.dataset.k;FILT={};SEL=0;ROW=0;
        if(innerWidth<761)
          document.getElementById('rail').classList.remove('open');
        rail();board()}});
  }

  function topchips(){
    var d=DATA.design,h='';
    if(d.accent)h+='<span class="chip"><span class="sw" style="background:'+esc(d.accent)+'"></span>accent <b>'+esc(d.accent)+'</b></span>';
    (d.chips||[]).slice(0,5).forEach(function(c){
      h+='<span class="chip">'+esc(c.k)+' <b>'+esc(c.v)+'</b></span>'});
    document.getElementById('topChips').innerHTML=h;
    document.getElementById('whoName').textContent =
      (d.brand||d.site||'design')+' · '+d.site;
    document.getElementById('whoSub').textContent =
      'DNA — '+(d.vertical||'—')+' — '+DATA.pipeline;
  }

  // AND picker — chips are conjunctive facets: every selected tag
  // must be present on a card (e.g. light AND professional)
  function filters(tags){
    var n=Object.keys(FILT).length;
    var h='<button class="fchip'+(!n?' on':'')+'" data-f="" '+
         'title="clear all filters">clear all</button>';
    tags.forEach(function(t){
      h+='<button class="fchip'+(FILT[t]?' on':'')+'" data-f="'+esc(t)+'">'+esc(t)+'</button>'});
    return h;
  }

  function card(c,idx){
    var tags=c.tags||[],cls='card'+(c.mobile?' mobile':'');
    var isPicked=c.element&&(DATA.picked_elements||{})[c.element]===
      c.variant;
    if(c.element==='vibe'&&BAKED===c.variant)isPicked=true;
    if(idx===SEL)cls+=' sel';
    if(isPicked)cls+=' picked';
    var src=c.preview?((c.element==='vibe'||c.bank)?c.preview:
            frame(c.preview)):'';
    var h='<div class="'+cls+'" data-idx="'+idx+
          '" data-tags="'+esc(tags.join(' '))+'">';
    h+='<div class="ch"><span class="id">'+esc(c.id)+'</span>'+
       '<span class="nm">'+esc(c.name)+'</span>'+
       (c.preview?'<button class="xp" title="expand" data-x="'+
        esc(src)+'">&#x2922;</button>':'')+
       (c.score!=null?'<span class="score">'+esc(c.score)+'</span>':'')+
       '</div>';
    h+='<div class="cb">';
    if(c.preview){
      // vibe cards carry their own family bundle — never reframe
      // them through the baked vibe
      h+='<iframe data-src="'+esc(src)+'" src="'+esc(src)+
         '" loading="lazy" title="'+esc(c.name)+'"></iframe>';
    }else{
      h+='<div class="noprev">in the bank — not emitted by this '+
         'plan\'s build yet</div>';}
    if(c.desc)h+='<div class="desc">'+esc(c.desc)+'</div>';
    if(c.contrast){var ca=c.contrast||{},bad=false,mn=[];
      ['light','dark'].forEach(function(md){var v=ca[md]||{};
        if(v.min!=null){mn.push(v.min);
          if((v.fails||[]).length)bad=true}});
      if(mn.length)h+='<span class="aa'+(bad?' bad':'')+'" title="'+esc(
        ((ca.light||{}).fails||[]).concat((ca.dark||{}).fails||[]).join('; ')
        ||'WCAG AA min ratio')+'">AA '+mn.join('/')+(bad?' ✗':'')+'</span>'}
    h+='</div><div class="cf"><div class="tags">'+
       tags.map(function(t){return '<span class="tag">'+esc(t)+'</span>'}).join('')+
       '</div>';
    if(c.wave){
      h+='<button class="pick" data-wave="'+c.wave+'" data-d="'+esc(c.id)+'">Pick</button>';
    }else if(c.element){
      h+='<button class="pick" data-elem="'+c.element+'" data-var="'+esc(c.variant)+'">'+
         (c.element==='vibe'?'Bake':'Pick')+'</button>';
    }
    h+='<span class="pstat'+(isPicked?' ok':'')+'">'+
       (isPicked?'picked ✓':'')+'</span></div></div>';
    return h;
  }

  // the whole page, one row per section, in-place alt swapping
  function scrubView(o){
    var rows=o.scrub||[];
    if(!rows.length)return '<div class="empty">no section rows '
      +'emitted for this pipeline yet</div>';
    var h='<div class="desc" style="margin-bottom:14px">family: <b>'+
      esc(BAKED||'baseline')+'</b> · '+rows.length+
      ' rows · ‹ › scrub, ✓ signs</div>';
    rows.forEach(function(r,i){
      var alt=r.alts[r.idx];
      h+='<div class="srow'+(i===ROW?' sel':'')+'" data-i="'+i+'">'+
         '<div class="srh"><span class="sec">'+
         esc((r.sec||'').replace(/-/g,' ').slice(0,34))+'</span>'+
         '<span class="sname" data-role="nm">'+esc(alt.id)+'</span>'+
         '<span class="spos" data-role="pos">'+(r.idx+1)+'/'+r.alts.length+'</span>'+
         '<div class="snav"><button data-d="-1">‹</button>'+
         '<button data-d="1">›</button></div>'+
         '<button class="spick" title="sign this row\'s choice">✓</button>'+
         '<span class="sstat"></span></div>'+
         '<iframe data-src="'+esc(frame('/built/'+encodeURI(DATA.pipeline+'/site/dist/'+alt.preview)))+
         '" src="'+esc(frame('/built/'+encodeURI(DATA.pipeline+'/site/dist/'+alt.preview)))+
         '" loading="lazy"></iframe></div>';
    });
    return h;
  }

  function srowSwap(rowEl,d){
    var i=+rowEl.dataset.i,r=DATA.boards.page.scrub[i];
    r.idx=(r.idx+d+r.alts.length)%r.alts.length;
    var alt=r.alts[r.idx];
    var u='/built/'+encodeURI(DATA.pipeline+'/site/dist/'+alt.preview);
    var f=rowEl.querySelector('iframe');
    f.dataset.src=frame(u);
    f.src=frame(u)+(document.documentElement.dataset.theme==='dark'
      ?'?theme=dark':'');
    rowEl.querySelector('[data-role="nm"]').textContent=alt.id;
    rowEl.querySelector('[data-role="pos"]').textContent=
      (r.idx+1)+'/'+r.alts.length;
  }

  function compBoard(cb){
    if(!cb)return '<div class="empty">no LAYOUT-OPTIONS.json for '+
      'this pipeline yet</div>';
    var opts=cb.options||[],secs=Object.keys(cb.allowed||{});
    var h='<div class="desc" style="margin-top:4px">picked option: <b>'+
      esc(cb.pick||'—')+'</b></div>';
    h+='<table class="comptab"><tr><th>section</th>';
    opts.forEach(function(o){h+='<th>'+esc(o.id)+' · '+esc(o.label||'')+'</th>'});
    h+='<th>allowed</th></tr>';
    secs.forEach(function(s){
      h+='<tr><td class="sec">'+esc(s)+'</td>';
      opts.forEach(function(o){
        var v=(o.compositions||{})[s];
        h+='<td>'+(v?'<span class="o'+(cb.pick===o.id?' pickd':'')+'">'+esc(v)+'</span>':'—')+'</td>'});
      h+='<td>'+((cb.allowed[s]||[]).map(function(a){
        return '<span class="o">'+esc(a)+'</span>'}).join(''))+'</td></tr>'});
    return h+'</table>';
  }

  // saved design systems — persist + reload the combination
  function savedView(){
    var ss=DATA.saved_systems||[];
    var h='<div class="desc">Current combination — vibe <b>'+
      esc(BAKED||'baseline')+'</b> + every signed pick — saved '
      +'as a named, reloadable design-system file.</div>'+
      '<div class="saves"><input id="sysName" placeholder="system name">'+
      '<button class="pick" id="sysSave">Save system</button></div>';
    ss.forEach(function(s){
      h+='<div class="card" style="padding:14px"><div class="ch">'+
         '<span class="nm">'+esc(s.name||s.slug)+'</span>'+
         '<span class="score">'+esc(s.vibe||'')+'</span></div>'+
         '<div class="cb"><div class="desc">'+
         (s.default_mode?'default '+esc(s.default_mode)+' · ':'')+
         (s.picks||[]).map(function(p){
           return esc(p.element)+' → '+esc(p.variant)}).join(' · ')+
         '</div></div><div class="cf">'+
         '<button class="pick" data-load="'+esc(s.slug)+'">Load</button>'+
         '<span class="pstat"></span></div></div>'});
    if(!ss.length)h+='<div class="empty">no saved systems yet</div>';
    return h;
  }
  function wireSaved(){
    var save=document.getElementById('sysSave');
    if(save)save.onclick=function(){
      var nm=document.getElementById('sysName').value;
      api('/save-system',{pipeline:PIPELINE,name:nm,
        mode:document.documentElement.dataset.theme}).then(function(j){
        toast(j.message||(j.ok?'saved':'refused'));
        if(j.ok){var s=j.system||{slug:(nm||'').toLowerCase().
          replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,''),
          name:nm,vibe:BAKED,picks:[]};
          DATA.saved_systems=(DATA.saved_systems||[]).concat([s]);
          board()}})};
    document.querySelectorAll('[data-load]').forEach(function(b){
      b.onclick=function(){
        var s=(DATA.saved_systems||[]).filter(function(x){
          return x.slug===b.dataset.load})[0];
        if(!s)return;
        BAKED=s.vibe||'baseline';
        DATA.picked_elements={vibe:BAKED};
        (s.picks||[]).forEach(function(p){
          DATA.picked_elements[p.element]=p.variant});
        toast('system “'+s.name+'” loaded — vibe '+BAKED+
              ' · picks shown are its signed registry');
        CUR='vibe';rail();board()}});
  }

  var INGEST=null;
  function ingestPane(el){
    el.innerHTML='<h1>Ingest — style donor</h1>'+
      '<div class="desc">Drop a URL or paste page HTML — the page is '+
      'sliced into sections, vectorised through the shared bank '+
      'parser, matched against the exemplar bank, and its style '+
      'extracted into a draft DNA.</div>'+
      '<div class="ingbar"><input id="ingUrl" placeholder='+
      '"https://site.example/page">'+
      '<textarea id="ingHtml" placeholder='+
      '"…or paste full page HTML here"></textarea>'+
      '<button id="ingGo" class="abtn">Ingest</button></div>'+
      '<div id="ingOut"></div>';
    el.querySelector('#ingGo').onclick=function(){
      var u=el.querySelector('#ingUrl').value.trim(),
          h=el.querySelector('#ingHtml').value.trim();
      if(!u&&!h){toast('need a URL or pasted HTML');return}
      el.querySelector('#ingOut').innerHTML=
        '<div class="desc">ingesting…</div>';
      api('/ingest',{pipeline:PIPELINE,url:u,html:h}).then(function(j){
        INGEST=j;renderIngest(el,j)})};
  }
  function renderIngest(el,j){
    var out=el.querySelector('#ingOut');
    if(j.error){out.innerHTML='<div class="empty">'+esc(j.error)+
      '</div>';return}
    var d=j.dna_draft||{},ty=d.type||{},h='';
    h+='<div class="dnacard"><h2>Draft DNA</h2><div class="dnapal">';
    (d.palette||[]).forEach(function(c){
      h+='<span class="sw2" title="'+esc(c)+'" style="background:'+
         esc(c)+'"></span>'});
    h+='</div><div class="dnarow">ink <b>'+esc(d.ink||'—')+
       '</b> · surface <b>'+esc(d.surface||'—')+
       '</b> · accent <b>'+esc(d.accent_guess||'—')+'</b>'+
       ' · radius ≈ <b>'+esc(''+d.radius_px_median)+
       'px</b> · density <b>'+esc(d.density_guess||'')+'</b></div>';
    if((ty.families||[]).length)
      h+='<div class="dnarow">type '+
         esc(ty.families.slice(0,3).join(' · '))+'</div>';
    h+='<div class="dnarow"><input id="donorName" placeholder='+
       '"donor-name"> <button id="donorBtn" class="abtn">'+
       'Use as style donor</button></div></div>';
    h+='<h2 style="margin:18px 0 8px">Sections ('+
       (j.fragments||[]).length+')</h2>';
    (j.fragments||[]).forEach(function(f){
      var m=(f.matches||[])[0]||{};
      h+='<div class="ingrow"><div class="ingkind">'+esc(f.tag)+
         '<span>'+esc(f.kind)+' → '+esc(f.topo_guess||'?')+
         '</span></div><div class="ingmatch">'+
         (m.cls?('<b>'+esc(m.cls)+'</b> '+esc(m.slug)+
          ' <span class="score">'+m.score+'</span>'):'—')+
         '<div class="ingwhy">'+esc(((m.why||[])[0])||'')+'</div>'+
         '</div></div>'});
    out.innerHTML=h;
    var nb=out.querySelector('#donorBtn');
    if(nb)nb.onclick=function(){
      var nm=out.querySelector('#donorName').value.trim();
      if(!nm){toast('name the donor');return}
      api('/ingest-donor',{pipeline:PIPELINE,name:nm,data:INGEST})
        .then(function(r){toast(r.message||'saved')})};
  }

  // expand — one click, fullscreen overlay; Esc or X closes
  function expand(u){
    var ov=document.createElement('div');ov.id='xpOv';
    ov.innerHTML='<button id="xpX">&#x2715; close</button>'+
      '<iframe src="'+esc(u)+'"></iframe>';
    document.body.appendChild(ov);
    function close(){ov.remove();
      document.removeEventListener('keydown',k)}
    function k(e){if(e.key==='Escape')close()}
    document.addEventListener('keydown',k);
    ov.querySelector('#xpX').onclick=close;
    ov.onclick=function(e){if(e.target===ov)close()}}

  // viewport fit — desktop (vw=100%) renders iframes at 1280px and
  // scales them into the card; M/T keep the real small widths.
  // Menu cards swap to the -menu-desktop fragment at desktop.
  function fitIframes(){
    var vw=document.documentElement.style.getPropertyValue('--vw')
        ||'100%';
    document.querySelectorAll('.card .cb iframe').forEach(function(f){
      // remember each frame's own src once — derived variants come
      // back from it, never from a previously-swapped one
      var orig=f.dataset.orig||(f.dataset.src||f.src.split('?')[0]);
      if(!f.dataset.orig)f.dataset.orig=orig;
      var u=(vw==='100%'&&/-menu(-[a-z-]+)?\.html/.test(orig))
        ?orig.replace(/-menu(-[a-z-]+)?\.html/,'-menu-desktop.html')
        :orig;
      var cur=(f.dataset.src||'').split('?')[0];
      if(u!==cur){f.dataset.src=u;
        f.src=u+(document.documentElement.dataset.theme==='dark'
          ?'?theme=dark':'')}
      var cb=f.parentElement;
      if(vw==='100%'){
        var W=1280,s=Math.min(1,cb.clientWidth/W)||1;
        f.style.maxWidth='none';   // --vw cap would clamp the 1280 render
        f.style.width=W+'px';
        f.style.transform='scale('+s+')';
        f.style.transformOrigin='0 0';
        try{var hh=f.contentDocument.body.scrollHeight;
          if(hh>0){f.style.height=hh+'px';
            cb.style.height=(hh*s)+'px'}}catch(e){}
      }else{
        f.style.maxWidth='';f.style.width='';f.style.transform='';
        f.style.height='';cb.style.height=''}
    })}

  document.querySelectorAll('#vwCtl button').forEach(function(b){
    b.addEventListener('click',function(){setTimeout(fitIframes,80)})});

  function board(){
    var el=document.getElementById('board');
    if(CUR==='ingest'){ingestPane(el);return}
    if(CUR==='saved'){
      el.innerHTML='<h1>Saved systems</h1>'+savedView();
      wireSaved();return}
    var o=DATA.boards[CUR]||DATA.galleries[CUR];
    if(!o){el.innerHTML='<div class="empty">pick a board</div>';return}
    var h='<h1>'+esc(o.title)+'</h1><div class="desc">'+esc(o.desc||'')+'</div>';
    if(o.scrub){
      el.innerHTML=h+scrubView(o);
      el.querySelectorAll('.srow').forEach(function(rowEl){
        rowEl.querySelector('.snav').querySelectorAll('button')
          .forEach(function(b){b.onclick=function(){
            ROW=+rowEl.dataset.i;srowSwap(rowEl,+b.dataset.d)}});
        var f=rowEl.querySelector('iframe');
        f.onload=function(){try{
          f.style.height=f.contentDocument.body.scrollHeight+'px'
        }catch(e){f.style.height='480px'}};
        rowEl.querySelector('.spick').onclick=function(){
          var r=DATA.boards.page.scrub[+rowEl.dataset.i];
          var stat=rowEl.querySelector('.sstat');
          api('/element-pick',{pipeline:PIPELINE,
            element:'sec:'+r.sec,
            variant:r.alts[r.idx].id}).then(function(j){
            stat.className='sstat '+(j.ok?'ok':'bad');
            stat.textContent=j.ok?'signed ✓':(j.message||'refused');
            if(j.ok)toast(j.message)})};
      });
      setTheme(document.documentElement.dataset.theme);
      return;
    }
    if(o.compositions){
      var oh='<div class="grid">';
      (o.cards||[]).forEach(function(c,i){oh+=card(c,i)});
      oh+='</div><details class="compmat"><summary>composition '+
          'matrix — the b-row vocabulary</summary>'+
          compBoard(o.compositions)+'</details>';
      el.innerHTML=h+oh;
      el.querySelectorAll('.pick').forEach(function(b){
        b.onclick=function(){doPick(b)}});
      el.querySelectorAll('.xp').forEach(function(b){
        b.onclick=function(e){e.stopPropagation();expand(b.dataset.x)}});
      el.querySelectorAll('.cb iframe').forEach(function(f){
        f.addEventListener('load',function(){setTimeout(fitIframes,90)})});
      setTimeout(fitIframes,150);
      applyTheme(document.documentElement.dataset.theme);
      return}
    var tags=[];(o.cards||[]).forEach(function(c){
      (c.tags||[]).forEach(function(t){if(tags.indexOf(t)<0)tags.push(t)})});
    if(o.emitted_n!=null&&DATA.palette){
      var bk=(DATA.palette.skeleton_backlog||{});
      var bl=0;Object.keys(o.groups?o.groups.reduce(function(m,g){
        m[g.element]=1;return m},{}):{}).forEach(function(e){
        bl+=bk[e]||0});
      if(bl)h+='<div class="desc" style="opacity:.7">emitted '+
        o.emitted_n+' · raw skeleton backlog ~'+bl+
        ' (awaiting vectorisation)</div>';}
    h+='<div class="filters">'+filters(tags)+'</div><div class="grid">';
    var lastGrp=null;
    (o.cards||[]).forEach(function(c,i){
      var show=Object.keys(FILT).every(function(t){
        return (c.tags||[]).indexOf(t)>=0});
      if(c.grp&&c.grp!==lastGrp&&show){
        lastGrp=c.grp;
        h+='<div class="glabel">'+esc(c.grp)+'</div>';}
      h+=show?card(c,i):''});
    h+='</div>';
    if(!(o.cards||[]).length)h+='<div class="empty">nothing emitted here yet</div>';
    el.innerHTML=h;
    el.querySelectorAll('.fchip').forEach(function(b){
      b.onclick=function(ev){var t=b.dataset.f;
        if(!t)FILT={};
        else if(ev.shiftKey||ev.metaKey||ev.ctrlKey){
          if(FILT[t])delete FILT[t];else FILT[t]=1}
        else{var was=FILT[t];FILT={};if(!was)FILT[t]=1}
        board()}});
    el.querySelectorAll('.pick').forEach(function(b){
      b.onclick=function(){doPick(b)}});
    el.querySelectorAll('.xp').forEach(function(b){
      b.onclick=function(e){e.stopPropagation();expand(b.dataset.x)}});
    el.querySelectorAll('.cb iframe').forEach(function(f){
      f.addEventListener('load',function(){setTimeout(fitIframes,90)})});
    setTimeout(fitIframes,150);
    applyTheme(document.documentElement.dataset.theme);
  }

  // keyboard scrub — ←/→ moves card selection on boards,
  // swaps the current row's alternative on the scrub board
  document.addEventListener('keydown',function(ev){
    if(!DATA||CUR==null)return;
    if(ev.key!=='ArrowLeft'&&ev.key!=='ArrowRight')return;
    if(/INPUT|TEXTAREA/.test(ev.target.tagName))return;
    var d=ev.key==='ArrowRight'?1:-1;
    var o=DATA.boards[CUR]||DATA.galleries[CUR]||{};
    if(o.scrub){
      var rows=o.scrub;if(!rows.length)return;
      var rowEl=document.querySelector('.srow[data-i="'+ROW+'"]');
      if(rowEl)srowSwap(rowEl,d);
      ev.preventDefault();return;
    }
    var n=(o.cards||[]).length;if(!n)return;
    var cs=document.querySelectorAll('#board .card');
    var vis=Array.prototype.map.call(cs,
      function(c){return +c.dataset.idx});
    var at=vis.indexOf(SEL);
    at=at<0?(d>0?0:vis.length-1):(at+d+vis.length)%vis.length;
    SEL=vis.length?vis[at]:SEL;
    cs.forEach(function(c){
      c.classList.toggle('sel',+c.dataset.idx===SEL)});
    var selEl=document.querySelector(
      '#board .card[data-idx="'+SEL+'"]');
    if(selEl)selEl.scrollIntoView({block:'nearest'});
    ev.preventDefault();
  });

  function doPick(b){
    var stat=b.parentElement.querySelector('.pstat');
    b.disabled=true;stat.className='pstat';stat.textContent='…';
    if(b.dataset.wave){
      api('/nonce',{wave:b.dataset.wave,pipeline:PIPELINE}).then(function(n){
        if(!n.nonce){stat.className='pstat bad';
          stat.textContent=n.error||'nonce refused';b.disabled=false;return}
        api('/approve',{wave:b.dataset.wave,pipeline:PIPELINE,
          nonce:n.nonce,design:b.dataset.d}).then(function(j){
          stat.className='pstat '+(j.ok?'ok':'bad');
          stat.textContent=j.message||(j.ok?'recorded':'refused');
          if(j.ok){b.textContent='picked ✓';
            b.closest('.card').classList.add('picked');
            toast(j.message)}else b.disabled=false})})
    }else{
      api('/element-pick',{pipeline:PIPELINE,
        element:b.dataset.elem,variant:b.dataset.var}).then(function(j){
        stat.className='pstat '+(j.ok?'ok':'bad');
        stat.textContent=j.message||(j.ok?'recorded':'refused');
        if(j.ok){b.textContent='picked ✓';toast(j.message);
          DATA.picked_elements=DATA.picked_elements||{};
          DATA.picked_elements[b.dataset.elem]=b.dataset.var;
          if(b.dataset.elem==='vibe')
            BAKED=b.dataset.var;      // bake: every preview reframes
          board()}
        else b.disabled=false})}
  }

  // boot
  fetch('/page-token').then(function(r){return r.json()}).then(function(t){
    window.__wfTok=t.token;
    applyTheme(document.documentElement.dataset.theme||'light');
    if(!PIPELINE){
      document.getElementById('board').innerHTML=
        '<h1>picker</h1><div class="desc">open with '+
        '<code>?pipeline=&lt;abs pipeline dir&gt;</code></div>';
      return}
    fetch('/app-data?pipeline='+encodeURIComponent(PIPELINE))
      .then(function(r){return r.json()}).then(function(d){
        if(d.error){document.getElementById('board').innerHTML=
          '<div class="empty">'+esc(d.error)+'</div>';return}
        DATA=d;CUR='vibe';
        BAKED=(d.picked_elements||{}).vibe||'';
        topchips();rail();board()});
  });
})();
</script>
</body>
</html>
"""


def app_shell():
    return _SHELL.encode('utf-8')
