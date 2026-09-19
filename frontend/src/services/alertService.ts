import { initialAlerts, type AlertItem } from '../mock/alertMockData';

let alertStore: AlertItem[] = [...initialAlerts];

export const alertService = {
  getAlerts: (): AlertItem[] => {
    return [...alertStore];
  },

  getAlertById: (id: string): AlertItem | undefined => {
    return alertStore.find(a => a.id === id);
  },

  acknowledgeAlert: (id: string): AlertItem | null => {
    const idx = alertStore.findIndex(a => a.id === id);
    if (idx !== -1) {
      alertStore[idx] = {
        ...alertStore[idx],
        status: 'ACKNOWLEDGED',
        acknowledgedAt: 'Just now',
        isRead: true,
        activityLog: [
          { timestamp: 'Just now', description: 'Alert acknowledged by Waste Manager', actor: 'Admin' },
          ...(alertStore[idx].activityLog || [])
        ]
      };
      return alertStore[idx];
    }
    return null;
  },

  resolveAlert: (id: string, note?: string): AlertItem | null => {
    const idx = alertStore.findIndex(a => a.id === id);
    if (idx !== -1) {
      alertStore[idx] = {
        ...alertStore[idx],
        status: 'RESOLVED',
        resolvedAt: 'Just now',
        resolutionNote: note || 'Resolved by operational dispatch',
        isRead: true,
        activityLog: [
          { timestamp: 'Just now', description: `Alert resolved. Note: ${note || 'Verified in field'}`, actor: 'Admin' },
          ...(alertStore[idx].activityLog || [])
        ]
      };
      return alertStore[idx];
    }
    return null;
  },

  snoozeAlert: (id: string, duration: string): AlertItem | null => {
    const idx = alertStore.findIndex(a => a.id === id);
    if (idx !== -1) {
      alertStore[idx] = {
        ...alertStore[idx],
        status: 'SNOOZED',
        snoozedUntil: duration,
        isRead: true,
        activityLog: [
          { timestamp: 'Just now', description: `Alert snoozed until ${duration}`, actor: 'Admin' },
          ...(alertStore[idx].activityLog || [])
        ]
      };
      return alertStore[idx];
    }
    return null;
  },

  markAlertRead: (id: string): void => {
    alertStore = alertStore.map(a => (a.id === id ? { ...a, isRead: true } : a));
  },

  markAlertUnread: (id: string): void => {
    alertStore = alertStore.map(a => (a.id === id ? { ...a, isRead: false } : a));
  },

  markAllRead: (): void => {
    alertStore = alertStore.map(a => ({ ...a, isRead: true }));
  },

  bulkAction: (ids: string[], action: 'read' | 'acknowledge' | 'resolve' | 'snooze', payload?: any): void => {
    ids.forEach(id => {
      if (action === 'read') alertService.markAlertRead(id);
      if (action === 'acknowledge') alertService.acknowledgeAlert(id);
      if (action === 'resolve') alertService.resolveAlert(id, payload?.note);
      if (action === 'snooze') alertService.snoozeAlert(id, payload?.duration || '1 hour');
    });
  },

  getAlertStats: (alerts: AlertItem[]) => {
    const total = alerts.length;
    const active = alerts.filter(a => a.status === 'ACTIVE').length;
    const critical = alerts.filter(a => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;
    const unacknowledged = alerts.filter(a => a.status === 'ACTIVE' && !a.acknowledgedAt).length;
    const resolvedToday = alerts.filter(a => a.status === 'RESOLVED').length;
    const aiAlerts = alerts.filter(a => a.aiGenerated).length;
    const unread = alerts.filter(a => !a.isRead).length;

    return { total, active, critical, unacknowledged, resolvedToday, aiAlerts, unread };
  },

  getAlertTrends: () => {
    return [
      { day: 'Mon', critical: 3, high: 5, medium: 8, low: 4 },
      { day: 'Tue', critical: 2, high: 6, medium: 7, low: 5 },
      { day: 'Wed', critical: 5, high: 8, medium: 9, low: 3 },
      { day: 'Thu', critical: 1, high: 4, medium: 6, low: 6 },
      { day: 'Fri', critical: 4, high: 7, medium: 10, low: 2 },
      { day: 'Sat', critical: 3, high: 5, medium: 8, low: 4 },
      { day: 'Sun', critical: 4, high: 6, medium: 7, low: 3 },
    ];
  },

  getAlertCategories: (alerts: AlertItem[]) => {
    const total = alerts.length || 1;
    const binCount = alerts.filter(a => a.entityType === 'BIN').length;
    const routeCount = alerts.filter(a => a.entityType === 'ROUTE').length;
    const vehicleCount = alerts.filter(a => a.entityType === 'VEHICLE').length;
    const aiCount = alerts.filter(a => a.aiGenerated).length;
    const sensorCount = alerts.filter(a => a.source === 'Sensor').length;
    const systemCount = alerts.filter(a => a.entityType === 'SYSTEM').length;

    return [
      { name: 'Bin', count: binCount, percent: Math.round((binCount / total) * 100) },
      { name: 'Route', count: routeCount, percent: Math.round((routeCount / total) * 100) },
      { name: 'Vehicle', count: vehicleCount, percent: Math.round((vehicleCount / total) * 100) },
      { name: 'AI Prediction', count: aiCount, percent: Math.round((aiCount / total) * 100) },
      { name: 'Sensor', count: sensorCount, percent: Math.round((sensorCount / total) * 100) },
      { name: 'System', count: systemCount, percent: Math.round((systemCount / total) * 100) },
    ];
  }
};
