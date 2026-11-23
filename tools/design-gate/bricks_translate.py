#!/usr/bin/env python3
"""bricks_translate.py — Bricksmaven ACSS-JSON → .astro section source.

The Bricksmaven payload (wp-login-harvested `item-*.json` /
`<name>-<n>.json` under templates/skeletons/bricksmaven/<cat>/)
carries a flat Bricks element list plus `globalClasses` with ACSS
settings. This translates both into one self-contained Astro
skeleton per payload, banked next to the payload as `<stem>.astro`:

  element tree  → JSX markup (section/container shells dropped —
                  Section.astro owns those, SB.2)
  globalClasses → sibling .css, every selector scoped under
                  .wf-<stem> (the component surface) for @layer
                  components — topology only, never site-wide
  ACSS var refs → the token layer (var(--space-*) survive; colours,
                  radius, text and width map to emitted vars)

The output is BANK SOURCE, not a gold exemplar: a header comment
marks it bm-translated and the SOP adapts copy/props before anything
is canonised. Unmapped ACSS vars are counted and listed — never
silently invented (F10 doctrine).

Usage:
  python3 tools/design-gate/bricks_translate.py <payload.json>...
  python3 tools/design-gate/bricks_translate.py --all [--limit N]
"""
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
BANK = os.path.normpath(os.path.join(
    HERE, '..', '..', 'templates', 'skeletons', 'bricksmaven'))

# --------------------------------------------------------- var map
# A component's inner gaps stop at the space-xl rung: section-space-*
# is the band's padding (SB.2), never a gap between a section's own
# children (a 405px logo→content gap on header-page-8).
# ACSS → emitted token layer. Values verified against
# emit_global/global.css output (--fs-*, --space-*, --r-card,
# --color-* roles, --content-width, --measure, --flow-spacing).
EXACT = {
    'space-xs': 'space-xs', 'space-s': 'space-s',
    'space-m': 'space-m', 'space-l': 'space-l',
    'space-xl': 'space-xl', 'space-xxl': 'space-xl',
    'content-gap': 'flow-spacing', 'container-gap': 'space-s',
    'grid-gap': 'space-m', 'gutter': 'gutter',
    'width-l': 'content-width', 'width-m': 'measure',
    'text-s': 'fs-0', 'text-m': 'fs-1', 'text-l': 'fs-2',
    'text-xl': 'fs-3', 'text-xxl': 'fs-4',
    'base': 'fs-0', 'radius-xl': 'r-card', 'radius-xxl': 'r-card',
    'radius-circle': 'PCT:100', 'at-radius--m': 'r-card',
    'radius-xs': 'r-card', 'heading-line-height': 'lh-0',
    'radius-l': 'r-card', 'radius-m': 'r-card', 'radius-s': 'r-card',
    'white': 'bg-canvas', 'black': 'text-primary',
    'neutral': 'text-secondary', 'neutral-light': 'color-line-default',
    'neutral-dark': 'color-ink-secondary',
    'neutral-ultra-light': 'bg-subtle',
    'shade': 'bg-subtle', 'shade-light': 'bg-subtle',
    'shade-ultra-light': 'bg-subtle',
    'primary': 'action-primary',
    'circle-size': 'tap',
}


def map_var(name):
    """ACSS var name → emitted token name, or None (report)."""
    if name in EXACT:
        return EXACT[name]
    m = re.match(r'grid--?(\d+)(?:-(\d+))?$', name)
    if m and m.group(2):
        # ACSS ratio grids: --grid-1-2 is TWO tracks 1fr 2fr, never a
        # single 200% column (the 390px overflow in hero-79/85, grid-35)
        return f'RATIO:{int(m.group(1))}/{int(m.group(2))}'
    if m:      # ACSS grid fractions: --grid-2 and --at-grid--2 → 50%
        num = int(m.group(2) or 1)
        return f'GRID:{num}/{int(m.group(1))}'
    m = re.match(r'h(\d)$', name)
    if m:      # ACSS heading sizes → fluid scale
        return {1: 'fs-4', 2: 'fs-3', 3: 'fs-2', 4: 'fs-1',
                5: 'fs-0', 6: 'fs-0'}[int(m.group(1))]
    if name == 'radius-50' or name.endswith('-circle'):
        return 'PCT:100'
    m = re.match(r'section-space-(\w+)', name)
    if m:
        return f'section-space-{m.group(1)}'
    if re.match(r'(?:box-)?shadow-\w+', name):
        return 'shadow-card'
    m = re.match(r'width-(\w+)', name)
    if m:
        return 'content-width' if m.group(1) in ('l', 'xl') \
            else 'measure'
    m = re.match(r'animation-(duration|timing-function|direction|'
                 r'iteration-count|delay|name)(?:-(\w+))?$', name)
    if m:
        return ('primitive-duration-med'
                if m.group(1) == 'duration' else 'primitive-ease')
    if 'trans-' in name:
        base = name.split('-trans-')[0]
        t = map_var(base)          # resolve the base then tint it
        pct = name.rsplit('-', 1)[-1]
        if t and not t.startswith(('GRID:', 'RATIO:', 'MIX:')):
            return f'MIX:{t}:{pct}'
        return 'bg-subtle'
    m = re.match(r'content-gap(?:--\w+)?$', name)
    if m:      # ACSS content-gap family → prose-flow rung
        return 'flow-spacing'
    m = re.match(r'grid-gap(?:--\w+)?$', name)
    if m:
        return 'grid-gap'
    if name.startswith('at-'):
        return map_var(name[3:]) or 'fs-0'
    if name == 'danger':
        return 'primitive-state-danger'
    if name == 'content-width':
        return 'content-width'
    if 'primary' in name or name.startswith('action'):
        return 'action-primary'      # tints collapse to the role
    if name.startswith('base'):
        return 'fs-0'
    if name.startswith('shade') or name.startswith('neutral'):
        return 'bg-subtle'
    if name.startswith('text'):
        return 'fs-0'
    return None


VAR_RE = re.compile(r'var\(\s*--([\w-]+)\s*\)')

# ACSS space rungs (clamp._SPACE_ORDER, base 24/30px, ~1.333/1.5
# ratios) — geometric midpoints in mob px snap an authored literal to
# its nearest rung.
_SPACE_EDGES = (('xs', 15.7), ('s', 20.9), ('m', 27.7), ('l', 36.9),
                ('xl', 49.3))
_BARE_SIZE = re.compile(r'(?<![\w.])(-?\d*\.?\d+)(rem|px)\b')
_PAREN_SPAN = re.compile(r'\([^()]*\)')


def _space_rung(px):
    for rung, edge in _SPACE_EDGES:
        if px < edge:
            return rung
    return 'xxl'


def _acss_size(v):
    """Bare Npx/Nrem literals → ACSS: ≥10px snaps to the nearest
    --space-* rung; sub-rung sizes (<10px — Bricks' 1–4px hairline
    breathing) keep the authored value inside calc() so the emitted
    residue stays var/rem only (FL.1/R.12 ban bare literals in
    padding/margin/gap). Literals inside function calls (clamp/calc
    fluid tracks) are already legal — parens are masked first."""
    spans = []

    def stash(m):
        spans.append(m.group(0))
        return f'\x00{len(spans) - 1}\x00'

    def subv(m):
        n, u = float(m.group(1)), m.group(2)
        px = abs(n) * (16.0 if u == 'rem' else 1.0)
        if px == 0:
            return '0'
        rem = n if u == 'rem' else n / 16.0
        if px < 10:
            # single-term calc(Nrem) is folded back to bare Nrem by the
            # build's css minifier — the trailing + 0vw keeps the calc()
            # wrapper (and the FL.1-legal var/rem residue) in dist css;
            # 0% would fail _fl_term_ok (% carries no word boundary)
            return f'calc({rem:g}rem + 0vw)'
        rung = _space_rung(px)
        return (f'calc(var(--space-{rung}) * -1)' if n < 0
                else f'var(--space-{rung})')

    w = _PAREN_SPAN.sub(stash, str(v))
    w = _BARE_SIZE.sub(subv, w)
    for i, s in enumerate(spans):
        w = w.replace(f'\x00{i}\x00', s)
    return w


def translate_value(v, unmapped):
    """Rewrite ACSS var refs to token refs inside any CSS value."""
    def sub(m):
        n = m.group(1)
        t = map_var(n)
        if t is None:
            unmapped.add(n)
            return None      # caller drops the declaration
        if t.startswith('GRID:'):
            num, den = t[5:].split('/')
            return f'calc(100% * {num} / {den})'
        if t.startswith('RATIO:'):
            a, b = t[6:].split('/')
            return f'minmax(0, {a}fr) minmax(0, {b}fr)'
        if t.startswith('MIX:'):
            _, base, pct = t.split(':', 2)
            return (f'color-mix(in srgb, var(--{base}) '
                    f'{pct}%, transparent)')
        if t.startswith('PCT:'):
            return t[4:] + '%'
        return f'var(--{t})'
    out = VAR_RE.sub(lambda m: (sub(m) or 'var(--unmapped)'), str(v))
    if '--unmapped' in out:
        return None
    return _acss_size(out)


# ------------------------------------------------------ css settings
# Bricks globalClass settings → css declarations, one map.
SETTING_CSS = {
    '_display': 'display', '_direction': 'flex-direction',
    '_flexDirection': 'flex-direction', '_rowGap': 'row-gap',
    '_columnGap': 'column-gap', '_gap': 'gap',
    '_alignItems': 'align-items', '_justifyContent': 'justify-content',
    '_flexWrap': 'flex-wrap', '_alignSelf': 'align-self',
    '_gridTemplateColumns': 'grid-template-columns',
    '_gridTemplateRows': 'grid-template-rows',
    '_width': 'width', '_minWidth': 'min-width',
    '_maxWidth': 'max-width', '_height': 'height',
    '_minHeight': 'min-height', '_maxHeight': 'max-height',
    '_overflow': 'overflow', '_objectFit': 'object-fit',
    '_zIndex': 'z-index', '_position': 'position',
    '_top': 'top', '_right': 'right', '_bottom': 'bottom',
    '_left': 'left', '_gridGap': 'gap',
}
BOX_CSS = {'_padding': 'padding', '_margin': 'margin'}
TYPO_CSS = {'font-size': 'font-size', 'font-weight': 'font-weight',
            'line-height': 'line-height', 'letter-spacing':
            'letter-spacing', 'text-align': 'text-align',
            'text-transform': 'text-transform', 'font-style':
            'font-style', 'text-decoration': 'text-decoration',
            'font-family': 'font-family'}


