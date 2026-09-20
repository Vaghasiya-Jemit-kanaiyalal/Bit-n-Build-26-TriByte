import React, { useState, useEffect } from 'react';
import { SignIn1 } from './components/ui/modern-stunning-sign-in';
import type { UserSession, PlatformRole } from './types/auth';
import { EcoTrackDashboard } from './components/dashboards/EcoTrackDashboard';
import { ShieldCheck } from 'lucide-react';
import NotificationToast, { showWebsiteToast } from './components/common/NotificationToast';
import ScrollToTopButton from './components/common/ScrollToTopButton';
import { authService } from './services/authService';

import { DriverPortal } from './components/driver/DriverPortal';
import { ViewerPortal } from './components/viewer/ViewerPortal';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingUser, setPendingUser] = useState<UserSession | null>(null);

  const [, setCurrentPath] = useState<string>(
    typeof window !== 'undefined' ? window.location.pathname : '/'
  );

  // Helper to enforce strict RBAC route guards
  const checkRouteGuard = (user: UserSession | null, path: string): string => {
    if (!user) {
      if (path.startsWith('/admin') || path.startsWith('/driver') || path.startsWith('/analyst') || path.startsWith('/viewer')) {
        return '/login';
      }
      return path;
    }

    const rawRole = (user.role || 'VIEWER').toUpperCase();
    let roleKey: PlatformRole = 'VIEWER';
    if (rawRole.includes('ADMIN')) roleKey = 'ADMIN';
    else if (rawRole.includes('DRIVER')) roleKey = 'DRIVER';
    else if (rawRole.includes('ANALYST')) roleKey = 'ANALYST';
    else roleKey = 'VIEWER';

    if (path.startsWith('/admin') && roleKey !== 'ADMIN') {
      return authService.redirectUserByRole(roleKey);
    }
    if (path.startsWith('/driver') && roleKey !== 'DRIVER') {
      return authService.redirectUserByRole(roleKey);
    }
    if (path.startsWith('/analyst') && roleKey !== 'ANALYST' && roleKey !== 'ADMIN') {
      return authService.redirectUserByRole(roleKey);
    }
    if (path === '/' || path === '/login' || path === '') {
      return authService.redirectUserByRole(roleKey);
    }
    return path;
  };

  // Global override for native window.alert -> Website UI Toast & session restore
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
      const rawRole = (savedUser.role || 'VIEWER').toUpperCase();
      let roleKey: PlatformRole = 'VIEWER';
      if (rawRole.includes('ADMIN')) roleKey = 'ADMIN';
      else if (rawRole.includes('DRIVER')) roleKey = 'DRIVER';
      else if (rawRole.includes('ANALYST')) roleKey = 'ANALYST';
      else roleKey = 'VIEWER';

      const displayRole =
        roleKey === 'ADMIN'
          ? 'Waste Manager'
          : roleKey === 'DRIVER'
          ? 'Collection Driver'
          : roleKey === 'ANALYST'
          ? 'Operations Analyst'
          : 'System Viewer';

      const userSession: UserSession = {
        id: savedUser.id,
        name: savedUser.full_name || savedUser.name || savedUser.email.split('@')[0],
        email: savedUser.email,
        role: roleKey,
        displayRole: displayRole,
        status: savedUser.status || 'ACTIVE',
        organization: savedUser.organization || 'EcoTrack AI Waste Management',
        department: savedUser.department || 'Operations',
      };
      setCurrentUser(userSession);

      // Route guard on reload
      const guarded = checkRouteGuard(userSession, window.location.pathname);
      if (guarded !== window.location.pathname) {
        window.history.replaceState(null, '', guarded);
        setCurrentPath(guarded);
      }
    } else {
      // Unauthenticated access guard
      const guarded = checkRouteGuard(null, window.location.pathname);
      if (guarded !== window.location.pathname) {
        window.history.replaceState(null, '', guarded);
        setCurrentPath(guarded);
      }
    }

    // Popstate listener for browser back/forward navigation
    const handlePopState = () => {
      const activeUser = authService.getSavedUser();
      const path = window.location.pathname;
      const guarded = checkRouteGuard(activeUser ? (currentUser || null) : null, path);
      if (guarded !== path) {
        window.history.replaceState(null, '', guarded);
      }
      setCurrentPath(guarded);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser]);

  const handleSignInSuccess = (role: string, email: string, userRecord?: any) => {
    // Role comes strictly from authenticated user database record
    const rawRole = (userRecord?.role || role || 'VIEWER').toUpperCase();
    let dbRole: PlatformRole = 'VIEWER';
    if (rawRole.includes('ADMIN')) dbRole = 'ADMIN';
    else if (rawRole.includes('DRIVER')) dbRole = 'DRIVER';
    else if (rawRole.includes('ANALYST')) dbRole = 'ANALYST';
    else dbRole = 'VIEWER';

    const mappedDisplayRole =
      dbRole === 'ADMIN'
        ? 'Waste Manager'
        : dbRole === 'DRIVER'
        ? 'Collection Driver'
        : dbRole === 'ANALYST'
        ? 'Operations Analyst'
        : 'System Viewer';

    const displayName =
      userRecord?.full_name ||
      (userRecord?.first_name ? `${userRecord.first_name} ${userRecord.last_name || ''}`.trim() : null) ||
      (email === 'admin@gmail.com' ? 'Waste Manager' : email.split('@')[0]);

    const userSession: UserSession = {
      id: userRecord?.id,
      name: displayName,
      email: email,
      role: dbRole,
      displayRole: mappedDisplayRole,
      status: userRecord?.status || 'ACTIVE',
      organization: userRecord?.organization || 'EcoTrack AI Waste Management',
      department: userRecord?.department || 'Operations',
    };

    // Calculate role-based dashboard destination
    const destinationPath = authService.redirectUserByRole(dbRole);

    setPendingUser(userSession);
    setIsTransitioning(true);

    setTimeout(() => {
      setCurrentUser(userSession);
      setIsTransitioning(false);
      setPendingUser(null);
      window.history.pushState(null, '', destinationPath);
      setCurrentPath(destinationPath);
    }, 800);
  };

  const handleSignOut = () => {
    authService.logout();
    setCurrentUser(null);
    window.history.pushState(null, '', '/login');
    setCurrentPath('/login');
    showWebsiteToast('You have been signed out.', 'info', 'Session Ended');
  };

  const roleUpper = (currentUser?.role || '').toUpperCase();
  const isDriver = roleUpper === 'DRIVER' || currentUser?.displayRole === 'Collection Driver';
  const isViewer = roleUpper === 'VIEWER' || currentUser?.displayRole === 'System Viewer';

  return (
    <>
      {/* Global In-Website Notification Toast Container */}
      <NotificationToast />

      {/* Global Scroll to Top (Down to Top) Arrow Button */}
      <ScrollToTopButton />

      {currentUser ? (
        isDriver ? (
          <DriverPortal user={currentUser} onSignOut={handleSignOut} />
        ) : isViewer ? (
          <ViewerPortal user={currentUser} onSignOut={handleSignOut} />
        ) : (
          <EcoTrackDashboard user={currentUser} onSignOut={handleSignOut} />
        )
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
