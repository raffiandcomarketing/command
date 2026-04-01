'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

export default function Sidebar({ isCollapsed = false, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

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
    children,
    badge,
    depth = 0,
  }: {
    label: string;
    href: string;
    icon: string;
    children?: any[];
    badge?: number;
    depth?: number;
  }) => {
    const IconComponent = getIcon(icon);
    const hasChildren = children && children.length > 0;
    const active = isActive(href);
    const isExpanded = expandedItems.has(href);

    const itemContent = (
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 relative',
          'hover:bg-gray-50',
          active && 'bg-[#09203F]/10 text-[#09203F]',
          active && 'before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-[#09203F] before:rounded-r',
          depth === 0 ? 'text-gray-700' : 'text-gray-600',
          isCollapsed && 'justify-center px-2'
        )}
      >
        <IconComponent
          className={cn(
            'w-5 h-5 flex-shrink-0 transition-colors duration-200',
            active ? 'text-[#09203F]' : 'text-gray-500'
          )}
        />
        {!isCollapsed && (
          <>
            <span className="flex-1 text-sm font-medium truncate">{label}</span>
            {badge && (
              <span className="flex items-center justify-center w-5 h-5 text-xs font-bold bg-[#09203F] text-white rounded-full flex-shrink-0">
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
            <div className="ml-4 mt-1 space-y-1 border-l border-gray-200 pl-2">
              {children.map((child) => (
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
        'fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 z-40',
        isCollapsed ? 'w-[72px]' : 'w-[280px]'
      )}
    >
      {/* Header with Logo and Command Centre Text */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 h-20 flex-shrink-0">
        {!isCollapsed && (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 flex-shrink-0">
              <img src="/raffi-logo.svg" alt="Raffi Jewellers" className="w-full h-full object-contain" />
            </div>
            <span className="text-xs font-bold text-[#09203F] uppercase tracking-widest whitespace-nowrap">
              Command Centre
            </span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-full flex items-center justify-center">
            <div className="w-8 h-8">
              <img src="/raffi-logo.svg" alt="Raffi Jewellers" className="w-full h-full object-contain" />
            </div>
          </div>
        )}
        {onToggle && (
          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-gray-100 transition-colors ml-2 flex-shrink-0"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <Menu className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        )}
      </div>

      {/* Navigation Area */}
      <ScrollArea className="flex-1">
        <nav className="p-4 space-y-2">
          {navigationConfig.map((section, index) => (
            <div key={`section-${index}`}>
              {section.label && !isCollapsed && (
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
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
                    children={item.children}
                    badge={item.badge}
                    depth={0}
                  />
                ))
              ) : (
                <NavItem
                  label={section.label}
                  href={section.href}
                  icon={section.icon}
                  children={section.children}
                  badge={section.badge}
                  depth={0}
                />
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Footer with User Card */}
      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        {!isCollapsed ? (
          <div className="bg-gray-100 rounded-lg p-3 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 flex-shrink-0">
                <div className="w-full h-full bg-[#09203F] flex items-center justify-center text-sm font-bold text-white">
                  JD
                </div>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                <p className="text-xs text-gray-600 truncate">CEO</p>
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <button className="p-2 rounded hover:bg-gray-100 transition-colors" title="Logout">
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
