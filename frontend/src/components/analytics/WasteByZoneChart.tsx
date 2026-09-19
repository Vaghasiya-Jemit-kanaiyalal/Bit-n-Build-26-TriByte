import React from 'react';
import { MapPin } from 'lucide-react';
import type { ZoneAnalyticsItem } from '../../mock/analyticsMockData';

interface WasteByZoneChartProps {
  zones: ZoneAnalyticsItem[];
  onSelectZone?: (zoneName: string) => void;
}

export const WasteByZoneChart: React.FC<WasteByZoneChartProps> = ({ zones, onSelectZone }) => {
  const maxWaste = Math.max(...zones.map(z => z.wastePerDay));

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 hover:shadow-xs transition-all h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-900 m-0">Waste Generation by Zone</h3>
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              TONS / DAY
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Comparative waste output by municipal operational zone
          </p>
        </div>
      </div>

      {/* Horizontal Bar List */}
      <div className="space-y-3">
        {zones.map((zone) => {
          const percentage = Math.round((zone.wastePerDay / maxWaste) * 100);
          const isHighest = zone.wastePerDay === maxWaste;

          return (
            <div
              key={zone.id}
              onClick={() => onSelectZone && onSelectZone(zone.name)}
              className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center space-x-2">
                  <MapPin className={`w-3.5 h-3.5 ${isHighest ? 'text-red-500' : 'text-slate-400'} group-hover:text-[#047857]`} />
                  <span className="font-bold text-slate-900">{zone.name}</span>
                  {isHighest && (
                    <span className="text-[9px] font-extrabold text-red-700 bg-red-100 px-1.5 py-0.2 rounded uppercase">
                      Highest
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2 font-mono text-xs">
                  <strong className="text-slate-900">{zone.wastePerDay} t/day</strong>
                  <span className="text-slate-400 text-[10px]">({zone.totalBins} Bins)</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isHighest ? 'bg-red-500' : 'bg-[#047857]'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Insight */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Highest: <strong className="text-slate-900">Industrial Zone (2.4t)</strong></span>
        <span>Lowest: <strong className="text-slate-900">South Zone (1.2t)</strong></span>
      </div>

    </div>
  );
};

export default WasteByZoneChart;
