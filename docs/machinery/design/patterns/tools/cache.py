"""Content-addressed cache for everything derived from the static image
bank and corpus. `docs/machinery/design/patterns/cache/`.

Every pipeline computes only what the bank has not seen before: a lookup
hit returns the stored value, a miss computes once and writes back.
Keys are `sha256(content)` + a *version* — the model id, the prompt /
schema hash, or the rule-set hash — so changing a model or a prompt
invalidates exactly the entries that depend on it, never the whole bank.

Kinds
  clip_img        image bytes sha + CLIP model id          -> fp16 vec
  nomic_text      text sha + embedder id                   -> f32 vec
  clip_query      query text sha + CLIP model id           -> fp16 vec
  nomic_query     query text sha + embedder id             -> f32 vec
  vlm_classify    image bytes sha + model + prompt sha     -> JSON labels
  vlm_ui          image bytes sha + model + prompt sha     -> JSON labels
  crop_feat       image bytes sha + feature version        -> JSON feats
  capture         url sha + ruleset version                -> JSON verdict
  genome          record sha + gene-list version           -> JSON geno

Storage: one sqlite database (`cache/cache.sqlite`, gitignored) holds all
values; small per-vector files would scatter thousands of inodes across
the repo. `cache/meta.json` is committed: schema version, model ids,
prompt hashes, and hit/miss counters — enough to audit and to know when a
key space is stale, without carrying the blobs.

Usage
  from cache import get, put, file_sha, text_sha, stats
  v = get('clip_img', f'{file_sha(path)}:{CLIP_VERSION}')
  if v is None:
      v = encode(path)
      put('clip_img', key, v)
"""
import hashlib
import json
import os
import sqlite3
import struct
import threading
import time

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE_DIR = os.path.normpath(os.path.join(HERE, '..', 'cache'))
DB = os.path.join(CACHE_DIR, 'cache.sqlite')
META = os.path.join(CACHE_DIR, 'meta.json')

# Bump when the *shape* of a stored value changes; versions that
# fingerprint the model/prompt live in each caller and ride inside the
# key itself.
SCHEMA = 2

_lock = threading.Lock()
_db = None


def _conn():
    global _db
    if _db is None:
        os.makedirs(CACHE_DIR, exist_ok=True)
        _db = sqlite3.connect(DB, check_same_thread=False)
        _db.execute('''CREATE TABLE IF NOT EXISTS kv(
            kind TEXT NOT NULL,
            key  TEXT NOT NULL,
            val  BLOB,
            jval TEXT,
            meta TEXT,
            at   REAL,
            PRIMARY KEY(kind, key))''')
        _db.execute('CREATE INDEX IF NOT EXISTS kv_kind ON kv(kind)')
        _db.commit()
    return _db


# ------------------------------------------------------------- hashing
def file_sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1 << 20), b''):
            h.update(chunk)
    return h.hexdigest()[:32]


def text_sha(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()[:32]


def hash_obj(obj):
    return text_sha(json.dumps(obj, sort_keys=True))


# --------------------------------------------------------------- codec
def pack_vec(vec):
    """f32 list -> half-precision blob (512 dims = 1 KB)."""
    return struct.pack(f'<{len(vec)}e', *vec)


def unpack_vec(blob):
    n = len(blob) // 2
    return list(struct.unpack(f'<{n}e', blob))


# ------------------------------------------------------------- lookup
_STATS = {'hits': 0, 'misses': 0}


def get(kind, key):
    with _lock:
        row = _conn().execute(
            'SELECT val, jval FROM kv WHERE kind=? AND key=?',
            (kind, key)).fetchone()
    if row is None:
        _STATS['misses'] += 1
        return None
    _STATS['hits'] += 1
    if row[1] is not None:
        return json.loads(row[1])
    return unpack_vec(row[0])


def put(kind, key, value, meta=None):
    if isinstance(value, (list, tuple)) and value and \
            isinstance(value[0], float):
        val, jval = pack_vec(value), None
    else:
        val, jval = None, json.dumps(value)
    with _lock:
        _conn().execute(
            'INSERT OR REPLACE INTO kv(kind,key,val,jval,meta,at) '
            'VALUES(?,?,?,?,?,?)',
            (kind, key, val, jval,
             json.dumps(meta) if meta else None, time.time()))
        _db.commit()


def get_many(kind, keys):
    """key -> value for the hits; callers diff to find misses."""
    if not keys:
        return {}
    out = {}
    with _lock:
        conn = _conn()
        for i in range(0, len(keys), 500):
            chunk = keys[i:i + 500]
            ph = ','.join('?' * len(chunk))
            for key, val, jval in conn.execute(
                    f'SELECT key, val, jval FROM kv WHERE kind=? '
                    f'AND key IN ({ph})', (kind, *chunk)):
                out[key] = json.loads(jval) if jval is not None \
                    else unpack_vec(val)
    _STATS['hits'] += len(out)
    _STATS['misses'] += len(keys) - len(out)
    return out


def put_many(kind, pairs):
    rows = []
    for key, value in pairs:
        if isinstance(value, (list, tuple)) and value and \
                isinstance(value[0], float):
            rows.append((kind, key, pack_vec(value), None, None,
                         time.time()))
        else:
            rows.append((kind, key, None, json.dumps(value), None,
                         time.time()))
    with _lock:
        _conn().executemany(
            'INSERT OR REPLACE INTO kv(kind,key,val,jval,meta,at) '
            'VALUES(?,?,?,?,?,?)', rows)
        _db.commit()


# -------------------------------------------------------------- meta
def stats(reset=False):
    s = dict(_STATS)
    if reset:
        _STATS['hits'] = _STATS['misses'] = 0
    return s


def counts():
    with _lock:
        return {k: n for k, n in _conn().execute(
            'SELECT kind, COUNT(*) FROM kv GROUP BY kind')}


def write_meta(versions=None):
    """Commit-visible snapshot: versions + counts, no blobs."""
    meta = {'schema': SCHEMA, 'versions': versions or {},
            'counts': counts(), 'updated': time.strftime('%Y-%m-%d')}
    old = {}
    if os.path.exists(META):
        try:
            old = json.load(open(META))
        except Exception:
            pass
    old.update(meta)
    with open(META, 'w') as f:
        json.dump(old, f, indent=1, sort_keys=True)
    return old


if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == 'counts':
        print(json.dumps(counts(), indent=1))
    else:
        write_meta()
        print(f'cache at {os.path.relpath(DB)}; '
              f'meta -> {os.path.relpath(META)}')