def _dim(v, unmapped):
    """Bricks dimension {number,unit} / str / dict → css value."""
    if isinstance(v, dict):
        if 'number' in v:
            u = v.get('unit') or ''
            return translate_value(f"{v['number']}{u}", unmapped)
        if 'raw' in v:
            return translate_value(v['raw'], unmapped)
        if 'color' in v:
            return _dim(v['color'], unmapped)
        if 'id' in v and 'raw' not in v:
            return translate_value(v.get('name') or '', unmapped)
        parts = {k: _dim(v[k], unmapped)
                 for k in ('top', 'right', 'bottom', 'left') if k in v}
        if parts:
            vals = [str(parts.get(k) or '0')
                    for k in ('top', 'right', 'bottom', 'left')]
            if any(x in ('None', '') for x in vals):
                return None
            imp = any('!important' in x for x in vals)
            vals = [x.replace(' !important', '') for x in vals]
            return ' '.join(vals) + (' !important' if imp else '')
        return None
    if v in (None, 'None'):
        return None
    return translate_value(v, unmapped)


GRID_TRACK_RE = re.compile(r'calc\(100% \* (\d+) / (\d+)\)')

# decls the skeleton may keep: topology ONLY. Spacing, colour,
# border, radius, clip, font, width/measure and alignment all belong
# to the token layer + Section.astro + the global patterns — a bank
# rule that re-declares them is bespoke shape leaking site-wide (M2).
TOPOLOGY = {'display', 'flex-direction', 'flex-wrap',
            'grid-template-columns', 'grid-template-rows', 'order',
            'gap', 'row-gap', 'column-gap'}

# a collection's gap says "separated siblings" — topology. The
# authored distance is the skeleton's own intent (a prose column's
# content-gap is not a card grid's gutter), so it binds through
# translate_value — honour it verbatim. A container with NO authored
# gap gets the Q.4 default below instead.
def _topo_bind(p, v):
    return p, v


def _scope_css(style, scope):
    """Prefix every rule selector with the component's `.wf-<stem>`
    scope — bank topology binds only inside its own surface (M2):
    bespoke names never reach the site-wide namespace."""
    def repl(m):
        sel = m.group(1)
        if sel.strip().startswith('@'):
            return sel + '{'
        lead = sel[:len(sel) - len(sel.lstrip())]
        parts = [f'{scope} {p.strip()}' if '.' in p else p.strip()
                 for p in sel.strip().split(',')]
        return lead + ', '.join(parts) + ' {'
    return re.sub(r'([^{}]+)\{', repl, style)


# the G.5 canon every collection grid collapses to — floor/cap are
# locals so data-cols (G.8) tightens the count per section
AUTO_TRACKS = ('repeat(auto-fit, minmax(min(max('
               'var(--grid-floor,var(--grid-min,28rem)), '
               'calc((100% - (var(--grid-cap,99) - 1) * '
               'var(--grid-gap)) / var(--grid-cap,99))), '
               '100%), 1fr))')


def tracks(value):
    """A grid track list: ACSS `--grid-N` is N equal tracks, not a
    column width. `calc(100% * 1 / N)` alone → repeat(N, 1fr); inside a
    list, each fraction stays a percentage track."""
    v = value.strip()
    m = GRID_TRACK_RE.fullmatch(v)
    if m and m.group(1) == '1':
        n = int(m.group(2))
        # a 12-track card matrix is a composition, not a layout: the
        # DNA floor decides how many columns fit
        if n > 3:
            return AUTO_TRACKS
        return f'repeat({n}, minmax(0, 1fr))'
    return GRID_TRACK_RE.sub(lambda t: f'{t.group(0)}', v)


def settings_css(settings, unmapped, raw=None):
    """One globalClass's settings → [(prop, value)] css declarations.
    `raw` collects _cssCustom blocks for @layer-top emission."""
    out = []
    for key, val in (settings or {}).items():
        if key in ('_typography',) and isinstance(val, dict):
            # type is the DNA's: only text-align survives (it is
            # layout, not a type decision)
            ta = val.get('text-align')
            if ta and ta != 'default':
                out.append(('text-align', str(ta)))
            continue
        if key in BOX_CSS and isinstance(val, (dict, str)):
            cv = _dim(val, unmapped)
            if cv:
                out.append((BOX_CSS[key], cv))
            continue
        if key == '_background':
            continue        # colour is a DNA surface
        if key == '_border':
            continue    # borders/radius come from the token layer
        if key == '_boxShadow':
            out.append(('/* bm: box-shadow omitted — token layer '
                        'owns elevation */', None))
            continue
        if key == '_cssCustom' and val:
            # raw bespoke css (keyframes, descendant selectors,
            # pseudo-chrome) — never emitted: verbatim shape is
            # exactly what the scope is meant to keep out (M2)
            continue
        prop = SETTING_CSS.get(key)
        if prop in ('grid-template-rows', 'height', 'min-height',
                    'max-height', 'position', 'top', 'right', 'bottom',
                    'left', 'z-index'):
            continue
        if prop:
            cv = _dim(val, unmapped)
            if cv not in (None, '', 'default'):
                if prop in ('grid-template-columns', 'grid-template-rows'):
                    cv = tracks(str(cv))
                # nowrap pins intrinsic content wider than the
                # viewport (bm-headers overflow at 1280/768/390);
                # no spec combines nowrap with an overflow scroller,
                # so wrap is the safe semantic
                if prop == 'flex-wrap' and cv == 'nowrap':
                    cv = 'wrap'
                out.append((prop, cv))
    return out


def classes_css(payload, unmapped):
    """globalClasses → (rules {name: [(prop,value)]}, raw css list).
    `_cssCustom` blocks (keyframes, descendant selectors) return in
    `raw` — they emit at @layer top level, never inside a rule."""
    rules, raw = {}, []
    for gc in payload.get('globalClasses') or []:
        name = gc.get('name')
        if not name:
            continue
        decls = settings_css(gc.get('settings') or {}, unmapped, raw)
        # topology-only scope (M2): a class whose decls are all
        # bespoke styling keeps no rule — and no markup class either
        # (SB.3: markup classes must exist in the shared layer)
        decls = [(p, v) for p, v in decls if p in TOPOLOGY]
        if decls:
            rules[name] = decls
    return rules, raw


# ---------------------------------------------------------- markup
ELEM_TAGS = {
    'div': 'div', 'block': 'div', 'container': 'div',
    'text-basic': 'p', 'text': 'p',
    'text-link': 'a', 'icon': 'span', 'svg': 'svg',
    'counter': 'span', 'logo': 'img', 'code': 'div',
    'divider': 'hr', 'video': 'figure',
}


def _classes_of(el):
    ids = (el.get('settings') or {}).get('_cssGlobalClasses') or []
    return ids          # resolved to names by caller


def camel(s):
    return ''.join(w.capitalize() for w in re.split(r'[\-_]+', s))


_FORM_NEED = (('name', 'text', 'Name'), ('email', 'email', 'Email'),
              ('phone', 'tel', 'Phone'), ('message', 'textarea', 'Message'))
_FORM_AC = {'name': 'name', 'email': 'email', 'phone': 'tel'}
_PAGINATION = ('<nav class="pagination row gap-fluid-s" '
               'aria-label="Pagination"><a href="?page=1" '
               'aria-current="page">1</a><a href="?page=2">2</a>'
               '<a href="?page=3">3</a><a href="?page=2" rel="next">'
               'Next</a></nav>')


def _form_fields(s, cat, pad):
    """A Bricks form's `fields` → labelled controls + submit. A contact
    form always asks name / email / phone / message (the contact
    contract), whatever subset the skeleton shipped."""
    rows, have = [], set()
    for f in s.get('fields') or []:
        t = f.get('type')
        if t not in ('text', 'email', 'tel', 'number', 'textarea'):
            continue
        lab = str(f.get('label') or f.get('placeholder') or t)
        low = lab.lower()
        key = ('email' if t == 'email' else
               'phone' if t == 'tel' or 'phone' in low else
               'message' if t == 'textarea' else
               'name' if 'name' in low else low)
        if key in have:
            continue   # first + last name fold into one name control
        have.add(key)
        rows.append((key, 'tel' if key == 'phone' else t,
                     'Name' if key == 'name' else lab))
    if cat == 'contact':
        rows += [r for r in _FORM_NEED if r[0] not in have]
    rows.sort(key=lambda r: r[1] == 'textarea')
    if not rows:
        return ''
    out = ''
    for key, t, lab in rows:
        fid = re.sub(r'[^a-z0-9]+', '-', key.lower()).strip('-') or 'f'
        ac = f' autocomplete="{_FORM_AC[key]}"' if key in _FORM_AC else ''
        req = 'required aria-required="true"'
        ctl = (f'<textarea name="{fid}" rows="4" {req}></textarea>'
               if t == 'textarea' else
               f'<input type="{t}" name="{fid}"{ac} {req} />')
        lab = lab.replace('{', '&#123;').replace('<', '&lt;')
        out += (f'{pad}<label class="field flow"><span '
                f'class="text-fluid--1">{lab} <span aria-hidden="true">'
                f'*</span></span>{ctl}</label>\n')
    btn = str(s.get('submitButtonText') or 'Send').replace('{', '')
    # S.9 — the form's error / success states
    return out + (f'{pad}<p class="form-error text-fluid--1" role="alert" '
                  f'hidden></p>\n{pad}<p class="form-success text-fluid--1" '
                  f'role="status" hidden></p>\n'
                  f'{pad}<button type="submit" class="wf-cta-button">'
                  f'{btn}</button>\n')


