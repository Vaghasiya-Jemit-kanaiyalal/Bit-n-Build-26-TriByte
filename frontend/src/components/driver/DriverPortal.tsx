import React, { useState } from 'react';
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

export const DriverPortal: React.FC<DriverPortalProps> = ({
  user,
  onSignOut,
  initialTab = 'Dashboard',
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

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
        onNavigateTab={(tab) => setActiveTab(tab)}
        user={user}
        onSignOut={onSignOut}
      />

      {/* Driver Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeTab === 'My Route' || activeTab === 'Route' ? (
          <MyRoutePage user={user} onSignOut={onSignOut} onNavigateTab={setActiveTab} />
        ) : activeTab === 'Bins' || activeTab === 'Bin Management' ? (
          <DriverBinsPage user={user} onNavigateTab={setActiveTab} />
        ) : activeTab === 'Collection' || activeTab === 'Collections' ? (
          <DriverCollectionPage user={user} onNavigateTab={setActiveTab} />
        ) : activeTab === 'Vehicle' || activeTab === 'My Vehicle' ? (
          <DriverVehiclePage user={user} onNavigateTab={setActiveTab} />
        ) : activeTab === 'History' ? (
          <DriverHistoryPage user={user} onNavigateTab={setActiveTab} />
        ) : activeTab === 'Notifications' ? (
          <DriverNotificationsPage user={user} onNavigateTab={setActiveTab} />
        ) : activeTab === 'Profile' ? (
          <DriverProfilePage user={user} onNavigateTab={setActiveTab} />
        ) : activeTab === 'Settings' ? (
          <DriverSettingsPage user={user} onNavigateTab={setActiveTab} />
        ) : (
          <DriverDashboard user={user} onSignOut={onSignOut} onNavigateTab={setActiveTab} />
        )}
      </div>
    </div>
  );
};

export default DriverPortal;
