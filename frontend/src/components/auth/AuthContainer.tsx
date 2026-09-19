import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import type { UserRole } from '../../types/auth';

import faviconImg from '../../assets/favicon.png';
import logoTextImg from '../../assets/logo_text.png';

export type AuthMode = 'login' | 'signup' | 'forgot_password';

interface AuthContainerProps {
  onSuccessAuth: (user: { name: string; email: string; role: UserRole; organization: string }) => void;
}

export const AuthContainer: React.FC<AuthContainerProps> = ({ onSuccessAuth }) => {
  const [mode, setMode] = useState<AuthMode>('login');

  const getHeaderContent = () => {
    switch (mode) {
      case 'signup':
        return {
          title: 'Create your account',
          subtitle: 'Set up your workspace for smarter waste operations.',
        };
      case 'forgot_password':
        return {
          title: 'Reset your password',
          subtitle: "Enter your registered email and we'll help you regain access to your account.",
        };
      case 'login':
      default:
        return {
          title: 'Welcome back',
          subtitle: 'Sign in to your waste-management operations platform.',
        };
    }
  };

  const header = getHeaderContent();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100%',
        padding: '3rem 2.5rem',
        backgroundColor: 'var(--bg-canvas)',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
        }}
      >
        {/* Brand Mark with Favicon & Logo Text underneath */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <img src={faviconImg} alt="EcoTrack Icon" style={{ height: '72px', width: 'auto', objectFit: 'contain' }} />
            <span className="badge badge-normal" style={{ fontSize: '0.65rem' }}>
              SECURE PORTAL
            </span>
          </div>
          <img src={logoTextImg} alt="EcoTrack Brand" style={{ height: '64px', width: 'auto', objectFit: 'contain' }} />
        </div>

        {/* Dynamic Heading & Supporting Text */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h2 style={{ fontSize: '1.625rem', fontWeight: '700', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
            {header.title}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            {header.subtitle}
          </p>
        </div>

        {/* Dynamic Form Area */}
        {mode === 'login' && (
          <LoginForm
            onSuccessAuth={onSuccessAuth}
            onSwitchToSignup={() => setMode('signup')}
            onSwitchToForgotPassword={() => setMode('forgot_password')}
          />
        )}

        {mode === 'signup' && (
          <SignupForm
            onSuccessSignup={onSuccessAuth}
            onSwitchToLogin={() => setMode('login')}
          />
        )}

        {mode === 'forgot_password' && (
          <ForgotPasswordForm onBackToLogin={() => setMode('login')} />
        )}
      </div>
    </div>
  );
};
