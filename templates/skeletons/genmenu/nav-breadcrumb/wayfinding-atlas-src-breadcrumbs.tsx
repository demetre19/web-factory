import { useState } from 'react';
import {
  Home,
  Folder,
  FileCode2,
  Settings,
  ChevronRight,
  ChevronDown,
  MoreHorizontal,
  RotateCcw,
} from 'lucide-react';
import { collapseCrumbs } from '../../utils/stepLogic';

/* -------------------------------------------------------------------------- */
/* Way9: Classic Slash-Separated Breadcrumb (Compact · Minimal)               */
/* -------------------------------------------------------------------------- */
export function Way9() {
  const fullTrail = ['Documentation', 'Design System', 'Navigation', 'Breadcrumbs', 'Accessibility'];
  const [depth, setDepth] = useState(fullTrail.length);
  const visible = fullTrail.slice(0, depth);

  return (
    <div className="bg-white px-5 py-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          {visible.map((item, idx) => {
            const isCurrent = idx === visible.length - 1;
            return (
              <li key={item} className="flex items-center gap-2">
                {idx > 0 && (
                  <span aria-hidden="true" className="text-slate-300 select-none">
                    /
                  </span>
                )}
                {isCurrent ? (
                  <span aria-current="page" className="font-semibold text-slate-950">
                    {item}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDepth(idx + 1)}
                    className="text-slate-600 hover:text-slate-950 hover:underline underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 rounded"
                  >
                    {item}
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      {depth < fullTrail.length && (
        <button
          type="button"
          onClick={() => setDepth(fullTrail.length)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-950 whitespace-nowrap shrink-0"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Restore full path
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Way10: Icon-Prefixed Breadcrumb Trail (Compact · Professional)             */
/* -------------------------------------------------------------------------- */
export function Way10() {
  const nodes = [
    { label: 'Workspace', icon: Home },
    { label: 'Core Services', icon: Folder },
    { label: 'billing-worker.ts', icon: FileCode2 },
    { label: 'Environment Rules', icon: Settings },
  ];
  const [activeCount, setActiveCount] = useState(nodes.length);
  const currentNodes = nodes.slice(0, activeCount);

  return (
    <div className="bg-slate-50 px-5 py-3.5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm">
          {currentNodes.map((node, idx) => {
            const Icon = node.icon;
            const isLast = idx === currentNodes.length - 1;
            return (
              <li key={node.label} className="flex items-center gap-1.5">
                {idx > 0 && (
                  <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                )}
                {isLast ? (
                  <span
                    aria-current="page"
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-slate-200 font-semibold text-slate-900 text-xs sm:text-sm"
                  >
                    <Icon className="h-3.5 w-3.5 text-blue-600 shrink-0" aria-hidden="true" />
                    <span>{node.label}</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveCount(idx + 1)}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-slate-600 hover:text-slate-950 hover:bg-slate-200/60 transition-colors text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    <Icon className="h-3.5 w-3.5 text-slate-500 shrink-0" aria-hidden="true" />
                    <span>{node.label}</span>
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      {activeCount < nodes.length && (
        <button
          type="button"
          onClick={() => setActiveCount(nodes.length)}
          className="text-xs font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap shrink-0"
        >
          Reset path
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Way11: Collapsed / Ellipsis Breadcrumb (Compact · Dark)                    */
/* -------------------------------------------------------------------------- */
export function Way11() {
  const fullPath = [
    'Organization',
    'North America',
    'Fulfillment',
    'Warehouse East',
    'Inventory Alerts',
    'SKU-9402',
  ];
  const [depth, setDepth] = useState(fullPath.length);
  const [menuOpen, setMenuOpen] = useState(false);

  const visiblePath = fullPath.slice(0, depth);
  const collapsed = collapseCrumbs(visiblePath, 4);

  return (
    <div className="bg-neutral-900 text-neutral-100 px-5 py-4 rounded-xl border border-neutral-800 flex flex-wrap items-center justify-between gap-3">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm">
          {collapsed.leading.map((label, idx) => {
            const isSingleCurrent = !collapsed.isCollapsed && collapsed.leading.length === 1;
            return (
              <li key={label} className="flex items-center gap-1.5">
                {idx > 0 && <ChevronRight className="h-4 w-4 text-neutral-600" aria-hidden="true" />}
                {isSingleCurrent ? (
                  <span aria-current="page" className="font-semibold text-white">
                    {label}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setDepth(idx + 1);
                      setMenuOpen(false);
                    }}
                    className="text-neutral-300 hover:text-white transition-colors px-1.5 py-1 rounded hover:bg-neutral-800"
                  >
                    {label}
                  </button>
                )}
              </li>
            );
          })}

          {collapsed.isCollapsed && (
            <li className="relative flex items-center gap-1.5">
              <ChevronRight className="h-4 w-4 text-neutral-600" aria-hidden="true" />
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label="Show collapsed breadcrumb levels"
                className="flex h-7 w-8 items-center justify-center rounded bg-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  aria-label="Intermediate path segments"
                  className="absolute left-0 top-9 z-30 min-w-44 rounded-lg bg-neutral-950 border border-neutral-700 py-1.5 shadow-lg"
                >
                  {collapsed.hidden.map((hiddenLabel, hiddenIdx) => (
                    <button
                      key={hiddenLabel}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setDepth(1 + hiddenIdx + 1);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-800 hover:text-white transition-colors"
                    >
                      {hiddenLabel}
                    </button>
                  ))}
                </div>
              )}
            </li>
          )}

          {collapsed.trailing.map((label, tIdx) => {
            const isLast = tIdx === collapsed.trailing.length - 1;
            const targetDepth = 1 + collapsed.hidden.length + tIdx + 1;
            return (
              <li key={label} className="flex items-center gap-1.5">
                <ChevronRight className="h-4 w-4 text-neutral-600" aria-hidden="true" />
                {isLast ? (
                  <span aria-current="page" className="font-semibold text-white px-1.5 py-1">
                    {label}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setDepth(targetDepth);
                      setMenuOpen(false);
                    }}
                    className="text-neutral-300 hover:text-white transition-colors px-1.5 py-1 rounded hover:bg-neutral-800"
                  >
                    {label}
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      {depth < fullPath.length && (
        <button
          type="button"
          onClick={() => {
            setDepth(fullPath.length);
            setMenuOpen(false);
          }}
          className="text-xs font-medium text-amber-400 hover:text-amber-300 whitespace-nowrap shrink-0"
        >
          Restore 6 levels
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Way12: Dropdown Sibling Breadcrumb (Spacious · Professional)               */
/* -------------------------------------------------------------------------- */
export function Way12() {
  const orgOptions = ['Northstar Labs', 'Meridian Studio', 'Helios Ops'];
  const projectOptions = ['Q4 Funnel', 'Retention Cohort', 'Checkout v3'];
  const viewOptions = ['Conversion Events', 'Latency Breakdown', 'Drop-off Tree'];

  const [org, setOrg] = useState(orgOptions[0]);
  const [project, setProject] = useState(projectOptions[0]);
  const [view, setView] = useState(viewOptions[0]);
  const [openMenu, setOpenMenu] = useState<'org' | 'project' | 'view' | null>(null);

  const segments = [
    { key: 'org' as const, value: org, options: orgOptions, onSelect: setOrg, isCurrent: false },
    { key: 'project' as const, value: project, options: projectOptions, onSelect: setProject, isCurrent: false },
    { key: 'view' as const, value: view, options: viewOptions, onSelect: setView, isCurrent: true },
  ];

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200">
      <nav aria-label="Breadcrumb with sibling switchers">
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          {segments.map((seg, idx) => {
            const isOpen = openMenu === seg.key;
            return (
              <li key={seg.key} className="relative flex items-center gap-2">
                {idx > 0 && (
                  <span aria-hidden="true" className="text-slate-300 font-light">
                    /
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setOpenMenu(isOpen ? null : seg.key)}
                  aria-expanded={isOpen}
                  aria-haspopup="menu"
                  aria-current={seg.isCurrent ? 'page' : undefined}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    seg.isCurrent
                      ? 'border-slate-300 bg-slate-50 font-semibold text-slate-950'
                      : 'border-transparent hover:border-slate-200 hover:bg-slate-50 text-slate-700 font-medium'
                  }`}
                >
                  <span>{seg.value}</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                </button>

                {isOpen && (
                  <div
                    role="menu"
                    aria-label={`Switch ${seg.key}`}
                    className="absolute left-0 top-11 z-30 min-w-48 rounded-lg bg-white border border-slate-200 py-1.5 shadow-md"
                  >
                    {seg.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        role="menuitemradio"
                        aria-checked={opt === seg.value}
                        onClick={() => {
                          seg.onSelect(opt);
                          setOpenMenu(null);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-medium transition-colors ${
                          opt === seg.value
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Way13: Background-Pill Trail Breadcrumb (Compact · Colourful)              */
/* -------------------------------------------------------------------------- */
export function Way13() {
  const levels = ['Storefront', 'Audio Gear', 'Studio Monitors', 'Active Nearfield'];
  const [depth, setDepth] = useState(levels.length);
  const visible = levels.slice(0, depth);

  return (
    <div className="bg-sky-50/70 px-5 py-4 rounded-xl border border-sky-200/80 flex flex-wrap items-center justify-between gap-3">
      <nav aria-label="Category breadcrumb">
        <ol className="flex flex-wrap items-center gap-2">
          {visible.map((label, idx) => {
            const isCurrent = idx === visible.length - 1;
            return (
              <li key={label} className="flex items-center gap-2">
                {idx > 0 && (
                  <ChevronRight className="h-4 w-4 text-sky-400 shrink-0" aria-hidden="true" />
                )}
                {isCurrent ? (
                  <span
                    aria-current="page"
                    className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-semibold shadow-xs whitespace-nowrap"
                  >
                    {label}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDepth(idx + 1)}
                    className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white text-sky-900 border border-sky-200 hover:bg-sky-100/80 text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                  >
                    {label}
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      {depth < levels.length && (
        <button
          type="button"
          onClick={() => setDepth(levels.length)}
          className="text-xs font-semibold text-indigo-700 hover:text-indigo-900 whitespace-nowrap shrink-0"
        >
          Show all levels
        </button>
      )}
    </div>
  );
}
