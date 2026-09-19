import React from 'react';
import type { AppearanceSettingsData } from '../../../types/settings';

interface AppearanceSectionProps {
  data: AppearanceSettingsData;
  onChange: (data: AppearanceSettingsData) => void;
}

export const AppearanceSection: React.FC<AppearanceSectionProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof AppearanceSettingsData, val: any) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 m-0">Appearance & Workspace Preferences</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Configure theme style, component density, sidebar layout, and live telemetry refresh rates.
        </p>
      </div>

      {/* Theme & Density Options */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs space-y-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Theme Mode</label>
            <select
              value={data.theme}
              onChange={(e) => handleChange('theme', e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-bold text-slate-900"
            >
              <option value="Light">Light Enterprise (Default)</option>
              <option value="Dark">Dark Mode</option>
              <option value="System">Match System Preference</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Component Density</label>
            <select
              value={data.density}
              onChange={(e) => handleChange('density', e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-bold text-slate-900"
            >
              <option value="Comfortable">Comfortable (Standard Padding)</option>
              <option value="Compact">Compact Data-Dense Layout</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Sidebar Mode</label>
            <select
              value={data.sidebarMode}
              onChange={(e) => handleChange('sidebarMode', e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-bold text-slate-900"
            >
              <option value="Expanded">Expanded (With Labels)</option>
              <option value="Collapsed">Icons Only</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Dashboard Auto Refresh (Seconds)</label>
            <input
              type="number"
              min={10}
              max={120}
              value={data.dashboardAutoRefreshSeconds}
              onChange={(e) => handleChange('dashboardAutoRefreshSeconds', Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-mono font-bold text-slate-900"
            />
          </div>
        </div>

      </div>

    </div>
  );
};

export default AppearanceSection;
