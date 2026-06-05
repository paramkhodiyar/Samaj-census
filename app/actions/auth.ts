'use server';

import { prisma } from '@/lib/prisma';
import { clearAuthCookies, setAuthCookies, signRefreshToken, signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { redirect } from 'next/navigation';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const result = loginSchema.safeParse({ email, password });
  if (!result.success) {
    return { error: 'Invalid email or password format' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: 'Invalid credentials' };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return { error: 'Invalid credentials' };
    }

    const payload = {
      userId: user.id,
      role: user.role,
      email: user.email,
    };

    const token = signToken(payload);
    const refreshToken = signRefreshToken(payload);

    await setAuthCookies(token, refreshToken);

    // Create audit log for login
    await prisma.auditLog.create({
      data: {
        action: 'LOGIN',
        entityType: 'USER',
        entityId: user.id,
        userId: user.id,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return { error: 'An unexpected error occurred' };
  }

  redirect('/dashboard');
}

export async function logoutAction() {
  await clearAuthCookies();
  redirect('/login');
}
