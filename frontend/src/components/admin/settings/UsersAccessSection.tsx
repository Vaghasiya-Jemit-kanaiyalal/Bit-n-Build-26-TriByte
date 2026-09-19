import React from 'react';
import { Users, Shield, ArrowUpRight } from 'lucide-react';
import type { AccessSettingsData } from '../../../types/settings';

interface UsersAccessSectionProps {
  data: AccessSettingsData;
  onChange: (data: AccessSettingsData) => void;
  onNavigateToUsers?: () => void;
}

export const UsersAccessSection: React.FC<UsersAccessSectionProps> = ({
  data,
  onChange,
  onNavigateToUsers,
}) => {
  const handleChange = (field: keyof AccessSettingsData, val: any) => {
    onChange({ ...data, [field]: val });
  };

  const roles = [
    { title: 'ADMIN', label: 'Waste Manager', desc: 'Full administrative control over all operations, users, fleet & settings', badgeBg: 'bg-[#064e3b] text-white' },
    { title: 'DRIVER', label: 'Field Driver', desc: 'Assigned route navigation, stop collections & vehicle reporting', badgeBg: 'bg-[#047857] text-white' },
    { title: 'ANALYST', label: 'Operations Analyst', desc: 'Analytics dashboards, reports, telemetry insights & monitoring read access', badgeBg: 'bg-teal-700 text-white' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 m-0">Users & Access Policy</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Role definitions, user registration rules, and workforce authentication policies.
          </p>
        </div>

        {onNavigateToUsers && (
          <button
            type="button"
            onClick={onNavigateToUsers}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#064e3b] hover:bg-[#047857] text-white text-xs font-bold rounded-lg shadow-2xs transition-all cursor-pointer border-none"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Manage Users</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Role Cards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {roles.map((r) => (
          <div key={r.title} className="p-4 bg-white border border-[#e5e7eb] rounded-xl shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded font-mono ${r.badgeBg}`}>
                {r.title}
              </span>
              <Shield className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-xs font-bold text-slate-900 m-0">{r.label}</h3>
            <p className="text-[11px] text-slate-500 font-medium m-0 leading-snug">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Access Settings Form */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
          Registration & Session Policies
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Allow Admin User Creation</span>
              <span className="text-[10px] text-slate-500">Enable admins to invite new manager accounts</span>
            </div>
            <input
              type="checkbox"
              checked={data.allowAdminUserCreation}
              onChange={(e) => handleChange('allowAdminUserCreation', e.target.checked)}
              className="w-4 h-4 rounded text-[#047857] focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Require Super-Admin Approval</span>
              <span className="text-[10px] text-slate-500">Mandatory approval before admin activation</span>
            </div>
            <input
              type="checkbox"
              checked={data.requireApprovalForNewAdmin}
              onChange={(e) => handleChange('requireApprovalForNewAdmin', e.target.checked)}
              className="w-4 h-4 rounded text-[#047857] focus:ring-0"
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Session Timeout (Hours)</label>
            <input
              type="number"
              min={1}
              max={24}
              value={data.sessionTimeoutHours}
              onChange={(e) => handleChange('sessionTimeoutHours', Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-mono font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Password Expiration (Days)</label>
            <input
              type="number"
              min={30}
              max={365}
              value={data.passwordExpirationDays}
              onChange={(e) => handleChange('passwordExpirationDays', Number(e.target.value))}
              className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-mono font-bold text-slate-900"
            />
          </div>
        </div>

      </div>

    </div>
  );
};

export default UsersAccessSection;
