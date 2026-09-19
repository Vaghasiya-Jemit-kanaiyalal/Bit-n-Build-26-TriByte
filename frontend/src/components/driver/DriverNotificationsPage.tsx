import React, { useState, useEffect } from 'react';
import type { UserSession } from '../../types/auth';
import type { DriverAlert } from '../../types/driver';
import { driverService } from '../../services/driver/driverService';
import DriverHeader from './DriverHeader';
import { Bell, AlertCircle, AlertTriangle, Check } from 'lucide-react';

interface DriverNotificationsPageProps {
  user: UserSession;
  onNavigateTab: (tab: string) => void;
}

export const DriverNotificationsPage: React.FC<DriverNotificationsPageProps> = ({ user, onNavigateTab }) => {
  const [alerts, setAlerts] = useState<DriverAlert[]>([]);

  const loadAlerts = async () => {
    const res = await driverService.getAlerts();
    setAlerts(res);
  };

  useEffect(() => {
    loadAlerts();
    const unsub = driverService.subscribe(loadAlerts);
    return () => unsub();
  }, []);

  const handleAcknowledge = async (id: string) => {
    await driverService.acknowledgeAlert(id);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col pb-12">
      <DriverHeader user={user} onNavigateTab={onNavigateTab} />

      <main className="p-4 sm:p-6 max-w-4xl w-full mx-auto flex flex-col gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Driver Notifications & Dispatch Alerts</h2>
              <p className="text-xs text-slate-500">
                Operational alerts specifically relevant to your vehicle and assigned route.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
          {alerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-4 rounded-xl border flex items-start justify-between gap-4 text-xs ${
                alt.severity === 'critical'
                  ? 'bg-red-50/80 border-red-200 text-red-900'
                  : 'bg-amber-50/80 border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-start gap-3">
                {alt.severity === 'critical' ? (
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-extrabold text-sm">{alt.title}</h4>
                  <p className="mt-0.5">{alt.description}</p>
                  <span className="text-[10px] opacity-70 font-mono mt-1 block">{alt.timestamp}</span>
                </div>
              </div>

              {!alt.acknowledged && (
                <button
                  onClick={() => handleAcknowledge(alt.id)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 font-bold text-slate-800 hover:bg-slate-50 cursor-pointer shrink-0 transition-all flex items-center gap-1 text-xs"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Acknowledge</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DriverNotificationsPage;
