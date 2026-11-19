#!/usr/bin/env python3
"""Section-level gemini tagging: every section-bank row gets
{section_type, composition, style, mood, tone} under the EXTENDED
closed vocab, written into the section-bank index row's style_tags +
topo. Extends (doesn't restart) — rows with section_type_v2 already
tagged by this schema are skipped unless --reclass.

  python3 section_tags.py [--limit N]
"""
import base64
import json
import os
import sys
import time
import urllib.request
import urllib.error
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.normpath(os.path.join(HERE, '..', 'data'))
REPO = os.path.normpath(os.path.join(HERE, '..', '..', '..',
                                     '..', '..'))
IDX = os.path.join(DATA, 'section-bank', 'index.json')
MODEL = 'google/gemini-2.5-flash-lite'
URL = 'https://openrouter.ai/api/v1/chat/completions'
KEY_FILE = os.path.normpath(os.path.join(
    HERE, '..', '..', '..', '..', '..', '..', 'SECRETS', 'OR-API.txt'))

SECTION_PROMPT = """Look at this web page SECTION crop. Reply with ONLY a JSON object:
{"section_type": pick ONE most-specific from [hero, hero-split, hero-split-reverse, hero-centered, hero-video,
hero-fullbleed, hero-minimal, nav, megamenu, sidebar-nav,
logo-bar, logo-marquee, announcement-bar, banner,
feature-grid, feature-list, feature-split, feature-showcase,
feature-accordion, stats, counters, numbers-banner,
testimonials, testimonial-single, quote, review-cards, ratings-row,
pricing, pricing-comparison, pricing-cards, faq, faq-accordion,
faq-grid, cta, cta-banner, cta-split, cta-minimal, cta-form,
footer, footer-slim, footer-mega, footer-cta,
gallery, work-grid, portfolio-grid, masonry-grid, team, team-grid,
about, about-founder, about-story, values,
blog-cards, blog-featured, blog-list, blog-sidebar, editorial-article,
product-grid, product-feature, product-comparison, product-detail,
steps, process, timeline, how-it-works,
contact, contact-split, form, form-multi, map, newsletter,
subscribe-minimal, comparison-table, table, spec-table,
video, video-embed, carousel, slider, horizontal-scroll,
marquee, divider, divider-cta, spacer-ornament,
error-404, coming-soon, auth, login, signup, dashboard,
docs, docs-nav, sidebar, breadcrumbs, comments, related-posts,
partners, awards, press-logos, certifications,
app-store-cta, download, changelog, newsletter-archive,
community, forum-preview, integrations, api-docs,
location-grid, hours-info, menu-items, booking-widget,
donation-banner, mission-statement, impact-stats, volunteer-cta,
legal-disclaimer, cookie-notice, other],
 "composition": one of [centered, split-left-media, split-right-media, asymmetric,
grid-uniform, grid-masonry, grid-bento, stacked, overlapping,
horizontal-scroll, offset-columns, column-2, column-3, column-4+,
z-layout, full-bleed],
 "media_role": one of [none, hero-image, product-shot, avatar-group, logo-field, icon-row,
video-thumb, map, device-mockup, illustration, photo-collage,
background-photo, background-video, texture-only, chart],
 "text_role": one of [headline-only, headline-subhead, headline-subhead-cta,
eyebrow-headline-body-cta, dense-copy, quote-led, list-led,
form-led, data-led],
 "style": zero or more of [minimal, editorial, luxury, playful, technical, brutalist, retro,
corporate, artisanal, futuristic, organic, geometric, swiss,
magazine, neo-brutalist, bento, glassmorphism, skeuomorphic,
maximalist, avant-garde, traditional, japanese, scandinavian,
memphis, y2k, grunge, deco, colonial, botanical, cosmic, western,
industrial, rustic, gothic, cyber, vaporwave],
 "mood": zero or more of [calm, warm, moody, energetic, solemn, confident, playful, dramatic,
serene, bold, clinical, cozy, edgy, mysterious, joyful, luxurious,
aggressive, contemplative, rebellious, reassuring],
 "tone": one of [light, dark, mixed, high-contrast, inverted-sections],
 "height_band": one of [short-under-300, standard-300-700, tall-700-1400, full-viewport,
extra-tall-1400+],
 "content_weight": one of [sparse, light, medium, dense, maximal],
 "interaction": one of [static, hover-reveals, accordion-expands, carousel-arrows,
scroll-animated, marquee-loop, form-active, filterable],
 "conversion_role": one of [awareness, interest, consideration, decision, action, support],
 "confidence": 0..1}
Judge the section's own visual treatment. Unknown -> "other" + low
confidence; never invent labels."""