def translate(payload, stem):
    """payload dict → (astro_src, report dict)."""
    els = {e['id']: e for e in payload.get('content') or []}
    gc_names = {g.get('id'): g.get('name')
                for g in payload.get('globalClasses') or []}
    unmapped = set()
    rules, raw_css = classes_css(payload, unmapped)

    seen = {'h': False, 'p': False, 'btn': False,
            'loop_img': False}                    # first heading→
                                    # {heading}, first paragraph→{fs}

    cat = stem.split('-')[0]

    # overlay family (N.flyout): a Bricks `offcanvas` element is the
    # flyout surface — in a header it IS the mobile menu (fixed
    # panel + scrim + close + docked CTA, the .nav-links contract);
    # elsewhere it is the generic .flyout dialog. `toggle` elements
    # are its chrome: burger in the bar, close inside the panel,
    # .flyout-open on other categories.
    _names = {e.get('name') for e in payload.get('content') or []}
    has_offcanvas = 'offcanvas' in _names
    has_toggle = 'toggle' in _names

    def cls(el, depth=1, card=False):
        """Skeleton layout classes + the DNA's role class.

        The skeleton keeps every layout declaration it declares
        (display, grid tracks, gaps, padding, alignment, sizing) and
        loses every type/colour/border value to the token layer. The
        role class adds the DNA step the skeleton may not decide:
        text-fluid-*, card, ratio-portrait, wf-cta-button.
        """
        n = el.get('name')
        skel = ' '.join(x for x in
                        (gc_names.get(i) for i in _classes_of(el))
                        if x and x in rules)
        role = ''
        if n == 'heading':
            # the payload's own tag is the rank: an h1 is the hero
            role = ('text-fluid-4' if (el.get('settings') or {})
                    .get('tag') == 'h1' else 'text-fluid-2')
        elif n in ('text-basic', 'text', 'text-link'):
            role = 'text-fluid-0'
        elif card:
            role = 'card'
        elif n == 'image':
            role = 'ratio-portrait'
        elif n == 'logo':
            role = 'logo'
        elif n in ('div', 'container', 'block'):
            kids = [els[k] for k in (el.get('children') or [])
                    if els.get(k)]
            # a grid only where the skeleton actually pairs media with
            # text; text-only stacks stay in normal flow, never a
            # squeezed 3-up of one-word columns
            if len(kids) >= 2 and any(k.get('name') == 'image'
                                      for k in kids):
                role = 'grid-auto gap-fluid-l'
            # chrome reads as a bar, not a stack — except inside a
            # flyout panel, whose children stack vertically
            if cat == 'header' and len(kids) >= 2 and \
                    not seen.get('in_flyout'):
                role = 'row between'
            if cat == 'footer' and len(kids) >= 2 and \
                    not seen.get('in_flyout'):
                role = 'row between'
        return ' '.join(x for x in (skel, role) if x)

    def _subtree_names(el_id, acc):
        e = els.get(el_id)
        if not e:
            return
        acc.add(e.get('name'))
        for k in e.get('children') or []:
            _subtree_names(k, acc)

    def tag_of(el):
        n = el.get('name')
        s = el.get('settings') or {}
        if n == 'section':
            return None
        if n == 'heading':
            return s.get('tag') or 'h2'
        if n == 'button':
            return s.get('tag') or 'a'
        if n == 'image':
            return 'img'
        if n == 'form':
            return 'form'
        return ELEM_TAGS.get(n, 'div')

    # repeated-sibling detection: ≥3 same-name+class children → items
    def sig(el):
        return (el.get('name'), tuple(sorted(_classes_of(el))))

    def _whole_cond(s):
        """The guard of an emit that is wholly one conditional
        expression — `{x.length > 0 && <div>…}` or
        `{image && image.src && …}` — else None. Parents propagate it
        so a wrapper around a single conditional child collapses too.
        A trailing `}` is not enough: `{g && …}{h && …}` is two
        sibling expressions — only the head is conditional, so the
        parent must NOT propagate the head's guard over the whole."""
        t = s.strip()
        # any simple guard (`list.length > 0`, `image && image.src`,
        # `act.label`, `links.length === 0`) collapses upward — the
        # expression is the text before the first ` && `
        m = re.match(r'^\{([^{}]{1,80}?) && ', t)
        if not m:
            return None
        depth = 0
        for i, ch in enumerate(t):
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    return m.group(1).strip() if i == len(t) - 1 \
                        else None
        return None

    def _as_nav(depth):
        """A header's top-level link collection IS the primary nav
        (N.select): it binds the nav-menu contract once. Beside a
        nav-menu it would repeat the same links as a second desktop
        row (H.1, N.dup), so it binds nothing."""
        if seen.get('nav_menu') or 'nav-menu' in _names:
            return ''
        els['__nav'] = {'id': '__nav', 'name': 'nav-menu',
                        'settings': {}, 'children': []}
        out = render('__nav', depth)
        if has_toggle:
            # the payload's own toggle is the burger — never two
            out = ''.join(ln for ln in out.splitlines(True)
                          if 'class="burger"' not in ln)
        return out

    def render(el_id, depth, ivar=None, card=False, in_card=False):
        # card marks THIS element's role; in_card is the context for
        # descendants (heading promotion, chip rules) — it persists
        # through nested wrappers inside the card
        in_card = in_card or card
        el = els.get(el_id)
        if not el:
            return ''
        pad = '  ' * depth
        name = el.get('name')
        s = el.get('settings') or {}
        children = el.get('children') or []
        if name == 'pagination':
            seen['paged'] = True
            return f'{pad}{_PAGINATION}\n'

        # A real card list alternates heading/text/heading/text — not
        # three identical siblings. Detect a repeating cycle of 2–4
        # elements repeated ≥3 times and render it as items.map with
        # one card per cycle.
        _kids = [els[c] for c in children if els.get(c)]
        if len(_kids) >= 6 and name in ('div', 'container', 'block') \
                and not ivar:
            _sig = lambda x: (x.get('name'),
                              tuple(sorted((x.get('settings') or {})
                                           .get('_cssGlobalClasses') or [])))
            _sigs = [_sig(k) for k in _kids]
            # all-identical children are a run, not a cycle
            for _k in ((2, 3, 4) if len(set(_sigs)) > 1 else ()):
                if len(_sigs) >= 3 * _k and all(
                        _sigs[i] == _sigs[i % _k]
                        for i in range(len(_sigs))):
                    seen['ivar_head'] = False
                    seen['ivar_text'] = False
                    seen['ivar_tag'] = False
                    _body = ''.join(render(children[i], depth + 3, 'it',
                                           card=cat not in ('header',
                                                            'footer'))
                                    for i in range(_k))
                    seen.pop('ivar_head', None)
                    seen.pop('ivar_text', None)
                    seen.pop('ivar_tag', None)
                    if not _body.strip():
                        continue   # an item template that emits
                        # nothing is not a loop
                    return (f'{pad}<div class="grid-auto gap-fluid-m">\n'
                            f'{pad}  {{list.map((it) => (\n'
                            f'{pad}    <div class="card">\n{_body}'
                            f'{pad}    </div>\n'
                            f'{pad}  ))}}\n{pad}</div>\n')

        # group runs of ≥3 identically-signed siblings into items.map
        seq, i = [], 0
        while i < len(children):
            c = els.get(children[i])
            if not c:
                i += 1
                continue
            j = i
            while j < len(children) and els.get(children[j]) and \
                    sig(els[children[j]]) == sig(c):
                j += 1
            seq.append((children[i:j], j - i))
            i = j

        if name == 'section':
            # The page shell already wraps every component in
            # <section class="sec-band surface-* density-*">. The bank
            # only supplies the measure box, never a second band.
            parts = [render(c, depth + 1, ivar, in_card=in_card)
                     for c in children]
            live = [p for p in parts if p.strip()]
            inner = ''.join(parts)
            out = (f'{pad}<div class="sec-inner">\n{inner}'
                   f'{pad}</div>\n')
            # a measure box whose only payload is a conditional block
            # collapses with it (L.15 — no empty wrapper in the DOM)
            g = _whole_cond(inner) if len(live) == 1 else None
            if g:
                return f'{pad}{{{g} && ' + out + f'{pad}}}\n'
            return out

        tag = tag_of(el)
        c = cls(el, depth, card)
        cattr = f' class="{c}"' if c else ''
        if name == 'button':
            # PS.7 — one primary CTA per section; A.2 — a card is a
            # heading link, never a button
            if ivar:
                return ''
            if seen.get('btn'):
                return ''
            seen['btn'] = True
            style_ = str(s.get('style') or '')
            cattr = ' class="wf-cta-button"'
            txt = re.sub(r'<[^>]+>', '', str(s.get('text') or ''))
            inner = '{cta.label}' if txt and not ivar else \
                (f'{{{ivar}.label}}' if ivar else 'Action')
            # the wrapper keeps the inline-block button from being
            # stretched by a grid cell; an unbound CTA renders nothing
            # (F.1 — no invented 'Continue' text)
            if ivar:
                return (f'{pad}<p class="mt-fluid-m"><a{cattr} href='
                        f'{{{ivar}.href}}>{inner}</a></p>\n')
            return (f'{pad}{{act.label && <p class="mt-fluid-m">'
                    f'<a{cattr} href={{act.href}}>{{act.label}}</a></p>}}\n')
        if name == 'logo':
            # L.16 — brand-mark carries the explicit-size class token
            cattr = (cattr[:-1] + ' brand-mark"') if cattr else \
                ' class="brand-mark"'
            return (f'{pad}<span{cattr}>{{brand}}</span>\n')
        if name == 'image':
            # V.8/P.12 — media renders through astro:assets <Image> so
            # the raster compiles to AVIF/WebP srcsets; the slot only
            # exists when the plan binds image (text-led DNAs render
            # no placeholder). Alt comes from the plan row, never
            # invented (F.1/U.4)
            _gcn = ' '.join(gc_names.get(i, '')
                            for i in _classes_of(el))
            if ('background' in _gcn.lower()
                    or 'backdrop' in _gcn.lower()
                    or 'background'
                    in (el.get('label') or '').lower()
                    or 'backdrop'
                    in (el.get('label') or '').lower()):
                # a background figure is the band's surface, not a
                # content item — emit the .media-bg layer (edge-to-edge
                # cover behind the content, token scrim keeps contrast).
                # It spends the row's next asset like any pane — a
                # band beside a content figure never repeats its photo
                k = seen.get('img_n', 0)
                seen['img_n'] = k + 1
                m = f'images[{k - 1}]' if k else 'image'
                src = f'mediaOf({m})' if k else 'mediaSrc || image.src'
                return (f'{pad}{{{m} && {m}.src && '
                        '<figure class="media-bg" aria-hidden="true">'
                        f'<Image src={{{src}}} '
                        f"alt={{{m}.alt || ''}} "
                        'widths={[960, 1440, 1920]} '
                        'sizes="100vw" width={1600} height={900} '
                        'loading="eager" fetchpriority="high" />'
                        '</figure>}\n')
            if ivar:
                # a section-bound image inside a per-item loop
                # duplicates per item — and an empty list renders it
                # zero times; lift it to one figure beside the copy
                seen['loop_img'] = True
                return ''
            k = seen.get('img_n', 0)
            seen['img_n'] = k + 1
            if k:
                # a second/third media pane takes the row's NEXT asset
                # (images[k-1]) — never the hero photo again; with no
                # further asset the pane drops (single-media layout)
                m = f'images[{k - 1}]'
                return (f'{pad}{{{m} && {m}.src && '
                        f'<figure{cattr}><div class="media-round" '
                        'data-ratio={(image && image.ratio) || null}>'
                        f'<Image src={{mediaOf({m})}} '
                        f"alt={{{m}.alt || ''}} "
                        'widths={[480, 960, 1440]} '
                        'sizes="(min-width: 48rem) 50vw, 100vw" '
                        'width={900} height={600} loading="lazy" />'
                        '</div></figure>}\n')
            return (f'{pad}{{image && image.src && '
                    f'<figure{cattr}><div class="media-round" '
                    'data-ratio={image.ratio || null}>'
                    '<Image src={mediaSrc || image.src} '
                    'alt={image.alt || \'\'} '
                    'widths={[480, 960, 1440]} '
                    'sizes="(min-width: 48rem) 50vw, 100vw" '
                    'width={900} height={600} loading="lazy" />'
                    '</div></figure>}\n')
        if name == 'text-link' and ivar:
            # term/label is the link's own text; a distinct text slot
            # drops to a description line under the link (F.1 — both
            # are copy and neither may be dropped)
            # the item's link IS its title — a bare <a> inside a
            # card carries no heading, so the title wraps an h3
            # (Q.2 hierarchy); header/footer links stay bare anchors.
            _lead = f'{pad}<h3 class="text-fluid-1">' \
                if cat not in ('header', 'footer') else pad
            _tail = '</h3>\n' if cat not in ('header', 'footer') \
                else '\n'
            return (f'{_lead}<a{cattr} href={{{ivar}.href}}>'
                    f'{{{ivar}.icon && '
                    f'<IconChip name={{{ivar}.icon}} />}} '
                    f'{{{ivar}.label || {ivar}.term || '
                    f'{ivar}.anchor || {ivar}.text}}</a>{_tail}'
                    f'{pad}{{({ivar}.label || {ivar}.term || '
                    f'{ivar}.anchor) && {ivar}.text && '
                    f'<p class="text-fluid-0">{{{ivar}.text}}</p>}}\n')
        if name == 'toggle':
            # chrome control, never copy: inside a flyout panel it
            # is the close affordance; in a header bar it is the
            # burger (N.flyout); elsewhere it opens .flyout.
            if seen.get('in_flyout'):
                _cls = 'nav-close' if cat == 'header' \
                    else 'flyout-close'
                _lbl = 'Close menu' if cat == 'header' else 'Close'
                return (f'{pad}<button class="{_cls}" type="button" '
                        f'aria-label="{_lbl}">×</button>\n')
            if cat == 'header':
                return (f'{pad}{{list.length > 0 && '
                        f'<button class="burger" type="button" '
                        f'aria-label="Menu" aria-expanded="false" '
                        f'aria-controls="wf-nav-links"><span '
                        f'aria-hidden="true">≡</span></button>}}\n')
            return (f'{pad}<button class="flyout-open" type="button" '
                    f'aria-label="Open panel" aria-expanded="false" '
                    f'aria-controls="wf-flyout"><span '
                    f'aria-hidden="true">≡</span></button>\n')
        if name == 'offcanvas':
            _ot = set()
            _subtree_names(el_id, _ot)
            # collections inside the panel bind `list` first (the
            # same items the desktop row shows — flyout mirrors the
            # bar), then `links` for the secondary groups
            seen['in_flyout'] = True
            inner = ''.join(render(c, depth + 1, ivar,
                                   in_card=in_card)
                            for c in children)
            seen.pop('in_flyout', None)
            if cat == 'header':
                close = ('' if 'toggle' in _ot else
                         f'{pad}  <button class="nav-close" '
                         'type="button" aria-label="Close menu">'
                         '×</button>\n')
                ncls = (c + ' nav-links nav-flyout') if c \
                    else 'nav-links nav-flyout'
                _x = (f'<button class="nav-close" type="button" '
                      f'aria-label="Close menu">×</button>')
                _head = (f'{pad}  <div class="nav-sheet-head">'
                         f'<span class="logo nav-sheet-brand">'
                         f'{{brand}}</span>{_x}</div>\n')
                # the header CTA has two homes: .nav-sheet-cta inside
                # the panel (visible only while open, docked at its
                # foot) and the bar-level .nav-cta the global rule
                # pins inline above the breakpoint (N.flyout)
                inner += (f'{pad}  {{act.label && '
                          f'<p class="nav-sheet-cta mt-fluid-m">'
                          f'<a class="wf-cta-button" '
                          f'href={{act.href}}>{{act.label}}'
                          f'</a></p>}}\n')
                out = (f'{pad}{{list.length > 0 && <nav class="{ncls}"'
                       f' aria-label="Primary">\n{_head}{inner}'
                       f'{pad}</nav>}}\n')
                if not seen.get('nav_cta'):
                    seen['nav_cta'] = True
                    out += (f'{pad}{{act.label && '
                            f'<p class="nav-cta mt-fluid-m">'
                            f'<a class="wf-cta-button" '
                            f'href={{act.href}}>{{act.label}}'
                            f'</a></p>}}\n')
                return out
            close = ('' if 'toggle' in _ot else
                     f'{pad}  <button class="flyout-close" '
                     'type="button" aria-label="Close">'
                     '×</button>\n')
            return (f'{pad}<div class="flyout" id="wf-flyout" '
                    f'role="dialog" '
                    f'aria-modal="true">\n{close}{inner}'
                    f'{pad}</div>\n')
        if name == 'nav-menu':
            # a wp nav-menu placeholder binds the plan's nav links —
            # .nav-links/.burger carry the machinery's mobile-nav
            # contract (hidden under the nav breakpoint, toggled by
            # the BaseLayout click handler; the wireframe menu id is
            # chrome, never copy)
            if not seen.get('top_list'):
                seen['top_list'] = True
            # every nav-menu binds the same plan links — a second menu
            # (topbar/utility row) would repeat them as another desktop
            # row (H.1, N.dup); the first menu is the primary nav
            if seen.get('nav_menu'):
                return ''
            seen['nav_menu'] = True
            if has_offcanvas:
                # the payload's offcanvas IS the mobile surface —
                # this menu is the desktop row (.nav-desk hides
                # under the burger breakpoint). The burger comes
                # from the payload's toggle; when the payload has
                # none the machinery emits it here (N.flyout).
                ncls = (c + ' nav-desk') if c else 'nav-desk'
                out = (f'{pad}{{list.length > 0 && <nav class="{ncls}"'
                       f' aria-label="Primary"><ul class="row '
                       f'gap-fluid-m list-plain">'
                       f'{{(navOver ? list.slice(0, navCut) : list)'
                       f'.map((it) => <li>'
                       f'<a class="nav-link" href={{it.href}}>'
                       f'{{it.label || it.term || it.title || '
                       f'it.text}}</a></li>)}}</ul></nav>}}\n')
                # N.select — links past the bar's budget open from
                # "More" (the offcanvas holds the full list)
                out += (f'{pad}{{navOver && <button class="nav-more" '
                        f'type="button" aria-label="More links" aria-expanded="false" '
                        f'aria-controls="wf-nav-links">More'
                        f'</button>}}\n')
                if not has_toggle:
                    out += (f'{pad}{{list.length > 0 && '
                            f'<button class="burger" type="button" '
                            f'aria-label="Menu" aria-expanded="false" '
                            f'aria-controls="wf-nav-links"><span aria-hidden='
                            f'"true">≡</span></button>}}\n')
                return out
            ncls = (c + ' nav-links') if c else 'nav-links'
            # the open drawer binds the exemplar's structure —
            # close, search block, a titled link group, numbered
            # rows — not a bare <ul> (N.flyout). Drawer furniture
            # hides on desktop (.nav-group is display:contents
            # there, so the same links keep the bar's row shape).
            # Nav selection rule (N.select): ≤6 items keep the inline
            # row + flyout; more items switch to the hybrid — the
            # first four links stay inline on desktop (.nav-priority),
            # the full set opens as a mega panel behind a "More"
            # trigger (.nav-links.nav-mega), burger still pinned in
            # its lane for small widths.
            _links = (f'{{grp.map((it, i) => <li>'
                      f'<a class="nav-link" href={{it.href}}>'
                      f'<span>{{it.label || it.term || it.title || '
                      f'it.text}}</span>'
                      f'<span class="nav-num" aria-hidden="true">'
                      f'{{String(list.indexOf(it) + 1)'
                      f'.padStart(2, \'0\')}}</span>'
                      f'</a></li>)}}')
            _search = (f'<form class="nav-search" role="search">'
                       f'<input class="nav-search-input" type="search" '
                       f'placeholder="Search" aria-label="Search site" />'
                       f'</form>')
            _close = (f'<button class="nav-close" type="button" '
                      f'aria-label="Close menu">×</button>')
            _head = (f'<div class="nav-sheet-head">'
                     f'<span class="logo nav-sheet-brand">{{brand}}</span>'
                     f'{_close}</div>')
            # the drawer docks the header CTA (.nav-cta hides below 60rem)
            _cta = (f'{{act.label && <p class="nav-sheet-cta mt-fluid-m">'
                    f'<a class="wf-cta-button" href={{act.href}}>'
                    f'{{act.label}}</a></p>}}')
            # group heads come from the IA itself: links bucket by
            # their top-level path segment and the head is that
            # segment titled — never a "Menu n" placeholder (E-B1)
            _groups = (f'{{Object.entries(list.reduce((g, it) => '
                       f'{{const s = (it.href || "")'
                       f'.replace(/^\\/+|\\/+$/g, "").split("/")[0]'
                       f' || "pages"; (g[s] = g[s] || []).push(it);'
                       f' return g;}}, {{}})).map(([seg, grp]) => ('
                       f'<div class="nav-group">'
                       f'<p class="nav-group-head">'
                       f'{{seg.replace(/-/g, " ")'
                       f'.replace(/\\b\\w/g, (c) => c.toUpperCase())}}'
                       f'</p>'
                       f'<ul class="row gap-fluid-m list-plain">'
                       + _links
                       + f'</ul></div>))}}')
            return (f'{pad}{{list.length > 0 && !navOver && '
                    f'<nav class="{ncls}" '
                    f'aria-label="Primary">{_head}{_search}'
                    f'<div class="nav-mega-cols">'
                    + _groups
                    + f'</div>{_cta}</nav>}}\n'
                    f'{pad}{{navOver && <nav '
                    f'class="{ncls} nav-mega" '
                    f'aria-label="Primary">{_head}{_search}'
                    f'<div class="nav-mega-cols">'
                    + _groups
                    + f'</div>{_cta}</nav>}}\n'
                    f'{pad}{{navOver && <Fragment><nav '
                    f'class="nav-priority nav-desk" '
                    f'aria-label="Primary">'
                    f'<ul class="row gap-fluid-m list-plain">'
                    f'{{list.slice(0, navCut).map((it) => <li>'
                    f'<a class="nav-link" href={{it.href}}>'
                    f'{{it.label || it.term || it.title || it.text}}'
                    f'</a></li>)}}</ul></nav>'
                    f'<button class="nav-more" type="button" '
                    f'aria-label="More links" aria-expanded="false" '
                    f'aria-controls="wf-nav-links">More</button>'
                    f'</Fragment>}}\n'
                    f'{pad}{{list.length > 0 && <button class="burger" '
                    f'type="button" aria-label="Menu" '
                    f'aria-expanded="false" '
                    f'aria-controls="wf-nav-links">'
                    f'<span aria-hidden="true">≡</span>'
                    f'</button>}}\n')
        if name == 'text-link' and not ivar:
            # a header's lone text-link IS the nav CTA slot (PS.7's
            # one primary action — exactly one binds per component);
            # elsewhere the wireframe label is copy the plan supplies
            # — the slot emits nothing
            if cat == 'header':
                if seen.get('nav_cta'):
                    return ''
                seen['nav_cta'] = True
                return (f'{pad}{{act.label && <p class="nav-cta mt-fluid-m">'
                        f'<a class="wf-cta-button" '
                        f'href={{act.href}}>'
                        f'{{act.label}}</a></p>}}\n')
            return ''
        if name in ('heading', 'text-basic', 'text'):
            raw = re.sub(r'</?(?:div|br|p)[^>]*>', ' ',
                         str(s.get('text') or s.get('content') or ''))
            txt = re.sub(r'\s+', ' ',
                         re.sub(r'<[^>]+>', '', raw)).strip()
            if ivar:
                # §4.3 items carry term/icon — the icon name is a
                # chip the CSS can glyph, the term is the label.
                # Item labels are never h1/h2: PS.1 binds ONE
                # heading to a block, so loop headings cap at h3 and
                # read at the card-title step, not section scale.
                if name == 'heading':
                    if tag in ('h1', 'h2'):
                        tag = 'h3'
                    cattr = cattr.replace('text-fluid-2',
                                          'text-fluid-1')
                    # a dedicated icon element in the same item owns
                    # the chip — the heading must not render it twice.
                    # The chip sits ABOVE the title, never inline in
                    # it — an icon inside the heading reads as stray
                    # glyph spacing, not the ring element.
                    if seen.get('ivar_head'):
                        # a second title slot in the same item (card
                        # meta / author row) binds the item's meta —
                        # never the title again
                        return (f'{pad}{{{ivar}.meta && <p class="meta '
                                f'text-fluid--1">{{{ivar}.meta}}</p>}}\n')
                    seen['ivar_head'] = True
                    if not seen.get('ivar_icon_el'):
                        return (f'{pad}{{{ivar}.icon && '
                                f'<IconChip name={{{ivar}.icon}} />}}\n'
                                f'{pad}<{tag}{cattr}>'
                                f'{{{ivar}.term || {ivar}.title}}'
                                f'</{tag}>\n')
                    txt = f'{{{ivar}.term || {ivar}.title}}'
                else:
                    if seen.get('ivar_tag'):
                        return ''
                    if seen.get('ivar_text'):
                        # a second body slot binds the item's tag
                        # (category / attribution) — never the body
                        # text twice; further body slots bind nothing
                        seen['ivar_tag'] = True
                        return (f'{pad}{{{ivar}.tag && <span class="tag '
                                f'text-fluid--1">{{{ivar}.tag}}</span>}}\n')
                    seen['ivar_text'] = True
                    txt = f'{{{ivar}.text}}'
                    # Q.2 — an item's first text slot inside a card
                    # IS its title when no heading slot exists: emit
                    # h3 (E.3 forbids h2 → h4 rank skips) so the card
                    # reads heading-then-body
                    if in_card and not seen.get('ivar_head'):
                        seen['ivar_head'] = True
                        # the title binds the item's term/label —
                        # `text` alone is the clause tail (a fragment
                        # like "multiplies them across the week" is
                        # body copy, never a heading); when a term
                        # led, the verbatim tail follows as the card
                        # body so every card reads title-then-body
                        # title + body stack in ONE column — a
                        # flat emit inside a row container (status
                        # pill, list item) splayed title and body
                        # side-by-side (render defect: heading and
                        # clause looked like two columns)
                        return (f'{pad}{{{ivar}.icon && '
                                f'<IconChip name={{{ivar}.icon}} />}}\n'
                                f'{pad}<div class="stack">\n'
                                f'{pad}  <h3 class="text-fluid-1">'
                                f'{{{ivar}.term || {ivar}.title || '
                                f'{ivar}.text}}</h3>\n'
                                f'{pad}  {{{ivar}.text && '
                                f'({ivar}.term || {ivar}.title) && '
                                f'<p class="text-fluid-0">'
                                f'{{{ivar}.text}}</p>}}\n'
                                f'{pad}</div>\n')
            elif name == 'heading' and not seen['h'] and txt:
                seen['h'] = True
                if tag in ('h1', 'h2'):
                    return f'{pad}{_ranked_head(cattr)}\n'
                return (f'{pad}{{head && <{tag}{cattr}>'
                        f'{{head}}</{tag}>}}\n')
            elif name in ('text-basic', 'text') and \
                    not seen['p'] and txt and len(txt) > 30:
                seen['p'] = True
                # §4.3 — `before` paragraphs ride the answer slot
                return (f'{pad}{{sub && <{tag}{cattr} '
                        f'set:html={{inline(sub)}} />}}\n'
                        f'{pad}{{before.map((p) => <p class="mt-flow '
                        f'text-fluid-0" set:html={{inline(p)}} />)}}\n')
            elif not ivar:
                # the payload's own copy is wireframe label text
                # ("TAGLINE", "Call to action") — the bank supplies
                # structure, the plan supplies words (SB.5)
                return ''
            href = ' href="#"' if name == 'text-link' else ''
            return f'{pad}<{tag}{cattr}{href}>{txt}</{tag}>\n'
        if name == 'icon':
            if ivar:
                # the item heading already inlines the chip — a
                # standalone icon element would render a duplicate
                # chip at the BOTTOM of the card (M2 defect: the
                # card pattern carries the icon first/top only)
                return ''
            return ''
        if name == 'counter':
            # the stat figure binds the item's stat/term — the
            # payload's own countTo is wireframe text (F.1)
            if ivar:
                # the stat card's figure/label is its title — an
                # h3 so the card reads heading-then-body (Q.2)
                seen['ivar_head'] = True
                return (f'{pad}<h3{cattr}>{{{ivar}.stat || '
                        f'{ivar}.term || {ivar}.title}}</h3>\n')
            return ''
        if name == 'divider':
            return f'{pad}<hr{cattr} />\n'
        # a declared list element (ul/ol) IS a collection: its <li>
        # children carry per-row class ids, so same-sig run detection
        # under-counts real lists — the first child is the item
        # template, every row maps the copy collection (SB.5)
        _ltag = str(s.get('tag') or '')
        if _ltag == 'custom':
            _ltag = str(s.get('customTag') or '')
        if _ltag in ('ul', 'ol') and children:
            # the list element's own class may already be the grid
            # (gridcard-1-grid-ul declares the tracks) — wrapping the
            # map in a second grid div fills one track and leaves the
            # rest a dead column (L.15)
            _own_grid = any(
                p == 'display' and 'grid' in str(v)
                or str(p).startswith('grid-template')
                for _i in _classes_of(el)
                for p, v in (rules.get(gc_names.get(_i)) or []))
            if cat == 'header' and not ivar \
                    and not seen.get('in_flyout'):
                return _as_nav(depth)
            if ivar:
                coll, var = f'({ivar}.items || [])', ivar + '2'
            elif seen.get('in_flyout'):
                if seen.get('flyout_list'):
                    coll, var = 'links', 'it'
                else:
                    seen['flyout_list'] = True
                    coll, var = 'list', 'it'
            elif seen.get('top_list'):
                coll, var = 'links', 'it'
            else:
                seen['top_list'] = True
                coll, var = 'list', 'it'
            _itnames = set()
            _subtree_names(children[0], _itnames)
            seen['ivar_icon_el'] = 'icon' in _itnames
            seen['ivar_head'] = False
            seen['ivar_text'] = False
            seen['ivar_tag'] = False
            _item = render(children[0], depth + 3, var,
                           card=cat not in ('header', 'footer'))
            seen.pop('ivar_icon_el', None)
            seen.pop('ivar_head', None)
            seen.pop('ivar_text', None)
            seen.pop('ivar_tag', None)
            if _item.strip():
                if _own_grid:
                    out = (f'{pad}{{{coll}.length > 0 && <div{cattr}>'
                           f'{{({coll} || []).map(({var}) => (\n'
                           + _frag(_item, pad)
                           + f'{pad}    ))}}'
                           f'</div>}}\n')
                else:
                    _wrap = ('nav-group' if seen.get('in_flyout')
                             else 'row gap-fluid-m'
                             if cat in ('header', 'footer')
                             else 'grid-auto gap-fluid-m')
                    # the guard wraps the whole element — an empty list
                    # leaves no dead grid wrapper in the DOM (L.15)
                    out = (f'{pad}{{{coll}.length > 0 && <div{cattr}>\n'
                           f'{pad}  <div class="{_wrap}">'
                           f'{{({coll} || []).map(({var}) => (\n'
                           + _frag(_item, pad)
                           + f'{pad}    ))}}'
                           f'</div>\n' + f'{pad}</div>}}\n')
                if coll == 'links' and cat == 'footer':
                    # the legal line is a sibling of the guarded list
                    # — inside the guard it never renders when links
                    # is empty, which is exactly when PS.10 needs it
                    out += (f'{pad}{{links.length === 0 && '
                            f'<p class="footer-legal-nav text-fluid-0">Copyright '
                            f'{{new Date().getFullYear()}} '
                            f'{{brand}}</p>}}\n')
                return out
        inner = ''
        _guard = None
        _static = False
        _parts = 0
        for run, count in seq:
            if count >= 3 or (cat in ('header', 'footer')
                              and count >= 2):
                # nested repeats iterate the parent's row: it.items;
                # the collection guards its grid so an empty list
                # leaves no dead column in the DOM (L.15)
                if cat == 'header' and not ivar \
                        and not seen.get('in_flyout'):
                    sub = _as_nav(depth + 1)
                    if sub.strip():
                        inner += sub
                        _parts += 1
                        _static = True
                    continue
                if ivar:
                    coll, var = f'({ivar}.items || [])', ivar + '2'
                elif seen.get('in_flyout'):
                    # inside a flyout panel the first collection is
                    # the nav items again; later ones (contact,
                    # socials) bind `links` as .nav-group sections
                    if seen.get('flyout_list'):
                        coll, var = 'links', 'it'
                    else:
                        seen['flyout_list'] = True
                        coll, var = 'list', 'it'
                elif seen.get('top_list'):
                    # a second top-level collection (footers carry a
                    # legal nav beside the menu) binds the copy slot's
                    # links — re-emitting `list` would duplicate the
                    # sitemap
                    coll, var = 'links', 'it'
                else:
                    seen['top_list'] = True
                    coll, var = 'list', 'it'
                _wrap = ('nav-group' if seen.get('in_flyout')
                         else 'row gap-fluid-m'
                         if cat in ('header', 'footer')
                         else 'grid-auto gap-fluid-m')
                _itnames = set()
                _subtree_names(run[0], _itnames)
                seen['ivar_icon_el'] = 'icon' in _itnames
                seen['ivar_head'] = False
                seen['ivar_text'] = False
                seen['ivar_tag'] = False
                _item = ''.join(render(r, depth + 3, var,
                                       card=cat not in ('header',
                                                        'footer'))
                                for r in run[:1])
                seen.pop('ivar_icon_el', None)
                seen.pop('ivar_head', None)
                seen.pop('ivar_text', None)
                seen.pop('ivar_tag', None)
                if not _item.strip():
                    continue   # an item template that emits nothing
                    # is not a loop — nothing to guard or render
                _q = next(((els.get(r) or {}).get('settings', {})
                           .get('query') for r in run
                           if (els.get(r) or {}).get('settings', {})
                           .get('query')), None)
                if cat == 'blog' and _q:
                    # a post card always reads title, author · date ·
                    # read time and its category — the dynamic-data
                    # slots ({post_title}, {author_name}, terms) the
                    # Bricks query loop rendered
                    _ip, _need = pad + '      ', ''
                    if f'{var}.term' not in _item:
                        _need += (f'{_ip}<h3 class="text-fluid-1">'
                                  f'{{{var}.term || {var}.title}}</h3>\n')
                    if f'{var}.meta' not in _item:
                        _need += (f'{_ip}{{{var}.meta && <p class="meta '
                                  f'text-fluid--1">{{{var}.meta}}</p>}}\n')
                    if f'{var}.tag' not in _item:
                        _need += (f'{_ip}{{{var}.tag && <span class="tag '
                                  f'text-fluid--1">{{{var}.tag}}</span>}}\n')
                    if _need:
                        _cut = _item.rstrip('\n').rfind('\n') + 1
                        _item = _item[:_cut] + _need + _item[_cut:]
                _guard = _guard or f'{coll}.length > 0'
                _parts += 1
                inner += (f'{pad}  {{{coll}.length > 0 && '
                          f'<div class="{_wrap}">'
                          f'{{({coll} || []).map(({var}) => (\n'
                          + _frag(_item, pad)
                          + f'{pad}    ))}}'
                          f'</div>}}\n')
                try:
                    _ppp = int((_q or {}).get('posts_per_page') or 0)
                except (TypeError, ValueError):
                    _ppp = 0
                if cat == 'blog' and _ppp >= 4 and not any(
                        e.get('name') == 'pagination'
                        for e in els.values()):
                    # an archive query of 4+ posts pages — the loop
                    # the Bricks archive query paginates
                    seen['paged'] = True
                    inner += (f'{pad}  {{{coll}.length > 0 && '
                              f'{_PAGINATION}}}\n')
                if coll == 'links' and cat == 'footer':
                    # the legal nav is empty until the copy slot
                    # ships privacy/terms — PS.10 still wants a legal
                    # line, so the mark falls back to the copyright
                    if _guard == 'links.length > 0':
                        _guard = 'links.length >= 0'
                    inner += (f'{pad}  {{links.length === 0 && '
                              f'<p class="footer-legal-nav text-fluid-0">Copyright '
                              f'{{new Date().getFullYear()}} '
                              f'{{brand}}</p>}}\n')
            else:
                for r in run:
                    sub = render(r, depth + 1, ivar, in_card=in_card)
                    if not sub.strip():
                        continue
                    _parts += 1
                    g = _whole_cond(sub)
                    if g:
                        _guard = _guard or g
                    else:
                        _static = True
                    inner += sub
        if name == 'form':
            out = (f'{pad}<form{cattr} novalidate>\n{inner}'
                   f'{_form_fields(s, cat, pad + "  ")}{pad}</form>\n')
        elif inner:
            out = f'{pad}<{tag}{cattr}>\n{inner}{pad}</{tag}>\n'
        else:
            # a container whose entire payload emitted nothing
            # collapses — a media column after its image lifts out,
            # a loop with an empty template, wireframe-only chrome:
            # no dead half-columns in the DOM (L.15). An unbound LEAF
            # prunes the same way: an empty shell still stretches its
            # grid/flex row into a dead column (M2)
            return ''
        # wholly-conditional payloads propagate their guard upward: a
        # wrapper around a single conditional child is conditional too
        if _guard and not _static and _parts == 1:
            return f'{pad}{{{_guard} && ' + out + f'{pad}}}\n'
        return out

    roots = [e['id'] for e in payload.get('content') or []
             if not e.get('parent')]
    # the root element's classes sit directly inside the section
    # shell's .sec-inner — band + shell own outer rhythm (SB.2), so
    # their padding/margin decls are stripped at serialization
    root_names = set()
    for _e in payload.get('content') or []:
        if not _e.get('parent'):
            root_names.update(_classes_of(_e))
    body = ''.join(render(r, 1) for r in roots)
    if cat == 'header' and 'brand-mark' not in body:
        # a skeleton with no logo slot gets the brand as the FIRST item
        # of its bar row — never a stray line above it (H.1 one row)
        bar = re.search(r'^( *)<div class="[^"]*\brow between\b[^"]*">\n',
                        body, re.M)
        if bar:
            at = bar.end()
            body = (body[:at] + bar.group(1)
                    + '  <span class="logo brand-mark">{brand}</span>\n'
                    + body[at:])
        else:
            body = (f'  <span class="logo brand-mark">{{brand}}</span>\n'
                    + body)
    if cat == 'header':
        # the bar's CTA sits on the row's centre line — the prose
        # block-start margin belongs to body copy, not chrome (H.1)
        body = body.replace('<p class="nav-cta mt-fluid-m">',
                            '<p class="nav-cta">').replace(
            '<p class="mt-fluid-m"><a class="wf-cta-button"',
            '<p class="nav-cta"><a class="wf-cta-button"')
        # the burger is the LAST child of the bar row (E-M2): when a
        # CTA lane precedes it the trigger sat mid-row at tablet
        # widths. Moving the emit, not just the CSS, keeps the
        # pin under every flex order the bank ships.
        _bg = re.search(
            r'[ \t]*(?:\{list\.length > 0 && )?<button class="burger"'
            r'.*?</button>\}?\}?\n?', body, re.S)
        _bar = re.search(
            r'^( *)<div class="[^"]*\brow between\b[^"]*">\n', body, re.M)
        if _bg and _bar:
            btxt = _bg.group(0)
            body = body[:_bg.start()] + body[_bg.end():]
            # re-find the bar opener on the shrunken body — a burger
            # that preceded it shifted its offsets (header-8)
            _bar = re.search(
                r'^( *)<div class="[^"]*\brow between\b[^"]*">\n',
                body, re.M)
            # find the bar container's matching close: depth walk from
            # the opener so the trigger lands inside, not after it
            depth, pos = 0, _bar.end()
            for m in re.finditer(r'<div\b|</div>', body[pos:]):
                depth += 1 if m.group(0) == '<div' else -1
                if depth < 0:
                    close_at = pos + m.start()
                    body = (body[:close_at] + btxt.rstrip('\n')
                            + '\n' + body[close_at:])
                    break
    # §4.3 heading fallback — a pure-collection skeleton (grid of
    # cards, list of links) has no section-heading slot; the block's
    # h2 is still copy that must render (F.1, PS.8). Chrome rows
    # (header/footer) skip every prose fallback: an h2/lede rendered
    # inside the bar breaks the chrome (user-visible nav defect).
    if '{head && ' not in body and cat not in ('header', 'footer'):
        body = f'  {_ranked_head("")}\n' + body
    # §4.3 fallback — a skeleton without a long-text slot still
    # renders the answer + before paragraphs (verbatim, F.1), placed
    # right after the heading emit when one exists
    if 'sub &&' not in body and cat not in ('header', 'footer'):
        sub_blk = ('  {sub && <p class="mt-stack lede" '
                   'set:html={inline(sub)} />}\n'
                   '  {before.map((p) => <p class="mt-flow '
                   'text-fluid-0" set:html={inline(p)} />)}\n')
        hm = re.search(r'^(\s*)\{head && (?:\(h1 \? )?<h', body, re.M)
        if hm:
            eol = body.index('\n', hm.end()) + 1
            # the h2 emit may sit inside a collapsed `{head && <div>…}`
            # wrapper — the answer slot isn't bound to `head`, so it
            # lands after the line that closes that wrapper, not inside.
            # `head` emits exactly once: a non-leaf `{head &&` line is
            # the wrapper opener, and the leaf is nested in it.
            nested = re.search(r'^\s*\{head && (?!<h|\(h1 \? <h)',
                               body[:hm.start()], re.M)
            if nested:
                depth = 0
                while eol < len(body):
                    nl = body.index('\n', eol)
                    nl = nl + 1 if nl >= 0 else len(body)
                    seg = body[eol:nl]
                    depth += seg.count('{') - seg.count('}')
                    eol = nl
                    if depth < 0:
                        break
            body = body[:eol] + sub_blk + body[eol:]
        else:
            body = sub_blk + body
    # prose rhythm — a `before` paragraph run emitted INSIDE the
    # bank's `.intro` inherits the intro's column gap (a heading-block
    # gap, section-scale on this design: 'every block of text is
    # SEPARATE'). The run moves out of .intro into a .flow sibling —
    # paragraph spacing becomes flow-spacing and the heading block
    # keeps its authored gap. Only fires when the run is the intro's
    # last child (the close tag right after it).
    def _outdent(m):
        close_pad = m.group(2)
        return (f'{close_pad}</div>\n'
                f'{close_pad}{{before.length > 0 && <div class="flow mt-stack">\n'
                f'{m.group(1)}'
                f'{close_pad}</div>}}\n')
    body = re.sub(
        r'(\{before\.map\(\(p\) => <p class="mt-flow text-fluid-0" '
        r'set:html=\{inline\(p\)\} />\)\}\n)'
        # never when that </div> closes a `{cond && <div>` wrapper —
        # a sibling after the element inside `{…}` is not JSX
        r'(\s+)</div>(?![ \t]*\n(?:[ \t]*\n)*[ \t]*\})',
        _outdent, body)
    # V.8 lift — a bound image that sat inside a per-item loop becomes
    # the media cell of the gold split shape (SB.5): copy in the stack
    # column, media beside it. A bare figure inside the bank's centred
    # .intro column shrinks to zero width; the wrapper itself must not
    # exist when no image binds — an empty fr track squashes the text
    # column, so 'split' only classes the wrap when image is bound.
    if seen.get('loop_img') and '<Image' not in body:
        body = ('  <div class={image && image.src ? \'split\' : '
                'undefined}>\n'
                '    <div class="stack">\n' + body +
                '    </div>\n'
                '    {image && image.src && '
                '<div class="media-round" '
                'data-ratio={image.ratio || null}>'
                '<Image src={mediaSrc || image.src} '
                'alt={image.alt || \'\'} widths={[480, 960, 1440]} '
                'sizes="(min-width: 48rem) 50vw, 100vw" '
                'width={900} height={600} loading="lazy" />'
                '</div>}\n'
                '  </div>\n')
    # §4.3 tail — qa/links/after paragraphs close every copy-bound
    # section, after the skeleton's own structure (COPY_BLOCK_KEYS
    # order: items → qa → links → after)
    if cat != 'header' and 'list.map' not in body and \
            'list || []).map' not in body:
        # the payload's shape hid the items loop (nested ol/li,
        # js-driven widget) — the copy slot's items still render
        # verbatim as a term/definition list (F.1)
        body += ('  {list.length > 0 && <dl class="mt-stack list-plain '
                 'flow-list">'
                 '{list.map((it) => <div class="flow-row">'
                 '{it.icon && <IconChip name={it.icon} />}'
                 '<dt class="text-fluid-0" '
                 'set:html={inline(it.term || it.title || it.label '
                 '|| \'\')} />'
                 '{it.text && <dd class="text-fluid-0" '
                 'set:html={inline(it.text)} />}'
                 '</div>)}</dl>}\n')
    if cat != 'header':
        # paragraph runs flow as prose — a plain .flow block keeps
        # flow-spacing between them instead of the root column's
        # sibling gap (user-visible 'every block spaced like a
        # section' defect); mt-stack separates the run from the
        # structure above it
        body += (
        '  {qas.length > 0 && <dl class="mt-stack">'
        '{qas.map((qa) => <>'
        '<dt class="text-fluid-0" set:html={inline(qa.q)} />'
        '<dd class="text-fluid-0" set:html={inline(qa.a)} />'
        '</>)}</dl>}\n'
        '  {links.length > 0 && <div class="flow mt-stack">'
        '{links.map((l) => <p class="text-fluid-0" '
        'set:html={inline(l.text || `[${l.anchor}](${l.href})`)} />)}'
        '</div>}\n'
        '  {after.length > 0 && <div class="flow mt-stack">'
        '{after.map((p) => <p class="text-fluid-0" '
        'set:html={inline(p)} />)}</div>}\n'
        '  {tel && <p class="mt-stack"><a class="link-quiet" '
        'href={tel}>{phone}</a></p>}\n')

    style = ''
    style = ''
    if rules:
        decl = []
        # shells own layout, never rhythm: padding (and margin on a
        # root class) on a container/content/wrapper/intro/inner/grid
        # class duplicates the band's padding and the shell's gutter
        # — the *inner* box model, cards and buttons keep theirs.
        _SHELL = re.compile(r'(?:^|[-_])(container|content|wrapper|'
                            r'intro|inner|grid)(?:$|[-_])')
        for _name, _props in rules.items():
            _props = [(p, v) for p, v in _props
                      if p in TOPOLOGY]
            if not _props:
                continue
            _bound = [_topo_bind(p, v) for p, v in _props]
            # Q.4 — every flex/grid container separates siblings: a
            # skeleton that spaces via margins/justify loses them in
            # the topology cut, so inject the system's gap default
            _is_flexgrid = any(
                p == 'display' and re.search(r'flex|grid', str(v))
                for p, v in _bound)
            if _is_flexgrid and not any(
                    p in ('gap', 'row-gap', 'column-gap')
                    for p, _v in _bound):
                # collections space at the grid rung; interior flex
                # containers (chip+label rows, title stacks) space at
                # the small rung — a section-scale gap between icon
                # and title reads as the M2 'everything is separate'
                # defect
                _is_grid = any(
                    p == 'display' and 'grid' in str(v)
                    for p, v in _bound)
                _bound.append(('gap', 'var(--grid-gap)' if _is_grid
                               else 'var(--space-s)'))
            _lines = [f'    {p}: {v};' if v is not None else f'    {p}'
                      for p, v in _bound]
            decl.append(f'  .{_name} {{\n' + '\n'.join(_lines) + '\n  }')
        # _cssCustom raw blocks are collected but never emitted —
        # topology-only bank css carries no bespoke rules
        style = '\n\n'.join(decl) + '\n'
        # G.5 — collections never carry a fixed track count: any
        # repeat(N|Nfr …) or ≥4-literal-fr track the payload declared
        # collapses to the auto-fit minmax form. The floor/cap are
        # locals so a section's declared columns (data-cols → G.8)
        # tightens the track count without touching the canon.
        style = re.sub(
            r'grid-template-columns:\s*repeat\(\s*(?:\d+|\d+fr)[^;]*;',
            'grid-template-columns: ' + AUTO_TRACKS + ';', style)
        style = re.sub(
            r'grid-template-columns:\s*(?:[\d.]+fr\s+){3,}[\d.]+fr\s*;',
            'grid-template-columns: ' + AUTO_TRACKS + ';', style)
        # viewport safety — a definite width sets the grid item's
        # min-content, so the fr track sizes to 60ch and overflows the
        # cell; max-width caps the column without forcing the track
        style = re.sub(r'width:\s*var\(--measure\)\s*;',
                       'max-width: var(--measure);', style)
        # a --section-space-* var is vertical section padding — used
        # inline (same var on all 4 sides) it outgrows the gutter
        # (cta-10-content: 280px inline pad inside a 360px viewport)
        style = re.sub(
            r'padding:\s*(var\(--section-space-\w+\))(?:\s+\1){3}\s*;',
            r'padding-block: \1; padding-inline: var(--gutter);', style)
        # every multi-track grid / flex row collapses under 44rem —
        # the payload's desktop split must never overflow a phone.
        # Header chrome is exempt: the bar stays a row so brand +
        # burger hold one line.
        def _tracks(v):
            depth, cur, out = 0, '', []
            for ch in v:
                if ch == '(':
                    depth += 1
                elif ch == ')':
                    depth -= 1
                if ch in ' \t' and depth == 0:
                    if cur:
                        out.append(cur)
                        cur = ''
                else:
                    cur += ch
            if cur:
                out.append(cur)
            return out
        _mq_g, _mq_f = [], []
        for _cm in re.finditer(r'\.([\w-]+)\s*\{([^{}]*)\}', style):
            _c, _b = _cm.group(1), _cm.group(2)
            _gm = re.search(r'grid-template-columns:\s*([^;]+);', _b)
            if _gm and not _gm.group(1).strip().startswith(
                    'repeat(auto-fit') and len(_tracks(
                        _gm.group(1).strip())) >= 2:
                _mq_g.append(_c)
                continue
            if cat != 'header' and not re.search(
                    r'flex-direction:\s*column', _b) and (
                    re.search(r'display:\s*flex', _b) or
                    re.search(r'flex-direction:\s*row', _b)):
                _mq_f.append(_c)
        if _mq_g or _mq_f:
            style += ('\n  @media (max-width: 44rem) {\n'
                      + ''.join(f'    .{c} {{ grid-template-columns: '
                                f'1fr; }}\n' for c in _mq_g)
                      + ''.join(f'    .{c} {{ flex-direction: column; '
                                f'}}\n' for c in _mq_f) + '  }\n')
        # a multi-track grid whose optional sibling was dropped by
        # copy leaves its lone child stranded in the first track
        # (counter-1-content without a CTA box) — an only child
        # spans the row
        for _c in _mq_g:
            style += (f'  .{_c} > :only-child {{ grid-column: '
                      f'1 / -1; }}\n')
        style = _scope_css(style, f'.wf-{stem}')
        if '--acss-' in style:      # never ship an unresolved var
            raise SystemExit(f'{stem}: unresolved ACSS var in emitted css')

    comp = camel('bm-' + stem)
    _has_media = '<Image' in body
    _has_chip = '<IconChip' in body
    src = (f'---\n/**\n * bm-{stem} — TRANSLATED Bricksmaven skeleton.\n'
           ' * Produced by bricks_translate.py from the ACSS payload\n'
           f' * beside this file ({stem}.json). Bank source, NOT a gold\n'
           ' * exemplar: the SOP adapts props/copy/rhythm before\n'
           ' * canonising (SB.5). Unmapped ACSS vars surface as\n'
           ' * var(--acss-*) and are listed in the translate report.\n'
           ' */\n'
           'interface Props {\n'
           '  brand?: string;\n'
           '  heading?: string;\n'
           '  fs?: string;\n'
           '  cta?: { label: string; href: string };\n'
           '  items?: { title?: string; text?: string; term?: string;\n'
           '             label?: string; href?: string;\n'
           '             icon?: string; items?: any[] }[];\n'
           '  image?: { src: string; alt: string };\n'
           '  images?: { src: string; alt: string }[];\n'
           '  copy?: any;\n'
           '  h1?: boolean;\n'
           '}\n'
           "import { inline } from '../_shared/inline';\n"
           + (("import IconChip from '../_shared/IconChip.astro';\n")
              if _has_chip else '')
           + (("import { Image } from 'astro:assets';\n")
              if _has_media else '')
           + 'const {\n'
           "  brand = 'Brand',\n"
           "  heading = '',\n"
           "  fs = '',\n"
           "  cta = { label: '', href: '#' },\n"
           '  items = [],\n'
           '  image,\n'
           '  images = [],\n'
           '  copy,\n'
           '  h1 = false,\n'
           '} = Astro.props;\n'
           '// §4.3 — a copy slot binds verbatim article copy onto\n'
           "// the skeleton's native props (F.1 — nothing dropped)\n"
           'const cp = copy || {};\n'
           'const head = cp.heading || heading;\n'
           'const sub = cp.answer || cp.text || fs;\n'
           'const before = cp.before || [];\n'
           'const list = (cp.items && cp.items.length\n'
           '  ? cp.items : items) || [];\n'
           '// N.select — the desktop bar keeps the leading links whose\n'
           '// labels fit its budget; the rest open behind "More"\n'
           "const _lbl = (it) => String(it.label || it.term || it.title "
           "|| it.text || '');\n"
           'const navFit = (() => { let w = 0, n = 0;\n'
           '  for (const it of list) { w += _lbl(it).length + 2;\n'
           '    if (w > 56) break; n++; }\n'
           '  return n; })();\n'
           'const navOver = list.length > 6 || navFit < list.length;\n'
           'const navCut = Math.max(1, Math.min(navFit, 4));\n'
           'const qas = cp.qa || [];\n'
           'const links = cp.links || [];\n'
           'const after = cp.after || [];\n'
           'const act = cp.cta || cta;\n'
           'const phone = cp.phone || \'\';\n'
           "const tel = phone ? 'tel:' + "
           "phone.replace(/[^0-9+]/g, '') : '';\n"
           + (("// V.8/P.12 — rasters resolve through src/assets/media/"
               "\n// so <Image> compiles AVIF/WebP srcsets\n"
               "const _media = import.meta.glob('../assets/media/"
               "*.{jpg,jpeg,png,webp}', { eager: true });\n"
               "const _mn = image ? String(image.src).split('/').pop()"
               " : null;\n"
               "const mediaSrc = _mn ? (_media[`../assets/media/"
               "${_mn}`]?.default ?? null) : null;\n"
               "const mediaOf = (m) => _media[`../assets/media/"
               "${String(m.src).split('/').pop()}`]?.default ?? m.src;\n")
              if _has_media else '')
           + f'---\n\n<div class="wf-{stem}">\n' + body + '</div>\n')
    # no vendor class names in emitted docs: the skeleton's own
    # bm-*/{stem}-* tokens become wf-* — markup and scoped css must
    # rename together or the layout declarations unbind
    for _a, _b in (('bm-', 'wf-'), (f'{stem}-', f'wf-{stem}-')):
        src = re.sub(rf'(?<![\w-]){re.escape(_a)}', _b, src)
        style = re.sub(rf'(?<![\w-]){re.escape(_a)}', _b, style)
    # residual vendor stems — payload markup abbreviates its stem
    # inside class names (how-it-works-14 → hworks-14-*, gridcard-1-*,
    # cta-10-*, conparison-1-* …): any surviving letter-run+digits
    # token gets the wf- prefix so no vendor naming leaks
    _stem_pat = re.compile(
        r'(?<![\w-])(?!wf-)[a-z][a-z0-9]*-\d+(?=[-_])')
    src = _stem_pat.sub(lambda m: 'wf-' + m.group(0), src)
    style = _stem_pat.sub(lambda m: 'wf-' + m.group(0), style)
    return src, {'stem': stem, 'rules': 0, 'css': style,
                 'unmapped_vars': sorted(unmapped)}


