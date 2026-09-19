import React from 'react';
import { X, Download, FileText, CheckCircle2 } from 'lucide-react';
import type { RecentReportItem, GeneratedReportPreview } from '../../../services/reportsService';

interface ReportPreviewModalProps {
  report: RecentReportItem | null;
  previewData: GeneratedReportPreview | null;
  onClose: () => void;
  onDownload: (report: RecentReportItem) => void;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  report,
  previewData,
  onClose,
  onDownload,
}) => {
  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{report.title}</h3>
              <p className="text-xs text-slate-500">
                {report.type} • {report.dateRange} • Created {report.createdAt}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer border-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Executive Summary Metrics */}
        {previewData && (
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Executive Key Metrics</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {previewData.summaryMetrics.map((sm, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1">{sm.label}</span>
                  <span className="text-base font-black text-slate-900">{sm.value}</span>
                </div>
              ))}
            </div>

            {/* Key Findings */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Key Audit Findings</h4>
              <div className="space-y-2 bg-emerald-50/50 border border-emerald-100 rounded-xl p-3.5">
                {previewData.keyFindings.map((kf, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{kf}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer border-none"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onDownload(report)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-colors cursor-pointer border-none shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download Package ({report.fileFormat})</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportPreviewModal;
