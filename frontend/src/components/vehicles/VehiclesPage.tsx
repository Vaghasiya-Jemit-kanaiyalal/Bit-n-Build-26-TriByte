import React, { useState, useMemo } from 'react';
import { initialVehicles, initialVehicleAttentionItems, type VehicleItem } from '../../mock/vehicleData';
import { VehiclesHeader } from './VehiclesHeader';
import { FleetKpiCards } from './FleetKpiCards';
import { FleetStatusOverview } from './FleetStatusOverview';
import { VehicleAttentionPanel } from './VehicleAttentionPanel';
import { VehicleFilters } from './VehicleFilters';
import { VehicleTable } from './VehicleTable';
import FleetAnalytics from './FleetAnalytics';
import VehicleDetailsDrawer from './VehicleDetailsDrawer';
import AddVehicleModal from './AddVehicleModal';
import EditVehicleModal from './EditVehicleModal';
import AssignVehicleModal from './AssignVehicleModal';
import MaintenanceHistoryModal from './MaintenanceHistoryModal';
import { CheckCircle } from 'lucide-react';

interface VehiclesPageProps {
  onNavigateToRoute?: (routeId: string) => void;
}

const VehiclesPage: React.FC<VehiclesPageProps> = ({ onNavigateToRoute }) => {
  // State
  const [vehicles, setVehicles] = useState<VehicleItem[]>(initialVehicles);
  const [attentionItems] = useState(initialVehicleAttentionItems);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [zoneFilter, setZoneFilter] = useState('All');
  const [capacityFilter, setCapacityFilter] = useState('All');

  // UI Drawer & Modal State
  const [drawerVehicle, setDrawerVehicle] = useState<VehicleItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [editVehicle, setEditVehicle] = useState<VehicleItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [assignVehicle, setAssignVehicle] = useState<VehicleItem | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const [maintVehicle, setMaintVehicle] = useState<VehicleItem | null>(null);
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Filter logic
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          v.id.toLowerCase().includes(q) ||
          v.name.toLowerCase().includes(q) ||
          v.driverName.toLowerCase().includes(q) ||
          v.assignedRouteId.toLowerCase().includes(q) ||
          v.registration.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Status
      if (statusFilter !== 'All' && v.status !== statusFilter) {
        return false;
      }

      // Type
      if (typeFilter !== 'All' && v.type !== typeFilter) {
        return false;
      }

      // Zone
      if (zoneFilter !== 'All' && v.zone !== zoneFilter) {
        return false;
      }

      // Capacity
      if (capacityFilter !== 'All') {
        if (capacityFilter === 'Small' && v.capacityKg >= 800) return false;
        if (capacityFilter === 'Medium' && (v.capacityKg < 800 || v.capacityKg > 1200)) return false;
        if (capacityFilter === 'Large' && v.capacityKg <= 1200) return false;
      }

      return true;
    });
  }, [vehicles, searchQuery, statusFilter, typeFilter, zoneFilter, capacityFilter]);

  // Handlers
  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setTypeFilter('All');
    setZoneFilter('All');
    setCapacityFilter('All');
  };

  const handleOpenDrawer = (v: VehicleItem) => {
    setDrawerVehicle(v);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleAddVehicle = (newVeh: Partial<VehicleItem>) => {
    const fullVeh: VehicleItem = {
      id: newVeh.id || `VEH-0${vehicles.length + 1}`,
      name: newVeh.name || 'New Vehicle',
      type: newVeh.type || 'Compactor',
      registration: newVeh.registration || 'GJ-01-XX-0000',
      capacityKg: newVeh.capacityKg || 1000,
      currentLoadKg: newVeh.currentLoadKg || 0,
      driverName: newVeh.driverName || 'Unassigned',
      assignedRouteId: newVeh.assignedRouteId || '—',
      zone: newVeh.zone || 'North',
      status: newVeh.status || 'Available',
      energyType: newVeh.energyType || 'Diesel',
      maintenanceStatus: 'Good',
      lastService: '15 Sep 2026',
      nextService: '15 Oct 2026',
      coordinates: '22.3072, 73.1812',
      loadType: 'Mixed Waste',
      routeProgressStops: '0 / 12 stops',
      collectionProgressPercent: 0,
      estimatedCompletion: 'N/A',
      history: newVeh.history || [],
      maintenanceHistory: []
    };

    setVehicles(prev => [fullVeh, ...prev]);
    showToast(`Vehicle ${fullVeh.id} added successfully.`);
  };

  const handleOpenEditModal = (v: VehicleItem) => {
    setEditVehicle(v);
    setIsEditModalOpen(true);
  };

  const handleSaveEditVehicle = (updatedVeh: VehicleItem) => {
    setVehicles(prev => prev.map(v => (v.id === updatedVeh.id ? updatedVeh : v)));
    if (drawerVehicle?.id === updatedVeh.id) {
      setDrawerVehicle(updatedVeh);
    }
    showToast(`Vehicle ${updatedVeh.id} updated successfully.`);
  };

  const handleOpenAssignModal = (v?: VehicleItem) => {
    setAssignVehicle(v || null);
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = (
    vehicleId: string,
    driver: string,
    route: string,
    zone: string,
    startTime: string,
    endTime: string
  ) => {
    setVehicles(prev =>
      prev.map(v => {
        if (v.id === vehicleId) {
          const updated: VehicleItem = {
            ...v,
            driverName: driver,
            assignedRouteId: route,
            zone,
            status: 'On Route',
            estimatedCompletion: endTime,
            history: [
              {
                time: 'Just now',
                description: `Assigned to driver ${driver} on route ${route} (${startTime} - ${endTime})`
              },
              ...(v.history || [])
            ]
          };
          if (drawerVehicle?.id === vehicleId) setDrawerVehicle(updated);
          return updated;
        }
        return v;
      })
    );
    showToast(`Vehicle ${vehicleId} assigned to ${driver} on route ${route} successfully.`);
  };

  const handleOpenMaintenanceModal = (v: VehicleItem) => {
    setMaintVehicle(v);
    setIsMaintModalOpen(true);
  };

  const handleMarkStatus = (v: VehicleItem, newStatus: VehicleItem['status']) => {
    setVehicles(prev =>
      prev.map(item => {
        if (item.id === v.id) {
          const updated = {
            ...item,
            status: newStatus
          };
          if (drawerVehicle?.id === item.id) setDrawerVehicle(updated);
          return updated;
        }
        return item;
      })
    );
    showToast(`Vehicle ${v.id} marked as ${newStatus}.`);
  };



  return (
    <div className="min-h-screen bg-[#fcfcfd] text-slate-900 pb-16">
      
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-800 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle className="w-5 h-5 text-[#88a573]" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Page Header */}
        <VehiclesHeader
          onAddVehicleClick={handleOpenAddModal}
          onAssignVehicleClick={() => handleOpenAssignModal()}
          onRefreshClick={() => showToast('Fleet status refreshed.')}
        />

        {/* Fleet KPI Cards */}
        <FleetKpiCards vehicles={vehicles} />

        {/* Fleet Status Distribution & Requires Attention Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FleetStatusOverview vehicles={vehicles} />
          </div>
          <div>
            <VehicleAttentionPanel
              attentionItems={attentionItems}
              onSelectVehicle={(vehId) => {
                const found = vehicles.find(v => v.id === vehId);
                if (found) handleOpenDrawer(found);
              }}
              onSelectMaintenance={(vehId) => {
                const found = vehicles.find(v => v.id === vehId);
                if (found) handleOpenMaintenanceModal(found);
              }}
              onSelectRoute={(routeId) => {
                if (onNavigateToRoute) onNavigateToRoute(routeId);
              }}
            />
          </div>
        </div>

        {/* Vehicle Filters Toolbar */}
        <VehicleFilters
          searchTerm={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeChange={setTypeFilter}
          zoneFilter={zoneFilter}
          onZoneChange={setZoneFilter}
          capacityFilter={capacityFilter}
          onCapacityChange={setCapacityFilter}
          onClearFilters={handleClearFilters}
          filteredCount={filteredVehicles.length}
          totalCount={vehicles.length}
        />

        {/* Main Vehicle Fleet Table */}
        <VehicleTable
          vehicles={filteredVehicles}
          onSelectVehicle={handleOpenDrawer}
          onEditVehicle={handleOpenEditModal}
          onAssignVehicle={(v) => handleOpenAssignModal(v)}
          onViewMaintenance={handleOpenMaintenanceModal}
          onMarkStatus={handleMarkStatus}
          onAddVehicleClick={handleOpenAddModal}
        />

        {/* Fleet Utilization & Capacity Analytics Section */}
        <FleetAnalytics vehicles={vehicles} />

      </div>

      {/* Slide-over Vehicle Details Drawer */}
      <VehicleDetailsDrawer
        vehicle={drawerVehicle}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onEdit={handleOpenEditModal}
        onAssign={(v) => handleOpenAssignModal(v)}
        onViewMaintenance={handleOpenMaintenanceModal}
        onNavigateToRoute={onNavigateToRoute}
      />

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddVehicle}
      />

      {/* Edit Vehicle Modal */}
      <EditVehicleModal
        vehicle={editVehicle}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEditVehicle}
      />

      {/* Assign Vehicle Modal */}
      <AssignVehicleModal
        vehicle={assignVehicle}
        allVehicles={vehicles}
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onAssignConfirm={handleConfirmAssign}
      />

      {/* Maintenance History Modal */}
      <MaintenanceHistoryModal
        vehicle={maintVehicle}
        isOpen={isMaintModalOpen}
        onClose={() => setIsMaintModalOpen(false)}
      />

    </div>
  );
};

export default VehiclesPage;
