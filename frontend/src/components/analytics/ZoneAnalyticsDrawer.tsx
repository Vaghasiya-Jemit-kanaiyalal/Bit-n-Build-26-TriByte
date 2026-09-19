import React, { useEffect } from 'react';
import { X, MapPin, AlertTriangle, ArrowUpRight } from 'lucide-react';
import type { ZoneAnalyticsItem } from '../../mock/analyticsMockData';

interface ZoneAnalyticsDrawerProps {
  zone: ZoneAnalyticsItem | null;
  onClose: () => void;
  onNavigateToBins?: () => void;
}

export const ZoneAnalyticsDrawer: React.FC<ZoneAnalyticsDrawerProps> = ({
  zone,
  onClose,
  onNavigateToBins,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && zone) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zone, onClose]);

  if (!zone) return null;

  return (
    <div
      className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all duration-200 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg md:max-w-xl bg-white rounded-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 text-xs text-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#e5e7eb] flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-100 text-[#047857] rounded-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 m-0 leading-tight">
                {zone.name}
              </h2>
              <span className="text-[11px] font-mono text-slate-500">{zone.id} &bull; 30-Day Telemetry</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors border-none bg-transparent cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Daily Output</span>
              <strong className="text-base font-black font-mono text-slate-900">{zone.wastePerDay} t/day</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Average Fill</span>
              <strong className="text-base font-black font-mono text-slate-900">{zone.averageFill}%</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Overflow Events</span>
              <strong className="text-base font-black font-mono text-amber-700">{zone.overflowEvents}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Bins</span>
              <strong className="text-base font-black font-mono text-slate-900">{zone.totalBins} Bins</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Collections</span>
              <strong className="text-base font-black font-mono text-slate-900">{zone.collectionsCount}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">On-Time SLA</span>
              <strong className="text-base font-black font-mono text-emerald-700">{zone.onTimeRate}%</strong>
            </div>
          </div>

          {/* Top High-Fill Bins Requiring Attention */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Top High-Fill Bins in {zone.name}</span>
            </h3>

            <div className="space-y-2">
              {zone.topBins.map((bin) => (
                <div key={bin.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-slate-900 text-xs">{bin.id}</span>
                      <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.2 rounded">
                        {bin.currentFill}% Fill
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 mt-0.5 block">{bin.location}</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-amber-700 font-bold block">
                      Overflow in ~{bin.predictedOverflowHours}h
                    </span>
                    <button
                      onClick={() => onNavigateToBins && onNavigateToBins()}
                      className="text-[11px] font-bold text-[#047857] hover:underline cursor-pointer bg-transparent border-none mt-1"
                    >
                      View Bin &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zone Operational Status Summary */}
          <div className="p-4 bg-slate-900 text-white rounded-xl">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Operational Zone Status
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed m-0">
              {zone.status === 'Critical'
                ? 'High collection volume detected. Industrial compactor frequency should be increased during peak morning hours to prevent overflow incidents.'
                : 'Zone is operating within acceptable threshold limits. Regular route schedule maintained.'}
            </p>
          </div>

        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-[#e5e7eb] bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 text-xs font-bold text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            Close
          </button>

          {onNavigateToBins && (
            <button
              onClick={() => {
                onClose();
                onNavigateToBins();
              }}
              className="px-4 py-2 bg-[#064e3b] hover:bg-[#047857] text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer border-none flex items-center space-x-1"
            >
              <span>View Zone Bins</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ZoneAnalyticsDrawer;
