'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main Content */}
      <div
        className="transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? '72px' : '280px' }}
      >
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="pt-20 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
