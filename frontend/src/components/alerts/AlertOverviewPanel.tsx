import React from 'react';
import type { AlertItem } from '../../mock/alertMockData';
import AlertCategoryChart from './AlertCategoryChart';
import AIAlertInsights from './AIAlertInsights';
import AlertTimeline from './AlertTimeline';

interface AlertOverviewPanelProps {
  alerts: AlertItem[];
  onSelectAlert?: (alert: AlertItem) => void;
  onNavigateToPredictions?: () => void;
}

export const AlertOverviewPanel: React.FC<AlertOverviewPanelProps> = ({
  alerts,
  onSelectAlert,
  onNavigateToPredictions,
}) => {
  return (
    <div className="space-y-6">
      {/* Alerts by Category */}
      <AlertCategoryChart alerts={alerts} />

      {/* AI Alert Insights */}
      <AIAlertInsights onNavigateToPredictions={onNavigateToPredictions} />

      {/* Recent Alert Timeline */}
      <AlertTimeline alerts={alerts} onSelectAlert={onSelectAlert} />

    </div>
  );
};

export default AlertOverviewPanel;
