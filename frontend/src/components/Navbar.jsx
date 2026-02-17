import React from 'react';

export default function Navbar({ user }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-card rounded-b-2xl sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded hover:bg-gray-100 focus:outline-none">
          <span className="material-icons text-2xl text-gray-500">menu</span>
        </button>
        <span className="text-lg font-extrabold text-primary tracking-tight hidden sm:block">AI Student</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none">
          <span className="material-icons text-2xl text-gray-500">notifications</span>
          {/* Notification dot */}
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full animate-pulse"></span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shadow-soft">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="hidden md:block text-sm font-semibold text-gray-700">
            {user?.name}
            <div className="text-xs text-gray-400">{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
