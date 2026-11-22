import { Fragment, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, ChevronRight, FileText, Folder, FolderOpen } from 'lucide-react';
import { formatBytes, nextSortConfig, SortConfig, sortRecords, sumBy, toggleSelection } from '../../utils/tableLogic';

interface ChildDoc {
  id: string;
  name: string;
  kind: string;
  bytes: number;
  updated: string;
}

interface FolderNode {
  id: string;
  name: string;
  kind: string;
  bytes: number;
  updated: string;
  children: ChildDoc[];
}

const FOLDERS: FolderNode[] = [
  {
    id: 'dir-1',
    name: '01_Financial_Audits',
    kind: 'Folder · 3 files',
    bytes: 14_200_000,
    updated: '2026-11-18',
    children: [
      { id: 'c1', name: 'FY26-Balance-Sheet.xlsx', kind: 'Spreadsheet', bytes: 4_100_000, updated: '2026-11-18' },
      { id: 'c2', name: 'Tax-Provision-Memo.pdf', kind: 'PDF Document', bytes: 6_800_000, updated: '2026-11-14' },
      { id: 'c3', name: 'Auditor-Signoff.pdf', kind: 'PDF Document', bytes: 3_300_000, updated: '2026-11-10' },
    ],
  },
  {
    id: 'dir-2',
    name: '02_Engineering_RFCs',
    kind: 'Folder · 2 files',
    bytes: 5_650_000,
    updated: '2026-11-21',
    children: [
      { id: 'c4', name: 'RFC-042-ZeroDowntime-Migrations.md', kind: 'Markdown', bytes: 1_250_000, updated: '2026-11-21' },
      { id: 'c5', name: 'Topology-Diagram-v4.svg', kind: 'Vector Graphic', bytes: 4_400_000, updated: '2026-11-19' },
    ],
  },
  {
    id: 'dir-3',
    name: '03_Vendor_Contracts',
    kind: 'Folder · 2 files',
    bytes: 9_900_000,
    updated: '2026-11-08',
    children: [
      { id: 'c6', name: 'MSA-CloudProvider-2026.pdf', kind: 'PDF Document', bytes: 7_200_000, updated: '2026-11-08' },
      { id: 'c7', name: 'DPA-Addendum-EU.pdf', kind: 'PDF Document', bytes: 2_700_000, updated: '2026-11-02' },
    ],
  },
];

export function Table8() {
  const [sort, setSort] = useState<SortConfig<'name' | 'bytes' | 'updated'>>({ key: 'name', direction: 'ascending' });
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['dir-1']);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const sortedFolders = sortRecords(FOLDERS, sort);

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const renderSortIcon = (key: 'name' | 'bytes' | 'updated') => {
    if (sort.key !== key || sort.direction === 'none') return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />;
    return sort.direction === 'ascending' ? <ArrowUp className="h-3.5 w-3.5 text-slate-900" /> : <ArrowDown className="h-3.5 w-3.5 text-slate-900" />;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-200 bg-slate-50/70">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Hierarchical Workspace Tree</h3>
          <p className="text-xs text-slate-500 mt-0.5">Nested sub-rows · Expandable folders with indented child documents</p>
        </div>
        <span className="text-xs font-mono text-slate-500 tabular-nums">
          {selectedIds.length > 0 ? `${selectedIds.length} items checked` : `${formatBytes(sumBy(FOLDERS, (f) => f.bytes))} total`}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
              <th scope="col" className="w-10 px-4 py-3">
                <span className="sr-only">Select</span>
              </th>
              <th scope="col" aria-sort={sort.key === 'name' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'name'))} className="inline-flex items-center gap-1.5 hover:text-slate-950 cursor-pointer">
                  Directory / Document {renderSortIcon('name')}
                </button>
              </th>
              <th scope="col" className="px-4 py-3">Type</th>
              <th scope="col" aria-sort={sort.key === 'bytes' ? sort.direction : 'none'} className="px-4 py-3 text-right">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'bytes'))} className="inline-flex items-center justify-end gap-1.5 hover:text-slate-950 cursor-pointer">
                  Size {renderSortIcon('bytes')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'updated' ? sort.direction : 'none'} className="px-5 py-3 text-right">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'updated'))} className="inline-flex items-center justify-end gap-1.5 hover:text-slate-950 cursor-pointer">
                  Updated {renderSortIcon('updated')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedFolders.map((folder) => {
              const isOpen = expandedFolders.includes(folder.id);
              const folderChecked = selectedIds.includes(folder.id);
              return (
                <Fragment key={folder.id}>
                  <tr className="bg-white hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Select folder ${folder.name}`}
                        checked={folderChecked}
                        onChange={() => setSelectedIds((p) => toggleSelection(p, folder.id))}
                        className="h-4 w-4 rounded border-slate-300 text-slate-900 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-label={`Toggle ${folder.name}`}
                          onClick={() => toggleFolder(folder.id)}
                          className="inline-flex h-6 w-6 items-center justify-center rounded text-slate-500 hover:bg-slate-200/70 hover:text-slate-900 cursor-pointer"
                        >
                          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>
                        {isOpen ? <FolderOpen className="h-4 w-4 text-amber-600" /> : <Folder className="h-4 w-4 text-amber-500" />}
                        <span className="font-semibold text-slate-900">{folder.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{folder.kind}</td>
                    <td className="px-4 py-3 text-right font-mono text-xs font-medium text-slate-700 tabular-nums">{formatBytes(folder.bytes)}</td>
                    <td className="px-5 py-3 text-right font-mono text-xs text-slate-500 tabular-nums">{folder.updated}</td>
                  </tr>
                  {isOpen &&
                    folder.children.map((child) => {
                      const childChecked = selectedIds.includes(child.id);
                      return (
                        <tr key={child.id} className="bg-slate-50/50 hover:bg-slate-100/60 transition-colors">
                          <td className="px-4 py-2.5">
                            <input
                              type="checkbox"
                              aria-label={`Select ${child.name}`}
                              checked={childChecked}
                              onChange={() => setSelectedIds((p) => toggleSelection(p, child.id))}
                              className="h-4 w-4 rounded border-slate-300 text-slate-900 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2 pl-9 border-l border-slate-200 ml-3">
                              <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="text-sm text-slate-700">{child.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-slate-500">{child.kind}</td>
                          <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-500 tabular-nums">{formatBytes(child.bytes)}</td>
                          <td className="px-5 py-2.5 text-right font-mono text-xs text-slate-400 tabular-nums">{child.updated}</td>
                        </tr>
                      );
                    })}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
