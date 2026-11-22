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
import datetime, hashlib, html.parser, json, os, re, sys, \
    threading, urllib.parse
from pathlib import Path

try:
    import vibe_atlas
except ImportError:
    vibe_atlas = None
try:
    import clamp
except ImportError:
    clamp = None

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
    {'id': 'footers', 'title': 'Footers', 'icon': 'bars',
     'desc': 'The emitted footer at every size — real pipeline '
             'render, same chrome as the built page.',
     'groups': [
         {'label': None, 'element': 'footer',
          'comps': ['footer-bar']}]},
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
    {'id': 'fx', 'title': 'Effects · bank', 'icon': 'fx',
     'desc': 'Interactive fx exemplars rendered live — hover and '
             'scroll states actually run. Pick signs the site-'
             'default effect; decorate toggles bind it per element. '
             'Applied only when the design’s motion vector is '
             'non-zero.',
     'groups': []},
]

# genmenu bank exemplars surfaced as scrubbable cards — gallery id
# → the topology dirs whose .html fragments render as-banked
# scroll-driven exemplars bind window scroll + read window.scrollY /
# documentElement.scrollTop — inside a stage the document never
# scrolls (the stage div does), so those demos would freeze. The shim
# maps the window scroll metrics onto the stage and forwards a scroll
# event per frame so handlers fire as if the page scrolled.
_STAGE_SCROLL_SHIM = (
    '<script>(function(){var s=document.querySelector(".wf-stage");'
    'if(!s)return;try{'
    'var de=document.documentElement;'
    'Object.defineProperty(window,"scrollY",{get:function(){'
    'return s.scrollTop}});'
    'Object.defineProperty(window,"pageYOffset",{get:function(){'
    'return s.scrollTop}});'
    'Object.defineProperty(window,"scrollX",{get:function(){'
    'return s.scrollLeft}});'
    'Object.defineProperty(de,"scrollTop",{get:function(){'
    'return s.scrollTop},set:function(v){s.scrollTop=v},'
    'configurable:true});'
    'Object.defineProperty(de,"scrollHeight",{get:function(){'
    'return s.scrollHeight},configurable:true});'
    's.addEventListener("scroll",function(){window.dispatchEvent('
    'new Event("scroll"))},{passive:true})}catch(e){}})();</script>')

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
_BANK_DIRS['fx'] = ()  # resolved below — every fx-* exemplar dir

PAGE_BOARDS = [
    {'id': 'home', 'title': 'Home', 'icon': 'home',
     'desc': 'Home page layouts — each option retrieves its own header, '
             'hero topology and section compositions from the bank, '
             'ranked by fit to the vibe genes and diversified; the w3/w4 '
             'cards of the emitted page follow. Pick signs the home '
             'composition'},
    {'id': 'service', 'title': 'Service', 'icon': 'doc',
     'desc': 'Service page layouts — hero, benefits, process, scope, '
             'pricing, proof, FAQ, CTA; each option a different bank '
             'hero topology + section set bound to this service\'s own '
             'copy. Pick signs the service composition'},
    {'id': 'location', 'title': 'Location', 'icon': 'pin',
     'desc': 'Location page layouts — area hero, coverage/suburbs, local '
             'proof, services, FAQ, contact; location content only '
             '(role-shaped placeholder where the plan has none). Pick '
             'signs the location '
             'composition'},
    {'id': 'contact', 'title': 'Contact', 'icon': 'mail',
     'desc': 'Contact page layouts — page hero, form + details, map/area, '
             'hours, FAQ; contact content only (role-shaped placeholder '
             'where the plan has none). Pick signs the contact '
             'composition'},
    {'id': 'blog', 'title': 'Blog', 'icon': 'news',
     'desc': 'Blog page layouts — page header, featured post, post '
             'list with author/date/read time and tags, categories, '
             'newsletter; guide links from the plan, role-shaped '
             'placeholder posts elsewhere. Pick signs the blog '
             'composition'},
]

# galleries whose cards pick an element (element → comp ids)
_NAV_COMPS = ('nav-bar', 'flyout-nav')

# menu-variant suffix → the genmenu bank topology whose real render
# the variant doc carries (E-M1). Distinct exemplar markup + css
# per variant — docked drawer, top sheet, bottom sheet, full-screen
# overlay, mega panel — never position overrides of one header.
_MENU_BANK_TOPOS = {
    '': 'nav-dropdown-menu',
    'dock-left': 'nav-dock-left-drawer',
    'top': 'nav-top-sheet',
    'sheet-bottom': 'nav-bottom-sheet',
    'full-screen': 'nav-modal',
    'mega': 'nav-mega-panel',
}


def _site_nav(block):
    """(brand, links, cta, groups) bound from the page's own nav
    comp — what every bank-topology menu doc rebinds over the
    exemplar's copy so no foreign brand ever renders (audit).
    links/cta are (href, label); groups are the drawer's IA heads."""
    brand = re.search(
        r'class="[^"]*\blogo\b[^"]*"[^>]*>\s*([^<]{1,60})', block)
    region = block
    m = re.search(r'class="[^"]*nav-links[^"]*"', block)
    if m:
        end = block.find('</nav>', m.start())
        region = block[m.start():end if end > 0 else len(block)]
    links = [(h, re.sub(r'<[^>]+>', '', lbl).strip())
             for h, lbl in re.findall(
                 r'<a [^>]*href="([^"]*)"[^>]*>(.*?)</a>',
                 region, re.S)]
    cm = re.search(r'class="[^"]*nav-cta[^"]*".*?</p>|'
                   r'class="[^"]*nav-cta[^"]*".*?</div>', block, re.S)
    cta = None
    if cm:
        am = re.search(r'<a [^>]*href="([^"]*)"[^>]*>(.*?)</a>',
                       cm.group(0), re.S)
        if am:
            cta = (am.group(1),
                   re.sub(r'<[^>]+>', '', am.group(2)).strip())
    groups = re.findall(r'class="nav-group-head"[^>]*>\s*([^<]+)',
                        block)
    return ((re.sub(r'<[^>]+>', '', brand.group(1)).strip()
             if brand else ''),
            [(h, l) for h, l in links if l],
            cta,
            [g.strip() for g in groups])


class _BankBind(html.parser.HTMLParser):
    """Rewrite a genmenu exemplar for the element-preview stage:
    bind the site's brand/links/CTA over the exemplar copy, load
    every menu layer CLOSED (aria-expanded=false + data-wf-panel on
    the overlay/dropdown elements the driver hides), and mark the
    triggers the driver toggles. Structure is the exemplar's own —
    only copy, aria and state markers change."""

    VOID = {'br', 'hr', 'img', 'input', 'meta', 'link', 'source',
            'wbr', 'area', 'base', 'col', 'embed', 'track', 'param'}
    _PANEL_CLS = re.compile(r'\binset-0\b|\btop-full\b')
    _SCRIM_CLS = re.compile(r'\bbg-\w|\bbackdrop|opacity')

    def __init__(self, brand, links, cta, groups):
        super().__init__(convert_charrefs=False)
        self.brand = brand or 'Site'
        self.links = links or [('#', 'Menu')]
        self.cta = cta or ('#contact', 'Contact')
        self.groups = groups or [self.brand]
        self.out = []
        self._stack = []
        self._brand_done = False
        self._li = 0          # nav-link cycle
        self._gi = 0          # group-head cycle
        self._panel_n = 0
        self._controls = set()
        self._trigger_seen = False
        self._btn_seen = False
        self._relabel = None   # (text, seen_first) inside relabel el
        self._relstk = []      # outer relabels restored on endtag

    @staticmethod
    def _aria(v):
        """Strip brand words from accessible names — the exemplar's
        aria-labels name the bank's brand; reduce them to the
        generic role the control plays (audit: no foreign copy)."""
        low = v.lower()
        if 'close' in low or 'dismiss' in low:
            return 'Close menu'
        if 'search' in low or 'filter' in low:
            return 'Search'
        if 'menu' in low or 'navigat' in low:
            return 'Menu'
        if 'dialog' in low or 'sheet' in low or 'drawer' in low:
            return 'Menu'
        return 'Menu'

    def _emit(self, tag, attrs, selfclose=False):
        a = dict(attrs)
        cls = a.get('class', '')
        if 'aria-label' in a:
            a['aria-label'] = self._aria(a['aria-label'])
        if 'alt' in a:
            a['alt'] = self.brand
        if 'title' in a:
            a['title'] = self.brand
        panel = False
        if (a.get('role') in ('dialog', 'menu') or
                self._PANEL_CLS.search(cls) or
                (a.get('id') and a['id'] in self._controls)):
            panel = True
        trigger = (tag in ('button', 'a') and
                   ('aria-haspopup' in a or 'aria-expanded' in a))
        if not trigger and tag == 'button' and not self._btn_seen \
                and not self._trigger_seen:
            # the bank's open-trigger carries no aria at all
            # (nav-modal) — the FIRST button in the doc is it
            trigger = True
        if tag == 'button':
            self._btn_seen = True
        if trigger:
            self._trigger_seen = True
            a['data-wf-trigger'] = ''
            a['aria-expanded'] = 'false'
            if 'aria-controls' not in a:
                a['aria-controls'] = 'wf-panel-0'
            else:
                self._controls.add(a['aria-controls'])
        if panel:
            a['data-wf-panel'] = ''
            if not a.get('id'):
                a['id'] = f'wf-panel-{self._panel_n}'
                self._panel_n += 1
            if (a.get('role') not in ('dialog', 'menu') and
                    self._SCRIM_CLS.search(cls) and 'z-' not in cls):
                a['data-wf-scrim'] = ''
            elif (a.get('role') not in ('dialog', 'menu') and
                  'inset-0' in cls and self._SCRIM_CLS.search(cls)):
                a['data-wf-scrim'] = ''
        # ---- copy rebind ------------------------------------
        relabeled = False
        if tag == 'a':
            if not self._brand_done and \
                    ('logo' in cls or 'brand' in cls or
                     a.get('href', '') in ('#', '#top', '/', '')):
                self._relabel = (self.brand, False)
                self._brand_done = True
            elif 'cta' in cls.lower():
                self._relabel = (self.cta[1], False)
                a['href'] = self.cta[0]
            else:
                h, l = self.links[self._li % len(self.links)]
                self._li += 1
                self._relabel = (l, False)
                if h:
                    a['href'] = h
            relabeled = True
        elif tag == 'button' and \
                'close' not in (a.get('aria-label') or '').lower() and \
                '\u00d7' not in (a.get('aria-label') or ''):
            if trigger:
                self._relabel = (
                    self.groups[self._gi % len(self.groups)], False)
                self._gi += 1
            elif 'cta' in cls.lower():
                self._relabel = (self.cta[1], False)
            else:
                h, l = self.links[self._li % len(self.links)]
                self._li += 1
                self._relabel = (l, False)
            relabeled = True
        elif tag in ('h1', 'h2', 'h3', 'h4') and \
                '[data-wf-panel]' in self._stack:
            self._relabel = (
                self.groups[self._gi % len(self.groups)], False)
            self._gi += 1
            relabeled = True
        elif tag in ('p', 'span', 'strong', 'div') and \
                '[data-wf-panel]' in self._stack and self._relabel is None:
            h, l = self.links[self._li % len(self.links)]
            self._li += 1
            self._relabel = (l, False)
            relabeled = True
        if tag == 'input':
            if 'placeholder' in a:
                a['placeholder'] = 'Search'
            if 'value' in a:
                a['value'] = ''
        if relabeled:
            self._relstk.append(tag)
        at = ''.join(
            f' {k}' if v in (None, '') else
            f' {k}="{html.escape(str(v), quote=True)}"'
            for k, v in a.items())
        self.out.append(f'<{tag}{at}{" /" if selfclose else ""}>')
        if not selfclose and tag not in self.VOID:
            self._stack.append(
                tag if not panel else '[data-wf-panel]')

    def handle_starttag(self, tag, attrs):
        self._emit(tag, attrs)

    def handle_startendtag(self, tag, attrs):
        self._emit(tag, attrs, selfclose=True)

    def handle_endtag(self, tag):
        self.out.append(f'</{tag}>')
        for i in range(len(self._stack) - 1, -1, -1):
            if self._stack[i] == tag or \
                    self._stack[i] == '[data-wf-panel]':
                del self._stack[i:]
                break
        if self._relstk and self._relstk[-1] == tag:
            self._relstk.pop()
            self._relabel = None

    def handle_data(self, data):
        if self._relabel is not None:
            if not self._relabel[1] and data.strip():
                self.out.append(
                    html.escape(self._relabel[0], quote=False))
                self._relabel = (self._relabel[0], True)
            elif not data.strip():
                self.out.append(html.escape(data, quote=False))
            # later text nodes in a relabeled element drop
            return
        if not self._brand_done and len(data.strip()) > 2 and \
                re.search(r'[A-Za-z]', data):
            # the exemplar's brand is bare text in several topologies
            # (no logo anchor) — the first word-y text node is it
            self.out.append(html.escape(self.brand, quote=False))
            self._brand_done = True
            return
        self.out.append(html.escape(data, quote=False))

    def handle_entityref(self, name):
        self.out.append(f'&{name};')

    def handle_charref(self, name):
        self.out.append(f'&#{name};')

    def handle_comment(self, data):
        self.out.append(f'<!--{data}-->')


# the menu driver's contract on a bank doc: triggers are the
# [data-wf-trigger] elements, the open layers are [data-wf-panel]
# (scrims [data-wf-scrim] close on click), the open state is one
# html.wf-menu-open class — ?menu=open enters it through the same
# toggle a click takes (audit: cards must render the real open
# state; docs must load closed with correct aria)
_BANK_MENU_CSS = (
    'html:not(.wf-menu-open) [data-wf-panel]{display:none !important}')
_BANK_MENU_DRV = (
    '<script>(function(){var d=document,r=d.documentElement;'
    'function so(o){r.classList.toggle("wf-menu-open",o);'
    'd.querySelectorAll("[data-wf-trigger]").forEach(function(b){'
    'b.setAttribute("aria-expanded",o?"true":"false")});'
    'if(d.body)d.body.style.overflow=o?"hidden":""}'
    'd.addEventListener("DOMContentLoaded",function(){'
    'if(new URLSearchParams(location.search).get("menu")==="open")'
    'so(true)});'
    'd.addEventListener("click",function(e){'
    'var t=e.target&&e.target.closest&&'
    'e.target.closest("[data-wf-trigger]");'
    'if(t){so(!r.classList.contains("wf-menu-open"));return}'
    'if(!r.classList.contains("wf-menu-open"))return;'
    'var cb=e.target.closest&&e.target.closest("button,a");'
    'if(cb&&/close|dismiss|\\u00d7/i.test('
    '(cb.getAttribute("aria-label")||"")+" "+(cb.textContent||"")))'
    '{so(false);return}'
    'var inP=e.target.closest&&e.target.closest('
    '"[role=\\"dialog\\"],[role=\\"menu\\"],'
    '[data-wf-panel]:not([data-wf-scrim])");'
    'if(!inP)so(false)});'
    'd.addEventListener("keydown",function(e){'
    'if(e.key==="Escape"&&r.classList.contains("wf-menu-open"))'
    'so(false)})})();</script>')


def _bank_doc(pd, cls, nav=None):
    """Render the first exemplar of a banked menu topology through
    _BankBind — the exemplar's own markup + bank-preview.css on the
    wf-stage, with the site's brand / IA links / CTA rebound (never
    the bank's copy), panels loading closed behind [data-wf-panel]
    and the menu driver honouring ?menu=open through the real
    toggle path. Requires emit_bank_previews to have run first (it
    ships the css)."""
    cdir = os.path.join(_GENMENU, cls)
    if not os.path.isdir(cdir):
        return None
    fns = sorted(f for f in os.listdir(cdir) if f.endswith('.html'))
    if not fns:
        return None
    frag = open(os.path.join(cdir, fns[0]), encoding='utf-8').read()
    frag = re.sub(r'/src/assets/[^\s"\'()]+',
                  '/media/placeholder.svg', frag)
    if nav:
        bnd = _BankBind(*nav)
        bnd.feed(frag)
        frag = ''.join(bnd.out)
    bankdir = os.path.join(pd, 'site', 'dist', 'preview', 'bank')
    head = ('<meta charset="utf-8"><meta name="viewport" '
            'content="width=device-width,initial-scale=1">'
            '<link rel="stylesheet" href="/built/' +
            urllib.parse.quote(os.path.join(
                pd, 'site', 'dist', 'preview', 'bank',
                'bank-preview.css')) + '">'
            '<link rel="stylesheet" href="/built/' +
            urllib.parse.quote(os.path.join(
                bankdir, 'bank-preview-extra.css')) + '">')
    stage = ('<div class="wf-stage mob">' + frag + '</div>')
    return ('<!--wf:bank:v5-->' +
            _doc(head, '', stage,
                 extra=_STAGE_SCROLL_SHIM + _BANK_MENU_DRV,
                 css=_BANK_STAGE_CSS + _BANK_MENU_CSS, chrome=True))

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
                 '@media (min-width:720px){.counter-1-grid-ul,'
                 '.gridcard-1-grid-ul{'
                 'grid-template-columns:repeat(4,1fr)!important}}',
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
_SINK_ORDER = ('nav-bar', 'flyout-nav', 'stacked-hero', 'cards-n',
               'split-media', 'stat-band', 'faq', 'form-panel',
               'footer-bar')


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
            # desktop surface — the nav as a bar, drawer never forced
            # open: burger hidden, links inline (menu board at D).
            # the desktop-menu state only exists at/above the bar
            # breakpoint — below it the fragment must show the real
            # mobile chrome (burger + closed drawer), not a forced
            # desktop row (r6 @390)
            _MENU_DESK = ('@media (min-width:60rem){'
                          '.burger,.nav-close{display:none !important}'
                          '.nav-links{position:static !important;'
                          'display:flex !important;transform:none '
                          '!important;visibility:visible !important;'
                          'opacity:1 !important;width:auto '
                          '!important;max-height:none !important;'
                          'inset:auto !important;border:0 !important;'
                          'box-shadow:none !important;padding:0 '
                          '!important;background:transparent '
                          '!important}}')
            fp = os.path.join(outdir, comp + '-menu-desktop.html')
            with open(fp, 'w', encoding='utf-8') as fh:
                fh.write(_doc(head, battr, block, '', _MENU_DESK))
            emitted[comp + '-menu-desktop'] = \
                f'preview/elements/{comp}-menu-desktop.html'
            # E-M1 — each menu variant is its own banked menu
            # topology's real render (the exemplar's markup + css
            # verbatim from the genmenu bank), never a position
            # override of this comp's header. The comp's own open
            # state is one ?menu=open away on its doc (E-M3).
            for suffix, cls in _MENU_BANK_TOPOS.items():
                src = _bank_doc(pd, cls, _site_nav(block))
                name = comp + '-menu' + ('-' + suffix if suffix else '')
                fp = os.path.join(outdir, name + '.html')
                if src:
                    with open(fp, 'w', encoding='utf-8') as fh:
                        fh.write(src)
                    emitted[name] = \
                        f'preview/elements/{name}.html'
                elif os.path.isfile(fp):
                    os.remove(fp)
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
    """[(topo_id, markup, extra_css)] — the audit found the injected
    CSS 'variants' were fake alternates: identical markup with Δ<9px
    (hero centered vs media-bg, process shapes, media flips). A
    topology candidate must be a real emitted comp (or a real bank
    topology), so this yields only the comp's own as-built doc."""
    return [('as-built', block, '')]


# the menu trigger is a designed affordance, not a text pill — the
# bank's .burger renders "Menu" text; this turns it into a hamburger
# icon button bound to tokens, applied to every emitted preview doc
_CHROME_CSS = (
    '.burger{display:none;align-items:center;'
    'justify-content:center;width:44px;height:44px;min-width:44px;'
    'min-height:44px;padding:0!important;font-size:0!important;'
    'border:1px solid var(--border-subtle,var(--border-default));'
    'border-radius:var(--radius,10px);background:transparent;'
    'color:var(--text-primary);box-shadow:none!important;'
    'cursor:pointer}'
    '@media (max-width:60rem){.burger{display:inline-flex}}'
    '.burger::after{content:"";width:20px;height:14px;'
    'background:repeating-linear-gradient(to bottom,'
    'currentColor 0 2px,transparent 2px 6px)}')


# live preview docs are inspect-only: in-card iframes are interactive
# (they scroll), but any link click would navigate the frame to a
# bare /built/… page or a 404 and blank the card. Anchor clicks keep
# firing for the doc's own JS (menu toggles etc.) — only the default
# navigation is cancelled, capture phase so per-doc handlers run first.
_NO_NAV = ('<script>document.addEventListener("click",function(e){'
           'var a=e.target&&e.target.closest&&e.target.closest("a");'
           'if(a&&a.getAttribute("href"))e.preventDefault()},true);'
           'document.addEventListener("submit",function(e){'
           'e.preventDefault()},true);'
           '</script>')


def _doc(head, battr, inner, extra='', css='', chrome=True):
    style = ('<style>' + (_CHROME_CSS if chrome else '') +
             (css or '') + '</style>')
    return ('<!doctype html><html lang="en"><head>' + head + style +
            '</head><body' + (battr or '') + '>' + inner + extra +
            _NO_NAV + '</body></html>')


def _fam_css(f):
    """a family's full bundle: :root overrides + dark overrides +
    the structural 'shape' layer (per-family hero topology /
    arrangement, derived since the bank has one hero skeleton)."""
    return ((':root{' + f['css'] + '}') if f.get('css') else '') + \
           (('[data-theme="dark"]{' + f['css_dark'] + '}')
            if f.get('css_dark') else '') + (f.get('shape') or '')


def emit_vibe_doc(pd, fam, bundle):
    """one vibe doc for a resolved bundle — emits only when
    missing (deterministic content); returns dist-relative path."""
    outdir = os.path.join(pd, 'site', 'dist', 'preview', 'vibes')
    blocks, _rows = _comp_blocks(pd)
    if not blocks:
        return None
    head, battr = blocks[next(iter(blocks))][1:3]
    body = ''
    for comp in _SINK_ORDER:
        if comp in blocks:
            body += blocks[comp][0]
    fp = os.path.join(outdir, fam + '.html')
    # the marker carries a hash of the emitted css — a producer fix
    # (e.g. the C.1 pairing) changes the resolved palette and the
    # cached doc must re-emit, so a version stamp alone is not enough
    css = _fam_css(bundle)
    # v7: preview docs cancel anchor navigation (_NO_NAV in _doc)
    mark = 'wf:vibe:v7:' + hashlib.sha256(
        css.encode()).hexdigest()[:8]
    stale = True
    if os.path.isfile(fp):
        try:
            with open(fp, encoding='utf-8', errors='replace') as rf:
                stale = mark not in rf.read(4096)
        except OSError:
            stale = True
    if stale:
        os.makedirs(outdir, exist_ok=True)
        theme = ('<script>document.documentElement.dataset.theme='
                 '"dark";document.documentElement.classList.add('
                 '"dark")</script>'
                 if bundle.get('theme') == 'dark' else '')
        # the type board's in-situ specimen iframes this doc and
        # posts live ladder-var overrides (and a theme flip) — the
        # hook tracks which vars it set so the next message clears
        # instead of stacking, and 'vibe default' restores the doc
        hook = ('<script>addEventListener("message",function(e){'
                'var d=e.data||{};if(d.wfVars){var r=document.'
                'documentElement.style;(window.__wfk||[]).forEach('
                'function(k){r.removeProperty(k)});window.__wfk=[];'
                'for(var k in d.wfVars){r.setProperty(k,d.wfVars[k]);'
                'window.__wfk.push(k)}}if(d.wfTheme){document.'
                'documentElement.dataset.theme=d.wfTheme;document.'
                'documentElement.classList.toggle("dark",'
                'd.wfTheme==="dark")}})</script>')
        with open(fp, 'w', encoding='utf-8') as fh:
            fh.write('<!--' + mark + '-->' + _doc(head, battr, body,
                                                 theme + hook, css))
    return 'preview/vibes/' + fam + '.html'


_LH_FALLBACK = {'-1': 1.5, '0': 1.6, '1': 1.5, '2': 1.35,
                '3': 1.25, '4': 1.2, '5': 1.15}


def _lh_ladder():
    """emitted --lh-N ladder, parsed from the producer's own
    constants in emit_global.py so the annotation can't drift."""
    try:
        with open(os.path.join(
                os.path.dirname(os.path.abspath(__file__)),
                'emit_global.py'), encoding='utf-8',
                errors='replace') as fh:
            m = {k: float(v) for k, v in re.findall(
                r'--lh-(-?\d+):\s*([0-9.]+)', fh.read())}
        return m or _LH_FALLBACK
    except OSError:
        return _LH_FALLBACK


_TS_ROWS = [
    ('h1', 'display'), ('h2', 'h1'), ('h3', 'h2'), ('h4', 'h3'),
    ('h5', 'h4'), ('h6', 'h5'),
    ('text-xxl', 'hero lead'), ('text-xl', 'lead'),
    ('text-l', 'large'), ('text-m', 'body'),
    ('text-s', 'small'), ('text-xs', 'caption'),
]
_TS_H_LH = {'h1': '5', 'h2': '4', 'h3': '3', 'h4': '2',
            'h5': '1', 'h6': '1'}
_TS_SPEC = 'Grumpy wizards make toxic brew for the king'

_TYPESCRIPT_CSS = """
body{margin:0;font-family:var(--font-body,ui-sans-serif,system-ui)}
.tscap{padding:14px 22px 0;font:600 11px ui-monospace,monospace;
     color:var(--text-muted,#888)}
.tspanel{padding:6px 22px 22px;background:var(--bg-canvas,#fff);
     color:var(--text-primary,#111)}
.tspanel h3{font:700 11px ui-monospace,monospace;margin:14px 0 8px;
     text-transform:uppercase;letter-spacing:.08em;
     color:var(--text-muted,#888)}
.tscols{display:grid;grid-template-columns:1fr 1fr;gap:28px}
.tscol>h4{font:600 11px ui-monospace,monospace;margin:0 0 6px;
     color:var(--text-muted,#888)}
.tsrow{display:grid;grid-template-columns:108px minmax(0,1fr);
     gap:12px;align-items:baseline;padding:7px 0;
     border-bottom:1px dashed var(--border,#ddd)}
.tsmeta{font:600 11px ui-monospace,monospace;
     color:var(--text-muted,#888);min-width:0}
.tsmeta i{display:block;font-style:normal;opacity:.75}
.tsspec{overflow-wrap:break-word;max-width:100%;min-width:0;
     font-family:var(--font-display,var(--font-body,ui-sans-serif))}
.tsnum{font:11px ui-monospace,monospace;
     color:var(--text-muted,#888)}
@media (max-width:840px){.tscols{grid-template-columns:1fr}}
@media (max-width:560px){.tsrow{grid-template-columns:1fr;gap:2px;
     padding:10px 0}.tsmeta{display:flex;gap:8px}.tsmeta i{display:inline}}
"""


def _ts_col(sizes, vp, lh, dw, trk):
    """one ladder column rendered at the emitted px for viewport vp
    ('320' or '1280'), annotated with px · ratio · lh · weight."""
    out = ''
    prev = None
    for key, role in _TS_ROWS:
        s = sizes.get(key) or {}
        px = (s.get('px') or {}).get(vp)
        if px is None:
            continue
        is_h = key.startswith('h')
        lhv = lh.get(_TS_H_LH.get(key, '0' if key != 'text-xs'
                                     else '-1'), 1.5)
        wt = dw if is_h else 400
        rat = (' · ×%.3g' % (px / prev)) if prev else ''
        prev = px
        tk = ' · tr %g' % trk if (is_h and trk) else ''
        out += ('<div class="tsrow"><div class="tsmeta"><b>' + key +
                '</b><i>' + role + '</i></div><div>'
                '<div class="tsspec" style="font-size:' +
                ('%g' % px) + 'px;line-height:' + str(lhv) +
                ';font-weight:' + str(wt) + '">' + _TS_SPEC +
                '</div><div class="tsnum">' + ('%g' % px) + 'px' +
                rat + ' · lh ' + str(lhv) + ' · ' + str(wt) + tk +
                '</div></div></div>')
    # button/label row — the emitted button type (body size, label wt)
    s = sizes.get('text-m') or {}
    px = (s.get('px') or {}).get(vp)
    if px is not None:
        out += ('<div class="tsrow"><div class="tsmeta"><b>button'
                '</b><i>label</i></div><div><div class="tsspec" '
                'style="font-size:' + ('%g' % px) + 'px;line-height:'
                + str(lh.get('0', 1.5)) + ';font-weight:600;'
                'text-transform:none">Get a quote</div>'
                '<div class="tsnum">' + ('%g' % px) +
                'px · lh ' + str(lh.get('0', 1.5)) + ' · 600'
                '</div></div></div>')
    return out


