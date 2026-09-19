import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

// Global helper function to trigger a website toast from anywhere
export const showWebsiteToast = (
  message: string,
  type: ToastMessage['type'] = 'success',
  title?: string
) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('website-toast-event', {
        detail: { message, type, title }
      })
    );
  }
};

interface NotificationToastProps {
  toasts?: ToastMessage[];
  onDismiss?: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toasts: propToasts, onDismiss }) => {
  const [localToasts, setLocalToasts] = useState<ToastMessage[]>([]);

  // Listen to global website-toast-event
  useEffect(() => {
    const handleGlobalToast = (e: Event) => {
      const customEv = e as CustomEvent<{ message: string; type?: ToastMessage['type']; title?: string }>;
      if (customEv.detail && customEv.detail.message) {
        const newToast: ToastMessage = {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 5),
          message: customEv.detail.message,
          type: customEv.detail.type || 'info',
          title: customEv.detail.title,
          duration: 4000
        };
        setLocalToasts(prev => [...prev.slice(-3), newToast]);
      }
    };

    window.addEventListener('website-toast-event', handleGlobalToast);
    return () => {
      window.removeEventListener('website-toast-event', handleGlobalToast);
    };
  }, []);

  const activeToasts = propToasts && propToasts.length > 0 ? propToasts : localToasts;

  const handleDismiss = (id: string) => {
    if (onDismiss) {
      onDismiss(id);
    }
    setLocalToasts(prev => prev.filter(t => t.id !== id));
  };

  if (!activeToasts || activeToasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
      {activeToasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={handleDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const { id, title, message, type = 'success', duration = 4000 } = toast;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss(id);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [id, duration, onDismiss]);

  const config = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />,
      border: 'border-emerald-500/30',
      progressBg: 'bg-emerald-500',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      defaultTitle: 'Success'
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />,
      border: 'border-red-500/30',
      progressBg: 'bg-red-500',
      badgeBg: 'bg-red-500/10 text-red-400 border-red-500/20',
      defaultTitle: 'Action Required'
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />,
      border: 'border-amber-500/30',
      progressBg: 'bg-amber-500',
      badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      defaultTitle: 'Attention'
    },
    info: {
      icon: <Info className="w-5 h-5 text-sky-400 shrink-0" />,
      border: 'border-sky-500/30',
      progressBg: 'bg-sky-500',
      badgeBg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      defaultTitle: 'Website Notification'
    }
  }[type];

  return (
    <div className={`pointer-events-auto relative overflow-hidden bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-xl shadow-2xl border ${config.border} flex items-start space-x-3.5 animate-in slide-in-from-bottom-5 fade-in duration-200`}>
      
      {/* Icon */}
      <div className="pt-0.5">{config.icon}</div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-center space-x-2 mb-0.5">
          <span className="text-xs font-semibold text-white tracking-tight">{title || config.defaultTitle}</span>
          <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${config.badgeBg}`}>
            {type}
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-snug">{message}</p>
      </div>

      {/* Dismiss X button */}
      <button
        onClick={() => onDismiss(id)}
        className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Timer Progress Bar */}
      <div className="absolute bottom-0 inset-x-0 h-0.5 bg-slate-800">
        <div
          className={`h-full ${config.progressBg} transition-all duration-75`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default NotificationToast;
