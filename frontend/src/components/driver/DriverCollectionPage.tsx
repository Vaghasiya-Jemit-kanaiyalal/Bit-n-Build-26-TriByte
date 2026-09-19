import React, { useState, useEffect } from 'react';
import type { UserSession } from '../../types/auth';
import type { DriverRouteStop } from '../../types/driver';
import { driverService } from '../../services/driver/driverService';
import DriverHeader from './DriverHeader';
import { PackageCheck, CheckCircle2 } from 'lucide-react';

interface DriverCollectionPageProps {
  user: UserSession;
  onNavigateTab: (tab: string) => void;
}

export const DriverCollectionPage: React.FC<DriverCollectionPageProps> = ({ user, onNavigateTab }) => {
  const [completedStops, setCompletedStops] = useState<DriverRouteStop[]>([]);

  const loadData = async () => {
    const route = await driverService.getCurrentRoute();
    setCompletedStops(route.stops.filter((s) => s.status === 'COMPLETED'));
  };

  useEffect(() => {
    loadData();
    const unsub = driverService.subscribe(loadData);
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col pb-12">
      <DriverHeader user={user} onNavigateTab={onNavigateTab} />

      <main className="p-4 sm:p-6 max-w-5xl w-full mx-auto flex flex-col gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Today's Completed Collections</h2>
              <p className="text-xs text-slate-500">
                Verified RFID & weighed bin pickups for active driver session.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
            {completedStops.length} Logged Pickups
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          {completedStops.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No pickups logged as completed yet today.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {completedStops.map((stop) => (
                <div key={stop.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-extrabold text-slate-900 font-mono text-sm">{stop.binId}</span>
                    <span className="text-slate-500 ml-2 font-medium">{stop.location}</span>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Category: <strong className="text-slate-700">{stop.wasteType}</strong> &bull; Cleared at {stop.collectedAt}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-extrabold text-emerald-800 text-sm block">
                      {stop.collectedWeightKg || stop.estimatedWasteKg} kg
                    </span>
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 justify-end">
                      <CheckCircle2 className="w-3 h-3" /> Logged
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DriverCollectionPage;
