import React from 'react';
import { Building2, MapPin } from 'lucide-react';
import type { OrganizationSettings } from '../../../types/settings';

interface OrganizationSectionProps {
  data: OrganizationSettings;
  onChange: (data: OrganizationSettings) => void;
}

export const OrganizationSection: React.FC<OrganizationSectionProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof OrganizationSettings, val: any) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 m-0">Organization</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Manage organization details and waste-management operating environment settings.
        </p>
      </div>

      {/* Organization Status Card */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#047857] text-white rounded-lg">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900">{data.name}</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded border border-emerald-300">
                {data.status}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Org ID: {data.id} &bull; Active since {data.activeSince}</span>
          </div>
        </div>
        <div className="text-right text-xs">
          <span className="text-[10px] text-slate-400 block font-medium">Last updated</span>
          <span className="font-mono font-bold text-slate-800 text-[11px]">{data.lastUpdated}</span>
        </div>
      </div>

      {/* Form Fields */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Organization Name</label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-slate-900 focus:outline-none focus:border-[#047857]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Organization ID</label>
            <input
              type="text"
              value={data.id}
              disabled
              className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs text-slate-500 font-mono cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Department</label>
            <input
              type="text"
              value={data.department}
              onChange={(e) => handleChange('department', e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-slate-900 focus:outline-none focus:border-[#047857]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Operating Region</label>
            <input
              type="text"
              value={data.operatingRegion}
              onChange={(e) => handleChange('operatingRegion', e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-slate-900 focus:outline-none focus:border-[#047857]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Default Timezone</label>
            <select
              value={data.defaultTimezone}
              onChange={(e) => handleChange('defaultTimezone', e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-slate-900 focus:outline-none focus:border-[#047857]"
            >
              <option value="Asia/Kolkata (IST +5:30)">Asia/Kolkata (IST +5:30)</option>
              <option value="UTC (GMT +0:00)">UTC (GMT +0:00)</option>
              <option value="America/New_York (EST -5:00)">America/New_York (EST -5:00)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Default Currency</label>
            <input
              type="text"
              value={data.defaultCurrency}
              onChange={(e) => handleChange('defaultCurrency', e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-slate-900 focus:outline-none focus:border-[#047857]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Contact Email</label>
            <input
              type="email"
              value={data.contactEmail}
              onChange={(e) => handleChange('contactEmail', e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-slate-900 focus:outline-none focus:border-[#047857]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Contact Phone</label>
            <input
              type="text"
              value={data.contactPhone}
              onChange={(e) => handleChange('contactPhone', e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-slate-900 focus:outline-none focus:border-[#047857]"
            />
          </div>

        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Municipal Headquarters Address</label>
          <textarea
            rows={2}
            value={data.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-slate-900 focus:outline-none focus:border-[#047857]"
          />
        </div>

        {/* Operating Zones Tag List */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1.5">Active Operating Zones (7)</label>
          <div className="flex flex-wrap gap-1.5">
            {data.operatingZones.map((z) => (
              <span key={z} className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 text-slate-800 rounded border border-slate-200 text-xs font-semibold">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{z}</span>
              </span>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default OrganizationSection;
