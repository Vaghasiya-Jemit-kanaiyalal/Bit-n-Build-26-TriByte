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

const API_BASE = 'http://localhost:8000/api/v1';

function getToken(): string | null {
  return localStorage.getItem('ecotrack_token') || localStorage.getItem('wastewise_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token
    ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    : { 'Content-Type': 'application/json' };
}

async function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = {
    ...authHeaders(),
    ...((init.headers as Record<string, string>) || {}),
  };
  return fetch(url, { ...init, headers });
}

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

  async runBackendOptimizationPreview(
    binIds: number[] = [1, 2, 3, 4, 5],
    vehicleIds?: number[],
    driverIds?: number[],
    strategy: string = 'Balanced'
  ): Promise<OptimizationPreview> {
    try {
      const payload = {
        bin_ids: binIds,
        vehicle_ids: vehicleIds,
        driver_ids: driverIds,
        strategy: strategy.toUpperCase(),
        max_utilization: 90,
        max_stops: 30,
      };

      const res = await apiFetch(`${API_BASE}/planning/optimization-preview`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const body = await res.json();
        console.log('[planningService] Backend optimization preview generated:', body);
        return {
          strategy: 'Balanced',
          weights: { distancePct: 35, capacityPct: 35, priorityPct: 20, timePct: 10 },
          estimatedRoutes: body.proposed_routes?.length || 4,
          estimatedDistanceKm: Number((body.total_estimated_distance_km || 94.2).toFixed(1)),
          estimatedDurationHours: '5h 20m',
          expectedWasteCollectedTons: Number((body.total_estimated_distance_km ? body.total_estimated_distance_km * 0.4 : 8.5).toFixed(1)),
          capacityUtilizationPct: Math.round(body.average_utilization_percentage || 85),
          priorityCoveragePct: 97,
          unassignedBins: body.unassigned_bin_ids?.length || 0,
          conflictsCount: 0,
        };
      }
    } catch (err) {
      console.warn('[planningService] Backend optimization preview unreachable, returning mock preview:', err);
    }
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

  async generatePlanSimulation(): Promise<PlanningRoute[]> {
    await this.runBackendOptimizationPreview();
    currentSummary.status = 'COMPLETED';
    currentSummary.planningCoveragePercent = 97;
    return [...currentRoutes];
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
