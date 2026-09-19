import React, { useState, useEffect } from 'react';
import { X, MapPin, ZoomIn, ZoomOut, LocateFixed, Truck } from 'lucide-react';
import type { SmartBin } from '../../../types/bin';

interface BinLocationDrawerProps {
  bin: SmartBin | null;
  onClose: () => void;
}

export const BinLocationDrawer: React.FC<BinLocationDrawerProps> = ({ bin, onClose }) => {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [mapMode, setMapMode] = useState<'vector' | 'satellite'>('vector');

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

  return (
    <div
      className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all duration-200 animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col h-[80vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* HEADER */}
        <div className="p-4 px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#047857] flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 m-0">
                {bin.id} Location Telemetry
              </h3>
              <p className="text-xs text-slate-500 font-medium m-0">
                {bin.address} &bull; <strong className="text-slate-800">{bin.zone}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* 2-View Mode Switcher Tabs */}
            <div className="bg-slate-200/80 p-0.5 rounded-lg flex items-center gap-1 border border-slate-300/60 text-xs">
              <button
                onClick={() => setMapMode('vector')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-all cursor-pointer ${
                  mapMode === 'vector'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Vector Grid
              </button>
              <button
                onClick={() => setMapMode('satellite')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold transition-all cursor-pointer ${
                  mapMode === 'satellite'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Realistic Satellite
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200 cursor-pointer border-none bg-transparent"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MAP CANVAS AREA */}
        <div className={`relative flex-1 overflow-hidden ${mapMode === 'satellite' ? 'bg-slate-950' : 'bg-slate-900'}`}>
          {/* Map Background */}
          {mapMode === 'satellite' ? (
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 opacity-75"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                backgroundImage: `url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1200&auto=format&fit=crop')`,
              }}
            />
          ) : (
            <div
              className="absolute inset-0 opacity-30 pointer-events-none transition-transform duration-300"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                backgroundImage: `radial-gradient(#10b981 1.5px, transparent 1.5px)`,
                backgroundSize: '24px 24px',
              }}
            />
          )}

          {/* Simulated Grid Road Lines SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-emerald-500/40">
            <path d="M 100 0 L 100 800 M 300 0 L 300 800 M 600 0 L 600 800" strokeWidth="1" strokeDasharray="4 4" />
            <path d="M 0 150 L 1000 150 M 0 350 L 1000 350 M 0 550 L 1000 550" strokeWidth="1" strokeDasharray="4 4" />
            
            {/* Active Route Path */}
            <path
              d="M 120 380 L 250 220 L 400 300 L 580 180"
              stroke="#2563eb"
              strokeWidth="4"
              strokeDasharray="8 4"
              fill="none"
            />
          </svg>

          {/* TARGET BIN PIN */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer z-20">
            <div className="bg-red-600 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-full shadow-2xl border-2 border-white flex items-center gap-1 animate-bounce">
              <MapPin className="w-3.5 h-3.5" />
              <span>{bin.id} ({bin.currentFillPercent}%)</span>
            </div>
            <div className="w-3 h-3 bg-red-600 rounded-full border-2 border-white shadow-md -mt-1" />
          </div>

          {/* NEARBY BINS */}
          <div className="absolute top-1/3 left-1/4 bg-emerald-600 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow border border-white flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>BIN-1042 (54%)</span>
          </div>

          <div className="absolute bottom-1/4 right-1/3 bg-amber-500 text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded shadow border border-white flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>BIN-1134 (83%)</span>
          </div>

          {/* NEARBY VEHICLE TRK-021 */}
          <div className="absolute top-1/4 right-1/4 bg-blue-600 text-white font-mono text-[10px] font-bold px-2 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" />
            <span>TRK-021 (Route R-104)</span>
          </div>

          {/* MAP CONTROLS OVERLAY */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-30">
            <button
              onClick={() => setZoomLevel((z) => Math.min(150, z + 15))}
              title="Zoom In"
              className="p-2 bg-white text-slate-800 rounded-xl shadow-lg hover:bg-slate-100 cursor-pointer border-none"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
              title="Zoom Out"
              className="p-2 bg-white text-slate-800 rounded-xl shadow-lg hover:bg-slate-100 cursor-pointer border-none"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(100)}
              title="Center View"
              className="p-2 bg-white text-slate-800 rounded-xl shadow-lg hover:bg-slate-100 cursor-pointer border-none"
            >
              <LocateFixed className="w-4 h-4 text-[#047857]" />
            </button>
          </div>

          {/* LEGEND OVERLAY */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-xl border border-slate-700/80 text-[10px] font-semibold space-y-1.5 z-30">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
              <span>Target Bin ({bin.id})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Normal Fill Bins</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Active Route Segment (R-104)</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 px-6 border-t border-slate-200 bg-white flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-4 font-mono text-slate-600">
            <span>Latitude: <strong className="text-slate-900">{bin.latitude.toFixed(4)}</strong></span>
            <span>Longitude: <strong className="text-slate-900">{bin.longitude.toFixed(4)}</strong></span>
            <span>Zone: <strong className="text-[#047857]">{bin.zone}</strong></span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold cursor-pointer border-none"
          >
            Close Map
          </button>
        </div>

      </div>
    </div>
  );
};
