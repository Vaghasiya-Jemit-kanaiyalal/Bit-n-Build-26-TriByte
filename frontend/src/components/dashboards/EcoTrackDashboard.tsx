import React, { useState } from 'react';
import {
  Leaf,
  LayoutDashboard,
  Trash2,
  MapPin,
  Truck,
  Route as RouteIcon,
  BarChart3,
  Bell,
  Users,
  Settings,
  Search,
  LogOut,
  Activity,
  Cpu,
  BrainCircuit,
  CalendarCheck
} from 'lucide-react';
import type { UserSession } from '../../types/auth';
import { RoutePage } from '../routes/RoutePage';
import VehiclesPage from '../vehicles/VehiclesPage';
import AlertsPage from '../alerts/AlertsPage';
import { BinManagement } from '../admin/bins/BinManagement';
import AnalyticsPage from '../analytics/AnalyticsPage';
import { UsersPage } from '../admin/users/UsersPage';
import { AdminSettingsPage } from '../admin/settings/AdminSettingsPage';
import { ClassificationPage } from '../admin/classification/ClassificationPage';
import { AdminPlanningPage } from '../admin/planning/AdminPlanningPage';
import { MonitoringPage } from '../admin/monitoring/MonitoringPage';
import { PredictionPage } from '../admin/predictions/PredictionPage';
import { AdminDashboardPage } from '../admin/dashboard/AdminDashboardPage';

import { DriverPortal } from '../driver/DriverPortal';
import logoImg from '../../assets/logo.png';
import logoTextImg from '../../assets/logo_text.png';

interface EcoTrackDashboardProps {
  user: UserSession;
  onSignOut: () => void;
}

export const EcoTrackDashboard: React.FC<EcoTrackDashboardProps> = ({ user, onSignOut }) => {
  const [activeTab, setActiveTab] = useState<string>('Dashboard');

  // Route protection guard: Redirect Collection Driver to DriverPortal
  const rawRole = (user.role || '').toUpperCase();
  if (rawRole === 'DRIVER' || user.role === 'Collection Driver' || user.displayRole === 'Collection Driver') {
    return <DriverPortal user={user} onSignOut={onSignOut} />;
  }

  const navMain = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Bin Management', icon: Trash2 },
    { name: 'Monitoring', icon: MapPin },
    { name: 'Classification', icon: Cpu },
    { name: 'Predictions', icon: BrainCircuit },
    { name: 'Planning', icon: CalendarCheck },
    { name: 'Route', icon: RouteIcon },
    { name: 'Vehicles', icon: Truck },
    { name: 'Alerts', icon: Bell },
    { name: 'Analytics', icon: BarChart3 },
  ];

  const navAdmin = [
    { name: 'Users', icon: Users },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-row overflow-x-hidden">

      {/* LEFT SIDEBAR */}
      <aside className="w-52 bg-white border-r border-slate-200 flex flex-col justify-between p-3 shrink-0 shadow-xs z-20">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-1.5 px-1 py-1 mb-4">
            <img src={logoImg} alt="EcoTrack Logo" className="h-7 w-auto object-contain" />
            <img src={logoTextImg} alt="EcoTrack Brand" className="h-5 w-auto object-contain" />
          </div>

          {/* MAIN Navigation */}
          <div className="mb-5">
            <span className="px-1.5 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block mb-1.5">MAIN</span>
            <nav className="flex flex-col gap-0.5">
              {navMain.map((item) => {
                const IconComp = item.icon;
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveTab(item.name)}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${isActive
                        ? 'bg-emerald-50 text-[#047857]'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                  >
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-[#047857]' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* ADMINISTRATION Navigation */}
          <div>
            <span className="px-1.5 text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block mb-1.5">ADMINISTRATION</span>
            <nav className="flex flex-col gap-0.5">
              {navAdmin.map((item) => {
                const IconComp = item.icon;
                const isActive = activeTab === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => setActiveTab(item.name)}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${isActive
                        ? 'bg-emerald-50 text-[#047857]'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                  >
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-[#047857]' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer Tagline */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-1.5 px-1 text-slate-500">
          <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-700 leading-tight">Cleaner Today</span>
            <span className="text-[9px] font-semibold text-slate-500 leading-tight">Greener Tomorrow</span>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* TOP NAVBAR */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between gap-4 sticky top-0 z-10 shadow-xs">
          {/* Search Bar */}
          <div className="relative flex items-center max-w-md w-full">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
            <input
              placeholder="Search bins, locations, vehicles, or reports..."
              type="text"
              className="w-full pl-10 pr-4 py-2 bg-slate-100/80 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-transparent focus:outline-none focus:bg-white focus:border-slate-300 transition-all"
            />
          </div>

          {/* Right Status Controls */}
          <div className="flex items-center gap-4 shrink-0">
            {/* High Priority Tag */}
            <div className="hidden md:flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
              <span>High - 74/100</span>
            </div>

            {/* Date Time */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span>Sep 19, 2026 11:24 AM</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 cursor-pointer border-none bg-transparent">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                3
              </span>
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-full bg-[#064e3b] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'JV'}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 leading-tight">{user.name || 'Jemit Vaghasiya'}</span>
                <span className="text-[10px] text-slate-500 font-semibold leading-tight">{user.role || 'Waste Manager'}</span>
              </div>
              <button
                onClick={onSignOut}
                title="Sign Out"
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer border-none bg-transparent ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* DASHBOARD BODY */}
        {activeTab === 'Bin Management' || activeTab === 'Bins' ? (
          <BinManagement onNavigateTab={(tab) => setActiveTab(tab)} />
        ) : activeTab === 'Route' || activeTab === 'Routes' ? (
          <RoutePage />
        ) : activeTab === 'Vehicles' || activeTab === 'Vehicle' ? (
          <VehiclesPage onNavigateToRoute={() => setActiveTab('Route')} />
        ) : activeTab === 'Alerts' || activeTab === 'Alert' ? (
          <AlertsPage onNavigateTab={(tabName) => setActiveTab(tabName)} />
        ) : activeTab === 'Analytics' || activeTab === 'Analytic' ? (
          <AnalyticsPage onNavigateTab={(tabName) => setActiveTab(tabName)} />
        ) : activeTab === 'Classification' || activeTab === 'Classifications' ? (
          <ClassificationPage onNavigateTab={(tabName) => setActiveTab(tabName)} />
        ) : activeTab === 'Users' || activeTab === 'User Management' ? (
          <UsersPage />
        ) : activeTab === 'Settings' || activeTab === 'Setting' ? (
          <AdminSettingsPage onNavigateTab={(tabName) => setActiveTab(tabName)} />
        ) : activeTab === 'Planning' || activeTab === 'Collection Planning' ? (
          <AdminPlanningPage onNavigate={(tabName) => setActiveTab(tabName)} />
        ) : activeTab === 'Monitoring' || activeTab === 'Live Operations' ? (
          <MonitoringPage onNavigateTab={(tabName) => setActiveTab(tabName)} />
        ) : activeTab === 'Predictions' || activeTab === 'Prediction' ? (
          <PredictionPage onNavigateTab={(tabName) => setActiveTab(tabName)} />
        ) : (
          <AdminDashboardPage user={user} onNavigateTab={(tab) => setActiveTab(tab)} />
        )}
      </div>
    </div>
  );
};

export default EcoTrackDashboard;
