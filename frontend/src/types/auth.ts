export type UserRole = 'Waste Manager' | 'Driver / Field Worker' | 'Analyst / Supervisor';

export interface UserSession {
  name: string;
  email: string;
  role: UserRole;
  organization: string;
}
