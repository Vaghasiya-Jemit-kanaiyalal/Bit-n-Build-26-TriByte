import React from 'react';
import { Moon, Send } from 'lucide-react';
import type { NotificationSettingsData } from '../../../types/settings';
import { settingsService } from '../../../services/settingsService';

interface AlertsNotificationsSectionProps {
  data: NotificationSettingsData;
  onChange: (data: NotificationSettingsData) => void;
}

export const AlertsNotificationsSection: React.FC<AlertsNotificationsSectionProps> = ({ data, onChange }) => {
  const handleTypeToggle = (key: keyof typeof data.alertTypes) => {
    const updated = { ...data.alertTypes, [key]: !data.alertTypes[key] };
    onChange({ ...data, alertTypes: updated });
  };

  const handleChannelToggle = (key: keyof typeof data.channels) => {
    const updated = { ...data.channels, [key]: !data.channels[key] };
    onChange({ ...data, channels: updated });
  };

  const handleChange = (field: keyof NotificationSettingsData, val: any) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 m-0">Alerts & Notifications</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Configure alert rules, notification channels, quiet hours, and test trigger dispatch.
          </p>
        </div>

        {/* Test Notification Button */}
        <button
          type="button"
          onClick={() => settingsService.sendTestNotification()}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#047857] hover:bg-[#064e3b] text-white text-xs font-bold rounded-lg shadow-2xs transition-all cursor-pointer border-none"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Test Notification</span>
        </button>
      </div>

      {/* Notification Channels */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
          Notification Dispatch Channels
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <label className="flex items-center space-x-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={data.channels.inApp}
              onChange={() => handleChannelToggle('inApp')}
              className="rounded text-[#047857] focus:ring-0"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 block">In-App Popups</span>
              <span className="text-[10px] text-slate-400">Modal Toast</span>
            </div>
          </label>

          <label className="flex items-center space-x-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={data.channels.email}
              onChange={() => handleChannelToggle('email')}
              className="rounded text-[#047857] focus:ring-0"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 block">Email Alerts</span>
              <span className="text-[10px] text-slate-400">Digest / Urgent</span>
            </div>
          </label>

          <label className="flex items-center space-x-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={data.channels.push}
              onChange={() => handleChannelToggle('push')}
              className="rounded text-[#047857] focus:ring-0"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 block">Mobile Push</span>
              <span className="text-[10px] text-slate-400">Dispatcher App</span>
            </div>
          </label>

          <label className="flex items-center space-x-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer">
            <input
              type="checkbox"
              checked={data.channels.sms}
              onChange={() => handleChannelToggle('sms')}
              className="rounded text-[#047857] focus:ring-0"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 block">SMS Direct</span>
              <span className="text-[10px] text-slate-400">Emergency SMS</span>
            </div>
          </label>
        </div>
      </div>

      {/* Alert Types Toggles */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
          Active Alert Types & Triggers (13 Rules)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs font-semibold">
          {Object.entries(data.alertTypes).map(([key, enabled]) => (
            <label key={key} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100">
              <span className="text-slate-800 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => handleTypeToggle(key as keyof typeof data.alertTypes)}
                className="rounded text-[#047857] focus:ring-0"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Moon className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-bold text-slate-900">Enable Quiet Hours</span>
          </div>
          <input
            type="checkbox"
            checked={data.quietHoursEnabled}
            onChange={(e) => handleChange('quietHoursEnabled', e.target.checked)}
            className="w-4 h-4 rounded text-[#047857] focus:ring-0 cursor-pointer"
          />
        </div>

        {data.quietHoursEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Start Time</label>
              <input
                type="text"
                value={data.quietHoursStart}
                onChange={(e) => handleChange('quietHoursStart', e.target.value)}
                className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-mono font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">End Time</label>
              <input
                type="text"
                value={data.quietHoursEnd}
                onChange={(e) => handleChange('quietHoursEnd', e.target.value)}
                className="w-full px-3 py-1.5 bg-[#f9fafb] border border-[#d1d5db] rounded text-xs font-mono font-bold text-slate-900"
              />
            </div>

            <div className="flex items-center space-x-2 pt-5">
              <input
                type="checkbox"
                checked={data.criticalBypassQuietHours}
                onChange={(e) => handleChange('criticalBypassQuietHours', e.target.checked)}
                className="rounded text-[#047857] focus:ring-0"
              />
              <span className="text-xs font-bold text-red-700">Critical Alerts Bypass Quiet Hours</span>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default AlertsNotificationsSection;
