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
  mobileNumber: z.string().min(10, 'Mobile number is required'),
  otp: z.string().min(6, 'OTP must be 6 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password confirmation is required'),
});

// Helper: Send WhatsApp OTP using Meta Cloud API
async function sendWhatsAppOTP(mobileNumber: string, code: string) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'auth_otp';

  if (!token || !phoneNumberId) {
    console.log(`[OTP SERVICE] Meta WhatsApp credentials not configured.`);
    return;
  }

  try {
    // Clean formatting (keep digits only, e.g. 254735319243 or 919876543210)
    const cleanPhone = mobileNumber.replace(/[^0-9]/g, '');
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    
    // Build payload dynamically based on template type
    const templatePayload: any = {
      name: templateName,
      language: { code: 'en_US' },
    };

    if (templateName !== 'hello_world') {
      templatePayload.components = [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: code,
            },
          ],
        },
        {
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [
            {
              type: 'text',
              text: code,
            },
          ],
        },
      ];
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'template',
        template: templatePayload,
      }),
    });

    const data = await response.json();
    console.log('[OTP SERVICE] Meta WhatsApp API response:', data);
  } catch (error) {
    console.error('[OTP SERVICE] Failed to send WhatsApp message:', error);
  }
}

// Helper: Generate OTP
async function generateAndSaveOTP(mobileNumber: string) {
  // Generate a random 6-digit code
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
  console.log(`[OTP SERVICE] Generated OTP for ${mobileNumber}`);
  
  // Dispatch to WhatsApp (runs asynchronously in background)
  sendWhatsAppOTP(mobileNumber, code);

  return code;
}

export async function sendOtpAction(mobileNumber: string) {
  if (!mobileNumber) {
    return { error: 'Mobile number is required' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { mobileNumber },
    });

    if (!user) {
      // User not registered. Check if they are in the census as head
      const isHead =
        (await prisma.family.findFirst({
          where: { mobile: mobileNumber },
        })) ||
        (await prisma.member.findFirst({
          where: { mobile: mobileNumber, relation: 'Head' },
        }));

      if (!isHead) {
        const isMember = await prisma.member.findFirst({
          where: { mobile: mobileNumber },
        });

        if (isMember) {
          return { error: 'BLOCKED_NON_HEAD' };
        }

        return { error: 'UNREGISTERED' };
      }
    }

    // Make sure registered users with role 'USER' are indeed heads
    if (user && user.role === 'USER') {
      const isHead =
        (await prisma.family.findFirst({
          where: { mobile: mobileNumber },
        })) ||
        (await prisma.member.findFirst({
          where: { mobile: mobileNumber, relation: 'Head' },
        }));

      if (!isHead) {
        return { error: 'BLOCKED_NON_HEAD' };
      }
    }

    // Generate and save OTP
    await generateAndSaveOTP(mobileNumber);
    return { success: true };
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return { error: 'Failed to send OTP. Try again.' };
  }
}

