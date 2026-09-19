import React from 'react';
import { X, MapPin, Trash2, CheckCircle2, Recycle, AlertTriangle, TrendingUp } from 'lucide-react';
import type { ZoneItem } from '../../../services/areaAnalysisService';

interface ZoneDetailsDrawerProps {
  zone: ZoneItem | null;
  onClose: () => void;
}

export const ZoneDetailsDrawer: React.FC<ZoneDetailsDrawerProps> = ({ zone, onClose }) => {
  if (!zone) return null;

  const maxTrendWaste = Math.max(...zone.shortTrend.map((t) => t.waste), 10);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto animate-in slide-in-from-right duration-200">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{zone.name} Zone Analytics</h3>
                <span className="text-xs text-slate-400 font-medium">Sector ID: {zone.id}</span>
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

          {/* 4 Required Drawer Metric Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold mb-1">
                <Trash2 className="w-3.5 h-3.5 text-slate-600" /> Waste Generated
              </div>
              <div className="text-lg font-black text-slate-900">{zone.totalWasteTons} Tons</div>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Collection Efficiency
              </div>
              <div className="text-lg font-black text-emerald-900">{zone.collectionEfficiency}%</div>
            </div>

            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-blue-700 font-bold mb-1">
                <Recycle className="w-3.5 h-3.5 text-blue-600" /> Recycling Rate
              </div>
              <div className="text-lg font-black text-blue-900">{zone.recyclingRate}%</div>
            </div>

            <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Overflow Rate
              </div>
              <div className="text-lg font-black text-amber-900">{zone.overflowRate}%</div>
            </div>
          </div>

          {/* Sector Asset Summary */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 mb-6 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 font-bold block">Smart Bins Active</span>
              <span className="text-sm font-black text-slate-900">{zone.activeBinsCount} Bins</span>
            </div>
            <div className="h-8 border-r border-slate-200" />
            <div>
              <span className="text-slate-500 font-bold block">Fleet Trucks Assigned</span>
              <span className="text-sm font-black text-slate-900">{zone.activeVehiclesCount} Trucks</span>
            </div>
          </div>

          {/* Short Generation Trend Line/Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> 7-Day Waste Trend
              </span>
              <span className="text-slate-400 font-medium">Daily Tons</span>
            </div>

            <div className="h-28 flex items-end justify-between gap-2 pt-2 border-b border-slate-100">
              {zone.shortTrend.map((st, i) => {
                const barH = (st.waste / maxTrendWaste) * 80;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      style={{ height: `${Math.max(12, barH)}px` }}
                      className="w-full bg-emerald-600 rounded-t-xs"
                    />
                    <span className="text-[10px] font-bold text-slate-500">{st.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full mt-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer border-none"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
};

export default ZoneDetailsDrawer;
