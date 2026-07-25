'use server';

import { prisma } from '@/lib/prisma';
import { clearAuthCookies, getAuthSession, setAuthCookies, signRefreshToken, signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import crypto from 'crypto';
import { headers } from 'next/headers';
import { normalizeMobile } from '@/lib/utils';

// Validators
const loginSchema = z.object({
  mobileNumber: z.string().min(10, 'Mobile number must be at least 10 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  mobileNumber: z.string().min(3, 'Mobile number or email is required'),
  otp: z.string().min(6, 'OTP must be 6 digits'),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
});

// Helper: Get Client IP Address securely from headers
async function getClientIp(): Promise<string> {
  const headersList = await headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return headersList.get('x-real-ip') || '127.0.0.1';
}

// Helper: Verify Cloudflare Turnstile Captcha
async function verifyCaptcha(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // If Turnstile secret is not set in env, bypass verification
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret,
        response: token,
        remoteip: ip
      })
    });
    const data = await response.json();
    return !!data.success;
  } catch {
    return false;
  }
}

// Helper: SHA-256 Hash for OTP codes
function hashOTP(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

// Helper: Send WhatsApp OTP (Supports Twilio & Meta Cloud API)
// Returns boolean representing whether the message was dispatched successfully
async function sendWhatsAppOTP(mobileNumber: string, code: string): Promise<boolean> {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

  let cleanPhone = mobileNumber.replace(/[^0-9]/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }

  // 1. Try Twilio if credentials are provided
  if (twilioSid && twilioAuthToken) {
    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const auth = Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64');
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          To: `whatsapp:+${cleanPhone}`,
          From: twilioFrom,
          Body: `Your Shri Kutch Gurjar Kshatriya Samaj Census Portal OTP is: ${code}\n\nValid for 10 minutes. Please do not share this code.`,
        }),
      });

      const data = await response.json();
      console.log('[OTP SERVICE] Twilio WhatsApp API response:', data);
      return response.ok;
    } catch (error) {
      console.error('[OTP SERVICE] Twilio failed:', error);
      return false;
    }
  }

  // 2. Fall back to Meta Cloud API
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_TEMPLATE_NAME || 'auth_otp';

  if (!token || !phoneNumberId) {
    console.log(`[OTP SERVICE] No Meta or Twilio WhatsApp credentials configured.`);
    return false;
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
    
    // Build payload dynamically based on template type
    const templatePayload: any = {
      name: templateName,
      language: { code: 'en_US' },
    };

    if (templateName === 'hello_world') {
      // No parameters needed
    } else if (templateName === 'jaspers_market_order_confirmation_v1') {
      templatePayload.components = [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: 'User' },
            { type: 'text', text: code }, // Sent as order number
            { type: 'text', text: '10 mins' },
          ],
        },
      ];
    } else {
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
    return response.ok;
  } catch (error) {
    console.error('[OTP SERVICE] Failed to send WhatsApp message:', error);
    return false;
  }
}

import { sendLoginOtpEmail } from '@/lib/email';

// Helper: Generate OTP
async function generateAndSaveOTP(mobileNumber: string) {
  // Generate a random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedCode = hashOTP(code);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

  // Store in database as SHA-256 hash
  await prisma.verificationCode.create({
    data: {
      mobileNumber,
      code: hashedCode,
      expiresAt,
    },
  });

  const isEmail = mobileNumber.includes('@');

  // Log to server console
  if (process.env.NODE_ENV === 'development') {
    console.log(`[OTP SERVICE] Generated OTP for ${mobileNumber}: ${code} (Development Log)`);
  } else {
    console.log(`[OTP SERVICE] Generated OTP for ${mobileNumber}`);
  }
  
  // Dispatch via Email or WhatsApp depending on input type
  let isDelivered = false;
  if (isEmail) {
    isDelivered = await sendLoginOtpEmail(mobileNumber, code);
  } else {
    isDelivered = await sendWhatsAppOTP(mobileNumber, code);
  }

  if (!isDelivered) {
    // Delete OTP record immediately to prevent stale states
    await prisma.verificationCode.deleteMany({
      where: { mobileNumber, code: hashedCode }
    });
    throw new Error('DELIVERY_FAILED');
  }

  return code;
}

