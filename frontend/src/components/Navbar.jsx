import React, { useState } from 'react';

export default function Navbar({ user, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-card rounded-b-2xl sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <span className="text-lg font-extrabold text-primary tracking-tight hidden sm:block">AI Student</span>
        <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">{user?.role || 'Guest'}</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none">
          <span className="material-icons text-2xl text-gray-500">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full animate-pulse"></span>
        </button>
        <div className="relative">
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full px-3 py-2 border border-gray-200 hover:border-primary transition"
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shadow-soft">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="hidden md:flex flex-col text-left text-sm">
              <span className="font-semibold text-gray-700">{user?.name}</span>
              <span className="text-gray-400">{user?.email}</span>
            </div>
            <span className="material-icons text-gray-400">keyboard_arrow_down</span>
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white border border-gray-100 shadow-lg py-2 z-10">
              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
