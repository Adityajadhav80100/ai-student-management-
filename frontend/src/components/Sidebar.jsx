import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export const navConfig = {
  admin: [
    { label: 'Dashboard', to: '/admin/dashboard', icon: 'dashboard' },
    { label: 'Analytics', to: '/admin/analytics', icon: 'bar_chart' },
    { label: 'Students', to: '/admin/students', icon: 'group' },
    { label: 'Departments', to: '/admin/departments', icon: 'apartment' },
    { label: 'Subjects', to: '/admin/subjects', icon: 'menu_book' },
    { label: 'Teachers', to: '/admin/teachers', icon: 'groups' },
  ],
  teacher: [
    { label: 'Dashboard', to: '/teacher/dashboard', icon: 'dashboard' },
    { label: 'My Subjects', to: '/teacher/subjects', icon: 'menu_book' },
    { label: 'Take Attendance', to: '/teacher/attendance', icon: 'event_available' },
    { label: 'Enter Marks', to: '/teacher/marks', icon: 'grading' },
    { label: 'Student Analytics', to: '/teacher/analytics', icon: 'insights' },
  ],
  student: [
    { label: 'Dashboard', to: '/student/dashboard', icon: 'dashboard' },
    { label: 'Attendance', to: '/student/attendance', icon: 'event_available' },
    { label: 'Marks', to: '/student/marks', icon: 'grading' },
    { label: 'Analytics', to: '/student/analytics', icon: 'insights' },
    { label: 'My Profile', to: '/student/profile', icon: 'person' },
  ],
  hod: [
    { label: 'Dashboard', to: '/hod/dashboard', icon: 'dashboard' },
  ],
};

export default function Sidebar({ navItems = [], onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const isActive = (to) => location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <aside
      className={`h-screen bg-white border-r border-gray-200 shadow-card flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} z-20`}
    >
      <div className="flex items-center justify-between px-4 py-6">
        <span className={`text-2xl font-extrabold text-primary transition-all duration-300 ${collapsed ? 'hidden' : 'block'}`}>AI Student</span>
        <button
          className="p-2 rounded hover:bg-gray-100"
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Toggle sidebar"
        >
          <span className="material-icons text-gray-500">{collapsed ? 'chevron_right' : 'chevron_left'}</span>
        </button>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2 mt-4 px-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                title={collapsed ? item.label : undefined}
                className={[
                  'group flex items-center gap-4 px-4 py-3 rounded-2xl font-semibold transition-all duration-200',
                  'hover:bg-primary/10 hover:text-primary',
                  collapsed ? 'justify-center' : '',
                  isActive(item.to) ? 'bg-primary/10 text-primary ring-1 ring-primary/10' : 'text-gray-700',
                ].join(' ')}
              >
                <span className="material-icons text-xl opacity-90 group-hover:opacity-100">{item.icon}</span>
                <span className={`${collapsed ? 'hidden' : 'block'}`}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto p-4">
        <button
          className="w-full flex items-center justify-center gap-2 bg-danger hover:bg-danger/90 text-white font-semibold py-2 rounded-2xl transition-all duration-200 shadow-soft"
          onClick={onLogout}
        >
          <span className="material-icons">logout</span>
          <span className={`${collapsed ? 'hidden' : 'block'}`}>Logout</span>
        </button>
      </div>
    </aside>
  );
}