def emit_typescale_doc(pd, name='current', bundle=None, tok=None):
    """preview/typescale/<name>.html — the resolved type ladder at
    emitted px: mobile (320) vs desktop (1280) columns, light + dark
    panels. Reads TOKENS.json sizes — what emit actually produces —
    so a re-bake re-emits the ladder. `tok` overrides the token
    bundle for candidate ladders. Returns dist-relative path."""
    given_tok = tok is not None
    if tok is None:
        tp = os.path.join(pd, 'TOKENS.json')
        if not os.path.isfile(tp):
            return None
        try:
            with open(tp, encoding='utf-8') as fh:
                tok = json.load(fh)
        except (OSError, json.JSONDecodeError):
            return None
    sizes = tok.get('sizes') or {}
    fluid = tok.get('fluid') or {}
    knobs = tok.get('knobs') or {}
    outdir = os.path.join(pd, 'site', 'dist', 'preview', 'typescale')
    fp = os.path.join(outdir, name + '.html')
    stale = True
    if given_tok:
        # candidate ladders re-emit only when their own spec changed
        try:
            with open(fp, encoding='utf-8', errors='replace') as rf:
                stale = ('wf:ts:v3' not in rf.read(4096)) if \
                    os.path.isfile(fp) else True
        except OSError:
            stale = True
    elif os.path.isfile(fp) and \
            os.path.getmtime(fp) >= os.path.getmtime(tp):
        try:
            with open(fp, encoding='utf-8', errors='replace') as rf:
                stale = 'wf:ts:v3' not in rf.read(4096)
        except OSError:
            stale = True
    if stale:
        blocks, _rows = _comp_blocks(pd)
        head, battr = (blocks[next(iter(blocks))][1:3]
                       if blocks else ('<meta charset="utf-8">', ''))
        lh = _lh_ladder()
        dw = int(knobs.get('type.display_weight') or 700)
        trk = knobs.get('type.tracking_display') or 0
        mob = _ts_col(sizes, '320', lh, dw, trk)
        desk = _ts_col(sizes, '1280', lh, dw, trk)
        cap = ('resolved ladder — emitted px at mobile 320 vs desktop '
               '1280 · text ratio ' + str(fluid.get('text_scale_mob'))
               + '→' + str(fluid.get('text_scale_desk')) +
               ' · heading ratio ' + str(fluid.get('heading_scale_mob'))
               + '→' + str(fluid.get('heading_scale_desk')))
        panels = ''
        for th in ('light', 'dark'):
            panels += ('<section class="tspanel" data-theme="' + th +
                       '"><h3>' + th + '</h3><div class="tscols">'
                       '<div class="tscol"><h4>mobile · 320px</h4>' +
                       mob + '</div><div class="tscol"><h4>desktop · '
                       '1280px</h4>' + desk + '</div></div></section>')
        body = '<div class="tscap">' + cap + '</div>' + panels
        css = ((_fam_css(bundle) if bundle else '') + _TYPESCRIPT_CSS)
        os.makedirs(outdir, exist_ok=True)
        with open(fp, 'w', encoding='utf-8') as fh:
            # v3: preview docs cancel anchor navigation (_NO_NAV)
            fh.write('<!--wf:ts:v3-->' + _doc(head, battr, body,
                                              css=css))
    return 'preview/typescale/' + name + '.html'


_TS_TEXT_STEPS = {'text-xs': -2, 'text-s': -1, 'text-m': 0,
                  'text-l': 1, 'text-xl': 2, 'text-xxl': 3}
_TS_HEAD_STEPS = {'h6': -2, 'h5': -1, 'h4': 0, 'h3': 1,
                  'h2': 2, 'h1': 3}


def _ts_sizes_for(sizes, tr_mob, tr_desk, hr_mob, hr_desk):
    """candidate ladder px — keep the emitted base (n=0) rung and
    re-step every other rung at the candidate's ratios, the same
    stepped math clamp uses for TOKENS sizes."""
    out = {}
    for vp, tr, hr in (('320', tr_mob, hr_mob),
                       ('1280', tr_desk, hr_desk)):
        tb = (sizes.get('text-m') or {}).get('px', {}).get(vp)
        hb = (sizes.get('h4') or {}).get('px', {}).get(vp)
        for key, n in _TS_TEXT_STEPS.items():
            if tb is None:
                continue
            out.setdefault(key, {}).setdefault('px', {})[vp] = \
                round(tb * tr ** n, 2)
        for key, n in _TS_HEAD_STEPS.items():
            if hb is None:
                continue
            out.setdefault(key, {}).setdefault('px', {})[vp] = \
                round(hb * hr ** n, 2)
    return out


def _current_vibe_genes(pd):
    """the gene map behind the signed vibe pick — genes bundle,
    atlas preset, or preset family."""
    ep = _json_at(pd, 'ELEMENT-PICKS.json') or {}
    vibe = next((p for p in reversed(ep.get('picks') or [])
                 if p.get('element') == 'vibe'), None)
    if not vibe:
        return {}
    b = vibe.get('bundle') or {}
    if isinstance(b.get('genes'), dict) and b['genes']:
        return dict(b['genes'])
    v = vibe.get('variant') or ''
    if v.startswith('atlas:') and vibe_atlas is not None:
        p = vibe_atlas.PRESET_BY_ID.get(v[6:])
        if p:
            return dict(p['genes'])
    f = VIBE_FAMILIES.get(v)
    if f and isinstance(f.get('genes'), dict):
        return dict(f['genes'])
    return {}


def _current_vibe_bundle(pd):
    """the signed vibe pick's resolved bundle — css/css_dark/shape/
    theme. A preset family (e.g. 'warm') has no axis genes, so a
    type pick must layer onto ITS bundle, not a genes re-resolve."""
    ep = _json_at(pd, 'ELEMENT-PICKS.json') or {}
    vibe = next((p for p in reversed(ep.get('picks') or [])
                 if p.get('element') == 'vibe'), None)
    if not vibe:
        return {}
    b = vibe.get('bundle') or {}
    if isinstance(b.get('resolved'), dict):
        return dict(b['resolved'])
    if b.get('css') is not None or b.get('css_dark') is not None:
        return dict(b)
    v = vibe.get('variant') or ''
    f = VIBE_FAMILIES.get(v)
    if f:
        return {'css': f.get('css'), 'css_dark': f.get('css_dark'),
                'shape': f.get('shape'), 'theme': f.get('theme')}
    if v.startswith('atlas:') and vibe_atlas is not None:
        p = vibe_atlas.PRESET_BY_ID.get(v[6:])
        if p:
            r = vibe_atlas.resolve(p['genes'])
            return {k: r.get(k) for k in
                    ('css', 'css_dark', 'shape', 'theme')}
    if v.startswith('genes:') and isinstance(b, dict):
        return {k: b.get(k) for k in
                ('css', 'css_dark', 'shape', 'theme')}
    return {}


def _pairs(css):
    """'--k:v;--k:v' → {k: v}."""
    d = {}
    for decl in (css or '').split(';'):
        if ':' in decl:
            k, v = decl.split(':', 1)
            if k.strip():
                d[k.strip()] = v.strip()
    return d


def _css_merge(base, over):
    """two '--k:v;--k:v' decl strings → merged, `over` wins ties."""
    d = {}
    for s in (base, over):
        for decl in (s or '').split(';'):
            if ':' in decl:
                k, v = decl.split(':', 1)
                if k.strip():
                    d[k.strip()] = v.strip()
    return ';'.join('%s:%s' % kv for kv in d.items())


# C.1 pairing at the producer: preset palettes declare a light
# --action-primary with no --action-primary-ink on the light side,
# so the CTA band fell back to the base's white accent_foreground
# (~1.1:1), and some accents sit under 4.5:1 on their own canvas.
# Pair accent↔surface then ink↔accent once, at load — preview docs,
# /frame and signed bundles all read the normalized css.
if vibe_atlas is not None:
    for _f in VIBE_FAMILIES.values():
        for _k, _cv in (('css', '#FFFFFF'), ('css_dark', '#0E1416')):
            if _f.get(_k):
                _v = vibe_atlas.pair_ink(vibe_atlas.pair_surface(
                    _pairs(_f[_k]), _cv))
                _f[_k] = ';'.join('%s:%s' % kv for kv in _v.items())
    for _v in ('_f', '_k', '_cv', '_v'):
        globals().pop(_v, None)


def _type_sign_bundle(pd, variant, spec=None):
    """rebuild the signed bundle for a type pick — the SERVER
    computes it: a 'genes:<hash>' candidate's type-gene deltas and
    its ladder, or a 'custom:<sha>' editor spec's sanitized params,
    layered over the currently signed vibe bundle, so a preset
    family keeps its palette and the ladder is signed, not
    client-supplied."""
    if vibe_atlas is None:
        return None
    tok = _json_at(pd, 'TOKENS.json') or {}
    fluid = tok.get('fluid') or {}
    overrides, custom, fl = {}, None, None
    if str(variant).startswith('custom:'):
        if spec is None:
            return None
        custom = _clean_type_spec(spec, fluid)
        if custom['head_face']:
            overrides['display-face'] = custom['head_face']
    elif str(variant).startswith('genes:'):
        card = next((c for c in type_candidates(pd)
                     if c.get('variant') == variant or
                     variant in (c.get('aliases') or ())), None)
        if not card:
            return None
        overrides = dict(card.get('genes') or {})
        fl = card.get('fluid') or {}
    else:
        return None
        return None
    base_genes = _current_vibe_genes(pd)
    merged = dict(base_genes)
    merged.update(overrides)
    r = vibe_atlas.resolve(merged)
    vb = _current_vibe_bundle(pd)
    # vars the overrides OWN (e.g. a display-face delta emits only
    # light css) must not be re-overridden by the vibe's dark decls —
    # drop them from the base dark before overlaying
    if overrides:
        ro = vibe_atlas.resolve(overrides)
        own = {k for d in (ro.get('css'), ro.get('css_dark'))
               for k in _pairs(d)}
        vd = {k: v for k, v in _pairs(vb.get('css_dark')).items()
              if k not in own}
        vb = dict(vb, css_dark=';'.join(f'{k}:{v}'
                                        for k, v in vd.items()))
    if custom is not None:
        rungs = _custom_ladder(fluid, custom)
        extra = ';'.join('--%s:%s' % kv for kv in rungs.items())
        extra += (';' if extra else '') + \
            '--display-weight:%d;--lh-0:%g' % (
                custom['hweight'], custom['lheight'])
        if custom['body_face'] in _FACE_STACKS:
            # the resolved vibe emits --font-body itself — the
            # primitive alone would never reach the cascade
            extra += (';' if extra else '') + \
                '--primitive-font-body:%s;--font-body:%s' % (
                    _FACE_STACKS[custom['body_face']],
                    _FACE_STACKS[custom['body_face']])
        ladder = extra
    else:
        ladder = _ladder_css(
            fluid, fl.get('text_scale_mob'), fl.get('text_scale_desk'),
            fl.get('heading_scale_mob'), fl.get('heading_scale_desk'))
    css = _css_merge(vb.get('css'), r.get('css'))
    css_dark = _css_merge(vb.get('css_dark'), r.get('css_dark'))
    if ladder:
        css += (';' if css else '') + ladder
        css_dark += (';' if css_dark else '') + ladder
    shape = (r.get('shape') or '') if base_genes else \
        (vb.get('shape') or '') + (r.get('shape') or '')
    if custom is not None:
        # the vibe's type-contrast shape rules pin literal heading
        # weights (h1,h2,h3,.sec-h{font-weight:NNN}) that would
        # outrank the producer's var(--display-weight) decls — bind
        # them back to the signed var, later in the same cascade so
        # the editor's chosen weight actually ships
        shape += ('h1,h2,h3,.sec-h{font-weight:'
                  'var(--display-weight)}')
    bundle = {'genes': merged,
              'resolved': {
                  'css': css, 'css_dark': css_dark, 'shape': shape,
                  'theme': vb.get('theme') or r.get('theme'),
                  'tokens': {'light': dict(
                      (p.split(':', 1) for p in css.split(';')
                       if ':' in p)),
                             'dark': dict(
                      (p.split(':', 1) for p in css_dark.split(';')
                       if ':' in p))}}}
    if custom is not None:
        bundle['type_spec'] = custom
    return bundle


def _ladder_css(fluid, tm, tr, hm, hr):
    """a candidate ladder's rungs as ACSS clamp vars — signing them
    rebinds every preview's type scale, not just the doc."""
    if clamp is None:
        return ''
    s = dict(fluid)
    s.update(text_scale_mob=tm, text_scale_desk=tr,
             heading_scale_mob=hm, heading_scale_desk=hr)
    try:
        rungs = clamp.sizes(s)
    except Exception:
        return ''
    return ';'.join('--%s:%s' % (k, v) for k, v in
                    rungs.items()
                    if k.startswith('text-') or
                    re.fullmatch(r'h[1-6]', k))


_FACE_STACKS = {
    'sans': 'ui-sans-serif,system-ui,sans-serif',
    'serif': 'Georgia,"Times New Roman",serif',
    'mono': 'ui-monospace,"SF Mono",Menlo,monospace',
    # 'mixed' heads are serif — the allele's own mapping
    'mixed': 'Georgia,"Times New Roman",serif'}


def _clean_type_spec(spec, fluid):
    """whitelist + clamp the custom-ladder editor params — the
    client's numbers never reach clamp raw. Defaults are the
    pipeline's own fluid record."""
    spec = spec if isinstance(spec, dict) else {}
    f = fluid or {}

    def _n(k, lo, hi, dflt):
        try:
            v = float(spec.get(k, dflt))
        except (TypeError, ValueError):
            v = float(dflt)
        return max(lo, min(hi, v))
    # bmin < 12 inverts the ladder: text-s/xs and h5/h6 pin at
    # 11-12px, so a 10px base signs a smaller base rung than its
    # own small rungs
    bmin = _n('bmin', 12, 32, float(f.get('text_base_mob') or 16))
    bmax = _n('bmax', 10, 40, float(f.get('text_base_desk') or 18))
    rmin = _n('rmin', 1.0, 1.8, float(f.get('text_scale_mob') or 1.2))
    rmax = _n('rmax', 1.0, 1.9, float(f.get('text_scale_desk') or 1.333))
    if bmin > bmax:
        bmin, bmax = bmax, bmin
    if rmin > rmax:
        rmin, rmax = rmax, rmin
    vpm = int(_n('vpmin', 240, 1024, int(f.get('vp_min') or 320)))
    vpx = int(_n('vpmax', 241, 1920, int(f.get('vp_max') or 1280)))
    if vpx <= vpm:
        vpx = vpm + 1
    try:
        steps = int(spec.get('steps', 6))
    except (TypeError, ValueError):
        steps = 6
    hweight = int(_n('hweight', 400, 900, 700))
    lheight = _n('lheight', 1.2, 2.0, 1.55)
    hf = spec.get('head_face')
    bf = spec.get('body_face')
    return {'bmin': bmin, 'bmax': bmax, 'rmin': rmin, 'rmax': rmax,
            'vpmin': vpm, 'vpmax': vpx, 'steps': max(2, min(6, steps)),
            'hweight': hweight, 'lheight': lheight,
            'head_face': hf if hf in _FACE_STACKS else None,
            'body_face': bf if bf in ('sans', 'serif', 'mono')
                         else None}


def _custom_ladder(fluid, spec):
    """custom editor spec → {rung: clamp css} — base/ratio/viewport
    widths from the spec over the pipeline's fluid record; heading
    rungs past `steps` collapse onto the smallest kept rung so the
    count is a real, signed choice. The one math /type-ladder
    previews and the sign path share."""
    if clamp is None:
        return {}
    f = dict(fluid or {})
    f.update(text_base_mob=spec['bmin'], text_base_desk=spec['bmax'],
             heading_base_mob=spec['bmin'],
             heading_base_desk=spec['bmax'],
             text_scale_mob=spec['rmin'], text_scale_desk=spec['rmax'],
             heading_scale_mob=spec['rmin'],
             heading_scale_desk=spec['rmax'],
             vp_min=spec['vpmin'], vp_max=spec['vpmax'])
    try:
        rungs = clamp.sizes(f)
    except Exception:
        return {}
    horder = sorted(clamp._HEAD_STEPS, key=lambda k: -clamp._HEAD_STEPS[k])
    # steps = distinct heading rungs: heads beyond it collapse to
    # the smallest kept rung (previously they re-stepped at the
    # text ratio — identical to the heading ratio in this spec, so
    # steps never changed the signed vars)
    if spec['steps'] < len(horder):
        smallest = horder[spec['steps'] - 1]
        for name in horder[spec['steps']:]:
            rungs[name] = rungs[smallest]
    return {k: v for k, v in rungs.items()
            if k.startswith('text-') or re.fullmatch(r'h[1-6]', k)}


def type_ladder(pipeline, spec):
    """POST /type-ladder — the custom editor's live preview: the
    sanitized spec → the clamp vars it would sign + emitted px at
    the spec's own viewports."""
    pd = G.Ctx(pipeline).dir
    tok = _json_at(pd, 'TOKENS.json') or {}
    fluid = tok.get('fluid') or {}
    clean = _clean_type_spec(spec, fluid)
    rungs = _custom_ladder(fluid, clean)
    if not rungs:
        return {'ok': False, 'error': 'clamp unavailable'}
    s = dict(fluid)
    s.update(vp_min=clean['vpmin'], vp_max=clean['vpmax'])
    # probes at fixed widths so the specimen's M/T/D toggle stays
    # valid however the spec moves its min/max viewport pins
    px = {}
    for name, css in rungs.items():
        try:
            px[name] = {str(w): round(
                clamp.px_at(css, w, s), 1)
                for w in (320, 768, 1280)}
        except Exception:
            pass
    varz = {'--' + k: v for k, v in rungs.items()}
    varz['--display-weight'] = str(clean['hweight'])
    varz['--lh-0'] = '%g' % clean['lheight']
    if clean['head_face'] in _FACE_STACKS:
        varz['--primitive-font-display'] = \
            _FACE_STACKS[clean['head_face']]
        varz['--font-display'] = _FACE_STACKS[clean['head_face']]
        if clean['head_face'] == 'mixed':
            # the allele pairs serif heads with a sans body
            varz['--primitive-font-body'] = _FACE_STACKS['sans']
            varz['--font-body'] = _FACE_STACKS['sans']
    if clean['body_face'] in _FACE_STACKS:
        varz['--primitive-font-body'] = \
            _FACE_STACKS[clean['body_face']]
        varz['--font-body'] = _FACE_STACKS[clean['body_face']]
    return {'ok': True, 'spec': clean, 'vars': varz, 'px': px}


def type_candidates(pd):
    """candidate type ladders derived from the resolved vibe — the
    text ratio, heading ratio and display face vary inside the
    vibe's allowed alleles; each emits its own typescale doc and
    yields a pick card signed through element-pick (element 'type',
    variant 'genes:<hash>' — same path as vibe genes)."""
    if vibe_atlas is None:
        return []
    tok = _json_at(pd, 'TOKENS.json') or {}
    sizes = tok.get('sizes') or {}
    fluid = tok.get('fluid') or {}
    knobs = tok.get('knobs') or {}
    if not sizes:
        return []
    cur_tr = float(fluid.get('text_scale_desk') or 1.333)
    cur_hr = float(fluid.get('heading_scale_desk') or cur_tr)
    cur_tm = float(fluid.get('text_scale_mob') or cur_tr)
    cur_hm = float(fluid.get('heading_scale_mob') or cur_hr)
    base = _current_vibe_genes(pd)
    # ratio sweep at the resolved face, then the resolved ladder
    # through each other display-face allele the vibe allows
    specs = [
        ('resolved', cur_tm, cur_tr, cur_hm, cur_hr, None),
        ('tight', 1.19, 1.2, 1.19, 1.2, None),
        ('display', 1.28, 1.333, 1.36, 1.5, None),
    ]
    # every face allele is always a candidate — dropping the face
    # that equals the vibe's own leaves a signed 'sans face' pick
    # with no candidate after a re-bake to a sans vibe ('unknown').
    # Content-dedupe below folds it into the resolved card instead
    # and keeps its variant id as an alias on that card.
    for f in ('sans', 'serif', 'mono', 'mixed'):
        specs.append((f + ' face', cur_tm, cur_tr, cur_hm,
                      cur_hr, f))
    cards, seen, by_ch = [], set(), {}
    for label, tm, tr, hm, hr, face in specs:
        # card genes are the candidate's own overrides — the pick
        # merges them onto the CURRENT signed vibe at click time, so
        # a re-bake never leaves a stale base baked into the card
        overrides = {'display-face': face} if face else {}
        merged = dict(base)
        merged.update(overrides)
        # the variant names the candidate SPEC, not the merged
        # genes — a re-bake changes the base, and the signed pick
        # is rebuilt over the CURRENT vibe at click time, so the
        # variant must stay stable across bakes
        # F111-2 — ids name the candidate spec only (label + face
        # override): hashing the current fluid ratios would change
        # the variant id after every re-bake even though the pick
        # rebuilds over the CURRENT vibe at click time
        gh = hashlib.sha256(json.dumps(
            {'l': label, 'g': sorted(overrides.items())},
            sort_keys=True).encode()).hexdigest()[:10]
        # the emitted doc still keys on resolved content
        ch = hashlib.sha256(json.dumps(
            {'g': sorted(merged.items()), 'f': [tm, tr, hm, hr]},
            sort_keys=True).encode()).hexdigest()[:10]
        if gh in seen:
            continue
        seen.add(gh)
        # same resolved content as an earlier card (e.g. 'sans face'
        # over a sans vibe = 'resolved') — skip the duplicate doc
        # and card but alias its variant id so the pick still signs
        if ch in by_ch:
            by_ch[ch].setdefault('aliases', []).append(
                'genes:' + gh)
            continue
        bundle = vibe_atlas.resolve(merged)
        ladder = _ladder_css(fluid, tm, tr, hm, hr)
        if ladder:
            bundle['css'] = (bundle.get('css') or '') + \
                (';' if bundle.get('css') else '') + ladder
            bundle['css_dark'] = (bundle.get('css_dark') or '') + \
                (';' if bundle.get('css_dark') else '') + ladder
        ctok = dict(tok)
        ctok['sizes'] = _ts_sizes_for(sizes, tm, tr, hm, hr)
        ctok['fluid'] = dict(fluid, text_scale_mob=tm,
                             text_scale_desk=tr,
                             heading_scale_mob=hm,
                             heading_scale_desk=hr)
        if merged == base and [tm, tr, hm, hr] == \
                [cur_tm, cur_tr, cur_hm, cur_hr]:
            # this spec IS the current ladder through the signed vibe
            # — a cand- doc of it would be a near-identical fake. The
            # card previews the real current doc instead, and every
            # spec that resolves to this state folds in as an alias.
            cur = emit_typescale_doc(pd)
            cards.append({
                'id': 'tsc-' + gh, 'name': 'Ladder — resolved',
                'preview': ('/built/' + urllib.parse.quote(
                    os.path.join(pd, 'site', 'dist', cur)))
                if cur else None,
                'tags': ['current'],
                'desc': 'the current ladder — as signed on this vibe',
                'element': 'type', 'variant': 'genes:' + gh,
                'genes': overrides,
                'fluid': {'text_scale_mob': tm, 'text_scale_desk': tr,
                          'heading_scale_mob': hm,
                          'heading_scale_desk': hr}})
            by_ch[ch] = cards[-1]
            continue
        rel = emit_typescale_doc(pd, 'cand-' + ch, bundle=bundle,
                                 tok=ctok)
        if not rel:
            continue
        tags = ['text x%g>%g' % (tm, tr),
                'heads x%g>%g' % (hm, hr)]
        if face:
            tags.append(face)
        cards.append({
            'id': 'tsc-' + gh, 'name': 'Ladder — ' + label,
            'preview': '/built/' + urllib.parse.quote(
                os.path.join(pd, 'site', 'dist', rel)),
            'tags': tags,
            'desc': 'text ratio %g→%g · headings %g→%g%s'
                    % (tm, tr, hm, hr,
                       ' · ' + face + ' face' if face else '') + \
                    ' — h1-h4, lead, body at 320/1280',
            'element': 'type', 'variant': 'genes:' + gh,
            'genes': overrides,
            'fluid': {'text_scale_mob': tm, 'text_scale_desk': tr,
                      'heading_scale_mob': hm,
                      'heading_scale_desk': hr}})
        by_ch[ch] = cards[-1]
        if len(cards) >= 6:
            break
    return cards


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


def _enum_stat(answer):
    """A proof stat the block's own answer carries: the count of the
    parts it enumerates after its dash ("… – visit logs, photo records
    and a supervisor sign-off" → 3 · visit logs · photo records ·
    supervisor sign-off). None when the answer lists no parts."""
    tail = re.split(r'\s[–—-]\s', re.sub(r'\*+', '', str(answer or '')),
                    maxsplit=1)[1:]
    if not tail:
        return None
    sentence = re.split(r'[.;:…]', tail[0])[0]
    # the list ends where a relative clause starts ("… sign-off the
    # strata manager files", ", which prove …"); an article after
    # "and" / "," is a part, a relative pronoun never is
    clause, *rest = re.split(r'(?<! and)(?<!,) the |,?\s(?:that|which)\s',
                             sentence, maxsplit=1)
    if rest and re.search(r',|\sand\s', rest[0]):
        return None
    parts = [re.sub(r'^(a|an|the)\s+', '', x.strip())
             for x in re.split(r',\s*(?:and\s+)?|\s+and\s+', clause)]
    # a count is only proof when the list is whole: any empty or
    # sentence-length part means this isn't a clean enumeration
    if not all(x and len(x.split()) <= 4 for x in parts) \
            or not 2 <= len(parts) <= 6:
        return None
    return {'value': str(len(parts)), 'label': ' · '.join(parts)}


_L = ('<em class="wf-lorem" data-slot="{s}">Lorem ipsum — '
      'unmapped {s}</em>')
_SEQ_CSS = ('.wf-seq{list-style:none;padding-left:0;counter-reset:'
            'wstep;display:grid;gap:1em}'
            '.wf-seq .wf-seq-num{display:inline-block;min-width:1.8em;'
            'font-weight:800;color:var(--action-primary,#555)}'
            '.wf-seq-spine{position:relative;padding-left:2.4em}'
            '.wf-seq-spine::before{content:"";position:absolute;'
            'left:.8em;top:.4em;bottom:.4em;width:2px;'
            'background:var(--border-default,#999)}'
            '.wf-seq-spine .wf-seq-row{position:relative}'
            '.wf-seq-spine .wf-seq-num{position:absolute;left:-2.4em;'
            'top:.1em;width:1.8em;height:1.8em;min-width:0;'
            'border-radius:50%;background:var(--action-primary,#555);'
            'color:var(--bg-base,#fff);display:flex;align-items:center;'
            'justify-content:center;font-size:.72em}'
            '.wf-seq-rail{grid-template-columns:repeat(auto-fit,'
            'minmax(200px,1fr));gap:1.2em}'
            '.wf-seq-rail .wf-seq-row{border-top:3px solid '
            'var(--action-primary,#555);padding-top:.5em}'
            '.wf-seq-rail .wf-seq-num{display:block;font-size:2.2em;'
            'line-height:1;margin-bottom:.2em}'
            '.wf-seq-badge .wf-seq-row{display:flex;gap:.9em;'
            'align-items:flex-start;background:var(--bg-elevated,'
            '#f2f2f2);border:1px solid var(--border-default,#ddd);'
            'border-radius:12px;padding:.9em}'
            '.wf-seq-badge .wf-seq-num{flex:none;width:2em;height:2em;'
            'min-width:0;border-radius:10px;background:'
            'var(--action-primary,#555);color:var(--bg-base,#fff);'
            'display:flex;align-items:center;justify-content:center}')

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
                     (x.replace('**', '') for x in sents
                      if t.lower() in x.lower()), '')}
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
        stat = next((i for i in items if i.get('value')), None) \
            or _enum_stat(sub)
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
    elif comp in ('timeline-spine', 'numbered-rail', 'icon-badge'):
        # shape variants of the step section — used for option rows
        # the plan did not emit (emit can't reach non-own comps)
        shape = {'timeline-spine': 'wf-seq-spine',
                 'numbered-rail': 'wf-seq-rail',
                 'icon-badge': 'wf-seq-badge'}[comp]
        h += '<div><div class="sec-head">' \
             f'<h2 class="text-fluid-3">{head}</h2>'
        if sub:
            h += f'<p class="lede">{_inline(sub)}</p>'
        its = items or [{'term': _Raw(_L.format(s='items[]')),
                         'text': _Raw(_L.format(s='items[]'))}
                        for _i in range(4)]
        if not items:
            unmapped.append('items')
        h += f'<ol class="wf-seq {shape} list-plain">' + \
            ''.join(f'<li class="wf-seq-row"><span class="wf-seq-num">'
                    f'{n + 1:02d}</span><div><h3 class="t0 sub-h">'
                    f'{_val(i.get("term") or i.get("title") or "")}'
                    f'</h3><p class="t0 sub-p">'
                    f'{_val(i.get("text") or "")}</p></div></li>'
                    for n, i in enumerate(its)) + '</ol></div>'
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
        # sequence shape variety: the emitted block's own topo
        # variants cover it when present; non-own rows get the three
        # shape comps (they render via _slot_frag, no artifact needed)
        if 'sequence' in cand and 'sequence' not in blocks:
            cand += ['timeline-spine', 'numbered-rail', 'icon-badge']
        for c in cand:
            src = blocks.get(c)
            if src:
                # HARD RULE: a candidate renders the comp's real
                # emitted fragment — the pipeline's own file — never
                # a re-rendered skeleton when an artifact exists
                markup, bhead, battr, css = src[0], src[1], src[2], ''
            else:
                if c in _NAV_COMPS or c == 'footer-bar':
                    # chrome never fabricates: a header/footer
                    # candidate without the pipeline's own emitted
                    # fragment is missing, not a _slot_frag mock
                    missing.append(c)
                    continue
                inner, unmap = _slot_frag(c, _copy_slot(pd, bid))
                if inner is None:
                    missing.append(c)
                    continue
                bhead, battr = rows[0][4], rows[0][5]
                markup = (f'<section class="sec-band surface-base '
                          f'density-regular" data-sec="{sec}" '
                          f'data-comp="{c}"><div class="sec-inner">'
                          + inner + '</div></section>')
                css = _LOREM_CSS + _SEQ_CSS
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


