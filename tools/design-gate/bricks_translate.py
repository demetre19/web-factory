#!/usr/bin/env python3
"""bricks_translate.py — Bricksmaven ACSS-JSON → .astro section source.

The Bricksmaven payload (wp-login-harvested `item-*.json` /
`<name>-<n>.json` under templates/skeletons/bricksmaven/<cat>/)
carries a flat Bricks element list plus `globalClasses` with ACSS
settings. This translates both into one self-contained Astro
skeleton per payload, banked next to the payload as `<stem>.astro`:

  element tree  → JSX markup (section/container shells dropped —
                  Section.astro owns those, SB.2)
  globalClasses → embedded <style is:global> in @layer components
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
# ACSS → emitted token layer. Values verified against
# emit_global/global.css output (--fs-*, --space-*, --r-card,
# --color-* roles, --content-width, --measure, --flow-spacing).
EXACT = {
    'space-xs': 'space-xs', 'space-s': 'space-s',
    'space-m': 'space-m', 'space-l': 'space-l',
    'space-xl': 'space-xl', 'space-xxl': 'section-space-xxl',
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
    m = re.match(r'grid-(\d+)(?:-(\d+))?$', name)
    if m:      # ACSS grid fractions: --grid-2 → 50%
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
        if t and not t.startswith('GRID:') and not t.startswith(
                'MIX:'):
            return f'MIX:{t}:{pct}'
        return 'bg-subtle'
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
    return out


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
            return ('repeat(auto-fit, minmax(min(var(--grid-min), '
                    '100%), 1fr))')
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
            # raw css (keyframes, descendant selectors) — emit at
            # @layer top level, translated but verbatim-shaped
            if raw is not None:
                raw.append(translate_value(str(val), unmapped))
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


def translate(payload, stem):
    """payload dict → (astro_src, report dict)."""
    els = {e['id']: e for e in payload.get('content') or []}
    gc_names = {g.get('id'): g.get('name')
                for g in payload.get('globalClasses') or []}
    unmapped = set()
    rules, raw_css = classes_css(payload, unmapped)
    seen = {'h': False, 'p': False, 'btn': False}   # first heading→
                                    # {heading}, first paragraph→{fs}

    cat = stem.split('-')[0]

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
            # chrome reads as a bar, not a stack
            if cat == 'header' and len(kids) >= 2:
                role = 'row between'
            if cat == 'footer' and len(kids) >= 2:
                role = 'row between'
        return ' '.join(x for x in (skel, role) if x)

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

    def render(el_id, depth, ivar=None, card=False):
        el = els.get(el_id)
        if not el:
            return ''
        pad = '  ' * depth
        name = el.get('name')
        s = el.get('settings') or {}
        children = el.get('children') or []

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
                    _body = ''.join(render(children[i], depth + 3, 'it')
                                    for i in range(_k))
                    return (f'{pad}<div class="grid-auto gap-fluid-m">\n'
                            f'{pad}  {{items.map((it) => (\n'
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
            inner = ''.join(render(c, depth + 1, ivar) for c in children)
            return (f'{pad}<div class="sec-inner">\n{inner}'
                    f'{pad}</div>\n')

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
            inner = "{cta.label || 'Continue'}" if txt and not ivar else \
                (f'{{{ivar}.label}}' if ivar else 'Action')
            # the wrapper keeps the inline-block button from being
            # stretched by a grid cell
            return (f'{pad}<p class="mt-fluid-m"><a{cattr} href='
                    f'{"{cta.href}" if not ivar else "{%s.href}" % ivar}>'
                    f'{inner}</a></p>\n')
        if name == 'logo':
            return (f'{pad}<span{cattr}>{{brand}}</span>\n')
        if name == 'image':
            alt = str(s.get('alt') or el.get('label') or 'image')
            return (f'{pad}<figure{cattr}><img '
                    'src="/media/placeholder.svg" '
                    f'alt="{alt}" loading="lazy" width="900" '
                    'height="600" /></figure>\n')
        if name == 'text-link' and ivar:
            return (f'{pad}<a{cattr} href={{{ivar}.href}}>'
                    f'{{{ivar}.label}}</a>\n')
        if name == 'text-link' and not ivar:
            return ''
        if name in ('heading', 'text-basic', 'text'):
            raw = re.sub(r'</?(?:div|br|p)[^>]*>', ' ',
                         str(s.get('text') or s.get('content') or ''))
            txt = re.sub(r'\s+', ' ',
                         re.sub(r'<[^>]+>', '', raw)).strip()
            if ivar:
                txt = (f'{{{ivar}.title}}' if name == 'heading'
                       else f'{{{ivar}.text}}')
            elif name == 'heading' and not seen['h'] and txt:
                seen['h'] = True
                return (f'{pad}{{heading && <{tag}{cattr}>'
                        f'{{heading}}</{tag}>}}\n')
            elif name in ('text-basic', 'text') and \
                    not seen['p'] and txt and len(txt) > 30:
                seen['p'] = True
                return (f'{pad}{{fs && <{tag}{cattr}>'
                        f'{{fs}}</{tag}>}}\n')
            elif not ivar:
                # the payload's own copy is wireframe label text
                # ("TAGLINE", "Call to action") — the bank supplies
                # structure, the plan supplies words (SB.5)
                return ''
            href = ' href="#"' if name == 'text-link' else ''
            return f'{pad}<{tag}{cattr}{href}>{txt}</{tag}>\n'
        if name == 'icon':
            return (f'{pad}<span{cattr} data-icon="lucide" '
                    'aria-hidden="true"></span>\n')
        if name == 'divider':
            return f'{pad}<hr{cattr} />\n'
        inner = ''
        for run, count in seq:
            if count >= 3 or (cat in ('header', 'footer')
                              and count >= 2):
                # nested repeats iterate the parent's row: it.items
                coll, var = (f'({ivar}.items || [])',
                             ivar + '2') if ivar else ('items', 'it')
                _wrap = ('row gap-fluid-m' if cat in ('header', 'footer')
                         else 'grid-auto gap-fluid-m')
                inner += (f'{pad}  <div class="{_wrap}">\n'
                          f'{pad}    {{({coll} || []).map(({var}) => (\n'
                          + ''.join(render(r, depth + 3, var,
                                           card=cat not in ('header',
                                                            'footer'))
                                    for r in run[:1])
                          + f'{pad}    ))}}\n{pad}  </div>\n')
            else:
                inner += ''.join(render(r, depth + 1, ivar)
                                 for r in run)
        if name == 'form':
            return f'{pad}<form{cattr} novalidate>\n{inner}{pad}</form>\n'
        if inner:
            return f'{pad}<{tag}{cattr}>\n{inner}{pad}</{tag}>\n'
        return f'{pad}<{tag}{cattr}></{tag}>\n'

    roots = [e['id'] for e in payload.get('content') or []
             if not e.get('parent')]
    body = ''.join(render(r, 1) for r in roots)
    if cat == 'header' and 'class="logo"' not in body:
        body = f'  <span class="logo">{{brand}}</span>\n' + body

    style = ''
    style = ''
    if rules:
        decl = []
        for _name, _props in rules.items():
            _lines = [f'    {p}: {v};' if v is not None else f'    {p}'
                      for p, v in _props]
            decl.append(f'  .{_name} {{\n' + '\n'.join(_lines) + '\n  }')
        decl += ['  ' + r.strip().replace('\n', '\n  ')
                 for r in raw_css if r and r.strip()]
        style = '\n\n'.join(decl) + '\n'
        if '--acss-' in style:      # never ship an unresolved var
            raise SystemExit(f'{stem}: unresolved ACSS var in emitted css')

    comp = camel('bm-' + stem)
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
           '  items?: { title?: string; text?: string;\n'
           '             label?: string; href?: string;\n'
           '             items?: any[] }[];\n'
           '}\n'
           'const {\n'
           "  brand = 'Brand',\n"
           "  heading = '',\n"
           "  fs = '',\n"
           "  cta = { label: '', href: '#' },\n"
           '  items = [],\n'
           '} = Astro.props;\n'
           '---\n\n<div>\n' + body + '</div>\n')
    return src, {'stem': stem, 'rules': 0, 'css': style,
                 'unmapped_vars': sorted(unmapped)}


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
