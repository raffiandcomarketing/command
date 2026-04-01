'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Search, Bell } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Breadcrumbs from './breadcrumbs';
import { Dropdown } from '@/components/ui/dropdown';

export default function Header() {
  const { data: session } = useSession();
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationCount] = useState(3);

  // Get user initials from session
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase();
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200',
        'flex items-center justify-between px-6 z-30',
        'transition-all duration-300'
      )}
      style={{ left: '280px' }}
    >
      {/* Left: Breadcrumbs */}
      <div className="flex-1 min-w-0">
        <Breadcrumbs />
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-xs mx-8">
        <div
          className={cn(
            'relative flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200',
            'bg-gray-100 border border-gray-200',
            searchFocused && 'border-gray-300 shadow-md'
          )}
        >
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <span className="text-xs text-gray-400 hidden sm:inline">Cmd+K</span>
        </div>
      </div>

      {/* Right: Notifications and User */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          className={cn(
            'relative p-2 rounded-lg transition-colors',
            'text-gray-500 hover:text-gray-700'
          )}
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {notificationCount > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 flex items-center justify-center text-xs font-bold bg-[#09203F] text-white rounded-full">
              {notificationCount}
            </span>
          )}
        </button>

        {/* User Avatar Dropdown */}
        <Dropdown
          trigger={
            <button
              className={cn(
                'relative flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors',
                'hover:bg-gray-100 group'
              )}
              title="User menu"
            >
              <Avatar className="w-8 h-8">
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-xs font-bold text-[#09203F]">
                  {getInitials(session?.user?.name)}
                </div>
              </Avatar>
              <span className="text-sm text-gray-700 hidden sm:inline group-hover:text-gray-900">
                {session?.user?.name?.split(' ')[0] || 'User'}
              </span>
            </button>
          }
          items={[
            {
              label: 'Profile',
              href: '#',
              icon: 'User',
            },
            {
              label: 'Settings',
              href: '#',
              icon: 'Settings',
            },
            {
              label: 'Help',
              href: '#',
              icon: 'HelpCircle',
            },
            {
              type: 'separator' as const,
            },
            {
              label: 'Logout',
              href: '#',
              icon: 'LogOut',
              action: () => {
                signOut({ callbackUrl: '/login' });
              },
            },
          ]}
          align="end"
        />
      </div>
    </header>
  );
}
