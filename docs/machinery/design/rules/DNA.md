---
id: rules-DNA
type: rules
links:
  used_in: [w1, w2, w5]
  depends_on: [rules-P, rules-T, rules-C, rules-L, rules-S, rules-V]
  index: design-index
---

## D. Design genome — the closed genotype every design is an instance of

The primitive rulebooks (T C L G S I V M R W E) are the *grammar*; the
genome is the *vocabulary*. `dna/GENOME.md` defines ~18 genes, each a
closed allele set (temperature, density, finish, type-contrast, shape,
motion, icon-style, media-treatment, layout-archetype, …). A vertical
profile (`dna/<vertical>.md`, `id: profile-<vertical>`) narrows the
alleles that a class of business may express. A design is then one
**genotype vector**: exactly one allele per gene. Every genotype allele
binds a rule ID — the rulebook says *how* a warm design must behave,
the genome says *whether* warm is available and *which* warm.

Genes never invent values; alleles never contradict their bound rules.
A plan that names an allele outside its gene's closed set is the same
refuse as a hex outside TOKENS.

### D.1 One allele per gene — the genotype is total

`DESIGN-PLAN.md` carries a `dna:` block: `profile:` plus `genotype:`
mapping every gene in `dna/GENOME.md` to exactly one allele listed for
that gene. No empty gene, no allele outside the closed set, no extra
key. FAIL: gene missing, allele not in the gene's `alleles:` set, or
an unknown gene key.

### D.2 The vertical profile is named and covers the genotype

`dna.profile` names an existing `profile-<vertical>` node in `dna/`
whose `uses_genes` list contains every gene in the genotype. The
profile is inferred at W1 from the brief + audit (`site_type` →
profile) and is the *only* source of allowed alleles; a genotype may
not mix alleles from two profiles. FAIL: profile file absent, or a
gene absent from `uses_genes`.

### D.3 Direction options are distinct genotypes

W4 presents 3 look/feel options and each option is a complete
genotype vector drawn from the profile's alleles. Two options that
differ in no gene are one option. FAIL: fewer than three distinct
genotype vectors recorded in the W4 options block.

### D.4 Compositions are layout-archetype alleles

Every `pages.<slug>.sections[].composition` is an allele of the
`layout-archetype` gene (or is composed only from compositions that
are). The layout card chosen at W3 is a *rendering* of the
genotype, not a substitute for it: when the card and the genotype
disagree, the genotype wins and the card row is re-picked. FAIL: a
composition outside the gene's allele set, or a section whose
`data-comp` has no genotype allele.

## Enforcement

| Rule | Mode | Check / rubric | Threshold that FAILs | Wave |
|---|---|---|---|---|
| D.1 | script | `check_genotype` | gene missing / allele ∉ gene set / unknown key | w1 |
| D.2 | script | `check_genotype` | profile absent or `uses_genes` incomplete | w1 |
| D.3 | script | `check_genotype_distinct` | <3 distinct genotype vectors in W4 options | w4 |
| D.4 | script | `check_genotype` | composition ∉ `layout-archetype` alleles | w5 |

## Links

- D.1 → P.8, P.9 (genotype ↔ gate mechanics, checklist evidence)
- D.2 → P.14, T.4 (profile ↔ Mobbin reference class, type directory)
- D.3 → C.2, S.1, M.1 (options ↔ temperature, shape, motion axes)
- D.4 → P.3, P.4 (compositions ↔ data-* contract, wireframe lock)
- D.1 → section-catalog (compositions ↔ catalogue)
