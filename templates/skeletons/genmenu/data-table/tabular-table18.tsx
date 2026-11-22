import { useState } from 'react';
import { Archive, ArrowDown, ArrowUp, ArrowUpDown, HardDrive } from 'lucide-react';
import { formatBytes, nextSortConfig, SortConfig, sortRecords, sumBy, toggleAllSelection, toggleSelection } from '../../utils/tableLogic';

interface StorageAsset {
  id: string;
  asset: string;
  bucket: string;
  format: 'PARQUET' | 'TAR.GZ' | 'MP4' | 'SQLITE';
  sizeBytes: number;
  bandwidthBytes: number;
  tier: 'Hot' | 'Infrequent' | 'Archived';
}

const INITIAL_ASSETS: StorageAsset[] = [
  { id: 'sa1', asset: 'telemetry-events-2026-11.parquet', bucket: 'prod-lake-eu', format: 'PARQUET', sizeBytes: 4_820_000_000, bandwidthBytes: 910_000_000, tier: 'Hot' },
  { id: 'sa2', asset: 'release-artifacts-v4.9.tar.gz', bucket: 'ci-builds-us', format: 'TAR.GZ', sizeBytes: 1_950_000_000, bandwidthBytes: 3_400_000_000, tier: 'Hot' },
  { id: 'sa3', asset: 'keynote-livestream-1080p.mp4', bucket: 'media-cdn', format: 'MP4', sizeBytes: 7_400_000_000, bandwidthBytes: 12_800_000_000, tier: 'Infrequent' },
  { id: 'sa4', asset: 'legacy-ledger-snapshot.sqlite', bucket: 'cold-vault', format: 'SQLITE', sizeBytes: 640_000_000, bandwidthBytes: 42_000_000, tier: 'Archived' },
];

export function Table18() {
  const [assets, setAssets] = useState<StorageAsset[]>(INITIAL_ASSETS);
  const [sort, setSort] = useState<SortConfig<keyof StorageAsset & string>>({ key: 'sizeBytes', direction: 'descending' });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const sorted = sortRecords(assets, sort);
  const allChecked = sorted.length > 0 && sorted.every((a) => selectedIds.includes(a.id));
  const totalSize = sumBy(sorted, (a) => a.sizeBytes);
  const totalBandwidth = sumBy(sorted, (a) => a.bandwidthBytes);
  const maxFileSize = Math.max(...sorted.map((a) => a.sizeBytes), 1);

  const renderSortIcon = (key: keyof StorageAsset & string) => {
    if (sort.key !== key || sort.direction === 'none') return <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />;
    return sort.direction === 'ascending' ? <ArrowUp className="h-3.5 w-3.5 text-cyan-400" /> : <ArrowDown className="h-3.5 w-3.5 text-cyan-400" />;
  };

  const archiveSelected = () => {
    setAssets((prev) => prev.map((a) => (selectedIds.includes(a.id) ? { ...a, tier: 'Archived' } : a)));
    setSelectedIds([]);
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 text-slate-100 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <HardDrive className="h-4 w-4 text-cyan-400" />
          <div>
            <h3 className="text-sm font-semibold text-white">Object Storage Buckets</h3>
            <p className="text-xs text-slate-400">Dark storage console · Usage share bars & footer totals</p>
          </div>
        </div>
        {selectedIds.length > 0 && (
          <button
            type="button"
            onClick={archiveSelected}
            className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 cursor-pointer"
          >
            <Archive className="h-3.5 w-3.5" /> Move {selectedIds.length} to Cold Archive
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/60 text-xs font-medium text-slate-400">
              <th scope="col" className="w-11 px-4 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all storage objects"
                  checked={allChecked}
                  onChange={() => setSelectedIds((p) => toggleAllSelection(p, sorted.map((a) => a.id)))}
                  className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-400 cursor-pointer"
                />
              </th>
              <th scope="col" aria-sort={sort.key === 'asset' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'asset'))} className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white cursor-pointer">
                  Object Key {renderSortIcon('asset')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'bucket' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'bucket'))} className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white cursor-pointer">
                  Bucket {renderSortIcon('bucket')}
                </button>
              </th>
              <th scope="col" className="px-4 py-3">Tier</th>
              <th scope="col" aria-sort={sort.key === 'sizeBytes' ? sort.direction : 'none'} className="px-4 py-3 text-right">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'sizeBytes'))} className="inline-flex items-center justify-end gap-1.5 text-slate-300 hover:text-white cursor-pointer">
                  Size {renderSortIcon('sizeBytes')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'bandwidthBytes' ? sort.direction : 'none'} className="px-5 py-3 text-right">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'bandwidthBytes'))} className="inline-flex items-center justify-end gap-1.5 text-slate-300 hover:text-white cursor-pointer">
                  30d Egress {renderSortIcon('bandwidthBytes')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {sorted.map((asset) => {
              const checked = selectedIds.includes(asset.id);
              const pct = Math.round((asset.sizeBytes / maxFileSize) * 100);
              return (
                <tr key={asset.id} className={checked ? 'bg-cyan-500/10' : 'hover:bg-slate-800/50'}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`Select ${asset.asset}`}
                      checked={checked}
                      onChange={() => setSelectedIds((p) => toggleSelection(p, asset.id))}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-400 cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs font-medium text-slate-100">{asset.asset}</div>
                    <div className="mt-1.5 h-1.5 w-36 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-cyan-400" style={{ width: `${pct}%` }} />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{asset.bucket}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        asset.tier === 'Hot'
                          ? 'bg-emerald-500/15 text-emerald-300'
                          : asset.tier === 'Infrequent'
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {asset.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs font-medium text-slate-200 tabular-nums">{formatBytes(asset.sizeBytes)}</td>
                  <td className="px-5 py-3 text-right font-mono text-xs text-slate-400 tabular-nums">{formatBytes(asset.bandwidthBytes)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-800 bg-slate-950/70 text-xs font-semibold text-slate-200">
              <td colSpan={4} className="px-4 py-3 text-slate-400">
                Aggregate Footprint ({sorted.length} objects)
              </td>
              <td className="px-4 py-3 text-right font-mono text-cyan-300 tabular-nums">{formatBytes(totalSize)}</td>
              <td className="px-5 py-3 text-right font-mono text-slate-300 tabular-nums">{formatBytes(totalBandwidth)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
