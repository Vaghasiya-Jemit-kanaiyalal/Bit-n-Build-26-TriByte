import React, { useState, useEffect, useCallback } from 'react';
import type {
  PredictionFilterState,
  FillForecastBin,
  ZoneForecastItem,
  LowConfidencePrediction,
  PredictionPriorityItem,
} from '../../../types/prediction';
import { predictionService } from '../../../services/predictionService';

// Subcomponents
import { PredictionHeader } from './PredictionHeader';
import { PredictionEngineStatus } from './PredictionEngineStatus';
import { PredictionKpiCards } from './PredictionKpiCards';
import { PredictionWorkflowBanner } from './PredictionWorkflowBanner';
import { PredictionTabs, type PredictionTabType } from './PredictionTabs';

// Overview Tab
import { ForecastSummaryChart } from './ForecastSummaryChart';
import { PredictionSummaryPanel } from './PredictionSummaryPanel';
import { PredictionRiskMap } from './PredictionRiskMap';
import { PredictionInsights } from './PredictionInsights';
import { OperationalRecommendations } from './OperationalRecommendations';

// Fill Forecast Tab
import { FillForecastTable } from './FillForecastTable';
import { PredictionDetailDrawer } from './PredictionDetailDrawer';

// Overflow Risk Tab
import { OverflowRiskOverview } from './OverflowRiskOverview';
import { OverflowRiskTable } from './OverflowRiskTable';

// Waste Demand Tab
import { WasteDemandChart } from './WasteDemandChart';
import { ZoneForecastTable } from './ZoneForecastTable';
import { ZonePredictionDrawer } from './ZonePredictionDrawer';
import { CollectionDemandChart } from './CollectionDemandChart';
import { PredictionPriorityQueue } from './PredictionPriorityQueue';

// Prediction Quality Tab
import { PredictionQuality } from './PredictionQuality';
import { PredictionModelCard } from './PredictionModelCard';
import { ConfidenceDistribution } from './ConfidenceDistribution';
import { LowConfidenceTable } from './LowConfidenceTable';
import { PredictionReviewDrawer } from './PredictionReviewDrawer';

// History Tab
import { PredictionHistoryTable } from './PredictionHistoryTable';
import { PredictedVsActualChart } from './PredictedVsActualChart';

interface PredictionPageProps {
  onNavigateTab?: (tabName: string) => void;
}

