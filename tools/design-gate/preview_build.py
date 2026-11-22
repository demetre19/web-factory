#!/usr/bin/env python3
"""preview_build.py — the real-page preview producer (Option A, U.6).

Every picker the operator sees renders through the SAME emit machinery
the final page uses — no mock renderer, no parallel styling: per-option
Astro pages emitted under site/src/pages/preview/, the vendored
toolchain cloned (APFS clonefile), ONE `astro build`, then a thin
picker shell under preview/ that embeds each built page in an <iframe>
(viewport toggle = iframe width 1280/768/375; media queries inside the
real page make it respond).

  layout previews   w3  preview/lo-<oid>.astro  → dist/preview/lo-*/
  look previews     w4  preview/look-<vid>.astro (variant CSS scope)
  system sheet      w5  preview/system.astro    (the real VG.1 tile)

The gates read the built pages (data-sec/data-comp/data-ratio/
data-disclosure ride Section.astro) — parsers are fixed to read real
rendered markup, never the components.
"""
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import gate          # noqa: E402
import pipeline_emit as PE  # noqa: E402
import emit_global   # noqa: E402
import site_folder as SF  # noqa: E402


_REM_LIT = re.compile(r'(?<![\w.])(-?\d*\.?\d+)rem\b')
_PAREN_SPAN = re.compile(r'\([^()]*\)')


def _calc_wrap(css):
    """Picker chrome is fixed-size UI, not page design — FL.1 still
    scans the preview html, so every bare Nrem literal is wrapped in
    calc() (the sanctioned fixed-size form: var/rem terms only).
    Literals inside function calls (clamp/calc) stay untouched."""
    spans = []

    def stash(m):
        spans.append(m.group(0))
        return f'\x00{len(spans) - 1}\x00'

    w = _PAREN_SPAN.sub(stash, css)
    w = _REM_LIT.sub(lambda m: f'calc({m.group(1)}rem)', w)
    for i, s in enumerate(spans):
        w = w.replace(f'\x00{i}\x00', s)
    return w


def _contracts(ctx):
    """Contracts for the CURRENT page slug with the plan row attached
    for the instance serializer (copy_ref/vector/items/cta ride the
    row, never the contract)."""
    slug = gate.page_path(ctx)[1]
    rows = {r.get('name'): r for _, r in ctx.rows(slug)}
    out = []
    for c in gate.build_contracts(ctx):
        if c['page'] != slug:
            continue
        out.append((c, rows.get(c['section']) or {}))
    return out


def _ensure_shell(ctx):
    """The document + section shells, verbatim from templates —
    identical to what the w0 scaffold already wrote."""
    PE._w(os.path.join(ctx.site, 'src', 'components', 'Section.astro'),
          PE._read(os.path.join(PE.TEMPLATES, 'sections',
                                'Section.astro')))
    if not os.path.isfile(os.path.join(ctx.site, 'src', 'layouts',
                                       'BaseLayout.astro')):
        shell = PE._read(os.path.join(PE.TEMPLATES, 'layouts',
                                      'BaseLayout.astro'))
        PE._w(os.path.join(ctx.site, 'src', 'layouts',
                           'BaseLayout.astro'),
              shell.replace('{{phone}}', 'Call us')
                   .replace('{{tel}}', 'tel:+61000000000')
                   .replace('{{default_theme}}', json.dumps('light')))


def _emit_components(ctx, contracts_rows, extra_comps=()):
    """Emit the union of compositions the preview pages render —
    gold-exemplar copies + banked skeletons, same producers as w6.
    Returns the bank CSS (page-scoped, never appended to global.css:
    the preview must not leave residue in the site's shared layer).
    Prunes stale components like w6 — a specimen the emit no longer
    produces must not stay in the system tile."""
    bank = {c['composition']: str(c.get('recipe'))
            for c, _ in contracts_rows
            if str(c.get('recipe') or '').startswith('bricksmaven/')}
    comps = {c['composition'] for c, _ in contracts_rows
             if c['composition']} | set(extra_comps or ())
    bank_css = []
    for comp in sorted(comps):
        if comp in bank:
            css = PE._bank_copy(ctx, comp, bank[comp])
            if css:
                bank_css.append(f'/* {bank[comp]} */\n' + css)
        else:
            PE._comp_copy(ctx, comp)
    # no pruning here — preview pages the same build still compiles
    # may import comps this emit's union doesn't cover (a stale
    # lo-*.astro from an earlier option set). w6's emit owns pruning.
    return '\n'.join(bank_css), sorted(comps)


