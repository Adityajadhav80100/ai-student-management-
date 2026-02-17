import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import AnalyticsDashboard from '../pages/AnalyticsDashboard';
import MyAnalytics from '../pages/MyAnalytics';
import NotFound from '../pages/NotFound';
import Students from '../pages/Students';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import MainLayout from '../layouts/MainLayout';
import CompleteProfile from '../pages/CompleteProfile';
import RequireProfileCompleted from './RequireProfileCompleted';
import { AuthContext } from '../context/AuthContext';

export default function AppRoutes() {
  const { user, login, logout } = useContext(AuthContext);

  // Unauthenticated routes
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login onLogin={login} />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  // Authenticated but profile incomplete route
  if (!user.profileCompleted) {
    return (
      <Routes>
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="*" element={<Navigate to="/complete-profile" />} />
      </Routes>
    );
  }

  // Authenticated and profile complete
  return (
    <MainLayout sidebar={<Sidebar role={user.role} onLogout={logout} />} navbar={<Navbar user={user} />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route
          path="/dashboard"
          element={
            <RequireProfileCompleted>
              <Dashboard />
            </RequireProfileCompleted>
          }
        />
        {user.role === 'student' && (
          <Route
            path="/my-analytics"
            element={
              <RequireProfileCompleted>
                <MyAnalytics />
              </RequireProfileCompleted>
            }
          />
        )}
        {(user.role === 'admin' || user.role === 'teacher') && (
          <>
            <Route
              path="/students"
              element={
                <RequireProfileCompleted>
                  <Students />
                </RequireProfileCompleted>
              }
            />
            <Route
              path="/analytics"
              element={
                <RequireProfileCompleted>
                  <AnalyticsDashboard />
                </RequireProfileCompleted>
              }
            />
          </>
        )}
        {/* Add more protected routes here */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
}
