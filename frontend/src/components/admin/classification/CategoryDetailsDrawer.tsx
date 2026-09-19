import React from 'react';
import type { WasteCategoryItem } from '../../../types/classification';
import { X, CheckCircle2, XCircle, TrendingUp, Layers, MapPin, ArrowRight } from 'lucide-react';

interface CategoryDetailsDrawerProps {
  category: WasteCategoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const CategoryDetailsDrawer: React.FC<CategoryDetailsDrawerProps> = ({
  category,
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  if (!isOpen || !category) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="w-4 h-4 rounded-full shadow-xs"
              style={{ backgroundColor: category.color }}
            />
            <h2 className="text-sm font-bold text-slate-900">{category.name} Intelligence</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Hero Metrics Card */}
          <div className="bg-slate-900 text-white rounded-xl p-4 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Classified</span>
                <span className="text-2xl font-extrabold text-white font-mono">{category.weightTons} Tons</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Share of Stream</span>
                <span className="text-2xl font-extrabold text-emerald-400 font-mono">{category.percentage}%</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div>Total Scans: <span className="font-bold text-white">{category.itemsCount.toLocaleString()}</span></div>
              <div>Avg AI Confidence: <span className="font-bold text-emerald-400">{category.avgConfidence}%</span></div>
            </div>
          </div>

          {/* Recyclability & Status */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-200">
              <Layers className="w-3.5 h-3.5 text-slate-500" /> Material Attributes & Recyclability
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Recyclable Stream:</span>
                {category.isRecyclable ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Yes (100% Recyclable)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 mt-1">
                    <XCircle className="w-4 h-4 text-slate-400" /> No (Landfill/Compost)
                  </span>
                )}
              </div>

              <div>
                <span className="text-slate-400 block text-[11px]">Weekly Trend:</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 mt-1 font-mono">
                  <TrendingUp className="w-4 h-4 text-emerald-600" /> {category.trend}
                </span>
              </div>
            </div>
          </div>

          {/* Top Zones & Top Bins */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <MapPin className="w-3.5 h-3.5 text-slate-500" /> Top Generating Zones & Hotspots
            </h4>

            <div className="space-y-2 font-mono">
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-medium">Primary Zone: {category.topZone}</span>
                <span className="font-bold text-slate-900">42% of category</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-medium">Secondary Zone: Residential Zone</span>
                <span className="font-bold text-slate-900">28% of category</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-700 font-medium">Top Hotspot Bin: BIN-C-104</span>
                <span className="font-bold text-emerald-700">0.82t collected</span>
              </div>
            </div>
          </div>

          {/* AI Notes */}
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 space-y-1 text-emerald-950">
            <span className="font-bold block text-xs">AI Classification Note:</span>
            <p className="text-[11px] leading-relaxed text-emerald-900">
              High confidence detections (&gt;95%) for {category.name} are primarily driven by optical reflectance sensors and high-resolution camera feeds located in {category.topZone}.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
          <button
            onClick={() => {
              onClose();
              onNavigateTab('Zone Analysis');
            }}
            className="flex-1 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors text-center"
          >
            Zone Analysis
          </button>

          <button
            onClick={() => {
              onClose();
              onNavigateTab('Classification History');
            }}
            className="flex-1 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm"
          >
            <span>View History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
