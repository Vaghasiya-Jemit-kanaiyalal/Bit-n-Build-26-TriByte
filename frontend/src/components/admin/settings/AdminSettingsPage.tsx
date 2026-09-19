import React, { useState } from 'react';
import SettingsHeader from './SettingsHeader';
import SettingsSidebar from './SettingsSidebar';
import OrganizationSection from './OrganizationSection';
import ProfileSection from './ProfileSection';
import WasteOperationsSection from './WasteOperationsSection';
import BinMonitoringSection from './BinMonitoringSection';
import CollectionRoutesSection from './CollectionRoutesSection';
import VehiclesSection from './VehiclesSection';
import AiPredictionsSection from './AiPredictionsSection';
import AlertsNotificationsSection from './AlertsNotificationsSection';
import UsersAccessSection from './UsersAccessSection';
import SecuritySection from './SecuritySection';
import AppearanceSection from './AppearanceSection';
import DataExportSection from './DataExportSection';
import SystemInfoSection from './SystemInfoSection';
import DangerZoneSection from './DangerZoneSection';

import { settingsService } from '../../../services/settingsService';
import { showWebsiteToast } from '../../common/NotificationToast';
import type { AllAdminSettings, SettingsSectionId } from '../../../types/settings';

interface AdminSettingsPageProps {
  onNavigateTab?: (tabName: string) => void;
}

export const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({ onNavigateTab }) => {
  const [activeSection, setActiveSection] = useState<SettingsSectionId>('organization');
  const [savedSettings, setSavedSettings] = useState<AllAdminSettings>(() => settingsService.getSettings());
  const [workingSettings, setWorkingSettings] = useState<AllAdminSettings>(() => settingsService.getSettings());
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Check if there are unsaved changes
  const hasUnsavedChanges = JSON.stringify(savedSettings) !== JSON.stringify(workingSettings);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      const updated = settingsService.saveSettings(workingSettings);
      setSavedSettings(updated);
      setWorkingSettings(updated);
      setIsSaving(false);
      showWebsiteToast(
        'WasteWise platform configuration settings saved successfully.',
        'success',
        'Settings Saved'
      );
    }, 400);
  };

  const handleReset = () => {
    setWorkingSettings(JSON.parse(JSON.stringify(savedSettings)));
    showWebsiteToast('Unsaved changes reverted to last saved configuration.', 'info', 'Changes Reverted');
  };

  const handleResetAllToDefaults = () => {
    const defaults = settingsService.resetToDefault();
    setSavedSettings(defaults);
    setWorkingSettings(defaults);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-16">
      
      {/* Settings Header */}
      <SettingsHeader
        hasUnsavedChanges={hasUnsavedChanges}
        onSave={handleSave}
        onReset={handleReset}
        isSaving={isSaving}
      />

      {/* Main Two-Column Layout */}
      <div className="px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-start gap-6">
        
        {/* Left Sticky Sidebar Navigation */}
        <SettingsSidebar
          activeSection={activeSection}
          onSelectSection={setActiveSection}
        />

        {/* Right Section Content Card */}
        <main className="flex-1 w-full min-w-0">
          
          {activeSection === 'organization' && (
            <OrganizationSection
              data={workingSettings.organization}
              onChange={(data) => setWorkingSettings(prev => ({ ...prev, organization: data }))}
            />
          )}

          {activeSection === 'profile' && (
            <ProfileSection
              data={workingSettings.profile}
              onChange={(data) => setWorkingSettings(prev => ({ ...prev, profile: data }))}
            />
          )}

          {activeSection === 'waste' && (
            <WasteOperationsSection
              data={workingSettings.waste}
              onChange={(data) => setWorkingSettings(prev => ({ ...prev, waste: data }))}
            />
          )}

          {activeSection === 'bin' && (
            <BinMonitoringSection
              data={workingSettings.bin}
              onChange={(data) => setWorkingSettings(prev => ({ ...prev, bin: data }))}
            />
          )}

          {activeSection === 'routes' && (
            <CollectionRoutesSection
              data={workingSettings.routes}
              onChange={(data) => setWorkingSettings(prev => ({ ...prev, routes: data }))}
            />
          )}

          {activeSection === 'vehicles' && (
            <VehiclesSection
              data={workingSettings.vehicles}
              onChange={(data) => setWorkingSettings(prev => ({ ...prev, vehicles: data }))}
            />
          )}

          {activeSection === 'ai' && (
            <AiPredictionsSection
              data={workingSettings.ai}
              onChange={(data) => setWorkingSettings(prev => ({ ...prev, ai: data }))}
            />
          )}

          {activeSection === 'alerts' && (
            <AlertsNotificationsSection
              data={workingSettings.notifications}
              onChange={(data) => setWorkingSettings(prev => ({ ...prev, notifications: data }))}
            />
          )}

          {activeSection === 'users' && (
            <UsersAccessSection
              data={workingSettings.access}
              onChange={(data) => setWorkingSettings(prev => ({ ...prev, access: data }))}
              onNavigateToUsers={() => onNavigateTab && onNavigateTab('Users')}
            />
          )}

          {activeSection === 'security' && (
            <SecuritySection
              data={workingSettings.security}
              onChange={(data) => setWorkingSettings(prev => ({ ...prev, security: data }))}
            />
          )}

          {activeSection === 'appearance' && (
            <AppearanceSection
              data={workingSettings.appearance}
              onChange={(data) => setWorkingSettings(prev => ({ ...prev, appearance: data }))}
            />
          )}

          {activeSection === 'data' && (
            <DataExportSection
              data={workingSettings.data}
              onChange={(data) => setWorkingSettings(prev => ({ ...prev, data: data }))}
            />
          )}

          {activeSection === 'system' && (
            <SystemInfoSection
              data={workingSettings.system}
            />
          )}

          {/* Danger Zone */}
          <DangerZoneSection
            onResetAllSettings={handleResetAllToDefaults}
          />

        </main>

      </div>

    </div>
  );
};

export default AdminSettingsPage;
