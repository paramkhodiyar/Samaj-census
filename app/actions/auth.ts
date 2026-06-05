'use server';

import { prisma } from '@/lib/prisma';
import { clearAuthCookies, setAuthCookies, signRefreshToken, signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { redirect } from 'next/navigation';

// Validators
const loginSchema = z.object({
  mobileNumber: z.string().min(10, 'Mobile number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  familyId: z.string().min(1, 'Family ID is required'),
  mobileNumber: z.string().min(10, 'Mobile number is required'),
  otp: z.string().min(6, 'OTP must be 6 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password confirmation is required'),
});

// Helper: Generate OTP
async function generateAndSaveOTP(mobileNumber: string) {
  // Generate a random 6-digit code (e.g., 123456 in dev or random)
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  // Store in database
  await prisma.verificationCode.create({
    data: {
      mobileNumber,
      code,
      expiresAt,
    },
  });

  // Log to server console
  console.log(`[OTP SERVICE] Generated OTP for ${mobileNumber}: ${code}`);
  return code;
}

// Action: Send OTP (used for both Register and Login-via-OTP)
export async function sendOtpAction(mobileNumber: string, familyId?: string) {
  if (!mobileNumber) {
    return { error: 'Mobile number is required' };
  }

  try {
    // 1. If registering (familyId is provided), verify against Census Record
    if (familyId) {
      // Find a family matching the familyId
      const family = await prisma.family.findUnique({
        where: { familyId },
        include: { members: true },
      });

      if (!family) {
        return { error: 'Family ID not found in census database' };
      }

      // Check if family mobile matches OR any member's mobile matches
      const isMobileMatch =
        family.mobile === mobileNumber ||
        family.members.some(member => member.mobile === mobileNumber);

      if (!isMobileMatch) {
        return { error: 'Mobile number does not match this Family ID records' };
      }

      // Check if user account is already created
      const existingUser = await prisma.user.findUnique({
        where: { mobileNumber },
      });

      if (existingUser && existingUser.passwordHash) {
        return { error: 'This mobile number is already registered. Please login.' };
      }
    } else {
      // 2. If logging in via OTP (familyId is not provided), verify user exists
      const user = await prisma.user.findUnique({
        where: { mobileNumber },
      });

      if (!user) {
        return { error: 'Mobile number not registered. Please register first.' };
      }
    }

    // Generate and save OTP
    const code = await generateAndSaveOTP(mobileNumber);
    return { success: true, otp: code }; // Return code to show in toast for development testing
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return { error: 'Failed to send OTP. Try again.' };
  }
}

// Action: Password Login
export async function loginAction(prevState: any, formData: FormData) {
  const mobileNumber = formData.get('mobileNumber') as string;
  const password = formData.get('password') as string;

  const result = loginSchema.safeParse({ mobileNumber, password });
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { mobileNumber },
    });

    if (!user) {
      return { error: 'Invalid mobile number or password' };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return { error: 'Invalid mobile number or password' };
    }

    const payload = {
      userId: user.id,
      role: user.role,
      mobileNumber: user.mobileNumber,
    };

    const token = await signToken(payload);
    const refreshToken = await signRefreshToken(payload);

    await setAuthCookies(token, refreshToken);

    // Create audit log for login
    await prisma.auditLog.create({
      data: {
        action: 'LOGIN',
        description: `User logged in using password. Role: ${user.role}`,
        userId: user.id,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return { error: 'An unexpected error occurred' };
  }

  redirect('/dashboard?auth=login');
}

// Action: OTP Login
export async function loginOtpAction(prevState: any, formData: FormData) {
  const mobileNumber = formData.get('mobileNumber') as string;
  const otp = formData.get('otp') as string;

  if (!mobileNumber || !otp) {
    return { error: 'Mobile number and OTP are required' };
  }

  try {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { mobileNumber },
    });

    if (!user) {
      return { error: 'Mobile number not registered' };
    }

    // Verify OTP
    const verification = await prisma.verificationCode.findFirst({
      where: {
        mobileNumber,
        code: otp,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      return { error: 'Invalid or expired OTP' };
    }

    // Clean up OTP codes
    await prisma.verificationCode.deleteMany({
      where: { mobileNumber },
    });

    const payload = {
      userId: user.id,
      role: user.role,
      mobileNumber: user.mobileNumber,
    };

    const token = await signToken(payload);
    const refreshToken = await signRefreshToken(payload);

    await setAuthCookies(token, refreshToken);

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'LOGIN',
        description: `User logged in using OTP. Role: ${user.role}`,
        userId: user.id,
      },
    });

  } catch (error) {
    console.error('OTP Login error:', error);
    return { error: 'An unexpected error occurred' };
  }

  redirect('/dashboard?auth=login');
}

// Action: Register User
export async function registerAction(prevState: any, formData: FormData) {
  const familyId = formData.get('familyId') as string;
  const mobileNumber = formData.get('mobileNumber') as string;
  const otp = formData.get('otp') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  const result = registerSchema.safeParse({
    familyId,
    mobileNumber,
    otp,
    password,
    confirmPassword,
  });

  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  try {
    // 1. Verify OTP
    const verification = await prisma.verificationCode.findFirst({
      where: {
        mobileNumber,
        code: otp,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      return { error: 'Invalid or expired OTP' };
    }

    // 2. Fetch the pre-existing family
    const family = await prisma.family.findUnique({
      where: { familyId },
    });

    if (!family) {
      return { error: 'Family ID not found in census records' };
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Create or Update User
    const user = await prisma.user.upsert({
      where: { mobileNumber },
      update: {
        passwordHash: hashedPassword,
        familyId: family.id,
        role: 'USER',
        isVerified: true,
      },
      create: {
        mobileNumber,
        passwordHash: hashedPassword,
        familyId: family.id,
        role: 'USER',
        isVerified: true,
      },
    });

    // Clean verification codes
    await prisma.verificationCode.deleteMany({
      where: { mobileNumber },
    });

    // Sign in automatically
    const payload = {
      userId: user.id,
      role: user.role,
      mobileNumber: user.mobileNumber,
    };

    const token = await signToken(payload);
    const refreshToken = await signRefreshToken(payload);

    await setAuthCookies(token, refreshToken);

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'REGISTER',
        description: `New user registered. Linked to Family ID: ${familyId}`,
        userId: user.id,
      },
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return { error: error.message || 'An error occurred during registration' };
  }

  redirect('/dashboard?auth=register');
}

// Action: Logout
export async function logoutAction() {
  await clearAuthCookies();
  redirect('/login');
}

// Action: Change Password
export async function changePasswordAction(prevState: any, formData: FormData) {
  const userId = formData.get('userId') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters' };
  }
  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_PASSWORD',
        description: 'User updated their account password.',
        userId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return { error: 'Failed to update password.' };
  }
}
