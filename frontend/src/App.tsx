import React, { useState } from 'react';
import { SignIn1 } from './components/ui/modern-stunning-sign-in';
import type { UserSession } from './types/auth';
import { AdminDashboardPreview } from './components/dashboards/AdminDashboardPreview';
import { DriverDashboardPreview } from './components/dashboards/DriverDashboardPreview';
import { AnalystDashboardPreview } from './components/dashboards/AnalystDashboardPreview';
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
      name: email.split('@')[0] || 'Authorized Personnel',
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
    }, 1200);
  };

  const handleSignOut = () => {
    setCurrentUser(null);
  };

  // If user is authenticated, render the appropriate role dashboard
  if (currentUser) {
    if (currentUser.role === 'Waste Manager') {
      return <AdminDashboardPreview user={currentUser} onSignOut={handleSignOut} />;
    }
    if (currentUser.role === 'Driver / Field Worker') {
      return <DriverDashboardPreview user={currentUser} onSignOut={handleSignOut} />;
    }
    if (currentUser.role === 'Analyst / Supervisor') {
      return <AnalystDashboardPreview user={currentUser} onSignOut={handleSignOut} />;
    }
  }

  // Intermittent role redirection transition animation
  if (isTransitioning && pendingUser) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--bg-canvas)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center',
        }}
      >
        <div className="card card-elevated animate-fade-in" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem 2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-olive-muted)',
              border: '1px solid var(--accent-olive)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-olive)',
              margin: '0 auto 1.25rem',
            }}
          >
            <ShieldCheck size={26} />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.4rem' }}>
            Authentication Successful
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Redirecting {pendingUser.name} to authorized portal...
          </p>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.4rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(245, 244, 239, 0.05)',
              border: '1px solid var(--border-medium)',
              marginBottom: '1.5rem',
            }}
          >
            <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--accent-sand)', textTransform: 'uppercase' }}>
              ROLE: {pendingUser.role}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <span className="spinner" style={{ width: '14px', height: '14px' }} />
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
