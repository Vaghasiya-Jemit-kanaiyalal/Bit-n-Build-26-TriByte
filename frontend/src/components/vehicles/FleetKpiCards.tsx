import React from 'react';
import { Truck, CheckCircle2, Play, Clock, Wrench } from 'lucide-react';
import type { VehicleItem } from '../../mock/vehicleData';

interface FleetKpiCardsProps {
  vehicles?: VehicleItem[];
  totalCount?: number;
  activeCount?: number;
  onRouteCount?: number;
  availableCount?: number;
  maintenanceCount?: number;
}

export const FleetKpiCards: React.FC<FleetKpiCardsProps> = ({
  vehicles,
  totalCount,
  activeCount,
  onRouteCount,
  availableCount,
  maintenanceCount,
}) => {
  const total = vehicles ? vehicles.length : (totalCount ?? 24);
  const active = vehicles
    ? vehicles.filter(v => v.status === 'Active' || v.status === 'On Route' || v.status === 'Available').length
    : (activeCount ?? 16);
  const onRoute = vehicles ? vehicles.filter(v => v.status === 'On Route').length : (onRouteCount ?? 11);
  const available = vehicles ? vehicles.filter(v => v.status === 'Available').length : (availableCount ?? 5);
  const maintenance = vehicles ? vehicles.filter(v => v.status === 'Maintenance').length : (maintenanceCount ?? 3);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-6">
      {/* Card 1: TOTAL VEHICLES */}
      <div className="bg-white rounded-md p-3.5 border border-[#e5e7eb] shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">
            TOTAL VEHICLES
          </span>
          <div className="p-1 bg-[#f3f4f6] rounded text-[#4b5563]">
            <Truck className="w-3.5 h-3.5 text-[#374151]" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-[#111827]">{total}</div>
          <span className="text-[11px] text-[#6b7280] font-medium">Registered fleet</span>
        </div>
      </div>

      {/* Card 2: ACTIVE */}
      <div className="bg-white rounded-md p-3.5 border border-[#e5e7eb] shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">
            ACTIVE
          </span>
          <div className="p-1 bg-emerald-50 rounded text-emerald-700 border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-[#111827]">{active}</div>
          <span className="text-[11px] text-emerald-700 font-semibold">Currently operational</span>
        </div>
      </div>

      {/* Card 3: ON ROUTE */}
      <div className="bg-white rounded-md p-3.5 border border-[#e5e7eb] shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">
            ON ROUTE
          </span>
          <div className="p-1 bg-[#738a62]/10 rounded text-[#738a62] border border-[#738a62]/20">
            <Play className="w-3.5 h-3.5 fill-[#738a62]" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-[#111827]">{onRoute}</div>
          <span className="text-[11px] text-[#738a62] font-semibold">Collecting waste</span>
        </div>
      </div>

      {/* Card 4: AVAILABLE */}
      <div className="bg-white rounded-md p-3.5 border border-[#e5e7eb] shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">
            AVAILABLE
          </span>
          <div className="p-1 bg-blue-50 rounded text-blue-700 border border-blue-100">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-[#111827]">{available}</div>
          <span className="text-[11px] text-blue-700 font-medium">Ready for assignment</span>
        </div>
      </div>

      {/* Card 5: MAINTENANCE */}
      <div className="bg-white rounded-md p-3.5 border border-[#e5e7eb] shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-[#6b7280] uppercase tracking-wider">
            MAINTENANCE
          </span>
          <div className="p-1 bg-amber-50 rounded text-amber-700 border border-amber-100">
            <Wrench className="w-3.5 h-3.5" />
          </div>
        </div>
        <div>
          <div className="text-xl font-bold text-[#111827]">{maintenance}</div>
          <span className="text-[11px] text-amber-700 font-medium">Currently unavailable</span>
        </div>
      </div>
    </div>
  );
};

export default FleetKpiCards;
