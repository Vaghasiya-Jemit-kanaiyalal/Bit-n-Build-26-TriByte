import React, { useState, useEffect } from 'react';
import type { PlatformUser } from '../../../types/user';
import { Truck, MapPin, Route as RouteIcon, X } from 'lucide-react';

interface AssignmentModalProps {
  isOpen: boolean;
  user: PlatformUser | null;
  onClose: () => void;
  onSave: (userId: string, assignment: { zone: string; vehicleId: string; routeId: string }) => void;
  onRemove: (userId: string) => void;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  user,
  onClose,
  onSave,
  onRemove,
}) => {
  const [zone, setZone] = useState('Central Zone');
  const [vehicleId, setVehicleId] = useState('TRK-021');
  const [routeId, setRouteId] = useState('R-104');

  useEffect(() => {
    if (user) {
      setZone(user.zone || 'Central Zone');
      setVehicleId(user.assignedVehicleId || 'TRK-021');
      setRouteId(user.assignedRouteId || 'R-104');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const availableVehicles = [
    { id: 'TRK-021', name: 'Compactor Truck 10t', status: 'Available', zone: 'Central Zone' },
    { id: 'TRK-014', name: 'Recycling Truck 8t', status: 'Available', zone: 'North Zone' },
    { id: 'TRK-033', name: 'Electric Mini Hauler 4t', status: 'Available', zone: 'East Zone' },
    { id: 'TRK-042', name: 'Heavy Dump Compactor 14t', status: 'Available', zone: 'South Zone' },
    { id: 'TRK-055', name: 'Roll-off Truck 12t', status: 'Available', zone: 'Industrial Zone' },
    { id: 'TRK-099', name: 'Maintenance Van 5t', status: 'Under Maintenance', zone: 'West Zone', disabled: true },
  ];

  const availableRoutes = [
    { id: 'R-104', name: 'Central Business Loop', zone: 'Central Zone', stops: 18 },
    { id: 'R-101', name: 'North Residential Sector 4', zone: 'North Zone', stops: 24 },
    { id: 'R-102', name: 'East Commercial Corridor', zone: 'East Zone', stops: 15 },
    { id: 'R-105', name: 'South Industrial Dump Circuit', zone: 'South Zone', stops: 12 },
    { id: 'R-108', name: 'West Suburb Collection', zone: 'West Zone', stops: 20 },
  ];

  const zones = ['Central Zone', 'North Zone', 'South Zone', 'East Zone', 'West Zone', 'Industrial Zone', 'Residential Zone'];

  const handleSave = () => {
    onSave(user.id, { zone, vehicleId, routeId });
    onClose();
  };

  const handleRemoveAssignment = () => {
    onRemove(user.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000000] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Driver Operational Assignment</h3>
              <p className="text-xs text-slate-500">Assign vehicle, route, and zone to driver.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Driver summary card */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900">{user.fullName}</p>
                <p className="text-[11px] text-slate-500 font-mono">{user.email} • {user.userCode}</p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded font-mono">
                DRIVER
              </span>
            </div>
          </div>

          {/* Zone Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Operational Zone
            </label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white text-xs font-medium text-slate-800 focus:ring-1 focus:ring-slate-500 focus:outline-none"
            >
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-slate-400" /> Assign Vehicle
            </label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white text-xs font-mono font-medium text-slate-800 focus:ring-1 focus:ring-slate-500 focus:outline-none"
            >
              {availableVehicles.map((v) => (
                <option key={v.id} value={v.id} disabled={v.disabled}>
                  {v.id} — {v.name} ({v.status}) {v.disabled ? '[DO NOT ASSIGN]' : ''}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400 mt-1">
              * Vehicles under maintenance or offline cannot be assigned.
            </p>
          </div>

          {/* Route Selector */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <RouteIcon className="w-3.5 h-3.5 text-slate-400" /> Assign Operational Route
            </label>
            <select
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-md bg-white text-xs font-mono font-medium text-slate-800 focus:ring-1 focus:ring-slate-500 focus:outline-none"
            >
              {availableRoutes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} — {r.name} ({r.stops} bin stops)
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={handleRemoveAssignment}
              className="text-red-600 hover:text-red-700 text-xs font-medium hover:underline"
            >
              Remove Current Assignment
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-sm"
              >
                Save Assignment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
