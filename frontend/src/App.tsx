import React, { useState } from 'react';
import { BrandPanel } from './components/brand/BrandPanel';
import { AuthContainer } from './components/auth/AuthContainer';
import type { UserSession } from './types/auth';
import { AdminDashboardPreview } from './components/dashboards/AdminDashboardPreview';
import { DriverDashboardPreview } from './components/dashboards/DriverDashboardPreview';
import { AnalystDashboardPreview } from './components/dashboards/AnalystDashboardPreview';
import { ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingUser, setPendingUser] = useState<UserSession | null>(null);

  const handleSuccessAuth = (user: UserSession) => {
    setPendingUser(user);
    setIsTransitioning(true);

    // Brief role transition message before showing role-based dashboard
    setTimeout(() => {
      setCurrentUser(user);
      setIsTransitioning(false);
      setPendingUser(null);
    }, 1400);
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

  // Main Responsive Split-Screen Authentication Experience
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 45%) minmax(0, 55%)',
        backgroundColor: 'var(--bg-canvas)',
      }}
      className="auth-layout-grid"
    >
      {/* LEFT SIDE — BRAND & PRODUCT VISUAL (~45%) */}
      <div className="auth-brand-side">
        <BrandPanel />
      </div>

      {/* RIGHT SIDE — AUTHENTICATION CARD (~55%) */}
      <div className="auth-card-side">
        <AuthContainer onSuccessAuth={handleSuccessAuth} />
      </div>

      {/* CSS Media Queries for Responsive Breakpoints */}
      <style>{`
        @media (max-width: 1024px) {
          .auth-layout-grid {
            grid-template-columns: minmax(0, 40%) minmax(0, 60%) !important;
          }
        }

        @media (max-width: 820px) {
          .auth-layout-grid {
            grid-template-columns: 1fr !important;
          }
          .auth-brand-side {
            display: none !important;
          }
          .auth-card-side {
            min-height: 100vh;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
