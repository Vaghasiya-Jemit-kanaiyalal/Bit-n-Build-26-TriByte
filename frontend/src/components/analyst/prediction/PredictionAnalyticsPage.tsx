import React, { useState } from 'react';
import PredictionAnalyticsHeader from './PredictionAnalyticsHeader';
import PredictionAnalyticsKpis from './PredictionAnalyticsKpis';
import PredictionAccuracyChart from './PredictionAccuracyChart';
import ActualVsPredictedChart from './ActualVsPredictedChart';
import PredictionPerformanceTable from './PredictionPerformanceTable';
import PredictionInsights from './PredictionInsights';
import { predictionAnalyticsService } from '../../../services/predictionAnalyticsService';
import { showWebsiteToast } from '../../common/NotificationToast';

export const PredictionAnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<string>('Last 30 Days');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const kpis = predictionAnalyticsService.getKpis(dateRange);
  const accuracyTrends = predictionAnalyticsService.getAccuracyTrends(dateRange);
  const actualVsPredicted = predictionAnalyticsService.getActualVsPredicted(dateRange);
  const performanceList = predictionAnalyticsService.getPerformanceList();
  const insights = predictionAnalyticsService.getInsights();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showWebsiteToast(`Prediction analytics synced for ${dateRange}.`, 'info', 'Telemetry Synced');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      <PredictionAnalyticsHeader
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="max-w-7xl mx-auto px-6">
        <PredictionAnalyticsKpis kpis={kpis} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PredictionAccuracyChart data={accuracyTrends} />
          <ActualVsPredictedChart data={actualVsPredicted} />
        </div>

        <PredictionPerformanceTable list={performanceList} />

        <PredictionInsights insights={insights} />
      </div>
    </div>
  );
};

export default PredictionAnalyticsPage;
