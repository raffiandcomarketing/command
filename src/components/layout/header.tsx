'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Bell, User, Settings, HelpCircle, LogOut, CheckSquare, Briefcase, FileCheck, Building2, Users } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Breadcrumbs from './breadcrumbs';
import { api } from '@/lib/client/api';

interface SearchResults {
  tasks: Array<{ id: string; title: string }>;
  deals: Array<{ id: string; title: string; contact: { name: string } | null }>;
  contacts: Array<{ id: string; name: string; company: string | null }>;
  approvals: Array<{ id: string; title: string }>;
  departments: Array<{ id: string; name: string; slug: string }>;
  users: Array<{ id: string; name: string; email: string }>;
}

export default function Header() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchFocused, setSearchFocused] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults | null>(null);
  const [searching, setSearching] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  };

  // Real unread notification count (was hardcoded to 3).
  const refreshUnread = useCallback(() => {
    api<{ unreadCount: number }>('/api/notifications?pageSize=1')
      .then((r) => setUnreadCount(r.unreadCount))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    refreshUnread();
    const interval = setInterval(refreshUnread, 60_000);
    return () => clearInterval(interval);
  }, [refreshUnread]);

  // Debounced global search.
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }
    setSearching(true);
    const t = setTimeout(() => {
      api<{ results: SearchResults }>(`/api/search?q=${encodeURIComponent(query.trim())}`)
        .then((r) => setResults(r.results))
        .catch(() => setResults(null))
        .finally(() => setSearching(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const go = (href: string) => {
    setQuery('');
    setResults(null);
    setSearchFocused(false);
    router.push(href);
  };

  const hasAnyResult =
    results &&
    (results.tasks.length || results.deals.length || results.contacts.length || results.approvals.length || results.departments.length || results.users.length);

  const group = (
    label: string,
    icon: React.ReactNode,
    items: Array<{ key: string; text: string; sub?: string; href: string }>
  ) =>
    items.length > 0 && (
      <div key={label}>
        <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{label}</p>
        {items.map((i) => (
          <button
            key={i.key}
            onMouseDown={(e) => {
              e.preventDefault();
              go(i.href);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left"
          >
            <span className="text-gray-400">{icon}</span>
            <span className="truncate">{i.text}</span>
            {i.sub && <span className="text-xs text-gray-400 truncate">· {i.sub}</span>}
          </button>
        ))}
      </div>
    );

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200',
        'flex items-center justify-between px-6 z-30',
        'transition-all duration-300'
      )}
      style={{ left: '280px' }}
    >
      <div className="flex-1 min-w-0">
        <Breadcrumbs />
      </div>

      {/* Global search (wired to /api/search) */}
      <div className="flex-1 max-w-xs mx-8 relative" ref={searchRef}>
        <div
          className={cn(
            'relative flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200',
            'bg-gray-100 border border-gray-200',
            searchFocused && 'border-gray-300 shadow-md bg-white'
          )}
        >
          <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search tasks, deals, people…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 outline-none"
            onFocus={() => setSearchFocused(true)}
          />
        </div>

        {searchFocused && query.trim().length >= 2 && (
          <div className="absolute top-full mt-2 left-0 right-0 rounded-lg bg-white border border-gray-200 shadow-xl z-50 py-1 max-h-96 overflow-y-auto">
            {searching && <p className="px-4 py-3 text-sm text-gray-400">Searching…</p>}
            {!searching && !hasAnyResult && <p className="px-4 py-3 text-sm text-gray-400">No results for “{query.trim()}”</p>}
            {!searching && results && (
              <>
                {group('Tasks', <CheckSquare className="w-4 h-4" />, results.tasks.map((t) => ({ key: t.id, text: t.title, href: '/tasks' })))}
                {group('Deals', <Briefcase className="w-4 h-4" />, results.deals.map((d) => ({ key: d.id, text: d.title, sub: d.contact?.name ?? undefined, href: '/crm' })))}
                {group('Contacts', <Users className="w-4 h-4" />, results.contacts.map((c) => ({ key: c.id, text: c.name, sub: c.company ?? undefined, href: '/crm' })))}
                {group('Approvals', <FileCheck className="w-4 h-4" />, results.approvals.map((a) => ({ key: a.id, text: a.title, href: '/approvals' })))}
                {group('Departments', <Building2 className="w-4 h-4" />, results.departments.map((d) => ({ key: d.id, text: d.name, href: `/departments/${d.slug}` })))}
                {group('Users', <User className="w-4 h-4" />, results.users.map((u) => ({ key: u.id, text: u.name, sub: u.email, href: '/admin/users' })))}
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications - real unread count, links to the notifications page */}
        <Link
          href="/notifications"
          className={cn('relative p-2 rounded-lg transition-colors', 'text-gray-500 hover:text-gray-700')}
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 min-w-5 h-5 px-1 flex items-center justify-center text-xs font-bold bg-[#09203F] text-white rounded-full">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={cn('relative flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors', 'hover:bg-gray-100 group')}
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

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-white border border-gray-200 shadow-lg z-50 py-1">
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              <Link
                href="/settings"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <a
                href="https://github.com/raffiandcomarketing/command"
                target="_blank"
                rel="noreferrer"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                Help
              </a>
              <div className="my-1 h-px bg-gray-200" />
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
