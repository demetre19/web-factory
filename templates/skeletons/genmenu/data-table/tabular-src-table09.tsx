import { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Search } from 'lucide-react';
import { nextSortConfig, SortConfig, sortRecords, toggleAllSelection, toggleSelection } from '../../utils/tableLogic';

interface DirectoryPerson {
  id: string;
  name: string;
  email: string;
  initials: string;
  department: string;
  role: string;
  status: 'Active' | 'On Leave' | 'Contract';
}

const DIRECTORY: DirectoryPerson[] = [
  { id: 'p1', name: 'Ava Martinez', email: 'ava.martinez@verve.co', initials: 'AM', department: 'Engineering', role: 'Staff Engineer', status: 'Active' },
  { id: 'p2', name: 'Noah Bennett', email: 'noah.bennett@verve.co', initials: 'NB', department: 'Design', role: 'Principal Designer', status: 'Active' },
  { id: 'p3', name: 'Mei-Ling Zhou', email: 'meiling@verve.co', initials: 'MZ', department: 'Finance', role: 'Controller', status: 'On Leave' },
  { id: 'p4', name: 'Tariq Hassan', email: 'tariq.h@verve.co', initials: 'TH', department: 'Security', role: 'AppSec Lead', status: 'Active' },
  { id: 'p5', name: 'Sofia Rossi', email: 'sofia.rossi@verve.co', initials: 'SR', department: 'Product', role: 'Product Advisor', status: 'Contract' },
];

type Density = 'compact' | 'standard' | 'roomy';

const DENSITY_CELL: Record<Density, string> = {
  compact: 'py-1.5 px-3 text-xs',
  standard: 'py-3 px-4 text-sm',
  roomy: 'py-4.5 px-5 text-sm',
};

const PILL_STYLES: Record<DirectoryPerson['status'], string> = {
  Active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'On Leave': 'bg-amber-50 text-amber-800 border border-amber-200',
  Contract: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
};

export function Table9() {
  const [density, setDensity] = useState<Density>('compact');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortConfig<keyof DirectoryPerson & string>>({ key: 'name', direction: 'ascending' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = DIRECTORY.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.department.toLowerCase().includes(query.toLowerCase()) ||
      p.email.toLowerCase().includes(query.toLowerCase())
  );
  const sorted = sortRecords(filtered, sort);
  const allChecked = sorted.length > 0 && sorted.every((p) => selectedIds.includes(p.id));

  const renderSortIcon = (key: keyof DirectoryPerson & string) => {
    if (sort.key !== key || sort.direction === 'none') return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />;
    return sort.direction === 'ascending' ? <ArrowUp className="h-3.5 w-3.5 text-indigo-600" /> : <ArrowDown className="h-3.5 w-3.5 text-indigo-600" />;
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-200">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Employee Directory — Density Switcher</h3>
          <p className="text-xs text-slate-500 mt-0.5">Compact vs Standard vs Roomy density · Live search & selection</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              aria-label="Filter employees"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or dept..."
              className="h-8 rounded-lg border border-slate-200 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5" role="group" aria-label="Row density">
            {(['compact', 'standard', 'roomy'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setDensity(mode)}
                className={`px-2.5 py-1 text-xs font-medium capitalize rounded-md transition-colors cursor-pointer ${
                  density === mode ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-indigo-50 px-5 py-2 border-b border-indigo-100 text-xs text-indigo-900">
          <span className="font-medium tabular-nums">{selectedIds.length} employees selected</span>
          <button type="button" onClick={() => setSelectedIds([])} className="font-medium text-indigo-700 hover:underline cursor-pointer">
            Clear selection
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
              <th scope="col" className="w-11 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all directory rows"
                  checked={allChecked}
                  onChange={() => setSelectedIds((p) => toggleAllSelection(p, sorted.map((r) => r.id)))}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
                />
              </th>
              <th scope="col" aria-sort={sort.key === 'name' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'name'))} className="inline-flex items-center gap-1.5 hover:text-indigo-700 cursor-pointer">
                  Employee {renderSortIcon('name')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'department' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'department'))} className="inline-flex items-center gap-1.5 hover:text-indigo-700 cursor-pointer">
                  Department {renderSortIcon('department')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'role' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'role'))} className="inline-flex items-center gap-1.5 hover:text-indigo-700 cursor-pointer">
                  Role {renderSortIcon('role')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'status' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'status'))} className="inline-flex items-center gap-1.5 hover:text-indigo-700 cursor-pointer">
                  Status {renderSortIcon('status')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((person) => {
              const checked = selectedIds.includes(person.id);
              return (
                <tr key={person.id} className={checked ? 'bg-indigo-50/40' : 'hover:bg-slate-50'}>
                  <td className={DENSITY_CELL[density]}>
                    <input
                      type="checkbox"
                      aria-label={`Select ${person.name}`}
                      checked={checked}
                      onChange={() => setSelectedIds((p) => toggleSelection(p, person.id))}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 cursor-pointer"
                    />
                  </td>
                  <td className={DENSITY_CELL[density]}>
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-semibold text-indigo-800">
                        {person.initials}
                      </span>
                      <div>
                        <div className="font-medium text-slate-900 leading-tight">{person.name}</div>
                        <div className="text-xs text-slate-500">{person.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className={`${DENSITY_CELL[density]} text-slate-700`}>{person.department}</td>
                  <td className={`${DENSITY_CELL[density]} text-slate-600`}>{person.role}</td>
                  <td className={DENSITY_CELL[density]}>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PILL_STYLES[person.status]}`}>
                      {person.status}
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
