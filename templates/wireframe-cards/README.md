# wireframe-cards — Phase B direction cards template

Greyscale Balsamiq-style wireframe cards — the operator-approved
fidelity for Phase B. ASCII stays in chat for the glance; half-styled
HTML is banned at Phase B (it invites critique of undecided detail).

## When it is used

- **Phase B direction cards** — every intake path that presents three
  directions to the operator (`docs/machinery/DESIGN-INTAKE.md`,
  "Phase B — direction cards").
- **Redesigns** — after Phase 0 (defect table, keep-list, density
  pick), the same three cards ship as one file.

## How to instantiate

```bash
mkdir -p ~/Documents/DEV-WORK/design-proposals/<site>/<page>/cards
cp templates/wireframe-cards/index.html \
   ~/Documents/DEV-WORK/design-proposals/<site>/<page>/cards/index.html
# rewrite the three .card bodies + #seg-design button labels
open ~/Documents/DEV-WORK/design-proposals/<site>/<page>/cards/index.html
```

Design proposals live **outside** the repo under
`design-proposals/<site>/<page>/cards/` — never in `refs/` (refs are
evidence, not drafts). Previews open themselves: `open` the file the
moment it exists, never hand over a path.

Every card set is instantiated from this template, never hand-rolled.
The primitives, per-design variables and rules are documented in the
HTML comment header of `index.html`. The shipped three cards are the
worked example (Whistle Clean — End of Lease Cleaning Melbourne).
