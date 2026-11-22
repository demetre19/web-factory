import { Fragment, useState } from 'react';
import { Archive, ArrowDown, ArrowUp, ArrowUpDown, CheckCircle, ChevronDown, ChevronRight, MoreHorizontal } from 'lucide-react';
import { nextSortConfig, SortConfig, sortRecords } from '../../utils/tableLogic';

interface ExecutiveDoc {
  id: string;
  title: string;
  author: string;
  classification: 'Confidential' | 'Internal' | 'Board Only';
  version: string;
  updated: string;
  status: 'Approved' | 'In Review' | 'Archived';
  abstract: string;
  checksum: string;
}

const INITIAL_DOCS: ExecutiveDoc[] = [
  {
    id: 'ed1',
    title: 'Annual Capital Allocation Memo 2027',
    author: 'Clara Lindqvist',
    classification: 'Board Only',
    version: 'v3.2',
    updated: '2026-11-18',
    status: 'Approved',
    abstract: 'Outlines R&D capex distribution, treasury reserve targets, and European data-center expansion milestones.',
    checksum: 'sha256:9f84c2e1...4b7a',
  },
  {
    id: 'ed2',
    title: 'Zero-Trust Infrastructure Charter',
    author: 'Sora Takahashi',
    classification: 'Confidential',
    version: 'v2.0',
    updated: '2026-11-20',
    status: 'In Review',
    abstract: 'Defines mandatory hardware-key authentication, mTLS service mesh policies, and ephemeral workload credentials.',
    checksum: 'sha256:3d19a07c...81ef',
  },
  {
    id: 'ed3',
    title: 'Enterprise SLA & Incident Escalation Handbook',
    author: 'David Okafor',
    classification: 'Internal',
    version: 'v4.1',
    updated: '2026-11-09',
    status: 'Approved',
    abstract: 'Standard operating response times for P0/P1 customer incidents, status page cadence, and post-mortem ownership.',
    checksum: 'sha256:7a20bc54...12de',
  },
];

export function Table17() {
  const [docs, setDocs] = useState<ExecutiveDoc[]>(INITIAL_DOCS);
  const [sort, setSort] = useState<SortConfig<keyof ExecutiveDoc & string>>({ key: 'updated', direction: 'descending' });
  const [expandedIds, setExpandedIds] = useState<string[]>(['ed1']);
  const [menuId, setMenuId] = useState<string | null>(null);

  const sorted = sortRecords(docs, sort);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const renderSortIcon = (key: keyof ExecutiveDoc & string) => {
    if (sort.key !== key || sort.direction === 'none') return <ArrowUpDown className="h-3.5 w-3.5 text-stone-400" />;
    return sort.direction === 'ascending' ? <ArrowUp className="h-3.5 w-3.5 text-stone-900" /> : <ArrowDown className="h-3.5 w-3.5 text-stone-900" />;
  };

  const updateStatus = (id: string, status: ExecutiveDoc['status']) => {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
    setMenuId(null);
  };

  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-visible">
      <div className="px-6 py-5 border-b border-stone-200 bg-stone-50/50">
        <h3 className="text-base font-semibold text-stone-900">Executive Governance Library</h3>
        <p className="text-xs text-stone-500 mt-0.5">Roomy editorial density · Expandable abstracts & sign-off actions</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 text-xs font-medium text-stone-500">
              <th scope="col" className="w-12 px-4 py-3.5">
                <span className="sr-only">Expand</span>
              </th>
              <th scope="col" aria-sort={sort.key === 'title' ? sort.direction : 'none'} className="px-5 py-3.5">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'title'))} className="inline-flex items-center gap-1.5 text-stone-700 hover:text-black cursor-pointer">
                  Document {renderSortIcon('title')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'author' ? sort.direction : 'none'} className="px-5 py-3.5">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'author'))} className="inline-flex items-center gap-1.5 text-stone-700 hover:text-black cursor-pointer">
                  Author {renderSortIcon('author')}
                </button>
              </th>
              <th scope="col" className="px-5 py-3.5">Classification</th>
              <th scope="col" aria-sort={sort.key === 'status' ? sort.direction : 'none'} className="px-5 py-3.5">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'status'))} className="inline-flex items-center gap-1.5 text-stone-700 hover:text-black cursor-pointer">
                  Sign-off {renderSortIcon('status')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'updated' ? sort.direction : 'none'} className="px-5 py-3.5 text-right">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'updated'))} className="inline-flex items-center justify-end gap-1.5 text-stone-700 hover:text-black cursor-pointer">
                  Updated {renderSortIcon('updated')}
                </button>
              </th>
              <th scope="col" className="w-14 px-4 py-3.5">
                <span className="sr-only">Menu</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {sorted.map((doc) => {
              const isOpen = expandedIds.includes(doc.id);
              return (
                <Fragment key={doc.id}>
                  <tr className="hover:bg-stone-50/70">
                    <td className="px-4 py-4.5">
                      <button
                        type="button"
                        aria-expanded={isOpen}
                        aria-label={`Expand ${doc.title}`}
                        onClick={() => toggleExpand(doc.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 cursor-pointer"
                      >
                        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-5 py-4.5">
                      <div className="font-semibold text-stone-900">{doc.title}</div>
                      <div className="font-mono text-xs text-stone-400 mt-0.5">{doc.version}</div>
                    </td>
                    <td className="px-5 py-4.5 text-stone-700">{doc.author}</td>
                    <td className="px-5 py-4.5 text-xs font-medium text-stone-600">{doc.classification}</td>
                    <td className="px-5 py-4.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          doc.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : doc.status === 'In Review'
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-5 py-4.5 text-right font-mono text-xs text-stone-500 tabular-nums">{doc.updated}</td>
                    <td className="px-4 py-4.5 text-right relative">
                      <button
                        type="button"
                        aria-label={`Document actions for ${doc.title}`}
                        aria-expanded={menuId === doc.id}
                        onClick={() => setMenuId((p) => (p === doc.id ? null : doc.id))}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 cursor-pointer"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {menuId === doc.id && (
                        <div role="menu" className="absolute right-4 top-12 z-20 w-40 rounded-lg border border-stone-200 bg-white py-1 shadow-lg text-left text-xs">
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => updateStatus(doc.id, 'Approved')}
                            className="flex w-full items-center gap-2 px-3 py-2 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Approve Document
                          </button>
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => updateStatus(doc.id, 'Archived')}
                            className="flex w-full items-center gap-2 px-3 py-2 text-stone-600 hover:bg-stone-50 cursor-pointer"
                          >
                            <Archive className="h-3.5 w-3.5" /> Archive
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                  {isOpen && (
                    <tr className="bg-stone-50/70">
                      <td colSpan={7} className="px-14 py-4 text-xs text-stone-600 leading-relaxed border-t border-stone-100">
                        <p>{doc.abstract}</p>
                        <p className="mt-2 font-mono text-[11px] text-stone-400">Digest: {doc.checksum}</p>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
