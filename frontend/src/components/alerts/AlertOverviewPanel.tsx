import React from 'react';
import type { AlertItem } from '../../mock/alertMockData';
import AlertTrendChart from './AlertTrendChart';
import AlertCategoryChart from './AlertCategoryChart';
import AIAlertInsights from './AIAlertInsights';
import AlertTimeline from './AlertTimeline';
import { ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

interface AlertOverviewPanelProps {
  alerts: AlertItem[];
  onSelectAlert?: (alert: AlertItem) => void;
  onNavigateToPredictions?: () => void;
}

export const AlertOverviewPanel: React.FC<AlertOverviewPanelProps> = ({
  alerts,
  onSelectAlert,
  onNavigateToPredictions,
}) => {
  return (
    <div className="space-y-6">
      
      {/* Resolution & SLA Performance Metrics */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
          Incident Response Performance
        </h3>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-0.5">Resolution Rate</span>
            <strong className="text-sm font-bold text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              78%
            </strong>
          </div>

          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-0.5">Avg Ack Time</span>
            <strong className="text-sm font-bold text-slate-800 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
              8 min
            </strong>
          </div>

          <div className="p-2 bg-slate-50 rounded border border-slate-100">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-0.5">Avg Resolve</span>
            <strong className="text-sm font-bold text-slate-800 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-[#738a62]" />
              32 min
            </strong>
          </div>
        </div>
      </div>

      {/* 7-Day Alert Trend Chart */}
      <AlertTrendChart />

      {/* Alerts by Category */}
      <AlertCategoryChart alerts={alerts} />

      {/* AI Alert Insights */}
      <AIAlertInsights onNavigateToPredictions={onNavigateToPredictions} />

      {/* Recent Alert Timeline */}
      <AlertTimeline alerts={alerts} onSelectAlert={onSelectAlert} />

    </div>
  );
};

export default AlertOverviewPanel;
