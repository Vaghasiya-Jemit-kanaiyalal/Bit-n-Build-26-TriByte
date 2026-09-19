import React from 'react';
import { ShieldCheck, Activity } from 'lucide-react';
import type { AdminProfileSettings } from '../../../types/settings';

interface ProfileSectionProps {
  data: AdminProfileSettings;
  onChange: (data: AdminProfileSettings) => void;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof AdminProfileSettings, val: any) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 m-0">Admin Profile</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Manage system administrator credentials, contact information and session activity.
        </p>
      </div>

      {/* Admin User Pill Header */}
      <div className="p-4 bg-white border border-[#e5e7eb] rounded-xl shadow-2xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-[#064e3b] text-white font-extrabold text-base flex items-center justify-center shadow-xs">
            {data.firstName[0]}{data.lastName[0]}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900 m-0">{data.firstName} {data.lastName}</h3>
              <span className="px-2 py-0.5 bg-emerald-100 text-[#047857] rounded border border-emerald-200 text-[10px] font-mono font-bold">
                {data.role}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium block mt-0.5">{data.roleTitle}</span>
          </div>
        </div>

        <div className="text-right text-xs">
          <span className="text-[10px] text-slate-400 font-bold block uppercase">Account Status</span>
          <span className="inline-flex items-center space-x-1 text-emerald-700 font-bold text-xs">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span>{data.lastActive}</span>
          </span>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">First Name</label>
            <input
              type="text"
              value={data.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-slate-900 focus:outline-none focus:border-[#047857]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Last Name</label>
            <input
              type="text"
              value={data.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-slate-900 focus:outline-none focus:border-[#047857]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-slate-900 focus:outline-none focus:border-[#047857]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Phone Number</label>
            <input
              type="text"
              value={data.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-slate-900 focus:outline-none focus:border-[#047857]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Assigned Role (Non-editable)</label>
            <div className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded text-xs text-slate-600 font-bold flex items-center justify-between">
              <span>ADMIN &bull; Waste Manager</span>
              <ShieldCheck className="w-4 h-4 text-[#047857]" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Primary Operations Zone</label>
            <input
              type="text"
              value={data.zone}
              onChange={(e) => handleChange('zone', e.target.value)}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs text-slate-900 focus:outline-none focus:border-[#047857]"
            />
          </div>

        </div>
      </div>

      {/* Account Activity Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">Account Activity Log</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Last Login</span>
            <strong className="text-slate-900 font-mono text-[11px]">{data.lastLogin}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Current Session</span>
            <strong className="text-slate-900 font-mono text-[11px] truncate block">{data.currentSession}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Created</span>
            <strong className="text-slate-900 font-mono text-[11px]">{data.accountCreated}</strong>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">2FA Status</span>
            <strong className="text-slate-700 font-mono text-[11px]">Enforced via SSO</strong>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProfileSection;
