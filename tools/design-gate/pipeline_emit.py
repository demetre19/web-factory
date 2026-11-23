#!/usr/bin/env python3
"""pipeline_emit.py — the emit chain (S0–P6/B1–B3).

Given a pipeline dir holding DESIGN-PLAN.md + DNA.json (+ TOKENS.json
if the wave wrote it), emit everything the gate's W6/W7 checks judge:

  site/package.json + astro.config.mjs        scaffold (S0)
  TOKENS.json                                 DNA → knobs+modes (P1)
  site/tailwind.config.js                     darkMode + every hex (P2)
  site/src/styles/global.css                  emit_tokens + tail (P3)
  site/src/components/Section.astro           shell (S2)
  site/src/layouts/BaseLayout.astro           document shell (S4)
  site/src/components/<comp>.astro            gold-exemplar copy (P6)
  site/src/components/sections/<Sec>.astro    instance per contract (W6)
  site/src/pages/system.astro + index.astro   system tile (VG.1)
  COMPONENTS.md                               comp → file map
  sections/*.contract.json + *.gate.json      gate.py contracts+section
  site/src/pages/<slug>.astro + PAGES SPEC    assemble.py (B1)

Then (optionally) clone the vendored toolchain and `astro build` for a
real dist tree the w7 checks can open.

Usage: pipeline_emit.py <pipeline-dir> [--with-toolchain] [--build]
       pipeline_emit.py <pipeline-dir> --html | --astro | --scaffold
       --with-toolchain  clonefile templates/astro/node_modules
       --build           implies --with-toolchain; runs npm run build
       --html            the page's canonical artifact: emit + build,
                         then the WHOLE page as one standalone
                         site/html/<slug>.html (Tailwind CDN + the
                         design-system CSS inlined, assets relative)
       --astro           the terminal packaging path (== --build):
                         emit + build the astro site, no .html
                         artifact — the downstream LLM step runs it
       --scaffold        w0: TOKENS + scaffold + site assets + global
                         css + shell only; no contracts/components/
                         instances/assemble/build

Copy: a plan row's copy_ref resolves against the page's COPY.json and
rides into the section as the full `copy` slot (§4.3).
"""
import json
import os
import re
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)

import gate          # noqa: E402  (the ONE judge — producers call it)
import emit_global   # noqa: E402  (the canonical emit recipes)
import recraft       # noqa: E402  (F — generated placeholder media)

TEMPLATES = os.path.join(REPO, 'templates')
STARTER = os.path.join(TEMPLATES, 'astro')

# vendored toolchain versions — pinned to templates/astro/package.json
PKG_DEPS = {
    'astro': '5.18.2',
    '@astrojs/tailwind': '6.0.2',
    'tailwindcss': '3.4.19',
}


