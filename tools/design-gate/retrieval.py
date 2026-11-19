#!/usr/bin/env python3
"""retrieval.py — brief → bank lookup. The retrieve-first layer:

a DNA record becomes a canonical query spec → a sha256 JOIN KEY
(identity + cache) → an exact dna_id join (free: the bank's own
key — a render already made from this DNA) → a constraint filter
over bank metadata (no model) → a CLIP text→image cosine over
survivors (cheap model, ~10ms warm, disk-cached by text) → ranked
recipes the adapt layer binds tokens onto.

Retrieval never generates. If the floor fails after adapt+VLM,
the caller walks the ranking to next-nearest; generation is the
caller fallback, not a retrieve path.
"""
import hashlib
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, '..', '..'))
PATTERNS = os.path.join(REPO, 'docs', 'machinery', 'design',
                        'patterns')
TOOLS = os.path.join(PATTERNS, 'tools')
DATA = os.path.join(PATTERNS, 'data')
VECTORS = os.path.join(DATA, 'render_vectors')
HTML_TOPO = os.path.join(REPO, 'templates', 'skeletons',
                         'topology-html-index.json')
SRC_TOPO = os.path.join(REPO, 'templates', 'skeletons',
                        'topology-sources-index.json')
SKELETONS = os.path.join(REPO, 'templates', 'skeletons')
CLIP_SRV = 'http://127.0.0.1:8765'

sys.path.insert(0, TOOLS)
import cache  # noqa: E402

sys.path.insert(0, HERE)
import gate  # noqa: E402


# ----------------------------------------------------------- query spec
# The genes that move what a section LOOKS like — the render-space
# projection of the 26-gene genotype.
RENDER_GENES = ('display-face', 'layout-archetype', 'surface-rhythm',
                'density-tier', 'whitespace-band',
                'radius-personality', 'image-led-ratio',
                'mood-register', 'type-contrast')

# image-led-ratio → the element classes a retrieved section must
# carry to satisfy the sampled media gene (never looser than J.7
# canon — the proof intersects with VERTICAL_MEDIA_CANON itself).
_WANT_SIG = {
    'text-led': set(),
    'balanced': {'image'},
    'image-led': {'image'},
}

# themeability floor — fraction of color-ish classes that must
# resolve through semantic tokens for vars to reach the payload.
# hyperui ≈ 0.0 (hardcoded slate/indigo), flowbite ≈ 0.7.
_MIN_THEMEABLE = 0.35

# recipe dir → the section family the topology indexes know.
# Brixies dirs are literal (cta-sections); HTML kits map onto the
# topology_id vocabulary.
_FAMILY_TOPO = {
    'cta-sections': ('split-50-50', 'band-strip', 'content',
                     'grid-3col-uniform'),
    'hero-sections': ('hero-media-bg', 'split-50-50', 'content'),
    'blog-sections': ('list-cards', 'grid-3col-uniform',
                      'grid-4col-uniform', 'list-vertical-rows'),
    'pricing-sections': ('grid-3col-uniform', 'list-cards',
                         'grid-4col-uniform'),
    'testimonial-sections': ('split-50-50', 'list-cards',
                             'list-vertical-rows', 'content'),
}


def _sha(s, n=16):
    return hashlib.sha256(s.encode()).hexdigest()[:n]


def recipe_family(recipe_id):
    """'brixies/cta-sections/cta-41.topo' → 'cta-sections'."""
    parts = str(recipe_id).split('/')
    return parts[-2] if len(parts) >= 2 else ''


def query_spec(dna):
    """The canonical query spec — sorted, versioned, the ONLY
    projection of a DNA record into bank terms. Every field is
    machinery-derived; nothing authored."""
    g = dna['genotype']
    fam = recipe_family(dna.get('recipe', ''))
    want = set(_WANT_SIG.get(g['image-led-ratio'], set()))
    accept, _ = gate.VERTICAL_MEDIA_CANON.get(
        dna['vertical'], (set(), True))
    want |= accept if g['image-led-ratio'] != 'text-led' else set()
    return {'v': 1,
            'vertical': dna['vertical'],
            'family': fam,
            'want_sig': sorted(want),
            'genes': {k: g[k] for k in RENDER_GENES if k in g}}


