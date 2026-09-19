import React, { useState, useMemo } from 'react';
import { alertService } from '../../services/alertService';
import type { AlertItem } from '../../mock/alertMockData';
import { AlertsHeader } from './AlertsHeader';
import { AlertKpiGrid } from './AlertKpiGrid';
import { AlertStatusSummary } from './AlertStatusSummary';
import { CriticalAlertsSection } from './CriticalAlertsSection';
import { AlertFilterToolbar } from './AlertFilterToolbar';
import { AlertFeedTable } from './AlertFeedTable';
import { AlertOverviewPanel } from './AlertOverviewPanel';
import { AlertDetailsDrawer } from './AlertDetailsDrawer';
import { AlertSettingsDrawer } from './AlertSettingsDrawer';
import { ResolveAlertModal } from './ResolveAlertModal';
import { SnoozeAlertModal } from './SnoozeAlertModal';
import { showWebsiteToast } from '../common/NotificationToast';
import GarbageTruckLoader from '../common/GarbageTruckLoader';

interface AlertsPageProps {
  onNavigateTab?: (tabName: string, targetId?: string) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ onNavigateTab }) => {
  // State
  const [alerts, setAlerts] = useState<AlertItem[]>(() => alertService.getAlerts());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [zoneFilter, setZoneFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [activeKpiFilter, setActiveKpiFilter] = useState<string | undefined>(undefined);

  // UI Drawer & Modal State
  const [drawerAlert, setDrawerAlert] = useState<AlertItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [resolveAlert, setResolveAlert] = useState<AlertItem | null>(null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  const [snoozeAlert, setSnoozeAlert] = useState<AlertItem | null>(null);
  const [isSnoozeModalOpen, setIsSnoozeModalOpen] = useState(false);

  // Stats
  const stats = useMemo(() => alertService.getAlertStats(alerts), [alerts]);

  // Filter & Search Logic
  const filteredAlerts = useMemo(() => {
    return alerts.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          item.id.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.entityId.toLowerCase().includes(q) ||
          item.location.toLowerCase().includes(q) ||
          item.zone.toLowerCase().includes(q) ||
          item.source.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Severity
      if (severityFilter !== 'All' && item.severity !== severityFilter) {
        return false;
      }

      // Status Bar Filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'UNREAD' && item.isRead) return false;
        if (statusFilter !== 'UNREAD' && item.status !== statusFilter) return false;
      }

      // Source Filter
      if (sourceFilter !== 'All' && item.source !== sourceFilter) {
        return false;
      }

      // Zone Filter
      if (zoneFilter !== 'All' && item.zone !== zoneFilter) {
        return false;
      }

      return true;
    });
  }, [alerts, searchQuery, severityFilter, statusFilter, sourceFilter, zoneFilter]);

  // Critical Alerts list for top highlight
  const criticalAttentionAlerts = useMemo(() => {
    return alerts.filter(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE');
  }, [alerts]);

  // Handlers
  const handleRefresh = () => {
    setIsRefreshing(true);
    setIsLoading(true);
    setTimeout(() => {
      setAlerts(alertService.getAlerts());
      setIsLoading(false);
      setIsRefreshing(false);
      showWebsiteToast('Alert incident feed refreshed with latest telemetry.', 'info', 'Alert Feed Synced');
    }, 1000);
  };

  const handleMarkAllRead = () => {
    alertService.markAllRead();
    setAlerts(alertService.getAlerts());
    showWebsiteToast('All operational alerts marked as read.', 'success', 'All Read');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSeverityFilter('All');
    setStatusFilter('ALL');
    setTypeFilter('All');
    setSourceFilter('All');
    setZoneFilter('All');
    setDateFilter('All');
    setActiveKpiFilter(undefined);
    showWebsiteToast('Filters cleared.', 'info', 'Filters Reset');
  };

  const handleKpiSelect = (filterKey: string) => {
    setActiveKpiFilter(filterKey);
    if (filterKey === 'ACTIVE') {
      setStatusFilter('ACTIVE');
      setSeverityFilter('All');
      setSourceFilter('All');
    } else if (filterKey === 'CRITICAL') {
      setSeverityFilter('CRITICAL');
      setStatusFilter('ACTIVE');
      setSourceFilter('All');
    } else if (filterKey === 'UNACKNOWLEDGED') {
      setStatusFilter('ACTIVE');
      setSeverityFilter('All');
      setSourceFilter('All');
    } else if (filterKey === 'RESOLVED') {
      setStatusFilter('RESOLVED');
      setSeverityFilter('All');
      setSourceFilter('All');
    } else if (filterKey === 'AI_PREDICTION') {
      setSourceFilter('AI Prediction');
      setStatusFilter('ALL');
      setSeverityFilter('All');
    }
  };

  const handleOpenDrawer = (alertItem: AlertItem) => {
    alertService.markAlertRead(alertItem.id);
    setAlerts(alertService.getAlerts());
    setDrawerAlert(alertItem);
    setIsDrawerOpen(true);
  };

  const handleAcknowledge = (id: string) => {
    alertService.acknowledgeAlert(id);
    setAlerts(alertService.getAlerts());
    if (drawerAlert?.id === id) {
      setDrawerAlert(alertService.getAlertById(id) || null);
    }
    showWebsiteToast(`Alert ${id} acknowledged by operator.`, 'success', 'Alert Acknowledged');
  };

  const handleOpenResolveModal = (alertItem: AlertItem) => {
    setResolveAlert(alertItem);
    setIsResolveModalOpen(true);
  };

  const handleConfirmResolve = (id: string, note?: string) => {
    alertService.resolveAlert(id, note);
    setAlerts(alertService.getAlerts());
    if (drawerAlert?.id === id) {
      setDrawerAlert(alertService.getAlertById(id) || null);
    }
    showWebsiteToast(`Alert ${id} resolved successfully.`, 'success', 'Incident Resolved');
  };

  const handleOpenSnoozeModal = (alertItem: AlertItem) => {
    setSnoozeAlert(alertItem);
    setIsSnoozeModalOpen(true);
  };

  const handleConfirmSnooze = (id: string, duration: string) => {
    alertService.snoozeAlert(id, duration);
    setAlerts(alertService.getAlerts());
    if (drawerAlert?.id === id) {
      setDrawerAlert(alertService.getAlertById(id) || null);
    }
    showWebsiteToast(`Alert ${id} snoozed until ${duration}.`, 'info', 'Alert Snoozed');
  };

  const handleToggleRead = (id: string, isRead: boolean) => {
    if (isRead) alertService.markAlertRead(id);
    else alertService.markAlertUnread(id);
    setAlerts(alertService.getAlerts());
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]));
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredAlerts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAlerts.map(a => a.id));
    }
  };

  const handleBulkAction = (action: 'read' | 'acknowledge' | 'snooze' | 'resolve') => {
    if (selectedIds.length === 0) return;
    alertService.bulkAction(selectedIds, action);
    setAlerts(alertService.getAlerts());
    showWebsiteToast(`Bulk ${action} executed for ${selectedIds.length} alerts.`, 'success', 'Bulk Action Complete');
    setSelectedIds([]);
  };

  const handleNavigateToResource = (item: AlertItem) => {
    if (!onNavigateTab) {
      showWebsiteToast(`Navigating to ${item.entityType} ${item.entityId}...`, 'info', 'Resource Navigation');
      return;
    }

    if (item.entityType === 'BIN') {
      onNavigateTab('Bin Management', item.entityId);
    } else if (item.entityType === 'VEHICLE') {
      onNavigateTab('Vehicles', item.entityId);
    } else if (item.entityType === 'ROUTE') {
      onNavigateTab('Route', item.entityId);
    } else if (item.source === 'AI Prediction' || item.type.includes('Prediction')) {
      onNavigateTab('Predictions', item.entityId);
    } else if (item.source === 'Sensor') {
      onNavigateTab('Monitoring', item.entityId);
    } else {
      onNavigateTab('Analytics', item.entityId);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-slate-900 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Page Header */}
        <AlertsHeader
          onMarkAllRead={handleMarkAllRead}
          onRefresh={handleRefresh}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isRefreshing={isRefreshing}
        />

        {/* Loader during simulated refresh */}
        {isLoading ? (
          <div className="py-16 bg-white border border-slate-200 rounded-2xl shadow-2xs">
            <GarbageTruckLoader message="Synchronizing municipal alert feeds & IoT sensor heartbeats..." />
          </div>
        ) : (
          <>
            {/* Top KPI Summary Cards */}
            <AlertKpiGrid
              stats={stats}
              activeKpiFilter={activeKpiFilter}
              onSelectKpiFilter={handleKpiSelect}
            />

            {/* Critical Attention Highlight Section */}
            <CriticalAlertsSection
              criticalAlerts={criticalAttentionAlerts}
              onViewAlert={handleOpenDrawer}
              onAcknowledgeAlert={handleAcknowledge}
            />

            {/* Status Quick Filter Bar */}
            <AlertStatusSummary
              currentStatus={statusFilter}
              onStatusChange={setStatusFilter}
              counts={{
                all: alerts.length,
                active: alerts.filter(a => a.status === 'ACTIVE').length,
                acknowledged: alerts.filter(a => a.status === 'ACKNOWLEDGED').length,
                resolved: alerts.filter(a => a.status === 'RESOLVED').length,
                snoozed: alerts.filter(a => a.status === 'SNOOZED').length,
                unread: alerts.filter(a => !a.isRead).length,
              }}
            />

            {/* Filter Toolbar */}
            <AlertFilterToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              severityFilter={severityFilter}
              onSeverityChange={setSeverityFilter}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              typeFilter={typeFilter}
              onTypeChange={setTypeFilter}
              sourceFilter={sourceFilter}
              onSourceChange={setSourceFilter}
              zoneFilter={zoneFilter}
              onZoneChange={setZoneFilter}
              dateFilter={dateFilter}
              onDateChange={setDateFilter}
              onClearFilters={handleClearFilters}
              filteredCount={filteredAlerts.length}
              totalCount={alerts.length}
            />

            {/* Desktop 2-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left 70%: Alert Feed Table */}
              <div className="lg:col-span-8">
                <AlertFeedTable
                  alerts={filteredAlerts}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onToggleSelectAll={handleToggleSelectAll}
                  onViewAlert={handleOpenDrawer}
                  onAcknowledge={handleAcknowledge}
                  onSnooze={handleOpenSnoozeModal}
                  onResolve={handleOpenResolveModal}
                  onToggleRead={handleToggleRead}
                  onNavigateToResource={handleNavigateToResource}
                  onBulkAction={handleBulkAction}
                  onClearFilters={handleClearFilters}
                />
              </div>

              {/* Right 30%: Alert Overview Panel */}
              <div className="lg:col-span-4">
                <AlertOverviewPanel
                  alerts={alerts}
                  onSelectAlert={handleOpenDrawer}
                  onNavigateToPredictions={() => onNavigateTab && onNavigateTab('Predictions')}
                />
              </div>

            </div>
          </>
        )}

      </div>

      {/* Alert Details Slide-Over Drawer */}
      <AlertDetailsDrawer
        alert={drawerAlert}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onAcknowledge={handleAcknowledge}
        onSnooze={handleOpenSnoozeModal}
        onResolve={handleOpenResolveModal}
        onNavigateToResource={handleNavigateToResource}
      />

      {/* Alert Settings Drawer */}
      <AlertSettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSavePreferences={() => showWebsiteToast('Alert notification preferences saved.', 'success', 'Settings Saved')}
      />

      {/* Resolve Alert Modal */}
      <ResolveAlertModal
        alert={resolveAlert}
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        onConfirmResolve={handleConfirmResolve}
      />

      {/* Snooze Alert Modal */}
      <SnoozeAlertModal
        alert={snoozeAlert}
        isOpen={isSnoozeModalOpen}
        onClose={() => setIsSnoozeModalOpen(false)}
        onConfirmSnooze={handleConfirmSnooze}
      />

    </div>
  );
};

export default AlertsPage;
