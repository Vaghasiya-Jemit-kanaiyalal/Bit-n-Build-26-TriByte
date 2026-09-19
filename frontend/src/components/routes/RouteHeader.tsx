import React from 'react';
import { Plus, Download, RefreshCw } from 'lucide-react';

interface RouteHeaderProps {
  onCreateClick: () => void;
  onRefreshClick: () => void;
  isRefreshing?: boolean;
}

export const RouteHeader: React.FC<RouteHeaderProps> = ({
  onCreateClick,
  onRefreshClick,
  isRefreshing = false,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#e5e7eb]">
      {/* Left: Breadcrumbs & Heading */}
      <div className="flex flex-col">
        <div className="text-[11px] font-mono tracking-wider text-[#888680] uppercase mb-1 flex items-center gap-1.5">
          <span>ADMIN</span>
          <span>/</span>
          <span>OPERATIONS</span>
          <span>/</span>
          <span className="text-[#738a62] font-semibold">ROUTE</span>
        </div>
        <h1 className="text-2xl font-bold text-[#1f2937] tracking-tight m-0">
          Collection Routes
        </h1>
        <p className="text-xs text-[#6b7280] font-medium mt-0.5">
          Plan, monitor and manage optimized waste-collection routes.
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onRefreshClick}
          disabled={isRefreshing}
          title="Refresh Data"
          className="p-2 text-[#4b5563] hover:text-[#111827] bg-white border border-[#d1d5db] rounded-md shadow-xs hover:bg-[#f9fafb] cursor-pointer transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#738a62]' : ''}`} />
        </button>

        <button
          onClick={() => alert('Import Route feature: Upload CSV/JSON route manifest.')}
          className="px-3.5 py-2 text-xs font-semibold text-[#374151] bg-white hover:bg-[#f9fafb] border border-[#d1d5db] rounded-md shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-[#6b7280]" />
          <span>Import Route</span>
        </button>

        <button
          onClick={onCreateClick}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#738a62] hover:bg-[#5f7350] border border-transparent rounded-md shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create Route</span>
        </button>
      </div>
    </div>
  );
};
