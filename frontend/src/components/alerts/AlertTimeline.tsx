import React from 'react';
import { Activity } from 'lucide-react';
import type { AlertItem } from '../../mock/alertMockData';

interface AlertTimelineProps {
  alerts: AlertItem[];
  onSelectAlert?: (alert: AlertItem) => void;
}

export const AlertTimeline: React.FC<AlertTimelineProps> = ({ alerts, onSelectAlert }) => {
  const recentAlerts = alerts.slice(0, 5);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-[#738a62]" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">Recent Alert Activity</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500">Live Timeline</span>
      </div>

      <div className="relative pl-5 space-y-3.5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {recentAlerts.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectAlert && onSelectAlert(item)}
            className="relative cursor-pointer group"
          >
            <div
              className={`absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ring-2 ring-slate-100 ${
                item.severity === 'CRITICAL' ? 'bg-red-600' : item.severity === 'HIGH' ? 'bg-amber-500' : 'bg-[#738a62]'
              }`}
            />
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>{item.createdAt}</span>
              <span className="font-bold text-slate-700">{item.id}</span>
            </div>
            <div className="text-xs font-medium text-slate-800 group-hover:text-[#738a62] transition-colors leading-snug mt-0.5">
              {item.title}
            </div>
            <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
              Entity: {item.entityId} &bull; {item.zone}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertTimeline;