export const PredictionPage: React.FC<PredictionPageProps> = ({ onNavigateTab }) => {
  // Navigation Handler
  const handleNavigate = useCallback(
    (route: string) => {
      if (!onNavigateTab) return;
      if (route.includes('/admin/planning')) onNavigateTab('Planning');
      else if (route.includes('/admin/bins')) onNavigateTab('Bin Management');
      else if (route.includes('/admin/monitoring')) onNavigateTab('Monitoring');
      else if (route.includes('/admin/analytics')) onNavigateTab('Analytics');
      else if (route.includes('/admin/alerts')) onNavigateTab('Alerts');
    },
    [onNavigateTab]
  );

  // Active Internal Tab State
  const [activeTab, setActiveTab] = useState<PredictionTabType>('Overview');

  // Filter State
  const [filters, setFilters] = useState<PredictionFilterState>({
    horizon: '24h',
    dateRange: 'today',
    zone: 'All',
    wasteType: 'All',
    riskLevel: 'All',
    confidence: 'All',
    searchQuery: '',
  });

  // Live Simulation Toggle State
  const [isLive, setIsLive] = useState<boolean>(true);

  // Selected Item Drawers State
  const [selectedBin, setSelectedBin] = useState<FillForecastBin | null>(null);
  const [selectedZone, setSelectedZone] = useState<ZoneForecastItem | null>(null);
  const [selectedReviewItem, setSelectedReviewItem] = useState<LowConfidencePrediction | null>(null);

  // Data State
  const [engineStatus, setEngineStatus] = useState(predictionService.getPredictionEngineStatus());
  const [kpiSummary, setKpiSummary] = useState(predictionService.getKpiSummary());
  const timeSeries = predictionService.getForecastTimeSeries();
  const summaryData = predictionService.getPredictionSummaryData();
  const [binsList, setBinsList] = useState<FillForecastBin[]>(predictionService.getFillForecastBins(filters));
  const riskDistribution = predictionService.getOverflowRiskDistribution();
  const wasteDemandPoints = predictionService.getWasteDemandForecastPoints();
  const [zoneForecasts, setZoneForecasts] = useState(predictionService.getZoneForecasts(filters.zone));
  const demandBreakdown = predictionService.getCollectionDemandBreakdown();
  const priorityQueue = predictionService.getPredictionPriorityQueue();
  const confidenceDistribution = predictionService.getConfidenceDistribution();
  const [lowConfidenceList, setLowConfidenceList] = useState(predictionService.getLowConfidencePredictions());
  const qualityMetrics = predictionService.getPredictionQualityMetrics();
  const modelInfo = predictionService.getPredictionModelInfo();
  const [historyList, setHistoryList] = useState(predictionService.getPredictionHistory());
  const insights = predictionService.getPredictionInsights();
  const recommendations = predictionService.getOperationalRecommendations();

  // Refresh Handler
  const handleRefresh = useCallback(() => {
    setBinsList(predictionService.getFillForecastBins(filters));
    setEngineStatus(predictionService.getPredictionEngineStatus());
    setKpiSummary(predictionService.getKpiSummary());
    setZoneForecasts(predictionService.getZoneForecasts(filters.zone));
    setLowConfidenceList(predictionService.getLowConfidencePredictions());
    setHistoryList(predictionService.getPredictionHistory());
  }, [filters]);

  // Live Stream Micro Simulation Effect
  useEffect(() => {
    if (!isLive) return;
    const timer = setInterval(() => {
      setEngineStatus((prev) => ({
        ...prev,
        predictionsGenerated: prev.predictionsGenerated + 1,
        lastPredictionRun: 'Just now',
      }));
    }, 8000);

    return () => clearInterval(timer);
  }, [isLive]);

  // Re-fetch bins on filter change
  useEffect(() => {
    setBinsList(predictionService.getFillForecastBins(filters));
    setZoneForecasts(predictionService.getZoneForecasts(filters.zone));
  }, [filters]);

  // Review Actions
  const handleAcceptReview = (id: string) => {
    predictionService.reviewPrediction(id, 'ACCEPTED');
    setLowConfidenceList(predictionService.getLowConfidencePredictions());
  };

  const handleDismissReview = (id: string) => {
    predictionService.reviewPrediction(id, 'DISMISSED');
    setLowConfidenceList(predictionService.getLowConfidencePredictions());
  };

  const handleAddToPlanBin = (_bin: FillForecastBin) => {
    handleNavigate('/admin/planning');
  };

  const handleAddToPlanPriority = (_item: PredictionPriorityItem) => {
    handleNavigate('/admin/planning');
  };

  const handleExport = (type: 'all' | 'overflow' | 'waste' | 'history') => {
    const msg = predictionService.exportPredictions(type);
    alert(msg);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col">
      {/* 1. Page Header */}
      <PredictionHeader
        filters={filters}
        onFilterChange={(newFilters) => setFilters((prev) => ({ ...prev, ...newFilters }))}
        onRefresh={handleRefresh}
        onExport={handleExport}
      />

      {/* Main Body */}
      <main className="p-6 flex-1 max-w-7xl w-full mx-auto space-y-6">
        {/* 2. Prediction Engine Status Bar */}
        <PredictionEngineStatus
          status={engineStatus}
          isLive={isLive}
          onToggleLive={() => setIsLive(!isLive)}
        />

        {/* 3. Top KPI Grid */}
        <PredictionKpiCards kpi={kpiSummary} />

        {/* 4. Horizontal Workflow Progress Banner */}
        <PredictionWorkflowBanner />

        {/* 5. Internal Tabs Navigation */}
        <PredictionTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          riskCount={kpiSummary.predictedOverflow}
        />

        {/* 6. TAB CONTENT */}

        {/* --- TAB 1: OVERVIEW --- */}
        {activeTab === 'Overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <ForecastSummaryChart points={timeSeries} />
              </div>
              <div className="lg:col-span-5">
                <PredictionSummaryPanel summary={summaryData} />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <PredictionRiskMap bins={binsList} onSelectBin={setSelectedBin} />
              </div>
              <div className="lg:col-span-5">
                <PredictionInsights insights={insights} />
              </div>
            </div>

            <OperationalRecommendations
              recommendations={recommendations}
              onNavigate={handleNavigate}
            />
          </div>
        )}

        {/* --- TAB 2: FILL FORECAST --- */}
        {activeTab === 'Fill Forecast' && (
          <div className="space-y-6">
            <FillForecastTable
              bins={binsList}
              onSelectBin={setSelectedBin}
              onAddToPlan={handleAddToPlanBin}
            />
          </div>
        )}

        {/* --- TAB 3: OVERFLOW RISK --- */}
        {activeTab === 'Overflow Risk' && (
          <div className="space-y-6">
            <OverflowRiskOverview distribution={riskDistribution} />
            <OverflowRiskTable
              bins={binsList}
              onSelectBin={setSelectedBin}
              onAddToPlan={handleAddToPlanBin}
            />
          </div>
        )}

        {/* --- TAB 4: WASTE DEMAND --- */}
        {activeTab === 'Waste Demand' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <WasteDemandChart points={wasteDemandPoints} />
              </div>
              <div className="lg:col-span-5">
                <CollectionDemandChart demand={demandBreakdown} />
              </div>
            </div>

            <ZoneForecastTable zones={zoneForecasts} onSelectZone={setSelectedZone} />

            <PredictionPriorityQueue queue={priorityQueue} onAddToPlan={handleAddToPlanPriority} />
          </div>
        )}

        {/* --- TAB 5: PREDICTION QUALITY --- */}
        {activeTab === 'Prediction Quality' && (
          <div className="space-y-6">
            <PredictionQuality quality={qualityMetrics} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <ConfidenceDistribution
                  distribution={confidenceDistribution}
                  lowConfidenceCount={lowConfidenceList.filter((p) => p.status === 'PENDING').length}
                />
              </div>
              <div className="lg:col-span-6">
                <PredictionModelCard model={modelInfo} />
              </div>
            </div>

            <LowConfidenceTable predictions={lowConfidenceList} onReview={setSelectedReviewItem} />
          </div>
        )}

        {/* --- TAB 6: PREDICTION HISTORY --- */}
        {activeTab === 'Prediction History' && (
          <div className="space-y-6">
            <PredictedVsActualChart history={historyList} />
            <PredictionHistoryTable history={historyList} />
          </div>
        )}
      </main>

      {/* DRAWERS */}
      <PredictionDetailDrawer
        bin={selectedBin}
        isOpen={!!selectedBin}
        onClose={() => setSelectedBin(null)}
        onNavigate={handleNavigate}
      />

      <ZonePredictionDrawer
        zone={selectedZone}
        isOpen={!!selectedZone}
        onClose={() => setSelectedZone(null)}
        onNavigate={handleNavigate}
      />

      <PredictionReviewDrawer
        prediction={selectedReviewItem}
        isOpen={!!selectedReviewItem}
        onClose={() => setSelectedReviewItem(null)}
        onAccept={handleAcceptReview}
        onDismiss={handleDismissReview}
      />
    </div>
  );
};

export default PredictionPage;
