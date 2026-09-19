import React, { useState } from 'react';
import RecyclingAnalyticsHeader from './RecyclingAnalyticsHeader';
import RecyclingAnalyticsKpis from './RecyclingAnalyticsKpis';
import RecyclingTrendChart from './RecyclingTrendChart';
import RecyclableWasteChart from './RecyclableWasteChart';
import RecoveryTable from './RecoveryTable';
import RecyclingInsights from './RecyclingInsights';
import { recyclingAnalyticsService } from '../../../services/recyclingAnalyticsService';
import { showWebsiteToast } from '../../common/NotificationToast';

export const RecyclingAnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<string>('Last 30 Days');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const kpis = recyclingAnalyticsService.getKpis(dateRange);
  const recyclingTrends = recyclingAnalyticsService.getRecyclingTrends(dateRange);
  const categories = recyclingAnalyticsService.getCategoryRecoveryList();
  const insights = recyclingAnalyticsService.getInsights();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showWebsiteToast(`Recycling analytics synced for ${dateRange}.`, 'info', 'Telemetry Synced');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      <RecyclingAnalyticsHeader
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="max-w-7xl mx-auto px-6">
        <RecyclingAnalyticsKpis kpis={kpis} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RecyclingTrendChart data={recyclingTrends} />
          <RecyclableWasteChart data={recyclingTrends} />
        </div>

        <RecoveryTable categories={categories} />

        <RecyclingInsights insights={insights} />
      </div>
    </div>
  );
};

export default RecyclingAnalyticsPage;
