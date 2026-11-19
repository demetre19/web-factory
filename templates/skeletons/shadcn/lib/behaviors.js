/* shadcn/radix skeleton behaviours — vanilla JS, no deps.
 * Implements the Radix/WAI-ARIA interaction contract on skeleton markup.
 * Elements are keyed by data-slot names, matching the registry source.
 * MIT-licensed derivative structure; behaviour spec = WAI-ARIA APG.
 * Include on pages that use interactive skeletons:
 *   <script src="behaviors.js" defer></script>
 */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- disclosure helpers ---------- */
  const setOpen = (trig, panel, open) => {
    trig?.setAttribute("aria-expanded", String(open));
    trig?.setAttribute("data-state", open ? "open" : "closed");
    panel?.setAttribute("data-state", open ? "open" : "closed");
    if (panel) panel.hidden = !open;
  };

  /* ---------- accordion / collapsible ---------- */
  $$('[data-slot="accordion"], [data-slot="collapsible"]').forEach((root) => {
    const single = root.dataset.type !== "multiple";
    $$('[data-slot="accordion-trigger"], [data-slot="collapsible-trigger"]', root).forEach(
      (trig) => {
        const panel =
          trig.parentElement?.nextElementSibling?.matches?.(
            '[data-slot="accordion-content"], [data-slot="collapsible-content"]'
          )
            ? trig.parentElement.nextElementSibling
            : trig.closest("[data-state]")?.querySelector(
                '[data-slot="accordion-content"], [data-slot="collapsible-content"]'
              );
        trig.addEventListener("click", () => {
          const opening = trig.getAttribute("aria-expanded") !== "true";
          if (single && opening) {
            $$('[data-slot="accordion-trigger"]', root).forEach((t) => {
              const p = t.closest('[data-state]')?.querySelector(
                '[data-slot="accordion-content"]'
              );
              if (t !== trig) setOpen(t, p, false);
            });
          }
          setOpen(trig, panel, opening);
          trig.closest("[data-state]")?.setAttribute("data-state", opening ? "open" : "closed");
        });
      }
    );
    // APG: ↑/↓/Home/End move trigger focus
    root.addEventListener("keydown", (e) => {
      const trigs = $$('[data-slot="accordion-trigger"]', root);
      const i = trigs.indexOf(e.target);
      if (i < 0) return;
      const map = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: trigs.length - 1 };
      if (e.key in map) {
        e.preventDefault();
        trigs[(map[e.key] + trigs.length) % trigs.length].focus();
      }
    });
  });

  /* ---------- tabs (automatic activation) ---------- */
  $$('[data-slot="tabs"]').forEach((root) => {
    const list = $('[data-slot="tabs-list"]', root);
    const tabs = $$('[data-slot="tabs-trigger"]', root);
    const panels = $$('[data-slot="tabs-content"]', root);
    const select = (tab) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.setAttribute("data-state", on ? "active" : "inactive");
        t.tabIndex = on ? 0 : -1;
      });
      panels.forEach((p, i) => {
        const on = i === tabs.indexOf(tab);
        p.hidden = !on;
        p.setAttribute("data-state", on ? "active" : "inactive");
      });
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", (e) => {
        const horiz = list?.getAttribute("aria-orientation") !== "vertical";
        const next = { ArrowRight: horiz && i + 1, ArrowDown: !horiz && i + 1,
                       ArrowLeft: horiz && i - 1, ArrowUp: !horiz && i - 1,
                       Home: 0, End: tabs.length - 1 }[e.key];
        if (next !== false && next !== undefined) {
          e.preventDefault();
          select(tabs[(next + tabs.length) % tabs.length]);
          tabs[(next + tabs.length) % tabs.length].focus();
        }
      });
    });
    if (!tabs.some((t) => t.getAttribute("aria-selected") === "true") && tabs[0])
      select(tabs[0]);
  });

  /* ---------- checkbox / switch / toggle ---------- */
  const checkedState = (el, role) => {
    el.addEventListener("click", () => {
      const on = el.getAttribute("aria-checked") !== "true";
      if (el.hasAttribute("aria-pressed")) el.setAttribute("aria-pressed", String(on));
      else el.setAttribute("aria-checked", String(on));
      const st = on ? "checked" : "unchecked";
      el.setAttribute("data-state", role === "toggle" ? (on ? "on" : "off") : st);
      $$("[data-state]", el).forEach((n) => n.setAttribute("data-state", st));
    });
  };
  $$('[data-slot="checkbox"], [data-slot="switch"], [data-slot="toggle"], [data-slot="toggle-group"] [data-slot="toggle-group-item"]').forEach((el) => checkedState(el, "toggle"));

  /* ---------- radio-group ---------- */
  $$('[data-slot="radio-group"]').forEach((group) => {
    const items = $$('[data-slot="radio-group-item"]', group);
    items.forEach((item, i) => {
      const check = () => {
        items.forEach((it) => {
          const on = it === item;
          it.setAttribute("aria-checked", String(on));
          it.setAttribute("data-state", on ? "checked" : "unchecked");
          it.tabIndex = on ? 0 : -1;
          $$("[data-state]", it).forEach((n) => n.setAttribute("data-state", on ? "checked" : "unchecked"));
        });
      };
      item.addEventListener("click", check);
      item.addEventListener("keydown", (e) => {
        const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (d) {
          e.preventDefault();
          const j = (items.indexOf(document.activeElement) + d + items.length) % items.length;
          items[j].focus();
          items[j].click();
        }
      });
    });
  });

  /* ---------- overlay dismiss (dialog/sheet/drawer/menus) ---------- */
  const dismissLayer = (layer, triggerSel) => {
    const close = () => {
      layer.querySelectorAll("[data-state]").forEach((n) => n.setAttribute("data-state", "closed"));
      layer.setAttribute("data-state", "closed");
      layer.hidden = true;
      $(triggerSel)?.setAttribute("aria-expanded", "false");
      $(triggerSel)?.setAttribute("data-state", "closed");
      $(triggerSel)?.focus(); // Radix: focus returns to trigger
    };
    $$('[data-slot$="-close"]', layer).forEach((b) => b.addEventListener("click", close));
    layer.addEventListener("keydown", (e) => e.key === "Escape" && close());
    $('[data-slot$="-overlay"]', layer)?.addEventListener("click", close);
    return close;
  };
  ["dialog", "sheet", "drawer", "alert-dialog"].forEach((kind) => {
    const trig = $(`[data-slot="${kind}-trigger"]`);
    const content = $(`[data-slot="${kind}-content"]`);
    if (trig && content) {
      const layer = content.closest("[data-state]")?.parentElement || content.parentElement;
      trig.addEventListener("click", () => {
        content.setAttribute("data-state", "open");
        content.hidden = false;
        trig.setAttribute("aria-expanded", "true");
        content.focus(); // Radix: focus enters content
      });
      dismissLayer(layer || content, `[data-slot="${kind}-trigger"]`);
    }
  });
  // popover / dropdown-menu / select / hover-card / tooltip: click-outside + Esc
  const popKinds = ["popover", "dropdown-menu", "select", "context-menu", "menubar", "hover-card", "tooltip"];
  document.addEventListener("click", (e) => {
    popKinds.forEach((k) => {
      const c = $(`[data-slot="${k}-content"]`);
      if (c && c.getAttribute("data-state") === "open" && !c.contains(e.target) &&
          !e.target.closest(`[data-slot="${k}-trigger"]`)) {
        c.setAttribute("data-state", "closed");
        c.hidden = true;
        $(`[data-slot="${k}-trigger"]`)?.setAttribute("aria-expanded", "false");
      }
    });
  });
  popKinds.forEach((k) => {
    const trig = $(`[data-slot="${k}-trigger"]`);
    const c = $(`[data-slot="${k}-content"]`);
    if (trig && c) {
      trig.addEventListener("click", () => {
        const open = c.getAttribute("data-state") !== "open";
        c.setAttribute("data-state", open ? "open" : "closed");
        c.hidden = !open;
        trig.setAttribute("aria-expanded", String(open));
        trig.setAttribute("data-state", open ? "open" : "closed");
        if (open && (k === "dropdown-menu" || k === "select" || k === "menubar"))
          $('[role="menuitem"], [role="option"], [data-slot$="-item"]', c)?.focus();
      });
      trig.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
          if (["dropdown-menu", "select", "menubar", "context-menu"].includes(k)) {
            e.preventDefault();
            trig.click();
          }
        }
      });
      if (k === "hover-card" || k === "tooltip") {
        let t;
        const show = () => { t = setTimeout(() => { c.hidden = false; c.setAttribute("data-state", "open"); }, k === "tooltip" ? 700 : 300); };
        const hide = () => { clearTimeout(t); c.hidden = true; c.setAttribute("data-state", "closed"); };
        trig.addEventListener("mouseenter", show);
        trig.addEventListener("mouseleave", hide);
        trig.addEventListener("focus", show);
        trig.addEventListener("blur", hide);
      }
    }
  });
  // roving focus inside menus/listboxes
  document.addEventListener("keydown", (e) => {
    const item = e.target.closest?.('[role="menuitem"], [role="option"], [role="menuitemcheckbox"], [role="menuitemradio"]');
    if (!item) return;
    const parent = item.closest('[role="menu"], [role="listbox"], [role="menubar"]');
    const items = $$('[role="menuitem"], [role="option"], [role="menuitemcheckbox"], [role="menuitemradio"]', parent);
    const i = items.indexOf(item);
    const horiz = parent.getAttribute("role") === "menubar" || parent.getAttribute("aria-orientation") === "horizontal";
    const d = { ArrowDown: !horiz && 1, ArrowRight: horiz && 1, ArrowUp: !horiz && -1, ArrowLeft: horiz && -1,
                Home: "home", End: "end" }[e.key];
    if (d === false || d === undefined) return;
    e.preventDefault();
    const j = d === "home" ? 0 : d === "end" ? items.length - 1 : (i + d + items.length) % items.length;
    items[j].focus();
  });

  /* ---------- slider ---------- */
  $$('[data-slot="slider"]').forEach((root) => {
    const thumb = $('[data-slot="slider-thumb"]', root);
    const range = $('[data-slot="slider-range"]', root);
    if (!thumb) return;
    let v = parseFloat(thumb.getAttribute("aria-valuenow") || 0);
    const min = parseFloat(thumb.getAttribute("aria-valuemin") || 0);
    const max = parseFloat(thumb.getAttribute("aria-valuemax") || 100);
    const set = (nv) => {
      v = Math.min(max, Math.max(min, nv));
      thumb.setAttribute("aria-valuenow", String(v));
      if (range) range.style.transform = `scaleX(${v / max})`;
    };
    thumb.addEventListener("keydown", (e) => {
      const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1,
                     PageUp: 10, PageDown: -10, Home: min - v, End: max - v }[e.key];
      if (step !== undefined) { e.preventDefault(); set(v + step); }
    });
  });

  /* ---------- progress ---------- */
  $$('[data-slot="progress"]').forEach((root) => {
    const v = root.getAttribute("aria-valuenow") || root.dataset.value || 0;
    const ind = $('[data-slot="progress-indicator"]', root);
    if (ind) ind.style.transform = `translateX(-${100 - v}%)`;
  });

  /* ---------- sonner-style toast (announces live region) ---------- */
  window.skeletonToast = (msg, variant = "default") => {
    let region = $('[data-slot="sonner"]');
    if (!region) {
      region = document.createElement("ol");
      region.setAttribute("data-slot", "sonner");
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }
    const li = document.createElement("li");
    li.setAttribute("data-slot", "toast");
    li.setAttribute("data-type", variant);
    li.setAttribute("role", "status");
    li.textContent = msg;
    region.appendChild(li);
    setTimeout(() => li.setAttribute("data-state", "closed"), 5000);
    return li;
  };
})();
