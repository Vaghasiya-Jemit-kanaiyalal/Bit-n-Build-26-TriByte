import React, { useState, useEffect } from 'react';
import { SignIn1 } from './components/ui/modern-stunning-sign-in';
import type { UserSession } from './types/auth';
import { EcoTrackDashboard } from './components/dashboards/EcoTrackDashboard';
import { ShieldCheck } from 'lucide-react';
import NotificationToast, { showWebsiteToast } from './components/common/NotificationToast';
import { authService } from './services/authService';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingUser, setPendingUser] = useState<UserSession | null>(null);

  // Global override for native window.alert -> Website UI Toast
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.alert = (message?: any) => {
        const msgStr = typeof message === 'string' ? message : JSON.stringify(message);
        showWebsiteToast(msgStr, 'info', 'Website Notification');
      };
    }

    // Auto restore session if saved
    const savedUser = authService.getSavedUser();
    const token = authService.getToken();
    if (savedUser && token) {
      const roleStr = (savedUser.role || 'ANALYST').toUpperCase();
      const displayRole =
        roleStr === 'ADMIN'
          ? 'Waste Manager'
          : roleStr === 'DRIVER' || roleStr === 'COLLECTOR'
          ? 'Collection Driver'
          : 'Operations Analyst';

      const userSession: UserSession = {
        id: savedUser.id,
        name: savedUser.full_name || savedUser.name || savedUser.email.split('@')[0],
        email: savedUser.email,
        role: displayRole,
        displayRole: displayRole,
        status: savedUser.status || 'ACTIVE',
        organization: savedUser.organization || 'EcoTrack AI Waste Management',
        department: savedUser.department || 'Operations',
      };
      setCurrentUser(userSession);
    }
  }, []);

  const handleSignInSuccess = (role: string, email: string, userRecord?: any) => {
    // Role strictly comes from the database record!
    const dbRole = (userRecord?.role || role || 'ANALYST').toUpperCase();

    // Map to display representation for dashboard while keeping raw database role
    let mappedDisplayRole: string = 'Operations Analyst';
    if (dbRole === 'ADMIN') {
      mappedDisplayRole = 'Waste Manager';
    } else if (dbRole === 'DRIVER' || dbRole === 'COLLECTOR') {
      mappedDisplayRole = 'Collection Driver';
    } else if (dbRole === 'ANALYST' || dbRole === 'VIEWER') {
      mappedDisplayRole = 'Operations Analyst';
    }

    const displayName =
      userRecord?.full_name ||
      (userRecord?.first_name ? `${userRecord.first_name} ${userRecord.last_name || ''}`.trim() : null) ||
      (email === 'admin@gmail.com' ? 'Waste Manager' : email.split('@')[0]);

    const userSession: UserSession = {
      id: userRecord?.id,
      name: displayName,
      email: email,
      role: mappedDisplayRole, // Passes display role expected by existing EcoTrackDashboard component
      displayRole: mappedDisplayRole,
      status: userRecord?.status || 'ACTIVE',
      organization: userRecord?.organization || 'EcoTrack AI Waste Management',
      department: userRecord?.department || 'Operations',
    };

    setPendingUser(userSession);
    setIsTransitioning(true);

    setTimeout(() => {
      setCurrentUser(userSession);
      setIsTransitioning(false);
      setPendingUser(null);
    }, 800);
  };

  const handleSignOut = () => {
    authService.logout();
    setCurrentUser(null);
    showWebsiteToast('You have been signed out.', 'info', 'Session Ended');
  };

  return (
    <>
      {/* Global In-Website Notification Toast Container */}
      <NotificationToast />

      {currentUser ? (
        <EcoTrackDashboard user={currentUser} onSignOut={handleSignOut} />
      ) : isTransitioning && pendingUser ? (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-sm w-full shadow-2xl flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold mb-1">Authentication Verified</h3>
            <p className="text-xs text-slate-400 mb-4">
              Loading {pendingUser.name}'s authorized workspace...
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-slate-200">
                {pendingUser.role} Portal
              </span>
            </div>

            <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full animate-pulse w-full"
                style={{ animationDuration: '0.8s' }}
              />
            </div>
          </div>
        </div>
      ) : (
        <SignIn1 onSignInSuccess={handleSignInSuccess} />
      )}
    </>
  );
};

export default App;