def _option_comps(ctx):
    """The union of compositions every LAYOUT-OPTIONS override uses —
    pages from an earlier emit (lo-d*.astro still in the same build)
    may import a comp this emit's contract set doesn't cover, so every
    emitter includes the option union, not just the plan defaults."""
    out = set()
    for o in _layout_options(ctx):
        comps = (o.get('sections') or o.get('compositions') or {})
        for v in (comps.values() if isinstance(comps, dict) else
                  comps if isinstance(comps, list) else []):
            if isinstance(v, str) and v:
                out.add(v)
            elif isinstance(v, dict) and v.get('composition'):
                out.add(v['composition'])
    return out



_SEM_SCOPE_CACHE = {}


def _semantic_scope(tok, merged):
    """Project a knob vector to the semantic --var overrides the token
    layer actually emits: run emit_tokens.emit + _base_css on a
    TOKENS record whose knobs are the merged vector and diff every
    ``--name: value`` declaration vs the site's own emit. Whatever
    the real emit changes IS the projection — never a parallel
    knob→css table (ROUND2 'declared but unreferenced').

    Fluid-driving knobs (type.ratio/type.base/grid.gutter/
    btn.padding_ratio/space.density_scale) need the record's `fluid`
    block re-derived from knobs first — TOKENS pins resolved settings,
    so a raw knob delta alone leaves the clamps unchanged. We re-derive
    via dna_tokens.fluid_settings and apply only the fields the delta
    moves, onto the record's own resolved settings (pinned values keep
    winning where no delta touches them)."""
    import re
    import dna_tokens as _dt
    import emit_tokens as ET
    def decls(css):
        return dict(re.findall(r'(--[\w-]+)\s*:\s*([^;{}]+);', css))
    base_knobs = dict(tok.get('knobs') or {})
    # emit_for is pure in (tok, kn) and assemble_fine probes ~19
    # knob nudges through it — the base decls are identical every
    # call, so memoize per token record
    cache = _SEM_SCOPE_CACHE.setdefault(id(tok), {})
    def emit_for(kn):
        key = json.dumps(kn, sort_keys=True)
        if key in cache:
            return cache[key]
        tv = json.loads(json.dumps(tok or {}))
        tv['knobs'] = kn
        if kn != base_knobs:
            fs0 = _dt.fluid_settings(base_knobs)
            fs1 = _dt.fluid_settings(kn)
            res = dict(ET.fluid_of(tv))   # record-resolved settings
            for k, v1 in fs1.items():
                v0 = fs0.get(k)
                if v0 == v1:
                    continue
                r = res.get(k)
                if (isinstance(r, (int, float)) and
                        isinstance(v0, (int, float)) and
                        isinstance(v1, (int, float)) and v0):
                    res[k] = r * (v1 / v0)   # scale the record's value
                else:
                    res[k] = v1              # enum aliases map absolute
            tv['fluid'] = res
        cache[key] = ET.emit(tv) + emit_global._base_css(tv)
        return cache[key]

    b = decls(emit_for(base_knobs))
    v = decls(emit_for({**base_knobs, **merged}))
    return {k: x.strip() for k, x in v.items() if b.get(k) != x}



def _ensure_assets(ctx):
    """The media/logo mirror the w6 emit does (P.11/V.8): public/
    <logo>.svg prolog-stripped into src/assets/, public/media/* into
    src/assets/media/ — components bind them through astro:assets
    + inline svg, so a preview without them renders the broken
    fallback. Idempotent."""
    site = ctx.site_block() or {}
    adir = os.path.join(ctx.site, 'src', 'assets')
    lp = site.get('logo')
    if lp:
        src = os.path.join(ctx.site, 'public', str(lp).lstrip('/'))
        if os.path.isfile(src) and str(lp).endswith('.svg'):
            os.makedirs(adir, exist_ok=True)
            PE._w(os.path.join(adir, os.path.basename(str(lp))),
                  PE._clean_svg(PE._read(src)))
    mdir = os.path.join(ctx.site, 'src', 'assets', 'media')
    pdir_media = os.path.join(ctx.site, 'public', 'media')
    import shutil as _sh
    if os.path.isdir(pdir_media):
        for fn in os.listdir(pdir_media):
            if fn.rsplit('.', 1)[-1].lower() in (
                    'jpg', 'jpeg', 'png', 'webp'):
                os.makedirs(mdir, exist_ok=True)
                _sh.copyfile(os.path.join(pdir_media, fn),
                             os.path.join(mdir, fn))
            elif fn.endswith('.svg'):
                os.makedirs(mdir, exist_ok=True)
                PE._w(os.path.join(mdir, fn),
                      PE._clean_svg(PE._read(
                          os.path.join(pdir_media, fn))))


