import React from 'react';
import { UserPlus, Download, RefreshCw, UploadCloud } from 'lucide-react';

interface UsersHeaderProps {
  onAddUser?: () => void;
  onImport?: () => void;
  onExport?: () => void;
  onRefresh?: () => void;
}

export const UsersHeader: React.FC<UsersHeaderProps> = ({
  onAddUser,
  onImport,
  onExport,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
      {/* Title & Subtitle */}
      <div>
        <div className="flex items-center gap-2 text-[11px] font-extrabold text-slate-400 tracking-wider uppercase mb-1">
          <span>ADMIN</span>
          <span>/</span>
          <span>MANAGEMENT</span>
          <span>/</span>
          <span className="text-emerald-700">USERS</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight m-0">
          User Management & Workforce Control
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Manage platform access, operational roles, security credentials, and workforce assignments.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center border-none cursor-pointer"
            title="Refresh Users List"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        {onImport && (
          <button
            onClick={onImport}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border-none cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Import</span>
          </button>
        )}

        {onExport && (
          <button
            onClick={onExport}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border-none cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        )}

        {onAddUser && (
          <button
            type="button"
            id="add-user-btn"
            onClick={onAddUser}
            className="px-4 py-2 bg-[#047857] hover:bg-[#064e3b] text-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-2 border-none cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add User</span>
          </button>
        )}
      </div>
    </div>
  );
};