def api_key():
    k = os.environ.get('OPENROUTER_API_KEY', '').strip()
    return k or open(KEY_FILE).read().strip()


def img_block(path):
    import io
    from PIL import Image
    im = Image.open(path)
    w, h = im.size
    if w > 900:
        im = im.resize((900, int(h * 900 / w)))
    buf = io.BytesIO()
    im.convert('RGB').save(buf, 'JPEG', quality=72)
    b64 = base64.b64encode(buf.getvalue()).decode()
    return {'type': 'image_url',
            'image_url': {'url': f'data:image/jpeg;base64,{b64}'}}


def tag(path):
    body = json.dumps({
        'model': MODEL,
        'messages': [{'role': 'user', 'content':
                      [{'type': 'text', 'text': SECTION_PROMPT},
                       img_block(path)]}],
        'max_tokens': 400, 'temperature': 0}).encode()
    for attempt in range(4):
        try:
            req = urllib.request.Request(URL, data=body, headers={
                'Authorization': f'Bearer {api_key()}',
                'Content-Type': 'application/json'})
            with urllib.request.urlopen(req, timeout=180) as r:
                txt = json.loads(r.read())['choices'][0][
                    'message']['content']
            s = txt.find('{')
            if s == -1:
                return None, 'no json: ' + txt[:60]
            res, _ = json.JSONDecoder().raw_decode(txt[s:])
            return res, None
        except urllib.error.HTTPError as ex:
            if ex.code == 429:
                time.sleep(5 * (attempt + 1))
                continue
            return None, f'http {ex.code}'
        except Exception as ex:  # noqa: BLE001
            time.sleep(4 * (attempt + 1))
            err = str(ex)[:120]
    return None, err


def main():
    args = sys.argv[1:]
    limit = int(args[args.index('--limit') + 1]) if '--limit' in args \
        else 10**9
    reclass = '--reclass' in args
    idx = json.load(open(IDX))
    rows = idx['rows']
    jobs = []
    for rp, row in rows.items():
        st = row.get('style_tags') or {}
        if st.get('gemini_section') == 'v2-canonical' and not reclass:
            continue
        p = os.path.join(REPO, rp)
        if os.path.exists(p):
            jobs.append((rp, p))
        if len(jobs) >= limit:
            break
    print(f'{len(jobs)} sections to tag via {MODEL}', flush=True)
    done = errs = 0
    with ThreadPoolExecutor(max_workers=100) as pool:
        futs = {pool.submit(tag, p): rp for rp, p in jobs}
        for fut in as_completed(futs):
            rp = futs[fut]
            res, err = fut.result()
            done += 1
            if res is None:
                errs += 1
                if errs < 6:
                    print(f'  ERR {rp}: {err}', flush=True)
                continue
            row = rows[rp]
            st = row.setdefault('style_tags', {})
            st.update({'section_type': res.get('section_type'),
                       'composition': res.get('composition'),
                       'media_role': res.get('media_role'),
                       'text_role': res.get('text_role'),
                       'style': res.get('style'),
                       'mood': res.get('mood'),
                       'tone': res.get('tone'),
                       'height_band': res.get('height_band'),
                       'content_weight': res.get('content_weight'),
                       'interaction': res.get('interaction'),
                       'conversion_role': res.get('conversion_role'),
                       'confidence': res.get('confidence'),
                       'gemini_section': 'v2-canonical'})
            if done % 50 == 0:
                print(f'  {done}/{len(jobs)}', flush=True)
                tmp = IDX + '.tmp'
                json.dump(idx, open(tmp, 'w'), indent=1)
                os.replace(tmp, IDX)
    tmp = IDX + '.tmp'
    json.dump(idx, open(tmp, 'w'), indent=1)
    os.replace(tmp, IDX)
    sect = Counter((r.get('style_tags') or {}).get('section_type')
                   for r in rows.values())
    style = Counter()
    for r in rows.values():
        sv = (r.get('style_tags') or {}).get('style')
        for k in (sv if isinstance(sv, list) else [sv]):
            style[k] += 1
    print(f'DONE {done} tagged, {errs} errs')
    print('section_type:', sect.most_common(15))
    print('style:', style.most_common(15))


if __name__ == '__main__':
    main()