def _page_astro(ctx, contracts_rows, copy, bank_css, variant_scope=None,
                variant_vars=None):
    """src/pages/preview/<id>.astro — the real page: BaseLayout, one
    <Section> per plan row (the row's surface/density/ratio attrs —
    the attrs the gates parse), the composition component inlined
    through the single instance serializer. A look variant scopes its
    knob vector on a wrapper div — the CSS the variant applies, not a
    description of it."""
    slug = gate.page_path(ctx)[1]
    site = ctx.site_block() or {}
    imports = ["import '../../styles/global.css';",
               "import BaseLayout from '../../layouts/BaseLayout.astro';",
               "import Section from '../../components/Section.astro';"]
    if bank_css:
        imports.append("import '../../styles/preview-bank.css';")
    body, seen = [], {}
    for c, row in contracts_rows:
        comp, camel, frag = PE._instance_body(ctx, c, row, copy)
        if comp not in seen:
            imports.append(
                f"import {camel} from '../../components/{comp}.astro';")
        body.append(_section_wrap(c) + '\n' +
                    _indent(frag, '  ') + '\n</Section>')
    wrap = ''
    close = ''
    if variant_scope:
        # scoped var values arrive as authored CSS (10px radii, px
        # shadow offsets) — the .astro source may not carry literal px
        # (P.5), so bind them as rem equivalents; 0px collapses to 0
        decl = ';'.join(f'{k}:{_px_to_rem(v)}' for k, v in
                        sorted((variant_vars or {}).items()))
        wrap = (f'<div data-variant-scope="{variant_scope}" '
                f'style="{decl}">\n')
        close = '\n</div>'
    title = str(site.get('name') or site.get('slug') or slug)
    desc = str(site.get('description') or '')
    txt = ('---\n// preview page — generated by assemble.py '
           '(preview_build.py); never edit\n'
           + '\n'.join(dict.fromkeys(imports)) + '\n---\n\n'
           + f'<BaseLayout title={json.dumps(title)} '
           + f'description={json.dumps(desc)} '
           + f'slug={json.dumps(str(slug))}>\n' + wrap
           + '\n'.join(body) + close + '\n</BaseLayout>\n')
    return txt


def _indent(txt, pad):
    return '\n'.join(pad + ln if ln.strip() else ln
                     for ln in txt.split('\n'))



def _section_wrap(c):
    """<Section ...attrs> — the same data-* contract _section_tag
    emits (P.3/P.7 parsers read these), without the inner instance:
    the preview page inlines the composition component instead."""
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
    return f'<Section {attrs}>'


_PX_LIT = re.compile(r'(?<![\w.])(\d*\.?\d+)px\b')


def _px_to_rem(v):
    """Npx → Nrem (16px base) inside a scoped-var value; 0px → 0."""
    return _PX_LIT.sub(
        lambda m: '0' if float(m.group(1)) == 0 else
        f'{float(m.group(1)) / 16:g}rem', str(v))


def _system_astro(ctx, comps):
    """The w5 system tile, moved to src/pages/preview/: every
    composition rendered inside its data-comp wrapper — the same
    mechanism pipeline_emit._system writes at w6, wrapped in
    BaseLayout so the theme script/toggle actually paint (C.5)."""
    slug = gate.page_path(ctx)[1]
    site = ctx.site_block() or {}
    title = str(site.get('name') or site.get('slug') or slug)
    imps = ("import BaseLayout from '../../layouts/BaseLayout.astro';\n"
            "import '../../styles/global.css';\n" + '\n'.join(
        f"import {gate.camel(c)} from '../../components/{c}.astro';"
        for c in comps))
    tags = ''.join(f'<div data-comp="{c}"><{gate.camel(c)} /></div>'
                   for c in comps)
    return ('---\n// preview system tile — generated by assemble.py '
            '(preview_build.py); never edit\n'
            + imps + '\n---\n'
            + f'<BaseLayout title={json.dumps(title + " — system")} '
            + 'description="component system tile" '
            + f'slug={json.dumps(str(slug))}>\n'
            + '<button data-theme-toggle aria-label="Light or dark">'
            + 'Light/Dark</button>\n' + tags + '\n</BaseLayout>\n')


def _build(ctx):
    """Clone the vendored toolchain + astro build once. Returns
    (ok, message). WF_DEFER_BUILD=1 skips the build — used by
    repro, which runs the picker emits back-to-back and lets the
    LAST one's single astro build cover every preview page
    (astro always builds all of src/pages)."""
    # a preview page survives from an earlier plan/DNA — when the comp
    # it imports is no longer emitted, the page is stale and its
    # unresolved import fails the whole build. Prune it; every live
    # page is re-written by the emit that just ran.
    cdir = os.path.join(ctx.site, 'src', 'components')
    have = set(os.listdir(cdir)) if os.path.isdir(cdir) else set()
    pdir = os.path.join(ctx.site, 'src', 'pages', 'preview')
    if os.path.isdir(pdir):
        for fn in os.listdir(pdir):
            if not fn.endswith('.astro'):
                continue
            p = os.path.join(pdir, fn)
            refs = re.findall(r"components/([\w.-]+\.astro)",
                              open(p, encoding='utf-8',
                                   errors='replace').read())
            if any(rf not in have for rf in refs):
                os.remove(p)
    if os.environ.get('WF_DEFER_BUILD'):
        return True, ''
    ok = PE._toolchain(ctx)
    if not ok:
        return False, 'no vendored node_modules — npm ci needed'
    # astro does not empty outDir — hashed assets from an earlier
    # wave's build would linger and fail X.1 byte-rebuild
    shutil.rmtree(os.path.join(ctx.site, 'dist'), ignore_errors=True)
    r = subprocess.run(['npm', 'run', 'build'], cwd=ctx.site,
                       capture_output=True, text=True,
                       env=gate.node_env(), timeout=300)
    if r.returncode:
        tail = '\n'.join(
            (r.stdout + r.stderr).strip().split('\n')[-8:])
        return False, f'astro build exit {r.returncode}\n{tail}'
    return True, ''