export async function sendOtpAction(mobileNumber: string) {
  if (!mobileNumber) {
    return { error: 'Mobile number is required' };
  }
  mobileNumber = normalizeMobile(mobileNumber);

  try {
    const ip = await getClientIp();
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);

    // 1. IP Rate Limiting (Max 5 OTP requests per IP per 15 minutes)
    const ipLimit = await prisma.ipRateLimit.findUnique({ where: { ip } });
    if (ipLimit) {
      if (ipLimit.lastAttempt > fifteenMinsAgo) {
        if (ipLimit.attempts >= 5) {
          return { error: 'Too many requests from this IP. Please try again after 15 minutes.' };
        }
        await prisma.ipRateLimit.update({
          where: { ip },
          data: { attempts: ipLimit.attempts + 1, lastAttempt: new Date() }
        });
      } else {
        await prisma.ipRateLimit.update({
          where: { ip },
          data: { attempts: 1, lastAttempt: new Date() }
        });
      }
    } else {
      await prisma.ipRateLimit.create({
        data: { ip, attempts: 1, lastAttempt: new Date() }
      });
    }

    // 2. Account / Input Rate Limiting (Max 10 OTP sends per identifier per 15 minutes)
    const isEmailInput = mobileNumber.includes('@');
    const mobileLimit = await prisma.otpRateLimit.findUnique({ where: { mobileNumber } });
    if (mobileLimit) {
      if (mobileLimit.lastAttempt > fifteenMinsAgo) {
        if (mobileLimit.attempts >= 10) {
          return {
            error: `Too many verification requests for this ${isEmailInput ? 'email address' : 'phone number'}. Please wait a few minutes before trying again.`,
          };
        }
        await prisma.otpRateLimit.update({
          where: { mobileNumber },
          data: { attempts: mobileLimit.attempts + 1, lastAttempt: new Date() }
        });
      } else {
        await prisma.otpRateLimit.update({
          where: { mobileNumber },
          data: { attempts: 1, lastAttempt: new Date() }
        });
      }
    } else {
      await prisma.otpRateLimit.create({
        data: { mobileNumber, attempts: 1, lastAttempt: new Date() }
      });
    }

    const cleanInput = mobileNumber.trim();
    const cleanEmail = cleanInput.toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { mobileNumber: cleanInput },
        ],
      },
    });

    if (!user) {
      // User not registered. Check if they are in the census as head
      const isHead =
        (await prisma.family.findFirst({
          where: {
            OR: [
              { mobile: cleanInput },
              { members: { some: { email: cleanEmail, relation: 'Head' } } },
            ],
          },
        })) ||
        (await prisma.member.findFirst({
          where: {
            OR: [{ mobile: cleanInput }, { email: cleanEmail }],
            relation: 'Head',
          },
        }));

      if (!isHead) {
        const isMember = await prisma.member.findFirst({
          where: {
            OR: [{ mobile: cleanInput }, { email: cleanEmail }],
          },
        });

        if (isMember) {
          return { error: 'BLOCKED_NON_HEAD' };
        }

        return { error: 'UNREGISTERED' };
      }
    }

    // Make sure registered users with role 'USER' are not non-head members
    if (user && user.role === 'USER') {
      const isAccountHolder =
        (user.email && user.email.toLowerCase() === cleanEmail) ||
        user.mobileNumber === cleanInput;

      if (!isAccountHolder) {
        const isNonHead = (await prisma.member.findFirst({
          where: {
            OR: [{ email: cleanEmail }, { mobile: cleanInput }],
            NOT: { relation: 'Head' },
          },
        })) !== null;

        if (isNonHead) {
          return { error: 'BLOCKED_NON_HEAD' };
        }
      }
    }

    // Generate and save OTP
    await generateAndSaveOTP(mobileNumber);
    return { success: true };
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    if (error.message === 'DELIVERY_FAILED') {
      return { error: 'WhatsApp delivery failed. Please check that you verified the number in the Twilio / Meta Developer Sandbox or try again.' };
    }
    return { error: 'Failed to send OTP. Try again.' };
  }
}

