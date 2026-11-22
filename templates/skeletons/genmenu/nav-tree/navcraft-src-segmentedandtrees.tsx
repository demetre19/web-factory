import React, { useState } from 'react';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  FolderOpen,
  Kanban,
  LayoutGrid,
  List,
} from 'lucide-react';
import { toggleSetItem } from '../../utils/navHelpers';

/* -------------------------------------------------------------------------- */
/* Nav11: Segmented Control (Timeframe Switcher)                              */
/* -------------------------------------------------------------------------- */
const PERIOD_STATS: Record<string, { visits: string; conversion: string }> = {
  Day: { visits: '4,280', conversion: '3.4%' },
  Week: { visits: '29,140', conversion: '3.8%' },
  Month: { visits: '118,900', conversion: '4.1%' },
  Quarter: { visits: '342,610', conversion: '4.3%' },
};

export function Nav11() {
  const [period, setPeriod] = useState<'Day' | 'Week' | 'Month' | 'Quarter'>('Week');
  const stats = PERIOD_STATS[period];

  return (
    <div className="flex flex-col gap-3">
      <nav aria-label="Reporting timeframe">
        <div
          role="radiogroup"
          aria-label="Timeframe"
          className="inline-grid w-full grid-cols-4 rounded-xl bg-slate-200/75 p-1 sm:w-auto"
        >
          {(['Day', 'Week', 'Month', 'Quarter'] as const).map((item) => {
            const active = period === item;
            return (
              <button
                key={item}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setPeriod(item)}
                className={`rounded-lg px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-all ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </nav>
      <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-600 tabular-nums">
        <span>{period} sessions: {stats.visits}</span>
        <span>Conversion: {stats.conversion}</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Nav12: Icon Segmented Controls (View Mode + Text Alignment)                */
/* -------------------------------------------------------------------------- */
export function Nav12() {
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'board'>('grid');
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('left');

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="View layout switcher">
          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5">
            {[
              { id: 'grid' as const, label: 'Grid view', icon: LayoutGrid },
              { id: 'list' as const, label: 'List view', icon: List },
              { id: 'board' as const, label: 'Board view', icon: Kanban },
            ].map((item) => {
              const Icon = item.icon;
              const pressed = viewMode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.label}
                  aria-pressed={pressed}
                  onClick={() => setViewMode(item.id)}
                  className={`inline-flex h-8 w-9 items-center justify-center rounded-md transition-colors ${
                    pressed
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </nav>

        <nav aria-label="Content alignment">
          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-100 p-0.5">
            {[
              { id: 'left' as const, label: 'Align left', icon: AlignLeft },
              { id: 'center' as const, label: 'Align center', icon: AlignCenter },
              { id: 'right' as const, label: 'Align right', icon: AlignRight },
            ].map((item) => {
              const Icon = item.icon;
              const pressed = align === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.label}
                  aria-pressed={pressed}
                  onClick={() => setAlign(item.id)}
                  className={`inline-flex h-8 w-9 items-center justify-center rounded-md transition-colors ${
                    pressed
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      <div
        className={`rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-600 ${
          align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left'
        }`}
      >
        Active layout: <span className="font-medium text-slate-900">{viewMode}</span> · Aligned {align}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Nav13: Collapsible File Tree Menu                                          */
/* -------------------------------------------------------------------------- */
interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
}

const FILE_TREE: TreeNode[] = [
  {
    id: 'src',
    name: 'src',
    children: [
      {
        id: 'src/components',
        name: 'components',
        children: [
          { id: 'src/components/Header.tsx', name: 'Header.tsx' },
          { id: 'src/components/Sidebar.tsx', name: 'Sidebar.tsx' },
        ],
      },
      {
        id: 'src/utils',
        name: 'utils',
        children: [{ id: 'src/utils/format.ts', name: 'format.ts' }],
      },
      { id: 'src/App.tsx', name: 'App.tsx' },
    ],
  },
  {
    id: 'docs',
    name: 'docs',
    children: [{ id: 'docs/architecture.md', name: 'architecture.md' }],
  },
  { id: 'package.json', name: 'package.json' },
];

export function Nav13() {
  const [expanded, setExpanded] = useState<string[]>(['src', 'src/components']);
  const [selected, setSelected] = useState('src/components/Header.tsx');

  const renderNodes = (nodes: TreeNode[], depth = 0) => (
    <ul role={depth === 0 ? 'tree' : 'group'} className="space-y-0.5">
      {nodes.map((node) => {
        const hasChildren = Boolean(node.children?.length);
        const isExpanded = expanded.includes(node.id);
        const isSelected = selected === node.id;

        return (
          <li
            key={node.id}
            role="treeitem"
            aria-expanded={hasChildren ? isExpanded : undefined}
            aria-selected={isSelected}
          >
            <button
              type="button"
              onClick={() => {
                if (hasChildren) {
                  setExpanded((prev) => toggleSetItem(prev, node.id));
                } else {
                  setSelected(node.id);
                }
              }}
              style={{ paddingLeft: `${depth * 14 + 8}px` }}
              className={`flex w-full items-center gap-1.5 rounded-md py-1.5 pr-2.5 text-left text-xs transition-colors ${
                isSelected
                  ? 'bg-blue-50 font-medium text-blue-800'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                )
              ) : (
                <span className="w-3.5 shrink-0" aria-hidden="true" />
              )}

              {hasChildren ? (
                isExpanded ? (
                  <FolderOpen className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden="true" />
                ) : (
                  <Folder className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden="true" />
                )
              ) : (
                <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              )}

              <span className="truncate">{node.name}</span>
            </button>

            {hasChildren && isExpanded && node.children && renderNodes(node.children, depth + 1)}
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs text-slate-500">
        <span className="font-medium text-slate-700">Project Explorer</span>
        <span className="font-mono truncate max-w-[190px]">{selected}</span>
      </div>
      <nav aria-label="Project file tree">{renderNodes(FILE_TREE)}</nav>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Nav14: Collapsible Document Outline / TOC Tree                             */
/* -------------------------------------------------------------------------- */
const OUTLINE_SECTIONS = [
  {
    id: 'sec-1',
    title: '1. Core Primitives',
    items: ['1.1 Semantic Landmarks', '1.2 Focus Management'],
  },
  {
    id: 'sec-2',
    title: '2. Overlay Mechanics',
    items: ['2.1 Escape Key Dismissal', '2.2 Viewport Collision'],
  },
  {
    id: 'sec-3',
    title: '3. Keyboard Navigation',
    items: ['3.1 Roving Tabindex', '3.2 Typeahead Lookup'],
  },
];

export function Nav14() {
  const [openSections, setOpenSections] = useState<string[]>(['sec-1', 'sec-2']);
  const [activeAnchor, setActiveAnchor] = useState('1.1 Semantic Landmarks');

  return (
    <nav
      aria-label="Document outline"
      className="rounded-xl border border-slate-200 bg-white p-3"
    >
      <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
        <span className="font-semibold text-slate-800">On this page</span>
        <span className="truncate max-w-[160px] text-blue-700">{activeAnchor}</span>
      </div>

      <ol className="space-y-1">
        {OUTLINE_SECTIONS.map((section) => {
          const isOpen = openSections.includes(section.id);
          return (
            <li key={section.id}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenSections((prev) => toggleSetItem(prev, section.id))}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <span>{section.title}</span>
                {isOpen ? (
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                )}
              </button>
              {isOpen && (
                <ol className="mt-0.5 ml-3 space-y-0.5 border-l border-slate-200 pl-2.5">
                  {section.items.map((item) => {
                    const isActive = activeAnchor === item;
                    return (
                      <li key={item}>
                        <button
                          type="button"
                          aria-current={isActive ? 'location' : undefined}
                          onClick={() => setActiveAnchor(item)}
                          className={`w-full rounded-md px-2 py-1 text-left text-xs transition-colors ${
                            isActive
                              ? 'bg-blue-50 font-medium text-blue-700'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          {item}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
