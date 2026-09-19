import React from 'react';
import { X, Wrench, CheckCircle, Clock } from 'lucide-react';
import type { VehicleItem, MaintenanceRecord } from '../../mock/vehicleData';

interface MaintenanceHistoryModalProps {
  vehicle: VehicleItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const defaultMaintenanceHistory: MaintenanceRecord[] = [
  {
    id: 'm1',
    date: '12 Sep 2026',
    serviceType: 'Routine Service',
    mileageKm: 18420,
    status: 'Completed',
    notes: 'Oil and filter inspection, fluid top-up, battery health check'
  },
  {
    id: 'm2',
    date: '12 Aug 2026',
    serviceType: 'Brake Inspection',
    mileageKm: 16900,
    status: 'Completed',
    notes: 'Brake pads replaced, hydraulic pressure tested. No major issues'
  },
  {
    id: 'm3',
    date: '15 Jun 2026',
    serviceType: 'Tire Replacement',
    mileageKm: 14200,
    status: 'Completed',
    notes: 'Front axle tires rotated and balanced'
  }
];

const MaintenanceHistoryModal: React.FC<MaintenanceHistoryModalProps> = ({ vehicle, isOpen, onClose }) => {
  if (!isOpen || !vehicle) return null;

  const records = vehicle.maintenanceHistory && vehicle.maintenanceHistory.length > 0
    ? vehicle.maintenanceHistory
    : defaultMaintenanceHistory;

  return (
    <div className="fixed inset-0 z-[1000000] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-slate-800 rounded-lg text-[#88a573]">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Maintenance History</h3>
              <p className="text-xs text-slate-400">
                Service log for <span className="font-mono text-[#88a573]">{vehicle.id}</span> ({vehicle.name})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Summary Banner */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 font-medium">Last Service: </span>
              <strong className="text-slate-800 font-semibold">{vehicle.lastService}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Next Scheduled: </span>
              <strong className={`font-semibold ${vehicle.maintenanceStatus === 'Overdue' ? 'text-red-600' : 'text-slate-800'}`}>
                {vehicle.nextService}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Condition: </span>
              <strong className="text-emerald-700 font-semibold">Good</strong>
            </div>
          </div>

          {/* Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Service Type</th>
                  <th className="px-4 py-2.5">Mileage</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-slate-700 whitespace-nowrap">{rec.date}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">{rec.serviceType}</td>
                    <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">{rec.mileageKm ? `${rec.mileageKm.toLocaleString()} km` : '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {rec.status === 'Completed' ? (
                        <span className="inline-flex items-center text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Clock className="w-3 h-3 mr-1" />
                          {rec.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs">{rec.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default MaintenanceHistoryModal;
