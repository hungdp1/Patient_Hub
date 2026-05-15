import React from 'react';
import Dashboard from '../pages/Dashboard';
import Scheduling from '../pages/Scheduling';
import HospitalServices from '../pages/HospitalServices';
import MedicalLibrary from '../pages/MedicalLibrary';
import MedicalRecords from '../pages/MedicalRecords';
import Payment from '../pages/Payment';
import Profile from '../pages/Profile';
import AdminDashboard from '../pages/AdminDashboard';
import LabResults from '../pages/LabResults';
import Login from '../pages/Login';

export interface AppRoute {
  path: string;
  element: React.ReactElement;
  protected?: boolean;
}

export const appRoutes: AppRoute[] = [
  { path: '/login', element: <Login /> },
  { path: '/scheduling', element: <Scheduling />, protected: true },
  { path: '/services', element: <HospitalServices />, protected: true },
  { path: '/library', element: <MedicalLibrary />, protected: true },
  { path: '/records', element: <MedicalRecords />, protected: true },
  { path: '/payment', element: <Payment />, protected: true },
  { path: '/profile', element: <Profile />, protected: true },
  { path: '/admin', element: <AdminDashboard />, protected: true },
  { path: '/lab-results', element: <LabResults />, protected: true },
];