// Action: Password Login
export async function loginAction(prevState: any, formData: FormData) {
  const rawMobile = formData.get('mobileNumber') as string;
  const mobileNumber = normalizeMobile(rawMobile || '');
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

    // Require 2FA OTP for Admins
    if (['SUPER_ADMIN', 'PRADESHIK_ADMIN', 'GHATAK_ADMIN', 'NRI_ADMIN'].includes(user.role)) {
      try {
        await generateAndSaveOTP(user.mobileNumber);
        return { require2FA: true, mobileNumber: user.mobileNumber };
      } catch (err) {
        return { error: 'Failed to send 2FA verification OTP code to WhatsApp. Please try again.' };
      }
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
  const rawMobile = formData.get('mobileNumber') as string;
  const mobileNumber = normalizeMobile(rawMobile || '');
  const otp = formData.get('otp') as string;

  if (!mobileNumber || !otp) {
    return { error: 'Mobile number and OTP are required' };
  }

  try {
    const cleanInput = mobileNumber.trim();
    const cleanEmail = cleanInput.toLowerCase();

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { mobileNumber: cleanInput },
        ],
      },
    });

    if (!user) {
      const isHead =
        (await prisma.family.findFirst({
          where: {
            OR: [
              { mobile: cleanInput },
              { members: { some: { email: cleanEmail, relation: 'Head' } } },
            ],
          },
        })) ||
        (await prisma.member.findFirst({
          where: {
            OR: [{ mobile: cleanInput }, { email: cleanEmail }],
            relation: 'Head',
          },
        }));

      if (!isHead) {
        const isMember = await prisma.member.findFirst({
          where: {
            OR: [{ mobile: cleanInput }, { email: cleanEmail }],
          },
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
      const hashedOtpInput = hashOTP(otp);
      const verification = await prisma.verificationCode.findFirst({
        where: {
          mobileNumber,
          expiresAt: { gte: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!verification) {
        return { error: 'Invalid or expired OTP' };
      }

      // Lockout logic: Check failed verification attempts
      if (verification.code !== hashedOtpInput) {
        const updatedAttempts = verification.attempts + 1;
        if (updatedAttempts >= 5) {
          await prisma.verificationCode.delete({ where: { id: verification.id } });
          return { error: 'Too many failed verification attempts. This OTP has been locked. Please request a new one.' };
        }
        await prisma.verificationCode.update({
          where: { id: verification.id },
          data: { attempts: updatedAttempts }
        });
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
        const isAccountHolder =
          (user.email && user.email.toLowerCase() === cleanEmail) ||
          user.mobileNumber === cleanInput;

        if (!isAccountHolder) {
          const isNonHead = (await prisma.member.findFirst({
            where: {
              OR: [{ email: cleanEmail }, { mobile: cleanInput }],
              NOT: { relation: 'Head' },
            },
          })) !== null;

          if (isNonHead) {
            return { error: 'BLOCKED_NON_HEAD' };
          }
        }
      }

      // Verify OTP for existing user
      const hashedOtpInput = hashOTP(otp);
      const verification = await prisma.verificationCode.findFirst({
        where: {
          mobileNumber,
          expiresAt: { gte: new Date() },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!verification) {
        return { error: 'Invalid or expired OTP' };
      }

      // Lockout check
      if (verification.code !== hashedOtpInput) {
        const updatedAttempts = verification.attempts + 1;
        if (updatedAttempts >= 5) {
          await prisma.verificationCode.delete({ where: { id: verification.id } });
          return { error: 'Too many failed verification attempts. This OTP has been locked. Please request a new one.' };
        }
        await prisma.verificationCode.update({
          where: { id: verification.id },
          data: { attempts: updatedAttempts }
        });
        return { error: 'Invalid or expired OTP' };
      }
    }

    // Clean up OTP codes on successful verification
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
  const rawMobile = formData.get('mobileNumber') as string;
  const mobileNumber = normalizeMobile(rawMobile || '');
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

  if (password || confirmPassword) {
    if (password !== confirmPassword) {
      return { error: 'Passwords do not match' };
    }
  }

  try {
    // 1. Verify OTP
    const hashedOtpInput = hashOTP(otp);
    const verification = await prisma.verificationCode.findFirst({
      where: {
        mobileNumber,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      return { error: 'Invalid or expired OTP' };
    }

    // Lockout logic
    if (verification.code !== hashedOtpInput) {
      const updatedAttempts = verification.attempts + 1;
      if (updatedAttempts >= 5) {
        await prisma.verificationCode.delete({ where: { id: verification.id } });
        return { error: 'Too many failed verification attempts. This OTP has been locked.' };
      }
      await prisma.verificationCode.update({
        where: { id: verification.id },
        data: { attempts: updatedAttempts }
      });
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

    const consent = formData.get('consent') === 'on' || formData.get('consent') === 'true';
    if (!consent) {
      return { error: 'You must provide consent under DPDP Act 2023 to proceed.' };
    }

    // Hash Password if provided
    const hashedPassword = password ? await bcrypt.hash(password, 10) : '';

    // 3. Create or Update User
    const user = await prisma.user.upsert({
      where: { mobileNumber },
      update: {
        passwordHash: hashedPassword,
        familyId: family.id,
        role: 'USER',
        isVerified: true,
        consentGivenAt: new Date(),
      },
      create: {
        mobileNumber,
        passwordHash: hashedPassword,
        familyId: family.id,
        role: 'USER',
        isVerified: true,
        consentGivenAt: new Date(),
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
  const session = await getAuthSession();
  if (!session) {
    return { error: 'UNAUTHENTICATED' };
  }
  const userId = session.userId;

  const currentPassword = formData.get('currentPassword') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!currentPassword) {
    return { error: 'Current password is required' };
  }
  if (!password || password.length < 6) {
    return { error: 'New password must be at least 6 characters' };
  }
  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      return { error: 'User not found' };
    }

    // Verify current password hash
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return { error: 'Incorrect current password' };
    }

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

    // Invalidate active session cookies on password update
    await clearAuthCookies();

    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return { error: 'Failed to update password.' };
  }
}

// Action: Check Mobile Number Status with Rate-limiting & Captcha validation
export async function checkMobileNumberAction(mobileNumber: string, captchaToken?: string) {
  if (!mobileNumber) return { error: 'Mobile number is required' };
  mobileNumber = normalizeMobile(mobileNumber);

  try {
    const ip = await getClientIp();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Rate Limit Check (5 checks per IP per hour)
    // To implement checking count without bloating tables, we check the AuditLog count
    const checkCount = await prisma.auditLog.count({
      where: {
        ipAddress: ip,
        action: 'CHECK_MOBILE_NUMBER',
        createdAt: { gte: oneHourAgo }
      }
    });

    // If more than 2 attempts, require CAPTCHA verification
    if (checkCount >= 2) {
      if (!captchaToken) {
        return { error: 'CAPTCHA_REQUIRED' };
      }
      const isCaptchaValid = await verifyCaptcha(captchaToken, ip);
      if (!isCaptchaValid) {
        return { error: 'CAPTCHA_INVALID' };
      }
    }

    // Log the check action to keep audit of IP checks
    await prisma.auditLog.create({
      data: {
        action: 'CHECK_MOBILE_NUMBER',
        description: `Checked status of mobile number: ${mobileNumber}`,
        ipAddress: ip,
      }
    });

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

// Action: Export NRI Families to CSV
export async function exportNriFamiliesAction() {
  const session = await getAuthSession();
  if (!session) {
    throw new Error('Unauthorized');
  }

  // Load User and role
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  if (!user || user.role !== 'NRI_ADMIN') {
    throw new Error('Unauthorized');
  }

  // Fetch only NRI families (familyId starts with 'KG-NRI-')
  const families = await prisma.family.findMany({
    where: { familyId: { startsWith: 'KG-NRI-' } },
    include: { members: true },
  });

  // Find the maximum number of other relatives in any single family
  let maxRelatives = 0;
  for (const family of families) {
    const relativeCount = family.members.filter(m => 
      m.relation !== 'Head' && 
      !['Wife', 'Husband', 'Spouse'].includes(m.relation)
    ).length;
    if (relativeCount > maxRelatives) {
      maxRelatives = relativeCount;
    }
  }

  // Define static headers
  const headers = [
    'Family ID', 'Country', 'City', 'Kutch Village',
    'Head Name', 'Head Relation', 'Head Mobile', 'Head Profession',
    'Spouse Name', 'Spouse Relation', 'Spouse Mobile', 'Spouse Profession'
  ];

  // Append dynamic relative columns
  for (let i = 1; i <= maxRelatives; i++) {
    headers.push(
      `Relative ${i} Name`,
      `Relative ${i} Relation`,
      `Relative ${i} Mobile`,
      `Relative ${i} Profession`
    );
  }

  const csvRows = [headers.join(',')];

  for (const family of families) {
    const head = family.members.find(m => m.relation === 'Head');
    const spouse = family.members.find(m => 
      ['Wife', 'Husband', 'Spouse'].includes(m.relation)
    );
    const relatives = family.members
      .filter(m => m !== head && m !== spouse)
      .sort((a, b) => b.age - a.age);

    const row = [
      `"${family.familyId}"`,
      `"${family.country || 'N/A'}"`,
      `"${family.city || 'N/A'}"`,
      `"${family.kutchVillage || 'N/A'}"`,
      `"${head?.name || family.headName}"`,
      `"${head?.relation || 'Head'}"`,
      `"${head?.mobile || family.mobile}"`,
      `"${head?.occupation || 'N/A'}"`,
      `"${spouse?.name || ''}"`,
      `"${spouse?.relation || ''}"`,
      `"${spouse?.mobile || ''}"`,
      `"${spouse?.occupation || ''}"`
    ];

    for (let i = 0; i < maxRelatives; i++) {
      const rel = relatives[i];
      row.push(
        `"${rel?.name || ''}"`,
        `"${rel?.relation || ''}"`,
        `"${rel?.mobile || ''}"`,
        `"${rel?.occupation || ''}"`
      );
    }

    csvRows.push(row.join(','));
  }

  // Create audit log for export action
  await prisma.auditLog.create({
    data: {
      action: 'EXPORT_NRI_CSV',
      description: `Exported NRI families CSV census data. Total rows: ${families.length}`,
      userId: session.userId,
    },
  });

  return csvRows.join('\n');
}

// Action: Forgot Password - Send OTP
export async function forgotPasswordSendOtpAction(mobileNumber: string) {
  if (!mobileNumber) {
    return { error: 'Mobile number is required' };
  }
  mobileNumber = normalizeMobile(mobileNumber);

  try {
    const user = await prisma.user.findUnique({
      where: { mobileNumber },
    });

    if (!user) {
      return { error: 'This mobile number is not registered.' };
    }

    // Generate and save OTP
    await generateAndSaveOTP(mobileNumber);
    return { success: true };
  } catch (error: any) {
    console.error('Forgot password OTP send error:', error);
    if (error.message === 'DELIVERY_FAILED') {
      return { error: 'WhatsApp delivery failed. Please check that you verified the number in the sandbox or try again.' };
    }
    return { error: 'Failed to send OTP.' };
  }
}

// Action: Forgot Password - Reset Password
export async function forgotPasswordResetAction(prevState: any, formData: FormData) {
  const rawMobile = formData.get('mobileNumber') as string;
  const mobileNumber = normalizeMobile(rawMobile || '');
  const otp = formData.get('otp') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!mobileNumber || !otp || !password || !confirmPassword) {
    return { error: 'All fields are required' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { mobileNumber },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    // Verify OTP
    const hashedOtpInput = hashOTP(otp);
    const verification = await prisma.verificationCode.findFirst({
      where: {
        mobileNumber,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      return { error: 'Invalid or expired OTP' };
    }

    // Lockout logic
    if (verification.code !== hashedOtpInput) {
      const updatedAttempts = verification.attempts + 1;
      if (updatedAttempts >= 5) {
        await prisma.verificationCode.delete({ where: { id: verification.id } });
        return { error: 'Too many failed verification attempts. This OTP has been locked.' };
      }
      await prisma.verificationCode.update({
        where: { id: verification.id },
        data: { attempts: updatedAttempts }
      });
      return { error: 'Invalid or expired OTP' };
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { mobileNumber },
      data: { passwordHash: hashedPassword },
    });

    // Clean up OTP codes on success
    await prisma.verificationCode.deleteMany({
      where: { mobileNumber },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'FORGOT_PASSWORD_RESET',
        description: 'User successfully reset their forgotten password via mobile OTP.',
        userId: user.id,
      },
    });

    // Invalidate active session cookies on password reset
    await clearAuthCookies();

    return { success: true };
  } catch (error) {
    console.error('Password reset error:', error);
    return { error: 'Failed to reset password.' };
  }
}