def join_key(spec):
    """sha256[:16] of the canonical spec — identity + cache key.
    The retrieval receipt records it; a repeated brief costs 0."""
    return _sha(json.dumps(spec, sort_keys=True))


def dna_id(vars_):
    """The bank's own row key — sha256[:12] of the six rendering
    vars, verbatim embed_renders.row_meta. An exact hit means this
    exact DNA was rendered and judged before: zero-cost join."""
    return hashlib.sha256(json.dumps(
        {k: vars_.get(k) for k in
         ('--bg', '--ink', '--accent', '--radius', '--f-display',
          '--pad-block')}, sort_keys=True).encode()).hexdigest()[:12]


# ---------------------------------------------------------------- text
# Gene allele → spec.json vocabulary word. These are the same words
# annotate.py labels bank rows with — text↔image CLIP distance is
# meaningful only when the phrase speaks the bank's language.
_WORD = {
    'display-face': {'serif': 'elegant serif', 'sans': 'clean',
                     'mono': 'technical', 'mixed': 'editorial'},
    'layout-archetype': {
        'split-media': 'split media', 'stacked-center': 'centered',
        'full-bleed-media': 'full-bleed image',
        'card-grid-2': 'card grid', 'card-grid-3': 'card grid',
        'card-grid-4': 'card grid',
        'editorial-single': 'centered editorial',
        'sequence-steps': 'stepped', 'accordion-list': 'accordion',
        'table-matrix': 'table', 'horizontal-band': 'horizontal',
        'immersive-media': 'immersive image',
        'asymmetric-offset': 'asymmetric', 'masonry-grid': 'masonry',
        'split-form': 'form', 'carousel-track': 'carousel'},
    'surface-rhythm': {'one-contrast-moment': 'minimal',
                       'dark-dominant': 'dark',
                       'alternating': 'alternating',
                       'single-surface': 'minimal',
                       'media-interleaved': 'media-rich'},
    'whitespace-band': {'airy': 'spacious', 'tight': 'compact',
                        'medium': 'balanced'},
    'density-tier': {'compact': 'dense', 'regular': '',
                     'spacious': 'spacious'},
    'radius-personality': {'sharp': 'sharp square', 'soft': 'soft',
                           'pill': 'rounded pill',
                           'mixed': 'rounded'},
    'image-led-ratio': {'text-led': 'typographic',
                        'balanced': 'with images',
                        'image-led': 'image-led',
                        'media-first': 'image-led'},
    'mood-register': {'everyday': 'minimal', 'approachable': 'warm',
                      'premium': 'premium', 'luxury': 'elegant',
                      'ultra': 'bold'},
    'type-contrast': {'low': '', 'medium': '', 'high': 'bold',
                      'extreme': 'display'},
}


def query_text(spec):
    """spec → the CLIP phrase. Deterministic; disk-cached by
    text_sha downstream so identical phrasing never re-encodes."""
    genes = spec['genes']
    words = []
    for g in RENDER_GENES:
        w = _WORD.get(g, {}).get(genes.get(g), '')
        if w:
            words.append(w)
    fam = spec['family'].replace('-sections', '').replace('-', ' ')
    mood = ' '.join(w for w in words if w) or 'clean minimal'
    return (f"a {mood} {spec['vertical']} website {fam} section")


