import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

interface NotificationProps {
  type: 'error' | 'success' | 'info';
  title?: string;
  message: string;
  onDismiss?: () => void;
}

export const NotificationBanner: React.FC<NotificationProps> = ({ type, title, message, onDismiss }) => {
  const getStyles = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'var(--status-critical-bg)',
          border: 'rgba(186, 87, 83, 0.4)',
          text: '#f2b5b3',
          icon: <AlertCircle size={18} style={{ color: 'var(--status-critical)', flexShrink: 0 }} />,
        };
      case 'success':
        return {
          bg: 'var(--status-normal-bg)',
          border: 'rgba(115, 138, 98, 0.4)',
          text: '#cbe3bc',
          icon: <CheckCircle2 size={18} style={{ color: 'var(--status-normal)', flexShrink: 0 }} />,
        };
      case 'info':
      default:
        return {
          bg: 'var(--status-info-bg)',
          border: 'rgba(145, 144, 138, 0.4)',
          text: '#e2e1dc',
          icon: <Info size={18} style={{ color: 'var(--status-info)', flexShrink: 0 }} />,
        };
    }
  };

  const style = getStyles();

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: 'var(--radius-sm)',
        marginBottom: '1.25rem',
      }}
      role="alert"
    >
      {style.icon}
      <div style={{ flex: 1, fontSize: '0.85rem', color: style.text, lineHeight: '1.4' }}>
        {title && <div style={{ fontWeight: '600', marginBottom: '0.15rem' }}>{title}</div>}
        <div>{message}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.1rem',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
