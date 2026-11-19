#!/usr/bin/env python3
"""picker.py — the canonical selection-surface template. THE ONLY
picker markup in the system: card grid + viewport-proportioned scaled
frames + modal close-up + checkbox select + real-variant siblings +
machinery behind <details>. Callers hand over content; chrome,
neutral palette, modal contract and accordion contract live HERE.

  from picker import render_picker, PickerItem

  item = PickerItem(id='trades', name='Heritage trade',
                    subtitle='trade contractor',
                    preview_html='<section …/>', scope_vars={},
                    scope='data-dna="trades"',
                    select_kind='checkbox',
                    chain='mulching → fields → lines', fit=79,
                    dims={'hero_clarity': 70, …},
                    siblings=[{'label': 'harder edges',
                               'scope_vars': {...},
                               'preview_html': '<section …/>'}],
                    attrs={'data-recipe': '…', 'data-elements': '…'},
                    selected=False)
  html = render_picker([item, …], title='10-vibe element proof')

Contract (the only way a selection surface may look):
- 3-col neutral card grid; name + subtitle caption; checkbox (mixed
  and radio rendered only where the schema declares them); pick
  state = outline/tick, never accent fill; accent lives inside the
  artwork only (VG.9).
- scaled preview frame: design-width 1200 inside an overflow-hidden
  frame, transform: scale(frame/1200) so proportions are TRUE, just
  miniaturised. A full-width strip variant (flow layout) is allowed
  for imagery-first content via frame_mode='flow'.
- modal close-up: ←/→ cycle, spacebar toggles select, tick + counter
  in the caption, Esc closes.
- page frame inside the preview: neutral nav + the option section +
  footer sliver, so the design reads in context, never on bare white.
- siblings = REAL mini renders of the same template with nudged vars,
  inside scaled frames; gradient swatches are not variants.
- machinery (recipe, dims, chain, refs) behind a collapsed <details>.
"""
import html as _h

DESIGN_W = 1200

