'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';
import { ToastProvider } from '@/components/ui/toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <ToastProvider>
    <div className="min-h-screen bg-transparent">
      {/* Sidebar */}
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main Content */}
      <div
        className="transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '72px' : '280px' }}
      >
        {/* Header */}
        <Header sidebarWidth={sidebarCollapsed ? 72 : 280} />

        {/* Page Content */}
        <main className="pt-20 p-8">
          {children}
        </main>
      </div>
    </div>
    </ToastProvider>
  );
}
