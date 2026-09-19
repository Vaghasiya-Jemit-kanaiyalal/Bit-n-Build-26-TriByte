import React, { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import type { UserSession } from '../../types/auth';
import DriverSidebar from './DriverSidebar';
import DriverDashboard from './DriverDashboard';
import MyRoutePage from './MyRoutePage';
import DriverBinsPage from './DriverBinsPage';
import DriverCollectionPage from './DriverCollectionPage';
import DriverVehiclePage from './DriverVehiclePage';
import DriverHistoryPage from './DriverHistoryPage';
import DriverNotificationsPage from './DriverNotificationsPage';
import DriverProfilePage from './DriverProfilePage';
import DriverSettingsPage from './DriverSettingsPage';

interface DriverPortalProps {
  user: UserSession;
  onSignOut: () => void;
  initialTab?: string;
}

export const getDriverTabFromPath = (path: string): string => {
  const p = (path || '').toLowerCase();
  if (p.startsWith('/driver/my-route') || p.startsWith('/driver/route')) return 'My Route';
  if (p.startsWith('/driver/bins')) return 'Bins';
  if (p.startsWith('/driver/collection')) return 'Collection';
  if (p.startsWith('/driver/vehicle')) return 'Vehicle';
  if (p.startsWith('/driver/history')) return 'History';
  if (p.startsWith('/driver/notifications') || p.startsWith('/driver/alerts')) return 'Notifications';
  if (p.startsWith('/driver/profile')) return 'Profile';
  if (p.startsWith('/driver/settings')) return 'Settings';
  return 'Dashboard';
};

export const getDriverPathFromTab = (tab: string): string => {
  switch (tab) {
    case 'My Route':
    case 'Route':
      return '/driver/my-route';
    case 'Bins':
    case 'Bin Management':
      return '/driver/bins';
    case 'Collection':
    case 'Collections':
      return '/driver/collection';
    case 'Vehicle':
    case 'My Vehicle':
    case 'Vehicles':
      return '/driver/vehicle';
    case 'History':
      return '/driver/history';
    case 'Notifications':
    case 'Alerts':
      return '/driver/notifications';
    case 'Profile':
      return '/driver/profile';
    case 'Settings':
      return '/driver/settings';
    default:
      return '/driver/dashboard';
  }
};

export const DriverPortal: React.FC<DriverPortalProps> = ({
  user,
  onSignOut,
  initialTab,
}) => {
  const initialPath = typeof window !== 'undefined' ? window.location.pathname : '/driver/dashboard';
  const [activeTab, setActiveTab] = useState<string>(() => {
    const tabFromUrl = getDriverTabFromPath(initialPath);
    if (initialTab && initialTab !== 'Dashboard' && tabFromUrl === 'Dashboard') {
      return initialTab;
    }
    return tabFromUrl;
  });

  const handleNavigateTab = (tab: string) => {
    const canonicalTab = (() => {
      switch (tab) {
        case 'Route': return 'My Route';
        case 'Bin Management': return 'Bins';
        case 'Collections': return 'Collection';
        case 'My Vehicle': case 'Vehicles': return 'Vehicle';
        case 'Alerts': return 'Notifications';
        default: return tab;
      }
    })();

    setActiveTab(canonicalTab);
    const newPath = getDriverPathFromTab(canonicalTab);
    if (typeof window !== 'undefined' && window.location.pathname !== newPath) {
      window.history.pushState(null, '', newPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const currentTab = getDriverTabFromPath(window.location.pathname);
      setActiveTab(currentTab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const rawRole = (user.role || '').toUpperCase();
  const isDriver = rawRole === 'DRIVER' || user.displayRole === 'Collection Driver' || user.role === 'Collection Driver';

  if (!isDriver) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="bg-slate-900 border border-red-500/30 p-8 rounded-2xl max-w-md w-full shadow-2xl flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-red-400 mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold mb-1">Access Restricted</h3>
          <p className="text-xs text-slate-400 mb-6">
            The Driver Portal is accessible only to authorized Collection Driver accounts. Your role is: <strong className="text-white">{user.displayRole || user.role}</strong>.
          </p>
          <button
            onClick={onSignOut}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs cursor-pointer transition-all border-none"
          >
            Sign Out & Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-row overflow-x-hidden">
      {/* Driver Layout Sidebar */}
      <DriverSidebar
        activeTab={activeTab}
        onNavigateTab={handleNavigateTab}
        user={user}
        onSignOut={onSignOut}
      />

      {/* Driver Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeTab === 'My Route' || activeTab === 'Route' ? (
          <MyRoutePage user={user} onSignOut={onSignOut} onNavigateTab={handleNavigateTab} />
        ) : activeTab === 'Bins' || activeTab === 'Bin Management' ? (
          <DriverBinsPage user={user} onNavigateTab={handleNavigateTab} />
        ) : activeTab === 'Collection' || activeTab === 'Collections' ? (
          <DriverCollectionPage user={user} onNavigateTab={handleNavigateTab} />
        ) : activeTab === 'Vehicle' || activeTab === 'My Vehicle' ? (
          <DriverVehiclePage user={user} onNavigateTab={handleNavigateTab} />
        ) : activeTab === 'History' ? (
          <DriverHistoryPage user={user} onNavigateTab={handleNavigateTab} />
        ) : activeTab === 'Notifications' ? (
          <DriverNotificationsPage user={user} onNavigateTab={handleNavigateTab} />
        ) : activeTab === 'Profile' ? (
          <DriverProfilePage user={user} onNavigateTab={handleNavigateTab} />
        ) : activeTab === 'Settings' ? (
          <DriverSettingsPage user={user} onNavigateTab={handleNavigateTab} />
        ) : (
          <DriverDashboard user={user} onSignOut={onSignOut} onNavigateTab={handleNavigateTab} />
        )}
      </div>
    </div>
  );
};

export default DriverPortal;
