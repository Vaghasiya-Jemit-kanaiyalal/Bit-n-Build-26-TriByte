import React, { useState } from 'react';
import { ShieldCheck, Laptop } from 'lucide-react';
import type { SecuritySettingsData, ActiveUserSession } from '../../../types/settings';
import { settingsService } from '../../../services/settingsService';
import { showWebsiteToast } from '../../common/NotificationToast';

interface SecuritySectionProps {
  data: SecuritySettingsData;
  onChange: (data: SecuritySettingsData) => void;
}

export const SecuritySection: React.FC<SecuritySectionProps> = ({ data, onChange }) => {
  const [sessionToRevoke, setSessionToRevoke] = useState<ActiveUserSession | null>(null);

  const handleConfirmRevoke = () => {
    if (!sessionToRevoke) return;
    const updated = settingsService.revokeSession(sessionToRevoke.id);
    onChange(updated.security);
    showWebsiteToast(`Session ${sessionToRevoke.device} revoked successfully.`, 'success', 'Session Terminated');
    setSessionToRevoke(null);
  };

  const handleRevokeAllOthers = () => {
    const updated = settingsService.revokeAllOtherSessions();
    onChange(updated.security);
    showWebsiteToast('All other active sessions have been revoked.', 'success', 'Sessions Cleared');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900 m-0">Security & Authentication</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Manage platform authentication policies, session timeouts, and active device sessions.
        </p>
      </div>

      {/* Security Status Card */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#047857] text-white rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900">Security Enforcement Status</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded border border-emerald-300">
                Protected
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">JWT Bearer Token Auth &bull; Password Hashing Active</span>
          </div>
        </div>
      </div>

      {/* Active Sessions List */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
            Active Device Sessions ({data.activeSessions.length})
          </h3>
          {data.activeSessions.length > 1 && (
            <button
              type="button"
              onClick={handleRevokeAllOthers}
              className="text-xs font-bold text-red-700 hover:underline cursor-pointer border-none bg-transparent"
            >
              Revoke All Other Sessions
            </button>
          )}
        </div>

        <div className="space-y-2">
          {data.activeSessions.map((sess) => (
            <div key={sess.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Laptop className="w-4 h-4 text-slate-500 shrink-0" />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">{sess.device}</span>
                    {sess.isCurrent && (
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                        Current Session
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {sess.browser} &bull; {sess.location} ({sess.ipAddress}) &bull; {sess.lastActive}
                  </span>
                </div>
              </div>

              {!sess.isCurrent && (
                <button
                  type="button"
                  onClick={() => setSessionToRevoke(sess)}
                  className="px-2.5 py-1 bg-white border border-red-200 text-red-700 hover:bg-red-50 text-[11px] font-bold rounded cursor-pointer transition-colors"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal for Revoking Session */}
      {sessionToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-base font-bold text-slate-900 m-0">Revoke Session?</h3>
            <p className="text-xs text-slate-600 m-0">
              Are you sure you want to terminate session on <strong className="text-slate-900">{sessionToRevoke.device}</strong> ({sessionToRevoke.location})?
            </p>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setSessionToRevoke(null)}
                className="px-4 py-2 bg-white border border-slate-300 text-xs font-bold text-slate-700 rounded-lg hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevoke}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-2xs cursor-pointer border-none"
              >
                Revoke Session
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SecuritySection;
