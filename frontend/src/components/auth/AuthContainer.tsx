import React, { useState } from 'react';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import type { UserRole } from '../../types/auth';

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
        {/* Small Brand Mark (Right Side Header) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-olive-muted)',
              border: '1px solid var(--accent-olive)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-olive)',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          </div>
          <span style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            WasteWise AI
          </span>
          <span className="badge badge-normal" style={{ marginLeft: 'auto', fontSize: '0.65rem' }}>
            SECURE PORTAL
          </span>
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
