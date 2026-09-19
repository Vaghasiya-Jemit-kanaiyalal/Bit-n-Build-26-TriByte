export type PlatformRole = 'ADMIN' | 'COLLECTOR' | 'VIEWER';
export type DisplayRole = 'Waste Manager' | 'Driver / Field Worker' | 'Analyst / Supervisor' | 'Waste Collector' | 'Platform Viewer';

export interface UserSession {
  id?: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'COLLECTOR' | 'VIEWER' | string;
  displayRole?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | string;
  organization: string;
  department?: string;
}
