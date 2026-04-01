import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/raffi-logo') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // RBAC checks for authenticated users
  const userRole = token.role as string;
  const departmentSlugs = (token.departmentSlugs || []) as string[];

  // Allow admin users to access everything
  if (userRole === 'ADMIN') {
    return NextResponse.next();
  }

  // Check department-level access
  if (pathname.startsWith('/departments/')) {
    const pathParts = pathname.split('/');
    const deptSlug = pathParts[2]; // /departments/[slug]

    if (deptSlug && !departmentSlugs.includes(deptSlug)) {
      const dashboardUrl = new URL('/', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  // Restrict /admin/* pages to ADMIN users only
  if (pathname.startsWith('/admin/')) {
    const dashboardUrl = new URL('/', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Allow access to /crm for all authenticated users
  if (pathname === '/crm') {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
