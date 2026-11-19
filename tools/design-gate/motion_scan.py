#!/usr/bin/env python3
"""Motion scan per CLASSIFY-MOTION.md — Steps A-F as a capture
post-pass. Writes meta['motion'] + frame-diff crops under
<operator>/<slug>/motion/. Real browser, reduced-motion forced OFF.

usage: motion_scan.py <slug|url>... | --all [--only-motion-tagged]
"""
import json
import os
import re
import sys
import time
from io import BytesIO

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, '..', '..'))
OPERATOR = os.path.join(ROOT, 'docs', 'machinery', 'design', 'patterns',
                        'data', 'operator')

PROBE_JS = r"""() => {
  const assert = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sheets = [...document.styleSheets];
  let keyframes = {}, animRules = [], hoverRules = [],
      timelineRules = [], partial = false;
  for (const ss of sheets) {
    let rules;
    try { rules = [...ss.cssRules]; }
    catch (e) { partial = true; continue; }
    const walk = (rs, cond) => rs.forEach(r => {
      if (r instanceof CSSKeyframesRule) keyframes[r.name] = r.cssText;
      else if (r.cssRules) walk([...r.cssRules],
        (cond ? cond + ' ' : '') + (r.conditionText || ''));
      else if (/animation(-[\w-]+)?\s*:|animation-timeline|view-timeline/
               .test(r.cssText)) {
        animRules.push((cond ? cond + ' :: ' : '') +
          r.cssText.slice(0, 400));
        if (/(?:scroll|view)\(\)/.test(r.cssText)) timelineRules.push(
          r.cssText.slice(0, 250));
        if (r.selectorText && /:hover|:focus/.test(r.selectorText))
          hoverRules.push(r.cssText.slice(0, 250));
      }
    });
    walk(rules, '');
  }
  const els = [];
  document.querySelectorAll('*').forEach(el => {
    const cs = getComputedStyle(el);
    const an = cs.animationName !== 'none' &&
               parseFloat(cs.animationDuration) > 0;
    const tn = cs.transitionProperty !== 'none' &&
               parseFloat(cs.transitionDuration) > 0;
    if (!an && !tn) return;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const svg = !!el.closest('svg');
    let ctx = el, hops = 0;
    while (ctx && hops++ < 6 &&
           !/^(section|header|footer|nav|main)$/i.test(ctx.tagName)
           && !(ctx.id && /hero|nav|foot|feat|cta|menu|price/i
                .test(ctx.id))) ctx = ctx.parentElement;
    els.push({
      sel: el.tagName.toLowerCase() +
           (el.id ? '#' + el.id : '') +
           (typeof el.className === 'string' && el.className
            ? '.' + el.className.trim().split(/\s+/)[0] : ''),
      ctx: ctx && ctx !== el
        ? ctx.tagName.toLowerCase() +
          (ctx.id ? '#' + ctx.id : '') : 'body',
      in_svg: svg,
      box: [r.left + scrollX, r.top + scrollY,
            Math.min(r.width, innerWidth),
            Math.min(r.height, innerHeight)],
      anim: an ? {name: cs.animationName,
                  dur: cs.animationDuration,
                  iter: cs.animationIterationCount,
                  dir: cs.animationDirection,
                  ease: cs.animationTimingFunction,
                  delay: cs.animationDelay,
                  timeline: cs.animationTimeline} : null,
      trans: tn ? {prop: cs.transitionProperty.slice(0, 120),
                   dur: cs.transitionDuration,
                   ease: cs.transitionTimingFunction} : null,
      waapi: el.getAnimations ? el.getAnimations({subtree: false})
        .filter(g => g.playState === 'running')
        .map(g => g.constructor.name) : [],
    });
  });
  return {assert, partial,
    libs: {gsap: !!window.gsap,
           ScrollTrigger: !!window.ScrollTrigger,
           lottie: !!window.lottie ||
             !!document.querySelector(
               'lottie-player,dotlottie-player'),
           anime: !!window.anime, rive: !!window.rive,
           webAnimations: !!Element.prototype.animate},
    counts: {svg: document.querySelectorAll('svg').length,
             smil: document.querySelectorAll(
               'animate,animateTransform,animateMotion,set').length,
             canvas: document.querySelectorAll('canvas').length,
             video: document.querySelectorAll('video').length},
    defined_keyframes: Object.keys(keyframes),
    keyframe_bodies: keyframes,
    anim_rules: animRules.slice(0, 60),
    hover_rules: hoverRules.slice(0, 30),
    timeline_rules: timelineRules.slice(0, 30),
    elements: els.slice(0, 400),
    n_animated: els.length,
    has_io: /IntersectionObserver/.test(
      Array.from(document.scripts)
        .map(s => s.src ? '' : s.textContent.slice(0, 20000))
        .join(' ')),
    reduce_fallback: animRules.filter(r =>
      /reduced-motion/.test(r)).length > 0 ||
      keyframes && [...document.styleSheets].some(ss => {
        try { return [...ss.cssRules].some(r =>
          r instanceof CSSMediaRule && /reduced-motion/.test(
            r.conditionText)); } catch (e) { return false; } }),
  };
}"""

