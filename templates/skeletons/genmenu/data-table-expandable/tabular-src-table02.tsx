import { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, KeyRound, MoreHorizontal, ShieldAlert, UserCog } from 'lucide-react';
import { nextSortConfig, SortConfig, sortRecords } from '../../utils/tableLogic';

interface DarkMember {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: 'Platform Admin' | 'Security Lead' | 'Developer' | 'Auditor';
  mfa: 'Hardware Key' | 'Authenticator' | 'Unenrolled';
  status: 'Verified' | 'Review' | 'Locked';
  lastLogin: string;
}

const INITIAL_DATA: DarkMember[] = [
  { id: 'd1', name: 'Devon Brooks', email: 'devon@latticecloud.dev', initials: 'DB', role: 'Platform Admin', mfa: 'Hardware Key', status: 'Verified', lastLogin: '12m ago' },
  { id: 'd2', name: 'Sora Takahashi', email: 'sora.t@latticecloud.dev', initials: 'ST', role: 'Security Lead', mfa: 'Hardware Key', status: 'Verified', lastLogin: '1h ago' },
  { id: 'd3', name: 'Nadia Al-Mansoor', email: 'nadia@latticecloud.dev', initials: 'NA', role: 'Developer', mfa: 'Authenticator', status: 'Verified', lastLogin: '3h ago' },
  { id: 'd4', name: 'Liam Gallagher', email: 'liam.g@latticecloud.dev', initials: 'LG', role: 'Developer', mfa: 'Unenrolled', status: 'Review', lastLogin: '2d ago' },
  { id: 'd5', name: 'Hannah Kowalski', email: 'hannah@latticecloud.dev', initials: 'HK', role: 'Auditor', mfa: 'Authenticator', status: 'Locked', lastLogin: '19d ago' },
];

const DARK_PILL: Record<DarkMember['status'], string> = {
  Verified: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-inset ring-emerald-500/30',
  Review: 'bg-amber-500/15 text-amber-300 ring-1 ring-inset ring-amber-500/30',
  Locked: 'bg-rose-500/15 text-rose-300 ring-1 ring-inset ring-rose-500/30',
};

export function Table2() {
  const [rows, setRows] = useState<DarkMember[]>(INITIAL_DATA);
  const [sort, setSort] = useState<SortConfig<keyof DarkMember & string>>({ key: 'name', direction: 'none' });
  const [statusFilter, setStatusFilter] = useState<'All' | DarkMember['status']>('All');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filtered = statusFilter === 'All' ? rows : rows.filter((r) => r.status === statusFilter);
  const sorted = sortRecords(filtered, sort);

  const renderSortIcon = (key: keyof DarkMember & string) => {
    if (sort.key !== key || sort.direction === 'none') return <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />;
    return sort.direction === 'ascending' ? <ArrowUp className="h-3.5 w-3.5 text-sky-400" /> : <ArrowDown className="h-3.5 w-3.5 text-sky-400" />;
  };

  const updateMember = (id: string, patch: Partial<DarkMember>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setOpenMenuId(null);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950 text-slate-100 overflow-visible">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-slate-50">IAM Identity Roster</h3>
          <p className="text-xs text-slate-400 mt-0.5">Dark console theme · Status filter & row action menu</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg bg-slate-900 p-1 border border-slate-800">
          {(['All', 'Verified', 'Review', 'Locked'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                statusFilter === tab ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/70 text-xs font-medium text-slate-400">
              <th scope="col" aria-sort={sort.key === 'name' ? sort.direction : 'none'} className="px-5 py-3">
                <button
                  type="button"
                  onClick={() => setSort((p) => nextSortConfig(p, 'name'))}
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white cursor-pointer"
                >
                  Identity {renderSortIcon('name')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'role' ? sort.direction : 'none'} className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setSort((p) => nextSortConfig(p, 'role'))}
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white cursor-pointer"
                >
                  Role {renderSortIcon('role')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'mfa' ? sort.direction : 'none'} className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setSort((p) => nextSortConfig(p, 'mfa'))}
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white cursor-pointer"
                >
                  MFA Factor {renderSortIcon('mfa')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'status' ? sort.direction : 'none'} className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => setSort((p) => nextSortConfig(p, 'status'))}
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white cursor-pointer"
                >
                  Posture {renderSortIcon('status')}
                </button>
              </th>
              <th scope="col" className="px-4 py-3 text-right">Last Auth</th>
              <th scope="col" className="w-14 px-4 py-3 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {sorted.map((row) => (
              <tr key={row.id} className="hover:bg-slate-900/60 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-800 border border-slate-700 text-xs font-semibold text-sky-300">
                      {row.initials}
                    </span>
                    <div className="min-w-0">
                      <div className="font-medium text-slate-100">{row.name}</div>
                      <div className="text-xs text-slate-400 font-mono">{row.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-xs font-medium text-slate-300">{row.role}</td>
                <td className="px-4 py-3.5 text-xs text-slate-300">
                  <span className="inline-flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5 text-slate-500" />
                    {row.mfa}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${DARK_PILL[row.status]}`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right font-mono text-xs text-slate-400 tabular-nums">{row.lastLogin}</td>
                <td className="px-4 py-3.5 text-right relative">
                  <button
                    type="button"
                    aria-label={`Actions for ${row.name}`}
                    aria-expanded={openMenuId === row.id}
                    onClick={() => setOpenMenuId((prev) => (prev === row.id ? null : row.id))}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {openMenuId === row.id && (
                    <div
                      role="menu"
                      className="absolute right-4 top-11 z-20 w-44 rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-xl text-left text-xs"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => updateMember(row.id, { status: 'Verified', mfa: 'Hardware Key' })}
                        className="flex w-full items-center gap-2 px-3 py-2 text-slate-200 hover:bg-slate-800 cursor-pointer"
                      >
                        <UserCog className="h-3.5 w-3.5 text-sky-400" /> Verify & Issue Key
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => updateMember(row.id, { status: row.status === 'Locked' ? 'Review' : 'Locked' })}
                        className="flex w-full items-center gap-2 px-3 py-2 text-rose-300 hover:bg-slate-800 cursor-pointer"
                      >
                        <ShieldAlert className="h-3.5 w-3.5" /> {row.status === 'Locked' ? 'Unlock Account' : 'Lock Account'}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
