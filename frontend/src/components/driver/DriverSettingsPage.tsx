import React, { useState } from 'react';
import type { UserSession } from '../../types/auth';
import DriverHeader from './DriverHeader';
import { Settings, Check } from 'lucide-react';
import { showWebsiteToast } from '../common/NotificationToast';

interface DriverSettingsPageProps {
  user: UserSession;
  onNavigateTab: (tab: string) => void;
}

export const DriverSettingsPage: React.FC<DriverSettingsPageProps> = ({ user, onNavigateTab }) => {
  const [gpsTracking, setGpsTracking] = useState<boolean>(true);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);
  const [autoSync, setAutoSync] = useState<boolean>(true);

  const handleSave = () => {
    showWebsiteToast('Driver preference settings updated successfully.', 'success', 'Settings Saved');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col pb-12">
      <DriverHeader user={user} onNavigateTab={onNavigateTab} />

      <main className="p-4 sm:p-6 max-w-3xl w-full mx-auto flex flex-col gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Driver Application Settings</h2>
            <p className="text-xs text-slate-500">
              Configure telemetry, sound alerts, and field navigation options.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <span className="font-bold text-slate-900 block">Live GPS Location Telemetry</span>
              <span className="text-[11px] text-slate-500">Transmits real-time vehicle coordinates to central dispatch.</span>
            </div>
            <input
              type="checkbox"
              checked={gpsTracking}
              onChange={(e) => setGpsTracking(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <span className="font-bold text-slate-900 block">Critical Bin Audio Alerts</span>
              <span className="text-[11px] text-slate-500">Sound tone when approaching critical overflow bin.</span>
            </div>
            <input
              type="checkbox"
              checked={soundAlerts}
              onChange={(e) => setSoundAlerts(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <span className="font-bold text-slate-900 block">Automatic Offline Sync</span>
              <span className="text-[11px] text-slate-500">Queue completed collections offline and sync automatically.</span>
            </div>
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 cursor-pointer"
            />
          </div>

          <button
            onClick={handleSave}
            className="mt-2 w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer border-none shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save Application Preferences</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default DriverSettingsPage;
