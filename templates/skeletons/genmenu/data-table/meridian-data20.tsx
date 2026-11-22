import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Download,
  FileCode2,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Star,
} from 'lucide-react';

interface AssetFile {
  id: string;
  name: string;
  kind: 'spec' | 'csv' | 'svg' | 'token';
  sizeKb: number;
  modified: string;
  owner: string;
}

type FileSortKey = 'name' | 'sizeKb' | 'modified';

const FILES: AssetFile[] = [
  { id: 'f-1', name: 'meridian-tokens-v4.json', kind: 'token', sizeKb: 48, modified: '2026-11-21', owner: 'A. Osei' },
  { id: 'f-2', name: 'q4-cohort-retention.csv', kind: 'csv', sizeKb: 1840, modified: '2026-11-20', owner: 'R. Mehta' },
  { id: 'f-3', name: 'table-accessibility-audit.pdf', kind: 'spec', sizeKb: 620, modified: '2026-11-18', owner: 'C. Chen' },
  { id: 'f-4', name: 'telemetry-sparkline-kit.svg', kind: 'svg', sizeKb: 112, modified: '2026-11-15', owner: 'A. Osei' },
  { id: 'f-5', name: 'soc2-control-matrix.csv', kind: 'csv', sizeKb: 940, modified: '2026-11-12', owner: 'M. Patel' },
];

export function Data20() {
  const [sortKey, setSortKey] = useState<FileSortKey>('modified');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>(['f-1']);
  const [starredIds, setStarredIds] = useState<string[]>(['f-1', 'f-3']);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSort = (key: FileSortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'name' ? 'asc' : 'desc');
    }
  };

  const sortedFiles = [...FILES].sort((a, b) => {
    const mult = sortDir === 'asc' ? 1 : -1;
    if (sortKey === 'sizeKb') return (a.sizeKb - b.sizeKb) * mult;
    return a[sortKey].localeCompare(b[sortKey]) * mult;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleStar = (id: string) => {
    setStarredIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const formatSize = (kb: number) =>
    kb >= 1000 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;

  const fileIcon = (kind: AssetFile['kind']) => {
    if (kind === 'csv') return <FileSpreadsheet className="h-4 w-4 text-emerald-600" aria-hidden="true" />;
    if (kind === 'svg') return <ImageIcon className="h-4 w-4 text-indigo-600" aria-hidden="true" />;
    if (kind === 'token') return <FileCode2 className="h-4 w-4 text-amber-600" aria-hidden="true" />;
    return <FileText className="h-4 w-4 text-slate-600" aria-hidden="true" />;
  };

  return (
    <section
      aria-label="Design system asset file list"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2.5 text-xs">
          <h3 className="text-sm font-semibold text-slate-900">Workspace Asset Repository</h3>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span className="font-mono text-slate-500 tabular-nums">{selectedIds.length} selected</span>
        </div>
        <div className="flex items-center gap-2">
          {notice && <span className="text-xs text-slate-600">{notice}</span>}
          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setNotice(`Queued ${selectedIds.length} file(s) for archive download`)}
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-2.5 py-1 text-xs font-medium text-white hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              Download ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600">
              <th scope="col" className="w-10 px-4 py-2.5">
                <span className="sr-only">Select</span>
              </th>
              <th
                scope="col"
                aria-sort={sortKey === 'name' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                className="px-3 py-2.5 font-medium"
              >
                <button
                  type="button"
                  onClick={() => handleSort('name')}
                  className="inline-flex items-center gap-1.5 hover:text-slate-900 whitespace-nowrap"
                >
                  <span>File Name</span>
                  {sortKey !== 'name' ? (
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  ) : sortDir === 'asc' ? (
                    <ArrowUp className="h-3.5 w-3.5 text-slate-900" aria-hidden="true" />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5 text-slate-900" aria-hidden="true" />
                  )}
                </button>
              </th>
              <th scope="col" className="px-3 py-2.5 font-medium">Owner</th>
              <th
                scope="col"
                aria-sort={sortKey === 'modified' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                className="px-3 py-2.5 font-medium"
              >
                <button
                  type="button"
                  onClick={() => handleSort('modified')}
                  className="inline-flex items-center gap-1.5 hover:text-slate-900 whitespace-nowrap"
                >
                  <span>Modified</span>
                  {sortKey !== 'modified' ? (
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  ) : sortDir === 'asc' ? (
                    <ArrowUp className="h-3.5 w-3.5 text-slate-900" aria-hidden="true" />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5 text-slate-900" aria-hidden="true" />
                  )}
                </button>
              </th>
              <th
                scope="col"
                aria-sort={sortKey === 'sizeKb' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
                className="px-3 py-2.5 text-right font-medium"
              >
                <button
                  type="button"
                  onClick={() => handleSort('sizeKb')}
                  className="inline-flex flex-row-reverse items-center gap-1.5 hover:text-slate-900 whitespace-nowrap"
                >
                  <span>Size</span>
                  {sortKey !== 'sizeKb' ? (
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                  ) : sortDir === 'asc' ? (
                    <ArrowUp className="h-3.5 w-3.5 text-slate-900" aria-hidden="true" />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5 text-slate-900" aria-hidden="true" />
                  )}
                </button>
              </th>
              <th scope="col" className="px-4 py-2.5 text-right font-medium">Pin</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedFiles.map((file) => {
              const isSelected = selectedIds.includes(file.id);
              const isStarred = starredIds.includes(file.id);
              return (
                <tr
                  key={file.id}
                  aria-selected={isSelected}
                  className={isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/70'}
                >
                  <td className="px-4 py-2.5">
                    <input
                      type="checkbox"
                      aria-label={`Select ${file.name}`}
                      checked={isSelected}
                      onChange={() => toggleSelect(file.id)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      {fileIcon(file.kind)}
                      <span className="font-mono font-medium text-slate-900">{file.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{file.owner}</td>
                  <td className="px-3 py-2.5 font-mono text-slate-600 tabular-nums whitespace-nowrap">
                    <time dateTime={file.modified}>{file.modified}</time>
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono text-slate-800 tabular-nums whitespace-nowrap">
                    {formatSize(file.sizeKb)}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button
                      type="button"
                      aria-pressed={isStarred}
                      aria-label={isStarred ? `Unstar ${file.name}` : `Star ${file.name}`}
                      onClick={() => toggleStar(file.id)}
                      className={`rounded p-1 transition-colors ${
                        isStarred ? 'text-amber-500' : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      <Star className="h-3.5 w-3.5" fill={isStarred ? 'currentColor' : 'none'} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
