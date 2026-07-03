'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { ChevronDown, ChevronLeft, LogOut, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { navigationConfig } from '@/config/navigation';
import { getIcon } from './icon-map';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar } from '@/components/ui/avatar';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

interface NavChildItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavChildItem[];
}

export default function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Get user initials from session
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase();
  };

  // Filter navigation based on user role and departments
  const isAdmin = session?.user?.role === 'ADMIN';
  const userDeptSlugs = (session?.user as any)?.departmentSlugs || [];

  const filterNavConfig = (config: typeof navigationConfig) => {
    return config.filter(section => {
      // Hide Admin section for non-admin users
      if (section.href === '/admin' && !isAdmin) {
        return false;
      }
      return true;
    }).map(section => {
      // Filter departments for non-admin users
      if (section.href === '/departments' && section.children && !isAdmin) {
        return {
          ...section,
          children: section.children.filter(dept =>
            userDeptSlugs.includes(dept.href.split('/')[2])
          ),
        };
      }
      return section;
    });
  };

  const filteredNav = filterNavConfig(navigationConfig);

  const toggleExpand = (href: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(href)) {
      newExpanded.delete(href);
    } else {
      newExpanded.add(href);
    }
    setExpandedItems(newExpanded);
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const NavItem = ({
    label,
    href,
    icon,
    childItems,
    badge,
    depth = 0,
  }: {
    label: string;
    href: string;
    icon: string;
    childItems?: NavChildItem[];
    badge?: number;
    depth?: number;
  }) => {
    const IconComponent = getIcon(icon);
    const hasChildren = childItems && childItems.length > 0;
    const active = isActive(href);
    const isExpanded = expandedItems.has(href);

    const itemContent = (
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 relative',
          'hover:bg-white/[0.06]',
          active && 'bg-white/[0.08] text-white',
          active && 'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-[3px] before:h-6 before:bg-gold-400 before:rounded-r',
          depth === 0 ? 'text-stone-300' : 'text-stone-400',
          isCollapsed && 'justify-center px-2'
        )}
      >
        <IconComponent
          className={cn(
            'w-5 h-5 flex-shrink-0 transition-colors duration-200',
            active ? 'text-gold-300' : 'text-stone-400'
          )}
        />
        {!isCollapsed && (
          <>
            <span className="flex-1 text-sm font-medium truncate">{label}</span>
            {badge && (
              <span className="flex items-center justify-center w-5 h-5 text-xs font-bold bg-gold-500 text-[#081A33] rounded-full flex-shrink-0">
                {badge}
              </span>
            )}
            {hasChildren && (
              <ChevronDown
                className={cn(
                  'w-4 h-4 flex-shrink-0 transition-transform duration-200',
                  isExpanded && 'rotate-180'
                )}
              />
            )}
          </>
        )}
      </div>
    );

    if (hasChildren) {
      return (
        <div>
          <button
            onClick={() => toggleExpand(href)}
            className="w-full text-left"
            title={isCollapsed ? label : undefined}
          >
            {itemContent}
          </button>

          {!isCollapsed && isExpanded && (
            <div className="ml-4 mt-1 space-y-1 border-l border-white/10 pl-2">
              {childItems!.map((child) => (
                <NavItem
                  key={child.href}
                  {...child}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link href={href} title={isCollapsed ? label : undefined}>
        {itemContent}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-gradient-to-b from-[#081A33] via-[#092142] to-[#0B2348] border-r border-white/5 flex flex-col transition-all duration-300 z-40',
        isCollapsed ? 'w-[72px]' : 'w-[280px]'
      )}
    >
      {/* Header with Logo and Command Centre Text */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 h-20 flex-shrink-0">
        {!isCollapsed && (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 flex-shrink-0">
              <img src="https://www.raffi-jewellers.ca/assets/img/footer/Raffi_Logo_Footer.b617a5c0.svg" alt="Raffi Jewellers" className="w-full h-full object-contain brightness-0 invert opacity-95" />
            </div>
            <div className="min-w-0">
              <p className="font-serif text-lg font-semibold text-white leading-none tracking-[0.14em]">RAFFI</p>
              <p className="text-[10px] font-semibold text-gold-400/90 uppercase tracking-luxe whitespace-nowrap mt-1">
                Command Centre
              </p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-full flex items-center justify-center">
            <div className="w-8 h-8">
              <img src="https://www.raffi-jewellers.ca/assets/img/footer/Raffi_Logo_Footer.b617a5c0.svg" alt="Raffi Jewellers" className="w-full h-full object-contain brightness-0 invert opacity-95" />
            </div>
          </div>
        )}
        {onToggle && (
          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-white/10 transition-colors ml-2 flex-shrink-0"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <Menu className="w-5 h-5 text-stone-300" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-stone-300" />
            )}
          </button>
        )}
      </div>

      {/* Navigation Area */}
      <ScrollArea className="flex-1">
        <nav className="p-4 space-y-2">
          {filteredNav.map((section, index) => (
            <div key={`section-${index}`}>
              {section.label && !isCollapsed && (
                <div className="px-4 py-2 text-[10px] font-semibold text-white/30 uppercase tracking-luxe mb-2">
                  {section.label}
                </div>
              )}
              {section.children ? (
                section.children.map((item) => (
                  <NavItem
                    key={item.href}
                    label={item.label}
                    href={item.href}
                    icon={item.icon}
                    childItems={item.children}
                    badge={item.badge}
                    depth={0}
                  />
                ))
              ) : (
                <NavItem
                  label={section.label}
                  href={section.href}
                  icon={section.icon}
                  childItems={section.children}
                  badge={section.badge}
                  depth={0}
                />
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer with User Card */}
      <div className="p-4 border-t border-white/10 flex-shrink-0">
        {!isCollapsed ? (
          <div className="bg-white/[0.06] border border-white/10 rounded-xl p-3 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <div className="w-full h-full bg-gold-500 flex items-center justify-center text-sm font-bold text-[#081A33]">
                  {getInitials(session?.user?.name)}
                </div>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{session?.user?.name || 'User'}</p>
                <p className="text-xs text-stone-400 truncate">{session?.user?.role || 'Member'}</p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-2 rounded hover:bg-white/10 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-stone-300" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