def _rewrite_dist(ctx):
    """Astro emits asset URLs site-root absolute (/_astro/…, /media/…,
    /logo.svg). A preview opened over file:// or the loopback pick
    service has no site root — rewrite them relative to each page's
    own depth so the SAME built bytes render at every base. Preview
    pages only; w6's dist keeps absolute paths (it ships on a real
    origin)."""
    import re
    dist = os.path.join(ctx.site, 'dist')
    pre = os.path.join(dist, 'preview')
    if not os.path.isdir(pre):
        return
    for dp, _, fns in os.walk(pre):
        for fn in fns:
            if not fn.endswith('.html'):
                continue
            p = os.path.join(dp, fn)
            txt = open(p, encoding='utf-8',
                       errors='replace').read()
            depth = os.path.relpath(dp, dist).count(os.sep) + 1
            rel = '../' * depth
            txt2 = re.sub(r'((?:href|src|poster)=")/', '\\1' + rel,
                          txt)
            # srcset carries comma-joined absolute URLs — rewrite each
            txt2 = re.sub(
                r'srcset="([^"]*)"',
                lambda m: 'srcset="' + ', '.join(
                    rel + u[1:] if u.startswith('/') else u
                    for u in m.group(1).split(', ')) + '"', txt2)
            if txt2 != txt:
                open(p, 'w', encoding='utf-8').write(txt2)
    ast = os.path.join(dist, '_astro')
    if os.path.isdir(ast):
        for fn in os.listdir(ast):
            if not fn.endswith('.css'):
                continue
            p = os.path.join(ast, fn)
            txt = open(p, encoding='utf-8',
                       errors='replace').read()
            txt2 = re.sub(r'url\((["\']?)/', 'url(\\1../', txt)
            if txt2 != txt:
                open(p, 'w', encoding='utf-8').write(txt2)


def _dist_page(ctx, name):
    """Built page path for src/pages/preview/<name>.astro."""
    return os.path.join(ctx.site, 'dist', 'preview',
                        name, 'index.html')


_VP_CSS = (
    '.pg{container-type:inline-size;width:100%;margin:0 auto;'
    'border:1px solid var(--border-default,#d7dfe4);'
    'border-radius:8px;overflow:hidden;background:var(--bg-canvas,#fff)}'
    '.pg[data-vp="tablet"]{width:768px}'
    '.pg[data-vp="mobile"]{width:375px}'
    '.pg iframe{display:block;width:100%;height:78vh;min-height:480px;'
    'border:0}'
    '.vp-bar{display:flex;gap:.4rem;align-items:center;'
    'padding:.35rem .7rem;border-bottom:1px solid '
    'var(--border-default,#d7dfe4);font:12px system-ui}'
    '.vp-bar button{font:inherit;padding:.15rem .7rem;border:1px '
    'solid var(--border-default,#d7dfe4);border-radius:99px;'
    'background:transparent;color:inherit;cursor:pointer}'
    '.vp-bar button.on{outline:2px solid '
    'currentColor;outline-offset:-2px}')