def _ranked_head(cattr):
    """The block heading's rank is the ROW's, not the payload's: the
    page binds exactly one h1 (the hero row's `h1` prop), every other
    block heading is an h2 — a bank payload tagged h1 in a contact
    band must not mint a second h1, an h2-tagged hero must not leave
    the page with none."""
    m = re.search(r'class="([^"]*)"', cattr or '')
    keep = ' '.join(c for c in (m.group(1).split() if m else [])
                    if not c.startswith('text-fluid-'))
    k = (' ' + keep) if keep else ''
    return (f'{{head && (h1 ? <h1 class="text-fluid-4{k}">{{head}}</h1>'
            f' : <h2 class="text-fluid-2{k}">{{head}}</h2>)}}')


def _frag(item, pad):
    """A map callback returns ONE element: an item template with two or
    more top-level siblings (or a bare `{…}` root) rides a fragment,
    else esbuild rejects the compiled arrow."""
    lines = [ln for ln in item.split('\n') if ln.strip()]
    if not lines:
        return item
    ind = min(len(ln) - len(ln.lstrip()) for ln in lines)
    tops = [ln.lstrip() for ln in lines
            if len(ln) - len(ln.lstrip()) == ind
            and not ln.lstrip().startswith('</')]
    # a lone `{cond && …}` root is an expression, not an element — the
    # arrow would return an object literal; it needs the fragment too
    if len(tops) < 2 and not (tops and tops[0].startswith('{')):
        return item
    return f'{pad}    <>\n' + item + f'{pad}    </>\n'


