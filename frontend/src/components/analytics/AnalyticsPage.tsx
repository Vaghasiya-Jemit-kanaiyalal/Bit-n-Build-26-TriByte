import React, { useState } from 'react';
import AnalyticsHeader from './AnalyticsHeader';
import AnalyticsSubNav, { type AnalyticsTabType } from './AnalyticsSubNav';
import AnalyticsKpiGrid from './AnalyticsKpiGrid';
import WasteTrendChart from './WasteTrendChart';
import WasteByZoneChart from './WasteByZoneChart';
import WasteCompositionChart from './WasteCompositionChart';
import CollectionPerformance from './CollectionPerformance';
import OverflowAnalyticsCard from './OverflowAnalyticsCard';
import FleetUtilizationCard from './FleetUtilizationCard';
import RoutePerformanceCard from './RoutePerformanceCard';
import ZonePerformanceTable from './ZonePerformanceTable';
import ZoneAnalyticsDrawer from './ZoneAnalyticsDrawer';
import RecyclingAnalyticsCard from './RecyclingAnalyticsCard';
import PredictionAnalyticsCard from './PredictionAnalyticsCard';
import CollectionFunnel from './CollectionFunnel';
import OperationalBottlenecks from './OperationalBottlenecks';
import TimeOfDayAnalytics from './TimeOfDayAnalytics';
import ExportReportModal from './ExportReportModal';
import { showWebsiteToast } from '../common/NotificationToast';

import {
  analyticsService,
  type DateRangeType,
  type ComparePeriodType
} from '../../services/analyticsService';
import type { ZoneAnalyticsItem } from '../../mock/analyticsMockData';

