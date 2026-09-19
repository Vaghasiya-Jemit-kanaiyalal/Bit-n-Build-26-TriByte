import React, { useState } from 'react';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { NotificationBanner } from '../common/NotificationBanner';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError('Email address is required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1000);
  };

  return (
    <div className="animate-fade-in">
      {isSuccess ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <NotificationBanner
            type="success"
            title="Reset Instructions Sent"
            message={`We've dispatched a secure password reset link to ${email}. Please check your inbox and spam folder.`}
          />
          <button
            type="button"
            className="btn btn-primary btn-full"
            onClick={onBackToLogin}
            style={{ marginTop: '1rem', height: '42px' }}
          >
            <ArrowLeft size={16} />
            <span>Return to Sign In</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="input-group">
            <label htmlFor="reset-email">Registered Email Address</label>
            <div className="input-wrapper">
              <Mail size={16} className="input-icon" />
              <input
                id="reset-email"
                type="email"
                className={`input-field has-icon ${emailError ? 'is-invalid' : ''}`}
                placeholder="Enter your registered work email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                disabled={isLoading}
                required
              />
            </div>
            {emailError && <div className="field-error-msg">{emailError}</div>}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={isLoading}
            style={{ height: '44px', marginTop: '0.5rem' }}
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                <span>Sending Reset Link...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Send Reset Link</span>
              </>
            )}
          </button>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onBackToLogin}
              style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}
              disabled={isLoading}
            >
              <ArrowLeft size={14} />
              <span>Back to Sign In</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
