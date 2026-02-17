import React, { useContext } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import RequireAuth from './RequireAuth';
import RequireProfileCompleted from './RequireProfileCompleted';
import Login from '../pages/Login';
import Register from '../pages/Register';
import CompleteProfile from '../pages/CompleteProfile';
import NotFound from '../pages/NotFound';
import AdminLayout from '../layouts/AdminLayout';
import TeacherLayout from '../layouts/TeacherLayout';
import StudentLayout from '../layouts/StudentLayout';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminDepartments from '../pages/admin/AdminDepartments';
import AdminSubjects from '../pages/admin/AdminSubjects';
import StudentsPage from '../pages/Students';
import AnalyticsDashboard from '../pages/AnalyticsDashboard';
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import TeacherSubjects from '../pages/teacher/TeacherSubjects';
import TeacherAttendance from '../pages/teacher/TeacherAttendance';
import TeacherMarks from '../pages/teacher/TeacherMarks';
import TeacherStudentAnalytics from '../pages/teacher/TeacherStudentAnalytics';
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentAttendance from '../pages/student/StudentAttendance';
import StudentMarks from '../pages/student/StudentMarks';
import MyAnalytics from '../pages/MyAnalytics';
import MyProfile from '../pages/student/MyProfile';
import HodDashboard from '../pages/hod/HodDashboard';
import HodLayout from '../layouts/HodLayout';

function RoleRedirect() {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" replace />;
  if (!user.profileCompleted) return <Navigate to="/complete-profile" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <RequireAuth>
            <Outlet />
          </RequireAuth>
        }
      >
        <Route path="/complete-profile" element={<CompleteProfile />} />

        <Route
          element={
            <RequireProfileCompleted>
              <Outlet />
            </RequireProfileCompleted>
          }
        >
          <Route path="/" element={<RoleRedirect />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="departments" element={<AdminDepartments />} />
            <Route path="subjects" element={<AdminSubjects />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path="/teacher" element={<TeacherLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="subjects" element={<TeacherSubjects />} />
            <Route path="attendance" element={<TeacherAttendance />} />
            <Route path="marks" element={<TeacherMarks />} />
            <Route path="analytics" element={<TeacherStudentAnalytics />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path="/hod" element={<HodLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<HodDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="marks" element={<StudentMarks />} />
            <Route path="analytics" element={<MyAnalytics />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
