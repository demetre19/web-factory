#!/usr/bin/env python3
"""Theme layer: map DNA vars onto Tailwind v4 semantic tokens
(Flowbite v3/hyperui/preline all use bg-brand, text-heading,
rounded-base…). Emit a <style> that overrides the CSS vars —
markup untouched, whole component rethemes.

  theme_sheet(vibe) -> css string

Vibe record: {surface, fg, heading, accent, accent_fg, radius,
font_display, font_body, soft (surface tint), border}.
"""
import json

# DNA vibe -> TW4 semantic token map. Flowbite v3 classes used in
# banked payloads: bg-brand, bg-brand-softer, text-fg-brand-strong,
# bg-neutral-primary-soft, text-heading, border-default, rounded-*.
TOKENS = {
    'surface':      '--color-neutral-primary',
    'soft':         '--color-neutral-primary-soft',
    'fg':           '--color-fg',           # body text
    'heading':      '--color-heading',
    'accent':       '--color-brand',
    'accent_fg':    None,                    # handled per-vibe (light on dark)
    'border':       '--color-default',
}

def theme_sheet(vibe, scope='[data-vibe]'):
    """CSS overrides scoped to a band — vars bound on the scope
    element (not :root) so multiple vibes coexist on one page."""
    c = vibe
    return f"""
{scope}{{
  --color-brand:{c['accent']};
  --color-brand-strong:{c['accent']};
  --color-brand-soft:{c['accent']}22;
  --color-brand-softer:{c['accent']}18;
  --color-brand-subtle:{c['accent']}55;
  --color-fg-brand-strong:{c['accent']};
  --color-brand-medium:{c['accent']}33;
  --color-neutral-primary:{c['surface']};
  --color-neutral-primary-soft:{c['soft']};
  --color-heading:{c['heading']};
  --color-default:{c['border']};
  --color-body:{c['fg']};
  --color-fg:{c['fg']};
  --color-fg-disabled:{c['fg']}99;
  --radius-xs:{c['radius']};
  --radius-sm:{c['radius']};
  --radius-base:{c['radius']};
  --radius-lg:{c['radius']};
  --radius-xl:{c['radius']};
  --font-sans:{c['font_body']};
  --font-display:{c['font_display']};
}}
{scope}.band{{
  background:{c['surface']};
  color:{c['fg']};
  font-family:{c['font_body']};
  --vibe-accent-fg:{c['accent_fg']};
}}
{scope} h1,{scope} h2,{scope} h3,{scope} h4,{scope} h5{{
  font-family:{c['font_display']}!important;
  color:{c['heading']}!important;
}}
/* primary CTA: accent bg + its own foreground */
{scope} a.bg-brand,{scope} button.bg-brand{{
  background:{c['accent']}!important;color:{c['accent_fg']}!important;
}}
/* muted surfaces */
{scope} .bg-neutral-primary-soft{{background:{c['soft']}!important}}
"""


VIBES = {
    'brutalist': dict(
        surface='#0e0d0b', soft='#191715', fg='#e8e4da',
        heading='#f5f2ea', accent='#d6ff3f', accent_fg='#0e0d0b',
        border='#33302a', radius='0rem',
        font_display='"Space Grotesk","Courier New",monospace',
        font_body='"Space Grotesk",system-ui,sans-serif'),
    'editorial': dict(
        surface='#f7f3ec', soft='#efe9df', fg='#3a352c',
        heading='#211d17', accent='#b5621f', accent_fg='#fdfaf4',
        border='#d9d2c4', radius='0.75rem',
        font_display='Georgia,"Times New Roman",serif',
        font_body='system-ui,sans-serif'),
    'luxury': dict(
        surface='#faf8f5', soft='#f2ede6', fg='#4a443a',
        heading='#2a2620', accent='#8a7a52', accent_fg='#faf8f5',
        border='#e2dbd0', radius='0.35rem',
        font_display='"Didot","Bodoni MT","Playfair Display",serif',
        font_body='"Avenir Next",system-ui,sans-serif'),
    'neon-dark': dict(
        surface='#0d0f1a', soft='#161a2e', fg='#c8cfe8',
        heading='#eef1ff', accent='#6a5cff', accent_fg='#ffffff',
        border='#2a2f4a', radius='1rem',
        font_display='"Inter",system-ui,sans-serif',
        font_body='"Inter",system-ui,sans-serif'),
}

if __name__ == '__main__':
    print(theme_sheet(VIBES['brutalist'])[:300])
