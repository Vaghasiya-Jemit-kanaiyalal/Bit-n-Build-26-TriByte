import React, { useState, useEffect, Suspense } from 'react';
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
  CalendarCheck,
  FileText,
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
import { DriverDashboardPreview } from './DriverDashboardPreview';
import { AnalystDashboardPreview } from './AnalystDashboardPreview';
import { ErrorBoundary } from '../common/ErrorBoundary';

import { PredictionAnalyticsPage } from '../analyst/prediction/PredictionAnalyticsPage';
import { CollectionAnalyticsPage } from '../analyst/collection/CollectionAnalyticsPage';
import { AreaAnalysisPage } from '../analyst/area/AreaAnalysisPage';
import { RecyclingAnalyticsPage } from '../analyst/recycling/RecyclingAnalyticsPage';
import { ReportsPage } from '../analyst/reports/ReportsPage';

const getTabFromPath = (path: string, role: string): string => {
  const p = (path || '').toLowerCase();
  if (role === 'ADMIN') {
    if (p.startsWith('/admin/users')) return 'Users';
    if (p.startsWith('/admin/bins')) return 'Bins';
    if (p.startsWith('/admin/monitoring')) return 'Monitoring';
    if (p.startsWith('/admin/classification')) return 'Classification';
    if (p.startsWith('/admin/predictions')) return 'Predictions';
    if (p.startsWith('/admin/planning')) return 'Planning';
    if (p.startsWith('/admin/routes') || p.startsWith('/admin/route')) return 'Routes';
    if (p.startsWith('/admin/vehicles') || p.startsWith('/admin/vehicle')) return 'Vehicles';
    if (p.startsWith('/admin/alerts') || p.startsWith('/admin/alert')) return 'Alerts';
    if (p.startsWith('/admin/analytics') || p.startsWith('/admin/analytic')) return 'Analytics';
    if (p.startsWith('/admin/settings') || p.startsWith('/admin/profile')) return 'Settings';
    return 'Dashboard';
  }
  if (role === 'DRIVER') {
    if (p.startsWith('/driver/route') || p.startsWith('/driver/my-route')) return 'My Route';
    if (p.startsWith('/driver/bins')) return 'Bins';
    if (p.startsWith('/driver/collection')) return 'Collection';
    if (p.startsWith('/driver/vehicle')) return 'Vehicle';
    if (p.startsWith('/driver/history')) return 'History';
    if (p.startsWith('/driver/notifications') || p.startsWith('/driver/alerts')) return 'Notifications';
    if (p.startsWith('/driver/profile')) return 'Profile';
    if (p.startsWith('/driver/settings')) return 'Settings';
    return 'Dashboard';
  }
  if (role === 'ANALYST') {
    if (p.startsWith('/analyst/analytics')) return 'Analytics';
    if (p.startsWith('/analyst/waste-analytics')) return 'Waste Analytics';
    if (p.startsWith('/analyst/prediction-analytics')) return 'Prediction Analytics';
    if (p.startsWith('/analyst/collection-analytics')) return 'Collection Analytics';
    if (p.startsWith('/analyst/area-analysis')) return 'Area Analysis';
    if (p.startsWith('/analyst/recycling-analytics')) return 'Recycling Analytics';
    if (p.startsWith('/analyst/reports')) return 'Reports';
    if (p.startsWith('/analyst/analytics')) return 'Analytics';
    if (p.startsWith('/analyst/notifications') || p.startsWith('/analyst/alerts')) return 'Notifications';
    if (p.startsWith('/analyst/profile')) return 'Profile';
    if (p.startsWith('/analyst/settings')) return 'Settings';
    return 'Dashboard';
  }
  return 'Dashboard';
};

