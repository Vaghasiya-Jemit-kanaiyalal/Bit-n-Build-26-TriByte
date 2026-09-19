import React, { useState, useEffect } from 'react';
import type { UserSession } from '../../types/auth';
import type { DriverRouteStop } from '../../types/driver';
import { driverService } from '../../services/driver/driverService';
import DriverHeader from './DriverHeader';
import BinDetailsDrawer from './BinDetailsDrawer';
import CollectionConfirmModal from './CollectionConfirmModal';
import ReportIssueModal from './ReportIssueModal';
import { Trash2, MapPin, Search, Eye, PackageCheck } from 'lucide-react';

interface DriverBinsPageProps {
  user: UserSession;
  onNavigateTab: (tab: string) => void;
}

export const DriverBinsPage: React.FC<DriverBinsPageProps> = ({ user, onNavigateTab }) => {
  const [stops, setStops] = useState<DriverRouteStop[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDrawerStop, setSelectedDrawerStop] = useState<DriverRouteStop | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [selectedConfirmStop, setSelectedConfirmStop] = useState<DriverRouteStop | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [selectedReportStop, setSelectedReportStop] = useState<DriverRouteStop | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  const loadData = async () => {
    const route = await driverService.getCurrentRoute();
    setStops(route.stops);
  };

  useEffect(() => {
    loadData();
    const unsub = driverService.subscribe(loadData);
    return () => unsub();
  }, []);

  const filteredStops = stops.filter(
    (s) =>
      s.binId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.wasteType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col pb-12">
      <DriverHeader user={user} onNavigateTab={onNavigateTab} />

      <main className="p-4 sm:p-6 max-w-7xl w-full mx-auto flex flex-col gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trash2 className="w-5 h-5 text-emerald-700" />
              <h2 className="text-lg font-extrabold text-slate-900">Assigned Route Bins</h2>
            </div>
            <p className="text-xs text-slate-500">
              Assigned smart waste containers along your active collection route (RT-028).
            </p>
          </div>

          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Bin ID, Location or Waste..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl bg-slate-50 text-slate-900 text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>
        </div>

        {/* Bins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStops.map((stop) => {
            const isCritical = stop.priority === 'CRITICAL' || stop.fillLevel >= 90;
            return (
              <div
                key={stop.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-base font-extrabold font-mono text-slate-900">{stop.binId}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                      isCritical ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {stop.priority} PRIORITY
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{stop.location}</span>
                  </p>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs mb-3">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Category</span>
                      <span className="font-bold text-slate-900">{stop.wasteType}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Fill Level</span>
                      <span className={`font-mono font-extrabold text-sm ${isCritical ? 'text-red-700' : 'text-emerald-800'}`}>
                        {stop.fillLevel}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setSelectedDrawerStop(stop);
                      setIsDrawerOpen(true);
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1 border border-slate-200 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Details</span>
                  </button>

                  {stop.status !== 'COMPLETED' && (
                    <button
                      onClick={() => {
                        setSelectedConfirmStop(stop);
                        setIsConfirmModalOpen(true);
                      }}
                      className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1 border-none cursor-pointer shadow-xs"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>Collect</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <BinDetailsDrawer
        isOpen={isDrawerOpen}
        stop={selectedDrawerStop}
        onClose={() => setIsDrawerOpen(false)}
        onStartCollection={(st) => driverService.startStop(st.id)}
        onMarkCollected={(st) => {
          setSelectedConfirmStop(st);
          setIsConfirmModalOpen(true);
        }}
        onReportIssue={(st) => {
          setSelectedReportStop(st);
          setIsReportModalOpen(true);
        }}
      />

      <CollectionConfirmModal
        isOpen={isConfirmModalOpen}
        stop={selectedConfirmStop}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={(id, w) => driverService.completeStop(id, w)}
      />

      <ReportIssueModal
        isOpen={isReportModalOpen}
        stop={selectedReportStop}
        onClose={() => setIsReportModalOpen(false)}
        onSubmitIssue={(inp) => driverService.reportIssue(inp)}
      />
    </div>
  );
};

export default DriverBinsPage;
