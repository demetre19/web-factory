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
            label?: string; href?: string }[];
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
