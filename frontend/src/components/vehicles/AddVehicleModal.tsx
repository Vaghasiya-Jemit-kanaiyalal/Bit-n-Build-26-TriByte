import React, { useState } from 'react';
import { X, Truck, Check, AlertCircle } from 'lucide-react';
import type { VehicleItem } from '../../mock/vehicleData';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newVehicle: Partial<VehicleItem>) => void;
}

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    id: `VEH-0${Math.floor(Math.random() * 90 + 25)}`,
    name: '',
    type: 'Compactor' as VehicleItem['type'],
    registration: '',
    capacityKg: 1000,
    energyType: 'Diesel' as VehicleItem['energyType'],
    zone: 'North' as VehicleItem['zone'],
    status: 'Available' as VehicleItem['status'],
    driverName: 'Unassigned'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.registration.trim()) {
      setError('Please fill in vehicle name and registration number.');
      return;
    }
    setError(null);

    onAdd({
      ...formData,
      currentLoadKg: 0,
      assignedRouteId: '—',
      maintenanceStatus: 'Good',
      lastService: '15 Sep 2026',
      nextService: '15 Oct 2026',
      coordinates: '22.3072, 73.1812',
      loadType: 'Mixed Waste',
      routeProgressStops: '0 / 12 stops',
      collectionProgressPercent: 0,
      estimatedCompletion: 'N/A',
      history: [
        {
          time: 'Just now',
          description: 'Vehicle registered and added to fleet pool'
        }
      ],
      maintenanceHistory: []
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-slate-800 rounded-lg text-[#88a573]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Add New Vehicle</h3>
              <p className="text-xs text-slate-400">Register a collection truck into WasteWise fleet</p>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle ID</label>
              <input
                type="text"
                value={formData.id}
                onChange={e => setFormData({ ...formData, id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#738a62]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Name</label>
              <input
                type="text"
                placeholder="e.g. EcoCompactor 09"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#738a62]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as VehicleItem['type'] })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#738a62]"
              >
                <option value="Compactor">Compactor</option>
                <option value="Tipper">Tipper</option>
                <option value="Recycling Truck">Recycling Truck</option>
                <option value="Mini Collection Vehicle">Mini Collection Vehicle</option>
                <option value="Electric Collection Vehicle">Electric Collection Vehicle</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registration No.</label>
              <input
                type="text"
                placeholder="e.g. GJ-01-AB-1234"
                value={formData.registration}
                onChange={e => setFormData({ ...formData, registration: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-mono font-medium text-slate-900 focus:outline-none focus:border-[#738a62]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Capacity (kg)</label>
              <input
                type="number"
                value={formData.capacityKg}
                onChange={e => setFormData({ ...formData, capacityKg: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#738a62]"
                min={100}
                max={5000}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fuel / Energy Type</label>
              <select
                value={formData.energyType}
                onChange={e => setFormData({ ...formData, energyType: e.target.value as VehicleItem['energyType'] })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#738a62]"
              >
                <option value="Diesel">Diesel</option>
                <option value="CNG">CNG</option>
                <option value="Electric">Electric</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Zone</label>
              <select
                value={formData.zone}
                onChange={e => setFormData({ ...formData, zone: e.target.value })}
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as VehicleItem['status'] })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#738a62]"
              >
                <option value="Available">Available</option>
                <option value="Idle">Idle</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Driver (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Ramesh Patel or leave Unassigned"
              value={formData.driverName}
              onChange={e => setFormData({ ...formData, driverName: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#738a62]"
            />
          </div>

          {/* Form Actions */}
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
              <Check className="w-4 h-4 mr-1" />
              <span>Add Vehicle</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AddVehicleModal;
