import React, { useEffect } from 'react';
import { X, History, TrendingUp, CheckCircle } from 'lucide-react';
import type { SmartBin, CollectionHistoryLog } from '../../../types/bin';

interface CollectionHistoryDrawerProps {
  bin: SmartBin | null;
  historyLogs: CollectionHistoryLog[];
  onClose: () => void;
}

export const CollectionHistoryDrawer: React.FC<CollectionHistoryDrawerProps> = ({
  bin,
  historyLogs,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && bin) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bin, onClose]);

  if (!bin) return null;

  const fillPattern = bin.fillPattern7Days || [35, 45, 60, 72, 85, 88, bin.currentFillPercent];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div
      className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all duration-200 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg md:max-w-xl bg-white rounded-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 text-xs text-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* HEADER */}
        <div className="p-5 border-b border-slate-200 flex items-start justify-between bg-slate-50 sticky top-0 bg-white z-10">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <History className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-extrabold text-slate-900 m-0">
                Collection History — {bin.id}
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-medium m-0">
              {bin.address} &bull; {bin.zone}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer border-none bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6 flex-1">
          
          {/* STATS OVERVIEW CARDS */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Collections</span>
              <span className="font-mono font-extrabold text-slate-900 text-base">42</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Avg Interval</span>
              <span className="font-mono font-extrabold text-slate-900 text-base">18.4h</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-center">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Avg Collected</span>
              <span className="font-mono font-extrabold text-emerald-700 text-base">0.81t</span>
            </div>
          </div>

          {/* 7-DAY FILL PATTERN MINI LINE CHART */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                <TrendingUp className="w-4 h-4 text-[#047857]" />
                <span>7-DAY FILL PATTERN TREND</span>
              </div>
              <span className="text-[10px] font-bold text-slate-500">Avg daily increase: +14%</span>
            </div>

            {/* SVG Line Chart */}
            <div className="relative h-32 w-full pt-4">
              <svg className="w-full h-24 overflow-visible">
                {/* Horizontal Grid lines */}
                <line x1="0" y1="0" x2="100%" y2="0" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="0" y1="40" x2="100%" y2="40" stroke="#e2e8f0" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="100%" y2="80" stroke="#e2e8f0" strokeDasharray="3 3" />

                {/* Polyline Path */}
                <polyline
                  fill="none"
                  stroke="#047857"
                  strokeWidth="3"
                  points={fillPattern
                    .map((val: number, idx: number) => {
                      const x = (idx / 6) * 320;
                      const y = 80 - (val / 100) * 80;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />

                {/* Data Dots */}
                {fillPattern.map((val: number, idx: number) => {
                  const x = (idx / 6) * 320;
                  const y = 80 - (val / 100) * 80;
                  return (
                    <circle key={idx} cx={x} cy={y} r="4" fill="#047857" stroke="#ffffff" strokeWidth="2" />
                  );
                })}
              </svg>

              {/* Day Labels */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
                {days.map((d, i) => (
                  <span key={i} className="text-center w-6">{d}</span>
                ))}
              </div>
            </div>
          </div>

          {/* HISTORICAL LOGS TABLE */}
          <div className="space-y-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              PAST COLLECTION EVENTS
            </span>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-400 uppercase">
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Route</th>
                    <th className="p-2.5">Vehicle</th>
                    <th className="p-2.5">Driver</th>
                    <th className="p-2.5 text-right">Waste</th>
                    <th className="p-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {historyLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{log.date}</td>
                      <td className="p-2.5 font-mono text-blue-700">{log.routeId}</td>
                      <td className="p-2.5 font-mono text-slate-800">{log.vehicleId}</td>
                      <td className="p-2.5 text-slate-600">{log.driverName}</td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-700">
                        {log.collectedAmountTons}t
                      </td>
                      <td className="p-2.5 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-200 bg-white sticky bottom-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer border-none"
          >
            Close History
          </button>
        </div>

      </div>
    </div>
  );
};
