export const USER_ROLES = {
  ADMIN: 'ADMIN',
  DRIVER: 'DRIVER',
  ANALYST: 'ANALYST',
  VIEWER: 'VIEWER',
} as const;

export const ROLE_LABELS = {
  ADMIN: 'Waste Manager',
  DRIVER: 'Collection Driver',
  ANALYST: 'Operations Analyst',
  VIEWER: 'System Viewer',
};

export type PlatformRole = 'ADMIN' | 'DRIVER' | 'ANALYST' | 'VIEWER';
export type DisplayRole = 'Waste Manager' | 'Collection Driver' | 'Operations Analyst' | 'System Viewer';
export type UserRole = PlatformRole | string;

export interface UserSession {
  id?: string;
  name: string;
  email: string;
  role: PlatformRole | string;
  displayRole?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | string;
  organization: string;
  department?: string;
}

