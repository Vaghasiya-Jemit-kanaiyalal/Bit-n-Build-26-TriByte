import React, { useState } from 'react';
import { SignIn1 } from './components/ui/modern-stunning-sign-in';
import type { UserSession } from './types/auth';
import { EcoTrackDashboard } from './components/dashboards/EcoTrackDashboard';
import { ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingUser, setPendingUser] = useState<UserSession | null>(null);

  const handleSignInSuccess = (role: string, email: string) => {
    let mappedRole: UserSession['role'] = 'Waste Manager';
    if (role.includes('Collector') || role.includes('Driver') || role === 'Role 2') {
      mappedRole = 'Driver / Field Worker';
    } else if (role.includes('Viewer') || role.includes('Analyst') || role === 'Role 3') {
      mappedRole = 'Analyst / Supervisor';
    }

    const userSession: UserSession = {
      name: email === 'admin@ecotrack.com' ? 'Jemit Vaghasiya' : (email.split('@')[0] || 'Authorized Personnel'),
      email: email,
      role: mappedRole,
      organization: 'EcoTrack AI Waste Management',
    };

    setPendingUser(userSession);
    setIsTransitioning(true);

    setTimeout(() => {
      setCurrentUser(userSession);
      setIsTransitioning(false);
      setPendingUser(null);
    }, 1000);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
  };

  // If user is authenticated, render the EcoTrack Dashboard
  if (currentUser) {
    return <EcoTrackDashboard user={currentUser} onSignOut={handleSignOut} />;
  }

  // Intermittent role redirection transition animation
  if (isTransitioning && pendingUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-sm w-full shadow-2xl flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold mb-1">Authentication Successful</h3>
          <p className="text-xs text-slate-400 mb-4">
            Redirecting {pendingUser.name} to authorized portal...
          </p>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10 mb-6">
            <span className="text-xs font-mono text-emerald-300 uppercase tracking-wider">
              ROLE: {pendingUser.role}
            </span>
          </div>

          <div className="flex items-center justify-center gap-2 text-slate-400 text-xs">
            <span className="w-4 h-4 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
            <span>Loading workspace telemetry...</span>
          </div>
        </div>
      </div>
    );
  }

  // Render Modern Stunning Sign In Page (EcoTrack Design)
  return <SignIn1 onSignInSuccess={handleSignInSuccess} bgOpacity={0.55} />;
};

export default App;