def _page_boards(pd):
    """{board: {'cards', 'compositions'}} — page_boards.py's per-page-
    type options (PAGE-BOARDS.json), each previewed as its built page
    (preview_build.emit_page_boards, rebuilt lazily when the inputs
    moved). A pick signs element layout:<board>."""
    import page_boards as PBD
    import preview_build
    ctx = G.Ctx(pd)
    doc = PBD.ensure(pd)
    bsite = os.path.join(pd, 'boards', 'site')
    try:
        stamp = open(os.path.join(bsite, '.inputs_sha')).read().strip()
    except OSError:
        stamp = ''
    opts = [o['id'] for b in doc['boards'].values() for o in b['options']]
    pages = {o: os.path.join(bsite, 'dist', 'preview', 'lo-' + o,
                             'index.html') for o in opts}
    err = None
    if stamp != PBD.render_sha(ctx, doc) or not all(
            os.path.isfile(p) for p in pages.values()):
        try:
            preview_build.emit_page_boards(ctx)
            doc = PBD.ensure(pd)
            pages = {o['id']: os.path.join(
                bsite, 'dist', 'preview', 'lo-' + o['id'], 'index.html')
                for b in doc['boards'].values() for o in b['options']}
        except SystemExit as e:
            err = str(e)
    picks = {p.get('element'): p.get('variant')
             for p in (_json_at(pd, 'ELEMENT-PICKS.json') or {})
             .get('picks', [])}
    out = {}
    for board, b in doc['boards'].items():
        cards = []
        for o in b['options']:
            fp = pages.get(o['id'])
            comps = o.get('compositions') or {}
            cards.append({
                'id': o['id'], 'name': o.get('label') or o['id'],
                'score': o.get('fit'),
                'preview': ('/built/' + urllib.parse.quote(fp))
                           if fp and os.path.isfile(fp) else None,
                'tags': ['layout', board, o['hero']['topology_id'],
                         o.get('header') or ''],
                'element': 'layout:' + board, 'variant': o['id'],
                'desc': ' · '.join(f'{r} {c}' for r, c in comps.items()),
                'compositions': comps})
        out[board] = {
            'cards': cards,
            'error': err,
            'compositions': {
                'allowed': {p['role']: p['candidates']
                            for p in b['plan']},
                'options': [{'id': o['id'], 'label': o.get('label'),
                             'compositions': o['compositions']}
                            for o in b['options']],
                'pick': picks.get('layout:' + board),
                'page_type': b.get('page_type'),
                'placeholder_slots': b.get('placeholder_slots'),
                'sources': {r: c.get('sources')
                            for r, c in (b.get('content') or {}).items()}}}
    return out


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
    ('action-primary-ink', 'action-primary', 4.5))


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
            decls.update(dict(re.findall(r'--([\w-]+)\s*:\s*([^;]+);?',
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
            over = dict(re.findall(r'--([\w-]+)\s*:\s*([^;]+);?',
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
    # bank docs first — emit_element_previews copies the real
    # nav-* menu-topology renders into elements/<comp>-menu*.html
    bank_cards, fxmap = emit_bank_previews(pd)
    emitted = emit_element_previews(pd)
    vibes_emitted = emit_vibe_previews(pd)
    contrast = contrast_audit(pd)
    scrub, bank_depth = emit_section_fragments(pd)
    cards = _picker_cards(ctx, pd)
    epicks = {p.get('element'): p.get('variant')
              for p in (_json_at(pd, 'ELEMENT-PICKS.json')
                        or {}).get('picks', [])}
    type_spec = next(
        ((p.get('bundle') or {}).get('type_spec')
         for p in (_json_at(pd, 'ELEMENT-PICKS.json')
                   or {}).get('picks', [])
         if p.get('element') == 'type'
         and isinstance(p.get('bundle'), dict)
         and (p.get('bundle') or {}).get('type_spec')),
        None)

    brief = _brief_file(ctx)
    dna = _json_at(pd, 'DNA.json') or _json_at(
        os.path.dirname(pd), 'DNA.json') or {}
    tokens = _json_at(pd, 'TOKENS.json') or _json_at(
        os.path.dirname(pd), 'TOKENS.json') or {}
    gates = _json_at(pd, 'GATES.json') or {}

    # element galleries — emitted preview cards (+ derived geometry
    # topos on menus) + bank options the build didn't emit
    lo = _json_at(pd, 'LAYOUT-OPTIONS.json') or {}
    lo_allowed = {k: list(dict.fromkeys(v or []))
                  for k, v in (lo.get('allowed') or {}).items()}
    galleries = {}
    for g in ELEMENT_GALLERIES:
        gcards = []
        for grp in g['groups']:
            comps = grp['comps']
            if g['id'] == 'chrome':
                # producer bank writes the full allowed nav/footer
                # class list into LAYOUT-OPTIONS — surface all of it
                key = 'nav' if grp['element'] == 'header' else 'footer'
                comps = lo_allowed.get(key) or comps
            for comp in comps:
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
                        # menu cards render the OPEN state through the
                        # real toggle driver (?menu=open) — the closed
                        # desktop bar is the -menu-desktop reference
                        q = ('?menu=open'
                             if g['id'] == 'menu' and
                             not key.endswith('-menu-desktop')
                             else '')
                        gcards.append({
                            'id': key, 'name': key,
                            'preview': '/built/' + urllib.parse.quote(
                                os.path.join(pd, 'site', 'dist', rel)) +
                                q,
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
    preset_cards = []
    clusters = []
    if vibe_atlas is not None:
        for p in vibe_atlas.PRESETS:
            r = vibe_atlas.resolve(p['genes'])
            rel = emit_vibe_doc(pd, 'atlas-' + p['id'], r)
            if p['cluster'] not in clusters:
                clusters.append(p['cluster'])
            toks = r['tokens']
            preset_cards.append({
                'id': p['id'], 'name': p['name'],
                'preview': '/built/' + urllib.parse.quote(
                    os.path.join(pd, 'site', 'dist', rel))
                    if rel else None,
                'tags': [p['cluster'],
                         p['theme'] or 'light'] + r['genes'],
                'grp': p['cluster'],
                'desc': ' · '.join(r['genes'][:5]) +
                        (' …' if len(r['genes']) > 5 else ''),
                'element': 'vibe', 'variant': p['id'],
                'genes': p['genes'],
                'swatch': [(toks['light'].get('--bg-canvas'),
                            toks['light'].get('--text-primary'),
                            toks['light'].get('--action-primary'))]})
    boards['vibe'] = {
        'id': 'vibe', 'title': 'Vibe space', 'icon': 'vibe',
        'desc': 'Vibes are a space, not a list — steer the genes '
                'directly (sliders) or start from a preset and '
                'tweak on top. Bake signs the resolved gene bundle.',
        'atlas': True,
        'axes': (vibe_atlas.AXES if vibe_atlas else []),
        'clusters': clusters,
        'cards': preset_cards,
        'core': [{'id': fam, 'name': f['name'],
                  'preview': '/built/' + urllib.parse.quote(
                      os.path.join(pd, 'site', 'dist',
                                   vibes_emitted[fam]))
                  if fam in vibes_emitted else None,
                  'tags': f['genes'] + [f.get('theme') or 'light'],
                  'genes': f['genes'], 'desc': f['desc'],
                  'element': 'vibe', 'variant': fam,
                  'contrast': contrast.get(fam)}
                 for fam, f in VIBE_FAMILIES.items()]}
    # the resolved type ladder (TOKENS.json px @ 320 / 1280)
    ts_rel = emit_typescale_doc(pd)
    boards['typescale'] = {
        'id': 'typescale', 'title': 'Type scale',
        'icon': 'type',
        'desc': 'Controls on top, one live specimen — set the '
                'ladder and sign it through Use this.',
        'typescale': True,
        'tsdoc': ('/built/' + urllib.parse.quote(
                  os.path.join(pd, 'site', 'dist', ts_rel))
                  if ts_rel else None),
        'cards': [],
        'presets': type_candidates(pd)}
    # step 2 — LAYOUT: whole-page scrub over section topologies,
    # then the option boards
    boards['page'] = {
        'id': 'page', 'title': 'Page · live scrub', 'icon': 'page',
        'desc': 'The whole page in the baked vibe — ‹ › on each '
                'row swaps that section\'s composition/topology '
                'in place; ✓ signs the row\'s choice.',
        'scrub': scrub, 'cards': []}
    pboards = _page_boards(pd)
    for b in PAGE_BOARDS:
        pb = pboards.get(b['id']) or {}
        bcards = list(pb.get('cards') or [])
        if b['id'] == 'home':
            # the emitted page's w3/w4 approval cards follow the home
            # layout options
            bcards += cards['layouts'] + cards['looks'] + cards['fine']
        boards[b['id']] = dict(b, cards=bcards,
                               compositions=pb.get('compositions'),
                               error=pb.get('error'))

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

    # a wave pick counts only when the gate verified the signed
    # operator record — write_gate stores `design` even when the
    # wave fails or approval is absent
    picked = {w: ((gates.get(w) or {}).get('design')
                  if (gates.get(w) or {}).get('approved') else None)
              for w in ('w3', 'w4')}
    return {'pipeline': pd,
            'picked_elements': epicks,
            'type_spec': type_spec,
            'vibe_genes': _current_vibe_genes(pd),
            'fluid': tokens.get('fluid') or {},
            'bank_depth': bank_depth,
            'palette': _palette(galleries),
            'saved_systems': list_systems(pd),
            'remix_sources': dna_sources(pd),
            'remix_groups': REMIX_GROUPS,
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
            'boards': boards, 'galleries': galleries,
            'fxmap': fxmap}, None


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

# every bank exemplar renders inside a fixed stage — the frags are
# authored as `h-full w-full` roots expecting a containing viewport,
# so a bare <body> stretches them edge-to-edge. transform:translateZ
# makes the stage the containing block for `position:fixed` children
# (cursor trails, pinned demos) so they fill the stage, not the frame.
_BANK_STAGE_CSS = (
    'html,body{min-height:100%}'
    'body{display:flex;flex-direction:column;align-items:center;'
    'justify-content:center;background:#e8e9ec;margin:0;'
    'padding:18px;box-sizing:border-box;gap:12px}'
    # E1 — the stage frames the fragment, it never restyles it:
    # transparent surface (the fragment's own bg-* / surface tokens
    # show), content-sized with token padding so nothing touches the
    # frame edge and no dead band stacks around the widget
    '.wf-stage{position:relative;overflow:auto;'
    'transform:translateZ(0);display:flex;'
    'border-radius:14px;'
    'box-shadow:0 10px 34px rgba(15,18,30,.16);'
    # content-sized both axes — a fragment wider than its siblings'
    # fixed widths expands the box instead of clipping inside it
    'width:max-content;min-width:min(100%,420px);max-width:96vw;'
    'max-height:78vh;'
    'padding:clamp(16px,3vw,32px);box-sizing:border-box}'
    '.wf-stage>*{margin:auto;flex:none}'
    # edge-pinned fx (fab strips, sheet handles) absolutely anchor
    # to the nearest positioned ancestor — this inner wrapper keeps
    # them inside the stage padding, ≥16px inset on every side
    '.wf-stage-in{position:relative;width:100%;min-height:100%;'
    'margin:auto;flex:none}'
    '.wf-stage.mob{width:min(360px,96%);height:min(660px,86vh);'
    'border-radius:24px}'
    # E1 — section/page-scale fragments never sit in the compact
    # stage (the 640x460 box clipped mega footers and tier pages):
    # full viewport width, content height, the fragment's own
    # surface edge-to-edge
    # page-scale fragments render at natural width (a 1440px
    # checkout would clip inside a 1280 box); the doc scrolls
    # horizontally instead, the picker scales the whole doc
    # align-self flex-start: the centered column body would push a
    # wider-than-viewport page's left edge outside the scrollable
    # area — horizontal scroll only reaches content to the right
    '.wf-page{position:relative;width:max-content;min-width:100%;'
    'min-height:100vh;align-self:flex-start}'
    '.wf-fx-bar{display:flex;gap:8px}'
    '.wf-fx-bar button{font:600 12px/1 system-ui,sans-serif;'
    'padding:8px 12px;border-radius:8px;'
    'border:1px solid #d5d7dc;background:#fff;'
    'color:#333;cursor:pointer}'
    '.wf-fx-bar button[aria-pressed="true"]{'
    'background:#1c1f26;color:#fff;border-color:#1c1f26}'
    # an explicit motion toggle is the ONLY reduced-motion switch in
    # preview docs (the emit pass strips the fragments\' own
    # prefers-reduced-motion freezes — E1 live-play contract)
    'body[data-motion="off"] .wf-stage *,'
    'body[data-motion="off"] .wf-page *{'
    'animation-play-state:paused!important;'
    'transition:none!important}'
    # ?theme=dark — the frame chrome follows the doc theme; the
    # fragment's own dark: utilities come from the class build
    '[data-theme="dark"] body{background:#14171d}'
    # fragments without their own text color inherit the frame's —
    # in dark that must be light or black headings sit on near-black
    '[data-theme="dark"] .wf-stage,[data-theme="dark"] .wf-page{'
    'color:#e8eaef}'
    '[data-theme="dark"] .wf-stage{'
    'box-shadow:0 10px 34px rgba(0,0,0,.5)}'
    '[data-theme="dark"] .wf-fx-bar button{background:#23262e;'
    'color:#e4e6ea;border-color:#3a3e47}'
    '[data-theme="dark"] .wf-fx-bar button[aria-pressed="true"]{'
    'background:#e8eaef;color:#1c1f26;border-color:#e8eaef}')


# E1 — fragment interactions are authored against a REAL surface:
# hover/click handlers listen on the fragment tree, scroll-driven
# fx read the stage's scroll metrics (mapped by the shim above).
# The driver replays that reality: one scroll sweep, a synthetic
# pointer pass over the deepest interactive node, and a loop that
# restarts finite animations so one-shot sequences never sit
# frozen in their end state. Replay re-runs the same pass.
_FX_DRIVER = (
    '<script>(function(){'
    'var st=document.querySelector(".wf-stage");'
    'var pg=document.querySelector(".wf-page");'
    'var sc=st||pg;if(!sc)return;'
    'function scrollTo_(y){if(st)st.scrollTop=y;'
    'else window.scrollTo(0,y)}'
    'function scrollMax(){if(st)return st.scrollHeight-st.clientHeight;'
    'return Math.max(0,document.documentElement.scrollHeight'
    '-window.innerHeight)}'
    'function anim(){return document.getAnimations?'
    'document.getAnimations():[]}'
    'function play(){anim().forEach(function(a){'
    'try{a.cancel();a.play()}catch(e){}})}'
    'function drive(){'
    'var top=scrollMax();'
    'if(top>8){'
    'var t0=performance.now();'
    '(function sweep(t){var k=Math.min(1,(t-t0)/2400);'
    'scrollTo_(top*(k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2));'
    'if(k<1)requestAnimationFrame(sweep)})(t0);}'
    'var hit=sc.querySelector("button,a,[role=button],summary,'
    'input,select,[data-hover],[tabindex]");'
    'if(hit){["pointerover","mouseover","pointerdown","pointerup",'
    '"click","pointerout"].forEach(function(n,i){'
    'setTimeout(function(){try{hit.dispatchEvent('
    'new MouseEvent(n,{bubbles:true}))}catch(e){'
    'hit.dispatchEvent(new Event(n,{bubbles:true}))}},'
    '2600+i*140)})}}'
    'var loop=setInterval(function(){'
    'if(document.body.dataset.motion==="off")return;'
    'var a=anim().filter(function(x){'
    'return x.playState==="finished"||x.playState==="idle"});'
    'var all=anim();'
    'if(a.length&&a.length===all.length){play()}'
    '},1500);'
    'setTimeout(drive,900);'
    'var r=document.querySelector(".wf-replay");'
    'if(r)r.addEventListener("click",function(){'
    'scrollTo_(0);play();drive()});'
    'var m=document.querySelector(".wf-motion");'
    'if(m)m.addEventListener("click",function(){'
    'var off=document.body.dataset.motion==="off";'
    'document.body.dataset.motion=off?"on":"off";'
    'm.setAttribute("aria-pressed",off?"false":"true");'
    'if(off)anim().forEach(function(a){try{a.play()}catch(e){}})'
    '})'
    '})();</script>')


def _css_esc(name):
    return re.sub(r'([^a-zA-Z0-9_-])', r'\\\1', name)


def _util_rule(tok):
    """tailwind v4-dialect utility → a css declaration for the
    vendored v3 compiler's gaps (shadow-xs, w-13, ease-[…],
    duration-250 …). Returns 'prop:value' or None (font families
    resolve by name only — unresolvable)."""
    # variant prefix = up to the last ':' before the first '['
    bi = tok.find('[')
    base = tok[tok.rfind(':', 0, bi if bi >= 0 else len(tok)) + 1:] \
        if bi >= 0 else tok.split(':')[-1]
    base = base.split('/')[0] if '/[' not in base else base
    v = base[base.index('[') + 1:-1].replace('_', ' ') \
        if base.endswith(']') and '[' in base else None
    if base.startswith('[') and ':' in base[1:-1]:
        prop, val = base[1:-1].split(':', 1)
        return f'{prop}:{val.replace("_", " ")}'
    SP = 0.25  # rem per spacing unit
    m = re.fullmatch(
        r'(w|h|size|min-w|max-w|min-h|max-h|p|px|py|pt|pb|pl|pr|'
        r'm|mx|my|mt|mb|ml|mr|inset|inset-x|inset-y|top|right|'
        r'bottom|left|gap|gap-x|gap-y|space-x|space-y|basis)-'
        r'(\d+(?:\.\d+)?)', base)
    if m:
        rem = float(m.group(2)) * SP
        prop = {
            'w': 'width', 'h': 'height', 'size': 'width;height',
            'min-w': 'min-width', 'max-w': 'max-width',
            'min-h': 'min-height', 'max-h': 'max-height',
            'p': 'padding', 'px': 'padding-inline',
            'py': 'padding-block', 'pt': 'padding-top',
            'pb': 'padding-bottom', 'pl': 'padding-left',
            'pr': 'padding-right', 'm': 'margin',
            'mx': 'margin-inline', 'my': 'margin-block',
            'mt': 'margin-top', 'mb': 'margin-bottom',
            'ml': 'margin-left', 'mr': 'margin-right',
            'inset': 'inset', 'inset-x': 'inset-inline',
            'inset-y': 'inset-block', 'top': 'top',
            'right': 'right', 'bottom': 'bottom', 'left': 'left',
            'gap': 'gap', 'gap-x': 'column-gap',
            'gap-y': 'row-gap', 'basis': 'flex-basis',
        }[m.group(1)]
        if m.group(1) == 'size':
            return f'width:{rem}rem;height:{rem}rem'
        if m.group(1) in ('space-x', 'space-y'):
            a = 'left' if m.group(1).endswith('x') else 'top'
            return (f'>*+*{{margin-{a}:{rem}rem}}')
        return f'{prop}:{rem}rem'
    if base.startswith('ease-['):
        return f'transition-timing-function:{v}'
    if base.startswith(('duration-', 'delay-')):
        n = base.split('-', 1)[1]
        ms = v or (n if n.isdigit() else None)
        if ms:
            prop = ('transition-duration' if base[0] == 'd' and
                    base[1] == 'u' else 'transition-delay')
            return f'{prop}:{ms}ms'
    if base.startswith('shadow-['):
        return f'box-shadow:{v}'
    named = {
        'shadow-xs': 'box-shadow:0 1px 2px 0 rgb(0 0 0/.05)',
        'shadow-sm': 'box-shadow:0 1px 3px 0 rgb(0 0 0/.1),'
                     '0 1px 2px -1px rgb(0 0 0/.1)',
        'rounded-xs': 'border-radius:.125rem',
        'rounded-xxs': 'border-radius:.0625rem',
        'will-change-transform': 'will-change:transform',
        'will-change-opacity': 'will-change:opacity',
        'will-change-scroll': 'will-change:scroll-position',
        'will-change-contents': 'will-change:contents',
        'will-change-auto': 'will-change:auto',
        'transition-colors': 'transition-property:color,'
                             'background-color,border-color',
        'transition-transform': 'transition-property:transform',
        'transition-all': 'transition-property:all',
        'transition-shadow': 'transition-property:box-shadow',
        'transition-opacity': 'transition-property:opacity',
    }
    if base in named:
        return named[base]
    if base.startswith('transition-['):
        return f'transition-property:{v}'
    if base.startswith('will-change-['):
        return f'will-change:{v}'
    if base.startswith('content-['):
        return f'content:{v}'
    if base.startswith('animate-['):
        return f'animation:{v}'
    for pre, prop in (
            ('bg-[', 'background-color'), ('text-[', 'color'),
            ('border-[', 'border-color'), ('ring-[', 'box-shadow'),
            ('fill-[', 'fill'), ('stroke-[', 'stroke'),
            ('accent-[', 'accent-color'),
            ('min-h-[', 'min-height'), ('min-w-[', 'min-width'),
            ('max-h-[', 'max-height'), ('max-w-[', 'max-width'),
            ('w-[', 'width'), ('h-[', 'height'), ('inset-[', 'inset'),
            ('top-[', 'top'), ('bottom-[', 'bottom'),
            ('left-[', 'left'), ('right-[', 'right'),
            ('grid-cols-[', 'grid-template-columns'),
            ('grid-rows-[', 'grid-template-rows'),
            ('blur-[', 'filter:blur('), ('z-[', 'z-index'),
            ('opacity-[', 'opacity'), ('scale-[', 'transform:scale('),
            ('rotate-[', 'transform:rotate('),
            ('tracking-[', 'letter-spacing'),
            ('leading-[', 'line-height'),
            ('cursor-[', 'cursor'), ('aspect-[', 'aspect-ratio'),
            ('origin-[', 'transform-origin'),
            ('outline-[', 'outline-color'),
            ('decoration-[', 'text-decoration-color'),
            ('caret-[', 'caret-color')):
        if base.startswith(pre) and v:
            if pre == 'text-[' and re.fullmatch(r'[\d.]+(px|rem|em)', v):
                prop = 'font-size'
            if pre in ('blur-[', 'scale-[', 'rotate-['):
                return f'{prop}{v})'
            if pre == 'ring-[':
                return f'box-shadow:0 0 0 3px {v}'
            return f'{prop}:{v}'
    return None


def _bank_fallback_css():
    """every class token the bank uses that the compiled
    bank-preview.css doesn't carry → a generated fallback rule.
    Fragment <style> blocks are checked too (amb15-mote & co. are
    fragment-local, never missing)."""
    css_path = os.path.join(_GENMENU, 'bank-preview.css')
    css = open(css_path, errors='replace').read() \
        if os.path.isfile(css_path) else ''
    frag_styles = []
    toks = set()
    for r, _ds, fns in os.walk(_GENMENU):
        for fn in fns:
            if not fn.endswith('.html'):
                continue
            blob = open(os.path.join(r, fn), encoding='utf-8',
                        errors='replace').read()
            frag_styles += re.findall(
                r'<style[^>]*>(.*?)</style>', blob, re.S | re.I)
            for cm in re.finditer(r'class="([^"]+)"', blob):
                toks.update(html.unescape(cm.group(1)).split())
    rules = []
    for tok in sorted(toks):
        if tok.startswith(('wf-', 'lucide')):
            continue
        bi = tok.find('[')
        base = tok[tok.rfind(':', 0, bi if bi >= 0 else
                            len(tok)) + 1:]
        sel = '.' + _css_esc(tok)
        if sel in css or ('.' + _css_esc(base)) in css or \
                ('.' + _css_esc(base.split('/')[0])) in css:
            continue
        cix = tok.rfind(':', 0, bi) if bi >= 0 else \
            (tok.rfind(':') if ':' in tok else -1)
        var = tok[:cix] if cix > 0 else ''
        decl = _util_rule(tok)
        if not decl:
            continue
        sel = '.' + _css_esc(tok)
        if var in ('sm', 'md', 'lg', 'xl', '2xl'):
            bp = {'sm': 640, 'md': 768, 'lg': 1024,
                  'xl': 1280, '2xl': 1536}[var]
            rules.append(f'@media(min-width:{bp}px)'
                         f'{{{sel}{{{decl}}}}}')
        elif var == 'hover':
            rules.append(f'{sel}:hover{{{decl}}}')
        elif var == 'dark':
            rules.append(f'[data-theme="dark"] {sel}{{{decl}}}')
        elif var in ('before', 'after'):
            rules.append(f'{sel}::{var}{{{decl}}}')
        elif not var:
            rules.append(f'{sel}{{{decl}}}')
        # pseudo-el/other variants unhandled → skip silently
    return ''.join(rules)


def _bank_scale(frag):
    """E1 — widget vs page scale, derived from the fragment's own
    root: anything that isn't clearly a small widget is page-scale
    and renders edge-to-edge (the compact stage clips section-scale
    fragments — footers, tiers, heroes). Widget cues: a fixed narrow
    width/max-w, an inline root, or a span."""
    m = re.search(r'<([a-zA-Z0-9-]+)([^>]*)>', frag)
    if not m:
        return 'widget'
    tag, attrs = m.group(1).lower(), m.group(2)
    cm = re.search(r'class="([^"]+)"', attrs)
    cls = cm.group(1) if cm else ''
    mw = re.search(r'(?:max-w|w|size)-\[(\d+)px\]', cls)
    if mw and int(mw.group(1)) < 640:
        return 'widget'
    if re.search(r'max-w-(xs|sm|md|prose)\b', cls):
        return 'widget'
    if re.search(r'\b(w-fit|inline-flex|inline-block|'
                 r'inline-grid)\b', cls) or tag == 'span':
        return 'widget'
    return 'page'


def _fx_strip_freeze(frag):
    """E1 — a preview doc must PLAY the effect: the banked
    fragment's prefers-reduced-motion media blocks freeze it in
    its end state when the preview runs under reduced-motion.
    Strip those blocks at emit (the bank file keeps them); the
    emitted doc's own motion toggle is the a11y switch."""
    out = []
    i = 0
    pat = re.compile(r'@media\s*\([^{)]*prefers-reduced-motion')
    while True:
        m = pat.search(frag, i)
        if not m:
            out.append(frag[i:])
            break
        out.append(frag[i:m.start()])
        # balance braces from the media block's opening {
        j = frag.index('{', m.end())
        depth = 1
        j += 1
        while depth and j < len(frag):
            if frag[j] == '{':
                depth += 1
            elif frag[j] == '}':
                depth -= 1
            j += 1
        i = j
    return ''.join(out)


def _genmenu_tags():
    fp = os.path.join(_GENMENU, 'tags.json')
    try:
        rows = (json.load(open(fp)) or {}).get('rows') or []
    except Exception:
        return {}
    return {r.get('path'): r for r in rows if r.get('path')}


def atlas_family(pd, fam):
    """family dict for atlas variants — 'atlas:<id>' resolves its
    preset's genes; 'genes:<hash>' reuses the signed pick's bundle
    (the hash alone cannot reconstruct the gene map)."""
    if vibe_atlas is None or not fam:
        return None
    if fam.startswith('atlas:'):
        p = vibe_atlas.PRESET_BY_ID.get(fam[6:])
        return vibe_atlas.resolve(p['genes']) if p else None
    if fam.startswith(('genes:', 'custom:')) and pd:
        ep = _json_at(os.path.dirname(pd.rstrip('/'))
                      if pd.endswith('/site')
                      else pd, 'ELEMENT-PICKS.json') or {}
        for pick in reversed(ep.get('picks') or []):
            if pick.get('element') in ('vibe', 'type') and \
                    pick.get('variant') == fam and \
                    isinstance(pick.get('bundle'), dict):
                b = pick['bundle']
                if isinstance(b.get('resolved'), dict):
                    return dict(b['resolved'])
                r = dict(b)
                if 'css' not in r and 'tokens' in r:
                    t = r['tokens']
                    r['css'] = ';'.join(
                        f'{k}:{v}' for k, v in
                        (t.get('light') or {}).items())
                    r['css_dark'] = ';'.join(
                        f'{k}:{v}' for k, v in
                        (t.get('dark') or {}).items())
                    r['shape'] = t.get('shape') or ''
                return r
    return None


def vibe_resolve(pd, genes):
    """resolve a gene map through the atlas → emit its doc →
    {preview, name, genes, tokens, theme}."""
    if vibe_atlas is None:
        return {'error': 'vibe atlas unavailable'}
    r = vibe_atlas.resolve(genes)
    ghash = vibe_atlas.gene_hash(genes)
    if not r['genes']:
        # empty genes = the pipeline's own DNA — the emitted doc
        # is byte-identical to vibes/baseline.html, so reuse it
        # instead of writing a gen-<hash> duplicate
        rel = emit_vibe_doc(pd, 'baseline', r)
    else:
        rel = emit_vibe_doc(pd, 'gen-' + ghash, r)
    if not rel:
        return {'error': 'no emitted blocks'}
    tsrel = emit_typescale_doc(
        pd, 'gen-' + ghash, r) if r['genes'] else \
        emit_typescale_doc(pd)
    return {'preview': '/built/' + urllib.parse.quote(
                os.path.join(pd, 'site', 'dist', rel)),
            'typescale': ('/built/' + urllib.parse.quote(
                os.path.join(pd, 'site', 'dist', tsrel))
                if tsrel else None),
            'name': r['name'], 'genes': r['genes'],
            'tokens': r['tokens'], 'theme': r['theme'],
            'resolved': {k: r.get(k) for k in
                         ('css', 'css_dark', 'shape', 'theme',
                          'tokens')}}


_FX_PACK_TARGETS = {
    'fx-hover': {'cards'}, 'fx-tilt': {'cards'}, 'fx-drag': {'cards'},
    'fx-magnetic': {'cards'}, 'fx-expand': {'cards'},
    'fx-spring': {'cards'}, 'fx-jelly': {'cards'}, 'fx-glow': {'cards'},
    'fx-morph': {'cards', 'text'},
    'fx-check': {'buttons'}, 'fx-rating': {'buttons'},
    'fx-meter': {'buttons'}, 'fx-state': {'buttons'},
    'fx-toast': {'buttons'}, 'fx-progress': {'buttons'},
    'fx-iconmorph': {'buttons'}, 'fx-loadmorph': {'buttons'},
    'fx-skeleton': {'buttons', 'cards'},
    'fx-tabslide': {'headers'}, 'fx-menumorph': {'headers'},
    'fx-marquee': {'text'}, 'fx-letter': {'text'}, 'fx-ink': {'text'},
    'fx-outline': {'text'},
    'fx-duotone': {'images'}, 'fx-mask': {'images'},
    'fx-gradient': {'images'}, 'fx-liquid-wipe': {'images'},
    'fx-parallax': {'page'}, 'fx-pinned': {'page'},
    'fx-timeline': {'page'}, 'fx-cursor': {'page'},
    'fx-burst': {'page'}, 'fx-compare': {'page'},
    'fx-goo': {'any'}, 'fx-gooey': {'any'}, 'fx-ambient': {'any'},
    'fx-blob': {'any'}, 'fx-phys': {'any'}, 'fx-particles': {'any'},
    'fx-reveal': {'any'}, 'fx-motion': {'any'},
}
_FX_TARGET_KEYWORDS = (
    ('button', 'buttons'), ('control', 'buttons'),
    ('card', 'cards'), ('folio', 'cards'),
    ('header', 'headers'), ('nav', 'headers'), ('foot', 'footers'),
    ('mob-chrome', 'mobile-chrome'), ('mobfx', 'mobile-chrome'),
    ('mob', 'mobile-chrome'), ('ktxt', 'text'), ('text', 'text'),
    ('icfx', 'images'), ('image', 'images'),
    ('scroll', 'page'), ('pinned', 'page'), ('parallax', 'page'),
    ('goo', 'any'), ('ambient', 'any'), ('phys', 'any'))


def _fx_targets(cls):
    if cls in _FX_PACK_TARGETS:
        return sorted(_FX_PACK_TARGETS[cls])
    for kw, bucket in _FX_TARGET_KEYWORDS:
        if kw in cls:
            return [bucket]
    return ['any']


def emit_bank_previews(pd):
    """preview/bank/<cls>/<slug>.html — every genmenu exemplar
    rendered standalone under bank-preview.css: reference fidelity
    (the exemplar's own Tailwind), NOT bound into the baked family.
    Returns {gallery_id: [cards]}."""
    if not os.path.isdir(_GENMENU):
        return {}, {}
    _BANK_DIRS['fx'] = tuple(sorted(
        d for d in os.listdir(_GENMENU)
        if d.startswith(('fx-', 'imgfx-', 'mobfx-', 'mob-')) and
        os.path.isdir(os.path.join(_GENMENU, d))))
    tags = _genmenu_tags()
    css_src = os.path.join(_GENMENU, 'bank-preview.css')
    # E1 — the committed css must cover the CURRENT bank: an exemplar
    # banked after the last compile loses its arbitrary-value surface
    # (bg-[#…] etc.), so its white text renders on the stage's
    # near-white in light mode. mtime can't see that (a checkout
    # bumps everything together) — hash every banked source; a stamp
    # mismatch means the css predates the bank and must recompile:
    # vendored tailwind, deterministic, no network.
    bh = hashlib.sha256()
    # config-version salt — a compiler-setting change (e.g. darkMode
    # 'class' below) must also recompile; the bank-content hash alone
    # can't see it
    bh.update(b'bank-preview-config:v2-darkmode-class')
    for r, _ds, fns in os.walk(_GENMENU):
        for fn in sorted(fns):
            if fn.endswith(('.html', '.tsx')):
                fp_ = os.path.join(r, fn)
                try:
                    bh.update(os.path.relpath(fp_, _GENMENU).encode())
                    bh.update(open(fp_, 'rb').read())
                except OSError:
                    pass
    stamp_fp = os.path.join(css_src + '.sha256')
    stamp = (open(stamp_fp).read() if os.path.isfile(stamp_fp)
             else '')
    if stamp != bh.hexdigest():
        try:
            sys.path.insert(0, HERE)
            import genmenu_bank
            if genmenu_bank.preview_css() == 0:
                with open(stamp_fp, 'w') as fh:
                    fh.write(bh.hexdigest())
                print('  bank-preview.css recompiled '
                      '(bank content changed)')
        except Exception as e:
            print(f'  ! bank-preview.css recompile skipped: {e}')
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
    extra = _bank_fallback_css()
    extra_dst = os.path.join(outdir, 'bank-preview-extra.css')
    with open(extra_dst, 'w') as fh:
        fh.write('/* generated fallback utilities — vendored '
                 'tailwind v3 dialect gaps */\n' + extra)
    head = ('<meta charset="utf-8"><meta name="viewport" '
            'content="width=device-width,initial-scale=1">'
            # U.3 — ?theme=dark / localStorage bind the doc like the
            # system sheet: data-theme on <html> + the .dark class
            # the bank tailwind build (darkMode:'class') keys on
            '<script>(function(){var m=new URLSearchParams('
            'location.search).get("theme")||localStorage.'
            'getItem("theme")||"light";document.'
            'documentElement.dataset.theme=m;document.'
            'documentElement.classList.toggle("dark",m==="dark")'
            '})()</script>'
            '<link rel="stylesheet" href="/built/' +
            urllib.parse.quote(os.path.join(
                pd, 'site', 'dist', 'preview', 'bank',
                'bank-preview.css')) + '">'
            '<link rel="stylesheet" href="/built/' +
            urllib.parse.quote(extra_dst) + '">')
    out = {}
    for gid, dirs in _BANK_DIRS.items():
        if gid in ('menu', 'footers'):
            # chrome surfaces are real-render only: a menu or footer
            # preview must be the pipeline's own emitted doc, never a
            # bank exemplar re-rendered under bank-preview.css. The
            # per-type boards emit these via real chrome.
            continue
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
                row = tags.get(cls + '/' + slug) or {}
                stale = (not os.path.isfile(dst)) or \
                    os.path.getmtime(fp) > os.path.getmtime(dst) or \
                    (os.path.isfile(css_dst) and
                     os.path.getmtime(css_dst) >
                     os.path.getmtime(dst)) or \
                    '<!--wf:bank:v6-->' not in open(
                        dst, encoding='utf-8',
                        errors='replace').read(64)
                if stale:
                    frag = open(fp, encoding='utf-8').read()
                    # E4 — banked fragments may keep the source app's
                    # /src/assets/… refs; that tree is never shipped,
                    # so every fx load 404s the image. Bind them to
                    # the pipeline's emitted placeholder figure.
                    frag = re.sub(
                        r'/src/assets/[^\s"\'()]+',
                        '/built/' + urllib.parse.quote(
                            os.path.join(
                                pd, 'site', 'dist', 'media',
                                'placeholder.svg')), frag)
                    # the AI-Studio harness shim is never vendored —
                    # it 404s on every load; the fx driver below is
                    # the replacement interaction layer
                    frag = re.sub(
                        r'<script[^>]*_aistudio-iframe[^>]*>'
                        r'\s*</script>', '', frag)
                    fx = cls.startswith(('fx-', 'imgfx-', 'mobfx-'))
                    if fx:
                        frag = _fx_strip_freeze(frag)
                    mob = gid == 'menu' or cls.startswith('mob')
                    page = (not mob) and _bank_scale(frag) == 'page'
                    if page:
                        stage = ('<div class="wf-page">' + frag +
                                 '</div>')
                    else:
                        stage = ('<div class="wf-stage' +
                                 (' mob' if mob else '') + '">'
                                 '<div class="wf-stage-in">' + frag +
                                 '</div></div>')
                    # E1 — fx cards carry the demo chrome (replay +
                    # motion toggle) and the interaction driver; the
                    # burger icon css is nav-only chrome, never fx
                    if fx:
                        stage += ('<div class="wf-fx-bar">'
                                  '<button class="wf-replay" '
                                  'type="button">Replay</button>'
                                  '<button class="wf-motion" '
                                  'type="button" aria-pressed="false">'
                                  'Reduce motion</button></div>')
                    # dark-mode fragments keep transparent inner
                    # surfaces — the stage underlay binds their
                    # intended surface or light text sits on the
                    # light frame (E1 readability)
                    css_ = _BANK_STAGE_CSS + (
                        'body{padding:0}' if page else '') + (
                        'body{background:#0b0e14}'
                        if row.get('mode') == 'dark' else '')
                    with open(dst, 'w', encoding='utf-8') as fh:
                        fh.write('<!--wf:bank:v6-->' +
                                 _doc(head, '', stage,
                                      extra=(_STAGE_SCROLL_SHIM
                                             if not page else '') +
                                      (_FX_DRIVER if fx else ''),
                                      css=css_,
                                      chrome=gid == 'menu' or
                                      cls.startswith('nav-')))
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
    # a pick on an fx card signs the SITE-DEFAULT effect; each
    # exemplar advertises which element types it may decorate
    fxmap = {}
    for c in out.get('fx', []):
        c['element'] = 'fx:default'
        c['targets'] = _fx_targets(c['grp'].split(' · ')[-1])
        c['live'] = True
        for t in c['targets']:
            fxmap.setdefault(t, []).append(c['variant'])
    return out, {k: sorted(v) for k, v in fxmap.items()}


def run_ingest(pipeline, url='', html='', css_text=''):
    '''URL/pasted-HTML ingest — slices the page into section
    fragments, vectorises each through the shared genmenu parser
    (Tree + sniff_topology), ranks bank exemplars and drafts a
    DNA-shaped style guess. No browser for paste mode.
    Render/extraction failures (missing playwright, timeouts)
    return a refused result instead of dropping the connection.'''
    import ingest_url
    try:
        return ingest_url.ingest(url=url or None, html=html or None,
                                 css_text=css_text or '')
    except Exception as e:
        msg = str(e)
        if 'NO_PLAYWRIGHT' in msg:
            reason = ('ingest needs playwright to render the URL — '
                      'install it with `pip install playwright && '
                      'playwright install chromium`')
        elif 'RENDER_FAILED' in msg:
            reason = ('the URL could not be loaded — check the '
                      'address or that the site is reachable')
        else:
            reason = msg[:400]
        return {'ok': False, 'error': reason, 'reason': reason}


# ------------------------------------------------------------------
# donor DNA — a staged ingest donor as a CONSUMABLE dna vector in
# the same knob space VIBE_FAMILIES binds (css/css_dark/theme).
# DNA-DRAFTS/<slug>.json is staged state only — nothing auto-applies
# it to a real BRIEF.
# ------------------------------------------------------------------
def _hex_mix(a, b, amt):
    ha, hb = a.lstrip('#'), b.lstrip('#')
    if len(ha) < 6 or len(hb) < 6:
        return a
    ta = tuple(int(ha[i:i + 2], 16) for i in (0, 2, 4))
    tb = tuple(int(hb[i:i + 2], 16) for i in (0, 2, 4))
    return '#%02x%02x%02x' % tuple(
        max(0, min(255, int(round(x + (y - x) * amt))))
        for x, y in zip(ta, tb))


_FONT_BAD = re.compile(r'[<>"\'`{}();\\&]')


def _clean_fonts(fams):
    # donor font families are untrusted page CSS - strip only the
    # chars that could break out of the style block; unicode family
    # names (e.g. localized fonts) stay valid
    out = []
    for f in fams or []:
        f = _FONT_BAD.sub('', str(f)).strip(' ._-')[:48]
        if f and f not in out:
            out.append(f)
    return out[:3]


def _to_hex(v):
    # normalize a color token to #rrggbb (accepts #hex, rgb/rgba);
    # unparseable -> None
    if not isinstance(v, str):
        return None
    v = v.strip()
    h = v.lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    if len(h) == 6:
        try:
            int(h, 16)
            return '#' + h.lower()
        except ValueError:
            return None
    m = re.match(r'rgba?\(\s*([0-9.]+)[,\s]+([0-9.]+)[,\s]+'
                 r'([0-9.]+)(?:[,/\s]+([0-9.]+%?))?', v)
    if m:
        try:
            if m.group(4):
                a = m.group(4)
                a = float(a[:-1]) / 100 if a.endswith('%') \
                    else float(a)
                if a < 0.1:
                    return None
            return '#%02x%02x%02x' % tuple(
                max(0, min(255, int(round(float(x)))))
                for x in m.groups()[:3])
        except ValueError:
            return None
    return None


def _hex_lum(hexs):
    h = (hexs or '').lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    if len(h) < 6:
        return 0.5
    try:
        r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    except ValueError:
        return 0.5
    f = lambda c: c / 12.92 if c <= 0.04045 else \
        ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)


def _cr(a, b):
    la, lb = _hex_lum(a), _hex_lum(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


_DENSITY_GAP = {'tight': 'var(--space-s)', 'regular': None,
                'spacious': 'var(--space-l)'}


def _bundle(canvas, ink, accent, acc_ink, hover, rpx, font, gap):
    return ('--bg-canvas:' + canvas +
            ';--bg-surface:' + _hex_mix(canvas, ink, 0.045) +
            ';--bg-elevated:' + _hex_mix(canvas, ink, 0.09) +
            ';--border-default:' + _hex_mix(canvas, ink, 0.16) +
            ';--text-primary:' + ink +
            ';--text-secondary:' + _hex_mix(ink, canvas, 0.42) +
            ';--action-primary:' + accent +
            ';--action-primary-hover:' + hover +
            ';--action-primary-ink:' + acc_ink + ';'
            + (('--radius:' + rpx + ';--primitive-radius:' + rpx +
                ';--r-card:' + rpx + ';') if rpx else '')
            + (('--primitive-font-display:' + font +
                ';--font-display:' + font + ';') if font else '')
            + (('--flow-spacing:' + gap + ';--grid-gap:' + gap +
                ';--content-gap:' + gap + ';') if gap else ''))


def donor_vector(draft):
    """dna_draft -> canonical vector {knobs, family} in the emitter's
    knob space. family is a VIBE_FAMILIES-shaped bundle so the /frame
    machinery renders any design wearing the donor unchanged."""
    d = draft or {}
    ty = d.get('type') or {}
    fams = _clean_fonts(
        [f for f in (ty.get('families') or []) if isinstance(f, str)])
    ink = _to_hex(d.get('ink')) or '#17171a'
    surface = _to_hex(d.get('surface')) or '#ffffff'
    accent = (_to_hex(d.get('accent_guess')) or
              _to_hex(d.get('accent')) or '#17171a')
    radius = d.get('radius_px_median')
    rpx = ('%gpx' % radius) if isinstance(radius, (int, float)) else ''
    density = d.get('density_guess') or 'regular'
    palette = [c for c in (_to_hex(c) for c in
               (d.get('palette') or [])) if c] or \
        [ink, surface, accent]
    dark = _hex_lum(surface) < 0.45
    acc_ink = ink if _cr(ink, accent) >= _cr(surface, accent) \
        else surface
    hover = _hex_mix(accent,
                     '#000000' if _hex_lum(accent) > 0.45
                     else '#ffffff', 0.18)
    gap = _DENSITY_GAP.get(density)
    font = (','.join('"' + f + '"' for f in fams[:2]) +
            ',ui-sans-serif,system-ui,sans-serif') if fams else ''
    vec = {'palette': palette, 'ink': ink, 'surface': surface,
           'accent': accent, 'radius_px': radius, 'density': density,
           'type': {'families': fams}, 'motion': 0}
    return {'knobs': vec,
            'family': dict(knobs_to_family(vec),
                           genes=['donor', 'ingest'])}


def knobs_to_family(vec):
    """knob vector {ink,surface,accent,radius_px,density,type,motion}
    -> a VIBE_FAMILIES-shaped {css,css_dark,theme} bundle - the same
    token space the emitter already reads."""
    ink = vec.get('ink') or '#17171a'
    surface = vec.get('surface') or '#ffffff'
    accent = vec.get('accent') or '#17171a'
    radius = vec.get('radius_px')
    rpx = ('%gpx' % radius) if isinstance(radius, (int, float)) \
        else ''
    density = vec.get('density') or 'regular'
    fams = [f for f in ((vec.get('type') or {}).get('families') or [])
            if isinstance(f, str)]
    dark = _hex_lum(surface) < 0.45
    acc_ink = ink if _cr(ink, accent) >= _cr(surface, accent) \
        else surface
    hover = _hex_mix(accent,
                     '#000000' if _hex_lum(accent) > 0.45
                     else '#ffffff', 0.18)
    gap = _DENSITY_GAP.get(density)
    font = (','.join('"' + f + '"' for f in fams[:2]) +
            ',ui-sans-serif,system-ui,sans-serif') if fams else ''
    if dark:
        lcan = _hex_mix(ink, '#ffffff', 0.94)
        css = _bundle(lcan, ink, accent, acc_ink, hover, rpx,
                      font, gap)
        d_ink = '#f4f4f6' if _cr('#f4f4f6', surface) >= _cr(
            ink, surface) else ink
        css_dark = _bundle(surface, d_ink, accent, acc_ink, hover,
                           rpx, font, gap)
    else:
        css = _bundle(surface, ink, accent, acc_ink, hover, rpx,
                      font, gap)
        dcan = _hex_mix(ink, '#000000', 0.10)
        css_dark = _bundle(dcan, surface, accent, acc_ink, hover,
                           rpx, font, gap)
    return {'css': css, 'css_dark': css_dark, 'shape': '',
            'theme': 'dark' if dark else None}


REMIX_LIVE = {}

REMIX_GROUPS = {'type': 'type/headings', 'cta': 'CTA/buttons',
                'surfaces': 'cards/surfaces', 'media': 'media/radius',
                'density': 'density/spacing', 'motion': 'motion'}

_GROUP_KNOBS = {'type': ['type'], 'cta': ['accent'],
                'surfaces': ['surface'], 'media': ['radius_px'],
                'density': ['density'], 'motion': ['motion']}

_DENSITY_NUM = {'tight': 0, 'regular': 1, 'spacious': 2}
_DENSITY_WORD = {v: k for k, v in _DENSITY_NUM.items()}


def _css_vars(txt):
    return dict(m.groups() for m in re.finditer(
        r'(--[a-z0-9-]+)\s*:\s*([^;]+)', txt or ''))


def _len_px(s):
    """'10px'/'1.125rem'/'0.5em'/'10'/'0' -> px float; ''/other -> None.
    Zero is a valid radius — returns 0.0, not None."""
    m = re.match(r'^\s*(-?\d+(?:\.\d+)?)\s*(px|rem|em)?\s*$',
                 s or '')
    if not m:
        return None
    v = float(m.group(1))
    return v * 16 if m.group(2) in ('rem', 'em') else v


def _vibe_vector(fam):
    return _vector_from_family(VIBE_FAMILIES.get(fam) or {})


def _vector_from_family(f):
    lv, dv = _css_vars(f.get('css')), _css_vars(f.get('css_dark'))
    rpx = _len_px(lv.get('--radius') or lv.get('--r-card') or '')
    gap = lv.get('--grid-gap') or ''
    den = ('tight' if 'space-s' in gap else
           'spacious' if 'space-l' in gap else 'regular')
    fams = []
    for x in (lv.get('--font-display') or '').split(','):
        x = x.strip().strip('"').strip("'")
        if x and 'sans-serif' not in x:
            fams.append(x)
    return {'ink': lv.get('--text-primary'),
            'surface': lv.get('--bg-canvas'),
            'accent': lv.get('--action-primary'),
            'radius_px': rpx, 'density': den,
            'type': {'families': fams},
            'motion': 0, 'theme': f.get('theme'),
            'dark': {'ink': dv.get('--text-primary'),
                     'surface': dv.get('--bg-canvas')}}


def _design_vector(pd):
    t = _json_at(pd, 'TOKENS.json') or _json_at(
        os.path.dirname(pd), 'TOKENS.json') or {}
    roles = ((t.get('color') or {}).get('modes') or {})
    lr = (roles.get('light') or {}).get('roles') or {}
    dr = (roles.get('dark') or {}).get('roles') or {}
    k = t.get('knobs') or {}
    rpx = _len_px(k.get('radius.personality') or '')
    ds = str(k.get('space.density_scale') or '')
    den = ('tight' if ds.endswith('-s') else
           'spacious' if ds.endswith('-l') else 'regular')
    mo = {'none': 0, 'subtle': 0.3, 'moderate': 0.6,
          'rich': 1}.get(str(k.get('motion.level')), 0)
    return {'ink': lr.get('ink'), 'surface': lr.get('bg'),
            'accent': lr.get('accent'), 'radius_px': rpx,
            'density': den,
            'type': {'families': []}, 'motion': mo,
            'theme': None,
            'dark': {'ink': dr.get('ink'), 'surface': dr.get('bg')}}


def source_vector(pd, sid):
    """'design' | 'vibe:<fam>' | 'donor:<slug>' -> knob vector."""
    if sid == 'design':
        return _design_vector(pd)
    if (sid or '').startswith('vibe:'):
        if sid[5:] == 'baseline':
            # baseline is not a real source — it IS this design's DNA
            return _design_vector(pd)
        return _vibe_vector(sid[5:])
    if (sid or '').startswith('donor:'):
        rec = _json_at(pd, 'DNA-DRAFTS', sid[6:] + '.json') or {}
        k = rec.get('knobs')
        if isinstance(k, dict):
            v = dict(k)
            v['theme'] = (rec.get('family') or {}).get('theme')
            return v
    if (sid or '').startswith('sys:'):
        d = _json_at(pd, 'SAVED-SYSTEMS', sid[4:] + '.json')
        if not isinstance(d, dict):
            return None
        vibe = d.get('vibe') or ''
        if vibe == 'baseline':
            return _design_vector(pd)
        if vibe in VIBE_FAMILIES:
            return _vibe_vector(vibe)
        f = atlas_family(pd, vibe)  # atlas:<id> / genes:<hash>
        return _vector_from_family(f) if f else None
    return None


def dna_sources(pd):
    """the remixable source list for a pipeline."""
    out = [{'id': 'design', 'label': 'this design'}]
    for fam, f in VIBE_FAMILIES.items():
        out.append({'id': 'vibe:' + fam, 'label': f['name']})
    dd = os.path.join(pd, 'DNA-DRAFTS')
    if os.path.isdir(dd):
        for fn in sorted(os.listdir(dd)):
            if fn.endswith('.json'):
                out.append({'id': 'donor:' + fn[:-5],
                            'label': 'donor: ' + fn[:-5]})
    for s0 in list_systems(pd):
        out.append({'id': 'sys:' + s0['slug'],
                    'label': 'system: ' + (s0.get('name') or s0['slug']),
                    'vibe': s0.get('vibe')})
    return out


def mix_vectors(vecs, shares, groups):
    """numeric knobs lerp by share; categorical take the dominant
    share; group picks override with one source's knobs outright."""
    def dom(key):
        # dominant share wins — a source at 0% never owns a
        # categorical token even when it's the only carrier
        best, bs = None, 0
        for v, sh in zip(vecs, shares):
            if v.get(key) is not None and sh > 0 and sh >= bs:
                best, bs = v[key], sh
        return best

    dt = dom('type')
    out = {'ink': dom('ink'), 'surface': dom('surface'),
           'accent': dom('accent'),
           'type': {'families': (dt or {}).get('families') or []}}
    def wavg(key, conv=None, dec=1):
        # lerp only over sources that actually carry the knob —
        # a source lacking it must not silently vote zero
        pairs = [((conv(v[key]) if conv else v[key]), s)
                 for v, s in zip(vecs, shares)
                 if v.get(key) is not None]
        tot = sum(sh for _, sh in pairs)
        return (round(sum(x * sh for x, sh in pairs) / tot, dec)
                if pairs and tot else None)

    # 0 is a real radius — keep it, don't fall back to 'no override'
    out['radius_px'] = wavg('radius_px')
    out['motion'] = wavg('motion', dec=3) or 0
    dn = wavg('density', conv=lambda d: _DENSITY_NUM.get(d, 1),
              dec=4)  # no dec=1 pre-round before the word lookup
    out['density'] = (_DENSITY_WORD.get(int(round(dn)), 'regular')
                      if dn is not None else 'regular')
    out['theme'] = dom('theme')
    for g, idx in (groups or {}).items():
        try:
            src = vecs[int(idx)]
        except (TypeError, ValueError, IndexError):
            continue
        for knob in _GROUP_KNOBS.get(g, ()):
            out[knob] = src.get(knob)
    return out


def remix(pipeline, spec):
    """POST /remix - mix sources, register the live bundle keyed by
    the spec hash, return its frame slug + mixed knobs.
    Deterministic; the iframe swap does the rendering."""
    ctx = G.Ctx(pipeline)
    pd = ctx.dir
    if not os.path.isdir(pd):
        return {'error': 'pipeline not found'}
    vecs, shares = [], []
    for s0 in ((spec or {}).get('sources') or [])[:3]:
        v = source_vector(pd, (s0 or {}).get('id'))
        if v:
            vecs.append(v)
            shares.append(max(0.0, float(s0.get('share') or 0)))
    if not vecs:
        return {'error': 'no usable sources'}
    tot = sum(shares) or 1.0
    shares = [x / tot for x in shares]
    groups = (spec or {}).get('groups') or {}
    mixed = mix_vectors(vecs, shares, groups)
    fam = knobs_to_family(mixed)
    slug = 'remix-' + hashlib.sha1(
        json.dumps(spec, sort_keys=True).encode()).hexdigest()[:10]
    REMIX_LIVE[slug] = fam
    return {'slug': slug, 'knobs': mixed, 'sources': len(vecs)}


def remix_family(fam):
    return REMIX_LIVE.get(fam)


def remix_save(pipeline, name, spec):
    """sign a mixed DNA into REMIX-SYSTEMS/<slug>.json - same staged
    pattern as save_system; nothing auto-applies to a BRIEF."""
    slug = re.sub(r'[^a-z0-9-]+', '-', (name or '').lower()) \
        .strip('-')[:48]
    if not slug:
        return 1, 'name needed', None
    ctx = G.Ctx(pipeline)
    pd = ctx.dir
    if not os.path.isdir(pd):
        return 1, 'pipeline not found', None
    res = remix(pipeline, spec)
    if res.get('error'):
        return 1, res['error'], None
    rd = Path(pd) / 'REMIX-SYSTEMS'
    rd.mkdir(exist_ok=True)
    rec = {'name': name, 'slug': slug, 'kind': 'remix-system',
           'generated_by': 'picker_app.remix_save',
           'sources': (spec or {}).get('sources') or [],
           'groups': (spec or {}).get('groups') or {},
           'mixed': res['knobs'], 'frame_slug': res['slug'],
           'created': datetime.datetime.now().isoformat(
               timespec='seconds')}
    fp = rd / (slug + '.json')
    fp.write_text(json.dumps(rec, indent=1))
    return 0, 'remix system saved: ' + fp.name, {
        'slug': slug, 'file': str(fp), 'frame_slug': res['slug']}


def donor_family(pd, fam):
    """resolve a /frame family name of the form donor-<slug> to the
    staged DNA-DRAFTS bundle; None when absent."""
    if not (fam or '').startswith('donor-') or not pd:
        return None
    slug = re.sub(r'[^a-z0-9_-]+', '', fam[6:].lower())
    rec = _json_at(pd, 'DNA-DRAFTS', slug + '.json') or {}
    f = rec.get('family')
    return dict(f) if isinstance(f, dict) and f.get('css') is not None \
        else None


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
    # stage the consumable DNA vector beside it — DNA-DRAFTS/<slug>
    # is the donor rendered into the emitter's own knob space
    vec = donor_vector(rec['dna_draft'])
    vd = Path(pd) / 'DNA-DRAFTS'
    vd.mkdir(exist_ok=True)
    vf = vd / (nm.lower() + '.json')
    vf.write_text(json.dumps(
        {'name': nm.lower(), 'kind': 'dna-draft',
         'source': 'ingest-donor', 'donor': str(fp),
         'knobs': vec['knobs'], 'family': vec['family'],
         'created': rec['created']}, indent=1))
    return 0, f'donor draft saved → {fp.name} + {vf.name}', {
        'name': nm, 'file': str(fp), 'dna': str(vf),
        'dna_slug': 'donor-' + nm.lower()}


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


def delete_system(pipeline, slug):
    """remove SAVED-SYSTEMS/<slug>.json from disk — a real delete,
    not a hidden row."""
    slug = re.sub(r'[^a-z0-9-]+', '-', (slug or '').lower()) \
        .strip('-')
    if not slug:
        return 1, 'slug needed'
    ctx = G.Ctx(pipeline)
    fp = os.path.join(ctx.dir, 'SAVED-SYSTEMS', slug + '.json')
    if not os.path.isfile(fp):
        return 1, f'no saved system {slug}'
    os.remove(fp)
    return 0, f'system “{slug}” deleted'


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


def record_element_pick(pipeline, element, variant, bundle=None,
                        spec=None):
    """Signed element decision — ELEMENT-PICKS.json in the pipeline
    dir. Same service-side signing as candidate decisions; the file
    is the element-choice registry the plan consumes later. `spec`
    is the custom-ladder editor's params for a 'custom:' type pick —
    sanitized server-side, and the variant hash derives from it, so
    the client can never name the variant itself."""
    valid = {grp['element'] for g in ELEMENT_GALLERIES
             for grp in g['groups']} | {'vibe', 'header', 'footer',
                                        'mobile-menu', 'modals',
                                        'layout', 'type'} | \
            {d for dirs in _BANK_DIRS.values() for d in dirs}
    fxel = re.fullmatch(
        r'fx:(default|sec:[\w-]{1,40}|[\w-]{1,40})', element or '')
    lay = re.fullmatch(r'layout:(home|service|location|contact|blog)',
                       element or '')
    if element not in valid and not fxel and not lay and not \
            re.fullmatch(r'sec:[\w-]{1,40}', element or ''):
        return 1, f'unknown element gallery {element}'
    if lay:
        # a page-board pick signs THAT page type's composition — the
        # bundle is the option's own record, never the client's
        doc = _json_at(G.Ctx(pipeline).dir, 'PAGE-BOARDS.json') or {}
        opt = next((o for o in ((doc.get('boards') or {})
                                .get(lay.group(1)) or {})
                    .get('options') or [] if o.get('id') == variant),
                   None)
        if not opt:
            return 1, (f'{variant} is not a {lay.group(1)} option in '
                       'PAGE-BOARDS.json')
        bundle = {'page_type': doc['boards'][lay.group(1)]
                  .get('page_type'),
                  'compositions': opt.get('compositions'),
                  'recipes': opt.get('recipes'),
                  'hero': opt.get('hero'),
                  'inputs_sha': doc.get('inputs_sha')}
    if fxel:
        # decoration is opt-in: only when the design's motion
        # vector is non-zero — a static design never gets fx
        tk = _json_at(pipeline, 'TOKENS.json') or _json_at(
            os.path.dirname(pipeline), 'TOKENS.json') or {}
        mo = {'none': 0, 'subtle': .3, 'moderate': .6, 'rich': 1}\
            .get(str((tk.get('knobs') or {})
                 .get('motion.level')), 0)
        if not mo:
            return 1, ('decoration needs a non-zero motion vector — '
                       'this design is motion:none')
        if variant == 'none':
            pass  # clearing a decoration is always allowed
        elif not re.fullmatch(r'[\w-]{1,48}', variant or ''):
            return 1, 'invalid fx id'
    if not variant or not re.fullmatch(r'[\w:-]{1,64}', variant):
        return 1, 'invalid variant id'
    ctx = G.Ctx(pipeline)
    pd = ctx.dir
    if element == 'type':
        # never trust the client's bundle — the server rebuilds
        # the candidate's deltas + ladder over the signed vibe
        if spec is not None:
            if not isinstance(spec, dict):
                return 1, 'invalid type spec'
            spec = _clean_type_spec(
                spec, (_json_at(pd, 'TOKENS.json') or {})
                .get('fluid') or {})
            variant = 'custom:' + hashlib.sha256(json.dumps(
                spec, sort_keys=True).encode()).hexdigest()[:10]
        b = _type_sign_bundle(pd, variant, spec=spec)
        if b is None:
            return 1, f'unknown type candidate {variant}'
        bundle = b
    fp = os.path.join(pd, 'ELEMENT-PICKS.json')
    with _PICKS_LOCK:
        data = _json_at(pd, 'ELEMENT-PICKS.json') or {
            'generated_by': 'approve_service.py',
            'picks': []}
        now = datetime.datetime.now().isoformat(timespec='seconds')
        for p in data.get('picks', []):
            if p.get('element') == element:
                # a regenerated board option keeps its id but not
                # its composition; a re-bake moves the base a type
                # pick was merged over — re-sign when the bundle
                # moved (inputs_sha is volatile, compare without it)
                def _comp(bd):
                    return {k: v for k, v in (bd or {}).items()
                            if k != 'inputs_sha'}
                if p.get('variant') == variant:
                    if isinstance(bundle, dict) and \
                            _comp(p.get('bundle')) != _comp(bundle):
                        p['bundle'] = bundle
                        p['ts'] = now
                        p['sig'] = G._sig(
                            {k: v for k, v in p.items()
                             if k != 'sig'}, G.op_key(create=True))
                        with open(fp, 'w') as fh:
                            json.dump(data, fh, indent=1,
                                      sort_keys=True)
                        return 0, (f'{element} {variant} re-signed '
                                   'over the current vibe')
                    return 0, (f'{element} already is {variant} — '
                               'still signed')
                old_v = p.get('variant')
                p['variant'] = variant
                p['ts'] = now
                p['prev'] = old_v
                if isinstance(bundle, dict):
                    p['bundle'] = bundle
                else:
                    p.pop('bundle', None)
                p['sig'] = G._sig({k: v for k, v in p.items()
                                   if k != 'sig'},
                                  G.op_key(create=True))
                with open(fp, 'w') as fh:
                    json.dump(data, fh, indent=1, sort_keys=True)
                return 0, ('Vibe baked' if element == 'vibe'
                           else f'{element} {old_v} → {variant} '
                           '(superseded, signed into ELEMENT-PICKS.json)')
        rec = {'element': element, 'variant': variant, 'ts': now}
        if isinstance(bundle, dict):
            rec['bundle'] = bundle
        rec['sig'] = G._sig(rec, G.op_key(create=True))
        data.setdefault('picks', []).append(rec)
        with open(fp, 'w') as fh:
            json.dump(data, fh, indent=1, sort_keys=True)
    return 0, ('Vibe baked' if element == 'vibe'
               else f'{element} → {variant} '
               '(signed into ELEMENT-PICKS.json)')


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
 localStorage.getItem('wfapp-theme')||'light'
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
#top .who{font-weight:650;font-size:14px;min-width:0}
#whoName{display:block;max-width:100%;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap}
#top .who small{display:block;font-weight:500;color:var(--muted);
     font-size:12px}
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
#vwCtl{display:flex;gap:2px;border:1px solid var(--line);
     border-radius:999px;padding:2px;background:var(--bg-2);
     position:relative}
#vwCtl .vind{position:absolute;top:2px;left:0;height:calc(100% - 4px);
     border-radius:999px;background:var(--ink);z-index:0;width:0;
     transition:transform .18s ease,width .18s ease}
#vwCtl button{border:0;background:transparent;color:var(--muted);
     padding:6px 12px;min-width:38px;font:600 12px var(--font);
     cursor:pointer;display:grid;place-items:center;
     border-radius:999px;transition:color .12s;position:relative;
     z-index:1}
#vwCtl button:hover{color:var(--ink)}
#vwCtl button svg{width:15px;height:15px}
#vwCtl button.on{color:var(--bg)}
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
.card .cb iframe,.srow iframe{pointer-events:none;
 max-width:var(--vw,100%);
     margin-inline:auto}
.aa{display:inline-block;padding:2px 8px;border-radius:999px;
    font:600 11px var(--mono);border:1px solid var(--line);
    color:var(--muted);background:var(--panel)}
.aa.bad{color:var(--bad);border-color:var(--bad)}

/* --- rail --- */
#rail{background:var(--bg-2);border-right:1px solid var(--line);
     overflow-y:auto;padding:14px 10px}
.railgrp{font:700 11px var(--font);letter-spacing:.08em;
     color:var(--muted);margin:16px 8px 6px;text-transform:uppercase}
.railgrp:first-child{margin-top:2px}
/* --- ingest --- */
.ingbar{display:grid;gap:8px;margin:14px 0;max-width:640px}
.abtn{justify-self:start;padding:8px 18px;border:0;
  border-radius:8px;background:var(--ink);color:var(--bg);
  font:650 12.5px var(--font);cursor:pointer}
.abtn:disabled{opacity:.45;cursor:default}
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
.ritem .cnt{margin-left:auto;font:600 11px var(--mono);
     color:var(--muted)}
.railbank{margin:2px 0}
.railbank summary{display:flex;align-items:center;gap:10px;
     padding:8px 10px;border-radius:var(--r-sm);cursor:pointer;
     font:600 12.5px var(--font);color:var(--muted);list-style:none}
.railbank summary::-webkit-details-marker{display:none}
.railbank summary svg{width:15px;height:15px;flex:none;opacity:.85}
.railbank summary:hover{background:var(--panel-2)}
.railbank summary .cnt{margin-left:auto;font:600 11px var(--mono)}
.railbank[open] summary{color:var(--ink)}
.railbank .ritem{padding-left:26px}

/* --- board --- */
#board{overflow-y:auto;overflow-x:hidden;padding:22px 26px 108px;
     container-type:inline-size;container-name:board}
#board>*{max-width:1600px;margin-left:auto;margin-right:auto}
#board>#stepper{max-width:none;position:sticky;top:-22px;z-index:15;
  display:flex;align-items:center;gap:6px;padding:9px 22px;
  margin:-22px -26px 16px;background:var(--bg-2);
  border-bottom:1px solid var(--line);overflow-x:auto}
