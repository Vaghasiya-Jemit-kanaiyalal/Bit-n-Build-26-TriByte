import React, { useState, useEffect, useCallback } from 'react';
import type {
  ClassificationSummary,
  WasteCategoryItem,
  ClassificationTrendPoint,
  ConfidenceBucket,
  ClassificationEvent,
  MixedWasteRecord,
  ZoneClassification,
  ClassificationInsight,
  ClassificationModel,
  DateRangeOption,
  WasteType,
} from '../../../types/classification';
import { classificationService } from '../../../services/classificationService';

// Subcomponents
import { ClassificationHeader } from './ClassificationHeader';
import { ClassificationStatusBar } from './ClassificationStatusBar';
import { ClassificationKpiCards } from './ClassificationKpiCards';
import { ClassificationTabs, type ClassificationTabType } from './ClassificationTabs';
import { WasteCompositionChart } from './WasteCompositionChart';
import { RecyclableWasteCard } from './RecyclableWasteCard';
import { ClassificationTrendChart } from './ClassificationTrendChart';
import { CategoryPerformanceTable } from './CategoryPerformanceTable';
import { CategoryDetailsDrawer } from './CategoryDetailsDrawer';
import { ConfidenceDistribution } from './ConfidenceDistribution';
import { LiveClassificationFeed } from './LiveClassificationFeed';
import { ClassificationDetailsDrawer } from './ClassificationDetailsDrawer';
import { ReviewQueueTable } from './ReviewQueueTable';
import { ClassificationReviewModal } from './ClassificationReviewModal';
import { MixedWasteTable } from './MixedWasteTable';
import { ZoneAnalysisTable } from './ZoneAnalysisTable';
import { ZoneClassificationDrawer } from './ZoneClassificationDrawer';
import { ClassificationHistoryTable } from './ClassificationHistoryTable';
import { AIClassificationInsights } from './AIClassificationInsights';
import { ClassificationQualityCard } from './ClassificationQualityCard';
import { ModelInformationCard } from './ModelInformationCard';

import { CheckCircle2, X } from 'lucide-react';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  text: string;
}

interface ClassificationPageProps {
  onNavigateTab?: (tabName: string) => void;
}

