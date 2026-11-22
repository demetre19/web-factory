import React, { useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, ImagePlus, X } from 'lucide-react';
import { formatFileSize, validateFileCandidate } from '../../utils/validation';

const ALLOWED = ['.png', '.jpg', '.svg', '.wav', '.zip'];
const MAX_BYTES = 10 * 1024 * 1024;

export function Form14() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [assetFile, setAssetFile] = useState<{ name: string; size: number } | null>(null);
  const [title, setTitle] = useState('');
  const [license, setLicense] = useState('CC BY 4.0');
  const [credit, setCredit] = useState('');
  const [notes, setNotes] = useState('');
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState<{ file?: string; title?: string }>({});
  const [saved, setSaved] = useState(false);

  const pickFile = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const f = list[0];
    const err = validateFileCandidate({ name: f.name, size: f.size }, ALLOWED, MAX_BYTES);
    if (err) {
      setErrors((prev) => ({ ...prev, file: err }));
      return;
    }
    setAssetFile({ name: f.name, size: f.size });
    setErrors((prev) => ({ ...prev, file: undefined }));
    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!assetFile) next.file = 'Select or drop a media file to submit.';
    if (title.trim().length < 3) next.title = 'Enter an asset title (min 3 characters).';
    setErrors(next);
    if (Object.keys(next).length === 0) {
      setSaved(true);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-3xl bg-stone-50 border border-stone-200 rounded-xl p-6 space-y-5"
    >
      <div className="border-b border-stone-200 pb-3">
        <h3 className="text-base font-semibold text-stone-900">Creative Asset Submission</h3>
        <p className="text-xs text-stone-600">Warm two-column dropzone pairing media upload with license metadata.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-2">
          <label htmlFor="form14-file" className="block text-sm font-medium text-stone-800">
            Source File
          </label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              pickFile(e.dataTransfer.files);
            }}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
              dragging
                ? 'border-amber-800 bg-amber-50'
                : errors.file
                  ? 'border-red-500 bg-red-50/40'
                  : 'border-stone-300 bg-white hover:border-stone-400'
            }`}
          >
            <ImagePlus className="w-7 h-7 text-stone-500 mx-auto mb-2.5" aria-hidden="true" />
            <p className="text-sm text-stone-800">
              Drop asset here or{' '}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="font-semibold text-amber-900 hover:text-amber-800 underline underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-900 rounded"
              >
                choose file
              </button>
            </p>
            <p className="text-xs text-stone-500 mt-1">PNG, JPG, SVG, WAV, ZIP · Max 10 MB</p>
            <input
              ref={fileRef}
              id="form14-file"
              type="file"
              accept=".png,.jpg,.svg,.wav,.zip"
              onChange={(e) => {
                pickFile(e.target.files);
                e.target.value = '';
              }}
              className="sr-only"
            />
          </div>

          {assetFile && (
            <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white border border-stone-200 rounded-lg text-xs">
              <div className="truncate">
                <span className="font-medium text-stone-900">{assetFile.name}</span>{' '}
                <span className="font-mono tabular-nums text-stone-500">({formatFileSize(assetFile.size)})</span>
              </div>
              <button
                type="button"
                aria-label="Remove selected asset file"
                onClick={() => setAssetFile(null)}
                className="p-1 text-stone-400 hover:text-red-700 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-900"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          )}

          {errors.file && (
            <p role="alert" className="text-xs text-red-700 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              {errors.file}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="form14-title" className="block text-sm font-medium text-stone-800">
              Asset Title
            </label>
            <input
              id="form14-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              placeholder="Hand-drawn Monolith Vector"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'form14-title-err' : undefined}
              className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 ${
                errors.title ? 'border-red-600 focus:ring-red-200' : 'border-stone-300 focus:border-amber-800 focus:ring-amber-100'
              }`}
            />
            {errors.title && (
              <p id="form14-title-err" role="alert" className="text-xs text-red-700 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                {errors.title}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="form14-license" className="block text-sm font-medium text-stone-800">
                License
              </label>
              <select
                id="form14-license"
                value={license}
                onChange={(e) => setLicense(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-800 focus:ring-2 focus:ring-amber-100"
              >
                <option value="CC BY 4.0">CC BY 4.0</option>
                <option value="MIT Asset">MIT Asset</option>
                <option value="Editorial Only">Editorial Only</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="form14-credit" className="block text-sm font-medium text-stone-800">
                Attribution
              </label>
              <input
                id="form14-credit"
                type="text"
                value={credit}
                onChange={(e) => setCredit(e.target.value)}
                placeholder="Studio Meridian"
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-800 focus:ring-2 focus:ring-amber-100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="form14-notes" className="block text-sm font-medium text-stone-800">
              Usage Notes
            </label>
            <textarea
              id="form14-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Color profile or print scaling guidelines..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-800 focus:ring-2 focus:ring-amber-100"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-200">
        <div>
          {saved && assetFile && (
            <p className="text-xs font-medium text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              Submitted &quot;{title}&quot; ({assetFile.name}) under {license}.
            </p>
          )}
        </div>
        <button
          type="submit"
          className="px-5 py-2 text-sm font-medium text-stone-50 bg-amber-900 hover:bg-amber-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-900"
        >
          Publish Asset
        </button>
      </div>
    </form>
  );
}
