import React, { useState } from 'react';
import type { FillForecastBin } from '../../../types/prediction';
import { UnifiedGisMap } from '../../common/UnifiedGisMap';

interface PredictionRiskMapProps {
  bins: FillForecastBin[];
  onSelectBin: (bin: FillForecastBin) => void;
}

export const PredictionRiskMap: React.FC<PredictionRiskMapProps> = ({ bins, onSelectBin }) => {
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('All');

  const zoneNameDisplay = selectedZoneFilter !== 'All' ? selectedZoneFilter : 'Predicted Risk Zone';

  return (
    <div className="flex flex-col gap-3">
      {/* Zone Selector Filter */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs text-white">
        <span className="font-extrabold text-slate-300">Overflow Prediction Filter:</span>
        <select
          value={selectedZoneFilter}
          onChange={(e) => setSelectedZoneFilter(e.target.value)}
          className="text-xs font-bold bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none cursor-pointer"
        >
          <option value="All">All Risk Zones</option>
          <option value="Academic Block">Academic Block</option>
          <option value="Hostel Zone">Hostel Zone</option>
          <option value="Cafeteria Sector">Cafeteria Sector</option>
          <option value="Logistics Park">Logistics Park</option>
        </select>
      </div>

      <div className="w-full h-full min-h-[460px]">
        <UnifiedGisMap
          zoneName={zoneNameDisplay}
          stepIntervalMs={60000}
          onSelectBin={(wp) => {
            const matched = bins.find((b) => b.binCode === wp.code);
            if (matched && onSelectBin) {
              onSelectBin(matched);
            }
          }}
        />
      </div>
    </div>
  );
};

export default PredictionRiskMap;
