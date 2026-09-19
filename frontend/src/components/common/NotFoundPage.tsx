import React from 'react';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

interface NotFoundPageProps {
  onGoHome?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onGoHome }) => {
  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = '/admin/dashboard';
    }
  };

  const handleHome = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      window.location.href = '/admin/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 select-none">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div>
          <div className="text-4xl font-black tracking-tight text-white mb-2">404</div>
          <h1 className="text-lg font-bold text-slate-200">Page Not Found</h1>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            The requested resource or administration route does not exist or has been moved.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2 border border-slate-700 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <button
            type="button"
            onClick={handleHome}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 border-none cursor-pointer shadow-sm"
          >
            <Home className="w-4 h-4" />
            <span>Admin Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
