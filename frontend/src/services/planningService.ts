import {
  initialPlanningSummaryMock,
  zoneDemandMockData,
  priorityBinsMockData,
  planningVehiclesMockData,
  planningDriversMockData,
  initialConstraintsMockData,
  collectionWindowsMockData,
  optimizationPreviewMockData,
  generatedRoutesMockData,
  planningIssuesMockData,
  recentPlansMockData,
  aiPlanningInsightsMockData
} from '../mock/adminPlanningMock';

import type {
  PlanningSummary,
  ZoneDemand,
  PriorityBin,
  PlanningVehicle,
  PlanningDriver,
  PlanningConstraint,
  CollectionWindow,
  OptimizationPreview,
  PlanningRoute,
  PlanningIssue,
  PlanningPlan,
  PlanningInsight,
  PlanningHorizonType
} from '../types/planning';

let currentSummary = { ...initialPlanningSummaryMock };
let currentPriorityBins = [...priorityBinsMockData];
let currentVehicles = [...planningVehiclesMockData];
let currentDrivers = [...planningDriversMockData];
let currentConstraints = { ...initialConstraintsMockData };
let currentRoutes = [...generatedRoutesMockData];
let currentRecentPlans = [...recentPlansMockData];

export const planningService = {
  getSummary: (_horizon: PlanningHorizonType = 'Next 24 Hours'): PlanningSummary => {
    return { ...currentSummary };
  },
  getPlanningSummary: (_horizon: PlanningHorizonType = 'Next 24 Hours'): PlanningSummary => {
    return { ...currentSummary };
  },

  getZoneDemand: (): ZoneDemand[] => {
    return [...zoneDemandMockData];
  },

  getPriorityBins: (): PriorityBin[] => {
    return [...currentPriorityBins];
  },

  getVehicles: (): PlanningVehicle[] => {
    return [...currentVehicles];
  },
  getAvailableVehicles: (): PlanningVehicle[] => {
    return [...currentVehicles];
  },

  getDrivers: (): PlanningDriver[] => {
    return [...currentDrivers];
  },
  getAvailableDrivers: (): PlanningDriver[] => {
    return [...currentDrivers];
  },

  getConstraints: (): PlanningConstraint => {
    return { ...currentConstraints };
  },
  getPlanningConstraints: (): PlanningConstraint => {
    return { ...currentConstraints };
  },

  getCollectionWindows: (): CollectionWindow[] => {
    return [...collectionWindowsMockData];
  },

  getOptimizationPreview: (): OptimizationPreview => {
    return { ...optimizationPreviewMockData };
  },
  generatePlanningPreview: (): OptimizationPreview => {
    return { ...optimizationPreviewMockData };
  },

  getGeneratedRoutes: (): PlanningRoute[] => {
    return [...currentRoutes];
  },

  getIssues: (): PlanningIssue[] => {
    return [...planningIssuesMockData];
  },
  getPlanningIssues: (): PlanningIssue[] => {
    return [...planningIssuesMockData];
  },

  getRecentPlans: (): PlanningPlan[] => {
    return [...currentRecentPlans];
  },

  getAiInsights: (): PlanningInsight[] => {
    return [...aiPlanningInsightsMockData];
  },
  getPlanningInsights: (): PlanningInsight[] => {
    return [...aiPlanningInsightsMockData];
  },

  toggleBinSelection: (id: string): PriorityBin[] => {
    currentPriorityBins = currentPriorityBins.map(b =>
      b.id === id ? { ...b, isSelected: !b.isSelected, isSelectedForPlan: !b.isSelectedForPlan } : b
    );
    return [...currentPriorityBins];
  },

  selectAllPriorityBins: (select: boolean): PriorityBin[] => {
    currentPriorityBins = currentPriorityBins.map(b => ({ ...b, isSelected: select, isSelectedForPlan: select }));
    return [...currentPriorityBins];
  },

  generatePlanSimulation: (): Promise<PlanningRoute[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        currentSummary.status = 'COMPLETED';
        currentSummary.planningCoveragePercent = 97;
        resolve([...currentRoutes]);
      }, 1200);
    });
  },

  savePlan: (): PlanningPlan => {
    const newPlan: PlanningPlan = {
      id: `rp-${Date.now()}`,
      planId: `PLN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: '19 Sep 2026',
      horizon: 'Today (Next 24h)',
      planningWindow: 'Today (Next 24h)',
      routesCount: currentRoutes.length,
      binsCount: 34,
      wasteTons: 8.1,
      vehiclesCount: 5,
      coveragePct: 97,
      coveragePercent: 97,
      status: 'READY',
      createdBy: 'Jemit Vaghasiya (Admin)',
    };
    currentRecentPlans = [newPlan, ...currentRecentPlans];
    return newPlan;
  }
};

export default planningService;
