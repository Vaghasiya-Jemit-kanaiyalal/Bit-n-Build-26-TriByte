import React, { useState, useEffect, useCallback } from 'react';
import type { SmartBin, BinFilterState, BinSortState, ZoneName, CollectionHistoryLog } from '../../../types/bin';
import { binService } from '../../../services/binService';
import { BinHeader } from './BinHeader';
import { BinKpiGrid } from './BinKpiGrid';
import { BinFilterToolbar } from './BinFilterToolbar';
import { BinTable } from './BinTable';
import { BulkActionBar } from './BulkActionBar';
import { Pagination } from './Pagination';
import { BinDetailsDrawer } from './BinDetailsDrawer';
import { AddEditBinModal } from './AddEditBinModal';
import { ImportBinsModal } from './ImportBinsModal';
import { BinLocationDrawer } from './BinLocationDrawer';
import { CollectionHistoryDrawer } from './CollectionHistoryDrawer';
import { PrioritizeCollectionModal } from './PrioritizeCollectionModal';
import { DeactivateBinModal } from './DeactivateBinModal';

interface BinManagementProps {
  onNavigateTab?: (tabName: string) => void;
}

export const BinManagement: React.FC<BinManagementProps> = ({ onNavigateTab: _onNavigateTab }) => {
  // Data State
  const [bins, setBins] = useState<SmartBin[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [kpiSummary, setKpiSummary] = useState({
    totalBins: 248,
    activeBins: 236,
    activePercent: 95.2,
    needingCollection: 37,
    needingCollectionPercent: 15,
    criticalBins: 14,
    offlineBins: 12,
    maintenanceBins: 5,
    avgFillPercent: 68,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState('just now');

  // Filter & Sort State
  const [filters, setFilters] = useState<BinFilterState>({
    searchQuery: '',
    status: 'All',
    fillLevelRange: 'All',
    wasteType: 'All',
    zone: 'All',
    collectionStatus: 'All',
  });

  const [sort, setSort] = useState<BinSortState>({
    field: 'currentFillPercent',
    direction: 'desc',
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Drawers State
  const [activeDrawerBin, setActiveDrawerBin] = useState<SmartBin | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingBin, setEditingBin] = useState<SmartBin | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [locationDrawerBin, setLocationDrawerBin] = useState<SmartBin | null>(null);
  const [historyDrawerBin, setHistoryDrawerBin] = useState<SmartBin | null>(null);
  const [historyLogs, setHistoryLogs] = useState<CollectionHistoryLog[]>([]);
  const [prioritizeBin, setPrioritizeBin] = useState<SmartBin | null>(null);
  const [deactivateBinTarget, setDeactivateBinTarget] = useState<SmartBin | null>(null);

  // Notification Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load Bins from Service
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await binService.getBins(filters, sort);
      setBins(res.data);
      setTotalCount(res.totalCount);
      setKpiSummary(res.kpiSummary);
      setLastUpdated('just now');
    } catch (err) {
      console.error('Failed to load bins:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, sort]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Pagination Slice
  const paginatedBins = bins.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(bins.length / pageSize);

  // Filter Updates
  const handleFilterChange = (updates: Partial<BinFilterState>) => {
    setFilters((prev: BinFilterState) => ({ ...prev, ...updates }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      searchQuery: '',
      status: 'All',
      fillLevelRange: 'All',
      wasteType: 'All',
      zone: 'All',
      collectionStatus: 'All',
    });
    setCurrentPage(1);
  };

  // Selection Toggle
  const handleToggleSelectAll = () => {
    if (paginatedBins.every((b) => selectedIds.includes(b.id))) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedBins.map((b) => b.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Action Handlers
  const handleOpenAddModal = () => {
    setEditingBin(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (bin: SmartBin) => {
    setEditingBin(bin);
    setIsAddEditModalOpen(true);
  };

  const handleAddEditSubmit = async (data: Partial<SmartBin>) => {
    if (editingBin) {
      await binService.updateBin(editingBin.id, data);
      showToast(`Bin ${editingBin.id} updated successfully.`);
    } else {
      const newBin = await binService.createBin(data);
      showToast(`BIN ${newBin.id} added successfully to network.`);
    }
    loadData();
  };

  const handleDeactivateConfirm = async (bin: SmartBin) => {
    await binService.deactivateBin(bin.id);
    setDeactivateBinTarget(null);
    showToast(`BIN ${bin.id} has been deactivated.`);
    loadData();
  };

  const handlePrioritizeConfirm = async (bin: SmartBin) => {
    await binService.prioritizeBin(bin.id);
    setPrioritizeBin(null);
    showToast(`BIN ${bin.id} added to priority collection queue.`);
    loadData();
  };

  const handleViewHistory = async (bin: SmartBin) => {
    const logs = await binService.getBinHistory(bin.id);
    setHistoryLogs(logs);
    setHistoryDrawerBin(bin);
  };

  // Bulk Actions
  const handleBulkAssignZone = async (zone: ZoneName) => {
    const count = await binService.bulkAssignZone(selectedIds, zone);
    setSelectedIds([]);
    showToast(`Assigned ${count} bins to ${zone}.`);
    loadData();
  };

  const handleBulkAssignRoute = async (routeId: string) => {
    const count = await binService.bulkAssignRoute(selectedIds, routeId);
    setSelectedIds([]);
    showToast(`Assigned ${count} bins to route ${routeId}.`);
    loadData();
  };

  const handleBulkDeactivate = async () => {
    const count = await binService.bulkDeactivate(selectedIds);
    setSelectedIds([]);
    showToast(`Deactivated ${count} bins.`);
    loadData();
  };

  const handleExportCSV = () => {
    const csvData = binService.exportBinsCSV(bins);
    const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvData}`);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_bins_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${bins.length} bin records to CSV.`);
  };

  return (
    <div className="p-6 flex-1 flex flex-col gap-5 max-w-[1600px] w-full mx-auto animate-fadeIn relative">
      
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#064e3b] text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <BinHeader
        onAddBin={handleOpenAddModal}
        onImportBins={() => setIsImportModalOpen(true)}
        onRefresh={loadData}
        lastUpdatedText={lastUpdated}
      />

      {/* 2. KPI GRID */}
      <BinKpiGrid summary={kpiSummary} />


      {/* 5. SEARCH & FILTER TOOLBAR */}
      <BinFilterToolbar
        filters={filters}
        sort={sort}
        onFilterChange={handleFilterChange}
        onSortChange={setSort}
        onClearFilters={handleClearFilters}
        totalFiltered={bins.length}
        totalCount={totalCount}
        onExportCSV={handleExportCSV}
      />

      {/* 6. BULK ACTION BAR */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        onBulkAssignZone={handleBulkAssignZone}
        onBulkAssignRoute={handleBulkAssignRoute}
        onBulkDeactivate={handleBulkDeactivate}
        onBulkExport={handleExportCSV}
      />

      {/* 7. MAIN BIN DATA TABLE */}
      <BinTable
        bins={paginatedBins}
        selectedIds={selectedIds}
        onToggleSelectAll={handleToggleSelectAll}
        onToggleSelect={handleToggleSelect}
        sort={sort}
        onSortChange={setSort}
        onViewDetails={(bin) => setActiveDrawerBin(bin)}
        onEditBin={handleOpenEditModal}
        onViewLocation={(bin) => setLocationDrawerBin(bin)}
        onViewHistory={handleViewHistory}
        onPrioritize={(bin) => setPrioritizeBin(bin)}
        onDeactivate={(bin) => setDeactivateBinTarget(bin)}
        onClearFilters={handleClearFilters}
        isLoading={isLoading}
      />

      {/* 8. PAGINATION CONTROLS */}
      {bins.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={bins.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setCurrentPage(1);
          }}
        />
      )}

      {/* DRAWERS & MODALS */}
      {/* Drawer: Bin Details */}
      <BinDetailsDrawer
        bin={activeDrawerBin}
        onClose={() => setActiveDrawerBin(null)}
        onEditBin={handleOpenEditModal}
        onOpenMap={(bin) => setLocationDrawerBin(bin)}
        onOpenHistory={handleViewHistory}
        onAssignRoute={(bin) => {
          setActiveDrawerBin(null);
          handleOpenEditModal(bin);
        }}
      />

      {/* Modal: Add or Edit Bin */}
      <AddEditBinModal
        isOpen={isAddEditModalOpen}
        binToEdit={editingBin}
        onClose={() => setIsAddEditModalOpen(false)}
        onSubmit={handleAddEditSubmit}
      />

      {/* Modal: Import Bins CSV */}
      <ImportBinsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={loadData}
      />

      {/* Modal / Drawer: Location Mini-Map */}
      <BinLocationDrawer
        bin={locationDrawerBin}
        onClose={() => setLocationDrawerBin(null)}
      />

      {/* Drawer: Collection History */}
      <CollectionHistoryDrawer
        bin={historyDrawerBin}
        historyLogs={historyLogs}
        onClose={() => setHistoryDrawerBin(null)}
      />

      {/* Modal: Prioritize Collection Confirmation */}
      <PrioritizeCollectionModal
        bin={prioritizeBin}
        onClose={() => setPrioritizeBin(null)}
        onConfirm={handlePrioritizeConfirm}
      />

      {/* Modal: Deactivate Confirmation */}
      <DeactivateBinModal
        bin={deactivateBinTarget}
        onClose={() => setDeactivateBinTarget(null)}
        onConfirm={handleDeactivateConfirm}
      />

    </div>
  );
};