export const ClassificationPage: React.FC<ClassificationPageProps> = ({ onNavigateTab }) => {
  // Master State
  const [summary, setSummary] = useState<ClassificationSummary | null>(null);
  const [categories, setCategories] = useState<WasteCategoryItem[]>([]);
  const [trendData, setTrendData] = useState<ClassificationTrendPoint[]>([]);
  const [confidenceDist, setConfidenceDist] = useState<ConfidenceBucket[]>([]);
  const [liveEvents, setLiveEvents] = useState<ClassificationEvent[]>([]);
  const [reviewQueue, setReviewQueue] = useState<ClassificationEvent[]>([]);
  const [mixedRecords, setMixedRecords] = useState<MixedWasteRecord[]>([]);
  const [zoneClassifications, setZoneClassifications] = useState<ZoneClassification[]>([]);
  const [insights, setInsights] = useState<ClassificationInsight[]>([]);
  const [modelInfo, setModelInfo] = useState<ClassificationModel | null>(null);
  const [historyEvents, setHistoryEvents] = useState<ClassificationEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters State
  const [dateRange, setDateRange] = useState<DateRangeOption>('Today');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedWasteType, setSelectedWasteType] = useState<WasteType | 'ALL'>('ALL');

  // Active Internal Tab
  const [activeTab, setActiveTab] = useState<ClassificationTabType>('Overview');

  // Drawers & Modals
  const [categoryDrawerItem, setCategoryDrawerItem] = useState<WasteCategoryItem | null>(null);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState<boolean>(false);

  const [eventDrawerItem, setEventDrawerItem] = useState<ClassificationEvent | null>(null);
  const [isEventDrawerOpen, setIsEventDrawerOpen] = useState<boolean>(false);

  const [reviewModalEvent, setReviewModalEvent] = useState<ClassificationEvent | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);

  const [zoneDrawerItem, setZoneDrawerItem] = useState<ZoneClassification | null>(null);
  const [isZoneDrawerOpen, setIsZoneDrawerOpen] = useState<boolean>(false);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Data Fetching
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    const [s, c, t, cd, l, r, m, z, i, mod, h] = await Promise.all([
      classificationService.getClassificationSummary(),
      classificationService.getWasteComposition(),
      classificationService.getClassificationTrend(),
      classificationService.getConfidenceDistribution(),
      classificationService.getLiveClassifications(),
      classificationService.getReviewQueue(),
      classificationService.getMixedWaste(),
      classificationService.getZoneAnalysis(),
      classificationService.getClassificationInsights(),
      classificationService.getModelInformation(),
      classificationService.getClassificationHistory(),
    ]);

    setSummary(s);
    setCategories(c);
    setTrendData(t);
    setConfidenceDist(cd);
    setLiveEvents(l);
    setReviewQueue(r);
    setMixedRecords(m);
    setZoneClassifications(z);
    setInsights(i);
    setModelInfo(mod);
    setHistoryEvents(h);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Actions
  const handleConfirmClassification = async (id: string) => {
    await classificationService.confirmClassification(id);
    setReviewQueue((prev) => prev.filter((item) => item.id !== id));
    showToast(`Classification ${id} confirmed successfully.`);
    fetchAllData();
  };

  const handleSaveCorrection = async (id: string, newCategory: WasteType, reason: string) => {
    await classificationService.correctClassification(id, newCategory, reason);
    setReviewQueue((prev) => prev.filter((item) => item.id !== id));
    showToast(`Classification updated successfully. Recyclability metrics updated.`, 'success');
    fetchAllData();
  };

  const handleRejectClassification = async (id: string) => {
    await classificationService.rejectClassification(id);
    setReviewQueue((prev) => prev.filter((item) => item.id !== id));
    showToast(`Classification ${id} marked as rejected.`, 'warning');
    fetchAllData();
  };

  const handleExport = (type: 'all' | 'composition' | 'review' | 'zone') => {
    const csvContent = classificationService.exportClassificationCSV(type);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecotrack_waste_classification_${type}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showToast(`Classification ${type} data exported prepared successfully.`);
  };

  const handleNavigateModule = (tabName: string) => {
    if (onNavigateTab) {
      onNavigateTab(tabName);
    }
  };

  if (isLoading || !summary || !modelInfo) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 space-y-6 max-w-[1600px] mx-auto animate-pulse">
        <div className="h-16 bg-slate-200 rounded-xl w-full" />
        <div className="h-12 bg-slate-200 rounded-xl w-full" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-slate-200 rounded-2xl w-full" />
      </div>
    );
  }

  const handleUploadImage = async (file: File) => {
    showToast(`Uploading and classifying "${file.name}" via AI vision model...`, 'info');
    const result = await classificationService.uploadImage(file);
    showToast(`Classified "${file.name}" as ${result.detectedCategory} with ${result.confidence}% confidence!`, 'success');
    fetchAllData();
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto pb-24">
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-lg shadow-xl border flex items-center justify-between text-xs font-medium animate-in slide-in-from-top-2 duration-200 ${
              t.type === 'warning'
                ? 'bg-amber-900 text-amber-50 border-amber-800'
                : t.type === 'info'
                ? 'bg-blue-900 text-blue-50 border-blue-800'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t.text}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* 1. Header Section */}
      <ClassificationHeader
        dateRange={dateRange}
        selectedZone={selectedZone}
        selectedWasteType={selectedWasteType}
        onDateRangeChange={setDateRange}
        onZoneChange={setSelectedZone}
        onWasteTypeChange={setSelectedWasteType}
        onRefresh={fetchAllData}
        onExport={handleExport}
        onUploadImage={handleUploadImage}
      />


      {/* 2. Classification Status Strip */}
      <ClassificationStatusBar summary={summary} />

      {/* 3. Top KPI Cards */}
      <ClassificationKpiCards
        summary={summary}
        onSelectCardTab={(tab) => setActiveTab(tab as ClassificationTabType)}
      />

      {/* 4. Internal Navigation Tabs */}
      <ClassificationTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingReviewCount={reviewQueue.filter((r) => r.reviewStatus === 'PENDING').length}
      />

      {/* 5. Tab Content Sections */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {/* Main Visual Row: Waste Composition + Recyclable Waste Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <WasteCompositionChart
              categories={categories}
              selectedCategory={selectedWasteType}
              onCategoryClick={(cat) => {
                setCategoryDrawerItem(cat);
                setIsCategoryDrawerOpen(true);
              }}
            />
            <RecyclableWasteCard />
          </div>

          {/* Classification Trend & Confidence Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClassificationTrendChart trendData={trendData} />
            <ConfidenceDistribution distribution={confidenceDist} />
          </div>

          {/* Category Performance Table */}
          <CategoryPerformanceTable
            categories={categories}
            onSelectCategory={(cat) => {
              setCategoryDrawerItem(cat);
              setIsCategoryDrawerOpen(true);
            }}
          />

          {/* AI Insights Section */}
          <AIClassificationInsights insights={insights} />

          {/* Mixed Waste Section */}
          <MixedWasteTable
            mixedRecords={mixedRecords}
            onReviewMixed={(rec) => {
              const matchingEvt = historyEvents.find((h) => h.id === rec.id) || {
                id: rec.id,
                timestamp: rec.detectedAt,
                date: 'Today',
                binId: rec.binId,
                zone: rec.zone,
                location: rec.location,
                detectedCategory: rec.primaryMaterial,
                confidence: rec.confidence,
                estimatedWeightKg: rec.estimatedWeightKg,
                source: 'AI Vision' as const,
                status: 'MIXED' as const,
                reviewStatus: rec.reviewStatus,
              };
              setReviewModalEvent(matchingEvt);
              setIsReviewModalOpen(true);
            }}
          />

          {/* Model Quality & Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClassificationQualityCard model={modelInfo} />
            <ModelInformationCard model={modelInfo} />
          </div>
        </div>
      )}

      {/* TAB 2: LIVE CLASSIFICATION */}
      {activeTab === 'Live Classification' && (
        <div className="space-y-6">
          <LiveClassificationFeed
            initialEvents={liveEvents}
            onSelectEvent={(evt) => {
              setEventDrawerItem(evt);
              setIsEventDrawerOpen(true);
            }}
          />
        </div>
      )}

      {/* TAB 3: REVIEW QUEUE */}
      {activeTab === 'Review Queue' && (
        <div className="space-y-6">
          <ReviewQueueTable
            queue={reviewQueue}
            onReview={(item) => {
              setReviewModalEvent(item);
              setIsReviewModalOpen(true);
            }}
            onConfirm={handleConfirmClassification}
            onReject={handleRejectClassification}
          />
        </div>
      )}

      {/* TAB 4: WASTE COMPOSITION */}
      {activeTab === 'Waste Composition' && (
        <div className="space-y-6">
          <WasteCompositionChart
            categories={categories}
            selectedCategory={selectedWasteType}
            onCategoryClick={(cat) => {
              setCategoryDrawerItem(cat);
              setIsCategoryDrawerOpen(true);
            }}
          />
          <RecyclableWasteCard />
          <CategoryPerformanceTable
            categories={categories}
            onSelectCategory={(cat) => {
              setCategoryDrawerItem(cat);
              setIsCategoryDrawerOpen(true);
            }}
          />
        </div>
      )}

      {/* TAB 5: ZONE ANALYSIS */}
      {activeTab === 'Zone Analysis' && (
        <div className="space-y-6">
          <ZoneAnalysisTable
            zones={zoneClassifications}
            onSelectZone={(z) => {
              setZoneDrawerItem(z);
              setIsZoneDrawerOpen(true);
            }}
          />
        </div>
      )}

      {/* TAB 6: CLASSIFICATION HISTORY */}
      {activeTab === 'Classification History' && (
        <div className="space-y-6">
          <ClassificationHistoryTable
            history={historyEvents}
            onSelectEvent={(evt) => {
              setEventDrawerItem(evt);
              setIsEventDrawerOpen(true);
            }}
            onExportCSV={() => handleExport('all')}
          />
        </div>
      )}

      {/* Drawers & Modals */}
      <CategoryDetailsDrawer
        category={categoryDrawerItem}
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab as ClassificationTabType)}
      />

      <ClassificationDetailsDrawer
        event={eventDrawerItem}
        isOpen={isEventDrawerOpen}
        onClose={() => setIsEventDrawerOpen(false)}
        onConfirm={handleConfirmClassification}
        onOpenReviewModal={(evt) => {
          setReviewModalEvent(evt);
          setIsReviewModalOpen(true);
        }}
        onNavigateToBins={() => {
          if (onNavigateTab) onNavigateTab('Bins');
        }}
      />

      <ClassificationReviewModal
        event={reviewModalEvent}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onConfirmClassification={handleConfirmClassification}
        onSaveCorrection={handleSaveCorrection}
      />

      <ZoneClassificationDrawer
        zone={zoneDrawerItem}
        isOpen={isZoneDrawerOpen}
        onClose={() => setIsZoneDrawerOpen(false)}
        onNavigateModule={handleNavigateModule}
      />
    </div>
  );
};

export default ClassificationPage;