def iter_payloads(limit=None):
    files = []
    for cat in sorted(os.listdir(BANK)):
        d = os.path.join(BANK, cat)
        if not os.path.isdir(d):
            continue
        for fn in sorted(os.listdir(d)):
            if fn.endswith('.json') and '.topo.' not in fn:
                files.append(os.path.join(d, fn))
    return files[:limit] if limit else files


def main(argv):
    args = argv[1:]
    if '--all' in args:
        lim = None
        if '--limit' in args:
            lim = int(args[args.index('--limit') + 1])
        files = iter_payloads(lim)
    else:
        files = [a for a in args if a.endswith('.json')]
    if not files:
        print(__doc__)
        return 2
    total, fails, unmapped_all = 0, 0, {}
    for f in files:
        try:
            d = json.load(open(f))
            if not isinstance(d, dict) or 'content' not in d:
                continue
        except Exception:
            continue
        stem = os.path.splitext(os.path.basename(f))[0]
        src, rep = translate(d, stem)
        out = os.path.splitext(f)[0] + '.astro'
        with open(out, 'w', encoding='utf-8') as fh:
            fh.write(src)
        with open(os.path.splitext(f)[0] + '.css', 'w',
                  encoding='utf-8') as fh:
            fh.write(rep.get('css') or '')
        total += 1
        for v in rep['unmapped_vars']:
            unmapped_all[v] = unmapped_all.get(v, 0) + 1
    print(f'translated {total} payloads → .astro + .css beside each')
    if unmapped_all:
        print('unmapped ACSS vars (surfaced as var(--acss-*)):')
        for v, c in sorted(unmapped_all.items(),
                           key=lambda x: -x[1])[:30]:
            print(f'  var(--{v}) ×{c}')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv))
