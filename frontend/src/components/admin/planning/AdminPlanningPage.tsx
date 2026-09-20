import React, { useState, useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import type {
  PlanningSummary,
  ZoneDemand,
  PriorityBin,
  PlanningVehicle,
  PlanningDriver,
  PlanningConstraint,
  CollectionWindow,
  PlanningRoute,
  PlanningIssue,
  PlanningPlan,
  OptimizationStrategy,
} from '../../../types/planning';
import { planningService } from '../../../services/planningService';
import { PlanningHeader } from './PlanningHeader';
import { PlanningStatusBar } from './PlanningStatusBar';
import { PlanningWorkflowBanner } from './PlanningWorkflowBanner';
import { PlanningKpiGrid } from './PlanningKpiGrid';
import { DemandOverview } from './DemandOverview';
import { ZoneDemandTable } from './ZoneDemandTable';
import { ZonePlanningDrawer } from './ZonePlanningDrawer';
import { CollectionPrioritySection } from './CollectionPrioritySection';
import { BinPriorityDrawer } from './BinPriorityDrawer';
import { CollectionPlanBuilder } from './CollectionPlanBuilder';
import { FleetCapacitySection } from './FleetCapacitySection';
import { DriverAvailabilitySection } from './DriverAvailabilitySection';
import { PlanningConstraintsSection } from './PlanningConstraintsSection';
import { CollectionWindowsSection } from './CollectionWindowsSection';
import { GeneratePlanModal } from './GeneratePlanModal';
import { GeneratedRoutesSection } from './GeneratedRoutesSection';
import { RoutePlanningDrawer } from './RoutePlanningDrawer';
import { PlanningMapPreview } from './PlanningMapPreview';
import { PlanningIssuesSection } from './PlanningIssuesSection';
import { RecentPlansSection } from './RecentPlansSection';

interface AdminPlanningPageProps {
  onNavigate?: (tab: string) => void;
}

export const AdminPlanningPage: React.FC<AdminPlanningPageProps> = ({ onNavigate }) => {
  // Data States
  const [summary, setSummary] = useState<PlanningSummary | null>(null);
  const [zoneDemand, setZoneDemand] = useState<ZoneDemand[]>([]);
  const [priorityBins, setPriorityBins] = useState<PriorityBin[]>([]);
  const [vehicles, setVehicles] = useState<PlanningVehicle[]>([]);
  const [drivers, setDrivers] = useState<PlanningDriver[]>([]);
  const [constraints, setConstraints] = useState<PlanningConstraint | null>(null);
  const [collectionWindows, setCollectionWindows] = useState<CollectionWindow[]>([]);
  const [generatedRoutes, setGeneratedRoutes] = useState<PlanningRoute[]>([]);
  const [issues, setIssues] = useState<PlanningIssue[]>([]);
  const [recentPlans, setRecentPlans] = useState<PlanningPlan[]>([]);

  // Selection & Form States
  const [planningDate, setPlanningDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [planningHorizon, setPlanningHorizon] = useState<string>('Next 24 Hours');
  const [strategy] = useState<OptimizationStrategy>('Balanced');
  const [selectedWindow, setSelectedWindow] = useState<string>('15:00 – 18:00');
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>(['TRK-021', 'TRK-014', 'TRK-008']);
  const [selectedDriverIds, setSelectedDriverIds] = useState<string[]>(['D-102', 'D-105', 'D-109']);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Workflow Step State
  const [currentWorkflowStep, setCurrentWorkflowStep] = useState<number>(3);

  // Drawers & Modals States
  const [selectedZone, setSelectedZone] = useState<ZoneDemand | null>(null);
  const [selectedBin, setSelectedBin] = useState<PriorityBin | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<PlanningRoute | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);
  const [isSaveConfirmModalOpen, setIsSaveConfirmModalOpen] = useState<boolean>(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initial Load
  useEffect(() => {
    setSummary(planningService.getPlanningSummary());
    setZoneDemand(planningService.getZoneDemand());
    setPriorityBins(planningService.getPriorityBins());
    setVehicles(planningService.getAvailableVehicles());
    setDrivers(planningService.getAvailableDrivers());
    setConstraints(planningService.getPlanningConstraints());
    setCollectionWindows(planningService.getCollectionWindows());
    setGeneratedRoutes(planningService.getGeneratedRoutes());
    setIssues(planningService.getPlanningIssues());
    setRecentPlans(planningService.getRecentPlans());
  }, []);

  const handleRefresh = () => {
    setSummary(planningService.getPlanningSummary());
    setToastMessage('Planning telemetry refreshed successfully.');
    setHasUnsavedChanges(false);
  };

  // Selection Handlers
  const handleTogglePlanBin = (binId: string) => {
    setPriorityBins((prev) =>
      prev.map((b) => (b.binId === binId ? { ...b, isSelectedForPlan: !b.isSelectedForPlan, isSelected: !b.isSelected } : b))
    );
    setHasUnsavedChanges(true);
  };

  const handleBulkAddToPlan = (binIds: string[]) => {
    setPriorityBins((prev) =>
      prev.map((b) => (binIds.includes(b.binId) ? { ...b, isSelectedForPlan: true, isSelected: true } : b))
    );
    setHasUnsavedChanges(true);
    setToastMessage(`Added ${binIds.length} bins to collection plan.`);
  };

  const handleToggleVehicleSelection = (vehicleId: string) => {
    setSelectedVehicleIds((prev) =>
      prev.includes(vehicleId) ? prev.filter((id) => id !== vehicleId) : [...prev, vehicleId]
    );
    setHasUnsavedChanges(true);
  };

  const handleToggleDriverSelection = (driverId: string) => {
    setSelectedDriverIds((prev) =>
      prev.includes(driverId) ? prev.filter((id) => id !== driverId) : [...prev, driverId]
    );
    setHasUnsavedChanges(true);
  };

  const handleUpdateConstraint = (key: keyof PlanningConstraint, value: boolean | number) => {
    if (!constraints) return;
    setConstraints({ ...constraints, [key]: value });
    setHasUnsavedChanges(true);
  };


  const handleResolveIssue = (issueId: string) => {
    setIssues((prev) =>
      prev.map((i) => (i.issueId === issueId || i.id === issueId ? { ...i, isResolved: true } : i))
    );
    setToastMessage('Planning conflict resolved.');
  };

  const handleDeleteDraftPlan = (planId: string) => {
    setRecentPlans((prev) => prev.filter((p) => p.planId !== planId && p.id !== planId));
    setToastMessage(`Draft plan ${planId} deleted.`);
  };

  const handlePlanGenerated = () => {
    setIsGenerateModalOpen(false);
    setCurrentWorkflowStep(5); // Review state
    setToastMessage('Collection plan generated successfully.');
    setHasUnsavedChanges(true);
  };

  const handleSavePlanConfirm = () => {
    setIsSaveConfirmModalOpen(false);
    setHasUnsavedChanges(false);
    setToastMessage('Collection plan saved successfully.');
  };

  const selectedBins = priorityBins.filter((b) => b.isSelectedForPlan || b.isSelected);

  const totalSelectedWasteKg = selectedBins.reduce((sum, b) => sum + (b.estimatedWasteKg || ((b.estimatedWasteTons || 0) * 1000)), 0);
  const totalSelectedWasteTons = (totalSelectedWasteKg / 1000).toFixed(1);

  const handleNavigate = (tab: string) => {
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  if (!summary || !constraints) return null;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 max-w-md bg-slate-900 text-white p-4 rounded-xl shadow-2xl border border-slate-700 flex items-center justify-between space-x-3">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header */}
      <PlanningHeader
        date={planningDate}
        horizon={planningHorizon}
        hasUnsavedChanges={hasUnsavedChanges}
        onDateChange={setPlanningDate}
        onHorizonChange={setPlanningHorizon}
        onRefresh={handleRefresh}
        onSavePlan={() => setIsSaveConfirmModalOpen(true)}
        onGeneratePlan={() => setIsGenerateModalOpen(true)}
      />

      {/* 2. Operational Status Bar */}
      <PlanningStatusBar summary={summary} />

      {/* 3. Planning Workflow Pipeline Banner */}
      <PlanningWorkflowBanner currentStage={currentWorkflowStep} />

      {/* 4. KPI Cards Grid */}
      <PlanningKpiGrid summary={summary} />

      {/* 5. Demand Overview (Chart & Zone Demand Table) */}
      <DemandOverview />

      <ZoneDemandTable
        zones={zoneDemand}
        onSelectZone={(zone) => setSelectedZone(zone)}
      />

      {/* 6. Collection Priority & Bin Priority */}
      <CollectionPrioritySection
        bins={priorityBins}
        onSelectBin={(bin) => setSelectedBin(bin)}
        onToggleSelectBinForPlan={handleTogglePlanBin}
        onBulkAddToPlan={handleBulkAddToPlan}
      />

      {/* 7. Collection Plan Builder Workspace (3 columns) */}
      <CollectionPlanBuilder
        selectedBins={selectedBins}
        availableVehicles={vehicles}
        selectedVehicleIds={selectedVehicleIds}
        onToggleVehicleSelection={handleToggleVehicleSelection}
        onRemoveBinFromPlan={handleTogglePlanBin}
        onOpenGenerateModal={() => setIsGenerateModalOpen(true)}
      />

      {/* 8. Fleet Capacity & Driver Availability */}
      <div className="space-y-8">
        <FleetCapacitySection
          vehicles={vehicles}
          selectedVehicleIds={selectedVehicleIds}
          onToggleVehicleSelection={handleToggleVehicleSelection}
        />

        <DriverAvailabilitySection
          drivers={drivers}
          selectedDriverIds={selectedDriverIds}
          onToggleDriverSelection={handleToggleDriverSelection}
        />
      </div>

      {/* 9. Constraints & Collection Windows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PlanningConstraintsSection
          constraints={constraints}
          onUpdateConstraint={handleUpdateConstraint}
        />

        <CollectionWindowsSection
          windows={collectionWindows}
          selectedWindow={selectedWindow}
          onSelectWindow={setSelectedWindow}
        />
      </div>


      {/* 11. Generated Routes Section */}
      <GeneratedRoutesSection
        routes={generatedRoutes}
        onSelectRoute={(route) => setSelectedRoute(route)}
        onNavigate={handleNavigate}
      />

      {/* 12. Interactive Operational Planning Map Preview */}
      <PlanningMapPreview />

      {/* 13. Planning Issues & Conflicts */}
      <PlanningIssuesSection
        issues={issues}
        onResolveIssue={handleResolveIssue}
      />

      {/* 14. Recent Plans History */}
      <RecentPlansSection
        plans={recentPlans}
        onDeleteDraft={handleDeleteDraftPlan}
      />


      {/* Drawers */}
      <ZonePlanningDrawer
        zone={selectedZone}
        onClose={() => setSelectedZone(null)}
        onPrioritizeZone={(zoneName) => {
          setSelectedZone(null);
          setToastMessage(`Zone ${zoneName} prioritized in demand queue.`);
        }}
        onAddToPlan={(zoneName) => {
          setSelectedZone(null);
          const zoneBinIds = priorityBins.filter((b) => b.zone === zoneName).map((b) => b.binId);
          handleBulkAddToPlan(zoneBinIds);
        }}
        onNavigate={handleNavigate}
      />

      <BinPriorityDrawer
        bin={selectedBin}
        onClose={() => setSelectedBin(null)}
        onTogglePlanBin={(binId) => {
          handleTogglePlanBin(binId);
          setSelectedBin(null);
        }}
        onNavigate={handleNavigate}
      />

      <RoutePlanningDrawer
        route={selectedRoute}
        onClose={() => setSelectedRoute(null)}
        onNavigate={handleNavigate}
      />

      {/* Generate Plan Modal */}
      <GeneratePlanModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onPlanGenerated={handlePlanGenerated}
        totalBins={selectedBins.length}
        totalWasteTons={totalSelectedWasteTons}
        selectedVehiclesCount={selectedVehicleIds.length}
        selectedDriversCount={selectedDriverIds.length}
        horizon={planningHorizon}
        strategy={strategy}
      />

      {/* Save Plan Modal */}
      {isSaveConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Save Collection Plan?</h3>
            <div className="text-xs text-slate-600 space-y-1 font-mono">
              <p>Routes: 6</p>
              <p>Bins Covered: 34</p>
              <p>Expected Waste: 8.1 t</p>
              <p>Priority Coverage: 97%</p>
            </div>
            <div className="flex items-center justify-end space-x-3 pt-3">
              <button
                onClick={() => setIsSaveConfirmModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePlanConfirm}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 shadow transition"
              >
                Save Collection Plan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
