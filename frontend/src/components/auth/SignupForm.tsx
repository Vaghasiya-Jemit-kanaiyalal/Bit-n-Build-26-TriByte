import React, { useState } from 'react';
import { User, Mail, Building, ShieldCheck, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { NotificationBanner } from '../common/NotificationBanner';
import type { UserRole } from '../../types/auth';

interface SignupFormProps {
  onSuccessSignup: (user: { name: string; email: string; role: UserRole; organization: string }) => void;
  onSwitchToLogin: () => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ onSuccessSignup, onSwitchToLogin }) => {
  const [fullName, setFullName] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState<UserRole>('Waste Manager');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Form State
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notification, setNotification] = useState<{ type: 'error' | 'success'; title?: string; message: string } | null>(null);

  // Password Strength Meter Logic
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'Empty', color: 'var(--text-dim)' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'var(--status-critical)' };
    if (score <= 3) return { score: 2, label: 'Moderate', color: 'var(--status-warning)' };
    return { score: 3, label: 'Strong', color: 'var(--status-normal)' };
  };

  const strength = getPasswordStrength(password);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = 'Full name is required';
    
    if (!workEmail.trim()) {
      newErrors.workEmail = 'Work email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail)) {
      newErrors.workEmail = 'Please enter a valid work email';
    }

    if (!organization.trim()) newErrors.organization = 'Organization name is required';

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms of Service to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!validate()) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onSuccessSignup({
        name: fullName,
        email: workEmail,
        role: role,
        organization: organization,
      });
    }, 1200);
  };

  return (
    <div className="animate-fade-in">
      {notification && (
        <NotificationBanner
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onDismiss={() => setNotification(null)}
        />
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <div className="input-group">
          <label htmlFor="signup-name">Full Name</label>
          <div className="input-wrapper">
            <User size={16} className="input-icon" />
            <input
              id="signup-name"
              type="text"
              className={`input-field has-icon ${errors.fullName ? 'is-invalid' : ''}`}
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors({ ...errors, fullName: '' });
              }}
              disabled={isLoading}
              required
            />
          </div>
          {errors.fullName && <div className="field-error-msg">{errors.fullName}</div>}
        </div>

        {/* Work Email */}
        <div className="input-group">
          <label htmlFor="signup-email">Work Email</label>
          <div className="input-wrapper">
            <Mail size={16} className="input-icon" />
            <input
              id="signup-email"
              type="email"
              className={`input-field has-icon ${errors.workEmail ? 'is-invalid' : ''}`}
              placeholder="Enter your work email"
              value={workEmail}
              onChange={(e) => {
                setWorkEmail(e.target.value);
                if (errors.workEmail) setErrors({ ...errors, workEmail: '' });
              }}
              disabled={isLoading}
              required
            />
          </div>
          {errors.workEmail && <div className="field-error-msg">{errors.workEmail}</div>}
        </div>

        {/* Organization & Role */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Organization */}
          <div className="input-group">
            <label htmlFor="signup-org">Organization</label>
            <div className="input-wrapper">
              <Building size={16} className="input-icon" />
              <input
                id="signup-org"
                type="text"
                className={`input-field has-icon ${errors.organization ? 'is-invalid' : ''}`}
                placeholder="Organization / Campus"
                value={organization}
                onChange={(e) => {
                  setOrganization(e.target.value);
                  if (errors.organization) setErrors({ ...errors, organization: '' });
                }}
                disabled={isLoading}
                required
              />
            </div>
            {errors.organization && <div className="field-error-msg">{errors.organization}</div>}
          </div>

          {/* Operational Role */}
          <div className="input-group">
            <label htmlFor="signup-role">Role</label>
            <div className="input-wrapper">
              <ShieldCheck size={16} className="input-icon" />
              <select
                id="signup-role"
                className="input-field has-icon select-field"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                disabled={isLoading}
              >
                <option value="Waste Manager">Waste Manager</option>
                <option value="Driver / Field Worker">Driver / Field Worker</option>
                <option value="Analyst / Supervisor">Analyst / Supervisor</option>
              </select>
            </div>
          </div>
        </div>

        {/* Password */}
        <div className="input-group">
          <label htmlFor="signup-password">Password</label>
          <div className="input-wrapper">
            <Lock size={16} className="input-icon" />
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              className={`input-field has-icon has-action ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: '' });
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

          {/* Compact Password Strength Indicator */}
          {password && (
            <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ flex: 1, display: 'flex', gap: '3px', height: '4px' }}>
                <div
                  style={{
                    flex: 1,
                    borderRadius: '2px',
                    backgroundColor: strength.score >= 1 ? strength.color : 'rgba(255,255,255,0.1)',
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    borderRadius: '2px',
                    backgroundColor: strength.score >= 2 ? strength.color : 'rgba(255,255,255,0.1)',
                  }}
                />
                <div
                  style={{
                    flex: 1,
                    borderRadius: '2px',
                    backgroundColor: strength.score >= 3 ? strength.color : 'rgba(255,255,255,0.1)',
                  }}
                />
              </div>
              <span className="mono" style={{ fontSize: '0.7rem', color: strength.color }}>
                {strength.label}
              </span>
            </div>
          )}
          {errors.password && <div className="field-error-msg">{errors.password}</div>}
        </div>

        {/* Confirm Password */}
        <div className="input-group">
          <label htmlFor="signup-confirm-password">Confirm Password</label>
          <div className="input-wrapper">
            <Lock size={16} className="input-icon" />
            <input
              id="signup-confirm-password"
              type={showPassword ? 'text' : 'password'}
              className={`input-field has-icon ${errors.confirmPassword ? 'is-invalid' : ''}`}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
              }}
              disabled={isLoading}
              required
            />
          </div>
          {errors.confirmPassword && <div className="field-error-msg">{errors.confirmPassword}</div>}
        </div>

        {/* Terms Checkbox */}
        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
          <label className="checkbox-label">
            <input
              type="checkbox"
              className="checkbox-input"
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                if (errors.agreeTerms) setErrors({ ...errors, agreeTerms: '' });
              }}
              disabled={isLoading}
            />
            <span className="checkbox-custom">
              {agreeTerms && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </span>
            I agree to the <a href="#terms" onClick={(e) => e.preventDefault()} style={{ color: 'var(--accent-sand)' }}>Terms of Service</a> and <a href="#privacy" onClick={(e) => e.preventDefault()} style={{ color: 'var(--accent-sand)' }}>Privacy Policy</a>.
          </label>
          {errors.agreeTerms && <div className="field-error-msg">{errors.agreeTerms}</div>}
        </div>

        {/* Primary CTA */}
        <button
          type="submit"
          className="btn btn-earthy btn-full"
          disabled={isLoading}
          style={{ height: '44px', fontSize: '0.9375rem' }}
        >
          {isLoading ? (
            <>
              <span className="spinner" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>

        {/* Bottom Switch to Login */}
        <div
          style={{
            marginTop: '1.75rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}
        >
          Already have an account?{' '}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onSwitchToLogin}
            style={{
              padding: '0.2rem 0.4rem',
              color: 'var(--accent-olive)',
              fontWeight: '600',
              fontSize: '0.85rem',
            }}
            disabled={isLoading}
          >
            Sign in
          </button>
        </div>
      </form>
    </div>
  );
};
