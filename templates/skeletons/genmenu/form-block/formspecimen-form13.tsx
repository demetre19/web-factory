import React, { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, FileText, Trash2, UploadCloud } from 'lucide-react';
import { formatFileSize, validateFileCandidate } from '../../utils/validation';

interface QueuedFile {
  id: string;
  name: string;
  size: number;
}

const ALLOWED_EXTS = ['.pdf', '.png', '.jpg', '.csv'];
const MAX_FILE_BYTES = 5 * 1024 * 1024;

export function Form13() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState('SOC2 Evidence');
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [notes, setNotes] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const ingestFiles = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    const rejected: string[] = [];
    const accepted: QueuedFile[] = [];

    Array.from(incoming).forEach((file) => {
      const err = validateFileCandidate({ name: file.name, size: file.size }, ALLOWED_EXTS, MAX_FILE_BYTES);
      if (err) {
        rejected.push(err);
      } else {
        accepted.push({ id: `${file.name}-${file.size}-${Date.now()}`, name: file.name, size: file.size });
      }
    });

    if (accepted.length > 0) {
      setFiles((prev) => [...prev, ...accepted]);
    }
    setFileError(rejected.length > 0 ? rejected[0] : null);
    setSubmitted(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      setFileError('Attach at least one valid document (.pdf, .png, .jpg, or .csv).');
      return;
    }
    setFileError(null);
    setSubmitted(true);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-xl bg-white border border-slate-200 rounded-xl p-6 space-y-5"
    >
      <div className="space-y-1">
        <h3 className="text-base font-semibold text-slate-900">Compliance Document Upload</h3>
        <p className="text-xs text-slate-500">Single-column professional dropzone validating format and 5 MB limit.</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="form13-type" className="block text-sm font-medium text-slate-700">
          Document Category
        </label>
        <select
          id="form13-type"
          value={docType}
          onChange={(e) => setDocType(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
        >
          <option value="SOC2 Evidence">SOC2 Evidence</option>
          <option value="Tax Certificate (W-9 / W-8BEN)">Tax Certificate (W-9 / W-8BEN)</option>
          <option value="Insurance Certificate">Insurance Certificate</option>
          <option value="Vendor Audit CSV">Vendor Audit CSV</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="form13-file" className="block text-sm font-medium text-slate-700">
          Attachment Files
        </label>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            ingestFiles(e.dataTransfer.files);
          }}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging
              ? 'border-indigo-600 bg-indigo-50/60'
              : fileError
                ? 'border-red-400 bg-red-50/30'
                : 'border-slate-300 bg-slate-50/70 hover:border-slate-400'
          }`}
        >
          <UploadCloud className="w-7 h-7 text-slate-500 mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm text-slate-700">
            Drag and drop files here, or{' '}
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded"
            >
              browse computer
            </button>
          </p>
          <p className="text-xs text-slate-500 mt-1">Accepted: PDF, PNG, JPG, CSV · Max 5 MB per file</p>
          <input
            ref={inputRef}
            id="form13-file"
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.csv"
            onChange={(e) => {
              ingestFiles(e.target.files);
              e.target.value = '';
            }}
            className="sr-only"
          />
        </div>
        {fileError && (
          <p role="alert" className="text-xs text-red-700 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            {fileError}
          </p>
        )}
      </div>

      {files.length > 0 && (
        <ul aria-label="Queued files" className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
          {files.map((f) => (
            <li key={f.id} className="px-3.5 py-2.5 flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
                <span className="truncate font-medium text-slate-800">{f.name}</span>
                <span className="text-xs font-mono tabular-nums text-slate-500 shrink-0">
                  {formatFileSize(f.size)}
                </span>
              </div>
              <button
                type="button"
                aria-label={`Remove ${f.name}`}
                onClick={() => setFiles((prev) => prev.filter((item) => item.id !== f.id))}
                className="p-1.5 text-slate-400 hover:text-red-700 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-1.5">
        <label htmlFor="form13-notes" className="block text-sm font-medium text-slate-700">
          Reviewer Note (Optional)
        </label>
        <textarea
          id="form13-notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add context for the compliance reviewer..."
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          {submitted && (
            <p className="text-xs font-medium text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              Uploaded {files.length} file(s) under {docType}.
            </p>
          )}
        </div>
        <button
          type="submit"
          className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-600"
        >
          Submit Documents
        </button>
      </div>
    </form>
  );
}
