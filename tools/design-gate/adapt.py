#!/usr/bin/env python3
"""adapt.py — bind a derived DNA's tokens onto a retrieved bank
payload, WITHOUT touching its topology classes. Two payload kinds:

  * HTML kits (flowbite/hyperui/preline/reui/shadcn): the skeleton
    markup is placed verbatim inside the [data-dna] scope. A
    var-bound ADAPT SHEET overrides only visual-layer properties
    (colour, type, radius, shadow, block padding, media treatment)
    on semantic hooks — layout classes (flex/grid/cols/gap/hidden)
    are never rewritten, so topology survives adaptation.

  * brixies (ACSS-JSON): the payload has no markup — its .topo
    sidecar carries topology (direction, columns, seam, elements).
    Binding is bind-onto-topology: the topo schedule drives the
    same .block shell the generate path emits, enriched to honour
    direction/column/seam. Same shell, real structure.

Copy is declared input: heading/lead/cta are injected into the
first heading/first paragraph/first actionable text node —
retrieved copy never leaks into a proof card.
"""
import html as _html
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, '..', '..'))
SKELETONS = os.path.join(REPO, 'templates', 'skeletons')
sys.path.insert(0, HERE)
import gate  # noqa: E402


# ------------------------------------------------------- adapt sheet
# Visual-layer override only. Selectors target SEMANTIC hooks the
# retrieved markup carries (section, headings, links, buttons, img,
# figure) plus Tailwind visual utilities — never layout utilities.
def adapt_sheet(scope):
    """[data-dna="<scope>"]-scoped var bindings for foreign markup.
    Emitted once per option; the sheet is token output, so the
    DNA's vars block is its single source."""
    s = f'[data-dna="{scope}"]'
    return (
        f'{s}{{background:var(--bg);color:var(--ink);'
        f'font-family:var(--font-body);'
        f'padding:var(--pad-block) clamp(1.5rem,5cqi,4rem);'
        f'container-type:inline-size}}'
        f'{s} h1,{s} h2,{s} h3{{font-family:var(--font-display);'
        f'font-size:var(--f-display);font-weight:var(--display-weight);'
        f'letter-spacing:var(--track);line-height:1.15;'
        f'color:var(--ink)}}'
        f'{s} p,{s} span,{s} li{{color:var(--ink-soft,var(--ink));'
        f'font-size:var(--f-body)}}'
        f'{s} a,{s} button,[role="button"]{{'
        f'background:var(--accent);color:var(--accent-ink);'
        f'border-radius:var(--radius);padding:var(--btn-pad);'
        f'box-shadow:var(--shadow);border:0}}'
        f'{s} img,{s} figure{{border-radius:var(--radius);'
        f'overflow:hidden}}'
        f'{s} svg{{color:var(--accent)}}'
        # Tailwind visual utilities remapped onto tokens — only
        # visual props; the utility's layout role is untouched.
        f'{s} .bg-white,{s} .bg-gray-50,{s} .bg-gray-100{{'
        f'background:transparent}}'
        f'{s} .text-gray-900,{s} .text-gray-800{{color:var(--ink)}}'
        f'{s} .text-gray-500,{s} .text-gray-600{{'
        f'color:var(--ink-soft,var(--ink))}}'
        f'{s} .rounded-md,{s} .rounded-lg,{s} .rounded-xl,'
        f'{s} .rounded-2xl,{s} .rounded{{border-radius:var(--radius)}}'
        f'{s} .shadow,{s} .shadow-md,{s} .shadow-lg{{'
        f'box-shadow:var(--shadow)}}'
        f'{s} .bg-blue-600,{s} .bg-indigo-600,{s} .bg-blue-700,'
        f'{s} .bg-primary{{background:var(--accent);'
        f'color:var(--accent-ink)}}')


# -------------------------------------------------------- copy inject
_H_RX = re.compile(r'<(h[1-3])\b[^>]*>(.*?)</\1>', re.S | re.I)
_P_RX = re.compile(r'<p\b[^>]*>(.*?)</p>', re.S | re.I)
_CTA_RX = re.compile(
    r'<(a|button)\b[^>]*>(.*?)</\1>', re.S | re.I)
_TAG = re.compile(r'<[^>]+>')


