/**
 * _shared/inline.ts — the ONE inline-markdown renderer for the copy
 * slots (U.1/U.4). COPY.json keeps two markdown constructs only:
 * `**bold**` → <strong> and `[anchor](href)` → <a href>. Everything
 * else is literal text and is HTML-escaped here — never set:html a
 * raw copy string.
 *
 * pipeline_emit.py copies this file verbatim to
 * site/src/_shared/inline.ts; components import it as
 * `import { inline } from '../_shared/inline';` — the same relative
 * path resolves from templates/sections/<comp>/ and from
 * site/src/components/.
 */

/** Copy-block prop the content compositions accept (see plan §4.3). */
export interface CopySlot {
  heading?: string;
  answer?: string;
  before?: string[];
  items?: { term?: string; title?: string; text?: string;
            label?: string; href?: string; icon?: string;
            image?: MediaInput; avatar?: MediaInput;
            rating?: number | string; who?: string; source?: string;
            quote?: string; value?: string; src?: string }[];
  list_ordered?: boolean;
  qa?: { q?: string; a?: string }[];
  links?: { text?: string; anchor?: string; href?: string }[];
  after?: string[];
  /* closing-only extras (form-panel / end-act) */
  text?: string;
  cta?: { label: string; href: string };
  phone?: string;
}

const ESC: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};

export function esc(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => ESC[c]);
}

/** inline markdown → HTML. Text is escaped first, so the only markup
 * a copy string can produce is <strong> and <a>. */
export function inline(s: string | undefined | null): string {
  if (s == null) return '';
  let t = esc(String(s));
  t = t.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,
                '<a href="$2">$1</a>');
  return t;
}

/** Drop the link markup (keep the anchor words verbatim) for every
 * `[anchor](href)` pointing at `href` — single-primary CTA: when a
 * section renders its own button to that target, the prose must not
 * carry a second link to it. */
export function unlink(s: string | undefined | null,
                       href: string | undefined | null): string {
  if (s == null) return '';
  if (!href) return String(s);
  return String(s).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,
    (m, a, h) => (h === href ? a : m));
}

/** Item-icon and media lookup — consumption slots for richer rows.
 * An item may name an `icon` (lucide stem, any case/kebab) and/or an
 * `image`/`avatar` (path or {src, alt}); the emitter mirrors BRIEF
 * media into src/assets/media/, so the glob below resolves from
 * templates/sections/_shared/ and from site/src/_shared/ alike.
 * ICONS is a curated named map — a row's icon that isn't in it just
 * renders no chip, never a build error. */
import type { ImageMetadata, AstroComponentFactory } from 'astro';
import * as lucide from 'lucide-astro';

const ICONS: Record<string, AstroComponentFactory> = {
  badgecheck: lucide.BadgeCheck, broom: lucide.Brush,
  building: lucide.Building, calendar: lucide.Calendar,
  check: lucide.Check, clipboard: lucide.ClipboardCheck,
  clipboardcheck: lucide.ClipboardCheck,
  clipboardlist: lucide.ClipboardList, clock: lucide.Clock,
  filecheck: lucide.FileCheck, filetext: lucide.FileText,
  graduationcap: lucide.GraduationCap, heart: lucide.HeartHandshake,
  map: lucide.Map, mappin: lucide.MapPin, phone: lucide.Phone,
  quote: lucide.Quote, shield: lucide.ShieldCheck,
  shieldcheck: lucide.ShieldCheck, sparkle: lucide.Sparkles,
  sparkles: lucide.Sparkles, spraycan: lucide.SprayCan,
  star: lucide.Star, sun: lucide.Sun, users: lucide.Users,
  wand: lucide.WandSparkles, award: lucide.Award,
};

/** 'shield-check'|'ShieldCheck' → component, else null. */
export function iconFor(name: string | undefined | null):
    AstroComponentFactory | null {
  return name
    ? ICONS[String(name).toLowerCase().replace(/[^a-z0-9]/g, '')]
      ?? null
    : null;
}

// `glob` is a Vite macro absent from ImportMeta's type — one named
// const carries the table; no per-access cast.
type GlobTable = Record<string, { default: ImageMetadata }>;
const MEDIA: GlobTable =
  (import.meta as { glob:
    (p: string, o: { eager: true }) => GlobTable }).glob(
    '../assets/media/*.{jpg,jpeg,png,webp}', { eager: true });

/** Item media — a path ('/media/x.jpg' | 'x.jpg') or {src, alt}. */
export type MediaInput = string | { src?: string; alt?: string };

/** it.image / image prop → an astro:assets module for <Image>, the
 * raw src for <img>, and an alt. Returns null when nothing resolves. */
export function mediaFor(img: MediaInput | undefined | null, alt = ''):
    { mod: ImageMetadata | null; src: string; alt: string } | null {
  if (!img) return null;
  const src = typeof img === 'string' ? img : String(img.src || '');
  const label = (typeof img === 'object' ? String(img.alt || '') : '')
                || alt;
  if (!src) return null;
  const name = src.split('/').pop();
  const mod = name ? MEDIA[`../assets/media/${name}`] : undefined;
  return { mod: mod ? mod.default : null, src, alt: label };
}