# ----------------------------------------------------------------- bank
class Bank:
    """The render-vectors bank + topology sidecars, loaded once."""

    def __init__(self):
        meta_p = os.path.join(VECTORS, 'index.json')
        self.meta = json.load(open(meta_p)) \
            if os.path.exists(meta_p) else {'rows': {}, 'order': []}
        self.rows = self.meta.get('rows', {})
        self.order = self.meta.get('order', [])
        self._mat = None
        self.topo_html = {}
        if os.path.exists(HTML_TOPO):
            for r in json.load(open(HTML_TOPO)):
                self.topo_html[r['file']] = r
        self.topo_src = {}
        if os.path.exists(SRC_TOPO):
            for r in json.load(open(SRC_TOPO)):
                f = r.get('file', '')
                if f and f != 'index.json':
                    self.topo_src[f] = r
        self._topo_map = gate._recipe_topo_map()
        # row_attrs sidecar: scale / element_sig / themeable,
        # computed once by enrich_bank.py — read, never re-derived.
        attrs_p = os.path.join(VECTORS, 'row_attrs.json')
        self.attrs = json.load(open(attrs_p)) \
            if os.path.exists(attrs_p) else {}

    def matrix(self):
        """float32 vectors, lazily decoded from vectors.bin.
        numpy when present; else a plain list-of-lists (1,853 x
        512 dot ≈ 0.3s — still cheap)."""
        if self._mat is None:
            import struct
            raw = open(os.path.join(VECTORS, 'vectors.bin'),
                       'rb').read()
            n = len(raw) // 2
            half = struct.unpack(f'<{n}e', raw)
            dim = self.meta['dim']
            try:
                import numpy as np
                self._mat = np.array(half, dtype=np.float32) \
                    .reshape(-1, dim)
                self._np = True
            except Exception:
                self._mat = [half[i:i + dim] for i in
                             range(0, n, dim)]
                self._np = False
        return self._mat

    def topo_for(self, row):
        """Bank row → its topology sidecar (js cost, direction,
        column schedule) whichever index knows the payload."""
        rp = row.get('render_path', '')
        for idx in (self.topo_html, self.topo_src):
            for f in idx:
                if f.endswith(os.path.basename(
                        rp).replace('.png', '.html')) or \
                        os.path.basename(rp).startswith(
                            os.path.basename(f).rsplit('.', 1)[0]):
                    return idx[f]
        return {}

    def sig_for(self, row):
        """Element-class signature — banked recipe elements[] first,
        else the precomputed markup sig from row_attrs."""
        sig = set(gate._recipe_element_sig(row.get('recipe_id')
                                           or ''))
        if sig:
            return sig
        return set(self.attrs.get(
            row.get('render_path', ''), {}).get(
                'element_sig', ()))

    def scale_for(self, row):
        return self.attrs.get(
            row.get('render_path', ''), {}).get('scale', 'component')

    def themeable_for(self, row):
        return self.attrs.get(
            row.get('render_path', ''), {}).get('themeable', 1.0)

    def exact(self, dna):
        """Free join: a bank row already rendered this DNA's six
        rendering vars (same dna_id)."""
        want = dna_id(dna['vars'])
        for k in self.order:
            r = self.rows[k]
            if r.get('dna_id') == want:
                return r
        return None

    def filter_rows(self, spec):
        """Constraint filter — metadata only, no model. Keeps rows
        whose recipe family matches, element sig covers want_sig,
        topology allows the layout, scale is a real section (not a
        page or a bare widget), and the payload is themeable enough
        for vars to reach."""
        want = set(spec['want_sig'])
        fam = spec['family']
        min_theme = spec.get('min_themeable',
                             _MIN_THEMEABLE)
        out = []
        for k in self.order:
            r = self.rows[k]
            rid = r.get('recipe_id') or ''
            rfam = recipe_family(rid)
            if fam and rfam and rfam != fam:
                continue
            # section-scale only — pages pull whole marketing
            # shells; components are widget-scale
            if self.scale_for(r) != 'section':
                continue
            if self.themeable_for(r) < min_theme:
                continue
            if want and not (self.sig_for(r) & want or
                             self.sig_for(r) >= want):
                continue
            t = self.topo_for(r)
            if t.get('js_dependency') in ('js-only', 'required'):
                continue
            out.append(r)
        return out

    def rank(self, spec, vec, rows, k=8):
        """cosine over surviving rows keyed by render_path."""
        M = self.matrix()
        want = {r['render_path'] for r in rows}
        ids = [i for i, k_ in enumerate(self.order)
               if k_ in want]
        if not ids:
            return []
        if getattr(self, '_np', False):
            import numpy as np
            scores = M[ids] @ vec
            order = np.argsort(-scores)
        else:
            v = [float(x) for x in vec]
            scores = [sum(a * b for a, b in
                          zip(M[i], v)) for i in ids]
            order = sorted(range(len(ids)),
                           key=lambda j: -scores[j])
        return [(float(scores[i]),
                 self.rows[self.order[ids[i]]])
                for i in order[:k]]