.stplab{font:700 11px var(--font);color:var(--muted);
  letter-spacing:.08em;text-transform:uppercase;white-space:nowrap}
.stp{display:flex;align-items:center;gap:7px;border:0;background:none;
  color:var(--muted);cursor:pointer;padding:5px 8px;border-radius:7px;
  white-space:nowrap;font:600 12px var(--font);flex:none}
.stp .n{width:18px;height:18px;border-radius:50%;display:grid;
  place-items:center;font:700 10px var(--mono);
  border:1.5px solid var(--line);flex:none}
.stp.done{color:var(--ink)}
.stp.done .n{background:var(--ok,#1a7f37);border-color:transparent;
  color:#fff}
.stp.on{color:var(--ink);background:var(--panel)}
.stp.on .n{border-color:var(--accent);color:var(--accent)}
.stp .sub{font-weight:500;font-size:11px;color:var(--muted);
  max-width:130px;overflow:hidden;text-overflow:ellipsis}
.stp.done .sub{color:var(--ok,#1a7f37)}
.stparr{color:var(--line);flex:none}
.nextstep{display:block;margin:26px auto 10px;padding:10px 22px;
  border:1px solid var(--line);border-radius:999px;background:var(--panel);
  color:var(--ink);font:650 13px var(--font);cursor:pointer}
.nextstep:hover{border-color:var(--accent);color:var(--accent)}
#selbar{display:none}
@media(min-width:768px){
  #selbar{position:fixed;left:0;right:0;bottom:0;z-index:70;
    display:flex;align-items:center;gap:8px;padding:8px 18px;
    overflow:hidden;white-space:nowrap;
    background:var(--panel);border-top:1px solid var(--line)}}
@media(min-width:1025px){#selbar{left:232px}}
.sblab{font:700 11px var(--font);color:var(--muted);
  letter-spacing:.08em;text-transform:uppercase;flex:0 0 auto}
.sbchip{display:flex;align-items:center;gap:6px;border:1px solid var(--line);
  background:var(--bg-2);color:var(--muted);border-radius:999px;
  padding:6px 13px;font:500 12px var(--font);cursor:pointer;
  flex:0 1 auto;min-width:0;max-width:190px;overflow:hidden;
  text-overflow:ellipsis}
.sbchip.has{color:var(--ink);border-color:var(--accent)}
.sbchip b{font-weight:650;color:var(--muted);flex:0 0 auto}
.sbchip.has b{color:var(--accent)}
.sbchip.sbr{flex:0 0 auto;max-width:none}
.sbchip.sbnext{background:transparent;border-color:var(--accent);
  color:var(--accent)}
.sbwide{display:contents}
.sbnarrow{display:none}
@media(min-width:768px) and (max-width:1100px){
  /* overflow:hidden on #selbar clips the picks popover — in this
     band the wide chips are hidden anyway so nothing overflows */
  #selbar{overflow:visible}
  .sbwide{display:none}
  .sbnarrow{display:block;position:relative}
  .sbnarrow>summary{list-style:none;cursor:pointer}
  .sbnarrow>summary::-webkit-details-marker{display:none}
  .sbnarrow .sbpbody{position:absolute;bottom:calc(100% + 8px);left:0;
    display:flex;flex-direction:column;gap:6px;padding:8px;
    background:var(--panel);border:1px solid var(--line);
    border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.25);
    white-space:normal;min-width:200px;z-index:60}
  .sbnarrow .sbpbody .sbchip{max-width:260px}}
.sbsp{flex:1 0 8px;min-width:8px}
.sbr{background:var(--accent);color:var(--accent-ink);
  border-color:transparent;font-weight:650}
#scrim{display:none}
#board h1{margin:0;font-size:19px;font-weight:650}
#board .desc{color:var(--muted);font-size:13px;margin:5px 0 18px}
.filters{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:18px}
.glabel{grid-column:1/-1;font-size:12px;font-weight:600;
  letter-spacing:.08em;text-transform:uppercase;color:var(--muted);
  margin-top:8px}
.saves{display:flex;gap:9px;margin:0 0 18px}
.saves input{flex:0 0 240px;background:var(--bg-2);border:1px solid
  var(--line);border-radius:7px;color:var(--ink);padding:7px 11px;
  font-size:13px}
.fchip{padding:5px 13px;border:1px solid var(--line);
     border-radius:999px;background:var(--panel);
     color:var(--muted);font:600 11.5px var(--font);cursor:pointer}
.fchip.on{background:var(--accent);border-color:var(--accent);
     color:var(--accent-ink)}
.grid{display:grid;gap:18px;grid-template-columns:1fr}
@container board (min-width:1100px){
  .grid{grid-template-columns:1fr 1fr}}
.card.fxw{grid-column:1/-1}
.card.mini .cb{min-height:0}
.card.mini .cb.done,.card.mini .cb.err{height:auto}
/* scrub PREVIEWS modal */
.sprev{border:1px solid var(--line);background:var(--panel);
      color:var(--ink);border-radius:6px;font:600 11.5px var(--font);
      padding:3px 10px;cursor:pointer}
.sprev:hover{border-color:var(--accent);color:var(--accent)}
.sgov{position:fixed;inset:0;z-index:90;background:rgba(0,0,0,.55);
      display:flex;align-items:center;justify-content:center;padding:14px}
.sgbox{background:var(--panel);border:1px solid var(--line);
      border-radius:14px;width:min(1100px,100%);max-height:90vh;
      display:flex;flex-direction:column;overflow:hidden}
.sgh{display:flex;align-items:center;gap:10px;padding:10px 14px;
      border-bottom:1px solid var(--line);background:var(--bg-2)}
.sgh .sec{font:600 11px var(--mono);color:var(--accent);
      border:1px solid var(--accent);border-radius:4px;padding:1px 6px}
.sgt{font:600 12px var(--font);color:var(--ink-dim)}
.sgx{margin-left:auto;background:var(--bg-2);border:1px solid var(--line);
      border-radius:7px;color:var(--ink);padding:5px 10px;cursor:pointer}
.sggrid{display:grid;grid-template-columns:repeat(auto-fill,
      minmax(200px,1fr));gap:10px;padding:12px;overflow:auto}
.sgcell{border:1px solid var(--line);border-radius:10px;
      background:var(--bg-2);padding:0;overflow:hidden;cursor:pointer;
      text-align:left;display:flex;flex-direction:column}
.sgcell:hover,.sgcell:focus{border-color:var(--accent);outline:0}
.sgcb{display:block;height:200px;overflow:hidden;position:relative;
      background:var(--bg)}
.sgcb iframe{display:block;border:0;pointer-events:none;
      background:var(--bg)}
.sgnm{display:block;padding:6px 9px;font:600 11.5px var(--mono);
      color:var(--ink);border-top:1px solid var(--line)}
.card{background:var(--panel);border:1px solid var(--line);
     border-radius:var(--r);overflow:hidden;display:flex;
     flex-direction:column;min-width:0}
.card .cb{min-width:0;overflow:hidden}
.card .cf .crow{margin-left:auto}
.fxlab{display:flex;align-items:center;gap:8px;font:600 11px var(--mono);
     color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
.fxsel{flex:1;min-width:0;background:var(--bg-2);border:1px solid var(--line);
     border-radius:7px;color:var(--ink);font:12px var(--font);
     padding:6px 8px;cursor:pointer}
.crow{display:flex;align-items:center;gap:10px}
.crow .pick{margin-left:auto}
.card.picked{border-color:var(--ok)}
.card .ch{display:flex;align-items:center;gap:8px;
     padding:10px 12px;border-bottom:1px solid var(--line);
     min-width:0;max-width:100%;box-sizing:border-box}
.card .ch .nm{font-weight:650;font-size:13px;flex:1;
 min-width:0;overflow:hidden;text-overflow:ellipsis;
 white-space:nowrap}
.card .ch .nm[title]{cursor:default}
.card .ch .vsw{flex:none}
.card .ch .id{font:600 11px var(--mono);color:var(--accent);
     border:1px solid var(--accent);border-radius:4px;
     padding:1px 5px}
.card .ch .score{margin-left:auto;font:600 11px var(--mono);
     color:var(--muted)}
.card .cb{position:relative;background:var(--bg);min-height:64px;
     max-width:100%;box-sizing:border-box}
.card .cb:has(iframe)::before{content:'';position:absolute;inset:0;
     background:linear-gradient(100deg,var(--bg) 30%,var(--bg-2) 50%,var(--bg) 70%);
     background-size:200% 100%;animation:cbsk 1.3s linear infinite}
@keyframes cbsk{to{background-position:-200% 0}}
.card .cb.done::before,.card .cb.err::before{display:none}
.card .cb iframe{display:block;width:100%;height:480px;border:0;
     position:relative;background:var(--bg)}
.card.mobile .cb iframe{max-width:var(--vw,340px);margin:0 auto;
     border-left:1px solid var(--line);
     border-right:1px solid var(--line)}
.card.mobile{justify-self:stretch;width:100%}
.card .cb .noprev{display:grid;place-items:center;height:120px;
     color:var(--muted);font-size:12px;padding:0 16px;text-align:center}
.perr{position:absolute;inset:0;display:grid;place-items:center;
     color:var(--bad,#b4453f);font-size:12px;padding:0 16px;
     text-align:center;background:var(--bg)}
.card .vp{position:absolute;top:8px;right:8px;display:flex;gap:4px;
     z-index:2}
.card .vp button{border:1px solid var(--line);
     background:var(--panel);color:var(--muted);border-radius:6px;
     font:600 11px var(--font);padding:3px 7px;cursor:pointer}
.card .vp button.on{color:var(--accent);border-color:var(--accent)}
.card .cf{display:flex;align-items:center;justify-content:flex-start;
     gap:10px;padding:10px 12px;border-top:1px solid var(--line);
     min-height:44px;min-width:0;max-width:100%;
     box-sizing:border-box;flex-wrap:wrap}
.card .cb{min-height:300px}
.card .tags{display:flex;gap:5px;flex-wrap:wrap}
.tag{font:600 11px var(--mono);color:var(--muted);
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
.empty{color:var(--muted);font-size:13px;padding:28px 4px}.vtweak{display:grid;grid-template-columns:repeat(auto-fill,
  minmax(248px,1fr));gap:8px 18px;margin:16px 0;padding:14px 16px;
  border:1px solid var(--line);border-radius:12px;background:var(--bg-2)}
.vgrp{grid-column:1/-1;font:700 11px var(--font);color:var(--muted);
  letter-spacing:.08em;text-transform:uppercase;margin-top:4px}
.vax{display:flex;align-items:center;gap:8px;font:500 11.5px var(--font);
  min-width:0;overflow:hidden}
.vaxn{flex:0 0 112px;min-width:0;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap;color:var(--ink-dim)}
.vax input{flex:1;min-width:40px;accent-color:var(--ink)}
.vaxa{flex:0 0 64px;overflow:hidden;text-overflow:ellipsis;
  white-space:nowrap;font:600 11px var(--mono);color:var(--ink)}
.vchips{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
.vmoods{display:flex;flex-wrap:wrap;gap:6px;padding:4px 0 10px}
.vmood{font:600 11px var(--mono);padding:4px 12px;
 border-radius:99px;border:1px solid var(--line);
 background:var(--panel);color:var(--muted);cursor:pointer}
.vmood:hover{border-color:var(--accent);color:var(--accent)}
.vmood.on{background:var(--accent);border-color:var(--accent);
 color:var(--btn-ink,#fff)}
.card.live .cb iframe{pointer-events:auto}
.vprev .cb iframe{pointer-events:auto}
.vadv{margin:2px 0 4px}
.vadv>summary{cursor:pointer;font:600 11px var(--mono);
 letter-spacing:.08em;text-transform:uppercase;
 color:var(--muted);padding:4px 0;list-style:none}
.vadv>summary::-webkit-details-marker{display:none}
.vadv>summary::before{content:'\25B8 ';color:var(--accent)}
.vadv[open]>summary::before{content:'\25BE '}
.chip{font:600 11px var(--mono);border:1px solid var(--line);
  border-radius:999px;padding:4px 10px;color:var(--muted);cursor:pointer}
.chip.on{color:var(--ink);border-color:var(--ink)}
/* vibe board uses the pre-split card layout (operator revert) */
#board[data-pane=vibe] .card{display:flex;flex-direction:column}
#board[data-pane=vibe] .card .cb{border-right:0}
#board[data-pane=vibe] .card .cf{flex-direction:row;align-items:center;
     justify-content:center;gap:10px;padding:10px 12px;
     border-top:1px solid var(--line);min-height:44px}
#board[data-pane=vibe] .card .cf .crow{margin-top:0}
.vprev{border:1px solid var(--line);border-radius:12px;
  overflow:hidden;margin:12px 0 20px;background:var(--panel)}
.vprev .cb{height:70vh;position:relative;overflow:hidden}
.vprev .cb:has(iframe)::before{content:'';position:absolute;inset:0;
  background:linear-gradient(100deg,var(--bg) 30%,var(--bg-2) 50%,var(--bg) 70%);
  background-size:200% 100%;animation:cbsk 1.3s linear infinite}
.vprev .cb.done::before,.vprev .cb.err::before{display:none}
.vprev iframe{width:100%;height:100%;border:0;position:relative}
.vprev .cf{display:flex;align-items:center;justify-content:space-between;
  padding:10px 14px;border-top:1px solid var(--line)}
.vname{font:650 12.5px var(--font);color:var(--ink)}
.vq{width:100%;max-width:340px;margin:10px 0;padding:8px 12px;
  border:1px solid var(--line);border-radius:8px;background:var(--bg-2);
  color:var(--ink);font:12.5px var(--font)}
.vsw{display:inline-flex;gap:3px;margin-left:auto}
.vsw i{width:14px;height:14px;border-radius:4px;display:inline-block;
  border:1px solid var(--line)}

/* custom type-ladder editor */
.tsed{border:1px solid var(--line);border-radius:12px;
  background:var(--panel);padding:16px 18px;margin:12px 0 18px}
.tsed h2{margin:0 0 12px;font:700 14px var(--font)}
.tsctl{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end}
.tsctl>label,.tsgrid label{font:600 11px var(--font);
  color:var(--muted);display:flex;flex-direction:column;gap:4px;
  min-width:96px;flex:0 1 auto}
.tsctl>label select,.tsctl>label input,.tsgrid input,
.tsgrid select{background:var(--bg-2);border:1px solid var(--line);
  border-radius:7px;padding:7px 9px;color:var(--ink);
  font:12.5px var(--font);width:100%;min-width:0}
.tsadv{flex:1 1 100%;font:600 11px var(--font);color:var(--muted)}
.tsadv summary{cursor:pointer;padding:6px 0}
.tsgrid{display:grid;grid-template-columns:repeat(auto-fill,
  minmax(148px,1fr));gap:10px;padding:8px 0 2px}
.tsvpbar{display:flex;gap:6px;margin-bottom:12px}
.tsvpb{background:var(--bg-2);border:1px solid var(--line);
  border-radius:7px;padding:5px 11px;color:var(--muted);
  font:600 11px var(--mono);cursor:pointer}
.tsvpb.on{color:var(--ink);border-color:var(--acc,#7c9eff);
  background:color-mix(in srgb,var(--acc,#7c9eff) 12%,var(--bg-2))}
.tsprev{display:grid;grid-template-columns:1fr;gap:18px;
  margin:14px 0}
.tsprev .tscol{background:var(--bg-2);border:1px solid var(--line);
  border-radius:10px;padding:12px 14px;min-width:0;overflow:hidden}
#ts-th{margin-left:auto}
.tsframe{border:1px solid var(--line);border-radius:10px;
  overflow:hidden;background:#fff;position:relative;min-height:120px}
.tsframe iframe{border:0;display:block;transform-origin:top left}
.tslab{font:600 10.5px var(--mono);color:var(--muted);
  text-transform:uppercase;letter-spacing:.06em;margin:12px 0 4px}
.tslad{max-height:190px;overflow:auto}
.tsprev .tscol h4{margin:0 0 8px;font:600 11px var(--mono);
  color:var(--muted);text-transform:uppercase;letter-spacing:.06em}
.tsr{display:flex;align-items:baseline;gap:10px;min-width:0;
  padding:2px 0;border-top:1px solid color-mix(in srgb,
  var(--line) 45%,transparent)}
.tsr:first-of-type{border-top:0}
.tsrn{flex:0 0 38px;font:600 10.5px var(--mono);color:var(--muted)}
.tsrx{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;
  white-space:nowrap;color:var(--ink);line-height:1.2}
.tsrp{flex:0 0 auto;font:10.5px var(--mono);color:var(--muted)}
.tsvars{margin:0 0 12px;padding:10px 12px;max-height:150px;
  overflow:auto;background:var(--bg-2);border:1px solid var(--line);
  border-radius:9px;font:10.5px/1.55 var(--mono);color:var(--ink-dim);
  white-space:pre-wrap;word-break:break-all}
.tsc{background:var(--bg-2);color:var(--ink);border:1px solid
  var(--line);border-radius:8px;padding:8px 13px;
  font:600 12px var(--font);cursor:pointer}
@media (max-width:768px){.tsprev{grid-template-columns:1fr}}


/* card selection (keyboard scrub) */
.card.sel{outline:2px solid var(--accent);outline-offset:-1px}
.card .cb .desc{padding:6px 12px 0;color:var(--muted);font-size:11.5px}

/* scrub board — the whole page, section rows in place */
.srow{margin-bottom:14px;border:1px solid var(--line);
      border-radius:var(--r);overflow:hidden;background:var(--panel)}
.srow .srh{display:flex;align-items:center;gap:8px;padding:7px 12px;
      border-bottom:1px solid var(--line);background:var(--bg-2)}
.srow .sec{font:600 11px var(--mono);color:var(--accent);
      border:1px solid var(--accent);border-radius:4px;padding:1px 6px}
.srow .sname{font-weight:650;font-size:12.5px}
.srow .spos{margin-left:auto;font:600 11px var(--mono);
      color:var(--muted)}
.srow .snav{display:flex;gap:3px}
.fxmenu{position:absolute;right:8px;top:calc(100% - 2px);z-index:60;
  background:var(--panel);border:1px solid var(--line);
  border-radius:10px;padding:6px;display:flex;flex-direction:column;
  gap:2px;max-height:240px;overflow:auto;min-width:150px;
  box-shadow:0 8px 24px rgba(0,0,0,.18)}
.fxopt{font:500 11px var(--mono);text-align:left;padding:5px 9px;
  border:0;border-radius:6px;background:none;color:var(--ink-dim);
  cursor:pointer;white-space:nowrap}
.fxopt:hover{background:var(--bg-2);color:var(--ink)}
.fxopt.on{color:var(--ink);font-weight:700}
.fxbtn{margin-left:6px;padding:5px 10px;border:1px solid var(--line);
  border-radius:999px;background:transparent;color:var(--muted);
  font:650 11.5px var(--font);cursor:pointer}
.fxbtn:hover{color:var(--ink)}
.fxbtn.on{border-color:var(--ink);color:var(--ink)}
.srow .fxbtn{padding:3px 8px;margin-left:0}
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
@media(max-width:1024px){
  #app{grid-template-columns:1fr}
  #board{grid-column:auto}
  #top{grid-column:1/-1}
  #rail{display:none;position:fixed;top:56px;left:0;bottom:0;
       width:min(80vw,300px);z-index:50;overflow-y:auto;
       box-shadow:10px 0 34px rgba(0,0,0,.45)}
  /* the fixed selbar (~54px) covers the drawer's last rows —
     lift the rail's bottom edge over it wherever the bar shows */
  #rail{bottom:56px}
  @media(max-width:767px){#rail{bottom:0}}
  #rail.open{display:block}
  #scrim{display:none;position:fixed;inset:0;top:56px;z-index:49;
        background:rgba(0,0,0,.35)}
  #scrim.open{display:block}
  #railBtn{display:grid}
  #top{gap:8px;padding:0 10px}
  #top .who{overflow:hidden;white-space:nowrap}
  #top .who small{display:none}
  #dnaPop .panel{right:-40px}
  .grid{grid-template-columns:1fr}
  .card{grid-template-columns:1fr;grid-template-rows:auto auto auto}
  .card .cb{grid-row:auto;grid-column:1;border-right:0;
     border-bottom:1px solid var(--line)}
  .card .ch,.card .cf{grid-column:1;grid-row:auto}
  .ingrow{grid-template-columns:1fr}
  .srow .srh{flex-wrap:wrap}
}
@media(min-width:1025px){#railBtn{display:none !important}}
@media(max-width:560px){
  #top{gap:6px}
  #top .who{max-width:130px;text-overflow:ellipsis}
  #vwCtl{display:none}
  .saves{flex-wrap:wrap}
  .saves input{flex:1 1 140px;min-width:0}
  .ssq{flex:1 1 100%;min-width:0}
  .ssrow{grid-template-columns:minmax(0,1fr) auto auto;gap:8px 10px}
  .ssrow .ssm{display:none}
}
.compmob{display:none}
@media(max-width:560px){
  .card .cf{flex-wrap:wrap}
  .card .cf .crow{margin-top:0}
  .compwrap{overflow-x:auto;-webkit-overflow-scrolling:touch;
    display:none}
  .compmob{display:block}
  .fxlab{display:grid;gap:4px}
  .fxsel{width:100%}
}
.compwrap{overflow-x:auto}
.cmp{border:1px solid var(--line);border-radius:8px;padding:10px 12px;
  margin:8px 0;background:var(--panel)}
.csec{font:600 11px var(--mono);color:var(--muted);margin-bottom:6px}
.crow2{display:flex;justify-content:space-between;gap:10px;
  align-items:baseline;padding:3px 0;font-size:12px}
.crow2 .olab{color:var(--muted)}
.crow2 .o{display:inline-block;margin:1px 3px 1px 0;
  padding:1px 7px;border:1px solid var(--line);border-radius:10px;
  font:600 10.5px var(--mono)}
.crow2 .o.pickd{background:var(--accent);color:var(--accent-ink);
  border-color:var(--accent)}
.rmgrid{display:flex;flex-direction:column;gap:14px;max-width:920px}
.rmslot{display:grid;grid-template-columns:20px minmax(0,1fr) 30px minmax(90px,170px) 46px;
     gap:10px;align-items:center}
.rmsrc{display:flex;flex-direction:column;gap:4px;min-width:0}
.rmq{background:var(--bg-2);border:1px solid var(--line);
     border-radius:6px;color:var(--ink);padding:4px 9px;font:11.5px
     var(--font)}
.rmfav{border:0;background:none;font-size:15px;cursor:pointer;
     color:var(--muted);padding:0}
.rmfav:hover{color:var(--ink)}
.rmslot select{background:var(--bg-2);border:1px solid var(--line);
     border-radius:7px;color:var(--ink);padding:7px 10px;font:500 13px
     var(--font)}
.rmslot input[type=range]{accent-color:var(--accent)}
.rmslot i{font:600 11px var(--mono);color:var(--muted)}
.rmpct{font:600 11.5px var(--mono);text-align:right}
.rmgroups{display:flex;flex-direction:column;gap:6px;margin-top:6px}
.rmrow{display:flex;gap:14px;align-items:center;font:500 12.5px
     var(--font);color:var(--ink);flex-wrap:wrap}
.rmrow>span{min-width:120px;color:var(--muted);font-size:11.5px}
.rmrow label{display:inline-flex;gap:5px;align-items:center;
     font:600 11.5px var(--font);color:var(--muted);cursor:pointer}
.rmsave{display:flex;gap:9px;align-items:center;margin-top:8px}
.rmsave input{flex:0 0 240px;background:var(--bg-2);border:1px solid
  var(--line);border-radius:7px;color:var(--ink);padding:7px 11px;
  font-size:13px}
.rmsave span{font:500 12px var(--font);color:var(--muted)}
.rmph{display:flex;align-items:center;justify-content:space-between;
  padding:6px 10px;border-bottom:1px solid var(--line);
  font:600 11px var(--mono);color:var(--muted)}
.rmph .xp{margin-left:0}
.rmprev{margin-top:14px;border:1px solid var(--line);
     border-radius:var(--r);overflow:hidden;height:520px}
.rmprev iframe{width:100%;height:100%;border:0;background:#fff;
     pointer-events:none}

.xp{border:1px solid var(--line);background:var(--bg-2);color:var(--ink);
  border-radius:6px;padding:0 7px;height:20px;line-height:1;
  font-size:11px;cursor:pointer;margin-left:auto}
.xp:hover{background:var(--panel-2)}
.srow .xp{margin-left:0;align-self:center}
#xpOv{position:fixed;inset:0;z-index:90;background:rgba(0,0,0,.72);
  display:flex;flex-direction:column}
#xpBar{display:flex;align-items:center;gap:8px;padding:9px 14px;
  background:var(--panel);border-bottom:1px solid var(--line);
  flex:none;flex-wrap:wrap;row-gap:6px}
#xpBar .xdev{flex:none}
.xttl{font:600 12.5px var(--font);color:var(--ink);max-width:26%;
  overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.xdev{display:flex;border:1px solid var(--line);border-radius:7px;
  overflow:hidden;margin-left:auto;flex:none}
.xdev button{border:0;background:none;color:var(--muted);cursor:pointer;
  padding:5px 10px;min-width:44px;min-height:44px;
  display:inline-flex;align-items:center;justify-content:center}
.xdev button.on{background:var(--accent);color:var(--accent-ink)}
.xdev button:focus-visible{outline:2px solid var(--accent);
  outline-offset:1px;z-index:1}
.xdev button svg{display:block}
#xpBar .xth,#xpBar .xnav,#xpBar .xopen,#xpBar #xpX{
  background:var(--bg-2);color:var(--ink);border:1px solid var(--line);
  border-radius:7px;padding:5px 10px;cursor:pointer;font-size:12px;
  text-decoration:none;line-height:1.2}
.xpPrim{background:var(--accent);color:var(--accent-ink);border:0;
  border-radius:7px;padding:6px 14px;cursor:pointer;
  font:600 12px var(--font)}
.xstage{flex:1;overflow:auto;padding:14px}
.xframe{height:calc(100vh - 76px);margin:0 auto}
.xframe iframe{width:100%;height:100%;border:0;border-radius:8px;
  background:#fff}
@media(max-width:640px){
  .xttl{display:none}
  .xdev{margin-left:0}}
@media(max-width:768px){
  #xpBar button,#xpBar a{min-height:44px;min-width:44px;
    display:inline-flex;align-items:center;justify-content:center}
  .xpPrim{font-size:13px}}
.ssq{flex:1;min-width:180px;padding:9px 12px;border:1px solid var(--line);
     border-radius:8px;background:var(--panel);color:var(--ink);
     font:12px var(--font)}
.sscount{font:600 11px var(--mono);color:var(--muted);margin:12px 0 6px}
.ssrow{display:grid;grid-template-columns:minmax(0,1fr) repeat(4,auto) auto auto;
     gap:14px;align-items:center;padding:9px 14px;margin-bottom:6px;
     background:var(--panel);border:1px solid var(--line);
     border-radius:var(--r-sm)}
.ssnm{font:650 13px var(--font);overflow:hidden;text-overflow:ellipsis;
     white-space:nowrap}
.ssm{font:500 11px var(--mono);color:var(--muted);white-space:nowrap}
.ssdel{border:0;background:none;color:var(--muted);cursor:pointer;
     font:600 12px var(--font);padding:2px 6px;border-radius:6px}
.ssdel:hover{color:#d33;background:rgba(200,30,30,.08)}

.compmat{margin-top:22px;border:1px solid var(--line);border-radius:10px;
  padding:10px 14px;background:var(--bg-2);overflow-x:auto}
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
      <span class="vind" aria-hidden="true"></span>
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
  <div id="scrim"></div>
  <main id="board"></main>
  <div id="selbar"></div>
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
  var _tq=[],_tBusy=false;
  function toast(t){_tq.push(t);if(!_tBusy)_tNext()}
  function _tNext(){var t=_tq.shift();
    if(t==null){_tBusy=false;return}
    _tBusy=true;var e=document.getElementById('toast');
    e.textContent=t;e.classList.add('show');
    setTimeout(function(){e.classList.remove('show');
      setTimeout(_tNext,140)},2400)}
  function api(path,body){
    return fetch(path,{method:'POST',
      headers:{'Content-Type':'application/json',
               'X-WF-Page-Token':window.__wfTok},
      body:JSON.stringify(body||{})}).then(function(r){return r.json()})
      .catch(function(){return {error:'request failed'}})}

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
        f.src=u+'?theme='+m});
  }
  function setTheme(m){var was=document.documentElement.dataset.theme;
    applyTheme(m);
    if(m!==was)toast('theme switched to '+m);
    try{localStorage.setItem('wfapp-theme',m)}catch(e){}}
  document.getElementById('themeBtn').onclick=function(){
    setTheme(document.documentElement.dataset.theme==='dark'
      ?'light':'dark')};

  // one global preview breakpoint — M/T/D, every frame at once;
  // sliding indicator tracks the active segment
  function _vind(){
    var ind=document.querySelector('#vwCtl .vind'),
        on=document.querySelector('#vwCtl button.on')||
           document.querySelector('#vwCtl button');
    if(ind&&on){ind.style.width=on.offsetWidth+'px';
      ind.style.transform='translateX('+on.offsetLeft+'px)'}}
  document.querySelectorAll('#vwCtl button').forEach(function(b){
    b.onclick=function(){
      document.querySelectorAll('#vwCtl button').forEach(
        function(x){x.classList.toggle('on',x===b)});
      document.documentElement.style.setProperty('--vw',b.dataset.w);
      _vind()}});
  _vind();window.addEventListener('resize',_vind);

  // rail collapse — hamburger on narrow screens, auto-close on pick
  document.getElementById('railBtn').onclick=function(){
    var r=document.getElementById('rail'),s=document.getElementById('scrim');
    r.classList.toggle('open');s.classList.toggle('open',r.classList.contains('open'))};
  document.getElementById('scrim').onclick=function(){
    document.getElementById('rail').classList.remove('open');
    document.getElementById('scrim').classList.remove('open')};
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){
      var r=document.getElementById('rail');
      if(r.classList.contains('open')){
        r.classList.remove('open');
        document.getElementById('scrim').classList.remove('open')}
      var dp=document.getElementById('dnaPop');
      if(dp&&dp.open)dp.open=false}});
  document.addEventListener('click',function(e){
    var dp=document.getElementById('dnaPop');
    if(dp&&dp.open&&!dp.contains(e.target))dp.open=false});

  var ICON={
    home:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 7l6-5 6 5v6a1 1 0 01-1 1H3a1 1 0 01-1-1z"/></svg>',
    doc:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="1.5" width="10" height="13" rx="1.5"/><path d="M5.5 5h5M5.5 8h5M5.5 11h3"/></svg>',
    pin:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 14.5S3 9.8 3 6.5a5 5 0 0110 0c0 3.3-5 8-5 8z"/><circle cx="8" cy="6.5" r="1.8"/></svg>',
    mail:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="3.5" width="12" height="9" rx="1.5"/><path d="M2.5 4.5L8 9l5.5-4.5"/></svg>',
    news:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="2.5" width="10" height="11" rx="1.5"/><path d="M4.5 5.5h5M4.5 8h5M4.5 10.5h3"/><path d="M12 5h1.5a1 1 0 011 1v6a1.5 1.5 0 01-1.5 1.5H4"/></svg>',
    vibe:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="5" cy="8" r="2.6"/><circle cx="8" cy="8" r="2.6" opacity=".7"/><circle cx="11" cy="8" r="2.6" opacity=".4"/></svg>',
    mix:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 3h10M5 6.5h6M7 10h2M8 3v10" opacity=".9"/></svg>',
    type:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2.5 4h11M8 4v9.5M5.5 13.5h5"/></svg>',
    page:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="1.5" width="10" height="13" rx="1.5"/><path d="M5.5 4.5h5M5.5 7h5M5.5 9.5h5M5.5 12h3"/></svg>',
    bars:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1.5" y="3" width="13" height="4" rx="1"/><path d="M3.5 10h9M3.5 13h5"/></svg>',
    burger:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11"/></svg>',
    foot:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="1.5" y="9" width="13" height="4" rx="1"/><path d="M3.5 6h9M3.5 3h5"/></svg>',
    modal:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2.5" y="4" width="11" height="8" rx="1.5"/><path d="M6 8h4"/></svg>',
    sun:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="8" cy="8" r="3"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4"/></svg>',
    moon:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M13.5 9.5A6 6 0 016.5 2.5a6 6 0 107 7z"/></svg>',
    fx:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 1l1.7 4.4L14 7l-4.3 1.6L8 13l-1.7-4.4L2 7l4.3-1.6z"/></svg>'};

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
    if(DATA.boards.typescale)item('b',DATA.boards.typescale);
    h+='<div class="railgrp">2 · Layout</div>';
    LAYOUT_TABS.forEach(function(k){
      if(DATA.boards[k])item('b',DATA.boards[k])});
    h+='<div class="railgrp">3 · Sections · Elements</div>';
    var banked=[];
    Object.keys(DATA.galleries).forEach(function(k){
      if(k==='fx')return;
      var g=DATA.galleries[k];
      if(/\u00b7\s*bank/.test(g.title||''))banked.push(g);
      else item('g',g)});
    if(banked.length){
      h+='<details class="railbank"><summary>'+ICON.bars+
         'Bank (reference)<span class="cnt">'+banked.length+
         '</span></summary>';
      banked.forEach(function(g){item('g',g)});
      h+='</details>'}
    h+='<div class="railgrp">4 · Effects</div>';
    if(DATA.galleries.fx)item('g',DATA.galleries.fx);
    h+='<div class="railgrp">5 · Systems</div>';
    h+='<button class="ritem'+(CUR==='remix'?' on':'')+
       '" data-k="remix" data-t="b">'+ICON.mix+
       '<span>DNA mixer</span></button>';
    h+='<button class="ritem'+(CUR==='saved'?' on':'')+
       '" data-k="saved" data-t="b">'+ICON.doc+
       '<span>Systems</span><span class="cnt">'+
       ((DATA.saved_systems||[]).length||'')+'</span></button>';
    h+='<div class="railgrp">6 · Tools</div>';
    h+='<button class="ritem'+(CUR==='ingest'?' on':'')+
       '" data-k="ingest" data-t="b">'+ICON.news+
       '<span>URL · HTML</span></button>';
    el.innerHTML=h;
    el.querySelectorAll('.ritem').forEach(function(b){
      b.onclick=function(){gotoBoard(b.dataset.k)}});
  }

  function gotoBoard(k){CUR=k;FILT={};SEL=0;ROW=0;
    if(innerWidth<=1024){
      document.getElementById('rail').classList.remove('open');
      document.getElementById('scrim').classList.remove('open')}
    rail();board()}

  // spec §1 flow — Vibe → Type → Layout → Sections → Effects → Review
  var STEPS=[
    {id:'vibe',label:'Vibe',board:'vibe'},
    {id:'type',label:'Type',board:'typescale'},
    {id:'layout',label:'Layout',board:'home'},
    {id:'sections',label:'Sections',board:'page'},
    {id:'effects',label:'Effects',board:'fx'},
    {id:'review',label:'Review & save',board:'saved'}];
  var NEXTSTEP={vibe:['typescale','Type'],typescale:['home','Layout'],
    home:['page','Sections'],service:['page','Sections'],
    location:['page','Sections'],contact:['page','Sections'],
    blog:['page','Sections'],page:['fx','Effects'],
    fx:['saved','Review & save']};
  var SELCHIPS=[
    {k:'vibe',label:'vibe',board:'vibe'},
    {k:'type',label:'type',board:'typescale'},
    {k:'layout',label:'layout',board:'home'},
    {k:'header',label:'header',board:'chrome'},
    {k:'footer',label:'footer',board:'chrome'},
    {k:'menu',label:'menu',board:'menu'},
    {k:'fx:default',label:'effect',board:'fx'}];
  function _boardExists(b){
    return b==='saved'||b==='remix'||!!((DATA.boards||{})[b]||
      (DATA.galleries||{})[b])}
  function stepDone(s){var p=(DATA&&DATA.picked_elements)||{};
    if(s==='vibe')return (BAKED||p.vibe)?(p.vibe||VSRC||BAKED):null;
    if(s==='type'){var tv=p.type;
      if(tv){var tc=((DATA.boards||{}).typescale||{}).cards||[],
        tn=tc.filter(function(x){return x.variant===tv})[0];
        tv=(tn&&tn.name)||(String(tv).indexOf('custom:')===0?
          'custom ladder':String(tv).replace(/^genes:/,''))}
      return tv||null}
    // the signed w3 pick lives in the wave gates, not
    // ELEMENT-PICKS — derive it so a reload shows the choice
    if(s==='layout')return p.layout||
      ((DATA.waves||{}).picked||{}).w3||null;
    if(s==='sections'){var n=Object.keys(p).filter(function(k){
      return k.indexOf('sec:')===0}).length;
      return n?n+' signed':null}
    if(s==='effects'){var f=p['fx:default'];
      return f&&f!=='none'?f:null}
    return null}
  function stepperHtml(){
    var h='<span class="stplab">pick the look</span>';
    STEPS.forEach(function(s,i){
      if(!_boardExists(s.board))return;
      var dn=stepDone(s.id),cur=(CUR===s.board||
        (s.id==='layout'&&LAYOUT_TABS.indexOf(CUR)>=0&&
         CUR!=='page'));
      h+='<span class="stparr">→</span>'+
         '<button class="stp'+(dn?' done':'')+(cur?' on':'')+
         '" data-b="'+s.board+'"><span class="n">'+(dn?'✓':(i+1))+
         '</span>'+s.label+
         (dn?'<span class="sub">'+esc(String(dn))+'</span>':'')+
         '</button>'});
    return h}
  function selbarHtml(){
    var p=(DATA&&DATA.picked_elements)||{},chips='',npick=0;
    SELCHIPS.forEach(function(c){
      var v=c.k==='vibe'?(p.vibe||VSRC||BAKED):
        c.k==='layout'?(p.layout||
          ((DATA.waves||{}).picked||{}).w3):p[c.k];
      if(c.k==='type'&&v){
        var tc=((DATA.boards||{}).typescale||{}).cards||[],
            tn=tc.filter(function(x){return x.variant===v})[0];
        v=(tn&&tn.name)||(String(v).indexOf('custom:')===0?
          'custom ladder':v)}
      if(!v||v==='none'||v==='baseline')v=null;
      if(v)npick++;
      chips+='<button class="sbchip'+(v?' has':'')+'" data-b="'+c.board+
         '"><b>'+c.label+'</b> '+esc(v?String(v).replace(/^(atlas|genes):/,''):'—')+
         '</button>'});
    // below ~1100px the chips fold into a popover so Next + Review
    // always fit on one line
    var h='<span class="sblab">picked</span>'+
       '<span class="sbwide">'+chips+'</span>'+
       '<details class="sbnarrow"><summary class="sbchip">'+
         npick+' picks ▾</summary>'+
         '<div class="sbpbody">'+chips+'</div></details>';
    h+='<span class="sbsp"></span>';
    var nx=NEXTSTEP[CUR];
    if(nx&&_boardExists(nx[0]))
      h+='<button class="sbchip sbr sbnext" data-b="'+nx[0]+
         '">Next: '+esc(nx[1])+' →</button>';
    h+='<button class="sbchip sbr" data-b="saved">Review &amp; save →</button>';
    return h}
  function wireFlow(){
    document.querySelectorAll('#stepper .stp,#selbar .sbchip[data-b]')
      .forEach(function(b){b.onclick=function(){gotoBoard(b.dataset.b)}})}

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
  var FTAG_LABEL={
    'fv1':'variant 1 · fine-tuned','fv2':'variant 2 · fine-tuned',
    'fv3':'variant 3 · fine-tuned',
    'v1':'variant 1','v2':'variant 2','v3':'variant 3',
    'index-led':'index layout','prose-led':'editorial layout',
    'copy default':'standard layout','best-predicted':'recommended',
    'bank-option':'bank only — not emitted','bank':'in bank',
    'derived':'from this design','web':'from the web'};
  function filters(tags){
    var n=Object.keys(FILT).length,seen={};
    var h='<button class="fchip'+(!n?' on':'')+'" data-f="" '+
         'title="clear all filters">clear all</button>';
    tags.forEach(function(t){
      var lab=FTAG_LABEL[t]||t;
      if(seen[t])return;seen[t]=1;
      h+='<button class="fchip'+(FILT[t]?' on':'')+'" data-f="'+esc(t)+'">'+esc(lab)+'</button>'});
    return h;
  }

  // page-scale fx (targets 'page'/'any' on a full-bleed family)
  // span the whole grid row; widget fx share the 2-col compact grid
  var FXWIDE=/fx-(ambient|particles|parallax|pinned|progress|reveal|timeline|compare|cursor|scroll|marquee|atmosphere)|mob-chrome/;
  function fxWide(c){
    return c.element==='fx:default'&&FXWIDE.test(c.grp||'')}
  function card(c,idx){
    var tags=c.tags||[],cls='card'+(c.mobile?' mobile':'')+
        (c.live?' live':'')+(fxWide(c)?' fxw':'')+(c.bank?'':' pg');
    var isPicked=c.element&&(DATA.picked_elements||{})[c.element]===
      c.variant;
    if(c.element==='vibe'&&BAKED===c.variant)isPicked=true;
    if(idx===SEL)cls+=' sel';
    if(isPicked)cls+=' picked';
    var src=c.preview?((c.element==='vibe'||c.element==='type'||
            c.bank)?c.preview:frame(c.preview)):'';
    var h='<div class="'+cls+'" data-idx="'+idx+
          '" data-tags="'+esc(tags.join(' '))+'">';
    h+='<div class="ch"><span class="id">'+esc(c.id)+'</span>'+
       '<span class="nm" title="'+esc(c.name)+'">'+esc(c.name)+'</span>'+
       (c.preview?'<button class="xp" title="expand" data-x="'+
        esc(src)+'">&#x2922;</button>':'')+
       (c.score!=null?'<span class="score">'+esc(c.score)+'</span>':'')+
       '</div>';
    h+='<div class="cb'+(c.element==='type'?' tsdoc':'')+'">';
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
       tags.filter(function(t){var tl=String(t).toLowerCase();
         return tl!==String(c.name||'').toLowerCase()&&
                tl!==String(c.id||'').toLowerCase()})
        .map(function(t){return '<span class="tag">'+
          esc(FTAG_LABEL[t]||t)+'</span>'}).join('')+
       '</div>';
    // first-class effect control — the per-element decorator, labeled
    if(!c.bank&&c.element&&c.element!=='vibe'&&
       String(c.element).indexOf('layout')!==0&&
       c.element!=='type'&&c.element!=='fx:default'){
      var fel='fx:'+c.element,fcur=DATA.picked_elements[fel]||'none',
          fopts=fxOpts(fel);
      if(fopts.length)
        h+='<label class="fxlab">apply effect'+
           '<select class="fxsel" data-fx="'+esc(fel)+'">'+
           '<option value="none"'+(fcur==='none'?' selected':'')+
           '>none</option>'+
           fopts.map(function(v){return '<option value="'+esc(v)+'"'+
             (v===fcur?' selected':'')+'>'+esc(v)+'</option>'}).join('')+
           '</select></label>';}
    h+='<div class="crow">';
    if(c.wave){
      h+='<button class="pick" data-wave="'+c.wave+'" data-d="'+esc(c.id)+'">Pick</button>';
    }else if(c.element){
      h+='<button class="pick" data-elem="'+c.element+'" data-var="'+esc(c.variant)+'"'+
         (c.genes?' data-genes="'+esc(JSON.stringify(c.genes))+'"':'')+'>'+
         (c.element==='vibe'?'Bake':c.element==='fx:default'?
          'Set site effect':'Pick')+'</button>';
    }
    h+='<span class="pstat'+(isPicked?' ok':'')+'">'+
       (isPicked?'picked ✓':'')+'</span></div></div></div>';
    return h;
  }

  // the fx variants a given element's bucket advertises, deduped
  function fxOpts(element){
    var fxmap=DATA.fxmap||{},b=fxBucket(element),seen={};
    return ((fxmap[b]||[]).concat(fxmap.any||[])).filter(function(v){
      if(seen[v])return 0;seen[v]=1;return 1})}

  // vibe space: gene sliders + preset atlas + signed gene bundle
  var VGENES={},VQ='',VRES=null,VMOOD='',VADV=false,VSRC='';
  function vibePane(el,o){
    var axes=o.axes||[],cards=o.cards||[];
    var h='<h1>Vibe space</h1><div class="desc">'+esc(o.desc||'')+'</div>';
    var gkeys=Object.keys(VGENES);
    h+='<div class="vprev"><div class="cb" id="vprevCb">'+
       (VRES&&VRES.preview?
        '<iframe src="'+esc(VRES.preview)+'" loading="lazy"></iframe>':
        '<div class="noprev">pick a mood, a preset, or move a '+
        'slider — the resolved vibe renders here</div>')+'</div>'+
       '<div class="cf"><span class="vname">'+
       esc(VSRC||'computed vibe')+'</span>'+
       '<span class="vchips">'+(gkeys.length?gkeys.map(function(k){
         return '<span class="chip on" data-ax="'+k+'">'+esc(k)+':'+
                esc(VGENES[k])+' ×</span>'}).join(''):
        '<span class="chip">baseline genes</span>')+'</span>'+
       '<button class="xp" id="vXp" title="expand" data-x="'+
       esc(VRES&&VRES.preview||'')+'">⤢</button>'+
       '<button class="pick" id="vBake">Bake</button></div></div>';
    h+='<div class="vmoods">'+
       ['happy·playful','professional·editorial','bold·brutal',
        'calm·paper','playful·neon','luxe·luxe','noir·noir'
       ].map(function(m){var p=m.split('·');
         return '<button class="vmood'+(VMOOD===p[1]?' on':'')+
                '" data-cl="'+p[1]+'">'+p[0]+'</button>'}).join('')+
                '</div>';
    h+='<div class="filters">'+filters(o.clusters||[])+'</div>';
    h+='<input class="vq" id="vq" placeholder="search presets…" '+
       'value="'+esc(VQ)+'">';
    h+='<div class="grid">';
    var lastG=null,shown=0;
    cards.forEach(function(c,i){
      if(!Object.keys(FILT).every(function(t){
        return (c.tags||[]).indexOf(t)>=0}))return;
      if(VQ&&(c.id+' '+c.name+' '+(c.tags||[]).join(' '))
         .toLowerCase().indexOf(VQ)<0)return;
      if(c.grp&&c.grp!==lastG){lastG=c.grp;
        h+='<div class="glabel">'+esc(c.grp)+'</div>'}
      shown++;
      var sw=(c.swatch&&c.swatch[0])||[];
      h+='<div class="card pg live" data-i="'+i+'"><div class="ch">'+
         '<span class="id">'+esc(c.id)+'</span>'+
         '<span class="nm" title="'+esc(c.name)+'">'+esc(c.name)+'</span>'+
         '<span class="vsw">'+(sw[2]?'<i style="background:'+
          esc(sw[2])+'"></i>':'')+(sw[0]?'<i style="background:'+
          esc(sw[0])+'"></i>':'')+'</span></div>'+
         '<div class="cb">'+(c.preview?
          '<iframe src="'+esc(c.preview)+'" loading="lazy"></iframe>':
          '<div class="noprev">no emit</div>')+
         '<div class="desc">'+esc(c.desc||'')+'</div></div>'+
         '<div class="cf">'+
         '<button class="abtn vload" data-i="'+i+
         '">load genes</button>'+
         (c.preview?'<button class="xp" title="expand" data-x="'+
          esc(c.preview)+'">⤢</button>':'')+
         '<button class="pick" data-i="'+i+'">Bake</button></div></div>';
    });
    h+='</div>';
    if(!shown)h+='<div class="empty">no presets match the current '+
      'search/filter — <button class="abtn" id="vclr">clear '+('filters')+'</button></div>';
    h+='<details class="vadv"'+(VADV?' open':'')+
       '><summary>advanced tweaks</summary>';
    h+='<div class="vtweak">';
    var grp=null;
    axes.forEach(function(a){
      if(a.group!==grp){grp=a.group;
        h+='<div class="vgrp">'+esc(grp)+'</div>'}
      var cur=VGENES[a.axis],ix=cur?a.alleles.indexOf(cur):0;
      h+='<div class="vax"><span class="vaxn" title="'+esc(a.axis)+
         '">'+esc(a.axis)+'</span>'+
         '<input type="range" min="0" max="'+(a.alleles.length-1)+
         '" value="'+Math.max(0,ix)+'" data-ax="'+a.axis+
         '" data-n="'+a.alleles.length+'">'+
         '<span class="vaxa">'+esc(cur||'baseline')+'</span></div>';
    });
    h+='</div></details>';
    el.innerHTML=h;
    // wire: sliders → resolve; chips → clear axis; bake → sign bundle
    el.querySelectorAll('.vax input').forEach(function(r){
      r.oninput=function(){VMOOD='';VSRC='';
        var a=o.axes.find(function(x){return x.axis===r.dataset.ax});
        VGENES[a.axis]=a.alleles[+r.value];
        r.parentElement.querySelector('.vaxa').textContent=
          a.alleles[+r.value];
        resolveVibe(el,o)}});
    el.querySelectorAll('.vchips .chip.on').forEach(function(ch){
      ch.onclick=function(){delete VGENES[ch.dataset.ax];
        vibePane(el,o)}});
    el.querySelectorAll('.fchip').forEach(function(b){
      b.onclick=function(ev){var t=b.dataset.f;
        if(!t)FILT={};
        else if(ev.shiftKey||ev.metaKey||ev.ctrlKey){
          if(FILT[t])delete FILT[t];else FILT[t]=1}
        else{var was=FILT[t];FILT={};if(!was)FILT[t]=1;
          // a cluster chip is a vibe pick, not just a filter:
          // load that cluster's preset genes + re-emit the preview
          if(!was){
            var first=(cards||[]).filter(function(cc){
              return cc.grp===t})[0];
            if(first&&first.genes){VMOOD='';
              VSRC=(first&&first.name)||t;
              VGENES=Object.assign({},first.genes);
              vibePane(el,o);resolveVibe(el,o);return}}}
        vibePane(el,o)}});
    var vc=el.querySelector('#vclr');
    if(vc)vc.onclick=function(){VQ='';FILT={};vibePane(el,o)};
    var vd=el.querySelector('.vadv');
    if(vd)vd.addEventListener('toggle',function(){VADV=vd.open});
    el.querySelector('#vq').oninput=function(e){
      VQ=e.target.value.toLowerCase();
      var shown=0;
      el.querySelectorAll('.grid .card').forEach(function(cd){
        var c=cards[+cd.dataset.i],hay=(c.id+' '+c.name+' '+
          (c.tags||[]).join(' ')).toLowerCase(),
            off=VQ&&!hay.includes(VQ);
        cd.style.display=off?'none':'';
        if(!off)shown++});
      var em=el.querySelector('#vdyn');
      if(!shown&&!em){
        var d=document.createElement('div');
        d.id='vdyn';d.className='empty';
        d.style.gridColumn='1/-1';
        d.innerHTML='no presets match the current search/filter — '+
          '<button class="abtn" id="vclr">clear filters</button>';
        el.querySelector('.grid').appendChild(d);
        d.querySelector('#vclr').onclick=function(){
          VQ='';FILT={};vibePane(el,o)}}
      else if(shown&&em)em.remove()};
    el.querySelector('#vBake').onclick=function(){
      var v='genes:'+vhash(VGENES);
      api('/element-pick',{pipeline:PIPELINE,element:'vibe',
        variant:v,
        bundle:{genes:VGENES,tokens:VRES&&VRES.tokens,
          resolved:VRES&&VRES.resolved}}).then(
        function(j){toast(j.message||(j.ok?'baked':'refused'));
          if(j.ok){BAKED=v;DATA.picked_elements.vibe=v;
            DATA.vibe_genes=Object.assign({},VGENES);
            setTheme((VRES&&VRES.theme)||'light')}})};
    el.querySelectorAll('.vmood').forEach(function(m){
      m.onclick=function(){
        VMOOD=m.dataset.cl;VSRC=m.textContent.trim();
        var first=(o.cards||[]).filter(function(cc){
          return cc.grp===m.dataset.cl})[0];
        VGENES=Object.assign({},first?first.genes||{}:{});
        vibePane(el,o);
        resolveVibe(el,o)}});
    el.querySelectorAll('.vload').forEach(function(b){
      b.onclick=function(){VMOOD='';
        VSRC=cards[+b.dataset.i].name||'';
        VGENES=Object.assign({},cards[+b.dataset.i].genes||{});
        vibePane(el,o);
        var vp=el.querySelector('.vprev');
        if(vp)vp.scrollIntoView({block:'nearest'});
        resolveVibe(el,o)}});
    el.querySelectorAll('.cf .pick:not(#vBake)').forEach(function(b){
      b.onclick=function(){
        var c=cards[+b.dataset.i],v='atlas:'+c.id;
        api('/element-pick',{pipeline:PIPELINE,element:'vibe',
          variant:v,
          bundle:{genes:c.genes}}).then(function(j){
          toast(j.message||(j.ok?'baked':'refused'));
          if(j.ok){BAKED=v;DATA.picked_elements.vibe=v;
            DATA.vibe_genes=Object.assign({},c.genes||{});
            setTheme((c.tags||[]).indexOf('dark')>=0
              ?'dark':'light')}})}});
    wireXp(el);
    wireFrames(el);
    setTheme(document.documentElement.dataset.theme);
    setTimeout(fitIframes,150);
    if(!VRES)resolveVibe(el,o);   // baseline vibe on first open
  }
  function vhash(g){
    var s=Object.keys(g).sort().map(function(k){
      return k+':'+g[k]}).join('|'),h=0;
    for(var i=0;i<s.length;i++){h=(h*31+s.charCodeAt(i))|0}
    return (h>>>0).toString(36)}
  function resolveVibe(el,o){
    api('/vibe-resolve',{pipeline:PIPELINE,genes:VGENES}).then(
      function(j){
        if(j.preview){VRES=j;
          var vx=document.getElementById('vXp');
          if(vx)vx.dataset.x=j.preview;
          var cb=document.getElementById('vprevCb');
          if(cb){cb.innerHTML='<iframe src="'+esc(j.preview)+
            '"></iframe>';
            cb.classList.remove('done','err');
            var vf=cb.querySelector('iframe');
            if(vf){vf.addEventListener('load',function(){
              cb.classList.add('done');setTimeout(fitIframes,60)});
              vf.addEventListener('error',function(){
                cb.classList.add('err')})}
            setTimeout(fitIframes,80)};
          var tsf=document.querySelector('.tsfr');
          if(tsf&&j.typescale)tsf.src=j.typescale+
            (document.documentElement.dataset.theme==='dark'
             ?'?theme=dark':'');
          var tsi=document.getElementById('ts-iframe');
          if(tsi&&j.preview)tsSetDoc(j.preview);
          var vn=document.querySelector('.vname');
          if(vn)vn.textContent=VSRC||'computed vibe';
          var gm={};(j.genes||[]).forEach(function(g){
            var p=g.split(':');gm[p[0]]=p.slice(1).join(':')});
          el.querySelectorAll('.vax input').forEach(function(r){
            var a=o.axes.find(function(x){
              return x.axis===r.dataset.ax});
            var al=gm[a.axis],
                ix=al?a.alleles.indexOf(al):-1;
            if(ix>=0)r.value=ix;
            r.parentElement.querySelector('.vaxa').textContent=
              al||'baseline'});
          el.querySelector('.vchips').innerHTML=
            Object.keys(VGENES).map(function(k){
            return '<span class="chip on" data-ax="'+k+'">'+
                   esc(k)+':'+esc(VGENES[k])+' ×</span>'}).join('');
          el.querySelectorAll('.vchips .chip.on').forEach(function(c){
            c.onclick=function(){delete VGENES[c.dataset.ax];
              vibePane(el,o)}})}})}

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
         '<button class="sprev" title="preview every option in a grid">▦ '+
         r.alts.length+'</button>'+
         '<button class="spick" title="sign this row\'s choice">✓</button>'+
         '<button class="xp" title="expand" data-x="'+
         esc(frame('/built/'+encodeURI(DATA.pipeline+'/site/dist/'+alt.preview)))+
         '">⤢</button>'+
         '<button class="fxbtn'+((DATA.picked_elements['fx:sec:'+r.sec]&&
          DATA.picked_elements['fx:sec:'+r.sec]!=='none')?' on':'')+
         '" data-fx="fx:sec:'+r.sec+
         '" title="decorate this section">&#9670;</button>'+
         '<span class="sstat"></span></div>'+
         '<iframe data-src="'+esc(frame('/built/'+encodeURI(DATA.pipeline+'/site/dist/'+alt.preview)))+
         '" src="'+esc(frame('/built/'+encodeURI(DATA.pipeline+'/site/dist/'+alt.preview)))+
         '" loading="lazy"></iframe></div>';
    });
    return h;
  }

  var FXMENU=null;
  function fxBucket(element){
    var e=element.replace(/^fx:/,'').replace(/^sec:/,'');
    if(/mob/.test(e))return 'mobile-chrome';
    if(/nav|header|men/.test(e))return 'headers';
    if(/foot/.test(e))return 'footers';
    if(/text|ktxt|faq|type/.test(e))return 'text';
    if(/image|img|gallery|icon|media/.test(e))return 'images';
    if(/btn|button|cta|control/.test(e))return 'buttons';
    if(/scroll|page|layout/.test(e))return 'page';
    if(/card|folio|proof|stat|compar|seq|cover|grid|modal|pricing|empty|commerce|auth|band|tiles/.test(e))return 'cards';
    return 'any'}
  function fxToggle(b){
    if(FXMENU){FXMENU.remove();FXMENU=null}
    var el=b.dataset.fx,bucket=fxBucket(el),
        fxmap=DATA.fxmap||{},
        opts=((fxmap[bucket]||[]).concat(fxmap.any||[])),
        cur=DATA.picked_elements[el],seen={};
    var menu=document.createElement('div');
    menu.className='fxmenu';
    menu.innerHTML='<button class="fxopt'+(cur==='none'?' on':'')+
      '" data-v="none">none</button>'+
      opts.filter(function(v){if(seen[v])return 0;seen[v]=1;return 1})
        .map(function(v){
        return '<button class="fxopt'+(v===cur?' on':'')+
          '" data-v="'+esc(v)+'">'+esc(v)+'</button>'}).join('');
    if(!opts.length)
      menu.innerHTML+='<span class="fxopt">no effects banked '+
        'for '+esc(bucket)+'</span>';
    b.parentElement.style.position='relative';
    b.parentElement.appendChild(menu);FXMENU=menu;
    menu.querySelectorAll('.fxopt[data-v]').forEach(function(o){
      o.onclick=function(ev){ev.stopPropagation();
        api('/element-pick',{pipeline:PIPELINE,element:el,
          variant:o.dataset.v}).then(function(j){
          if(j.ok){
            if(o.dataset.v==='none')delete DATA.picked_elements[el];
            else DATA.picked_elements[el]=o.dataset.v;
            board()}
          else toast(j.message||'refused')});
        menu.remove();FXMENU=null}});
    setTimeout(function(){
      document.addEventListener('click',function h(e){
        if(menu&&!menu.contains(e.target)){menu.remove();
          if(FXMENU===menu)FXMENU=null;
          document.removeEventListener('click',h)}})},0)}


  // modal grid of every option's mini preview for one scrub row —
  // click signs through the same /element-pick path the ✓ uses
  function scrubModal(rowEl,r){
    var ov=document.createElement('div');ov.className='sgov';
    var cells=r.alts.map(function(a,j){
      var src=frame('/built/'+encodeURI(DATA.pipeline+'/site/dist/'+
        a.preview));
      return '<button class="sgcell" data-j="'+j+'">'+
        '<span class="sgcb"><iframe data-src="'+esc(src)+'" src="'+
        esc(src)+'" loading="lazy"></iframe></span>'+
        '<span class="sgnm">'+esc(a.id)+'</span></button>'}).join('');
    ov.innerHTML='<div class="sgbox" role="dialog" aria-modal="true" '+
      'aria-label="preview options"><div class="sgh"><span class="sec">'+
      esc(r.sec)+'</span><span class="sgt">'+r.alts.length+
      ' options — click to pick</span>'+
      '<button class="sgx" aria-label="close">✕</button></div>'+
      '<div class="sggrid">'+cells+'</div></div>';
    document.body.appendChild(ov);
    document.body.style.overflow='hidden';
    var prevFocus=document.activeElement;
    ov.querySelectorAll('.sgcb iframe').forEach(function(f){
      f.addEventListener('load',function(){try{
        var cb2=f.closest('.sgcell').querySelector('.sgcb'),
            s=Math.min(1,cb2.clientWidth/1280)||1,
            hh=f.contentDocument.body.scrollHeight;
        f.style.width='1280px';f.style.transform='scale('+s+')';
        f.style.transformOrigin='0 0';
        if(hh>0){f.style.height=hh+'px';
          cb2.style.height=Math.min(hh*s,320)+'px'}
      }catch(e){}})});
    var cellsEl=ov.querySelectorAll('.sgcell');
    function close(){ov.remove();document.body.style.overflow='';
      document.removeEventListener('keydown',k,true);
      if(prevFocus&&prevFocus.focus)prevFocus.focus()}
    ov.querySelector('.sgx').onclick=close;
    ov.onclick=function(e){if(e.target===ov)close()};
    cellsEl.forEach(function(c){c.onclick=function(){
      var j=+c.dataset.j;r.idx=j;srowSwap(rowEl,0);
      var stat=rowEl.querySelector('.sstat');
      api('/element-pick',{pipeline:PIPELINE,element:'sec:'+r.sec,
        variant:r.alts[j].id}).then(function(jj){
        stat.className='sstat '+(jj.ok?'ok':'bad');
        stat.textContent=jj.ok?'signed ✓':(jj.message||'refused');
        if(jj.ok)toast(jj.message)});
      close()}});
    function k(e){
      if(e.key==='Escape'){close();e.preventDefault();return}
      var arr=Array.prototype.slice.call(cellsEl),
          at=arr.indexOf(document.activeElement);
      if(e.key==='ArrowRight'||e.key==='ArrowLeft'){
        var n=at<0?0:(at+(e.key==='ArrowRight'?1:-1)+arr.length)%arr.length;
        arr[n].focus();e.preventDefault()}
      else if(e.key==='ArrowDown'||e.key==='ArrowUp'){
        var cw=arr[0]?arr[0].offsetWidth:240,
            cols=Math.max(1,Math.floor(
              ov.querySelector('.sggrid').clientWidth/Math.max(1,cw))),
            n2=at<0?0:Math.min(arr.length-1,Math.max(0,
              at+(e.key==='ArrowDown'?cols:-cols)));
        arr[n2].focus();e.preventDefault()}
      else if(e.key==='Tab'){
        var foci=arr.concat([ov.querySelector('.sgx')]),
            ai=foci.indexOf(document.activeElement),
            ni=ai<0?0:(ai+(e.shiftKey?-1:1)+foci.length)%foci.length;
        foci[ni].focus();e.preventDefault()}}
    document.addEventListener('keydown',k,true);
    var f0=cellsEl[0];if(f0)f0.focus()}

  function srowSwap(rowEl,d){
    var i=+rowEl.dataset.i,r=DATA.boards.page.scrub[i];
    r.idx=(r.idx+d+r.alts.length)%r.alts.length;
    var alt=r.alts[r.idx];
    var u='/built/'+encodeURI(DATA.pipeline+'/site/dist/'+alt.preview);
    var f=rowEl.querySelector('iframe');
    f.dataset.src=frame(u);
    f.src=frame(u)+'?theme='+document.documentElement.dataset.theme;
    var xp=rowEl.querySelector('.xp');
    if(xp)xp.dataset.x=frame(u);
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
    h+='<div class="compwrap"><table class="comptab"><tr><th>section</th>';
    opts.forEach(function(o){h+='<th>'+esc(o.id)+' · '+esc(o.label||'')+'</th>'});
    h+='<th>allowed</th></tr>';
    secs.forEach(function(s){
      h+='<tr><td class="sec">'+esc(s)+'</td>';
      opts.forEach(function(o){
        var v=(o.compositions||{})[s];
        h+='<td>'+(v?'<span class="o'+(cb.pick===o.id?' pickd':'')+'">'+esc(v)+'</span>':'—')+'</td>'});
      h+='<td>'+((cb.allowed[s]||[]).map(function(a){
        return '<span class="o">'+esc(a)+'</span>'}).join(''))+'</td></tr>'});
    h+='</table></div>';
    // narrow viewports: the same matrix as stacked cards — the wide
    // table is hidden at ≤560px so nothing overflows
    h+='<div class="compmob">';
    secs.forEach(function(s){
      h+='<div class="cmp"><div class="csec">'+esc(s)+'</div>';
      opts.forEach(function(o){
        var v=(o.compositions||{})[s];
        if(v)h+='<div class="crow2"><span class="olab">'+
          esc(o.label||o.id)+'</span><span class="o'+
          (cb.pick===o.id?' pickd':'')+'">'+esc(v)+'</span></div>'});
      h+='<div class="crow2"><span class="olab">allowed</span><span>'+
        ((cb.allowed[s]||[]).map(function(a){
          return '<span class="o">'+esc(a)+'</span>'}).join(''))+
        '</span></div></div>'});
    return h+'</div>';
  }

  // saved design systems — persist + reload the combination
  var SSQ='',SSF={};
  function savedView(){
    var ss=DATA.saved_systems||[];
    var vibes=ss.map(function(s){return s.vibe})
      .filter(function(v,i,a){return v&&a.indexOf(v)===i});
    var modes=ss.map(function(s){return s.default_mode})
      .filter(function(v,i,a){return v&&a.indexOf(v)===i});
    var shown=ss.filter(function(s){
      if(Object.keys(SSF).length&&
         !Object.keys(SSF).every(function(t){
           return s.vibe===t||s.default_mode===t}))return false;
      if(SSQ){
        var hay=(s.slug+' '+(s.name||'')+' '+(s.vibe||'')+' '+
                 ((s.genes||[]).join(' '))).toLowerCase();
        if(hay.indexOf(SSQ)<0)return false}
      return true});
    var h='<div class="desc">Saved design systems — search by '+
      'name, filter by vibe/mode. Loading restores its signed '+
      'registry; delete removes the bundle on disk. Current '+
      'combination — vibe <b>'+esc(BAKED||'baseline')+
      '</b> + every signed pick — saves as a named file.</div>'+
      '<div class="saves"><input id="sysName" placeholder="system name">'+
      '<button class="pick" id="sysSave">Save system</button>'+
      '<input class="ssq" id="ssq" placeholder="search '+ss.length+
      ' systems…" value="'+esc(SSQ)+'"></div>';
    if(vibes.length||modes.length){
      h+='<div class="filters">';
      h+='<span class="chip'+(Object.keys(SSF).length?'':' on')+
        '" data-sf="">clear all</span>';
      vibes.concat(modes).forEach(function(t){
        h+='<span class="chip'+(SSF[t]?' on':'')+'" data-sf="'+esc(t)+
           '">'+esc(t)+'</span>'});
      h+='</div>'}
    h+='<div class="sscount">'+shown.length+' / '+ss.length+
      ' systems</div>';
    shown.forEach(function(s){
      h+='<div class="ssrow" data-slug="'+esc(s.slug)+'">'+
         '<span class="ssnm" title="'+esc(s.slug)+'">'+
         esc(s.name||s.slug)+'</span>'+
         '<span class="ssm">'+esc(s.vibe||'—')+'</span>'+
         '<span class="ssm">'+esc(s.default_mode||'—')+'</span>'+
         '<span class="ssm">'+((s.genes||[]).length||(s.picks||[]).length)+
         ' genes/picks</span>'+
         '<span class="ssm">'+esc((s.created||'').slice(0,10))+
         '</span>'+
         '<button class="pick" data-load="'+esc(s.slug)+'">Load'+
         '</button>'+
         '<button class="ssdel" data-del="'+esc(s.slug)+
         '" title="delete from disk">✕</button></div>'});
    if(!ss.length)h+='<div class="empty">no saved systems yet — '+
      'bake or save one</div>';
    else if(!shown.length)
      h+='<div class="empty">nothing matches the filter</div>';
    return h;
  }
  function wireSaved(){
    var q=document.getElementById('ssq');
    if(q)q.oninput=function(){SSQ=q.value.toLowerCase();
      var el=document.getElementById('pane')||
        document.getElementById('board');
      var keep=q.selectionStart;
      el.innerHTML='<h1>Saved systems</h1>'+savedView();wireSaved();
      var q2=document.getElementById('ssq');
      if(q2){q2.focus();q2.setSelectionRange(keep,keep)}};
    document.querySelectorAll('[data-sf]').forEach(function(c){
      c.onclick=function(){var t=c.dataset.sf;
        if(!t)SSF={};
        else if(SSF[t])delete SSF[t];
        else{SSF={};SSF[t]=1}
        var el=document.getElementById('pane')||
          document.getElementById('board');
        el.innerHTML='<h1>Saved systems</h1>'+savedView();wireSaved()}});
    var save=document.getElementById('sysSave');
    if(save)save.onclick=function(){
      var nm=document.getElementById('sysName').value;
      if(!nm.trim()){toast('name the system');return}
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
    document.querySelectorAll('[data-del]').forEach(function(b){
      b.onclick=function(){
        var slug=b.dataset.del;
        if(!confirm('delete system “'+slug+'” from disk?'))return;
        api('/delete-system',{pipeline:PIPELINE,slug:slug})
          .then(function(j){
            toast(j.message||(j.ok?'deleted':'refused'));
            if(j.ok){DATA.saved_systems=(DATA.saved_systems||[])
              .filter(function(x){return x.slug!==slug});
              board()}})}});
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
        if(j&&j.error){el.querySelector('#ingOut').innerHTML=
          '<div class="empty">'+esc(j.error)+'</div>';
          toast(j.error);return}
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
        .then(function(r){
          toast(r.message||'saved');
          var slug=(r.donor&&r.donor.dna_slug)||r.dna_slug;
          if(slug){
            // 'wear it' — bake the donor's staged DNA into every
            // preview frame (still staged; nothing touches a BRIEF)
            BAKED=slug;DATA.picked_elements.vibe=BAKED;
            toast('donor DNA staged — previews now wear it')}})};
  }

  function remixPane(el){
    var SRC=DATA.remix_sources||[{id:'design',label:'this design'}];
    var GRP=DATA.remix_groups||{};
    var page=null;
    [DATA.boards,DATA.galleries].forEach(function(B){
      Object.keys(B||{}).forEach(function(k){
        (B[k].cards||[]).forEach(function(c){
          if(!page&&c.preview)page=c.preview})})});
    var slots=[{id:'design',sh:60},
               {id:(SRC[1]||{}).id||null,sh:40},
               {id:null,sh:0}];
    var over={};   // group -> 'mix' | slot index
    var t=null;
    var FAV=new Set((function(){try{
      return JSON.parse(localStorage.getItem('wf-rmfav')||'[]')}
      catch(e){return[]}})());
    function favSave(){try{localStorage.setItem('wf-rmfav',
      JSON.stringify([...FAV]))}catch(e){}}
    function srcOpts(sel,q){
      // favourites float to the top of every source picker
      var favs=SRC.filter(function(o){return FAV.has(o.id)}),
          rest=SRC.filter(function(o){return !FAV.has(o.id)});
      return favs.concat(rest).map(function(o){
        var txt=(FAV.has(o.id)?'★ ':'')+o.label;
        if(q&&(o.label+' '+(o.vibe||'')+' '+o.id).toLowerCase()
           .indexOf(q)<0)return '';
        return '<option value="'+esc(o.id)+'"'+
          (sel===o.id?' selected':'')+'>'+esc(txt)+'</option>'}).join('')}

    function spec(){
      // a slot referenced by a group override stays a source even at
      // 0% — it contributes that token group; remap override indices
      // through compaction so letters match backend vecs[] order
      var used={};
      Object.keys(over).forEach(function(k){
        if(over[k]!=='mix')used[over[k]]=1});
      var ss=[],map={};
      slots.forEach(function(s0,i){
        if(s0.id&&(s0.sh>0||used[i])){
          map[i]=ss.length;ss.push({id:s0.id,share:s0.sh/100})}});
      var g={};
      Object.keys(over).forEach(function(k){
        if(over[k]!=='mix'&&map[over[k]]!=null)g[k]=map[over[k]]});
      return {sources:ss,groups:g}}

    function go(){
      clearTimeout(t);
      t=setTimeout(function(){
        var sp=spec(),st=el.querySelector('#rmStatus');
        if(!slots.some(function(s){return s.id})){
          if(st)st.textContent='pick a source first';
          return}
        if(!sp.sources.some(function(s){return s.share>0})){
          if(st)st.textContent='set at least one share above 0%';
          return}
        api('/remix',{pipeline:PIPELINE,spec:sp}).then(function(j){
          if(j.error){toast(j.error);return}
          var f=document.getElementById('rmFrame');
          if(f&&page){f.onload=function(){
              setTimeout(fitIframes,80)};
            f.src=page.replace('/built/',
            '/frame/'+j.slug+'/');
            var rx=document.getElementById('rmXp');
            if(rx)rx.dataset.x=f.src}})},140)}

    var h='<h1>Remix — DNA mixer</h1>'+
      '<div class="desc">Blend up to three DNA sources — this '+
      'design, vibe families, and staged ingest donors. Numeric '+
      'knobs lerp by share; categorical tokens follow the dominant '+
      'share; group rows pin a token group to one source. The '+
      'preview re-emits the current page wearing the mixed DNA.</div>'+
      '<div class="rmgrid"><div class="rmslots">';
    ['A','B','C'].forEach(function(L,i){
      h+='<div class="rmslot"><i>'+L+'</i>'+
         '<div class="rmsrc"><input class="rmq" data-i="'+i+'"'+
         ' placeholder="search '+SRC.length+' sources…">'+
         '<select data-i="'+i+'">'+
         '<option value="">— none —</option>'+
         srcOpts(slots[i].id,'')+
         '</select></div>'+
         '<button class="rmfav" data-i="'+i+'" title="favourite '+
         'this source">☆</button>'+
         '<input type="range" min="0" max="100" value="'+
         slots[i].sh+'" data-i="'+i+'">'+
         '<span class="rmpct" data-i="'+i+'">'+slots[i].sh+'%</span>'+
         '</div>'});
    h+='</div><div class="rmgroups">';
    Object.keys(GRP).forEach(function(g){
      h+='<div class="rmrow" data-g="'+esc(g)+'"><span>'+esc(GRP[g])+
         '</span><label><input type="radio" name="rg-'+esc(g)+
         '" value="mix" checked>mix</label>';
      ['A','B','C'].forEach(function(L,i){
        h+='<label><input type="radio" name="rg-'+esc(g)+
           '" value="'+i+'"'+(i>0&&!slots[i].id?' disabled':'')+
           '>'+L+'</label>'});
      h+='</div>'});
    h+='</div><div class="rmsave"><input id="rmName" placeholder='+
       '"remix-name"><button id="rmSave" class="abtn">'+
       'Sign remix system</button><span id="rmStatus"></span></div>'+
       '<div class="rmprev"><div class="rmph"><span>remix '+
       'preview</span><button class="xp" id="rmXp" title="expand" '+
       'data-x="">⤢</button></div>'+
       '<iframe id="rmFrame"></iframe></div></div>';
    el.innerHTML=h;

    function favSync(i){
      var b=el.querySelector('.rmfav[data-i="'+i+'"]');
      if(b)b.textContent=FAV.has(slots[i].id)?'★':'☆'}
    [0,1,2].forEach(favSync);
    el.querySelectorAll('.rmq').forEach(function(q){
      q.oninput=function(){
        var i=+q.dataset.i,
            sel=el.querySelector('.rmslot select[data-i="'+i+'"]');
        sel.innerHTML='<option value="">— none —</option>'+
          srcOpts(slots[i].id,q.value.toLowerCase());
        sel.value=slots[i].id||''}});
    el.querySelectorAll('.rmfav').forEach(function(b){
      b.onclick=function(){
        var i=+b.dataset.i,id=slots[i].id;
        if(!id){toast('pick a source first');return}
        if(FAV.has(id))FAV.delete(id);else FAV.add(id);
        favSave();
        // re-render every picker so favourites float up everywhere
        el.querySelectorAll('.rmslot select').forEach(function(s2){
          var j=+s2.dataset.i;
          s2.innerHTML='<option value="">— none —</option>'+
            srcOpts(slots[j].id,'');
          s2.value=slots[j].id||''});
        [0,1,2].forEach(favSync)}});
    el.querySelectorAll('.rmslot select').forEach(function(sel){
      sel.onchange=function(){
        var i=+sel.dataset.i;slots[i].id=sel.value||null;
        favSync(i);
        // enable/disable the matching group radio labels
        el.querySelectorAll('.rmrow').forEach(function(r){
          var inp=r.querySelectorAll('input[type=radio]')[i+1];
          if(inp){inp.disabled=i>0&&!slots[i].id;
            if(inp.disabled&&inp.checked){
              r.querySelector('input[value=mix]').checked=true;
              delete over[r.dataset.g]}}});
        go()}});
    el.querySelectorAll('.rmslot input[type=range]').forEach(
      function(rg){rg.oninput=function(){
        var i=+rg.dataset.i;slots[i].sh=+rg.value;
        el.querySelector('.rmpct[data-i="'+i+'"]').textContent=
          rg.value+'%';go()}});
    el.querySelectorAll('.rmrow input[type=radio]').forEach(
      function(rd){rd.onchange=function(){
        var g=rd.name.slice(3);
        if(rd.value==='mix')delete over[g];else over[g]=+rd.value;
        go()}});
    el.querySelector('#rmSave').onclick=function(){
      var nm=el.querySelector('#rmName').value.trim(),
          sp0=spec();
      if(!nm){toast('name the remix');return}
      if(!sp0.sources.some(function(s){return s.share>0})){
        toast('set at least one share above 0%');return}
      api('/remix-save',{pipeline:PIPELINE,name:nm,spec:sp0})
        .then(function(r){
          var st=el.querySelector('#rmStatus');
          st.textContent=r.message||'';
          toast(r.message||'saved')})};
    go();
    wireXp(el);
  }

  // expand — full-screen preview overlay (spec §3): device-width
  // frames (unscaled, true width), theme toggle, ‹ › card nav,
  // primary action, open-in-new-tab, Esc/X/scrim close + focus return
  function themed(u,m){
    var b=u.replace(/([?&])theme=[^&]*&?/,'$1')
           .replace(/[?&]$/,'');
    return b+(b.indexOf('?')>=0?'&':'?')+'theme='+m}
  // context for expand() from the ⤢ that opened it — title, the
  // card's own Pick/Bake/Apply as the primary action, and its
  // position in the board for ‹ › navigation
  // open-in-new-tab targets the real /built/ URL, not the
  // family-bound /frame/ wrapper
  function builtUrl(u){
    return u.replace(/^\/frame\/[^/?]+/,'/built')
      .replace(/([^:])\/{2,}/g,'$1/')}
  function xpOpts(b){
    var cd=b.closest('.card,.vprev,.srow');
    var pk=cd&&cd.querySelector('.pick,.spick,#vBake');
    var nm=cd&&cd.querySelector('.nm,.vname,.sname');
    return {xp:b,
      title:nm?nm.textContent:'preview',
      primary:pk?pk.textContent.trim():null,
      onprimary:pk?function(){pk.click()}:null}}
  function wireXp(scope){
    scope.querySelectorAll('.xp').forEach(function(b){
      b.onclick=function(e){e.stopPropagation();
        if(b.dataset.x)expand(b.dataset.x,xpOpts(b));
        else toast('nothing to preview yet')}})}
  function expand(u,opts){
    opts=opts||{};
    u=u.replace(/([^:])\/{2,}/g,'$1/');
    var prevFocus=document.activeElement;
    var xps=[...document.querySelectorAll('.xp')].filter(
      function(x){var cd=x.closest('.card,.srow');
        return !cd||cd.style.display!=='none'});
    var cur=opts.xp?xps.indexOf(opts.xp):-1;
    var ov=document.createElement('div');ov.id='xpOv';
    var theme=document.documentElement.dataset.theme==='dark'?'dark':'light';
    var w0=innerWidth<=480?390:innerWidth<=900?768:1280;
    ov.innerHTML='<div id="xpBar"><span class="xttl">'+
      esc(opts.title||'preview')+'</span>'+
      '<div class="xdev" role="group" aria-label="preview width">'+
      [[1280,'Desktop 1280','M3 4h18v11H3zM12 15v4M9 19h6'],
       [768,'Tablet 768','M6.5 2.5h11a1 1 0 0 1 1 1v17a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-17a1 1 0 0 1 1-1zM10 18h4'],
       [390,'Mobile 390','M8.5 2h7a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zM11 19h2']].map(function(d){
        return '<button data-w="'+d[0]+'" aria-label="'+d[1]+
               '" title="'+d[1]+'" aria-pressed="'+(d[0]===w0)+'"'+
               (d[0]===w0?' class="on"':'')+
               '><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+d[2]+'"/></svg></button>'}).join('')+'</div>'+
      '<button class="xth" title="toggle preview theme">'+
      (theme==='dark'?'☀':'☾')+'</button>'+
      '<button class="xnav xpP" title="previous">&#8249;</button>'+
      '<button class="xnav xpN" title="next">&#8250;</button>'+
      (opts.primary?'<button class="xpPrim">'+esc(opts.primary)+'</button>':'')+
      '<a class="xopen" href="'+esc(builtUrl(themed(u,theme)))+
      '" target="_blank" rel="noopener" title="open in new tab">&#8599;</a>'+
      '<button id="xpX">&#x2715;</button></div>'+
      '<div class="xstage"><div class="xframe">'+
      '<iframe src="'+esc(themed(u,theme))+'"></iframe></div></div>';
    document.body.appendChild(ov);
    document.body.style.overflow='hidden';
    var fr=ov.querySelector('.xframe'),im=fr.querySelector('iframe');
    function setW(w){
      var pad=Math.max(0,Math.min(14,Math.floor((innerWidth-w-8)/2)));
      ov.querySelector('.xstage').style.padding=pad+'px';
      fr.style.width=w+'px';
      ov.querySelectorAll('.xdev button').forEach(function(b){
        b.classList.toggle('on',+b.dataset.w===w);
        b.setAttribute('aria-pressed',+b.dataset.w===w)})}
    setW(w0);
    im.addEventListener('load',function(){
      // keydown inside a same-origin preview still reaches Esc/arrows
      try{im.contentDocument.addEventListener('keydown',k)}catch(e){}});
    ov.querySelectorAll('.xdev button').forEach(function(b){
      b.onclick=function(){setW(+b.dataset.w)}});
    ov.querySelector('.xth').onclick=function(){
      theme=theme==='dark'?'light':'dark';
      this.textContent=theme==='dark'?'☀':'☾';
      var s=themed(u,theme);
      im.src=s;ov.querySelector('.xopen').href=builtUrl(s)};
    function nav(d){
      if(cur<0||!xps.length)return;
      var hops=xps.length;
      do{cur=(cur+d+xps.length)%xps.length}while(
        !xps[cur].dataset.x&&--hops);
      var o=xpOpts(xps[cur]);
      u=xps[cur].dataset.x;if(!u)return;
      ov.querySelector('.xttl').textContent=o.title;
      var s=themed(u,theme);im.src=s;
      ov.querySelector('.xopen').href=builtUrl(s);
      var pb=ov.querySelector('.xpPrim');
      if(o.primary){
        if(!pb){pb=document.createElement('button');
          pb.className='xpPrim';
          ov.querySelector('.xopen').before(pb)}
        pb.textContent=o.primary;
        pb.onclick=function(){o.onprimary();close()}}
      else if(pb)pb.remove()}
    ov.querySelector('.xpP').onclick=function(){nav(-1)};
    ov.querySelector('.xpN').onclick=function(){nav(1)};
    if(opts.primary){
      ov.querySelector('.xpPrim').onclick=function(){
        if(opts.onprimary)opts.onprimary();close()}}
    function close(){ov.remove();
      document.body.style.overflow='';
      document.removeEventListener('keydown',k);
      if(prevFocus&&prevFocus.focus)prevFocus.focus()}
    function k(e){
      if(e.key==='Escape')close();
      else if(e.key==='ArrowLeft')nav(-1);
      else if(e.key==='ArrowRight')nav(1)}
    document.addEventListener('keydown',k);
    ov.querySelector('#xpX').onclick=close;
    ov.querySelector('.xstage').onclick=function(e){
      if(e.target===this)close()};
    var f0=ov.querySelector('#xpX');if(f0)f0.focus()}

  // viewport fit — desktop (vw=100%) renders iframes at 1280px and
  // scales them into the card; M/T keep the real small widths.
  function fitIframes(){
    var vw=document.documentElement.style.getPropertyValue('--vw')
        ||'100%';
    document.querySelectorAll('.card .cb iframe,.vprev iframe,'+
      '.rmprev iframe,.srow iframe').forEach(function(f){
      // remember each frame's own src once — derived variants come
      // back from it, never from a previously-swapped one
      var orig=f.dataset.orig||(f.dataset.src||f.src.split('?')[0]);
      if(!f.dataset.orig)f.dataset.orig=orig;
      var u=orig;
      // compare query-free — a card variant's ?menu=open is its own
      // src, not a reason to keep reloading it
      var cur=(f.dataset.src||'').split('?')[0];
      if(u.split('?')[0]!==cur){f.dataset.src=u;
        f.src=u+(document.documentElement.dataset.theme==='dark'
          ?(u.indexOf('?')<0?'?':'&')+'theme=dark':'')}
      var cb=f.parentElement,
          fixedBox=!!cb.closest('.vprev')||
            cb.classList.contains('rmprev'),
          srow=!!f.closest('.srow'),
          tsDoc=cb.classList.contains('tsdoc');
      if(vw==='100%'){
        var W=1280,s=Math.min(1,cb.clientWidth/W)||1;
        f.style.maxWidth='none';   // --vw cap would clamp the 1280 render
        f.style.width=W+'px';
        f.style.transform='scale('+s+')';
        f.style.transformOrigin='0 0';
        var crd=f.closest('.card'),
            liveBox=!!cb.closest('.vprev')||
              !!(crd&&crd.classList.contains('live'));
        try{var hh=f.contentDocument.body.scrollHeight;
          if(tsDoc){// specimen docs can report a viewport-tall
            // body — measure the deepest rendered element instead
            var mb=0;
            f.contentDocument.querySelectorAll('body>*').forEach(
              function(n){var b=n.getBoundingClientRect().bottom;
                if(b>mb)mb=b});
            if(mb>4)hh=mb}
          if(hh>0){f.style.height=hh+'px';
            if(srow){
              // the row IS the container — collapse the empty band
              // the downscaled frame leaves behind instead of
              // cropping the row (its header would be cut)
              f.style.marginBottom='-'+Math.max(0,
                Math.round(hh*(1-s)))+'px'
            }else if(liveBox){
              // full-page previews are interactive: the frame keeps
              // a viewport-sized height so the real document scrolls
              // inside the card — the whole emitted page is reachable
              var boxH=fixedBox?cb.clientHeight
                :Math.min(hh*s,Math.min(cb.clientWidth/1.6,560));
              if(!fixedBox){cb.style.height=boxH+'px';
                cb.style.minHeight='0'}
              f.style.height=Math.max(1,Math.round(boxH/s))+'px'
            }else if(!fixedBox){
              // 16:10 preview, capped 560px; short strips keep
              // their content height — type-specimen docs are
              // measured, never letterboxed
              var cap=tsDoc?1600:Math.min(cb.clientWidth/1.6,560);
              cb.style.height=Math.min(hh*s,cap)+'px';
              cb.style.minHeight='0'}}}catch(e){}
      }else{
        f.style.maxWidth='';f.style.width='';f.style.transform='';
        f.style.marginBottom='';
        // live boxes keep a scrollable full-height frame at M/T too
        var lb=!!cb.closest('.vprev')||
          !!f.closest('.card.live');
        f.style.height=lb?'100%':'';
        if(!fixedBox){cb.style.height='';cb.style.minHeight=''}}
    })}

  document.querySelectorAll('#vwCtl button').forEach(function(b){
    b.addEventListener('click',function(){setTimeout(fitIframes,80)})});

  // --- custom type-ladder editor — the spec the server sanitizes;
  // /type-ladder previews it, "Use this" signs it (element 'type',
  // variant derived server-side from the spec hash) ---
  var TS_RATIOS=[[1.067,'minor second'],[1.125,'major second'],
    [1.2,'minor third'],[1.25,'major third'],[1.333,'perfect fourth'],
    [1.414,'augmented fourth'],[1.5,'perfect fifth'],[1.618,'golden']],
  TS_FACE={sans:'ui-sans-serif,system-ui,sans-serif',
    serif:'Georgia,"Times New Roman",serif',
    mono:'ui-monospace,"SF Mono",Menlo,monospace',
    mixed:'Georgia,"Times New Roman",serif'},
  TS_ROWS=[['h1'],['h2'],['h3'],['h4'],['h5'],['h6'],
    ['lead','text-l'],['body','text-m'],['small','text-s']];

  var TS_VPS=[[320,'M'],[768,'T'],[1280,'D']],_tsVp=1280,_tsPx=null,
    _tsVars=null,_tsVpManual=false;

  function tsEditor(){
    // seed from the signed custom ladder when one exists — reopening
    // the board shows the saved params, not the pipeline defaults
    var S=DATA.type_spec||null,f=DATA.fluid||{},
    d=function(k,x){return f[k]!=null?f[k]:x},
    dv=function(sf,ff,x){
      return S&&S[sf]!=null?S[sf]:d(ff,x)},
    selh=function(v){return S&&S.head_face===v?' selected':''},
    selb=function(v){return S&&S.body_face===v?' selected':''},
    rmn=dv('rmin','text_scale_mob',1.2),
    rmx=dv('rmax','text_scale_desk',1.333),
    rp=function(cur){var o='',seen=0;
      TS_RATIOS.forEach(function(p){
        var s=Math.abs(p[0]-(+cur))<0.0005;if(s)seen=1;
        o+='<option value="'+p[0]+'"'+(s?' selected':'')+'>'+
          p[1]+' '+p[0]+'</option>'});
      o+='<option value="custom"'+(seen?'':' selected')+
        '>custom</option>';
      return '<select id="ts-ratio" class="tsnum">'+o+'</select>'},
    pres=(DATA.boards.typescale||{}).presets||[],
    popts='<option value="">presets\u2026</option>';
    pres.forEach(function(p,i){
      popts+='<option value="'+i+'">'+esc(p.name)+'</option>'});
    var wc=+(S&&S.hweight||700),wopts='';
    [400,500,600,700,800,900].forEach(function(w){
      wopts+='<option'+(wc===w?' selected':'')+'>'+w+'</option>'});
    // S.lheight may be absent on picks signed before the control
    // existed — +undefined is NaN, which left no option selected
    // and silently signed the first (1.3)
    var lc=(S&&S.lheight!=null)?+S.lheight:1.55,lopts='';
    [1.3,1.4,1.5,1.55,1.6,1.7,1.8].forEach(function(l){
      lopts+='<option'+(Math.abs(lc-l)<0.001?' selected':'')+
        '>'+l+'</option>'});
    return '<div class="tsed" id="tsed"><div class="tsctl">'+
      '<label>preset<select id="ts-preset">'+popts+'</select>'+
        '</label>'+
      '<label>heading font<select id="ts-hf">'+
        '<option value="">vibe default</option>'+
        '<option'+selh('sans')+'>sans</option>'+
        '<option'+selh('serif')+'>serif</option>'+
        '<option'+selh('mono')+'>mono</option>'+
        '<option'+selh('mixed')+'>mixed</option></select></label>'+
      '<label>body font<select id="ts-bf">'+
        '<option value="">vibe default</option>'+
        '<option'+selb('sans')+'>sans</option>'+
        '<option'+selb('serif')+'>serif</option>'+
        '<option'+selb('mono')+'>mono</option></select></label>'+
      '<label>scale ratio'+rp()+'</label>'+
      '<label>min px<input id="ts-bmin" type="number" '+
        'step="0.5" min="12" max="32" value="'+
        dv('bmin','text_base_mob',16)+'"></label>'+
      '<label>max px<input id="ts-bmax" type="number" '+
        'step="0.5" min="10" max="40" value="'+
        dv('bmax','text_base_desk',18)+'"></label>'+
      '<label>heading weight<select id="ts-hweight">'+wopts+
        '</select></label>'+
      '<label>body line-height<select id="ts-lheight">'+lopts+
        '</select></label>'+
      '<label>steps<input id="ts-steps" type="number" min="2" '+
        'max="6" value="'+(S&&S.steps||6)+'"></label>'+
      '<details class="tsadv"><summary>advanced</summary>'+
        '<div class="tsgrid">'+
        '<label>ratio min<input id="ts-rmin" type="number" '+
          'step="0.01" min="1" max="1.8" value="'+rmn+'"></label>'+
        '<label>ratio max<input id="ts-rmax" type="number" '+
          'step="0.01" min="1" max="1.9" value="'+rmx+'"></label>'+
        '<label>viewport min px<input id="ts-vpmin" type="number" '+
          'step="10" min="240" max="1024" value="'+
          dv('vpmin','vp_min',320)+'"></label>'+
        '<label>viewport max px<input id="ts-vpmax" type="number" '+
          'step="10" min="241" max="1920" value="'+
          dv('vpmax','vp_max',1280)+'"></label>'+
        '</div></details>'+
      '</div>'+
      '<div class="tsprev"><div class="tscol" id="ts-pa">'+
        '<div class="tsvpbar" id="ts-vpbar">'+
        TS_VPS.map(function(v){
          return '<button type="button" class="tsvpb'+
            (v[0]===_tsVp?' on':'')+'" data-v="'+v[0]+'">'+
            v[1]+' '+v[0]+'</button>'}).join('')+
        '<button type="button" class="tsvpb" id="ts-th" '+
        'title="flip the specimen\u2019s theme">\u25d0 theme</button>'+
        '</div>'+
        '<div class="tsframe" id="ts-frame">'+
        '<iframe id="ts-iframe" loading="lazy"></iframe></div>'+
        '<div class="tslab">scale ladder \u2014 px at this width</div>'+
        '<div id="ts-spec" class="tslad"></div></div></div>'+
      '<pre class="tsvars" id="ts-vars"></pre>'+
      '<div class="crow"><button class="pick" id="ts-use">'+
      'Use this</button><button class="tsc" id="ts-copy">'+
      'copy css vars</button><span class="pstat" id="ts-stat">'+
      '</span></div></div>'}

  function tsSpec(){
    var g=function(id){return document.getElementById(id).value},
        num=function(id){var v=g(id).trim();return v===''?NaN:+v};
    return {bmin:num('ts-bmin'),bmax:num('ts-bmax'),
      rmin:num('ts-rmin'),rmax:num('ts-rmax'),
      vpmin:num('ts-vpmin'),vpmax:num('ts-vpmax'),
      steps:num('ts-steps'),hweight:num('ts-hweight'),
      lheight:num('ts-lheight'),
      head_face:g('ts-hf')||null,body_face:g('ts-bf')||null}}

  var _tsT=null;
  function tsValidate(){
    var sp=tsSpec(),msg=null;
    ['bmin','bmax','vpmin','vpmax','steps'].forEach(function(k){
      var el=document.getElementById('ts-'+k);
      if(el)el.style.outline=Number.isFinite(sp[k])
        ?'':'2px solid #b42318'});
    if(!Number.isFinite(sp.bmin)||!Number.isFinite(sp.bmax)||
       !Number.isFinite(sp.vpmin)||!Number.isFinite(sp.vpmax)||
       !Number.isFinite(sp.steps))msg='empty/invalid number field';
    else if(sp.bmin>sp.bmax)msg='base min > base max — swap them';
    else if(sp.rmin>sp.rmax)msg='ratio min > ratio max — swap them';
    else if(sp.vpmin>=sp.vpmax)msg='vp min must be < vp max';
    return msg}

  function tsRenderSpecimen(){
    // one specimen — re-renders on control or viewport change
    var el=document.getElementById('ts-spec');
    if(!el||!_tsPx)return;
    var spec=tsSpec(),hf=spec.head_face||
        (DATA.vibe_genes||{})['display-face']||'sans',
      bf=spec.body_face||'sans',vp=String(_tsVp),h2='';
    TS_ROWS.forEach(function(r){
      var k=r[1]||r[0],p=(_tsPx[k]||{})[vp];
      if(p==null)return;
      // steps caps the number of heading rungs — extra rungs
      // collapse onto the smallest kept one (same as the sign path)
      if(r[0][0]==='h'&&(+r[0].slice(1))>(+spec.steps))return;
      var fh=r[0][0]==='h'?'h':'b';
      h2+='<div class="tsr"><span class="tsrn">'+r[0]+
          '</span><span class="tsrx" data-f="'+fh+
          '" style="font-size:'+p+'px">'+
          (r[0]==='small'?'Aa small':'Aa '+r[0])+
          '</span><span class="tsrp">'+p+'px</span></div>'});
    el.innerHTML=h2;
    // faces/weights go through style objects — font stacks contain
    // quotes that break inline style attributes
    el.querySelectorAll('.tsrx').forEach(function(x){
      x.style.fontFamily=
        x.dataset.f==='h'?TS_FACE[hf]:TS_FACE[bf];
      if(x.dataset.f==='h')x.style.fontWeight=spec.hweight||700;
      else x.style.lineHeight=spec.lheight||1.55})}

  var _tsTh='';
  function tsSetDoc(u){
    var f=document.getElementById('ts-iframe');
    if(!f||!u)return;
    f.src=u+(u.indexOf('?')>=0?'&':'?')+'theme='+
      (_tsTh||document.documentElement.dataset.theme||'light')}

  function tsPushVars(){
    // live ladder overrides into the in-situ doc — the doc's own
    // hook clears keys it set last time, so 'vibe default' faces
    // (absent from _tsVars) restore the resolved vibe
    var f=document.getElementById('ts-iframe');
    if(f&&f.contentWindow&&_tsVars)
      f.contentWindow.postMessage({wfVars:_tsVars},'*')}

  function tsFitFrame(){
    // M/T/D = TRUE iframe width so clamp() and the doc's own media
    // queries run at that breakpoint; scaled down to fit the panel
    var fr=document.getElementById('ts-frame'),
        f=document.getElementById('ts-iframe');
    if(!fr||!f)return;
    var w=fr.clientWidth||1,s=Math.min(1,w/_tsVp);
    f.style.width=_tsVp+'px';f.style.height=(600/s)+'px';
    f.style.transform='scale('+s+')';fr.style.height='600px'}

  function tsRefresh(){
    var vm=tsValidate(),st=document.getElementById('ts-stat');
    if(vm){if(st){st.className='pstat bad';st.textContent=vm}return}
    api('/type-ladder',{pipeline:PIPELINE,spec:tsSpec()})
      .then(function(j){
        if(!j||!j.ok){var st=document.getElementById('ts-stat');
          if(st)st.textContent=(j&&j.error)||'preview failed';return}
        _tsPx=j.px||{};_tsVars=j.vars||{};
        tsRenderSpecimen();tsPushVars();
        var v=document.getElementById('ts-vars');
        if(v)v.textContent=Object.keys(_tsVars).map(function(k){
          return k+': '+_tsVars[k]+';'}).join('\n')})}

  function tsSet(id,v){
    var e=document.getElementById(id);
    if(e&&v!=null)e.value=v}

  function wireTsEd(el){
    var ed=el.querySelector('#tsed');
    if(!ed)return;
    _tsVp=window.innerWidth<=480?320:1280;_tsVpManual=false;
    ed.querySelectorAll('#ts-vpbar .tsvpb').forEach(function(b){
      b.classList.toggle('on',+b.dataset.v===_tsVp)});
    ed.querySelectorAll('input,select').forEach(function(i){
      i.addEventListener('input',function(){
        if(i.id==='ts-ratio'&&i.value&&i.value!=='custom'){
          tsSet('ts-rmin',i.value);tsSet('ts-rmax',i.value)}
        if((i.id==='ts-rmin'||i.id==='ts-rmax')&&
           document.getElementById('ts-ratio'))
          document.getElementById('ts-ratio').value='custom';
        if(i.id==='ts-preset'){
          var p=((DATA.boards.typescale||{}).presets||[])[+i.value];
          if(p){
            var pf=p.fluid||{};
            tsSet('ts-rmin',pf.heading_scale_mob);
            tsSet('ts-rmax',pf.heading_scale_desk);
            document.getElementById('ts-ratio').value='custom';
            var f=(p.genes||{})['display-face'];
            if(f)tsSet('ts-hf',f)}}
        clearTimeout(_tsT);_tsT=setTimeout(tsRefresh,220)})});
    ed.querySelectorAll('#ts-vpbar .tsvpb:not(#ts-th)').forEach(
      function(b){b.onclick=function(){
        _tsVp=+b.dataset.v;_tsVpManual=true;
        ed.querySelectorAll('#ts-vpbar .tsvpb').forEach(function(x){
          x.classList.toggle('on',x===b)});
        tsRenderSpecimen();tsFitFrame()}});
    var th=document.getElementById('ts-th');
    if(th)th.onclick=function(){
      _tsTh=((_tsTh||document.documentElement.dataset.theme||'light')
             ==='dark')?'light':'dark';
      var f=document.getElementById('ts-iframe');
      if(f&&f.contentWindow)
        f.contentWindow.postMessage({wfTheme:_tsTh},'*')};
    var tif=document.getElementById('ts-iframe');
    if(tif){
      tif.addEventListener('load',function(){
        setTimeout(tsPushVars,80);setTimeout(tsFitFrame,80)});
      tsFitFrame();
      if(!wireTsEd._rz){
        wireTsEd._rz=1;
        window.addEventListener('resize',function(){
          var n=window.innerWidth<=480?320:1280;
          if(!_tsVpManual&&n!==_tsVp){_tsVp=n;
            ed.querySelectorAll('#ts-vpbar .tsvpb').forEach(function(x){
              x.classList.toggle('on',+x.dataset.v===_tsVp)});
            tsRenderSpecimen()}
          tsFitFrame()})}
      // the specimen is the doc for the SIGNED vibe — VRES may be a
      // pending (unsaved) resolve from the vibe board, so use it as
      // a fast first paint but always re-resolve the signed genes
      if(VRES&&VRES.preview)tsSetDoc(VRES.preview);
      api('/vibe-resolve',{pipeline:PIPELINE,
        genes:DATA.vibe_genes||{}}).then(function(j){
        if(j&&j.preview)tsSetDoc(j.preview)})}
    var cp=document.getElementById('ts-copy');
    if(cp)cp.onclick=function(){
      var v=document.getElementById('ts-vars');
      if(v&&v.textContent){
        if(navigator.clipboard&&navigator.clipboard.writeText)
          navigator.clipboard.writeText(v.textContent)
            .then(function(){toast('css vars copied')});
        else toast('select + copy the vars manually')}};
    var us=document.getElementById('ts-use');
    if(us)us.onclick=function(){
      var st=document.getElementById('ts-stat');
      var vm=tsValidate();
      if(vm){if(st){st.className='pstat bad';st.textContent=vm}return}
      us.disabled=true;
      api('/element-pick',{pipeline:PIPELINE,element:'type',
        variant:'custom',spec:tsSpec()}).then(function(j){
        us.disabled=false;
        if(st){st.className='pstat '+(j.ok?'ok':'bad');
          st.textContent=j.message||(j.ok?'signed':'refused')}
        if(j.ok){toast(j.message);
          DATA.picked_elements=DATA.picked_elements||{};
          // the server derives the variant — the supersession
          // message carries old → new, so take the LAST match
          var mv=(j.message||'').match(/\bcustom:[0-9a-f]+\b/g);
          DATA.picked_elements.type=mv?mv[mv.length-1]:'custom';
          DATA.type_spec=tsSpec();
          BAKED=DATA.picked_elements.type;board()}})};
    tsRefresh()}

  function board(){
    var el=document.getElementById('board');
    el.dataset.pane=CUR;
    el.innerHTML='<div id="stepper">'+stepperHtml()+'</div>'+
      '<div id="pane"></div>';
    var el0=document.getElementById('selbar');
    if(el0)el0.innerHTML=selbarHtml();
    el=el.querySelector('#pane');
    var nx=NEXTSTEP[CUR];
    if(nx&&_boardExists(nx[0])){
      var nb=document.createElement('button');
      nb.className='nextstep';nb.textContent='Next: '+nx[1]+' →';
      nb.onclick=function(){gotoBoard(nx[0])};
      el.after(nb)}
    wireFlow();
    if(CUR==='ingest'){ingestPane(el);return}
    if(CUR==='remix'){remixPane(el);return}
    if(CUR==='saved'){
      el.innerHTML='<h1>Saved systems</h1>'+savedView();
      wireSaved();return}
    var o=DATA.boards[CUR]||DATA.galleries[CUR];
    if(!o){el.innerHTML='<div class="empty">pick a board</div>';return}
    if(o.atlas){vibePane(el,o);return}
    var h='<h1>'+esc(o.title)+'</h1><div class="desc">'+esc(o.desc||'')+'</div>';
    if(o.typescale){
      el.innerHTML=h+tsEditor();
      wireTsEd(el);
      return}
    if(o.scrub){
      el.innerHTML=h+scrubView(o);
      el.querySelectorAll('.srow').forEach(function(rowEl){
        rowEl.querySelector('.sprev').onclick=function(){
          ROW=+rowEl.dataset.i;
          scrubModal(rowEl,DATA.boards.page.scrub[+rowEl.dataset.i])};
        var f=rowEl.querySelector('iframe');
        f.onload=function(){try{
          f.style.height=f.contentDocument.body.scrollHeight+'px'
        }catch(e){f.style.height='480px'}};
        rowEl.querySelector('.fxbtn').onclick=function(e){
          e.stopPropagation();fxToggle(e.target)};
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
      wireXp(el);
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
      el.querySelectorAll('.fxbtn').forEach(function(b){
        b.onclick=function(e){e.stopPropagation();fxToggle(b)}});
      el.querySelectorAll('.fxsel').forEach(function(s){
        s.onchange=function(){fxPick(s.dataset.fx,s.value)}});
      wireXp(el);
      wireFrames(el);
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
        o.emitted_n+' · '+bl+' more in the bank</div>';}
    h+='<div class="filters">'+filters(tags)+'</div>'+
       '<div class="grid'+(CUR==='fx'?' fxgrid':'')+'">';
    var lastGrp=null,shown2=0;
    var gridCards=(o.cards||[]).slice();
    // emitted options first — bank-only (no preview) rows sink,
    // inside each group too (group order = first appearance)
    var grpIx={};
    gridCards.forEach(function(c){if(c.grp&&!(c.grp in grpIx))
      grpIx[c.grp]=Object.keys(grpIx).length});
    gridCards.sort(function(a,b){
      // ungrouped build previews lead; named bank groups keep
      // first-appearance order; bank-only ungrouped rows sink last
      var ga=(a.grp in grpIx)?grpIx[a.grp]+1:(a.preview?0:1e9),
          gb=(b.grp in grpIx)?grpIx[b.grp]+1:(b.preview?0:1e9);
      if(ga!==gb)return ga-gb;
      return (b.preview?1:0)-(a.preview?1:0)});
    gridCards.forEach(function(c,i){
      var show=Object.keys(FILT).every(function(t){
        return (c.tags||[]).indexOf(t)>=0});
      if(c.grp&&c.grp!==lastGrp&&show){
        lastGrp=c.grp;
        h+='<div class="glabel">'+esc(c.grp)+'</div>';}
      if(show)shown2++;
      h+=show?card(c,i):''});
    h+='</div>';
    if(!(o.cards||[]).length)h+='<div class="empty">nothing emitted here yet</div>';
    else if(!shown2)h+='<div class="empty">no matches — clear the '+('filters or search to see all options')+'</div>';
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
    el.querySelectorAll('.fxsel').forEach(function(s){
      s.onchange=function(){fxPick(s.dataset.fx,s.value)}});
    wireXp(el);
    wireFrames(el);
    setTimeout(fitIframes,150);
    applyTheme(document.documentElement.dataset.theme);
  }

  // a loaded frame is done — mark it and compact small centred
  // demos to their real content box
  function _frameDone(f,cb){
    cb.classList.add('done');
    try{var cd=f.contentDocument,
        H=cd.documentElement.clientHeight||f.clientHeight||0,
        maxH=0,maxB=0;
      cd.querySelectorAll('body *').forEach(function(n){
        var r=n.getBoundingClientRect();
        if(r.width>4&&r.height>4&&r.height<H*0.92){
          maxH=Math.max(maxH,r.height);
          maxB=Math.max(maxB,r.bottom)}});
      if(H&&(maxH<H*0.55||maxB<H*0.6)){
        var crd=f.closest('.card');
        // .pg = emitted page/layout docs — a full page's sections
        // are each smaller than the frame, so the small-content
        // heuristic misreads them; only bank exemplars may be mini
        if(crd&&!crd.classList.contains('pg'))
          crd.classList.add('mini')}}catch(e){}
    setTimeout(fitIframes,90)}

  // skeleton → done/error lifecycle for every preview frame in
  // a rendered pane (grid cards, vibe, remix, scrub rows)
  function wireFrames(scope){
    scope.querySelectorAll('.cb iframe,.srow iframe').forEach(
      function(f){
      var cb=f.closest('.cb');
      if(!cb)return;
      f.addEventListener('load',function(){
        var bad=function(){try{
          return !f.contentDocument||
            f.contentDocument.contentType!=='text/html'||
            !f.contentDocument.body||
            !f.contentDocument.body.children.length
        }catch(e){return false}};
        if(bad()){
          // lazy/theme-rewritten frames can fire load before the
          // real document parses — re-check once before failing
          if(!f._rt){f._rt=1;setTimeout(function(){
            if(bad()){
              cb.classList.add('err');
              if(!cb.querySelector('.perr')){
                var d=document.createElement('div');
                d.className='perr';
                d.textContent='preview failed to load — '+
                  (f.dataset.src||f.src).split('/').pop();
                cb.appendChild(d)}
              return}
            _frameDone(f,cb)},450);
            return}
          cb.classList.add('err');
          if(!cb.querySelector('.perr')){
            var d=document.createElement('div');
            d.className='perr';
            d.textContent='preview failed to load — '+
              (f.dataset.src||f.src).split('/').pop();
            cb.appendChild(d)}
          return}
        _frameDone(f,cb)});
      f.addEventListener('error',function(){
        cb.classList.add('err')})})}

  // signed per-element effect pick — shared by the labeled
  // select and the ◆ chooser
  function fxPick(el,v){
    api('/element-pick',{pipeline:PIPELINE,element:el,
      variant:v}).then(function(j){
      if(j.ok){if(v==='none'){delete DATA.picked_elements[el];
          toast('effect cleared — '+el)}
        else{DATA.picked_elements[el]=v;
          toast(v+' applied — '+el)}
        board()}
      else toast(j.message||'refused')})}

  // keyboard scrub — ←/→ moves card selection on boards,
  // swaps the current row's alternative on the scrub board
  document.addEventListener('keydown',function(ev){
    if(!DATA||CUR==null)return;
    if(document.getElementById('xpOv'))return;
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
          // ORDER refusals name the earliest wave to re-gate:
          // "re-gate wN", "ORDER: wN has not passed — run it first",
          // "wN inputs changed since it passed"
          var rw=!j.ok&&(j.message||'').match(
            /re-gate (w\d+)|ORDER: (w\d+)|(w\d+) has not passed/);
          if(rw){var wv=rw[1]||rw[2]||rw[3];
            stat.textContent='earlier wave '+wv+
              ' isn’t clean — re-gate it, then pick again. ';
            var rb=document.createElement('button');
            rb.className='abtn';rb.textContent='Re-gate '+wv;
            rb.onclick=function(){rb.disabled=true;
              api('/regate',{wave:wv,pipeline:PIPELINE})
                .then(function(g){
                  var msg=g.ok?g.message:(g.reason||g.message);
                  toast(msg);rb.disabled=false;
                  if(g.ok)stat.textContent=wv+
                    ' clean — pick again';
                  else{stat.textContent=msg+' ';
                    // keep the re-gate control alive — a pause
                    // (pick gate) or a new failure still needs it
                    stat.appendChild(rb)}
                })};
            stat.appendChild(rb);
          }else stat.textContent=(j.message||(j.ok?'recorded':'refused'))
            .replace(/^approve REFUSED:? ?/,'');
          if(j.ok){b.textContent='picked ✓';
            b.closest('.card').classList.add('picked');
            // reflect the signed approval in the flow UI: a w3
            // pick IS the layout pick, w4 the page-design pick
            DATA.picked_elements=DATA.picked_elements||{};
            if(b.dataset.wave==='w3')
              DATA.picked_elements.layout=b.dataset.d;
            var st=document.getElementById('stepper');
            if(st)st.innerHTML=stepperHtml();
            var sb=document.getElementById('selbar');
            if(sb)sb.innerHTML=selbarHtml();
            wireFlow();
            toast(j.message)}else b.disabled=false})})
    }else{
      var _sign=function(bundle){
        api('/element-pick',{pipeline:PIPELINE,
          element:b.dataset.elem,variant:b.dataset.var,
          bundle:bundle}).then(function(j){
          stat.className='pstat '+(j.ok?'ok':'bad');
          stat.textContent=j.message||(j.ok?'recorded':'refused');
          if(j.ok){b.textContent='picked ✓';toast(j.message);
            DATA.picked_elements=DATA.picked_elements||{};
            DATA.picked_elements[b.dataset.elem]=b.dataset.var;
            if(b.dataset.elem==='vibe'||b.dataset.elem==='type')
              BAKED=b.dataset.var;    // re-resolve: every preview
                                      // reframes under the new bundle
            board()}
          else b.disabled=false})};
      // a type pick is signed server-side — record_element_pick
      // rebuilds the candidate's deltas + ladder over the signed
      // vibe bundle; the client sends no bundle at all
      _sign(null)}
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
    var warmTries=0;
    function showLoading(){
      if(DATA)return;
      document.getElementById('board').innerHTML=
        '<div class="empty">emitting previews — the service is '+
        'warming up, this page loads itself when it is ready…</div>'}
    function take(d){
      if(d.error&&!d._warming){
        document.getElementById('board').innerHTML=
          '<div class="empty">'+esc(d.error)+'</div>';return}
      DATA=d;CUR='vibe';
      DATA.vibe_genes=d.vibe_genes||{};
      // a signed type pick rebinds previews under its resolved
      // bundle — it carries the vibe genes + its own overrides
      BAKED=(d.picked_elements||{}).type||
        (d.picked_elements||{}).vibe||'';
      topchips();rail();board();
      // a last-good payload marked _warming is swapped for the
      // fresh emit when the background warm finishes — the
      // re-render also re-points any iframe that raced the emit
      if(d._warming)setTimeout(function(){loadData(0)},5000)}
    function loadData(attempt){
      fetch('/app-data?pipeline='+encodeURIComponent(PIPELINE))
        .then(function(r){
          if(r.status===503)throw{warm:true};
          return r.json()})
        .then(take)
        .catch(function(){
          showLoading();
          warmTries++;
          setTimeout(function(){loadData(attempt+1)},
            Math.min(3000*Math.pow(1.5,attempt),15000))})}
    loadData(0);
  });
})();
</script>
</body>
</html>
"""


def app_shell():
    return _SHELL.encode('utf-8')