interface AnalyticsPageProps {
  onNavigateTab?: (tabName: string) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onNavigateTab }) => {
  const [dateRange, setDateRange] = useState<DateRangeType>('Last 30 Days');
  const [comparePeriod, setComparePeriod] = useState<ComparePeriodType>('Previous Period');
  const [activeTab, setActiveTab] = useState<AnalyticsTabType>('Overview');
  const [selectedZoneFilter] = useState<string>('All');
  const [selectedDrawerZone, setSelectedDrawerZone] = useState<ZoneAnalyticsItem | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Fetch mock analytics data
  const summary = analyticsService.getSummary(dateRange, comparePeriod);
  const wasteTrends = analyticsService.getWasteTrends(dateRange, selectedZoneFilter);
  const zones = analyticsService.getZonePerformance();
  const composition = analyticsService.getWasteComposition();
  const fleet = analyticsService.getFleetUtilization();
  const routes = analyticsService.getRoutePerformance();
  const overflowTrend = analyticsService.getOverflowAnalytics();
  const predictionVsActual = analyticsService.getPredictionVsActual();
  const timeOfDayData = analyticsService.getTimeOfDayAnalytics();
  const bottlenecks = analyticsService.getBottlenecks();
  const insights = analyticsService.getOperationalInsights();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showWebsiteToast(
        `Analytics telemetry refreshed for period ${dateRange}.`,
        'info',
        'Analytics Synced'
      );
    }, 400);
  };

  const handleZoneSelectFromChart = (zoneName: string) => {
    const found = zones.find(z => z.name === zoneName);
    if (found) {
      setSelectedDrawerZone(found);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-16">
      
      {/* Analytics Header */}
      <AnalyticsHeader
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        comparePeriod={comparePeriod}
        onComparePeriodChange={setComparePeriod}
        onRefresh={handleRefresh}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        isRefreshing={isRefreshing}
      />

      {/* Sub-Navigation Tabs */}
      <AnalyticsSubNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="px-6 max-w-7xl mx-auto">

        {/* Top 5 Metric KPI Summary Cards */}
        <AnalyticsKpiGrid
          summary={summary}
          comparePeriod={comparePeriod}
        />

        {/* TAB 1: OVERVIEW TAB (FULL INTELLIGENCE DASHBOARD) */}
        {(activeTab === 'Overview' || activeTab === 'Waste') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 7 Cols: Waste Trend Chart */}
            <div className="lg:col-span-7">
              <WasteTrendChart data={wasteTrends} />
            </div>

            {/* Right 5 Cols: Waste by Zone */}
            <div className="lg:col-span-5">
              <WasteByZoneChart
                zones={zones}
                onSelectZone={handleZoneSelectFromChart}
              />
            </div>
          </div>
        )}

        {(activeTab === 'Overview' || activeTab === 'Waste' || activeTab === 'Recycling') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 6 Cols: Waste Composition */}
            <div className="lg:col-span-6">
              <WasteCompositionChart
                composition={composition}
                onNavigateToClassification={() => onNavigateTab && onNavigateTab('Classification')}
              />
            </div>

            {/* Right 6 Cols: Recycling Recovery & Impact */}
            <div className="lg:col-span-6">
              <RecyclingAnalyticsCard
                onNavigateToClassification={() => onNavigateTab && onNavigateTab('Classification')}
              />
            </div>
          </div>
        )}

        {(activeTab === 'Overview' || activeTab === 'Collections' || activeTab === 'Routes') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 6 Cols: Collection Performance SLA */}
            <div className="lg:col-span-6">
              <CollectionPerformance
                onNavigateToRoutes={() => onNavigateTab && onNavigateTab('Route')}
              />
            </div>

            {/* Right 6 Cols: Bin Overflow Analytics */}
            <div className="lg:col-span-6">
              <OverflowAnalyticsCard
                overflowTrend={overflowTrend}
                onNavigateToBins={() => onNavigateTab && onNavigateTab('Bin Management')}
              />
            </div>
          </div>
        )}

        {(activeTab === 'Overview' || activeTab === 'Fleet' || activeTab === 'Routes') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 6 Cols: Fleet Utilization */}
            <div className="lg:col-span-6">
              <FleetUtilizationCard
                fleet={fleet}
                onNavigateToVehicles={() => onNavigateTab && onNavigateTab('Vehicles')}
              />
            </div>

            {/* Right 6 Cols: Route Execution & Efficiency */}
            <div className="lg:col-span-6">
              <RoutePerformanceCard
                routes={routes}
                onNavigateToRoutes={() => onNavigateTab && onNavigateTab('Route')}
              />
            </div>
          </div>
        )}

        {(activeTab === 'Overview' || activeTab === 'Zones') && (
          <ZonePerformanceTable
            zones={zones}
            onSelectZone={(zone) => setSelectedDrawerZone(zone)}
          />
        )}

        {(activeTab === 'Overview' || activeTab === 'Predictions') && (
          <PredictionAnalyticsCard
            predictionVsActual={predictionVsActual}
            insights={insights}
            onNavigateToPredictions={() => onNavigateTab && onNavigateTab('Predictions')}
          />
        )}

        {activeTab === 'Overview' && (
          <>
            {/* Time of Day & Weekday Activity */}
            <TimeOfDayAnalytics timeData={timeOfDayData} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 6 Cols: Pipeline Conversion Funnel */}
              <div className="lg:col-span-6">
                <CollectionFunnel />
              </div>

              {/* Right 6 Cols: Operational Bottlenecks */}
              <div className="lg:col-span-6">
                <OperationalBottlenecks
                  bottlenecks={bottlenecks}
                  onNavigateTab={onNavigateTab}
                />
              </div>
            </div>
          </>
        )}

      </div>

      {/* Zone Analytics Slideover Drawer */}
      <ZoneAnalyticsDrawer
        zone={selectedDrawerZone}
        onClose={() => setSelectedDrawerZone(null)}
        onNavigateToBins={() => onNavigateTab && onNavigateTab('Bin Management')}
      />

      {/* Export Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        dateRange={dateRange}
      />

    </div>
  );
};

export default AnalyticsPage;
