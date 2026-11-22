import { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Copy, FileSpreadsheet, FileText, FolderArchive, Image, MoreHorizontal, Trash2 } from 'lucide-react';
import { formatBytes, nextSortConfig, SortConfig, sortRecords, toggleAllSelection, toggleSelection } from '../../utils/tableLogic';

interface VaultFile {
  id: string;
  name: string;
  ext: 'PDF' | 'CSV' | 'ZIP' | 'PNG';
  owner: string;
  bytes: number;
  modified: string;
  access: 'Public Link' | 'Team Only' | 'Restricted';
}

const INITIAL_FILES: VaultFile[] = [
  { id: 'f1', name: 'Q4-Board-Deck-Final.pdf', ext: 'PDF', owner: 'Clara Lindqvist', bytes: 18_450_000, modified: '2026-11-20', access: 'Restricted' },
  { id: 'f2', name: 'customer-churn-cohort.csv', ext: 'CSV', owner: 'Priya Natarajan', bytes: 3_420_000, modified: '2026-11-19', access: 'Team Only' },
  { id: 'f3', name: 'brand-guidelines-v3.zip', ext: 'ZIP', owner: 'Marcus Vance', bytes: 142_800_000, modified: '2026-11-14', access: 'Public Link' },
  { id: 'f4', name: 'checkout-wireframe-hero.png', ext: 'PNG', owner: 'Jonas Meyer', bytes: 6_180_000, modified: '2026-11-18', access: 'Team Only' },
  { id: 'f5', name: 'soc2-type2-attestation.pdf', ext: 'PDF', owner: 'David Okafor', bytes: 9_800_000, modified: '2026-11-05', access: 'Restricted' },
];

export function Table7() {
  const [files, setFiles] = useState<VaultFile[]>(INITIAL_FILES);
  const [sort, setSort] = useState<SortConfig<keyof VaultFile & string>>({ key: 'modified', direction: 'descending' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const sorted = sortRecords(files, sort);
  const allChecked = sorted.length > 0 && sorted.every((f) => selectedIds.includes(f.id));

  const renderSortIcon = (key: keyof VaultFile & string) => {
    if (sort.key !== key || sort.direction === 'none') return <ArrowUpDown className="h-3.5 w-3.5 text-neutral-400" />;
    return sort.direction === 'ascending' ? <ArrowUp className="h-3.5 w-3.5 text-neutral-900" /> : <ArrowDown className="h-3.5 w-3.5 text-neutral-900" />;
  };

  const FileIcon = ({ ext }: { ext: VaultFile['ext'] }) => {
    if (ext === 'CSV') return <FileSpreadsheet className="h-4 w-4 text-emerald-600" />;
    if (ext === 'ZIP') return <FolderArchive className="h-4 w-4 text-amber-600" />;
    if (ext === 'PNG') return <Image className="h-4 w-4 text-sky-600" />;
    return <FileText className="h-4 w-4 text-rose-600" />;
  };

  const deleteSelected = () => {
    setFiles((prev) => prev.filter((f) => !selectedIds.includes(f.id)));
    setSelectedIds([]);
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-visible">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-neutral-200">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900">Document Repository</h3>
          <p className="text-xs text-neutral-500 mt-0.5">File/document table · Byte-aware sorting, bulk remove & row actions</p>
        </div>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs">
            <span className="font-medium text-neutral-800 tabular-nums">{selectedIds.length} files selected</span>
            <button
              type="button"
              onClick={deleteSelected}
              className="inline-flex items-center gap-1 rounded bg-rose-600 px-2 py-0.5 text-white hover:bg-rose-700 cursor-pointer"
            >
              <Trash2 className="h-3 w-3" /> Delete
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-xs font-medium text-neutral-500">
              <th scope="col" className="w-11 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all files"
                  checked={allChecked}
                  onChange={() => setSelectedIds((p) => toggleAllSelection(p, sorted.map((f) => f.id)))}
                  className="h-4 w-4 rounded border-neutral-300 text-neutral-900 cursor-pointer"
                />
              </th>
              <th scope="col" aria-sort={sort.key === 'name' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'name'))} className="inline-flex items-center gap-1.5 text-neutral-700 hover:text-black cursor-pointer">
                  File Name {renderSortIcon('name')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'owner' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'owner'))} className="inline-flex items-center gap-1.5 text-neutral-700 hover:text-black cursor-pointer">
                  Owner {renderSortIcon('owner')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'bytes' ? sort.direction : 'none'} className="px-4 py-3 text-right">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'bytes'))} className="inline-flex items-center justify-end gap-1.5 text-neutral-700 hover:text-black cursor-pointer">
                  Size {renderSortIcon('bytes')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'access' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'access'))} className="inline-flex items-center gap-1.5 text-neutral-700 hover:text-black cursor-pointer">
                  Sharing {renderSortIcon('access')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'modified' ? sort.direction : 'none'} className="px-4 py-3 text-right">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'modified'))} className="inline-flex items-center justify-end gap-1.5 text-neutral-700 hover:text-black cursor-pointer">
                  Modified {renderSortIcon('modified')}
                </button>
              </th>
              <th scope="col" className="w-12 px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {sorted.map((file) => {
              const checked = selectedIds.includes(file.id);
              return (
                <tr key={file.id} className={checked ? 'bg-neutral-50' : 'hover:bg-neutral-50/60'}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${file.name}`}
                      checked={checked}
                      onChange={() => setSelectedIds((p) => toggleSelection(p, file.id))}
                      className="h-4 w-4 rounded border-neutral-300 text-neutral-900 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <FileIcon ext={file.ext} />
                      <span className="font-medium text-neutral-900">{file.name}</span>
                      {copiedId === file.id && <span className="text-[11px] font-medium text-emerald-700">Link copied</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-600">{file.owner}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-neutral-600 tabular-nums">{formatBytes(file.bytes)}</td>
                  <td className="px-4 py-3 text-xs text-neutral-700">{file.access}</td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-neutral-500 tabular-nums">{file.modified}</td>
                  <td className="px-4 py-3 text-right relative">
                    <button
                      type="button"
                      aria-label={`File options for ${file.name}`}
                      aria-expanded={menuId === file.id}
                      onClick={() => setMenuId((p) => (p === file.id ? null : file.id))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 cursor-pointer"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                    {menuId === file.id && (
                      <div role="menu" className="absolute right-4 top-10 z-20 w-40 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg text-left text-xs">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setCopiedId(file.id);
                            setMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-neutral-700 hover:bg-neutral-50 cursor-pointer"
                        >
                          <Copy className="h-3.5 w-3.5" /> Copy Share Link
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setFiles((prev) => prev.filter((f) => f.id !== file.id));
                            setMenuId(null);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-rose-700 hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete File
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