def _w(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as fh:
        fh.write(text)
    return path


def _read(path):
    return open(path, encoding='utf-8').read()


def _clean_svg(svg):
    """Inline-SVG hygiene for exported artwork (Illustrator et al.):
    prolog dropped; <style> class rules (.st0{fill:#..}) folded into
    presentation attributes on the elements that used them; style=""
    and editor-only attrs removed. The mark keeps its own colours as
    attributes — artwork, not a page stylesheet (P.2/TK.3)."""
    svg = re.sub(r'<\?xml[^>]*\?>', '', svg)
    rules = {}
    for blk in re.findall(r'<style[^>]*>(.*?)</style>', svg, re.S):
        for cls, body in re.findall(r'\.([\w-]+)\s*\{([^}]*)\}', blk):
            decl = {}
            for d in body.split(';'):
                if ':' in d:
                    k, v = d.split(':', 1)
                    decl[k.strip()] = v.strip()
            rules[cls] = decl
    svg = re.sub(r'<style[^>]*>.*?</style>', '', svg, flags=re.S)

    def _cls(m):
        attrs = []
        for c in m.group(1).split():
            for k, v in (rules.get(c) or {}).items():
                if k in ('fill', 'stroke', 'stroke-width', 'opacity',
                         'fill-rule', 'clip-rule', 'fill-opacity'):
                    attrs.append(f'{k}="{v}"')
        return ' '.join(attrs)
    svg = re.sub(r'class="([^"]*)"', _cls, svg)
    # style="" goes everywhere (P.2); editor-only placement attrs
    # only on the root <svg> — child x/y/id are geometry and refs
    svg = re.sub(r'\sstyle="[^"]*"', '', svg)
    svg = re.sub(
        r'<svg\b[^>]*>',
        lambda m: re.sub(r'\s(?:xml:space|x|y|id)="[^"]*"', '',
                         m.group(0)),
        svg, count=1)
    return svg.strip()


def _slug(ctx):
    site = ctx.site_block() or {}
    return str(site.get('slug') or os.path.basename(ctx.dir.rstrip('/'))
               or 'site')


def _index_astro(ctx):
    """S0 — the root page. When the plan carries no slug literally
    named 'index', the site has no natural '/' content: emit a
    canonical redirect to the plan's first page so dist/index.html
    is never a 0-byte stub. A real 'index' slug is assembled by
    assemble.py like every other page and wins."""
    pages = ctx.pages() or {}
    slug = next((s for s in pages if s != 'index'), None)
    if not slug:
        return ''
    href = './' + slug + '/'
    return ('---\n'
            '// root redirect — generated by pipeline_emit; never edit\n'
            '---\n'
            '<!DOCTYPE html>\n'
            f'<html><head><meta http-equiv="refresh" '
            f'content="0;url={href}"><link rel="canonical" href="{href}">'
            '</head><body><a href="' + href + '">'
            'Continue to the site</a></body></html>\n')


def _scaffold(ctx, comps):
    """S0 — package.json + astro.config.mjs + favicon + empty index."""
    site = ctx.site
    deps = dict(PKG_DEPS)
    # the layout shell renders icons too (theme toggle), and the
    # shared helper file may import lucide-astro — scan it, the shared
    # helpers and the exemplars so the manifest declares what the
    # build imports
    shell = os.path.join(TEMPLATES, 'layouts', 'BaseLayout.astro')
    shared = os.path.join(TEMPLATES, 'sections', '_shared',
                          'inline.ts')
    chip = os.path.join(TEMPLATES, 'sections', '_shared',
                        'IconChip.astro')
    if any('lucide-astro' in (_read(p) if os.path.isfile(p) else '')
           for p in list(_exemplar_paths(comps))
           + [shell, shared, chip]):
        deps['lucide-astro'] = '^0.556.0'
    _w(os.path.join(site, 'package.json'), json.dumps({
        'name': _slug(ctx), 'version': '1.0.0', 'private': True,
        'type': 'module',
        'scripts': {'dev': 'astro dev', 'build': 'astro build',
                    'preview': 'astro preview'},
        'engines': {'node': '>=20.0.0'},
        'dependencies': deps}, indent=2) + '\n')
    _w(os.path.join(site, 'astro.config.mjs'),
       "import { defineConfig } from 'astro/config';\n"
       "import tailwind from '@astrojs/tailwind';\n\n"
       'export default defineConfig({\n'
       '  output: "static",\n'
       '  integrations: [tailwind({ applyBaseStyles: false })],\n'
       '});\n')
    _w(os.path.join(site, 'public', 'favicon.svg'),
       '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">'
       '<rect width="16" height="16" rx="3"/></svg>\n')
    _w(os.path.join(site, 'src', 'pages', 'index.astro'),
       _index_astro(ctx))
    # Every translated bank figure points at /media/placeholder.svg.
    # It must exist or the ratio boxes render empty. Its fill is the
    # DNA's own surface rung — never an ad-libbed colour.
    roles = ((gate.dna_map(ctx) or {}).get('modes', {})
             .get('light') or {})
    fill = roles.get('surface_elevated') or roles.get('surface') \
        or '#E7E0D6'
    _w(os.path.join(site, 'public', 'media', 'placeholder.svg'),
       '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200" '
       'preserveAspectRatio="xMidYMid slice">'
       f'<rect width="900" height="1200" fill="{fill}"/>'
       '<path d="M0 1200 L900 0" stroke="#00000010" stroke-width="2"/>'
       '</svg>\n')


def _exemplar_paths(comps):
    return [os.path.join(TEMPLATES, 'sections', c,
                         gate.camel(c) + '.astro') for c in comps]


def _tokens(ctx, dna):
    """P1 — TOKENS.json is a DERIVED shadow of DNA (knobs + modes ride
    the map). Always re-emit: a stale TOKENS.json next to a moved DNA
    is drift, not provenance (P.5 catches hex divergence)."""
    p = os.path.join(ctx.dir, 'TOKENS.json')
    rec = emit_global.tokens_json(dna)
    was = _read(p) if os.path.isfile(p) else None
    wrote = json.dumps(rec, indent=1) + '\n' != was
    if wrote:
        _w(p, json.dumps(rec, indent=1) + '\n')
    return rec, wrote


def _comp_copy(ctx, comp):
    """P6/W6 — the composition skeleton IS the gold exemplar, copied
    verbatim into src/components/. Contract content binds via props on
    the instance, never by editing the skeleton's outer classes."""
    src = os.path.join(TEMPLATES, 'sections', comp,
                       gate.camel(comp) + '.astro')
    if not os.path.isfile(src):
        raise SystemExit(f'P6 no gold exemplar for "{comp}" at '
                         f'{os.path.relpath(src, REPO)}')
    dst = os.path.join(ctx.site, 'src', 'components', comp + '.astro')
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copyfile(src, dst)


BANK = os.path.join(REPO, 'templates', 'skeletons', 'bricksmaven')


def _bank_copy(ctx, comp, recipe):
    """P6 — a banked composition: the translated Bricksmaven skeleton
    IS the component (markup only, SB.2), and its sibling .css returns
    for hoisting into the shared layer — every selector already scoped
    under `.wf-<stem>` by bricks_translate.py, so bank topology binds
    only inside the component surface (M2). The recipe is the
    identity: bricksmaven/<category>/<stem>."""
    parts = recipe.split('/')
    if len(parts) != 3 or parts[0] != 'bricksmaven':
        raise SystemExit(f'P6 bad bank recipe "{recipe}" '
                         '(want bricksmaven/<cat>/<stem>)')
    cat, stem = parts[1], parts[2]
    src = os.path.join(BANK, cat, stem + '.astro')
    if not os.path.isfile(src):
        raise SystemExit(f'P6 no bank skeleton for "{recipe}" — run '
                         'bricks_translate.py on that payload')
    dst = os.path.join(ctx.site, 'src', 'components', comp + '.astro')
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copyfile(src, dst)
    css = os.path.join(BANK, cat, stem + '.css')
    return _read(css) if os.path.isfile(css) else ''


COPY_BLOCK_KEYS = ('answer', 'before', 'items', 'list_ordered', 'qa',
                   'links', 'after')


def _load_copy(ctx):
    """COPY.json of the page (the pipeline dir IS the page dir) — the
    article, block by block (copy_ingest.py). None when absent."""
    p = os.path.join(ctx.dir, 'COPY.json')
    if not os.path.isfile(p):
        return None
    return json.load(open(p, encoding='utf-8'))


def _split_para(p, cap=240):
    """R.4 — a rendered <p> carries at most `cap` chars. Long copy
    paragraphs split at sentence boundaries; the emitted parts
    re-join contiguously so F.1 still sees the verbatim string."""
    p = str(p or '')
    if len(p) <= cap:
        return [p] if p else []
    sents = re.split(r'(?<=[.!?])\s+', p)
    out, cur = [], ''
    for s in sents:
        if cur and len(cur) + 1 + len(s) > cap:
            out.append(cur)
            cur = s
        else:
            cur = f'{cur} {s}'.strip()
    if cur:
        out.append(cur)
    # a single sentence over the cap splits on the last ' – ' or
    # '; ' boundary inside it — still verbatim when re-joined
    final = []
    for chunk in out:
        while len(chunk) > cap:
            cut = max(chunk.rfind(' – ', 0, cap),
                      chunk.rfind('; ', 0, cap),
                      chunk.rfind(', ', 0, cap))
            if cut <= 0:
                break
            final.append(chunk[:cut + 1].rstrip())
            chunk = chunk[cut + 1:].lstrip()
        final.append(chunk)
    return final


def _copy_slot(copy, ref, comp=None):
    """The full-copy prop for a plan row's copy_ref (§4.3), verbatim
    from COPY.json — inline markdown kept for the shared renderer:
      bNN     → {heading, answer, before, items, list_ordered, qa,
                 links, after}
      lede    → {heading: h1, answer: lede}            (hero)
      closing → {text, cta, phone}                      (end-act)
    A copy_ref the copy cannot resolve is a producer error, never a
    silently empty section."""
    ref = str(ref or '')
    if not ref:
        return None
    if copy is None:
        raise SystemExit(f'W6 plan row copy_ref "{ref}" but no COPY.json '
                         '— run copy_ingest.py')
    if ref == 'lede':
        return {'heading': copy.get('h1') or '',
                'answer': copy.get('lede') or ''}
    if ref == 'closing':
        cl = copy.get('closing') or {}
        return {k: cl[k] for k in ('text', 'cta', 'phone') if cl.get(k)}
    blk = next((b for b in copy.get('blocks') or []
                if b.get('id') == ref), None)
    if blk is None:
        raise SystemExit(f'W6 copy_ref "{ref}" not in COPY.json blocks')
    slot = {'heading': blk.get('h2') or ''}
    for k in COPY_BLOCK_KEYS:
        v = blk.get(k)
        if k == 'list_ordered':
            slot[k] = bool(v)
        elif k in ('before', 'after') and v:
            slot[k] = [x for para in v for x in _split_para(para)]
        else:
            slot[k] = v if v is not None else ([] if k != 'answer'
                                               else '')
    # items[] fallback — a block with a term list but no items[]
    # still carries real copy: terms become card titles, the first
    # sentence mentioning each term becomes its text (the §4.3
    # tagger's mechanical fill, not invented copy — same binding the
    # picker's slot fragments apply). Only item-shaped comps consume
    # {term, text} rows — a quote/stat slot would render a term as
    # voice or number, which is neither its shape nor honest copy
    # (F.1/Q.2).
    if not slot.get('items') and comp in _TERM_ITEM_COMPS:
        terms = blk.get('terms') or []
        if terms:
            sents = []
            for para in (slot.get('before') or []) + \
                    [slot.get('answer') or '']:
                sents += [x.strip() for x in
                          re.split(r'(?<=[.!?])\s+', para) if x.strip()]
            slot['items'] = [
                {'term': t if len(t) < 60 else t[:57] + '…',
                 # item text renders as plain text — strip inline
                 # markdown or a bold run leaks literal asterisks
                 'text': next(
                     (x.replace('**', '') for x in sents
                      if t.lower() in x.lower()), '')}
                for t in terms]
            slot['items_from'] = 'terms'
    return slot


# comps whose item rows are {term, text} cards/steps — the terms fill
# is honest for these and only these (quote-grid/proof-band/stat-band
# bind voice/number slots, not term cards)
_TERM_ITEM_COMPS = {'cards-n', 'sequence', 'text-index', 'link-grid',
                    'comparison'}

# comps whose exemplar binds a top-level `image` prop — placeholder
# generation fills only these; chrome ignores the prop and catalog
# grids read per-item images, so spending a generation there fills
# no rendered slot
_IMG_PROP_COMPS = {'split-media', 'stacked-hero', 'full-bleed',
                   'hero-act-merge', 'media-gallery', 'editorial',
                   'comparison', 'proof-band', 'form-panel',
                   'quote-grid', 'cutout-hero-split',
                   'cutout-cta-band', 'gallery-grid',
                   'portfolio-grid'}


def _emit_routes(ctx):
    """Every route this emit produces — '/' (the S0 redirect) +
    each plan page + the fixed system/design-system routes. Internal
    links outside the set 404 on the shipped site."""
    routes = {'/', '/system/', '/design-system/'}
    for slug in ctx.pages() or {}:
        routes.add('/' + slug + '/')
    return routes


def _dead_href(href, routes):
    """an internal route this emit never builds — '#/…' anchors,
    tel:/mailto:/http and assets (paths with a file extension) are
    not routes."""
    if not isinstance(href, str) or not href.startswith('/') or             href.startswith('//'):
        return False
    path = href.split('#', 1)[0].split('?', 1)[0]
    if not path:
        path = '/'
    if '.' in path.rsplit('/', 1)[-1]:
        return False
    return path.rstrip('/') + '/' not in routes


def _san_links(v, routes):
    """walk an emitted prop value; drop {href} items whose route is
    not emitted and re-point markdown links to '#' — the nav/footer/
    copy a page ships must never route to a 404."""
    if isinstance(v, list):
        return [_san_links(it, routes) for it in v]
    if isinstance(v, dict):
        if _dead_href(v.get('href'), routes):
            v = dict(v)
            v['href'] = '#'
        return {k: _san_links(x, routes) for k, x in v.items()}
    if isinstance(v, str):
        return re.sub(r'\]\((/[^)\s]*)\)',
                      lambda m: '](#)' if _dead_href(
                          m.group(1), routes) else m.group(0), v)
    return v



def _instance_body(ctx, contract, row, copy=None):
    """The <Comp props/> render call + its import — the ONE instance
    serializer (P.6/W6). Returns (import_line, render_line); the
    section-instance writer wraps it in the contract frontmatter,
    preview_build inlines it inside the page's <Section> wrappers —
    same props, same copy binding, never a second recipe."""
    comp = contract['composition']
    camel = gate.camel(comp)
    c = contract['content'] or {}
    slot = _copy_slot(copy, row.get('copy_ref'), comp)
    # the plan's vector IS the copy: a stub paragraph may describe the
    # section, but the claim a reader sees is the one the row declares
    vec = (row.get('vector') or [{}])
    vec = vec[0] if isinstance(vec, list) and vec else {}
    props = []
    h1_text = c.get('h1_text')
    for k in ('heading', 'fs', 'body', 'eyebrow'):
        if k == 'heading':
            v = vec.get('heading') or h1_text or c.get('heading')
        elif k == 'fs':
            v = vec.get('fs') or c.get('fs')
        else:
            v = c.get(k)
        if v:
            props.append(f'{k}={json.dumps(str(v))}')
    # F1 fix — cta rides the contract (stub inventory couriered at
    # build_contracts); items/image still come from the plan row.
    img = None
    if row.get('image'):
        img = dict(row['image'])
        # data-ratio describes the raster, not the plan's declared
        # intent — the asset's own dims snapped to the contract's
        # ratio vocabulary win; the contract value is the fallback.
        _asset = os.path.join(ctx.site, 'public',
                              str(img.get('src') or '').lstrip('/'))
        img['ratio'] = emit_global.media_ratio_for(
            _asset, contract.get('media_ratio'))
        # a referenced raster that was never materialized 404s on
        # the built page (mediaOf falls back to the raw src) — bind
        # the same deterministic placeholder path the empty-slot
        # branch uses instead of shipping a dead file
        _adir = os.path.join(ctx.site, 'src', 'assets', 'media')
        _name = os.path.basename(_asset)
        # remote srcs aren't files on this filesystem — skip the
        # existence check and let the comp render the URL as-is
        _remote = str(img.get('src') or '').startswith(
            ('http://', 'https://', '//'))
        if _name and not _remote and not os.path.isfile(_asset) and                 not os.path.isfile(os.path.join(_adir, _name)):
            gen = recraft.fill(
                comp + '-' + str(row.get('name') or row.get('id') or
                                 ''),
                'cutout' if comp.startswith('cutout-') else
                'default',
                os.path.join(ctx.site, 'public', 'media'))
            if gen:
                os.makedirs(_adir, exist_ok=True)
                shutil.copyfile(gen, os.path.join(
                    _adir, os.path.basename(gen)))
                img['src'] = '/media/' + os.path.basename(gen)
            else:
                img['src'] = '/media/placeholder.svg'
    if img is None and comp in _IMG_PROP_COMPS:
        # F — an empty media slot gets a generated placeholder
        # (recraft): deterministic per comp+row (row.name is the
        # plan's section identity), cutout comps get an
        # isolation-ready subject; stubs to the section's own
        # placeholder when OPENROUTER_API_KEY is unset.
        gen = recraft.fill(
            comp + '-' + str(row.get('name') or row.get('id') or ''),
            'cutout' if comp.startswith('cutout-') else 'default',
            os.path.join(ctx.site, 'public', 'media'))
        if gen:
            # the V.8 mirror (public/media → src/assets/media) may
            # already have run on this pass — mirror now so mediaFor
            # resolves it through astro:assets on the same emit
            _mdir = os.path.join(ctx.site, 'src', 'assets', 'media')
            os.makedirs(_mdir, exist_ok=True)
            shutil.copyfile(gen, os.path.join(
                _mdir, os.path.basename(gen)))
            img = {'src': '/media/' + os.path.basename(gen),
                   'alt': str(row.get('heading') or comp)}
    routes = _emit_routes(ctx)
    for k, src in (('cta', c.get('cta') or row.get('cta')),
                   ('eyebrow', row.get('eyebrow')),
                   ('items', row.get('items')),
                   ('fields', row.get('fields')),
                   ('image', img),
                   ('images', row.get('images')),
                   ('attrib', row.get('attrib'))):
        if src:
            props.append(f'{k}={{({json.dumps(_san_links(src, routes))})}}')
    if slot:
        props.append('copy={(' + json.dumps(
            _san_links(slot, routes), ensure_ascii=False) + ')}')
    if h1_text:
        props.append('h1={true}')
    if (contract.get('stack') or row.get('stack')) == 'media-first':
        props.append('stack="media-first"')
    # the brand is site chrome: every composition that renders a logo
    # takes it from the plan's site block, never a default
    site = ctx.site_block() or {}
    if site.get('brand'):
        props.append('brand=' + json.dumps(str(site['brand']),
                                          ensure_ascii=False))
    if site.get('logo'):
        props.append('logo=' + json.dumps(str(site['logo']),
                                          ensure_ascii=False))
    _sa = (row.get('speech_act') or [])
    _sa = _sa if isinstance(_sa, list) else [str(_sa or '')]
    # the instance contract with the assembler is spelled out in
    # the render call itself — the page's data-flow, reading order,
    # and fold estimate must not live in anyone's memory
    asm_note = ('<!-- section contract: ' +
                ' '.join(['composition=' + comp,
                           'section=' + str(row.get('name') or ''),
                           'surface=' + str(row.get('surface') or ''),
                           'density=' + str(row.get('density') or ''),
                           'speech_act=' + '+'.join(_sa)]) + ' -->')
    body = (asm_note + '\n<' + camel + ' ' + ' '.join(props) + ' />'
            if props else asm_note + '\n<' + camel + ' />')
    return comp, camel, body


def _specimen_row(comp):
    """A labelled specimen row for the system tile: comps the plan
    never contracted still render real structure — heading, items,
    cta — so no orphan default strings leak. The tile IS a component
    sheet, so the comp's own name is the honest heading."""
    label = comp.replace('-', ' ').title()
    return {'name': comp,
            'vector': [{'heading': label}],
            'items': [{'term': w, 'text': label}
                      for w in ('First', 'Second', 'Third')],
            'cta': {'label': 'Call to action', 'href': '#'}}


def _instance(ctx, contract, row, copy=None):
    """W6 — the section instance: frontmatter contract + import + render.
    A row with copy_ref carries the full COPY.json slot as the `copy`
    prop (§4.3: heading → answer → before → items/qa/links → after);
    chrome rows (nav/footer) keep the row's own items/cta. The
    component owns the skeleton (P.6)."""
    comp, camel, body = _instance_body(ctx, contract, row, copy)
    txt = ('---\n'
           '// contract echoes (frontmatter is JS; the gate reads\n'
           '// dna_hash:/structure_hash:/exemplar: via regex):\n'
           f"// dna_hash: {contract['dna_hash']}\n"
           f"// structure_hash: {contract['structure_hash']}\n"
           f'// exemplar: {comp}\n'
           f"import {camel} from '../{comp}.astro';\n"
           '---\n'
           f'{body}\n')
    _w(os.path.join(ctx.site, 'src', 'components', 'sections',
                    gate.camel(contract['section']) + '.astro'), txt)


def _system(ctx, comps, contracts=None, copy=None, by_name=None):
    """VG.1 — the system tile renders every composition + the toggle.
    It bypasses BaseLayout, so it imports the shared layer itself
    (same F3 fix: applyBaseStyles:false ships no CSS otherwise).
    Specimens ride the ONE instance serializer — contracted comps
    render their real row/copy; the rest get a labelled specimen
    row, never bare <Comp/> (bare defaults leak orphan strings)."""
    imps = '\n'.join(
        f"import {gate.camel(c)} from '../components/{c}.astro';"
        for c in comps)
    by_comp = {}
    for c in contracts or []:
        by_comp.setdefault(c['composition'], c)
    tags = ''
    for c in comps:
        contract = by_comp.get(c)
        row = (by_name or {}).get(str(contract['section'])) \
            if contract else None
        _, _, frag = _instance_body(
            ctx, contract or {'composition': c, 'content': {}},
            row or _specimen_row(c), copy)
        tags += f'<div data-comp="{c}">{frag}</div>\n'
    _w(os.path.join(ctx.site, 'src', 'pages', 'system.astro'),
       '---\n'
       "import '../styles/global.css';\n"
       + imps + '\n---\n'
       '<button data-theme-toggle aria-label="Light or dark">'
       'Light/Dark</button>\n' + tags + '\n')


def _design_system(ctx, tokens, comps):
    """DS.* — the rendered design-system page: TOKENS.json made
    visible at /design-system/. Emitted at w6 — after the w4 look
    pick locks the DNA — so the sheet renders the picked system:
    colour roles in both modes, every ACSS size rung as a live
    specimen, buttons, links, cards, icon chips, form fields when the
    plan carries a form, and the section spec (density→section-space
    rungs, gutter, measure, content width, surfaces). Every specimen
    binds the token layer's vars/classes — the ds-* specimen classes
    emit from emit_global._ds_specs into the shared component layer;
    data-ds-value labels carry TOKENS.json verbatim so the DS.2 gate
    can prove the sheet and the tokens never drift. Machinery chrome
    only — never in the public nav (DS.3)."""
    import emit_tokens as _ET
    knobs = tokens.get('knobs') or {}
    sizes = tokens.get('sizes') or {}
    modes = (tokens.get('color') or {}).get('modes') or {}
    site = ctx.site_block() or {}
    title = str(site.get('name') or site.get('slug')
                or 'site') + ' — design system'

    def spec(kind, name, var, cls, value, inner):
        v = f' data-ds-var="{var}"' if var else ''
        c = f' data-ds-class="{cls}"' if cls else ''
        # P.5: no raw px/hex/{…}/quote literals may land in .astro —
        # declare the values, never a literal the check would read as
        # authored styling ('10px' → '10 px', '{a:1}' → '(a:1)')
        value = (re.sub(r'(\d)px\b', r'\1 px',
                        str(value).replace('"', "'")
                        .replace('{', '(').replace('}', ')'))
                 .replace('#', '')
                 if value is not None else None)
        val = (f' data-ds-value="{value}"'
               if value is not None else '')
        return (f'<div class="ds-spec" data-ds-kind="{kind}" '
                f'data-ds-name="{name}"{v}{c}{val}>{inner}</div>')

    parts = []
    parts.append(
        '<section class="sec-band surface-base" data-ds-section="colours">'
        '<div class="sec-inner"><h1>Design system</h1>'
        '<p class="lede">Every convention on this site, rendered from '
        'the bound tokens — the same source components consume.</p>')
    # ---- colours: every role, both modes -----------------------------
    for mode in ('light', 'dark'):
        roles = (modes.get(mode) or {}).get('roles') or {}
        lis = []
        for role, hexv in roles.items():
            sem = _ET.ROLE_SEMANTIC.get(role, role)
            key = emit_global.ROLE_KEY.get(role) or role
            tkey = ('dark' + key) if mode == 'dark' else key
            inner = (f'<span class="ds-swatch bg-{tkey}"></span>'
                     f'<span class="ds-label">{role} · --{sem}</span>'
                     f'<code class="ds-value">var(--{sem})</code>')
            # P.5: hex literals never land in .astro — the sheet
            # declares the hex without '#' (DS.2 compares stripped)
            lis.append('<li class="card">'
                       + spec('colour', f'{mode}.{role}',
                              f'--{sem}', f'bg-{tkey}',
                              str(hexv).lstrip('#'), inner)
                       + '</li>')
        parts.append(f'<h2>Colours — {mode}</h2>'
                     '<ul class="list-plain grid-auto">'
                     + ''.join(lis) + '</ul>')
    # ---- type scale: every text-* and h* rung ------------------------
    tx = []
    for name in sorted(sizes):
        if not name.startswith(('text-', 'h')):
            continue
        cl = str((sizes.get(name) or {}).get('clamp') or '')
        # data-ds-name carries a `size-` prefix: a bare rung name
        # (text-xl) would be extracted as a Tailwind candidate and
        # emit a bare-rem utility — FL.1
        tx.append(spec('type', f'size-{name}', f'--{name}',
                       f'ds-tx-{name}', cl,
                       f'<p class="ds-tx-{name}">The quick brown fox '
                       f'jumps over the lazy dog</p>'
                       f'<span class="ds-label">--{name}</span>'))
    parts.append('<h2>Type scale</h2>' + ''.join(tx))
    # ---- space rungs: space-*/section-space-*/gutter -----------------
    sp = []
    for name in sorted(sizes):
        if name.startswith(('text-', 'h')):
            continue
        cl = str((sizes.get(name) or {}).get('clamp') or '')
        sp.append(spec('space', f'size-{name}', f'--{name}',
                       f'ds-sp-{name}', cl,
                       f'<span class="ds-bar ds-sp-{name}"></span>'
                       f'<span class="ds-label">--{name}</span>'))
    parts.append('<h2>Spacing</h2>' + ''.join(sp))
    # ---- section spec: density rungs, surfaces, measure/gutter -------
    sec = []
    py = knobs.get('space.section_py') or {}
    for dens, rung in (py.items() if isinstance(py, dict) else []):
        rung = str(rung)
        cl = str((sizes.get(rung) or {}).get('clamp') or '')
        sec.append(spec('density', dens, f'--{rung}',
                        f'ds-sp-{rung}', cl,
                        f'<span class="ds-bar ds-sp-{rung}"></span>'
                        f'<span class="ds-label">{dens} · --{rung}'
                        '</span>'))
    for surf in ('base', 'muted', 'inverse', 'brand'):
        sec.append(spec('surface', surf, '--sec-bg',
                        f'surface-{surf}', surf,
                        f'<div class="sec-band surface-{surf}">'
                        '<div class="sec-inner"><span class="ds-label">'
                        f'{surf} band</span></div></div>'))
    for var in ('measure', 'content-width', 'grid-min'):
        sec.append(spec('measure', var, f'--{var}', None,
                        f'var(--{var})',
                        f'<span class="ds-label">--{var}</span>'))
    parts.append('<h2>Section conventions</h2>' + ''.join(sec))
    # ---- radius / elevation / motion ---------------------------------
    _radius_px = re.sub(r'(\d)px', r'\1 px',
                        str(knobs.get('radius.personality')))
    rem = [spec('radius', 'radius.personality', '--radius',
                'ds-radius', 'var(--radius)',
                '<span class="ds-radius"></span>'
                '<span class="ds-label">--radius · ' + _radius_px +
                '</span>')]
    for name in ('shadow-card', 'shadow-pop'):
        rem.append(spec('elevation', name, f'--{name}',
                        f'ds-{name}', str(knobs.get('elevation.level')),
                        f'<span class="ds-swatch ds-{name}"></span>'
                        f'<span class="ds-label">--{name} · elevation '
                        f'{knobs.get("elevation.level")}</span>'))
    for var in ('motion-ease', 'motion-fast', 'motion-med',
                'motion-distance', 'motion-engine'):
        rem.append(spec('motion', var, f'--{var}', None,
                        str(knobs.get('motion.level')),
                        f'<span class="ds-label">--{var} · '
                        f'{knobs.get("motion.level")}</span>'))
    parts.append('<h2>Radius, elevation, motion</h2>' + ''.join(rem))
    # ---- buttons -----------------------------------------------------
    btns = ''.join(
        spec('button', cls, None, cls, cls,
             f'<a class="{cls}" href="#main">{label}</a>')
        for cls, label in (('wf-cta-button', 'Primary action'),
                           ('wf-cta-button cta-large', 'Large action'),
                           ('wf-cta-button btn-block',
                            'Block action')))
    parts.append('<h2>Buttons</h2>'
                 '<div class="cta-row" data-ds-block="buttons">'
                 + btns + '</div>')
    # ---- links -------------------------------------------------------
    links = ''.join([
        spec('link', 'inline', '--action-primary', None,
             'accent underline',
             '<a href="#main">Inline copy link</a>'),
        spec('link', 'link-quiet', '--text-secondary', 'link-quiet',
             'quiet',
             '<a class="link-quiet" href="#main">Quiet link</a>'),
        spec('link', 'nav-link', '--text-secondary', 'nav-link',
             'nav',
             '<a class="nav-link" href="#main">Nav link</a>')])
    parts.append('<h2>Links</h2>'
                 '<div class="row" data-ds-block="links">'
                 + links + '</div>')
    # ---- cards + chips ------------------------------------------------
    cards = ''.join([
        spec('card', 'card', '--r-card', 'card', 'surface',
             '<div class="card"><h3>Card</h3>'
             '<p>Card body on --bg-surface with --r-card radius.</p>'
             '</div>'),
        spec('card', 'card-media', '--r-card', 'card', 'media',
             '<div class="card"><div class="card-media">'
             '<img src="/favicon.svg" alt="placeholder">'
             '</div><h3>Media card</h3></div>'),
        spec('chip', 'icon-chip', '--tap', 'icon-chip', 'tap-rung',
             '<IconChip name="check" />')])
    parts.append('<h2>Cards and chips</h2>'
                 '<ul class="list-plain grid-auto" '
                 'data-ds-block="cards"><li>'
                 + '</li><li>'.join(cards) + '</li></ul>')
    # ---- form elements (only when the plan carries a form) -----------
    if 'form-panel' in comps:
        parts.append(
            '<h2>Form elements</h2>'
            '<div data-ds-block="form"><div class="form-grid">'
            '<div class="field" data-ds-kind="form" '
            'data-ds-name="input" data-ds-var="--input-border">'
            '<span>Text field</span><input type="text" '
            'placeholder="Name"></div>'
            '<div class="field" data-ds-kind="form" '
            'data-ds-name="select" data-ds-var="--input-border">'
            '<span>Select</span><select><option>Option</option>'
            '</select></div>'
            '</div></div>')
    # ---- knobs table -------------------------------------------------
    kn = []
    for k, v in sorted(knobs.items()):
        val = re.sub(r'(\d)px\b', r'\1 px',
                     (json.dumps(v) if isinstance(v, (dict, list))
                      else str(v)).replace('{', '(')
                     .replace('}', ')').replace('"', "'")
                     .replace('#', ''))
        kn.append(spec('knob', k, None, None, val,
                       f'<span class="ds-label">{k}</span>'
                       f'<code class="ds-value">{val}</code>'))
    parts.append('<h2>Knobs</h2>' + ''.join(kn))
    parts.append('</div></section>')
    txt = ('---\n// design-system sheet — generated by '
           'pipeline_emit._design_system; never edit\n'
           "import '../styles/global.css';\n"
           "import BaseLayout from '../layouts/BaseLayout.astro';\n"
           "import IconChip from '../_shared/IconChip.astro';\n---\n\n"
           f'<BaseLayout title={json.dumps(title)} '
           'description="design system sheet" slug="design-system">\n'
           '<button data-theme-toggle aria-label="Light or dark">'
           'Light/Dark</button>\n' + '\n'.join(parts) + '\n'
           '</BaseLayout>\n')
    _w(os.path.join(ctx.site, 'src', 'pages', 'design-system.astro'),
       txt)


def _html_artifacts(ctx, tokens, look_design=None, look_vars=None):
    """--html — the page's canonical artifact: the WHOLE page as one
    standalone .html the downstream LLM consumes verbatim (operator:
    "SAVE the WHOLE HTML as one page", "full styling embedded as TW
    in top via cdn"). Astro is the internal intermediate only — the
    markup comes from the just-built dist; every local stylesheet is
    inlined where its <link> stood, the Tailwind CDN + the
    token-derived browser config ride the top of <head>, and
    root-absolute asset URLs become ../dist/*-relative so the file
    renders standalone (served from site/ or opened file://).
    Pure transform of producer output — byte-stable for the same
    inputs (X.1)."""
    dist = os.path.join(ctx.site, 'dist')
    wrote = []
    for slug in sorted(ctx.pages() or {}):
        src = os.path.join(dist, slug, 'index.html')
        if not os.path.isfile(src) and slug == 'index':
            src = os.path.join(dist, 'index.html')
        if not os.path.isfile(src):
            continue
        txt = _read(src)

        def _inline(m):
            tag, href = m.group(0), m.group(1)
            if 'stylesheet' not in tag:
                return tag
            fp = os.path.join(dist, href.lstrip('/'))
            if not os.path.isfile(fp):
                return tag
            css = re.sub(r'url\((["\']?)/', r'url(\1../dist/',
                         _read(fp))
            return (f'<style>/* {href} — inlined by pipeline_emit '
                    f'--html */\n{css}</style>')

        txt = re.sub(r'<link\b[^>]*href="(/[^"]+)"[^>]*/?>',
                     _inline, txt)

        def _rel(u):
            p, _, rest = u.partition(' ')
            q = p.split('#', 1)[0].split('?', 1)[0]
            if not q.startswith('/'):
                return u
            if not os.path.exists(
                    os.path.join(dist, q.lstrip('/'))):
                return u
            return '../dist' + q + ((' ' + rest) if rest else '')

        txt = re.sub(r'((?:src|href|poster)=")(/[^"]*)"',
                     lambda m: m.group(1) + _rel(m.group(2)) + '"',
                     txt)
        txt = re.sub(r'srcset="([^"]*)"',
                     lambda m: 'srcset="' + ', '.join(
                         _rel(u) for u in m.group(1).split(', '))
                     + '"', txt)
        txt = re.sub(
            r'(<head[^>]*>)',
            lambda m: m.group(1) + emit_global.TAILWIND_CDN
            + emit_global.tailwind_cdn_config(tokens),
            txt, count=1)
        if look_vars:
            txt, n = re.subn(
                r'</head>',
                _look_layer(look_design, look_vars) + '</head>',
                txt, count=1)
            if not n:
                raise SystemExit(
                    f'pipeline_emit: no </head> in dist/{slug}/'
                    'index.html — look layer has nowhere to bind')
        _w(os.path.join(ctx.site, 'html', slug + '.html'),
           f'<!-- site/html/{slug}.html — generated by '
           'pipeline_emit.py --html from the dist render; never '
           'edit — the whole page is one standalone file -->\n'
           + txt)
        wrote.append(slug + '.html')
    return wrote


def _picked_look(ctx, tokens):
    """(design, --var overrides) for the signed w4 pick — the variant
    deltas projected through emit_global.look_scope, the one map the
    preview frame binds. Empty without a signed pick and for the
    baseline variant (its delta set is empty: the page IS the base)."""
    appr = ((gate.read_approvals(ctx) or {}).get('w4') or {})
    design = appr.get('design')
    if not design:
        return None, {}
    # the signed record pins the vector the operator picked — resolve
    # live (gate.look_deltas: VARIANT-GATES ∪ FINE-VARIANTS) only for
    # approvals signed before the vector rode the record
    deltas = appr.get('look_deltas')
    if deltas is None:
        deltas = gate.look_deltas(ctx, design)
    if deltas is None:
        raise SystemExit(
            f'pipeline_emit: w4 pick "{design}" is not a declared '
            'variant — cannot project the look layer')
    return design, emit_global.look_scope(tokens, dict(deltas))


def _look_layer(design, look_vars):
    """The picked look as one :root override <style> — appended at
    the end of <head> so it wins the cascade over the inlined layers.
    Binds only in site/html (the self-contained artifact carries its
    own styling by design — P.2's shared-layer scan covers src + dist
    where TOKENS/global.css stay DNA-pure for DM.3/DS.2); the shipped
    render now measures the pick, and P.7's data-ratio contract is
    DOM, untouched. Byte-stable for the same signed pick (X.1)."""
    decl = ';'.join(f'{k}:{v}' for k, v in sorted(look_vars.items()))
    return (f'<style data-look="{design}">/* the signed w4 pick '
            f'projects here — emit_global.look_scope */'
            f':root{{{decl}}}</style>')


def _toolchain(ctx):
    """Clone the vendored node_modules (APFS clonefile when possible)
    so `astro build` runs without a network install."""
    src = os.path.join(STARTER, 'node_modules')
    dst = os.path.join(ctx.site, 'node_modules')
    if os.path.isdir(dst):
        return True
    if not os.path.isdir(src):
        print(f'  ! no vendored node_modules at '
              f'{os.path.relpath(src, REPO)} — npm ci needed')
        return False
    # macOS clonefile first (instant copy-on-write), then GNU cp -a;
    # either way symlinks (npm .bin shims) must survive the copy.
    r = subprocess.run(['cp', '-Rc', src, dst], capture_output=True)
    if r.returncode != 0:
        r = subprocess.run(['cp', '-a', src, dst], capture_output=True)
    if r.returncode != 0:
        shutil.copytree(src, dst, symlinks=True)
    return True


def main(argv):
    args = [a for a in argv[1:] if not a.startswith('--')]
    flags = {a for a in argv[1:] if a.startswith('--')}
    if len(args) != 1 or \
            flags - {'--with-toolchain', '--build', '--scaffold',
                     '--html', '--astro'} or \
            ('--scaffold' in flags
             and flags & {'--with-toolchain', '--build', '--html',
                          '--astro'}):
        print('usage: pipeline_emit.py <pipeline-dir> '
              '[--with-toolchain] [--build] | --html | --astro '
              '| --scaffold')
        return 2
    scaffold_only = '--scaffold' in flags
    ctx = gate.Ctx(args[0])
    for req in ('DESIGN-PLAN.md', 'DNA.json'):
        if not os.path.isfile(os.path.join(ctx.dir, req)):
            print(f'pipeline_emit: {req} missing in {ctx.dir}')
            return 2
    dna = gate.dna_map(ctx) or {}
    rows = ctx.rows() or []
    if not rows:
        print('pipeline_emit: no plan rows (pages.*.sections) in '
              'DESIGN-PLAN.md')
        return 2

    print(f'emit → {ctx.dir}')
    # P1 — TOKENS.json (operator's wins; DNA derives otherwise)
    tokens, wrote = _tokens(ctx, dna)
    print(f'  TOKENS.json {"written" if wrote else "kept"} '
          f'({len((tokens.get("knobs") or {}))} knobs)')

    # the signed w4 pick → the shipped look layer (P1 keeps TOKENS
    # DNA-pure for DM.3): the same --var projection the preview wraps
    # on its frame, bound on the built pages so the shipped render
    # restyles under the pick
    look_design, look_vars = None, {}
    if not scaffold_only:
        look_design, look_vars = _picked_look(ctx, tokens)
        if look_vars:
            print(f'  look {look_design}: {len(look_vars)} var '
                  'overrides')

    # --scaffold (w0): contracts are not built yet — the scaffold's
    # composition list comes straight from the plan rows
    if scaffold_only:
        contracts = []
        comps = sorted({str(r.get('composition')) for _, r in rows
                        if r.get('composition')})
    else:
        contracts = gate.build_contracts(ctx)
        comps = sorted({c['composition'] for c in contracts
                        if c['composition']})
    by_name = {str(r.get('name')): r for _, r in rows}
    copy = _load_copy(ctx)
    inv = dna.get('invariants') or {}
    fonts = inv.get('fonts') or None

    # S0 — scaffold
    _scaffold(ctx, comps)
    # the shared inline-markdown renderer is a static template copy
    # with no contract inputs — emit it in BOTH modes so the w0
    # scaffold and the full emit produce the same site tree (X.1)
    _w(os.path.join(ctx.site, 'src', '_shared', 'inline.ts'),
       _read(os.path.join(TEMPLATES, 'sections', '_shared', 'inline.ts')))
    _w(os.path.join(ctx.site, 'src', '_shared', 'IconChip.astro'),
       _read(os.path.join(TEMPLATES, 'sections', '_shared',
                          'IconChip.astro')))
    print('  scaffold: package.json, astro.config.mjs, favicon, index, '
          '_shared/inline.ts, _shared/IconChip.astro')

    # S1 — site-folder assets (fonts, media, logo) → site/public/, so
    # the @font-face urls, BRIEF media and the logo resolve at build
    pub = emit_global.site_assets(ctx.dir, ctx.site)
    print(f'  public/: {len(pub)} site asset(s)'
          + (f' ({", ".join(pub)})' if pub else ''))

    # P2 — tailwind config (every TOKENS hex verbatim)
    _w(os.path.join(ctx.site, 'tailwind.config.js'),
       emit_global.tailwind_config(tokens))
    print('  tailwind.config.js')

    # P3 — global.css (DNA @font-face + emit_tokens five layers +
    # component tail; light :root default, dark only under
    # [data-theme=dark])
    _w(os.path.join(ctx.site, 'src', 'styles', 'global.css'),
       emit_global.global_css(tokens, fonts))
    print('  src/styles/global.css'
          + (f' ({len((fonts or {}).get("faces") or [])} @font-face)'
             if fonts else ''))

    # S2/S4 — shell + document layout (template files, verbatim)
    _w(os.path.join(ctx.site, 'src', 'components', 'Section.astro'),
       _read(os.path.join(TEMPLATES, 'sections', 'Section.astro')))
    shell = _read(os.path.join(TEMPLATES, 'layouts', 'BaseLayout.astro'))
    # the call bar dials the site's own contact fact, never lorem:
    # phone from the STUB's contact table, else the DNA invariant
    # (BRIEF brand.phone)
    site = ctx.site_block() or {}
    stub = ctx.read('STUB.md') or ''
    m = re.search(r'\|\s*phone\s*\|\s*([^|]+)\|', stub)
    phone = (m.group(1).strip() if m else str(inv.get('phone') or ''))
    tel = re.sub(r'[^0-9+]', '', phone)
    if tel and not tel.startswith('+'):
        tel = '+61' + tel.lstrip('0')
    # first paint follows the DNA theme default (BRIEF theme.default),
    # never the OS colour-scheme preference (U.3)
    theme_default = str((dna.get('theme') or {}).get('default')
                        or 'light')
    shell = (shell.replace('{{phone}}',
                           ('Call ' + phone) if phone else 'Call us')
                  .replace('{{tel}}', 'tel:' + tel)
                  .replace('{{default_theme}}',
                           json.dumps(theme_default)))
    _w(os.path.join(ctx.site, 'src', 'layouts', 'BaseLayout.astro'), shell)
    print('  Section.astro + BaseLayout.astro')
    # P.11 — logos inline: public/<logo>.svg is mirrored into
    # src/assets/ (prolog-stripped) so components render the real
    # mark as SVG markup, never an image tag
    adir = os.path.join(ctx.site, 'src', 'assets')
    lp = site.get('logo')
    if lp:
        src = os.path.join(ctx.site, 'public', str(lp).lstrip('/'))
        if os.path.isfile(src) and str(lp).endswith('.svg'):
            os.makedirs(adir, exist_ok=True)
            svg = _read(src)
            svg = _clean_svg(svg)
            _w(os.path.join(adir, os.path.basename(str(lp))), svg)
    # V.8/P.12 — rasters mirror into src/assets/media/ so components
    # compile them through astro:assets (AVIF/WebP + intrinsic dims)
    mdir = os.path.join(ctx.site, 'src', 'assets', 'media')
    pdir_media = os.path.join(ctx.site, 'public', 'media')
    if os.path.isdir(pdir_media):
        for fn in os.listdir(pdir_media):
            if fn.rsplit('.', 1)[-1].lower() in (
                    'jpg', 'jpeg', 'png', 'webp'):
                os.makedirs(mdir, exist_ok=True)
                shutil.copyfile(os.path.join(pdir_media, fn),
                                os.path.join(mdir, fn))
            elif fn.endswith('.svg'):
                os.makedirs(mdir, exist_ok=True)
                svg = _read(os.path.join(pdir_media, fn))
                svg = _clean_svg(svg)
                _w(os.path.join(mdir, fn), svg)

    # (the shared renderer is emitted above — both modes share it)

    if scaffold_only:
        print('  scaffold-only emit done (w0)')
        return 0

    # P6/W6 — component skeleton + instance per contract. A plan row
    # carrying recipe: bricksmaven/<cat>/<stem> resolves to the banked
    # skeleton; every other row resolves to the gold exemplar.
    bank = {c['composition']: str(c.get('recipe'))
            for c in contracts
            if str(c.get('recipe') or '').startswith('bricksmaven/')}
    bank_css = []
    for comp in comps:
        if comp in bank:
            css = _bank_copy(ctx, comp, bank[comp])
            if css:
                bank_css.append(f'/* {bank[comp]} */\n' + css)
            continue
        _comp_copy(ctx, comp)
    # a composition that left the plan leaves no component file: a
    # stale .astro still satisfies P.6's "has specimen" scan and the
    # next build ships a component the page never renders. Preview
    # pages (src/pages/preview/*.astro) stay in the tree and keep
    # importing the preview-phase union — a comp they reference is
    # live, not stale, so it survives the prune.
    cdir = os.path.join(ctx.site, 'src', 'components')
    ckeep = {comp + '.astro' for comp in comps} | {'Section.astro'}
    pages_root = os.path.join(ctx.site, 'src', 'pages')
    # system.astro/design-system.astro are rewritten from `comps`
    # later in this same emit — their on-disk imports are one emit
    # behind, so honoring them would pin a retired comp forever
    regen = {'system.astro', 'design-system.astro'}
    if os.path.isdir(pages_root):
        for dpth, _, fns in os.walk(pages_root):
            for fn in fns:
                if not fn.endswith('.astro') or fn in regen:
                    continue
                for m in re.finditer(
                        r"components/([\w.-]+)\.astro",
                        _read(os.path.join(dpth, fn))):
                    ckeep.add(m.group(1) + '.astro')
    for fn in sorted(os.listdir(cdir)) if os.path.isdir(cdir) else []:
        if fn.endswith('.astro') and fn not in ckeep:
            os.remove(os.path.join(cdir, fn))
    if bank_css:
        # SB.2 — bank rules live in the shared layer, never in a
        # component. Selectors arrive `.wf-<stem>`-scoped from
        # bricks_translate.py, so hoisting into @layer components
        # cannot leak bespoke names site-wide (M2).
        with open(os.path.join(ctx.site, 'src', 'styles',
                               'global.css'), 'a') as fh:
            fh.write('\n@layer components {\n'
                     + '\n'.join(bank_css) + '\n}\n')
        print(f'  bank css: {len(bank_css)} skeleton(s) → global.css')
    # a section that left the plan leaves no component behind: a stale
    # instance still imports a composition the page no longer renders,
    # and the next SB.3/SB.5 pass reads the orphan, not the page.
    sdir = os.path.join(ctx.site, 'src', 'components', 'sections')
    keep = {gate.camel(str(c['section'])) + '.astro' for c in contracts}
    for fn in sorted(os.listdir(sdir)) if os.path.isdir(sdir) else []:
        if fn.endswith('.astro') and fn not in keep:
            os.remove(os.path.join(sdir, fn))
    for c in contracts:
        _instance(ctx, c, by_name.get(str(c['section'])) or {}, copy)
    print(f'  {len(comps)} components + {len(contracts)} instances')

    # VG.1 — system tile + comp map
    _system(ctx, comps, contracts, copy, by_name)
    _design_system(ctx, tokens, comps)              # DS.1-3
    _w(os.path.join(ctx.dir, 'COMPONENTS.md'),
       '# COMPONENTS\n' + ''.join(
           f'{c} → {c}.astro\n' for c in comps))
    print('  system.astro + design-system.astro + COMPONENTS.md')

    # P.20 — BUILD-PLAN declares the fan-out lanes: every independent
    # (non-chrome) section gets its own cheap-pool lane, the
    # orchestrator stays on coordinated, coherence on coherence.
    indep = [str(r.get('name')) for _, r in rows
             if 'chrome' not in (r.get('speech_act') or [])
             and str(r.get('composition') or '')
             not in ('nav-bar', 'footer-bar', 'flyout-nav')]
    lanes = ([{'id': f'sec-{n}', 'kind': 'section', 'section': n,
               'model_lane': 'cheap'} for n in indep] +
             [{'id': 'orchestrate', 'kind': 'orchestrator',
               'model_lane': 'coordinated'},
              {'id': 'coherence', 'kind': 'coherence',
               'model_lane': 'coherence'}])
    _w(os.path.join(ctx.dir, 'BUILD-PLAN.json'),
       json.dumps({'lanes': lanes}, indent=1))
    print(f'  BUILD-PLAN.json ({len(indep)} section lanes)')

    # B1–B3 — the gate produces; the emitter only invokes it
    rc = 0
    print('  gate.py contracts …')
    rc |= gate.cmd_contracts(ctx.dir)
    ctx2 = gate.Ctx(ctx.dir)   # contracts now on disk
    print('  gate.py section (per contract) …')
    rc |= gate.cmd_section(ctx.dir, None)
    print('  assemble.py …')
    asm = subprocess.run(
        [sys.executable, os.path.join(HERE, 'assemble.py'), ctx.dir],
        capture_output=True, text=True)
    print('  ' + asm.stdout.strip().replace('\n', '\n  '))
    if asm.returncode:
        print(asm.stderr.strip())
        rc |= asm.returncode

    # --html is the canonical pipeline emit (the .html artifact);
    # --astro/--build is the terminal packaging path — both run the
    # internal astro build, only --html also derives the artifact
    if flags & {'--with-toolchain', '--build', '--html', '--astro'}:
        ok = _toolchain(ctx)
        print(f'  toolchain: {"cloned" if ok else "missing"}')
        if flags & {'--build', '--html', '--astro'}:
            if not ok:
                # a requested build that cannot run must not exit 0 —
                # --html would otherwise republish whatever stale dist
                # happens to be on disk
                print('  ! build requested but toolchain missing')
                rc |= 2
            else:
                # astro does not empty outDir — hashed assets from an
                # earlier wave's build would linger and fail X.1
                shutil.rmtree(os.path.join(ctx.site, 'dist'),
                              ignore_errors=True)
                # the layout picker's lo-<oid> pages are producer
                # output of THIS plan: re-emit their sources so the
                # one build below ships the current options, never
                # the pages an older plan left in src/pages/preview
                if (gate._layout_options(ctx) or {}).get('options'):
                    import preview_build
                    os.environ['WF_DEFER_BUILD'] = '1'
                    try:
                        preview_build.emit_layouts(ctx)
                    finally:
                        os.environ.pop('WF_DEFER_BUILD', None)
                    print('  layouts: lo-<oid> sources re-emitted')
                r = subprocess.run(['npm', 'run', 'build'],
                                   cwd=ctx.site, capture_output=True,
                                   text=True, env=gate.node_env(),
                                   timeout=300)
                tail = '\n'.join(
                    (r.stdout + r.stderr).strip().split('\n')[-6:])
                print(f'  astro build exit {r.returncode}\n  {tail}')
                rc |= r.returncode
        if not rc and ('--html' in flags or os.path.isdir(
                os.path.join(ctx.site, 'html'))):
            # an --astro/--build run after --html replaces dist — the
            # derived artifact must regenerate or it serves stale html
            wrote = _html_artifacts(ctx, tokens,
                                    look_design, look_vars)
            print(f'  site/html/: {len(wrote)} artifact(s) '
                  f'({", ".join(wrote)})')
    print(f'emit done (exit {rc})')
    return rc


if __name__ == '__main__':
    raise SystemExit(main(sys.argv))
