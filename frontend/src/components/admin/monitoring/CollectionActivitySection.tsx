import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const CollectionActivitySection: React.FC = () => {
  const completedStops = 126;
  const inProgressStops = 26;
  const pendingStops = 22;
  const totalStops = 174;
  const progressPct = Math.round((completedStops / totalStops) * 100);

  const recentCollectionCards = [
    {
      id: 'COL-01',
      binId: 'BIN-1054',
      volumeTons: '0.74t',
      vehicleId: 'TRK-021',
      routeId: 'R-104',
      time: '2 min ago',
      type: 'COLLECTION COMPLETED',
      bgColor: 'bg-emerald-50 border-emerald-200 text-emerald-950',
    },
    {
      id: 'COL-02',
      binId: 'BIN-1087',
      volumeTons: 'Pending Dump',
      vehicleId: 'TRK-021',
      routeId: 'R-104',
      time: '5 min ago',
      type: 'COLLECTION STARTED',
      bgColor: 'bg-blue-50 border-blue-200 text-blue-950',
    },
    {
      id: 'COL-03',
      binId: 'BIN-1167',
      volumeTons: 'Delayed',
      vehicleId: 'TRK-008',
      routeId: 'R-106',
      time: '12 min ago',
      type: 'COLLECTION DELAYED',
      bgColor: 'bg-amber-50 border-amber-200 text-amber-950',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Live Collection Operational Progress
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
          {progressPct}% Completed Today
        </span>
      </div>

      {/* Progress metrics */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono text-slate-700">
          <span>Stops Progress ({completedStops} / {totalStops})</span>
          <span className="font-bold text-slate-900">{progressPct}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
          <div style={{ width: `${progressPct}%` }} className="bg-emerald-500 h-full" />
          <div style={{ width: `${(inProgressStops / totalStops) * 100}%` }} className="bg-amber-400 h-full" />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
          <span>Done: <strong className="text-slate-900">{completedStops}</strong></span>
          <span>In Progress: <strong className="text-amber-700">{inProgressStops}</strong></span>
          <span>Pending: <strong className="text-slate-700">{pendingStops}</strong></span>
        </div>
      </div>

      {/* Live Collection Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {recentCollectionCards.map((c) => (
          <div key={c.id} className={`p-3 rounded-xl border text-xs space-y-1 ${c.bgColor}`}>
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider font-mono">
              <span>{c.type}</span>
              <span className="text-slate-500 font-normal">{c.time}</span>
            </div>
            <p className="font-extrabold text-slate-900 text-sm font-mono">{c.binId}</p>
            <div className="flex justify-between text-[11px] text-slate-600 pt-1 font-mono">
              <span>Veh: <strong>{c.vehicleId}</strong></span>
              <span>Route: <strong>{c.routeId}</strong></span>
              <span>Volume: <strong>{c.volumeTons}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
