import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

let JWT_SECRET: Uint8Array | null = null;
let JWT_REFRESH_SECRET: Uint8Array | null = null;

function getJwtSecret() {
  if (!JWT_SECRET) {
    const secret = process.env.JWT_SECRET;
    if (process.env.NODE_ENV === 'production' && !secret) {
      throw new Error('FATAL: JWT_SECRET environment variable is missing in production!');
    }
    JWT_SECRET = new TextEncoder().encode(secret || 'fallback-secret-for-dev-only-32-chars-long');
  }
  return JWT_SECRET;
}

function getJwtRefreshSecret() {
  if (!JWT_REFRESH_SECRET) {
    const secret = process.env.JWT_REFRESH_SECRET;
    if (process.env.NODE_ENV === 'production' && !secret) {
      throw new Error('FATAL: JWT_REFRESH_SECRET environment variable is missing in production!');
    }
    JWT_REFRESH_SECRET = new TextEncoder().encode(secret || 'fallback-refresh-secret-for-dev-only-32-chars');
  }
  return JWT_REFRESH_SECRET;
}

export interface TokenPayload {
  userId: string;
  role: string;
  mobileNumber: string;
}

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ 
    userId: payload.userId,
    role: payload.role,
    mobileNumber: payload.mobileNumber
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(getJwtSecret());
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
    .sign(getJwtRefreshSecret());
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return {
      userId: payload.userId as string,
      role: payload.role as string,
      mobileNumber: payload.mobileNumber as string,
    };
  } catch (error) {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtRefreshSecret());
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