// Action: Password Login
export async function loginAction(prevState: any, formData: FormData) {
  const mobileNumber = formData.get('mobileNumber') as string;
  const password = formData.get('password') as string;

  if (!mobileNumber || !password) {
    return { error: 'Mobile number and password are required' };
  }

  const result = loginSchema.safeParse({ mobileNumber, password });
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { mobileNumber },
    });

    if (!user) {
      // Check census database to give detailed UX advice
      const isHead =
        (await prisma.family.findFirst({
          where: { mobile: mobileNumber },
        })) ||
        (await prisma.member.findFirst({
          where: { mobile: mobileNumber, relation: 'Head' },
        }));

      if (isHead) {
        return { error: 'NOT_ACTIVATED' };
      }

      const isMember = await prisma.member.findFirst({
        where: { mobile: mobileNumber },
      });

      if (isMember) {
        return { error: 'BLOCKED_NON_HEAD' };
      }

      return { error: 'UNREGISTERED' };
    }

    // Verify role constraint
    if (user.role === 'USER') {
      const isHead =
        (await prisma.family.findFirst({
          where: { mobile: mobileNumber },
        })) ||
        (await prisma.member.findFirst({
          where: { mobile: mobileNumber, relation: 'Head' },
        }));

      if (!isHead) {
        return { error: 'BLOCKED_NON_HEAD' };
      }
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
    let user = await prisma.user.findUnique({
      where: { mobileNumber },
    });

    if (!user) {
      const isHead =
        (await prisma.family.findFirst({
          where: { mobile: mobileNumber },
        })) ||
        (await prisma.member.findFirst({
          where: { mobile: mobileNumber, relation: 'Head' },
        }));

      if (!isHead) {
        const isMember = await prisma.member.findFirst({
          where: { mobile: mobileNumber },
        });

        if (isMember) {
          return { error: 'BLOCKED_NON_HEAD' };
        }

        return { error: 'UNREGISTERED' };
      }

      // Auto-activate: Find the pre-existing family
      const family = await prisma.family.findFirst({
        where: {
          OR: [
            { mobile: mobileNumber },
            { members: { some: { mobile: mobileNumber, relation: 'Head' } } }
          ]
        }
      });

      if (!family) {
        return { error: 'Census family records not found' };
      }

      // Verify OTP first before creating the user
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

      // Create new active User account
      user = await prisma.user.create({
        data: {
          mobileNumber,
          familyId: family.id,
          role: 'USER',
          isVerified: true,
          passwordHash: '',
        }
      });
    } else {
      // Verify role constraint for existing user
      if (user.role === 'USER') {
        const isHead =
          (await prisma.family.findFirst({
            where: { mobile: mobileNumber },
          })) ||
          (await prisma.member.findFirst({
            where: { mobile: mobileNumber, relation: 'Head' },
          }));

        if (!isHead) {
          return { error: 'BLOCKED_NON_HEAD' };
        }
      }

      // Verify OTP for existing user
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
  const mobileNumber = formData.get('mobileNumber') as string;
  const otp = formData.get('otp') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  const result = registerSchema.safeParse({
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

    // 2. Fetch the pre-existing family matching this mobile number as Head
    const family = await prisma.family.findFirst({
      where: {
        OR: [
          { mobile: mobileNumber },
          { members: { some: { mobile: mobileNumber, relation: 'Head' } } }
        ]
      },
      include: { members: true },
    });

    if (!family) {
      return { error: 'Family records not found in census records' };
    }

    // ONLY Family head is allowed to register
    const isHead =
      family.mobile === mobileNumber ||
      family.members.some(member => member.mobile === mobileNumber && member.relation === 'Head');

    if (!isHead) {
      const isMember = family.members.some(member => member.mobile === mobileNumber);
      if (isMember) {
        return { error: 'BLOCKED_NON_HEAD' };
      }
      return { error: 'Mobile number does not match this family record' };
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
        description: `New user registered. Linked to Family ID: ${family.familyId}`,
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

// Action: Check Mobile Number Status
export async function checkMobileNumberAction(mobileNumber: string) {
  if (!mobileNumber) return { error: 'Mobile number is required' };

  try {
    const user = await prisma.user.findUnique({
      where: { mobileNumber },
    });

    if (user) {
      if (user.role === 'USER') {
        const isHead =
          (await prisma.family.findFirst({
            where: { mobile: mobileNumber },
          })) ||
          (await prisma.member.findFirst({
            where: { mobile: mobileNumber, relation: 'Head' },
          }));

        if (!isHead) {
          return { status: 'BLOCKED_NON_HEAD' };
        }
      }
      return { status: 'ACTIVE' };
    }

    // User does not exist, check census database
    const isHead =
      (await prisma.family.findFirst({
        where: { mobile: mobileNumber },
      })) ||
      (await prisma.member.findFirst({
        where: { mobile: mobileNumber, relation: 'Head' },
      }));

    if (isHead) {
      return { status: 'NOT_ACTIVATED' };
    }

    const isMember = await prisma.member.findFirst({
      where: { mobile: mobileNumber },
    });

    if (isMember) {
      return { status: 'BLOCKED_NON_HEAD' };
    }

    return { status: 'UNREGISTERED' };
  } catch (error) {
    console.error('Check mobile error:', error);
    return { error: 'Failed to verify mobile number.' };
  }
}