def inject_copy(markup, dna):
    """Declared copy into the retrieved markup's semantic slots —
    first heading, first paragraph, first actionable. Bounded
    single-substitution per slot; unmatchable markup gets the
    copy prepended inside the scope instead of altered."""
    head, lead = dna['copy']
    cta = dna['cta']
    hit = [False, False, False]

    def _h(m):
        hit[0] = True
        return m.group(0).replace(m.group(2), _html.escape(head))
    markup = _H_RX.sub(_h, markup, count=1)

    def _p(m):
        hit[1] = True
        return m.group(0).replace(m.group(1), _html.escape(lead))
    markup = _P_RX.sub(_p, markup, count=1)

    def _c(m):
        if _TAG.search(m.group(1)):
            return m.group(0)      # icon-only button — leave it
        hit[2] = True
        return m.group(0).replace(m.group(1), _html.escape(cta))
    markup = _CTA_RX.sub(_c, markup, count=1)

    if not all(hit):
        miss = ''.join(
            f'<h2>{_html.escape(head)}</h2>' if not hit[0] else '')
        miss += (f'<p>{_html.escape(lead)}</p>'
                 if not hit[1] else '')
        miss += (f'<a>{_html.escape(cta)}</a>'
                 if not hit[2] else '')
        markup = ('<div class="adapt-copy" '
                  'style="display:contents">' + miss +
                  '</div>' + markup)
    return markup


# --------------------------------------------------------- payload io
def payload_path(row):
    """bank row → its markup payload. PNG row → sibling .html /
    skeleton file via recipe_id or render_path naming."""
    rp = row.get('render_path', '')
    kit = row.get('kit')
    name = os.path.splitext(os.path.basename(rp))[0]
    if kit:
        for dp, _, fns in os.walk(
                os.path.join(SKELETONS, kit)):
            for fn in fns:
                if fn.endswith(('.html', '.htm')) and \
                        os.path.splitext(fn)[0] in name:
                    return os.path.join(dp, fn)
    rid = row.get('recipe_id') or ''
    if '/' in rid:
        block = rid.split('/')[-1].replace('.topo', '')
        fam = rid.split('/')[-2]
        for ext in ('.html', '.json'):
            p = os.path.join(SKELETONS,
                             rid.split('/')[0], fam,
                             block + ext)
            if os.path.exists(p):
                return p
    return None


def payload_kind(path):
    return 'html' if path and path.endswith('.html') else \
        'topo' if path and path.endswith('.json') else None


def _is_brixies(path):
    return '/brixies/' in str(path)


# ------------------------------------------------------------- adapt
def adapt(dna, row, scope, element_dom_fn=None):
    """(dna record, bank row, scope name) → {preview_html,
    adapt_css, mode, payload}. The section markup the picker
    frames and the VLM judges. mode: 'html' | 'topo' | 'gen'
    (gen = no payload found — caller may prefer next-nearest)."""
    path = payload_path(row)
    kind = payload_kind(path)
    if kind == 'html':
        try:
            raw = open(path, encoding='utf-8',
                       errors='replace').read()
        except Exception:
            raw = ''
        # strip scripts/iframes: proof cards are static surfaces
        raw = re.sub(r'<script\b.*?</script>', '', raw,
                     flags=re.S | re.I)
        raw = re.sub(r'<iframe\b.*?</iframe>', '', raw,
                     flags=re.S | re.I)
        body = inject_copy(raw, dna)
        return {'mode': 'html', 'payload': os.path.relpath(
                    path, REPO),
                'preview_html':
                    f'<section class="block" data-dna="{scope}">'
                    f'{body}</section>',
                'adapt_css': adapt_sheet(scope)}

    if kind == 'topo' or _is_brixies(path or row.get(
            'recipe_id', '')):
        # bind-onto-topology: the .topo sidecar's structure fields
        # drive the .block shell — same emit as the generate path
        # but topology-informed (direction/columns/seam recorded).
        topo = {}
        side = (path or '').replace('.json', '.topo.json')
        try:
            topo = (json.load(open(side)).get('topology')
                    or json.load(open(path)).get('topology')
                    or {})
        except Exception:
            pass
        dom = element_dom_fn(dna) if element_dom_fn else ''
        al = ('center' if dna['layout'] == 'center'
              else 'flex-start')
        h, lead = dna['copy']
        cols = topo.get('columns') or topo.get('column_schedule')
        seam = topo.get('seam_style', 'hairline')
        return {'mode': 'topo',
                'payload': os.path.relpath(path, REPO)
                if path else row.get('recipe_id'),
                'preview_html':
                    f'<section class="block" data-dna="{scope}"'
                    f' data-seam="{_html.escape(str(seam))}"'
                    f' data-topo="{_html.escape(json.dumps(cols))}">'
                    f'<div class="inner" style="align-items:{al};'
                    f'text-align:'
                    f'{"center" if al == "center" else "left"}">'
                    + dom +
                    f'<h2 class="b-h">{_html.escape(str(h))}</h2>'
                    f'<p class="b-lead">{_html.escape(str(lead))}'
                    f'</p>'
                    f'<a class="b-cta">{_html.escape(str(dna["cta"]))}'
                    f'</a></div></section>',
                'adapt_css': ''}
    return {'mode': 'gen', 'payload': None,
            'preview_html': '', 'adapt_css': ''}
