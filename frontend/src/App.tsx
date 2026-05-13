/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Scheduling from './pages/Scheduling';
import HospitalServices from './pages/HospitalServices';
import MedicalLibrary from './pages/MedicalLibrary';
import MedicalRecords from './pages/MedicalRecords';
import Payment from './pages/Payment';
import Login from './pages/Login';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import LabResults from './pages/LabResults';

import { LanguageProvider } from './contexts/LanguageContext';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

// Helper to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function HomeRedirect() {
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'ADMIN';
  const isDoctor = userRole === 'DOCTOR';
  const isTechnician = userRole === 'TECHNICIAN';
  
  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  if (isDoctor) {
    return <Navigate to="/scheduling" replace />;
  }

  if (isTechnician) {
    return <Navigate to="/lab-results" replace />;
  }
  
  return <Dashboard />;
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={
            <PrivateRoute>
              <Layout>
                <HomeRedirect />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/scheduling" element={
            <PrivateRoute>
              <Layout>
                <Scheduling />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/services" element={
            <PrivateRoute>
              <Layout>
                <HospitalServices />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/library" element={
            <PrivateRoute>
              <Layout>
                <MedicalLibrary />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/profile" element={
            <PrivateRoute>
              <Layout>
                <Profile />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/records" element={
            <PrivateRoute>
              <Layout>
                <MedicalRecords />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/payment" element={
            <PrivateRoute>
              <Layout>
                <Payment />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/admin" element={
            <PrivateRoute>
              <Layout>
                <AdminDashboard />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="/lab-results" element={
            <PrivateRoute>
              <Layout>
                <LabResults />
              </Layout>
            </PrivateRoute>
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
