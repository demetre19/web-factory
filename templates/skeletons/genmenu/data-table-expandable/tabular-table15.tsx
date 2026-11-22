import { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, MoreHorizontal, Shield, UserCheck, UserMinus } from 'lucide-react';
import { nextSortConfig, SortConfig, sortRecords } from '../../utils/tableLogic';

interface AccountUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: 'Admin' | 'Member' | 'Billing';
  lastActive: string;
  status: 'Active' | 'Deactivated';
}

const INITIAL_USERS: AccountUser[] = [
  { id: 'au1', name: 'Henrik Lindholm', email: 'henrik@krono.se', initials: 'HL', role: 'Admin', lastActive: 'Just now', status: 'Active' },
  { id: 'au2', name: 'Camille Laurent', email: 'camille@krono.se', initials: 'CL', role: 'Billing', lastActive: '14m ago', status: 'Active' },
  { id: 'au3', name: 'Mateo Silva', email: 'mateo@krono.se', initials: 'MS', role: 'Member', lastActive: '2h ago', status: 'Active' },
  { id: 'au4', name: 'Nora Lindqvist', email: 'nora@krono.se', initials: 'NL', role: 'Member', lastActive: '9d ago', status: 'Deactivated' },
];

export function Table15() {
  const [users, setUsers] = useState<AccountUser[]>(INITIAL_USERS);
  const [sort, setSort] = useState<SortConfig<keyof AccountUser & string>>({ key: 'name', direction: 'ascending' });
  const [openId, setOpenId] = useState<string | null>(null);

  const sorted = sortRecords(users, sort);

  const renderSortIcon = (key: keyof AccountUser & string) => {
    if (sort.key !== key || sort.direction === 'none') return <ArrowUpDown className="h-3.5 w-3.5 text-stone-400" />;
    return sort.direction === 'ascending' ? <ArrowUp className="h-3.5 w-3.5 text-stone-900" /> : <ArrowDown className="h-3.5 w-3.5 text-stone-900" />;
  };

  const mutateUser = (id: string, patch: Partial<AccountUser>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
    setOpenId(null);
  };

  return (
    <div className="rounded-xl border border-stone-200 bg-white overflow-visible">
      <div className="px-5 py-4 border-b border-stone-200">
        <h3 className="text-sm font-semibold text-stone-900">Organization Seat Management</h3>
        <p className="text-xs text-stone-500 mt-0.5">Warm minimal user table · Interactive row action menus</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-stone-200 bg-stone-50 text-xs font-medium text-stone-500">
              <th scope="col" aria-sort={sort.key === 'name' ? sort.direction : 'none'} className="px-5 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'name'))} className="inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-950 cursor-pointer">
                  User {renderSortIcon('name')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'role' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'role'))} className="inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-950 cursor-pointer">
                  Role {renderSortIcon('role')}
                </button>
              </th>
              <th scope="col" className="px-4 py-3">Last Active</th>
              <th scope="col" aria-sort={sort.key === 'status' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'status'))} className="inline-flex items-center gap-1.5 text-stone-700 hover:text-stone-950 cursor-pointer">
                  Status {renderSortIcon('status')}
                </button>
              </th>
              <th scope="col" className="w-14 px-4 py-3 text-right">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {sorted.map((user) => (
              <tr key={user.id} className="hover:bg-stone-50/70">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-medium text-white">
                      {user.initials}
                    </span>
                    <div>
                      <div className="font-medium text-stone-900">{user.name}</div>
                      <div className="text-xs text-stone-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-xs font-medium text-stone-700">{user.role}</td>
                <td className="px-4 py-3.5 font-mono text-xs text-stone-500">{user.lastActive}</td>
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-right relative">
                  <button
                    type="button"
                    aria-label={`Manage ${user.name}`}
                    aria-expanded={openId === user.id}
                    onClick={() => setOpenId((p) => (p === user.id ? null : user.id))}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-900 cursor-pointer"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {openId === user.id && (
                    <div role="menu" className="absolute right-4 top-11 z-20 w-44 rounded-lg border border-stone-200 bg-white py-1 shadow-lg text-left text-xs">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => mutateUser(user.id, { role: 'Admin' })}
                        className="flex w-full items-center gap-2 px-3 py-2 text-stone-700 hover:bg-stone-50 cursor-pointer"
                      >
                        <Shield className="h-3.5 w-3.5 text-stone-500" /> Promote to Admin
                      </button>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => mutateUser(user.id, { status: user.status === 'Active' ? 'Deactivated' : 'Active' })}
                        className="flex w-full items-center gap-2 px-3 py-2 text-stone-700 hover:bg-stone-50 cursor-pointer"
                      >
                        {user.status === 'Active' ? (
                          <>
                            <UserMinus className="h-3.5 w-3.5 text-rose-600" /> Deactivate Seat
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-3.5 w-3.5 text-emerald-600" /> Reactivate Seat
                          </>
                        )}
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
