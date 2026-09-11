import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { getSession } from '@/lib/auth/session';

interface AppShellProps {
  children: React.ReactNode;
}

export async function AppShell({ children }: AppShellProps) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-[#09120b] text-[#f0fdf4] flex">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <Header user={session || undefined} />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