# -------------------------------------------------------------- encoder
_torch_cache = {}


def text_vector(text):
    """CLIP text→512-dim, normalised. Warm server first (~10ms);
    direct encode fallback (~5s cold); both disk-cache by text_sha
    so a phrase is encoded once ever."""
    key = f'{cache.text_sha(text.strip().lower())}:v1:q'
    v = cache.get('clip_query', key)
    if v is not None:
        return v
    try:
        q = urllib.parse.urlencode({'text': text})
        with urllib.request.urlopen(
                f'{CLIP_SRV}/embed?{q}', timeout=2) as r:
            return json.loads(r.read())
    except Exception:
        pass
    # cold path: the tool's own uv-script env (torch+open_clip),
    # ~5s once per new phrase; disk cache makes repeats ~1ms.
    import subprocess
    out = subprocess.run(
        ['uv', 'run', '--quiet',
         os.path.join(TOOLS, 'embed_images.py'), 'query', text],
        capture_output=True, text=True, timeout=600)
    return json.loads(out.stdout)


# -------------------------------------------------------------- retrieve
def retrieve(dna, bank=None, k=8, cached=True):
    """dna record → {'mode', 'key', 'ranked': [(score,row)],
    'latency_ms', 'query'}. Caller: adapt ranked[0] → judge →
    next on floor fail → generate when ranked exhausts."""
    t0 = time.time()
    bank = bank or Bank()
    spec = query_spec(dna)
    key = join_key(spec)

    hit = cache.get('retrieve', key) if cached else None
    if hit is not None:
        hit['mode'] = 'cache'
        hit['latency_ms'] = round(
            (time.time() - t0) * 1000, 1)
        hit['ranked_rows'] = [
            (s_, bank.rows[p_]) for s_, p_, *_ in hit.get(
                'ranked', []) if p_ in bank.rows]
        return hit

    ex = bank.exact(dna)
    if ex:
        out = {'mode': 'exact', 'key': key, 'spec': spec,
               'ranked': [(1.0, ex['render_path'],
                           ex.get('recipe_id'))],
               'ranked_rows': [(1.0, ex)], 'query': None}
        out['latency_ms'] = round((time.time() - t0) * 1000, 1)
        slim = dict(out); slim.pop('ranked_rows')
        cache.put('retrieve', key, slim)
        return out

    rows = bank.filter_rows(spec)
    if not rows:
        out = {'mode': 'empty', 'key': key, 'spec': spec,
               'ranked': [], 'query': None}
        out['latency_ms'] = round((time.time() - t0) * 1000, 1)
        return out
    qt = query_text(spec)
    vec = text_vector(qt)
    try:
        import numpy as np
        vec = np.array(vec, dtype=np.float32)
    except Exception:
        pass
    ranked = bank.rank(spec, vec, rows, k=k)
    out = {'mode': 'clip', 'key': key, 'spec': spec,
           'query': qt,
           'ranked': [(s, r['render_path'], r.get('recipe_id'))
                      for s, r in ranked]}
    out['ranked_rows'] = ranked
    out['latency_ms'] = round((time.time() - t0) * 1000, 1)
    slim = dict(out)
    slim['ranked'] = out['ranked']
    slim.pop('ranked_rows')
    cache.put('retrieve', key, slim)
    return out


if __name__ == '__main__':
    # retrieval.py <dna.json>  → the join receipt
    d = json.load(open(sys.argv[1]))
    rec = {'vertical': d.get('vertical') or d.get('site_type'),
           'genotype': d['genotype'], 'vars': d.get('vars', {}),
           'recipe': d.get('recipe', '')}
    print(json.dumps(retrieve(rec), indent=1, default=str))
