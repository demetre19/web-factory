import React, { useState } from 'react';
import { AlertCircle, Check, CheckCircle2, Pencil, Plus, X } from 'lucide-react';
import { isValidEmail } from '../../utils/validation';

interface MemberRow {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
}

const INITIAL_ROWS: MemberRow[] = [
  { id: 'm1', name: 'Nadia Kowalski', email: 'nadia@core.dev', role: 'Admin' },
  { id: 'm2', name: 'Tariq Mansour', email: 'tariq@core.dev', role: 'Editor' },
  { id: 'm3', name: 'Hana Sato', email: 'hana@core.dev', role: 'Viewer' },
];

export function Form20() {
  const [rows, setRows] = useState<MemberRow[]>(INITIAL_ROWS);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<{ name: string; email: string; role: MemberRow['role'] }>({
    name: '',
    email: '',
    role: 'Editor',
  });
  const [newRow, setNewRow] = useState<{ name: string; email: string; role: MemberRow['role'] }>({
    name: '',
    email: '',
    role: 'Viewer',
  });
  const [addSubmittedAttempt, setAddSubmittedAttempt] = useState(false);
  const [lastSavedNotice, setLastSavedNotice] = useState<string | null>(null);

  const validateDraft = (d: { name: string; email: string }, excludeId?: string) => {
    const errs: { name?: string; email?: string } = {};
    if (d.name.trim().length < 2) errs.name = 'Name must be at least 2 characters.';
    if (!isValidEmail(d.email)) {
      errs.email = 'Enter a valid email address.';
    } else if (rows.some((r) => r.id !== excludeId && r.email.toLowerCase() === d.email.trim().toLowerCase())) {
      errs.email = 'Duplicate email already exists in directory.';
    }
    return errs;
  };

  const editErrors = editingId ? validateDraft(draft, editingId) : {};
  const editValid = editingId !== null && Object.keys(editErrors).length === 0;

  const newRowErrors = validateDraft(newRow);
  const newRowValid = Object.keys(newRowErrors).length === 0;

  const startEdit = (row: MemberRow) => {
    setEditingId(row.id);
    setDraft({ name: row.name, email: row.email, role: row.role });
    setLastSavedNotice(null);
  };

  const saveEdit = (id: string) => {
    if (!editValid) return;
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, name: draft.name.trim(), email: draft.email.trim(), role: draft.role } : r))
    );
    setEditingId(null);
    setLastSavedNotice(`Saved changes for ${draft.name.trim()}.`);
  };

  const handleAddRow = (e: React.FormEvent) => {
    e.preventDefault();
    setAddSubmittedAttempt(true);
    if (!newRowValid) return;
    const created: MemberRow = {
      id: `m-${Date.now()}`,
      name: newRow.name.trim(),
      email: newRow.email.trim(),
      role: newRow.role,
    };
    setRows((prev) => [...prev, created]);
    setNewRow({ name: '', email: '', role: 'Viewer' });
    setAddSubmittedAttempt(false);
    setLastSavedNotice(`Added ${created.name} (${created.role}).`);
  };

  return (
    <div className="max-w-4xl bg-zinc-950 border border-zinc-800 rounded-xl divide-y divide-zinc-800 text-zinc-100 tracking-[0.01em]">
      <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-white">Team Directory &amp; Validation States</h3>
          <p className="text-xs text-zinc-400">
            Dark inline-edit rows and compact creation bar with live error and success validation hints.
          </p>
        </div>
        {lastSavedNotice && (
          <span className="text-xs text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            {lastSavedNotice}
          </span>
        )}
      </div>

      <div className="divide-y divide-zinc-800/80">
        {rows.map((row) => {
          const isEditing = editingId === row.id;
          if (!isEditing) {
            return (
              <div
                key={row.id}
                className="px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-zinc-900/50 transition-colors"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 flex-1 min-w-0 items-center">
                  <span className="text-sm font-medium text-white truncate">{row.name}</span>
                  <span className="text-sm font-mono text-zinc-400 truncate">{row.email}</span>
                  <span className="text-xs text-zinc-300">{row.role}</span>
                </div>
                <button
                  type="button"
                  onClick={() => startEdit(row)}
                  aria-label={`Edit ${row.name}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                  Edit
                </button>
              </div>
            );
          }

          return (
            <div key={row.id} className="px-6 py-4 bg-zinc-900/70 space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-4 space-y-1">
                  <label htmlFor={`form20-edit-name-${row.id}`} className="block text-xs text-zinc-400">
                    Member Name
                  </label>
                  <input
                    id={`form20-edit-name-${row.id}`}
                    type="text"
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    aria-invalid={Boolean(editErrors.name)}
                    className={`w-full px-3 py-1.5 text-sm bg-zinc-950 border rounded-md text-white focus:outline-none focus:ring-2 ${
                      editErrors.name
                        ? 'border-red-500 focus:ring-red-500/30'
                        : 'border-emerald-500/80 focus:ring-emerald-400/25'
                    }`}
                  />
                </div>

                <div className="sm:col-span-4 space-y-1">
                  <label htmlFor={`form20-edit-email-${row.id}`} className="block text-xs text-zinc-400">
                    Work Email
                  </label>
                  <input
                    id={`form20-edit-email-${row.id}`}
                    type="email"
                    value={draft.email}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                    aria-invalid={Boolean(editErrors.email)}
                    className={`w-full px-3 py-1.5 text-sm font-mono bg-zinc-950 border rounded-md text-white focus:outline-none focus:ring-2 ${
                      editErrors.email
                        ? 'border-red-500 focus:ring-red-500/30'
                        : 'border-emerald-500/80 focus:ring-emerald-400/25'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label htmlFor={`form20-edit-role-${row.id}`} className="block text-xs text-zinc-400">
                    Role
                  </label>
                  <select
                    id={`form20-edit-role-${row.id}`}
                    value={draft.role}
                    onChange={(e) => setDraft({ ...draft, role: e.target.value as MemberRow['role'] })}
                    className="w-full px-2.5 py-1.5 text-sm bg-zinc-950 border border-zinc-700 rounded-md text-white focus:outline-none focus:border-sky-400"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Editor">Editor</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>

                <div className="sm:col-span-2 flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    disabled={!editValid}
                    onClick={() => saveEdit(row.id)}
                    aria-label={`Save ${row.name}`}
                    className="p-2 text-zinc-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                  >
                    <Check className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    aria-label={`Cancel editing ${row.name}`}
                    className="p-2 text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              {editErrors.name || editErrors.email ? (
                <p role="alert" className="text-xs text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {editErrors.name || editErrors.email}
                </p>
              ) : (
                <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  Valid name and unique email · Ready to save
                </p>
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleAddRow} noValidate className="p-6 space-y-2.5 bg-zinc-900/40 rounded-b-xl">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-4 space-y-1">
            <label htmlFor="form20-add-name" className="block text-xs font-medium text-zinc-300">
              Add Member Name
            </label>
            <input
              id="form20-add-name"
              type="text"
              value={newRow.name}
              onChange={(e) => setNewRow({ ...newRow, name: e.target.value })}
              placeholder="Samir Patel"
              aria-invalid={Boolean(addSubmittedAttempt && newRowErrors.name)}
              className={`w-full px-3 py-2 text-sm bg-zinc-900 border rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 ${
                addSubmittedAttempt && newRowErrors.name
                  ? 'border-red-500 focus:ring-red-500/30'
                  : newRow.name && !newRowErrors.name
                    ? 'border-emerald-500/80 focus:ring-emerald-400/25'
                    : 'border-zinc-700 focus:border-sky-400 focus:ring-sky-400/25'
              }`}
            />
          </div>

          <div className="sm:col-span-4 space-y-1">
            <label htmlFor="form20-add-email" className="block text-xs font-medium text-zinc-300">
              Member Email
            </label>
            <input
              id="form20-add-email"
              type="email"
              value={newRow.email}
              onChange={(e) => setNewRow({ ...newRow, email: e.target.value })}
              placeholder="samir@core.dev"
              aria-invalid={Boolean((addSubmittedAttempt || newRow.email !== '') && newRowErrors.email)}
              className={`w-full px-3 py-2 text-sm font-mono bg-zinc-900 border rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 ${
                (addSubmittedAttempt || newRow.email !== '') && newRowErrors.email
                  ? 'border-red-500 focus:ring-red-500/30'
                  : newRow.email && !newRowErrors.email
                    ? 'border-emerald-500/80 focus:ring-emerald-400/25'
                    : 'border-zinc-700 focus:border-sky-400 focus:ring-sky-400/25'
              }`}
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label htmlFor="form20-add-role" className="block text-xs font-medium text-zinc-300">
              Role
            </label>
            <select
              id="form20-add-role"
              value={newRow.role}
              onChange={(e) => setNewRow({ ...newRow, role: e.target.value as MemberRow['role'] })}
              className="w-full px-3 py-2 text-sm bg-zinc-900 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-sky-400"
            >
              <option value="Admin">Admin</option>
              <option value="Editor">Editor</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-zinc-950 bg-sky-400 hover:bg-sky-300 rounded-lg transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 h-[38px]"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              Add Row
            </button>
          </div>
        </div>

        {(addSubmittedAttempt || newRow.email !== '') && (newRowErrors.name || newRowErrors.email) ? (
          <p role="alert" className="text-xs text-red-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {newRowErrors.name || newRowErrors.email}
          </p>
        ) : newRow.name && newRow.email && newRowValid ? (
          <p className="text-xs text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            Fields valid · Ready to add member row
          </p>
        ) : (
          <p className="text-xs text-zinc-500">
            Tip: Try typing an invalid or duplicate email (e.g. nadia@core.dev) to preview live validation states.
          </p>
        )}
      </form>
    </div>
  );
}
