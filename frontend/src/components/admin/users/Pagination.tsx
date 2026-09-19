import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalUsers: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalUsers,
  onPageChange,
  onPageSizeChange,
}) => {
  const startIdx = totalUsers === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endIdx = Math.min(currentPage * pageSize, totalUsers);

  // Generate visible page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-slate-200 rounded-lg p-3 px-4 shadow-sm text-xs text-slate-600">
      {/* Items count & Per Page selector */}
      <div className="flex items-center gap-4">
        <span className="font-mono text-slate-700">
          Showing <span className="font-semibold text-slate-900">{startIdx}</span>–
          <span className="font-semibold text-slate-900">{endIdx}</span> of{' '}
          <span className="font-semibold text-slate-900">{totalUsers}</span> users
        </span>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
          <label htmlFor="rowsPerPage" className="text-slate-500 font-medium">
            Rows per page:
          </label>
          <select
            id="rowsPerPage"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, idx) => {
            if (typeof page === 'string') {
              return (
                <span key={idx} className="px-2 py-1 text-slate-400 font-mono">
                  ...
                </span>
              );
            }
            const isCurrent = page === currentPage;
            return (
              <button
                key={idx}
                onClick={() => onPageChange(page)}
                className={`w-7 h-7 font-mono font-medium rounded text-xs transition-colors flex items-center justify-center ${
                  isCurrent
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 transition-colors"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
