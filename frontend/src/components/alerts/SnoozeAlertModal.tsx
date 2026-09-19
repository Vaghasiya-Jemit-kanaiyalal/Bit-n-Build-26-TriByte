import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';
import type { AlertItem } from '../../mock/alertMockData';

interface SnoozeAlertModalProps {
  alert: AlertItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmSnooze: (alertId: string, duration: string) => void;
}

export const SnoozeAlertModal: React.FC<SnoozeAlertModalProps> = ({
  alert: alertItem,
  isOpen,
  onClose,
  onConfirmSnooze,
}) => {
  const [duration, setDuration] = useState('1 hour');

  if (!isOpen || !alertItem) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSnooze(alertItem.id, duration);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-slate-800 rounded-lg text-sky-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Snooze Alert</h3>
              <p className="text-xs text-slate-400">Pause notification for <span className="font-mono text-sky-400">{alertItem.id}</span></p>
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
              Select Snooze Duration
            </label>
            <select
              value={duration}
              onChange={e => setDuration(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#738a62]"
            >
              <option value="15 minutes">15 minutes</option>
              <option value="30 minutes">30 minutes</option>
              <option value="1 hour">1 hour</option>
              <option value="4 hours">4 hours</option>
              <option value="Tomorrow 09:00 AM">Tomorrow 09:00 AM</option>
            </select>
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
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-2xs transition-colors flex items-center space-x-1"
            >
              <Clock className="w-4 h-4 mr-1 text-sky-400" />
              <span>Snooze Alert</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default SnoozeAlertModal;
