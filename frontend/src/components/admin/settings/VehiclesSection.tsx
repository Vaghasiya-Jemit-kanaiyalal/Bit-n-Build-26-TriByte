import React from 'react';
import type { VehicleSettingsData } from '../../../types/settings';

interface VehiclesSectionProps {
  data: VehicleSettingsData;
  onChange: (data: VehicleSettingsData) => void;
}

export const VehiclesSection: React.FC<VehiclesSectionProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof VehicleSettingsData, val: any) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 m-0">Vehicles & Fleet Management</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Configure collection vehicle thresholds, maintenance schedules, and fuel compatibility.
        </p>
      </div>

      {/* Vehicle Capacity Thresholds */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
          Fleet Capacity Threshold Rules
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Capacity Warning Level (%)</label>
            <input
              type="number"
              min={60}
              max={85}
              value={data.capacityWarningPercent}
              onChange={(e) => handleChange('capacityWarningPercent', Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#047857]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Capacity Critical Level (%)</label>
            <input
              type="number"
              min={80}
              max={95}
              value={data.capacityCriticalPercent}
              onChange={(e) => handleChange('capacityCriticalPercent', Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-mono font-bold text-amber-800 focus:outline-none focus:border-[#047857]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Maintenance Reminder (Distance)</label>
            <div className="relative">
              <input
                type="number"
                min={100}
                max={2000}
                value={data.maintenanceReminderKm}
                onChange={(e) => handleChange('maintenanceReminderKm', Number(e.target.value))}
                className="w-full pl-3 pr-8 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#047857]"
              />
              <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-bold">km</span>
            </div>
          </div>
        </div>

        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center space-x-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={data.autoMaintenanceAlerts}
              onChange={(e) => handleChange('autoMaintenanceAlerts', e.target.checked)}
              className="rounded text-[#047857] focus:ring-0"
            />
            <span className="text-xs font-bold text-slate-800">Auto Maintenance Alerts</span>
          </label>

          <label className="flex items-center space-x-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={data.requireVehicleInspectionBeforeRoute}
              onChange={(e) => handleChange('requireVehicleInspectionBeforeRoute', e.target.checked)}
              className="rounded text-[#047857] focus:ring-0"
            />
            <span className="text-xs font-bold text-slate-800">Require Pre-Route Inspection</span>
          </label>
        </div>
      </div>

      {/* Vehicle & Energy Compatibility */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
          Supported Fleet Energy & Powertrain Types
        </h3>

        <div className="flex flex-wrap gap-2">
          {data.supportedEnergyTypes.map((energy) => (
            <span key={energy} className="px-3 py-1 bg-emerald-50 text-[#047857] rounded-md border border-emerald-200 text-xs font-bold">
              {energy}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
};

export default VehiclesSection;
