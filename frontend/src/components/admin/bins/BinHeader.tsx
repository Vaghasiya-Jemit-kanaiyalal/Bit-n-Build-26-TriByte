import React, { useState } from 'react';
import { Plus, Upload, RefreshCw } from 'lucide-react';

interface BinHeaderProps {
  onAddBin: () => void;
  onImportBins: () => void;
  onRefresh: () => Promise<void>;
  lastUpdatedText: string;
}

export const BinHeader: React.FC<BinHeaderProps> = ({
  onAddBin,
  onImportBins,
  onRefresh,
  lastUpdatedText,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200">
      <div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          <span>ADMIN</span>
          <span>/</span>
          <span>OPERATIONS</span>
          <span>/</span>
          <span className="text-[#047857]">BINS</span>
        </div>

        {/* Title & Subtitle */}
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight m-0">
            Bin Management
          </h1>
          <span className="bg-emerald-50 text-[#047857] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-200">
            Network Operations
          </span>
        </div>

        <p className="text-xs text-slate-500 font-medium mt-1 m-0">
          Monitor smart bins, fill levels, collection status and predicted overflow across all operational zones.
        </p>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="text-[11px] text-slate-400 font-mono hidden xl:inline-block mr-1">
          Updated {lastUpdatedText}
        </span>

        {/* Refresh Button */}
        <button
          onClick={handleRefreshClick}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-2 bg-white text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 shadow-xs cursor-pointer transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#047857]' : 'text-slate-500'}`} />
          <span>Refresh</span>
        </button>

        {/* Import CSV Button */}
        <button
          onClick={onImportBins}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 shadow-xs cursor-pointer transition-all"
        >
          <Upload className="w-3.5 h-3.5 text-slate-600" />
          <span>Import</span>
        </button>

        {/* Add Bin Primary Action */}
        <button
          onClick={onAddBin}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#064e3b] text-white hover:bg-[#047857] rounded-xl text-xs font-bold shadow-md cursor-pointer transition-all border-none"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bin</span>
        </button>
      </div>
    </div>
  );
};
