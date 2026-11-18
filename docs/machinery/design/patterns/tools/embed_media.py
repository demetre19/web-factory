#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.11"
# dependencies = ["torch", "open_clip_torch", "pillow", "numpy"]
# ///
"""Classify the pictures *inside* the screens, not the screens.

A whole section screenshot is, to CLIP, a UI screenshot 85% of the time
and "premium" 87% of the time — true and useless. The mood and medium of
a page live in its media blocks, so this crops every detected media
block out of the corpus, embeds it, and asks the closed vocabularies
there.

Two deliberate choices:

* **Concrete captions, not adjectives.** "a calm image" vs "an energetic
  image" separates by ~0.01 cosine (noise); "a quiet empty beach at dawn,
  stillness and silence" vs "a crowded concert with flashing lights,
  motion and energy" separates cells by 0.3-0.5. The axis score is the
  normalised pole contrast, -2 .. +2.
* **Relative, not absolute.** These are comparative measurements
  (this crop is calmer than that one), validated by the spread they
  produce across verticals, not as absolute ground truth.

Output (committed):
  data/image_vectors/media.bin         float16, one row per media block
  data/image_vectors/media_index.json  record -> [{bbox, row}]
  data/image_vectors/media_labels.json record -> {axes, tags, medium, style}

  uv run --quiet embed_media.py build
"""
import json
import os
import sys
import time

HERE = os.path.dirname(os.path.abspath(__file__))
PATTERNS = os.path.normpath(os.path.join(HERE, '..'))
DATA = os.path.join(PATTERNS, 'data')
OUT = os.path.join(DATA, 'image_vectors')
MODEL = 'ViT-B-32'
PRETRAINED = 'laion2b_s34b_b79k'
BATCH = 32
MIN_AREA = 0.06
MAX_PER_RECORD = 4

AXES = {
    'sad_happy': ('a grey rainy street, grief and loneliness',
                  'a bright celebration with smiling people, joy'),
    'calm_energetic': ('a quiet empty beach at dawn, stillness and silence',
                       'a crowded concert with flashing lights, motion and energy'),
    'slow_fast': ('a still life on a table, nothing moving',
                  'a racing car at speed, blurred motion'),
    'still_dynamic': ('a flat symmetrical composition, static',
                      'a diagonal action shot full of movement'),
    'cold_warm': ('cold blue steel and snow, clinical white light',
                  'warm sunlight on wood and skin, golden tones'),
    'serious_playful': ('a formal business portrait, sober and serious',
                        'children laughing with balloons, play and fun'),
    'tense_relaxed': ('a dark tense scene, threat and unease',
                      'a relaxed sunny afternoon, ease and comfort'),
    'somber_hopeful': ('a grey funeral, mourning and loss',
                       'a sunrise over a field, hope and new beginning'),
    'subtle_bold': ('a pale understated minimal scene, muted tones',
                    'a loud saturated poster with heavy contrast'),
    'accessible_luxurious': ('a friendly family in a modest living room, everyday life',
                             'a marble hall with silk and gold, wealth and exclusivity'),
    'distant_intimate': ('a vast empty landscape, tiny distant figure',
                         'a close portrait filling the frame, intimate eye contact'),
    'aloof_inviting': ('a cold empty modern lobby, impersonal',
                       'a welcoming table set for guests, inviting'),
    'chaotic_ordered': ('a messy scattered pile of objects, chaos',
                        'a precise grid of identical objects, perfect order'),
    'organic_synthetic': ('natural leaves and stone, organic texture',
                          'polished plastic and chrome, synthetic surfaces'),
    'nostalgic_modern': ('a faded film photograph from the 1970s',
                         'a sleek modern glass architecture photograph'),
    'raw_polished': ('a rough grainy snapshot, imperfect and raw',
                     'a flawless studio photograph, polished and perfect'),
    'quiet_loud': ('a soft pastel scene, whisper quiet',
                   'a screaming neon sign at night, loud and striking'),
    'safe_edgy': ('a safe familiar family scene, comfortable',
                  'an edgy provocative fashion scene, confrontational'),
    'feminine_masculine': ('a delicate floral styling with soft fabrics',
                           'a heavy industrial styling with dark metal'),
    'childlike_grownup': ('a playful crayon drawing for children',
                          'a sophisticated dark interior for adults'),
}

