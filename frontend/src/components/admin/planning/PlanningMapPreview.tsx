import React, { useState } from 'react';
import { Map, Navigation, Plus, Minus, Maximize2 } from 'lucide-react';

export const PlanningMapPreview: React.FC = () => {
  const [activeLayers, setActiveLayers] = useState({
    zones: true,
    bins: true,
    vehicles: true,
    routes: true,
  });

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-4 p-6">
      
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900 flex items-center">
            <Map className="w-5 h-5 mr-2 text-emerald-700" />
            Operational Planning Map Preview
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Geospatial visualization of smart bin clusters, zone boundaries, fleet locations, and planned routes.
          </p>
        </div>

        {/* Map Layer Toggles */}
        <div className="flex items-center space-x-2 text-xs">
          <button
            onClick={() => toggleLayer('zones')}
            className={`px-2.5 py-1 rounded-lg font-medium border transition ${
              activeLayers.zones ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            Zones
          </button>
          <button
            onClick={() => toggleLayer('bins')}
            className={`px-2.5 py-1 rounded-lg font-medium border transition ${
              activeLayers.bins ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            Bins
          </button>
          <button
            onClick={() => toggleLayer('vehicles')}
            className={`px-2.5 py-1 rounded-lg font-medium border transition ${
              activeLayers.vehicles ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            Vehicles
          </button>
          <button
            onClick={() => toggleLayer('routes')}
            className={`px-2.5 py-1 rounded-lg font-medium border transition ${
              activeLayers.routes ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            Routes
          </button>
        </div>
      </div>

      {/* SVG Operational Map Display */}
      <div className="relative w-full h-[400px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner flex items-center justify-center">
        
        {/* Map Grid Background lines */}
        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridPattern)" />
        </svg>

        {/* Zone Boundaries */}
        {activeLayers.zones && (
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Central Zone */}
            <polygon points="120,60 380,50 420,240 180,280" fill="rgba(16, 185, 129, 0.08)" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="240" y="160" fill="#34d399" fontSize="12" fontFamily="sans-serif" fontWeight="bold" opacity="0.8">CENTRAL ZONE (High Demand)</text>

            {/* North Zone */}
            <polygon points="400,40 680,30 720,180 440,210" fill="rgba(59, 130, 246, 0.08)" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="520" y="110" fill="#60a5fa" fontSize="12" fontFamily="sans-serif" fontWeight="bold" opacity="0.8">NORTH ZONE</text>

            {/* South Zone */}
            <polygon points="150,300 420,290 460,380 200,390" fill="rgba(245, 158, 11, 0.08)" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="280" y="350" fill="#fbbf24" fontSize="12" fontFamily="sans-serif" fontWeight="bold" opacity="0.8">SOUTH ZONE</text>
          </svg>
        )}

        {/* Planned Route Paths */}
        {activeLayers.routes && (
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Route R-026 (Central) */}
            <path d="M 150 100 Q 220 80 300 130 T 360 220" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
            
            {/* Route R-027 (North) */}
            <path d="M 430 70 Q 520 60 620 120 T 680 160" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeDasharray="6 3" />
          </svg>
        )}

        {/* Bins & Vehicles Markers */}
        <div className="absolute inset-0 pointer-events-none">
          {activeLayers.bins && (
            <>
              {/* Critical Bins */}
              <div className="absolute top-[100px] left-[150px] w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg animate-ping opacity-75" />
              <div className="absolute top-[100px] left-[150px] w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[8px] font-bold text-white">
                C
              </div>

              <div className="absolute top-[130px] left-[300px] w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-[8px] font-bold text-white">
                C
              </div>

              {/* Priority Selected Bins */}
              <div className="absolute top-[220px] left-[360px] w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-md" />
              <div className="absolute top-[110px] left-[520px] w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-md" />
              <div className="absolute top-[160px] left-[680px] w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-md" />
            </>
          )}

          {activeLayers.vehicles && (
            <>
              {/* Vehicle TRK-021 */}
              <div className="absolute top-[80px] left-[210px] px-2 py-1 bg-slate-900 border border-emerald-500 text-emerald-400 font-mono text-[10px] font-bold rounded shadow-lg flex items-center space-x-1">
                <Navigation className="w-3 h-3 text-emerald-400" />
                <span>TRK-021</span>
              </div>

              {/* Vehicle TRK-014 */}
              <div className="absolute top-[50px] left-[450px] px-2 py-1 bg-slate-900 border border-blue-500 text-blue-400 font-mono text-[10px] font-bold rounded shadow-lg flex items-center space-x-1">
                <Navigation className="w-3 h-3 text-blue-400" />
                <span>TRK-014</span>
              </div>
            </>
          )}
        </div>

        {/* Map Legend overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl text-[11px] text-slate-300 space-y-1.5 shadow-lg">
          <div className="font-bold text-white text-xs mb-1">Map Legend</div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Critical Priority Bin (≥85%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Selected Collection Bin</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-1 bg-emerald-500 rounded" />
            <span>Active Planned Route Path</span>
          </div>
        </div>

        {/* Map Zoom Controls overlay */}
        <div className="absolute top-3 right-3 flex flex-col space-y-1">
          <button className="p-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-lg transition shadow">
            <Plus className="w-4 h-4" />
          </button>
          <button className="p-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-lg transition shadow">
            <Minus className="w-4 h-4" />
          </button>
          <button className="p-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white rounded-lg transition shadow">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};
