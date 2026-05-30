import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';

const STORAGE_KEYS = {
  auth: 'isAuthenticated',
  role: 'userRole',
  name: 'userName',
};

function normalizeRole(value: string | null): UserRole | null {
  if (!value) {
    return null;
  }

  return Object.values(UserRole).includes(value as UserRole) ? (value as UserRole) : null;
}

function getDefaultName(role: UserRole | null): string {
  switch (role) {
    case UserRole.ADMIN:
      return 'Quản Lý Bệnh Viện';
    case UserRole.DOCTOR:
      return 'BS. Lê Thành Nam';
    case UserRole.TECHNICIAN:
      return 'KTV. Nguyễn Văn Khoa';
    case UserRole.PATIENT:
      return 'Nguyễn Văn A';
    default:
      return 'Người dùng';
  }
}

export function isAuthenticated(): boolean {
  return localStorage.getItem(STORAGE_KEYS.auth) === 'true';
}

export function getUserRole(): UserRole | null {
  return normalizeRole(localStorage.getItem(STORAGE_KEYS.role));
}

export function getUserName(): string {
  const storedName = localStorage.getItem(STORAGE_KEYS.name);
  if (storedName) {
    return storedName;
  }

  const storedData = localStorage.getItem('user_data');
  if (storedData) {
    const user = JSON.parse(storedData);
    const name = user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
    if (name) {
      return name;
    }
  }

  return getDefaultName(getUserRole());
}

export function useAuth() {
  const navigate = useNavigate();

  const login = useCallback(
    (role: UserRole, name: string) => {
      localStorage.setItem(STORAGE_KEYS.auth, 'true');
      localStorage.setItem(STORAGE_KEYS.role, role);
      localStorage.setItem(STORAGE_KEYS.name, name);
      navigate('/');
    },
    [navigate],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.auth);
    localStorage.removeItem(STORAGE_KEYS.role);
    localStorage.removeItem(STORAGE_KEYS.name);
    navigate('/login');
  }, [navigate]);

  return {
    isAuthenticated: isAuthenticated(),
    userRole: getUserRole(),
    userName: getUserName(),
    login,
    logout,
  };
}