MEDIUM = {
    'photograph': 'a photograph of a real scene',
    'illustration': 'a drawn illustration',
    'hand-drawn sketch': 'a rough hand-drawn pencil sketch',
    'painting': 'a watercolour or oil painting',
    'vector graphic': 'a clean vector graphic',
    'flat colour design': 'a flat colour graphic design with solid shapes',
    '3D render': 'a three dimensional computer render',
    'isometric': 'an isometric illustration',
    'pixel art': 'pixel art',
    'collage': 'a collage of cut out images',
    'pattern/texture': 'a repeating pattern or texture',
    'typography-only': 'large typography with no picture',
    'infographic/chart': 'a data infographic or chart',
    'mixed media': 'a mixed media composition',
}

SUBJECT = {
    'people': 'a picture of people',
    'product': 'a picture of a product for sale',
    'place/architecture': 'a picture of a building or architecture',
    'interior': 'a picture of a room interior',
    'vehicle': 'a picture of a vehicle',
    'food': 'a picture of food',
    'nature/landscape': 'a picture of nature or a landscape',
    'animal': 'a picture of an animal',
    'abstract': 'an abstract image',
    'object still-life': 'a still life of objects',
    'document/screen': 'a picture of a document or screen',
    'text/lettering': 'a picture of lettering',
}

STYLE = {
    'minimal': 'a minimal restrained design',
    'maximal': 'a maximal busy design',
    'editorial': 'an editorial magazine photograph',
    'documentary': 'a documentary photograph of real life',
    'lifestyle': 'a lifestyle photograph of an aspirational moment',
    'corporate': 'a generic corporate stock photograph',
    'luxury/fashion': 'a luxury fashion campaign photograph',
    'street': 'a street photograph',
    'brutalist': 'a brutalist concrete aesthetic',
    'Swiss/international': 'a Swiss international typographic design',
    'retro (50s-90s)': 'a retro vintage design',
    'Y2K': 'a Y2K design',
    'art deco': 'an art deco design',
    'Bauhaus': 'a Bauhaus design',
    'Memphis': 'a Memphis design',
    'flat design': 'a flat design illustration',
    'corporate-Memphis': 'a corporate memphis illustration with people',
    'line art': 'a line art illustration',
    'isometric tech': 'an isometric tech illustration',
    'claymorphism/3D soft': 'a soft clay 3D render',
    'cyberpunk/neon': 'a cyberpunk neon image',
    'grunge': 'a grunge textured design',
    'vintage print': 'a vintage printed poster',
    'Scandinavian': 'a Scandinavian design',
    'Japanese/wabi-sabi': 'a Japanese wabi-sabi aesthetic',
    'cartoon': 'a cartoon illustration',
    'anime/manga': 'an anime illustration',
    "children's book": 'a childrens book illustration',
    'scientific/technical': 'a scientific technical diagram',
}

TAGS = {
    'joy': 'people laughing with joy',
    'excitement': 'an exciting thrilling moment',
    'calm': 'a calm peaceful scene',
    'serenity': 'a serene tranquil scene',
    'awe': 'an awe inspiring vast scene',
    'trust': 'a trustworthy reliable professional scene',
    'confidence': 'a confident assured person',
    'pride': 'a proud achievement moment',
    'warmth/belonging': 'a warm gathering of friends and family',
    'romance': 'a romantic couple in soft light',
    'nostalgia': 'a nostalgic old family photograph',
    'curiosity': 'an intriguing mysterious object',
    'humour': 'a funny comical scene',
    'surprise': 'a surprising unexpected scene',
    'determination': 'a determined athlete pushing hard',
    'urgency': 'an urgent pressing situation',
    'tension': 'a tense dramatic standoff',
    'melancholy': 'a melancholic lonely scene',
    'loneliness': 'a single lonely person alone',
    'mystery': 'a dark mysterious foggy scene',
    'fear': 'a frightening scary scene',
    'anger': 'an angry aggressive scene',
    'relief': 'a relieved relaxing exhale',
    'freedom': 'an open road and freedom',
    'care': 'a caring nurse helping a patient',
}


def rel(p):
    return os.path.relpath(p, DATA).replace(os.sep, '/')


def records():
    for fn in ('annotations.jsonl', 'annotations_negatives.jsonl'):
        p = os.path.join(DATA, fn)
        if not os.path.exists(p):
            continue
        for line in open(p):
            r = json.loads(line)
            if 'error' in r:
                continue
            yield r


def media_blocks(r):
    bs = [b for b in (r.get('blocks') or [])
          if b.get('has_media') and b.get('area', 0) >= MIN_AREA]
    bs.sort(key=lambda b: -b['area'])
    return bs[:MAX_PER_RECORD]


