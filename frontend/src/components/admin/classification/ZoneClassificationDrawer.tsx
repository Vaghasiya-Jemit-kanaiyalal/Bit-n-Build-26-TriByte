import React from 'react';
import type { ZoneClassification } from '../../../types/classification';
import { X, MapPin, Trash2, Activity, BarChart3, CalendarCheck, Layers } from 'lucide-react';

interface ZoneClassificationDrawerProps {
  zone: ZoneClassification | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateModule: (moduleRoute: string) => void;
}

export const ZoneClassificationDrawer: React.FC<ZoneClassificationDrawerProps> = ({
  zone,
  isOpen,
  onClose,
  onNavigateModule,
}) => {
  if (!isOpen || !zone) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">{zone.zone} Classification Intelligence</h2>
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
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Zone Waste</span>
                <span className="text-2xl font-extrabold text-white font-mono">{zone.totalWasteTons} Tons</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Recyclable Share</span>
                <span className="text-2xl font-extrabold text-emerald-400 font-mono">{zone.recyclablePercent}%</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div>Top Category: <span className="font-bold text-white">{zone.topCategory}</span></div>
              <div>Second: <span className="font-bold text-slate-300">{zone.secondCategory}</span></div>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-200">
              <Layers className="w-3.5 h-3.5 text-slate-500" /> Waste Category Breakdown (Tons)
            </h4>

            <div className="grid grid-cols-3 gap-2 font-mono text-center">
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans">Plastic</span>
                <span className="font-bold text-blue-700 text-sm">{zone.plasticTons}t</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans">Paper</span>
                <span className="font-bold text-amber-700 text-sm">{zone.paperTons}t</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans">Metal</span>
                <span className="font-bold text-slate-700 text-sm">{zone.metalTons}t</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans">Glass</span>
                <span className="font-bold text-purple-700 text-sm">{zone.glassTons}t</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans">Organic</span>
                <span className="font-bold text-emerald-700 text-sm">{zone.organicTons}t</span>
              </div>
              <div className="bg-white p-2 rounded border border-slate-200">
                <span className="text-[10px] text-slate-400 block font-sans">Other</span>
                <span className="font-bold text-red-600 text-sm">{zone.otherTons}t</span>
              </div>
            </div>
          </div>

          {/* Operational Metrics */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 font-mono">
            <div className="flex justify-between items-center text-xs">
              <span className="font-sans text-slate-600">Total Scans:</span>
              <span className="font-bold text-slate-900">{zone.classificationCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-sans text-slate-600">Avg AI Confidence:</span>
              <span className="font-bold text-emerald-700">{zone.avgConfidence}%</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-sans text-slate-600">Pending Reviews:</span>
              <span className="font-bold text-amber-700">{zone.pendingReviews} items</span>
            </div>
          </div>

          {/* Related Modules Navigation Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-200">
              Cross-Module Operations Navigation
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onClose();
                  onNavigateModule('Bins');
                }}
                className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-800 text-xs">View Bins &rarr;</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onNavigateModule('Monitoring');
                }}
                className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-800 text-xs">View Monitoring &rarr;</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onNavigateModule('Analytics');
                }}
                className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <span className="font-bold text-slate-800 text-xs">View Analytics &rarr;</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onNavigateModule('Planning');
                }}
                className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-slate-800 text-xs">View Planning &rarr;</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
