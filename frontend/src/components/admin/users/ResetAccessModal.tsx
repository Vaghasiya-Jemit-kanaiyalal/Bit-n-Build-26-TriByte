import React, { useState } from 'react';
import type { PlatformUser } from '../../../types/user';
import { X, RotateCcw, Key, MailCheck, ShieldCheck } from 'lucide-react';

interface ResetAccessModalProps {
  isOpen: boolean;
  user: PlatformUser | null;
  onClose: () => void;
  onConfirm: (userId: string, option: string) => void;
}

export const ResetAccessModal: React.FC<ResetAccessModalProps> = ({
  isOpen,
  user,
  onClose,
  onConfirm,
}) => {
  const [option, setOption] = useState<'SEND_LINK' | 'FORCE_CHANGE' | 'TEMP_TOKEN'>('SEND_LINK');

  if (!isOpen || !user) return null;

  const handleReset = () => {
    onConfirm(user.id, option);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000000] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Reset User Access & Credentials</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p className="font-bold text-slate-900">{user.fullName}</p>
            <p className="text-[11px] text-slate-500 font-mono">{user.email} • {user.userCode}</p>
          </div>

          <p className="text-slate-600">Select how to reset access for this user account:</p>

          <div className="space-y-2">
            <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
              option === 'SEND_LINK'
                ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-400'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}>
              <input
                type="radio"
                name="resetOption"
                checked={option === 'SEND_LINK'}
                onChange={() => setOption('SEND_LINK')}
                className="mt-0.5 text-slate-900 focus:ring-slate-500"
              />
              <div>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <MailCheck className="w-3.5 h-3.5 text-blue-600" /> Send Password Reset Email Link
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Sends a secure, timed reset link to {user.email}.
                </p>
              </div>
            </label>

            <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
              option === 'FORCE_CHANGE'
                ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-400'
                : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}>
              <input
                type="radio"
                name="resetOption"
                checked={option === 'FORCE_CHANGE'}
                onChange={() => setOption('FORCE_CHANGE')}
                className="mt-0.5 text-slate-900 focus:ring-slate-500"
              />
              <div>
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-600" /> Force Password Change on Next Login
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  User will be prompted to create a new password immediately after logging in.
                </p>
              </div>
            </label>
          </div>

          <div className="bg-slate-100 p-2.5 rounded text-[11px] text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Actual user passwords are never stored or displayed in plain text.</span>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-sm"
            >
              Reset Access Instructions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
