# SOP — Motion, Animation & Transitions (source)

Motion is functional, never decoration. Four core types:
conversational (prototypes), functional (task feedback),
structural (spatial hierarchy), emotional (brand/state).

1. Personalities (closed set): Subtle/Minimal (near-instant,
<4px offset; utilitarian/data-dense), Elegant (flowing, no scale
distortion; luxury/editorial), Professional (axis growth Y/X, no
overshoot; B2B/corporate), Playful (elastic overshoot, scale pop;
consumer/youth/celebration).

2. Duration tokens: micro 100–300ms (hovers, <10px moves);
standard 300–400ms (modals, expands — exits faster than entrances);
structural 500–700ms (containers, staggered drawers);
idle nudge 1s delay → 3s pulse loop;
milestone 1500ms (rare success only).
Easing: linear BANNED for spatial moves; ease-out entrances
cubic-bezier(0,0,.2,1); ease-in exits cubic-bezier(.4,0,1,1);
ease-both for on-screen moves cubic-bezier(.4,0,.2,1); pop/reverse-
pop for playful; bounce/elastic only success states.

3. Element rules: CTA hover = subtle Y-shift/bar expand 300ms;
modal enter slide-up/scale 300–400 ease-out, exit 300 ease-in
(faster); accordion stagger 200ms/category + icon rotate 135°;
skeleton/progressive data 500ms delay then 0%→100%;
frequent page transitions = 300ms opacity fade + <80px slide.
NEVER animate: body text, top-nav links (color/underline only),
error/security banners, continuous distracting loops.

4. ONE focal animation per viewport — competing simultaneous
animations = defect; multiple elements → one coordinated sequence
with 100ms parent-child offset. Property parenting: secondary
elements move at ~50% displacement of primary; decouple opacity vs
position curves.

5. Parallax: LEGAL on marketing/landing only; BANNED in utility/
dashboard/transactional. Layer order by perceived distance;
foreground fastest, background slowest. No scroll-hijacking —
bind to drag/swipe boundaries.

6. Emotional states: success → celebratory (pop/bounce OK);
failure/error → clean efficient only (bounce banned).
Reduced motion: prefers-reduced-motion disables ALL spatial
movement → 150ms opacity crossfade fallback; no strobing/rotation.

7. Performance: transform+opacity ONLY (GPU); layout properties
(width/height/margin/top) banned; 80px max translation + opacity
fade; 60fps budget; matching layer names for view transitions.

8. QA: vocabulary classified; durations tokenized; no linear spatial;
one focal animation; ≤80px+fade; frequent transitions ≤300ms;
errors bounce-free; reduced-motion fallback.