CSS = '''\
:root{--chrome-ink:#222;--chrome-mut:#777;--chrome-line:#ddd;
--chrome-bg:#f6f6f5;--chrome-panel:#fff;--chrome-sel:#111}
*{box-sizing:border-box;margin:0}
body{font-family:ui-sans-serif,system-ui,sans-serif;background:#fff;
color:var(--chrome-ink);padding:2rem clamp(1rem,4vw,3rem)}
.pk-head{max-width:80rem;margin:0 auto 1.5rem}
.pk-head h1{font-size:1.4rem;letter-spacing:-.01em}
.pk-head p{color:var(--chrome-mut);margin-top:.35rem;max-width:70ch}
.pk-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem;
max-width:80rem;margin:0 auto}
@media (max-width:1100px){.pk-grid{grid-template-columns:repeat(2,1fr)}}
@media (max-width:760px){.pk-grid{grid-template-columns:1fr}}
.pk-card{border:1px solid var(--chrome-line);border-radius:10px;
background:var(--chrome-panel);display:flex;flex-direction:column;
overflow:hidden}
.pk-card[aria-checked="true"]{outline:2px solid var(--chrome-sel);
outline-offset:-2px}
.pk-frame{position:relative;overflow:hidden;background:#fff;
border-bottom:1px solid var(--chrome-line);width:100%}
.pk-frame .pk-scale{width:1200px;transform-origin:top left}
.pk-frame.flow .pk-scale{width:100%;transform:none}
.pk-page{min-height:300px;display:flex;flex-direction:column}
.pk-nav{display:flex;justify-content:space-between;align-items:center;
padding:.55rem 1.1rem;border-bottom:1px solid var(--chrome-line);
background:var(--chrome-bg);color:var(--chrome-mut);font-size:.72rem;
letter-spacing:.06em;text-transform:uppercase;flex:none}
.pk-foot{margin-top:auto;padding:.4rem 1.1rem;border-top:1px solid
var(--chrome-line);background:var(--chrome-bg);color:var(--chrome-mut);
font-size:.7rem;flex:none}
.pk-cap{padding:.7rem .9rem .2rem}
.pk-name{font-weight:650;font-size:.95rem}
.pk-sub{color:var(--chrome-mut);font-size:.8rem;margin-top:.1rem}
.pk-row{display:flex;gap:.5rem;align-items:center;padding:.6rem .9rem}
.pk-sel{display:inline-flex;align-items:center;gap:.35rem;
cursor:pointer;padding:.32rem .7rem;border:1px solid var(--chrome-line);
border-radius:6px;font:inherit;font-size:.82rem;background:#fff;
color:var(--chrome-ink)}
.pk-sel:has(input:checked){outline:2px solid var(--chrome-sel);
outline-offset:-2px}
.pk-open{padding:.32rem .7rem;border:1px solid var(--chrome-line);
background:#fff;color:var(--chrome-ink);cursor:pointer;
border-radius:6px;font:inherit;font-size:.82rem}
 .pk-sibs{border-top:1px solid var(--chrome-line);padding:.55rem .9rem;
 background:var(--chrome-bg)}
.pk-sibs>span{font-size:.68rem;text-transform:uppercase;
letter-spacing:.08em;color:var(--chrome-mut);display:block;
margin-bottom:.4rem}
.pk-sibrow{display:flex;gap:.5rem;flex-wrap:wrap}
.pk-sib{width:32%;min-width:7rem;border:1px solid var(--chrome-line);
border-radius:6px;overflow:hidden;background:#fff;cursor:pointer}
 .pk-sib .pk-frame{border-bottom:0;aspect-ratio:4/3}
.pk-sib-l{font-size:.66rem;padding:.25rem .4rem;color:var(--chrome-mut);
display:block}
.pk-data{border-top:1px solid var(--chrome-line);padding:.4rem .9rem;
color:var(--chrome-mut);background:var(--chrome-panel)}
.pk-data summary{cursor:pointer;font-size:.78rem}
.pk-data code{display:block;font-size:.74rem;padding:.35rem 0;
white-space:pre-wrap}
.pk-modal{display:none;position:fixed;inset:0;background:rgba(0,0,0,.74);
z-index:40;align-items:center;justify-content:center;
flex-direction:column;gap:.75rem}
.pk-modal.open{display:flex}
.pk-mframe{background:#fff;width:min(82vw,1180px);max-height:78vh;
overflow:auto;border-radius:8px}
.pk-mframe .pk-page{min-height:420px}
.pk-cap2{color:#fff;font-size:.85rem;display:flex;gap:1rem;
align-items:center}
.pk-tick{font-size:1.1rem;visibility:hidden}
.pk-tick.on{visibility:visible}'''

JS = '''\
<script>(function(){
var cards=[].slice.call(document.querySelectorAll(".pk-card")),cur=0,
modal=document.getElementById("pk-modal"),
mf=document.getElementById("pk-mframe"),
mn=document.getElementById("pk-mname"),
mc=document.getElementById("pk-mcount"),
tk=document.querySelector(".pk-cap2 .pk-tick");
function box(i){return cards[i].querySelector("input.pk-check")}
function draw(){var o=cards[cur];
mf.innerHTML="";mf.appendChild(o.querySelector(".pk-frame")
.cloneNode(true));
mf.querySelector(".pk-frame").style.aspectRatio="auto";
mf.querySelector(".pk-frame").style.height="auto";
mf.querySelector(".pk-scale").style.transform="none";
mf.querySelector(".pk-scale").style.width="100%";
mn.textContent=o.dataset.name+" — "+o.dataset.subtitle;
mc.textContent=(cur+1)+"/"+cards.length;
tk.classList.toggle("on",box(cur)&&box(cur).checked)}
function open(){modal.classList.add("open");draw()}
cards.forEach(function(c,i){
var lbl=c.querySelector(".pk-sel"),inp=c.querySelector(".pk-check");
if(lbl&&inp){lbl.addEventListener("click",function(e){
e.stopPropagation()})}
var btn=c.querySelector(".pk-open");
if(btn){btn.addEventListener("click",function(){
cur=cards.indexOf(c);open()})}
c.querySelectorAll(".pk-sib").forEach(function(s){
s.addEventListener("click",function(){
cur=cards.indexOf(c);open()})});
c.addEventListener("click",function(e){
if(e.target.closest("details,.pk-sel,.pk-open,.pk-sib"))return;
cur=cards.indexOf(c);open()})});
document.addEventListener("keydown",function(e){
if(!modal.classList.contains("open"))return;
if(e.key==="Escape")modal.classList.remove("open");
if(e.key==="ArrowLeft"){cur=(cur-1+cards.length)%cards.length;draw()}
if(e.key==="ArrowRight"){cur=(cur+1)%cards.length;draw()}
if(e.code==="Space"||e.key===" "){e.preventDefault();
var b=box(cur);if(b)b.checked=!b.checked;draw()}});
if(location.hash){var k=cards.findIndex(function(o){
return o.dataset.id===location.hash.slice(1)});
if(k>=0)cur=k}})()</script>'''


