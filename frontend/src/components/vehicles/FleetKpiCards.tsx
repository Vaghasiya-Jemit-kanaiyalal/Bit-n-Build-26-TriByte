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
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full">
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight max-w-[calc(100%-2rem)] truncate">
            Total Vehicles
          </span>
          <div className="p-1.5 bg-slate-100 rounded-lg text-slate-700 shrink-0">
            <Truck className="w-3.5 h-3.5 text-slate-600" />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-end flex-1">
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">{total}</span>
          <span className="text-[10px] font-semibold text-slate-500 mt-1 leading-tight block">Registered fleet</span>
        </div>
      </div>

      {/* Card 2: ACTIVE */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full">
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight max-w-[calc(100%-2rem)] truncate">
            Active
          </span>
          <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-100 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-end flex-1">
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">{active}</span>
          <span className="text-[10px] font-semibold text-emerald-700 mt-1 leading-tight block">Currently operational</span>
        </div>
      </div>

      {/* Card 3: ON ROUTE */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full">
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight max-w-[calc(100%-2rem)] truncate">
            On Route
          </span>
          <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-700 border border-emerald-100 shrink-0">
            <Play className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-end flex-1">
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">{onRoute}</span>
          <span className="text-[10px] font-semibold text-emerald-700 mt-1 leading-tight block">Collecting waste</span>
        </div>
      </div>

      {/* Card 4: AVAILABLE */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full">
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight max-w-[calc(100%-2rem)] truncate">
            Available
          </span>
          <div className="p-1.5 bg-blue-50 rounded-lg text-blue-700 border border-blue-100 shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-end flex-1">
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">{available}</span>
          <span className="text-[10px] font-semibold text-blue-700 mt-1 leading-tight block">Ready for dispatch</span>
        </div>
      </div>

      {/* Card 5: MAINTENANCE */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200/80 shadow-2xs flex flex-col justify-between h-full">
        <div className="flex items-start justify-between gap-1.5">
          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider leading-tight max-w-[calc(100%-2rem)] truncate">
            Maintenance
          </span>
          <div className="p-1.5 bg-amber-50 rounded-lg text-amber-700 border border-amber-100 shrink-0">
            <Wrench className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="mt-2 flex flex-col justify-end flex-1">
          <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono leading-none">{maintenance}</span>
          <span className="text-[10px] font-semibold text-amber-700 mt-1 leading-tight block">Unavailable</span>
        </div>
      </div>
    </div>
  );
};

export default FleetKpiCards;
