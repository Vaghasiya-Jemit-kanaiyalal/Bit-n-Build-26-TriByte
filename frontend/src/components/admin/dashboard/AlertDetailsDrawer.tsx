import React from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { AttentionItem } from '../../../types/dashboard';

interface AlertDetailsDrawerProps {
  alert: AttentionItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const AlertDetailsDrawer: React.FC<AlertDetailsDrawerProps> = ({
  alert,
  isOpen,
  onClose,
  onNavigateTab,
}) => {
  if (!isOpen || !alert) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-red-800 flex items-center justify-center font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-red-700" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-slate-900">{alert.title}</span>
              <span className="text-xs text-slate-500 font-medium">Alert ID: {alert.id}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer border-none bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 flex-1">
          <div className="p-4 bg-red-50/80 rounded-xl border border-red-200 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-red-950 uppercase tracking-wider">Severity</span>
              <span className="text-xs font-mono font-extrabold text-red-700 bg-red-200 px-2 py-0.5 rounded">
                {alert.severity}
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium mt-2 leading-relaxed">{alert.description}</p>
          </div>

          <div className="space-y-2 text-xs font-medium text-slate-600">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Related Entity:</span>
              <span className="font-mono font-bold text-slate-900">{alert.relatedEntityId} ({alert.entityType})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span>Reported Time:</span>
              <span className="font-mono text-slate-800">{alert.timestamp}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200 bg-slate-50 flex gap-2">
          <button
            onClick={() => {
              onClose();
              onNavigateTab('Alerts');
            }}
            className="w-full py-2.5 bg-[#064e3b] text-white hover:bg-[#047857] rounded-xl text-xs font-bold shadow-sm cursor-pointer border-none flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Acknowledge & Resolve Alert</span>
          </button>
        </div>
      </div>
    </div>
  );
};
