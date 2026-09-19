import React from 'react';
import { Eye, Download, Trash2, CheckCircle2, RefreshCw } from 'lucide-react';
import type { RecentReportItem } from '../../../services/reportsService';

interface RecentReportsTableProps {
  reports: RecentReportItem[];
  onPreview: (report: RecentReportItem) => void;
  onDownload: (report: RecentReportItem) => void;
  onDelete: (reportId: string) => void;
}

export const RecentReportsTable: React.FC<RecentReportsTableProps> = ({
  reports,
  onPreview,
  onDownload,
  onDelete,
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Recent Generated Reports</h3>
          <p className="text-xs text-slate-500">History of generated analytical packages and downloadable archives</p>
        </div>
        <span className="text-xs font-semibold text-slate-400">{reports.length} Archived Packages</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
              <th className="pb-3 px-2">Report Title</th>
              <th className="pb-3 px-2">Type</th>
              <th className="pb-3 px-2">Date Range</th>
              <th className="pb-3 px-2">Created At</th>
              <th className="pb-3 px-2 text-center">Status</th>
              <th className="pb-3 px-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reports.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-2">
                  <div className="font-bold text-slate-900">{item.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    ID: {item.id} • {item.fileFormat} ({item.fileSizeMb} MB)
                  </div>
                </td>
                <td className="py-3 px-2">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    {item.type}
                  </span>
                </td>
                <td className="py-3 px-2 font-medium text-slate-600">{item.dateRange}</td>
                <td className="py-3 px-2 text-slate-500 font-medium">{item.createdAt}</td>
                <td className="py-3 px-2 text-center">
                  {item.status === 'READY' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> READY
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                      <RefreshCw className="w-3 h-3 animate-spin" /> GENERATING
                    </span>
                  )}
                </td>
                <td className="py-3 px-2 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => onPreview(item)}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold transition-all cursor-pointer border-none"
                      title="Preview Report"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDownload(item)}
                      className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold transition-all cursor-pointer border-none"
                      title="Download Package"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-bold transition-all cursor-pointer border-none"
                      title="Delete Report"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentReportsTable;
