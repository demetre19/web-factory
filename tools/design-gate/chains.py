#!/usr/bin/env python3
"""chains.py — word-seed chain generator for the ornament/motif
candidate path.

A generation key is a chain: brand → domain-verb → essence-noun →
geometry-family. Each seed opens a DIFFERENT direction — the engine
enumerates multiple chains per brand and never collapses to one
association (mulching → fields→lines | →cut→slash | →rotation→arcs
| →debris→scatter | →terrain→contours | →spec→measure).

  from chains import chains_for
  chains_for('mulching')
  # → [('mulching → fields → lines'), ('mulching → cut → slash'), …]

'More like this' = siblings(chain): the same family re-branched —
seeded, deterministic, each sibling independently selectable.
Every emitted candidate carries its chain as provenance
(seed_chain) → a block-trace field.
"""

import hashlib
import random

# domain-verb → {essence-noun: geometry-family} — the association
# table the engine branches over. Extend per domain, never per site.
DOMAIN_CHAINS = {
    'default': {
        'fields': 'lines', 'cut': 'slash', 'rotation': 'arcs',
        'debris': 'scatter', 'terrain': 'contours', 'spec': 'measure',
        'growth': 'radial', 'flow': 'curves', 'layer': 'strata',
        'signal': 'pulse', 'grid': 'lattice', 'edge': 'ticks'},
    'mulching': {
        'fields': 'lines', 'cut': 'slash', 'rotation': 'arcs',
        'debris': 'scatter', 'terrain': 'contours', 'spec': 'measure'},
}


def chains_for(verb, seed=0, n=None):
    """All generation keys for a domain-verb — one chain per
    essence-noun, deterministically ordered by (seed, verb)."""
    table = DOMAIN_CHAINS.get(verb, DOMAIN_CHAINS['default'])
    items = sorted(table.items())
    rng = random.Random(hashlib.sha256(
        f'{verb}:{seed}'.encode()).hexdigest())
    rng.shuffle(items)
    out = [f'{verb} → {ess} → {geo}' for ess, geo in items]
    return out[:n] if n else out


def siblings(chain, count=3, seed=0):
    """'More like this' — seeded parametric siblings of one chain:
    the same family re-branched. Deterministic per (chain, seed)."""
    rng = random.Random(hashlib.sha256(
        f'{chain}:{seed}'.encode()).hexdigest())
    return [{'seed_chain': chain, 'sibling': i,
             'params': {'density': round(rng.random(), 2),
                        'seed': rng.randint(0, 10 ** 6)}}
            for i in range(count)]


def chain_of(candidate):
    """Provenance — the seed chain a candidate was generated from."""
    return candidate.get('seed_chain')


if __name__ == '__main__':
    import sys
    v = sys.argv[1] if len(sys.argv) > 1 else 'mulching'
    for c in chains_for(v):
        print(c)
