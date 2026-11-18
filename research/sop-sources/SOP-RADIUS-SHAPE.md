# SOP — Corner Radius, Shape Vocabulary & Border Treatment (source)

Codifies deterministic rules, closed scales, governance for corner
radius, shape vocabulary, borders. Four personalities:

1.1 Personalities: P1 Sharp/Geometric (0–2px; technical, dense,
editorial, luxury), P2 Subtle/Professional (4–8px; corporate, SaaS —
enterprise baseline), P3 Friendly/Soft (12–16px; warm, human, B2C),
P4 Playful/Pill (≥20px + full-round; youthful, social). Brand
attributes pick exactly ONE; mixing personalities banned (Single
Radius System rule 1.3).

2.1 Token scale: radius-none=0, radius-sm, radius-md, radius-lg,
radius-xl, radius-full=9999px — pixel values differ per personality
(P1: sm0 md1 lg2 xl2 | P2: sm2 md4 lg8 xl12 | P3: sm4 md8 lg12 xl16 |
P4: sm6 md12 lg16 xl24). Hardcoded px values = lint violation.

2.2 Component assignment: badges/tags→sm, buttons+inputs+selects→md,
cards/dropdowns/popovers→lg, modals/drawers→xl,
avatars/dots/pills→full.

2.3 Hierarchy: radius(control) ≤ radius(container) ≤ radius(overlay);
inner never exceeds parent except declared radius-full.

3.1 Concentric nesting: R_inner = R_outer − P_padding; if
P_padding ≥ R_outer → inner = 0 (zero collapse). Shared edges in
merged control groups collapse to 0; flush media inherits parent
outer radius, 0 inner.

3.3 No mixed-radius sections — a grid never combines sharp+soft
cards.

4.1 Border widths: closed set {0, 1px, 2px} — 1px baseline
(controls/cards/dividers), 2px focus/active only, sub-pixel banned.
4.2 Border colors: neutral tokens (border-default/subtle) at rest;
accent only on focus/selected/error/success states.
4.3 Separation strategies (pick one per layout block):
border-only (1px, low-contrast canvas), shadow-only (uniform canvas),
hybrid (border+shadow-xs, universal), flush/tinted (contrasting
canvas). No arbitrary mixing on one page.

5. Secondary shapes by personality: circular avatars all; square
avatars P1–P2 only; pill badges P3 permitted/P4 required; decorative
arches + organic blobs P4 ONLY (banned P1–P3); pill buttons P4 only
(P3 as tags/badges).

6. Elevation coupling: shadow blur ∝ radius — Level0 shadow-none |
L1 shadow-xs 2–4px↔radius-md | L2 shadow-md 8–12px↔radius-lg |
L3 shadow-lg 16–24px↔radius-xl | L4 shadow-xl 32–48px↔radius-xl/full.
Deep shadows on sharp corners = defect.

7. QA gate (10): single personality; token membership only;
concentric formula; widths ∈{0,1,2}; neutral resting borders;
uniform separation per block; hierarchy compliance; shape
permissions; elevation pairing; no emoji/rogue controls.

8. DOs/DONTs: single personality; token-only radii; concentric math;
collapse merged edges; {0,1,2} widths; neutral borders; soft
shadow↔soft radius; blobs/arch P4 only.
