import { ListFilter, MapPin, Eye, ArrowUpRight } from 'lucide-react';
import type { DriverRouteStop } from '../../types/driver';

interface UpcomingStopsProps {
  stops: DriverRouteStop[];
  onViewBinDetails: (stop: DriverRouteStop) => void;
  onNavigateToFullRoute?: () => void;
}

export const UpcomingStops: React.FC<UpcomingStopsProps> = ({
  stops,
  onViewBinDetails,
  onNavigateToFullRoute,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ListFilter className="w-5 h-5 text-slate-700" />
          <h3 className="text-base font-extrabold text-slate-900">Upcoming Route Stops</h3>
        </div>
        {onNavigateToFullRoute && (
          <button
            onClick={onNavigateToFullRoute}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer bg-transparent border-none"
          >
            <span>View Full Sequence</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {stops.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-xs">
          No upcoming stops on this route.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-2.5 pl-2">#</th>
                <th className="pb-2.5">Bin ID</th>
                <th className="pb-2.5">Location</th>
                <th className="pb-2.5 text-center">Fill %</th>
                <th className="pb-2.5">Priority</th>
                <th className="pb-2.5 text-right">Distance</th>
                <th className="pb-2.5 text-center">Status</th>
                <th className="pb-2.5 text-right pr-2">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stops.map((stop) => {
                const isCurrent = stop.status === 'CURRENT' || stop.status === 'COLLECTING';
                const isCritical = stop.priority === 'CRITICAL' || stop.fillLevel >= 90;

                return (
                  <tr
                    key={stop.id}
                    onClick={() => onViewBinDetails(stop)}
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                      isCurrent ? 'bg-emerald-50/50 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 pl-2 font-mono text-slate-500 font-bold">{stop.sequence}</td>
                    <td className="py-3 font-mono font-bold text-slate-900">{stop.binId}</td>
                    <td className="py-3 text-slate-700 max-w-[180px] truncate">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{stop.location}</span>
                      </span>
                    </td>
                    <td className="py-3 text-center font-mono font-bold">
                      <span className={isCritical ? 'text-red-700' : 'text-slate-900'}>
                        {stop.fillLevel}%
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                        stop.priority === 'CRITICAL'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : stop.priority === 'HIGH'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {stop.priority}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-slate-600">{stop.distanceKm} km</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isCurrent
                          ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                          : stop.status === 'COMPLETED'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {isCurrent ? 'Current' : stop.status === 'COMPLETED' ? 'Done' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewBinDetails(stop);
                        }}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer border-none bg-transparent"
                        title="View Bin Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UpcomingStops;
