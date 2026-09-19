import React from 'react';
import { MapPin, ChevronRight } from 'lucide-react';
import type { ZoneAnalyticsItem } from '../../mock/analyticsMockData';

interface ZonePerformanceTableProps {
  zones: ZoneAnalyticsItem[];
  onSelectZone: (zone: ZoneAnalyticsItem) => void;
}

export const ZonePerformanceTable: React.FC<ZonePerformanceTableProps> = ({ zones, onSelectZone }) => {
  return (
    <div className="bg-white rounded-xl border border-[#e5e7eb] shadow-2xs p-5 mb-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-900 m-0">Municipal Zone Performance Breakdown</h3>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              7 OPERATIONAL ZONES
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Click any zone row to open deep-dive telemetry drawer & bin overflow predictions
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
              <th className="pb-3 pl-2">Zone Name</th>
              <th className="pb-3">Bins</th>
              <th className="pb-3">Avg Fill</th>
              <th className="pb-3">Waste / Day</th>
              <th className="pb-3">Collections</th>
              <th className="pb-3">Overflows</th>
              <th className="pb-3">On-Time %</th>
              <th className="pb-3 text-center">Status</th>
              <th className="pb-3 text-right pr-2">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {zones.map((zone) => {
              const isCritical = zone.status === 'Critical';
              const isAttention = zone.status === 'Attention';
              const badgeClass = isCritical
                ? 'bg-red-100 text-red-800 border-red-200'
                : isAttention
                ? 'bg-amber-100 text-amber-800 border-amber-200'
                : 'bg-emerald-100 text-emerald-800 border-emerald-200';

              return (
                <tr
                  key={zone.id}
                  onClick={() => onSelectZone(zone)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors group"
                >
                  <td className="py-3 pl-2 font-bold text-slate-900 flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#047857]" />
                    <span>{zone.name}</span>
                  </td>
                  <td className="py-3 font-mono text-slate-600">{zone.totalBins}</td>
                  <td className="py-3 font-mono font-bold text-slate-900">{zone.averageFill}%</td>
                  <td className="py-3 font-mono font-bold text-slate-900">{zone.wastePerDay} t</td>
                  <td className="py-3 font-mono text-slate-600">{zone.collectionsCount}</td>
                  <td className="py-3 font-mono font-bold text-amber-700">{zone.overflowEvents}</td>
                  <td className="py-3 font-mono font-bold text-emerald-700">{zone.onTimeRate}%</td>
                  <td className="py-3 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeClass}`}>
                      {zone.status}
                    </span>
                  </td>
                  <td className="py-3 text-right pr-2">
                    <span className="text-slate-400 group-hover:text-slate-900 transition-colors inline-flex items-center space-x-1 text-xs font-semibold">
                      <span>Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default ZonePerformanceTable;
