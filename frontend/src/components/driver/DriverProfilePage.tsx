import React from 'react';
import type { UserSession } from '../../types/auth';
import DriverHeader from './DriverHeader';
import { Mail, ShieldCheck, Truck, Building } from 'lucide-react';

interface DriverProfilePageProps {
  user: UserSession;
  onNavigateTab: (tab: string) => void;
}

export const DriverProfilePage: React.FC<DriverProfilePageProps> = ({ user, onNavigateTab }) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col pb-12">
      <DriverHeader user={user} onNavigateTab={onNavigateTab} />

      <main className="p-4 sm:p-6 max-w-3xl w-full mx-auto flex flex-col gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-700 text-white text-2xl font-extrabold flex items-center justify-center mb-3 shadow-md">
            {user.name ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'RP'}
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">{user.name || 'Rahul Patel'}</h2>
          <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs mt-1 border border-emerald-200">
            {user.displayRole || 'Collection Driver'}
          </span>
          <p className="text-xs text-slate-500 mt-1">{user.email || 'rahul@driver.gmail.com'}</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-4 text-xs">
          <h3 className="font-extrabold text-sm text-slate-900 pb-2 border-b border-slate-100">
            Field Driver Profile Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Employee Role</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> Collection Driver (DRIVER)
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Assigned Truck</span>
              <span className="font-bold text-slate-900 text-sm font-mono mt-0.5 block flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-purple-600" /> VH-014 (Compactor)
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Organization</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block flex items-center gap-1.5">
                <Building className="w-4 h-4 text-slate-500" /> {user.organization || 'EcoTrack AI Waste Management'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">Email Address</span>
              <span className="font-bold text-slate-900 text-sm mt-0.5 block flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-slate-500" /> {user.email || 'rahul@driver.gmail.com'}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DriverProfilePage;
