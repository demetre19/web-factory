import React, { useEffect, useId, useRef, useState } from 'react';

/* ------------------------------------------------------------------ */
/* Tiny inline icon helper (the only thing the components share)       */
/* ------------------------------------------------------------------ */
const Icon = ({ d, className = 'h-4 w-4', strokeWidth = 2 }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {[].concat(d).map((p, i) => (
      <path key={i} d={p} />
    ))}
  </svg>
);

const P = {
  up: 'm18 15-6-6-6 6',
  down: 'm6 9 6 6 6-6',
  left: 'm15 18-6-6 6-6',
  right: 'm9 18 6-6-6-6',
  first: ['m11 17-5-5 5-5', 'm18 17-5-5 5-5'],
  last: ['m13 17 5-5-5-5', 'm6 17 5-5-5-5'],
  sort: ['m7 15 5 5 5-5', 'm7 9 5-5 5 5'],
  check: 'M20 6 9 17l-5-5',
  x: ['M18 6 6 18', 'm6 6 12 12'],
  dots: ['M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z', 'M19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z', 'M5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z'],
  search: ['m21 21-4.3-4.3', 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z'],
  pencil: ['M12 20h9', 'M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z'],
  trash: ['M3 6h18', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6', 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'],
  home: ['m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z', 'M9 22V12h6v10'],
  info: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 16v-4', 'M12 8h.01'],
  alert: ['M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z', 'M12 9v4', 'M12 17h.01'],
  error: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'm15 9-6 6', 'm9 9 6 6'],
  success: ['M22 11.1V12a10 10 0 1 1-5.9-9.1', 'M22 4 12 14l-3-3'],
  upload: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm17 8-5-5-5 5', 'M12 3v12'],
  file: ['M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z', 'M14 2v6h6'],
  code: ['m16 18 6-6-6-6', 'm8 6-6 6 6 6'],
  eye: ['M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
  terminal: ['m4 17 6-6-6-6', 'M12 19h8'],
  list: ['M8 6h13', 'M8 12h13', 'M8 18h13', 'M3 6h.01', 'M3 12h.01', 'M3 18h.01'],
  bold: ['M6 4h8a4 4 0 0 1 0 8H6z', 'M6 12h9a4 4 0 0 1 0 8H6z'],
  italic: ['M19 4h-9', 'M14 20H5', 'M15 4 9 20'],
  link: ['M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7', 'M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7'],
  chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  clock: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z', 'M12 6v6l4 2'],
  tag: ['M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8z', 'M7 7h.01'],
  folder: 'M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.7-.9l-.8-1.2A2 2 0 0 0 7.9 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z',
  user: ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
};

/* ================================================================== */
/* 1. Data table — minimal, roomy: sortable headers, row actions,     */
/*    status pills, selected row                                       */
/* ================================================================== */
export function Element1() {
  const [rows, setRows] = useState([
    { id: 1, name: 'Ada Lovelace', email: 'ada@analytical.io', role: 'Admin', status: 'Active', seen: 2 },
    { id: 2, name: 'Grace Hopper', email: 'grace@cobol.dev', role: 'Editor', status: 'Invited', seen: 1440 },
    { id: 3, name: 'Alan Turing', email: 'alan@bletchley.uk', role: 'Viewer', status: 'Active', seen: 14 },
    { id: 4, name: 'Katherine Johnson', email: 'kj@orbit.space', role: 'Editor', status: 'Suspended', seen: 4320 },
    { id: 5, name: 'Linus Pauling', email: 'linus@chem.org', role: 'Viewer', status: 'Active', seen: 95 },
  ]);
  const [sort, setSort] = useState({ key: 'name', dir: 'asc' });
  const [selected, setSelected] = useState(3);

  const cols = [
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
    { key: 'seen', label: 'Last seen' },
  ];
  const pill = {
    Active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    Invited: 'bg-sky-50 text-sky-700 ring-sky-600/20',
    Suspended: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  };
  const ago = (m) => (m < 60 ? `${m}m ago` : m < 1440 ? `${Math.round(m / 60)}h ago` : `${Math.round(m / 1440)}d ago`);
  const sorted = [...rows].sort((a, b) => {
    const v = a[sort.key] > b[sort.key] ? 1 : a[sort.key] < b[sort.key] ? -1 : 0;
    return sort.dir === 'asc' ? v : -v;
  });
  const toggleSort = (key) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'asc' ? 'desc' : 'asc' }));

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="px-6 pb-2 pt-6 text-left">
          <span className="block text-base font-semibold text-slate-900">Team members</span>
          <span className="text-slate-500">Click a row to select it. Click a header to sort.</span>
        </caption>
        <thead className="border-b border-slate-200 text-slate-500">
          <tr>
            {cols.map((c) => {
              const active = sort.key === c.key;
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                  className="px-6 py-4 font-medium"
                >
                  <button
                    type="button"
                    onClick={() => toggleSort(c.key)}
                    className={`inline-flex items-center gap-1 rounded hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${active ? 'text-slate-900' : ''}`}
                  >
                    {c.label}
                    <Icon
                      d={active ? (sort.dir === 'asc' ? P.up : P.down) : P.sort}
                      className={`h-3.5 w-3.5 ${active ? '' : 'opacity-40'}`}
                    />
                  </button>
                </th>
              );
            })}
            <th scope="col" className="px-6 py-4 text-right font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sorted.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                No members left.{' '}
                <button className="font-medium text-slate-900 underline" onClick={() => window.location.reload()}>
                  Reload
                </button>
              </td>
            </tr>
          )}
          {sorted.map((r) => {
            const isSel = selected === r.id;
            return (
              <tr
                key={r.id}
                aria-selected={isSel}
                onClick={() => setSelected(r.id)}
                className={`cursor-pointer transition-colors ${isSel ? 'bg-slate-50 shadow-[inset_3px_0_0_0_theme(colors.slate.900)]' : 'hover:bg-slate-50/60'}`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                      {r.name.split(' ').map((n) => n[0]).join('')}
                    </span>
                    <div>
                      <div className="font-medium text-slate-900">{r.name}</div>
                      <div className="text-slate-500">{r.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-700">{r.role}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${pill[r.status]}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                    {r.status}
                  </span>
                </td>
                <td className="px-6 py-4 tabular-nums text-slate-500">{ago(r.seen)}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      aria-label={`Edit ${r.name}`}
                      onClick={(e) => { e.stopPropagation(); setSelected(r.id); }}
                      className="rounded-md p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <Icon d={P.pencil} />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${r.name}`}
                      onClick={(e) => { e.stopPropagation(); setRows((rs) => rs.filter((x) => x.id !== r.id)); }}
                      className="rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Icon d={P.trash} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ================================================================== */
/* 2. Data table — dark, compact: checkbox selection, bulk actions,   */
/*    row overflow menu                                                */
/* ================================================================== */
export function Element2() {
  const [data, setData] = useState([
    { id: 'INV-2041', customer: 'Northwind Traders', amount: 1240.5, status: 'Paid', due: 'Nov 02' },
    { id: 'INV-2042', customer: 'Globex Corp', amount: 860.0, status: 'Pending', due: 'Nov 14' },
    { id: 'INV-2043', customer: 'Initech', amount: 3120.75, status: 'Overdue', due: 'Oct 28' },
    { id: 'INV-2044', customer: 'Umbrella Ltd', amount: 412.2, status: 'Draft', due: '—' },
    { id: 'INV-2045', customer: 'Hooli', amount: 9875.0, status: 'Pending', due: 'Dec 01' },
    { id: 'INV-2046', customer: 'Stark Industries', amount: 15400.0, status: 'Paid', due: 'Oct 19' },
  ]);
  const [sel, setSel] = useState(() => new Set(['INV-2043']));
  const [menu, setMenu] = useState(null);
  const headRef = useRef(null);
  const all = sel.size === data.length;
  const some = sel.size > 0 && !all;

  useEffect(() => {
    if (headRef.current) headRef.current.indeterminate = some;
  }, [some]);

  const toggle = (id) =>
    setSel((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  const pill = {
    Paid: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20',
    Pending: 'bg-amber-400/10 text-amber-300 ring-amber-400/20',
    Overdue: 'bg-rose-400/10 text-rose-300 ring-rose-400/30',
    Draft: 'bg-zinc-400/10 text-zinc-400 ring-zinc-400/20',
  };
  const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  const markPaid = () => {
    setData((d) => d.map((r) => (sel.has(r.id) ? { ...r, status: 'Paid' } : r)));
    setSel(new Set());
  };

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300">
      <div className="flex h-11 items-center justify-between border-b border-zinc-800 px-3">
        {sel.size ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-white">{sel.size} selected</span>
            <span className="text-zinc-700">|</span>
            <button onClick={markPaid} className="rounded px-2 py-1 text-indigo-300 hover:bg-indigo-500/10">Mark paid</button>
            <button className="rounded px-2 py-1 hover:bg-zinc-800">Export</button>
            <button onClick={() => setSel(new Set())} className="rounded px-2 py-1 text-zinc-500 hover:bg-zinc-800">Clear</button>
          </div>
        ) : (
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Invoices</h3>
        )}
        <span className="text-[11px] text-zinc-500">{data.length} rows</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-xs">
          <thead className="text-left text-[11px] uppercase tracking-wider text-zinc-500">
            <tr className="border-b border-zinc-800">
              <th scope="col" className="w-8 py-2 pl-3">
                <input
                  ref={headRef}
                  type="checkbox"
                  aria-label="Select all invoices"
                  checked={all}
                  onChange={() => setSel(all ? new Set() : new Set(data.map((r) => r.id)))}
                  className="h-3.5 w-3.5 rounded border-zinc-600 bg-zinc-900 accent-indigo-500"
                />
              </th>
              <th scope="col" className="px-2 py-2 font-medium">Invoice</th>
              <th scope="col" className="px-2 py-2 font-medium">Customer</th>
              <th scope="col" className="px-2 py-2 text-right font-medium">Amount</th>
              <th scope="col" className="px-2 py-2 font-medium">Status</th>
              <th scope="col" className="px-2 py-2 font-medium">Due</th>
              <th scope="col" className="w-8 py-2 pr-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => {
              const on = sel.has(r.id);
              return (
                <tr key={r.id} aria-selected={on} className={`border-b border-zinc-900 last:border-0 ${on ? 'bg-indigo-500/10' : 'hover:bg-zinc-900'}`}>
                  <td className="py-1.5 pl-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${r.id}`}
                      checked={on}
                      onChange={() => toggle(r.id)}
                      className="h-3.5 w-3.5 accent-indigo-500"
                    />
                  </td>
                  <td className="px-2 py-1.5 font-mono text-zinc-100">{r.id}</td>
                  <td className="px-2 py-1.5">{r.customer}</td>
                  <td className="px-2 py-1.5 text-right font-mono tabular-nums text-zinc-100">{fmt(r.amount)}</td>
                  <td className="px-2 py-1.5">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${pill[r.status]}`}>{r.status}</span>
                  </td>
                  <td className="px-2 py-1.5 text-zinc-500">{r.due}</td>
                  <td className="relative py-1.5 pr-3">
                    <button
                      type="button"
                      aria-label={`Actions for ${r.id}`}
                      aria-haspopup="menu"
                      aria-expanded={menu === r.id}
                      onClick={() => setMenu(menu === r.id ? null : r.id)}
                      className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
                    >
                      <Icon d={P.dots} />
                    </button>
                    {menu === r.id && (
                      <ul role="menu" className="absolute right-3 top-8 z-10 w-32 rounded-md border border-zinc-800 bg-zinc-900 py-1 shadow-xl">
                        {['View', 'Download PDF', 'Void'].map((a) => (
                          <li key={a} role="none">
                            <button
                              role="menuitem"
                              onClick={() => setMenu(null)}
                              className={`block w-full px-3 py-1.5 text-left hover:bg-zinc-800 ${a === 'Void' ? 'text-rose-400' : ''}`}
                            >
                              {a}
                            </button>
                          </li>
                        ))}
                      </ul>
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

/* ================================================================== */
/* 3. Data table — colourful, roomy: filter + empty state             */
/* ================================================================== */
export function Element3() {
  const projects = [
    { name: 'Aurora redesign', owner: 'Mia Chen', progress: 72, status: 'On track' },
    { name: 'Billing v3', owner: 'Jonas Berg', progress: 41, status: 'At risk' },
    { name: 'Mobile onboarding', owner: 'Priya Rao', progress: 88, status: 'On track' },
    { name: 'Data warehouse', owner: 'Tom Okafor', progress: 15, status: 'Blocked' },
  ];
  const [q, setQ] = useState('quantum');
  const [status, setStatus] = useState('All');
  const filtered = projects.filter(
    (p) => (status === 'All' || p.status === status) && p.name.toLowerCase().includes(q.trim().toLowerCase())
  );
  const tone = {
    'On track': { pill: 'bg-emerald-100 text-emerald-800', bar: 'from-emerald-400 to-teal-500' },
    'At risk': { pill: 'bg-amber-100 text-amber-800', bar: 'from-amber-400 to-orange-500' },
    Blocked: { pill: 'bg-rose-100 text-rose-800', bar: 'from-rose-400 to-pink-500' },
  };

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-xl shadow-violet-200/50 ring-1 ring-violet-100">
      <div className="bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 p-6 text-white">
        <h3 className="text-lg font-bold">Projects</h3>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="relative flex-1 min-w-[180px]">
            <span className="sr-only">Filter projects</span>
            <Icon d={P.search} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by name…"
              className="w-full rounded-full border-0 bg-white/20 py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/80"
            />
          </label>
          <div role="group" aria-label="Status filter" className="flex gap-1 rounded-full bg-white/15 p-1">
            {['All', 'On track', 'At risk', 'Blocked'].map((s) => (
              <button
                key={s}
                aria-pressed={status === s}
                onClick={() => setStatus(s)}
                className={`rounded-full px-3 py-1 text-xs font-semibold transition ${status === s ? 'bg-white text-violet-700' : 'text-white/90 hover:bg-white/20'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-violet-50/60 text-left text-xs font-semibold uppercase tracking-wide text-violet-700">
            <tr>
              <th scope="col" className="px-6 py-3">Project</th>
              <th scope="col" className="px-6 py-3">Owner</th>
              <th scope="col" className="px-6 py-3">Progress</th>
              <th scope="col" className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-violet-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-14">
                  <div className="mx-auto flex max-w-xs flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className="h-16 w-16 rotate-6 rounded-2xl bg-gradient-to-br from-fuchsia-200 to-indigo-200" />
                      <div className="absolute inset-0 grid -rotate-6 place-items-center rounded-2xl bg-white shadow-md">
                        <Icon d={P.folder} className="h-7 w-7 text-violet-500" />
                      </div>
                    </div>
                    <p className="font-semibold text-slate-900">No projects match</p>
                    <p className="mt-1 text-slate-500">
                      Nothing found for “{q || '…'}”{status !== 'All' && ` in ${status}`}. Try a different search.
                    </p>
                    <button
                      onClick={() => { setQ(''); setStatus('All'); }}
                      className="mt-5 rounded-full bg-gradient-to-r from-fuchsia-500 to-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-violet-300 hover:brightness-110"
                    >
                      Clear filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.name} className="hover:bg-violet-50/40">
                  <td className="px-6 py-5 font-semibold text-slate-900">{p.name}</td>
                  <td className="px-6 py-5 text-slate-600">{p.owner}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={p.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${p.name} progress`}>
                        <div className={`h-full rounded-full bg-gradient-to-r ${tone[p.status].bar}`} style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className="tabular-nums text-slate-500">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${tone[p.status].pill}`}>{p.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================================================================== */
/* 4. Pagination — minimal, numbered with ellipsis                    */
/* ================================================================== */
export function Element4() {
  const total = 20;
  const [page, setPage] = useState(7);
  const keep = [...new Set([1, 2, page - 1, page, page + 1, total - 1, total])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
  const items = [];
  keep.forEach((p, i) => {
    if (i && p - keep[i - 1] > 1) items.push(`gap-${p}`);
    items.push(p);
  });
  const base = 'grid h-10 min-w-10 place-items-center rounded-lg px-3 text-sm';

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
      <button
        onClick={() => setPage((p) => p - 1)}
        disabled={page === 1}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40"
      >
        <Icon d={P.left} /> Previous
      </button>
      <ul className="flex items-center gap-1">
        {items.map((it) =>
          typeof it === 'string' ? (
            <li key={it} aria-hidden="true" className="px-2 text-slate-400">…</li>
          ) : (
            <li key={it}>
              <button
                onClick={() => setPage(it)}
                aria-current={it === page ? 'page' : undefined}
                aria-label={`Page ${it}`}
                className={`${base} ${it === page ? 'bg-slate-900 font-semibold text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {it}
              </button>
            </li>
          )
        )}
      </ul>
      <button
        onClick={() => setPage((p) => p + 1)}
        disabled={page === total}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40"
      >
        Next <Icon d={P.right} />
      </button>
    </nav>
  );
}

/* ================================================================== */
/* 5. Pagination — dark, prev/next with range + page size             */
/* ================================================================== */
export function Element5() {
  const total = 248;
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(3);
  const pages = Math.ceil(total / size);
  const start = (page - 1) * size + 1;
  const end = Math.min(page * size, total);
  const id = useId();

  return (
    <nav aria-label="Results pagination" className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-slate-900 px-5 py-4 text-sm text-slate-400 ring-1 ring-white/10">
      <p aria-live="polite">
        Showing <span className="font-semibold text-white">{start}</span>–<span className="font-semibold text-white">{end}</span> of{' '}
        <span className="font-semibold text-white">{total}</span> results
      </p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor={id}>Rows</label>
          <select
            id={id}
            value={size}
            onChange={(e) => { setSize(Number(e.target.value)); setPage(1); }}
            className="rounded-md border-0 bg-slate-800 py-1.5 pl-2 pr-7 text-white ring-1 ring-white/10 focus:ring-2 focus:ring-cyan-400"
          >
            {[10, 25, 50].map((n) => <option key={n}>{n}</option>)}
          </select>
        </div>
        <ul className="flex gap-2">
          <li>
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="inline-flex items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 font-medium text-white ring-1 ring-white/10 hover:bg-slate-700 disabled:opacity-30"
            >
              <Icon d={P.left} /> Prev
            </button>
          </li>
          <li>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === pages}
              className="inline-flex items-center gap-1.5 rounded-md bg-cyan-500 px-3 py-1.5 font-medium text-slate-950 hover:bg-cyan-400 disabled:opacity-30"
            >
              Next <Icon d={P.right} />
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

/* ================================================================== */
/* 6. Pagination — colourful, compact jump-to-page                    */
/* ================================================================== */
export function Element6() {
  const total = 12;
  const [page, setPage] = useState(4);
  const [draft, setDraft] = useState('4');
  const go = (p) => {
    const n = Math.min(total, Math.max(1, Number(p) || 1));
    setPage(n);
    setDraft(String(n));
  };
  const btn = 'grid h-7 w-7 place-items-center rounded-full text-white hover:bg-white/20 disabled:opacity-40 disabled:hover:bg-transparent';

  return (
    <nav aria-label="Pagination" className="inline-flex">
      <ul className="flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 p-1 text-xs shadow-lg shadow-orange-500/30">
        <li><button aria-label="First page" disabled={page === 1} onClick={() => go(1)} className={btn}><Icon d={P.first} className="h-3.5 w-3.5" /></button></li>
        <li><button aria-label="Previous page" disabled={page === 1} onClick={() => go(page - 1)} className={btn}><Icon d={P.left} className="h-3.5 w-3.5" /></button></li>
        <li className="flex items-center gap-1 px-2 font-semibold text-white">
          <label htmlFor="e6-page">Page</label>
          <input
            id="e6-page"
            inputMode="numeric"
            value={draft}
            onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
            onBlur={() => go(draft)}
            onKeyDown={(e) => e.key === 'Enter' && go(draft)}
            className="h-6 w-8 rounded-full bg-white text-center font-bold text-pink-600 focus:outline-none focus:ring-2 focus:ring-white/60"
          />
          <span>of {total}</span>
        </li>
        <li><button aria-label="Next page" disabled={page === total} onClick={() => go(page + 1)} className={btn}><Icon d={P.right} className="h-3.5 w-3.5" /></button></li>
        <li><button aria-label="Last page" disabled={page === total} onClick={() => go(total)} className={btn}><Icon d={P.last} className="h-3.5 w-3.5" /></button></li>
      </ul>
    </nav>
  );
}

/* ================================================================== */
/* 7. Stepper — minimal, horizontal, numbered with checkmarks         */
/* ================================================================== */
export function Element7() {
  const steps = [
    { title: 'Account', sub: 'Email & password' },
    { title: 'Profile', sub: 'Name & avatar' },
    { title: 'Billing', sub: 'Plan & payment' },
    { title: 'Review', sub: 'Confirm details' },
  ];
  const [current, setCurrent] = useState(1);
  const done = current >= steps.length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8">
      <nav aria-label="Signup progress">
        <ol className="flex items-center">
          {steps.map((s, i) => {
            const state = i < current ? 'complete' : i === current ? 'current' : 'upcoming';
            return (
              <li key={s.title} aria-current={state === 'current' ? 'step' : undefined} className={`flex items-center ${i < steps.length - 1 ? 'flex-1' : ''}`}>
                <div className="flex items-center gap-3">
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-semibold transition ${
                      state === 'complete'
                        ? 'bg-slate-900 text-white'
                        : state === 'current'
                          ? 'border-2 border-slate-900 text-slate-900'
                          : 'border border-slate-300 text-slate-400'
                    }`}
                  >
                    {state === 'complete' ? <Icon d={P.check} /> : i + 1}
                    <span className="sr-only"> ({state})</span>
                  </span>
                  <div className="hidden sm:block">
                    <div className={`text-sm font-medium ${state === 'upcoming' ? 'text-slate-400' : 'text-slate-900'}`}>{s.title}</div>
                    <div className="text-xs text-slate-500">{s.sub}</div>
                  </div>
                </div>
                {i < steps.length - 1 && (
                  <div aria-hidden="true" className={`mx-4 h-px flex-1 transition-colors ${i < current ? 'bg-slate-900' : 'bg-slate-200'}`} />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6">
        <p className="text-sm text-slate-500">
          {done ? 'All steps complete.' : `Step ${current + 1} of ${steps.length}: ${steps[current].title}`}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          >
            Back
          </button>
          <button
            onClick={() => (done ? setCurrent(0) : setCurrent((c) => c + 1))}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            {done ? 'Start over' : current === steps.length - 1 ? 'Finish' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* 8. Stepper — dark, vertical pipeline with descriptions             */
/* ================================================================== */
export function Element8() {
  const steps = [
    { title: 'Checkout', desc: 'Cloned main @ 4f2a9c1', time: '2s' },
    { title: 'Install dependencies', desc: '1,284 packages from lockfile', time: '41s' },
    { title: 'Run tests', desc: '312 tests across 48 suites', time: '1m 12s' },
    { title: 'Build image', desc: 'Multi-stage Docker build', time: '58s' },
    { title: 'Deploy to production', desc: 'Rolling update, 6 replicas', time: '—' },
  ];
  const [current, setCurrent] = useState(2);

  return (
    <div className="rounded-2xl bg-[#0b0f17] p-6 text-slate-300 ring-1 ring-white/10">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-semibold text-white">Deployment #1287</h3>
        <div className="flex gap-2 text-xs">
          <button onClick={() => setCurrent(0)} className="rounded-md px-2.5 py-1.5 text-slate-400 ring-1 ring-white/10 hover:bg-white/5">Reset</button>
          <button
            onClick={() => setCurrent((c) => Math.min(steps.length, c + 1))}
            disabled={current >= steps.length}
            className="rounded-md bg-violet-500 px-2.5 py-1.5 font-medium text-white hover:bg-violet-400 disabled:opacity-40"
          >
            Advance
          </button>
        </div>
      </div>
      <ol aria-label="Pipeline steps">
        {steps.map((s, i) => {
          const state = i < current ? 'complete' : i === current ? 'current' : 'upcoming';
          return (
            <li key={s.title} aria-current={state === 'current' ? 'step' : undefined} className="relative flex gap-4 pb-6 last:pb-0">
              {i < steps.length - 1 && (
                <span aria-hidden="true" className={`absolute left-[11px] top-7 h-[calc(100%-1.75rem)] w-0.5 ${i < current ? 'bg-emerald-500/60' : 'bg-white/10'}`} />
              )}
              <span className="relative z-10 mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full">
                {state === 'complete' && (
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-[#0b0f17]"><Icon d={P.check} className="h-3.5 w-3.5" strokeWidth={3} /></span>
                )}
                {state === 'current' && (
                  <span className="relative grid h-6 w-6 place-items-center rounded-full bg-violet-500/20 ring-2 ring-violet-400">
                    <span className="absolute h-6 w-6 animate-ping rounded-full bg-violet-400/30" />
                    <span className="h-2 w-2 rounded-full bg-violet-300" />
                  </span>
                )}
                {state === 'upcoming' && <span className="h-6 w-6 rounded-full border-2 border-white/15 bg-[#0b0f17]" />}
              </span>
              <div className="flex flex-1 items-start justify-between gap-4">
                <div>
                  <p className={`text-sm font-medium ${state === 'upcoming' ? 'text-slate-500' : 'text-white'}`}>{s.title}</p>
                  <p className="mt-0.5 text-sm text-slate-500">{state === 'current' ? 'In progress…' : s.desc}</p>
                </div>
                <span className="font-mono text-xs text-slate-500">{state === 'complete' ? s.time : state === 'current' ? 'running' : 'queued'}</span>
              </div>
            </li>
          );
        })}
      </ol>
      {current >= steps.length && (
        <p role="status" className="mt-6 rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300 ring-1 ring-emerald-500/20">Deployed successfully.</p>
      )}
    </div>
  );
}

/* ================================================================== */
/* 9. Progress — colourful ring + segmented bar + checklist           */
/* ================================================================== */
export function Element9() {
  const [tasks, setTasks] = useState([
    { id: 'photo', label: 'Upload a profile photo', done: true },
    { id: 'bio', label: 'Write a short bio', done: true },
    { id: 'team', label: 'Invite a teammate', done: false },
    { id: '2fa', label: 'Turn on two-factor auth', done: false },
    { id: 'slack', label: 'Connect Slack', done: false },
  ]);
  const doneCount = tasks.filter((t) => t.done).length;
  const pct = Math.round((doneCount / tasks.length) * 100);
  const r = 34;
  const c = 2 * Math.PI * r;
  const segColors = ['bg-rose-400', 'bg-orange-400', 'bg-amber-400', 'bg-lime-400', 'bg-emerald-400'];

  return (
    <div className="rounded-3xl bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-6 ring-1 ring-sky-100">
      <div className="flex items-center gap-5">
        <div className="relative h-20 w-20 shrink-0" role="progressbar" aria-label="Profile completeness" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
          <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90" aria-hidden="true">
            <defs>
              <linearGradient id="e9-grad" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
            <circle cx="40" cy="40" r={r} fill="none" stroke="#e0f2fe" strokeWidth="8" />
            <circle
              cx="40" cy="40" r={r} fill="none" stroke="url(#e9-grad)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c}
              style={{ transition: 'stroke-dashoffset 400ms ease' }}
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-lg font-extrabold text-slate-800">{pct}%</span>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-slate-900">Finish setting up</h3>
          <p className="text-sm text-slate-500">{doneCount} of {tasks.length} done — tick items to update.</p>
          <div className="mt-3 flex gap-1" aria-hidden="true">
            {tasks.map((t, i) => (
              <span key={t.id} className={`h-1.5 flex-1 rounded-full transition-colors ${i < doneCount ? segColors[i] : 'bg-slate-200'}`} />
            ))}
          </div>
        </div>
      </div>
      <ul className="mt-5 space-y-1.5">
        {tasks.map((t) => (
          <li key={t.id}>
            <label className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${t.done ? 'bg-emerald-100/60 text-emerald-900' : 'bg-white text-slate-700 shadow-sm hover:bg-sky-50'}`}>
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => setTasks((ts) => ts.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))}
                className="peer sr-only"
              />
              <span className={`grid h-5 w-5 place-items-center rounded-md border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-sky-400 ${t.done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300'}`}>
                {t.done && <Icon d={P.check} className="h-3 w-3" strokeWidth={3.5} />}
              </span>
              <span className={t.done ? 'line-through decoration-emerald-400' : ''}>{t.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ================================================================== */
/* 10. Tabs — minimal underline with arrow-key navigation             */
/* ================================================================== */
export function Element10() {
  const tabs = [
    { id: 'overview', label: 'Overview', body: 'High-level metrics for the last 30 days: 12.4k visitors, 3.1% conversion.' },
    { id: 'activity', label: 'Activity', body: '18 events today. Latest: “Invoice INV-2045 sent to Hooli”.' },
    { id: 'members', label: 'Members', body: '7 members across 3 roles. 2 invitations pending.' },
    { id: 'settings', label: 'Settings', body: 'Workspace name, region, and data retention preferences.' },
  ];
  const [active, setActive] = useState(0);
  const refs = useRef([]);
  const onKey = (e) => {
    const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!dir) return;
    const n = (active + dir + tabs.length) % tabs.length;
    setActive(n);
    refs.current[n]?.focus();
  };

  return (
    <div>
      <div role="tablist" aria-label="Workspace sections" onKeyDown={onKey} className="flex gap-8 border-b border-slate-200">
        {tabs.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => (refs.current[i] = el)}
            role="tab"
            id={`e10-tab-${t.id}`}
            aria-selected={active === i}
            aria-controls={`e10-panel-${t.id}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors focus:outline-none focus-visible:text-slate-900 ${
              active === i ? 'border-slate-900 text-slate-900' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div key={t.id} role="tabpanel" id={`e10-panel-${t.id}`} aria-labelledby={`e10-tab-${t.id}`} hidden={active !== i} tabIndex={0} className="py-5 text-sm leading-relaxed text-slate-600 focus:outline-none">
          {t.body}
        </div>
      ))}
    </div>
  );
}

/* ================================================================== */
/* 11. Tabs — colourful pills with counts                             */
/* ================================================================== */
export function Element11() {
  const tabs = [
    { id: 'all', label: 'All', count: 42, on: 'bg-slate-900 text-white', badge: 'bg-white/20' },
    { id: 'open', label: 'Open', count: 12, on: 'bg-emerald-500 text-white shadow-emerald-500/40', badge: 'bg-white/25' },
    { id: 'review', label: 'In review', count: 5, on: 'bg-amber-400 text-amber-950 shadow-amber-400/40', badge: 'bg-amber-950/15' },
    { id: 'merged', label: 'Merged', count: 25, on: 'bg-violet-500 text-white shadow-violet-500/40', badge: 'bg-white/25' },
  ];
  const [active, setActive] = useState('open');
  const cur = tabs.find((t) => t.id === active);

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div role="tablist" aria-label="Pull request filters" className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              id={`e11-${t.id}`}
              aria-selected={on}
              aria-controls="e11-panel"
              onClick={() => setActive(t.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${on ? `${t.on} shadow-lg` : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {t.label}
              <span className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${on ? t.badge : 'bg-white text-slate-500'}`}>{t.count}</span>
            </button>
          );
        })}
      </div>
      <div id="e11-panel" role="tabpanel" aria-labelledby={`e11-${active}`} className="mt-4 rounded-xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
        Showing <strong className="text-slate-900">{cur.count}</strong> {cur.label.toLowerCase()} pull requests
      </div>
    </div>
  );
}

/* ================================================================== */
/* 12. Tabs — dark, compact segmented with icons + badge              */
/* ================================================================== */
export function Element12() {
  const tabs = [
    { id: 'code', label: 'Code', icon: P.code, body: 'export default function App() {\n  return <Hello />;\n}' },
    { id: 'preview', label: 'Preview', icon: P.eye, body: '<Hello /> rendered at 1280×720' },
    { id: 'terminal', label: 'Terminal', icon: P.terminal, body: '$ npm run dev\n  ready on http://localhost:3000' },
    { id: 'logs', label: 'Logs', icon: P.list, badge: 3, body: 'warn  Unused variable “x” (App.jsx:4)\nwarn  Missing key prop (List.jsx:12)\nerror Failed to fetch /api/user' },
  ];
  const [active, setActive] = useState('code');
  const cur = tabs.find((t) => t.id === active);

  return (
    <div className="overflow-hidden rounded-lg bg-neutral-900 ring-1 ring-white/10">
      <div role="tablist" aria-label="Editor panes" className="flex gap-0.5 border-b border-white/10 bg-neutral-950 p-1">
        {tabs.map((t) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              role="tab"
              id={`e12-${t.id}`}
              aria-selected={on}
              aria-controls="e12-panel"
              onClick={() => setActive(t.id)}
              className={`relative inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition ${on ? 'bg-neutral-800 text-white shadow ring-1 ring-white/10' : 'text-neutral-500 hover:text-neutral-200'}`}
            >
              <Icon d={t.icon} className="h-3.5 w-3.5" />
              {t.label}
              {t.badge && (
                <span className="grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {t.badge}
                  <span className="sr-only"> new</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
      <pre id="e12-panel" role="tabpanel" aria-labelledby={`e12-${active}`} tabIndex={0} className="min-h-[88px] whitespace-pre-wrap p-3 font-mono text-xs leading-relaxed text-lime-300/90 focus:outline-none">
        {cur.body}
      </pre>
    </div>
  );
}

/* ================================================================== */
/* 13. Toast stack — minimal, roomy, auto-dismiss + manual dismiss    */
/* ================================================================== */
function Toast13({ toast, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [onClose]);
  const tone = {
    success: { icon: P.success, color: 'text-emerald-500', bar: 'bg-emerald-500' },
    warning: { icon: P.alert, color: 'text-amber-500', bar: 'bg-amber-500' },
    error: { icon: P.error, color: 'text-rose-500', bar: 'bg-rose-500' },
  }[toast.type];
  return (
    <li role={toast.type === 'error' ? 'alert' : 'status'} className="pointer-events-auto relative w-80 overflow-hidden rounded-xl bg-white p-4 shadow-lg ring-1 ring-slate-900/5">
      <div className="flex gap-3">
        <Icon d={tone.icon} className={`mt-0.5 h-5 w-5 shrink-0 ${tone.color}`} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
          <p className="mt-1 text-sm text-slate-500">{toast.body}</p>
        </div>
        <button onClick={onClose} aria-label="Dismiss notification" className="h-6 w-6 shrink-0 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600">
          <Icon d={P.x} className="mx-auto h-4 w-4" />
        </button>
      </div>
      <span className={`absolute bottom-0 left-0 h-0.5 w-full origin-left ${tone.bar}`} style={{ animation: 'e13-shrink 6s linear forwards' }} aria-hidden="true" />
    </li>
  );
}

export function Element13() {
  const presets = {
    success: { title: 'Changes saved', body: 'Your profile was updated successfully.' },
    warning: { title: 'Storage almost full', body: 'You have used 92% of your 10 GB plan.' },
    error: { title: 'Upload failed', body: 'report-q4.pdf exceeds the 25 MB limit.' },
  };
  const [toasts, setToasts] = useState([
    { id: 1, type: 'success', ...presets.success },
    { id: 2, type: 'warning', ...presets.warning },
  ]);
  const nextId = useRef(3);
  const push = (type) => setToasts((t) => [...t, { id: nextId.current++, type, ...presets[type] }].slice(-4));
  const remove = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  return (
    <div className="relative h-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-6">
      <style>{'@keyframes e13-shrink{from{transform:scaleX(1)}to{transform:scaleX(0)}}'}</style>
      <p className="text-sm font-medium text-slate-900">Trigger a notification</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {[['success', 'Success', 'hover:border-emerald-300'], ['warning', 'Warning', 'hover:border-amber-300'], ['error', 'Error', 'hover:border-rose-300']].map(([type, label, hov]) => (
          <button key={type} onClick={() => push(type)} className={`rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ${hov}`}>
            {label}
          </button>
        ))}
      </div>
      <ol aria-live="polite" aria-label="Notifications" className="pointer-events-none absolute bottom-6 right-6 flex flex-col gap-3">
        {toasts.map((t) => (
          <Toast13 key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </ol>
    </div>
  );
}

/* ================================================================== */
/* 14. Alert stack — dark, compact inline banners                     */
/* ================================================================== */
export function Element14() {
  const initial = [
    { id: 'a', type: 'info', text: 'Scheduled maintenance Sunday 02:00–03:00 UTC.' },
    { id: 'b', type: 'success', text: 'Backup completed — 14.2 GB in 3m 08s.' },
    { id: 'c', type: 'warning', text: 'API key “ci-runner” expires in 3 days.' },
    { id: 'd', type: 'error', text: 'Webhook to hooks.acme.dev failing (502) since 09:41.' },
  ];
  const [alerts, setAlerts] = useState(initial);
  const tone = {
    info: { icon: P.info, cls: 'border-sky-400/30 bg-sky-400/5 text-sky-200', ic: 'text-sky-400' },
    success: { icon: P.success, cls: 'border-emerald-400/30 bg-emerald-400/5 text-emerald-200', ic: 'text-emerald-400' },
    warning: { icon: P.alert, cls: 'border-amber-400/30 bg-amber-400/5 text-amber-200', ic: 'text-amber-400' },
    error: { icon: P.error, cls: 'border-rose-400/40 bg-rose-500/10 text-rose-200', ic: 'text-rose-400' },
  };

  return (
    <section aria-label="System alerts" className="rounded-lg bg-zinc-950 p-3 ring-1 ring-white/10">
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">Alerts · {alerts.length}</h3>
        {alerts.length < initial.length && (
          <button onClick={() => setAlerts(initial)} className="text-[11px] text-zinc-400 underline-offset-2 hover:text-white hover:underline">Restore all</button>
        )}
      </div>
      {alerts.length === 0 ? (
        <p className="px-1 py-3 text-xs text-zinc-500">You're all caught up.</p>
      ) : (
        <ul className="space-y-1.5">
          {alerts.map((a) => (
            <li key={a.id} role={a.type === 'error' ? 'alert' : 'status'} className={`flex items-center gap-2 rounded-md border-l-2 px-2.5 py-1.5 text-xs ${tone[a.type].cls}`}>
              <Icon d={tone[a.type].icon} className={`h-3.5 w-3.5 shrink-0 ${tone[a.type].ic}`} />
              <span className="flex-1">{a.text}</span>
              <button
                onClick={() => setAlerts((xs) => xs.filter((x) => x.id !== a.id))}
                aria-label="Dismiss alert"
                className="rounded p-0.5 opacity-60 hover:bg-white/10 hover:opacity-100"
              >
                <Icon d={P.x} className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ================================================================== */
/* 15. Breadcrumbs — three styles: minimal, colourful chips, dark     */
/*     collapsible                                                     */
/* ================================================================== */
export function Element15() {
  const trail = ['Home', 'Workspace', 'Finance', 'Reports', '2026', 'Q4 summary'];
  const [expanded, setExpanded] = useState(false);
  const chipColors = ['bg-sky-100 text-sky-700', 'bg-violet-100 text-violet-700', 'bg-pink-100 text-pink-700'];

  return (
    <div className="space-y-6">
      {/* Minimal */}
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          {['Docs', 'Components', 'Navigation', 'Breadcrumbs'].map((c, i, arr) => (
            <li key={c} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true" className="text-slate-300">/</span>}
              {i === arr.length - 1 ? (
                <span aria-current="page" className="font-medium text-slate-900">{c}</span>
              ) : (
                <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-slate-900">{c}</a>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Colourful chips */}
      <nav aria-label="Category breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm font-semibold">
          <li>
            <a href="#" onClick={(e) => e.preventDefault()} aria-label="Home" className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-white shadow">
              <Icon d={P.home} className="h-4 w-4" />
            </a>
          </li>
          {['Shop', 'Outdoor', 'Tents'].map((c, i) => (
            <li key={c} className="flex items-center gap-1.5">
              <Icon d={P.right} className="h-4 w-4 text-slate-300" />
              {i === 2 ? (
                <span aria-current="page" className="rounded-full bg-gradient-to-r from-pink-500 to-orange-400 px-3 py-1.5 text-white shadow">{c}</span>
              ) : (
                <a href="#" onClick={(e) => e.preventDefault()} className={`rounded-full px-3 py-1.5 hover:brightness-95 ${chipColors[i]}`}>{c}</a>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Dark, compact, collapsible */}
      <nav aria-label="File path" className="inline-flex rounded-md bg-slate-900 px-2 py-1 ring-1 ring-white/10">
        <ol className="flex flex-wrap items-center text-xs text-slate-400">
          {(expanded ? trail : [trail[0], '…', ...trail.slice(-2)]).map((c, i, arr) => (
            <li key={`${c}-${i}`} className="flex items-center">
              {i > 0 && <Icon d={P.right} className="mx-0.5 h-3 w-3 text-slate-600" />}
              {c === '…' ? (
                <button onClick={() => setExpanded(true)} aria-label={`Show ${trail.length - 3} hidden levels`} className="rounded px-1.5 py-0.5 hover:bg-white/10 hover:text-white">…</button>
              ) : i === arr.length - 1 ? (
                <span aria-current="page" className="rounded px-1.5 py-0.5 font-medium text-white">{c}</span>
              ) : (
                <a href="#" onClick={(e) => e.preventDefault()} className="rounded px-1.5 py-0.5 hover:bg-white/10 hover:text-white">{c}</a>
              )}
            </li>
          ))}
          {expanded && (
            <li className="ml-1">
              <button onClick={() => setExpanded(false)} className="rounded px-1.5 py-0.5 text-slate-500 hover:text-white">collapse</button>
            </li>
          )}
        </ol>
      </nav>
    </div>
  );
}

/* ================================================================== */
/* 16. Tooltips — dark toolbar, hover/focus, placements, Esc to close */
/* ================================================================== */
function Tooltip16({ label, shortcut, placement = 'top', children }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const pos = {
    top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
    bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
    right: 'left-full top-1/2 ml-2 -translate-y-1/2',
  }[placement];
  const arrow = {
    top: 'left-1/2 top-full -translate-x-1/2 -translate-y-1/2',
    bottom: 'left-1/2 bottom-full -translate-x-1/2 translate-y-1/2',
    right: 'right-full top-1/2 -translate-y-1/2 translate-x-1/2',
  }[placement];
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
    >
      {React.cloneElement(children, { 'aria-describedby': id })}
      <span
        role="tooltip"
        id={id}
        className={`pointer-events-none absolute z-20 whitespace-nowrap rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-900 shadow-lg transition duration-150 ${pos} ${open ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
      >
        {label}
        {shortcut && <kbd className="ml-2 rounded bg-slate-100 px-1 font-sans text-[10px] text-slate-500">{shortcut}</kbd>}
        <span aria-hidden="true" className={`absolute h-2 w-2 rotate-45 bg-white ${arrow}`} />
      </span>
    </span>
  );
}

export function Element16() {
  const [active, setActive] = useState({ bold: true });
  const tools = [
    { id: 'bold', label: 'Bold', shortcut: '⌘B', icon: P.bold },
    { id: 'italic', label: 'Italic', shortcut: '⌘I', icon: P.italic },
    { id: 'link', label: 'Insert link', shortcut: '⌘K', icon: P.link },
  ];
  const btn = 'grid h-9 w-9 place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400';

  return (
    <div className="flex flex-col items-center gap-10 rounded-2xl bg-slate-950 px-6 py-14">
      <div role="toolbar" aria-label="Text formatting" className="flex items-center gap-1 rounded-xl bg-slate-800/80 p-1 ring-1 ring-white/10">
        {tools.map((t) => (
          <Tooltip16 key={t.id} label={t.label} shortcut={t.shortcut}>
            <button
              aria-label={t.label}
              aria-pressed={!!active[t.id]}
              onClick={() => setActive((a) => ({ ...a, [t.id]: !a[t.id] }))}
              className={`${btn} ${active[t.id] ? 'bg-indigo-500 text-white hover:bg-indigo-500' : ''}`}
            >
              <Icon d={t.icon} />
            </button>
          </Tooltip16>
        ))}
        <span className="mx-1 h-5 w-px bg-white/10" aria-hidden="true" />
        <Tooltip16 label="Add comment — tooltip below" placement="bottom">
          <button aria-label="Add comment" className={btn}><Icon d={P.chat} /></button>
        </Tooltip16>
      </div>
      <div className="flex items-center gap-3 text-sm text-slate-400">
        <span>Last edited 4 minutes ago</span>
        <Tooltip16 label="Nov 22, 2026 · 10:42 by Mia" placement="right">
          <button aria-label="Edit history details" className="grid h-6 w-6 place-items-center rounded-full text-slate-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
            <Icon d={P.info} className="h-4 w-4" />
          </button>
        </Tooltip16>
      </div>
    </div>
  );
}

/* ================================================================== */
/* 17. Dropdown select — colourful listbox, keyboard support          */
/* ================================================================== */
export function Element17() {
  const options = [
    { id: 'bug', label: 'Bug', dot: 'bg-rose-500', hint: 'Something is broken' },
    { id: 'feature', label: 'Feature', dot: 'bg-violet-500', hint: 'New capability' },
    { id: 'design', label: 'Design', dot: 'bg-pink-400', hint: 'Visual or UX work' },
    { id: 'docs', label: 'Docs', dot: 'bg-sky-500', hint: 'Documentation' },
    { id: 'perf', label: 'Performance', dot: 'bg-amber-400', hint: 'Speed & memory' },
  ];
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('feature');
  const [hi, setHi] = useState(1);
  const root = useRef(null);
  const listRef = useRef(null);
  const btnRef = useRef(null);
  const id = useId();
  const selected = options.find((o) => o.id === value);

  useEffect(() => {
    if (!open) return;
    const close = (e) => root.current && !root.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    listRef.current?.focus();
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const choose = (i) => {
    setValue(options[i].id);
    setOpen(false);
    btnRef.current?.focus();
  };
  const onListKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => Math.min(options.length - 1, h + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(0, h - 1)); }
    else if (e.key === 'Home') setHi(0);
    else if (e.key === 'End') setHi(options.length - 1);
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(hi); }
    else if (e.key === 'Escape' || e.key === 'Tab') { setOpen(false); btnRef.current?.focus(); }
  };

  return (
    <div ref={root} className="relative w-72 rounded-2xl bg-gradient-to-br from-violet-100 via-pink-50 to-amber-50 p-5">
      <span id={`${id}-label`} className="mb-2 block text-sm font-bold text-violet-900">Issue label</span>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${id}-label ${id}-btn`}
        id={`${id}-btn`}
        onClick={() => { setHi(options.findIndex((o) => o.id === value)); setOpen((o) => !o); }}
        onKeyDown={(e) => { if (e.key === 'ArrowDown' && !open) { e.preventDefault(); setHi(options.findIndex((o) => o.id === value)); setOpen(true); } }}
        className="flex w-full items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-left text-sm font-semibold text-slate-800 shadow-md shadow-violet-200 ring-2 ring-transparent focus:outline-none focus:ring-violet-400"
      >
        <span className={`h-3 w-3 rounded-full ${selected.dot}`} aria-hidden="true" />
        <span className="flex-1">{selected.label}</span>
        <Icon d={P.down} className={`h-4 w-4 text-violet-500 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={`${id}-label`}
          aria-activedescendant={`${id}-opt-${hi}`}
          onKeyDown={onListKey}
          className="absolute left-5 right-5 z-20 mt-2 max-h-64 overflow-auto rounded-xl bg-white p-1.5 shadow-xl shadow-violet-300/40 ring-1 ring-violet-100 focus:outline-none"
        >
          {options.map((o, i) => {
            const sel = o.id === value;
            return (
              <li
                key={o.id}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={sel}
                onMouseEnter={() => setHi(i)}
                onClick={() => choose(i)}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm ${hi === i ? 'bg-violet-50' : ''}`}
              >
                <span className={`h-3 w-3 rounded-full ${o.dot}`} aria-hidden="true" />
                <span className="flex-1">
                  <span className="block font-semibold text-slate-800">{o.label}</span>
                  <span className="block text-xs text-slate-500">{o.hint}</span>
                </span>
                {sel && <Icon d={P.check} className="h-4 w-4 text-violet-600" strokeWidth={3} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ================================================================== */
/* 18. Search input with suggestions — minimal combobox               */
/* ================================================================== */
export function Element18() {
  const items = [
    { label: 'Billing settings', group: 'Pages', icon: P.file },
    { label: 'Billing history', group: 'Pages', icon: P.file },
    { label: 'Team members', group: 'Pages', icon: P.user },
    { label: 'API keys', group: 'Pages', icon: P.file },
    { label: 'Mia Chen', group: 'People', icon: P.user },
    { label: 'Mike Ross', group: 'People', icon: P.user },
    { label: 'Release notes', group: 'Docs', icon: P.file },
    { label: 'Rate limits', group: 'Docs', icon: P.file },
  ];
  const recent = ['API keys', 'Mia Chen', 'Release notes'];
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const [picked, setPicked] = useState(null);
  const inputRef = useRef(null);
  const id = useId();

  const term = q.trim().toLowerCase();
  const results = term
    ? items.filter((i) => i.label.toLowerCase().includes(term))
    : items.filter((i) => recent.includes(i.label)).map((i) => ({ ...i, group: 'Recent', icon: P.clock }));
  const groups = [...new Set(results.map((r) => r.group))];

  const pick = (r) => {
    setPicked(r.label);
    setQ(r.label);
    setOpen(false);
  };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setHi((h) => Math.min(results.length - 1, h + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => Math.max(0, h - 1)); }
    else if (e.key === 'Enter' && open && results[hi]) { e.preventDefault(); pick(results[hi]); }
    else if (e.key === 'Escape') setOpen(false);
  };
  const highlight = (text) => {
    if (!term) return text;
    const i = text.toLowerCase().indexOf(term);
    return (
      <>
        {text.slice(0, i)}
        <mark className="bg-transparent font-semibold text-slate-900 underline decoration-slate-300 underline-offset-2">{text.slice(i, i + term.length)}</mark>
        {text.slice(i + term.length)}
      </>
    );
  };

  return (
    <div className="w-full max-w-md">
      <div className="relative">
        <label htmlFor={`${id}-input`} className="sr-only">Search</label>
        <Icon d={P.search} className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          id={`${id}-input`}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-autocomplete="list"
          aria-activedescendant={open && results[hi] ? `${id}-opt-${hi}` : undefined}
          placeholder="Search pages, people, docs…"
          value={q}
          onChange={(e) => { setQ(e.target.value); setHi(0); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKey}
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-20 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-100"
        />
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
          {q && (
            <button
              type="button"
              aria-label="Clear search"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { setQ(''); setPicked(null); inputRef.current?.focus(); }}
              className="rounded p-0.5 text-slate-400 hover:text-slate-700"
            >
              <Icon d={P.x} className="h-4 w-4" />
            </button>
          )}
          <kbd className="rounded border border-slate-200 px-1.5 text-[10px] font-medium text-slate-400">⌘K</kbd>
        </div>
        {open && (
          <ul id={`${id}-list`} role="listbox" aria-label="Suggestions" className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-lg">
            {results.length === 0 && <li className="px-4 py-6 text-center text-sm text-slate-500">No results for “{q}”</li>}
            {groups.map((g) => (
              <li key={g} role="presentation">
                <div className="px-4 pb-1 pt-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">{g}</div>
                <ul role="group" aria-label={g}>
                  {results.map((r, i) =>
                    r.group !== g ? null : (
                      <li
                        key={r.label}
                        id={`${id}-opt-${i}`}
                        role="option"
                        aria-selected={hi === i}
                        onMouseEnter={() => setHi(i)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pick(r)}
                        className={`flex cursor-pointer items-center gap-3 px-4 py-2 text-sm text-slate-600 ${hi === i ? 'bg-slate-100' : ''}`}
                      >
                        <Icon d={r.icon} className="h-4 w-4 text-slate-400" />
                        <span className="flex-1">{highlight(r.label)}</span>
                        {hi === i && <span className="text-xs text-slate-400">↵</span>}
                      </li>
                    )
                  )}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
      {picked && <p className="mt-3 text-sm text-slate-500">Opened <span className="font-medium text-slate-900">{picked}</span></p>}
    </div>
  );
}

/* ================================================================== */
/* 19. File upload dropzone — colourful, roomy, simulated progress    */
/* ================================================================== */
export function Element19() {
  const [drag, setDrag] = useState(false);
  const [files, setFiles] = useState([
    { id: 1, name: 'brand-guidelines.pdf', size: 4_820_000, progress: 100 },
    { id: 2, name: 'hero-shot@2x.png', size: 2_310_000, progress: 46 },
  ]);
  const nextId = useRef(3);
  const inputId = useId();
  const MAX = 25 * 1024 * 1024;

  useEffect(() => {
    if (!files.some((f) => f.progress < 100 && !f.error)) return;
    const t = setInterval(() => {
      setFiles((fs) => fs.map((f) => (f.progress < 100 && !f.error ? { ...f, progress: Math.min(100, f.progress + 7 + Math.random() * 10) } : f)));
    }, 300);
    return () => clearInterval(t);
  }, [files]);

  const add = (list) => {
    const next = [...list].map((f) => ({
      id: nextId.current++,
      name: f.name,
      size: f.size,
      progress: 0,
      error: f.size > MAX ? 'Larger than 25 MB' : null,
    }));
    setFiles((fs) => [...fs, ...next]);
  };
  const fmt = (b) => (b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <label
        htmlFor={inputId}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
          drag ? 'scale-[1.01] border-teal-400 bg-teal-50' : 'border-slate-200 bg-gradient-to-br from-teal-50/60 via-white to-indigo-50/60 hover:border-indigo-300'
        }`}
      >
        <span className={`grid h-14 w-14 place-items-center rounded-2xl text-white shadow-lg transition ${drag ? 'bg-teal-500 shadow-teal-500/40' : 'bg-gradient-to-br from-teal-400 to-indigo-500 shadow-indigo-500/30'}`}>
          <Icon d={P.upload} className="h-6 w-6" />
        </span>
        <span className="mt-4 text-base font-semibold text-slate-900">{drag ? 'Drop to upload' : 'Drag & drop files here'}</span>
        <span className="mt-1 text-sm text-slate-500">
          or <span className="font-semibold text-indigo-600 underline decoration-indigo-200 underline-offset-2">browse</span> · PDF, PNG, JPG up to 25 MB
        </span>
        <input id={inputId} type="file" multiple className="sr-only" onChange={(e) => { add(e.target.files); e.target.value = ''; }} />
      </label>

      {files.length > 0 && (
        <ul aria-label="Uploads" className="mt-5 space-y-3">
          {files.map((f) => {
            const done = f.progress >= 100;
            return (
              <li key={f.id} className={`flex items-center gap-4 rounded-2xl p-3 ring-1 ${f.error ? 'bg-rose-50 ring-rose-100' : 'ring-slate-100'}`}>
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${f.error ? 'bg-rose-100 text-rose-500' : done ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                  <Icon d={f.error ? P.error : done ? P.check : P.file} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-medium text-slate-900">{f.name}</p>
                    <span className={`shrink-0 text-xs ${f.error ? 'text-rose-600' : 'text-slate-500'}`}>
                      {f.error ?? (done ? fmt(f.size) : `${Math.floor(f.progress)}%`)}
                    </span>
                  </div>
                  {!f.error && !done && (
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`Uploading ${f.name}`} aria-valuenow={Math.floor(f.progress)} aria-valuemin={0} aria-valuemax={100}>
                      <div className="h-full rounded-full bg-gradient-to-r from-teal-400 to-indigo-500 transition-all" style={{ width: `${f.progress}%` }} />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setFiles((fs) => fs.filter((x) => x.id !== f.id))}
                  aria-label={`Remove ${f.name}`}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <Icon d={P.x} className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ================================================================== */
/* 20. Settings toggles — minimal, with live density switch +         */
/*     dependent (disabled) toggles                                    */
/* ================================================================== */
function Switch20({ checked, onChange, disabled, labelledBy, describedBy }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 ${checked ? 'bg-slate-900' : 'bg-slate-200'}`}
    >
      <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
    </button>
  );
}

export function Element20() {
  const [s, setS] = useState({
    email: true,
    push: false,
    digest: true,
    publicProfile: true,
    showActivity: true,
    compact: false,
  });
  const set = (k) => (v) => setS((x) => ({ ...x, [k]: v }));
  const sections = [
    {
      title: 'Notifications',
      rows: [
        { k: 'email', label: 'Email notifications', desc: 'Mentions, replies and assignments.' },
        { k: 'push', label: 'Push notifications', desc: 'Sent to your signed-in devices.' },
        { k: 'digest', label: 'Weekly digest', desc: 'A Monday summary of activity.' },
      ],
    },
    {
      title: 'Privacy',
      rows: [
        { k: 'publicProfile', label: 'Public profile', desc: 'Anyone with the link can view your profile.' },
        { k: 'showActivity', label: 'Show activity status', desc: 'Requires a public profile.', dependsOn: 'publicProfile' },
      ],
    },
    {
      title: 'Appearance',
      rows: [{ k: 'compact', label: 'Compact density', desc: 'Tighter spacing — try it on this panel.' }],
    },
  ];
  const pad = s.compact ? 'py-2.5' : 'py-5';

  return (
    <form className="rounded-2xl border border-slate-200 bg-white px-6" onSubmit={(e) => e.preventDefault()}>
      {sections.map((sec) => (
        <fieldset key={sec.title} className={`border-b border-slate-100 last:border-0 ${s.compact ? 'py-3' : 'py-6'}`}>
          <legend className="sr-only">{sec.title}</legend>
          <h3 aria-hidden="true" className="text-xs font-semibold uppercase tracking-wider text-slate-400">{sec.title}</h3>
          <ul className="divide-y divide-slate-100">
            {sec.rows.map((r) => {
              const disabled = r.dependsOn && !s[r.dependsOn];
              const on = disabled ? false : s[r.k];
              return (
                <li key={r.k} className={`flex items-center justify-between gap-6 transition-[padding] ${pad}`}>
                  <div className={disabled ? 'opacity-50' : ''}>
                    <p id={`e20-${r.k}-l`} className="text-sm font-medium text-slate-900">{r.label}</p>
                    {!s.compact && <p id={`e20-${r.k}-d`} className="mt-0.5 text-sm text-slate-500">{r.desc}</p>}
                  </div>
                  <Switch20
                    checked={on}
                    onChange={set(r.k)}
                    disabled={disabled}
                    labelledBy={`e20-${r.k}-l`}
                    describedBy={s.compact ? undefined : `e20-${r.k}-d`}
                  />
                </li>
              );
            })}
          </ul>
        </fieldset>
      ))}
    </form>
  );
}

/* ================================================================== */
/* Gallery — renders all 20 for preview                               */
/* ================================================================== */
const ALL = [
  ['Data table — sortable, actions, selected row', Element1, 'bg-slate-50'],
  ['Data table — dark compact, bulk select', Element2, 'bg-zinc-900'],
  ['Data table — colourful, empty state', Element3, 'bg-violet-50'],
  ['Pagination — numbered', Element4, 'bg-white'],
  ['Pagination — prev/next + page size', Element5, 'bg-slate-800'],
  ['Pagination — compact jump-to', Element6, 'bg-orange-50'],
  ['Stepper — horizontal', Element7, 'bg-slate-50'],
  ['Stepper — vertical pipeline', Element8, 'bg-slate-900'],
  ['Progress — ring + checklist', Element9, 'bg-white'],
  ['Tabs — underline', Element10, 'bg-white'],
  ['Tabs — pills with counts', Element11, 'bg-slate-50'],
  ['Tabs — icon segmented', Element12, 'bg-neutral-800'],
  ['Toast stack', Element13, 'bg-white'],
  ['Alert stack — dark compact', Element14, 'bg-zinc-900'],
  ['Breadcrumbs', Element15, 'bg-white'],
  ['Tooltips', Element16, 'bg-slate-900'],
  ['Dropdown select', Element17, 'bg-white'],
  ['Search with suggestions', Element18, 'bg-slate-50'],
  ['File upload dropzone', Element19, 'bg-slate-50'],
  ['Settings toggles', Element20, 'bg-slate-50'],
];

export default function Gallery() {
  return (
    <main className="mx-auto max-w-5xl space-y-10 px-4 py-10 font-sans antialiased">
      {ALL.map(([title, Comp, bg], i) => (
        <section key={title} aria-labelledby={`g-${i}`}>
          <h2 id={`g-${i}`} className="mb-3 text-sm font-semibold text-slate-500">
            <span className="mr-2 font-mono text-slate-400">Element{i + 1}</span>
            {title}
          </h2>
          <div className={`min-h-[120px] rounded-2xl p-6 sm:p-8 ${bg}`}>
            <Comp />
          </div>
        </section>
      ))}
    </main>
  );
}
