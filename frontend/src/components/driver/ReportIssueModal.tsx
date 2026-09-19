import React, { useState } from 'react';
import { AlertTriangle, X, CheckCircle2 } from 'lucide-react';
import type { ReportIssueInput, DriverRouteStop } from '../../types/driver';

interface ReportIssueModalProps {
  isOpen: boolean;
  stop?: DriverRouteStop | null;
  onClose: () => void;
  onSubmitIssue: (input: ReportIssueInput) => void;
}

export const ReportIssueModal: React.FC<ReportIssueModalProps> = ({
  isOpen,
  stop,
  onClose,
  onSubmitIssue,
}) => {
  if (!isOpen) return null;

  const [issueType, setIssueType] = useState<string>('Bin inaccessible');
  const [description, setDescription] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const issueOptions = [
    'Bin inaccessible',
    'Bin damaged',
    'Overflowed',
    'Wrong location',
    'Contaminated waste',
    'Vehicle issue',
    'Road/access problem',
    'Other',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    onSubmitIssue({
      binId: stop?.binId,
      issueType,
      description: description.trim(),
      notes: notes.trim(),
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setDescription('');
      setNotes('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 text-slate-900 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 leading-tight">Report Collection Issue</h3>
              {stop && <span className="text-[11px] font-mono text-slate-400">Bin: {stop.binId}</span>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 bg-transparent border-none cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 animate-bounce">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-base text-slate-900">Issue Reported Successfully</h4>
            <p className="text-xs text-slate-500 mt-1">Logged into central operational activity stream.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Issue Category</label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-slate-50 text-slate-900 font-medium text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                {issueOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Description *</label>
              <textarea
                required
                rows={3}
                placeholder="Describe the problem encountered during collection..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-50 text-slate-900 text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Optional Notes</label>
              <input
                type="text"
                placeholder="e.g. Photo taken, reported to supervisor"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-slate-50 text-slate-900 text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold cursor-pointer border border-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!description.trim()}
                className="flex-1 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white font-bold cursor-pointer border-none shadow-xs transition-all flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Submit Issue Report</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ReportIssueModal;
