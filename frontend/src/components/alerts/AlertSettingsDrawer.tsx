import React, { useState } from 'react';
import { X, SlidersHorizontal, ShieldAlert, Clock, Check, Layers } from 'lucide-react';
import { initialAlertRules, type AlertRuleItem } from '../../mock/alertMockData';

interface AlertSettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePreferences: () => void;
}

export const AlertSettingsDrawer: React.FC<AlertSettingsDrawerProps> = ({
  isOpen,
  onClose,
  onSavePreferences,
}) => {
  const [preferences, setPreferences] = useState({
    criticalEmail: true,
    criticalInApp: true,
    highEmail: true,
    highInApp: true,
    aiOverflow: true,
    aiWasteSpike: true,
    routeDelay: true,
    vehicleCapacity: true,
    vehicleMaintenance: true,
    sensorOffline: true,
    sensorBattery: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '06:00'
  });

  const [rules, setRules] = useState<AlertRuleItem[]>(initialAlertRules);

  if (!isOpen) return null;

  const handleToggleRule = (id: string) => {
    setRules(prev => prev.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const handleSave = () => {
    onSavePreferences();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          
          {/* Drawer Header */}
          <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-slate-800 rounded-lg text-[#88a573]">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-white tracking-tight">Alert Preferences</h2>
                <p className="text-xs text-slate-400">Configure notification channels & operational threshold rules</p>
              </div>
            </div>

            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            
            {/* Critical & High Priority Settings */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Severity Notification Channels</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Critical Alerts Email Dispatch</span>
                  <input
                    type="checkbox"
                    checked={preferences.criticalEmail}
                    onChange={e => setPreferences({ ...preferences, criticalEmail: e.target.checked })}
                    className="rounded text-[#738a62] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">Critical Alerts In-App Banner</span>
                  <input
                    type="checkbox"
                    checked={preferences.criticalInApp}
                    onChange={e => setPreferences({ ...preferences, criticalInApp: e.target.checked })}
                    className="rounded text-[#738a62] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-2">
                  <span className="font-semibold text-slate-800">High Priority In-App Banner</span>
                  <input
                    type="checkbox"
                    checked={preferences.highInApp}
                    onChange={e => setPreferences({ ...preferences, highInApp: e.target.checked })}
                    className="rounded text-[#738a62] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Quiet Hours */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                <Clock className="w-4 h-4 text-slate-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Quiet Hours Schedule</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-medium mb-1">Start Time</label>
                  <input
                    type="text"
                    value={preferences.quietHoursStart}
                    onChange={e => setPreferences({ ...preferences, quietHoursStart: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-medium mb-1">End Time</label>
                  <input
                    type="text"
                    value={preferences.quietHoursEnd}
                    onChange={e => setPreferences({ ...preferences, quietHoursEnd: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Active Alert Rules Preview */}
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-[#738a62]" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Active Alert Rules</h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">6 Thresholds</span>
              </div>

              <div className="space-y-2">
                {rules.map((r) => (
                  <div key={r.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-slate-900">{r.name}</div>
                      <div className="text-[10px] text-slate-500">{r.condition}</div>
                    </div>

                    <button
                      onClick={() => handleToggleRule(r.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                        r.enabled
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {r.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Drawer Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#738a62] hover:bg-[#5f7350] rounded-lg shadow-2xs transition-colors flex items-center space-x-1"
            >
              <Check className="w-4 h-4 mr-1" />
              <span>Save Preferences</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AlertSettingsDrawer;
