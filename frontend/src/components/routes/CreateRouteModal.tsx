import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { RouteItem } from '../../mock/routeData';

interface CreateRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoute: (newRoute: RouteItem) => void;
}

export const CreateRouteModal: React.FC<CreateRouteModalProps> = ({
  isOpen,
  onClose,
  onCreateRoute,
}) => {
  const [routeName, setRouteName] = useState('North Campus Express');
  const [zone, setZone] = useState('Zone A');
  const [vehicleId, setVehicleId] = useState('TRK-04');
  const [driverName, setDriverName] = useState('Arjun Patel');
  const [startTime, setStartTime] = useState('08:30 AM');
  const [binSelectMode, setBinSelectMode] = useState<'priority' | 'critical' | 'manual'>('priority');
  const [selectedBinCount, setSelectedBinCount] = useState(14);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = 'RT-0' + (Math.floor(Math.random() * 80) + 25);
    const newRoute: RouteItem = {
      id: newId,
      name: routeName || 'New Collection Route',
      vehicleId,
      driverName,
      zone,
      startTime,
      estimatedCompletion: '12:00 PM',
      totalDistanceKm: 19.2,
      estimatedTimeMin: 180,
      totalStops: selectedBinCount,
      completedStops: 0,
      vehicleCapacityPercent: 0,
      status: 'Planned',
      priorityStopsCount: 3,
      overflowRiskStopsCount: 1,
      stops: [],
    };

    onCreateRoute(newRoute);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl border border-[#e5e7eb] w-full max-w-lg overflow-hidden flex flex-col text-xs text-[#374151]">
        
        {/* Header */}
        <div className="p-4 border-b border-[#e5e7eb] flex items-center justify-between bg-[#f9fafb]">
          <div>
            <h2 className="text-base font-bold text-[#111827] m-0">Create Collection Route</h2>
            <p className="text-[11px] text-[#6b7280] m-0 mt-0.5">
              Configure parameters, assign fleet vehicles, and select target bins.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#6b7280] hover:text-[#111827] p-1 border-none bg-transparent cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 max-h-[75vh] overflow-y-auto">
          {/* Route Name */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-[#374151]">Route Name</label>
            <input
              type="text"
              value={routeName}
              onChange={(e) => setRouteName(e.target.value)}
              required
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-[#111827] focus:bg-white focus:outline-none focus:border-[#738a62]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Zone */}
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#374151]">Collection Zone</label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-medium text-[#111827] focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="Zone A">Zone A (North Campus)</option>
                <option value="Zone B">Zone B (Central &amp; East)</option>
                <option value="Zone C">Zone C (West Campus)</option>
                <option value="Zone D">Zone D (South Perimeter)</option>
              </select>
            </div>

            {/* Vehicle */}
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#374151]">Vehicle</label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-medium text-[#111827] focus:bg-white focus:outline-none cursor-pointer"
              >
                <option value="TRK-01">TRK-01 (Capacity 1,200 kg)</option>
                <option value="TRK-02">TRK-02 (Capacity 1,500 kg)</option>
                <option value="TRK-03">TRK-03 (Capacity 2,000 kg)</option>
                <option value="TRK-04">TRK-04 (Capacity 1,800 kg)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Driver */}
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#374151]">Driver</label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                required
                className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-[#111827] focus:bg-white focus:outline-none focus:border-[#738a62]"
              />
            </div>

            {/* Start Time */}
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#374151]">Start Time</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-[#111827] focus:bg-white focus:outline-none focus:border-[#738a62]"
              />
            </div>
          </div>

          {/* Bin Selection Mode */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-[#f3f4f6]">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#374151]">Bin Selection Criteria</label>
              <span className="text-[11px] font-bold text-[#738a62] bg-[#738a62]/10 px-2 py-0.5 rounded">
                {selectedBinCount} bins selected
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setBinSelectMode('priority');
                  setSelectedBinCount(14);
                }}
                className={`py-1.5 px-2 rounded border text-[11px] font-semibold transition-all cursor-pointer ${
                  binSelectMode === 'priority'
                    ? 'bg-[#738a62]/15 text-[#738a62] border-[#738a62]'
                    : 'bg-[#f9fafb] text-[#4b5563] border-[#d1d5db]'
                }`}
              >
                Select Priority Bins
              </button>
              <button
                type="button"
                onClick={() => {
                  setBinSelectMode('critical');
                  setSelectedBinCount(6);
                }}
                className={`py-1.5 px-2 rounded border text-[11px] font-semibold transition-all cursor-pointer ${
                  binSelectMode === 'critical'
                    ? 'bg-red-50 text-red-700 border-red-300'
                    : 'bg-[#f9fafb] text-[#4b5563] border-[#d1d5db]'
                }`}
              >
                Select Critical (&gt;80%)
              </button>
              <button
                type="button"
                onClick={() => {
                  setBinSelectMode('manual');
                  setSelectedBinCount(18);
                }}
                className={`py-1.5 px-2 rounded border text-[11px] font-semibold transition-all cursor-pointer ${
                  binSelectMode === 'manual'
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-[#f9fafb] text-[#4b5563] border-[#d1d5db]'
                }`}
              >
                Select Manually
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#e5e7eb] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-[#4b5563] bg-white hover:bg-[#f3f4f6] border border-[#d1d5db] rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#738a62] hover:bg-[#5f7350] rounded border-none shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Route</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