const getPathFromTab = (tab: string, role: string): string => {
  if (role === 'ADMIN') {
    switch (tab) {
      case 'Users': case 'User Management': return '/admin/users';
      case 'Bins': case 'Bin Management': return '/admin/bins';
      case 'Monitoring': case 'Live Operations': return '/admin/monitoring';
      case 'Classification': case 'Classifications': return '/admin/classification';
      case 'Predictions': case 'Prediction': return '/admin/predictions';
      case 'Planning': case 'Collection Planning': return '/admin/planning';
      case 'Routes': case 'Route': return '/admin/routes';
      case 'Vehicles': case 'Vehicle': return '/admin/vehicles';
      case 'Alerts': case 'Alert': return '/admin/alerts';
      case 'Analytics': case 'Analytic': return '/admin/analytics';
      case 'Settings': case 'Setting': case 'Profile': return '/admin/settings';
      default: return '/admin/dashboard';
    }
  }
  if (role === 'DRIVER') {
    switch (tab) {
      case 'My Route': case 'Route': return '/driver/my-route';
      case 'Bins': case 'Bin Management': return '/driver/bins';
      case 'Collection': case 'Collections': return '/driver/collection';
      case 'Vehicle': case 'Vehicles': case 'My Vehicle': return '/driver/vehicle';
      case 'History': return '/driver/history';
      case 'Notifications': case 'Alerts': return '/driver/notifications';
      case 'Profile': return '/driver/profile';
      case 'Settings': return '/driver/settings';
      default: return '/driver/dashboard';
    }
  }
  if (role === 'ANALYST') {
    switch (tab) {
      case 'Analytics': return '/analyst/analytics';
      case 'Waste Analytics': return '/analyst/waste-analytics';
      case 'Prediction Analytics': return '/analyst/prediction-analytics';
      case 'Collection Analytics': return '/analyst/collection-analytics';
      case 'Area Analysis': return '/analyst/area-analysis';
      case 'Recycling Analytics': return '/analyst/recycling-analytics';
      case 'Reports': return '/analyst/reports';
      case 'Notifications': case 'Alerts': return '/analyst/notifications';
      case 'Profile': return '/analyst/profile';
      case 'Settings': return '/analyst/settings';
      default: return '/analyst/dashboard';
    }
  }
  return '/';
};

import { DriverPortal } from '../driver/DriverPortal';

interface EcoTrackDashboardProps {
  user: UserSession;
  onSignOut: () => void;
}

