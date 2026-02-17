import React from 'react';

export default function MainLayout({ sidebar, navbar, children }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className="hidden md:block">
        {sidebar}
      </div>
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        {navbar}
        {/* Main Content */}
        <main className="flex-1 bg-background overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
