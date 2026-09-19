import React, { useState } from 'react';
import { Play, Pause, CheckSquare, SkipForward, AlertCircle, RefreshCw, Truck, User, Clock, MapPin } from 'lucide-react';
import type { RouteItem } from '../../mock/routeData';

import { showWebsiteToast } from '../common/NotificationToast';

interface SelectedRoutePanelProps {
  route: RouteItem;
  onUpdateRouteStatus?: (status: RouteItem['status']) => void;
  onReportIssueClick?: () => void;
  onMarkStopComplete?: () => void;
}

export const SelectedRoutePanel: React.FC<SelectedRoutePanelProps> = ({
  route,
  onUpdateRouteStatus,
  onReportIssueClick,
  onMarkStopComplete,
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optToast, setOptToast] = useState('');

  const handleRecalculate = () => {
    setIsOptimizing(true);
    setOptToast('Optimizing route with real-time traffic & fill telemetry...');
    setTimeout(() => {
      setIsOptimizing(false);
      setOptToast('Route preview updated successfully.');
      setTimeout(() => setOptToast(''), 3000);
    }, 1200);
  };

  const progressPercent = Math.round((route.completedStops / route.totalStops) * 100);

  return (
    <div className="bg-white rounded-md border border-[#e5e7eb] shadow-xs p-4 flex flex-col justify-between h-full text-xs text-[#374151]">
      {/* Route Header Card */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-[#111827]">{route.id}</span>
            <span className="text-[11px] text-[#6b7280] font-medium">({route.name})</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
              route.status === 'In Progress'
                ? 'bg-[#738a62]/15 text-[#738a62] border border-[#738a62]/30'
                : route.status === 'Completed'
                ? 'bg-emerald-100 text-emerald-800'
                : route.status === 'At Risk'
                ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-800'
            }`}
          >
            {route.status}
          </span>
        </div>

        {/* Primary Route Attributes */}
        <div className="grid grid-cols-2 gap-2.5 py-3 border-y border-[#f3f4f6] my-3 bg-[#f9fafb] p-2.5 rounded">
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-[#6b7280]" />
            <div>
              <span className="text-[10px] text-[#6b7280] block">Vehicle</span>
              <span className="font-bold text-[#111827]">{route.vehicleId}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#6b7280]" />
            <div>
              <span className="text-[10px] text-[#6b7280] block">Driver</span>
              <span className="font-bold text-[#111827]">{route.driverName}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#6b7280]" />
            <div>
              <span className="text-[10px] text-[#6b7280] block">Zone</span>
              <span className="font-bold text-[#111827]">{route.zone}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#6b7280]" />
            <div>
              <span className="text-[10px] text-[#6b7280] block">Est. Completion</span>
              <span className="font-bold text-[#111827]">{route.estimatedCompletion}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
            <span>Stops Progress</span>
            <span className="text-[#738a62] font-bold">
              {route.completedStops} / {route.totalStops} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#738a62] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-[#6b7280] mt-1 font-medium">
            <span>Started: {route.startTime}</span>
            <span>Remaining: {route.totalStops - route.completedStops} stops</span>
          </div>
        </div>

        {/* ROUTE PERFORMANCE COMPACT ROWS */}
        <div className="mb-4">
          <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider block mb-2">
            ROUTE PERFORMANCE
          </span>
          <div className="space-y-1.5 divide-y divide-[#f3f4f6]">
            <div className="flex justify-between pt-1">
              <span className="text-[#6b7280]">Estimated Distance:</span>
              <span className="font-bold text-[#111827]">{route.totalDistanceKm} km</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-[#6b7280]">Estimated Time:</span>
              <span className="font-bold text-[#111827]">
                {Math.floor(route.estimatedTimeMin / 60)}h {route.estimatedTimeMin % 60}m
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-[#6b7280]">Current Load / Capacity:</span>
              <span className="font-bold text-[#111827]">{route.vehicleCapacityPercent}%</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-[#6b7280]">Remaining Capacity:</span>
              <span className="font-bold text-emerald-700">{100 - route.vehicleCapacityPercent}%</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-[#6b7280]">Priority Stops:</span>
              <span className="font-bold text-amber-700">{route.priorityStopsCount}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-[#6b7280]">Overflow-Risk Stops:</span>
              <span className="font-bold text-red-700">{route.overflowRiskStopsCount}</span>
            </div>
          </div>
        </div>

        {/* Toast alert message */}
        {optToast && (
          <div className="p-2 mb-3 bg-[#738a62]/10 border border-[#738a62]/30 rounded text-[11px] font-semibold text-[#5f7350] animate-pulse">
            {optToast}
          </div>
        )}
      </div>

      {/* ROUTE ACTIONS */}
      <div className="pt-3 border-t border-[#e5e7eb] flex flex-col gap-2">
        <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider block">
          OPERATIONAL ACTIONS
        </span>
        <div className="grid grid-cols-2 gap-2">
          {route.status === 'In Progress' ? (
            <button
              onClick={() => onUpdateRouteStatus && onUpdateRouteStatus('At Risk')}
              className="px-2.5 py-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded cursor-pointer flex items-center justify-center gap-1"
            >
              <Pause className="w-3 h-3" />
              <span>Pause Route</span>
            </button>
          ) : (
            <button
              onClick={() => onUpdateRouteStatus && onUpdateRouteStatus('In Progress')}
              className="px-2.5 py-1.5 text-[11px] font-semibold text-[#738a62] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded cursor-pointer flex items-center justify-center gap-1"
            >
              <Play className="w-3 h-3" />
              <span>Resume Route</span>
            </button>
          )}

          <button
            onClick={onMarkStopComplete}
            className="px-2.5 py-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded cursor-pointer flex items-center justify-center gap-1"
          >
            <CheckSquare className="w-3 h-3" />
            <span>Mark Complete</span>
          </button>

          <button
            onClick={() => showWebsiteToast('Skipped next scheduled stop (BIN-104). Notified dispatcher.', 'warning', 'Stop Skipped')}
            className="px-2.5 py-1.5 text-[11px] font-semibold text-[#4b5563] bg-[#f3f4f6] hover:bg-[#e5e7eb] border border-[#d1d5db] rounded cursor-pointer flex items-center justify-center gap-1"
          >
            <SkipForward className="w-3 h-3" />
            <span>Skip Stop</span>
          </button>

          <button
            onClick={onReportIssueClick}
            className="px-2.5 py-1.5 text-[11px] font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded cursor-pointer flex items-center justify-center gap-1"
          >
            <AlertCircle className="w-3 h-3" />
            <span>Report Issue</span>
          </button>
        </div>

        <button
          onClick={handleRecalculate}
          disabled={isOptimizing}
          className="w-full mt-1 px-3 py-2 text-xs font-semibold text-white bg-[#1f2937] hover:bg-[#111827] rounded shadow-xs cursor-pointer flex items-center justify-center gap-1.5 border-none disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
          <span>{isOptimizing ? 'Optimizing Route...' : 'Recalculate Preview'}</span>
        </button>
      </div>
    </div>
  );
};
