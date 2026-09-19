import React, { useEffect } from 'react';
import { X, Sparkles, MapPin, Clock, CalendarCheck, Trash2 } from 'lucide-react';
import type { ZoneForecastItem } from '../../../types/prediction';

interface ZonePredictionDrawerProps {
  zone: ZoneForecastItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
}

export const ZonePredictionDrawer: React.FC<ZonePredictionDrawerProps> = ({
  zone,
  isOpen,
  onClose,
  onNavigate,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !zone) return null;

  return (
    <div
      className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 text-xs text-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-extrabold text-xs">
              <MapPin className="w-4 h-4 text-blue-700" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-slate-900">{zone.zone} Zone</span>
              <span className="text-xs text-slate-500 font-medium">Zone Demand Forecast Analysis</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer border-none bg-transparent"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 flex-1">
          {/* Metrics Overview Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">Current Waste</span>
              <span className="text-2xl font-mono font-extrabold text-slate-900 block mt-1">{zone.currentWasteTons} t</span>
            </div>
            <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200">
              <span className="text-[10px] uppercase font-bold text-emerald-800">Predicted Waste</span>
              <span className="text-2xl font-mono font-extrabold text-emerald-900 block mt-1">{zone.predictedWasteTons} t</span>
              <span className="text-[10px] text-emerald-700 font-bold">+{zone.changePercentage}% expected</span>
            </div>
          </div>

          {/* AI Recommendation Banner */}
          <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-100 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>AI Recommendation</span>
              </span>
              <span className="text-[9px] uppercase font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                Simulated
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">{zone.recommendation}</p>
          </div>

          {/* Peak Demand & Risk Bins */}
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Peak Demand Window:</span>
              </span>
              <span className="text-xs font-extrabold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-md">
                {zone.peakDemandWindow}
              </span>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-900 block mb-2">Waste Composition Forecast</span>
              <div className="space-y-1.5">
                {zone.wasteComposition.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-600 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.type}</span>
                    </span>
                    <span className="font-bold text-slate-900">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-900 block mb-2">Top Risk Bins in {zone.zone}</span>
              <div className="flex flex-wrap gap-1.5">
                {zone.topRiskBins.map((b, i) => (
                  <span key={i} className="px-2 py-1 bg-red-100 text-red-800 font-mono font-bold text-xs rounded-md">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              onClose();
              onNavigate('/admin/bins');
            }}
            className="py-2.5 bg-white text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold border border-slate-200 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5 text-slate-500" />
            <span>View Bins</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onNavigate('/admin/planning');
            }}
            className="py-2.5 bg-[#064e3b] text-white hover:bg-[#047857] rounded-xl text-xs font-bold shadow-sm cursor-pointer border-none flex items-center justify-center gap-1.5"
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>View Planning</span>
          </button>
        </div>
      </div>
    </div>
  );
};
