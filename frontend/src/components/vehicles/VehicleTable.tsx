import React, { useState, useMemo } from 'react';
import { Eye, Edit2, UserCheck, Wrench, MoreVertical, ArrowUpDown, ChevronLeft, ChevronRight, Route as RouteIcon, Plus } from 'lucide-react';
import type { VehicleItem } from '../../mock/vehicleData';
import { VehicleStatusBadge } from './VehicleStatusBadge';
import { LoadProgress } from './LoadProgress';

interface VehicleTableProps {
  vehicles: VehicleItem[];
  onViewVehicle?: (vehicle: VehicleItem) => void;
  onViewDetails?: (vehicle: VehicleItem) => void;
  onSelectVehicle?: (vehicle: VehicleItem) => void;
  onEditVehicle: (vehicle: VehicleItem) => void;
  onAssignVehicle?: (vehicle: VehicleItem) => void;
  onAssignRoute?: (vehicle: VehicleItem) => void;
  onViewMaintenance: (vehicle: VehicleItem) => void;
  onNavigateToRoute?: (routeId: string) => void;
  onQuickStatusChange?: (vehicleId: string, newStatus: VehicleItem['status']) => void;
  onMarkStatus?: (vehicle: VehicleItem, newStatus: VehicleItem['status']) => void;
  onAddVehicleClick?: () => void;
  onAddVehicle?: () => void;
}

type SortField = 'id' | 'capacityKg' | 'currentLoadKg' | 'driverName' | 'assignedRouteId' | 'status' | 'maintenanceStatus';

