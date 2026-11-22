#!/usr/bin/env python3.12
"""genmenu_bank.py — bank AI-Studio-generated menu components as exemplar vectors.

Reads rendered static HTML (produced by the genmenu SSR renderer from
React+Tailwind sources) and writes per-exemplar bank artifacts:

    templates/skeletons/genmenu/<topology_class>/<slug>.html      (fragment)
    templates/skeletons/genmenu/<topology_class>/<slug>.tsx       (source)
    templates/skeletons/genmenu/<topology_class>/<slug>.topo.json
    templates/skeletons/genmenu/<topology_class>/<slug>.spec.json

plus templates/skeletons/genmenu/tags.json rows and GENMENU-INDEX.md.

Deterministic — no paid calls. Re-runnable (idempotent by slug).

    python3.12 tools/design-gate/genmenu_bank.py <render_out_dir> <tsx_src_dir> \
        --pack <pack-name> [--root <repo>]
"""
from __future__ import annotations

import argparse
import html.parser
import json
import re
import sys
import uuid
from html.parser import HTMLParser
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
BANK = REPO / "templates" / "skeletons" / "genmenu"

# pack prefix -> (baseline topology class, section_class, category, query word);
# baseline refined per item by class sniffing.
PACK_META = {
    "drawernav": ("nav-dock-left-drawer", "navigation", ["navigation"], "menu"),
    "menucraft": ("nav-sheet", "navigation", ["navigation"], "menu"),
    "navmenu": ("nav-dropdown-menu", "navigation", ["navigation"], "menu"),
    "modalnav": ("nav-modal", "navigation", ["navigation"], "menu"),
    "footercraft": ("footer-columns", "footer", ["footer"], "footer"),
    "footers": ("footer-columns", "footer", ["footer"], "footer"),
    "pricing": ("pricing-tiers", "pricing", ["pricing"], "pricing"),
    "elements": ("ui-element", "element", ["element"], "ui element"),
    "modal": ("modal-dialog", "modal", ["modal"], "modal"),
    "checkout": ("commerce-flow", "commerce", ["commerce"], "commerce"),
    "commerce": ("commerce-flow", "commerce", ["commerce"], "commerce"),
    "patternfolio": (None, "screen", ["screen"], "screen"),
    "proofatlas": ("proof-testimonial", "proof", ["social proof"], "social proof"),
    "meridian": ("data-display", "element", ["data"], "data display"),
    "hero": ("hero-section", "hero", ["hero"], "hero"),
    "folio": ("card-block", "element", ["card"], "card"),
    "formspecimen": ("form-block", "form", ["form"], "form"),
    "comparekit": ("comparison-table", "comparison", ["comparison"], "comparison"),
    "tabular": ("data-table", "element", ["data"], "data table"),
    "feedback": ("ui-feedback", "element", ["feedback"], "feedback"),
    "navcraft": ("nav-micro", "navigation", ["navigation"], "nav element"),
    "plate": ("media-block", "element", ["media"], "media display"),
    "microcraft": ("ui-micro", "element", ["micro interaction"], "micro interaction"),
    "wayfinding": ("wayfinding", "navigation", ["navigation"], "wayfinding"),
    "control": ("ui-control", "element", ["control"], "button control"),
    "kinema": ("media-video", "element", ["media"], "video embed"),
    "kinetic": ("fx-motion", "decoration", ["micro interaction"], "motion effect"),
    "badge": ("ui-badge", "decoration", ["badge"], "badge"),
    "surface": ("bg-surface", "decoration", ["background"], "background"),
    "ornaments": ("deco-ornament", "decoration", ["ornament"], "ornament"),
    "ornamenta": ("deco-content", "decoration", ["decoration"], "decoration"),
    "folio-ornamenta": ("deco-content", "decoration", ["decoration"], "decoration"),
    "folio-ornaments": ("deco-ornament", "decoration", ["ornament"], "ornament"),
    "cursor": ("fx-cursor", "decoration", ["micro interaction"], "cursor effect"),
    "viscous": ("fx-goo", "decoration", ["micro interaction"], "liquid effect"),
    "scroll": ("fx-scroll", "decoration", ["scroll animation"], "scroll effect"),
    "statecraft": ("fx-state", "decoration", ["state animation"], "state effect"),
    "atmosphere": ("fx-ambient", "decoration", ["ambient background"], "ambient effect"),
    "icfx": ("fx-image", "decoration", ["image treatment"], "image effect"),
    "springwork": ("fx-phys", "decoration", ["physics animation"], "physics effect"),
    "kinetik": ("fx-ktxt", "decoration", ["kinetic typography"], "text animation"),
    "morphology": ("fx-morph", "decoration", ["morphing ui"], "morph effect"),
    "mobfx": ("mob-chrome", "chrome", ["mobile chrome"], "mobile sticky bar"),
}

