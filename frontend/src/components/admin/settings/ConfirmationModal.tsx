import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  confirmButtonClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  confirmText = 'Confirm Action',
  confirmButtonClass = 'bg-red-600 hover:bg-red-700 text-white',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onCancel} />

      {/* Modal Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95 duration-200">
        
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-red-100 text-red-600 rounded-xl shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 m-0 leading-tight">{title}</h3>
            <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-white border border-slate-300 text-xs font-bold text-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold rounded-lg shadow-2xs cursor-pointer border-none ${confirmButtonClass}`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ConfirmationModal;