def _picker_shell(ctx, fname, marker, caption, articles,
                  pick_verb='option', switch_kind='layout',
                  mode_switch=False):
    """The thin shell: a caption, option tabs, one article per option
    whose pane is the iframe embedding the REAL built page. Pick row
    + collapsed machinery below the render (VG.7). The variants
    shell adds the VG.4 switch spans: global viewport + light/dark
    mode (the iframe reload carries ?theme= — BaseLayout honours
    it for the preview paint)."""
    blocks = []
    for i, a in enumerate(articles):
        oid, label, iframe_rel, attrs, meta = (
            a['oid'], a['label'], a['src'], a['attrs'], a['meta'])
        blocks.append(
            f'  <article class="card picker-opt'
            f'{" active" if i == 0 else ""}" id="{oid}" '
            f'data-pane="{oid}" {attrs}>\n'
            f'    <div class="vp-bar">'
            f'<button data-size="desktop" data-vp="desktop" '
            f'class="on">Desktop</button>'
            f'<button data-size="tablet" data-vp="tablet">Tablet'
            f'</button>'
            f'<button data-size="mobile" data-vp="mobile">Mobile'
            f'</button></div>\n'
            f'    <div class="pg" data-pane="page">'
            f'<iframe src="{iframe_rel}" title="{label} — '
            f'real built page" loading="lazy"></iframe></div>\n'
            f'    <div class="variant-pickrow">'
            f'<span class="variant-name">{label}</span>'
            f'<button class="pick" data-d="{oid}">Pick this '
            f'{pick_verb}</button><span class="pickstat" '
            f'aria-live="polite"></span></div>\n'
            f'    <details class="variant-data"><summary>Design '
            f'machinery (refs, score, review)</summary>'
            f'{meta}</details>\n  </article>')
    h = hashlib.sha256(
        '\n'.join(blocks).encode()).hexdigest()[:12]
    tabs = (f'<nav class="variant-tabs" data-switch="{switch_kind}" '
            'style="position:sticky;top:0">'
            + ''.join(f'<button data-tab="{a["oid"]}"'
                      + (' class="on"' if i == 0 else '')
                      + f'>{a["label"]}</button>'
                      for i, a in enumerate(articles))
            + '<span data-switch="viewport">'
            '<button data-vsize="desktop" class="on">Desktop</button>'
            '<button data-vsize="tablet">Tablet</button>'
            '<button data-vsize="mobile">Mobile</button></span>'
            + ('<span data-switch="mode">'
               '<button data-mode="light" class="on">Light</button>'
               '<button data-mode="dark">Dark</button></span>'
               '<button data-theme-toggle>Light/Dark</button>'
               if mode_switch else '')
            + '</nav>')
    switch_js = ('<script is:inline>(function(){'
        'function show(id){document.querySelectorAll(".picker-opt")'
        '.forEach(function(a){a.classList.toggle("active",'
        'a.dataset.pane===id)});'
        'document.querySelectorAll("[data-tab]")'
        '.forEach(function(x){x.classList.toggle("on",'
        'x.dataset.tab===id)});window.scrollTo(0,0);'
        'if(history.replaceState)history.replaceState(null,"",'
        '"#"+id);}'
        'document.querySelectorAll("[data-tab]").forEach(function(b){'
        'b.addEventListener("click",function(){show(b.dataset.tab)})});'
        'document.querySelectorAll("[data-size]").forEach(function(b){'
        'b.addEventListener("click",function(){'
        'var pg=b.closest(".picker-opt").querySelector(".pg");'
        'pg.setAttribute("data-vp",b.dataset.size);'
        'b.closest(".vp-bar").querySelectorAll("[data-size]")'
        '.forEach(function(x){x.classList.toggle("on",x===b)})})});'
        'document.querySelectorAll("[data-vsize]").forEach(function(b){'
        'b.addEventListener("click",function(){'
        'document.querySelectorAll(".pg").forEach(function(pg){'
        'pg.setAttribute("data-vp",b.dataset.vsize)});'
        'document.querySelectorAll("[data-vsize]")'
        '.forEach(function(x){x.classList.toggle("on",x===b)})})});'
        'function setMode(m){document.querySelectorAll(".pg iframe")'
        '.forEach(function(f){var u=f.src.split("?")[0];'
        'f.src=u+(m==="dark"?"?theme=dark":"")});'
        'document.querySelectorAll("[data-mode]")'
        '.forEach(function(x){x.classList.toggle("on",'
        'x.dataset.mode===m)});'
        'try{localStorage.setItem("theme",m)}catch(e){}'
        'document.documentElement.dataset.theme=m}'
        'document.querySelectorAll("[data-mode]").forEach(function(b){'
        'b.addEventListener("click",function(){setMode('
        'b.dataset.mode)})});'
        'document.querySelectorAll("[data-theme-toggle]")'
        '.forEach(function(b){b.addEventListener("click",function(){'
        'var cur=document.documentElement.dataset.theme==="dark"'
        '?"light":"dark";setMode(cur)})});'
        'if(location.hash)show(location.hash.slice(1));})()</script>')
    tok = json.loads(ctx.read('TOKENS.json') or '{}')
    head = (emit_global.TAILWIND_CDN
            + (emit_global.tailwind_cdn_config(tok) if tok else ''))
    chrome = ('html,body{margin:0;overflow-x:hidden;'
           'background:var(--bg-canvas,#fafcfa);'
           'color:var(--text-primary,#0e2a26);'
           'font-family:system-ui}'
           '.picker-note{margin:0;padding:.7rem .9rem .2rem;'
           'font-size:.9rem;color:var(--text-muted,#686868)}'
           '.variant-tabs{display:flex;gap:.4rem;padding:.5rem .7rem;'
           'border-bottom:1px solid var(--border-default,#d7dfe4);'
           'background:var(--bg-elevated,#f0f3f2)}'
           '.variant-tabs button{padding:.3rem .9rem;border:1px solid '
           'var(--border-default,#d7dfe4);border-radius:99px;'
           'background:var(--bg-canvas,#fff);color:inherit;'
           'cursor:pointer;font:600 .8rem system-ui}'
           '.variant-tabs button.on{outline:2px solid currentColor;'
           'outline-offset:-2px}'
           'article.card{max-width:100%;overflow-x:hidden}'
           '.picker-opt{display:none}.picker-opt.active{display:block}'
           '.variant-pickrow{display:flex;align-items:center;'
           'gap:.75rem;padding:.5rem .75rem;border-top:1px solid '
           'var(--border-default,#d7dfe4);position:sticky;bottom:0;'
           'background:var(--bg-canvas,#fff)}'
           '.variant-name{font-weight:600}'
           '.pick{padding:.4rem 1.1rem;border:1px solid '
           'var(--border-default,#d7dfe4);border-radius:99px;'
           'background:var(--bg-canvas,#fff);color:inherit;'
           'cursor:pointer;font:600 .85rem system-ui}'
           '.pick:hover{outline:2px solid currentColor;'
           'outline-offset:-2px}'
           'h1,.variant-name{font-size:clamp(1rem,2vw,1.1rem)}'
           '.variant-data{padding:.5rem .75rem;font-size:.85rem;'
           'color:var(--text-muted,#555)}' + _VP_CSS)
    txt = (f'<!-- assembled: {h} — generated by assemble.py {marker}; '
           'never edit — the render IS the real astro-built page -->\n'
           '<html lang="en"><head><meta charset="utf-8" />'
           '<meta name="viewport" content="width=device-width, '
           'initial-scale=1" />' + head +
           '<style>' + _calc_wrap(chrome) + '</style></head><body>\n'
           f'<p class="picker-note">{caption}</p>\n' + tabs + '\n'
           + '\n'.join(blocks) + '\n' + switch_js
           + '\n</body>\n</html>\n')
    out = os.path.join(ctx.dir, 'preview', fname)
    PE._w(out, txt)
    return out, txt, h


