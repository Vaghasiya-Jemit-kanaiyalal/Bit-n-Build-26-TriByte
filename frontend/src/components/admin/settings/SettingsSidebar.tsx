import React from 'react';
import {
  Building2,
  User,
  Recycle,
  Trash2,
  Route,
  Truck,
  BrainCircuit,
  Bell,
  Users,
  Shield,
  Palette,
  Database,
  Info
} from 'lucide-react';
import type { SettingsSectionId } from '../../../types/settings';

interface SettingsSidebarProps {
  activeSection: SettingsSectionId;
  onSelectSection: (sectionId: SettingsSectionId) => void;
}

export const SettingsSidebar: React.FC<SettingsSidebarProps> = ({
  activeSection,
  onSelectSection,
}) => {
  const categories = [
    {
      group: 'GENERAL',
      items: [
        { id: 'organization' as SettingsSectionId, label: 'Organization', desc: 'Operating environment details', icon: Building2 },
        { id: 'profile' as SettingsSectionId, label: 'Profile', desc: 'Admin user details & activity', icon: User },
      ],
    },
    {
      group: 'OPERATIONS',
      items: [
        { id: 'waste' as SettingsSectionId, label: 'Waste Operations', desc: 'Waste rules & categories', icon: Recycle },
        { id: 'bin' as SettingsSectionId, label: 'Bin & Monitoring', desc: 'Thresholds & telemetry rules', icon: Trash2 },
        { id: 'routes' as SettingsSectionId, label: 'Collection & Routes', desc: 'Route engine optimization', icon: Route },
        { id: 'vehicles' as SettingsSectionId, label: 'Vehicles', desc: 'Fleet capacity & maintenance', icon: Truck },
      ],
    },
    {
      group: 'INTELLIGENCE',
      items: [
        { id: 'ai' as SettingsSectionId, label: 'AI & Predictions', desc: 'ML forecasting & engine', icon: BrainCircuit },
      ],
    },
    {
      group: 'COMMUNICATION',
      items: [
        { id: 'alerts' as SettingsSectionId, label: 'Alerts & Notifications', desc: 'Operational exception rules', icon: Bell },
      ],
    },
    {
      group: 'ACCESS',
      items: [
        { id: 'users' as SettingsSectionId, label: 'Users & Access', desc: 'Workforce roles & policies', icon: Users },
        { id: 'security' as SettingsSectionId, label: 'Security', desc: 'Authentication & active sessions', icon: Shield },
      ],
    },
    {
      group: 'SYSTEM',
      items: [
        { id: 'appearance' as SettingsSectionId, label: 'Appearance', desc: 'Theme & workspace density', icon: Palette },
        { id: 'data' as SettingsSectionId, label: 'Data & Export', desc: 'Data retention & backups', icon: Database },
        { id: 'system' as SettingsSectionId, label: 'System Information', desc: 'Platform health & deployment', icon: Info },
      ],
    },
  ];

  return (
    <aside className="w-full lg:w-52 shrink-0 bg-white rounded-xl border border-[#e5e7eb] shadow-2xs p-3 mb-6 lg:mb-0 space-y-4">
      {categories.map((cat) => (
        <div key={cat.group}>
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block mb-1.5 px-2">
            {cat.group}
          </span>
          <div className="space-y-0.5">
            {cat.items.map((item) => {
              const IconComp = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectSection(item.id)}
                  className={`w-full text-left flex items-center space-x-2.5 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer border-none ${
                    isActive
                      ? 'bg-emerald-50 text-[#047857]'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 bg-transparent'
                  }`}
                >
                  <IconComp className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#047857]' : 'text-slate-400'}`} />
                  <span className="text-xs font-semibold block leading-tight truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </aside>
  );
};

export default SettingsSidebar;
