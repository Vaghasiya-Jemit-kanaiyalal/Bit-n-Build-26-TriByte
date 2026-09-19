import React, { useState } from 'react';
import { FastForward, X } from 'lucide-react';
import type { DriverRouteStop } from '../../types/driver';

interface SkipStopModalProps {
  isOpen: boolean;
  stop: DriverRouteStop | null;
  onClose: () => void;
  onSkipConfirm: (stopId: string, reason: string, notes?: string) => void;
}

export const SkipStopModal: React.FC<SkipStopModalProps> = ({
  isOpen,
  stop,
  onClose,
  onSkipConfirm,
}) => {
  if (!isOpen || !stop) return null;

  const [reason, setReason] = useState<string>('Bin inaccessible');
  const [notes, setNotes] = useState<string>('');

  const skipReasons = [
    'Bin inaccessible',
    'Road blocked',
    'Bin missing',
    'Vehicle issue',
    'Safety issue',
    'Other',
  ];

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    onSkipConfirm(stop.id, reason, notes.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 text-slate-900 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
              <FastForward className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">Skip Collection Stop</h3>
              <span className="text-[11px] font-mono text-slate-400">{stop.binId} &bull; {stop.location}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="mt-4 flex flex-col gap-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Reason for Skipping *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full h-9 px-3 rounded-lg bg-slate-50 text-slate-900 font-medium text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-600"
            >
              {skipReasons.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Additional Notes</label>
            <textarea
              rows={2}
              placeholder="Add details for supervisor record..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-slate-50 text-slate-900 text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer border border-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer border-none shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <FastForward className="w-4 h-4" />
              <span>Confirm Skip</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SkipStopModal;
