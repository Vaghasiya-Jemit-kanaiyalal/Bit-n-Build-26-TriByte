import React from 'react';
import type { UserRole } from '../../../types/user';
import { Users, Truck, BarChart3, Shield } from 'lucide-react';

interface RoleDistributionProps {
  counts: Record<UserRole, number>;
  total: number;
  selectedRole?: UserRole | 'All';
  onSelectRole: (role: UserRole | 'All') => void;
}

export const RoleDistribution: React.FC<RoleDistributionProps> = ({
  counts,
  total,
  selectedRole,
  onSelectRole,
}) => {
  const adminCount = counts.ADMIN || 0;
  const driverCount = counts.DRIVER || 0;
  const analystCount = counts.ANALYST || 0;

  const adminPct = total > 0 ? Math.round((adminCount / total) * 100) : 0;
  const driverPct = total > 0 ? Math.round((driverCount / total) * 100) : 0;
  const analystPct = total > 0 ? Math.round((analystCount / total) * 100) : 0;

  const roleConfig = [
    {
      role: 'DRIVER' as UserRole,
      label: 'Collection Drivers',
      count: driverCount,
      percentage: driverPct,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
      icon: Truck,
    },
    {
      role: 'ANALYST' as UserRole,
      label: 'Operations Analysts',
      count: analystCount,
      percentage: analystPct,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      icon: BarChart3,
    },
    {
      role: 'ADMIN' as UserRole,
      label: 'Waste Managers',
      count: adminCount,
      percentage: adminPct,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      icon: Shield,
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-900">Role Distribution</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">{total} Total Registered Users</span>
      </div>

      {/* Segmented bar */}
      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex mb-4">
        <div
          style={{ width: `${driverPct}%` }}
          className="bg-emerald-500 transition-all duration-300 hover:opacity-90 cursor-pointer"
          title={`Collection Drivers: ${driverCount} (${driverPct}%)`}
          onClick={() => onSelectRole(selectedRole === 'DRIVER' ? 'All' : 'DRIVER')}
        />
        <div
          style={{ width: `${analystPct}%` }}
          className="bg-blue-500 transition-all duration-300 hover:opacity-90 cursor-pointer"
          title={`Operations Analysts: ${analystCount} (${analystPct}%)`}
          onClick={() => onSelectRole(selectedRole === 'ANALYST' ? 'All' : 'ANALYST')}
        />
        <div
          style={{ width: `${adminPct}%` }}
          className="bg-purple-500 transition-all duration-300 hover:opacity-90 cursor-pointer"
          title={`Waste Managers: ${adminCount} (${adminPct}%)`}
          onClick={() => onSelectRole(selectedRole === 'ADMIN' ? 'All' : 'ADMIN')}
        />
      </div>

      {/* Legend cards */}
      <div className="grid grid-cols-3 gap-3">
        {roleConfig.map((item) => {
          const Icon = item.icon;
          const isSelected = selectedRole === item.role;
          return (
            <button
              key={item.role}
              onClick={() => onSelectRole(isSelected ? 'All' : item.role)}
              className={`flex items-center justify-between p-2.5 rounded-md border text-left transition-all ${
                isSelected
                  ? `${item.bgColor} ${item.borderColor} ring-2 ring-offset-1 ring-slate-400`
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`p-1.5 rounded ${item.bgColor} ${item.textColor}`}>
                  <Icon className="w-3.5 h-3.5" />
                </span>
                <div className="truncate">
                  <p className="text-xs font-medium text-slate-800 truncate">{item.label}</p>
                  <p className="text-[11px] text-slate-500">{item.percentage}% of total</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-900 font-mono ml-2">
                {item.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
