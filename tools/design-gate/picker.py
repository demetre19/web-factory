#!/usr/bin/env python3
"""picker.py — the canonical selection-surface template. THE ONLY
picker markup in the system: one page-framed whole-section preview per
option (nav + the ENTIRE section once, full-bleed + footer, 1:1) +
modal close-up + checkbox select + real-variant siblings +
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

CSS = '''/* PICKER CHROME — a designed surface, not ad-hoc CSS. Every chrome
   value binds a token from CHROME_TOKENS below: the machinery's own
   vocabulary (utopia type scale, ACSS space/section-space rungs,
   emit_tokens semantic colour names, radius ladder, motion/z tokens).
   Neutral by law (VG.9): the palette is the canonical neutral sheet —
   accent lives only inside artwork scopes. */

:root {
  /* utopia type scale (templates/astro global.css, 320→1240, 16→19px,
     ratio 1.2→1.25) — chrome typography binds only these steps. */
  --fs--1: clamp(0.8335rem, 0.7621rem + 0.3571vi, 1.0128rem);
  --fs-0: clamp(1rem, 0.913rem + 0.4348vi, 1.1875rem);
  --fs-1: clamp(1.2rem, 1.0924rem + 0.538vi, 1.3906rem);
  --fs-2: clamp(1.44rem, 1.3064rem + 0.668vi, 1.6289rem);
  --fs-3: clamp(1.728rem, 1.5607rem + 0.8365vi, 1.9066rem);
  --lh--1: 1.5; --lh-0: 1.6; --lh-1: 1.5; --lh-3: 1.25;
  --font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI",
    Roboto, Helvetica, Arial, sans-serif;
  --font-mono: ui-monospace, "SF Mono", Menlo, monospace;
  --track-tight: -0.01em; --track-caps: 0.08em;

  /* ACSS spacing rungs (canon clamps) + layout tokens. */
  --space-xs: clamp(0.5rem, 0.4rem + 0.5vi, 1rem);
  --space-s: clamp(0.75rem, 0.55rem + 1vi, 1.5rem);
  --space-m: clamp(1rem, 0.65rem + 1.75vi, 2rem);
  --space-l: clamp(1.5rem, 1rem + 2.5vi, 3rem);
  --space-xl: clamp(2rem, 1.3rem + 3.5vi, 4rem);
  --section-space-xs: clamp(2rem, 1.5rem + 2.5vi, 4rem);
  --gutter: var(--space-m);
  --content-width: 80rem;
  --measure: 60ch;
  --grid-gap: var(--space-l);

  /* emit_tokens semantic colour layer — NEUTRAL sheet (VG.9).
     Same names a page binds; accent slots deliberately absent. */
  --bg-canvas: #ffffff; --bg-surface: #f6f6f5; --bg-elevated: #ffffff;
  --bg-subtle: #fafaf9; --bg-inverse: #111111;
  --text-primary: #222222; --text-secondary: #6f6f6f;
  --text-muted: #8f8f8f;
  --border-default: #dcdcdc; --border-strong: #bababa;
  --shadow-card: 0 1px 2px rgb(0 0 0 / 6%), 0 8px 24px rgb(0 0 0 / 7%);
  --shadow-pop: 0 4px 16px rgb(0 0 0 / 10%), 0 12px 40px rgb(0 0 0 / 9%);

  /* radius ladder (emit_tokens personality map: p1 .125 p2 .25
     p3 .5 p4 .75) + motion/z + the design-width constant the JS
     fit maths read — one source for 'real size'. */
  --radius-badge: 0.125rem; --radius-btn: 0.25rem;
  --radius-card: 0.625rem;
  --duration-fast: 150ms;
  --ease: cubic-bezier(0.2, 0.6, 0.2, 1);
  --z-overlay: 50;
  --pk-design-w: 1200px;
}

*{box-sizing:border-box;margin:0}
body{font-family:var(--font-sans);font-size:var(--fs-0);
line-height:var(--lh-0);background:var(--bg-canvas);
color:var(--text-primary);
padding:var(--section-space-xs) var(--gutter)}

/* proof-sheet header: kicker · title · one-line description · rule */
.pk-head{max-width:var(--pk-design-w);margin:0 auto var(--space-l);
padding-bottom:var(--space-m);
border-bottom:1px solid var(--border-strong)}
.pk-kicker{font-size:var(--fs--1);text-transform:uppercase;
letter-spacing:var(--track-caps);color:var(--text-muted)}
.pk-head h1{font-size:var(--fs-3);line-height:var(--lh-3);
letter-spacing:var(--track-tight);margin-top:var(--space-xs)}
.pk-head p{color:var(--text-secondary);margin-top:var(--space-xs);
max-width:var(--measure);font-size:var(--fs-0)}

.pk-grid{display:grid;grid-template-columns:1fr;gap:var(--grid-gap);
max-width:var(--pk-design-w);margin:0 auto}
.pk-card{border:1px solid var(--border-default);
border-radius:var(--radius-card);background:var(--bg-elevated);
display:flex;flex-direction:column;overflow:hidden;
box-shadow:var(--shadow-card)}
.pk-card[aria-checked="true"]{outline:2px solid var(--text-primary);
outline-offset:-2px}
.pk-frame{position:relative;overflow:hidden;background:var(--bg-canvas);
border-bottom:1px solid var(--border-default);width:100%}
.pk-frame .pk-scale{width:var(--pk-design-w);transform-origin:top left;
will-change:transform}
.pk-frame.flow .pk-scale{width:100%;transform:none}
.pk-page{min-height:calc(var(--pk-design-w)/4);display:flex;
flex-direction:column}
.pk-nav{display:flex;justify-content:space-between;align-items:center;
padding:var(--space-xs) var(--space-s);
border-bottom:1px solid var(--border-default);
background:var(--bg-subtle);color:var(--text-secondary);
font-size:var(--fs--1);letter-spacing:var(--track-caps);
text-transform:uppercase;flex:none}
.pk-foot{margin-top:auto;padding:var(--space-xs) var(--space-s);
border-top:1px solid var(--border-default);
background:var(--bg-subtle);color:var(--text-muted);
font-size:var(--fs--1);flex:none}

/* caption row — the proof label: badge · name · site-type */
.pk-cap{padding:var(--space-s) var(--space-m)
calc(var(--space-xs)/2)}
.pk-type{font-size:calc(var(--fs--1)*0.85);font-weight:700;
letter-spacing:var(--track-caps);text-transform:uppercase;
padding:calc(var(--space-xs)/4) calc(var(--space-xs)/2);
border:1px solid var(--border-default);
border-radius:var(--radius-badge);color:var(--text-secondary);
background:var(--bg-subtle);margin-right:calc(var(--space-xs)/2)}
.pk-name{font-weight:650;font-size:var(--fs-0)}
.pk-sub{display:block;color:var(--text-secondary);
font-size:var(--fs--1);margin-top:calc(var(--space-xs)/4)}

.pk-row{display:flex;gap:var(--space-xs);align-items:center;
padding:var(--space-xs) var(--space-m)}
.pk-sel{display:inline-flex;align-items:center;
gap:calc(var(--space-xs)/2);cursor:pointer;
padding:calc(var(--space-xs)/2) var(--space-xs);
border:1px solid var(--border-default);
border-radius:var(--radius-btn);font:inherit;
font-size:var(--fs--1);background:var(--bg-canvas);
color:var(--text-primary)}
.pk-sel:has(input:checked){outline:2px solid var(--text-primary);
outline-offset:-2px}
.pk-open{padding:calc(var(--space-xs)/2) var(--space-xs);
border:1px solid var(--border-default);background:var(--bg-canvas);
color:var(--text-primary);cursor:pointer;
border-radius:var(--radius-btn);font:inherit;font-size:var(--fs--1);
transition:border-color var(--duration-fast) var(--ease)}
.pk-sibs{border-top:1px solid var(--border-default);
padding:var(--space-xs) var(--space-m);background:var(--bg-subtle)}
.pk-sibs>span{font-size:var(--fs--1);text-transform:uppercase;
letter-spacing:var(--track-caps);color:var(--text-muted);
display:block;margin-bottom:var(--space-xs)}
.pk-sibrow{display:flex;gap:var(--space-xs);flex-wrap:wrap}
.pk-sib{width:32%;min-width:calc(var(--pk-design-w)/10.7);
border:1px solid var(--border-default);
border-radius:var(--radius-btn);overflow:hidden;
background:var(--bg-canvas);cursor:pointer}
.pk-sib .pk-frame{border-bottom:0}
.pk-sib-l{font-size:var(--fs--1);padding:calc(var(--space-xs)/2)
calc(var(--space-xs)/2);color:var(--text-muted);display:block}
.pk-data{border-top:1px solid var(--border-default);
padding:var(--space-xs) var(--space-m);color:var(--text-secondary);
background:var(--bg-elevated)}
.pk-data summary{cursor:pointer;font-size:var(--fs--1)}
.pk-data code{display:block;font-family:var(--font-mono);
font-size:var(--fs--1);padding:calc(var(--space-xs)/2) 0;
white-space:pre-wrap}

.pk-modal{display:none;position:fixed;inset:0;
background:rgb(0 0 0 / 74%);z-index:var(--z-overlay);
align-items:center;justify-content:center;flex-direction:column;
gap:var(--space-xs)}
.pk-modal.open{display:flex}
.pk-mframe{background:var(--bg-canvas);width:min(82vw,1180px);
max-height:78dvh;overflow:auto;border-radius:var(--radius-card);
box-shadow:var(--shadow-pop)}
.pk-mframe .pk-page{min-height:calc(var(--pk-design-w)/3)}
.pk-cap2{color:#fff;font-size:var(--fs--1);display:flex;
gap:var(--space-m);align-items:center}
.pk-tick{font-size:var(--fs-0);visibility:hidden}
.pk-tick.on{visibility:visible}'''

JS = '''\
<script>(function(){
var DW=1200,cards=[].slice.call(document.querySelectorAll(".pk-card")),cur=0,varIdx=0,
modal=document.getElementById("pk-modal"),
mf=document.getElementById("pk-mframe"),
mn=document.getElementById("pk-mname"),
mc=document.getElementById("pk-mcount"),
tk=document.querySelector(".pk-cap2 .pk-tick");
function box(i){return cards[i].querySelector("input.pk-check")}
function fitFrame(f){var sc=f.querySelector(".pk-scale");if(!sc)return;
var w=parseFloat(sc.style.width)||DW;
var s=Math.min(1,f.clientWidth/w);
sc.style.transform="scale("+s+")";
f.style.height=(sc.offsetHeight*s)+"px"}
function fitAll(){document.querySelectorAll(
'.pk-frame[data-frame="scale"]').forEach(fitFrame)}
window.addEventListener("resize",fitAll);
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitAll);
setTimeout(fitAll,60);setTimeout(fitAll,400);
function variantsOf(card){
var out=[];
var main=card.querySelector('.pk-frame[data-frame="scale"] .pk-scale');
if(main)out.push({el:main,label:'main design'});
card.querySelectorAll('.pk-sib').forEach(function(sb){
var sc=sb.querySelector('.pk-scale');
if(sc)out.push({el:sc,label:(sb.querySelector('.pk-sib-l')||{}).textContent||'variant'})});
return out}
function draw(){var card=cards[cur],vs=variantsOf(card);
if(varIdx>=vs.length)varIdx=0;
var v=vs[varIdx];
mf.innerHTML="";var wrap=document.createElement("div");
wrap.className="pk-frame";wrap.setAttribute("data-frame","scale");
wrap.style.borderBottom="0";
var sc=v.el.cloneNode(true);sc.style.width=DW+"px";
sc.style.transform="none";
wrap.appendChild(sc);mf.appendChild(wrap);
mf.style.width=Math.min(DW,Math.floor(window.innerWidth*0.92))+"px";
var s=Math.min(1,mf.clientWidth/DW);
sc.style.transform="scale("+s+")";
wrap.style.height=(sc.offsetHeight*s)+"px";
mn.textContent=card.dataset.name+" — "+card.dataset.subtitle;
mc.textContent="variant "+(varIdx+1)+"/"+vs.length+" · "+v.label;
tk.classList.toggle("on",box(cur)&&box(cur).checked)}
function open(){modal.classList.add("open");draw()}
cards.forEach(function(c,i){
var lbl=c.querySelector(".pk-sel"),inp=c.querySelector(".pk-check");
if(lbl&&inp){lbl.addEventListener("click",function(e){
e.stopPropagation()})}
var btn=c.querySelector(".pk-open");
if(btn){btn.addEventListener("click",function(){
cur=cards.indexOf(c);varIdx=0;open()})}
c.querySelectorAll(".pk-sib").forEach(function(s,si){
s.addEventListener("click",function(){
cur=cards.indexOf(c);varIdx=si+1;open()})});
c.addEventListener("click",function(e){
if(e.target.closest("details,.pk-sel,.pk-open,.pk-sib"))return;
cur=cards.indexOf(c);varIdx=0;open()})});
document.addEventListener("keydown",function(e){
if(!modal.classList.contains("open"))return;
if(e.key==="Escape")modal.classList.remove("open");
if(e.key==="ArrowLeft"){var n=variantsOf(cards[cur]).length;
varIdx=(varIdx-1+n)%n;draw()}
if(e.key==="ArrowRight"){var n=variantsOf(cards[cur]).length;
varIdx=(varIdx+1)%n;draw()}
if(e.key==="ArrowUp"){cur=(cur-1+cards.length)%cards.length;
varIdx=0;draw()}
if(e.key==="ArrowDown"){cur=(cur+1)%cards.length;varIdx=0;draw()}
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
                 frame_mode='scale', section_type=''):
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
        self.section_type = section_type


def _esc(v):
    return _h.escape(str(v), quote=True)


def _vars_css(scope_vars):
    return ';'.join(f'{k}:{v}' for k, v in
                    sorted(scope_vars.items()))


def _page_frame(inner_html):
    """Page context: nav strip + the WHOLE option section, once,
    full-bleed + footer sliver. The preview shows the entire section
    exactly as it would appear on the page."""
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
            '<div class="pk-frame" data-frame="scale" style="background:var(--bg-canvas)">'
            f'<div class="pk-scale" style="width:400px;'
            'transform-origin:top left;'
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
            + (f'<span class="pk-type">{_esc(it.section_type)}</span>'
               if it.section_type else '')
            + f'<span class="variant-name pk-name">{_esc(it.name)}</span>'
            f'<span class="pk-sub">{_esc(it.subtitle)}</span></div>\n'
            f'  <div class="pk-row">'
            f'<label class="pick pk-sel">{sel}select</label>'
            f'<button class="pk-open modal-open" data-d="{_esc(it.id)}">'
            f'review</button></div>\n'
            + _sibs(it) + _details(it) + '\n</article>')
    return ('<!doctype html><html><head><meta charset="utf-8">'
            '<meta name="viewport" content="width=device-width,'
            'initial-scale=1"><title>' + _esc(title) + '</title>'
            '<style>' + CSS +
            '\n' + '\n'.join(scopes) + extra_css + '</style></head><body>'
            '<header class="pk-head"><div class="pk-kicker">design proof · canonical picker</div><h1>' + _esc(title) + '</h1>'
            + (f'<p>{_esc(intro)}</p>' if intro else '') + '</header>'
            '<main class="pk-grid">' + '\n'.join(cards) + '</main>'
            '\n<div class="pk-modal" id="pk-modal" data-modal>'
            '<div class="pk-cap2 pk-cap"><span class="pk-tick">✓</span>'
            '<span id="pk-mname"></span><span id="pk-mcount"></span>'
            '<span>←/→ variants · ↑/↓ designs · space select · esc close</span></div>'
            '<div class="pk-mframe" id="pk-mframe"></div></div>' + JS +
            '</body></html>')
