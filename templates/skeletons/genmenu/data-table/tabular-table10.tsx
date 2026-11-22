import { useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ShieldAlert, ShieldCheck, Clock } from 'lucide-react';
import { nextSortConfig, SortConfig, sortRecords } from '../../utils/tableLogic';

interface ComplianceDoc {
  id: string;
  docCode: string;
  title: string;
  jurisdiction: string;
  custodian: string;
  retention: string;
  reviewDate: string;
  status: 'Verified' | 'Expiring' | 'Flagged';
}

const DOCS: ComplianceDoc[] = [
  { id: 'cd1', docCode: 'REG-101', title: 'GDPR Article 30 Processing Record', jurisdiction: 'EU / EEA', custodian: 'Legal Ops', retention: '7 Years', reviewDate: '2027-02-15', status: 'Verified' },
  { id: 'cd2', docCode: 'REG-104', title: 'ISO 27001 Risk Treatment Plan', jurisdiction: 'Global', custodian: 'InfoSec', retention: '5 Years', reviewDate: '2026-12-01', status: 'Expiring' },
  { id: 'cd3', docCode: 'REG-109', title: 'PCI-DSS SAQ-D Merchant Attestation', jurisdiction: 'US / Cards', custodian: 'Payments', retention: '3 Years', reviewDate: '2026-11-10', status: 'Flagged' },
  { id: 'cd4', docCode: 'REG-112', title: 'CCPA Consumer Privacy Notice', jurisdiction: 'California', custodian: 'Privacy', retention: '5 Years', reviewDate: '2027-04-20', status: 'Verified' },
  { id: 'cd5', docCode: 'REG-118', title: 'HIPAA Business Associate Agreement', jurisdiction: 'US Health', custodian: 'Enterprise', retention: '6 Years', reviewDate: '2027-01-09', status: 'Verified' },
  { id: 'cd6', docCode: 'REG-121', title: 'Vendor Subprocessor Register', jurisdiction: 'Global', custodian: 'Procurement', retention: '5 Years', reviewDate: '2026-12-12', status: 'Expiring' },
  { id: 'cd7', docCode: 'REG-127', title: 'Incident Response Tabletop Log', jurisdiction: 'Global', custodian: 'SRE / SecOps', retention: '4 Years', reviewDate: '2027-03-01', status: 'Verified' },
  { id: 'cd8', docCode: 'REG-130', title: 'Biometric Data Retention Policy', jurisdiction: 'Illinois', custodian: 'Legal Ops', retention: '3 Years', reviewDate: '2026-11-05', status: 'Flagged' },
];

export function Table10() {
  const [sort, setSort] = useState<SortConfig<keyof ComplianceDoc & string>>({ key: 'docCode', direction: 'ascending' });
  const sorted = sortRecords(DOCS, sort);

  const renderSortIcon = (key: keyof ComplianceDoc & string) => {
    if (sort.key !== key || sort.direction === 'none') return <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />;
    return sort.direction === 'ascending' ? <ArrowUp className="h-3.5 w-3.5 text-teal-700" /> : <ArrowDown className="h-3.5 w-3.5 text-teal-700" />;
  };

  const renderStatus = (status: ComplianceDoc['status']) => {
    if (status === 'Verified') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 border border-emerald-200">
          <ShieldCheck className="h-3 w-3" /> Verified
        </span>
      );
    }
    if (status === 'Expiring') {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 border border-amber-200">
          <Clock className="h-3 w-3" /> Expiring
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-medium text-rose-800 border border-rose-200">
        <ShieldAlert className="h-3 w-3" /> Flagged
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 bg-teal-50/40">
        <h3 className="text-sm font-semibold text-slate-900">Regulatory Compliance Ledger</h3>
        <p className="text-xs text-slate-500 mt-0.5">Sticky header + sticky first column · Scrollable audit viewport</p>
      </div>

      <div className="max-h-64 overflow-auto">
        <table className="w-full min-w-[780px] border-collapse text-left text-sm">
          <thead className="sticky top-0 z-20 bg-slate-100/95 backdrop-blur border-b border-slate-200 text-xs font-semibold text-slate-600">
            <tr>
              <th
                scope="col"
                aria-sort={sort.key === 'docCode' ? sort.direction : 'none'}
                className="sticky left-0 z-30 bg-slate-100 px-4 py-3 border-r border-slate-200"
              >
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'docCode'))} className="inline-flex items-center gap-1.5 hover:text-teal-800 cursor-pointer">
                  Code {renderSortIcon('docCode')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'title' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'title'))} className="inline-flex items-center gap-1.5 hover:text-teal-800 cursor-pointer">
                  Document Title {renderSortIcon('title')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'jurisdiction' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'jurisdiction'))} className="inline-flex items-center gap-1.5 hover:text-teal-800 cursor-pointer">
                  Jurisdiction {renderSortIcon('jurisdiction')}
                </button>
              </th>
              <th scope="col" className="px-4 py-3">Custodian</th>
              <th scope="col" className="px-4 py-3">Retention</th>
              <th scope="col" aria-sort={sort.key === 'status' ? sort.direction : 'none'} className="px-4 py-3">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'status'))} className="inline-flex items-center gap-1.5 hover:text-teal-800 cursor-pointer">
                  Status {renderSortIcon('status')}
                </button>
              </th>
              <th scope="col" aria-sort={sort.key === 'reviewDate' ? sort.direction : 'none'} className="px-4 py-3 text-right">
                <button type="button" onClick={() => setSort((p) => nextSortConfig(p, 'reviewDate'))} className="inline-flex items-center justify-end gap-1.5 hover:text-teal-800 cursor-pointer">
                  Next Review {renderSortIcon('reviewDate')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sorted.map((doc) => (
              <tr key={doc.id} className="group hover:bg-teal-50/30">
                <td className="sticky left-0 z-10 bg-white group-hover:bg-teal-50/40 px-4 py-3 font-mono text-xs font-semibold text-teal-800 border-r border-slate-100">
                  {doc.docCode}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">{doc.title}</td>
                <td className="px-4 py-3 text-xs text-slate-600">{doc.jurisdiction}</td>
                <td className="px-4 py-3 text-xs text-slate-600">{doc.custodian}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{doc.retention}</td>
                <td className="px-4 py-3">{renderStatus(doc.status)}</td>
                <td className="px-4 py-3 text-right font-mono text-xs text-slate-600 tabular-nums">{doc.reviewDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
