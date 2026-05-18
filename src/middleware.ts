import { auth } from '@/lib/auth/server';
import { NextRequest, NextResponse } from 'next/server';

const authMiddleware = auth ? auth.middleware({
    loginUrl: '/',
}) : null;

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protect student and admin routes
  if (pathname.startsWith('/student') || pathname.startsWith('/admin')) {
    // If it is a Server Action POST request, allow it to pass to the Action where it will be verified
    if (request.method === 'POST') {
      return NextResponse.next();
    }
  
    if (authMiddleware) {
      return authMiddleware(request);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/student/:path*',
    '/admin/:path*',
  ],
};
