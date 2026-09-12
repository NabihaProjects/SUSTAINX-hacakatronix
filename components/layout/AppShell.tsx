import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppShellProps {
  children: React.ReactNode;
}

// AppShell is a synchronous layout component — it must NOT be async
// because it's used inside 'use client' pages throughout the app.
// The Header has built-in fallbacks for all user fields.
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#09120b] text-[#f0fdf4] flex">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