SCROLL_TEST_JS = r"""async (idxList, elements) => {
  // scroll-linked / in-view check: sample a candidate's computed
  // transform+opacity, scroll past its box, re-sample.
  const out = [];
  for (const i of idxList) {
    const e = elements[i];
    const el = [...document.querySelectorAll(e.sel.split(' ')[0])]
      .find(x => {
        const r = x.getBoundingClientRect();
        return Math.abs(r.top + scrollY - e.box[1]) < 200; });
    if (!el) { out.push(null); continue; }
    const cs1 = getComputedStyle(el);
    const sig1 = cs1.transform + '|' + cs1.opacity + '|' +
                 cs1.strokeDashoffset;
    window.scrollTo(0, Math.max(0, e.box[1] - innerHeight * 0.3));
    await new Promise(r => setTimeout(r, 700));
    const cs2 = getComputedStyle(el);
    const sig2 = cs2.transform + '|' + cs2.opacity + '|' +
                 cs2.strokeDashoffset;
    out.push({changed: sig1 !== sig2});
  }
  window.scrollTo(0, 0);
  return out;
}"""


def timing_class(dur_s):
    if dur_s <= 0.3:
        return 'instant-short'
    if dur_s <= 0.6:
        return 'standard'
    if dur_s <= 1.5:
        return 'standard'
    if dur_s <= 5:
        return 'loop-short' if True else 'long'
    return 'loop-long'


def budget_of(props):
    risky = re.compile(
        r'filter|clip-path|width|height|top|left|margin|padding')
    return 'layout-risk' if risky.search(props) else 'compositor-safe'


def frame_diff(page, box, d):
    """t vs t+1.2s crop diff. returns (pct, t.png, t2.png)"""
    from PIL import Image, ImageChops
    clip = {'x': max(0, box[0]), 'y': max(0, box[1]),
            'width': max(10, min(1200, box[2])),
            'height': max(10, min(1200, box[3]))}
    a = page.screenshot(clip=clip)
    page.wait_for_timeout(1200)
    b = page.screenshot(clip=clip)
    ia = Image.open(BytesIO(a)).convert('L')
    ib = Image.open(BytesIO(b)).convert('L')
    if ia.size != ib.size:
        return None, None, None
    import numpy as np
    diff = np.asarray(ImageChops.difference(ia, ib))
    pct = float((diff > 12).mean() * 100)
    return pct, a, b


