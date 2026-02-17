import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="p-6 md:p-10">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-card p-8 text-center max-w-xl mx-auto">
        <div className="text-5xl font-extrabold text-primary tracking-tight">404</div>
        <div className="text-lg font-semibold text-gray-900 mt-2">Page not found</div>
        <div className="text-gray-500 mt-2">The page you’re trying to open doesn’t exist or was moved.</div>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white font-bold shadow-soft hover:bg-primary/90 transition-all"
          >
            <span className="material-icons text-lg">home</span>
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
