import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type {
  PlatformUser,
  UserRole,
  ZoneName,
  UserFilterState,
  UserSortState,
  UserKpiSummary,
} from '../../../types/user';
import { userService } from '../../../services/userService';

// Subcomponents
import { UsersHeader } from './UsersHeader';
import { UserKpiGrid } from './UserKpiGrid';
import { RoleDistribution } from './RoleDistribution';
import { UserStatusSummary } from './UserStatusSummary';
import { UserFilterToolbar } from './UserFilterToolbar';
import { UserTable } from './UserTable';
import { BulkActionBar } from './BulkActionBar';
import { Pagination } from './Pagination';
import { UserDetailsDrawer } from './UserDetailsDrawer';
import { AddEditUserModal } from './AddEditUserModal';
import { ChangeRoleModal } from './ChangeRoleModal';
import { AssignmentModal } from './AssignmentModal';
import { ResetAccessModal } from './ResetAccessModal';
import { DeactivateUserModal } from './DeactivateUserModal';
import { ImportUsersModal } from './ImportUsersModal';
import { WorkforceStatus } from './WorkforceStatus';

// Toast Icon & Component
import { CheckCircle2, X } from 'lucide-react';

interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  text: string;
}

export const UsersPage: React.FC = () => {
  // Master Users Data State
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [kpiSummary, setKpiSummary] = useState<UserKpiSummary>({
    totalUsers: 86,
    activeUsers: 78,
    activePercent: 90.7,
    driverCount: 52,
    activeDriverCount: 46,
    analystCount: 21,
    adminCount: 13,
    inactiveCount: 6,
    pendingCount: 2,
    suspendedCount: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter State
  const [filters, setFilters] = useState<UserFilterState>({
    searchQuery: '',
    role: 'All',
    status: 'All',
    zone: 'All',
    assignment: 'All',
    activityFilter: 'All',
  });

  // Sort State
  const [sort, setSort] = useState<UserSortState>({
    field: 'fullName',
    direction: 'asc',
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Multi-Selection State
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Toast Notifications State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modal & Drawer Control States
  const [drawerUser, setDrawerUser] = useState<PlatformUser | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const [editUser, setEditUser] = useState<PlatformUser | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState<boolean>(false);

  const [roleUser, setRoleUser] = useState<PlatformUser | null>(null);
  const [isChangeRoleModalOpen, setIsChangeRoleModalOpen] = useState<boolean>(false);

  const [assignUser, setAssignUser] = useState<PlatformUser | null>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState<boolean>(false);

  const [resetUser, setResetUser] = useState<PlatformUser | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);

  const [deactivateUser, setDeactivateUser] = useState<PlatformUser | null>(null);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState<boolean>(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // Data Fetching
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    const res = await userService.getUsers(filters, sort);
    setUsers(res.data);
    setKpiSummary(res.kpiSummary);
    setIsLoading(false);
  }, [filters, sort]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Compute Pagination slices
  const totalPages = Math.ceil(users.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return users.slice(start, start + pageSize);
  }, [users, currentPage, pageSize]);

  // Compute Role counts over current state
  const roleCounts = useMemo(() => {
    return {
      ADMIN: users.filter((u) => u.role === 'ADMIN').length,
      DRIVER: users.filter((u) => u.role === 'DRIVER').length,
      ANALYST: users.filter((u) => u.role === 'ANALYST').length,
    };
  }, [users]);

  // Compute Status counts over current state
  const statusCounts = useMemo(() => {
    return {
      All: users.length,
      ACTIVE: users.filter((u) => u.status === 'ACTIVE').length,
      INACTIVE: users.filter((u) => u.status === 'INACTIVE').length,
      PENDING: users.filter((u) => u.status === 'PENDING').length,
      SUSPENDED: users.filter((u) => u.status === 'SUSPENDED').length,
    };
  }, [users]);

  // Calculate Active Filters Count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.role !== 'All') count++;
    if (filters.status !== 'All') count++;
    if (filters.zone !== 'All') count++;
    if (filters.assignment !== 'All') count++;
    if (filters.activityFilter !== 'All') count++;
    return count;
  }, [filters]);

  // Handlers for Filters
  const handleFilterChange = (updated: Partial<UserFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      role: 'All',
      status: 'All',
      zone: 'All',
      assignment: 'All',
      activityFilter: 'All',
    });
    setCurrentPage(1);
  };

  // Selection Handlers
  const handleToggleSelectAll = () => {
    const pageIds = paginatedUsers.map((u) => u.id);
    const allOnPageSelected = pageIds.every((id) => selectedUserIds.includes(id));
    if (allOnPageSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Actions Callbacks
  const handleOpenAddModal = () => {
    setEditUser(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (user: PlatformUser) => {
    setEditUser(user);
    setIsAddEditModalOpen(true);
  };

  const handleAddUserSubmit = async (input: any) => {
    const newUser = await userService.createUser(input);
    await fetchUsers();
    setIsAddEditModalOpen(false);
    showToast(`User ${newUser.firstName} ${newUser.lastName} created successfully.`);
  };

  const handleEditUserSubmit = async (id: string, updates: Partial<PlatformUser>) => {
    const updated = await userService.updateUser(id, updates);
    await fetchUsers();
    setIsAddEditModalOpen(false);
    if (updated) {
      showToast(`User ${updated.firstName} ${updated.lastName} updated successfully.`);
    }
  };

  const handleChangeRoleConfirm = async (userId: string, newRole: UserRole) => {
    const updated = await userService.changeUserRole(userId, newRole);
    await fetchUsers();
    if (updated) {
      showToast(`Role for ${updated.firstName} changed to ${newRole}.`);
    }
  };

  const handleAssignDriverSave = async (
    userId: string,
    assignment: { zone: string; vehicleId: string; routeId: string }
  ) => {
    const updated = await userService.updateUser(userId, {
      zone: assignment.zone as ZoneName,
      assignedVehicleId: assignment.vehicleId,
      assignedRouteId: assignment.routeId,
    });
    await fetchUsers();
    if (updated) {
      showToast(`Assignment updated for ${updated.firstName} ${updated.lastName}.`);
    }
  };

  const handleRemoveAssignment = async (userId: string) => {
    const updated = await userService.updateUser(userId, {
      assignedVehicleId: undefined,
      assignedRouteId: undefined,
    });
    await fetchUsers();
    if (updated) {
      showToast(`Assignment removed for ${updated.firstName}.`, 'info');
    }
  };

  const handleResetAccessConfirm = async (userId: string, _option: string) => {
    const res = await userService.resetUserAccess(userId);
    showToast(res.message);
  };

  const handleDeactivateConfirm = async (userId: string) => {
    const updated = await userService.deactivateUser(userId);
    await fetchUsers();
    if (updated) {
      showToast(`User ${updated.firstName} ${updated.lastName} deactivated.`, 'warning');
    }
  };

  const handleReactivate = async (user: PlatformUser) => {
    const updated = await userService.reactivateUser(user.id);
    await fetchUsers();
    if (updated) {
      showToast(`User ${updated.firstName} ${updated.lastName} reactivated.`);
    }
  };

  // Bulk Actions
  const handleBulkActivate = async () => {
    const count = await userService.bulkActivate(selectedUserIds);
    await fetchUsers();
    showToast(`${count} users activated.`);
    setSelectedUserIds([]);
  };

  const handleBulkDeactivate = async () => {
    const count = await userService.bulkDeactivate(selectedUserIds);
    await fetchUsers();
    showToast(`${count} users deactivated.`, 'warning');
    setSelectedUserIds([]);
  };

  const handleBulkChangeRole = async (role: UserRole) => {
    const count = await userService.bulkChangeRole(selectedUserIds, role);
    await fetchUsers();
    showToast(`Role updated to ${role} for ${count} users.`);
    setSelectedUserIds([]);
  };

  const handleBulkAssignZone = async (zone: string) => {
    const count = await userService.bulkAssignZone(selectedUserIds, zone as ZoneName);
    await fetchUsers();
    showToast(`Zone assigned to ${zone} for ${count} users.`);
    setSelectedUserIds([]);
  };

  const handleExportUsers = (onlySelected: boolean = false) => {
    const listToExport = onlySelected
      ? users.filter((u) => selectedUserIds.includes(u.id))
      : users;
    const csvContent = userService.exportUsersCSV(listToExport);

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecotrack_users_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    showToast(
      onlySelected
        ? `Exported ${selectedUserIds.length} selected users to CSV.`
        : `Exported ${users.length} users to CSV.`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 lg:p-8 space-y-6 max-w-[1600px] mx-auto pb-24">
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 space-y-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-3.5 rounded-lg shadow-xl border flex items-center justify-between text-xs font-medium animate-in slide-in-from-top-2 duration-200 ${
              t.type === 'warning'
                ? 'bg-amber-900 text-amber-50 border-amber-800'
                : t.type === 'info'
                ? 'bg-blue-900 text-blue-50 border-blue-800'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t.text}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
              className="text-slate-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* 1. Header Section */}
      <UsersHeader
        onAddUser={handleOpenAddModal}
        onImport={() => setIsImportModalOpen(true)}
        onExport={() => handleExportUsers(false)}
        onRefresh={fetchUsers}
      />

      {/* 2. Top KPI Cards Grid */}
      <UserKpiGrid
        summary={kpiSummary}
        onFilterRole={(role) => handleFilterChange({ role })}
        onFilterStatus={(status) => handleFilterChange({ status })}
      />

      {/* 3. Role Breakdown & Quick Status Filters Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2">
          <RoleDistribution
            counts={roleCounts}
            total={users.length}
            selectedRole={filters.role}
            onSelectRole={(role) => handleFilterChange({ role })}
          />
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Quick Status Filters
          </h3>
          <UserStatusSummary
            counts={statusCounts}
            selectedStatus={filters.status}
            onSelectStatus={(status) => handleFilterChange({ status })}
          />
        </div>
      </div>

      {/* 4. Filter Toolbar */}
      <UserFilterToolbar
        filters={filters}
        sort={sort}
        onFilterChange={handleFilterChange}
        onSortChange={(updated) => setSort((prev) => ({ ...prev, ...updated }))}
        onResetFilters={handleResetFilters}
        onRefresh={fetchUsers}
        activeFilterCount={activeFilterCount}
      />

      {/* 5. Main Users Table */}
      <UserTable
        users={paginatedUsers}
        selectedUserIds={selectedUserIds}
        sort={sort}
        isLoading={isLoading}
        onToggleSelectAll={handleToggleSelectAll}
        onToggleSelectUser={handleToggleSelectUser}
        onSortChange={(field) =>
          setSort((prev) => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc',
          }))
        }
        onViewDetails={(u) => {
          setDrawerUser(u);
          setIsDrawerOpen(true);
        }}
        onEdit={handleOpenEditModal}
        onChangeRole={(u) => {
          setRoleUser(u);
          setIsChangeRoleModalOpen(true);
        }}
        onAssignDriver={(u) => {
          setAssignUser(u);
          setIsAssignmentModalOpen(true);
        }}
        onResetAccess={(u) => {
          setResetUser(u);
          setIsResetModalOpen(true);
        }}
        onDeactivate={(u) => {
          setDeactivateUser(u);
          setIsDeactivateModalOpen(true);
        }}
        onReactivate={handleReactivate}
        onResetFilters={handleResetFilters}
      />

      {/* 6. Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalUsers={users.length}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />

      {/* 7. Workforce Duty Breakdown & Operational Feeds */}
      <WorkforceStatus
        users={users}
        onSelectUser={(u) => {
          setDrawerUser(u);
          setIsDrawerOpen(true);
        }}
      />

      {/* 8. Bulk Action Bar (Floating) */}
      <BulkActionBar
        selectedCount={selectedUserIds.length}
        onClearSelection={() => setSelectedUserIds([])}
        onBulkActivate={handleBulkActivate}
        onBulkDeactivate={handleBulkDeactivate}
        onBulkChangeRole={handleBulkChangeRole}
        onBulkAssignZone={handleBulkAssignZone}
        onBulkExport={() => handleExportUsers(true)}
      />

      {/* Drawers & Modals */}
      <UserDetailsDrawer
        user={drawerUser}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={handleOpenEditModal}
        onChangeRole={(u) => {
          setRoleUser(u);
          setIsChangeRoleModalOpen(true);
        }}
        onAssignDriver={(u) => {
          setAssignUser(u);
          setIsAssignmentModalOpen(true);
        }}
        onResetAccess={(u) => {
          setResetUser(u);
          setIsResetModalOpen(true);
        }}
        onDeactivate={(u) => {
          setDeactivateUser(u);
          setIsDeactivateModalOpen(true);
        }}
        onReactivate={handleReactivate}
      />

      <AddEditUserModal
        isOpen={isAddEditModalOpen}
        userToEdit={editUser}
        onClose={() => setIsAddEditModalOpen(false)}
        onSubmitAdd={handleAddUserSubmit}
        onSubmitEdit={handleEditUserSubmit}
      />

      <ChangeRoleModal
        isOpen={isChangeRoleModalOpen}
        user={roleUser}
        onClose={() => setIsChangeRoleModalOpen(false)}
        onConfirm={handleChangeRoleConfirm}
      />

      <AssignmentModal
        isOpen={isAssignmentModalOpen}
        user={assignUser}
        onClose={() => setIsAssignmentModalOpen(false)}
        onSave={handleAssignDriverSave}
        onRemove={handleRemoveAssignment}
      />

      <ResetAccessModal
        isOpen={isResetModalOpen}
        user={resetUser}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetAccessConfirm}
      />

      <DeactivateUserModal
        isOpen={isDeactivateModalOpen}
        user={deactivateUser}
        onClose={() => setIsDeactivateModalOpen(false)}
        onConfirm={handleDeactivateConfirm}
      />

      <ImportUsersModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={async (count) => {
          await fetchUsers();
          showToast(`Imported ${count} new users from CSV.`);
        }}
      />
    </div>
  );
};

export default UsersPage;
