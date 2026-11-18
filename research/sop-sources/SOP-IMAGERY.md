# SOP — Art Direction: Imagery & Media Architecture (source, 2 docs merged)

Philosophy: Positive Selection Architecture — not "never generic
stock" (negative) but "choose imagery that places a human
protagonist inside an active moment" (positive). Words before
pixels; stories sell, features don't.

1.1 Media-by-section decision matrix: Hero+luxury/craft→first-party
real photo or cinematic video; Hero+SaaS→product UI walkthrough;
Hero+conceptual→custom AI narrative scene; Proof→first-party real
facility/team (stock = trust defect); Detail+physical→macro real
photo; Detail+abstract/service→vector illustration or 3D;
Background→atmospheric loop/low-frequency texture.
1.2 Classification rules: real photo REQUIRED for high-ticket
physical, real services, team verification; illustration for
abstract/software/playful with 100% style unity (never mix flat
vector + 3D clay + hand-drawn); 3D only as brand metaphor (no chrome
spheres/glassmorphism ribbons = trend clutter); icons = scannable
utility markers never decorative.

2. Treatments (pick ONE per site, ≥80% of imagery):
Natural/Documentary (warm/natural palettes; skin tones true;
sat −5..+10; no crushed shadows; natural light only);
High-contrast B&W (luxury/minimalist; crushed blacks, bright
highlights, +10% midtone; pairs extreme type contrast);
Duotone/Brand-tinted (corporate/athletic; dark brand color→shadows,
light→highlights; ≥4.5:1 text zones);
Cinematic color-grade (editorial/high-end; sat −15..−25, shadows
cool 210–230°, highlights warm 35–45°, contrast 1.15–1.30×).
One-off treatment allowed only for deliberate focal emphasis.

3. Aspect ratios (closed set): hero 21:9 or 16:9 (mobile alt 9:16);
narrative split 4:3 or 3:2; square card 1:1; portrait 3:4 or 4:5;
macro detail 1:2/3:4.
Safe-crop: rule-of-thirds focal lock; action vector points INWARD
toward text; 15% outer margin safe zone; aligned horizon lines
across adjacent media. object-fit:cover for backgrounds/heroes;
object-fit:contain ONLY for UI screenshots, logos, product catalog
(container bg matches surface).

4. Text-on-image: contrast floors 7:1 display / 4.5:1 body; bg
luminance ≤20% under white text, ≥85% under dark.
Scrim formulas: linear to-top (rgba(0,0,0,.88)→.65→.20→0);
radial centered (.75→.45→.10→0); solid brand tint
rgba(dark, .65) multiply.
Decision: high spatial complexity → text on surface beside (split);
low complexity + scrim → text-on-image permitted.
Overlay typography: skip weights for display; tighten tracking on
large display; slightly increase tracking on micro-copy over dark.

5. Background media density budget: no sharp micro-details; busy
images get blur ≥16px or backdrop-filter blur(12px); brightness
variance <15% under text zones.
Inset media: radius ∈ personality tokens (never mixed rounded/sharp
on one page); shadows subtle high-diffusion (0 20px 40px -15px
rgba(0,0,0,.07)); hard offset shadows only neo-brutalist.

Modulated canvas %: 100% full-bleed hero → 80/10 editorial →
60/40 split → solid type-only breaks (cognitive rest). Split-media
images: off-center focal, clean negative space AT THE SEAM,
aligned horizons.

6. Authenticity hierarchy T1→T4:
T1 first-party (real team/facility/product) — mandatory About/Team/
Case studies;
T2 editorial stock (unstaged, graded to system);
T3 prompt-engineered AI (specific narrative impossible to stock;
prompts specify lens e.g. 85mm f/1.4, lighting, grain, palette) —
NEVER fake team/testimonials/inventory;
T4 stylized vector/3D kits (abstract utility).
Banned: staged corporate stock (handshakes, blank-whiteboard
pointers, headset reps); fake AI headshots; watermarked/compressed;
corporate-Memphis flat clip-art.

7. Responsive art direction: <picture> with art-directed crops per
breakpoint (mobile 4:5/9:16 vs desktop 16:9); AVIF primary + WebP +
legacy fallback; @1x/@2x (+@3x mobile); hero master ≥3840px; hero
loading="eager"+fetchpriority="high" (LCP), below-fold lazy+async.

8. QA (10): positive selection (human-in-environment/narrative);
brand metaphor grounded; taxonomy unmixed; single treatment;
aspect ∈ closed set; focal safe + vector inward; contrast floors
met; background density under budget; authenticity tier + zero
banned; responsive picture + formats + loading flags.

Workflow: words-first story diagnosis → graphic universe refs →
visual metaphors → grid+% modulation → production verify.