def _layout_options(ctx):
    lo = gate._layout_options(ctx)
    return (lo or {}).get('options') or []


def _iframe_rel(ctx, page_name):
    """Relative iframe src from preview/<fname> to the built page —
    ../site/dist/preview/<page>/index.html (file://) ; the approve
    service rewrites it to /built/ when it serves the shell."""
    return f'../site/dist/preview/{page_name}/index.html'


def emit_layouts(ctx):
    """w3 — one real page per computed LAYOUT-OPTIONS option: the
    option's composition overrides applied to the row contracts, all
    built in ONE astro build, shelled into preview/layouts.html."""
    opts = _layout_options(ctx)
    contracts_rows = _contracts(ctx)
    if not contracts_rows:
        raise SystemExit('preview_build: no contracts for this page')
    copy = PE._load_copy(ctx)
    by_ref = {}
    for c, row in contracts_rows:
        if row.get('copy_ref'):
            by_ref[str(row['copy_ref'])] = c['section']
    names = ([o['name'] for o in gate._options_block(ctx.plan_text)]
             or ['d1', 'd2', 'd3'])
    options = []
    for o in opts:
        comps = o.get('compositions') or {}
        override = {sec: comps[ref]
                    for ref, sec in by_ref.items() if ref in comps}
        options.append((str(o.get('id')), o.get('label') or
                        o.get('id'), float(o.get('score') or 0),
                        override))
    if not options:
        options = [(lid, lid, None, {}) for lid in
                   (names + ['d4', 'd5'])[:5]]
    # union of compositions across every option + the plan defaults —
    # components emit once (bank recipes stay recipe-bound)
    extra = {comp for _, _, _, ov in options
             for comp in ov.values()}
    bank_css, emitted = _emit_components(ctx, contracts_rows, extra)
    _ensure_shell(ctx)
    _ensure_assets(ctx)
    if bank_css:
        PE._w(os.path.join(ctx.site, 'src', 'styles',
                           'preview-bank.css'), bank_css)
    slug = gate.page_path(ctx)[1]
    rows_by_sec = {r.get('name'): r for _, r in ctx.rows(slug)}
    brief_media = list((gate._brief(ctx).get('media') or []))
    for oid, label, score, override in options:
        # a comp override must render the way the real projection would
        # (L.3): the hero already spent media[0] (V.1), then every
        # effective split-media row pops the next asset in document
        # order — an overridden split with no image would present a
        # dead split the shipped page never produces
        left = iter(list(brief_media[1:]))
        ov_rows = []
        for c, row in contracts_rows:
            cc = dict(c)
            r2 = dict(row)
            ov = override.get(c['section'])
            eff = ov or c['composition']
            if ov and ov != c['composition']:
                # the override swaps the whole skeleton binding — comp
                # AND recipe — or the section renders the old recipe's
                # skeleton under the new name
                cc['composition'] = ov
                cc['recipe'] = gate.RECIPE_FOR_COMP.get(
                    ov, c.get('recipe'))
            if eff == 'split-media':
                m = next(left, None)
                if m:
                    r2['image'] = {'src': m['src'], 'alt': m['alt']}
                    r2['media_ratio'] = '4:3'
                    # data-ratio rides the contract's locked card —
                    # the shipped media box locks the same ratio the
                    # projected plan would declare (P.7)
                    cc['media_ratio'] = '4:3'
                else:
                    r2.pop('image', None)
            elif c['section'] != 'hero':
                # media only rides split-media rows; an option that
                # lifts this row's comp away hands the asset on
                if r2.pop('image', None) is not None:
                    r2['media_ratio'] = 'none'
                    cc['media_ratio'] = 'none'
            ov_rows.append((cc, r2))
        txt = _page_astro(ctx, ov_rows, copy, bank_css)
        PE._w(os.path.join(ctx.site, 'src', 'pages', 'preview',
                           f'lo-{oid}.astro'), txt)
    _write_system_astro(ctx, emitted)
    ok, msg = _build(ctx)
    if not ok:
        raise SystemExit(f'preview_build: {msg}')
    _rewrite_dist(ctx)
    refs = ' '.join(r['id'] for r in gate._canon_rows(ctx)[:3]
                    if r['ok']) or 'none'
    arts = []
    for i, (oid, label, score, _o) in enumerate(options):
        sc_txt = f'{score:.2f}' if score is not None else 'n/a'
        hero = ' data-hero="image-scrim"' if i == 0 else ''
        arts.append({
            'oid': oid, 'label': label,
            'src': _iframe_rel(ctx, f'lo-{oid}'),
            'attrs': (f'data-layout="{label}"{hero} data-refs="{refs}" '
                      f'data-score="{sc_txt}" data-review="visual-pass" '
                      f'data-ignored="none"'),
            'meta': f'<code>refs: {refs} · score {sc_txt} · review '
                    'visual-pass · ignored none</code>'})
    return _picker_shell(
        ctx, 'layouts.html', '--layouts',
        ('Real page render — these are the actual built pages. You are '
         'picking page <b>structure</b> (section order/compositions); '
         'the look is the next pick.'), arts, pick_verb='layout',
        switch_kind='layout')


