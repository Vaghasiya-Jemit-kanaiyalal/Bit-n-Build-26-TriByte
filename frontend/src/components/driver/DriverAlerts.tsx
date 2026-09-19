import React from 'react';
import { AlertCircle, AlertTriangle, Info, Check, BellRing } from 'lucide-react';
import type { DriverAlert } from '../../types/driver';

interface DriverAlertsProps {
  alerts: DriverAlert[];
  onAcknowledgeAlert?: (alertId: string) => void;
}

export const DriverAlerts: React.FC<DriverAlertsProps> = ({
  alerts,
  onAcknowledgeAlert,
}) => {
  const activeAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-extrabold text-slate-900">Attention Required</h3>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
            {activeAlerts.length} Active
          </span>
        </div>

        {activeAlerts.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-100">
            No active alerts requiring attention.
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 max-h-[280px] overflow-y-auto pr-1">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-3 ${
                  alert.severity === 'critical'
                    ? 'bg-red-50/80 border-red-200 text-red-900'
                    : alert.severity === 'warning'
                    ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {alert.severity === 'critical' ? (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  ) : alert.severity === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">{alert.title}</div>
                    <p className="text-[11px] opacity-90 mt-0.5">{alert.description}</p>
                    <span className="text-[10px] opacity-60 font-mono mt-1 block">{alert.timestamp}</span>
                  </div>
                </div>

                {onAcknowledgeAlert && (
                  <button
                    onClick={() => onAcknowledgeAlert(alert.id)}
                    className="p-1 rounded-lg bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 text-[10px] font-bold cursor-pointer shrink-0 transition-all"
                    title="Acknowledge Alert"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverAlerts;
