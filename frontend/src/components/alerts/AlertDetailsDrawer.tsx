import React, { useEffect } from 'react';
import {
  X,
  ShieldAlert,
  ExternalLink,
  BrainCircuit,
  Calendar,
  AlertTriangle,
  Activity,
  Layers
} from 'lucide-react';
import type { AlertItem } from '../../mock/alertMockData';

interface AlertDetailsDrawerProps {
  alert: AlertItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge: (id: string) => void;
  onSnooze: (alert: AlertItem) => void;
  onResolve: (alert: AlertItem) => void;
  onNavigateToResource: (alert: AlertItem) => void;
}

export const AlertDetailsDrawer: React.FC<AlertDetailsDrawerProps> = ({
  alert: alertItem,
  isOpen,
  onClose,
  onAcknowledge,
  onSnooze,
  onResolve,
  onNavigateToResource,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !alertItem) return null;

  let severityBadge = 'bg-slate-100 text-slate-700 border-slate-200';
  if (alertItem.severity === 'CRITICAL') severityBadge = 'bg-red-100 text-red-800 border-red-200';
  if (alertItem.severity === 'HIGH') severityBadge = 'bg-amber-100 text-amber-900 border-amber-200';
  if (alertItem.severity === 'MEDIUM') severityBadge = 'bg-amber-50 text-amber-800 border-amber-200';
  if (alertItem.severity === 'LOW') severityBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';

  let statusBadge = 'bg-slate-100 text-slate-700 border-slate-200';
  if (alertItem.status === 'ACTIVE') statusBadge = 'bg-red-50 text-red-700 border-red-200';
  if (alertItem.status === 'ACKNOWLEDGED') statusBadge = 'bg-amber-50 text-amber-800 border-amber-200';
  if (alertItem.status === 'RESOLVED') statusBadge = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (alertItem.status === 'SNOOZED') statusBadge = 'bg-blue-50 text-blue-800 border-blue-200';

  return (
    <div
      className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-lg md:max-w-xl bg-white rounded-2xl shadow-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 text-xs text-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
          
          {/* Drawer Header */}
          <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700/60 text-[#88a573]">
                <ShieldAlert className="w-5 h-5 text-[#88a573]" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-0.5">
                  <span className="font-mono text-sm font-semibold text-[#88a573]">{alertItem.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${severityBadge}`}>
                    {alertItem.severity}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${statusBadge}`}>
                    {alertItem.status}
                  </span>
                </div>
                <h2 className="text-base font-semibold text-white tracking-tight line-clamp-1">{alertItem.title}</h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Info Bar */}
          <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-medium text-slate-600">
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Created: <strong className="text-slate-800 ml-1">{alertItem.createdAt}</strong>
            </span>
            <span className="flex items-center">
              Source: <strong className="text-slate-800 ml-1">{alertItem.source}</strong>
            </span>
          </div>

          {/* Drawer Body Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
            
            {/* Description Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Incident Overview</h4>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">{alertItem.description}</p>
            </div>

            {/* Affected Resource Details */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-[#738a62]" />
                  <h3 className="text-sm font-semibold text-slate-900">Affected Resource</h3>
                </div>
                <button
                  onClick={() => onNavigateToResource(alertItem)}
                  className="inline-flex items-center text-xs font-semibold text-[#738a62] hover:underline"
                >
                  <span>Open {alertItem.entityType}</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Entity ID</span>
                  <strong className="text-slate-900 font-mono text-sm">{alertItem.entityId}</strong>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Location & Zone</span>
                  <strong className="text-slate-900 truncate block font-semibold">{alertItem.location}</strong>
                  <span className="text-[10px] text-slate-500">{alertItem.zone}</span>
                </div>

                {alertItem.metadata.currentFill !== undefined && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Current Fill Level</span>
                    <strong className="text-red-600 font-bold text-sm">{alertItem.metadata.currentFill}%</strong>
                  </div>
                )}

                {alertItem.metadata.predictedOverflowTime && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Predicted Overflow ETA</span>
                    <strong className="text-red-700 font-bold text-sm">{alertItem.metadata.predictedOverflowTime}</strong>
                  </div>
                )}

                {alertItem.metadata.vehicleCurrentLoadKg !== undefined && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Vehicle Payload</span>
                    <strong className="text-amber-700 font-bold text-sm">
                      {alertItem.metadata.vehicleCurrentLoadKg} / {alertItem.metadata.vehicleCapacityKg} kg
                    </strong>
                  </div>
                )}

                {alertItem.metadata.routeDelayMinutes !== undefined && (
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">Route Delay</span>
                    <strong className="text-amber-700 font-bold text-sm">
                      +{alertItem.metadata.routeDelayMinutes} minutes behind
                    </strong>
                  </div>
                )}
              </div>
            </div>

            {/* Why This Alert Was Generated (AI Explanation Box) */}
            <div className="p-4 bg-emerald-950 text-white rounded-xl shadow-sm border border-emerald-900 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BrainCircuit className="w-4 h-4 text-[#88a573]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Why This Alert Was Generated</h3>
                </div>
                {alertItem.metadata.confidenceScore && (
                  <span className="text-[10px] font-mono bg-emerald-900 text-[#88a573] px-2 py-0.5 rounded border border-emerald-800">
                    Confidence: {alertItem.metadata.confidenceScore}%
                  </span>
                )}
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                {alertItem.metadata.fillRatePerHour && (
                  <div className="flex justify-between p-2 bg-slate-900/60 rounded border border-emerald-900/40">
                    <span>Recent fill rate acceleration:</span>
                    <strong className="text-emerald-400">+{alertItem.metadata.fillRatePerHour}% / hour</strong>
                  </div>
                )}
                {alertItem.metadata.historicalAvgRate && (
                  <div className="flex justify-between p-2 bg-slate-900/60 rounded border border-emerald-900/40">
                    <span>Historical 7-day average rate:</span>
                    <strong className="text-slate-300">+{alertItem.metadata.historicalAvgRate}% / hour</strong>
                  </div>
                )}
                <div className="flex justify-between p-2 bg-slate-900/60 rounded border border-emerald-900/40">
                  <span>Configured operational threshold:</span>
                  <strong className="text-amber-400">95% capacity limit</strong>
                </div>
              </div>
            </div>

            {/* Recommended Action */}
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-3">
              <div className="flex items-center space-x-2 text-emerald-900">
                <AlertTriangle className="w-4 h-4 text-[#738a62]" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Recommended Action</h3>
              </div>
              <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                {alertItem.recommendedAction}
              </p>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  onClick={() => onNavigateToResource(alertItem)}
                  className="px-3 py-1.5 bg-[#738a62] hover:bg-[#5f7350] text-white text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1 shadow-2xs"
                >
                  <span>Prioritize & Dispatch</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Activity Log */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-slate-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Incident Activity Log</h3>
              </div>
              <div className="relative pl-5 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {(alertItem.activityLog || [
                  { timestamp: alertItem.createdAt, description: 'Alert generated by telemetry sensor', actor: 'System' },
                  { timestamp: 'Just now', description: 'Alert details opened in operational drawer', actor: 'Waste Manager' }
                ]).map((log, index) => (
                  <div key={index} className="relative">
                    <div className="absolute -left-[17px] top-1 w-2.5 h-2.5 rounded-full bg-[#738a62] border-2 border-white ring-2 ring-slate-100" />
                    <div className="text-[10px] font-mono text-slate-400">{log.timestamp} &bull; {log.actor}</div>
                    <div className="text-xs text-slate-700 font-medium mt-0.5">{log.description}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between space-x-2">
            {alertItem.status === 'ACTIVE' && (
              <button
                onClick={() => onAcknowledge(alertItem.id)}
                className="flex-1 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
              >
                Acknowledge
              </button>
            )}
            <button
              onClick={() => {
                onClose();
                onSnooze(alertItem);
              }}
              className="flex-1 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Snooze
            </button>
            <button
              onClick={() => {
                onClose();
                onResolve(alertItem);
              }}
              className="flex-1 py-2 text-xs font-bold text-white bg-[#738a62] hover:bg-[#5f7350] rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              Resolve Alert
            </button>
          </div>

        </div>
      </div>
  );
};

export default AlertDetailsDrawer;
