import { AlertTriangle, Clock, FastForward } from 'lucide-react';
import type { DriverRouteStop, DriverAlert } from '../../../types/driver';

interface RouteIssuesProps {
  stops: DriverRouteStop[];
  alerts: DriverAlert[];
}

export const RouteIssues: React.FC<RouteIssuesProps> = ({ stops, alerts }) => {
  const skippedStops = stops.filter((s) => s.status === 'SKIPPED');

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-extrabold text-slate-900">Route Operational Issues</h3>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">Field Logs</span>
        </div>

        <div className="flex flex-col gap-2.5 text-xs">
          {/* Delays / Alerts */}
          {alerts.map((alt) => (
            <div key={alt.id} className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-900 block">{alt.title}</span>
                <span className="text-[11px] text-amber-800">{alt.description}</span>
              </div>
            </div>
          ))}

          {/* Skipped Stops */}
          {skippedStops.map((stop) => (
            <div key={stop.id} className="p-2.5 rounded-xl bg-red-50/70 border border-red-200 flex items-start gap-2.5">
              <FastForward className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-red-900 block font-mono">{stop.binId} Skipped</span>
                <span className="text-[11px] text-red-800">{stop.location} &bull; Reason: {stop.skippedReason || 'Inaccessible'}</span>
              </div>
            </div>
          ))}

          {alerts.length === 0 && skippedStops.length === 0 && (
            <div className="py-4 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-100">
              No operational delays or skipped stops reported.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteIssues;
