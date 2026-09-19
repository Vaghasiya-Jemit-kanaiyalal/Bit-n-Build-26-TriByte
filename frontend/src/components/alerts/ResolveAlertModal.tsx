import React, { useState, useEffect } from 'react';
import { X, CheckCircle } from 'lucide-react';
import type { AlertItem } from '../../mock/alertMockData';

interface ResolveAlertModalProps {
  alert: AlertItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmResolve: (alertId: string, note?: string) => void;
}

export const ResolveAlertModal: React.FC<ResolveAlertModalProps> = ({
  alert: alertItem,
  isOpen,
  onClose,
  onConfirmResolve,
}) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !alertItem) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmResolve(alertItem.id, note);
    setNote('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1000000] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-slate-800 rounded-lg text-[#88a573]">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Resolve Alert</h3>
              <p className="text-xs text-slate-400">Mark incident <span className="font-mono text-[#88a573]">{alertItem.id}</span> as resolved</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <div className="font-semibold text-slate-900">{alertItem.title}</div>
            <div className="text-slate-500 font-mono">Entity: {alertItem.entityId} &bull; Zone: {alertItem.zone}</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Resolution Note (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g., Collection completed by VEH-001; fill level reset to 0%."
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 focus:outline-none focus:border-[#738a62]"
            />
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#738a62] hover:bg-[#5f7350] rounded-lg shadow-2xs transition-colors flex items-center space-x-1"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              <span>Resolve Alert</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ResolveAlertModal;
