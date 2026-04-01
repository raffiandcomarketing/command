'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Breadcrumbs() {
  const pathname = usePathname();

  // Skip breadcrumbs on login page
  if (pathname === '/login') {
    return null;
  }

  // Split pathname and create breadcrumb items
  const segments = pathname
    .split('/')
    .filter((segment) => segment !== '' && segment !== 'dashboard');

  if (segments.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Dashboard</span>
      </div>
    );
  }

  const breadcrumbs = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const isLast = index === segments.length - 1;

    // Format segment for display
    const label = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return { href, label, isLast };
  });

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/dashboard"
        className="text-sm text-gray-500 hover:text-[#09203F] transition-colors"
      >
        Dashboard
      </Link>

      {breadcrumbs.map((crumb) => (
        <div key={crumb.href} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-gray-300" />
          {crumb.isLast ? (
            <span className="text-sm text-gray-900 font-medium">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-sm text-gray-500 hover:text-[#09203F] transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