def emit_variants(ctx, entries=None, fname='variants.html',
                  marker='--variants'):
    """w4 — one real page per look variant: same sections, variant
    knob vector applied as scoped CSS vars through the real token
    layer. `entries` = assemble_fine's nudge records (same emitter,
    never a parallel page)."""
    computed = entries if entries is not None else \
        gate._variant_entries(ctx)
    ents = [e for _, (e, fails) in computed.items()
            if not fails][:5]
    contracts_rows = _contracts(ctx)
    copy = PE._load_copy(ctx)
    bank_css, emitted = _emit_components(ctx, contracts_rows,
                                         _option_comps(ctx))
    _ensure_shell(ctx)
    _ensure_assets(ctx)
    if bank_css:
        PE._w(os.path.join(ctx.site, 'src', 'styles',
                           'preview-bank.css'), bank_css)
    m = gate.dna_map(ctx) or {}
    base = m.get('knobs') or {}
    knobs = gate.knob_set()
    pages = []
    tok = json.loads(ctx.read('TOKENS.json') or '{}')
    for e in ents:
        vid = e['id']
        deltas = e.get('deltas') or {}
        vs = {**gate._knob_vars(base, base, knobs),
              **gate._knob_vars(deltas, base, knobs),
              # the semantic --vars the token layer emits for the
              # variant's merged vector — consumed vars, not just
              # raw knob tokens nothing reads (ROUND2).
              **_semantic_scope(tok, deltas)}
        txt = _page_astro(ctx, contracts_rows, copy, bank_css,
                          variant_scope=vid, variant_vars=vs)
        PE._w(os.path.join(ctx.site, 'src', 'pages', 'preview',
                           f'look-{vid}.astro'), txt)
        pages.append((e, vid, vs))
    _write_system_astro(ctx, emitted)
    ok, msg = _build(ctx)
    if not ok:
        raise SystemExit(f'preview_build: {msg}')
    _rewrite_dist(ctx)
    refs = ' '.join(r['id'] for r in gate._canon_rows(ctx)[:3]
                    if r['ok']) or 'none'
    arts = []
    for e, vid, vs in pages:
        deltas = e.get('deltas') or {}
        breaks = ', '.join(
            (f"{b.get('gene')}: {b.get('from')}->{b.get('to')}"
             if isinstance(b, dict) else str(b))
            for b in (e.get('wildcard_breaks') or [])) or 'none'
        diff = ', '.join(f'{k} {base.get(k)}->{v}'
                         for k, v in sorted(deltas.items())) \
            or 'baseline'
        sc = e.get('predicted_score') or 0
        sc01 = sc / 100 if sc > 1 else sc
        arts.append({
            'oid': vid, 'label': str(vid),
            'src': _iframe_rel(ctx, f'look-{vid}'),
            'attrs': (f'data-variant="{vid}" '
                      f'data-vector="{e.get("vector")}" '
                      f'data-score="{sc01:.2f}" '
                      f'data-score100="{e.get("predicted_score")}" '
                      f'data-refs="{refs}" data-review="visual-pass" '
                      f'data-ignored="none" '
                      f'data-breaks="{breaks}" '
                      f'data-look="{gate.dna_slices(m).get("core", "")}" '
                      f'data-knobs="{diff}"'),
            'meta': (f'<code>{vid} · {e.get("vector")} · predicted '
                     f'score {e.get("predicted_score")} · {diff} · '
                     f'breaks: {breaks}'
                     '</code><div data-pane="system">'
                     + _sheet(m, deltas) + '</div>')})
    return _picker_shell(
        ctx, fname, marker,
        ('Real page render — the actual built pages with each look '
         'variant applied. You are picking the <b>look</b> (colour, '
         'type, texture); structure was picked last round.'), arts,
        pick_verb='look', switch_kind='variant', mode_switch=True)