export const EcoTrackDashboard: React.FC<EcoTrackDashboardProps> = ({ user, onSignOut }) => {
  // Derive normalized role strictly from user.role property
  const rawRole = (user.role || '').toUpperCase();
  const userRole: 'ADMIN' | 'ANALYST' | 'DRIVER' | 'VIEWER' = rawRole.includes('ADMIN')
    ? 'ADMIN'
    : rawRole.includes('DRIVER')
    ? 'DRIVER'
    : rawRole.includes('VIEWER')
    ? 'VIEWER'
    : 'ANALYST';

  // Route protection guard: Redirect Collection Driver to DriverPortal
  if (userRole === 'DRIVER' || user.role === 'Collection Driver' || user.displayRole === 'Collection Driver') {
    return <DriverPortal user={user} onSignOut={onSignOut} />;
  }

  const roleLabel =
    userRole === 'ADMIN'
      ? 'Waste Manager'
      : userRole === 'VIEWER'
      ? 'System Viewer'
      : 'Operations Analyst';

  const initialPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const [activeTab, setActiveTab] = useState<string>(() => getTabFromPath(initialPath, userRole));
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);

  const handleSelectTab = (tabName: string) => {
    // Canonicalize tabName so that sidebar active item is always perfectly highlighted
    const canonicalTab = (() => {
      if (userRole === 'ADMIN') {
        switch (tabName) {
          case 'Bin Management': return 'Bins';
          case 'Route': return 'Routes';
          case 'Vehicle': return 'Vehicles';
          case 'Alert': return 'Alerts';
          case 'Analytic': return 'Analytics';
          case 'Classifications': return 'Classification';
          case 'User Management': return 'Users';
          case 'Collection Planning': return 'Planning';
          case 'Live Operations': return 'Monitoring';
          case 'Prediction': return 'Predictions';
          case 'Setting': return 'Settings';
          default: return tabName;
        }
      }
      return tabName;
    })();

    setActiveTab(canonicalTab);
    const newPath = getPathFromTab(canonicalTab, userRole);
    if (typeof window !== 'undefined' && window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const currentTab = getTabFromPath(window.location.pathname, userRole);
      setActiveTab(currentTab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [userRole]);

  // Role-based sidebar configurations
  const navMain =
    userRole === 'ADMIN'
      ? [
          { name: 'Dashboard', icon: LayoutDashboard },
          { name: 'Bins', icon: Trash2 },
          { name: 'Monitoring', icon: MapPin },
          { name: 'Classification', icon: Cpu },
          { name: 'Predictions', icon: BrainCircuit },
          { name: 'Planning', icon: CalendarCheck },
          { name: 'Routes', icon: RouteIcon },
          { name: 'Vehicles', icon: Truck },
          { name: 'Alerts', icon: Bell },
          { name: 'Analytics', icon: BarChart3 },
        ]
      : [
          { name: 'Dashboard', icon: LayoutDashboard },
          { name: 'Analytics', icon: BarChart3 },
          { name: 'Prediction Analytics', icon: BrainCircuit },
          { name: 'Collection Analytics', icon: Activity },
          { name: 'Area Analysis', icon: MapPin },
          { name: 'Recycling Analytics', icon: Leaf },
          { name: 'Reports', icon: FileText },
          { name: 'Monitoring', icon: MapPin },
        ];

  const navAdmin =
    userRole === 'ADMIN'
      ? [
          { name: 'Users', icon: Users },
          { name: 'Settings', icon: Settings },
        ]
      : [
          { name: 'Settings', icon: Settings },
        ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-row overflow-x-hidden">

      {/* LEFT SIDEBAR */}
      <aside className="w-52 bg-white border-r border-slate-200 flex flex-col justify-between p-3 shrink-0 shadow-xs z-20">
        <div>
          {/* Clickable Brand */}
          <button
            type="button"
            onClick={() => handleSelectTab('Dashboard')}
            className="flex items-center gap-2 px-1 py-1 mb-4 cursor-pointer bg-transparent border-none text-left hover:opacity-85 transition-opacity"
            title="Go to Dashboard"
          >
            <div className="flex flex-col">
              <span className="text-base font-extrabold text-slate-900 leading-tight tracking-tight">EcoTrack</span>
              <span className="text-[10px] font-bold text-emerald-600 leading-none">Smart Management</span>
            </div>
          </button>

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
                    type="button"
                    onClick={() => handleSelectTab(item.name)}
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
                    type="button"
                    onClick={() => handleSelectTab(item.name)}
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

            {/* User Profile Pill & Dropdown Menu */}
            <div className="relative flex items-center gap-3 pl-3 border-l border-slate-200">
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 text-left p-1 rounded-xl hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
              >
                <div className="w-9 h-9 rounded-full bg-[#064e3b] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'WM'}
                </div>
                <div className="hidden sm:flex flex-col">
                  <span className="text-xs font-bold text-slate-900 leading-tight">{user.name}</span>
                  <span className="text-[10px] text-emerald-700 font-bold leading-tight">{roleLabel}</span>
                </div>
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 top-12 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="pb-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 leading-snug">{user.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono truncate">{user.email}</p>
                  </div>
                  <div className="pt-2 pb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Assigned Role</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-[#047857] border border-emerald-200">
                      {roleLabel}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 mt-2 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-medium">Status: Active</span>
                    <button
                      onClick={onSignOut}
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline border-none bg-transparent cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}

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

        {/* DASHBOARD BODY WITH ROLE-BASED ACCESS GUARDS & ERROR SHIELD */}
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="flex-1 flex items-center justify-center p-12 min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold text-slate-500">Loading module...</span>
                </div>
              </div>
            }
          >
            {(userRole as any) === 'DRIVER' ? (
              activeTab === 'My Route' ? (
                <RoutePage />
              ) : activeTab === 'Bins' || activeTab === 'Collection' || activeTab === 'History' ? (
                <BinManagement onNavigateTab={(tab) => handleSelectTab(tab)} />
              ) : activeTab === 'Vehicle' ? (
                <VehiclesPage onNavigateToRoute={() => handleSelectTab('My Route')} />
              ) : activeTab === 'Notifications' ? (
                <AlertsPage onNavigateTab={(tabName) => handleSelectTab(tabName)} />
              ) : activeTab === 'Profile' || activeTab === 'Settings' ? (
                <AdminSettingsPage onNavigateTab={(tabName) => handleSelectTab(tabName)} />
              ) : (
                <DriverDashboardPreview user={user as any} onSignOut={onSignOut} />
              )
            ) : userRole === 'ANALYST' ? (
              activeTab === 'Analytics' ? (
                <AnalyticsPage onNavigateTab={(tabName) => handleSelectTab(tabName)} initialTab="Overview" />
              ) : activeTab === 'Waste Analytics' ? (
                <AnalyticsPage onNavigateTab={(tabName) => handleSelectTab(tabName)} initialTab="Waste" />
              ) : activeTab === 'Prediction Analytics' ? (
                <PredictionAnalyticsPage />
              ) : activeTab === 'Collection Analytics' ? (
                <CollectionAnalyticsPage />
              ) : activeTab === 'Area Analysis' ? (
                <AreaAnalysisPage />
              ) : activeTab === 'Recycling Analytics' ? (
                <RecyclingAnalyticsPage />
              ) : activeTab === 'Reports' ? (
                <ReportsPage />
              ) : activeTab === 'Notifications' ? (
                <AlertsPage onNavigateTab={(tabName) => handleSelectTab(tabName)} />
              ) : activeTab === 'Profile' || activeTab === 'Settings' ? (
                <AdminSettingsPage onNavigateTab={(tabName) => handleSelectTab(tabName)} />
              ) : (
                <AnalystDashboardPreview user={user as any} onSignOut={onSignOut} />
              )
            ) : (
              /* ADMIN / WASTE MANAGER */
              activeTab === 'Bin Management' || activeTab === 'Bins' ? (
                <BinManagement onNavigateTab={(tab) => handleSelectTab(tab)} />
              ) : activeTab === 'Route' || activeTab === 'Routes' ? (
                <RoutePage />
              ) : activeTab === 'Vehicles' || activeTab === 'Vehicle' ? (
                <VehiclesPage onNavigateToRoute={() => handleSelectTab('Route')} />
              ) : activeTab === 'Alerts' || activeTab === 'Alert' ? (
                <AlertsPage onNavigateTab={(tabName) => handleSelectTab(tabName)} />
              ) : activeTab === 'Analytics' || activeTab === 'Analytic' ? (
                <AnalyticsPage onNavigateTab={(tabName) => handleSelectTab(tabName)} />
              ) : activeTab === 'Classification' || activeTab === 'Classifications' ? (
                <ClassificationPage onNavigateTab={(tabName) => handleSelectTab(tabName)} />
              ) : activeTab === 'Users' || activeTab === 'User Management' ? (
                <UsersPage />
              ) : activeTab === 'Settings' || activeTab === 'Setting' ? (
                <AdminSettingsPage onNavigateTab={(tabName) => handleSelectTab(tabName)} />
              ) : activeTab === 'Planning' || activeTab === 'Collection Planning' ? (
                <AdminPlanningPage onNavigate={(tabName) => handleSelectTab(tabName)} />
              ) : activeTab === 'Monitoring' || activeTab === 'Live Operations' ? (
                <MonitoringPage onNavigateTab={(tabName) => handleSelectTab(tabName)} />
              ) : activeTab === 'Predictions' || activeTab === 'Prediction' ? (
                <PredictionPage onNavigateTab={(tabName) => handleSelectTab(tabName)} />
              ) : (
                <AdminDashboardPage user={user} onNavigateTab={(tab) => handleSelectTab(tab)} />
              )
            )}
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};

export default EcoTrackDashboard;
