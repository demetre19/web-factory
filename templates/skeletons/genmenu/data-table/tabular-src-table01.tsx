import { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Mail, ShieldCheck, Trash2, UserCheck, UserX } from 'lucide-react';
import { nextSortConfig, SortConfig, sortRecords, toggleAllSelection, toggleSelection } from '../../utils/tableLogic';

interface Member {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarTone: string;
  role: 'Owner' | 'Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Invited' | 'Suspended';
  joined: string;
}

const INITIAL_MEMBERS: Member[] = [
  { id: 'm1', name: 'Clara Lindqvist', email: 'clara.lindqvist@nordic.io', initials: 'CL', avatarTone: 'bg-sky-100 text-sky-700', role: 'Owner', status: 'Active', joined: '2024-03-14' },
  { id: 'm2', name: 'Marcus Vance', email: 'm.vance@nordic.io', initials: 'MV', avatarTone: 'bg-amber-100 text-amber-800', role: 'Admin', status: 'Active', joined: '2024-07-02' },
  { id: 'm3', name: 'Priya Natarajan', email: 'priya.n@nordic.io', initials: 'PN', avatarTone: 'bg-emerald-100 text-emerald-800', role: 'Editor', status: 'Active', joined: '2025-01-19' },
  { id: 'm4', name: 'Jonas Meyer', email: 'jonas.meyer@nordic.io', initials: 'JM', avatarTone: 'bg-violet-100 text-violet-700', role: 'Editor', status: 'Invited', joined: '2026-10-28' },
  { id: 'm5', name: 'Elena Rostova', email: 'elena.r@nordic.io', initials: 'ER', avatarTone: 'bg-rose-100 text-rose-700', role: 'Viewer', status: 'Suspended', joined: '2025-06-09' },
  { id: 'm6', name: 'David Okafor', email: 'david.okafor@nordic.io', initials: 'DO', avatarTone: 'bg-zinc-200 text-zinc-800', role: 'Admin', status: 'Active', joined: '2025-11-12' },
];

const STATUS_PILL: Record<Member['status'], string> = {
  Active: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
  Invited: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20',
  Suspended: 'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20',
};

export function Table1() {
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [sort, setSort] = useState<SortConfig<keyof Member & string>>({ key: 'name', direction: 'ascending' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const sorted = sortRecords(members, sort);
  const allChecked = sorted.length > 0 && sorted.every((m) => selectedIds.includes(m.id));

  const renderSortIcon = (key: keyof Member & string) => {
    if (sort.key !== key || sort.direction === 'none') return <ArrowUpDown className="h-3.5 w-3.5 text-zinc-400" />;
    return sort.direction === 'ascending' ? <ArrowUp className="h-3.5 w-3.5 text-zinc-900" /> : <ArrowDown className="h-3.5 w-3.5 text-zinc-900" />;
  };

  const applyBulkStatus = (status: Member['status']) => {
    setMembers((prev) => prev.map((m) => (selectedIds.includes(m.id) ? { ...m, status } : m)));
    setSelectedIds([]);
  };

  const removeSelected = () => {
    setMembers((prev) => prev.filter((m) => !selectedIds.includes(m.id)));
    setSelectedIds([]);
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-zinc-100">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">Workspace Members</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{members.length} team accounts · Minimal light directory</p>
        </div>
        {selectedIds.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 bg-zinc-900 text-white px-3 py-1.5 rounded-lg text-xs">
            <span className="font-medium tabular-nums">{selectedIds.length} selected</span>
            <span className="text-zinc-500">|</span>
            <button
              type="button"
              onClick={() => applyBulkStatus('Active')}
              className="inline-flex items-center gap-1 hover:text-emerald-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              <UserCheck className="h-3.5 w-3.5" /> Activate
            </button>
            <button
              type="button"
              onClick={() => applyBulkStatus('Suspended')}
              className="inline-flex items-center gap-1 hover:text-amber-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              <UserX className="h-3.5 w-3.5" /> Suspend
            </button>
            <button
              type="button"
              onClick={removeSelected}
              className="inline-flex items-center gap-1 hover:text-rose-300 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
        ) : (
          <span className="text-xs text-zinc-400">Select rows for bulk actions</span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/70 text-xs font-medium text-zinc-500">
              <th scope="col" className="w-11 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all members"
                  checked={allChecked}
                  onChange={() => setSelectedIds((prev) => toggleAllSelection(prev, sorted.map((m) => m.id)))}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                />
              </th>
              <th scope="col" aria-sort={sort.key === 'name' ? sort.direction : 'none'} className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setSort((prev) => nextSortConfig(prev, 'name'))}
                  className="inline-flex items-center gap-1.5 font-medium text-zinc-700 hover:text-zinc-950 cursor-pointer"
                >
                  Member {renderSortIcon('name')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'role' ? sort.direction : 'none'} className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setSort((prev) => nextSortConfig(prev, 'role'))}
                  className="inline-flex items-center gap-1.5 font-medium text-zinc-700 hover:text-zinc-950 cursor-pointer"
                >
                  Role {renderSortIcon('role')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'status' ? sort.direction : 'none'} className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setSort((prev) => nextSortConfig(prev, 'status'))}
                  className="inline-flex items-center gap-1.5 font-medium text-zinc-700 hover:text-zinc-950 cursor-pointer"
                >
                  Status {renderSortIcon('status')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'joined' ? sort.direction : 'none'} className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => setSort((prev) => nextSortConfig(prev, 'joined'))}
                  className="inline-flex items-center justify-end gap-1.5 font-medium text-zinc-700 hover:text-zinc-950 cursor-pointer"
                >
                  Joined {renderSortIcon('joined')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {sorted.map((member) => {
              const checked = selectedIds.includes(member.id);
              return (
                <tr
                  key={member.id}
                  className={`transition-colors ${checked ? 'bg-zinc-50' : 'hover:bg-zinc-50/60'}`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${member.name}`}
                      checked={checked}
                      onChange={() => setSelectedIds((prev) => toggleSelection(prev, member.id))}
                      className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${member.avatarTone}`}>
                        {member.initials}
                      </span>
                      <div className="min-w-0">
                        <div className="font-medium text-zinc-900 truncate">{member.name}</div>
                        <div className="flex items-center gap-1 text-xs text-zinc-500 truncate">
                          <Mail className="h-3 w-3 shrink-0 text-zinc-400" />
                          <span className="truncate">{member.email}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-700">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700">
                      <ShieldCheck className="h-3.5 w-3.5 text-zinc-400" />
                      {member.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_PILL[member.status]}`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-zinc-500 tabular-nums">
                    {member.joined}
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