def main():
    import numpy as np
    import open_clip
    import torch
    from PIL import Image

    dev = 'mps' if torch.backends.mps.is_available() else 'cpu'
    model, _, pre = open_clip.create_model_and_transforms(
        MODEL, pretrained=PRETRAINED)
    model.eval().to(dev)
    tok = open_clip.get_tokenizer(MODEL)

    groups = {'medium': MEDIUM, 'subject_class': SUBJECT, 'style': STYLE,
              'tags': TAGS,
              'axis_pos': {k: v[0] for k, v in AXES.items()},
              'axis_neg': {k: v[1] for k, v in AXES.items()}}
    T = {}
    for g, d in groups.items():
        labels = list(d)
        with torch.no_grad():
            f = model.encode_text(tok([d[k] for k in labels]).to(dev))
            f = f / f.norm(dim=-1, keepdim=True)
        T[g] = (labels, f.float().cpu())

    work = []
    for r in records():
        for i, b in enumerate(media_blocks(r)):
            work.append((r, i, b))
    print(f'{len(work)} media blocks from {len({w[0]["image"] for w in work})} '
          f'records')

    vecs, index = [], {}
    t0 = time.time()
    for s in range(0, len(work), BATCH):
        chunk = work[s:s + BATCH]
        imgs, keep = [], []
        for r, i, b in chunk:
            try:
                im = Image.open(r['image']).convert('RGB')
            except Exception:
                continue
            W, H = im.size
            box = (int(b['x0'] * W), int(b['y0'] * H),
                   int(b['x1'] * W), int(b['y1'] * H))
            if box[2] - box[0] < 16 or box[3] - box[1] < 16:
                continue
            imgs.append(pre(im.crop(box)))
            keep.append((r, i, b))
        if not imgs:
            continue
        with torch.no_grad():
            f = model.encode_image(torch.stack(imgs).to(dev))
            f = f / f.norm(dim=-1, keepdim=True)
            f = f.float().cpu().numpy().astype(np.float16)
        for (r, i, b), v in zip(keep, f):
            key = rel(r['image'])
            index.setdefault(key, []).append({
                'row': len(vecs), 'bbox': [round(b['x0'], 4), round(b['y0'], 4),
                                           round(b['x1'], 4), round(b['y1'], 4)],
                'area': round(b.get('area', 0), 4)})
            vecs.append(v)
        if len(vecs) % 640 < BATCH:
            print(f'  {len(vecs)}/{len(work)} {time.time()-t0:.0f}s', flush=True)

    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, 'media.bin'), 'wb') as f:
        for v in vecs:
            f.write(v.tobytes())
    V = np.asarray(vecs, dtype=np.float32)

    def best(group, v):
        labels, mat = T[group]
        sims = (mat @ torch.from_numpy(v)).numpy()
        o = np.argsort(-sims)
        return (labels[o[0]], float(sims[o[0]] - sims[o[1]]), labels[o[1]])

    labels_out = {}
    for key, rows in index.items():
        axes, tags, med, sty = {}, {}, {}, {}
        for rw in rows:
            v = V[rw['row']]
            ps, ns = T['axis_pos'][1] @ torch.from_numpy(v), \
                T['axis_neg'][1] @ torch.from_numpy(v)
            for j, ax in enumerate(T['axis_pos'][0]):
                p, n = float(ps[j]), float(ns[j])
                axes.setdefault(ax, []).append(
                    max(-2.0, min(2.0, 2 * (p - n) / max(1e-6, p + n))))
            for g, acc in (('tags', tags), ('medium', med), ('style', sty)):
                lab, margin, second = best(g, v)
                acc[lab] = acc.get(lab, 0.0) + 1.0 + max(0.0, margin)
        labels_out[key] = {
            'n_blocks': len(rows),
            'emotion_axes': {a: round(sum(v) / len(v), 2)
                             for a, v in axes.items()},
            'emotion_tags': sorted(tags, key=lambda t: -tags[t])[:3],
            'medium': max(med, key=med.get) if med else None,
            'style': max(sty, key=sty.get) if sty else None,
            'medium_mix': {k: round(v / sum(med.values()), 2)
                           for k, v in med.items()} if med else {},
        }

    json.dump({'model': f'open_clip:{MODEL}:{PRETRAINED}', 'dim': 512,
               'dtype': 'float16', 'count': len(vecs),
               'generated': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
               'min_area': MIN_AREA, 'max_per_record': MAX_PER_RECORD,
               'records': index},
              open(os.path.join(OUT, 'media_index.json'), 'w'))
    json.dump({'model': f'open_clip:{MODEL}:{PRETRAINED}',
               'method': 'concrete-caption zero-shot on media blocks',
               'axes_scale': '-2..+2 pole contrast',
               'labels': labels_out},
              open(os.path.join(OUT, 'media_labels.json'), 'w'))
    print(f'{len(vecs)} media vectors, {len(labels_out)} records '
          f'in {time.time()-t0:.0f}s')


if __name__ == '__main__':
    main()
