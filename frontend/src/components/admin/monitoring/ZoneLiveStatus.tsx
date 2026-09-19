import React from 'react';
import type { ZoneStatusSummary, ZoneName } from '../../../types/monitoring';
import { MapPin } from 'lucide-react';

interface ZoneLiveStatusProps {
  zones: ZoneStatusSummary[];
  onSelectZone: (zone: ZoneName) => void;
}

export const ZoneLiveStatus: React.FC<ZoneLiveStatusProps> = ({ zones, onSelectZone }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-emerald-700" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Zone Operational Health Summary
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-500">7 Municipal Zones</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {zones.map((z) => {
          return (
            <div
              key={z.zone}
              onClick={() => onSelectZone(z.zone)}
              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all hover:shadow-xs ${
                z.status === 'Critical'
                  ? 'bg-red-50/70 border-red-200 text-red-950'
                  : z.status === 'Attention'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                  : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold truncate text-[11px]">{z.zone}</span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    z.status === 'Critical'
                      ? 'bg-red-600 animate-pulse'
                      : z.status === 'Attention'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
              </div>

              <div className="space-y-0.5 text-[10px] font-mono text-slate-600 pt-1">
                <div>Bins: <strong className="text-slate-900">{z.binsCount}</strong></div>
                <div>Critical Bins: <strong className="text-red-700">{z.criticalBins}</strong></div>
                <div>Vehicles: <strong className="text-slate-900">{z.activeVehicles}</strong></div>
                <div>Routes: <strong className="text-slate-900">{z.activeRoutes}</strong></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
