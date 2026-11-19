#!/usr/bin/env python3
"""vlm.py — the visual-judgment lane: an actual VLM invocation,
recorded as evidence, not a labelled formula.

Default reviewer model: mlx-community/Qwen2.5-VL-3B-Instruct-4bit —
the cheap lane (P.21), local MLX, no API. One bounded call per
review (vlm_calls: 1); the output is a strict-JSON rubric score.

  from vlm import judge
  out = judge(images=['shots/d1.png'], prompt=RUBRIC, model=None)
  # → {model, command, image_sha256, prompt_sha256, output_sha256,
  #    latency_s, parsed: {...} | None, raw: str}

`judge()` raises VLMUnavailable when no runner exists — callers
decide whether absence is a gate fail (proof) or env-skip (selftest).
"""

import hashlib
import json
import os
import shutil
import subprocess
import sys
import threading
import time

DEFAULT_MODEL = 'mlx-community/Qwen2.5-VL-3B-Instruct-4bit'
_LOCK = threading.Lock()

# the mechanical rubric mirrors the quality formula — the VLM is
# asked for the SAME dims so judgment output and mechanical score
# are directly comparable (disagreement is signal, not noise).
RUBRIC = """You are a design-review model. Score this rendered design
option on five dimensions, 0-100 integers:
hero_clarity, layout_craft, media_fit, mobile, distinctness.
Reply with ONLY a JSON object — no prose:
{"hero_clarity": N, "layout_craft": N, "media_fit": N,
 "mobile": N, "distinctness": N, "verdict": "pass"|"fail"}"""


class VLMUnavailable(RuntimeError):
    pass


def _runner():
    """The mlx_vlm.generate entry point: repo venv first, PATH after."""
    here = os.path.dirname(os.path.abspath(__file__))
    repo = os.path.dirname(os.path.dirname(here))
    cand = os.path.join(repo, '.venv-vlm', 'bin', 'mlx_vlm.generate')
    if os.path.isfile(cand):
        return cand
    p = shutil.which('mlx_vlm.generate')
    if p:
        return p
    raise VLMUnavailable('no mlx_vlm.generate — '
                         'expected Web Factory/.venv-vlm or PATH')


def _sha(path):
    return hashlib.sha256(open(path, 'rb').read()).hexdigest()[:16]


def _cache_path():
    """Verdict cache — keyed (image hashes, prompt hash, model).
    Every entry IS a prior real invocation record; a hit skips the
    model but keeps the evidence and marks itself cached."""
    return os.environ.get('WF_VLM_CACHE') or os.path.join(
        os.path.dirname(os.path.abspath(__file__)), '.vlm-cache.json')


def _cache_key(imgs, prompt, model):
    return '|'.join([model,
                     hashlib.sha256(prompt.encode()).hexdigest()[:16],
                     ','.join(f'{k}={v}' for k, v in sorted(
                         imgs.items()))])


def _cache_load():
    try:
        return json.load(open(_cache_path()))
    except (OSError, ValueError):
        return {}


def _cache_save(c):
    try:
        tmp = _cache_path() + '.tmp'
        with open(tmp, 'w') as fh:
            json.dump(c, fh, indent=0)
        os.replace(tmp, _cache_path())
    except OSError:
        pass


def judge(images, prompt=RUBRIC, model=None, max_tokens=200,
          timeout=600, use_cache=True):
    """One bounded VLM call. Returns the evidence record —
    caller stores it under REVIEW.json.vlm_evidence (P.24)."""
    run = _runner()
    model = model or DEFAULT_MODEL
    img_h = {os.path.basename(i): _sha(i) for i in images}
    key = _cache_key(img_h, prompt, model)
    if use_cache:
        hit = _cache_load().get(key)
        if hit and hit.get('parsed'):
            rec = dict(hit)
            rec['cached'] = True
            rec['cache_key'] = key[:24]
            return rec
    cmd = [run, '--model', model, '--max-tokens', str(max_tokens),
           '--prompt', prompt]
    for img in images:
        cmd += ['--image', img]
    t0 = time.time()
    proc = subprocess.run(cmd, capture_output=True, text=True,
                          timeout=timeout)
    latency = round(time.time() - t0, 1)
    raw = (proc.stdout or '').strip()
    if proc.returncode != 0:
        raise VLMUnavailable(
            f'mlx_vlm.generate exit {proc.returncode}: '
            f'{(proc.stderr or "")[:300]}')
    parsed = None
    try:
        j = json.loads(raw[raw.index('{'):raw.rindex('}') + 1])
        if isinstance(j, dict):
            parsed = j
    except (ValueError, json.JSONDecodeError):
        pass
    rec = {
        'model': model,
        'command': ' '.join(os.path.basename(c) if i == 0 else c
                            for i, c in enumerate(cmd)),
        'image_sha256': img_h,
        'prompt_sha256': hashlib.sha256(
            prompt.encode()).hexdigest()[:16],
        'output_sha256': hashlib.sha256(
            raw.encode()).hexdigest()[:16],
        'latency_s': latency,
        'parsed': parsed,
        'raw': raw[:4000],
    }
    if use_cache and parsed:
        with _LOCK:
            c = _cache_load()
            c[key] = {k: v for k, v in rec.items() if k != 'cached'}
            _cache_save(c)
    return rec


def available():
    try:
        _runner()
        return True
    except VLMUnavailable:
        return False


if __name__ == '__main__':
    imgs = sys.argv[1:]
    if not imgs:
        print('usage: vlm.py IMAGE...'); sys.exit(2)
    out = judge(imgs)
    print(json.dumps({k: v for k, v in out.items()
                      if k != 'raw'}, indent=1))
    print(out['raw'])
