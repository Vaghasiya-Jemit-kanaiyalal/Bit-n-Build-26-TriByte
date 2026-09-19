import React, { useState } from 'react';
import { Sliders, ChevronDown, ChevronUp } from 'lucide-react';
import type { PlanningConstraint } from '../../../types/planning';

interface PlanningConstraintsSectionProps {
  constraints: PlanningConstraint;
  onUpdateConstraint: (key: keyof PlanningConstraint, value: boolean | number) => void;
}

export const PlanningConstraintsSection: React.FC<PlanningConstraintsSectionProps> = ({
  constraints,
  onUpdateConstraint,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const toggleSettingsList = [
    {
      key: 'vehicleCapacity' as const,
      label: 'Vehicle Capacity Limit Enforcement',
      desc: 'Prevents routing bins to a vehicle that would exceed its tonnage capacity.',
    },
    {
      key: 'driverAvailability' as const,
      label: 'Driver Shift Availability',
      desc: 'Ensures drivers are not assigned to multiple overlapping collection routes.',
    },
    {
      key: 'collectionTimeWindow' as const,
      label: 'Collection Time Window Enforcement',
      desc: 'Matches pickup times with localized municipal noise and traffic restrictions.',
    },
    {
      key: 'wasteTypeCompatibility' as const,
      label: 'Waste Type Compatibility',
      desc: 'Restricts hazmat or organic waste to dedicated compartment vehicles.',
    },
    {
      key: 'zoneRestrictions' as const,
      label: 'Zone Boundary Restrictions',
      desc: 'Prevents inter-zone vehicle mixing unless explicit cross-zone dispatch is permitted.',
    },
    {
      key: 'trafficConsideration' as const,
      label: 'Real-Time Traffic Congestion Avoidance',
      desc: 'Factoring historical rush hour traffic into route estimated travel duration.',
    },
    {
      key: 'duplicateBinAssignmentPrevention' as const,
      label: 'Duplicate Bin Assignment Prevention',
      desc: 'Ensures no single smart bin is placed onto two simultaneous collection plans.',
    },
    {
      key: 'preventUnavailableVehicleAssignment' as const,
      label: 'Prevent Maintenance Vehicle Assignment',
      desc: 'Blocks offline or maintenance fleet vehicles from route generator algorithms.',
    },
    {
      key: 'preventDriverConflicts' as const,
      label: 'Prevent Driver Duty Conflicts',
      desc: 'Blocks off-duty or maxed-out drivers from assignment.',
    },
    {
      key: 'allowManualOverride' as const,
      label: 'Allow Admin Manual Overrides',
      desc: 'Permits waste managers to force-save plans with soft operational warnings.',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      
      {/* Expandable Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 bg-slate-900 text-white flex items-center justify-between transition hover:bg-slate-800"
      >
        <div className="flex items-center space-x-3">
          <Sliders className="w-5 h-5 text-emerald-400" />
          <div className="text-left">
            <h3 className="text-xl font-bold tracking-tight text-white">Planning Constraints & Rules</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Configure algorithmic rules, capacity boundaries, shift durations, and override permissions.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono bg-slate-800 px-3 py-1 rounded-full text-emerald-400 border border-slate-700">
            10 Rules Active
          </span>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
        </div>
      </button>

      {/* Body */}
      {isExpanded && (
        <div className="p-6 space-y-6 bg-slate-50/50">
          
          {/* Numeric Rule Limits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-6 border-b border-slate-200">
            
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Max Route Duration</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={constraints.maxRouteDurationHours}
                  onChange={(e) => onUpdateConstraint('maxRouteDurationHours', Number(e.target.value))}
                  className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="text-xs font-medium text-slate-500">Hours</span>
              </div>
              <p className="text-[11px] text-slate-400">Maximum allowable shift length per driver route.</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Max Stops per Route</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={constraints.maxStopsPerRoute}
                  onChange={(e) => onUpdateConstraint('maxStopsPerRoute', Number(e.target.value))}
                  className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="text-xs font-medium text-slate-500">Stops</span>
              </div>
              <p className="text-[11px] text-slate-400">Upper threshold for total bin pickups per trip.</p>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Max Fleet Utilization</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={constraints.maxVehicleUtilizationPct ?? constraints.maxVehicleUtilizationPercent ?? 85}
                  onChange={(e) => onUpdateConstraint('maxVehicleUtilizationPct', Number(e.target.value))}
                  className="w-24 px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="text-xs font-medium text-slate-500">%</span>
              </div>
              <p className="text-[11px] text-slate-400">Safety margin percentage before flagging over-capacity.</p>
            </div>

          </div>

          {/* Toggle Switches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {toggleSettingsList.map((item) => {
              const value = Boolean(constraints[item.key as keyof PlanningConstraint]);

              return (
                <div key={item.key} className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-start justify-between space-x-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 block">{item.label}</span>
                    <p className="text-[11px] text-slate-500">{item.desc}</p>
                  </div>
                  
                  <button
                    onClick={() => onUpdateConstraint(item.key as keyof PlanningConstraint, !value)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      value ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        value ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
