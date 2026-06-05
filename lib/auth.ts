import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET_STR = process.env.JWT_SECRET || 'fallback-secret-for-dev-only-32-chars-long';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STR);

export interface TokenPayload {
  userId: string;
  role: string;
  mobileNumber: string;
}

export async function signToken(payload: TokenPayload): Promise<string> {
  // jose SignJWT expects an object and returns a promise
  return new SignJWT({ 
    userId: payload.userId,
    role: payload.role,
    mobileNumber: payload.mobileNumber
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(JWT_SECRET);
}

export async function signRefreshToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ 
    userId: payload.userId,
    role: payload.role,
    mobileNumber: payload.mobileNumber
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      role: payload.role as string,
      mobileNumber: payload.mobileNumber as string,
    };
  } catch (error) {
    return null;
  }
}

export async function getAuthSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) return null;
  
  return verifyToken(token);
}

export async function setAuthCookies(token: string, refreshToken: string) {
  const cookieStore = await cookies();
  
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });
  
  cookieStore.set('refresh-token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
  cookieStore.delete('refresh-token');
}
