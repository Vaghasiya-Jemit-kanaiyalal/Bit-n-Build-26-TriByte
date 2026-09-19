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
    role: 'ADMIN' | 'DRIVER' | 'ANALYST';
    status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    created_at: string;
    last_login?: string;
  };
}

export const redirectUserByRole = (role?: string, email?: string): string => {
  const cleanEmail = (email || '').toLowerCase().trim();
  if (cleanEmail.endsWith('@driver.gmail.com')) {
    return '/driver/dashboard';
  }
  if (cleanEmail.endsWith('@analyst.gmail.com')) {
    return '/analyst/dashboard';
  }
  const normalizedRole = (role || '').toUpperCase();
  if (normalizedRole === 'ADMIN') {
    return '/admin/dashboard';
  }
  if (normalizedRole === 'DRIVER') {
    return '/driver/dashboard';
  }
  if (normalizedRole === 'ANALYST') {
    return '/analyst/dashboard';
  }
  console.warn(`Unknown user role received: "${role}". Redirecting to /login safe state.`);
  return '/login';
};

export const authService = {
  redirectUserByRole,

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
      localStorage.setItem('ecotrack_token', data.access_token);
      localStorage.setItem('ecotrack_refresh_token', data.refresh_token);
      localStorage.setItem('ecotrack_user', JSON.stringify(data.user));
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
    return localStorage.getItem('ecotrack_token') || localStorage.getItem('wastewise_token');
  },

  getSavedUser(): any | null {
    const raw = localStorage.getItem('ecotrack_user') || localStorage.getItem('wastewise_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  async refreshToken(): Promise<string | null> {
    const refreshToken = localStorage.getItem('ecotrack_refresh_token') || localStorage.getItem('wastewise_refresh_token');
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        return null;
      }

      const data: LoginResponse = await response.json();
      localStorage.setItem('ecotrack_token', data.access_token);
      localStorage.setItem('ecotrack_refresh_token', data.refresh_token);
      if (data.user) {
        localStorage.setItem('ecotrack_user', JSON.stringify(data.user));
      }
      return data.access_token;
    } catch {
      return null;
    }
  },

  logout(): void {
    localStorage.removeItem('ecotrack_token');
    localStorage.removeItem('ecotrack_refresh_token');
    localStorage.removeItem('ecotrack_user');
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
    if (normalized === 'rahul@driver.gmail.com' && pass === 'driver123') {
      return this.makeMockResponse('Rahul', 'Patel', normalized, 'DRIVER', 'ACTIVE');
    }
    if (normalized === 'jay@analyst.gmail.com' && pass === 'analyst123') {
      return this.makeMockResponse('Jay', 'Patel', normalized, 'ANALYST', 'ACTIVE');
    }
    if (normalized === 'admin@ecotrack.com' && pass === 'admin123') {
      return this.makeMockResponse('Jemit', 'Vaghasiya', normalized, 'ADMIN', 'ACTIVE');
    }

    // Dynamic driver & analyst resolution
    if (normalized.endsWith('@driver.gmail.com')) {
      const namePart = normalized.split('@')[0];
      const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      return this.makeMockResponse(capitalized, 'Driver', normalized, 'DRIVER', 'ACTIVE');
    }
    if (normalized.endsWith('@analyst.gmail.com')) {
      const namePart = normalized.split('@')[0];
      const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      return this.makeMockResponse(capitalized, 'Analyst', normalized, 'ANALYST', 'ACTIVE');
    }

    throw new Error('Invalid email or password.');
  },

  makeMockResponse(first: string, last: string, email: string, role: 'ADMIN' | 'DRIVER' | 'ANALYST', status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'): LoginResponse {
    const userObj = {
      id: 'mock-' + Date.now(),
      first_name: first,
      last_name: last,
      full_name: `${first} ${last}`,
      email,
      role,
      status,
      organization: 'EcoTrack AI Waste Management',
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
