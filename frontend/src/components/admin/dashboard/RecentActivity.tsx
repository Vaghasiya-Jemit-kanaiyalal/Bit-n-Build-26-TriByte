import React from 'react';
import { History } from 'lucide-react';
import type { RecentActivityItem } from '../../../types/dashboard';

interface RecentActivityProps {
  activity: RecentActivityItem[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activity }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 m-0">Recent Operational History</h3>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
          Timeline
        </span>
      </div>

      {/* Timeline Items */}
      <div className="space-y-3 relative pl-4 border-l-2 border-slate-200 ml-2">
        {activity.map((act) => (
          <div key={act.id} className="relative group">
            {/* Timeline Dot */}
            <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-4 ring-white" />
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{act.type}</span>
                <span className="text-[10px] font-mono text-slate-400">{act.timestamp}</span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5 leading-snug">{act.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
