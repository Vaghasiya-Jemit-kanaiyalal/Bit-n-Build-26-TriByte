import { INITIAL_MOCK_USERS } from '../mock/userMockData';
import type {
  PlatformUser,
  UserFilterState,
  UserSortState,
  UserKpiSummary,
  UserRole,
  ZoneName,
} from '../types/user';

let mockUserStore: PlatformUser[] = [...INITIAL_MOCK_USERS];

export const userService = {
  // Fetch users with search, filter, and sorting
  async getUsers(
    filter?: UserFilterState,
    sort?: UserSortState
  ): Promise<{ data: PlatformUser[]; totalCount: number; kpiSummary: UserKpiSummary }> {
    // Simulate lightweight latency
    await new Promise((resolve) => setTimeout(resolve, 120));

    let result = [...mockUserStore];

    // Apply Filter State
    if (filter) {
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase().trim();
        result = result.filter(
          (u) =>
            u.fullName.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query) ||
            u.id.toLowerCase().includes(query) ||
            u.phone.toLowerCase().includes(query) ||
            u.role.toLowerCase().includes(query) ||
            u.zone.toLowerCase().includes(query) ||
            (u.assignedVehicleId && u.assignedVehicleId.toLowerCase().includes(query)) ||
            (u.assignedRouteId && u.assignedRouteId.toLowerCase().includes(query))
        );
      }

      if (filter.role !== 'All') {
        result = result.filter((u) => u.role === filter.role);
      }

      if (filter.status !== 'All') {
        result = result.filter((u) => u.status === filter.status);
      }

      if (filter.zone !== 'All') {
        result = result.filter((u) => u.zone === filter.zone);
      }

      if (filter.assignment !== 'All') {
        if (filter.assignment === 'Assigned') {
          result = result.filter((u) => !!u.assignedVehicleId || !!u.assignedRouteId);
        } else {
          result = result.filter((u) => !u.assignedVehicleId && !u.assignedRouteId);
        }
      }

      if (filter.activityFilter !== 'All') {
        if (filter.activityFilter === 'Active Today') {
          result = result.filter((u) => u.lastActiveAt.includes('min') || u.lastActiveAt.includes('hour') || u.lastActiveAt.includes('Today'));
        } else if (filter.activityFilter === 'Inactive 7+ Days') {
          result = result.filter((u) => u.lastActiveAt.includes('days') || u.status === 'INACTIVE');
        }
      }
    }

    // Apply Sorting
    if (sort) {
      result.sort((a, b) => {
        let valA: any = a[sort.field];
        let valB: any = b[sort.field];

        if (sort.field === 'fullName') {
          valA = a.fullName.toLowerCase();
          valB = b.fullName.toLowerCase();
        }

        if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    // Compute KPI Summary over full dataset
    const totalUsers = 86; // Display total metric
    const activeUsers = mockUserStore.filter((u) => u.status === 'ACTIVE').length;
    const collectorCount = mockUserStore.filter((u) => u.role === 'COLLECTOR' || u.role === 'DRIVER').length;
    const activeDriverCount = mockUserStore.filter((u) => (u.role === 'COLLECTOR' || u.role === 'DRIVER') && u.status === 'ACTIVE').length;
    const viewerCount = mockUserStore.filter((u) => u.role === 'VIEWER' || u.role === 'ANALYST').length;
    const adminCount = mockUserStore.filter((u) => u.role === 'ADMIN').length;
    const inactiveCount = mockUserStore.filter((u) => u.status === 'INACTIVE').length;
    const pendingCount = mockUserStore.filter((u) => u.status === 'PENDING').length;
    const suspendedCount = mockUserStore.filter((u) => u.status === 'SUSPENDED').length;

    const kpiSummary: UserKpiSummary = {
      totalUsers,
      activeUsers: activeUsers > 0 ? activeUsers : 78,
      activePercent: 90.7,
      driverCount: collectorCount > 0 ? collectorCount : 52,
      collectorCount: collectorCount > 0 ? collectorCount : 52,
      activeDriverCount: activeDriverCount > 0 ? activeDriverCount : 46,
      analystCount: viewerCount > 0 ? viewerCount : 21,
      viewerCount: viewerCount > 0 ? viewerCount : 21,
      adminCount: adminCount > 0 ? adminCount : 13,
      inactiveCount: inactiveCount > 0 ? inactiveCount : 6,
      pendingCount: pendingCount > 0 ? pendingCount : 2,
      suspendedCount,
    };

    return {
      data: result,
      totalCount: result.length,
      kpiSummary,
    };
  },

  async getUserById(id: string): Promise<PlatformUser | null> {
    const user = mockUserStore.find((u) => u.id === id);
    return user || null;
  },

  async createUser(userData: any): Promise<PlatformUser> {
    const newNum = Math.floor(100 + Math.random() * 900);
    const newId = `USR-${newNum}`;

    if (mockUserStore.some((u) => u.email.toLowerCase() === userData.email?.toLowerCase())) {
      throw new Error(`A user with email ${userData.email} already exists.`);
    }

    const fName = userData.firstName || 'New';
    const lName = userData.lastName || 'User';
    const fullName = `${fName} ${lName}`;
    const initials = `${fName[0]}${lName[0]}`.toUpperCase();

    // Call backend API if admin token exists
    const token = localStorage.getItem('wastewise_token');
    if (token) {
      try {
        await fetch('http://localhost:8000/api/v1/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            first_name: fName,
            last_name: lName,
            email: userData.email,
            phone: userData.phone,
            role: userData.role || 'COLLECTOR',
            status: userData.status || 'ACTIVE',
            organization: userData.organization || 'EcoTrack AI Waste Management',
            department: userData.department || 'Operations',
            temporary_password: userData.tempPassword || userData.temporary_password || 'TempPass123!',
          }),
        });
      } catch (err) {
        console.warn('Backend user creation offline or failed, saving locally:', err);
      }
    }

    const newUser: PlatformUser = {
      id: newId,
      userCode: newId,
      firstName: fName,
      lastName: lName,
      fullName,
      email: userData.email || `user${newNum}@example.com`,
      phone: userData.phone || '+91 98000 00000',
      role: userData.role || 'COLLECTOR',
      status: userData.status || 'ACTIVE',
      organization: userData.organization || 'Municipal Waste Operations',
      department: userData.department || 'Operations Team',
      zone: userData.zone || 'Central Zone',
      assignedVehicleId: userData.assignedVehicleId,
      assignedRouteId: userData.assignedRouteId,
      analyticsScope: userData.analyticsScope,
      accessScope: userData.role === 'ADMIN' ? 'Full Platform' : userData.role === 'VIEWER' ? 'Analytics Only' : 'Operational Only',
      avatarInitials: initials,
      avatarBgColor: userData.role === 'ADMIN' ? 'bg-[#064e3b] text-white' : userData.role === 'VIEWER' ? 'bg-purple-700 text-white' : 'bg-emerald-600 text-white',
      lastActiveAt: 'Just now',
      joinedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
      activityHistory: [
        { id: `ACT-${Date.now()}`, timestamp: 'Just now', description: 'User account created by Admin.', category: 'admin' },
      ],
    };

    mockUserStore.unshift(newUser);
    return newUser;
  },

  async updateUser(id: string, updates: Partial<PlatformUser>): Promise<PlatformUser> {
    const index = mockUserStore.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error(`User ${id} not found.`);
    }

    const current = mockUserStore[index];
    const fName = updates.firstName || current.firstName;
    const lName = updates.lastName || current.lastName;
    const fullName = `${fName} ${lName}`;

    const token = localStorage.getItem('wastewise_token');
    if (token) {
      try {
        await fetch(`http://localhost:8000/api/v1/users/${current.email}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            first_name: fName,
            last_name: lName,
            email: updates.email || current.email,
            phone: updates.phone || current.phone,
            organization: updates.organization || current.organization,
            department: updates.department || current.department,
          }),
        });
      } catch (err) {
        console.warn('Backend user update offline or failed:', err);
      }
    }

    const updated: PlatformUser = {
      ...current,
      ...updates,
      firstName: fName,
      lastName: lName,
      fullName,
      avatarInitials: `${fName[0]}${lName[0]}`.toUpperCase(),
      updatedAt: new Date().toISOString(),
    };

    mockUserStore[index] = updated;
    return updated;
  },

  async changeUserRole(id: string, newRole: UserRole): Promise<PlatformUser> {
    const user = mockUserStore.find((u) => u.id === id);
    if (!user) throw new Error(`User ${id} not found.`);

    const token = localStorage.getItem('wastewise_token');
    if (token) {
      try {
        await fetch(`http://localhost:8000/api/v1/users/${user.email}/role`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        });
      } catch (err) {
        console.warn('Backend role update offline or failed:', err);
      }
    }

    return this.updateUser(id, {
      role: newRole,
      accessScope: newRole === 'ADMIN' ? 'Full Platform' : newRole === 'VIEWER' ? 'Analytics Only' : 'Operational Only',
      assignedVehicleId: newRole === 'COLLECTOR' ? user.assignedVehicleId : undefined,
      assignedRouteId: newRole === 'COLLECTOR' ? user.assignedRouteId : undefined,
      analyticsScope: newRole === 'VIEWER' ? 'All Zones' : undefined,
    });
  },

  async deactivateUser(id: string): Promise<PlatformUser> {
    return this.updateUser(id, {
      status: 'INACTIVE',
    });
  },

  async reactivateUser(id: string): Promise<PlatformUser> {
    return this.updateUser(id, {
      status: 'ACTIVE',
      lastActiveAt: 'Just now',
    });
  },

  async resetUserAccess(id: string): Promise<{ success: boolean; message: string }> {
    const user = mockUserStore.find((u) => u.id === id);
    if (!user) throw new Error(`User ${id} not found.`);
    return {
      success: true,
      message: `Access reset email instructions sent to ${user.email}.`,
    };
  },

  async bulkActivate(ids: string[]): Promise<number> {
    let count = 0;
    mockUserStore = mockUserStore.map((u) => {
      if (ids.includes(u.id)) {
        count++;
        return { ...u, status: 'ACTIVE', lastActiveAt: 'Just now' };
      }
      return u;
    });
    return count;
  },

  async bulkDeactivate(ids: string[]): Promise<number> {
    let count = 0;
    mockUserStore = mockUserStore.map((u) => {
      if (ids.includes(u.id)) {
        count++;
        return { ...u, status: 'INACTIVE' };
      }
      return u;
    });
    return count;
  },

  async bulkChangeRole(ids: string[], role: UserRole): Promise<number> {
    let count = 0;
    mockUserStore = mockUserStore.map((u) => {
      if (ids.includes(u.id)) {
        count++;
        return {
          ...u,
          role,
          accessScope: role === 'ADMIN' ? 'Full Platform' : role === 'ANALYST' ? 'Analytics Only' : 'Operational Only',
        };
      }
      return u;
    });
    return count;
  },

  async bulkAssignZone(ids: string[], zone: ZoneName): Promise<number> {
    let count = 0;
    mockUserStore = mockUserStore.map((u) => {
      if (ids.includes(u.id)) {
        count++;
        return { ...u, zone };
      }
      return u;
    });
    return count;
  },

  exportUsersCSV(users: PlatformUser[]): string {
    const headers = [
      'User ID',
      'Full Name',
      'Email',
      'Phone',
      'Role',
      'Status',
      'Zone',
      'Vehicle ID',
      'Route ID',
      'Access Scope',
      'Last Active',
      'Joined Date',
    ];

    const rows = users.map((u) => [
      u.id,
      `"${u.fullName}"`,
      `"${u.email}"`,
      `"${u.phone}"`,
      u.role,
      u.status,
      `"${u.zone}"`,
      u.assignedVehicleId || '—',
      u.assignedRouteId || '—',
      `"${u.accessScope}"`,
      `"${u.lastActiveAt}"`,
      `"${u.joinedAt}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },
};
