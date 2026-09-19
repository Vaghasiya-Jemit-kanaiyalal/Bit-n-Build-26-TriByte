import React, { useState, useEffect } from 'react';
import type { UserSession } from '../../types/auth';
import type { DriverVehicle } from '../../types/driver';
import { driverService } from '../../services/driver/driverService';
import DriverHeader from './DriverHeader';
import ReportIssueModal from './ReportIssueModal';
import { Truck, ShieldCheck, AlertTriangle, Scale } from 'lucide-react';

interface DriverVehiclePageProps {
  user: UserSession;
  onNavigateTab: (tab: string) => void;
}

export const DriverVehiclePage: React.FC<DriverVehiclePageProps> = ({ user, onNavigateTab }) => {
  const [vehicle, setVehicle] = useState<DriverVehicle | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  const loadVehicle = async () => {
    const v = await driverService.getVehicle();
    setVehicle(v);
  };

  useEffect(() => {
    loadVehicle();
    const unsub = driverService.subscribe(loadVehicle);
    return () => unsub();
  }, []);

  if (!vehicle) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col pb-12">
      <DriverHeader user={user} onNavigateTab={onNavigateTab} />

      <main className="p-4 sm:p-6 max-w-5xl w-full mx-auto flex flex-col gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-500">{vehicle.registration}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-800 uppercase">
                  {vehicle.status}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
                {vehicle.code} &bull; {vehicle.type}
              </h2>
            </div>
          </div>

          <button
            onClick={() => setIsReportModalOpen(true)}
            className="py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-red-200 transition-all"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Report Vehicle Issue</span>
          </button>
        </div>

        {/* Payload & Utilization */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <h3 className="text-base font-extrabold text-slate-900 mb-3 flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-700" />
            <span>Assigned Vehicle Payload Utilization</span>
          </h3>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-4">
            <div className="flex items-center justify-between text-sm font-bold text-slate-900 mb-2">
              <span>Current Weight Load</span>
              <span className="font-mono text-emerald-800">
                {vehicle.currentLoadTons} t / {vehicle.capacityTons} t ({vehicle.utilizationPct}%)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-700 rounded-full transition-all duration-500"
                style={{ width: `${vehicle.utilizationPct}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Engine / Fuel</span>
              <span className="font-bold text-slate-900 text-sm mt-1 block">{vehicle.fuelType}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Next Scheduled Service</span>
              <span className="font-bold text-slate-900 text-sm font-mono mt-1 block">In {vehicle.nextServiceKm} km</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Vehicle Health Check</span>
              <span className="font-bold text-emerald-700 text-sm mt-1 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Passed 100%
              </span>
            </div>
          </div>
        </div>
      </main>

      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitIssue={(input) => driverService.reportIssue(input)}
      />
    </div>
  );
};

export default DriverVehiclePage;
