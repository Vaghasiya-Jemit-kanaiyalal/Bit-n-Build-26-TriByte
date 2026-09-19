import React from 'react';
import { PieChart } from 'lucide-react';
import type { AlertItem } from '../../mock/alertMockData';
import { alertService } from '../../services/alertService';

interface AlertCategoryChartProps {
  alerts: AlertItem[];
}

export const AlertCategoryChart: React.FC<AlertCategoryChartProps> = ({ alerts }) => {
  const categories = alertService.getAlertCategories(alerts);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <PieChart className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">Alerts by Category</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500">{alerts.length} Total</span>
      </div>

      {/* Multi-Segment Horizontal Bar */}
      <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
        {categories.map((cat, idx) => {
          const colors = ['bg-[#738a62]', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-600', 'bg-sky-400', 'bg-slate-400'];
          return (
            <div
              key={cat.name}
              style={{ width: `${cat.percent}%` }}
              className={`${colors[idx % colors.length]} h-full transition-all`}
              title={`${cat.name}: ${cat.count} (${cat.percent}%)`}
            />
          );
        })}
      </div>

      {/* Category breakdown grid */}
      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
        {categories.map((cat, idx) => {
          const dots = ['bg-[#738a62]', 'bg-blue-500', 'bg-amber-500', 'bg-emerald-600', 'bg-sky-400', 'bg-slate-400'];
          return (
            <div key={cat.name} className="flex items-center justify-between p-1.5 bg-slate-50 rounded border border-slate-100">
              <div className="flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${dots[idx % dots.length]}`} />
                <span className="text-slate-700 font-medium text-[11px]">{cat.name}</span>
              </div>
              <span className="font-bold text-slate-900 text-[11px]">{cat.percent}%</span>
            </div>
          );
        })}
      </div>

      {/* Operational Highlights Box */}
      <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2 text-[10px] text-center">
        <div className="p-2 bg-slate-50 rounded border border-slate-100">
          <span className="text-slate-400 uppercase font-semibold block mb-0.5">Most Common</span>
          <strong className="text-slate-800 font-bold block truncate">Predicted Overflow</strong>
        </div>
        <div className="p-2 bg-slate-50 rounded border border-slate-100">
          <span className="text-slate-400 uppercase font-semibold block mb-0.5">Top Zone</span>
          <strong className="text-slate-800 font-bold block truncate">Industrial Zone</strong>
        </div>
        <div className="p-2 bg-slate-50 rounded border border-slate-100">
          <span className="text-slate-400 uppercase font-semibold block mb-0.5">Peak Window</span>
          <strong className="text-slate-800 font-bold block truncate">08:00 – 11:00</strong>
        </div>
      </div>
    </div>
  );
};

export default AlertCategoryChart;
