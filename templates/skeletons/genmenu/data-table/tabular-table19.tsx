import { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Check, Minus } from 'lucide-react';
import { nextSortConfig, SortConfig, sortRecords, toggleAllSelection, toggleSelection } from '../../utils/tableLogic';

interface MatrixMember {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  sso: boolean;
  twoFactor: boolean;
  status: 'Active' | 'Pending';
}

const MATRIX_USERS: MatrixMember[] = [
  { id: 'mm1', name: 'Eleanor Vance', email: 'eleanor@mono.dev', initials: 'EV', role: 'Admin', sso: true, twoFactor: true, status: 'Active' },
  { id: 'mm2', name: 'Theo Bergstrom', email: 'theo@mono.dev', initials: 'TB', role: 'Editor', sso: true, twoFactor: true, status: 'Active' },
  { id: 'mm3', name: 'Maya Lin', email: 'maya@mono.dev', initials: 'ML', role: 'Editor', sso: false, twoFactor: true, status: 'Active' },
  { id: 'mm4', name: 'Julian Cho', email: 'julian@mono.dev', initials: 'JC', role: 'Viewer', sso: true, twoFactor: false, status: 'Pending' },
  { id: 'mm5', name: 'Clara Moreau', email: 'clara@mono.dev', initials: 'CM', role: 'Admin', sso: true, twoFactor: true, status: 'Active' },
  { id: 'mm6', name: 'Rohan Patel', email: 'rohan@mono.dev', initials: 'RP', role: 'Viewer', sso: false, twoFactor: false, status: 'Pending' },
  { id: 'mm7', name: 'Ingrid Solberg', email: 'ingrid@mono.dev', initials: 'IS', role: 'Editor', sso: true, twoFactor: true, status: 'Active' },
];

export function Table19() {
  const [roleFilter, setRoleFilter] = useState<'All' | MatrixMember['role']>('All');
  const [sort, setSort] = useState<SortConfig<keyof MatrixMember & string>>({ key: 'name', direction: 'ascending' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = roleFilter === 'All' ? MATRIX_USERS : MATRIX_USERS.filter((u) => u.role === roleFilter);
  const sorted = sortRecords(filtered, sort);
  const allChecked = sorted.length > 0 && sorted.every((u) => selectedIds.includes(u.id));

  const renderSortIcon = (key: keyof MatrixMember & string) => {
    if (sort.key !== key || sort.direction === 'none') return <ArrowUpDown className="h-3 w-3 text-zinc-400" />;
    return sort.direction === 'ascending' ? <ArrowUp className="h-3 w-3 text-black" /> : <ArrowDown className="h-3 w-3 text-black" />;
  };

  return (
    <div className="rounded-xl border border-zinc-300 bg-white overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-zinc-200">
        <div>
          <h3 className="text-sm font-semibold text-zinc-950">Monochrome Access Matrix</h3>
          <p className="text-xs text-zinc-500">Compact minimal · Sticky header & role filter tabs</p>
        </div>
        <div className="flex items-center gap-1 border border-zinc-200 rounded-md p-0.5 bg-zinc-50">
          {(['All', 'Admin', 'Editor', 'Viewer'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer transition-colors ${
                roleFilter === r ? 'bg-zinc-950 text-white' : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-60 overflow-y-auto overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 bg-zinc-100 border-b border-zinc-200 text-zinc-600">
            <tr>
              <th scope="col" className="w-10 px-3 py-2.5">
                <input
                  type="checkbox"
                  aria-label="Select all filtered members"
                  checked={allChecked}
                  onChange={() => setSelectedIds((p) => toggleAllSelection(p, sorted.map((u) => u.id)))}
                  className="h-3.5 w-3.5 rounded border-zinc-400 text-zinc-950 cursor-pointer"
                />
              </th>
              <th scope="col" aria-sort={sort.key === 'name' ? sort.direction : 'none'} className="px-3 py-2.5">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'name'))} className="inline-flex items-center gap-1 font-semibold text-zinc-800 hover:text-black cursor-pointer">
                  Member {renderSortIcon('name')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'role' ? sort.direction : 'none'} className="px-3 py-2.5">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'role'))} className="inline-flex items-center gap-1 font-semibold text-zinc-800 hover:text-black cursor-pointer">
                  Role {renderSortIcon('role')}
                </button>
              </th>
              <th scope="col" className="px-3 py-2.5 text-center">SSO</th>
              <th scope="col" className="px-3 py-2.5 text-center">2FA</th>
              <th scope="col" aria-sort={sort.key === 'status' ? sort.direction : 'none'} className="px-4 py-2.5 text-right">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'status'))} className="inline-flex items-center justify-end gap-1 font-semibold text-zinc-800 hover:text-black cursor-pointer">
                  State {renderSortIcon('status')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/70">
            {sorted.map((user) => {
              const checked = selectedIds.includes(user.id);
              return (
                <tr key={user.id} className={checked ? 'bg-zinc-100' : 'hover:bg-zinc-50'}>
                  <td className="px-3 py-2">
                    <input
                      type="checkbox"
                      aria-label={`Select ${user.name}`}
                      checked={checked}
                      onChange={() => setSelectedIds((p) => toggleSelection(p, user.id))}
                      className="h-3.5 w-3.5 rounded border-zinc-400 text-zinc-950 cursor-pointer"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded bg-zinc-900 text-[10px] font-semibold text-white">
                        {user.initials}
                      </span>
                      <span className="font-medium text-zinc-900">{user.name}</span>
                      <span className="text-zinc-400 hidden sm:inline">{user.email}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 font-medium text-zinc-700">{user.role}</td>
                  <td className="px-3 py-2 text-center">
                    {user.sso ? <Check className="inline h-3.5 w-3.5 text-zinc-900" aria-label="Enabled" /> : <Minus className="inline h-3.5 w-3.5 text-zinc-300" aria-label="Disabled" />}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {user.twoFactor ? <Check className="inline h-3.5 w-3.5 text-zinc-900" aria-label="Enabled" /> : <Minus className="inline h-3.5 w-3.5 text-zinc-300" aria-label="Disabled" />}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        user.status === 'Active' ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-700'
                      }`}
                    >
                      {user.status}
                    </span>
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
