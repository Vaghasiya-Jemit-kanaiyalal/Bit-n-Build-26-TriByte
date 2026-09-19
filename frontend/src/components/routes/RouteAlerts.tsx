import React from 'react';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import type { RouteAlert } from '../../mock/routeData';

interface RouteAlertsProps {
  alerts: RouteAlert[];
  onDismissAlert?: (id: string) => void;
}

export const RouteAlerts: React.FC<RouteAlertsProps> = ({ alerts, onDismissAlert }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mb-6">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`flex items-center justify-between p-3 rounded-md text-xs border transition-all ${
            alert.severity === 'critical'
              ? 'bg-red-50/90 border-red-200 text-red-800'
              : alert.severity === 'warning'
              ? 'bg-amber-50/90 border-amber-200 text-amber-900'
              : 'bg-blue-50/90 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {alert.severity === 'critical' ? (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            ) : alert.severity === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <span className="font-semibold">{alert.message}</span>
            <span className="text-[10px] opacity-75 font-mono ml-2">({alert.timestamp})</span>
          </div>

          {onDismissAlert && (
            <button
              onClick={() => onDismissAlert(alert.id)}
              className="text-current opacity-60 hover:opacity-100 p-1 cursor-pointer border-none bg-transparent"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
