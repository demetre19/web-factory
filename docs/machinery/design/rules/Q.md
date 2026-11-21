# Q — quality floors (mechanical minimums)

Minimums every built page must satisfy. These are floors, not style:
a build that trips any of them is wrong regardless of the DNA.

## Q.1
### Q.1 — FAQ disclosure ships collapsed
`details.faq-item` must not carry `open` in emitted markup. The
accordion is the disclosure mechanism; all-open is a text wall.

## Q.2
### Q.2 — card hierarchy
Every `.card` carries a heading (h3/h4/.sub-h) before its body
text. A bare-text card has no hierarchy.

## Q.3
### Q.3 — icon ring
Every icon inside a card or flow row renders inside `.icon-chip`
(the ring), never a bare svg.

## Q.4
### Q.4 — gap floor
Every grid/flex container of siblings resolves a gap ≥ 8px; a
zero-gap sibling group abuts.

## Q.5
### Q.5 — type scale separation
Heading steps descend monotonically; each level's resolved minimum
is ≥8% under the level above.

## Q.6
### Q.6 — element contrast floor
Every color/background pairing in emitted CSS (including
`[data-surface]` overrides) meets ≥4.5:1 for text, ≥3:1 for ≥24px
display text and non-text chrome.
