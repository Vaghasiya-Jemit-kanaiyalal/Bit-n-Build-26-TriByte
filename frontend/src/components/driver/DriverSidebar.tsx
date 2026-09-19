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
import homeImg from '../../assets/home.png';

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
    <aside className="w-52 bg-white border-r border-slate-200 flex flex-col justify-between p-3 shrink-0 shadow-xs z-20">
      <div>
        {/* Brand Header — Clickable Favicon & Home Logo to Dashboard */}
        {/* Brand Header — Clickable to Dashboard */}
        <button
          type="button"
          onClick={() => onNavigateTab('Dashboard')}
          className="flex items-center gap-2.5 px-1 py-1 mb-3 cursor-pointer bg-transparent border-none text-left hover:opacity-85 transition-opacity"
          title="Go to Dashboard"
        >
          <div className="flex items-center gap-2">
            <img src={faviconImg} alt="EcoTrack Favicon" className="h-9 w-auto object-contain shrink-0" />
            <img src={homeImg} alt="EcoTrack Home" className="h-8 w-auto object-contain max-w-[130px]" />
          </div>
          <span className="text-[10px] font-bold text-emerald-700 leading-none flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Field Driver App
          </span>
          {/* Brand Header — Clickable to Dashboard */}
          <button
            type="button"
            onClick={() => onNavigateTab('Dashboard')}
            className="flex items-center gap-2 px-1 py-1 mb-3 cursor-pointer bg-transparent border-none text-left hover:opacity-85 transition-opacity"
            title="Go to Dashboard"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center shadow-md shrink-0">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold text-emerald-950 leading-tight tracking-tight">EcoTrack</span>
              <span className="text-[10px] font-bold text-emerald-700 leading-none flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Field Driver App
              </span>
            </div>
          </button>

          {/* Driver Profile Summary Card */}
          <div className="mx-0 mb-4 p-2 rounded-lg bg-emerald-50/70 border border-emerald-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'RP'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{user.name || 'Rahul Patel'}</p>
              <p className="text-[10px] font-semibold text-emerald-800 truncate">{user.displayRole || 'Collection Driver'}</p>
            </div>
          </div>

          {/* MAIN Navigation */}
          <div className="mb-5">
            <span className="px-1.5 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block mb-1.5">MAIN</span>
            <nav className="flex flex-col gap-0.5">
              {navMain.map((item) => {
                const IconComp = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigateTab(item.id)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
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
            <span className="px-1.5 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block mb-1.5">OTHER</span>
            <nav className="flex flex-col gap-0.5">
              {navOther.map((item) => {
                const IconComp = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigateTab(item.id)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge ? (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-white text-emerald-800' : 'bg-red-500 text-white'
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
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-slate-500">
          <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="text-[10px] font-bold text-slate-700">Field Operational Hub</span>
        </div>
        <button
          onClick={onSignOut}
          title="Sign Out"
          className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 cursor-pointer border-none bg-transparent"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};


export default DriverSidebar;
