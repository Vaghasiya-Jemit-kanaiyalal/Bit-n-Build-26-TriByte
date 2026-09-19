import React, { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

// Global helper function to trigger a website toast / center modal popup from anywhere
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
          duration: 5000
        };
        // Replace current modal so latest action pops up cleanly
        setLocalToasts([newToast]);
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

  // Render the top active notification as a modern centered modal popup
  const currentToast = activeToasts[activeToasts.length - 1];

  return (
    <CenterNotificationModal
      toast={currentToast}
      onClose={() => handleDismiss(currentToast.id)}
    />
  );
};

interface CenterNotificationModalProps {
  toast: ToastMessage;
  onClose: () => void;
}

const CenterNotificationModal: React.FC<CenterNotificationModalProps> = ({ toast, onClose }) => {
  const { title, message, type = 'success' } = toast;

  // Configuration for modal styling based on type
  const config = {
    success: {
      badgeText: 'SUCCESS',
      bgRing: 'ring-[#dcfce7]',
      circleBg: 'bg-[#ecfdf5]',
      iconColor: 'text-[#059669]',
      defaultTitle: 'Notification Received!',
      primaryBtnText: 'Go to dashboard',
      primaryBtnBg: 'bg-slate-900 hover:bg-slate-800 text-white',
      illustration: (
        <div className="relative flex items-center justify-center">
          {/* Peace Sign Hand Vector Graphic */}
          <div className="w-16 h-16 rounded-full bg-[#bbf7d0] border-2 border-emerald-500/40 flex items-center justify-center shadow-xs">
            <span className="text-3xl select-none">✌️</span>
          </div>
        </div>
      )
    },
    error: {
      badgeText: 'CRITICAL ALERT',
      bgRing: 'ring-red-100',
      circleBg: 'bg-red-50',
      iconColor: 'text-red-600',
      defaultTitle: 'Attention Required!',
      primaryBtnText: 'Review Incident',
      primaryBtnBg: 'bg-red-600 hover:bg-red-700 text-white',
      illustration: (
        <div className="w-16 h-16 rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center text-red-600 shadow-xs">
          <AlertCircle className="w-9 h-9" />
        </div>
      )
    },
    warning: {
      badgeText: 'WARNING',
      bgRing: 'ring-amber-100',
      circleBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
      defaultTitle: 'System Notice',
      primaryBtnText: 'Acknowledge',
      primaryBtnBg: 'bg-slate-900 hover:bg-slate-800 text-white',
      illustration: (
        <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-amber-600 shadow-xs">
          <AlertTriangle className="w-9 h-9" />
        </div>
      )
    },
    info: {
      badgeText: 'INFORMATION',
      bgRing: 'ring-emerald-100',
      circleBg: 'bg-emerald-50',
      iconColor: 'text-[#047857]',
      defaultTitle: 'Notifications are on!',
      primaryBtnText: 'Go to dashboard',
      primaryBtnBg: 'bg-slate-900 hover:bg-slate-800 text-white',
      illustration: (
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#bbf7d0] border-2 border-emerald-500/40 flex items-center justify-center shadow-xs">
            <span className="text-3xl select-none">✌️</span>
          </div>
        </div>
      )
    }
  }[type];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Click outside backdrop to dismiss */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Main Center Modal Card */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
        
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors cursor-pointer border-none bg-transparent"
          title="Close notification"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Centered Illustration / Circle Graphic */}
        <div className={`mb-5 p-3 rounded-full ${config.circleBg} ring-8 ${config.bgRing} transition-all duration-300`}>
          {config.illustration}
        </div>

        {/* Modal Title */}
        <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight tracking-tight">
          {title || config.defaultTitle}
        </h3>

        {/* Modal Subtitle / Message */}
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xs mb-7">
          {message}
        </p>

        {/* Single Bottom Dismiss Action Button */}
        <div className="w-full">
          <button
            onClick={onClose}
            className="w-full px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer border-none"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
};

export default NotificationToast;