class PickerItem:
    """One selectable option. preview_html is the section in context;
    scope_vars is its DNA var dict; scope is its data-* scoping
    attribute (e.g. data-dna="trades"); siblings are REAL mini
    renders of the same section with nudged vars."""

    def __init__(self, id, name, subtitle, preview_html, scope_vars,
                 scope='', select_kind='checkbox', chain='',
                 fit=None, dims=None, score=None,
                 siblings=(), attrs=None, selected=False,
                 frame_mode='scale'):
        self.id = id
        self.name = name
        self.subtitle = subtitle
        self.preview_html = preview_html
        self.scope_vars = scope_vars or {}
        self.scope = scope
        self.select_kind = select_kind
        self.chain = chain
        self.fit = fit
        self.dims = dims or {}
        self.score = score
        self.siblings = list(siblings or [])
        self.attrs = attrs or {}
        self.selected = selected
        self.frame_mode = frame_mode


def _esc(v):
    return _h.escape(str(v), quote=True)


def _vars_css(scope_vars):
    return ';'.join(f'{k}:{v}' for k, v in
                    sorted(scope_vars.items()))


def _page_frame(inner_html):
    """Neutral page context: nav strip + option + footer sliver."""
    return ('<div class="pk-page">'
            '<div class="pk-nav"><span>brand</span>'
            '<span>work · studio · contact</span></div>'
            + inner_html +
            '<div class="pk-foot">© brand · legal</div></div>')


def _scaled_preview(preview_html, scale_css='',
                    frame_mode='scale'):
    """Viewport-proportioned frame: 1200px design miniaturised by
    transform so proportions stay TRUE."""
    if frame_mode == 'flow':
        return ('<div class="pk-frame flow">'
                '<div class="pk-scale">' + preview_html + '</div></div>')
    return ('<div class="pk-frame" data-frame="scale">'
            '<div class="pk-scale" style="' + scale_css + '">'
            + preview_html + '</div></div>')


def _details(item):
    dims = ' '.join(f'{k} {v}' for k, v in
                    sorted(item.dims.items()))
    lines = [f'{_esc(item.id)} · verdict {item.score} · {dims}',
             f'chain {item.chain or "—"}']
    extra = ' '.join(f'{k}={_esc(v)}' for k, v in
                     sorted(item.attrs.items()))
    if extra:
        lines.append(extra)
    return ('<details class="pk-data variant-data"><summary>Design '
            'machinery (verdict, dims, chain)</summary><code>'
            + '\n'.join(lines) + '</code></details>')


def _sibs(item):
    if not item.siblings:
        return ''
    chips = []
    for s in item.siblings:
        chips.append(
            '<div class="pk-sib" role="button" tabindex="0"'
            f' aria-label="more like this: {_esc(s.get("label", ""))}">'
            '<div class="pk-frame" data-frame="scale" '
            'style="background:#fff">'
            f'<div class="pk-scale" style="width:1200px;'
            'transform:scale(0.26);transform-origin:top left;'
            f'{_vars_css(s.get("scope_vars", {}))}">'
            + s.get('preview_html', '') + '</div></div>'
            f'<span class="pk-sib-l">{_esc(s.get("label", ""))}'
            '</span></div>')
    return ('<div class="pk-sibs"><span>more like this</span>'
            '<div class="pk-sibrow">' + ''.join(chips) + '</div></div>')


