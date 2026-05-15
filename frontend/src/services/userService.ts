import { authService } from './authService';

const API_BASE_URL = 'http://localhost:5000/api';

export interface UserProfile {
  id: string;
  phoneNumber: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  emergencyContact: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  appointments: any[];
  labResults: any[];
  medicalRecords: any[];
  notifications: any[];
}

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    const data = await response.json();
    return data.user;
  },

  async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    const data = await response.json();
    return data.user;
  },

  async getDashboard(): Promise<DashboardData> {
    const token = authService.getToken();
    const response = await fetch(`${API_BASE_URL}/user/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard');
    }

    const data = await response.json();
    return data;
  },
};