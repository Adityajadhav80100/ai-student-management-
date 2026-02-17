import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import MainLayout from './MainLayout';
import Sidebar, { navConfig } from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { AuthContext } from '../context/AuthContext';

export default function TeacherLayout() {
  const { logout, user } = useContext(AuthContext);

  return (
    <MainLayout sidebar={<Sidebar navItems={navConfig.teacher} onLogout={logout} />} navbar={<Navbar user={user} onLogout={logout} />}>
      <Outlet />
    </MainLayout>
  );
}
