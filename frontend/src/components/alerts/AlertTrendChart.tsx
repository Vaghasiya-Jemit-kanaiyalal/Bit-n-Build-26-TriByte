import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { alertService } from '../../services/alertService';

export const AlertTrendChart: React.FC = () => {
  const trends = alertService.getAlertTrends();
  const [hoveredDay, setHoveredDay] = useState<typeof trends[0] | null>(null);

  const maxTotal = 25;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-4 h-4 text-[#738a62]" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">Alert Activity (7 Days)</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500">Weekly Incident Trend</span>
      </div>

      {/* SVG Stacked Bar Chart */}
      <div className="relative h-32 w-full pt-4 flex items-end justify-between px-2">
        {trends.map((item) => {
          const total = item.critical + item.high + item.medium + item.low;
          const heightPct = Math.min(100, (total / maxTotal) * 100);

          const critHeight = (item.critical / total) * 100;
          const highHeight = (item.high / total) * 100;
          const medHeight = (item.medium / total) * 100;
          const lowHeight = (item.low / total) * 100;

          return (
            <div
              key={item.day}
              onMouseEnter={() => setHoveredDay(item)}
              onMouseLeave={() => setHoveredDay(null)}
              className="flex flex-col items-center space-y-1.5 flex-1 group cursor-pointer"
            >
              {/* Stacked Bar */}
              <div className="w-5 bg-slate-100 rounded-t overflow-hidden flex flex-col justify-end transition-all group-hover:w-6" style={{ height: `${heightPct}%` }}>
                <div style={{ height: `${critHeight}%` }} className="bg-red-500" title={`Critical: ${item.critical}`} />
                <div style={{ height: `${highHeight}%` }} className="bg-amber-500" title={`High: ${item.high}`} />
                <div style={{ height: `${medHeight}%` }} className="bg-amber-300" title={`Medium: ${item.medium}`} />
                <div style={{ height: `${lowHeight}%` }} className="bg-[#738a62]" title={`Low: ${item.low}`} />
              </div>
              <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-900">{item.day}</span>
            </div>
          );
        })}
      </div>

      {/* Tooltip detail hover info */}
      {hoveredDay ? (
        <div className="p-2 bg-slate-900 text-white rounded text-[11px] flex justify-between items-center animate-in fade-in duration-100 font-mono">
          <span>{hoveredDay.day}: Total {hoveredDay.critical + hoveredDay.high + hoveredDay.medium + hoveredDay.low}</span>
          <div className="flex space-x-2 text-[10px]">
            <span className="text-red-400">Crit: {hoveredDay.critical}</span>
            <span className="text-amber-400">High: {hoveredDay.high}</span>
            <span className="text-amber-200">Med: {hoveredDay.medium}</span>
            <span className="text-emerald-400">Low: {hoveredDay.low}</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center space-x-3 text-[10px] text-slate-500 pt-1">
          <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-red-500 mr-1" /> Critical</span>
          <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-500 mr-1" /> High</span>
          <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-amber-300 mr-1" /> Medium</span>
          <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-[#738a62] mr-1" /> Low</span>
        </div>
      )}
    </div>
  );
};

export default AlertTrendChart;
