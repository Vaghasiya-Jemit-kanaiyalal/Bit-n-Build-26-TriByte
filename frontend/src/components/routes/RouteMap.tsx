import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Crosshair, Truck, MapPin } from 'lucide-react';
import type { BinStop } from '../../mock/routeData';

interface RouteMapProps {
  stops: BinStop[];
  onSelectBin?: (stop: BinStop) => void;
  selectedBinId?: string;
}

export const RouteMap: React.FC<RouteMapProps> = ({
  stops,
  onSelectBin,
  selectedBinId,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Coordinates for mock SVG layout
  const mapWidth = 720;
  const mapHeight = 440;

  const mockPoints = [
    { id: 'start', label: 'Depot Start', x: 70, y: 370, type: 'start' },
    { id: 'BIN-104', label: 'Central Cafeteria (96%)', x: 220, y: 130, status: 'Critical', fill: 96 },
    { id: 'BIN-217', label: 'North Gate (91%)', x: 340, y: 90, status: 'Critical', fill: 91 },
    { id: 'BIN-083', label: 'Library Block (78%)', x: 440, y: 180, status: 'High', fill: 78 },
    { id: 'BIN-142', label: 'Sports Complex (74%)', x: 580, y: 220, status: 'Completed', fill: 74 },
    { id: 'BIN-099', label: 'Student Center (88%)', x: 310, y: 240, status: 'Completed', fill: 88 },
    { id: 'BIN-112', label: 'Engineering Annex (65%)', x: 180, y: 290, status: 'Completed', fill: 65 },
    { id: 'BIN-[#401]', label: 'Hostel Block 1 (82%)', x: 500, y: 310, status: 'Completed', fill: 82 },
    { id: 'BIN-305', label: 'Science Bldg (85%)', x: 620, y: 120, status: 'Pending', fill: 85 },
  ];

  return (
    <div className="bg-white rounded-md border border-[#e5e7eb] shadow-xs flex flex-col overflow-hidden h-full">
      {/* Map Control Toolbar */}
      <div className="p-3 bg-[#f9fafb] border-b border-[#e5e7eb] flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-semibold text-[#374151]">
          <MapPin className="w-4 h-4 text-[#738a62]" />
          <span>Operational Route Map & Vector Grid</span>
          <span className="text-[10px] text-[#6b7280] bg-[#f3f4f6] px-2 py-0.5 rounded border border-[#e5e7eb]">
            Zone A &amp; B Live Operations
          </span>
        </div>

        {/* Map Action Controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center border border-[#d1d5db] rounded bg-white overflow-hidden">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 1.6))}
              title="Zoom In"
              className="p-1.5 hover:bg-[#f3f4f6] text-[#374151] cursor-pointer border-none bg-transparent"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] px-1 font-mono text-[#6b7280]">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
              title="Zoom Out"
              className="p-1.5 hover:bg-[#f3f4f6] text-[#374151] cursor-pointer border-none bg-transparent"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => setZoomLevel(1)}
            className="px-2 py-1 text-[11px] font-medium text-[#374151] bg-white border border-[#d1d5db] hover:bg-[#f3f4f6] rounded cursor-pointer"
          >
            Fit Route
          </button>
          <button
            onClick={() => alert('Centered map focus on TRK-04.')}
            className="px-2 py-1 text-[11px] font-medium text-[#374151] bg-white border border-[#d1d5db] hover:bg-[#f3f4f6] rounded cursor-pointer flex items-center gap-1"
          >
            <Crosshair className="w-3 h-3 text-[#738a62]" />
            <span>Center Vehicle</span>
          </button>
        </div>
      </div>

      {/* Map Interactive SVG Canvas */}
      <div className="relative flex-1 bg-[#f3f4f6] overflow-hidden min-h-[360px] flex items-center justify-center p-2">
        
        {/* Subtle Map Grid Pattern */}
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#9ca3af 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />

        {/* SVG Container */}
        <div
          className="relative transition-transform duration-300 ease-out"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
        >
          <svg width={mapWidth} height={mapHeight} className="overflow-visible">
            {/* Zone Boundaries */}
            <rect x="30" y="30" width="340" height="380" rx="12" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="45" y="55" fill="#9ca3af" fontSize="11" fontWeight="700" letterSpacing="0.05em">ZONE A (NORTH CAMPUS)</text>

            <rect x="390" y="30" width="300" height="380" rx="12" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="405" y="55" fill="#9ca3af" fontSize="11" fontWeight="700" letterSpacing="0.05em">ZONE B (CENTRAL &amp; EAST)</text>

            {/* Completed Path Segment (Green/Olive) */}
            <path
              d="M 70 370 L 180 290 L 310 240 L 500 310 L 580 220"
              fill="none"
              stroke="#738a62"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Active Path Segment (Dark Charcoal) */}
            <path
              d="M 580 220 L 440 180 L 220 130 L 340 90 L 620 120"
              fill="none"
              stroke="#1f2937"
              strokeWidth="3.5"
              strokeDasharray="6 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Depot Start Node */}
            <g transform="translate(70, 370)">
              <circle r="12" fill="#1f2937" stroke="#ffffff" strokeWidth="2" />
              <text x="0" y="4" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">DEPOT</text>
            </g>

            {/* Active Vehicle Position (TRK-04) */}
            <g transform="translate(440, 180)" className="cursor-pointer">
              <circle r="18" fill="#1f2937" fillOpacity="0.2" className="animate-ping" />
              <circle r="14" fill="#1f2937" stroke="#ffffff" strokeWidth="2" />
              <foreignObject x="-9" y="-9" width="18" height="18">
                <Truck className="w-4.5 h-4.5 text-white" />
              </foreignObject>
              <rect x="-24" y="-32" width="48" height="16" rx="4" fill="#1f2937" />
              <text x="0" y="-21" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">TRK-04</text>
            </g>

            {/* Bin Stop Markers */}
            {mockPoints.map((pt) => {
              if (pt.type === 'start') return null;
              const isSelected = selectedBinId === pt.id;
              const isCritical = pt.status === 'Critical';
              const isHigh = pt.status === 'High';
              const isCompleted = pt.status === 'Completed';

              let fillColor = '#6b7280';
              if (isCritical) fillColor = '#dc2626';
              else if (isHigh) fillColor = '#d97706';
              else if (isCompleted) fillColor = '#738a62';

              const stopData = stops.find((s) => s.binId === pt.id);

              return (
                <g
                  key={pt.id}
                  transform={`translate(${pt.x}, ${pt.y})`}
                  onClick={() => stopData && onSelectBin && onSelectBin(stopData)}
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                >
                  <circle r={isSelected ? "14" : "11"} fill={fillColor} stroke="#ffffff" strokeWidth="2" shadow-md="true" />
                  <text x="0" y="3" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">
                    {pt.fill}%
                  </text>

                  {/* Label tooltip */}
                  <rect x="-45" y="-30" width="90" height="16" rx="3" fill="#1f2937" fillOpacity="0.85" />
                  <text x="0" y="-19" fill="#ffffff" fontSize="8" fontWeight="600" textAnchor="middle">
                    {pt.id} &bull; {pt.fill}%
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Map Legend Footer */}
      <div className="p-2.5 bg-white border-t border-[#e5e7eb] flex items-center justify-between text-[11px] font-medium text-[#4b5563]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1f2937]" />
            <span>Active route</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#738a62]" />
            <span>Completed stop</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" />
            <span>Pending / High priority</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626]" />
            <span>Critical overflow</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#1f2937]" />
            <span>Vehicle TRK-04</span>
          </div>
        </div>

        <span className="text-[10px] text-[#6b7280]">
          Updated: Real-time telemetry feed
        </span>
      </div>
    </div>
  );
};
