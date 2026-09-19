import React from 'react';
import { ShieldAlert, CheckCircle, Eye } from 'lucide-react';
import type { AlertItem } from '../../mock/alertMockData';

interface CriticalAlertsSectionProps {
  criticalAlerts: AlertItem[];
  onViewAlert: (alert: AlertItem) => void;
  onAcknowledgeAlert: (id: string) => void;
}

export const CriticalAlertsSection: React.FC<CriticalAlertsSectionProps> = ({
  criticalAlerts,
  onViewAlert,
  onAcknowledgeAlert,
}) => {
  if (!criticalAlerts || criticalAlerts.length === 0) return null;

  return (
    <div className="bg-red-50/70 border border-red-200/90 rounded-xl p-4 mb-6 shadow-2xs">
      <div className="flex items-center justify-between mb-3 border-b border-red-200/60 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-red-600 text-white rounded-md shadow-xs animate-pulse">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-red-950 uppercase tracking-wider m-0">
              Critical Attention ({criticalAlerts.length})
            </h3>
            <p className="text-[11px] text-red-800 font-medium">
              High-severity incidents requiring immediate dispatch or operational action
            </p>
          </div>
        </div>
        <span className="text-[10px] font-extrabold uppercase bg-red-200/80 text-red-900 px-2 py-0.5 rounded border border-red-300">
          IMMEDIATE ACTION
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {criticalAlerts.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg p-3.5 border border-red-200 shadow-2xs flex flex-col justify-between space-y-3 hover:border-red-400 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono font-extrabold text-red-700">{item.entityId}</span>
                <span className="text-[10px] font-mono text-slate-400">{item.createdAt}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">{item.title}</h4>
              <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 leading-tight">{item.description}</p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] font-medium text-slate-500 truncate max-w-[120px]">
                {item.location}
              </span>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => onAcknowledgeAlert(item.id)}
                  className="px-2 py-1 text-[10px] font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center space-x-1"
                >
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  <span>Ack</span>
                </button>
                <button
                  onClick={() => onViewAlert(item)}
                  className="px-2.5 py-1 text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 rounded transition-colors flex items-center space-x-1 shadow-2xs"
                >
                  <Eye className="w-3 h-3" />
                  <span>View</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CriticalAlertsSection;