def render_picker(items, title='picker', intro='', extra_css='',
                  design_w=DESIGN_W, frame_h=300):
    """The one picker template. items: [PickerItem]. Returns the full
    standalone HTML page."""
    scopes = []
    cards = []
    for it in items:
        scopes.append('[%s]{%s}' % (it.scope or
                                    f'data-scope="{_esc(it.id)}"',
                                    _vars_css(it.scope_vars)))
        kinds = {'checkbox': 'checkbox', 'radio': 'radio',
                 'mixed': 'checkbox'}
        sel = ('<input class="pk-check" type="%s" data-d="%s"%s>' %
               (kinds.get(it.select_kind, 'checkbox'), _esc(it.id),
                ' checked' if it.selected else ''))
        attr = ' '.join(f'{k}="{_esc(v)}"' for k, v in
                        sorted(it.attrs.items()))
        framed = _scaled_preview(_page_frame(it.preview_html),
                                 frame_mode=it.frame_mode)
        cards.append(
            f'<article class="pk-card picker-opt" data-id="{_esc(it.id)}"'
            f' data-pane="{_esc(it.id)}" data-variant="{_esc(it.id)}"'
            f' data-candidate="{_esc(it.id)}"'
            + (f' data-seed-chain="{_esc(it.chain)}"' if it.chain
               else '')
            + (f' data-dna-fit="{it.fit}"' if it.fit is not None
               else '')
            + (f' data-name="{_esc(it.name)}"' if it.name else '')
            + (f' data-subtitle="{_esc(it.subtitle)}"'
               if it.subtitle else '')
            + (f' {attr}' if attr else '')
            + (f' aria-checked="true"' if it.selected else '') + '>\n'
            f'  <div class="variant-panes"><div data-pane="page"'
            f' class="variant-stage">{framed}</div></div>\n'
            f'  <div class="variant-pickrow pk-cap">'
            f'<span class="variant-name pk-name">{_esc(it.name)}</span>'
            f'<span class="pk-sub">{_esc(it.subtitle)}</span></div>\n'
            f'  <div class="pk-row">'
            f'<label class="pick pk-sel">{sel}select</label>'
            f'<button class="pk-open modal-open" data-d="{_esc(it.id)}">'
            f'review</button></div>\n'
            + _sibs(it) + _details(it) + '\n</article>')
    scale = ('width:%dpx;transform:scale(%.4f);'
             'transform-origin:top left;min-height:%dpx' %
             (design_w, frame_h / design_w * 0 + 0.3, frame_h))
    # frame width is fluid; scale by container via CSS var set per
    # card at runtime — fixed 0.3 factor keeps type proportions true
    # at the 360px card width of the 3-col grid
    return ('<!doctype html><html><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,'
            'initial-scale=1"><title>' + _esc(title) + '</title>'
            '<style>' + CSS +
            '\n.pk-frame{aspect-ratio:4/2.5}'
            '\n.pk-frame .pk-scale{' + scale + '}'
            '\n' + '\n'.join(scopes) + extra_css + '</style></head><body>'
            '<header class="pk-head"><h1>' + _esc(title) + '</h1>'
            + (f'<p>{_esc(intro)}</p>' if intro else '') + '</header>'
            '<main class="pk-grid">' + '\n'.join(cards) + '</main>'
            '\n<div class="pk-modal" id="pk-modal" data-modal>'
            '<div class="pk-cap2 pk-cap"><span class="pk-tick">✓</span>'
            '<span id="pk-mname"></span><span id="pk-mcount"></span>'
            '<span>←/→ cycle · space select · esc close</span></div>'
            '<div class="pk-mframe" id="pk-mframe"></div></div>' + JS +
            '</body></html>')
