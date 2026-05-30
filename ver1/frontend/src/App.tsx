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
import { appRoutes } from './routes/routeConfig';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { Layout } from './components/Layout';
import { getUserRole } from './hooks/useAuth';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function HomeRedirect() {
  const role = getUserRole();

  if (role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  if (role === 'DOCTOR') {
    return <Navigate to="/scheduling" replace />;
  }

  if (role === 'TECHNICIAN') {
    return <Navigate to="/lab-results" replace />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <HomeRedirect />
                </Layout>
              </ProtectedRoute>
            }
          />
          {appRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                route.protected ? (
                  <ProtectedRoute>
                    <Layout>{route.element}</Layout>
                  </ProtectedRoute>
                ) : (
                  route.element
                )
              }
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </BrowserRouter>
  );
}
