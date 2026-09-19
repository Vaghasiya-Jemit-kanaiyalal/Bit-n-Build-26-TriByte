import React from 'react';
import {
  Leaf,
  LayoutDashboard,
  Route as RouteIcon,
  Trash2,
  PackageCheck,
  Truck,
  History,
  Bell,
  User,
  Settings,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import type { UserSession } from '../../types/auth';

interface DriverSidebarProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  user: UserSession;
  onSignOut: () => void;
  notificationCount?: number;
}

export const DriverSidebar: React.FC<DriverSidebarProps> = ({
  activeTab,
  onNavigateTab,
  user,
  onSignOut,
  notificationCount = 3,
}) => {
  const navMain = [
    { id: 'Dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'My Route', name: 'My Route', icon: RouteIcon },
    { id: 'Bins', name: 'Bins', icon: Trash2 },
    { id: 'Collection', name: 'Collection', icon: PackageCheck },
    { id: 'Vehicle', name: 'Vehicle', icon: Truck },
    { id: 'History', name: 'History', icon: History },
  ];

  const navOther = [
    { id: 'Notifications', name: 'Notifications', icon: Bell, badge: notificationCount },
    { id: 'Profile', name: 'Profile', icon: User },
    { id: 'Settings', name: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shrink-0 shadow-sm z-20">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-2 py-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center shadow-md">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold text-emerald-950 leading-tight tracking-tight">EcoTrack</span>
            <span className="text-[11px] font-bold text-emerald-700 leading-none flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Field Driver App
            </span>
          </div>
        </div>

        {/* Driver Profile Summary Card */}
        <div className="mx-1 mb-6 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
            {user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'RP'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">{user.name || 'Rahul Patel'}</p>
            <p className="text-[10px] font-semibold text-emerald-800 truncate">{user.displayRole || 'Collection Driver'}</p>
          </div>
        </div>

        {/* MAIN Navigation */}
        <div className="mb-6">
          <span className="px-2 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block mb-2">MAIN</span>
          <nav className="flex flex-col gap-1">
            {navMain.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigateTab(item.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* OTHER Navigation */}
        <div>
          <span className="px-2 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block mb-2">OTHER</span>
          <nav className="flex flex-col gap-1">
            {navOther.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigateTab(item.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-none ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge ? (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-white text-emerald-800' : 'bg-red-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Sign Out */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-slate-500">
          <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-[11px] font-bold text-slate-700">Field Operational Hub</span>
        </div>
        <button
          onClick={onSignOut}
          title="Sign Out"
          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer border-none bg-transparent"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};

export default DriverSidebar;
