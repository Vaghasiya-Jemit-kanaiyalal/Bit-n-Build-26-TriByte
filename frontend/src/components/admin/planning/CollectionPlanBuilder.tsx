import React, { useState } from 'react';
import { Layers, ChevronDown, ChevronRight, Trash2, Truck, AlertTriangle, Zap } from 'lucide-react';
import type { PriorityBin, PlanningVehicle } from '../../../types/planning';

interface CollectionPlanBuilderProps {
  selectedBins: PriorityBin[];
  availableVehicles: PlanningVehicle[];
  selectedVehicleIds: string[];
  onToggleVehicleSelection: (vehicleId: string) => void;
  onRemoveBinFromPlan: (binId: string) => void;
  onOpenGenerateModal: () => void;
}

export const CollectionPlanBuilder: React.FC<CollectionPlanBuilderProps> = ({
  selectedBins,
  availableVehicles,
  selectedVehicleIds,
  onToggleVehicleSelection,
  onRemoveBinFromPlan,
  onOpenGenerateModal,
}) => {
  // Collapse state for zones
  const [collapsedZones, setCollapsedZones] = useState<Record<string, boolean>>({});

  const toggleZoneCollapse = (zoneName: string) => {
    setCollapsedZones((prev) => ({ ...prev, [zoneName]: !prev[zoneName] }));
  };

  // Group selected bins by zone
  const binsByZone = React.useMemo(() => {
    const map: Record<string, PriorityBin[]> = {};
    selectedBins.forEach((bin) => {
      if (!map[bin.zone]) map[bin.zone] = [];
      map[bin.zone].push(bin);
    });
    return map;
  }, [selectedBins]);

  // Plan summary metrics calculation
  const totalBinsCount = selectedBins.length;
  const totalWasteKg = selectedBins.reduce((sum, b) => sum + (b.estimatedWasteKg ?? ((b.estimatedWasteTons ?? 0) * 1000)), 0);
  const totalWasteTons = (totalWasteKg / 1000).toFixed(1);

  const selectedVehiclesList = availableVehicles.filter((v) => selectedVehicleIds.includes(v.vehicleId));
  const totalCapacityTons = selectedVehiclesList.reduce((sum, v) => sum + v.capacityTons, 0);
  
  const capacityUtilizationPct =
    totalCapacityTons > 0 ? Math.round(((totalWasteKg / 1000) / totalCapacityTons) * 100) : 0;

  const estimatedRoutesCount = Math.max(1, Math.ceil(totalBinsCount / 8));
  const coveragePct = Math.min(100, Math.round((totalBinsCount / 28) * 100)); // out of 28 priority bins total
  const conflictsCount = capacityUtilizationPct > 100 ? 1 : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
      
      {/* Workspace Title */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900">Collection Plan Workspace</h3>
          <p className="text-xs text-slate-500">
            Allocate fleet capacity to selected high-priority waste bins to build an executable collection schedule.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
            {totalBinsCount} Bins Selected
          </span>
        </div>
      </div>

      {/* 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: Selected Bins Grouped by Zone */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
                <Layers className="w-4 h-4 mr-1 text-emerald-700" />
                Selected Bins ({totalBinsCount})
              </h4>
              <span className="text-xs font-mono font-bold text-slate-900">{totalWasteTons} tons</span>
            </div>

            {Object.keys(binsByZone).length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No bins selected for collection yet. Select bins from the Collection Priority table.
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {Object.entries(binsByZone).map(([zoneName, zoneBins]) => {
                  const zoneWasteKg = zoneBins.reduce((s, b) => s + (b.estimatedWasteKg ?? ((b.estimatedWasteTons ?? 0) * 1000)), 0);
                  const zoneWasteTons = (zoneWasteKg / 1000).toFixed(1);
                  const isCollapsed = collapsedZones[zoneName];

                  return (
                    <div key={zoneName} className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                      {/* Zone Header */}
                      <button
                        onClick={() => toggleZoneCollapse(zoneName)}
                        className="w-full flex items-center justify-between p-2.5 bg-slate-100 hover:bg-slate-200/70 text-xs font-bold text-slate-800 transition"
                      >
                        <div className="flex items-center space-x-1.5">
                          {isCollapsed ? <ChevronRight className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                          <span>{zoneName} Zone</span>
                          <span className="text-slate-500 font-normal">({zoneBins.length} bins)</span>
                        </div>
                        <span className="font-mono text-emerald-800">{zoneWasteTons} t</span>
                      </button>

                      {/* Bin Rows */}
                      {!isCollapsed && (
                        <div className="divide-y divide-slate-100 p-1">
                          {zoneBins.map((bin) => {
                            const fill = bin.fillLevelPct ?? bin.fillLevel ?? 0;
                            const wasteKg = bin.estimatedWasteKg ?? ((bin.estimatedWasteTons ?? 0) * 1000);

                            return (
                              <div key={bin.binId} className="flex items-center justify-between p-2 text-xs hover:bg-slate-50">
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold font-mono text-emerald-800">{bin.binId}</span>
                                  <span className="text-[10px] text-slate-500 font-mono">({fill}%)</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono text-slate-700">{wasteKg} kg</span>
                                  <button
                                    onClick={() => onRemoveBinFromPlan(bin.binId)}
                                    className="text-slate-400 hover:text-red-600 p-0.5"
                                    title="Remove from plan"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CENTER: Vehicle Allocation */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center">
              <Truck className="w-4 h-4 mr-1 text-emerald-700" />
              Vehicle Allocation
            </h4>
            <span className="text-xs font-semibold text-slate-500">
              {selectedVehicleIds.length} Selected
            </span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {availableVehicles.map((vehicle) => {
              const isSelected = selectedVehicleIds.includes(vehicle.vehicleId);
              const typeLabel = vehicle.vehicleType || vehicle.type || vehicle.model || 'Compactor';

              return (
                <div
                  key={vehicle.vehicleId}
                  onClick={() => onToggleVehicleSelection(vehicle.vehicleId)}
                  className={`p-3 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-bold font-mono text-slate-900 text-sm">{vehicle.vehicleId}</span>
                      <span className="text-xs text-slate-500">({typeLabel})</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                      vehicle.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                      vehicle.status === 'LIMITED CAPACITY' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {vehicle.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs font-mono pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Capacity</span>
                      <span className="font-bold text-slate-800">{vehicle.capacityTons} t</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Current Load</span>
                      <span className="text-slate-700">{vehicle.currentLoadTons} t</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-sans">Available</span>
                      <span className="font-bold text-emerald-700">{vehicle.availableCapacityTons} t</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Plan Summary */}
        <div className="bg-slate-900 text-white rounded-xl p-5 flex flex-col justify-between shadow-md">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center">
                <Zap className="w-4 h-4 mr-1 text-emerald-400" />
                Plan Summary
              </h4>
              <span className="text-xs text-slate-400 font-mono">Live Calculations</span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Selected Bins:</span>
                <span className="font-bold font-mono text-white">{totalBinsCount}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Estimated Waste:</span>
                <span className="font-bold font-mono text-emerald-400">{totalWasteTons} tons</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Allocated Fleet Capacity:</span>
                <span className="font-bold font-mono text-white">{totalCapacityTons} tons</span>
              </div>

              {/* Progress Utilization */}
              <div className="py-2 border-b border-slate-800 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Capacity Utilization:</span>
                  <span className={`font-mono font-bold ${capacityUtilizationPct > 100 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {capacityUtilizationPct}%
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${capacityUtilizationPct > 100 ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, capacityUtilizationPct)}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Estimated Routes:</span>
                <span className="font-bold font-mono text-white">{estimatedRoutesCount}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Priority Coverage:</span>
                <span className="font-bold font-mono text-white">{coveragePct}%</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span className="text-slate-400">Planning Conflicts:</span>
                <span className={`font-bold font-mono ${conflictsCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {conflictsCount}
                </span>
              </div>
            </div>

            {conflictsCount > 0 && (
              <div className="mt-4 p-2.5 bg-red-900/30 border border-red-700/50 rounded-lg flex items-center space-x-2 text-[11px] text-red-300">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>Selected waste exceeds allocated fleet capacity by {(parseFloat(totalWasteTons) - totalCapacityTons).toFixed(1)} t.</span>
              </div>
            )}
          </div>

          <button
            onClick={onOpenGenerateModal}
            disabled={totalBinsCount === 0}
            className="w-full mt-6 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center space-x-2"
          >
            <Zap className="w-4 h-4 text-white" />
            <span>Generate Optimized Plan</span>
          </button>
        </div>

      </div>

    </div>
  );
};
