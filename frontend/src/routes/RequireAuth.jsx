import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function RequireAuth({ children }) {
  const { user, token, ready } = useContext(AuthContext);
  const location = useLocation();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <span className="material-icons animate-spin text-4xl">autorenew</span>
      </div>
    );
  }

  if (!user || !token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
