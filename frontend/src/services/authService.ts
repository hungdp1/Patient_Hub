const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`;

export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface RegisterRequest {
  phoneNumber: string;
  password: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  emergencyContact: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    phoneNumber?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
  };
}

function setAuthState(token: string, user: any) {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('user_data', JSON.stringify(user));
  localStorage.setItem('isAuthenticated', 'true');

  if (user?.role) {
    localStorage.setItem('userRole', user.role);
  }

  const name = user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  if (name) {
    localStorage.setItem('userName', name);
  }
}

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    const success = response.ok && data.success !== false;

    if (success && data.token && data.user) {
      setAuthState(data.token, data.user);
    }

    return {
      success,
      message: data.message || (success ? 'Đăng nhập thành công' : 'Đăng nhập thất bại'),
      token: data.token,
      user: data.user,
    };
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    const success = response.ok && data.success !== false;

    if (success && data.token && data.user) {
      setAuthState(data.token, data.user);
    }

    return {
      success,
      message: data.message || (success ? 'Đăng ký thành công' : 'Đăng ký thất bại'),
      token: data.token,
      user: data.user,
    };
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  setToken(token: string) {
    localStorage.setItem('auth_token', token);
  },

  getUserData() {
    const data = localStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  },

  setUserData(user: any) {
    localStorage.setItem('user_data', JSON.stringify(user));
  },
};