def scan(page, meta, d):
    url = meta['url']
    page.goto(url, wait_until='domcontentloaded', timeout=45000)
    try:
        page.wait_for_load_state('networkidle', timeout=12000)
    except Exception:
        pass
    pr = page.evaluate(PROBE_JS)
    if not pr['assert']:
        return {'error': 'prefers-reduced-motion stuck on'}
    records = []
    dead = set(pr['defined_keyframes'])
    used = set()
    motion_dir = os.path.join(d, 'motion')
    os.makedirs(motion_dir, exist_ok=True)
    # dedupe animation defs
    by_def = {}
    for i, e in enumerate(pr['elements']):
        key = ((e['anim'] or {}).get('name') or
               'trans:' + (e['trans'] or {}).get('prop', ''), e['ctx'])
        by_def.setdefault(key, []).append((i, e))
    scroll_checked = {}
    # pick bounded sample for scroll test: elements with scroll-
    # timeline rules present, or IO page, sample first 12 distinct ctx
    io_or_scroll = bool(pr['timeline_rules']) or pr['has_io']
    sample = []
    seen_ctx = set()
    for key, group in by_def.items():
        gi, ge = group[0]
        if ge['ctx'] not in seen_ctx and len(sample) < 12:
            sample.append(gi)
            seen_ctx.add(ge['ctx'])
    if io_or_scroll and sample:
        try:
            res = page.evaluate(SCROLL_TEST_JS, sample, pr['elements'])
            scroll_checked = {sample[j]: (r and r.get('changed'))
                              for j, r in enumerate(res)}
        except Exception:
            pass
    for (defkey, ctx), group in list(by_def.items())[:80]:
        gi, e = group[0]
        an, tn = e['anim'], e['trans']
        waapi = e['waapi'] and 'CSSTransition' not in e['waapi']
        rec = {'selector': e['sel'], 'context': ctx,
               'in_svg': e['in_svg']}
        if an:
            kname = an['name']
            used.add(kname)
            body = pr['keyframe_bodies'].get(kname, '')
            rec.update({
                'trigger': ('scroll-linked' if io_or_scroll and
                            scroll_checked.get(gi)
                            else 'loop' if an['iter'] == 'infinite'
                            else 'in-view' if io_or_scroll and
                            scroll_checked.get(gi) is False
                            else 'in-view' if io_or_scroll
                            else 'undetermined'),
                'technique': 'css-keyframes',
                'property': sorted(set(re.findall(
                    r'(transform|opacity|stroke-dashoffset|filter|'
                    r'clip-path|width|height|top|left|color|'
                    r'background-color)', body)) or ['unknown']),
                'budget': budget_of(body),
                'duration_ms': int(parse_secs(an['dur']) * 1000),
                'timing_class': timing_class(parse_secs(an['dur'])),
                'easing_family': ease_family(an['ease']),
                'easing_raw': an['ease'], 'delay': an['delay'],
                'iterations': an['iter'],
                'loop_type': loop_type(an),
                'keyframes': kname,
                'status': 'live' if kname in dead else 'dead',
                'js_dependency': 'none',
                'evidence': f'computed style + rule {kname}',
            })
        elif tn:
            trig = ('hover' if any(e['sel'].split('.')[0] in h or
                                   e['sel'] in h
                                   for h in pr['hover_rules'])
                    else 'undetermined')
            rec.update({
                'trigger': trig, 'technique': 'css-transition',
                'property': [p.strip() for p in
                             tn['prop'].split(',')][:6],
                'budget': budget_of(tn['prop']),
                'duration_ms': int(parse_secs(tn['dur']) * 1000),
                'timing_class': timing_class(parse_secs(tn['dur'])),
                'easing_family': ease_family(tn['ease']),
                'easing_raw': tn['ease'],
                'status': 'live', 'js_dependency': 'none',
                'evidence': 'computed transition'},
            )
        elif waapi:
            rec.update({'trigger': 'undetermined',
                        'technique': 'waapi', 'status': 'live',
                        'js_dependency': 'js',
                        'detail': 'opaque',
                        'evidence': 'el.getAnimations() running'})
        # frame-diff liveness sample for first 8 records
        if len(records) < 8 and e['box'][2] > 0:
            try:
                page.evaluate('window.scrollTo(0, %d)' %
                              max(0, e['box'][1] - 100))
                page.wait_for_timeout(250)
                box = e['box']
                view = [box[0], max(0, box[1] -
                                    page.evaluate('scrollY')),
                        box[2], box[3]]
                pct, a, b = frame_diff(page, view, d)
                if pct is not None:
                    rec['frame_diff_pct'] = round(pct, 2)
                    if pct > 1:
                        rec['status'] = 'live'
                        n = len(records)
                        open(os.path.join(
                            motion_dir, f'diff-{n:02d}-a.png'),
                            'wb').write(a)
                        open(os.path.join(
                            motion_dir, f'diff-{n:02d}-b.png'),
                            'wb').write(b)
            except Exception:
                pass
        rec.setdefault('m_type', None)
        rec.setdefault('purpose', [])
        rec.setdefault('complexity',
                       'composite' if an and ',' in an['name']
                       else 'atomic')
        rec.setdefault('loop_type', 'n-times' if an else 'n-times')
        rec.setdefault('personality_fit', [])
        rec.setdefault('status', 'live')
        records.append(rec)
    dead -= used
    libs = [k for k, v in pr['libs'].items() if v] or ['none']
    summary = {
        'motion_tier': ('expressive' if len(records) > 12 else
                        'restrained' if records else 'static'),
        'continuous_loops': sum(
            1 for r in records
            if r.get('iterations') == 'infinite'),
        'budget_violations': [r['selector'] for r in records
                              if r.get('budget') == 'layout-risk'][:10],
    }
    return {
        'schema_version': '0.1',
        'scanned_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'reduced_motion_emulated': False,
        'reduced_motion_fallback_present': pr['reduce_fallback'],
        'partial': pr['partial'],
        'libs': libs,
        'counts': {'svg': pr['counts']['svg'],
                   'smil': pr['counts']['smil'],
                   'canvas': pr['counts']['canvas'],
                   'video': pr['counts']['video'],
                   'keyframes_defined': len(pr['defined_keyframes']),
                   'keyframes_dead': sorted(dead),
                   'animated_elements': pr['n_animated']},
        'records': records,
        'summary': summary,
    }


