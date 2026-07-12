import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken, verifyRefreshToken, signToken } from './lib/auth';

const publicRoutes = [
  '/login',
  '/register',
  '/api/auth/verify',
  '/privacy',
  '/grievance',
  '/forgot-password',
  '/reset-password'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public routes and root path (splash screen)
  if (pathname === '/' || publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth-token')?.value;
  const refreshToken = request.cookies.get('refresh-token')?.value;

  let payload = null;
  if (token) {
    payload = await verifyToken(token);
  }

  // Silent refresh flow
  if (!payload && refreshToken) {
    const refreshPayload = await verifyRefreshToken(refreshToken);
    if (refreshPayload) {
      payload = refreshPayload;
      
      // Generate new access token
      const newToken = await signToken({
        userId: refreshPayload.userId,
        role: refreshPayload.role,
        mobileNumber: refreshPayload.mobileNumber,
      });

      const response = NextResponse.next();
      response.cookies.set('auth-token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/',
      });

      // Role check during refresh response
      if (pathname.startsWith('/admin') && payload.role === 'USER') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return response;
    }
  }

  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role based redirection if needed
  if (pathname.startsWith('/admin') && payload.role === 'USER') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo.png|icon.png|.*\\..*).*)'],
};