export const VehicleTable: React.FC<VehicleTableProps> = ({
  vehicles,
  onViewVehicle,
  onViewDetails,
  onSelectVehicle,
  onEditVehicle,
  onAssignVehicle,
  onAssignRoute,
  onViewMaintenance,
  onNavigateToRoute,
  onQuickStatusChange,
  onMarkStatus,
  onAddVehicleClick,
  onAddVehicle,
}) => {
  const handleView = onViewDetails || onViewVehicle || onSelectVehicle || (() => {});
  const handleAssign = onAssignVehicle || onAssignRoute || (() => {});
  const handleAdd = onAddVehicleClick || onAddVehicle || (() => {});

  const [sortField, setSortField] = useState<SortField>('id');
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const itemsPerPage = 8;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedVehicles = useMemo(() => {
    return [...vehicles].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [vehicles, sortField, sortAsc]);

  const totalPages = Math.ceil(sortedVehicles.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedVehicles = sortedVehicles.slice(startIndex, startIndex + itemsPerPage);

  const handleStatusUpdate = (veh: VehicleItem, newStatus: VehicleItem['status']) => {
    if (onMarkStatus) {
      onMarkStatus(veh, newStatus);
    } else if (onQuickStatusChange) {
      onQuickStatusChange(veh.id, newStatus);
    }
  };

  return (
    <div className="bg-white rounded-md border border-[#e5e7eb] shadow-xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-[#e5e7eb] flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#111827] uppercase tracking-wider m-0">
            Vehicle Fleet ({vehicles.length})
          </h2>
          <span className="text-[11px] text-[#6b7280]">
            Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, sortedVehicles.length)} of {sortedVehicles.length} registered vehicles
          </span>
        </div>
      </div>

      {sortedVehicles.length === 0 ? (
        <div className="p-12 text-center text-[#6b7280] space-y-3">
          <p className="text-sm font-semibold">No vehicles match your current search or filter criteria.</p>
          <button
            onClick={handleAdd}
            className="px-3.5 py-1.5 bg-[#738a62] text-white rounded text-xs font-bold hover:bg-[#5f7350] transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vehicle</span>
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f9fafb] border-b border-[#e5e7eb] text-[#6b7280] font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 cursor-pointer hover:bg-[#f3f4f6]" onClick={() => handleSort('id')}>
                  <div className="flex items-center gap-1">
                    <span>Vehicle</span>
                    <ArrowUpDown className="w-3 h-3 text-[#9ca3af]" />
                  </div>
                </th>

                <th className="py-3 px-4">Type</th>

                <th className="py-3 px-4 cursor-pointer hover:bg-[#f3f4f6]" onClick={() => handleSort('capacityKg')}>
                  <div className="flex items-center gap-1">
                    <span>Capacity</span>
                    <ArrowUpDown className="w-3 h-3 text-[#9ca3af]" />
                  </div>
                </th>

                <th className="py-3 px-4 cursor-pointer hover:bg-[#f3f4f6]" onClick={() => handleSort('currentLoadKg')}>
                  <div className="flex items-center gap-1">
                    <span>Current Load</span>
                    <ArrowUpDown className="w-3 h-3 text-[#9ca3af]" />
                  </div>
                </th>

                <th className="py-3 px-4 cursor-pointer hover:bg-[#f3f4f6]" onClick={() => handleSort('driverName')}>
                  <div className="flex items-center gap-1">
                    <span>Driver</span>
                    <ArrowUpDown className="w-3 h-3 text-[#9ca3af]" />
                  </div>
                </th>

                <th className="py-3 px-4 cursor-pointer hover:bg-[#f3f4f6]" onClick={() => handleSort('assignedRouteId')}>
                  <div className="flex items-center gap-1">
                    <span>Assigned Route</span>
                    <ArrowUpDown className="w-3 h-3 text-[#9ca3af]" />
                  </div>
                </th>

                <th className="py-3 px-4">Location</th>

                <th className="py-3 px-4 cursor-pointer hover:bg-[#f3f4f6]" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-[#9ca3af]" />
                  </div>
                </th>

                <th className="py-3 px-4 cursor-pointer hover:bg-[#f3f4f6]" onClick={() => handleSort('maintenanceStatus')}>
                  <div className="flex items-center gap-1">
                    <span>Maintenance</span>
                    <ArrowUpDown className="w-3 h-3 text-[#9ca3af]" />
                  </div>
                </th>

                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e5e7eb] text-[#374151]">
              {paginatedVehicles.map((veh) => (
                <tr
                  key={veh.id}
                  className="hover:bg-[#f9fafb] transition-colors group cursor-pointer"
                  onClick={() => handleView(veh)}
                >
                  {/* Vehicle ID & Name */}
                  <td className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="font-mono font-bold text-[#111827] group-hover:text-[#738a62]">
                        {veh.id}
                      </span>
                      <span className="text-[11px] text-[#6b7280]">{veh.name}</span>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-3 px-4 text-[11px] font-medium text-[#4b5563]">
                    {veh.type}
                  </td>

                  {/* Capacity */}
                  <td className="py-3 px-4 font-mono font-medium text-[#111827]">
                    {veh.capacityKg} kg
                  </td>

                  {/* Current Load Progress */}
                  <td className="py-3 px-4 min-w-[140px]" onClick={(e) => e.stopPropagation()}>
                    <LoadProgress currentLoadKg={veh.currentLoadKg} capacityKg={veh.capacityKg} />
                  </td>

                  {/* Driver */}
                  <td className="py-3 px-4 font-medium text-[#111827]">
                    {veh.driverName !== 'Unassigned' ? (
                      <span>{veh.driverName}</span>
                    ) : (
                      <span className="text-[#9ca3af] italic">Unassigned</span>
                    )}
                  </td>

                  {/* Route */}
                  <td className="py-3 px-4 font-mono font-semibold text-[#738a62]" onClick={(e) => e.stopPropagation()}>
                    {veh.assignedRouteId && veh.assignedRouteId !== '—' ? (
                      <button
                        onClick={() => onNavigateToRoute && onNavigateToRoute(veh.assignedRouteId)}
                        className="hover:underline flex items-center gap-1 text-[#738a62] cursor-pointer border-none bg-transparent p-0"
                      >
                        <RouteIcon className="w-3 h-3" />
                        <span>{veh.assignedRouteId}</span>
                      </button>
                    ) : (
                      <span className="text-[#9ca3af] font-normal italic">—</span>
                    )}
                  </td>

                  {/* Location Zone */}
                  <td className="py-3 px-4 text-[11px] text-[#4b5563]">
                    {veh.zone} Zone
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4">
                    <VehicleStatusBadge status={veh.status} />
                  </td>

                  {/* Maintenance Status */}
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        veh.maintenanceStatus === 'Overdue'
                          ? 'bg-red-100 text-red-800'
                          : veh.maintenanceStatus === 'Due'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[#f3f4f6] text-[#4b5563]'
                      }`}
                    >
                      {veh.maintenanceStatus}
                    </span>
                  </td>

                  {/* Row Actions Menu */}
                  <td className="py-3 px-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-block text-left">
                      <button
                        onClick={() => setActiveMenuId(activeMenuId === veh.id ? null : veh.id)}
                        className="p-1 text-[#6b7280] hover:text-[#111827] rounded hover:bg-[#f3f4f6] cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === veh.id && (
                        <div className="origin-top-right absolute right-0 mt-1 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-30 divide-y divide-[#f3f4f6] text-xs">
                          <div className="py-1">
                            <button
                              onClick={() => {
                                handleView(veh);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-4 py-1.5 text-[#374151] hover:bg-[#f9fafb] flex items-center gap-2"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#6b7280]" />
                              <span>View Details</span>
                            </button>
                            <button
                              onClick={() => {
                                onEditVehicle(veh);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-4 py-1.5 text-[#374151] hover:bg-[#f9fafb] flex items-center gap-2"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-[#6b7280]" />
                              <span>Edit Vehicle</span>
                            </button>
                            <button
                              onClick={() => {
                                handleAssign(veh);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-4 py-1.5 text-[#374151] hover:bg-[#f9fafb] flex items-center gap-2"
                            >
                              <UserCheck className="w-3.5 h-3.5 text-[#6b7280]" />
                              <span>Assign Route / Driver</span>
                            </button>
                            <button
                              onClick={() => {
                                onViewMaintenance(veh);
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-4 py-1.5 text-[#374151] hover:bg-[#f9fafb] flex items-center gap-2"
                            >
                              <Wrench className="w-3.5 h-3.5 text-[#6b7280]" />
                              <span>View Maintenance</span>
                            </button>
                          </div>

                          <div className="py-1">
                            <button
                              onClick={() => {
                                handleStatusUpdate(veh, 'Available');
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-4 py-1.5 text-emerald-700 hover:bg-emerald-50"
                            >
                              Mark Available
                            </button>
                            <button
                              onClick={() => {
                                handleStatusUpdate(veh, 'Maintenance');
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-4 py-1.5 text-amber-700 hover:bg-amber-50"
                            >
                              Mark Maintenance
                            </button>
                            <button
                              onClick={() => {
                                handleStatusUpdate(veh, 'Offline');
                                setActiveMenuId(null);
                              }}
                              className="w-full text-left px-4 py-1.5 text-red-700 hover:bg-red-50"
                            >
                              Deactivate (Offline)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-[#e5e7eb] bg-[#f9fafb] flex items-center justify-between text-xs">
          <span className="text-[#6b7280]">
            Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-[#d1d5db] bg-white text-[#374151] hover:bg-[#f3f4f6] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Prev</span>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-2.5 py-1 rounded border text-xs font-bold cursor-pointer ${
                  currentPage === page
                    ? 'bg-[#738a62] text-white border-[#738a62]'
                    : 'bg-white text-[#374151] border-[#d1d5db] hover:bg-[#f3f4f6]'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 rounded border border-[#d1d5db] bg-white text-[#374151] hover:bg-[#f3f4f6] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleTable;
