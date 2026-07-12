import { redirect } from 'next/navigation';

export interface AuthSession {
  userId: string;
  role: string;
  mobileNumber: string;
}

/**
 * Enforces role-based authorization in Server Components.
 * Redirects to /login if unauthenticated, or to /dashboard if unauthorized.
 */
export function requireRole(session: AuthSession | null, allowedRoles: string[]): asserts session is AuthSession {
  if (!session) {
    redirect('/login');
  }
  if (!allowedRoles.includes(session.role)) {
    redirect('/dashboard');
  }
}
