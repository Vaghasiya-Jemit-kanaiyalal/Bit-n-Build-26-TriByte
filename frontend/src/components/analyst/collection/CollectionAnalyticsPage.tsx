import React, { useState } from 'react';
import CollectionAnalyticsHeader from './CollectionAnalyticsHeader';
import CollectionAnalyticsKpis from './CollectionAnalyticsKpis';
import CollectionPerformanceChart from './CollectionPerformanceChart';
import PlannedVsCompletedChart from './PlannedVsCompletedChart';
import CollectionPerformanceTable from './CollectionPerformanceTable';
import CollectionInsights from './CollectionInsights';
import { collectionAnalyticsService } from '../../../services/collectionAnalyticsService';
import { showWebsiteToast } from '../../common/NotificationToast';

export const CollectionAnalyticsPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<string>('Last 30 Days');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const kpis = collectionAnalyticsService.getKpis(dateRange);
  const collectionTrends = collectionAnalyticsService.getCollectionTrends(dateRange);
  const performanceList = collectionAnalyticsService.getPerformanceList();
  const bottlenecks = collectionAnalyticsService.getBottlenecks();
  const insights = collectionAnalyticsService.getInsights();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showWebsiteToast(`Collection analytics synced for ${dateRange}.`, 'info', 'Telemetry Synced');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      <CollectionAnalyticsHeader
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      <div className="max-w-7xl mx-auto px-6">
        <CollectionAnalyticsKpis kpis={kpis} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <CollectionPerformanceChart data={collectionTrends} />
          <PlannedVsCompletedChart data={collectionTrends} />
        </div>

        <CollectionPerformanceTable list={performanceList} bottlenecks={bottlenecks} />

        <CollectionInsights insights={insights} />
      </div>
    </div>
  );
};

export default CollectionAnalyticsPage;
