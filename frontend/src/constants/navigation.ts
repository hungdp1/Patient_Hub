import { UserRole } from '../types';
import { LucideIcon, Sparkles, CalendarClock, BookOpen, Library, ClipboardList, CreditCard, ShieldCheck, FlaskConical } from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  roles: UserRole[];
}

export const navItems: NavItem[] = [
  {
    label: 'Trợ lý AI',
    path: '/',
    icon: Sparkles,
    roles: [UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN, UserRole.TECHNICIAN],
  },
  {
    label: 'Lịch khám',
    path: '/scheduling',
    icon: CalendarClock,
    roles: [UserRole.PATIENT, UserRole.DOCTOR],
  },
  {
    label: 'Dịch vụ',
    path: '/services',
    icon: BookOpen,
    roles: [UserRole.PATIENT, UserRole.ADMIN],
  },
  {
    label: 'Thư viện',
    path: '/library',
    icon: Library,
    roles: [UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN, UserRole.TECHNICIAN],
  },
  {
    label: 'Thanh toán',
    path: '/payment',
    icon: CreditCard,
    roles: [UserRole.PATIENT],
  },
  {
    label: 'Hồ sơ',
    path: '/records',
    icon: ClipboardList,
    roles: [UserRole.PATIENT],
  },
  {
    label: 'Kết quả xét nghiệm',
    path: '/lab-results',
    icon: FlaskConical,
    roles: [UserRole.TECHNICIAN],
  },
  {
    label: 'Quản trị',
    path: '/admin',
    icon: ShieldCheck,
    roles: [UserRole.ADMIN],
  },
];