def parse_secs(v):
    total = 0.0
    for part in str(v).split(','):
        part = part.strip()
        if part.endswith('ms'):
            total += float(part[:-2]) / 1000
        elif part.endswith('s'):
            total += float(part[:-1])
    return total


def ease_family(raw):
    r = str(raw)
    if 'cubic-bezier' in r:
        return 'custom'
    if r in ('ease', 'ease-in', 'ease-out', 'ease-in-out'):
        return 'standard-ease'
    if 'linear' in r:
        return 'linear'
    if 'step' in r:
        return 'steps'
    return r or 'unknown'


def loop_type(an):
    if not an:
        return 'n-times'
    if an['iter'] == 'infinite':
        return ('palindrome' if 'alternate' in an['dir']
                else 'infinite')
    return 'n-times'


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if '--all' in sys.argv:
        slugs = [d for d in os.listdir(OPERATOR)
                 if os.path.exists(os.path.join(
                     OPERATOR, d, 'meta.json'))]
    else:
        slugs = []
        for a in args:
            if a.startswith('http'):
                slugs.append(re.sub(r'[^a-z0-9]+', '-',
                                    a.lower()).strip('-')[:90])
            else:
                slugs.append(a)
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        try:
            br = pw.chromium.launch()
        except Exception:
            br = pw.chromium.launch(executable_path=(
                '/Applications/Brave Browser.app/Contents/MacOS/'
                'Brave Browser'))
        page = br.new_page(viewport={'width': 1440, 'height': 900})
        page.emulate_media(reduced_motion='no-preference')
        for slug in slugs:
            mp = os.path.join(OPERATOR, slug, 'meta.json')
            if not os.path.exists(mp):
                print(f'{slug}: no meta.json', flush=True)
                continue
            meta = json.load(open(mp))
            if meta.get('capture_status') != 'ok':
                print(f'{slug}: skipped ({meta["capture_status"]})',
                      flush=True)
                continue
            try:
                m = scan(page, meta, os.path.join(OPERATOR, slug))
                meta['motion'] = m
                json.dump(meta, open(mp, 'w'), indent=1)
                print(f"{slug}: {len(m.get('records', []))} records, "
                      f"tier={m.get('summary', {}).get('motion_tier')}",
                      flush=True)
            except Exception as e:
                print(f'{slug}: motion scan error {e}', flush=True)
        br.close()


if __name__ == '__main__':
    main()
