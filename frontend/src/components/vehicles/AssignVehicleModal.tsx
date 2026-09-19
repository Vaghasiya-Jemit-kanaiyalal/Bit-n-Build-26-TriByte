import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Navigation, User, MapPin, Clock, AlertCircle } from 'lucide-react';
import type { VehicleItem } from '../../mock/vehicleData';

interface AssignVehicleModalProps {
  vehicle: VehicleItem | null;
  allVehicles: VehicleItem[];
  isOpen: boolean;
  onClose: () => void;
  onAssignConfirm: (vehicleId: string, driver: string, route: string, zone: string, startTime: string, endTime: string) => void;
}

const AssignVehicleModal: React.FC<AssignVehicleModalProps> = ({
  vehicle,
  allVehicles,
  isOpen,
  onClose,
  onAssignConfirm
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [selectedDriver, setSelectedDriver] = useState<string>('Arjun Patel');
  const [selectedRoute, setSelectedRoute] = useState<string>('RT-024');
  const [selectedZone, setSelectedZone] = useState<string>('North');
  const [startTime, setStartTime] = useState<string>('08:30 AM');
  const [expectedCompletion, setExpectedCompletion] = useState<string>('12:30 PM');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    if (vehicle) {
      setSelectedVehicleId(vehicle.id);
      setSelectedDriver(vehicle.driverName !== 'Unassigned' ? vehicle.driverName : 'Arjun Patel');
      setSelectedRoute(vehicle.assignedRouteId !== '—' ? vehicle.assignedRouteId : 'RT-024');
      setSelectedZone(vehicle.zone);
    } else if (allVehicles.length > 0) {
      setSelectedVehicleId(allVehicles[0].id);
      setSelectedDriver(allVehicles[0].driverName !== 'Unassigned' ? allVehicles[0].driverName : 'Arjun Patel');
      setSelectedRoute('RT-024');
      setSelectedZone(allVehicles[0].zone);
    }
  }, [vehicle, allVehicles]);

  if (!isOpen) return null;

  const currentVehicleObj = allVehicles.find(v => v.id === selectedVehicleId) || vehicle;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId || !selectedDriver || !selectedRoute) {
      setError('Please select vehicle, driver, and route.');
      return;
    }
    setError(null);

    onAssignConfirm(selectedVehicleId, selectedDriver, selectedRoute, selectedZone, startTime, expectedCompletion);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000000] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-slate-800 rounded-lg text-[#88a573]">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Assign Vehicle to Route</h3>
              <p className="text-xs text-slate-400">Configure driver, collection zone & route dispatch</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-xs text-red-700 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Select Vehicle */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Vehicle</label>
            <select
              value={selectedVehicleId}
              onChange={e => {
                const vid = e.target.value;
                setSelectedVehicleId(vid);
                const found = allVehicles.find(v => v.id === vid);
                if (found) setSelectedZone(found.zone);
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#738a62]"
            >
              {allVehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.id} - {v.name} ({v.type}) [{v.status}]
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Select Driver */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Driver</label>
              <select
                value={selectedDriver}
                onChange={e => setSelectedDriver(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#738a62]"
              >
                <option value="Arjun Patel">Arjun Patel (Active)</option>
                <option value="Neha Shah">Neha Shah (Active)</option>
                <option value="Rohan Patel">Rohan Patel (Active)</option>
                <option value="Vikram Singh">Vikram Singh (Available)</option>
                <option value="Priya Sharma">Priya Sharma (Available)</option>
                <option value="Karan Desai">Karan Desai (Available)</option>
              </select>
            </div>

            {/* Select Route */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Route</label>
              <select
                value={selectedRoute}
                onChange={e => setSelectedRoute(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#738a62]"
              >
                <option value="RT-024">RT-024 (North Zone)</option>
                <option value="RT-021">RT-021 (West Zone)</option>
                <option value="RT-019">RT-019 (East Zone)</option>
                <option value="RT-015">RT-015 (Central Zone)</option>
                <option value="RT-031">RT-031 (South Zone)</option>
                <option value="RT-040">RT-040 (Commercial Loop)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Collection Zone</label>
              <select
                value={selectedZone}
                onChange={e => setSelectedZone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#738a62]"
              >
                <option value="North">North Zone</option>
                <option value="South">South Zone</option>
                <option value="East">East Zone</option>
                <option value="West">West Zone</option>
                <option value="Central">Central Zone</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
              <input
                type="text"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#738a62]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Completion</label>
              <input
                type="text"
                value={expectedCompletion}
                onChange={e => setExpectedCompletion(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#738a62]"
              />
            </div>
          </div>

          {/* Assignment Summary Box */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Assignment Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-1.5 text-slate-700">
                <Navigation className="w-3.5 h-3.5 text-[#738a62]" />
                <span>Vehicle: <strong className="text-slate-900">{currentVehicleObj?.id || selectedVehicleId}</strong> ({currentVehicleObj?.name})</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-700">
                <User className="w-3.5 h-3.5 text-[#738a62]" />
                <span>Driver: <strong className="text-slate-900">{selectedDriver}</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-700">
                <MapPin className="w-3.5 h-3.5 text-[#738a62]" />
                <span>Route & Zone: <strong className="text-slate-900">{selectedRoute}</strong> ({selectedZone})</span>
              </div>
              <div className="flex items-center space-x-1.5 text-slate-700">
                <Clock className="w-3.5 h-3.5 text-[#738a62]" />
                <span>Schedule: <strong className="text-slate-900">{startTime} - {expectedCompletion}</strong></span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-[#738a62] hover:bg-[#5f7350] rounded-lg shadow-2xs transition-colors flex items-center space-x-1"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              <span>Assign Vehicle</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AssignVehicleModal;