# component-name prefix -> (baseline, section_class, category, query) override
# for packs that mix families (patternfolio ships auth + error screens).
COMP_META = {
    "auth": ("auth-form", "screen", ["auth"], "auth screen"),
    "error": ("empty-state", "screen", ["error"], "error screen"),
}

SEMANTIC_TAGS = {
    "header", "nav", "section", "aside", "footer", "form", "ul", "ol",
    "input", "button", "a", "h1", "h2", "h3", "h4", "dialog", "main",
}
TAG_RENAME = {"svg": "icn"}


class Tree(HTMLParser):
    """Rendered fragment -> element_sig + semantic tree."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.sig: dict[str, int] = {}
        self.stack: list[dict] = []
        self.roots: list[dict] = []
        self.all_classes: list[str] = []
        self.panel_classes: list[str] = []
        self.text_hints: list[str] = []
        self._text_buf: list[str] = []
        self._in_svg = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        t = TAG_RENAME.get(tag, tag)
        if tag == "svg":
            self._in_svg += 1
            self.sig[t] = self.sig.get(t, 0) + 1
        elif self._in_svg == 0:
            self.sig[t] = self.sig.get(t, 0) + 1
        cls = a.get("class", "")
        if cls:
            self.all_classes.extend(cls.split())
        node = {
            "tag": tag,
            "id": a.get("id") or "",
            "classes": cls.split()[:6],
            "_cls_all": cls.split(),
            "label": a.get("aria-label") or "",
            "role": a.get("role") or "",
            "children": [],
        }
        # panel classes: the menu surface itself (dialog/aside/nav), not the scrim
        if not self.panel_classes and (
            a.get("role") == "dialog"
            or tag in ("aside", "dialog", "nav", "footer", "section", "main", "form")
        ):
            self.panel_classes = cls.split()
        if self.stack:
            self.stack[-1]["children"].append(node)
        else:
            self.roots.append(node)
        if tag not in ("img", "input", "br", "hr", "meta", "link"):
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if self.stack:
            self.stack.pop()

    def handle_endtag(self, tag):
        if self.stack and self.stack[-1]["tag"] == tag:
            self.stack.pop()
        if tag == "svg" and self._in_svg > 0:
            self._in_svg -= 1

    def handle_data(self, data):
        s = data.strip()
        if s and self.stack and self.stack[-1]["tag"] in (
            "h1", "h2", "h3", "h4", "button", "a", "span", "label"
        ):
            self.text_hints.append(s)


def component_roots(roots: list[dict], prefix: str) -> list[dict] | None:
    """Body-level subtrees containing an `id^=prefix` element — the actual
    component when an exemplar wraps itself in demo-page scaffolding."""

    def has_id(n: dict) -> bool:
        return n["id"].startswith(prefix) or any(
            has_id(c) for c in n["children"])

    body = next((n for n in roots if n["tag"] == "body"), None)
    if body is None:
        for r in roots:
            body = next((c for c in r["children"] if c["tag"] == "body"), None)
            if body is not None:
                break
    cands = body["children"] if body is not None else roots
    hits = [n for n in cands if has_id(n)]
    return hits or None


def restrict_tree(t: Tree, roots: list[dict], prefix: str) -> None:
    """Re-scope sig/classes/panel to the given subtrees (drop scaffolding)."""
    t.roots = roots
    t.sig = {}
    t.all_classes = []
    t.panel_classes = []

    def walk(n: dict, in_svg: int) -> None:
        tag = n["tag"]
        if in_svg == 0:
            t2 = TAG_RENAME.get(tag, tag)
            t.sig[t2] = t.sig.get(t2, 0) + 1
        cls = n["_cls_all"]
        t.all_classes.extend(cls)
        if not t.panel_classes and (
            n["role"] == "dialog"
            or tag in ("aside", "dialog", "nav", "footer", "section",
                       "main", "form")
        ):
            t.panel_classes = cls
        for c in n["children"]:
            walk(c, in_svg + 1 if tag == "svg" else in_svg)

    for r in roots:
        walk(r, 0)

    if not t.panel_classes:
        # No semantic surface tag — judge mode on the component's own
        # surface root, never the shared toast boilerplate, a dim
        # scrim, or every class in the subtree.
        boiler = prefix + "toast"

        def has_surface_id(n: dict) -> bool:
            return (n["id"].startswith(prefix)
                    and not n["id"].startswith(boiler)
                    or any(has_surface_id(c) for c in n["children"]))

        def is_scrim(n: dict) -> bool:
            cls = " ".join(n["_cls_all"])
            return "inset-0" in cls and re.search(r"bg-\S+/\d", cls)

        surf = next(
            (n for n in roots if has_surface_id(n) and not is_scrim(n)),
            None)
        if surf is None:
            surf = next((n for n in roots if not is_scrim(n)), roots[0])
        t.panel_classes = surf["_cls_all"]


def sniff_topology(html_text: str, baseline: str) -> tuple[str, str]:
    """Refine the pack-level topology guess from positional classes."""
    c = html_text
    def has(*needles):
        return any(n in c for n in needles)

    if baseline == "nav-sheet":
        if has("bottom-0", "rounded-t-", "inset-x-0 bottom"):
            return "nav-bottom-sheet", "high"
        if has("top-0", "origin-top"):
            return "nav-top-sheet", "medium"
        return "nav-bottom-sheet", "low"
    if baseline == "nav-dropdown-menu":
        if has("grid-cols-3", "grid-cols-4", "w-screen", "mega"):
            return "nav-mega-panel", "high"
        return "nav-dropdown-menu", "high"
    if baseline == "nav-modal":
        if has("inset-0") and not has("max-w", "sm:max-w", "w-full max"):
            return "nav-full-screen-overlay", "medium"
        return "nav-modal", "high"
    if baseline == "nav-dock-left-drawer":
        if has("right-0"):
            return "nav-dock-right-drawer", "high"
        return "nav-dock-left-drawer", "high"
    if baseline == "footer-columns":
        if has("grid-cols-4", "grid-cols-5", "grid-cols-6", "md:grid-cols-4", "lg:grid-cols-4", "lg:grid-cols-5"):
            return "footer-mega", "high"
        if has("grid-cols-2", "grid-cols-3", "sm:grid-cols-2", "md:grid-cols-3", "sm:grid-cols-3"):
            return "footer-columns", "high"
        return "footer-minimal", "medium"
    if baseline == "pricing-tiers":
        if "<table" in c:
            return "pricing-table", "high"
        if not has("grid-cols-2", "grid-cols-3", "grid-cols-4", "md:grid-cols", "lg:grid-cols"):
            return "pricing-single", "medium"
        return "pricing-tiers", "high"
    if baseline == "commerce-flow":
        low = c.lower()
        def hasl(*needles):
            return any(n in low for n in needles)
        if "order" in low and hasl("confirm", "receipt", "thank", "placed"):
            return "order-confirm", "medium"
        if hasl("sort by", "filters", "filter by") and c.count("grid") >= 1:
            return "product-grid", "medium"
        if hasl("shopping cart", "your cart", "cart is empty", "order summary"):
            return "commerce-cart", "medium"
        if hasl("add to cart", "add to bag"):
            return "product-page", "medium"
        if hasl("card number", "expiry", "expiration", "cvv", "checkout"):
            return "checkout", "medium"
        return "commerce-flow", "low"
    if baseline == "modal-dialog":
        if has("bottom-0", "rounded-t-"):
            return "modal-bottom-sheet", "high"
        if has("h-full") and has("right-0", "left-0"):
            return "modal-slide-over", "high"
        return "modal-dialog", "high"
    if baseline == "proof-testimonial":
        low = c.lower()
        if has("★", "stars", "star-") or ("rating" in low and "review" in low):
            return "proof-rating", "medium"
        if "case" in low and has("study", "results"):
            return "proof-case", "medium"
        if c.count("<svg") >= 8 or has("logo-cloud", "logos"):
            return "proof-logo-cloud", "medium"
        if has("blockquote"):
            return "proof-quote", "medium"
        return "proof-testimonial", "high"
    if baseline == "data-display":
        if "<table" in c:
            return "data-table", "high"
        if has("role=\"progressbar\"", "stepper", "aria-current=\"step\""):
            return "data-stepper", "medium"
        if has("grid-cols-2", "grid-cols-3", "grid-cols-4"):
            return "data-grid", "medium"
        return "data-display", "high"
    if baseline == "hero-section":
        if has("absolute inset-0", "object-cover", "min-h-screen"):
            return "hero-media-bg", "medium"
        if has("grid-cols-2", "lg:grid-cols-2", "md:grid-cols-2"):
            return "hero-split", "high"
        return "hero-centered", "high"
    if baseline == "comparison-table":
        low = c.lower()
        if "before" in low and "after" in low:
            return "comparison-before-after", "medium"
        if "pros" in low or "cons" in low:
            return "comparison-pros-cons", "medium"
        if "<table" in c:
            return "comparison-table", "high"
        if has("grid-cols-2", "grid-cols-3", "md:grid-cols", "lg:grid-cols"):
            return "comparison-cards", "medium"
        return "comparison-cards", "low"
    if baseline == "data-table":
        if "aria-expanded" in c or "aria-controls" in c:
            return "data-table-expandable", "medium"
        return "data-table", "high"
    if baseline == "ui-feedback":
        low = c.lower()
        if "cookie" in low or "consent" in low:
            return "ui-consent", "medium"
        if "animate-pulse" in c or "skeleton" in low:
            return "ui-skeleton", "medium"
        if 'role="progressbar"' in c or "progress" in low:
            return "ui-progress", "medium"
        if 'role="status"' in c or 'role="alert"' in c or "toast" in low or "snackbar" in low:
            return "ui-toast", "medium"
        if has("top-0 inset-x", "bottom-0 inset-x", "announcement"):
            return "ui-banner", "medium"
        return "ui-feedback", "medium"
    if baseline == "nav-micro":
        low = c.lower()
        if "breadcrumb" in low:
            return "nav-breadcrumb", "medium"
        if "command" in low and ("search" in low or "⌘" in c):
            return "nav-command-palette", "medium"
        if "aria-label=\"pagination\"" in c or "pagination" in low:
            return "nav-pagination", "medium"
        if 'role="tablist"' in c or "tablist" in c:
            return "nav-tabs", "medium"
        if 'role="tree"' in c or "treeview" in c:
            return "nav-tree", "medium"
        if 'role="menu"' in c or 'role="menubar"' in c:
            return "nav-menu", "medium"
        if has("bottom-0", "fixed bottom"):
            return "nav-bottom-bar", "medium"
        return "nav-micro", "medium"
    if baseline == "media-block":
        low = c.lower()
        if "carousel" in low or "slide" in low:
            return "media-carousel", "medium"
        if "marquee" in low:
            return "media-marquee", "medium"
        if "avatar" in low:
            return "media-avatars", "medium"
        if "figcaption" in low or "<figcaption" in c:
            return "media-figure", "medium"
        if "comparison" in low or ("before" in low and "after" in low):
            return "media-compare", "medium"
        return "media-block", "medium"
    if baseline == "ui-micro":
        low = c.lower()
        if "tooltip" in low or 'role="tooltip"' in c:
            return "ui-tooltip", "medium"
        if "popover" in low or "popper" in low:
            return "ui-popover", "medium"
        if "badge" in low or "indicator" in low or "dot" in low:
            return "ui-badge", "medium"
        if 'role="menu"' in c or "menu" in low:
            return "ui-menu", "medium"
        return "ui-micro", "medium"
    if baseline == "fx-motion":
        low = c.lower()
        if "keyframes" in c or "animate-" in low or "animation" in low:
            if "marquee" in low or "ticker" in low:
                return "fx-marquee", "medium"
            if "counter" in low or "count" in low:
                return "fx-counter", "medium"
            if "shine" in low or "sweep" in low or "shimmer" in low:
                return "fx-shine", "medium"
            if "typewriter" in low or "typing" in low:
                return "fx-type", "medium"
            return "fx-motion", "medium"
        if "translate" in low or "hover:" in low:
            return "fx-hover", "medium"
        return "fx-motion", "low"
    if baseline == "fx-goo":
        low = c.lower()
        if "wipe" in low or "transition" in low and "translatex" in c.lower():
            return "fx-liquid-wipe", "medium"
        if "blob" in low or "border-radius: 4" in low or "morph" in low:
            return "fx-blob", "medium"
        if "fegaussianblur" in c.replace(" ", "").lower() or "gooey" in low or "metaball" in low:
            return "fx-gooey", "high"
        if "merge" in low or "split" in low:
            return "fx-merge", "medium"
        return "fx-goo", "medium"
    if baseline == "fx-cursor":
        low = c.lower()
        if "magnet" in low or "attract" in low or "translate3d" in c:
            return "fx-magnetic", "medium"
        if "tilt" in low or "perspective" in low or "rotateX" in c or "rotatex" in low:
            return "fx-tilt", "medium"
        if "mask" in low or "reveal" in low or "radial-gradient" in c:
            return "fx-reveal", "medium"
        if "trail" in low or "cursor" in low or "follower" in low or "mousemove" in c:
            return "fx-cursor", "medium"
        return "fx-cursor", "low"
    if baseline == "fx-scroll":
        # the pack labels each specimen "<name> · <family> · <technique>"
        if "Sticky &amp; Pinned" in c or "Sticky & Pinned" in c:
            return "fx-pinned", "high"
        if "Spatial &amp; Media" in c or "Spatial & Media" in c:
            return "fx-parallax", "high"
        if "Typography &amp; Data" in c or "Typography & Data" in c:
            return "fx-meter", "high"
        if "CSS Timeline" in c:
            return "fx-timeline", "high"
        return "fx-scroll", "low"
    if baseline == "fx-state":
        low = c.lower()
        if "toast" in low or "notification" in low or "dismiss" in low:
            return "fx-toast", "high"
        if "stroke-dashoffset" in low or "check" in low or "verified" in low or "success" in low:
            return "fx-check", "high"
        if "confetti" in low or "burst" in low or "heart" in low or "celebra" in low:
            return "fx-burst", "medium"
        if "progress" in low or "ring" in low or "percent" in low or "download" in low:
            return "fx-progress", "medium"
        if "skeleton" in low or "shimmer" in low:
            return "fx-skeleton", "medium"
        if "star" in low or "rating" in low:
            return "fx-rating", "medium"
        return "fx-state", "low"
    if baseline == "fx-ambient":
        low = c.lower()
        if "particle" in low or "field" in low or "star" in low or "dot" in low:
            return "fx-particles", "medium"
        if "aurora" in low or "orb" in low or "blob" in low or "glow" in low:
            return "fx-glow", "medium"
        if "gradient" in low or "conic" in low or "mesh" in low:
            return "fx-gradient", "medium"
        if "grid" in low or "scanline" in low or "noise" in low:
            return "fx-texture", "medium"
        return "fx-ambient", "low"
    if baseline == "fx-image":
        low = c.lower()
        if "before" in low and "after" in low or "comparison" in low or "slider" in low:
            return "fx-compare", "high"
        if "clip-path" in low or "mask" in low or "aperture" in low or "reveal" in low:
            return "fx-mask", "medium"
        if "duotone" in low or "grayscale" in low or "crossfade" in low or "opacity" in low:
            return "fx-duotone", "medium"
        if "tilt" in low or "perspective" in low:
            return "fx-tilt", "medium"
        if "zoom" in low or "scale" in low or "expand" in low:
            return "fx-zoom", "medium"
        return "fx-image", "low"
    if baseline == "fx-phys":
        low = c.lower()
        if "spring" in low or "bounce" in low or "elastic" in low or "overshoot" in low:
            return "fx-spring", "medium"
        if "squash" in low or "jelly" in low or "wobble" in low:
            return "fx-jelly", "medium"
        if "shake" in low or "error" in low or "denied" in low:
            return "fx-shake", "medium"
        if "drag" in low or "slider" in low or "inertia" in low or "momentum" in low:
            return "fx-drag", "medium"
        return "fx-phys", "low"
    if baseline == "fx-ktxt":
        low = c.lower()
        if "scramble" in low or "decode" in low or "cycle" in low:
            return "fx-scramble", "medium"
        if "marquee" in low or "strip" in low:
            return "fx-marquee", "medium"
        if "gradient" in low or "sweep" in low or "ink" in low:
            return "fx-ink", "medium"
        if "letter" in low or "char" in low or "stagger" in low or "wave" in low:
            return "fx-letter", "medium"
        if "outline" in low or "stroke" in low or "fill" in low:
            return "fx-outline", "medium"
        if "glitch" in low:
            return "fx-glitch", "medium"
        if "rotate" in low or "flip" in low or "roll" in low or "carousel" in low:
            return "fx-rotate", "medium"
        if "blur" in low or "focus" in low or "mask" in low or "wipe" in low:
            return "fx-textreveal", "medium"
        return "fx-ktxt", "low"
    if baseline == "fx-morph":
        low = c.lower()
        if "aria-pressed" in low or "play" in low or "pause" in low or "hamburger" in low:
            return "fx-iconmorph", "medium"
        if "fab" in low or "fan" in low or "speed-dial" in low:
            return "fx-fab", "medium"
        if "expand" in low or "dialog" in low or "modal" in low or "detail" in low:
            return "fx-expand", "medium"
        if "tab" in low or "segmented" in low or "indicator" in low or "pill" in low:
            return "fx-tabslide", "medium"
        if "spinner" in low or "loading" in low or "progress" in low:
            return "fx-loadmorph", "medium"
        if "menu" in low or "dropdown" in low or "options" in low:
            return "fx-menumorph", "medium"
        return "fx-morph", "low"
    if baseline == "ui-badge":
        low = c.lower()
        if "ribbon" in low or "corner" in low or "rotate" in low:
            return "ui-badge-ribbon", "medium"
        if "pulse" in low or "animate-" in low:
            return "ui-badge-pulse", "medium"
        if "tag" in low or "chip" in low:
            return "ui-badge-chip", "medium"
        return "ui-badge", "medium"
    if baseline == "bg-surface":
        low = c.lower()
        if "linear-gradient" in c or "bg-gradient" in low or "radial" in low:
            return "bg-gradient", "medium"
        if "grid" in low or "pattern" in low or "dotted" in low or "dot" in low:
            return "bg-pattern", "medium"
        if "svg" in c.lower() or "blob" in low or "wave" in low or "curve" in low:
            return "bg-shape", "medium"
        return "bg-surface", "low"
    if baseline == "deco-ornament":
        low = c.lower()
        if "divide" in low or "hr" in low or "rule" in low or "border-y" in low:
            return "deco-divider", "medium"
        if "frame" in low or "border-2" in low or "corner" in low or "ring" in low:
            return "deco-frame", "medium"
        return "deco-ornament", "low"
    if baseline == "deco-content":
        low = c.lower()
        if "blockquote" in low or "quote" in low:
            return "deco-quote", "medium"
        if "callout" in low or "tip" in low or "note" in low or "aside" in low:
            return "deco-callout", "medium"
        if "kbd" in low or "code" in low or "footnote" in low:
            return "deco-inline", "medium"
        return "deco-content", "low"
    if baseline == "media-video":
        low = c.lower()
        if "playlist" in low or "episode" in low:
            return "media-playlist", "medium"
        if "testimonial" in low:
            return "media-testimonial", "medium"
        if "podcast" in low or "audio" in low:
            return "media-audio", "medium"
        if "live" in low or "webinar" in low:
            return "media-live", "medium"
        if "play" in low or "<video" in c:
            return "media-video", "medium"
        return "media-embed", "medium"
    if baseline == "ui-control":
        low = c.lower()
        if 'role="menu"' in c or 'role="listbox"' in c or "dropdown" in low:
            return "ui-control-menu", "medium"
        if "disabled" in c or "cursor-not-allowed" in c:
            return "ui-control-states", "medium"
        if 'role="group"' in c or "segmented" in low:
            return "ui-control-group", "medium"
        if "<a " in c and "<button" not in c:
            return "ui-control-link", "medium"
        return "ui-control", "medium"
    if baseline == "wayfinding":
        low = c.lower()
        if "breadcrumb" in low:
            return "nav-breadcrumb", "medium"
        if "step" in low or 'aria-current="step"' in c:
            return "data-stepper", "medium"
        if "anchor" in low or "table of contents" in low or "toc" in low:
            return "nav-anchor", "medium"
        if "<h1" in c and ("actions" in low or "button" in low):
            return "page-header", "medium"
        return "wayfinding", "medium"
    return baseline, "high" if baseline in ("auth-form", "empty-state") else "low"


def semantic_tree(t: Tree) -> list[dict]:
    """Flatten the DOM tree to meaningful semantic nodes (depth<=3)."""
    out = []

    def label_for(n):
        if n["label"]:
            return n["label"]
        r = n["role"] or n["tag"]
        hint = {
            "nav": "Nav", "header": "Header", "footer": "Footer actions",
            "aside": "Panel", "section": "Group", "form": "Form",
            "ul": "Link group", "ol": "Steps", "input": "Field",
            "button": "Action", "a": "Link", "dialog": "Dialog",
            "h1": "Heading", "h2": "Group heading", "h3": "Item title",
        }
        return hint.get(r, r.title())

    name_for = {
        "nav": "nav", "header": "block", "footer": "block",
        "aside": "section", "section": "block", "form": "form",
        "ul": "block", "ol": "block", "input": "field",
        "button": "action", "a": "text-link", "dialog": "section",
        "h1": "heading", "h2": "heading", "h3": "heading",
        "h4": "heading", "svg": "icon",
    }

    def walk(n, depth):
        tag = n["tag"]
        if tag in SEMANTIC_TAGS and depth <= 3:
            out.append({
                "name": name_for.get(tag, "block"),
                "tag": tag,
                "label": label_for(n)[:60],
                "loop": False,
                "classes": n["classes"],
                "depth": depth,
            })
            nd = depth + 1
        else:
            nd = depth
        for ch in n["children"]:
            walk(ch, nd)

    for r in t.roots:
        walk(r, 0)
    return out[:24]


def slugify(pack: str, comp: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", f"{pack}-{comp}".lower()).strip("-")


def title_from(pack: str, comp: str, hints: list[str]) -> str:
    brand = next((h for h in hints if len(h) > 2), comp)
    return f"{brand} — {comp}"[:80]


def mode_of(classes: list[str]) -> str:
    """Judge the menu surface classes (panel), never the dim scrim."""
    dark = sum(
        1 for c in classes
        if re.search(r"(bg-(slate|zinc|stone|neutral|gray)-[89]\d\d|bg-\[#?(0|1)[0-9a-fA-F]{2,5}\]|text-(zinc|slate|gray|neutral)-100|text-white)", c)
        and "/" not in c  # alpha-suffixed classes are scrims, not surfaces
    )
    return "dark" if dark >= 1 else "light"


def style_tags(classes: list[str]) -> list[str]:
    tags = {"generated"}
    joined = " ".join(classes)
    if re.search(r"(font-serif|font-display|serif)", joined):
        tags.add("editorial")
    if re.search(r"(bg-(blue|indigo|violet|amber|emerald|rose)-[4-7]00|gradient)", joined):
        tags.add("colourful")
    if re.search(r"(border|divide)-", joined) and "shadow" not in joined:
        tags.add("minimal")
    if re.search(r"backdrop-(blur|brightness)", joined):
        tags.add("glass")
    return sorted(tags)


def bank_item(
    slug: str,
    pack: str,
    comp: str,
    html_text: str,
    topo_class: str,
    confidence: str,
    t: Tree,
    outdir: Path,
    section_class: str,
    category: list[str],
    query_word: str,
    comp_source: str | None,
    is_new_topo: bool,
) -> dict:
    tree = semantic_tree(t)
    mode = mode_of(t.panel_classes or t.all_classes)
    spec = {
        "id": str(uuid.uuid4()),
        "title": title_from(pack, comp, t.text_hints),
        "type": "section",
        "category": category,
        "elements": sorted(t.sig.keys()),
        "style_tags": style_tags(t.all_classes),
        "use_case": topo_class,
        "framework": "tailwind",
        "complexity": "Moderate",
        "plugins": [],
        "source": "google-ai-studio",
        "generator_pack": pack,
        "site_name": pack,
        "platform": "web",
        "featured_image": None,
        "rendered_fragment": f"{slug}.html",
        "component_source": comp_source,
        "matched_topo": {"topology_id": topo_class, "confidence": confidence},
        "is_new_topology": is_new_topo,
        "tags": {
            "section_class": section_class,
            "topology_class": topo_class,
            "style": [s for s in style_tags(t.all_classes) if s != "generated"],
            "category": category,
            "mode": mode,
            "platform": "web",
        },
        "queries": [f"generated {query_word}", topo_class],
        "short_description": "",
    }
    topo = {
        "label": spec["title"],
        "source": "google-ai-studio",
        "sourceUrl": "",
        "version": "1",
        "topology_id": topo_class,
        "element_sig": dict(sorted(t.sig.items())),
        "tree": tree,
    }
    (outdir / f"{slug}.topo.json").write_text(json.dumps(topo, indent=1) + "\n")
    (outdir / f"{slug}.spec.json").write_text(json.dumps(spec, indent=1) + "\n")
    return spec


def preview_css(root: Path = BANK) -> int:
    """Compile bank-preview.css — every Tailwind utility the banked
    fragments use, built by the vendored toolchain (no network).
    The picker serves it inside bank-exemplar preview docs so the
    reference fragments render faithfully."""
    import shutil
    import subprocess
    bin_ = REPO / "templates" / "astro" / "node_modules" / ".bin" / "tailwindcss"
    if not bin_.exists():
        print(f"vendored tailwindcss not found at {bin_}", file=sys.stderr)
        return 2
    node = shutil.which("node")
    if not node:
        cands = sorted(Path.home().glob(
            ".nvm/versions/node/*/bin/node"))
        node = str(cands[-1]) if cands else None
    if not node:
        print("node not found (PATH + ~/.nvm)", file=sys.stderr)
        return 2
    cfg = root / "tailwind.preview.cjs"
    src = root / "bank-preview-src.css"
    cfg.write_text(
        "module.exports={content:['" +
        str(root / "**" / "*.html") + "'],theme:{extend:{}}}\n")
    src.write_text("@tailwind base;\n@tailwind components;\n"
                   "@tailwind utilities;\n")
    out = root / "bank-preview.css"
    r = subprocess.run(
        [node, str(bin_), "-c", str(cfg), "-i", str(src), "-o",
         str(out), "--minify"], cwd=REPO)
    src.unlink()
    cfg.unlink()
    if r.returncode:
        print(f"tailwindcss exited {r.returncode}", file=sys.stderr)
        return r.returncode
    print(f"bank-preview.css: {out.stat().st_size} bytes")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview-css", action="store_true",
                    help="compile bank-preview.css and exit")
    ap.add_argument("render_dir", type=Path, nargs="?")
    ap.add_argument("tsx_dir", type=Path, nargs="?")
    ap.add_argument("--pack")
    ap.add_argument("--root", type=Path, default=BANK)
    args = ap.parse_args()
    if args.preview_css:
        return preview_css(args.root)
    if not (args.render_dir and args.tsx_dir and args.pack):
        ap.error("render_dir, tsx_dir and --pack are required")

    _meta_key = args.pack if args.pack in PACK_META else args.pack.split("-")[0]
    baseline, section_class, category, query_word = PACK_META[_meta_key]
    rendered = sorted(args.render_dir.glob("*.html"))
    if not rendered:
        print(f"no .html in {args.render_dir}", file=sys.stderr)
        return 2

    rows = []
    batch_src: dict[str, str] = {}  # batch filename -> banked filename
    for frag in rendered:
        comp = frag.stem
        slug = slugify(args.pack, comp)
        html_text = frag.read_text()
        meta = next((v for k, v in COMP_META.items() if comp.lower().startswith(k)), None)
        b, sc, cat, qw = meta or (baseline, section_class, category, query_word)
        topo_class, conf = sniff_topology(html_text, b)
        outdir = args.root / topo_class
        is_new_topo = not outdir.exists()
        outdir.mkdir(parents=True, exist_ok=True)
        (outdir / f"{slug}.html").write_text(html_text)
        comp_source = None
        tsx = [p for ext in ("tsx", "jsx")
               for p in args.tsx_dir.rglob(f"{comp}.{ext}")]
        if tsx:
            comp_source = f"{slug}.{tsx[0].suffix[1:]}"
            (outdir / comp_source).write_text(tsx[0].read_text())
        else:
            pat = re.compile(
                rf"export\s+(?:async\s+)?(?:function|const)\s+{re.escape(comp)}\b")
            for p in sorted(args.tsx_dir.rglob("*.[tj]sx")):
                try:
                    if pat.search(p.read_text()):
                        name = batch_src.setdefault(
                            p.name, f"{args.pack}-src-{p.stem.lower()}.tsx")
                        comp_source = name
                        if not (outdir / name).exists():
                            (outdir / name).write_text(p.read_text())
                        break
                except OSError:
                    continue
        t = Tree()
        t.feed(html_text)
        # If the fragment wraps the real component in demo scaffolding
        # (id-marked component elements), scope the signature to it.
        roots = component_roots(t.roots, f"{_meta_key}-")
        if roots is not None:
            restrict_tree(t, roots, f"{_meta_key}-")
        spec = bank_item(slug, args.pack, comp, html_text, topo_class, conf, t,
                         outdir, sc, cat, qw, comp_source, is_new_topo)
        rows.append({"slug": slug, "topology_class": topo_class,
                     "mode": spec["tags"]["mode"], "confidence": conf})
        print(f"{slug}: {topo_class} ({conf}, {spec['tags']['mode']})")

    # tags.json merge (idempotent by slug)
    tj = args.root / "tags.json"
    data = {"rows": []}
    if tj.exists():
        data = json.loads(tj.read_text())
    data["rows"] = [r for r in data["rows"] if r["slug"] not in {x["slug"] for x in rows}]
    for x in rows:
        spec = json.loads((args.root / x["topology_class"] / f"{x['slug']}.spec.json").read_text())
        data["rows"].append({"slug": x["slug"], "path": f"{x['topology_class']}/{x['slug']}", **spec["tags"]})
    tj.write_text(json.dumps(data, indent=1) + "\n")
    print(f"tags.json: {len(data['rows'])} rows")
    return 0


if __name__ == "__main__":
    sys.exit(main())
