import React from 'react';
import { Plus, UserCheck, Download, RefreshCw } from 'lucide-react';

interface VehiclesHeaderProps {
  onAddVehicleClick: () => void;
  onAssignVehicleClick: () => void;
  onRefreshClick: () => void;
  onExportClick?: () => void;
  isRefreshing?: boolean;
}

export const VehiclesHeader: React.FC<VehiclesHeaderProps> = ({
  onAddVehicleClick,
  onAssignVehicleClick,
  onRefreshClick,
  onExportClick,
  isRefreshing = false,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#e5e7eb]">
      {/* Left: Breadcrumb & Title */}
      <div>
        <div className="text-[10px] font-bold text-[#6b7280] tracking-wider uppercase mb-1">
          ADMIN / OPERATIONS / VEHICLES
        </div>
        <h1 className="text-xl font-extrabold text-[#111827] tracking-tight m-0">
          Vehicle Fleet
        </h1>
        <p className="text-xs text-[#6b7280] font-medium mt-0.5">
          Manage collection vehicles, assignments, capacity and operational status.
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onRefreshClick}
          disabled={isRefreshing}
          title="Refresh Fleet Telemetry"
          className="p-2 text-[#4b5563] hover:text-[#111827] bg-white border border-[#d1d5db] rounded-md shadow-xs hover:bg-[#f9fafb] cursor-pointer transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#738a62]' : ''}`} />
        </button>

        {onExportClick && (
          <button
            onClick={onExportClick}
            className="px-3.5 py-2 text-xs font-semibold text-[#374151] bg-white hover:bg-[#f9fafb] border border-[#d1d5db] rounded-md shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-[#6b7280]" />
            <span>Export</span>
          </button>
        )}

        <button
          onClick={onAssignVehicleClick}
          className="px-3.5 py-2 text-xs font-semibold text-[#374151] bg-white hover:bg-[#f9fafb] border border-[#d1d5db] rounded-md shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
        >
          <UserCheck className="w-3.5 h-3.5 text-[#738a62]" />
          <span>Assign Vehicle</span>
        </button>

        <button
          onClick={onAddVehicleClick}
          className="px-4 py-2 text-xs font-semibold text-white bg-[#738a62] hover:bg-[#5f7350] border border-transparent rounded-md shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vehicle</span>
        </button>
      </div>
    </div>
  );
};

export default VehiclesHeader;
