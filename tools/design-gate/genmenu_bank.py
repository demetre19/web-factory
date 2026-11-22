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
            "classes": cls.split()[:6],
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


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("render_dir", type=Path)
    ap.add_argument("tsx_dir", type=Path)
    ap.add_argument("--pack", required=True)
    ap.add_argument("--root", type=Path, default=BANK)
    args = ap.parse_args()

    baseline, section_class, category, query_word = PACK_META[args.pack.split("-")[0]]
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
