import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes that require authentication
const protectedRoutes = [
  '/profile',
  '/settings',
];

// API routes that require authentication
const protectedApiRoutes = [
  '/api/users/me',
  '/api/friends',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  const isProtectedApiRoute = protectedApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Only check auth for protected routes
  if (!isProtectedRoute && !isProtectedApiRoute) {
    return NextResponse.next();
  }

  // Get the token from the request
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  });

  // If protected route and not authenticated, redirect to home
  if (isProtectedRoute && !token) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('auth', 'required');
    return NextResponse.redirect(url);
  }

  // If protected API route and not authenticated, return 401
  if (isProtectedApiRoute && !token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)',
  ],
};
