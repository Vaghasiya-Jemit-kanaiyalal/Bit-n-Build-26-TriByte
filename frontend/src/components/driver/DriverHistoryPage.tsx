import React, { useState, useEffect } from 'react';
import type { UserSession } from '../../types/auth';
import type { DriverActivity } from '../../types/driver';
import { driverService } from '../../services/driver/driverService';
import DriverHeader from './DriverHeader';
import { History, CheckCircle2 } from 'lucide-react';

interface DriverHistoryPageProps {
  user: UserSession;
  onNavigateTab: (tab: string) => void;
}

export const DriverHistoryPage: React.FC<DriverHistoryPageProps> = ({ user, onNavigateTab }) => {
  const [activities, setActivities] = useState<DriverActivity[]>([]);

  useEffect(() => {
    driverService.getActivity().then(setActivities);
    const unsub = driverService.subscribe(() => {
      driverService.getActivity().then(setActivities);
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col pb-12">
      <DriverHeader user={user} onNavigateTab={onNavigateTab} />

      <main className="p-4 sm:p-6 max-w-5xl w-full mx-auto flex flex-col gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Collection & Route Activity History</h2>
            <p className="text-xs text-slate-500">
              Audit log of completed pickups, route updates, and logged issues for {user.name}.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col gap-3">
            {activities.map((act) => (
              <div key={act.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900">{act.title}</h4>
                    <p className="text-slate-600 mt-0.5">{act.description}</p>
                  </div>
                </div>
                <span className="font-mono text-slate-400 font-bold shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DriverHistoryPage;