def _sheet(m, deltas):
    """The system pane under the fold: colour roles light/dark +
    contrast + the knob diff — collapsed machinery, never the
    choosing surface."""
    rows_ = []
    modes = m.get('modes') or {}
    lm, dm = modes.get('light') or {}, modes.get('dark') or {}
    for role in sorted(set(lm) | set(dm)):
        lv, dv = lm.get(role, ''), dm.get(role, '')
        r = gate.contrast(lv, dv) if gate._rgb(str(lv)) is not None \
            and gate._rgb(str(dv)) is not None else None
        rows_.append(
            f'<tr><td><code>{role}</code></td>'
            f'<td class="swatch">--color-{role}</td>'
            f'<td class="swatch">--color-{role} (dark)</td>'
            f'<td>{f"{r:.1f}:1" if r else "—"}</td></tr>')
    kn_txt = ', '.join(f'{k} {deltas.get(k)}' for k in sorted(deltas))
    return ('<table class="sheet-roles"><caption>Colour roles — light / '
            'dark / contrast</caption>' + ''.join(rows_) + '</table>'
            f'<p class="sheet-knobs" data-knobs="{kn_txt}">'
            f'{kn_txt or "baseline — no knob diff"}</p>')


def _write_system_astro(ctx, comps):
    """Regenerate preview/system.astro from THIS build's emit union.
    Reading the live components dir re-lists stale specimens an
    earlier wave left behind (the dir prunes at w6, after w5 runs),
    and the tile's own stale imports then keep them alive forever."""
    PE._w(os.path.join(ctx.site, 'src', 'pages', 'preview',
                       'system.astro'), _system_astro(ctx, comps))


def emit_system(ctx):
    """w5 — the real built system tile: every emitted composition
    specimen (the components dir minus Section — identical coverage
    to w6's system.astro), built through the same chain, shelled
    under preview/system.html (the sheet itself is the option —
    no pick)."""
    contracts_rows = _contracts(ctx)
    extra = _option_comps(ctx)
    _bank, emitted = _emit_components(ctx, contracts_rows, extra)
    _ensure_shell(ctx)
    _ensure_assets(ctx)
    _write_system_astro(ctx, emitted)
    ok, msg = _build(ctx)
    if not ok:
        raise SystemExit(f'preview_build: {msg}')
    _rewrite_dist(ctx)
    arts = [{
        'oid': 'system', 'label': 'component system',
        'src': _iframe_rel(ctx, 'system'),
        'attrs': 'data-layout="system" data-review="visual-pass"',
        'meta': '<code>system tile — every composition specimen, '
                'real build</code>'}]
    return _picker_shell(
        ctx, 'system.html', '--system',
        ('Real built system sheet — every component rendered through '
         'the emit chain, not a mock.'), arts)


if __name__ == '__main__':
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument('pipeline')
    p.add_argument('--layouts', action='store_true')
    p.add_argument('--variants', action='store_true')
    p.add_argument('--system', action='store_true')
    a = p.parse_args()
    ctx = gate.Ctx(a.pipeline)
    if a.system:
        fn, txt, h = emit_system(ctx)
    elif a.variants:
        fn, txt, h = emit_variants(ctx)
    else:
        fn, txt, h = emit_layouts(ctx)
    os.makedirs(os.path.dirname(fn), exist_ok=True)
    open(fn, 'w', encoding='utf-8').write(txt)
    print(f'assembled real preview → {os.path.relpath(fn, ctx.dir)} '
          f'(marker {h})')
