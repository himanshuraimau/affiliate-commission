import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define which paths are public and which require authentication
  const isPublicPath = path === '/' || path === '/login' || path === '/signup';
  const isAuthPath = path === '/login' || path === '/signup';
  
  // Check if user is authenticated by looking for the user cookie
  // The cookie is stored as a string and needs to be checked if it exists
  const userCookie = request.cookies.get('user');
  const isAuthenticated = !!userCookie?.value;

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && isAuthPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users away from protected routes
  if (!isAuthenticated && !isPublicPath && path.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow the request to proceed normally
  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  // Matcher ignoring API routes and static files:
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
