import { initialAdminSettingsMock } from '../mock/adminSettingsMock';
import type { AllAdminSettings } from '../types/settings';
import { showWebsiteToast } from '../components/common/NotificationToast';

let currentSettings: AllAdminSettings = JSON.parse(JSON.stringify(initialAdminSettingsMock));

export const settingsService = {
  getSettings: (): AllAdminSettings => {
    return JSON.parse(JSON.stringify(currentSettings));
  },

  saveSettings: (newSettings: AllAdminSettings): AllAdminSettings => {
    currentSettings = JSON.parse(JSON.stringify(newSettings));
    currentSettings.organization.lastUpdated = new Date().toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return JSON.parse(JSON.stringify(currentSettings));
  },

  resetToDefault: (): AllAdminSettings => {
    currentSettings = JSON.parse(JSON.stringify(initialAdminSettingsMock));
    return JSON.parse(JSON.stringify(currentSettings));
  },

  sendTestNotification: () => {
    showWebsiteToast(
      'Test notification dispatched! Operational alert channels are configured and responsive.',
      'info',
      'Test Alert Triggered'
    );
  },

  revokeSession: (sessionId: string): AllAdminSettings => {
    currentSettings.security.activeSessions = currentSettings.security.activeSessions.filter(
      s => s.id !== sessionId
    );
    return JSON.parse(JSON.stringify(currentSettings));
  },

  revokeAllOtherSessions: (): AllAdminSettings => {
    currentSettings.security.activeSessions = currentSettings.security.activeSessions.filter(
      s => s.isCurrent
    );
    return JSON.parse(JSON.stringify(currentSettings));
  }
};

export default settingsService;
