import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { NotificationBanner } from '../common/NotificationBanner';
import { QuickDemoRoleSelector } from './QuickDemoRoleSelector';
import type { UserRole } from '../../types/auth';

interface LoginFormProps {
  onSuccessAuth: (user: { name: string; email: string; role: UserRole; organization: string }) => void;
  onSwitchToSignup: () => void;
  onSwitchToForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccessAuth,
  onSwitchToSignup,
  onSwitchToForgotPassword,
}) => {
  const [email, setEmail] = useState('manager.admin@wastewise.ai');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>('Waste Manager');

  // Form State
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [authNotification, setAuthNotification] = useState<{
    type: 'error' | 'success' | 'info';
    title?: string;
    message: string;
  } | null>(null);

  const validateEmail = (val: string) => {
    if (!val.trim()) return 'Email address is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) return 'Please enter a valid email address';
    return null;
  };

  const validatePassword = (val: string) => {
    if (!val) return 'Password is required';
    if (val.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthNotification(null);

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);

    setEmailError(eErr);
    setPasswordError(pErr);

    if (eErr || pErr) return;

    // Simulate login API call
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      let finalRole = selectedRole;
      if (email.includes('driver')) finalRole = 'Driver / Field Worker';
      if (email.includes('analyst')) finalRole = 'Analyst / Supervisor';

      onSuccessAuth({
        name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        email: email,
        role: finalRole,
        organization: 'Metro Smart City Operations',
      });
    }, 1200);
  };

  const handleQuickPreset = (role: UserRole, presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('Password123!');
    setSelectedRole(role);
    setEmailError(null);
    setPasswordError(null);
    setAuthNotification({
      type: 'success',
      title: `${role} Preset Selected`,
      message: `Form populated for ${role} role. Click Sign In to test.`,
    });
  };

  const handleSimulateError = (type: 'credentials' | 'network') => {
    if (type === 'credentials') {
      setPassword('WrongPass');
      setAuthNotification({
        type: 'error',
        title: 'Authentication Failed',
        message: 'Invalid credentials. Please verify your email and password.',
      });
    } else {
      setAuthNotification({
        type: 'error',
        title: 'Network Communication Error',
        message: 'Unable to establish secure handshake with telemetry server. Please retry.',
      });
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Quick Demo Preset Selector */}
      <QuickDemoRoleSelector
        onSelectRole={handleQuickPreset}
        onSimulateError={handleSimulateError}
      />

      {/* Auth Notification Alert */}
      {authNotification && (
        <NotificationBanner
          type={authNotification.type}
          title={authNotification.title}
          message={authNotification.message}
          onDismiss={() => setAuthNotification(null)}
        />
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Email Input */}
        <div className="input-group">
          <label htmlFor="login-email">Work Email Address</label>
          <div className="input-wrapper">
            <Mail size={16} className="input-icon" />
            <input
              id="login-email"
              type="email"
              className={`input-field has-icon ${emailError ? 'is-invalid' : ''}`}
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(validateEmail(e.target.value));
              }}
              disabled={isLoading}
              required
            />
          </div>
          {emailError && <div className="field-error-msg">{emailError}</div>}
        </div>

        {/* Password Input */}
        <div className="input-group">
          <label htmlFor="login-password">Password</label>
          <div className="input-wrapper">
            <Lock size={16} className="input-icon" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              className={`input-field has-icon has-action ${passwordError ? 'is-invalid' : ''}`}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError(validatePassword(e.target.value));
              }}
              disabled={isLoading}
              required
            />
            <button
              type="button"
              className="input-action-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {passwordError && <div className="field-error-msg">{passwordError}</div>}
        </div>

        {/* Remember Me & Forgot Password */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
          }}
        >
          <label className="checkbox-label">
            <input
              type="checkbox"
              className="checkbox-input"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
            />
            <span className="checkbox-custom">
              {rememberMe && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
            Remember me
          </label>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={onSwitchToForgotPassword}
            style={{ fontSize: '0.8125rem', padding: '0.2rem 0.4rem', color: 'var(--accent-sand)' }}
            disabled={isLoading}
          >
            Forgot password?
          </button>
        </div>

        {/* Primary CTA */}
        <button
          type="submit"
          className="btn btn-primary btn-full"
          disabled={isLoading}
          style={{ height: '44px', fontSize: '0.9375rem' }}
        >
          {isLoading ? (
            <>
              <span className="spinner" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>



        {/* Signup Transition */}
        <div
          style={{
            marginTop: '2rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}
        >
          Don't have an account?{' '}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onSwitchToSignup}
            style={{
              padding: '0.2rem 0.4rem',
              color: 'var(--accent-olive)',
              fontWeight: '600',
              fontSize: '0.85rem',
            }}
            disabled={isLoading}
          >
            Create an account
          </button>
        </div>
      </form>
    </div>
  );
};
