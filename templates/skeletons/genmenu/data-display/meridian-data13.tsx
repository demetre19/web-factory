import React, { useState } from 'react';
import { Check, Copy, GitCommitHorizontal, CheckCircle2, XCircle, Loader } from 'lucide-react';

type BranchFilter = 'All' | 'main' | 'release/v4';

interface BuildEntry {
  sha: string;
  branch: Exclude<BranchFilter, 'All'>;
  message: string;
  author: string;
  duration: string;
  status: 'Passed' | 'Failed' | 'Running';
  ago: string;
}

const BUILDS: BuildEntry[] = [
  { sha: '9f3a21c', branch: 'main', message: 'perf(query): stream arrow batches with zero-copy slice', author: 'k.sato', duration: '1m 42s', status: 'Passed', ago: '6m ago' },
  { sha: '4d8e10b', branch: 'release/v4', message: 'fix(auth): honor strict samesite cookie attribute on safari', author: 'm.okafor', duration: '2m 11s', status: 'Failed', ago: '23m ago' },
  { sha: '7c1b94e', branch: 'main', message: 'chore(deps): bump rustls to 0.23.18 across edge proxies', author: 'a.petrov', duration: '0m 58s', status: 'Running', ago: '1m ago' },
  { sha: '2a6f80d', branch: 'release/v4', message: 'feat(billing): prorate mid-cycle seat upgrades in ledger', author: 'l.garcia', duration: '1m 54s', status: 'Passed', ago: '1h ago' },
];

export function Data13() {
  const [branch, setBranch] = useState<BranchFilter>('All');
  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  const visible =
    branch === 'All' ? BUILDS : BUILDS.filter((b) => b.branch === branch);

  const handleCopy = (sha: string) => {
    setCopiedSha(sha);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(sha).catch(() => {});
    }
  };

  return (
    <section
      aria-label="Dark Git and CI pipeline activity log"
      className="rounded-xl border border-slate-800 bg-[#0D1117] text-slate-200 overflow-hidden"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-3">
        <h3 className="text-xs font-semibold text-white">CI Pipeline Activity</h3>
        <div role="group" aria-label="Filter commits by branch" className="flex items-center gap-1">
          {(['All', 'main', 'release/v4'] as BranchFilter[]).map((b) => (
            <button
              key={b}
              type="button"
              aria-pressed={branch === b}
              onClick={() => setBranch(b)}
              className={`rounded px-2 py-1 font-mono text-[11px] transition-colors whitespace-nowrap shrink-0 ${
                branch === b
                  ? 'bg-slate-800 text-sky-300'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <ul className="divide-y divide-slate-800/70">
        {visible.map((item) => {
          const isCopied = copiedSha === item.sha;
          return (
            <li
              key={item.sha}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 text-xs hover:bg-slate-900/50"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <GitCommitHorizontal className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                <div className="min-w-0">
                  <div className="truncate font-medium text-slate-100">{item.message}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 font-mono text-[11px] text-slate-400">
                    <span className="text-sky-400">{item.branch}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.author}</span>
                    <span aria-hidden="true">·</span>
                    <span>{item.ago}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-medium whitespace-nowrap ${
                    item.status === 'Passed'
                      ? 'text-emerald-400'
                      : item.status === 'Failed'
                        ? 'text-rose-400'
                        : 'text-amber-300'
                  }`}
                >
                  {item.status === 'Passed' && <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />}
                  {item.status === 'Failed' && <XCircle className="h-3.5 w-3.5" aria-hidden="true" />}
                  {item.status === 'Running' && <Loader className="h-3.5 w-3.5" aria-hidden="true" />}
                  {item.status}
                </span>

                <span className="font-mono text-[11px] text-slate-400 tabular-nums w-12 text-right">
                  {item.duration}
                </span>

                <button
                  type="button"
                  aria-label={`Copy commit SHA ${item.sha}`}
                  onClick={() => handleCopy(item.sha)}
                  className="inline-flex items-center gap-1 rounded border border-slate-700 bg-slate-900 px-2 py-1 font-mono text-[11px] text-slate-300 hover:border-slate-600 hover:text-white whitespace-nowrap shrink-0"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" aria-hidden="true" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" aria-hidden="true" />
                      {item.sha}
                    </>
                  )}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
