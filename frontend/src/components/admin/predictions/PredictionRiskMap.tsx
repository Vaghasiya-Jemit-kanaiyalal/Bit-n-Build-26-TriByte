import React, { useState } from 'react';
import { MapPin, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import type { FillForecastBin } from '../../../types/prediction';

interface PredictionRiskMapProps {
  bins: FillForecastBin[];
  onSelectBin: (bin: FillForecastBin) => void;
}

export const PredictionRiskMap: React.FC<PredictionRiskMapProps> = ({ bins, onSelectBin }) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedZoneFilter, setSelectedZoneFilter] = useState<string>('All');

  const filteredBins = selectedZoneFilter === 'All'
    ? bins
    : bins.filter((b) => b.zone.toLowerCase() === selectedZoneFilter.toLowerCase());

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      {/* Map Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#047857]" />
          <h3 className="text-sm font-bold text-slate-900 m-0">Predicted Overflow Risk Map</h3>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedZoneFilter}
            onChange={(e) => setSelectedZoneFilter(e.target.value)}
            className="text-[11px] font-bold bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">All Zones</option>
            <option value="Central">Central</option>
            <option value="Residential">Residential</option>
            <option value="South">South</option>
            <option value="Industrial">Industrial</option>
          </select>

          <div className="flex items-center bg-slate-100 rounded-lg border border-slate-200 p-0.5">
            <button
              onClick={() => setZoomLevel(Math.min(zoomLevel + 0.2, 1.6))}
              className="p-1 hover:bg-slate-200 rounded cursor-pointer border-none bg-transparent"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5 text-slate-600" />
            </button>
            <button
              onClick={() => setZoomLevel(Math.max(zoomLevel - 0.2, 0.8))}
              className="p-1 hover:bg-slate-200 rounded cursor-pointer border-none bg-transparent"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5 text-slate-600" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 hover:bg-slate-200 rounded cursor-pointer border-none bg-transparent"
              title="Reset View"
            >
              <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Map Graphic Canvas */}
      <div className="relative w-full h-64 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center p-4">
        {/* Background Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20 transition-transform duration-300"
          style={{
            backgroundImage: `radial-gradient(#334155 1.5px, transparent 1.5px)`,
            backgroundSize: '20px 20px',
            transform: `scale(${zoomLevel})`,
          }}
        />

        {/* Zone Outlines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ transform: `scale(${zoomLevel})` }}>
          <rect x="5%" y="10%" width="35%" height="75%" fill="rgba(16, 185, 129, 0.05)" stroke="rgba(16, 185, 129, 0.2)" strokeWidth="1.5" rx="12" />
          <text x="7%" y="18%" fill="#10b981" fontSize="10" fontWeight="bold" opacity="0.6">CENTRAL ZONE</text>

          <rect x="45%" y="10%" width="45%" height="35%" fill="rgba(59, 130, 246, 0.05)" stroke="rgba(59, 130, 246, 0.2)" strokeWidth="1.5" rx="12" />
          <text x="47%" y="18%" fill="#3b82f6" fontSize="10" fontWeight="bold" opacity="0.6">RESIDENTIAL ZONE</text>

          <rect x="45%" y="50%" width="45%" height="40%" fill="rgba(245, 158, 11, 0.05)" stroke="rgba(245, 158, 11, 0.2)" strokeWidth="1.5" rx="12" />
          <text x="47%" y="58%" fill="#f59e0b" fontSize="10" fontWeight="bold" opacity="0.6">SOUTH & INDUSTRIAL</text>
        </svg>

        {/* Interactive Bin Risk Pins */}
        <div className="absolute inset-0 w-full h-full transition-transform duration-300" style={{ transform: `scale(${zoomLevel})` }}>
          {filteredBins.map((bin) => {
            let color = 'bg-emerald-500';
            if (bin.risk === 'CRITICAL') color = 'bg-red-600 animate-bounce';
            else if (bin.risk === 'HIGH') color = 'bg-amber-500';
            else if (bin.risk === 'MEDIUM') color = 'bg-yellow-400';

            return (
              <button
                key={bin.id}
                onClick={() => onSelectBin(bin)}
                style={{ left: `${bin.coordinates.x}%`, top: `${bin.coordinates.y}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer border-none bg-transparent"
              >
                <div className={`px-2 py-0.5 rounded-full text-white text-[10px] font-extrabold shadow-lg flex items-center gap-1 border border-white/40 ${color}`}>
                  <span>{bin.binCode}</span>
                  <span className="opacity-80">({bin.predicted24h}%)</span>
                </div>

                {/* Hover Card */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 w-48 bg-slate-900 text-white rounded-lg p-2 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 text-[11px] text-left border border-slate-700">
                  <div className="font-bold text-emerald-400">{bin.location}</div>
                  <div className="text-[10px] text-slate-300 mt-0.5">Current: {bin.currentFill}% &bull; 24h: {bin.predicted24h}%</div>
                  <div className="text-[10px] text-red-400 font-bold mt-0.5">Overflow ETA: {bin.timeToOverflow}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Map Risk Legend */}
      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
          <span>Critical Risk (&gt;90%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>High Risk (80-90%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
          <span>Medium (70-80%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Low Risk (&lt;70%)</span>
        </div>
      </div>
    </div>
  );
};
