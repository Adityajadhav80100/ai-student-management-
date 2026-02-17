import React from 'react';

export default function AuthLeftPanel() {
  return (
    <div className="hidden md:flex flex-col justify-center items-center bg-gradient-to-br from-primary to-accent text-white rounded-2xl m-4 p-8 w-1/2 min-h-[32rem] shadow-card">
      <div className="mb-8">
        <svg width="120" height="120" fill="none" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="60" fill="#fff" fillOpacity="0.08" />
          <circle cx="60" cy="60" r="48" fill="#fff" fillOpacity="0.12" />
          <text x="50%" y="54%" textAnchor="middle" fill="#fff" fontSize="32" fontWeight="bold" dy=".3em">AI</text>
        </svg>
      </div>
      <h2 className="text-3xl font-extrabold mb-2">Welcome Back!</h2>
      <p className="text-lg opacity-80 mb-6 text-center max-w-xs">AI-powered student analytics, risk alerts, and performance insights. Manage your academic journey smarter.</p>
    </div>
  );
}
