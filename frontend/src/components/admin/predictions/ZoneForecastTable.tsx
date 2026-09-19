import React from 'react';
import { Eye } from 'lucide-react';
import type { ZoneForecastItem } from '../../../types/prediction';

interface ZoneForecastTableProps {
  zones: ZoneForecastItem[];
  onSelectZone: (zone: ZoneForecastItem) => void;
}

export const ZoneForecastTable: React.FC<ZoneForecastTableProps> = ({ zones, onSelectZone }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 m-0">Municipal Zone Waste Forecast Breakdown</h3>
        <span className="text-xs text-slate-500 font-semibold">{zones.length} Active Zones</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <th className="py-3 px-4">Zone</th>
              <th className="py-3 px-4">Current Waste</th>
              <th className="py-3 px-4">Predicted Waste</th>
              <th className="py-3 px-4">Expected Change</th>
              <th className="py-3 px-4">Bins at Risk</th>
              <th className="py-3 px-4">Overflow Events</th>
              <th className="py-3 px-4">Collection Demand</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {zones.map((item) => {
              let badge = 'bg-emerald-100 text-emerald-800';
              if (item.status === 'CRITICAL') badge = 'bg-red-100 text-red-800 font-extrabold';
              else if (item.status === 'HIGH') badge = 'bg-amber-100 text-amber-800 font-bold';
              else if (item.status === 'MEDIUM') badge = 'bg-yellow-100 text-yellow-800 font-bold';

              return (
                <tr key={item.zone} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-900">{item.zone} Zone</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{item.currentWasteTons} t</td>
                  <td className="py-3 px-4 font-mono font-extrabold text-emerald-800">{item.predictedWasteTons} t</td>
                  <td className="py-3 px-4 font-bold text-emerald-600">+{item.changePercentage}%</td>
                  <td className="py-3 px-4 font-bold text-amber-700">{item.binsAtRisk}</td>
                  <td className="py-3 px-4 font-bold text-red-600">{item.expectedOverflowCount}</td>
                  <td className="py-3 px-4 font-bold text-blue-700">{item.collectionDemandBins} bins</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-600">{item.confidence}%</td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] uppercase px-2 py-0.5 rounded-md ${badge}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSelectZone(item)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer flex items-center gap-1 shadow-xs ml-auto"
                    >
                      <Eye className="w-3 h-3 text-slate-500" />
                      <span>Inspect</span>
                    </button>
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
