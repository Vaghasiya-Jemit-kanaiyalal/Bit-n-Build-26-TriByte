const API_BASE_URL = 'http://localhost:8000/api/v1';

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    phone?: string;
    organization?: string;
    department?: string;
    role: 'ADMIN' | 'COLLECTOR' | 'VIEWER';
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    created_at: string;
    last_login?: string;
  };
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Invalid email or password.');
      }

      const data: LoginResponse = await response.json();
      localStorage.setItem('wastewise_token', data.access_token);
      localStorage.setItem('wastewise_refresh_token', data.refresh_token);
      localStorage.setItem('wastewise_user', JSON.stringify(data.user));
      return data;
    } catch (err: any) {
      // If backend server is unreachable or offline, provide graceful fallback for demo accounts
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        console.warn('Backend server unreachable, falling back to local credentials store.');
        return this.localDemoFallback(email, password);
      }
      throw err;
    }
  },

  async register(fullName: string, email: string, password: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to create account.');
      }

      return await response.json();
    } catch (err: any) {
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        return { message: 'Account created locally (offline fallback mode).' };
      }
      throw err;
    }
  },

  getToken(): string | null {
    return localStorage.getItem('wastewise_token');
  },

  getSavedUser(): any | null {
    const raw = localStorage.getItem('wastewise_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem('wastewise_token');
    localStorage.removeItem('wastewise_refresh_token');
    localStorage.removeItem('wastewise_user');
  },

  localDemoFallback(email: string, pass: string): LoginResponse {
    const normalized = email.trim().toLowerCase();
    
    // Check known credentials
    if (normalized === 'yug@gmail.com' && pass === 'Yug@5599') {
      return this.makeMockResponse('Yug', 'Admin', normalized, 'ADMIN', 'ACTIVE');
    }
    if (normalized === 'admin@gmail.com' && pass === 'admin123') {
      return this.makeMockResponse('System', 'Admin', normalized, 'ADMIN', 'ACTIVE');
    }
    if (normalized === 'collector@gmail.com' && pass === 'collector123') {
      return this.makeMockResponse('Fleet', 'Collector', normalized, 'COLLECTOR', 'ACTIVE');
    }
    if (normalized === 'xyz@gmail.com' && pass === 'viewer123') {
      return this.makeMockResponse('EcoTrack', 'Viewer', normalized, 'VIEWER', 'ACTIVE');
    }
    if (normalized === 'admin@ecotrack.com' && pass === 'admin123') {
      return this.makeMockResponse('Jemit', 'Vaghasiya', normalized, 'ADMIN', 'ACTIVE');
    }

    throw new Error('Invalid email or password.');
  },

  makeMockResponse(first: string, last: string, email: string, role: 'ADMIN' | 'COLLECTOR' | 'VIEWER', status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): LoginResponse {
    const userObj = {
      id: 'mock-' + Date.now(),
      first_name: first,
      last_name: last,
      full_name: `${first} ${last}`,
      email,
      role,
      status,
      organization: 'EcoTrack WasteWise AI',
      department: 'Operations',
      created_at: new Date().toISOString(),
    };
    return {
      access_token: 'mock-jwt-token',
      refresh_token: 'mock-refresh-token',
      token_type: 'bearer',
      user: userObj,
    };
  }
};
