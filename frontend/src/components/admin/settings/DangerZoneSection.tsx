import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import { showWebsiteToast } from '../../common/NotificationToast';

interface DangerZoneSectionProps {
  onResetAllSettings: () => void;
}

export const DangerZoneSection: React.FC<DangerZoneSectionProps> = ({ onResetAllSettings }) => {
  const [activeModalAction, setActiveModalAction] = useState<string | null>(null);

  const handleExecuteAction = () => {
    if (activeModalAction === 'resetConfig') {
      onResetAllSettings();
      showWebsiteToast('All platform configurations reset to factory defaults.', 'warning', 'Configuration Reset');
    } else if (activeModalAction === 'clearDemo') {
      showWebsiteToast('Demo telemetry cache cleared successfully.', 'info', 'Cache Cleared');
    } else if (activeModalAction === 'resetAlerts') {
      showWebsiteToast('Alert notification rules restored to defaults.', 'info', 'Alert Rules Restored');
    }
    setActiveModalAction(null);
  };

  return (
    <div className="bg-red-50/70 border border-red-200 rounded-xl p-5 mt-8 space-y-4">
      <div className="flex items-center space-x-2 border-b border-red-200/80 pb-2.5">
        <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
        <div>
          <h3 className="text-xs font-bold text-red-950 uppercase tracking-wider m-0">
            Advanced & Sensitive Platform Actions
          </h3>
          <p className="text-[11px] text-red-800 font-medium">
            Destructive actions affecting live platform telemetry, rules, and configuration defaults
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        <div className="p-3 bg-white border border-red-200 rounded-lg flex flex-col justify-between space-y-2">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Reset Operational Config</span>
            <span className="text-[10px] text-slate-500 font-medium leading-tight block mt-0.5">
              Restore default collection thresholds, vehicle bounds, and AI settings.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveModalAction('resetConfig')}
            className="w-full px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded text-xs font-bold cursor-pointer transition-colors"
          >
            Reset Configuration
          </button>
        </div>

        <div className="p-3 bg-white border border-red-200 rounded-lg flex flex-col justify-between space-y-2">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Clear Demo Telemetry Cache</span>
            <span className="text-[10px] text-slate-500 font-medium leading-tight block mt-0.5">
              Purge temporary client-side telemetry cache and reset simulated signals.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveModalAction('clearDemo')}
            className="w-full px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-xs font-bold cursor-pointer transition-colors"
          >
            Clear Demo Cache
          </button>
        </div>

        <div className="p-3 bg-white border border-red-200 rounded-lg flex flex-col justify-between space-y-2">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Reset Alert Notification Rules</span>
            <span className="text-[10px] text-slate-500 font-medium leading-tight block mt-0.5">
              Restore default severity rules and active notification channels.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveModalAction('resetAlerts')}
            className="w-full px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded text-xs font-bold cursor-pointer transition-colors"
          >
            Reset Alert Rules
          </button>
        </div>

      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={activeModalAction !== null}
        title={
          activeModalAction === 'resetConfig'
            ? 'Reset All Operational Settings?'
            : activeModalAction === 'clearDemo'
            ? 'Clear Telemetry Cache?'
            : 'Reset Alert Notification Rules?'
        }
        description="Are you sure you want to perform this administrative action? Default values will be restored."
        confirmText="Confirm & Proceed"
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
        onConfirm={handleExecuteAction}
        onCancel={() => setActiveModalAction(null)}
      />

    </div>
  );
};

export default DangerZoneSection;
