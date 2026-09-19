import React from 'react';
import { FileText, RefreshCw } from 'lucide-react';

interface ReportsHeaderProps {
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const ReportsHeader: React.FC<ReportsHeaderProps> = ({ onRefresh, isRefreshing = false }) => {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-5 mb-6 shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Reports Generator & Archive</h1>
          </div>
          <p className="text-xs font-semibold text-slate-500">
            Generate executive compliance summaries, export CSV data packages, and manage archived reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-slate-600' : 'text-slate-500'}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh Archive'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportsHeader;
